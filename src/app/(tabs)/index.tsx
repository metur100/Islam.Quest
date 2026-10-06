import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { CharacterCard } from '@/components/character/CharacterCard';
import { WorldCard } from '@/components/game/WorldCard';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Icon } from '@/components/ui/Icon';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StreakDisplay } from '@/components/ui/StreakDisplay';
import { XPBar } from '@/components/ui/XPBar';
import { FACTS, QUESTIONS } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { dailyChallengeFor } from '@/services/daily';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing, worldThemes } from '@/theme';

export default function Home() {
  const { t, l } = useI18n();
  const profile = useGameStore((s) => s.game.profile);
  const xp = useGameStore((s) => s.game.xp);
  const progress = useProgress();
  const daily = dailyChallengeFor(progress.today, { questions: QUESTIONS, facts: FACTS });
  const next = progress.nextQuest;
  const unlockedWorlds = progress.worlds.filter((w) => w.unlocked);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <View style={styles.headerRow}>
          <View style={styles.flex}>
            <CharacterCard character={profile.character} name={profile.name} level={progress.level.level} dark />
          </View>
          <StreakDisplay days={progress.streak} activeToday={progress.activeToday} compact dark />
        </View>
        <AppText variant="heading" color={colors.textOnDark}>
          {t('home.greeting', { name: profile.name })}
        </AppText>
        <AppText variant="body" color={colors.textOnDarkMuted}>
          {t('home.subtitle')}
        </AppText>
        <XPBar xp={xp} dark />
      </HeroHeader>

      <View style={styles.body}>
        <Card tone="gold" onPress={() => router.push('/daily')} accessibilityLabel={`${t('home.daily.title')}: ${t(`daily.kind.${daily.kind}`)}`}>
          <View style={styles.row}>
            <View style={[styles.iconCircle, { backgroundColor: colors.gold }]}>
              <Icon name={progress.dailyDone ? 'check' : 'sun'} size={26} color={colors.night} />
            </View>
            <View style={styles.flex}>
              <AppText variant="label" color={colors.goldDeep}>
                {t('home.daily.title').toUpperCase()}
              </AppText>
              <AppText variant="heading">{t(`daily.kind.${daily.kind}`)}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {progress.dailyDone ? t('home.daily.done') : t('home.daily.body')}
              </AppText>
            </View>
            {!progress.dailyDone ? (
              <View style={styles.xpPill}>
                <AppText variant="tiny" color={colors.night}>
                  +25 XP
                </AppText>
              </View>
            ) : null}
          </View>
        </Card>

        <SectionHeader title={t('home.continue.title')} />
        {next ? (
          <Card padded={false} onPress={() => router.push({ pathname: '/quest/[id]', params: { id: next.id } })} accessibilityLabel={l(next.title)}>
            <SceneView scene={progress.worlds.find((w) => w.world.id === next.worldId)!.world.scene} height={110} rounded={false} />
            <View style={styles.continueBody}>
              <View style={styles.flex}>
                <AppText variant="label" color={worldThemes[next.worldId].accent}>
                  {l(progress.worlds.find((w) => w.world.id === next.worldId)!.world.title).toUpperCase()}
                </AppText>
                <AppText variant="heading">{l(next.title)}</AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {l(next.description)}
                </AppText>
              </View>
              <View style={[styles.playButton, { backgroundColor: worldThemes[next.worldId].accent }]}>
                <Icon name="play" size={22} color="#FFFFFF" />
              </View>
            </View>
          </Card>
        ) : (
          <Card tone="primary">
            <AppText variant="bodyBold">{t('home.continue.allDone')}</AppText>
          </Card>
        )}

        <View style={styles.twoCol}>
          <Card style={styles.flex} onPress={() => router.push('/review')} accessibilityLabel={t('home.review.title')}>
            <Icon name="refresh" size={26} color={colors.primary} />
            <AppText variant="bodyBold" style={styles.mt}>
              {t('home.review.title')}
            </AppText>
            <AppText variant="small" color={colors.textMuted}>
              {progress.dueReviews.length > 0 ? t('home.review.count', { count: progress.dueReviews.length }) : t('home.review.empty')}
            </AppText>
          </Card>
          <Card style={styles.flex} onPress={() => router.push('/ramadan')} accessibilityLabel={t('home.ramadan')}>
            <Icon name="moon" size={26} color={worldThemes.ramadan.accent} />
            <AppText variant="bodyBold" style={styles.mt}>
              {t('home.ramadan')}
            </AppText>
            <AppText variant="small" color={colors.textMuted}>
              {t('home.ramadan.body')}
            </AppText>
          </Card>
        </View>

        <SectionHeader title={t('home.worlds')} actionLabel={t('tabs.quest')} onAction={() => router.navigate('/(tabs)/quest')} />
        {unlockedWorlds.map((w) => (
          <WorldCard key={w.world.id} progress={w} compact onPress={() => router.push({ pathname: '/world/[id]', params: { id: w.world.id } })} />
        ))}
        {unlockedWorlds.length < progress.worlds.length ? (
          <Button label={t('map.title')} variant="secondary" icon="map" onPress={() => router.navigate('/(tabs)/quest')} />
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1 },
  body: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  iconCircle: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  xpPill: { backgroundColor: colors.card, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  continueBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  playButton: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  mt: { marginTop: spacing.sm },
});
