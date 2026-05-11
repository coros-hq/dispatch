import type { Block } from "../../types";

type Props = { block: Block };

const SOCIAL_ICONS: Record<string, string> = {
  twitter: "𝕏",
  linkedin: "in",
  instagram: "📷",
  github: "⌥",
  facebook: "f",
  youtube: "▶",
};

export default function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case "text":
      return (
        <div className="px-6 py-3">
          <p
            style={{
              fontSize: block.fontSize,
              color: block.color,
              textAlign: block.align,
              fontWeight: block.fontWeight,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {block.content}
          </p>
        </div>
      );

    case "image":
      return (
        <div className="px-6 py-3">
          <img
            src={block.src}
            alt={block.alt}
            style={{
              width: "100%",
              maxWidth: block.width,
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      );

    case "button":
      return (
        <div className="px-6 py-4 flex justify-center">
          <a
            href={block.href}
            style={{
              backgroundColor: block.bgColor,
              color: block.textColor,
              borderRadius: block.borderRadius,
              padding: "10px 24px",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              display: "inline-block",
            }}
          >
            {block.label}
          </a>
        </div>
      );

    case "divider":
      return (
        <div className="px-6 py-2">
          <hr
            style={{
              borderColor: block.color,
              borderWidth: block.thickness,
              borderStyle: "solid",
              margin: 0,
            }}
          />
        </div>
      );

    case "spacer":
      return <div style={{ height: block.height }} />;

    case "social":
      return (
        <div className="px-6 py-4" style={{ textAlign: block.align }}>
          <div style={{ display: "inline-flex", gap: 12 }}>
            {block.links.map((link, i) => (
              <a
                key={i}
                href={link.url}
                style={{
                  color: block.iconColor,
                  textDecoration: "none",
                  fontSize: block.iconSize,
                }}
              >
                {SOCIAL_ICONS[link.platform]}
              </a>
            ))}
          </div>
        </div>
      );

    case "product-card":
      return (
        <div className="px-6 py-4">
          {block.image && (
            <img
              src={block.image}
              alt={block.title}
              style={{
                width: "100%",
                display: "block",
                borderRadius: 8,
                marginBottom: 12,
              }}
            />
          )}
          <p
            style={{
              margin: "0 0 4px",
              fontSize: 18,
              fontWeight: "bold",
              color: "#111111",
            }}
          >
            {block.title}
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: 14,
              color: "#555555",
              lineHeight: 1.5,
            }}
          >
            {block.description}
          </p>
          {block.price && (
            <p
              style={{
                margin: "0 0 12px",
                fontSize: 20,
                fontWeight: "bold",
                color: "#111111",
              }}
            >
              {block.price}
            </p>
          )}
          <a
            href={block.buttonHref}
            style={{
              display: "inline-block",
              backgroundColor: block.buttonBgColor,
              color: block.buttonTextColor,
              padding: "10px 24px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            {block.buttonLabel}
          </a>
        </div>
      );

    case "unsubscribe":
      return (
        <div className="px-6 py-4 text-center">
          <p
            style={{
              margin: "0 0 4px",
              fontSize: block.fontSize,
              color: block.textColor,
            }}
          >
            {block.companyName}
          </p>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: block.fontSize,
              color: block.textColor,
            }}
          >
            {block.address}
          </p>
          <a
            href={block.unsubscribeUrl}
            style={{ fontSize: block.fontSize, color: block.textColor }}
          >
            Unsubscribe
          </a>
        </div>
      );

    case "divider-text":
      return (
        <div className="px-6 py-3 flex items-center gap-3">
          <hr
            style={{
              flex: 1,
              borderColor: block.color,
              borderStyle: "solid",
              borderWidth: block.fontSize > 14 ? 2 : 1,
            }}
          />
          <span
            style={{
              fontSize: block.fontSize,
              color: block.color,
              whiteSpace: "nowrap",
            }}
          >
            {block.text}
          </span>
          <hr
            style={{
              flex: 1,
              borderColor: block.color,
              borderStyle: "solid",
              borderWidth: block.fontSize > 14 ? 2 : 1,
            }}
          />
        </div>
      );
  }
}
