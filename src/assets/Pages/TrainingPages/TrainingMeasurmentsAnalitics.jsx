import { useState, useEffect } from 'react';
import MyAreaChart from "../../Helpers/MyAreaChart";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import ProgressMeasurmentsCircle from '../../Helpers/ProgressMeasurmentsCircle.jsx';

const metricLabels = [
  ['Вес', 'Weight'],
  ['Талия', 'Waist'],
  ['Бицепс', 'Biceps'],
  ['Грудь', 'Chest'],
  ['Бёдра', 'Hips']
];

const periodLabels = [
  ['месяц', 'month'],
  ['пол года', 'half year'],
  ['год', 'year']
];

const PERIOD_DAYS = [28, 180, 360];
const METRIC_KEYS = ['weight', 'waist', 'biceps', 'chest', 'hips']; // optional, for clarity

const TrainingMeasurmentsAnalitics = ({ theme, langIndex, fSize, data }) => {
  const [metricIndex, setMetricIndex] = useState(0); // 0 = weight, 1 = waist, etc.
  const [periodIndex, setPeriodIndex] = useState(0); // 0 = 28d, 1 = 180d, 2 = 360d
  const [goal, setGoal] = useState(AppData.pData.goal);

   useEffect(() => {
   setGoal(AppData.pData.goal);
  }, [AppData.pData.goal]);

  // Filter data by period
  const getFilteredData = () => {
    const metricData = data[metricIndex] || [];
    if (metricData.length === 0) return [];

    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - PERIOD_DAYS[periodIndex]);

    return metricData
      .filter(item => new Date(item.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date)); // ensure chronological
  };

  const filteredData = getFilteredData();
  const chartData = buildDataForChart(filteredData);
  const currentValue = filteredData.length > 0 
    ? filteredData[filteredData.length - 1].value 
    : 0;
  const startValue = filteredData.length > 0 
    ? filteredData[0].value 
    : currentValue;
  const mediumValue = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length
    : currentValue;

  // Unit per metric (you can extend)
  const getUnit = (index) => {
    return index === 0 ? 'kg' : 'cm'; // weight in kg, others in cm
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginRight: '40px' }}>
      {/* Chart */}
      <div style={{ width: '100%', height: '240px' }}>
        <MyAreaChart
          data={chartData}
          fillColor={Colors.get('areaChart', theme)}
          textColor={Colors.get('subText', theme)}
          linesColor={Colors.get('border', theme)}
          backgroundColor={Colors.get('background', theme)} // only weight has goal
        />
      </div>

      {/* Controls + Progress Circle */}
      <div style={{
        width: '100%',
        height: '35vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        marginLeft: '30px',
        alignItems: 'center'
      }}>
        {/* Metric Togglers */}
        <MetricTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          metricIndex={metricIndex}
          setMetricIndex={setMetricIndex}
        />
        
        {/* Period Togglers */}
        <PeriodTogglers
          theme={theme}
          langIndex={langIndex}
          fSize={fSize}
          periodIndex={periodIndex}
          setPeriodIndex={setPeriodIndex}
        />

        {/* Progress Circle */}
        <ProgressMeasurmentsCircle
          startValue={startValue}
          endValue={currentValue}
          mediumValue={mediumValue}
          unit={getUnit(metricIndex)}
          langIndex={langIndex}
          goal={goal}
          size={210}
          textColor={Colors.get('mainText', theme)}
          linesColor={Colors.get('linesColor', theme)}
          minColor={Colors.get('regress', theme)}
          maxColor={Colors.get('areaChart', theme)}
          mediumcolor={Colors.get('icons', theme)}
          baseColor={Colors.get('background', theme)}
        />
      </div>
    </div>
  );
};

export default TrainingMeasurmentsAnalitics;

// === Helpers ===

function buildDataForChart(measurements) {
  return measurements.map(item => ({
    date: formatDateToDdMm(item.date),
    weight: item.value // MyAreaChart expects 'weight' — you may want to generalize this or rename prop
  }));
}

function formatDateToDdMm(iso) {
  const parts = iso.split("-");
  return `${parts[2]}.${parts[1]}`; // DD.MM
}

// === Togglers ===

const MetricTogglers = ({ theme, langIndex, fSize, metricIndex, setMetricIndex }) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottm: '5px',
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