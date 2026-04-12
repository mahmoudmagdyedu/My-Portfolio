// ============================================
//  📇 ContactHub — Contact Manager App
//  Angular-Inspired SPA Architecture
//  Phase 3: Routing, CRUD, Forms, Services
// ============================================
'use strict';

// ── Contact Model ───────────────────────
class Contact {
  constructor(data) {
    data = data || {};
    this.id = data.id || crypto.randomUUID();
    this.firstName = data.firstName || '';
    this.lastName = data.lastName || '';
    this.email = data.email || '';
    this.phone = data.phone || '';
    this.company = data.company || '';
    this.jobTitle = data.jobTitle || '';
    this.category = data.category || 'personal';
    this.notes = data.notes || '';
    this.isFavorite = data.isFavorite || false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  get fullName() { return this.firstName + ' ' + this.lastName; }
  get initials() { return ((this.firstName[0] || '') + (this.lastName[0] || '')).toUpperCase(); }
}

// ── Contact Service (Singleton) ──────────
const ContactService = {
  STORAGE_KEY: 'contacthub_contacts',
  _listeners: [],

  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) return JSON.parse(data).map(function(d) { return new Contact(d); });
    } catch(e) {}
    const seed = this._getSeedData();
    this._saveAll(seed);
    return seed;
  },

  _saveAll(contacts) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contacts));
    this._listeners.forEach(function(fn) { fn(); });
  },

  getById(id) {
    return this.getAll().find(function(c) { return c.id === id; });
  },

  search(query, category) {
    var results = this.getAll();
    if (category && category !== 'all') {
      results = results.filter(function(c) { return c.category === category; });
    }
    if (query && query.trim()) {
      var q = query.toLowerCase();
      results = results.filter(function(c) {
        return c.firstName.toLowerCase().includes(q) ||
               c.lastName.toLowerCase().includes(q) ||
               c.email.toLowerCase().includes(q) ||
               c.company.toLowerCase().includes(q);
      });
    }
    return results.sort(function(a, b) { return a.firstName.localeCompare(b.firstName); });
  },

  add(data) {
    var contact = new Contact(data);
    var all = this.getAll();
    all.push(contact);
    this._saveAll(all);
    return contact;
  },

  update(id, changes) {
    var all = this.getAll();
    var idx = all.findIndex(function(c) { return c.id === id; });
    if (idx === -1) return null;
    Object.assign(all[idx], changes, { updatedAt: new Date().toISOString() });
    this._saveAll(all);
    return all[idx];
  },

  delete(id) {
    var all = this.getAll();
    var filtered = all.filter(function(c) { return c.id !== id; });
    if (filtered.length === all.length) return false;
    this._saveAll(filtered);
    return true;
  },

  toggleFavorite(id) {
    var c = this.getById(id);
    if (c) this.update(id, { isFavorite: !c.isFavorite });
  },

  get totalCount() { return this.getAll().length; },
  get favoriteCount() { return this.getAll().filter(function(c) { return c.isFavorite; }).length; },

  _getSeedData() {
    return [
      new Contact({ id:'s1', firstName:'Ahmed', lastName:'Hassan', email:'ahmed.hassan@example.com', phone:'+201001234567', company:'TechCorp', jobTitle:'Senior Developer', category:'work', notes:'Met at Angular conference', isFavorite:true }),
      new Contact({ id:'s2', firstName:'Sara', lastName:'Ali', email:'sara.ali@example.com', phone:'+201112345678', company:'DesignHub', jobTitle:'UI/UX Designer', category:'work', notes:'Freelance collaboration' }),
      new Contact({ id:'s3', firstName:'Omar', lastName:'Khaled', email:'omar.k@example.com', phone:'+201223456789', category:'family', notes:'Cousin', isFavorite:true }),
      new Contact({ id:'s4', firstName:'Nour', lastName:'Mohamed', email:'nour.m@example.com', phone:'+201098765432', company:'StartupXYZ', jobTitle:'Product Manager', category:'work' }),
      new Contact({ id:'s5', firstName:'Youssef', lastName:'Ibrahim', email:'youssef.i@example.com', phone:'+201551234567', category:'personal', notes:'University friend' }),
      new Contact({ id:'s6', firstName:'Layla', lastName:'Farid', email:'layla.f@example.com', phone:'+201334567890', company:'MediaCo', jobTitle:'Content Writer', category:'work', notes:'Blog contributor' })
    ];
  }
};

