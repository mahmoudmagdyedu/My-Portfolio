// CryptoPulse — Crypto Price Tracker App
// Source: CoinGecko Public API (no key required)

const API = 'https://api.coingecko.com/api/v3/coins/markets';
const REFRESH_MS = 60000;
const FAV_KEY = 'cryptopulse:favorites';
const THEME_KEY = 'cryptopulse:theme';

const state = {
  vs: 'usd',
  sort: 'market_cap_desc',
  search: '',
  favoritesOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')),
  data: [],
};

const $ = (sel) => document.querySelector(sel);
const tbody = $('#crypto-tbody');
const statusEl = $('#status');

const CURRENCY_SYMBOLS = { usd: '$', eur: '€', egp: 'ج.م' };

function formatPrice(value, vs) {
  const sym = CURRENCY_SYMBOLS[vs] || '';
  if (value == null) return '—';
  const opts = value < 1
    ? { minimumFractionDigits: 2, maximumFractionDigits: 6 }
    : { minimumFractionDigits: 2, maximumFractionDigits: 2 };
  return `${sym} ${Number(value).toLocaleString('en-US', opts)}`;
}

function formatCompact(value) {
  if (value == null) return '—';
  return Number(value).toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 2 });
}

function sortRows(rows) {
  const sorted = [...rows];
  switch (state.sort) {
    case 'price_desc': sorted.sort((a, b) => b.current_price - a.current_price); break;
    case 'price_asc': sorted.sort((a, b) => a.current_price - b.current_price); break;
    case 'change_desc': sorted.sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)); break;
    case 'change_asc': sorted.sort((a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)); break;
    default: sorted.sort((a, b) => b.market_cap - a.market_cap);
  }
  return sorted;
}

function render() {
  const q = state.search.trim().toLowerCase();
  let rows = state.data;
  if (q) rows = rows.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
  if (state.favoritesOnly) rows = rows.filter(c => state.favorites.has(c.id));
  rows = sortRows(rows);

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted)">لا توجد نتائج مطابقة.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map((c, i) => {
    const change = c.price_change_percentage_24h ?? 0;
    const cls = change >= 0 ? 'change-up' : 'change-down';
    const sign = change >= 0 ? '▲' : '▼';
    const isFav = state.favorites.has(c.id);
    return `
      <tr>
        <td>${i + 1}</td>
        <td>
          <span class="coin">
            <img src="${c.image}" alt="${c.name}" loading="lazy" />
            <span><strong>${c.name}</strong> <span class="symbol">${c.symbol}</span></span>
          </span>
        </td>
        <td class="price">${formatPrice(c.current_price, state.vs)}</td>
        <td class="${cls}">${sign} ${Math.abs(change).toFixed(2)}%</td>
        <td>${formatCompact(c.market_cap)}</td>
        <td><button class="fav-btn ${isFav ? 'active' : ''}" data-id="${c.id}" aria-label="تبديل المفضلة">${isFav ? '★' : '☆'}</button></td>
      </tr>
    `;
  }).join('');
}

async function loadData() {
  statusEl.textContent = 'جاري التحميل…';
  try {
    const url = `${API}?vs_currency=${state.vs}&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
    statusEl.textContent = `آخر تحديث: ${new Date().toLocaleTimeString('ar-EG')} — ${state.data.length} عملة`;
    render();
  } catch (err) {
    statusEl.textContent = `تعذّر جلب البيانات: ${err.message}. أعد المحاولة بعد قليل.`;
  }
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  localStorage.setItem(FAV_KEY, JSON.stringify([...state.favorites]));
  render();
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  $('#theme-btn').textContent = theme === 'dark' ? '☀️ الوضع الفاتح' : '🌙 الوضع الداكن';
}

function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');

  $('#vs-currency').addEventListener('change', (e) => { state.vs = e.target.value; loadData(); });
  $('#sort-select').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  $('#search-input').addEventListener('input', (e) => { state.search = e.target.value; render(); });
  $('#refresh-btn').addEventListener('click', loadData);
  $('#theme-btn').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(cur);
  });
  const favBtn = $('#favorites-only');
  favBtn.addEventListener('click', () => {
    state.favoritesOnly = !state.favoritesOnly;
    favBtn.setAttribute('aria-pressed', String(state.favoritesOnly));
    render();
  });
  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (btn) toggleFavorite(btn.dataset.id);
  });

  loadData();
  setInterval(loadData, REFRESH_MS);
}

init();
