# Respond.io Catalog

Static MAD Perfume catalog pages for Respond.io and WhatsApp previews.

## Use In Respond.io

Use these compact files as bot knowledge or lookup data:

- `madperfume-whatsapp-links-ar.jsonl`
- `madperfume-whatsapp-links-he.jsonl`
- `madperfume-knowledge-ar.txt`
- `madperfume-knowledge-he.txt`

Each JSONL row includes:

- `c`: product code
- `n`: product name
- `cat`: category
- `p`: price in ILS
- `share_path`: the local share-page path to send to the customer
- `public_path`: the path from the domain root, useful for bot URL building
- `share_url`: the full public HTTPS URL to send directly in WhatsApp
- `og_image_url`: the local optimized preview image used by WhatsApp
- `product_url`: the original store product link
- `image`: the original product image from the store feed

## Customer Links

Send product links from:

- `share/ar/*.html`
- `share/he/*.html`

After publishing on GitHub Pages, build the full URL like:

```text
https://www.mad-parfumeur.com/respondio-catalog/share/ar/p-1-w183.html
```

For the bot, send `share_url` directly. It includes a small version query so WhatsApp fetches the newest preview metadata instead of using an older cached preview. Each product page points `og:image` to a compressed image hosted under this same catalog.

WhatsApp shows the product image as the link preview. When the customer taps the preview, the share page redirects them to the original store product page.

WhatsApp can show a catalog-style preview card only when the URL is public HTTPS.
