import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import Toolbar from "./components/toolbar/ToolBar";
import BlockPanel from "./components/panel/BlockPanel";
import PropsPanel from "./components/panel/PropsPanel";
import Canvas from "./components/canvas/Canvas";
import DndProvider from "./components/DndProvider";
import CodePane from "./components/editor/CodePane";
import CanvasTabs from "./components/canvas/CanvasTabs";
import TemplatePanel from "./components/panel/TemplatePanel";
import CompatibilityReport from "./components/panel/CompatibilityReport";
import { Separator } from "@/components/ui/separator";
import { useEditorStore } from "./store/editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function App() {
  const mode = useEditorStore((s) => s.mode);

  return (
    <DndProvider>
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
        <Toolbar />
        <Separator />
        <ResizablePanelGroup
          orientation="horizontal"
          className="flex-1 overflow-hidden"
        >
          {/* Left — block palette */}
          <ResizablePanel defaultSize={350} minSize={200} maxSize={350}>
            <aside className="h-full bg-card overflow-y-auto">
              <BlockPanel />
            </aside>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Center — canvas */}
          <ResizablePanel defaultSize={20}>
            <main
              className="h-full overflow-hidden bg-muted flex flex-col"
              onClick={() => useEditorStore.getState().select({ type: "none" })}
            >
              <div className="flex-1 overflow-y-auto">
                <Canvas />
              </div>
              {mode !== "preview" && <CanvasTabs />}
            </main>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right — props + code + compatibility */}
          <ResizablePanel defaultSize={350} minSize={200} maxSize={350}>
            <aside className="h-full bg-card overflow-hidden flex flex-col">
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
                    <CompatibilityReport />
                  </TabsContent>
                </Tabs>
              )}
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </DndProvider>
  );
}
