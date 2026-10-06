import type { Quest, QuestProgress, World, WorldId } from '@/models';

export interface ContentGraph {
  worlds: readonly World[];
  quests: readonly Quest[];
}

export type QuestStatus = 'locked' | 'available' | 'completed';

type ProgressMap = Record<string, QuestProgress>;

const isDone = (progress: ProgressMap, questId: string) => progress[questId]?.completed === true;

export function questsOfWorld(worldId: WorldId, graph: ContentGraph): Quest[] {
  return graph.quests.filter((q) => q.worldId === worldId).sort((a, b) => a.order - b.order);
}

export function completedInWorld(worldId: WorldId, progress: ProgressMap, graph: ContentGraph): number {
  return questsOfWorld(worldId, graph).filter((q) => isDone(progress, q.id)).length;
}

export function isWorldUnlocked(world: World, progress: ProgressMap, graph: ContentGraph): boolean {
  const req = world.unlockRequirement;
  if (!req) return true;
  const required = graph.worlds.find((w) => w.id === req.worldId);
  if (!required || !isWorldUnlocked(required, progress, graph)) return false;
  return completedInWorld(req.worldId, progress, graph) >= req.questsCompleted;
}

export function isWorldComplete(worldId: WorldId, progress: ProgressMap, graph: ContentGraph): boolean {
  const quests = questsOfWorld(worldId, graph);
  return quests.length > 0 && quests.every((q) => isDone(progress, q.id));
}

/** Quests inside a world unlock one after another. */
export function questStatus(quest: Quest, progress: ProgressMap, graph: ContentGraph): QuestStatus {
  if (isDone(progress, quest.id)) return 'completed';
  const world = graph.worlds.find((w) => w.id === quest.worldId);
  if (!world || !isWorldUnlocked(world, progress, graph)) return 'locked';
  const quests = questsOfWorld(quest.worldId, graph);
  const index = quests.findIndex((q) => q.id === quest.id);
  if (index <= 0) return 'available';
  return isDone(progress, quests[index - 1].id) ? 'available' : 'locked';
}

/** The next quest the player should do: the first available, uncompleted quest in world order. */
export function currentQuest(progress: ProgressMap, graph: ContentGraph): Quest | null {
  const worlds = [...graph.worlds].sort((a, b) => a.order - b.order);
  for (const world of worlds) {
    for (const quest of questsOfWorld(world.id, graph)) {
      if (questStatus(quest, progress, graph) === 'available') return quest;
    }
  }
  return null;
}

export function unlockedWorldIds(progress: ProgressMap, graph: ContentGraph): WorldId[] {
  return graph.worlds.filter((w) => isWorldUnlocked(w, progress, graph)).map((w) => w.id);
}
