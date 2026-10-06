# Islam Quest

An educational Islamic adventure game for children (about 7–14 years). Players create a character and travel through six worlds — **Salah, the Prophets, the Quran, Akhlaq, Ramadan and Arabic** — learning through short lessons, stories, quizzes and mini-games.

**Learn → Play → Remember → Reward**

- Free, no ads, no purchases, no accounts, no tracking
- Fully offline (the only optional network use is streaming a Quran recitation when the player taps “Listen”)
- Bosnian, German and English
- Built with Expo (React Native) + TypeScript

## Features

| Area | What it does |
| --- | --- |
| Onboarding | Welcome → language → character → name → how it works → first quest |
| Worlds & quests | 6 worlds, 37 quests, unlocked progressively; quests inside a world unlock in order |
| Question types | Multiple choice, true/false, scenario, ordering/timeline, matching, memory, Quran missing word, ayah ordering |
| Prophet stories | Adam, Nuh, Ibrahim, Musa, Yusuf, Yunus, Isa, Muhammad ﷺ — intro → story → interaction → story → challenge → lesson → quiz → “What did we learn?” |
| Quran | Memorisation by repetition, “test myself” mode, ayah ordering and missing-word exercises on verified text |
| Arabic | Alphabet, harakat, vocabulary, letter tracing, offline text-to-speech pronunciation |
| Ramadan | 30-day calendar with a good-deed tracker; fasting is framed by age and family guidance |
| XP & levels | XP only for learning (each reward granted once); level curve 100, 150, 200 … |
| Review | Leitner-style spaced review of missed questions (“Let's Review”), weakest topics first |
| Daily challenge | One offline challenge per day (question, scenario, mini quiz, fact, memory) |
| Badges & streak | 15 badges; streak counts days with meaningful learning |
| Settings | Language, sound, ambient sound, vibration, larger text, reduced motion, reminders, reset (with confirmation), about, privacy, sources |
| Accessibility | Screen-reader labels and roles, 48dp+ touch targets, larger-text option, reduced motion, high-contrast palette |

## Religious content

Religious accuracy is treated as a requirement:

- All content lives in JSON under `src/data/content/` — separate from the code — and every lesson, story and question carries `sourceName`/`sourceReference`.
- **Quran text is never typed by hand.** `src/data/quran/surahs.json` is generated from the Tanzil Uthmani text (via api.alquran.cloud) with Saheeh International, Bubenheim & Elyas and Besim Korkut translations.
- Stories retell the Quranic narrative without invented events or dialogue.
- Prophets are never depicted: scenes are drawn only as landscapes, architecture and objects (`src/components/scene/SceneView.tsx`).
- Where valid scholarly differences exist (wudu details, prayer times, Taraweeh, Zakat al-Fitr, …) the lesson shows a “Scholars differ” note.
- The app is a learning companion; it does not issue rulings and does not replace teachers or formal Quran/Arabic study.

## Project structure

```
src/
  app/            Expo Router screens (tabs, onboarding, quest player, review, daily, settings, …)
  components/     ui/ (Button, Card, XPBar, Badge, …), game/, questions/, steps/, scene/, character/
  data/           content JSON per world, Quran JSON and typed loaders
  models/         TypeScript models (World, Quest, Lesson, Question, ReviewItem, GameState, …)
  services/       pure game logic: xp, quiz, streak, review, unlocking, badges, daily, gameEngine
                  + platform services: sound, speech, notifications
  storage/        AsyncStorage persistence with versioned migration
  store/          Zustand store (state + actions, debounced autosave)
  hooks/          useI18n, useProgress, useFeedback, useReducedMotion
  localization/   en / de / bs dictionaries (typed keys)
  theme/          colours, spacing, typography, world themes
scripts/          generate-sounds.js (UI sounds), generate-icons.js (app icons)
```

## Development

```bash
npm install
npm start               # Expo dev server
npm run android         # build & run a development build on a device/emulator
```

## Quality checks

```bash
npm run typecheck       # tsc --noEmit
npm run lint            # eslint
npm test                # jest (XP, levels, unlocking, review, streak, storage, quiz, content integrity, i18n)
npm run verify          # all three
```

## Android release build

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# → android/app/build/outputs/apk/release/app-release.apk
```

The generated project signs release builds with the debug keystore, which is fine for testing. For the Play Store, create an upload keystore and configure signing (or use `eas build -p android`). `android/` is generated (Continuous Native Generation) and not committed.

## Assets

- UI sounds and the ambient wind loop are synthesised by `scripts/generate-sounds.js` (no music).
- App icons are rendered by `scripts/generate-icons.js`.
- Fonts: Nunito, Noto Naskh Arabic and Amiri Quran (SIL Open Font License) via `@expo-google-fonts`.

## Privacy

No personal data leaves the device. Name, character and progress are stored locally and can be deleted from Settings → Reset progress.
