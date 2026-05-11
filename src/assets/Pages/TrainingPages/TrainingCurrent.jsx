import React, {useState,useEffect,useRef} from 'react'
import { AppData,UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,trainInfo$,setPage} from '../../StaticClasses/HabitsBus'
import {addExerciseToSchedule} from '../../Classes/TrainingData.jsx'
import {findPreviousSimilarExercise, finishSession, addExerciseToSession,
   removeExerciseFromSession, addSet, finishExercise, redactSet,getAllReps,getTonnage,getAllSets,redactRPEandNote} from '../../StaticClasses/TrainingLogHelper'
import {FaTrash,FaPencilAlt,FaFlag,FaPlusCircle,FaDumbbell,FaCrown} from 'react-icons/fa'
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
import { getTrainingAccent } from './TrainingVisuals.js'

const timerSound = new Audio('Audio/Timer.wav');

// Arrays for Pickers
const setsRange = Array.from({ length: 20 }, (_, i) => i + 1); // 1 to 20
const repsRange = Array.from({ length: 102 }, (_, i) => i + 1); // 1 to 100
const weightIntRange = Array.from({ length: 500 }, (_, i) => i ); // 0 to 499
const weightDecRange = [ 0, 0.25, 0.5, 0.75]; // Fractional kg
const minutesRange = Array.from({ length: 60 }, (_, i) => i ); // 0 to 59
const secondsRange = Array.from({ length: 12 }, (_, i) => (i ) * 5); // 0, 5, 10... 55 (Step 5 for easier UX)

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
    // Session RPE & Notes
const [sessionRPE, setSessionRPE] = useState(5); // Default to 5
const [sessionNote, setSessionNote] = useState('');
const [showRPEPanel, setShowRPEPanel] = useState(false);
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
        if (!session) return;
        setProgram(session.programId != null ? AppData.programs[session.programId] || null : null);
        setDayIndex(session.dayIndex ?? null);
        setTonnage(session.tonnage || 0);
        setAllReps(getAllReps(value.dayKey, value.dInd));
        setSession(session); 
        setTrainInfo(value);
        setIsCompleted(session.completed);
        
        setSessionNote(session.note !== undefined ? session.note : '');
        setSessionRPE(session.RPE !== undefined ? session.RPE : 5);
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

    // Sync Min/Max Reps for Strategy
    useEffect(() => {
       setCurrentRepMax(prev => currentRepMin > prev ? currentRepMin : prev);
    }, [currentRepMin]);
    
    useEffect(() => {
         setCurrentRepMin(prev => currentRepMax < prev ? currentRepMax : prev);
    }, [currentRepMax])

    //timers
