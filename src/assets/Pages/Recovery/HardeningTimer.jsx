import { useEffect, useState, useRef, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, recoveryType$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from 'react-icons/io5';
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaFire, FaSnowflake } from 'react-icons/fa';
import { markSessionAsDone, saveHardeningSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion, AnimatePresence } from 'framer-motion';

const startTimerDuration = 3000;

const HardeningTimer = ({ show, setShow, protocol, protocolIndex, categoryIndex, isCustom = false }) => {
  // --- STATE ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [level, setLevel] = useState(setActualLevel(categoryIndex, protocolIndex, isCustom));
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
    const s3 = fontSize$.subscribe(setFSize);
    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
  }, []);

  useEffect(() => {
    setLevel(isCustom ? 0 : setActualLevel(categoryIndex, protocolIndex, isCustom));
  }, [protocol, protocolIndex, categoryIndex, isCustom]);

  // --- LOGIC ---
  const session = useMemo(() => {
    if (!protocol?.levels?.length) return { cycles: 1, steps: [{ hotSeconds: 180, coldSeconds: 30, restSeconds: 0 }] };
    return isCustom ? protocol.levels[0] : protocol.levels[level] || protocol.levels[0];
  }, [protocol, level, isCustom]);

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
  const handleReload = () => { setCurrentStepIndex(0); setPhaseProgress(0); setIsRunning(false); setIsStart(false); setIsPaused(false); setIsFinished(false); coldTimeRef.current = 0; startTimeRef.current = 0; };
  const onFinishSession = async () => {
    if (!isCustom) markSessionAsDone(2, categoryIndex, protocolIndex, level);
    await saveHardeningSession(startTime, Date.now(), coldTimeRef.current);
    setFinishMessage(congratulations(langIndex)); setIsFinished(true);
  };
  const onSaveSession = async () => { await saveHardeningSession(startTime, endTime, coldTimeRef.current); handleReload(); setShow(false); };

  // --- RENDER ---
  const isDark = theme === 'dark' || theme === 'specialdark';
  const textMain = Colors.get('mainText', theme);
  const textSub = Colors.get('subText', theme);
  const accent = phaseColor || Colors.get('cold', theme);

  return (
    <div style={styles(theme, show).container}>
      
      {/* BACKGROUND */}
      <motion.div 
        animate={{ 
            background: isStart && !isFinished 
                ? `linear-gradient(180deg, ${phaseColor}40 0%, ${secondaryColor}10 100%)`
                : `linear-gradient(180deg, ${Colors.get('background', theme)} 0%, ${Colors.get('background', theme)} 100%)`
        }}
        transition={{ duration: 1 }}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />

      {/* PARTICLES */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {phaseType === 'hot' && [...Array(10)].map((_, i) => (
              <motion.div key={`hot-${i}`}
                initial={{ y: '110%', opacity: 0 }}
                animate={{ y: '-10%', opacity: [0, 0.8, 0], x: Math.random() * 100 - 50 }}
                transition={{ duration: Math.random() * 2 + 3, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                style={{ position: 'absolute', left: `${Math.random() * 100}%`, width: '4px', height: '4px', background: '#FFC107', borderRadius: '50%', filter: 'blur(1px)' }}
              />
          ))}
          {phaseType === 'cold' && [...Array(10)].map((_, i) => (
              <motion.div key={`cold-${i}`}
                initial={{ y: '-10%', opacity: 0 }}
                animate={{ y: '110%', opacity: [0, 0.8, 0], x: Math.random() * 50 - 25 }}
                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                style={{ position: 'absolute', left: `${Math.random() * 100}%`, width: '6px', height: '6px', background: '#E0F7FA', borderRadius: '50%', filter: 'blur(1px)' }}
              />
          ))}
      </div>

      <AnimatePresence mode='wait'>
      
      {/* === 1. MENU (FIXED LAYOUT) === */}
      {!isFinished && !isStart && !showStartTimer && (
        <motion.div 
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
                padding: '40px 20px 100px 20px', // Extra padding bottom for buttons
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '25px', width: '100%' }}>
                    <div style={{ fontSize: '11px', color: textSub, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                        {langIndex === 0 ? 'Контраст' : 'Contrast'}
                    </div>
                    <h2 style={{ fontSize: '28px', color: textMain, margin: 0, fontWeight: '300', fontFamily: 'Segoe UI Light' }}>
                        {protocol.name[langIndex]}
                    </h2>
                </div>

                {/* Card */}
                <div style={{ 
                    width: '100%', maxWidth: '360px',
                    background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '30px', 
                    padding: '25px', display: 'flex', flexDirection: 'column', gap: '20px',
                    boxShadow: '0 20px 50px -20px rgba(0,0,0,0.3)'
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

                    {/* Level */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: textSub, fontWeight: 'bold', textTransform: 'uppercase' }}>{langIndex === 0 ? 'Уровень' : 'Level'}</span>
                            <span style={{ fontSize: '11px', color: Colors.get('cold', theme), fontWeight: 'bold' }}>
                                {isLevelDone(categoryIndex, protocolIndex, level, isCustom) ? (langIndex === 0 ? 'ПРОЙДЕН' : 'DONE') : ''}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', borderRadius: '50px', padding: '5px' }}>
                            <CircleButton onClick={() => setLevel(p => Math.max(0, p - 1))} icon={<FaChevronLeft size={12}/>} theme={theme} />
                            <span style={{ fontSize: '20px', fontWeight: '600', color: textMain, fontVariantNumeric: 'tabular-nums' }}>
                                {level + 1} <span style={{fontSize: '12px', opacity: 0.5, fontWeight: '400'}}>/ {protocol.levels.length}</span>
                            </span>
                            <CircleButton onClick={() => setLevel(p => Math.min(protocol.levels.length - 1, p + 1))} icon={<FaChevronRight size={12}/>} theme={theme} />
                        </div>
                    </div>

                    {/* Strategy */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.get('hot', theme) }}>
                                <FaFire size={14}/> <span style={{fontSize: '15px', fontWeight: 'bold'}}>{session.steps[0].hotSeconds / 60}m</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: Colors.get('cold', theme) }}>
                                <FaSnowflake size={14}/> <span style={{fontSize: '15px', fontWeight: 'bold'}}>{session.steps[0].coldSeconds}s</span>
                            </div>
                        </div>
                        <div style={{ fontSize: '11px', color: textSub, textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {session.cycles} {langIndex === 0 ? 'циклов' : 'cycles'}
                        </div>
                    </div>

                    {/* Instruction */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: textSub, marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            <FaInfoCircle /> {langIndex === 0 ? 'Инструкция' : 'Instruction'}
                        </div>
                        <div style={{ fontSize: '14px', color: textMain, lineHeight: '1.4' }}>
                            {protocol.instructions[langIndex]}
                        </div>
                    </div>

                    <p style={{ fontSize: '10px', color: textSub, textAlign: 'center', opacity: 0.5, lineHeight: '1.3', margin: 0 }}>
                        {disclaimer(langIndex)}
                    </p>
                </div>
            </div>

            {/* Bottom Actions (Pinned & Solid Background) */}
            <div style={{ 
                position: 'absolute', bottom: 0, left: 0, width: '100%', 
                padding: '20px', boxSizing: 'border-box',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: `linear-gradient(to top, ${Colors.get('background', theme)} 80%, transparent 100%)`,
                zIndex: 20
            }}>
                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShow(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: textSub, cursor: 'pointer' }}>
                    <IoClose size={24} />
                    <span style={{ fontSize: '14px' }}>{langIndex === 0 ? 'Закрыть' : 'Close'}</span>
                </motion.div>

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStartTimer(true)}
                    style={{ 
                        padding: '15px 45px', borderRadius: '50px', border: 'none',
                        background: Colors.get('cold', theme), color: '#fff', fontSize: '16px', fontWeight: 'bold',
                        boxShadow: `0 10px 40px -10px ${Colors.get('cold', theme)}60`
                    }}
                >
                    {langIndex === 0 ? 'Начать' : 'Start'}
                </motion.button>
            </div>
        </motion.div>
      )}

      {/* === 2. COUNTDOWN === */}
      {!isFinished && showStartTimer && (
        <motion.div 
            key="countdown"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', zIndex: 10 }}
        >
            <motion.div key={seconds} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} style={{ fontSize: '140px', fontWeight: '200', color: textMain, fontFamily: 'Segoe UI Light' }}>{seconds}</motion.div>
            <div style={{ marginTop: '20px', fontSize: '16px', color: textSub, letterSpacing: '1px' }}>{langIndex === 0 ? 'ПРИГОТОВЬТЕСЬ...' : 'GET READY...'}</div>
        </motion.div>
      )}

      {/* === 3. ACTIVE TIMER === */}
      {!isFinished && isStart && (
        <motion.div 
            key="active"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%', zIndex: 10, position: 'relative' }}
        >
            <div style={{ position: 'absolute', top: '10%', textAlign: 'center', width: '85%', color: textMain, opacity: 0.8, fontSize: '16px', lineHeight: '1.4' }}>{protocol?.instructions?.[langIndex]}</div>
            
            <div style={{ position: 'relative', width: '340px', height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <motion.div animate={phaseType === 'hot' ? { scale: [1, 1.1, 1], opacity: 0.8 } : phaseType === 'cold' ? { x: [-2, 2, -2], rotate: [0, 1, -1, 0] } : { scale: 1 }} transition={phaseType === 'hot' ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.1, repeat: Infinity }} style={{ width: '220px', height: '220px', borderRadius: '50%', background: `radial-gradient(circle at 30% 30%, ${phaseColor} 0%, ${secondaryColor} 100%)`, position: 'absolute', boxShadow: `0 0 60px ${phaseColor}60` }} />
                <svg width="320" height="320" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}><circle cx="160" cy="160" r="140" fill="none" stroke={Colors.get('border', theme)} strokeWidth="2" opacity="0.2" /><circle cx="160" cy="160" r="140" fill="none" stroke={phaseColor} strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 140}`} strokeDashoffset={`${2 * Math.PI * 140 * (1 - phaseProgress)}`} style={{ transition: 'stroke-dashoffset 0.1s linear', filter: `drop-shadow(0 0 10px ${phaseColor})` }} /></svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 5 }}>
                    <div style={{ fontSize: '72px', fontWeight: '200', color: '#fff', fontFamily: 'Segoe UI Light', fontVariantNumeric: 'tabular-nums', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>{displayTime}</div>
                    <motion.div key={phaseType} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '18px', color: '#fff', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }}>{phaseName}</motion.div>
                </div>
            </div>
            
            <div style={{ marginTop: '50px', fontSize: '14px', color: textSub, letterSpacing: '1px' }}>{langIndex === 0 ? 'Цикл' : 'Cycle'} {cycleInfo()}</div>
            
            <div style={{ position: 'absolute', bottom: '50px', display: 'flex', gap: '30px', alignItems: 'center' }}>
                <CircleButton onClick={() => setAudioEnabled(!audioEnabled)} icon={audioEnabled ? <IoVolumeHigh size={20}/> : <IoVolumeMute size={20}/>} theme={theme} size={50} />
                <CircleButton onClick={isRunning ? handlePause : handleResume} icon={isRunning ? <IoPause size={30}/> : <IoPlay size={30} style={{marginLeft:'4px'}}/>} theme={theme} size={80} accent={phaseColor} />
                <CircleButton onClick={handlePause} icon={<IoClose size={24}/>} theme={theme} size={50} />
            </div>

            <AnimatePresence>
                {isPaused && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(15px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '30px', zIndex: 20 }}>
                        <div style={{ fontSize: '24px', fontWeight: '300', color: '#fff', letterSpacing: '1px' }}>{langIndex === 0 ? 'ПАУЗА' : 'PAUSED'}</div>
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

      {/* === 4. FINISH === */}
      {isFinished && (
        <motion.div 
            key="finish"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '40px', zIndex: 10 }}
        >
            <div style={{ position: 'relative' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} style={{ width: '150px', height: '150px', borderRadius: '50%', border: `1px dashed ${accent}`, position: 'absolute', top: -15, left: -15 }} />
                <img src="images/Congrat.png" style={{ width: '120px', height: '120px', borderRadius: '50%' }} alt="Done" />
            </div>
            <div style={{ textAlign: 'center' }}>
                <h2 style={{ fontSize: '32px', color: textMain, margin: '0 0 10px 0', fontWeight: '300' }}>{langIndex === 0 ? 'Закалка завершена' : 'Session Complete'}</h2>
                <p style={{ width: '80%', color: textSub, fontSize: '16px', lineHeight: '1.6', margin: '0 auto' }}>{finishMessage}</p>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={() => { setIsFinished(false); setShow(false); }} style={{ padding: '15px 50px', borderRadius: '30px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: textMain, fontSize: '16px', fontWeight: '500' }}>{langIndex === 0 ? 'В меню' : 'Done'}</motion.button>
        </motion.div>
      )}

      </AnimatePresence>
    </div>
  );
};

export default HardeningTimer;

const CircleButton = ({ onClick, icon, theme, size = 45, accent }) => (
    <motion.button 
        whileTap={{ scale: 0.9 }} onClick={onClick}
        style={{ width: size, height: size, borderRadius: '50%', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: accent || (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), color: accent ? '#fff' : Colors.get('mainText', theme), boxShadow: accent ? `0 8px 25px ${accent}60` : 'none' }}
    >
        {icon}
    </motion.button>
);

const ControlButton = ({ onClick, icon, label, theme, type = 'secondary', accent, size = 55 }) => {
    const isPrimary = type === 'primary';
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <motion.button whileTap={{ scale: 0.92 }} onClick={onClick} style={{ width: size, height: size, borderRadius: '50%', border: 'none', outline: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: isPrimary ? (accent || '#BF5AF2') : (theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'), color: isPrimary ? '#fff' : Colors.get('mainText', theme), boxShadow: isPrimary ? `0 8px 30px ${accent || '#BF5AF2'}50` : 'none', backdropFilter: 'blur(5px)' }}>
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

const setActualLevel = (categoryIndex, protocolIndex, isCustom) => {
  if(isCustom) return 0;
  let ind = -1;
  const protocol = AppData.recoveryProtocols[2][categoryIndex][protocolIndex]; 
  for(let i = 0; i < protocol.length; i++) {
     if(!protocol[i]) {
       ind = i;
       break;
     }
  }
  return ind > -1 ? ind : protocol.length - 1;
}

const isLevelDone = (categoryIndex, protocolIndex, levelIndex, isCustom) => {
  if(isCustom) return false;
  const protocol = AppData.recoveryProtocols[2][categoryIndex][protocolIndex];
  return protocol[levelIndex];
}

const disclaimer = (langIndex) => {
  if (langIndex === 0) return "Внимание: Закаливание требует осторожности. Если вам стало плохо, немедленно прекратите и согрейтесь.";
  return "Notice: Cold exposure requires caution. If you feel unwell, stop immediately and warm up.";
};

const congratulations = (langIndex) => {
  const messages = {
    ru: [ 'Сила духа.', 'Энергия холода.', 'Иммунитет укреплен.', 'Ты справился!' ],
    en: [ 'Mental strength.', 'Cold energy.', 'Immunity boosted.', 'You did it!' ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};