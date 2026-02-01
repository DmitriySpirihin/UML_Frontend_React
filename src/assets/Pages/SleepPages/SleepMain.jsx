import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, addNewTrainingDay$ } from '../../StaticClasses/HabitsBus';
import { FaChevronLeft, FaChevronRight, FaMoon, FaBed, FaRegClock, FaStickyNote, FaStar } from 'react-icons/fa';
import SleepNew from './SleepNew.jsx';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';

// --- HELPERS ---
const getMondayIndex = (d) => (d.getDay() + 6) % 7;

const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const clickSound = new Audio('Audio/Click.wav');

// Mood color palette
const moodColors = (theme, index) => {
  const cols = [
    Colors.get('veryBad', theme),
    Colors.get('bad', theme),
    Colors.get('normal', theme), 
    Colors.get('good', theme), 
    Colors.get('perfect', theme),
  ];
  return cols[index] || Colors.get('accent', theme);
};

const formatMsToHhMm = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '--:--';
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Calculate height of the bar inside the cell based on sleep duration (4h to 12h range)
const getFillPercentFromMs = (durationMs) => {
  if (typeof durationMs !== 'number' || durationMs < 0) return 0;
  const msPerHour = 60 * 60 * 1000;
  const minHours = 4;
  const maxHours = 10; // Adjusted for visual balance
  const minMs = minHours * msPerHour;
  const maxMs = maxHours * msPerHour;

  if (durationMs <= minMs) return 15; // Minimum visible bar
  if (durationMs >= maxMs) return 100;

  const rangeMs = maxMs - minMs;
  const progress = (durationMs - minMs) / rangeMs;
  // Map 0-1 to 15-100 to ensure visibility
  return 15 + Math.round(progress * 85);
};

