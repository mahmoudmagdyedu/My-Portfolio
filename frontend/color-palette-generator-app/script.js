// PaletteForge — Color Palette Generator
// محمود مجدي — Vanilla JS

const PALETTE_SIZE = 5;
const STORAGE_KEY = 'paletteforge:state';
const THEME_KEY = 'paletteforge:theme';

const paletteEl = document.getElementById('palette');
const generateBtn = document.getElementById('generateBtn');
const copyAllBtn = document.getElementById('copyAllBtn');
const exportBtn = document.getElementById('exportBtn');
const themeToggle = document.getElementById('themeToggle');
const toastEl = document.getElementById('toast');

let swatches = [];

// ===== Color helpers =====
function randomHex() {
  const n = Math.floor(Math.random() * 0xffffff);
  return '#' + n.toString(16).padStart(6, '0').toUpperCase();
}

function isDark(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  // luminance
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum < 0.5;
}

// ===== State =====
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(swatches));
}

// ===== Render =====
function render() {
  paletteEl.innerHTML = '';
  swatches.forEach((sw, idx) => {
    const el = document.createElement('div');
    el.className = 'swatch' + (sw.locked ? ' locked' : '') + (isDark(sw.hex) ? ' dark-text' : '');
    el.style.background = sw.hex;
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', `لون ${sw.hex} — اضغط للنسخ`);
    el.innerHTML = `
      <button class="lock-btn" type="button" aria-label="${sw.locked ? 'فك القفل' : 'قفل اللون'}">${sw.locked ? '🔒' : '🔓'}</button>
      <span class="hex">${sw.hex}</span>
    `;
    // copy on click
    el.addEventListener('click', (e) => {
      if (e.target.closest('.lock-btn')) return;
      copyHex(sw.hex);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyHex(sw.hex); }
    });
    // toggle lock
    el.querySelector('.lock-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      swatches[idx].locked = !swatches[idx].locked;
      saveState();
      render();
    });
    paletteEl.appendChild(el);
  });
}

// ===== Actions =====
function generate() {
  if (!swatches.length) {
    swatches = Array.from({ length: PALETTE_SIZE }, () => ({ hex: randomHex(), locked: false }));
  } else {
    swatches = swatches.map((sw) => sw.locked ? sw : { hex: randomHex(), locked: false });
  }
  saveState();
  render();
}

async function copyHex(hex) {
  try {
    await navigator.clipboard.writeText(hex);
    showToast(`تم نسخ ${hex} ✓`);
  } catch (_) {
    showToast('تعذّر النسخ');
  }
}

async function copyAll() {
  const text = swatches.map((s) => s.hex).join(', ');
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم نسخ اللوحة كاملة ✓');
  } catch (_) {
    showToast('تعذّر النسخ');
  }
}

function exportJSON() {
  const data = {
    name: 'PaletteForge Export',
    generatedAt: new Date().toISOString(),
    colors: swatches.map((s) => s.hex),
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `palette-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('تم تصدير اللوحة 💾');
}

// ===== Toast =====
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
}

// ===== Theme =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}

// ===== Init =====
function init() {
  applyTheme(localStorage.getItem(THEME_KEY) || 'light');
  const saved = loadState();
  if (saved && Array.isArray(saved) && saved.length === PALETTE_SIZE) {
    swatches = saved;
  } else {
    generate();
    return;
  }
  render();
}

generateBtn.addEventListener('click', generate);
copyAllBtn.addEventListener('click', copyAll);
exportBtn.addEventListener('click', exportJSON);
themeToggle.addEventListener('click', toggleTheme);
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    e.preventDefault();
    generate();
  }
});

init();
