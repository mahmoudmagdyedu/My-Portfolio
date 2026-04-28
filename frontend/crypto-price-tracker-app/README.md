# CryptoPulse — Crypto Price Tracker App

> متتبّع أسعار العملات الرقمية لحظيًا، يعرض أعلى العملات بالقيمة السوقية مع بحث وفرز وتحديث تلقائي.

## 🎯 المشكلة
متابعة أسعار العملات الرقمية تتطلب فتح عدة منصات. هذا التطبيق يقدّم لوحة بسيطة وسريعة لمتابعة الأسعار، نسبة التغيّر، والقيمة السوقية في مكان واحد، مع تحديث تلقائي ووضع داكن.

## ✨ المزايا
- جلب أسعار أهم 50 عملة رقمية من CoinGecko Public API.
- بحث فوري بالاسم أو الرمز (BTC, ETH, ...).
- فرز حسب السعر، نسبة التغيّر 24س، أو القيمة السوقية.
- تبديل العملة المرجعية (USD / EUR / EGP).
- تحديث تلقائي كل 60 ثانية + زر تحديث يدوي.
- مفضلة محلية (LocalStorage) لتثبيت العملات الأكثر أهمية.
- تصميم Responsive ووضع داكن.

## 🛠️ التقنيات
- HTML5
- CSS3 (متغيرات CSS + Grid + Flexbox)
- JavaScript (Vanilla, Fetch API)
- CoinGecko Public REST API
- LocalStorage

## 🚀 خطوات التشغيل المحلي
1. استنسخ المستودع:
   ```bash
   git clone https://github.com/mahmoudmagdyedu/My-Portfolio.git
   cd My-Portfolio/frontend/crypto-price-tracker-app
   ```
2. افتح `index.html` مباشرة في المتصفح، أو شغّل سيرفر محلي:
   ```bash
   npx serve .
   ```
3. لا توجد مفاتيح API مطلوبة — CoinGecko Public API مجاني.

## 🗺️ خطة التطوير (Roadmap)
- [x] واجهة أساسية مع جدول العملات.
- [x] بحث وفرز وتبديل العملة المرجعية.
- [x] مفضلة LocalStorage.
- [ ] صفحة تفاصيل لكل عملة + رسم بياني (Chart.js).
- [ ] تنبيهات سعرية (Notifications API).
- [ ] تصدير المفضلة CSV/JSON.
- [ ] ترقية إلى TypeScript.

## 📸 المعاينة
الصفحة الرئيسية: [mahmoudmagdy.page](https://mahmoudmagdy.page)

## 📄 الترخيص
MIT © Mahmoud Magdy
