import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$ } from '../../../StaticClasses/HabitsBus';
import LoadDonut from './LoadDonut';
import { VolumeTabs } from '../../../Helpers/TrainingAnaliticsTabs';
import TrainingAnaliticsMuscles from './TrainingAnaliticsMuscles';
import TrainingAnaliticsRM from './TrainingAnaliticsRM';
import { FaInfoCircle, FaLock, FaTrophy } from "react-icons/fa";
import { MdClose } from 'react-icons/md';

const TrainingAnaliticsMain = () => {
  // --- STATE (Logic Intact) ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [tab, setTab] = React.useState('volume');
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  // eslint-disable-next-line no-unused-vars
  const [date, setDate] = useState(new Date()); 
  const [targetTonnage, setTargetTonnage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [donutData, setDonutData] = useState([{ value: 0 }, { value: 0 }, { value: 0 }]);
  const [totalTonnage, setTotalTonnage] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  // --- SUBSCRIPTIONS ---
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    const sub4 = premium$.subscribe(setHasPremium);
    return () => {
      sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); sub4.unsubscribe();
    };
  }, []);

  // --- CALCULATION EFFECT ---
  useEffect(() => {
    const analysis = getCurrentCycleAnalysis();
    const { currentCycle, currentTonnage } = analysis;

    const loadRange = getLoadRange();
    let light = 0, medium = 0, heavy = 0;

    currentCycle.forEach(session => {
      const load = session.tonnage / (session.duration / 60000);
      if (load < loadRange.min) light++;
      else if (load <= loadRange.max) medium++;
      else heavy++;
    });
    
    setTargetTonnage(analysis.targetTonnage);
    setProgressPercent(analysis.progressPercent);
    setDonutData([{ value: light }, { value: medium }, { value: heavy }]);
    setTotalTonnage(currentTonnage);
    setSessionCount(currentCycle.length);
  }, []);

  // --- RENDER HELPERS ---
  const isLight = theme === 'light' || theme === 'speciallight';
  const cardBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)';
  const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={styles(theme).container}>
      <VolumeTabs type={0} theme={theme} langIndex={langIndex} activeTab={tab} onChange={setTab} />

      <div style={{ flex: 1, width: '100%', maxWidth: '600px', position: 'relative', overflowY: 'auto', paddingBottom: '100px' }}>
        <AnimatePresence mode="wait">
          
          {/* === VOLUME TAB === */}
          {tab === 'volume' && (
            <motion.div
              key="volume"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px' }}
            >
              {/* Card 1: Cycle Distribution */}
              <div style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <div style={styles(theme).cardHeader}>
                  <span style={styles(theme, fSize).headerTitle}>{langIndex === 0 ? 'Текущий цикл' : 'Current Cycle'}</span>
                  <div style={styles(theme).badge}>{sessionCount} {langIndex === 0 ? 'сессий' : 'sessions'}</div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                  {Object.keys(AppData.trainingLog).length > 1 ? (
                    <LoadDonut data={donutData} theme={theme} totalTonnage={totalTonnage} sessionCount={sessionCount} langIndex={langIndex} />
                  ) : (
                    <div style={{ padding: '40px', color: Colors.get('subText', theme), fontSize: '14px' }}>
                      {langIndex === 0 ? 'Нет данных' : 'No data available'}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: Tonnage Target */}
              <div style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                <Tonnage 
                  theme={theme} 
                  langIndex={langIndex} 
                  totalTonnage={totalTonnage} 
                  targetTonnage={targetTonnage} 
                  progressPercent={progressPercent} 
                />
                <div style={{ padding: '0 20px 20px 20px' }}>
                   <InfoText theme={theme} langIndex={langIndex} />
                </div>
              </div>
            </motion.div>
          )}

          {/* === MUSCLES TAB === */}
          {tab === 'muscles' && (
            <motion.div
              key="muscles"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ padding: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '0 10px' }}>
                <span style={styles(theme, fSize).sectionTitle}>{langIndex === 0 ? 'Загрузка мышц' : 'Muscle Load'}</span>
                <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowInfo(true)} style={{ cursor: 'pointer', opacity: 0.7 }}>
                  <FaInfoCircle size={18} color={Colors.get('mainText', theme)} />
                </motion.div>
              </div>
              <TrainingAnaliticsMuscles />
            </motion.div>
          )}

          {/* === EXERCISES TAB === */}
          {tab === 'exercises' && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ padding: '10px' }}
            >
              <TrainingAnaliticsRM />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- PREMIUM LOCK --- */}
      {!hasPremium && (
        <div 
                            onClick={(e) => e.stopPropagation()} 
                            style={{
                                position: 'absolute', inset: 0, zIndex: 2,
                                display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                                backdropFilter: 'blur(5px)',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                                {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                            </div>
                        </div>
      )}

      {/* --- INFO MODAL --- */}
      <AnimatePresence>
        {showInfo && (
          <div style={styles(theme).modalBackdrop} onClick={() => setShowInfo(false)}>
            <motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }}
              style={styles(theme).modalContainer} onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: Colors.get('mainText', theme), fontSize: '18px' }}>Info</h3>
                <MdClose size={24} color={Colors.get('subText', theme)} onClick={() => setShowInfo(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={styles(theme, fSize).infoContent}>{infoText(langIndex)}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- MODERN SUB-COMPONENT: TONNAGE STATS ---
const Tonnage = ({ theme, langIndex, totalTonnage, targetTonnage, progressPercent }) => {
  const isCompleted = progressPercent >= 100;
  const accentColor = isCompleted ? '#4ADE80' : Colors.get('iconsHighlited', theme);

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: Colors.get('subText', theme), letterSpacing: '1px', marginBottom: '10px' }}>
        {langIndex === 0 ? 'Цель Цикла' : 'Cycle Target'}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '5px' }}>
        <span style={{ fontSize: '48px', fontWeight: '900', color: accentColor, lineHeight: '1', letterSpacing: '-1px' }}>
          {(targetTonnage / 1000).toFixed(1)}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>
          {langIndex === 0 ? 'т' : 't'}
        </span>
      </div>

      {isCompleted && (
        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4ADE80', marginTop: '-5px', marginBottom: '10px' }}>
          + {((totalTonnage - targetTonnage) / 1000).toFixed(1)} {langIndex === 0 ? 'т' : 't'}
        </div>
      )}

      {/* Progress Bar Container */}
      <div style={{ width: '100%', height: '8px', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', borderRadius: '4px', margin: '15px 0', overflow: 'hidden' }}>
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${Math.min(progressPercent, 100)}%` }} 
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', backgroundColor: accentColor, borderRadius: '4px' }}
        />
      </div>

      <div style={{ fontSize: '13px', color: Colors.get('subText', theme) }}>
        {progressPercent > 0 ? (
          <>
            {langIndex === 0 ? 'Выполнено: ' : 'Done: '} 
            <span style={{ color: Colors.get('mainText', theme), fontWeight: 'bold' }}>{Math.round(progressPercent)}%</span>
            {!isCompleted && (
                <span style={{ opacity: 0.7 }}>
                    {' • '}{langIndex === 0 ? 'осталось ' : 'left '}{((targetTonnage - totalTonnage) / 1000).toFixed(1)}
                </span>
            )}
          </>
        ) : (
           langIndex === 0 ? `Реком. объём: ${(getNeededTonnage() / 1000).toFixed(1)} т` : `Suggested: ${(getNeededTonnage() / 1000).toFixed(1)} t`
        )}
      </div>

      {isCompleted && (
        <div style={styles(theme).successBadge}>
          <FaTrophy size={12} /> {langIndex === 0 ? 'Достигнуто' : 'Achieved'}
        </div>
      )}
    </div>
  );
};

const InfoText = ({ theme, langIndex }) => {
  const textContent = langIndex === 0
    ? `Анализ цикла основан на последней программе.\n\nОбъём = сумма тоннажа всех сессий.\nЦель = прошлый цикл × 1.05.\n\nТоннаж = вес × повторения.`
    : `Cycle analysis based on latest program.\n\nVolume = sum of all session tonnage.\nTarget = last cycle × 1.05.\n\nTonnage = weight × reps.`;

  return (
    <div style={{ 
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', 
        borderRadius: '12px', padding: '12px', fontSize: '11px', color: Colors.get('subText', theme), 
        lineHeight: '1.5', whiteSpace: 'pre-wrap', textAlign: 'left'
    }}>
      {textContent}
    </div>
  );
};

// --- STYLES ---
const styles = (theme, fSize) => ({
  container: {
    display: 'flex', width: "100vw", flexDirection: 'column',
    overflowY: 'scroll', overflowX: 'hidden', justifyContent: "flex-start", alignItems: 'center',
    backgroundColor: Colors.get('background', theme), height: "90vh",marginTop:'90px', top: '16vh', paddingTop: '10px'
  },
  card: {
    borderRadius: '24px', overflow: 'hidden',
    boxShadow: theme === 'light' ? '0 4px 15px rgba(0,0,0,0.03)' : '0 10px 30px rgba(0,0,0,0.2)',
    backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
  },
  cardHeader: {
    padding: '15px 20px', borderBottom: `1px solid ${Colors.get('border', theme)}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: fSize === 0 ? '15px' : '17px', fontWeight: '700', color: Colors.get('mainText', theme) },
  badge: {
    fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px',
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
    color: Colors.get('subText', theme)
  },
  successBadge: {
    marginTop: '15px', padding: '6px 14px', borderRadius: '20px',
    background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.2), rgba(59, 130, 246, 0.2))',
    color: '#4ADE80', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px'
  },
  sectionTitle: { fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme), paddingLeft: '5px' },
  
  // MODAL
  modalBackdrop: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
    zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
  },
  modalContainer: {
    width: '100%', maxWidth: '400px', backgroundColor: Colors.get('background', theme),
    borderRadius: '24px', padding: '25px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    border: `1px solid ${Colors.get('border', theme)}`
  },
  infoContent: {
    fontSize: fSize === 0 ? '13px' : '15px', color: Colors.get('mainText', theme), lineHeight: '1.6', whiteSpace: 'pre-wrap'
  },

  // PREMIUM
  premiumOverlay: {
    position: 'absolute', inset: 0, zIndex: 10,
    backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.85)',
    backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  premiumContent: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
    padding: '30px', borderRadius: '24px', border: `1px solid ${Colors.get('border', theme)}`,
    background: theme === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(20,20,20,0.9)'
  }
});

