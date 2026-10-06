import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

export type SoundName = 'click' | 'success' | 'failure' | 'reward';

const SOURCES: Record<SoundName | 'ambient', number> = {
  click: require('../../assets/sounds/click.wav'),
  success: require('../../assets/sounds/success.wav'),
  failure: require('../../assets/sounds/failure.wav'),
  reward: require('../../assets/sounds/reward.wav'),
  ambient: require('../../assets/sounds/ambient.wav'),
};

const VOLUME: Record<SoundName, number> = { click: 0.35, success: 0.6, failure: 0.5, reward: 0.7 };

const players = new Map<SoundName, AudioPlayer>();
let ambientPlayer: AudioPlayer | null = null;
let configured = false;

async function configure() {
  if (configured) return;
  configured = true;
  try {
    // Respect the silent switch: UI sounds should never surprise a child in class.
    await setAudioModeAsync({ playsInSilentMode: false, shouldPlayInBackground: false });
  } catch {
    // Audio mode is a best-effort optimisation.
  }
}

function playerFor(name: SoundName): AudioPlayer | null {
  try {
    let player = players.get(name);
    if (!player) {
      player = createAudioPlayer(SOURCES[name]);
      player.volume = VOLUME[name];
      players.set(name, player);
    }
    return player;
  } catch {
    return null;
  }
}

/**
 * Plays a short UI sound. Audio is optional: any failure is swallowed so the app keeps working
 * on devices without audio output.
 */
export function playSound(name: SoundName): void {
  void configure();
  const player = playerFor(name);
  if (!player) return;
  try {
    player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // ignore
  }
}

export function setAmbient(enabled: boolean): void {
  try {
    if (enabled) {
      void configure();
      if (!ambientPlayer) {
        ambientPlayer = createAudioPlayer(SOURCES.ambient);
        ambientPlayer.loop = true;
        ambientPlayer.volume = 0.18;
      }
      ambientPlayer.play();
    } else if (ambientPlayer) {
      ambientPlayer.pause();
    }
  } catch {
    // ignore
  }
}

/** Plays (or stops) a streamed recitation. Resolves false when audio cannot be loaded. */
let streamPlayer: AudioPlayer | null = null;

export function playStream(url: string): boolean {
  try {
    stopStream();
    void configure();
    streamPlayer = createAudioPlayer({ uri: url });
    streamPlayer.play();
    return true;
  } catch {
    streamPlayer = null;
    return false;
  }
}

export function stopStream(): void {
  if (!streamPlayer) return;
  try {
    streamPlayer.pause();
    streamPlayer.release();
  } catch {
    // ignore
  }
  streamPlayer = null;
}

export function currentStream(): AudioPlayer | null {
  return streamPlayer;
}
