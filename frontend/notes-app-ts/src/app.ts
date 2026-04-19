// Notes App — TypeScript
// Scaffold أساسي مع أنواع واضحة وطبقة تخزين في localStorage.
// سيتم إكمال منطق CRUD بالكامل في الخطوات التالية من الـ Roadmap.

type NoteId = string;

interface Note {
	id: NoteId;
	title: string;
	body: string;
	tags: string[];
	pinned: boolean;
	createdAt: number;
	updatedAt: number;
}

const STORAGE_KEY = "notes-app-ts:v1";
const THEME_KEY = "notes-app-ts:theme";

const storage = {
	load(): Note[] {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw) as unknown;
			return Array.isArray(parsed) ? (parsed as Note[]) : [];
		} catch {
			return [];
		}
	},
	save(notes: Note[]): void {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	},
};

function uid(): NoteId {
	return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function parseTags(input: string): string[] {
	return input
		.split(",")
		.map((t) => t.trim())
		.filter((t) => t.length > 0);
}

interface ValidationResult { ok: boolean; message?: string; }

function validate(title: string, body: string): ValidationResult {
	if (title.trim().length < 2) return { ok: false, message: "العنوان قصير جداً (2 أحرف على الأقل)." };
	if (title.trim().length > 80) return { ok: false, message: "العنوان طويل جداً (80 حرف كحد أقصى)." };
	if (body.trim().length < 1) return { ok: false, message: "لا يمكن حفظ ملاحظة فارغة." };
	return { ok: true };
}

class NotesApp {
	private notes: Note[] = [];
	private search = "";
	private tagFilter = "";

	constructor(private root: Document) {
		this.notes = storage.load();
		this.bindEvents();
		this.applyStoredTheme();
		this.render();
	}

	private bindEvents(): void {
		const form = this.root.getElementById("note-form") as HTMLFormElement;
		form.addEventListener("submit", (e) => {
			e.preventDefault();
			this.handleCreate();
		});

		const searchEl = this.root.getElementById("search") as HTMLInputElement;
		searchEl.addEventListener("input", () => {
			this.search = searchEl.value.trim().toLowerCase();
			this.renderList();
		});

		const tagEl = this.root.getElementById("tag-filter") as HTMLSelectElement;
		tagEl.addEventListener("change", () => {
			this.tagFilter = tagEl.value;
			this.renderList();
		});

		const themeBtn = this.root.getElementById("theme-toggle") as HTMLButtonElement;
		themeBtn.addEventListener("click", () => this.toggleTheme());
	}

	private handleCreate(): void {
		const titleEl = this.root.getElementById("note-title") as HTMLInputElement;
		const bodyEl = this.root.getElementById("note-body") as HTMLTextAreaElement;
		const tagsEl = this.root.getElementById("note-tags") as HTMLInputElement;
		const errEl = this.root.getElementById("form-error") as HTMLParagraphElement;

		const v = validate(titleEl.value, bodyEl.value);
		if (!v.ok) { errEl.textContent = v.message ?? "بيانات غير صالحة."; return; }
		errEl.textContent = "";

		const now = Date.now();
		const note: Note = {
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
		(this.root.getElementById("note-form") as HTMLFormElement).reset();
		this.render();
	}

	private togglePin(id: NoteId): void {
		const n = this.notes.find((x) => x.id === id);
		if (!n) return;
		n.pinned = !n.pinned;
		n.updatedAt = Date.now();
		storage.save(this.notes);
		this.render();
	}

	private remove(id: NoteId): void {
		this.notes = this.notes.filter((n) => n.id !== id);
		storage.save(this.notes);
		this.render();
	}

	private filtered(): Note[] {
		const q = this.search;
		const tag = this.tagFilter;
		return this.notes
			.filter((n) => (tag ? n.tags.includes(tag) : true))
			.filter((n) => (q ? n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q) : true))
			.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt);
	}

	private render(): void {
		this.renderTagFilter();
		this.renderList();
	}

	private renderTagFilter(): void {
		const sel = this.root.getElementById("tag-filter") as HTMLSelectElement;
		const current = sel.value;
		const tags = Array.from(new Set(this.notes.flatMap((n) => n.tags))).sort();
		sel.innerHTML = '<option value="">كل الوسوم</option>' +
			tags.map((t) => `<option value="${escapeHtml(t)}">${escapeHtml(t)}</option>`).join("");
		if (tags.includes(current)) sel.value = current;
	}

	private renderList(): void {
		const list = this.root.getElementById("notes-list") as HTMLElement;
		const items = this.filtered();
		if (items.length === 0) {
			list.innerHTML = '<p class="empty-state">لا توجد ملاحظات مطابقة.</p>';
			return;
		}
		list.innerHTML = items.map((n) => this.cardHtml(n)).join("");
		list.querySelectorAll<HTMLButtonElement>("[data-action]").forEach((btn) => {
			btn.addEventListener("click", () => {
				const id = btn.dataset.id as NoteId;
				const action = btn.dataset.action;
				if (action === "pin") this.togglePin(id);
				else if (action === "delete") this.remove(id);
			});
		});
	}

	private cardHtml(n: Note): string {
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

	private applyStoredTheme(): void {
		const theme = localStorage.getItem(THEME_KEY);
		if (theme === "dark") document.documentElement.setAttribute("data-theme", "dark");
	}

	private toggleTheme(): void {
		const el = document.documentElement;
		const isDark = el.getAttribute("data-theme") === "dark";
		if (isDark) { el.removeAttribute("data-theme"); localStorage.setItem(THEME_KEY, "light"); }
		else { el.setAttribute("data-theme", "dark"); localStorage.setItem(THEME_KEY, "dark"); }
	}
}

function escapeHtml(s: string): string {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

document.addEventListener("DOMContentLoaded", () => { new NotesApp(document); });
