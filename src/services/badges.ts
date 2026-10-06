import type { BadgeId, GameState, WorldId } from '@/models';
import { type ContentGraph, isWorldComplete, isWorldUnlocked } from './unlocking';

export interface BadgeDefinition {
  id: BadgeId;
  /** Icon name from components/ui/Icon. */
  icon: string;
  color: string;
}

export const BADGES: readonly BadgeDefinition[] = [
  { id: 'first_lesson', icon: 'book', color: '#3BA99C' },
  { id: 'first_quest', icon: 'flag', color: '#F2B544' },
  { id: 'prayer_explorer', icon: 'mosque', color: '#4C7BD9' },
  { id: 'story_seeker', icon: 'scroll', color: '#C9773B' },
  { id: 'quran_explorer', icon: 'quran', color: '#2E8B57' },
  { id: 'akhlaq_hero', icon: 'heart', color: '#E0607E' },
  { id: 'ramadan_learner', icon: 'moon', color: '#7B5CD6' },
  { id: 'arabic_beginner', icon: 'letter', color: '#D9534F' },
  { id: 'streak_7', icon: 'flame', color: '#F28C28' },
  { id: 'streak_30', icon: 'flame', color: '#D9480F' },
  { id: 'daily_learner', icon: 'sun', color: '#E8A317' },
  { id: 'review_champion', icon: 'refresh', color: '#1C7C8C' },
  { id: 'perfect_score', icon: 'star', color: '#F2B544' },
  { id: 'world_explorer', icon: 'map', color: '#3F8F6B' },
  { id: 'knowledge_master', icon: 'trophy', color: '#B8860B' },
];

const WORLD_BADGES: Partial<Record<BadgeId, WorldId>> = {
  prayer_explorer: 'salah',
  story_seeker: 'prophets',
  quran_explorer: 'quran',
  akhlaq_hero: 'akhlaq',
  ramadan_learner: 'ramadan',
  arabic_beginner: 'arabic',
};

export function isBadgeEarned(id: BadgeId, state: GameState, graph: ContentGraph): boolean {
  const worldId = WORLD_BADGES[id];
  if (worldId) return isWorldComplete(worldId, state.quests, graph);
  switch (id) {
    case 'first_lesson':
      return state.completedLessons.length > 0;
    case 'first_quest':
      return Object.values(state.quests).some((q) => q.completed);
    case 'streak_7':
      return state.streak.longest >= 7;
    case 'streak_30':
      return state.streak.longest >= 30;
    case 'daily_learner':
      return state.dailyCompleted.length >= 7;
    case 'review_champion':
      return state.stats.reviewsCorrect >= 10;
    case 'perfect_score':
      return state.stats.perfectQuests > 0;
    case 'world_explorer':
      return graph.worlds.every((w) => isWorldUnlocked(w, state.quests, graph));
    case 'knowledge_master':
      return graph.quests.every((q) => state.quests[q.id]?.completed);
    default:
      return false;
  }
}

/** Returns the state with newly earned badges added, plus the list of new badge ids. */
export function awardBadges(
  state: GameState,
  graph: ContentGraph,
  nowIso: string,
): { state: GameState; newBadges: BadgeId[] } {
  const newBadges = BADGES.map((b) => b.id).filter(
    (id) => !state.badges[id] && isBadgeEarned(id, state, graph),
  );
  if (newBadges.length === 0) return { state, newBadges };
  const badges = { ...state.badges };
  for (const id of newBadges) badges[id] = nowIso;
  return { state: { ...state, badges }, newBadges };
}
