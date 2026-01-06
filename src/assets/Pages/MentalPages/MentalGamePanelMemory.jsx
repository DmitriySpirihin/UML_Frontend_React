import { useEffect, useState} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import {theme$,lang$,fontSize$} from '../../StaticClasses/HabitsBus';
import { getProblem,getPoints ,hasStreak,getPrecision, getRoundConfig} from './MemoryProblems';
import BreathAudio from "../../Helpers/BreathAudio"
import {FaStar,FaFire,FaMedal,FaStopwatch} from 'react-icons/fa';
import {IoPlayCircle,IoReloadCircle,IoArrowBackCircle} from "react-icons/io5"
import MentalInput from './MentalInput';
import { memorySequenceLevels, saveSessionDuration} from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanel = ({ show,type,difficulty,setShow }) => {
   
const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);

  // Game Flow
  const [charShowMs, setCharShowMs] = useState(600);
const [retentionDelayMs, setRetentionDelayMs] = useState(2000);
  const [input, setInput] = useState('');
  const [handledInput, setHandledInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [phase, setPhase] = useState('memorize'); // 'memorize' → 'recall' → 'feedback'
  const [recallStartTime, setRecallStartTime] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState(0);
   const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);
    const [pendingStage, setPendingStage] = useState(1);
  // Audio
  const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

  // Delay after feedback
  const [delay, setDelay] = useState(0);
  const [delayTimer, setDelayTimer] = useState(false);

  // Scoring & Progress
  const [scores, setScores] = useState(0);
  const [stage, setStage] = useState(1);
  const [streakLength, setStreakLength] = useState(0);
  const [answer, setAnswer] = useState(''); // Full target sequence
  const [isReverse, setIsReverse] = useState(false);
  const [charIndex, setCharIndex] = useState(0); // Index of currently shown character

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
    if (!isStart || isFinished || phase !== 'recall') {
      setInput('');
      return;
    }

    if (input === 'CC') {
      setHandledInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
    } else if (input === '>>>') {
      handleAnswer();
    } else if (input.length === 1) {
      setHandledInput((prev) => (prev.length < answer.length ? prev + input : prev));
    }
    setInput('');
  }, [input, isStart, isFinished, phase, answer.length]);

  useEffect(() => {
    if (!isStart || isFinished || delayTimer || phase !== 'recall') return;
    if (handledInput.length === answer.length) {
      handleAnswer();
    }
  }, [handledInput, answer.length, phase, isStart, isFinished, delayTimer]);

  // === Global Session Timer ===
  useEffect(() => {
    let intervalId = null;
    if (isRunning) {
      intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
    }
    return () => clearInterval(intervalId);
  }, [isRunning]);
  useEffect(() => {
  if (phase !== 'memorize' || !answer || answer.length === 0) return;

  const total = answer.length;
  const charShow = charShowMs;           // e.g., 600
  const retentionDelay = retentionDelayMs; // e.g., 2000

  if (charIndex < total) {
    const id = setTimeout(() => setCharIndex(c => c + 1), charShow);
    return () => clearTimeout(id);
  } else {
    const id = setTimeout(() => {
      setPhase('recall');
      setRecallStartTime(Date.now());
    }, retentionDelay);
    return () => clearTimeout(id);
  }
}, [phase, answer, charIndex, charShowMs, retentionDelayMs]);
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

  // === Serial Character Presentation + Memory Delay ===
  useEffect(() => {
    if (phase !== 'memorize' || !answer || answer.length === 0) {
      return;
    }

    const totalChars = answer.length;

    if (charIndex < totalChars) {
      // Show current character for CHAR_SHOW_TIME ms
      const timeoutId = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 600); // ← Time each character is visible (e.g., 600ms)

      return () => clearTimeout(timeoutId);
    } else {
      // ✅ All characters shown → long delay to test memory
      const recallTimeout = setTimeout(() => {
        setPhase('recall');
        setRecallStartTime(Date.now());
      }, 2000); // ← Memory retention delay (e.g., 2000ms)

      return () => clearTimeout(recallTimeout);
    }
  }, [phase, answer, charIndex]);

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
  const [prompt, forwardSeq, reverseFlag] = getProblem(type, difficulty, nextStage);
  const levelConfig = memorySequenceLevels[difficulty];
  
  setAnswer(forwardSeq || '');
  setIsReverse(reverseFlag);
  setCharIndex(0);
  setPhase('memorize');
  setCharShowMs(levelConfig.charShowMs);        // ← Store in state or pass directly
  setRetentionDelayMs(levelConfig.retentionDelayMs);
    setHandledInput('');
    setMessage('');
    setPendingStage(nextStage + 1);
    setFinishAfterFeedback(false);
  };

  const handleAnswer = () => {
    if (phase !== 'recall') return;
    const expectedAnswer = isReverse ? answer.split('').reverse().join('') : answer;
    const answerTime = recallStartTime > 0 ? Date.now() - recallStartTime : 0;
    const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, handledInput, streakLength);
    const precision = getPrecision(type, expectedAnswer, handledInput);
    playVibro(precision === 0 ? 'light' : 'medium');

    let addmessage = '';
    if (precision === 0) {
      addmessage = getPraise(langIndex);
      setRightAnswers((prev) => prev + 1);
    } else if (precision < 0.15) {
      addmessage = getSupport(langIndex);
    } else {
      addmessage = (langIndex === 0 ? 'Правильный ответ: ' : 'Correct answer: ') + expectedAnswer;
    }

    const col = precision === 0
      ? Colors.get('maxValColor', theme)
      : precision < 0.15
      ? Colors.get('difficulty2', theme)
      : Colors.get('minValColor', theme);

    setStatusColor(col);
    setMessage(addmessage);
    setAddScores(points);
    setStreakLength((prev) => (hasStreak(type,expectedAnswer, handledInput) ? prev + 1 : 0));
    precision === 0 ? playRight() : playWrong();

    setFinishAfterFeedback(stage >= 20);
    setPhase('feedback');
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
    onFinish();
    const isRecord = totalScore > record;
    const msg = congratulations(false, langIndex, totalScore, rightAnswers, 20, isRecord, false);
    setIsRunning(false);
    setMessage(msg);
    setIsFinished(true);
    setIsStart(false);
  };

  const onFinish = () => {
  if (scores + addScores > record) {
    setRecord(scores + addScores);
    AppData.mentalRecords[type][difficulty] = scores + addScores;
  }
  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000); // Duration in seconds
  saveSessionDuration(duration,scores + addScores > record,type,difficulty,scores + addScores);
  setScores(0);
  setAddScores(0);
  setStage(1);
  setRightAnswers(0);
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
      {memorySequenceLevels[difficulty].level[langIndex]}
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
      {memorySequenceLevels[difficulty].title[langIndex]}
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
      {memorySequenceLevels[difficulty].description[langIndex]}
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
      {(langIndex === 0 ? 'Длина: ' : 'Length: ') +
        memorySequenceLevels[difficulty].elementsRange[0] +
        '–' +
        memorySequenceLevels[difficulty].elementsRange[1]}
    </div>

    {/* ✅ Updated timing info */}
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
        ? `Показ: ${memorySequenceLevels[difficulty].charShowMs} мс/символ`
        : `Flash: ${memorySequenceLevels[difficulty].charShowMs} ms/char`}
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        marginTop: '8px',
        justifyContent: 'center',
        fontSize: '15px',
        color: Colors.get('subText', theme),
      }}
    >
      {langIndex === 0
        ? `Пауза перед ответом: ${memorySequenceLevels[difficulty].retentionDelayMs} мс`
        : `Recall delay: ${memorySequenceLevels[difficulty].retentionDelayMs} ms`}
    </div>

    {/* ✅ Reverse mode indicator (if applicable) */}
    {memorySequenceLevels[difficulty].reverse && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginTop: '8px',
          justifyContent: 'center',
          fontSize: '15px',
          color: Colors.get('maxValColor', theme),
          fontStyle: 'italic',
        }}
      >
        {langIndex === 0 ? 'Обратный порядок' : 'Reverse order'}
      </div>
    )}

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
      
      {!isStart && !showStartTimer && !isFinished && <div style={styles(theme, show).controls}>
      
      <IoArrowBackCircle onClick={() => {setShow(false);setIsFinished(false);}} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
      <IoPlayCircle onClick={() => setShowStartTimer(true)} style={{fontSize:'60px',color:Colors.get('play', theme)}} /> 
      <IoReloadCircle onClick={handleReload} style={{fontSize:'60px',color:Colors.get('reload', theme)}}/>
      </div>}

      {!isFinished && showStartTimer && <div  style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'90%',height:'80%'}}>
      <div style={{ fontSize: '10rem',marginTop: '180px',color:Colors.get('icons', theme), fontWeight: 'bold', lineHeight: 1}}>
        {seconds}
      </div>
        <div style={{ fontSize: '2rem',marginBottom: '80px', textAlign: 'center'}}>
        <div style={{color:Colors.get('icons', theme),marginBottom: '80px'}}>{langIndex === 0 ? 'Приготовьтесь!':'Get ready!'}</div>
      </div>
    </div>}
    {!isFinished && isStart && <div style={styles(theme).playContainer}>
      <div style={{display:'flex',flexDirection:'row' , width:'86%',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
      <div style={{display:'flex',flexDirection:'row',marginTop:'6px',width:'60%',gap:'20px',marginRight:'auto'}}>
      <IoArrowBackCircle onClick={() => onFinishSession(scores + addScores)} style={{fontSize:'25px',color:Colors.get('close', theme)}}/>
      </div>
      <div style={{display:'flex',marginLeft:'auto',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:Colors.get('subText', theme)}}>
        <FaStopwatch/>
        {getParsedTime(time)}
      </div>
     </div>
      <div style={{display:'flex',width:'86%',flexDirection:'row',marginTop:'20px',alignItems:'center',justifyContent:'space-between'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:Colors.get('minValColor', theme)}}>
        <FaFire/>
        {streakLength}
      </div>  
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:Colors.get('difficulty', theme)}}>
        {stage + '/ 20'}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:Colors.get('maxValColor', theme)}}>
        <FaStar/>
        {scores}
      </div>
      </div>
      
      

      <div >
       {phase === 'recall' && !delayTimer && (
  <div style={{...problemCardStyle(theme, false),fontSize:'16px'}}>
    {isReverse 
      ? (langIndex === 0 ? 'Повтори в обратном порядке' : 'Repeat in reverse')
      : (langIndex === 0 ? 'Повтори' : 'Repeat')}
  </div>
)}
       {phase === 'memorize' && (
  <div style={problemCardStyle(theme, false)}>
    {charIndex < answer.length 
      ? answer[charIndex] 
      : '⏳'} {/* Show hourglass during retention delay */}
  </div>
)}
       {delayTimer && <div style={problemCardStyle(theme,true,statusColor)}>
        <p style={{fontSize:'22px',fontWeight:'bold',color:addScores > 0 ? Colors.get('maxValColor', theme) : Colors.get('minValColor', theme)}}>{addScores > 0  && <FaStar/>}{addScores > 0 ? addScores : (langIndex === 0 ? 'не верно' : 'wrong answer')}</p>
        <p style={{fontSize:'16px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{message}</p>
        </div>}
      </div>
     
      <div style={{fontSize:'34px',fontWeight:'bold',color:Colors.get('subText', theme),marginTop:'auto'}}>{handledInput}</div>
    </div>}
    {!isFinished && isStart && phase === 'recall' && <MentalInput setInput={setInput} type={type}/>}
    {isFinished &&  <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',width:'100%',height:'80%'}}>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('maxValColor', theme)}}><FaStar/>{scores}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('medium', theme)}}>{getTimeInfo(langIndex,time)}</div>
      {scores > record && <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('medium', theme)}}><FaMedal/>{langIndex === 0 ? 'Новый рекорд!' : 'New record!'}</div>}
      {scores <= record && <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'рекорд: ' + record : 'record: ' + record }</div>}
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'22px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{difficulty < 4 ? rightAnswers + ' / ' + 20 : rightAnswers}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{message}</div>
    </div>}
    {isFinished &&  <div style={styles(theme, show).controls}>
      <IoArrowBackCircle onClick={() => {setShow(false);setIsFinished(false);}} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
      </div>}
    </div>
  );
};
export default MentalGamePanel
const problemCardStyle = (theme,isAnswer,color) =>
(
   {
     display:'flex',
     flexDirection:'column',
     alignItems:'center',
     justifyContent:'center',
     width: "95vw",
     height: "16vh",
     marginTop:'20px',
     backgroundColor:Colors.get('bottomPanel', theme),
     boxShadow : isAnswer ? '0px 0px 9px 9px' +  color : '2px 2px' +  Colors.get('shadow', theme),
     borderRadius:'24px',
     fontSize:'39px',
     fontWeight:'bold',
     color:Colors.get('mainText', theme),
     alignContent:'center'
  }
)
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
  },
  playContainer :
   {
     display: "flex",
     flexDirection: "column",
     alignItems: "center",
     justifyContent:'flex-start',
     height: "50vh",
     bottom: '0',
     width: "100vw",
     
  },
})

