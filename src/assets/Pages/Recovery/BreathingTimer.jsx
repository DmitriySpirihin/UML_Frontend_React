import { useEffect, useState, useRef, useMemo } from 'react'
import { AppData } from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from "react-icons/io5"
import { FaMinus, FaPlus, FaInfoCircle } from "react-icons/fa"
import BreathAudio from "../../Helpers/BreathAudio"
import { saveBreathingSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion, AnimatePresence } from 'framer-motion';

// Фоновый эмбиент
const AMBIENT_SOUND_URL = 'Audio/Ambient.wav';
const ambientAudio = new Audio(AMBIENT_SOUND_URL);
ambientAudio.loop = true;
ambientAudio.volume = 0.4;

const startTimerDuration = 3000;

const buildStepsFromPhases = (p) => {
  const s = [];
  if (p.in   > 0) s.push({ in:   p.in   * 1000 });
  if (p.hold1 > 0) s.push({ hold: p.hold1 * 1000 });
  if (p.out  > 0) s.push({ out:  p.out  * 1000 });
  if (p.hold2 > 0) s.push({ hold: p.hold2 * 1000 });
  return s.length ? s : [{ in: 4000 }, { out: 4000 }];
};

function PhaseStepper({ theme, label, value, min = 0, max = 20, step = 1, onChange, wide = false }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: '14px', padding: '10px 12px',
      display: 'flex', flexDirection: 'column', gap: '6px',
      border: '1px solid rgba(255,255,255,0.05)'
    }}>
      <div style={{ fontSize: '10px', color: textSub, textTransform: 'uppercase', letterSpacing: '1px' }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={dec}
          style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
          }}>
          <FaMinus size={10} />
        </motion.button>
        <span style={{
          fontSize: wide ? '22px' : '18px', fontWeight: 600, color: textMain,
          fontVariantNumeric: 'tabular-nums', minWidth: wide ? '60px' : '30px', textAlign: 'center'
        }}>
          {value}
        </span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={inc}
          style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none'
          }}>
          <FaPlus size={10} />
        </motion.button>
      </div>
    </div>
  );
}

