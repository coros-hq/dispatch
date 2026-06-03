export async function sendViaGmail(
  accessToken: string,
  fromName: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string,
): Promise<void> {
  const message = [
    `From: ${fromName} <${fromEmail}>`,
    `To: ${toEmail}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=utf-8",
    "",
    html,
  ].join("\r\n");

  const encoded = Buffer.from(message).toString("base64url");

  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw: encoded }),
    },
  );

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(data.error?.message ?? `Gmail send failed (${res.status})`);
  }
}

export async function sendViaOutlook(
  accessToken: string,
  fromName: string,
  fromEmail: string,
  toEmail: string,
  subject: string,
  html: string,
): Promise<void> {
  const res = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        from: { emailAddress: { name: fromName, address: fromEmail } },
        toRecipients: [{ emailAddress: { address: toEmail } }],
        body: { contentType: "HTML", content: html },
      },
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
    throw new Error(data.error?.message ?? `Outlook send failed (${res.status})`);
  }
}
