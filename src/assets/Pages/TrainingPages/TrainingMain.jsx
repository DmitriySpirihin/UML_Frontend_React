import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage,setTrainInfo} from '../../StaticClasses/HabitsBus'
import {getTrainingSummary} from '../../StaticClasses/TrainingLogHelper.js'
import { BsJournalText } from "react-icons/bs";

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
                            onClick={() => {setCurrentDate(new Date(cellYear, cellMonth, day));setTrainingAmount(trAmount);playEffects(clickSound);}}   >
                            {day}
                            {trAmount > 0 && 
                              <div style={{display:'flex',flexDirection:'row',marginTop:'10px'}}>
                                {pendingAmount > 0 && <div style={{fontSize:'10px',color:Colors.get('done', theme),lineHeight:'5px'}}>{'⏳'}</div>}
                                {pendingAmount > 0 && <div style={{fontSize:'11px',color:Colors.get('subText', theme),lineHeight:'5px'}}>{pendingAmount}</div>}
                                {doneAmount > 0 && <div style={{fontSize:'10px',color:Colors.get('done', theme),lineHeight:'5px'}}>{'🏋️‍♂️'}</div>}
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
              {trainingAmount > 0 && <div style={styles(theme).scrollView}>
                {AppData.trainingLog[formatDateKey(new Date(currentDate))].map((training,index) =>(
                  <div key={index} style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center',width:'100%',borderBottom:`1px solid ${Colors.get('border', theme)}`}}>
                    <p style={{...styles(theme).mainText,marginBottom:'10px',fontSize:'16px'}}>{(index + 1)}</p>
                    <p style={{...styles(theme).mainText,marginBottom:'10px',fontSize:'16px'}}>{training.completed ? '✅' : '⏳'}</p>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      <div style={styles(theme).mainText}>{AppData.programs.find(p => p.id === training.programId).name[langIndex]}</div>
                      <div style={styles(theme).mainText}>{(langIndex === 0 ? 'День ' : 'Day ') + (index + 1) + ': ' + AppData.programs.find(p => p.id === training.programId).schedule[training.dayIndex].name[langIndex]}</div>
                       {training.completed && <div style={{...styles(theme).subtext,marginBottom:'10px'}}>{`${Math.round(training.duration / 60000)}${langIndex === 0 ? ' мин' : ' min'}  /  ${training.tonnage * 0.001} ${langIndex === 0 ? ' тонн' : ' tons'}${getTrainingSummary(training,langIndex)}`}</div>}
                    </div>
                    <BsJournalText onClick={()=>{setTrainInfo({mode:training.completed ? 'redact' : 'new',dayKey:formatDateKey(new Date(currentDate)),dInd:training.dayIndex});setPage('TrainingCurrent')}} style={{...styles(theme).subtext,width:'18px',height:'18px',marginLeft:'auto',marginRight:'10px'}}/>
                  </div>
                ))}
                
              </div>}
             </div>
           </div>
       )
}

export default TrainingMain



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