export type InviteEmailParams = {
  to: string;
  teamName: string;
  inviterName: string;
  role: string;
  inviteUrl: string;
};

export function buildInviteEmailPayload(params: InviteEmailParams) {
  const { to, teamName, inviterName, role, inviteUrl } = params;

  return {
    from: "dispatch@coros.click",
    to,
    subject: `${inviterName} invited you to join ${teamName} on Dispatch`,
    html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:40px 24px;">
          <h2 style="font-size:24px;color:#111;margin-bottom:8px;">You're invited to ${teamName}</h2>
          <p style="color:#555;font-size:16px;">${inviterName} has invited you to join <strong>${teamName}</strong> as a <strong>${role}</strong>.</p>
          <a href="${inviteUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;margin-top:24px;">Accept invitation</a>
          <p style="color:#aaa;font-size:12px;margin-top:32px;">This invitation expires in 7 days.</p>
        </div>
      `,
  };
}
