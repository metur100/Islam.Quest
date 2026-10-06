import type { LocalizedText } from '@/models';
import { containsArabic } from '@/utils/text';

import data from './quran/surahs.json';

export interface Ayah {
  numberInSurah: number;
  /** Position in the whole Quran (1–6236); used for the optional online recitation. */
  globalNumber: number;
  arabic: string;
  transliteration: string;
  translation: LocalizedText;
}

export interface Surah {
  number: number;
  nameArabic: string;
  nameTransliterated: string;
  nameMeaning: string;
  revelationType: 'makki' | 'madani';
  ayahCount: number;
  ayahs: Ayah[];
}

/**
 * Verified Quran text (Tanzil, Uthmani script) and translations, stored locally.
 * It is generated from the source download, never typed by hand.
 */
export const QURAN_SOURCE = data.source;
export const SURAHS: readonly Surah[] = data.surahs as Surah[];

export function getSurah(number: number): Surah | undefined {
  return SURAHS.find((s) => s.number === number);
}

export function getAyah(surahNumber: number, ayahNumber: number): Ayah | undefined {
  return getSurah(surahNumber)?.ayahs.find((a) => a.numberInSurah === ayahNumber);
}

/** Splits an ayah into words; tokens without Arabic letters (e.g. stop marks) are dropped. */
export function ayahWords(text: string): string[] {
  return text.split(/\s+/).filter((token) => containsArabic(token) && /[ء-يٱ]/.test(token));
}

/**
 * Optional recitation audio (Mishary Alafasy via the Islamic Network CDN). Only fetched when the
 * player taps play, so the app works fully offline; playback fails gracefully without internet.
 */
export function recitationUrl(globalAyahNumber: number): string {
  return `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${globalAyahNumber}.mp3`;
}

/** Builds the missing-word puzzle: the hidden word plus up to 3 distractors from the same surah. */
export function missingWordPuzzle(
  surahNumber: number,
  ayahNumber: number,
  missingIndex: number,
): { words: string[]; answer: string; choices: string[] } | null {
  const surah = getSurah(surahNumber);
  const ayah = getAyah(surahNumber, ayahNumber);
  if (!surah || !ayah) return null;
  const words = ayahWords(ayah.arabic);
  const answer = words[missingIndex];
  if (!answer) return null;
  const distractors: string[] = [];
  for (const other of surah.ayahs) {
    for (const word of ayahWords(other.arabic)) {
      if (word !== answer && !distractors.includes(word)) distractors.push(word);
    }
  }
  // Deterministic choice of distractors keeps the puzzle stable between renders.
  const picked = distractors
    .map((word, i) => ({ word, key: (i * 7919 + missingIndex * 31 + ayahNumber) % 97 }))
    .sort((a, b) => a.key - b.key)
    .slice(0, 3)
    .map((d) => d.word);
  return { words, answer, choices: [answer, ...picked] };
}
