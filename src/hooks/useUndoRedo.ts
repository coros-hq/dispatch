import { useEffect } from "react";
import { useEditorStore } from "@/store/editor";

export function useUndoRedo() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        useEditorStore.temporal.getState().undo();
      }

      if (modifier && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        useEditorStore.temporal.getState().redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
