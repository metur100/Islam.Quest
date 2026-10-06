import type { Fact, GoodDeed, Lesson, Quest, Question, World, WorldId } from '@/models';
import type { ContentGraph } from '@/services/unlocking';

import akhlaq from './content/akhlaq.json';
import arabic from './content/arabic.json';
import prophets from './content/prophets.json';
import quran from './content/quran.json';
import ramadan from './content/ramadan.json';
import salah from './content/salah.json';

/** Shape of one world's content file. Religious content lives only in these JSON files. */
export interface WorldPack {
  world: World;
  lessons: Lesson[];
  questions: Question[];
  quests: Quest[];
  facts: Fact[];
  goodDeeds?: GoodDeed[];
}

// JSON imports are widened by TypeScript (e.g. `type: string`); the shape is verified by
// the content integrity test suite, so the cast here is safe.
export const PACKS: readonly WorldPack[] = [salah, prophets, quran, akhlaq, ramadan, arabic].map(
  (pack) => pack as unknown as WorldPack,
);

export const WORLDS: readonly World[] = PACKS.map((p) => p.world).sort((a, b) => a.order - b.order);
export const QUESTS: readonly Quest[] = PACKS.flatMap((p) => p.quests);
export const LESSONS: readonly Lesson[] = PACKS.flatMap((p) => p.lessons);
export const QUESTIONS: readonly Question[] = PACKS.flatMap((p) => p.questions);
export const FACTS: readonly Fact[] = PACKS.flatMap((p) => p.facts);
export const GOOD_DEEDS: readonly GoodDeed[] = PACKS.flatMap((p) => p.goodDeeds ?? []);

export const CONTENT_GRAPH: ContentGraph = { worlds: WORLDS, quests: QUESTS };

const byId = <T extends { id: string }>(items: readonly T[]) =>
  new Map(items.map((item) => [item.id, item] as const));

const worldMap = byId(WORLDS);
const questMap = byId(QUESTS);
const lessonMap = byId(LESSONS);
const questionMap = byId(QUESTIONS);
const factMap = byId(FACTS);

export const getWorld = (id: string): World | undefined => worldMap.get(id);
export const getQuest = (id: string): Quest | undefined => questMap.get(id);
export const getLesson = (id: string): Lesson | undefined => lessonMap.get(id);
export const getQuestion = (id: string): Question | undefined => questionMap.get(id);
export const getFact = (id: string): Fact | undefined => factMap.get(id);

export const lessonsOfWorld = (worldId: WorldId): Lesson[] =>
  LESSONS.filter((l) => l.worldId === worldId);

/** Lessons in the order they appear inside the world's quests. */
export function orderedLessonsOfWorld(worldId: WorldId): Lesson[] {
  const quests = QUESTS.filter((q) => q.worldId === worldId).sort((a, b) => a.order - b.order);
  const ids: string[] = [];
  for (const quest of quests) {
    for (const step of quest.steps) {
      if (step.kind === 'lesson' && !ids.includes(step.lessonId)) ids.push(step.lessonId);
    }
  }
  return ids.map((id) => lessonMap.get(id)).filter((l): l is Lesson => l !== undefined);
}

/** The quest that teaches a lesson (used to unlock lessons in the Learn tab). */
export function questForLesson(lessonId: string): Quest | undefined {
  return QUESTS.find((q) => q.steps.some((s) => s.kind === 'lesson' && s.lessonId === lessonId));
}
