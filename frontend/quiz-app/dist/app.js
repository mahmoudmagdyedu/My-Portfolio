/* ── Quiz App — Compiled JavaScript Bundle ── */

/* ── API — Open Trivia Database ── */
var API_BASE = 'https://opentdb.com';

async function fetchCategories() {
  var res = await fetch(API_BASE + '/api_category.php');
  var data = await res.json();
  return data.trivia_categories;
}

async function fetchQuestions(config) {
  var params = new URLSearchParams({
    amount: config.amount.toString(),
    type: 'multiple',
    difficulty: config.difficulty
  });
  if (config.category > 0) params.set('category', config.category.toString());
  var res = await fetch(API_BASE + '/api.php?' + params);
  var data = await res.json();
  if (data.response_code !== 0) {
    throw new Error('Could not fetch questions. Try a different category or fewer questions.');
  }
  return data.results.map(mapQuestion);
}

function mapQuestion(raw) {
  var answers = raw.incorrect_answers.concat([raw.correct_answer])
    .map(decodeHTML)
    .sort(function () { return Math.random() - 0.5; });
  return {
    category: decodeHTML(raw.category),
    difficulty: raw.difficulty,
    question: decodeHTML(raw.question),
    correctAnswer: decodeHTML(raw.correct_answer),
    answers: answers
  };
}

function decodeHTML(html) {
  var txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

/* ── Local Storage — High Scores ── */
var STORAGE_KEY = 'quizapp_highscores';
var MAX_SCORES = 10;

function getHighScores() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveHighScore(entry) {
  var scores = getHighScores();
  scores.push(entry);
  scores.sort(function (a, b) { return (b.score / b.total) - (a.score / a.total); });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_SCORES)));
}

function clearHighScores() {
  localStorage.removeItem(STORAGE_KEY);
}

/* ── Countdown Timer ── */
var CountdownTimer = (function () {
  function CountdownTimer(seconds, onTick, onExpire) {
    this.intervalId = null;
    this.remaining = seconds;
    this.onTick = onTick;
    this.onExpire = onExpire;
  }
  CountdownTimer.prototype.start = function () {
    var _this = this;
    this.onTick(this.remaining);
    this.intervalId = window.setInterval(function () {
      _this.remaining--;
      _this.onTick(_this.remaining);
      if (_this.remaining <= 0) { _this.stop(); _this.onExpire(); }
    }, 1000);
  };
  CountdownTimer.prototype.stop = function () {
    if (this.intervalId !== null) { clearInterval(this.intervalId); this.intervalId = null; }
  };
  CountdownTimer.prototype.getRemaining = function () { return this.remaining; };
  return CountdownTimer;
}());

/* ── Quiz State Machine ── */
var QuizEngine = (function () {
  function QuizEngine() {
    this.questions = []; this.currentIndex = 0; this.score = 0; this.answers = []; this.config = null;
  }
  QuizEngine.prototype.load = function (questions, config) {
    this.questions = questions; this.config = config; this.currentIndex = 0; this.score = 0; this.answers = [];
  };
  QuizEngine.prototype.getCurrentQuestion = function () {
    var q = this.questions[this.currentIndex]; return q !== undefined ? q : null;
  };
  QuizEngine.prototype.getProgress = function () { return { current: this.currentIndex + 1, total: this.questions.length }; };
  QuizEngine.prototype.getScore = function () { return this.score; };
  QuizEngine.prototype.getAnswers = function () { return this.answers.slice(); };
  QuizEngine.prototype.getConfig = function () { return this.config; };
  QuizEngine.prototype.submitAnswer = function (answer) {
    var q = this.getCurrentQuestion(); if (!q) return false;
    var isCorrect = answer === q.correctAnswer; if (isCorrect) this.score++;
    this.answers.push({ question: q.question, userAnswer: answer, correctAnswer: q.correctAnswer, isCorrect: isCorrect });
    return isCorrect;
  };
  QuizEngine.prototype.nextQuestion = function () {
    if (this.currentIndex < this.questions.length - 1) { this.currentIndex++; return true; } return false;
  };
  QuizEngine.prototype.isFinished = function () { return this.answers.length >= this.questions.length; };
  return QuizEngine;
}());

