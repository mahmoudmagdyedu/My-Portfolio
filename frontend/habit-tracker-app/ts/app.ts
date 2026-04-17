// ===== Types & Enums =====
enum Category {
  Health = "health",
  Productivity = "productivity",
  Learning = "learning",
  Personal = "personal",
}

interface Habit {
  id: string;
  name: string;
  icon?: string;
  category: Category;
  createdAt: string;
  completedDates: string[]; // ISO date strings "YYYY-MM-DD"
}

// ===== Constants =====
const STORAGE_KEY = "habit-tracker-data";

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.Health]: "💪 Health",
  [Category.Productivity]: "⚡ Productivity",
  [Category.Learning]: "📚 Learning",
  [Category.Personal]: "🌟 Personal",
};

// ===== State =====
let habits: Habit[] = [];
let activeFilter: string = "all";

// ===== DOM Elements =====
const habitForm = document.getElementById("habitForm") as HTMLFormElement;
const habitNameInput = document.getElementById("habitName") as HTMLInputElement;
const habitIconInput = document.getElementById("habitIcon") as HTMLInputElement;
const habitCategorySelect = document.getElementById("habitCategory") as HTMLSelectElement;
const habitListEl = document.getElementById("habitList") as HTMLElement;
const emptyStateEl = document.getElementById("emptyState") as HTMLElement;
const dateDisplayEl = document.getElementById("dateDisplay") as HTMLElement;
const progressCircle = document.getElementById("progressCircle") as SVGCircleElement;
const progressText = document.getElementById("progressText") as HTMLElement;
const filterButtons = document.querySelectorAll<HTMLButtonElement>(".filters__btn");

// ===== Helpers =====
function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function calculateStreak(completedDates: string[]): number {
  if (completedDates.length === 0) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = todayKey();
  let streak = 0;
  let checkDate = new Date(today);

  if (sorted[0] !== today) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < sorted.length; i++) {
    const expected = checkDate.toISOString().slice(0, 10);
    if (sorted[i] === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (sorted[i] < expected) {
      break;
    }
  }
  return streak;
}

// ===== LocalStorage =====
function saveHabits(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function loadHabits(): void {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      habits = JSON.parse(raw) as Habit[];
    } catch {
      habits = [];
    }
  }
}

// ===== Rendering =====
function renderDate(): void {
  dateDisplayEl.textContent = formatDate(new Date());
}

function updateProgress(): void {
  const total = habits.length;
  const done = habits.filter((h) => h.completedDates.includes(todayKey())).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const circumference = 163.36;
  const offset = circumference - (pct / 100) * circumference;
  progressCircle.style.strokeDashoffset = String(offset);
  progressText.textContent = `${pct}%`;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function renderHabits(): void {
  const today = todayKey();
  const filtered =
    activeFilter === "all"
      ? habits
      : habits.filter((h) => h.category === activeFilter);

  if (filtered.length === 0) {
    emptyStateEl.style.display = "block";
    habitListEl.querySelectorAll(".habit-card").forEach((el) => el.remove());
    updateProgress();
    return;
  }

  emptyStateEl.style.display = "none";
  const fragment = document.createDocumentFragment();

  filtered.forEach((habit) => {
    const isDone = habit.completedDates.includes(today);
    const streak = calculateStreak(habit.completedDates);
    const card = document.createElement("div");
    card.className = `habit-card${isDone ? " habit-card--done" : ""}`;
    card.dataset.id = habit.id;

    card.innerHTML = `
      <div class="habit-card__check${isDone ? " habit-card__check--done" : ""}" data-action="toggle" data-id="${habit.id}">
        ${isDone ? "✓" : ""}
      </div>
      <div class="habit-card__info">
        <div class="habit-card__name">${habit.icon ? habit.icon + " " : ""}${escapeHtml(habit.name)}</div>
        <div class="habit-card__meta">
          <span class="habit-card__streak">🔥 ${streak} day${streak !== 1 ? "s" : ""}</span>
          <span>Created ${habit.createdAt.slice(0, 10)}</span>
        </div>
      </div>
      <span class="habit-card__category habit-card__category--${habit.category}">${CATEGORY_LABELS[habit.category]}</span>
      <button class="habit-card__delete" data-action="delete" data-id="${habit.id}" title="Delete habit">✕</button>
    `;
    fragment.appendChild(card);
  });

  habitListEl.querySelectorAll(".habit-card").forEach((el) => el.remove());
  habitListEl.appendChild(fragment);
  updateProgress();
}

// ===== Event Handlers =====
habitForm.addEventListener("submit", (e: Event) => {
  e.preventDefault();
  const name = habitNameInput.value.trim();
  if (!name) return;

  const newHabit: Habit = {
    id: generateId(),
    name,
    icon: habitIconInput.value.trim() || undefined,
    category: habitCategorySelect.value as Category,
    createdAt: new Date().toISOString(),
    completedDates: [],
  };

  habits.unshift(newHabit);
  saveHabits();
  renderHabits();
  habitNameInput.value = "";
  habitIconInput.value = "";
  habitNameInput.focus();
});

habitListEl.addEventListener("click", (e: Event) => {
  const target = e.target as HTMLElement;
  const action = target.dataset.action;
  const id = target.dataset.id;
  if (!action || !id) return;

  if (action === "toggle") {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;
    const today = todayKey();
    const idx = habit.completedDates.indexOf(today);
    if (idx === -1) {
      habit.completedDates.push(today);
    } else {
      habit.completedDates.splice(idx, 1);
    }
    saveHabits();
    renderHabits();
  }

  if (action === "delete") {
    habits = habits.filter((h) => h.id !== id);
    saveHabits();
    renderHabits();
  }
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("filters__btn--active"));
    btn.classList.add("filters__btn--active");
    activeFilter = btn.dataset.filter || "all";
    renderHabits();
  });
});

// ===== Init =====
function init(): void {
  renderDate();
  loadHabits();
  renderHabits();
}

init();
