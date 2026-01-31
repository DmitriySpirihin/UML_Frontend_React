import React from 'react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label, backgroundColor, textColor, fillColor }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: backgroundColor,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${fillColor}40`,
        borderRadius: '12px',
        padding: '8px 12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '12px', color: textColor, opacity: 0.7, marginBottom: '2px' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: fillColor }}>
          {payload[0].value} <span style={{fontSize:'10px'}}>tasks</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function ToDoAreaChart({ data, fillColor, textColor, linesColor, backgroundColor }) {
  if (!data?.length) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -25 }}>
        <defs>
          <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={fillColor} stopOpacity={0.6} />
            <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="4 4" stroke={linesColor} vertical={false} strokeOpacity={0.15} />
        
        <XAxis
          dataKey="date"
          tickLine={false} axisLine={false}
          tick={{ fontSize: 10, fill: textColor, opacity: 0.6 }}
          dy={10}
        />
        
        <YAxis
          tickLine={false} axisLine={false}
          tick={{ fontSize: 10, fill: textColor, opacity: 0.6 }}
          allowDecimals={false} // Important for task counts
          dx={-10}
        />
        
        <Tooltip
          content={<CustomTooltip backgroundColor={backgroundColor} textColor={textColor} fillColor={fillColor} />}
          cursor={{ stroke: linesColor, strokeWidth: 1, strokeDasharray: "4 4" }}
        />

        <Area
          type="monotone"
          dataKey="value" // Changed from 'weight' to 'value'
          stroke={fillColor}
          strokeWidth={3}
          fill="url(#valGradient)"
          animationDuration={1500}
          activeDot={{ 
              r: 5, fill: backgroundColor, stroke: fillColor, strokeWidth: 3 
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}