/* ──────────────────────────────────────────────
   Quiz State Machine
   ────────────────────────────────────────────── */

class QuizEngine {
  private questions: Question[] = [];
  private currentIndex: number = 0;
  private score: number = 0;
  private answers: AnswerRecord[] = [];
  private config: QuizConfig | null = null;

  load(questions: Question[], config: QuizConfig): void {
    this.questions = questions;
    this.config = config;
    this.currentIndex = 0;
    this.score = 0;
    this.answers = [];
  }

  getCurrentQuestion(): Question | null {
    return this.questions[this.currentIndex] ?? null;
  }

  getProgress(): { current: number; total: number } {
    return { current: this.currentIndex + 1, total: this.questions.length };
  }

  getScore(): number {
    return this.score;
  }

  getAnswers(): AnswerRecord[] {
    return [...this.answers];
  }

  getConfig(): QuizConfig | null {
    return this.config;
  }

  submitAnswer(answer: string): boolean {
    const q = this.getCurrentQuestion();
    if (!q) return false;

    const isCorrect = answer === q.correctAnswer;
    if (isCorrect) this.score++;

    this.answers.push({
      question: q.question,
      userAnswer: answer,
      correctAnswer: q.correctAnswer,
      isCorrect,
    });

    return isCorrect;
  }

  nextQuestion(): boolean {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
      return true;
    }
    return false;
  }

  isFinished(): boolean {
    return this.answers.length >= this.questions.length;
  }
}
