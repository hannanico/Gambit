const SOUND_ENABLED_KEY = "gambit:sound-enabled";
const SOUND_VOLUME_KEY = "gambit:sound-volume";

const DEFAULT_VOLUME = 0.4;

export function getSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;

  const stored = window.localStorage.getItem(SOUND_ENABLED_KEY);

  return stored !== "false";
}

export function setSoundEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(SOUND_ENABLED_KEY, String(enabled));
}

export function getSoundVolume(): number {
  if (typeof window === "undefined") return DEFAULT_VOLUME;

  const stored = window.localStorage.getItem(SOUND_VOLUME_KEY);
  const volume = stored === null ? DEFAULT_VOLUME : Number(stored);

  if (!Number.isFinite(volume)) return DEFAULT_VOLUME;

  return Math.min(1, Math.max(0, volume));
}

export function setSoundVolume(volume: number) {
  if (typeof window === "undefined") return;

  const safeVolume = Math.min(1, Math.max(0, volume));

  window.localStorage.setItem(SOUND_VOLUME_KEY, String(safeVolume));
}