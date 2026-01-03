import { useEffect, useState, useRef, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ ,recoveryType$} from '../../StaticClasses/HabitsBus';
import {
  IoPlayCircle,
  IoCheckmarkCircle,
  IoArrowBackCircle,
  IoPauseCircle,
} from 'react-icons/io5';
import { IoMdVolumeMute, IoMdVolumeHigh } from 'react-icons/io';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { markSessionAsDone , saveHardeningSession} from '../../StaticClasses/RecoveryLogHelper';

// Self-hosted sound (put in public/sounds/water.mp3)
const ColdBg = 'images/Cold.png';
const HotBg = 'images/Hot.png';

const startTimerDuration = 3000;

// === Utilities ===
const disclaimer = (langIndex) => {
  if (langIndex === 0) {
    return 'Внимание: процедуры с холодной водой предназначены для общего укрепления организма. Не выполняйте их при сердечно-сосудистых заболеваниях, беременности, лихорадке или чувстве недомогания. Проконсультируйтесь с врачом при сомнениях.';
  }
  return 'Notice: Cold water protocols are for general resilience. Do not perform them if you have cardiovascular conditions, are pregnant, feverish, or unwell. Consult a doctor if in doubt.';
};

const congratulations = (langIndex) => {
  const messages = {
    ru: [
      'Отличная закалка! ❄️',
      'Ты справился с холодом — молодец! 💪',
      'Холод — твой союзник. Продолжай! 🧊',
      'Ты укрепил свою нервную систему. Респект! 🧠',
      'Каждая секунда холода — вклад в здоровье. 💙',
    ],
    en: [
      'Great cold exposure! ❄️',
      'You mastered the cold — well done! 💪',
      'Cold is your ally. Keep going! 🧊',
      'You’ve strengthened your nervous system. Respect! 🧠',
      'Every cold second builds resilience. 💙',
    ],
  };
  const list = langIndex === 0 ? messages.ru : messages.en;
  return list[Math.floor(Math.random() * list.length)];
};

