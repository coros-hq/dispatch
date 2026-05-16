import { useDraggable } from "@dnd-kit/core";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownUp,
  Columns2,
  Columns3,
  GalleryHorizontal,
  Grid3x3,
  ImageIcon,
  LayoutGrid,
  MailX,
  Minus,
  MoreHorizontal,
  MousePointerClick,
  PanelTop,
  Quote,
  RectangleHorizontal,
  Share2,
  Sparkles,
  Star,
  Tag,
  Timer,
  Type,
} from "lucide-react";
import { useEditorStore } from "../../store/editor";
import { Separator } from "@/components/ui/separator";

type BlockPaletteItem = {
  label: string;
  icon: LucideIcon;
  description: string;
  default: (typeof BLOCK_DEFAULTS)[number];
};

const ICON_CLASS = "w-[17px] h-[17px]";
const ICON_STROKE = 1.65;

/** Icon + default payload (kept separate so typed `default` stays narrow). */
const BLOCK_DEFAULTS = [
  {
    type: "text" as const,
    content: "New text block",
    fontSize: 16,
    color: "#111111",
    align: "left" as const,
    fontWeight: "normal" as const,
  },
  {
    type: "image" as const,
    src: "https://placehold.co/600x200",
    alt: "Image",
    width: 600,
  },
  {
    type: "button" as const,
    label: "Click me",
    href: "https://example.com",
    bgColor: "#111111",
    textColor: "#ffffff",
    borderRadius: 6,
  },
  {
    type: "divider" as const,
    color: "#dddddd",
    thickness: 1,
  },
  {
    type: "spacer" as const,
    height: 24,
  },
  {
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
  {
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
  {
    type: "unsubscribe" as const,
    companyName: "Your Company",
    address: "123 Street, City, Country",
    unsubscribeUrl: "https://example.com/unsubscribe",
    textColor: "#aaaaaa",
    fontSize: 12,
  },
  {
    type: "divider-text" as const,
    text: "• • •",
    color: "#dddddd",
    fontSize: 14,
  },
  {
    type: "countdown" as const,
    targetDateIso: "2030-01-01T00:00:00.000Z",
    headline: "Sale ends soon",
    expiredMessage: "This offer has ended",
    bgColor: "#f4f7fb",
    textColor: "#0f172a",
    accentColor: "#2563eb",
    align: "center" as const,
  },
  {
    type: "testimonial" as const,
    quote:
      "Dispatch made our launch emails effortless—open rates doubled in a week.",
    authorName: "Alex Morgan",
    authorTitle: "Head of Growth, Acme",
    avatarSrc: "https://placehold.co/88x88/png?text=AM",
    accentColor: "#6366f1",
    textColor: "#334155",
    authorColor: "#0f172a",
    bgColor: "#ffffff",
    align: "left" as const,
  },
  {
    type: "coupon" as const,
    code: "DISPATCH50",
    description: "Use at checkout",
    bgColor: "#fdfdfd",
    borderColor: "#1e293b",
    textColor: "#0f172a",
    codeFontSize: 22,
    align: "center" as const,
  },
  {
    type: "rating" as const,
    rating: 4.5,
    maxStars: 5,
    starColor: "#f59e0b",
    emptyStarColor: "#e2e8f0",
    label: "4.5 average from 120 reviews",
    align: "center" as const,
    starSize: 22,
  },
  {
    type: "nav-bar" as const,
    logoSrc: "https://placehold.co/160x40/png?text=Logo",
    logoAlt: "Brand",
    logoWidth: 132,
    links: [
      { label: "Shop", href: "https://example.com" },
      { label: "Blog", href: "https://example.com/blog" },
      { label: "Account", href: "https://example.com/account" },
    ],
    bgColor: "#ffffff",
    linkColor: "#0f172a",
  },
  {
    type: "image-grid" as const,
    images: [
      { src: "https://placehold.co/400x260/png?text=1", alt: "" },
      { src: "https://placehold.co/400x260/png?text=2", alt: "" },
      { src: "https://placehold.co/400x260/png?text=3", alt: "" },
    ],
    columns: 3,
    gap: 12,
    borderRadius: 8,
  },
  {
    type: "logo-strip" as const,
    logos: [
      { src: "https://placehold.co/100x40/png?text=A", alt: "Partner A" },
      { src: "https://placehold.co/100x40/png?text=B", alt: "Partner B" },
      { src: "https://placehold.co/100x40/png?text=C", alt: "Partner C" },
    ],
    align: "center" as const,
    logoHeight: 36,
    gap: 28,
    bgColor: "#f8fafc",
  },
  {
    type: "hero" as const,
    backgroundImage: "https://placehold.co/1200x600/png?text=Hero",
    title: "Your headline here",
    subtitle: "Supporting copy goes here. Keep it short and compelling.",
    buttonLabel: "Learn more",
    buttonHref: "https://example.com",
    buttonBgColor: "#ffffff",
    buttonTextColor: "#0f172a",
    overlayColor: "rgba(15,23,42,0.55)",
    textColor: "#ffffff",
    align: "center" as const,
    minHeight: 320,
  },
] as const;

const BLOCKS: BlockPaletteItem[] = [
  {
    label: "Text",
    icon: Type,
    description: "Heading or paragraph",
    default: BLOCK_DEFAULTS[0],
  },
  {
    label: "Image",
    icon: ImageIcon,
    description: "Embed an image",
    default: BLOCK_DEFAULTS[1],
  },
  {
    label: "Button",
    icon: MousePointerClick,
    description: "Call to action",
    default: BLOCK_DEFAULTS[2],
  },
  {
    label: "Divider",
    icon: Minus,
    description: "Horizontal rule",
    default: BLOCK_DEFAULTS[3],
  },
  {
    label: "Spacer",
    icon: ArrowDownUp,
    description: "Vertical spacing",
    default: BLOCK_DEFAULTS[4],
  },
  {
    label: "Social links",
    icon: Share2,
    description: "Social media icons",
    default: BLOCK_DEFAULTS[5],
  },
  {
    label: "Product card",
    icon: LayoutGrid,
    description: "Image, title, price, CTA",
    default: BLOCK_DEFAULTS[6],
  },
  {
    label: "Unsubscribe",
    icon: MailX,
    description: "Footer with unsubscribe link",
    default: BLOCK_DEFAULTS[7],
  },
  {
    label: "Divider text",
    icon: MoreHorizontal,
    description: "Horizontal rule with text",
    default: BLOCK_DEFAULTS[8],
  },
  {
    label: "Countdown",
    icon: Timer,
    description: "Countdown to a date — ticks in exported HTML in browsers",
    default: BLOCK_DEFAULTS[9],
  },
  {
    label: "Quote",
    icon: Quote,
    description: "Testimonial with author & avatar",
    default: BLOCK_DEFAULTS[10],
  },
  {
    label: "Coupon",
    icon: Tag,
    description: "Dashed promo code box",
    default: BLOCK_DEFAULTS[11],
  },
  {
    label: "Rating",
    icon: Star,
    description: "Star rating row",
    default: BLOCK_DEFAULTS[12],
  },
  {
    label: "Navigation",
    icon: PanelTop,
    description: "Logo + link row",
    default: BLOCK_DEFAULTS[13],
  },
  {
    label: "Image grid",
    icon: Grid3x3,
    description: "2–4 column responsive grid",
    default: BLOCK_DEFAULTS[14],
  },
  {
    label: "Logo strip",
    icon: GalleryHorizontal,
    description: "Partner / sponsor row",
    default: BLOCK_DEFAULTS[15],
  },
  {
    label: "Hero",
    icon: Sparkles,
    description: "Full-width image with text + CTA",
    default: BLOCK_DEFAULTS[16],
  },
];

const SECTIONS: {
  label: string;
  icon: LucideIcon;
  columns: 1 | 2 | 3;
}[] = [
  { label: "Full width", icon: RectangleHorizontal, columns: 1 },
  { label: "Two columns", icon: Columns2, columns: 2 },
  { label: "Three columns", icon: Columns3, columns: 3 },
];

function PaletteIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="w-8 h-8 flex items-center justify-center rounded-md bg-muted shrink-0 text-muted-foreground group-hover:text-foreground transition-colors">
      <Icon className={ICON_CLASS} strokeWidth={ICON_STROKE} aria-hidden />
    </span>
  );
}

function DraggablePaletteItem({ block }: { block: BlockPaletteItem }) {
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
      className={`group flex flex-col border border-border items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors cursor-grab active:cursor-grabbing text-center ${
        isDragging ? "opacity-40" : ""
      }`}
    >
      <PaletteIcon icon={block.icon} />
      <p className="text-[10px] text-muted-foreground leading-tight w-full truncate">
        {block.label}
      </p>
    </div>
  );
}

export default function BlockPanel() {
  const { addSection, readOnly } = useEditorStore();

  return (
    <fieldset
      disabled={readOnly}
      className="p-3 flex flex-col gap-4 border-0 m-0 min-w-0 disabled:opacity-50"
      data-tour="block-panel"
    >
      <div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-2 px-1">
          Sections
        </p>
        <div className="grid grid-cols-3 gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => addSection(s.columns)}
              title={s.label}
              className="group flex flex-col border border-border items-center gap-1.5 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
            >
              <PaletteIcon icon={s.icon} />
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
    </fieldset>
  );
}
