import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useFeedback } from '@/hooks/useFeedback';
import { useI18n } from '@/hooks/useI18n';
import type { TranslationKey } from '@/localization/i18n';
import type { Accessory, Character, HairStyle, Headwear, Outfit, SkinTone } from '@/models';
import { colors, radius, spacing, TOUCH_TARGET } from '@/theme';

import { Avatar, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from './Avatar';

const HAIR_STYLES: HairStyle[] = ['short', 'curly', 'long', 'buzz', 'bun'];
const HEADWEAR: Headwear[] = ['none', 'kufi', 'hijab', 'cap'];
const OUTFITS: Outfit[] = ['hoodie', 'thobe', 'jacket', 'abaya'];
const ACCESSORIES: Accessory[] = ['none', 'glasses', 'backpack', 'scarf', 'lantern'];

interface CharacterEditorProps {
  character: Character;
  onChange: (character: Character) => void;
}

export function CharacterEditor({ character, onChange }: CharacterEditorProps) {
  const { t } = useI18n();
  const set = <K extends keyof Character>(key: K, value: Character[K]) => onChange({ ...character, [key]: value });

  return (
    <View style={styles.root}>
      <View style={styles.preview} accessible accessibilityLabel={t('a11y.avatar')}>
        <Avatar character={character} size={150} />
      </View>

      <SwatchGroup
        title={t('character.skin')}
        colorsList={SKIN_TONES}
        selected={character.skinTone}
        onSelect={(i) => set('skinTone', i as SkinTone)}
      />
      <ChipGroup
        title={t('character.headwear')}
        options={HEADWEAR}
        labelKey={(o) => `character.headwear.${o}` as TranslationKey}
        selected={character.headwear}
        onSelect={(o) => set('headwear', o)}
      />
      {character.headwear !== 'hijab' ? (
        <>
          <ChipGroup
            title={t('character.hair')}
            options={HAIR_STYLES}
            labelKey={(o) => `character.hair.${o}` as TranslationKey}
            selected={character.hairStyle}
            onSelect={(o) => set('hairStyle', o)}
          />
          <SwatchGroup
            title={t('character.hairColor')}
            colorsList={HAIR_COLORS}
            selected={character.hairColor}
            onSelect={(i) => set('hairColor', i)}
          />
        </>
      ) : null}
      <ChipGroup
        title={t('character.outfit')}
        options={OUTFITS}
        labelKey={(o) => `character.outfit.${o}` as TranslationKey}
        selected={character.outfit}
        onSelect={(o) => set('outfit', o)}
      />
      <SwatchGroup
        title={t('character.outfitColor')}
        colorsList={OUTFIT_COLORS}
        selected={character.outfitColor}
        onSelect={(i) => set('outfitColor', i)}
      />
      <ChipGroup
        title={t('character.accessory')}
        options={ACCESSORIES}
        labelKey={(o) => `character.accessory.${o}` as TranslationKey}
        selected={character.accessory}
        onSelect={(o) => set('accessory', o)}
      />
    </View>
  );
}

function ChipGroup<T extends string>({
  title,
  options,
  labelKey,
  selected,
  onSelect,
}: {
  title: string;
  options: T[];
  labelKey: (option: T) => TranslationKey;
  selected: T;
  onSelect: (option: T) => void;
}) {
  const { t } = useI18n();
  const feedback = useFeedback();
  return (
    <View style={styles.group}>
      <AppText variant="label" color={colors.textMuted}>
        {title.toUpperCase()}
      </AppText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {options.map((option) => {
          const active = option === selected;
          const label = t(labelKey(option));
          return (
            <Pressable
              key={option}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t('character.option', { group: title, value: label })}
              onPress={() => {
                feedback.tap();
                onSelect(option);
              }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <AppText variant="small" color={active ? colors.textOnDark : colors.text}>
                {label}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SwatchGroup({
  title,
  colorsList,
  selected,
  onSelect,
}: {
  title: string;
  colorsList: readonly string[];
  selected: number;
  onSelect: (index: number) => void;
}) {
  const { t } = useI18n();
  const feedback = useFeedback();
  return (
    <View style={styles.group}>
      <AppText variant="label" color={colors.textMuted}>
        {title.toUpperCase()}
      </AppText>
      <View style={styles.swatches}>
        {colorsList.map((color, index) => {
          const active = index === selected;
          return (
            <Pressable
              key={color}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t('character.option', { group: title, value: String(index + 1) })}
              onPress={() => {
                feedback.tap();
                onSelect(index);
              }}
              style={[styles.swatch, { backgroundColor: color }, active && styles.swatchActive]}
            >
              {active ? <Icon name="check" size={20} color="#FFFFFF" strokeWidth={3} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: spacing.lg },
  preview: {
    alignSelf: 'center',
    backgroundColor: colors.goldSoft,
    borderRadius: 999,
    padding: spacing.md,
    width: 190,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  group: { gap: spacing.sm },
  chips: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    minHeight: TOUCH_TARGET - 4,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  swatch: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    borderRadius: TOUCH_TARGET / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  swatchActive: { borderColor: colors.night },
});
