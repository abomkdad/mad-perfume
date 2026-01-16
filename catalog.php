<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف
$csvFile = 'products.csv';
// تأكد من وضع رابط موقعك الصحيح هنا
$siteUrl = 'https://mad-parfumeur.com/'; 

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Product Feed</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Official product feed for Meta and TikTok Catalog Ads</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // قراءة السطر الأول (العناوين) وتجاوزه
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من وجود اسم المنتج والسعر ورابط الصورة
        if (empty($data[1]) || empty($data[10]) || empty($data[4])) continue;

        echo '<item>';
        // معرف المنتج (ID)
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // عنوان المنتج
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // وصف المنتج (إجباري لميتا)
        $description = !empty($data[2]) ? $data[2] : $data[1] . " - عطر فاخر من تشكيلة ماد بارفيومير الأصلية.";
        echo '<g:description>' . htmlspecialchars(trim($description)) . '</g:description>';
        
        // رابط المنتج على الموقع
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // رابط الصورة (يجب أن يبدأ بـ https://)
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        
        // حالة المنتج وتوفره
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // السعر الحالي (مع العملة ILS)
        $priceNum = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $priceNum . ' ILS</g:price>';
        
        // الماركة (إجبارية)
        echo '<g:brand>MAD Parfumeur</g:brand>';
        
        // تصنيف جوجل للمنتجات (يساعد في دقة الإعلانات)
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        // نوع المنتج حسب تصنيفك (العمود 11)
        if (!empty($data[11])) {
            echo '<g:product_type>' . htmlspecialchars(trim($data[11])) . '</g:product_type>';
        }

        echo '</item>';
    }
    fclose($handle);
}

echo '</channel>';
echo '</rss>';
?>
