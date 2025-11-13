import { Slider } from '@mui/material';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, setAddPanel,setCurrentBottomBtn} from '../../StaticClasses/HabitsBus';
import React, { useState , useEffect} from 'react';

const HabitSettings = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [daysToFormAHabit, setDaysToFormAHabit] = useState(AppData.daysToFormAHabit);
    React.useEffect(() => {
        const subscription = theme$.subscribe(setThemeState);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));  
        return () => subscription.unsubscribe();
    }, []);
    function setDaysToFormAHabitFn(value) {
      setDaysToFormAHabit(value);
      AppData.daysToFormAHabit = value;
    }
    
    return (
        <div style={styles(theme).container}>
            <div style={styles(theme).panel}>
                <p style={styles(theme).text}>{langIndex === 0 ? 'индивидуальные настройки' : 'individual settings'}</p>
                <p style={styles(theme).subText}>{getInfoText(langIndex)}</p>
                <div style={styles(theme).sliderContainer}>
                  <Slider style={styles(theme).slider} min={21} max={66} value={daysToFormAHabit} onChange={(e, value) => {setDaysToFormAHabitFn(value)}} />
                  <p style={{...styles(theme).text,fontSize:'16px',marginLeft:'18px'}}>{daysToFormAHabit}</p>
                </div>
                <p style={styles(theme).subText} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);}}>{langIndex === 0 ? '! нажми для закрытия !' : '! tap to close !'}</p>
            </div>
        </div>
    );
};
export default HabitSettings;
const styles = (theme) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  panel :
  {
    marginTop:'50vh',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width: "90vw",
    height: "25vh",
  },
  text :
  {
    marginTop:'12px',
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subText :
  {
    margin:'5px',
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('subText', theme),
  },
  sliderContainer :
  {
    padding:'5px',
    display:'flex',
    flexDirection:'row',
    alignItems:'SpaceAround',
    width:'100%',
    margin:'5px',
  },
  slider :
  {
    marginTop:'5px',
    width:'80%',
    color:Colors.get('border', theme),
  }
})
function getInfoText(langIndex) {
  return langIndex === 0 ? 
  'установите количество дней для формирования привычки (от 21 до 66 дней, 66 по умолчанию), чем больше дней, тем лучше сформируется привычка' : 
  'Set a number of days for habit to be considered as a habit (from 21 to 66 days, 66 by default), the more days the better the habit is formed';
}
