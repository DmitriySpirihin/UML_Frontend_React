import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Metrics from '@mui/icons-material/BarChartRounded';
import Calendar from '@mui/icons-material/CalendarMonthRounded';
import Add from '@mui/icons-material/AddRounded';
import FaBell from '@mui/icons-material/NotificationsRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';

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
            else if (page === 'HabitsInsight') setCurrentBottomBtn(6);
            else if (page === 'HabitsMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    const navItems = [
        {
            id: 0,
            icon: page === 'HabitsMain' && addPanel === '' ? <Home /> : <Back />,
            onClick: () => {
                onBack(page, addPanel);
                setNotifyPanel(false);
                setCurrentBottomBtn(0);
            }
        },
        {
            id: 1,
            icon: <Metrics />,
            onClick: () => {
                setCurrentBottomBtn(1);
                setPage('HabitMetrics');
                setAddPanel('');
                setNotifyPanel(false);
                playEffects(switchSound);
            }
        },
        {
            id: 2,
            isAdd: true,
            active: page === 'AddHabitPanel',
            disabled: page !== 'HabitsMain',
            onClick: () => {
                if (page === 'HabitsMain') {
                    setCurrentBottomBtn(2);
                    setPage('AddHabitPanel');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }
            }
        },
        {
            id: 4,
            icon: <Calendar />,
            onClick: () => {
                setCurrentBottomBtn(4);
                setPage('HabitCalendar');
                setAddPanel('');
                setNotifyPanel(false);
                playEffects(switchSound);
            }
        },
        ...(page.startsWith('H') ? [{
            id: 5,
            icon: <FaBell />,
            onClick: () => {
                setCurrentBottomBtn(5);
                setNotifyPanel(true);
                setAddPanel('');
                playEffects(switchSound);
            }
        }] : []),
        {
            id: 6,
            icon: <AutoAwesome />,
            onClick: () => {
                setCurrentBottomBtn(6);
                setPage('HabitsInsight');
                setAddPanel('');
                setNotifyPanel(false);
                playEffects(switchSound);
            }
        }
    ];

    const isExpandedDock = navItems.length > 5;
    const gridColumnById = isExpandedDock
        ? { 0: 1, 1: 2, 2: 4, 4: 5, 5: 6, 6: 7 }
        : {};

    return (
        <div style={containerStyle(theme, navItems.length)}>
            <div style={glassOverlay(theme)} />
            {navItems.map((item) => item.isAdd ? (
                <AddButton
                    key={item.id}
                    active={item.active}
                    disabled={item.disabled}
                    onClick={item.onClick}
                    theme={theme}
                    gridColumn={gridColumnById[item.id]}
                />
            ) : (
                <NavButton
                    key={item.id}
                    id={item.id}
                    current={currentBtn}
                    icon={item.icon}
                    onClick={item.onClick}
                    theme={theme}
                    gridColumn={gridColumnById[item.id]}
                />
            ))}
        </div>
    );
};

// Sub-components for cleaner code
const NavButton = ({ id, current, icon, onClick, theme, gridColumn }) => {
    const isActive = current === id;
    return (
        <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={{ ...navBtnWrapper, gridColumn }}
        >
            <div style={{
                color: isActive ? HABITS_ACCENT.hue : Colors.get('icons', theme),
                fontSize: '24px',
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

const AddButton = ({ disabled, onClick, theme, active, gridColumn }) => (
    <motion.div
        whileHover={!disabled ? { scale: 1.04 } : {}}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        onClick={onClick}
        style={{
            ...addBtnStyle(theme),
            gridColumn,
            opacity: disabled ? 0.42 : 1,
            background: active ? HABITS_ACCENT.soft : 'rgba(255,255,255,0.045)',
            border: '1px solid transparent',
        }}
    >
        <Add style={{ fontSize: '28px', color: active ? HABITS_ACCENT.hue : Colors.get('icons', theme) }} />
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
const containerStyle = (theme, itemCount = 6) => ({
    position: 'fixed',
    bottom: 'max(18px, calc(24px + env(safe-area-inset-bottom, 0px)))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: '420px',
    height: '66px',
    borderRadius: '999px',
    display: 'grid',
    gridTemplateColumns: `repeat(${itemCount > 5 ? 7 : itemCount}, minmax(0, 1fr))`,
    justifyItems: 'center',
    alignItems: 'center',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '9px 12px',
    columnGap: 3,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset, 0 22px 46px -24px rgba(0,0,0,0.74)'
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.get('bottomPanel', theme),
    opacity: 0.9,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid transparent',
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
    width: '44px',
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
    boxShadow: `0 0 7px ${HABITS_ACCENT.glow}`
});

const addBtnStyle = (theme) => ({
    width: '46px',
    height: '46px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid transparent',
    boxShadow: `0 16px 28px -22px ${Colors.get('shadow', theme)}`,
    transition: 'background 0.3s ease',
});

export default BtnsHabits;
