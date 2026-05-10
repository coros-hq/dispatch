import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editor";
import { templateToHtml, templateToReactCode } from "../../lib/renderer";
import SendTestModal from "./SendTestModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/assets/logo.svg";
import { useNavigate } from "react-router";
import { signOut } from "@/lib/auth";
import { ArrowLeftIcon, LogOutIcon } from "lucide-react";
import SaveTemplateModal from "./SaveTemplateModal";
import { updateTemplate } from "@/lib/template-service";

export default function Toolbar() {
  const renameTemplate = useEditorStore((s) => s.renameTemplate);
  const [copied, setCopied] = useState<"html" | "code" | null>(null);
  const {
    mode,
    setMode,
    setPreviewTemplate,
    previewWidth,
    setPreviewWidth,
    template,
    currentProjectId,
  } = useEditorStore();
  const navigate = useNavigate();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);

  const copy = (text: string, type: "html" | "code") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in");
  };

  const handleTemplates = () => {
    if (mode === "edit") {
      setMode("preview");
      setPreviewTemplate(null);
    } else {
      setMode("edit");
      setPreviewTemplate(null);
    }
  };

  useEffect(() => {
    if (!currentProjectId) return;

    const interval = setInterval(async () => {
      setSaveStatus("saving");
      try {
        await updateTemplate(currentProjectId, template, false);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus(null), 2000);
      } catch {
        setSaveStatus(null);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentProjectId, template]);

  return (
    <header className="h-12 bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div className="flex flex-row justify-center items-center gap-2">
          <img src={Logo} alt="Dispatch Logo" className="w-8 h-8" />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Dispatch
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <input
          value={template.name}
          onChange={(e) => renameTemplate(e.target.value)}
          className="text-xs text-muted-foreground bg-transparent border-b border-transparent focus:border-border focus:text-foreground outline-none transition-colors w-32"
        />
        {saveStatus === "saving" && (
          <span className="text-[10px] text-muted-foreground animate-pulse">
            Saving...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="text-[10px] text-muted-foreground">✓ Saved</span>
        )}
      </div>

      <div className="flex flex-row items-center gap-3">
        <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
          <Button
            variant={previewWidth === "desktop" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPreviewWidth("desktop")}
          >
            Desktop
          </Button>
          <Button
            variant={previewWidth === "mobile" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={() => setPreviewWidth("mobile")}
          >
            Mobile
          </Button>
        </div>
        <Separator orientation="vertical" className="bg-white" />
        <Button
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={handleTemplates}
        >
          Templates
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copy(templateToReactCode(template), "code")}
        >
          {copied === "code" ? "✓ Copied" : "Copy code"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copy(templateToHtml(template), "html")}
        >
          {copied === "html" ? "✓ Copied" : "Export HTML"}
        </Button>
        <SendTestModal />
        <SaveTemplateModal />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOutIcon className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
