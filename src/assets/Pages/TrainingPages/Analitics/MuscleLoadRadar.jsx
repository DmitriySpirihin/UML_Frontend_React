import {RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip,ResponsiveContainer} from 'recharts';
import Colors from '../../../StaticClasses/Colors';

function MuscleLoadRadar({theme,langIndex,muscleLoadData}) {
  return (
    <ResponsiveContainer width="90%" height={280} className="muscle-load-chart">
      <RadarChart
        data={muscleLoadData}
        outerRadius="70%"
        
      >
        {/* GRID COLORS */}
        <PolarGrid
          gridType="polygon"
          stroke={Colors.get('icons',Colors.theme)}          // цвет линий сетки
          strokeOpacity={0.5}      // прозрачность
          
        />

        {/* CATEGORY NAMES (типы мышц) */}
        <PolarAngleAxis
          dataKey="muscle"
          tickLine={false}
          axisLine={false}
          tick={{
            fill: Colors.get('icons',theme),       // цвет текста
            fontSize: 11,
          }}
        />

        {/* RADIUS (кольца по нагрузке) */}
        <PolarRadiusAxis
          stroke={Colors.get('icons',theme)}
          tick={{ fill: '#9ca3af', fontSize: 8 }}
          axisLine={false}
          tickLine={false}
          domain={[0, 100]}
        />

        {/* TOOLTIP STYLE */}
        <Tooltip
  cursor={false}
  formatter={(value) => [`${value}%`, 'Нагрузка']}
  labelFormatter={(label) => `Мышца: ${label}`}
  contentStyle={{
    backgroundColor: Colors.get('bottomPanel', theme),
    border: `1px solid ${Colors.get('border', theme)}`,
    borderRadius: 8,
    padding: '6px 10px',
    fontSize: '11px'
  }}
  labelStyle={{ color: Colors.get('mainText', theme), fontWeight: 'bold' }}
  itemStyle={{ color: Colors.get('subText', theme) }}
/>

        <Radar
          name="Нагрузка"
          dataKey="load"
          stroke={Colors.get('radarBorder',theme)}
          fill={Colors.get('radar',theme)}
          fillOpacity={0.45}
          
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export default MuscleLoadRadar;

