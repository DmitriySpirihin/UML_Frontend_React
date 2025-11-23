import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$, globalTheme$} from '../../StaticClasses/HabitsBus'

// Monday-based weekday index helper (Mon=0 ... Sun=6)
const getMondayIndex = (d) => (d.getDay() + 6) % 7;
const clickSound = new Audio('/Audio/Click.wav');


const TrainingMain = () => {
    // states
   const [theme, setthemeState] = React.useState('dark');
       const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
       const [date, setDate] = useState(new Date());
       const [currentDate, setCurrentDate] = useState(date);
       const [trainingAmount, setTrainingAmount] = useState(0);
   
       // subscriptions
       React.useEffect(() => {
           const subscription = theme$.subscribe(setthemeState);  
           return () => subscription.unsubscribe();
       }, []);
       
       React.useEffect(() => {
           const subscription = lang$.subscribe((lang) => {
               setLangIndex(lang === 'ru' ? 0 : 1);
           });
           return () => subscription.unsubscribe();
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
                          const isChoosen = day === currentDate.getDate() && date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
                           return(
                           <td key={j}>
                             <div  style={{...styles(theme).cell,
                               border:`3px solid ${isChoosen ? Colors.get('currentDateBorder', theme) : Colors.get('background', theme)}`,
                               backgroundColor:Colors.get('background', theme)
                           }}
                               onClick={() => {setCurrentDate(new Date(date.getFullYear(), date.getMonth(), day));playEffects(clickSound);}}   >
                               {day}
                             </div>
                           </td>
                         )
                       })}
                       </tr>
                     ))}
                   </tbody>
               </table>
             </div>
             <div style={{height:'15vh'}}>
              <h1 style={{...styles(theme).subtext,fontSize:'16px'}}>{currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' ' + fullNames[langIndex][getMondayIndex(currentDate)] + ' / ' + trainingAmountText(trainingAmount,langIndex) }</h1>
              
             </div>
           </div>
       )
}

export default TrainingMain



const styles = (theme) =>
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
     top:'15vh',
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
  mainText :
  {
    textAlign: "left",
    fontSize: "10px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: "8px",
    color: Colors.get('subText', theme),
    marginLeft: "30px",
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
       fontSize:'14px',
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
  if(trainingAmount > 1 && trainingAmount < 5) return langIndex == 0 ? '2 тренировки' : '2 trainings';
  return trainingAmount + (langIndex == 0 ? ' тренировок' : ' trainings');
}