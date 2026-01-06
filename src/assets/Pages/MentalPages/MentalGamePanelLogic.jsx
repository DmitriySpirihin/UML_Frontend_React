import { useEffect, useState } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision} from './LogicProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaFire, FaMedal, FaStopwatch } from 'react-icons/fa';
import { IoPlayCircle, IoReloadCircle, IoArrowBackCircle, IoPauseCircle } from "react-icons/io5";
import MentalInput from './MentalInput';
import { logicOddOneOutLevels, saveSessionDuration } from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanel = ({ show, type, difficulty, setShow }) => {
  const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);

  // Game Flow
  const [input, setInput] = useState('');
  const [handledInput, setHandledInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);
  const [pendingStage, setPendingStage] = useState(1);

  // Per-problem timing
  const [problemStartTime, setProblemStartTime] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null); // { items, correctIndex }
  const [problemElapsedMs, setProblemElapsedMs] = useState(0);
  const [problemTimerActive, setProblemTimerActive] = useState(false);
  // Audio
  const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

  // Delay after feedback
  const [delay, setDelay] = useState(0);
  const [delayTimer, setDelayTimer] = useState(false);

  // Scoring & Progress
  const [scores, setScores] = useState(0);
  const [stage, setStage] = useState(1);
  const [streakLength, setStreakLength] = useState(0);
  const [answer, setAnswer] = useState(''); // correct index as string

  // Feedback
  const [message, setMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [addScores, setAddScores] = useState(0);

  // Statistics
  const [rightAnswers, setRightAnswers] = useState(0);
  const [record, setRecord] = useState(AppData.mentalRecords[type]?.[difficulty] || 0);
  const [time, setTime] = useState(0);

  // Countdown before start
  const [seconds, setSeconds] = useState(0);

  // === Input Handling ===
  useEffect(() => {
    if (!isStart || isFinished || delayTimer) {
      setInput('');
      return;
    }

    if (input === 'CC') {
      setHandledInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
    } else if (input === '>>>') {
      handleAnswer();
    } else if (/^\d+$/.test(input)) {
      setHandledInput(input);
    }
    setInput('');
  }, [input, isStart, isFinished, delayTimer]);

  // === Global Session Timer ===
  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  // === Preferences Subscriptions ===
  useEffect(() => {
    const sub1 = theme$.subscribe(setthemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  // === Pre-Start Countdown ===
  useEffect(() => {
    if (!showStartTimer) {
      setSeconds(0);
      return;
    }

    const totalSeconds = Math.ceil(startTimerDuration / 1000);
    setSeconds(totalSeconds);

    const intervalId = setInterval(() => {
      setSeconds((prev) => {
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
  }, [showStartTimer, startTimerDuration]);

  // === Feedback Delay (after answer) ===
  useEffect(() => {
    if (!delayTimer) return;

    const intervalId = setInterval(() => {
      setDelay((prev) => {
        if (prev >= 900) {
          clearInterval(intervalId);
          setDelayTimer(false);
          setDelay(0);

          const nextScore = scores + addScores;
          setScores(nextScore);
          setAddScores(0);
          setHandledInput('');

          if (finishAfterFeedback) {
            onFinishSession(nextScore);
          } else {
            setStage(pendingStage);
            setNewProblem(pendingStage);
          }
          return 0;
        }
        return prev + 100;
      });
    }, 100);

    return () => clearInterval(intervalId);
  }, [delayTimer, scores, addScores, finishAfterFeedback, pendingStage]);
  // === Per-Problem Stopwatch (Count-Up) ===
useEffect(() => {
  if (!problemTimerActive || isFinished || delayTimer) {
    return;
  }

  const intervalId = setInterval(() => {
    setProblemElapsedMs((prev) => prev + 100); // update every 100ms
  }, 100);

  return () => clearInterval(intervalId);
}, [problemTimerActive, isFinished, delayTimer]);
  // === Game Controls ===
  const handleStart = () => {
    initAudio();
    setScores(0);
    setStage(1);
    setRightAnswers(0);
    setStreakLength(0);
    setHandledInput('');
    setMessage('');
    setNewProblem(1);
    setIsStart(true);
    setIsRunning(true);
    setIsPaused(false);
    setTime(0);
    setStartTime(Date.now());
  };

 const setNewProblem = (nextStage = stage) => {
  const [items, correctIndexStr] = getProblem(type, difficulty, nextStage);
  const cleanAnswer = String(correctIndexStr).trim();
  
  setCurrentProblem({ items, correctIndex: parseInt(correctIndexStr, 10) });
  setAnswer(cleanAnswer);
  setHandledInput('');
  setMessage('');
  setPendingStage(nextStage + 1);
  setFinishAfterFeedback(false);
  setProblemStartTime(Date.now());

  // ✅ Start per-problem stopwatch
  setProblemElapsedMs(0);
  setProblemTimerActive(true);
};

  const handleAnswer = () => {
    if (!currentProblem) return;

  const userAnswer = String(handledInput).trim();
  const expectedAnswer = String(answer).trim(); // ← FORCE STRING

  const answerTime = Date.now() - problemStartTime;
  const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, userAnswer, streakLength);
  const precision = getPrecision(type, expectedAnswer, userAnswer);

    let addmessage = '';
    if (precision === 0) {
      addmessage = getPraise(langIndex);
      setRightAnswers((prev) => prev + 1);
    } else {
      addmessage = (langIndex === 0 ? 'Правильный ответ: ' : 'Correct answer: ') + expectedAnswer;
    }

    const col = precision === 0
      ? Colors.get('maxValColor', theme)
      : Colors.get('minValColor', theme);

    setStatusColor(col);
    setMessage(addmessage);
    setAddScores(points);
    setStreakLength((prev) => (hasStreak(type, expectedAnswer, userAnswer) ? prev + 1 : 0));
    precision === 0 ? playRight() : playWrong();

    setFinishAfterFeedback(stage >= 20);
    setDelayTimer(true);
  };

  const handlePause = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReload = () => {
    setScores(0);
    setStage(1);
    setRightAnswers(0);
    setStreakLength(0);
    setHandledInput('');
    setMessage('');
    setNewProblem();
    setStartTime(Date.now());
  };

  const onFinishSession = (totalScore) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    saveSessionDuration(duration,scores > record,type,difficulty,scores + addScores);
    const isRecord = totalScore > record;
    const msg = congratulations(false, langIndex, totalScore, rightAnswers, 20, isRecord, false);
    setIsRunning(false);
    setMessage(msg);
    setIsFinished(true);
    setIsStart(false);
  };

  const onFinish = () => {
    setScores(0);
    setStage(1);
    setRightAnswers(0);
    setIsFinished(false);
    setShow(false);
  };
const getContrastColor = (hex) => {
  // Simple brightness check
  if (!hex || hex[0] !== '#') return 'white';
  
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? 'black' : 'white';
};
  // =============== Rendering Helpers ===============
 const renderProblemItems = () => {
  if (!currentProblem || !currentProblem.items) return null;
  const { items } = currentProblem;

  if (Array.isArray(items) && items.length > 0) {
    if (typeof items[0] === 'number') {
      // Pure number sequence
      return (
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {items.map((num, i) => (
            <div
              key={i}
              style={{
                padding: '12px 18px',
                backgroundColor: Colors.get('bottomPanel', theme),
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '20px',
                color: Colors.get('mainText', theme),
                border: `2px solid ${Colors.get('border', theme)}`,
              }}
            >
              {num}
            </div>
          ))}
        </div>
      );
    } else if (typeof items[0] === 'object' && (items[0].shape || items[0].color || typeof items[0].value === 'number')) {
      // Shape/color with optional number label
      return (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                width: '50px',
                height: '50px',
                backgroundColor: item.color || 'gray',
                clipPath: getClipPathForShape(item.shape || 'circle'),
                border: `2px solid ${Colors.get('border', theme)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                fontSize: '16px',
                fontWeight: 'bold',
                color: getContrastColor(item.color || 'gray'), // ensure text is readable
              }}
            >
              {/* Show number if present */}
              {typeof item.value === 'number' && (
                <span style={{ pointerEvents: 'none' }}>
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
      );
    }
  }
  return <div>?</div>;
};

  const getClipPathForShape = (shape) => {
    switch (shape) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'square': return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      default: return 'circle(50% at 50% 50%)';
    }
  };

  return (
    <div style={styles(theme, show).container}>
      {!isStart && !showStartTimer && !isFinished && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            width: '100%',
            height: '80%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '20px',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold',
              color: Colors.get('mainText', theme),
            }}
          >
            {logicOddOneOutLevels[difficulty].level[langIndex]}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '12px',
              justifyContent: 'center',
              fontSize: '15px',
              color: Colors.get('subText', theme),
            }}
          >
            {logicOddOneOutLevels[difficulty].title[langIndex]}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '12px',
              justifyContent: 'center',
              fontSize: '15px',
              color: Colors.get('subText', theme),
            }}
          >
            {logicOddOneOutLevels[difficulty].description[langIndex]}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '12px',
              justifyContent: 'center',
              fontSize: '15px',
              color: Colors.get('mainText', theme),
            }}
          >
            {(langIndex === 0 ? 'Элементов: ' : 'Items: ') +
              logicOddOneOutLevels[difficulty].itemsCountRange[0] +
              '–' +
              logicOddOneOutLevels[difficulty].itemsCountRange[1]}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '12px',
              justifyContent: 'center',
              fontSize: '15px',
              color: Colors.get('subText', theme),
            }}
          >
            {langIndex === 0
              ? `Время на ответ: ${logicOddOneOutLevels[difficulty].timeLimitSec} сек`
              : `Time limit: ${logicOddOneOutLevels[difficulty].timeLimitSec} sec`}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '50px',
              fontSize: '12px',
              color: Colors.get('subText', theme),
            }}
          >
            {disclaimer(langIndex)}
          </div>
        </div>
      )}

      {!isStart && !showStartTimer && !isFinished && (
        <div style={styles(theme, show).controls}>
          <IoArrowBackCircle onClick={() => onFinish()} style={{ fontSize: '60px', color: Colors.get('close', theme) }} />
          <IoPlayCircle onClick={() => setShowStartTimer(true)} style={{ fontSize: '60px', color: Colors.get('play', theme) }} />
          <IoReloadCircle onClick={handleReload} style={{ fontSize: '60px', color: Colors.get('reload', theme) }} />
        </div>
      )}

      {!isFinished && showStartTimer && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-around', width: '90%', height: '80%' }}>
          <div style={{ fontSize: '10rem', marginTop: '180px', color: Colors.get('icons', theme), fontWeight: 'bold', lineHeight: 1 }}>
            {seconds}
          </div>
          <div style={{ fontSize: '2rem', marginBottom: '80px', textAlign: 'center' }}>
            <div style={{ color: Colors.get('icons', theme), marginBottom: '80px' }}>{langIndex === 0 ? 'Приготовьтесь!' : 'Get ready!'}</div>
          </div>
        </div>
      )}

      {!isFinished && isStart && (
        <div style={styles(theme).playContainer}>
          <div style={{ display: 'flex', flexDirection: 'row', width: '86%', borderBottom: `1px solid ${Colors.get('border', theme)}` }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginTop: '6px', width: '60%', gap: '20px', marginRight: 'auto' }}>
              <IoArrowBackCircle onClick={() => setIsStart(false)} style={{ fontSize: '25px', color: Colors.get('close', theme) }} />
              {isPaused ? (
                <IoPlayCircle onClick={handleResume} style={{ fontSize: '25px', color: Colors.get('play', theme) }} />
              ) : (
                <IoPauseCircle onClick={handlePause} style={{ fontSize: '25px', color: Colors.get('pause', theme) }} />
              )}
              <IoReloadCircle onClick={handleReload} style={{ fontSize: '25px', color: Colors.get('reload', theme) }} />
            </div>
            <div style={{ display: 'flex', marginLeft: 'auto', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>
              <FaStopwatch />
              {getParsedTime(time)}
            </div>
          </div>
          <div style={{ display: 'flex', width: '86%', flexDirection: 'row', marginTop: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: Colors.get('minValColor', theme) }}>
              <FaFire />
              {streakLength}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: Colors.get('difficulty', theme) }}>
              {stage + '/ 20'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: Colors.get('maxValColor', theme) }}>
              <FaStar />
              {scores}
            </div>
          </div>
           { isStart && problemTimerActive && (
       <div style={{ width: '48px', height: '48px' ,marginTop:'35px'}}>
       <svg viewBox="0 0 28 28" style={{ width: '100%', height: '100%' }}>
      <circle cx="14" cy="14" r="12" fill={Colors.get('background', theme)} stroke={Colors.get('border', theme)} strokeWidth="1"/>
      <text x="14" y="18" textAnchor="middle" fill={Colors.get('mainText', theme)} fontSize="8" fontWeight="bold">
        {(problemElapsedMs / 1000).toFixed(1)}
       </text>
       </svg>
         </div>
      )}
          <div style={{ marginTop: '20px', width:'95%',display:'flex' }}>
            {!delayTimer && isStart && (
              <div style={problemCardStyle(theme, false)}>
                  
                <div style={{ fontSize: '16px', marginBottom: '12px', color: Colors.get('subText', theme) }}>
                  {logicOddOneOutLevels[difficulty].rules[langIndex]}
                </div>
                {renderProblemItems()}
                <div style={{ marginTop: '16px', fontSize: '16px', color: Colors.get('subText', theme) }}>
                  {langIndex === 0 ? 'Введите номер лишнего элемента (1, 2...)' : 'Enter index of odd one out (1, 2...)'}
                </div>
              </div>
            )}
            {delayTimer && (
              <div style={problemCardStyle(theme, true, statusColor)}>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: addScores > 0 ? Colors.get('maxValColor', theme) : Colors.get('minValColor', theme) }}>
                  {addScores > 0 && <FaStar />} {addScores > 0 ? addScores : (langIndex === 0 ? 'не верно' : 'wrong answer')}
                </p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>{message}</p>
              </div>
            )}
          </div>

          <div style={{ fontSize: '34px', fontWeight: 'bold', color: Colors.get('subText', theme), marginTop: 'auto' }}>
            {handledInput}
          </div>
        </div>
      )}

      {!isFinished && isStart && !delayTimer && <MentalInput setInput={setInput} type={type} />}

      {isFinished && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', width: '100%', height: '80%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: Colors.get('maxValColor', theme) }}>
            <FaStar />
            {scores}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: Colors.get('medium', theme) }}>
            {getTimeInfo(langIndex, time)}
          </div>
          {scores > record && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: Colors.get('medium', theme) }}>
              <FaMedal />
              {langIndex === 0 ? 'Новый рекорд!' : 'New record!'}
            </div>
          )}
          {scores <= record && (
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '28px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>
              {langIndex === 0 ? 'рекорд: ' + record : 'record: ' + record}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '22px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
            {difficulty < 4 ? rightAnswers + ' / ' + 20 : rightAnswers}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
            {message}
          </div>
        </div>
      )}

      {isFinished && (
        <div style={styles(theme, show).controls}>
          <IoArrowBackCircle onClick={() => onFinish()} style={{ fontSize: '60px', color: Colors.get('close', theme) }} />
        </div>
      )}
    </div>
  );
};

export default MentalGamePanel;

const problemCardStyle = (theme, isAnswer, color) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width:'95%',
  minHeight: '16vh',
  marginTop: '20px',
  backgroundColor: Colors.get('bottomPanel', theme),
  boxShadow: isAnswer ? '0px 0px 9px 9px' + color : '2px 2px' + Colors.get('shadow', theme),
  borderRadius: '24px',
  fontSize: '39px',
  fontWeight: 'bold',
  color: Colors.get('mainText', theme),
  alignContent: 'center',
  padding: '16px',
});

const styles = (theme, show) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    position: 'fixed',
    flexDirection: 'column',
    alignItems: 'center',
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
  },
  controls: {
    display: 'flex',
    marginTop: '30px',
    gap: '50px',
  },
  playContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '50vh',
    bottom: '0',
    width: '100vw',
  },
});

const disclaimer = (langIndex) => {
  if (langIndex === 0) {
    return 'Найди лишний элемент в ряду. Отвечай быстро — за скорость даются бонусы! Каждая ошибка сбрасывает серию. За 5 правильных подряд — множитель очков (макс. ×1.5).';
  } else {
    return 'Find the odd one out. Answer quickly — speed bonuses apply! Every mistake resets your streak. 5 correct in a row → score multiplier (up to ×1.5).';
  }
};

const congratulations = (isEndlessMode, langIndex, score, rightAnswers, totalAnswers, isRecord, isRelaxMode = false) => {
  const percentage = totalAnswers > 0 ? Math.round((rightAnswers / totalAnswers) * 100) : 0;
  const isHigh = percentage >= 80;
  const isModerate = percentage >= 50 && !isHigh;
  const isLow = percentage < 50;

  const messages = {
    ru: {
      high: [`🎉 Отлично! ${rightAnswers}/${totalAnswers} (${percentage}%) — молодец!`, `✨ Потрясающе! Ты справился на ${percentage}%.`, `🔥 ${score} очков — впечатляет!`],
      moderate: [`🙂 Хорошая попытка! ${rightAnswers}/${totalAnswers} (${percentage}%)`, `🌱 Ты на правильном пути!`, `📈 Уже лучше!`],
      low: [`🤗 Ты старался — это главное.`, `🌱 Не сдавайся!`, `🌤️ Попробуй ещё!`],
      record: [`🏆🔥 НОВЫЙ РЕКОРД! ${score} очков!`, `🎉✨ Личный рекорд: ${rightAnswers}/${totalAnswers}!`],
    },
    en: {
      high: [`🎉 Awesome! ${rightAnswers}/${totalAnswers} (${percentage}%)!`, `✨ Outstanding! ${percentage}% correct.`, `🔥 ${score} points — impressive!`],
      moderate: [`🙂 Good effort! ${rightAnswers}/${totalAnswers} (${percentage}%)`, `🌱 You're making progress!`, `📈 Getting better!`],
      low: [`🤗 You gave it your best!`, `🌱 Don’t give up!`, `🌤️ Try again!`],
      record: [`🏆🔥 NEW RECORD! ${score} points!`, `🎉✨ Personal best: ${rightAnswers}/${totalAnswers}!`],
    }
  };

  const lang = langIndex === 0 ? messages.ru : messages.en;
  let candidates = [];

  if (isRecord) {
    candidates = [...lang.record];
  } else if (isHigh) {
    candidates = [...lang.high];
  } else if (isModerate) {
    candidates = [...lang.moderate];
  } else {
    candidates = [...lang.low];
  }

  if (candidates.length === 0) return langIndex === 0 ? 'Хорошо! 😊' : 'Good job! 😊';
  return candidates[Math.floor(Math.random() * candidates.length)];
};

function playVibro(type) {
  if (AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback) Telegram.WebApp.HapticFeedback.impactOccurred(type);
}

function getPraise(langIndex) {
  const en = ["Great!", "Perfect!", "Yes!", "Exactly!", "Awesome!"];
  const ru = ["Отлично!", "Прекрасно!", "Верно!", "Точно!", "Замечательно!"];
  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
}

function getSupport(langIndex) {
  const en = ["Close!", "Almost!", "Keep going!", "Try again!"];
  const ru = ["Рядом!", "Почти!", "Продолжай!", "Попробуй еще!"];
  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
}

function getParsedTime(time) {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getTimeInfo(langIndex, startTime) {
  const formattedTime = getParsedTime(startTime);
  return langIndex === 0
    ? `Ваше время: ${formattedTime}`
    : `Your time is: ${formattedTime}`;
}