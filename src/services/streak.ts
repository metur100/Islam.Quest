import type { DayKey, StreakState } from '@/models';
import { daysBetween } from '@/utils/date';

export const EMPTY_STREAK: StreakState = { current: 0, longest: 0, lastActiveDay: null };

/**
 * Registers meaningful learning activity (finishing a lesson, quest, review or daily challenge).
 * Multiple activities on the same day count once.
 */
export function registerActivity(streak: StreakState, today: DayKey): StreakState {
  if (streak.lastActiveDay === today) return streak;
  const gap = streak.lastActiveDay ? daysBetween(streak.lastActiveDay, today) : Infinity;
  if (gap < 0) return streak; // clock moved backwards — never punish the player
  const current = gap === 1 ? streak.current + 1 : 1;
  return {
    current,
    longest: Math.max(streak.longest, current),
    lastActiveDay: today,
  };
}

/** Streak as shown to the player: still alive today if they learned yesterday. */
export function displayedStreak(streak: StreakState, today: DayKey): number {
  if (!streak.lastActiveDay) return 0;
  const gap = daysBetween(streak.lastActiveDay, today);
  return gap <= 1 ? streak.current : 0;
}

export function isActiveToday(streak: StreakState, today: DayKey): boolean {
  return streak.lastActiveDay === today;
}
