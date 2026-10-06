import { create } from 'zustand';

import { CONTENT_GRAPH } from '@/data';
import type { BadgeId, Character, GameState, Language, Settings } from '@/models';
import {
  type AnswerMode,
  applyAnswer,
  applyDailyComplete,
  applyLessonComplete,
  applyQuestComplete,
  applyRecitePractice,
  applyReviewSessionComplete,
  createInitialState,
  finalizeBadges,
  type QuestReward,
  toggleRamadanDeed,
} from '@/services/gameEngine';
import { levelFromXp } from '@/services/xp';
import { clearGameState, loadGameState, saveGameState } from '@/storage/persistence';

export type Celebration = { kind: 'badge'; id: BadgeId } | { kind: 'level'; level: number };

export interface QuestOutcome extends Omit<QuestReward, 'state'> {
  /** XP earned for answers and lessons during this run (before the completion bonus). */
  learningXp: number;
  newBadges: BadgeId[];
  levelUp: number | null;
}

interface GameStore {
  hydrated: boolean;
  game: GameState;
  celebrations: Celebration[];
  /** While true (e.g. mid-quest), queued celebrations wait instead of interrupting. */
  celebrationsPaused: boolean;

  hydrate: (deviceLanguage: Language) => Promise<void>;
  completeOnboarding: (input: { name: string; character: Character; language: Language }) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setCharacter: (character: Character) => void;
  setName: (name: string) => void;
  recordAnswer: (question: { id: string; topic: string }, correct: boolean, mode: AnswerMode) => number;
  completeLesson: (lessonId: string) => number;
  completeQuest: (questId: string, results: boolean[], learningXp: number) => QuestOutcome;
  completeDaily: (day: string) => number;
  completeReviewSession: () => void;
  practiseRecite: (surahNumber: number) => void;
  toggleRamadanDeed: (day: number, deedId: string) => void;
  resetProgress: () => Promise<void>;
  dismissCelebration: () => void;
  setCelebrationsPaused: (paused: boolean) => void;
}

/**
 * Runs an engine step, then awards badges and queues celebrations
 * (new badges, level-ups) for the global overlay.
 */
function commit(
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
  next: GameState,
): { newBadges: BadgeId[]; levelUp: number | null } {
  const before = get().game;
  const { state, newBadges } = finalizeBadges(next, CONTENT_GRAPH, new Date());
  const levelBefore = levelFromXp(before.xp);
  const levelAfter = levelFromXp(state.xp);
  const levelUp = levelAfter > levelBefore ? levelAfter : null;
  const celebrations: Celebration[] = [
    ...get().celebrations,
    ...(levelUp ? [{ kind: 'level' as const, level: levelUp }] : []),
    ...newBadges.map((id) => ({ kind: 'badge' as const, id })),
  ];
  set({ game: state, celebrations });
  return { newBadges, levelUp };
}

export const useGameStore = create<GameStore>((set, get) => ({
  hydrated: false,
  game: createInitialState('en'),
  celebrations: [],
  celebrationsPaused: false,

  hydrate: async (deviceLanguage) => {
    const stored = await loadGameState();
    set({ game: stored ?? createInitialState(deviceLanguage), hydrated: true });
  },

  completeOnboarding: ({ name, character, language }) => {
    const game = get().game;
    set({
      game: {
        ...game,
        onboarded: true,
        profile: { ...game.profile, name: name.trim(), character },
        settings: { ...game.settings, language },
      },
    });
  },

  updateSettings: (patch) => {
    const game = get().game;
    set({
      game: {
        ...game,
        settings: {
          ...game.settings,
          ...patch,
          notifications: { ...game.settings.notifications, ...patch.notifications },
        },
      },
    });
  },

  setCharacter: (character) => {
    const game = get().game;
    set({ game: { ...game, profile: { ...game.profile, character } } });
  },

  setName: (name) => {
    const game = get().game;
    set({ game: { ...game, profile: { ...game.profile, name: name.trim() } } });
  },

  recordAnswer: (question, correct, mode) => {
    const { state, xp } = applyAnswer(get().game, question, correct, mode, new Date());
    commit(get, set, state);
    return xp;
  },

  completeLesson: (lessonId) => {
    const { state, xp } = applyLessonComplete(get().game, lessonId, new Date());
    commit(get, set, state);
    return xp;
  },

  completeQuest: (questId, results, learningXp) => {
    const reward = applyQuestComplete(get().game, questId, results, CONTENT_GRAPH, new Date());
    const { state, ...rest } = reward;
    const { newBadges, levelUp } = commit(get, set, state);
    return { ...rest, learningXp, newBadges, levelUp };
  },

  completeDaily: (day) => {
    const { state, xp } = applyDailyComplete(get().game, day, new Date());
    commit(get, set, state);
    return xp;
  },

  completeReviewSession: () => {
    commit(get, set, applyReviewSessionComplete(get().game, new Date()));
  },

  practiseRecite: (surahNumber) => {
    set({ game: applyRecitePractice(get().game, surahNumber) });
  },

  toggleRamadanDeed: (day, deedId) => {
    set({ game: toggleRamadanDeed(get().game, day, deedId) });
  },

  resetProgress: async () => {
    const language = get().game.settings.language;
    await clearGameState();
    set({ game: createInitialState(language), celebrations: [] });
  },

  dismissCelebration: () => set({ celebrations: get().celebrations.slice(1) }),

  setCelebrationsPaused: (paused) => set({ celebrationsPaused: paused }),
}));

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Persists the game state shortly after every change (debounced to avoid excess writes). */
export function startAutoSave(): () => void {
  return useGameStore.subscribe((store, previous) => {
    if (!store.hydrated || store.game === previous.game) return;
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveGameState(useGameStore.getState().game).catch(() => {
        // Storage failures are retried on the next change; the in-memory state stays intact.
      });
    }, 300);
  });
}
