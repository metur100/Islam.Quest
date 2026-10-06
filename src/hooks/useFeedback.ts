import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

import { playSound, type SoundName } from '@/services/sound';
import { useGameStore } from '@/store/gameStore';

const HAPTIC: Record<SoundName, () => Promise<void>> = {
  click: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  failure: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  reward: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
};

/** Sound + haptic feedback that respects the player's settings. */
export function useFeedback() {
  const soundEnabled = useGameStore((s) => s.game.settings.soundEnabled);
  const hapticsEnabled = useGameStore((s) => s.game.settings.hapticsEnabled);

  return useMemo(() => {
    const fire = (name: SoundName) => {
      if (soundEnabled) playSound(name);
      if (hapticsEnabled) HAPTIC[name]().catch(() => undefined);
    };
    return {
      tap: () => fire('click'),
      success: () => fire('success'),
      failure: () => fire('failure'),
      reward: () => fire('reward'),
    };
  }, [soundEnabled, hapticsEnabled]);
}
