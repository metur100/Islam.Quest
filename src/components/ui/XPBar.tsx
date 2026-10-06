import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/hooks/useI18n';
import { levelInfo } from '@/services/xp';
import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';

interface XPBarProps {
  xp: number;
  dark?: boolean;
}

export function XPBar({ xp, dark }: XPBarProps) {
  const { t } = useI18n();
  const info = levelInfo(xp);
  const fg = dark ? colors.textOnDark : colors.text;
  const muted = dark ? colors.textOnDarkMuted : colors.textMuted;

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.levelPill}>
          <AppText variant="small" color={colors.night}>
            {t('common.level', { level: info.level })}
          </AppText>
        </View>
        <AppText variant="small" color={muted}>
          {info.xpIntoLevel} / {info.xpForNextLevel} XP
        </AppText>
      </View>
      <ProgressBar
        progress={info.progress}
        color={colors.gold}
        trackColor={dark ? 'rgba(255,255,255,0.18)' : 'rgba(29,31,51,0.08)'}
        accessibilityLabel={t('a11y.xpBar', { xp: info.xpIntoLevel, total: info.xpForNextLevel })}
      />
      <AppText variant="tiny" color={fg} style={styles.next}>
        {t('profile.xpToNext', { xp: info.xpForNextLevel - info.xpIntoLevel, level: info.level + 1 })}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelPill: {
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 2,
  },
  next: { opacity: 0.85 },
});
