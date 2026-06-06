const SUGGESTED_PROMPTS = [
  "Add a hero section with a dark background",
  "Add a button that says 'Get Started'",
  "What block types are available?",
  "Add a footer with unsubscribe link",
];

export function SuggestedPrompts({
  onSelect,
}: {
  onSelect: (p: string) => void;
}) {
  return (
    <div className="px-3 pb-3 flex flex-wrap gap-1.5">
      {SUGGESTED_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onSelect(prompt)}
          className="text-xs px-2.5 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border transition-colors cursor-pointer"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
