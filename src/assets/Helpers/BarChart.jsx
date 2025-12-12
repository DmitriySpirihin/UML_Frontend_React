import React from 'react';

const BarChart = ({ theme, data, mark = 'kg', color = '#4a90e2' }) => {
  if (!data || data.length === 0) return null;

  // Calculate chart dimensions
  const WIDTH = 100; // % width
  const HEIGHT = 30; // vh height
  const PADDING = 6;

  // Find max value (add 10% padding)
  const maxValue = Math.max(...data.map(d => d.value));
  const chartMax = maxValue * 1.1; // +10% for top spacing

  // Calculate median value
  const sortedValues = [...data.map(d => d.value)].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];

  // Bar width calculation
  const barWidth = WIDTH / data.length;

  return (
    <div 
      style={{ 
        width: '100%', 
        height: `${HEIGHT}vh`,
        position: 'relative',
        margin: '20px 0'
      }}
    >
      {/* Y-Axis Label (Max Value + Unit) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: '-10px',
          fontSize: '12px',
          color: theme === 'dark' ? '#fff' : '#000',
          fontWeight: 'bold'
        }}
      >
        {Math.round(maxValue)} {mark}
      </div>

      {/* Median Line (always shown) */}
      <div 
        style={{
          position: 'absolute',
          top: `${((chartMax - median) / chartMax) * (100 - 2 * PADDING)}%`,
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: '#ff9900',
          zIndex: 1
        }}
      >
        <span 
          style={{
            position: 'absolute',
            right: '-10px',
            top: '-10px',
            fontSize: '10px',
            color: '#ff9900',
            backgroundColor: theme === 'dark' ? '#222' : '#fff',
            padding: '0 4px'
          }}
        >
          {Math.round(median)} {mark}
        </span>
      </div>

      {/* Bars */}
      <div 
        style={{ 
          display: 'flex', 
          height: '100%',
          padding: `${PADDING}% ${PADDING}% 0`,
          boxSizing: 'border-box'
        }}
      >
        {data.map((item, index) => {
          const barHeight = (item.value / chartMax) * (100 - 2 * PADDING);
          return (
            <div 
              key={index}
              style={{
                width: `${barWidth}%`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              {/* Bar with custom color */}
              <div 
                style={{
                  width: '80%',
                  height: `${barHeight}%`,
                  backgroundColor: color,
                  borderRadius: '4px 4px 0 0',
                  marginTop: 'auto'
                }}
              />
              
              {/* X-Axis Label (Full Date) */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: '-20px',
                  fontSize: '10px',
                  color: theme === 'dark' ? '#bbb' : '#555',
                  textAlign: 'center',
                  width: '100%',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.date} {/* Now shows "2025-11-12" */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;