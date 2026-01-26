import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog,FaUserAlt,FaMoon,FaSun } from 'react-icons/fa';
import { 
    setTheme as setGlobalTheme, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$,  setNotifyPanel,
} from '../../StaticClasses/HabitsBus';
import Colors , { THEME } from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData';

const switchSound = new Audio('Audio/Click.wav');

const BtnsMenu = () => {
    const [theme, setthemeState] = useState('dark');
    const [page, setPageState] = useState('');
    const [addPanel, setAddPanelState] = useState('');


    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            setPage$.subscribe(setPageState),
            addPanel$.subscribe(setAddPanelState),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);


    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />

            

            {/* Records / Medal Button */}
            <NavButton 
                id={1}
                current={55}
                icon={theme === 'dark' ? <FaSun /> : <FaMoon />}
                onClick={() => {
                   
                    toggleTheme();
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />
            {/* Back / Home Button */}
            <NavButton 
                id={0}
                current={55}
                icon={<FaUserAlt />}
                onClick={() => {
                    setAddPanel('UserPanel');
                 
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />
            {/* Back / Home Button */}
            <NavButton 
                id={0}
                current={55}
                icon={ <FaCog/>}
                onClick={() => {
                   setAddPanel('settings');
                
                    playEffects(switchSound);
                    setNotifyPanel(false);
                }}
                theme={theme}
            />
        </div>
    );
};
const toggleTheme = () => {
    let next; let themeNum = 0;
    if (Colors.theme === THEME.DARK) { themeNum = 1; next = THEME.LIGHT; }
    else { themeNum = 0; next = THEME.DARK; }
    AppData.setPrefs(1, themeNum); Colors.setTheme(next); setGlobalTheme(next);
}

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
                color: isActive ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
                fontSize: '26px',
                display: 'flex',
                transition: 'color 0.3s ease',
                filter: isActive ? `drop-shadow(0 0 8px ${Colors.get('iconsHighlited', theme)}66)` : 'none'
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


function playEffects(sound) {
    if (AppData.prefs[2] == 0 && sound !== null) {
        sound.currentTime = 0;
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

;

// Styles
const containerStyle = (theme) => ({
    position: 'fixed',
    bottom: '15px',
    left: '15vw', // Narrower because there are fewer buttons
    width: '70vw',
    height: '65px',
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
    width: '60px',
    cursor: 'pointer'
};

const activeIndicator = (theme) => ({
    position: 'absolute',
    bottom: '6px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: Colors.get('iconsHighlited', theme),
    boxShadow: `0 0 8px ${Colors.get('iconsHighlited', theme)}`
});

export default BtnsMenu;