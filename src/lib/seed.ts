import { supabase } from "./supabase";
import { STARTER_TEMPLATES } from "./templates";
import { migrateTemplate } from "./template-service";

const TEMPLATE_CATEGORIES: Record<string, string> = {
  Minimal: "newsletter",
  "Product Launch": "marketing",
  "Weekly Digest": "newsletter",
  "Welcome Email": "transactional",
  Promotional: "marketing",
  "Flash Sale": "marketing",
  "Cold Outreach": "outreach",
  "Follow Up": "outreach",
  "Order Confirmation": "transactional",
  "Company Update": "newsletter",
};

export async function seedDefaultTemplates() {
  const { data: existing } = await supabase
    .from("templates")
    .select("id")
    .eq("is_default", true)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("Default templates already seeded");
    return;
  }

  const templates = STARTER_TEMPLATES.map((t) => ({
    name: t.name,
    data: migrateTemplate(t),
    is_public: true,
    is_default: true,
    user_id: null,
    category: TEMPLATE_CATEGORIES[t.name] ?? "general",
  }));

  const { error } = await supabase.from("templates").insert(templates);

  if (error) {
    console.error("Seeding failed:", error.message);
  } else {
    console.log("Default templates seeded successfully");
  }
}
