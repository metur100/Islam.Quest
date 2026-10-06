import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Language, NotificationSettings } from '@/models';
import { translate } from '@/localization/i18n';

const CHANNEL_ID = 'learning-reminders';

/** Reminder times (local time). One gentle reminder per enabled type, never at night. */
const SCHEDULE: Record<keyof NotificationSettings, { hour: number; minute: number }> = {
  dailyChallenge: { hour: 16, minute: 0 },
  dailyQuest: { hour: 17, minute: 0 },
  dailyReview: { hour: 18, minute: 0 },
};

const TEXT_KEYS = {
  dailyQuest: ['notif.dailyQuest.title', 'notif.dailyQuest.body'],
  dailyReview: ['notif.dailyReview.title', 'notif.dailyReview.body'],
  dailyChallenge: ['notif.dailyChallenge.title', 'notif.dailyChallenge.body'],
} as const;

export function configureNotificationHandler(): void {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch {
    // Not available (e.g. tests) – reminders are optional.
  }
}

export type PermissionResult = 'granted' | 'denied' | 'unavailable';

export async function ensurePermission(language: Language): Promise<PermissionResult> {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: translate(language, 'notif.channel'),
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return 'granted';
    if (!current.canAskAgain) return 'denied';
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted ? 'granted' : 'denied';
  } catch {
    return 'unavailable';
  }
}

/** Replaces all scheduled reminders with the ones enabled in the settings. */
export async function syncReminders(settings: NotificationSettings, language: Language): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const enabled = (Object.keys(settings) as (keyof NotificationSettings)[]).filter((k) => settings[k]);
    if (enabled.length === 0) return;
    const permission = await ensurePermission(language);
    if (permission !== 'granted') return;
    for (const kind of enabled) {
      const [titleKey, bodyKey] = TEXT_KEYS[kind];
      await Notifications.scheduleNotificationAsync({
        content: { title: translate(language, titleKey), body: translate(language, bodyKey) },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: SCHEDULE[kind].hour,
          minute: SCHEDULE[kind].minute,
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch {
    // Reminders are optional; failures must never affect learning.
  }
}
