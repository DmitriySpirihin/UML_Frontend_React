import { useEffect, useState, useRef, useMemo } from 'react'
import { AppData } from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { IoPlay, IoClose, IoPause, IoVolumeMute, IoVolumeHigh, IoCheckmark } from "react-icons/io5"
import { FaChevronLeft, FaChevronRight, FaInfoCircle, FaBullseye } from "react-icons/fa"
import BreathAudio from "../../Helpers/BreathAudio"
import { markSessionAsDone, saveBreathingSession } from '../../StaticClasses/RecoveryLogHelper';
import { motion, AnimatePresence } from 'framer-motion';

// Фоновый эмбиент
const AMBIENT_SOUND_URL = 'Audio/Ambient.wav';
const ambientAudio = new Audio(AMBIENT_SOUND_URL);
ambientAudio.loop = true;
ambientAudio.volume = 0.4;

const startTimerDuration = 3000;

const BreathingTimer = ({ show, setShow, protocol, protocolIndex, categoryIndex, isCustom = false }) => {
  
  // --- STATE ---
  const [level, setLevel] = useState(setActualLevel(categoryIndex, protocolIndex, isCustom));
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

  useEffect(() => {
    setLevel(isCustom ? 0 : setActualLevel(categoryIndex, protocolIndex, isCustom));
  }, [protocol, protocolIndex, categoryIndex, isCustom]);

  // --- START TIMER LOGIC ---
  useEffect(() => {
    if (!showStartTimer) { setSeconds(0); return; }
    const totalSeconds = Math.ceil(startTimerDuration / 1000);
    setSeconds(totalSeconds);
    const intervalId = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          handleStart();
          setShowStartTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, [showStartTimer]);

  // --- PROTOCOL PARSING ---
  useEffect(() => {
    if (currentStepIndex === 0) phaseStartScaleRef.current = 1.0;
    else phaseStartScaleRef.current = currentVisualScaleRef.current;
    setPhaseProgress(0);
    startTimeRef.current = 0;
  }, [currentStepIndex]);

  const effectiveLevelData = useMemo(() => {
    if (!protocol?.levels?.length) return { cycles: 1, steps: [{ in: 4000 }, { out: 4000 }] };
    return isCustom ? protocol.levels[0] : protocol.levels[level] || protocol.levels[0];
  }, [protocol, level, isCustom]);

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
    if (!effectiveLevelData.steps) return '0 / 0';
    return isStart
      ? `${Math.floor(currentStepIndex / effectiveLevelData.steps.length) + 1} / ${effectiveLevelData.cycles}`
      : '0';
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
        const nextIndex = currentStepIndex + 1;
        if (nextIndex >= allSteps.length) {
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
      if(!isCustom){ markSessionAsDone(0, categoryIndex, protocolIndex, level); }
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

      {/* PARTICLES */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
          {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i}
                animate={{ y: [0, -100, 0], x: [0, Math.random() * 50 - 25, 0], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
                style={{ 
                    position: 'absolute', top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                    width: `${Math.random() * 4 + 2}px`, height: `${Math.random() * 4 + 2}px`,
                    background: '#fff', borderRadius: '50%', filter: 'blur(1px)'
                }}
              />
          ))}
      </div>

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
                    {protocol.name[langIndex]}
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
                            {protocol.aim[langIndex]}
                        </div>
                    </div>

                    {/* Level */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '11px', color: textSub, fontWeight: 'bold', textTransform: 'uppercase' }}>{langIndex === 0 ? 'Уровень' : 'Level'}</span>
                            <span style={{ fontSize: '11px', color: Colors.get('in', theme), fontWeight: 'bold' }}>
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

                    {/* Scheme Grid */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', color: textSub, marginBottom: '2px', textTransform: 'uppercase' }}>{langIndex === 0 ? 'СХЕМА' : 'RATIO'}</div>
                            <div style={{ color: textMain, fontWeight: '600', fontSize: '12px' }}>{effectiveLevelData.strategy || 'Custom'}</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '9px', color: textSub, marginBottom: '2px', textTransform: 'uppercase' }}>{langIndex === 0 ? 'ЦИКЛЫ' : 'CYCLES'}</div>
                            <div style={{ color: textMain, fontWeight: '600', fontSize: '14px' }}>{effectiveLevelData.cycles}</div>
                        </div>
                    </div>

                    {/* Instruction */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '15px', padding: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: textSub, marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            <FaInfoCircle /> {langIndex === 0 ? 'Инструкция' : 'Instruction'}
                        </div>
                        <div style={{ fontSize: '13px', color: textMain, lineHeight: '1.4' }}>
                            {protocol.instructions[langIndex]}
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
                    onClick={() => setShowStartTimer(true)}
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
            <motion.div 
                key={seconds}
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }}
                style={{ fontSize: '140px', fontWeight: '200', color: textMain, fontFamily: 'Segoe UI Light' }}
            >
                {seconds}
            </motion.div>
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
                <img src="images/Congrat.png" style={{ width: '120px', height: '120px', borderRadius: '50%' }} alt="Done" />
            </div>
            <div style={{ textAlign: 'center' }}>
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

const setActualLevel = (categoryIndex, protocolIndex, isCustom) => {
  if(isCustom) return 0;
  let ind = -1;
  const protocol = AppData.recoveryProtocols[0][categoryIndex][protocolIndex];
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
  const protocol = AppData.recoveryProtocols[0][categoryIndex][protocolIndex];
  return protocol[levelIndex];
}