// ── Router (Hash-based) ─────────────────
function Router() {
  this.routes = {};
  var self = this;
  window.addEventListener('hashchange', function() { self.resolve(); });
}
Router.prototype.on = function(pattern, handler) { this.routes[pattern] = handler; return this; };
Router.prototype.navigate = function(hash) { window.location.hash = hash; };
Router.prototype.resolve = function() {
  var hash = window.location.hash.slice(1) || '/contacts';
  if (this.routes[hash]) { this.routes[hash]({}); return; }
  var patterns = Object.keys(this.routes);
  for (var i = 0; i < patterns.length; i++) {
    var pattern = patterns[i];
    var regex = new RegExp('^' + pattern.replace(/:([\w]+)/g, '([^/]+)') + '$');
    var match = hash.match(regex);
    if (match) {
      var paramNames = (pattern.match(/:([\w]+)/g) || []).map(function(p) { return p.slice(1); });
      var params = {};
      paramNames.forEach(function(name, idx) { params[name] = match[idx + 1]; });
      this.routes[pattern](params);
      return;
    }
  }
  this.navigate('/contacts');
};
Router.prototype.start = function() { this.resolve(); };

// ── Form Validator ──────────────────────
function FormValidator(rules) { this.rules = rules; this.errors = {}; }
FormValidator.prototype.validate = function(data) {
  this.errors = {};
  for (var field in this.rules) {
    var value = (data[field] || '').toString();
    var fieldRules = this.rules[field];
    for (var i = 0; i < fieldRules.length; i++) {
      var rule = fieldRules[i];
      if (rule.type === 'required' && !value.trim()) { this.errors[field] = rule.message || 'This field is required'; break; }
      if (rule.type === 'minLength' && value.length < rule.value) { this.errors[field] = rule.message || 'Minimum ' + rule.value + ' characters'; break; }
      if (rule.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { this.errors[field] = rule.message || 'Please enter a valid email'; break; }
      if (rule.type === 'phone' && value && !/^[\+\d\s\-\(\)]{7,20}$/.test(value)) { this.errors[field] = rule.message || 'Please enter a valid phone number'; break; }
    }
  }
  return Object.keys(this.errors).length === 0;
};

// ── Helpers ────────────────────────────
var AVATAR_COLORS = ['bg-sky-500','bg-violet-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-cyan-500','bg-indigo-500','bg-teal-500'];
function getAvatarColor(c) { var h = (c.firstName||'A').charCodeAt(0) + (c.lastName||'B').charCodeAt(0); return AVATAR_COLORS[h % AVATAR_COLORS.length]; }
var CATEGORY_MAP = {
  work:     { bg:'bg-blue-100',   text:'text-blue-700',   label:'Work',     icon:'💼' },
  personal: { bg:'bg-green-100',  text:'text-green-700',  label:'Personal', icon:'👤' },
  family:   { bg:'bg-purple-100', text:'text-purple-700', label:'Family',   icon:'👨\u200d👩\u200d👧' },
  other:    { bg:'bg-slate-100',  text:'text-slate-600',  label:'Other',    icon:'📌' }
};
function getCat(cat) { return CATEGORY_MAP[cat] || CATEGORY_MAP.other; }
function $(sel, ctx) { return (ctx || document).querySelector(sel); }
function $$(sel, ctx) { return (ctx || document).querySelectorAll(sel); }
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ── Navbar Component ───────────────────
function renderNavbar() {
  return '<nav class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">' +
    '<div class="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">' +
    '<a href="#/contacts" class="flex items-center gap-2 hover:opacity-80 transition">' +
    '<span class="text-2xl">📇</span>' +
    '<span class="text-xl font-extrabold text-sky-600">Contact</span><span class="text-xl font-extrabold text-slate-800">Hub</span></a>' +
    '<a href="#/contacts/new" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm active:scale-95">+ New Contact</a>' +
    '</div></nav>';
}

// ── Contact List Component ──────────────
function renderContactList() {
  var searchQuery = '';
  var selectedCategory = 'all';
  var appEl = $('#app');

  function render() {
    var contacts = ContactService.search(searchQuery, selectedCategory);
    var total = ContactService.totalCount;
    var favs = ContactService.favoriteCount;

    var catButtons = ['all','work','personal','family','other'].map(function(cat) {
      var isActive = selectedCategory === cat;
      var label = cat === 'all' ? 'All' : getCat(cat).icon + ' ' + getCat(cat).label;
      return '<button data-cat="' + cat + '" class="cat-btn px-4 py-2.5 rounded-xl text-xs font-semibold border transition-colors whitespace-nowrap ' +
        (isActive ? 'bg-sky-500 text-white border-sky-500' : 'bg-white text-slate-600 border-slate-200 hover:border-sky-300') +
        '">' + label + '</button>';
    }).join('');

    var contactCards = '';
    if (contacts.length === 0) {
      contactCards = '<div class="text-center py-16 bg-white rounded-2xl border border-slate-100 card-shadow">' +
        '<span class="text-5xl block mb-4">📭</span>' +
        '<p class="text-slate-500 text-lg font-medium">No contacts found</p>' +
        '<p class="text-slate-400 text-sm mt-1">Try adjusting your search or add a new contact</p></div>';
    } else {
      contactCards = '<div class="grid gap-3">' + contacts.map(function(c) {
        var cat = getCat(c.category);
        var companyLine = c.company ? '<p class="text-xs text-slate-400 truncate">' + esc(c.company) + (c.jobTitle ? ' \u00b7 ' + esc(c.jobTitle) : '') + '</p>' : '';
        return '<div class="contact-row flex items-center gap-4 bg-white rounded-2xl p-4 card-shadow border border-slate-100 hover:border-sky-200 hover:shadow-md transition-all group cursor-pointer" data-id="' + c.id + '">' +
          '<div class="' + getAvatarColor(c) + ' w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">' + esc(c.initials) + '</div>' +
          '<div class="flex-1 min-w-0">' +
          '<div class="flex items-center gap-2"><h3 class="font-bold text-slate-800 truncate">' + esc(c.fullName) + '</h3>' +
          '<span class="' + cat.bg + ' ' + cat.text + ' text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0">' + cat.label + '</span></div>' +
          '<p class="text-sm text-slate-500 truncate">' + esc(c.email) + '</p>' + companyLine + '</div>' +
          '<div class="flex items-center gap-1 shrink-0">' +
          '<button class="fav-btn p-2 rounded-lg hover:bg-amber-50 transition-colors text-lg" data-id="' + c.id + '">' + (c.isFavorite ? '⭐' : '☆') + '</button>' +
          '<button class="del-btn p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" data-id="' + c.id + '">🗑️</button>' +
          '</div></div>';
      }).join('') + '</div>';
    }

    appEl.innerHTML = renderNavbar() +
      '<main class="max-w-5xl mx-auto px-4 py-8 fade-in">' +
      '<div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">' +
      '<div class="bg-white rounded-2xl p-5 card-shadow border border-slate-100"><p class="text-3xl font-extrabold text-sky-600">' + total + '</p><p class="text-sm text-slate-500 mt-1">Total Contacts</p></div>' +
      '<div class="bg-white rounded-2xl p-5 card-shadow border border-slate-100"><p class="text-3xl font-extrabold text-amber-500">' + favs + '</p><p class="text-sm text-slate-500 mt-1">Favorites</p></div>' +
      '<div class="bg-white rounded-2xl p-5 card-shadow border border-slate-100 hidden sm:block"><p class="text-3xl font-extrabold text-emerald-500">' + contacts.length + '</p><p class="text-sm text-slate-500 mt-1">Showing</p></div></div>' +
      '<div class="flex flex-col sm:flex-row gap-3 mb-6">' +
      '<div class="relative flex-1"><span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">🔍</span>' +
      '<input id="searchInput" type="text" placeholder="Search contacts..." value="' + esc(searchQuery) + '" class="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition" /></div>' +
      '<div class="flex gap-2 flex-wrap">' + catButtons + '</div></div>' +
      contactCards + '</main>';

    // Bind events
    var searchEl = $('#searchInput');
    if (searchEl) {
      searchEl.addEventListener('input', function(e) {
        searchQuery = e.target.value;
        render();
        var inp = $('#searchInput');
        if (inp) { inp.focus(); inp.setSelectionRange(searchQuery.length, searchQuery.length); }
      });
    }
    $$('.cat-btn').forEach(function(btn) {
      btn.addEventListener('click', function() { selectedCategory = btn.dataset.cat; render(); });
    });
    $$('.contact-row').forEach(function(row) {
      row.addEventListener('click', function(e) {
        if (e.target.closest('.fav-btn') || e.target.closest('.del-btn')) return;
        router.navigate('/contacts/' + row.dataset.id);
      });
    });
    $$('.fav-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) { e.stopPropagation(); ContactService.toggleFavorite(btn.dataset.id); render(); });
    });
    $$('.del-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this contact?')) { ContactService.delete(btn.dataset.id); render(); }
      });
    });
  }
  render();
}

