import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MuscleLoadRadar from './MuscleLoadRadar';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import { muscleIconComponents } from '../../../Classes/TrainingData';
import { FaChartPie, FaChild } from 'react-icons/fa';

// --- Labels ---
const periodLabels = [
  ['7 дней', '7 Days'],
  ['Месяц', 'Month'],
  ['3 Месяца', '3 Months']
];

const PERIOD_DAYS = [7, 28, 84];

const TrainingAnaliticsMuscles = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [period, setPeriod] = useState(0);
  const [viewMode, setViewMode] = useState('radar'); // 'radar' or 'body'

  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); };
  }, []);

  const [currentData, setCurrentData] = useState([]);
  useEffect(() => {
    const days = PERIOD_DAYS[period];
    setCurrentData(muscleLoadData(days, langIndex));
  }, [period, langIndex]);

  // Styles Helpers
  const isLight = theme === 'light' || theme === 'speciallight';
  const cardBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)';
  const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingBottom: '80px' }}>
      
      {/* --- Period Selector --- */}
      <div style={styles(theme).segmentedControl}>
        {periodLabels.map((label, idx) => {
            const isActive = period === idx;
            return (
                <div 
                    key={idx} onClick={() => setPeriod(idx)}
                    style={{ 
                        ...styles(theme).segment, 
                        backgroundColor: isActive ? (isLight ? '#fff' : 'rgba(255,255,255,0.1)') : 'transparent',
                        boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    <span style={{ fontSize: '12px', fontWeight: isActive ? '700' : '500', color: isActive ? Colors.get('mainText', theme) : Colors.get('subText', theme) }}>
                        {label[langIndex]}
                    </span>
                </div>
            )
        })}
      </div>

      {/* --- View Mode Switcher --- */}
      <div style={{ display: 'flex', gap: '15px' }}>
          <ViewToggle icon={<FaChartPie/>} label={langIndex===0?'Радар':'Radar'} active={viewMode==='radar'} onClick={()=>setViewMode('radar')} theme={theme}/>
          <ViewToggle icon={<FaChild/>} label={langIndex===0?'Карта тела':'Body Map'} active={viewMode==='body'} onClick={()=>setViewMode('body')} theme={theme}/>
      </div>

      {/* --- Main Content Area --- */}
      <div style={{ width: '94%', minHeight: '300px', position: 'relative' }}>
        <AnimatePresence mode="wait">
            {viewMode === 'radar' ? (
                <motion.div 
                    key="radar"
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                    style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}`, padding: '20px', alignItems: 'center', display: 'flex', flexDirection: 'column' }}
                >
                    <MuscleLoadRadar theme={theme} langIndex={langIndex} muscleLoadData={currentData} />
                    <div style={{ marginTop: '10px', fontSize: '11px', color: Colors.get('subText', theme), textAlign: 'center' }}>
                        {langIndex === 0 ? 'Распределение нагрузки по группам мышц' : 'Load distribution across muscle groups'}
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="body"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}`, padding: '20px', alignItems: 'center', display: 'flex', flexDirection: 'column' }}
                >
                    <LoadView theme={theme} langIndex={langIndex} period={period}/>
                </motion.div>
            )}
        </AnimatePresence>
      </div>

      {/* --- Insights / Recommendation --- */}
      <div style={{ width: '94%' }}>
        <Recomendation currentData={currentData} langIndex={langIndex} theme={theme} />
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const ViewToggle = ({ icon, label, active, onClick, theme }) => {
    const isLight = theme === 'light';
    const activeColor = Colors.get('currentDateBorder', theme);
    
    return (
        <motion.div 
            whileTap={{ scale: 0.95 }} onClick={onClick}
            style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
                backgroundColor: active ? activeColor : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
                color: active ? '#fff' : Colors.get('subText', theme),
                transition: 'all 0.2s ease'
            }}
        >
            {icon}
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{label}</span>
        </motion.div>
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