const HardeningTimer = ({ show, setShow, protocol, protocolIndex, categoryIndex }) => {
  const [session, setSession] = useState({
    cycles: 1,
    steps: [{ hotSeconds: 180, coldSeconds: 30, restSeconds: 0 }],
  });
  const [level, setLevel] = useState(setActualLevel(protocolIndex, categoryIndex));
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  const startTimeRef = useRef(0);
  const animationRef = useRef();

  //session data
   const [startTime, setStartTime] = useState(0);
   const [endTime,setEndTime] = useState(0);
   const coldTimeRef = useRef(0);

  // Subscriptions
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  // Start countdown
  useEffect(() => {
    if (!showStartTimer) {
      setSeconds(0);
      return;
    }
    const totalSeconds = Math.ceil(startTimerDuration / 1000);
    setSeconds(totalSeconds);
    const id = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          handleStart();
          setShowStartTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [showStartTimer]);

  // Flatten cold water steps
  const allSteps = useMemo(() => {
    if (!session.steps?.length) return [];
    const steps = [];
    for (let cycle = 0; cycle < session.cycles; cycle++) {
      if (session.steps[0].hotSeconds > 0) {
        steps.push({ type: 'hot', duration: session.steps[0].hotSeconds * 1000, cycle });
      }
      if (session.steps[0].coldSeconds > 0) {
        steps.push({ type: 'cold', duration: session.steps[0].coldSeconds * 1000, cycle });
      }
      if (session.steps[0].restSeconds > 0 && cycle < session.cycles - 1) {
        steps.push({ type: 'rest', duration: session.steps[0].restSeconds * 1000, cycle });
      }
    }
    return steps;
  }, [session]);

  const currentStep = allSteps[currentStepIndex] || null;

  const getPhaseInfo = (step) => {
    if (!step) return { name: '', color: '#94a3b8' };
    if (step.type === 'hot')
      return { name: langIndex === 0 ? 'Тёплая вода' : 'Warm Water', color: Colors.get('hot', theme) }; // or create 'hot' color
    if (step.type === 'cold')
      return { name: langIndex === 0 ? 'Холодная вода' : 'Cold Water', color: Colors.get('cold', theme) }; // icy blue
    if (step.type === 'rest')
      return { name: langIndex === 0 ? 'Отдых / Согрев' : 'Rest / Warm-up', color: Colors.get('rest', theme) };
    return { name: '', color: '#94a3b8' };
  };

  const { name: phaseName, color: phaseColor } = getPhaseInfo(currentStep);
  const duration = currentStep?.duration || 1000;

  const cycleInfo = () => {
    if (!session.steps) return '0 / 0';
    // Estimate steps per cycle (hot + cold + optional rest)
    const stepsPerCycle = (session.steps[0].hotSeconds > 0 ? 1 : 0) +
                         (session.steps[0].coldSeconds > 0 ? 1 : 0) +
                         (session.steps[0].restSeconds > 0 ? 1 : 0);
    const cycleNum = stepsPerCycle ? Math.floor(currentStepIndex / stepsPerCycle) + 1 : 1;
    return isStart ? `${cycleNum} / ${session.cycles}` : '0';
  };

  // mm:ss format
  const timeRemaining = duration * (1 - phaseProgress);
  const totalSeconds = Math.floor(timeRemaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const secondsLeft = totalSeconds % 60;
  const displayTime = `${minutes.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;

  // Animation loop
  useEffect(() => {
  if (!isRunning || !currentStep) return;

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    setPhaseProgress(progress);

    if (progress >= 1) {
      // Step just finished — check if it was "cold"
      if (currentStep.type === 'cold') {
        coldTimeRef.current += currentStep.duration; // accumulate cold time
        // Optional: update state if you want to display it live
        // setTimeInColdWater(coldTimeRef.current);
      }

      const next = currentStepIndex + 1;
      if (next >= allSteps.length) {
        setIsRunning(false);
        setEndTime(Date.now());
        setTimeInColdWater(coldTimeRef.current); // finalize for saving
        onFinishSession();
        return;
      }
      setCurrentStepIndex(next);
      startTimeRef.current = 0;
    } else {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  animationRef.current = requestAnimationFrame(animate);
  return () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
}, [currentStepIndex, isRunning, duration, allSteps.length, currentStep]);

  const resetSession = () => {
    setCurrentStepIndex(0);
    setPhaseProgress(0);
    setIsRunning(false);
    setIsStart(false);
    setIsPaused(false);
    setIsFinished(false);
    coldTimeRef.current = 0;
    startTimeRef.current = 0;
  };

  useEffect(() => {
    resetSession();
  }, [session]);

  const handleStart = () => {
    setAudioEnabled(true);
    setStartTime(Date.now());
    setIsStart(true);
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setEndTime(Date.now());
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReload = () => {
    resetSession();
  };

  const onFinishSession = () => {
    saveResult();
    setFinishMessage(congratulations(langIndex));
    setIsFinished(true);
  };

  const saveResult = () => {
    setEndTime(Date.now());
    onSaveSession();
    markSessionAsDone(2, categoryIndex, protocolIndex, level);
  };
  const onSaveSession = async() => {
    await saveHardeningSession(startTime, endTime,coldTimeRef.current);
    resetSession();
  };

  return (
    <div style={styles(theme, show).container}>
      <div style={styles(theme, show,isStart && currentStep.type !== 'rest', currentStep.type === 'cold').decorLayer} />
      {/* Pre-session info */}
      {!isFinished && !isStart && !showStartTimer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '90%', height: '80%' }}>
          <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{protocol.name[langIndex]}</p>
          </div>
          <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{langIndex === 0 ? 'Цель' : 'Goal'}</p>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '13px' : '15px' }}>{protocol.aim[langIndex]}</p>
          </div>
          <div style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{langIndex === 0 ? 'Уровень' : 'Level'}</div>
          <div
            style={{
              display: 'flex',
              border: isLevelDone(categoryIndex, protocolIndex, level) ? `2px solid ${Colors.get('maxValColor', theme)}` : 'none',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
            }}
          >
            <FaCaretLeft
              onClick={() => setLevel((prev) => (prev > 0 ? prev - 1 : 0))}
              style={{ fontSize: '24px', color: Colors.get('icons', theme) }}
            />
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{level + 1}</p>
            <FaCaretRight
              onClick={() => setLevel((prev) => (prev < protocol.levels.length - 1 ? prev + 1 : protocol.levels.length - 1))}
              style={{ fontSize: '24px', color: Colors.get('icons', theme) }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{protocol.levels[level].strategy}</p>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '13px' : '15px' }}>{(langIndex === 0 ? 'циклов: ' : 'cycles: ') + protocol.levels[level].cycles}</p>
          </div>
          <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{langIndex === 0 ? 'Инструкция' : 'Instruction'}</p>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '13px' : '15px' }}>{protocol.instructions[langIndex]}</p>
          </div>
          <div style={{ color: Colors.get('hold', theme), fontSize: fSize === 0 ? '10px' : '12px' }}>{disclaimer(langIndex)}</div>
        </div>
      )}

      {/* Countdown */}
      {!isFinished && showStartTimer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '90%', height: '80%' }}>
          <div style={{ fontSize: '10rem', marginTop: '180px', color: Colors.get('icons', theme), fontWeight: 'bold', lineHeight: 1 }}>{seconds}</div>
          <div style={{ fontSize: '2rem', marginBottom: '80px', textAlign: 'center' }}>
            <div style={{ color: Colors.get('icons', theme), marginBottom: '80px' }}>{langIndex === 0 ? 'Приготовьтесь!' : 'Get ready!'}</div>
          </div>
        </div>
      )}

      {/* Cold Water Timer UI */}
      {!isFinished && isStart && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', width: '100%' }}>
          <svg width="400" height="400" viewBox="0 0 100 100">
            {/* Subtle fill */}
            <circle cx="50" cy="50" r="45" fill={phaseColor} opacity="0.1" />

            {/* Outer ring */}
            <circle cx="50" cy="50" r="45" fill="none" stroke={Colors.get('border', theme)} strokeWidth="1" opacity="0.4" />

            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={phaseColor}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - phaseProgress)}`}
              strokeLinecap="round"
            />

            {/* Strategy text - full, centered, auto-sized */}
                        <foreignObject x="15" y="15" width="70" height="40">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '70px',
                  height: '40px',
                  fontSize: '3.5px',
                  fontWeight: '500',
                  fontFamily: 'sans-serif',
                  color: Colors.get('mainText', theme),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  overflow: 'hidden',
                  lineHeight: 1.3,
                }}
              >
                {protocol?.instructions?.[langIndex] || ''}
              </div>
            </foreignObject>
            
                        {/* Timer - large, bold, mm:ss */}
                        <text x="50" y="60" textAnchor="middle" fill={phaseColor} fontFamily="sans-serif" fontSize="16" fontWeight="bold">
                          {displayTime}
                        </text>
            
                        {/* Phase name */}
                        <text x="50" y="80" textAnchor="middle" fill={phaseColor} fontFamily="sans-serif" fontSize="5">
                          {phaseName}
                        </text>
          </svg>

          {/* Cycle counter */}
          <div style={{
            marginTop: '20px',
            fontSize: fSize === 0 ? '14px' : '16px',
            color: Colors.get('icons', theme),
            fontFamily: 'sans-serif'
          }}>
            {(langIndex === 0 ? 'Цикл ' : 'Cycle ') + cycleInfo()}
          </div>
        </div>
      )}

      {/* Completion */}
      {isFinished && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '90%', height: '80%' }}>
          <div>
            <img src="images/Congrat.png" style={{ width: '150px', height: '150px' }} />
            <div style={{ color: Colors.get('pause', theme), fontSize: '45px', fontWeight: 'bold', fontFamily: 'fantasy' }}>
              {langIndex === 0 ? 'Отлично!' : 'Great job!'}
            </div>
          </div>
          <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{finishMessage}</p>
          </div>
        </div>
      )}

      {/* Controls */}
            <div style={styles(theme, show).controls}>
              {(!isStart || isFinished) && (
                <div>
                <IoArrowBackCircle
                  onClick={() => {
                    if (isFinished) {
                      setIsFinished(false);
                    }
                    setShow(false);
                  }}
                  style={{ fontSize: '60px', color: Colors.get('close', theme) }}
                />
                <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Выйти' : 'Exit'}</div>
              </div>
              )}
              {isStart && !isFinished && (
                audioEnabled ? (
                  <div>
                  <IoMdVolumeHigh onClick={() => setAudioEnabled(false)} style={{ fontSize: '60px', color: Colors.get('icons', theme) }} />
                  <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Выкл звук' : 'Mute'}</div>
                  </div>
                ) : (
                  <div>
                  <IoMdVolumeMute onClick={() => setAudioEnabled(true)} style={{ fontSize: '60px', color: Colors.get('icons', theme) }} />
                  <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Вкл звук' : 'Unmute'}</div>
                  </div>
                )
              )}
              {!isStart && !showStartTimer && !isFinished && (
                <div>
                <IoPlayCircle
                  onClick={() => {
                    setSession(protocol.levels[level]);
                    setShowStartTimer(true);
                  }}
                  style={{ fontSize: '60px', color: Colors.get('play', theme) }}
                />
                <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Начать' : 'Start'}</div>
              </div>
              )}
              {!isFinished && isPaused &&
              
              <div>
              <IoArrowBackCircle onClick={handleReload} style={{ fontSize: '60px', color: Colors.get('close', theme) }} />
              <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Выйти' : 'Exit'}</div>
              </div>    
              }
              {isRunning && !isFinished &&
              <div>
              <IoPauseCircle onClick={handlePause} style={{ fontSize: '60px', color: Colors.get('pause', theme) }} />
              <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Пауза' : 'Pause'}</div>
              </div>
              }
              {!isFinished && !showStartTimer && isPaused && 
              <div>
              <IoPlayCircle onClick={handleResume} style={{ fontSize: '60px', color: Colors.get('play', theme) }} />
              <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Продолжить' : 'Resume'}</div>
              </div>
              }
              {!isFinished && !showStartTimer && isPaused && 
              <div>
               <IoCheckmarkCircle onClick={onSaveSession} style={{ fontSize: '60px', color: Colors.get('reload', theme) }} />
               <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Сохранить & выйти' : 'Save & exit'}</div>
              </div>
              }
              
            </div>
    </div>
  );
};

