import { AppData } from './AppData';

const isEnabled = (value) => Number(value) === 0;

export function isSoundEnabled() {
  return isEnabled(AppData.prefs?.[2]);
}

export function isVibroEnabled() {
  return isEnabled(AppData.prefs?.[3]);
}

export function playSound(sound, volume = 0.5) {
  if (!isSoundEnabled() || !sound) return;
  if (!sound.paused) sound.pause();
  sound.currentTime = 0;
  sound.volume = volume;
  sound.play();
}

export function playHaptic(type = 'light') {
  if (!isVibroEnabled()) return;
  window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.(type);
}

export function playEffects(sound, type = 'light') {
  playSound(sound);
  playHaptic(type);
}
