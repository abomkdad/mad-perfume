<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف - تأكد من صحة الرابط
$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; 

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Catalog Feed</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>High-quality product feed for Meta Advantage+ Ads</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // قراءة سطر العناوين
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من الأعمدة الأساسية: ID (0), Title (1), Image (4), Price (10)
        if (empty($data[1]) || empty($data[10]) || empty($data[4])) continue;

        echo '<item>';
        // المعرف الفريد
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // العنوان
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // الوصف (إلزامي لميتا)
        $description = !empty($data[2]) ? $data[2] : $data[1] . " - اكتشف التشكيلة الحصرية من عطور ماد بارفيومير. جودة عالية وثبات يدوم طويلاً.";
        echo '<g:description>' . htmlspecialchars(trim($description)) . '</g:description>';
        
        // رابط المنتج
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // رابط الصورة - تأكد أنه يبدأ بـ https://
        $imageUrl = trim($data[4]);
        echo '<g:image_link>' . htmlspecialchars($imageUrl) . '</g:image_link>';
        
        // البيانات اللوجستية
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        echo '<g:brand>MAD Parfumeur</g:brand>';
        
        // السعر الحالي (تنظيف الرقم وإضافة العملة)
        $priceNum = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $priceNum . ' ILS</g:price>';
        
        // التصنيف الدولي (مهم جداً للذكاء الاصطناعي Advantage+)
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        // تصنيف المنتج الداخلي (العمود 11)
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
