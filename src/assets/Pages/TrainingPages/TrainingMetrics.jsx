import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$} from '../../StaticClasses/HabitsBus'
import BarChart from '../../Helpers/BarChart.jsx'

const TrainingMetrics = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
  
  const chartData = [
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
];
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
    <p style={{...styles(theme,fSize).text,paddingTop:'10px'}}>Training Metrics</p>
      <div style={styles(theme).panel}>
         <BarChart  theme={theme}  data={chartData} mark={'rep'} color={'#ca7e4cff'}/>
      </div>
      
    </div>
  )
}

export default TrainingMetrics



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