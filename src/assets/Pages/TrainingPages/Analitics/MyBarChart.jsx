import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Custom Glass Tooltip
const CustomTooltip = ({ active, payload, label, palette, langIndex }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: palette.tooltipBg,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${palette.border}`,
        borderRadius: '12px',
        padding: '10px 14px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        minWidth: '120px'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: palette.subText, marginBottom: '6px' }}>{label}</p>
        {payload.map((entry, index) => {
          // If the data key is tonnage, we multiply by 10 (preserving original logic)
          const val = entry.dataKey === 'tonnage' ? entry.value * 10 : entry.value;
          const name = entry.name;
          const color = entry.dataKey === 'tonnage' ? palette.tonnage : palette.rm;
          
          return (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color }} />
              <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: palette.text }}>
                {val} <span style={{ fontSize: '10px', opacity: 0.7 }}>kg</span>
              </p>
              <span style={{ fontSize: '10px', color: palette.subText, marginLeft: 'auto' }}>{name}</span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

export function MyBChart({ data, theme = 'dark', langIndex, height = 200 }) {
  const [showTonnage, setShowTonnage] = useState(true);
  const [showOneRep, setShowOneRep] = useState(true);

  if (!data?.length) return null;

  const isLight = theme === 'light';

  // --- Internal Color Palette ---
  const palette = {
    text: isLight ? '#111827' : '#F9FAFB',       // Main text
    subText: isLight ? '#6B7280' : '#9CA3AF',    // Axis/Labels
    grid: isLight ? '#E5E7EB' : '#374151',       // Grid lines
    border: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    tooltipBg: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,30,30,0.9)',
    // Data Colors
    tonnage: isLight ? '#10B981' : '#34D399',    // Green (Emerald)
    rm: isLight ? '#3B82F6' : '#60A5FA',         // Blue
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Chart Area */}
      <div style={{ width: "100%", height, marginBottom: '10px' }}>
        <ResponsiveContainer width="100%" height="100%" className="myChart">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={2}
          >
            <defs>
              <linearGradient id="gradTon" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.tonnage} stopOpacity={1} />
                <stop offset="100%" stopColor={palette.tonnage} stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="gradRm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.rm} stopOpacity={1} />
                <stop offset="100%" stopColor={palette.rm} stopOpacity={0.6} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke={palette.grid} vertical={false} strokeOpacity={0.4} />
            
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: palette.subText }}
              dy={10}
            />
            
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: palette.subText }}
            />
            
            <Tooltip 
              cursor={{ fill: 'transparent' }}
              content={
                <CustomTooltip 
                    palette={palette}
                    langIndex={langIndex}
                />
              }
            />

            {showTonnage && (
              <Bar
                dataKey="tonnage"
                name={langIndex === 0 ? "Vol" : "Vol"}
                fill="url(#gradTon)"
                radius={[4, 4, 4, 4]}
                barSize={12}
                animationDuration={1000}
              />
            )}

            {showOneRep && (
              <Bar
                dataKey="oneRepMax"
                name="1RM"
                fill="url(#gradRm)"
                radius={[4, 4, 4, 4]}
                barSize={12}
                animationDuration={1000}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Togglers (Centered Pills) */}
      <div style={{ display: "flex", width: '100%', justifyContent: 'center', gap: '15px' }}>
        <div 
            onClick={() => setShowTonnage(v => !v)} 
            style={{
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 16px', borderRadius: '20px',
                backgroundColor: showTonnage ? `${palette.tonnage}20` : 'transparent', // 20 hex = low opacity
                border: `1px solid ${showTonnage ? palette.tonnage : palette.grid}`,
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: showTonnage ? palette.tonnage : palette.subText }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: showTonnage ? palette.text : palette.subText }}>
                {langIndex === 0 ? "Тоннаж" : "Volume"}
            </span>
        </div>

        <div 
            onClick={() => setShowOneRep(v => !v)} 
            style={{
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 16px', borderRadius: '20px',
                backgroundColor: showOneRep ? `${palette.rm}20` : 'transparent',
                border: `1px solid ${showOneRep ? palette.rm : palette.grid}`,
                transition: 'all 0.2s ease'
            }}
        >
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: showOneRep ? palette.rm : palette.subText }} />
            <span style={{ fontSize: '12px', fontWeight: '600', color: showOneRep ? palette.text : palette.subText }}>
                1RM
            </span>
        </div>
      </div>
    </div>
  );
}

export default MyBChart;