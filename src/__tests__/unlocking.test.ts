import type { Quest, QuestProgress, World } from '@/models';
import {
  completedInWorld,
  currentQuest,
  isWorldComplete,
  isWorldUnlocked,
  questStatus,
  unlockedWorldIds,
} from '@/services/unlocking';

const text = { en: 'x', de: 'x', bs: 'x' };
const scene = { sky: 'day' as const, elements: [] };
const world = (id: World['id'], order: number, unlock: World['unlockRequirement']): World => ({
  id,
  order,
  title: text,
  subtitle: text,
  description: text,
  scene,
  questIds: [],
  unlockRequirement: unlock,
});
const quest = (id: string, worldId: World['id'], order: number): Quest => ({
  id,
  worldId,
  order,
  kind: 'lesson',
  title: text,
  description: text,
  steps: [],
});

const graph = {
  worlds: [world('salah', 1, null), world('prophets', 2, { worldId: 'salah', questsCompleted: 2 }), world('quran', 3, { worldId: 'prophets', questsCompleted: 1 })],
  quests: [quest('s1', 'salah', 1), quest('s2', 'salah', 2), quest('s3', 'salah', 3), quest('p1', 'prophets', 1), quest('p2', 'prophets', 2), quest('q1', 'quran', 1)],
};
const done = (...ids: string[]): Record<string, QuestProgress> =>
  Object.fromEntries(ids.map((id) => [id, { completed: true, bestStars: 3, bestScore: 100, attempts: 1 }]));

describe('quest unlocking', () => {
  it('only the first world and its first quest are open at the start', () => {
    expect(unlockedWorldIds({}, graph)).toEqual(['salah']);
    expect(questStatus(graph.quests[0], {}, graph)).toBe('available');
    expect(questStatus(graph.quests[1], {}, graph)).toBe('locked');
    expect(currentQuest({}, graph)?.id).toBe('s1');
  });

  it('unlocks quests inside a world one after another', () => {
    const progress = done('s1');
    expect(questStatus(graph.quests[0], progress, graph)).toBe('completed');
    expect(questStatus(graph.quests[1], progress, graph)).toBe('available');
    expect(questStatus(graph.quests[2], progress, graph)).toBe('locked');
  });

  it('unlocks the next world after the required number of quests', () => {
    expect(isWorldUnlocked(graph.worlds[1], done('s1'), graph)).toBe(false);
    expect(isWorldUnlocked(graph.worlds[1], done('s1', 's2'), graph)).toBe(true);
    expect(questStatus(graph.quests[3], done('s1', 's2'), graph)).toBe('available');
  });

  it('requires the whole chain of previous worlds', () => {
    // Progress in a later world alone does not unlock it.
    expect(isWorldUnlocked(graph.worlds[2], done('p1'), graph)).toBe(false);
    expect(isWorldUnlocked(graph.worlds[2], done('s1', 's2', 'p1'), graph)).toBe(true);
  });

  it('suggests the earliest open quest as current', () => {
    expect(currentQuest(done('s1', 's2'), graph)?.id).toBe('s3');
    expect(currentQuest(done('s1', 's2', 's3'), graph)?.id).toBe('p1');
    expect(currentQuest(done('s1', 's2', 's3', 'p1', 'p2', 'q1'), graph)).toBeNull();
  });

  it('detects completed worlds', () => {
    expect(completedInWorld('salah', done('s1', 's3'), graph)).toBe(2);
    expect(isWorldComplete('salah', done('s1', 's2'), graph)).toBe(false);
    expect(isWorldComplete('salah', done('s1', 's2', 's3'), graph)).toBe(true);
  });
});
