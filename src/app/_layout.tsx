import { AmiriQuran_400Regular } from '@expo-google-fonts/amiri-quran';
import { NotoNaskhArabic_400Regular, NotoNaskhArabic_700Bold } from '@expo-google-fonts/noto-naskh-arabic';
import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { useFonts } from 'expo-font';
import { getLocales } from 'expo-localization';
import { type ErrorBoundaryProps, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { CelebrationOverlay } from '@/components/game/CelebrationOverlay';
import { ErrorState } from '@/components/ui/States';
import { languageFromLocale, translate } from '@/localization/i18n';
import { configureNotificationHandler, syncReminders } from '@/services/notifications';
import { setAmbient } from '@/services/sound';
import { startAutoSave, useGameStore } from '@/store/gameStore';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureNotificationHandler();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    NotoNaskhArabic_400Regular,
    NotoNaskhArabic_700Bold,
    AmiriQuran_400Regular,
  });
  const hydrated = useGameStore((s) => s.hydrated);
  const hydrate = useGameStore((s) => s.hydrate);
  const ambient = useGameStore((s) => s.game.settings.ambientEnabled && s.game.settings.soundEnabled);
  const notifications = useGameStore((s) => s.game.settings.notifications);
  const language = useGameStore((s) => s.game.settings.language);

  useEffect(() => {
    const stop = startAutoSave();
    hydrate(languageFromLocale(getLocales()[0]?.languageCode)).catch(() => undefined);
    return stop;
  }, [hydrate]);

  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  useEffect(() => {
    if (hydrated) setAmbient(ambient);
  }, [ambient, hydrated]);

  // Keep scheduled reminders in sync with the settings and the current language.
  useEffect(() => {
    if (hydrated) void syncReminders(notifications, language);
  }, [hydrated, notifications, language]);

  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.night }} />;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.sand }, animation: 'slide_from_right' }}>
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="quest/[id]" options={{ gestureEnabled: false, animation: 'slide_from_bottom' }} />
        <Stack.Screen name="daily" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="review" options={{ animation: 'slide_from_bottom' }} />
      </Stack>
      <CelebrationOverlay />
    </SafeAreaProvider>
  );
}

/** Shown if a screen crashes; progress is stored separately and stays safe. */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  const language = useGameStore.getState().game.settings.language;
  return (
    <View style={{ flex: 1, backgroundColor: colors.sand }}>
      <ErrorState
        title={translate(language, 'error.title')}
        body={translate(language, 'error.body')}
        actionLabel={translate(language, 'common.retry')}
        onAction={retry}
      />
    </View>
  );
}
