import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/hooks/useI18n';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

interface StreakDisplayProps {
  days: number;
  activeToday: boolean;
  compact?: boolean;
  dark?: boolean;
}

export function StreakDisplay({ days, activeToday, compact, dark }: StreakDisplayProps) {
  const { t } = useI18n();
  const label = t(days === 1 ? 'streak.day' : 'streak.days', { count: days });
  const flameColor = activeToday ? '#F28C28' : dark ? colors.textOnDarkMuted : colors.locked;

  if (compact) {
    return (
      <View
        style={[styles.compact, dark && styles.compactDark]}
        accessible
        accessibilityLabel={`${t('streak.label')}: ${label}`}
      >
        <Icon name="flame" size={18} color={flameColor} />
        <AppText variant="small" color={dark ? colors.textOnDark : colors.text}>
          {days}
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.full} accessible accessibilityLabel={`${t('streak.label')}: ${label}`}>
      <View style={[styles.flameCircle, { backgroundColor: activeToday ? '#FFE7CF' : colors.cardAlt }]}>
        <Icon name="flame" size={26} color={flameColor} />
      </View>
      <View style={styles.texts}>
        <AppText variant="heading">{label}</AppText>
        <AppText variant="small" color={colors.textMuted}>
          {activeToday ? t('streak.today') : t('streak.notToday')}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  compactDark: { backgroundColor: 'rgba(255,255,255,0.14)' },
  full: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flameCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: { flex: 1 },
});
