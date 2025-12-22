import MuscleLoadRadar from './MuscleLoadRadar';
import React, { useState, useEffect } from 'react';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import {muscleIconComponents} from '../../../Classes/TrainingData'

// --- Labels ---
const labels = [
  ['7 дней', '7 days'],
  ['месяц', 'month'],
  ['три месяца', 'three months']
];

const PERIOD_DAYS = [7, 28, 84];

// === HELPERS ===
const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) return new Date(); // fallback to today
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};

// Muscle definitions with category for ordering
const muscleDefs = [
  // Upper Body (in display order)
  { id: 0,  name: ['Грудь', 'Chest'],           category: 'upper' },
  { id: 1,  name: ['Плечи', 'Shoulders'],       category: 'upper' },
  { id: 2,  name: ['Широчайшие', 'Lats'],       category: 'upper' },
  { id: 3,  name: ['Бицепс', 'Biceps'],         category: 'upper' },
  { id: 4,  name: ['Трицепс', 'Triceps'],       category: 'upper' },
  { id: 5,  name: ['Трапеции', 'Traps'],        category: 'upper' },
  { id: 6,  name: ['Нижняя спина', 'Lower Back'], category: 'upper' },
  { id: 7,  name: ['Пресс', 'Abs'],             category: 'core' },
  { id: 8,  name: ['Предплечья', 'Forearms'],   category: 'upper' },
  // Lower Body
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
  muscleDefs.forEach((m, idx) => {
    mgIdToIndex[m.id] = idx;
  });

  const muscleLoads = new Array(NUM_MUSCLES).fill(0);

  const PRIMARY_SHARE = 0.7;
  const SECONDARY_TOTAL_SHARE = 0.3;

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog || {})) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;

    for (const session of sessions) {
      if (!session?.completed) continue;

      for (const [exIdStr, exercise] of Object.entries(session.exercises)) {
        const tonnage = exercise.totalTonnage || 0;
        if (tonnage <= 0) continue;

        const exId = parseInt(exIdStr, 10);
        const exerciseMeta = AppData.exercises?.[exId];
        if (!exerciseMeta) continue;

        const primaryMgId = exerciseMeta.mgId;
        const secondaryMgIds = Array.isArray(exerciseMeta.addMgIds)
          ? exerciseMeta.addMgIds.filter(id => id !== primaryMgId && id >= 0 && id < 13)
          : [];

        // Primary
        if (Number.isInteger(primaryMgId) && mgIdToIndex.hasOwnProperty(primaryMgId)) {
          const idx = mgIdToIndex[primaryMgId];
          muscleLoads[idx] += tonnage * PRIMARY_SHARE;
        }

        // Secondary
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

const Recomendation = ({ currentData, langIndex, theme }) => {
  if (!currentData || currentData.length === 0 || currentData.every(d => d.load === 0)) {
    const noDataText = langIndex === 0 ? 'Недостаточно данных для анализа.' : 'Not enough data for analysis.';
    return (
      <div style={{
        fontSize: '10px',
        color: Colors.get('subText', theme),
        marginTop: 4,
        padding: '8px 12px',
        backgroundColor: Colors.get('bottomPanel', theme),
        borderRadius: '8px',
        border: `1px solid ${Colors.get('border', theme)}`,
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px'
      }}>
        {noDataText}
      </div>
    );
  }

  const maxLoad = Math.max(...currentData.map(d => d.load));
  if (maxLoad === 0) return null;

  const HIGH_THRESHOLD = 85;
  const LOW_THRESHOLD = 25;

  const highLoadMuscles = currentData
    .filter(d => d.load >= HIGH_THRESHOLD)
    .map(d => d.muscle);

  const lowLoadMuscles = currentData
    .filter(d => d.load <= LOW_THRESHOLD && d.load > 0)
    .map(d => d.muscle);

  const skippedMuscles = currentData
    .filter(d => d.load === 0)
    .map(d => d.muscle);

  let message = '';
  let icon = '✅';
  let bgColor = Colors.get('bottomPanel', theme);
  let borderColor = Colors.get('border', theme);
  let textColor = Colors.get('mainText', theme);

  if (langIndex === 0) {
    if (highLoadMuscles.length === 0 && lowLoadMuscles.length === 0 && skippedMuscles.length === 0) {
      message = 'Ваша нагрузка сбалансирована. Отличная работа!';
      bgColor = 'rgba(33, 150, 243, 0.15)';
      borderColor = 'rgba(33, 150, 243, 0.4)';
      textColor = '#2196f3';
    } else {
      const parts = [];
      if (highLoadMuscles.length > 0) {
        parts.push(`Вы сильно нагружаете: ${highLoadMuscles.join(', ')}.`);
      }
      if (lowLoadMuscles.length > 0) {
        parts.push(`Слабо нагружены: ${lowLoadMuscles.join(', ')}.`);
      }
      if (skippedMuscles.length > 0 && skippedMuscles.length <= 5) {
        parts.push(`Не тренировались: ${skippedMuscles.join(', ')}.`);
      }
      message = parts.join(' ');
      if (highLoadMuscles.length > 0 && (lowLoadMuscles.length > 0 || skippedMuscles.length > 0)) {
        message += ' Рассмотрите возможность балансировки программы.';
      }
      icon = '⚠️';
      bgColor = 'rgba(255, 152, 0, 0.15)';
      borderColor = 'rgba(255, 152, 0, 0.4)';
      textColor = '#ff9800';
    }
  } else {
    if (highLoadMuscles.length === 0 && lowLoadMuscles.length === 0 && skippedMuscles.length === 0) {
      message = 'Your training is well-balanced. Great job!';
      bgColor = 'rgba(33, 150, 243, 0.15)';
      borderColor = 'rgba(33, 150, 243, 0.4)';
      textColor = '#2196f3';
    } else {
      const parts = [];
      if (highLoadMuscles.length > 0) {
        parts.push(`You heavily train: ${highLoadMuscles.join(', ')}.`);
      }
      if (lowLoadMuscles.length > 0) {
        parts.push(`Under-trained: ${lowLoadMuscles.join(', ')}.`);
      }
      if (skippedMuscles.length > 0 && skippedMuscles.length <= 5) {
        parts.push(`Not trained: ${skippedMuscles.join(', ')}.`);
      }
      message = parts.join(' ');
      if (highLoadMuscles.length > 0 && (lowLoadMuscles.length > 0 || skippedMuscles.length > 0)) {
        message += ' Consider balancing your program.';
      }
      icon = '⚠️';
      bgColor = 'rgba(255, 152, 0, 0.15)';
      borderColor = 'rgba(255, 152, 0, 0.4)';
      textColor = '#ff9800';
    }
  }

  return (
    <div style={{
      fontSize: '10px',
      color: textColor,
      marginTop: 4,
      padding: '8px 12px',
      backgroundColor: bgColor,
      borderRadius: '8px',
      border: `1px solid ${borderColor}`,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '8px',
      transition: 'all 0.2s ease',
      cursor: 'default',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '400px'
    }}>
      <span style={{ fontWeight: 'bold', fontSize: '14px', lineHeight: '1' }}>{icon}</span>
      <span style={{ flex: 1, lineHeight: '1.4' }}>{message}</span>
    </div>
  );
};

const styles = (theme, fSize) => ({
  textToggles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 0',
    width: '100%',
    maxWidth: '400px',
    userSelect: 'none'
  }
});

const TrainingAnaliticsMuscles = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [period, setPeriod] = useState(0);

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

  const [currentData, setCurrentData] = useState([]);
  useEffect(() => {
    const days = PERIOD_DAYS[period];
    setCurrentData(muscleLoadData(days, langIndex));
  }, [period, langIndex]);

  return (
    <div style={{ width: '100%', display: 'flex', height: '90%', alignItems: 'center', justifyContent: 'space-around', flexDirection: 'column', padding: '0 8px' }}>
      <div style={styles(theme, fSize).textToggles}>
        {labels.map(([ru, en], key) => (
          <React.Fragment key={key}>
            <span
              onClick={() => setPeriod(key)}
              style={{
                padding: '6px 8px',
                cursor: 'pointer',
                fontSize: period === key
                  ? (fSize === 0 ? '12px' : '14px')
                  : (fSize === 0 ? '10px' : '12px'),
                fontWeight: period === key ? '600' : '400',
                color: period === key
                  ? Colors.get('mainText', theme)
                  : Colors.get('subText', theme),
                opacity: period === key ? 1 : 0.8,
                transition: 'all 0.2s ease'
              }}
            >
              {langIndex === 0 ? ru : en}
            </span>
            {key < 2 && (
              <span style={{
                margin: '0 6px',
                color: Colors.get('border', theme),
                fontSize: fSize === 0 ? '12px' : '14px'
              }}>
                |
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      <MuscleLoadRadar theme={theme} langIndex={langIndex} muscleLoadData={currentData} />
      <Recomendation currentData={currentData} langIndex={langIndex} theme={theme} />
      
      <div style={{ fontSize: '10px', color: Colors.get('subText', theme), marginTop: 4 }}>
        {langIndex === 0 ? 'Загрузка мышц за выбранный период' : 'Muscle load for selected period'}
      </div>
      
      <LoadView theme={theme} langIndex={langIndex} period={period}/>
    </div>
  );
};

export default TrainingAnaliticsMuscles;

const LoadView = ({ theme, langIndex, period = 0 }) => {
  console.log('Full_11 type:', typeof muscleIconComponents[1][1]);
  const genderIndex = AppData.pData.gender;
  const baseSrc = genderIndex === 0 
    ? 'images/BodyIcons/Full.png' 
    : 'images/BodyIcons/Fullf.png';

  const [muscleLoadMap, setMuscleLoadMap] = useState({});

  useEffect(() => {
    const days = PERIOD_DAYS[period] || 7;
    const loadData = muscleLoadData(days, langIndex);
    const map = {};
    loadData.forEach(item => {
      map[item.mgId] = item.load;
    });
    setMuscleLoadMap(map);
  }, [period, langIndex]);

  const getTrueColor = (loadPercent) => {
    if (loadPercent >= 85) return '#ff5252'; // red
    if (loadPercent >= 50) return '#ff9800'; // amber
    if (loadPercent >= 25) return '#4caf50'; // green
    return '#2196f3'; // blue
  };

  const allMuscleIds = Array.from({ length: 13 }, (_, i) => i);

  const periodLabels = [
    ['7 дней', '7 days'],
    ['месяц', 'month'],
    ['три месяца', 'three months']
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '45vw', margin: '2%' }}>
      
      
      <div style={{ position: 'relative', width: '40vw', height: '40vw' }}>
        {/* Base body — keep as PNG */}
        <img
          src={baseSrc}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          alt="Body base"
        />

        {/* SVG muscle overlays — with safety check */}
        {allMuscleIds.map(mgId => {
          const loadPercent = muscleLoadMap[mgId] ?? 0;
          const IconComponent = muscleIconComponents[genderIndex]?.[mgId];
          
          // 🔒 Safety: skip if not a valid component
          if (!IconComponent || typeof IconComponent !== 'function') {
            console.warn(`Missing or invalid SVG component for muscle group ${mgId}, gender ${genderIndex}`);
            return null;
          }

          const color = getTrueColor(loadPercent);

          return (
            <IconComponent
              key={`muscle-${mgId}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                color: color,
                opacity: loadPercent === 0 ? 0.3 : 1,
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '6px',
        fontSize: '8px',
        color: Colors.get('subText', theme),
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <span>🔴 {langIndex === 0 ? 'Перегрузка' : 'Overtrained'}</span>
        <span>🟡 {langIndex === 0 ? 'Норма' : 'Trained'}</span>
        <span>🟢 {langIndex === 0 ? 'Слабо' : 'Under-trained'}</span>
        <span>🔵 {langIndex === 0 ? 'Нет' : 'None'}</span>
      </div>
    </div>
  );
};