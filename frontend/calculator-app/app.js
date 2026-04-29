// CalcPro — vanilla JS calculator with scientific mode, history & keyboard support
(function () {
  'use strict';

  const STORAGE = { history: 'calcpro.history', mode: 'calcpro.mode', theme: 'calcpro.theme' };
  const exprEl = document.getElementById('expr');
  const resultEl = document.getElementById('result');
  const keypad = document.getElementById('keypad');
  const modeBtn = document.getElementById('mode-toggle');
  const themeBtn = document.getElementById('theme-toggle');
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const clearHistoryBtn = document.getElementById('clear-history');

  let buffer = '';
  let lastResult = '0';
  let history = loadHistory();

  // Theme
  if (localStorage.getItem(STORAGE.theme) === 'dark') document.documentElement.classList.add('dark');
  themeBtn.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem(STORAGE.theme, document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    themeBtn.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
  });
  themeBtn.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';

  // Mode
  setMode(localStorage.getItem(STORAGE.mode) || 'standard');
  modeBtn.addEventListener('click', () => {
    const next = keypad.classList.contains('standard') ? 'scientific' : 'standard';
    setMode(next);
  });

  function setMode(mode) {
    keypad.classList.remove('standard', 'scientific');
    keypad.classList.add(mode);
    modeBtn.textContent = 'الوضع: ' + (mode === 'scientific' ? 'Scientific' : 'Standard');
    modeBtn.setAttribute('aria-pressed', String(mode === 'scientific'));
    localStorage.setItem(STORAGE.mode, mode);
  }

  // Buttons
  keypad.addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;
    if (btn.dataset.num) input(btn.dataset.num);
    else if (btn.dataset.op) input(btn.dataset.op);
    else if (btn.dataset.paren) input(btn.dataset.paren);
    else if (btn.dataset.const) inputConst(btn.dataset.const);
    else if (btn.dataset.fn) inputFn(btn.dataset.fn);
    else if (btn.dataset.action) action(btn.dataset.action);
  });

  clearHistoryBtn.addEventListener('click', () => {
    history = [];
    saveHistory();
    renderHistory();
  });

  // Keyboard
  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if ((k >= '0' && k <= '9') || k === '.') return input(k);
    if (k === '+' || k === '-' || k === '*' || k === '/' || k === '%' || k === '^' || k === '(' || k === ')') return input(k);
    if (k === 'Enter' || k === '=') { e.preventDefault(); return action('equals'); }
    if (k === 'Backspace') return action('back');
    if (k === 'Escape') return action('clear');
  });

  function input(ch) {
    // Avoid multiple operators in a row (replace last)
    if ('+-*/^%'.includes(ch) && /[+\-*/^%]$/.test(buffer)) {
      buffer = buffer.slice(0, -1) + ch;
    } else {
      buffer += ch;
    }
    render();
  }
  function inputConst(name) {
    const v = name === 'pi' ? String(Math.PI) : String(Math.E);
    buffer += v;
    render();
  }
  function inputFn(name) {
    // Apply unary function to current value or wrap
    const map = {
      sin: 'Math.sin(', cos: 'Math.cos(', tan: 'Math.tan(',
      log: 'Math.log10(', ln: 'Math.log(',
      sqrt: 'Math.sqrt(', sq: '__SQ__(',
      fact: '__FACT__(',
    };
    buffer += (map[name] || '') ;
    render();
  }
  function action(name) {
    if (name === 'clear') { buffer = ''; render(); return; }
    if (name === 'back') { buffer = buffer.slice(0, -1); render(); return; }
    if (name === 'sign') {
      const m = buffer.match(/(-?\d*\.?\d+)$/);
      if (m) {
        const n = m[1];
        const replaced = n.startsWith('-') ? n.slice(1) : '-' + n;
        buffer = buffer.slice(0, -n.length) + replaced;
        render();
      }
      return;
    }
    if (name === 'equals') { compute(); return; }
  }

  function render() {
    exprEl.textContent = displayExpr(buffer);
    if (!buffer) resultEl.textContent = lastResult || '0';
  }

  function displayExpr(s) {
    return s
      .replace(/\*/g, '×')
      .replace(/\//g, '÷')
      .replace(/__SQ__\(/g, 'sq(')
      .replace(/__FACT__\(/g, 'fact(')
      .replace(/Math\.sin\(/g, 'sin(')
      .replace(/Math\.cos\(/g, 'cos(')
      .replace(/Math\.tan\(/g, 'tan(')
      .replace(/Math\.log10\(/g, 'log(')
      .replace(/Math\.log\(/g, 'ln(')
      .replace(/Math\.sqrt\(/g, '√(');
  }

  function compute() {
    if (!buffer) return;
    try {
      const expr = sanitize(buffer);
      // Use Function instead of eval
      // eslint-disable-next-line no-new-func
      const fn = new Function('__SQ__', '__FACT__', 'return (' + expr + ');');
      const value = fn((x) => x * x, factorial);
      if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('قيمة غير صالحة');
      const pretty = format(value);
      pushHistory(displayExpr(buffer), pretty);
      lastResult = pretty;
      resultEl.textContent = pretty;
      buffer = pretty.replace(/,/g, '');
      exprEl.textContent = '';
    } catch (err) {
      resultEl.textContent = 'خطأ';
    }
  }

  function sanitize(s) {
    // Allow only safe chars / known tokens
    const allowed = /^[0-9+\-*/().%^\s]|Math\.(sin|cos|tan|log10|log|sqrt)\(|__SQ__\(|__FACT__\(/;
    let cleaned = s.replace(/\^/g, '**').replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    // Basic balance check
    const opens = (cleaned.match(/\(/g) || []).length;
    const closes = (cleaned.match(/\)/g) || []).length;
    if (opens > closes) cleaned += ')'.repeat(opens - closes);
    // Reject anything outside safe charset
    const stripped = cleaned
      .replace(/Math\.(sin|cos|tan|log10|log|sqrt)\(/g, '')
      .replace(/__SQ__\(/g, '')
      .replace(/__FACT__\(/g, '');
    if (!/^[-+*/().%\d\s*]*$/.test(stripped)) throw new Error('صيغة غير صالحة');
    return cleaned;
  }

  function factorial(n) {
    n = Math.trunc(n);
    if (n < 0 || n > 170) throw new Error('out of range');
    let r = 1; for (let i = 2; i <= n; i++) r *= i; return r;
  }

  function format(n) {
    if (Number.isInteger(n)) return n.toLocaleString('en-US');
    return Number(n.toFixed(10)).toString();
  }

  function pushHistory(expr, res) {
    history.unshift({ expr, res, t: Date.now() });
    if (history.length > 50) history.length = 50;
    saveHistory();
    renderHistory();
  }
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(STORAGE.history) || '[]'); }
    catch { return []; }
  }
  function saveHistory() { localStorage.setItem(STORAGE.history, JSON.stringify(history)); }
  function renderHistory() {
    historyList.innerHTML = '';
    if (!history.length) { historyEmpty.style.display = 'block'; return; }
    historyEmpty.style.display = 'none';
    for (const h of history) {
      const li = document.createElement('li');
      li.innerHTML = '<span class="h-expr">' + escapeHtml(h.expr) + ' =</span><span class="h-res">' + escapeHtml(h.res) + '</span>';
      li.addEventListener('click', () => { buffer = h.res.replace(/,/g, ''); render(); });
      historyList.appendChild(li);
    }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  renderHistory();
  render();
})();
