export type TextBlock = {
  id: string;
  type: "text";
  content: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  fontWeight: "normal" | "bold";
};

export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt: string;
  width: number;
};

export type ButtonBlock = {
  id: string;
  type: "button";
  label: string;
  href: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
};

export type DividerBlock = {
  id: string;
  type: "divider";
  color: string;
  thickness: number;
};

export type SpacerBlock = {
  id: string;
  type: "spacer";
  height: number;
};

export type Block =
  | TextBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | SpacerBlock;

export type Column = {
  id: string;
  blocks: Block[];
};

export type Section = {
  id: string;
  columns: Column[];
  bgColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
};

export type GlobalStyles = {
  fontFamily: string;
  bgColor: string;
  contentWidth: number;
};

export type Template = {
  id: string;
  name: string;
  canvases: Canvas[];
  activeCanvasId: string;
};

export type Canvas = {
  id: string;
  name: string;
  sections: Section[];
  globalStyles: GlobalStyles;
};
