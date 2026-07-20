// Web Audio API Synthesizer for UI Sound Effects
// Self-contained, zero asset downloads, 100% offline-ready

let audioCtx = null;
let masterGain = null;
let isMuted = false;

function initAudio() {
  if (audioCtx) return;
  
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  
  audioCtx = new AudioContextClass();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // default moderate volume
  masterGain.connect(audioCtx.destination);
}

export const soundEngine = {
  setMute(mute) {
    isMuted = mute;
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(mute ? 0 : 0.3, audioCtx.currentTime);
    }
  },
  
  getMute() {
    return isMuted;
  },

  playHover() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.04);

    gain.gain.setValueAtTime(0.02, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.05);
  },

  playClick() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') {
      // try to resume context on user action
      if (audioCtx) audioCtx.resume();
      return;
    }

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.08);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(t);
    osc.stop(t + 0.09);
  },

  playSuccess() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const t = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
    
    notes.forEach((freq, idx) => {
      const noteTime = t + idx * 0.08;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);
      
      gain.gain.setValueAtTime(0.0, noteTime);
      gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  },

  playError() {
    if (isMuted) return;
    initAudio();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const t = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(180, t);
    osc1.frequency.linearRampToValueAtTime(100, t + 0.25);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(185, t);
    osc2.frequency.linearRampToValueAtTime(102, t + 0.25);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }
};
