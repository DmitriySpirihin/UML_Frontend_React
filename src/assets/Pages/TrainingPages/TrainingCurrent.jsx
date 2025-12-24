import React, {useState,useEffect,useRef} from 'react'
import { AppData,UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,trainInfo$,setPage} from '../../StaticClasses/HabitsBus'
import {addExerciseToSchedule} from '../../Classes/TrainingData.jsx'
import {findPreviousSimilarExercise, finishSession, addExerciseToSession,
   removeExerciseFromSession, addSet, finishExercise, redactSet,getAllReps,getTonnage,getMaxOneRep,getAllSets} from '../../StaticClasses/TrainingLogHelper'
import {FaTrash,FaPencilAlt,FaFlagCheckered,FaFlag,FaInfo,FaPlusCircle} from 'react-icons/fa'
import {FaRegCircleCheck,FaRegCircle,FaPlus,FaMinus,FaStopwatch,FaCalculator} from 'react-icons/fa6'
import {MdClose,MdDone,MdFitnessCenter} from 'react-icons/md'
import MyNumInput from '../../Helpers/MyNumInput'
import {useLongPress} from '../../Helpers/LongPress'
import Stopwatch from '../../Helpers/StopWatch'
import PlatesCalculator from '../../Helpers/PlatesCalculator'
import TrainingExercise from './TrainingExercise'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
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
    const [usePrev, setUsePrev] = useState(false);
    const [program, setProgram] = useState(null);
    const [dayIndex, setDayIndex] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    //info
    const [tonnage,setTonnage] = useState(0);
    const [allReps,setAllReps] = useState(0);

    // prev
    const [currentSet,setCurrentSet] = useState(3);
    const [currentExId,setCurrentExId] = useState('3');
    const [reps,setReps] = useState(10);
    const [weight,setWeight] = useState(0);
    const [exTime,setExTime] = useState(0);
    const [isWarmUp,setIsWarmUp] = useState(true);
    const [newRmRecords, setNewRmRecords] = useState([]);
    // additionl panels
    const [showConfirmPanel,setShowConfirmPanel] = useState(false);
    const [showConfirmExercisePanel,setShowConfirmExercisePanel] = useState(false);
    const [showFinishPanel,setShowFinishPanel] = useState(false);
    const [showRedactSetPanel,setShowRedactSetPanel] = useState(false);
    const [showExerciseList,setShowExerciseList] = useState(false);
    const [showAddNewSetPanel,setShowAddNewSetPanel] = useState(false);
    const [showInfoPanel,setShowInfoPanel] = useState(false);
    const [stopWatchPanel,setStopWatchPanel] = useState(false);
    const [premiumMiniPage,setPremiumMiniPage] = useState(false);
    const [exerciseToRemove,setExerciseToRemove] = useState(null);
    const [showPlatesCalculator,setShowPlatesCalculator] = useState(false);
    const [showSuggestionToAdd,setShowSuggestionToAdd] = useState(false);
    const [showStarategyPanel, setShowStarategyPanel] = useState(false);
    const [addExId,setAddExId] = useState(0);
    const [sets, setSets] = useState(3);
    const [currentRepMin, setCurrentRepMin] = useState(4);
    const [currentRepMax, setCurrentRepMax] = useState(6);
    const [strategy, setStrategy] = useState(0);
    //timer
    const [needTimer,setNeedTimer] = useState(false);
    const [timer,setTimer] = useState(false);
    const [maxTimer,setMaxTimer] = useState(120000);
    const [currTimer,setCurrTimer] = useState(0);
    const [time,setTime] = useState(Date.now());
    const [progress,setProgress] = useState(0);
    const [duration,setDuration] = useState(0);
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
        setProgram(AppData.programs[session.programId] || null);
        setDayIndex(session.dayIndex);
        setTonnage(session.tonnage);
        setSession(session); 
        setTrainInfo(value);
        setIsCompleted(session.completed);
        setTime(session.startTime);
        setDuration(Date.now() - session.startTime);
      });
      return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      subscription4.unsubscribe();
      }
      }, []); 
    //timers
useEffect(() => {
  if (isCompleted) return;
  const interval = setInterval(() => {
    setDuration(Date.now() - time);
  }, 500);

  return () => clearInterval(interval);
}, [time]);
useEffect(() => {
  if (!timer || isCompleted) return;
  const startTime = Date.now() - currTimer; // restore actual start time of rest
  const interval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const newTimerValue = Math.min(elapsed, maxTimer);
  setCurrTimer(newTimerValue);
  setProgress((newTimerValue / maxTimer) * 100);
    if (newTimerValue >= maxTimer) {
      setTimer(false);
      timerSound.play();
      setCurrTimer(0);
      setProgress(0);
    }
  }, 50);

  return () => clearInterval(interval);
}, [timer, isCompleted, maxTimer, currTimer]);
// long press bibdings
const bindRepsMinus = useLongPress(() => setReps(prev => prev - 1 > 1 ? prev - 1 : 1));
const bindRepsPlus = useLongPress(() => setReps(prev => prev + 1));
const bindWeightMinus = useLongPress(() => setWeight(prev => prev - 0.25 > 0.25 ? prev -0.25 : 0.25));
const bindWeightPlus = useLongPress(() => setWeight(prev => prev + 0.25));
const bindExTimeMinus = useLongPress(() => setExTime(prev => prev - 10000 > 0 ? prev - 10000 : 0));
const bindExTimePlus = useLongPress(() => setExTime(prev => prev + 10000));

