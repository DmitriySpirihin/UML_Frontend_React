
import  {useState,useEffect} from 'react'
import { AppData , UserData} from '../../../StaticClasses/AppData.js'
import Colors from '../../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,premium$} from '../../../StaticClasses/HabitsBus.js'
import MyBChart from './MyBarChart.jsx'
import ProgressCircle from '../../../Helpers/ProgressCircle.jsx'
import {FaList} from 'react-icons/fa'
import RecomendationTraining from '../../../Helpers/RecomendationTraining.jsx'

const lables = [['месяц','month'],['пол года','half year'],['год','year']];

const TrainingMetrics = ({id,closePanel}) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
    const [period,setPeriod] = useState(0); // 28,180,360
    const PERIOD_DAYS = [28,180,360];
    const [data, setData] = useState([]);

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
    useEffect(() => {
    const days = PERIOD_DAYS[period];
    setData(getRealExerciseData(id, days));
   }, [id, period]);
  // render    
  return (
    <div style={styles(theme).container}>
      
       <MyBChart langIndex={langIndex} data={data} colorTon={Colors.get('heavy', theme)} colorRm={Colors.get('light', theme)}
        colorStroke={Colors.get('icons', theme)} colorToolTip={Colors.get('background', theme)} colorFont={Colors.get('mainText', theme)}/>
      
      <Togglers theme={theme} period={period} setPeriod={setPeriod} langIndex={langIndex} fSize={fSize}/>
    


      {data.length > 0 && <ProgressCircle startValue={data[0].oneRepMax} endValue={data[data.length - 1].oneRepMax} mediumValue={getMediumValue(data)} unit="kg" langIndex={langIndex} size={195}
      textColor={Colors.get('mainText', theme)} linesColor={Colors.get('linesColor', theme)} minColor={Colors.get('minValColor', theme)} maxColor={Colors.get('maxValColor', theme)}
      mediumcolor={Colors.get('choosenColor', theme)} baseColor={Colors.get('background', theme)}/>}
       
       {data.length > 0 &&  <RecomendationTraining max={data[data.length - 1].oneRepMax}/>}

      <div  onClick={() => closePanel()} style={{display:'flex',width:'100%',alignSelf:'center',marginTop:'auto',justifyContent:'center',backgroundColor:Colors.get('heavy', theme),alignItems:'center'}}>
        <div style={styles(theme).text} >{langIndex === 0 ? 'к списку' : 'to list'}</div>
        <FaList style={{...styles(theme).icon,fontSize:'14px',marginLeft:'14px'}}  />
      </div>
    </div> 
  )
}

export default TrainingMetrics;
const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) {
    // Fallback: use current system date if no logs
    return new Date();
  }
  // Find latest date string
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};
const getRealExerciseData = (exId, periodDays) => {
  if (!AppData.trainingLog || !AppData.exercises[exId]) {
    return [];
  }

  const now = getAppToday();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - periodDays);
  const cutoffTime = cutoff.getTime();

  const dailyData = {};

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog)) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;

    for (const session of sessions) {
      if (!session.completed) continue;

      const exercise = session.exercises?.[exId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;

      let sessionTonnage = 0;
      let bestEstimated1RM = 0;

      for (const set of exercise.sets) {
        // Skip invalid sets
        if (typeof set.reps !== 'number' || typeof set.weight !== 'number') continue;
        if (set.reps <= 0 || set.weight <= 0) continue;

        sessionTonnage += set.weight * set.reps;
        const epley1RM = set.weight * (1 + set.reps / 30);
        if (epley1RM > bestEstimated1RM) {
          bestEstimated1RM = epley1RM;
        }
      }

      if (sessionTonnage > 0 || bestEstimated1RM > 0) {
        // Initialize day if not exists
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = {
            date: dateStr,        // ✅ Fixed: was "iso Date"
            tonnage: 0,
            oneRepMax: 0
          };
        }

        // Accumulate tonnage, track best 1RM for the day
        dailyData[dateStr].tonnage += sessionTonnage;
        if (bestEstimated1RM > dailyData[dateStr].oneRepMax) {
          dailyData[dateStr].oneRepMax = bestEstimated1RM;
        }
      }
    }
  }

  // Convert to array and sort chronologically
  const result = Object.values(dailyData).sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  // Round final values
  return result.map(item => ({
    date: item.date,
    tonnage: Math.round(item.tonnage/10),
    oneRepMax: Math.round(item.oneRepMax)
  }));
};
const getMediumValue = (data) => {
  if (data.length === 0) return 0;
  const sum = data.reduce((a, b) => a + b.oneRepMax, 0);
  return sum / data.length;
};

const styles = (theme,fSize) =>
({
    container :
   {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    overflowY:'scroll',
    overflowX:'hidden',
    alignItems: 'center',
    width: '100vw',
    height: '168vw',
    top: '14%',
    backgroundColor: Colors.get('bottomPanel', theme),
    zIndex: 2
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
  },
  textToggles: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    padding: '8px 0',
    width: '100%',
    maxWidth: '400px',
    userSelect: 'none'
  },
})

const Togglers = ({theme,period,setPeriod,langIndex,fSize}) => {
  return (
    <div style={styles(theme).textToggles}>
                    {[{ key: 0, label: lables[0][langIndex] }, { key: 1, label: lables[1][langIndex] }, { key: 2, label: lables[2][langIndex] }].map(({ key, label }) => (
                      <span
                        key={key}
                        onClick={() => setPeriod(key)}
                        style={{
                          padding: '6px 8px',
                          cursor: 'pointer',
                          fontSize: period === key
                            ? (fSize === 0 ? '12px' : '14px')
                            : (fSize === 0 ? '10px' : '12px'),
                          fontWeight: period === key ? '600' : '400',
                          color: period === key
                            ? Colors.get('mainText', theme)
                            : Colors.get('subText', theme),
                          opacity: period === key ? 1 : 0.8,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {label}
                        {key < 2 && (
                          <span style={{
                            margin: '0 10px',
                            color: Colors.get('border', theme),
                            fontSize: fSize === 0 ? '13px' : '15px'
                          }}>
                            |
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
  )
}