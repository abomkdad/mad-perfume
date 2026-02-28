# Respond.io Product Card Template

Use this format when customer asks for product details.

## Reply format (Arabic)

اسم المنتج: {{name_ar}}
السعر: ₪{{price}}
الكود: {{product_code}}
الوصف: {{desc_ar}}
صورة المنتج: {{image_link}}
رابط المنتج (Preview): {{preview_link}}

## Example

اسم المنتج: الين
السعر: ₪129
الكود: XF A.112
الوصف: عطر زهري-عنبر غني وثابت.
صورة المنتج: https://images.unsplash.com/photo-1588405748880-12d1d2a59c75?auto=format&fit=crop&w=800&q=60
رابط المنتج (Preview): https://www.mad-parfumeur.com/products/alien.html

## Bot instruction snippet

When user asks for a product:
1. Match by SEARCH_KEY or PRODUCT CODE or AR/HE/EN name.
2. Return the reply using the "Reply format (Arabic)".
3. Always include `image_link` and `preview_link`.
4. If no match, ask user for product code or exact name.
