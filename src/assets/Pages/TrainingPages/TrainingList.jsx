import { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

// Helper: Get day name from date string (e.g., "2025-12-08")
const getDayName = (dateStr, langIndex) => {
  const date = new Date(dateStr);
  const options = { weekday: 'long' };
  const locale = langIndex === 0 ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

// Helper: Format duration in minutes
const formatDuration = (ms) => {
  const mins = Math.floor(ms / 60000);
  return `${mins} min`;
};

// Solid colors array (40 unique)
const colors = [
  "#00c6ff", "#0072ff", "#ff416c", "#ff4b2b", "#38ef7d", "#11998e",
  "#f09819", "#edde5d", "#834d9b", "#d04ed6", "#1d976c", "#93f9b9",
  "#5d29c3", "#a968f2", "#ff7e5f", "#feb47b", "#2af598", "#009efd",
  "#ff6b6b", "#ffa500", "#114357", "#f29492", "#43e97b", "#38f9d7",
  "#92fe9d", "#00c9ff", "#2c3e50", "#3498db", "#c33764", "#1d2671",
  "#ff9a9e", "#fecfef", "#a8ff78", "#78ffd6", "#b993d6", "#8ca6db",
  "#ff758c", "#ff7eb3", "#4facfe", "#00f2fe"
];

const TrainingList = ({ needToAdd, setEx }) => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0] === 'ru' ? 0 : 1);
  const [fSize, setFSize] = useState(AppData.prefs[1]);
  const [expandedSessionId, setExpandedSessionId] = useState(null); // e.g., "2025-12-08-0"

  useEffect(() => {
    const subscriptionTheme = theme$.subscribe(setThemeState);
    const subscriptionLang = lang$.subscribe((lang) => {
      setLangIndex(lang === 'ru' ? 0 : 1);
    });
    return () => {
      subscriptionLang.unsubscribe();
      subscriptionTheme.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscriptionFontSize = fontSize$.subscribe(setFSize);
    return () => {
      subscriptionFontSize.unsubscribe();
    };
  }, []);

  // Flatten and sort trainings: newest first
  const allTrainings = [];
  for (const [date, sessions] of Object.entries(AppData.trainingLog || {})) {
    sessions.forEach((session, idx) => {
      allTrainings.push({ date, idx, session });
    });
  }

  // Sort by startTime (newest first)
  allTrainings.sort((a, b) => {
    const timeA = a.session.startTime || 0;
    const timeB = b.session.startTime || 0;
    return timeB - timeA;
  });

  // Assign unique color per (programId, dayIndex) session type
  const sessionColorMap = new Map();
  let colorIndex = 0;
  allTrainings.forEach(({ session }) => {
    const key = `${session.programId}-${session.dayIndex}`;
    if (!sessionColorMap.has(key)) {
      sessionColorMap.set(key, colors[colorIndex % colors.length]);
      colorIndex++;
    }
  });

  return (
    <div style={styles(theme).container}>
      {allTrainings.map((item) => {
        const { date, idx, session } = item;
        const sessionId = `${date}-${idx}`;
        const isExpanded = expandedSessionId === sessionId;
        const programId = session.programId || 0;
        const dayIndex = session.dayIndex || 0;

        const sessionKey = `${programId}-${dayIndex}`;
        const borderColor = sessionColorMap.get(sessionKey) || colors[0];

        const program = AppData.programs.find(pr => pr.id === programId);
        const programName = program?.name?.[langIndex] || `Program ${programId}`;
        const dayName = program?.schedule?.[dayIndex]?.name?.[langIndex] || `Day ${dayIndex + 1}`;

        return (
          <div key={sessionId} style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Session Header */}
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

            {/* Expanded Content */}
            {isExpanded && (
              <div style={{ width: '100%', paddingLeft: '12px', paddingRight: '12px', paddingBottom: '12px' }}>
                {/* Session Summary */}
                <div style={styles(theme, false, false, fSize).subtext}>
                  {formatDuration(session.duration || 0)} • {(session.tonnage / 1000).toFixed(2)} {langIndex === 0 ? 'тонн' : 'tons'}
                </div>

                {/* Exercises */}
                {Object.entries(session.exercises || {})
                  .filter(([exId, ex]) => ex?.sets?.length > 0)
                  .map(([exId, ex]) => {
                    const exIdNum = parseInt(exId, 10);
                    const exercise = AppData.exercises.find(e => e.id === exIdNum);
                    const exerciseName = exercise?.name?.[langIndex] || `Exercise ${exId}`;

                    return (
                      <div
                        key={exId}
                        style={{
                          ...styles(theme, false, false, fSize).exercisesPanel,
                          backgroundColor: Colors.get('background', theme),
                          borderBottom:`1px solid ${Colors.get('border', theme)}`,
                          width: '100%'
                        }}
                      >
                        <div
                          style={{
                            fontSize: fSize === 0 ? '12px' : '14px',
                            color: Colors.get('mainText', theme),
                            marginBottom: '6px'
                          }}
                        >
                          {exerciseName}
                          <span style={{...styles(theme,false,false,fSize).subtext,marginLeft:'20px'}}>{(ex.totalTonnage / 1000).toFixed(2)} {langIndex === 0 ? 'тонн' : 'tons'}</span>
                        </div>

                        {ex.sets.map((set, sIdx) => {
                          const isWarmUp = set.type === 0;
                          const setColor = isWarmUp
                            ? Colors.get('trainingIsolatedFont', theme) // warm-up
                            : Colors.get('trainingBaseFont', theme);    // working

                          return (
                            <div
                              key={sIdx}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: fSize === 0 ? '11px' : '13px',
                                color: setColor,
                                fontWeight: '500',
                                borderBottom:`1px solid ${Colors.get('border', theme)}`,
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
      })}
    </div>
  );
};

export default TrainingList;

// Styles
const styles = (theme, isCurrentGroup, isCurrentExercise, fSize) => ({
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
    boxSizing: 'border-box'
  },
  sessionPanel: {
    display: 'flex',
    flexDirection: 'row',
    width: '98vw',
    height: '6vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  exercisesPanel: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
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