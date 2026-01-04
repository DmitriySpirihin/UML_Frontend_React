import { useEffect, useState,useRef,useMemo } from 'react'
import {AppData} from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import {theme$,lang$,fontSize$, recoveryType$} from '../../StaticClasses/HabitsBus';
import {IoPlayCircle,IoCheckmarkCircle,IoArrowBackCircle, IoPauseCircle} from "react-icons/io5"
import {IoMdVolumeMute, IoMdVolumeHigh} from "react-icons/io"
import {FaCaretLeft,FaCaretRight} from "react-icons/fa"
import BreathAudio from "../../Helpers/BreathAudio"
import { markSessionAsDone,saveBreathingSession } from '../../StaticClasses/RecoveryLogHelper';

const startTimerDuration = 5000;

const BreathingTimer = ({ show,setShow,protocol,protocolIndex,categoryIndex,isCustom = false }) => {
  
  const [level,setLevel] = useState(setActualLevel(protocolIndex,categoryIndex,isCustom));
  const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]); 
  const [audioEnabled, setAudioEnabled] = useState(false);
  const { initAudio, playInhale, playExhale, playHold, playRest } = BreathAudio(audioEnabled);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false); // Has user clicked Start?
  const [showStartTimer, setShowStartTimer] = useState(false);
  
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [renderScale, setRenderScale] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  const currentVisualScaleRef = useRef(1);
  const phaseStartScaleRef = useRef(1);
  const animationRef = useRef();
  const startTimeRef = useRef(0);
  const lastScaleRef = useRef(1); // For smooth transitions
  
  //session data
   const [startTime, setStartTime] = useState(0);
   const [endTime,setEndTime] = useState(0);
   const maxHoldRef = useRef(0);

  // Subscriptions
  useEffect(() => {
            const subscription = theme$.subscribe(setthemeState); 
            const subscription2 = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
            }); 
            const subscription3 = fontSize$.subscribe((fontSize) => {
            setFSize(fontSize);
            });
            return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
            }
      }, []);
