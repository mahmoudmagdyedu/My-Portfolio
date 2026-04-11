# 🌤️ SkyPulse — Weather Dashboard App

A beautiful, responsive weather dashboard that lets you search any city worldwide, view current conditions & a 5-day forecast, save favorite cities, and toggle between light/dark themes — all powered by the free **Open-Meteo API** (no API key needed).

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Open-Meteo](https://img.shields.io/badge/Open--Meteo_API-FF6B00?style=for-the-badge&logo=cloud&logoColor=white)

---

## 🔍 المشكلة

تطبيقات الطقس غالبًا مليئة بالإعلانات وبطيئة. نحتاج تطبيق سريع وبسيط وأنيق يعرض الطقس مباشرة بدون تعقيد.

## ✨ المزايا

- 🔎 **بحث فوري** عن أي مدينة حول العالم مع اقتراحات تلقائية
- 🌡️ **عرض الطقس الحالي** — درجة الحرارة، الرطوبة، سرعة الرياح، الحالة الجوية
- 📅 **توقعات 5 أيام** — أعلى/أدنى درجة حرارة يوميًا مع أيقونات الطقس
- ⭐ **المدن المفضلة** — حفظ واسترجاع المدن بنقرة واحدة (Local Storage)
- 🌗 **وضع داكن/فاتح** — تبديل سلس مع حفظ التفضيل
- 📱 **تصميم متجاوب** — يعمل على جميع أحجام الشاشات
- 🚫 **بدون مفتاح API** — يستخدم Open-Meteo API المجاني بالكامل

## 🛠️ التقنيات

| التقنية | الاستخدام |
|---|---|
| **TypeScript** | المنطق الأساسي والـ Type Safety |
| **Tailwind CSS** (CDN) | التنسيق والتصميم المتجاوب |
| **Open-Meteo API** | بيانات الطقس والتوقعات |
| **Geocoding API** | تحويل اسم المدينة لإحداثيات |
| **Local Storage** | حفظ المفضلة وتفضيل الثيم |

## 🚀 خطوات التشغيل

1. افتح `index.html` مباشرة في المتصفح أو استخدم Live Server.

> لا حاجة لتثبيت أي حزم أو مفاتيح API — التطبيق جاهز للعمل فورًا!

## 📁 هيكل المشروع

```
weather-dashboard-app/
├── index.html              # الصفحة الرئيسية
├── dist/
│   └── app.js              # الكود المُترجَم (JavaScript)
├── docs/                   # لقطات الشاشة
└── README.md
```

## 🗺️ Roadmap

- [ ] إضافة خريطة تفاعلية لعرض الموقع
- [ ] رسوم بيانية لدرجات الحرارة (Chart.js)
- [ ] دعم تحديد الموقع تلقائيًا (Geolocation API)
- [ ] وحدات قياس متعددة (°C / °F)
- [ ] PWA — تشغيل بدون إنترنت

---

**صُنع بـ ❤️ بواسطة [محمود مجدي](https://mahmoudmagdyedu.github.io/My-Portfolio/)**
