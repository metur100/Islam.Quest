import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnswerOption, type OptionState } from '@/components/game/AnswerOption';
import { AppText } from '@/components/ui/AppText';
import { getAyah, missingWordPuzzle } from '@/data/quran';
import { useI18n } from '@/hooks/useI18n';
import type { MissingWordQuestion as MissingWord } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { colors, radius, spacing } from '@/theme';
import { hashString, seededRandom, shuffle } from '@/utils/random';

import type { QuestionComponentProps } from './types';

/** Shows a verified ayah with one word hidden; the player picks the missing word. */
export function MissingWordQuestion({ question, onAnswered, locked }: QuestionComponentProps<MissingWord>) {
  const { t, l } = useI18n();
  const [picked, setPicked] = useState<string | null>(null);
  const puzzle = useMemo(
    () => missingWordPuzzle(question.surahNumber, question.ayahNumber, question.missingWordIndex),
    [question.surahNumber, question.ayahNumber, question.missingWordIndex],
  );
  const ayah = getAyah(question.surahNumber, question.ayahNumber);
  const choices = useMemo(
    () => (puzzle ? shuffle(puzzle.choices, seededRandom(hashString(question.id))) : []),
    [puzzle, question.id],
  );
  if (!puzzle || !ayah) return null;

  const choose = (word: string) => {
    if (picked || locked) return;
    setPicked(word);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'word', word }, { missingWord: puzzle.answer }),
      correctAnswer: puzzle.answer,
    });
  };

  const stateFor = (word: string): OptionState => {
    if (!picked) return 'idle';
    if (word === puzzle.answer) return 'correct';
    if (word === picked) return 'incorrect';
    return 'dimmed';
  };

  const display = puzzle.words
    .map((w, i) => (i === question.missingWordIndex ? (picked ? puzzle.answer : '﴾ … ﴿') : w))
    .join(' ');

  return (
    <View style={styles.root}>
      <View style={styles.ayahBox}>
        <AppText variant="title" script="quran" align="center" color={colors.text}>
          {display}
        </AppText>
        <AppText variant="small" align="center" color={colors.textMuted}>
          {ayah.transliteration}
        </AppText>
        <AppText variant="small" align="center" color={colors.textMuted}>
          “{l(ayah.translation)}” ({question.surahNumber}:{question.ayahNumber})
        </AppText>
      </View>
      <AppText variant="small" color={colors.textMuted}>
        {t('q.missingWord.hint')}
      </AppText>
      <View style={styles.grid}>
        {choices.map((word) => (
          <View key={word} style={styles.cell}>
            <AnswerOption label={word} script="quran" state={stateFor(word)} onPress={() => choose(word)} disabled={!!picked || locked} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  ayahBox: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#F0D49A',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  cell: { width: '48%', flexGrow: 1 },
});
