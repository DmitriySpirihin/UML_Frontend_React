import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage,setTrainInfo,setShowPopUpPanel} from '../../StaticClasses/HabitsBus'
import {getTrainingSummary,addNewSession,addPreviousSession,deleteSession} from '../../StaticClasses/TrainingLogHelper.js'
import { FaTrash } from "react-icons/fa"
import {useLongPress} from '../../Helpers/LongPress.js'
import {MdClose,MdDone} from 'react-icons/md'
import {FiMinus,FiPlus} from 'react-icons/fi'

export let addNewDay = () => {};
// Monday-based weekday index helper (Mon=0 ... Sun=6)
const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
// Monday-based weekday index helper (Mon=0 ... Sun=6)
const getMondayIndex = (d) => (d.getDay() + 6) % 7;
const dateKey = formatDateKey(new Date());
const clickSound = new Audio('Audio/Click.wav');


const TrainingMain = () => {
    // states
   const [theme, setthemeState] = React.useState('dark');
       const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
       const [date, setDate] = useState(new Date());
       const [currentDate, setCurrentDate] = useState(date);
       const [trainingAmount, setTrainingAmount] = useState(0);
       const [fSize, setFSize] = useState(AppData.prefs[4]); 
       const [showNewSessionPanel, setShowNewSessionPanel] = useState(false);  
       const [showPreviousSessionPanel, setShowPreviousSessionPanel] = useState(false);  
       const [showConfirmPanel,setShowConfirmPanel] = useState(false);
       const [programId,setProgrammId] = useState(AppData.getLastProgramId());
       const [dayIndex,setDayIndex] = useState(AppData.getLastTrainingDayIndex());
       const [startTime, setStartTime] = useState(16 * 3600000); 
       const [endTime, setEndTime] = useState(17 * 3600000);
       const [sessionToDelete,setSessionToDelete] = useState({date:'',key:0});
       const STEP = 10 * 60 * 1000; 
       const DAY_MS = 24 * 3600000;
       // subscriptions
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
       
       const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
       const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
       const daysInMonth = lastDayOfMonth.getDate();
       const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
       const daysOfWeek = [['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']];
       const fullNames = [['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
       ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']];
       const bindStartMinus = useLongPress(() => setStartTime(prev => (prev - STEP + DAY_MS) % DAY_MS));
       const bindStartPlus = useLongPress(() => setStartTime(prev => (prev + STEP) % DAY_MS));
       const bindEndMinus = useLongPress(() => setEndTime(prev => {
         const newTime = (prev - STEP + DAY_MS) % DAY_MS;
         return newTime >= startTime ? newTime : prev; // Prevent endTime < startTime
    }));
      const bindEndPlus = useLongPress(() => setEndTime(prev => (prev + STEP) % DAY_MS));
       const calendarCells = [];
       const weeks = [];
       for (let i = 0; i < firstDayOfWeek; i++) {
         calendarCells.push(null);
       }
       for (let i = 1; i <= daysInMonth; i++) {
         calendarCells.push(i);
       }
       for (let i = 0; i < calendarCells.length; i+=7) {
         weeks.push(calendarCells.slice(i, i + 7));
       } 
       const prevMonth = () => {setDate(new Date(date.getFullYear(), date.getMonth() - 1));playEffects(clickSound);};
       const nextMonth = () =>{  setDate(new Date(date.getFullYear(), date.getMonth() + 1));playEffects(clickSound);};

       const onAddNewDay = () => {
        const today = new Date();
       if (currentDate > today) return;
        const currentDateKey = formatDateKey(currentDate);
        const todayKey = formatDateKey(today);

        if (currentDateKey === todayKey) {
          setShowNewSessionPanel(true);
        } else {
         setShowPreviousSessionPanel(true);
       }
     };
       addNewDay = onAddNewDay;
       const onSessionStart = () => {
          addNewSession(new Date(),programId,dayIndex);
          setShowNewSessionPanel(false);
          setTimeout(() => {
           const today = new Date();
           const dayKey = formatDateKey(today);
           const sessionIndex = AppData.trainingLog[dayKey].length - 1;
           setTrainInfo({mode:'new',dayKey:formatDateKey(new Date()),dInd:sessionIndex});
           setPage('TrainingCurrent');
          },100);
       }
       const onAddPreviousSessionAdd = () => {
       
          if (endTime <= startTime) {
            setShowPopUpPanel(langIndex === 0 ? "Время окончания должно быть позже начала" : "End time must be after start time",2000,false);
          return;
           }
          addPreviousSession(currentDate, programId, dayIndex, startTime, endTime);
          setShowPreviousSessionPanel(false);
          const dayKey = formatDateKey(currentDate);
          const sessionIndex = AppData.trainingLog[dayKey].length - 1;
          setTrainInfo({mode:'redact',dayKey:dayKey,dInd:sessionIndex});
          setPage('TrainingCurrent');
       }
       const onDelete = (_date,dayIndex) => {
          setSessionToDelete({date:_date,key:dayIndex});
       }
       const onConfirmDelete = () => {
         deleteSession(sessionToDelete.date,sessionToDelete.key);
         setShowConfirmPanel(false);
         setShowPopUpPanel(langIndex === 0 ? "Тренировка удалена" : "Session deleted",2000,true);
       }
       // render    
       return (
           <div style={styles(theme).container}>
             <div style={styles(theme).panel}>
               <div style={styles(theme).calendarHead}>
                 <h1 style={styles(theme).header}>{date.getFullYear() + '/' + (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1)}</h1>
                 <div onClick={prevMonth}><h1 style={styles(theme).header}>{'<'}</h1></div>
                 <div onClick={nextMonth}><h1 style={styles(theme).header}>{'>'}</h1></div>
               </div>
               <table style={styles(theme).table}>
                 <thead>
                   <tr>
                     {daysOfWeek[langIndex].map((day) => (
                       <th key={day}><p style={{textAlign:'center',fontSize:'12px',color:day === 'Вс' || day === 'Sun' ? '#873535ff' : Colors.get('subText', theme)}}>{day}</p></th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                     {weeks.map((week,i)=>(
                    <tr key={i}>
                      {week.map((day,j)=>{
                        const cellMonth = date.getMonth();
                        const cellYear = date.getFullYear();
                        const isChoosen = day === currentDate.getDate() && cellMonth === currentDate.getMonth() && cellYear === currentDate.getFullYear();
                        const dayKey = formatDateKey(new Date(cellYear,cellMonth,day));
                        const trAmount = dayKey in AppData.trainingLog ? AppData.trainingLog[dayKey].length : 0;
                        let pendingAmount = 0;
                        let doneAmount = 0;
                        if(trAmount > 0){
                          AppData.trainingLog[dayKey].forEach(tr => {
                             if(!tr.completed)pendingAmount++;
                             else doneAmount++;
                          });
                        }
                        
                        return(
                        <td key={j}>
                          <div  style={{...styles(theme).cell,border:`3px solid ${isChoosen ? Colors.get('currentDateBorder', theme) : Colors.get('background', theme)}`, backgroundColor:Colors.get('background', theme),}}
                            onClick={() => {setCurrentDate(new Date(Date.UTC(cellYear, cellMonth, day)));setTrainingAmount(trAmount);playEffects(clickSound);}}   >
                            {day}
                            {trAmount > 0 && 
                              <div style={{display:'flex',flexDirection:'row',marginTop:'10px'}}>
                                {pendingAmount > 0 && <div style={{fontSize:'10px',color:Colors.get('done', theme),lineHeight:'5px'}}>{'⏳'}</div>}
                                {pendingAmount > 0 && <div style={{fontSize:'11px',color:Colors.get('subText', theme),lineHeight:'5px'}}>{pendingAmount}</div>}
                                {doneAmount > 0 && <div style={{fontSize:'10px',color:Colors.get('done', theme),lineHeight:'5px'}}>{'✅'}</div>}
                                {doneAmount > 0 && <div style={{fontSize:'11px',color:Colors.get('subText', theme),lineHeight:'5px'}}>{doneAmount}</div>}
                              </div>
                            }
                          </div>
                        </td>
                      )
                    })}
                    </tr>
                  ))}
                   </tbody>
               </table>
             </div>
             <div style={{height:'30vh',width:'95%',display:'flex',flexDirection:'column',alignContent:'center'}}>
              <h1 style={{...styles(theme).subtext,fontSize:'18px',textAlign: "center"}}>{currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' ' + fullNames[langIndex][getMondayIndex(currentDate)] + ' / ' + trainingAmountText(trainingAmount,langIndex) }</h1>
              <div style={styles(theme).scrollView}>
                {AppData.trainingLog[formatDateKey(currentDate)]?.map((training,index) =>(
                  <div key={index} style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center',width:'100%',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                    <p style={{...styles(theme).mainText,marginBottom:'10px',fontSize:'16px'}}>{(index + 1)}</p>
                    <p style={{...styles(theme).mainText,marginBottom:'10px',fontSize:'16px'}}>{training.completed ? '✅' : '⏳'}</p>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      <div 
                      onClick={()=>{setTrainInfo({mode:training.completed ? 'redact' : 'new',dayKey:formatDateKey(new Date(currentDate)),dInd:training.dayIndex});setPage('TrainingCurrent')}}
                      style={styles(theme).mainText}>{AppData.programs.find(p => p.id === training.programId).name[langIndex]}</div>
                      <div style={styles(theme).mainText}>{(langIndex === 0 ? 'День ' : 'Day ') + (index + 1) + ': ' + AppData.programs.find(p => p.id === training.programId).schedule[training.dayIndex].name[langIndex]}</div>
                       {training.completed && <div style={{...styles(theme).subtext,marginBottom:'10px'}}>{`${Math.round(training.duration / 60000)}${langIndex === 0 ? ' мин' : ' min'}  /  ${training.tonnage * 0.001} ${langIndex === 0 ? ' тонн' : ' tons'}${getTrainingSummary(training,langIndex)}`}</div>}
                    </div>
                    <FaTrash onClick={()=>{onDelete(formatDateKey(new Date(currentDate)),training.dayIndex);setShowConfirmPanel(true);}} style={{...styles(theme).subtext,width:'18px',height:'18px',marginLeft:'auto',marginRight:'10px'}}/>
                  </div>
                ))}
                
              </div>
             </div>
        {showConfirmPanel && <div  style={styles(theme).confirmContainer}>
          <div style={{...styles(theme).cP,height:'20%'}}>
          <div style={{...styles(theme,fSize).text}}>{langIndex === 0 ? "Удалить тренировку?" : "Delete session?"}</div>
            <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowConfirmPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onConfirmDelete()}}/>
            </div>
          </div>
        </div>}
        {showNewSessionPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'50%'}}>
          <p style={{...styles(theme,fSize).mainText,marginBottom:'10px'}}>{langIndex === 0 ? 'Начать тренировку?' : 'Start training?'}</p>

            <select style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}} onChange={(e) => setProgrammId(e.target.value)}>
                {renderProgramOptions(theme, langIndex,fSize)}
              </select>
              <select style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}} onChange={(e) => setDayIndex(e.target.value)}>
                {renderTrainingDaysOptions(theme, langIndex,fSize,programId)}
              </select>
            
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowNewSessionPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onSessionStart()}}/>
            </div>
         </div>
        </div>}
        {showPreviousSessionPanel && <div  style={styles(theme).confirmContainer}>
         <div style={{...styles(theme).cP,height:'50%'}}>
          <p style={{...styles(theme,fSize).mainText,marginBottom:'10px'}}>{langIndex === 0 ? 'Добавить предыдущую тренировку?' : 'Add previous training?'}</p>
          <select style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}} onChange={(e) => setProgrammId(e.target.value)}>
                {renderProgramOptions(theme, langIndex,fSize)}
              </select>
              <select style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}} onChange={(e) => setDayIndex(e.target.value)}>
                {renderTrainingDaysOptions(theme, langIndex,fSize,programId)}
              </select>
          {/* Start Time */}
          <p style={{...styles(theme,fSize).mainText,marginBottom:'10px'}}>{langIndex === 0 ? 'Начало тренировки' : 'Training start time'}</p>
          <div style={{...styles(theme).simplePanelRow, width:'70%'}}>
           <div {...bindStartMinus}  onClick={() => setStartTime(prev => (prev - STEP + DAY_MS) % DAY_MS)} style={{...styles(theme).icon, fontSize:'20px', marginTop:'15px',userSelect:'none',touchAction:'none'}}>
           <FiMinus /></div>
          <p style={{...styles(theme).text, fontSize:'20px', marginTop:'15px'}}>{formatTime(startTime)}</p>
          <div {...bindStartPlus}  onClick={() => setStartTime(prev => (prev + STEP) % DAY_MS)} style={{...styles(theme).icon, fontSize:'20px', marginTop:'15px',userSelect:'none',touchAction:'none'}}>
          <FiPlus /> </div></div>
           {/* End Time */}
           <p style={{...styles(theme,fSize).mainText,marginBottom:'10px'}}>{langIndex === 0 ? 'Окончание тренировки' : 'Training end time'}</p>
          <div style={{...styles(theme).simplePanelRow, width:'70%'}}>
           <div {...bindEndMinus}  onClick={() => {const newTime = (endTime - STEP + DAY_MS) % DAY_MS;if (newTime >= startTime) setEndTime(newTime);}} style={{...styles(theme).icon, fontSize:'20px', marginTop:'15px',userSelect:'none',touchAction:'none'}}>
          <FiMinus />
          </div> <p style={{...styles(theme).text, fontSize:'20px', marginTop:'15px'}}> {formatTime(endTime)} </p>
           <div  {...bindEndPlus}  onClick={() => setEndTime(prev => (prev + STEP) % DAY_MS)} style={{...styles(theme).icon, fontSize:'20px', marginTop:'15px',userSelect:'none',touchAction:'none'}}>
          <FiPlus />
         </div>
        </div>
           <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
              <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowPreviousSessionPanel(false)}/>
              <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onAddPreviousSessionAdd()}}/>
            </div>
         </div>
        </div>}
   </div>
  )
}

