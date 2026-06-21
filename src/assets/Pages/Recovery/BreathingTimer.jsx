import { useEffect, useState, useRef, useMemo } from 'react'
import { AppData } from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import { theme$, lang$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from "react-icons/io5"
import { FaInfoCircle } from "react-icons/fa"
import BreathAudio from "../../Helpers/BreathAudio"
import { saveBreathingSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const AMBIENT_SOUND_URL = 'Audio/relax/breathing-flow.mp3';
const ambientAudio = new Audio(AMBIENT_SOUND_URL);
ambientAudio.loop = true;
ambientAudio.preload = 'auto';
ambientAudio.volume = 0.16;

const startTimerDuration = 3000;

const stepperButtonStyle = (accent) => ({
  width: '36px',
  height: '34px',
  borderRadius: '13px',
  border: `1px solid ${accent}40`,
  cursor: 'pointer',
  background: `${accent}1f`,
  color: accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
  fontSize: '22px',
  fontWeight: 900,
  lineHeight: 1,
  fontFamily: 'inherit'
});

const buildStepsFromPhases = (p) => {
  const s = [];
  if (p.in   > 0) s.push({ in:   p.in   * 1000 });
  if (p.hold1 > 0) s.push({ hold: p.hold1 * 1000 });
  if (p.out  > 0) s.push({ out:  p.out  * 1000 });
  if (p.hold2 > 0) s.push({ hold: p.hold2 * 1000 });
  return s.length ? s : [{ in: 4000 }, { out: 4000 }];
};

const defaultBreathingLevel = {
  cycles: 6,
  strategy: '4-4-4-4',
  steps: [{ in: 4000 }, { hold: 4000 }, { out: 4000 }, { hold: 4000 }],
};

const getStepType = (step) => {
  if (!step || typeof step !== 'object') return null;
  if (step.in !== undefined) return 'in';
  if (step.out !== undefined) return 'out';
  if (step.hold !== undefined) return 'hold';
  if (step.rest !== undefined) return 'rest';
  return null;
};

const getStepDuration = (step) => {
  const type = getStepType(step);
  return type ? Number(step[type]) || 0 : 0;
};

const normalizeProtocolSteps = (steps) => {
  if (!Array.isArray(steps) || steps.length === 0) return defaultBreathingLevel.steps;
  return steps
    .map((step) => {
      const type = getStepType(step);
      const duration = getStepDuration(step);
      return type && duration > 0 ? { [type]: duration } : null;
    })
    .filter(Boolean);
};

const phasesFromSteps = (steps) => {
  const phases = { in: 0, hold1: 0, out: 0, hold2: 0 };
  let holdCount = 0;
  let seenIn = false;
  let seenOut = false;

  for (const step of steps) {
    const type = getStepType(step);
    const seconds = Math.round((getStepDuration(step) / 1000) * 10) / 10;
    if (!type || seconds <= 0 || type === 'rest') return null;

    if (type === 'in') {
      if (seenIn) return null;
      phases.in = seconds;
      seenIn = true;
    } else if (type === 'out') {
      if (seenOut) return null;
      phases.out = seconds;
      seenOut = true;
    } else if (type === 'hold') {
      holdCount += 1;
      if (holdCount === 1) phases.hold1 = seconds;
      else if (holdCount === 2) phases.hold2 = seconds;
      else return null;
    }
  }

  return seenIn && seenOut ? phases : null;
};

const getProtocolLevel = (protocol, index = 0) => {
  const levels = Array.isArray(protocol?.levels) && protocol.levels.length ? protocol.levels : [defaultBreathingLevel];
  return levels[Math.min(Math.max(index, 0), levels.length - 1)] ?? defaultBreathingLevel;
};

function PhaseStepper({ theme, label, value, min = 0, max = 20, step = 1, onChange, wide = false }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const isDark = theme === 'dark' || theme === 'specialdark';
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.045)',
      borderRadius: '16px',
      padding: wide ? '10px 16px' : '10px 12px',
      minHeight: wide ? '58px' : '76px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      border: '1px solid rgba(126,230,210,0.14)'
    }}>
      <div style={{ width: '100%', minWidth: 0, textAlign: 'center', fontSize: '10px', color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: wide ? '36px minmax(42px, 1fr) 36px' : '36px minmax(36px, 1fr) 36px',
        alignItems: 'center',
        justifyItems: 'center',
        columnGap: wide ? '10px' : '9px',
        width: '100%',
        maxWidth: wide ? '156px' : '142px',
        margin: '0 auto'
      }}>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={dec} style={stepperButtonStyle('#7ee6d2')}>−</Motion.button>
        <div style={{
          marginTop: '5px',
          fontSize: wide ? '25px' : '24px',
          fontWeight: 900,
          color: textMain,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
          textAlign: 'center'
        }}>{value}</div>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={inc} style={stepperButtonStyle('#7ee6d2')}>+</Motion.button>
      </div>
    </div>
  );
}

