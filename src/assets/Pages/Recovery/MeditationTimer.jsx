import { useEffect, useState, useRef, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors , {THEME} from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, recoveryType$ } from '../../StaticClasses/HabitsBus';
import { IoPlayCircle, IoCheckmarkCircle, IoArrowBackCircle, IoPauseCircle} from 'react-icons/io5';
import { IoMdVolumeMute, IoMdVolumeHigh } from 'react-icons/io';
import { FaCaretLeft, FaCaretRight } from 'react-icons/fa';
import { markSessionAsDone,saveMeditationSession } from '../../StaticClasses/RecoveryLogHelper';


const LightBg = 'images/Meditation_Light.png';
const DarkBg = 'images/Meditation_Dark.png';

// === FREE AMBIENT SOUND (CC0) ===
const AMBIENT_SOUND_URL = 'Audio/Ambient.wav';
const audio = new Audio(AMBIENT_SOUND_URL); // ← self-hosted
audio.loop = true;
audio.volume = 0.3;

const startTimerDuration = 3000; // 3 seconds

const MeditationTimer = ({ show, setShow, protocol, protocolIndex, categoryIndex, isCustom = false }) => {
  // UI & preferences
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Timer control
  const [level, setLevel] = useState(() => setActualLevel(protocolIndex, categoryIndex, isCustom));
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0); // ms elapsed in current step
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');

  // Session timing
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);

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

  // Sync level when protocol changes
  useEffect(() => {
    setLevel(isCustom ? 0 : setActualLevel(protocolIndex, categoryIndex, false));
  }, [protocol, protocolIndex, categoryIndex, isCustom]);

  // ✅ Derive session from props — always up to date
  const session = useMemo(() => {
    if (!protocol?.levels?.length) {
      return { cycles: 1, steps: [{ meditateSeconds: 300, restSeconds: 0 }] };
    }
    return isCustom
      ? protocol.levels[0]
      : protocol.levels[level] || protocol.levels[0];
  }, [protocol, level, isCustom]);

  // Flatten into linear steps: [meditate, (rest), meditate, (rest), ...]
  const allSteps = useMemo(() => {
    const { cycles, steps } = session;
    if (!steps?.length) return [{ type: 'meditate', duration: 300000, cycle: 0 }]; // 5-min fallback

    const { meditateSeconds, restSeconds } = steps[0];
    const result = [];
    for (let cycle = 0; cycle < cycles; cycle++) {
      result.push({ type: 'meditate', duration: meditateSeconds * 1000, cycle });
      if (restSeconds > 0 && cycle < cycles - 1) {
        result.push({ type: 'rest', duration: restSeconds * 1000, cycle });
      }
    }
    return result.length > 0 ? result : [{ type: 'meditate', duration: 300000, cycle: 0 }];
  }, [session]);

  const currentStep = allSteps[currentStepIndex] || null;
  const duration = currentStep?.duration || 1000;

  // Reset on session change
  useEffect(() => {
    setCurrentStepIndex(0);
    setElapsed(0);
    setIsRunning(false);
    setIsStart(false);
    setIsPaused(false);
    setIsFinished(false);
  }, [session]);

  // Timer interval
  useEffect(() => {
    if (!isRunning || !currentStep) return;

    const interval = setInterval(() => {
      setElapsed((e) => {
        const next = e + 100;
        if (next >= duration) {
          const nextIndex = currentStepIndex + 1;
          if (nextIndex >= allSteps.length) {
            setIsRunning(false);
            onFinishSession();
          } else {
            setCurrentStepIndex(nextIndex);
            return 0;
          }
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, currentStepIndex, duration, allSteps.length]);

  // Audio control
  useEffect(() => {
    if (audioEnabled && isRunning && audio.paused) {
      audio.play().catch(() => {});
    } else if (!isRunning || !audioEnabled) {
      audio.pause();
    }
  }, [isRunning, audioEnabled]);

  // Countdown timer
  const [seconds, setSeconds] = useState(0);
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

  // Phase info
  const getPhaseInfo = (step) => {
    if (!step) return { name: '', color: '#94a3b8' };
    if (step.type === 'meditate')
      return { name: langIndex === 0 ? 'Медитация' : 'Meditate', color: Colors.get('meditate', theme) };
    if (step.type === 'rest')
      return { name: langIndex === 0 ? 'Отдых' : 'Rest', color: Colors.get('rest', theme) };
    return { name: 'Rest', color: '#94a3b8' };
  };

  const { name: phaseName, color: phaseColor } = getPhaseInfo(currentStep);

  // Cycle display
  const cycleInfo = () => {
    if (!session.steps) return '0 / 0';
    const stepsPerCycle = session.steps[0].restSeconds > 0 ? 2 : 1;
    const currentCycle = Math.floor(currentStepIndex / stepsPerCycle) + 1;
    return isStart ? `${currentCycle} / ${session.cycles}` : '0';
  };

  // mm:ss display
  const timeRemaining = Math.max(0, duration - elapsed);
  const totalSecs = Math.floor(timeRemaining / 1000);
  const displayTime = `${Math.floor(totalSecs / 60).toString().padStart(2, '0')}:${(totalSecs % 60).toString().padStart(2, '0')}`;

  // Visual progress for SVG ring (0 → 1)
  const visualProgress = currentStep ? elapsed / currentStep.duration : 0;

  // ===== Handlers =====
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
    audio.pause();
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReload = () => {
    setCurrentStepIndex(0);
    setElapsed(0);
    setIsRunning(false);
    setIsStart(false);
    setIsPaused(false);
    setIsFinished(false);
  };

  const onFinishSession = async () => {
    if (!isCustom) {
      markSessionAsDone(1, categoryIndex, protocolIndex, level);
    }
    await saveMeditationSession(startTime, Date.now());
    setFinishMessage(congratulations(langIndex));
    setIsFinished(true);
  };

  const onSaveSession = async () => {
    await saveMeditationSession(startTime, endTime);
    handleReload();
    setShow(false);
  };

  // ===== Render =====
  return (
    <div style={styles(theme, show).container}>
      <div style={styles(theme, show, isStart).decorLayer} />

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
              border: isLevelDone(categoryIndex, protocolIndex, level, isCustom) ? `2px solid ${Colors.get('maxValColor', theme)}` : 'none',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
              width: '100%',
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: '12px',
            }}
          >
            <FaCaretLeft
              onClick={() => setLevel((prev) => Math.max(0, prev - 1))}
              style={{ fontSize: '24px', color: Colors.get('icons', theme) }}
            />
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{level + 1}</p>
            <FaCaretRight
              onClick={() => setLevel((prev) => Math.min(protocol.levels.length - 1, prev + 1))}
              style={{ fontSize: '24px', color: Colors.get('icons', theme) }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', width: '100%', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '15px' : '17px' }}>{session.strategy || protocol.levels[level]?.strategy || ''}</p>
            <p style={{ color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '13px' : '15px' }}>{(langIndex === 0 ? 'циклов: ' : 'cycles: ') + session.cycles}</p>
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

      {/* Active timer */}
      {!isFinished && isStart && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80%', width: '100%' }}>
          <svg width="400" height="400" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill={phaseColor} opacity="0.1" />
            <circle cx="50" cy="50" r="45" fill="none" stroke={Colors.get('border', theme)} strokeWidth="1" opacity="0.4" />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={phaseColor}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - visualProgress)}`}
              strokeLinecap="round"
            />
            <foreignObject x="15" y="15" width="70" height="40">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  width: '70px',
                  height: '40px',
                  fontSize: '1px',
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
            <text x="50" y="60" textAnchor="middle" fill={phaseColor} fontFamily="sans-serif" fontSize="16" fontWeight="bold">
              {displayTime}
            </text>
            <text x="50" y="80" textAnchor="middle" fill={phaseColor} fontFamily="sans-serif" fontSize="5">
              {phaseName}
            </text>
          </svg>
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
                if (isFinished) setIsFinished(false);
                setShow(false);
              }}
              style={{ fontSize: '60px', color: Colors.get('close', theme) }}
            />
            <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Выйти' : 'Exit'}</div>
          </div>
        )}

        {isStart && !isFinished && (
          audioEnabled ? (
            <div>
              <IoMdVolumeHigh onClick={() => setAudioEnabled(false)} style={{ fontSize: '60px', color: Colors.get('icons', theme) }} />
              <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Выкл звук' : 'Mute'}</div>
            </div>
          ) : (
            <div>
              <IoMdVolumeMute onClick={() => setAudioEnabled(true)} style={{ fontSize: '60px', color: Colors.get('icons', theme) }} />
              <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Вкл звук' : 'Unmute'}</div>
            </div>
          )
        )}

        {!isStart && !showStartTimer && !isFinished && (
          <div>
            <IoPlayCircle
              onClick={() => setShowStartTimer(true)} // ✅ No setSession needed!
              style={{ fontSize: '60px', color: Colors.get('play', theme) }}
            />
            <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Начать' : 'Start'}</div>
          </div>
        )}

        {isPaused && !isFinished && (
          <>
            <div>
              <IoArrowBackCircle onClick={handleReload} style={{ fontSize: '60px', color: Colors.get('close', theme) }} />
              <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Выйти' : 'Exit'}</div>
            </div>
            <div>
              <IoPlayCircle onClick={handleResume} style={{ fontSize: '60px', color: Colors.get('play', theme) }} />
              <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Продолжить' : 'Resume'}</div>
            </div>
            <div>
              <IoCheckmarkCircle onClick={onSaveSession} style={{ fontSize: '60px', color: Colors.get('reload', theme) }} />
              <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Сохранить & выйти' : 'Save & exit'}</div>
            </div>
          </>
        )}

        {isRunning && !isFinished && !isPaused && (
          <div>
            <IoPauseCircle onClick={handlePause} style={{ fontSize: '60px', color: Colors.get('pause', theme) }} />
            <div style={{ fontSize: '9px', color: Colors.get('subText', theme) }}>{langIndex === 0 ? 'Пауза' : 'Pause'}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeditationTimer;

const styles = (theme, show, isStart) => ({
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
    backgroundImage: isStart ? `url(${theme === THEME.SPECIALDARK || theme === THEME.DARK ? DarkBg : LightBg})` : 'none',
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

const disclaimer = (langIndex) => {
  // 0 = ru, 1 = en
  if (langIndex === 0) {
    return "Внимание: медитация предназначена для поддержки общего благополучия и не заменяет медицинскую помощь. При наличии психических, неврологических или сердечно-сосудистых заболеваний, при беременности или ухудшении самочувствия прекратите практику и при необходимости обратитесь к врачу.";
  }

  return "Notice: Meditation is intended to support general well-being and is not a substitute for medical care. If you have mental health, neurological, or cardiovascular conditions, are pregnant, or feel unwell, please stop the practice and consult a healthcare professional if needed.";
};
const congratulations = (langIndex) => {
  const messages = {
    ru: [
      'Отличная медитация! 🧘‍♂️',
      'Ты нашёл момент тишины — это ценно. 🌿',
      'Спасибо, что уделил время себе и своему уму. 💙',
      'Ты вернулся в настоящее — через осознанность. ✨',
      'Твоя практика приносит плоды. Продолжай! 🌸',
      'Ты позволил себе просто быть. Это искусство. 🕊️',
      'Минута покоя — уже победа. Молодец! 😌',
      'Ты дал своему разуму пространство для отдыха. Респект! 🙏',
      'Каждая медитация — шаг к внутреннему балансу. 💪🌱',
      'Твоя нервная система благодарит тебя за эту паузу. 🧠❤️',
    ],
    en: [
      'Wonderful meditation! 🧘‍♂️',
      'You found a moment of stillness — that’s precious. 🌿',
      'Thank you for giving time to yourself and your mind. 💙',
      'You returned to the present — through awareness. ✨',
      'Your practice is bearing fruit. Keep going! 🌸',
      'You allowed yourself to simply be. That’s an art. 🕊️',
      'One moment of calm is already a win. Well done! 😌',
      'You gave your mind space to rest. Respect! 🙏',
      'Every meditation is a step toward inner balance. 💪🌱',
      'Your nervous system thanks you for this pause. 🧠❤️',
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