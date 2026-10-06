import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppModal } from '@/components/ui/AppModal';
import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

/** Shows queued badge unlocks and level-ups one at a time, unless paused (e.g. mid-quest). */
export function CelebrationOverlay() {
  const { t } = useI18n();
  const feedback = useFeedback();
  const next = useGameStore((s) => s.celebrations[0]);
  const paused = useGameStore((s) => s.celebrationsPaused);
  const dismiss = useGameStore((s) => s.dismissCelebration);
  const visible = !!next && !paused;

  useEffect(() => {
    if (visible) feedback.reward();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, next]);

  if (!next) return null;

  return (
    <AppModal visible={visible} onClose={dismiss}>
      <View style={styles.content}>
        {next.kind === 'badge' ? (
          <>
            <AppText variant="label" color={colors.goldDeep}>
              {t('reward.newBadge').toUpperCase()}
            </AppText>
            <Badge id={next.id} earned size={120} showLabel={false} />
            <AppText variant="title" align="center">
              {t(`badge.${next.id}.name` as TranslationKey)}
            </AppText>
            <AppText variant="body" align="center" color={colors.textMuted}>
              {t(`badge.${next.id}.desc` as TranslationKey)}
            </AppText>
          </>
        ) : (
          <>
            <View style={styles.levelCircle}>
              <Icon name="star" size={56} color={colors.gold} />
              <AppText variant="display" color={colors.night} style={styles.levelNumber}>
                {next.level}
              </AppText>
            </View>
            <AppText variant="title" align="center">
              {t('celebrate.levelTitle')}
            </AppText>
            <AppText variant="body" align="center" color={colors.textMuted}>
              {t('celebrate.levelBody', { level: next.level })}
            </AppText>
          </>
        )}
        <Button label={t('common.continue')} onPress={dismiss} />
      </View>
    </AppModal>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: spacing.md },
  levelCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: colors.goldSoft,
    borderWidth: 4,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelNumber: { position: 'absolute', bottom: 18 },
});
