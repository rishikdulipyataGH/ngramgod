// Generate sounds using Web Audio API
const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

/**
 * Play a simple beep sound
 * @param {number} frequency - Frequency in Hz
 * @param {number} duration - Duration in seconds
 * @param {number} volume - Volume (0-1)
 */
function playBeep(frequency, duration, volume = 0.3) {
  if (!audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

/**
 * Play success sound (ascending notes)
 */
export function playSuccessSound() {
  if (!audioContext) return;
  
  const notes = [523.25, 659.25, 783.99]; // C, E, G
  notes.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.1, 0.2), i * 80);
  });
}

/**
 * Play error sound (descending notes)
 */
export function playErrorSound() {
  if (!audioContext) return;
  
  const notes = [400, 350]; // Descending
  notes.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.15, 0.15), i * 100);
  });
}

/**
 * Play correct keystroke sound (short high beep)
 */
export function playCorrectSound() {
  playBeep(800, 0.05, 0.1);
}

/**
 * Play incorrect keystroke sound (short low beep)
 */
export function playIncorrectSound() {
  playBeep(200, 0.08, 0.12);
}

/**
 * Play celebration sound (multiple ascending notes)
 */
export function playCelebrationSound() {
  if (!audioContext) return;
  
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave)
  notes.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.2, 0.25), i * 100);
  });
}
