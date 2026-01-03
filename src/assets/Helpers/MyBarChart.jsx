// src/Helpers/MyBarChart.jsx
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
  theme = 'dark', // 👈 accept theme
  textColor = '#94a3b8',
  linesColor = '#334155',
  backgroundColor = '#0f172a',
  height = 220
}) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: textColor,
        backgroundColor,
        fontFamily: 'Segoe UI, system-ui, sans-serif',
        fontSize: '14px',
        borderRadius: '12px'
      }}>
        No data
      </div>
    );
  }

  // ✅ Compute mood colors DYNAMICALLY using current theme
  const MOOD_COLORS = {
    1: Colors.get('difficulty3', theme),
    2: Colors.get('difficulty2', theme),
    3: Colors.get('difficulty1', theme),
    4: Colors.get('difficulty0', theme),
    5: Colors.get('difficulty5', theme),
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
      const stars = mood ? '★'.repeat(mood) + '☆'.repeat(5 - mood) : '—';

      return (
        <div style={{
          backgroundColor: Colors.get('panel', theme) || '#1e293b',
          padding: '10px',
          borderRadius: '8px',
          border: `1px solid ${linesColor}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontFamily: 'Segoe UI',
          fontSize: '13px',
          color: Colors.get('mainText', theme) || '#f1f5f9'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>{label}</div>
          <div>Sleep: {msToHhMm(ms)}</div>
          <div style={{ marginTop: '4px', color: getBarColor(mood) }}>
            Mood: {stars}
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
      borderRadius: '12px',
      padding: '8px 4px',
      fontFamily: 'Segoe UI, system-ui, sans-serif'
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
        >
          <CartesianGrid stroke={linesColor} strokeOpacity={0.2} vertical={false} />
          
          <XAxis
            dataKey="date"
            tick={{ fill: textColor, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            minTickGap={20}
          />
          
          <YAxis
            domain={[0, Math.ceil(maxHours)]}
            tick={{ fill: textColor, fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
            tickFormatter={(value) => `${Math.round(value)}h`}
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(100,100,100,0.1)' }} />
          
          {/* ✅ Correct way to apply per-bar colors in Recharts */}
          <Bar
            dataKey="hours"
            radius={[4, 4, 0, 0]}
            barSize={28}
            fill="#6366f1"
            shape={(props) => {
              const { x, y, width, height, index } = props;
              const mood = chartData[index]?.mood || 3;
              const fill = getBarColor(mood);
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={4}
                  ry={4}
                />
              );
            }}
          >
            <LabelList
              dataKey="ms"
              position="top"
              fontSize={11}
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