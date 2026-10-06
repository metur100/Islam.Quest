import type { DayKey, Fact, Question } from '@/models';
import { dayNumber } from '@/utils/date';
import { seededRandom, shuffle } from '@/utils/random';

export type DailyKind = 'question' | 'miniQuiz' | 'memory' | 'fact' | 'scenario';

export const DAILY_ROTATION: readonly DailyKind[] = ['question', 'scenario', 'miniQuiz', 'fact', 'memory'];

export interface DailyChallenge {
  day: DayKey;
  kind: DailyKind;
  questionIds: string[];
  factId: string | null;
}

export interface DailyPool {
  questions: readonly Question[];
  facts: readonly Fact[];
}

const QUICK_TYPES = new Set<Question['type']>(['multipleChoice', 'trueFalse']);

/**
 * Picks the same challenge for everybody on the same calendar day, fully offline.
 * The kind rotates daily; content is chosen with a day-seeded random generator.
 */
export function dailyChallengeFor(day: DayKey, pool: DailyPool): DailyChallenge {
  const n = dayNumber(day);
  const random = seededRandom(n * 7919 + 17);
  let kind = DAILY_ROTATION[((n % DAILY_ROTATION.length) + DAILY_ROTATION.length) % DAILY_ROTATION.length];

  const quick = pool.questions.filter((q) => QUICK_TYPES.has(q.type));
  const scenarios = pool.questions.filter((q) => q.type === 'scenario');
  const memory = pool.questions.filter((q) => q.type === 'memory');

  if (kind === 'scenario' && scenarios.length === 0) kind = 'question';
  if (kind === 'memory' && memory.length === 0) kind = 'question';
  if (kind === 'fact' && pool.facts.length === 0) kind = 'question';

  switch (kind) {
    case 'scenario':
      return { day, kind, questionIds: [pick(scenarios, random).id], factId: null };
    case 'memory':
      return { day, kind, questionIds: [pick(memory, random).id], factId: null };
    case 'miniQuiz':
      return {
        day,
        kind,
        questionIds: shuffle(quick, random)
          .slice(0, 3)
          .map((q) => q.id),
        factId: null,
      };
    case 'fact': {
      const fact = pick(pool.facts, random);
      const related = quick.filter((q) => q.worldId === fact.worldId);
      const question = pick(related.length > 0 ? related : quick, random);
      return { day, kind, questionIds: [question.id], factId: fact.id };
    }
    case 'question':
    default:
      return { day, kind: 'question', questionIds: [pick(quick, random).id], factId: null };
  }
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)];
}
