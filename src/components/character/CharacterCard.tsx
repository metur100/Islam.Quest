import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useI18n } from '@/hooks/useI18n';
import type { Character } from '@/models';
import { colors, spacing } from '@/theme';

import { Avatar } from './Avatar';

interface CharacterCardProps {
  character: Character;
  name: string;
  level: number;
  size?: number;
  dark?: boolean;
}

/** Avatar with name and level, used on Home and Profile. */
export function CharacterCard({ character, name, level, size = 84, dark }: CharacterCardProps) {
  const { t } = useI18n();
  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Avatar character={character} size={size * 0.95} />
      </View>
      <View style={styles.texts}>
        <AppText variant="title" color={dark ? colors.textOnDark : colors.text} numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="small" color={dark ? colors.gold : colors.goldDeep}>
          {t('common.level', { level })}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    backgroundColor: colors.goldSoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
  },
  texts: { flex: 1 },
});
