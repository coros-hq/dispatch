import { supabase } from "./supabase";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  notify_product_updates: boolean;
  notify_newsletter_tips: boolean;
  notify_community_activity: boolean;
};

export async function fetchProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Profile doesn't exist yet — create it
    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        first_name: user.user_metadata?.first_name ?? "",
        last_name: user.user_metadata?.last_name ?? "",
        notify_product_updates: true,
        notify_newsletter_tips: true,
        notify_community_activity: false,
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newProfile as Profile;
  }

  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(
  changes: Partial<Omit<Profile, "id">>,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("profiles")
    .update({ ...changes, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) throw error;

  // Sync name changes to auth metadata
  if (changes.first_name || changes.last_name) {
    await supabase.auth.updateUser({
      data: {
        first_name: changes.first_name,
        last_name: changes.last_name,
      },
    });
  }
}

export async function changePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    data: { deleted: true },
  });
  if (error) throw error;
  await supabase.auth.signOut();
}
