import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import { FaMedal } from 'react-icons/fa';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn, setNotifyPanel, notify$ 
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';

const switchSound = new Audio('Audio/Click.wav');
const MENTAL_ACCENT = '#8A7CD6';

const BtnsMental = () => {
    const [theme, setthemeState] = useState('dark');
    const [page, setPageState] = useState('');
    const [addPanel, setAddPanelState] = useState('');
    const [currentBtn, setBtnState] = useState(0);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            setPage$.subscribe(setPageState),
            addPanel$.subscribe(setAddPanelState),
            currentBottomBtn$.subscribe(setBtnState)
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    // Sync button state for specific sub-pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'MentalRecords') setCurrentBottomBtn(1);
            else if (page === 'MentalMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle(theme)}>
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

            {/* Records / Medal Button */}
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
        </div>
    );
};

// NavButton Component for micro-interactions
const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    return (
        <motion.div 
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={navBtnWrapper}
        >
            <div style={{
                width: 46,
                height: 46,
                borderRadius: 17,
                color: isActive ? MENTAL_ACCENT : Colors.get('icons', theme),
                background: isActive ? 'rgba(138,124,214,0.14)' : 'transparent',
                border: `1px solid ${isActive ? 'rgba(138,124,214,0.28)' : 'transparent'}`,
                fontSize: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'color 0.3s ease',
                filter: isActive ? `drop-shadow(0 0 10px rgba(138,124,214,0.32))` : 'none',
                boxSizing: 'border-box'
            }}>
                {icon}
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="mentalActiveTab"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        style={activeIndicator(theme)}
                    />
                )}
            </AnimatePresence>
        </motion.div>
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
const containerStyle = (theme) => ({
    position: 'fixed',
    bottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(70vw, 420px)',
    height: '74px',
    borderRadius: '30px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    zIndex: 1000,
    boxSizing: 'border-box',
    padding: '0 28px'
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    background: theme === 'dark'
        ? 'linear-gradient(145deg, rgba(20,23,27,0.9), rgba(15,18,21,0.84))'
        : 'rgba(255,255,255,0.86)',
    opacity: 1,
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.08)'}`,
    borderRadius: '30px',
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
    width: '60px',
    cursor: 'pointer'
};

const activeIndicator = (theme) => ({
    position: 'absolute',
    bottom: '7px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: MENTAL_ACCENT,
    boxShadow: `0 0 10px rgba(138,124,214,0.75)`
});

export default BtnsMental;
