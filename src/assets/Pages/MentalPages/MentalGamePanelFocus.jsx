import { useEffect, useState, useCallback } from 'react';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision } from './FocusProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaFire, FaMedal, FaStopwatch } from 'react-icons/fa';
import { IoPlayCircle, IoReloadCircle, IoArrowBackCircle, IoPauseCircle } from "react-icons/io5";
import { focusTrainingLevels, saveSessionDuration } from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanelFocus = ({ show, type, difficulty, setShow }) => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);

  // Game flow
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [currentProblem, setCurrentProblem] = useState(null); // { items: string[], targetSymbol: string }
  const [userSelection, setUserSelection] = useState(new Set()); // indices clicked
  const [feedback, setFeedback] = useState({}); // { index: 'correct' | 'wrong' }

  // Per-problem timing
  const [problemStartTime, setProblemStartTime] = useState(0);
  const [problemTimerActive, setProblemTimerActive] = useState(false);
  const [roundTimeLeft, setRoundTimeLeft] = useState(0);
  const [roundTimerActive, setRoundTimerActive] = useState(false);
  // Audio
  const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

  // Scoring & Progress
  const [scores, setScores] = useState(0);
  const [stage, setStage] = useState(1);
  const [streakLength, setStreakLength] = useState(0);
  const [rightAnswers, setRightAnswers] = useState(0);
  const [record, setRecord] = useState(AppData.mentalRecords[type]?.[difficulty] || 0);
  const [time, setTime] = useState(0);

  // Countdown
  const [seconds, setSeconds] = useState(0);

  // Feedback delay
  const [delayTimer, setDelayTimer] = useState(false);
  const [addScores, setAddScores] = useState(0);
  const [message, setMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');

  // === Preferences ===
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

  // === Session Timer ===
  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);

  // === Start Countdown ===
  useEffect(() => {
    if (!showStartTimer) return;

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
  }, [showStartTimer]);

  // === Handle Click on Symbol ===
  const handleSymbolClick = useCallback((index) => {
    if (!isStart || isFinished || delayTimer || isPaused) return;

    const symbol = currentProblem.items[index];
    const isTarget = symbol === currentProblem.targetSymbol;

    setUserSelection((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index); // toggle off (optional)
      } else {
        newSet.add(index);
      }
      return newSet;
    });

    setFeedback((prev) => ({
      ...prev,
      [index]: isTarget ? 'correct' : 'wrong',
    }));

    if (!isTarget) {
      playWrong();
    }

    // Optional: auto-submit after all targets are found? Or wait for "submit"?
    // For simplicity: auto-submit when user clicks anywhere (or we can add a "check" button)
    // But let’s auto-evaluate on every click after 300ms of inactivity
  }, [currentProblem, isStart, isFinished, delayTimer, isPaused, playWrong]);

  // === Auto-submit after interaction (simple approach) ===
  useEffect(() => {
    if (userSelection.size === 0 || delayTimer) return;

    const timeout = setTimeout(() => {
      handleSubmit();
    }, 800); // submit 0.8s after last click

    return () => clearTimeout(timeout);
  }, [userSelection, delayTimer]);

  const handleSubmit = () => {
    if (!currentProblem || delayTimer) return;

    const { items, targetSymbol } = currentProblem;
    const correctIndices = items
      .map((sym, i) => (sym === targetSymbol ? i : -1))
      .filter(i => i !== -1);
    const correctCount = correctIndices.length;

    const userCorrect = Array.from(userSelection).filter(i => items[i] === targetSymbol).length;
    const userWrong = Array.from(userSelection).filter(i => items[i] !== targetSymbol).length;

    const userAnswer = userCorrect; // what they got right
    const expectedAnswer = correctCount;

    const answerTime = Date.now() - problemStartTime;
    const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, userAnswer, streakLength);
    const isPerfect = userWrong === 0 && userCorrect === expectedAnswer;

    let addMessage = '';
    if (isPerfect) {
      addMessage = getPraise(langIndex);
      setRightAnswers(prev => prev + 1);
    } else {
      addMessage = langIndex === 0
        ? `Правильно: ${expectedAnswer}. Ты выбрал: ${userCorrect} (ошибок: ${userWrong})`
        : `Correct: ${expectedAnswer}. You selected: ${userCorrect} (mistakes: ${userWrong})`;
    }

    const col = isPerfect
      ? Colors.get('maxValColor', theme)
      : Colors.get('minValColor', theme);

    setStatusColor(col);
    setMessage(addMessage);
    setAddScores(points);
    setStreakLength(prev => (isPerfect ? prev + 1 : 0));
    isPerfect ? playRight() : playWrong();

    setDelayTimer(true);
    setProblemTimerActive(false);
  };
  useEffect(() => {
  if (!roundTimerActive || roundTimeLeft <= 0) {
    if (roundTimeLeft <= 0) {
      // Время вышло — автоматически завершить раунд
      handleSubmit();
    }
    return;
  }

  const id = setTimeout(() => {
    setRoundTimeLeft(prev => prev - 1);
  }, 1000);

  return () => clearTimeout(id);
}, [roundTimerActive, roundTimeLeft]);
  // === Delay After Feedback ===
  useEffect(() => {
    if (!delayTimer) return;

    const timer = setTimeout(() => {
      const nextScore = scores + addScores;
      setScores(nextScore);
      setAddScores(0);
      setUserSelection(new Set());
      setFeedback({});

      if (stage >= 20) {
        onFinishSession(nextScore);
      } else {
        setStage(prev => prev + 1);
        setNewProblem(prev => prev + 1);
      }

      setDelayTimer(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [delayTimer, scores, addScores, stage]);

  // === Game Controls ===
  const handleStart = () => {
    initAudio();
    setScores(0);
    setStage(1);
    setRightAnswers(0);
    setStreakLength(0);
    setMessage('');
    setIsStart(true);
    setIsRunning(true);
    setIsPaused(false);
    setTime(0);
    setStartTime(Date.now());
    setNewProblem(1);
  };

  const setNewProblem = (nextStage) => {
  const level = focusTrainingLevels[difficulty];
  const [items, answerStr] = getProblem(type, difficulty, nextStage);
  const roundTime = level.roundTimeSec || 10;
  setRoundTimeLeft(roundTime);
  setRoundTimerActive(true);

  console.log('[DEBUG] Problem generated:', {
    type,
    difficulty,
    stage: nextStage,
    items,
    answer: answerStr,
    targetSymbol: level.targetSymbol,
  });

  if (!items || items.length === 0) {
    setMessage(langIndex === 0 ? 'Ошибка генерации задачи' : 'Problem generation failed');
    setStatusColor(Colors.get('minValColor', theme));
    setDelayTimer(true);
    return;
  }

  setCurrentProblem({
    items,
    targetSymbol: level.targetSymbol || '★',
  });
  setUserSelection(new Set());
  setFeedback({});
  setProblemStartTime(Date.now());
  setProblemTimerActive(true);
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
    setMessage('');
    setUserSelection(new Set());
    setFeedback({});
    setStartTime(Date.now());
    if (isStart) setNewProblem(1);
  };

  const onFinishSession = (totalScore) => {
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    saveSessionDuration(duration);
    const isRecord = totalScore > record;
    const msg = congratulations(false, langIndex, totalScore, rightAnswers, 20, isRecord, false);
    setIsRunning(false);
    setMessage(msg);
    setIsFinished(true);
    setIsStart(false);
  };

  const onFinish = () => {
    if (scores > record) {
      setRecord(scores);
      if (!AppData.mentalRecords[type]) AppData.mentalRecords[type] = {};
      AppData.mentalRecords[type][difficulty] = scores;
    }
    setShow(false);
  };

  // === Render Symbols ===
  const renderProblemItems = () => {
    if (!currentProblem || !currentProblem.items) return null;

    return (
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
        {currentProblem.items.map((symbol, i) => {
          let bgColor = Colors.get('bottomPanel', theme);
          let borderColor = Colors.get('border', theme);

          if (feedback[i] === 'correct') {
            bgColor = Colors.get('maxValColor', theme) + '20';
            borderColor = Colors.get('maxValColor', theme);
          } else if (feedback[i] === 'wrong') {
            bgColor = Colors.get('minValColor', theme) + '20';
            borderColor = Colors.get('minValColor', theme);
          } else if (userSelection.has(i)) {
            borderColor = Colors.get('mainText', theme);
          }

          return (
            <div
              key={i}
              onClick={() => handleSymbolClick(i)}
              style={{
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                color: Colors.get('mainText', theme),
                backgroundColor: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: '8px',
                cursor: isStart && !delayTimer && !isPaused ? 'pointer' : 'default',
                userSelect: 'none',
              }}
            >
              {symbol}
            </div>
          );
        })}
      </div>
    );
  };

  // =============== Rendering ===============
  return (
    <div style={styles(theme, show).container}>
      {/* Pre-start screen */}
      {!isStart && !showStartTimer && !isFinished && (
        <div style={preStartScreenStyle(theme, langIndex, difficulty)}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
            {focusTrainingLevels[difficulty].level[langIndex]}
          </div>
          <div style={{ fontSize: '15px', color: Colors.get('subText', theme), marginTop: '12px' }}>
            {focusTrainingLevels[difficulty].title[langIndex]}
          </div>
          <div style={{ fontSize: '15px', color: Colors.get('subText', theme), marginTop: '12px' }}>
            {focusTrainingLevels[difficulty].description[langIndex]}
          </div>
          <div style={{ fontSize: '15px', color: Colors.get('mainText', theme), marginTop: '12px' }}>
            {langIndex === 0 ? 'Элементов: ' : 'Items: '}
            {focusTrainingLevels[difficulty].totalItemsRange[0]}–
            {focusTrainingLevels[difficulty].totalItemsRange[1]}
          </div>
          <div style={{ fontSize: '15px', color: Colors.get('subText', theme), marginTop: '12px' }}>
            {langIndex === 0
              ? `Время: ${focusTrainingLevels[difficulty].timeLimitSec} сек`
              : `Time: ${focusTrainingLevels[difficulty].timeLimitSec} sec`}
          </div>
          <div style={{ fontSize: '12px', color: Colors.get('subText', theme), marginTop: '50px', textAlign: 'center' }}>
            {langIndex === 0
              ? 'Нажимай только на целевые символы (★). Ошибки сбрасывают серию.'
              : 'Click only on target symbols (★). Mistakes break your streak.'}
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

      {/* Countdown */}
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

      {/* Active Game */}
      {isStart && !isFinished && (
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
              {stage}/20
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold', color: Colors.get('maxValColor', theme) }}>
              <FaStar />
              {scores}
            </div>
          </div>
          <div style={{ fontSize: '24px', color: roundTimeLeft <= 3 ? 'red' : 'white' }}>
          {roundTimeLeft}s
          </div>
          <div style={{ marginTop: '20px', width: '95%',display:'flex' }}>
            {!delayTimer && (
              <div style={problemCardStyle(theme, false)}>
                <div style={{ fontSize: '16px', marginBottom: '12px', color: Colors.get('subText', theme) }}>
                  {focusTrainingLevels[difficulty].rules?.[langIndex] || (langIndex === 0 ? 'Нажми на все ★' : 'Click all ★')}
                </div>
                {renderProblemItems()}
              </div>
            )}

            {delayTimer && (
              <div style={problemCardStyle(theme, true, statusColor)}>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: addScores > 0 ? Colors.get('maxValColor', theme) : Colors.get('minValColor', theme) }}>
                  {addScores > 0 && <FaStar />} {addScores > 0 ? addScores : (langIndex === 0 ? 'ошибки' : 'mistakes')}
                </p>
                <p style={{ fontSize: '16px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>{message}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Finish Screen */}
      {isFinished && (
        <div style={finishScreenStyle(theme, langIndex, scores, record, time, rightAnswers, message)} />
      )}

      {isFinished && (
        <div style={styles(theme, show).controls}>
          <IoArrowBackCircle onClick={() => onFinish()} style={{ fontSize: '60px', color: Colors.get('close', theme) }} />
        </div>
      )}
    </div>
  );
};

// === Helper Styles (kept identical to your original) ===
const preStartScreenStyle = (theme, langIndex, difficulty) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '100%',
  height: '80%',
});

const countdownStyle = (theme, seconds, langIndex) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '90%',
  height: '80%',
});

const finishScreenStyle = (theme, langIndex, scores, record, time, rightAnswers, message) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  width: '100%',
  height: '80%',
});

const problemCardStyle = (theme, isAnswer, color) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '95%',
  minHeight: '56vh',
  marginTop: '20px',
  backgroundColor: Colors.get('bottomPanel', theme),
  boxShadow: isAnswer ? `0px 0px 9px 9px ${color}` : `2px 2px ${Colors.get('shadow', theme)}`,
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
    width: '100vw',
  },
});

