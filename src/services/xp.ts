/**
 * XP rewards. XP comes from educational activity only and every reward is granted
 * once per item, so repeating content or tapping through answers cannot farm XP.
 */
export const XP = {
  correctAnswer: 10,
  lessonComplete: 30,
  questComplete: 20,
  perfectQuestBonus: 10,
  worldComplete: 100,
  dailyChallenge: 25,
  reviewCorrect: 5,
} as const;

export interface LevelInfo {
  level: number;
  /** XP collected inside the current level. */
  xpIntoLevel: number;
  /** XP needed to go from the current level to the next one. */
  xpForNextLevel: number;
  /** 0..1 progress towards the next level. */
  progress: number;
  totalXp: number;
}

/** XP needed to go from `level` to `level + 1`: 100, 150, 200, … */
export function xpToAdvance(level: number): number {
  return 100 + (Math.max(1, level) - 1) * 50;
}

/** Total XP needed to reach `level` from level 1. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += xpToAdvance(l);
  return total;
}

export function levelInfo(totalXp: number): LevelInfo {
  const xp = Math.max(0, Math.floor(totalXp));
  let level = 1;
  let remaining = xp;
  while (remaining >= xpToAdvance(level)) {
    remaining -= xpToAdvance(level);
    level++;
  }
  const needed = xpToAdvance(level);
  return {
    level,
    xpIntoLevel: remaining,
    xpForNextLevel: needed,
    progress: remaining / needed,
    totalXp: xp,
  };
}

export function levelFromXp(totalXp: number): number {
  return levelInfo(totalXp).level;
}
