const ARABIC = /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/;

export function containsArabic(text: string): boolean {
  return ARABIC.test(text);
}

const ARABIC_LETTERS = /[ء-يٱ-ۓ]/g;
const LATIN_LETTERS = /[A-Za-zÀ-ɏ]/g;

/**
 * True when the text is predominantly Arabic script. Latin sentences that merely contain
 * an Arabic symbol (e.g. ﷺ) keep the Latin font.
 */
export function isMostlyArabic(text: string): boolean {
  const arabic = text.match(ARABIC_LETTERS)?.length ?? 0;
  const latin = text.match(LATIN_LETTERS)?.length ?? 0;
  return arabic > 0 && arabic >= latin;
}

/** Replaces `{name}` placeholders. */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
