import type { VercelRequest, VercelResponse } from "@vercel/node";
import { encodeOAuthState, getAppUrl } from "../lib/supabase-admin.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = req.query.userId as string | undefined;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "Google OAuth not configured" });
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/gmail/callback`;
  const state = encodeOAuthState({ userId, returnTo: "/dashboard" });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/gmail.send",
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return res.redirect(
    302,
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
  );
}
