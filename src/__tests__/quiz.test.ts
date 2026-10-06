import type { Question } from '@/models';
import { evaluateAnswer, scoreQuiz } from '@/services/quiz';

const text = (s: string) => ({ en: s, de: s, bs: s });
const base = { worldId: 'salah' as const, topic: 't', prompt: text('p'), explanation: text('e') };

describe('evaluateAnswer', () => {
  it('checks multiple choice and scenario answers', () => {
    const q: Question = { ...base, id: 'q', type: 'multipleChoice', options: [{ id: 'a', text: text('A') }, { id: 'b', text: text('B') }], correctOptionId: 'b' };
    expect(evaluateAnswer(q, { type: 'option', optionId: 'b' })).toBe(true);
    expect(evaluateAnswer(q, { type: 'option', optionId: 'a' })).toBe(false);
    expect(evaluateAnswer(q, { type: 'boolean', value: true })).toBe(false);
  });

  it('checks true/false', () => {
    const q: Question = { ...base, id: 'q', type: 'trueFalse', correct: false };
    expect(evaluateAnswer(q, { type: 'boolean', value: false })).toBe(true);
    expect(evaluateAnswer(q, { type: 'boolean', value: true })).toBe(false);
  });

  it('checks ordering exactly', () => {
    const q: Question = { ...base, id: 'q', type: 'ordering', items: ['a', 'b', 'c'].map((id) => ({ id, text: text(id) })) };
    expect(evaluateAnswer(q, { type: 'order', ids: ['a', 'b', 'c'] })).toBe(true);
    expect(evaluateAnswer(q, { type: 'order', ids: ['b', 'a', 'c'] })).toBe(false);
    expect(evaluateAnswer(q, { type: 'order', ids: ['a', 'b'] })).toBe(false);
  });

  it('checks ayah order by ayah number', () => {
    const q: Question = { ...base, id: 'q', type: 'ayahOrder', surahNumber: 112 };
    expect(evaluateAnswer(q, { type: 'order', ids: ['1', '2', '3', '4'] })).toBe(true);
    expect(evaluateAnswer(q, { type: 'order', ids: ['2', '1', '3', '4'] })).toBe(false);
  });

  it('allows one mistake in matching', () => {
    const q: Question = { ...base, id: 'q', type: 'matching', pairs: [] };
    expect(evaluateAnswer(q, { type: 'pairs', mistakes: 0 })).toBe(true);
    expect(evaluateAnswer(q, { type: 'pairs', mistakes: 1 })).toBe(true);
    expect(evaluateAnswer(q, { type: 'pairs', mistakes: 2 })).toBe(false);
  });

  it('checks the missing word against the puzzle answer', () => {
    const q: Question = { ...base, id: 'q', type: 'missingWord', surahNumber: 112, ayahNumber: 1, missingWordIndex: 3 };
    expect(evaluateAnswer(q, { type: 'word', word: 'x' }, { missingWord: 'x' })).toBe(true);
    expect(evaluateAnswer(q, { type: 'word', word: 'y' }, { missingWord: 'x' })).toBe(false);
  });
});

describe('scoreQuiz', () => {
  it('gives three stars for a perfect score', () => {
    expect(scoreQuiz([true, true, true])).toEqual({ correct: 3, total: 3, percent: 100, stars: 3 });
  });

  it('gives two stars from 70%', () => {
    expect(scoreQuiz([true, true, true, false]).stars).toBe(2);
    expect(scoreQuiz([true, true, true, true, true, true, true, false, false, false]).stars).toBe(2);
  });

  it('gives one star below 70%', () => {
    expect(scoreQuiz([true, false, false]).stars).toBe(1);
    expect(scoreQuiz([false]).percent).toBe(0);
  });

  it('treats quests without questions as complete', () => {
    expect(scoreQuiz([])).toEqual({ correct: 0, total: 0, percent: 100, stars: 3 });
  });
});
