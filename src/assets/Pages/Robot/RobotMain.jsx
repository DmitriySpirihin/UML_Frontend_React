import React, { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$} from '../../StaticClasses/HabitsBus';
import Insight from '../SleepPages/Insight.jsx';


const RobotMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);

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
    <div style={styles(theme, fSize).container}>
      
       {<Insight />}
      
    </div>
  );
};

export default RobotMain;

const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
    height: '89vh',
    marginTop:'120px',
    width: '100vw',
    fontFamily: 'Segoe UI',
  }
});