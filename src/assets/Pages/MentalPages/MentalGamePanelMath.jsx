import { useEffect, useState} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import {theme$,lang$,fontSize$} from '../../StaticClasses/HabitsBus';
import { getProblem,getPoints ,hasStreak,getPrecision} from './MathProblems';
import BreathAudio from "../../Helpers/BreathAudio"
import {FaStar,FaFire,FaMedal,FaStopwatch} from 'react-icons/fa';
import {IoPlayCircle,IoReloadCircle,IoArrowBackCircle, IoPauseCircle} from "react-icons/io5"
import MentalInput from './MentalInput';
import { quickMathCategories} from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanel = ({ show,type,difficulty,maxTimer,setShow }) => {
   

  const [theme, setthemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]); 
  const [input, setInput] = useState('');
  const [handledInput, setHandledInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isStart, setIsStart] = useState(false);
  const [showStartTimer, setShowStartTimer] = useState(false);
  const [addValue,setAddValue] = useState(0);
  
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  //audio
  const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

  //cards
  const cards = [ { id: 0, text: "aaaabb" }, { id: 1, text: "aaaaa" },];

  //timer
  const [timer,setTimer] = useState(false);
  const [progress,setProgress] = useState(0);
  const [currTimer,setCurrTimer] = useState(0);
  //delay
  const [delay,setDelay] = useState(0);
  const [delayTimer,setDelayTimer] = useState(false);

  const [scores, setScores] = useState(0);

  const [stage, setStage] = useState(1);
  const [streakLength, setStreakLength] = useState(0);
  const [problem,setProblem] = useState('');
  const [answer,setAnswer] = useState('');
  //answer handlers
  const [message, setMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [addScores,setAddScores] = useState(0);
  //statistics
  const [rightAnswers,setRightAnswers] = useState(0);
  const [record,setRecord] = useState(AppData.mentalRecords[type][difficulty]);
  const [time,setTime] = useState(0);
  
  //input
  useEffect(() => {
    if (input.length === 1)setHandledInput(prev => prev.length < 6 ? prev + input : prev);
    else if (input.length === 2)setHandledInput(prev => prev.length > 0 ? prev.slice(0,prev.length - 1) : '');
    else if (input.length === 3) handleAnswer();
    setInput('');
  }, [input]);
  // time
  useEffect(() => {
  let intervalId = null;
  if (isRunning) {
    intervalId = setInterval(() => {
      setTime(prev => prev + 100); 
    }, 100);
  }
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
}, [isRunning]);
  //timer
  useEffect(() => {
    if (!timer || !isStart || difficulty === 5) {
      setProgress(0);
      setCurrTimer(0);
      return;
    }
    const startTime = Date.now() - currTimer; // restore actual start time of rest
    const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const newTimerValue = Math.min(elapsed, maxTimer);
    setCurrTimer(newTimerValue);
    setProgress((newTimerValue / (maxTimer - addValue)) * 100);
      if (newTimerValue >= (maxTimer - addValue) - 500 ) {
        setTimer(false);
        handleAnswer();
      }
    }, 50);
  
    return () => clearInterval(interval);
  }, [timer, isStart, maxTimer, currTimer]);

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
  //delay
  useEffect(() => {
    if (!delayTimer) return;

    const intervalId = setInterval(() => {
      setDelay(prev => {
        if (prev >= 900) {
          // Final tick: cleanup and trigger start
          clearInterval(intervalId);
          setDelayTimer(false);
          setScores(prev => prev + addScores / 2);
          setAddScores(0);
          setTimer(true);
          setDelay(0);
          return 0;
        }
        return prev + 100;
      });
    }, 100);

    // Cleanup on unmount or when showStartTimer becomes false
    return () => {
      clearInterval(intervalId);
    };
  }, [delayTimer,delay]);

  const handleStart = () => {
    initAudio();
    setNewProblem();
    setIsStart(true);
    setTimer(true);
    setIsRunning(true);
    setIsPaused(false);
    setTime(0);
  };

  function setNewProblem(){
    const newProblem = getProblem(type,difficulty,stage);
    setProblem(newProblem[0]);
    setAnswer(newProblem[1]);
  }
   
  const handleAnswer = () => {
    setTimer(false);
    
      const points = getPoints(type, difficulty, stage, currTimer, answer, handledInput, streakLength);
      const precision = getPrecision(type, answer, handledInput);
      playVibro(precision === 0 ? 'light':'medium');
      let addmessage = '';
      if (precision === 0) {
        addmessage = getPraise(langIndex);
        setRightAnswers(prev => prev + 1);
      }
      else if (precision < 0.15) addmessage = getSupport(langIndex);
      else addmessage = langIndex === 0 ? 'Правильный ответ: ' + answer : 'Correct answer: ' + answer;
      const col = precision === 0 ? Colors.get('maxValColor', theme) : precision < 0.15 ? Colors.get('difficulty2', theme) : Colors.get('minValColor', theme);
      setStatusColor(col);
      setMessage(addmessage);
      setAddScores(points);
      setNewProblem();
      setHandledInput('');
      setStreakLength(prev => hasStreak(type,answer, handledInput) ? prev + 1 : 0);
      setStage(prev => prev + 1 < 20 ? prev + 1 : 20);
      precision === 0 ? playRight() : playWrong();
      if (stage === 20) onFinishSession();
      if (difficulty === 4 && stage%5 === 0) {
        setAddValue(prev => prev + 2000);
      }
      if (difficulty === 4 && precision > 0.15) {
        onFinishSession();
      }
    
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
    
  };

  const onFinishSession = () => {
  const message = congratulations(difficulty === 4, difficulty === 5,langIndex, scores + addScores,rightAnswers,20,false) // 0 = RU, 1 = EN
  setIsRunning(false);
  setMessage(message);
  setIsFinished(true);
  setIsStart(false);
  setTimer(false);
 };
 const onFinish = () => {
  if (scores > record) {
    setRecord(scores);
    AppData.mentalRecords[type][difficulty] = scores;
  }
  setScores(0);
  setAddValue(0);
  setStage(1);
  setRightAnswers(0);
  setIsFinished(false);
  setShow(false);
 };
 
  return (
    <div style={styles(theme, show).container}>
      {!isStart && !showStartTimer && !isFinished && <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',width:'100%',height:'80%'}}>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{quickMathCategories[difficulty].level[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('subText', theme)}}>{quickMathCategories[difficulty].description[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? 'Сложность: ' : 'Difficulty: ') +quickMathCategories[difficulty].difficulty[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('subText', theme)}}>{(langIndex === 0 ? 'Ограничение времени: ' : 'Time limit: ') + quickMathCategories[difficulty].timeLimitSec}</div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'20px',fontSize:'15px',color:Colors.get('subText', theme)}}>{(langIndex === 0 ? 'Операции: ' : 'Operations: ') + quickMathCategories[difficulty].operations}</div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'50px',fontSize:'12px',color:Colors.get('subText', theme)}}>{disclaimer(langIndex)}</div>
      </div>}
      {!isStart && !showStartTimer && !isFinished && <div style={styles(theme, show).controls}>
      
      <IoArrowBackCircle onClick={() => onFinish()} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
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
      <IoArrowBackCircle onClick={() => setIsStart(false)} style={{fontSize:'25px',color:Colors.get('close', theme)}}/>
      {isPaused ? <IoPlayCircle onClick={handleResume} style={{fontSize:'25px',color:Colors.get('play', theme)}} /> : <IoPauseCircle onClick={handlePause} style={{fontSize:'25px',color:Colors.get('pause', theme)}} />} 
      <IoReloadCircle onClick={handleReload} style={{fontSize:'25px',color:Colors.get('reload', theme)}}/>
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
        {difficulty > 3 ? stage :stage + '/ 20'}
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',fontWeight:'bold',color:Colors.get('maxValColor', theme)}}>
        <FaStar/>
        {scores}
      </div>
      </div>
      
      <div style={{ width: '86%', height: '18px', position: 'relative',marginTop:'66px' }}>
      <svg width="100%" height="18" viewBox="0 0 100 18" preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* Background track */}
      <rect x="0" y="0" width="100" height="18" fill={Colors.get('bottomPanel', theme)}/>
      {/* Progress fill */}
      <rect x="0" y="0" width={progress} height="18"  fill={interpolateColor(Colors.get('done', theme), Colors.get('skipped', theme),(progress / 100))} /></svg>
        <div style={{position:'relative',top:'-20px',color:Colors.get('subText', theme),marginBottom: '80px'}}>{Math.floor(((maxTimer - addValue) - currTimer)/1000 )}</div>
      </div>

      <div>
       {!delayTimer && <div style={problemCardStyle(theme,false)}>{problem}</div>}
       {delayTimer && <div style={problemCardStyle(theme,true,statusColor)}>
        <p style={{fontSize:'22px',fontWeight:'bold',color:addScores > 0 ? Colors.get('maxValColor', theme) : Colors.get('minValColor', theme)}}>{addScores > 0  && <FaStar/>}{addScores > 0 ? addScores : (langIndex === 0 ? 'не верно' : 'wrong answer')}</p>
        <p style={{fontSize:'16px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{message}</p>
        </div>}
      </div>
     
      <div style={{fontSize:'34px',fontWeight:'bold',color:Colors.get('subText', theme),marginTop:'auto'}}>{handledInput}</div>
    </div>}
    {!isFinished && isStart && <MentalInput setInput={setInput} type={type}/>}

    {isFinished &&  <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',width:'100%',height:'80%'}}>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('maxValColor', theme)}}><FaStar/>{scores}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('medium', theme)}}>{getTimeInfo(langIndex,time)}</div>
      {scores > record && <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('medium', theme)}}><FaMedal/>{langIndex === 0 ? 'Новый рекорд!' : 'New record!'}</div>}
      {scores <= record && <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'28px',fontWeight:'bold',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'рекорд: ' + record : 'record: ' + record }</div>}
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'22px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{difficulty < 4 ? rightAnswers + ' / ' + 20 : rightAnswers}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{message}</div>
    </div>}
    {isFinished &&  <div style={styles(theme, show).controls}>
      <IoArrowBackCircle onClick={() => {onFinish()}} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
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
    return "Чтобы получить больше очков, отвечайте правильно и как можно быстрее. Каждая ошибка сбрасывает множитель. За каждые 5 правильных ответов подряд множитель повышается, достигая максимума ×1.5.";
  } else {
    return "To earn more points, answer correctly and as quickly as possible. Every mistake resets your multiplier. For every 5 correct answers in a row, your multiplier increases—up to a maximum of ×1.5.";
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