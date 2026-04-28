import React, {useState,useEffect,useRef} from 'react'
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import { playEffects } from '../../StaticClasses/Effects.js'
import Colors from '../../StaticClasses/Colors'
import { HABITS_ACCENT, HabitOutlineIcon, getHabitCategoryTone } from './HabitVisuals.jsx';

// ВАЖНО: Импорты как в HabitsMain
import { expandedCard$, setExpandedCard } from '../../StaticClasses/HabitsBus.js';
import { theme$ ,lang$,fontSize$, emitHabitsChanged, setPage } from '../../StaticClasses/HabitsBus'

import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import {MdDoneAll} from 'react-icons/md'
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const HABITS_SUCCESS = {
    hue: '#78B879',
    soft: 'rgba(120,184,121,0.18)',
    ring: 'rgba(120,184,121,0.30)',
    glow: 'rgba(120,184,121,0.20)',
    rgb: '120,184,121'
};

const NEGATIVE_SUCCESS = {
    hue: '#D8785E',
    soft: 'rgba(216,120,94,0.18)',
    ring: 'rgba(216,120,94,0.32)',
    glow: 'rgba(216,120,94,0.20)'
};
const NEGATIVE_CATEGORY = 'Отказ от вредного';
const NEGATIVE_CATEGORY_EN = 'Bad habits to quit';

const formatDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

