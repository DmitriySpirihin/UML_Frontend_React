import React, {useState,useEffect,useRef} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,trainInfo$} from '../../StaticClasses/HabitsBus'
import {findPreviousSimilarExercise} from '../../StaticClasses/TrainingLogHelper'
import {FaTrash,FaPencilAlt,FaFlagCheckered,FaFlag} from 'react-icons/fa'
//timer
import TimerIcon from '@mui/icons-material/TimerTwoTone';
import TimerOffIcon from '@mui/icons-material/TimerOffTwoTone';
import Slider from '@mui/material/Slider';

const timerSound = new Audio('Audio/Timer.wav');

const TrainingCurrent = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);
    const [trainInfo,setTrainInfo] = useState(trainInfo$);
    const [session, setSession] = useState({});
    const [usePrev, setUsePrev] = useState(true);
    const [program, setProgram] = useState(null);
    const [dayIndex, setDayIndex] = useState(null);
    //info
    const [tonnage,setTonnage] = useState(0);
    const [duration,setDuration] = useState(0);

    //timer
    const [timer,setTimer] = useState(false);
    const [maxTimer,setMaxTimer] = useState(120000);
    const [time,setTime] = useState(3000);
    const [progress,setProgress] = useState(0);
  
    // subscriptions
    useEffect(() => {
      const subscription = theme$.subscribe(setthemeState); 
      const subscription2 = lang$.subscribe((lang) => {
      setLangIndex(lang === 'ru' ? 0 : 1);
      }); 
      const subscription3 = fontSize$.subscribe((fontSize) => {
      setFSize(fontSize);
      });
      const subscription4 = trainInfo$.subscribe((value) => {
        const session = AppData.trainingLog?.[value.dayKey]?.[value.dInd] || null;
        setProgram(AppData.programs.find(p => p.id === session.programId));
        setDayIndex(value.dInd);
        setTonnage(session.tonnage);
        setDuration(session.duration);
        setSession(session); 
        setTrainInfo(value);
      });
      return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      subscription4.unsubscribe();
      }
      }, []); 
        
       // render    
       return (
           <div style={styles(theme).container}>
             <div style={styles(theme).panel}>
              {/*     timer     */}
              
              <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',height:'25vw',borderBottomRightRadius:'24px',borderBottomLeftRadius:'24px',width:'100%',alignItems:'center',backgroundColor: Colors.get('bottomPanel', theme)}}>
                <div style={styles(theme,fSize).text}>{program?.name[langIndex]}</div>
               <div style={{...styles(theme,fSize).subtext,marginBottom:'15px'}}>{(trainInfo.mode === 'new' ? '⏳ ' : '✅ ') + (program?.schedule[dayIndex].name[langIndex])}</div>
                <div style={{display:'flex',width:'100%',height:'15vw',justifyContent:'flex-start',alignItems:'center',borderTop:`1px solid ${Colors.get('border', theme)}`}}>
                  <div style={{...styles(theme,fSize).subtext,marginLeft:'12px'}}>{Math.round(duration / 60000) + (langIndex === 0 ? ' мин' : ' min')}</div>
                  <div style={{...styles(theme,fSize).subtext,marginLeft:'12px'}}>{(tonnage * 0.001) + (langIndex === 0 ? ' тонн' : ' tons')}</div>
                  {session?.completed && <div style={{marginLeft:'auto',display:'flex',alignItems:'center'}}>
                    <ParsedTime time={time} maxTime={maxTimer} theme={theme}/>
                    <TimerIcon style={{fontSize:'24px',color:Colors.get('icons', theme),marginRight:'19px'}}/>
                    <FaFlagCheckered style={{fontSize:'24px',color:Colors.get('icons', theme),marginRight:'19px'}}/>
                  </div>}
                </div>
              </div> 
                {/*     header     */}
               
               <div style={styles(theme).scrollView}>
               {session?.exercises && Object.keys(session.exercises).length > 0 &&
               <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column',width:'95%'}}>
               {Object.entries(session.exercises).map(([exId, exercise]) => {
                const exerciseName = AppData.exercises[exId].name[langIndex];
                return (
                 <div key={exId} style={{ display: 'flex', flexDirection: 'column' }}>
                 {/* Exercise name */}
                <div style={{ ...styles(theme, fSize).text,marginLeft:'12px',fontWeight:'bold', marginBottom: '4px' }}>{exerciseName}</div>
                 {/* Sets list */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <div style={{display: 'flex',height:'25px',justifyContent: 'flex-start',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                      <div style={{...styles(theme,fSize).subtext,width:'17%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Подходы' : 'Sets'}</div>
                      <div style={{...styles(theme,fSize).subtext,width:'17%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Повторы' : 'Reps'}</div>
                       <div style={{...styles(theme,fSize).subtext,width:'17%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Вес' : 'Weight'}</div>
                   </div>
                   {exercise.sets.map((set, setIndex) => (
                   <div key={setIndex} style={{display: 'flex',height:'25px',justifyContent: 'flex-start',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                      <div style={numStyle(theme,set.type)}>{setIndex + 1}</div>
                      <div style={numStyle(theme,set.type)}>{set.reps}{usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.reps} isReps={true} theme={theme} />}</div>
                      <div style={numStyle(theme,set.type)}>{set.weight}{usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.weight} isReps={false} theme={theme} />}</div>
                      <div style={{marginLeft:'auto'}}>
                        <FaPencilAlt style={styles(theme).icon}/>
                        <FaTrash style={styles(theme).icon}/>
                      </div>
                   </div>
                ))}
              </div>
            </div>
            );
           })}
          </div>}
          </div>
             </div>
           </div>
       )
}

export default TrainingCurrent

const numStyle = (theme,type) =>
({
  fontSize:'16px',
  fontWeight:'bold',
  color:type === 0 ? Colors.get('trainingIsolatedFont', theme) : Colors.get('trainingBaseFont', theme),
  width:'17%',
  borderRight:`1px solid ${Colors.get('border', theme)}`
})
const spanStyle = (theme,isMore) =>
({
  fontSize:'10px',
  fontStyle:'italic',
  color:isMore ? Colors.get('done', theme) : Colors.get('skipped', theme)
})

const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'absolute',
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     top:'14vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  panel :
      {
    display:'flex',
    flexDirection:'column',
    width: "100%",
    alignItems: "center",
    justifyContent: "start",
    
  },
  scrollView:
  {
    display:'flex',
    flexDirection:'column',
    overflowY:'scroll',
    width:'100%',
    height:'65vh',
    
  },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom:'5px'
  },
  subtext :
  {
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
     fontSize:'14px',
     color:Colors.get('icons', theme),
     marginRight:'18px'
  }
})

function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}

function Difference({exId,setIndex,beforeDate,value,isReps,theme}){
   const previousSet = findPreviousSimilarExercise(exId,setIndex,beforeDate,AppData.trainingLog);
   let diffString = '';
   let diff = 0;
   if(previousSet !== null){
    diff = value - (isReps ? previousSet.reps : previousSet.weight);
    if(diff !== 0) diffString = `${diff > 0 ? '+' : ''}${diff}`;
   }
   return (
      <span style={spanStyle(theme,diff > 0)}>{diffString}</span>
   )
}
function ParsedTime({ time, maxTime, theme }) {
  const elapsedOrRemaining = maxTime - time;
  const minutes = Math.floor(elapsedOrRemaining / 60000);
  const seconds = Math.floor((elapsedOrRemaining % 60000) / 1000);
  const timeString = elapsedOrRemaining > 0 
    ? `${minutes > 0 ? minutes + ':' : ''}${seconds.toString().padStart(2, '0')}`
    : '';
  const lastSecondRef = useRef(seconds);
  const [isPulsing, setIsPulsing] = useState(false);
  const percent = maxTime > 0 ? (time / maxTime) * 100 : 0;
  useEffect(() => {
    if (seconds !== lastSecondRef.current) {
      setIsPulsing(true);
      lastSecondRef.current = seconds;
      const timer = setTimeout(() => {
        setIsPulsing(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [seconds]);
  if (time <= 0 || elapsedOrRemaining <= 0) return null;
  const baseFontSize = '15px';
  const animatedFontSize = isPulsing ? '18px' : baseFontSize; // or use transform for smoother perf
  const color = 
    percent < 50 && percent > 30
      ? Colors.get('trainingIsolatedFont', theme)
      : percent < 30
        ? Colors.get('trainingBaseFont', theme)
        : Colors.get('subText', theme);
  return (
    <div
      style={{
        color,
        fontSize: animatedFontSize,
        fontWeight: 'bold',
        transition: 'font-size 0.2s ease-out', // smooth shrink-back
        lineHeight: 1,
      }}
    >
      {timeString}
    </div>
  );
}