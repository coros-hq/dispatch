import type { SavedTemplate } from "@/lib/template-service";
import { MoreHorizontalIcon, PencilIcon, CopyIcon, Trash2Icon } from "lucide-react";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { useState, useRef } from "react";
import { migrateTemplate, renameTemplate, saveTemplate } from "@/lib/template-service";
import { toast } from "sonner";
import { getActiveCanvas } from "@/store/editor";
import { timeAgo } from "@/lib/time";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ProjectCardProps = {
  project: SavedTemplate;
  onClick: () => void;
  onDelete?: () => void;
  onDuplicated?: (project: SavedTemplate) => void;
  canRename?: boolean;
};

export function ProjectCard({
  project,
  onClick,
  onDelete,
  onDuplicated,
  canRename = true,
}: ProjectCardProps) {
  const template = migrateTemplate(project.data);
  const activeCanvas = getActiveCanvas(template);
  const canvasCount = template.pages.reduce(
    (sum, page) => sum + page.canvases.length,
    0,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [name, setName] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const startRename = () => {
    if (!canRename) return;
    setIsRenaming(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
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

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    setIsDuplicating(true);
    try {
      const copy = await saveTemplate(
        { ...template, name: `${project.name} copy` },
        project.is_public,
        project.category,
        project.team_id,
      );
      toast.success("Project duplicated");
      onDuplicated?.(copy);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to duplicate project",
      );
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="rounded-xl border border-border bg-card hover:border-clay/50 motion-safe:hover:-translate-y-0.5 transition-[transform,border-color] duration-200 cursor-pointer group flex flex-col overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Preview strip */}
      <div className="relative h-[110px] bg-muted/60 overflow-hidden shrink-0">
        <div
          className="w-full h-full flex flex-col"
          style={{ backgroundColor: activeCanvas.globalStyles.bgColor }}
        >
          {activeCanvas.sections.slice(0, 2).map((section) => (
            <div
              key={section.id}
              style={{
                backgroundColor: section.bgColor,
                padding: `${section.paddingTop * 0.4}px ${section.paddingRight * 0.4}px ${section.paddingBottom * 0.4}px ${section.paddingLeft * 0.4}px`,
              }}
              className="w-full"
            >
              {section.columns[0]?.blocks.slice(0, 2).map((block) => (
                <div key={block.id} className="mb-1 overflow-hidden">
                  {block.type === "text" && (
                    <p
                      style={{
                        fontSize: Math.max(block.fontSize * 0.4, 6),
                        color: block.color,
                        textAlign: block.align,
                      }}
                      className="leading-tight"
                    >
                      {block.content.slice(0, 60)}
                    </p>
                  )}
                  {block.type === "button" && (
                    <div
                      style={{
                        backgroundColor: block.bgColor,
                        color: block.textColor,
                      }}
                      className="text-[6px] px-1.5 py-0.5 rounded inline-block"
                    >
                      {block.label}
                    </div>
                  )}
                  {block.type === "image" && (
                    <div className="w-full h-6 bg-black/10 rounded-sm" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <span className="absolute top-2 right-2 text-[10px] font-medium leading-none text-foreground/90 bg-background/80 backdrop-blur-sm px-1.5 py-1 rounded-md">
          {canvasCount} {canvasCount === 1 ? "canvas" : "canvases"}
        </span>
      </div>

      {/* Body */}
      <div className="relative px-3.5 py-3 border-t border-border flex items-start justify-between gap-2">
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
              className="text-sm font-medium text-foreground bg-transparent border-b border-clay outline-none w-full"
            />
          ) : (
            <p className="text-sm font-medium text-foreground truncate">
              {name}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Edited {timeAgo(project.updated_at)}
          </p>
        </div>

        {(canRename || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                aria-label="Project options"
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-md text-muted-foreground opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 hover:bg-accent hover:text-foreground transition-[opacity,background-color,color] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-card"
              >
                <MoreHorizontalIcon className="w-4 h-4" strokeWidth={1.75} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {canRename && (
                <DropdownMenuItem onClick={startRename}>
                  <PencilIcon className="w-3.5 h-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                <CopyIcon className="w-3.5 h-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => setIsDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2Icon className="w-3.5 h-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {onDelete && (
          <ConfirmationDialog
            isOpen={isDialogOpen}
            onClose={() => setIsDialogOpen(false)}
            title="Delete project"
            description="Are you sure you want to delete this project? This action cannot be undone."
            trigger={<span className="hidden" />}
            actionText="Delete"
            onAction={() => onDelete()}
          />
        )}
      </div>
    </div>
  );
}
