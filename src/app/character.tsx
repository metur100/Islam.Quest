import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

import { CharacterEditor } from '@/components/character/CharacterEditor';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/hooks/useI18n';
import { useGameStore } from '@/store/gameStore';
import { colors, fonts, radius, spacing } from '@/theme';
import { isValidName, MAX_NAME_LENGTH } from '@/utils/validation';

export default function CharacterScreen() {
  const { t } = useI18n();
  const profile = useGameStore((s) => s.game.profile);
  const setCharacter = useGameStore((s) => s.setCharacter);
  const setName = useGameStore((s) => s.setName);
  const [character, setDraft] = useState(profile.character);
  const [name, setNameDraft] = useState(profile.name);
  const valid = isValidName(name);

  const save = () => {
    if (!valid) return;
    setCharacter(character);
    setName(name);
    router.back();
  };

  return (
    <Screen header={<TopBar title={t('character.title')} />}>
      <TextInput
        value={name}
        onChangeText={(v) => setNameDraft(v.slice(0, MAX_NAME_LENGTH))}
        placeholder={t('onboarding.name.placeholder')}
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={t('onboarding.name.placeholder')}
        maxLength={MAX_NAME_LENGTH}
        style={styles.input}
      />
      {!valid ? (
        <AppText variant="small" color={colors.error}>
          {t('onboarding.name.error')}
        </AppText>
      ) : null}
      <CharacterEditor character={character} onChange={setDraft} />
      <Button label={t('common.save')} icon="check" onPress={save} disabled={!valid} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.text,
  },
});
