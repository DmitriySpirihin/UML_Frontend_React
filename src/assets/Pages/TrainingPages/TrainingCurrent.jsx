import React, {useState,useEffect,useRef} from 'react'
import { AppData,UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,trainInfo$,setPage} from '../../StaticClasses/HabitsBus'
import {addExerciseToSchedule} from '../../Classes/TrainingData.jsx'
import {findPreviousSimilarExercise, finishSession, addExerciseToSession,
   removeExerciseFromSession, addSet, finishExercise, redactSet,getAllReps,getTonnage,getMaxOneRep,getAllSets} from '../../StaticClasses/TrainingLogHelper'
import {FaTrash,FaPencilAlt,FaFlagCheckered,FaFlag,FaInfo,FaPlusCircle,FaDumbbell} from 'react-icons/fa'
import {FaRegCircleCheck,FaRegCircle,FaPlus,FaMinus,FaStopwatch,FaCalculator,FaClock, FaListCheck} from 'react-icons/fa6'
import {MdClose,MdDone,MdFitnessCenter, MdOutlineHistory} from 'react-icons/md'
import Stopwatch from '../../Helpers/StopWatch'
import PlatesCalculator from '../../Helpers/PlatesCalculator'
import TrainingExercise from './TrainingExercise'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
//timer
import TimerIcon from '@mui/icons-material/TimerTwoTone';
import TimerOffIcon from '@mui/icons-material/TimerOffTwoTone';
import Slider from '@mui/material/Slider';
import ScrollPicker from '../../Helpers/ScrollPicker.jsx'

const timerSound = new Audio('Audio/Timer.wav');

