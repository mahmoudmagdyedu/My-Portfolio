// CountDown Pro — Event Countdown App
// TypeScript-style vanilla JS with strong typing patterns

/**
 * @typedef {Object} CountdownEvent
 * @property {string} id
 * @property {string} name
 * @property {string} icon
 * @property {string} targetDate - ISO string
 * @property {number} createdAt - timestamp
 */

const STORAGE_KEY = 'countdown-pro-events';

// ── State ──────────────────────────────────────────────
/** @type {CountdownEvent[]} */
let events = [];
let selectedIcon = '📅';
/** @type {number|null} */
let tickInterval = null;

// ── DOM Refs ───────────────────────────────────────────
const eventsGrid = /** @type {HTMLDivElement} */ (document.getElementById('eventsGrid'));
const emptyState = /** @type {HTMLDivElement} */ (document.getElementById('emptyState'));
const addEventBtn = /** @type {HTMLButtonElement} */ (document.getElementById('addEventBtn'));
const eventModal = /** @type {HTMLDivElement} */ (document.getElementById('eventModal'));
const modalOverlay = /** @type {HTMLDivElement} */ (document.getElementById('modalOverlay'));
const eventForm = /** @type {HTMLFormElement} */ (document.getElementById('eventForm'));
const eventName = /** @type {HTMLInputElement} */ (document.getElementById('eventName'));
const eventDate = /** @type {HTMLInputElement} */ (document.getElementById('eventDate'));
const cancelBtn = /** @type {HTMLButtonElement} */ (document.getElementById('cancelBtn'));
const darkToggle = /** @type {HTMLButtonElement} */ (document.getElementById('darkToggle'));
const iconBtns = /** @type {NodeListOf<HTMLButtonElement>} */ (document.querySelectorAll('.icon-btn'));

// ── Helpers ────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    events = raw ? JSON.parse(raw) : [];
  } catch {
    events = [];
  }
}

function saveEvents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * @param {string} isoDate
 * @returns  days: number, hours: number, minutes: number, seconds: number, done: boolean, soon: boolean 
 */
function calcRemaining(isoDate) {
  const diff = new Date(isoDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, soon: false };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  const soon = diff < 86400000; // less than 24h
  return { days, hours, minutes, seconds, done: false, soon };
}

function pad(n) { return String(n).padStart(2, '0'); }

// ── Render ─────────────────────────────────────────────
function render() {
  if (events.length === 0) {
    eventsGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }
  eventsGrid.classList.remove('hidden');
  emptyState.classList.add('hidden');

  // Sort: soonest first, done at bottom
  const sorted = [...events].sort((a, b) => {
    const aD = new Date(a.targetDate).getTime() - Date.now();
    const bD = new Date(b.targetDate).getTime() - Date.now();
    if (aD <= 0 && bD > 0) return 1;
    if (bD <= 0 && aD > 0) return -1;
    return aD - bD;
  });

  eventsGrid.innerHTML = sorted.map(ev => {
    const r = calcRemaining(ev.targetDate);
    const dateStr = new Date(ev.targetDate).toLocaleDateString('ar-EG', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    return `
      <div class="countdown-card bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 relative ${r.done ? 'event-done' : ''} ${r.soon && !r.done ? 'soon' : ''}" data-id="${ev.id}">
        <button class="delete-btn absolute top-3 left-3 w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 flex items-center justify-center transition text-sm cursor-pointer" data-id="${ev.id}" title="حذف">✕</button>
        <div class="flex items-center gap-3 mb-4">
          <span class="text-3xl">${ev.icon}</span>
          <div>
            <h3 class="font-black text-slate-800 dark:text-white text-lg leading-tight">${ev.name}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">${dateStr}</p>
          </div>
        </div>
        ${r.done ? '' : `
        <div class="flex justify-center gap-3" dir="ltr">
          <div class="time-unit bg-slate-50 dark:bg-slate-700/50 rounded-xl py-3 px-2">
            <div class="time-value" data-field="days" data-id="${ev.id}">${pad(r.days)}</div>
            <div class="time-label">يوم</div>
          </div>
          <div class="time-unit bg-slate-50 dark:bg-slate-700/50 rounded-xl py-3 px-2">
            <div class="time-value" data-field="hours" data-id="${ev.id}">${pad(r.hours)}</div>
            <div class="time-label">ساعة</div>
          </div>
          <div class="time-unit bg-slate-50 dark:bg-slate-700/50 rounded-xl py-3 px-2">
            <div class="time-value" data-field="minutes" data-id="${ev.id}">${pad(r.minutes)}</div>
            <div class="time-label">دقيقة</div>
          </div>
          <div class="time-unit bg-slate-50 dark:bg-slate-700/50 rounded-xl py-3 px-2">
            <div class="time-value" data-field="seconds" data-id="${ev.id}">${pad(r.seconds)}</div>
            <div class="time-label">ثانية</div>
          </div>
        </div>
        `}
      </div>
    `;
  }).join('');
}

function tick() {
  events.forEach(ev => {
    const r = calcRemaining(ev.targetDate);
    const fields = ['days', 'hours', 'minutes', 'seconds'];
    const values = [r.days, r.hours, r.minutes, r.seconds];
    fields.forEach((f, i) => {
      const el = document.querySelector(`[data-field="${f}"][data-id="${ev.id}"]`);
      if (el) el.textContent = pad(values[i]);
    });
    // Mark done
    if (r.done) {
      const card = document.querySelector(`.countdown-card[data-id="${ev.id}"]`);
      if (card && !card.classList.contains('event-done')) render();
    }
  });
}

// ── Modal ──────────────────────────────────────────────
function openModal() {
  eventModal.classList.remove('hidden');
  eventName.value = '';
  eventDate.value = '';
  selectedIcon = '📅';
  iconBtns.forEach(b => b.classList.toggle('selected', b.dataset.icon === selectedIcon));
  eventName.focus();
}

function closeModal() {
  eventModal.classList.add('hidden');
}

// ── Events ─────────────────────────────────────────────
addEventBtn.addEventListener('click', openModal);
modalOverlay.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

iconBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedIcon = btn.dataset.icon || '📅';
    iconBtns.forEach(b => b.classList.toggle('selected', b === btn));
  });
});

eventForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = eventName.value.trim();
  const date = eventDate.value;
  if (!name || !date) return;

  /** @type {CountdownEvent} */
  const newEvent = {
    id: generateId(),
    name,
    icon: selectedIcon,
    targetDate: new Date(date).toISOString(),
    createdAt: Date.now()
  };
  events.push(newEvent);
  saveEvents();
  closeModal();
  render();
});

eventsGrid.addEventListener('click', (e) => {
  const btn = /** @type {HTMLElement} */ (e.target).closest('.delete-btn');
  if (!btn) return;
  const id = btn.dataset.id;
  events = events.filter(ev => ev.id !== id);
  saveEvents();
  render();
});

// Dark mode
if (localStorage.getItem('theme') === 'dark') document.documentElement.classList.add('dark');
darkToggle.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Keyboard: Escape closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !eventModal.classList.contains('hidden')) closeModal();
});

// ── Init ───────────────────────────────────────────────
loadEvents();
render();
tickInterval = setInterval(tick, 1000);
