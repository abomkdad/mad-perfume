<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف الأساسية
$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; // رابط الموقع الرئيسي

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Official Catalog</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Product feed for Meta (Facebook/Instagram) and TikTok Catalogs</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // قراءة السطر الأول وتجاوزه (العناوين)
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من وجود اسم المنتج (العمود 1) والسعر (العمود 10) والصورة (العمود 4)
        if (empty($data[1]) || empty($data[10]) || empty($data[4])) continue;

        echo '<item>';
        // 1. المعرف الفريد للمنتج
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // 2. اسم المنتج (Meta تفضل الأسماء الواضحة)
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // 3. الوصف (ميتا تتطلب وصفاً، سنستخدم الاسم + نص ترويجي إذا كان الوصف فارغاً)
        $desc = !empty($data[2]) ? $data[2] : $data[1] . " - عطر فاخر من تشكيلة ماد بارفيومير الأصلية.";
        echo '<g:description>' . htmlspecialchars(trim($desc)) . '</g:description>';
        
        // 4. رابط المنتج (يوجه الزبون لصفحة العرض المخصصة)
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // 5. رابط الصورة (يجب أن يكون رابطاً كاملاً ومباشراً)
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        
        // 6. تفاصيل الحالة والتوفر
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // 7. السعر (تنظيف الرقم وإضافة عملة ILS بشكل صحيح)
        $priceRaw = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $priceRaw . ' ILS</g:price>';
        
        // 8. الماركة والتصنيف (ضروري جداً لإعلانات الاستهداف)
        echo '<g:brand>MAD Parfumeur</g:brand>';
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        // 9. نوع المنتج (Category المأخوذ من العمود رقم 11 في ملفك)
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
