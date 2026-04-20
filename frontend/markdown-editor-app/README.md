# Markdown Editor App

محرر Markdown بسيط مع معاينة مباشرة (Live Preview) ومفاتيح اختصار لإدراج التنسيقات الشائعة، مناسب لكتابة الملاحظات والتوثيق بسرعة.

## 🎯 المشكلة
الكثير من المطورين يحتاجون محرّر Markdown خفيف يعمل في المتصفح بدون تسجيل دخول، مع معاينة فورية وإمكانية حفظ المسودة محلياً.

## ✨ المزايا
- تحرير Markdown مع معاينة HTML مباشرة جنباً إلى جنب.
- حفظ تلقائي للمحتوى في `localStorage`.
- أدوات شريطية للتنسيق: Bold / Italic / Heading / Link / Code / List.
- تنزيل الملف كـ `.md` أو نسخ الـHTML الناتج.
- تصميم Responsive يدعم الموبايل.
- وضع ليلي (Dark Mode).

## 🧰 التقنيات
- HTML5
- CSS3 (Flexbox / Grid)
- TypeScript (سيُضاف في مرحلة لاحقة) — حالياً JavaScript خفيف.
- مكتبة [marked](https://github.com/markedjs/marked) لتحويل Markdown إلى HTML عبر CDN.

## 🚀 خطوات التشغيل محلياً
```bash
# من جذر الـ Monorepo
cd frontend/markdown-editor-app
# افتح الملف مباشرة في المتصفح
start index.html   # Windows
# أو
open index.html    # macOS
```
لا يحتاج المشروع إلى أي build أو تثبيت حزم.

## 🗺️ Roadmap
- [x] Scaffold أولي: index.html + styles.css + app.js + README
- [ ] تحويل الـ JS إلى TypeScript مع `tsconfig.json`.
- [ ] إضافة شريط أدوات كامل لإدراج الجداول والصور.
- [ ] دعم استيراد/تصدير ملفات متعددة.
- [ ] إضافة اختبارات Unit بسيطة.
- [ ] نسخة Angular لاحقاً في مجلد منفصل.

## 📸 Screenshots
سيتم إضافة صور لاحقاً.

## 📄 License
MIT
