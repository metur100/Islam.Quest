import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import { colors, radius, spacing } from '@/theme';

const STEPS: { icon: IconName; key: 'learn' | 'play' | 'remember' | 'reward' }[] = [
  { icon: 'book', key: 'learn' },
  { icon: 'sparkle', key: 'play' },
  { icon: 'refresh', key: 'remember' },
  { icon: 'trophy', key: 'reward' },
];

export default function ExplainStep() {
  const { t } = useI18n();
  return (
    <OnboardingFrame
      step={5}
      title={t('onboarding.explain.title')}
      footer={<Button label={t('common.continue')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/start')} />}
    >
      <View style={styles.list}>
        {STEPS.map((step, index) => (
          <View key={step.key} style={styles.row}>
            <View style={styles.icon}>
              <Icon name={step.icon} size={26} color={colors.night} />
            </View>
            <View style={styles.texts}>
              <AppText variant="heading" color={colors.textOnDark}>
                {index + 1}. {t(`onboarding.explain.${step.key}.title` as TranslationKey)}
              </AppText>
              <AppText variant="body" color={colors.textOnDarkMuted}>
                {t(`onboarding.explain.${step.key}.body` as TranslationKey)}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  icon: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  texts: { flex: 1, gap: 2 },
});