useEffect(() => {
  if (isCompleted) return;
  const interval = setInterval(() => {
    setDuration(Date.now() - time);
  }, 500);

  return () => clearInterval(interval);
}, [isCompleted, time]);
useEffect(() => {
  if (!timer || isCompleted) return;
  const startTime = Date.now() - currTimer; // restore actual start time of rest
  const interval = setInterval(() => {
  const elapsed = Date.now() - startTime;
  const newTimerValue = Math.min(elapsed, maxTimer);
  setCurrTimer(newTimerValue);
    if (newTimerValue >= maxTimer) {
      setTimer(false);
      timerSound.play();
      setCurrTimer(0);
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
    setShowConfirmPanel(false);
    setShowRPEPanel(true); // Show RPE/Notes modal first
};

const saveSessionWithRPE = async () => {
  try {
    const records = await finishSession(
      trainInfo.dayKey, 
      trainInfo.dInd, 
      sessionRPE, 
      sessionNote
    );
    
    setShowRPEPanel(false);
    setIsCompleted(true);
    setNewRmRecords(records);
    setShowFinishPanel(true);
  } catch (error) {
    console.error("Failed to finish session:", error);
    // Optional: Show user-friendly error message
  }
};
const addExercise = async (exId) => {
  if (session?.isFree || session?.programId == null) {
    await addExerciseToSession(trainInfo.dayKey, trainInfo.dInd, exId);
    setShowExerciseList(false);
    setSession({...AppData.trainingLog[trainInfo.dayKey][trainInfo.dInd]});
    return;
  }
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
  setSession({...AppData.trainingLog[trainInfo.dayKey][trainInfo.dInd]});
}
function onAddExercise(needToAdd){
  addExerciseToSession(trainInfo.dayKey, trainInfo.dInd, addExId);
    setShowConfirmExercisePanel(false);
    setShowSuggestionToAdd(false);
    setSession({...AppData.trainingLog[trainInfo.dayKey][trainInfo.dInd]});
    if(!needToAdd){
      return null;
    }
      if(session?.isFree || session?.programId == null || session?.dayIndex == null){
        setShowStarategyPanel(false);
        return null;
      }
      let currentStrategy = langIndex === 0 ? 'время' : 'time' ;
      if(strategy === 0)currentStrategy = sets + 'x' + currentRepMin + '-' + currentRepMax;
      addExerciseToSchedule(session.programId,session.dayIndex,addExId,currentStrategy);
      setShowStarategyPanel(false);
      setShowConfirmExercisePanel(false);
      setShowSuggestionToAdd(false);
    }
const isFreeSession = session?.isFree || session?.programId == null;
const sessionTitle = isFreeSession
  ? (langIndex === 0 ? 'Свободная тренировка' : 'Free workout')
  : (Array.isArray(program?.name) ? program?.name[langIndex] : program?.name);
const sessionSubtitle = isFreeSession
  ? (langIndex === 0 ? 'Добавляйте упражнения по ходу тренировки' : 'Add exercises as you go')
  : (program?.schedule?.[dayIndex]?.name?.[langIndex] || (langIndex === 0 ? 'Тренировка по программе' : 'Program workout'));
const exerciseEntries = Array.isArray(session?.exerciseOrder)
  ? session.exerciseOrder
      .map(exId => ({ exId, exercise: session.exercises?.[exId], exerciseObj: AppData.exercises?.[exId] }))
      .filter(({ exercise, exerciseObj }) => exercise && exerciseObj)
  : [];
const totalSetsLogged = exerciseEntries.reduce((sum, { exercise }) => sum + (exercise.sets?.length || 0), 0);
const completedExerciseCount = exerciseEntries.filter(({ exercise }) => exercise.completed).length;
const sessionProgress = exerciseEntries.length > 0
  ? Math.round((completedExerciseCount / exerciseEntries.length) * 100)
  : 0;
const currentDurationLabel = isCompleted ? formatDurationMs(session.duration) : formatDurationMs(duration);
const sessionStateLabel = isCompleted
  ? (langIndex === 0 ? 'Завершена' : 'Done')
  : (langIndex === 0 ? 'В процессе' : 'Active');
// render    
return (
      <div style={styles(theme).container}>
        <div style={styles(theme).panel}>
            <div style={styles(theme).headerCard}>
                <div style={styles(theme).heroTopRow}>
                    <div style={styles(theme).heroTitleBlock}>
                         <div style={styles(theme).sessionKicker}>
                            <span style={styles(theme).statusDot} />
                            {sessionStateLabel}
                         </div>
                         <div style={styles(theme,fSize).sessionTitle}>
                            {sessionTitle}
                         </div>
                         <div style={styles(theme,fSize).sessionSubtitle}>
                            {sessionSubtitle}
                         </div>
                    </div>
                    <div style={styles(theme).durationBadge}>
                        <div style={styles(theme).durationLabel}>
                          {langIndex === 0 ? 'Время' : 'Time'}
                        </div>
                        <div style={styles(theme).durationValue}>
                            {currentDurationLabel}
                        </div>
                    </div>
                </div>

                <div style={styles(theme).sessionProgressArea}>
                  <div style={styles(theme).progressLabelRow}>
                    <span>{langIndex === 0 ? 'Прогресс упражнений' : 'Exercise progress'}</span>
                    <strong>{sessionProgress}%</strong>
                  </div>
                  <div style={styles(theme).progressTrack}>
                    <div style={{...styles(theme).progressFill, width: `${sessionProgress}%`}} />
                  </div>
                </div>

                <div style={styles(theme).statGrid}>
                    <MetricTile theme={theme} label={langIndex === 0 ? 'Упражнения' : 'Exercises'} value={`${completedExerciseCount}/${exerciseEntries.length}`} />
                    <MetricTile theme={theme} label={langIndex === 0 ? 'Сеты' : 'Sets'} value={totalSetsLogged} />
                    <MetricTile theme={theme} label={langIndex === 0 ? 'Повторы' : 'Reps'} value={allReps} />
                    <MetricTile theme={theme} label={langIndex === 0 ? 'Тоннаж' : 'Volume'} value={`${(tonnage * 0.001).toFixed(2)}${langIndex === 0 ? ' т' : ' t'}`} />
                </div>

                {!isCompleted && (
                    <div style={styles(theme).sessionToolbar}>
                        <div style={styles(theme).restTimerPill}>
                             <ParsedTime time={currTimer} maxTime={maxTimer} theme={theme}/>
                        </div>
                        <button type="button" style={styles(theme).toolIconWrapper} onClick={() => {timer ? (setTimer(false), setCurrTimer(0)) : setTimer(true)}}>
                            {timer ? <TimerIcon style={styles(theme).headerIcon}/> : <TimerOffIcon style={styles(theme).headerIcon}/>}
                        </button>
                        <button type="button" style={styles(theme).toolIconWrapper} onClick={() => {setStopWatchPanel(true)}}>
                            <FaStopwatch style={styles(theme).headerIcon}/>
                        </button>
                        <button type="button" style={styles(theme).toolIconWrapper} onClick={() => {setShowPlatesCalculator(true)}}>
                            <FaCalculator style={styles(theme).headerIcon}/>
                        </button>
                        <button type="button" style={styles(theme).finishWorkoutBtn} onClick={() => {setShowConfirmPanel(true)}}>
                            <MdDone style={{fontSize:'18px'}}/>
                            {langIndex === 0 ? 'Завершить' : 'Finish'}
                        </button>
                    </div>
                )}
            </div> 

            <div style={styles(theme).scrollView}>
               {exerciseEntries.length > 0 ? (
               <div style={styles(theme).exerciseList}>
               {isCompleted &&  
              <div style={styles(theme).completionCard}>
                <div style={styles(theme).completionHeader}>
                  <div>
                    <div style={styles(theme).completionKicker}>{langIndex === 0 ? 'Итог' : 'Summary'}</div>
                    <div style={styles(theme,fSize).completionTitle}>
                      {langIndex === 0 ? 'Оценка тренировки' : 'Workout review'}
                    </div>
                  </div>
                  <div style={styles(theme).rpeBadge}>{sessionRPE}/10</div>
                </div>
                <div style={styles(theme).reviewSection}>
                  <div style={styles(theme).reviewLabel}>{langIndex === 0 ? "Уровень нагрузки (RPE)" : "Effort level (RPE)"}</div>
                  <Slider
                    style={styles(theme).rpeSlider}
                    min={1}
                    max={10}
                    step={1}
                    value={sessionRPE}
                    valueLabelDisplay="off"
                    onChange={(_, newValue) => setSessionRPE(newValue)}
                  />
                  <div style={styles(theme).rpeLabels}>
                    <span>{langIndex === 0 ? "Легко" : "Easy"}</span>
                    <span>{langIndex === 0 ? "Умеренно" : "Moderate"}</span>
                    <span>{langIndex === 0 ? "Тяжело" : "Hard"}</span>
                    <span>{langIndex === 0 ? "Максимум" : "Max"}</span>
                  </div>
                </div>
                <div style={styles(theme).reviewSection}>
                  <div style={styles(theme).reviewLabel}>{langIndex === 0 ? "Заметки о тренировке" : "Training notes"}</div>
                  <textarea
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder={langIndex === 0
                        ? "Как прошла тренировка? Что удалось, что стоит изменить?"
                        : "How was the session? What worked, what should change?"}
                    style={styles(theme).notesTextarea}
                  />
                </div>
                <button
                    type="button"
                    onClick={() => redactRPEandNote(trainInfo.dayKey,trainInfo.dInd,sessionRPE,sessionNote)}
                    style={styles(theme).saveReviewBtn}
                >
                    <MdDone style={{ fontSize: '18px' }} />
                    {langIndex === 0 ? "Сохранить оценку" : "Save review"}
                </button>
              </div>}
               {exerciseEntries.map(({ exId, exercise, exerciseObj }) => {
                const exerciseName = exerciseObj.name[langIndex];
                const isSelected = currentExId === exId;
                const setCount = exercise.sets?.length || 0;
                const exerciseReps = getExerciseReps(exercise);
                const topWeight = getExerciseTopWeight(exercise);
                const exerciseVolume = getExerciseVolume(exercise);
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
                
                return (
                 <div key={exId} style={{
                     ...styles(theme).exerciseCard,
                     border: isSelected ? `1px solid ${getTrainingAccent().hue}` : styles(theme).exerciseCard.border,
                     boxShadow: isSelected ? `0 18px 45px rgba(${getTrainingAccent().rgb}, 0.14)` : styles(theme).exerciseCard.boxShadow
                 }}>
                 <div onClick={() => {setCurrentExId(prev => prev === exId ? -1 : exId)}} style={styles(theme).exerciseHeader}>
                    <div style={styles(theme).exerciseTitleGroup}>
                        <div style={{
                          ...styles(theme).exerciseStatusIcon,
                          background: exercise.completed ? getTrainingAccent().hue : (theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'),
                          color: exercise.completed ? '#fff' : Colors.get('subText', theme)
                        }}>
                          {exercise.completed ? <MdDone /> : setCount}
                        </div>
                        <div style={styles(theme).exerciseTitleBlock}>
                          <div style={{
                            ...styles(theme, fSize).exerciseTitle,
                            color: isSelected ? getTrainingAccent().hue : Colors.get('mainText', theme)
                          }}>
                            {exerciseName}
                          </div>
                          <div style={styles(theme).exerciseMetaRow}>
                            <span>{setCount} {langIndex === 0 ? 'сетов' : 'sets'}</span>
                            <span>{exerciseReps} {langIndex === 0 ? 'повт.' : 'reps'}</span>
                            {topWeight > 0 && <span>{topWeight} {langIndex === 0 ? 'кг' : 'kg'}</span>}
                            {plannedSets && <span>{plannedSets}</span>}
                          </div>
                        </div>
                    </div>
                    <div style={styles(theme).exerciseRightSide}>
                      {exerciseVolume > 0 && (
                        <div style={styles(theme).exerciseVolumePill}>
                          {(exerciseVolume * 0.001).toFixed(2)} {langIndex === 0 ? 'т' : 't'}
                        </div>
                      )}
                      {isSelected ? <IoIosArrowUp style={styles(theme).icon} /> : <IoIosArrowDown style={styles(theme).icon} />}
                    </div>
                 </div>

                  {isSelected && <div style={styles(theme).setTableHeader}>
                      <div style={{...styles(theme,fSize).setHeaderText, width:'10%'}}>#</div>
                      <div style={styles(theme,fSize).setHeaderText}>{langIndex === 0 ? 'Повт.' : 'Reps'}</div>
                      <div style={styles(theme,fSize).setHeaderText}>{langIndex === 0 ? 'Вес' : 'Kg'}</div>
                      <div style={styles(theme,fSize).setHeaderText}>{langIndex === 0 ? 'Время' : 'Time'}</div>
                      <div style={{width:'38px'}} />
                  </div>}

                 {isSelected && <div style={styles(theme).setsList}>
                   { exercise.sets.map((set, setIndex) => (
                  <div key={setIndex} style={styles(theme).setRow}>
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
                         <button type="button" onClick={() => {onRedactSet(exId,setIndex)}} style={styles(theme).setEditBtn}>
                            <FaPencilAlt style={{fontSize:'12px', color:Colors.get('icons', theme)}} />
                         </button>
                      </div>
                   </div> 
                ))}

                {usePrev &&  
                   <div style={styles(theme).prevSetRow}>
                      <div style={{...numStylePrev(theme), width:'10%', border:'none'}}>{exercise.sets.length + 1}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),true)}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false)}</div>
                      <div style={{...numStylePrev(theme), border:'none'}}>{prevResult(exId,exercise.sets.length,new Date(trainInfo.dayKey),false,true)}</div>
                   </div>
                }
                  <div style={styles(theme).exerciseActionBar}>
                     <button type="button" style={styles(theme).actionBtnSmall('danger')} onClick={() => {onRemoveExercise(exId)}} aria-label={langIndex === 0 ? 'Удалить упражнение' : 'Remove exercise'}>
                        <FaTrash style={{fontSize:'14px'}}/>
                     </button>
                     <button type="button" style={styles(theme).addSetBtn} onClick={() => {onNewset(exId,exercise.sets.length)}}>
                        <FaPlus style={{fontSize:'13px'}}/> {langIndex===0? 'Добавить сет':'Add set'}
                     </button>
                     {!isCompleted && !exercise.completed && 
                     <button type="button" style={styles(theme).actionBtnSmall('success')} onClick={() => {onFinishExercise(exId)}} aria-label={langIndex === 0 ? 'Завершить упражнение' : 'Finish exercise'}>
                        <FaFlag style={{fontSize:'14px'}}/>
                     </button>}
                  </div>
                
                </div>}
               </div>
              );
             })}

             </div>
               ) : (
                <div style={styles(theme).emptySessionState}>
                  <div style={styles(theme).emptySessionIcon}><FaDumbbell /></div>
                  <div style={{...styles(theme, fSize).text, fontWeight: 800, marginBottom: '6px'}}>
                    {langIndex === 0 ? 'Начните с упражнения' : 'Start with an exercise'}
                  </div>
                  <div style={{...styles(theme, fSize).subtext, textAlign: 'center', maxWidth: '280px'}}>
                    {langIndex === 0
                      ? 'Эта тренировка не привязана к программе. Добавьте первое упражнение и ведите сет за сетом.'
                      : 'This workout is not tied to a program. Add the first exercise and log it set by set.'}
                  </div>
                </div>
               )}
            {!isCompleted && <div style={styles(theme).floatingMenu}>
             <div onClick={() => {setShowExerciseList(true)}} style={styles(theme).menuPillBtn}>
               <FaPlus style={{fontSize:'14px', marginRight:'6px'}}/>
               {langIndex === 0 ? 'Упражнение' : 'Exercise'}
             </div>

             {!isCompleted && !isFreeSession &&  <div onClick={() => {needPrev(prev => !prev)}}
                  style={{...styles(theme).menuPillBtn,
                          backgroundColor: usePrev ? Colors.get('barsColorMeasures', theme) : theme === 'dark' ? 'rgba(28, 28, 28, 0.85)' : 'rgba(235, 235, 235, 0.46)',
                          color: usePrev ? Colors.get('background', theme) : Colors.get('subText', theme),
                          border: usePrev ? 'none' : `1px solid ${Colors.get('border', theme)}`
                  }}>
               <MdOutlineHistory style={{fontSize:'16px', marginRight:'6px'}}/>
               {langIndex === 0 ? 'История' : 'History'}
             </div>}
        </div>}
        </div>
        </div>

        {/* --- BOTTOM FLOATING MENU --- */}
        


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
{/* --- RPE & NOTES PANEL --- */}
{showRPEPanel && (
    <div style={styles(theme).confirmContainer}>
        <div style={{
            ...styles(theme).modalCard,
            height: 'auto',
            padding: '25px',
            maxWidth: '450px',
            width: '90%'
        }}>
            <div style={{
                ...styles(theme, fSize).text,
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center'
            }}>
                {langIndex === 0 ? "Завершение тренировки" : "Finish Session"}
            </div>

            {/* RPE Slider Section */}
            <div style={{
                ...styles(theme).inputCard,
                width:'80vw',
                height: 'auto',
                padding: '20px',
                marginBottom: '15px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <div style={{
                        ...styles(theme, fSize).subtext,
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {langIndex === 0 ? "Уровень нагрузки (RPE)" : "Effort Level (RPE)"}
                    </div>
                    <div style={{
                        ...styles(theme, fSize).text,
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: Colors.get('iconsHighlited', theme)
                    }}>
                        {sessionRPE}/10
                    </div>
                </div>

                <Slider
                    style={{
                        width: '100%',
                        alignSelf: 'center',
                        color: Colors.get('difficulty', theme)
                    }}
                    min={1}
                    max={10}
                    step={1}
                    value={sessionRPE}
                    valueLabelDisplay="off"
                    onChange={(_, newValue) => setSessionRPE(newValue)}
                />

                {/* RPE Scale Labels */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    fontSize: '11px',
                    color: Colors.get('subText', theme)
                }}>
                    <span>{langIndex === 0 ? "Легко" : "Easy"}</span>
                    <span>{langIndex === 0 ? "Умеренно" : "Moderate"}</span>
                    <span>{langIndex === 0 ? "Тяжело" : "Hard"}</span>
                    <span>{langIndex === 0 ? "Максимум" : "Max"}</span>
                </div>
            </div>

            {/* Notes Textarea */}
            <div style={{
                ...styles(theme).inputCard,
                 width:'80vw',
                height: 'auto',
                padding: '15px',
                marginBottom: '20px'
            }}>
                <div style={{
                    ...styles(theme, fSize).subtext,
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '10px'
                }}>
                    {langIndex === 0 ? "Заметки о тренировке" : "Training Notes"}
                </div>
                <textarea
                    value={sessionNote}
                    onChange={(e) => setSessionNote(e.target.value)}
                    placeholder={langIndex === 0 
                        ? "Как прошла тренировка? Что удалось/не удалось? Погода, самочувствие..." 
                        : "How was the session? What worked/didn't work? Weather, mood..."}
                    style={{
                        width: '100%',
                        height: '100px',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${Colors.get('border', theme)}`,
                        borderRadius: '12px',
                        padding: '12px',
                        color: Colors.get('mainText', theme),
                        fontSize: '14px',
                        fontFamily: 'Segoe UI',
                        resize: 'none',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Action Buttons */}
            <div style={{
                display: 'flex',
                gap: '15px',
                width: '100%'
            }}>
                <button
                    onClick={() => {
                        setShowRPEPanel(false);
                        setShowConfirmPanel(true);
                    }}
                    style={{
                        ...styles(theme).secondaryBtn,
                        flex: 1,
                        padding: '14px'
                    }}
                >
                    <MdClose style={{ fontSize: '24px', marginRight: '8px' }} />
                    {langIndex === 0 ? "Назад" : "Back"}
                </button>
                <button
                    onClick={saveSessionWithRPE}
                    style={{
                        ...styles(theme).primaryBtn,
                        flex: 2,
                        padding: '14px'
                    }}
                >
                    <MdDone style={{ fontSize: '24px', marginRight: '8px' }} />
                    {langIndex === 0 ? "Сохранить" : "Save"}
                </button>
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
        <div onClick={(e) => e.stopPropagation()}
            style={{
                position: 'fixed', inset: 0, zIndex: 2555,
                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: theme === 'dark' ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                backdropFilter: 'blur(20px)', textAlign: 'center'
            }}>
            <div style={{
                width: '72px', height: '72px', background: 'rgba(159,180,196,0.12)',
                borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px', border: '1px solid rgba(159,180,196,0.22)',
            }}>
                <FaCrown size={30} color="#9FB4C4" />
            </div>
            <div style={{
                fontSize: '13px', lineHeight: '1.6',
                color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                marginBottom: '24px', maxWidth: '210px',
            }}>
                {langIndex === 0 ? 'Откройте полный доступ ко всем функциям' : 'Unlock full access to all features'}
            </div>
            <button onClick={() => setPage('premium')} style={{
                fontSize: '15px', fontWeight: '700', color: '#fff', background: '#9FB4C4',
                border: 'none', borderRadius: '14px', padding: '13px 0', marginBottom: '10px',
                cursor: 'pointer', boxShadow: '0 4px 16px rgba(159,180,196,0.35)', width: '220px',
            }}>
                {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
            </button>
            <button onClick={() => setPremiumMiniPage(false)} style={{
                fontSize: '13px', fontWeight: '500',
                color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                background: 'transparent', border: 'none', padding: '8px 20px', cursor: 'pointer',
            }}>
                {langIndex === 0 ? '← Закрыть' : '← Close'}
            </button>
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
            <img src="images/Medal.png" style={{ width: '100px', marginBottom:'10px' }} />
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
                         <div onClick={() => {setStrategy(0)}} style={{...styles(theme).segmentBtn, width:'50%', backgroundColor: strategy === 0 ? Colors.get('difficulty', theme) : 'transparent'}}>{langIndex === 0 ? "Повторы" : "Reps"}</div>
                         <div onClick={() => {setStrategy(1)}} style={{...styles(theme).segmentBtn, width:'50%', backgroundColor: strategy === 1 ? Colors.get('difficulty', theme) : 'transparent'}}>{langIndex === 0 ? "Время" : "Time"}</div>
                       </div>
                       
                       {strategy === 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                             {/* Sets */}
                             <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>SETS</span>
                                <ScrollPicker items={setsRange} value={sets} onChange={setSets} theme={theme} width="60px" />
                             </div>
                             
                             <span style={{ fontSize: '20px', color: Colors.get('subText', theme), marginTop:'15px' }}>×</span>
                             
                             {/* Min */}
                             <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>MIN</span>
                                <ScrollPicker items={repsRange} value={currentRepMin} onChange={setCurrentRepMin} theme={theme} width="60px" />
                             </div>
                             
                             <span style={{ fontSize: '20px', color: Colors.get('subText', theme), marginTop:'15px' }}>-</span>
                             
                             {/* Max */}
                             <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>MAX</span>
                                <ScrollPicker items={repsRange} value={currentRepMax} onChange={setCurrentRepMax} theme={theme} width="60px" />
                             </div>
                          </div>
                        )}
                      
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

const styles = (theme,fSize) => {
  const accent = getTrainingAccent();
  const isLight = theme === 'light' || theme === 'speciallight';
  const fontStack = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Arial, sans-serif';
  const pageBg = isLight
    ? `radial-gradient(circle at 50% -15%, rgba(${accent.rgb}, 0.14), transparent 38%), #F5F7FA`
    : `radial-gradient(circle at 50% -12%, rgba(${accent.rgb}, 0.18), transparent 42%), #0B0F14`;
  const panelBg = isLight
    ? 'rgba(255,255,255,0.86)'
    : 'rgba(17, 22, 29, 0.92)';
  const cardBg = isLight
    ? 'rgba(255,255,255,0.92)'
    : 'linear-gradient(145deg, rgba(23, 30, 39, 0.98), rgba(14, 19, 25, 0.96))';
  const border = isLight ? 'rgba(15,23,42,0.09)' : 'rgba(148,163,184,0.13)';
  const muted = Colors.get('subText', theme);

  return ({
    container: {
      background: pageBg,
      display: 'flex',
      position: 'absolute',
      flexDirection: 'column',
      overflowY: 'auto',
      overflowX: 'hidden',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: '100dvh',
      top: 0,
      width: '100vw',
      boxSizing: 'border-box',
      padding: '20px 0 132px',
      fontFamily: fontStack,
      color: Colors.get('mainText', theme),
    },
    panel: {
      display:'flex',
      flexDirection:'column',
      width: '100%',
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: '18px',
      boxSizing: 'border-box',
    },
    headerCard: {
      width: 'min(92vw, 760px)',
      background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(241,245,249,0.92))'
        : 'linear-gradient(145deg, rgba(17,24,39,0.96), rgba(3,7,18,0.92))',
      borderRadius: '30px',
      padding: '24px',
      boxSizing: 'border-box',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.14)'}`,
      boxShadow: isLight ? '0 20px 45px rgba(15,23,42,0.08)' : '0 28px 70px rgba(0,0,0,0.42)',
      marginTop: '0',
    },
    heroTopRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      width: '100%',
    },
    heroTitleBlock: {
      minWidth: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    sessionKicker: {
      width: 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      padding: '7px 10px',
      borderRadius: '999px',
      background: isLight ? 'rgba(14,165,233,0.12)' : 'rgba(56,189,248,0.12)',
      color: '#38BDF8',
      fontSize: '12px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    },
    statusDot: {
      width: '7px',
      height: '7px',
      borderRadius: '99px',
      background: '#38BDF8',
      boxShadow: '0 0 12px rgba(56,189,248,0.55)',
      flexShrink: 0,
    },
    sessionTitle: {
      fontSize: fSize === 0 ? '25px' : '29px',
      lineHeight: 1.08,
      fontWeight: 850,
      color: Colors.get('mainText', theme),
      margin: 0,
      letterSpacing: 0,
      textAlign: 'left',
    },
    sessionSubtitle: {
      fontSize: fSize === 0 ? '13px' : '15px',
      lineHeight: 1.35,
      color: muted,
      maxWidth: '440px',
      textAlign: 'left',
    },
    durationBadge: {
      minWidth: '96px',
      borderRadius: '22px',
      padding: '12px 14px',
      background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(0,0,0,0.26)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(148,163,184,0.08)'}`,
      textAlign: 'right',
      boxSizing: 'border-box',
    },
    durationLabel: {
      fontSize: '10px',
      color: muted,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '4px',
    },
    durationValue: {
      color: Colors.get('mainText', theme),
      fontSize: '24px',
      fontWeight: 850,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },
    sessionProgressArea: {
      marginTop: '22px',
    },
    progressLabelRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      color: muted,
      fontSize: '12px',
      fontWeight: 750,
      marginBottom: '9px',
    },
    progressTrack: {
      height: '8px',
      borderRadius: '999px',
      overflow: 'hidden',
      background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)',
    },
    progressFill: {
      height: '100%',
      borderRadius: '999px',
      background: 'linear-gradient(90deg, #14B8A6, #38BDF8)',
      transition: 'width 0.25s ease',
    },
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(118px, 1fr))',
      gap: '10px',
      marginTop: '16px',
    },
    metricTile: {
      minHeight: '68px',
      borderRadius: '18px',
      padding: '12px',
      background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)',
      border: `1px solid ${border}`,
      boxSizing: 'border-box',
    },
    metricLabel: {
      fontSize: '11px',
      color: muted,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: '7px',
    },
    metricValue: {
      color: Colors.get('mainText', theme),
      fontSize: '21px',
      fontWeight: 850,
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },
    sessionToolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      marginTop: '16px',
      padding: '10px',
      borderRadius: '20px',
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(148,163,184,0.10)'}`,
    },
    restTimerPill: {
      minWidth: '38px',
      minHeight: '38px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIcon: {
      fontSize: '19px',
      color: Colors.get('icons', theme),
    },
    toolIconWrapper: {
      width:'42px',
      height:'42px',
      borderRadius:'15px',
      background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.055)',
      border: `1px solid ${border}`,
      display:'flex',
      alignItems:'center',
      justifyContent:'center',
      cursor: 'pointer',
      padding: 0,
      flexShrink: 0,
    },
    finishWorkoutBtn: {
      minHeight: '42px',
      border: 'none',
      borderRadius: '15px',
      background: 'linear-gradient(135deg, #EF4444, #DC2626)',
      color: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '0 16px',
      fontSize: '13px',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: '0 12px 28px rgba(239,68,68,0.26)',
    },
    scrollView: {
      display:'flex',
      flexDirection:'column',
      alignItems:'center',
      width:'100%',
      overflow: 'visible',
    },
    exerciseList: {
      display: 'flex',
      flexDirection: 'column',
      width: 'min(92vw, 760px)',
      gap: '12px',
      paddingBottom: '96px',
      boxSizing: 'border-box',
    },
    exerciseCard: {
      display: 'flex',
      flexDirection: 'column',
      background: panelBg,
      borderRadius: '22px',
      padding: '14px',
      border: `1px solid ${border}`,
      boxShadow: isLight ? '0 14px 34px rgba(15,23,42,0.06)' : '0 18px 42px rgba(0,0,0,0.22)',
      boxSizing: 'border-box',
    },
    exerciseHeader: {
      display:'flex',
      justifyContent:'space-between',
      alignItems:'center',
      gap: '14px',
      cursor: 'pointer',
      minHeight: '58px',
    },
    exerciseTitleGroup: {
      display:'flex',
      alignItems:'center',
      gap:'12px',
      minWidth: 0,
      flex: 1,
    },
    exerciseStatusIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      fontWeight: 850,
      flexShrink: 0,
    },
    exerciseTitleBlock: {
      minWidth: 0,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    exerciseTitle: {
      fontSize: fSize === 0 ? '16px' : '18px',
      lineHeight: 1.18,
      fontWeight: 850,
      margin: 0,
      letterSpacing: 0,
      textAlign: 'left',
    },
    exerciseMetaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      color: muted,
      fontSize: '12px',
      fontWeight: 700,
    },
    exerciseRightSide: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexShrink: 0,
    },
    exerciseVolumePill: {
      borderRadius: '999px',
      padding: '7px 9px',
      background: `rgba(${accent.rgb}, ${isLight ? 0.11 : 0.16})`,
      color: accent.hue,
      fontSize: '12px',
      fontWeight: 850,
      whiteSpace: 'nowrap',
    },
    setTableHeader: {
      display: 'flex',
      alignItems: 'center',
      margin: '14px 0 6px',
      padding: '0 8px',
      gap: '8px',
    },
    setHeaderText: {
      width: '25%',
      fontSize: '11px',
      color: muted,
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },
    setsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
    },
    setRow: {
      display: 'flex',
      alignItems:'center',
      gap: '8px',
      minHeight: '42px',
      padding:'8px',
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius:'13px',
      boxSizing: 'border-box',
    },
    setEditBtn: {
      width: '32px',
      height: '32px',
      border: 'none',
      borderRadius: '11px',
      background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      cursor: 'pointer',
    },
    prevSetRow: {
      display: 'flex',
      alignItems:'center',
      padding:'10px 8px',
      borderTop:`1px dashed ${border}`,
      opacity:0.72,
    },
    exerciseActionBar: {
      display: 'flex',
      marginTop:'12px',
      paddingTop:'12px',
      borderTop:`1px solid ${border}`,
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px',
      background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(0,0,0,0.16)',
      borderRadius: '18px',
      padding: '12px',
    },
    addSetBtn: {
      flex: 1,
      minHeight: '44px',
      border: 'none',
      borderRadius: '15px',
      background: `linear-gradient(135deg, ${accent.hue}, #2F80ED)`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '13px',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: `0 12px 28px rgba(${accent.rgb}, 0.22)`,
    },
    completionCard: {
      width: '100%',
      borderRadius: '26px',
      padding: '18px',
      background: isLight ? 'rgba(255,255,255,0.94)' : 'rgba(17,22,29,0.94)',
      border: `1px solid ${border}`,
      boxShadow: isLight ? '0 18px 40px rgba(15,23,42,0.07)' : '0 20px 48px rgba(0,0,0,0.25)',
      boxSizing: 'border-box',
    },
    completionHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      marginBottom: '16px',
    },
    completionKicker: {
      color: accent.hue,
      fontSize: '11px',
      fontWeight: 850,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      marginBottom: '5px',
    },
    completionTitle: {
      color: Colors.get('mainText', theme),
      fontSize: fSize === 0 ? '18px' : '21px',
      fontWeight: 850,
      lineHeight: 1.15,
    },
    rpeBadge: {
      minWidth: '76px',
      height: '48px',
      borderRadius: '17px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `rgba(${accent.rgb}, ${isLight ? 0.12 : 0.18})`,
      color: accent.hue,
      fontSize: '22px',
      fontWeight: 900,
      fontVariantNumeric: 'tabular-nums',
    },
    reviewSection: {
      borderRadius: '20px',
      padding: '14px',
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${border}`,
      marginBottom: '12px',
      boxSizing: 'border-box',
    },
    reviewLabel: {
      fontSize: '12px',
      fontWeight: 850,
      color: muted,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      marginBottom: '10px',
    },
    rpeSlider: {
      width: '100%',
      alignSelf: 'center',
      color: accent.hue,
    },
    rpeLabels: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: '6px',
      marginTop: '6px',
      fontSize: '11px',
      color: muted,
      fontWeight: 700,
      textAlign: 'center',
    },
    notesTextarea: {
      width: '100%',
      minHeight: '116px',
      background: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(0,0,0,0.18)',
      border: `1px solid ${border}`,
      borderRadius: '16px',
      padding: '13px',
      color: Colors.get('mainText', theme),
      fontSize: '15px',
      lineHeight: 1.45,
      fontFamily: fontStack,
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
    },
    saveReviewBtn: {
      width: '100%',
      minHeight: '46px',
      border: 'none',
      borderRadius: '16px',
      background: `linear-gradient(135deg, ${accent.hue}, #2F80ED)`,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      fontSize: '14px',
      fontWeight: 850,
      cursor: 'pointer',
      boxShadow: `0 14px 28px rgba(${accent.rgb}, 0.24)`,
    },
    emptySessionState: {
      width: 'min(92vw, 760px)',
      minHeight: '240px',
      borderRadius: '26px',
      border: `1px dashed ${border}`,
      background: panelBg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '28px',
      boxSizing: 'border-box',
      textAlign: 'center',
    },
    emptySessionIcon: {
      width: '62px',
      height: '62px',
      borderRadius: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '14px',
      color: accent.hue,
      background: `rgba(${accent.rgb}, ${isLight ? 0.12 : 0.16})`,
      fontSize: '24px',
    },
    text: {
      textAlign: 'left',
      fontSize: fSize === 0 ? '13px' : '15px',
      color: Colors.get('mainText', theme),
      marginBottom:'5px',
      fontFamily: fontStack,
    },
    mainText: {
      color: Colors.get('mainText', theme),
      fontSize: fSize === 0 ? '14px' : '16px',
      fontWeight: 800,
      fontFamily: fontStack,
    },
    subtext: {
      fontSize: fSize === 0 ? '11px' : '13px',
      color: muted,
      fontFamily: fontStack,
    },
    icon: {
      fontSize:'18px',
      color:Colors.get('icons', theme),
      cursor: 'pointer',
      flexShrink: 0,
    },
    confirmContainer: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(14px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2900,
      fontFamily: fontStack,
    },
    bottomSheet: {
      width: 'min(92vw, 520px)',
      maxHeight:'86dvh',
      position: 'absolute',
      bottom: 0,
      background: cardBg,
      borderTopLeftRadius: '28px',
      borderTopRightRadius: '28px',
      padding: '16px 20px 30px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 -18px 45px rgba(0,0,0,0.32)',
      boxSizing: 'border-box',
    },
    modalCard: {
      width: 'min(90vw, 480px)',
      background: cardBg,
      borderRadius: '26px',
      padding: '22px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 24px 64px rgba(0,0,0,0.34)',
      border: `1px solid ${border}`,
      boxSizing: 'border-box',
    },
    inputCard: {
      flex: 1,
      minHeight:'80px',
      background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)',
      borderRadius: '18px',
      fontSize:'16px',
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: `1px solid ${border}`,
      boxSizing: 'border-box',
    },
    circleBtn: {
      fontSize:'24px',
      color:Colors.get('icons', theme),
      padding:'8px',
      borderRadius:'50%',
      backgroundColor:'rgba(255,255,255,0.05)',
      cursor: 'pointer',
    },
    circleBtnSmall: {
      fontSize:'18px',
      color:Colors.get('icons', theme),
      padding:'8px',
      borderRadius:'50%',
      backgroundColor:'rgba(255,255,255,0.05)',
      cursor: 'pointer',
    },
    primaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${accent.hue}, #2F80ED)`,
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      padding: '12px 20px',
      fontSize: '16px',
      fontWeight: 850,
      boxShadow: `0 12px 25px rgba(${accent.rgb}, 0.24)`,
      cursor: 'pointer',
    },
    secondaryBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
      color: Colors.get('mainText', theme),
      border: `1px solid ${border}`,
      borderRadius: '16px',
      padding: '12px 20px',
      fontSize: '16px',
      cursor: 'pointer',
    },
    segmentBtn: {
      flex: 1,
      textAlign: 'center',
      padding: '8px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: 750,
      transition: 'all 0.2s',
      cursor: 'pointer',
    },
    slider: {
      width:'90%',
      alignSelf:'center',
      color: accent.hue,
    },
    actionBtnSmall: (tone = 'neutral') => {
      const toneMap = {
        danger: { color: '#FB7185', bg: isLight ? 'rgba(239,68,68,0.10)' : 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.28)' },
        success: { color: '#34D399', bg: isLight ? 'rgba(16,185,129,0.10)' : 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.28)' },
        neutral: { color: Colors.get('icons', theme), bg: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)', border }
      };
      const current = toneMap[tone] || toneMap.neutral;
      return ({
      width: '46px',
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${current.border}`,
      background: current.bg,
      color: current.color,
      borderRadius: '15px',
      padding: 0,
      cursor: 'pointer',
      flexShrink: 0,
      });
    },
    floatingMenu: {
      position: 'fixed',
      left: '50%',
      bottom: '92px',
      transform: 'translateX(-50%)',
      width: 'min(88vw, 420px)',
      minHeight: '50px',
      background: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(14, 19, 25, 0.82)',
      backdropFilter: 'blur(18px)',
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      padding: '6px 8px',
      boxShadow: '0 18px 45px rgba(0,0,0,0.32)',
      border: `1px solid ${border}`,
      zIndex: 1100,
      boxSizing: 'border-box',
    },
    menuPillBtn: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 16px',
      borderRadius: '999px',
      background: `linear-gradient(135deg, ${accent.hue}, #2F80ED)`,
      color: '#fff',
      fontSize: '14px',
      fontWeight: 850,
      cursor: 'pointer',
      minHeight: '38px',
      flex: 1,
      maxWidth: '100%',
      whiteSpace: 'nowrap',
    },
    menuIconBtn: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)',
      flexShrink: 0,
    },
    statBox: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: '12px',
      padding: '10px',
    },
    topSection: {
      width: '85%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.05)',
      borderRadius: '18px',
      padding: '15px',
      marginTop: '10px',
    },
    label: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      color: Colors.get('mainText', theme),
      marginBottom: '10px',
      fontFamily: fontStack,
    },
  });
}

