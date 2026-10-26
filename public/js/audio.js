// Sound engine using Web Audio API for noir RPG atmosphere
(function (global) {
  let ctx = null;
  let isMuted = localStorage.getItem('audioMuted') === 'true';

  function getContext() {
    if (!ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  const SoundEngine = {
    get muted() { return isMuted; },
    toggleMute() {
      isMuted = !isMuted;
      localStorage.setItem('audioMuted', isMuted);
      return isMuted;
    },

    playClick() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, c.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.04);
    },

    playTypewriter() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      // Soft click sound
      const osc = c.createOscillator();
      const gain = c.createGain();
      const freq = 600 + Math.random() * 400;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, c.currentTime);
      gain.gain.setValueAtTime(0.015, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.025);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.025);
    },

    playDiceRoll() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      // Rapid series of tiny thumps
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          if (isMuted) return;
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(150 + Math.random() * 200, c.currentTime);
          gain.gain.setValueAtTime(0.05, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.05);
        }, i * 80);
      }
    },

    playSuccess() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      // Upward chord (Major 3rd / 5th)
      const now = c.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.08, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.4);
      });
    },

    playFailure() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      // Low descending tone
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    },

    playSuspense() {
      if (isMuted) return;
      const c = getContext(); if (!c) return;
      // Dramatic low drone sting
      const now = c.currentTime;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65.41, now); // C2
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc.connect(gain);
      gain.connect(c.destination);
      osc.start(now);
      osc.stop(now + 1.2);
    }
  };

  global.SoundEngine = SoundEngine;
})(window);