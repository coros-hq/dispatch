import { useEditorStore } from '../../store/editor'
import { STARTER_TEMPLATES } from '../../lib/templates'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Template } from '../../types'
import { useState } from 'react'

export default function TemplatePanel() {
    const { setMode, mode, setPreviewTemplate, setTemplate, previewTemplate } = useEditorStore()
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

    const handleClick = (template: Template) => {
        setSelectedTemplate(template)
        setPreviewTemplate(template)
    }


    const handleUse = () => {
        if (previewTemplate) {
            setTemplate(previewTemplate)
            setMode('edit')
            setPreviewTemplate(null)
        }
    }

    const handleCancel = () => {
        setMode('edit')
        setPreviewTemplate(null)
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 shrink-0">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                    Templates
                </span>
                <button
                    onClick={handleCancel}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                    ✕ Cancel
                </button>
            </div>
            <Separator />

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
                {STARTER_TEMPLATES.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => handleClick(template)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedTemplate?.name === template.name
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50 hover:bg-accent'
                            }`}
                    >
                        <p className="text-xs font-medium text-foreground">{template.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                            {template.sections.length} section{template.sections.length > 1 ? 's' : ''}
                        </p>
                    </div>
                ))}
            </div>

            <Separator />
            <div className="p-3 flex flex-col gap-2">
                <Button
                    onClick={handleUse}
                    disabled={!previewTemplate}
                    className="w-full"
                    size="sm"
                >
                    Use this template
                </Button>
                <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full"
                    size="sm"
                >
                    Cancel
                </Button>
            </div>
        </div>
    )
}