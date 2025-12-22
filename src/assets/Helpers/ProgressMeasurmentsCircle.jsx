import React from 'react';

const ProgressMeasurmentsCircle = ({
  startValue = 50,
  endValue = 70,
  mediumValue = 60,
  unit = 'kg',
  langIndex = 0,
  goal = 0,
  size = 120,
  textColor = '#acbac3ff',
  linesColor = '#34495e',
  minColor = '#e74c3c',
  maxColor = '#2ecc71',
  mediumcolor = '#3498db',
  baseColor = '#95a5a6',
}) => {
  const trackColor = linesColor;
  const mediumColor = mediumcolor;

  const actualChange = endValue - startValue;
  const absoluteChange = Math.abs(actualChange);
  const noChange = actualChange === 0;
  const isProgress = goal === 0 ? actualChange > 0 : actualChange < 0;

  const progressEmoji = noChange
    ? '➖'
    : isProgress
      ? '↗️'
      : '↘️';

  const displaySign = actualChange >= 0 ? '+' : '−';
  const progressColor = noChange
    ? textColor
    : isProgress
      ? maxColor
      : minColor;
  let startColor = isProgress ?  minColor : maxColor;
  let endColor = isProgress ?  maxColor : minColor;
  if(noChange){
    startColor = maxColor;
    endColor = maxColor;
  }

  const radius = size / 2;
  const strokeWidth = 9;
  const spacing = strokeWidth / 2;

  const startRadius = radius - strokeWidth / 2;
  const mediumRadius = startRadius - spacing - strokeWidth / 2;
  const endRadius = mediumRadius - spacing - strokeWidth / 2;

  const startCirc = 2 * Math.PI * startRadius;
  const mediumCirc = 2 * Math.PI * mediumRadius;
  const endCirc = 2 * Math.PI * endRadius;

  const maxValue = Math.max(startValue, mediumValue, endValue) * 1.1;

  const tooltipText = langIndex === 0
    ? `Начало: ${startValue.toFixed(2)} ${unit}\nКонец: ${endValue.toFixed(2)} ${unit}\nСреднее: ${mediumValue.toFixed(2)} ${unit}\nИзменение: ${displaySign}${absoluteChange.toFixed(2)} ${unit}`
    : `Start: ${startValue.toFixed(2)} ${unit}\nEnd: ${endValue.toFixed(2)} ${unit}\nAverage: ${mediumValue.toFixed(2)} ${unit}\nChange: ${displaySign}${absoluteChange.toFixed(2)} ${unit}`;

  return (
    <div
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        position: 'relative',
        cursor: 'help',
      }}
      title={tooltipText}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Start Circle */}
        <circle cx={radius} cy={radius} r={startRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={radius}
          cy={radius}
          r={startRadius}
          fill="none"
          stroke={startColor}
          strokeWidth={strokeWidth}
          strokeDasharray={startCirc}
          strokeDashoffset={startCirc * (1 - startValue / maxValue)}
          strokeLinecap="round"
        />

        {/* Medium Circle */}
        <circle cx={radius} cy={radius} r={mediumRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={radius}
          cy={radius}
          r={mediumRadius}
          fill="none"
          stroke={mediumColor}
          strokeWidth={strokeWidth}
          strokeDasharray={mediumCirc}
          strokeDashoffset={mediumCirc * (1 - mediumValue / maxValue)}
          strokeLinecap="round"
        />

        {/* End Circle */}
        <circle cx={radius} cy={radius} r={endRadius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={radius}
          cy={radius}
          r={endRadius}
          fill="none"
          stroke={endColor}
          strokeWidth={strokeWidth}
          strokeDasharray={endCirc}
          strokeDashoffset={endCirc * (1 - endValue / maxValue)}
          strokeLinecap="round"
        />
      </svg>

      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          fontSize: '12px',
          fontWeight: 'bold',
          lineHeight: 1.2,
        }}
      >
        <div style={{ fontSize: '14px', opacity: 0.8, color: startColor }}>
          {langIndex === 0 ? 'Начало:' : 'Start:'} {startValue.toFixed(1)} {unit}
        </div>
        <div
          style={{
            fontSize: '24px',
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            color: progressColor,
            gap: '4px',
          }}
        >
          {progressEmoji}
          <span>
            {displaySign}
            {absoluteChange.toFixed(1)} {unit}
          </span>
        </div>
        <div style={{ fontSize: '14px', color: endColor, marginTop: '4px' }}>
          {langIndex === 0 ? 'Конец:' : 'End:'} {endValue.toFixed(1)} {unit}
        </div>
        <div style={{ fontSize: '10px', color: mediumColor, marginTop: '4px' }}>
          {langIndex === 0 ? 'Среднее:' : 'Medium:'} {mediumValue.toFixed(1)} {unit}
        </div>
      </div>
    </div>
  );
};

export default ProgressMeasurmentsCircle;