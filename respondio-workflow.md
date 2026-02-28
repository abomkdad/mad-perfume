# Respond.io Workflow (Optional)

Use this only if your plan supports HTTP Request step.

## Data URL

- `https://www.mad-parfumeur.com/product_cards.json`

## Logic

1. Capture user text into variable `product_query`.
2. HTTP GET `product_cards.json`.
3. Find first item where query matches one of:
   - `search_key`
   - `product_code`
   - `name_ar`
   - `name_he`
   - `name_en`
4. Send message:

اسم المنتج: {{name_ar}}
السعر: ₪{{price_ils}}
الكود: {{product_code}}
الوصف: {{desc_ar}}
صورة المنتج: {{image_link}}
رابط المنتج: {{preview_link}}

## Fallback

If no product matched:
- "اكتب اسم المنتج أو الكود بشكل أدق (مثال: alien أو XF A.112)."
