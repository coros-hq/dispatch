export type ImageBlock = {
  id: string;
  type: "image";
  src: string;
  alt: string;
  width: number;
  borderRadius?: number;
  bgColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  objectFit?: "contain" | "cover";
  height?: number;
  linkHref?: string;
};

export type ButtonBlock = {
  id: string;
  type: "button";
  label: string;
  href: string;
  bgColor: string;
  textColor: string;
  borderRadius: number;
  align?: "left" | "center" | "right";
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  borderColor?: string;
  borderWidth?: number;
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
  | SpacerBlock
  | SocialBlock
  | ProductCardBlock
  | UnsubscribeBlock
  | DividerTextBlock
  | CountdownBlock
  | TestimonialBlock
  | CouponBlock
  | RatingBlock
  | NavBarBlock
  | ImageGridBlock
  | LogoStripBlock
  | HeroBlock;

export type TextBlock = {
  id: string;
  type: "text";
  content: string;
  fontSize: number;
  color: string;
  align: "left" | "center" | "right";
  fontWeight: "normal" | "bold";
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: "none" | "underline" | "line-through";
  href?: string;
  bgColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
};

export type Column = {
  id: string;
  blocks: Block[];
  width?: number; // percentage, e.g. 30, 50, 70
  verticalAlign?: "top" | "middle" | "bottom";
};

export type Section = {
  id: string;
  columns: Column[];
  bgColor: string;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  /** Space outside the section (email output uses wrapper cell padding). */
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  columnGap?: number;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
};

export type GlobalStyles = {
  fontFamily: string;
  /** When set, editor loads this stylesheet and exported HTML includes `@import`. */
  googleFontCssImportUrl?: string;
  bgColor: string;
  contentWidth: number;
};

export type Canvas = {
  id: string;
  name: string;
  x: number;
  y: number;
  sections: Section[];
  globalStyles: GlobalStyles;
};

/** One newsletter page (e.g. PDF page). Contains one or more canvases as A/B variants. */
export type Page = {
  id: string;
  name: string;
  canvases: Canvas[];
  activeCanvasId: string;
};

export type Template = {
  id: string;
  name: string;
  pages: Page[];
  activePageId: string;
};

export type SocialLink = {
  platform:
    | "twitter"
    | "linkedin"
    | "instagram"
    | "github"
    | "facebook"
    | "youtube";
  url: string;
};

export type SocialBlock = {
  id: string;
  type: "social";
  links: SocialLink[];
  align: "left" | "center" | "right";
  iconSize: number;
  iconColor: string;
};

export type ProductCardBlock = {
  id: string;
  type: "product-card";

  // Image
  image: string;
  imageAspectRatio?: "1:1" | "4:3" | "3:2" | "16:9";
  imageBorderRadius?: number;

  // Title
  title: string;
  titleFontSize?: number;
  titleFontWeight?: "400" | "500" | "600" | "700";
  titleFontFamily?: string;
  titleColor?: string;

  // Description
  description: string;
  descriptionFontSize?: number;
  descriptionFontFamily?: string;
  descriptionColor?: string;

  // Price
  price: string;
  priceFontSize?: number;
  priceFontWeight?: "400" | "500" | "600" | "700";
  priceColor?: string;

  // Button
  buttonLabel: string;
  buttonHref: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonFontSize?: number;
  buttonBorderRadius?: number;
  buttonPaddingX?: number;
  buttonPaddingY?: number;

  // Card layout
  cardPadding?: number;
  cardBgColor?: string;
  cardBorderColor?: string;
  cardBorderWidth?: number;
  cardBorderRadius?: number;
  cardAlign?: "left" | "center" | "right";
};

export type UnsubscribeBlock = {
  id: string;
  type: "unsubscribe";
  companyName: string;
  address: string;
  unsubscribeUrl: string;
  textColor: string;
  fontSize: number;
};

export type DividerTextBlock = {
  id: string;
  type: "divider-text";
  text: string;
  color: string;
  fontSize: number;
};

export type CountdownBlock = {
  id: string;
  type: "countdown";
  /** ISO 8601 date-time to count down to */
  targetDateIso: string;
  headline?: string;
  labelDays?: string;
  labelHours?: string;
  labelMinutes?: string;
  labelSeconds?: string;
  expiredMessage?: string;
  bgColor?: string;
  textColor?: string;
  accentColor?: string;
  align?: "left" | "center" | "right";
};

export type TestimonialBlock = {
  id: string;
  type: "testimonial";
  quote: string;
  authorName: string;
  authorTitle?: string;
  avatarSrc?: string;
  accentColor?: string;
  textColor?: string;
  authorColor?: string;
  bgColor?: string;
  align?: "left" | "center" | "right";
};

export type CouponBlock = {
  id: string;
  type: "coupon";
  code: string;
  description?: string;
  bgColor?: string;
  borderColor?: string;
  textColor?: string;
  codeFontSize?: number;
  align?: "left" | "center" | "right";
};

export type RatingBlock = {
  id: string;
  type: "rating";
  rating: number;
  maxStars?: number;
  starColor?: string;
  emptyStarColor?: string;
  label?: string;
  align?: "left" | "center" | "right";
  starSize?: number;
};

export type NavBarLink = { label: string; href: string };

export type NavBarBlock = {
  id: string;
  type: "nav-bar";
  logoSrc: string;
  logoAlt: string;
  logoWidth?: number;
  links: NavBarLink[];
  bgColor?: string;
  linkColor?: string;
};

export type ImageGridBlock = {
  id: string;
  type: "image-grid";
  images: { src: string; alt: string }[];
  columns: 2 | 3 | 4;
  gap: number;
  borderRadius: number;
};

export type LogoStripBlock = {
  id: string;
  type: "logo-strip";
  logos: { src: string; alt: string; href?: string }[];
  align: "left" | "center" | "right";
  logoHeight: number;
  gap: number;
  bgColor: string;
};

export type HeroBlock = {
  id: string;
  type: "hero";
  backgroundImage?: string;
  backgroundColor?: string;
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  buttonHref?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  /** e.g. rgba(0,0,0,0.45) */
  overlayColor?: string;
  textColor?: string;
  align?: "left" | "center" | "right";
  minHeight?: number;
};
