import type { DayKey, Language } from './common';
import type { BadgeId } from './content';

export type SkinTone = 0 | 1 | 2 | 3 | 4 | 5;
export type HairStyle = 'short' | 'curly' | 'long' | 'buzz' | 'bun';
export type Headwear = 'none' | 'kufi' | 'hijab' | 'cap';
export type Outfit = 'thobe' | 'hoodie' | 'jacket' | 'abaya';
export type Accessory = 'none' | 'glasses' | 'backpack' | 'scarf' | 'lantern';

export interface Character {
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hairColor: number;
  headwear: Headwear;
  outfit: Outfit;
  outfitColor: number;
  accessory: Accessory;
}

export interface UserProfile {
  name: string;
  character: Character;
  createdAt: string;
}

export interface NotificationSettings {
  dailyQuest: boolean;
  dailyReview: boolean;
  dailyChallenge: boolean;
}

export interface Settings {
  language: Language;
  soundEnabled: boolean;
  ambientEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  notifications: NotificationSettings;
}

export interface QuestProgress {
  completed: boolean;
  bestStars: number;
  bestScore: number;
  attempts: number;
  completedAt?: string;
}

/** Spaced-review entry for a question the player once answered incorrectly. */
export interface ReviewItem {
  questionId: string;
  topic: string;
  box: number;
  correctCount: number;
  incorrectCount: number;
  lastSeen: string;
  nextReviewDate: string;
  mastered: boolean;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDay: DayKey | null;
}

export interface Stats {
  questionsAnswered: number;
  correctAnswers: number;
  reviewsCorrect: number;
  perfectQuests: number;
}

export interface GameState {
  version: number;
  onboarded: boolean;
  profile: UserProfile;
  settings: Settings;
  xp: number;
  quests: Record<string, QuestProgress>;
  completedLessons: string[];
  /** Questions answered correctly at least once — XP for a question is only granted once. */
  correctlyAnswered: string[];
  badges: Partial<Record<BadgeId, string>>;
  streak: StreakState;
  review: Record<string, ReviewItem>;
  /** Day keys on which the daily challenge was completed. */
  dailyCompleted: DayKey[];
  /** Ramadan good-deed tracker: day number (1–30) → completed deed ids. */
  ramadanDeeds: Record<string, string[]>;
  /** Quran memorization practice sessions per surah number. */
  recitePractice: Record<string, number>;
  rewardedWorlds: string[];
  stats: Stats;
  lastQuestId: string | null;
}
