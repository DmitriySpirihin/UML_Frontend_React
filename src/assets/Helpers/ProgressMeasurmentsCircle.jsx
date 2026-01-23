import React from 'react';
import { motion } from 'framer-motion';

const ProgressMeasurmentsCircle = ({
  startValue = 50,
  endValue = 70,
  mediumValue = 60,
  unit = 'kg',
  langIndex = 0,
  goal = 0,
  size = 220,
  textColor = '#fff',
  linesColor = '#333',
  minColor = '#e74c3c',
  maxColor = '#2ecc71',
  mediumColor = '#3498db',
}) => {
  
  // Logic
  const actualChange = endValue - startValue;
  const absoluteChange = Math.abs(actualChange);
  const noChange = actualChange === 0;
  const isProgress = goal === 0 ? actualChange > 0 : actualChange < 0; // Goal 0 = Gain, Goal 1 = Loss

  const displaySign = actualChange >= 0 ? '+' : '−';
  
  // Colors based on goal
  const progressColor = noChange ? textColor : (isProgress ? maxColor : minColor);
  
  // Circles Configuration
  const strokeWidth = 10;
  const gap = 12; // Gap between rings
  const radius1 = (size / 2) - strokeWidth;
  const radius2 = radius1 - strokeWidth - gap;
  const radius3 = radius2 - strokeWidth - gap;

  const circ1 = 2 * Math.PI * radius1;
  const circ2 = 2 * Math.PI * radius2;
  const circ3 = 2 * Math.PI * radius3;

  const maxValue = Math.max(startValue, mediumValue, endValue) * 1.1 || 1; // Avoid division by zero

  // Animation Variants
  const circleVariants = (circumference, val, max) => ({
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset: circumference * (1 - val / max),
      transition: { duration: 1.5, ease: "easeOut" }
    }
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Circles */}
        <circle cx={size/2} cy={size/2} r={radius1} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
        <circle cx={size/2} cy={size/2} r={radius2} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />
        <circle cx={size/2} cy={size/2} r={radius3} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.3} />

        {/* Value Circles (Animated) */}
        {/* Outer: End Value (Current) */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius1} fill="none"
          stroke={progressColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ1}
          variants={circleVariants(circ1, endValue, maxValue)}
          initial="hidden" animate="visible"
        />

        {/* Middle: Medium Value */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius2} fill="none"
          stroke={mediumColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ2}
          variants={circleVariants(circ2, mediumValue, maxValue)}
          initial="hidden" animate="visible"
        />

        {/* Inner: Start Value */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius3} fill="none"
          stroke={textColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.5}
          strokeDasharray={circ3}
          variants={circleVariants(circ3, startValue, maxValue)}
          initial="hidden" animate="visible"
        />
      </svg>

      {/* Center Text Info */}
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* Change Value (Hero) */}
        <div style={{ fontSize: '32px', fontWeight: '900', color: progressColor, lineHeight: '1' }}>
          {displaySign}{absoluteChange.toFixed(1)}
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '2px' }}>{unit}</span>
        </div>
        <div style={{ fontSize: '11px', color: textColor, opacity: 0.5, textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
          {langIndex === 0 ? 'Изменение' : 'Change'}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
            <LegendItem label={langIndex===0?'Начало':'Start'} val={startValue} color={textColor} opacity={0.5} />
            <LegendItem label={langIndex===0?'Среднее':'Avg'} val={mediumValue} color={mediumColor} />
            <LegendItem label={langIndex===0?'Конец':'End'} val={endValue} color={progressColor} />
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, val, color, opacity = 1 }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, opacity: opacity, marginBottom: '2px' }} />
        <span style={{ fontSize: '12px', fontWeight: '700', color: color, opacity: opacity }}>{val.toFixed(0)}</span>
    </div>
)

export default ProgressMeasurmentsCircle;