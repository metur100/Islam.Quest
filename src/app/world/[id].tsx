import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LessonCard } from '@/components/game/LessonCard';
import { QuestCard } from '@/components/game/QuestCard';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { LockedContent } from '@/components/ui/LockedContent';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { CONTENT_GRAPH, getWorld, orderedLessonsOfWorld, questForLesson } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import { currentQuest, isWorldUnlocked, questStatus, questsOfWorld } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing, worldThemes } from '@/theme';

export default function WorldScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useI18n();
  const insets = useSafeAreaInsets();
  const game = useGameStore((s) => s.game);
  const world = getWorld(String(id));

  if (!world) {
    return (
      <Screen>
        <TopBar />
        <EmptyState icon="map" title={t('notFound.title')} body={t('notFound.body')} />
      </Screen>
    );
  }

  const theme = worldThemes[world.id];
  const unlocked = isWorldUnlocked(world, game.quests, CONTENT_GRAPH);
  const quests = questsOfWorld(world.id, CONTENT_GRAPH);
  const done = quests.filter((q) => game.quests[q.id]?.completed).length;
  const next = currentQuest(game.quests, CONTENT_GRAPH);
  const lessons = orderedLessonsOfWorld(world.id);
  const requirement = world.unlockRequirement;
  const requiredWorld = requirement ? getWorld(requirement.worldId) : undefined;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={theme.gradient} style={[styles.header, { paddingTop: insets.top }]}>
          <TopBar dark title={l(world.title)} />
          <SceneView scene={world.scene} height={170} />
          <AppText variant="body" color={colors.textOnDark}>
            {l(world.description)}
          </AppText>
          <View style={styles.progressRow}>
            <ProgressBar progress={quests.length ? done / quests.length : 0} color={colors.gold} trackColor="rgba(255,255,255,0.22)" style={styles.flex} />
            <AppText variant="small" color={colors.textOnDark}>
              {t('map.progress', { done, total: quests.length })}
            </AppText>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {!unlocked && requirement && requiredWorld ? (
            <LockedContent message={t('map.lockedRequirement', { count: requirement.questsCompleted, world: l(requiredWorld.title) })} />
          ) : null}

          <SectionHeader title={t('world.quests')} />
          {quests.map((quest) => {
            const status = questStatus(quest, game.quests, CONTENT_GRAPH);
            return (
              <QuestCard
                key={quest.id}
                quest={quest}
                status={status}
                stars={game.quests[quest.id]?.bestStars ?? 0}
                isCurrent={next?.id === quest.id}
                onPress={() => {
                  if (status !== 'locked') router.push({ pathname: '/quest/[id]', params: { id: quest.id } });
                }}
              />
            );
          })}

          {unlocked ? (
            <>
              <SectionHeader title={t('world.lessons')} />
              {lessons.map((lesson) => {
                const quest = questForLesson(lesson.id);
                const read = game.completedLessons.includes(lesson.id);
                const locked = !read && (!quest || questStatus(quest, game.quests, CONTENT_GRAPH) === 'locked');
                return (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    completed={read}
                    locked={locked}
                    onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
                  />
                );
              })}
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  flex: { flex: 1, width: undefined },
  body: { padding: spacing.lg, gap: spacing.md },
});
