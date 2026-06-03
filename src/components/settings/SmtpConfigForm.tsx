import { useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  getUserSmtpConfigs,
  saveSmtpConfig,
  deleteSmtpConfig,
  testSmtpConnection,
  type SmtpConfig,
  type SmtpConfigInput,
} from "@/lib/smtpService";
import { toast } from "sonner";

// ─── Provider presets ─────────────────────────────────────────────────────────

const PROVIDERS = [
  {
    id: "gmail",
    label: "Gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    hint: "Use an App Password, not your regular Gmail password.",
    guideUrl: "https://support.google.com/accounts/answer/185833",
  },
  {
    id: "outlook",
    label: "Outlook",
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    hint: "Use your Outlook email and password.",
    guideUrl:
      "https://support.microsoft.com/en-us/office/pop-imap-and-smtp-settings-8361e398-8af4-4e97-b147-6c6c4ac95353",
  },
  {
    id: "yahoo",
    label: "Yahoo",
    host: "smtp.mail.yahoo.com",
    port: 587,
    secure: false,
    hint: "Use an App Password from your Yahoo account security settings.",
    guideUrl:
      "https://help.yahoo.com/kb/generate-third-party-passwords-sln15241.html",
  },
  {
    id: "custom",
    label: "Custom SMTP",
    host: "",
    port: 587,
    secure: false,
    hint: "Enter your SMTP server details manually.",
    guideUrl: null,
  },
];

// ─── Empty form state ─────────────────────────────────────────────────────────

const emptyForm = (): SmtpConfigInput & { provider: string } => ({
  provider: "gmail",
  label: "",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  username: "",
  password: "",
  from_name: "",
  from_email: "",
});

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  userId: string;
}

