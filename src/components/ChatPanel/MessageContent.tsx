export function MessageContent({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  function formatInline(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="font-mono text-xs bg-accent px-1 py-0.5 rounded"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  }

  return (
    <>
      {paragraphs.map((para, i) => {
        const lines = para.split("\n");
        return (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {formatInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}
