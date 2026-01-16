<?php
header("Content-Type: application/xml; charset=utf-8");

// إعدادات الملف الأساسية
$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; 

echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Official Catalog</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Professional Product Feed for Meta &amp; TikTok Ads</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // تخطي السطر الأول (العناوين)
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // التحقق من البيانات الأساسية (الاسم، السعر الحالي، الصورة)
        if (empty($data[1]) || empty($data[10]) || empty($data[4])) continue;

        echo '<item>';
        // 1. المعرف الفريد للمنتج
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // 2. اسم المنتج
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // 3. الوصف (ميتا تتطلب وصفاً، سنستخدم حقل الوصف أو نصاً ترويجياً)
        $desc = !empty($data[2]) ? $data[2] : $data[1] . " - عطر فاخر وحصري من تشكيلة ماد بارفيومير الأصلية، ثبات عالي ورائحة جذابة.";
        echo '<g:description>' . htmlspecialchars(trim($desc)) . '</g:description>';
        
        // 4. رابط المنتج (يوجه الزبون لصفحة offer.html)
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // 5. رابط الصورة
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        
        // 6. تفاصيل الحالة والتوفر
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // 7. معالجة الأسعار (إظهار السعر قبل وبعد الخصم)
        // لنفترض أن السعر الحالي في العمود 10 والسعر الأصلي في العمود 9 (إذا توفر)
        // إذا لم يتوفر سعر أصلي، سنعرض السعر الحالي فقط
        $currentPrice = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . $currentPrice . ' ILS</g:price>';
        
        // إذا كان هناك سعر أعلى (قبل الخصم) في العمود رقم 9 مثلاً، قم بتفعيل السطر أدناه:
        // if(!empty($data[9])) {
        //    $oldPrice = preg_replace('/[^0-9.]/', '', $data[9]);
        //    echo '<g:sale_price>' . $currentPrice . ' ILS</g:sale_price>';
        //    echo '<g:price>' . $oldPrice . ' ILS</g:price>';
        // }

        // 8. الماركة والتصنيف الدولي (ضروري جداً لخوارزميات الاستهداف)
        echo '<g:brand>MAD Parfumeur</g:brand>';
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        // 9. نوع المنتج (التصنيف الداخلي الخاص بك من العمود 11)
        if (!empty($data[11])) {
            echo '<g:product_type>' . htmlspecialchars(trim($data[11])) . '</g:product_type>';
        }

        echo '</item>';
    }
    fclose($handle);
}

echo '</channel>';
rss>';
?>
