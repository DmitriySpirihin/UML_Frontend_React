import { useEffect, useState, useRef, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from 'react-icons/io5';
import { FaInfoCircle, FaFire, FaSnowflake } from 'react-icons/fa';
import { saveHardeningSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const AMBIENT_SOUND_URL = 'Audio/relax/ocean-waves.mp3';
const audio = new Audio(AMBIENT_SOUND_URL);
audio.loop = true;
audio.preload = 'auto';
audio.volume = 0.18;

const startTimerDuration = 3000;

const stepperButtonStyle = (accent) => ({
  width: '34px',
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

function PhaseStepper({ theme, label, value, min = 0, max = 60, step = 1, onChange, wide = false }) {
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const isDark = theme === 'dark' || theme === 'specialdark';
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div style={{
      background: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.045)',
      borderRadius: '16px',
      padding: '10px 12px',
      minHeight: '58px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      border: '1px solid rgba(105,214,240,0.16)'
    }}>
      <div style={{ width: '100%', minWidth: 0, textAlign: 'center', fontSize: '10px', color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `34px ${wide ? '52px' : '42px'} 34px`, alignItems: 'center', justifyItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={dec} style={stepperButtonStyle('#69d6f0')}>−</Motion.button>
        <div style={{ fontSize: wide ? '25px' : '23px', fontWeight: 900, color: textMain, fontVariantNumeric: 'tabular-nums', lineHeight: 1, textAlign: 'center' }}>{value}</div>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={inc} style={stepperButtonStyle('#69d6f0')}>+</Motion.button>
      </div>
    </div>
  );
}

const getSessionMeta = (protocol, categoryIndex, protocolIndex) => ({
  categoryIndex,
  protocolIndex,
  protocolName: protocol?.name?.[0] || protocol?.name?.[1] || '',
});

const HardeningTimer = ({ show, setShow, protocol, categoryIndex = 0, protocolIndex = 0 }) => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Config
  const [hotSeconds, setHotSeconds] = useState(60);
  const [coldSeconds, setColdSeconds] = useState(30);
  const [restSeconds, setRestSeconds] = useState(0);
  const [cyclesCount, setCyclesCount] = useState(3);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  const startTimeRef = useRef(0);
  const animationRef = useRef();
  const coldTimeRef = useRef(0);

  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const s1 = theme$.subscribe(setThemeState);
    const s2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
    return () => { s1.unsubscribe(); s2.unsubscribe(); };
  }, []);

  // --- LOGIC ---
  const session = useMemo(() => ({
    cycles: Math.max(1, cyclesCount),
    steps: [{ hotSeconds, coldSeconds, restSeconds }]
  }), [cyclesCount, hotSeconds, coldSeconds, restSeconds]);

  const allSteps = useMemo(() => {
    const { cycles, steps } = session;
    if (!steps?.length) return [];
    const { hotSeconds, coldSeconds, restSeconds } = steps[0];
    const result = [];
    for (let cycle = 0; cycle < cycles; cycle++) {
      if (hotSeconds > 0) result.push({ type: 'hot', duration: hotSeconds * 1000, cycle });
      if (coldSeconds > 0) result.push({ type: 'cold', duration: coldSeconds * 1000, cycle });
      if (restSeconds > 0 && cycle < cycles - 1) result.push({ type: 'rest', duration: restSeconds * 1000, cycle });
    }
    return result;
  }, [session]);

  const currentStep = allSteps[currentStepIndex] || null;
  const duration = currentStep?.duration || 1000;

  useEffect(() => {
    setCurrentStepIndex(0); setPhaseProgress(0); setIsRunning(false);
    setIsStart(false); setIsPaused(false); setIsFinished(false);
    coldTimeRef.current = 0; startTimeRef.current = 0;
  }, [session]);

  useEffect(() => {
    if (!isRunning || !currentStep) return;
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setPhaseProgress(progress);
      if (progress >= 1) {
        if (currentStep.type === 'cold') coldTimeRef.current += currentStep.duration;
        const nextIndex = currentStepIndex + 1;
        if (nextIndex >= allSteps.length) {
          setIsRunning(false); setEndTime(Date.now()); onFinishSession();
        } else {
          setCurrentStepIndex(nextIndex); startTimeRef.current = 0;
        }
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [currentStepIndex, isRunning, duration, allSteps.length]);

  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!showStartTimer) { setSeconds(0); return; }
    const total = Math.ceil(startTimerDuration / 1000);
    setSeconds(total);
    const id = setInterval(() => {
      setSeconds(p => {
        if (p <= 1) { clearInterval(id); handleStart(); setShowStartTimer(false); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showStartTimer]);

  useEffect(() => {
    if (audioEnabled && isStart && isRunning && audio.paused && !isFinished && !isPaused) audio.play().catch(() => {});
    else audio.pause();
  }, [audioEnabled, isStart, isRunning, isFinished, isPaused]);

  // --- HELPERS ---
  const getPhaseInfo = (step) => {
    if (!step) return { name: '', color: '#94a3b8', type: 'none' };
    if (step.type === 'hot') return { name: langIndex === 0 ? 'Тепло' : 'Warm', color: '#FF5722', secondary: '#FF9100', type: 'hot' };
    if (step.type === 'cold') return { name: langIndex === 0 ? 'Холод' : 'Cold', color: '#00E5FF', secondary: '#2979FF', type: 'cold' };
    if (step.type === 'rest') return { name: langIndex === 0 ? 'Отдых' : 'Rest', color: '#B0BEC5', secondary: '#78909C', type: 'rest' };
    return { name: '', color: '#fff', type: 'none' };
  };

  const { name: phaseName, color: phaseColor, secondary: secondaryColor, type: phaseType } = getPhaseInfo(currentStep);
  const cycleInfo = () => {
    if (!session.steps) return '0 / 0';
    const { hotSeconds, coldSeconds, restSeconds } = session.steps[0];
    const stepsPerCycle = (hotSeconds > 0 ? 1 : 0) + (coldSeconds > 0 ? 1 : 0) + (restSeconds > 0 ? 1 : 0);
    const currentC = stepsPerCycle ? Math.floor(currentStepIndex / stepsPerCycle) + 1 : 1;
    return `${currentC} / ${session.cycles}`;
  };
  const timeRemaining = duration * (1 - phaseProgress);
  const displayTime = `${Math.floor(timeRemaining / 60000).toString().padStart(2, '0')}:${(Math.floor((timeRemaining % 60000) / 1000)).toString().padStart(2, '0')}`;

  // --- HANDLERS ---
  const handleStart = () => { setAudioEnabled(true); setStartTime(Date.now()); setIsStart(true); setIsRunning(true); setIsPaused(false); };
  const handlePause = () => { setEndTime(Date.now()); setIsRunning(false); setIsPaused(true); audio.pause(); };
  const handleResume = () => { setIsRunning(true); setIsPaused(false); };
  const handleReload = () => { setCurrentStepIndex(0); setPhaseProgress(0); setIsRunning(false); setIsStart(false); setIsPaused(false); setIsFinished(false); coldTimeRef.current = 0; startTimeRef.current = 0; audio.pause(); audio.currentTime = 0; };
  const getSaveMeta = () => ({
    ...getSessionMeta(protocol, categoryIndex, protocolIndex),
    cycles: session.cycles,
  });
  const onFinishSession = async () => {
    await saveHardeningSession(startTime, Date.now(), coldTimeRef.current, getSaveMeta());
    setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async () => { await saveHardeningSession(startTime, endTime, coldTimeRef.current, getSaveMeta()); handleReload(); setShow(false); };

  // --- RENDER ---
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const accent = phaseColor || Colors.get('cold', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* BACKGROUND */}
      <Motion.div 
        animate={{ 
            background: isStart && !isFinished 
                ? `linear-gradient(180deg, ${phaseColor}40 0%, ${secondaryColor}10 100%)`
                : `linear-gradient(180deg, ${Colors.get('background', theme)} 0%, ${Colors.get('background', theme)} 100%)`
        }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      

      <AnimatePresence mode='wait'>
      
      {/* === 1. MENU (FIXED LAYOUT) === */}
      {!isFinished && !isStart && !showStartTimer && (
        <Motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            style={{ 
                position: 'absolute', inset: 0, zIndex: 10,
                display: 'flex', flexDirection: 'column'
            }}
        >
            {/* Scrollable Content */}
            <div style={{ 
                flex: 1, overflowY: 'auto', overflowX: 'hidden', 
                padding: '24px 4.5vw 100px',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '18px', width: '100%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px', padding: '0 12px', borderRadius: '999px', color: Colors.get('cold', theme), background: 'rgba(105,214,240,0.08)', border: '1px solid rgba(105,214,240,0.16)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 900 }}>
                        {langIndex === 0 ? 'Закаливание' : 'Cold exposure'}
                    </div>
                    <h2 style={{ fontSize: 'clamp(24px, 7vw, 32px)', color: textMain, margin: '10px auto 0', maxWidth: '560px', fontWeight: 900, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.04, letterSpacing: 0 }}>
                        {protocol.name[langIndex]}
                    </h2>
                </div>

                {/* Card */}
                <div style={{ 
                    width: '100%', maxWidth: '560px',
                    background: 'linear-gradient(135deg, rgba(105,214,240,0.085), rgba(18,21,26,0.94))', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(105,214,240,0.2)', borderRadius: '26px', 
                    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)'
                }}>
                    {/* Goal */}
                    <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(105,214,240,0.075)', border: '1px solid rgba(105,214,240,0.12)' }}>
                        <div style={{ fontSize: '13px', color: textSub, lineHeight: '1.35', fontWeight: 800, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {protocol.aim[langIndex]}
                        </div>
                    </div>

                    {/* Config Steppers */}
                    <div>
                        <div style={{ fontSize: '10px', color: textSub, fontWeight: 900, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>
                            {langIndex === 0 ? 'Настройки' : 'Settings'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Тепло (с)' : 'Warm (s)'}
                                value={hotSeconds} min={0} max={600} step={10} wide
                                onChange={setHotSeconds} />
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Холод (с)' : 'Cold (s)'}
                                value={coldSeconds} min={0} max={600} step={5} wide
                                onChange={setColdSeconds} />
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Отдых (с)' : 'Rest (s)'}
                                value={restSeconds} min={0} max={300} step={5} wide
                                onChange={setRestSeconds} />
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Циклов' : 'Cycles'}
                                value={cyclesCount} min={1} max={20} wide
                                onChange={setCyclesCount} />
                        </div>
                    </div>

                    {/* Summary */}
                    <div style={{ background: 'rgba(105,214,240,0.055)', borderRadius: '16px', padding: '12px', border: '1px solid rgba(105,214,240,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.get('hot', theme) }}>
                                <FaFire size={14}/> <span style={{fontSize: '15px', fontWeight: 'bold'}}>{hotSeconds}s</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.get('cold', theme) }}>
                                <FaSnowflake size={14}/> <span style={{fontSize: '15px', fontWeight: 'bold'}}>{coldSeconds}s</span>
                            </div>
                            <div style={{ fontSize: '13px', color: textSub, fontWeight: 'bold' }}>
                                × {cyclesCount}
                            </div>
                        </div>
                    </div>

                    {/* Pattern */}
                    <div style={{ background: 'rgba(255,255,255,0.035)', borderRadius: '16px', padding: '11px 12px', border: '1px solid rgba(255,255,255,0.055)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: Colors.get('cold', theme), fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <FaInfoCircle /> {langIndex === 0 ? 'Контрастный цикл' : 'Contrast cycle'}
                        </div>
                    </div>

                    <p style={{ fontSize: '10px', color: textSub, textAlign: 'center', opacity: 0.45, lineHeight: '1.3', margin: '-2px 0 0' }}>
                        {langIndex === 0 ? 'Остановитесь, если стало некомфортно.' : 'Stop if you feel uncomfortable.'}
                    </p>
                </div>
            </div>

            {/* Bottom Actions (Pinned & Solid Background) */}
            <div style={{ 
                position: 'absolute', bottom: 0, left: 0, width: '100%', 
                padding: '20px', boxSizing: 'border-box',
                display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr)', gap: '12px', alignItems: 'center',
                background: `linear-gradient(to top, ${Colors.get('background', theme)} 80%, transparent 100%)`,
                zIndex: 20
            }}>
                <Motion.button whileTap={{ scale: 0.92 }} onClick={() => setShow(false)} aria-label={langIndex === 0 ? 'Закрыть' : 'Close'} style={{ height: '56px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.045)', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
                    <IoClose size={25} />
                </Motion.button>

                <Motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStartTimer(true)}
                    style={{ 
                        height: '56px', borderRadius: '18px', border: '1px solid rgba(105,214,240,0.28)',
                        background: `linear-gradient(135deg, ${Colors.get('cold', theme)}, #2095d8)`, color: '#061017', fontSize: '15px', fontWeight: 900,
                        boxShadow: `0 16px 42px -16px ${Colors.get('cold', theme)}80`,
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

      {/* === 2. COUNTDOWN === */}
      {!isFinished && showStartTimer && (
        <CountdownStage seconds={seconds} theme={theme} accent={Colors.get('cold', theme)} isRu={langIndex === 0} />
      )}

      {/* === 3. ACTIVE TIMER === */}
      {!isFinished && isStart && (
        <Motion.div 
            key="active"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative', padding: '88px 20px 132px', boxSizing: 'border-box' }}
        >
            <div style={{ position: 'absolute', top: 'calc(26px + env(safe-area-inset-top, 0px))', left: '50%', transform: 'translateX(-50%)', width: 'min(86vw, 430px)', minHeight: '48px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 14px', boxSizing: 'border-box', color: textMain, background: 'rgba(18,21,24,0.58)', border: `1px solid ${phaseColor}24`, backdropFilter: 'blur(18px)' }}>
                <span style={{ color: textSub, fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {langIndex === 0 ? 'Контраст' : 'Contrast'}
                </span>
                <span style={{ color: phaseColor, fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {phaseName}
                </span>
            </div>
            
            <div style={{ position: 'relative', width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Motion.div animate={phaseType === 'hot' ? { scale: [1, 1.1, 1], opacity: 0.8 } : phaseType === 'cold' ? { x: [-2, 2, -2], rotate: [0, 1, -1, 0] } : { scale: 1 }} transition={phaseType === 'hot' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.1, repeat: Infinity }} style={{ width: '220px', height: '220px', borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${phaseColor} 0%, ${secondaryColor} 100%)`, position: 'absolute', boxShadow: `0 0 60px ${phaseColor}60` }} />
                <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}><circle cx="160" cy="160" r="140" fill="none" stroke={Colors.get('border', theme)} strokeWidth="2" opacity="0.2" /><circle cx="160" cy="160" r="140" fill="none" stroke={phaseColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 140}`} strokeDashoffset={`${2 * Math.PI * 140 * (1 - phaseProgress)}`} style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 10px ${phaseColor})` }} /></svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                    <div style={{ fontSize: '72px', fontWeight: '200', color: '#fff', fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{displayTime}</div>
                    <Motion.div key={phaseType} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '18px', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>{phaseName}</Motion.div>
                </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '13px', color: textSub, letterSpacing: '0.03em', fontWeight: 800 }}>{langIndex === 0 ? 'Цикл' : 'Cycle'} {cycleInfo()}</div>
            
            <div style={{ position: 'absolute', bottom: 'calc(42px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: '22px', alignItems: 'center' }}>
                <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={18}/> : <IoVolumeMute size={18}/>} theme={theme} size={48} />
                <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={28}/> : <IoPlay size={28} style={{marginLeft:'4px'}}/>} theme={theme} size={72} accent={phaseColor} />
                <CircleButton onClick={handlePause} icon={<IoClose size={22}/>} theme={theme} size={48} />
            </div>

            <AnimatePresence>
                {isPaused && (
                    <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 20 }}>
                        <div style={{ fontSize: '24px', fontWeight: '300', color: '#fff', letterSpacing: '1px' }}>{langIndex === 0 ? 'ПАУЗА' : 'PAUSED'}</div>
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

      {/* === 4. FINISH === */}
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
                            <img src="images/Cold.png" style={{ width: '150px' }} alt="Done" />
                        </div>
            <div style={{ textAlign: 'center',zIndex: 10 }}>
                <h2 style={{ fontSize: '32px', color: textMain, margin: '0 0 10px 0', fontWeight: '300' }}>{langIndex === 0 ? 'Закалка завершена' : 'Session Complete'}</h2>
                <p style={{ width: '80%', color: textSub, fontSize: '16px', lineHeight: '1.6', margin: '0 auto' }}>{finishMessage}</p>
            </div>
            <Motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsFinished(false); setShow(false); }} style={{ padding: '15px 50px',zIndex: 10, borderRadius: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: textMain, fontSize: '16px', fontWeight: '500' }}>{langIndex === 0 ? 'В меню' : 'Done'}</Motion.button>
        </Motion.div>
      )}

      </AnimatePresence>
    </div>
  );
};

export default HardeningTimer;

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
      <div style={{ marginTop: '8px', color: textSub, fontSize: '14px', fontWeight: 700 }}>{isRu ? 'Дышите ровно и не форсируйте' : 'Breathe evenly and do not force it'}</div>
    </Motion.div>
  );
}

const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <Motion.button 
        whileTap={{ scale: 0.9 }} onClick={onClick}
        style={{ width: size, height: size, borderRadius: '50%', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: accent || (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), color: accent ? '#fff' : Colors.get('mainText', theme), boxShadow: accent ? `0 8px 25px ${accent}60` : 'none' }}
    >
        {icon}
    </Motion.button>
);

const ControlButton = ({ onClick, icon, label, theme, type = 'secondary', accent, size = 55 }) => {
    const isPrimary = type === 'primary';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <Motion.button whileTap={{ scale: 0.92 }} onClick={onClick} style={{ width: size, height: size, borderRadius: '50%', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isPrimary ? (accent || '#BF5AF2') : (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), color: isPrimary ? '#fff' : Colors.get('mainText', theme), boxShadow: isPrimary ? `0 8px 30px ${accent || '#BF5AF2'}50` : 'none', backdropFilter: 'blur(5px)' }}>
                {icon}
            </Motion.button>
            {label && <span style={{ fontSize: '12px', color: Colors.get('subText', theme), fontWeight: '600' }}>{label}</span>}
        </div>
    );
}

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
    ru: [ 'Сила духа.', 'Энергия холода.', 'Иммунитет укреплен.', 'Ты справился!' ],
    en: [ 'Mental strength.', 'Cold energy.', 'Immunity boosted.', 'You did it!' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};
