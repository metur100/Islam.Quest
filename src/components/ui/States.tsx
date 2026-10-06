import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  body?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'sparkle', title, body, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.iconCircle}>
        <Icon name={icon} size={34} color={colors.primary} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.textMuted} align="center">
          {body}
        </AppText>
      ) : null}
      {actionLabel && onAction ? <Button label={actionLabel} onPress={onAction} fullWidth={false} /> : null}
    </View>
  );
}

export function LoadingState({ label }: { label?: string }) {
  return (
    <View style={[styles.root, styles.fill]} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator size="large" color={colors.gold} />
      {label ? (
        <AppText variant="small" color={colors.textMuted}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

interface ErrorStateProps {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
}

export function ErrorState({ title, body, actionLabel, onAction }: ErrorStateProps) {
  return (
    <View style={[styles.root, styles.fill]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.errorSoft }]}>
        <Icon name="info" size={34} color={colors.error} />
      </View>
      <AppText variant="heading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color={colors.textMuted} align="center">
        {body}
      </AppText>
      <Button label={actionLabel} onPress={onAction} fullWidth={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl },
  fill: { flex: 1 },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
