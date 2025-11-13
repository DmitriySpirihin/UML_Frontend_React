import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$, globalTheme$} from '../../StaticClasses/HabitsBus'

const dateKey = new Date().toISOString().split('T')[0];


const TrainingMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [globalTheme, setglobalThemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    
    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = globalTheme$.subscribe(setglobalThemeState);   
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
 
    
    // render    
    return (
        <div style={styles(theme).container}>
          <div style={{...styles(theme).panel,justifyContent:'center',alignItems:'center', marginTop:'40%'}}>
              
          </div>
        </div>
    )
}

export default TrainingMain



const styles = (theme) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     justifyContent: "start",
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  categoryPanel :
  {
    display:'flex',
    flexDirection:'column',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "4px",
    background:Colors.get('panelGradient', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    fontFamily:'Segoe UI',
    color: Colors.get('subText', theme),
  },
  text :
  {
    textAlign: "left",
    fontSize: "10px",
    color: Colors.get('subText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
  },
  scrollView:
  {
    padding:'20px',
    width: "90vw",
    height: "80vh",
    overflowY: "auto",
    marginTop:"15vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
    borderRadius:'24px',
    backgroundColor:'rgba(0,0,0,0.1)'
  }
})

function playEffects(sound,vibrationDuration ){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0)navigator.vibrate(vibrationDuration);
}