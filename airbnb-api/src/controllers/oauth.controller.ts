import { Request, Response } from "express";
import axios from "axios";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";

const JWT_SECRET    = process.env["JWT_SECRET"]!;
const CLIENT_ID     = process.env["GOOGLE_CLIENT_ID"];
const CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"];
const APPLE_CLIENT_ID = process.env["APPLE_CLIENT_ID"];
const APPLE_TEAM_ID = process.env["APPLE_TEAM_ID"];
const APPLE_KEY_ID = process.env["APPLE_KEY_ID"];
const APPLE_PRIVATE_KEY = process.env["APPLE_PRIVATE_KEY"];
const normalizeOrigin = (url: string) =>
  url
    .trim()
    .replace(/\/+$/, "")
    .replace(/(?:\/api\/v1)+$/i, "");

const FRONTEND_URL  = (process.env["FRONTEND_URL"] || process.env["BASE_URL"] || "http://localhost:5173").replace(/\/+$/, "");
const API_ORIGIN    = normalizeOrigin(process.env["API_URL"] || "http://localhost:3000");

const REDIRECT_URI  = `${API_ORIGIN}/api/v1/auth/google/callback`;
const APPLE_REDIRECT_URI = `${API_ORIGIN}/api/v1/auth/apple/callback`;

type OAuthProvider = "google" | "apple";
type AppleJwk = JsonWebKey & { kid?: string };

const makeToken = (user: { id: string; role: string }) =>
  jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

const redirectWithSession = (res: Response, user: { id: string; role: string; name: string; email: string }, provider: OAuthProvider) => {
  const token = makeToken(user);
  const params = new URLSearchParams({
    token,
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    provider,
  });
  res.redirect(`${FRONTEND_URL}/auth/callback?${params.toString()}`);
};

const uniqueUsername = async (email: string) => {
  const fallback = `guest_${crypto.randomBytes(4).toString("hex")}`;
  const baseUsername = (email.split("@")[0] || fallback).replace(/[^a-z0-9_]/gi, "").toLowerCase() || fallback;
  let username = baseUsername;
  let suffix = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${suffix++}`;
  }
  return username;
};

/**
 * Step 1 — Redirect user to Google's OAuth consent screen
 * GET /auth/google
 */
export const googleAuth = (_req: Request, res: Response): void => {
  if (!CLIENT_ID) {
    res.status(503).json({ message: "Google OAuth is not configured. Add GOOGLE_CLIENT_ID to .env" });
    return;
  }

  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "code",
    scope:         "openid email profile",
    access_type:   "offline",
    prompt:        "select_account",
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

/**
 * Step 2 — Google redirects back with ?code=...
 * GET /auth/google/callback
 */
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = req.query.code as string | undefined;

    if (!code) {
      res.redirect(`${FRONTEND_URL}/login?error=google_cancelled`);
      return;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
      res.redirect(`${FRONTEND_URL}/login?error=oauth_not_configured`);
      return;
    }

    // Exchange code for tokens
    const tokenRes = await axios.post<{
      access_token: string;
      id_token: string;
    }>(
      "https://oauth2.googleapis.com/token",
      new URLSearchParams({
        code,
        client_id:     CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri:  REDIRECT_URI,
        grant_type:    "authorization_code",
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
    );

    const { access_token } = tokenRes.data;

    // Fetch user profile from Google
    const profileRes = await axios.get<{
      id:             string;
      email:          string;
      name:           string;
      picture:        string;
      verified_email: boolean;
    }>("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { id: googleId, email, name, picture } = profileRes.data;

    // Find or create user
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Link Google ID if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data:  { googleId, provider: "google", avatar: user.avatar || picture },
        });
      }
    } else {
      // Create new user from Google profile
      const baseUsername = email.split("@")[0]!.replace(/[^a-z0-9_]/gi, "").toLowerCase();
      const username = await uniqueUsername(email);

      user = await prisma.user.create({
        data: {
          name,
          email,
          username,
          phone:    "0000000000", // placeholder — user can update later
          password: "",           // no password for OAuth users
          role:     "GUEST",
          avatar:   picture,
          googleId,
          provider: "google",
        },
      });
    }

    // Check if user is suspended
    if (user.isSuspended) {
      res.redirect(`${FRONTEND_URL}/login?error=account_suspended`);
      return;
    }

    // Issue JWT — same format as email/password login
    redirectWithSession(res, user, "google");
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
};

const appleConfigured = () =>
  Boolean(APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY);

const applePrivateKey = () =>
  String(APPLE_PRIVATE_KEY).replace(/\\n/g, "\n");

const createAppleClientSecret = () => {
  if (!appleConfigured()) throw new Error("Apple OAuth is not configured");

  return jwt.sign(
    {},
    applePrivateKey(),
    {
      algorithm: "ES256",
      expiresIn: "10m",
      audience: "https://appleid.apple.com",
      issuer: APPLE_TEAM_ID,
      subject: APPLE_CLIENT_ID,
      keyid: APPLE_KEY_ID,
    },
  );
};

const getAppleSigningKey = async (kid: string) => {
  const { data } = await axios.get<{ keys: AppleJwk[] }>("https://appleid.apple.com/auth/keys");
  const jwk = data.keys.find((key) => key.kid === kid);
  if (!jwk) throw new Error("Apple signing key not found");
  return crypto.createPublicKey({ key: jwk, format: "jwk" }).export({ type: "spki", format: "pem" });
};

const verifyAppleIdToken = async (idToken: string) => {
  const decoded = jwt.decode(idToken, { complete: true });
  if (!decoded || typeof decoded === "string" || !decoded.header.kid) {
    throw new Error("Invalid Apple identity token");
  }

  const publicKey = await getAppleSigningKey(decoded.header.kid);
  return jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    audience: APPLE_CLIENT_ID,
    issuer: "https://appleid.apple.com",
  }) as jwt.JwtPayload;
};

/**
 * Step 1 - Redirect user to Apple's OAuth consent screen
 * GET /auth/apple
 */
export const appleAuth = (_req: Request, res: Response): void => {
  if (!appleConfigured()) {
    res.status(503).json({
      message: "Apple OAuth is not configured. Add APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, and APPLE_PRIVATE_KEY to .env",
    });
    return;
  }

  const params = new URLSearchParams({
    client_id: APPLE_CLIENT_ID!,
    redirect_uri: APPLE_REDIRECT_URI,
    response_type: "code id_token",
    response_mode: "form_post",
    scope: "name email",
    state: crypto.randomBytes(16).toString("hex"),
  });

  res.redirect(`https://appleid.apple.com/auth/authorize?${params.toString()}`);
};

