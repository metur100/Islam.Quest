import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { MatchingQuestion as Matching } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { colors, radius, spacing } from '@/theme';
import { hashString, seededRandom, shuffle } from '@/utils/random';

import type { QuestionComponentProps } from './types';

/**
 * Tap a left item, then its partner on the right. Pairs with identical right-hand text
 * (e.g. several prayers with 4 rak'ahs) are interchangeable.
 */
export function MatchingQuestion({ question, onAnswered, locked }: QuestionComponentProps<Matching>) {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const random = useMemo(() => seededRandom(hashString(question.id)), [question.id]);
  const left = useMemo(() => shuffle(question.pairs, random), [question.pairs, random]);
  const right = useMemo(() => shuffle(question.pairs, random), [question.pairs, random]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedLeft, setMatchedLeft] = useState<string[]>([]);
  const [matchedRight, setMatchedRight] = useState<string[]>([]);
  const [wrongRight, setWrongRight] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matchedLeft.length === question.pairs.length;

  const tapRight = (rightId: string) => {
    if (!selectedLeft || locked || done) return;
    const leftPair = question.pairs.find((p) => p.id === selectedLeft);
    const rightPair = question.pairs.find((p) => p.id === rightId);
    if (!leftPair || !rightPair) return;
    const isMatch = l(leftPair.right) === l(rightPair.right);
    if (isMatch) {
      feedback.success();
      const nextLeft = [...matchedLeft, selectedLeft];
      setMatchedLeft(nextLeft);
      setMatchedRight((prev) => [...prev, rightId]);
      setSelectedLeft(null);
      setWrongRight(null);
      if (nextLeft.length === question.pairs.length) {
        onAnswered({
          correct: evaluateAnswer(question, { type: 'pairs', mistakes }),
          correctAnswer: question.pairs.map((p) => `${l(p.left)} – ${l(p.right)}`).join(', '),
        });
      }
    } else {
      feedback.failure();
      setMistakes((m) => m + 1);
      setWrongRight(rightId);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={colors.textMuted} style={styles.hint}>
          {t('q.matching.hint')}
        </AppText>
        <AppText variant="small" color={mistakes > 0 ? colors.error : colors.textMuted}>
          {t('q.matching.mistakes', { count: mistakes })}
        </AppText>
      </View>
      <View style={styles.columns}>
        <View style={styles.column}>
          {left.map((pair) => {
            const matched = matchedLeft.includes(pair.id);
            const selected = selectedLeft === pair.id;
            return (
              <Pressable
                key={pair.id}
                disabled={matched || locked}
                onPress={() => {
                  feedback.tap();
                  setSelectedLeft(pair.id);
                  setWrongRight(null);
                }}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: matched }}
                accessibilityLabel={`${l(pair.left)}${matched ? `, ${t('a11y.correct')}` : selected ? `, ${t('a11y.selected')}` : ''}`}
                style={[styles.tile, selected && styles.selected, matched && styles.matched]}
              >
                <AppText variant="bodyBold" align="center">
                  {l(pair.left)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.column}>
          {right.map((pair) => {
            const matched = matchedRight.includes(pair.id);
            const wrong = wrongRight === pair.id;
            return (
              <Pressable
                key={pair.id}
                disabled={matched || locked || !selectedLeft}
                onPress={() => tapRight(pair.id)}
                accessibilityRole="button"
                accessibilityState={{ disabled: matched || !selectedLeft }}
                accessibilityLabel={`${l(pair.right)}${matched ? `, ${t('a11y.correct')}` : wrong ? `, ${t('a11y.incorrect')}` : ''}`}
                style={[styles.tile, styles.rightTile, matched && styles.matched, wrong && styles.wrong]}
              >
                <AppText variant="bodyBold" align="center">
                  {l(pair.right)}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  hint: { flex: 1 },
  columns: { flexDirection: 'row', gap: spacing.md },
  column: { flex: 1, gap: spacing.sm },
  tile: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  rightTile: { backgroundColor: colors.goldSoft, borderColor: '#F0D49A' },
  selected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  matched: { borderColor: colors.success, backgroundColor: colors.successSoft, opacity: 0.75 },
  wrong: { borderColor: colors.error, backgroundColor: colors.errorSoft },
});