function needPrev(need){
  if(!UserData.hasPremium){
    setPremiumMiniPage(true);
  }else{
    setUsePrev(need);
  }
}    

const onNewset = (exId,setInd) => {
  setCurrentExId(exId,setInd);
  setCurrentSet(setInd);
  setShowAddNewSetPanel(true);
}
const addset = () => {
   addSet(trainInfo.dayKey, trainInfo.dInd, currentExId, reps, weight,exTime, isWarmUp);
   setShowAddNewSetPanel(false);
   setTonnage(getTonnage(trainInfo.dayKey, trainInfo.dInd));
   setAllReps(getAllReps(trainInfo.dayKey, trainInfo.dInd));
   setTimer(needTimer);
}
const onRedactSet = (exId,setIndex) => {
  setCurrentExId(exId,setIndex);
  setCurrentSet(setIndex);
  const set = AppData.trainingLog[trainInfo.dayKey][trainInfo.dInd].exercises[exId].sets[setIndex];
  setReps(set.reps);
  setWeight(set.weight);
  setExTime(set.time);
  setIsWarmUp(set.type === 0);
  setShowRedactSetPanel(true);
}
const redactset = () => {
   redactSet(trainInfo.dayKey, trainInfo.dInd, currentExId,currentSet, reps, weight,exTime, isWarmUp);
   setShowRedactSetPanel(false);
   setTonnage(getTonnage(trainInfo.dayKey, trainInfo.dInd));
   setAllReps(getAllReps(trainInfo.dayKey, trainInfo.dInd));
}
const onFinishExercise = (exId) => {
  finishExercise(trainInfo.dayKey, trainInfo.dInd, exId);
}
const onFinishSession = () => {
  const records = finishSession(trainInfo.dayKey, trainInfo.dInd);
  setShowConfirmPanel(false);
  setIsCompleted(true);
  setNewRmRecords(records); 
  setShowFinishPanel(true);
};;
const addExercise = (exId) => {
  setAddExId(exId);
  setShowSuggestionToAdd(true);
  setShowExerciseList(false);
}
const onRemoveExercise = (exId) => {
  setExerciseToRemove(exId);
  setShowConfirmExercisePanel(true);
} 
const removeexercise = () => 
{
  removeExerciseFromSession(trainInfo.dayKey, trainInfo.dInd, exerciseToRemove);
  setShowConfirmExercisePanel(false);
}
function onAddExercise(needToAdd){
  addExerciseToSession(trainInfo.dayKey, trainInfo.dInd, addExId);
    setShowConfirmExercisePanel(false);
    setShowSuggestionToAdd(false);
    if(!needToAdd){
      return null;
    }
      let currentStrategy = langIndex === 0 ? 'время' : 'time' ;
      if(strategy === 0)currentStrategy = sets + 'x' + currentRepMin + '-' + currentRepMax;
      addExerciseToSchedule(session.programId,trainInfo.dInd,addExId,currentStrategy);
      setShowStarategyPanel(false);
      setShowConfirmExercisePanel(false);
      setShowSuggestionToAdd(false);
    }
