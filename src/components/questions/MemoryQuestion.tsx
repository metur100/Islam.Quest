import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { MemoryQuestion as Memory } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { colors, radius, spacing } from '@/theme';
import { hashString, seededRandom, shuffle } from '@/utils/random';

import type { QuestionComponentProps } from './types';

interface MemoryCard {
  key: string;
  pairId: string;
  text: string;
}

/** Classic memory: flip two cards; a word and its meaning form a pair. */
export function MemoryQuestion({ question, onAnswered, locked }: QuestionComponentProps<Memory>) {
  const { t, l } = useI18n();
  const feedback = useFeedback();
  const cards = useMemo<MemoryCard[]>(
    () =>
      shuffle(
        question.pairs.flatMap((p) => [
          { key: `${p.id}-a`, pairId: p.id, text: l(p.left) },
          { key: `${p.id}-b`, pairId: p.id, text: l(p.right) },
        ]),
        seededRandom(hashString(question.id)),
      ),
    [question.id, question.pairs, l],
  );
  const [open, setOpen] = useState<string[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const done = found.length === question.pairs.length;

  // A mismatched pair stays visible briefly, then flips back.
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = setTimeout(() => setOpen([]), 900);
    return () => clearTimeout(timer);
  }, [open]);

  const flip = (card: MemoryCard) => {
    if (locked || done || open.length >= 2 || open.includes(card.key) || found.includes(card.pairId)) return;
    feedback.tap();
    if (open.length === 0) {
      setOpen([card.key]);
      return;
    }
    const first = cards.find((c) => c.key === open[0]);
    const nextMoves = moves + 1;
    setMoves(nextMoves);
    if (first && first.pairId === card.pairId) {
      feedback.success();
      const nextFound = [...found, card.pairId];
      setFound(nextFound);
      setOpen([]);
      if (nextFound.length === question.pairs.length) {
        onAnswered({
          correct: evaluateAnswer(question, { type: 'memory', moves: nextMoves }),
          correctAnswer: question.pairs.map((p) => `${l(p.left)} – ${l(p.right)}`).join(', '),
        });
      }
      return;
    }
    setOpen([open[0], card.key]);
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <AppText variant="small" color={colors.textMuted} style={styles.hint}>
          {t('q.memory.hint')}
        </AppText>
        <AppText variant="small" color={colors.textMuted}>
          {t('q.memory.moves', { count: moves })}
        </AppText>
      </View>
      <View style={styles.grid}>
        {cards.map((card, index) => {
          const isFound = found.includes(card.pairId);
          const isOpen = isFound || open.includes(card.key);
          return (
            <Pressable
              key={card.key}
              onPress={() => flip(card)}
              disabled={isFound || locked}
              accessibilityRole="button"
              accessibilityLabel={isOpen ? `${t('a11y.card', { index: index + 1 })}: ${card.text}` : t('a11y.hiddenCard', { index: index + 1 })}
              style={[styles.card, isOpen && styles.cardOpen, isFound && styles.cardFound]}
            >
              {isOpen ? (
                <AppText variant="small" align="center" style={styles.cardText}>
                  {card.text}
                </AppText>
              ) : (
                <Icon name="sparkle" size={24} color={colors.gold} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  hint: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
  card: {
    width: '31%',
    aspectRatio: 0.95,
    borderRadius: radius.md,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xs,
    borderWidth: 2,
    borderColor: colors.nightLine,
  },
  cardOpen: { backgroundColor: colors.card, borderColor: colors.primary },
  cardFound: { backgroundColor: colors.successSoft, borderColor: colors.success },
  cardText: { fontSize: 13, lineHeight: 17 },
});
