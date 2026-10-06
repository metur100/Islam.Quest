import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { colors, radius, spacing } from '@/theme';
import { hashString, seededRandom, shuffleNotIdentity } from '@/utils/random';

export interface SequenceItem {
  id: string;
  label: string;
}

interface SequenceBuilderProps {
  /** Items in the correct order. */
  items: SequenceItem[];
  seedKey: string;
  hint: string;
  locked: boolean;
  /** Called with the player's order once every item is placed and "Check" is pressed. */
  onSubmit: (orderIds: string[]) => void;
  script?: 'auto' | 'quran';
  /** Correct order revealed after submission (ids). */
  revealCorrect: boolean;
}

/**
 * Tap-to-order puzzle (timeline, prayer order, wudu steps, ayah order).
 * Tapping is used instead of drag-and-drop because it is easier for children and screen readers.
 */
export function SequenceBuilder({ items, seedKey, hint, locked, onSubmit, script = 'auto', revealCorrect }: SequenceBuilderProps) {
  const { t } = useI18n();
  const feedback = useFeedback();
  const pool = useMemo(() => shuffleNotIdentity(items, seededRandom(hashString(seedKey))), [items, seedKey]);
  const [order, setOrder] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const remaining = pool.filter((i) => !order.includes(i.id));

  const place = (id: string) => {
    if (submitted || locked) return;
    feedback.tap();
    setOrder((prev) => [...prev, id]);
  };

  const unplace = (id: string) => {
    if (submitted || locked) return;
    setOrder((prev) => prev.filter((x) => x !== id));
  };

  const submit = () => {
    setSubmitted(true);
    onSubmit(order);
  };

  return (
    <View style={styles.root}>
      <AppText variant="small" color={colors.textMuted}>
        {hint}
      </AppText>

      <View style={styles.slots}>
        {items.map((_, index) => {
          const id = order[index];
          const item = id ? byId.get(id) : undefined;
          const isRight = submitted && id === items[index].id;
          const isWrong = submitted && id !== undefined && id !== items[index].id;
          return (
            <Pressable
              key={index}
              disabled={!item || submitted}
              onPress={() => item && unplace(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item ? `${index + 1}. ${item.label}` : `${index + 1}.`}
              style={[
                styles.slot,
                item && styles.slotFilled,
                isRight && styles.slotRight,
                isWrong && styles.slotWrong,
              ]}
            >
              <View style={styles.number}>
                <AppText variant="small" color={colors.textOnDark}>
                  {index + 1}
                </AppText>
              </View>
              <AppText variant="bodyBold" style={styles.slotText} script={script}>
                {item ? item.label : ''}
              </AppText>
              {isRight ? <Icon name="check" size={20} color={colors.success} strokeWidth={3} /> : null}
              {isWrong ? <Icon name="close" size={20} color={colors.error} strokeWidth={3} /> : null}
            </Pressable>
          );
        })}
      </View>

      {!submitted ? (
        <View style={styles.pool}>
          {remaining.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => place(item.id)}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              style={({ pressed }) => [styles.chip, pressed && { opacity: 0.8 }]}
            >
              <AppText variant="bodyBold" script={script} style={styles.chipText}>
                {item.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}

      {!submitted ? (
        <View style={styles.actions}>
          {order.length > 0 ? (
            <Button label={t('q.ordering.reset')} variant="secondary" icon="refresh" onPress={() => setOrder([])} />
          ) : null}
          <Button label={t('common.check')} onPress={submit} disabled={order.length !== items.length || locked} />
        </View>
      ) : null}

      {submitted && revealCorrect ? (
        <View style={styles.correctList}>
          {items.map((item, index) => (
            <AppText key={item.id} variant="small" color={colors.success} script={script}>
              {index + 1}. {item.label}
            </AppText>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  slots: { gap: spacing.sm },
  slot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  slotFilled: { borderStyle: 'solid', borderColor: colors.primary, backgroundColor: colors.card },
  slotRight: { borderColor: colors.success, backgroundColor: colors.successSoft },
  slotWrong: { borderColor: colors.error, backgroundColor: colors.errorSoft },
  number: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotText: { flex: 1 },
  pool: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.goldSoft,
    borderWidth: 2,
    borderColor: '#F0D49A',
    justifyContent: 'center',
    maxWidth: '100%',
  },
  chipText: { flexShrink: 1 },
  actions: { gap: spacing.sm },
  correctList: { gap: 2 },
});
