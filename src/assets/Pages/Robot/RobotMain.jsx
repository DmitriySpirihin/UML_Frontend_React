import React, { useState, useEffect } from 'react';
import { AppData,UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$} from '../../StaticClasses/HabitsBus';
import Insight from '../SleepPages/Insight.jsx';


const RobotMain = () => {
  const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(setLangIndex);
        const fSizeSub = fontSize$.subscribe(setFSize);
        const premiumSub = premium$.subscribe(setHasPremium);
        return () => {
            themeSub.unsubscribe();
            langSub.unsubscribe();
            fSizeSub.unsubscribe();
            premiumSub.unsubscribe();
        };
    }, []);

  return (
    <div style={styles(theme, fSize).container}>
      
       {<Insight />}
      {hasPremium && (
             <div style={{width : '100vw' ,height: '80vh',position:'fixed',zIndex: 2555,pointerEvents: 'none'} }>
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2555,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
                </div>
              </div>
            )}
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