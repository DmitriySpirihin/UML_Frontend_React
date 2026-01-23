import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../../StaticClasses/AppData.js';
import Colors from '../../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus.js';
import MyBChart from './MyBarChart.jsx';
import ProgressCircle from '../../../Helpers/ProgressCircle.jsx';
import { MdClose } from 'react-icons/md';
import RecomendationTraining from '../../../Helpers/RecomendationTraining.jsx';

const labels = [['Месяц', 'Month'], ['Полгода', '6 Months'], ['Год', 'Year']];
const PERIOD_DAYS = [28, 180, 360];

const TrainingMetrics = ({ id, closePanel }) => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  // eslint-disable-next-line no-unused-vars
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [period, setPeriod] = useState(0); 
  const [data, setData] = useState([]);

  useEffect(() => {
    const s1 = theme$.subscribe(setThemeState);
    const s2 = lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1));
    const s3 = fontSize$.subscribe(setFSize);
    return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
  }, []);

  useEffect(() => {
    const days = PERIOD_DAYS[period];
    setData(getRealExerciseData(id, days));
  }, [id, period]);

  const isLight = theme === 'light';
  // Darker, richer backgrounds for better glow contrast
  const panelBg = isLight ? '#eef2f7' : '#09090b'; 
  const textColor = isLight ? '#1a1a1a' : '#ffffff';
  const accentColor = '#00BBFF'; // Neon blue accent for UI elements

  return (
    <div style={styles(theme).backdrop} onClick={() => closePanel(false)}>
      <motion.div
        initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        style={{ ...styles(theme).panel, backgroundColor: panelBg }}
        onClick={(e) => e.stopPropagation()}
      >

        <div style={styles(theme).header}>
            {/* Modern notch drag handle */}
            <div style={styles(theme).dragHandle} />
            <div style={styles(theme).closeBtn} onClick={() => closePanel(false)}>
                <MdClose size={20} color={textColor} />
            </div>
        </div>

        <h3 style={{ margin: '10px 0 25px 0', fontSize: '22px', fontWeight: '800', color: textColor, textAlign: 'center', letterSpacing: '-0.5px' }}>
            {langIndex === 0 ? 'Аналитика' : 'Analytics'}
        </h3>

        {/* --- Futuristic Segmented Control --- */}
        <div style={styles(theme).segmentedControlWrapper}>
            {labels.map((label, idx) => {
                const isActive = period === idx;
                return (
                    <div 
                        key={idx} onClick={() => setPeriod(idx)}
                        style={segmentedStyle(isActive, isLight, accentColor)}
                    >
                        {label[langIndex]}
                        {/* Active tab bottom glow indicator */}
                        {isActive && <motion.div layoutId="tabGlow" style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '3px', borderRadius:'2px', backgroundColor: accentColor, boxShadow: `0 -1px 8px ${accentColor}` }} />}
                    </div>
                )
            })}
        </div>

        {/* --- Main Content Area --- */}
        <div style={{ width: '100%', flex: 1, overflowY: 'auto', padding: '20px 0' }}>
             {/* Chart Section */}
             <div style={{ width: '100%', marginBottom: '30px' }}>
                <MyBChart 
                    theme={theme} langIndex={langIndex} data={data} height={260}
                />
            </div>

            {/* Cards Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', width: '100%', paddingBottom: '40px' }}>
                {data.length > 0 ? (
                    <>
                        {/* Progress Circle Card - Now with a colored glow background */}
                        <div style={neonCardStyle(isLight, accentColor)}>
                            {/* Subtle background gradient flare */}
                            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 30%, ${accentColor}15, transparent 60%)`, zIndex: 0 }} />
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                <ProgressCircle 
                                    startValue={data[0].oneRepMax} 
                                    endValue={data[data.length - 1].oneRepMax} 
                                    mediumValue={getMediumValue(data)} 
                                    unit="kg" langIndex={langIndex} size={220}
                                    textColor={textColor}
                                    // Pass vibrant theme colors if needed, otherwise defaults work well
                                />
                            </div>
                        </div>
                        
                        {/* Recommendation Card */}
                        <div style={neonCardStyle(isLight, isLight ? '#10B981' : '#00FF99')}>
                             <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                                <RecomendationTraining max={data[data.length - 1].oneRepMax} />
                            </div>
                        </div>
                    </>
                ) : (
                    <div style={emptyStateStyle(isLight)}>
                        {langIndex === 0 ? 'Нет данных за этот период' : 'No data for this period'}
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
};

// --- Styles ---

// Dynamic styles functions for cleaner JSX
const segmentedStyle = (isActive, isLight, accent) => ({
    flex: 1, padding: '10px 0', textAlign: 'center', cursor: 'pointer', position: 'relative',
    fontSize: '13px', fontWeight: isActive ? '700' : '600',
    color: isActive ? (isLight ? '#000' : '#fff') : (isLight ? '#666' : '#888'),
    transition: 'color 0.3s',
    textShadow: isActive ? `0 0 15px ${accent}60` : 'none'
});

const neonCardStyle = (isLight, glowColor) => ({
    width: '92%', padding: '25px', borderRadius: '30px',
    backgroundColor: isLight ? '#ffffff' : '#121214',
    // The key to the "modern attractive" look: soft colored shadow glow
    boxShadow: isLight 
        ? `0 10px 30px -10px rgba(0,0,0,0.1), 0 0 20px -5px ${glowColor}20`
        : `0 20px 40px -20px #000000, 0 0 30px -10px ${glowColor}30`,
    border: isLight ? '1px solid #f0f0f0' : '1px solid #ffffff0d',
    position: 'relative', overflow: 'hidden',
    display: 'flex', justifyContent: 'center', alignItems: 'center'
});

