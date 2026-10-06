import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { WorldCard } from '@/components/game/WorldCard';
import { AppText } from '@/components/ui/AppText';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { QUESTS } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { colors, spacing } from '@/theme';

/** World map: worlds as stations on a path, each unlocking the next. */
export default function QuestMap() {
  const { t } = useI18n();
  const progress = useProgress();
  const total = QUESTS.length;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={colors.textOnDark} accessibilityRole="header">
          {t('map.title')}
        </AppText>
        <AppText variant="body" color={colors.textOnDarkMuted}>
          {t('map.subtitle')}
        </AppText>
        <View style={styles.totalRow}>
          <Icon name="flag" size={20} color={colors.gold} />
          <AppText variant="bodyBold" color={colors.textOnDark}>
            {t('map.progress', { done: progress.completedQuests, total })}
          </AppText>
        </View>
        <ProgressBar progress={progress.completedQuests / total} color={colors.gold} trackColor="rgba(255,255,255,0.2)" />
      </HeroHeader>

      <View style={styles.path}>
        {progress.worlds.map((w, index) => (
          <View key={w.world.id}>
            {index > 0 ? (
              <View style={styles.connector} accessibilityElementsHidden importantForAccessibility="no">
                {[0, 1, 2].map((d) => (
                  <View key={d} style={[styles.connectorDot, w.unlocked && styles.connectorDotOn]} />
                ))}
              </View>
            ) : null}
            <View style={styles.station}>
              <View style={[styles.stationNumber, w.complete && styles.stationDone, !w.unlocked && styles.stationLocked]}>
                {w.complete ? (
                  <Icon name="check" size={18} color="#FFFFFF" strokeWidth={3} />
                ) : (
                  <AppText variant="bodyBold" color="#FFFFFF">
                    {index + 1}
                  </AppText>
                )}
              </View>
              <View style={styles.flex}>
                <WorldCard progress={w} onPress={() => router.push({ pathname: '/world/[id]', params: { id: w.world.id } })} />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  totalRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  path: { padding: spacing.lg },
  station: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  stationNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  stationDone: { backgroundColor: colors.success },
  stationLocked: { backgroundColor: colors.locked },
  flex: { flex: 1 },
  connector: { width: 34, alignItems: 'center', gap: 5, paddingVertical: 6 },
  connectorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  connectorDotOn: { backgroundColor: colors.gold },
});
