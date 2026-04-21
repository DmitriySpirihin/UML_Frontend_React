import React, { useState, useEffect } from 'react';
import { AppData,UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$, setPage} from '../../StaticClasses/HabitsBus';
import { FaCrown } from 'react-icons/fa';
import Insight from '../SleepPages/Insight.jsx';


const RobotMain = () => {
  const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
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
      {!hasPremium && (
          <div onClick={(e) => e.stopPropagation()}
              style={{
                  position: 'fixed', inset: 0, zIndex: 2555,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                  background: theme === 'dark' ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                  backdropFilter: 'blur(20px)',
                  textAlign: 'center'
              }}>
              <div style={{
                  width: '72px', height: '72px', background: 'rgba(0,122,255,0.12)',
                  borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', border: '1px solid rgba(0,122,255,0.22)',
              }}>
                  <FaCrown size={30} color="#007AFF" />
              </div>
              <div style={{
                  fontSize: '13px', lineHeight: '1.6',
                  color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                  marginBottom: '24px', maxWidth: '210px',
              }}>
                  {langIndex === 0 ? 'Откройте полный доступ ко всем функциям' : 'Unlock full access to all features'}
              </div>
              <button onClick={() => setPage('premium')} style={{
                  fontSize: '15px', fontWeight: '700', color: '#fff', background: '#007AFF',
                  border: 'none', borderRadius: '14px', padding: '13px 0', marginBottom: '10px',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,122,255,0.35)', width: '220px',
              }}>
                  {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
              </button>
              <button onClick={() => setPage('MainMenu')} style={{
                  fontSize: '13px', fontWeight: '500',
                  color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                  background: 'transparent', border: 'none', padding: '8px 20px', cursor: 'pointer',
              }}>
                  {langIndex === 0 ? '← На главную' : '← Home'}
              </button>
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