const getSessionMeta = (protocol, categoryIndex, protocolIndex) => ({
  categoryIndex,
  protocolIndex,
  protocolName: protocol?.name?.[0] || protocol?.name?.[1] || '',
});

const BreathingTimer = ({ show, setShow, protocol, categoryIndex = 0, protocolIndex = 0 }) => {

  // --- STATE ---
  const [customPhases, setCustomPhases] = useState({ in: 4, hold1: 4, out: 4, hold2: 4 });
  const [levelIndex, setLevelIndex] = useState(0);
  const [manualPhases, setManualPhases] = useState(false);
  const [mode, setMode] = useState('time'); // 'time' | 'cycles'
  const [limitMinutes, setLimitMinutes] = useState(5);
  const [limitCycles, setLimitCycles] = useState(10);
  const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const { initAudio, playInhale, playExhale, playHold, playRest } = BreathAudio(audioEnabled);
  
  // Logic
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Visual State
  const [renderScale, setRenderScale] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  // Refs
  const currentVisualScaleRef = useRef(1);
  const phaseStartScaleRef = useRef(1);
  const animationRef = useRef();
  const startTimeRef = useRef(0);
  
  // Session Data
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const maxHoldRef = useRef(0);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const s1 = theme$.subscribe(setthemeState); 
    const s2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)); 
    return () => { s1.unsubscribe(); s2.unsubscribe(); }
  }, []);


  // --- START TIMER LOGIC ---
  useEffect(() => {
    if (!showStartTimer) { setSeconds(0); return; }
    const total = startTimerDuration;
    const startTs = performance.now();
    let lastShown = Math.ceil(total / 1000);
    let rafId;
    const tick = (now) => {
      const elapsed = now - startTs;
      if (elapsed >= total) {
        setSeconds(0);
        handleStart();
        setShowStartTimer(false);
        return;
      }
      const current = Math.ceil((total - elapsed) / 1000);
      if (current !== lastShown) { lastShown = current; setSeconds(current); }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [showStartTimer]);

  // --- PROTOCOL PARSING ---
  useEffect(() => {
    if (currentStepIndex === 0) phaseStartScaleRef.current = 1.0;
    else phaseStartScaleRef.current = currentVisualScaleRef.current;
    setPhaseProgress(0);
    startTimeRef.current = 0;
  }, [currentStepIndex]);

  const selectedLevel = useMemo(() => getProtocolLevel(protocol, levelIndex), [protocol, levelIndex]);
  const protocolSteps = useMemo(() => normalizeProtocolSteps(selectedLevel.steps), [selectedLevel]);
  const editableProtocolPhases = useMemo(() => phasesFromSteps(protocolSteps), [protocolSteps]);

  useEffect(() => {
    const level = getProtocolLevel(protocol, 0);
    const steps = normalizeProtocolSteps(level.steps);
    const nextPhases = phasesFromSteps(steps);
    setLevelIndex(0);
    setManualPhases(false);
    setMode('cycles');
    setLimitCycles(Math.max(1, Number(level.cycles) || 1));
    if (nextPhases) setCustomPhases(nextPhases);
  }, [protocol]);

  useEffect(() => {
    const nextPhases = phasesFromSteps(protocolSteps);
    setManualPhases(false);
    setLimitCycles(Math.max(1, Number(selectedLevel.cycles) || 1));
    if (nextPhases) setCustomPhases(nextPhases);
  }, [protocolSteps, selectedLevel]);

  const updatePhase = (key, value) => {
    setManualPhases(true);
    setCustomPhases(prev => ({ ...prev, [key]: value }));
  };

  const cycleSteps = useMemo(
    () => manualPhases ? buildStepsFromPhases(customPhases) : protocolSteps,
    [manualPhases, customPhases, protocolSteps]
  );

  const cycleDurationMs = useMemo(
    () => cycleSteps.reduce((acc, s) => acc + (s.in ?? s.out ?? s.hold ?? s.rest ?? 0), 0),
    [cycleSteps]
  );

  const effectiveLevelData = useMemo(() => {
    const cycles = mode === 'cycles'
      ? Math.max(1, limitCycles)
      : Math.max(1, Math.ceil((limitMinutes * 60 * 1000) / Math.max(cycleDurationMs, 1000)) + 5);
    return { cycles, steps: cycleSteps, strategy: selectedLevel.strategy };
  }, [mode, limitCycles, limitMinutes, cycleDurationMs, cycleSteps, selectedLevel]);

  const allSteps = useMemo(() => {
    const steps = [];
    for (let cycle = 0; cycle < effectiveLevelData.cycles; cycle++) {
      effectiveLevelData.steps.forEach(step => steps.push({ ...step, cycle }));
    }
    return steps;
  }, [effectiveLevelData]);

  const currentStep = allSteps[currentStepIndex] || null;

  // --- VISUAL & PHASE HELPERS ---
  const getPhaseInfo = (step) => {
    if (!step) return { name: '', color: '#94a3b8', type: 'none' };
    
    if (step.in !== undefined) return { 
        name: langIndex === 0 ? 'Вдох' : 'Inhale', 
        color: '#00E5FF', secondary: '#2979FF', type: 'in' 
    };
    if (step.out !== undefined) return { 
        name: langIndex === 0 ? 'Выдох' : 'Exhale', 
        color: '#00E676', secondary: '#00B0FF', type: 'out' 
    };
    if (step.hold !== undefined) return { 
        name: langIndex === 0 ? 'Задержка' : 'Hold', 
        color: '#FFEA00', secondary: '#FF9100', type: 'hold' 
    };
    if (step.rest !== undefined) return { 
        name: langIndex === 0 ? 'Отдых' : 'Rest', 
        color: '#B0BEC5', secondary: '#78909C', type: 'rest' 
    };
    return { name: '', color: '#fff', type: 'none' };
  };

  const { name: phaseName, color: phaseColor, secondary: secondaryColor, type: phaseType } = getPhaseInfo(currentStep);
  const duration = currentStep ? (currentStep.in ?? currentStep.out ?? currentStep.hold ?? currentStep.rest ?? 1000) : 1000;

  const cycleInfo = () => {
    if (!effectiveLevelData.steps?.length) return '0';
    const current = Math.floor(currentStepIndex / effectiveLevelData.steps.length) + 1;
    if (!isStart) return '0';
    return mode === 'cycles' ? `${current} / ${limitCycles}` : `${current}`;
  };

  const timeRemaining = duration * (1 - phaseProgress);
  const displayTime = Math.max(0, Math.ceil(timeRemaining / 1000));
  const sessionRemainingMs = mode === 'time' && isStart && startTime
    ? Math.max(0, (limitMinutes * 60 * 1000) - (Date.now() - startTime))
    : limitMinutes * 60 * 1000;
  const sessionRemainingLabel = formatTimerMs(sessionRemainingMs);

  // --- ANIMATION LOOP ---
  useEffect(() => {
    if (!isRunning || !currentStep) return;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setPhaseProgress(progress);

      let currentScale;
      if (currentStep.in !== undefined) {
        const startScale = phaseStartScaleRef.current;
        const ease = 1 - Math.pow(1 - progress, 3); 
        currentScale = startScale + (1.6 - startScale) * ease;
      } 
      else if (currentStep.out !== undefined) {
        const startScale = phaseStartScaleRef.current;
        const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        currentScale = startScale + (1.0 - startScale) * ease;
      } 
      else if (currentStep.hold !== undefined) {
        const baseScale = phaseStartScaleRef.current;
        const pulse = 0.03 * Math.sin(2 * Math.PI * 0.8 * (elapsed / 1000));
        currentScale = baseScale + pulse;
      } 
      else {
        currentScale = 1.0;
      }

      currentVisualScaleRef.current = currentScale;
      setRenderScale(currentScale);

      if (progress >= 1) {
        const timeLimitReached = mode === 'time' && startTime && (Date.now() - startTime) >= limitMinutes * 60 * 1000;
        const nextIndex = currentStepIndex + 1;
        if (timeLimitReached || nextIndex >= allSteps.length) {
          setIsRunning(false);
          setIsStart(true);
          onFinishSession();
          return;
        }
        setCurrentStepIndex(nextIndex);
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [currentStepIndex, isRunning, duration, allSteps.length]);

  // --- AUDIO TRIGGERS ---
  useEffect(() => {

    if (!isRunning || !currentStep) return;
    if (phaseProgress < 0.02) {
      if (currentStep.in !== undefined) playInhale();
      else if (currentStep.out !== undefined) playExhale();
      else if (currentStep.hold !== undefined) playHold();
      else if (currentStep.rest !== undefined) playRest();
      
      if(AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  }, [currentStepIndex, isRunning, phaseProgress, audioEnabled]);

  useEffect(() => {
    if (audioEnabled && isStart && isRunning && !isFinished && !isPaused) {
      ambientAudio.play().catch(() => {});
    } else {
      ambientAudio.pause();
    }
  }, [audioEnabled, isStart, isRunning, isFinished, isPaused]);

  const resetSession = () => {
    setCurrentStepIndex(0); setPhaseProgress(0); setIsRunning(false);
    setIsStart(false); setIsPaused(false); startTimeRef.current = 0;
    maxHoldRef.current = 0; currentVisualScaleRef.current = 1; setRenderScale(1);
    ambientAudio.pause(); ambientAudio.currentTime = 0;
  };

  useEffect(() => { resetSession(); }, [effectiveLevelData]);

  // --- HANDLERS ---
  const handleStart = () => {
    setCurrentStepIndex(0);
    setPhaseProgress(0);
    setRenderScale(1);
    currentVisualScaleRef.current = 1;
    phaseStartScaleRef.current = 1;
    startTimeRef.current = 0;
    let maxHoldValue = 0;
    effectiveLevelData.steps.forEach(step => {
        if (step.hold !== undefined && step.hold > maxHoldValue) maxHoldValue = step.hold;
    });
    maxHoldRef.current = maxHoldValue;
    
    initAudio(); 
    setStartTime(Date.now()); 
    setAudioEnabled(true);
    setIsStart(true); setIsRunning(true); setIsPaused(false);
  };

  const handlePause = () => { setEndTime(Date.now()); setIsRunning(false); setIsPaused(true); ambientAudio.pause(); };
  const handleResume = () => { setIsRunning(true); setIsPaused(false); };
  const handleReload = () => { resetSession(); };
  const getCompletedCycles = () => {
      const stepsPerCycle = Math.max(1, effectiveLevelData.steps?.length || 1);
      return Math.min(effectiveLevelData.cycles, Math.max(1, Math.floor(currentStepIndex / stepsPerCycle) + 1));
  };
  const getSaveMeta = () => ({
      ...getSessionMeta(protocol, categoryIndex, protocolIndex),
      cycles: getCompletedCycles(),
  });
  const onFinishSession = async() => {
      await saveBreathingSession(startTime, Date.now(), maxHoldRef.current, getSaveMeta());
      setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async() => {
      await saveBreathingSession(startTime, endTime, maxHoldRef.current, getSaveMeta()); resetSession(); setShow(false);
  };

  // Styles
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const accent = phaseColor || Colors.get('in', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* BACKGROUND EFFECTS */}
      <Motion.div 
        animate={{ 
            background: isStart && !isFinished 
                ? `radial-gradient(circle at 50% 50%, ${phaseColor}20 0%, ${secondaryColor}10 40%, ${Colors.get('background', theme)} 100%)`
                : `radial-gradient(circle at 50% 50%, ${Colors.get('background', theme)} 100%, ${Colors.get('background', theme)} 100%)`
        }}
        transition={{ duration: 1.5 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      

      <AnimatePresence mode='wait'>
      
      {/* === MENU (PRE-START) === */}
      {!isFinished && !isStart && !showStartTimer && (
        <Motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                width: '100%', height: '100%', 
                padding: '24px 4.5vw 18px', boxSizing: 'border-box', zIndex: 10,
                position: 'relative'
            }}
        >
            {/* Header */}
            <div style={{ textAlign: 'center', width: '100%', flexShrink: 0, marginBottom: '16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px', padding: '0 12px', borderRadius: '999px', color: Colors.get('in', theme), background: 'rgba(126,230,210,0.08)', border: '1px solid rgba(126,230,210,0.16)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 900 }}>
                    {langIndex === 0 ? 'Дыхание' : 'Breathwork'}
                </div>
                <h2 style={{ fontSize: 'clamp(24px, 7vw, 32px)', color: textMain, margin: '10px auto 0', maxWidth: '560px', fontWeight: 900, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.04, letterSpacing: 0 }}>
                    {protocol?.name?.[langIndex] ?? (langIndex === 0 ? 'Дыхание' : 'Breathwork')}
                </h2>
            </div>

            {/* Scrollable Content Area (Flex 1) */}
            <div style={{ 
                flex: 1, width: '100%', maxWidth: '560px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                scrollbarWidth: 'none' // Hide scrollbar
            }}>
                <div style={{ 
                    background: 'linear-gradient(135deg, rgba(126,230,210,0.085), rgba(18,21,26,0.94))', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(126,230,210,0.2)', borderRadius: '26px', 
                    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)',
                    marginBottom: '20px' // Space for scroll
                }}>
                    {/* Goal */}
                    <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(126,230,210,0.07)', border: '1px solid rgba(126,230,210,0.12)' }}>
                        <div style={{ fontSize: '13px', color: textSub, lineHeight: '1.35', fontWeight: 800, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {protocol?.aim?.[langIndex] ?? (langIndex === 0 ? 'Осознанное дыхание для восстановления и фокуса.' : 'Conscious breathing for recovery and focus.')}
                        </div>
                    </div>

                    {/* Phases editor */}
                    <div>
                        <div style={{ fontSize: '10px', color: textSub, fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                            {langIndex === 0 ? 'Схема протокола' : 'Protocol pattern'}
                        </div>
                        {Array.isArray(protocol?.levels) && protocol.levels.length > 1 && (
                          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                            {protocol.levels.map((level, index) => {
                              const active = levelIndex === index;
                              return (
                                <Motion.button
                                  key={`${level.strategy}-${index}`}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => setLevelIndex(index)}
                                  style={{
                                    flex: '0 0 auto',
                                    minHeight: '34px',
                                    borderRadius: '13px',
                                    border: `1px solid ${active ? Colors.get('in', theme) : 'rgba(126,230,210,0.16)'}`,
                                    background: active ? 'rgba(126,230,210,0.18)' : 'rgba(255,255,255,0.035)',
                                    color: active ? Colors.get('in', theme) : textSub,
                                    padding: '0 11px',
                                    fontSize: '11px',
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {level.strategy || `${index + 1}`}
                                </Motion.button>
                              );
                            })}
                          </div>
                        )}
                        {editableProtocolPhases ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                              {[
                                  { key: 'in',    ru: 'Вдох',     en: 'Inhale' },
                                  { key: 'hold1', ru: 'Задержка', en: 'Hold' },
                                  { key: 'out',   ru: 'Выдох',    en: 'Exhale' },
                                  { key: 'hold2', ru: 'Задержка', en: 'Hold' },
                              ].map(f => (
                                  <PhaseStepper key={f.key} theme={theme} label={langIndex === 0 ? f.ru : f.en}
                                      value={customPhases[f.key]} min={0} max={180}
                                      onChange={v => updatePhase(f.key, v)} />
                              ))}
                          </div>
                        ) : (
                          <BreathingPatternPanel
                            theme={theme}
                            accent={Colors.get('in', theme)}
                            steps={cycleSteps}
                            langIndex={langIndex}
                          />
                        )}
                    </div>

                    {/* Mode toggle */}
                    <div>
                        <div style={{ fontSize: '10px', color: textSub, fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                            {langIndex === 0 ? 'Режим' : 'Mode'}
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
                            {[
                                { key: 'time',   ru: 'По времени', en: 'By time' },
                                { key: 'cycles', ru: 'По циклам',  en: 'By cycles' },
                            ].map(m => {
                                const active = mode === m.key;
                                return (
                                    <Motion.button key={m.key} whileTap={{ scale: 0.97 }} onClick={() => setMode(m.key)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                            background: active ? Colors.get('in', theme) : 'transparent',
                                            color: active ? '#fff' : textSub,
                                            fontSize: '13px', fontWeight: active ? 700 : 500, outline: 'none'
                                        }}>
                                        {langIndex === 0 ? m.ru : m.en}
                                    </Motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Limit stepper */}
                    <PhaseStepper theme={theme}
                        label={mode === 'time'
                            ? (langIndex === 0 ? 'Минут' : 'Minutes')
                            : (langIndex === 0 ? 'Циклов' : 'Cycles')}
                        value={mode === 'time' ? limitMinutes : limitCycles}
                        min={1} max={mode === 'time' ? 60 : 50} step={mode === 'time' ? 1 : 1}
                        wide
                        onChange={v => mode === 'time' ? setLimitMinutes(v) : setLimitCycles(v)} />

                    <BreathingTipPanel
                        theme={theme}
                        accent={Colors.get('in', theme)}
                        phases={customPhases}
                        steps={cycleSteps}
                        langIndex={langIndex}
                    />

                    {/* Disclaimer */}
                    <p style={{ fontSize: '10px', color: textSub, textAlign: 'center', opacity: 0.45, lineHeight: '1.3', margin: '-2px 0 0' }}>
                        {langIndex === 0 ? 'При дискомфорте остановитесь.' : 'Stop if you feel uncomfortable.'}
                    </p>
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ width: '100%', maxWidth: '560px', display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr)', alignItems: 'center', gap: '12px', padding: '10px 0 0', flexShrink: 0 }}>
                <Motion.button whileTap={{ scale: 0.92 }} onClick={() => setShow(false)} aria-label={langIndex === 0 ? 'Закрыть' : 'Close'} style={{
                    height: '56px',
                    borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.045)',
                    color: textSub,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    outline: 'none'
                }}>
                    <IoClose size={25} />
                </Motion.button>

                <Motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSeconds(Math.ceil(startTimerDuration / 1000)); setShowStartTimer(true); }}
                    style={{ 
                        height: '56px', borderRadius: '18px', border: '1px solid rgba(126,230,210,0.28)',
                        background: 'linear-gradient(135deg, #7ee6d2, #19c9a8)', color: '#07100f', fontSize: '15px', fontWeight: 900,
                        boxShadow: `0 16px 42px -16px ${Colors.get('in', theme)}80`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: 'pointer',
                        outline: 'none'
                    }}
                >
                    <IoPlay />
                    {langIndex === 0 ? 'Начать' : 'Start'}
                </Motion.button>
            </div>
        </Motion.div>
      )}

      {/* ... (Rest of the Timer & Controls logic remains the same) ... */}
      
      {/* === COUNTDOWN === */}
      {!isFinished && showStartTimer && (
        <CountdownStage seconds={seconds} theme={theme} accent={accent} isRu={langIndex === 0} />
      )}

      {/* === ACTIVE TIMER (THE SPHERE) === */}
      {!isFinished && isStart && (
        <Motion.div 
            key="active"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative', padding: '88px 20px 132px', boxSizing: 'border-box' }}
        >
            <div style={{
                position: 'absolute',
                top: 'calc(26px + env(safe-area-inset-top, 0px))',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 'min(86vw, 430px)',
                minHeight: '48px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '0 14px',
                boxSizing: 'border-box',
                color: textMain,
                background: 'rgba(18,21,24,0.58)',
                border: `1px solid ${phaseColor}24`,
                backdropFilter: 'blur(18px)'
            }}>
                <span style={{ color: textSub, fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {langIndex === 0 ? 'Следуй кругу' : 'Follow the circle'}
                </span>
                <span style={{ color: phaseColor, fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {phaseName}
                </span>
            </div>

            <div style={{ position: 'relative', width: 'min(66vw, 310px)', aspectRatio: '1 / 1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${phaseColor}16 0%, ${phaseColor}0f 42%, transparent 70%)`,
                    boxShadow: `0 0 58px ${phaseColor}18`
                }} />
                <div style={{
                    position: 'absolute',
                    inset: '8px',
                    borderRadius: '50%',
                    background: `linear-gradient(145deg, rgba(255,255,255,0.045), rgba(18,21,24,0.9))`,
                    border: `1px solid ${phaseColor}2b`,
                    boxShadow: `0 0 42px ${phaseColor}12 inset`
                }} />
                {/* Lungs Visual */}
                <Motion.div 
                    style={{ 
                        width: '70%', height: '70%', borderRadius: '50%',
                        border: `2px solid ${phaseColor}80`, position: 'absolute',
                        boxShadow: `0 0 32px ${phaseColor}18, 0 0 42px ${phaseColor}10 inset`,
                        transform: `scale(${renderScale})`
                    }}
                />
                <Motion.div 
                    style={{ 
                        width: '50%', height: '50%', borderRadius: '50%',
                        background: phaseColor, position: 'absolute', opacity: 0.12, filter: 'blur(34px)',
                        transform: `scale(${renderScale})`
                    }}
                />
                
                {/* Text */}
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                    <div style={{ 
                        fontSize: '72px', fontWeight: 900, color: textMain, 
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", fontVariantNumeric: 'tabular-nums',
                        textShadow: `0 0 30px ${phaseColor}40`
                    }}>
                        {displayTime}
                    </div>
                    <Motion.div 
                        key={phaseType}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '8px', padding: '7px 12px', borderRadius: '999px', background: `${phaseColor}14`, border: `1px solid ${phaseColor}26`, fontSize: '13px', color: phaseColor, textTransform: 'uppercase', letterSpacing: '0.16em', fontWeight: 900 }}
                    >
                        {phaseName}
                    </Motion.div>
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '13px', color: textSub, letterSpacing: '0.03em', fontWeight: 800 }}>
                {mode === 'time'
                  ? `${langIndex === 0 ? 'До конца' : 'Left'} ${sessionRemainingLabel}`
                  : `${langIndex === 0 ? 'Цикл' : 'Cycle'} ${cycleInfo()}`}
            </div>

            {/* CONTROLS */}
            <div style={{ position: 'absolute', bottom: 'calc(42px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: '22px', alignItems: 'center' }}>
                <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={18}/> : <IoVolumeMute size={18}/>} theme={theme} size={48} />
                <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={28}/> : <IoPlay size={28} style={{marginLeft:'4px'}}/>} theme={theme} size={72} accent={phaseColor} />
                <CircleButton onClick={handlePause} icon={<IoClose size={22}/>} theme={theme} size={48} />
            </div>

            {/* PAUSE OVERLAY */}
            <AnimatePresence>
                {isPaused && (
                    <Motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ 
                            position: 'absolute', inset: 0, 
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 20
                        }}
                    >
                        <div style={{ fontSize: '24px', fontWeight: '300', color: '#fff', letterSpacing: '1px' }}>
                            {langIndex === 0 ? 'ПАУЗА' : 'PAUSED'}
                        </div>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <ControlButton onClick={handleReload} icon={<IoClose size={22}/>} label={langIndex === 0 ? 'Выйти' : 'Exit'} theme={theme} />
                            <ControlButton onClick={handleResume} icon={<IoPlay size={32} style={{marginLeft:'4px'}}/>} label={langIndex === 0 ? 'Продолжить' : 'Resume'} theme={theme} type="primary" accent={accent} size={70} />
                            <ControlButton onClick={onSaveSession} icon={<IoCheckmark size={22}/>} label={langIndex === 0 ? 'Финиш' : 'Finish'} theme={theme} />
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.div>
      )}

      {/* === FINISH === */}
      {isFinished && (
        <Motion.div 
            key="finish"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px', zIndex: 10 }}
        >
            <div style={{ position: 'relative' }}>
                <Motion.div 
                    animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ width: '150px', height: '150px', borderRadius: '50%', border: `1px dashed ${Colors.get('in', theme)}`, position: 'absolute', top: -15, left: -15 }}
                />
                <img src="images/Meditate.png" style={{ width: '150px' }} alt="Done" />
            </div>
            <div style={{ textAlign: 'center',zIndex: 10 }}>
                <h2 style={{ fontSize: '32px', color: textMain, margin: '0 0 10px 0', fontWeight: '300' }}>
                    {langIndex === 0 ? 'Дыхание восстановлено' : 'Breath Restored'}
                </h2>
                <p style={{ width: '80%', color: textSub, fontSize: '16px', lineHeight: '1.6', margin: '0 auto' }}>
                    {finishMessage}
                </p>
            </div>
            <Motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsFinished(false); setShow(false); }}
                style={{ 
                    padding: '15px 50px', borderRadius: '30px', 
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: textMain, fontSize: '16px', fontWeight: '500',zIndex: 10
                }}
            >
                {langIndex === 0 ? 'В меню' : 'Done'}
            </Motion.button>
        </Motion.div>
      )}

      </AnimatePresence>
    </div>
  );
};

export default BreathingTimer;

// === HELPERS & STYLES ===

function CountdownStage({ seconds, theme, accent, isRu }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  return (
    <Motion.div
      key="countdown"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      style={{ position: 'relative', height: '100%', width: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}
    >
      <Motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.42, 0.68, 0.42] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', width: '260px', height: '260px', borderRadius: '50%', background: `radial-gradient(circle, ${accent}38 0%, transparent 68%)`, filter: 'blur(16px)' }} />
      <div style={{ position: 'relative', width: '220px', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: `1px solid ${accent}3d`, background: `${accent}0f`, boxShadow: `0 0 48px ${accent}1f inset` }} />
        <AnimatePresence mode="wait">
          <Motion.div key={seconds} initial={{ scale: 0.82, opacity: 0, y: 12 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 1.18, opacity: 0, y: -10 }} transition={{ duration: 0.24 }} style={{ color: textMain, fontSize: '112px', fontWeight: 900, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {seconds}
          </Motion.div>
        </AnimatePresence>
      </div>
      <div style={{ marginTop: '24px', color: accent, fontSize: '12px', fontWeight: 900, letterSpacing: '0.22em', textTransform: 'uppercase' }}>{isRu ? 'Старт через' : 'Starting in'}</div>
      <div style={{ marginTop: '8px', color: textSub, fontSize: '14px', fontWeight: 700 }}>{isRu ? 'Настройтесь на спокойный ритм' : 'Settle into a calm rhythm'}</div>
    </Motion.div>
  );
}

const getBreathingStepLabel = (step, langIndex) => {
  const isRu = langIndex === 0;
  const type = getStepType(step);
  if (type === 'in') return isRu ? 'Вдох' : 'In';
  if (type === 'out') return isRu ? 'Выдох' : 'Out';
  if (type === 'hold') return isRu ? 'Пауза' : 'Hold';
  if (type === 'rest') return isRu ? 'Отдых' : 'Rest';
  return isRu ? 'Шаг' : 'Step';
};

const formatStepSeconds = (ms) => {
  const seconds = (Number(ms) || 0) / 1000;
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const rest = Math.round(seconds % 60);
    return rest ? `${minutes}m ${rest}s` : `${minutes}m`;
  }
  return Number.isInteger(seconds) ? `${seconds}s` : `${seconds.toFixed(1)}s`;
};

function BreathingPatternPanel({ theme, accent, steps, langIndex }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  return (
    <div style={{
      borderRadius: '16px',
      padding: '10px',
      background: `linear-gradient(135deg, ${accent}10, rgba(255,255,255,0.028))`,
      border: `1px solid ${accent}20`,
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {steps.map((step, index) => {
          const type = getStepType(step);
          const duration = getStepDuration(step);
          return (
            <div key={`${type}-${duration}-${index}`} style={{
              minHeight: '28px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '999px',
              padding: '0 9px',
              color: textMain,
              background: 'rgba(0,0,0,0.18)',
              border: `1px solid ${accent}20`,
              fontSize: '10px',
              fontWeight: 850,
            }}>
              <span style={{ color: textSub }}>{getBreathingStepLabel(step, langIndex)}</span>
              <span style={{ color: accent }}>{formatStepSeconds(duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BreathingTipPanel({ theme, accent, phases, steps: rawSteps, langIndex }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const isRu = langIndex === 0;
  const phaseSteps = [
    { label: isRu ? 'Вдох' : 'In', value: phases.in, unit: 's' },
    { label: isRu ? 'Пауза' : 'Hold', value: phases.hold1, unit: 's' },
    { label: isRu ? 'Выдох' : 'Out', value: phases.out, unit: 's' },
    { label: isRu ? 'Пауза' : 'Hold', value: phases.hold2, unit: 's' },
  ].filter((step) => step.value > 0);
  const steps = rawSteps?.length
    ? rawSteps.map((step) => ({
      label: getBreathingStepLabel(step, langIndex),
      value: formatStepSeconds(getStepDuration(step)),
      unit: '',
    }))
    : phaseSteps;

  return (
    <div style={{
      borderRadius: '16px',
      padding: '10px',
      background: `linear-gradient(135deg, ${accent}12, rgba(255,255,255,0.03))`,
      border: `1px solid ${accent}22`,
      textAlign: 'center'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', color: accent, fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
        <FaInfoCircle />
        {isRu ? 'Схема дыхания' : 'Breathing pattern'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '5px' }}>
        {steps.map((step, index) => (
          <div key={`${step.label}-${index}`} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            minHeight: '25px',
            padding: '0 8px',
            borderRadius: '999px',
            color: textMain,
            background: 'rgba(0,0,0,0.18)',
            border: `1px solid ${accent}20`,
            fontSize: '10px',
            fontWeight: 800
          }}>
            <span style={{ color: textSub }}>{step.label}</span>
            <span style={{ color: accent }}>{step.value}{step.unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <Motion.button 
        whileTap={{ scale: 0.9 }} onClick={onClick}
        style={{
            width: size, height: size, borderRadius: '50%',
            border: 'none', outline: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: accent || (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
            color: accent ? '#fff' : Colors.get('mainText', theme),
            boxShadow: accent ? `0 8px 25px ${accent}60` : 'none',
        }}
    >
        {icon}
    </Motion.button>
);

const ControlButton = ({ onClick, icon, label, theme, type = 'secondary', accent, size = 55 }) => {
    const isPrimary = type === 'primary';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Motion.button 
                whileTap={{ scale: 0.92 }} onClick={onClick}
                style={{
                    width: size, height: size, borderRadius: '50%',
                    border: 'none', outline: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isPrimary ? (accent || '#BF5AF2') : (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                    color: isPrimary ? '#fff' : Colors.get('mainText', theme),
                    boxShadow: isPrimary ? `0 8px 30px ${accent || '#BF5AF2'}50` : 'none',
                    backdropFilter: 'blur(5px)'
                }}
            >
                {icon}
            </Motion.button>
            {label && <span style={{ fontSize: '12px', color: Colors.get('subText', theme), fontWeight: '600' }}>{label}</span>}
        </div>
    );
}

const formatTimerMs = (ms) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const styles = (theme, show) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    position: 'fixed',
    height: '100vh',
    transform: show ? 'translateY(0)' : 'translateY(100%)',
    bottom: '0',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    width: '100vw',
    fontFamily: 'inherit',
    borderTop: 'none',
    borderTopLeftRadius: 0, borderTopRightRadius: 0,
    zIndex: 2000, overflow: 'hidden', 
    boxShadow: 'none'
  }
});

const congratulations = (langIndex) => {
  const messages = {
    ru: [ 'Дыхание спокойно.', 'Ум очищен.', 'Энергия восстановлена.', 'Гармония внутри.' ],
    en: [ 'Breath is calm.', 'Mind is clear.', 'Energy restored.', 'Inner harmony.' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};
