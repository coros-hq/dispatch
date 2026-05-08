import type { Block } from '../../types'

type Props = { block: Block }

export default function BlockRenderer({ block }: Props) {
  switch (block.type) {
    case 'text':
      return (
        <div className="px-6 py-3">
          <p style={{
            fontSize: block.fontSize,
            color: block.color,
            textAlign: block.align,
            fontWeight: block.fontWeight,
            margin: 0,
            lineHeight: 1.5,
          }}>
            {block.content}
          </p>
        </div>
      )

    case 'image':
      return (
        <div className="px-6 py-3">
          <img
            src={block.src}
            alt={block.alt}
            style={{ width: '100%', maxWidth: block.width, display: 'block', margin: '0 auto' }}
          />
        </div>
      )

    case 'button':
      return (
        <div className="px-6 py-4 flex justify-center">
          <a href={block.href} style={{
            backgroundColor: block.bgColor,
            color: block.textColor,
            borderRadius: block.borderRadius,
            padding: '10px 24px',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
            display: 'inline-block',
          }}>
            {block.label}
          </a>
        </div>
      )

    case 'divider':
      return (
        <div className="px-6 py-2">
        <hr style={{
            borderColor: block.color,
            borderWidth: block.thickness,
            borderStyle: 'solid',
            margin: 0,
          }} />
        </div>
      )

    case 'spacer':
      return <div style={{ height: block.height }} />

    case 'two-col':
      return (
        <div className="px-4 py-3 grid grid-cols-2 gap-4">
          <div>{block.left.map((b, i) => <BlockRenderer key={i} block={b} />)}</div>
          <div>{block.right.map((b, i) => <BlockRenderer key={i} block={b} />)}</div>
        </div>
      )
  }
}