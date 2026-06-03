import { useMemo, useState } from "react";
import Papa from "papaparse";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  RocketIcon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import { useEditorStore, getActiveCanvas } from "../../store/editor";
import { canvasToHtml } from "@/lib/renderer";
import {
  detectColumn,
  hasUnsubscribePlaceholder,
  personalizeContent,
  type CampaignRecipient,
} from "@/lib/campaignEmail";
import {
  fetchConnectedAccounts,
  getOAuthConnectUrl,
  type ConnectedAccount,
} from "@/lib/connectedAccountsService";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { usePlanStore } from "@/store/plan";
import { useAuthStore } from "@/store/auth";
import { UpgradePrompt } from "@/components/ui/UpgradePrompt";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserSmtpConfigs, type SmtpConfig } from "@/lib/smtpService";
import { sendSmtpCampaign } from "@/lib/campaignService";

const MERGE_TAGS = ["{{first_name}}", "{{last_name}}", "{{email}}"] as const;
const GMAIL_DAILY_LIMIT = 500;

type Step = 1 | 2 | 3 | 4;

type SendState = "idle" | "sending" | "done";

export type CampaignResultsProps = {
  sent: number;
  failed: { email: string; error: string }[];
  readOnly?: boolean;
  onDone?: () => void;
};