// Arrays for Pickers
const repsRange = Array.from({ length: 102 }, (_, i) => i ); // 1 to 100
const weightIntRange = Array.from({ length: 500 }, (_, i) => i - 1); // 0 to 499
const weightDecRange = [0, 0, 0.25, 0.5, 0.75, 1 , 1]; // Fractional kg
const minutesRange = Array.from({ length: 60 }, (_, i) => i - 1); // 0 to 59
const secondsRange = Array.from({ length: 12 }, (_, i) => (i - 1) * 5); // 0, 5, 10... 55 (Step 5 for easier UX)

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
            {/* --- DASHBOARD HEADER --- */}
            <div style={styles(theme).headerCard}>
                
                {/* Title & Status */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', marginBottom:'10px'}}>
                    <div style={{display:'flex', flexDirection:'column'}}>
                         <div style={{...styles(theme,fSize).text, fontWeight:'bold', fontSize:'18px', marginBottom:0}}>
                            {Array.isArray(program?.name) ? program?.name[langIndex] : program?.name}
                         </div>
                         <div style={{...styles(theme,fSize).subtext, opacity:0.7, marginTop:'4px'}}>
                            {(trainInfo.mode === 'new' ? '⏳ ' : '✅ ') + (program?.schedule[dayIndex].name[langIndex])}
                         </div>
                    </div>
                    {/* Main Session Timer */}
                    <div style={{backgroundColor:'rgba(0,0,0,0.2)', padding:'5px 12px', borderRadius:'20px'}}>
                        <div style={{...styles(theme,fSize).subtext, fontSize:'16px', fontWeight:'600', color:Colors.get('mainText', theme)}}>
                            {isCompleted ? formatDurationMs(session.duration) : formatDurationMs(duration)}
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '6px', position: 'relative', borderRadius:'3px', overflow:'hidden', backgroundColor:'rgba(255,255,255,0.1)', marginBottom:'12px' }}>
                     <div style={{ width: `${progress}%`, height: '100%', backgroundColor: Colors.get('skipped', theme), transition:'width 0.5s linear' }} />
                </div>

                {/* Stats & Tools Row */}
                <div style={{display:'flex', width:'100%', justifyContent:'space-between', alignItems:'center'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <MdFitnessCenter style={{color:Colors.get('icons', theme)}}/>
                        <div style={{...styles(theme,fSize).subtext, fontWeight:'bold', fontSize:'14px'}}>
                            {(tonnage * 0.001).toFixed(2) + (langIndex === 0 ? ' т' : ' t')}
                        </div>
                    </div>

                    {!isCompleted && (
                        <div style={{display:'flex', alignItems:'center', gap:'16px'}}>
                             <ParsedTime time={currTimer} maxTime={maxTimer} theme={theme}/>
                             
                             <div style={styles(theme).toolIconWrapper} onClick={() => {timer ? (setTimer(false), setCurrTimer(0), setProgress(0)) : setTimer(true)}}>
                                {timer ? <TimerIcon style={styles(theme).headerIcon}/> : <TimerOffIcon style={styles(theme).headerIcon}/>}
                             </div>

                             <div style={styles(theme).toolIconWrapper} onClick={() => {setStopWatchPanel(true)}}>
                                <FaStopwatch style={styles(theme).headerIcon}/>
                             </div>

                             <div style={styles(theme).toolIconWrapper} onClick={() => {setShowPlatesCalculator(true)}}>
                                <FaCalculator style={styles(theme).headerIcon}/>
                             </div>

                             <div style={{...styles(theme).toolIconWrapper, backgroundColor:Colors.get('done', theme)}} onClick={() => {setShowConfirmPanel(true)}}>
                                <FaFlagCheckered style={{fontSize:'18px', color:'#fff'}}/>
                             </div>
                        </div>
                    )}
                </div>
            </div> 

            {/* --- EXERCISE LIST (SCROLLVIEW) --- */}
            <div style={styles(theme).scrollView}>
               {session?.exercises && session.exerciseOrder?.length > 0 &&
               <div style={{ display: 'flex', flexDirection: 'column', width:'97%', gap:'12px', paddingBottom:'20px'}}>
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
                   plannedSets = dayExercise.sets; 
                     }
                  }
                 }
                
                // EXERCISE CARD
                return (
                 <div key={exId} style={{ 
                     display: 'flex', 
                     flexDirection: 'column', 
                     backgroundColor: Colors.get('bottomPanel', theme),
                     borderRadius: '16px',
                     padding: '12px',
                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                     border: currentExId === exId ? `1px solid ${Colors.get('iconsHighlited', theme)}` : 'none'
                 }}>
                 
                 {/* Card Header */}
                 <div onClick={() => {setCurrentExId(prev => prev === exId ? -1 : exId)}} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px', borderBottom:`1px solid ${Colors.get('border', theme)}`, paddingBottom:'8px' }}>
                    <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                        <div style={{...styles(theme, fSize).text, fontWeight:'bold', fontSize:'16px', marginBottom:0, color: currentExId === exId ? Colors.get('iconsHighlited', theme) : Colors.get('mainText', theme)}}>
                            {exerciseName}
                        </div>
                        <span style={{fontSize:'12px'}}>{exercise.completed ? '✅' : ''}</span>
                    </div>
                    <div style={{...styles(theme,fSize).subtext, backgroundColor:'rgba(0,0,0,0.1)', padding:'2px 8px', borderRadius:'8px'}}>
                        {plannedSets}
                    </div>
                 </div>

                 {/* Table Header */}
                  {currentExId === exId && <div style={{display: 'flex', marginBottom:'6px', paddingLeft:'4px', opacity:0.6}}>
                      <div style={{...styles(theme,fSize).subtext, width:'10%'}}>#</div>
                      <div style={{...styles(theme,fSize).subtext, width:'25%'}}>{langIndex === 0 ? 'Повт' : 'Reps'}</div>
                      <div style={{...styles(theme,fSize).subtext, width:'25%'}}>{langIndex === 0 ? 'Вес' : 'Kg'}</div>
                      <div style={{...styles(theme,fSize).subtext, width:'25%'}}>{langIndex === 0 ? 'Время' : 'Time'}</div>
                  </div>}

                 {/* Sets Rows */}
                 {currentExId === exId && <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                   { exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} style={{
                      display: 'flex', 
                      alignItems:'center', 
                      padding:'8px', 
                      backgroundColor: setIndex % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent', 
                      borderRadius:'8px'
                  }}>
                      <div style={{...numStyle(theme,set.type), width:'10%', border: 'none'}}>{setIndex + 1}</div>
                      
                      <div style={{...numStyle(theme,set.type), border: 'none'}}>
                          {set.reps}
                          {usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.reps} isReps={true} theme={theme} />}
                      </div>
                      
                      <div style={{...numStyle(theme,set.type), border: 'none'}}>
                          {set.weight}
                          {usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.weight} isReps={false} theme={theme} />}
                      </div>
                      
                      <div style={{...numStyle(theme,set.type), border: 'none'}}>
                          {formatDurationMs(set.time)}
                          {usePrev && <Difference exId={exId} setIndex={setIndex} beforeDate={new Date(trainInfo.dayKey)} value={set.time} isReps={false}  theme={theme} isTime={true}/>}
                      </div>
                      
                      <div style={{marginLeft:'auto'}}>
                         <div onClick={() => {onRedactSet(exId,setIndex)}} style={{padding:'6px', borderRadius:'50%', backgroundColor:'rgba(255,255,255,0.05)'}}>
                            <FaPencilAlt style={{fontSize:'12px', color:Colors.get('icons', theme)}} />
                         </div>
                      </div>
                   </div> 
                ))}

                {/* Prev Reference Row */}
                {usePrev &&  
                   <div style={{display: 'flex', alignItems:'center', padding:'8px', borderTop:`1px dashed ${Colors.get('border', theme)}`, opacity:0.7}}>
                      <div style={{...numStylePrev(theme), width:'10%', border:'none'}}>{exercise.sets.length + 1}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),true)}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false)}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false,true)}</div>
                   </div>
                }
                
                {/* Action Bar (Only on selected) */}
                 
                  <div style={{display: 'flex', marginTop:'12px', paddingTop:'8px', borderTop:`1px solid ${Colors.get('border', theme)}`, justifyContent: 'space-around'}}>
                     <button style={styles(theme).actionBtnSmall} onClick={() => {onRemoveExercise(exId)}}>
                        <FaTrash style={{fontSize:'14px', color:Colors.get('skipped', theme)}}/>
                     </button>
                     <button style={{...styles(theme).actionBtnSmall, width:'40%', backgroundColor:Colors.get('iconsHighlited', theme)}} onClick={() => {onNewset(exId,exercise.sets.length)}}>
                        <FaPlus style={{fontSize:'16px', color:Colors.get('background', theme)}}/> <span style={{marginLeft:'5px', color:Colors.get('background', theme), fontWeight:'bold'}}>{langIndex===0? 'Сет':'Set'}</span>
                     </button>
                     {!isCompleted && !exercise.completed && 
                     <button style={styles(theme).actionBtnSmall} onClick={() => {onFinishExercise(exId)}}>
                        <FaFlag style={{fontSize:'14px', color:Colors.get('done', theme)}}/>
                     </button>}
                  </div>
                
                </div>}
               </div>
              );
             })}
            
            <div style={{width:'100vw',height:'20vh'}}/>
             </div>}
        </div>
        </div>

        {/* --- BOTTOM FLOATING MENU --- */}
        <div style={styles(theme).floatingMenu}>
             <div onClick={() => {setShowInfoPanel(true);}} style={styles(theme).menuIconBtn}>
                <FaInfo style={{fontSize:'20px', color:Colors.get('icons', theme)}}/>
             </div>
             
             <div onClick={() => {setShowExerciseList(true)}} style={styles(theme).menuPillBtn}>
               <FaPlus style={{fontSize:'14px', marginRight:'6px'}}/>
               {langIndex === 0 ? 'Упражнение' : 'Exercise'}
             </div>
           
             <div onClick={() => {needPrev(prev => !prev)}} 
                  style={{...styles(theme).menuPillBtn, 
                          backgroundColor: usePrev ? Colors.get('barsColorMeasures', theme) : theme === 'dark' ? 'rgba(28, 28, 28, 0.85)' : 'rgba(235, 235, 235, 0.46)',
                          color: usePrev ? Colors.get('background', theme) : Colors.get('subText', theme),
                          border: usePrev ? 'none' : `1px solid ${Colors.get('border', theme)}`
                  }}>
               <MdOutlineHistory style={{fontSize:'16px', marginRight:'6px'}}/>
               {langIndex === 0 ? 'История' : 'History'}
             </div>
        </div>


      {showInfoPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).modalCard, height:'auto', padding:'25px'}}>
           <div style={{...styles(theme,fSize).subtext,textAlign:'left',whiteSpace: 'pre-line', fontSize:'14px', lineHeight:'1.5'}}>{howToUse(langIndex)}</div>
           <button onClick={() => setShowInfoPanel(false)} style={styles(theme).primaryBtn}>{langIndex === 0 ? "Закрыть" : "Close"}</button>
         </div>
      </div>}

      {/* --- ADD NEW SET PANEL (MODERNIZED) --- */}
      {showAddNewSetPanel && (
  <div style={{...styles(theme).confirmContainer}}>
    <div style={{
      ...styles(theme).bottomSheet,height:'75vh',
      borderTop: `3px solid ${isWarmUp ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme)}`
    }}>
      <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', alignSelf: 'center', marginBottom: '15px' }}></div>

      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ ...styles(theme, fSize).text, fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
          {langIndex === 0 ? "Добавить сет" : "Add Set"}
        </div>
        {/* Warmup Toggle */}
        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '20px', padding: '4px' }}>
          <div onClick={() => setIsWarmUp(true)} style={{ ...styles(theme).segmentBtn, color: isWarmUp ? Colors.get('difficulty2', theme) : Colors.get('subText', theme) }}>
            {langIndex === 0 ? "Разминка" : "Warmup"}
          </div>
          <div onClick={() => setIsWarmUp(false)} style={{ ...styles(theme).segmentBtn, color: !isWarmUp ? Colors.get('difficulty5', theme) : Colors.get('subText', theme) }}>
            {langIndex === 0 ? "Рабочий" : "Work"}
          </div>
        </div>
      </div>

      {/* --- PICKER ROW: REPS & WEIGHT --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
        
        {/* REPS PICKER */}
        <div style={{ ...styles(theme).inputCard, height: 'auto', padding: '15px 10px' }}>
          <div style={{ ...styles(theme, fSize).subtext, marginBottom: '10px', textAlign: 'center' }}>
            {langIndex === 0 ? "Повторы" : "Reps"}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScrollPicker 
              items={repsRange} 
              value={reps} 
              onChange={setReps} 
              theme={theme} 
              width="60px"
            />
          </div>
        </div>

        {/* WEIGHT PICKER (Split Int/Dec) */}
        <div style={{ ...styles(theme).inputCard, height: 'auto', padding: '15px 10px' }}>
          <div style={{ ...styles(theme, fSize).subtext, marginBottom: '10px', textAlign: 'center' }}>
            {langIndex === 0 ? "Вес (кг)" : "Weight (kg)"}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            {/* Integer Part (0-500) */}
            <ScrollPicker 
              items={weightIntRange} 
              value={Math.floor(weight)} 
              onChange={(val) => setWeight(val + (weight % 1))} 
              theme={theme} 
              width="50px"
            />
            <div style={{ paddingTop: '40px', fontSize: '20px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>.</div>
            {/* Decimal Part (.00 - .75) */}
            <ScrollPicker 
              items={weightDecRange} 
              value={weight % 1} 
              onChange={(val) => setWeight(Math.floor(weight) + val)} 
              theme={theme} 
              width="40px"
              suffix=""
            />
          </div>
        </div>
      </div>

      {/* --- PICKER ROW: TIME --- */}
      <div style={{ ...styles(theme).inputCard, height: 'auto', marginTop: '10px', padding: '15px 10px' }}>
        <div style={{ marginBottom: '10px', textAlign: 'center', display:'flex', alignItems:'center', justifyContent:'center', width:'90%' }}>
           <FaStopwatch style={{color:Colors.get('difficulty', theme),fontSize:'35px',marginRight:'auto'}} onClick={() => setStopWatchPanel(true)}/> 
           <div style={{ ...styles(theme, fSize).mainText}}> {langIndex === 0 ? "Время выполнения" : "Exercise time"}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <ScrollPicker 
                items={minutesRange} 
                value={Math.floor(exTime / 60000)} 
                onChange={(min) => setExTime((min * 60000) + (exTime % 60000))} 
                theme={theme} 
                width="50px"
                suffix="m"
              />
          </div>
          <div style={{ paddingTop: '40px', fontSize: '20px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>:</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <ScrollPicker 
                items={secondsRange} 
                value={Math.floor((exTime % 60000) / 1000)} 
                onChange={(sec) => setExTime((Math.floor(exTime / 60000) * 60000) + (sec * 1000))} 
                theme={theme} 
                width="50px"
                suffix="s"
              />
          </div>
        </div>
      </div>

      {/* Timer Toggle */}
      {!isCompleted &&
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '90%', margin: '15px auto', padding: '0 10px' }}>
          <div style={{ ...styles(theme, fSize).text, fontSize: '16px' }}>
            {langIndex === 0 ? 'Запустить таймер?' : 'Start timer?'}
          </div>
          {needTimer ?
            <FaRegCircleCheck style={{ fontSize: '28px', color: Colors.get('done', theme), cursor: 'pointer' }} onClick={() => { setNeedTimer(false) }} /> :
            <FaRegCircle style={{ fontSize: '28px', color: Colors.get('icons', theme), cursor: 'pointer' }} onClick={() => { setNeedTimer(true) }} />
          }
        </div>
      }
      {!isCompleted && needTimer &&
          <div style={styles.topSection}>
                <div style={styles.label}>
                    <span style={{opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        {langIndex === 0 ? 'отдых: ' : 'rest: '}
                    </span>
                    <span style={{fontSize: '24px', fontWeight: 'bold', marginTop: '4px'}}>
                        {Math.floor(maxTimer / 60000)}:{Math.floor((maxTimer % 60000) / 1000).toString().padStart(2, '0')}
                    </span>
                </div>
                
                <Slider 
                    style={styles(theme).slider} 
                    min={10} 
                    max={600} 
                    step={10} 
                    value={maxTimer / 1000} 
                    valueLabelDisplay="off" 
                    onChange={(_, newValue) => { setMaxTimer(newValue * 1000); }} 
                />
            </div>  
      }

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', marginTop: 'auto', marginBottom: '10px' }}>
        <button onClick={() => setShowAddNewSetPanel(false)} style={{ ...styles(theme).secondaryBtn, flex: 1 }}><MdClose style={{ fontSize: '24px' }} /></button>
        <button onClick={() => { addset() }} style={{ ...styles(theme).primaryBtn, flex: 3 }}><MdDone style={{ fontSize: '24px' }} /></button>
      </div>
    </div>
  </div>
)}

      {/* --- REDACT SET PANEL --- */}
      {showRedactSetPanel && (
  <div style={styles(theme).confirmContainer}>
    <div style={{
      ...styles(theme).bottomSheet,
      borderTop: `3px solid ${isWarmUp ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme)}`
    }}>
      <div style={{ ...styles(theme, fSize).text, fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' }}>
        {langIndex === 0 ? "Изменить сет" : "Edit Set"}
      </div>

      {/* REPS & WEIGHT PICKERS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', width: '100%' }}>
        {/* Reps */}
        <div style={{ ...styles(theme).inputCard, height: 'auto', padding: '15px 10px' }}>
          <div style={{ ...styles(theme, fSize).subtext, marginBottom: '10px', textAlign: 'center' }}>
            {langIndex === 0 ? "Повторы" : "Reps"}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ScrollPicker items={repsRange} value={reps} onChange={setReps} theme={theme} width="60px" />
          </div>
        </div>

        {/* Weight */}
        <div style={{ ...styles(theme).inputCard, height: 'auto', padding: '15px 10px' }}>
          <div style={{ ...styles(theme, fSize).subtext, marginBottom: '10px', textAlign: 'center' }}>
            {langIndex === 0 ? "Вес (кг)" : "Weight"}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
            <ScrollPicker 
              items={weightIntRange} 
              value={Math.floor(weight)} 
              onChange={(val) => setWeight(val + (weight % 1))} 
              theme={theme} 
              width="50px" 
            />
            <div style={{ paddingTop: '40px', fontSize: '20px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>.</div>
            <ScrollPicker 
              items={weightDecRange} 
              value={weight % 1} 
              onChange={(val) => setWeight(Math.floor(weight) + val)} 
              theme={theme} 
              width="40px" 
            />
          </div>
        </div>
      </div>

      {/* Type Toggle */}
      <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '4px', margin: '20px 0' }}>
        <div onClick={() => { setIsWarmUp(true) }} style={{ ...styles(theme).segmentBtn, color: isWarmUp ? Colors.get('difficulty2', theme) : Colors.get('subText', theme) }}>
          {langIndex === 0 ? "Разминка" : "Warmup"}
        </div>
        <div onClick={() => { setIsWarmUp(false) }} style={{ ...styles(theme).segmentBtn, color: !isWarmUp ? Colors.get('difficulty5', theme) : Colors.get('subText', theme) }}>
          {langIndex === 0 ? "Рабочий" : "Work"}
        </div>
      </div>

      {/* TIME PICKER */}
      <div style={{ ...styles(theme).inputCard, height: 'auto', padding: '15px 10px' }}>
        <div style={{ ...styles(theme, fSize).subtext, marginBottom: '10px', textAlign: 'center', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
           <FaClock /> {langIndex === 0 ? "Время" : "Time"}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
             <ScrollPicker 
                items={minutesRange} 
                value={Math.floor(exTime / 60000)} 
                onChange={(min) => setExTime((min * 60000) + (exTime % 60000))} 
                theme={theme} 
                width="50px"
                suffix="m"
              />
          <div style={{ paddingTop: '40px', fontSize: '20px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>:</div>
             <ScrollPicker 
                items={secondsRange} 
                value={Math.floor((exTime % 60000) / 1000)} 
                onChange={(sec) => setExTime((Math.floor(exTime / 60000) * 60000) + (sec * 1000))} 
                theme={theme} 
                width="50px"
                suffix="s"
              />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
        <button onClick={() => setShowRedactSetPanel(false)} style={{ ...styles(theme).secondaryBtn, flex: 1 }}><MdClose style={{ fontSize: '24px' }} /></button>
        <button onClick={() => { redactset() }} style={{ ...styles(theme).primaryBtn, flex: 3 }}><MdDone style={{ fontSize: '24px' }} /></button>
      </div>
    </div>
  </div>
)}

      {stopWatchPanel && <div  style={styles(theme).confirmContainer}>
         <Stopwatch theme={theme} langIndex={langIndex} setTime={setExTime} setShowPanel={setStopWatchPanel}/>
      </div>}
      {showPlatesCalculator && <div  style={styles(theme).confirmContainer}>
         <PlatesCalculator theme={theme} langIndex={langIndex} fSize={fSize} setShowCalculator={setShowPlatesCalculator}/>
      </div>}
      { premiumMiniPage && !UserData.hasPremium &&
        <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
                    <button onClick={() => {setPremiumMiniPage(false)}} style={{...styles(theme,fSize).btn,margin:'10px'}} >{langIndex === 0 ? 'Закрыть' : 'Close'}</button>
                </div>
      }
      {showConfirmPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).modalCard, height:'auto'}}>
           <div style={{...styles(theme,fSize).text, fontSize:'20px', marginBottom:'25px'}}>{langIndex === 0 ? "Завершить тренировку?" : "Finish session?"}</div>
           <div style={{display:'flex', width:'80%', justifyContent:'space-between'}}>
              <button onClick={() => setShowConfirmPanel(false)} style={styles(theme).secondaryBtn}><MdClose style={{fontSize:'28px'}}/></button>
              <button onClick={() => {onFinishSession()}} style={styles(theme).primaryBtn}><MdDone style={{fontSize:'28px'}}/></button>
           </div>
         </div>
      </div>}
      {showConfirmExercisePanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).modalCard, height:'auto'}}>
           <div style={{...styles(theme,fSize).text, fontSize:'20px', marginBottom:'25px'}}>{langIndex === 0 ? "Удалить упражнение?" : "Delete exercise?"}</div>
           <div style={{display:'flex', width:'80%', justifyContent:'space-between'}}>
              <button onClick={() => setShowConfirmExercisePanel(false)} style={styles(theme).secondaryBtn}><MdClose style={{fontSize:'28px'}}/></button>
              <button onClick={() => {removeexercise()}} style={{...styles(theme).primaryBtn, backgroundColor:Colors.get('skipped', theme)}}><FaTrash style={{fontSize:'20px'}}/></button>
           </div>
         </div>
      </div>}

      {/* --- FINISH SCREEN --- */}
      {showFinishPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).modalCard, height:'85%', justifyContent:'flex-start', paddingTop:'10px'}}>
           <div style={{...styles(theme,fSize).subtext ,fontSize:'18px',fontWeight:'bold',marginTop:'17px', color:Colors.get('done', theme) }}>{langIndex === 0 ? "Результаты тренировки" : "Session results"}</div>
           
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%', marginTop: '20px', paddingBottom:'20px', borderBottom: `1px solid ${Colors.get('border', theme)}`}}>
           <div style={styles(theme).statBox}>
            <div style={{...styles(theme,fSize).subtext, fontSize:'12px'}}>{langIndex === 0 ? "Время" : "Time"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'20px', fontWeight:'bold', margin:0}}>{formatDurationMs(session.duration)}</div>
           </div>
           <div style={styles(theme).statBox}>
            <div style={{...styles(theme,fSize).subtext, fontSize:'12px'}}>{langIndex === 0 ? "Тоннаж" : "Tonnage"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'20px', fontWeight:'bold', margin:0}}>{(tonnage * 0.001).toFixed(2) + (langIndex === 0 ? ' т' : ' t')}</div>
           </div>
           <div style={styles(theme).statBox}>
            <div style={{...styles(theme,fSize).subtext, fontSize:'12px'}}>{langIndex === 0 ? "Повторения" : "Reps"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'20px', fontWeight:'bold', margin:0}}>{allReps}</div>
           </div>
           <div style={styles(theme).statBox}>
            <div style={{...styles(theme,fSize).subtext, fontSize:'12px'}}>{langIndex === 0 ? "Сеты" : "Sets"}</div>
            <div style={{...styles(theme,fSize).text,fontSize:'20px', fontWeight:'bold', margin:0}}>{getAllSets(trainInfo.dayKey, trainInfo.dInd)}</div>
           </div>
           </div>
           
            

           <div style={{width: '100%',flex:1, overflowY:'scroll', display:'flex', flexDirection:'column', alignItems:'center' }}>
             <div style={{...styles(theme,fSize).subtext ,fontSize:'16px',fontWeight:'bold',marginTop:'17px', marginBottom:'10px' }}>{langIndex === 0 ? "Рекорды" : "Records"}</div>
            <img src="images/Medal.png" style={{ width: '60px', height: '60px', marginBottom:'10px' }} />
            {newRmRecords.length > 0 ? (
  
    <div
  style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    width: '100%',
    padding: '0 10px',      
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
          flexDirection: 'column',
          alignItems: 'center',
          backgroundColor:'rgba(255,255,255,0.05)',
          borderRadius:'12px',
          padding:'10px'
        }}
      >
            
            <div style={{ ...styles(theme, fSize).subtext, fontWeight: 'bold', textAlign: 'center', fontSize:'14px' }}>
              {exerciseObj.name[langIndex]}
            </div>
            <div style={{ ...styles(theme, fSize).text, fontSize: '20px', fontWeight:'bold', marginTop: '6px', color:Colors.get('iconsHighlited', theme) }}>
              {newRm} {langIndex === 0 ? 'кг' : 'kg'}
            </div>
            <div style={{ ...styles(theme, fSize).subtext, fontSize: '11px', marginTop: '4px', opacity:0.6 }}>
              {langIndex === 0 ? 'было' : 'was'} {oldRm > 0 ? `${oldRm} ${langIndex === 0 ? 'кг' : 'kg'}` : '-'}
            </div>
            <div style={{ 
              ...styles(theme, fSize).subtext, 
              fontSize: '12px', 
              fontWeight: 'bold',
              color: Colors.get('done', theme),
              marginTop: '4px'
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
  <div style={{ ...styles(theme, fSize).subtext, marginTop: '12px', fontStyle:'italic' }}>
    {langIndex === 0 ? "Новых рекордов нет" : "No new records"}
  </div>
)}
           </div>
           
           <button onClick={() => {setPage('TrainingMain')}} style={{...styles(theme).primaryBtn, width:'90%', marginTop:'15px'}}>
               <MdDone style={{fontSize:'24px', marginRight:'10px'}}/>
               {langIndex === 0 ? 'Завершить' : 'Finish'}
           </button>
         </div>
      </div>}
      {showExerciseList && (
        <div style={{...styles(theme).confirmContainer}}>
          <TrainingExercise needToAdd={true} setEx={addExercise} />
        </div>
      )}
      {/* strategy panel */}
        {showStarategyPanel && <div style={styles(theme).confirmContainer}>
                  <div style={{...styles(theme).modalCard, height:'auto', padding:'25px'}}>
                      <p style={{...styles(theme,false,false,fSize).text, textAlign:'center', fontSize:'18px', fontWeight:'bold', marginBottom:'20px'}}>{langIndex === 0 ? 'Стратегия выполнения' : 'Set Strategy'}</p>
                       <div style={{display:'flex', width:'100%', justifyContent:'center', marginBottom:'20px', backgroundColor:'rgba(0,0,0,0.2)', borderRadius:'12px', padding:'4px'}}>
                         <div onClick={() => {setStrategy(0)}} style={{...styles(theme).segmentBtn, width:'50%', backgroundColor: strategy === 0 ? Colors.get('iconsHighlited', theme) : 'transparent'}}>{langIndex === 0 ? "Повторы" : "Reps"}</div>
                         <div onClick={() => {setStrategy(1)}} style={{...styles(theme).segmentBtn, width:'50%', backgroundColor: strategy === 1 ? Colors.get('iconsHighlited', theme) : 'transparent'}}>{langIndex === 0 ? "Время" : "Time"}</div>
                       </div>
                       
                       {strategy === 0 && <div style={{display:'flex', justifyContent:'space-around', alignItems:'center', width:'100%', marginBottom:'25px'}}>
                         <div style={{display:'flex',flexDirection:'column', alignItems:'center'}}>
                           <IoIosArrowUp onClick={() => setSets(prev => prev + 1)} style={styles(theme).icon}/>
                             <div style={{...styles(theme).text,fontSize:'24px', fontWeight:'bold'}}>{sets}</div>
                           <IoIosArrowDown onClick={() => setSets(prev => prev - 1 > 0 ? prev - 1 : 1)} style={styles(theme).icon}/>
                           <span style={styles(theme).subtext}>{langIndex === 0 ? 'Сеты' : 'Sets'}</span>
                         </div>
                           <p style={{...styles(theme).text,fontSize:'20px', opacity:0.5}}>X</p>
                         <div style={{display:'flex',flexDirection:'column', alignItems:'center'}}>
                           <IoIosArrowUp onClick={() => setCurrentRepMin(prev => prev + 1)} style={styles(theme).icon}/>
                             <div style={{...styles(theme).text,fontSize:'24px', fontWeight:'bold'}}>{currentRepMin}</div>
                           <IoIosArrowDown onClick={() => setCurrentRepMin(prev => prev - 1 > 0 ? prev - 1 : 1)} style={styles(theme).icon}/>
                           <span style={styles(theme).subtext}>Min</span>
                         </div>
                           <p style={{...styles(theme).text,fontSize:'20px', opacity:0.5}}>-</p>
                         <div style={{display:'flex',flexDirection:'column', alignItems:'center'}}>
                           <IoIosArrowUp onClick={() => setCurrentRepMax(prev => prev + 1)} style={styles(theme).icon}/>
                             <div style={{...styles(theme).text,fontSize:'24px', fontWeight:'bold'}}>{currentRepMax}</div>
                           <IoIosArrowDown onClick={() => setCurrentRepMax(prev => (prev - 1 > currentRepMin + 2 ? prev - 1 : currentRepMin + 2))} style={styles(theme).icon}/>
                           <span style={styles(theme).subtext}>Max</span>
                         </div>
                       </div>}
                     
                       <button onClick={() => onAddExercise(true)} style={styles(theme).primaryBtn}>
                            <MdDone style={{fontSize:'22px'}}/>
                       </button>
                  </div>
        </div>}
    {showSuggestionToAdd && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).modalCard, height:'auto'}}>
           <div style={{...styles(theme,fSize).text, fontSize:'18px', textAlign:'center', marginBottom:'25px'}}>{langIndex === 0 ? "Добавить упражнение также в программу?" : "Add the exercise to the program too?"}</div>
           <div style={{display:'flex', width:'80%', justifyContent:'space-between'}}>
              <button onClick={() => onAddExercise(false)} style={styles(theme).secondaryBtn}>{langIndex === 0 ? 'Нет' : 'No'}</button>
              <button onClick={() => {setShowStarategyPanel(true);setShowSuggestionToAdd(false)}} style={styles(theme).primaryBtn}>{langIndex === 0 ? 'Да' : 'Yes'}</button>
           </div>
         </div>
      </div>}
    </div>
  )
}

