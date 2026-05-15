import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Metrics from '@mui/icons-material/BarChartRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';

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
const RECOVERY_ACCENT = '#2FD6BD';

const BtnsRecovery = () => {
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

    // Sync button state for Recovery pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'RecoveryAnalitics') setCurrentBottomBtn(1);
            else if (page === 'RecoveryInsight') setCurrentBottomBtn(2);
            else if (page === 'RecoveryMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle()}>
            <div style={glassOverlay(theme)} />

            <NavButton 
                id={0}
                current={currentBtn}
                icon={page === 'RecoveryMain' && addPanel === '' ? <Home /> : <Back />}
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
                icon={<Metrics />}
                onClick={() => {
                    setCurrentBottomBtn(1);
                    setPage('RecoveryAnalitics');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <NavButton
                id={2}
                current={currentBtn}
                icon={<AutoAwesome />}
                onClick={() => {
                    setCurrentBottomBtn(2);
                    setPage('RecoveryInsight');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />
        </div>
    );
};

const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    const accent = buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT);
    return (
        <Motion.div whileTap={{ scale: 0.9 }} onClick={onClick} style={navBtnWrapper}>
            <div style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                color: isActive ? accent.hue : Colors.get('icons', theme),
                background: 'transparent',
                border: '1px solid transparent',
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.3s ease, background 0.3s ease, border-color 0.3s ease',
                filter: 'none',
                boxSizing: 'border-box'
            }}>
                {React.cloneElement(icon, { fontSize: 'inherit' })}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div 
                        layoutId="recoveryActiveTab"
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

async function onBack(page, addPanel) {
    if (page === 'RecoveryMain' && addPanel === '') {
        setPage('MainMenu');
        await saveData();
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('RecoveryMain');
    }
    playEffects(switchSound);
}

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
    padding: '7px 10px',
    overflow: 'hidden'
});

const glassOverlay = (theme) => ({
    '--accent-ring': buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT).ring,
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
        : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(47,214,189,0.08)',
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

const activeIndicator = () => ({
    position: 'absolute',
    bottom: '4px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT).hue,
    boxShadow: `0 0 10px ${buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT).glow}`
});

export default BtnsRecovery;
