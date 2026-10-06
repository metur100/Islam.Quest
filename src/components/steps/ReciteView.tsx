import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { getSurah, QURAN_SOURCE, recitationUrl } from '@/data/quran';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { currentStream, playStream, stopStream } from '@/services/sound';
import { colors, radius, spacing } from '@/theme';

const REPEATS = 3;

interface ReciteViewProps {
  surahNumber: number;
  onDone: () => void;
}

/**
 * Memorisation by repetition: the child reads each verified ayah and taps it after each repetition.
 * "Test myself" hides the Arabic text so the child can recite from memory.
 */
export function ReciteView({ surahNumber, onDone }: ReciteViewProps) {
  const { t, l, language } = useI18n();
  const feedback = useFeedback();
  const surah = getSurah(surahNumber);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [hidden, setHidden] = useState(false);
  const [playing, setPlaying] = useState<number | null>(null);
  const [audioError, setAudioError] = useState(false);

  useEffect(() => () => stopStream(), []);

  useEffect(() => {
    if (playing === null) return;
    const timer = setInterval(() => {
      const player = currentStream();
      if (!player) {
        setPlaying(null);
        return;
      }
      if (player.isLoaded && !player.playing && player.currentTime > 0 && player.currentTime >= player.duration - 0.2) {
        setPlaying(null);
      }
    }, 500);
    // Without network the stream never loads; tell the child after a short wait.
    const timeout = setTimeout(() => {
      const player = currentStream();
      if (player && !player.isLoaded) {
        stopStream();
        setPlaying(null);
        setAudioError(true);
      }
    }, 8000);
    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [playing]);

  if (!surah) return null;
  const allDone = surah.ayahs.every((a) => (counts[a.numberInSurah] ?? 0) >= REPEATS);

  const togglePlay = (globalNumber: number) => {
    if (playing === globalNumber) {
      stopStream();
      setPlaying(null);
      return;
    }
    setAudioError(false);
    const ok = playStream(recitationUrl(globalNumber));
    if (ok) setPlaying(globalNumber);
    else setAudioError(true);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="title" accessibilityRole="header">
          {t('recite.title', { surah: surah.nameTransliterated })}
        </AppText>
        <AppText variant="title" script="arabic" align="center" color={colors.goldDeep}>
          {surah.nameArabic}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {surah.revelationType === 'makki' ? t('recite.makki') : t('recite.madani')} · {t('recite.ayahs', { count: surah.ayahCount })}
        </AppText>
        <AppText variant="body">{t('recite.hint')}</AppText>
      </View>

      <Button
        label={hidden ? t('recite.showText') : t('recite.hideText')}
        icon={hidden ? 'eye' : 'eyeOff'}
        variant="secondary"
        onPress={() => setHidden((h) => !h)}
      />

      {surah.ayahs.map((ayah) => {
        const count = counts[ayah.numberInSurah] ?? 0;
        const complete = count >= REPEATS;
        return (
          <View key={ayah.numberInSurah} style={[styles.ayahCard, complete && styles.ayahDone]}>
            <Pressable
              onPress={() => {
                if (complete) return;
                feedback.tap();
                setCounts((c) => ({ ...c, [ayah.numberInSurah]: count + 1 }));
              }}
              accessibilityRole="button"
              accessibilityLabel={`${ayah.numberInSurah}. ${ayah.transliteration}. ${t('recite.repeat', { count })}`}
              style={styles.ayahPress}
            >
              <AppText variant="title" script="quran" align="center" style={hidden ? styles.hiddenText : undefined}>
                {ayah.arabic} ﴿{ayah.numberInSurah}﴾
              </AppText>
              {!hidden ? (
                <>
                  <AppText variant="small" align="center" color={colors.textMuted}>
                    {ayah.transliteration}
                  </AppText>
                  <AppText variant="small" align="center">
                    {l(ayah.translation)}
                  </AppText>
                </>
              ) : null}
            </Pressable>
            <View style={styles.ayahFooter}>
              <Pressable
                onPress={() => togglePlay(ayah.globalNumber)}
                accessibilityRole="button"
                accessibilityLabel={playing === ayah.globalNumber ? t('recite.stop') : t('recite.play')}
                style={styles.listen}
              >
                <Icon name={playing === ayah.globalNumber ? 'stop' : 'play'} size={16} color={colors.primary} />
                <AppText variant="small" color={colors.primary}>
                  {playing === ayah.globalNumber ? t('recite.stop') : t('recite.play')}
                </AppText>
              </Pressable>
              <View style={styles.dots} accessibilityElementsHidden>
                {Array.from({ length: REPEATS }, (_, i) => (
                  <View key={i} style={[styles.dot, i < count && styles.dotOn]} />
                ))}
              </View>
            </View>
          </View>
        );
      })}

      {audioError ? (
        <AppText variant="small" color={colors.error}>
          {t('recite.audioUnavailable')}
        </AppText>
      ) : null}
      <AppText variant="tiny" color={colors.textMuted}>
        {t('recite.source', { translation: QURAN_SOURCE.translations[language] })}
      </AppText>
      {!allDone ? (
        <AppText variant="small" color={colors.textMuted} align="center">
          {t('recite.remaining')}
        </AppText>
      ) : null}
      <Button label={t('recite.done')} icon="check" onPress={onDone} disabled={!allDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  header: { gap: spacing.xs },
  ayahCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  ayahDone: { borderColor: colors.success },
  ayahPress: { padding: spacing.lg, gap: spacing.xs },
  hiddenText: { opacity: 0.06 },
  ayahFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listen: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingRight: spacing.md },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.border },
  dotOn: { backgroundColor: colors.success, borderColor: colors.success },
});