const formatTimeInput = (timestamp, fallbackDate) => {
    const date = timestamp ? new Date(timestamp) : fallbackDate;
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const buildTimestampFromTime = (date, time) => {
    const [hours, minutes] = time.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours || 0, minutes || 0, 0, 0);
    return result.getTime();
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

const getDayStartMs = (value) => {
    let date;
    if (value instanceof Date) {
        date = new Date(value);
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date(value);
    }
    date.setHours(0, 0, 0, 0);
    return date.getTime();
};

function getHabitEntriesForDate(date) {
    const dateKey = date instanceof Date ? formatDateKey(date) : date;
    const dayData = AppData.habitsByDate?.[dateKey] || {};
    const hasStoredDay = AppData.hasKey(dateKey);
    if (!hasStoredDay) return [];

    const selectedDayMs = getDayStartMs(dateKey);
    const allHabitMap = new Map(getAllHabits().map((habit) => [Number(habit.id), habit]));
    const orderedIds = [];
    const seenIds = new Set();

    (AppData.choosenHabits || []).forEach((habitId, index) => {
        const numId = Number(habitId);
        const startDate = AppData.choosenHabitsStartDates?.[index];
        if (startDate && getDayStartMs(startDate) > selectedDayMs) return;
        orderedIds.push(numId);
        seenIds.add(numId);
    });

    Object.keys(dayData).forEach((habitId) => {
        const numId = Number(habitId);
        if (!seenIds.has(numId)) {
            orderedIds.push(numId);
            seenIds.add(numId);
        }
    });

    return orderedIds
        .map((habitId) => {
            const habit = allHabitMap.get(habitId);
            if (!habit) return null;
            return {
                id: habitId,
                habit,
                status: dayData[habitId] ?? dayData[String(habitId)] ?? 0
            };
        })
        .filter(Boolean)
        .sort((a, b) => Number(isNegativeHabitEntry(a.id, a.habit)) - Number(isNegativeHabitEntry(b.id, b.habit)));
}

const getHabitCategoryKey = (habit) => Array.isArray(habit?.category) ? habit.category[0] : (habit?.category || 'Здоровье');

const getHabitCategoryLabel = (habit, langIndex) => {
    if (!habit?.category) return langIndex === 0 ? 'Общее' : 'General';
    if (Array.isArray(habit.category)) return habit.category[langIndex] || habit.category[0];
    return habit.category;
};

const isNegativeHabitEntry = (id, habit) => {
    const habitIndex = AppData.choosenHabits.indexOf(Number(id));
    const categoryKey = getHabitCategoryKey(habit);
    return AppData.choosenHabitsTypes[habitIndex] === true || categoryKey === NEGATIVE_CATEGORY || categoryKey === NEGATIVE_CATEGORY_EN;
};

const getCalendarCategoryTone = (categoryKey, isNegative) => {
    if (isNegative) return { ...NEGATIVE_SUCCESS, icon: 'negative' };
    const tone = getHabitCategoryTone(categoryKey);
    return { ...HABITS_ACCENT, icon: tone.icon };
};

const groupHabitEntriesByCategory = (entries, langIndex) => {
    const groups = [];
    const indexByKey = new Map();

    entries.forEach((entry) => {
        const categoryKey = getHabitCategoryKey(entry.habit);
        const isNegative = isNegativeHabitEntry(entry.id, entry.habit);
        const groupKey = isNegative ? NEGATIVE_CATEGORY : categoryKey;

        if (!indexByKey.has(groupKey)) {
            indexByKey.set(groupKey, groups.length);
            groups.push({
                key: groupKey,
                label: isNegative ? (langIndex === 0 ? NEGATIVE_CATEGORY : NEGATIVE_CATEGORY_EN) : getHabitCategoryLabel(entry.habit, langIndex),
                categoryKey,
                isNegative,
                entries: []
            });
        }

        groups[indexByKey.get(groupKey)].entries.push(entry);
    });

    return groups.sort((a, b) => Number(a.isNegative) - Number(b.isNegative));
};

function getDayProgressStats(dateKey) {
    if (!dateKey) {
        return { hasData: false, total: 0, done: 0, percent: 0 };
    }

    const values = getHabitEntriesForDate(dateKey).map(({ status }) => status);
    const total = values.length;
    const done = values.filter((v) => v > 0).length;
    return {
        hasData: total > 0,
        total,
        done,
        percent: total > 0 ? Math.round((done / total) * 100) : 0
    };
}

// --- СТИЛИ ---
const styles = (theme, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight
        ? `radial-gradient(900px 450px at 80% -10%, rgba(${HABITS_ACCENT.rgb},0.1), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(111,139,214,0.1), transparent 58%), #F4F5F7`
        : `radial-gradient(1000px 500px at 80% -10%, rgba(${HABITS_ACCENT.rgb},0.07), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(138,124,214,0.06), transparent 55%), #0E1013`;
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

    return {
        container: {
            background: bg,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 0 calc(132px + env(safe-area-inset-bottom, 0px))',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch'
        },
        pageHeader: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '0 auto 14px',
            padding: '4px 20px 10px',
            boxSizing: 'border-box',
            textAlign: 'center'
        },
        pageTitle: {
            color: text,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.05,
            opacity: 0.88
        },
        pageSubtitle: {
            marginTop: 5,
            color: sub,
            fontSize: 8.5,
            fontWeight: 600,
            letterSpacing: '0.14em'
        },
        calendarShell: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '0 auto',
            borderRadius: 28,
            padding: '16px 14px 18px',
            boxSizing: 'border-box',
            background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.96), rgba(${HABITS_ACCENT.rgb},0.08))`
                : `radial-gradient(260px 190px at 88% 8%, rgba(${HABITS_ACCENT.rgb},0.13) 0%, transparent 66%), linear-gradient(145deg, rgba(24,28,31,0.9), rgba(20,23,25,0.92))`,
            border: `1px solid ${border}`,
            boxShadow: isLight ? '0 16px 38px -34px rgba(15,23,42,0.28)' : '0 18px 42px -34px rgba(0,0,0,0.75)',
            overflow: 'visible'
        },
        calendarHead: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            boxSizing: 'border-box',
            marginBottom: 14,
            gap: 12
        },
        headerWrapper: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
        },
        header: {
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: fSize === 0 ? 19 : 22,
            margin: 0,
            fontWeight: 700,
            color: text,
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            lineHeight: 1.1
        },
        monthSub: {
            marginTop: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: sub,
            fontSize: 10,
            fontWeight: 850,
            letterSpacing: 0,
            width: '100%',
            maxWidth: 166
        },
        navBtn: {
            width: 40,
            height: 40,
            borderRadius: 15,
            cursor: 'pointer',
            background: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.055)',
            border: `1px solid ${border}`,
            color: text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
            zIndex: 10,
            flexShrink: 0
        },
        tableWrapper: {
            width: '100%',
            padding: '2px 0 8px',
            boxSizing: 'border-box'
        },
        table: {
            width: '100%',
            borderCollapse: 'separate',
            borderSpacing: '0 6px',
            tableLayout: 'fixed',
            textAlign: 'center'
        },
        cell: {
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 45,
            minHeight: 42,
            borderRadius: 15,
            fontSize: fSize === 0 ? 15 : 16,
            fontWeight: 850,
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            margin: 'auto',
            position: 'relative',
            overflow: 'hidden'
        },
        infoPanelContainer: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '14px auto 0',
            borderRadius: 28,
            border: `1px solid ${border}`,
            padding: 14,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'visible',
            background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.94), rgba(${HABITS_ACCENT.rgb},0.06))`
                : 'linear-gradient(145deg, rgba(24,28,31,0.86), rgba(20,23,25,0.92))',
            boxShadow: isLight ? '0 12px 30px -26px rgba(15,23,42,0.24)' : '0 16px 38px -32px rgba(0,0,0,0.72)'
        },
        infoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
        text: { fontSize: fSize === 0 ? '15px' : '17px', color: text },
        subText: { fontSize: fSize === 0 ? '12px' : '14px', color: sub },
        icon: { width: '22px', height: '22px' }
    };
};

