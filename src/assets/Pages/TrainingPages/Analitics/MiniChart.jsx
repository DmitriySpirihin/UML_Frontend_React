import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";

function WeekSparkline({ values, height = 40, color = "#a53429" }) {
  if (!values || values.length === 0) return null;

  const data = values.map((v, i) => ({ index: i, value: v }));
  
  // Unique ID for gradients to prevent conflicts if multiple sparklines exist
  const gradientId = `sparkGradient-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;
  const glowId = `sparkGlow-${color.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={1} />
            </linearGradient>
            
            <filter id={glowId} height="130%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feFlood floodColor={color} floodOpacity="0.3" />
              <feComposite in2="offsetblur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <Line
            type="monotone"
            dataKey="value"
            stroke={`url(#${gradientId})`}
            strokeWidth={3}
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
            filter={`url(#${glowId})`}
            strokeLinecap="round"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeekSparkline;