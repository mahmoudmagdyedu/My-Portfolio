# 🎬 Movie Search App

A responsive movie search application that lets users discover and explore movies using the OMDB API.

## 🔍 Problem

Finding movie information quickly can be tedious — you need a simple, fast interface to search and browse movie details without navigating complex sites.

## ✨ Features

- **Real-time search**: Type a movie name and get instant results from the OMDB API
- **Movie details**: View poster, year, rating, plot, director, actors, and genre
- **Responsive design**: Works seamlessly on desktop, tablet, and mobile
- **Loading states**: Skeleton loaders and spinners for smooth UX
- **Error handling**: Graceful handling of network errors and empty results
- **Favorites**: Save movies to a local favorites list (localStorage)
- **Dark theme**: Modern dark UI inspired by popular streaming platforms

## 🛠️ Technologies

- HTML5 / CSS3
- Vanilla JavaScript (ES6+)
- OMDB API (https://www.omdbapi.com/)
- CSS Grid & Flexbox
- LocalStorage for favorites persistence
- Fetch API with async/await

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/mahmoudmagdyedu/My-Portfolio.git
   cd My-Portfolio/frontend/movie-search-app
   ```
2. Get a free API key from [OMDB API](https://www.omdbapi.com/apikey.aspx)
3. Replace `YOUR_API_KEY` in `app.js` with your key
4. Open `index.html` in your browser

## 📸 Screenshots

> Screenshots will be added after UI completion.

## 📂 Project Structure

```
movie-search-app/
├── index.html
├── style.css
├── app.js
├── README.md
└── docs/
    └── screenshots/
```

## 🗺️ Roadmap

- [ ] Add pagination for search results
- [ ] Implement advanced filters (year, type)
- [ ] Add movie trailers via YouTube API
- [ ] Convert to TypeScript
- [ ] Add unit tests

## 📄 License

MIT
