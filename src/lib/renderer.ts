import type {
  Block,
  Canvas,
  Column,
  Page,
  Section,
  Template,
} from "../types";
import { getCountdownParts, starSegments } from "./block-helpers";
import { getActiveCanvas } from "../store/editor";

type RenderCtx = { contentWidth: number };

function columnValign(v?: Column["verticalAlign"]): string {
  if (v === "middle") return "middle";
  if (v === "bottom") return "bottom";
  return "top";
}

/** Minimal entity escape for text nodes in HTML email. */
function escapeHtmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cssUrl(value: string): string {
  return value.replace(/\\/g, "/").replace(/'/g, "%27");
}

/** Safe for embedding in HTML double-quoted attributes. */
export function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/\r|\n|\t/g, " ");
}

function canvasHasCountdown(canvas: Canvas): boolean {
  return canvas.sections.some((s) =>
    s.columns.some((c) => c.blocks.some((b) => b.type === "countdown")),
  );
}

/** Minimal IIFE so exported HTML countdowns tick in browsers; stripped in many email clients → static markup remains. */
function countdownInlineScript(): string {
  return `<script>
(function(){
function dcParts(iso){
  var t=Date.parse(iso);
  if(isNaN(t)) return {ex:1,d:0,h:0,m:0,s:0};
  var x=t-Date.now();
  if(x<=0) return {ex:1,d:0,h:0,m:0,s:0};
  var d=Math.floor(x/864e5); x-=d*864e5;
  var h=Math.floor(x/36e5); x-=h*36e5;
  var m=Math.floor(x/6e4); x-=m*6e4;
  var s=Math.floor(x/1e3);
  return {ex:0,d:d,h:h,m:m,s:s};
}
function tick(root){
  var iso=root.getAttribute("data-mailshot-countdown"); if(!iso) return;
  var msg=root.getAttribute("data-mailshot-expired")||"Ended";
  var live=root.querySelector("[data-dc-live]");
  var ex=root.querySelector("[data-dc-expired]");
  if(!live||!ex) return;
  var p=dcParts(iso), txt=root.querySelector("[data-dc-expired-text]");
  if(p.ex){
    live.style.display="none";
    ex.style.display="block";
    if(txt) txt.textContent=msg;
    return;
  }
  ex.style.display="none";
  live.style.display="";
  function set(k,v){var n=root.querySelector('[data-dc="'+k+'"]'); if(n)n.textContent=String(v);}
  set("d",p.d); set("h",p.h); set("m",p.m); set("s",p.s);
}
function run(){document.querySelectorAll("[data-mailshot-countdown]").forEach(tick);}
run(); setInterval(run,1000);
})();
<\/script>`;
}

