import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { useGameStore } from '@/store/gameStore';
import { colors, fonts, typeScale } from '@/theme';
import { isMostlyArabic } from '@/utils/text';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyBold' | 'small' | 'tiny' | 'label';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  /** 'quran' uses the Uthmani-optimised font for verified Quran text. */
  script?: 'auto' | 'arabic' | 'quran';
}

const VARIANTS: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.heavy, fontSize: typeScale.display, lineHeight: 38 },
  title: { fontFamily: fonts.heavy, fontSize: typeScale.title, lineHeight: 31 },
  heading: { fontFamily: fonts.bold, fontSize: typeScale.heading, lineHeight: 27 },
  body: { fontFamily: fonts.regular, fontSize: typeScale.body, lineHeight: 24 },
  bodyBold: { fontFamily: fonts.bold, fontSize: typeScale.body, lineHeight: 24 },
  small: { fontFamily: fonts.semibold, fontSize: typeScale.small, lineHeight: 20 },
  tiny: { fontFamily: fonts.semibold, fontSize: typeScale.tiny, lineHeight: 16 },
  label: { fontFamily: fonts.bold, fontSize: typeScale.tiny, lineHeight: 16, letterSpacing: 0.8 },
};

/**
 * App-wide text: applies the type scale, honours the "larger text" setting and switches to an
 * Arabic font automatically when the content is Arabic.
 */
export function AppText({
  variant = 'body',
  color = colors.text,
  align,
  script = 'auto',
  style,
  children,
  ...rest
}: AppTextProps) {
  const largeText = useGameStore((s) => s.game.settings.largeText);
  const base = VARIANTS[variant];
  const scale = largeText ? 1.15 : 1;
  const isArabic =
    script === 'arabic' || script === 'quran' || (script === 'auto' && typeof children === 'string' && isMostlyArabic(children));

  const arabicStyle: TextStyle | null = isArabic
    ? {
        fontFamily: script === 'quran' ? fonts.quran : variant === 'body' || variant === 'small' ? fonts.arabic : fonts.arabicBold,
        lineHeight: (base.fontSize ?? 16) * scale * (script === 'quran' ? 2.1 : 1.7),
        writingDirection: 'rtl',
      }
    : null;

  return (
    <Text
      {...rest}
      maxFontSizeMultiplier={1.6}
      style={[
        base,
        { color, fontSize: (base.fontSize ?? 16) * scale, lineHeight: (base.lineHeight ?? 22) * scale },
        align ? { textAlign: align } : null,
        arabicStyle,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export const textStyles = StyleSheet.create({
  center: { textAlign: 'center' },
});