// ── Contact Detail Component ─────────────
function renderContactDetail(params) {
  var contact = ContactService.getById(params.id);
  if (!contact) { router.navigate('/contacts'); return; }
  var cat = getCat(contact.category);
  var appEl = $('#app');

  var companyLine = (contact.jobTitle || contact.company) ?
    '<p class="text-sky-100 mt-1">' + esc(contact.jobTitle) + (contact.jobTitle && contact.company ? ' at ' : '') + esc(contact.company) + '</p>' : '';

  var detailCards = '<div class="flex items-center gap-3 bg-slate-50 rounded-xl p-4"><span class="text-xl">✉️</span><div><p class="text-xs text-slate-400">Email</p><p class="font-semibold text-slate-800 text-sm">' + esc(contact.email) + '</p></div></div>' +
    '<div class="flex items-center gap-3 bg-slate-50 rounded-xl p-4"><span class="text-xl">📞</span><div><p class="text-xs text-slate-400">Phone</p><p class="font-semibold text-slate-800 text-sm" dir="ltr">' + esc(contact.phone) + '</p></div></div>';
  if (contact.company) detailCards += '<div class="flex items-center gap-3 bg-slate-50 rounded-xl p-4"><span class="text-xl">🏢</span><div><p class="text-xs text-slate-400">Company</p><p class="font-semibold text-slate-800 text-sm">' + esc(contact.company) + '</p></div></div>';
  if (contact.jobTitle) detailCards += '<div class="flex items-center gap-3 bg-slate-50 rounded-xl p-4"><span class="text-xl">💼</span><div><p class="text-xs text-slate-400">Job Title</p><p class="font-semibold text-slate-800 text-sm">' + esc(contact.jobTitle) + '</p></div></div>';

  var notesBlock = contact.notes ? '<div class="bg-slate-50 rounded-xl p-4"><p class="text-xs text-slate-400 mb-1">📝 Notes</p><p class="text-sm text-slate-700">' + esc(contact.notes) + '</p></div>' : '';
  var dateStr = new Date(contact.createdAt).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' });

  appEl.innerHTML = renderNavbar() +
    '<main class="max-w-2xl mx-auto px-4 py-8 fade-in">' +
    '<div class="flex items-center gap-3 mb-8">' +
    '<a href="#/contacts" class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-xl">←</a>' +
    '<h1 class="text-2xl font-extrabold text-slate-800">Contact Details</h1></div>' +
    '<div class="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">' +
    '<div class="bg-gradient-to-r from-sky-500 to-cyan-500 p-8 text-center text-white">' +
    '<div class="mx-auto w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30 shadow-xl bg-white/20">' + esc(contact.initials) + '</div>' +
    '<h2 class="text-2xl font-extrabold mt-4">' + esc(contact.fullName) + '</h2>' + companyLine +
    '<span class="inline-block mt-3 text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1 rounded-full">' + cat.icon + ' ' + cat.label + '</span></div>' +
    '<div class="p-6 sm:p-8 space-y-5">' +
    '<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">' + detailCards + '</div>' + notesBlock +
    '<div class="text-xs text-slate-400 pt-2 border-t border-slate-100">Added ' + dateStr + '</div></div>' +
    '<div class="flex flex-wrap gap-3 px-6 sm:px-8 pb-6 sm:pb-8">' +
    '<a href="#/contacts/' + contact.id + '/edit" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm text-sm">✏️ Edit</a>' +
    '<button id="favBtn" class="px-5 py-2.5 rounded-xl font-semibold text-sm border transition-colors ' +
      (contact.isFavorite ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300') + '">' +
      (contact.isFavorite ? '⭐ Favorited' : '☆ Favorite') + '</button>' +
    '<button id="delBtn" class="px-5 py-2.5 rounded-xl font-semibold text-sm text-red-500 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 transition-colors">🗑️ Delete</button>' +
    '</div></div></main>';

  $('#favBtn').addEventListener('click', function() {
    ContactService.toggleFavorite(contact.id);
    renderContactDetail(params);
  });
  $('#delBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to delete this contact?')) {
      ContactService.delete(contact.id);
      router.navigate('/contacts');
    }
  });
}

