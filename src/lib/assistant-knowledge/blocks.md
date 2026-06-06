# Mailshot Block Types

Blocks are the smallest unit of content in Mailshot. They live inside columns inside sections.
IMPORTANT: Use the exact prop names listed below — wrong names are silently ignored.

## text
Props: `content` (HTML string), `fontSize` (number), `color` (hex), `align` ("left"|"center"|"right"), `fontFamily`, `fontWeight` ("normal"|"bold"), `padding`
Example: `{ "type": "text", "content": "Hello world", "fontSize": 18, "color": "#111111", "align": "center", "fontWeight": "bold" }`

## image
Props: `src` (URL), `alt`, `width` (number, px), `align`, `link`, `borderRadius`, `padding`
Example: `{ "type": "image", "src": "https://placehold.co/600x300", "alt": "Hero", "width": 600 }`

## button
Props: `label`, `href`, `bgColor` (hex), `textColor` (hex), `borderRadius` (number), `align`, `padding`, `fontSize`
NOTE: background color is `bgColor` NOT `backgroundColor`
Example: `{ "type": "button", "label": "Shop Now", "href": "#", "bgColor": "#111111", "textColor": "#ffffff", "borderRadius": 6, "align": "center" }`

## divider
Props: `color` (hex), `thickness` (number, px), `width` (number, %), `align`, `padding`
Example: `{ "type": "divider", "color": "#eeeeee", "thickness": 1 }`

## spacer
Props: `height` (number, px)
Example: `{ "type": "spacer", "height": 24 }`

## social
Props: `links` (array of { platform, url }), `align`, `iconSize`, `iconColor`
Platforms: "twitter", "instagram", "facebook", "linkedin", "youtube", "tiktok", "github"
Example: `{ "type": "social", "links": [{ "platform": "twitter", "url": "https://twitter.com" }], "align": "center", "iconSize": 20, "iconColor": "#666666" }`

## product-card
Props: `image`, `name`, `price`, `description`, `buttonLabel`, `buttonHref`, `bgColor`, `layout` ("vertical"|"horizontal")
Example: `{ "type": "product-card", "name": "Product", "price": "$29", "buttonLabel": "Buy Now", "buttonHref": "#", "layout": "vertical" }`

## unsubscribe
Props: `companyName`, `address`, `unsubscribeUrl`, `textColor`, `fontSize`
Example: `{ "type": "unsubscribe", "companyName": "Acme Inc", "address": "123 Street, City", "unsubscribeUrl": "#", "textColor": "#aaaaaa", "fontSize": 11 }`

## divider-text
Props: `text`, `color`, `lineColor`, `fontSize`
Example: `{ "type": "divider-text", "text": "— This week —", "color": "#666666", "lineColor": "#eeeeee" }`

## image-grid
Props: `images` (array of { src, alt, link }), `columns` (2|3), `gap`, `borderRadius`
Example: `{ "type": "image-grid", "images": [{ "src": "https://placehold.co/280x200", "alt": "Photo 1" }, { "src": "https://placehold.co/280x200", "alt": "Photo 2" }], "columns": 2, "gap": 10 }`

## logo-strip
Props: `logos` (array of { src, alt, link }), `align`, `logoHeight`, `gap`, `bgColor`
Example: `{ "type": "logo-strip", "logos": [{ "src": "https://placehold.co/80x40", "alt": "Logo" }], "align": "center", "logoHeight": 40 }`

## hero
Props: `backgroundImage` (URL, optional), `backgroundColor` (hex, used when no image), 
`title`, `subtitle`, `buttonLabel`, `buttonHref`, `buttonBgColor`, `buttonTextColor`, 
`overlayColor`, `textColor`, `align`, `minHeight`

For a solid color background: use `backgroundColor` only, omit `backgroundImage`.
For an image background: use `backgroundImage` URL, optionally add `overlayColor` for a tint.

## quote
Props: `text`, `author`, `role`, `bgColor`, `textColor`, `borderColor`, `fontSize`
Example: `{ "type": "quote", "text": "This changed everything.", "author": "Jane Doe", "role": "CEO", "bgColor": "#f9f9f9", "borderColor": "#111111" }`

## coupon
Props: `code`, `description`, `bgColor`, `borderColor`, `textColor`, `borderStyle` ("solid"|"dashed")
Example: `{ "type": "coupon", "code": "SAVE20", "description": "20% off your order", "bgColor": "#fff8f0", "borderColor": "#f59e0b", "borderStyle": "dashed" }`

## countdown
Props: `targetDate` (ISO string), `bgColor`, `textColor`, `labelColor`, `showLabels`
Example: `{ "type": "countdown", "targetDate": "2026-12-31T00:00:00Z", "bgColor": "#111111", "textColor": "#ffffff", "showLabels": true }`

## navigation
Props: `links` (array of { label, href }), `bgColor`, `textColor`, `fontSize`, `align`, `padding`
Example: `{ "type": "navigation", "links": [{ "label": "Home", "href": "#" }, { "label": "Shop", "href": "#" }], "bgColor": "#ffffff", "textColor": "#111111" }`

## rating
Props: `value` (1-5), `color`, `size`, `label`, `align`
Example: `{ "type": "rating", "value": 5, "color": "#f59e0b", "size": 24, "label": "5/5 stars", "align": "center" }`