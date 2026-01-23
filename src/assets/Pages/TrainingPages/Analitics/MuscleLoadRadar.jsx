import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import Colors from '../../../StaticClasses/Colors';

// Modern Glass Tooltip
const CustomTooltip = ({ active, payload, label, theme, langIndex }) => {
  if (active && payload && payload.length) {
    const isLight = theme === 'light';
    const value = payload[0].value;
    const loadText = langIndex === 0 ? 'Нагрузка' : 'Load';

    return (
      <div style={{
        backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.9)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${Colors.get('border', theme)}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        textAlign: 'center',
        minWidth: '120px'
      }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: Colors.get('mainText', theme), marginBottom: '4px' }}>
          {label}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: Colors.get('subText', theme) }}>
          {loadText}: <span style={{ fontWeight: 'bold', color: payload[0].stroke }}>{value}%</span>
        </p>
      </div>
    );
  }
  return null;
};

function MuscleLoadRadar({ theme, langIndex, muscleLoadData }) {
  const isLight = theme === 'light';
  
  // Colors from your system
  const gridColor = Colors.get('icons', theme);
  const textColor = Colors.get('subText', theme);
  const radarFill = Colors.get('radar', theme);
  const radarStroke = Colors.get('radarBorder', theme);

  return (
    <div style={{ width: '100%', height: '300px', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%" className="muscle-load-chart">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleLoadData}>
          
          <defs>
            {/* Soft Glow Filter */}
            <filter id="radarGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <PolarGrid
            gridType="polygon"
            stroke={gridColor}
            strokeOpacity={isLight ? 0.15 : 0.1} // Subtle grid
          />

          <PolarAngleAxis
            dataKey="muscle"
            tickLine={false}
            axisLine={false}
            tick={{
              fill: textColor,
              fontSize: 11,
              fontWeight: 500
            }}
          />

          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false} // Hidden for cleaner look
            axisLine={false}
          />

          <Radar
            name="Load"
            dataKey="load"
            stroke={radarStroke}
            strokeWidth={3}
            fill={radarFill}
            fillOpacity={0.5}
            filter="url(#radarGlow)" // Apply glow
            isAnimationActive={true}
          />

          <Tooltip content={<CustomTooltip theme={theme} langIndex={langIndex} />} />
          
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default MuscleLoadRadar;
