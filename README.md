# Respond.io Catalog

Lightweight MAD Perfume catalog pages for Respond.io bots and WhatsApp link previews.

## New Catalog

- `respondio-catalog/index.html`: catalog entry page.
- `respondio-catalog/madperfume-whatsapp-catalog-ar.html`: Arabic WhatsApp share-link catalog.
- `respondio-catalog/madperfume-whatsapp-catalog-he.html`: Hebrew WhatsApp share-link catalog.
- `respondio-catalog/share/ar/*.html`: Arabic product share pages with Open Graph product preview tags.
- `respondio-catalog/share/he/*.html`: Hebrew product share pages with Open Graph product preview tags.
- `respondio-catalog/madperfume-whatsapp-links-ar.jsonl`: compact Arabic links for the bot.
- `respondio-catalog/madperfume-whatsapp-links-he.jsonl`: compact Hebrew links for the bot.

When GitHub Pages is active on this repo, product links should look like:

```text
https://www.mad-parfumeur.com/respondio-catalog/share/ar/p-1-w183.html
https://www.mad-parfumeur.com/respondio-catalog/share/he/p-1-w183.html
```

WhatsApp reads each product page's `og:title`, `og:description`, and `og:image` tags to show a catalog-style link card.

## Legacy Files

## Files

- `product.html` (use `index.html` renamed on server): single product page with `?q=...`
- `products.html`: catalog page with all product cards
- `catalog.json`: source data
- `products/*.html`: static preview pages for bot link cards
- `respondio-card-template.md`: ready bot message template

## Publish (Static hosting)

Upload these to your domain:
- `index.html` (or rename to `product.html`)
- `products.html`
- `catalog.json`
- `products/` folder

## For 400+ Products

1. Replace `catalog.json` with your full list.
2. Run:

```bash
python3 generate_assets.py
```

This regenerates:
- `products/*.html`
- `product_cards.json`

## Bot card preview links

Send links like:
- `https://www.mad-parfumeur.com/products/alien.html`
- `https://www.mad-parfumeur.com/products/oudroyal.html`

These pages include Open Graph tags (`og:image`, `og:title`) so chat apps can show preview cards with image.

## Respond.io

- Upload `catalog.md` as knowledge source
- Use `respondio-card-template.md` in your AI Agent instructions
