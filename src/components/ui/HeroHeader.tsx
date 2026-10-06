import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

import { PatternBackground } from './PatternBackground';

interface HeroHeaderProps {
  children: React.ReactNode;
  gradient?: [string, string];
}

/** Night-sky header with geometric pattern, used at the top of the main tabs. */
export function HeroHeader({ children, gradient = [colors.night, '#2E3380'] }: HeroHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient colors={gradient} style={[styles.root, { paddingTop: insets.top + spacing.lg }]}>
      <PatternBackground />
      <View style={styles.content}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  content: { gap: spacing.lg },
});
