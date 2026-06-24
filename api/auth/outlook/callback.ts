import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  decodeOAuthState,
  getAppUrl,
  getEncryptionKey,
  getSupabaseAdmin,
} from "../../lib/supabase-admin.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const code = req.query.code as string | undefined;
  const stateRaw = req.query.state as string | undefined;
  const oauthError = req.query.error as string | undefined;

  if (oauthError) {
    return res.redirect(
      302,
      `/dashboard?error=${encodeURIComponent(oauthError)}`,
    );
  }

  if (!code || !stateRaw) {
    return res.status(400).json({ error: "Missing code or state" });
  }

  const state = decodeOAuthState(stateRaw);
  if (!state) {
    return res.status(400).json({ error: "Invalid state" });
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/outlook/callback`;

  const tokenRes = await fetch(
    "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: "https://graph.microsoft.com/mail.send offline_access",
      }),
    },
  );

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error_description?: string;
  };

  if (!tokenRes.ok || !tokenData.access_token) {
    return res.redirect(
      302,
      `/dashboard?error=${encodeURIComponent(tokenData.error_description ?? "token_exchange_failed")}`,
    );
  }

  const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const profileData = (await profileRes.json()) as {
    mail?: string;
    userPrincipalName?: string;
  };

  const email = profileData.mail ?? profileData.userPrincipalName;
  if (!profileRes.ok || !email) {
    return res.redirect(302, "/dashboard?error=profile_fetch_failed");
  }

  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
    : null;

  const admin = getSupabaseAdmin();
  await admin.rpc("upsert_connected_account", {
    p_user_id: state.userId,
    p_provider: "outlook",
    p_email: email,
    p_access_token: tokenData.access_token,
    p_refresh_token: tokenData.refresh_token ?? null,
    p_token_expires_at: expiresAt,
    p_encryption_key: getEncryptionKey(),
  });

  return res.redirect(302, `${state.returnTo}?connected=outlook`);
}
