import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/hooks/useI18n';
import type { LocalizedText, SourceRef } from '@/models';
import { colors, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon } from './Icon';

/** Lists the references a lesson, story or question is based on. */
export function SourceList({ sources }: { sources?: SourceRef[] }) {
  const { t } = useI18n();
  if (!sources || sources.length === 0) return null;
  return (
    <View style={styles.box}>
      <View style={styles.header}>
        <Icon name="book" size={16} color={colors.textMuted} />
        <AppText variant="label" color={colors.textMuted}>
          {t('common.sources').toUpperCase()}
        </AppText>
      </View>
      {sources.map((s) => (
        <AppText key={`${s.sourceName}-${s.sourceReference}`} variant="small" color={colors.textMuted}>
          {s.sourceReference && s.sourceReference !== '—' ? `${s.sourceName} ${s.sourceReference}` : s.sourceName}
        </AppText>
      ))}
    </View>
  );
}

/** Highlights that legitimate scholarly differences exist on this topic. */
export function DifferenceNote({ note }: { note?: LocalizedText }) {
  const { t, l } = useI18n();
  if (!note) return null;
  return (
    <View style={[styles.box, styles.note]}>
      <View style={styles.header}>
        <Icon name="info" size={16} color={colors.info} />
        <AppText variant="label" color={colors.info}>
          {t('common.scholarsDiffer').toUpperCase()}
        </AppText>
      </View>
      <AppText variant="small" color={colors.text}>
        {l(note)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  note: { backgroundColor: colors.infoSoft },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
});
