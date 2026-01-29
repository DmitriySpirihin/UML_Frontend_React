import { useState, useEffect, useMemo } from 'react';
import MyAreaChart from "../../Helpers/MyAreaChart";
import { AppData,UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ ,premium$} from '../../StaticClasses/HabitsBus';
import { motion } from 'framer-motion';
import { FaHistory, FaCalendarAlt, FaClock, FaFire, FaWind, FaSpa, FaSnowflake } from 'react-icons/fa';

// === Labels & Icons ===
const metricConfig = [
  { ru: 'Дыхание', en: 'Breathing', icon: <FaWind />, colorKey: 'out', fallback: '#32D74B' },
  { ru: 'Медитация', en: 'Meditation', icon: <FaSpa />, colorKey: 'meditate', fallback: '#BF5AF2' },
  { ru: 'Закалка', en: 'Hardening', icon: <FaSnowflake />, colorKey: 'cold', fallback: '#0A84FF' }
];

const periodLabels = [
  ['Месяц', 'Month'],
  ['Полгода', '6 Months'],
  ['Год', 'Year']
];

const PERIOD_DAYS = [28, 180, 360];

// === Helpers ===
const formatDuration = (ms) => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${sec}s`;
};

const formatDate = (iso, langIndex) => {
  const d = new Date(iso);
  return d.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
};

// Получение цвета
const getMetricColor = (index, theme) => {
    const config = metricConfig[index];
    return Colors.get(config.colorKey, theme) || config.fallback;
};

// === COMPONENT: Segmented Control (Tabs) ===
const SegmentedControl = ({ items, selectedIndex, onChange, theme, langIndex, fSize, activeColor }) => {
    return (
        <div style={{
            display: 'flex',
            backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)',
            borderRadius: '14px',
            padding: '4px',
            marginBottom: '20px',
            width: '92%',
            position: 'relative',
            backdropFilter: 'blur(10px)'
        }}>
            {items.map((item, idx) => {
                const isActive = selectedIndex === idx;
                return (
                    <div
                        key={idx}
                        onClick={() => onChange(idx)}
                        style={{
                            flex: 1,
                            position: 'relative',
                            padding: '10px 0',
                            textAlign: 'center',
                            cursor: 'pointer',
                            zIndex: 1,
                            fontSize: fSize === 0 ? '13px' : '15px',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive 
                                ? '#FFF' 
                                : Colors.get('subText', theme),
                            transition: 'color 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, right: 0, bottom: 0,
                                    backgroundColor: activeColor,
                                    borderRadius: '12px',
                                    zIndex: -1,
                                    boxShadow: `0 4px 12px ${activeColor}60`
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            />
                        )}
                        <span style={{ fontSize: '14px' }}>{item.icon}</span>
                        <span>{item[langIndex === 0 ? 'ru' : 'en']}</span>
                    </div>
                );
            })}
        </div>
    );
};

// === COMPONENT: Period Selector ===
const PeriodSelector = ({ items, selectedIndex, onChange, theme, langIndex, activeColor }) => {
    return (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', width: '92%', justifyContent: 'center' }}>
            {items.map((item, idx) => {
                const isActive = selectedIndex === idx;
                return (
                    <div
                        key={idx}
                        onClick={() => onChange(idx)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: isActive ? '700' : '500',
                            cursor: 'pointer',
                            backgroundColor: isActive ? `${activeColor}20` : 'transparent', // Прозрачный фон активного цвета
                            color: isActive ? activeColor : Colors.get('subText', theme),
                            border: isActive ? `1px solid ${activeColor}` : `1px solid ${Colors.get('border', theme)}`,
                            transition: 'all 0.2s ease',
                            minWidth: '60px',
                            textAlign: 'center'
                        }}
                    >
                        {item[langIndex]}
                    </div>
                );
            })}
        </div>
    );
};

// === Main Component ===
const RecoveryAnalytics = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  const [metricIndex, setMetricIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);

  useEffect(() => {
      const sub1 = theme$.subscribe(setThemeState);
      const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
      const sub3 = fontSize$.subscribe(setFSize);
      const sub4 = premium$.subscribe(setHasPremium);
      return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe();sub4.unsubscribe(); };
  }, []);

  // --- Data Logic (Сохранена из старого файла) ---
  const logs = [AppData.breathingLog, AppData.meditationLog, AppData.hardeningLog];
  const allData = useMemo(() => {
    const log = logs[metricIndex] || {};
    const dailyMap = {};
    for (const [date, sessions] of Object.entries(log)) {
      let totalDuration = 0;
      let totalMaxHold = 0;
      let totalTimeInCold = 0;
      for (const session of sessions) {
        const duration = session.endTime - session.startTime;
        totalDuration += duration;
        if (metricIndex === 0 && session.maxHold) totalMaxHold += session.maxHold;
        if (metricIndex === 2 && session.timeInColdWater) totalTimeInCold += session.timeInColdWater;
      }
      dailyMap[date] = { date, totalDuration, totalMaxHold, totalTimeInCold };
    }
    return Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [metricIndex]);

  const filteredData = useMemo(() => {
    if (allData.length === 0) return [];
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - PERIOD_DAYS[periodIndex]);
    return allData.filter(item => new Date(item.date) >= cutoff);
  }, [allData, periodIndex]);

  const chartData = useMemo(() => {
    return filteredData.map(item => ({
      date: item.date.split('-').slice(1).reverse().join('.'), // DD.MM
      weight: Math.round(item.totalDuration / 1000)
    })).reverse();
  }, [filteredData]);

  // Вычисление итогового времени за период
  const totalPeriodTime = useMemo(() => {
      return filteredData.reduce((acc, curr) => acc + curr.totalDuration, 0);
  }, [filteredData]);

  const activeColor = getMetricColor(metricIndex, theme);
  const isDark = theme === 'dark' || theme === 'specialdark';

  return (
    <div style={styles(theme).container}>
      
      {/* 1. Header & Title */}
      <h2 style={{ 
          margin: '0 0 15px 0', 
          fontSize: '24px', 
          fontWeight: '800', 
          color: Colors.get('mainText', theme),
          fontFamily: 'Segoe UI',
          letterSpacing: '0.5px'
      }}>
          {langIndex === 0 ? 'Ваш прогресс' : 'Your Progress'}
      </h2>

      {/* 2. Main Metric Tabs */}
      <SegmentedControl 
          items={metricConfig} 
          selectedIndex={metricIndex} 
          onChange={setMetricIndex} 
          theme={theme} 
          langIndex={langIndex} 
          fSize={fSize} 
          activeColor={activeColor}
      />

      {/* 3. The "Hero" Card with Chart */}
      <div style={{
          width: '92%',
          background: isDark 
            ? `linear-gradient(160deg, #1C1C1E 0%, #101010 100%)` 
            : '#FFFFFF',
          borderRadius: '24px',
          padding: '20px 0px 10px 0px',
          marginBottom: '20px',
          boxShadow: isDark 
            ? `0 10px 40px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)` 
            : '0 10px 30px -10px rgba(0,0,0,0.1)',
          border: isDark ? `1px solid ${activeColor}30` : 'none', // Цветная обводка
          position: 'relative',
          overflow: 'hidden'
      }}>
          {/* Total Time Display */}
          <div style={{ paddingLeft: '24px', marginBottom: '15px' }}>
               <div style={{ fontSize: '13px', color: Colors.get('subText', theme), fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                   {langIndex === 0 ? 'Всего за период' : 'Total Time'}
               </div>
               <div style={{ 
                   fontSize: '32px', 
                   fontWeight: '800', 
                   color: activeColor, 
                   textShadow: `0 0 20px ${activeColor}50` 
               }}>
                   {totalPeriodTime > 0 ? formatDuration(totalPeriodTime) : '0m 0s'}
               </div>
          </div>

          {/* Chart */}
          <div style={{ width: '100%', height: '160px', paddingRight: '10px' }}>
            <MyAreaChart
              data={chartData}
              fillColor={activeColor}
              textColor={Colors.get('subText', theme)}
              linesColor={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
              backgroundColor={'transparent'}
            />
          </div>
          
          {/* Bottom Glow */}
          <div style={{
              position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%',
              background: `linear-gradient(to top, ${activeColor}20, transparent)`,
              pointerEvents: 'none'
          }} />
      </div>

      {/* 4. Period Selection */}
      <PeriodSelector 
          items={periodLabels} 
          selectedIndex={periodIndex} 
          onChange={setPeriodIndex} 
          theme={theme} 
          langIndex={langIndex} 
          activeColor={activeColor}
      />

      {/* 5. History Header */}
      <div style={{ width: '90%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaHistory color={Colors.get('subText', theme)} size={14} />
            <span style={{ fontSize: '14px', fontWeight: '700', color: Colors.get('mainText', theme) }}>
                {langIndex === 0 ? 'История сессий' : 'History'}
            </span>
          </div>
          <span style={{ fontSize: '12px', color: Colors.get('subText', theme), opacity: 0.7 }}>
             {filteredData.length} {langIndex === 0 ? 'записей' : 'records'}
          </span>
      </div>

      {/* 6. History List */}
      <div style={{
        width: '100%',
        flex: 1,
        overflowY: 'auto',
        padding: '0 5% 50px 5%',
        boxSizing: 'border-box'
      }} className="no-scrollbar">
        {filteredData.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px', opacity: 0.5
          }}>
            <FaClock size={40} color={Colors.get('subText', theme)} style={{ marginBottom: '10px' }} />
            <div style={{ color: Colors.get('subText', theme), fontSize: '14px' }}>
               {langIndex === 0 ? 'Нет тренировок за этот период' : 'No sessions in this period'}
            </div>
          </div>
        ) : (
          filteredData
            .slice()
            .reverse()
            .map((item, idx) => (
              <motion.div
                key={`${item.date}-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  marginBottom: '10px',
                  // Более "плоский" и чистый стиль для списка
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#FFF',
                  borderRadius: '18px',
                  borderLeft: `4px solid ${activeColor}`, // Цветной индикатор слева
                  boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.03)'
                }}
              >
                {/* Date Side */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        backgroundColor: `${activeColor}15`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: activeColor
                    }}>
                        <FaCalendarAlt size={14} />
                    </div>
                    <span style={{
                      color: Colors.get('mainText', theme),
                      fontSize: '15px',
                      fontWeight: '600'
                    }}>
                      {formatDate(item.date, langIndex)}
                    </span>
                </div>
                
                {/* Stats Side */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{
                      color: Colors.get('mainText', theme),
                      fontSize: '15px',
                      fontWeight: '700',
                    }}>
                      {formatDuration(item.totalDuration)}
                    </span>
                    
                    {/* Extra Info (Small) */}
                    {metricIndex === 0 && item.totalMaxHold > 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: Colors.get('subText', theme) }}>
                            <FaFire size={8} /> {langIndex === 0 ? 'Задержка: ' : 'Hold: '} {formatDuration(item.totalMaxHold)}
                         </div>
                    )}
                    {metricIndex === 2 && item.totalTimeInCold > 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: Colors.get('subText', theme) }}>
                            <FaSnowflake size={8} /> {langIndex === 0 ? 'Холод: ' : 'Cold: '} {formatDuration(item.totalTimeInCold)}
                         </div>
                    )}
                </div>
              </motion.div>
            ))
        )}
      </div>
      {!hasPremium && (
              <div 
                                  onClick={(e) => e.stopPropagation()} 
                                  style={{
                                      position: 'absolute', inset: 0, zIndex: 2,
                                      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                      backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                                      backdropFilter: 'blur(12px)',
                                      textAlign: 'center'
                                  }}
                              >
                                  <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                                      {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                                  </div>
                              </div>
            )}
    </div>
  );
};

const styles = (theme) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex",
        position: 'absolute',
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        height: "88vh", 
        top: '12vh',    
        width: "100vw",
        fontFamily: "Segoe UI",
        overflow: 'hidden'
    },
});

export default RecoveryAnalytics;