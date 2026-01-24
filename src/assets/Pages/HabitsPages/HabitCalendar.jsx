import React, {useState,useEffect} from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import Icons from '../../StaticClasses/Icons'; 

// ВАЖНО: Импорты как в HabitsMain
import { expandedCard$, setExpandedCard } from '../../StaticClasses/HabitsBus.js';
import { theme$ ,lang$,fontSize$, emitHabitsChanged, setPage } from '../../StaticClasses/HabitsBus'

import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import {MdDoneAll} from 'react-icons/md'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getMondayIndex = (d) => (d.getDay() + 6) % 7;
const clickSound = new Audio('Audio/Click.wav');
const isDoneSound = new Audio('Audio/IsDone.wav'); 
const skipSound = new Audio('Audio/Skip.wav');

function getAllHabits() {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
  );
}

// --- СТИЛИ ---
const styles = (theme,fSize) => ({
     container : {
         backgroundColor: Colors.get('background', theme),
         display: "flex", flexDirection: "column", justifyContent: "start", alignItems: "center",
         height: "88vh",marginTop:'100px', width: "100vw", fontFamily: "Segoe UI, Roboto, Helvetica, sans-serif",
         overflow: 'hidden', paddingTop: '10px'
      },
      panel : {
        display:'flex', flexDirection:'column', width: "100%", maxWidth: '500px', height: "100%",
        alignItems: "center", justifyContent: "start", backgroundColor: Colors.get('background', theme),
        position: 'relative', overflow: 'hidden'
      },
      calendarHead: {
        padding: '15px 20px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between',marginTop:'20px',
        width:'100%', boxSizing: 'border-box', backgroundColor: Colors.get('background', theme), zIndex: 2
      },
      headerWrapper: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', minWidth: '150px' // Keeps arrows stable
      },
      header: {
        fontFamily: "Segoe UI", fontSize: "20px", margin: 0, fontWeight: "700",
        color: Colors.get('mainText', theme), textTransform: 'capitalize',
        whiteSpace: 'nowrap'
      },
      navBtn: {
          padding: '8px', borderRadius: '12px', cursor: 'pointer',
          backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s', zIndex: 10
      },
      tableWrapper: {
        width: '100%', padding: '10px 0px 20px 0px', boxSizing: 'border-box',
        overflow: 'hidden' 
      },
      table: { width:'100%', borderCollapse:'collapse', textAlign:'center' },
      cell: {
         boxSizing:'border-box', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
         width: '13vw', height: '13vw', maxHeight: '50px', maxWidth: '50px', borderRadius:'14px', 
         fontSize:'16px', fontWeight:'600', fontFamily: "Segoe UI", transition: 'all 0.2s ease-in-out',
         cursor: 'pointer', margin: 'auto' 
      },
      infoPanelContainer: {
          flex: 1, width: '100%', 
          borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'}`,
          padding: '20px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column',
          backgroundColor: Colors.get('background', theme), 
      },
      infoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
      text : { fontFamily: "Segoe UI", fontSize: fSize === 0 ? '15px' : '17px', color: Colors.get('mainText', theme) },
      subText : { fontFamily: "Segoe UI", fontSize: fSize === 0 ? '12px' : '14px', color: Colors.get('subText', theme) },
      scrollView: { flex: 1, overflowY: "auto", width:'100%', scrollbarWidth: 'none', msOverflowStyle: 'none', paddingBottom: '20px' },
      icon: { width:'22px', height: '22px' }
})

const getProgressColor = (percent, theme) => {
    if (percent < 25) return theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    if (percent >= 100) return theme === 'light' ? 'rgba(50, 215, 80, 0.64)' : 'rgba(36, 151, 57, 0.4)'; 
     const startHue = 45; const endHue = 110;  const range = endHue - startHue;
    const normalizedPercent = (percent - 25) / 75; const currentHue = startHue + (normalizedPercent * range);
    return `hsla(${currentHue}, 90%, 40%, 0.3)`; 
};

const getProgressTextColor = (percent, theme) => {
     return Colors.get('mainText', theme);; 
}

// Animation Variants
const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.95
    })
};

