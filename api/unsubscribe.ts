import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getSupabaseAdmin } from "./lib/supabase-admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).send("Method not allowed");
  }

  const email = req.query.email as string | undefined;
  if (!email) {
    return res.status(400).send("Missing email parameter");
  }

  const decodedEmail = decodeURIComponent(email).toLowerCase().trim();
  if (!decodedEmail || !decodedEmail.includes("@")) {
    return res.status(400).send("Invalid email");
  }

  const admin = getSupabaseAdmin();
  await admin.from("unsubscribes").upsert(
    { email: decodedEmail, unsubscribed_at: new Date().toISOString() },
    { onConflict: "email" },
  );

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Unsubscribed</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #333;">
  <h1 style="font-size: 1.25rem;">You've been unsubscribed successfully.</h1>
  <p style="color: #666; font-size: 0.875rem;">You will no longer receive emails from this sender.</p>
</body>
</html>`,
  );
}
