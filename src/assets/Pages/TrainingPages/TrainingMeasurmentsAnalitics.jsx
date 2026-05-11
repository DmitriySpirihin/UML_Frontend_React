import { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import MyAreaChart from "../../Helpers/MyAreaChart";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import ProgressMeasurmentsCircle from '../../Helpers/ProgressMeasurmentsCircle.jsx';
import {
  getTrainingAccent,
  getTrainingPanelBackground,
  getTrainingPanelBorder,
  getTrainingPanelShadow
} from './TrainingVisuals.js';

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
  }, []);

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
  const hasData = filteredData.length > 0;
  const delta = currentValue - startValue;

  const getUnit = (index) => index === 0 ? 'kg' : 'cm';

  // --- Styles ---
  const isLight = theme === 'light' || theme === 'speciallight';
  const accent = getTrainingAccent();
  const cardBg = getTrainingPanelBackground(theme, accent);
  const borderColor = getTrainingPanelBorder(theme, accent);

  return (
    <div style={{ width: '100%', maxWidth: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingBottom: '70px' }}>
      
      {/* --- CHART CARD --- */}
      <div style={{ 
          width: '100%', minHeight: '310px', 
          background: cardBg, borderRadius: '24px', border: `1px solid ${borderColor}`,
          boxShadow: getTrainingPanelShadow(theme, accent),
          padding: '15px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12}}>
          <div>
            <div style={{fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: accent.hue, marginBottom: 4}}>
              {langIndex === 0 ? 'Аналитика замеров' : 'Measurements analytics'}
            </div>
            <div style={{fontSize: 22, fontWeight: 850, color: Colors.get('mainText', theme), lineHeight: 1.1}}>
              {metricLabels[metricIndex][langIndex]}
            </div>
          </div>
          <div style={{
            textAlign: 'right',
            padding: '9px 12px',
            borderRadius: 16,
            background: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.055)',
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
          }}>
            <div style={{fontSize: 10, fontWeight: 850, color: Colors.get('subText', theme), textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              {langIndex === 0 ? 'сейчас' : 'current'}
            </div>
            <div style={{fontSize: 20, fontWeight: 900, color: Colors.get('mainText', theme), fontVariantNumeric: 'tabular-nums'}}>
              {hasData ? currentValue.toFixed(getUnit(metricIndex) === 'kg' ? 1 : 1) : '-'} <span style={{fontSize: 11, color: Colors.get('subText', theme)}}>{getUnit(metricIndex)}</span>
            </div>
          </div>
        </div>

        {/* Metric Selector (Scrollable Chips) */}
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '8px', paddingBottom: '10px' }}>
            {metricLabels.map((label, idx) => {
                const isActive = metricIndex === idx;
                return (
                    <Motion.div
                        key={idx}
                        onClick={() => setMetricIndex(idx)}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '6px 14px', borderRadius: '20px',
	                            background: isActive ? accent.soft : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
                              border: `1px solid ${isActive ? accent.ring : 'transparent'}`,
	                            color: isActive ? accent.hue : Colors.get('subText', theme),
	                            fontSize: fSize === 0 ? '12px' : '14px', fontWeight: isActive ? '800' : '600',
                            whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        {label[langIndex]}
                    </Motion.div>
                )
            })}
        </div>

        {/* Chart Area */}
        <div style={{ flex: 1, width: '100%', marginTop: '5px', minHeight: 190 }}>
          {hasData ? (
            <MyAreaChart
              data={chartData}
              fillColor={Colors.get(getAreaChart(goal, startValue, currentValue), theme)}
              textColor={Colors.get('subText', theme)}
              linesColor={Colors.get('border', theme)}
              backgroundColor="transparent"
            />
          ) : (
            <EmptyMeasureState theme={theme} langIndex={langIndex} />
          )}
        </div>
      </div>

      {/* --- CONTROLS & STATS --- */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        
        {/* Period Selector (Segmented Control) */}
        <div style={{
	            display: 'flex', background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
	            padding: '4px', borderRadius: '16px', width: '100%', maxWidth: '400px'
	        }}>
            {periodLabels.map((label, idx) => {
                const isActive = periodIndex === idx;
                return (
                    <div key={idx} onClick={() => setPeriodIndex(idx)} style={{ flex: 1, position: 'relative', cursor: 'pointer', textAlign: 'center', padding: '8px 0' }}>
                        {isActive && (
                            <Motion.div
                                layoutId="periodTab"
                                style={{
	                                    position: 'absolute', inset: 0, background: accent.soft,
                                      border: `1px solid ${accent.ring}`,
	                                    borderRadius: '12px', boxShadow: `0 8px 20px rgba(${accent.rgb}, 0.13)`
                                }}
                            />
                        )}
	                        <span style={{ position: 'relative', zIndex: 1, fontSize: '13px', fontWeight: isActive ? '800' : '600', color: isActive ? Colors.get('mainText', theme) : Colors.get('subText', theme) }}>
                            {label[langIndex]}
                        </span>
                    </div>
                )
            })}
        </div>

        <div style={{ 
            padding: '18px', borderRadius: '30px', 
	            background: cardBg, border: `1px solid ${borderColor}`,
              boxShadow: getTrainingPanelShadow(theme, accent),
	            display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) 210px',
              gap: '16px',
              alignItems: 'center',
              boxSizing: 'border-box',
              width: '100%',
              maxWidth: 600
        }}>
            <div style={{minWidth: 0}}>
              <div style={{fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: Colors.get('subText', theme), marginBottom: 8}}>
                {periodLabels[periodIndex][langIndex]}
              </div>
              <div style={{fontSize: 30, fontWeight: 900, color: delta >= 0 ? '#10B981' : '#EF4444', lineHeight: 1, marginBottom: 8}}>
                {delta >= 0 ? '+' : ''}{delta.toFixed(1)} <span style={{fontSize: 14, color: Colors.get('subText', theme)}}>{getUnit(metricIndex)}</span>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap: 8}}>
                <MiniMeasure label={langIndex === 0 ? 'Старт' : 'Start'} value={startValue} unit={getUnit(metricIndex)} theme={theme} />
                <MiniMeasure label={langIndex === 0 ? 'Среднее' : 'Average'} value={mediumValue} unit={getUnit(metricIndex)} theme={theme} />
                <MiniMeasure label={langIndex === 0 ? 'Финиш' : 'End'} value={currentValue} unit={getUnit(metricIndex)} theme={theme} />
              </div>
            </div>
            <ProgressMeasurmentsCircle
                startValue={startValue}
                endValue={currentValue}
                mediumValue={mediumValue}
                unit={getUnit(metricIndex)}
                langIndex={langIndex}
                goal={goal === 2 ? 1 : 0}
                size={190}
                theme={theme}
                textColor={Colors.get('mainText', theme)}
                linesColor={isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
                minColor="#FF453A"
                maxColor="#30D158"
	                mediumColor={accent.hue}
            />
        </div>
      </div>
    </div>
  );
};

