import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingFrame } from '@/components/onboarding/OnboardingFrame';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import { LANGUAGE_NAMES } from '@/localization/i18n';
import { LANGUAGES } from '@/models';
import { useGameStore } from '@/store/gameStore';
import { colors, radius, spacing } from '@/theme';

export default function LanguageStep() {
  const { t, language } = useI18n();
  const updateSettings = useGameStore((s) => s.updateSettings);
  const feedback = useFeedback();

  return (
    <OnboardingFrame
      step={2}
      title={t('onboarding.language.title')}
      subtitle={t('onboarding.language.subtitle')}
      footer={<Button label={t('common.continue')} variant="gold" iconRight="chevron" onPress={() => router.push('/onboarding/character')} />}
    >
      <View style={styles.list} accessibilityRole="radiogroup">
        {LANGUAGES.map((lang) => {
          const active = lang === language;
          return (
            <Pressable
              key={lang}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={LANGUAGE_NAMES[lang]}
              onPress={() => {
                feedback.tap();
                updateSettings({ language: lang });
              }}
              style={[styles.option, active && styles.optionActive]}
            >
              <Icon name="globe" size={24} color={active ? colors.night : colors.textOnDark} />
              <AppText variant="heading" color={active ? colors.night : colors.textOnDark} style={styles.label}>
                {LANGUAGE_NAMES[lang]}
              </AppText>
              {active ? <Icon name="check" size={24} color={colors.night} strokeWidth={3} /> : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingFrame>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.md, marginTop: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 64,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  optionActive: { backgroundColor: colors.gold, borderColor: colors.gold },
  label: { flex: 1 },
});
