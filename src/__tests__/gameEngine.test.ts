import { CONTENT_GRAPH, QUESTS } from '@/data';
import {
  applyAnswer,
  applyDailyComplete,
  applyLessonComplete,
  applyQuestComplete,
  applyRecitePractice,
  createInitialState,
  finalizeBadges,
  toggleRamadanDeed,
} from '@/services/gameEngine';
import { XP } from '@/services/xp';

const NOW = new Date('2026-10-06T10:00:00');
const q = { id: 'salah-pillar', topic: 'salah-basics' };

describe('answers', () => {
  it('awards XP for a correct answer only once', () => {
    let state = createInitialState();
    const first = applyAnswer(state, q, true, 'quest', NOW);
    expect(first.xp).toBe(XP.correctAnswer);
    state = first.state;
    const again = applyAnswer(state, q, true, 'quest', NOW);
    expect(again.xp).toBe(0);
    expect(again.state.xp).toBe(XP.correctAnswer);
    expect(again.state.stats.correctAnswers).toBe(2);
  });

  it('puts mistakes into the review queue without XP', () => {
    const { state, xp } = applyAnswer(createInitialState(), q, false, 'quest', NOW);
    expect(xp).toBe(0);
    expect(state.review[q.id]).toMatchObject({ box: 0, incorrectCount: 1 });
  });

  it('rewards a correct review and promotes the item', () => {
    const missed = applyAnswer(createInitialState(), q, false, 'quest', NOW).state;
    const { state, xp } = applyAnswer(missed, q, true, 'review', NOW);
    expect(xp).toBe(XP.reviewCorrect);
    expect(state.review[q.id].box).toBe(1);
    expect(state.stats.reviewsCorrect).toBe(1);
    // Not due again today: answering again gives nothing.
    expect(applyAnswer(state, q, true, 'review', NOW).xp).toBe(0);
  });
});

describe('lessons and daily challenge', () => {
  it('awards lesson XP once and records the streak', () => {
    const first = applyLessonComplete(createInitialState(), 'salah-what', NOW);
    expect(first.xp).toBe(XP.lessonComplete);
    expect(first.state.streak.current).toBe(1);
    expect(applyLessonComplete(first.state, 'salah-what', NOW).xp).toBe(0);
  });

  it('awards daily challenge XP once per day', () => {
    const first = applyDailyComplete(createInitialState(), '2026-10-06', NOW);
    expect(first.xp).toBe(XP.dailyChallenge);
    expect(applyDailyComplete(first.state, '2026-10-06', NOW).xp).toBe(0);
    expect(applyDailyComplete(first.state, '2026-10-07', NOW).xp).toBe(XP.dailyChallenge);
  });
});

describe('quest completion', () => {
  it('completes a quest with stars, bonus and streak', () => {
    const reward = applyQuestComplete(createInitialState(), 'salah-q1', [true, true, true], CONTENT_GRAPH, NOW);
    expect(reward.score.stars).toBe(3);
    expect(reward.firstCompletion).toBe(true);
    expect(reward.lines.map((l) => l.kind)).toEqual(['questComplete', 'perfectBonus']);
    expect(reward.state.quests['salah-q1']).toMatchObject({ completed: true, bestStars: 3, attempts: 1 });
    expect(reward.state.streak.current).toBe(1);
    expect(reward.state.stats.perfectQuests).toBe(1);
  });

  it('gives no completion XP on replay but keeps the best result', () => {
    const first = applyQuestComplete(createInitialState(), 'salah-q1', [true, false], CONTENT_GRAPH, NOW);
    const replay = applyQuestComplete(first.state, 'salah-q1', [true, true], CONTENT_GRAPH, NOW);
    expect(replay.lines.map((l) => l.kind)).toEqual(['perfectBonus']);
    const third = applyQuestComplete(replay.state, 'salah-q1', [false, false], CONTENT_GRAPH, NOW);
    expect(third.xp).toBe(0);
    expect(third.state.quests['salah-q1']).toMatchObject({ bestStars: 3, bestScore: 100, attempts: 3 });
  });

  it('awards the world bonus once and reports newly unlocked worlds', () => {
    let state = createInitialState();
    const salah = QUESTS.filter((x) => x.worldId === 'salah').sort((a, b) => a.order - b.order);
    const unlocked: string[] = [];
    let worldBonus = 0;
    for (const quest of salah) {
      const reward = applyQuestComplete(state, quest.id, [true], CONTENT_GRAPH, NOW);
      state = reward.state;
      unlocked.push(...reward.unlockedWorlds);
      worldBonus += reward.lines.filter((l) => l.kind === 'worldComplete').length;
    }
    expect(unlocked).toEqual(['prophets']);
    expect(worldBonus).toBe(1);
    expect(state.rewardedWorlds).toEqual(['salah']);
    const replay = applyQuestComplete(state, salah[0].id, [true], CONTENT_GRAPH, NOW);
    expect(replay.lines.some((l) => l.kind === 'worldComplete')).toBe(false);
  });

  it('throws for unknown quests', () => {
    expect(() => applyQuestComplete(createInitialState(), 'nope', [], CONTENT_GRAPH, NOW)).toThrow();
  });
});

describe('badges and trackers', () => {
  it('awards first lesson and first quest badges once', () => {
    let state = applyLessonComplete(createInitialState(), 'salah-what', NOW).state;
    state = applyQuestComplete(state, 'salah-q1', [true], CONTENT_GRAPH, NOW).state;
    const first = finalizeBadges(state, CONTENT_GRAPH, NOW);
    expect(first.newBadges).toEqual(expect.arrayContaining(['first_lesson', 'first_quest', 'perfect_score']));
    expect(finalizeBadges(first.state, CONTENT_GRAPH, NOW).newBadges).toEqual([]);
  });

  it('awards streak badges from the longest streak', () => {
    const state = { ...createInitialState(), streak: { current: 7, longest: 7, lastActiveDay: '2026-10-06' } };
    expect(finalizeBadges(state, CONTENT_GRAPH, NOW).newBadges).toContain('streak_7');
  });

  it('toggles Ramadan good deeds and counts recitation practice', () => {
    let state = toggleRamadanDeed(createInitialState(), 3, 'quran');
    expect(state.ramadanDeeds['3']).toEqual(['quran']);
    state = toggleRamadanDeed(state, 3, 'quran');
    expect(state.ramadanDeeds['3']).toEqual([]);
    state = applyRecitePractice(applyRecitePractice(state, 112), 112);
    expect(state.recitePractice['112']).toBe(2);
  });
});
