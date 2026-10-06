import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SourceList } from '@/components/ui/SourceList';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { TranslationKey } from '@/localization/i18n';
import type { Question } from '@/models';
import { colors, radius, spacing } from '@/theme';

import { ChoiceQuestion } from './ChoiceQuestion';
import { MatchingQuestion } from './MatchingQuestion';
import { MemoryQuestion } from './MemoryQuestion';
import { MissingWordQuestion } from './MissingWordQuestion';
import { AyahOrderQuestion, OrderingQuestion } from './OrderingQuestion';
import { TrueFalseQuestion } from './TrueFalseQuestion';
import type { AnswerResult } from './types';

interface QuestionViewProps {
  question: Question;
  label?: 'interactive' | 'challenge' | 'quiz';
  /** Called once when the player has answered. */
  onResult: (correct: boolean) => void;
  onContinue: () => void;
  continueLabel?: string;
  showReviewNote?: boolean;
}

/** Renders any question type with its prompt and the explanation after answering. */
export function QuestionView({ question, label, onResult, onContinue, continueLabel, showReviewNote = true }: QuestionViewProps) {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const [result, setResult] = useState<AnswerResult | null>(null);

  const handleAnswered = (r: AnswerResult) => {
    if (result) return;
    setResult(r);
    if (r.correct) feedback.success();
    else feedback.failure();
    onResult(r.correct);
    AccessibilityInfo.announceForAccessibility(r.correct ? t('player.correct') : t('player.notQuite'));
  };

  const common = { onAnswered: handleAnswered, locked: result !== null };
  const body = (() => {
    switch (question.type) {
      case 'multipleChoice':
      case 'scenario':
        return <ChoiceQuestion question={question} {...common} />;
      case 'trueFalse':
        return <TrueFalseQuestion question={question} {...common} />;
      case 'ordering':
        return <OrderingQuestion question={question} {...common} />;
      case 'ayahOrder':
        return <AyahOrderQuestion question={question} {...common} />;
      case 'matching':
        return <MatchingQuestion question={question} {...common} />;
      case 'memory':
        return <MemoryQuestion question={question} {...common} />;
      case 'missingWord':
        return <MissingWordQuestion question={question} {...common} />;
    }
  })();

  const labelKey: TranslationKey | null =
    question.type === 'scenario' ? 'q.scenario.title' : label ? (`player.label.${label}` as TranslationKey) : null;

  return (
    <View style={styles.root}>
      {labelKey ? (
        <View style={styles.labelPill}>
          <AppText variant="label" color={colors.primaryDark}>
            {t(labelKey).toUpperCase()}
          </AppText>
        </View>
      ) : null}
      <AppText variant="heading" accessibilityRole="header">
        {l(question.prompt)}
      </AppText>
      {body}
      {result ? (
        <FeedbackPanel
          result={result}
          explanation={l(question.explanation)}
          sources={question.sources}
          showReviewNote={showReviewNote && !result.correct}
          onContinue={onContinue}
          continueLabel={continueLabel ?? t('common.continue')}
          hideCorrectAnswer={question.type === 'ordering' || question.type === 'ayahOrder' || question.type === 'memory' || question.type === 'matching'}
        />
      ) : null}
    </View>
  );
}

interface FeedbackPanelProps {
  result: AnswerResult;
  explanation: string;
  sources?: Question['sources'];
  showReviewNote: boolean;
  onContinue: () => void;
  continueLabel: string;
  hideCorrectAnswer: boolean;
}

function FeedbackPanel({ result, explanation, sources, showReviewNote, onContinue, continueLabel, hideCorrectAnswer }: FeedbackPanelProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [slide] = useState(() => new Animated.Value(reduced ? 0 : 24));
  const [fade] = useState(() => new Animated.Value(reduced ? 1 : 0));

  useEffect(() => {
    if (reduced) return;
    Animated.parallel([
      Animated.timing(slide, { toValue: 0, duration: 260, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [fade, reduced, slide]);

  const good = result.correct;
  return (
    <Animated.View
      style={[
        styles.panel,
        { backgroundColor: good ? colors.successSoft : colors.goldSoft, borderColor: good ? colors.success : colors.gold },
        { opacity: fade, transform: [{ translateY: slide }] },
      ]}
      accessibilityLiveRegion="polite"
    >
      <View style={styles.panelHeader}>
        <View style={[styles.panelIcon, { backgroundColor: good ? colors.success : colors.gold }]}>
          <Icon name={good ? 'check' : 'sparkle'} size={20} color="#FFFFFF" strokeWidth={3} />
        </View>
        <AppText variant="heading" color={good ? colors.success : colors.goldDeep}>
          {good ? t('player.correct') : t('player.notQuite')}
        </AppText>
      </View>
      {result.extraFeedback ? <AppText variant="bodyBold">{result.extraFeedback}</AppText> : null}
      {!good && !hideCorrectAnswer && result.correctAnswer ? (
        <AppText variant="bodyBold">{t('player.correctAnswer', { answer: result.correctAnswer })}</AppText>
      ) : null}
      <AppText variant="body">{explanation}</AppText>
      <SourceList sources={sources} />
      {showReviewNote ? (
        <View style={styles.reviewNote}>
          <Icon name="refresh" size={16} color={colors.textMuted} />
          <AppText variant="tiny" color={colors.textMuted}>
            {t('player.addedToReview')}
          </AppText>
        </View>
      ) : null}
      <Button label={continueLabel} onPress={onContinue} iconRight="chevron" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  labelPill: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
  },
  panel: { borderRadius: radius.lg, borderWidth: 2, padding: spacing.lg, gap: spacing.md },
  panelHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  panelIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  reviewNote: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
