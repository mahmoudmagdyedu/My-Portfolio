/* ──────────────────────────────────────────────
   Local Storage — High Scores
   ────────────────────────────────────────────── */

const STORAGE_KEY = 'quizapp_highscores';
const MAX_SCORES = 10;

function getHighScores(): HighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HighScore[]) : [];
  } catch {
    return [];
  }
}

function saveHighScore(entry: HighScore): void {
  const scores = getHighScores();
  scores.push(entry);
  scores.sort((a, b) => (b.score / b.total) - (a.score / a.total));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores.slice(0, MAX_SCORES)));
}

function clearHighScores(): void {
  localStorage.removeItem(STORAGE_KEY);
}
