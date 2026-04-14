// ===== Movie Search App =====
// Replace with your own OMDB API key: https://www.omdbapi.com/apikey.aspx
const API_KEY = 'YOUR_API_KEY';
const BASE_URL = `https://www.omdbapi.com/?apikey=${API_KEY}`;

// --- DOM Elements ---
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results');
const loader = document.getElementById('loader');
const message = document.getElementById('message');
const modalOverlay = document.getElementById('modal-overlay');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');
const btnSearch = document.getElementById('btn-search');
const btnFavorites = document.getElementById('btn-favorites');
const favoritesSection = document.getElementById('favorites-section');
const favoritesList = document.getElementById('favorites-list');
const favCount = document.getElementById('fav-count');

// --- State ---
let favorites = JSON.parse(localStorage.getItem('movieFavorites')) || [];

// --- Init ---
updateFavCount();

// --- Event Listeners ---
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

btnSearch.addEventListener('click', () => switchTab('search'));
btnFavorites.addEventListener('click', () => switchTab('favorites'));

// --- Functions ---
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  showLoader();
  hideMessage();
  resultsContainer.innerHTML = '';

  try {
    const res = await fetch(`${BASE_URL}&s=${encodeURIComponent(query)}`);
    const data = await res.json();

    hideLoader();

    if (data.Response === 'True') {
      renderMovies(data.Search, resultsContainer);
    } else {
      showMessage(data.Error || 'No movies found. Try a different search.');
    }
  } catch (err) {
    hideLoader();
    showMessage('Network error. Please check your connection and try again.');
  }
}

function renderMovies(movies, container) {
  container.innerHTML = '';
  movies.forEach((movie) => {
    const isFav = favorites.some((f) => f.imdbID === movie.imdbID);
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img
        class="card__poster"
        src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}"
        alt="${movie.Title}"
        loading="lazy"
      />
      <div class="card__info">
        <p class="card__title" title="${movie.Title}">${movie.Title}</p>
        <p class="card__year">${movie.Year}</p>
      </div>
      <button class="card__fav-btn ${isFav ? 'saved' : ''}" data-id="${movie.imdbID}" title="Toggle favorite">
        ${isFav ? '★' : '☆'}
      </button>
    `;

    // Card click → show detail
    card.querySelector('.card__poster').addEventListener('click', () => showDetail(movie.imdbID));
    card.querySelector('.card__info').addEventListener('click', () => showDetail(movie.imdbID));

    // Fav button
    card.querySelector('.card__fav-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFavorite(movie);
      // Re-render current view
      renderMovies(movies, container);
    });

    container.appendChild(card);
  });
}

async function showDetail(imdbID) {
  modalOverlay.classList.remove('hidden');
  modalContent.innerHTML = '<div class="loader"><div class="spinner"></div></div>';

  try {
    const res = await fetch(`${BASE_URL}&i=${imdbID}&plot=full`);
    const movie = await res.json();

    if (movie.Response === 'True') {
      modalContent.innerHTML = `
        <div class="detail">
          <img
            class="detail__poster"
            src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}"
            alt="${movie.Title}"
          />
          <div class="detail__info">
            <h2 class="detail__title">${movie.Title}</h2>
            <p class="detail__meta">${movie.Year} &bull; ${movie.Runtime} &bull; ${movie.Genre}</p>
            ${movie.imdbRating !== 'N/A' ? `<span class="detail__rating">⭐ ${movie.imdbRating}/10</span>` : ''}
            <p class="detail__plot">${movie.Plot}</p>
            <p class="detail__label"><strong>Director:</strong> ${movie.Director}</p>
            <p class="detail__label"><strong>Actors:</strong> ${movie.Actors}</p>
            <p class="detail__label"><strong>Language:</strong> ${movie.Language}</p>
            <p class="detail__label"><strong>Country:</strong> ${movie.Country}</p>
            ${movie.Awards !== 'N/A' ? `<p class="detail__label"><strong>Awards:</strong> ${movie.Awards}</p>` : ''}
          </div>
        </div>
      `;
    } else {
      modalContent.innerHTML = '<p class="message">Could not load movie details.</p>';
    }
  } catch (err) {
    modalContent.innerHTML = '<p class="message">Network error loading details.</p>';
  }
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalContent.innerHTML = '';
}

function toggleFavorite(movie) {
  const idx = favorites.findIndex((f) => f.imdbID === movie.imdbID);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push({ imdbID: movie.imdbID, Title: movie.Title, Year: movie.Year, Poster: movie.Poster });
  }
  localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  updateFavCount();
}

function switchTab(tab) {
  if (tab === 'search') {
    btnSearch.classList.add('active');
    btnFavorites.classList.remove('active');
    document.querySelector('.search-section').classList.remove('hidden');
    resultsContainer.classList.remove('hidden');
    favoritesSection.classList.add('hidden');
  } else {
    btnFavorites.classList.add('active');
    btnSearch.classList.remove('active');
    document.querySelector('.search-section').classList.add('hidden');
    resultsContainer.classList.add('hidden');
    favoritesSection.classList.remove('hidden');
    renderMovies(favorites, favoritesList);

    if (favorites.length === 0) {
      favoritesList.innerHTML = '<p class="message">No favorites yet. Search and save some movies!</p>';
    }
  }
}

function updateFavCount() {
  favCount.textContent = favorites.length;
}

function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showMessage(text) {
  message.textContent = text;
  message.classList.remove('hidden');
}

function hideMessage() {
  message.classList.add('hidden');
}
