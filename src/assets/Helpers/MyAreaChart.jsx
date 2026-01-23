import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// Modern Glassmorphism Tooltip
const CustomTooltip = ({ active, payload, label, backgroundColor, textColor, fillColor }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: backgroundColor, // Use passed background or fallback
        backdropFilter: 'blur(10px)',
        border: `1px solid ${fillColor}40`, // Subtle border matching chart color
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: textColor, opacity: 0.7, marginBottom: '2px' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: fillColor }}>
          {payload[0].value.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export function MyAreaChart({ data, fillColor, textColor, linesColor, backgroundColor }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%" className="areachart">
      <AreaChart data={data} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
        <defs>
          {/* Gradient Fill */}
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.6} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
          
          {/* Line Glow/Shadow Filter */}
          <filter id="glow" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
            <feOffset in="blur" dx="0" dy="4" result="offsetBlur" />
            <feFlood floodColor={fillColor} floodOpacity="0.4" result="offsetColor" />
            <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <CartesianGrid 
            strokeDasharray="4 4" 
            stroke={linesColor} 
            vertical={false} 
            strokeOpacity={0.3} 
        />
        
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: textColor, opacity: 0.6 }}
          dy={10}
        />
        
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 10, fill: textColor, opacity: 0.6 }}
          domain={["dataMin - 1", "dataMax + 1"]}
          dx={-10}
        />
        
        <Tooltip
          content={<CustomTooltip backgroundColor={backgroundColor} textColor={textColor} fillColor={fillColor} />}
          cursor={{ stroke: linesColor, strokeWidth: 1, strokeDasharray: "4 4" }}
        />

        <Area
          type="monotone"
          dataKey="weight"
          stroke={fillColor}
          strokeWidth={3}
          fill="url(#weightGradient)"
          filter="url(#glow)" // Applies the glow effect
          dot={false} // Clean look, no dots by default
          activeDot={{ 
              r: 6, 
              fill: backgroundColor, 
              stroke: fillColor, 
              strokeWidth: 3,
              style: { filter: 'drop-shadow(0px 0px 6px rgba(0,0,0,0.2))' } 
          }}
          animationDuration={1500}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default MyAreaChart;