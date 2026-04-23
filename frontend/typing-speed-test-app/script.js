const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog near the riverbank every single morning.",
  "Programming is the art of telling another human being what one wants the computer to do.",
  "Clean code always looks like it was written by someone who cares deeply about the craft.",
  "Typing fast is useful but typing accurately is far more valuable in real engineering work.",
  "Practice consistently and your fingers will learn the keyboard like a musician learns a piano."
];

const $ = (id) => document.getElementById(id);
const textDisplay = $("text-display");
const input = $("input");
const timeEl = $("time");
const wpmEl = $("wpm");
const accuracyEl = $("accuracy");
const errorsEl = $("errors");
const durationEl = $("duration");
const restartBtn = $("restart");

let currentText = "";
let timer = null;
let timeLeft = 30;
let started = false;
let errors = 0;
let totalTyped = 0;

function pickText() {
  return SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
}

function renderText(typed = "") {
  let html = "";
  for (let i = 0; i < currentText.length; i++) {
    const ch = currentText[i];
    if (i < typed.length) {
      const cls = typed[i] === ch ? "correct" : "wrong";
      html += `<span class="${cls}">${ch}</span>`;
    } else if (i === typed.length) {
      html += `<span class="current">${ch}</span>`;
    } else {
      html += `<span>${ch}</span>`;
    }
  }
  textDisplay.innerHTML = html;
}

function reset() {
  clearInterval(timer);
  timer = null;
  started = false;
  errors = 0;
  totalTyped = 0;
  timeLeft = parseInt(durationEl.value, 10);
  timeEl.textContent = String(timeLeft);
  wpmEl.textContent = "0";
  accuracyEl.textContent = "100%";
  errorsEl.textContent = "0";
  currentText = pickText();
  input.value = "";
  input.disabled = false;
  renderText();
  input.focus();
}

function startTimer() {
  started = true;
  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = String(timeLeft);
    if (timeLeft <= 0) finish();
  }, 1000);
}

function updateStats(typed) {
  let correct = 0;
  for (let i = 0; i < typed.length; i++) {
    if (typed[i] === currentText[i]) correct++;
  }
  errors = typed.length - correct;
  totalTyped = typed.length;
  const duration = parseInt(durationEl.value, 10);
  const elapsedMin = (duration - timeLeft) / 60 || 1 / 60;
  const wpm = Math.max(0, Math.round((correct / 5) / elapsedMin));
  const acc = totalTyped === 0 ? 100 : Math.round((correct / totalTyped) * 100);
  wpmEl.textContent = String(wpm);
  accuracyEl.textContent = acc + "%";
  errorsEl.textContent = String(errors);
}

function finish() {
  clearInterval(timer);
  input.disabled = true;
}

input.addEventListener("input", () => {
  const typed = input.value;
  if (!started && typed.length > 0) startTimer();
  renderText(typed);
  updateStats(typed);
  if (typed.length >= currentText.length) finish();
});

durationEl.addEventListener("change", reset);
restartBtn.addEventListener("click", reset);

reset();
