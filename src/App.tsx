import BlockPanel from "./components/panel/BlockPanel";
import PropsPanel from "./components/panel/PropsPanel";
import Canvas from "./components/canvas/Canvas";
import DndProvider from "./components/DndProvider";
import CodePane from "./components/editor/CodePane";
import LinterPanel from "./components/panel/LinterPanel";
import TemplatePanel from "./components/panel/TemplatePanel";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "./store/editor";
import Toolbar from "./components/toolbar/ToolBar";
import { useEffect } from "react";
import { updateTemplate } from "./lib/template-service";
import { useUndoRedo } from "./hooks/useUndoRedo";

export default function App() {
  const { template, currentProjectId, mode } = useEditorStore();
  useUndoRedo();
  useEffect(() => {
    if (!currentProjectId) return;

    const interval = setInterval(async () => {
      try {
        await updateTemplate(currentProjectId, template, false);
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [currentProjectId, template]);

  return (
    <DndProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Toolbar />
        <Separator />
        <div className="flex flex-1 overflow-hidden">
          {/* Left — sections + block palette */}
          <aside className="w-48 border-r border-border bg-card shrink-0 overflow-y-auto">
            <BlockPanel />
          </aside>

          {/* Center — canvas */}
          <main
            className="flex-1 overflow-y-auto bg-muted"
            onClick={() => useEditorStore.getState().select({ type: "none" })}
          >
            <Canvas />
          </main>

          {/* Right — template gallery or editor panels */}
          <aside className="w-[380px] border-l border-border bg-card shrink-0 overflow-hidden flex flex-col">
            {mode === "preview" ? (
              <TemplatePanel />
            ) : (
              <>
                <div className="overflow-y-auto">
                  <PropsPanel />
                </div>
                <Separator />
                <div className="h-[240px] shrink-0 overflow-hidden">
                  <CodePane />
                </div>
                <Separator />
                <div className="h-[200px] shrink-0 overflow-hidden">
                  <LinterPanel />
                </div>
              </>
            )}
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
