import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import { MuscleIcon } from '../../../Classes/TrainingData';
import WeekSparkline from './MiniChart';
import TrainingMetrics from './TrainingMetrics';
import { FaArrowDown, FaArrowUp, FaChartLine, FaDumbbell, FaMinus } from 'react-icons/fa';
import {
  getTrainingAccent,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow
} from '../TrainingVisuals.js';

const TrainingAnaliticsRM = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showBarChart, setShowBarChart] = useState(false);
  const [currentExId, setCurrentExId] = useState(-1);

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

  const exerciseStats = getExerciseAnalyticsData(langIndex);
  const accent = getTrainingAccent();

  return (
    <div style={styles(theme).container}>
      <div style={styles(theme).headerPanel}>
        <div>
          <div style={styles(theme).eyebrow}>{langIndex === 0 ? 'СИЛОВЫЕ' : 'STRENGTH'}</div>
          <div style={styles(theme, fSize).title}>{langIndex === 0 ? 'Упражнения' : 'Exercises'}</div>
        </div>
        <div style={styles(theme).summaryPill}>
          <FaChartLine size={13} />
          {exerciseStats.length}
        </div>
      </div>

      <AnimatePresence>
        {exerciseStats.length > 0 ? (
          exerciseStats.map((item, i) => {
            const trend = getTrend(item.sets365);
            const sparkColor = getSparklineColor(item.sparkline, theme);

            return (
              <Motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16, delay: i * 0.02, ease: 'easeOut' }}
                onClick={() => {
                  setCurrentExId(item.id);
                  setShowBarChart(true);
                }}
                style={styles(theme).exerciseCard}
                whileTap={{ scale: 0.985 }}
              >
                <div style={styles(theme).visualColumn}>
                  <div style={styles(theme).muscleBadge}>
                    {MuscleIcon.getForList(item.exercise.mgId, langIndex, theme)}
                  </div>
                  <div style={styles(theme).rank}>{String(i + 1).padStart(2, '0')}</div>
                </div>

                <div style={styles(theme).contentColumn}>
                  <div style={styles(theme).cardTopLine}>
                    <div style={styles(theme, fSize).exerciseName}>{item.exercise.name[langIndex]}</div>
                    <TrendBadge trend={trend} theme={theme} />
                  </div>
                  <div style={styles(theme).muscleLine}>{item.muscleName}</div>
                </div>

                <div style={styles(theme).metricsRow}>
                  <Metric label={langIndex === 0 ? '1RM' : '1RM'} value={item.bestRM > 0 ? `${Math.round(item.bestRM)} кг` : '0 кг'} theme={theme} />
                  <Metric label={langIndex === 0 ? 'Тоннаж' : 'Volume'} value={`${(item.volume28 / 1000).toFixed(1)} т`} theme={theme} />
                  <Metric label={langIndex === 0 ? 'Сеты' : 'Sets'} value={item.sets28.length || item.sets365.length} theme={theme} />
                </div>

                <div style={styles(theme).sparkColumn}>
                  <div style={styles(theme).sparkChart}>
                    <WeekSparkline values={item.sparkline} color={sparkColor || accent.hue} />
                  </div>
                  <div style={styles(theme).sparkLabel}>
                    {item.lastDateLabel}
                  </div>
                </div>
              </Motion.div>
            );
          })
        ) : (
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles(theme).emptyState}
          >
            <div style={styles(theme).emptyIcon}><FaDumbbell /></div>
            <div style={styles(theme, fSize).emptyTitle}>
              {langIndex === 0 ? 'Пока нет силовых данных' : 'No strength data yet'}
            </div>
            <div style={styles(theme).emptyText}>
              {langIndex === 0
                ? 'Добавьте упражнение в текущую тренировку и завершите хотя бы один сет. После этого здесь появятся карточки с прогрессом.'
                : 'Add an exercise to a workout and finish at least one set. Progress cards will appear here.'}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>

      {showBarChart && (
        <TrainingMetrics id={currentExId} closePanel={setShowBarChart} />
      )}
    </div>
  );
};

const TrendBadge = ({ trend, theme }) => {
  const value = Math.round(Math.abs(trend));
  const isUp = trend > 1;
  const isDown = trend < -1;
  const color = isUp ? Colors.get('done', theme) : isDown ? Colors.get('skipped', theme) : Colors.get('subText', theme);
  const bg = isUp
    ? 'rgba(52, 211, 153, 0.12)'
    : isDown
      ? 'rgba(248, 113, 113, 0.12)'
      : 'rgba(148, 163, 184, 0.10)';
  const Icon = isUp ? FaArrowUp : isDown ? FaArrowDown : FaMinus;

  return (
    <div style={{ ...styles(theme).trendBadge, color, background: bg }}>
      <Icon size={9} />
      {value > 0 ? value : '0'}
    </div>
  );
};

