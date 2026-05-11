import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Settings from '@mui/icons-material/SettingsRounded';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn, lastPage$
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';

const switchSound = new Audio('Audio/Click.wav');

const BtnsInfo = () => {
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

    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />
            
            <NavButton 
                id={0}
                current={-1}
                icon={<Back />}
                onClick={() => {
                    const prev = lastPage$.value;
                    setPage(prev && prev !== 'InfoPanel' ? prev : 'MainMenu');
                    setCurrentBottomBtn(0);
                }}
                theme={theme}
            />
            <NavButton 
                id={0}
                current={currentBtn}
                icon={<Home />}
                onClick={() => {
                    setPage('MainMenu');
                    setCurrentBottomBtn(0);
                }}
                theme={theme}
            />
            <NavButton 
                id={2}
                current={-1}
                icon={<Settings />}
                onClick={() => {
                    setPage('settings');
                    setCurrentBottomBtn(2);
                }}
                theme={theme}
            />

        </div>
    );
};

// Sub-components for cleaner code
const NavButton = ({ id, current, icon, onClick, theme, disabled = false }) => {
    const isActive = current === id;
    return (
        <motion.div 
            whileTap={!disabled ? { scale: 0.9 } : {}}
            onClick={onClick}
            style={{ ...navBtnWrapper, opacity: disabled ? 0.4 : 1 }}
        >
            <div style={{
                color: isActive ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
                fontSize: '26px',
                display: 'flex',
                transition: 'color 0.3s ease'
            }}>
                {React.isValidElement(icon) ? React.cloneElement(icon, { fontSize: 'inherit' }) : icon}
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="sleepActiveTab"
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

const onBack = async (page, addPanel) => {
    if (page === 'RobotMain' && addPanel === '') {
        await saveData();
        setPage('MainMenu');
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('RobotMain');
    }
    playEffects(switchSound);
};

// Styles
const containerStyle = (theme) => ({
    position: 'fixed',
    left: '50%',
    bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
    transform: 'translateX(-50%)',
    width: '230px',
    height: '64px',
    borderRadius: '999px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 14px',
    boxSizing: 'border-box',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    zIndex: 1000,
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
        : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76)',
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
    cursor: 'pointer'
};

const activeIndicator = (theme) => ({
    position: 'absolute',
    bottom: '8px',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: Colors.get('iconsHighlited', theme),
    boxShadow: `0 0 10px ${Colors.get('iconsHighlited', theme)}`
});

const addBtnStyle = (theme) => ({
    width: '50px',
    height: '50px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 20px ${Colors.get('shadow', theme)}`,
    transition: 'background 0.3s ease',
});

export default BtnsInfo;
