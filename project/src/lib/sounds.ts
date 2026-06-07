export const playSound = (type: 'click' | 'success' | 'error' | 'notification' | 'reward' | 'level-up') => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
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
        frequency = 784; // G5
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
        frequency = 1047; // C6
        duration = 0.3;
        break;
    }

    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Audio not supported, silently fail
  }
};