/* ── App — Main UI & Event Handling ── */
;(function () {
  var $ = function (sel) { return document.querySelector(sel); };
  var $$ = function (sel) { return document.querySelectorAll(sel); };

  var setupScreen = $('#setup-screen'), loadingScreen = $('#loading-screen'), quizScreen = $('#quiz-screen'), resultsScreen = $('#results-screen');
  var categorySelect = $('#category-select'), difficultyBtns = $$('.difficulty-btn'), amountInput = $('#amount-input'), startBtn = $('#start-btn'), errorMsg = $('#error-msg');
  var progressText = $('#progress-text'), progressBar = $('#progress-bar'), scoreText = $('#score-text'), timerText = $('#timer-text'), timerCircle = $('#timer-circle'), questionText = $('#question-text'), answersGrid = $('#answers-grid'), categoryBadge = $('#category-badge'), difficultyBadge = $('#difficulty-badge');
  var finalScore = $('#final-score'), finalTotal = $('#final-total'), finalPercent = $('#final-percent'), finalGrade = $('#final-grade'), answersReview = $('#answers-review'), highScoresList = $('#high-scores-list'), playAgainBtn = $('#play-again-btn'), clearScoresBtn = $('#clear-scores-btn');

  var engine = new QuizEngine(), timer = null, selectedDifficulty = 'medium', TIMER_SECONDS = 30, CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54;

  function showScreen(name) {
    [setupScreen, loadingScreen, quizScreen, resultsScreen].forEach(function (s) { s.classList.add('hidden'); });
    var map = { setup: setupScreen, loading: loadingScreen, playing: quizScreen, results: resultsScreen };
    map[name].classList.remove('hidden');
  }

  async function init() {
    try {
      var categories = await fetchCategories();
      categorySelect.innerHTML = '<option value="0">\uD83C\uDFB2 Any Category</option>';
      categories.forEach(function (c) {
        var opt = document.createElement('option'); opt.value = c.id.toString(); opt.textContent = c.name; categorySelect.appendChild(opt);
      });
    } catch (e) {
      categorySelect.innerHTML = '<option value="0">\uD83C\uDFB2 Any Category</option>';
    }

    difficultyBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        difficultyBtns.forEach(function (b) { b.classList.remove('ring-2', 'ring-offset-2', 'ring-indigo-500', 'bg-indigo-600', 'text-white'); b.classList.add('bg-white', 'text-slate-700'); });
        btn.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500', 'bg-indigo-600', 'text-white'); btn.classList.remove('bg-white', 'text-slate-700');
        selectedDifficulty = btn.dataset.diff;
      });
    });
    var mediumBtn = document.querySelector('.difficulty-btn[data-diff="medium"]');
    if (mediumBtn) { mediumBtn.classList.add('ring-2', 'ring-offset-2', 'ring-indigo-500', 'bg-indigo-600', 'text-white'); mediumBtn.classList.remove('bg-white', 'text-slate-700'); }

    startBtn.addEventListener('click', startQuiz);
    playAgainBtn.addEventListener('click', function () { showScreen('setup'); });
    clearScoresBtn.addEventListener('click', function () { clearHighScores(); renderHighScores(); });
    showScreen('setup');
  }

  async function startQuiz() {
    errorMsg.textContent = '';
    var config = { category: parseInt(categorySelect.value), difficulty: selectedDifficulty, amount: Math.min(Math.max(parseInt(amountInput.value) || 10, 1), 50) };
    showScreen('loading');
    try {
      var questions = await fetchQuestions(config);
      engine.load(questions, config); showScreen('playing'); renderQuestion();
    } catch (err) {
      errorMsg.textContent = err.message || 'Something went wrong. Please try again.'; showScreen('setup');
    }
  }

  function renderQuestion() {
    var q = engine.getCurrentQuestion(); if (!q) return;
    var prog = engine.getProgress();
    progressText.textContent = prog.current + ' / ' + prog.total;
    progressBar.style.width = ((prog.current / prog.total) * 100) + '%';
    scoreText.textContent = '\u2B50 ' + engine.getScore();
    questionText.innerHTML = q.question;
    categoryBadge.textContent = q.category;
    var diffColors = { easy: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700', hard: 'bg-red-100 text-red-700' };
    difficultyBadge.className = 'text-xs font-bold px-3 py-1 rounded-full ' + (diffColors[q.difficulty] || '');
    difficultyBadge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
    answersGrid.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];
    q.answers.forEach(function (ans, i) {
      var btn = document.createElement('button');
      btn.className = 'answer-btn group relative flex items-center gap-3 w-full text-left bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 rounded-xl px-5 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
      btn.innerHTML = '<span class="shrink-0 w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center font-black text-sm text-slate-500 group-hover:text-indigo-600 transition">' + letters[i] + '</span><span class="text-slate-700 font-medium">' + ans + '</span>';
      btn.addEventListener('click', function () { handleAnswer(ans); });
      answersGrid.appendChild(btn);
    });
    startTimer();
  }

  function startTimer() {
    if (timer) timer.stop();
    if (timerCircle) { timerCircle.style.strokeDasharray = '' + CIRCLE_CIRCUMFERENCE; timerCircle.style.strokeDashoffset = '0'; }
    timer = new CountdownTimer(TIMER_SECONDS, function (sec) {
      timerText.textContent = sec.toString();
      if (timerCircle) { timerCircle.style.strokeDashoffset = (CIRCLE_CIRCUMFERENCE * (1 - sec / TIMER_SECONDS)).toString(); }
      timerText.className = sec <= 5 ? 'absolute inset-0 flex items-center justify-center text-xl font-black text-red-500 animate-pulse' : 'absolute inset-0 flex items-center justify-center text-xl font-black text-indigo-700';
    }, function () { handleAnswer('__TIMEOUT__'); });
    timer.start();
  }

  function handleAnswer(answer) {
    if (timer) timer.stop();
    var q = engine.getCurrentQuestion(); if (!q) return;
    var isTimeout = answer === '__TIMEOUT__';
    var isCorrect = engine.submitAnswer(isTimeout ? '' : answer);
    var buttons = answersGrid.querySelectorAll('.answer-btn');
    buttons.forEach(function (btn) {
      btn.disabled = true;
      var text = (btn.querySelector('span:last-child') || {}).textContent || '';
      if (text === q.correctAnswer) { btn.classList.add('border-green-500', 'bg-green-50'); var sp = btn.querySelector('span:first-child'); if (sp) sp.classList.add('!bg-green-500', '!text-white'); }
      else if (text === answer && !isCorrect) { btn.classList.add('border-red-500', 'bg-red-50'); var sp = btn.querySelector('span:first-child'); if (sp) sp.classList.add('!bg-red-500', '!text-white'); }
    });
    setTimeout(function () { if (engine.nextQuestion() && !engine.isFinished()) { renderQuestion(); } else { showResults(); } }, 1200);
  }

  function showResults() {
    showScreen('results');
    var score = engine.getScore(), answers = engine.getAnswers(), total = answers.length, percent = Math.round((score / total) * 100);
    finalScore.textContent = score.toString(); finalTotal.textContent = total.toString(); finalPercent.textContent = percent + '%';
    var grade = '\uD83C\uDFC6 Perfect!', gradeColor = 'text-yellow-500';
    if (percent < 100) { grade = '\uD83C\uDF1F Excellent!'; gradeColor = 'text-indigo-600'; }
    if (percent < 80)  { grade = '\uD83D\uDC4D Good Job!';  gradeColor = 'text-green-600'; }
    if (percent < 60)  { grade = '\uD83D\uDCDA Keep Going'; gradeColor = 'text-orange-500'; }
    if (percent < 40)  { grade = '\uD83D\uDCAA Try Again';  gradeColor = 'text-red-500'; }
    finalGrade.textContent = grade; finalGrade.className = 'text-2xl font-black ' + gradeColor;
    var config = engine.getConfig();
    if (config) { saveHighScore({ score: score, total: total, category: (categorySelect.options[categorySelect.selectedIndex] || {}).textContent || 'Any', difficulty: config.difficulty, date: new Date().toLocaleDateString() }); }
    answersReview.innerHTML = '';
    answers.forEach(function (a, i) {
      var div = document.createElement('div');
      div.className = 'p-4 rounded-xl border-2 ' + (a.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50');
      div.innerHTML = '<div class="flex items-start gap-3"><span class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ' + (a.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white') + '">' + (i + 1) + '</span><div class="min-w-0"><p class="font-bold text-slate-800 text-sm mb-1">' + a.question + '</p><p class="text-xs">Your answer: <span class="font-bold ' + (a.isCorrect ? 'text-green-700' : 'text-red-700') + '">' + a.userAnswer + '</span></p>' + (!a.isCorrect ? '<p class="text-xs">Correct: <span class="font-bold text-green-700">' + a.correctAnswer + '</span></p>' : '') + '</div></div>';
      answersReview.appendChild(div);
    });
    renderHighScores();
  }

  function renderHighScores() {
    var scores = getHighScores();
    if (!scores.length) { highScoresList.innerHTML = '<p class="text-slate-400 text-sm text-center py-4">No high scores yet.</p>'; return; }
    highScoresList.innerHTML = scores.map(function (s, i) {
      return '<div class="flex items-center justify-between py-2 ' + (i > 0 ? 'border-t border-slate-100' : '') + '"><div class="flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">' + (i + 1) + '</span><div><span class="text-sm font-bold text-slate-700">' + s.score + '/' + s.total + '</span><span class="text-xs text-slate-400 ml-2">' + s.category + '</span></div></div><span class="text-xs text-slate-400">' + s.date + '</span></div>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
