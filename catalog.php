<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف
$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; // قم بتغييرها لرابط موقعك الفعلي

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Catalog</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Product feed for Meta Catalog</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // قراءة السطر الأول (العناوين)
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // تأكد من أن السطر يحتوي على بيانات (الاسم والسعر والصورة)
        if (!isset($data[1]) || empty($data[1])) continue;

        echo '<item>';
        // المعرف الفريد للمنتج
        echo '<g:id>' . htmlspecialchars($data[0]) . '</g:id>'; 
        // اسم المنتج
        echo '<g:title>' . htmlspecialchars($data[1]) . '</g:title>'; 
        // الوصف (إذا لم يوجد وصف نستخدم الاسم)
        echo '<g:description>' . htmlspecialchars($data[1]) . ' - عطر مميز من ماد بارفيومير</g:description>';
        // رابط المنتج (نستخدم رابط المتجر مع معرف المنتج)
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . $data[0] . '</g:link>';
        // رابط الصورة (العمود رقم 4 في ملفك)
        echo '<g:image_link>' . htmlspecialchars($data[4]) . '</g:image_link>';
        // حالة المنتج
        echo '<g:condition>new</g:condition>';
        // التوفر
        echo '<g:availability>in stock</g:availability>';
        // السعر (العمود رقم 10 في ملفك - تأكد من صيغة ILS)
        $price = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $price . ' ILS</g:price>';
        // الماركة
        echo '<g:brand>MAD Parfumeur</g:brand>';
        echo '</item>';
    }
    fclose($handle);
}

echo '</channel>';
echo '</rss>';
?>
