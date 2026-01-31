import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList
} from 'recharts';

const ToDoChart = ({
  data = [],
  theme = 'dark',
  textColor = '#94a3b8',
  barColor = '#334155',
}) => {
  const isLight = theme === 'light';

  // 1. Handle empty data gracefully
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: textColor, opacity: 0.5, fontSize: '12px' }}>
        No category data
      </div>
    );
  }

  // 2. Custom Tooltip for Categories
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.9)',
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '12px',
          border: `1px solid ${barColor}40`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          fontFamily: 'Segoe UI',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '11px', color: textColor, marginBottom: '2px', opacity: 0.8 }}>{label}</div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: barColor }}>
            {payload[0].value} <span style={{fontSize:'10px', fontWeight: '400'}}>items</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 10, left: -30, bottom: 0 }}
        barSize={24}
      >
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={barColor} stopOpacity={1} />
            <stop offset="100%" stopColor={barColor} stopOpacity={0.6} />
          </linearGradient>
        </defs>

        <CartesianGrid 
          stroke={textColor} strokeOpacity={0.1} 
          vertical={false} strokeDasharray="4 4" 
        />
        
        <XAxis
          dataKey="name"
          tick={{ fill: textColor, fontSize: 10, opacity: 0.7 }}
          axisLine={false} tickLine={false}
          dy={10} interval={0}
          // Truncate long category names
          tickFormatter={(val) => val.length > 6 ? val.slice(0,6)+'..' : val}
        />
        
        <YAxis
          tick={{ fill: textColor, fontSize: 10, opacity: 0.7 }}
          axisLine={false} tickLine={false}
          allowDecimals={false}
        />
        
        <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', radius: 4 }} 
        />
        
        <Bar
          dataKey="count"
          radius={[6, 6, 6, 6]} // Pill shape
          fill="url(#barGradient)"
          animationDuration={1200}
        >
          <LabelList
            dataKey="count"
            position="top"
            offset={5}
            fontSize={10}
            fontWeight={600}
            fill={textColor}
            opacity={0.8}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ToDoChart;