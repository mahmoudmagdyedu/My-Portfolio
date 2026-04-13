# 💰 Expense Tracker App

A smart and modern expense tracker application built with **Angular 17 concepts**, featuring budget goals, category analytics, date filtering, and interactive charts.

![Angular](https://img.shields.io/badge/Angular_Inspired-17-DD0031?logo=angular) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06B6D4?logo=tailwindcss) ![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?logo=chartdotjs)

## 📸 Screenshots

| Dashboard | Expenses | Analytics | Budget |
|-----------|----------|-----------|--------|
| ![Dashboard](docs/dashboard.png) | ![Expenses](docs/expenses.png) | ![Analytics](docs/analytics.png) | ![Budget](docs/budget.png) |

## 🎯 Problem Statement

Managing personal finances can be overwhelming without a clear overview of spending patterns. This app provides an intuitive way to log expenses, categorize them, set budgets, and visualize spending trends — all from the browser.

## ✨ Features

- **Dashboard Overview** — Total spent, budget remaining, recent transactions
- **Full CRUD** — Add, edit, delete, and view expense records
- **Category Management** — Food, Transport, Bills, Entertainment, Shopping, Health, Education, Travel
- **Budget Goals** — Set monthly budget limits with progress ring indicator
- **Date Range Filtering** — Today, this week, this month, or all time
- **Interactive Charts** — Doughnut chart (category breakdown) + Bar chart (monthly trend) via Chart.js
- **Search & Sort** — Real-time search and multi-column sorting
- **SPA Routing** — Multi-page navigation (Dashboard, Expenses, Analytics, Budget)
- **Form Validation** — Robust validation with user-friendly error messages
- **Local Storage** — All data persists in the browser
- **Dark/Light Theme** — Toggle between themes
- **Responsive Design** — Mobile, tablet, and desktop
- **Seed Data** — Pre-loaded sample expenses for demo

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|--------|
| HTML5 / CSS3 | Structure & styling |
| TypeScript (concepts) | Type-safe models & services |
| Tailwind CSS 3.x | Utility-first styling |
| Chart.js 4.x | Interactive charts |
| LocalStorage API | Client-side persistence |
| Angular-Inspired Architecture | Components, services, routing, guards |

## 📁 Project Structure

```
expense-tracker-app/
├── index.html          # Main SPA entry point
├── README.md
├── docs/               # Screenshots placeholder
└── src/                # Angular source reference
    └── app/
        ├── models/
        ├── services/
        ├── guards/
        ├── pipes/
        ├── components/
        └── app.routes.ts
```

## 🚀 Getting Started

Open `index.html` in any modern browser — no build step required for the demo version.

For the full Angular version:
```bash
npm install
ng serve
```

## 🗺️ Roadmap

- [x] Dashboard with summary cards
- [x] CRUD operations
- [x] Category-based organization
- [x] Form validation
- [x] SPA routing
- [x] Charts & analytics (Chart.js)
- [x] Budget goal tracking with ring
- [x] Dark/Light theme
- [ ] Export to CSV/PDF
- [ ] Recurring expenses
- [ ] Multi-currency support

## 📝 License

MIT

## 👤 Author

**Mahmoud Magdy** — [GitHub](https://github.com/mahmoudmagdyedu) · [Portfolio](https://mahmoudmagdyedu.github.io/My-Portfolio/)
