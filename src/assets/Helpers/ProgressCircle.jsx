

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
  baseColor = '#95a5a6',
}) => {
  // Calculate progress metrics
  const isProgress = endValue > startValue;
  const progressValue = endValue - startValue;
  const isEven = endValue === startValue;
  const progressSign = isProgress ? '+' : isEven ? '' : '-';
  const progressEmoji = isProgress ? '↗️' : isEven ? '➖' : '↘️';
  const progressColor = isProgress ? maxColor : minColor;
  
  // Colors
  const trackColor = linesColor;
  const startColor = isProgress ? minColor : maxColor;    // Neutral gray for start
  const mediumColor = mediumcolor;   // Blue for medium
  const endColor = isProgress ? maxColor : minColor;  // Green/red based on progress
  
  const radius = size / 2;
  const strokeWidth = 7;
  const spacing = strokeWidth / 2;
  
  // Circle radii (from outer to inner)
  const startRadius = radius - strokeWidth / 2;
  const mediumRadius = startRadius - spacing - strokeWidth / 2;
  const endRadius = mediumRadius - spacing - strokeWidth / 2;
  
  // Circumferences
  const startCirc = 2 * Math.PI * startRadius;
  const mediumCirc = 2 * Math.PI * mediumRadius;
  const endCirc = 2 * Math.PI * endRadius;
  
  // Calculate max value with 10% padding
  const maxValue = Math.max(startValue, mediumValue, endValue) * 1.1;
  
  return (
    <div style={{ display: 'inline-block',width:size,height:size}}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }} // Start from top
      >
        {/* Start Circle Track (Outer) */}
        <circle
          cx={radius}
          cy={radius}
          r={startRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Start Circle (Always 100% filled) */}
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

        {/* Medium Circle Track */}
        <circle
          cx={radius}
          cy={radius}
          r={mediumRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Medium Circle (Filled proportionally) */}
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

        {/* End Circle Track (Inner) */}
        <circle
          cx={radius}
          cy={radius}
          r={endRadius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* End Circle (Filled proportionally) */}
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

      {/* Centered Progress Text */}
      <div 
        style={{
          position: 'relative',
          top: `-${size}px`,
          width: `${size}px`,
          height: `${size}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: textColor,
          fontSize: '12px',
          fontWeight: 'bold',
          lineHeight: 1.2
        }}
      >
        <div style={{ fontSize: '14px', opacity: 0.8,color: startColor }}>
          {langIndex === 0 ? 'Начало:' : 'Start:'} {Number.isInteger(startValue) ? startValue : startValue.toFixed(2)} {unit}
        </div>
        <div style={{ 
          fontSize: '24px', 
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          color : isProgress ? maxColor : isEven ? textColor : minColor,
          gap: '4px'
        }}>
          {progressEmoji}
          <span>{progressSign}{Math.abs(progressValue.toFixed())} {unit}</span>
        </div>
        <div style={{ fontSize: '14px', color: endColor, marginTop: '4px' }}>
          {langIndex === 0 ? 'Конец:' : 'End:'} {Number.isInteger(endValue) ? endValue : endValue.toFixed(2)} {unit}
        </div>
        <div style={{ fontSize: '10px', color: mediumColor, marginTop: '4px' }}>
          {langIndex === 0 ? 'Среднее:' : 'Medium:'} {Number.isInteger(mediumValue) ? mediumValue : mediumValue.toFixed(2)} {unit}
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;
