import React from "react";
import { PieChart, Pie, Cell, Label, ResponsiveContainer, Tooltip } from "recharts";

const names = [
  ['Лёгкая', 'Light'],
  ['Средняя', 'Medium'],
  ['Тяжёлая', 'Heavy'],
];

export function LoadDonut({
  data,
  theme,
  totalTonnage,
  sessionCount,
  langIndex = 0,
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const isLight = theme === 'light';

  // --- Modern Color Palette ---
  const palette = {
    mainText: isLight ? '#111827' : '#F9FAFB', // Near Black / Near White
    subText: isLight ? '#6B7280' : '#9CA3AF',  // Gray
    border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    tooltipBg: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.9)',
    pillBg: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
    // Chart Colors (Green, Amber, Red)
    segments: [
      '#4ADE80', // Light Load
      '#FACC15', // Medium Load
      '#F87171'  // Heavy Load
    ]
  };

  // --- Logic & Formatting ---
  const tonnageInTons = (totalTonnage / 1000).toFixed(1);
  const tonLabel = langIndex === 0 ? `${tonnageInTons} т` : `${tonnageInTons} t`;
  
  const sessionLabel = langIndex === 0
      ? `${sessionCount} ${getRussianSessionWord(sessionCount)}`
      : `${sessionCount} workout${sessionCount !== 1 ? 's' : ''}`;

  // Prepare data with colors and percent for the Legend
  const chartData = data.map((entry, i) => ({
    ...entry,
    name: names[i]?.[langIndex] || `Group ${i}`,
    color: palette.segments[i],
    percent: total > 0 ? ((entry.value / total) * 100).toFixed(0) : 0,
  }));

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          backgroundColor: palette.tooltipBg,
          backdropFilter: 'blur(10px)',
          padding: '8px 12px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: `1px solid ${palette.border}`
        }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: data.color }}>{data.name}</p>
          <p style={{ margin: 0, fontSize: '12px', color: palette.mainText }}>
            {data.value} {langIndex === 0 ? 'подходов' : 'sets'} ({data.percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* --- CHART --- */}
      <div style={{ width: '100%', height: 220, position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%" // Explicitly center X
              cy="50%" // Explicitly center Y
              innerRadius={70}
              outerRadius={90}
              cornerRadius={6}
              paddingAngle={4}
              stroke="none"
              startAngle={90}
              endAngle={-270}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}

              {/* Center Label */}
              <Label
                position="center"
                content={({ viewBox }) => {
                  // Fallback calculation if cx/cy are undefined (prevents top-left issue)
                  const cx = viewBox.cx || viewBox.width / 2;
                  const cy = viewBox.cy || viewBox.height / 2;

                  return (
                    <g>
                      <text
                        x={cx} y={cy - 5}
                        textAnchor="middle" dominantBaseline="central"
                        fill={palette.mainText}
                        style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Segoe UI, sans-serif' }}
                      >
                        {tonnageInTons}
                      </text>
                      <text
                        x={cx} y={cy + 22}
                        textAnchor="middle" dominantBaseline="central"
                        fill={palette.subText}
                        style={{ fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}
                      >
                        {langIndex === 0 ? 'ТОНН' : 'TONS'}
                      </text>
                    </g>
                  );
                }}
              />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* --- LEGEND --- */}
      <div style={{ 
          display: 'flex', justifyContent: 'center', gap: '20px', 
          marginTop: '0px', flexWrap: 'wrap', width: '100%' 
      }}>
        {chartData.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
            <span style={{ fontSize: '12px', color: palette.subText, fontWeight: '500' }}>
              {item.name}
            </span>
            <span style={{ fontSize: '12px', color: palette.mainText, fontWeight: '700' }}>
              {item.percent}%
            </span>
          </div>
        ))}
      </div>

      {/* --- SESSION COUNTER --- */}
      <div style={{ 
          marginTop: '15px', 
          padding: '6px 16px', 
          borderRadius: '20px', 
          backgroundColor: palette.pillBg,
          color: palette.subText,
          fontSize: '12px',
          fontWeight: '600'
      }}>
        {sessionLabel}
      </div>

    </div>
  );
}

export default LoadDonut;

// Helper for Russian pluralization
function getRussianSessionWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return "тренировка";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "тренировки";
  return "тренировок";
}