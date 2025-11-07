import React, {useState,useEffect} from 'react'
import BackDark from '../../Art/Ui/Back_Dark.png'
import MetricsDark from '../../Art/Ui/Metrics_Dark.png'
import AddDark from '../../Art/Ui/Add_Dark.png'
import CalendarDark from '../../Art/Ui/Calendar_Dark.png'
import BackLight from '../../Art/Ui/Back_Light.png'
import MetricsLight from '../../Art/Ui/Metrics_Light.png'
import AddLight from '../../Art/Ui/Add_Light.png'
import CalendarLight from '../../Art/Ui/Calendar_Light.png'
import StreakIcon from '../../Art/Ui/Streak_Flame.png'
import Divider from '../../Art/Ui/Divider.png'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import { setPage } from '../../StaticClasses/HabitsBus.js';
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$, globalTheme$} from '../../StaticClasses/HabitsBus'
import { Slider } from '@mui/material'

const dateKey = new Date().toISOString().split('T')[0];
const clickSound = new Audio(new URL('../../Audio/Click_Add.mp3', import.meta.url).href);
const isDoneSound = new Audio(new URL('../../Audio/IsDone.mp3', import.meta.url).href); 

const HabitMetrics = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [globalTheme, setglobalThemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fillAmount, setFillAmount] = useState(0.19);
    // subscriptions
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = globalTheme$.subscribe(setglobalThemeState);   
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    // circle percent bar
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    
    // render    
    return (
        <div style={styles(theme).container}>
          <div style={styles(theme).panel}>
            {/* habit changer */}
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'10vh'}}>
              <div onClick={() => {}}><h1 style={{...styles(theme).text,fontSize:'28px',paddingBottom:'7px',paddingRight:'15px'}}>{'<'}</h1></div>
              <p style={styles(theme).text}>{langIndex === 0 ? 'Название привычки' : 'Habit name'}</p>
              <div onClick={() => {}}><h1 style={{...styles(theme).text,fontSize:'28px',paddingLeft:'15px'}}>{'>'}</h1></div> 
            </div>
            {/* habit metrics days*/}
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'15vh',flexDirection:'column',
                  backgroundColor:Colors.get('simplePanel', theme),marginTop:'10px',borderRadius:'24px'}}>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'7vh',backgroundColor:Colors.get('background', theme),
                borderRadius:'12px',marginTop:'12px'}}>
                    {/* days elements here */}
              </div>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'10vh'}}>
                  <div onClick={() => {}}><h1 style={{...styles(theme).text,fontSize:'24px',paddingRight:'25px'}}>{'<'}</h1></div>
                  <p style={styles(theme).text}>{langIndex === 0 ? '7 дней' : '7 days'}</p>
                  <div onClick={() => {}}><h1 style={{...styles(theme).text,fontSize:'24px',paddingLeft:'25px'}}>{'>'}</h1></div> 
                </div>
            </div>
            {/* streaks*/}
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',width:'90%',height:'7vh',marginTop:'10px'}}>
              <p style={styles(theme).subText}>{'максимальная серия 5'}</p>
              <img src={StreakIcon} style={{width:'30px'}} />
              <img src={Divider} style={{width:'40px'}} />
              <img src={StreakIcon} style={{width:'30px'}} />
              <p style={styles(theme).subText}>{'текущая серия 2'}</p>
            </div>
            {/* percent filled icon*/}
               <svg width="16vh" height="16vh" transform = "rotate(-90, 0, 0)">
                <circle stroke={Colors.get('shadow', theme)} fill="none" strokeWidth="17" r={radius} cx="77" cy="77"/>
                <circle stroke={Colors.get('border', theme)} fill="none" strokeWidth="16" r={radius} cx="75" cy="75"/>
                <circle stroke={Colors.get('progressBar', theme)} fill="none" strokeWidth="15" r={radius} cx="75" cy="75"/>
                <circle stroke={interpolateColor(Colors.get('habitCardSkipped', theme), Colors.get('habitCardDone', theme), fillAmount)} fill="none" strokeWidth="15" r={radius} cx="75" cy="75" 
                strokeDasharray={circumference} strokeDashoffset={circumference + (fillAmount * circumference)} 
                style={{transition: 'stroke-dashoffset 1s linear'}}   />
                <text transform="rotate(90, 75, 75)" x="75" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="24" fill={Colors.get('mainText', theme)}>{Math.round(fillAmount * 100)+"%"}</text>
               </svg>
               <Slider min={0.01} max={1} step={0.001} value={fillAmount} onChange={(e, value) => setFillAmount(value)} />
          </div>
          <BottomPanel theme={theme} globalTheme={globalTheme}/>
        </div>
    )
}

