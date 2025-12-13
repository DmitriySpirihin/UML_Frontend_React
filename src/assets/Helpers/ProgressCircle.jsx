

const ProgressCircle = ({ 
  maxValue = 100, 
  averageValue = 70, 
  minValue = 40,
  unit = 'kg',
  maxColor = '#e74c3c',
  minColor = '#2ecc71',
  lineColor = '#3498db',
  textColor = '#3498db',
  size = 120 // diameter in px
}) => {
  const radius = size / 2;
  const strokeWidth = 7;
  const spacing = strokeWidth / 2; // space between circles
  
  // Circle radii (accounting for stroke width)
  const maxRadius = radius - strokeWidth / 2;
  const avgRadius = maxRadius - spacing - strokeWidth / 2;
  const minRadius = avgRadius - spacing - strokeWidth / 2;

  const maxCircumference = 2 * Math.PI * maxRadius;
  const avgCircumference = 2 * Math.PI * avgRadius;
  const minCircumference = 2 * Math.PI * minRadius;

  return (
    <div style={{ display: 'inline-block' }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: 'rotate(-90deg)' }} // Start from top
      >
        {/* Max Circle (100% - full ring) */}
        <circle
          cx={radius}
          cy={radius}
          r={maxRadius}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius}
          cy={radius}
          r={maxRadius}
          fill="none"
          stroke={maxColor} // Red for max
          strokeWidth={strokeWidth}
          strokeDasharray={maxCircumference}
          strokeDashoffset={0}
          strokeLinecap="round"
        />

        {/* Average Circle */}
        <circle
          cx={radius}
          cy={radius}
          r={avgRadius}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius}
          cy={radius}
          r={avgRadius}
          fill="none"
          stroke={lineColor} // Blue for average
          strokeWidth={strokeWidth}
          strokeDasharray={avgCircumference}
          strokeDashoffset={avgCircumference * (1 - averageValue / maxValue)}
          strokeLinecap="round"
        />

        {/* Min Circle */}
        <circle
          cx={radius}
          cy={radius}
          r={minRadius}
          fill="none"
          stroke={minColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={radius}
          cy={radius}
          r={minRadius}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeDasharray={minCircumference}
          strokeDashoffset={minCircumference * (1 - minValue / maxValue)}
          strokeLinecap="round"
        />
      </svg>

      {/* Centered Text */}
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
          color: {textColor},
          fontSize: '12px',
          fontWeight: 'bold',
          lineHeight: 1.2
        }}
      >
        <div>MAX</div>
        <div style={{ fontSize: '16px', color: '#e74c3c' }}>
          {maxValue} {unit}
        </div>
        <div style={{ marginTop: '4px', fontSize: '10px' }}>
          <span style={{ color: '#3498db' }}>Avg: {averageValue} </span>
          <span style={{ color: '#2ecc71' }}>Min: {minValue}</span>
        </div>
      </div>
    </div>
  );
};

export default ProgressCircle;