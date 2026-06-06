import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import type { Block, CountdownBlock, HeroBlock } from "../../types";
import { getCountdownParts, starSegments } from "../../lib/block-helpers";

type Props = { block: Block };

function CountdownBlockPreview({ block }: { block: CountdownBlock }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const bg = block.bgColor ?? "#f4f7fb";
  const fg = block.textColor ?? "#0f172a";
  const ac = block.accentColor ?? "#2563eb";
  const ta = block.align ?? "center";
  const ld = block.labelDays ?? "Days";
  const lh = block.labelHours ?? "Hours";
  const lm = block.labelMinutes ?? "Minutes";
  const ls = block.labelSeconds ?? "Secs";
  const parts = getCountdownParts(block.targetDateIso, now);

  const cellStyle: CSSProperties = {
    backgroundColor: ac,
    borderRadius: 10,
    minWidth: 64,
    padding: "12px 10px",
    textAlign: "center",
  };

  const digitStyle = (px: number): CSSProperties => ({
    margin: 0,
    fontSize: px,
    fontWeight: 700,
    lineHeight: 1,
    color: "#ffffff",
  });

  const labelStyle: CSSProperties = {
    margin: "8px 0 0",
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.92)",
  };

  return (
    <div style={{ padding: "22px 20px", backgroundColor: bg, textAlign: ta }}>
      {block.headline && (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: fg,
          }}
        >
          {block.headline}
        </p>
      )}
      {parts.expired ? (
        <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: fg }}>
          {block.expiredMessage ?? "This offer has ended"}
        </p>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              justifyContent:
                ta === "center"
                  ? "center"
                  : ta === "right"
                    ? "flex-end"
                    : "flex-start",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {[
              [parts.days, ld, 28] as const,
              [parts.hours, lh, 28] as const,
              [parts.minutes, lm, 28] as const,
              [parts.seconds, ls, 22] as const,
            ].map(([n, lbl, fs]) => (
              <div
                key={lbl}
                style={{ ...cellStyle, minWidth: fs >= 26 ? 68 : 60 }}
              >
                <p style={digitStyle(fs)}>{n}</p>
                <p style={labelStyle}>{lbl}</p>
              </div>
            ))}
          </div>
          <p
            style={{
              margin: "14px 0 0",
              fontSize: 11,
              color: fg,
              opacity: 0.55,
            }}
          >
            Seconds tick here; exported HTML includes a tiny script so it moves
            in browsers. Many inbox clients strip scripts and show a frozen
            frame.
          </p>
        </>
      )}
    </div>
  );
}
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
      const Tag = block.href ? "a" : "p";
      return (
        <Tag
          href={block.href}
          style={{
            margin: 0,
            fontSize: block.fontSize,
            color: block.color,
            textAlign: block.align,
            fontWeight: block.fontWeight,
            lineHeight: block.lineHeight ?? 1.5,
            letterSpacing: block.letterSpacing
              ? `${block.letterSpacing}px`
              : undefined,
            textDecoration: block.textDecoration ?? "none",
            backgroundColor: block.bgColor ?? "transparent",
            paddingTop: block.paddingTop ?? 4,
            paddingBottom: block.paddingBottom ?? 4,
            paddingLeft: block.paddingLeft ?? 0,
            paddingRight: block.paddingRight ?? 0,
            display: "block",
            cursor: block.href ? "pointer" : "default",
          }}
        >
          {block.content}
        </Tag>
      );

    case "image": {
      const fit = block.objectFit ?? "cover";
      const img = (
        <img
          src={block.src}
          alt={block.alt}
          style={{
            width: "100%",
            maxWidth: block.width,
            height: block.height != null ? block.height : "auto",
            display: "block",
            borderRadius: block.borderRadius ?? 0,
            objectFit: fit,
          }}
        />
      );
      return (
        <div
          style={{
            backgroundColor: block.bgColor ?? "transparent",
            paddingTop: block.paddingTop ?? 0,
            paddingBottom: block.paddingBottom ?? 0,
            paddingLeft: block.paddingLeft ?? 0,
            paddingRight: block.paddingRight ?? 0,
          }}
        >
          {block.linkHref?.trim() ? (
            <a
              href={block.linkHref.trim()}
              style={{
                display: "block",
                textDecoration: "none",
                border: "none",
              }}
            >
              {img}
            </a>
          ) : (
            img
          )}
        </div>
      );
    }

    case "button":
      return (
        <div
          style={{
            textAlign: block.align ?? "center",
            paddingTop: block.paddingTop ?? 8,
            paddingBottom: block.paddingBottom ?? 8,
            paddingLeft: block.paddingLeft ?? 0,
            paddingRight: block.paddingRight ?? 0,
          }}
        >
          <a
            href={block.href}
            style={{
              display: "inline-block",
              backgroundColor: block.bgColor,
              color: block.textColor,
              padding: "10px 24px",
              borderRadius: block.borderRadius,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 500,
              border: block.borderWidth
                ? `${block.borderWidth}px solid ${block.borderColor ?? block.bgColor}`
                : "none",
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

    case "product-card": {
      const aspectRatioMap: Record<string, string> = {
        "1:1": "100%",
        "4:3": "75%",
        "16:9": "56.25%",
        "3:2": "66.66%",
      };
      const paddingTop = aspectRatioMap[block.imageAspectRatio ?? "16:9"];

      return (
        <div
          style={{
            backgroundColor: block.cardBgColor ?? "#ffffff",
            border: `${block.cardBorderWidth ?? 0}px solid ${block.cardBorderColor ?? "transparent"}`,
            borderRadius: block.cardBorderRadius ?? 0,
            padding: block.cardPadding ?? 16,
            fontFamily: "inherit",
            textAlign: block.cardAlign ?? "left",
          }}
        >
          {/* Image */}
          <div
            style={{
              position: "relative",
              width: "100%",
              paddingTop,
              overflow: "hidden",
              borderRadius: block.imageBorderRadius ?? 0,
              marginBottom: 12,
            }}
          >
            <img
              src={block.image}
              alt={block.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: block.titleFontSize ?? 18,
              fontWeight: block.titleFontWeight ?? "600",
              fontFamily: block.titleFontFamily ?? "inherit",
              color: block.titleColor ?? "#111111",
              marginBottom: 6,
            }}
          >
            {block.title}
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: block.descriptionFontSize ?? 14,
              fontFamily: block.descriptionFontFamily ?? "inherit",
              color: block.descriptionColor ?? "#555555",
              marginBottom: 10,
              lineHeight: 1.5,
            }}
          >
            {block.description}
          </div>

          {/* Price */}
          <div
            style={{
              fontSize: block.priceFontSize ?? 16,
              fontWeight: block.priceFontWeight ?? "700",
              color: block.priceColor ?? "#111111",
              marginBottom: 14,
            }}
          >
            {block.price}
          </div>

          {/* Button */}
          <a
            href={block.buttonHref}
            style={{
              display: "inline-block",
              backgroundColor: block.buttonBgColor,
              color: block.buttonTextColor,
              fontSize: block.buttonFontSize ?? 14,
              fontWeight: "600",
              borderRadius: block.buttonBorderRadius ?? 4,
              padding: `${block.buttonPaddingY ?? 10}px ${block.buttonPaddingX ?? 20}px`,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            {block.buttonLabel}
          </a>
        </div>
      );
    }

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

    case "countdown":
      return <CountdownBlockPreview block={block} />;

    case "testimonial": {
      const bg = block.bgColor ?? "#ffffff";
      const fg = block.textColor ?? "#334155";
      const authorC = block.authorColor ?? "#0f172a";
      const accent = block.accentColor ?? "#6366f1";
      const ta = block.align ?? "left";
      const initial = (block.authorName?.trim()?.[0] ?? "?").toUpperCase();
      return (
        <div
          style={{ padding: "18px 24px", backgroundColor: bg, textAlign: ta }}
        >
          <div
            style={{
              borderLeft: `4px solid ${accent}`,
              paddingLeft: 16,
              maxWidth: ta === "center" ? 480 : undefined,
              margin: ta === "center" ? "0 auto" : undefined,
            }}
          >
            <p
              style={{
                margin: "0 0 14px",
                fontSize: 16,
                lineHeight: 1.55,
                fontStyle: "italic",
                color: fg,
              }}
            >
              {block.quote}
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  ta === "center"
                    ? "center"
                    : ta === "right"
                      ? "flex-end"
                      : "flex-start",
                gap: 12,
              }}
            >
              {block.avatarSrc ? (
                <img
                  src={block.avatarSrc}
                  alt=""
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: accent,
                    color: "#fff",
                    fontSize: 16,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {initial}
                </div>
              )}
              <div style={{ textAlign: "left" }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 700,
                    color: authorC,
                  }}
                >
                  {block.authorName}
                </p>
                {block.authorTitle && (
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: 13,
                      color: fg,
                      opacity: 0.8,
                    }}
                  >
                    {block.authorTitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    case "coupon": {
      const bg = block.bgColor ?? "#fdfdfd";
      const border = block.borderColor ?? "#1e293b";
      const fg = block.textColor ?? "#0f172a";
      const fs = block.codeFontSize ?? 22;
      const ta = block.align ?? "center";
      return (
        <div style={{ padding: "14px 20px", textAlign: ta }}>
          <div
            style={{
              display: "inline-block",
              border: `2px dashed ${border}`,
              borderRadius: 14,
              backgroundColor: bg,
              padding: "18px 28px",
              minWidth: 200,
            }}
          >
            <div
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                fontSize: fs,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: fg,
              }}
            >
              {block.code}
            </div>
            {block.description && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 13,
                  color: fg,
                  opacity: 0.75,
                }}
              >
                {block.description}
              </p>
            )}
          </div>
        </div>
      );
    }

    case "rating": {
      const max = block.maxStars ?? 5;
      const { full, half, empty } = starSegments(block.rating, max);
      const sc = block.starColor ?? "#f59e0b";
      const ec = block.emptyStarColor ?? "#e2e8f0";
      const size = block.starSize ?? 22;
      const ta = block.align ?? "center";
      return (
        <div style={{ padding: "12px 20px", textAlign: ta }}>
          <div>
            {Array.from({ length: full }, (_, i) => (
              <span
                key={`f-${i}`}
                style={{
                  fontSize: size,
                  color: sc,
                  marginRight: 2,
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ))}
            {half ? (
              <span
                style={{
                  fontSize: size,
                  color: sc,
                  opacity: 0.5,
                  marginRight: 2,
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ) : null}
            {Array.from({ length: empty }, (_, i) => (
              <span
                key={`e-${i}`}
                style={{
                  fontSize: size,
                  color: ec,
                  marginRight: 2,
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ))}
          </div>
          {block.label && (
            <p style={{ margin: "10px 0 0", fontSize: 13, color: "#64748b" }}>
              {block.label}
            </p>
          )}
        </div>
      );
    }

    case "nav-bar": {
      const bg = block.bgColor ?? "#ffffff";
      const lc = block.linkColor ?? "#0f172a";
      const lw = block.logoWidth ?? 132;
      return (
        <div
          style={{
            padding: "12px 20px",
            backgroundColor: bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <img
            src={block.logoSrc}
            alt={block.logoAlt}
            style={{ maxWidth: lw, height: "auto", display: "block" }}
          />
          <nav
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 16,
              justifyContent: "flex-end",
            }}
          >
            {block.links.map((l, i) => (
              <a
                key={i}
                href={l.href}
                style={{
                  color: lc,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      );
    }

    case "image-grid": {
      const cols = block.columns;
      const list =
        block.images.length > 0
          ? block.images
          : [{ src: "https://placehold.co/400x280", alt: "" }];
      return (
        <div style={{ padding: `0 ${block.gap / 2}px` }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gap: block.gap,
            }}
          >
            {list.map((im, i) => (
              <img
                key={`${im.src}-${i}`}
                src={im.src || "https://placehold.co/400x280"}
                alt={im.alt}
                style={{
                  width: "100%",
                  display: "block",
                  borderRadius: block.borderRadius,
                  height: "auto",
                }}
              />
            ))}
          </div>
        </div>
      );
    }

    case "logo-strip": {
      const ta = block.align;
      const jc =
        ta === "center" ? "center" : ta === "right" ? "flex-end" : "flex-start";
      return (
        <div
          style={{
            backgroundColor: block.bgColor,
            padding: "16px 12px",
            display: "flex",
            justifyContent: jc,
            flexWrap: "wrap",
            gap: block.gap,
            alignItems: "center",
          }}
        >
          {block.logos.map((logo, i) => {
            const img = (
              <img
                src={logo.src}
                alt={logo.alt}
                style={{
                  height: block.logoHeight,
                  width: "auto",
                  maxWidth: "100%",
                  display: "block",
                  objectFit: "contain",
                }}
              />
            );
            return logo.href?.trim() ? (
              <a
                key={i}
                href={logo.href.trim()}
                style={{ textDecoration: "none", lineHeight: 0 }}
              >
                {img}
              </a>
            ) : (
              <span key={i} style={{ lineHeight: 0 }}>
                {img}
              </span>
            );
          })}
        </div>
      );
    }

    case "hero":
      return <HeroBlockPreview block={block} />;
  }
}

function HeroBlockPreview({ block }: { block: HeroBlock }) {
  const al = block.align ?? "center";
  const ta = al as CSSProperties["textAlign"];
  const minH = block.minHeight ?? 300;
  const bgImage = block.backgroundImage?.trim();
  const tc = block.textColor ?? "#ffffff";
  return (
    <div
      style={{
        minHeight: minH,
        backgroundImage: bgImage ? `url(${bgImage})` : undefined,
        backgroundColor: bgImage
          ? undefined
          : (block.backgroundColor ?? "#1a1a1a"),
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div
        style={{
          minHeight: minH,
          backgroundColor: block.overlayColor ?? "rgba(0,0,0,0)",
          padding: "40px 28px",
          textAlign: ta,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems:
            al === "center"
              ? "center"
              : al === "right"
                ? "flex-end"
                : "flex-start",
          boxSizing: "border-box",
        }}
      >
        {block.title && (
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: 28,
              lineHeight: 1.2,
              fontWeight: 700,
              color: tc,
              maxWidth: 480,
            }}
          >
            {block.title}
          </h1>
        )}
        {block.subtitle && (
          <p
            style={{
              margin: "0 0 22px",
              fontSize: 16,
              lineHeight: 1.5,
              color: tc,
              opacity: 0.95,
              maxWidth: 480,
            }}
          >
            {block.subtitle}
          </p>
        )}
        {block.buttonLabel && (
          <a
            href={block.buttonHref ?? "#"}
            style={{
              display: "inline-block",
              backgroundColor: block.buttonBgColor ?? "#ffffff",
              color: block.buttonTextColor ?? "#000000",
              padding: "12px 26px",
              borderRadius: 6,
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {block.buttonLabel}
          </a>
        )}
      </div>
    </div>
  );
}
