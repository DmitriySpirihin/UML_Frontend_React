import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Add from '@mui/icons-material/AddRounded';
import Devices from '@mui/icons-material/DevicesRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';
import { FaChartLine } from 'react-icons/fa';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn 
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData.js';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';
import { buildSleepAccent } from '../SleepPages/SleepVisuals.js';

const switchSound = new Audio('Audio/Click.wav');

const BtnsSleep = () => {
    const [theme, setthemeState] = useState('dark');
    const [page, setPageState] = useState('');
    const [addPanel, setAddPanelState] = useState('');
    const [currentBtn, setBtnState] = useState(0);
    const accent = buildSleepAccent(AppData.sleepAccentColor || '#7C6CFF');

    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            setPage$.subscribe(setPageState),
            addPanel$.subscribe(setAddPanelState),
            currentBottomBtn$.subscribe(setBtnState)
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    // Logic to sync button state with Sleep pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'SleepInsight') setCurrentBottomBtn(1);
            else if (page === 'SleepNew') setCurrentBottomBtn(2);
            else if (page === 'SleepDevices') setCurrentBottomBtn(3);
            else if (page === 'SleepMetrics') setCurrentBottomBtn(4);
            else if (page === 'SleepMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle()}>
            <div style={glassOverlay(theme)} />
            
            <NavButton
                id={0}
                current={currentBtn}
                icon={page === 'SleepMain' && addPanel === '' ? <Home /> : <Back />}
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
                    setPage('SleepMetrics');
                    setAddPanel('');
                    playEffects(switchSound);
                }}
                theme={theme}
                accent={accent}
            />

            <AddButton 
                active={page === 'SleepNew'}
                disabled={page !== 'SleepMain'}
                onClick={() => {
                    if (page === 'SleepMain') {
                        setCurrentBottomBtn(2);
                        setPage('SleepNew');
                        playEffects(switchSound);
                    }
                }}
                theme={theme}
                accent={accent}
            />

            <NavButton
                id={3}
                current={currentBtn}
                icon={<Devices />}
                onClick={() => {
                    setCurrentBottomBtn(3);
                    setPage('SleepDevices');
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
                    setPage('SleepInsight');
                    setAddPanel('');
                    playEffects(switchSound);
                }}
                theme={theme}
                accent={accent}
            />
        </div>
    );
};

// Sub-components for cleaner code
const NavButton = ({ id, current, icon, onClick, theme, accent, disabled = false }) => {
    const isActive = current === id;
    return (
        <Motion.div 
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onClick={onClick}
            style={{ ...navBtnWrapper, opacity: disabled ? 0.4 : 1 }}
        >
            <div style={{
                color: isActive ? accent.hue : Colors.get('icons', theme),
                fontSize: '24px',
                display: 'flex',
                transition: 'color 0.3s ease'
            }}>
                {React.isValidElement(icon) ? React.cloneElement(icon, { fontSize: 'inherit' }) : icon}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div 
                        layoutId="sleepActiveTab"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        style={activeIndicator(accent)}
                    />
                )}
            </AnimatePresence>
        </Motion.div>
    );
};

const AddButton = ({ disabled, onClick, theme, active, accent }) => (
    <Motion.div
        whileHover={!disabled ? { scale: 1.04 } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={onClick}
        style={{
            ...addBtnStyle(theme),
            opacity: disabled ? 0.42 : 1,
            background: (active || !disabled) ? accent.soft : 'rgba(255,255,255,0.045)',
            border: (active || !disabled) ? `1px solid ${accent.ring}` : `1px solid ${Colors.get('border', theme)}`,
        }}
    >
        <Add style={{ fontSize: '26px', color: (active || !disabled) ? accent.hue : Colors.get('icons', theme) }} />
    </Motion.div>
);

const onBack = async (page, addPanel) => {
    if (page === 'SleepMain' && addPanel === '') {
        await saveData();
        setPage('MainMenu');
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('SleepMain');
    }
    playEffects(switchSound);
};

// Styles
const containerStyle = () => ({
    position: 'fixed',
    bottom: 'max(14px, calc(20px + env(safe-area-inset-bottom, 0px)))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 72px)',
    maxWidth: '360px',
    height: '58px',
    borderRadius: '999px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '7px 10px',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: theme === 'light' || theme === 'speciallight'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))'
        : 'linear-gradient(135deg, rgba(19,29,36,0.64), rgba(8,13,17,0.50))',
    backdropFilter: 'blur(30px) saturate(190%)',
    WebkitBackdropFilter: 'blur(30px) saturate(190%)',
    border: `1px solid ${theme === 'light' || theme === 'speciallight' ? 'rgba(148,163,184,0.28)' : 'rgba(190,220,235,0.14)'}`,
    borderRadius: '999px',
    boxShadow: theme === 'light' || theme === 'speciallight'
        ? '0 1px 0 rgba(255,255,255,0.88) inset, 0 20px 44px -30px rgba(15,23,42,0.28)'
        : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(124,108,255,0.08)',
    zIndex: -1,
});

const navBtnWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    width: '40px',
    borderRadius: '999px',
    cursor: 'pointer'
};

const activeIndicator = (accent) => ({
    position: 'absolute',
    bottom: '4px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: accent.hue,
    boxShadow: `0 0 10px ${accent.glow}`
});

const addBtnStyle = (theme) => ({
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 16px 30px -18px ${Colors.get('shadow', theme)}`,
    transition: 'background 0.3s ease',
});

export default BtnsSleep;
