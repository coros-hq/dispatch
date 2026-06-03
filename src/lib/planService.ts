import { supabase } from "./supabase";
import type { Plan } from "./planLimits";

export async function fetchUserPlan(): Promise<Plan> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "free";

  const { data } = await supabase
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  if (!data) return "free";

  if (data.plan === "pro" && data.plan_expires_at) {
    if (new Date(data.plan_expires_at) < new Date()) return "free";
  }

  return (data.plan as Plan) ?? "free";
}

export async function fetchUsage(): Promise<{
  testEmailsSent: number;
  campaignsSent: number;
  contactsThisMonth: number;
}> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { testEmailsSent: 0, campaignsSent: 0, contactsThisMonth: 0 };

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .eq("usage_month", currentMonth)
    .single();

  return {
    testEmailsSent: data?.test_emails_sent ?? 0,
    campaignsSent: data?.campaigns_sent ?? 0,
    contactsThisMonth: data?.contacts_this_month ?? 0,
  };
}

export async function incrementUsage(
  field: "test_emails_sent" | "campaigns_sent" | "contacts_this_month",
  amount = 1,
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const currentMonth = new Date().toISOString().slice(0, 7);

  await supabase.rpc("increment_usage", {
    p_user_id: user.id,
    p_field: field,
    p_month: currentMonth,
    p_amount: amount,
  });
}
