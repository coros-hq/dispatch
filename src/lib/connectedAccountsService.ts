import { supabase } from "./supabase";

export type ConnectedAccount = {
  id: string;
  provider: "gmail" | "outlook";
  email: string;
  created_at: string;
};

export async function fetchConnectedAccounts(): Promise<ConnectedAccount[]> {
  const { data, error } = await supabase
    .from("connected_accounts")
    .select("id, provider, email, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ConnectedAccount[];
}

export async function disconnectAccount(accountId: string): Promise<void> {
  const { error } = await supabase
    .from("connected_accounts")
    .delete()
    .eq("id", accountId);

  if (error) throw new Error(error.message);
}

export function getOAuthConnectUrl(
  provider: "gmail" | "outlook",
  userId: string,
): string {
  return `/api/auth/${provider}?userId=${encodeURIComponent(userId)}`;
}
