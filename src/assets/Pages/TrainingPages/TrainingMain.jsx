import React, {useState, useEffect, useRef, useMemo} from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import { logSectionVisit } from '../../StaticClasses/AppData.js'
import { playEffects } from '../../StaticClasses/Effects.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage,setTrainInfo,setShowPopUpPanel,addNewTrainingDay$, emitSectionAccentChanged} from '../../StaticClasses/HabitsBus'
import {addFreeGymSession, addNewSession, addPreviousSession, deleteSession} from '../../StaticClasses/TrainingLogHelper.js'
import { FaTrash , FaRunning , FaSwimmer, FaBicycle, FaPalette} from "react-icons/fa"
import { FaList } from "react-icons/fa6"
import {MdClose,MdDone, MdAccessTime,MdFitnessCenter} from 'react-icons/md'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import ScrollPicker from '../../Helpers/ScrollPicker.jsx'
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx'
import SectionAccentSettings, { POSITIVE_ACCENT_PRESETS, buildSectionAccent } from '../SectionAccentSettings.jsx'
import { saveData } from '../../StaticClasses/SaveHelper.js'
import { cardioType$, trainInfo$ } from './TrainingCardioBus.js';

// --- HELPERS ---
const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const getMondayIndex = (d) => (d.getDay() + 6) % 7;
const clickSound = new Audio('Audio/Click.wav');
const TRAINING_ACCENT = '#35C2FF';

