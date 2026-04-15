// ===== DOM References =====
var searchInput = document.getElementById('search-input');
var btnSearch = document.getElementById('btn-search');
var btnRandom = document.getElementById('btn-random');
var categoriesEl = document.getElementById('categories');
var resultsEl = document.getElementById('results');
var noResults = document.getElementById('no-results');
var loader = document.getElementById('loader');
var modal = document.getElementById('modal');
var modalBody = document.getElementById('modal-body');
var modalClose = document.getElementById('modal-close');
var modalBackdrop = modal.querySelector('.modal__backdrop');
var API_BASE = 'https://www.themealdb.com/api/json/v1/1';
// ===== Helpers =====
function showLoader() {
    loader.hidden = false;
    resultsEl.innerHTML = '';
    noResults.hidden = true;
}
function hideLoader() {
    loader.hidden = true;
}
function renderCards(meals) {
    hideLoader();
    if (!meals || meals.length === 0) {
        noResults.hidden = false;
        return;
    }
    noResults.hidden = true;
    resultsEl.innerHTML = meals
        .map(function (m) {
        var _a;
        return "\n    <article class=\"card\" data-id=\"" + m.idMeal + "\">\n      <img class=\"card__img\" src=\"" + m.strMealThumb + "\" alt=\"" + m.strMeal + "\" loading=\"lazy\" />\n      <div class=\"card__body\">\n        <h3 class=\"card__title\">" + m.strMeal + "</h3>\n        <p class=\"card__meta\">" + ((_a = m.strCategory) !== null && _a !== void 0 ? _a : '') + " " + (m.strArea ? '· ' + m.strArea : '') + "</p>\n      </div>\n    </article>";
    })
        .join('');
    resultsEl.querySelectorAll('.card').forEach(function (card) {
        card.addEventListener('click', function () {
            var id = card.dataset.id;
            openMealDetail(id);
        });
    });
}
function getIngredients(meal) {
    var ingredients = [];
    for (var i = 1; i <= 20; i++) {
        var ing = meal['strIngredient' + i];
        var measure = meal['strMeasure' + i];
        if (ing && ing.trim()) {
            ingredients.push(((measure === null || measure === void 0 ? void 0 : measure.trim()) || '') + ' ' + ing.trim());
        }
    }
    return ingredients;
}
// ===== API Calls =====
function searchMeals(query) {
    showLoader();
    return fetch(API_BASE + '/search.php?s=' + encodeURIComponent(query))
        .then(function (res) { return res.json(); })
        .then(function (data) { renderCards(data.meals || []); })
        .catch(function () { hideLoader(); noResults.hidden = false; });
}
function filterByCategory(category) {
    showLoader();
    return fetch(API_BASE + '/filter.php?c=' + encodeURIComponent(category))
        .then(function (res) { return res.json(); })
        .then(function (data) { renderCards(data.meals || []); })
        .catch(function () { hideLoader(); noResults.hidden = false; });
}
function getRandomMeal() {
    showLoader();
    return fetch(API_BASE + '/random.php')
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (data.meals && data.meals.length) {
            openMealDetail(data.meals[0].idMeal);
            hideLoader();
        }
    })
        .catch(function () { hideLoader(); });
}
function openMealDetail(id) {
    return fetch(API_BASE + '/lookup.php?i=' + id)
        .then(function (res) { return res.json(); })
        .then(function (data) {
        var meal = data.meals[0];
        var ingredients = getIngredients(meal);
        modalBody.innerHTML =
            '<img src="' + meal.strMealThumb + '" alt="' + meal.strMeal + '" />' +
            '<h2>' + meal.strMeal + '</h2>' +
            '<div class="tags">' +
            (meal.strCategory ? '<span class="tag">' + meal.strCategory + '</span>' : '') +
            (meal.strArea ? '<span class="tag">' + meal.strArea + '</span>' : '') +
            '</div>' +
            '<h3>🧾 Ingredients</h3>' +
            '<ul>' + ingredients.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' +
            '<h3>📝 Instructions</h3>' +
            '<p>' + (meal.strInstructions || '') + '</p>' +
            (meal.strYoutube ? '<a class="video-link" href="' + meal.strYoutube + '" target="_blank" rel="noopener">▶ Watch on YouTube</a>' : '');
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    })
        .catch(function () { });
}
function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
}
// ===== Categories =====
function loadCategories() {
    return fetch(API_BASE + '/list.php?c=list')
        .then(function (res) { return res.json(); })
        .then(function (data) {
        var cats = data.meals || [];
        categoriesEl.innerHTML = cats
            .map(function (c) { return '<button class="categories__pill" data-cat="' + c.strCategory + '">' + c.strCategory + '</button>'; })
            .join('');
        categoriesEl.addEventListener('click', function (e) {
            var target = e.target;
            if (target.classList.contains('categories__pill')) {
                categoriesEl.querySelectorAll('.categories__pill').forEach(function (p) { return p.classList.remove('categories__pill--active'); });
                target.classList.add('categories__pill--active');
                filterByCategory(target.dataset.cat);
            }
        });
    })
        .catch(function () { });
}
// ===== Event Listeners =====
btnSearch.addEventListener('click', function () {
    var q = searchInput.value.trim();
    if (q) searchMeals(q);
});
searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        var q = searchInput.value.trim();
        if (q) searchMeals(q);
    }
});
btnRandom.addEventListener('click', function () { return getRandomMeal(); });
modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
});
// ===== Init =====
loadCategories();
searchMeals('');