function renderBlock(block: Block, ctx: RenderCtx): string {
  switch (block.type) {
    case "text": {
      const style = [
        `margin:0`,
        `font-size:${block.fontSize}px`,
        `color:${block.color}`,
        `text-align:${block.align}`,
        `font-weight:${block.fontWeight}`,
        `line-height:${block.lineHeight ?? 1.5}`,
        block.letterSpacing ? `letter-spacing:${block.letterSpacing}px` : "",
        block.textDecoration ? `text-decoration:${block.textDecoration}` : "",
        block.bgColor ? `background-color:${block.bgColor}` : "",
        `padding:${block.paddingTop ?? 4}px ${block.paddingRight ?? 0}px ${block.paddingBottom ?? 4}px ${block.paddingLeft ?? 0}px`,
        block.href ? `text-decoration:underline` : "",
      ]
        .filter(Boolean)
        .join(";");

      return `
  <tr><td style="${style}">
    ${block.href ? `<a href="${block.href}" style="color:${block.color};text-decoration:underline;">` : ""}
    ${block.content}
    ${block.href ? "</a>" : ""}
  </td></tr>`;
    }

    case "image": {
      const fit = block.objectFit ?? "cover";
      const padH = block.height;
      const imgStyle = [
        `max-width:100%`,
        padH != null ? `height:${padH}px` : `height:auto`,
        `display:block`,
        `border:0`,
        `border-radius:${block.borderRadius ?? 0}px`,
        `object-fit:${fit}`,
        `width:${block.width}px`,
      ].join(";");
      const img = `<img src="${escapeHtmlAttr(block.src)}" alt="${escapeHtmlAttr(block.alt)}" width="${block.width}" style="${imgStyle}" />`;
      const inner = block.linkHref?.trim()
        ? `<a href="${escapeHtmlAttr(block.linkHref.trim())}" style="text-decoration:none;display:block;border:0;">${img}</a>`
        : img;
      return `
  <tr><td style="background-color:${block.bgColor ?? "transparent"};padding:${block.paddingTop ?? 0}px ${block.paddingRight ?? 0}px ${block.paddingBottom ?? 0}px ${block.paddingLeft ?? 0}px;">
    ${inner}
  </td></tr>`;
    }

    case "button":
      return `
  <tr><td align="${block.align ?? "center"}" style="padding:${block.paddingTop ?? 8}px ${block.paddingRight ?? 0}px ${block.paddingBottom ?? 8}px ${block.paddingLeft ?? 0}px;">
    <a href="${block.href}" style="display:inline-block;background-color:${block.bgColor};color:${block.textColor};padding:10px 24px;border-radius:${block.borderRadius}px;text-decoration:none;font-size:14px;font-weight:500;${block.borderWidth ? `border:${block.borderWidth}px solid ${block.borderColor ?? block.bgColor};` : ""}">${block.label}</a>
  </td></tr>`;
    case "divider":
      return `
      <tr><td style="padding:4px 0;">
        <hr style="border:none;border-top:${block.thickness}px solid ${block.color};margin:0;" />
      </td></tr>`;
    case "spacer":
      return `
      <tr><td style="height:${block.height}px;line-height:${block.height}px;font-size:1px;">&nbsp;</td></tr>`;
    case "social":
      const socialIcons: Record<string, string> = {
        twitter: "X",
        linkedin: "in",
        instagram: "IG",
        github: "GH",
        facebook: "FB",
        youtube: "YT",
      };
      return `
  <tr>
    <td align="${block.align}" style="padding:12px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;">
        <tr>
          ${block.links
            .map(
              (link) => `
            <td style="padding:0 6px;">
              <a href="${link.url}" style="color:${block.iconColor};text-decoration:none;font-size:${block.iconSize}px;font-weight:bold;">
                ${socialIcons[link.platform] ?? link.platform}
              </a>
            </td>
          `,
            )
            .join("")}
        </tr>
      </table>
    </td>
  </tr>`;

    case "product-card":
      return `
  <tr>
    <td style="padding:16px 24px;">
      ${block.image ? `<img src="${block.image}" alt="${block.title}" width="100%" style="display:block;max-width:100%;border-radius:8px;margin-bottom:12px;" />` : ""}
      <p style="margin:0 0 4px;font-size:18px;font-weight:bold;color:#111111;">${block.title}</p>
      <p style="margin:0 0 8px;font-size:14px;color:#555555;line-height:1.5;">${block.description}</p>
      ${block.price ? `<p style="margin:0 0 12px;font-size:20px;font-weight:bold;color:#111111;">${block.price}</p>` : ""}
      <a href="${block.buttonHref}" style="display:inline-block;background-color:${block.buttonBgColor};color:${block.buttonTextColor};padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">${block.buttonLabel}</a>
    </td>
  </tr>`;

    case "unsubscribe":
      return `
  <tr>
    <td align="center" style="padding:16px 24px;">
      <p style="margin:0 0 4px;font-size:${block.fontSize}px;color:${block.textColor};">${block.companyName}</p>
      <p style="margin:0 0 8px;font-size:${block.fontSize}px;color:${block.textColor};">${block.address}</p>
      <a href="${block.unsubscribeUrl}" style="font-size:${block.fontSize}px;color:${block.textColor};">Unsubscribe</a>
    </td>
  </tr>`;

    case "divider-text":
      return `
  <tr>
    <td style="padding:8px 24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="border-top:1px solid ${block.color};"></td>
          <td style="padding:0 12px;font-size:${block.fontSize}px;color:${block.color};white-space:nowrap;">${block.text}</td>
          <td style="border-top:1px solid ${block.color};"></td>
        </tr>
      </table>
    </td>
  </tr>`;

    case "countdown": {
      const bg = block.bgColor ?? "#f4f7fb";
      const fg = block.textColor ?? "#0f172a";
      const ac = block.accentColor ?? "#2563eb";
      const ta = block.align ?? "center";
      const ld = block.labelDays ?? "Days";
      const lh = block.labelHours ?? "Hours";
      const lm = block.labelMinutes ?? "Minutes";
      const ls = block.labelSeconds ?? "Secs";
      const parts = getCountdownParts(block.targetDateIso);
      const expiredMsg =
        escapeHtmlAttr(block.expiredMessage ?? "This offer has ended");
      const headline = block.headline
        ? `<p style="margin:0 0 16px;font-size:13px;letter-spacing:0.06em;text-transform:uppercase;color:${fg};">${block.headline}</p>`
        : "";
      const isoAttr = escapeHtmlAttr(block.targetDateIso);

      const cell = (
        dc: string,
        num: number,
        label: string,
        digitSize = 26,
      ) => `
              <td style="padding:0 6px;vertical-align:top;">
                <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:${ac};border-radius:10px;min-width:68px;">
                  <tr><td align="center" style="padding:12px 10px;">
                    <p style="margin:0;font-size:${digitSize}px;font-weight:700;line-height:1;color:#ffffff;"><span data-dc="${dc}">${num}</span></p>
                    <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.06em;text-transform:uppercase;color:rgba(255,255,255,0.9);">${label}</p>
                  </td></tr>
                </table>
              </td>`;

      const grid = parts.expired
        ? ""
        : `${cell("d", parts.days, ld)}${cell("h", parts.hours, lh)}${cell("m", parts.minutes, lm)}${cell("s", parts.seconds, ls, 22)}`;

      const liveFootnote =
        `<p style="margin:14px 0 0;font-size:11px;color:${fg};opacity:0.55;">` +
        `Runs in browsers; many email apps strip scripts and freeze this countdown.` +
        `</p>`;

      const liveBlock = `
        <div data-dc-live style="display:${parts.expired ? "none" : "block"}">
          ${headline}
          <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr valign="top">${grid}</tr></table>
          ${parts.expired ? "" : liveFootnote}
        </div>
        <div data-dc-expired style="display:${parts.expired ? "block" : "none"}">
          ${headline}
          <p data-dc-expired-text style="margin:0;font-size:17px;font-weight:600;color:${fg};">${block.expiredMessage ?? "This offer has ended"}</p>
        </div>`;

      return `
  <tr><td align="${ta}" style="padding:22px 20px;background-color:${bg};">
    <div data-mailshot-countdown="${isoAttr}" data-mailshot-expired="${expiredMsg}">
      ${liveBlock}
    </div>
  </td></tr>`;
    }

    case "testimonial": {
      const bg = block.bgColor ?? "#ffffff";
      const fg = block.textColor ?? "#334155";
      const author = block.authorColor ?? "#0f172a";
      const accent = block.accentColor ?? "#6366f1";
      const ta = block.align ?? "left";
      const role = block.authorTitle
        ? `<p style="margin:2px 0 0;font-size:13px;color:${fg};opacity:0.8;">${block.authorTitle}</p>`
        : "";
      const avatar = block.avatarSrc
        ? `<img src="${block.avatarSrc}" alt="" width="44" height="44" style="display:block;border-radius:999px;width:44px;height:44px;" />`
        : `<table role="presentation" cellpadding="0" cellspacing="0" style="width:44px;height:44px;border-radius:999px;background-color:${accent};"><tr><td align="center" style="font-size:16px;font-weight:700;color:#ffffff;">${(block.authorName || "?")[0]?.toUpperCase() ?? "?"}</td></tr></table>`;

      return `
  <tr><td align="${ta}" style="padding:18px 24px;background-color:${bg};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${
      ta === "center"
        ? "margin:0 auto;max-width:480px;"
        : ""
    }">
      <tr>
        <td style="border-left:4px solid ${accent};padding-left:16px;">
          <p style="margin:0 0 14px;font-size:16px;line-height:1.55;font-style:italic;color:${fg};">${block.quote}</p>
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:12px;">${avatar}</td>
            <td valign="middle">
              <p style="margin:0;font-size:15px;font-weight:700;color:${author};">${block.authorName}</p>
              ${role}
            </td>
          </tr></table>
        </td>
      </tr>
    </table>
  </td></tr>`;
    }

    case "coupon": {
      const bg = block.bgColor ?? "#fdfdfd";
      const border = block.borderColor ?? "#1e293b";
      const fg = block.textColor ?? "#0f172a";
      const fs = block.codeFontSize ?? 22;
      const ta = block.align ?? "center";
      const desc = block.description
        ? `<p style="margin:10px 0 0;font-size:13px;color:${fg};opacity:0.75;">${block.description}</p>`
        : "";
      return `
  <tr><td align="${ta}" style="padding:14px 20px;">
    <table role="presentation" align="${ta}" cellpadding="0" cellspacing="0" style="border:2px dashed ${border};border-radius:14px;background-color:${bg};">
      <tr><td style="padding:18px 28px;text-align:center;">
        <span style="font-family:Georgia,'Times New Roman',serif;font-size:${fs}px;font-weight:700;letter-spacing:0.08em;color:${fg};">${block.code}</span>
        ${desc}
      </td></tr>
    </table>
  </td></tr>`;
    }

    case "rating": {
      const ta = block.align ?? "center";
      const max = block.maxStars ?? 5;
      const { full, half, empty } = starSegments(block.rating, max);
      const sc = block.starColor ?? "#f59e0b";
      const ec = block.emptyStarColor ?? "#e2e8f0";
      const size = block.starSize ?? 22;
      const filledSpans = [...Array(full)]
        .map(
          () =>
            `<span style="font-size:${size}px;line-height:1;color:${sc};">&#9733;</span>`,
        )
        .join("");
      const halfSpan = half
        ? `<span style="font-size:${size}px;line-height:1;color:${sc};opacity:0.52;">&#9733;</span>`
        : "";
      const emptySpans = [...Array(empty)]
        .map(
          () =>
            `<span style="font-size:${size}px;line-height:1;color:${ec};">&#9733;</span>`,
        )
        .join("");
      const stars = filledSpans + halfSpan + emptySpans;
      const label = block.label
        ? `<p style="margin:10px 0 0;font-size:13px;color:#64748b;">${block.label}</p>`
        : "";
      return `
  <tr><td align="${ta}" style="padding:12px 20px;">
    <table role="presentation" cellpadding="0" cellspacing="0" align="${
      ta === "left" ? "left" : ta === "right" ? "right" : "center"
    }" style="${
      ta === "center" ? "margin:0 auto;" : ""
    }"><tr><td style="padding:4px 0;font-size:14px;line-height:1;">
      ${stars}
      ${label}
    </td></tr></table>
  </td></tr>`;
    }

    case "nav-bar": {
      const bg = block.bgColor ?? "#ffffff";
      const lc = block.linkColor ?? "#0f172a";
      const lw = block.logoWidth ?? 132;
      const linksRow = block.links
        .map(
          (l, i) => `
              <td style="padding:${i === 0 ? "0 0 0 0" : "0 0 0 20px"};white-space:nowrap;">
                <a href="${l.href}" style="color:${lc};font-size:14px;font-weight:600;text-decoration:none;">${l.label}</a>
              </td>`,
        )
        .join("");

      return `
  <tr><td align="center" style="padding:12px 20px;background-color:${bg};">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td valign="middle" style="width:1%;">
          <img src="${block.logoSrc}" alt="${block.logoAlt}" width="${lw}" style="display:block;max-width:${lw}px;height:auto;border:0;" />
        </td>
        <td valign="middle" align="right">
          <table role="presentation" cellpadding="0" cellspacing="0" align="right"><tr>
            ${linksRow}
          </tr></table>
        </td>
      </tr>
    </table>
  </td></tr>`;
    }

    case "image-grid": {
      const cols = block.columns;
      const gap = block.gap;
      const br = block.borderRadius;
      const list =
        block.images.length > 0
          ? block.images
          : [{ src: "https://placehold.co/400x280", alt: "" }];
      const pct = Math.floor(100 / cols);
      const rowHtml: string[] = [];
      for (let i = 0; i < list.length; i += cols) {
        const row = list.slice(i, i + cols);
        const cells = row
          .map(
            (im) => `
          <td width="${pct}%" style="width:${pct}%;padding:${gap / 2}px;vertical-align:top;">
            ${im.src ? `<img src="${escapeHtmlAttr(im.src)}" alt="${escapeHtmlAttr(im.alt)}" width="100%" style="display:block;width:100%;max-width:100%;height:auto;border:0;border-radius:${br}px;" />` : "&nbsp;"}
          </td>`,
          )
          .join("");
        const fillers =
          row.length < cols
            ? [...Array(cols - row.length)]
                .map(
                  () => `
          <td width="${pct}%" style="width:${pct}%;padding:${gap / 2}px;">&nbsp;</td>`,
                )
                .join("")
            : "";
        rowHtml.push(`<tr>${cells}${fillers}</tr>`);
      }
      return `
  <tr><td style="padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      ${rowHtml.join("")}
    </table>
  </td></tr>`;
    }

    case "logo-strip": {
      const ta = block.align;
      const gh = block.logoHeight;
      const gap = block.gap;
      const bg = block.bgColor;
      const half = Math.max(0, gap / 2);
      const cells = block.logos
        .map((logo) => {
          const img = `<img src="${escapeHtmlAttr(logo.src)}" alt="${escapeHtmlAttr(logo.alt)}" height="${gh}" style="display:block;height:${gh}px;width:auto;max-width:100%;border:0;" />`;
          const inner = logo.href?.trim()
            ? `<a href="${escapeHtmlAttr(logo.href.trim())}" style="text-decoration:none;">${img}</a>`
            : img;
          return `<td style="padding:0 ${half}px;vertical-align:middle;">${inner}</td>`;
        })
        .join("");
      const tableAlign = ta === "left" ? "left" : ta === "right" ? "right" : "center";
      const centerFix = ta === "center" ? "margin:0 auto;" : "";
      return `
  <tr><td style="background-color:${bg};padding:16px 12px;">
    <table role="presentation" cellpadding="0" cellspacing="0" align="${tableAlign}" style="${centerFix}">
      <tr>${cells}</tr>
    </table>
  </td></tr>`;
    }

    case "hero": {
      const w = ctx.contentWidth;
      const h = block.minHeight;
      const bg = block.backgroundImage;
      const bgAttr = escapeHtmlAttr(bg);
      const bgCss = cssUrl(bg);
      const overlay = block.overlayColor;
      const tc = block.textColor;
      const al = block.align;
      const title = escapeHtmlText(block.title);
      const subtitle = escapeHtmlText(block.subtitle);
      const btnBg = block.buttonBgColor;
      const btnTx = block.buttonTextColor;
      const vmlOpen = `<!--[if gte mso 9]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:${w}px;height:${h}px;"><v:fill type="frame" src="${bgAttr}" color="#000000" /><v:textbox inset="0,0,0,0"><![endif]-->`;
      const vmlClose = `<!--[if gte mso 9]></v:textbox></v:rect><![endif]-->`;
      return `
  <tr><td style="padding:0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" valign="middle" background="${bgAttr}" width="100%" style="width:100%;background:url('${bgCss}') center/cover no-repeat #1a1a1a;min-height:${h}px;padding:0;">
          ${vmlOpen}
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="${al}" valign="middle" style="background-color:${overlay};min-height:${h}px;padding:40px 28px;">
                <h1 style="margin:0 0 12px;font-size:28px;line-height:1.2;font-weight:700;color:${tc};font-family:inherit;">${title}</h1>
                <p style="margin:0 0 22px;font-size:16px;line-height:1.5;color:${tc};font-family:inherit;opacity:0.95;">${subtitle}</p>
                <a href="${escapeHtmlAttr(block.buttonHref)}" style="display:inline-block;background-color:${btnBg};color:${btnTx};padding:12px 26px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;font-family:inherit;">${escapeHtmlText(block.buttonLabel)}</a>
              </td>
            </tr>
          </table>
          ${vmlClose}
        </td>
      </tr>
    </table>
  </td></tr>`;
    }

    default:
      return "";
  }
}

