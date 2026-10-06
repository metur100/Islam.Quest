import type { Language, LocalizedText } from '@/models';
import { interpolate } from '@/utils/text';

import bs from './bs';
import de from './de';
import en, { type Dictionary, type TranslationKey } from './en';

export type { TranslationKey };

const DICTIONARIES: Record<Language, Dictionary> = { en, de, bs };

export const LANGUAGE_NAMES: Record<Language, string> = {
  bs: 'Bosanski',
  de: 'Deutsch',
  en: 'English',
};

/** BCP-47 tags used for dates and text-to-speech. */
export const LOCALE_TAGS: Record<Language, string> = { bs: 'bs-BA', de: 'de-DE', en: 'en-GB' };

export function translate(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  const template = DICTIONARIES[language][key] ?? en[key] ?? key;
  return interpolate(template, params);
}

/** Picks the text for the current language, falling back to English. */
export function localize(text: LocalizedText | undefined, language: Language): string {
  if (!text) return '';
  return text[language] || text.en;
}

/** Maps the device locale to a supported language (Bosnian also covers Croatian/Serbian/Montenegrin). */
export function languageFromLocale(code: string | null | undefined): Language {
  const lower = (code ?? '').toLowerCase();
  if (['bs', 'hr', 'sr', 'cnr', 'sh'].includes(lower)) return 'bs';
  if (lower === 'de') return 'de';
  return 'en';
}
