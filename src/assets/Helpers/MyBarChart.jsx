import React from 'react';
import Colors from '../StaticClasses/Colors';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList
} from 'recharts';

const msToHhMm = (ms) => {
  if (!ms || ms <= 0) return '0:00';
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

const msToHours = (ms) => ms / (1000 * 60 * 60);

const MyBarChart = ({
  data = [],
  theme = 'dark',
  textColor = '#94a3b8',
  linesColor = '#334155',
  backgroundColor = 'transparent',
  height = 220
}) => {
  const isLight = theme === 'light';

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: textColor, opacity: 0.6,
        fontFamily: 'Segoe UI, sans-serif', fontSize: '14px',
      }}>
        No sleep data available
      </div>
    );
  }

  // Mood colors from app palette
  const MOOD_COLORS = {
                  1:Colors.get('veryBad', theme),
                2:Colors.get('bad', theme),
                 3:Colors.get('normal', theme), 
                4:Colors.get('good', theme), 
                5:Colors.get('perfect', theme),
  };

  const chartData = data.map(item => ({
    date: item.date,
    ms: item.ms || 0,
    mood: Math.max(1, Math.min(5, Math.round(item.mood || 3))),
    hours: msToHours(item.ms || 0)
  }));

  const maxHours = Math.max(...chartData.map(d => d.hours), 1);
  const getBarColor = (mood) => MOOD_COLORS[mood] || MOOD_COLORS[3];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      const ms = entry?.ms || 0;
      const mood = entry?.mood || 0;
      const stars = mood ? '★'.repeat(mood) : '—';
      const color = getBarColor(mood);

      return (
        <div style={{
          backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.9)',
          backdropFilter: 'blur(10px)',
          padding: '10px 14px',
          borderRadius: '12px',
          border: `1px solid ${color}40`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          fontFamily: 'Segoe UI',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', color: textColor, marginBottom: '4px', opacity: 0.8 }}>{label}</div>
          <div style={{ fontSize: '16px', fontWeight: '700', color: Colors.get('mainText', theme) }}>
            {msToHhMm(ms)} <span style={{ fontSize: '11px', fontWeight: '400' }}>hrs</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '12px', fontWeight: '600', color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>Mood:</span> <span style={{ letterSpacing: '2px' }}>{stars}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{
      width: '100%',
      height: `${height}px`,
      backgroundColor,
      borderRadius: '16px',
      padding: '10px 0',
      fontFamily: 'Segoe UI, sans-serif'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
          barSize={18} // Slimmer, elegant bars
        >
          <defs>
            {/* Create dynamic gradients for each mood color used */}
            {[1, 2, 3, 4, 5].map(m => (
              <linearGradient key={m} id={`grad-${m}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={getBarColor(m)} stopOpacity={1} />
                <stop offset="100%" stopColor={getBarColor(m)} stopOpacity={0.6} />
              </linearGradient>
            ))}
          </defs>

          <CartesianGrid 
            stroke={linesColor} 
            strokeOpacity={0.2} 
            vertical={false} 
            strokeDasharray="4 4" 
          />
          
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 10, opacity: 0.7 }}
            axisLine={false}
            tickLine={false}
            dy={10}
            interval="preserveStartEnd"
          />
          
          <YAxis
            domain={[0, Math.ceil(maxHours + 1)]} // Add buffer
            tick={{ fill: textColor, fontSize: 10, opacity: 0.7 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `${value}h`}
          />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', radius: 4 }} 
          />
          
          <Bar
            dataKey="hours"
            radius={[6, 6, 6, 6]} // Fully rounded bars
            animationDuration={1200}
            shape={(props) => {
              const { x, y, width, height, index } = props;
              const mood = chartData[index]?.mood || 3;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={`url(#grad-${mood})`}
                  rx={width / 2} // Pill shape
                  ry={width / 2}
                />
              );
            }}
          >
            <LabelList
              dataKey="ms"
              position="top"
              offset={8}
              fontSize={10}
              fontWeight={600}
              fill={textColor}
              formatter={(value) => msToHhMm(value)}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MyBarChart;