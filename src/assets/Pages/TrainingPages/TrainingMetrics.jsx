import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$} from '../../StaticClasses/HabitsBus'
import BarChart from '../../Helpers/BarChart.jsx'
import ProgressCircle from '../../Helpers/ProgressCircle.jsx'
import {FaRegCircleCheck,FaRegCircle} from 'react-icons/fa6'
import {getMaxOneRep} from '../../StaticClasses/TrainingLogHelper'

const TrainingMetrics = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
    const [chartType,setChartType] = useState(0); // exercises , measurments
    const [chartSubType,setChartSubType] = useState(0); // 0 - weight 1 - tonnage
    const [chartMark,setChartMark] = useState('kg');
    const [currentChartName,setCurrentChartName] = useState('Barbell press');
  const [chartData,setChartData] = useState([
  { date: "2025-10-19", value: 47 },
  { date: "2025-10-21", value: 67 },
  { date: "2025-10-25", value: 69 },
  { date: "2025-10-17", value: 72 },
  { date: "2025-10-29", value: 70 },
  { date: "2025-11-04", value: 73 },
  { date: "2025-11-08", value: 75 },
  { date: "2025-11-12", value: 78 },
  { date: "2025-11-17", value: 80 },
  { date: "2025-11-24", value: 82 },
  { date: "2025-11-28", value: 82 },
  { date: "2025-12-05", value: 85 },
  { date: "2025-12-11", value: 106 },
]);
    // subscriptions
    useEffect(() => {
      const subscription = theme$.subscribe(setthemeState); 
      const subscription2 = lang$.subscribe((lang) => {
      setLangIndex(lang === 'ru' ? 0 : 1);
      }); 
      const subscription3 = fontSize$.subscribe((fontSize) => {
      setFSize(fontSize);
      });
      return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      }
    }, []);     
  // render    
  return (
    <div style={styles(theme).container}> 
    <p style={{...styles(theme,fSize).text,paddingTop:'10px'}}>{langIndex === 0 ? 'Данные за 2 месяца' : '2 months data'}</p>
    <select style={styles(theme,fSize).select} onChange={(e) => setChartType(Number(e.target.value))}>
      <option value={0}>{langIndex === 0 ? 'Упражнения' : 'Exercises'}</option>
      <option value={1}>{langIndex === 0 ? 'Измерения' : 'Measurments'}</option>
    </select>
    <select style={styles(theme,fSize).select} onChange={(e) => setChartSubType(Number(e.target.value))}>
      <option value={0}>Weight</option>
      <option value={1}>Tonnage</option>
    </select>
    {chartType === 0 && <div style={styles(theme).panelRow}>
         <div style={{...styles(theme).panelRow,width:'50%'}}>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? 'Вес' : 'Weight'}</div>
           {chartSubType === 0 && <FaRegCircleCheck onClick={() => setChartSubType(1)} style={styles(theme,fSize).icon}/>}
           {chartSubType === 1 && <FaRegCircle onClick={() => setChartSubType(0)} style={styles(theme,fSize).icon}/>}
         </div>
         <div style={{...styles(theme).panelRow,width:'50%'}}>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? 'Тоннаж' : 'Tonnage'}</div>
           {chartSubType === 1 && <FaRegCircleCheck onClick={() => setChartSubType(0)} style={styles(theme,fSize).icon}/>}
           {chartSubType === 0 && <FaRegCircle onClick={() => setChartSubType(1)} style={styles(theme,fSize).icon}/>}
         </div>
      </div>}
      <div style={{...styles(theme,fSize).text,fontSize:'18px',paddingTop:'20px',borderBottom:`1px solid ${chartType === 0 ? chartSubType === 0 ? Colors.get('barsColorWeight', theme) : Colors.get('barsColorTonnage', theme) : Colors.get('barsColorMeasures', theme)}`,textAlign: "center",width:'55%'}}>{currentChartName}</div>
      <div style={styles(theme).panel}>
         <BarChart data={chartData} mark={chartMark} barsColor={chartType === 0 ? chartSubType === 0 ? Colors.get('barsColorWeight', theme) : Colors.get('barsColorTonnage', theme) : Colors.get('barsColorMeasures', theme)} 
         linesColor={Colors.get('linesColor', theme)} choosenColor={Colors.get('choosenColor', theme)}
         maxValColor={Colors.get('maxValColor', theme)} minValColor={Colors.get('minValColor', theme)} textColor={Colors.get('subText', theme)}/>
      </div>
      {chartType === 0 && chartSubType === 0 && <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%'}}>
        <div style={{...styles(theme,fSize).text,color:Colors.get('maxValColor', theme)}}>{(langIndex === 0 ? '🔺Максимальный вес: ' : '🔺Max weight: ') + Math.max(...chartData.map(item => item.value))  + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('subText', theme)}}>{(langIndex === 0 ? '➖Средний вес: ' : '➖Average weight: ') + (chartData.reduce((a, b) => a + b.value, 0) / chartData.length).toFixed(0) + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('minValColor', theme)}}>{(langIndex === 0 ? '🔻Минимальный вес: ' : '🔻Min weight: ') + Math.min(...chartData.map(item => item.value))  + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('mainText', theme)}}>{getProgressSign(chartData[0].value,chartData[chartData.length - 1].value) + (langIndex === 0 ? 'Прогресс: ' : 'Progress: ') + getProgress(chartData[0].value,chartData[chartData.length - 1].value) + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? '1️⃣Лучший разовый макс.: ' : 'Best one rep max: ') + getMaxOneRep(10,84) + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? '1️⃣Текущий разовый макс: ' : 'Current one rep max: ') + getMaxOneRep(12,75) + chartMark}</div>
      </div>}
      <ProgressCircle size={270} maxValue={100} averageValue={70} minValue={40} unit={chartMark} lineColor={Colors.get('linesColor', theme)}  maxColor={Colors.get('maxValColor', theme)} minColor={Colors.get('minValColor', theme)} textColor={Colors.get('subText', theme)} />
    </div>
  )
}

export default TrainingMetrics;


const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     top:'15vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  panel :
      {
    display:'flex',
    flexDirection:'column',
    width: "100%",
    alignItems: "center",
    justifyContent: "start",
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
  },
  select :
  {
    width:'90%',
    height:'30px',
    color:Colors.get('mainText', theme),
    backgroundColor:Colors.get('background', theme),
    fontSize:fSize === 0 ? '13px' : '15px',
    borderTop:'none',
    borderLeft:'none',
    borderRight:'none',
    borderBottom:`1px solid ${Colors.get('icons', theme)}`,
  },
  panelRow:
  {
    display:'flex',
    width:'100%',
    alignItems:'center',
    justifyContent:'center',
    marginTop:'10px',
    gap:'10px',
  },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme)
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
    fontSize: '18px',
    color: Colors.get('icons', theme)
  }
})

function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}
const getProgress = (start,end) => {
   const progress = end - start;
   const sign = progress > 0 ? '+' : '-';
   return sign + progress;
}
const getProgressSign = (start,end) => {
   const progress = end - start;
   const sign = progress > 0 ? '↗️' : '↘️';
   return sign;
}