import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';
import { FaChartLine, FaMedal } from 'react-icons/fa';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn, setNotifyPanel, sectionAccent$
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';
import { AppData } from '../../StaticClasses/AppData.js';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

const switchSound = new Audio('Audio/Click.wav');
const MENTAL_ACCENT = '#A66BFF';

const BtnsMental = () => {
    const [theme, setthemeState] = useState('dark');
    const [page, setPageState] = useState('');
    const [addPanel, setAddPanelState] = useState('');
    const [currentBtn, setBtnState] = useState(0);
    const [, setAccentVersion] = useState(0);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            setPage$.subscribe(setPageState),
            addPanel$.subscribe(setAddPanelState),
            currentBottomBtn$.subscribe(setBtnState),
            sectionAccent$.subscribe(() => setAccentVersion(version => version + 1))
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    // Sync button state for specific sub-pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'MentalRecords') setCurrentBottomBtn(1);
            else if (page === 'MentalInsight') setCurrentBottomBtn(2);
            else if (page === 'MentalProgress') setCurrentBottomBtn(3);
            else if (page === 'MentalMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle()}>
            <div style={glassOverlay(theme)} />

            {/* Back / Home Button */}
            <NavButton 
                id={0}
                current={currentBtn}
                icon={page === 'MentalMain' && addPanel === '' ? <Home /> : <Back />}
                onClick={() => {
                    onBack(page, addPanel);
                    setCurrentBottomBtn(0);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />

            <NavButton 
                id={1}
                current={currentBtn}
                icon={<FaMedal />}
                onClick={() => {
                    setCurrentBottomBtn(1);
                    setPage('MentalRecords');
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />

            <NavButton
                id={3}
                current={currentBtn}
                icon={<FaChartLine />}
                onClick={() => {
                    setCurrentBottomBtn(3);
                    setPage('MentalProgress');
                    setAddPanel('');
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />

            <NavButton
                id={2}
                current={currentBtn}
                icon={<AutoAwesome />}
                onClick={() => {
                    setCurrentBottomBtn(2);
                    setPage('MentalInsight');
                    setAddPanel('');
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />
        </div>
    );
};

// NavButton Component for micro-interactions
const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    const accent = buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT);
    return (
        <Motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={navBtnWrapper}
        >
            <div style={{
                width: 42,
                height: 42,
                borderRadius: 15,
                color: isActive ? accent.hue : Colors.get('icons', theme),
                background: 'transparent',
                border: '1px solid transparent',
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: isActive ? 'translateY(-4px) scale(1.05)' : 'translateY(0) scale(1)',
                transition: 'color 0.22s ease, transform 0.22s ease, filter 0.22s ease',
                filter: isActive ? `drop-shadow(0 0 9px ${accent.glow})` : 'none',
                willChange: 'transform',
                boxSizing: 'border-box'
            }}>
                {icon}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div 
                        layoutId="mentalActiveDot"
                        initial={{ opacity: 0, y: 4, scale: 0.45 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.45 }}
                        transition={{ type: 'spring', stiffness: 460, damping: 28, mass: 0.55 }}
                        style={activeIndicator()}
                    />
                )}
            </AnimatePresence>
        </Motion.div>
    );
};

// Shared Logic
async function onBack(page, addPanel) {
    if (page === 'MentalMain' && addPanel === '') {
        setPage('MainMenu');
        await saveData();
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('MentalMain');
    }
    playEffects(switchSound);
}

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
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '6px 12px 9px',
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
        : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(166,107,255,0.08)',
    zIndex: -1,
});

const navBtnWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '46px',
    width: '48px',
    borderRadius: '999px',
    cursor: 'pointer',
    WebkitTapHighlightColor: 'transparent'
};

const activeIndicator = () => ({
    position: 'absolute',
    bottom: 1,
    width: '7px',
    height: '7px',
    borderRadius: '999px',
    backgroundColor: buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT).hue,
    border: '1px solid rgba(255,255,255,0.42)',
    boxShadow: `0 0 12px ${buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT).glow}, 0 2px 8px rgba(0,0,0,0.42)`,
    transformOrigin: 'center',
});

export default BtnsMental;
