import { useState, useEffect, useMemo, useRef } from "react";
import { useEditorStore, getActiveCanvas } from "../../store/editor";
import { migrateTemplate } from "@/lib/template-service";
import { templateToHtml } from "@/lib/renderer";
import {
  fetchVersions,
  labelVersion,
  deleteVersion,
} from "@/lib/versionService";
import type { ProjectVersion } from "@/lib/versionService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { usePlanStore } from "@/store/plan";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import {
  HistoryIcon,
  RotateCcwIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import type { Template } from "../../types";

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
}

function VersionPreview({ template }: { template: Template }) {
  const migrated = useMemo(() => migrateTemplate(template), [template]);
  const html = useMemo(() => templateToHtml(migrated), [migrated]);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(480);
  const contentWidth = getActiveCanvas(migrated).globalStyles.contentWidth;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const fitHeight = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;
      const h = Math.max(
        doc.documentElement.scrollHeight,
        doc.body?.scrollHeight ?? 0,
      );
      if (h > 0) setHeight(h);
    };

    iframe.addEventListener("load", fitHeight);
    return () => iframe.removeEventListener("load", fitHeight);
  }, [html]);

  return (
    <div className="w-full h-full min-h-0 overflow-auto rounded-lg border border-border bg-muted">
      <div className="flex justify-center p-4">
        <iframe
          ref={iframeRef}
          srcDoc={html}
          title="Version preview"
          sandbox=""
          className="rounded shadow bg-white border-0 block pointer-events-none"
          style={{
            width: contentWidth,
            maxWidth: "100%",
            height,
          }}
        />
      </div>
    </div>
  );
}

function versionDisplayName(
  version: ProjectVersion,
  index: number,
  total: number,
): string {
  return version.label ?? `Version ${total - index}`;
}

export default function VersionHistoryModal() {
  const { currentProjectId, setTemplate, readOnly } = useEditorStore();
  const { plan } = usePlanStore();
  const canUseVersionHistory = plan === "pro";
  const [open, setOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ProjectVersion | null>(null);
  const [labelingId, setLabelingId] = useState<string | null>(null);
  const [labelValue, setLabelValue] = useState("");

  useEffect(() => {
    if (!open || !currentProjectId) return;
    setLoading(true);
    fetchVersions(currentProjectId)
      .then((v) => {
        setVersions(v);
        if (v.length > 0) setSelected(v[0]);
      })
      .catch((err: unknown) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to load versions",
        ),
      )
      .finally(() => setLoading(false));
  }, [open, currentProjectId]);

  const handleRestore = () => {
    if (!selected || readOnly) return;
    setTemplate(selected.data);
    toast.success("Version restored — remember to save");
    setOpen(false);
  };

  const handleLabel = async (versionId: string) => {
    if (!labelValue.trim()) return;
    try {
      await labelVersion(versionId, labelValue.trim());
      setVersions((v) =>
        v.map((ver) =>
          ver.id === versionId ? { ...ver, label: labelValue.trim() } : ver,
        ),
      );
      if (selected?.id === versionId) {
        setSelected((s) => (s ? { ...s, label: labelValue.trim() } : s));
      }
      setLabelingId(null);
      setLabelValue("");
      toast.success("Version labeled");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to label version",
      );
    }
  };

  const handleDelete = async (versionId: string) => {
    try {
      await deleteVersion(versionId);
      const updated = versions.filter((v) => v.id !== versionId);
      setVersions(updated);
      if (selected?.id === versionId) setSelected(updated[0] ?? null);
      toast.success("Version deleted");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete version",
      );
    }
  };

  if (!currentProjectId) return null;

  const selectedIndex = selected
    ? versions.findIndex((v) => v.id === selected.id)
    : -1;

  const handleOpenHistory = () => {
    if (!canUseVersionHistory) {
      setUpgradeOpen(true);
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="Version history"
      />
      <button
        type="button"
        onClick={handleOpenHistory}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-accent cursor-pointer"
      >
        <HistoryIcon className="w-3.5 h-3.5" />
        History
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-6xl w-[92vw] h-[min(82vh,780px)] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-border shrink-0">
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-border border-t-primary rounded-full animate-spin" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">
                No versions yet. Save your project to create a version.
              </p>
            </div>
          ) : (
            <div className="flex flex-1 overflow-hidden min-h-0">
              <div className="w-64 border-r border-border overflow-y-auto shrink-0">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(version)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(version);
                      }
                    }}
                    className={`group flex flex-col gap-0.5 px-4 py-3 cursor-pointer border-b border-border/50 transition-colors ${
                      selected?.id === version.id
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">
                        {versionDisplayName(version, index, versions.length)}
                      </p>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(version.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2Icon className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(new Date(version.created_at))}
                    </p>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground text-center py-3 px-4">
                  Last {versions.length}/10 versions
                </p>
              </div>

              {selected && (
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className="flex-1 overflow-auto p-4 min-h-0">
                    <VersionPreview template={selected.data} />
                  </div>

                  <div className="px-4 py-2 border-t border-border/50 shrink-0">
                    <p className="text-sm font-medium text-foreground">
                      {versionDisplayName(
                        selected,
                        selectedIndex,
                        versions.length,
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Saved {formatRelativeTime(new Date(selected.created_at))}
                    </p>
                  </div>

                  <div className="border-t border-border px-4 py-3 shrink-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {!readOnly &&
                        (labelingId === selected.id ? (
                          <div className="flex gap-2 flex-1 min-w-0">
                            <Input
                              value={labelValue}
                              onChange={(e) => setLabelValue(e.target.value)}
                              placeholder="Label this version..."
                              className="h-7 text-xs flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleLabel(selected.id);
                                if (e.key === "Escape") setLabelingId(null);
                              }}
                            />
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleLabel(selected.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs"
                              onClick={() => setLabelingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setLabelingId(selected.id);
                              setLabelValue(selected.label ?? "");
                            }}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <TagIcon className="w-3.5 h-3.5" />
                            {selected.label ? "Edit label" : "Add label"}
                          </button>
                        ))}
                    </div>

                    {!readOnly && (
                      <Button
                        size="sm"
                        onClick={handleRestore}
                        className="shrink-0"
                      >
                        <RotateCcwIcon className="w-3.5 h-3.5 mr-1.5" />
                        Restore this version
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
