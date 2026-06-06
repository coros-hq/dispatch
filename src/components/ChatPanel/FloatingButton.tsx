import { cn } from "@/lib/utils";
import { SparkleIcon, XIcon } from "lucide-react";
import { Button } from "../ui/button";

export function FloatingButton({
  isOpen,
  onClick,
  hasActivity,
}: {
  isOpen: boolean;
  onClick: () => void;
  hasActivity: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      title="AI Assistant"
      className={cn(
        "fixed bottom-4 right-4 z-50",
        "w-12 h-12 rounded-2xl shadow-lg shadow-black/40",
        "flex items-center justify-center",
        "transition-all duration-200 cursor-pointer",
        isOpen
          ? "bg-accent hover:bg-accent/80 rotate-0 scale-95"
          : "bg-secondary hover:scale-105",
      )}
    >
      {isOpen ? (
        <XIcon className="w-5 h-5 text-foreground" />
      ) : (
        <SparkleIcon className="w-5 h-5 text-primary" />
      )}

      {/* Unread dot */}
      {hasActivity && !isOpen && (
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary border-2 border-card" />
      )}
    </Button>
  );
}
