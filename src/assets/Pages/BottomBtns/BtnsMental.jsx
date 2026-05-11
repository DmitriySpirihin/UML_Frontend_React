import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';
import { FaMedal } from 'react-icons/fa';

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
                width: 40,
                height: 40,
                borderRadius: 15,
                color: isActive ? accent.hue : Colors.get('icons', theme),
                background: isActive ? accent.soft : 'transparent',
                border: `1px solid ${isActive ? accent.ring : 'transparent'}`,
                fontSize: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.3s ease',
                filter: isActive ? `drop-shadow(0 0 10px ${accent.glow})` : 'none',
                boxSizing: 'border-box'
            }}>
                {icon}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div 
                        layoutId="mentalActiveTab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
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
    bottom: 'max(18px, calc(24px + env(safe-area-inset-bottom, 0px)))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: '420px',
    height: '66px',
    borderRadius: '999px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '10px 12px',
    overflow: 'hidden',
    boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: theme === 'dark'
        ? 'linear-gradient(145deg, rgba(20,23,27,0.9), rgba(15,18,21,0.84))'
        : 'rgba(255,255,255,0.86)',
    opacity: 1,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.08)'}`,
    borderRadius: '999px',
    boxShadow: theme === 'dark'
        ? '0 1px 0 rgba(255,255,255,0.045) inset, 0 18px 42px -32px rgba(0,0,0,0.86)'
        : '0 14px 32px -26px rgba(0,0,0,0.2)',
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

const activeIndicator = () => ({
    position: 'absolute',
    bottom: '4px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT).hue,
    boxShadow: `0 0 10px ${buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT).glow}`
});

export default BtnsMental;
