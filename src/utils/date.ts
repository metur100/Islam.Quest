import type { DayKey } from '@/models';

const pad = (n: number) => String(n).padStart(2, '0');

/** Local-time day key (YYYY-MM-DD). Streaks and daily challenges follow the player's calendar day. */
export function toDayKey(date: Date): DayKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

/** Whole calendar days from `a` to `b` (positive when b is later). DST-safe. */
export function daysBetween(a: DayKey, b: DayKey): number {
  const ua = Date.UTC(...splitKey(a));
  const ub = Date.UTC(...splitKey(b));
  return Math.round((ub - ua) / 86_400_000);
}

function splitKey(key: DayKey): [number, number, number] {
  const [y, m, d] = key.split('-').map(Number);
  return [y, m - 1, d];
}

/** Stable day number used for deterministic daily content selection. */
export function dayNumber(key: DayKey): number {
  return Math.floor(Date.UTC(...splitKey(key)) / 86_400_000);
}
