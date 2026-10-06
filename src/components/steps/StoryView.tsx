import { StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { SourceList } from '@/components/ui/SourceList';
import { useI18n } from '@/hooks/useI18n';
import type { LearnedValue, LocalizedText, SceneSpec, SourceRef } from '@/models';
import { colors, radius, spacing } from '@/theme';

interface StoryViewProps {
  title?: LocalizedText;
  body: LocalizedText;
  scene: SceneSpec;
  sources?: SourceRef[];
  intro?: boolean;
}

/** A story scene: symbolic illustration (never a depiction of a prophet) and narration. */
export function StoryView({ title, body, scene, sources, intro }: StoryViewProps) {
  const { t, l } = useI18n();
  return (
    <View style={styles.root}>
      <SceneView scene={scene} height={intro ? 230 : 190} />
      <View style={styles.textCard}>
        <AppText variant="label" color={colors.goldDeep}>
          {t('player.story').toUpperCase()}
        </AppText>
        {title ? (
          <AppText variant="title" accessibilityRole="header">
            {l(title)}
          </AppText>
        ) : null}
        <AppText variant="body" style={styles.body}>
          {l(body)}
        </AppText>
      </View>
      <SourceList sources={sources} />
    </View>
  );
}

/** "What did we learn?" summary at the end of a story. */
export function LearnedView({ values }: { values: LearnedValue[] }) {
  const { t, l } = useI18n();
  return (
    <View style={styles.root}>
      <AppText variant="title" accessibilityRole="header">
        {t('player.learnedTitle')}
      </AppText>
      {values.map((value, index) => (
        <View key={index} style={styles.valueCard}>
          <View style={styles.valueNumber}>
            <AppText variant="bodyBold" color={colors.night}>
              {index + 1}
            </AppText>
          </View>
          <View style={styles.valueTexts}>
            <AppText variant="heading">{l(value.title)}</AppText>
            <AppText variant="body" color={colors.textMuted}>
              {l(value.body)}
            </AppText>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  textCard: {
    backgroundColor: '#FFFBF2',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#EBDDBF',
  },
  body: { fontSize: 17, lineHeight: 27 },
  valueCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  valueNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueTexts: { flex: 1, gap: 2 },
});
