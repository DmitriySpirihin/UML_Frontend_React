import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function WeekSparkline({ values, height = 42, color = "#a53429ff" }) {
  if (!values || values.length === 0) return null;

  // превращаем [10,0,8,...] в [{value:10}, {value:0}, ...]
  const data = values.map((v, i) => ({
    index: i + 1,
    value: v,
  }));

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%" className="mini-chart">
        <LineChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={3}
            dot={false}
            isAnimationActive={false}
          />
          {/* оси, гриды, тултипы не добавляем — чистый sparkline */}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default WeekSparkline;