// === Reused Helpers (identical to your original) ===
const getParsedTime = (time) => {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const congratulations = (isEndlessMode, langIndex, score, rightAnswers, totalAnswers, isRecord) => {
  const percentage = totalAnswers > 0 ? Math.round((rightAnswers / totalAnswers) * 100) : 0;
  const isHigh = percentage >= 80;
  const messages = {
    ru: {
      high: [`🎉 Отлично! ${rightAnswers}/${totalAnswers} (${percentage}%)`, `🔥 ${score} очков — впечатляет!`],
      moderate: [`🙂 Хорошая попытка! ${rightAnswers}/${totalAnswers} (${percentage}%)`, `🌱 Ты на правильном пути!`],
      low: [`🤗 Ты старался — это главное.`, `🌤️ Попробуй ещё!`],
      record: [`🏆 НОВЫЙ РЕКОРД! ${score} очков!`],
    },
    en: {
      high: [`🎉 Awesome! ${rightAnswers}/${totalAnswers} (${percentage}%)!`, `🔥 ${score} points — impressive!`],
      moderate: [`🙂 Good effort! ${rightAnswers}/${totalAnswers} (${percentage}%)`, `🌱 You're making progress!`],
      low: [`🤗 You gave it your best!`, `🌤️ Try again!`],
      record: [`🏆 NEW RECORD! ${score} points!`],
    }
  };
  const lang = langIndex === 0 ? messages.ru : messages.en;
  let candidates = isRecord ? lang.record : (isHigh ? lang.high : lang.moderate);
  if (percentage < 50) candidates = lang.low;
  return candidates[Math.floor(Math.random() * candidates.length)];
};

const getPraise = (langIndex) => {
  const en = ["Great!", "Perfect!", "Yes!", "Exactly!"];
  const ru = ["Отлично!", "Прекрасно!", "Верно!", "Точно!"];
  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
};

export default MentalGamePanelFocus;