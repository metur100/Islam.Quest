import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { Avatar } from '@/components/character/Avatar';
import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/hooks/useI18n';
import { useOnboardingDraft } from '@/store/onboardingDraft';
import { colors, fonts, radius, spacing } from '@/theme';
import { isValidName, MAX_NAME_LENGTH } from '@/utils/validation';

export default function NameStep() {
  const { t } = useI18n();
  const name = useOnboardingDraft((s) => s.name);
  const setName = useOnboardingDraft((s) => s.setName);
  const character = useOnboardingDraft((s) => s.character);
  const [touched, setTouched] = useState(false);
  const valid = isValidName(name);

  const next = () => {
    setTouched(true);
    if (valid) router.push('/onboarding/explain');
  };

  return (
    <OnboardingFrame
      step={4}
      title={t('onboarding.name.title')}
      subtitle={t('onboarding.name.subtitle')}
      footer={<Button label={t('common.continue')} variant="gold" iconRight="chevron" onPress={next} disabled={touched && !valid} />}
    >
      <View style={styles.avatar}>
        <Avatar character={character} size={130} />
      </View>
      <TextInput
        value={name}
        onChangeText={(v) => setName(v.slice(0, MAX_NAME_LENGTH))}
        placeholder={t('onboarding.name.placeholder')}
        placeholderTextColor="#8E92B8"
        accessibilityLabel={t('onboarding.name.placeholder')}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={MAX_NAME_LENGTH}
        returnKeyType="done"
        onSubmitEditing={next}
        onBlur={() => setTouched(true)}
        style={styles.input}
      />
      {touched && !valid ? (
        <AppText variant="small" color={colors.gold} align="center" accessibilityLiveRegion="polite">
          {t('onboarding.name.error')}
        </AppText>
      ) : null}
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignSelf: 'center',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  input: {
    minHeight: 60,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.text,
    textAlign: 'center',
  },
});
