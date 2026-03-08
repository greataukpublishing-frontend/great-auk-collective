// Great Auk bird call player - toggle on/off

const AUDIO_FILE_URL = "/sounds/auk-call.mp3";

let currentAudio: HTMLAudioElement | null = null;
let isPlaying = false;

export function toggleAukCall() {
  if (isPlaying && currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
    isPlaying = false;
    return;
  }

  const audio = new Audio(AUDIO_FILE_URL);
  audio.volume = 0.5;
  currentAudio = audio;
  isPlaying = true;

  audio.addEventListener("ended", () => {
    isPlaying = false;
    currentAudio = null;
  });

  audio.play().catch(() => {
    isPlaying = false;
    currentAudio = null;
  });
}
