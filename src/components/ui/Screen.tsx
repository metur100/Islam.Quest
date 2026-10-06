import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  background?: string;
  contentStyle?: ViewStyle;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

/** Safe-area aware page container with optional scrolling, sticky header and footer. */
export function Screen({
  children,
  scroll = true,
  edges = ['top', 'left', 'right'],
  background = colors.sand,
  contentStyle,
  header,
  footer,
}: ScreenProps) {
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]} edges={edges}>
      <StatusBar style={background === colors.sand || background === colors.card ? 'dark' : 'light'} />
      {header}
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill, contentStyle]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.lg },
});
