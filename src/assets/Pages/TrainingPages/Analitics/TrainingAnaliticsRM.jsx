import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import { MuscleIcon } from '../../../Classes/TrainingData';
import WeekSparkline from './MiniChart';
import TrainingMetrics from './TrainingMetrics';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';

const TrainingAnaliticsRM = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showBarChart, setShowBarChart] = useState(false);
  const [currentExId, setCurrentExId] = useState(-1);

  // Subscriptions
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe();
    };
  }, []);

  // --- Styles Helper ---
  const isLight = theme === 'light' || theme === 'speciallight';
  const cardBg = isLight ? 'rgba(255,255,255,0.8)' : 'rgba(30,30,30,0.6)';
  const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '80px' }}>
      
      {/* Exercise List */}
      <AnimatePresence>
        {Object.entries(AppData.exercises)
          .filter(([_, exercise]) => exercise.rm > 0 && exercise.show)
          .map(([idStr, exercise], i) => {
            const id = Number(idStr);
            const sparkColor = getSparclineColor(id, theme);
            const diff = getDiffrense(id);
            const diffValue = parseInt(diff.replace(/[^0-9-]/g, '')) || 0;
            const isPositive = diff.includes('▴');

            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => { setCurrentExId(id); setShowBarChart(true); }}
                style={{
                  ...styles(theme).card,
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Left: Icon & Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                  <div style={styles(theme).iconBox}>
                    {MuscleIcon.getForList(exercise.mgId, langIndex, theme)}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ ...styles(theme, fSize).text, fontWeight: '700' }}>
                      {exercise.name[langIndex]}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '13px', color: Colors.get('subText', theme) }}>1RM:</span>
                      <span style={{ fontSize: '16px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
                        {exercise.rm} <span style={{ fontSize: '11px', fontWeight: 'normal' }}>kg</span>
                      </span>
                      
                      {/* Diff Badge */}
                      {diff && (
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '2px', padding: '2px 6px', borderRadius: '6px',
                          backgroundColor: isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                          color: isPositive ? '#4CAF50' : '#F44336', fontSize: '11px', fontWeight: 'bold'
                        }}>
                          {isPositive ? <FaArrowUp size={8}/> : <FaArrowDown size={8}/>}
                          {Math.abs(diffValue)}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: Colors.get('subText', theme), marginTop: '2px', opacity: 0.6 }}>
                      {exercise.rmDate}
                    </div>
                  </div>
                </div>

                {/* Right: Sparkline */}
                <div style={{ width: '80px', height: '40px', opacity: 0.8 }}>
                  <WeekSparkline values={getSparclineData(id)} color={sparkColor} />
                </div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* Metrics Modal */}
      
        {showBarChart && (
          <TrainingMetrics id={currentExId} closePanel={setShowBarChart} />
        )}
     
    </div>
  );
};

// --- LOGIC (Intact) ---
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
    for (const session of sessions) {
      if (!session.completed) continue;
      const exercise = session.exercises?.[exerciseId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;
      for (const set of exercise.sets) {
        if (set.reps > 0 && set.weight > 0) {
          const epleyRM = set.weight * (1 + set.reps / 30);
          sets.push({ date: sessionDate, weight: set.weight, reps: set.reps, estimated1RM: epleyRM, timestamp: sessionDate.getTime() });
        }
      }
    }
  }
  return sets.sort((a, b) => a.timestamp - b.timestamp);
};

const getSparclineData = (exerciseId) => {
  const sets = getExerciseSetsInPeriod(exerciseId, 28);
  if (sets.length === 0) return [0];
  const recent = sets.slice(-6).map(s => s.estimated1RM);
  if (recent.length === 1) return [recent[0], recent[0]];
  return recent;
};

const getDiffrense = (exerciseId) => {
  const currentRM = AppData.exercises?.[exerciseId]?.rm || 0;
  if (currentRM <= 0) return '';
  const sets = getExerciseSetsInPeriod(exerciseId, 365);
  if (sets.length === 0) return '';
  const bestEstimated = Math.max(...sets.map(s => s.estimated1RM));
  const diff = bestEstimated - currentRM;
  const roundedDiff = Math.round(diff);
  if (roundedDiff === 0) return '';
  return `${roundedDiff > 0 ? '▴' : '▾'} ${Math.abs(roundedDiff)}`;
};

const getSparclineColor = (exerciseId, theme) => {
  const data = getSparclineData(exerciseId);
  if (data.length < 2 || data.every(v => v === 0)) return Colors.get('subText', theme);
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first * 1.02) return Colors.get('light', theme);
  if (last < first * 0.98) return Colors.get('heavy', theme);
  return Colors.get('medium', theme);
};

// --- STYLES ---
const styles = (theme, fSize) => ({
  card: {
    display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    width: '90%', padding: '15px', borderRadius: '20px', marginBottom: '12px',
    boxShadow: theme === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 15px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)', cursor: 'pointer', transition: 'all 0.2s ease'
  },
  text: {
    fontSize: fSize === 0 ? '15px' : '17px', color: Colors.get('mainText', theme),
    lineHeight: '1.2', marginBottom: '2px'
  },
  iconBox: {
    width: '45px', height: '45px', borderRadius: '14px',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  }
});

export default TrainingAnaliticsRM;
