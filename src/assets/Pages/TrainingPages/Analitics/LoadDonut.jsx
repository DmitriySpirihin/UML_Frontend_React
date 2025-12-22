import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";
import Colors from "../../../StaticClasses/Colors";

const RADIAN = Math.PI / 180;

const names = [
  ['Лёгкая', 'Light'],
  ['Средняя', 'Medium'],
  ['Тяжёлая', 'Heavy'],
];

export function LoadDonut({
  data,
  theme,
  totalTonnage,   // kg
  sessionCount,
  langIndex = 0,
}) {
  const total = data.reduce((s, d) => s + d.value, 0);

  // center labels
  const tonnageInTons = (totalTonnage / 1000).toFixed(1);
  const tonLabel = langIndex === 0 ? `${tonnageInTons} т` : `${tonnageInTons} t`;
  const sessionLabel =
    langIndex === 0
      ? `${sessionCount} ${getRussianSessionWord(sessionCount)}`
      : `${sessionCount} workout${sessionCount !== 1 ? 's' : ''}`;

  // data + percent
  const dataWithPercent = data.map((entry, i) => ({
    ...entry,
    name: names[i]?.[langIndex] || `Group ${i + 1}`,
    percent: total > 0 ? (entry.value / total) : 0,
  }));

  // fancy external label as pill
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    percent,
    index,
  }) => {
    if (percent <= 0) return null;

    const radius = outerRadius + 24;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    const labelText = `${names[index]?.[langIndex]}  ${(percent * 100).toFixed(0)}%`;
    const textWidth = labelText.length * 6; // грубая оценка

    return (
      <g>
        <rect
          x={x - textWidth / 2}
          y={y - 11}
          width={textWidth}
          height={22}
          rx={11}
          ry={11}
          fill="rgba(0,0,0,0.2)"
        />
        <text
          x={x}
          y={y + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill={Colors.get('icons', theme)}
          fontSize={11}
          fontWeight={500}
          style={{ pointerEvents: 'none' }}
        >
          {labelText}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width={400} height={260} className="donut-chart">
      <PieChart>
        <Pie
          data={dataWithPercent}
          dataKey="value"
          nameKey="name"
          innerRadius="50%"
          outerRadius="80%"
          paddingAngle={2}
          label={renderCustomLabel}
          labelLine={false}
          stroke={Colors.get('linesColor', theme)}
          strokeWidth={1}
        >
          {data.map((_, i) => (
            <Cell
              key={`cell-${i}`}
              fill={
                i === 0
                  ? Colors.get('light', theme)
                  : i === 1
                  ? Colors.get('medium', theme)
                  : Colors.get('heavy', theme)
              }
            />
          ))}

          {/* center tonnage + sessions */}
          <Label
            position="center"
            content={({ viewBox }) => {
              const cx = typeof viewBox?.cx === 'number' ? viewBox.cx : 140;
              const cy = typeof viewBox?.cy === 'number' ? viewBox.cy : 120;

              return (
                <g>
                  <text
                    x={cx+60}
                    y={cy - 4}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={Colors.get('maxValColor', theme)}
                    fontSize="36"
                    fontWeight="600"
                  >
                    {tonLabel}
                  </text>
                  <text
                    x={cx+60}
                    y={cy + 26}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={Colors.get('subText', theme)}
                    fontSize="15"
                  >
                    {sessionLabel}
                  </text>
                </g>
              );
            }}
          />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}


export default LoadDonut;

// Helper for Russian pluralization
function getRussianSessionWord(count) {
  if (count % 10 === 1 && count % 100 !== 11) return "тренировка";
  if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return "тренировки";
  return "тренировок";
}