// render    
return (
      <div style={styles(theme).container}>
        <div style={styles(theme).panel}>
              {/*     timer     */}
              
              <div style={{display:'flex',flexDirection:'column',justifyContent:'flex-start',height:'30vw',borderBottomRightRadius:'24px',borderBottomLeftRadius:'24px',width:'100%',alignItems:'center',backgroundColor: Colors.get('bottomPanel', theme)}}>
                <div style={styles(theme,fSize).text}>{Array.isArray(program?.name) ? program?.name[langIndex] : program?.name}</div>
               <div style={{...styles(theme,fSize).subtext,marginBottom:'15px'}}>{(trainInfo.mode === 'new' ? '⏳ ' : '✅ ') + (program?.schedule[dayIndex].name[langIndex])}</div>
               <div style={{ width: '100%', height: '8px', position: 'relative' }}>
                 <svg width="100%" height="8" viewBox="0 0 100 8" preserveAspectRatio="none" style={{ display: 'block' }}>
                {/* Background track */}
                <rect x="0" y="0" width="100" height="8" fill={Colors.get('background', theme)}/>
                {/* Progress fill */}
                <rect x="0" y="0" width={progress} height="8"  fill={Colors.get('skipped', theme)} /></svg>
               </div>
                <div style={{display:'flex',width:'100%',height:'15vw',justifyContent:'flex-start',alignItems:'center',borderTop:`1px solid ${Colors.get('border', theme)}`}}>
                  <div style={{...styles(theme,fSize).subtext,marginLeft:'12px',fontSize:'16px'}}>{isCompleted ? formatDurationMs(session.duration) : formatDurationMs(duration)}</div>
                  <div style={{...styles(theme,fSize).subtext,fontSize:'16px',marginLeft:'12px'}}>{(tonnage * 0.001).toFixed(2) + (langIndex === 0 ? 'тон' : 'ton')}</div>
                  {!isCompleted && <div style={{marginLeft:'auto',display:'flex',alignItems:'center'}}>
                    <ParsedTime time={currTimer} maxTime={maxTimer} theme={theme}/>
                    {!timer && <TimerOffIcon onClick={() => {setTimer(true);}} style={{fontSize:'28px',color:Colors.get('icons', theme),marginRight:'19px'}}/>}
                    {timer && <TimerIcon onClick={() => {setTimer(false);setCurrTimer(0);setProgress(0);}} style={{fontSize:'28px',color:Colors.get('icons', theme),marginRight:'19px'}}/>}
                     <FaStopwatch onClick={() => {setStopWatchPanel(true);}} style={{fontSize:'28px',color:Colors.get('icons', theme),marginRight:'19px'}}/> 
                     <FaCalculator onClick={() => {setShowPlatesCalculator(true);}} style={{fontSize:'28px',color:Colors.get('icons', theme),marginRight:'19px'}}/>
                     <FaFlagCheckered onClick={() => {setShowConfirmPanel(true);}} style={{fontSize:'24px',color:Colors.get('icons', theme),marginRight:'19px'}}/>
                  </div>}
                </div>
              </div> 
                {/*     header     */}
               
               <div style={styles(theme).scrollView}>
               {session?.exercises && session.exerciseOrder?.length > 0 &&
               <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column',width:'95%'}}>
               {session.exerciseOrder.map(exId => {
                const exercise = session.exercises[exId];
                const exerciseObj = AppData.exercises[exId];
                if (!exerciseObj || !exercise) return null;
                const exerciseName = exerciseObj.name[langIndex];
                let plannedSets = '';
                const program = AppData.programs[session.programId];
                 if (program && session.dayIndex != null) {
                 const day = program.schedule[session.dayIndex];
               if (day) {
                 const dayExercise = day.exercises.find(e => e.exId === exId);
                 if (dayExercise) {
                   plannedSets = dayExercise.sets; // e.g., "3x12"
                     }
                  }
                 }
                return (
                 <div key={exId} onClick={() => {setCurrentExId(exId)}} style={{ display: 'flex', flexDirection: 'column' }}>
                 {/* Exercise name */}
                <div style={{ ...styles(theme, fSize).text,color:currentExId === exId ? Colors.get('mainText', theme) : Colors.get('subText', theme),marginTop:'12px',textAlign:'center',borderBottom:currentExId === exId ? `2px solid ${ Colors.get('iconsHighlited', theme)}` : `1px solid ${Colors.get('border', theme)}`, marginBottom: '10px' }}>
                {exerciseName}
                {!session.completed && <span style={{fontSize:'12px',marginLeft:'10px'}}>{exercise.completed ? '✅ ' : '⏳ '}</span>}
                <span style={{...styles(theme,fSize).subtext,marginLeft:'30px'}}>{plannedSets}</span>
                </div>
                 {/* Sets list */}
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                   <div style={{display: 'flex',height:'25px',justifyContent: 'flex-start',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                      <div style={{...styles(theme,fSize).subtext,width:'10%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{'№'}</div>
                      <div style={{...styles(theme,fSize).subtext,width:'26%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Повторы' : 'Reps'}</div>
                      <div style={{...styles(theme,fSize).subtext,width:'26%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Вес' : 'Weight'}</div>
                       <div style={{...styles(theme,fSize).subtext,width:'26%',borderRight:`1px solid ${Colors.get('border', theme)}`}}>{langIndex === 0 ? 'Время' : 'Time'}</div>
                   </div>
                   { exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} style={{display: 'flex',height:'35px',justifyContent: 'flex-start',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                      <div style={{...numStyle(theme,set.type),width:'10%'}}>{setIndex + 1}</div>
                      <div style={numStyle(theme,set.type)}>{set.reps}{usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.reps} isReps={true} theme={theme} />}</div>
                      <div style={numStyle(theme,set.type)}>{set.weight}{usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.weight} isReps={false} theme={theme} />}</div>
                      <div style={numStyle(theme,set.type)}>{formatDurationMs(set.time)}{usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.time} isReps={false}  theme={theme} isTime={true}/>}</div>
                      <div style={{marginLeft:'auto'}}>
                        <FaPencilAlt onClick={() => {onRedactSet(exId,setIndex)}} style={styles(theme).icon} />
                      </div>
                   </div> 
                ))}
                {/* prev reference */}
                {usePrev && currentExId === exId && <div style={{display: 'flex',height:'25px',justifyContent: 'flex-start',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                      <div style={{...numStylePrev(theme),width:'10%'}}>{exercise.sets.length + 1}</div>
                      <div style={numStylePrev(theme)}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),true)}</div>
                      <div style={numStylePrev(theme)}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false)}</div>
                      <div style={numStylePrev(theme)}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false,true)}</div>
                   </div>}
                {/* buttons */}
                {currentExId === exId && <div style={{display: 'flex',height:'30px',borderBottomLeftRadius:'12px',borderBottomRightRadius:'12px',justifyContent: 'space-around',alignItems:'center',backgroundColor: Colors.get('bottomPanel', theme)}}>
                  <FaTrash onClick={() => {onRemoveExercise(exId)}} style={{...styles(theme).icon,fontSize:'16px'}}/>
                  <FaPlusCircle onClick={() => {onNewset(exId,exercise.sets.length)}} style={{...styles(theme).icon,fontSize:'16px'}}/>
                  {!isCompleted && !exercise.completed && <FaFlag onClick={() => {onFinishExercise(exId)}} style={{...styles(theme).icon,fontSize:'16px'}}/>}
                </div>}
              </div>
              
            </div>
            );
           })}
           <div style={{width:'100vw',height:'30vh'}}/>
          </div>}
          
          </div>
          <div style={{display:'flex',width:'100%',height:'15vw',justifyContent:'space-around',alignItems:'center',backgroundColor:Colors.get('bottomPanel', theme),borderRadius:'24px'}}>
                <FaInfo onClick={() => {setShowInfoPanel(true);}} style={{fontSize:'20px',color:Colors.get('icons', theme),marginLeft:'10px'}}/>
                  
                  <div onClick={() => {setShowExerciseList(true)}}
                   style={{fontSize:'14px',width:'40%',height:'30px',alignContent:'center',alignItems:'center',marginRight:'5px',color:Colors.get('subText', theme),border:`1px solid ${Colors.get('border', theme)}`,borderRadius:'12px'}}>
                  {langIndex === 0 ? '+ упражнение' : '+ exercise'}</div>
                
                  <div onClick={() => {needPrev(prev => !prev)}}
                   style={{fontSize:'14px',width:'40%',height:'30px',alignContent:'center',alignItems:'center',marginRight:'5px',color:usePrev ? Colors.get('iconsHighlited', theme) : Colors.get('subText', theme),border:usePrev ? `2px solid ${Colors.get('iconsHighlited', theme)}` : `1px solid ${Colors.get('border', theme)}`,borderRadius:'12px'}}>
                  {langIndex === 0 ? 'предыдущая сессия' : 'previous session'}</div>
                 
                </div>
      </div>
      {showInfoPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'70%'}}>
           <div style={{...styles(theme,fSize).subtext,textAlign:'left',whiteSpace: 'pre-line'}}>{howToUse(langIndex)}</div>
           <div onClick={() => setShowInfoPanel(false)}  style={styles(theme,fSize).subtext}>{langIndex === 0 ? "Нажмите для закрытия" : "Tap to close"}</div>
         </div>
      </div>}
      {showAddNewSetPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'60%',border:isWarmUp ? `4px solid ${Colors.get('trainingIsolatedFont', theme)}` : `4px solid ${Colors.get('trainingBaseFont', theme)}`}}>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Добавьте повторы" : "Add reps"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindRepsMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setReps(prev => prev - 1 > 1 ? prev - 1 : 1)}}/>
              <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={reps} onChange={(value) => {setReps(parseInt(value))}}/>
              <FaPlus {...bindRepsPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setReps(prev => prev + 1)}}/>
           </div>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Добавьте вес" : "Add weight"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindWeightMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWeight(prev => prev - 0.25 > 0.25 ? prev -0.25 : 0.25)}}/>
              <MyNumInput theme={theme} w={'100px'} h={'40px'}afterPointer={langIndex === 0 ? 'кг' : 'kg'} fSize={28} placeholder={'0'} value={weight} onChange={(value) => {setWeight(parseFloat(value))}}/>
              <FaPlus {...bindWeightPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWeight(prev => prev + 0.25)}}/>
           </div>
           <div style={{...styles(theme,fSize).simplePanelRow,width:'80%',justifyContent:'space-around'}}>
            <div onClick={() => {setIsWarmUp(true)}} style={{width:'40%',border:isWarmUp ? `2px solid ${Colors.get('trainingIsolatedFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:!isWarmUp ? Colors.get('subText', theme) : Colors.get('trainingIsolatedFont', theme)}}>{langIndex === 0 ? "Разминка" : "Warm up"}</div>
            <div onClick={() => {setIsWarmUp(false)}} style={{width:'40%',border:!isWarmUp ? `2px solid ${Colors.get('trainingBaseFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:isWarmUp ? Colors.get('subText', theme) : Colors.get('trainingBaseFont', theme)}}>{langIndex === 0 ? "Рабочий подход" : "Working set"}</div>
           </div>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? "Время выполнения(опционально)" : "Performance time (optional)"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindExTimeMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setExTime(prev => prev - 10000 > 0 ? prev - 10000 : 10000)}}/>
              <div style={{...styles(theme,fSize).text,fontSize:'28px'}}>{formatDurationMs(exTime)}</div>
              <FaPlus {...bindExTimePlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setExTime(prev => prev + 10000)}}/>
           </div>
           {!isCompleted && <div style={{...styles(theme,fSize).simplePanelRow,width:'50%'}}>
              <div onClick={() => {setStopWatchPanel(true)}} style={{...styles(theme,fSize).text,fontSize:'16px'}}>{langIndex === 0 ? "Секундомер" : "Stopwatch"}</div>
              <FaStopwatch  style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setStopWatchPanel(true)}}/>
           </div>}
           {!isCompleted && <div style={{...styles(theme,fSize).simplePanelRow,width:'60%'}}>
           <div style={{...styles(theme,fSize).text,fontSize:'18px'}}>{langIndex === 0 ? 'Таймер отдыха: ' : 'Rest timer: '}{Math.floor(maxTimer / 60000)}:{Math.floor((maxTimer % 60000) / 1000).toString().padStart(2, '0')}</div>
             {needTimer?<FaRegCircleCheck  style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setNeedTimer(false)}}/> :
                <FaRegCircle  style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setNeedTimer(true)}}/>}
           </div>}
          {!isCompleted && needTimer && <Slider style={styles(theme).slider} min={10}max={600}step={10} value={maxTimer / 1000}valueLabelDisplay="off"onChange={(_, newValue) => { setMaxTimer(newValue * 1000); }}/>}
           
           
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowAddNewSetPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {addset()}}/>
           </div>
         </div>
      </div>}
      {showRedactSetPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'60%',border:isWarmUp ? `4px solid ${Colors.get('trainingIsolatedFont', theme)}` : `4px solid ${Colors.get('trainingBaseFont', theme)}`}}>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Измените повторы" : "Change reps"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindRepsMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setReps(prev => prev - 1 > 1 ? prev - 1 : 1)}}/>
              <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={reps} onChange={(value) => {setReps(parseInt(value))}}/>
              <FaPlus {...bindRepsPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setReps(prev => prev + 1)}}/>
           </div>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Измените вес" : "Change weight"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindWeightMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWeight(prev => prev - 0.25 > 0.25 ? prev -0.25 : 0.25)}}/>
              <MyNumInput theme={theme} w={'100px'} h={'40px'}afterPointer={langIndex === 0 ? 'кг' : 'kg'} fSize={28} placeholder={'0'} value={weight} onChange={(value) => {setWeight(parseFloat(value))}}/>
              <FaPlus {...bindWeightPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWeight(prev => prev + 0.25)}}/>
           </div>
           <div style={{...styles(theme,fSize).simplePanelRow,width:'80%',justifyContent:'space-around'}}>
            <div onClick={() => {setIsWarmUp(true)}} style={{width:'40%',border:isWarmUp ? `2px solid ${Colors.get('trainingIsolatedFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:!isWarmUp ? Colors.get('subText', theme) : Colors.get('trainingIsolatedFont', theme)}}>{langIndex === 0 ? "Разминка" : "Warm up"}</div>
            <div onClick={() => {setIsWarmUp(false)}} style={{width:'40%',border:!isWarmUp ? `2px solid ${Colors.get('trainingBaseFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:isWarmUp ? Colors.get('subText', theme) : Colors.get('trainingBaseFont', theme)}}>{langIndex === 0 ? "Рабочий подход" : "Working set"}</div>
           </div>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? "Измените время выполнения" : "Change performance time"}</div>
           <div style={{...styles(theme,fSize).simplePanelRow,backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px',userSelect:'none',touchAction:'none'}}>
              <FaMinus {...bindExTimeMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setExTime(prev => prev - 10000 > 0 ? prev - 10000 : 10000)}}/>
              <div style={{...styles(theme,fSize).text,fontSize:'28px'}}>{formatDurationMs(exTime)}</div>
              <FaPlus {...bindExTimePlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setExTime(prev => prev + 10000)}}/>
           </div>
           
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowRedactSetPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {redactset()}}/>
           </div>
         </div>
      </div>}
      {stopWatchPanel && <div  style={styles(theme).confirmContainer}>
         <Stopwatch theme={theme} langIndex={langIndex} setTime={setExTime} setShowPanel={setStopWatchPanel}/>
      </div>}
      {showPlatesCalculator && <div  style={styles(theme).confirmContainer}>
         <PlatesCalculator theme={theme} langIndex={langIndex} fSize={fSize} setShowCalculator={setShowPlatesCalculator}/>
      </div>}
      { premiumMiniPage && !UserData.hasPremium && <div onClick={(e) => {e.preventDefault();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'95vw',height:'160vw',top:'15.5%',borderRadius:'24px',backdropFilter:'blur(12px)',zIndex:2}}>
          <p style={{...styles(theme,fSize).text,textAlign: "center",}}> {langIndex === 0 ? '📈 Сравнивайте прогресс с прошлыми тренировками\n и отслеживайте рост в каждом подходе!' : '📈 Compare progress with past workouts\n and track gains in every set!'} </p>
          <p style={{...styles(theme,fSize).text}}> {langIndex === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'} </p>
          <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn,margin:'10px'}} >{langIndex === 0 ? 'Стать премиум' : 'Get premium'}</button>
          <button onClick={() => {setPremiumMiniPage(false)}} style={{...styles(theme,fSize).btn,margin:'10px'}} >{langIndex === 0 ? 'Закрыть' : 'Close'}</button>
        </div>
      }
      {showConfirmPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'20%'}}>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Завершить тренировку?" : "Finish session?"}</div>
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowConfirmPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onFinishSession()}}/>
           </div>
         </div>
      </div>}
      {showConfirmExercisePanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'20%'}}>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Удалить упражнение?" : "Delete exercise?"}</div>
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowConfirmExercisePanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {removeexercise()}}/>
           </div>
         </div>
      </div>}
      {showFinishPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'90%',justifyContent:'flex-start'}}>
           <div style={{...styles(theme,fSize).subtext ,fontSize:'15px',fontWeight:'bold',marginTop:'17px' }}>{langIndex === 0 ? "Результаты тренировки" : "Session results"}</div>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',height:'25%', width: '100%', marginTop: '12px', borderBottom: `1px solid ${Colors.get('border', theme)}`}}>
           <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{...styles(theme,fSize).subtext}}>{langIndex === 0 ? "Время тренировки" : "Training time"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'24px'}}>{formatDurationMs(session.duration)}</div>
           </div>
           <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{...styles(theme,fSize).subtext}}>{langIndex === 0 ? "Тоннаж" : "Tonnage"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'24px'}}>{(tonnage * 0.001).toFixed(2) + (langIndex === 0 ? ' т' : ' t')}</div>
           </div>
           <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{...styles(theme,fSize).subtext}}>{langIndex === 0 ? "Повторения" : "Reps"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'24px'}}>{allReps}</div>
           </div>
           <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{...styles(theme,fSize).subtext}}>{langIndex === 0 ? "Сеты" : "Sets"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'24px'}}>{getAllSets(trainInfo.dayKey, trainInfo.dInd)}</div>
           </div>
           </div>
           
            

           <div style={{width: '100%',height:'55%', borderBottom: `1px solid ${Colors.get('border', theme)}`,overflowY:'scroll' }}>
             <div style={{...styles(theme,fSize).subtext ,fontSize:'15px',fontWeight:'bold',marginTop:'17px' }}>{langIndex === 0 ? "Рекорды" : "Records"}</div>
            <img src="images/Medal.png" style={{ width: '50px', height: '50px' }} />
            {newRmRecords.length > 0 ? (
  
    <div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    width: '100%',
    marginTop: '12px',
    ĥeight: '80%',                 
    paddingRight: '4px',       
  }}
