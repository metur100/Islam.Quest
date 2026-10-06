import { displayedStreak, EMPTY_STREAK, isActiveToday, registerActivity } from '@/services/streak';

describe('streak', () => {
  it('starts a streak on the first activity', () => {
    expect(registerActivity(EMPTY_STREAK, '2026-10-01')).toEqual({ current: 1, longest: 1, lastActiveDay: '2026-10-01' });
  });

  it('counts each day only once', () => {
    const s = registerActivity(EMPTY_STREAK, '2026-10-01');
    expect(registerActivity(s, '2026-10-01')).toBe(s);
  });

  it('grows on consecutive days, including across months', () => {
    let s = registerActivity(EMPTY_STREAK, '2026-09-29');
    s = registerActivity(s, '2026-09-30');
    s = registerActivity(s, '2026-10-01');
    expect(s.current).toBe(3);
    expect(s.longest).toBe(3);
  });

  it('resets after a missed day but keeps the longest streak', () => {
    let s = registerActivity(EMPTY_STREAK, '2026-10-01');
    s = registerActivity(s, '2026-10-02');
    s = registerActivity(s, '2026-10-05');
    expect(s.current).toBe(1);
    expect(s.longest).toBe(2);
  });

  it('handles daylight-saving changes (late October)', () => {
    let s = registerActivity(EMPTY_STREAK, '2026-10-24');
    s = registerActivity(s, '2026-10-25');
    s = registerActivity(s, '2026-10-26');
    expect(s.current).toBe(3);
  });

  it('ignores clocks going backwards', () => {
    const s = registerActivity(EMPTY_STREAK, '2026-10-05');
    expect(registerActivity(s, '2026-10-03')).toBe(s);
  });

  it('shows the streak while it can still be continued today', () => {
    const s = { current: 4, longest: 4, lastActiveDay: '2026-10-05' };
    expect(displayedStreak(s, '2026-10-05')).toBe(4);
    expect(displayedStreak(s, '2026-10-06')).toBe(4);
    expect(displayedStreak(s, '2026-10-07')).toBe(0);
    expect(isActiveToday(s, '2026-10-05')).toBe(true);
    expect(isActiveToday(s, '2026-10-06')).toBe(false);
    expect(displayedStreak(EMPTY_STREAK, '2026-10-06')).toBe(0);
  });
});