// --- CORE LOGIC FUNCTIONS (Unchanged) ---
function getLoadRange() {
  const sessions = Object.values(AppData.trainingLog).flat().filter(s => s?.completed && s.tonnage > 0 && s.duration > 0);
  if (sessions.length === 0) return { min: 0, max: 0 };
  const loads = sessions.map(session => session.tonnage / (session.duration / 60000));
  const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
  const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
  const sdLoad = Math.sqrt(variance);
  const min = Math.max(0, avgLoad - 0.5 * sdLoad);
  const max = avgLoad + 0.5 * sdLoad;
  return { min, max };
}

function getNeededTonnage() {
  const allSessions = Object.values(AppData.trainingLog).flat().filter(s => s?.completed && typeof s.tonnage === 'number' && s.tonnage > 0);
  if (allSessions.length === 0) return 0;
  const tonnages = allSessions.map(s => s.tonnage).sort((a, b) => a - b);
  const mid = Math.floor(tonnages.length / 2);
  let medianTonnage = tonnages.length % 2 === 0 ? (tonnages[mid - 1] + tonnages[mid]) / 2 : tonnages[mid];
  return medianTonnage * 1.05;
}

function getLatestProgramSessions() {
  const allSessions = [];
  for (const [dateKey, dayData] of Object.entries(AppData.trainingLog)) {
    const sessions = Array.isArray(dayData) ? dayData : Object.values(dayData);
    for (const s of sessions) {
      if (s?.completed && s.tonnage > 0 && s.duration > 0) {
        allSessions.push({ ...s, dateKey, date: new Date(dateKey) });
      }
    }
  }
  allSessions.sort((a, b) => a.date - b.date);
  if (allSessions.length === 0) return [];
  const latestProgramId = allSessions[allSessions.length - 1].programId;
  return allSessions.filter(s => s.programId === latestProgramId);
}