export function CampaignResults({
  sent,
  failed,
  readOnly = false,
  onDone,
}: CampaignResultsProps) {
  const [showFailed, setShowFailed] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 py-4">
        <div className="flex items-center gap-2 text-green-500">
          <CheckCircle2Icon className="size-4" />
          <span className="text-sm font-medium">{sent} sent</span>
        </div>
        {failed.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center gap-2 text-destructive text-sm font-medium"
              onClick={() => setShowFailed((v) => !v)}
            >
              {showFailed ? (
                <ChevronDownIcon className="size-4" />
              ) : (
                <ChevronRightIcon className="size-4" />
              )}
              <XCircleIcon className="size-4" />
              {failed.length} failed
            </button>
            {showFailed && (
              <ul className="max-h-40 overflow-y-auto text-xs text-muted-foreground border border-border rounded-md p-2 flex flex-col gap-1">
                {failed.map((f) => (
                  <li key={f.email}>
                    <span className="text-foreground">{f.email}</span> —{" "}
                    {f.error}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      {!readOnly && onDone && (
        <div className="flex justify-end">
          <Button onClick={onDone}>Done</Button>
        </div>
      )}
    </div>
  );
}

function ProviderIcon({
  provider,
}: {
  provider: ConnectedAccount["provider"];
}) {
  if (provider === "gmail") {
    return (
      <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
        <path
          fill="#EA4335"
          d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-7.545-4.91v9.273H.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.548l8.073-6.055C21.69 2.278 24 3.434 24 5.457z"
        />
      </svg>
    );
  }
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#0078D4"
        d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"
      />
    </svg>
  );
}

export default function CampaignModal() {
  const { template } = useEditorStore();
  const { user } = useAuthStore();
  const { plan, campaignsSent, contactsThisMonth, setUsage, testEmailsSent } =
    usePlanStore();
  const limits = PLAN_LIMITS[plan];
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
  const [sendMode, setSendMode] = useState<"oauth" | "smtp">("oauth");
  const [open, setOpen] = useState(false);
  const [accounts, setAccounts] = useState<ConnectedAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [step, setStep] = useState<Step>(1);

  const [accountId, setAccountId] = useState("");
  const [fromName, setFromName] = useState("");
  const [subject, setSubject] = useState("");

  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [emailCol, setEmailCol] = useState("");
  const [firstNameCol, setFirstNameCol] = useState<string>("__none__");
  const [lastNameCol, setLastNameCol] = useState<string>("__none__");

  const [previewRecipientIdx, setPreviewRecipientIdx] = useState(0);
  const [selectedCanvasId, setSelectedCanvasId] = useState("");

  const [sendState, setSendState] = useState<SendState>("idle");
  const [sendProgress, setSendProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState<{
    sent: number;
    failed: { email: string; error: string }[];
  } | null>(null);

  const layoutOptions = template.pages.flatMap((page) =>
    page.canvases.map((canvas) => ({
      id: canvas.id,
      label: `${page.name} · ${canvas.name}`,
      canvas,
    })),
  );

  const selectedAccount = accounts.find((a) => a.id === accountId);

  const recipients: CampaignRecipient[] = useMemo(() => {
    if (!emailCol) return [];
    return csvRows
      .map((row) => {
        const email = row[emailCol]?.trim();
        if (!email) return null;
        const recipient: CampaignRecipient = { email };
        if (firstNameCol !== "__none__") {
          recipient.first_name = row[firstNameCol]?.trim();
        }
        if (lastNameCol !== "__none__") {
          recipient.last_name = row[lastNameCol]?.trim();
        }
        for (const [key, val] of Object.entries(row)) {
          if (key !== emailCol && key !== firstNameCol && key !== lastNameCol) {
            recipient[key] = val;
          }
        }
        return recipient;
      })
      .filter((r): r is CampaignRecipient => r !== null);
  }, [csvRows, emailCol, firstNameCol, lastNameCol]);

  const contactsOverLimit =
    plan === "free" &&
    contactsThisMonth + recipients.length > limits.maxCampaignContacts;

  const campaignsOverLimit =
    plan === "free" && campaignsSent >= limits.maxCampaignsPerMonth;

  const appUrl = window.location.origin;

  const previewCanvas = layoutOptions.find((o) => o.id === selectedCanvasId);
  const previewHtml = previewCanvas ? canvasToHtml(previewCanvas.canvas) : "";

  const previewRecipient = recipients[previewRecipientIdx] ?? recipients[0];
  const personalizedPreviewHtml = previewRecipient
    ? personalizeContent(previewHtml, previewRecipient, appUrl)
    : previewHtml;
  const personalizedSubject = previewRecipient
    ? personalizeContent(subject, previewRecipient, appUrl)
    : subject;

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const [oauthData, smtpData] = await Promise.all([
        fetchConnectedAccounts(),
        getUserSmtpConfigs(user?.id ?? ""),
      ]);
      setAccounts(oauthData);
      setSmtpConfigs(smtpData.filter((c) => c.verified));
      if (oauthData.length > 0) {
        setAccountId(oauthData[0].id);
        setSendMode("oauth");
      } else if (smtpData.length > 0) {
        setAccountId(smtpData[0].id);
        setSendMode("smtp");
      }
    } finally {
      setAccountsLoading(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setFromName("");
    setSubject("");
    setCsvHeaders([]);
    setCsvRows([]);
    setEmailCol("");
    setFirstNameCol("__none__");
    setLastNameCol("__none__");
    setPreviewRecipientIdx(0);
    setSendState("idle");
    setSendProgress({ current: 0, total: 0 });
    setResults(null);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (val) {
      setSelectedCanvasId(getActiveCanvas(template).id);
      resetState();
      loadAccounts();
    }
  };

  const handleConnect = (provider: "gmail" | "outlook") => {
    if (!user?.id) return;
    window.location.href = getOAuthConnectUrl(provider, user.id);
  };

  const handleCsvFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const rows = result.data as Record<string, string>[];
        const headers = result.meta.fields ?? Object.keys(rows[0] ?? {});
        setCsvHeaders(headers);
        setCsvRows(rows);
        const detectedEmail = detectColumn(headers, [
          "email",
          "Email",
          "EMAIL",
        ]);
        const detectedFirst = detectColumn(headers, [
          "first_name",
          "first name",
          "First Name",
          "firstname",
        ]);
        const detectedLast = detectColumn(headers, [
          "last_name",
          "last name",
          "Last Name",
          "lastname",
        ]);
        setEmailCol(detectedEmail ?? "");
        setFirstNameCol(detectedFirst ?? "__none__");
        setLastNameCol(detectedLast ?? "__none__");
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleCsvFile(file);
  };

  const insertMergeTag = (tag: string) => {
    setSubject((s) => s + tag);
  };

  const handleSend = async () => {
    if (!previewCanvas || !accountId) return;
    setSendState("sending");
    setStep(4);
    setSendProgress({ current: 0, total: recipients.length });

    const html = canvasToHtml(previewCanvas.canvas);

    try {
      const result = await sendSmtpCampaign({
        smtpConfigId: accountId,
        userId: user!.id,
        subject,
        fromName,
        canvasHtml: html,
        recipients,
      });

      setResults({ sent: result.sent, failed: result.failed });
      setSendState("done");
      setSendProgress({ current: recipients.length, total: recipients.length });
      setUsage(
        testEmailsSent,
        campaignsSent + 1,
        contactsThisMonth + result.sent,
      );
    } catch (err) {
      setResults({
        sent: 0,
        failed: [
          {
            email: "—",
            error: err instanceof Error ? err.message : "Send failed",
          },
        ],
      });
      setSendState("done");
    }
  };

  const canProceedStep1 = accountId && fromName.trim() && subject.trim();
  const canProceedStep2 =
    recipients.length > 0 &&
    emailCol &&
    !contactsOverLimit &&
    !campaignsOverLimit;

  if (accountsLoading && open) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm">
            <RocketIcon className="size-3.5 mr-1.5" />
            Send campaign
          </Button>
        </DialogTrigger>
        <DialogContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Loading...
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <RocketIcon className="size-3.5 mr-1.5" />
          Send campaign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send campaign</DialogTitle>
          <DialogDescription>
            {accounts.length === 0
              ? "Connect your email account to get started"
              : `Step ${step} of 4`}
          </DialogDescription>
        </DialogHeader>

        {accounts.length === 0 && smtpConfigs.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <RocketIcon className="size-10 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Connect an email account to send campaigns
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Use Gmail, Outlook, or your own SMTP credentials.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button onClick={() => handleConnect("gmail")}>
                Connect Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => handleConnect("outlook")}
              >
                Connect Outlook
              </Button>
              <Button
                variant="outline"
                onClick={() => (window.location.href = "/profile?tab=sending")}
              >
                Set up SMTP
              </Button>
            </div>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div className="flex flex-col gap-4">
                {layoutOptions.length > 1 && (
                  <div className="flex flex-col gap-1.5">
                    <Label>Layout</Label>
                    <Select
                      value={selectedCanvasId}
                      onValueChange={setSelectedCanvasId}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutOptions.map((o) => (
                          <SelectItem key={o.id} value={o.id}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <Label>Send from</Label>
                  <Select
                    value={`${sendMode}:${accountId}`}
                    onValueChange={(val) => {
                      const [mode, id] = val.split(":");
                      setSendMode(mode as "oauth" | "smtp");
                      setAccountId(id);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                            Connected accounts
                          </div>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={`oauth:${a.id}`}>
                              <span className="flex items-center gap-2">
                                <ProviderIcon provider={a.provider} />
                                {a.email}
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
                      {smtpConfigs.length > 0 && (
                        <>
                          <div className="px-2 py-1 text-[10px] text-muted-foreground uppercase tracking-wider">
                            SMTP accounts
                          </div>
                          {smtpConfigs.map((c) => (
                            <SelectItem key={c.id} value={`smtp:${c.id}`}>
                              <span className="flex items-center gap-2">
                                <span className="text-xs">✉️</span>
                                {c.from_email} ({c.label})
                              </span>
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {smtpConfigs.length === 0 && accounts.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No accounts connected.{" "}
                      <a href="/profile?tab=sending" className="underline">
                        Set up SMTP
                      </a>
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>From name</Label>
                  <Input
                    placeholder="Sarah from Acme"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                  />
                  {selectedAccount && fromName && (
                    <p className="text-xs text-muted-foreground">
                      Recipients will see: {fromName} &lt;
                      {selectedAccount.email}&gt;
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label>Subject line</Label>
                  <Input
                    placeholder="Hello {{first_name}}!"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {MERGE_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => insertMergeTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!canProceedStep1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col gap-4">
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file";
                    input.accept = ".csv";
                    input.onchange = () => {
                      const file = input.files?.[0];
                      if (file) handleCsvFile(file);
                    };
                    input.click();
                  }}
                >
                  <UploadIcon className="size-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Drop CSV here or click to upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Include an email column; first_name and last_name are
                    optional
                  </p>
                </div>

                {csvRows.length > 0 && (
                  <>
                    <div className="overflow-x-auto border border-border rounded-lg">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/50">
                            {csvHeaders.map((h) => (
                              <th
                                key={h}
                                className="px-3 py-2 text-left font-medium"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {csvRows.slice(0, 5).map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-border last:border-0"
                            >
                              {csvHeaders.map((h) => (
                                <td
                                  key={h}
                                  className="px-3 py-2 text-muted-foreground"
                                >
                                  {row[h]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {csvRows.length > 5 && (
                        <p className="text-[10px] text-muted-foreground px-3 py-1.5">
                          Showing 5 of {csvRows.length} rows
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label>Email *</Label>
                        <Select value={emailCol} onValueChange={setEmailCol}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select column" />
                          </SelectTrigger>
                          <SelectContent>
                            {csvHeaders.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>First name</Label>
                        <Select
                          value={firstNameCol}
                          onValueChange={setFirstNameCol}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {csvHeaders.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Last name</Label>
                        <Select
                          value={lastNameCol}
                          onValueChange={setLastNameCol}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {csvHeaders.map((h) => (
                              <SelectItem key={h} value={h}>
                                {h}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <p className="text-sm text-foreground">
                      {recipients.length} recipient
                      {recipients.length !== 1 ? "s" : ""} loaded
                    </p>

                    {plan === "free" && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Campaign contacts this month</span>
                          <span>
                            {contactsThisMonth + recipients.length} /{" "}
                            {limits.maxCampaignContacts}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                ((contactsThisMonth + recipients.length) /
                                  limits.maxCampaignContacts) *
                                  100,
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {contactsOverLimit && (
                      <UpgradePrompt
                        feature="More campaign contacts"
                        description={`Free plan includes ${limits.maxCampaignContacts} contacts per month. Upgrade to Pro for unlimited.`}
                        compact
                      />
                    )}

                    {campaignsOverLimit && (
                      <UpgradePrompt
                        feature="More campaigns"
                        description={`Free plan includes ${limits.maxCampaignsPerMonth} campaign per month. Upgrade to Pro for unlimited.`}
                        compact
                      />
                    )}

                    {selectedAccount?.provider === "gmail" &&
                      recipients.length >= GMAIL_DAILY_LIMIT * 0.8 && (
                        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <AlertTriangleIcon className="size-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-amber-400">
                            Gmail limits sending to {GMAIL_DAILY_LIMIT} emails
                            per day per account. You have {recipients.length}{" "}
                            recipients — some may fail if you exceed this limit.
                          </p>
                        </div>
                      )}
                  </>
                )}

                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!canProceedStep2}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-4">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="text-foreground font-medium">From:</span>{" "}
                    {fromName} &lt;{selectedAccount?.email}&gt;
                  </p>
                  <p>
                    <span className="text-foreground font-medium">
                      Subject:
                    </span>{" "}
                    {personalizedSubject}
                  </p>
                </div>

                {!hasUnsubscribePlaceholder(previewHtml) && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertTriangleIcon className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-400">
                      Add an Unsubscribe block to your email to comply with
                      CAN-SPAM / GDPR
                    </p>
                  </div>
                )}

                {recipients.length > 1 && (
                  <div className="flex items-center gap-2">
                    <Label className="shrink-0">Preview as</Label>
                    <Select
                      value={String(previewRecipientIdx)}
                      onValueChange={(v) => setPreviewRecipientIdx(Number(v))}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {recipients.map((r, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {r.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <iframe
                  title="Email preview"
                  srcDoc={personalizedPreviewHtml}
                  className="w-full h-64 border border-border rounded-lg bg-white"
                  sandbox=""
                />

                <div className="flex justify-between gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={handleSend}>Send</Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="flex flex-col gap-4">
                {sendState === "sending" && (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <p className="text-sm text-muted-foreground">
                      Sending... {sendProgress.current} / {sendProgress.total}
                    </p>
                    <div className="h-2 w-full max-w-xs rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary animate-pulse w-full" />
                    </div>
                  </div>
                )}

                {sendState === "done" && results && (
                  <CampaignResults
                    sent={results.sent}
                    failed={results.failed}
                    onDone={() => setOpen(false)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