//startTimer
 useEffect(() => {
    if (!showStartTimer) {
      // Reset seconds if hidden (optional)
      setSeconds(0);
      return;
    }

    // Initialize countdown
    const totalSeconds = Math.ceil(startTimerDuration / 1000);
    setSeconds(totalSeconds);

    const intervalId = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          // Final tick: cleanup and trigger start
          clearInterval(intervalId);
          handleStart();
          setShowStartTimer(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup on unmount or when showStartTimer becomes false
    return () => {
      clearInterval(intervalId);
    };
  }, [showStartTimer, startTimerDuration]);
//steps
  useEffect(() => {
  if (currentStepIndex === 0) {
    phaseStartScaleRef.current = 1.0;
  } else {
    // Continue from where we left off
    phaseStartScaleRef.current = currentVisualScaleRef.current;
  }
  setPhaseProgress(0);
  startTimeRef.current = 0;
}, [currentStepIndex]);
  // Flatten steps
  const effectiveLevelData = useMemo(() => {
  if (!protocol || !protocol.levels || protocol.levels.length === 0) {
    // Fallback
    return {
      cycles: 1,
      steps: [{ in: 4000 }, { hold: 4000 }, { out: 4000 }, { hold: 4000 }]
    };
  }
  if (isCustom) {
    return protocol.levels[0]; // Custom always uses level 0
  }
  return protocol.levels[level] || protocol.levels[0];
}, [protocol, level, isCustom]);


// Then replace all `session` usage with `effectiveLevelData`
const allSteps = useMemo(() => {
  const steps = [];
  for (let cycle = 0; cycle < effectiveLevelData.cycles; cycle++) {
    effectiveLevelData.steps.forEach(step => steps.push({ ...step, cycle }));
  }
  return steps;
}, [effectiveLevelData]);

  const currentStep = allSteps[currentStepIndex] || null;

  // Determine phase type and color
  const getPhaseInfo = (step) => {
    if (!step) return { name: '', color: '#94a3b8' };
    if (step.in !== undefined) return { name: langIndex === 0 ? 'Вдох' : 'Inhale', color: Colors.get('in', theme) };
    if (step.out !== undefined) return { name: langIndex === 0 ? 'Выдох' : 'Exhale', color: Colors.get('out', theme) };
    if (step.hold !== undefined) return { name: langIndex === 0 ? 'Задержка' : 'Hold', color: Colors.get('hold', theme) };
    if (step.rest !== undefined) return { name: langIndex === 0 ? 'Отдых' : 'Rest', color: Colors.get('rest', theme) };
    return { name: 'Rest', color: '#94a3b8' };
  };

  const { name: phaseName, color: phaseColor } = getPhaseInfo(currentStep);
  const duration = currentStep
    ? currentStep.in ?? currentStep.out ?? currentStep.hold ?? currentStep.rest 
    : 1000;

  // Compute target scale for current phase
  const getTargetScale = (step, progress, prevStep) => {
    if (!step) return 1;

    // Inhale: 1.0 → 1.3
    if (step.in !== undefined) {
      return 1 + 0.3 * progress;
    }
    // Exhale: 1.0 → 0.7
    if (step.out !== undefined) {
      return 1 - 0.3 * progress;
    }
    // Hold: maintain size of previous phase
    if (step.hold !== undefined) {
      if (prevStep && prevStep.in !== undefined) {
        // Hold after inhale → stay at max (1.3)
        return 1.3;
      } else if (prevStep && prevStep.out !== undefined) {
        // Hold after exhale → stay at min (0.7)
        return 0.7;
      }
      // Fallback (shouldn't happen in valid sequences)
      return lastScaleRef.current;
    }
    return 1;
  };

  // Get previous step for hold context
  const prevStep = allSteps[currentStepIndex - 1] || null;
  const targetScale = getTargetScale(currentStep, phaseProgress, prevStep);

  // Smoothly interpolate from last scale to target (for visual continuity)
  // But for simplicity and performance, we'll just use targetScale directly
  // since phases are sequential and we control transitions.
  const scale = targetScale;
  lastScaleRef.current = scale;

  // Cycle info
  const cycleInfo = () => {
    if (!effectiveLevelData.steps) return '0 / 0';
    return isStart
      ? `${Math.floor(currentStepIndex / effectiveLevelData.steps.length) + 1} / ${effectiveLevelData.cycles}`
      : '0';
  };

  // Timer display
  const timeRemaining = duration * (1 - phaseProgress);
  const displayTime = (timeRemaining / 1000).toFixed(1);

 // Animation loop
useEffect(() => {
  if (!isRunning || !currentStep) return;

  const animate = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    setPhaseProgress(progress);

    // --- Compute scale based on phase ---
    let currentScale;

    if (currentStep.in !== undefined) {
      // Inhale: from startScale → 1.5
      const startScale = phaseStartScaleRef.current;
      currentScale = startScale + (1.5 - startScale) * progress;
    } else if (currentStep.out !== undefined) {
      // Exhale: from startScale → 1.0
      const startScale = phaseStartScaleRef.current;
      currentScale = startScale + (1.1 - startScale) * progress;
    } else if (currentStep.hold !== undefined) {
      // Hold: stay at startScale, but add gentle pulse
      const baseScale = phaseStartScaleRef.current;
      const pulseAmplitude = 0.02;
      const pulseFrequency = 0.6; // 2 pulses per second
      const pulse = pulseAmplitude * Math.sin(2 * Math.PI * pulseFrequency * (elapsed / 1000));
      currentScale = baseScale + pulse;
    }  else if (currentStep.rest !== undefined) {
      // Rest: stay neutral (e.g. scale = 1.0) with optional subtle pulse
      const baseScale = 1.0;
      const pulse = 0.02 * Math.sin(progress * 2 * Math.PI); // gentle
      currentScale = baseScale + pulse;
    }
    else {
      currentScale = 1.1;
    }

    // Update scale for rendering
    currentVisualScaleRef.current = currentScale;
    setRenderScale(currentScale);

    // Phase completed?
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

  return () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
}, [currentStepIndex, isRunning, duration, allSteps.length]);
// sounds
useEffect(() => {
    if (!isRunning || !currentStep) return;

    // Play sound only at the START of the phase (progress = 0)
    if (phaseProgress < 0.01) {
      if (currentStep.in !== undefined) {
        playInhale();
      } else if (currentStep.out !== undefined) {
        playExhale();
      } else if (currentStep.hold !== undefined) {
        playHold();
      } else if (currentStep.rest !== undefined) {
        playRest();
      }
      if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  }, [currentStepIndex, isRunning, phaseProgress, audioEnabled]);
  // Reset on session change OR reload
  const resetSession = () => {
    setCurrentStepIndex(0);
    setPhaseProgress(0);
    setIsRunning(false);
    setIsStart(false);
    setIsPaused(false);
    startTimeRef.current = 0;
    lastScaleRef.current = 1;
    maxHoldRef.current = 0;
  };

  useEffect(() => {
    currentVisualScaleRef.current = 1;
   phaseStartScaleRef.current = 1;
   setRenderScale(1);
    resetSession();
  }, [effectiveLevelData]);


  // Control handlers
  const handleStart = () => {
  // Use effectiveLevelData instead of session
  let maxHoldValue = 0;
  for (const step of effectiveLevelData.steps) {
    if (step.hold !== undefined && step.hold > maxHoldValue) {
      maxHoldValue = step.hold;
    }
  }
  maxHoldRef.current = maxHoldValue;
  initAudio();
  setStartTime(Date.now());
  setAudioEnabled(true);
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
  const onFinishSession = async() => {
      if(!isCustom){saveResult();
      await saveBreathingSession(startTime, Date.now(),maxHoldRef.current);}
      setFinishMessage(congratulations(langIndex));
      setIsFinished(true);
    };
  
    const saveResult = () => {
      markSessionAsDone(0, categoryIndex, protocolIndex, level);
    };
    const onSaveSession = async() => {
      await saveBreathingSession(startTime, endTime);
      resetSession();
    };
  return (
    <div style={styles(theme, show).container}>

      {!isFinished  && !isStart && !showStartTimer && <div  style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'90%',height:'80%'}}>
        <div style={{width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{protocol.name[langIndex]}</p>
        </div>
        <div style={{width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{langIndex === 0 ? 'Цель' : 'Goal'}</p>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '13px' : '15px'}}>{protocol.aim[langIndex]}</p>
        </div>
        <div style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{langIndex === 0 ? 'Уровень' : 'Level'}</div>
        <div style={{display:'flex',border:isLevelDone(categoryIndex,protocolIndex,level,isCustom) ? `2px solid ${Colors.get('maxValColor', theme)}` : 'none',flexDirection:'row',alignItems:'center',justifyContent:'space-around',width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
         <FaCaretLeft onClick={() => {setLevel(prev => prev - 1 > 0 ? prev - 1 : 0)}} style={{fontSize:'24px',color:Colors.get('icons', theme)}}/>
         <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{level + 1}</p>
         <FaCaretRight onClick={() => {setLevel(prev => prev + 1 < protocol.levels.length ? prev + 1 : protocol.levels.length - 1)}} style={{fontSize:'24px',color:Colors.get('icons', theme)}}/>
         
        </div>
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-around',width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
         <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{protocol.levels[level]?.strategy || ''}</p>
         <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '13px' : '15px'}}>{(langIndex === 0 ? 'циклов: ' : 'cycles: ') +  effectiveLevelData.cycles}</p>
        </div>
        <div style={{width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{langIndex === 0 ? 'Инструкция' : 'Instruction'}</p>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '13px' : '15px'}}>{protocol.instructions[langIndex]}</p>
        </div>
        <div style={{color:Colors.get('hold', theme),fontSize:fSize === 0 ? '10px' : '12px'}}>{disclaimer(langIndex)}</div>
      </div>}

      {!isFinished && showStartTimer && <div  style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'90%',height:'80%'}}>
      <div style={{ fontSize: '10rem',marginTop: '180px',color:Colors.get('icons', theme), fontWeight: 'bold', lineHeight: 1}}>
        {seconds}
      </div>
        <div style={{ fontSize: '2rem',marginBottom: '80px', textAlign: 'center'}}>
        <div style={{color:Colors.get('icons', theme),marginBottom: '80px'}}>{langIndex === 0 ? 'Приготовьтесь!':'Get ready!'}</div>
      </div>
    </div>}

      {!isFinished && isStart && <svg width="100%" height="80%" viewBox="0 0 800 800" style={{ maxWidth: '800px', maxHeight: '800px' }}>
        <circle cx="400" cy="400" r="380" fill="none" stroke={Colors.get('border', theme)} strokeWidth="2" />

        {/* Glow circle */}
        <circle cx="400" cy="400" r="200" fill={phaseColor} opacity="0.25" transform={`scale(${renderScale})`} transformOrigin="400 400"style={{ filter: 'blur(12px)' }}/>
        {/* Outline circle */}
        <circle cx="400" cy="400" r="200" fill="none" stroke={phaseColor} strokeWidth="4"opacity="0.9" transform={`scale(${renderScale})`} transformOrigin="400 400" />
        {/* Timer & Phase */}
        <text x="420" y="410" textAnchor="middle" fill={phaseColor} fontFamily="sans-serif">
        <tspan fontSize="150" fontWeight="bold">
         {Math.floor(displayTime)}
         </tspan>
        <tspan fontSize="50" fontWeight="bold" dx="8"> {/* dx = small horizontal offset */}
        .{Math.floor((displayTime - Math.floor(displayTime)) * 10)}
        </tspan>
        </text>
        <text x="400" y="530" textAnchor="middle" fill={phaseColor} fontSize="40" fontFamily="sans-serif" opacity="0.95">
          {phaseName}
        </text>

        {/* Cycle counter */}
        <text x="400" y="900" textAnchor="middle" fill={Colors.get('icons', theme)} fontSize="38" fontFamily="sans-serif">
          {(langIndex === 0 ? 'Цикл ' : 'Cycle ') + cycleInfo()}
        </text>
      </svg>}
      {isFinished && <div  style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'90%',height:'80%'}}>
        <div>
        <img src="images/Congrat.png" style={{ width: '150px', height: '150px' }} />
        <div style={{color:Colors.get('pause', theme),fontSize:'45px',fontWeight:'bold',fontFamily:'fantasy'}}>{langIndex === 0 ? 'Отлично!' : 'Great job!'}</div>
        </div>

         <div style={{width:'100%',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
        <p style={{color:Colors.get('mainText', theme),fontSize:fSize === 0 ? '15px' : '17px'}}>{finishMessage}</p>
        </div>
    </div>}

      {/* Controls */}
      <div style={styles(theme, show).controls}>
        {!isStart && !showStartTimer && 
          <div>
           <IoArrowBackCircle onClick={() => setShow(false)} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
          <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Выйти' : 'Exit'}</div>
          </div>
        }
        {isFinished  && <IoArrowBackCircle onClick={() => {setIsFinished(false); setShow(false)}} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>}
        {!isFinished && audioEnabled ? 
          <div>
          <IoMdVolumeHigh onClick={() => setAudioEnabled(false)} style={{fontSize:'60px',color:Colors.get('icons', theme)}} />
          <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Выкл звук' : 'Mute'}</div>
                      </div>
          :
         <div>
         <IoMdVolumeMute onClick={() => setAudioEnabled(true)} style={{fontSize:'60px',color:Colors.get('icons', theme)}} />  
         <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Вкл звук' : 'Unmute'}</div>
          </div>
         }
        {!isFinished &&!isStart && !showStartTimer && 
        <div>
        <IoPlayCircle onClick={() => {setShowStartTimer(true);}} style={{fontSize:'60px',color:Colors.get('play', theme)}} />
        <div style={{fontSize:'9px',color:Colors.get('subText',theme)}}>{langIndex === 0 ? 'Начать' : 'Start'}</div>
        </div>
        }

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
export default BreathingTimer

const styles = (theme,show) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'fixed',
     flexDirection: "column",
     alignItems: "center",
     height: "86vh",
     transform: show ? 'translateY(0)' : 'translateY(100%)',
     bottom: '0',
     transition: "transform 0.2s ease-in-out",
     width: "100vw",
     fontFamily: "Segoe UI",
     borderTop:`2px solid ${Colors.get('border', theme)}`,
     borderTopLeftRadius:'12px',
     borderTopRightRadius:'12px',
     zIndex:2000
  },
  controls: {
    display: 'flex',
    marginTop: '30px',
    gap: '50px',
  }
})