export default TrainingMain

const renderProgramOptions = (theme, langIndex, fSize) => {
  return AppData.programs.map((program) => (
    <option 
      key={program.id} 
      value={program.id} 
      style={{ ...styles(theme, false, fSize).text }}
    >
      {program.name[langIndex]}
    </option>
  ));
};
const renderTrainingDaysOptions = (theme, langIndex, fSize, programId) => {
  const program = AppData.programs.find(p => p.id === programId);
  
  if (!program || !program.schedule) {
    return [<option key="none" value="">0</option>];
  }

  return program.schedule.map((day, index) => (
    <option 
      key={index} 
      value={index} 
      style={{ ...styles(theme, false, fSize).text }}
    >
      {day.name[langIndex]}
    </option>
  ));
};

const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     paddingTop:'5vh',
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
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
  },
  scrollView :
  {
    display:'flex',
    flexDirection:'column',
    alignItems:'flex-start',
    justifyContent:'flex-start',
    width:'100%',
    height:'100%',
    overflowY:'scroll',
    backgroundColor:Colors.get('trainingGroup', theme),
    borderRadius:'12px'
  },
  mainText :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginLeft: "10px",
    marginBottom:'2px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginLeft: "10px",
    marginBottom:'12px'
  },
  calendarHead:
    {
      display:'flex',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      width:'100%',
      height:'10%',
      background:Colors.get('headGradient', theme)
    },
    header:
    {
      fontFamily: "Segoe UI",
      padding:'2vw',
      marginLeft:'6vw',
      marginRight:'6vw',
      fontSize: "36px",
      fontWeight: "bold",
      color: Colors.get('subText', theme),
    },
    table:
    {
      border:'5',
      cellPadding:'5',
      borderCollapse:'collapse',
      width:'90%',
      textAlign:'center',
    },
    cell:
    {
       boxSizing:'border-box',
       display:'flex',
       flexDirection:'column',
       alignItems:'center',
       justifyContent:'flex-start',
       width:'13vw',
       height:'13vw',
       borderRadius:'12px',
       fontSize:'16px',
       fontWeight:'bold',
       color: Colors.get('mainText', theme),
       fontFamily: "Segoe UI",
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
const trainingAmountText = (trainingAmount,langIndex) => {
  if(trainingAmount == 0) return langIndex == 0 ? 'нет тренировок' : 'no trainings';
  if(trainingAmount == 1) return langIndex == 0 ? '1 тренировка' : '1 training';
  if(trainingAmount > 1 && trainingAmount < 5) return trainingAmount + (langIndex == 0 ? ' тренировки' : ' trainings');
  return trainingAmount + (langIndex == 0 ? ' тренировок' : ' trainings');
}
const formatTime = (ms) => {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};