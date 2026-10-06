import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RewardAnimation } from '@/components/game/RewardAnimation';
import { QuestionView } from '@/components/questions/QuestionView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { SourceList } from '@/components/ui/SourceList';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { FACTS, getFact, getQuestion, QUESTIONS } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import type { Question } from '@/models';
import { dailyChallengeFor } from '@/services/daily';
import { useGameStore } from '@/store/gameStore';
import { colors, spacing } from '@/theme';
import { toDayKey } from '@/utils/date';

/** One offline challenge per calendar day, chosen deterministically from local content. */
export default function DailyScreen() {
  const { t, l } = useI18n();
  const [day] = useState(() => toDayKey(new Date()));
  const doneToday = useGameStore((s) => s.game.dailyCompleted.includes(day));
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeDaily = useGameStore((s) => s.completeDaily);
  const [challenge] = useState(() => dailyChallengeFor(day, { questions: QUESTIONS, facts: FACTS }));
  const questions = challenge.questionIds.map(getQuestion).filter((q): q is Question => q !== undefined);
  const fact = challenge.factId ? getFact(challenge.factId) : undefined;
  const [index, setIndex] = useState(0);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);
  const [alreadyDone] = useState(doneToday);

  if (alreadyDone) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <EmptyState icon="check" title={t('home.daily.done')} body={t('daily.alreadyDone')} actionLabel={t('common.back')} onAction={() => router.back()} />
      </Screen>
    );
  }

  if (finished) {
    return (
      <Screen header={<TopBar title={t('daily.title')} />}>
        <AppText variant="title" align="center">
          {t('daily.doneTitle')}
        </AppText>
        <RewardAnimation xp={xp} label={t(`daily.kind.${challenge.kind}`)} />
        <Button label={t('common.done')} onPress={() => router.back()} />
      </Screen>
    );
  }

  const question = questions[index];
  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      return;
    }
    setXp((x) => x + completeDaily(day));
    setFinished(true);
  };

  return (
    <Screen
      header={
        <View>
          <TopBar title={t('daily.title')} backIcon="close" />
          {questions.length > 1 ? (
            <View style={styles.progress}>
              <ProgressBar progress={index / questions.length} color={colors.gold} />
            </View>
          ) : null}
        </View>
      }
    >
      <View style={styles.kind}>
        <Icon name="sun" size={22} color={colors.goldDeep} />
        <AppText variant="label" color={colors.goldDeep}>
          {t(`daily.kind.${challenge.kind}`).toUpperCase()}
        </AppText>
      </View>
      {fact && index === 0 ? (
        <Card tone="gold">
          <AppText variant="heading">{t('daily.kind.fact')}</AppText>
          <AppText variant="body" style={styles.factText}>
            {l(fact.text)}
          </AppText>
          <SourceList sources={fact.sources} />
          <AppText variant="small" color={colors.textMuted}>
            {t('daily.factThenQuestion')}
          </AppText>
        </Card>
      ) : null}
      {question ? (
        <QuestionView
          key={question.id}
          question={question}
          onResult={(correct) => setXp((x) => x + recordAnswer(question, correct, 'daily'))}
          onContinue={next}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  kind: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  factText: { marginVertical: spacing.sm },
});
