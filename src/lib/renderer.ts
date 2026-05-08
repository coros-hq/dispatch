import type { Block, Column, Section, Template } from '../types'

function renderBlock(block: Block): string {
    switch (block.type) {
        case 'text':
            return `
      <tr>
        <td style="padding:8px 0;">
          <p style="margin:0;font-size:${block.fontSize}px;color:${block.color};text-align:${block.align};font-weight:${block.fontWeight};line-height:1.5;">
            ${block.content}
          </p>
        </td>
      </tr>`

        case 'image':
            return `
      <tr>
        <td style="padding:8px 0;">
          <img src="${block.src}" alt="${block.alt}" width="${block.width}" style="max-width:100%;height:auto;display:block;border:0;" />
        </td>
      </tr>`

        case 'button':
            return `
      <tr>
        <td align="center" style="padding:8px 0;">
          <a href="${block.href}" style="display:inline-block;background-color:${block.bgColor};color:${block.textColor};padding:10px 24px;border-radius:${block.borderRadius}px;text-decoration:none;font-size:14px;font-weight:500;">
            ${block.label}
          </a>
        </td>
      </tr>`

        case 'divider':
            return `
      <tr>
        <td style="padding:4px 0;">
          <hr style="border:none;border-top:${block.thickness}px solid ${block.color};margin:0;" />
        </td>
      </tr>`

        case 'spacer':
            return `
      <tr>
        <td style="height:${block.height}px;line-height:${block.height}px;font-size:1px;">&nbsp;</td>
      </tr>`

        default:
            return ''
    }
}

function renderColumn(column: Column, width: string): string {
  return `
    <!--[if mso]><td width="${width}" valign="top"><![endif]-->
    <td width="${width}" valign="top" style="width:${width};">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${column.blocks.map(renderBlock).join('')}
      </table>
    </td>
    <!--[if mso]></td><![endif]-->`
}

function renderSection(section: Section): string {
  const colWidth = `${Math.floor(100 / section.columns.length)}%`

  return `
  <tr>
    <td style="background-color:${section.bgColor};padding:${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          ${section.columns.map((col) => renderColumn(col, colWidth)).join('')}
        </tr>
      </table>
    </td>
  </tr>`
}

export function templateToHtml(template: Template): string {
    const { globalStyles, sections } = template

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
          ${sections.map(renderSection).join('')}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function templateToReactCode(template: Template): string {
    const { globalStyles, sections } = template

    const renderBlockCode = (block: Block): string => {
        switch (block.type) {
            case 'text':
                return `          <Text style={{ fontSize: ${block.fontSize}, color: '${block.color}', textAlign: '${block.align}', fontWeight: '${block.fontWeight}' }}>
            ${block.content}
          </Text>`
            case 'image':
                return `          <Img src="${block.src}" alt="${block.alt}" width={${block.width}} />`
            case 'button':
                return `          <Button href="${block.href}" style={{ background: '${block.bgColor}', color: '${block.textColor}', borderRadius: ${block.borderRadius} }}>
            ${block.label}
          </Button>`
            case 'divider':
                return `          <Hr style={{ borderColor: '${block.color}', borderWidth: ${block.thickness} }} />`
            case 'spacer':
                return `          <Section style={{ height: ${block.height} }} />`
            default:
                return ''
        }
    }

    const renderSectionCode = (section: Section): string => {
        if (section.columns.length === 1) {
            return `      <Section style={{ backgroundColor: '${section.bgColor}', padding: '${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px' }}>
${section.columns[0].blocks.map(renderBlockCode).join('\n')}
      </Section>`
        }

        return `      <Row style={{ backgroundColor: '${section.bgColor}', padding: '${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px' }}>
${section.columns.map((col) => `        <Column>
${col.blocks.map(renderBlockCode).join('\n')}
        </Column>`).join('\n')}
      </Row>`
    }

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
${sections.map(renderSectionCode).join('\n')}
        </Container>
      </Body>
    </Html>
  )
}`
}