import { View } from 'react-native';

import { useI18n } from '@/hooks/useI18n';
import { colors } from '@/theme';

import { Icon } from './Icon';

export function Stars({ count, size = 16, dark }: { count: number; size?: number; dark?: boolean }) {
  const { t } = useI18n();
  return (
    <View style={{ flexDirection: 'row', gap: 2 }} accessible accessibilityLabel={t('a11y.stars', { count })}>
      {[1, 2, 3].map((n) => (
        <Icon
          key={n}
          name={n <= count ? 'star' : 'starOutline'}
          size={size}
          color={n <= count ? colors.gold : dark ? 'rgba(255,255,255,0.4)' : colors.locked}
        />
      ))}
    </View>
  );
}
