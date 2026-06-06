import { SendIcon } from "lucide-react";
import { useRef, useState } from "react";

export function InputBar({
  onSend,
  isLoading,
}: {
  onSend: (message: string) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  };

  return (
    <div className="p-3 border-t border-border">
      <div className="flex items-end gap-2 bg-muted rounded-xl px-3 py-2 border border-border focus-within:border-primary/60 transition-colors">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything…"
          rows={1}
          disabled={isLoading}
          className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none leading-relaxed min-h-[24px] max-h-24 disabled:opacity-50"
        />
        <button
          onClick={submit}
          disabled={!value.trim() || isLoading}
          className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary hover:bg-primary/80 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors cursor-pointer"
        >
          <SendIcon className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
      </div>
      <p className="text-center text-[10px] text-muted-foreground mt-1.5">
        Shift+Enter for new line
      </p>
    </div>
  );
}
