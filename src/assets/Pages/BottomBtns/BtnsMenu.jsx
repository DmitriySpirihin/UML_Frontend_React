import React, { useState, useEffect } from 'react';
import { FaCog,FaUserAlt } from 'react-icons/fa';
import {
    setPage, theme$,
    setNotifyPanel,
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { playEffects } from '../../StaticClasses/Effects';

const switchSound = new Audio('Audio/Click.wav');

const BtnsMenu = () => {
    const [theme, setthemeState] = useState('dark');
    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);


    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />

            
            {/* Back / Home Button */}
            <NavButton 
                id={0}
                current={55}
                icon={<FaUserAlt />}
                onClick={() => {
                    setPage('UserPanel');

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
                   setPage('settings');
                
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
        <div onClick={onClick} style={navBtnWrapper}>
            <div style={{
                color: isActive ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
                fontSize: '26px',
                display: 'flex',
                transition: 'color 0.3s ease',
                filter: isActive ? `drop-shadow(0 0 8px ${Colors.get('iconsHighlited', theme)}66)` : 'none'
            }}>
                {icon}
            </div>
            {isActive && <div style={activeIndicator(theme)} />}
        </div>
    );
};


;

// Styles
const containerStyle = () => ({
    position: 'fixed',
    bottom: '7vw',
    left: '22vw',
    width: '56vw',
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
    background: theme === 'light' || theme === 'speciallight'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))'
        : 'linear-gradient(135deg, rgba(19,29,36,0.64), rgba(8,13,17,0.50))',
    backdropFilter: 'blur(30px) saturate(190%)',
    WebkitBackdropFilter: 'blur(30px) saturate(190%)',
    border: `1px solid ${theme === 'light' || theme === 'speciallight' ? 'rgba(148,163,184,0.28)' : 'rgba(190,220,235,0.14)'}`,
    borderRadius: '25px',
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
