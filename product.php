<?php
// الرابط المباشر لملف الكاتالوج الخاص بك
$catalogUrl = 'https://www.mad-parfumeur.com/catalog.json';

header('Content-Type: application/json; charset=utf-8');

// 1) قراءة البراميتر من الـ URL
$code   = isset($_GET['code'])   ? trim($_GET['code'])   : '';
$search = isset($_GET['search']) ? trim($_GET['search']) : '';

if ($code === '' && $search === '') {
    http_response_code(400);
    echo json_encode(['error' => 'code or search is required']);
    exit;
}

// 2) جلب ملف الكاتالوج
$json = file_get_contents($catalogUrl);
if ($json === false) {
    http_response_code(500);
    echo json_encode(['error' => 'cannot load catalog']);
    exit;
}

$data = json_decode($json, true);
if (!is_array($data)) {
    http_response_code(500);
    echo json_encode(['error' => 'invalid catalog format']);
    exit;
}

// 3) البحث عن المنتج باستخدام المفاتيح الجديدة
$result = null;

foreach ($data as $item) {
    $productCode = $item['perfume_code'] ?? '';
    $productTitle = $item['real_title'] ?? '';

    // البحث عن الكود (مطابقة تامة)
    if ($code !== '' && strcasecmp($productCode, $code) === 0) {
        $result = $item;
        break;
    }

    // البحث عن الاسم (يحتوي على الكلمة)
    if ($search !== '' && mb_stripos($productTitle, $search) !== false) {
        $result = $item;
        break;
    }
}

if (!$result) {
    http_response_code(404);
    echo json_encode(['error' => 'product not found']);
    exit;
}

// 4) إرجاع النتيجة بالأسماء التي يحتاجها البوت
echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
