import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useFeedback } from '@/hooks/useFeedback';
import { colors, radius, spacing, TOUCH_TARGET } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'danger' | 'light';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'md' | 'lg';
  style?: ViewStyle;
  accessibilityHint?: string;
  silent?: boolean;
}

const PALETTE: Record<Variant, { bg: string; fg: string; border?: string; pressed: string }> = {
  primary: { bg: colors.primary, fg: colors.textOnDark, pressed: colors.primaryDark },
  secondary: { bg: colors.card, fg: colors.primaryDark, border: colors.border, pressed: colors.cardAlt },
  gold: { bg: colors.gold, fg: colors.night, pressed: '#E0A12F' },
  ghost: { bg: 'transparent', fg: colors.primaryDark, pressed: 'rgba(15,122,110,0.08)' },
  danger: { bg: colors.error, fg: colors.textOnDark, pressed: '#9E2E22' },
  light: { bg: 'rgba(255,255,255,0.14)', fg: colors.textOnDark, border: 'rgba(255,255,255,0.3)', pressed: 'rgba(255,255,255,0.24)' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  fullWidth = true,
  size = 'lg',
  style,
  accessibilityHint,
  silent,
}: ButtonProps) {
  const palette = PALETTE[variant];
  const feedback = useFeedback();
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={() => {
        if (!silent) feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: size === 'lg' ? 54 : TOUCH_TARGET,
          backgroundColor: pressed ? palette.pressed : palette.bg,
          borderColor: palette.border ?? 'transparent',
          borderWidth: palette.border ? 1.5 : 0,
          opacity: inactive ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.fg} />
      ) : (
        <View style={styles.row}>
          {icon ? <Icon name={icon} size={20} color={palette.fg} /> : null}
          <AppText variant="bodyBold" color={palette.fg} align="center" style={styles.label}>
            {label}
          </AppText>
          {iconRight ? <Icon name={iconRight} size={20} color={palette.fg} /> : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { flexShrink: 1 },
});
