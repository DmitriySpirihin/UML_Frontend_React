import { useEffect, useState, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors, { THEME } from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from 'react-icons/io5';
import { FaInfoCircle, FaMinus, FaPlus } from 'react-icons/fa';
import { saveMeditationSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion, AnimatePresence } from 'framer-motion';

// === FREE AMBIENT SOUND (CC0) ===
const AMBIENT_SOUND_URL = 'Audio/Ambient.wav';
const audio = new Audio(AMBIENT_SOUND_URL);
audio.loop = true;
audio.volume = 0.3;

const startTimerDuration = 3000;

function PhaseStepper({ theme, label, value, min = 0, max = 60, step = 1, onChange, wide = false }) {
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
      <div style={{ fontSize: '10px', color: textSub, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={dec}
          style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
          <FaMinus size={10} />
        </motion.button>
        <span style={{ fontSize: wide ? '22px' : '18px', fontWeight: 600, color: textMain,
          fontVariantNumeric: 'tabular-nums', minWidth: wide ? '60px' : '30px', textAlign: 'center' }}>{value}</span>
        <motion.button whileTap={{ scale: 0.9 }} onClick={inc}
          style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: 'rgba(255,255,255,0.08)', color: textMain,
            display: 'flex', alignItems: 'center', justifyContent: 'center', outline: 'none' }}>
          <FaPlus size={10} />
        </motion.button>
      </div>
    </div>
  );
}

