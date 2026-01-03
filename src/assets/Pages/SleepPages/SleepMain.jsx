import React, { useState, useEffect, useRef } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, addNewTrainingDay$ } from '../../StaticClasses/HabitsBus';
import SleepNew from './SleepNew.jsx';
import SleepInsight from './SleepInsight.jsx';

// Helper: Monday-based weekday index (Mon=0, ..., Sun=6)
const getMondayIndex = (d) => (d.getDay() + 6) % 7;

const formatDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const clickSound = new Audio('Audio/Click.wav');

// Mood color palette (index 0 = mood 1, ..., index 4 = mood 5)
const moodColors = (theme, index) => {
  const cols = [
    Colors.get('difficulty3', theme), // mood 1 → worst
    Colors.get('difficulty2', theme),
    Colors.get('difficulty1', theme),
    Colors.get('difficulty0', theme),
    Colors.get('difficulty5', theme), // mood 5 → best
  ];
  return cols[index] || Colors.get('background', theme);
};

const formatMsToHhMm = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '--:--';
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
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
const getFillPercentFromMs = (durationMs) => {
  if (typeof durationMs !== 'number' || durationMs < 0) return 0;

  const msPerHour = 60 * 60 * 1000;
  const minHours = 4;
  const maxHours = 12;
  const minMs = minHours * msPerHour; // 4h = 14,400,000 ms
  const maxMs = maxHours * msPerHour; // 12h = 43,200,000 ms

  if (durationMs <= minMs) return 0;
  if (durationMs >= maxMs) return 100;

  const rangeMs = maxMs - minMs;
  const progress = (durationMs - minMs) / rangeMs;
  return Math.round(progress * 100);
};

const SleepMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [date, setDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentDateRef = useRef(currentDate);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [selectedSleepEntry, setSelectedSleepEntry] = useState(null);

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

  // Keep ref in sync
  useEffect(() => {
    currentDateRef.current = currentDate;
  }, [currentDate]);

  // Training day panel logic (kept as-is)
  useEffect(() => {
    const subscription = addNewTrainingDay$.subscribe(() => {
      const today = new Date();
      const current = currentDateRef.current;
      if (current > today) return;

      const currentDateKey = formatDateKey(current);
      const todayKey = formatDateKey(today);

      if (currentDateKey === todayKey) {
        // setShowNewSessionPanel(true); // assuming this is handled elsewhere
      } else {
        // setShowPreviousSessionPanel(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Calendar setup
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

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

  const weeks = [];
  for (let i = 0; i < calendarCells.length; i += 7) {
    weeks.push(calendarCells.slice(i, i + 7));
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
      <div style={styles(theme, fSize).panel}>
        <div style={styles(theme, fSize).calendarHead}>
          <h1 style={styles(theme, fSize).header}>
            {date.getFullYear()}/
            {String(date.getMonth() + 1).padStart(2, '0')}
          </h1>
          <div onClick={prevMonth} style={{ cursor: 'pointer' }}>
            <h1 style={styles(theme, fSize).header}>{'<'}</h1>
          </div>
          <div onClick={nextMonth} style={{ cursor: 'pointer' }}>
            <h1 style={styles(theme, fSize).header}>{'>'}</h1>
          </div>
        </div>

        <table style={styles(theme, fSize).table}>
          <thead>
            <tr>
              {daysOfWeek[langIndex].map((day) => (
                <th key={day}>
                  <p
                    style={{
                      textAlign: 'center',
                      fontSize: '12px',
                      color:
                        day === 'Вс' || day === 'Sun'
                          ? '#873535ff'
                          : Colors.get('subText', theme),
                    }}
                  >
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
                  if (day === null) {
                    return <td key={j} />;
                  }

                  const cellDate = new Date(cellYear, cellMonth, day);
                  const dayKey = formatDateKey(cellDate);
                  const entry = AppData.sleepingLog?.[dayKey];

                  const isChosen =
                    day === currentDate.getDate() &&
                    cellMonth === currentDate.getMonth() &&
                    cellYear === currentDate.getFullYear();

                  // Determine background: mood color if logged, else default
                  let bgColor = Colors.get('background', theme);

                  return (
                    <td key={j}>
                      <div
  style={{
    ...styles(theme, fSize).cell,
    backgroundColor: bgColor, // mood color as base
    border: `3px solid ${
      isChosen ? Colors.get('currentDateBorder', theme) : 'transparent'
    }`,
    color: isChosen
      ? Colors.get('textHighlight', theme)
      : Colors.get('mainText', theme),
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  }}
  onClick={() => {
    const newDate = new Date(cellYear, cellMonth, day);
    setCurrentDate(newDate);
    playEffects(clickSound);
    setSelectedSleepEntry(entry || null);
  }}
>
  {/* Duration fill layer (0% to 100% from bottom) */}
  {entry && typeof entry.duration === 'number' && (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: `${getFillPercentFromMs(entry.duration)}%`,
        backgroundColor: moodColors(theme, entry.mood - 1), // subtle white overlay
        backdropFilter: 'blur(2px)', // optional: modern look
        zIndex: 0,
      }}
    />
  )}

  {/* Day number on top */}
  <span style={{ position: 'relative', zIndex: 1 }}>{day}</span>
</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Date header below calendar */}
      <p
        style={{
          ...styles(theme, fSize).subtext,
          fontSize: '18px',
          textAlign: 'center',
          marginTop: '12px',
        }}
      >
        {currentDate.getDate()}-{currentDate.getMonth() + 1}-
        {currentDate.getFullYear()} {fullNames[langIndex][getMondayIndex(currentDate)]}
      </p>

      {/* Sleep info panel */}
      {selectedSleepEntry && (
        <div style={styles(theme, fSize).sleepInfoPanel}>
          <p>
            <strong>{langIndex === 0 ? 'Время отбоя:' : 'Bedtime:'}</strong>{' '}
            {formatMsToHhMm(selectedSleepEntry.bedtime)}
          </p>
          <p>
            <strong>{langIndex === 0 ? 'Продолжительность:' : 'Duration:'}</strong>{' '}
            {formatMsToHhMm(selectedSleepEntry.duration)}
          </p>
          <p>
            <strong>{langIndex === 0 ? 'Настроение:' : 'Mood:'}</strong>{' '}
            {'★'.repeat(selectedSleepEntry.mood)}{'☆'.repeat(5 - selectedSleepEntry.mood)}
          </p>
          {selectedSleepEntry.note && (
            <div>
              <strong>{langIndex === 0 ? 'Заметка:' : 'Note:'}</strong>{' '}
              {selectedSleepEntry.note}
            </div>
          )}
        </div>
      )}

      <SleepNew dateString={formatDateKey(currentDate)} />
      <SleepInsight dateString={formatDateKey(currentDate)} />
    </div>
  );
};

export default SleepMain;

const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    justifyContent: 'start',
    alignItems: 'center',
    height: '78vh',
    paddingTop: '5vh',
    width: '100vw',
    fontFamily: 'Segoe UI',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'start',
    borderBottom: `1px solid ${Colors.get('border', theme)}`,
  },
  calendarHead: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '10%',
    background: Colors.get('headGradient', theme),
  },
  header: {
    fontFamily: 'Segoe UI',
    padding: '2vw',
    marginLeft: '6vw',
    marginRight: '6vw',
    fontSize: '36px',
    fontWeight: 'bold',
    color: Colors.get('subText', theme),
  },
  table: {
    borderCollapse: 'collapse',
    width: '90%',
    textAlign: 'center',
    tableLayout: 'fixed',
  },
  cell: {
    boxSizing: 'border-box',
    width: '13vw',
    height: '13vw',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    fontFamily: 'Segoe UI',
  },
  subtext: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginLeft: '10px',
    marginBottom: '12px',
  },
  sleepInfoPanel: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: Colors.get('card', theme),
    borderRadius: '8px',
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('text', theme),
    maxWidth: '90vw',
    width: '100%',
  },
});
