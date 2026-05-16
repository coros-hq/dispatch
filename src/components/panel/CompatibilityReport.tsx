import { useState } from "react";
import { useEditorStore, getActiveCanvas } from "../../store/editor";
import { generateCompatibilityReport } from "@/lib/compatibilityEngine";
import type {
  CompatibilityReport,
  ClientResult,
  Issue,
} from "@/lib/compatibilityEngine";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const SCORE_GREEN = "#22c55e";
const SCORE_YELLOW = "#eab308";
const SCORE_RED = "#ef4444";

const CLIENT_ABBREV: Record<string, { primary: string; secondary: string }> = {
  "Gmail Web": { primary: "G", secondary: "Web" },
  "Gmail iOS": { primary: "G", secondary: "iOS" },
  "Gmail Android": { primary: "G", secondary: "And" },
  "Outlook 2007": { primary: "O", secondary: "07" },
  "Outlook 2010": { primary: "O", secondary: "10" },
  "Outlook 2013": { primary: "O", secondary: "13" },
  "Outlook 2016": { primary: "O", secondary: "16" },
  "Outlook 2019": { primary: "O", secondary: "19" },
  "Outlook 365": { primary: "O", secondary: "365" },
  "Outlook.com": { primary: "O", secondary: ".com" },
  "Apple Mail macOS": { primary: "AM", secondary: "Mac" },
  "Apple Mail iOS": { primary: "AM", secondary: "iOS" },
  "Yahoo Mail": { primary: "Yahoo", secondary: "" },
  "Samsung Email": { primary: "Samsung", secondary: "" },
  Thunderbird: { primary: "Tbird", secondary: "" },
  ProtonMail: { primary: "Proton", secondary: "" },
  HEY: { primary: "HEY", secondary: "" },
  AOL: { primary: "AOL", secondary: "" },
};

function getScoreColor(score: number): string {
  if (score >= 80) return SCORE_GREEN;
  if (score >= 50) return SCORE_YELLOW;
  return SCORE_RED;
}

function getOverallLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 50) return "Fair";
  return "Poor";
}

function getClientAbbrev(name: string): { primary: string; secondary: string } {
  return CLIENT_ABBREV[name] ?? { primary: name.slice(0, 4), secondary: "" };
}

function computeOverallScore(clients: ClientResult[]): number {
  if (clients.length === 0) return 0;
  const sum = clients.reduce((acc, c) => acc + c.score, 0);
  return Math.round(sum / clients.length);
}

function computeReportStats(clients: ClientResult[]): {
  issues: number;
  warnings: number;
} {
  const byProperty = new Map<string, "no" | "partial">();
  for (const client of clients) {
    for (const issue of client.issues) {
      const current = byProperty.get(issue.property);
      if (issue.support === "no") {
        byProperty.set(issue.property, "no");
      } else if (issue.support === "partial" && current !== "no") {
        byProperty.set(issue.property, "partial");
      }
    }
  }
  let issues = 0;
  let warnings = 0;
  byProperty.forEach((support) => {
    if (support === "no") issues++;
    else warnings++;
  });
  return { issues, warnings };
}