export default HardeningTimer;

const styles = (theme, show,isStart,isCold) => ({
    container: {
      backgroundColor: Colors.get('background', theme),
      position: 'fixed',
      height: '86vh',
      transform: show ? 'translateY(0)' : 'translateY(100%)',
      bottom: '0',
      transition: 'transform 0.2s ease-in-out',
      width: '100vw',
      fontFamily: 'Segoe UI',
      borderTop: `2px solid ${Colors.get('border', theme)}`,
      borderTopLeftRadius: '12px',
      borderTopRightRadius: '12px',
      zIndex: 2000,
      overflow: 'hidden', 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
  
    decorLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      opacity: 0.25,
      backgroundImage: isStart ? `url(${isCold ? ColdBg : HotBg})` : 'none',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 120%)',
      maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 120%)',
      pointerEvents: 'none',
    },
  controls: {
    display: 'flex',
    marginTop: '30px',
    gap: '50px',
  },
});

const setActualLevel = (categoryIndex,protocolIndex) => {
    let ind = -1;
    const protocol = AppData.recoveryProtocols[recoveryType$.value][categoryIndex][protocolIndex];
     for(let i = 0; i < protocol.length; i++) {
        if(!protocol[i]) {
          ind = i;
          break;
        }
     }
     return ind > -1 ? ind : protocol.length - 1;
}
const isLevelDone = (categoryIndex,protocolIndex,levelIndex) => {
    const protocol = AppData.recoveryProtocols[recoveryType$.value][categoryIndex][protocolIndex];
    return protocol[levelIndex];
}