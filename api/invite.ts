import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  buildInviteEmailPayload,
  type InviteEmailParams,
} from "./lib/build-invite-email.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { to, teamName, inviterName, role, inviteUrl } =
    req.body as InviteEmailParams;

  if (!to || !teamName || !inviterName || !role || !inviteUrl) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(
      buildInviteEmailPayload({
        to,
        teamName,
        inviterName,
        role,
        inviteUrl,
      }),
    ),
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