export default HabitMetrics

function BottomPanel({globalTheme,theme})
{
    const style ={
        position:'fixed',
        bottom:'0',
        left:'0',
        width:'100vw',
        height:'10vh',
        borderTopLeftRadius:'24px',
        borderTopRightRadius:'24px',
        backgroundColor: Colors.get('bottomPanel', theme),
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex:900,
        boxShadow: `0px -2px 0px ${Colors.get('bottomPanelShadow', theme)}`,
    }
    const btnstyle = {
        width: "35px",
        
        border: "none",
        display:'flex',
        alignItems:'center',
        justifyContent : 'center',
        background: "transparent",

    }
    return (
        <div style={style}>
            <img src={globalTheme === 'dark' ? BackDark : BackLight} style={btnstyle} onClick={() => setPage('HabitsMain')} />
            <img src={globalTheme === 'dark' ? MetricsDark : MetricsLight} style={btnstyle} onClick={() => setPage('HabitMetrics')} />
            <img src={globalTheme === 'dark' ? AddDark : AddLight} style={btnstyle} onClick={() => {}} />
            <img src={globalTheme === 'dark' ? CalendarDark : CalendarLight} style={btnstyle} onClick={() => setPage('HabitCalendar')} />
        </div>
    )
}
  
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
  panel :
  {
       display:'flex',
       flexDirection:'column',
         width: "80vw",
        height: "65vh",
        position:'absolute',
        top:'50%',
        left:'50%',
        transform:'translate(-50%,-50%)',
        alignItems: "center",
        justifyContent: "start",
        borderRadius: "24px",
        border: `1px solid ${Colors.get('border', theme)}`,
        margin: "5px",
        background:Colors.get('background', theme),
        boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`
  },
  text :
  {
    fontFamily: "Segoe UI",
    textAlign: "center",
    fontSize: "18px",
    color: Colors.get('mainText', theme),
  },
  subText :
  {
    fontFamily: "Segoe UI",
    textAlign: "center",
    fontSize: "14px",
    color: Colors.get('subText', theme),
  },
  scrollView:
  {
    width: "85vw",
    height: "74vh",
    overflowY: "auto",
    marginTop:"17vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
  }
})
function interpolateColor(color1, color2, factor) {
  if (!color1 || !color2) return color1 || color2 || '#000000';
  // Ensure factor is clamped between 0 and 1
  factor = Math.max(0, Math.min(1, factor));

  // Remove '#' if present
  color1 = color1.replace('#', '');
  color2 = color2.replace('#', '');

  // Parse RGB components
  const r1 = parseInt(color1.slice(0, 2), 16);
  const g1 = parseInt(color1.slice(2, 4), 16);
  const b1 = parseInt(color1.slice(4, 6), 16);

  const r2 = parseInt(color2.slice(0, 2), 16);
  const g2 = parseInt(color2.slice(2, 4), 16);
  const b2 = parseInt(color2.slice(4, 6), 16);

  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Convert back to hex and ensure two digits
  return '#' + r.toString(16).padStart(2, '0') + 
         g.toString(16).padStart(2, '0') + 
         b.toString(16).padStart(2, '0');
}