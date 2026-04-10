/* ──────────────────────────────────────────────
   Types & Interfaces — Quiz App
   ────────────────────────────────────────────── */

interface TriviaCategory {
  id: number;
  name: string;
}

interface TriviaAPIResult {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface Question {
  category: string;
  difficulty: string;
  question: string;
  correctAnswer: string;
  answers: string[];
}

interface QuizConfig {
  category: number;
  difficulty: 'easy' | 'medium' | 'hard';
  amount: number;
}

interface AnswerRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface HighScore {
  score: number;
  total: number;
  category: string;
  difficulty: string;
  date: string;
}

type QuizState = 'setup' | 'loading' | 'playing' | 'results';
