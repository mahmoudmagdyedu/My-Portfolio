"use strict";
// Compiled from src/app.ts (types stripped). Keep in sync when editing TS.

const STORAGE_KEY = "notes-app-ts:v1";
const THEME_KEY = "notes-app-ts:theme";

const storage = {
	load() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	},
	save(notes) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	},
};

function uid() {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseTags(input) {
	return input
		.split(",")
		.map((t) => t.trim())
		.filter((t) => t.length > 0);
}

function validate(title, body) {
	if (title.trim().length < 2) return { ok: false, message: "العنوان قصير جداً (2 أحرف على الأقل)." };
	if (title.trim().length > 80) return { ok: false, message: "العنوان طويل جداً (80 حرف كحد أقصى)." };
	if (body.trim().length < 1) return { ok: false, message: "لا يمكن حفظ ملاحظة فارغة." };
	return { ok: true };
}

function escapeHtml(s) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

class NotesApp {
	constructor(root) {
		this.root = root;
		this.notes = storage.load();
		this.search = "";
		this.tagFilter = "";
		this.bindEvents();
		this.applyStoredTheme();
		this.render();
	}

	bindEvents() {
		const form = this.root.getElementById("note-form");
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			this.handleCreate();
		});

		const searchEl = this.root.getElementById("search");
		searchEl.addEventListener("input", () => {
			this.search = searchEl.value.trim().toLowerCase();
			this.renderList();
		});

		const tagEl = this.root.getElementById("tag-filter");
		tagEl.addEventListener("change", () => {
			this.tagFilter = tagEl.value;
			this.renderList();
		});

		const themeBtn = this.root.getElementById("theme-toggle");
		themeBtn.addEventListener("click", () => this.toggleTheme());
	}

	handleCreate() {
		const titleEl = this.root.getElementById("note-title");
		const bodyEl = this.root.getElementById("note-body");
		const tagsEl = this.root.getElementById("note-tags");
		const errEl = this.root.getElementById("form-error");

		const v = validate(titleEl.value, bodyEl.value);
		if (!v.ok) { errEl.textContent = v.message || "بيانات غير صالحة."; return; }
		errEl.textContent = "";

		const now = Date.now();
		const note = {
			id: uid(),
			title: titleEl.value.trim(),
			body: bodyEl.value.trim(),
			tags: parseTags(tagsEl.value),
			pinned: false,
			createdAt: now,
			updatedAt: now,
		};
		this.notes.unshift(note);
		storage.save(this.notes);
		this.root.getElementById("note-form").reset();
		this.render();
	}

	togglePin(id) {
		const n = this.notes.find((x) => x.id === id);
		if (!n) return;
		n.pinned = !n.pinned;
		n.updatedAt = Date.now();
		storage.save(this.notes);
		this.render();
	}

	remove(id) {
		this.notes = this.notes.filter((n) => n.id !== id);
		storage.save(this.notes);
		this.render();
	}

	filtered() {
		const q = this.search;
		const tag = this.tagFilter;
		return this.notes
			.filter((n) => (tag ? n.tags.includes(tag) : true))
			.filter((n) => (q ? n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) : true))
			.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
	}

	render() {
		this.renderTagFilter();
		this.renderList();
	}

	renderTagFilter() {
		const sel = this.root.getElementById("tag-filter");
		const current = sel.value;
		const tags = Array.from(new Set(this.notes.flatMap((n) => n.tags))).sort();
		sel.innerHTML = '<option value="">كل الوسوم</option>' +
			tags.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
		if (tags.includes(current)) sel.value = current;
	}

	renderList() {
		const list = this.root.getElementById("notes-list");
		const items = this.filtered();
		if (items.length === 0) {
			list.innerHTML = '<p class="empty-state">لا توجد ملاحظات مطابقة.</p>';
			return;
		}
		list.innerHTML = items.map((n) => this.cardHtml(n)).join("");
		list.querySelectorAll("[data-action]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = btn.dataset.id;
				const action = btn.dataset.action;
				if (action === "pin") this.togglePin(id);
				else if (action === "delete") this.remove(id);
			});
		});
	}

	cardHtml(n) {
		return `
			<article class="note-card ${n.pinned ? "pinned" : ""}">
				<h3>${escapeHtml(n.title)}</h3>
				<p>${escapeHtml(n.body)}</p>
				<div class="tags">${n.tags.map((t) => `<span class="tag">#${escapeHtml(t)}</span>`).join("")}</div>
				<div class="actions">
					<button class="btn btn-ghost" data-action="pin" data-id="${n.id}">${n.pinned ? "إلغاء التثبيت" : "تثبيت"}</button>
					<button class="btn btn-ghost" data-action="delete" data-id="${n.id}">حذف</button>
				</div>
			</article>`;
	}

	applyStoredTheme() {
		const theme = localStorage.getItem(THEME_KEY);
		if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
	}

	toggleTheme() {
		const el = document.documentElement;
		const isDark = el.getAttribute("data-theme") === "dark";
		if (isDark) { el.removeAttribute("data-theme"); localStorage.setItem(THEME_KEY, "light"); }
		else { el.setAttribute("data-theme", "dark"); localStorage.setItem(THEME_KEY, "dark"); }
	}
}

document.addEventListener("DOMContentLoaded", () => { new NotesApp(document); });
