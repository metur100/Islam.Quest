import { FACTS, getFact, getQuestion, QUESTIONS } from '@/data';
import { DAILY_ROTATION, dailyChallengeFor } from '@/services/daily';
import { addDays, toDayKey } from '@/utils/date';

const pool = { questions: QUESTIONS, facts: FACTS };

describe('daily challenge', () => {
  it('is the same for the whole day', () => {
    expect(dailyChallengeFor('2026-10-06', pool)).toEqual(dailyChallengeFor('2026-10-06', pool));
  });

  it('rotates through every challenge kind over five days', () => {
    const start = new Date(2026, 9, 6);
    const kinds = new Set(Array.from({ length: 5 }, (_, i) => dailyChallengeFor(toDayKey(addDays(start, i)), pool).kind));
    expect(kinds).toEqual(new Set(DAILY_ROTATION));
  });

  it('always references existing local content', () => {
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < 400; i++) {
      const challenge = dailyChallengeFor(toDayKey(addDays(start, i)), pool);
      expect(challenge.questionIds.length).toBeGreaterThan(0);
      for (const id of challenge.questionIds) expect(getQuestion(id)).toBeDefined();
      if (challenge.kind === 'fact') expect(getFact(challenge.factId!)).toBeDefined();
      if (challenge.kind === 'miniQuiz') expect(new Set(challenge.questionIds).size).toBe(3);
      if (challenge.kind === 'scenario') expect(getQuestion(challenge.questionIds[0])!.type).toBe('scenario');
      if (challenge.kind === 'memory') expect(getQuestion(challenge.questionIds[0])!.type).toBe('memory');
    }
  });

  it('falls back to a question when a pool is empty', () => {
    const quick = QUESTIONS.filter((q) => q.type === 'trueFalse');
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < 5; i++) {
      const challenge = dailyChallengeFor(toDayKey(addDays(start, i)), { questions: quick, facts: [] });
      expect(['question', 'miniQuiz']).toContain(challenge.kind);
    }
  });
});
