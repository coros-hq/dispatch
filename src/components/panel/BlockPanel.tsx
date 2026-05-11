import { useDraggable } from "@dnd-kit/core";
import { useEditorStore } from "../../store/editor";
import { Separator } from "@/components/ui/separator";

const BLOCKS = [
  {
    label: "Text",
    icon: "T",
    description: "Heading or paragraph",
    default: {
      type: "text" as const,
      content: "New text block",
      fontSize: 16,
      color: "#111111",
      align: "left" as const,
      fontWeight: "normal" as const,
    },
  },
  {
    label: "Image",
    icon: "⌗",
    description: "Embed an image",
    default: {
      type: "image" as const,
      src: "https://placehold.co/600x200",
      alt: "Image",
      width: 600,
    },
  },
  {
    label: "Button",
    icon: "⬡",
    description: "Call to action",
    default: {
      type: "button" as const,
      label: "Click me",
      href: "https://example.com",
      bgColor: "#111111",
      textColor: "#ffffff",
      borderRadius: 6,
    },
  },
  {
    label: "Divider",
    icon: "—",
    description: "Horizontal rule",
    default: { type: "divider" as const, color: "#dddddd", thickness: 1 },
  },
  {
    label: "Spacer",
    icon: "↕",
    description: "Vertical spacing",
    default: { type: "spacer" as const, height: 24 },
  },
  {
    label: "Social links",
    icon: "⇋",
    description: "Social media icons",
    default: {
      type: "social" as const,
      links: [
        { platform: "twitter" as const, url: "https://twitter.com" },
        { platform: "linkedin" as const, url: "https://linkedin.com" },
        { platform: "github" as const, url: "https://github.com" },
      ],
      align: "center" as const,
      iconSize: 24,
      iconColor: "#111111",
    },
  },
  {
    label: "Product card",
    icon: "⊡",
    description: "Image, title, price, CTA",
    default: {
      type: "product-card" as const,
      image: "https://placehold.co/600x300",
      title: "Product Name",
      description: "A short description of your product goes here.",
      price: "$49.00",
      buttonLabel: "Buy now",
      buttonHref: "https://example.com",
      buttonBgColor: "#111111",
      buttonTextColor: "#ffffff",
    },
  },
  {
    label: "Unsubscribe",
    icon: "⊗",
    description: "Footer with unsubscribe link",
    default: {
      type: "unsubscribe" as const,
      companyName: "Your Company",
      address: "123 Street, City, Country",
      unsubscribeUrl: "https://example.com/unsubscribe",
      textColor: "#aaaaaa",
      fontSize: 12,
    },
  },
  {
    label: "Divider text",
    icon: "⋯",
    description: "Horizontal rule with text",
    default: {
      type: "divider-text" as const,
      text: "• • •",
      color: "#dddddd",
      fontSize: 14,
    },
  },
];

const SECTIONS = [
  { label: "Full width", icon: "▬", columns: 1 as const },
  { label: "Two columns", icon: "⊟", columns: 2 as const },
  { label: "Three columns", icon: "☰", columns: 3 as const },
];

function DraggablePaletteItem({ block }: { block: (typeof BLOCKS)[number] }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${block.label}`,
    data: { isPaletteItem: true, blockDefault: block.default },
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      title={block.description}
      className={`flex flex-col border border-border items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors cursor-grab active:cursor-grabbing text-center ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <span className="w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground text-sm font-mono group-hover:text-foreground shrink-0">
        {block.icon}
      </span>
      <p className="text-[10px] text-muted-foreground leading-tight w-full truncate">
        {block.label}
      </p>
    </div>
  );
}

export default function BlockPanel() {
  const { addSection } = useEditorStore();

  return (
    <div className="p-3 flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Sections
        </p>
        <div className="grid grid-cols-3 gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              onClick={() => addSection(s.columns)}
              title={s.label}
              className="flex flex-col border border-border items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <span className="w-8 h-8 flex items-center justify-center rounded-md bg-muted text-muted-foreground text-sm">
                {s.icon}
              </span>
              <p className="text-[10px] text-muted-foreground leading-tight truncate w-full text-center">
                {s.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Blocks
        </p>
        <div className="grid grid-cols-2 gap-1">
          {BLOCKS.map((block) => (
            <DraggablePaletteItem key={block.label} block={block} />
          ))}
        </div>
      </div>
    </div>
  );
}
