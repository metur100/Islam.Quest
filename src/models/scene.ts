export type SkyKind = 'night' | 'dawn' | 'day' | 'sunset' | 'dusk' | 'storm' | 'sea';

export type SceneElement =
  | 'stars'
  | 'crescent'
  | 'fullMoon'
  | 'sun'
  | 'clouds'
  | 'rain'
  | 'mountains'
  | 'hills'
  | 'dunes'
  | 'sea'
  | 'partedSea'
  | 'waves'
  | 'palms'
  | 'garden'
  | 'tree'
  | 'mosque'
  | 'kaaba'
  | 'lanterns'
  | 'ark'
  | 'fire'
  | 'well'
  | 'cave'
  | 'city'
  | 'whale'
  | 'book'
  | 'pattern'
  | 'caravan'
  | 'river'
  | 'basket'
  | 'grain'
  | 'dates'
  | 'prayerMat';

export interface SceneSpec {
  sky: SkyKind;
  elements: SceneElement[];
}
