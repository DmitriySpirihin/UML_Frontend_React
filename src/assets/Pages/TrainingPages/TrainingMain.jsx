import React, {useState, useEffect, useRef, useMemo} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage,setTrainInfo,setShowPopUpPanel,addNewTrainingDay$} from '../../StaticClasses/HabitsBus'
import {addNewSession,addPreviousSession,deleteSession} from '../../StaticClasses/TrainingLogHelper.js'
import { FaTrash } from "react-icons/fa"
import { FaList } from "react-icons/fa6"
import {MdClose,MdDone, MdAccessTime} from 'react-icons/md'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ScrollPicker from '../../Helpers/ScrollPicker.jsx' // Imported Component

// --- HELPERS ---
const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const getMondayIndex = (d) => (d.getDay() + 6) % 7;
const clickSound = new Audio('Audio/Click.wav');

// Range Helpers (Simplified for ScrollPicker)
const hoursRange = Array.from({ length: 24 }, (_, i) => i);
const minutesRange = Array.from({ length: 12 }, (_, i) => i * 5);

// --- ANIMATION VARIANTS ---
const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 50 : -50, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (direction) => ({ zIndex: 0, x: direction < 0 ? 50 : -50, opacity: 0, scale: 0.95 })
};

const textVariants = {
    enter: (direction) => ({ y: direction > 0 ? -20 : 20, opacity: 0 }),
    center: { y: 0, opacity: 1 },
    exit: (direction) => ({ y: direction > 0 ? 20 : -20, opacity: 0 })
};

const bottomSheetVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", damping: 25, stiffness: 300 } },
    exit: { y: "100%", opacity: 0 }
};

