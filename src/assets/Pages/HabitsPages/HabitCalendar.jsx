import React, {useState,useEffect} from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import {theme$ ,lang$, emitHabitsChanged} from '../../StaticClasses/HabitsBus'
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';


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
const isDoneSound = new Audio('Audio/IsDone.wav'); 
const skipSound = new Audio('Audio/Skip.wav');

// dynamic list that includes defaults + current custom habits
function getAllHabits() {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
  );
}

const HabitCalendar = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [date, setDate] = useState(new Date());
    const [currentDate, setCurrentDate] = useState(date);
    const [inFoPanelData, setInfoPanelData] = useState(false);

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
    const prevMonth = () => {setDate(new Date(date.getFullYear(), date.getMonth() - 1));playEffects(clickSound,50);};
    const nextMonth = () =>{  setDate(new Date(date.getFullYear(), date.getMonth() + 1));playEffects(clickSound,50);};
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
                    <th key={day}><p style={{textAlign:'center',fontSize:'14px',color:day === 'Вс' || day === 'Sun' ? '#873535ff' : Colors.get('subText', theme)}}>{day}</p></th>
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
                        let percent = '';
                        let status = 0;
                        if(Object.keys(AppData.habitsByDate).includes(dayKey)){
                            const allHabitsOfCurrentDay = Array.from(Object.values(AppData.habitsByDate[dayKey]));
                            const allHabitsOfDay = allHabitsOfCurrentDay.length;
                            const doneHabitsOfDay = allHabitsOfCurrentDay.filter((v) => v === 1).length;
                            const percentNum = allHabitsOfDay > 0 ? Math.round((doneHabitsOfDay/allHabitsOfDay)*100) : 0;
                            percent = percentNum + '%';
                            status = percentNum >= 100 ? 1 : -1;
                        }
                        
                        return(
                        <td key={j}>
                          <div  style={{...styles(theme).cell,
                            border:`3px solid ${isChoosen ? Colors.get('currentDateBorder', theme) : Colors.get('background', theme)}`,
                            backgroundColor:day < 1 ? Colors.get('background', theme) : status === 1 ? Colors.get('habitCardDone', theme) : status === -1 ? Colors.get('habitCardSkipped', theme) : Colors.get('background', theme),
                        }}
                            onClick={() => {setCurrentDate(new Date(cellYear, cellMonth, day));setInfoPanelData(AppData.hasKey(formatDateKey(new Date(cellYear, cellMonth, day))));playEffects(clickSound,50);}}   >
                            {day}
                            {day > 0 && <div style={{fontSize:'8px',color:Colors.get('subText', theme),lineHeight:'5px',paddingBottom:'7px'}}>{percent}</div>}
                          </div>
                        </td>
                      )
                    })}
                    </tr>
                  ))}
                </tbody>
            </table>
            
          <div style={{height:'60%',width:'100%',paddingTop:'15px'}}>
          {inFoPanelData && <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <div style={{borderTop: `1px solid ${Colors.get('border', theme)}`,}}>
                <h1 style={{...styles(theme).header,fontSize:'22px',paddingTop:'1px',paddingBottom:'5px'}}>{currentDate.getDate() + '/' + (currentDate.getMonth() + 1) + '/' + currentDate.getFullYear() + ' ' + fullNames[langIndex][getMondayIndex(currentDate)]}</h1>
                <div style={{fontSize:'10px',color:Colors.get('subText', theme),lineHeight:'1px',paddingRight:'50%'}}>{habitAmountString(currentDate,langIndex)}</div>
            </div>
            <div style={styles(theme).scrollView}>
              <Habit theme={theme} langIndex={langIndex} date={currentDate}/>
            </div>
          </div>}
          </div>
          </div>
        </div>
    )
}

export default HabitCalendar

const Habit = ({theme, langIndex, date}) => {
    const dateKey = formatDateKey(date);
    if(!AppData.hasKey(dateKey)) return null;
    const habits = Object.entries(AppData.habitsByDate[dateKey]);
    return (
        habits.map(([id, initStatus]) => {
          const numId = Number(id);
          const found = getAllHabits().find(habit => habit.id === numId);
          const name = found ? found.name[langIndex] : "";
          return (
              <HabitRow
                  key={`${dateKey}-${id}`}
                  id={numId}
                  name={name}
                  theme={theme}
                  date={date}
                  statusInit={initStatus}
                  langIndex={langIndex}
              />
          )
        })
    )
}

