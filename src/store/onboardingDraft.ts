import { create } from 'zustand';

import type { Character } from '@/models';
import { createInitialState } from '@/services/gameEngine';

interface OnboardingDraft {
  name: string;
  character: Character;
  setName: (name: string) => void;
  setCharacter: (character: Character) => void;
}

/** Temporary choices made during onboarding; committed to the game state at the last step. */
export const useOnboardingDraft = create<OnboardingDraft>((set) => ({
  name: '',
  character: createInitialState().profile.character,
  setName: (name) => set({ name }),
  setCharacter: (character) => set({ character }),
}));
