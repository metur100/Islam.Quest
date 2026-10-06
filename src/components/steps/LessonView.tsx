import { Pressable, StyleSheet, View } from 'react-native';

import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { DifferenceNote, SourceList } from '@/components/ui/SourceList';
import { useI18n } from '@/hooks/useI18n';
import type { Lesson } from '@/models';
import { speakArabic } from '@/services/speech';
import { colors, radius, spacing, worldThemes } from '@/theme';

/** Reader for a short lesson: sections, optional Arabic word with pronunciation, notes and sources. */
export function LessonView({ lesson }: { lesson: Lesson }) {
  const { t, l } = useI18n();
  const accent = worldThemes[lesson.worldId].accent;

  return (
    <View style={styles.root}>
      {lesson.scene ? <SceneView scene={lesson.scene} height={150} /> : null}
      <View style={styles.titleBlock}>
        <AppText variant="title" accessibilityRole="header">
          {l(lesson.title)}
        </AppText>
        <AppText variant="body" color={colors.textMuted}>
          {l(lesson.summary)}
        </AppText>
      </View>

      {lesson.sections.map((section, index) => (
        <View key={index} style={styles.section}>
          {section.heading ? (
            <AppText variant="heading" color={accent}>
              {l(section.heading)}
            </AppText>
          ) : null}
          {section.arabic ? (
            <View style={styles.arabicRow}>
              <View style={styles.arabicTexts}>
                <AppText variant="title" script="arabic" align="center">
                  {section.arabic}
                </AppText>
                {section.transliteration ? (
                  <AppText variant="small" color={colors.textMuted} align="center">
                    {section.transliteration}
                  </AppText>
                ) : null}
              </View>
              <Pressable
                onPress={() => speakArabic(section.arabic ?? '')}
                accessibilityRole="button"
                accessibilityLabel={`${t('a11y.speak')}: ${section.transliteration ?? ''}`}
                style={styles.speak}
                hitSlop={6}
              >
                <Icon name="speaker" size={22} color={colors.primary} />
              </Pressable>
            </View>
          ) : null}
          <AppText variant="body">{l(section.body)}</AppText>
        </View>
      ))}

      <DifferenceNote note={lesson.differenceNote} />
      <SourceList sources={lesson.sources} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  titleBlock: { gap: spacing.xs },
  section: {
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  arabicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.goldSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  arabicTexts: { flex: 1 },
  speak: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
