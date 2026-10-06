import type { WorldId } from '@/models';

export const colors = {
  night: '#14173A',
  nightSoft: '#232861',
  nightLine: '#343B7A',
  primary: '#0F7A6E',
  primaryDark: '#0A5B52',
  primarySoft: '#D7F0EC',
  gold: '#F2B544',
  goldDeep: '#A86F00',
  goldSoft: '#FDF0D2',
  sand: '#FBF5EA',
  card: '#FFFFFF',
  cardAlt: '#F4EEE2',
  border: '#E6DCCB',
  text: '#1D1F33',
  textMuted: '#555A75',
  textOnDark: '#FFFFFF',
  textOnDarkMuted: '#C9CCEA',
  success: '#1F8A4C',
  successSoft: '#DDF3E5',
  error: '#C0392B',
  errorSoft: '#FBE3E0',
  info: '#2C6BC9',
  infoSoft: '#E1ECFB',
  locked: '#8D90A6',
  overlay: 'rgba(10, 12, 35, 0.6)',
} as const;

export interface WorldTheme {
  gradient: [string, string];
  accent: string;
  icon: string;
}

export const worldThemes: Record<WorldId, WorldTheme> = {
  salah: { gradient: ['#1F4E6B', '#3F8E9C'], accent: '#3F8E9C', icon: 'mosque' },
  prophets: { gradient: ['#8E4426', '#D08A45'], accent: '#C8743A', icon: 'scroll' },
  quran: { gradient: ['#17306B', '#2F5AA8'], accent: '#2F5AA8', icon: 'quran' },
  akhlaq: { gradient: ['#1F6B4C', '#4FA36B'], accent: '#2F8A5A', icon: 'heart' },
  ramadan: { gradient: ['#33195F', '#6E43AE'], accent: '#6E43AE', icon: 'moon' },
  arabic: { gradient: ['#7D2A44', '#C4584E'], accent: '#B0434F', icon: 'letter' },
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  arabic: 'NotoNaskhArabic_400Regular',
  arabicBold: 'NotoNaskhArabic_700Bold',
  quran: 'AmiriQuran_400Regular',
} as const;

export const typeScale = {
  display: 30,
  title: 24,
  heading: 20,
  body: 16,
  small: 14,
  tiny: 12,
} as const;

/** Minimum touch target recommended by platform accessibility guidelines. */
export const TOUCH_TARGET = 48;

export const shadow = {
  card: {
    shadowColor: '#1D1F33',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  raised: {
    shadowColor: '#1D1F33',
    shadowOpacity: 0.16,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
} as const;
