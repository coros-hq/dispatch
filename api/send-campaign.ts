import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function personalizeHtml(
  html: string,
  contact: {
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    custom_fields?: Record<string, string>;
  },
): string {
  let result = html;

  result = result.replace(/\{\{first_name\}\}/gi, contact.first_name || "");
  result = result.replace(/\{\{last_name\}\}/gi, contact.last_name || "");
  result = result.replace(/\{\{email\}\}/gi, contact.email);
  result = result.replace(
    /\{\{full_name\}\}/gi,
    [contact.first_name, contact.last_name].filter(Boolean).join(" "),
  );

  // Replace any custom CSV columns e.g. {{company}}, {{city}}
  if (contact.custom_fields) {
    for (const [key, value] of Object.entries(contact.custom_fields)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "gi");
      result = result.replace(regex, value || "");
    }
  }

  return result;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_KEY!,
  );

  const { smtpConfigId, userId, subject, fromName, canvasHtml, recipients } =
    req.body;

  if (
    !smtpConfigId ||
    !userId ||
    !subject ||
    !canvasHtml ||
    !recipients?.length
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Fetch SMTP config
  const { data: smtpConfig, error } = await supabase
    .from("smtp_configs")
    .select("*")
    .eq("id", smtpConfigId)
    .eq("user_id", userId)
    .single();

  if (error || !smtpConfig)
    return res.status(404).json({ error: "SMTP config not found" });

  const password = Buffer.from(
    smtpConfig.password_encrypted,
    "base64",
  ).toString("utf-8");

  const transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port,
    secure: smtpConfig.secure,
    auth: { user: smtpConfig.username, pass: password },
  });

  // Fetch unsubscribed emails for this user
  const { data: unsubscribed } = await supabase
    .from("unsubscribed_emails")
    .select("email")
    .eq("user_id", userId);

  const unsubscribedSet = new Set(
    (unsubscribed || []).map((u: any) => u.email.toLowerCase()),
  );

  let sent = 0;
  const failed: { email: string; error: string }[] = [];

  // Send in batches of 10
  for (let i = 0; i < recipients.length; i += 10) {
    const batch = recipients.slice(i, i + 10);

    await Promise.all(
      batch.map(async (contact: any) => {
        if (unsubscribedSet.has(contact.email.toLowerCase())) {
          failed.push({ email: contact.email, error: "Unsubscribed" });
          return;
        }

        const personalizedHtml = personalizeHtml(canvasHtml, contact);
        const personalizedSubject = personalizeHtml(subject, contact);

        try {
          await transporter.sendMail({
            from: `"${fromName || smtpConfig.from_name}" <${smtpConfig.from_email}>`,
            to: contact.email,
            subject: personalizedSubject,
            html: personalizedHtml,
          });
          sent++;
        } catch (err: any) {
          failed.push({
            email: contact.email,
            error: err.message || "Unknown error",
          });
        }
      }),
    );

    if (i + 10 < recipients.length) await sleep(500);
  }

  return res.status(200).json({ sent, failed });
}
