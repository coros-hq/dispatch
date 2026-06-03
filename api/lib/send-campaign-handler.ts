import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSupabaseAdmin,
  getEncryptionKey,
  getAppUrl,
  verifyUser,
} from "./supabase-admin";
import { personalizeContent, type CampaignRecipient } from "./personalize";
import { refreshGmailToken, refreshOutlookToken } from "./token-refresh";
import { sendViaGmail, sendViaOutlook } from "./send-email";

const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 100;

const FREE_MAX_CONTACTS = 500;
const FREE_MAX_CAMPAIGNS = 1;

type SendCampaignBody = {
  accountId: string;
  subject: string;
  fromName: string;
  canvasHtml: string;
  recipients: CampaignRecipient[];
};

type ConnectedAccount = {
  id: string;
  provider: "gmail" | "outlook";
  email: string;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureFreshToken(
  account: ConnectedAccount,
): Promise<string> {
  const expiresAt = account.token_expires_at
    ? new Date(account.token_expires_at)
    : null;
  const isExpired = !expiresAt || expiresAt.getTime() <= Date.now() + 60_000;

  if (!isExpired) return account.access_token;
  if (!account.refresh_token) {
    throw new Error("Token expired and no refresh token available");
  }

  const admin = getSupabaseAdmin();
  const encryptionKey = getEncryptionKey();

  const refreshed =
    account.provider === "gmail"
      ? await refreshGmailToken(account.refresh_token)
      : await refreshOutlookToken(account.refresh_token);

  await admin.rpc("update_connected_account_tokens", {
    p_account_id: account.id,
    p_access_token: refreshed.accessToken,
    p_token_expires_at: refreshed.expiresAt?.toISOString() ?? null,
    p_encryption_key: encryptionKey,
  });

  return refreshed.accessToken;
}

export async function handleSendCampaign(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await verifyUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const body = req.body as SendCampaignBody;
  const { accountId, subject, fromName, canvasHtml, recipients } = body;

  if (!accountId || !subject || !fromName || !canvasHtml || !recipients?.length) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const admin = getSupabaseAdmin();
  const encryptionKey = getEncryptionKey();
  const appUrl = getAppUrl();

  const { data: accountRows, error: accountError } = await admin.rpc(
    "get_connected_account_tokens",
    {
      p_account_id: accountId,
      p_user_id: user.id,
      p_encryption_key: encryptionKey,
    },
  );

  if (accountError || !accountRows?.length) {
    return res.status(404).json({ error: "Connected account not found" });
  }

  const account = accountRows[0] as ConnectedAccount;

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, plan_expires_at")
    .eq("id", user.id)
    .single();

  let plan = (profile?.plan as string) ?? "free";
  if (
    plan === "pro" &&
    profile?.plan_expires_at &&
    new Date(profile.plan_expires_at) < new Date()
  ) {
    plan = "free";
  }

  const currentMonth = new Date().toISOString().slice(0, 7);
  const { data: usage } = await admin
    .from("usage_tracking")
    .select("campaigns_sent, contacts_this_month")
    .eq("user_id", user.id)
    .eq("usage_month", currentMonth)
    .single();

  const campaignsSent = usage?.campaigns_sent ?? 0;
  const contactsSent = usage?.contacts_this_month ?? 0;

  if (plan === "free") {
    if (campaignsSent >= FREE_MAX_CAMPAIGNS) {
      return res.status(403).json({
        error: "limit_exceeded",
        limit: "campaigns",
        current: campaignsSent,
        max: FREE_MAX_CAMPAIGNS,
      });
    }
    if (recipients.length > FREE_MAX_CONTACTS) {
      return res.status(403).json({
        error: "limit_exceeded",
        limit: "contacts",
        current: recipients.length,
        max: FREE_MAX_CONTACTS,
      });
    }
    if (contactsSent + recipients.length > FREE_MAX_CONTACTS) {
      return res.status(403).json({
        error: "limit_exceeded",
        limit: "contacts",
        current: contactsSent,
        max: FREE_MAX_CONTACTS,
      });
    }
  }

  const { data: unsubscribedRows } = await admin
    .from("unsubscribes")
    .select("email");

  const unsubscribed = new Set(
    (unsubscribedRows ?? []).map((r: { email: string }) =>
      r.email.toLowerCase(),
    ),
  );

  const activeRecipients = recipients.filter(
    (r) => r.email && !unsubscribed.has(r.email.toLowerCase()),
  );

  const { data: campaign, error: campaignError } = await admin
    .from("campaigns")
    .insert({
      user_id: user.id,
      connected_account_id: accountId,
      subject,
      from_name: fromName,
      from_email: account.email,
      recipient_count: activeRecipients.length,
      status: "sending",
    })
    .select("id")
    .single();

  if (campaignError || !campaign) {
    return res.status(500).json({ error: "Failed to create campaign record" });
  }

  let accessToken: string;
  try {
    accessToken = await ensureFreshToken(account);
  } catch (err) {
    await admin
      .from("campaigns")
      .update({ status: "failed", failed_count: activeRecipients.length })
      .eq("id", campaign.id);
    return res.status(401).json({
      error: err instanceof Error ? err.message : "Token refresh failed",
    });
  }

  const failed: { email: string; error: string }[] = [];
  let sent = 0;

  for (let i = 0; i < activeRecipients.length; i += BATCH_SIZE) {
    const batch = activeRecipients.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (recipient) => {
        const personalizedHtml = personalizeContent(
          canvasHtml,
          recipient,
          appUrl,
        );
        const personalizedSubject = personalizeContent(
          subject,
          recipient,
          appUrl,
        );

        try {
          if (account.provider === "gmail") {
            await sendViaGmail(
              accessToken,
              fromName,
              account.email,
              recipient.email,
              personalizedSubject,
              personalizedHtml,
            );
          } else {
            await sendViaOutlook(
              accessToken,
              fromName,
              account.email,
              recipient.email,
              personalizedSubject,
              personalizedHtml,
            );
          }
          sent++;
        } catch (err) {
          failed.push({
            email: recipient.email,
            error: err instanceof Error ? err.message : "Send failed",
          });
        }
      }),
    );

    if (i + BATCH_SIZE < activeRecipients.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  const status =
    sent === 0 && failed.length > 0
      ? "failed"
      : failed.length > 0
        ? "done"
        : "done";

  await admin
    .from("campaigns")
    .update({
      sent_count: sent,
      failed_count: failed.length,
      status,
      failed_recipients: failed,
    })
    .eq("id", campaign.id);

  await admin.rpc("increment_usage", {
    p_user_id: user.id,
    p_field: "campaigns_sent",
    p_month: currentMonth,
    p_amount: 1,
  });

  if (sent > 0) {
    await admin.rpc("increment_usage", {
      p_user_id: user.id,
      p_field: "contacts_this_month",
      p_month: currentMonth,
      p_amount: sent,
    });
  }

  return res.status(200).json({
    sent,
    failed,
    campaignId: campaign.id,
  });
}
