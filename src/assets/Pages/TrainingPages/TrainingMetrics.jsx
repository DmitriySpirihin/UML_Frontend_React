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
  { date: "2025-11-12", value: 240 },
  { date: "2025-11-13", value: 300 },
  { date: "2025-11-14", value: 180 },
  { date: "2025-11-15", value: 270 },
  { date: "2025-11-16", value: 220 }
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
      <div style={styles(theme).panel}>
         <BarChart  theme={theme}  data={chartData} mark={'kg'} color={'#ca854cff'}/>
      </div>
    </div>
  )
}

export default TrainingMetrics



const styles = (theme) =>
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
    fontSize: "10px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: "8px",
    color: Colors.get('subText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
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