// Range Helpers (only needed for GYM time pickers)
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
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showNewSessionPanel, setShowNewSessionPanel] = useState(false);
  const [showPreviousSessionPanel, setShowPreviousSessionPanel] = useState(false);
  const [showConfirmPanel,setShowConfirmPanel] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showAccentSettings, setShowAccentSettings] = useState(false);
  const [accentColor, setAccentColor] = useState(buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT).hue);
  const [, setAccentPresetVersion] = useState(0);
  const [selectedTrainingType, setSelectedTrainingType] = useState('GYM');
  
  // GYM specific (cardio state removed)
  const [programId,setProgrammId] = useState(AppData.getLastProgramId());
  const [dayIndex,setDayIndex] = useState(AppData.getLastTrainingDayIndex() || 0);
  const [startTime, setStartTime] = useState(16 * 3600000);
  const [endTime, setEndTime] = useState(17 * 3600000);
  
  const [sessionToDelete,setSessionToDelete] = useState({date:'',key:0});
  
  // Animation state
  const [direction, setDirection] = useState(0);
  const today = new Date().getDate();
  const curMonth = new Date().getMonth();

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const subscription = theme$.subscribe(setthemeState);
    const subscription2 = lang$.subscribe((lang) => { setLangIndex(lang === 'ru' ? 0 : 1); });
    const subscription3 = fontSize$.subscribe((fontSize) => { setFSize(fontSize); });
    return () => { subscription.unsubscribe(); subscription2.unsubscribe(); subscription3.unsubscribe(); }
  }, []);

  useEffect(() => { logSectionVisit('training'); }, []);

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
      if (currentDateKey === todayKey) {
        setShowTypeSelector(true);
      } else {
        setShowTypeSelector(true);
      }
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

  const setTimeFromPicker = (setter, currentMs, type, val) => {
    const totalMinutes = Math.floor(currentMs / 60000);
    let h = Math.floor(totalMinutes / 60) % 24;
    let m = totalMinutes % 60;
    if (type === 'h') h = val;
    if (type === 'm') m = val;
    const newMs = (h * 60 + m) * 60000;
    setter(newMs);
  };

  // --- CARDIO TYPE PICKER DATA ---
  const strengthAccent = useMemo(() => buildSectionAccent(accentColor || TRAINING_ACCENT), [accentColor]);
  const trainingTypeOptions = useMemo(() => [
    {
      value: 'GYM',
      label: langIndex === 0 ? 'Силовая' : 'Strength',
      description: langIndex === 0 ? 'Свободно или по программе' : 'Free or from a program',
      icon: <MdFitnessCenter size={22}/>,
      color: strengthAccent.hue,
      glow: strengthAccent.glow
    },
    {
      value: 'RUNNING',
      label: langIndex === 0 ? 'Бег' : 'Running',
      description: langIndex === 0 ? 'Дистанция, темп, пульс' : 'Distance, pace, heart rate',
      icon: <FaRunning size={22}/>,
      color: '#F43F5E',
      glow: 'rgba(244,63,94,0.26)'
    },
    {
      value: 'CYCLING',
      label: langIndex === 0 ? 'Велосипед' : 'Cycling',
      description: langIndex === 0 ? 'Скорость, набор, каденс' : 'Speed, elevation, cadence',
      icon: <FaBicycle size={22}/>,
      color: '#22C55E',
      glow: 'rgba(34,197,94,0.24)'
    },
    {
      value: 'SWIMMING',
      label: langIndex === 0 ? 'Плавание' : 'Swimming',
      description: langIndex === 0 ? 'Метры, время, ощущение' : 'Meters, time, effort',
      icon: <FaSwimmer size={22}/>,
      color: '#38BDF8',
      glow: 'rgba(56,189,248,0.24)'
    }
  ], [langIndex, strengthAccent.hue, strengthAccent.glow]);

  const getTrainingTypeData = (type) => {
    const option = trainingTypeOptions.find(opt => opt.value === type) || trainingTypeOptions[0];
    return {
      icon: option.icon,
      color: option.color
    };
  };

  // --- TYPE ICONS HELPER ---
  const getTrainingIconColor = (type) => {
    switch(type) {
      case 'RUNNING': return '#F43F5E';
      case 'CYCLING':return '#22C55E';
      case 'SWIMMING': return '#38BDF8';
      default: return strengthAccent.hue;
    }
  };

  // --- ACTIONS ---
  const openCreatedGymSession = (sessionDate, mode = 'new') => {
    const daykey = formatDateKey(sessionDate);
    setTimeout(() => {
      const sessionIndex = AppData.trainingLog[daykey].length - 1;
      setTrainInfo({mode, dayKey: daykey, dInd: sessionIndex});
      setPage('TrainingCurrent');
    },100);
  };

  const onFreeSessionStart = async () => {
    const sessionDate = currentDateRef.current || new Date();
    await addFreeGymSession(sessionDate);
    setShowNewSessionPanel(false);
    setShowPreviousSessionPanel(false);
    setShowTypeSelector(false);
    openCreatedGymSession(sessionDate);
  };

  const openProgramSessionPanel = () => {
    setSelectedTrainingType('GYM');
    setShowTypeSelector(false);

    const today = new Date();
    const currentDateKey = formatDateKey(currentDateRef.current);
    const todayKey = formatDateKey(today);
    if (currentDateKey === todayKey) {
      setShowNewSessionPanel(true);
    } else {
      setShowPreviousSessionPanel(true);
    }
  };

  const onSessionStart = async () => {
    const sessionDate = currentDateRef.current || new Date();
    if(!AppData.programs[programId]){
      setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа не найдена' : 'Error! The program not found',2000,false);
      return null;
    }
    if(AppData.programs[programId].schedule.length === 0){
      setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа пустая' : 'Error! The program is empty',2000,false);
      return null;
    }
    await addNewSession(sessionDate,programId,dayIndex);
    setShowNewSessionPanel(false);
    setShowTypeSelector(false);
    openCreatedGymSession(sessionDate);
  };

  // REMOVED: onAddPreviousSession cardio logic - now handled in TrainingCardio

  const onDelete = (_date, sessionIndex) => { setSessionToDelete({ date: _date, key: sessionIndex }); };
  
  const onConfirmDelete = () => {
    deleteSession(sessionToDelete.date,sessionToDelete.key);
    setShowConfirmPanel(false);
    setShowPopUpPanel(langIndex === 0 ? "Тренировка удалена" : "Session deleted",2000,true);
  };

  // Navigate to appropriate page based on type
  const handleTypeSelect = (type) => {
    setSelectedTrainingType(type);
    setShowTypeSelector(false);
    
    const today = new Date();
    const currentDateKey = formatDateKey(currentDateRef.current);
    const todayKey = formatDateKey(today);
    
    if (type === 'GYM') {
      // GYM: Show appropriate panel
      if (currentDateKey === todayKey) {
        setShowNewSessionPanel(true);
      } else {
        setShowPreviousSessionPanel(true);
      }
    } else {
    
     cardioType$.next(type);
     trainInfo$.next({
    mode: 'new',
    dayKey: currentDateKey,
    dInd: dayIndex
  });
  setPage('TrainingCardio');
    }
  };

  // Session card click handler
  const onSessionCardClick = (session, dateKey, index) => {
    playEffects(clickSound);
    
    if (session.type === 'GYM' || !session.type) {
      // Open GYM session in TrainingCurrent
      setTrainInfo({
        mode: session.completed ? 'redact' : 'new',
        dayKey: dateKey,
        dInd: index
      });
      setPage('TrainingCurrent');
    } else {
      cardioType$.next(session.type);
     trainInfo$.next({
    mode: 'edit',
    dayKey: dateKey,
    dInd: index
  });
      cardioType$.next(session.type);
      setPage('TrainingCardio'); // TrainingCardio will handle edit mode via trainInfo$
    }
  };

  const selectedDateKey = formatDateKey(currentDate);
  const selectedSessions = AppData.trainingLog[selectedDateKey] || [];
  const selectedDoneCount = selectedSessions.filter((session) => session.completed).length;
  const monthStats = Object.entries(AppData.trainingLog || {}).reduce(
    (acc, [dateKey, sessions]) => {
      const sessionDate = new Date(dateKey);
      if (sessionDate.getFullYear() !== date.getFullYear() || sessionDate.getMonth() !== date.getMonth()) {
        return acc;
      }

      sessions.forEach((session) => {
        acc.total += 1;
        if (session.completed) acc.done += 1;
        if ((session.type || 'GYM') === 'GYM') acc.strength += 1;
        else acc.cardio += 1;
        acc.minutes += Math.max(0, Math.round((session.duration || 0) / 60000));
      });

      return acc;
    },
    { total: 0, done: 0, strength: 0, cardio: 0, minutes: 0 }
  );
  const isRu = langIndex === 0;
  const activeAccent = accentColor;
  const changeAccentColor = async (color) => {
    const next = buildSectionAccent(color, TRAINING_ACCENT).hue;
    AppData.trainingAccentColor = next;
    setAccentColor(next);
    await saveData();
    emitSectionAccentChanged();
  };
  const saveAccentPreset = async () => {
    await AppData.addAccentPreset('training', accentColor, POSITIVE_ACCENT_PRESETS);
    setAccentPresetVersion(version => version + 1);
  };

  return (
    <div style={styles(theme).container}>
      <SectionAccentSettings
        show={showAccentSettings}
        onClose={() => setShowAccentSettings(false)}
        theme={theme}
        langIndex={langIndex}
        title={isRu ? 'Акцент тренировок' : 'Training accent'}
        subtitle={isRu ? 'Цвет календаря, карточек и нижнего меню' : 'Calendar, cards, and bottom navigation color'}
        accentColor={accentColor}
        fallbackColor={TRAINING_ACCENT}
        customPresets={AppData.trainingAccentPresets}
        onAccentChange={changeAccentColor}
        onSavePreset={saveAccentPreset}
      />
      {<HoverInfoButton tab='TrainingMain' variant="subtle" accent={activeAccent}/>}
      <div style={styles(theme).pageScroll} className="no-scrollbar">
        <div style={styles(theme).pageHeader}>
          <div style={styles(theme).pageHeaderSpacer} />
          <div style={styles(theme).pageHeaderBrand}>
            <div style={styles(theme).pageTitle}>UltyMyLife</div>
            <div style={styles(theme).pageSubtitle}>
              {isRu ? 'Дневник тренировок — доказательства прогресса' : 'Training journal — proof of progress'}
            </div>
          </div>
          <Motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAccentSettings(true)}
            style={styles(theme).headerAccentButton}
          >
            <FaPalette size={12} />
            <span>{isRu ? 'Акцент' : 'Accent'}</span>
            <span style={styles(theme).actionColorDot} />
          </Motion.button>
        </div>

        <Motion.section
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          style={styles(theme).hero}
        >
          <div style={styles(theme).heroGlow} />
          <div style={styles(theme).heroCopy}>
            <div style={styles(theme).eyebrow}>{isRu ? 'ДНЕВНИК' : 'JOURNAL'}</div>
            <h1 style={styles(theme).heroTitle}>{isRu ? 'Тренировки' : 'Training'}</h1>
            <div style={styles(theme).heroSubtitle}>
              {isRu ? 'Календарь и история нагрузки' : 'Calendar and load history'}
            </div>
            <div style={styles(theme).heroStats}>
              <HeroStat theme={theme} label={isRu ? 'тренировок' : 'workouts'} value={monthStats.total} accent={activeAccent} />
              <HeroStat theme={theme} label={isRu ? 'готово' : 'done'} value={monthStats.done} accent={activeAccent} />
              <HeroStat theme={theme} label={isRu ? 'минут' : 'minutes'} value={monthStats.minutes} accent={activeAccent} />
            </div>
          </div>
          <img style={styles(theme).heroImage} src="images/bro_training.png" alt="" />
        </Motion.section>

      <div style={styles(theme).panel}>
        {/* --- HEADER & CALENDAR --- */}
        <div style={styles(theme).calendarHead}>
          <Motion.div whileTap={{scale: 0.9}} onClick={prevMonth} style={styles(theme).navBtn}>
            <IoIosArrowBack size={22} color={Colors.get('mainText', theme)}/>
          </Motion.div>
          <div style={styles(theme).headerWrapper}>
            <div style={styles(theme).calendarKicker}>{isRu ? 'Нагрузка месяца' : 'Monthly load'}</div>
            <AnimatePresence mode="popLayout" custom={direction}>
              <Motion.h1
                key={date.toISOString()}
                variants={textVariants}
                custom={direction}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.25 }}
                style={styles(theme).header}
              >
                {monthNames[langIndex][date.getMonth()]} {date.getFullYear()}
              </Motion.h1>
            </AnimatePresence>
            <div style={styles(theme).calendarMeta}>
              <span>{monthStats.strength} {isRu ? 'сил.' : 'strength'}</span>
              <span style={styles(theme).calendarMetaDot} />
              <span>{monthStats.cardio} {isRu ? 'кардио' : 'cardio'}</span>
            </div>
          </div>
          <Motion.div whileTap={{scale: 0.9}} onClick={nextMonth} style={styles(theme).navBtn}>
            <IoIosArrowForward size={22} color={Colors.get('mainText', theme)}/>
          </Motion.div>
        </div>
        
        <div style={{width: '100%', paddingBottom: '20px', overflow: 'hidden'}}>
          <AnimatePresence mode="wait" custom={direction}>
            <Motion.div
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
                        <p style={{...styles(theme).weekdayLabel, color: (i >= 5) ? '#ff6b7a' : Colors.get('subText', theme)}}>{day}</p>
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
                        let cellBg = 'transparent';
                        let cellColor = Colors.get('mainText', theme);
                        if (isChoosen) { cellBg = activeAccent; cellColor = '#ffffff'; }
                        const isToday = today === day && curMonth === cellMonth;
                        return(
                          <td key={j} style={{padding: '3px'}}>
                            {day ? (
                              <div style={{
                                ...styles(theme).cell,
                                backgroundColor: cellBg, color: cellColor,
                                border: isToday ? `1px solid ${activeAccent}` : '1px solid transparent',
                                boxShadow: isChoosen ? `0 12px 28px rgba(${buildSectionAccent(activeAccent).rgb}, 0.22)` : 'none',
                              }}
                              onClick={() => {setCurrentDate(new Date(Date.UTC(cellYear, cellMonth, day)));playEffects(clickSound);}} >
                                <span style={styles(theme).cellDayNumber}>{day}</span>
                                {/* ICONS FOR DIFFERENT TYPES */}
                                {trAmount > 0 &&  (
                                  <div style={styles(theme).cellIconRail}>
                                    {/* GYM sessions */}
                                    {AppData.trainingLog[dayKey].filter(tr => tr.type === 'GYM' || tr.type === undefined).length > 0 && (
                                      <div
                                        title={`${langIndex === 0 ? 'Силовая' : 'Strength'}: ${AppData.trainingLog[dayKey].filter(tr => tr.type === 'GYM').length}`}
                                      >
                                        <MdFitnessCenter size={9} color={getTrainingIconColor('GYM')}/>
                                      </div>
                                    )}
                                    {/* RUNNING sessions */}
                                    {AppData.trainingLog[dayKey].filter(tr => tr.type === 'RUNNING').length > 0 && (
                                      <div
                                       
                                        title={`${langIndex === 0 ? 'Бег' : 'Running'}: ${AppData.trainingLog[dayKey].filter(tr => tr.type === 'RUNNING').length}`}
                                      >
                                        <FaRunning size={9} color={getTrainingIconColor('RUNNING')}/>
                                      </div>
                                    )}
                                    {/* CYCLING sessions */}
                                    {AppData.trainingLog[dayKey].filter(tr => tr.type === 'CYCLING').length > 0 && (
                                      <div
                                        
                                        title={`${langIndex === 0 ? 'Велосипед' : 'Cycling'}: ${AppData.trainingLog[dayKey].filter(tr => tr.type === 'CYCLING').length}`}
                                      >
                                        <FaBicycle size={9} color={getTrainingIconColor('CYCLING')} />
                                      </div>
                                    )}
                                    {/* SWIMMING sessions */}
                                    {AppData.trainingLog[dayKey].filter(tr => tr.type === 'SWIMMING').length > 0 && (
                                      <div
                                        
                                        title={`${langIndex === 0 ? 'Плавание' : 'Swimming'}: ${AppData.trainingLog[dayKey].filter(tr => tr.type === 'SWIMMING').length}`}
                                      >
                                        <FaSwimmer size={9} color={getTrainingIconColor('SWIMMING')} />
                                      </div>
                                    )}
                                  </div>
                                )}
                                {trAmount > 1 && <span style={styles(theme).cellCountPill}>{trAmount}</span>}
                              </div>
                            ) : <div style={{...styles(theme).cell, pointerEvents: 'none'}}></div>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* --- JOURNAL LIST SECTION --- */}
<div style={styles(theme).journalPanel}>
  <div style={{ flex: 1, overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div style={styles(theme).dayHeader}>
      <div>
      <div style={styles(theme).dayKicker}>{isRu ? 'Выбранный день' : 'Selected day'}</div>
      <h2 style={styles(theme).dayTitle}>
        {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]}, {fullNames[langIndex][getMondayIndex(currentDate)]}
      </h2>
      <p style={styles(theme).daySub}>
        {trainingAmountText(selectedSessions.length, langIndex)}
      </p>
      </div>
      <div style={styles(theme).dayActions}>
        <div
          onClick={() => setPage('TrainingList')}
          style={styles(theme).journalBtn}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && setPage('TrainingList')}
        >
          <div style={{ fontWeight: 900, fontSize: '12px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {langIndex === 0 ? 'Вся история' : 'Full history'}
          </div>
          <FaList size={13} />
        </div>
        <div style={styles(theme).dayBadge}>
          <span>{selectedDoneCount}</span>
          <span style={styles(theme).dayBadgeMuted}>/ {selectedSessions.length}</span>
        </div>
      </div>
    </div>
    
    <div style={styles(theme).scrollView}>
      {selectedSessions.length > 0 ? selectedSessions.map((training, index) => {
        const isGymType = training.type === 'GYM' || !training.type;
        const trainingKey = `${selectedDateKey}-${index}`;
        const typeData = getTrainingTypeData(training.type || 'GYM');
        const isFreeGym = isGymType && (training.isFree || training.programId == null);
        const gymProgramName = isFreeGym
          ? (langIndex === 0 ? 'Свободная тренировка' : 'Free workout')
          : (Array.isArray(AppData.programs[training.programId]?.name)
              ? AppData.programs[training.programId]?.name?.[langIndex]
              : AppData.programs[training.programId]?.name);
        const gymDayName = isFreeGym
          ? (langIndex === 0 ? 'Без программы - добавляйте упражнения по ходу' : 'No program - add exercises as you go')
          : ((langIndex === 0 ? 'День ' : 'Day ') + (training.dayIndex + 1) + ': ' +
             (AppData.programs[training.programId]?.schedule?.[training.dayIndex]?.name?.[langIndex] ||
             (langIndex === 0 ? `День ${training.dayIndex + 1}` : `Day ${training.dayIndex + 1}`)));
        
        return (
          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            key={trainingKey}
            style={{
              ...styles(theme).sessionCard,
              borderColor: `${typeData.color}42`,
              boxShadow: theme === 'light'
                ? `0 10px 26px rgba(15,23,42,0.06), inset 3px 0 0 ${typeData.color}`
                : `0 16px 36px rgba(0,0,0,0.18), inset 3px 0 0 ${typeData.color}`
            }}
            onClick={() => onSessionCardClick(
              training,
              selectedDateKey,
              index
            )}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSessionCardClick(training, selectedDateKey, index)}
          >
              <div style={styles(theme).sessionCardInner}>
              {/* Training Content */}
              <div style={styles(theme).sessionCardContent}>
                {/* Type Icon */}
                <div
                  style={styles(theme).sessionTypeIcon(typeData.color)}
                >
                  {training.completed ? (
                    React.cloneElement(
                      typeData.icon, 
                      { 
                        size: 25, 
                        color: typeData.color 
                      }
                    )
                  ) : (
                    <MdAccessTime size={19} color={typeData.color} />
                  )}
                </div>
                
                {/* Content Area */}
                <div style={styles(theme).sessionTextBlock}>
                  {isGymType ? (
                    // GYM TRAINING DISPLAY
                    <>
                      <span style={styles(theme, fSize).sessionTitle}>
                        {isGymType ? gymProgramName : trainingTypeOptions.find(t => t.value === training.type)?.label}
                      </span>
                      
                      <div style={styles(theme, fSize).sessionDescription}>
                        {gymDayName}
                      </div>
                      
                      {training.completed && (
                        <div style={styles(theme).sessionMetricGrid}>
                          <span style={styles(theme).sessionMetricChip}>{`${Math.round(training.duration / 60000)}${langIndex === 0 ? ' мин' : ' min'}`}</span>
                          <span style={styles(theme).sessionMetricChip}>{`${(training.tonnage * 0.001).toFixed(2)} ${langIndex === 0 ? 'т' : 't'}`}</span>
                          <span style={styles(theme).sessionMetricChip}>{getTrainingSummary(training, langIndex).replace(/^ • /, '')}</span>
                        </div>
                      )}
                      
                      {training.RPE && (
                        <div style={styles(theme).sessionRpeChip}>
                          <MdFitnessCenter size={12} />
                          <span style={{ fontWeight: '600' }}>RPE {training.RPE}/10</span>
                        </div>
                      )}
                      
                      {training.note && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          gap: '6px', 
                          textAlign:'left',
                          marginTop: '5px', 
                          paddingTop: '5px', 
                          borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)'}`,
                          fontSize: '10px',
                          color: Colors.get('subText', theme),
                          fontStyle: 'italic',
                          lineHeight: 1.4
                        }}>
                          <FaList size={10} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>
                            {training.note.length > 160 
                              ? training.note.substring(0, 160) + '...' 
                              : training.note}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    // CARDIO TRAINING DISPLAY
                    <div style={{ 
                      fontSize: '11px', 
                      color: Colors.get('mainText', theme), 
                      lineHeight: 1.5,
                      width: '100%'
                    }}>
                      {/* Distance & Duration */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '5px', 
                        marginBottom: '4px',
                        flexWrap: 'wrap'
                      }}>
                        <span>{cardioDistanceDisplay(training.distance, training.type, langIndex)}</span>
                        <span style={{ color: Colors.get('subText', theme) }}>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MdAccessTime size={12} color={Colors.get('subText', theme)} />
                          {formatDuration(training.duration, langIndex)}
                        </span>
                      </div>
                      
                      {/* Pace/Speed Indicator */}
                      {(training.type === 'RUNNING' || training.type === 'CYCLING') && 
                       training.distance > 0 && training.duration > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          padding: '4px 8px',
                          width: 'fit-content',
                          background: theme === 'light' ? 'rgba(76, 201, 240, 0.1)' : 'rgba(76, 201, 240, 0.15)',
                          borderRadius: '6px',
                          marginBottom: '6px'
                        }}>
                          {training.type === 'RUNNING' ? (
                            <>
                              <FaRunning size={11} color="#4CC9F0" />
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#4CC9F0' }}>
                                {calculatePace(training.distance, training.duration)} {langIndex === 0 ? 'мин/км' : 'min/km'}
                              </span>
                            </>
                          ) : (
                            <>
                              <FaBicycle size={11} color="#4361EE" />
                              <span style={{ fontSize: '11px', fontWeight: '600', color: '#4361EE' }}>
                                {calculateSpeed(training.distance, training.duration)} km/h
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {/* Metrics Row */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        flexWrap: 'wrap', 
                        marginTop: '4px',
                        fontSize: '11px'
                      }}>
                        {training.avgHeartRate > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FF6B9D' }}>
                            <span style={{ fontSize: '10px', fontWeight: 900 }}>HR</span>
                            <span style={{ fontWeight: '600' }}>{training.avgHeartRate} bpm</span>
                          </div>
                        )}
                        
                        {training.avgCadence > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4CC9F0' }}>
                            {training.type === 'RUNNING'
                              ? <FaRunning size={11} />
                              : training.type === 'CYCLING'
                                ? <FaBicycle size={11} />
                                : <FaSwimmer size={11} />}
                            <span style={{ fontWeight: '600' }}>
                              {training.avgCadence} {training.type === 'RUNNING' ? 'spm' : training.type === 'CYCLING' ? 'rpm' : 'spm'}
                            </span>
                          </div>
                        )}
                        
                        {training.rpe && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFA500' }}>
                            <MdFitnessCenter size={12} />
                            <span style={{ fontWeight: '600' }}>RPE {training.rpe}/10</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Notes */}
                      {training.notes && (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'flex-start', 
                          textAlign:'left',
                          gap: '6px', 
                          marginTop: '6px', 
                          paddingTop: '6px', 
                          borderTop: `1px solid ${theme === 'light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
                          fontSize: '10px',
                          color: Colors.get('subText', theme),
                          fontStyle: 'italic',
                          lineHeight: 1.4
                        }}>
                          <FaList size={10} style={{ marginTop: '2px', flexShrink: 0 }} />
                          <span>
                            {training.notes.length > 160 
                              ? training.notes.substring(0, 160) + '...' 
                              : training.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Delete Button */}
              <Motion.div
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(selectedDateKey, index);
                  setShowConfirmPanel(true);
                }}
                style={styles(theme).sessionDeleteBtn}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onDelete(selectedDateKey, index);
                    setShowConfirmPanel(true);
                  }
                }}
                aria-label={langIndex === 0 ? "Удалить тренировку" : "Delete workout"}
              >
                <FaTrash size={15} />
              </Motion.div>
            </div>
          </Motion.div>
        );
      }) : (
        <div style={styles(theme).emptyState}>
          <div style={styles(theme).emptyIcon}><MdFitnessCenter size={20} /></div>
          <div style={styles(theme).emptyTitle}>{langIndex === 0 ? 'Нет тренировок' : 'No sessions'}</div>
          <div style={styles(theme).emptyText}>
            {langIndex === 0 ? 'Нажмите + и начните свободно или по программе.' : 'Tap + to start free or from a program.'}
          </div>
        </div>
      )}
      
      {/* Bottom spacer for scroll area */}
      <div style={{ height: '14px', flexShrink: 0 }}></div>
    </div>
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
        
        {/* TYPE SELECTOR */}
        {showTypeSelector &&
          <BottomSheet theme={theme} onClose={() => setShowTypeSelector(false)}>
            <div style={styles(theme).sheetHeader}>
              <div style={styles(theme).sheetEyebrow}>{langIndex === 0 ? 'НОВАЯ ЗАПИСЬ' : 'NEW ENTRY'}</div>
              <h3 style={styles(theme,fSize).modalTitle}>{langIndex === 0 ? "Что тренируем?" : "What are you training?"}</h3>
              <p style={styles(theme).sheetDescription}>
                {langIndex === 0
                  ? "Для силовой выберите быстрый старт или готовый план. Кардио ниже."
                  : "For strength, choose quick start or a planned session. Cardio is below."}
              </p>
            </div>
            <div style={styles(theme).strengthActionGrid}>
              <Motion.button
                type="button"
                whileTap={{scale: 0.98}}
                onClick={onFreeSessionStart}
                style={styles(theme).strengthChoiceButton(true)}
              >
                <span style={styles(theme).strengthChoiceIcon(true)}><MdFitnessCenter size={20} /></span>
                <span style={styles(theme).strengthChoiceText}>
                  <strong>{langIndex === 0 ? 'Свободная тренировка' : 'Free workout'}</strong>
                  <span style={styles(theme).strengthChoiceSubtext}>{langIndex === 0 ? 'Начать сразу' : 'Start now'}</span>
                </span>
              </Motion.button>

              <Motion.button
                type="button"
                whileTap={{scale: 0.98}}
                onClick={openProgramSessionPanel}
                style={styles(theme).strengthChoiceButton(false)}
              >
                <span style={styles(theme).strengthChoiceIcon(false)}><FaList size={18} /></span>
                <span style={styles(theme).strengthChoiceText}>
                  <strong>{langIndex === 0 ? 'По программе' : 'From program'}</strong>
                  <span style={styles(theme).strengthChoiceSubtext}>{langIndex === 0 ? 'Выбрать день' : 'Pick a day'}</span>
                </span>
              </Motion.button>
            </div>
            <div style={styles(theme).sheetSectionLabel}>{langIndex === 0 ? 'Кардио' : 'Cardio'}</div>
            <div style={styles(theme).typeGrid}>
              {trainingTypeOptions.filter(type => type.value !== 'GYM').map((type) => (
                <Motion.div
                  key={type.value}
                  whileTap={{scale: 0.98}}
                  onClick={() => handleTypeSelect(type.value)}
                  style={styles(theme).typeCard(type)}
                >
                  <div style={styles(theme).typeIconBox(type)}>{type.icon}</div>
                  <div style={{minWidth: 0}}>
                    <div style={styles(theme).typeLabel}>{type.label}</div>
                    <div style={styles(theme).typeDescription}>{type.description}</div>
                  </div>
                </Motion.div>
              ))}
            </div>
          </BottomSheet>
        }
        
        {/* NEW SESSION PANEL (GYM only) */}
        {showNewSessionPanel && selectedTrainingType === 'GYM' &&
          <BottomSheet theme={theme} onClose={() => {setShowNewSessionPanel(false); setShowTypeSelector(true);}}>
            <div style={styles(theme).sheetTitleRow}>
              <div>
                <div style={styles(theme).sheetEyebrow}>{langIndex === 0 ? 'СИЛОВАЯ' : 'STRENGTH'}</div>
                <p style={styles(theme,fSize).modalTitle}>{langIndex === 0 ? 'Новая тренировка' : 'New Session'}</p>
              </div>
              <div onClick={() => {setShowNewSessionPanel(false); setShowTypeSelector(true);}} style={{padding:'5px', cursor:'pointer'}}><MdClose size={24} color={Colors.get('subText', theme)}/></div>
            </div>

            <Motion.div whileTap={{scale: 0.98}} onClick={onFreeSessionStart} style={styles(theme).quickStartCard}>
              <div style={styles(theme).quickStartIcon}><MdFitnessCenter size={22} /></div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={styles(theme).choiceTitle}>{langIndex === 0 ? 'Свободная тренировка' : 'Free workout'}</div>
                <div style={styles(theme).choiceText}>
                  {langIndex === 0 ? 'Начать сейчас и добавлять упражнения по ходу.' : 'Start now and add exercises as you go.'}
                </div>
              </div>
              <MdDone size={20} />
            </Motion.div>

            <div style={styles(theme).programStartBlock}>
              <div style={styles(theme).programStartHeader}>
                <div style={styles(theme).choiceTitle}>{langIndex === 0 ? 'По программе' : 'From a program'}</div>
                <div style={styles(theme).choiceText}>{langIndex === 0 ? 'Если уже есть план на день.' : 'When the day is already planned.'}</div>
              </div>
              <div style={styles(theme).pickerGrid}>
                <div style={styles(theme).fieldStack}>
                  <PickerLabel label={langIndex === 0 ? "Программа" : "Program"} theme={theme} />
                  <select
                    value={programId}
                    onChange={(e) => setProgrammId(Number(e.target.value))}
                    style={styles(theme).selectField}
                  >
                    {programOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <div style={styles(theme).fieldStack}>
                  <PickerLabel label={langIndex === 0 ? "День" : "Day"} theme={theme} />
                  <select
                    value={dayIndex}
                    onChange={(e) => setDayIndex(Number(e.target.value))}
                    style={styles(theme).selectField}
                  >
                    {dayOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <ActionButton icon={<MdDone size={24}/>} label={langIndex===0 ? "Начать по программе" : "Start program"} onClick={onSessionStart} theme={theme} isPrimary />
            </div>
          </BottomSheet>
        }
        
        {/* PREVIOUS SESSION PANEL (GYM only - cardio removed) */}
        {showPreviousSessionPanel && selectedTrainingType === 'GYM' &&
          <BottomSheet theme={theme} onClose={() => {setShowPreviousSessionPanel(false); setShowTypeSelector(true);}}>
            <div style={styles(theme).sheetTitleRow}>
              <div>
                <div style={styles(theme).sheetEyebrow}>{langIndex === 0 ? 'СИЛОВАЯ' : 'STRENGTH'}</div>
                <p style={styles(theme,fSize).modalTitle}>
                  {langIndex === 0 ? 'Добавить тренировку' : 'Log workout'}
                </p>
              </div>
              <div onClick={() => {setShowPreviousSessionPanel(false); setShowTypeSelector(true);}} style={{padding:'5px', cursor:'pointer'}}><MdClose size={24} color={Colors.get('subText', theme)}/></div>
            </div>
            <Motion.div whileTap={{scale: 0.98}} onClick={onFreeSessionStart} style={{...styles(theme).quickStartCard, marginBottom: '16px'}}>
              <div style={styles(theme).quickStartIcon}><MdFitnessCenter size={22} /></div>
              <div style={{flex: 1, minWidth: 0}}>
                <div style={styles(theme).choiceTitle}>{langIndex === 0 ? 'Свободная тренировка' : 'Free workout'}</div>
                <div style={styles(theme).choiceText}>
                  {langIndex === 0 ? 'Без программы и выбора дня.' : 'No program or day selection.'}
                </div>
              </div>
              <MdDone size={20} />
            </Motion.div>
            <div style={{marginBottom: '20px', width: '100%'}}>
              <PickerLabel label={langIndex === 0 ? "Программа" : "Program"} theme={theme} />
              <select
                value={programId}
                onChange={(e) => setProgrammId(Number(e.target.value))}
                style={styles(theme).selectField}
              >
                {programOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div style={{marginBottom: '20px', width: '100%'}}>
              <PickerLabel label={langIndex === 0 ? "День" : "Day"} theme={theme} />
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                style={styles(theme).selectField}
              >
                {dayOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div style={{backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderRadius: '20px', padding: '15px', marginBottom: '20px'}}>
              <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px', opacity:0.7}}>
                <MdAccessTime />
                <span style={{fontSize:'12px', fontWeight:'700', textTransform:'uppercase', letterSpacing:'1px'}}>{langIndex === 0 ? "Время" : "Time"}</span>
              </div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px'}}>
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
                    <span style={{paddingTop: '25%', fontWeight: 'bold'}}>:</span>
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
                    <span style={{paddingTop: '25%', fontWeight: 'bold'}}>:</span>
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
            <ActionButton
              icon={<MdDone size={24}/>}
              label={langIndex===0 ? "Сохранить" : "Save"}
              onClick={() => {
                if(!AppData.programs[programId]){
                  setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа не найдена' : 'Error! The program not found',2000,false);
                  return;
                }
                if(AppData.programs[programId].schedule.length === 0){
                  setShowPopUpPanel(langIndex === 0 ? 'Ошибка! Программа пустая' : 'Error! The program is empty',2000,false);
                  return;
                }
                if (endTime <= startTime) {
                  setShowPopUpPanel(langIndex === 0 ? "Время окончания должно быть позже начала" : "End time must be after start time",2000,false);
                  return;
                }
                addPreviousSession(currentDate, programId, dayIndex, startTime, endTime);
                setShowPreviousSessionPanel(false);
                setShowTypeSelector(false);
                const dayKey = formatDateKey(currentDate);
                const sessionIndex = AppData.trainingLog[dayKey].length - 1;
                setTrainInfo({mode:'redact',dayKey:dayKey,dInd:sessionIndex});
                setPage('TrainingCurrent');
              }}
              theme={theme}
              isPrimary
            />
          </BottomSheet>
        }
      </AnimatePresence>
    </div>
  )
}

// --- MODERN UI COMPONENTS ---
const BottomSheet = ({children, theme, onClose}) => (
  <Motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    style={styles(theme).backdrop}
    onClick={onClose}
  >
    <Motion.div
      variants={bottomSheetVariants} initial="hidden" animate="visible" exit="exit"
      style={styles(theme).bottomSheet}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{width: '40px', height: '4px', backgroundColor: Colors.get('subText', theme), borderRadius: '2px', margin: '0 auto 20px auto', opacity: 0.3}} />
      {children}
    </Motion.div>
  </Motion.div>
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
    bg = isDestructive
      ? 'linear-gradient(135deg, #EF4444, #DC2626)'
      : 'linear-gradient(135deg, #14B8A6, #10B981)';
    color = '#fff';
  }
  return (
    <Motion.div
      whileTap={{scale: 0.98}}
      onClick={onClick}
      style={{
        flex: 1, height: '56px', borderRadius: '16px',
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        color: color, cursor: 'pointer', fontWeight: '600', fontSize: '16px',
        boxShadow: isPrimary ? `0 12px 26px ${isDestructive ? 'rgba(239,68,68,0.22)' : 'rgba(16,185,129,0.22)'}` : 'none'
      }}
    >
      {icon}
      {label && <span>{label}</span>}
    </Motion.div>
  );
};

const HeroStat = ({ theme, label, value, accent }) => (
  <div style={{ ...styles(theme).heroStat, borderColor: `${accent}2e`, background: `linear-gradient(145deg, ${accent}16, rgba(255,255,255,0.035))` }}>
    <div style={{ ...styles(theme).heroStatValue, color: Colors.get('mainText', theme) }}>{value}</div>
    <div style={styles(theme).heroStatLabel}>{label}</div>
  </div>
);

export default TrainingMain

// --- HELPER STYLES & FUNCTIONS ---
const trainingAmountText = (trainingAmount,langIndex) => {
  if(trainingAmount == 0) return langIndex == 0 ? 'Нет тренировок' : 'No trainings';
  if(trainingAmount == 1) return langIndex == 0 ? '1 тренировка' : '1 training';
  if(trainingAmount > 1 && trainingAmount < 5) return trainingAmount + (langIndex == 0 ? ' тренировки' : ' trainings');
  return trainingAmount + (langIndex == 0 ? ' тренировок' : ' trainings');
}

function getTrainingSummary(session, langIndex) {
  if (!session?.exercises) { return (langIndex === 0 ? ' • 0 упр.' : ' • 0 ex.'); }
  let exerciseCount = 0; let setCount = 0;
  for (const exercise of Object.values(session.exercises)) {
    exerciseCount++;
    if (Array.isArray(exercise.sets)) { setCount += exercise.sets.length; }
  }
  return langIndex === 0 ? ` • ${exerciseCount} упр. / ${setCount} подх.` : ` • ${exerciseCount} ex. / ${setCount} sets`;
}

// Add this helper function near other helpers
const formatDuration = (durationMinutes, langIndex) => {
  if (!durationMinutes) return langIndex === 0 ? '0 мин' : '0 min';
  
  const hours = Math.floor(durationMinutes / 60 / 60000);
  const minutes = Math.floor(durationMinutes / 60000 % 60);
  
  if (hours > 0) {
    return langIndex === 0 
      ? `${hours} ч ${minutes} мин`
      : `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  }
  
  return langIndex === 0 
    ? `${minutes} мин`
    : `${minutes} min`;
};
const calculatePace = (distanceKm, durationMinutes) => {
  if (!distanceKm || distanceKm <= 0 || !durationMinutes || durationMinutes <= 0) return null;
  const pace = (durationMinutes / 60000) / distanceKm; // minutes per km
  const min = Math.floor(pace);
  const sec = Math.round((pace - min) * 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
};

// NEW: Calculate speed for CYCLING (km/h)
const calculateSpeed = (distanceKm, durationMinutes) => {
  if (!distanceKm || distanceKm <= 0 || !durationMinutes || durationMinutes <= 0) return null;
  const hours = (durationMinutes / 60000) / 60;
  const speed = distanceKm / hours;
  return speed.toFixed(1);
};

// Update cardioDistanceDisplay to be more precise
const cardioDistanceDisplay = (distance, type, langIndex) => {
  if (!distance) return langIndex === 0 ? '0 км' : '0 km';
  
  if (type === 'SWIMMING') {
    return `${(distance * 1000).toFixed(0)}${langIndex === 0 ? ' м' : ' m'}`;
  }
  
  return `${distance.toFixed(1)}${langIndex === 0 ? ' км' : ' km'}`;
};

const styles = (theme, fSize = 0) => {
  const isDark = theme === 'dark' || theme === 'specialdark';
  const mainText = Colors.get('mainText', theme);
  const subText = Colors.get('subText', theme);
  const background = Colors.get('background', theme);
  const trainingAccent = buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT);

  return {
    container: {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: isDark
        ? `radial-gradient(circle at 14% -6%, rgba(${trainingAccent.rgb},0.32), transparent 34%),
           radial-gradient(circle at 92% 12%, rgba(20,184,166,0.16), transparent 30%),
           linear-gradient(180deg, #162536 0%, ${background} 76%)`
        : `radial-gradient(circle at 14% -6%, rgba(${trainingAccent.rgb},0.22), transparent 34%),
           linear-gradient(180deg, rgba(${trainingAccent.rgb},0.12) 0%, ${background} 52%)`,
      color: mainText,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    pageScroll: {
      width: '100vw',
      height: '100vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 4.5vw 122px',
      boxSizing: 'border-box',
    },
    pageHeader: {
      width: '100%',
      maxWidth: '600px',
      display: 'grid',
      gridTemplateColumns: '96px minmax(0, 1fr) 96px',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 0 16px',
      boxSizing: 'border-box',
    },
    pageHeaderSpacer: { width: '96px', height: '38px' },
    pageHeaderBrand: { minWidth: 0, textAlign: 'center' },
    headerAccentButton: {
      minWidth: 0,
      height: '38px',
      borderRadius: '999px',
      border: `1px solid ${trainingAccent.ring}`,
      background: trainingAccent.soft,
      color: trainingAccent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      justifySelf: 'end',
      gap: '6px',
      fontSize: '12px',
      fontWeight: 900,
      fontFamily: 'inherit',
      padding: '0 11px',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    },
    actionColorDot: {
      width: '8px',
      height: '8px',
      borderRadius: '99px',
      background: trainingAccent.hue,
      boxShadow: `0 0 12px ${trainingAccent.glow}`,
      flexShrink: 0,
    },
    pageTitle: {
      color: mainText,
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: fSize === 0 ? '25px' : '27px',
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.05,
      opacity: 0.92,
    },
    pageSubtitle: {
      marginTop: '6px',
      color: subText,
      fontSize: fSize === 0 ? '10px' : '11px',
      fontWeight: 700,
      letterSpacing: '0.18em',
      lineHeight: 1.3,
    },
    hero: {
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      minHeight: '174px',
      padding: '18px 18px 16px',
      borderRadius: '30px',
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: isDark
        ? `linear-gradient(135deg, rgba(${trainingAccent.rgb},0.14), rgba(16,30,44,0.66) 44%, rgba(12,22,32,0.56))`
        : `linear-gradient(135deg, rgba(255,255,255,0.72), rgba(${trainingAccent.rgb},0.10))`,
      border: `1px solid ${isDark ? 'rgba(190,220,235,0.13)' : 'rgba(15,23,42,0.075)'}`,
      boxShadow: isDark
        ? '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)'
        : '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)',
      backdropFilter: 'blur(26px) saturate(170%)',
      WebkitBackdropFilter: 'blur(26px) saturate(170%)',
    },
    heroGlow: {
      position: 'absolute',
      inset: 0,
      background: `radial-gradient(circle at 78% 22%, rgba(${trainingAccent.rgb},0.12), transparent 38%), radial-gradient(circle at 22% 110%, rgba(${trainingAccent.rgb},0.055), transparent 44%)`,
      pointerEvents: 'none',
    },
    heroCopy: {
      position: 'relative',
      zIndex: 1,
      width: 'calc(100% - min(31vw, 156px))',
      minWidth: '212px',
    },
    eyebrow: {
      marginBottom: '5px',
      color: trainingAccent.hue,
      fontSize: fSize === 0 ? '11px' : '12px',
      fontWeight: 900,
      letterSpacing: '0.18em',
    },
    heroTitle: {
      margin: 0,
      color: mainText,
      fontSize: fSize === 0 ? '30px' : '33px',
      lineHeight: 1.04,
      fontWeight: 900,
      letterSpacing: 0,
    },
    heroSubtitle: {
      margin: '7px 0 12px',
      maxWidth: '310px',
      color: subText,
      fontSize: fSize === 0 ? '14px' : '15px',
      lineHeight: 1.35,
      fontWeight: 700,
    },
    heroStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '7px',
      width: '100%',
      maxWidth: '286px',
    },
    heroStat: {
      minHeight: '50px',
      padding: '7px 8px',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.42)',
      border: `1px solid ${isDark ? 'rgba(190,220,235,0.105)' : 'rgba(15,23,42,0.075)'}`,
      backdropFilter: 'blur(16px) saturate(150%)',
      WebkitBackdropFilter: 'blur(16px) saturate(150%)',
      boxSizing: 'border-box',
      minWidth: 0,
    },
    heroStatValue: {
      color: mainText,
      fontSize: '16px',
      fontWeight: 900,
      lineHeight: 1.05,
      fontVariantNumeric: 'tabular-nums',
    },
    heroStatLabel: {
      marginTop: '2px',
      color: subText,
      fontSize: '8px',
      fontWeight: 800,
      lineHeight: 1.1,
      textTransform: 'none',
      letterSpacing: 0,
      whiteSpace: 'normal',
      overflow: 'hidden',
      textOverflow: 'clip',
    },
    heroImage: {
      position: 'absolute',
      right: '4px',
      top: '50%',
      transform: 'translateY(-44%)',
      width: 'min(31vw, 150px)',
      maxHeight: '154px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.45))',
      opacity: isDark ? 1 : 0.92,
      pointerEvents: 'none',
      zIndex: 1,
    },
    panel: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: '600px',
      alignItems: 'center',
      justifyContent: 'start',
      position: 'relative',
      zIndex: 1,
      marginTop: '14px',
      padding: '10px 10px 14px',
      borderRadius: '28px',
      boxSizing: 'border-box',
      background: isDark
        ? `linear-gradient(135deg, rgba(${trainingAccent.rgb},0.09), rgba(255,255,255,0.026))`
        : 'linear-gradient(135deg, rgba(255,255,255,0.68), rgba(255,255,255,0.40))',
      border: `1px solid ${isDark ? `rgba(${trainingAccent.rgb},0.18)` : 'rgba(15,23,42,0.08)'}`,
      boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)' : '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)',
      backdropFilter: 'blur(22px) saturate(165%)',
      WebkitBackdropFilter: 'blur(22px) saturate(165%)',
    },
    calendarHead: {
      padding: '8px 6px 14px',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      boxSizing: 'border-box',
    },
    headerWrapper: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minWidth: '150px',
    },
    calendarKicker: {
      color: trainingAccent.hue,
      fontSize: '9px',
      fontWeight: 950,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      lineHeight: 1,
      marginBottom: '5px',
    },
    header: {
      fontSize: '21px',
      margin: 0,
      fontWeight: 900,
      color: mainText,
      textTransform: 'capitalize',
      whiteSpace: 'nowrap',
      letterSpacing: 0,
    },
    calendarMeta: {
      marginTop: '6px',
      minHeight: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      color: subText,
      fontSize: '10px',
      fontWeight: 850,
      lineHeight: 1,
      whiteSpace: 'nowrap',
    },
    calendarMetaDot: {
      width: '4px',
      height: '4px',
      borderRadius: '99px',
      background: trainingAccent.hue,
      boxShadow: `0 0 10px ${trainingAccent.glow}`,
      flexShrink: 0,
    },
    navBtn: {
      width: '42px',
      height: '42px',
      borderRadius: '16px',
      cursor: 'pointer',
      backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(15,23,42,0.055)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.07)'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
      boxSizing: 'border-box',
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0 4px',
      textAlign: 'center',
    },
    weekdayLabel: {
      textAlign: 'center',
      fontSize: '11px',
      fontWeight: 900,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      opacity: 0.82,
      margin: 0,
    },
    cell: {
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: 'min(12.5vw, 48px)',
      height: 'min(12.5vw, 48px)',
      minWidth: '38px',
      minHeight: '38px',
      borderRadius: '15px',
      fontSize: '14px',
      fontWeight: 800,
      transition: 'all 0.2s ease-in-out',
      cursor: 'pointer',
      margin: 'auto',
      position: 'relative',
      background: isDark
        ? 'linear-gradient(180deg, rgba(255,255,255,0.052), rgba(255,255,255,0.018))'
        : 'linear-gradient(180deg, rgba(255,255,255,0.84), rgba(15,23,42,0.035))',
      boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.045)' : 'inset 0 1px 0 rgba(255,255,255,0.86)',
    },
    cellDayNumber: {
      display: 'block',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
    },
    cellIconRail: {
      position: 'absolute',
      left: '50%',
      bottom: '6px',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      minHeight: '10px',
      padding: '1px 4px',
      borderRadius: '999px',
      background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.68)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.05)'}`,
      boxSizing: 'border-box',
    },
    cellCountPill: {
      position: 'absolute',
      top: '4px',
      right: '4px',
      minWidth: '14px',
      height: '14px',
      padding: '0 4px',
      borderRadius: '99px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDark ? '#08111A' : '#fff',
      background: trainingAccent.hue,
      fontSize: '9px',
      fontWeight: 950,
      lineHeight: 1,
      boxSizing: 'border-box',
    },
    journalPanel: {
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      marginTop: '12px',
      padding: '10px',
      borderRadius: '28px',
      boxSizing: 'border-box',
      background: isDark
        ? 'linear-gradient(135deg, rgba(31,35,39,0.88), rgba(18,20,23,0.92))'
        : 'rgba(255,255,255,0.88)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      boxShadow: isDark ? '0 18px 48px rgba(0,0,0,0.22)' : '0 14px 36px rgba(15,23,42,0.08)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    },
    journalBtn: {
      alignSelf: 'flex-end',
      margin: 0,
      background: trainingAccent.soft,
      color: trainingAccent.hue,
      padding: '8px 12px',
      borderRadius: '16px',
      border: `1px solid ${trainingAccent.ring}`,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    dayHeader: {
      padding: '2px 2px 14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
    },
    dayKicker: {
      marginBottom: '5px',
      color: trainingAccent.hue,
      fontSize: '10px',
      fontWeight: 950,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    },
    dayActions: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      gap: '8px',
      flexShrink: 0,
    },
    dayTitle: {
      margin: 0,
      fontSize: '18px',
      lineHeight: 1.18,
      color: mainText,
      fontWeight: 900,
      letterSpacing: 0,
    },
    daySub: {
      margin: '5px 0 0',
      fontSize: '13px',
      color: subText,
      fontWeight: 700,
    },
    dayBadge: {
      minWidth: '58px',
      height: '42px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: trainingAccent.hue,
      fontSize: '16px',
      fontWeight: 900,
      backgroundColor: isDark ? `rgba(${trainingAccent.rgb},0.1)` : `rgba(${trainingAccent.rgb},0.16)`,
      border: `1px solid ${trainingAccent.ring}`,
      flexShrink: 0,
    },
    dayBadgeMuted: {
      color: subText,
      marginLeft: '4px',
      fontSize: '13px',
    },
    scrollView: {
      flex: 1,
      width: '100%',
      padding: '0 0 14px',
      boxSizing: 'border-box',
    },
    sessionCard: {
      background: isDark
        ? `linear-gradient(135deg, rgba(${trainingAccent.rgb},0.105), rgba(255,255,255,0.038) 48%, rgba(255,255,255,0.024))`
        : 'linear-gradient(135deg, #fff, rgba(248,250,252,0.92))',
      borderRadius: '22px',
      padding: '14px',
      marginBottom: '10px',
      boxShadow: isDark ? `0 16px 36px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)` : '0 8px 22px rgba(15,23,42,0.06)',
      border: `1px solid ${isDark ? `rgba(${trainingAccent.rgb},0.22)` : 'rgba(15,23,42,0.07)'}`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      textAlign: 'left',
      cursor: 'pointer',
    },
    sessionCardInner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: '12px',
    },
    sessionCardContent: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      flex: 1,
      minWidth: 0,
    },
    sessionTextBlock: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      minWidth: 0,
    },
    sessionTypeIcon: (color) => ({
      width: '46px',
      height: '46px',
      borderRadius: '16px',
      background: isDark
        ? `linear-gradient(145deg, ${color}34, rgba(255,255,255,0.045))`
        : `linear-gradient(145deg, ${color}24, rgba(255,255,255,0.92))`,
      border: `1px solid ${color}55`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      boxShadow: `0 10px 24px ${color}18`,
    }),
    sessionTitle: {
      fontWeight: 900,
      color: mainText,
      fontSize: fSize === 0 ? '16px' : '18px',
      lineHeight: 1.22,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
    },
    sessionDescription: {
      fontSize: fSize === 0 ? '12px' : '14px',
      color: subText,
      lineHeight: 1.35,
      fontWeight: 750,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'normal',
    },
    sessionMetricGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '6px',
      marginTop: '2px',
    },
    sessionMetricChip: {
      minHeight: '24px',
      borderRadius: '999px',
      padding: '5px 8px',
      background: isDark ? 'rgba(0,0,0,0.20)' : 'rgba(15,23,42,0.045)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
      color: subText,
      fontSize: '11px',
      fontWeight: 800,
      boxSizing: 'border-box',
    },
    sessionRpeChip: {
      width: 'fit-content',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      color: '#FBBF24',
      background: isDark ? 'rgba(251,191,36,0.10)' : 'rgba(251,191,36,0.14)',
      border: '1px solid rgba(251,191,36,0.26)',
      borderRadius: '999px',
      padding: '5px 8px',
      fontSize: '11px',
      fontWeight: 800,
    },
    sessionDeleteBtn: {
      width: '42px',
      height: '42px',
      borderRadius: '15px',
      cursor: 'pointer',
      alignSelf: 'center',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: isDark ? '#94A3B8' : '#64748B',
      background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(15,23,42,0.045)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
    },
    emptyState: {
      minHeight: '118px',
      borderRadius: '22px',
      border: `1px dashed ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(15,23,42,0.14)'}`,
      backgroundColor: isDark ? 'rgba(255,255,255,0.028)' : 'rgba(15,23,42,0.035)',
      color: subText,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '14px',
      boxSizing: 'border-box',
    },
    emptyIcon: {
      width: '38px',
      height: '38px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: trainingAccent.hue,
      backgroundColor: trainingAccent.soft,
      border: `1px solid ${trainingAccent.ring}`,
      marginBottom: '8px',
    },
    emptyTitle: {
      color: mainText,
      fontSize: '15px',
      fontWeight: 900,
      marginBottom: '4px',
    },
    emptyText: {
      color: subText,
      fontSize: '12px',
      fontWeight: 700,
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.58)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 3000,
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    },
    bottomSheet: {
      width: '100%',
      maxWidth: '520px',
      maxHeight: '88vh',
      overflowY: 'auto',
      background: isDark
        ? 'linear-gradient(180deg, rgba(28,31,35,0.98), rgba(17,19,22,0.98))'
        : Colors.get('background', theme),
      borderTopLeftRadius: '30px',
      borderTopRightRadius: '30px',
      padding: '20px 25px 40px',
      boxShadow: '0 -18px 54px rgba(0,0,0,0.34)',
      position: 'relative',
      zIndex: 3001,
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
      boxSizing: 'border-box',
    },
    modalTitle: {
      fontSize: '20px',
      fontWeight: 900,
      color: mainText,
      margin: 0,
      letterSpacing: 0,
    },
    sheetHeader: {
      textAlign: 'left',
      marginBottom: '20px',
      padding: '0 2px',
    },
    sheetTitleRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '16px',
      marginBottom: '16px',
    },
    sheetEyebrow: {
      marginBottom: '6px',
      color: trainingAccent.hue,
      fontSize: '11px',
      fontWeight: 900,
      letterSpacing: '0.16em',
    },
    sheetDescription: {
      margin: '8px 0 0',
      color: subText,
      fontSize: '14px',
      lineHeight: 1.45,
      fontWeight: 700,
    },
    strengthActionGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '10px',
      width: '100%',
      marginBottom: '16px',
    },
    strengthChoiceButton: (isPrimary) => ({
      width: '100%',
      minHeight: '68px',
      borderRadius: '22px',
      padding: '12px 14px',
      border: `1px solid ${isPrimary ? 'rgba(16,185,129,0.42)' : 'rgba(59,130,246,0.42)'}`,
      background: isPrimary
        ? 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(20,184,166,0.08))'
        : 'linear-gradient(135deg, rgba(59,130,246,0.20), rgba(37,99,235,0.07))',
      color: mainText,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textAlign: 'left',
      cursor: 'pointer',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      boxShadow: isPrimary ? '0 16px 36px rgba(16,185,129,0.14)' : '0 16px 36px rgba(59,130,246,0.12)',
    }),
    strengthChoiceIcon: (isPrimary) => ({
      width: '42px',
      height: '42px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      color: isPrimary ? '#10B981' : '#3B82F6',
      backgroundColor: isPrimary ? 'rgba(16,185,129,0.14)' : 'rgba(59,130,246,0.14)',
      border: `1px solid ${isPrimary ? 'rgba(16,185,129,0.34)' : 'rgba(59,130,246,0.34)'}`,
    }),
    strengthChoiceText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '3px',
      minWidth: 0,
      fontSize: '15px',
      lineHeight: 1.15,
    },
    strengthChoiceSubtext: {
      color: subText,
      fontSize: '12px',
      fontWeight: 750,
    },
    sheetSectionLabel: {
      margin: '0 0 10px',
      color: subText,
      fontSize: '11px',
      fontWeight: 900,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
    },
    typeGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      width: '100%',
    },
    typeCard: (type) => ({
      minHeight: '104px',
      borderRadius: '22px',
      padding: '14px',
      background: isDark
        ? `linear-gradient(145deg, ${type.color}1e, rgba(255,255,255,0.045))`
        : `linear-gradient(145deg, ${type.color}16, rgba(255,255,255,0.88))`,
      border: `1px solid ${type.color}36`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
      color: type.color,
      cursor: 'pointer',
      boxShadow: `0 16px 34px ${type.glow || 'rgba(0,0,0,0.12)'}`,
      boxSizing: 'border-box',
    }),
    typeIconBox: (type) => ({
      width: '42px',
      height: '42px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${type.color}18`,
      border: `1px solid ${type.color}30`,
      color: type.color,
    }),
    typeLabel: {
      color: mainText,
      fontSize: '15px',
      fontWeight: 900,
      lineHeight: 1.15,
    },
    typeDescription: {
      marginTop: '4px',
      color: subText,
      fontSize: '11px',
      fontWeight: 700,
      lineHeight: 1.25,
    },
    quickStartCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      width: '100%',
      padding: '16px',
      borderRadius: '24px',
      background: `linear-gradient(135deg, rgba(${trainingAccent.rgb},0.22), rgba(${trainingAccent.rgb},0.08))`,
      border: `1px solid ${trainingAccent.ring}`,
      color: trainingAccent.hue,
      cursor: 'pointer',
      boxSizing: 'border-box',
      boxShadow: `0 16px 38px rgba(${trainingAccent.rgb},0.16)`,
    },
    quickStartIcon: {
      width: '48px',
      height: '48px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `rgba(${trainingAccent.rgb},0.16)`,
      color: trainingAccent.hue,
      flexShrink: 0,
    },
    programStartBlock: {
      marginTop: '14px',
      padding: '16px',
      borderRadius: '24px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(15,23,42,0.035)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.075)'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      boxSizing: 'border-box',
    },
    programStartHeader: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    choiceTitle: {
      color: mainText,
      fontSize: '16px',
      fontWeight: 900,
      lineHeight: 1.2,
    },
    choiceText: {
      color: subText,
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: 1.35,
    },
    pickerGrid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: '14px',
      alignItems: 'start',
    },
    fieldStack: {
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    },
    selectField: {
      width: '100%',
      minHeight: '48px',
      borderRadius: '16px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.12)'}`,
      backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.9)',
      color: mainText,
      padding: '0 14px',
      fontSize: '14px',
      fontWeight: 800,
      outline: 'none',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
    },
  };
};
