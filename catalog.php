<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف
$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; 

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Catalog</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Product feed for Meta and TikTok Catalog</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // قراءة السطر الأول وتجاوزه
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من وجود اسم المنتج (العمود رقم 1) وسعر (العمود رقم 10)
        if (empty($data[1]) || empty($data[10])) continue;

        echo '<item>';
        // 1. المعرف الفريد (ID)
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // 2. اسم المنتج
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // 3. الوصف (ميتا تتطلب وصفاً جيداً)
        $description = !empty($data[2]) ? $data[2] : $data[1] . " - عطر فاخر من تشكيلة ماد بارفيومير الأصلية.";
        echo '<g:description>' . htmlspecialchars(trim($description)) . '</g:description>';
        
        // 4. رابط المنتج (يوجه لصفحة العرض)
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // 5. رابط الصورة (العمود رقم 4)
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        
        // 6. الحالة والتوفر
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // 7. السعر (تنظيف السعر وضمان وجود ILS)
        $priceNum = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $priceNum . ' ILS</g:price>';
        
        // 8. الماركة والتصنيف
        echo '<g:brand>MAD Parfumeur</g:brand>';
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        echo '</item>';
    }
    fclose($handle);
}

echo '</channel>';
echo '</rss>';
?>
