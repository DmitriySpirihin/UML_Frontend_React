import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$} from '../../StaticClasses/HabitsBus'

const AddProgrammPanel = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  
    // subscriptions
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);     
       // render    
       return (
           <div style={styles(theme).container}>
             <div style={styles(theme).panel}>
               <h1>Add training programm</h1>
             </div>
           </div>
       )
}

export default AddProgrammPanel



const styles = (theme) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'absolute',
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