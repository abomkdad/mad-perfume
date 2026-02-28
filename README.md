# MAD Catalog + Bot Cards

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