// function renderColumn(column: Column, width: string): string {
//   return `
//     <td width="${width}" valign="top" style="width:${width};">
//       <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
//         ${column.blocks.map(renderBlock).join("")}
//       </table>
//     </td>`;
// }

function renderSection(section: Section, contentWidth: number): string {
  const ctx: RenderCtx = { contentWidth };
  const colWidth = (col: Column) =>
    col.width
      ? `${col.width}%`
      : `${Math.floor(100 / section.columns.length)}%`;

  const mt = section.marginTop ?? 0;
  const mr = section.marginRight ?? 0;
  const mb = section.marginBottom ?? 0;
  const ml = section.marginLeft ?? 0;

  const innerTd = `background-color:${section.bgColor};padding:${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px;${section.borderRadius ? `border-radius:${section.borderRadius}px;` : ""}${section.borderWidth ? `border:${section.borderWidth}px solid ${section.borderColor ?? "transparent"};` : ""}`;

  return `
  <tr>
    <td style="padding:${mt}px ${mr}px ${mb}px ${ml}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td style="${innerTd}">
            <table role="presentation" cellpadding="0" cellspacing="${section.columnGap ?? 0}" width="100%">
              <tr>
                ${section.columns
                  .map(
                    (col) => `
                <td width="${colWidth(col)}" valign="${columnValign(col.verticalAlign)}" style="width:${colWidth(col)};">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                    ${col.blocks.map((b) => renderBlock(b, ctx)).join("")}
                  </table>
                </td>
              `,
                  )
                  .join("")}
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function renderBlockCode(block: Block): string {
  switch (block.type) {
    case "text":
      return `          <Text style={{ fontSize: ${block.fontSize}, color: '${block.color}', textAlign: '${block.align}', fontWeight: '${block.fontWeight}' }}>
            ${block.content}
          </Text>`;
    case "image": {
      const of = block.objectFit ?? "cover";
      const h = block.height;
      const style =
        h != null
          ? ` style={{ objectFit: '${of}' as const, height: ${h} }}`
          : ` style={{ objectFit: '${of}' as const }}`;
      return `          <Img src="${block.src}" alt="${block.alt}" width={${block.width}}${style} />`;
    }
    case "button":
      return `          <Button href="${block.href}" style={{ background: '${block.bgColor}', color: '${block.textColor}', borderRadius: ${block.borderRadius} }}>
            ${block.label}
          </Button>`;
    case "divider":
      return `          <Hr style={{ borderColor: '${block.color}', borderWidth: ${block.thickness} }} />`;
    case "spacer":
      return `          <Section style={{ height: ${block.height} }} />`;
    case "social":
      return `          {/* Social links */}
          <Section style={{ textAlign: '${block.align}' }}>
            ${block.links.map((link) => `<a href="${link.url}" style={{ color: '${block.iconColor}', marginRight: 12 }}>${link.platform}</a>`).join("\n            ")}
          </Section>`;

    case "product-card":
      return `          <Section>
            <Img src="${block.image}" alt="${block.title}" width="100%" />
            <Text style={{ fontSize: 18, fontWeight: 'bold' }}>${block.title}</Text>
            <Text style={{ fontSize: 14, color: '#555555' }}>${block.description}</Text>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>${block.price}</Text>
            <Button href="${block.buttonHref}" style={{ background: '${block.buttonBgColor}', color: '${block.buttonTextColor}' }}>${block.buttonLabel}</Button>
          </Section>`;

    case "unsubscribe":
      return `          <Section style={{ textAlign: 'center' }}>
            <Text style={{ fontSize: ${block.fontSize}, color: '${block.textColor}' }}>${block.companyName}</Text>
            <Text style={{ fontSize: ${block.fontSize}, color: '${block.textColor}' }}>${block.address}</Text>
            <Link href="${block.unsubscribeUrl}" style={{ fontSize: ${block.fontSize}, color: '${block.textColor}' }}>Unsubscribe</Link>
          </Section>`;

    case "divider-text":
      return `          <Hr style={{ borderColor: '${block.color}' }} />
          <Text style={{ textAlign: 'center', color: '${block.color}', fontSize: ${block.fontSize} }}>${block.text}</Text>
          <Hr style={{ borderColor: '${block.color}' }} />`;

    case "countdown":
      return `          <Section style={{ backgroundColor: '${block.bgColor ?? "#f4f7fb"}', textAlign: '${block.align ?? "center"}' }}>
            <Text style={{ color: '${block.textColor ?? "#0f172a"}' }}>${block.headline ?? "Countdown"}</Text>
            {/* Target: ${block.targetDateIso} — use dynamic countdown service for live email */}
          </Section>`;

    case "testimonial":
      return `          <Section style={{ borderLeft: '4px solid ${block.accentColor ?? "#6366f1"}', paddingLeft: 16, backgroundColor: '${block.bgColor ?? "#ffffff"}' }}>
            <Text style={{ fontStyle: 'italic', color: '${block.textColor ?? "#334155"}' }}>${block.quote}</Text>
            <Row>
              ${block.avatarSrc ? `<Img src="${block.avatarSrc}" width="44" height="44" style={{ borderRadius: 999 }} />` : ""}
              <Column>
                <Text style={{ fontWeight: 'bold', color: '${block.authorColor ?? "#0f172a"}' }}>${block.authorName}</Text>
                ${block.authorTitle ? `<Text>${block.authorTitle}</Text>` : ""}
              </Column>
            </Row>
          </Section>`;

    case "coupon":
      return `          <Section style={{ borderStyle: 'dashed', borderWidth: 2, borderColor: '${block.borderColor ?? "#1e293b"}', borderRadius: 14, padding: '18px 28px', textAlign: '${block.align ?? "center"}', backgroundColor: '${block.bgColor ?? "#fdfdfd"}' }}>
            <Text style={{ fontFamily: 'Georgia', fontSize: ${block.codeFontSize ?? 22}, fontWeight: 'bold', color: '${block.textColor ?? "#0f172a"}' }}>${block.code}</Text>
            ${block.description ? `<Text>${block.description}</Text>` : ""}
          </Section>`;

    case "rating": {
      const max = block.maxStars ?? 5;
      const { full, half, empty } = starSegments(block.rating, max);
      const starStr = [
        ...Array(full).fill("\u2605"),
        ...(half ? ["\u2605"] : []),
        ...Array(empty).fill("\u2606"),
      ].join(" ");
      return `          <Section style={{ textAlign: '${block.align ?? "center"}' }}>
            <Text style={{ letterSpacing: 2, fontSize: ${block.starSize ?? 22}, color: '${block.starColor ?? "#f59e0b"}' }}>
              ${starStr}
            </Text>
            ${block.label ? `<Text style={{ fontSize: 13, color: '#64748b' }}>${block.label}</Text>` : ""}
          </Section>`;
    }

    case "nav-bar":
      return `          <Section style={{ backgroundColor: '${block.bgColor ?? "#ffffff"}', padding: '12px 20px' }}>
            <Row>
              <Img src="${block.logoSrc}" alt="${block.logoAlt}" width={${block.logoWidth ?? 132}} />
              <Column align="right">
                ${block.links.map((l) => `<Link href="${l.href}" style={{ color: '${block.linkColor ?? "#0f172a"}', marginRight: 20 }}>${l.label}</Link>`).join("\n                ")}
              </Column>
            </Row>
          </Section>`;

    case "image-grid":
      return `          <Section>
            {/* image-grid: use Row/Column or raw HTML table in production */}
            ${block.images.map((im) => `<Img key="${im.src}" src="${im.src}" alt="${im.alt}" width="100%" />`).join("\n            ")}
          </Section>`;

    case "logo-strip":
      return `          <Section style={{ backgroundColor: '${block.bgColor}', textAlign: '${block.align}' }}>
            <Row>
              ${block.logos.map((l) => `<Img src="${l.src}" alt="${l.alt}" height={${block.logoHeight}} />`).join("\n              ")}
            </Row>
          </Section>`;

    case "hero":
      return `          <Section style={{ backgroundImage: 'url(${block.backgroundImage})', backgroundSize: 'cover', minHeight: ${block.minHeight} }}>
            <Text style={{ color: '${block.textColor}' }}>${block.title}</Text>
            <Text style={{ color: '${block.textColor}' }}>${block.subtitle}</Text>
            <Button href="${block.buttonHref}" style={{ backgroundColor: '${block.buttonBgColor}', color: '${block.buttonTextColor}' }}>${block.buttonLabel}</Button>
          </Section>`;

    default:
      return "";
  }
}

export function pageToHtml(page: Page): string {
  const globalStyles = page.canvases[0]?.globalStyles ?? {
    fontFamily: "Inter, sans-serif",
    bgColor: "#f4f4f4",
    contentWidth: 600,
  };

  const allSections = page.canvases.flatMap((c) => c.sections);
  const hasCountdown = page.canvases.some(canvasHasCountdown);
  const fontFace = globalStyles.googleFontCssImportUrl
    ? `<style>@import url(${JSON.stringify(globalStyles.googleFontCssImportUrl)});</style>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  ${fontFace}
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.bgColor};font-family:${globalStyles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${globalStyles.bgColor};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="${globalStyles.contentWidth}" style="max-width:${globalStyles.contentWidth}px;width:100%;">
          ${allSections.map((s) => renderSection(s, globalStyles.contentWidth)).join("")}
        </table>
      </td>
    </tr>
  </table>
  ${hasCountdown ? countdownInlineScript() : ""}
</body>
</html>`;
}

export function canvasToHtml(canvas: Canvas): string {
  const { globalStyles, sections } = canvas;
  const fontFace = globalStyles.googleFontCssImportUrl
    ? `<style>@import url(${JSON.stringify(globalStyles.googleFontCssImportUrl)});</style>`
    : "";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
  ${fontFace}
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.bgColor};font-family:${globalStyles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${globalStyles.bgColor};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="${globalStyles.contentWidth}" style="max-width:${globalStyles.contentWidth}px;width:100%;">
          ${sections.map((s) => renderSection(s, globalStyles.contentWidth)).join("")}
        </table>
      </td>
    </tr>
  </table>
  ${canvasHasCountdown(canvas) ? countdownInlineScript() : ""}
</body>
</html>`;
}

