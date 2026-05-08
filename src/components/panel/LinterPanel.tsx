import { useEditorStore } from '../../store/editor'
import { lintTemplate } from '../../lib/linter'
import type { LintResult } from '../../lib/linter'
import { Separator } from '@/components/ui/separator'

function LintItem({ result }: { result: LintResult }) {
  return (
    <div className={`p-3 rounded-lg border text-xs flex flex-col gap-1 ${
      result.severity === 'error'
        ? 'bg-red-500/10 border-red-500/20'
        : 'bg-yellow-500/10 border-yellow-500/20'
    }`}>
      <div className="flex items-center gap-2">
        <span>{result.severity === 'error' ? '✕' : '⚠'}</span>
        <span className={result.severity === 'error' ? 'text-red-400' : 'text-yellow-400'}>
          {result.message}
        </span>
      </div>
      <p className="text-white/30 pl-5">
        Affects: {result.clients.join(', ')}
      </p>
    </div>
  )
}

export default function LinterPanel() {
  const template = useEditorStore((s) => s.template)
  const results = lintTemplate(template)

  const errors = results.filter((r) => r.severity === 'error')
  const warnings = results.filter((r) => r.severity === 'warning')

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 shrink-0">
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          Compatibility
        </span>
        <div className="flex items-center gap-2">
          {errors.length > 0 && (
            <span className="text-[10px] text-red-400">
              {errors.length} error{errors.length > 1 ? 's' : ''}
            </span>
          )}
          {warnings.length > 0 && (
            <span className="text-[10px] text-yellow-400">
              {warnings.length} warning{warnings.length > 1 ? 's' : ''}
            </span>
          )}
          {results.length === 0 && (
            <span className="text-[10px] text-green-400">All clear</span>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {results.length === 0 ? (
          <div className="text-xs text-white/30 text-center mt-6">
            ✓ No compatibility issues found
          </div>
        ) : (
          results.map((result, i) => (
            <LintItem key={i} result={result} />
          ))
        )}
      </div>
    </div>
  )
}