const textVariants = {
    enter: (direction) => ({ y: direction > 0 ? -20 : 20, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (direction) => ({ y: direction > 0 ? 20 : -20, opacity: 0 })
};

const HabitCalendar = () => {
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [date, setDate] = useState(new Date());
    const [fSize, setfontSize] = useState(0);
    const [currentDate, setCurrentDate] = useState(date);
    const [inFoPanelData, setInfoPanelData] = useState(false);
    const today = new Date().getDate(); 
    const curMonth = new Date().getMonth();
    
    // Animation state
    const [direction, setDirection] = useState(0);

    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        const subscription2 = fontSize$.subscribe(setfontSize);
        return () =>{ subscription.unsubscribe(); subscription2.unsubscribe(); }
    }, []);
    
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => { setLangIndex(lang === 'ru' ? 0 : 1); });
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
    for (let i = 0; i < firstDayOfWeek; i++) { calendarCells.push(null); }
    for (let i = 1; i <= daysInMonth; i++) { calendarCells.push(i); }
    for (let i = 0; i < calendarCells.length; i+=7) { weeks.push(calendarCells.slice(i, i + 7)); } 
    
    const prevMonth = () => {
        setDirection(-1);
        setDate(new Date(date.getFullYear(), date.getMonth() - 1));
        playEffects(clickSound);
    };
    const nextMonth = () =>{  
        setDirection(1);
        setDate(new Date(date.getFullYear(), date.getMonth() + 1));
        playEffects(clickSound);
    };
    
    const monthNames = [
        ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    ];

    const onHabitClick = (habitId) => {
        playEffects(clickSound);
        if(setExpandedCard) setExpandedCard(habitId);
        if(setPage) setPage(0);
    };

    return (
        <div style={styles(theme).container}>
          <div style={styles(theme).panel}>
            {/* Header with Navigation and Animations */}
            <div style={styles(theme).calendarHead}>
              <motion.div whileTap={{scale: 0.9}} onClick={prevMonth} style={styles(theme).navBtn}>
                 <IoIosArrowBack size={22} color={Colors.get('mainText', theme)}/>
              </motion.div>
              
              <div style={styles(theme).headerWrapper}>
                  <AnimatePresence mode="popLayout" custom={direction}>
                    <motion.h1 
                        key={date.toISOString()}
                        variants={textVariants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        style={styles(theme).header}
                    >
                        {monthNames[langIndex][date.getMonth()]} {date.getFullYear()}
                    </motion.h1>
                  </AnimatePresence>
              </div>

              <motion.div whileTap={{scale: 0.9}} onClick={nextMonth} style={styles(theme).navBtn}>
                 <IoIosArrowForward size={22} color={Colors.get('mainText', theme)}/>
              </motion.div>
            </div>

            {/* Calendar Table with Sliding Animation */}
            <div style={styles(theme).tableWrapper}>
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={date.toISOString()}
                        variants={slideVariants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
                        style={{width: '100%'}}
                    >
                        <table style={styles(theme).table}>
                        <thead>
                            <tr>
                            {daysOfWeek[langIndex].map((day, index) => (
                                <th key={day} style={{paddingBottom:'15px'}}>
                                    <p style={{
                                        textAlign:'center', fontSize:fSize === 0 ? '13px' : '14px', fontWeight: '600',
                                        color: (index === 5 || index === 6) ? '#ff5e5e' : Colors.get('subText', theme),
                                        margin: 0, opacity: 0.8
                                    }}>{day}</p>
                                </th>
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
                                    let percent = ''; let percentNum = 0;

                                    if(Object.keys(AppData.habitsByDate).includes(dayKey)){
                                        const allHabitsOfCurrentDay = Array.from(Object.values(AppData.habitsByDate[dayKey]));
                                        const allHabitsOfDay = allHabitsOfCurrentDay.length;
                                        percentNum = allHabitsOfDay > 0 ? Math.round((allHabitsOfCurrentDay.filter((v) => v > 0).length/allHabitsOfDay)*100) : 0;
                                        percent = percentNum + '%';
                                    }

                                    let cellBg = 'transparent';
                                    let cellColor = Colors.get('mainText', theme);

                                    if (isChoosen) {
                                        cellBg = Colors.get('currentDateBorder', theme);
                                        cellColor = '#ffffff';
                                    } else if (day > 0) {
                                        if (percentNum > 0) {
                                            cellBg = getProgressColor(percentNum, theme);
                                            cellColor = getProgressTextColor(percentNum, theme);
                                        }
                                    }
                                    
                                    return(
                                    <td key={j} style={{padding: '4px'}}>
                                    {day ? (
                                        <div style={{
                                            ...styles(theme).cell,
                                            backgroundColor: cellBg, color: cellColor,
                                            border: today === day && curMonth === cellMonth ? `2px solid ${Colors.get('currentDateBorder', theme)}` : 'transparent',
                                            boxShadow: isChoosen ? `0 4px 12px ${Colors.get('shadow', theme)}` : 'none',
                                        }} onClick={() => {
                                                setCurrentDate(new Date(cellYear, cellMonth, day));
                                                setInfoPanelData(AppData.hasKey(formatDateKey(new Date(cellYear, cellMonth, day))));
                                                playEffects(clickSound);
                                            }}   
                                        >
                                            {day}
                                            {day > 0 && percent && !isChoosen && <div style={{ fontSize: '9px', marginTop: '2px', opacity: 0.9, fontWeight: 'bold' }}>{percent}</div>}
                                        </div>
                                    ) : <div style={{...styles(theme).cell, pointerEvents: 'none'}}></div>}
                                    </td>
                                )
                                })}
                                </tr>
                            ))}
                        </tbody>
                        </table>
                    </motion.div>
                </AnimatePresence>
            </div>
            
            <div style={styles(theme).infoPanelContainer}>
                {inFoPanelData ? (
                    <div style={{width: '100%', height: '100%', display:'flex',flexDirection:'column'}}>
                        <div style={styles(theme).infoHeader}>
                            <h2 style={{fontSize:'18px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: 0}}>
                                {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]}, {fullNames[langIndex][getMondayIndex(currentDate)]}
                            </h2>
                        </div>
                        <div style={styles(theme).scrollView}>
                            <Habit theme={theme} langIndex={langIndex} date={currentDate} fSize={fSize} onHabitClick={onHabitClick}/>
                        </div>
                    </div>
                ) : (
                    <div style={{display:'flex', height:'100%', alignItems:'center', justifyContent:'center', opacity: 0.6, flexDirection: 'column'}}>
                         <h2 style={{fontSize:'18px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: '0 0 10px 0'}}>
                                {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]}
                        </h2>
                        <p style={{color: Colors.get('subText', theme), margin: 0, fontSize: '14px'}}>
                            {langIndex === 0 ? "Нет привычек на этот день" : "No habits for this day"}
                        </p>
                    </div>
                )}
            </div>
          </div>
        </div>
    )
}