export default function CompatibilityReportPanel() {
  const { template } = useEditorStore();
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeCanvas = getActiveCanvas(template);
      const result = await generateCompatibilityReport(activeCanvas);
      setReport(result);
      setSelectedClient(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Check failed");
    } finally {
      setLoading(false);
    }
  };

  const overallScore = report
    ? computeOverallScore(report.clients)
    : 0;
  const { issues: issueCount, warnings: warningCount } = report
    ? computeReportStats(report.clients)
    : { issues: 0, warnings: 0 };
  const selected = report?.clients.find((c) => c.name === selectedClient);

  return (
    <div className="flex flex-col h-full min-w-0">
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Compatibility
        </span>
        {report && (
          <span className="text-[10px] text-muted-foreground">
            {new Date(report.generatedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-3 min-w-0">
        {!report && !loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-xs text-muted-foreground text-center">
              Run a compatibility check to see how your email renders across
              clients. Only the active page and variant are analyzed — switch
              using the Variants and Pages bars below the canvas if needed.
            </p>
            <Button size="sm" onClick={handleGenerate} className="w-full">
              Run check
            </Button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground animate-pulse">
              Checking compatibility...
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {report && !loading && (
          <>
            <OverallScoreHeader
              score={overallScore}
              issueCount={issueCount}
              warningCount={warningCount}
            />

            <ClientGrid
              clients={report.clients}
              selectedClient={selectedClient}
              onSelect={setSelectedClient}
            />

            {selected && (
              <ClientIssuesList client={selected} />
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              className="w-full mt-auto shrink-0"
            >
              Re-run check
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

type OverallScoreHeaderProps = {
  score: number;
  issueCount: number;
  warningCount: number;
};

function OverallScoreHeader({
  score,
  issueCount,
  warningCount,
}: OverallScoreHeaderProps) {
  const color = getScoreColor(score);
  const label = getOverallLabel(score);

  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 text-center shrink-0">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
        Overall compatibility
      </p>
      <p
        className="text-[48px] font-bold leading-none mt-2 tabular-nums"
        style={{ color }}
      >
        {score}%
      </p>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${score}%`, backgroundColor: color }}
          />
        </div>
        <span
          className="text-[11px] font-medium shrink-0"
          style={{ color }}
        >
          {label}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        {issueCount} {issueCount === 1 ? "issue" : "issues"} found
        {warningCount > 0 && (
          <>
            {" "}
            · {warningCount} {warningCount === 1 ? "warning" : "warnings"}
          </>
        )}
      </p>
    </div>
  );
}

type ClientGridProps = {
  clients: ClientResult[];
  selectedClient: string | null;
  onSelect: (name: string | null) => void;
};

function ClientGrid({ clients, selectedClient, onSelect }: ClientGridProps) {
  return (
    <div className="grid grid-cols-3 gap-1.5 shrink-0">
      {clients.map((client) => (
        <ClientGridCell
          key={client.name}
          client={client}
          isSelected={selectedClient === client.name}
          onSelect={() =>
            onSelect(selectedClient === client.name ? null : client.name)
          }
        />
      ))}
    </div>
  );
}

type ClientGridCellProps = {
  client: ClientResult;
  isSelected: boolean;
  onSelect: () => void;
};

function ClientGridCell({ client, isSelected, onSelect }: ClientGridCellProps) {
  const { primary, secondary } = getClientAbbrev(client.name);
  const color = getScoreColor(client.score);

  return (
    <button
      type="button"
      onClick={onSelect}
      title={`${client.name} — ${client.score}%`}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-md border transition-colors cursor-pointer",
        "w-full h-16 min-w-0 px-0.5",
        isSelected
          ? "border-primary bg-accent"
          : "border-border bg-card/30 hover:bg-accent/60",
      )}
    >
      <span className="text-[11px] font-semibold text-foreground leading-tight">
        {primary}
      </span>
      {secondary ? (
        <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-full">
          {secondary}
        </span>
      ) : (
        <span className="h-[11px]" aria-hidden />
      )}
      <ScoreRing color={color} />
    </button>
  );
}

function ScoreRing({ color }: { color: string }) {
  return (
    <span
      className="mt-0.5 block w-2.5 h-2.5 rounded-full"
      style={{ boxShadow: `0 0 0 2px ${color}` }}
      aria-hidden
    />
  );
}

type ClientIssuesListProps = {
  client: ClientResult;
};

function ClientIssuesList({ client }: ClientIssuesListProps) {
  const color = getScoreColor(client.score);

  return (
    <div className="rounded-lg border border-border overflow-hidden shrink-0 min-w-0">
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <p className="text-xs font-medium text-foreground truncate">
          {client.name}
          <span className="text-muted-foreground font-normal">
            {" "}
            —{" "}
          </span>
          <span style={{ color }} className="font-semibold tabular-nums">
            {client.score}%
          </span>
        </p>
      </div>
      <div className="px-3 py-2 flex flex-col gap-1.5 max-h-48 overflow-y-auto">
        {client.issues.length === 0 ? (
          <p className="text-xs text-green-500 py-1">✓ Full support</p>
        ) : (
          client.issues.slice(0, 10).map((issue, i) => (
            <IssueRow key={i} issue={issue} />
          ))
        )}
        {client.issues.length > 10 && (
          <p className="text-[10px] text-muted-foreground">
            +{client.issues.length - 10} more issues
          </p>
        )}
      </div>
    </div>
  );
}

function IssueRow({ issue }: { issue: Issue }) {
  const isPartial = issue.support === "partial";

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={cn(
          "text-xs shrink-0 w-3 text-center",
          isPartial ? "text-yellow-500" : "text-red-500",
        )}
        aria-hidden
      >
        {isPartial ? "⚠" : "✕"}
      </span>
      <span className="text-[11px] text-foreground truncate flex-1 min-w-0">
        {issue.property}
      </span>
      <span
        className={cn(
          "text-[10px] shrink-0",
          isPartial ? "text-yellow-500" : "text-red-500",
        )}
      >
        {isPartial ? "Partial support" : "Not supported"}
      </span>
    </div>
  );
}
