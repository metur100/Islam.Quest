import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RewardView } from '@/components/game/RewardView';
import { QuestionView } from '@/components/questions/QuestionView';
import { LessonView } from '@/components/steps/LessonView';
import { ReciteView } from '@/components/steps/ReciteView';
import { LearnedView, StoryView } from '@/components/steps/StoryView';
import { TracingView } from '@/components/steps/TracingView';
import { Dialog } from '@/components/ui/AppModal';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { LockedContent } from '@/components/ui/LockedContent';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { EmptyState } from '@/components/ui/States';
import { TopBar } from '@/components/ui/TopBar';
import { CONTENT_GRAPH, getLesson, getQuest, getQuestion } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import type { QuestStep } from '@/models';
import { currentQuest, questStatus } from '@/services/unlocking';
import { type QuestOutcome, useGameStore } from '@/store/gameStore';
import { colors, spacing, worldThemes } from '@/theme';

export default function QuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Keyed by id so moving on to the next quest always starts with fresh state.
  return <QuestPlayer key={String(id)} id={String(id)} />;
}

function QuestPlayer({ id }: { id: string }) {
  const { t, l } = useI18n();
  const quest = getQuest(id);
  const quests = useGameStore((s) => s.game.quests);
  const recordAnswer = useGameStore((s) => s.recordAnswer);
  const completeLesson = useGameStore((s) => s.completeLesson);
  const completeQuest = useGameStore((s) => s.completeQuest);
  const practiseRecite = useGameStore((s) => s.practiseRecite);
  const setPaused = useGameStore((s) => s.setCelebrationsPaused);

  // Status is checked once on entry so finishing the quest doesn't re-lock the screen.
  const [initialStatus] = useState(() => (quest ? questStatus(quest, quests, CONTENT_GRAPH) : 'locked'));
  const [stepIndex, setStepIndex] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [learningXp, setLearningXp] = useState(0);
  const [outcome, setOutcome] = useState<QuestOutcome | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setPaused(true);
    return () => setPaused(false);
  }, [setPaused]);

  useEffect(() => {
    if (outcome) setPaused(false);
  }, [outcome, setPaused]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (outcome) return false;
      setConfirmExit(true);
      return true;
    });
    return () => sub.remove();
  }, [outcome]);

  if (!quest) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <TopBar />
        <EmptyState icon="map" title={t('player.notFound')} />
      </SafeAreaView>
    );
  }

  if (initialStatus === 'locked') {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <TopBar title={l(quest.title)} />
        <View style={styles.content}>
          <LockedContent message={t('player.locked')} />
          <Button label={t('common.back')} onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const steps = quest.steps;
  const step = steps[stepIndex];
  const accent = worldThemes[quest.worldId].accent;

  const advance = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (stepIndex + 1 < steps.length) {
      setStepIndex(stepIndex + 1);
      return;
    }
    setOutcome(completeQuest(quest.id, results, learningXp));
  };

  const exit = () => {
    setConfirmExit(false);
    if (router.canGoBack()) router.back();
    else router.replace('/(tabs)');
  };

  const renderStep = (s: QuestStep) => {
    switch (s.kind) {
      case 'intro':
        return (
          <>
            <StoryView title={s.title} body={s.body} scene={s.scene} intro />
            <Button label={t('common.start')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'story':
        return (
          <>
            <StoryView title={s.title} body={s.body} scene={s.scene} sources={s.sources} />
            <Button label={t('common.continue')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'lesson': {
        const lesson = getLesson(s.lessonId);
        if (!lesson) return <Button label={t('common.continue')} onPress={advance} />;
        return (
          <>
            <LessonView lesson={lesson} />
            <Button
              label={t('lesson.done')}
              icon="check"
              onPress={() => {
                setLearningXp((x) => x + completeLesson(lesson.id));
                advance();
              }}
            />
          </>
        );
      }
      case 'question': {
        const question = getQuestion(s.questionId);
        if (!question) return <Button label={t('common.continue')} onPress={advance} />;
        return (
          <QuestionView
            key={`${stepIndex}-${question.id}`}
            question={question}
            label={s.label}
            onResult={(correct) => {
              setResults((r) => [...r, correct]);
              setLearningXp((x) => x + recordAnswer(question, correct, 'quest'));
            }}
            onContinue={advance}
          />
        );
      }
      case 'learned':
        return (
          <>
            <LearnedView values={s.values} />
            <Button label={t('common.continue')} iconRight="chevron" onPress={advance} />
          </>
        );
      case 'tracing':
        return <TracingView key={stepIndex} letters={s.letters} onDone={advance} />;
      case 'recite':
        return (
          <ReciteView
            key={stepIndex}
            surahNumber={s.surahNumber}
            onDone={() => {
              practiseRecite(s.surahNumber);
              advance();
            }}
          />
        );
    }
  };

  if (outcome) {
    const next = currentQuest(useGameStore.getState().game.quests, CONTENT_GRAPH);
    const hasMistakes = results.some((r) => !r);
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
        <ScrollView contentContainerStyle={styles.content}>
          <RewardView
            outcome={outcome}
            primaryLabel={next ? t('reward.nextQuest') : t('reward.backToMap')}
            onPrimary={() =>
              next ? router.replace({ pathname: '/quest/[id]', params: { id: next.id } }) : router.replace('/(tabs)/quest')
            }
            onBackToMap={() => router.replace({ pathname: '/world/[id]', params: { id: quest.worldId } })}
            onReview={hasMistakes ? () => router.replace('/review') : undefined}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
        <StatusBar style="dark" />
      <View style={styles.header}>
        <TopBar backIcon="close" backLabel={t('a11y.closeQuest')} onBack={() => setConfirmExit(true)} title={l(quest.title)} />
        <View style={styles.progressRow}>
          <ProgressBar progress={stepIndex / steps.length} color={accent} style={styles.flex} />
          <AppText variant="tiny" color={colors.textMuted}>
            {stepIndex + 1}/{steps.length}
          </AppText>
        </View>
      </View>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {renderStep(step)}
      </ScrollView>
      <Dialog
        visible={confirmExit}
        title={t('player.exitTitle')}
        body={t('player.exitBody')}
        confirmLabel={t('player.exit')}
        cancelLabel={t('player.stay')}
        onConfirm={exit}
        onCancel={() => setConfirmExit(false)}
        destructive
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  header: { paddingBottom: spacing.sm },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg },
  flex: { flex: 1, width: undefined },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2, gap: spacing.lg },
});