const HabitRow = ({ id, name, theme, date, statusInit,langIndex }) => {
    const [status, setStatus] = useState(statusInit);
    const [canDrag, setCanDrag] = useState(true);
    const maxX = 100;
    const minX = -100;
    const x = useMotionValue(0);
    const constrainedX = useTransform(x, [-1, 1], [minX, maxX]);

    // sync local status when switching dates or when the source status changes
    useEffect(() => {
        setStatus(statusInit);
    }, [statusInit, date]);

    const onDrag = (event, info) => {
        const dx = info.offset.x;
        if (Math.abs(dx) > maxX) {
            if (!canDrag) return;
            let newStatus = status;
            if (dx > 0) {
                // right: 1 if 0, 0 if -1
                if (status === 0) newStatus = 1;
                else if (status === -1) newStatus = 0;
            } else {
                // left: -1 if 0, 0 if 1
                if (status === 0) newStatus = -1;
                else if (status === 1) newStatus = 0;
            }
            if (newStatus !== status) {
                const dayKey = formatDateKey(date);
                AppData.changeStatus(dayKey, id, newStatus);
                setStatus(newStatus);
                emitHabitsChanged();
                if (newStatus === 1) {
                    if(AppData.prefs[2] == 0)playEffects(isDoneSound,80)
                }else if(newStatus === -1){
                    if(AppData.prefs[2] == 0)playEffects(skipSound,80);
                }
                if(AppData.prefs[3] == 0)navigator.vibrate?.(50);
            }
            setCanDrag(false);
            animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        }
    };

    const onDragEnd = () => {
        animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        setCanDrag(true);
    };

    return (
        <motion.div
            id={`cal-${id}`}
            style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'center',lineHeight:'2px', x: constrainedX}}
            drag={canDrag ? 'x' : false}
            dragConstraints={{ left: minX, right: status === 1 ? 0 : maxX }}
            dragElastic={0}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
        >
            <p style={{...styles(theme).text,fontSize:'14px', paddingLeft:'30px'}}>{name}</p>
            {status === 1 ? (
                <Check style={{...styles(theme).icon,color:'#2e9741ff'}}/>
            ) : status === -1 ? (
                <Close style={{...styles(theme).icon,color:'#973939ff'}}/>
            ) : null}
            
        </motion.div>
    );
}
  
const styles = (theme) =>
({
     container :
       {
         backgroundColor:Colors.get('background', theme),
         display: "flex",
         flexDirection: "column",
         justifyContent: "start",
         alignItems: "center",
         height: "100vh",
         width: "100vw",
         fontFamily: "Segoe UI",
      },
      panel :
      {
        display:'flex',
        flexDirection:'column',
        width: "90vw",
        height: "160vw",
        position:'absolute',
        top:'51%',
        left:'49%',
        transform:'translate(-50%,-50%)',
        alignItems: "center",
        justifyContent: "start",
        borderRadius: "24px",
        border: `1px solid ${Colors.get('border', theme)}`,
        margin: "5px",
        background:Colors.get('background', theme),
        boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`
      },
  calendarHead:
  {
    margin:'2px',
    display:'flex',
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    width:'98%',
    height:'20%',
    background:Colors.get('headGradient', theme),
    borderTopLeftRadius:'24px',
    borderTopRightRadius:'24px',
  },
  header:
  {
    fontFamily: "Segoe UI",
    padding:'5vw',
    marginLeft:'3vw',
    fontSize: "36px",
    fontWeight: "bold",
    color: Colors.get('subText', theme),
    top:'36%',
    left:'50%',
    margin: "5px",
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
     justifyContent:'center',
     width:'9vw',
     height:'9vw',
     borderRadius:'12px',
     fontSize:'20px',
     fontWeight:'bold',
     color: Colors.get('mainText', theme),
     fontFamily: "Segoe UI",
  },
  text :
  {
    fontFamily: "Segoe UI",
    fontSize: "18px",
    color: Colors.get('mainText', theme),
  },
  subText :
  {
    fontFamily: "Segoe UI",
    fontSize: "10px",
    color: Colors.get('subText', theme),
  },
  scrollView:
  {
    margin:'15px',
    overflowY: "scroll",
    width:'65vw',
    height:'20vh',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    borderRadius:'24px',
    backgroundColor:'rgba(0,0,0,0.1)'
  },
  icon:
  {
    paddingLeft:'8px',
    width:'25px',
  }
})

function habitAmountString(date,langIndex)
{
   const names = [['привычка','привычки','привычек'],['habit','habits','habits']];
   const dateKey = formatDateKey(date);
   if(AppData.hasKey(dateKey))
   {
       const amount = Object.values(AppData.habitsByDate[dateKey]).length;
       return amount + ' ' + names[langIndex][amount === 1 ? 0 : amount > 1 && amount < 5 ? 1 : 2];
   }
   return '0 ' + names[langIndex][2];
}
function playEffects(sound,vibrationDuration ){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.currentTime = 0;
    }
    else{
      sound.volume = 0.5;
      sound.play();
    }
  }
  if(AppData.prefs[3] == 0)navigator.vibrate(vibrationDuration);
}
  