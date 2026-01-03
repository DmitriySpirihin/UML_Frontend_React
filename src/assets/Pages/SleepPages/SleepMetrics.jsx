import { useState, useEffect, useMemo } from 'react';
import MyBarChart from "../../Helpers/MyBarChart";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';

const periodLabels = [
  ['месяц', 'month'],
  ['пол года', 'half year'],
  ['год', 'year']
];

const PERIOD_DAYS = [28, 180, 360];

// === Helpers ===

const msToMinutes = (ms) => Math.floor(ms / 60_000);
const msToHoursMinutes = (ms) => {
  const totalMin = msToMinutes(ms);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatDate = (iso, langIndex) => {
  const d = new Date(iso);
  return d.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: 'short'
  });
};

// === Period Togglers ===
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
const SleepMetrics = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
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

  // Convert sleepingLog to sorted array
  const sleepData = useMemo(() => {
    if (!AppData.sleepingLog) return [];
    return Object.entries(AppData.sleepingLog)
      .map(([date, session]) => ({
        date,
        durationMs: session.duration || 0,
        mood: session.mood || 0,
        note: session.note || ''
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

  // Filter by period
  const filteredData = useMemo(() => {
    if (sleepData.length === 0) return [];
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[periodIndex]);
    return sleepData.filter(item => new Date(item.date) >= cutoff);
  }, [sleepData, periodIndex]);

  // Chart data: DD.MM + duration in minutes
  const chartData = useMemo(() => {
  return filteredData.map(item => ({
    date: item.date.split('-').slice(1).reverse().join('.'), // DD.MM
    ms: item.durationMs,
    mood: item.mood || 3 // default to neutral if missing
  }));
}, [filteredData]);

  return (
    <div style={styles(theme).container}>
      {/* Title */}
      <div style={{
        fontSize: fSize === 0 ? '14px' : '16px',
        fontWeight: 'bold',
        fontFamily: 'Segoe UI',
        color: Colors.get('mainText', theme),
        marginBottom: '8px'
      }}>
        {langIndex === 0 ? 'Продолжительность сна' : 'Sleep Duration'}
      </div>

      {/* Bar Chart */}
      <div style={{ width: '100%', height: '220px', marginBottom: '16px'}}>
        <MyBarChart
  data={chartData}
  theme={theme}  // 👈 add this
  textColor={Colors.get('subText', theme)}
  linesColor={Colors.get('border', theme)}
  backgroundColor={Colors.get('background', theme)}
/>
      </div>

      {/* Period Toggler */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '12px' }}>
        <PeriodTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          periodIndex={periodIndex}
          setPeriodIndex={setPeriodIndex}
        />
      </div>

      {/* Session List */}
      <div style={{
        width: '90%',
        height: '48%',
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
            .slice()
            .reverse()
            .map((item, idx) => (
              <div
                key={`${item.date}-${idx}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderBottom: `1px solid ${Colors.get('border', theme)}`
                }}
              >
                <span style={{
                  color: Colors.get('mainText', theme),
                  fontSize: fSize === 0 ? '13px' : '15px'
                }}>
                  {formatDate(item.date, langIndex)}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    color: Colors.get('icons', theme),
                    fontSize: fSize === 0 ? '13px' : '15px',
                    fontWeight: '500'
                  }}>
                    {msToHoursMinutes(item.durationMs)}
                  </span>

                  {item.mood > 0 && (
                    <span style={{
                      color: Colors.get('subText', theme),
                      fontSize: fSize === 0 ? '12px' : '14px'
                    }}>
                      {'★'.repeat(item.mood)}{'☆'.repeat(5 - item.mood)}
                    </span>
                  )}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

const styles = (theme) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: "flex",
    position: 'absolute',
    flexDirection: "column",
    overflowY: 'scroll',
    justifyContent: "start",
    alignItems: "center",
    height: "78vh",
    top: '14vh',
    width: "100vw",
    fontFamily: "Segoe UI",
  },
});

export default SleepMetrics;