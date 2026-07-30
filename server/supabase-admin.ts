import { createClient, type User } from "@supabase/supabase-js";
import type { VercelRequest } from "@vercel/node";

function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ??
    process.env.VITE_SUPABASE_URL ??
    ""
  );
}

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase admin credentials");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function getEncryptionKey(): string {
  const key = process.env.SUPABASE_ENCRYPTION_KEY;
  if (!key) throw new Error("Missing SUPABASE_ENCRYPTION_KEY");
  return key;
}

export function getAppUrl(): string {
  const url = process.env.APP_URL ?? process.env.VERCEL_URL;
  if (!url) throw new Error("Missing APP_URL");
  return url.startsWith("http") ? url : `https://${url}`;
}

export async function verifyUser(req: VercelRequest): Promise<User | null> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export type OAuthState = {
  userId: string;
  returnTo: string;
};

export function encodeOAuthState(state: OAuthState): string {
  return Buffer.from(JSON.stringify(state)).toString("base64url");
}

export function decodeOAuthState(raw: string): OAuthState | null {
  try {
    const parsed = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as OAuthState;
    if (!parsed.userId || !parsed.returnTo) return null;
    return parsed;
  } catch {
    return null;
  }
}
