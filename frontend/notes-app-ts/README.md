# 📝 Notes App (TypeScript)

تطبيق ويب بسيط لإدارة الملاحظات بالكامل في المتصفح باستخدام **TypeScript** و **localStorage**. المشروع من **المرحلة 2** في خطة التدرّج ضمن [My-Portfolio Monorepo](../../README.md) ويركّز على ممارسة الأنواع (types)، التحقق من المدخلات (validation)، وفصل طبقة البيانات عن طبقة العرض.

## 🎯 المشكلة
المستخدم يحتاج طريقة سريعة لتدوين أفكاره وملاحظاته ومهامه اليومية، مع إمكانية البحث والتصفية والتعديل، دون الحاجة إلى تسجيل دخول أو اتصال بالإنترنت.

## ✨ المزايا
- إضافة/تعديل/حذف الملاحظات مع عنوان ونص ووسوم (tags).
- حفظ دائم في `localStorage` (يبقى بعد إغلاق المتصفح).
- بحث لحظي بالعنوان أو المحتوى.
- تصفية حسب الوسوم.
- تمييز الملاحظات المهمة (Pin).
- واجهة Responsive تدعم الجوال والديسكتوب.
- Dark / Light mode.

## 🧰 التقنيات
- HTML5 / CSS3 (CSS Variables + Flex/Grid)
- **TypeScript** (ES2020)
- Web Storage API (`localStorage`)
- بدون أي مكتبات خارجية.

## 🗂️ هيكل المشروع
```
notes-app-ts/
├── index.html
├── styles.css
├── src/
│   └── app.ts
├── dist/            ← ناتج تجميع TypeScript (بعد البناء)
├── tsconfig.json
└── README.md
```

## 🚀 التشغيل المحلي
### المتطلبات
- Node.js 18+
- npm

### الخطوات
```bash
# تثبيت TypeScript محلياً
npm install -g typescript

# من داخل مجلد المشروع
cd frontend/notes-app-ts

# بناء ملفات TS إلى JS داخل dist/
tsc

# تشغيل أي سيرفر ثابت بسيط
npx serve .
# أو
python -m http.server 8080
```
ثم افتح `http://localhost:8080`.

## 🧪 سيناريو اختبار يدوي
1. أضف ملاحظة جديدة بعنوان ومحتوى ووسم.
2. حدّث الصفحة — تأكد من بقاء الملاحظة.
3. جرّب البحث والتصفية بالوسم.
4. ثبّت ملاحظة (Pin) وتأكد أنها تظهر في الأعلى.
5. بدّل بين الوضع الفاتح والداكن.

## 🗺️ خطة التطوير (Roadmap)
- [x] Scaffold أساسي + README.
- [ ] إكمال منطق CRUD في `app.ts`.
- [ ] إضافة Validation واضح مع رسائل خطأ.
- [ ] تصدير/استيراد الملاحظات (JSON).
- [ ] تحويله إلى PWA (Service Worker + Manifest).
- [ ] ترحيله لاحقاً إلى Angular في مشروع منفصل.

## 📌 ملاحظات
- هذا المشروع جزء من [My-Portfolio](../../README.md) المنشور على **[mahmoudmagdy.page](https://mahmoudmagdy.page)**.
- Commit messages تتبع صيغة Conventional Commits.
