import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

/** Explains why something is locked and what unlocks it. */
export function LockedContent({ message, dark }: { message: string; dark?: boolean }) {
  return (
    <View style={[styles.root, dark && styles.dark]} accessible accessibilityLabel={message}>
      <Icon name="lock" size={18} color={dark ? colors.textOnDark : colors.textMuted} />
      <AppText variant="small" color={dark ? colors.textOnDark : colors.textMuted} style={styles.text}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  dark: { backgroundColor: 'rgba(0,0,0,0.28)' },
  text: { flex: 1 },
});
