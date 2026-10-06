import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnswerOption, type OptionState } from '@/components/game/AnswerOption';
import { useI18n } from '@/hooks/useI18n';
import type { TrueFalseQuestion as TF } from '@/models';
import { evaluateAnswer } from '@/services/quiz';

import type { QuestionComponentProps } from './types';

export function TrueFalseQuestion({ question, onAnswered, locked }: QuestionComponentProps<TF>) {
  const { t } = useI18n();
  const [picked, setPicked] = useState<boolean | null>(null);

  const choose = (value: boolean) => {
    if (picked !== null || locked) return;
    setPicked(value);
    onAnswered({
      correct: evaluateAnswer(question, { type: 'boolean', value }),
      correctAnswer: question.correct ? t('q.true') : t('q.false'),
    });
  };

  const stateFor = (value: boolean): OptionState => {
    if (picked === null) return 'idle';
    if (value === question.correct) return 'correct';
    if (value === picked) return 'incorrect';
    return 'dimmed';
  };

  return (
    <View style={styles.row}>
      <View style={styles.cell}>
        <AnswerOption label={t('q.true')} state={stateFor(true)} onPress={() => choose(true)} disabled={picked !== null || locked} />
      </View>
      <View style={styles.cell}>
        <AnswerOption label={t('q.false')} state={stateFor(false)} onPress={() => choose(false)} disabled={picked !== null || locked} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  cell: { flex: 1 },
});
