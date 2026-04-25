"use strict";
// ─── LinkVault — Bookmark Manager App (TypeScript compiled) ───
var Category;
(function (Category) {
    Category["All"] = "\u0627\u0644\u0643\u0644";
    Category["Work"] = "\u0639\u0645\u0644";
    Category["Learning"] = "\u062A\u0639\u0644\u0645";
    Category["Entertainment"] = "\u062A\u0631\u0641\u064A\u0647";
    Category["Social"] = "\u0625\u062C\u062A\u0645\u0627\u0639\u064A";
    Category["Tools"] = "\u0623\u062F\u0648\u0627\u062A";
    Category["News"] = "\u0623\u062E\u0628\u0627\u0631";
    Category["Other"] = "\u0623\u062E\u0631\u0649";
})(Category || (Category = {}));
class LinkVaultApp {
    constructor() {
        this.bookmarks = [];
        this.activeCategory = Category.All;
        this.searchQuery = '';
        this.editingId = null;
        this.loadFromStorage();
        this.initDOM();
        this.render();
    }
    // ─── Storage ───
    loadFromStorage() {
        try {
            const data = localStorage.getItem('linkvault_bookmarks');
            this.bookmarks = data ? JSON.parse(data) : this.getSampleData();
        }
        catch (_a) {
            this.bookmarks = this.getSampleData();
        }
    }
    saveToStorage() {
        localStorage.setItem('linkvault_bookmarks', JSON.stringify(this.bookmarks));
    }
    getSampleData() {
        return [
            {
                id: this.generateId(), title: 'MDN Web Docs', url: 'https://developer.mozilla.org',
                description: 'مرجع شامل لتقنيات الويب — HTML, CSS, JavaScript',
                category: 'تعلم', tags: ['docs', 'web', 'reference'], favorite: true, createdAt: Date.now()
            },
            {
                id: this.generateId(), title: 'GitHub', url: 'https://github.com',
                description: 'منصة استضافة الأكواد والتعاون البرمجي',
                category: 'أدوات', tags: ['git', 'code', 'collaboration'], favorite: true, createdAt: Date.now() - 86400000
            },
            {
                id: this.generateId(), title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/',
                description: 'الدليل الرسمي لتعلم TypeScript من الصفر',
                category: 'تعلم', tags: ['typescript', 'docs'], favorite: false, createdAt: Date.now() - 172800000
            },
            {
                id: this.generateId(), title: 'Tailwind CSS', url: 'https://tailwindcss.com',
                description: 'إطار CSS للتصميم السريع بأسلوب utility-first',
                category: 'أدوات', tags: ['css', 'framework', 'design'], favorite: false, createdAt: Date.now() - 259200000
            },
            {
                id: this.generateId(), title: 'Hacker News', url: 'https://news.ycombinator.com',
                description: 'أخبار التقنية والبرمجة والشركات الناشئة',
                category: 'أخبار', tags: ['tech', 'news', 'startups'], favorite: false, createdAt: Date.now() - 345600000
            },
            {
                id: this.generateId(), title: 'Stack Overflow', url: 'https://stackoverflow.com',
                description: 'أكبر مجتمع للأسئلة والأجوبة البرمجية',
                category: 'أدوات', tags: ['qa', 'community', 'code'], favorite: true, createdAt: Date.now() - 432000000
            }
        ];
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    // ─── DOM Init ───
    initDOM() {
        // Search
        const searchEl = document.getElementById('searchInput');
        searchEl === null || searchEl === void 0 ? void 0 : searchEl.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim().toLowerCase();
            this.render();
        });
        // Dark mode
        const themeBtn = document.getElementById('themeToggle');
        themeBtn === null || themeBtn === void 0 ? void 0 : themeBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('linkvault_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        });
        if (localStorage.getItem('linkvault_theme') === 'dark')
            document.documentElement.classList.add('dark');
        // Add button
        const addBtn = document.getElementById('addBtn');
        addBtn === null || addBtn === void 0 ? void 0 : addBtn.addEventListener('click', () => this.openModal());
        // Export
        const exportBtn = document.getElementById('exportBtn');
        exportBtn === null || exportBtn === void 0 ? void 0 : exportBtn.addEventListener('click', () => this.exportBookmarks());
        // Import
        const importBtn = document.getElementById('importBtn');
        importBtn === null || importBtn === void 0 ? void 0 : importBtn.addEventListener('click', () => {
            var _a;
            (_a = document.getElementById('importFile')) === null || _a === void 0 ? void 0 : _a.click();
        });
        const importFile = document.getElementById('importFile');
        importFile === null || importFile === void 0 ? void 0 : importFile.addEventListener('change', (e) => this.importBookmarks(e));
        // Modal close
        const overlay = document.getElementById('modalOverlay');
        overlay === null || overlay === void 0 ? void 0 : overlay.addEventListener('click', (e) => {
            if (e.target === overlay)
                this.closeModal();
        });
        const cancelBtn = document.getElementById('modalCancel');
        cancelBtn === null || cancelBtn === void 0 ? void 0 : cancelBtn.addEventListener('click', () => this.closeModal());
        // Modal save
        const form = document.getElementById('bookmarkForm');
        form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveBookmark();
        });
        // Category pills
        this.renderCategoryPills();
    }
    // ─── Categories ───
    renderCategoryPills() {
        const container = document.getElementById('categoryPills');
        if (!container)
            return;
        container.innerHTML = '';
        const categories = Object.values(Category);
        categories.forEach(cat => {
            const pill = document.createElement('button');
            pill.className = `pill ${this.activeCategory === cat ? 'active' : ''}`;
            pill.textContent = cat;
            pill.addEventListener('click', () => {
                this.activeCategory = cat;
                this.renderCategoryPills();
                this.render();
            });
            container.appendChild(pill);
        });
    }
    // ─── Rendering ───
    getFilteredBookmarks() {
        let filtered = [...this.bookmarks];
        // Category filter
        if (this.activeCategory !== Category.All) {
            filtered = filtered.filter(b => b.category === this.activeCategory);
        }
        // Search filter
        if (this.searchQuery) {
            filtered = filtered.filter(b => b.title.toLowerCase().includes(this.searchQuery) ||
                b.url.toLowerCase().includes(this.searchQuery) ||
                b.description.toLowerCase().includes(this.searchQuery) ||
                b.tags.some(t => t.toLowerCase().includes(this.searchQuery)));
        }
        // Sort: favorites first, then newest
        filtered.sort((a, b) => {
            if (a.favorite !== b.favorite)
                return a.favorite ? -1 : 1;
            return b.createdAt - a.createdAt;
        });
        return filtered;
    }
    render() {
        const grid = document.getElementById('bookmarksGrid');
        const empty = document.getElementById('emptyState');
        if (!grid || !empty)
            return;
        const filtered = this.getFilteredBookmarks();
        // Stats
        this.updateStats();
        if (filtered.length === 0) {
            grid.innerHTML = '';
            empty.style.display = 'block';
            return;
        }
        empty.style.display = 'none';
        grid.innerHTML = filtered.map((b, i) => this.renderCard(b, i)).join('');
        // Attach card event listeners
        grid.querySelectorAll('.star-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleFavorite(btn.dataset.id));
        });
        grid.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => this.openModal(btn.dataset.id));
        });
        grid.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteBookmark(btn.dataset.id));
        });
    }
    renderCard(b, index) {
        const domain = this.extractDomain(b.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        const tagsHtml = b.tags.map(t => `<span class="tag">${t}</span>`).join('');
        return `
      <div class="bookmark-card animate-in" style="animation-delay:${index * 0.05}s">
        <button class="star-btn ${b.favorite ? 'active' : ''}" data-id="${b.id}" title="مفضلة">${b.favorite ? '⭐' : '☆'}</button>
        <div style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.5rem">
          <img class="favicon" src="${faviconUrl}" alt="" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><text y=%2224%22 font-size=%2224%22>🔗</text></svg>'" />
          <div style="min-width:0">
            <a class="title" href="${b.url}" target="_blank" rel="noopener noreferrer">${this.escapeHtml(b.title)}</a>
            <div class="url">${domain}</div>
          </div>
        </div>
        ${b.description ? `<p class="desc">${this.escapeHtml(b.description)}</p>` : ''}
        <div class="tags">
          <span class="tag" style="background:#f0fdf4;color:#16a34a">${b.category}</span>
          ${tagsHtml}
        </div>
        <div class="card-actions">
          <button class="btn btn-sm edit-btn" data-id="${b.id}">✏️ تعديل</button>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${b.id}">🗑️ حذف</button>
        </div>
      </div>
    `;
    }
    updateStats() {
        const totalEl = document.getElementById('statTotal');
        const favEl = document.getElementById('statFavorites');
        const catEl = document.getElementById('statCategories');
        if (totalEl)
            totalEl.textContent = String(this.bookmarks.length);
        if (favEl)
            favEl.textContent = String(this.bookmarks.filter(b => b.favorite).length);
        if (catEl) {
            const uniqueCats = new Set(this.bookmarks.map(b => b.category));
            catEl.textContent = String(uniqueCats.size);
        }
    }
    // ─── CRUD ───
    openModal(id) {
        var _a;
        const overlay = document.getElementById('modalOverlay');
        const titleEl = document.getElementById('modalTitle');
        const form = document.getElementById('bookmarkForm');
        if (!overlay || !titleEl || !form)
            return;
        form.reset();
        if (id) {
            const b = this.bookmarks.find(x => x.id === id);
            if (!b)
                return;
            this.editingId = id;
            titleEl.textContent = '✏️ تعديل الرابط';
            document.getElementById('inputTitle').value = b.title;
            document.getElementById('inputUrl').value = b.url;
            document.getElementById('inputDesc').value = b.description;
            document.getElementById('inputCategory').value = b.category;
            document.getElementById('inputTags').value = b.tags.join(', ');
        }
        else {
            this.editingId = null;
            titleEl.textContent = '➕ إضافة رابط جديد';
            // Default URL prefix
            document.getElementById('inputUrl').value = 'https://';
        }
        overlay.classList.add('open');
        (_a = document.getElementById('inputTitle')) === null || _a === void 0 ? void 0 : _a.focus();
    }
    closeModal() {
        var _a;
        (_a = document.getElementById('modalOverlay')) === null || _a === void 0 ? void 0 : _a.classList.remove('open');
        this.editingId = null;
    }
    saveBookmark() {
        const title = document.getElementById('inputTitle').value.trim();
        const url = document.getElementById('inputUrl').value.trim();
        const description = document.getElementById('inputDesc').value.trim();
        const category = document.getElementById('inputCategory').value;
        const tagsStr = document.getElementById('inputTags').value.trim();
        if (!title || !url)
            return;
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [];
        if (this.editingId) {
            const idx = this.bookmarks.findIndex(b => b.id === this.editingId);
            if (idx !== -1) {
                this.bookmarks[idx] = Object.assign(Object.assign({}, this.bookmarks[idx]), { title, url, description, category, tags });
            }
        }
        else {
            this.bookmarks.push({
                id: this.generateId(),
                title, url, description, category, tags,
                favorite: false,
                createdAt: Date.now()
            });
        }
        this.saveToStorage();
        this.closeModal();
        this.render();
    }
    deleteBookmark(id) {
        if (!id)
            return;
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.saveToStorage();
        this.render();
    }
    toggleFavorite(id) {
        if (!id)
            return;
        const b = this.bookmarks.find(x => x.id === id);
        if (b) {
            b.favorite = !b.favorite;
            this.saveToStorage();
            this.render();
        }
    }
    // ─── Import / Export ───
    exportBookmarks() {
        const json = JSON.stringify(this.bookmarks, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `linkvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
    importBookmarks(e) {
        var _a;
        const file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const imported = JSON.parse(reader.result);
                if (Array.isArray(imported)) {
                    this.bookmarks = [...this.bookmarks, ...imported];
                    this.saveToStorage();
                    this.render();
                }
            }
            catch (_a) {
                alert('ملف غير صالح');
            }
        };
        reader.readAsText(file);
    }
    // ─── Helpers ───
    extractDomain(url) {
        try {
            return new URL(url).hostname;
        }
        catch (_a) {
            return url;
        }
    }
    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
// ─── Init ───
document.addEventListener('DOMContentLoaded', () => new LinkVaultApp());
