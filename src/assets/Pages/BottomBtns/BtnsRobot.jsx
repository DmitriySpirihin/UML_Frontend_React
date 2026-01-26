import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Add from '@mui/icons-material/AddRounded';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setCurrentBottomBtn 
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData';
import { saveData } from '../../StaticClasses/SaveHelper';

const switchSound = new Audio('Audio/Click.wav');

const BtnsRobot = () => {
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

    // Logic to sync button state with Robot pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'RobotMetrics') setCurrentBottomBtn(1);
            else if (page === 'RobotMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />
            
            <NavButton 
                id={0}
                current={currentBtn}
                icon={<Home /> }
                onClick={() => {
                    onBack(page, addPanel);
                    setCurrentBottomBtn(0);
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

const AddButton = ({ disabled, onClick, theme, active }) => (
    <motion.div
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={onClick}
        style={{
            ...addBtnStyle(theme),
            opacity: disabled ? 0.5 : 1,
            background: active ? Colors.get('iconsHighlited', theme) : Colors.get('simplePanel', theme),
        }}
    >
        <Add style={{ fontSize: '30px', color: active ? '#fff' : Colors.get('icons', theme) }} />
    </motion.div>
);

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

function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound !== null) {
        sound.currentTime = 0;
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

// Styles
const containerStyle = (theme) => ({
    position: 'fixed',
    bottom: '15px',
    left: '5vw',
    width: '90vw',
    height: '70px',
    borderRadius: '25px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backdropFilter: 'blur(6px)',
    zIndex: 1000,
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.get('bottomPanel', theme),
    opacity: 0.85,
    backdropFilter: 'blur(15px)',
    WebkitBackdropFilter: 'blur(15px)',
    border: `1px solid ${Colors.get('border', theme)}`,
    borderRadius: '25px',
    zIndex: -1,
});

const navBtnWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '100%',
    width: '50px',
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

export default BtnsRobot;