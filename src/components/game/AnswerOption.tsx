import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { colors, radius, spacing } from '@/theme';

export type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'dimmed';

interface AnswerOptionProps {
  label: string;
  state: OptionState;
  onPress: () => void;
  disabled?: boolean;
  marker?: string;
  script?: 'auto' | 'quran';
}

const STYLES: Record<OptionState, { bg: string; border: string; fg: string }> = {
  idle: { bg: colors.card, border: colors.border, fg: colors.text },
  selected: { bg: colors.primarySoft, border: colors.primary, fg: colors.text },
  correct: { bg: colors.successSoft, border: colors.success, fg: colors.text },
  incorrect: { bg: colors.errorSoft, border: colors.error, fg: colors.text },
  dimmed: { bg: colors.card, border: colors.border, fg: colors.textMuted },
};

/** Large, clearly labelled answer button used by all choice-based questions. */
export function AnswerOption({ label, state, onPress, disabled, marker, script = 'auto' }: AnswerOptionProps) {
  const feedback = useFeedback();
  const { t } = useI18n();
  const s = STYLES[state];
  const stateLabel =
    state === 'correct' ? t('a11y.correct') : state === 'incorrect' ? t('a11y.incorrect') : state === 'selected' ? t('a11y.selected') : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={stateLabel ? `${label}, ${stateLabel}` : label}
      accessibilityState={{ disabled: !!disabled, selected: state === 'selected' }}
      disabled={disabled}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.option,
        { backgroundColor: s.bg, borderColor: s.border },
        pressed && !disabled && styles.pressed,
        state === 'dimmed' && styles.dimmed,
      ]}
    >
      {marker ? (
        <View style={[styles.marker, { borderColor: s.border }]}>
          <AppText variant="small" color={s.fg}>
            {marker}
          </AppText>
        </View>
      ) : null}
      <AppText variant="bodyBold" color={s.fg} style={styles.label} script={script}>
        {label}
      </AppText>
      {state === 'correct' ? <Icon name="check" size={22} color={colors.success} strokeWidth={3} /> : null}
      {state === 'incorrect' ? <Icon name="close" size={22} color={colors.error} strokeWidth={3} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 58,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 2,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  dimmed: { opacity: 0.6 },
  marker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
});
