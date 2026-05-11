import type { SavedTemplate } from "@/lib/template-service";
import { GlobeIcon, LockIcon, Trash2Icon } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useState, useRef } from "react";
import { migrateTemplate, renameTemplate } from "@/lib/template-service";
import { toast } from "sonner";
import { getActiveCanvas } from "@/store/editor";

type ProjectCardProps = {
  project: SavedTemplate;
  onClick: () => void;
  onDelete: () => void;
};

export function ProjectCard({ project, onClick, onDelete }: ProjectCardProps) {
  const template = migrateTemplate(project.data);
  const activeCanvas = getActiveCanvas(template);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleRenameSubmit = async () => {
    setIsRenaming(false);
    if (name === project.name || !name.trim()) {
      setName(project.name);
      return;
    }
    try {
      await renameTemplate(project.id, name);
      toast.success("Project renamed");
    } catch (err: any) {
      toast.error(err.message);
      setName(project.name);
    }
  };

  return (
    <div
      onClick={onClick}
      className="h-48 rounded-xl border border-secondary bg-card hover:border-primary/50 hover:bg-accent transition-all cursor-pointer group flex flex-col overflow-hidden"
    >
      {/* Preview area */}
      <div className="flex-1 bg-muted flex items-center justify-center p-4 overflow-hidden">
        <div
          className="w-full rounded scale-[0.6] origin-top"
          style={{ backgroundColor: activeCanvas.globalStyles.bgColor }}
        >
          {activeCanvas.sections.slice(0, 2).map((section) => (
            <div
              key={section.id}
              style={{
                backgroundColor: section.bgColor,
                padding: `${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px`,
              }}
              className="w-full"
            >
              {section.columns[0]?.blocks.slice(0, 2).map((block) => (
                <div key={block.id} className="mb-1">
                  {block.type === "text" && (
                    <p
                      style={{
                        fontSize: block.fontSize * 0.5,
                        color: block.color,
                        textAlign: block.align,
                      }}
                    >
                      {block.content.slice(0, 40)}
                    </p>
                  )}
                  {block.type === "button" && (
                    <div
                      style={{
                        backgroundColor: block.bgColor,
                        color: block.textColor,
                      }}
                      className="text-[6px] px-2 py-1 rounded inline-block"
                    >
                      {block.label}
                    </div>
                  )}
                  {block.type === "image" && (
                    <div className="w-full h-8 bg-muted rounded" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-border flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          {isRenaming ? (
            <input
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") {
                  setName(project.name);
                  setIsRenaming(false);
                }
              }}
              onClick={(e) => e.stopPropagation()}
              className="text-xs font-medium text-foreground bg-transparent border-b border-primary outline-none w-full"
            />
          ) : (
            <p
              onClick={handleRenameClick}
              className="text-xs font-medium text-foreground truncate hover:text-primary transition-colors"
            >
              {name}
            </p>
          )}
          <div className="flex items-center gap-1">
            {project.is_public ? (
              <GlobeIcon className="w-3 h-3 text-muted-foreground" />
            ) : (
              <LockIcon className="w-3 h-3 text-muted-foreground" />
            )}
            <p className="text-[10px] text-muted-foreground">
              {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <ConfirmationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Delete Project"
          description="Are you sure you want to delete this project? This action cannot be undone."
          trigger={
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDialogOpen(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer ml-2 shrink-0"
            >
              <Trash2Icon className="w-3.5 h-3.5" />
            </button>
          }
          actionText="Delete"
          onAction={() => onDelete()}
        />
      </div>
    </div>
  );
}
