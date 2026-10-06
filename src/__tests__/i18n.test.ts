import bs from '@/localization/bs';
import de from '@/localization/de';
import en from '@/localization/en';
import { languageFromLocale, localize, translate } from '@/localization/i18n';

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe('localization', () => {
  it('has every key in every language with the same placeholders', () => {
    for (const dict of [de, bs]) {
      expect(Object.keys(dict).sort()).toEqual(Object.keys(en).sort());
      for (const key of Object.keys(en) as (keyof typeof en)[]) {
        expect(dict[key].trim().length).toBeGreaterThan(0);
        expect({ key, p: placeholders(dict[key]) }).toEqual({ key, p: placeholders(en[key]) });
      }
    }
  });

  it('interpolates parameters', () => {
    expect(translate('en', 'common.level', { level: 4 })).toBe('Level 4');
    expect(translate('de', 'common.level', { level: 4 })).toBe('Stufe 4');
    expect(translate('bs', 'common.level', { level: 4 })).toBe('Nivo 4');
  });

  it('maps device locales to supported languages', () => {
    expect(languageFromLocale('bs')).toBe('bs');
    expect(languageFromLocale('hr')).toBe('bs');
    expect(languageFromLocale('de')).toBe('de');
    expect(languageFromLocale('fr')).toBe('en');
    expect(languageFromLocale(undefined)).toBe('en');
  });

  it('localizes content with an English fallback', () => {
    expect(localize({ en: 'Hi', de: 'Hallo', bs: '' }, 'bs')).toBe('Hi');
    expect(localize({ en: 'Hi', de: 'Hallo', bs: 'Zdravo' }, 'de')).toBe('Hallo');
    expect(localize(undefined, 'en')).toBe('');
  });
});
