# 🧠 BrainBuzz — Interactive Quiz App

An interactive quiz application built with **TypeScript** and **Tailwind CSS** that fetches questions from the [Open Trivia Database API](https://opentdb.com/). Test your knowledge across multiple categories with adjustable difficulty levels, a countdown timer, and detailed score tracking.

## ✨ Features

- 🎯 **Category Selection** — Choose from 20+ trivia categories
- 📊 **Difficulty Levels** — Easy, Medium, or Hard
- ⏱️ **Countdown Timer** — 30 seconds per question with visual SVG progress ring
- 📈 **Score Tracking** — Real-time score with detailed results breakdown
- 🏆 **High Scores** — Persistent leaderboard using Local Storage
- 🎨 **Beautiful UI** — Glassmorphism design with gradient background & smooth animations
- 📱 **Fully Responsive** — Works on all screen sizes
- ♿ **Accessible** — Keyboard navigation and screen reader friendly

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Type-safe application logic |
| **Tailwind CSS** (CDN) | Utility-first styling |
| **Open Trivia DB API** | Question data source |
| **Local Storage** | High score persistence |

## 📁 Structure

```
quiz-app/
├── index.html              # Main HTML entry point
├── src/
│   ├── types.ts            # TypeScript interfaces & types
│   ├── api.ts              # API fetching & data mapping
│   ├── storage.ts          # Local Storage management
│   ├── timer.ts            # Countdown timer logic
│   ├── quiz.ts             # Core quiz state machine
│   └── app.ts              # Main entry — UI rendering & events
├── dist/
│   └── app.js              # Compiled JavaScript bundle
├── docs/                   # Screenshots & assets
├── tsconfig.json
└── README.md
```

## 🚀 Run Locally

1. Open `index.html` in your browser — no build step needed.
2. To develop with TypeScript: `npm install -g typescript && tsc`

## 🗺️ Roadmap

- [ ] Multiplayer mode (two players taking turns)
- [ ] Timed challenge mode with global leaderboard
- [ ] Dark/Light theme toggle
- [ ] Sound effects & haptic feedback
- [ ] PWA support
