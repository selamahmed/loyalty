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

export const playSound = (type: 'click' | 'success' | 'error' | 'notification' | 'reward' | 'level-up') => {
  const audioContext = getAudioContext();
  if (!audioContext) return;

  try {
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
