// === Types ===
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerConfig {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

interface TimerState {
  mode: TimerMode;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  completedPomodoros: number;
  intervalId: number | null;
}

// === Constants ===
const DURATIONS: TimerConfig = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 90; // r = 90

// === DOM Elements ===
const displayEl = document.getElementById('display') as HTMLSpanElement;
const startPauseBtn = document.getElementById('startPause') as HTMLButtonElement;
const resetBtn = document.getElementById('reset') as HTMLButtonElement;
const sessionsEl = document.getElementById('sessions') as HTMLParagraphElement;
const progressCircle = document.querySelector('.timer__circle-progress') as SVGCircleElement;
const tabs = document.querySelectorAll<HTMLButtonElement>('.tab');

// === State ===
const state: TimerState = {
  mode: 'pomodoro',
  totalSeconds: DURATIONS.pomodoro,
  remainingSeconds: DURATIONS.pomodoro,
  isRunning: false,
  completedPomodoros: 0,
  intervalId: null,
};

// === Helpers ===
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updateDisplay(): void {
  displayEl.textContent = formatTime(state.remainingSeconds);

  const fraction = 1 - state.remainingSeconds / state.totalSeconds;
  progressCircle.style.strokeDashoffset = String(
    CIRCLE_CIRCUMFERENCE * (1 - fraction)
  );
}

function playBeep(): void {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.value = 0.3;
  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

function setMode(mode: TimerMode): void {
  stopTimer();
  state.mode = mode;
  state.totalSeconds = DURATIONS[mode];
  state.remainingSeconds = state.totalSeconds;

  // Update active tab
  tabs.forEach((tab) => {
    tab.classList.toggle('tab--active', tab.dataset.mode === mode);
  });

  // Update progress circle colour
  const colours: Record<TimerMode, string> = {
    pomodoro: 'var(--clr-primary)',
    shortBreak: 'var(--clr-short-break)',
    longBreak: 'var(--clr-long-break)',
  };
  progressCircle.style.stroke = colours[mode];

  startPauseBtn.textContent = 'Start';
  updateDisplay();
}

// === Timer Logic ===
function tick(): void {
  if (state.remainingSeconds <= 0) {
    stopTimer();
    playBeep();

    if (state.mode === 'pomodoro') {
      state.completedPomodoros++;
      sessionsEl.innerHTML = `Completed: <strong>${state.completedPomodoros}</strong> pomodoros`;

      // Auto-switch: every 4 pomodoros → long break, else short break
      if (state.completedPomodoros % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('pomodoro');
    }
    return;
  }

  state.remainingSeconds--;
  updateDisplay();
}

function startTimer(): void {
  if (state.isRunning) return;
  state.isRunning = true;
  startPauseBtn.textContent = 'Pause';
  state.intervalId = window.setInterval(tick, 1000);
}

function stopTimer(): void {
  state.isRunning = false;
  startPauseBtn.textContent = 'Start';
  if (state.intervalId !== null) {
    clearInterval(state.intervalId);
    state.intervalId = null;
  }
}

// === Event Listeners ===
startPauseBtn.addEventListener('click', () => {
  state.isRunning ? stopTimer() : startTimer();
});

resetBtn.addEventListener('click', () => {
  setMode(state.mode);
});

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const mode = tab.dataset.mode as TimerMode;
    if (mode) setMode(mode);
  });
});

// === Init ===
updateDisplay();
