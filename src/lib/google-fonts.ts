/** Curated Google Fonts for newsletters — CSS2 API URLs and `font-family` stacks. */
export type GoogleFontPreset = {
  id: string;
  label: string;
  fontFamily: string;
  /** Full `https://fonts.googleapis.com/css2?...` URL for `<link>` / `@import` */
  importUrl: string;
};

const w =
  "ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700";
const q = (name: string) =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}:${w}&display=swap`;

export const GOOGLE_FONT_PRESETS: GoogleFontPreset[] = [
  { id: "inter", label: "Inter", fontFamily: "'Inter', sans-serif", importUrl: q("Inter") },
  { id: "roboto", label: "Roboto", fontFamily: "'Roboto', sans-serif", importUrl: q("Roboto") },
  {
    id: "open-sans",
    label: "Open Sans",
    fontFamily: "'Open Sans', sans-serif",
    importUrl: q("Open+Sans"),
  },
  { id: "lato", label: "Lato", fontFamily: "'Lato', sans-serif", importUrl: q("Lato") },
  {
    id: "montserrat",
    label: "Montserrat",
    fontFamily: "'Montserrat', sans-serif",
    importUrl: q("Montserrat"),
  },
  {
    id: "playfair",
    label: "Playfair Display",
    fontFamily: "'Playfair Display', serif",
    importUrl: q("Playfair+Display"),
  },
  {
    id: "merriweather",
    label: "Merriweather",
    fontFamily: "'Merriweather', serif",
    importUrl: q("Merriweather"),
  },
  {
    id: "raleway",
    label: "Raleway",
    fontFamily: "'Raleway', sans-serif",
    importUrl: q("Raleway"),
  },
  {
    id: "poppins",
    label: "Poppins",
    fontFamily: "'Poppins', sans-serif",
    importUrl: q("Poppins"),
  },
  { id: "oswald", label: "Oswald", fontFamily: "'Oswald', sans-serif", importUrl: q("Oswald") },
  {
    id: "source-sans",
    label: "Source Sans Pro",
    fontFamily: "'Source Sans Pro', sans-serif",
    importUrl: q("Source+Sans+Pro"),
  },
  { id: "pt-serif", label: "PT Serif", fontFamily: "'PT Serif', serif", importUrl: q("PT+Serif") },
  { id: "nunito", label: "Nunito", fontFamily: "'Nunito', sans-serif", importUrl: q("Nunito") },
  {
    id: "work-sans",
    label: "Work Sans",
    fontFamily: "'Work Sans', sans-serif",
    importUrl: q("Work+Sans"),
  },
  { id: "dm-sans", label: "DM Sans", fontFamily: "'DM Sans', sans-serif", importUrl: q("DM+Sans") },
  {
    id: "space-grotesk",
    label: "Space Grotesk",
    fontFamily: "'Space Grotesk', sans-serif",
    importUrl: q("Space+Grotesk"),
  },
];

export type SystemFontPreset = { id: string; label: string; fontFamily: string };

export const SYSTEM_FONT_PRESETS: SystemFontPreset[] = [
  { id: "arial", label: "Arial (system)", fontFamily: "Arial, sans-serif" },
  { id: "georgia", label: "Georgia (system)", fontFamily: "Georgia, serif" },
  {
    id: "times",
    label: "Times New Roman (system)",
    fontFamily: "'Times New Roman', serif",
  },
  { id: "verdana", label: "Verdana (system)", fontFamily: "Verdana, sans-serif" },
];

/** Match persisted `fontFamily` + optional import URL to a select value. */
export function globalFontSelectValue(
  fontFamily: string,
  importUrl?: string,
): string {
  const gf = GOOGLE_FONT_PRESETS.find(
    (p) => p.fontFamily === fontFamily && p.importUrl === importUrl,
  );
  if (gf) return `gf:${gf.id}`;
  const sys = SYSTEM_FONT_PRESETS.find((p) => p.fontFamily === fontFamily);
  if (sys) return `sys:${sys.id}`;
  if (importUrl) {
    const byUrl = GOOGLE_FONT_PRESETS.find((p) => p.importUrl === importUrl);
    if (byUrl) return `gf:${byUrl.id}`;
  }
  return "custom";
}
