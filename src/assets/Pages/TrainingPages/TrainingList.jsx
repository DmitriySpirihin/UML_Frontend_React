import { useState, useEffect, useMemo } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

// --- Helpers ---
const getDayName = (dateStr, langIndex) => {
  const date = new Date(dateStr);
  const options = { weekday: 'long' };
  const locale = langIndex === 0 ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

const formatDuration = (ms) => {
  const mins = Math.floor(ms / 60000);
  return `${mins} min`;
};

const colors = [
  "#00c6ff", "#0072ff", "#ff416c", "#ff4b2b", "#38ef7d", "#11998e",
  "#f09819", "#edde5d", "#834d9b", "#d04ed6", "#1d976c", "#93f9b9",
  "#5d29c3", "#a968f2", "#ff7e5f", "#feb47b", "#2af598", "#009efd",
  "#ff6b6b", "#ffa500", "#114357", "#f29492", "#43e97b", "#38f9d7",
  "#92fe9d", "#00c9ff", "#2c3e50", "#3498db", "#c33764", "#1d2671",
  "#ff9a9e", "#fecfef", "#a8ff78", "#78ffd6", "#b993d6", "#8ca6db",
  "#ff758c", "#ff7eb3", "#4facfe", "#00f2fe"
];

const TrainingList = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0] === 'ru' ? 0 : 1);
  const [fSize, setFSize] = useState(AppData.prefs[1]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [type, setType] = useState(0); // 0: all, 1: program, 2: day
  const [pId, setPId] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);

  // --- Subscriptions ---
  useEffect(() => {
    const subTheme = theme$.subscribe(setThemeState);
    const subLang = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    return () => {
      subLang.unsubscribe();
      subTheme.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subFontSize = fontSize$.subscribe(setFSize);
    return () => subFontSize.unsubscribe();
  }, []);

  // --- Data & Filtering ---
  const { allTrainings, sessionColorMap } = useMemo(() => {
    const trainings = [];
    const colorMap = new Map();
    let colorIndex = 0;

    for (const [date, sessions] of Object.entries(AppData.trainingLog || {})) {
      sessions.forEach((session, idx) => trainings.push({ date, idx, session }));
    }

    trainings.sort((a, b) => (b.session.startTime || 0) - (a.session.startTime || 0));

    trainings.forEach(({ session }) => {
      const key = `${session.programId || 0}-${session.dayIndex || 0}`;
      if (!colorMap.has(key)) {
        colorMap.set(key, colors[colorIndex % colors.length]);
        colorIndex++;
      }
    });

    let filtered = trainings;
    if (type === 1) {
      filtered = trainings.filter(t => t.session.programId === pId);
    } else if (type === 2) {
      filtered = trainings.filter(
        t => t.session.programId === pId && t.session.dayIndex === dayIndex
      );
    }

    return { allTrainings: filtered, sessionColorMap: colorMap };
  }, [AppData.trainingLog, type, pId, dayIndex]);

  // --- Filter Options ---
  const programOptions = useMemo(() => {
    const ids = new Set();
    Object.values(AppData.trainingLog || {}).forEach(sessions =>
      sessions.forEach(s => ids.add(s.programId || 0))
    );

    return Array.from(ids)
      .map(id => {
        const prog = AppData.programs[id]; // ✅ OBJECT ACCESS
        return {
          id,
          name: prog?.name?.[langIndex] || `Program ${id}`
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [langIndex]);

  const dayOptions = useMemo(() => {
    if (type !== 2 || pId == null) return [];
    const program = AppData.programs[pId]; // ✅ OBJECT ACCESS
    const schedule = program?.schedule || [];
    return schedule.map((_, idx) => ({
      index: idx,
      name: schedule[idx]?.name?.[langIndex] || `Day ${idx + 1}`
    }));
  }, [type, pId, langIndex]);

  // Auto-select first program/day when filter mode changes
  useEffect(() => {
    if ((type === 1 || type === 2) && programOptions.length > 0 && pId === 0) {
      setPId(programOptions[0].id);
    }
    if (type === 2 && dayOptions.length > 0) {
      setDayIndex(dayOptions[0].index);
    }
  }, [type, programOptions, dayOptions, pId]);

  // --- Labels ---
  const allLabel = langIndex === 0 ? 'все' : 'all';
  const progLabel = langIndex === 0 ? 'программа' : 'program';
  const dayLabel = langIndex === 0 ? 'день' : 'day';

  return (
    <div style={styles(theme).container}>
      {/* === Filter Toggles === */}
      <div style={styles(theme).filterContainer}>
        <div style={styles(theme).textToggles}>
          {[{ key: 0, label: allLabel }, { key: 1, label: progLabel }, { key: 2, label: dayLabel }].map(({ key, label }) => (
            <span
              key={key}
              onClick={() => setType(key)}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: type === key
                  ? (fSize === 0 ? '14px' : '16px')
                  : (fSize === 0 ? '13px' : '14px'),
                fontWeight: type === key ? '600' : '400',
                color: type === key
                  ? Colors.get('mainText', theme)
                  : Colors.get('subText', theme),
                opacity: type === key ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
            >
              {label}
              {key < 2 && (
                <span style={{
                  margin: '0 10px',
                  color: Colors.get('border', theme),
                  fontSize: fSize === 0 ? '13px' : '15px'
                }}>
                  |
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Program Dropdown */}
        {(type === 1 || type === 2) && (
          <select
            value={pId}
            onChange={(e) => {
              const newId = Number(e.target.value);
              setPId(newId);
              if (type === 2 && dayOptions.length > 0) {
                setDayIndex(dayOptions[0]?.index || 0);
              }
            }}
            style={styles(theme).select}
          >
            {programOptions.map(prog => (
              <option key={prog.id} value={prog.id}>
                {prog.name}
              </option>
            ))}
          </select>
        )}

        {/* Day Dropdown */}
        {type === 2 && (
          <select
            value={dayIndex}
            onChange={(e) => setDayIndex(Number(e.target.value))}
            style={styles(theme).select}
          >
            {dayOptions.map(day => (
              <option key={day.index} value={day.index}>
                {day.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* === Training List === */}
      {allTrainings.length > 0 ? (
        allTrainings.map((item) => {
          const { date, idx, session } = item;
          const sessionId = `${date}-${idx}`;
          const isExpanded = expandedSessionId === sessionId;
          const programId = session.programId || 0;
          const sessionDayIndex = session.dayIndex || 0;
          const sessionKey = `${programId}-${sessionDayIndex}`;
          const borderColor = sessionColorMap.get(sessionKey) || colors[0];

          const program = AppData.programs[programId]; // ✅ OBJECT ACCESS
          const programName = program?.name?.[langIndex] || `Program ${programId}`;
          const dayName = program?.schedule?.[sessionDayIndex]?.name?.[langIndex] || `Day ${sessionDayIndex + 1}`;

          return (
            <div key={sessionId} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  ...styles(theme, false, false, fSize).sessionPanel,
                  borderTop: `3px ridge ${borderColor}`,
                  backgroundColor: isExpanded
                    ? Colors.get('trainingGroupSelected', theme)
                    : Colors.get('bottomPanel', theme),
                  paddingLeft: '12px',
                  paddingRight: '12px',
                  cursor: 'pointer'
                }}
                onClick={() => setExpandedSessionId(isExpanded ? null : sessionId)}
              >
                <div style={{ flex: 1 }}>
                  <div style={styles(theme, false, false, fSize).text}>
                    {date} • {getDayName(date, langIndex)}
                  </div>
                  <div style={styles(theme, false, false, fSize).subtext}>
                    {programName} • {dayName}
                  </div>
                </div>
                {isExpanded ? (
                  <IoIosArrowUp size={20} color={Colors.get('icons', theme)} style={{ marginRight: '20px' }} />
                ) : (
                  <IoIosArrowDown size={20} color={Colors.get('icons', theme)} style={{ marginRight: '20px' }} />
                )}
              </div>

              {isExpanded && (
                <div style={{ width: '100%', paddingLeft: '12px', paddingRight: '12px', paddingBottom: '12px' }}>
                  <div style={styles(theme, false, false, fSize).subtext}>
                    {formatDuration(session.duration || 0)} • {(session.tonnage / 1000).toFixed(2)} {langIndex === 0 ? 'тонн' : 'tons'}
                  </div>

                  {Object.entries(session.exercises || {})
                    .filter(([exId, ex]) => ex?.sets?.length > 0)
                    .map(([exId, ex]) => {
                      const exIdNum = parseInt(exId, 10);
                      const exercise = AppData.exercises[exIdNum]; // ✅ CORRECT
                      const exerciseName = exercise?.name?.[langIndex] || `Exercise ${exId}`;

                      return (
                        <div
                          key={exId}
                          style={{
                            ...styles(theme, false, false, fSize).exercisesPanel,
                            backgroundColor: Colors.get('background', theme),
                            borderBottom: `1px solid ${Colors.get('border', theme)}`,
                            width: '100%'
                          }}
                        >
                          <div
                            style={{
                              fontSize: fSize === 0 ? '13px' : '15px',
                              color: Colors.get('mainText', theme),
                              marginBottom: '6px'
                            }}
                          >
                            {exerciseName}
                            <span style={{ ...styles(theme, false, false, fSize).subtext, marginLeft: '20px' }}>
                              {(ex.totalTonnage / 1000).toFixed(2)} {langIndex === 0 ? 'тонн' : 'tons'}
                            </span>
                          </div>

                          {ex.sets.map((set, sIdx) => {
                            const isWarmUp = set.type === 0;
                            const setColor = isWarmUp
                              ? Colors.get('trainingIsolatedFont', theme)
                              : Colors.get('trainingBaseFont', theme);

                            return (
                              <div
                                key={sIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  fontSize: fSize === 0 ? '13px' : '15px',
                                  color: setColor,
                                  fontWeight: '500',
                                  borderBottom: `1px solid ${Colors.get('border', theme)}`,
                                  marginTop: '4px'
                                }}
                              >
                                <span>{sIdx + 1}:</span>
                                <span>{set.weight}</span>
                                <span>{langIndex === 0 ? 'кг' : 'kg'}</span>
                                <span>×</span>
                                <span>{set.reps}</span>
                                {set.time != null && set.time > 0 && (
                                  <span>({Math.round(set.time / 1000)}s)</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })
      ) : (
        <div style={{
          padding: '32px 20px',
          color: Colors.get('subText', theme),
          fontSize: fSize === 0 ? '13px' : '15px',
          textAlign: 'center'
        }}>
          {langIndex === 0 ? 'Тренировки не найдены' : 'No trainings found'}
        </div>
      )}
    </div>
  );
};

const styles = (theme, isCurrentGroup, isCurrentExercise, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    alignItems: 'center',
    height: '78vh',
    paddingTop: '5vh',
    width: '100vw',
    fontFamily: 'Segoe UI',
    boxSizing: 'border-box',
    padding: '0 8px'
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    paddingTop: '12px',
    width: '95%',
    maxWidth: '800px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: '16px'
  },
  textToggles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 0',
    width: '100%',
    maxWidth: '400px',
    userSelect: 'none'
  },
  select: {
    borderBottom: `1px solid ${Colors.get('border', theme)}`,
    backgroundColor: Colors.get('background', theme),
    color: Colors.get('subText', theme),
    fontSize: fSize === 0 ? '11px' : '13px',
    width: '80%',
    borderTop: 'none',
    borderLeft: 'none',
    borderRight: 'none',
    outline: 'none'
  },
  sessionPanel: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    maxWidth: '800px',
    height: '6vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  exercisesPanel: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '800px',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  text: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom: '4px'
  },
  subtext: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginBottom: '4px'
  }
});

export default TrainingList;