const Recomendation = ({ currentData, langIndex, theme }) => {
  if (!currentData || currentData.length === 0 || currentData.every(d => d.load === 0)) {
    return (
      <div style={styles(theme).insightCard}>
        <div style={{ fontSize: '20px' }}>ℹ️</div>
        <div style={{ fontSize: '13px', color: Colors.get('subText', theme) }}>
            {langIndex === 0 ? 'Недостаточно данных для анализа.' : 'Not enough data for analysis.'}
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
  let icon = '✅';
  let isWarning = false;

  if (highLoadMuscles.length === 0 && lowLoadMuscles.length === 0 && skippedMuscles.length === 0) {
    message = langIndex === 0 ? 'Ваша нагрузка сбалансирована. Отличная работа!' : 'Your training is well-balanced. Great job!';
  } else {
    isWarning = true;
    icon = '⚖️';
    const parts = [];
    if (highLoadMuscles.length > 0) parts.push(langIndex === 0 ? `Высокая нагрузка: ${highLoadMuscles.join(', ')}.` : `High load: ${highLoadMuscles.join(', ')}.`);
    if (lowLoadMuscles.length > 0) parts.push(langIndex === 0 ? `Низкая нагрузка: ${lowLoadMuscles.join(', ')}.` : `Low load: ${lowLoadMuscles.join(', ')}.`);
    if (skippedMuscles.length > 0 && skippedMuscles.length <= 5) parts.push(langIndex === 0 ? `Пропущено: ${skippedMuscles.join(', ')}.` : `Missed: ${skippedMuscles.join(', ')}.`);
    message = parts.join(' ');
  }

  return (
    <div style={{ 
        ...styles(theme).insightCard, 
        borderLeft: isWarning ? '4px solid #FFB74D' : '4px solid #66BB6A',
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,30,0.6)'
    }}>
      <div style={{ fontSize: '24px' }}>{icon}</div>
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
const styles = (theme) => ({
  segmentedControl: {
    display: 'flex', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    padding: '4px', borderRadius: '16px', width: '90%', maxWidth: '350px'
  },
  segment: {
    flex: 1, padding: '8px 0', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s'
  },
  card: {
    width: '88%', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)'
  },
  insightCard: {
    display: 'flex', alignItems: 'start', gap: '15px', padding: '15px', borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)', backdropFilter: 'blur(10px)'
  }
});

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
      if (!session?.completed || session.type !== 'GYM') continue;
      for (const [exIdStr, exercise] of Object.entries(session.exercises)) {
        const tonnage = exercise.totalTonnage || 0;
        if (tonnage <= 0) continue;
        const exId = parseInt(exIdStr, 10);
        const exerciseMeta = AppData.exercises?.[exId];
        if (!exerciseMeta) continue;
        const primaryMgId = exerciseMeta.mgId;
        const secondaryMgIds = Array.isArray(exerciseMeta.addMgIds) ? exerciseMeta.addMgIds.filter(id => id !== primaryMgId && id >= 0 && id < 13) : [];
        if (Number.isInteger(primaryMgId) && mgIdToIndex.hasOwnProperty(primaryMgId)) {
          const idx = mgIdToIndex[primaryMgId];
          muscleLoads[idx] += tonnage * PRIMARY_SHARE;
        }
        if (secondaryMgIds.length > 0) {
          const sharePerSecondary = (tonnage * SECONDARY_TOTAL_SHARE) / secondaryMgIds.length;
          for (const secId of secondaryMgIds) {
            if (mgIdToIndex.hasOwnProperty(secId)) {
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
    return muscleDefs.map(def => ({ muscle: def.name[langIndex], load: 0, mgId: def.id }));
  }
  return muscleDefs.map((def, idx) => ({
    muscle: def.name[langIndex],
    load: Math.round((muscleLoads[idx] / maxLoad) * 100),
    mgId: def.id
  }));
};
