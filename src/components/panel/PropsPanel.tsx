import { getActiveCanvas, useEditorStore } from "../../store/editor";
import type { Block } from "../../types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function PropsPanel() {
  const {
    selection,
    template,
    updateBlock,
    updateGlobalStyles,
    updateSection,
  } = useEditorStore();
  const activeCanvas = getActiveCanvas(template);

  if (selection.type === "none") {
    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Global styles
        </p>
        <Field label="Canvas background">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer border border-border"
            value={activeCanvas.globalStyles.bgColor}
            onChange={(e) => updateGlobalStyles({ bgColor: e.target.value })}
          />
        </Field>
        <Field label="Content width">
          <Input
            type="number"
            value={activeCanvas.globalStyles.contentWidth}
            onChange={(e) =>
              updateGlobalStyles({ contentWidth: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Font family">
          <Select
            value={activeCanvas.globalStyles.fontFamily}
            onValueChange={(v) => updateGlobalStyles({ fontFamily: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Inter, sans-serif">Inter</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="'Times New Roman', serif">
                Times New Roman
              </SelectItem>
              <SelectItem value="'Courier New', monospace">
                Courier New
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    );
  }

  if (selection.type === "section") {
    const section = activeCanvas.sections.find(
      (s) => s.id === selection.sectionId,
    );

    if (!section) return null;

    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          Section
        </p>
        <Field label="Background">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer"
            value={section.bgColor}
            onChange={(e) =>
              updateSection(section.id, { bgColor: e.target.value })
            }
          />
        </Field>
        <Field label="Padding top">
          <Input
            type="number"
            value={section.paddingTop}
            onChange={(e) =>
              updateSection(section.id, { paddingTop: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Padding bottom">
          <Input
            type="number"
            value={section.paddingBottom}
            onChange={(e) =>
              updateSection(section.id, {
                paddingBottom: Number(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Padding left">
          <Input
            type="number"
            value={section.paddingLeft}
            onChange={(e) =>
              updateSection(section.id, { paddingLeft: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Padding right">
          <Input
            type="number"
            value={section.paddingRight}
            onChange={(e) =>
              updateSection(section.id, {
                paddingRight: Number(e.target.value),
              })
            }
          />
        </Field>
      </div>
    );
  }

  if (selection.type === "block") {
    const section = activeCanvas.sections.find(
      (s) => s.id === selection.sectionId,
    );

    const column = section?.columns.find((c) => c.id === selection.columnId);
    const block = column?.blocks.find((b) => b.id === selection.blockId);
    if (!block || !section || !column) return null;

    const update = (changes: Partial<Block>) =>
      updateBlock(section.id, column.id, block.id, changes);

    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          {block.type}
        </p>

        {block.type === "text" && (
          <>
            <Field label="Content">
              <Textarea
                className="h-20 resize-none"
                value={block.content}
                onChange={(e) => update({ content: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                value={block.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align}
                onValueChange={(v) =>
                  update({ align: v as "left" | "center" | "right" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Weight">
              <Select
                value={block.fontWeight}
                onValueChange={(v) =>
                  update({ fontWeight: v as "normal" | "bold" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </>
        )}

        {block.type === "image" && (
          <>
            <Field label="URL">
              <Input
                value={block.src}
                onChange={(e) => update({ src: e.target.value })}
              />
            </Field>
            <Field label="Alt text">
              <Input
                value={block.alt}
                onChange={(e) => update({ alt: e.target.value })}
              />
            </Field>
            <Field label="Width">
              <Input
                type="number"
                value={block.width}
                onChange={(e) => update({ width: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === "button" && (
          <>
            <Field label="Label">
              <Input
                value={block.label}
                onChange={(e) => update({ label: e.target.value })}
              />
            </Field>
            <Field label="URL">
              <Input
                value={block.href}
                onChange={(e) => update({ href: e.target.value })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
            <Field label="Border radius">
              <Input
                type="number"
                value={block.borderRadius}
                onChange={(e) =>
                  update({ borderRadius: Number(e.target.value) })
                }
              />
            </Field>
          </>
        )}

        {block.type === "divider" && (
          <>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Thickness">
              <Input
                type="number"
                value={block.thickness}
                onChange={(e) => update({ thickness: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === "spacer" && (
          <Field label="Height">
            <Input
              type="number"
              value={block.height}
              onChange={(e) => update({ height: Number(e.target.value) })}
            />
          </Field>
        )}

        {block.type === "social" && (
          <>
            <Field label="Align">
              <Select
                value={block.align}
                onValueChange={(v) =>
                  update({ align: v as "left" | "center" | "right" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Icon size">
              <Input
                type="number"
                value={block.iconSize}
                onChange={(e) => update({ iconSize: Number(e.target.value) })}
              />
            </Field>
            <Field label="Icon color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.iconColor}
                onChange={(e) => update({ iconColor: e.target.value })}
              />
            </Field>
            <Field label="Links">
              <div className="flex flex-col gap-2">
                {block.links.map((link, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-2 rounded-lg border border-border"
                  >
                    <Select
                      value={link.platform}
                      onValueChange={(v) => {
                        const links = [...block.links];
                        links[i] = { ...links[i], platform: v as any };
                        update({ links });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="twitter">Twitter / X</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="github">GitHub</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://"
                      value={link.url}
                      onChange={(e) => {
                        const links = [...block.links];
                        links[i] = { ...links[i], url: e.target.value };
                        update({ links });
                      }}
                    />
                    <button
                      onClick={() => {
                        const links = block.links.filter((_, idx) => idx !== i);
                        update({ links });
                      }}
                      className="text-xs text-destructive hover:underline text-left cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    update({
                      links: [
                        ...block.links,
                        { platform: "twitter" as const, url: "" },
                      ],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  + Add link
                </button>
              </div>
            </Field>
          </>
        )}

        {block.type === "product-card" && (
          <>
            <Field label="Image URL">
              <Input
                value={block.image}
                onChange={(e) => update({ image: e.target.value })}
              />
            </Field>
            <Field label="Title">
              <Input
                value={block.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <Textarea
                className="resize-none h-16"
                value={block.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            <Field label="Price">
              <Input
                value={block.price}
                onChange={(e) => update({ price: e.target.value })}
              />
            </Field>
            <Field label="Button label">
              <Input
                value={block.buttonLabel}
                onChange={(e) => update({ buttonLabel: e.target.value })}
              />
            </Field>
            <Field label="Button URL">
              <Input
                value={block.buttonHref}
                onChange={(e) => update({ buttonHref: e.target.value })}
              />
            </Field>
            <Field label="Button background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.buttonBgColor}
                onChange={(e) => update({ buttonBgColor: e.target.value })}
              />
            </Field>
            <Field label="Button text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.buttonTextColor}
                onChange={(e) => update({ buttonTextColor: e.target.value })}
              />
            </Field>
          </>
        )}

        {block.type === "unsubscribe" && (
          <>
            <Field label="Company name">
              <Input
                value={block.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
              />
            </Field>
            <Field label="Address">
              <Input
                value={block.address}
                onChange={(e) => update({ address: e.target.value })}
              />
            </Field>
            <Field label="Unsubscribe URL">
              <Input
                value={block.unsubscribeUrl}
                onChange={(e) => update({ unsubscribeUrl: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                value={block.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === "divider-text" && (
          <>
            <Field label="Text">
              <Input
                value={block.text}
                onChange={(e) => update({ text: e.target.value })}
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                value={block.fontSize}
                onChange={(e) => update({ fontSize: Number(e.target.value) })}
              />
            </Field>
          </>
        )}
      </div>
    );
  }
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-[11px] text-white/40">{label}</Label>
      {children}
    </div>
  );
}
