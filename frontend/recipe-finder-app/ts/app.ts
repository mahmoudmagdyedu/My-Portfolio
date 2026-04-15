// ===== Types =====
interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strYoutube?: string;
  [key: string]: string | undefined;
}

interface Category {
  strCategory: string;
}

// ===== DOM References =====
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const btnSearch = document.getElementById('btn-search') as HTMLButtonElement;
const btnRandom = document.getElementById('btn-random') as HTMLButtonElement;
const categoriesEl = document.getElementById('categories') as HTMLDivElement;
const resultsEl = document.getElementById('results') as HTMLDivElement;
const noResults = document.getElementById('no-results') as HTMLParagraphElement;
const loader = document.getElementById('loader') as HTMLDivElement;
const modal = document.getElementById('modal') as HTMLDivElement;
const modalBody = document.getElementById('modal-body') as HTMLDivElement;
const modalClose = document.getElementById('modal-close') as HTMLButtonElement;
const modalBackdrop = modal.querySelector('.modal__backdrop') as HTMLDivElement;

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// ===== Helpers =====
function showLoader(): void {
  loader.hidden = false;
  resultsEl.innerHTML = '';
  noResults.hidden = true;
}

function hideLoader(): void {
  loader.hidden = true;
}

function renderCards(meals: Meal[]): void {
  hideLoader();
  if (!meals || meals.length === 0) {
    noResults.hidden = false;
    return;
  }
  noResults.hidden = true;
  resultsEl.innerHTML = meals
    .map(
      (m) => `
    <article class="card" data-id="${m.idMeal}">
      <img class="card__img" src="${m.strMealThumb}" alt="${m.strMeal}" loading="lazy" />
      <div class="card__body">
        <h3 class="card__title">${m.strMeal}</h3>
        <p class="card__meta">${m.strCategory ?? ''} ${m.strArea ? '· ' + m.strArea : ''}</p>
      </div>
    </article>`
    )
    .join('');

  // Attach click listeners
  resultsEl.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('click', () => {
      const id = (card as HTMLElement).dataset.id!;
      openMealDetail(id);
    });
  });
}

function getIngredients(meal: Meal): string[] {
  const ingredients: string[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push(`${measure?.trim() ?? ''} ${ing.trim()}`.trim());
    }
  }
  return ingredients;
}

// ===== API Calls =====
async function searchMeals(query: string): Promise<void> {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(query)}`);
    const data = await res.json();
    renderCards(data.meals ?? []);
  } catch {
    hideLoader();
    noResults.hidden = false;
  }
}

async function filterByCategory(category: string): Promise<void> {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/filter.php?c=${encodeURIComponent(category)}`);
    const data = await res.json();
    renderCards(data.meals ?? []);
  } catch {
    hideLoader();
    noResults.hidden = false;
  }
}

async function getRandomMeal(): Promise<void> {
  showLoader();
  try {
    const res = await fetch(`${API_BASE}/random.php`);
    const data = await res.json();
    if (data.meals && data.meals.length) {
      openMealDetail(data.meals[0].idMeal);
      hideLoader();
    }
  } catch {
    hideLoader();
  }
}

async function openMealDetail(id: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/lookup.php?i=${id}`);
    const data = await res.json();
    const meal: Meal = data.meals[0];
    const ingredients = getIngredients(meal);

    modalBody.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" />
      <h2>${meal.strMeal}</h2>
      <div class="tags">
        ${meal.strCategory ? `<span class="tag">${meal.strCategory}</span>` : ''}
        ${meal.strArea ? `<span class="tag">${meal.strArea}</span>` : ''}
      </div>
      <h3>🧾 Ingredients</h3>
      <ul>${ingredients.map((i) => `<li>${i}</li>`).join('')}</ul>
      <h3>📝 Instructions</h3>
      <p>${meal.strInstructions ?? ''}</p>
      ${meal.strYoutube ? `<a class="video-link" href="${meal.strYoutube}" target="_blank" rel="noopener">▶ Watch on YouTube</a>` : ''}
    `;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
  } catch {
    // silently fail
  }
}

function closeModal(): void {
  modal.hidden = true;
  document.body.style.overflow = '';
}

// ===== Categories =====
async function loadCategories(): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/list.php?c=list`);
    const data = await res.json();
    const cats: Category[] = data.meals ?? [];
    categoriesEl.innerHTML = cats
      .map((c) => `<button class="categories__pill" data-cat="${c.strCategory}">${c.strCategory}</button>`)
      .join('');

    categoriesEl.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('categories__pill')) {
        // Toggle active
        categoriesEl.querySelectorAll('.categories__pill').forEach((p) => p.classList.remove('categories__pill--active'));
        target.classList.add('categories__pill--active');
        filterByCategory(target.dataset.cat!);
      }
    });
  } catch {
    // categories fail silently
  }
}

// ===== Event Listeners =====
btnSearch.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) searchMeals(q);
});

searchInput.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (q) searchMeals(q);
  }
});

btnRandom.addEventListener('click', () => getRandomMeal());
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});

// ===== Init =====
loadCategories();
searchMeals(''); // load popular meals on start
