import { useAssistant } from "@/hooks/useAssistant";
import { ChatDrawer } from "./ChatDrawer";
import { FloatingButton } from "./FloatingButton";

export function ChatPanel() {
  const { isOpen, togglePanel, closePanel, entries } = useAssistant();

  // Show activity dot when there are assistant messages and panel is closed
  const hasActivity = entries.some(
    (e) => e.role === "assistant" && e.status === "done",
  );

  return (
    <>
      <ChatDrawer isOpen={isOpen} onClose={closePanel} />
      <FloatingButton
        isOpen={isOpen}
        onClick={togglePanel}
        hasActivity={hasActivity}
      />
    </>
  );
}
