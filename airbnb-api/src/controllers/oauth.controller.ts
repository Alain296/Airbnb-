import { Request, Response } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { handleControllerError } from "../utils/error-handler";

const JWT_SECRET    = process.env["JWT_SECRET"]!;
const CLIENT_ID     = process.env["GOOGLE_CLIENT_ID"];
const CLIENT_SECRET = process.env["GOOGLE_CLIENT_SECRET"];
const FRONTEND_URL  = process.env["FRONTEND_URL"] || "http://localhost:5173";
const API_URL       = process.env["API_URL"]      || "http://localhost:3000";

const REDIRECT_URI  = `${API_URL}/api/v1/auth/google/callback`;

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
      let username = baseUsername;
      let suffix   = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${suffix++}`;
      }

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
    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    // Redirect to frontend with token in query param
    // Frontend reads it, stores in localStorage, then redirects to /dashboard
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&userId=${user.id}&role=${user.role}&name=${encodeURIComponent(user.name)}&email=${encodeURIComponent(user.email)}`);
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
  }
};