const getProgressVisual = (percent, theme, isSelected = false) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    if (percent <= 0) {
        return {
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
            border: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
            shadow: 'none'
        };
    }

    const strength = Math.min(Math.max(percent, 1), 100) / 100;
    const tone = percent >= 100
        ? { rgb: HABITS_SUCCESS.rgb, rim: HABITS_SUCCESS.ring, glow: HABITS_SUCCESS.glow }
        : { rgb: HABITS_ACCENT.rgb, rim: `rgba(${HABITS_ACCENT.rgb},0.34)`, glow: HABITS_ACCENT.glow };
    const alpha = isLight ? 0.08 + strength * 0.24 : 0.09 + strength * 0.22;
    const secondAlpha = isLight ? 0.04 + strength * 0.11 : 0.045 + strength * 0.1;
    return {
        background: `linear-gradient(145deg, rgba(${tone.rgb},${alpha}), rgba(${tone.rgb},${secondAlpha}))`,
        border: isSelected ? tone.rim : tone.rim.replace(/0\.\d+\)/, isLight ? '0.26)' : '0.24)'),
        shadow: isSelected ? `0 0 24px ${tone.glow}` : 'none'
    };
};

const getProgressTextColor = (percent, theme) => {
     return Colors.get('mainText', theme);; 
}

const monthStatChip = (theme, tone) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    return {
        minWidth: 0,
        minHeight: 26,
        borderRadius: 999,
        padding: '0 7px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        flex: '0 0 auto',
        whiteSpace: 'nowrap',
        color: Colors.get('mainText', theme),
        background: tone === 'accent'
            ? HABITS_ACCENT.soft
            : tone === 'done'
                ? 'rgba(120,184,121,0.12)'
                : (isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)'),
        border: `1px solid ${tone === 'accent'
            ? HABITS_ACCENT.ring
            : tone === 'done'
                ? 'rgba(120,184,121,0.22)'
                : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)')}`,
        boxSizing: 'border-box'
    };
};

const monthStatDot = (tone) => ({
    width: 5,
    height: 5,
    borderRadius: 99,
    background: tone === 'done' ? '#78B879' : tone === 'accent' ? HABITS_ACCENT.hue : 'rgba(166,173,184,0.72)',
    flexShrink: 0
});

