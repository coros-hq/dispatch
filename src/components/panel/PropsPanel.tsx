import { getActiveCanvas, useEditorStore } from "../../store/editor";
import type { Block } from "../../types";
import {
  datetimeLocalToIso,
  isoToDatetimeLocalValue,
} from "../../lib/block-helpers";
import {
  GOOGLE_FONT_PRESETS,
  SYSTEM_FONT_PRESETS,
  globalFontSelectValue,
} from "../../lib/google-fonts";
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
import { ImageUploader } from "@/components/ui/ImageUploader";

export default function PropsPanel() {
  const {
    selection,
    template,
    updateBlock,
    updateGlobalStyles,
    updateSection,
    readOnly,
  } = useEditorStore();
  const activeCanvas = getActiveCanvas(template);

  // Derive section and block from selection
  const section =
    selection.type !== "none"
      ? activeCanvas.sections.find((s) => s.id === selection.sectionId)
      : null;

  if (selection.type === "none") {
    return (
      <fieldset
        disabled={readOnly}
        className="p-4 flex flex-col gap-4 border-0 m-0 min-w-0 disabled:opacity-50"
      >
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
        <Field label="Google / system font">
          <Select
            value={globalFontSelectValue(
              activeCanvas.globalStyles.fontFamily,
              activeCanvas.globalStyles.googleFontCssImportUrl,
            )}
            onValueChange={(v) => {
              if (v === "custom") return;
              if (v.startsWith("gf:")) {
                const p = GOOGLE_FONT_PRESETS.find((x) => x.id === v.slice(3));
                if (p)
                  updateGlobalStyles({
                    fontFamily: p.fontFamily,
                    googleFontCssImportUrl: p.importUrl,
                  });
                return;
              }
              if (v.startsWith("sys:")) {
                const p = SYSTEM_FONT_PRESETS.find((x) => x.id === v.slice(4));
                if (p)
                  updateGlobalStyles({
                    fontFamily: p.fontFamily,
                    googleFontCssImportUrl: undefined,
                  });
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent className="max-h-70">
              <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                Google Fonts
              </p>
              {GOOGLE_FONT_PRESETS.map((p) => (
                <SelectItem key={p.id} value={`gf:${p.id}`}>
                  {p.label}
                </SelectItem>
              ))}
              <p className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                System
              </p>
              {SYSTEM_FONT_PRESETS.map((p) => (
                <SelectItem key={p.id} value={`sys:${p.id}`}>
                  {p.label}
                </SelectItem>
              ))}
              {globalFontSelectValue(
                activeCanvas.globalStyles.fontFamily,
                activeCanvas.globalStyles.googleFontCssImportUrl,
              ) === "custom" ? (
                <SelectItem value="custom" disabled>
                  Custom ({activeCanvas.globalStyles.fontFamily})
                </SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </Field>
      </fieldset>
    );
  }

  if (selection.type === "section" && section) {
    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Section
        </p>
        <Field label="Background">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer border border-border"
            value={section.bgColor}
            onChange={(e) =>
              updateSection(section.id, { bgColor: e.target.value })
            }
          />
        </Field>
        <Field label="Column gap">
          <Input
            type="number"
            value={section.columnGap ?? 0}
            onChange={(e) =>
              updateSection(section.id, { columnGap: Number(e.target.value) })
            }
          />
        </Field>
        <Field label="Border radius">
          <Input
            type="number"
            value={section.borderRadius ?? 0}
            onChange={(e) =>
              updateSection(section.id, {
                borderRadius: Number(e.target.value),
              })
            }
          />
        </Field>
        <Field label="Border color">
          <input
            type="color"
            className="w-full h-8 rounded cursor-pointer border border-border"
            value={section.borderColor ?? "#000000"}
            onChange={(e) =>
              updateSection(section.id, { borderColor: e.target.value })
            }
          />
        </Field>
        <Field label="Border width">
          <Input
            type="number"
            value={section.borderWidth ?? 0}
            onChange={(e) =>
              updateSection(section.id, { borderWidth: Number(e.target.value) })
            }
          />
        </Field>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
          Outer spacing
        </p>
        <p className="text-[11px] text-muted-foreground -mt-2">
          Margin around this section (space between sections).
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Margin top">
            <Input
              type="number"
              min={0}
              value={section.marginTop ?? 0}
              onChange={(e) =>
                updateSection(section.id, {
                  marginTop: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Margin bottom">
            <Input
              type="number"
              min={0}
              value={section.marginBottom ?? 0}
              onChange={(e) =>
                updateSection(section.id, {
                  marginBottom: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Margin left">
            <Input
              type="number"
              min={0}
              value={section.marginLeft ?? 0}
              onChange={(e) =>
                updateSection(section.id, {
                  marginLeft: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Margin right">
            <Input
              type="number"
              min={0}
              value={section.marginRight ?? 0}
              onChange={(e) =>
                updateSection(section.id, {
                  marginRight: Number(e.target.value),
                })
              }
            />
          </Field>
        </div>
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
          Inner padding
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Top">
            <Input
              type="number"
              value={section.paddingTop}
              onChange={(e) =>
                updateSection(section.id, {
                  paddingTop: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Bottom">
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
          <Field label="Left">
            <Input
              type="number"
              value={section.paddingLeft}
              onChange={(e) =>
                updateSection(section.id, {
                  paddingLeft: Number(e.target.value),
                })
              }
            />
          </Field>
          <Field label="Right">
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
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
          Columns
        </p>
        {section.columns.map((col, i) => (
          <div
            key={col.id}
            className="flex flex-col gap-2 border border-border rounded-lg p-2"
          >
            <Field label={`Column ${i + 1} width %`}>
              <Input
                type="number"
                min={10}
                max={90}
                value={col.width ?? Math.floor(100 / section.columns.length)}
                onChange={(e) => {
                  const columns = section.columns.map((c, ci) =>
                    ci === i ? { ...c, width: Number(e.target.value) } : c,
                  );
                  updateSection(section.id, { columns });
                }}
              />
            </Field>
            <Field label={`Column ${i + 1} vertical align`}>
              <Select
                value={col.verticalAlign ?? "top"}
                onValueChange={(v) => {
                  const columns = section.columns.map((c, ci) =>
                    ci === i
                      ? {
                          ...c,
                          verticalAlign: v as "top" | "middle" | "bottom",
                        }
                      : c,
                  );
                  updateSection(section.id, { columns });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        ))}
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

    const rawType = block.type;
    const typeLabel =
      rawType === "nav-bar"
        ? "navigation"
        : rawType === "divider-text"
          ? "divider text"
          : rawType === "image-grid"
            ? "image grid"
            : rawType === "logo-strip"
              ? "logo strip"
              : rawType.replace(/-/g, " ");

    return (
      <div className="p-4 flex flex-col gap-4">
        <p className="text-[10px] font-medium text-white/30 uppercase tracking-widest">
          {typeLabel}
        </p>

        {/* TEXT BLOCK */}
        {block.type === "text" && (
          <>
            <Field label="Content">
              <Textarea
                className="resize-none h-20"
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
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align}
                onValueChange={(v) => update({ align: v as any })}
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
                onValueChange={(v) => update({ fontWeight: v as any })}
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
            <Field label="Line height">
              <Input
                type="number"
                step="0.1"
                value={block.lineHeight ?? 1.5}
                onChange={(e) => update({ lineHeight: Number(e.target.value) })}
              />
            </Field>
            <Field label="Letter spacing">
              <Input
                type="number"
                step="0.5"
                value={block.letterSpacing ?? 0}
                onChange={(e) =>
                  update({ letterSpacing: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Decoration">
              <Select
                value={block.textDecoration ?? "none"}
                onValueChange={(v) => update({ textDecoration: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="underline">Underline</SelectItem>
                  <SelectItem value="line-through">Strikethrough</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Link URL">
              <Input
                placeholder="https://"
                value={block.href ?? ""}
                onChange={(e) => update({ href: e.target.value })}
              />
            </Field>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Padding
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Top">
                <Input
                  type="number"
                  value={block.paddingTop ?? 4}
                  onChange={(e) =>
                    update({ paddingTop: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Bottom">
                <Input
                  type="number"
                  value={block.paddingBottom ?? 4}
                  onChange={(e) =>
                    update({ paddingBottom: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Left">
                <Input
                  type="number"
                  value={block.paddingLeft ?? 0}
                  onChange={(e) =>
                    update({ paddingLeft: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Right">
                <Input
                  type="number"
                  value={block.paddingRight ?? 0}
                  onChange={(e) =>
                    update({ paddingRight: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          </>
        )}

        {/* IMAGE BLOCK */}
        {block.type === "image" && (
          <>
            <Field label="Image">
              <ImageUploader
                value={block.src}
                onChange={(url) => update({ src: url })}
              />
            </Field>
            <Field label="Alt text">
              <Input
                value={block.alt}
                onChange={(e) => update({ alt: e.target.value })}
                placeholder="Describe the image"
              />
            </Field>
            <Field label="Width">
              <Input
                type="number"
                value={block.width}
                onChange={(e) => update({ width: Number(e.target.value) })}
              />
            </Field>
            <Field label="Object fit">
              <Select
                value={block.objectFit ?? "cover"}
                onValueChange={(v) =>
                  update({ objectFit: v as "contain" | "cover" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Fixed height (px)">
              <Input
                type="number"
                min={0}
                placeholder="Auto"
                value={block.height ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  update({
                    height: raw === "" ? undefined : Number(raw),
                  });
                }}
              />
            </Field>
            <Field label="Image link URL">
              <Input
                placeholder="https://"
                value={block.linkHref ?? ""}
                onChange={(e) =>
                  update({
                    linkHref: e.target.value.trim() || undefined,
                  })
                }
              />
            </Field>
            <Field label="Border radius">
              <Input
                type="number"
                value={block.borderRadius ?? 0}
                onChange={(e) =>
                  update({ borderRadius: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Padding
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Top">
                <Input
                  type="number"
                  value={block.paddingTop ?? 0}
                  onChange={(e) =>
                    update({ paddingTop: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Bottom">
                <Input
                  type="number"
                  value={block.paddingBottom ?? 0}
                  onChange={(e) =>
                    update({ paddingBottom: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Left">
                <Input
                  type="number"
                  value={block.paddingLeft ?? 0}
                  onChange={(e) =>
                    update({ paddingLeft: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Right">
                <Input
                  type="number"
                  value={block.paddingRight ?? 0}
                  onChange={(e) =>
                    update({ paddingRight: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
          </>
        )}

        {/* BUTTON BLOCK */}
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
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
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
            <Field label="Border radius">
              <Input
                type="number"
                value={block.borderRadius}
                onChange={(e) =>
                  update({ borderRadius: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Border color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.borderColor ?? block.bgColor}
                onChange={(e) => update({ borderColor: e.target.value })}
              />
            </Field>
            <Field label="Border width">
              <Input
                type="number"
                value={block.borderWidth ?? 0}
                onChange={(e) =>
                  update({ borderWidth: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "center"}
                onValueChange={(v) => update({ align: v as any })}
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
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Padding
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Top">
                <Input
                  type="number"
                  value={block.paddingTop ?? 8}
                  onChange={(e) =>
                    update({ paddingTop: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Bottom">
                <Input
                  type="number"
                  value={block.paddingBottom ?? 8}
                  onChange={(e) =>
                    update({ paddingBottom: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Left">
                <Input
                  type="number"
                  value={block.paddingLeft ?? 0}
                  onChange={(e) =>
                    update({ paddingLeft: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Right">
                <Input
                  type="number"
                  value={block.paddingRight ?? 0}
                  onChange={(e) =>
                    update({ paddingRight: Number(e.target.value) })
                  }
                />
              </Field>
            </div>
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
            {/* ── IMAGE ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Image
            </p>
            <Field label="Source">
              <ImageUploader
                value={block.image}
                onChange={(url) => update({ image: url })}
              />
            </Field>
            <Field label="Aspect ratio">
              <Select
                value={block.imageAspectRatio ?? "16:9"}
                onValueChange={(v) => update({ imageAspectRatio: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9</SelectItem>
                  <SelectItem value="4:3">4:3</SelectItem>
                  <SelectItem value="3:2">3:2</SelectItem>
                  <SelectItem value="1:1">1:1</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Corner radius">
              <Input
                type="number"
                min={0}
                max={48}
                value={block.imageBorderRadius ?? 0}
                onChange={(e) =>
                  update({ imageBorderRadius: Number(e.target.value) })
                }
              />
            </Field>

            {/* ── TITLE ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Title
            </p>
            <Field label="Text">
              <Input
                value={block.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                min={10}
                max={64}
                value={block.titleFontSize ?? 18}
                onChange={(e) =>
                  update({ titleFontSize: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Font weight">
              <Select
                value={block.titleFontWeight ?? "600"}
                onValueChange={(v) => update({ titleFontWeight: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Regular</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.titleColor ?? "#111111"}
                onChange={(e) => update({ titleColor: e.target.value })}
              />
            </Field>

            {/* ── DESCRIPTION ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Description
            </p>
            <Field label="Text">
              <Textarea
                className="resize-none h-20"
                value={block.description}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                min={10}
                max={32}
                value={block.descriptionFontSize ?? 14}
                onChange={(e) =>
                  update({ descriptionFontSize: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.descriptionColor ?? "#555555"}
                onChange={(e) => update({ descriptionColor: e.target.value })}
              />
            </Field>

            {/* ── PRICE ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Price
            </p>
            <Field label="Text">
              <Input
                value={block.price}
                onChange={(e) => update({ price: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                min={10}
                max={48}
                value={block.priceFontSize ?? 16}
                onChange={(e) =>
                  update({ priceFontSize: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Font weight">
              <Select
                value={block.priceFontWeight ?? "700"}
                onValueChange={(v) => update({ priceFontWeight: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="400">Regular</SelectItem>
                  <SelectItem value="500">Medium</SelectItem>
                  <SelectItem value="600">Semibold</SelectItem>
                  <SelectItem value="700">Bold</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.priceColor ?? "#111111"}
                onChange={(e) => update({ priceColor: e.target.value })}
              />
            </Field>

            {/* ── BUTTON ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Button
            </p>
            <Field label="Label">
              <Input
                value={block.buttonLabel}
                onChange={(e) => update({ buttonLabel: e.target.value })}
              />
            </Field>
            <Field label="URL">
              <Input
                placeholder="https://"
                value={block.buttonHref}
                onChange={(e) => update({ buttonHref: e.target.value })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.buttonBgColor}
                onChange={(e) => update({ buttonBgColor: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.buttonTextColor}
                onChange={(e) => update({ buttonTextColor: e.target.value })}
              />
            </Field>
            <Field label="Font size">
              <Input
                type="number"
                min={10}
                max={24}
                value={block.buttonFontSize ?? 14}
                onChange={(e) =>
                  update({ buttonFontSize: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Corner radius">
              <Input
                type="number"
                min={0}
                max={999}
                value={block.buttonBorderRadius ?? 4}
                onChange={(e) =>
                  update({ buttonBorderRadius: Number(e.target.value) })
                }
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Padding X">
                <Input
                  type="number"
                  min={0}
                  max={80}
                  value={block.buttonPaddingX ?? 20}
                  onChange={(e) =>
                    update({ buttonPaddingX: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Padding Y">
                <Input
                  type="number"
                  min={0}
                  max={40}
                  value={block.buttonPaddingY ?? 10}
                  onChange={(e) =>
                    update({ buttonPaddingY: Number(e.target.value) })
                  }
                />
              </Field>
            </div>

            {/* ── CARD ── */}
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest pt-2">
              Card
            </p>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.cardBgColor ?? "#ffffff"}
                onChange={(e) => update({ cardBgColor: e.target.value })}
              />
            </Field>
            <Field label="Padding">
              <Input
                type="number"
                min={0}
                max={64}
                value={block.cardPadding ?? 16}
                onChange={(e) =>
                  update({ cardPadding: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.cardAlign ?? "left"}
                onValueChange={(v) => update({ cardAlign: v as any })}
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
            <Field label="Border color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.cardBorderColor ?? "#e5e7eb"}
                onChange={(e) => update({ cardBorderColor: e.target.value })}
              />
            </Field>
            <Field label="Border width">
              <Input
                type="number"
                min={0}
                max={8}
                value={block.cardBorderWidth ?? 0}
                onChange={(e) =>
                  update({ cardBorderWidth: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Corner radius">
              <Input
                type="number"
                min={0}
                max={32}
                value={block.cardBorderRadius ?? 0}
                onChange={(e) =>
                  update({ cardBorderRadius: Number(e.target.value) })
                }
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

        {block.type === "countdown" && (
          <>
            <Field label="Target date">
              <Input
                type="datetime-local"
                value={isoToDatetimeLocalValue(block.targetDateIso)}
                onChange={(e) =>
                  update({ targetDateIso: datetimeLocalToIso(e.target.value) })
                }
              />
            </Field>
            <Field label="Headline">
              <Input
                value={block.headline ?? ""}
                onChange={(e) => update({ headline: e.target.value })}
                placeholder="e.g. Sale ends soon"
              />
            </Field>
            <Field label="When expired">
              <Input
                value={block.expiredMessage ?? ""}
                onChange={(e) => update({ expiredMessage: e.target.value })}
                placeholder="Message after target date"
              />
            </Field>
            <Field label="Labels (days, hours, mins, secs)">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Days"
                  value={block.labelDays ?? ""}
                  onChange={(e) => update({ labelDays: e.target.value })}
                />
                <Input
                  placeholder="Hours"
                  value={block.labelHours ?? ""}
                  onChange={(e) => update({ labelHours: e.target.value })}
                />
                <Input
                  placeholder="Mins"
                  value={block.labelMinutes ?? ""}
                  onChange={(e) => update({ labelMinutes: e.target.value })}
                />
                <Input
                  placeholder="Secs"
                  value={block.labelSeconds ?? ""}
                  onChange={(e) => update({ labelSeconds: e.target.value })}
                />
              </div>
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "center"}
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
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#f4f7fb"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Number tiles">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.accentColor ?? "#2563eb"}
                onChange={(e) => update({ accentColor: e.target.value })}
              />
            </Field>
            <Field label="Text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.textColor ?? "#0f172a"}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
          </>
        )}

        {block.type === "testimonial" && (
          <>
            <Field label="Quote">
              <Textarea
                className="resize-none min-h-25"
                value={block.quote}
                onChange={(e) => update({ quote: e.target.value })}
              />
            </Field>
            <Field label="Author name">
              <Input
                value={block.authorName}
                onChange={(e) => update({ authorName: e.target.value })}
              />
            </Field>
            <Field label="Author title">
              <Input
                value={block.authorTitle ?? ""}
                onChange={(e) => update({ authorTitle: e.target.value })}
                placeholder="Role, company"
              />
            </Field>
            <Field label="Avatar URL">
              <Input
                value={block.avatarSrc ?? ""}
                onChange={(e) => update({ avatarSrc: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "left"}
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
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Quote text color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.textColor ?? "#334155"}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
            <Field label="Author color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.authorColor ?? "#0f172a"}
                onChange={(e) => update({ authorColor: e.target.value })}
              />
            </Field>
            <Field label="Accent border">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.accentColor ?? "#6366f1"}
                onChange={(e) => update({ accentColor: e.target.value })}
              />
            </Field>
          </>
        )}

        {block.type === "coupon" && (
          <>
            <Field label="Coupon code">
              <Input
                value={block.code}
                onChange={(e) => update({ code: e.target.value })}
              />
            </Field>
            <Field label="Description">
              <Input
                value={block.description ?? ""}
                onChange={(e) => update({ description: e.target.value })}
              />
            </Field>
            <Field label="Code font size">
              <Input
                type="number"
                min={12}
                max={40}
                value={block.codeFontSize ?? 22}
                onChange={(e) =>
                  update({ codeFontSize: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "center"}
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
            <Field label="Inner background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#fdfdfd"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Dash / border">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.borderColor ?? "#1e293b"}
                onChange={(e) => update({ borderColor: e.target.value })}
              />
            </Field>
            <Field label="Code color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.textColor ?? "#0f172a"}
                onChange={(e) => update({ textColor: e.target.value })}
              />
            </Field>
          </>
        )}

        {block.type === "rating" && (
          <>
            <Field label="Rating (0–max)">
              <Input
                type="number"
                step={0.1}
                min={0}
                max={block.maxStars ?? 5}
                value={block.rating}
                onChange={(e) => update({ rating: Number(e.target.value) })}
              />
            </Field>
            <Field label="Star count">
              <Input
                type="number"
                min={1}
                max={10}
                value={block.maxStars ?? 5}
                onChange={(e) => update({ maxStars: Number(e.target.value) })}
              />
            </Field>
            <Field label="Label">
              <Input
                value={block.label ?? ""}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="Optional caption"
              />
            </Field>
            <Field label="Align">
              <Select
                value={block.align ?? "center"}
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
            <Field label="Star size">
              <Input
                type="number"
                min={10}
                max={36}
                value={block.starSize ?? 22}
                onChange={(e) => update({ starSize: Number(e.target.value) })}
              />
            </Field>
            <Field label="Filled star color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.starColor ?? "#f59e0b"}
                onChange={(e) => update({ starColor: e.target.value })}
              />
            </Field>
            <Field label="Empty star color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.emptyStarColor ?? "#e2e8f0"}
                onChange={(e) => update({ emptyStarColor: e.target.value })}
              />
            </Field>
          </>
        )}

        {block.type === "image-grid" && (
          <>
            <Field label="Columns">
              <Select
                value={String(block.columns)}
                onValueChange={(v) =>
                  update({ columns: Number(v) as 2 | 3 | 4 })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Gap (px)">
              <Input
                type="number"
                min={0}
                value={block.gap}
                onChange={(e) => update({ gap: Number(e.target.value) })}
              />
            </Field>
            <Field label="Corner radius">
              <Input
                type="number"
                min={0}
                value={block.borderRadius}
                onChange={(e) =>
                  update({ borderRadius: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Images">
              <div className="flex flex-col gap-2">
                {block.images.map((im, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-2 rounded-lg border border-border"
                  >
                    <Input
                      placeholder="Image URL"
                      value={im.src}
                      onChange={(e) => {
                        const images = [...block.images];
                        images[i] = { ...images[i], src: e.target.value };
                        update({ images });
                      }}
                    />
                    <Input
                      placeholder="Alt text"
                      value={im.alt}
                      onChange={(e) => {
                        const images = [...block.images];
                        images[i] = { ...images[i], alt: e.target.value };
                        update({ images });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          images: block.images.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-destructive hover:underline text-left cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update({
                      images: [
                        ...block.images,
                        { src: "https://placehold.co/400x280", alt: "" },
                      ],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer text-left"
                >
                  + Add image
                </button>
              </div>
            </Field>
          </>
        )}

        {block.type === "logo-strip" && (
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
            <Field label="Logo height (px)">
              <Input
                type="number"
                min={12}
                max={120}
                value={block.logoHeight}
                onChange={(e) => update({ logoHeight: Number(e.target.value) })}
              />
            </Field>
            <Field label="Gap (px)">
              <Input
                type="number"
                min={0}
                value={block.gap}
                onChange={(e) => update({ gap: Number(e.target.value) })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Logos">
              <div className="flex flex-col gap-2">
                {block.logos.map((logo, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-2 rounded-lg border border-border"
                  >
                    <Input
                      placeholder="Image URL"
                      value={logo.src}
                      onChange={(e) => {
                        const logos = [...block.logos];
                        logos[i] = { ...logos[i], src: e.target.value };
                        update({ logos });
                      }}
                    />
                    <Input
                      placeholder="Alt"
                      value={logo.alt}
                      onChange={(e) => {
                        const logos = [...block.logos];
                        logos[i] = { ...logos[i], alt: e.target.value };
                        update({ logos });
                      }}
                    />
                    <Input
                      placeholder="Link (optional)"
                      value={logo.href ?? ""}
                      onChange={(e) => {
                        const logos = [...block.logos];
                        logos[i] = {
                          ...logos[i],
                          href: e.target.value.trim() || undefined,
                        };
                        update({ logos });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        update({
                          logos: block.logos.filter((_, idx) => idx !== i),
                        })
                      }
                      className="text-xs text-destructive hover:underline text-left cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update({
                      logos: [
                        ...block.logos,
                        {
                          src: "https://placehold.co/120x48/png?text=Logo",
                          alt: "Logo",
                        },
                      ],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer text-left"
                >
                  + Add logo
                </button>
              </div>
            </Field>
          </>
        )}

        {block.type === "hero" && (
          <>
            <Field label="Background image">
              <ImageUploader
                value={block.backgroundImage || ""}
                onChange={(url) => update({ backgroundImage: url })}
              />
            </Field>
            <Field label="Title">
              <Input
                value={block.title}
                onChange={(e) => update({ title: e.target.value })}
              />
            </Field>
            <Field label="Subtitle">
              <Textarea
                className="resize-none min-h-[72px]"
                value={block.subtitle}
                onChange={(e) => update({ subtitle: e.target.value })}
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
            <Field label="Overlay (CSS rgba)">
              <Input
                value={block.overlayColor}
                onChange={(e) => update({ overlayColor: e.target.value })}
                placeholder="rgba(0,0,0,0.45)"
              />
            </Field>
            <Field label="Text color">
              <Input
                value={block.textColor}
                onChange={(e) => update({ textColor: e.target.value })}
                placeholder="#ffffff or rgba(255,255,255,0.95)"
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
            <Field label="Min height (px)">
              <Input
                type="number"
                min={120}
                value={block.minHeight}
                onChange={(e) => update({ minHeight: Number(e.target.value) })}
              />
            </Field>
          </>
        )}

        {block.type === "nav-bar" && (
          <>
            <Field label="Logo URL">
              <Input
                value={block.logoSrc}
                onChange={(e) => update({ logoSrc: e.target.value })}
              />
            </Field>
            <Field label="Logo alt">
              <Input
                value={block.logoAlt}
                onChange={(e) => update({ logoAlt: e.target.value })}
              />
            </Field>
            <Field label="Logo width (px)">
              <Input
                type="number"
                min={60}
                max={320}
                value={block.logoWidth ?? 132}
                onChange={(e) => update({ logoWidth: Number(e.target.value) })}
              />
            </Field>
            <Field label="Background">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.bgColor ?? "#ffffff"}
                onChange={(e) => update({ bgColor: e.target.value })}
              />
            </Field>
            <Field label="Link color">
              <input
                type="color"
                className="w-full h-8 rounded cursor-pointer border border-border"
                value={block.linkColor ?? "#0f172a"}
                onChange={(e) => update({ linkColor: e.target.value })}
              />
            </Field>
            <Field label="Links">
              <div className="flex flex-col gap-2">
                {block.links.map((link, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-2 rounded-lg border border-border"
                  >
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const links = [...block.links];
                        links[i] = { ...links[i], label: e.target.value };
                        update({ links });
                      }}
                    />
                    <Input
                      placeholder="https://"
                      value={link.href}
                      onChange={(e) => {
                        const links = [...block.links];
                        links[i] = { ...links[i], href: e.target.value };
                        update({ links });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        update({
                          links: block.links.filter((_, idx) => idx !== i),
                        });
                      }}
                      className="text-xs text-destructive hover:underline text-left cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    update({
                      links: [...block.links, { label: "New", href: "" }],
                    })
                  }
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer text-left"
                >
                  + Add link
                </button>
              </div>
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
