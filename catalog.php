<?php
ob_clean(); // تنظيف أي مخرجات سابقة لضمان سلامة ملف الـ XML
header("Content-Type: application/rss+xml; charset=utf-8");

$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; 

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Catalog Feed</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Official product feed for Meta and TikTok Ads</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    fgetcsv($handle, 1000, ","); // تجاوز سطر العناوين في ملف الـ CSV
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من الأعمدة الأساسية: الاسم (1)، الصورة (4)، السعر (10)
        if (empty($data[1]) || empty($data[10])) continue;

        echo '<item>';
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        $desc = !empty($data[2]) ? $data[2] : "عطر فاخر ومميز من تشكيلة ماد بارفيومير الأصلية.";
        echo '<g:description>' . htmlspecialchars(trim($desc)) . '</g:description>';
        
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // تنسيق السعر ليكون رقمين بعد الفاصلة مع العملة ILS
        $priceNum = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . number_format((float)$priceNum, 2, '.', '') . ' ILS</g:price>';
        
        echo '<g:brand>MAD Parfumeur</g:brand>';
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        echo '</item>';
    }
    fclose($handle);
}
echo '</channel></rss>';
?>