const monthStatValue = {
    fontSize: 10.5,
    fontWeight: 950,
    lineHeight: 1
};

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
    const s = styles(theme, fSize);
    const isLight = theme === 'light' || theme === 'speciallight';
    const monthStats = Array.from({ length: daysInMonth }, (_, index) => {
        const key = formatDateKey(new Date(date.getFullYear(), date.getMonth(), index + 1));
        return getDayProgressStats(key);
    });
    const daysWithData = monthStats.filter((item) => item.hasData).length;
    const completedDays = monthStats.filter((item) => item.hasData && item.percent === 100).length;
    const avgMonthPercent = daysWithData
        ? Math.round(monthStats.filter((item) => item.hasData).reduce((sum, item) => sum + item.percent, 0) / daysWithData)
        : 0;

    const onHabitClick = (habitId) => {
        playEffects(clickSound);
        if(setExpandedCard) setExpandedCard(habitId);
        if(setPage) setPage('HabitsMain');
    };

    return (
        <div style={s.container}>
            <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32 }}
                style={s.pageHeader}
            >
                <div style={s.pageTitle}>UltyMyLife</div>
                <div style={s.pageSubtitle}>
                    {langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}
                </div>
            </motion.div>
          
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34 }}
                style={s.calendarShell}
            >
            <div style={s.calendarHead}>
              <motion.div whileTap={{scale: 0.92}} onClick={prevMonth} style={s.navBtn}>
                 <IoIosArrowBack size={22}/>
              </motion.div>
              
              <div style={s.headerWrapper}>
                 
                    <motion.h1 
                        key={date.toISOString()}
                        variants={textVariants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.25 }}
                        style={s.header}
                    >
                        {monthNames[langIndex][date.getMonth()]} {date.getFullYear()}
                    </motion.h1>
                    <div style={s.monthSub}>
                        <span style={monthStatChip(theme, 'neutral')}>
                            <span style={monthStatDot('neutral')} />
                            <span style={monthStatValue}>{daysWithData}{langIndex === 0 ? ' дн' : 'd'}</span>
                        </span>
                        <span style={monthStatChip(theme, 'accent')}>
                            <span style={monthStatDot('accent')} />
                            <span style={monthStatValue}>{avgMonthPercent}%</span>
                        </span>
                        <span style={monthStatChip(theme, 'done')}>
                            <span style={monthStatDot('done')} />
                            <span style={monthStatValue}>{completedDays}✓</span>
                        </span>
                    </div>
           
              </div>

              <motion.div whileTap={{scale: 0.92}} onClick={nextMonth} style={s.navBtn}>
                 <IoIosArrowForward size={22}/>
              </motion.div>
            </div>

            {/* Calendar Table with Sliding Animation */}
            <div style={s.tableWrapper}>
                
                  
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    {daysOfWeek[langIndex].map((day, index) => (
                                        <th key={day} style={{paddingBottom:'15px'}}>
                                            <p style={{
                                                textAlign:'center', 
                                                fontSize: fSize === 0 ? '13px' : '14px', 
                                                fontWeight: '900',
                                                color: (index === 5 || index === 6) ? '#D8785E' : Colors.get('subText', theme),
                                                margin: 0, 
                                                opacity: 0.86,
                                                letterSpacing: '0.02em'
                                            }}>
                                                {day}
                                            </p>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {weeks.map((week, i) => (
                                    <tr key={i}>
                                        {week.map((day, j) => {
                                            const cellMonth = date.getMonth();
                                            const cellYear = date.getFullYear();
                                            const isChoosen = Boolean(day) && day === currentDate.getDate() && cellMonth === currentDate.getMonth() && cellYear === currentDate.getFullYear();
                                            const isToday = Boolean(day) && today === day && curMonth === cellMonth && new Date().getFullYear() === cellYear;
                                            const dayKey = day ? formatDateKey(new Date(cellYear, cellMonth, day)) : null;
                                            const progressStats = getDayProgressStats(dayKey);
                                            const percentNum = progressStats.percent;
                                            const percent = progressStats.hasData ? `${percentNum}%` : '';

                                            let cellBg = 'transparent';
                                            let cellColor = Colors.get('mainText', theme);
                                            let cellBorder = '1px solid transparent';
                                            let cellShadow = 'none';
                                            const progressVisual = progressStats.hasData
                                                ? getProgressVisual(percentNum, theme, isChoosen)
                                                : null;

                                            if (isChoosen) {
                                                cellBg = progressVisual?.background || `linear-gradient(145deg, rgba(${HABITS_ACCENT.rgb},0.38), rgba(143,166,200,0.18))`;
                                                cellColor = isLight ? '#101418' : '#FFFFFF';
                                                cellBorder = `1px solid ${progressVisual?.border || HABITS_ACCENT.ring}`;
                                                cellShadow = progressVisual?.shadow || `0 0 24px ${HABITS_ACCENT.glow}`;
                                            } else if (day > 0) {
                                                if (progressStats.hasData) {
                                                    cellBg = progressVisual.background;
                                                    cellColor = getProgressTextColor(percentNum, theme);
                                                    cellBorder = `1px solid ${progressVisual.border}`;
                                                }
                                            }
                                            if (isToday && !isChoosen) {
                                                cellBorder = `1px solid ${HABITS_ACCENT.ring}`;
                                            }
                                            
                                            return (
                                                <td key={j} style={{padding: '3px 3px', height: 48, boxSizing: 'border-box'}}>
                                                    {day ? (
                                                        <motion.div 
                                                            whileTap={{ scale: 0.94 }}
                                                            style={{
                                                                ...s.cell,
                                                                background: cellBg, 
                                                                color: cellColor,
                                                                border: cellBorder,
                                                                boxShadow: cellShadow,
                                                            }} 
                                                            onClick={() => {
                                                                const selectedDate = new Date(cellYear, cellMonth, day);
                                                                setCurrentDate(selectedDate);
                                                                setInfoPanelData(getHabitEntriesForDate(selectedDate).length > 0);
                                                                playEffects(clickSound);
                                                            }}   
                                                        >
                                                            {day}
                                                            {day > 0 && percent && (
                                                                <div style={{ 
                                                                    fontSize: '8px', 
                                                                    marginTop: '3px', 
                                                                    opacity: isChoosen ? 0.86 : 0.75, 
                                                                    fontWeight: '900',
                                                                    lineHeight: 1
                                                                }}>
                                                                    {percent}
                                                                </div>
                                                            )}
                                                            {isToday && (
                                                                <span style={{
                                                                    position: 'absolute',
                                                                    top: 5,
                                                                    right: 6,
                                                                    width: 4,
                                                                    height: 4,
                                                                    borderRadius: 99,
                                                                    background: HABITS_ACCENT.hue,
                                                                    opacity: 0.9
                                                                }} />
                                                            )}
                                                        </motion.div>
                                                    ) : (
                                                        <div style={{...s.cell, pointerEvents: 'none'}}></div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                   
            </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.34, delay: 0.05 }}
                style={s.infoPanelContainer}
            >
                {inFoPanelData ? (
                    <div style={{width: '100%', display:'flex', flexDirection:'column', minWidth: 0}}>
                        <div style={s.infoHeader}>
                            <div style={{minWidth: 0}}>
                            <h2 style={{
                                fontSize: fSize === 0 ? 17 : 19, 
                                fontWeight: 950, 
                                color: Colors.get('mainText', theme),
                                lineHeight: 1.15,
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>
                                {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]}, {fullNames[langIndex][getMondayIndex(currentDate)]}
                            </h2>
                            <div style={{ color: Colors.get('subText', theme), fontSize: 12, fontWeight: 800, marginTop: 5 }}>
                                {habitAmountString(currentDate, langIndex)}
                            </div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                            <Habit 
                                theme={theme} 
                                langIndex={langIndex} 
                                date={currentDate} 
                                fSize={fSize} 
                                onHabitClick={onHabitClick}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{
                        display:'flex', 
                        minHeight: 42, 
                        alignItems:'center', 
                        justifyContent:'center', 
                        flexDirection: 'row',
                        gap: 10
                    }}>
                        <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 12,
                            background: HABITS_ACCENT.soft,
                            border: `1px solid ${HABITS_ACCENT.ring}`,
                            color: HABITS_ACCENT.hue,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <HabitOutlineIcon iconName="calendarCheck" size={18} />
                        </div>
                        <p style={{
                            color: Colors.get('subText', theme), 
                            margin: 0, 
                            fontSize: '13px',
                            fontWeight: 850,
                            lineHeight: 1.2
                        }}>
                            {currentDate.getDate()} {monthNames[langIndex][currentDate.getMonth()]} · {langIndex === 0 ? "нет привычек" : "no habits"}
                        </p>
                    </div>
                )}
            </motion.div>
            
            <div style={{height: 12, flexShrink: 0}}></div>
        </div>
    );
};

export default HabitCalendar

const Habit = ({theme, langIndex, date, fSize, onHabitClick}) => {
    const dateKey = formatDateKey(date);
    const habits = getHabitEntriesForDate(date);
    if (habits.length === 0) return null;
    return groupHabitEntriesByCategory(habits, langIndex).map((group) => (
        <CalendarCategoryGroup
            key={`${dateKey}-${group.key}`}
            group={group}
            theme={theme}
            langIndex={langIndex}
            date={date}
            fSize={fSize}
            onHabitClick={onHabitClick}
        />
    ));
}

const CalendarCategoryGroup = ({ group, theme, langIndex, date, fSize, onHabitClick }) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const dateKey = formatDateKey(date);
    const tone = getCalendarCategoryTone(group.categoryKey, group.isNegative);
    const doneCount = group.entries.filter(({ status }) => status > 0).length;
    const sub = Colors.get('subText', theme);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            paddingTop: 2,
            marginTop: group.isNegative ? 6 : 0
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                minHeight: 28,
                padding: '0 4px',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <span style={{
                        width: 22,
                        height: 22,
                        borderRadius: 8,
                        background: tone.soft,
                        border: `1px solid ${tone.ring}`,
                        color: tone.hue,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <HabitOutlineIcon iconName={tone.icon} categoryKey={group.categoryKey} size={13} />
                    </span>
                    <span style={{
                        color: tone.hue,
                        fontSize: 10,
                        fontWeight: 950,
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {group.label}
                    </span>
                </div>
                <span style={{
                    color: doneCount === group.entries.length ? tone.hue : sub,
                    background: doneCount === group.entries.length ? tone.soft : (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)'),
                    border: `1px solid ${doneCount === group.entries.length ? tone.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)')}`,
                    borderRadius: 999,
                    padding: '4px 8px',
                    fontSize: 11,
                    fontWeight: 900,
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0
                }}>
                    {doneCount}/{group.entries.length}
                </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {group.entries.map(({ id, habit, status }) => (
                    <HabitRow
                        key={`${dateKey}-${id}`}
                        id={id}
                        habitData={habit}
                        theme={theme}
                        date={date}
                        statusInit={status < 2 ? status : 1}
                        langIndex={langIndex}
                        fSize={fSize}
                        onHabitClick={onHabitClick}
                    />
                ))}
            </div>
        </div>
    );
};

const HabitRow = ({ id, habitData, theme, date, statusInit, langIndex, fSize, onHabitClick }) => {
    const name = habitData.name[langIndex];
    const isLight = theme === 'light' || theme === 'speciallight';
    const categoryKey = Array.isArray(habitData.category) ? habitData.category[0] : (habitData.category || 'Здоровье');
    const tone = getHabitCategoryTone(categoryKey);
    let category = "";
    if (habitData.category) {
        if (Array.isArray(habitData.category)) category = habitData.category[langIndex];
        else category = habitData.category;
    } else category = langIndex === 0 ? "Общее" : "General";

    const isNegative = AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(id)];
    const [status, setStatus] = useState(statusInit);
    const [canDrag, setCanDrag] = useState(true);
    const [showResetPanel, setShowResetPanel] = useState(false);
    const didDragAction = useRef(false);
    const dragHandled = useRef(false);
    const dateKey = formatDateKey(date);
    const savedEventTime = AppData.getHabitEventTimestamp(dateKey, id);
    const [eventTime, setEventTime] = useState(() => formatTimeInput(savedEventTime, date));
    const maxX = 70; const minX = -70;
    const x = useMotionValue(0);
    const constrainedX = useTransform(x, [-1, 1], [minX, maxX]);
    
    useEffect(() => {
        setStatus(statusInit);
        setEventTime(formatTimeInput(AppData.getHabitEventTimestamp(formatDateKey(date), id), date));
    }, [statusInit, date, id]);

    const saveNegativeReset = async () => {
        const dayKey = formatDateKey(date);
        await AppData.changeStatus(dayKey, id, -1, buildTimestampFromTime(date, eventTime));
        setStatus(-1);
        setShowResetPanel(false);
        emitHabitsChanged();
        if (AppData.prefs[2] == 0) playEffects(skipSound);
    };

    const saveCleanDay = async () => {
        const dayKey = formatDateKey(date);
        await AppData.changeStatus(dayKey, id, 1);
        setStatus(1);
        setShowResetPanel(false);
        emitHabitsChanged();
        if (AppData.prefs[2] == 0) playEffects(isDoneSound);
    };

    const onDrag = (event, info) => {
        const dx = info.offset.x;
        if (Math.abs(dx) > maxX) {
            if (!canDrag || dragHandled.current) return;
            dragHandled.current = true;
            didDragAction.current = true;
            if (isNegative) {
                if (dx < 0) setShowResetPanel(true);
                else saveCleanDay();
                setCanDrag(false);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                return;
            }
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

    const onDragEnd = () => {
        dragHandled.current = false;
        animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        setCanDrag(true);
    };

    let cardBg = isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.92), ${tone.hue}0f)`
        : `radial-gradient(180px 110px at 4% 10%, ${tone.soft}, transparent 72%), rgba(24,28,31,0.82)`;
    let cardBorder = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
    let textColor = Colors.get('mainText', theme);
    let subTextColor = Colors.get('subText', theme);
    let checkBg = isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.05)';
    let checkColor = Colors.get('subText', theme);
    const categoryTone = isNegative ? NEGATIVE_SUCCESS : tone;
    let iconColor = categoryTone.hue;
    let iconBg = categoryTone.soft;
    let iconBorder = categoryTone.ring;
    let categoryTextColor = categoryTone.hue;
    let statusHint = '';

    if (status === 1) {
        const doneTone = isNegative ? NEGATIVE_SUCCESS : HABITS_SUCCESS;
        cardBg = isLight
            ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${doneTone.soft})`
            : `radial-gradient(180px 110px at 4% 10%, ${doneTone.soft}, transparent 72%), ${isNegative ? 'rgba(30,24,22,0.92)' : 'rgba(22,30,26,0.9)'}`;
        cardBorder = doneTone.ring;
        checkBg = doneTone.soft;
        checkColor = doneTone.hue;
        iconColor = doneTone.hue;
        iconBg = doneTone.soft;
        iconBorder = doneTone.ring;
        categoryTextColor = doneTone.hue;
        statusHint = isNegative ? (langIndex === 0 ? 'Без срыва' : 'No reset') : (langIndex === 0 ? 'Выполнено' : 'Done');
    } else if (status === -1) {
        cardBg = isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(216,120,94,0.12))'
            : 'radial-gradient(180px 110px at 4% 10%, rgba(216,120,94,0.15), transparent 72%), rgba(30,22,22,0.9)';
        cardBorder = 'rgba(216,120,94,0.24)';
        checkBg = 'rgba(216,120,94,0.2)';
        checkColor = '#D8785E';
        iconColor = '#D8785E';
        iconBg = 'rgba(216,120,94,0.16)';
        iconBorder = 'rgba(216,120,94,0.28)';
        categoryTextColor = '#D8785E';
        statusHint = isNegative ? `${langIndex === 0 ? 'Срыв' : 'Reset'} · ${eventTime}` : (langIndex === 0 ? 'Пропуск' : 'Skipped');
    }

    return (
        <div style={{width:'100%', maxWidth: '100%', overflow: 'hidden', borderRadius: 20, boxSizing: 'border-box', touchAction: 'pan-y'}}>
            <motion.div
                id={`cal-${id}`}
                style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    display:'flex',
                    flexDirection:'row',
                    width:'100%',
                    padding: '12px 12px',
                    alignItems:'center',
                    borderRadius: 20,
                    boxSizing: 'border-box',
                    minWidth: 0,
                    x: constrainedX,
                    cursor: 'pointer',
                    position: 'relative',
                    touchAction: 'pan-y',
                    boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.04) inset'
                }}
                drag={canDrag ? 'x' : false} dragConstraints={{ left: minX, right: status === 1 ? 0 : maxX }} dragElastic={0.1} onDrag={onDrag} onDragEnd={onDragEnd}
                onClick={() => {
                    if (didDragAction.current) {
                        didDragAction.current = false;
                        return;
                    }
                    if (isNegative) setShowResetPanel(true);
                    else onHabitClick?.(id);
                }}
            >
                <div style={{
                    position: 'absolute',
                    left: 0,
                    top: 14,
                    bottom: 14,
                    width: 3,
                    borderRadius: '0 999px 999px 0',
                    background: categoryTextColor,
                    opacity: status === 0 ? 0.58 : 0.95
                }} />
                <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    marginRight: 11,
                    color: iconColor,
                    background: iconBg,
                    border: `1px solid ${iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                }}>
                    <HabitOutlineIcon iconName={habitData.iconName} habitName={habitData.name} categoryKey={categoryKey} size={20} />
                </div>
                <div style={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'}}>
                    <span style={{ color: categoryTextColor, fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.08em', pointerEvents: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category}</span>
                    <p style={{ color: textColor, margin: 0, fontWeight: 900, fontSize: fSize === 0 ? '15px' : '17px', pointerEvents: 'none', lineHeight: 1.18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                    {statusHint && (
                        <span style={{ color: status === 0 ? subTextColor : categoryTextColor, fontSize: '11px', marginTop: '5px', fontWeight: '850', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {statusHint}
                        </span>
                    )}
                </div>
                <div style={{
                    width: 30,
                    height: 30,
                    borderRadius: 11,
                    background: status !== 0 ? checkBg : 'transparent',
                    border: status === 0 ? `1px solid ${isLight ? 'rgba(15,23,42,0.14)' : 'rgba(255,255,255,0.12)'}` : `1px solid ${status === 1 ? (isNegative ? NEGATIVE_SUCCESS.ring : HABITS_SUCCESS.ring) : 'rgba(216,120,94,0.3)'}`,
                    color: checkColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '8px',
                    flexShrink: 0
                }}>
                    {status === 1 && <Check style={{fontSize: '18px'}}/>}
                    {status === -1 && <Close style={{fontSize: '18px'}}/>}
                </div>
            </motion.div>
            <AnimatePresence>
                {showResetPanel && (
                    <NegativeHabitResetPanel
                        theme={theme}
                        langIndex={langIndex}
                        time={eventTime}
                        onTimeChange={setEventTime}
                        onClose={() => setShowResetPanel(false)}
                        onReset={saveNegativeReset}
                        onClean={saveCleanDay}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const NegativeHabitResetPanel = ({ theme, langIndex, time, onTimeChange, onClose, onReset, onClean }) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight ? '#FFFFFF' : Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0,0,0,0.55)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 5000
                }}
            />
            <motion.div
                initial={{ y: 35, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 35, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 260 }}
                style={{
                    position: 'fixed',
                    left: '4%',
                    right: '4%',
                    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
                    maxWidth: '520px',
                    margin: '0 auto',
                    borderRadius: '24px',
                    padding: '18px',
                    backgroundColor: bg,
                    border: isLight ? '1px solid rgba(0,0,0,0.06)' : `1px solid ${Colors.get('border', theme)}80`,
                    boxShadow: isLight ? '0 24px 70px rgba(0,0,0,0.18)' : '0 28px 80px rgba(0,0,0,0.72)',
                    zIndex: 5001
                }}
            >
                <div style={{ color: text, fontSize: '18px', fontWeight: 900, marginBottom: '6px' }}>
                    {langIndex === 0 ? 'Записать срыв' : 'Record reset'}
                </div>
                <div style={{ color: sub, fontSize: '13px', fontWeight: 650, marginBottom: '16px' }}>
                    {langIndex === 0 ? 'Выберите точное время для выбранной даты.' : 'Choose the exact time for the selected date.'}
                </div>
                <input
                    type="time"
                    value={time}
                    onChange={(e) => onTimeChange(e.target.value)}
                    style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        border: `1px solid ${Colors.get('border', theme)}88`,
                        borderRadius: '16px',
                        padding: '13px 14px',
                        backgroundColor: isLight ? '#F7F7F8' : 'rgba(255,255,255,0.05)',
                        color: text,
                        fontSize: '18px',
                        fontWeight: 800,
                        outline: 'none',
                        marginBottom: '14px'
                    }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onClean} style={calendarActionButton('#32D74B')}>
                        <MdDoneAll size={18} /> {langIndex === 0 ? 'Чистый день' : 'Clean day'}
                    </motion.button>
                    <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={onReset} style={calendarActionButton('#FF453A')}>
                        <Close style={{ fontSize: '18px' }} /> {langIndex === 0 ? 'Срыв' : 'Reset'}
                    </motion.button>
                </div>
            </motion.div>
        </>
    );
};

const calendarActionButton = (color) => ({
    minHeight: '48px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: color,
    color: '#FFF',
    fontSize: '13px',
    fontWeight: 850,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '7px',
    cursor: 'pointer'
});

function habitAmountString(date,langIndex) {
   const names = [['привычка','привычки','привычек'],['habit','habits','habits']];
   const amount = getHabitEntriesForDate(date).length;
   return amount + ' ' + names[langIndex][amount === 1 ? 0 : amount > 1 && amount < 5 ? 1 : 2];
}
