
import React, {useState,useEffect} from 'react'
import { AppData , UserData} from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,premium$,setPage} from '../../StaticClasses/HabitsBus'
import BarChart from '../../Helpers/BarChart.jsx'
import ProgressCircle from '../../Helpers/ProgressCircle.jsx'
import {FaRegCircleCheck,FaRegCircle} from 'react-icons/fa6'
import {getMaxOneRep,getValidExerciseIds,getChartData,getBestSet,lastBestSet} from '../../StaticClasses/TrainingLogHelper'
import { LastWeekMuscleView } from '../../Classes/TrainingData'
import { names } from './TrainingMesurments';

const TrainingMetrics = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
    const [hasPremium,setHasPremium] = useState(UserData.hasPremium);
    const [chartType,setChartType] = useState(0); // exercises , measurments
    const [chartSubType,setChartSubType] = useState(0); // 0 - weight 1 - tonnage
    const [chartMark,setChartMark] = useState('kg');
    const [currentExId,setCurrentExId] = useState(Number(getValidExerciseIds()[0]));
    const [chartData,setChartData] = useState([]);
    // subscriptions
    useEffect(() => {
      const subscription = theme$.subscribe(setthemeState); 
      const subscription2 = lang$.subscribe((lang) => {
      setLangIndex(lang === 'ru' ? 0 : 1);
      }); 
      const subscription3 = fontSize$.subscribe((fontSize) => {
      setFSize(fontSize);
      });
      const subscription4 = premium$.subscribe(setHasPremium);
      return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      subscription4.unsubscribe();
      }
    }, []);    
    useEffect(() => {
      if(chartType === 0){
        setChartMark(chartSubType === 0 ? langIndex === 0 ? 'кг' : 'kg' : langIndex === 0 ? 'тонн' : 'tons');
        if(currentExId !== -1){
          setChartData(getChartData(currentExId,chartSubType === 1));
        }
      }else {
         setChartMark(chartSubType === 0 ? langIndex === 0 ? 'кг' : 'kg' : langIndex === 0 ? 'см' : 'sm');
         setChartData(AppData.measurments[chartSubType]);
      }
    }, [chartType,chartSubType]); 
   
  // render    
  return (
    <div style={styles(theme).container}> 
    <div style={styles(theme).panelRow}>
         <div style={{...styles(theme).panelRow,width:'50%'}}>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? 'Упражнения' : 'Exercises'}</div>
           {chartType === 0 && <FaRegCircleCheck onClick={() => setChartType(1)} style={styles(theme,fSize).icon}/>}
           {chartType === 1 && <FaRegCircle onClick={() => setChartType(0)} style={styles(theme,fSize).icon}/>}
         </div>
         <div style={{...styles(theme).panelRow,width:'50%'}}>
           <div style={styles(theme,fSize).text}>{langIndex === 0 ? 'Замеры' : 'Measures'}</div>
           {chartType === 1 && <FaRegCircleCheck onClick={() => setChartType(0)} style={styles(theme,fSize).icon}/>}
           {chartType === 0 && <FaRegCircle onClick={() => setChartType(1)} style={styles(theme,fSize).icon}/>}
         </div>
      </div>
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
      {chartType === 0 && <select style={styles(theme,fSize).select} onChange={(e) => {setChartData(getChartData(Number(e.target.value)));setCurrentExId(Number(e.target.value))}}>
        {renderExerciseList({theme,langIndex,fSize,})}
    </select>}
    {chartType === 1 && <select style={styles(theme,fSize).select} onChange={(e) => {setChartSubType(Number(e.target.value))}}>
        {renderMeasuresList({theme,langIndex,fSize,})}
    </select>}
      <div style={styles(theme).panel}>
         <BarChart data={chartData} mark={chartMark} barsColor={chartType === 0 ? chartSubType === 0 ? Colors.get('barsColorWeight', theme) : Colors.get('barsColorTonnage', theme) : Colors.get('barsColorMeasures', theme)} 
         linesColor={Colors.get('linesColor', theme)} choosenColor={Colors.get('choosenColor', theme)} langIndex={langIndex}
         maxValColor={Colors.get('maxValColor', theme)} minValColor={Colors.get('minValColor', theme)} textColor={Colors.get('subText', theme)}/>
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
      {chartData.length > 0 && chartType === 0 && chartSubType === 0 && <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%'}}>
        <div style={{...styles(theme,fSize).text,color:Colors.get('maxValColor', theme),paddingTop:'10px'}}>{(langIndex === 0 ? '🔺Максимальный вес: ' : '🔺Max weight: ') + Math.max(...chartData.map(item => item.value))  + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('minValColor', theme)}}>{(langIndex === 0 ? '🔻Минимальный вес: ' : '🔻Min weight: ') + Math.min(...chartData.map(item => item.value))  + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? '1️⃣Лучший разовый макс.: ' : 'Best one rep max: ') + getBestSet(currentExId) + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('mainText', theme)}}>{(langIndex === 0 ? '1️⃣Текущий разовый макс: ' : 'Current one rep max: ') + lastBestSet(currentExId) + chartMark}</div>
      </div>}
      {chartData.length > 0 && chartType === 0 && chartSubType === 1 && <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'90%'}}>
        <div style={{...styles(theme,fSize).text,color:Colors.get('maxValColor', theme),paddingTop:'10px'}}>{(langIndex === 0 ? '🔺Максимальный тоннаж: ' : '🔺Max tonnage: ') + Math.max(...chartData.map(item => item.value)).toFixed(2)  + chartMark}</div>
        <div style={{...styles(theme,fSize).text,color:Colors.get('minValColor', theme)}}>{(langIndex === 0 ? '🔻Минимальный тоннаж: ' : '🔻Min tonnage: ') + Math.min(...chartData.map(item => item.value)).toFixed(2)  + chartMark}</div>
      </div>}
      {chartData.length > 0 && <div style={{marginTop:'20px',height:'230px'}}>
        <ProgressCircle size={230} startValue={chartData[0].value} endValue={chartData[chartData.length - 1].value}
         mediumValue={Math.round(chartData.reduce((acc, item) => acc + item.value, 0) / chartData.length)} unit={chartMark} langIndex={langIndex}
        linesColor={Colors.get('linesColor', theme)}  maxColor={Colors.get('maxValColor', theme)} minColor={Colors.get('minValColor', theme)} 
        textColor={Colors.get('subText', theme)} mediumColor={'#43698eff'} basecolor={Colors.get('bottomPanel', theme)}/>
      </div>}
     <p style={{...styles(theme,fSize).text,paddingTop:'10px'}}>{langIndex === 0 ? 'Нагрузка на мышцы за неделю' : 'Weekly muscles loaded'}</p>
     <LastWeekMuscleView theme={theme} langIndex={langIndex}/>
     <LastWeekInfo theme={theme} langIndex={langIndex} fSize={fSize}/>
     </div>
     {!hasPremium && <div onClick={(e) => {e.stopPropagation();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'100vw',height:'170vw',top:'15.5%',borderRadius:'24px',backdropFilter:'blur(12px)',zIndex:2}}>
        <p style={{...styles(theme, fSize).text,textAlign:'center'}}>
        {langIndex === 0  ? 'Детальная статистика тренировок 📊' : 'Detailed training statistics 📊'}</p>
        <p style={{...styles(theme, fSize).text,textAlign:'center'}}>{langIndex === 0 
         ? 'Отслеживайте прогресс в упражнениях, анализируйте недельную нагрузку и достигайте целей быстрее!' 
         : 'Track your exercise progress, analyze weekly workload, and hit your goals faster!'}</p>
       <p style={{...styles(theme, fSize).text,textAlign:'center'}}> {langIndex === 0 
        ? '✨ Перейдите на Premium, чтобы получить полный доступ к аналитике!' 
        : '✨ Upgrade to Premium for full access to advanced analytics!'}</p>
        <p style={{...styles(theme,fSize).text}}> {langIndex === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'} </p>
        <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn,margin:'10px'}} >{langIndex === 0 ? 'Стать премиум' : 'Get premium'}</button>
      </div>
    }
    </div>
    
  )
}