const TrainingMain = () => {
   // --- STATE ---
   const [theme, setthemeState] = React.useState('dark');
   const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
   const [date, setDate] = useState(new Date());
   const [currentDate, setCurrentDate] = useState(date);
   const currentDateRef = useRef(currentDate);
   const [trainingAmount, setTrainingAmount] = useState(0);
   const [fSize, setFSize] = useState(AppData.prefs[4]); 
   const [showNewSessionPanel, setShowNewSessionPanel] = useState(false);  
   const [showPreviousSessionPanel, setShowPreviousSessionPanel] = useState(false);  
   const [showConfirmPanel,setShowConfirmPanel] = useState(false);
   const [programId,setProgrammId] = useState(AppData.getLastProgramId());
   const [dayIndex,setDayIndex] = useState(AppData.getLastTrainingDayIndex() || 0);
   const [startTime, setStartTime] = useState(16 * 3600000); 
   const [endTime, setEndTime] = useState(17 * 3600000);
   const [sessionToDelete,setSessionToDelete] = useState({date:'',key:0});
   
   // Animation state
   const [direction, setDirection] = useState(0);

   // --- SUBSCRIPTIONS ---
   useEffect(() => {
      const subscription = theme$.subscribe(setthemeState); 
      const subscription2 = lang$.subscribe((lang) => { setLangIndex(lang === 'ru' ? 0 : 1); }); 
      const subscription3 = fontSize$.subscribe((fontSize) => { setFSize(fontSize); });
      return () => { subscription.unsubscribe(); subscription2.unsubscribe(); subscription3.unsubscribe(); }
    }, []); 
   
    // --- CALENDAR LOGIC ---
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;
    const daysOfWeek = [['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']];
    const fullNames = [['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']];
    const monthNames = [['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];

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
   
    useEffect(() => { currentDateRef.current = currentDate; }, [currentDate]);
    useEffect(() => { setDayIndex(0); }, [programId]);
    
    // Auto-open panel logic
    useEffect(() => {
        const subscription = addNewTrainingDay$.subscribe(() => {
            const today = new Date();
            const current = currentDateRef.current;
            if (current > today) return;
            const currentDateKey = formatDateKey(current);
            const todayKey = formatDateKey(today);
            if (currentDateKey === todayKey) { setShowNewSessionPanel(true); } 
            else { setShowPreviousSessionPanel(true); }
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- PICKER DATA ---
    const programOptions = useMemo(() => {
        const progs = Object.entries(AppData.programs)
            .filter(([, program]) => program.show !== false)
            .map(([id, program]) => ({
                value: Number(id),
                label: Array.isArray(program?.name) ? program?.name?.[langIndex] : program?.name || `Program ${id}`
            }));
        // Fallback if empty
        return progs.length > 0 ? progs : [{value: 0, label: langIndex === 0 ? "Нет программ" : "No Programs"}];
    }, [langIndex]);

    const dayOptions = useMemo(() => {
        const program = AppData.programs[programId];
        if (!program || !program.schedule || program.schedule.length === 0) {
            return [{value: 0, label: langIndex === 0 ? 'День 1' : 'Day 1'}];
        }
        return program.schedule.map((day, index) => ({
            value: index,
            label: day.name?.[langIndex] || (langIndex === 0 ? `День ${index + 1}` : `Day ${index + 1}`)
        }));
    }, [programId, langIndex]);

    // Helpers to sync ScrollPicker (Visual) with State (IDs)
    const currentProgramLabel = useMemo(() => 
        programOptions.find(p => p.value === programId)?.label || programOptions[0].label, 
    [programId, programOptions]);

    const currentDayLabel = useMemo(() => 
        dayOptions.find(d => d.value === dayIndex)?.label || dayOptions[0].label, 
    [dayIndex, dayOptions]);

    const handleProgramChange = (label) => {
        const found = programOptions.find(p => p.label === label);
        if (found) setProgrammId(found.value);
    };

    const handleDayChange = (label) => {
        const found = dayOptions.find(d => d.label === label);
        if (found) setDayIndex(found.value);
    };

    const setTimeFromPicker = (setter, currentMs, type, val) => {
        const totalMinutes = Math.floor(currentMs / 60000);
        let h = Math.floor(totalMinutes / 60) % 24;
        let m = totalMinutes % 60;
        if (type === 'h') h = val;
        if (type === 'm') m = val;
        const newMs = (h * 60 + m) * 60000;
        setter(newMs);
    };

    // --- ACTIONS ---
   const onSessionStart = () => {
      const today = new Date();
      const daykey = formatDateKey(today);
      if(!AppData.programs[programId]){
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа не найдена' : 'Error! The program not found',2000,false);
        return null;
      }
      if(AppData.programs[programId].schedule.length === 0){
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа пустая' : 'Error! The program is empty',2000,false);
        return null;
      }
      addNewSession(new Date(),programId,dayIndex);
      setShowNewSessionPanel(false);
      setTimeout(() => {
       const sessionIndex = AppData.trainingLog[daykey].length - 1;
       setTrainInfo({mode:'new',dayKey:daykey,dInd:sessionIndex});
       setPage('TrainingCurrent');
      },100);
   }

   const onAddPreviousSession = () => {
      if(!AppData.programs[programId]){
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа не найдена' : 'Error! The program not found',2000,false);
        return null;
      }
      if(AppData.programs[programId].schedule.length === 0){
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа пустая' : 'Error! The program is empty',2000,false);
        return null;
      }
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

   const onDelete = (_date, sessionIndex) => { setSessionToDelete({ date: _date, key: sessionIndex }); };
   const onConfirmDelete = () => {
      deleteSession(sessionToDelete.date,sessionToDelete.key);
      setShowConfirmPanel(false);
      setShowPopUpPanel(langIndex === 0 ? "Тренировка удалена" : "Session deleted",2000,true);
   }

   return (
       <div style={styles(theme).container}>
         <div style={styles(theme).panel}>
           {/* --- HEADER & CALENDAR --- */}
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
                        initial="enter" animate="center" exit="exit"
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
           
           <div style={{width: '100%', paddingBottom: '20px', overflow: 'hidden'}}>
               <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                    key={date.toISOString()}
                    variants={slideVariants}
                    custom={direction}
                    initial="enter" animate="center" exit="exit"
                    transition={{ type: "tween", ease: "easeInOut", duration: 0.25 }}
                    style={{width: '100%'}}
                >
                    <table style={styles(theme).table}>
                        <thead>
                        <tr>
                            {daysOfWeek[langIndex].map((day, i) => (
                            <th key={day} style={{paddingBottom:'10px'}}>
                                <p style={{textAlign:'center', fontSize: '13px', fontWeight: '600', opacity: 0.8, color: (i >= 5) ? '#ff5e5e' : Colors.get('subText', theme)}}>{day}</p>
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
                                const trAmount = dayKey in AppData.trainingLog ? AppData.trainingLog[dayKey].length : 0;
                                let pendingAmount = 0; let doneAmount = 0;
                                if(trAmount > 0){
                                    AppData.trainingLog[dayKey].forEach(tr => {
                                        if(!tr.completed) pendingAmount++; else doneAmount++;
                                    });
                                }

                                let cellBg = 'transparent';
                                let cellColor = Colors.get('mainText', theme);
                                if (isChoosen) { cellBg = Colors.get('currentDateBorder', theme); cellColor = '#ffffff'; }

                                return(
                                <td key={j} style={{padding: '3px'}}>
                                    {day ? (
                                    <div style={{
                                        ...styles(theme).cell,
                                        backgroundColor: cellBg, color: cellColor,
                                        boxShadow: isChoosen ? `0 4px 12px ${Colors.get('shadow', theme)}` : 'none',
                                    }}
                                    onClick={() => {setCurrentDate(new Date(Date.UTC(cellYear, cellMonth, day)));setTrainingAmount(trAmount);playEffects(clickSound);}} >
                                        {day}
                                        {trAmount > 0 && !isChoosen &&
                                        <div style={{display:'flex', gap: '2px', marginTop:'6px'}}>
                                            {pendingAmount > 0 && <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor: Colors.get('subText', theme), opacity: 0.5}} />}
                                            {doneAmount > 0 && <div style={{width:'6px', height:'6px', borderRadius:'50%', backgroundColor: '#4ade80'}} />}
                                        </div>
                                        }
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
         </div>

         {/* --- JOURNAL LIST SECTION --- */}
         <div style={{flex: 1, width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: Colors.get('background', theme)}}>
            <div onClick={() => setPage('TrainingList')} style={styles(theme).journalBtn}>
                 <div style={{fontWeight: '600', fontSize: '15px'}}>{langIndex === 0 ? 'Журнал' : 'Journal'}</div>
                 <FaList size={14}/>
            </div>
            
            <div style={{flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column'}}>
                <div style={{padding: '15px 20px 10px 20px'}}>
                     <h2 style={{margin: 0, fontSize: '18px', color: Colors.get('mainText', theme)}}>
                        {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]}, {fullNames[langIndex][getMondayIndex(currentDate)]}
                     </h2>
                     <p style={{margin: '4px 0 0 0', fontSize: '14px', color: Colors.get('subText', theme)}}>
                         {trainingAmountText(trainingAmount,langIndex)}
                     </p>
                </div>
                
                <div style={styles(theme).scrollView}>
                    {AppData.trainingLog[formatDateKey(currentDate)]?.map((training,index) =>(
                    <motion.div 
                        initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: index * 0.05}}
                        key={index} style={styles(theme).sessionCard}
                    >
                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                <div style={{width: '24px', height: '24px', borderRadius: '50%', backgroundColor: training.completed ? '#4ade80' : 'rgba(128,128,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    {training.completed ? <MdDone color="#fff" size={16}/> : <span style={{fontSize: '10px'}}>⏳</span>}
                                </div>
                                <span style={{fontWeight: 'bold', color: Colors.get('mainText', theme), fontSize: fSize === 0 ? '16px' : '18px'}}>
                                    {Array.isArray(AppData.programs[training.programId]?.name) ? AppData.programs[training.programId]?.name?.[langIndex] : AppData.programs[training.programId]?.name }
                                </span>
                            </div>
                            <motion.div whileTap={{scale: 0.9}} onClick={()=>{onDelete(formatDateKey(new Date(currentDate)), index);setShowConfirmPanel(true);}} style={{padding: '8px', cursor: 'pointer', opacity: 0.7}}>
                                <FaTrash size={16} color={Colors.get('subText', theme)}/>
                            </motion.div>
                        </div>
                        <div 
                             onClick={()=>{setTrainInfo({mode:training.completed ? 'redact' : 'new',dayKey:formatDateKey(new Date(currentDate)),dInd: index});setPage('TrainingCurrent')}}
                             style={{cursor: 'pointer', paddingLeft: '34px'}}
                        >
                            <div style={{fontSize: fSize === 0 ? '14px' : '16px', color: Colors.get('mainText', theme), marginBottom: '4px'}}>
                                {(langIndex === 0 ? 'День ' : 'Day ') +  (training.dayIndex + 1) + ': ' +  (AppData.programs[training.programId]?.schedule?.[training.dayIndex]?.name?.[langIndex] || 
                                (langIndex === 0 ? `День ${training.dayIndex + 1}` : `Day ${training.dayIndex + 1}`))}
                            </div>
                            {training.completed && 
                                <div style={{fontSize: '13px', color: Colors.get('subText', theme)}}>
                                    {`${Math.round(training.duration / 60000)}${langIndex === 0 ? ' мин' : ' min'}  •  ${(training.tonnage * 0.001).toFixed(2)} ${langIndex === 0 ? ' т' : ' t'}${getTrainingSummary(training,langIndex)}`}
                                </div>
                            }
                        </div>
                        
                    </motion.div>
                    ))}
                    <div style={{display:'flex',height:'55px'}}></div>
                </div>
            </div>
         </div>

       {/* --- MODALS --- */}
       <AnimatePresence>
       
       {/* DELETE */}
       {showConfirmPanel && 
        <BottomSheet theme={theme} onClose={() => setShowConfirmPanel(false)}>
          <div style={{textAlign:'center', marginBottom: '20px'}}>
              <h3 style={styles(theme,fSize).modalTitle}>{langIndex === 0 ? "Удалить тренировку?" : "Delete session?"}</h3>
              <p style={{color: Colors.get('subText', theme), fontSize: '14px'}}>{langIndex === 0 ? "Это действие нельзя отменить" : "This action cannot be undone"}</p>
          </div>
          <div style={{display:'flex', width: '100%', gap: '15px'}}>
             <ActionButton icon={<MdClose size={24}/>} label={langIndex===0 ? "Нет" : "No"} onClick={() => setShowConfirmPanel(false)} theme={theme} />
             <ActionButton icon={<MdDone size={24}/>} label={langIndex===0 ? "Да" : "Yes"} onClick={onConfirmDelete} theme={theme} isPrimary isDestructive/>
          </div>
        </BottomSheet>
       }

       {/* NEW SESSION PANEL */}
       {showNewSessionPanel && 
        <BottomSheet theme={theme} onClose={() => setShowNewSessionPanel(false)}>
           <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
             <p style={styles(theme,fSize).modalTitle}>{langIndex === 0 ? 'Новая тренировка' : 'New Session'}</p>
             <div onClick={() => setShowNewSessionPanel(false)} style={{padding:'5px', cursor:'pointer'}}><MdClose size={24} color={Colors.get('subText', theme)}/></div>
           </div>
           
           <div style={{marginBottom: '20px', width: '100%'}}>
                <PickerLabel label={langIndex === 0 ? "Программа" : "Program"} theme={theme} />
                <div style={{display:'flex', justifyContent:'center'}}>
                    <ScrollPicker 
                        items={programOptions.map(p => p.label)} 
                        value={currentProgramLabel} 
                        onChange={handleProgramChange} 
                        theme={theme} 
                        width="100%"
                    />
                </div>
           </div>
           
           <div style={{marginBottom: '20px', width: '100%'}}>
                <PickerLabel label={langIndex === 0 ? "День" : "Day"} theme={theme} />
                <div style={{display:'flex', justifyContent:'center'}}>
                    <ScrollPicker 
                        items={dayOptions.map(d => d.label)} 
                        value={currentDayLabel} 
                        onChange={handleDayChange} 
                        theme={theme} 
                        width="100%"
                    />
                </div>
           </div>
           
           <div style={{marginTop: '15px'}}>
              <ActionButton icon={<MdDone size={24}/>} label={langIndex===0 ? "Начать" : "Start"} onClick={onSessionStart} theme={theme} isPrimary />
           </div>
        </BottomSheet>
       }

       {/* PREVIOUS SESSION PANEL */}
       {showPreviousSessionPanel && 
        <BottomSheet theme={theme} onClose={() => setShowPreviousSessionPanel(false)}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
             <p style={styles(theme,fSize).modalTitle}>{langIndex === 0 ? 'Добавить прошлую' : 'Log Previous'}</p>
             <div onClick={() => setShowPreviousSessionPanel(false)} style={{padding:'5px', cursor:'pointer'}}><MdClose size={24} color={Colors.get('subText', theme)}/></div>
           </div>
          
          <div style={{marginBottom: '20px', width: '100%'}}>
                <PickerLabel label={langIndex === 0 ? "Программа" : "Program"} theme={theme} />
                <div style={{display:'flex', justifyContent:'center'}}>
                    <ScrollPicker 
                        items={programOptions.map(p => p.label)} 
                        value={currentProgramLabel} 
                        onChange={handleProgramChange} 
                        theme={theme} 
                         width="100%"
                    />
                </div>
           </div>
           
           <div style={{marginBottom: '20px', width: '100%'}}>
                <PickerLabel label={langIndex === 0 ? "День" : "Day"} theme={theme} />
                <div style={{display:'flex', justifyContent:'center'}}>
                    <ScrollPicker 
                        items={dayOptions.map(d => d.label)} 
                        value={currentDayLabel} 
                        onChange={handleDayChange} 
                        theme={theme} 
                         width="100%"
                    />
                </div>
           </div>

          {/* TIME SECTION (DRUM STYLE) */}
          <div style={{backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '15px', marginBottom: '20px'}}>
             <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', opacity:0.7}}>
                <MdAccessTime /> 
                <span style={{fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px'}}>{langIndex === 0 ? "Время" : "Time"}</span>
             </div>
             
             {/* Dual Drum Time Picker Row */}
             <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px'}}>
                 {/* Start Time */}
                 <div style={{flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <PickerLabel label={langIndex === 0 ? 'Начало' : 'Start'} theme={theme} />
                    <div style={{display: 'flex', gap: '5px', width: '100%', justifyContent: 'center'}}>
                        <ScrollPicker 
                            items={hoursRange} 
                            value={Math.floor(startTime / 3600000)} 
                            onChange={(val) => setTimeFromPicker(setStartTime, startTime, 'h', val)} 
                            theme={theme} 
                            width="60px"
                        />
                        <span style={{paddingTop: '20px', fontWeight: 'bold'}}>:</span>
                        <ScrollPicker 
                            items={minutesRange} 
                            value={(startTime / 60000) % 60} 
                            onChange={(val) => setTimeFromPicker(setStartTime, startTime, 'm', val)} 
                            theme={theme} 
                            width="60px"
                            suffix=""
                        />
                    </div>
                 </div>

                 {/* End Time */}
                 <div style={{flex:1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <PickerLabel label={langIndex === 0 ? 'Конец' : 'End'} theme={theme} />
                    <div style={{display: 'flex', gap: '5px', width: '100%', justifyContent: 'center'}}>
                        <ScrollPicker 
                            items={hoursRange} 
                            value={Math.floor(endTime / 3600000)} 
                            onChange={(val) => setTimeFromPicker(setEndTime, endTime, 'h', val)} 
                            theme={theme} 
                            width="60px"
                        />
                        <span style={{paddingTop: '20px', fontWeight: 'bold'}}>:</span>
                        <ScrollPicker 
                            items={minutesRange} 
                            value={(endTime / 60000) % 60} 
                            onChange={(val) => setTimeFromPicker(setEndTime, endTime, 'm', val)} 
                            theme={theme} 
                            width="60px"
                            suffix=""
                        />
                    </div>
                 </div>
             </div>
          </div>
          
          <ActionButton icon={<MdDone size={24}/>} label={langIndex===0 ? "Сохранить" : "Save Log"} onClick={onAddPreviousSession} theme={theme} isPrimary />
        </BottomSheet>
       }
       </AnimatePresence>
   </div>
 )
}

// --- MODERN UI COMPONENTS ---

const BottomSheet = ({children, theme, onClose}) => (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={styles(theme).backdrop}
        onClick={onClose}
    >
        <motion.div 
            variants={bottomSheetVariants} initial="hidden" animate="visible" exit="exit"
            style={styles(theme).bottomSheet}
            onClick={(e) => e.stopPropagation()} 
        >
            <div style={{width: '40px', height: '4px', backgroundColor: Colors.get('subText', theme), borderRadius: '2px', margin: '0 auto 20px auto', opacity: 0.3}} />
            {children}
        </motion.div>
    </motion.div>
);

const PickerLabel = ({label, theme}) => (
    <div style={{fontSize: '12px', fontWeight: 'bold', color: Colors.get('subText', theme), textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center'}}>
        {label}
    </div>
);

const ActionButton = ({icon, label, onClick, theme, isPrimary, isDestructive}) => {
    let bg = theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    let color = Colors.get('mainText', theme);
    
    if (isPrimary) {
        bg = isDestructive ? Colors.get('minValColor', theme) : Colors.get('maxValColor', theme);
        color = '#fff';
    }

    return (
        <motion.div 
            whileTap={{scale: 0.98}} 
            onClick={onClick}
            style={{
                flex: 1, height: '56px', borderRadius: '16px', 
                backgroundColor: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                color: color, cursor: 'pointer', fontWeight: '600', fontSize: '16px',
                boxShadow: isPrimary ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
            }}
        >
            {icon}
            {label && <span>{label}</span>}
        </motion.div>
    );
};

export default TrainingMain

// --- HELPER STYLES & FUNCTIONS ---

function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){ sound.pause(); sound.currentTime = 0; }
    sound.volume = 0.5; sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}
const trainingAmountText = (trainingAmount,langIndex) => {
  if(trainingAmount == 0) return langIndex == 0 ? 'Нет тренировок' : 'No trainings';
  if(trainingAmount == 1) return langIndex == 0 ? '1 тренировка' : '1 training';
  if(trainingAmount > 1 && trainingAmount < 5) return trainingAmount + (langIndex == 0 ? ' тренировки' : ' trainings');
  return trainingAmount + (langIndex == 0 ? ' тренировок' : ' trainings');
}

export function getTrainingSummary(session, langIndex) {
  if (!session?.exercises) { return (langIndex === 0 ? ' • 0 упр.' : ' • 0 ex.'); }
  let exerciseCount = 0; let setCount = 0;
  for (const exercise of Object.values(session.exercises)) {
      exerciseCount++;
      if (Array.isArray(exercise.sets)) { setCount += exercise.sets.length; }
  }
  return langIndex === 0 ? ` • ${exerciseCount} упр. / ${setCount} подх.` : ` • ${exerciseCount} ex. / ${setCount} sets`;
}

const styles = (theme,fSize) => ({
   container : {
     backgroundColor:Colors.get('background', theme),
     display: "flex", flexDirection: "column", alignItems: "center",
     height: "90vh",marginTop:'100px', width: "100vw", fontFamily: "Segoe UI, Roboto, sans-serif",
     overflowY:'scroll', paddingTop: '10px'
   },
   panel : {
    display:'flex', flexDirection:'column', width: "100%", maxWidth: '500px',
    alignItems: "center", justifyContent: "start",
    position: 'relative', zIndex: 1
   },
   calendarHead: {
     padding: '15px 20px', display:'flex', flexDirection:'row', alignItems:'center', justifyContent:'space-between',
     width:'100%', boxSizing: 'border-box',marginTop:'20px'
   },
   headerWrapper: {
     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
     overflow: 'hidden', minWidth: '150px' 
   },
   header: {
     fontFamily: "Segoe UI", fontSize: "20px", margin: 0, fontWeight: "700",
     color: Colors.get('mainText', theme), textTransform: 'capitalize', whiteSpace: 'nowrap'
   },
   navBtn: {
       padding: '8px', borderRadius: '12px', cursor: 'pointer',
       backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
       display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
   },
   table: { width:'100%', borderCollapse:'collapse', textAlign:'center' },
   cell: {
      boxSizing:'border-box', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      width: '13vw', height: '13vw', maxHeight: '50px', maxWidth: '50px', borderRadius:'14px', 
      fontSize:'16px', fontWeight:'600', fontFamily: "Segoe UI", transition: 'all 0.2s ease-in-out',
      cursor: 'pointer', margin: 'auto', position: 'relative'
   },
   journalBtn: {
       alignSelf: 'center', margin: '10px 0',
       backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
       color: Colors.get('mainText', theme),
       padding: '10px 20px', borderRadius: '20px',
       display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer'
   },
   scrollView : {
    flex: 1, width:'100%',  padding: '10px 20px 80px 20px',
   },
   sessionCard: {
       backgroundColor: theme === 'light' ? '#fff' : 'rgba(255,255,255,0.05)',
       borderRadius: '16px', padding: '5px', marginBottom: '12px',marginRight:'35px',
       boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
       border: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`
   },
   backdrop: {
       position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
       backgroundColor: 'rgba(0,0,0,0.5)', 
       display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 3000
   },
   bottomSheet: {
       width: '100%', maxWidth: '500px', 
       backgroundColor: Colors.get('background', theme),
       borderTopLeftRadius: '28px', borderTopRightRadius: '28px', 
       padding: '20px 25px 40px 25px', 
       boxShadow: '0 -10px 40px rgba(0,0,0,0.2)', position: 'relative', zIndex: 3001,
       backdropFilter: 'blur(20px)',
       borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`
   },
   modalTitle: {
       fontSize: '20px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: 0
   }
})