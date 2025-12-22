
import  { useState, useEffect } from 'react';
import { AppData } from '../../../StaticClasses/AppData';
import Colors from '../../../StaticClasses/Colors';
import { theme$, lang$, fontSize$} from '../../../StaticClasses/HabitsBus';
import { MuscleIcon } from '../../../Classes/TrainingData';
import { MdBorderBottom } from 'react-icons/md';
import WeekSparkline from './MiniChart';
import TrainingMetrics from './TrainingMetrics';


const TrainingAnaliticsRM = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showBarChart,setShowBarChart] = useState(false);
  const [currentExId,setCurrentExId] = useState(-1);
  
  // Subscriptions
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);
 
  return (
    <div style={{width:'100%',display:'flex',height:'90%',alignItems:'center',justifyContent:'flex-start',flexDirection:'column'}}>
      {Object.entries(AppData.exercises).filter(([id,exercise]) => exercise.rm > 0 && exercise.show).map(([id,exercise]) => (
        <div key={id} onClick={() => {setCurrentExId(id); setShowBarChart(true)}} style={styles(theme,fSize).card}>
        <div style={{display:'flex',flexDirection:'column',width:'70%'}}>
          <div style={styles(theme,fSize).text}>{exercise.name[langIndex]}</div>
          <div style={{fontSize:'16px',textAlign: 'left',color: Colors.get('light', theme)}}>
              {`1${langIndex === 0 ? 'РМ: ' : 'RM: '}${exercise.rm}`}
              <span style={{fontSize:'12px',marginLeft:'24px',textAlign: 'left',color: getSparclineColor(id,theme)}}>{getDiffrense(id)}
              </span>
            </div>
          <div style={{fontSize:'12px',marginLeft:'4px',textAlign: 'left',color: Colors.get('subText', theme)}}>{exercise.rmDate}</div>
        </div>
        <div style={{backgroundColor:'rgba(0,0,0,0.1)',borderRadius:'10px',width:'30%',marginRight:'5px',height:'60%'}}>
          <WeekSparkline values={getSparclineData(id)}color={getSparclineColor(id,theme)} />
        </div>
        <div style={{width:'10%',height:'70%',borderRadius:'50%',overflow:'hidden',alignContent:'center',justifyItems:'center'}}>
        {MuscleIcon.getForList(exercise.mgId, langIndex, theme)}
        </div>
      </div>
      ))}
      {showBarChart && <TrainingMetrics id={currentExId} closePanel={() => setShowBarChart(false)}/> }
    </div>
  );
};

export default TrainingAnaliticsRM;

const getAppToday = () => {
  const dates = Object.keys(AppData.trainingLog || {});
  if (dates.length === 0) return new Date();
  const latest = dates.reduce((a, b) => new Date(a) > new Date(b) ? a : b);
  return new Date(latest);
};

const getExerciseSetsInPeriod = (exerciseId, days = 28) => {
  const now = getAppToday(); // Reuse your existing helper
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  const cutoffTime = cutoff.getTime();

  const sets = [];

  for (const [dateStr, sessions] of Object.entries(AppData.trainingLog || {})) {
    const sessionDate = new Date(dateStr);
    if (sessionDate.getTime() < cutoffTime) continue;

    for (const session of sessions) {
      if (!session.completed) continue;
      const exercise = session.exercises?.[exerciseId];
      if (!exercise || !Array.isArray(exercise.sets)) continue;

      for (const set of exercise.sets) {
        if (set.reps > 0 && set.weight > 0) {
          // Estimate 1RM using Epley
          const epleyRM = set.weight * (1 + set.reps / 30);
          sets.push({
            date: sessionDate,
            weight: set.weight,
            reps: set.reps,
            estimated1RM: epleyRM,
            timestamp: sessionDate.getTime()
          });
        }
      }
    }
  }

  return sets.sort((a, b) => a.timestamp - b.timestamp); // oldest → newest
};
const getSparclineData = (exerciseId) => {
  const sets = getExerciseSetsInPeriod(exerciseId, 28);
  if (sets.length === 0) return [0];

  // Take last 6 sessions (or all if <6)
  const recent = sets.slice(-6).map(s => s.estimated1RM);
  
  // If only 1 value, duplicate to show as flat line
  if (recent.length === 1) return [recent[0], recent[0]];
  
  return recent;
};
const getDiffrense = (exerciseId) => {
  const currentRM = AppData.exercises?.[exerciseId]?.rm || 0;
  if (currentRM <= 0) return '';

  const sets = getExerciseSetsInPeriod(exerciseId, 365); // last year
  if (sets.length === 0) return '';

  const bestEstimated = Math.max(...sets.map(s => s.estimated1RM));
  const diff = bestEstimated - currentRM;

  // Round to whole number
  const roundedDiff = Math.round(diff);

  if (roundedDiff === 0) return '';
  
  return `${roundedDiff > 0 ? '▴' : '▾'} ${Math.abs(roundedDiff)}`;
};
const getSparclineColor = (exerciseId, theme) => {
  const data = getSparclineData(exerciseId);
  if (data.length < 2 || data.every(v => v === 0)) {
    return Colors.get('subText', theme);
  }

  const first = data[0];
  const last = data[data.length - 1];

  if (last > first * 1.02) { // +2% = progress
    return Colors.get('light', theme); // green
  } else if (last < first * 0.98) { // -2% = regress
    return Colors.get('heavy', theme); // orange/red
  } else {
    return Colors.get('medium', theme); // neutral
  }
};

const styles = (theme,fSize) => ({
  card: {
    display: 'flex',
    flexDirection:'row',
    alignItems: 'center',
    backgroundColor:Colors.get('bottomPanel', theme),
    boxShadow: `2px 2px 6px ${Colors.get('shadow', theme)}`,
    justifyContent: 'flex-start',
    width: '95vw',
    height: '20vw',
    marginBottom:'10px',
    
  },
  text: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom: '4px'
  },
  subtext: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginBottom: '4px'
  }
});
