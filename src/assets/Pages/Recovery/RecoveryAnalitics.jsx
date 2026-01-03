import { useState,useEffect, useMemo } from 'react';
import MyAreaChart from "../../Helpers/MyAreaChart";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$} from '../../StaticClasses/HabitsBus';

// === Labels (same as your reference)
const metricLabels = [
  ['Дыхание', 'Breathing'],
  ['Медитация', 'Meditation'],
  ['Закалка', 'Hardening']
];

const periodLabels = [
  ['месяц', 'month'],
  ['пол года', 'half year'],
  ['год', 'year']
];

const PERIOD_DAYS = [28, 180, 360];

// === Helpers ===

const flattenAndAggregate = (log, metricIndex) => {
  const entries = [];
  for (const [date, sessions] of Object.entries(log || {})) {
    let totalMs = 0;
    for (const session of sessions) {
      const duration = session.endTime - session.startTime;
      if (metricIndex === 0) {
        totalMs += duration + (session.maxHold || 0);
      } else if (metricIndex === 1) {
        totalMs += duration;
      } else if (metricIndex === 2) {
        totalMs += duration + (session.timeInColdWater || 0);
      }
    }
    entries.push({ date, value: totalMs });
  }
  return entries.sort((a, b) => new Date(a.date) - new Date(b.date));
};

