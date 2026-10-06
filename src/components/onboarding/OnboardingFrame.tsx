import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { PatternBackground } from '@/components/ui/PatternBackground';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/hooks/useI18n';
import { colors, spacing } from '@/theme';

export const ONBOARDING_STEPS = 6;

interface OnboardingFrameProps {
  step: number;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
  showBack?: boolean;
}

/** Shared night-sky layout for every onboarding step. */
export function OnboardingFrame({ step, title, subtitle, children, footer, showBack = true }: OnboardingFrameProps) {
  const { t } = useI18n();
  return (
    <LinearGradient colors={[colors.night, '#2B2F72']} style={styles.root}>
      <PatternBackground />
      <SafeAreaView style={styles.root} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.topRow}>
            {showBack ? <TopBar dark onBack={() => router.back()} /> : <View style={styles.spacer} />}
          </View>
          <View
            style={styles.dots}
            accessible
            accessibilityLabel={t('onboarding.step', { current: step, total: ONBOARDING_STEPS })}
          >
            {Array.from({ length: ONBOARDING_STEPS }, (_, i) => (
              <View key={i} style={[styles.dot, i < step && styles.dotOn, i === step - 1 && styles.dotCurrent]} />
            ))}
          </View>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {title ? (
              <AppText variant="display" color={colors.textOnDark} align="center" accessibilityRole="header">
                {title}
              </AppText>
            ) : null}
            {subtitle ? (
              <AppText variant="body" color={colors.textOnDarkMuted} align="center">
                {subtitle}
              </AppText>
            ) : null}
            {children}
          </ScrollView>
          <View style={styles.footer}>{footer}</View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topRow: { minHeight: 56 },
  spacer: { height: 56 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  dotOn: { backgroundColor: colors.gold },
  dotCurrent: { width: 22 },
  content: { padding: spacing.xl, gap: spacing.lg, flexGrow: 1 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.lg, gap: spacing.sm },
});
