import { useState } from "react";
import { useEditorStore } from "../../store/editor";
import { pageToHtml } from "@/lib/renderer";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  MonitorIcon,
  SmartphoneIcon,
  XIcon,
  CodeIcon,
} from "lucide-react";
import { toast } from "sonner";

export default function EmailPreviewModal() {
  const template = useEditorStore((s) => s.template);
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const activePage =
    template.pages.find((p) => p.id === template.activePageId) ??
    template.pages[0];

  const html = activePage ? pageToHtml(activePage) : "";
  const previewWidth = width === "mobile" ? 375 : 600;

  const handleCopy = () => {
    if (!html) return;
    navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("HTML copied");
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!activePage}
        className="gap-1.5"
      >
        Preview email
      </Button>

      {activePage && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            showCloseButton={false}
            className="max-w-[95vw] w-[95vw] h-[95vh] flex flex-col p-0 gap-0 sm:max-w-[95vw]"
          >
            <div className="flex items-center justify-between px-6 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {template.name} — {activePage.name}
                </p>
                <span className="text-xs text-muted-foreground">
                  {activePage.canvases.length} canvas
                  {activePage.canvases.length !== 1 ? "es" : ""} merged
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
                  <Button
                    variant={width === "desktop" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setWidth("desktop")}
                  >
                    <MonitorIcon className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant={width === "mobile" ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => setWidth("mobile")}
                  >
                    <SmartphoneIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <CodeIcon className="w-3.5 h-3.5 mr-1.5" />
                  {copied ? "✓ Copied" : "Export HTML"}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-zinc-900 flex items-start justify-center py-8">
              <div
                style={{ width: previewWidth }}
                className="shadow-2xl"
              >
                <iframe
                  key={html}
                  title="Email preview"
                  srcDoc={html}
                  style={{
                    width: "100%",
                    border: "none",
                    display: "block",
                    minHeight: "600px",
                  }}
                  onLoad={(e) => {
                    const iframe = e.target as HTMLIFrameElement;
                    if (iframe.contentDocument?.body) {
                      iframe.style.height =
                        iframe.contentDocument.body.scrollHeight + "px";
                    }
                  }}
                />
              </div>
            </div>

            <div className="border-t border-border px-6 py-2 shrink-0 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest mr-2 shrink-0">
                Canvas order
              </span>
              {activePage.canvases.map((canvas, i) => (
                <div
                  key={canvas.id}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded shrink-0"
                >
                  <span className="text-[10px] text-muted-foreground/50">
                    {i + 1}
                  </span>
                  {canvas.name}
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
