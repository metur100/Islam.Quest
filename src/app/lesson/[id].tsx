import { router, useLocalSearchParams } from 'expo-router';

import { LessonView } from '@/components/steps/LessonView';
import { Button } from '@/components/ui/Button';
import { LockedContent } from '@/components/ui/LockedContent';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { CONTENT_GRAPH, getLesson, questForLesson } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import { questStatus } from '@/services/unlocking';
import { useGameStore } from '@/store/gameStore';

/** Lesson re-reading from the Learn tab. XP for a lesson is only granted once. */
export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, l } = useI18n();
  const game = useGameStore((s) => s.game);
  const completeLesson = useGameStore((s) => s.completeLesson);
  const lesson = getLesson(String(id));

  if (!lesson) {
    return (
      <Screen header={<TopBar />}>
        <EmptyState icon="book" title={t('lesson.notFound')} />
      </Screen>
    );
  }

  const quest = questForLesson(lesson.id);
  const read = game.completedLessons.includes(lesson.id);
  const locked = !read && (!quest || questStatus(quest, game.quests, CONTENT_GRAPH) === 'locked');

  return (
    <Screen header={<TopBar title={l(lesson.title)} />}>
      {locked && quest ? (
        <LockedContent message={t('lesson.locked', { quest: l(quest.title) })} />
      ) : (
        <>
          <LessonView lesson={lesson} />
          <Button
            label={read ? t('common.done') : t('lesson.done')}
            icon="check"
            onPress={() => {
              completeLesson(lesson.id);
              router.back();
            }}
          />
        </>
      )}
    </Screen>
  );
}