export default HabitCalendar

const Habit = ({theme, langIndex, date, fSize, onHabitClick}) => {
    const dateKey = formatDateKey(date);
    if(!AppData.hasKey(dateKey)) return null;
    const habits = Object.entries(AppData.habitsByDate[dateKey]);
    return (
        habits.map(([id, initStatus]) => {
          const numId = Number(id);
          const found = getAllHabits().find(habit => habit.id === numId);
          if (!found) return null;
          return <HabitRow key={`${dateKey}-${id}`} id={numId} habitData={found} theme={theme} date={date} statusInit={initStatus} langIndex={langIndex} fSize={fSize} onHabitClick={onHabitClick}/>
        })
    )
}

const HabitRow = ({ id, habitData, theme, date, statusInit, langIndex, fSize, onHabitClick }) => {
    const name = habitData.name[langIndex];
    let category = "";
    if (habitData.category) {
        if (Array.isArray(habitData.category)) category = habitData.category[langIndex];
        else category = habitData.category;
    } else category = langIndex === 0 ? "Общее" : "General";

    const getIcon = () => {
        if (habitData.isCustom && habitData.iconName) return Icons.getIcon(habitData.iconName, { size: 24, style: { color: 'inherit' } });
        else return Icons.getHabitIcon(habitData.name ? habitData.name[0] : 'default', { size: 24, style: { color: 'inherit' } });
    };

    const isNegative = AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(id)];
    const [status, setStatus] = useState(statusInit);
    const [canDrag, setCanDrag] = useState(status < 2 && !isNegative);
    const maxX = 70; const minX = -70;
    const x = useMotionValue(0);
    const constrainedX = useTransform(x, [-1, 1], [minX, maxX]);
    
    useEffect(() => { setStatus(statusInit); }, [statusInit, date]);

    const onDrag = (event, info) => {
        const dx = info.offset.x;
        if (Math.abs(dx) > maxX) {
            if (!canDrag) return;
            let newStatus = status;
            if (dx > 0) { if (status === 0) newStatus = 1; else if (status === -1) newStatus = 0; } 
            else { if (status === 0) newStatus = -1; else if (status === 1) newStatus = 0; }
            if (newStatus !== status) {
                const dayKey = formatDateKey(date);
                AppData.changeStatus(dayKey, id, newStatus);
                setStatus(newStatus);
                emitHabitsChanged();
                if (newStatus === 1) { if(AppData.prefs[2] == 0)playEffects(isDoneSound) }
                else if(newStatus === -1){ if(AppData.prefs[2] == 0)playEffects(skipSound); }
                playEffects(null);
            }
            setCanDrag(false);
            animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        }
    };

    const onDragEnd = () => { animate(constrainedX, 0, { type: 'tween', duration: 0.2 }); setCanDrag(true); };

    let cardBg = theme === 'light' ? Colors.get('background', theme) : 'rgba(255,255,255,0.05)';
    let cardBorder = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    let textColor = Colors.get('mainText', theme);
    let subTextColor = Colors.get('subText', theme);
    let checkBg = 'rgba(255,255,255,0.1)';
    let iconColor = Colors.get('habitIcon', theme);

    if (status === 1) {
        cardBg = 'rgba(20, 60, 30, 0.85)'; cardBorder = 'rgba(46, 151, 65, 0.0)'; textColor = '#ffffff'; subTextColor = 'rgba(255,255,255,0.7)'; checkBg = '#4ade80'; iconColor = '#ffffff';
    } else if (status === -1) {
        cardBg = 'rgba(60, 20, 20, 0.85)'; cardBorder = 'rgba(151, 57, 57, 0.0)'; textColor = '#ffffff'; subTextColor = 'rgba(255,255,255,0.7)'; checkBg = '#f87171'; iconColor = '#ffffff';
    }

    return (
        <div style={{width:'100%', marginBottom:'12px', overflow: 'hidden', borderRadius:'18px'}}>
            <motion.div
                id={`cal-${id}`}
                style={{
                    backgroundColor: cardBg, border: `1px solid ${cardBorder}`, display:'flex', flexDirection:'row', width:'100%', padding: '16px 20px', alignItems:'center', borderRadius:'18px', boxSizing: 'border-box', x: constrainedX, cursor: 'pointer', position: 'relative'
                }}
                drag={canDrag ? 'x' : false} dragConstraints={{ left: minX, right: status === 1 ? 0 : maxX }} dragElastic={0.1} onDrag={onDrag} onDragEnd={onDragEnd}
            >
                <div style={{ fontSize: '24px', marginRight: '15px', width: '30px', textAlign: 'center', color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{getIcon()}</div>
                <div style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
                    <span style={{ fontFamily: "Segoe UI", color: subTextColor, fontSize: '11px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.8px', pointerEvents: 'none' }}>{category}</span>
                    <p style={{ fontFamily: "Segoe UI", color: textColor, margin: 0, fontWeight: '600', fontSize: fSize === 0 ? '16px' : '18px', pointerEvents: 'none' }}>{name}</p>
                </div>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: status !== 0 ? checkBg : 'transparent', border: status === 0 ? `2px solid ${Colors.get('subText', theme)}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px' }}>
                    {status === 1 && <Check style={{color: '#fff', fontSize: '18px'}}/>}
                    {status === -1 && <Close style={{color: '#fff', fontSize: '18px'}}/>}
                </div>
            </motion.div>
        </div>
    );
}

function habitAmountString(date,langIndex) {
   const names = [['привычка','привычки','привычек'],['habit','habits','habits']];
   const dateKey = formatDateKey(date);
   if(AppData.hasKey(dateKey)) {
       const amount = Object.values(AppData.habitsByDate[dateKey]).length;
       return amount + ' ' + names[langIndex][amount === 1 ? 0 : amount > 1 && amount < 5 ? 1 : 2];
   }
   return '0 ' + names[langIndex][2];
}
function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){ sound.pause(); sound.currentTime = 0; }
    sound.volume = 0.5; sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}