/**
 * Step 2 - Apple posts back with code and id_token
 * POST /auth/apple/callback
 */
export const appleCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const code = String(req.body.code ?? "");
    const idTokenFromBody = String(req.body.id_token ?? "");
    const appleUser = req.body.user ? JSON.parse(String(req.body.user)) : undefined;

    if (!code && !idTokenFromBody) {
      res.redirect(`${FRONTEND_URL}/login?error=apple_cancelled`);
      return;
    }

    if (!appleConfigured()) {
      res.redirect(`${FRONTEND_URL}/login?error=apple_not_configured`);
      return;
    }

    const tokenRes = code
      ? await axios.post<{
          id_token: string;
          access_token?: string;
        }>(
          "https://appleid.apple.com/auth/token",
          new URLSearchParams({
            client_id: APPLE_CLIENT_ID!,
            client_secret: createAppleClientSecret(),
            code,
            grant_type: "authorization_code",
            redirect_uri: APPLE_REDIRECT_URI,
          }).toString(),
          { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
        )
      : null;

    const idToken = tokenRes?.data.id_token || idTokenFromBody;
    const claims = await verifyAppleIdToken(idToken);
    const appleId = String(claims.sub ?? "");
    const email = String(claims.email ?? appleUser?.email ?? "");
    const firstName = appleUser?.name?.firstName ?? "";
    const lastName = appleUser?.name?.lastName ?? "";
    const name = `${firstName} ${lastName}`.trim() || email.split("@")[0] || "Apple Guest";

    if (!appleId || !email) {
      res.redirect(`${FRONTEND_URL}/login?error=apple_missing_email`);
      return;
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ appleId }, { email }] },
    });

    if (user) {
      if (!user.appleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { appleId, provider: "apple" },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email,
          username: await uniqueUsername(email),
          phone: "0000000000",
          password: "",
          role: "GUEST",
          appleId,
          provider: "apple",
        },
      });
    }

    if (user.isSuspended) {
      res.redirect(`${FRONTEND_URL}/login?error=account_suspended`);
      return;
    }

    redirectWithSession(res, user, "apple");
  } catch (error) {
    console.error("Apple OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=apple_failed`);
  }
};
