import type { Question } from '@/models';

export interface AnswerResult {
  correct: boolean;
  /** Human-readable correct answer, shown when the player was not right. */
  correctAnswer: string;
  /** Extra feedback for the chosen option (scenario questions). */
  extraFeedback?: string;
}

export interface QuestionComponentProps<Q extends Question = Question> {
  question: Q;
  onAnswered: (result: AnswerResult) => void;
  locked: boolean;
}
