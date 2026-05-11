import { useState } from "react";
import { useEditorStore, getActiveCanvas } from "../../store/editor";
import { generateCompatibilityReport } from "@/lib/compatibilityEngine";
import type {
  CompatibilityReport,
  ClientResult,
} from "@/lib/compatibilityEngine";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

export default function CompatibilityReportPanel() {
  const { template } = useEditorStore();
  const [report, setReport] = useState<CompatibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedClient, setExpandedClient] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const activeCanvas = getActiveCanvas(template);
      const result = await generateCompatibilityReport(activeCanvas);
      setReport(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getSupportBadge = (support: "yes" | "partial" | "no") => {
    if (support === "no")
      return (
        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">
          No support
        </span>
      );
    if (support === "partial")
      return (
        <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded">
          Partial
        </span>
      );
    return null;
  };

  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        {!report && !loading && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-xs text-muted-foreground text-center">
              Run a compatibility check to see how your email renders across
              clients
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
            {report.clients.map((client) => (
              <ClientCard
                key={client.name}
                client={client}
                isExpanded={expandedClient === client.name}
                onToggle={() =>
                  setExpandedClient(
                    expandedClient === client.name ? null : client.name,
                  )
                }
                getScoreColor={getScoreColor}
                getBarColor={getBarColor}
                getSupportBadge={getSupportBadge}
              />
            ))}

            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerate}
              className="w-full mt-2"
            >
              Re-run check
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

type ClientCardProps = {
  client: ClientResult;
  isExpanded: boolean;
  onToggle: () => void;
  getScoreColor: (score: number) => string;
  getBarColor: (score: number) => string;
  getSupportBadge: (support: "yes" | "partial" | "no") => React.ReactNode;
};

function ClientCard({
  client,
  isExpanded,
  onToggle,
  getScoreColor,
  getBarColor,
  getSupportBadge,
}: ClientCardProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors cursor-pointer"
      >
        <span className="text-xs text-muted-foreground">
          {isExpanded ? (
            <ChevronDownIcon className="w-3 h-3" />
          ) : (
            <ChevronRightIcon className="w-3 h-3" />
          )}
        </span>
        <span className="text-xs font-medium text-foreground flex-1 text-left">
          {client.name}
        </span>
        <span
          className={`text-xs font-semibold ${getScoreColor(client.score)}`}
        >
          {client.score}%
        </span>
      </button>

      {/* Score bar */}
      <div className="h-1 bg-muted w-full">
        <div
          className={`h-full transition-all ${getBarColor(client.score)}`}
          style={{ width: `${client.score}%` }}
        />
      </div>

      {/* Issues */}
      {isExpanded && (
        <div className="px-3 py-2 flex flex-col gap-2">
          {client.issues.length === 0 ? (
            <p className="text-xs text-green-400 py-1">✓ Full support</p>
          ) : (
            client.issues.slice(0, 10).map((issue, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <p className="text-[11px] text-muted-foreground flex-1">
                  {issue.property}
                </p>
                {getSupportBadge(issue.support)}
              </div>
            ))
          )}
          {client.issues.length > 10 && (
            <p className="text-[10px] text-muted-foreground">
              +{client.issues.length - 10} more issues
            </p>
          )}
        </div>
      )}
    </div>
  );
}
