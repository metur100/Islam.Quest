import type { ReviewItem } from '@/models';

/**
 * Leitner-style spaced review. A mistake puts the question in box 0 (due right away).
 * Each correct review moves it up one box; the interval grows with the box.
 * Getting it right in the last box marks the question as mastered.
 */
export const REVIEW_INTERVAL_DAYS = [0, 1, 3, 7, 14] as const;
export const MAX_BOX = REVIEW_INTERVAL_DAYS.length - 1;

const DAY_MS = 86_400_000;

function addDaysIso(nowIso: string, days: number): string {
  return new Date(new Date(nowIso).getTime() + days * DAY_MS).toISOString();
}

export function recordMistake(
  item: ReviewItem | undefined,
  questionId: string,
  topic: string,
  nowIso: string,
): ReviewItem {
  return {
    questionId,
    topic,
    box: 0,
    correctCount: item?.correctCount ?? 0,
    incorrectCount: (item?.incorrectCount ?? 0) + 1,
    lastSeen: nowIso,
    nextReviewDate: nowIso,
    mastered: false,
  };
}

export function recordSuccess(item: ReviewItem, nowIso: string): ReviewItem {
  if (item.box >= MAX_BOX) {
    return {
      ...item,
      correctCount: item.correctCount + 1,
      lastSeen: nowIso,
      mastered: true,
    };
  }
  const box = item.box + 1;
  return {
    ...item,
    box,
    correctCount: item.correctCount + 1,
    lastSeen: nowIso,
    nextReviewDate: addDaysIso(nowIso, REVIEW_INTERVAL_DAYS[box]),
  };
}

export function isDue(item: ReviewItem, nowIso: string): boolean {
  return !item.mastered && new Date(item.nextReviewDate).getTime() <= new Date(nowIso).getTime();
}

/**
 * Due items, most important first: lower box (less known), more mistakes,
 * then the topics the player struggles with most, then the oldest due date.
 */
export function dueItems(items: Record<string, ReviewItem>, nowIso: string): ReviewItem[] {
  const all = Object.values(items);
  const weakness = topicWeakness(all);
  return all
    .filter((item) => isDue(item, nowIso))
    .sort(
      (a, b) =>
        a.box - b.box ||
        b.incorrectCount - a.incorrectCount ||
        (weakness[b.topic] ?? 0) - (weakness[a.topic] ?? 0) ||
        a.nextReviewDate.localeCompare(b.nextReviewDate),
    );
}

/** Sum of mistakes per topic for items that are not yet mastered. */
export function topicWeakness(items: readonly ReviewItem[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of items) {
    if (item.mastered) continue;
    result[item.topic] = (result[item.topic] ?? 0) + item.incorrectCount;
  }
  return result;
}

export function nextReviewDate(items: Record<string, ReviewItem>): string | null {
  const pending = Object.values(items).filter((i) => !i.mastered);
  if (pending.length === 0) return null;
  return pending.map((i) => i.nextReviewDate).sort()[0];
}
