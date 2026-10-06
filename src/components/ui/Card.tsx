import React from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useFeedback } from '@/hooks/useFeedback';
import { colors, radius, shadow, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  tone?: 'default' | 'alt' | 'gold' | 'primary' | 'dark';
  padded?: boolean;
  disabled?: boolean;
}

const TONES = {
  default: { backgroundColor: colors.card, borderColor: colors.border },
  alt: { backgroundColor: colors.cardAlt, borderColor: colors.border },
  gold: { backgroundColor: colors.goldSoft, borderColor: '#F0D49A' },
  primary: { backgroundColor: colors.primarySoft, borderColor: '#B4E0D9' },
  dark: { backgroundColor: colors.nightSoft, borderColor: colors.nightLine },
};

export function Card({
  children,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  tone = 'default',
  padded = true,
  disabled,
}: CardProps) {
  const feedback = useFeedback();
  const content = [styles.card, TONES[tone], padded && styles.padded, style];

  if (!onPress) {
    return (
      <View style={content} accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [...content, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.card,
  },
  padded: { padding: spacing.lg },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
});
