#!/usr/bin/env python3
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / "catalog.json"
PRODUCTS_DIR = ROOT / "products"
CARDS_PATH = ROOT / "product_cards.json"
SITE_BASE = "https://www.mad-parfumeur.com"


def safe(v):
    return "" if v is None else str(v)


def slug_from_product(p):
    base = safe(
        p.get("SEARCH_KEY")
        or p.get("PRODUCT CODE")
        or p.get("ORIGINAL_EN")
        or p.get("BARCODE")
        or p.get("LINK")
        or "product"
    ).lower()
    base = re.sub(r"[^a-z0-9]+", "-", base).strip("-")
    return base or "product"


def render_product_page(p, slug):
    name_ar = safe(p.get("ORIGINAL_AR"))
    name_he = safe(p.get("ORIGINAL_HE"))
    name_en = safe(p.get("ORIGINAL_EN") or p.get("DESCRIPTION") or "Product")
    display_name = name_ar or name_he or name_en
    code = safe(p.get("PRODUCT CODE"))
    price = safe(p.get("PRICE"))
    img = safe(p.get("IMAGE_LINK"))
    desc = safe(p.get("DESC_AR") or p.get("DESCRIPTION") or "")
    key = safe(p.get("SEARCH_KEY"))

    title = f"MAD | {display_name}"
    page_url = f"{SITE_BASE}/products/{slug}.html"
    product_url = f"{SITE_BASE}/product.html?q={key}" if key else f"{SITE_BASE}/product.html"

    return f'''<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>{html.escape(title)}</title>
  <meta name="description" content="{html.escape(desc)}" />

  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="MAD Parfumeur" />
  <meta property="og:title" content="{html.escape(title)}" />
  <meta property="og:description" content="{html.escape(desc)}" />
  <meta property="og:image" content="{html.escape(img)}" />
  <meta property="og:url" content="{html.escape(page_url)}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{html.escape(title)}" />
  <meta name="twitter:description" content="{html.escape(desc)}" />
  <meta name="twitter:image" content="{html.escape(img)}" />

  <style>
    body {{ margin:0; background:#0b0c11; color:#fff; font-family:"Noto Kufi Arabic",system-ui,sans-serif; }}
    .wrap {{ max-width:720px; margin:0 auto; padding:20px; }}
    .card {{ border:1px solid rgba(255,255,255,.1); border-radius:18px; overflow:hidden; background:#12141c; }}
    img {{ width:100%; aspect-ratio:1/1; object-fit:cover; background:#171922; }}
    .body {{ padding:14px; }}
    .name {{ margin:0 0 8px; font-size:24px; }}
    .meta {{ color:#b2b8c7; font-size:14px; line-height:1.8; }}
    .price {{ color:#d4af37; font-size:26px; font-weight:900; margin-top:8px; }}
    .btn {{ display:inline-block; margin-top:12px; text-decoration:none; color:#fff; border:1px solid rgba(212,175,55,.4); background:rgba(212,175,55,.15); padding:10px 14px; border-radius:12px; font-weight:800; }}
  </style>
</head>
<body>
  <div class="wrap">
    <article class="card">
      <img src="{html.escape(img)}" alt="{html.escape(display_name)}" />
      <div class="body">
        <h1 class="name">{html.escape(display_name)}</h1>
        <div class="meta">{html.escape(code)} • {html.escape(name_en)} • {html.escape(name_he)}</div>
        <div class="meta">{html.escape(desc)}</div>
        <div class="price">₪{html.escape(price)}</div>
        <a class="btn" href="{html.escape(product_url)}">فتح المنتج</a>
      </div>
    </article>
  </div>
</body>
</html>
'''


def main():
    raw = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    items = raw if isinstance(raw, list) else raw.get("products", [])

    PRODUCTS_DIR.mkdir(exist_ok=True)
    for old_html in PRODUCTS_DIR.glob("*.html"):
        old_html.unlink()

    cards = []
    seen = set()

    for idx, p in enumerate(items, start=1):
        slug = slug_from_product(p)
        if slug == "product":
            slug = f"item-{idx}"
        original = slug
        n = 2
        while slug in seen:
            slug = f"{original}-{n}"
            n += 1
        seen.add(slug)

        (PRODUCTS_DIR / f"{slug}.html").write_text(render_product_page(p, slug), encoding="utf-8")

        key = safe(p.get("SEARCH_KEY"))
        cards.append({
            "search_key": key,
            "product_code": safe(p.get("PRODUCT CODE")),
            "name_ar": safe(p.get("ORIGINAL_AR")),
            "name_he": safe(p.get("ORIGINAL_HE")),
            "name_en": safe(p.get("ORIGINAL_EN")),
            "price_ils": p.get("PRICE"),
            "desc_ar": safe(p.get("DESC_AR") or p.get("DESCRIPTION")),
            "image_link": safe(p.get("IMAGE_LINK")),
            "preview_link": f"{SITE_BASE}/products/{slug}.html",
            "product_link": f"{SITE_BASE}/product.html?q={key}" if key else f"{SITE_BASE}/product.html",
            "index": idx,
        })

    CARDS_PATH.write_text(json.dumps(cards, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {len(cards)} products")


if __name__ == "__main__":
    main()
