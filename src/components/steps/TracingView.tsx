import { useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { speakArabic } from '@/services/speech';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { colors, fonts, radius, spacing } from '@/theme';

/** Minimum drawn length (in points) before a letter counts as traced. */
const REQUIRED_LENGTH = 260;
const CANVAS = 260;

interface TracingViewProps {
  letters: string[];
  onDone: () => void;
}

/**
 * Tracing architecture: the letter is shown as a large guide and the child draws over it with a
 * finger. Each stroke is stored as an SVG path; once enough has been traced the next letter unlocks.
 */
export function TracingView({ letters, onDone }: TracingViewProps) {
  const { t } = useI18n();
  const feedback = useFeedback();
  const [index, setIndex] = useState(0);
  const [paths, setPaths] = useState<string[]>([]);
  const [length, setLength] = useState(0);
  // Mutable buffer for the stroke being drawn; only touched inside gesture handlers.
  const [stroke] = useState<{ d: string; last: { x: number; y: number } | null }>(() => ({ d: '', last: null }));
  const letter = letters[index];
  const traced = length >= REQUIRED_LENGTH;

  const [responder] = useState(() =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          stroke.d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
          stroke.last = { x, y };
          const d = stroke.d;
          setPaths((p) => [...p, d]);
        },
        onPanResponderMove: (e) => {
          const { locationX: x, locationY: y } = e.nativeEvent;
          const last = stroke.last;
          if (last) {
            const dist = Math.hypot(x - last.x, y - last.y);
            if (dist < 2) return;
            setLength((l) => l + dist);
          }
          stroke.d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
          stroke.last = { x, y };
          const d = stroke.d;
          setPaths((p) => [...p.slice(0, -1), d]);
        },
        onPanResponderRelease: () => {
          stroke.last = null;
        },
      }),
  );

  const clear = () => {
    setPaths([]);
    setLength(0);
  };

  const next = () => {
    feedback.success();
    if (index + 1 >= letters.length) {
      onDone();
      return;
    }
    setIndex(index + 1);
    clear();
  };

  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('tracing.title')}
      </AppText>
      <AppText variant="body" color={colors.textMuted}>
        {t('tracing.hint')}
      </AppText>
      <AppText variant="small" color={colors.textMuted}>
        {t('tracing.progress', { current: index + 1, total: letters.length })}
      </AppText>

      <View style={styles.canvas} {...responder.panHandlers} accessibilityLabel={`${t('tracing.title')}: ${letter}`}>
        <AppText style={styles.guide} accessibilityElementsHidden importantForAccessibility="no">
          {letter}
        </AppText>
        <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
          {paths.map((d, i) => (
            <Path key={i} d={d} stroke={colors.primary} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.85} />
          ))}
        </Svg>
      </View>

      <AppText variant="bodyBold" align="center" color={traced ? colors.success : colors.textMuted}>
        {traced ? t('tracing.great') : t('tracing.keepGoing')}
      </AppText>

      <View style={styles.row}>
        <View style={styles.cell}>
          <Button label={t('tracing.listen')} icon="speaker" variant="secondary" onPress={() => speakArabic(letter)} />
        </View>
        <View style={styles.cell}>
          <Button label={t('tracing.clear')} icon="refresh" variant="secondary" onPress={clear} />
        </View>
      </View>
      <Button
        label={index + 1 >= letters.length ? t('common.continue') : t('tracing.next')}
        iconRight="chevron"
        onPress={next}
        disabled={!traced}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.md },
  canvas: {
    alignSelf: 'center',
    width: CANVAS,
    height: CANVAS,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  guide: {
    fontFamily: fonts.arabic,
    fontSize: 170,
    lineHeight: 250,
    color: '#E9E1D0',
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  cell: { flex: 1 },
});
