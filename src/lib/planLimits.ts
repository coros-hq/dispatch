export type Plan = "free" | "pro";

export const PLAN_LIMITS = {
  free: {
    maxProjects: 3,
    maxPagesPerProject: 2,
    maxTestEmailsPerMonth: 100,
    maxCampaignContacts: 500,
    maxCampaignsPerMonth: 1,
    canUseTeams: false,
    maxImageUploads: 10,
    maxImageSizeMb: 2,
    canUploadImages: true,
    canUseCustomDomain: false,
    canSavePublicTemplates: false,
    canAccessCommunityTemplates: false,
  },
  pro: {
    maxProjects: Infinity,
    maxPagesPerProject: Infinity,
    maxTestEmailsPerMonth: Infinity,
    maxCampaignContacts: Infinity,
    maxCampaignsPerMonth: Infinity,
    canUseTeams: true,
    maxImageUploads: Infinity,
    maxImageSizeMb: 5,
    canUploadImages: true,
    canUseCustomDomain: true,
    canSavePublicTemplates: true,
    canAccessCommunityTemplates: true,
  },
} as const;
