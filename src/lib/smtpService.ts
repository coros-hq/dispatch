import { supabase } from "./supabase";

export interface SmtpConfig {
  id: string;
  user_id: string;
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  from_name: string | null;
  from_email: string;
  verified: boolean;
  created_at: string;
  // password_encrypted is never returned to the client
}

export interface SmtpConfigInput {
  label: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string; // plain text — encoded before storing
  from_name?: string;
  from_email: string;
}

export interface TestConnectionInput {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_email: string;
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function getUserSmtpConfigs(
  userId: string,
): Promise<SmtpConfig[]> {
  const { data, error } = await supabase
    .from("smtp_configs")
    .select(
      "id, user_id, label, host, port, secure, username, from_name, from_email, verified, created_at",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveSmtpConfig(
  userId: string,
  input: SmtpConfigInput,
  verified = false,
): Promise<SmtpConfig> {
  // Encode password as base64 — never store plain text
  const password_encrypted = btoa(input.password);

  const { data, error } = await supabase
    .from("smtp_configs")
    .insert({
      user_id: userId,
      label: input.label,
      host: input.host,
      port: input.port,
      secure: input.secure,
      username: input.username,
      password_encrypted,
      from_name: input.from_name || null,
      from_email: input.from_email,
      verified,
    })
    .select(
      "id, user_id, label, host, port, secure, username, from_name, from_email, verified, created_at",
    )
    .single();

  if (error) throw error;
  return data;
}

export async function updateSmtpConfig(
  id: string,
  input: Partial<SmtpConfigInput> & { verified?: boolean },
): Promise<void> {
  const updates: Record<string, any> = { ...input };

  if (input.password) {
    updates.password_encrypted = btoa(input.password);
    delete updates.password;
  }

  const { error } = await supabase
    .from("smtp_configs")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

export async function markSmtpVerified(id: string): Promise<void> {
  const { error } = await supabase
    .from("smtp_configs")
    .update({ verified: true })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteSmtpConfig(id: string): Promise<void> {
  const { error } = await supabase.from("smtp_configs").delete().eq("id", id);

  if (error) throw error;
}

// ─── Test connection ──────────────────────────────────────────────────────────

export async function testSmtpConnection(
  input: TestConnectionInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/smtp-verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    const json = await res.json();
    return json;
  } catch {
    return {
      success: false,
      error: "Could not reach the server. Check your internet connection.",
    };
  }
}