const formatDuration = (ms) => {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}m ${sec}s`;
};

const formatDate = (iso,langIndex) => {
  const d = new Date(iso);
  return d.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', { day: '2-digit', month: 'short' });
};

// === Togglers (identical to your code) ===

const MetricTogglers = ({ theme, langIndex, fSize, metricIndex, setMetricIndex }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '5px',
      padding: '2px',
      backgroundColor: Colors.get('panel', theme),
      borderRadius: '12px'
    }}>
      {metricLabels.map((label, idx) => (
        <span
          key={idx}
          onClick={() => setMetricIndex(idx)}
          style={{
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: fSize === 0 ? '12px' : '14px',
            fontWeight: metricIndex === idx ? '600' : '400',
            color: metricIndex === idx
              ? Colors.get('mainText', theme)
              : Colors.get('subText', theme),
            opacity: metricIndex === idx ? 1 : 0.7,
            transition: 'all 0.2s ease'
          }}
        >
          {label[langIndex]}
          {idx < metricLabels.length - 1 && (
            <span style={{
              margin: '0 8px',
              color: Colors.get('border', theme),
            }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
};

const PeriodTogglers = ({ theme, langIndex, fSize, periodIndex, setPeriodIndex }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '8px 0'
    }}>
      {periodLabels.map((label, idx) => (
        <span
          key={idx}
          onClick={() => setPeriodIndex(idx)}
          style={{
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: fSize === 0 ? '11px' : '13px',
            fontWeight: periodIndex === idx ? '600' : '400',
            color: periodIndex === idx
              ? Colors.get('mainText', theme)
              : Colors.get('subText', theme),
            opacity: periodIndex === idx ? 1 : 0.8,
            transition: 'all 0.2s ease'
          }}
        >
          {label[langIndex]}
          {idx < periodLabels.length - 1 && (
            <span style={{
              margin: '0 8px',
              color: Colors.get('border', theme),
              fontSize: fSize === 0 ? '12px' : '14px'
            }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
};

// === Main Component ===

const RecoveryAnalytics = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [metricIndex, setMetricIndex] = useState(0);
  const [periodIndex, setPeriodIndex] = useState(0);

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

  // Get raw session data with daily aggregation + extra fields
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

        if (metricIndex === 0 && session.maxHold) {
          totalMaxHold += session.maxHold;
        }
        if (metricIndex === 2 && session.timeInColdWater) {
          totalTimeInCold += session.timeInColdWater;
        }
      }

      dailyMap[date] = {
        date,
        totalDuration,
        totalMaxHold,
        totalTimeInCold
      };
    }

    return Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [metricIndex]);

  // Filter by period
  const filteredData = useMemo(() => {
    if (allData.length === 0) return [];
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - PERIOD_DAYS[periodIndex]);
    return allData.filter(item => new Date(item.date) >= cutoff);
  }, [allData, periodIndex]);

  // Chart: show total daily duration in seconds
  const chartData = useMemo(() => {
    return filteredData.map(item => ({
      date: item.date.split('-').slice(1).reverse().join('.'), // DD.MM
      weight: Math.round(item.totalDuration / 1000)
    })).reverse();
  }, [filteredData]);

  return (
    <div style={styles(theme).container}>
      {/* Chart */}
      <div style={{ fontSize:fSize === 0 ? '14px' : '16px' , fontWeight:'bold',fontFamily:'Segoe UI',color:metricIndex === 0 ? Colors.get('out', theme) : metricIndex === 1 ? Colors.get('meditate', theme) : Colors.get('cold', theme)}}>{metricLabels[metricIndex][langIndex]}</div>
      <div style={{ width: '100%', height: '220px', marginBottom: '16px',marginRight:'25px' }}>
        <MyAreaChart
          data={chartData}
          fillColor={metricIndex === 0 ? Colors.get('out', theme) : metricIndex === 1 ? Colors.get('meditate', theme) : Colors.get('cold', theme)}
          textColor={Colors.get('subText', theme)}
          linesColor={Colors.get('border', theme)}
          backgroundColor={Colors.get('background', theme)}
        />
      </div>

      {/* Togglers */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <MetricTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          metricIndex={metricIndex}
          setMetricIndex={setMetricIndex}
        />
        <PeriodTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          periodIndex={periodIndex}
          setPeriodIndex={setPeriodIndex}
        />
      </div>

      {/* Scrollable Session List */}
      <div style={{
        width: '90%',
        height: '42%',
        overflowY: 'auto',
        padding: '8px',
        backgroundColor: Colors.get('panel', theme),
        borderRadius: '12px',
        border: `1px solid ${Colors.get('border', theme)}`,
        scrollbarWidth: 'thin',
        scrollbarColor: `${Colors.get('icons', theme)} ${Colors.get('background', theme)}`
      }}>
        {filteredData.length === 0 ? (
          <div style={{
            color: Colors.get('subText', theme),
            fontSize: fSize === 0 ? '13px' : '15px',
            textAlign: 'center'
          }}>
            {langIndex === 0 ? 'Нет данных за выбранный период' : 'No data for selected period'}
          </div>
        ) : (
          filteredData
            .slice() // don't mutate
            .reverse() // show newest first
            .map((item, idx) => (
              <div
                key={`${item.date}-${idx}`}
                style={{
                  display: 'flex',
                  borderBottom:`1px solid ${Colors.get('border', theme)}`,
                  justifyContent: 'space-between',
                  padding: '5px 12px',
                }}
              >
                <span style={{
                  color: Colors.get('mainText', theme),
                  fontSize: fSize === 0 ? '13px' : '15px'
                }}>
                  {formatDate(item.date,langIndex)}
                </span>
                <span style={{
                  color: Colors.get('icons', theme),
                  fontSize: fSize === 0 ? '13px' : '15px',
                  fontWeight: '500'
                }}>
                  {formatDuration(item.totalDuration)}
                </span>
                {metricIndex === 0 && item.totalMaxHold > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fSize === 0 ? '12px' : '14px', color: Colors.get('subText', theme) }}>
                      <span>{langIndex === 0 ? 'Макс. задержка: ' : 'Max Hold: '}</span>
                      <span>{formatDuration(item.totalMaxHold)}</span>
                    </div>
                  )}

                  {metricIndex === 2 && item.totalTimeInCold > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: fSize === 0 ? '12px' : '14px', color: Colors.get('subText', theme) }}>
                      <span>{langIndex === 0 ? 'В холодной: ' : 'In Cold: '}</span>
                      <span>{formatDuration(item.totalTimeInCold)}</span>
                    </div>
                  )}
              </div>
              
            ))
        )}
      </div>
    </div>
  );
};
const styles = (theme) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'absolute',
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     top:'14vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
})

export default RecoveryAnalytics;