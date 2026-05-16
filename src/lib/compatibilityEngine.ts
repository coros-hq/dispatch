import type { Canvas } from '../types'
import { canvasToHtml } from './renderer'

export type ClientSupport = 'yes' | 'partial' | 'no'

export type Issue = {
  property: string
  support: ClientSupport
  description: string
}

export type ClientResult = {
  name: string
  category: string
  score: number
  issues: Issue[]
}

export type CompatibilityReport = {
  clients: ClientResult[]
  generatedAt: string
}

// ─── Rules ───────────────────────────────────────────────────────────────────

const RULES: {
  id: string
  property: string
  description: string
  detect: (html: string) => boolean
  support: Record<string, ClientSupport>
}[] = [
  // ── Layout ──
  {
    id: 'flexbox',
    property: 'display:flex',
    description: 'Flexbox is not supported — use table-based layouts instead',
    detect: (html) => /display\s*:\s*flex/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'partial', 'Apple Mail iOS': 'partial',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'partial', 'ProtonMail': 'no',
      'HEY': 'yes', 'AOL': 'no',
    },
  },
  {
    id: 'css-grid',
    property: 'display:grid',
    description: 'CSS Grid is not supported in any email client',
    detect: (html) => /display\s*:\s*grid/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'no', 'Apple Mail iOS': 'no',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'no', 'ProtonMail': 'no',
      'HEY': 'no', 'AOL': 'no',
    },
  },
  {
    id: 'position',
    property: 'position (absolute/fixed)',
    description: 'CSS positioning is stripped by most email clients',
    detect: (html) => /position\s*:\s*(absolute|fixed|relative)/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'partial', 'Apple Mail iOS': 'partial',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'partial', 'ProtonMail': 'no',
      'HEY': 'partial', 'AOL': 'no',
    },
  },
  {
    id: 'margin-auto',
    property: 'margin:auto',
    description: 'margin:auto for centering is ignored by Outlook — use align="center" on tables instead',
    detect: (html) => /margin\s*:\s*auto/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'partial',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },
  {
    id: 'negative-margin',
    property: 'Negative margins',
    description: 'Negative margins are ignored by Outlook and some clients',
    detect: (html) => /margin\s*:\s*-\d+/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'partial', 'Samsung Email': 'partial',
      'Thunderbird': 'yes', 'ProtonMail': 'partial',
      'HEY': 'yes', 'AOL': 'partial',
    },
  },

  // ── Typography ──
  {
    id: 'web-fonts',
    property: 'Web fonts (@font-face)',
    description: 'Custom web fonts fall back to system fonts in most clients',
    detect: (html) => /@font-face|fonts\.googleapis/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'partial', 'ProtonMail': 'no',
      'HEY': 'yes', 'AOL': 'no',
    },
  },
  {
    id: 'font-size-small',
    property: 'Font size below 11px',
    description: 'iOS auto-resizes fonts smaller than 11px — use 11px minimum',
    detect: (html) => {
      const matches = Array.from(
        html.matchAll(/font-size\s*:\s*(\d+)px/gi),
      )
      return matches.some((m) => parseInt(m[1]) < 11)
    },
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'partial', 'Gmail Android': 'yes',
      'Outlook 2007': 'yes', 'Outlook 2010': 'yes', 'Outlook 2013': 'yes',
      'Outlook 2016': 'yes', 'Outlook 2019': 'yes', 'Outlook 365': 'yes',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'partial',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },
  {
    id: 'letter-spacing',
    property: 'letter-spacing',
    description: 'Letter spacing is ignored by Outlook 2007-2019',
    detect: (html) => /letter-spacing\s*:/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'yes',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },

  // ── Visual ──
  {
    id: 'border-radius',
    property: 'border-radius',
    description: 'Rounded corners are ignored — elements will appear square in Outlook',
    detect: (html) => /border-radius\s*:/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'partial',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'partial',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },
  {
    id: 'background-image',
    property: 'background-image',
    description: 'Background images are blocked by Outlook — use VML fallback for Outlook support',
    detect: (html) => /background-image\s*:|background:\s*url/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'partial',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'partial', 'Samsung Email': 'partial',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'partial',
    },
  },
  {
    id: 'box-shadow',
    property: 'box-shadow',
    description: 'Box shadows are stripped by most email clients',
    detect: (html) => /box-shadow\s*:/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'yes', 'ProtonMail': 'partial',
      'HEY': 'yes', 'AOL': 'no',
    },
  },
  {
    id: 'css-animation',
    property: 'CSS animations / transitions',
    description: 'Animations are not supported in most email clients',
    detect: (html) => /animation|@keyframes|transition\s*:/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'no', 'ProtonMail': 'no',
      'HEY': 'partial', 'AOL': 'no',
    },
  },
  {
    id: 'css-variables',
    property: 'CSS variables (--custom)',
    description: 'CSS custom properties are not supported in any email client',
    detect: (html) => /var\s*\(--/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'no', 'Apple Mail iOS': 'no',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'no', 'ProtonMail': 'no',
      'HEY': 'no', 'AOL': 'no',
    },
  },
  {
    id: 'transform',
    property: 'CSS transform',
    description: 'CSS transforms are not supported in email clients',
    detect: (html) => /transform\s*:/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'partial', 'Apple Mail iOS': 'partial',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'partial', 'ProtonMail': 'no',
      'HEY': 'partial', 'AOL': 'no',
    },
  },
  {
    id: 'dark-mode',
    property: 'Dark mode (@media prefers-color-scheme)',
    description: 'Dark mode media queries only supported by Apple Mail and a few others',
    detect: (html) => /prefers-color-scheme/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'partial', 'Outlook 365': 'partial',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'partial',
      'Thunderbird': 'yes', 'ProtonMail': 'no',
      'HEY': 'yes', 'AOL': 'no',
    },
  },

  // ── Media ──
  {
    id: 'video',
    property: '<video> element',
    description: 'Video elements are not supported — use a linked image with play button instead',
    detect: (html) => /<video/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'no', 'ProtonMail': 'no',
      'HEY': 'no', 'AOL': 'no',
    },
  },
  {
    id: 'svg',
    property: '<svg> element',
    description: 'SVG is blocked by most email clients — use PNG or JPG instead',
    detect: (html) => /<svg|\.svg"/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'yes', 'ProtonMail': 'no',
      'HEY': 'yes', 'AOL': 'no',
    },
  },
  {
    id: 'gif',
    property: 'Animated GIF',
    description: 'Animated GIFs show only the first frame in Outlook 2007-2019',
    detect: (html) => /\.gif"/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'partial', 'Outlook 2010': 'partial', 'Outlook 2013': 'partial',
      'Outlook 2016': 'partial', 'Outlook 2019': 'partial', 'Outlook 365': 'yes',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },

  // ── Security ──
  {
    id: 'http-images',
    property: 'HTTP images (non-HTTPS)',
    description: 'Images served over HTTP are blocked as insecure by most clients',
    detect: (html) => /src="http:\/\//i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'partial', 'Outlook 2010': 'partial', 'Outlook 2013': 'partial',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'no', 'Apple Mail iOS': 'no',
      'Yahoo Mail': 'no', 'Samsung Email': 'no',
      'Thunderbird': 'no', 'ProtonMail': 'no',
      'HEY': 'no', 'AOL': 'no',
    },
  },
  {
    id: 'missing-alt',
    property: 'Missing alt text on images',
    description: 'Images without alt text show broken icons when images are blocked',
    detect: (html) => /<img(?![^>]*alt=)[^>]*>/i.test(html),
    support: {
      'Gmail Web': 'partial', 'Gmail iOS': 'partial', 'Gmail Android': 'partial',
      'Outlook 2007': 'partial', 'Outlook 2010': 'partial', 'Outlook 2013': 'partial',
      'Outlook 2016': 'partial', 'Outlook 2019': 'partial', 'Outlook 365': 'partial',
      'Outlook.com': 'partial',
      'Apple Mail macOS': 'partial', 'Apple Mail iOS': 'partial',
      'Yahoo Mail': 'partial', 'Samsung Email': 'partial',
      'Thunderbird': 'partial', 'ProtonMail': 'partial',
      'HEY': 'partial', 'AOL': 'partial',
    },
  },
  {
    id: 'max-width',
    property: 'max-width',
    description: 'max-width is partially supported in Outlook — use width attribute on tables instead',
    detect: (html) => /max-width\s*:/i.test(html),
    support: {
      'Gmail Web': 'yes', 'Gmail iOS': 'yes', 'Gmail Android': 'yes',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'partial', 'Outlook 2019': 'partial', 'Outlook 365': 'yes',
      'Outlook.com': 'yes',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'yes',
    },
  },
  {
    id: 'media-queries',
    property: '@media queries',
    description: 'Media queries for responsive design are ignored by Gmail and Outlook desktop',
    detect: (html) => /@media/i.test(html),
    support: {
      'Gmail Web': 'no', 'Gmail iOS': 'no', 'Gmail Android': 'no',
      'Outlook 2007': 'no', 'Outlook 2010': 'no', 'Outlook 2013': 'no',
      'Outlook 2016': 'no', 'Outlook 2019': 'no', 'Outlook 365': 'no',
      'Outlook.com': 'no',
      'Apple Mail macOS': 'yes', 'Apple Mail iOS': 'yes',
      'Yahoo Mail': 'yes', 'Samsung Email': 'yes',
      'Thunderbird': 'yes', 'ProtonMail': 'yes',
      'HEY': 'yes', 'AOL': 'partial',
    },
  },
]

