import { migrateTemplate, type SavedTemplate } from "@/lib/template-service";
import { getActiveCanvas } from "@/store/editor";
import { Trash2Icon } from "lucide-react";

type TemplateCardProps = {
  template: SavedTemplate;
  isSelected: boolean;
  onClick: () => void;
  showDelete: boolean;
  onDelete?: (e: React.MouseEvent) => void;
};

export function TemplateCard({
  template,
  isSelected,
  onClick,
  showDelete,
  onDelete,
}: TemplateCardProps) {
  const data = migrateTemplate(template.data);
  const activeCanvas = getActiveCanvas(data);

  if (!activeCanvas) return null;

  const sections = activeCanvas.sections;

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${
        isSelected
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50 hover:bg-accent"
      }`}
    >
      <div>
        <p className="text-xs font-medium text-foreground">{template.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-[10px] text-muted-foreground">
            {sections.length} section
            {sections.length !== 1 ? "s" : ""}
          </p>
          {template.is_public && !template.is_default && (
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              public
            </span>
          )}
        </div>
      </div>
      {showDelete && (
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
        >
          <Trash2Icon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
