import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { LockedContent } from '@/components/ui/LockedContent';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getWorld } from '@/data';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { WorldProgress } from '@/hooks/useProgress';
import { colors, radius, shadow, spacing, worldThemes } from '@/theme';

interface WorldCardProps {
  progress: WorldProgress;
  onPress: () => void;
  compact?: boolean;
}

export function WorldCard({ progress, onPress, compact }: WorldCardProps) {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const { world, unlocked, complete, completed, total } = progress;
  const theme = worldThemes[world.id];
  const requirement = world.unlockRequirement;
  const requiredWorld = requirement ? getWorld(requirement.worldId) : undefined;

  const lockMessage =
    requirement && requiredWorld
      ? t('map.lockedRequirement', { count: requirement.questsCompleted, world: l(requiredWorld.title) })
      : t('world.locked');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${l(world.title)}. ${unlocked ? t('map.progress', { done: completed, total }) : lockMessage}`}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <SceneView scene={world.scene} height={compact ? 90 : 120} rounded={false} style={!unlocked ? styles.dim : undefined} />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <View style={styles.iconBubble}>
              <Icon name={unlocked ? theme.icon : 'lock'} size={20} color={colors.textOnDark} />
            </View>
            <View style={styles.titles}>
              <AppText variant="heading" color={colors.textOnDark} numberOfLines={1}>
                {l(world.title)}
              </AppText>
              <AppText variant="small" color={colors.textOnDarkMuted} numberOfLines={1}>
                {l(world.subtitle)}
              </AppText>
            </View>
            {complete ? <Icon name="trophy" size={24} color={colors.gold} /> : null}
          </View>
          {unlocked ? (
            <View style={styles.progressRow}>
              <ProgressBar progress={total ? completed / total : 0} color={colors.gold} trackColor="rgba(255,255,255,0.22)" height={8} style={styles.bar} />
              <AppText variant="tiny" color={colors.textOnDark}>
                {t('map.progress', { done: completed, total })}
              </AppText>
            </View>
          ) : (
            <LockedContent message={lockMessage} dark />
          )}
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, overflow: 'hidden', ...shadow.card },
  pressed: { opacity: 0.94, transform: [{ scale: 0.99 }] },
  gradient: { borderRadius: radius.lg, overflow: 'hidden' },
  dim: { opacity: 0.45 },
  body: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titles: { flex: 1 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bar: { flex: 1, width: undefined },
});
