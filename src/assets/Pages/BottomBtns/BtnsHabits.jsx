import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Metrics from '@mui/icons-material/BarChartRounded';
import Calendar from '@mui/icons-material/CalendarMonthRounded';
import Add from '@mui/icons-material/AddRounded';
import FaBell from '@mui/icons-material/NotificationsRounded';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn, setNotifyPanel, notify$, habitAccent$
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';
import { HABITS_ACCENT } from '../HabitsPages/HabitVisuals.jsx';

const switchSound = new Audio('Audio/Click.wav');

const BtnsHabits = () => {
    const [theme, setThemeState] = useState('dark');
    const [page, setPageState] = useState('');
    const [addPanel, setAddPanelState] = useState('');
    const [currentBtn, setBtnState] = useState(0);
    const [, setAccentVersion] = useState(0);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            setPage$.subscribe(setPageState),
            addPanel$.subscribe(setAddPanelState),
            currentBottomBtn$.subscribe(setBtnState),
            habitAccent$.subscribe(() => setAccentVersion(v => v + 1))
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    // Logic to sync button state with page
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'HabitCalendar') setCurrentBottomBtn(4);
            else if (page === 'HabitMetrics') setCurrentBottomBtn(1);
            else if (page === 'HabitsMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />
            
            <NavButton 
                id={0}
                current={currentBtn}
                icon={page === 'HabitsMain' && addPanel === '' ? <Home /> : <Back />}
                onClick={() => {
                    onBack(page, addPanel);
                    setNotifyPanel(false);
                    setCurrentBottomBtn(0);
                }}
                theme={theme}
            />

            <NavButton 
                id={1}
                current={currentBtn}
                icon={<Metrics />}
                onClick={() => {
                    setCurrentBottomBtn(1);
                    setPage('HabitMetrics');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <AddButton 
                active={addPanel === 'aaaaa'}
                disabled={page !== 'HabitsMain'}
                onClick={() => {
                    if (page === 'HabitsMain') {
                        setCurrentBottomBtn(2);
                        setPage('AddHabitPanel');
                        setNotifyPanel(false);
                        playEffects(switchSound);
                    }
                }}
                theme={theme}
            />

            <NavButton 
                id={4}
                current={currentBtn}
                icon={<Calendar />}
                onClick={() => {
                    setCurrentBottomBtn(4);
                    setPage('HabitCalendar');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            {page.startsWith('H') && (
                <NavButton 
                    id={5}
                    current={currentBtn}
                    icon={<FaBell />}
                    onClick={() => {
                        setCurrentBottomBtn(5);
                        setNotifyPanel(true);
                        setAddPanel('');
                        playEffects(switchSound);
                    }}
                    theme={theme}
                />
            )}
        </div>
    );
};

// Sub-components for cleaner code
const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    return (
        <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={navBtnWrapper}
        >
            <div style={{
                color: isActive ? HABITS_ACCENT.hue : Colors.get('icons', theme),
                fontSize: '28px',
                transition: 'color 0.3s ease'
            }}>
                {React.cloneElement(icon, { fontSize: 'inherit' })}
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="activeTab"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={activeIndicator(theme)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const AddButton = ({ disabled, onClick, theme, active }) => (
    <motion.div
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={onClick}
        style={{
            ...addBtnStyle(theme),
            opacity: disabled ? 0.5 : 1,
            background: active ? HABITS_ACCENT.soft : Colors.get('simplePanel', theme),
            border: active ? `1px solid ${HABITS_ACCENT.ring}` : `1px solid ${Colors.get('border', theme)}`,
        }}
    >
        <Add style={{ fontSize: '32px', color: active ? HABITS_ACCENT.hue : Colors.get('icons', theme) }} />
    </motion.div>
);

// Logic and Helpers
const onBack = async (page, addPanel) => {
    if (page === 'HabitsMain' && addPanel === '') {
        await saveData();
        setPage('MainMenu');
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('HabitsMain');
    }
    playEffects(switchSound);
};

// Styles
const containerStyle = (theme) => ({
    position: 'fixed',
    bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: '360px',
    height: '66px',
    borderRadius: '999px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '10px 14px',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.get('bottomPanel', theme),
    opacity: 0.9,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid ${Colors.get('border', theme)}`,
    borderRadius: '999px',
    zIndex: -1,
});

const navBtnWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    width: '46px',
    borderRadius: '999px',
    cursor: 'pointer'
};

const activeIndicator = (theme) => ({
    position: 'absolute',
    bottom: '4px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: HABITS_ACCENT.hue,
    boxShadow: `0 0 10px ${HABITS_ACCENT.glow}`
});

const addBtnStyle = (theme) => ({
    width: '50px',
    height: '50px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${Colors.get('border', theme)}`,
    boxShadow: `0 16px 30px -18px ${Colors.get('shadow', theme)}`,
    transition: 'background 0.3s ease',
});

export default BtnsHabits;
