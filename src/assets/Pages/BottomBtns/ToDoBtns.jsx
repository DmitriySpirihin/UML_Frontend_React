import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Add from '@mui/icons-material/AddRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';
import { FaChartLine, FaUsers } from 'react-icons/fa';
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
import { buildTodoAccent, DEFAULT_TODO_ACCENT_COLOR } from '../ToDoPages/ToDoVisuals.js';
import { todoEvents$ } from '../ToDoPages/ToDoHelper.js';

const switchSound = new Audio('Audio/Click.wav');

const BtnsToDo = () => {
  const [theme, setThemeState] = useState('dark');
  const [page, setPageState] = useState('');
  const [addPanel, setAddPanelState] = useState('');
  const [currentBtn, setBtnState] = useState(0);
  const [, setAccentVersion] = useState(0);
  const accent = buildTodoAccent(AppData.todoAccentColor || DEFAULT_TODO_ACCENT_COLOR);

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
    <div style={containerStyle(theme)}>
      <div style={glassOverlay(theme)} />
      <div style={dockSide('left')}>
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

      <div style={addButtonShell}>
        <motion.button
          type="button"
          whileTap={page === 'ToDoMain' ? { scale: 0.92 } : {}}
          onClick={() => {
            if (page !== 'ToDoMain') return;
            setCurrentBottomBtn(2);
            setPage('ToDoNew');
            playEffects(switchSound);
          }}
          style={addButtonStyle(theme, accent, page !== 'ToDoMain', currentBtn === 2 && page === 'ToDoMain')}
        >
          <Add style={{ fontSize: 28 }} />
        </motion.button>
      </div>

      <div style={dockSide('right')}>
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
          id={1}
          current={currentBtn}
          icon={<AutoAwesome />}
          onClick={() => {
            setCurrentBottomBtn(1);
            setPage('ToDoInsight');
            setAddPanel('');
            playEffects(switchSound);
          }}
          theme={theme}
          accent={accent}
        />
      </div>
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

const containerStyle = (theme) => ({
  position: 'fixed',
  bottom: 'max(18px, calc(24px + env(safe-area-inset-bottom, 0px)))',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100vw - 40px)',
  maxWidth: '420px',
  height: '66px',
  borderRadius: '999px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
  boxSizing: 'border-box',
  padding: '10px 12px',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  overflow: 'hidden',
  boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const dockSide = (side) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  [side]: '16px',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
  gap: '4px'
});

const glassOverlay = (theme) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: Colors.get('bottomPanel', theme),
  opacity: 0.9,
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: `1px solid ${Colors.get('border', theme)}`,
  borderRadius: '999px',
  zIndex: -1
});

const navButtonStyle = (theme, active) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return {
    position: 'relative',
    width: 44,
    height: 44,
    borderRadius: 999,
    border: 'none',
    background: 'transparent',
    color: active ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: 'none',
    opacity: isLight || active ? 1 : 0.94,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent'
  };
};

const addButtonShell = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  zIndex: 2,
  width: 46,
  height: 46
};

const addButtonStyle = (theme, accent, disabled, active) => {
  return {
    width: 46,
    height: 46,
    borderRadius: 999,
    border: active ? `1px solid ${accent.ring}` : `1px solid ${Colors.get('border', theme)}`,
    background: active ? accent.soft : Colors.get('simplePanel', theme),
    color: active ? accent.hue : Colors.get('icons', theme),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.45 : 1,
    boxShadow: `0 16px 30px -18px ${Colors.get('shadow', theme)}`,
    padding: 0,
    cursor: disabled ? 'default' : 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent'
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
