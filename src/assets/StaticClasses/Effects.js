import { AppData } from './AppData';

const isEnabled = (value) => Number(value) === 0;

export function isSoundEnabled() {
  return isEnabled(AppData.prefs?.[2]);
}

export function isVibroEnabled() {
  return isEnabled(AppData.prefs?.[3]);
}

export function playSound() {
  // UI tap sounds interrupt external music on iOS/Telegram. Keep the API so callers
  // still get haptics through playEffects, but do not start short Audio clips.
  return;
}

export function playHaptic(type = 'light') {
  if (!isVibroEnabled()) return;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type);
}

export function playEffects(sound, type = 'light') {
  playSound(sound);
  playHaptic(type);
}
