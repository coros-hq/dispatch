import { useAssistant } from "@/hooks/useAssistant";
import { SparkleIcon, TrashIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { MessageBubble } from "./MessageBubble";
import { SuggestedPrompts } from "./SuggestedPrompt";
import { InputBar } from "./InputBar";
import { cn } from "@/lib/utils";

export function ChatDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { entries, isLoading, send, clearHistory } = useAssistant();
  const bottomRef = useRef<HTMLDivElement>(null);
  const showSuggestions = entries.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  return (
    <div
      className={cn(
        "fixed bottom-20 right-4 w-80 z-50",
        "bg-card border border-border rounded-2xl shadow-2xl shadow-black/60",
        "flex flex-col overflow-hidden",
        "transition-all duration-200 ease-out origin-bottom-right",
        isOpen
          ? "opacity-100 scale-100 pointer-events-auto"
          : "opacity-0 scale-95 pointer-events-none",
      )}
      style={{ maxHeight: "min(520px, calc(100vh - 120px))" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
            <SparkleIcon className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground leading-none">
              Mailshot AI
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              {isLoading ? "Thinking…" : "Ready to help"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <button
              onClick={clearHistory}
              title="Clear conversation"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
            >
              <TrashIcon className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8 gap-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-1">
              <SparkleIcon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-foreground">How can I help?</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ask me to build a template, add blocks, or explain anything about
              the editor.
            </p>
          </div>
        ) : (
          entries.map((entry) => <MessageBubble key={entry.id} entry={entry} />)
        )}
        <div ref={bottomRef} />
      </div>

      {showSuggestions && <SuggestedPrompts onSelect={(p) => send(p)} />}

      <InputBar onSend={send} isLoading={isLoading} />
    </div>
  );
}
