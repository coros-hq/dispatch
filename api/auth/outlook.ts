import type { VercelRequest, VercelResponse } from "@vercel/node";
import { encodeOAuthState, getAppUrl } from "../lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const userId = req.query.userId as string | undefined;
  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "Microsoft OAuth not configured" });
  }

  const appUrl = getAppUrl();
  const redirectUri = `${appUrl}/api/auth/outlook/callback`;
  const state = encodeOAuthState({ userId, returnTo: "/dashboard" });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://graph.microsoft.com/mail.send offline_access",
    state,
  });

  return res.redirect(
    302,
    `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`,
  );
}
