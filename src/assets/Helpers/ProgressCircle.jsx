import React from 'react';
import { motion } from 'framer-motion';

const ProgressCircle = ({ 
  startValue = 50, 
  endValue = 70,
  mediumValue = 60,
  unit = 'kg',
  langIndex = 0,
  size = 120, // diameter in px
  textColor = '#acbac3ff',
  linesColor = '#34495e',
  minColor = '#e74c3c',
  maxColor = '#2ecc71',
  mediumcolor = '#3498db',
  // eslint-disable-next-line no-unused-vars
  baseColor = '#95a5a6', 
}) => {
  // --- Logic (Kept Intact) ---
  const isProgress = endValue > startValue;
  const progressValue = endValue - startValue;
  const isEven = endValue === startValue;
  const progressSign = isProgress ? '+' : isEven ? '' : '-';
  const progressEmoji = isProgress ? '↗️' : isEven ? '➖' : '↘️';
  
  // Colors
  const trackColor = linesColor;
  const startColor = isProgress ? minColor : maxColor;    // Neutral/Base
  const mediumColor = mediumcolor;   // Average
  const endColor = isProgress ? maxColor : minColor;  // Result

  const radius = size / 2;
  const strokeWidth = 8; // Slightly thicker for modern look
  const spacing = strokeWidth + 2; // Add breathing room between rings

  // Circle radii (Outer -> Inner)
  const startRadius = radius - strokeWidth / 2;
  const mediumRadius = startRadius - spacing;
  const endRadius = mediumRadius - spacing;

  // Circumferences
  const startCirc = 2 * Math.PI * startRadius;
  const mediumCirc = 2 * Math.PI * mediumRadius;
  const endCirc = 2 * Math.PI * endRadius;

  // Calculate max value with padding
  const maxValue = Math.max(startValue, mediumValue, endValue) * 1.1 || 1;

  // Animation Variants
  const drawCircle = (circumference, val) => ({
    hidden: { strokeDashoffset: circumference },
    visible: { 
      strokeDashoffset: circumference * (1 - val / maxValue),
      transition: { duration: 1.2, ease: "easeOut" }
    }
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* --- TRACKS (Background Rings) --- */}
        <circle cx={radius} cy={radius} r={startRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} opacity={0.2} />
        <circle cx={radius} cy={radius} r={mediumRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} opacity={0.2} />
        <circle cx={radius} cy={radius} r={endRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} opacity={0.2} />

        {/* --- VALUES (Animated Rings) --- */}
        
        {/* Outer: Start Value */}
        <motion.circle
          cx={radius} cy={radius} r={startRadius} fill="none"
          stroke={startColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={startCirc}
          variants={drawCircle(startCirc, startValue)}
          initial="hidden" animate="visible"
          opacity={0.6} // Slightly faded to emphasize the "End" result
        />

        {/* Middle: Medium Value */}
        <motion.circle
          cx={radius} cy={radius} r={mediumRadius} fill="none"
          stroke={mediumColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={mediumCirc}
          variants={drawCircle(mediumCirc, mediumValue)}
          initial="hidden" animate="visible"
        />

        {/* Inner: End Value (Result) */}
        <motion.circle
          cx={radius} cy={radius} r={endRadius} fill="none"
          stroke={endColor} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={endCirc}
          variants={drawCircle(endCirc, endValue)}
          initial="hidden" animate="visible"
        />
      </svg>

      {/* --- CENTER TEXT --- */}
      <div 
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          pointerEvents: 'none' // Click through to whatever is behind
        }}
      >
        {/* Main Metric: The Change */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
          <span style={{ fontSize: '18px' }}>{progressEmoji}</span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: isEven ? textColor : endColor, lineHeight: '1' }}>
            {progressSign}{Math.abs(progressValue).toFixed(1)}
          </span>
          <span style={{ fontSize: '12px', fontWeight: '600', opacity: 0.7 }}>{unit}</span>
        </div>

        {/* Sub-Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            <div style={{ fontSize: '10px', color: startColor, opacity: 0.8 }}>
                {langIndex === 0 ? 'Начало:' : 'Start:'} <b>{Number.isInteger(startValue) ? startValue : startValue.toFixed(1)}</b>
            </div>
            <div style={{ fontSize: '10px', color: endColor }}>
                {langIndex === 0 ? 'Конец:' : 'End:'} <b>{Number.isInteger(endValue) ? endValue : endValue.toFixed(1)}</b>
            </div>
            <div style={{ fontSize: '9px', color: mediumColor, opacity: 0.8, marginTop: '2px' }}>
                ~ {mediumValue.toFixed(1)}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;