import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/hooks/useI18n';
import { LOCALE_TAGS, type TranslationKey } from '@/localization/i18n';
import { BADGES } from '@/services/badges';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, spacing } from '@/theme';

export default function BadgesScreen() {
  const { t, language } = useI18n();
  const badges = useGameStore((s) => s.game.badges);
  const earned = BADGES.filter((b) => badges[b.id]).length;

  return (
    <Screen header={<TopBar title={t('badges.title')} />}>
      <AppText variant="bodyBold" align="center" color={colors.textMuted}>
        {t('profile.badgesCount', { earned, total: BADGES.length })}
      </AppText>
      {BADGES.map((badge) => {
        const date = badges[badge.id];
        return (
          <View key={badge.id} style={[styles.row, !date && styles.locked]}>
            <Badge id={badge.id} earned={!!date} size={64} showLabel={false} />
            <View style={styles.texts}>
              <AppText variant="bodyBold">{t(`badge.${badge.id}.name` as TranslationKey)}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {t(`badge.${badge.id}.desc` as TranslationKey)}
              </AppText>
              <AppText variant="tiny" color={date ? colors.success : colors.textMuted}>
                {date
                  ? t('badges.earnedOn', { date: new Date(date).toLocaleDateString(LOCALE_TAGS[language]) })
                  : t('badges.locked')}
              </AppText>
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locked: { opacity: 0.75 },
  texts: { flex: 1, gap: 2 },
});
