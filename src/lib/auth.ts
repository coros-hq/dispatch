import { PASSWORD_RECOVERY_PENDING_KEY, useAuthStore } from "@/store/auth";
import { usePlanStore } from "@/store/plan";
import { supabase } from "./supabase";

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  sessionStorage.removeItem(PASSWORD_RECOVERY_PENDING_KEY);
  return data;
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}`,
      data: { first_name: firstName, last_name: lastName },
    },
  });
  if (error) throw error;
  return data;
}

export async function forgotPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function resetPassword(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export async function signOut() {
  useAuthStore.getState().setUser(null);
  usePlanStore.getState().reset();
  localStorage.removeItem("dispatch-auth");
  sessionStorage.removeItem(PASSWORD_RECOVERY_PENDING_KEY);
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
