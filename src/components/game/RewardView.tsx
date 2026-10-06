import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Stars } from '@/components/ui/Stars';
import { getWorld } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import type { QuestOutcome } from '@/store/gameStore';
import { colors, spacing } from '@/theme';

import { RewardAnimation } from './RewardAnimation';

interface RewardViewProps {
  outcome: QuestOutcome;
  onPrimary: () => void;
  primaryLabel: string;
  onBackToMap: () => void;
  onReview?: () => void;
}

/** End-of-quest reward: XP counter, stars, XP breakdown and newly unlocked worlds. */
export function RewardView({ outcome, onPrimary, primaryLabel, onBackToMap, onReview }: RewardViewProps) {
  const { t, l } = useI18n();
  const total = outcome.xp + outcome.learningXp;
  const lines = [
    ...(outcome.learningXp > 0 ? [{ label: t('reward.lines.answers'), xp: outcome.learningXp }] : []),
    ...outcome.lines.map((line) => ({ label: t(`reward.lines.${line.kind}` as TranslationKey), xp: line.xp })),
  ];

  return (
    <View style={styles.root}>
      <AppText variant="display" align="center" accessibilityRole="header">
        {t('reward.title')}
      </AppText>
      <RewardAnimation xp={total} label={t('reward.score', { correct: outcome.score.correct, total: outcome.score.total })} />
      <View style={styles.center}>
        <Stars count={outcome.score.stars} size={36} />
      </View>

      {lines.length > 0 ? (
        <Card>
          {lines.map((line) => (
            <View key={line.label} style={styles.line}>
              <AppText variant="body">{line.label}</AppText>
              <AppText variant="bodyBold" color={colors.goldDeep}>
                +{line.xp} XP
              </AppText>
            </View>
          ))}
        </Card>
      ) : (
        <Card tone="alt">
          <AppText variant="small" color={colors.textMuted}>
            {t('reward.noXp')}
          </AppText>
        </Card>
      )}

      {outcome.unlockedWorlds.map((id) => {
        const world = getWorld(id);
        return world ? (
          <Card key={id} tone="gold">
            <View style={styles.line}>
              <Icon name="sparkle" size={22} color={colors.goldDeep} />
              <AppText variant="bodyBold" style={styles.flex}>
                {t('reward.worldUnlocked', { world: l(world.title) })}
              </AppText>
            </View>
          </Card>
        ) : null;
      })}

      <View style={styles.actions}>
        <Button label={primaryLabel} onPress={onPrimary} iconRight="chevron" variant="gold" />
        {onReview ? <Button label={t('reward.reviewMistakes')} icon="refresh" variant="secondary" onPress={onReview} /> : null}
        <Button label={t('reward.backToMap')} icon="map" variant="ghost" onPress={onBackToMap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  center: { alignItems: 'center' },
  line: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md, paddingVertical: 4 },
  flex: { flex: 1 },
  actions: { gap: spacing.sm },
});
