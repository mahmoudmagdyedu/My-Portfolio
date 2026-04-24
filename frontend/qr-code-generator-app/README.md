# QRForge — QR Code Generator App

## 🧩 المشكلة
المستخدمون يحتاجون طريقة سريعة لتوليد أكواد QR لروابط، رسائل، أرقام واتساب، أو بطاقات Wi-Fi دون تثبيت أي تطبيق.

## ✨ المزايا الأساسية
- توليد QR فوري لأي نص أو رابط.
- اختيار نوع الكود (URL / Text / Email / Phone / WhatsApp / Wi-Fi).
- التحكم في الحجم وهامش الصورة.
- تنزيل الصورة بصيغة PNG.
- وضع داكن/فاتح ومتجاوب مع الشاشات.

## 🛠️ التقنيات
- HTML5 / CSS3 / Vanilla JavaScript
- TailwindCSS (CDN)
- مكتبة [qrcode.js](https://github.com/davidshimjs/qrcodejs)

## ▶️ التشغيل المحلي
```bash
# من جذر الـ Monorepo
npx serve .
# ثم افتح http://localhost:3000/frontend/qr-code-generator-app/
```
أو افتح `index.html` مباشرة في المتصفح.

## 🗺️ Roadmap
- [ ] دعم ألوان مخصصة للكود والخلفية.
- [ ] شعار/لوجو داخل الكود.
- [ ] تصدير SVG و PDF.
- [ ] سجل محلي لآخر 10 أكواد (localStorage).
- [ ] نسخة Angular مع Services + Forms.

## 📁 البنية
```
qr-code-generator-app/
├── index.html
├── styles.css
└── README.md
```
