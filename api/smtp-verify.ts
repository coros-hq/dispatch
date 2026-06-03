import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { host, port, secure, username, password, from_email } = req.body;

  if (!host || !port || !username || !password || !from_email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Boolean(secure),
      auth: { user: username, pass: password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    await transporter.verify();

    return res.status(200).json({ success: true });
  } catch (err: any) {
    // Normalize common SMTP errors into human-readable messages
    let message = "Connection failed. Check your credentials and try again.";

    if (err.code === "ECONNREFUSED")
      message = "Connection refused. Check the host and port.";
    else if (err.code === "ETIMEDOUT")
      message = "Connection timed out. Check the host and port.";
    else if (err.responseCode === 535)
      message = "Invalid username or password.";
    else if (err.responseCode === 534)
      message = "Gmail requires an App Password, not your regular password.";

    return res.status(400).json({ success: false, error: message });
  }
}
