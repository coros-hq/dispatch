import Editor from '@monaco-editor/react'
import { useEditorStore, getActiveCanvas } from '../../store/editor'
import { templateToReactCode } from '../../lib/renderer'

export default function CodePane() {
  const template = useEditorStore((s) => s.template)
  const code = templateToReactCode(template)
  const active = getActiveCanvas(template)

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Code
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          React Email · {active.name}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="typescript"
          value={code}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12 },
            renderLineHighlight: 'none',
            folding: false,
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  )
}