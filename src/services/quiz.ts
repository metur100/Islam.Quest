import type { AnswerInput, Question } from '@/models';

/** Matching: up to one wrong attempt still counts as understood. */
export const MATCHING_MISTAKE_ALLOWANCE = 1;

/** Returns true when the submitted answer is correct for the question. */
export function evaluateAnswer(
  question: Question,
  input: AnswerInput,
  context: { missingWord?: string } = {},
): boolean {
  switch (question.type) {
    case 'multipleChoice':
    case 'scenario':
      return input.type === 'option' && input.optionId === question.correctOptionId;
    case 'trueFalse':
      return input.type === 'boolean' && input.value === question.correct;
    case 'ordering':
      return (
        input.type === 'order' &&
        input.ids.length === question.items.length &&
        input.ids.every((id, i) => id === question.items[i].id)
      );
    case 'ayahOrder':
      return (
        input.type === 'order' && input.ids.every((id, i) => id === String(i + 1))
      );
    case 'matching':
      return input.type === 'pairs' && input.mistakes <= MATCHING_MISTAKE_ALLOWANCE;
    case 'memory':
      // Memory games are about exposure and recall; finishing the board counts.
      return input.type === 'memory';
    case 'missingWord':
      return input.type === 'word' && context.missingWord !== undefined && input.word === context.missingWord;
  }
}

export interface QuizScore {
  correct: number;
  total: number;
  /** 0..100 */
  percent: number;
  stars: 1 | 2 | 3;
}

export function scoreQuiz(results: readonly boolean[]): QuizScore {
  const total = results.length;
  const correct = results.filter(Boolean).length;
  const percent = total === 0 ? 100 : Math.round((correct / total) * 100);
  const stars: 1 | 2 | 3 = percent === 100 ? 3 : percent >= 70 ? 2 : 1;
  return { correct, total, percent, stars };
}