const disclaimer = (langIndex) => {
  // 0 = ru, 1 = en
  if (langIndex === 0) {
    return "Внимание: эти дыхательные упражнения предназначены только для общего улучшения самочувствия и не дают гарантированного эффекта. При наличии заболеваний сердца, лёгких, нарушений давления, при беременности или ухудшении самочувствия прекратите упражнения и при необходимости обратитесь к врачу."; 
  }

  return "Notice: These breathing exercises are intended only to support general well-being and do not guarantee any specific results. If you have heart or lung conditions, blood pressure issues, are pregnant, or feel unwell, stop the exercises and, if needed, seek advice from a healthcare professional."; 
};
const congratulations = (langIndex) => {
  const messages = {
    ru: [
      'Отличная дыхательная сессия! 🌬️',
      'Ты глубоко расслабился — молодец! 😌',
      'Спасибо за заботу о своём дыхании. 💙',
      'Ты дал себе момент покоя — это важно. 🕊️',
      'Твоё дыхание стало спокойнее. Прекрасно! 🌿',
      'Ты выполнил упражнение с осознанностью. Респект! 🙏',
      'Глубокое дыхание — шаг к гармонии. Ты справился! 🌸',
      'Поздравляю: ты только что поддержал своё здоровье дыханием. 💪🌱',
      'Ты вернулся в момент — через дыхание. Отлично! ⏳➡️✨',
      'Твоя нервная система благодарит тебя. 🧠❤️',
    ],
    en: [
      'Great breathing session! 🌬️',
      'You’ve deeply relaxed — well done! 😌',
      'Thank you for caring for your breath. 💙',
      'You gave yourself a moment of calm — that matters. 🕊️',
      'Your breath has calmed. Beautiful work! 🌿',
      'You practiced with mindfulness. Respect! 🙏',
      'Deep breathing is a step toward balance. You did it! 🌸',
      'Congratulations: you just supported your health with breath. 💪🌱',
      'You returned to the present — through your breath. Perfect! ⏳➡️✨',
      'Your nervous system thanks you. 🧠❤️',
    ],
  };

  const list = langIndex === 0 ? messages.ru : messages.en;
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
};

const setActualLevel = (categoryIndex,protocolIndex,isCustom) => {
  if(isCustom)return 0;
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
const isLevelDone = (categoryIndex,protocolIndex,levelIndex,isCustom) => {
  if(isCustom)return false;
    const protocol = AppData.recoveryProtocols[recoveryType$.value][categoryIndex][protocolIndex];
    return protocol[levelIndex];
}