import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function MyAreaChart({ data , fillColor,textColor,linesColor,backgroundColor}) {
  if (!data?.length) return null;

  return (
      <ResponsiveContainer width="100%" height="100%" className="areachart">
        <AreaChart data={data} margin={{ top: 8,right:5, bottom: 8 }}>
          <defs>
            <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor={fillColor} stopOpacity={0.7} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={linesColor} vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={true}
            axisLine={true}
            fontSize={11}
            stroke={textColor}
          />
          <YAxis
            tickLine={true}
            axisLine={true}
            fontSize={11}
            stroke={textColor}
            domain={["dataMin - 2", "dataMax + 2"]}
          />
          <Tooltip
            labelStyle={{ color: textColor }}
            contentStyle={{ background: backgroundColor, border: "1px solid #1f2933" }}
            formatter={(v) => [`${v.toFixed(1)} кг`, "Вес"]}
          />

          <Area
            type="monotone"
            dataKey="weight"
            stroke={fillColor}
            strokeWidth={2}
            fill="url(#weightGradient)"
            dot={true}
            activeDot={{ r: 4, fill: fillColor, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
  );
}
export default MyAreaChart;