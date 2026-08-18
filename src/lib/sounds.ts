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
  if (typeof window === "undefined") return;

  let audio = audioCache.get(sound);

  if (!audio) {
    audio = new Audio(soundPaths[sound]);
    audio.preload = "auto";
    audio.volume = 0.4;
    audioCache.set(sound, audio);
  }

  audio.currentTime = 0;

  void audio.play().catch(() => {
    // Browsers can block sound until the user's first interaction.
  });
}