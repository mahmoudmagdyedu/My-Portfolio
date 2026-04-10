/* ──────────────────────────────────────────────
   API — Open Trivia Database
   ────────────────────────────────────────────── */

const API_BASE = 'https://opentdb.com';

async function fetchCategories(): Promise<TriviaCategory[]> {
  const res = await fetch(`${API_BASE}/api_category.php`);
  const data = await res.json();
  return data.trivia_categories as TriviaCategory[];
}

async function fetchQuestions(config: QuizConfig): Promise<Question[]> {
  const params = new URLSearchParams({
    amount: config.amount.toString(),
    type: 'multiple',
    difficulty: config.difficulty,
  });
  if (config.category > 0) params.set('category', config.category.toString());

  const res = await fetch(`${API_BASE}/api.php?${params}`);
  const data = await res.json();

  if (data.response_code !== 0) {
    throw new Error('Could not fetch questions. Try a different category or fewer questions.');
  }

  return (data.results as TriviaAPIResult[]).map(mapQuestion);
}

function mapQuestion(raw: TriviaAPIResult): Question {
  const answers = [...raw.incorrect_answers, raw.correct_answer]
    .map(decodeHTML)
    .sort(() => Math.random() - 0.5);

  return {
    category: decodeHTML(raw.category),
    difficulty: raw.difficulty,
    question: decodeHTML(raw.question),
    correctAnswer: decodeHTML(raw.correct_answer),
    answers,
  };
}

function decodeHTML(html: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}
