import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../../StaticClasses/HabitsBus';
import { VolumeTabs } from '../../../Helpers/TrainingAnaliticsTabs';
import TrainingAnaliticsMuscles from './TrainingAnaliticsMuscles';
import TrainingAnaliticsRM from './TrainingAnaliticsRM';
import { FaBullseye, FaChartPie, FaDumbbell, FaInfoCircle, FaTrophy } from "react-icons/fa";
import { MdClose } from 'react-icons/md';
import {
  getTrainingAccent,
  getTrainingPageBackground,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow
} from '../TrainingVisuals.js';

const TrainingAnaliticsMain = () => {
  // --- STATE (Logic Intact) ---
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [tab, setTab] = React.useState('volume');
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
    return () => {
      sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe();
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
  const accent = getTrainingAccent();
  const cardBg = getTrainingPanelBackground(theme, accent);
  const borderColor = getTrainingPanelBorder(theme, accent);

  return (
    <div style={styles(theme).container}>
      <VolumeTabs type={0} theme={theme} langIndex={langIndex} activeTab={tab} onChange={setTab} />

      <div style={{ flex: 1, width: '100%', maxWidth: '600px', position: 'relative', overflowY: 'auto', paddingBottom: '100px' }}>
        <AnimatePresence mode="wait">
          
          {/* === VOLUME TAB === */}
          {tab === 'volume' && (
            <Motion.div
              key="volume"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px', padding: '10px' }}
            >
              <CycleOverview
                theme={theme}
                langIndex={langIndex}
                fSize={fSize}
                donutData={donutData}
                totalTonnage={totalTonnage}
                sessionCount={sessionCount}
              />

              <div style={{ ...styles(theme).targetCard, background: cardBg, border: `1px solid ${borderColor}` }}>
                <Tonnage
                  theme={theme} 
                  langIndex={langIndex} 
                  totalTonnage={totalTonnage} 
                  targetTonnage={targetTonnage} 
                  progressPercent={progressPercent} 
                />
                <div style={{ padding: '0 18px 18px 18px' }}>
                   <InfoText theme={theme} langIndex={langIndex} />
                </div>
              </div>
            </Motion.div>
          )}

          {/* === MUSCLES TAB === */}
          {tab === 'muscles' && (
            <Motion.div
              key="muscles"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ padding: '10px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px', padding: '0 10px' }}>
                <span style={styles(theme, fSize).sectionTitle}>{langIndex === 0 ? 'Загрузка мышц' : 'Muscle Load'}</span>
                <Motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowInfo(true)} style={{ cursor: 'pointer', opacity: 0.7 }}>
                  <FaInfoCircle size={18} color={Colors.get('mainText', theme)} />
                </Motion.div>
              </div>
              <TrainingAnaliticsMuscles />
            </Motion.div>
          )}

          {/* === EXERCISES TAB === */}
          {tab === 'exercises' && (
            <Motion.div
              key="exercises"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              style={{ padding: '10px' }}
            >
              <TrainingAnaliticsRM />
            </Motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- PREMIUM LOCK --- */}

      {/* --- INFO MODAL --- */}
      <AnimatePresence>
        {showInfo && (
          <div style={styles(theme).modalBackdrop} onClick={() => setShowInfo(false)}>
            <Motion.div 
              initial={{ y: 50, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 50, opacity: 0, scale: 0.95 }}
              style={styles(theme).modalContainer} onClick={e => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: Colors.get('mainText', theme), fontSize: '18px' }}>Info</h3>
                <MdClose size={24} color={Colors.get('subText', theme)} onClick={() => setShowInfo(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={styles(theme, fSize).infoContent}>{infoText(langIndex)}</div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CycleOverview = ({ theme, langIndex, fSize, donutData, totalTonnage, sessionCount }) => {
  const total = donutData.reduce((sum, item) => sum + (item.value || 0), 0);
  const mix = [
    { label: langIndex === 0 ? 'Лёгкая' : 'Light', value: donutData[0]?.value || 0, color: Colors.get('done', theme) },
    { label: langIndex === 0 ? 'Средняя' : 'Medium', value: donutData[1]?.value || 0, color: Colors.get('medium', theme) },
    { label: langIndex === 0 ? 'Тяжёлая' : 'Heavy', value: donutData[2]?.value || 0, color: Colors.get('skipped', theme) }
  ];
  const hasData = totalTonnage > 0 && sessionCount > 0;

  return (
    <div style={styles(theme).cycleCard}>
      <div style={styles(theme).cycleHeader}>
        <div>
          <div style={styles(theme).eyebrow}>{langIndex === 0 ? 'ТЕКУЩИЙ ЦИКЛ' : 'CURRENT CYCLE'}</div>
          <div style={styles(theme, fSize).cycleTitle}>
            {hasData
              ? (langIndex === 0 ? 'Объём и интенсивность' : 'Volume and intensity')
              : (langIndex === 0 ? 'Нет завершённых силовых' : 'No finished strength sessions')}
          </div>
        </div>
        <div style={styles(theme).badge}>{sessionCount} {langIndex === 0 ? 'сесс.' : 'sess.'}</div>
      </div>

      <div style={styles(theme).cycleBody}>
        <div style={styles(theme).cycleMainMetric}>
          <div style={styles(theme).metricIcon}><FaDumbbell /></div>
          <div>
            <div style={styles(theme).cycleValue}>{(totalTonnage / 1000).toFixed(1)}</div>
            <div style={styles(theme).cycleUnit}>{langIndex === 0 ? 'тонн за цикл' : 'tons in cycle'}</div>
          </div>
        </div>

        <div style={styles(theme).donutFrame}>
          {hasData ? (
            <CycleRing data={donutData} theme={theme} totalTonnage={totalTonnage} langIndex={langIndex} />
          ) : (
            <div style={styles(theme).emptyDonut}>
              <FaChartPie />
            </div>
          )}
        </div>
      </div>

      <div style={styles(theme).loadMixGrid}>
        {mix.map(item => {
          const percent = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.label} style={styles(theme).loadMixItem}>
              <div style={styles(theme).loadMixTop}>
                <span style={{ ...styles(theme).loadDot, background: item.color }} />
                <span>{item.label}</span>
              </div>
              <div style={styles(theme).loadMixValue}>{percent}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CycleRing = ({ data, theme, totalTonnage, langIndex }) => {
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  const light = total > 0 ? ((data[0]?.value || 0) / total) * 100 : 0;
  const medium = total > 0 ? ((data[1]?.value || 0) / total) * 100 : 0;
  const lightEnd = light;
  const mediumEnd = light + medium;
  const ring = total > 0
    ? `conic-gradient(#4ADE80 0 ${lightEnd}%, #FACC15 ${lightEnd}% ${mediumEnd}%, #F87171 ${mediumEnd}% 100%)`
    : 'rgba(148,163,184,0.18)';

  return (
    <div style={{ ...styles(theme).ringShell, background: ring }}>
      <div style={styles(theme).ringInner}>
        <div style={styles(theme).ringValue}>{(totalTonnage / 1000).toFixed(1)}</div>
        <div style={styles(theme).ringLabel}>{langIndex === 0 ? 'тонн' : 'tons'}</div>
      </div>
    </div>
  );
};

const Tonnage = ({ theme, langIndex, totalTonnage, targetTonnage, progressPercent }) => {
  const isCompleted = progressPercent >= 100;
  const accentColor = isCompleted ? '#4ADE80' : getTrainingAccent().hue;

  return (
    <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={styles(theme).targetHeader}>
        <div style={styles(theme).targetIcon}><FaBullseye /></div>
        <div>
          <div style={styles(theme).eyebrow}>{langIndex === 0 ? 'ЦЕЛЬ ЦИКЛА' : 'CYCLE TARGET'}</div>
          <div style={styles(theme).targetSubhead}>
            {langIndex === 0 ? 'Плановый объём относительно прошлого цикла' : 'Planned volume versus previous cycle'}
          </div>
        </div>
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
        <Motion.div 
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
        borderRadius: '16px', padding: '12px', fontSize: '11px', color: Colors.get('subText', theme),
        lineHeight: '1.5', whiteSpace: 'pre-wrap', textAlign: 'left'
    }}>
      {textContent}
    </div>
  );
};

// --- STYLES ---
const styles = (theme, fSize) => {
  const accent = getTrainingAccent();
  const isLight = theme === 'light' || theme === 'speciallight';

  return {
  container: {
    display: 'flex', width: "100vw", flexDirection: 'column',
    overflowY: 'scroll', overflowX: 'hidden', justifyContent: "flex-start", alignItems: 'center',
    background: getTrainingPageBackground(theme, accent),
    minHeight: "100dvh",
    height: "100dvh",
    padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 18px 116px',
    boxSizing: 'border-box'
  },
  card: {
    borderRadius: '24px', overflow: 'hidden',
    boxShadow: getTrainingPanelShadow(theme, accent),
    background: getTrainingPanelBackground(theme, accent),
    border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
    backdropFilter: 'blur(10px)', transition: 'all 0.3s ease'
  },
  cycleCard: {
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: getTrainingPanelShadow(theme, accent),
    background: getTrainingPanelBackground(theme, accent),
    border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
    backdropFilter: 'blur(16px)',
  },
  targetCard: {
    borderRadius: '28px',
    overflow: 'hidden',
    boxShadow: getTrainingPanelShadow(theme, accent),
    background: getTrainingPanelBackground(theme, accent),
    backdropFilter: 'blur(16px)',
  },
  cycleHeader: {
    padding: '18px 18px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '14px',
    borderBottom: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)'}`,
  },
  eyebrow: {
    color: accent.hue,
    fontSize: '11px',
    fontWeight: 900,
    letterSpacing: '0.16em',
    marginBottom: '5px',
  },
  cycleTitle: {
    fontSize: fSize === 0 ? '20px' : '22px',
    lineHeight: 1.12,
    fontWeight: 900,
    color: Colors.get('mainText', theme),
  },
  cycleBody: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px',
    alignItems: 'center',
    padding: '18px',
  },
  cycleMainMetric: {
    minHeight: '132px',
    borderRadius: '24px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.06)'}`,
    boxSizing: 'border-box',
  },
  metricIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: accent.hue,
    background: `rgba(${accent.rgb}, 0.12)`,
    border: `1px solid ${accent.ring}`,
    flexShrink: 0,
  },
  cycleValue: {
    color: Colors.get('mainText', theme),
    fontSize: '42px',
    lineHeight: 0.95,
    fontWeight: 950,
    fontVariantNumeric: 'tabular-nums',
  },
  cycleUnit: {
    marginTop: '8px',
    color: Colors.get('subText', theme),
    fontSize: '12px',
    lineHeight: 1.25,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  donutFrame: {
    minHeight: '190px',
    borderRadius: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(0,0,0,0.12)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.06)'}`,
    overflow: 'hidden',
  },
  emptyDonut: {
    width: '96px',
    height: '96px',
    borderRadius: '999px',
    color: Colors.get('subText', theme),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.05)',
  },
  ringShell: {
    width: '172px',
    height: '172px',
    borderRadius: '999px',
    padding: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    boxShadow: isLight ? '0 18px 36px rgba(15,23,42,0.08)' : '0 18px 46px rgba(0,0,0,0.26)',
  },
  ringInner: {
    width: '100%',
    height: '100%',
    borderRadius: '999px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: isLight ? '#fff' : 'rgba(16,18,22,0.94)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
  },
  ringValue: {
    color: Colors.get('mainText', theme),
    fontSize: '34px',
    lineHeight: 1,
    fontWeight: 950,
    fontVariantNumeric: 'tabular-nums',
  },
  ringLabel: {
    marginTop: '6px',
    color: Colors.get('subText', theme),
    fontSize: '11px',
    fontWeight: 900,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  loadMixGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px',
    padding: '0 18px 18px',
  },
  loadMixItem: {
    minWidth: 0,
    padding: '11px 10px',
    borderRadius: '18px',
    background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.042)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.055)'}`,
    boxSizing: 'border-box',
  },
  loadMixTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: Colors.get('subText', theme),
    fontSize: '11px',
    fontWeight: 800,
    lineHeight: 1.2,
    minWidth: 0,
  },
  loadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '99px',
    flexShrink: 0,
  },
  loadMixValue: {
    marginTop: '7px',
    color: Colors.get('mainText', theme),
    fontSize: '18px',
    fontWeight: 950,
    fontVariantNumeric: 'tabular-nums',
  },
  targetHeader: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '12px',
    textAlign: 'left',
    marginBottom: '16px',
  },
  targetIcon: {
    width: '42px',
    height: '42px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: accent.hue,
    background: `rgba(${accent.rgb}, 0.12)`,
    border: `1px solid ${accent.ring}`,
  },
  targetSubhead: {
    color: Colors.get('subText', theme),
    fontSize: '12px',
    fontWeight: 750,
    lineHeight: 1.25,
  },
  cardHeader: {
    padding: '15px 20px', borderBottom: `1px solid ${Colors.get('border', theme)}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { fontSize: fSize === 0 ? '15px' : '17px', fontWeight: '700', color: Colors.get('mainText', theme) },
  badge: {
    fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '12px',
    backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
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
  };
};

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

// eslint-disable-next-line react-refresh/only-export-components
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
