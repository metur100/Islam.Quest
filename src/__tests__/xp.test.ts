import { levelFromXp, levelInfo, totalXpForLevel, XP, xpToAdvance } from '@/services/xp';

describe('XP rewards', () => {
  it('uses the documented reward values', () => {
    expect(XP.correctAnswer).toBe(10);
    expect(XP.lessonComplete).toBe(30);
    expect(XP.worldComplete).toBe(100);
    expect(XP.dailyChallenge).toBe(25);
  });
});

describe('level progression', () => {
  it('starts at level 1 with no XP', () => {
    expect(levelInfo(0)).toEqual({ level: 1, xpIntoLevel: 0, xpForNextLevel: 100, progress: 0, totalXp: 0 });
  });

  it('needs 100, 150, 200 … XP per level', () => {
    expect(xpToAdvance(1)).toBe(100);
    expect(xpToAdvance(2)).toBe(150);
    expect(xpToAdvance(3)).toBe(200);
  });

  it('levels up exactly at the threshold', () => {
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(249)).toBe(2);
    expect(levelFromXp(250)).toBe(3);
  });

  it('computes cumulative totals consistently', () => {
    for (let level = 1; level < 15; level++) {
      expect(levelFromXp(totalXpForLevel(level))).toBe(level);
      expect(levelFromXp(totalXpForLevel(level + 1) - 1)).toBe(level);
    }
  });

  it('reports progress within the level', () => {
    const info = levelInfo(175);
    expect(info.level).toBe(2);
    expect(info.xpIntoLevel).toBe(75);
    expect(info.progress).toBeCloseTo(0.5);
  });

  it('treats negative or fractional XP safely', () => {
    expect(levelInfo(-50).level).toBe(1);
    expect(levelInfo(100.9).level).toBe(2);
  });
});
