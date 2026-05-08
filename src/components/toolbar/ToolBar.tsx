import { useState } from 'react'
import { useEditorStore } from '../../store/editor'
import { templateToHtml, templateToReactCode } from '../../lib/renderer'
import SendTestModal from './SendTestModal'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Logo from "@/assets/logo.svg"
export default function Toolbar() {
  const template = useEditorStore((s) => s.template)
  const renameTemplate = useEditorStore((s) => s.renameTemplate)
  const [copied, setCopied] = useState<'html' | 'code' | null>(null)

  const copy = (text: string, type: 'html' | 'code') => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <header className="h-12 bg-card flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-2">
        <div className='flex flex-row justify-center items-center gap-2'>
          <img src={Logo} alt="Dispatch Logo" className='w-8 h-8' />
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Dispatch
          </span>
        </div>
        <Separator orientation="vertical" className="h-4" />
        <input
          value={template.name}
          onChange={(e) => renameTemplate(e.target.value)}
          className="text-xs text-muted-foreground bg-transparent border-b border-transparent focus:border-border focus:text-foreground outline-none transition-colors w-32"
        />
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => copy(templateToReactCode(template), 'code')}
        >
          {copied === 'code' ? '✓ Copied' : 'Copy code'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copy(templateToHtml(template), 'html')}
        >
          {copied === 'html' ? '✓ Copied' : 'Export HTML'}
        </Button>
        <SendTestModal />
      </div>
    </header>
  )
}