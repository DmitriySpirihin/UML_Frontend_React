import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import MuscleLoadRadar from './MuscleLoadRadar';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$ } from '../../../StaticClasses/HabitsBus';
import { muscleIconComponents } from '../../../Classes/TrainingData';
import { FaBalanceScale, FaChartPie, FaChild, FaInfoCircle } from 'react-icons/fa';
import { saveData } from '../../../StaticClasses/SaveHelper';
import {
  getTrainingAccent,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow
} from '../TrainingVisuals.js';

// --- Labels ---
const periodLabels = [
  ['7 дней', '7 Days'],
  ['Месяц', 'Month'],
  ['3 Месяца', '3 Months']
];

const PERIOD_DAYS = [7, 28, 84];
const canSeedDemoData = import.meta.env.DEV;

const TrainingAnaliticsMuscles = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [period, setPeriod] = useState(0);
  const [viewMode, setViewMode] = useState('radar'); // 'radar' or 'body'

  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    return () => { sub1.unsubscribe(); sub2.unsubscribe(); };
  }, []);

  const [currentData, setCurrentData] = useState([]);
  useEffect(() => {
    const days = PERIOD_DAYS[period];
    setCurrentData(muscleLoadData(days, langIndex));
  }, [period, langIndex]);

  const handleSeedDemoData = async () => {
    await seedTrainingDemoData(langIndex);
    const days = PERIOD_DAYS[period];
    setCurrentData(muscleLoadData(days, langIndex));
  };

  return (
    <div style={styles(theme).shell}>
      <SummaryStrip currentData={currentData} langIndex={langIndex} theme={theme} />
      
      <div style={styles(theme).controlsCard}>
        <div style={styles(theme).segmentedControl}>
          {periodLabels.map((label, idx) => {
              const isActive = period === idx;
              return (
                  <button
                      type="button"
                      key={idx} onClick={() => setPeriod(idx)}
                      style={{ ...styles(theme).segment, ...(isActive ? styles(theme).activeSegment : {}) }}
                  >
                      {label[langIndex]}
                  </button>
              )
          })}
        </div>

        <div style={styles(theme).viewSwitchRow}>
          <ViewToggle icon={<FaChartPie/>} label={langIndex===0?'Радар':'Radar'} active={viewMode==='radar'} onClick={()=>setViewMode('radar')} theme={theme}/>
          <ViewToggle icon={<FaChild/>} label={langIndex===0?'Карта тела':'Body Map'} active={viewMode==='body'} onClick={()=>setViewMode('body')} theme={theme}/>
        </div>
      </div>

      {/* --- Main Content Area --- */}
      <div style={styles(theme).mainContent}>
        <AnimatePresence mode="wait">
            {viewMode === 'radar' ? (
                <Motion.div 
                    key="radar"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    style={styles(theme).chartCard}
                >
                    <MuscleLoadRadar theme={theme} langIndex={langIndex} muscleLoadData={currentData} />
                    <div style={styles(theme).chartCaption}>
                        {langIndex === 0 ? 'Распределение нагрузки по группам мышц' : 'Load distribution across muscle groups'}
                    </div>
                </Motion.div>
            ) : (
                <Motion.div 
                    key="body"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    style={styles(theme).chartCard}
                >
                    <LoadView theme={theme} langIndex={langIndex} period={period}/>
                </Motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* --- Insights / Recommendation --- */}
      <div style={{ width: '100%' }}>
        <Recomendation currentData={currentData} langIndex={langIndex} theme={theme} onSeedDemo={handleSeedDemoData} />
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const SummaryStrip = ({ currentData, langIndex, theme }) => {
  const topMuscles = (currentData || [])
    .filter(item => item.load > 0)
    .sort((a, b) => b.load - a.load)
    .slice(0, 3);

  return (
    <div style={styles(theme).summaryCard}>
      <div>
        <div style={styles(theme).eyebrow}>{langIndex === 0 ? 'БАЛАНС НАГРУЗКИ' : 'LOAD BALANCE'}</div>
        <div style={styles(theme).summaryTitle}>{langIndex === 0 ? 'Что сейчас перегружено' : 'Current hot spots'}</div>
      </div>
      <div style={styles(theme).summaryChips}>
        {topMuscles.length > 0 ? topMuscles.map(muscle => (
          <div key={muscle.mgId} style={styles(theme).summaryChip}>
            <span>{muscle.muscle}</span>
            <strong>{muscle.load}%</strong>
          </div>
        )) : (
          <div style={styles(theme).summaryEmpty}>{langIndex === 0 ? 'Нет данных' : 'No data'}</div>
        )}
      </div>
    </div>
  );
};

const ViewToggle = ({ icon, label, active, onClick, theme }) => {
    const accent = getTrainingAccent();
    const isLight = theme === 'light' || theme === 'speciallight';
    
    return (
        <Motion.div 
            whileTap={{ scale: 0.95 }} onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 14px', borderRadius: '18px', cursor: 'pointer',
                background: active ? `linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, 0.72))` : (isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.055)'),
                color: active ? '#fff' : Colors.get('subText', theme),
                border: `1px solid ${active ? accent.ring : isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
                transition: 'all 0.2s ease',
                flex: 1,
                minWidth: 0
            }}
        >
            {icon}
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{label}</span>
        </Motion.div>
    )
}

const LoadView = ({ theme, langIndex, period = 0 }) => {
  const genderIndex = AppData.pData.gender;
  const baseSrc = genderIndex === 0 ? 'images/BodyIcons/Full.png' : 'images/BodyIcons/Fullf.png';
  const [muscleLoadMap, setMuscleLoadMap] = useState({});

  useEffect(() => {
    const days = PERIOD_DAYS[period] || 7;
    const loadData = muscleLoadData(days, langIndex);
    const map = {};
    loadData.forEach(item => { map[item.mgId] = item.load; });
    setMuscleLoadMap(map);
  }, [period, langIndex]);

  const getTrueColor = (loadPercent) => {
    if (loadPercent >= 80) return '#FF5252'; // Red
    if (loadPercent >= 40) return '#FFB74D'; // Orange
    if (loadPercent >= 5) return '#66BB6A';  // Green
    return Colors.get('subText', theme);     // Grey/Blue (Inactive)
  };

  const allMuscleIds = Array.from({ length: 13 }, (_, i) => i);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      <div style={{ position: 'relative', width: '220px', height: '220px' }}>
        <img src={baseSrc} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} alt="Body base" />
        {allMuscleIds.map(mgId => {
          const loadPercent = muscleLoadMap[mgId] ?? 0;
          const IconComponent = muscleIconComponents[genderIndex]?.[mgId];
          if (!IconComponent) return null;
          const color = getTrueColor(loadPercent);
          return (
            <IconComponent
              key={`muscle-${mgId}`}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                color: color, opacity: loadPercent === 0 ? 0.1 : 0.9, pointerEvents: 'none',
                filter: loadPercent > 0 ? 'drop-shadow(0px 0px 2px rgba(0,0,0,0.3))' : 'none'
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '15px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <LegendItem color="#FF5252" label={langIndex===0?'Высокая':'High'} />
        <LegendItem color="#FFB74D" label={langIndex===0?'Средняя':'Medium'} />
        <LegendItem color="#66BB6A" label={langIndex===0?'Низкая':'Low'} />
      </div>
    </div>
  );
};

const LegendItem = ({ color, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }} />
        <span style={{ fontSize: '11px', color: color, fontWeight: '600' }}>{label}</span>
    </div>
)

const Recomendation = ({ currentData, langIndex, theme, onSeedDemo }) => {
  if (!currentData || currentData.length === 0 || currentData.every(d => d.load === 0)) {
    return (
      <div style={styles(theme).insightCard}>
        <div style={styles(theme).insightIcon}><FaInfoCircle /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', color: Colors.get('subText', theme), lineHeight: 1.45 }}>
              {langIndex === 0 ? 'Недостаточно данных для анализа.' : 'Not enough data for analysis.'}
          </div>
          {canSeedDemoData && (
            <button type="button" onClick={onSeedDemo} style={styles(theme).seedButton}>
              {langIndex === 0 ? 'Заполнить демо-данные' : 'Fill demo data'}
            </button>
          )}
        </div>
      </div>
    );
  }

  const HIGH_THRESHOLD = 85;
  const LOW_THRESHOLD = 25;
  const highLoadMuscles = currentData.filter(d => d.load >= HIGH_THRESHOLD).map(d => d.muscle);
  const lowLoadMuscles = currentData.filter(d => d.load <= LOW_THRESHOLD && d.load > 0).map(d => d.muscle);
  const skippedMuscles = currentData.filter(d => d.load === 0).map(d => d.muscle);

  let message = '';
  let isWarning = false;

  if (highLoadMuscles.length === 0 && lowLoadMuscles.length === 0 && skippedMuscles.length === 0) {
    message = langIndex === 0 ? 'Ваша нагрузка сбалансирована. Отличная работа!' : 'Your training is well-balanced. Great job!';
  } else {
    isWarning = true;
    const parts = [];
    if (highLoadMuscles.length > 0) parts.push(langIndex === 0 ? `Высокая нагрузка: ${highLoadMuscles.join(', ')}.` : `High load: ${highLoadMuscles.join(', ')}.`);
    if (lowLoadMuscles.length > 0) parts.push(langIndex === 0 ? `Низкая нагрузка: ${lowLoadMuscles.join(', ')}.` : `Low load: ${lowLoadMuscles.join(', ')}.`);
    if (skippedMuscles.length > 0 && skippedMuscles.length <= 5) parts.push(langIndex === 0 ? `Пропущено: ${skippedMuscles.join(', ')}.` : `Missed: ${skippedMuscles.join(', ')}.`);
    message = parts.join(' ');
  }

  return (
    <div style={{ ...styles(theme).insightCard, borderColor: isWarning ? 'rgba(255,183,77,0.34)' : 'rgba(102,187,106,0.34)' }}>
      <div style={{ ...styles(theme).insightIcon, color: isWarning ? '#FFB74D' : '#66BB6A' }}>
        <FaBalanceScale />
      </div>
      <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: Colors.get('subText', theme), textTransform: 'uppercase', marginBottom: '4px' }}>
              {langIndex === 0 ? 'Инсайт' : 'Insight'}
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.5', color: Colors.get('mainText', theme) }}>{message}</div>
      </div>
    </div>
  );
};

// --- STYLES ---
const styles = (theme) => {
  const accent = getTrainingAccent();
  const isLight = theme === 'light' || theme === 'speciallight';
  const panelBg = getTrainingPanelBackground(theme, accent);
  const border = getTrainingPanelBorder(theme, accent);

  return ({
  shell: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '14px',
    paddingBottom: '100px',
    boxSizing: 'border-box',
  },
  summaryCard: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '14px',
    padding: '16px',
    borderRadius: '26px',
    background: panelBg,
    border: `1px solid ${border}`,
    boxShadow: getTrainingPanelShadow(theme, accent),
    boxSizing: 'border-box',
  },
  eyebrow: {
    color: accent.hue,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    marginBottom: '5px',
  },
  summaryTitle: {
    color: Colors.get('mainText', theme),
    fontSize: '19px',
    lineHeight: 1.15,
    fontWeight: 950,
  },
  summaryChips: {
    display: 'flex',
    gap: '7px',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    minWidth: 0,
  },
  summaryChip: {
    minWidth: '82px',
    padding: '8px 10px',
    borderRadius: '16px',
    background: `rgba(${accent.rgb}, 0.10)`,
    border: `1px solid ${accent.ring}`,
    color: Colors.get('mainText', theme),
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    boxSizing: 'border-box',
  },
  summaryEmpty: {
    color: Colors.get('subText', theme),
    fontSize: '13px',
    fontWeight: 800,
  },
  controlsCard: {
    width: '100%',
    padding: '12px',
    borderRadius: '26px',
    background: panelBg,
    border: `1px solid ${border}`,
    boxShadow: getTrainingPanelShadow(theme, accent),
    boxSizing: 'border-box',
  },
  segmentedControl: {
    display: 'flex',
    backgroundColor: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)',
    padding: '4px',
    borderRadius: '18px',
    width: '100%',
  },
  segment: {
    flex: 1,
    padding: '10px 4px',
    borderRadius: '14px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    background: 'transparent',
    color: Colors.get('subText', theme),
    fontSize: '12px',
    fontWeight: 850,
    fontFamily: 'inherit',
  },
  activeSegment: {
    background: isLight ? '#fff' : 'rgba(255,255,255,0.10)',
    color: Colors.get('mainText', theme),
    boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
  },
  viewSwitchRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginTop: '10px',
  },
  mainContent: {
    width: '100%',
    minHeight: '300px',
    position: 'relative',
  },
  chartCard: {
    width: '100%',
    minHeight: '360px',
    padding: '22px 16px',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: getTrainingPanelShadow(theme, accent),
    background: panelBg,
    border: `1px solid ${border}`,
    backdropFilter: 'blur(16px)',
    boxSizing: 'border-box',
  },
  chartCaption: {
    marginTop: '12px',
    fontSize: '11px',
    color: Colors.get('subText', theme),
    textAlign: 'center',
    fontWeight: 750,
  },
  card: {
    width: '100%',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: getTrainingPanelShadow(theme, accent),
    backdropFilter: 'blur(10px)'
  },
  insightCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '15px',
    borderRadius: '22px',
    boxShadow: getTrainingPanelShadow(theme, accent),
    backdropFilter: 'blur(12px)',
    background: panelBg,
    border: `1px solid ${border}`,
    boxSizing: 'border-box',
  },
  insightIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: accent.hue,
    background: `rgba(${accent.rgb}, 0.11)`,
    border: `1px solid ${accent.ring}`,
    fontSize: '18px',
  },
  seedButton: {
    marginTop: '12px',
    border: 'none',
    borderRadius: '14px',
    padding: '10px 14px',
    background: theme === 'light' ? accent.hue : `linear-gradient(135deg, ${accent.hue}, #2F80ED)`,
    color: '#fff',
    fontSize: '12px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: `0 10px 24px rgba(${accent.rgb},0.24)`
  }
  });
};

export default TrainingAnaliticsMuscles;

// --- LOGIC HELPERS (Unchanged) ---
const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) return new Date();
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};