const disclaimer = (langIndex) => {
  // 0 = ru, 1 = en
  if (langIndex === 0) {
    return "Отвечайте правильно и быстро, чтобы получить максимум очков. Каждая ошибка сбрасывает множитель подряд идущих ответов. За каждые 5 правильных ответов подряд множитель растёт (макс. ×1.5). На сложных уровнях последовательность нужно воспроизводить в обратном порядке — тренируйте рабочую память!";
  } else {
    return "Answer correctly and quickly to maximize your score. Every mistake resets your streak multiplier. For every 5 correct answers in a row, the multiplier increases (up to ×1.5). On harder levels, repeat the sequence in reverse — train your working memory under pressure!";
  }
};
const congratulations = (isEndlessMode, langIndex, score, rightAnswers, totalAnswers, isRecord, isRelaxMode = false) => {
  const percentage = totalAnswers > 0 ? Math.round((rightAnswers / totalAnswers) * 100) : 0;

  const isHigh = percentage >= 80;
  const isModerate = percentage >= 50 && !isHigh;
  const isLow = percentage < 50;

  const messages = {
    ru: {
      // === STANDARD MODE ===
      high: [
        `🎉 Отличная работа! ${rightAnswers}/${totalAnswers} (${percentage}%) — молодец!`,
        `✨ Потрясающе! Ты справился на ${percentage}%.`,
        `🔥 Ты набрал(а) ${score} очков — это впечатляет!`,
        `🚀 Вау! ${rightAnswers}/${totalAnswers} — ты в ударе!`,
        `💯 Идеально! Так держать! (${percentage}%)`
      ],
      moderate: [
        `🙂 Хорошая попытка! ${rightAnswers}/${totalAnswers} (${percentage}%).`,
        `🌱 Ты на правильном пути! Продолжай в том же духе.`,
        `📈 Набрано ${score} очков. Уже лучше!`,
        `👍 Половина и больше — это прогресс! (${percentage}%)`,
        `💪 Неплохо! С каждым разом будет лучше.`
      ],
      low: [
        `🤗 Ты старался(лась) — это главное. Попробуй ещё!`,
        `🌱 Не сдавайся! Каждая попытка — шаг вперёд.`,
        `🌤️ Сегодня не твой день, но завтра будет лучше!`,
        `🎯 Ты набрал(а) ${score} очков. Продолжай тренироваться!`,
        `🌱 Даже ${rightAnswers} правильных ответов — это начало!`
      ],
      record: [
        `🏆🔥 НОВЫЙ РЕКОРД! ${score} очков — поздравляем!`,
        `🎉✨ Ты установил(а) личный рекорд: ${rightAnswers}/${totalAnswers} (${percentage}%)!`,
        `🌟💥 Даже если было трудно — ты побил(а) рекорд! Молодец!`
      ],

      // === ENDLESS MODE ===
      endless_any: [
        `🛡️ Ты выстоял(а) ${rightAnswers} раундов — уважение!`,
        `⚡ Выжил(а) ${rightAnswers} ходов подряд — круто!`,
        `🎯 Без единой ошибки до ${rightAnswers} — это стойкость!`,
        `🧠 Точность на ${rightAnswers} шагах — впечатляет!`,
        `🔥 Ты набрал(а) ${score} очков в режиме выживания!`
      ],
      endless_record: [
        `🏆🔥 НОВЫЙ РЕКОРД В РЕЖИМЕ ВЫЖИВАНИЯ: ${rightAnswers} раундов!`,
        `🎉✨ Ты установил(а) личный рекорд: ${rightAnswers} без единой ошибки!`,
        `🌟💥 В Endless-режиме — а ты всё равно побил(а) рекорд! Молодец!`,
        `🛡️👑 Новый максимум: ${score} очков в режиме "одна ошибка — конец"!`
      ],

      // === RELAX MODE ===
      relax_any: [
        `🧘‍♀️ Отлично поработал(а) в спокойном режиме!`,
        `🌼 Ты решил(а) ${totalAnswers} задач — прекрасная тренировка!`,
        `✨ Спокойствие и внимание — залог прогресса. Молодец!`,
        `🌱 ${rightAnswers} правильных ответов — рост налицо!`,
        `🌤️ Хороший темп, без спешки. Так держать!`
      ],
      relax_record: [
        `🌟 Новый личный максимум — даже в спокойном режиме!`,
        `🧘‍♂️🏆 Ты набрал(а) ${score} очков в Relax-режиме — поздравляем!`,
        `💫 Даже без таймера — ты улучшил(а) свой результат. Респект!`
      ]
    },
    en: {
      // === STANDARD MODE ===
      high: [
        `🎉 Awesome! ${rightAnswers}/${totalAnswers} (${percentage}%) — well done!`,
        `✨ Outstanding! You scored ${percentage}%.`,
        `🔥 You got ${score} points — impressive!`,
        `🚀 Wow! ${rightAnswers}/${totalAnswers} — you’re on fire!`,
        `💯 Perfect! Keep it up! (${percentage}%)`
      ],
      moderate: [
        `🙂 Good effort! ${rightAnswers}/${totalAnswers} (${percentage}%).`,
        `🌱 You're making progress! Keep going.`,
        `📈 You scored ${score} points. Getting better!`,
        `👍 More than half right — that’s growth! (${percentage}%)`,
        `💪 Nice try! You’ll do even better next time.`
      ],
      low: [
        `🤗 You gave it your best — that matters most. Try again!`,
        `🌱 Don’t give up! Every attempt brings you closer.`,
        `🌤️ Not your best round, but tomorrow’s a new chance!`,
        `🎯 You earned ${score} points. Keep practicing!`,
        `🌱 Even ${rightAnswers} correct answers is a start!`
      ],
      record: [
        `🏆🔥 NEW RECORD! ${score} points — congratulations!`,
        `🎉✨ You set a personal best: ${rightAnswers}/${totalAnswers} (${percentage}%)!`,
        `🌟💥 Even on a tough day — you broke your record! Amazing!`
      ],

      // === ENDLESS MODE ===
      endless_any: [
        `🛡️ You survived ${rightAnswers} rounds — respect!`,
        `⚡ Lasted ${rightAnswers} turns without a single mistake — awesome!`,
        `🎯 Perfect accuracy for ${rightAnswers} problems — impressive!`,
        `🧠 Sharp focus through ${rightAnswers} challenges — well done!`,
        `🔥 You scored ${score} points in Endless Mode!`
      ],
      endless_record: [
        `🏆🔥 NEW ENDLESS MODE RECORD: ${rightAnswers} rounds!`,
        `🎉✨ Personal best: ${rightAnswers} flawless answers in a row!`,
        `🌟💥 You broke your record — in Endless Mode! Amazing!`,
        `🛡️👑 New high: ${score} points in "one mistake = game over" mode!`
      ],

      // === RELAX MODE ===
      relax_any: [
        `🧘‍♀️ Great job practicing in Relax Mode!`,
        `🌼 You solved ${totalAnswers} problems — wonderful focus!`,
        `✨ Calm and steady wins the race. Well done!`,
        `🌱 ${rightAnswers} correct answers — you're growing!`,
        `🌤️ A peaceful pace, great accuracy. Keep it up!`
      ],
      relax_record: [
        `🌟 New personal best — even in Relax Mode!`,
        `🧘‍♂️🏆 You scored ${score} points in Relax Mode — congrats!`,
        `💫 No timer, no stress — and still a new record! Amazing!`
      ]
    }
  };

  const lang = langIndex === 0 ? messages.ru : messages.en;

  let candidates = [];

  if (isRelaxMode) {
    // In Relax Mode, even low accuracy is fine — always encouraging
    if (isRecord) {
      candidates = [...lang.relax_record];
    } else {
      candidates = [...lang.relax_any];
    }
  } else if (isEndlessMode) {
    // Endless: totalAnswers === rightAnswers (no mistakes allowed)
    if (isRecord) {
      candidates = [...lang.endless_record];
    } else {
      candidates = [...lang.endless_any];
    }
  } else {
    // Standard mode (timed or regular)
    if (isRecord) {
      candidates = [...lang.record];
    } else if (isHigh) {
      candidates = [...lang.high];
    } else if (isModerate) {
      candidates = [...lang.moderate];
    } else {
      candidates = [...lang.low];
    }
  }

  if (candidates.length === 0) {
    return langIndex === 0 ? 'Хорошо! 😊' : 'Good job! 😊';
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};
function playVibro(type){
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred(type);
}
function interpolateColor(color1, color2, factor) {
  if (!color1 || !color2) return color1 || color2 || '#000000';
  // Ensure factor is clamped between 0 and 1
  factor = Math.max(0, Math.min(1, factor));

  // Remove '#' if present
  color1 = color1.replace('#', '');
  color2 = color2.replace('#', '');

  // Parse RGB components
  const r1 = parseInt(color1.slice(0, 2), 16);
  const g1 = parseInt(color1.slice(2, 4), 16);
  const b1 = parseInt(color1.slice(4, 6), 16);

  const r2 = parseInt(color2.slice(0, 2), 16);
  const g2 = parseInt(color2.slice(2, 4), 16);
  const b2 = parseInt(color2.slice(4, 6), 16);

  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Convert back to hex and ensure two digits
  return `rgb(${r}, ${g}, ${b})`;
}
function getPraise(langIndex) {
  const en = [
    "Great!",
    "Perfect!",
    "Yes!",
    "Exactly!",
    "Awesome!",
    "Brilliant!",
    "Spot on!",
    "Well done!",
    "Nailed it!",
    "Correct!"
  ];

  const ru = [
    "Отлично!",
    "Прекрасно!",
    "Верно!",
    "Точно!",
    "Замечательно!",
    "Идеально!",
    "Правильно!",
    "Молодец!",
    "Точно в цель!",
    "Без ошибок!"
  ];

  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
}
function getSupport(langIndex) {
  const en = [
    "Close!",
    "Almost!",
    "Nearly!",
    "Keep going!",
    "Try again!",
    "So close!",
    "Good attempt!",
    "Not quite!",
    "One more try!",
    "You're getting there!"
  ];

  const ru = [
    "Рядом!",
    "Почти!",
    "Еще чуть-чуть!",
    "Продолжай!",
    "Попробуй еще!",
    "Очень близко!",
    "Хорошая попытка!",
    "Не совсем…",
    "Почти получилось!",
    "Ты на правильном пути!"
  ];

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