function splitIntoCycles(sessions) {
  if (sessions.length === 0) return { currentCycle: [], lastFullCycle: [] };
  const allSameDay = sessions.every(s => s.dayIndex === sessions[0].dayIndex);
  if (allSameDay) {
    if (sessions.length === 1) return { currentCycle: [sessions[0]], lastFullCycle: [] };
    return { currentCycle: [sessions[sessions.length - 1]], lastFullCycle: [sessions[sessions.length - 2]] };
  }
  const cycles = [];
  let currentCycle = [];
  let lastDayIndex = -1;
  for (const session of sessions) {
    if (session.dayIndex <= lastDayIndex) {
      if (currentCycle.length > 0) { cycles.push(currentCycle); currentCycle = []; }
    }
    currentCycle.push(session);
    lastDayIndex = session.dayIndex;
  }
  if (currentCycle.length > 0) cycles.push(currentCycle);
  if (cycles.length === 1) return { currentCycle: cycles[0], lastFullCycle: [] };
  return { currentCycle: cycles[cycles.length - 1], lastFullCycle: cycles[cycles.length - 2] };
}

export function getCurrentCycleAnalysis() {
  const latestSessions = getLatestProgramSessions();
  const { currentCycle, lastFullCycle } = splitIntoCycles(latestSessions);
  const currentTonnage = currentCycle.reduce((sum, s) => sum + s.tonnage, 0);
  const lastFullTonnage = lastFullCycle.reduce((sum, s) => sum + s.tonnage, 0);
  const targetTonnage = lastFullTonnage > 0 ? lastFullTonnage * 1.05 : 0;
  const progressPercent = targetTonnage > 0 ? Math.min(100, (currentTonnage / targetTonnage) * 100) : 0;
  return { currentCycle, lastFullCycle, currentTonnage, targetTonnage, progressPercent };
}

function infoText(langIndex) {
  if (langIndex === 0) {
    return `Анализ цикла основан на последней программе тренировок.\n\nЦикл определяется автоматически:\n— Для программ с одним днём — каждый сеанс считается отдельным циклом.\n— Для программ с несколькими днями — цикл завершается, когда день в программе сбрасывается.\n\nОбъём цикла = сумма тоннажа всех сессий.\nЦель = объём предыдущего полного цикла × 1.05 (рост на 5%).`;
  } else {
    return `Cycle analysis is based on your latest training program.\n\nCycle detection:\n— Single-day programs: each session is a cycle.\n— Multi-day programs: cycle ends when the day resets.\n\nCycle volume = total tonnage of sessions.\nTarget = last complete cycle × 1.05.`;
  }
}

export default TrainingAnaliticsMain;