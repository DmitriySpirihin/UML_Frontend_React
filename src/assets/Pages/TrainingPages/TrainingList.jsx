import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // Added for animations
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { FaChevronDown } from 'react-icons/fa'; // For modern dropdown arrow

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
  const allLabel = langIndex === 0 ? 'Все' : 'All';
  const progLabel = langIndex === 0 ? 'Программа' : 'Program';
  const dayLabel = langIndex === 0 ? 'День' : 'Day';

  return (
    <div style={styles(theme).container}>
      {/* === Filter Toggles (Modern Pills) === */}
      <div style={styles(theme).filterContainer}>
        <div style={styles(theme).toggleWrapper}>
          {[{ key: 0, label: allLabel }, { key: 1, label: progLabel }, { key: 2, label: dayLabel }].map(({ key, label }) => {
            const isActive = type === key;
            return (
              <motion.div
                key={key}
                onClick={() => setType(key)}
                whileTap={{ scale: 0.95 }}
                style={{
                  ...styles(theme).togglePill,
                  backgroundColor: isActive ? Colors.get('currentDateBorder', theme) : 'transparent',
                  color: isActive ? '#fff' : Colors.get('subText', theme),
                  fontSize: fSize === 0 ? '13px' : '14px',
                }}
              >
                {label}
              </motion.div>
            );
          })}
        </div>

        {/* Dropdowns */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(type === 1 || type === 2) && (
            <div style={styles(theme).selectWrapper}>
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
                  <option key={prog.id} value={prog.id}>{prog.name}</option>
                ))}
              </select>
              <FaChevronDown style={styles(theme).selectIcon} />
            </div>
          )}

          {type === 2 && (
            <div style={styles(theme).selectWrapper}>
              <select
                value={dayIndex}
                onChange={(e) => setDayIndex(Number(e.target.value))}
                style={styles(theme).select}
              >
                {dayOptions.map(day => (
                  <option key={day.index} value={day.index}>{day.name}</option>
                ))}
              </select>
              <FaChevronDown style={styles(theme).selectIcon} />
            </div>
          )}
        </div>
      </div>

      {/* === Training List === */}
      <div style={{ width: '100%', maxWidth: '800px', paddingBottom: '50px' }}>
        {allTrainings.length > 0 ? (
          <AnimatePresence>
            {allTrainings.map((item, i) => {
              const { date, idx, session } = item;
              const sessionId = `${date}-${idx}`;
              const isExpanded = expandedSessionId === sessionId;
              const programId = session.programId || 0;
              const sessionDayIndex = session.dayIndex || 0;
              const sessionKey = `${programId}-${sessionDayIndex}`;
              const borderColor = sessionColorMap.get(sessionKey) || colors[0];

              const program = AppData.programs[programId];
              const programName = program?.name?.[langIndex] || `Program ${programId}`;
              const dayName = program?.schedule?.[sessionDayIndex]?.name?.[langIndex] || `Day ${sessionDayIndex + 1}`;

              return (
                <motion.div
                  key={sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    ...styles(theme).card,
                    borderLeft: `5px solid ${borderColor}`,
                  }}
                >
                  {/* Header Section */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : sessionId)}
                    style={{ ...styles(theme).cardHeader, cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1, padding: '12px 0 12px 16px' }}>
                      <div style={{ ...styles(theme, fSize).dateText }}>
                        {date} • <span style={{ opacity: 0.8 }}>{getDayName(date, langIndex)}</span>
                      </div>
                      <div style={styles(theme, fSize).programText}>
                        {programName} <span style={{ margin: '0 6px', opacity: 0.5 }}>|</span> {dayName}
                      </div>
                    </div>
                    <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <IoIosArrowDown size={18} color={Colors.get('subText', theme)} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={styles(theme).expandedContent}>
                          {/* Stats Row */}
                          <div style={styles(theme).statsRow}>
                            <div style={styles(theme).statBadge}>
                              ⏱ {formatDuration(session.duration || 0)}
                            </div>
                            <div style={styles(theme).statBadge}>
                              🏋️ {(session.tonnage / 1000).toFixed(2)} {langIndex === 0 ? 'т' : 't'}
                            </div>
                          </div>

                          {/* Exercises */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {Object.entries(session.exercises || {})
                              .filter(([_, ex]) => ex?.sets?.length > 0)
                              .map(([exId, ex]) => {
                                const exIdNum = parseInt(exId, 10);
                                const exercise = AppData.exercises[exIdNum];
                                const exerciseName = exercise?.name?.[langIndex] || `Exercise ${exId}`;

                                return (
                                  <div key={exId} style={styles(theme).exerciseBlock}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                      <span style={styles(theme, fSize).exerciseTitle}>{exerciseName}</span>
                                      <span style={styles(theme).tonnageSub}>{(ex.totalTonnage / 1000).toFixed(2)} {langIndex === 0 ? 'т' : 't'}</span>
                                    </div>

                                    <div style={styles(theme).setsGrid}>
                                      {ex.sets.map((set, sIdx) => {
                                        const isWarmUp = set.type === 0;
                                        const setColor = isWarmUp
                                          ? Colors.get('trainingIsolatedFont', theme)
                                          : Colors.get('trainingBaseFont', theme);
                                        const bgSet = isWarmUp ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.0)';

                                        return (
                                          <div key={sIdx} style={{ ...styles(theme).setRow, backgroundColor: bgSet, color: setColor, fontSize: fSize === 0 ? '13px' : '15px' }}>
                                            <span style={{ opacity: 0.6, fontSize: '11px', marginRight: '6px' }}>{sIdx + 1}</span>
                                            <span style={{ fontWeight: '600' }}>{set.weight}</span>
                                            <span style={{ fontSize: '11px', margin: '0 2px' }}>{langIndex === 0 ? 'кг' : 'kg'}</span>
                                            <span style={{ margin: '0 4px', opacity: 0.5 }}>×</span>
                                            <span style={{ fontWeight: '600' }}>{set.reps}</span>
                                            {set.time != null && set.time > 0 && (
                                              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>({Math.round(set.time / 1000)}s)</span>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '40px 20px',
              color: Colors.get('subText', theme),
              fontSize: fSize === 0 ? '14px' : '16px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            {langIndex === 0 ? 'Тренировки не найдены' : 'No trainings found'}
          </motion.div>
        )}
      </div>
    </div>
  );
};

const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '89vh',
    marginTop: '120px',
    width: '100vw',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    overflowY: 'auto',
    boxSizing: 'border-box',
    padding: '0 10px',
  },
  // --- Filter Styles ---
  filterContainer: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    padding: '0 10px'
  },
  toggleWrapper: {
    display: 'flex',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    padding: '4px',
    borderRadius: '25px',
    width: '100%',
    justifyContent: 'space-between'
  },
  togglePill: {
    flex: 1,
    textAlign: 'center',
    padding: '8px 0',
    borderRadius: '20px',
    cursor: 'pointer',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  // --- Input Styles ---
  selectWrapper: {
    position: 'relative',
    width: '100%',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
    color: Colors.get('mainText', theme),
    fontSize: fSize === 0 ? '14px' : '16px',
    appearance: 'none',
    outline: 'none',
    cursor: 'pointer'
  },
  selectIcon: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: Colors.get('subText', theme),
    fontSize: '12px',
    pointerEvents: 'none'
  },
  // --- Card Styles ---
  card: {
    width: '100%',
    backgroundColor: theme === 'light' ? '#fff' : 'rgba(255,255,255,0.03)',
    borderRadius: '16px',
    marginBottom: '12px',
    boxShadow: theme === 'light' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
    border: `1px solid ${theme === 'light' ? 'transparent' : 'rgba(255,255,255,0.05)'}`,
    overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: fSize === 0 ? '16px' : '18px',
    fontWeight: 'bold',
    color: Colors.get('mainText', theme),
    marginBottom: '4px'
  },
  programText: {
    fontSize: fSize === 0 ? '13px' : '14px',
    color: Colors.get('subText', theme),
    fontWeight: '500'
  },
  // --- Expanded Content ---
  expandedContent: {
    padding: '0 16px 16px 16px',
    borderTop: `1px solid ${Colors.get('border', theme)}`,
    marginTop: '0px',
    paddingTop: '12px',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.01)' : 'rgba(0,0,0,0.1)'
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px'
  },
  statBadge: {
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '12px',
    color: Colors.get('mainText', theme),
    fontWeight: '600'
  },
  exerciseBlock: {
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: `1px dashed ${Colors.get('border', theme)}`
  },
  exerciseTitle: {
    color: Colors.get('mainText', theme),
    fontWeight: '600',
    fontSize: fSize === 0 ? '14px' : '16px',
  },
  tonnageSub: {
    fontSize: '11px',
    color: Colors.get('subText', theme),
    fontWeight: 'bold'
  },
  setsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px'
  },
  setRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '4px 8px',
    borderRadius: '6px',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)',
  }
});

export default TrainingList;