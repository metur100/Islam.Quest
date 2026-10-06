import AsyncStorage from '@react-native-async-storage/async-storage';

import { applyQuestComplete, createInitialState, STATE_VERSION } from '@/services/gameEngine';
import { CONTENT_GRAPH } from '@/data';
import { clearGameState, loadGameState, migrateState, saveGameState, STORAGE_KEY } from '@/storage/persistence';
import { useGameStore } from '@/store/gameStore';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('local persistence', () => {
  it('returns null when nothing is stored', async () => {
    expect(await loadGameState()).toBeNull();
  });

  it('round-trips the full game state', async () => {
    const state = applyQuestComplete(
      { ...createInitialState('bs'), onboarded: true, profile: { ...createInitialState().profile, name: 'Amina' } },
      'salah-q1',
      [true, false],
      CONTENT_GRAPH,
      new Date('2026-10-06T10:00:00'),
    ).state;
    await saveGameState(state);
    expect(await loadGameState()).toEqual(state);
  });

  it('survives corrupt data', async () => {
    await AsyncStorage.setItem(STORAGE_KEY, '{not json');
    expect(await loadGameState()).toBeNull();
  });

  it('rejects data from a newer app version', () => {
    expect(migrateState({ version: STATE_VERSION + 1 })).toBeNull();
    expect(migrateState('hello')).toBeNull();
  });

  it('fills in fields that were added later', () => {
    const old = { version: 1, onboarded: true, xp: 40, settings: { language: 'de' }, profile: { name: 'Yusuf' } };
    const migrated = migrateState(old)!;
    expect(migrated.xp).toBe(40);
    expect(migrated.settings.language).toBe('de');
    expect(migrated.settings.notifications.dailyQuest).toBe(false);
    expect(migrated.profile.name).toBe('Yusuf');
    expect(migrated.profile.character.hairStyle).toBeDefined();
    expect(migrated.recitePractice).toEqual({});
  });

  it('clears stored progress', async () => {
    await saveGameState(createInitialState());
    await clearGameState();
    expect(await AsyncStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});

describe('game store', () => {
  it('hydrates with the device language when nothing is stored', async () => {
    await useGameStore.getState().hydrate('de');
    expect(useGameStore.getState().hydrated).toBe(true);
    expect(useGameStore.getState().game.settings.language).toBe('de');
  });

  it('restores stored progress on start', async () => {
    await saveGameState({ ...createInitialState('bs'), xp: 321, onboarded: true });
    await useGameStore.getState().hydrate('en');
    expect(useGameStore.getState().game.xp).toBe(321);
    expect(useGameStore.getState().game.settings.language).toBe('bs');
  });

  it('queues celebrations for new badges and resets everything', async () => {
    await useGameStore.getState().hydrate('en');
    useGameStore.getState().completeLesson('salah-what');
    expect(useGameStore.getState().celebrations).toContainEqual({ kind: 'badge', id: 'first_lesson' });
    await useGameStore.getState().resetProgress();
    expect(useGameStore.getState().game.completedLessons).toEqual([]);
    expect(useGameStore.getState().celebrations).toEqual([]);
  });
});
