let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  } catch {
    return null;
  }
}

export const playSound = (type: 'click' | 'success' | 'error' | 'notification' | 'reward' | 'level-up' | 'redeem') => {
  const audioContext = getAudioContext();
  if (!audioContext) return;

  try {
    if (type === 'redeem') {
      [
        { frequency: 523, delay: 0, duration: 0.08 },
        { frequency: 659, delay: 0.08, duration: 0.09 },
        { frequency: 784, delay: 0.17, duration: 0.11 },
        { frequency: 1047, delay: 0.29, duration: 0.16 },
      ].forEach(note => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.type = 'triangle';
        oscillator.frequency.value = note.frequency;
        const start = audioContext.currentTime + note.delay;
        gainNode.gain.setValueAtTime(0.001, start);
        gainNode.gain.exponentialRampToValueAtTime(0.22, start + 0.012);
        gainNode.gain.exponentialRampToValueAtTime(0.01, start + note.duration);
        oscillator.start(start);
        oscillator.stop(start + note.duration + 0.02);
      });
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    let frequency = 400;
    let duration = 0.1;

    switch (type) {
      case 'click':
        frequency = 800;
        duration = 0.05;
        break;
      case 'success':
        frequency = 784;
        duration = 0.2;
        break;
      case 'error':
        frequency = 200;
        duration = 0.15;
        break;
      case 'notification':
        frequency = 600;
        duration = 0.12;
        break;
      case 'reward':
        frequency = 900;
        duration = 0.25;
        break;
      case 'level-up':
        frequency = 1047;
        duration = 0.3;
        break;
    }

    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Audio not supported
  }
};
