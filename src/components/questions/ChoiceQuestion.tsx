import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AnswerOption, type OptionState } from '@/components/game/AnswerOption';
import { useI18n } from '@/hooks/useI18n';
import type { MultipleChoiceQuestion, ScenarioQuestion } from '@/models';
import { evaluateAnswer } from '@/services/quiz';
import { hashString, seededRandom, shuffle } from '@/utils/random';

import type { QuestionComponentProps } from './types';

const MARKERS = ['A', 'B', 'C', 'D', 'E'];

/** Multiple choice and scenario questions: tap an answer to submit it. */
export function ChoiceQuestion({
  question,
  onAnswered,
  locked,
}: QuestionComponentProps<MultipleChoiceQuestion | ScenarioQuestion>) {
  const { l } = useI18n();
  const [picked, setPicked] = useState<string | null>(null);
  const options = useMemo(
    () => shuffle(question.options, seededRandom(hashString(question.id))),
    [question.id, question.options],
  );

  const choose = (optionId: string) => {
    if (picked || locked) return;
    setPicked(optionId);
    const correct = evaluateAnswer(question, { type: 'option', optionId });
    const correctOption = question.options.find((o) => o.id === question.correctOptionId);
    const pickedOption = question.type === 'scenario' ? question.options.find((o) => o.id === optionId) : undefined;
    onAnswered({
      correct,
      correctAnswer: correctOption ? l(correctOption.text) : '',
      extraFeedback: pickedOption ? l(pickedOption.feedback) : undefined,
    });
  };

  const stateFor = (optionId: string): OptionState => {
    if (!picked) return 'idle';
    if (optionId === question.correctOptionId) return 'correct';
    if (optionId === picked) return 'incorrect';
    return 'dimmed';
  };

  return (
    <View style={styles.list}>
      {options.map((option, index) => (
        <AnswerOption
          key={option.id}
          marker={MARKERS[index]}
          label={l(option.text)}
          state={stateFor(option.id)}
          disabled={!!picked || locked}
          onPress={() => choose(option.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
});
