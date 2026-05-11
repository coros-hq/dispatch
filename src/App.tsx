import BlockPanel from "./components/panel/BlockPanel";
import PropsPanel from "./components/panel/PropsPanel";
import Canvas from "./components/canvas/Canvas";
import DndProvider from "./components/DndProvider";
import CodePane from "./components/editor/CodePane";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TemplatePanel from "./components/panel/TemplatePanel";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "./store/editor";
import Toolbar from "./components/toolbar/ToolBar";
import { useEffect } from "react";
import { updateTemplate } from "./lib/template-service";
import { useUndoRedo } from "./hooks/useUndoRedo";
import CanvasTabs from "./components/canvas/CanvasTabs";
import CompatibilityReportPanel from "./components/panel/CompatibilityReport";

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
            className="flex-1 overflow-hidden bg-muted flex flex-col"
            onClick={() => useEditorStore.getState().select({ type: "none" })}
          >
            <div className="flex-1 overflow-y-auto">
              <Canvas />
            </div>
            <CanvasTabs />
          </main>
          {/* Right — template gallery or editor panels */}
          <aside className="w-[380px] border-l border-border bg-card shrink-0 overflow-hidden flex flex-col">
            {mode === "preview" ? (
              <TemplatePanel />
            ) : (
              <Tabs defaultValue="props" className="flex flex-col h-full">
                <TabsList className="w-full shrink-0 rounded-none border-b border-border justify-start px-2 h-10">
                  <TabsTrigger value="props" className="text-xs">
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="code" className="text-xs">
                    Code
                  </TabsTrigger>
                  <TabsTrigger value="compatibility" className="text-xs">
                    Compatibility
                  </TabsTrigger>
                </TabsList>
                <TabsContent
                  value="props"
                  className="flex-1 overflow-y-auto m-0"
                >
                  <PropsPanel />
                </TabsContent>
                <TabsContent
                  value="code"
                  className="flex-1 overflow-hidden m-0"
                >
                  <CodePane />
                </TabsContent>
                <TabsContent
                  value="compatibility"
                  className="flex-1 overflow-hidden m-0"
                >
                  <CompatibilityReportPanel />
                </TabsContent>
              </Tabs>
            )}
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