const MeditationTimer = ({ show, setShow, protocol }) => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
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
    const s3 = fontSize$.subscribe(setFSize);
    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
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
    if (audioEnabled && isStart && isRunning && audio.paused && !isFinished && !isPaused) audio.play();
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
  const onFinishSession = async () => {
    await saveMeditationSession(startTime, Date.now());
    setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async () => { await saveMeditationSession(startTime, endTime); handleReload(); setShow(false); };

  // --- RENDER VARS ---
  const isDark = theme === 'dark' || theme === 'specialdark';
  const accent = Colors.get('meditate', theme);
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* 1. ATMOSPHERIC BACKGROUND */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <motion.div 
            animate={{ x: [0, 50, -50, 0], y: [0, -50, 50, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ 
                position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px', 
                background: `radial-gradient(circle, ${accent}30 0%, transparent 70%)`, filter: 'blur(60px)', opacity: 0.6 
            }} 
          />
          <motion.div 
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
            <motion.div 
                key="menu"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', height: '100%', padding: '40px 20px', boxSizing: 'border-box', zIndex: 10
                }}
            >
                {/* Header */}
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '12px', color: textSub, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {langIndex === 0 ? 'Протокол' : 'Protocol'}
                    </div>
                    <h2 style={{ fontSize: '32px', color: textMain, margin: 0, fontWeight: '300', fontFamily: 'Segoe UI Light, sans-serif' }}>
                        {protocol.name[langIndex]}
                    </h2>
                </div>

                {/* Center Card */}
                <div style={{ 
                    width: '100%', maxWidth: '360px',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '30px', 
                    padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)', overflowY: 'auto', maxHeight: '55vh'
                }}>
                    
                    {/* Goal */}
                    <div style={{ paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '11px', color: textSub, marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {langIndex === 0 ? 'Цель' : 'Goal'}
                        </div>
                        <div style={{ fontSize: '15px', color: textMain, lineHeight: '1.4' }}>
                            {protocol.aim[langIndex]}
                        </div>
                    </div>

                    {/* Mode Toggle */}
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
                                            background: active ? accent : 'transparent',
                                            color: active ? '#fff' : textSub,
                                            fontSize: '13px', fontWeight: active ? 700 : 500, outline: 'none'
                                        }}>
                                        {langIndex === 0 ? m.ru : m.en}
                                    </motion.button>
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

                    {/* INSTRUCTION (Restored) */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: textSub, marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            <FaInfoCircle /> {langIndex === 0 ? 'Инструкция' : 'Instruction'}
                        </div>
                        <div style={{ fontSize: '14px', color: textMain, lineHeight: '1.4' }}>
                            {protocol.instructions[langIndex]}
                        </div>
                    </div>

                    {/* DISCLAIMER (Restored Full) */}
                    <p style={{ fontSize: '10px', color: textSub, textAlign: 'center', opacity: 0.6, lineHeight: '1.3', margin: 0 }}>
                        {disclaimer(langIndex)}
                    </p>
                </div>

                {/* Bottom Actions */}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
                    <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShow(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSub, cursor: 'pointer' }}>
                        <IoClose size={24} />
                        <span style={{ fontSize: '14px' }}>{langIndex === 0 ? 'Закрыть' : 'Close'}</span>
                    </motion.div>

                    <motion.button 
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowStartTimer(true)}
                        style={{ 
                            padding: '15px 40px', borderRadius: '50px', border: 'none',
                            background: accent, color: '#fff', fontSize: '16px', fontWeight: 'bold',
                            boxShadow: `0 10px 30px -5px ${accent}60`
                        }}
                    >
                        {langIndex === 0 ? 'Начать' : 'Start'}
                    </motion.button>
                </div>
            </motion.div>
        )}

        {/* === COUNTDOWN === */}
        {!isFinished && showStartTimer && (
            <motion.div 
                key="countdown"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 10 }}
            >
                <motion.div 
                    key={seconds}
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                    style={{ fontSize: '140px', fontWeight: '200', color: textMain, fontFamily: 'Segoe UI Light' }}
                >
                    {seconds}
                </motion.div>
                <div style={{ marginTop: '20px', fontSize: '16px', color: textSub, letterSpacing: '1px' }}>
                    {langIndex === 0 ? 'Приготовьтесь...' : 'Get ready...'}
                </div>
            </motion.div>
        )}

        {/* === ACTIVE TIMER === */}
        {!isFinished && isStart && (
            <motion.div 
                key="active"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative' }}
            >
                {/* Instruction Float */}
                <div style={{ position: 'absolute', top: '10%', textAlign: 'center', width: '80%', color: textMain, opacity: 0.8, fontSize: '16px', lineHeight: '1.4' }}>
                    {protocol?.instructions?.[langIndex]}
                </div>

                {/* TIMER VISUALIZATION */}
                <div style={{ position: 'relative', width: '320px', height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    
                    {/* Glow Ring */}
                    <motion.div 
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
                        <div style={{ fontSize: '64px', fontWeight: '200', color: textMain, fontFamily: 'Segoe UI Light', fontVariantNumeric: 'tabular-nums' }}>
                            {displayTime}
                        </div>
                        <motion.div 
                            key={phaseInfo.name}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            style={{ fontSize: '14px', color: phaseInfo.color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}
                        >
                            {phaseInfo.name}
                        </motion.div>
                    </div>
                </div>

                <div style={{ marginTop: '40px', fontSize: '14px', color: textSub }}>
                    {langIndex === 0 ? 'Цикл' : 'Cycle'} {cycleInfo()}
                </div>

                {/* CONTROLS */}
                <div style={{ position: 'absolute', bottom: '50px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={20}/> : <IoVolumeMute size={20}/>} theme={theme} size={50} />
                    <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={30}/> : <IoPlay size={30} style={{marginLeft:'4px'}}/>} theme={theme} size={80} accent={phaseInfo.color} />
                    <CircleButton onClick={handlePause} icon={<IoClose size={24}/>} theme={theme} size={50} />
                </div>

                {/* PAUSE OVERLAY */}
                <AnimatePresence>
                    {isPaused && (
                        <motion.div 
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )}

        {/* === SUCCESS SCREEN === */}
        {isFinished && (
            <motion.div 
                key="finish"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px', zIndex: 10 }}
            >
                <div style={{ position: 'relative' }}>
                    <motion.div 
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

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setIsFinished(false); setShow(false); }}
                    style={{ 
                        padding: '15px 50px', borderRadius: '30px',zIndex: 10,
                        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', 
                        color: textMain, fontSize: '16px', fontWeight: '500'
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

export default MeditationTimer;

// === HELPERS ===
const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <motion.button 
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
    </motion.button>
);

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
  },
  decorLayer: {
    // Handled by blobs now
    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'
  }
});

const disclaimer = (langIndex) => {
  if (langIndex === 0) {
    return "Внимание: медитация предназначена для поддержки общего благополучия и не заменяет медицинскую помощь. При наличии психических, неврологических или сердечно-сосудистых заболеваний, при беременности или ухудшении самочувствия прекратите практику и при необходимости обратитесь к врачу.";
  }
  return "Notice: Meditation is intended to support general well-being and is not a substitute for medical care. If you have mental health, neurological, or cardiovascular conditions, are pregnant, or feel unwell, please stop the practice and consult a healthcare professional if needed.";
};

const congratulations = (langIndex) => {
  const messages = {
    ru: [ 'Чистое сознание.', 'Гармония внутри.', 'Спокойствие ума.', 'Момент тишины.' ],
    en: [ 'Pure awareness.', 'Inner harmony.', 'Calm mind.', 'A moment of peace.' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};

