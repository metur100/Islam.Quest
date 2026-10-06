export type Language = 'bs' | 'de' | 'en';

export const LANGUAGES: readonly Language[] = ['bs', 'de', 'en'];

/** Text available in every supported language. */
export type LocalizedText = Record<Language, string>;

/** Reference to the source a religious claim is based on. */
export interface SourceRef {
  sourceName: string;
  sourceReference: string;
}

/** ISO date key in the user's local time zone, e.g. "2026-10-06". */
export type DayKey = string;
