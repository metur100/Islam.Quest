import type { LocalizedText, SourceRef } from './common';
import type { WorldId } from './content';

export type QuestionType =
  | 'multipleChoice'
  | 'trueFalse'
  | 'ordering'
  | 'matching'
  | 'memory'
  | 'scenario'
  | 'missingWord'
  | 'ayahOrder';

interface QuestionBase {
  id: string;
  worldId: WorldId;
  /** Topic key used to group mistakes in the review system. */
  topic: string;
  prompt: LocalizedText;
  explanation: LocalizedText;
  sources?: SourceRef[];
}

export interface AnswerOption {
  id: string;
  text: LocalizedText;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'multipleChoice';
  options: AnswerOption[];
  correctOptionId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  type: 'trueFalse';
  correct: boolean;
}

/** Items are listed in the correct order; the UI shuffles them. */
export interface OrderingQuestion extends QuestionBase {
  type: 'ordering';
  items: AnswerOption[];
}

export interface MatchingPair {
  id: string;
  left: LocalizedText;
  right: LocalizedText;
}

export interface MatchingQuestion extends QuestionBase {
  type: 'matching';
  pairs: MatchingPair[];
}

export interface MemoryQuestion extends QuestionBase {
  type: 'memory';
  pairs: MatchingPair[];
}

export interface ScenarioOption extends AnswerOption {
  feedback: LocalizedText;
}

export interface ScenarioQuestion extends QuestionBase {
  type: 'scenario';
  options: ScenarioOption[];
  correctOptionId: string;
}

/** Quran memorization: one word of a verified ayah is hidden. */
export interface MissingWordQuestion extends QuestionBase {
  type: 'missingWord';
  surahNumber: number;
  ayahNumber: number;
  missingWordIndex: number;
}

/** Quran memorization: put the ayahs of a short surah in order. */
export interface AyahOrderQuestion extends QuestionBase {
  type: 'ayahOrder';
  surahNumber: number;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | OrderingQuestion
  | MatchingQuestion
  | MemoryQuestion
  | ScenarioQuestion
  | MissingWordQuestion
  | AyahOrderQuestion;

/** What the player submitted, normalised for evaluation. */
export type AnswerInput =
  | { type: 'option'; optionId: string }
  | { type: 'boolean'; value: boolean }
  | { type: 'order'; ids: string[] }
  | { type: 'pairs'; mistakes: number }
  | { type: 'memory'; moves: number }
  | { type: 'word'; word: string };
