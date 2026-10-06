import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { LessonCard } from '@/components/game/LessonCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Icon } from '@/components/ui/Icon';
import { LockedContent } from '@/components/ui/LockedContent';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { CONTENT_GRAPH, getQuestion, orderedLessonsOfWorld, questForLesson } from '@/data';
import { SURAHS } from '@/data/quran';
import { useI18n } from '@/hooks/useI18n';
import { useProgress } from '@/hooks/useProgress';
import { topicWeakness } from '@/services/review';
import { questStatus } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, spacing, worldThemes } from '@/theme';

export default function Learn() {
  const { t, l } = useI18n();
  const progress = useProgress();
  const game = useGameStore((s) => s.game);

  const weakTopics = Object.entries(topicWeakness(Object.values(game.review)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([topic]) => {
      const example = Object.values(game.review).find((r) => r.topic === topic);
      const question = example ? getQuestion(example.questionId) : undefined;
      return { topic, worldId: question?.worldId, prompt: question ? l(question.prompt) : topic };
    });

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <HeroHeader>
        <AppText variant="display" color={colors.textOnDark} accessibilityRole="header">
          {t('learn.title')}
        </AppText>
        <AppText variant="body" color={colors.textOnDarkMuted}>
          {t('learn.subtitle')}
        </AppText>
      </HeroHeader>

      <View style={styles.body}>
        <Card tone="primary">
          <View style={styles.row}>
            <Icon name="refresh" size={28} color={colors.primary} />
            <View style={styles.flex}>
              <AppText variant="heading">{t('learn.review.title')}</AppText>
              <AppText variant="small" color={colors.textMuted}>
                {t('learn.review.body')}
              </AppText>
            </View>
          </View>
          <View style={styles.reviewFooter}>
            <AppText variant="bodyBold" color={progress.dueReviews.length ? colors.primaryDark : colors.textMuted}>
              {progress.dueReviews.length ? t('learn.review.due', { count: progress.dueReviews.length }) : t('learn.review.none')}
            </AppText>
            <Button label={t('learn.review.cta')} fullWidth={false} size="md" onPress={() => router.push('/review')} />
          </View>
        </Card>

        {weakTopics.length > 0 ? (
          <>
            <SectionHeader title={t('learn.weakTopics')} />
            {weakTopics.map((w) => (
              <View key={w.topic} style={styles.weak}>
                <View style={[styles.weakDot, { backgroundColor: w.worldId ? worldThemes[w.worldId].accent : colors.gold }]} />
                <AppText variant="small" style={styles.flex} numberOfLines={2}>
                  {w.prompt}
                </AppText>
              </View>
            ))}
          </>
        ) : null}

        <SectionHeader title={t('learn.quran')} />
        <View style={styles.surahGrid}>
          {SURAHS.map((surah) => {
            const count = game.recitePractice[String(surah.number)] ?? 0;
            return (
              <View key={surah.number} style={styles.surah} accessible accessibilityLabel={`${surah.nameTransliterated}: ${count ? t('learn.practised', { count }) : t('learn.notPractised')}`}>
                <AppText variant="heading" script="arabic" align="center" color={colors.goldDeep}>
                  {surah.nameArabic}
                </AppText>
                <AppText variant="tiny" align="center">
                  {surah.nameTransliterated}
                </AppText>
                <AppText variant="tiny" align="center" color={count ? colors.success : colors.textMuted}>
                  {count ? t('learn.practised', { count }) : t('learn.notPractised')}
                </AppText>
              </View>
            );
          })}
        </View>

        <SectionHeader title={t('learn.topics')} />
        {progress.worlds.map((w) => {
          const lessons = orderedLessonsOfWorld(w.world.id);
          const done = lessons.filter((lesson) => game.completedLessons.includes(lesson.id)).length;
          return (
            <View key={w.world.id} style={styles.worldBlock}>
              <View style={styles.worldHeader}>
                <View style={[styles.worldIcon, { backgroundColor: worldThemes[w.world.id].accent }]}>
                  <Icon name={worldThemes[w.world.id].icon} size={18} color="#FFFFFF" />
                </View>
                <AppText variant="heading" style={styles.flex}>
                  {l(w.world.title)}
                </AppText>
                <AppText variant="small" color={colors.textMuted}>
                  {t('learn.lessonsCount', { done, total: lessons.length })}
                </AppText>
              </View>
              {w.unlocked ? (
                lessons.map((lesson) => {
                  const quest = questForLesson(lesson.id);
                  const locked =
                    !game.completedLessons.includes(lesson.id) &&
                    (!quest || questStatus(quest, game.quests, CONTENT_GRAPH) === 'locked');
                  return (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      completed={game.completedLessons.includes(lesson.id)}
                      locked={locked}
                      onPress={() => router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })}
                    />
                  );
                })
              ) : (
                <LockedContent message={t('learn.worldLocked')} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  scroll: { paddingBottom: spacing.xxl },
  body: { padding: spacing.lg, gap: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  flex: { flex: 1 },
  reviewFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.md },
  weak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  weakDot: { width: 12, height: 12, borderRadius: 6 },
  surahGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  surah: {
    width: '31.5%',
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  worldBlock: { gap: spacing.sm },
  worldHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  worldIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
