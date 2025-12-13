import React, { useState } from 'react';
import { FaBorderTopLeft } from 'react-icons/fa6';

const BarChart = ({ theme, data = [], mark = 'kg', color = '#4a90e2' }) => {
  const TOTAL_DAYS = 60;
  const WIDTH = 95; // % of container
  const HEIGHT = 30; // vh
  const GAP = 2; // px between bars
  const PADDING_TOP = 5; // % top padding
  const PADDING_BOTTOM = 10; // % bottom padding
  const CHART_HEIGHT = 100 - PADDING_TOP - PADDING_BOTTOM; // 80% chart area

  const [selectedBar, setSelectedBar] = useState(null); // {date, value, index}

  // Generate date range: [today-60d, ..., today]
  const today = new Date();
  const dateRange = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dateRange.push(date.toISOString().split('T')[0]);
  }

  // Create data map and calculate stats
  const dataMap = new Map();
  let totalValue = 0;
  let validCount = 0;
  
  data.forEach(item => {
    dataMap.set(item.date, item.value);
    totalValue += item.value;
    validCount++;
  });
  
  const hasData = data.length > 0;
  const minValue = hasData ? Math.min(...data.map(d => d.value)) : 0;
  const maxValue = hasData ? Math.max(...data.map(d => d.value)) : 1;
  const averageValue = validCount > 0 ? totalValue / validCount : 0;
  const chartMax = maxValue * 1.1; // +10% padding

  // Calculate Y position within chart area
  const getYPosInChart = (value) => {
  if (chartMax <= 0) return CHART_HEIGHT; // Bottom of chart area
  return ((value / chartMax) * CHART_HEIGHT); // 0% = bottom, 100% = top
};

  // Handle bar click
  const handleBarClick = (date, value, index) => {
    if (value !== undefined) {
      // Toggle selection
      if (selectedBar && selectedBar.date === date) {
        setSelectedBar(null);
      } else {
        setSelectedBar({ date, value, index });
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      height: `${HEIGHT}vh`,
      position: 'relative',
      margin: '20px 0',
      display: 'flex',
      justifyContent: 'center'
    }}>
      {/* Chart Container */}
      <div style={{
        width: `${WIDTH}%`,
        height: '100%',
        position: 'relative'
      }}>
        {/* Y-Axis Line */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: `${PADDING_TOP}%`,
          bottom: `${PADDING_BOTTOM}%`,
          width: '1px',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }} />
        
        {/* X-Axis Line */}
        <div style={{
          position: 'absolute',
          left: '0',
          right: '0',
          bottom: `${PADDING_BOTTOM}%`,
          height: '1px',
          backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
        }} />
        
        {/* Subtle Horizontal Grid Lines */}
        <div style={{
          position: 'absolute',
          left: '0',
          right: '0',
          top: `${PADDING_TOP}%`,
          height: `${CHART_HEIGHT}%`,
          backgroundImage: `
            linear-gradient(
              to bottom,
              transparent 99%,
              ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 100%
            )
          `,
          backgroundSize: '1px 10%',
          pointerEvents: 'none'
        }} />
        
        {/* Reference Lines */}
        <div style={{
          position: 'absolute',
          left: '0',
          top: `${PADDING_TOP}%`,
          width: '100%',
          height: `${CHART_HEIGHT}%`,
          overflow: 'hidden'
        }}>
          {hasData && (
            <>
              <div style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(maxValue)}%`,
        height: '1px',
        backgroundColor: '#e74c3c',
        opacity: 0.7
      }} />
              <div style={{
                position: 'absolute',
                left: '0',
                right: '130%',
                top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(maxValue)}%`,
                fontSize: '6px',
                color: '#e74c3c',
                textAlign: 'center',
              }} >{maxValue + mark}</div>
              
              {validCount > 0 && (
                <div style={{
          position: 'absolute',
          left: '0',
          right: '0',
          top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(averageValue)}%`,
          height: '1px',
          backgroundColor: '#6d7072ff',
          opacity: 0.7
        }} />
              )}
              <div style={{
                position: 'absolute',
                left: '0',
                right: '130%',
                top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(averageValue)}%`,
                fontSize: '6px',
                color: '#6d7072ff',
                textAlign: 'center',
              }} >{averageValue.toFixed() + mark}</div>
              
              <div style={{
        position: 'absolute',
        left: '0',
        right: '0',
        top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(minValue)}%`,
        height: '1px',
        backgroundColor: '#2ecc71',
        opacity: 0.7
      }} />
              <div style={{
                position: 'absolute',
                left: '0',
                right: '130%',
                top: `${PADDING_TOP + CHART_HEIGHT - getYPosInChart(minValue)}%`,
                fontSize: '6px',
                color: '#2ecc71',
                textAlign: 'center',
              }} >{minValue + mark}</div>
            </>
          )}
        </div>

        {/* Bars Container */}
        <div style={{
          width: '100%',
          height: `${CHART_HEIGHT}%`,
          display: 'flex',
          alignItems: 'flex-end',
          position: 'absolute',
          top: `${PADDING_TOP}%`,
          left: 0,
          gap: `${GAP}px`
        }}>
          {dateRange.map((date, index) => {
            const value = dataMap.get(date);
            const hasValue = value !== undefined;
            const isSelected = selectedBar?.date === date;
            const borderTopLeftRadius = '4px';
            const borderTopRightRadius = '4px';
            const barColor = isSelected 
              ? (theme === 'dark' ? '#5772caff' : '#ff6600') // Highlight color
              : color;
            
            return (
              <div
                key={date}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: hasValue ? 'pointer' : 'default',
                  transition: 'transform 0.2s'
                }}
                onClick={() => handleBarClick(date, value, index)}
              >
                <div
  style={{
    width: '80%',
    height: '100%',
    backgroundColor: hasValue ? barColor : 'transparent',
    borderLeft: '1px solid rgba(76, 69, 69, 0.2)',
    ...(hasValue && {
      background: `linear-gradient(to top, ${barColor} ${((value / chartMax) * 100)}%, transparent ${((value / chartMax) * 100)}%)`
    })
  }}
/>
              </div>
            );
          })}
        </div>

        {/* X-Axis Labels */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          position: 'absolute',
          bottom: '0',
          left: 0,
          right: 0,
          height: '20px'
        }}>
          <div style={{
            fontSize: '10px',
            color: theme === 'dark' ? '#888' : '#777',
            textAlign: 'center',
            width: '33%'
          }}>
            {dateRange[0]}
          </div>
          <div style={{
            fontSize: '10px',
            color: theme === 'dark' ? '#888' : '#777',
            textAlign: 'center',
            width: '33%'
          }}>
            {dateRange[Math.floor(TOTAL_DAYS / 2)]}
          </div>
          <div style={{
            fontSize: '10px',
            color: theme === 'dark' ? '#888' : '#777',
            textAlign: 'center',
            width: '33%'
          }}>
            {dateRange[TOTAL_DAYS - 1]}
          </div>
        </div>
      </div>

      {/* Tooltip (appears on click with zIndex 1) */}
      {selectedBar && (
        <>
          {/* Background overlay */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 0
            }}
            onClick={() => setSelectedBar(null)}
          />
          
          {/* Tooltip */}
          <div
            style={{
              position: 'absolute',
              top: '10%',
              left: `${(selectedBar.index / (TOTAL_DAYS - 1)) * WIDTH + (100 - WIDTH) / 2}%`,
              transform: 'translateX(-50%)',
              backgroundColor: theme === 'dark' ? 'rgba(30, 30, 30, 0.95)' : 'rgba(250, 250, 250, 0.95)',
              color: theme === 'dark' ? '#fff' : '#000',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 1,
              border: `1px solid ${theme === 'dark' ? '#555' : '#ddd'}`
            }}
          >
            <div>{selectedBar.date}</div>
            <div style={{ color: selectedBar.value > 0 ? (theme === 'dark' ? '#ff9900' : '#ff6600') : color, fontSize: '16px' }}>
              {selectedBar.value} {mark}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BarChart;