export default TrainingMeasurmentsAnalitics;

const MiniMeasure = ({ label, value, unit, theme }) => (
  <div style={{
    padding: '10px 8px',
    borderRadius: 14,
    background: theme === 'light' || theme === 'speciallight' ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)',
    border: `1px solid ${theme === 'light' || theme === 'speciallight' ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
  }}>
    <div style={{fontSize: 9, fontWeight: 850, letterSpacing: '0.08em', textTransform: 'uppercase', color: Colors.get('subText', theme), marginBottom: 5}}>
      {label}
    </div>
    <div style={{fontSize: 15, fontWeight: 850, color: Colors.get('mainText', theme), fontVariantNumeric: 'tabular-nums'}}>
      {value ? value.toFixed(1) : '-'} <span style={{fontSize: 9, color: Colors.get('subText', theme)}}>{unit}</span>
    </div>
  </div>
);

const EmptyMeasureState = ({ theme, langIndex }) => (
  <div style={{
    height: '100%',
    minHeight: 184,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    borderRadius: 20,
    border: `1px dashed ${theme === 'light' || theme === 'speciallight' ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)'}`,
    color: Colors.get('subText', theme),
    fontSize: 14,
    fontWeight: 700,
    lineHeight: 1.45,
  }}>
    {langIndex === 0 ? 'Добавьте несколько замеров, чтобы увидеть график и динамику.' : 'Add a few measurements to see the chart and trend.'}
  </div>
);

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
