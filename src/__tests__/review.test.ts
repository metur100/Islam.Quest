import type { ReviewItem } from '@/models';
import { dueItems, isDue, MAX_BOX, nextReviewDate, recordMistake, recordSuccess, topicWeakness } from '@/services/review';

const NOW = '2026-10-06T10:00:00.000Z';
const day = (n: number) => new Date(new Date(NOW).getTime() + n * 86_400_000).toISOString();

describe('spaced review', () => {
  it('creates a due item on the first mistake', () => {
    const item = recordMistake(undefined, 'q1', 'wudu', NOW);
    expect(item).toMatchObject({ questionId: 'q1', topic: 'wudu', box: 0, incorrectCount: 1, correctCount: 0, mastered: false });
    expect(isDue(item, NOW)).toBe(true);
  });

  it('moves up a box with growing intervals after correct answers', () => {
    let item = recordMistake(undefined, 'q1', 't', NOW);
    item = recordSuccess(item, NOW);
    expect(item.box).toBe(1);
    expect(item.nextReviewDate).toBe(day(1));
    expect(isDue(item, NOW)).toBe(false);
    expect(isDue(item, day(1))).toBe(true);

    item = recordSuccess(item, day(1));
    expect(item.box).toBe(2);
    expect(item.nextReviewDate).toBe(day(4));
  });

  it('marks an item as mastered after the last box', () => {
    let item: ReviewItem = { ...recordMistake(undefined, 'q1', 't', NOW), box: MAX_BOX };
    item = recordSuccess(item, NOW);
    expect(item.mastered).toBe(true);
    expect(isDue(item, day(100))).toBe(false);
  });

  it('a new mistake sends the item back to box 0 and keeps history', () => {
    let item = recordSuccess(recordMistake(undefined, 'q1', 't', NOW), NOW);
    item = recordMistake(item, 'q1', 't', day(1));
    expect(item.box).toBe(0);
    expect(item.incorrectCount).toBe(2);
    expect(item.correctCount).toBe(1);
    expect(item.lastSeen).toBe(day(1));
  });

  it('prioritises the least known items and weakest topics', () => {
    const items: Record<string, ReviewItem> = {
      a: { ...recordMistake(undefined, 'a', 'easy', NOW), box: 1, nextReviewDate: NOW },
      b: recordMistake(undefined, 'b', 'hard', NOW),
      c: { ...recordMistake(undefined, 'c', 'hard', NOW), incorrectCount: 3 },
      d: { ...recordMistake(undefined, 'd', 'x', NOW), nextReviewDate: day(2) },
      e: { ...recordMistake(undefined, 'e', 'x', NOW), mastered: true },
    };
    expect(dueItems(items, NOW).map((i) => i.questionId)).toEqual(['c', 'b', 'a']);
    expect(topicWeakness(Object.values(items))).toEqual({ easy: 1, hard: 4, x: 1 });
    expect(nextReviewDate(items)).toBe(NOW);
  });

  it('returns no next date when everything is mastered', () => {
    expect(nextReviewDate({})).toBeNull();
  });
});
