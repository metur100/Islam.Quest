import { useMemo } from 'react';

import { getSurah } from '@/data/quran';
import { useI18n } from '@/hooks/useI18n';
import type { AyahOrderQuestion as AyahOrder, OrderingQuestion as Ordering } from '@/models';
import { evaluateAnswer } from '@/services/quiz';

import { SequenceBuilder } from './SequenceBuilder';
import type { QuestionComponentProps } from './types';

export function OrderingQuestion({ question, onAnswered, locked }: QuestionComponentProps<Ordering>) {
  const { t, l } = useI18n();
  const items = useMemo(() => question.items.map((i) => ({ id: i.id, label: l(i.text) })), [question.items, l]);
  return (
    <SequenceBuilder
      items={items}
      seedKey={question.id}
      hint={t('q.ordering.hint')}
      locked={locked}
      revealCorrect
      onSubmit={(ids) =>
        onAnswered({
          correct: evaluateAnswer(question, { type: 'order', ids }),
          correctAnswer: items.map((i) => i.label).join(' → '),
        })
      }
    />
  );
}

/** Ayah ordering for memorisation, built from the verified Quran text. */
export function AyahOrderQuestion({ question, onAnswered, locked }: QuestionComponentProps<AyahOrder>) {
  const { t } = useI18n();
  const surah = getSurah(question.surahNumber);
  const items = useMemo(
    () => (surah ? surah.ayahs.map((a) => ({ id: String(a.numberInSurah), label: a.arabic })) : []),
    [surah],
  );
  return (
    <SequenceBuilder
      items={items}
      seedKey={question.id}
      hint={t('q.ayahOrder.hint')}
      locked={locked}
      script="quran"
      revealCorrect
      onSubmit={(ids) =>
        onAnswered({
          correct: evaluateAnswer(question, { type: 'order', ids }),
          correctAnswer: surah ? surah.nameTransliterated : '',
        })
      }
    />
  );
}
