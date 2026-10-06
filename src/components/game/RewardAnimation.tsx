import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { colors } from '@/theme';

interface RewardAnimationProps {
  xp: number;
  label: string;
}

/** Glowing star burst with an XP counter that counts up. Static when reduced motion is on. */
export function RewardAnimation({ xp, label }: RewardAnimationProps) {
  const reduced = useReducedMotion();
  const [scale] = useState(() => new Animated.Value(reduced ? 1 : 0.4));
  const [spin] = useState(() => new Animated.Value(0));
  const [counter] = useState(() => new Animated.Value(0));
  const [counted, setCounted] = useState(0);
  const shown = reduced ? xp : counted;

  useEffect(() => {
    if (reduced) return;
    const id = counter.addListener(({ value }) => setCounted(Math.round(value)));
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.timing(counter, { toValue: xp, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.loop(Animated.timing(spin, { toValue: 1, duration: 12000, easing: Easing.linear, useNativeDriver: true })),
    ]).start();
    return () => counter.removeListener(id);
  }, [counter, reduced, scale, spin, xp]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.root} accessible accessibilityLabel={`${label}: +${xp} XP`}>
      <Animated.View style={[styles.rays, { transform: [{ rotate }] }]}>
        {Array.from({ length: 8 }, (_, i) => (
          <View key={i} style={[styles.ray, { transform: [{ rotate: `${i * 45}deg` }] }]} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.medal, { transform: [{ scale }] }]}>
        <Icon name="star" size={64} color={colors.gold} />
      </Animated.View>
      <AppText variant="display" color={colors.goldDeep} align="center">
        +{shown} XP
      </AppText>
      <AppText variant="small" color={colors.textMuted} align="center">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', justifyContent: 'center', paddingTop: 8 },
  rays: { position: 'absolute', top: 0, width: 160, height: 160, alignItems: 'center', justifyContent: 'center' },
  ray: { position: 'absolute', width: 8, height: 160, borderRadius: 4, backgroundColor: 'rgba(242,181,68,0.18)' },
  medal: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 4,
    borderColor: colors.gold,
  },
});
