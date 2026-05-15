import { useEffect, useState } from "react";
import { useEditorStore } from "../../store/editor";
import { fetchTemplates, deleteTemplate } from "@/lib/template-service";
import type { SavedTemplate } from "@/lib/template-service";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth";
import type { Template } from "@/types";
import { migrateTemplate } from "@/lib/template-service";
import { TemplateCard } from "../canvas/TemplateCard";
import { useNavigate } from "react-router";

export default function TemplatePanel() {
  const { setMode, setPreviewTemplate, setTemplate, setCurrentProjectId } =
    useEditorStore();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] =
    useState<SavedTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTemplates()
      .then(setTemplates)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleClick = (t: SavedTemplate) => {
    setSelectedTemplate(t);
    setPreviewTemplate(migrateTemplate(t.data) as Template);
  };

  const handleUse = () => {
    if (!selectedTemplate) return;
    const data = migrateTemplate(selectedTemplate.data) as Template;
    setTemplate(data);
    setCurrentProjectId(null);
    setMode("edit");
    setPreviewTemplate(null);
  };

  const handleCancel = () => {
    setMode("edit");
    setPreviewTemplate(null);
    setSelectedTemplate(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
        setPreviewTemplate(null);
      }
      toast.success("Template deleted");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const defaultTemplates = templates.filter((t) => t.is_default);
  const myTemplates = templates.filter(
    (t) => !t.is_default && t.user_id === user?.id,
  );
  const publicTemplates = templates.filter(
    (t) => !t.is_default && t.is_public && t.user_id !== user?.id,
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Templates
        </span>
        <button
          onClick={handleCancel}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          ✕ Cancel
        </button>
      </div>
      <Separator />

      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-4">
        {loading ? (
          <p className="text-xs text-muted-foreground text-center mt-6">
            Loading templates...
          </p>
        ) : (
          <>
            {/* Default templates */}
            {defaultTemplates.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-1">
                  Starter
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {defaultTemplates.map((t) => (
                    <TemplateCard
                      key={t.id}
                      template={t}
                      isSelected={selectedTemplate?.id === t.id}
                      onClick={() => handleClick(t)}
                      showDelete={false}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* My templates */}
            {myTemplates.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-1">
                  My templates
                </p>
                {myTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    isSelected={selectedTemplate?.id === t.id}
                    onClick={() => handleClick(t)}
                    showDelete={true}
                    onDelete={(e) => handleDelete(e, t.id)}
                  />
                ))}
              </div>
            )}

            {/* Public templates */}
            {publicTemplates.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest px-1">
                  Community
                </p>
                {publicTemplates.map((t) => (
                  <TemplateCard
                    key={t.id}
                    template={t}
                    isSelected={selectedTemplate?.id === t.id}
                    onClick={() => handleClick(t)}
                    showDelete={false}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Separator />
      <div className="p-3 flex flex-col gap-2">
        <Button
          onClick={handleUse}
          disabled={!selectedTemplate}
          className="w-full"
          size="sm"
        >
          Use this template
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/templates")}
          className="text-muted-foreground hover:text-foreground"
        >
          Check All Templates
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          className="w-full"
          size="sm"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
