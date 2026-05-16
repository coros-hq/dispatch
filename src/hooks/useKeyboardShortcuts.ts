import { useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { saveTemplate, updateTemplate } from "@/lib/template-service";
import { saveVersion } from "@/lib/versionService";
import { toast } from "sonner";

export function useKeyboardShortcuts() {
  const readOnly = useEditorStore((s) => s.readOnly);

  useEffect(() => {
    if (readOnly) return;

    const handleKeyDown = async (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      if (modifier && e.key === "s") {
        e.preventDefault();
        const { template, currentProjectId, setCurrentProjectId } =
          useEditorStore.getState();
        try {
          if (currentProjectId) {
            await updateTemplate(currentProjectId, template, false);
            await saveVersion(currentProjectId, template);
            toast.success("Saved");
          } else {
            const saved = await saveTemplate(template, false);
            setCurrentProjectId(saved.id);
            await saveVersion(saved.id, template);
            toast.success("Project saved");
          }
        } catch (err: unknown) {
          toast.error(err instanceof Error ? err.message : "Failed to save");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readOnly]);
}
