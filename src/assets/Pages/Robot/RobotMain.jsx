import React, { useState, useEffect } from 'react';
import { AppData,UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$, setPage} from '../../StaticClasses/HabitsBus';
import { FaCrown } from 'react-icons/fa';
import HomeRounded from '@mui/icons-material/HomeRounded';
import Insight from '../SleepPages/Insight.jsx';
import { buildTodoAccent } from '../ToDoPages/ToDoVisuals.js';


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
      <Insight />
      <button type="button" onClick={() => setPage('MainMenu')} style={styles(theme, fSize).homeDock}>
          <HomeRounded style={styles(theme, fSize).homeIcon} />
          <span style={styles(theme, fSize).homeDot} />
      </button>
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
                  width: '72px', height: '72px', background: 'rgba(159,180,196,0.12)',
                  borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', border: '1px solid rgba(159,180,196,0.22)',
              }}>
                  <FaCrown size={30} color="#9FB4C4" />
              </div>
              <div style={{
                  fontSize: '13px', lineHeight: '1.6',
                  color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                  marginBottom: '24px', maxWidth: '210px',
              }}>
                  {langIndex === 0 ? 'Откройте полный доступ ко всем функциям' : 'Unlock full access to all features'}
              </div>
              <button onClick={() => setPage('premium')} style={{
                  fontSize: '15px', fontWeight: '700', color: '#fff', background: '#9FB4C4',
                  border: 'none', borderRadius: '14px', padding: '13px 0', marginBottom: '10px',
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(159,180,196,0.35)', width: '220px',
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

const styles = (theme, fSize) => {
  const accent = buildTodoAccent(AppData.todoAccentColor || '#149DFF');

  return {
  container: {
    background: theme === 'light' || theme === 'speciallight'
      ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgbText},0.1), transparent 66%), #F4F5F7`
      : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgbText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
    minHeight: '100dvh',
    padding: '18px 0 88px',
    boxSizing: 'border-box',
    width: '100vw',
    fontFamily: 'inherit',
    fontSize: fSize === 0 ? '14px' : '16px',
    overflow: 'hidden',
    position: 'relative',
  },
  homeDock: {
    position: 'fixed',
    left: '50%',
    bottom: '14px',
    transform: 'translateX(-50%)',
    width: 'min(360px, calc(100vw - 84px))',
    height: '58px',
    borderRadius: '20px',
    border: `1px solid ${Colors.get('border', theme)}`,
    background: Colors.get('bottomPanel', theme),
    color: Colors.get('iconsHighlited', theme),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    boxShadow: theme === 'dark' ? '0 18px 44px rgba(0,0,0,0.38)' : '0 16px 34px rgba(15,23,42,0.12)',
    cursor: 'pointer',
    zIndex: 100,
    padding: 0,
  },
  homeIcon: {
    fontSize: fSize === 0 ? '28px' : '31px',
    color: 'inherit',
  },
  homeDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: Colors.get('iconsHighlited', theme),
    boxShadow: `0 0 10px ${Colors.get('iconsHighlited', theme)}`,
  }
  };
};
