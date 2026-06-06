# Personalization & Merge Tags

Mailshot supports merge tags in email content. These get replaced with real values when sending.

## Available merge tags
| Tag | Replaced with |
|-----|--------------|
| `{{first_name}}` | Recipient's first name |
| `{{last_name}}` | Recipient's last name |
| `{{email}}` | Recipient's email address |
| `{{unsubscribe_url}}` | Auto-generated unsubscribe link |

## Where to use them
- Text blocks: "Hi {{first_name}}, we have something special for you."
- Subject line: "{{first_name}}, your exclusive offer is here"
- Button labels: "Claim your offer, {{first_name}}"
- Hero headline: "Welcome back, {{first_name}}"

## CSV column mapping
When sending a campaign, upload a CSV with columns:
- Required: `email`
- Optional: `first_name`, `last_name`, plus any custom columns

During the campaign setup, you map CSV columns to merge tags.

## Fallback values
If a recipient's first_name is blank, the tag renders as empty string.
Best practice: write copy that works without the name — "Hi {{first_name}}," reads as "Hi," if name is missing. Instead use "Hi {{first_name}}👋" or just start with the content.

## Custom tags (Pro)
Pro users can use any CSV column as a merge tag: `{{company}}`, `{{plan}}`, `{{city}}`, etc.