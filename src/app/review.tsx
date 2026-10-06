import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardAnimation } from '@/components/game/RewardAnimation';
import { QuestionView } from '@/components/questions/QuestionView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { getQuestion } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import type { Question } from '@/models';
import { dueItems, nextReviewDate } from '@/services/review';
import { useGameStore } from '@/store/gameStore';
import { LOCALE_TAGS } from '@/localization/i18n';
import { colors, spacing } from '@/theme';

const SESSION_SIZE = 8;

/** "Let's Review": due questions from the spaced-review queue, weakest first. */
export default function ReviewScreen() {
  const { t, language } = useI18n();
  const review = useGameStore((s) => s.game.review);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeSession = useGameStore((s) => s.completeReviewSession);

  // The session is fixed when the screen opens so answering doesn't reshuffle the queue.
  const [session] = useState<Question[]>(() =>
    dueItems(review, new Date().toISOString())
      .slice(0, SESSION_SIZE)
      .map((item) => getQuestion(item.questionId))
      .filter((q): q is Question => q !== undefined),
  );
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  if (session.length === 0) {
    const next = nextReviewDate(review);
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <EmptyState
          icon="check"
          title={t('review.empty.title')}
          body={
            next
              ? `${t('review.empty.body')} ${t('review.empty.next', {
                  date: new Date(next).toLocaleDateString(LOCALE_TAGS[language], { weekday: 'long', day: 'numeric', month: 'long' }),
                })}`
              : t('review.empty.noItems')
          }
          actionLabel={t('common.back')}
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  if (finished) {
    const correct = results.filter(Boolean).length;
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <AppText variant="title" align="center">
          {t('review.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t('review.doneBody', { correct, total: results.length })} />
        <Button label={t('common.done')} onPress={() => router.back()} />
      </Screen>
    );
  }

  if (!started) {
    return (
      <Screen header={<TopBar title={t('review.title')} />}>
        <Card tone="primary">
          <AppText variant="heading">{t('review.title')}</AppText>
          <AppText variant="body" color={colors.textMuted}>
            {t('review.intro')}
          </AppText>
        </Card>
        <Button label={t('review.start', { count: session.length })} icon="play" onPress={() => setStarted(true)} />
      </Screen>
    );
  }

  const question = session[index];
  const next = () => {
    if (index + 1 < session.length) setIndex(index + 1);
    else {
      completeSession();
      setFinished(true);
    }
  };

  return (
    <Screen
      header={
        <View>
          <TopBar title={t('review.title')} backIcon="close" />
          <View style={styles.progress}>
            <ProgressBar progress={index / session.length} />
          </View>
        </View>
      }
    >
      <QuestionView
        key={question.id}
        question={question}
        onResult={(correct) => {
          setResults((r) => [...r, correct]);
          setXp((x) => x + recordAnswer(question, correct, 'review'));
        }}
        onContinue={next}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
});
