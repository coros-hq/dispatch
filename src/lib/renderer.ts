import type { Block, Canvas, Column, Section, Template } from "../types";
import { getActiveCanvas } from "../store/editor";

function renderBlock(block: Block): string {
  switch (block.type) {
    case "text":
      return `
      <tr><td style="padding:8px 0;">
        <p style="margin:0;font-size:${block.fontSize}px;color:${block.color};text-align:${block.align};font-weight:${block.fontWeight};line-height:1.5;">${block.content}</p>
      </td></tr>`;
    case "image":
      return `
      <tr><td style="padding:8px 0;">
        <img src="${block.src}" alt="${block.alt}" width="${block.width}" style="max-width:100%;height:auto;display:block;border:0;" />
      </td></tr>`;
    case "button":
      return `
      <tr><td align="center" style="padding:8px 0;">
        <a href="${block.href}" style="display:inline-block;background-color:${block.bgColor};color:${block.textColor};padding:10px 24px;border-radius:${block.borderRadius}px;text-decoration:none;font-size:14px;font-weight:500;">${block.label}</a>
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
    default:
      return "";
  }
}

function renderColumn(column: Column, width: string): string {
  return `
    <td width="${width}" valign="top" style="width:${width};">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${column.blocks.map(renderBlock).join("")}
      </table>
    </td>`;
}

function renderSection(section: Section): string {
  const colWidth = `${Math.floor(100 / section.columns.length)}%`;
  return `
  <tr>
    <td style="background-color:${section.bgColor};padding:${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          ${section.columns.map((col) => renderColumn(col, colWidth)).join("")}
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
    case "image":
      return `          <Img src="${block.src}" alt="${block.alt}" width={${block.width}} />`;
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
    default:
      return "";
  }
}

export function canvasToHtml(canvas: Canvas): string {
  const { globalStyles, sections } = canvas;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title></title>
</head>
<body style="margin:0;padding:0;background-color:${globalStyles.bgColor};font-family:${globalStyles.fontFamily};">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${globalStyles.bgColor};">
    <tr>
      <td align="center" style="padding:0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="${globalStyles.contentWidth}" style="max-width:${globalStyles.contentWidth}px;width:100%;">
          ${sections.map(renderSection).join("")}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function templateToHtml(template: Template): string {
  return canvasToHtml(getActiveCanvas(template));
}

export function canvasToReactCode(canvas: Canvas): string {
  const { globalStyles, sections } = canvas;

  const renderSectionCode = (section: Section): string => {
    if (section.columns.length === 1) {
      return `      <Section style={{ backgroundColor: '${section.bgColor}', padding: '${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px' }}>
${section.columns[0].blocks.map(renderBlockCode).join("\n")}
      </Section>`;
    }
    return `      <Row style={{ backgroundColor: '${section.bgColor}', padding: '${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px' }}>
${section.columns
  .map(
    (col) => `        <Column>
${col.blocks.map(renderBlockCode).join("\n")}
        </Column>`,
  )
  .join("\n")}
      </Row>`;
  };

  return `import {
  Html, Head, Body, Container,
  Text, Img, Button, Hr,
  Section, Row, Column
} from '@react-email/components'

export default function NewsletterTemplate() {
  return (
    <Html>
      <Head />
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
