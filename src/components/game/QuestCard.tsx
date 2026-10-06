import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Card } from '@/components/ui/Card';
import { Icon, type IconName } from '@/components/ui/Icon';
import { Stars } from '@/components/ui/Stars';
import { useI18n } from '@/hooks/useI18n';
import type { Quest, QuestKind } from '@/models';
import type { QuestStatus } from '@/services/unlocking';
import { colors, spacing, worldThemes } from '@/theme';

const KIND_ICON: Record<QuestKind, IconName> = {
  lesson: 'book',
  story: 'scroll',
  game: 'sparkle',
  memorization: 'quran',
};

interface QuestCardProps {
  quest: Quest;
  status: QuestStatus;
  stars: number;
  isCurrent?: boolean;
  onPress: () => void;
}

export function QuestCard({ quest, status, stars, isCurrent, onPress }: QuestCardProps) {
  const { t, l } = useI18n();
  const accent = worldThemes[quest.worldId].accent;
  const locked = status === 'locked';

  const statusLabel =
    status === 'completed' ? t('quest.status.completed') : locked ? t('world.lockedQuest') : t('quest.status.available');

  return (
    <Card
      onPress={onPress}
      tone={isCurrent ? 'gold' : 'default'}
      accessibilityLabel={`${l(quest.title)}. ${t(`quest.kind.${quest.kind}`)}. ${statusLabel}`}
      style={[styles.card, locked && styles.locked]}
    >
      <View style={styles.row}>
        <View style={[styles.node, { backgroundColor: locked ? colors.locked : status === 'completed' ? colors.success : accent }]}>
          <Icon name={locked ? 'lock' : status === 'completed' ? 'check' : KIND_ICON[quest.kind]} size={22} color="#FFFFFF" />
        </View>
        <View style={styles.texts}>
          <View style={styles.kindRow}>
            <AppText variant="label" color={accent}>
              {t(`quest.kind.${quest.kind}`).toUpperCase()}
            </AppText>
            {isCurrent ? (
              <View style={styles.currentPill}>
                <AppText variant="tiny" color={colors.night}>
                  {t('world.current')}
                </AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="bodyBold">{l(quest.title)}</AppText>
          <AppText variant="small" color={colors.textMuted}>
            {locked ? t('world.lockedQuest') : l(quest.description)}
          </AppText>
        </View>
        {status === 'completed' ? <Stars count={stars} size={14} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { paddingVertical: spacing.md },
  locked: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  node: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  currentPill: { backgroundColor: colors.gold, borderRadius: 999, paddingHorizontal: spacing.sm },
});
