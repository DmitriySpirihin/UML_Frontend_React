import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  ['Месяц', 'Month'],
  ['Полгода', '6 Months'],
  ['Год', 'Year']
];

const PERIOD_DAYS = [28, 180, 360];

const TrainingMeasurmentsAnalitics = ({ theme, langIndex, fSize, data }) => {
  const [metricIndex, setMetricIndex] = useState(0); 
  const [periodIndex, setPeriodIndex] = useState(0); 
  const [goal, setGoal] = useState(AppData.pData.goal);

  useEffect(() => {
    setGoal(AppData.pData.goal);
  }, [AppData.pData.goal]);

  // Filter data logic (Kept intact)
  const getFilteredData = () => {
    const metricData = data[metricIndex] || [];
    if (metricData.length === 0) return [];
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(now.getDate() - PERIOD_DAYS[periodIndex]);
    return metricData
      .filter(item => new Date(item.date) >= cutoffDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const filteredData = getFilteredData();
  const chartData = buildDataForChart(filteredData);
  
  // Logic for values (Kept intact)
  const currentValue = filteredData.length > 0 ? filteredData[filteredData.length - 1].value : 0;
  const startValue = filteredData.length > 0 ? filteredData[0].value : currentValue;
  const mediumValue = filteredData.length > 0 ? filteredData.reduce((sum, item) => sum + item.value, 0) / filteredData.length : currentValue;

  const getUnit = (index) => index === 0 ? 'kg' : 'cm';

  // --- Styles ---
  const isLight = theme === 'light' || theme === 'speciallight';
  const cardBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)';
  const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', paddingBottom: '50px' }}>
      
      {/* --- CHART CARD --- */}
      <div style={{ 
          width: '94%', height: '280px', 
          backgroundColor: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`,
          padding: '15px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* Metric Selector (Scrollable Chips) */}
        <div style={{ width: '100%', overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {metricLabels.map((label, idx) => {
                const isActive = metricIndex === idx;
                return (
                    <motion.div
                        key={idx}
                        onClick={() => setMetricIndex(idx)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '6px 14px', borderRadius: '20px',
                            backgroundColor: isActive ? Colors.get('currentDateBorder', theme) : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
                            color: isActive ? '#fff' : Colors.get('subText', theme),
                            fontSize: fSize === 0 ? '12px' : '14px', fontWeight: isActive ? '600' : '500',
                            whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {label[langIndex]}
                    </motion.div>
                )
            })}
        </div>

        {/* Chart Area */}
        <div style={{ flex: 1, width: '100%', marginTop: '5px' }}>
          <MyAreaChart
            data={chartData}
            fillColor={Colors.get(getAreaChart(goal, startValue, currentValue), theme)}
            textColor={Colors.get('subText', theme)}
            linesColor={Colors.get('border', theme)}
            backgroundColor="transparent"
          />
        </div>
      </div>

      {/* --- CONTROLS & STATS --- */}
      <div style={{ width: '94%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {/* Period Selector (Segmented Control) */}
        <div style={{
            display: 'flex', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            padding: '4px', borderRadius: '16px', width: '100%', maxWidth: '400px'
        }}>
            {periodLabels.map((label, idx) => {
                const isActive = periodIndex === idx;
                return (
                    <div key={idx} onClick={() => setPeriodIndex(idx)} style={{ flex: 1, position: 'relative', cursor: 'pointer', textAlign: 'center', padding: '8px 0' }}>
                        {isActive && (
                            <motion.div
                                layoutId="periodTab"
                                style={{
                                    position: 'absolute', inset: 0, backgroundColor: isLight ? '#fff' : 'rgba(255,255,255,0.1)',
                                    borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                }}
                            />
                        )}
                        <span style={{ position: 'relative', zIndex: 1, fontSize: '13px', fontWeight: isActive ? '700' : '500', color: isActive ? Colors.get('mainText', theme) : Colors.get('subText', theme) }}>
                            {label[langIndex]}
                        </span>
                    </div>
                )
            })}
        </div>

        {/* Progress Circle Card */}
        <div style={{ 
            padding: '20px', borderRadius: '30px', 
            backgroundColor: cardBg, border: `1px solid ${borderColor}`,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <ProgressMeasurmentsCircle
                startValue={startValue}
                endValue={currentValue}
                mediumValue={mediumValue}
                unit={getUnit(metricIndex)}
                langIndex={langIndex}
                goal={goal === 2 ? 1 : 0}
                size={220}
                theme={theme}
                textColor={Colors.get('mainText', theme)}
                linesColor={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                minColor="#FF453A"
                maxColor="#30D158"
                mediumColor="#0A84FF"
            />
        </div>
      </div>
    </div>
  );
};

export default TrainingMeasurmentsAnalitics;

// === Helpers ===
function buildDataForChart(measurements) {
  return measurements.map(item => ({
    date: formatDateToDdMm(item.date),
    weight: Math.round(item.value)
  }));
}

function formatDateToDdMm(iso) {
  const parts = iso.split("-");
  return `${parts[2]}.${parts[1]}`;
}

const getAreaChart = (goal, start, end) => {
   if(goal === 2){
      return start < end ? 'regress' : 'areaChart';
   }else{
      return start < end ? 'areaChart' : 'regress';
   }
};