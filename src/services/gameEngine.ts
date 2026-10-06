import type { BadgeId, DayKey, GameState, Language, WorldId } from '@/models';
import { toDayKey } from '@/utils/date';
import { awardBadges } from './badges';
import { scoreQuiz, type QuizScore } from './quiz';
import { isDue, recordMistake, recordSuccess } from './review';
import { EMPTY_STREAK, registerActivity } from './streak';
import { type ContentGraph, isWorldComplete, unlockedWorldIds } from './unlocking';
import { XP } from './xp';

export const STATE_VERSION = 1;

export function createInitialState(language: Language = 'en', now: Date = new Date()): GameState {
  return {
    version: STATE_VERSION,
    onboarded: false,
    profile: {
      name: '',
      createdAt: now.toISOString(),
      character: {
        skinTone: 2,
        hairStyle: 'short',
        hairColor: 0,
        headwear: 'none',
        outfit: 'hoodie',
        outfitColor: 0,
        accessory: 'none',
      },
    },
    settings: {
      language,
      soundEnabled: true,
      ambientEnabled: false,
      hapticsEnabled: true,
      reducedMotion: false,
      largeText: false,
      notifications: { dailyQuest: false, dailyReview: false, dailyChallenge: false },
    },
    xp: 0,
    quests: {},
    completedLessons: [],
    correctlyAnswered: [],
    badges: {},
    streak: { ...EMPTY_STREAK },
    review: {},
    dailyCompleted: [],
    ramadanDeeds: {},
    recitePractice: {},
    rewardedWorlds: [],
    stats: { questionsAnswered: 0, correctAnswers: 0, reviewsCorrect: 0, perfectQuests: 0 },
    lastQuestId: null,
  };
}

export type AnswerMode = 'quest' | 'review' | 'daily';

export interface EngineResult {
  state: GameState;
  xp: number;
}

/**
 * Records one answer. XP for a correct answer is granted only the first time a question is
 * answered correctly; mistakes go into the spaced-review queue.
 */
export function applyAnswer(
  state: GameState,
  question: { id: string; topic: string },
  correct: boolean,
  mode: AnswerMode,
  now: Date,
): EngineResult {
  const nowIso = now.toISOString();
  const stats = {
    ...state.stats,
    questionsAnswered: state.stats.questionsAnswered + 1,
    correctAnswers: state.stats.correctAnswers + (correct ? 1 : 0),
  };
  const review = { ...state.review };
  const existing = review[question.id];
  let xp = 0;
  let correctlyAnswered = state.correctlyAnswered;

  if (!correct) {
    review[question.id] = recordMistake(existing, question.id, question.topic, nowIso);
    return { state: { ...state, stats, review }, xp };
  }

  const firstTimeCorrect = !state.correctlyAnswered.includes(question.id);
  if (firstTimeCorrect) correctlyAnswered = [...state.correctlyAnswered, question.id];

  if (existing && !existing.mastered && isDue(existing, nowIso)) {
    review[question.id] = recordSuccess(existing, nowIso);
    if (mode === 'review') {
      xp += XP.reviewCorrect;
      stats.reviewsCorrect += 1;
    }
  }
  if (firstTimeCorrect && mode !== 'review') xp += XP.correctAnswer;

  return {
    state: { ...state, stats, review, correctlyAnswered, xp: state.xp + xp },
    xp,
  };
}

export function applyLessonComplete(state: GameState, lessonId: string, now: Date): EngineResult {
  const streak = registerActivity(state.streak, toDayKey(now));
  if (state.completedLessons.includes(lessonId)) {
    return { state: { ...state, streak }, xp: 0 };
  }
  return {
    state: {
      ...state,
      streak,
      completedLessons: [...state.completedLessons, lessonId],
      xp: state.xp + XP.lessonComplete,
    },
    xp: XP.lessonComplete,
  };
}

export type RewardLine = 'questComplete' | 'perfectBonus' | 'worldComplete';

