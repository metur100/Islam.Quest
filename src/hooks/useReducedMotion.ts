import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useGameStore } from '@/store/gameStore';

/** True when the system or the in-app setting asks for fewer animations. */
export function useReducedMotion(): boolean {
  const setting = useGameStore((s) => s.game.settings.reducedMotion);
  const [system, setSystem] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => mounted && setSystem(value))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  return setting || system;
}
