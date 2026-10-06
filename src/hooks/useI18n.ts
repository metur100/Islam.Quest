import { useCallback } from 'react';

import { localize, translate, type TranslationKey } from '@/localization/i18n';
import type { LocalizedText } from '@/models';
import { useGameStore } from '@/store/gameStore';

/** Translation helpers bound to the player's current language. */
export function useI18n() {
  const language = useGameStore((s) => s.game.settings.language);
  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );
  const l = useCallback((text: LocalizedText | undefined) => localize(text, language), [language]);
  return { t, l, language };
}
