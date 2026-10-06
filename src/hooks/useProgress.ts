import { useMemo } from 'react';

import { CONTENT_GRAPH, WORLDS } from '@/data';
import type { World } from '@/models';
import { dueItems } from '@/services/review';
import { displayedStreak, isActiveToday } from '@/services/streak';
import {
  completedInWorld,
  currentQuest,
  isWorldComplete,
  isWorldUnlocked,
  questsOfWorld,
} from '@/services/unlocking';
import { levelInfo } from '@/services/xp';
import { useGameStore } from '@/store/gameStore';
import { toDayKey } from '@/utils/date';

export interface WorldProgress {
  world: World;
  unlocked: boolean;
  complete: boolean;
  completed: number;
  total: number;
}

/** Derived, read-only view of the player's progress used across screens. */
export function useProgress() {
  const game = useGameStore((s) => s.game);

  return useMemo(() => {
    const today = toDayKey(new Date());
    const worlds: WorldProgress[] = WORLDS.map((world) => ({
      world,
      unlocked: isWorldUnlocked(world, game.quests, CONTENT_GRAPH),
      complete: isWorldComplete(world.id, game.quests, CONTENT_GRAPH),
      completed: completedInWorld(world.id, game.quests, CONTENT_GRAPH),
      total: questsOfWorld(world.id, CONTENT_GRAPH).length,
    }));
    return {
      today,
      level: levelInfo(game.xp),
      streak: displayedStreak(game.streak, today),
      activeToday: isActiveToday(game.streak, today),
      worlds,
      nextQuest: currentQuest(game.quests, CONTENT_GRAPH),
      dueReviews: dueItems(game.review, new Date().toISOString()),
      dailyDone: game.dailyCompleted.includes(today),
      completedQuests: Object.values(game.quests).filter((q) => q.completed).length,
    };
  }, [game]);
}
