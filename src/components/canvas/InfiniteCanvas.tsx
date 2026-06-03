import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useEditorStore, getActivePage } from "../../store/editor";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SectionRow from "./SectionRow";
import { PlusIcon, Maximize2Icon } from "lucide-react";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;
const ZOOM_STEP = 0.1;

export default function InfiniteCanvas() {
  const { template, select, addCanvas, mode, previewTemplate, previewWidth, readOnly } =
    useEditorStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 80, y: 80 });
  const [zoom, setZoom] = useState(0.8);
  const isPanning = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const activeTemplate =
    mode === "preview" && previewTemplate ? previewTemplate : template;

  const googleFontUrls = useMemo(() => {
    const urls = new Set<string>();
    for (const p of activeTemplate.pages) {
      for (const c of p.canvases) {
        const u = c.globalStyles.googleFontCssImportUrl;
        if (u) urls.add(u);
      }
    }
    return [...urls].sort();
  }, [activeTemplate]);

  const activePage = getActivePage(activeTemplate);

  useEffect(() => {
    for (const url of googleFontUrls) {
      const id =
        "mailshot-gfont-" +
        url.replace(/[^a-zA-Z0-9]+/g, "_").slice(0, 96);
      if (document.getElementById(id)) continue;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = url;
      document.head.appendChild(link);
    }
  }, [googleFontUrls]);

  // Pan with middle mouse or space+drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || e.altKey) {
      isPanning.current = true;
      lastMouse.current = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Zoom with scroll
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z + delta)));
    } else {
      setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // Fit all canvases in view
  const handleFit = () => {
    setPan({ x: 80, y: 80 });
    setZoom(0.8);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "=") {
        e.preventDefault();
        setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP));
      }
      if (mod && e.key === "-") {
        e.preventDefault();
        setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP));
      }
      if (mod && e.key === "0") {
        e.preventDefault();
        handleFit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-muted cursor-default select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={() => select({ type: "none" })}
      data-tour="infinite-canvas"
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
          backgroundPosition: `${pan.x}px ${pan.y}px`,
        }}
      />

      {/* Canvas world */}
      <div
        style={{
          position: "absolute",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {activePage.canvases.map((canvas) => (
          <CanvasFrame
            key={canvas.id}
            canvas={canvas}
            isActive={canvas.id === activePage.activeCanvasId}
            isPreview={mode === "preview"}
            previewWidth={previewWidth}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
          className="text-muted-foreground hover:text-foreground text-sm w-6 h-6 flex items-center justify-center cursor-pointer"
        >
          −
        </button>
        <span className="text-xs text-muted-foreground w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
          className="text-muted-foreground hover:text-foreground text-sm w-6 h-6 flex items-center justify-center cursor-pointer"
        >
          +
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        <button
          onClick={handleFit}
          className="text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <Maximize2Icon className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-border mx-1" />
        {!readOnly && (
          <button
            onClick={addCanvas}
            className="text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 text-xs"
            data-tour="add-canvas"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Add variant
          </button>
        )}
      </div>

      {/* Zoom hint */}
      <div className="absolute top-3 right-3 text-[10px] text-muted-foreground/40 pointer-events-none">
        Scroll to pan · Cmd+scroll to zoom · Alt+drag to pan
      </div>
    </div>
  );
}

type CanvasFrameProps = {
  canvas: any;
  isActive: boolean;
  isPreview: boolean;
  previewWidth: "desktop" | "mobile";
};

function CanvasFrame({
  canvas,
  isActive,
  isPreview,
  previewWidth,
}: CanvasFrameProps) {
  const { setActiveCanvas, addSection, select } = useEditorStore();
  const width =
    previewWidth === "mobile" ? 375 : canvas.globalStyles.contentWidth;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCanvas(canvas.id);
    select({ type: "none" });
  };

  return (
    <div
      style={{
        position: "absolute",
        left: canvas.x,
        top: canvas.y,
        width,
      }}
      onClick={handleClick}
    >
      {/* Canvas label */}
      <div
        className={`absolute -top-7 left-0 text-xs font-medium transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground"
        }`}
      >
        {canvas.name}
      </div>

      {/* Canvas frame */}
      <div
        className={`rounded-xl overflow-hidden shadow-2xl transition-all ${
          isActive ? "ring-2 ring-primary" : "ring-1 ring-border"
        } ${isPreview ? "pointer-events-none" : ""}`}
        style={{
          backgroundColor: canvas.globalStyles.bgColor,
          width,
          fontFamily: canvas.globalStyles.fontFamily,
        }}
      >
        <SortableContext
          items={canvas.sections.map((s: any) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {canvas.sections.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                ✉
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Start building
                </p>
                <p className="text-xs text-muted-foreground/50 mt-1">
                  Add a section to get started
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addSection(1);
                }}
                className="text-xs px-4 py-2 rounded-lg bg-muted border border-border text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
              >
                + Add first section
              </button>
            </div>
          ) : (
            canvas.sections.map((section: any) => (
              <SectionRow key={section.id} section={section} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