export default TrainingMetrics;


const styles = (theme,fSize) =>
({
    container :
   {
    display:'flex',
    width: "100vw",
    flexDirection:'column',
    overflowY:'scroll',
    overflowX:'hidden',
    justifyContent: "flex-start",
    backgroundColor:Colors.get('background', theme),
    height: "78vh",
    top:'16vh',
    paddingTop:'10px'
  },
  select :
  {
    width:'65%',
    height:'40px',
    padding:'10px',
    marginTop:'10px',
    alignSelf:'center',
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

const LastWeekInfo = ({ theme, langIndex, fSize }) => {
  // Get today's date and last week's date range
  const today = new Date();
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(today.getDate() - 7);
  lastWeekStart.setHours(0, 0, 0, 0);
  
  // Initialize stats
  let totalTrainingTime = 0;
  let totalTonnage = 0;
  let maxIntensity = 0;
  let totalSets = 0;
  let totalReps = 0;
  let sessionCount = 0;

  // Iterate through all dates in training log
  Object.entries(AppData.trainingLog).forEach(([dateKey, sessions]) => {
    const sessionDate = new Date(dateKey);
    
    // Only consider sessions from last 7 days
    if (sessionDate >= lastWeekStart && sessionDate <= today) {
      sessions.forEach(session => {
        if (session.completed) {
          sessionCount++;
          
          // 1. Total training time (in minutes)
          if (session.duration) {
            totalTrainingTime += session.duration / 60000; // Convert ms to minutes
          }
          
          // 2. Total tonnage (in tons)
          totalTonnage += session.tonnage / 1000; // Convert kg to tons
          
          // 3. Maximum intensity (tons per hour)
          if (session.duration && session.tonnage) {
            const durationHours = session.duration / 3600000; // ms to hours
            const intensity = (session.tonnage / durationHours) * 0.00001; // tons/hour
            if (intensity > maxIntensity) {
              maxIntensity = intensity;
            }
          }
          
          // 4. Total sets and 5. Total reps
          Object.values(session.exercises).forEach(exercise => {
            if (Array.isArray(exercise.sets)) {
              totalSets += exercise.sets.length;
              exercise.sets.forEach(set => {
                if (set.reps) {
                  totalReps += set.reps;
                }
              });
            }
          });
        }
      });
    }
  });

  // Handle empty stats
  const formattedTime = sessionCount > 0 ? Math.round(totalTrainingTime) : 0;
  const formattedTonnage = sessionCount > 0 ? totalTonnage.toFixed(2) : 0;
  const formattedIntensity = sessionCount > 0 ? (maxIntensity).toFixed(2) : 0;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '90%' }}>
      <div style={{ ...styles(theme, fSize).text }}>
        {langIndex === 0 ? '⏱️Длительность' : '⏱️Duration'}: {formattedTime} {langIndex === 0 ? 'мин' : 'min'}
      </div>
      <div style={{ ...styles(theme, fSize).text }}>
        {langIndex === 0 ? '💪Тоннаж' : '💪Tonnage'}: {formattedTonnage} {langIndex === 0 ? 'Тонн' : 'Tons'}
      </div> 
      <div style={{ ...styles(theme, fSize).text }}>
        {langIndex === 0 ? '🔥Интенсивность' : '🔥Intensity'}: {formattedIntensity} {langIndex === 0 ? 'Тон/ч' : 'Ton/h'}
      </div>
      <div style={{ ...styles(theme, fSize).text }}>
        {langIndex === 0 ? '🔁Подходов' : '🔁Sets'}: {totalSets}
      </div>
      <div style={{ ...styles(theme, fSize).text,marginBottom:'18px' }}>
        {langIndex === 0 ? '🔄Повторений' : '🔄Reps'}: {totalReps}
      </div>
    </div>
  );
};

const renderExerciseList = ({theme,langIndex,fSize}) => {
  const exercises = getValidExerciseIds();
  return exercises?.map((exId) => (
    <option 
      key={exId} 
      value={exId} 
      style={{ ...styles(theme, false, fSize).text }}
    >
      {AppData.exercises.find(e => e.id === Number(exId))?.name[langIndex]}
    </option>
  ));
};
const renderMeasuresList = ({theme,langIndex,fSize}) => {

  return names.map((el,id) => (
    <option 
      key={id} 
      value={id} 
      style={{ ...styles(theme, false, fSize).text }}
    >
      {el[langIndex]}
    </option>
  ));
};