export interface QuestReward {
  state: GameState;
  xp: number;
  lines: { kind: RewardLine; xp: number }[];
  score: QuizScore;
  firstCompletion: boolean;
  worldCompleted: WorldId | null;
  unlockedWorlds: WorldId[];
}

export function applyQuestComplete(
  state: GameState,
  questId: string,
  results: readonly boolean[],
  graph: ContentGraph,
  now: Date,
): QuestReward {
  const quest = graph.quests.find((q) => q.id === questId);
  if (!quest) throw new Error(`Unknown quest ${questId}`);
  const score = scoreQuiz(results);
  const before = state.quests[questId];
  const firstCompletion = !before?.completed;
  const unlockedBefore = new Set(unlockedWorldIds(state.quests, graph));

  const lines: QuestReward['lines'] = [];
  if (firstCompletion) lines.push({ kind: 'questComplete', xp: XP.questComplete });
  const perfect = score.total > 0 && score.correct === score.total;
  const firstPerfect = perfect && (before?.bestStars ?? 0) < 3;
  if (firstPerfect) lines.push({ kind: 'perfectBonus', xp: XP.perfectQuestBonus });

  const quests = {
    ...state.quests,
    [questId]: {
      completed: true,
      attempts: (before?.attempts ?? 0) + 1,
      bestStars: Math.max(before?.bestStars ?? 0, score.stars),
      bestScore: Math.max(before?.bestScore ?? 0, score.percent),
      completedAt: before?.completedAt ?? now.toISOString(),
    },
  };

  let rewardedWorlds = state.rewardedWorlds;
  let worldCompleted: WorldId | null = null;
  if (isWorldComplete(quest.worldId, quests, graph) && !rewardedWorlds.includes(quest.worldId)) {
    worldCompleted = quest.worldId;
    rewardedWorlds = [...rewardedWorlds, quest.worldId];
    lines.push({ kind: 'worldComplete', xp: XP.worldComplete });
  }

  const xp = lines.reduce((sum, l) => sum + l.xp, 0);
  const unlockedWorlds = unlockedWorldIds(quests, graph).filter((id) => !unlockedBefore.has(id));

  return {
    state: {
      ...state,
      quests,
      rewardedWorlds,
      xp: state.xp + xp,
      streak: registerActivity(state.streak, toDayKey(now)),
      lastQuestId: questId,
      stats: firstPerfect
        ? { ...state.stats, perfectQuests: state.stats.perfectQuests + 1 }
        : state.stats,
    },
    xp,
    lines,
    score,
    firstCompletion,
    worldCompleted,
    unlockedWorlds,
  };
}

export function applyDailyComplete(state: GameState, day: DayKey, now: Date): EngineResult {
  const streak = registerActivity(state.streak, toDayKey(now));
  if (state.dailyCompleted.includes(day)) return { state: { ...state, streak }, xp: 0 };
  return {
    state: {
      ...state,
      streak,
      dailyCompleted: [...state.dailyCompleted, day],
      xp: state.xp + XP.dailyChallenge,
    },
    xp: XP.dailyChallenge,
  };
}

/** A finished review session is meaningful learning and keeps the streak alive. */
export function applyReviewSessionComplete(state: GameState, now: Date): GameState {
  return { ...state, streak: registerActivity(state.streak, toDayKey(now)) };
}

export function applyRecitePractice(state: GameState, surahNumber: number): GameState {
  const key = String(surahNumber);
  return {
    ...state,
    recitePractice: { ...state.recitePractice, [key]: (state.recitePractice[key] ?? 0) + 1 },
  };
}

export function toggleRamadanDeed(state: GameState, day: number, deedId: string): GameState {
  const key = String(day);
  const current = state.ramadanDeeds[key] ?? [];
  const next = current.includes(deedId) ? current.filter((d) => d !== deedId) : [...current, deedId];
  return { ...state, ramadanDeeds: { ...state.ramadanDeeds, [key]: next } };
}

export function finalizeBadges(
  state: GameState,
  graph: ContentGraph,
  now: Date,
): { state: GameState; newBadges: BadgeId[] } {
  return awardBadges(state, graph, now.toISOString());
}
