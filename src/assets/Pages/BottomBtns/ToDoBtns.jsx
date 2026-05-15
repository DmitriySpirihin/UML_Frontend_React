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
    <div style={containerStyle(theme, 5)}>
      <div style={glassOverlay(theme)} />
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

      <AddNavButton
        disabled={page !== 'ToDoMain'}
        active={currentBtn === 2 && page === 'ToDoMain'}
        theme={theme}
        accent={accent}
        onClick={() => {
          if (page !== 'ToDoMain') return;
          setCurrentBottomBtn(2);
          setPage('ToDoNew');
          playEffects(switchSound);
        }}
      />

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
  );
};

const NavButton = ({ id, current, icon, onClick, theme, accent }) => {
  const active = current === id;
  const isMui = React.isValidElement(icon) && icon.type?.muiName;
  return (
    <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={onClick} style={navButtonStyle(theme, active)}>
      <span style={navIconStyle(theme, active, accent)}>
        {isMui ? React.cloneElement(icon, { fontSize: 'inherit' }) : icon}
      </span>
      <AnimatePresence>
        {active && (
          <motion.span
            layoutId="todoDockDot"
            initial={{ opacity: 0, y: 4, scale: 0.45 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.45 }}
            transition={{ type: 'spring', stiffness: 460, damping: 28, mass: 0.55 }}
            style={activeDot(accent)}
          />
        )}
      </AnimatePresence>
    </motion.button>
  );
};

const AddNavButton = ({ disabled, active, onClick, theme, accent }) => (
  <motion.button
    type="button"
    whileTap={!disabled ? { scale: 0.92 } : {}}
    onClick={onClick}
    style={addButtonStyle(theme, accent, disabled, active)}
  >
    <Add style={{ fontSize: 26 }} />
  </motion.button>
);

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

const containerStyle = (theme, itemCount) => ({
  position: 'fixed',
  bottom: 'max(14px, calc(20px + env(safe-area-inset-bottom, 0px)))',
  left: '50%',
  transform: 'translateX(-50%)',
  width: 'calc(100vw - 72px)',
  maxWidth: '360px',
  height: '58px',
  borderRadius: '999px',
  display: 'grid',
  gridTemplateColumns: `repeat(${itemCount}, minmax(0, 1fr))`,
  justifyItems: 'center',
  alignItems: 'center',
  zIndex: 1000,
  boxSizing: 'border-box',
  padding: '6px 10px 9px',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  overflow: 'hidden',
  boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const glassOverlay = (theme) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: theme === 'light' || theme === 'speciallight'
    ? 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))'
    : 'linear-gradient(135deg, rgba(19,29,36,0.64), rgba(8,13,17,0.50))',
  backdropFilter: 'blur(30px) saturate(190%)',
  WebkitBackdropFilter: 'blur(30px) saturate(190%)',
  border: `1px solid ${theme === 'light' || theme === 'speciallight' ? 'rgba(148,163,184,0.28)' : 'rgba(190,220,235,0.14)'}`,
  borderRadius: '999px',
  boxShadow: theme === 'light' || theme === 'speciallight'
    ? '0 1px 0 rgba(255,255,255,0.88) inset, 0 20px 44px -30px rgba(15,23,42,0.28)'
    : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(20,157,255,0.08)',
  zIndex: -1
});

const navButtonStyle = (theme, active) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return {
    position: 'relative',
    width: 44,
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
    opacity: isLight || active ? 1 : 0.94,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    WebkitTapHighlightColor: 'transparent'
  };
};

const navIconStyle = (theme, active, accent) => ({
  display: 'flex',
  color: active ? accent.hue : Colors.get('icons', theme),
  fontSize: 26,
  transform: active ? 'translateY(-4px) scale(1.03)' : 'translateY(0) scale(1)',
  transition: 'color 0.22s ease, transform 0.22s ease, filter 0.22s ease',
  filter: active ? `drop-shadow(0 0 9px ${accent.glow})` : 'none',
  willChange: 'transform',
});

const addButtonStyle = (theme, accent, disabled, active) => {
  return {
    width: 42,
    height: 42,
    borderRadius: 999,
    border: `1px solid ${accent.ring}`,
    background: active ? accent.soft : `linear-gradient(135deg, rgba(${accent.rgbText},0.13), rgba(255,255,255,0.035))`,
    color: accent.hue,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.45 : 1,
    boxShadow: `0 16px 30px -18px ${Colors.get('shadow', theme)}, 0 0 16px -12px ${accent.glow}`,
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
  bottom: 1,
  width: 7,
  height: 7,
  borderRadius: 999,
  background: accent.hue,
  border: '1px solid rgba(255,255,255,0.42)',
  boxShadow: `0 0 12px ${accent.glow}, 0 2px 8px rgba(0,0,0,0.42)`,
  transformOrigin: 'center',
});

export default BtnsToDo;
