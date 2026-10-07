import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

const TABS: Record<string, { icon: IconName; label: TranslationKey }> = {
  index: { icon: 'home', label: 'tabs.home' },
  quest: { icon: 'map', label: 'tabs.quest' },
  learn: { icon: 'book', label: 'tabs.learn' },
  profile: { icon: 'user', label: 'tabs.profile' },
};

interface BottomNavigationProps {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/** Custom tab bar: large touch targets, labels always visible, active tab highlighted. */
export function BottomNavigation({ state, navigation }: BottomNavigationProps) {
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const feedback = useFeedback();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;
        const focused = state.index === index;
        const label = t(config.label);
        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                feedback.tap();
                navigation.navigate(route.name);
              }
            }}
            style={styles.tab}
          >
            <View style={[styles.iconWrap, focused && styles.iconActive]}>
              <Icon name={config.icon} size={24} color={focused ? colors.night : colors.textOnDarkMuted} />
            </View>
            <AppText variant="tiny" color={focused ? colors.gold : colors.textOnDarkMuted}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.night,
    paddingTop: spacing.sm,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 56, justifyContent: 'center' },
  // A background on both states keeps Android from dropping the rounded corners when the tab becomes active.
  iconWrap: { width: 52, height: 32, borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  iconActive: { backgroundColor: colors.gold },
});
