import Papa from "papaparse";
import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Campaign {
  id: string;
  user_id: string;
  template_id: string | null;
  canvas_id: string | null;
  smtp_config_id: string | null;
  subject: string;
  preview_text: string | null;
  from_name: string | null;
  from_email: string | null;
  status: "draft" | "sending" | "done" | "failed";
  total_contacts: number;
  sent_count: number;
  failed_count: number;
  created_at: string;
  sent_at: string | null;
}

export interface CampaignContact {
  id: string;
  campaign_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  custom_fields: Record<string, string>;
  status: "pending" | "sent" | "failed";
  error_message: string | null;
  sent_at: string | null;
}

export interface ContactRow {
  email: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | undefined;
}

export interface ColumnMapping {
  [csvHeader: string]: "email" | "first_name" | "last_name" | "skip" | string;
}

export interface CreateCampaignInput {
  template_id: string;
  canvas_id: string;
  smtp_config_id: string;
  subject: string;
  preview_text?: string;
  from_name?: string;
  from_email?: string;
  renderedHtml: string; // rendered client-side before saving
  contacts: ContactRow[];
}

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

export function parseCSV(
  file: File,
): Promise<{ headers: string[]; rows: Record<string, string>[] }> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];
        resolve({ headers, rows });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export async function sendSmtpCampaign(input: {
  smtpConfigId: string;
  userId: string;
  subject: string;
  fromName: string;
  canvasHtml: string;
  recipients: ContactRow[];
}): Promise<{ sent: number; failed: { email: string; error: string }[] }> {
  const res = await fetch("/api/send-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to send campaign");
  }

  return res.json();
}

export function parseEmailList(text: string): ContactRow[] {
  return text
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter((e) => e.includes("@"))
    .map((email) => ({ email }));
}

// Auto-detect which CSV column is likely email/first_name/last_name
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};

  for (const header of headers) {
    const h = header.toLowerCase().replace(/[\s_-]/g, "");
    if (["email", "emailaddress", "e-mail"].includes(h)) {
      mapping[header] = "email";
    } else if (["firstname", "first", "fname", "givenname"].includes(h)) {
      mapping[header] = "first_name";
    } else if (
      ["lastname", "last", "lname", "surname", "familyname"].includes(h)
    ) {
      mapping[header] = "last_name";
    } else {
      mapping[header] = "skip";
    }
  }

  return mapping;
}

export function applyMapping(
  rows: Record<string, string>[],
  mapping: ColumnMapping,
): ContactRow[] {
  const emailCol = Object.entries(mapping).find(([, v]) => v === "email")?.[0];
  if (!emailCol) throw new Error("No email column mapped.");

  return rows
    .map((row) => {
      const contact: ContactRow = { email: row[emailCol]?.trim() || "" };
      const custom: Record<string, string> = {};

      for (const [header, role] of Object.entries(mapping)) {
        if (role === "skip" || role === "email") continue;
        if (role === "first_name") contact.first_name = row[header]?.trim();
        else if (role === "last_name") contact.last_name = row[header]?.trim();
        else custom[role] = row[header]?.trim() || "";
      }

      if (Object.keys(custom).length > 0) {
        (contact as any).custom_fields = custom;
      }

      return contact;
    })
    .filter((c) => c.email && c.email.includes("@"));
}

// ─── Plan limits ──────────────────────────────────────────────────────────────

export async function checkCampaignLimits(
  userId: string,
  plan: "free" | "pro",
  contactCount: number,
): Promise<{ allowed: boolean; reason?: string }> {
  if (plan === "pro") return { allowed: true };

  // Free: max 500 contacts per send
  if (contactCount > 500) {
    return {
      allowed: false,
      reason: `Free plan is limited to 500 contacts per campaign. You have ${contactCount}.`,
    };
  }

  // Free: max 1 campaign per month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("campaigns")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("status", ["sending", "done"])
    .gte("created_at", startOfMonth.toISOString());

  if ((count || 0) >= 1) {
    return {
      allowed: false,
      reason:
        "Free plan allows 1 campaign per month. Upgrade to Pro for unlimited campaigns.",
    };
  }

  return { allowed: true };
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function createCampaign(
  userId: string,
  input: CreateCampaignInput,
): Promise<Campaign> {
  // 1. Insert campaign row
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .insert({
      user_id: userId,
      template_id: input.template_id,
      canvas_id: input.canvas_id,
      smtp_config_id: input.smtp_config_id,
      subject: input.subject,
      preview_text: input.preview_text || null,
      from_name: input.from_name || null,
      from_email: input.from_email || null,
      status: "draft",
      total_contacts: input.contacts.length,
    })
    .select()
    .single();

  if (campaignError || !campaign)
    throw campaignError || new Error("Failed to create campaign");

  // 2. Store rendered HTML in templates table as canvas.renderedHtml
  // We update the template's content to attach the rendered snapshot
  await attachRenderedHtml(
    input.template_id,
    input.canvas_id,
    input.renderedHtml,
  );

  // 3. Insert contacts in batches of 500
  const contactRows = input.contacts.map((c) => ({
    campaign_id: campaign.id,
    email: c.email,
    first_name: c.first_name || null,
    last_name: c.last_name || null,
    custom_fields: (c as any).custom_fields || {},
    status: "pending",
  }));

  for (let i = 0; i < contactRows.length; i += 500) {
    const { error } = await supabase
      .from("campaign_contacts")
      .insert(contactRows.slice(i, i + 500));
    if (error) throw error;
  }

  return campaign;
}

// Attach rendered HTML snapshot to the canvas in the template content
async function attachRenderedHtml(
  templateId: string,
  canvasId: string,
  html: string,
): Promise<void> {
  const { data: template, error } = await supabase
    .from("templates")
    .select("content")
    .eq("id", templateId)
    .single();

  if (error || !template) return;

  const content = template.content;
  let updated = false;

  for (const page of content.pages || []) {
    for (const canvas of page.canvases || []) {
      if (canvas.id === canvasId) {
        canvas.renderedHtml = html;
        updated = true;
        break;
      }
    }
    if (updated) break;
  }

  if (updated) {
    await supabase.from("templates").update({ content }).eq("id", templateId);
  }
}

export async function getCampaigns(userId: string): Promise<Campaign[]> {
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getCampaignContacts(
  campaignId: string,
): Promise<CampaignContact[]> {
  const { data, error } = await supabase
    .from("campaign_contacts")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("status", { ascending: true });

  if (error) throw error;
  return data || [];
}

// ─── Send ─────────────────────────────────────────────────────────────────────

export async function sendCampaign(
  campaignId: string,
  userId: string,
): Promise<{ sent: number; failed: number }> {
  const res = await fetch("/api/send-campaign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaignId, userId }),
  });

  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to send campaign");
  }

  return res.json();
}

// Poll campaign status every 2s until done/failed
export function pollCampaignStatus(
  campaignId: string,
  onUpdate: (campaign: Campaign) => void,
  onDone: (campaign: Campaign) => void,
): () => void {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (!data) return;
    onUpdate(data);

    if (data.status === "done" || data.status === "failed") {
      clearInterval(interval);
      onDone(data);
    }
  }, 2000);

  // Return cleanup function
  return () => clearInterval(interval);
}
