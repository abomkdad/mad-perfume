<?php
// הגדרת סוג התוכן כ-XML
header("Content-Type: application/rss+xml; charset=utf-8");

$csvFile = 'products.csv';
$siteUrl = 'https://mad-parfumeur.com/'; 

// יצירת מבנה ה-RSS
echo '<?xml version="1.0" encoding="UTF-8"?>';
echo '<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">';
echo '<channel>';
echo '<title>MAD Parfumeur Product Feed</title>';
echo '<link>' . $siteUrl . '</link>';
echo '<description>Meta Advantage+ Catalog Feed</description>';

if (($handle = fopen($csvFile, "r")) !== FALSE) {
    // קריאת שורת הכותרות מה-CSV (ודילוג עליה)
    $headers = fgetcsv($handle, 1000, ",");
    
    while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
        // דילוג על שורות ריקות או חסרות נתונים קריטיים
        if (count($data) < 11 || empty($data[1]) || empty($data[10])) continue;

        echo '<item>';
        // מזהה מוצר ייחודי (חובה)
        echo '<g:id>' . htmlspecialchars(trim($data[0])) . '</g:id>'; 
        
        // שם המוצר (חובה)
        echo '<g:title>' . htmlspecialchars(trim($data[1])) . '</g:title>'; 
        
        // תיאור (חובה ל-Meta)
        $desc = !empty($data[2]) ? $data[2] : "ניחוח יוקרתי ומקורי מקולקציית MAD Parfumeur - איכות גבוהה ועמידות לאורך זמן.";
        echo '<g:description>' . htmlspecialchars(trim($desc)) . '</g:description>';
        
        // קישור לדף המוצר
        echo '<g:link>' . $siteUrl . 'offer.html?id=' . trim($data[0]) . '</g:link>';
        
        // קישור לתמונה (חובה)
        echo '<g:image_link>' . htmlspecialchars(trim($data[4])) . '</g:image_link>';
        
        // מצב המוצר ומלאי
        echo '<g:condition>new</g:condition>';
        echo '<g:availability>in stock</g:availability>';
        
        // מחיר (חובה בפורמט: "123.00 ILS")
        $priceNum = preg_replace('/[^0-9.]/', '', $data[10]);
        echo '<g:price>' . number_format((float)$priceNum, 2, '.', '') . ' ILS</g:price>';
        
        // מותג (חובה)
        echo '<g:brand>MAD Parfumeur</g:brand>';
        
        // קטגוריית גוגל (עוזר לאלגוריתם של Meta)
        echo '<g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Perfume &amp; Cologne</g:google_product_category>';
        
        // סוג המוצר כפי שמופיע ב-CSV (עמודה 11)
        echo '<g:product_type>' . htmlspecialchars(trim($data[11])) . '</g:product_type>';

        echo '</item>';
    }
    fclose($handle);
}

echo '</channel>';
echo '</rss>';
?>
