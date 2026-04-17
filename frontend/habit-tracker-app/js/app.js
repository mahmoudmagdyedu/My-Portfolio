// ===== Types & Enums =====
var Category;
(function (Category) {
    Category["Health"] = "health";
    Category["Productivity"] = "productivity";
    Category["Learning"] = "learning";
    Category["Personal"] = "personal";
})(Category || (Category = {}));
// ===== Constants =====
const STORAGE_KEY = "habit-tracker-data";
const CATEGORY_LABELS = {
    health: "💪 Health",
    productivity: "⚡ Productivity",
    learning: "📚 Learning",
    personal: "🌟 Personal",
};
// ===== State =====
let habits = [];
let activeFilter = "all";
// ===== DOM Elements =====
const habitForm = document.getElementById("habitForm");
const habitNameInput = document.getElementById("habitName");
const habitIconInput = document.getElementById("habitIcon");
const habitCategorySelect = document.getElementById("habitCategory");
const habitListEl = document.getElementById("habitList");
const emptyStateEl = document.getElementById("emptyState");
const dateDisplayEl = document.getElementById("dateDisplay");
const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");
const filterButtons = document.querySelectorAll(".filters__btn");
// ===== Helpers =====
function todayKey() {
    return new Date().toISOString().slice(0, 10);
}
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function formatDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}
function calculateStreak(completedDates) {
    if (completedDates.length === 0) return 0;
    const sorted = [...completedDates].sort().reverse();
    const today = todayKey();
    let streak = 0;
    let checkDate = new Date(today);
    // If today isn't done, start checking from yesterday
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
function saveHabits() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
function loadHabits() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            habits = JSON.parse(raw);
        } catch {
            habits = [];
        }
    }
}
// ===== Rendering =====
function renderDate() {
    dateDisplayEl.textContent = formatDate(new Date());
}
function updateProgress() {
    const total = habits.length;
    const done = habits.filter((h) => h.completedDates.includes(todayKey())).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    const circumference = 163.36;
    const offset = circumference - (pct / 100) * circumference;
    progressCircle.style.strokeDashoffset = String(offset);
    progressText.textContent = `${pct}%`;
}
function renderHabits() {
    const today = todayKey();
    const filtered = activeFilter === "all"
        ? habits
        : habits.filter((h) => h.category === activeFilter);
    if (filtered.length === 0) {
        emptyStateEl.style.display = "block";
        // Remove any existing cards
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
    // Clear old cards and append new
    habitListEl.querySelectorAll(".habit-card").forEach((el) => el.remove());
    habitListEl.appendChild(fragment);
    updateProgress();
}
function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}
// ===== Event Handlers =====
habitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = habitNameInput.value.trim();
    if (!name) return;
    const newHabit = {
        id: generateId(),
        name,
        icon: habitIconInput.value.trim() || undefined,
        category: habitCategorySelect.value,
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
habitListEl.addEventListener("click", (e) => {
    const target = e.target;
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
function init() {
    renderDate();
    loadHabits();
    renderHabits();
}
init();