>
  {newRmRecords.map(({ exId, newRm, oldRm, improvement }) => {
    const exerciseObj = AppData.exercises[exId];
    if (!exerciseObj) return null;

    return (
      <div
        key={exId}
        style={{
          display: 'flex',
          width: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
            
            <div style={{ ...styles(theme, fSize).subtext, fontWeight: 'bold', textAlign: 'center', marginTop: '16px' }}>
              {exerciseObj.name[langIndex]}
            </div>
            <div style={{ ...styles(theme, fSize).text, fontSize: '24px', marginTop: '8px' }}>
              {newRm} {langIndex === 0 ? 'кг' : 'kg'}
            </div>
            <div style={{ ...styles(theme, fSize).subtext, fontSize: '10px', marginTop: '4px' }}>
              {langIndex === 0 ? 'было' : 'was'} {oldRm > 0 ? `${oldRm} ${langIndex === 0 ? 'кг' : 'kg'}` : '-'}
            </div>
            <div style={{ 
              ...styles(theme, fSize).subtext, 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: Colors.get('done', theme),
              marginTop: '2px'
            }}>
              {improvement > 0 ? (
                langIndex === 0 
                  ? `↑ +${improvement.toFixed(1)} кг` 
                  : `↑ +${improvement.toFixed(1)} kg`
              ) : ''}
            </div>
          </div>
        );
      })}
    </div>

) : (
  <div style={{ ...styles(theme, fSize).subtext, marginTop: '12px' }}>
    {langIndex === 0 ? "Новых рекордов нет" : "No new records"}
  </div>
)}
           </div>
           <div style={{...styles(theme).simplePanelRow,height:'60px',marginTop:'15px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {setPage('TrainingMain')}}/>
           </div>
         </div>
      </div>}
      {showExerciseList && (
        <div style={{...styles(theme).confirmContainer}}>
          <TrainingExercise needToAdd={true} setEx={addExercise} />
        </div>
      )}
      {/* strategy panel */}
        {showStarategyPanel && <div style={styles(theme).confirmContainer}>
                  <div style={{position:'fixed',top:'30vh',left:'4.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-around',width:'90vw',height:'90vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
                     <p style={{...styles(theme,false,false,fSize).text,padding:'20px',marginLeft:'10%',marginRight:'5%',textAlign:'center'}}>{langIndex === 0 ? 'Установите стратегию выполнения' : 'Set performing strategy'}</p>
                      <div style={{display:'flex',flexDirection:'row',width:'90%',justifyContent:'space-around'}}>
                        <div onClick={() => {setStrategy(0)}} style={{width:'40%',border:strategy === 0 ? `2px solid ${Colors.get('trainingIsolatedFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:strategy === 1 ? Colors.get('subText', theme) : Colors.get('trainingIsolatedFont', theme)}}>{langIndex === 0 ? "Повторы" : "Reps"}</div>
                        <div onClick={() => {setStrategy(1)}} style={{width:'40%',border:strategy === 1 ? `2px solid ${Colors.get('trainingIsolatedFont', theme)}` : `1px solid ${Colors.get('icons', theme)}`,borderRadius:'16px',padding:'4px',fontSize:'16px',color:strategy === 0 ? Colors.get('subText', theme) : Colors.get('trainingIsolatedFont', theme)}}>{langIndex === 0 ? "Время" : "Time"}</div>
                      </div>
                      {strategy === 0 && <div style={{display:'flex',flexDirection:'row',height:'50%',width:'60%',justifyContent:'space-around'}}>
                        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                          <IoIosArrowUp onClick={() => setSets(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                            <div style={{...styles(theme).text,fontSize:'24px'}}>{sets}</div>
                          <IoIosArrowDown onClick={() => setSets(prev => prev - 1 > 0 ? prev - 1 : 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                        </div>
                          <p style={{...styles(theme).text,fontSize:'24px',marginTop:'30%'}}>{'x'}</p>
                        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                          <IoIosArrowUp onClick={() => setCurrentRepMin(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                            <div style={{...styles(theme).text,fontSize:'24px'}}>{currentRepMin}</div>
                          <IoIosArrowDown onClick={() => setCurrentRepMin(prev => prev - 1 > 0 ? prev - 1 : 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                        </div>
                          <p style={{...styles(theme).text,fontSize:'24px',marginTop:'30%'}}>{'-'}</p>
                        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                          <IoIosArrowUp onClick={() => setCurrentRepMax(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                            <div style={{...styles(theme).text,fontSize:'24px'}}>{currentRepMax}</div>
                          <IoIosArrowDown onClick={() => setCurrentRepMax(prev => (prev - 1 > currentRepMin + 2 ? prev - 1 : currentRepMin + 2))} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                        </div>
                      </div>}
                    <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'center'}}>
                      <MdDone onClick={() => onAddExercise(true)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                      </div>
                  </div>
        </div>}
    {showSuggestionToAdd && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'20%'}}>
           <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Добавить упражнение также в программу?" : "Add the exercise to the program too?"}</div>
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => onAddExercise(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {setShowStarategyPanel(true);setShowSuggestionToAdd(false)}}/>
           </div>
         </div>
      </div>}
    </div>
  )
}

export default TrainingCurrent

const numStyle = (theme,type) =>
({
  fontSize:'18px',
  fontWeight:'bold',
  color:type === 0 ? Colors.get('trainingIsolatedFont', theme) : Colors.get('trainingBaseFont', theme),
  width:'26%',
  borderRight:`1px solid ${Colors.get('border', theme)}`
})
const numStylePrev = (theme) =>
({
  fontSize:'16px',
  color:Colors.get('prevTrainingText', theme),
  width:'26%',
  borderRight:`1px solid ${Colors.get('border', theme)}`
})
const spanStyle = (theme,isMore) =>
({
  fontSize:'10px',
  position: 'relative',
  top: '-8px',
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
    height:'57vh',
    marginLeft:'4%',
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
  },
  cP :
    {
      display:'flex',
      flexDirection:'column',
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius:"24px",
      backgroundColor:Colors.get('bottomPanel', theme),
      width:"100%",
      height:"90vh"
  },
    confirmContainer: {
    position: 'fixed',
    top: 0,
    left: -10,
    bottom: 0,
    width:'95vw',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2900,
    padding: '20px',
  },
simplePanelRow:
{
  width:'75vw',
  display:'flex',
  flexDirection:'row',
  alignItems:'center',
  justifyContent:'space-around',
},
slider:
{
  width:'80%',
  userSelect: 'none',
  touchAction: 'none',
  color:Colors.get('icons', theme),
  backgroundColor:'rgba(0,0,0,0.2)',
},
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

function Difference({ exId, setIndex, beforeDate, value, isReps, theme, isTime = false }) {
  const exIdStr = String(exId); // ✅ Critical: ensure string key
  const previousSet = findPreviousSimilarExercise(exIdStr, setIndex, beforeDate, AppData.trainingLog);
  
  let diffString = '';
  let diff = 0;

  if (previousSet !== null && typeof value === 'number' && !isNaN(value)) {
    if (isTime) {
      const prevTime = previousSet.time || 0;
      diff = value - prevTime;
      const diffSeconds = Math.round(diff / 1000);
      const absSeconds = Math.abs(diffSeconds);

      if (absSeconds === 0) {
        diffString = '';
      } else if (absSeconds >= 60) {
        const minutes = Math.floor(absSeconds / 60);
        const seconds = absSeconds % 60;
        const sign = diffSeconds > 0 ? '▴' : '▾';
        diffString = `${sign}${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        diffString = `${diffSeconds > 0 ? '▴' : ''}${absSeconds}`;
      }
    } else {
      const prevValue = isReps ? previousSet.reps : previousSet.weight;
      diff = value - prevValue;
      if (diff !== 0) {
        diffString = `${diff > 0 ? '▴' : ''}${diff}`;
      }
    }
  }

  return (
    <span style={spanStyle(theme, diff > 0)}>
      {diffString}
    </span>
  );
}
function prevResult(exId, setIndex, beforeDate, isReps, isTime = false) {
  const exIdStr = exId.toString(); // ✅ Ensure string key
  const previousSet = findPreviousSimilarExercise(exIdStr, setIndex, beforeDate, AppData.trainingLog);
  if (!previousSet) return '-';
  if (isTime) return formatDurationMs(previousSet.time);
  return isReps ? previousSet.reps.toString() : previousSet.weight.toString();
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
  const baseFontSize = '17px';
  const animatedFontSize = isPulsing ? '20px' : baseFontSize; // or use transform for smoother perf
  const color = 
    percent < 50 && percent > 30
      ? Colors.get('trainingIsolatedFont', theme)
      : percent < 30
        ? Colors.get('subText', theme)
        : Colors.get('trainingBaseFont', theme);
  return (
    <div
      style={{
        color,
        marginRight:'12px',
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
function formatDurationMs(duration) {
  if (duration <= 0) return '-';

  const totalSeconds = Math.floor(duration / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
function howToUse(langIndex) {
  if (langIndex === 0) {
    return 'КАК ИСПОЛЬЗОВАТЬ:\n' +
           '1️⃣ ВЫБЕРИТЕ ДЕНЬ: Нажмите на дату в календаре.\n' +
           '2️⃣ СОЗДАЙТЕ ТРЕНИРОВКУ: Нажмите на значок открытой книги 📖, чтобы начать новую сессию.\n' +
           '3️⃣ ДОБАВЬТЕ УПРАЖНЕНИЯ: Используйте ➕, чтобы добавить упражнение из программы.\n' +
           '4️⃣ ЗАПОЛНИТЕ ПОДХОДЫ: Укажите повторения и вес. Тоннаж считается автоматически.\n' +
           '5️⃣ РЕДАКТИРУЙТЕ: Нажмите ✏️, чтобы изменить упражнение или подход.\n' +
           '6️⃣ ЗАВЕРШИТЕ: Нажмите 🏁, чтобы сохранить тренировку. Данные сохраняются мгновенно!';
  }
  
  return 'HOW TO USE:\n' +
         '1️⃣ SELECT A DAY: Tap a date in the calendar.\n' +
         '2️⃣ START TRAINING: Tap the open book icon 📖 to begin a new session.\n' +
         '3️⃣ ADD EXERCISES: Use ➕ to add exercises from your program.\n' +
         '4️⃣ LOG SETS: Enter reps and weight. Tonnage is calculated automatically.\n' +
         '5️⃣ EDIT: Tap ✏️ to modify an exercise or set.\n' +
         '6️⃣ FINISH: Tap 🏁 to complete and save your workout instantly!';
}
