# 🎯 Habit Tracker App

A clean, responsive habit tracking application built with TypeScript and vanilla CSS. Track your daily habits, monitor streaks, and build consistency — all data persisted in localStorage.

## 🖼️ Screenshots

![Habit Tracker Preview](docs/screenshot-placeholder.png)

## 🚀 Features

- **Add / Remove Habits** — Create habits with custom names and optional emoji icons.
- **Daily Check-off** — Mark habits as completed each day with a single click.
- **Streak Tracking** — Automatically calculates current and best streaks for each habit.
- **Progress Overview** — Visual progress bar showing daily completion percentage.
- **Category Filters** — Organize habits into categories (Health, Productivity, Learning, Personal).
- **LocalStorage Persistence** — All data saved locally; no backend required.
- **Responsive Design** — Works perfectly on desktop, tablet, and mobile.
- **TypeScript Powered** — Strongly typed interfaces and validation for reliable state management.

## 🛠️ Technologies

| Technology | Purpose |
|---|---|
| HTML5 | Semantic structure |
| CSS3 | Custom properties, Grid, Flexbox, animations |
| TypeScript | Type-safe logic, interfaces, enums |
| localStorage | Client-side data persistence |

## 📁 Project Structure

```
habit-tracker-app/
├── index.html
├── css/
│   └── style.css
├── ts/
│   └── app.ts          # Source TypeScript
├── js/
│   └── app.js          # Compiled JavaScript
├── docs/
│   └── screenshot-placeholder.png
└── README.md
```

## ⚡ Getting Started

1. Open `index.html` in your browser, or
2. Use a local dev server:
   ```bash
   npx live-server .
   ```
3. To recompile TypeScript:
   ```bash
   npx tsc ts/app.ts --outDir js --target ES2020 --module ES2020
   ```

## 🗺️ Roadmap

- [ ] Weekly / monthly calendar view
- [ ] Dark mode toggle
- [ ] Export / import habits as JSON
- [ ] Habit reminders via Notification API
- [ ] Charts & analytics with Chart.js

## 📄 License

MIT