const emptyStateStyle = (isLight) => ({
    padding: '60px 20px', color: isLight ? '#999' : '#666', fontSize: '15px', fontWeight: '500',
    fontStyle: 'italic', background: isLight ? '#f9f9f9' : '#ffffff05', borderRadius: '20px', width: '90%', textAlign: 'center'
});


const styles = (theme) => ({
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 5000,
    backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.6)', // Lighter backdrop for modern feel
    backdropFilter: 'blur(8px)', // Stronger blur
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
  },
  panel: {
    width: '100%', maxWidth: '600px', height: '90vh',
    borderTopLeftRadius: '36px', borderTopRightRadius: '36px', // Rounder corners
    padding: '0', display: 'flex', flexDirection: 'column', alignItems: 'center',
    position: 'relative', 
    overflow: 'hidden'
  },
  header: {
    width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center',
    position: 'relative', padding: '15px 20px 0 20px'
  },
  dragHandle: {
    width: '50px', height: '5px', backgroundColor: theme === 'light' ? '#ddd' : '#ffffff30',
    borderRadius: '10px'
  },
  closeBtn: {
    position: 'absolute', right: '25px', top: '20px',
    padding: '8px', borderRadius: '50%', backgroundColor: theme === 'light' ? '#f0f0f0' : '#ffffff10',
    cursor: 'pointer', transition: 'background-color 0.2s',
    backdropFilter: 'blur(5px)'
  },
  segmentedControlWrapper: {
    display: 'flex', 
    backgroundColor: theme === 'light' ? '#f2f4f7' : '#1c1c1e',
    padding: '4px', borderRadius: '20px', width: '90%', maxWidth: '380px',
    boxShadow: theme === 'light' ? 'inset 0 2px 4px rgba(0,0,0,0.05)' : 'inset 0 2px 4px rgba(0,0,0,0.2)',
    marginBottom: '10px'
  },
});

// --- Logic Helpers (Kept intact) ---
const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) return new Date();
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};

const getRealExerciseData = (exId, periodDays) => {
  if (!AppData.trainingLog || !AppData.exercises[exId]) return [];
  const now = getAppToday();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffTime = cutoff.getTime();
  const dailyData = {};

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog)) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;
    for (const session of sessions) {
      if (!session.completed) continue;
      const exercise = session.exercises?.[exId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;
      let sessionTonnage = 0;
      let bestEstimated1RM = 0;
      for (const set of exercise.sets) {
        if (typeof set.reps !== 'number' || typeof set.weight !== 'number') continue;
        if (set.reps <= 0 || set.weight <= 0) continue;
        sessionTonnage += set.weight * set.reps;
        const epley1RM = set.weight * (1 + set.reps / 30);
        if (epley1RM > bestEstimated1RM) bestEstimated1RM = epley1RM;
      }
      if (sessionTonnage > 0 || bestEstimated1RM > 0) {
        if (!dailyData[dateStr]) dailyData[dateStr] = { date: dateStr, tonnage: 0, oneRepMax: 0 };
        dailyData[dateStr].tonnage += sessionTonnage;
        if (bestEstimated1RM > dailyData[dateStr].oneRepMax) dailyData[dateStr].oneRepMax = bestEstimated1RM;
      }
    }
  }
  const result = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  return result.map(item => ({ date: item.date, tonnage: Math.round(item.tonnage/10), oneRepMax: Math.round(item.oneRepMax) }));
};

const getMediumValue = (data) => {
  if (data.length === 0) return 0;
  const sum = data.reduce((a, b) => a + b.oneRepMax, 0);
  return sum / data.length;
};

export default TrainingMetrics;