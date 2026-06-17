import React, { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, fontSize$, setPage} from '../../StaticClasses/HabitsBus';
import HomeRounded from '@mui/icons-material/HomeRounded';
import Insight from '../SleepPages/Insight.jsx';
import { buildTodoAccent } from '../ToDoPages/ToDoVisuals.js';


const RobotMain = () => {
  const [theme, setThemeState] = useState('dark');
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const fSizeSub = fontSize$.subscribe(setFSize);
        return () => {
            themeSub.unsubscribe();
            fSizeSub.unsubscribe();
        };
    }, []);

  return (
    <div style={styles(theme, fSize).container}>
      <Insight bottomInset={92} />
      <button type="button" onClick={() => setPage('MainMenu')} style={styles(theme, fSize).homeDock}>
          <HomeRounded style={styles(theme, fSize).homeIcon} />
          <span style={styles(theme, fSize).homeDot} />
      </button>
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
    height: 'var(--app-viewport-height)',
    padding: 0,
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