// Muscle definitions (Intact)
const muscleDefs = [
  { id: 0,  name: ['Грудь', 'Chest'],           category: 'upper' },
  { id: 1,  name: ['Плечи', 'Shoulders'],       category: 'upper' },
  { id: 2,  name: ['Широчайшие', 'Lats'],       category: 'upper' },
  { id: 3,  name: ['Бицепс', 'Biceps'],         category: 'upper' },
  { id: 4,  name: ['Трицепс', 'Triceps'],       category: 'upper' },
  { id: 5,  name: ['Трапеции', 'Traps'],        category: 'upper' },
  { id: 6,  name: ['Нижняя спина', 'Lower Back'], category: 'upper' },
  { id: 7,  name: ['Пресс', 'Abs'],             category: 'core' },
  { id: 8,  name: ['Предплечья', 'Forearms'],   category: 'upper' },
  { id: 9,  name: ['Квадрицепс', 'Quads'],      category: 'lower' },
  { id: 10, name: ['Бицепс бедра', 'Hamstrings'], category: 'lower' },
  { id: 11, name: ['Ягодицы', 'Glutes'],        category: 'lower' },
  { id: 12, name: ['Икры', 'Calves'],           category: 'lower' }
];

const muscleLoadData = (periodInDays, langIndex, now = null) => {
  const referenceDate = now || getAppToday();
  const cutoffDate = new Date(referenceDate);
  cutoffDate.setDate(cutoffDate.getDate() - periodInDays);
  const cutoffTime = cutoffDate.getTime();
  const NUM_MUSCLES = 13;
  const mgIdToIndex = {};
  muscleDefs.forEach((m, idx) => { mgIdToIndex[m.id] = idx; });
  const muscleLoads = new Array(NUM_MUSCLES).fill(0);
  const PRIMARY_SHARE = 0.7;
  const SECONDARY_TOTAL_SHARE = 0.3;

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog || {})) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;
    
    for (const session of sessions) {
      // === FIX: Правильная фильтрация типов ===
      // Пропускаем кардио и сессии без типа (старые данные)
      if (session.type !== 'GYM') continue;
      
      // Пропускаем НЕзавершенные тренировки
      if (!session?.completed) continue;
      
      for (const [exIdStr, exercise] of Object.entries(session.exercises || {})) {
        const tonnage = exercise.totalTonnage || 0;
        if (tonnage <= 0) continue;
        
        const exId = parseInt(exIdStr, 10);
        const exerciseMeta = AppData.exercises?.[exId];
        if (!exerciseMeta) continue;
        
        const primaryMgId = exerciseMeta.mgId;
        const secondaryMgIds = Array.isArray(exerciseMeta.addMgIds) 
          ? exerciseMeta.addMgIds.filter(id => id !== primaryMgId && id >= 0 && id < 13) 
          : [];
        
        // Primary muscle
        if (Number.isInteger(primaryMgId) && Object.prototype.hasOwnProperty.call(mgIdToIndex, primaryMgId)) {
          const idx = mgIdToIndex[primaryMgId];
          muscleLoads[idx] += tonnage * PRIMARY_SHARE;
        }
        
        // Secondary muscles
        if (secondaryMgIds.length > 0) {
          const sharePerSecondary = (tonnage * SECONDARY_TOTAL_SHARE) / secondaryMgIds.length;
          for (const secId of secondaryMgIds) {
            if (Object.prototype.hasOwnProperty.call(mgIdToIndex, secId)) {
              const idx = mgIdToIndex[secId];
              muscleLoads[idx] += sharePerSecondary;
            }
          }
        }
      }
    }
  }
  
  const maxLoad = Math.max(...muscleLoads);
  if (maxLoad === 0) {
    return muscleDefs.map(def => ({ 
      muscle: def.name[langIndex], 
      load: 0, 
      mgId: def.id 
    }));
  }
  
  return muscleDefs.map((def, idx) => ({
    muscle: def.name[langIndex],
    load: Math.round((muscleLoads[idx] / maxLoad) * 100),
    mgId: def.id
  }));
};

const formatDemoDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const pickExerciseForMuscle = (mgId) => {
  const entry = Object.entries(AppData.exercises || {}).find(([, exercise]) =>
    exercise?.show !== false && exercise?.mgId === mgId
  );
  return entry ? entry[0] : null;
};

const buildDemoExercise = (exId, mgId, intensity) => {
  const baseWeight = 24 + (mgId % 6) * 8 + intensity * 4;
  const sets = [
    { type: 0, reps: 12, weight: Math.max(10, baseWeight - 10), time: 55000 },
    { type: 1, reps: 10, weight: baseWeight, time: 65000 },
    { type: 1, reps: 8, weight: baseWeight + 6, time: 70000 }
  ];
  const totalTonnage = sets.reduce((sum, set) => sum + set.reps * set.weight, 0);
  return {
    exId,
    entry: {
      mgId,
      sets,
      totalTonnage,
      completed: true
    },
    totalTonnage
  };
};

const seedTrainingDemoData = async (langIndex) => {
  const today = new Date();
  const demoPlans = [
    [0, 1, 4, 7],
    [2, 3, 5, 8],
    [9, 10, 11, 12],
    [0, 2, 6, 7],
    [1, 4, 9, 12],
    [2, 3, 10, 11]
  ];

  demoPlans.forEach((muscles, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const dateKey = formatDemoDateKey(date);
    const startTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 18, 0).getTime();
    const exercises = {};
    const exerciseOrder = [];
    let tonnage = 0;

    muscles.forEach((mgId, muscleIndex) => {
      const exId = pickExerciseForMuscle(mgId);
      if (exId == null || exercises[exId]) return;
      const demoExercise = buildDemoExercise(exId, mgId, index + muscleIndex);
      exercises[exId] = demoExercise.entry;
      exerciseOrder.push(exId);
      tonnage += demoExercise.totalTonnage;
    });

    if (exerciseOrder.length === 0) return;
    const existing = AppData.trainingLog[dateKey] || [];
    AppData.trainingLog[dateKey] = existing.filter(session => !session.isDemoTrainingSeed);
    AppData.trainingLog[dateKey].push({
      type: 'GYM',
      programId: null,
      dayIndex: null,
      isFree: true,
      isDemoTrainingSeed: true,
      completed: true,
      startTime,
      endTime: startTime + 55 * 60000,
      duration: 55 * 60000,
      tonnage,
      exercises,
      exerciseOrder,
      RPE: index % 2 === 0 ? 7 : 8,
      note: langIndex === 0 ? 'Демо-данные для проверки аналитики' : 'Demo data for analytics QA'
    });
  });

  await saveData();
  return true;
};
