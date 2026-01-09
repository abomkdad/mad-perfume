// مصفوفة الصور العامة (يمكنك تخصيص صورة لكل فرع إذا أردت)
const genericImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR12uz7uY34z8nwyVEKWyx-JrNQywQ9Th3Z6Q&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHFblPsXbzvGYO2_e280p0rZYgcz3znQdFTQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJtcRkHFtdWjbXTUPdKzaHnX8gTSaaloy1qQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUXBgnRtca1N4UFoJtugnGkIoJKCwSTqHeGQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjaeKBGs-cv9K9a6Apca11aBXmVzMSiqsaBA&s"
];

const branchesData = [
    // --- مثال: فرع حيفا (تمت إضافة الوصف وروابط السوشيال) ---
    { 
        id: 12, 
        nameAr: "حيفا", 
        nameHe: "חיפה", 
        descAr: "فرعنا في حيفا يقدم تشكيلة حصرية من عطور النيش. يقع في قلب المدينة لخدمتكم.",
        descHe: "הסניף שלנו בחיפה מציע מבחר בלעדי של בשמי נישה. ממוקם בלב העיר לשירותכם.",
        phone: "0549634449", 
        waze: "Mad Parfumeur Haifa", 
        hoursAr: "10:00 - 22:00", 
        hoursHe: "10:00 - 22:00",
        // روابط السوشيال الخاصة بهذا الفرع (أو العامة)
        facebook: "https://www.facebook.com/s0524033442/",
        instagram: "https://www.instagram.com/perfume.mad/",
        tiktok: "https://www.tiktok.com/@mad.perfume"
    },
    { 
        id: 4, 
        nameAr: "تل أبيب - يافا", 
        nameHe: "תל אביב-יפו", 
        descAr: "أكبر فروعنا في المركز، تجربة تسوق فريدة مع طاقم خبراء العطور.",
        descHe: "הסניף הגדול שלנו במרכז, חווית קנייה ייחודית עם צוות מומחי בישום.",
        phone: "0527035370", 
        directLink: "https://ul.waze.com/ul?place=EipEYXZpZCBSYXppJ2VsIFN0IDIzLCBUZWwgQXZpdi1ZYWZvLCBJc3JhZWwiMBIuChQKEgntsiS-vkwdFREv7GII8cikqxAXKhQKEgmHZ_csvEwdFRFa3i1EzNr69g", 
        hoursAr: "10:00 - 22:00", 
        hoursHe: "10:00 - 22:00",
        facebook: "https://facebook.com",
        instagram: "https://instagram.com",
        tiktok: "https://tiktok.com"
    },
    // ... يمكنك نسخ باقي الفروع هنا بنفس التنسيق ...
    { id: 3, nameAr: "الرمله", nameHe: "רמלה", phone: "0527035370", waze: "Ramla", hoursAr: "09:00 - 21:00", hoursHe: "09:00 - 21:00" },
    { id: 7, nameAr: "هيرتسيليا", nameHe: "הרצליה", phone: "0522438398", waze: "Herzliya", hoursAr: "10:00 - 20:00", hoursHe: "10:00 - 20:00" },
    { id: 14, nameAr: "الخضيرة", nameHe: "חדרה", phone: "0523953681", waze: "Hadera", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 24, nameAr: "يركا", nameHe: "ירכא", phone: "0546842420", waze: "Yarka", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 21, nameAr: "طمرة", nameHe: "טמרה", phone: "0505830733", waze: "Tamra", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 23, nameAr: "جديدة المكر", nameHe: "ג׳דידה אלמכר", phone: "0508683838", waze: "Jadeidi-Makr", hoursAr: "11:00 - 21:00", hoursHe: "11:00 - 21:00" },
    { id: 22, nameAr: "سخنين", nameHe: "סח'נין", phone: "0525335571", waze: "Sakhnin", hoursAr: "10:30 - 22:30", hoursHe: "10:30 - 22:30" },
    { id: 2, nameAr: "كفر مندا", nameHe: "כפר מאנדא", phone: "0505102019", waze: "Kafr Manda", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 1, nameAr: "دالية الكرمل", nameHe: "דלית אל כרמל", phone: "0525592293", waze: "Daliyat al-Karmel", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 9, nameAr: "القدس - صلاح الدين", nameHe: "ירושלים - סלאח א-דין", phone: "0545697644", waze: "Salah Ad-din", hoursAr: "09:00-19:30", hoursHe: "09:00-19:30" },
    { id: 10, nameAr: "القدس - سلطان سليمان", nameHe: "ירושלים - סולטאן סולימאן", phone: "0545697644", waze: "Sultan Suleiman", hoursAr: "09:00-19:30", hoursHe: "09:00-19:30" },
    { id: 11, nameAr: "بيت حنينا", nameHe: "בית חנינא", phone: "0538318312", waze: "Beit Hanina", hoursAr: "09:00-21:00", hoursHe: "09:00-21:00" },
    { id: 5, nameAr: "بئر السبع", nameHe: "באר שבע", phone: "0548809957", waze: "Beersheba", hoursAr: "09:00 - 20:00", hoursHe: "09:00 - 20:00" },
    { id: 6, nameAr: "رهط", nameHe: "רהט", phone: "0505841596", waze: "Rahat", hoursAr: "09:00 - 20:00", hoursHe: "09:00 - 20:00" },
    { id: 18, nameAr: "أم الفحم", nameHe: "אום אלפחם", phone: "0549634449", waze: "Umm al-Fahm", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 19, nameAr: "العفولة", nameHe: "עפולה", phone: "0542144255", waze: "Afula", hoursAr: "09:00 - 22:00", hoursHe: "09:00 - 22:00" },
    { id: 20, nameAr: "الناصرة", nameHe: "נצרת", phone: "0545307980", waze: "Nazareth", hoursAr: "09:00 - 22:00", hoursHe: "09:00 - 22:00" },
    { id: 15, nameAr: "باقة الغربية", nameHe: "באקה אלג׳רבייה", phone: "0536440073", waze: "Baqa al-Gharbiyye", hoursAr: "10:00 - 23:00", hoursHe: "10:00 - 23:00" },
    { id: 17, nameAr: "كفر قرع", nameHe: "כפר קרע", phone: "0549634449", waze: "Kafr Qara", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 8, nameAr: "كفر قاسم", nameHe: "כפר קאסם", phone: "0522438398", waze: "Kafr Qasim", hoursAr: "11:00 - 23:00", hoursHe: "11:00 - 23:00" },
    { id: 16, nameAr: "الطيبة", nameHe: "טייבה", phone: "0523953681", waze: "Tayibe", hoursAr: "10:00 - 23:00", hoursHe: "10:00 - 23:00" },
    { id: 25, nameAr: "طبريا", nameHe: "טבריה", phone: "046112266", waze: "Tiberias", hoursAr: "09:00 - 21:00", hoursHe: "09:00 - 21:00" },
    { id: 26, nameAr: "مجدل شمس", nameHe: "מג'דל שמס", phone: "0508514202", waze: "Majdal Shams", hoursAr: "12:00 - 21:00", hoursHe: "12:00 - 21:00" },
    { id: 29, nameAr: "رام الله", nameHe: "ראמאללה", phone: "0592592502", waze: "Ramallah", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 27, nameAr: "نابلس", nameHe: "שכם", phone: "0598094672", waze: "Nablus", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 31, nameAr: "قلقيلية", nameHe: "קלקוליה", phone: "0595800150", waze: "Qalqilya", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 28, nameAr: "طولكرم", nameHe: "טול כרם", phone: "0595552670", waze: "Tulkarm", hoursAr: "10:00 - 20:00", hoursHe: "10:00 - 20:00" },
    { id: 30, nameAr: "بيت لحم", nameHe: "בית לחם", phone: "0599353940", waze: "Bethlehem", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    { id: 32, nameAr: "أريحا", nameHe: "יריחו", phone: "0592592502", waze: "Jericho", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" }
];

// نصوص الواجهة
const uiText = {
    ar: { 
        waze: "ملاحة WAZE", 
        call: "اتصال",
        whatsapp: "واتساب",
        serviceText: "خدمة الزبائن", 
        searchPlaceholder: "ابحث عن مدينتك...", 
        siteBtn: "المتجر الإلكتروني", 
        siteUrl: "https://madperfume.ps/", 
        backBtn: "العودة للقائمة",
        descriptionTitle: "عن الفرع",
        contactTitle: "تواصل معنا",
        hoursTitle: "ساعات العمل",
        dir: "rtl" 
    },
    he: { 
        waze: "WAZE", 
        call: "חיוג", 
        whatsapp: "וואטסאפ",
        serviceText: "שירות לקוחות", 
        searchPlaceholder: "חפש לפי עיר...", 
        siteBtn: "לחנות האונליין", 
        siteUrl: "https://madperfume.co.il/", 
        backBtn: "חזרה לרשימה",
        descriptionTitle: "אודות הסניף",
        contactTitle: "צור קשר",
        hoursTitle: "שעות פתיחה",
        dir: "rtl" 
    }
};

// دالة مساعدة للحصول على صورة
function getBranchImage(index) {
    return genericImages[index % genericImages.length];
}

// دالة واتساب
function formatPhoneForWhatsapp(phone) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '972' + cleanPhone.substring(1);
    return cleanPhone;
}