function MetricTile({ theme, label, value }) {
  return (
    <div style={styles(theme).metricTile}>
      <div style={styles(theme).metricLabel}>{label}</div>
      <div style={styles(theme).metricValue}>{value}</div>
    </div>
  );
}

function getExerciseReps(exercise) {
  return (exercise?.sets || []).reduce((sum, set) => sum + (Number(set.reps) || 0), 0);
}

function getExerciseTopWeight(exercise) {
  const top = (exercise?.sets || []).reduce((max, set) => Math.max(max, Number(set.weight) || 0), 0);
  return Number.isInteger(top) ? top : top.toFixed(2);
}

function getExerciseVolume(exercise) {
  return (exercise?.sets || []).reduce((sum, set) => {
    const reps = Number(set.reps) || 0;
    const weight = Number(set.weight) || 0;
    return sum + reps * weight;
  }, 0);
}

function Difference({ exId, setIndex, beforeDate, value, isReps, theme, isTime = false }) {
  const exIdStr = String(exId);
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
  const exIdStr = exId.toString();
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
           '1. ВЫБЕРИТЕ ДЕНЬ: Нажмите на дату в календаре.\n' +
           '2. СОЗДАЙТЕ ТРЕНИРОВКУ: Нажмите на кнопку добавления, чтобы начать новую сессию.\n' +
           '3. ДОБАВЬТЕ УПРАЖНЕНИЯ: Используйте кнопку добавления упражнения.\n' +
           '4. ЗАПОЛНИТЕ ПОДХОДЫ: Укажите повторения и вес. Тоннаж считается автоматически.\n' +
           '5. РЕДАКТИРУЙТЕ: Откройте нужный подход и измените данные.\n' +
           '6. ЗАВЕРШИТЕ: Сохраните тренировку через кнопку завершения.';
  }
  
  return 'HOW TO USE:\n' +
         '1. SELECT A DAY: Tap a date in the calendar.\n' +
         '2. START TRAINING: Tap the add button to begin a new session.\n' +
         '3. ADD EXERCISES: Use the add exercise button.\n' +
         '4. LOG SETS: Enter reps and weight. Tonnage is calculated automatically.\n' +
         '5. EDIT: Open a set and change its data.\n' +
         '6. FINISH: Save the workout with the finish button.';
}
