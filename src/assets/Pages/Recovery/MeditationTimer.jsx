import { useEffect, useState, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors, { THEME } from '../../StaticClasses/Colors';
import { theme$, lang$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from 'react-icons/io5';
import { FaInfoCircle } from 'react-icons/fa';
import { saveMeditationSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// === FREE AMBIENT SOUND (CC0) ===
const AMBIENT_SOUND_URL = 'Audio/Ambient.wav';
const audio = new Audio(AMBIENT_SOUND_URL);
audio.loop = true;
audio.volume = 0.22;

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
      border: '1px solid rgba(159,140,255,0.16)'
    }}>
      <div style={{ width: '100%', minWidth: 0, textAlign: 'center', fontSize: '10px', color: textSub, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 900, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `34px ${wide ? '52px' : '42px'} 34px`, alignItems: 'center', justifyItems: 'center', gap: '8px', flexShrink: 0 }}>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={dec} style={stepperButtonStyle('#9f8cff')}>−</Motion.button>
        <div style={{ fontSize: wide ? '25px' : '23px', fontWeight: 900, color: textMain, fontVariantNumeric: 'tabular-nums', lineHeight: 1, textAlign: 'center' }}>{value}</div>
        <Motion.button whileTap={{ scale: 0.92 }} onClick={inc} style={stepperButtonStyle('#9f8cff')}>+</Motion.button>
      </div>
    </div>
  );
}

const getSessionMeta = (protocol, categoryIndex, protocolIndex) => ({
  categoryIndex,
  protocolIndex,
  protocolName: protocol?.name?.[0] || protocol?.name?.[1] || '',
});

