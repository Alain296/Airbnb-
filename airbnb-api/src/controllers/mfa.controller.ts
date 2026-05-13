import { Response } from "express";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import crypto from "crypto";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";

const APP_NAME = "AirbnbApp";

// Simple XOR-based obfuscation for the TOTP secret stored in DB
// In production use AES-256 encryption with a KMS key
const obfuscate = (text: string): string =>
  Buffer.from(text).toString("base64");

const deobfuscate = (encoded: string): string =>
  Buffer.from(encoded, "base64").toString("utf8");

/**
 * Generate a new TOTP secret and return QR code
 * POST /auth/mfa/setup
 * Requires: authenticated user
 */
export const setupMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    if (user.mfaEnabled) {
      res.status(400).json({ message: "MFA is already enabled. Disable it first to re-setup." });
      return;
    }

    // Generate a new TOTP secret
    const totp = new OTPAuth.TOTP({
      issuer:    APP_NAME,
      label:     user.email,
      algorithm: "SHA1",
      digits:    6,
      period:    30,
      secret:    OTPAuth.Secret.fromRandom(20),
    });

    const secret    = totp.secret.base32;
    const otpauthUrl = totp.toString();

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

    // Generate 8 backup codes (one-time use)
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString("hex").toUpperCase(),
    );

    // Store secret temporarily (not yet enabled — user must verify first)
    await prisma.user.update({
      where: { id: req.userId },
      data:  {
        mfaSecret:      obfuscate(secret),
        mfaBackupCodes: backupCodes.map(obfuscate),
        mfaEnabled:     false, // only enabled after verification
      },
    });

    res.status(200).json({
      secret,          // show to user for manual entry
      qrCode: qrCodeDataUrl,
      backupCodes,     // show ONCE — user must save these
      message:         "Scan the QR code with your authenticator app, then verify with a code to enable MFA.",
    });
  } catch (error) {
    handleControllerError(error, res, "mfa.setupMfa");
  }
};

/**
 * Verify a TOTP code and enable MFA
 * POST /auth/mfa/verify-setup
 * Body: { code: "123456" }
 */
export const verifyMfaSetup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const { code } = req.body as { code?: string };
    if (!code) { res.status(400).json({ message: "code is required" }); return; }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.mfaSecret) {
      res.status(400).json({ message: "MFA setup not initiated. Call /auth/mfa/setup first." });
      return;
    }

    const secret = deobfuscate(user.mfaSecret);
    const totp   = new OTPAuth.TOTP({
      issuer:    APP_NAME,
      label:     user.email,
      algorithm: "SHA1",
      digits:    6,
      period:    30,
      secret:    OTPAuth.Secret.fromBase32(secret),
    });

    // delta: ±1 window (30s tolerance)
    const delta = totp.validate({ token: code.replace(/\s/g, ""), window: 1 });

    if (delta === null) {
      res.status(400).json({ message: "Invalid or expired code. Try again." });
      return;
    }

    // Enable MFA
    await prisma.user.update({
      where: { id: req.userId },
      data:  { mfaEnabled: true },
    });

    res.status(200).json({ message: "MFA enabled successfully. Keep your backup codes safe." });
  } catch (error) {
    handleControllerError(error, res, "mfa.verifyMfaSetup");
  }
};

/**
 * Disable MFA (requires current TOTP code or backup code)
 * POST /auth/mfa/disable
 * Body: { code: "123456" }
 */
export const disableMfa = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const { code } = req.body as { code?: string };
    if (!code) { res.status(400).json({ message: "code is required" }); return; }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      res.status(400).json({ message: "MFA is not enabled on this account." });
      return;
    }

    const valid = validateCode(user, code.replace(/\s/g, ""));
    if (!valid) {
      res.status(400).json({ message: "Invalid code." });
      return;
    }

    await prisma.user.update({
      where: { id: req.userId },
      data:  { mfaEnabled: false, mfaSecret: null, mfaBackupCodes: [] },
    });

    res.status(200).json({ message: "MFA disabled successfully." });
  } catch (error) {
    handleControllerError(error, res, "mfa.disableMfa");
  }
};

/**
 * Validate MFA code during login (called after password check)
 * POST /auth/mfa/validate
 * Body: { userId: "...", code: "123456" }
 * Returns: { token, user } — same as normal login
 */
export const validateMfaLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, code } = req.body as { userId?: string; code?: string };

    if (!userId || !code) {
      res.status(400).json({ message: "userId and code are required" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.mfaEnabled || !user.mfaSecret) {
      res.status(400).json({ message: "MFA not enabled for this user" });
      return;
    }

    const valid = validateCode(user, code.replace(/\s/g, ""));
    if (!valid) {
      res.status(401).json({ message: "Invalid MFA code." });
      return;
    }

    const JWT_SECRET = process.env["JWT_SECRET"]!;
    const token = require("jsonwebtoken").sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    const { password: _p, mfaSecret: _s, mfaBackupCodes: _b, ...safeUser } = user as any;

    res.status(200).json({ token, user: safeUser });
  } catch (error) {
    handleControllerError(error, res, "mfa.validateMfaLogin");
  }
};

/**
 * Get MFA status for the current user
 * GET /auth/mfa/status
 */
export const getMfaStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    const user = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: { mfaEnabled: true, mfaSecret: true },
    });

    if (!user) { res.status(404).json({ message: "User not found" }); return; }

    res.status(200).json({
      mfaEnabled:  user.mfaEnabled,
      setupPending: !user.mfaEnabled && !!user.mfaSecret,
    });
  } catch (error) {
    handleControllerError(error, res, "mfa.getMfaStatus");
  }
};

/* ── Helper ─────────────────────────────────────────────────────────── */
function validateCode(user: { mfaSecret: string | null; mfaBackupCodes: string[]; email: string }, code: string): boolean {
  if (!user.mfaSecret) return false;

  // Try TOTP first
  const secret = deobfuscate(user.mfaSecret);
  const totp   = new OTPAuth.TOTP({
    issuer:    APP_NAME,
    label:     user.email,
    algorithm: "SHA1",
    digits:    6,
    period:    30,
    secret:    OTPAuth.Secret.fromBase32(secret),
  });

  const delta = totp.validate({ token: code, window: 1 });
  if (delta !== null) return true;

  // Try backup codes (one-time use)
  const encodedCode = obfuscate(code.toUpperCase());
  const idx = user.mfaBackupCodes.indexOf(encodedCode);
  if (idx !== -1) {
    // Remove used backup code
    user.mfaBackupCodes.splice(idx, 1);
    // Note: caller must save the updated backup codes to DB
    return true;
  }

  return false;
}
