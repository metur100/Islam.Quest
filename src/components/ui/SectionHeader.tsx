import { Pressable, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  dark?: boolean;
}

export function SectionHeader({ title, actionLabel, onAction, dark }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="heading" color={dark ? colors.textOnDark : colors.text} accessibilityRole="header">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" hitSlop={10} style={styles.action}>
          <AppText variant="small" color={dark ? colors.gold : colors.primary}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  action: { minHeight: 36, justifyContent: 'center', paddingHorizontal: spacing.xs },
});
