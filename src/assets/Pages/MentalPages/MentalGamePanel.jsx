import { useEffect, useState} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import Colors from "../../StaticClasses/Colors"
import {theme$,lang$,fontSize$} from '../../StaticClasses/HabitsBus';
import { getProblem,getPoints ,hasStreak} from './MathProblems';
import {FaStar,FaFire} from 'react-icons/fa';
import {IoPlayCircle,IoReloadCircle,IoArrowBackCircle, IoPauseCircle} from "react-icons/io5"
import MentalInput from './MentalInput';
import { quickMathCategories } from './MentalHelper';

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
  
  const [seconds, setSeconds] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [finishMessage, setFinishMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  //timer
  const [timer,setTimer] = useState(false);
  const [progress,setProgress] = useState(0);
  const [currTimer,setCurrTimer] = useState(0);

  const [scores, setScores] = useState(0);

  const [stage, setStage] = useState(1);
  const [streakLength, setStreakLength] = useState(0);
  const [problem,setProblem] = useState('');
  const [answer,setAnswer] = useState('');
  
  //input
  useEffect(() => {
    if (input.length === 1)setHandledInput(prev => prev.length < 6 ? prev + input : prev);
    else if (input.length === 2)setHandledInput(prev => prev.length > 0 ? prev.slice(0,prev.length - 1) : '');
    else if (input.length === 3) handleAnswer();
    setInput('');
  }, [input]);

  //timer
  useEffect(() => {
    if (!timer || !isStart) return;
    const startTime = Date.now() - currTimer; // restore actual start time of rest
    const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const newTimerValue = Math.min(elapsed, maxTimer);
    setCurrTimer(newTimerValue);
    setProgress((newTimerValue / maxTimer) * 100);
      if (newTimerValue >= maxTimer - 500 ) {
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

  const handleStart = () => {
    setNewProblem();
    setIsStart(true);
    setTimer(true);
    setIsRunning(true);
    setIsPaused(false);
  };

  function setNewProblem(){
    const newProblem = getProblem(type,difficulty,stage);
    setProblem(newProblem[0]);
    setAnswer(newProblem[1]);
  }
   
  const handleAnswer = () => {
    if (handledInput.length  > 0) {
      const points = getPoints(type, difficulty, stage, currTimer, answer, handledInput, streakLength);
      setScores(prev => prev + points);
      setNewProblem();
      setHandledInput('');
      setStreakLength(prev => hasStreak(type,answer, handledInput) ? prev + 1 : 0);
      setCurrTimer(0);
      setStage(prev => prev + 1 < 20 ? prev + 1 : 20);
      if (stage === 20) onFinishSession();
    }
    else {
      setNewProblem();
      setIsStart(true);
      setTimer(true);
    }
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
  const message = congratulations(langIndex); // 0 = RU, 1 = EN
  setIsFinished(true);
  setIsStart(false);
  setTimer(false);
 };
 
  return (
    <div style={styles(theme, show).container}>
      {!isStart && !showStartTimer && <div style={{display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',width:'100%',height:'80%'}}>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'18px',fontWeight:'bold',color:Colors.get('mainText', theme)}}>{quickMathCategories[difficulty].level[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('subText', theme)}}>{quickMathCategories[difficulty].description[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? 'Сложность: ' : 'Difficulty: ') +quickMathCategories[difficulty].difficulty[langIndex]}</div>
      <div style={{display:'flex',alignItems:'center',marginTop:'20px',justifyContent:'center',fontSize:'15px',color:Colors.get('subText', theme)}}>{(langIndex === 0 ? 'Ограничение времени: ' : 'Time limit: ') + quickMathCategories[difficulty].timeLimitSec}</div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'20px',fontSize:'15px',color:Colors.get('subText', theme)}}>{(langIndex === 0 ? 'Операции: ' : 'Operations: ') + quickMathCategories[difficulty].operations}</div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'50px',fontSize:'12px',color:Colors.get('subText', theme)}}>{disclaimer(langIndex)}</div>
      </div>}
      {!isStart && !showStartTimer &&  <div style={styles(theme, show).controls}>
      
      <IoArrowBackCircle onClick={() => setShow(false)} style={{fontSize:'60px',color:Colors.get('close', theme)}}/>
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
      <div style={{...styles(theme, show).controls,width:'60%',marginLeft:'25px',gap:'20px',marginTop:'5px',marginBottom:'25px',marginRight:'auto'}}>
      <IoArrowBackCircle onClick={() => setIsStart(false)} style={{fontSize:'25px',color:Colors.get('close', theme)}}/>
      {isPaused ? <IoPlayCircle onClick={handleResume} style={{fontSize:'25px',color:Colors.get('play', theme)}} /> : <IoPauseCircle onClick={handlePause} style={{fontSize:'25px',color:Colors.get('pause', theme)}} />} 
      <IoReloadCircle onClick={handleReload} style={{fontSize:'25px',color:Colors.get('reload', theme)}}/>
      </div>
      <div style={{display:'flex',width:'86%',flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>
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
      
      <div style={{ width: '86%', height: '18px', position: 'relative',marginTop:'66px' }}>
      <svg width="100%" height="18" viewBox="0 0 100 18" preserveAspectRatio="none" style={{ display: 'block' }}>
      {/* Background track */}
      <rect x="0" y="0" width="100" height="18" fill={Colors.get('bottomPanel', theme)}/>
      {/* Progress fill */}
      <rect x="0" y="0" width={progress} height="18"  fill={Colors.get('skipped', theme)} /></svg>
        <div style={{position:'relative',top:'-20px',color:Colors.get('subText', theme),marginBottom: '80px'}}>{Math.floor((maxTimer - currTimer)/1000 )}</div>
      </div>


      <div style={styles(theme).problemCard}>
        {problem}
      </div>
     
      <div style={{fontSize:'34px',fontWeight:'bold',color:Colors.get('subText', theme),marginTop:'auto'}}>{handledInput}</div>
    </div>}
    {!isFinished && isStart && <MentalInput setInput={setInput} type={type}/>}
    </div>
  );
};
export default MentalGamePanel

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
  problemCard :
   {
     width: "95%",
     height: "30%",
     marginTop:'20px',
     backgroundColor:Colors.get('bottomPanel', theme),
     boxShadow : '2px 2px' +  Colors.get('shadow', theme),
     borderRadius:'24px',
     fontSize:'39px',
     fontWeight:'bold',
     color:Colors.get('mainText', theme),
     alignContent:'center'
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
