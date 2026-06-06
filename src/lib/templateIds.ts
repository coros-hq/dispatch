export const TEMPLATE_IDS = {
  minimal: "tpl_minimal",
  productLaunch: "tpl_product_launch",
  weeklyDigest: "tpl_weekly_digest",
  welcomeEmail: "tpl_welcome_email",
  promotional: "tpl_promotional",
  flashSale: "tpl_flash_sale",
  coldOutreach: "tpl_cold_outreach",
  followUp: "tpl_follow_up",
  orderConfirmation: "tpl_order_confirmation",
  companyUpdate: "tpl_company_update",
  brandNewsletter: "tpl_brand_newsletter",
} as const;

export type TemplateId = (typeof TEMPLATE_IDS)[keyof typeof TEMPLATE_IDS];
