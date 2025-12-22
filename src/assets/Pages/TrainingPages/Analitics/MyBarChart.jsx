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

export function MyBarChart({ data,langIndex, height = 200 ,colorTon,colorRm,colorStroke,colorToolTip,colorFont}) {
  const [showTonnage, setShowTonnage] = useState(true);
  const [showOneRep, setShowOneRep] = useState(true);

  if (!data?.length) return null;

  return (
    <div style={{width:'100%',marginRight:'8%',height:'40%',justifyContent:'center',alignContent:'center'}}>
      

      {/* Чарт */}
      <div style={{ width: "100%", height , marginRight:'10px'}}>
        <ResponsiveContainer width="100%" height="100%" className="myChart">
          <BarChart
            data={data}
            margin={{ top: 4, right: 12, left: 0, bottom: 16 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={colorStroke} vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: colorToolTip ,borderRadius:'12px',width:'100px',
              border:'1px solid ' + colorStroke,fontSize:'14px',color: colorFont}}
              formatter={(value, name, props, index) => {
                 // index: 0 — первое значение, 1 — второе
             if (index === 1) {
              return [value * 10, name]; // умножаем только второе
               }
                 return [value, name];
            }}
            />

            {showTonnage && (
              <Bar
                dataKey="tonnage"
                name={langIndex === 0 ? "Тоннаж, кг" : "Tonnage, kg"}
                fill={colorTon}     // зелёный
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              />
            )}

            {showOneRep && (
              <Bar
                dataKey="oneRepMax"
                name={langIndex === 0 ? "1РМ, кг" : "1RM, kg"}
                fill={colorRm}     // синий
                radius={[3, 3, 0, 0]}
                maxBarSize={22}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Тогглеры */}
      <div style={{ display: "flex",marginLeft:'8%', flexDirection:'row',alignContent:'center',justifyContent:'space-around'}}>
        <div onClick={() => setShowTonnage(v => !v) } style={{color: showTonnage ? colorTon : colorStroke,fontSize:'12px'
          ,border: showTonnage ? '1px solid ' + colorTon : '1px solid ' + colorStroke,borderRadius:'12px',width:'100px'
        }}>
          Тоннаж
        </div>
        <div onClick={() => setShowOneRep(v => !v)} style={{color: showOneRep ? colorRm : colorStroke,fontSize:'12px'
          ,border: showOneRep ? '1px solid ' + colorRm : '1px solid ' + colorStroke,borderRadius:'12px',width:'100px'}}>
          1RM
        </div>
      </div>
    </div>
  );
}

export default MyBarChart;