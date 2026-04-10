/* ──────────────────────────────────────────────
   App — Main UI & Event Handling
   ────────────────────────────────────────────── */

(function () {
  const $ = (sel: string) => document.querySelector(sel) as HTMLElement;
  const $$ = (sel: string) => document.querySelectorAll(sel);

  const setupScreen   = $('#setup-screen');
  const loadingScreen = $('#loading-screen');
  const quizScreen    = $('#quiz-screen');
  const resultsScreen = $('#results-screen');

  const categorySelect  = $('#category-select') as HTMLSelectElement;
  const difficultyBtns  = $$('.difficulty-btn');
  const amountInput     = $('#amount-input') as HTMLInputElement;
  const startBtn        = $('#start-btn');
  const errorMsg        = $('#error-msg');

  const progressText    = $('#progress-text');
  const progressBar     = $('#progress-bar');
  const scoreText       = $('#score-text');
  const timerText       = $('#timer-text');
  const timerCircle     = $('#timer-circle') as unknown as SVGCircleElement;
  const questionText    = $('#question-text');
  const answersGrid     = $('#answers-grid');
  const categoryBadge   = $('#category-badge');
  const difficultyBadge = $('#difficulty-badge');

  const finalScore      = $('#final-score');
  const finalTotal      = $('#final-total');
  const finalPercent    = $('#final-percent');
  const finalGrade      = $('#final-grade');
  const answersReview   = $('#answers-review');
  const highScoresList  = $('#high-scores-list');
  const playAgainBtn    = $('#play-again-btn');
  const clearScoresBtn  = $('#clear-scores-btn');

  const engine = new QuizEngine();
  let timer: CountdownTimer | null = null;
  let selectedDifficulty: 'easy' | 'medium' | 'hard' = 'medium';
  const TIMER_SECONDS = 30;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54;

  function showScreen(name: QuizState): void {
    [setupScreen, loadingScreen, quizScreen, resultsScreen].forEach(s => s.classList.add('hidden'));
    const map: Record<QuizState, HTMLElement> = {
      setup: setupScreen, loading: loadingScreen, playing: quizScreen, results: resultsScreen,
    };
    map[name].classList.remove('hidden');
  }

  async function init(): Promise<void> {
    try {
      const categories = await fetchCategories();
      categorySelect.innerHTML = '<option value="0">🎲 Any Category</option>';
      categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.id.toString();
        opt.textContent = c.name;
        categorySelect.appendChild(opt);
      });
    } catch {
      categorySelect.innerHTML = '<option value="0">🎲 Any Category</option>';
    }

    difficultyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => {
          b.classList.remove('ring-2','ring-offset-2','ring-indigo-500','bg-indigo-600','text-white');
          b.classList.add('bg-white','text-slate-700');
        });
        btn.classList.add('ring-2','ring-offset-2','ring-indigo-500','bg-indigo-600','text-white');
        btn.classList.remove('bg-white','text-slate-700');
        selectedDifficulty = (btn as HTMLElement).dataset.diff as 'easy'|'medium'|'hard';
      });
    });

    const mediumBtn = document.querySelector('.difficulty-btn[data-diff="medium"]');
    if (mediumBtn) {
      mediumBtn.classList.add('ring-2','ring-offset-2','ring-indigo-500','bg-indigo-600','text-white');
      mediumBtn.classList.remove('bg-white','text-slate-700');
    }

    startBtn.addEventListener('click', startQuiz);
    playAgainBtn.addEventListener('click', () => showScreen('setup'));
    clearScoresBtn.addEventListener('click', () => { clearHighScores(); renderHighScores(); });
    showScreen('setup');
  }

  async function startQuiz(): Promise<void> {
    errorMsg.textContent = '';
    const config: QuizConfig = {
      category: parseInt(categorySelect.value),
      difficulty: selectedDifficulty,
      amount: Math.min(Math.max(parseInt(amountInput.value) || 10, 1), 50),
    };
    showScreen('loading');
    try {
      const questions = await fetchQuestions(config);
      engine.load(questions, config);
      showScreen('playing');
      renderQuestion();
    } catch (err: any) {
      errorMsg.textContent = err.message || 'Something went wrong. Please try again.';
      showScreen('setup');
    }
  }

  function renderQuestion(): void {
    const q = engine.getCurrentQuestion();
    if (!q) return;
    const { current, total } = engine.getProgress();
    progressText.textContent = `${current} / ${total}`;
    progressBar.style.width = `${(current / total) * 100}%`;
    scoreText.textContent = `⭐ ${engine.getScore()}`;
    questionText.innerHTML = q.question;
    categoryBadge.textContent = q.category;
    const diffColors: Record<string,string> = { easy:'bg-green-100 text-green-700', medium:'bg-yellow-100 text-yellow-700', hard:'bg-red-100 text-red-700' };
    difficultyBadge.className = `text-xs font-bold px-3 py-1 rounded-full ${diffColors[q.difficulty]||''}`;
    difficultyBadge.textContent = q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1);
    answersGrid.innerHTML = '';
    const letters = ['A','B','C','D'];
    q.answers.forEach((ans, i) => {
      const btn = document.createElement('button');
      btn.className = 'answer-btn group relative flex items-center gap-3 w-full text-left bg-white hover:bg-indigo-50 border-2 border-slate-200 hover:border-indigo-400 rounded-xl px-5 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2';
      btn.innerHTML = `<span class="shrink-0 w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center font-black text-sm text-slate-500 group-hover:text-indigo-600 transition">${letters[i]}</span><span class="text-slate-700 font-medium">${ans}</span>`;
      btn.addEventListener('click', () => handleAnswer(ans));
      answersGrid.appendChild(btn);
    });
    startTimer();
  }

  function startTimer(): void {
    if (timer) timer.stop();
    if (timerCircle) { timerCircle.style.strokeDasharray = `${CIRCLE_CIRCUMFERENCE}`; timerCircle.style.strokeDashoffset = '0'; }
    timer = new CountdownTimer(TIMER_SECONDS, (sec) => {
      timerText.textContent = sec.toString();
      if (timerCircle) { timerCircle.style.strokeDashoffset = (CIRCLE_CIRCUMFERENCE*(1-sec/TIMER_SECONDS)).toString(); }
      timerText.className = sec<=5 ? 'absolute inset-0 flex items-center justify-center text-xl font-black text-red-500 animate-pulse' : 'absolute inset-0 flex items-center justify-center text-xl font-black text-indigo-700';
    }, () => handleAnswer('__TIMEOUT__'));
    timer.start();
  }

  function handleAnswer(answer: string): void {
    if (timer) timer.stop();
    const q = engine.getCurrentQuestion();
    if (!q) return;
    const isTimeout = answer === '__TIMEOUT__';
    const isCorrect = engine.submitAnswer(isTimeout ? '' : answer);
    const buttons = answersGrid.querySelectorAll('.answer-btn');
    buttons.forEach((btn) => {
      const btnEl = btn as HTMLButtonElement; btnEl.disabled = true;
      const text = btnEl.querySelector('span:last-child')?.textContent || '';
      if (text === q.correctAnswer) { btnEl.classList.add('border-green-500','bg-green-50'); btnEl.querySelector('span:first-child')?.classList.add('!bg-green-500','!text-white'); }
      else if (text === answer && !isCorrect) { btnEl.classList.add('border-red-500','bg-red-50'); btnEl.querySelector('span:first-child')?.classList.add('!bg-red-500','!text-white'); }
    });
    setTimeout(() => { if (engine.nextQuestion() && !engine.isFinished()) { renderQuestion(); } else { showResults(); } }, 1200);
  }

  function showResults(): void {
    showScreen('results');
    const score = engine.getScore(); const answers = engine.getAnswers(); const total = answers.length; const percent = Math.round((score/total)*100);
    finalScore.textContent = score.toString(); finalTotal.textContent = total.toString(); finalPercent.textContent = `${percent}%`;
    let grade='🏆 Perfect!',gradeColor='text-yellow-500';
    if(percent<100){grade='🌟 Excellent!';gradeColor='text-indigo-600';}
    if(percent<80){grade='👍 Good Job!';gradeColor='text-green-600';}
    if(percent<60){grade='📚 Keep Going';gradeColor='text-orange-500';}
    if(percent<40){grade='💪 Try Again';gradeColor='text-red-500';}
    finalGrade.textContent=grade; finalGrade.className=`text-2xl font-black ${gradeColor}`;
    const config=engine.getConfig();
    if(config){ saveHighScore({score,total,category:(categorySelect.options[categorySelect.selectedIndex]||{}).textContent||'Any',difficulty:config.difficulty,date:new Date().toLocaleDateString()}); }
    answersReview.innerHTML='';
    answers.forEach((a,i)=>{ const div=document.createElement('div'); div.className=`p-4 rounded-xl border-2 ${a.isCorrect?'border-green-200 bg-green-50':'border-red-200 bg-red-50'}`; div.innerHTML=`<div class="flex items-start gap-3"><span class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${a.isCorrect?'bg-green-500 text-white':'bg-red-500 text-white'}">${i+1}</span><div class="min-w-0"><p class="font-bold text-slate-800 text-sm mb-1">${a.question}</p><p class="text-xs">Your answer: <span class="font-bold ${a.isCorrect?'text-green-700':'text-red-700'}">${a.userAnswer}</span></p>${!a.isCorrect?`<p class="text-xs">Correct: <span class="font-bold text-green-700">${a.correctAnswer}</span></p>`:''}</div></div>`; answersReview.appendChild(div); });
    renderHighScores();
  }

  function renderHighScores(): void {
    const scores=getHighScores();
    if(!scores.length){highScoresList.innerHTML='<p class="text-slate-400 text-sm text-center py-4">No high scores yet.</p>';return;}
    highScoresList.innerHTML=scores.map((s,i)=>`<div class="flex items-center justify-between py-2 ${i>0?'border-t border-slate-100':''}"><div class="flex items-center gap-3"><span class="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-black">${i+1}</span><div><span class="text-sm font-bold text-slate-700">${s.score}/${s.total}</span><span class="text-xs text-slate-400 ml-2">${s.category}</span></div></div><span class="text-xs text-slate-400">${s.date}</span></div>`).join('');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
