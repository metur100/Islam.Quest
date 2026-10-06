import type { LocalizedText, SourceRef } from './common';
import type { SceneSpec } from './scene';

export type WorldId = 'salah' | 'prophets' | 'quran' | 'akhlaq' | 'ramadan' | 'arabic';

export interface UnlockRequirement {
  worldId: WorldId;
  questsCompleted: number;
}

export interface World {
  id: WorldId;
  order: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  scene: SceneSpec;
  questIds: string[];
  unlockRequirement: UnlockRequirement | null;
}

export interface LessonSection {
  heading?: LocalizedText;
  body: LocalizedText;
  /** Optional Arabic word or phrase shown large (never Quran text — that lives in quran/surahs.json). */
  arabic?: string;
  transliteration?: string;
}

export interface Lesson {
  id: string;
  worldId: WorldId;
  topic: string;
  title: LocalizedText;
  summary: LocalizedText;
  sections: LessonSection[];
  /** Shown when scholars hold different valid positions on the topic. */
  differenceNote?: LocalizedText;
  sources?: SourceRef[];
  scene?: SceneSpec;
}

export interface LearnedValue {
  title: LocalizedText;
  body: LocalizedText;
}

export type QuestStep =
  | { kind: 'intro'; title: LocalizedText; body: LocalizedText; scene: SceneSpec }
  | {
      kind: 'story';
      title?: LocalizedText;
      body: LocalizedText;
      scene: SceneSpec;
      sources?: SourceRef[];
    }
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'question'; questionId: string; label?: 'interactive' | 'challenge' | 'quiz' }
  | { kind: 'learned'; values: LearnedValue[] }
  | { kind: 'tracing'; letters: string[] }
  | { kind: 'recite'; surahNumber: number };

export type QuestKind = 'lesson' | 'story' | 'game' | 'memorization';

export interface Quest {
  id: string;
  worldId: WorldId;
  order: number;
  kind: QuestKind;
  title: LocalizedText;
  description: LocalizedText;
  steps: QuestStep[];
  sources?: SourceRef[];
}

export interface Fact {
  id: string;
  worldId: WorldId;
  text: LocalizedText;
  sources?: SourceRef[];
}

export interface GoodDeed {
  id: string;
  label: LocalizedText;
}

export type BadgeId =
  | 'first_quest'
  | 'first_lesson'
  | 'prayer_explorer'
  | 'story_seeker'
  | 'quran_explorer'
  | 'akhlaq_hero'
  | 'ramadan_learner'
  | 'arabic_beginner'
  | 'streak_7'
  | 'streak_30'
  | 'world_explorer'
  | 'knowledge_master'
  | 'review_champion'
  | 'daily_learner'
  | 'perfect_score';
