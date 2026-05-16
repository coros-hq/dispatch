import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editor";
import {
  templateToHtml,
  templateToHtmlAllPages,
  templateToReactCode,
} from "../../lib/renderer";
import SendTestModal from "./SendTestModal";
import EmailPreviewModal from "./EmailPreviewModal";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Logo from "@/assets/logo.svg";
import { useNavigate } from "react-router";
import { signOut } from "@/lib/auth";
import {
  ArrowLeftIcon,
  LogOutIcon,
  Redo2Icon,
  Undo2Icon,
  MonitorIcon,
  SmartphoneIcon,
  MoreHorizontalIcon,
  UserIcon,
  CodeIcon,
  FileDownIcon,
  LayoutTemplateIcon,
} from "lucide-react";
import SaveTemplateModal from "./SaveTemplateModal";
import VersionHistoryModal from "./VersionHistoryModal";
import { updateTemplate } from "@/lib/template-service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Toolbar() {
  const renameTemplate = useEditorStore((s) => s.renameTemplate);
  const { undo, redo, pastStates, futureStates } =
    useEditorStore.temporal.getState();
  const [copied, setCopied] = useState<"html" | "html-all" | "code" | null>(
    null,
  );
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
  const readOnly = useEditorStore((s) => s.readOnly);
  const canEdit = !readOnly;
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | null>(null);

  const copy = (
    text: string,
    kind: "html" | "html-all" | "code",
  ) => {
    navigator.clipboard.writeText(text);
    setCopied(kind);
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
    if (!currentProjectId || !canEdit) return;
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
  }, [currentProjectId, template, canEdit]);

  const allLayoutCount = template.pages.reduce(
    (n, p) => n + p.canvases.length,
    0,
  );

  return (
    <header className="h-12 bg-card flex items-center justify-between px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <Separator orientation="vertical" className="h-4" />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => undo()}
          disabled={!canEdit || pastStates.length === 0}
          className="text-muted-foreground hover:text-foreground"
        >
          <Undo2Icon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => redo()}
          disabled={!canEdit || futureStates.length === 0}
          className="text-muted-foreground hover:text-foreground"
        >
          <Redo2Icon className="w-4 h-4" />
        </Button>
        {currentProjectId && <VersionHistoryModal />}
        <Separator orientation="vertical" className="h-4" />
        <div className="flex items-center gap-2">
          <img src={Logo} alt="Dispatch Logo" className="w-6 h-6" />
          <input
            value={template.name}
            onChange={(e) => renameTemplate(e.target.value)}
            readOnly={!canEdit}
            className="text-sm text-foreground bg-transparent border-b border-transparent focus:border-border outline-none transition-colors w-32 disabled:opacity-70"
          />
        </div>
        {saveStatus === "saving" && (
          <span className="text-[10px] text-muted-foreground animate-pulse">
            Saving...
          </span>
        )}
        {saveStatus === "saved" && (
          <span className="text-[10px] text-muted-foreground">✓ Saved</span>
        )}
      </div>

      {/* Center */}
      <div className="flex items-center gap-1 border border-border rounded-md p-0.5">
        <Button
          variant={previewWidth === "desktop" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setPreviewWidth("desktop")}
        >
          <MonitorIcon className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant={previewWidth === "mobile" ? "secondary" : "ghost"}
          size="sm"
          className="h-7 px-2"
          onClick={() => setPreviewWidth("mobile")}
        >
          <SmartphoneIcon className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <Button
          variant={mode === "preview" ? "default" : "outline"}
          size="sm"
          onClick={handleTemplates}
        >
          <LayoutTemplateIcon className="w-3.5 h-3.5 mr-2" />
          Templates
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
            >
              <MoreHorizontalIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => copy(templateToReactCode(template), "code")}
            >
              <CodeIcon className="w-4 h-4 mr-2" />
              {copied === "code" ? "✓ Copied" : "Copy React code (active page)"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => copy(templateToHtml(template), "html")}
            >
              <FileDownIcon className="w-4 h-4 mr-2" />
              {copied === "html" ? "✓ Copied" : "Export HTML (active page)"}
            </DropdownMenuItem>
            {allLayoutCount > 1 && (
              <DropdownMenuItem
                onClick={() =>
                  copy(templateToHtmlAllPages(template), "html-all")
                }
              >
                <FileDownIcon className="w-4 h-4 mr-2" />
                {copied === "html-all"
                  ? "✓ Copied"
                  : `Export HTML (all ${allLayoutCount} layouts)`}
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserIcon className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <EmailPreviewModal />
        <SendTestModal />
        {canEdit && (
          <span data-tour="toolbar-save">
            <SaveTemplateModal />
          </span>
        )}
      </div>
    </header>
  );
}
