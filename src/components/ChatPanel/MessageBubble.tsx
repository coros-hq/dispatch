import { cn } from "@/lib/utils";
import type { ChatEntry } from "@/types/assistant";
import { BoltIcon, SparkleIcon } from "lucide-react";
import { ThinkingDots } from "./ThinkkingDots";
import { MessageContent } from "./MessageContent";

export function MessageBubble({ entry }: { entry: ChatEntry }) {
  const isUser = entry.role === "user";
  const isThinking = entry.status === "sending";
  const isError = entry.status === "error";

  function formatActionLabel(type: string): string {
    const labels: Record<string, string> = {
      add_block: "Block added",
      update_block: "Block updated",
      remove_block: "Block removed",
      add_section: "Section added",
      remove_section: "Section removed",
      reorder_sections: "Sections reordered",
      load_template: "Template loaded",
    };
    return labels[type] ?? "Change applied";
  }

  return (
    <div
      className={cn(
        "flex gap-2.5 group",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5">
          <SparkleIcon className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : isError
              ? "bg-destructive/10 text-destructive border border-destructive/30 rounded-tl-sm"
              : "bg-muted text-foreground rounded-tl-sm",
        )}
      >
        {isThinking ? (
          <ThinkingDots />
        ) : (
          <MessageContent content={entry.content} />
        )}

        {/* Action badge */}
        {entry.appliedActions && entry.appliedActions.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border flex items-center gap-1.5">
            <BoltIcon className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              {entry.appliedActions.length === 1
                ? formatActionLabel(entry.appliedActions[0].type)
                : `${entry.appliedActions.length} changes applied`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
