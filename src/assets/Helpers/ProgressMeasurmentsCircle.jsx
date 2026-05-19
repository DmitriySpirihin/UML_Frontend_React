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
  theme = 'dark',
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
  const isLight = theme === 'light' || theme === 'speciallight';
  const strokeWidth = Math.max(8, size * 0.052);
  const gap = Math.max(9, size * 0.052);
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
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size / 2,
      background: isLight
        ? 'radial-gradient(circle at 38% 26%, rgba(255,255,255,0.78), rgba(255,255,255,0.34) 58%, rgba(15,23,42,0.045))'
        : 'radial-gradient(circle at 38% 26%, rgba(255,255,255,0.115), rgba(255,255,255,0.035) 58%, rgba(0,0,0,0.18))',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isLight
        ? '0 18px 42px rgba(15,23,42,0.08), 0 1px 0 rgba(255,255,255,0.72) inset'
        : '0 20px 48px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.07) inset',
      overflow: 'hidden'
    }}>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track Circles */}
        <circle cx={size/2} cy={size/2} r={radius1} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.42} />
        <circle cx={size/2} cy={size/2} r={radius2} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.38} />
        <circle cx={size/2} cy={size/2} r={radius3} fill="none" stroke={linesColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.32} />

        {/* Value Circles (Animated) */}
        {/* Outer: End Value (Current) */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius1} fill="none"
          stroke={progressColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ1}
          filter="drop-shadow(0 0 5px rgba(255,255,255,0.12))"
          variants={circleVariants(circ1, endValue, maxValue)}
          initial="hidden" animate="visible"
        />

        {/* Middle: Medium Value */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius2} fill="none"
          stroke={mediumColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ2}
          opacity={0.88}
          variants={circleVariants(circ2, mediumValue, maxValue)}
          initial="hidden" animate="visible"
        />

        {/* Inner: Start Value */}
        <motion.circle
          cx={size/2} cy={size/2} r={radius3} fill="none"
          stroke={textColor} strokeWidth={strokeWidth} strokeLinecap="round" opacity={0.36}
          strokeDasharray={circ3}
          variants={circleVariants(circ3, startValue, maxValue)}
          initial="hidden" animate="visible"
        />
      </svg>

      {/* Center Text Info */}
      <div style={{ position: 'absolute', width: '72%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        
        {/* Change Value (Hero) */}
        <div style={{ fontSize: Math.max(24, size * 0.17), fontWeight: '900', color: progressColor, lineHeight: '1' }}>
          {displaySign}{absoluteChange.toFixed(1)}
          <span style={{ fontSize: '14px', fontWeight: '600', marginLeft: '2px' }}>{unit}</span>
        </div>
        <div style={{ fontSize: Math.max(9, size * 0.052), color: textColor, opacity: 0.58, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '5px', fontWeight: 800 }}>
          {langIndex === 0 ? 'Изменение' : 'Change'}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: Math.max(8, size * 0.055), marginTop: Math.max(10, size * 0.062) }}>
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
        <span style={{ fontSize: '11px', fontWeight: '800', color: color, opacity: opacity, fontVariantNumeric: 'tabular-nums' }}>{val.toFixed(0)}</span>
    </div>
)

export default ProgressMeasurmentsCircle;