export default function SmtpConfigForm({ userId }: Props) {
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [showPassword, setShowPassword] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load on mount
  useState(() => {
    getUserSmtpConfigs(userId)
      .then(setConfigs)
      .catch(() => toast.error("Failed to load sending accounts"))
      .finally(() => setLoading(false));
  });

  function selectProvider(providerId: string) {
    const preset = PROVIDERS.find((p) => p.id === providerId);
    if (!preset) return;
    setForm((f) => ({
      ...f,
      provider: providerId,
      label: providerId === "custom" ? f.label : preset.label,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
    }));
  }

  async function handleTestAndSave() {
    if (!form.username || !form.password || !form.from_email || !form.host) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setTesting(true);
    const result = await testSmtpConnection({
      host: form.host,
      port: form.port,
      secure: form.secure,
      username: form.username,
      password: form.password,
      from_email: form.from_email,
    });
    setTesting(false);

    if (!result.success) {
      toast.error(result.error || "Connection failed.");
      return;
    }

    toast.success("Connection verified!");
    setSaving(true);

    try {
      const saved = await saveSmtpConfig(
        userId,
        {
          label: form.label || form.provider,
          host: form.host,
          port: form.port,
          secure: form.secure,
          username: form.username,
          password: form.password,
          from_name: form.from_name,
          from_email: form.from_email,
        },
        true,
      );

      setConfigs((c) => [...c, saved]);
      setShowForm(false);
      setForm(emptyForm());
      toast.success("Sending account saved.");
    } catch {
      toast.error("Failed to save account.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteSmtpConfig(id);
      setConfigs((c) => c.filter((x) => x.id !== id));
      toast.success("Account removed.");
    } catch {
      toast.error("Failed to remove account.");
    }
  }

  const currentProvider = PROVIDERS.find((p) => p.id === form.provider);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">Sending Accounts</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Connect your email account to send campaigns.
          </p>
        </div>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowForm(true)}
            className="gap-1.5 text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Account
          </Button>
        )}
      </div>

      {/* Existing configs */}
      {loading ? (
        <div className="text-xs text-zinc-500 py-4 text-center">Loading...</div>
      ) : configs.length === 0 && !showForm ? (
        <div className="border border-dashed border-zinc-700 rounded-lg p-6 text-center">
          <p className="text-sm text-zinc-400">No sending accounts yet.</p>
          <p className="text-xs text-zinc-500 mt-1">
            Add one to start sending campaigns.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {configs.map((config) => (
            <div
              key={config.id}
              className="border border-zinc-800 rounded-lg overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800/50 transition-colors"
                onClick={() =>
                  setExpandedId(expandedId === config.id ? null : config.id)
                }
              >
                <div className="flex items-center gap-3">
                  {config.verified ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {config.label}
                    </p>
                    <p className="text-xs text-zinc-400">{config.from_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {config.verified && (
                    <Badge
                      variant="outline"
                      className="text-emerald-400 border-emerald-400/30 text-xs"
                    >
                      Verified
                    </Badge>
                  )}
                  {expandedId === config.id ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </div>
              </button>

              {expandedId === config.id && (
                <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-900/50 space-y-2">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                    <span className="text-zinc-500">Host</span>
                    <span className="text-zinc-300">{config.host}</span>
                    <span className="text-zinc-500">Port</span>
                    <span className="text-zinc-300">{config.port}</span>
                    <span className="text-zinc-500">Username</span>
                    <span className="text-zinc-300">{config.username}</span>
                    <span className="text-zinc-500">From name</span>
                    <span className="text-zinc-300">
                      {config.from_name || "—"}
                    </span>
                  </div>
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10 text-xs gap-1.5"
                      onClick={() => handleDelete(config.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove account
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add account form */}
      {showForm && (
        <div className="border border-zinc-700 rounded-lg p-4 space-y-4 bg-zinc-900/50">
          {/* Provider selector */}
          <div className="space-y-2">
            <Label className="text-xs text-zinc-400">Email provider</Label>
            <div className="grid grid-cols-4 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectProvider(p.id)}
                  className={`
                    px-3 py-2 rounded-md text-xs font-medium border transition-colors
                    ${
                      form.provider === p.id
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-600"
                    }
                  `}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {currentProvider?.hint && (
              <p className="text-xs text-amber-400/80 bg-amber-400/10 border border-amber-400/20 rounded px-3 py-2">
                {currentProvider.hint}
                {currentProvider.guideUrl && (
                  <a
                    href={currentProvider.guideUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 underline"
                  >
                    Learn how →
                  </a>
                )}
              </p>
            )}
          </div>

          {/* Label */}
          <div className="space-y-1.5">
            <Label htmlFor="label" className="text-xs text-zinc-400">
              Account label
            </Label>
            <Input
              id="label"
              placeholder="e.g. Work Gmail"
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              className="bg-zinc-800 border-zinc-700 text-sm"
            />
          </div>

          {/* Host + Port (only shown for Custom) */}
          {form.provider === "custom" && (
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label htmlFor="host" className="text-xs text-zinc-400">
                  SMTP host
                </Label>
                <Input
                  id="host"
                  placeholder="smtp.example.com"
                  value={form.host}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, host: e.target.value }))
                  }
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="port" className="text-xs text-zinc-400">
                  Port
                </Label>
                <Input
                  id="port"
                  type="number"
                  value={form.port}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, port: Number(e.target.value) }))
                  }
                  className="bg-zinc-800 border-zinc-700 text-sm"
                />
              </div>
            </div>
          )}

          {/* Secure toggle (Custom only) */}
          {form.provider === "custom" && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs text-zinc-400">
                  Use SSL (port 465)
                </Label>
                <p className="text-xs text-zinc-500">
                  Disable for TLS/STARTTLS (port 587)
                </p>
              </div>
              <Switch
                checked={form.secure}
                onCheckedChange={(v) => setForm((f) => ({ ...f, secure: v }))}
              />
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs text-zinc-400">
              Username{" "}
              <span className="text-zinc-600">(your email address)</span>
            </Label>
            <Input
              id="username"
              type="email"
              placeholder="you@gmail.com"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              className="bg-zinc-800 border-zinc-700 text-sm"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs text-zinc-400">
              Password / App password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* From name + From email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="from_name" className="text-xs text-zinc-400">
                From name
              </Label>
              <Input
                id="from_name"
                placeholder="Acme Newsletter"
                value={form.from_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, from_name: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="from_email" className="text-xs text-zinc-400">
                From email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="from_email"
                type="email"
                placeholder="hello@acme.com"
                value={form.from_email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, from_email: e.target.value }))
                }
                className="bg-zinc-800 border-zinc-700 text-sm"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleTestAndSave}
              disabled={testing || saving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
            >
              {testing
                ? "Testing connection…"
                : saving
                  ? "Saving…"
                  : "Test & Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setForm(emptyForm());
              }}
              className="text-xs text-zinc-400"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