function playEffects(sound) {
  if (AppData.prefs[2] === 0 && sound) {
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
    Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

const SleepMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [date, setDate] = useState(new Date()); // Calendar view date
  const [currentDate, setCurrentDate] = useState(new Date()); // Selected date
  const currentDateRef = useRef(currentDate);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [selectedSleepEntry, setSelectedSleepEntry] = useState(null);
  const today = new Date().getDate(); 
    const curMonth = new Date().getMonth();
  // Subscriptions
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);

  useEffect(() => {
    currentDateRef.current = currentDate;
    // Auto-select entry when mounting or changing date programmatically
    const key = formatDateKey(currentDate);
    const entry = AppData.sleepingLog?.[key];
    setSelectedSleepEntry(entry || null);
  }, [currentDate]);

  // Calendar Calculation logic
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0

  const daysOfWeek = [
    ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  ];
  
  const fullNames = [
    ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  ];

  const calendarCells = Array(firstDayOfWeek).fill(null);
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push(i);
  }

  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1));
    playEffects(clickSound);
  };
  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1));
    playEffects(clickSound);
  };

  const cellMonth = date.getMonth();
  const cellYear = date.getFullYear();

  return (
    <div style={styles(theme, fSize).container}>
      {<HoverInfoButton tab='SleepMain'/>}
      {/* --- Calendar Header --- */}
      <div style={styles(theme).headerContainer}>
        <motion.button whileTap={{scale:0.9}} onClick={prevMonth} style={styles(theme).navBtn}>
           <FaChevronLeft />
        </motion.button>
        
        <div style={styles(theme, fSize).monthTitle}>
           {date.toLocaleString(langIndex === 0 ? 'ru' : 'en', { month: 'long' })} 
           <span style={{opacity: 0.5, marginLeft: '6px'}}>{date.getFullYear()}</span>
        </div>

        <motion.button whileTap={{scale:0.9}} onClick={nextMonth} style={styles(theme).navBtn}>
           <FaChevronRight />
        </motion.button>
      </div>

      {/* --- Calendar Grid --- */}
      <div style={styles(theme).gridWrapper}>
        {/* Weekday Labels */}
        <div style={styles(theme).weekRow}>
            {daysOfWeek[langIndex].map((day, i) => (
                <div key={i} style={{
                    ...styles(theme).weekDay, 
                    color: (i === 6 || i === 5) ? Colors.get('skipped', theme) : Colors.get('subText', theme)
                }}>
                    {day}
                </div>
            ))}
        </div>

        {/* Days */}
        <div style={styles(theme).daysGrid}>
            {calendarCells.map((day, index) => {
                if (day === null) return <div key={`empty-${index}`} />;

                const cellDate = new Date(cellYear, cellMonth, day);
                const dayKey = formatDateKey(cellDate);
                const entry = AppData.sleepingLog?.[dayKey];
                
                const isSelected = 
                    day === currentDate.getDate() && 
                    cellMonth === currentDate.getMonth() && 
                    cellYear === currentDate.getFullYear();

                const isToday = 
                    day === new Date().getDate() && 
                    cellMonth === new Date().getMonth() && 
                    cellYear === new Date().getFullYear();

                // Logic for cell styling
                const hasData = !!entry;
                const moodColor = hasData ? moodColors(theme, entry.mood - 1) : 'transparent';
                const fillHeight = hasData ? getFillPercentFromMs(entry.duration) : 0;

                return (
                    <motion.div 
                        key={day}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setCurrentDate(new Date(cellYear, cellMonth, day));
                            playEffects(clickSound);
                            setSelectedSleepEntry(entry || null);
                        }}
                        style={{...styles(theme).dayCell(isSelected, isToday), border: today === day && curMonth === cellMonth ? `2px solid ${Colors.get('currentDateBorder', theme)}` : 'transparent',}}
                    >
                        {/* Background Fill (Data Visualization) */}
                        {hasData && (
                            <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: `${fillHeight}%` }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                style={{
                                    position: 'absolute',
                                    bottom: 0, left: 0, right: 0,
                                    backgroundColor: moodColor,
                                    opacity: isSelected ? 0.4 : 0.25,
                                    zIndex: 0,
                                }}
                            />
                        )}

                        {/* Top Indicator Line (If selected) */}
                        {isSelected && (
                            <motion.div layoutId="selInd" style={{
                                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                                backgroundColor: hasData ? moodColor : Colors.get('mainText', theme),
                                boxShadow: `0 2px 8px ${hasData ? moodColor : Colors.get('mainText', theme)}`
                            }} />
                        )}

                        <span style={{ zIndex: 1, position: 'relative' }}>{day}</span>
                    </motion.div>
                );
            })}
        </div>
      </div>

      {/* --- Selected Date Info --- */}
      <div style={styles(theme).detailsContainer}>
         <div style={styles(theme).dateLabel}>
            {currentDate.getDate()} {fullNames[langIndex][getMondayIndex(currentDate)]}
         </div>

         <AnimatePresence mode='wait'>
            {selectedSleepEntry ? (
                <motion.div 
                    key="entry"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    style={styles(theme).card}
                >
                    {/* Glow effect based on mood */}
                    <div style={styles(theme).cardGlow(moodColors(theme, selectedSleepEntry.mood - 1))} />
                    
                    <div style={{position: 'relative', zIndex: 2}}>
                        {/* Metrics Row */}
                        <div style={styles(theme).metricsGrid}>
                            <MetricItem 
                                icon={<FaMoon />} 
                                label={langIndex === 0 ? 'Отбой' : 'Bedtime'} 
                                value={formatMsToHhMm(selectedSleepEntry.bedtime)} 
                                theme={theme}
                                color={Colors.get('accent', theme)}
                            />
                             <MetricItem 
                                icon={<FaRegClock />} 
                                label={langIndex === 0 ? 'Длительность' : 'Duration'} 
                                value={formatMsToHhMm(selectedSleepEntry.duration)} 
                                theme={theme}
                                color={moodColors(theme, selectedSleepEntry.mood - 1)}
                            />
                             <div style={styles(theme).metricBox}>
                                <div style={{...styles(theme).iconBox, color: Colors.get('difficulty3', theme)}}>
                                    <FaStar />
                                </div>
                                <div style={styles(theme).metricLabel}>{langIndex === 0 ? 'Настроение' : 'Mood'}</div>
                                <div style={{display:'flex', gap:'2px', marginTop:'4px'}}>
                                    {[1,2,3,4,5].map(star => (
                                        <FaStar 
                                            key={star} 
                                            size={10} 
                                            color={star <= selectedSleepEntry.mood ? Colors.get('difficulty3', theme) : Colors.get('subText', theme)} 
                                            style={{opacity: star <= selectedSleepEntry.mood ? 1 : 0.2}}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Note Section */}
                        {selectedSleepEntry.note && (
                            <div style={styles(theme).noteBox}>
                                <FaStickyNote size={14} style={{ minWidth: '16px', marginTop:'2px', opacity: 0.7 }} />
                                <span style={{ fontSize: '13px', fontStyle: 'italic', opacity: 0.9 }}>
             {selectedSleepEntry.note.split('\n').map((line, i) => (
               <React.Fragment key={i}>
              {line}
                  <br />
                  </React.Fragment>
                  ))}
                  </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles(theme).emptyState}
                >
                    <FaBed size={32} color={Colors.get('subText', theme)} style={{opacity: 0.3, marginBottom: '10px'}} />
                    <span>{langIndex === 0 ? 'Нет данных о сне' : 'No sleep data'}</span>
                </motion.div>
            )}
         </AnimatePresence>
        
      </div>
     <SleepNew dateString={formatDateKey(currentDate)} />
      <div style={{marginBottom:'150px'}}></div>
    </div>
  );
};

// Sub-component for clean layout
const MetricItem = ({ icon, label, value, theme, color }) => (
    <div style={styles(theme).metricBox}>
        <div style={{...styles(theme).iconBox, color: color}}>
            {icon}
        </div>
        <div style={styles(theme).metricLabel}>{label}</div>
        <div style={styles(theme).metricValue}>{value}</div>
    </div>
);

export default SleepMain;

const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '85vh', // Increased height usage
    paddingTop: '80px', // Space for app header
    marginTop:'70px',
    width: '100vw',
    fontFamily: 'Segoe UI, sans-serif',
    overflowY: 'scroll'
  },
  
  // Header
  headerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginBottom: '20px'
  },
  navBtn: {
    background: 'transparent',
    border: 'none',
    color: Colors.get('mainText', theme),
    fontSize: '20px',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  monthTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: Colors.get('mainText', theme),
    textTransform: 'capitalize'
  },

  // Grid
  gridWrapper: {
    width: '94%',
    padding: '0 10px'
  },
  weekRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    marginBottom: '10px',
    textAlign: 'center'
  },
  weekDay: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  daysGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '6px', // Gap between cells
    width: '100%'
  },
  dayCell: (isSelected, isToday) => ({
    aspectRatio: '1/1', // Perfect square
    borderRadius: '12px',
    backgroundColor: isSelected ? Colors.get('simplePanel', theme) : 'transparent',
    border: isToday 
        ? `1px solid ${Colors.get('accent', theme)}` 
        : `1px solid ${Colors.get('border', theme)}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: isSelected || isToday ? '700' : '500',
    color: Colors.get('mainText', theme),
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
  }),

  // Details
  detailsContainer: {
    width: '90%',
    marginTop: '55px',
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  dateLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: Colors.get('subText', theme),
    paddingLeft: '4px'
  },
  card: {
    position: 'relative',
    backgroundColor: Colors.get('simplePanel', theme),
    borderRadius: '24px',
    padding: '20px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    border: `1px solid ${Colors.get('border', theme)}50`,
    overflow: 'hidden'
  },
  cardGlow: (color) => ({
    position: 'absolute',
    top: '-50%',
    right: '-50%',
    width: '200px',
    height: '200px',
    background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
    filter: 'blur(30px)',
    pointerEvents: 'none'
  }),
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '10px',
    marginBottom: '15px'
  },
  metricBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
    borderRadius: '16px',
    padding: '12px 5px'
  },
  iconBox: {
    fontSize: '18px',
    marginBottom: '6px'
  },
  metricLabel: {
    fontSize: '10px',
    textTransform: 'uppercase',
    color: Colors.get('subText', theme),
    marginBottom: '2px'
  },
  metricValue: {
    fontSize: '14px',
    fontWeight: '700',
    color: Colors.get('mainText', theme)
  },
  noteBox: {
    display: 'flex',
    gap: '10px',
    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    padding: '12px',
    borderRadius: '12px',
    color: Colors.get('mainText', theme),
    lineHeight: '1.4'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '30px',
    backgroundColor: Colors.get('simplePanel', theme),
    borderRadius: '24px',
    border: `1px dashed ${Colors.get('border', theme)}`,
    color: Colors.get('subText', theme),
    fontSize: '14px'
  }
});
