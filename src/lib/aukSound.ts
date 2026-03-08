// Great Auk bird call player
// Since the Great Auk is extinct, we synthesize a seabird-like call
// Replace with an actual audio file by setting AUDIO_FILE_URL

const AUDIO_FILE_URL = "/sounds/auk-call.mp3"; // Replace with actual file when available

let audioContext: AudioContext | null = null;

// Synthesized bird call as fallback
function playSynthesizedBirdCall() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  
  const ctx = audioContext;
  const now = ctx.currentTime;
  
  // Create a seabird-like squawk using FM synthesis
  const calls = [
    { start: 0, duration: 0.15, freq: 1200, freqEnd: 800 },
    { start: 0.2, duration: 0.12, freq: 1100, freqEnd: 700 },
    { start: 0.38, duration: 0.18, freq: 1300, freqEnd: 600 },
  ];
  
  calls.forEach(({ start, duration, freq, freqEnd }) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    oscillator.type = "sawtooth";
    oscillator.frequency.setValueAtTime(freq, now + start);
    oscillator.frequency.exponentialRampToValueAtTime(freqEnd, now + start + duration);
    
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1000, now);
    filter.Q.setValueAtTime(2, now);
    
    gainNode.gain.setValueAtTime(0, now + start);
    gainNode.gain.linearRampToValueAtTime(0.15, now + start + 0.02);
    gainNode.gain.setValueAtTime(0.15, now + start + duration * 0.7);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.start(now + start);
    oscillator.stop(now + start + duration + 0.1);
  });
}

// Try to play audio file, fallback to synthesized
export async function playAukCall() {
  try {
    // Try audio file first
    const audio = new Audio(AUDIO_FILE_URL);
    audio.volume = 0.5;
    
    await audio.play();
  } catch {
    // File not found or can't play - use synthesized version
    playSynthesizedBirdCall();
  }
}
