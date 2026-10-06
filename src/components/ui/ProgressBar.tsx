import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type ViewStyle } from 'react-native';

import { useI18n } from '@/hooks/useI18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors, radius } from '@/theme';

interface ProgressBarProps {
  /** 0..1 */
  progress: number;
  color?: string;
  trackColor?: string;
  height?: number;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function ProgressBar({
  progress,
  color = colors.primary,
  trackColor = 'rgba(29,31,51,0.08)',
  height = 10,
  style,
  accessibilityLabel,
}: ProgressBarProps) {
  const reduced = useReducedMotion();
  const { t } = useI18n();
  const clamped = Math.max(0, Math.min(1, progress));
  const [anim] = useState(() => new Animated.Value(clamped));

  useEffect(() => {
    if (reduced) {
      anim.setValue(clamped);
      return;
    }
    Animated.timing(anim, { toValue: clamped, duration: 500, useNativeDriver: false }).start();
  }, [anim, clamped, reduced]);

  const percent = Math.round(clamped * 100);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? t('a11y.progress', { percent })}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { height, backgroundColor: trackColor, borderRadius: height }, style]}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            backgroundColor: color,
            borderRadius: height,
            width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { overflow: 'hidden', width: '100%', borderRadius: radius.pill },
  fill: { height: '100%' },
});
