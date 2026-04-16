"use strict";
// === Constants ===
var DURATIONS = {
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60
};
var CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 90;
// === DOM Elements ===
var displayEl = document.getElementById('display');
var startPauseBtn = document.getElementById('startPause');
var resetBtn = document.getElementById('reset');
var sessionsEl = document.getElementById('sessions');
var progressCircle = document.querySelector('.timer__circle-progress');
var tabs = document.querySelectorAll('.tab');
// === State ===
var state = {
    mode: 'pomodoro',
    totalSeconds: DURATIONS.pomodoro,
    remainingSeconds: DURATIONS.pomodoro,
    isRunning: false,
    completedPomodoros: 0,
    intervalId: null
};
// === Helpers ===
function formatTime(seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}
function updateDisplay() {
    displayEl.textContent = formatTime(state.remainingSeconds);
    var fraction = 1 - state.remainingSeconds / state.totalSeconds;
    progressCircle.style.strokeDashoffset = String(CIRCLE_CIRCUMFERENCE * (1 - fraction));
}
function playBeep() {
    var ctx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
}
function setMode(mode) {
    stopTimer();
    state.mode = mode;
    state.totalSeconds = DURATIONS[mode];
    state.remainingSeconds = state.totalSeconds;
    tabs.forEach(function (tab) {
        tab.classList.toggle('tab--active', tab.dataset.mode === mode);
    });
    var colours = {
        pomodoro: 'var(--clr-primary)',
        shortBreak: 'var(--clr-short-break)',
        longBreak: 'var(--clr-long-break)'
    };
    progressCircle.style.stroke = colours[mode];
    startPauseBtn.textContent = 'Start';
    updateDisplay();
}
// === Timer Logic ===
function tick() {
    if (state.remainingSeconds <= 0) {
        stopTimer();
        playBeep();
        if (state.mode === 'pomodoro') {
            state.completedPomodoros++;
            sessionsEl.innerHTML = 'Completed: <strong>' + state.completedPomodoros + '</strong> pomodoros';
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
function startTimer() {
    if (state.isRunning) return;
    state.isRunning = true;
    startPauseBtn.textContent = 'Pause';
    state.intervalId = window.setInterval(tick, 1000);
}
function stopTimer() {
    state.isRunning = false;
    startPauseBtn.textContent = 'Start';
    if (state.intervalId !== null) {
        clearInterval(state.intervalId);
        state.intervalId = null;
    }
}
// === Event Listeners ===
startPauseBtn.addEventListener('click', function () {
    state.isRunning ? stopTimer() : startTimer();
});
resetBtn.addEventListener('click', function () {
    setMode(state.mode);
});
tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
        var mode = tab.dataset.mode;
        if (mode) setMode(mode);
    });
});
// === Init ===
updateDisplay();