const Metric = ({ label, value, theme }) => (
  <div style={styles(theme).metric}>
    <span style={styles(theme).metricValue}>{value}</span>
    <span style={styles(theme).metricLabel}>{label}</span>
  </div>
);

const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) return new Date();
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};

const getExerciseSetsInPeriod = (exerciseId, days = 28) => {
  const now = getAppToday();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  const cutoffTime = cutoff.getTime();
  const sets = [];

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog || {})) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;

    for (const session of Array.isArray(sessions) ? sessions : Object.values(sessions || {})) {
      if (!session?.completed || session.type !== 'GYM') continue;
      const exercise = session.exercises?.[exerciseId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;

      for (const set of exercise.sets) {
        const reps = Number(set.reps) || 0;
        const weight = Number(set.weight) || 0;
        if (reps > 0 && weight > 0) {
          sets.push({
            date: sessionDate,
            weight,
            reps,
            volume: weight * reps,
            estimated1RM: weight * (1 + reps / 30),
            timestamp: sessionDate.getTime()
          });
        }
      }
    }
  }

  return sets.sort((a, b) => a.timestamp - b.timestamp);
};

const getExerciseAnalyticsData = (langIndex) => {
  return Object.entries(AppData.exercises || {})
    .map(([idStr, exercise]) => {
      if (!exercise?.show) return null;
      const id = Number(idStr);
      const sets28 = getExerciseSetsInPeriod(id, 28);
      const sets365 = getExerciseSetsInPeriod(id, 365);
      const storedRM = Number(exercise.rm) || 0;
      if (storedRM <= 0 && sets365.length === 0) return null;

      const bestRM = Math.max(storedRM, ...sets365.map(set => set.estimated1RM), 0);
      const sourceSets = sets28.length > 0 ? sets28 : sets365.slice(-12);
      const volume28 = sets28.reduce((sum, set) => sum + set.volume, 0);
      const lastSet = sets365[sets365.length - 1];
      const muscleName = MuscleIcon.names?.[langIndex]?.[exercise.mgId] || '';

      return {
        id,
        exercise,
        sets28,
        sets365,
        bestRM,
        volume28,
        muscleName,
        sparkline: getSparklineData(sourceSets, bestRM),
        lastDateLabel: formatLastDate(lastSet?.date, langIndex)
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      const volumeDiff = b.volume28 - a.volume28;
      if (volumeDiff !== 0) return volumeDiff;
      return b.bestRM - a.bestRM;
    });
};

const getSparklineData = (sets, fallbackRM) => {
  if (!sets || sets.length === 0) return fallbackRM > 0 ? [fallbackRM, fallbackRM] : [0, 0];
  const recent = sets.slice(-7).map(set => Math.round(set.estimated1RM));
  if (recent.length === 1) return [recent[0], recent[0]];
  return recent;
};

const getTrend = (sets) => {
  if (!sets || sets.length < 4) return 0;
  const recent = sets.slice(-3);
  const previous = sets.slice(-6, -3);
  if (previous.length === 0) return 0;
  const avg = arr => arr.reduce((sum, set) => sum + set.estimated1RM, 0) / arr.length;
  return avg(recent) - avg(previous);
};

const getSparklineColor = (data, theme) => {
  if (!data || data.length < 2 || data.every(v => v === 0)) return Colors.get('subText', theme);
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first * 1.02) return Colors.get('done', theme);
  if (last < first * 0.98) return Colors.get('skipped', theme);
  return getTrainingAccent().hue;
};

const formatLastDate = (date, langIndex) => {
  if (!date) return langIndex === 0 ? 'нет даты' : 'no date';
  return date.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', { day: '2-digit', month: 'short' });
};

