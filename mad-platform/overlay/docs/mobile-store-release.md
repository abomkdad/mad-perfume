# Mobile Store Release

تجهيز النشر لتطبيق `MAD PERFUME` من هذا المشروع يتم على مرحلتين:

## 1. Android

الإعدادات داخل المشروع أصبحت تعتمد على ملف `apps/customer_app/android/key.properties` بدل توقيع `debug`.

### إنشاء مفتاح رفع جديد

نفذ من داخل `apps/customer_app/android`:

```bash
keytool -genkeypair \
  -v \
  -keystore app/upload-keystore.jks \
  -alias upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

ثم انسخ `key.properties.example` إلى `key.properties` واملأ القيم:

```properties
storePassword=...
keyPassword=...
keyAlias=upload
storeFile=app/upload-keystore.jks
```

بعدها ابنِ الحزمة:

```bash
cd apps/customer_app
flutter build appbundle --release
```

الناتج:

`apps/customer_app/build/app/outputs/bundle/release/app-release.aab`

### قبل الرفع إلى Google Play

- تأكيد `applicationId` النهائي الحالي: `com.madperfume.customer`
- إنشاء التطبيق في Play Console
- تعبئة بيانات المتجر، لقطات الشاشة، سياسة الخصوصية، وتصنيف المحتوى
- يمكن استضافة صفحات المتجر العامة من `apps/deploy_portal` وتشمل:
  - `/privacy`
  - `/delete-account`
  - `/support`
- رفع ملف `app-release.aab`
- اختيار مسار النشر: Internal / Closed / Production

### أتمتة الرفع عبر fastlane

من داخل `apps/customer_app`:

```bash
bundle install
bundle exec fastlane android play
```

المتغيرات المطلوبة:

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`: محتوى JSON الخاص بـ Google Play Service Account
- `PLAY_TRACK`: مثل `internal` أو `production`
- `PLAY_RELEASE_STATUS`: مثل `draft` أو `completed`

يوجد أيضًا workflow يدوي في GitHub Actions:

`/.github/workflows/android-play-release.yml`

ويتوقع الأسرار التالية:

- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
- `ANDROID_UPLOAD_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_PASSWORD`
- `ANDROID_KEY_ALIAS`

## 2. iOS

النشر إلى App Store ما زال يحتاج بيئة Apple الكاملة:

- تثبيت `Xcode.app` الكامل، وليس Command Line Tools فقط
- تثبيت `CocoaPods`
- تسجيل الدخول بحساب Apple Developer
- اختيار Team داخل Xcode
- مراجعة `Bundle Identifier` الحالي: `com.madperfume.customer`
- تنفيذ `Product > Archive`
- الرفع إلى TestFlight أو App Store Connect

### أتمتة الرفع إلى TestFlight

من داخل `apps/customer_app`:

```bash
bundle install
bundle exec fastlane ios testflight
```

المتغيرات المطلوبة لرفع TestFlight:

- `APP_STORE_CONNECT_API_KEY`: مفتاح App Store Connect API بصيغة base64
- `APP_STORE_CONNECT_KEY_ID`
- `APP_STORE_CONNECT_ISSUER_ID`

إذا كان ملف الـ IPA موجودًا مسبقًا يمكن تمرير:

- `IPA_PATH=/absolute/path/to/app.ipa`

### أوامر التحقق المحلية

```bash
cd apps/customer_app
flutter pub get
flutter analyze
flutter test
flutter build ios --release
```

إذا ظهر خطأ `Cannot find "xcodebuild"` فهذا يعني أن Xcode الكامل غير مثبت بعد.

## 3. متطلبات خارجية ما زالت مطلوبة

- حساب Google Play Console
- حساب Apple Developer
- لقطات شاشة نهائية
- وصف التطبيق داخل المتجرين
- رابط سياسة خصوصية نهائي
- قرارات الإصدار والإعدادات القانونية
