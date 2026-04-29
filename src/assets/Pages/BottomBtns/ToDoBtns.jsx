import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Add from '@mui/icons-material/AddRounded';
import { FaChartLine, FaMagic, FaUsers } from 'react-icons/fa';
import {
  addPanel$,
  currentBottomBtn$,
  setAddPanel,
  setCurrentBottomBtn,
  setPage,
  setPage$,
  theme$
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData.js';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';
import { buildTodoAccent } from '../ToDoPages/ToDoVisuals.js';
import { todoEvents$ } from '../ToDoPages/ToDoHelper.js';

const switchSound = new Audio('Audio/Click.wav');

const BtnsToDo = () => {
  const [theme, setThemeState] = useState('dark');
  const [page, setPageState] = useState('');
  const [addPanel, setAddPanelState] = useState('');
  const [currentBtn, setBtnState] = useState(0);
  const [, setAccentVersion] = useState(0);
  const accent = buildTodoAccent(AppData.todoAccentColor || '#8FA6C8');

  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      setPage$.subscribe(setPageState),
      addPanel$.subscribe(setAddPanelState),
      currentBottomBtn$.subscribe(setBtnState),
      todoEvents$.subscribe(event => {
        if (event?.type === 'ACCENT_CHANGE') setAccentVersion(v => v + 1);
      })
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  useEffect(() => {
    if (page === 'ToDoInsight') setCurrentBottomBtn(1);
    else if (page === 'ToDoMetrics') setCurrentBottomBtn(4);
    else if (page === 'ToDoCollab') setCurrentBottomBtn(3);
    else if (page === 'ToDoMain' && addPanel === '') setCurrentBottomBtn(0);
  }, [page, addPanel]);

  return (
    <div style={containerStyle(theme, accent)}>
      <NavButton
        id={0}
        current={currentBtn}
        icon={page === 'ToDoMain' && addPanel === '' ? <Home /> : <Back />}
        onClick={() => {
          onBack(page, addPanel);
          setCurrentBottomBtn(0);
        }}
        theme={theme}
        accent={accent}
      />

      <NavButton
        id={1}
        current={currentBtn}
        icon={<FaMagic />}
        onClick={() => {
          setCurrentBottomBtn(1);
          setPage('ToDoInsight');
          setAddPanel('');
          playEffects(switchSound);
        }}
        theme={theme}
        accent={accent}
      />

      <motion.button
        type="button"
        whileTap={page === 'ToDoMain' ? { scale: 0.92 } : {}}
        onClick={() => {
          if (page !== 'ToDoMain') return;
          setCurrentBottomBtn(2);
          setPage('ToDoNew');
          playEffects(switchSound);
        }}
        style={addButtonStyle(theme, accent, page !== 'ToDoMain')}
      >
        <Add style={{ fontSize: 34 }} />
      </motion.button>

      <NavButton
        id={3}
        current={currentBtn}
        icon={<FaUsers />}
        onClick={() => {
          setCurrentBottomBtn(3);
          setPage('ToDoCollab');
          setAddPanel('');
          playEffects(switchSound);
        }}
        theme={theme}
        accent={accent}
      />

      <NavButton
        id={4}
        current={currentBtn}
        icon={<FaChartLine />}
        onClick={() => {
          setCurrentBottomBtn(4);
          setPage('ToDoMetrics');
          setAddPanel('');
          playEffects(switchSound);
        }}
        theme={theme}
        accent={accent}
      />
    </div>
  );
};

const NavButton = ({ id, current, icon, onClick, theme, accent }) => {
  const active = current === id;
  const isMui = React.isValidElement(icon) && icon.type?.muiName;
  return (
    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onClick} style={navButtonStyle(theme, active)}>
      <span style={{ display: 'flex', color: active ? accent.hue : Colors.get('icons', theme), fontSize: 28 }}>
        {isMui ? React.cloneElement(icon, { fontSize: 'inherit' }) : icon}
      </span>
      <AnimatePresence>
        {active && <motion.span layoutId="todoDockDot" style={activeDot(accent)} />}
      </AnimatePresence>
    </motion.button>
  );
};

const onBack = async (page, addPanel) => {
  if (page === 'ToDoMain' && addPanel === '') {
    await saveData();
    setPage('MainMenu');
  } else {
    if (addPanel !== '') setAddPanel('');
    else setPage('ToDoMain');
  }
  playEffects(switchSound);
};

const containerStyle = (theme, accent) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return {
    position: 'fixed',
    left: '50%',
    bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: 340,
    height: 66,
    borderRadius: 999,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 14px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    background: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(16,18,21,0.82)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)'}`,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    boxShadow: isLight ? '0 18px 60px rgba(15,23,42,0.16)' : '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)',
    zIndex: 2000
  };
};

const navButtonStyle = (theme, active) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return {
    position: 'relative',
    width: 46,
    height: 46,
    borderRadius: 999,
    border: 'none',
    background: 'transparent',
    color: active ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: 'none',
    opacity: isLight || active ? 1 : 0.94
  };
};

const addButtonStyle = (theme, accent, disabled) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return {
    width: 50,
    height: 50,
    borderRadius: 999,
    border: `1px solid ${disabled ? Colors.get('border', theme) : accent.ring}`,
    background: disabled ? Colors.get('simplePanel', theme) : isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.055)',
    color: disabled ? Colors.get('iconsDisabled', theme) : accent.hue,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.45 : 1,
    boxShadow: disabled ? 'none' : `0 16px 30px -18px ${accent.hue}`,
    padding: 0
  };
};

const activeDot = (accent) => ({
  position: 'absolute',
  bottom: 4,
  width: 5,
  height: 5,
  borderRadius: 999,
  background: accent.hue,
  boxShadow: `0 0 12px ${accent.glow}`
});

export default BtnsToDo;
