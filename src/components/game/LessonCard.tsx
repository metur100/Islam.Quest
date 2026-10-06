import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { useI18n } from '@/hooks/useI18n';
import type { Lesson } from '@/models';
import { colors, spacing, worldThemes } from '@/theme';

interface LessonCardProps {
  lesson: Lesson;
  completed: boolean;
  locked: boolean;
  onPress: () => void;
}

export function LessonCard({ lesson, completed, locked, onPress }: LessonCardProps) {
  const { t, l } = useI18n();
  const accent = worldThemes[lesson.worldId].accent;
  return (
    <Card
      onPress={onPress}
      accessibilityLabel={`${l(lesson.title)}. ${completed ? t('lesson.completed') : locked ? t('common.locked') : ''}`}
      style={[styles.card, locked && styles.locked]}
    >
      <View style={styles.row}>
        <View style={[styles.icon, { backgroundColor: locked ? colors.cardAlt : `${accent}22` }]}>
          <Icon name={locked ? 'lock' : completed ? 'check' : 'book'} size={20} color={locked ? colors.locked : accent} />
        </View>
        <View style={styles.texts}>
          <AppText variant="bodyBold">{l(lesson.title)}</AppText>
          <AppText variant="small" color={colors.textMuted} numberOfLines={2}>
            {l(lesson.summary)}
          </AppText>
        </View>
        <Icon name="chevron" size={18} color={colors.textMuted} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.md },
  locked: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1 },
});
