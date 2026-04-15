# 🍳 Recipe Finder App

A responsive recipe search application that lets users discover meals by name, category, or ingredient. Built with **TypeScript**, **HTML5**, and **CSS3**, consuming the free [TheMealDB API](https://www.themealdb.com/api.php).

## 🎯 Problem

Finding recipes online often means sifting through ad-heavy blogs. This app provides a clean, fast interface to search and browse recipes with essential details — ingredients, instructions, and a video tutorial link.

## ✨ Features

- 🔍 **Search by name** — instant results as you type
- 🏷️ **Filter by category** — Beef, Chicken, Dessert, Seafood, Vegetarian, etc.
- 📋 **Recipe detail modal** — full ingredient list, step-by-step instructions, and YouTube link
- 🎲 **Random recipe** — feeling adventurous? Get a surprise meal
- 📱 **Fully responsive** — works great on mobile, tablet, and desktop
- ⚡ **No framework** — vanilla TypeScript for maximum learning value

## 🛠️ Technologies

| Layer | Tech |
|-------|------|
| Language | TypeScript (ES2020) |
| Markup | HTML5, semantic elements |
| Styling | CSS3, CSS Grid, Flexbox, CSS Variables |
| API | TheMealDB (free, no key required) |
| Build | tsc (TypeScript compiler) |

## 📂 Project Structure

```
recipe-finder-app/
├── index.html
├── css/
│   └── style.css
├── ts/
│   └── app.ts          # Source TypeScript
├── js/
│   └── app.js          # Compiled JavaScript (generated)
├── docs/
│   └── screenshot.png  # Placeholder
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

1. Clone the repo:
   ```bash
   git clone https://github.com/mahmoudmagdyedu/My-Portfolio.git
   cd My-Portfolio/frontend/recipe-finder-app
   ```
2. Compile TypeScript (optional, `js/app.js` is included):
   ```bash
   npx tsc
   ```
3. Open `index.html` in your browser — no server needed.

## 🗺️ Roadmap

- [ ] Add favourites (localStorage)
- [ ] Area-based filtering (Italian, Japanese, etc.)
- [ ] Ingredient-based search
- [ ] Dark mode toggle
- [ ] Print-friendly recipe view
- [ ] PWA support with offline caching

## 📸 Screenshots

> _Screenshots will be added after initial implementation._

## 📄 License

MIT