// ── Contact Form Component ───────────────
function renderContactForm(params) {
  var isEdit = !!params.id;
  var existing = isEdit ? ContactService.getById(params.id) : null;
  if (isEdit && !existing) { router.navigate('/contacts'); return; }

  var formData = existing ? Object.assign({}, existing) :
    { firstName:'', lastName:'', email:'', phone:'', company:'', jobTitle:'', category:'personal', notes:'', isFavorite:false };

  var validator = new FormValidator({
    firstName: [{ type:'required', message:'First name is required' }, { type:'minLength', value:2, message:'Minimum 2 characters' }],
    lastName:  [{ type:'required', message:'Last name is required' },  { type:'minLength', value:2, message:'Minimum 2 characters' }],
    email:     [{ type:'required', message:'Email is required' },      { type:'email' }],
    phone:     [{ type:'required', message:'Phone is required' },      { type:'phone' }]
  });

  function render(errors) {
    errors = errors || {};
    var appEl = $('#app');
    var categories = [
      { value:'work', label:'💼 Work' },
      { value:'personal', label:'👤 Personal' },
      { value:'family', label:'👨\u200d👩\u200d👧 Family' },
      { value:'other', label:'📌 Other' }
    ];

    function fieldHTML(name, label, type, placeholder) {
      var err = errors[name];
      return '<div><label class="block text-sm font-semibold text-slate-700 mb-1.5">' + label + ' *</label>' +
        '<input name="' + name + '" type="' + (type||'text') + '" placeholder="' + (placeholder||'') + '" value="' + esc(formData[name]||'') + '" ' +
        'class="field-input w-full px-4 py-3 border ' + (err ? 'border-red-300' : 'border-slate-200') + ' rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition" />' +
        (err ? '<p class="text-red-500 text-xs mt-1">' + esc(err) + '</p>' : '') + '</div>';
    }

    var catRadios = categories.map(function(cat) {
      return '<label class="cursor-pointer"><input type="radio" name="category" value="' + cat.value + '" ' +
        (formData.category === cat.value ? 'checked' : '') + ' class="sr-only peer" />' +
        '<span class="inline-block px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ' +
        'peer-checked:bg-sky-500 peer-checked:text-white peer-checked:border-sky-500 ' +
        'bg-white text-slate-600 border-slate-200 hover:border-sky-300">' + cat.label + '</span></label>';
    }).join('');

    var backLink = isEdit ? '#/contacts/' + params.id : '#/contacts';

    appEl.innerHTML = renderNavbar() +
      '<main class="max-w-2xl mx-auto px-4 py-8 fade-in">' +
      '<div class="flex items-center gap-3 mb-8">' +
      '<a href="' + backLink + '" class="p-2 rounded-lg hover:bg-slate-100 transition-colors text-xl">←</a>' +
      '<h1 class="text-2xl font-extrabold text-slate-800">' + (isEdit ? 'Edit Contact' : 'New Contact') + '</h1></div>' +
      '<form id="contactForm" class="bg-white rounded-2xl p-6 sm:p-8 card-shadow border border-slate-100" novalidate>' +
      '<div class="grid grid-cols-1 sm:grid-cols-2 gap-5">' +
      fieldHTML('firstName','First Name','text','e.g. Ahmed') +
      fieldHTML('lastName','Last Name','text','e.g. Hassan') +
      fieldHTML('email','Email','email','name@example.com') +
      fieldHTML('phone','Phone','tel','+20 100 123 4567') +
      '<div><label class="block text-sm font-semibold text-slate-700 mb-1.5">Company</label>' +
      '<input name="company" type="text" placeholder="e.g. TechCorp" value="' + esc(formData.company||'') + '" class="field-input w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition" /></div>' +
      '<div><label class="block text-sm font-semibold text-slate-700 mb-1.5">Job Title</label>' +
      '<input name="jobTitle" type="text" placeholder="e.g. Senior Developer" value="' + esc(formData.jobTitle||'') + '" class="field-input w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition" /></div>' +
      '<div class="sm:col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>' +
      '<div class="flex flex-wrap gap-3">' + catRadios + '</div></div>' +
      '<div class="sm:col-span-2"><label class="block text-sm font-semibold text-slate-700 mb-1.5">Notes</label>' +
      '<textarea name="notes" rows="3" placeholder="Any additional notes..." class="field-input w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-400 transition resize-none">' + esc(formData.notes||'') + '</textarea></div>' +
      '<div class="sm:col-span-2"><label class="flex items-center gap-2 cursor-pointer">' +
      '<input name="isFavorite" type="checkbox" ' + (formData.isFavorite ? 'checked' : '') + ' class="w-4 h-4 text-sky-500 rounded border-slate-300 focus:ring-sky-300" />' +
      '<span class="text-sm font-medium text-slate-700">⭐ Mark as favorite</span></label></div></div>' +
      '<div class="flex gap-3 mt-8 pt-6 border-t border-slate-100">' +
      '<button type="submit" class="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm active:scale-95">' +
        (isEdit ? 'Save Changes' : 'Create Contact') + '</button>' +
      '<a href="' + backLink + '" class="px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</a></div></form></main>';

    // Track field changes
    $$('.field-input').forEach(function(input) {
      input.addEventListener('input', function() { formData[input.name] = input.value; });
    });
    $$('input[name="category"]').forEach(function(radio) {
      radio.addEventListener('change', function() { formData.category = radio.value; });
    });
    var favBox = $('input[name="isFavorite"]');
    if (favBox) favBox.addEventListener('change', function(e) { formData.isFavorite = e.target.checked; });

    // Submit
    $('#contactForm').addEventListener('submit', function(e) {
      e.preventDefault();
      $$('.field-input').forEach(function(input) { formData[input.name] = input.name === 'notes' ? input.value : input.value; });
      var favEl = $('input[name="isFavorite"]');
      if (favEl) formData.isFavorite = favEl.checked;
      var catEl = $('input[name="category"]:checked');
      if (catEl) formData.category = catEl.value;

      if (!validator.validate(formData)) { render(validator.errors); return; }

      if (isEdit) {
        ContactService.update(params.id, formData);
        router.navigate('/contacts/' + params.id);
      } else {
        var newContact = ContactService.add(formData);
        router.navigate('/contacts/' + newContact.id);
      }
    });
  }
  render();
}

// ── Register Routes & Start ─────────────
var router = new Router();
router
  .on('/contacts', renderContactList)
  .on('/contacts/new', renderContactForm)
  .on('/contacts/:id', renderContactDetail)
  .on('/contacts/:id/edit', renderContactForm)
  .start();
