import { router } from 'expo-router';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { SceneView } from '@/components/scene/SceneView';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { QUESTS } from '@/data';
import { useI18n } from '@/hooks/useI18n';
import { useGameStore } from '@/store/gameStore';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { colors } from '@/theme';

export default function StartStep() {
  const { t, language } = useI18n();
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const name = useOnboardingDraft((s) => s.name);
  const character = useOnboardingDraft((s) => s.character);

  const finish = (startQuest: boolean) => {
    completeOnboarding({ name, character, language });
    router.replace('/(tabs)');
    if (startQuest) {
      const first = QUESTS.find((q) => q.worldId === 'salah' && q.order === 1);
      if (first) router.push({ pathname: '/quest/[id]', params: { id: first.id } });
    }
  };

  return (
    <OnboardingFrame
      step={6}
      title={t('onboarding.start.title')}
      footer={
        <>
          <Button label={t('onboarding.start.cta')} variant="gold" icon="play" onPress={() => finish(true)} />
          <Button label={t('onboarding.start.later')} variant="light" onPress={() => finish(false)} />
        </>
      }
    >
      <SceneView scene={{ sky: 'dawn', elements: ['stars', 'crescent', 'hills', 'mosque', 'lanterns'] }} height={220} />
      <AppText variant="body" color={colors.textOnDark} align="center">
        {t('onboarding.start.body')}
      </AppText>
    </OnboardingFrame>
  );
}
