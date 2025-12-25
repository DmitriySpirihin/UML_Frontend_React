
import { useEffect, useRef } from 'react';

const BreathAudio = (isEnabled = false) => {
 const audioContextRef = useRef(null);
  const activeNodesRef = useRef([]);

  const cleanup = () => {
    activeNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  const initAudio = () => {
    if (audioContextRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('AudioContext not supported');
    }
  };

  // === INHALE: Wind through bamboo (airy, rising) ===
  const playInhale = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    // Carrier: soft noise + filtered high frequencies
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.6, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.3));
    }
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 800;
    filter.Q.value = 1.0;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.6);

    activeNodesRef.current.push(noise, filter, gain);
  };

  // === EXHALE: Ocean wave receding (warm, falling) ===
  const playExhale = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    // Low drone + filtered noise "whoosh"
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 98; // G2
    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(0.08, now);
    droneGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
    drone.connect(droneGain);
    droneGain.connect(ctx.destination);
    drone.start(now);
    drone.stop(now + 1.2);

    // Water-like noise
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 1.0, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      // Simulate wave: loud → soft
      const t = i / noiseData.length;
      noiseData[i] = (Math.random() * 2 - 1) * (1 - t) * 0.3;
    }
    noise.buffer = noiseBuffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 1200;
    lowpass.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

    noise.connect(lowpass);
    lowpass.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 1.0);

    activeNodesRef.current.push(drone, droneGain, noise, lowpass, noiseGain);
  };

  // === HOLD: Singing bowl (clear, resonant, short) ===
  const playHold = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    // Fundamental + harmonics (like a real bowl)
    const freqs = [392, 587, 784]; // G4, D5, G5
    const gains = [0.15, 0.08, 0.04];

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(gains[i], now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.8);
      activeNodesRef.current.push(osc, gain);
    });
  };

  // === REST: Ambient temple drone (warm, enveloping) ===
  const playRest = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    // Sub-bass + mid drone + subtle texture
    const bass = ctx.createOscillator();
    bass.type = 'sine';
    bass.frequency.value = 65.4; // C2
    const bassGain = ctx.createGain();
    bassGain.gain.setValueAtTime(0.1, now);
    bassGain.gain.exponentialRampToValueAtTime(0.03, now + 3.0);

    const mid = ctx.createOscillator();
    mid.type = 'triangle';
    mid.frequency.value = 130.8; // C3
    const midGain = ctx.createGain();
    midGain.gain.setValueAtTime(0.07, now);
    midGain.gain.exponentialRampToValueAtTime(0.02, now + 3.0);

    bass.connect(bassGain);
    mid.connect(midGain);
    bassGain.connect(ctx.destination);
    midGain.connect(ctx.destination);

    bass.start(now);
    mid.start(now);
    bass.stop(now + 3.0);
    mid.stop(now + 3.0);

    activeNodesRef.current.push(bass, bassGain, mid, midGain);
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { initAudio, playInhale, playExhale, playHold, playRest };
};

export default BreathAudio;