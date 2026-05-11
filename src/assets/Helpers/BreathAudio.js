
import { useEffect, useRef } from 'react';

const BreathAudio = (isEnabled = false) => {
  const audioContextRef = useRef(null);
  const activeNodesRef = useRef([]);

  const cleanup = () => {
    activeNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch {
        // Nodes can already be stopped/disconnected by the browser audio engine.
      }
    });
    activeNodesRef.current = [];
  };

  const initAudio = () => {
    if (audioContextRef.current) return;
    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      console.warn('AudioContext not supported');
    }
  };

  const makeEnvelope = (ctx, now, peak, duration, attack = 0.18, releaseLevel = 0.001) => {
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(peak, now + attack);
    gain.gain.exponentialRampToValueAtTime(releaseLevel, now + duration);
    return gain;
  };

  const connectSoftOutput = (ctx, source, gain, filterType = 'lowpass', frequency = 900, q = 0.55) => {
    const filter = ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = frequency;
    filter.Q.value = q;

    const master = ctx.createGain();
    master.gain.value = 0.72;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    master.connect(ctx.destination);

    activeNodesRef.current.push(source, filter, gain, master);
  };

  const createSoftNoise = (ctx, duration, intensity = 0.12) => {
    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < noiseData.length; i++) {
      const t = i / noiseData.length;
      last = (last * 0.985) + ((Math.random() * 2 - 1) * 0.015);
      noiseData[i] = last * Math.sin(Math.PI * t) * intensity;
    }

    noise.buffer = noiseBuffer;
    return noise;
  };

  const playTone = (ctx, now, { frequency, endFrequency = frequency, duration, peak, type = 'sine', delay = 0, attack = 0.2 }) => {
    const start = now + delay;
    const osc = ctx.createOscillator();
    const gain = makeEnvelope(ctx, start, peak, duration, attack);
    const filter = ctx.createBiquadFilter();
    const master = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, start);
    osc.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.45;
    master.gain.value = 0.65;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    master.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.03);

    activeNodesRef.current.push(osc, filter, gain, master);
  };

  // === INHALE: slow airy lift ===
  const playInhale = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    const noise = createSoftNoise(ctx, 1.6, 0.095);
    const noiseGain = makeEnvelope(ctx, now, 0.032, 1.6, 0.28);
    connectSoftOutput(ctx, noise, noiseGain, 'lowpass', 520, 0.35);
    noise.start(now);
    noise.stop(now + 1.6);

    playTone(ctx, now, { frequency: 174.61, endFrequency: 220, duration: 1.35, peak: 0.018, type: 'sine', attack: 0.3 });
    playTone(ctx, now, { frequency: 261.63, endFrequency: 293.66, duration: 1.1, peak: 0.008, delay: 0.12, attack: 0.32 });
  };

  // === EXHALE: warm downward wash ===
  const playExhale = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    const noise = createSoftNoise(ctx, 1.9, 0.08);
    const noiseGain = makeEnvelope(ctx, now, 0.028, 1.9, 0.24);
    connectSoftOutput(ctx, noise, noiseGain, 'lowpass', 430, 0.35);
    noise.start(now);
    noise.stop(now + 1.9);

    playTone(ctx, now, { frequency: 196, endFrequency: 146.83, duration: 1.55, peak: 0.02, type: 'sine', attack: 0.34 });
    playTone(ctx, now, { frequency: 130.81, endFrequency: 110, duration: 1.7, peak: 0.012, delay: 0.08, attack: 0.38 });
  };

  // === HOLD: muted bowl, no sharp attack ===
  const playHold = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    playTone(ctx, now, { frequency: 220, duration: 1.35, peak: 0.015, type: 'sine', attack: 0.36 });
    playTone(ctx, now, { frequency: 329.63, duration: 1.15, peak: 0.006, type: 'sine', delay: 0.08, attack: 0.4 });
  };

  // === REST: low ambient hint ===
  const playRest = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    playTone(ctx, now, { frequency: 98, endFrequency: 98, duration: 2.4, peak: 0.017, type: 'sine', attack: 0.45 });
    playTone(ctx, now, { frequency: 146.83, endFrequency: 130.81, duration: 2.2, peak: 0.009, type: 'sine', delay: 0.12, attack: 0.48 });
  };

    // === RIGHT: Gentle ascending chime (positive feedback) ===
  const playRight = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    const freqs = [392, 493.88, 587.33];
    const gains = [0.055, 0.032, 0.018];

    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(gains[i], now + 0.018);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
      activeNodesRef.current.push(osc, gain);
    });
  };

  // === WRONG: Soft descending "thud" (gentle correction) ===
  const playWrong = () => {
    if (!isEnabled || !audioContextRef.current) return;
    const ctx = audioContextRef.current;
    const now = ctx.currentTime;
    cleanup();

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 98;
    oscGain.gain.setValueAtTime(0.04, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    const noise = ctx.createBufferSource();
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.03)) * 0.45;
    }
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.025, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(oscGain);
    noise.connect(noiseGain);
    oscGain.connect(ctx.destination);
    noiseGain.connect(ctx.destination);

    osc.start(now);
    noise.start(now);
    osc.stop(now + 0.4);
    noise.stop(now + 0.3);

    activeNodesRef.current.push(osc, oscGain, noise, noiseGain);
  };

  useEffect(() => {
    return () => {
      cleanup();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { initAudio, playInhale, playExhale, playHold, playRest, playRight, playWrong };
};

export default BreathAudio;