// ─── Client categories ────────────────────────────────────────────────────────

const CLIENT_CATEGORIES: Record<string, string> = {
  'Gmail Web': 'Gmail',
  'Gmail iOS': 'Gmail',
  'Gmail Android': 'Gmail',
  'Outlook 2007': 'Outlook Desktop',
  'Outlook 2010': 'Outlook Desktop',
  'Outlook 2013': 'Outlook Desktop',
  'Outlook 2016': 'Outlook Desktop',
  'Outlook 2019': 'Outlook Desktop',
  'Outlook 365': 'Outlook',
  'Outlook.com': 'Outlook',
  'Apple Mail macOS': 'Apple Mail',
  'Apple Mail iOS': 'Apple Mail',
  'Yahoo Mail': 'Yahoo',
  'Samsung Email': 'Samsung',
  'Thunderbird': 'Thunderbird',
  'ProtonMail': 'ProtonMail',
  'HEY': 'HEY',
  'AOL': 'AOL',
}

const EMAIL_CLIENTS = Object.keys(CLIENT_CATEGORIES)

// ─── Engine ───────────────────────────────────────────────────────────────────

export async function generateCompatibilityReport(canvas: Canvas): Promise<CompatibilityReport> {
  const html = canvasToHtml(canvas)

  const detectedRules = RULES.filter((r) => r.detect(html))

  const clients: ClientResult[] = EMAIL_CLIENTS.map((clientName) => {
    const issues: Issue[] = detectedRules
      .filter((rule) => (rule.support[clientName] ?? 'yes') !== 'yes')
      .map((rule) => ({
        property: rule.property,
        support: rule.support[clientName] ?? 'yes',
        description: rule.description,
      }))

    const score = detectedRules.length === 0
      ? 100
      : Math.round(
          detectedRules.reduce((acc, rule) => {
            const support = rule.support[clientName] ?? 'yes'
            if (support === 'yes') return acc + 1
            if (support === 'partial') return acc + 0.6
            return acc
          }, 0) / detectedRules.length * 100
        )

    return {
      name: clientName,
      category: CLIENT_CATEGORIES[clientName],
      score,
      issues,
    }
  })

  return {
    clients,
    generatedAt: new Date().toISOString(),
  }
}