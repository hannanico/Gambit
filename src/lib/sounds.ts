import { getSoundEnabled, getSoundVolume } from "@/lib/sound-settings";

export type SoundName =
  | "move"
  | "capture"
  | "illegal"
  | "move-check"
  | "puzzle-correct"
  | "puzzle-wrong";

const soundPaths: Record<SoundName, string> = {
  move: "/assets/sounds/move.mp3",
  capture: "/assets/sounds/capture.mp3",
  illegal: "/assets/sounds/illegal.mp3",
  "move-check": "/assets/sounds/move-check.mp3",
  "puzzle-correct": "/assets/sounds/puzzle-correct.mp3",
  "puzzle-wrong": "/assets/sounds/puzzle-wrong.mp3",
};

const audioCache = new Map<SoundName, HTMLAudioElement>();

export function playSound(sound: SoundName) {
  if (typeof window === "undefined" || !getSoundEnabled()) return;

  let audio = audioCache.get(sound);

  if (!audio) {
    audio = new Audio(soundPaths[sound]);
    audio.preload = "auto";
    audioCache.set(sound, audio);
  }

  audio.volume = getSoundVolume();
  audio.currentTime = 0;

  void audio.play().catch(() => {
    // Browsers may block sound before the user's first interaction.
  });
}