const MeditationTimer = ({ show, setShow, protocol, categoryIndex = 0, protocolIndex = 0 }) => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Config
  const [meditateMinutes, setMeditateMinutes] = useState(10);
  const [restSeconds, setRestSeconds] = useState(0);
  const [mode, setMode] = useState('time'); // 'time' | 'cycles'
  const [cyclesCount, setCyclesCount] = useState(1);

  // Timer Logic
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  // Stats
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const s1 = theme$.subscribe(setThemeState);
    const s2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
    return () => { s1.unsubscribe(); s2.unsubscribe(); };
  }, []);

  // --- LOGIC CALCULATIONS ---
  const session = useMemo(() => {
    const meditateSeconds = mode === 'time'
      ? Math.round((meditateMinutes * 60) / Math.max(cyclesCount, 1))
      : meditateMinutes * 60;
    return {
      cycles: mode === 'cycles' ? Math.max(1, cyclesCount) : 1,
      steps: [{ meditateSeconds, restSeconds }]
    };
  }, [mode, meditateMinutes, restSeconds, cyclesCount]);

  const allSteps = useMemo(() => {
    const { cycles, steps } = session;
    const { meditateSeconds, restSeconds: rs } = steps[0];
    const result = [];
    for (let cycle = 0; cycle < cycles; cycle++) {
      result.push({ type: 'meditate', duration: meditateSeconds * 1000, cycle });
      if (rs > 0 && cycle < cycles - 1) {
        result.push({ type: 'rest', duration: rs * 1000, cycle });
      }
    }
    return result.length > 0 ? result : [{ type: 'meditate', duration: 300000, cycle: 0 }];
  }, [session]);

  const currentStep = allSteps[currentStepIndex] || null;
  const duration = currentStep?.duration || 1000;

  // --- EFFECTS ---
  useEffect(() => {
    setCurrentStepIndex(0); setElapsed(0); setIsRunning(false);
    setIsStart(false); setIsPaused(false); setIsFinished(false);
  }, [session]);

  useEffect(() => {
    if (!isRunning || !currentStep) return;
    const interval = setInterval(() => {
      setElapsed(e => {
        const next = e + 100;
        if (next >= duration) {
          const nextIndex = currentStepIndex + 1;
          if (nextIndex >= allSteps.length) {
            setIsRunning(false); onFinishSession();
          } else {
            setCurrentStepIndex(nextIndex); return 0;
          }
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning, currentStepIndex, duration, allSteps.length]);

  useEffect(() => {
    if (audioEnabled && isStart && isRunning && audio.paused && !isFinished && !isPaused) audio.play().catch(() => {});
    else audio.pause();
  }, [isRunning, audioEnabled,isFinished,isStart,isPaused]);

  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!showStartTimer) { setSeconds(0); return; }
    const total = Math.ceil(startTimerDuration / 1000);
    setSeconds(total);
    const id = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(id); handleStart(); setShowStartTimer(false); return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showStartTimer]);

  // --- HELPERS ---
  const phaseInfo = currentStep?.type === 'rest' 
    ? { name: langIndex === 0 ? 'Отдых' : 'Rest', color: '#A0AEC0' }
    : { name: langIndex === 0 ? 'Медитация' : 'Meditate', color: Colors.get('meditate', theme) };

  const cycleInfo = () => {
    if (!session.steps) return '0/0';
    const stepsPerCycle = session.steps[0].restSeconds > 0 ? 2 : 1;
    const currentCycle = Math.floor(currentStepIndex / stepsPerCycle) + 1;
    return `${currentCycle} / ${session.cycles}`;
  };

  const timeRemaining = Math.max(0, duration - elapsed);
  const totalSecs = Math.floor(timeRemaining / 1000);
  const displayTime = `${Math.floor(totalSecs / 60).toString().padStart(2, '0')}:${(totalSecs % 60).toString().padStart(2, '0')}`;
  const visualProgress = currentStep ? elapsed / currentStep.duration : 0;

  // --- ACTIONS ---
  const handleStart = () => { setAudioEnabled(true); setStartTime(Date.now()); setIsStart(true); setIsRunning(true); setIsPaused(false); };
  const handlePause = () => { setEndTime(Date.now()); setIsRunning(false); setIsPaused(true); audio.pause(); };
  const handleResume = () => { setIsRunning(true); setIsPaused(false); };
  const handleReload = () => { setCurrentStepIndex(0); setElapsed(0); setIsRunning(false); setIsStart(false); setIsPaused(false); setIsFinished(false); };
  const getSaveMeta = () => ({
    ...getSessionMeta(protocol, categoryIndex, protocolIndex),
    cycles: session.cycles,
  });
  const onFinishSession = async () => {
    await saveMeditationSession(startTime, Date.now(), getSaveMeta());
    setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async () => { await saveMeditationSession(startTime, endTime, getSaveMeta()); handleReload(); setShow(false); };

  // --- RENDER VARS ---
  const accent = Colors.get('meditate', theme);
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* 1. ATMOSPHERIC BACKGROUND */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <Motion.div 
            animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ 
                position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', 
                background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`, filter: 'blur(60px)', opacity: 0.6 
            }} 
          />
          <Motion.div 
            animate={{ x: [0, -30, 30, 0], y: [0, 30, -30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 2 }}
            style={{ 
                position: 'absolute', bottom: '-10%', right: '-10%', width: '500px', height: '500px', 
                background: `radial-gradient(circle, #4DFF8820 0%, transparent 50%)`, filter: 'blur(50px)', opacity: 0.5 
            }} 
          />
      </div>

      {/* 2. MENU CONTENT */}
      <AnimatePresence mode='wait'>
        
        {/* === START SCREEN === */}
        {!isFinished && !isStart && !showStartTimer && (
            <Motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', height: '100%', padding: '24px 4.5vw 18px', boxSizing: 'border-box', zIndex: 10
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minHeight: '30px', padding: '0 12px', borderRadius: '999px', color: accent, background: 'rgba(159,140,255,0.08)', border: '1px solid rgba(159,140,255,0.16)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 900 }}>
                        {langIndex === 0 ? 'Медитация' : 'Meditation'}
                    </div>
                    <h2 style={{ fontSize: 'clamp(24px, 7vw, 32px)', color: textMain, margin: '10px auto 0', maxWidth: '560px', fontWeight: 900, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", lineHeight: 1.04, letterSpacing: 0 }}>
                        {protocol.name[langIndex]}
                    </h2>
                </div>

                {/* Center Card */}
                <div style={{ 
                    width: '100%', maxWidth: '560px',
                    background: 'linear-gradient(135deg, rgba(159,140,255,0.085), rgba(18,21,26,0.94))', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(159,140,255,0.2)', borderRadius: '26px', 
                    padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)', overflowY: 'auto', maxHeight: '58vh'
                }}>
                    
                    {/* Goal */}
                    <div style={{ padding: '10px 12px', borderRadius: '16px', background: 'rgba(159,140,255,0.075)', border: '1px solid rgba(159,140,255,0.12)' }}>
                        <div style={{ fontSize: '13px', color: textSub, lineHeight: '1.35', fontWeight: 800, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {protocol.aim[langIndex]}
                        </div>
                    </div>

                    {/* Mode Toggle */}
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
                                            background: active ? accent : 'transparent',
                                            color: active ? '#fff' : textSub,
                                            fontSize: '13px', fontWeight: active ? 700 : 500, outline: 'none'
                                        }}>
                                        {langIndex === 0 ? m.ru : m.en}
                                    </Motion.button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Duration & Cycles Steppers */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        <PhaseStepper theme={theme}
                            label={langIndex === 0 ? 'Минут' : 'Minutes'}
                            value={meditateMinutes} min={1} max={120} wide
                            onChange={setMeditateMinutes} />
                        {mode === 'cycles' ? (
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Циклов' : 'Cycles'}
                                value={cyclesCount} min={1} max={20} wide
                                onChange={setCyclesCount} />
                        ) : (
                            <PhaseStepper theme={theme}
                                label={langIndex === 0 ? 'Отдых (с)' : 'Rest (s)'}
                                value={restSeconds} min={0} max={120} step={5} wide
                                onChange={setRestSeconds} />
                        )}
                    </div>
                    {mode === 'cycles' && (
                        <PhaseStepper theme={theme}
                            label={langIndex === 0 ? 'Отдых между циклами (с)' : 'Rest between cycles (s)'}
                            value={restSeconds} min={0} max={120} step={5} wide
                            onChange={setRestSeconds} />
                    )}

                    {/* Pattern */}
                    <div style={{ background: 'rgba(255,255,255,0.035)', borderRadius: '16px', padding: '11px 12px', border: '1px solid rgba(255,255,255,0.055)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: accent, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            <FaInfoCircle /> {mode === 'time' ? (langIndex === 0 ? 'Тихая сессия' : 'Quiet session') : (langIndex === 0 ? 'С циклическим отдыхом' : 'Cyclic rest')}
                        </div>
                    </div>

                    {/* DISCLAIMER */}
                    <p style={{ fontSize: '10px', color: textSub, textAlign: 'center', opacity: 0.45, lineHeight: '1.3', margin: '-2px 0 0' }}>
                        {langIndex === 0 ? 'Остановитесь, если стало некомфортно.' : 'Stop if you feel uncomfortable.'}
                    </p>
                </div>

                {/* Bottom Actions */}
                <div style={{ width: '100%', maxWidth: '560px', display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr)', alignItems: 'center', gap: '12px', padding: '10px 0 0' }}>
                    <Motion.button whileTap={{ scale: 0.92 }} onClick={() => setShow(false)} aria-label={langIndex === 0 ? 'Закрыть' : 'Close'} style={{ height: '56px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.045)', color: textSub, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', outline: 'none' }}>
                        <IoClose size={25} />
                    </Motion.button>

                    <Motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStartTimer(true)}
                        style={{ 
                            height: '56px', borderRadius: '18px', border: '1px solid rgba(159,140,255,0.28)',
                            background: `linear-gradient(135deg, ${accent}, #745cff)`, color: '#fff', fontSize: '15px', fontWeight: 900,
                            boxShadow: `0 16px 42px -16px ${accent}80`,
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

        {/* === COUNTDOWN === */}
        {!isFinished && showStartTimer && (
            <CountdownStage seconds={seconds} theme={theme} accent={accent} isRu={langIndex === 0} />
        )}

        {/* === ACTIVE TIMER === */}
        {!isFinished && isStart && (
            <Motion.div 
                key="active"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative', padding: '88px 20px 132px', boxSizing: 'border-box' }}
            >
                <div style={{ position: 'absolute', top: 'calc(26px + env(safe-area-inset-top, 0px))', left: '50%', transform: 'translateX(-50%)', width: 'min(86vw, 430px)', minHeight: '48px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '0 14px', boxSizing: 'border-box', color: textMain, background: 'rgba(18,21,24,0.58)', border: `1px solid ${phaseInfo.color}24`, backdropFilter: 'blur(18px)' }}>
                    <span style={{ color: textSub, fontSize: '11px', fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                        {langIndex === 0 ? 'Спокойный фокус' : 'Calm focus'}
                    </span>
                    <span style={{ color: phaseInfo.color, fontSize: '12px', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        {phaseInfo.name}
                    </span>
                </div>

                {/* TIMER VISUALIZATION */}
                <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* Glow Ring */}
                    <Motion.div 
                        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{ 
                            position: 'absolute', inset: 0, borderRadius: '50%',
                            background: `radial-gradient(circle, ${phaseInfo.color} 0%, transparent 60%)`, filter: 'blur(30px)'
                        }}
                    />

                    {/* Progress SVG */}
                    <svg width="320" height="320" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="160" cy="160" r="140" fill="none" stroke={Colors.get('border', theme)} strokeWidth="2" opacity="0.2" />
                        <circle 
                            cx="160" cy="160" r="140" fill="none" stroke={phaseInfo.color} strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 140}`}
                            strokeDashoffset={`${2 * Math.PI * 140 * (1 - visualProgress)}`}
                            style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 8px ${phaseInfo.color})` }}
                        />
                    </svg>

                    {/* Center Text */}
                    <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ fontSize: '64px', fontWeight: '200', color: textMain, fontFamily: 'inherit', fontVariantNumeric: 'tabular-nums' }}>
                            {displayTime}
                        </div>
                        <Motion.div 
                            key={phaseInfo.name}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '14px', color: phaseInfo.color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                        >
                            {phaseInfo.name}
                        </Motion.div>
                    </div>
                </div>

                <div style={{ marginTop: '20px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.045)', border: '1px solid rgba(255,255,255,0.07)', fontSize: '13px', color: textSub, letterSpacing: '0.03em', fontWeight: 800 }}>
                    {langIndex === 0 ? 'Цикл' : 'Cycle'} {cycleInfo()}
                </div>

                {/* CONTROLS */}
                <div style={{ position: 'absolute', bottom: 'calc(42px + env(safe-area-inset-bottom, 0px))', display: 'flex', gap: '22px', alignItems: 'center' }}>
                    <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={18}/> : <IoVolumeMute size={18}/>} theme={theme} size={48} />
                    <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={28}/> : <IoPlay size={28} style={{marginLeft:'4px'}}/>} theme={theme} size={72} accent={phaseInfo.color} />
                    <CircleButton onClick={handlePause} icon={<IoClose size={22}/>} theme={theme} size={48} />
                </div>

                {/* PAUSE OVERLAY */}
                <AnimatePresence>
                    {isPaused && (
                        <Motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ 
                                position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 20
                            }}
                        >
                            <div style={{ fontSize: '24px', fontWeight: '300', color: '#fff', letterSpacing: '1px' }}>
                                {langIndex === 0 ? 'ПАУЗА' : 'PAUSED'}
                            </div>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <div onClick={handleReload} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IoClose size={24}/></div>
                                    <span style={{ fontSize: '12px', color: '#fff' }}>{langIndex === 0 ? 'Выйти' : 'Exit'}</span>
                                </div>
                                <div onClick={handleResume} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: `0 0 20px ${accent}60` }}><IoPlay size={24}/></div>
                                    <span style={{ fontSize: '12px', color: '#fff' }}>{langIndex === 0 ? 'Далее' : 'Resume'}</span>
                                </div>
                                <div onClick={onSaveSession} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IoCheckmark size={24}/></div>
                                    <span style={{ fontSize: '12px', color: '#fff' }}>{langIndex === 0 ? 'Финиш' : 'Finish'}</span>
                                </div>
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </Motion.div>
        )}

        {/* === SUCCESS SCREEN === */}
        {isFinished && (
            <Motion.div 
                key="finish"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px', zIndex: 10 }}
            >
                <div style={{ position: 'relative' }}>
                    <Motion.div 
                        animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        style={{ width: '150px', height: '150px', borderRadius: '50%', border: `1px dashed ${accent}`, position: 'absolute', top: -15, left: -15 }}
                    />
                    <img src="images/Meditate.png" style={{ width: '150px' }} alt="Done" />
                </div>
                
                <div style={{ textAlign: 'center',zIndex: 10 }}>
                    <h2 style={{ fontSize: '32px', color: textMain, margin: '0 0 10px 0', fontWeight: '300' }}>
                        {langIndex === 0 ? 'Сессия завершена' : 'Session Complete'}
                    </h2>
                    <p style={{ width: '80%', color: textSub, fontSize: '16px', lineHeight: '1.6', margin: '0 auto' }}>
                        {finishMessage}
                    </p>
                </div>

                <Motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsFinished(false); setShow(false); }}
                    style={{ 
                        padding: '15px 50px', borderRadius: '30px',zIndex: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: textMain, fontSize: '16px', fontWeight: '500'
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

export default MeditationTimer;

// === HELPERS ===
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
      <div style={{ marginTop: '8px', color: textSub, fontSize: '14px', fontWeight: 700 }}>{isRu ? 'Мягко переведите внимание внутрь' : 'Let your attention settle inward'}</div>
    </Motion.div>
  );
}

const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <Motion.button 
        whileTap={{ scale: 0.9 }}
        onClick={onClick}
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
  },
  decorLayer: {
    // Handled by blobs now
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'
  }
});

const congratulations = (langIndex) => {
  const messages = {
    ru: [ 'Чистое сознание.', 'Гармония внутри.', 'Спокойствие ума.', 'Момент тишины.' ],
    en: [ 'Pure awareness.', 'Inner harmony.', 'Calm mind.', 'A moment of peace.' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};
