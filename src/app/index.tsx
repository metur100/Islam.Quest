import { Redirect } from 'expo-router';

import { useGameStore } from '@/store/gameStore';

export default function Index() {
  const onboarded = useGameStore((s) => s.game.onboarded);
  return <Redirect href={onboarded ? '/(tabs)' : '/onboarding'} />;
}
