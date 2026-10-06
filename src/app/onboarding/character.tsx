import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { CharacterEditor } from '@/components/character/CharacterEditor';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { colors, radius, spacing } from '@/theme';

export default function CharacterStep() {
  const { t } = useI18n();
  const character = useOnboardingDraft((s) => s.character);
  const setCharacter = useOnboardingDraft((s) => s.setCharacter);

  return (
    <OnboardingFrame
      step={3}
      title={t('onboarding.character.title')}
      subtitle={t('onboarding.character.subtitle')}
      footer={<Button label={t('common.continue')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/name')} />}
    >
      <View style={styles.panel}>
        <CharacterEditor character={character} onChange={setCharacter} />
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  panel: { backgroundColor: colors.sand, borderRadius: radius.xl, padding: spacing.lg },
});