export default TrainingCurrent

// Helper Styles
const numStyle = (theme,type) =>
({
 fontSize:'15px',
 fontWeight:'bold',
 color:type === 0 ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme),
 width:'25%',
 textAlign:'left',
 paddingLeft:'4px'
})

const numStylePrev = (theme) =>
({
 fontSize:'13px',
 color:Colors.get('subText', theme),
 width:'25%',
 textAlign:'left',
 paddingLeft:'4px',
 fontStyle: 'italic'
})

const spanStyle = (theme,isMore) =>
({
 fontSize:'10px',
 position: 'relative',
 top: '-4px',
 left: '2px',
 fontWeight:'bold',
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
     height: "92vh",
     top:'10vh',
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
  headerCard: {
      width: '95%',
      backgroundColor: Colors.get('bottomPanel', theme), // Or a slightly lighter shade
      borderRadius: '20px',
      padding: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      marginBottom: '15px',
      marginTop: '10px'
  },
  headerIcon: {
      fontSize: '20px',
      color: Colors.get('icons', theme)
  },
  toolIconWrapper: {
      width:'36px', 
      height:'36px', 
      borderRadius:'12px', 
      backgroundColor:'rgba(255,255,255,0.05)', 
      display:'flex', 
      alignItems:'center', 
      justifyContent:'center',
      cursor: 'pointer'
  },
  scrollView:
  {
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    overflowY:'scroll',
    width:'100%',
    overflowX:'hidden',
    height:'66vh',
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
     fontSize:'18px',
     color:Colors.get('icons', theme),
     cursor: 'pointer'
  },
   confirmContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center', // Center vertically for confirmations
    justifyContent: 'center',
    zIndex: 2900,
  },
  bottomSheet: {
      width: '90%',
      height:'60%',
      position: 'absolute',
      bottom: 0,
      backgroundColor: Colors.get('bottomPanel', theme),
      borderTopLeftRadius: '25px',
      borderTopRightRadius: '25px',
      padding: '15px 20px 30px 20px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -5px 20px rgba(0,0,0,0.3)'
  },
  modalCard: {
      width: '80%',
      backgroundColor: Colors.get('bottomPanel', theme),
      borderRadius: '24px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
  },
  inputCard: {
      flex: 1,
      height:'80px',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
  },
  circleBtn: {
      fontSize:'24px', 
      color:Colors.get('icons', theme), 
      padding:'8px', 
      borderRadius:'50%', 
      backgroundColor:'rgba(255,255,255,0.05)',
      cursor: 'pointer'
  },
  circleBtnSmall: {
      fontSize:'18px', 
      color:Colors.get('icons', theme), 
      padding:'8px', 
      borderRadius:'50%', 
      backgroundColor:'rgba(255,255,255,0.05)',
      cursor: 'pointer'
  },
  primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: Colors.get('done', theme),
      color: '#fff',
      border: 'none',
      borderRadius: '15px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: 'bold',
      boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  },
  secondaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:  Colors.get('skipped', theme),
      color: Colors.get('mainText', theme),
      border: 'none',
      borderRadius: '15px',
      padding: '12px 20px',
      fontSize: '16px'
  },
  segmentBtn: {
      flex: 1,
      textAlign: 'center',
      padding: '8px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      transition: 'all 0.2s'
  },
  slider:
  {
   width:'90%',
   alignSelf:'center',
   color:Colors.get('difficulty', theme),
  },
  actionBtnSmall: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: 'none',
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: '8px',
      padding: '8px 16px',
      cursor: 'pointer'
  },
  floatingMenu: {
      position: 'fixed',
      bottom: '90px',
      width: '88%',
      maxWidth: '400px',
      height: '40px',
      backgroundColor: theme === 'dark' ? 'rgba(15, 15, 15, 0.57)' : 'rgba(219, 219, 219, 0.46)', // Dark glass
      backdropFilter: 'blur(10px)',
      borderRadius: '30px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
      zIndex: 1000,
      border: `1px solid ${Colors.get('border', theme)}`
  },
  menuPillBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 16px',
      borderRadius: '20px',
      backgroundColor: theme === 'dark' ? 'rgba(28, 28, 28, 0.85)' : 'rgba(235, 235, 235, 0.46)',
      color: Colors.get('mainText', theme),
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      height: '20px'
  },
  menuIconBtn: {
      width: '40px', 
      height: '40px', 
      borderRadius: '50%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      cursor: 'pointer'
  },
  statBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      padding: '10px'
  },
  topSection: {
          width: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'rgba(0,0,0,0.05)', // Subtle backing for slider area
          borderRadius: '16px',
          padding: '15px',
          marginTop: '10px'
      },
      label: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          color: Colors.get('mainText', theme),
          marginBottom: '10px',
          fontFamily: 'sans-serif', // Ensure clean font
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
  const baseFontSize = '18px';
  const animatedFontSize = isPulsing ? '21px' : baseFontSize; 
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
        fontSize: animatedFontSize,
        fontWeight: 'bold',
        transition: 'font-size 0.2s ease-out', // smooth shrink-back
        lineHeight: 1,
        fontFamily:'monospace'
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