const BreathingTimer = ({ show, setShow, protocol }) => {

  // --- STATE ---
  const [customPhases, setCustomPhases] = useState({ in: 4, hold1: 4, out: 4, hold2: 4 });
  const [mode, setMode] = useState('time'); // 'time' | 'cycles'
  const [limitMinutes, setLimitMinutes] = useState(5);
  const [limitCycles, setLimitCycles] = useState(10);
  const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]); 
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
    const s3 = fontSize$.subscribe(setFSize);
    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); }
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

  const cycleSteps = useMemo(() => buildStepsFromPhases(customPhases), [customPhases]);

  const cycleDurationMs = useMemo(
    () => cycleSteps.reduce((acc, s) => acc + (s.in ?? s.out ?? s.hold ?? s.rest ?? 0), 0),
    [cycleSteps]
  );

  const effectiveLevelData = useMemo(() => {
    const cycles = mode === 'cycles'
      ? Math.max(1, limitCycles)
      : Math.max(1, Math.ceil((limitMinutes * 60 * 1000) / Math.max(cycleDurationMs, 1000)) + 5);
    return { cycles, steps: cycleSteps };
  }, [mode, limitCycles, limitMinutes, cycleDurationMs, cycleSteps]);

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
  const displayTime = (timeRemaining / 1000).toFixed(1);

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

  const resetSession = () => {
    setCurrentStepIndex(0); setPhaseProgress(0); setIsRunning(false);
    setIsStart(false); setIsPaused(false); startTimeRef.current = 0;
    maxHoldRef.current = 0; currentVisualScaleRef.current = 1; setRenderScale(1);
    ambientAudio.pause(); ambientAudio.currentTime = 0;
  };

  useEffect(() => { resetSession(); }, [effectiveLevelData]);

  // --- HANDLERS ---
  const handleStart = () => {
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
  const onFinishSession = async() => {
      await saveBreathingSession(startTime, Date.now(), maxHoldRef.current);
      setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async() => {
      await saveBreathingSession(startTime, endTime); resetSession(); setShow(false);
  };

  // Styles
  const isDark = theme === 'dark' || theme === 'specialdark';
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const accent = phaseColor || Colors.get('in', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* BACKGROUND EFFECTS */}
      <motion.div 
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
        <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                width: '100%', height: '100%', 
                padding: '40px 20px', boxSizing: 'border-box', zIndex: 10,
                position: 'relative'
            }}
        >
            {/* Header (Shrinkable) */}
            <div style={{ textAlign: 'center', width: '100%', flexShrink: 0, marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: textSub, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {langIndex === 0 ? 'Дыхание' : 'Breathwork'}
                </div>
                <h2 style={{ fontSize: '28px', color: textMain, margin: 0, fontWeight: '300', fontFamily: 'Segoe UI Light' }}>
                    {protocol?.name?.[langIndex] ?? (langIndex === 0 ? 'Дыхание' : 'Breathwork')}
                </h2>
            </div>

            {/* Scrollable Content Area (Flex 1) */}
            <div style={{ 
                flex: 1, width: '100%', maxWidth: '360px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column',
                scrollbarWidth: 'none' // Hide scrollbar
            }}>
                <div style={{ 
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '30px', 
                    padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)',
                    marginBottom: '20px' // Space for scroll
                }}>
                    {/* Goal */}
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: textSub, marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {langIndex === 0 ? 'Цель' : 'Goal'}
                        </div>
                        <div style={{ fontSize: '15px', color: textMain, lineHeight: '1.4' }}>
                            {protocol?.aim?.[langIndex] ?? (langIndex === 0 ? 'Осознанное дыхание для восстановления и фокуса.' : 'Conscious breathing for recovery and focus.')}
                        </div>
                    </div>

                    {/* Phases editor */}
                    <div>
                        <div style={{ fontSize: '11px', color: textSub, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                            {langIndex === 0 ? 'Фазы (сек)' : 'Phases (sec)'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            {[
                                { key: 'in',    ru: 'Вдох',     en: 'Inhale' },
                                { key: 'hold1', ru: 'Задержка', en: 'Hold' },
                                { key: 'out',   ru: 'Выдох',    en: 'Exhale' },
                                { key: 'hold2', ru: 'Задержка', en: 'Hold' },
                            ].map(f => (
                                <PhaseStepper key={f.key} theme={theme} label={langIndex === 0 ? f.ru : f.en}
                                    value={customPhases[f.key]} min={0} max={20}
                                    onChange={v => setCustomPhases(prev => ({ ...prev, [f.key]: v }))} />
                            ))}
                        </div>
                    </div>

                    {/* Mode toggle */}
                    <div>
                        <div style={{ fontSize: '11px', color: textSub, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>
                            {langIndex === 0 ? 'Режим' : 'Mode'}
                        </div>
                        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.2)', borderRadius: '14px', padding: '4px', gap: '4px' }}>
                            {[
                                { key: 'time',   ru: 'По времени', en: 'By time' },
                                { key: 'cycles', ru: 'По циклам',  en: 'By cycles' },
                            ].map(m => {
                                const active = mode === m.key;
                                return (
                                    <motion.button key={m.key} whileTap={{ scale: 0.97 }} onClick={() => setMode(m.key)}
                                        style={{
                                            flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                                            background: active ? Colors.get('in', theme) : 'transparent',
                                            color: active ? '#fff' : textSub,
                                            fontSize: '13px', fontWeight: active ? 700 : 500, outline: 'none'
                                        }}>
                                        {langIndex === 0 ? m.ru : m.en}
                                    </motion.button>
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

                    {/* Instruction */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: textSub, marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            <FaInfoCircle /> {langIndex === 0 ? 'Инструкция' : 'Instruction'}
                        </div>
                        <div style={{ fontSize: '13px', color: textMain, lineHeight: '1.4' }}>
                            {protocol?.instructions?.[langIndex] ?? (langIndex === 0 ? 'Следуйте ритму: вдох — задержка — выдох.' : 'Follow the rhythm: inhale — hold — exhale.')}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <p style={{ fontSize: '9px', color: textSub, textAlign: 'center', opacity: 0.5, lineHeight: '1.3', margin: 0 }}>
                        {disclaimer(langIndex)}
                    </p>
                </div>
            </div>

            {/* Footer Buttons (Fixed) */}
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', flexShrink: 0 }}>
                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShow(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSub, cursor: 'pointer' }}>
                    <IoClose size={24} />
                    <span style={{ fontSize: '14px' }}>{langIndex === 0 ? 'Закрыть' : 'Close'}</span>
                </motion.div>

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setSeconds(Math.ceil(startTimerDuration / 1000)); setShowStartTimer(true); }}
                    style={{ 
                        padding: '15px 45px', borderRadius: '50px', border: 'none',
                        background: Colors.get('in', theme), color: '#fff', fontSize: '16px', fontWeight: 'bold',
                        boxShadow: `0 10px 40px -10px ${Colors.get('in', theme)}60`
                    }}
                >
                    {langIndex === 0 ? 'Начать' : 'Start'}
                </motion.button>
            </div>
        </motion.div>
      )}

      {/* ... (Rest of the Timer & Controls logic remains the same) ... */}
      
      {/* === COUNTDOWN === */}
      {!isFinished && showStartTimer && (
        <motion.div 
            key="countdown"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 10 }}
        >
            <div style={{ position: 'relative', width: '200px', height: '170px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AnimatePresence mode="wait">
                <motion.div
                    key={seconds}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, transition: { duration: 0.2 } }}
                    exit={{ scale: 1.3, opacity: 0, transition: { duration: 0.15 } }}
                    style={{ fontSize: '140px', fontWeight: '200', color: textMain, fontFamily: 'Segoe UI Light', position: 'absolute' }}
                >
                    {seconds}
                </motion.div>
              </AnimatePresence>
            </div>
            <div style={{ marginTop: '20px', fontSize: '16px', color: textSub, letterSpacing: '1px' }}>
                {langIndex === 0 ? 'ПРИГОТОВЬТЕСЬ...' : 'GET READY...'}
            </div>
        </motion.div>
      )}

      {/* === ACTIVE TIMER (THE SPHERE) === */}
      {!isFinished && isStart && (
        <motion.div 
            key="active"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative' }}
        >
            <div style={{ position: 'absolute', top: '10%', textAlign: 'center', width: '85%', color: textMain, opacity: 0.8, fontSize: '16px', lineHeight: '1.4' }}>
                {protocol?.instructions?.[langIndex]}
            </div>

            <div style={{ position: 'relative', width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Lungs Visual */}
                <motion.div 
                    style={{ 
                        width: '200px', height: '200px', borderRadius: '50%',
                        border: `2px solid ${phaseColor}`, position: 'absolute',
                        transform: `scale(${renderScale})`
                    }}
                />
                <motion.div 
                    style={{ 
                        width: '180px', height: '180px', borderRadius: '50%',
                        background: phaseColor, position: 'absolute', opacity: 0.2, filter: 'blur(30px)',
                        transform: `scale(${renderScale})`
                    }}
                />
                
                {/* Text */}
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                    <div style={{ 
                        fontSize: '72px', fontWeight: '200', color: textMain, 
                        fontFamily: 'Segoe UI Light', fontVariantNumeric: 'tabular-nums',
                        textShadow: `0 0 30px ${phaseColor}40`
                    }}>
                        {displayTime}
                    </div>
                    <motion.div 
                        key={phaseType}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                        style={{ fontSize: '18px', color: phaseColor, textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '600' }}
                    >
                        {phaseName}
                    </motion.div>
                </div>
            </div>

            <div style={{ marginTop: '50px', fontSize: '14px', color: textSub, letterSpacing: '1px' }}>
                {langIndex === 0 ? 'Цикл' : 'Cycle'} {cycleInfo()}
            </div>

            {/* CONTROLS */}
            <div style={{ position: 'absolute', bottom: '50px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={20}/> : <IoVolumeMute size={20}/>} theme={theme} size={50} />
                <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={30}/> : <IoPlay size={30} style={{marginLeft:'4px'}}/>} theme={theme} size={80} accent={phaseColor} />
                <CircleButton onClick={handlePause} icon={<IoClose size={24}/>} theme={theme} size={50} />
            </div>

            {/* PAUSE OVERLAY */}
            <AnimatePresence>
                {isPaused && (
                    <motion.div 
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
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
      )}

      {/* === FINISH === */}
      {isFinished && (
        <motion.div 
            key="finish"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px', zIndex: 10 }}
        >
            <div style={{ position: 'relative' }}>
                <motion.div 
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
            <motion.button 
                whileTap={{ scale: 0.95 }}
                onClick={() => { setIsFinished(false); setShow(false); }}
                style={{ 
                    padding: '15px 50px', borderRadius: '30px', 
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                    color: textMain, fontSize: '16px', fontWeight: '500',zIndex: 10
                }}
            >
                {langIndex === 0 ? 'В меню' : 'Done'}
            </motion.button>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
};

export default BreathingTimer;

// === HELPERS & STYLES ===

const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <motion.button 
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
    </motion.button>
);

const ControlButton = ({ onClick, icon, label, theme, type = 'secondary', accent, size = 55 }) => {
    const isPrimary = type === 'primary';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.button 
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
            </motion.button>
            {label && <span style={{ fontSize: '12px', color: Colors.get('subText', theme), fontWeight: '600' }}>{label}</span>}
        </div>
    );
}

const styles = (theme, show) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    position: 'fixed',
    height: '86vh',
    transform: show ? 'translateY(0)' : 'translateY(100%)',
    bottom: '0',
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    width: '100vw',
    fontFamily: 'Segoe UI',
    borderTop: `1px solid ${Colors.get('border', theme)}`,
    borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
    zIndex: 2000, overflow: 'hidden', 
    boxShadow: '0 -20px 60px rgba(0,0,0,0.5)'
  }
});

const disclaimer = (langIndex) => {
  if (langIndex === 0) return "Внимание: Дыхательные практики — это инструмент поддержки. При головокружении остановитесь."; 
  return "Notice: Breathing exercises are a support tool. Stop if you feel dizzy."; 
};

const congratulations = (langIndex) => {
  const messages = {
    ru: [ 'Дыхание спокойно.', 'Ум очищен.', 'Энергия восстановлена.', 'Гармония внутри.' ],
    en: [ 'Breath is calm.', 'Mind is clear.', 'Energy restored.', 'Inner harmony.' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};

