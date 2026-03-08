// Great Auk bird call player - toggle on/off with state listeners

const AUDIO_FILE_URL = "/sounds/auk-call.mp3";

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;
const listeners: Set<(playing: boolean) => void> = new Set();

function notifyListeners() {
  listeners.forEach((fn) => fn(isPlaying));
}

export function onAukPlayingChange(fn: (playing: boolean) => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function getAukPlaying() {
  return isPlaying;
}

export function toggleAukCall() {
  if (isPlaying && currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isPlaying = false;
    notifyListeners();
    return;
  }

  const audio = new Audio(AUDIO_FILE_URL);
  audio.volume = 0.5;
  currentAudio = audio;
  isPlaying = true;
  notifyListeners();

  audio.addEventListener("ended", () => {
    isPlaying = false;
    currentAudio = null;
    notifyListeners();
  });

  audio.play().catch(() => {
    isPlaying = false;
    currentAudio = null;
    notifyListeners();
  });
}
