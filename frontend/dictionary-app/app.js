/* WordWise — Dictionary App logic */
(function () {
  'use strict';

  const API = 'https://api.dictionaryapi.dev/api/v2/entries/en/';
  const HISTORY_KEY = 'wordwise-history';
  const THEME_KEY = 'wordwise-theme';
  const HISTORY_MAX = 10;

  const $ = (id) => document.getElementById(id);
  const form = $('searchForm');
  const input = $('searchInput');
  const result = $('result');
  const status = $('status');
  const empty = $('emptyState');
  const historySection = $('historySection');
  const historyList = $('historyList');
  const clearHistoryBtn = $('clearHistory');
  const themeBtn = $('themeBtn');

  // Theme toggle
  themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    themeBtn.querySelector('span').textContent = isDark ? 'الوضع الفاتح' : 'الوضع الداكن';
    themeBtn.firstChild.textContent = isDark ? '☀️ ' : '🌙 ';
  });
  if (document.documentElement.classList.contains('dark')) {
    themeBtn.querySelector('span').textContent = 'الوضع الفاتح';
    themeBtn.firstChild.textContent = '☀️ ';
  }

  // History helpers
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_MAX)));
  }
  function addToHistory(word) {
    const w = word.toLowerCase().trim();
    let list = loadHistory().filter((x) => x !== w);
    list.unshift(w);
    saveHistory(list);
    renderHistory();
  }
  function renderHistory() {
    const list = loadHistory();
    if (!list.length) { historySection.classList.add('hidden'); return; }
    historySection.classList.remove('hidden');
    historyList.innerHTML = list.map((w) => `<button class="history-chip" data-word="${escape(w)}">${escape(w)}</button>`).join('');
  }
  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  });

  // Status renderers
  function showStatus(html) {
    status.innerHTML = html;
    status.classList.remove('hidden');
    result.classList.add('hidden');
    empty.classList.add('hidden');
  }
  function hideStatus() { status.classList.add('hidden'); }

  // API call
  async function lookup(word) {
    const w = word.toLowerCase().trim();
    if (!w) return;
    showStatus('<div class="spinner"></div><p class="mt-3 text-slate-500 dark:text-slate-400 font-semibold text-sm">جاري البحث عن "' + escape(w) + '"…</p>');
    try {
      const res = await fetch(API + encodeURIComponent(w));
      if (!res.ok) {
        if (res.status === 404) {
          showStatus('<div class="text-4xl mb-2">😕</div><h3 class="font-black text-lg">لم نعثر على "' + escape(w) + '"</h3><p class="text-slate-500 dark:text-slate-400 text-sm mt-1">تأكد من الإملاء أو جرّب كلمة أخرى.</p>');
          return;
        }
        throw new Error('HTTP ' + res.status);
      }
      const data = await res.json();
      if (!Array.isArray(data) || !data.length) throw new Error('No data');
      hideStatus();
      render(data[0]);
      addToHistory(w);
    } catch (err) {
      showStatus('<div class="text-4xl mb-2">⚠️</div><h3 class="font-black text-lg">حدث خطأ</h3><p class="text-slate-500 dark:text-slate-400 text-sm mt-1">تحقّق من اتصالك وحاول مرة أخرى.</p>');
      console.error(err);
    }
  }

  function render(entry) {
    empty.classList.add('hidden');
    const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find((p) => p.text) || {}).text || '';
    const audioSrc = (entry.phonetics && entry.phonetics.find((p) => p.audio) || {}).audio || '';

    let html = '';
    html += '<header class="flex flex-wrap items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">';
    html += '  <h2 class="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white">' + escape(entry.word) + '</h2>';
    if (phonetic) html += '  <span class="text-indigo-600 dark:text-indigo-300 font-semibold text-lg">' + escape(phonetic) + '</span>';
    if (audioSrc) html += '  <button class="audio-btn" id="playAudio" data-src="' + escape(audioSrc) + '">🔊 Listen</button>';
    html += '</header>';

    if (entry.origin) {
      html += '<p class="text-sm text-slate-500 dark:text-slate-400"><span class="font-bold">Origin:</span> ' + escape(entry.origin) + '</p>';
    }

    (entry.meanings || []).forEach((m) => {
      html += '<section>';
      html += '  <div class="mb-2"><span class="pos-badge">' + escape(m.partOfSpeech) + '</span></div>';
      (m.definitions || []).slice(0, 4).forEach((d, i) => {
        html += '<div class="definition-block">';
        html += '  <p class="text-slate-700 dark:text-slate-200"><span class="font-bold text-indigo-600 dark:text-indigo-400">' + (i + 1) + '.</span> ' + escape(d.definition) + '</p>';
        if (d.example) html += '  <p class="example-text">— "' + escape(d.example) + '"</p>';
        html += '</div>';
      });
      if (m.synonyms && m.synonyms.length) {
        html += '<p class="text-sm mt-2"><span class="font-bold text-green-700 dark:text-green-400">Synonyms:</span> ' +
          m.synonyms.slice(0, 8).map((s) => '<span class="synonym-chip" data-word="' + escape(s) + '">' + escape(s) + '</span>').join('') + '</p>';
      }
      if (m.antonyms && m.antonyms.length) {
        html += '<p class="text-sm mt-1"><span class="font-bold text-red-700 dark:text-red-400">Antonyms:</span> ' +
          m.antonyms.slice(0, 8).map((s) => '<span class="antonym-chip" data-word="' + escape(s) + '">' + escape(s) + '</span>').join('') + '</p>';
      }
      html += '</section>';
    });

    if (entry.sourceUrls && entry.sourceUrls.length) {
      html += '<footer class="pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">Source: ' +
        entry.sourceUrls.map((u) => '<a href="' + escape(u) + '" target="_blank" rel="noopener" class="text-indigo-600 dark:text-indigo-400 hover:underline">' + escape(u) + '</a>').join(', ') + '</footer>';
    }

    result.innerHTML = html;
    result.classList.remove('hidden');

    const audioBtn = $('playAudio');
    if (audioBtn) {
      const audio = new Audio(audioBtn.dataset.src);
      audioBtn.addEventListener('click', () => audio.play().catch(() => {}));
    }
  }

  // Helpers
  function escape(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // Events
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    lookup(input.value);
  });

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-word]');
    if (!t) return;
    const w = t.dataset.word;
    input.value = w;
    lookup(w);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Init
  renderHistory();
})();
