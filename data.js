// مصفوفة الصور العامة
const genericImages = [
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR12uz7uY34z8nwyVEKWyx-JrNQywQ9Th3Z6Q&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHFblPsXbzvGYO2_e280p0rZYgcz3znQdFTQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJtcRkHFtdWjbXTUPdKzaHnX8gTSaaloy1qQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUXBgnRtca1N4UFoJtugnGkIoJKCwSTqHeGQ&s",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjaeKBGs-cv9K9a6Apca11aBXmVzMSiqsaBA&s"
];

// الروابط الرئيسية للشركة (تعمل كاحتياط في حال لم يكن للفرع رابط خاص)
const mainSocial = {
    facebook: "https://www.facebook.com/s0524033442/",
    instagram: "https://www.instagram.com/perfume.mad/",
    tiktok: "https://www.tiktok.com/@mad.perfume"
};

const branchesData = [
    // --- مثال 1: فرع حيفا (لديه روابط خاصة) ---
    { 
        id: 12, 
        nameAr: "حيفا", 
        nameHe: "חיפה", 
        descAr: "فرع حيفا يرحب بكم...",
        descHe: "סניף חיפה...",
        phone: "0549634449", 
        waze: "Mad Parfumeur Haifa", 
        hoursAr: "10:00 - 22:00", 
        hoursHe: "10:00 - 22:00",
        
        // 👇 هنا تضع روابط الفرع الخاصة 👇
        facebook: "https://facebook.com/mad.haifa",  // رابط فيسبوك حيفا
        instagram: "https://instagram.com/mad.haifa", // رابط انستغرام حيفا
        tiktok: "" // فارغ -> سيأخذ رابط الشركة الرئيسي
    },

    // --- مثال 2: فرع تل أبيب (روابط مختلفة) ---
    { 
        id: 4, 
        nameAr: "تل أبيب - يافا", 
        nameHe: "תל אביב-יפו", 
        phone: "0527035370", 
        directLink: "https://ul.waze.com/ul?place=...", 
        hoursAr: "10:00 - 22:00", 
        hoursHe: "10:00 - 22:00",
        
        // 👇 روابط تل أبيب 👇
        facebook: "https://facebook.com/mad.tlv",
        instagram: "https://instagram.com/mad.tlv",
        tiktok: "https://tiktok.com/@mad.tlv"
    },

    // --- قم بإكمال باقي الفروع بنفس الطريقة ---
    // إذا لم تضع الحقول، سيتم استخدام الروابط الرئيسية تلقائياً
    { id: 3, nameAr: "الرمله", nameHe: "רמלה", phone: "0527035370", waze: "Ramla", hoursAr: "09:00 - 21:00", hoursHe: "09:00 - 21:00" },
    { id: 7, nameAr: "هيرتسيليا", nameHe: "הרצליה", phone: "0522438398", waze: "Herzliya", hoursAr: "10:00 - 20:00", hoursHe: "10:00 - 20:00" },
    { id: 14, nameAr: "الخضيرة", nameHe: "חדרה", phone: "0523953681", waze: "Hadera", hoursAr: "10:00 - 22:00", hoursHe: "10:00 - 22:00" },
    // ... باقي القائمة كما هي ...
];

function getBranchImage(index) { return genericImages[index % genericImages.length]; }
function formatPhoneForWhatsapp(phone) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '972' + cleanPhone.substring(1);
    return cleanPhone;
}