export function templateToHtml(template: Template): string {
  return canvasToHtml(getActiveCanvas(template));
}

/** Full HTML document per page, separated for easy split into multiple files. */
export function templateToHtmlAllPages(template: Template): string {
  const total = template.pages.reduce((n, p) => n + p.canvases.length, 0);
  let i = 0;
  const parts: string[] = [];
  for (const page of template.pages) {
    for (const canvas of page.canvases) {
      i += 1;
      parts.push(
        `<!-- MailShot — ${page.name} · ${canvas.name} (${i}/${total}) -->\n${canvasToHtml(canvas)}`,
      );
    }
  }
  return parts.join("\n\n");
}

export function canvasToReactCode(canvas: Canvas): string {
  const { globalStyles, sections } = canvas;

  const sectionSurfaceStyle = (section: Section): string => {
    const mt = section.marginTop ?? 0;
    const mr = section.marginRight ?? 0;
    const mb = section.marginBottom ?? 0;
    const ml = section.marginLeft ?? 0;
    return `backgroundColor: '${section.bgColor}', padding: '${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px', margin: '${mt}px ${mr}px ${mb}px ${ml}px'`;
  };

  const renderSectionCode = (section: Section): string => {
    if (section.columns.length === 1) {
      return `      <Section style={{ ${sectionSurfaceStyle(section)} }}>
${section.columns[0].blocks.map(renderBlockCode).join("\n")}
      </Section>`;
    }
    return `      <Row style={{ ${sectionSurfaceStyle(section)} }}>
${section.columns
  .map(
    (col) => `        <Column>
${col.blocks.map(renderBlockCode).join("\n")}
        </Column>`,
  )
  .join("\n")}
      </Row>`;
  };

  const fontComment = globalStyles.googleFontCssImportUrl
    ? `\n        {/* Webfont: ${globalStyles.googleFontCssImportUrl} */}`
    : "";

  return `import {
  Html, Head, Body, Container,
  Text, Img, Button, Hr, Link,
  Section, Row, Column
} from '@react-email/components'

export default function NewsletterTemplate() {
  return (
    <Html>
      <Head />${fontComment}
      <Body style={{ backgroundColor: '${globalStyles.bgColor}', fontFamily: '${globalStyles.fontFamily}' }}>
        <Container style={{ maxWidth: ${globalStyles.contentWidth} }}>
${sections.map(renderSectionCode).join("\n")}
        </Container>
      </Body>
    </Html>
  )
}`;
}

export function templateToReactCode(template: Template): string {
  return canvasToReactCode(getActiveCanvas(template));
}
