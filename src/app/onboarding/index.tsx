import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { colors, spacing } from '@/theme';

export default function Welcome() {
  const { t } = useI18n();
  return (
    <OnboardingFrame
      step={1}
      showBack={false}
      footer={<Button label={t('onboarding.welcome.cta')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/language')} />}
    >
      <SceneView scene={{ sky: 'night', elements: ['stars', 'crescent', 'mountains', 'dunes', 'mosque', 'lanterns'] }} height={260} />
      <View style={styles.texts}>
        <AppText variant="display" color={colors.gold} align="center" accessibilityRole="header">
          {t('onboarding.welcome.title')}
        </AppText>
        <AppText variant="body" color={colors.textOnDark} align="center">
          {t('onboarding.welcome.subtitle')}
        </AppText>
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  texts: { gap: spacing.md, marginTop: spacing.md },
});
