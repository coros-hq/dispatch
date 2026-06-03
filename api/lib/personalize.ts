export type CampaignRecipient = {
  email: string;
  first_name?: string;
  last_name?: string;
  [key: string]: string | undefined;
};

export function personalizeContent(
  template: string,
  recipient: CampaignRecipient,
  appUrl: string,
): string {
  const unsubscribeUrl = `${appUrl}/api/unsubscribe?email=${encodeURIComponent(recipient.email)}`;

  let result = template;
  result = result.replace(/\{\{first_name\}\}/g, recipient.first_name ?? "");
  result = result.replace(/\{\{last_name\}\}/g, recipient.last_name ?? "");
  result = result.replace(/\{\{email\}\}/g, recipient.email);
  result = result.replace(/\{\{unsubscribe\}\}/g, unsubscribeUrl);
  result = result.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    if (key === "first_name" || key === "last_name" || key === "email" || key === "unsubscribe") {
      return "";
    }
    return recipient[key] ?? "";
  });
  return result;
}

export function hasUnsubscribePlaceholder(html: string): boolean {
  return /\{\{unsubscribe\}\}/i.test(html) || /unsubscribe/i.test(html);
}
