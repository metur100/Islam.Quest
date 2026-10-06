import * as Speech from 'expo-speech';

/**
 * Pronunciation via the device's offline text-to-speech engine (no audio files needed).
 * If no Arabic voice is installed the call simply does nothing.
 */
export function speakArabic(text: string): void {
  try {
    Speech.stop();
    Speech.speak(text, { language: 'ar', rate: 0.75 });
  } catch {
    // Speech is optional.
  }
}

export function stopSpeaking(): void {
  try {
    Speech.stop();
  } catch {
    // ignore
  }
}
