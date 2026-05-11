import { migrateTemplate, type SavedTemplate } from "@/lib/template-service";
import { getActiveCanvas } from "@/store/editor";
import { Button } from "./ui/button";

type TemplateCardProps = {
  template: SavedTemplate;
  isPreview: boolean;
  onPreview: () => void;
  onUse: () => void;
};

export function TemplateCard({
  template,
  onPreview,
  onUse,
}: TemplateCardProps) {
  const data = migrateTemplate(template.data);
  const activeCanvas = getActiveCanvas(data);

  return (
    <div className="rounded-xl border border-primary/20 bg-card overflow-hidden flex flex-col group hover:border-primary/50 transition-colors">
      {/* Preview area */}
      <div className="h-48 bg-muted relative overflow-hidden flex items-start justify-center p-3">
        <div
          className="w-full rounded origin-top scale-[0.55] shadow-sm"
          style={{ backgroundColor: activeCanvas.globalStyles.bgColor }}
        >
          {activeCanvas.sections.slice(0, 3).map((section) => (
            <div
              key={section.id}
              style={{
                backgroundColor: section.bgColor,
                padding: `${section.paddingTop}px ${section.paddingRight}px ${section.paddingBottom}px ${section.paddingLeft}px`,
              }}
            >
              {section.columns[0]?.blocks.slice(0, 3).map((block) => (
                <div key={block.id} className="mb-1">
                  {block.type === "text" && (
                    <p
                      style={{
                        fontSize: block.fontSize * 0.6,
                        color: block.color,
                        textAlign: block.align,
                        fontWeight: block.fontWeight,
                        margin: 0,
                      }}
                    >
                      {block.content.slice(0, 60)}
                    </p>
                  )}
                  {block.type === "button" && (
                    <div
                      style={{
                        backgroundColor: block.bgColor,
                        color: block.textColor,
                      }}
                      className="text-[8px] px-3 py-1 rounded inline-block mt-1"
                    >
                      {block.label}
                    </div>
                  )}
                  {block.type === "image" && (
                    <div className="w-full h-12 bg-muted/50 rounded" />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            Preview
          </Button>
          <Button size="sm" onClick={onUse}>
            Use template
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{template.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {template.category}
          </p>
        </div>
        {!template.is_default && (
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            community
          </span>
        )}
      </div>
    </div>
  );
}
