import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { LockedContent } from '@/components/ui/LockedContent';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TopBar } from '@/components/ui/TopBar';
import { CONTENT_GRAPH, FACTS, getWorld, GOOD_DEEDS } from '@/data';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { isWorldUnlocked } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, spacing, worldThemes } from '@/theme';

const DAYS = Array.from({ length: 30 }, (_, i) => i + 1);

/** Ramadan calendar with a personal good-deed tracker. It never tracks or encourages fasting itself. */
export default function RamadanScreen() {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const deeds = useGameStore((s) => s.game.ramadanDeeds);
  const quests = useGameStore((s) => s.game.quests);
  const toggle = useGameStore((s) => s.toggleRamadanDeed);
  const [day, setDay] = useState(1);
  const accent = worldThemes.ramadan.accent;
  const world = getWorld('ramadan');
  const unlocked = world ? isWorldUnlocked(world, quests, CONTENT_GRAPH) : false;
  const total = Object.values(deeds).reduce((sum, list) => sum + list.length, 0);
  const tips = FACTS.filter((f) => f.worldId === 'ramadan' || f.worldId === 'akhlaq');
  const tip = tips[(day - 1) % tips.length];
  const selected = deeds[String(day)] ?? [];

  return (
    <Screen header={<TopBar title={t('ramadan.title')} />}>
      <SceneView scene={{ sky: 'dusk', elements: ['stars', 'crescent', 'dunes', 'mosque', 'lanterns'] }} height={150} />
      <AppText variant="body">{t('ramadan.intro')}</AppText>
      <Card tone="primary">
        <View style={styles.row}>
          <Icon name="shield" size={22} color={colors.primary} />
          <AppText variant="small" style={styles.flex}>
            {t('ramadan.safety')}
          </AppText>
        </View>
      </Card>

      <AppText variant="bodyBold" color={accent}>
        {t('ramadan.total', { count: total })}
      </AppText>

      <View style={styles.grid}>
        {DAYS.map((d) => {
          const count = deeds[String(d)]?.length ?? 0;
          const active = d === day;
          return (
            <Pressable
              key={d}
              onPress={() => {
                feedback.tap();
                setDay(d);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${t('ramadan.day', { day: d })}, ${count}`}
              style={[styles.day, count > 0 && { backgroundColor: `${accent}22`, borderColor: accent }, active && { backgroundColor: accent, borderColor: accent }]}
            >
              <AppText variant="bodyBold" color={active ? '#FFFFFF' : colors.text}>
                {d}
              </AppText>
              {count > 0 ? (
                <View style={styles.dots}>
                  {Array.from({ length: Math.min(count, 4) }, (_, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: active ? '#FFFFFF' : accent }]} />
                  ))}
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={t('ramadan.deedsFor', { day })} />
      <Card>
        {GOOD_DEEDS.map((deed) => {
          const checked = selected.includes(deed.id);
          return (
            <Pressable
              key={deed.id}
              onPress={() => {
                feedback.tap();
                toggle(day, deed.id);
              }}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={l(deed.label)}
              style={styles.deed}
            >
              <View style={[styles.check, checked && { backgroundColor: colors.success, borderColor: colors.success }]}>
                {checked ? <Icon name="check" size={18} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <AppText variant="body" style={styles.flex}>
                {l(deed.label)}
              </AppText>
            </Pressable>
          );
        })}
      </Card>

      {tip ? (
        <Card tone="gold">
          <AppText variant="label" color={colors.goldDeep}>
            {t('ramadan.tip').toUpperCase()}
          </AppText>
          <AppText variant="body" style={styles.tip}>
            {l(tip.text)}
          </AppText>
        </Card>
      ) : null}

      {unlocked && world ? (
        <Button
          label={t('ramadan.learnMore')}
          icon="moon"
          variant="secondary"
          onPress={() => router.push({ pathname: '/world/[id]', params: { id: world.id } })}
        />
      ) : (
        <LockedContent message={t('ramadan.locked')} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  flex: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'space-between' },
  day: {
    width: '15%',
    aspectRatio: 1,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', gap: 2, marginTop: 2 },
  dot: { width: 4, height: 4, borderRadius: 2 },
  deed: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tip: { marginTop: spacing.xs },
});