const styles = (theme, fSize) => {
  const accent = getTrainingAccent();
  const isLight = theme === 'light' || theme === 'speciallight';
  const panelBg = getTrainingPanelBackground(theme, accent);
  const border = getTrainingPanelBorder(theme, accent);

  return {
    container: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px',
      paddingBottom: '100px',
      boxSizing: 'border-box'
    },
    headerPanel: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      padding: '14px 16px',
      borderRadius: '24px',
      background: panelBg,
      border: `1px solid ${border}`,
      boxShadow: getTrainingPanelShadow(theme, accent),
      boxSizing: 'border-box'
    },
    eyebrow: {
      color: accent.hue,
      fontSize: '11px',
      fontWeight: 900,
      letterSpacing: '0.16em',
      marginBottom: '4px'
    },
    title: {
      color: Colors.get('mainText', theme),
      fontSize: fSize === 0 ? '21px' : '23px',
      fontWeight: 900,
      lineHeight: 1.1
    },
    summaryPill: {
      minWidth: '54px',
      height: '38px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '7px',
      color: accent.hue,
      background: `rgba(${accent.rgb}, 0.12)`,
      border: `1px solid ${accent.ring}`,
      fontSize: '14px',
      fontWeight: 900
    },
    exerciseCard: {
      width: '100%',
      minHeight: '148px',
      display: 'grid',
      gridTemplateColumns: '54px minmax(0, 1fr)',
      gridTemplateAreas: '"visual content" "metrics metrics" "spark spark"',
      columnGap: '12px',
      rowGap: '10px',
      alignItems: 'start',
      padding: '14px',
      borderRadius: '24px',
      background: panelBg,
      border: `1px solid ${border}`,
      boxShadow: getTrainingPanelShadow(theme, accent),
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    visualColumn: {
      gridArea: 'visual',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      minWidth: 0,
      paddingTop: '3px'
    },
    muscleBadge: {
      width: '46px',
      height: '46px',
      borderRadius: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.055)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.08)'}`,
      overflow: 'hidden'
    },
    rank: {
      color: Colors.get('subText', theme),
      fontSize: '10px',
      fontWeight: 900,
      letterSpacing: '0.08em'
    },
    contentColumn: {
      gridArea: 'content',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    cardTopLine: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '10px'
    },
    exerciseName: {
      color: Colors.get('mainText', theme),
      fontSize: fSize === 0 ? '15px' : '17px',
      lineHeight: 1.2,
      fontWeight: 900,
      overflowWrap: 'break-word',
      wordBreak: 'normal'
    },
    muscleLine: {
      color: Colors.get('subText', theme),
      fontSize: '12px',
      fontWeight: 750,
      lineHeight: 1.2
    },
    trendBadge: {
      flexShrink: 0,
      height: '26px',
      minWidth: '42px',
      padding: '0 8px',
      borderRadius: '999px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      fontSize: '11px',
      fontWeight: 900,
      boxSizing: 'border-box'
    },
    metricsRow: {
      gridArea: 'metrics',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '8px'
    },
    metric: {
      minWidth: 0,
      borderRadius: '14px',
      padding: '9px 8px',
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3px',
      boxSizing: 'border-box'
    },
    metricValue: {
      color: Colors.get('mainText', theme),
      fontSize: '14px',
      fontWeight: 900,
      whiteSpace: 'nowrap',
      overflow: 'visible',
      textOverflow: 'clip'
    },
    metricLabel: {
      color: Colors.get('subText', theme),
      fontSize: '9.5px',
      fontWeight: 850,
      textTransform: 'uppercase',
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap'
    },
    sparkColumn: {
      gridArea: 'spark',
      width: '100%',
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      paddingLeft: '66px',
      boxSizing: 'border-box'
    },
    sparkChart: {
      flex: 1,
      minWidth: 0,
      height: '40px'
    },
    sparkLabel: {
      color: Colors.get('subText', theme),
      fontSize: '10px',
      fontWeight: 800,
      whiteSpace: 'nowrap'
    },
    emptyState: {
      width: '100%',
      minHeight: '240px',
      padding: '28px 22px',
      borderRadius: '28px',
      background: panelBg,
      border: `1px dashed ${border}`,
      boxShadow: getTrainingPanelShadow(theme, accent),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      boxSizing: 'border-box'
    },
    emptyIcon: {
      width: '58px',
      height: '58px',
      borderRadius: '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '14px',
      color: accent.hue,
      background: `rgba(${accent.rgb}, 0.12)`,
      border: `1px solid ${accent.ring}`,
      fontSize: '22px'
    },
    emptyTitle: {
      color: Colors.get('mainText', theme),
      fontSize: fSize === 0 ? '18px' : '20px',
      fontWeight: 900,
      marginBottom: '8px'
    },
    emptyText: {
      maxWidth: '360px',
      color: Colors.get('subText', theme),
      fontSize: '13px',
      fontWeight: 700,
      lineHeight: 1.45
    }
  };
};

export default TrainingAnaliticsRM;
