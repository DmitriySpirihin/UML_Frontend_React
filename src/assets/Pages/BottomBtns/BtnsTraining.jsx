import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Metrics from '@mui/icons-material/BarChartRounded';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeightRounded';
import Exercises from '@mui/icons-material/FitnessCenterRounded';
import Programs from '@mui/icons-material/MenuBookRounded';
import FaBell from '@mui/icons-material/NotificationsRounded';
import Add from '@mui/icons-material/AddRounded';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setAddNewTrainingDay, setCurrentBottomBtn, 
    setNotifyPanel, notify$ 
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData';
import { saveData } from '../../StaticClasses/SaveHelper';

const switchSound = new Audio('Audio/Click.wav');

const BtnsTraining = () => {
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

    // Sync button state with Training sub-pages
    useEffect(() => {
        if (currentBtn === 0 || currentBtn === -1) {
            if (page === 'TrainingExercise') setCurrentBottomBtn(2);
            else if (page === 'TrainingAnaliticsTypes') setCurrentBottomBtn(1);
            else if (page === 'TrainingProgramm') setCurrentBottomBtn(4);
            else if (page === 'TrainingMesurments') setCurrentBottomBtn(3);
            else if (page === 'TrainingMain' && addPanel === '') setCurrentBottomBtn(0);
        }
    }, [page, addPanel]);

    return (
        <div style={containerStyle(theme)}>
            <div style={glassOverlay(theme)} />

            <NavButton 
                id={0}
                current={currentBtn}
                icon={page === 'TrainingMain' && addPanel === '' ? <Home /> : <Back />}
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
                    setPage('TrainingAnaliticsTypes');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <NavButton 
                id={4}
                current={currentBtn}
                icon={<Programs />}
                onClick={() => {
                    setCurrentBottomBtn(4);
                    setPage('TrainingProgramm');
                    setAddPanel('');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            {/* Main Action Button */}
            <AddButton 
                active={false}
                disabled={page !== 'TrainingMain'}
                onClick={() => {
                    setAddNewTrainingDay();
                    setCurrentBottomBtn(0);
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <NavButton 
                id={2}
                current={currentBtn}
                icon={<Exercises />}
                onClick={() => {
                    setCurrentBottomBtn(2);
                    setPage('TrainingExercise');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <NavButton 
                id={3}
                current={currentBtn}
                icon={<MonitorWeightIcon />}
                onClick={() => {
                    setCurrentBottomBtn(3);
                    setPage('TrainingMesurments');
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            {page.startsWith('T') && (
                <NavButton 
                    id={5}
                    current={currentBtn}
                    icon={<FaBell />}
                    onClick={() => {
                        setCurrentBottomBtn(5);
                        setNotifyPanel(true);
                        setAddPanel('');
                        playEffects(switchSound);
                    }}
                    theme={theme}
                />
            )}
        </div>
    );
};

const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    return (
        <motion.div whileTap={{ scale: 0.9 }} onClick={onClick} style={navBtnWrapper}>
            <div style={{
                color: isActive ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
                fontSize: '24px',
                display: 'flex',
                transition: 'color 0.3s ease'
            }}>
                {React.cloneElement(icon, { fontSize: 'inherit' })}
            </div>
            <AnimatePresence>
                {isActive && (
                    <motion.div 
                        layoutId="trainActiveTab"
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

const AddButton = ({ disabled, onClick, theme }) => (
    <motion.div
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={onClick}
        style={{
            ...addBtnStyle(theme),
            opacity: disabled ? 0.6 : 1,
            background: Colors.get('simplePanel', theme),
        }}
    >
        <Add style={{ fontSize: '28px', color: Colors.get('icons', theme) }} />
    </motion.div>
);

async function onBack(page, addPanel) {
    if (page === 'TrainingMain' && addPanel === '') {
        setPage('MainMenu');
        await saveData();
    } else {
        if (addPanel !== '') setAddPanel('');
        else setPage('TrainingMain');
    }
    playEffects(switchSound);
}

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

const containerStyle = (theme) => ({
    position: 'fixed',
    bottom: '7vw',
    left: '2.5vw',
    width: '95vw',
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
    flex: 1,
    cursor: 'pointer'
};

const activeIndicator = (theme) => ({
    position: 'absolute',
    bottom: '8px',
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    backgroundColor: Colors.get('iconsHighlited', theme),
    boxShadow: `0 0 10px ${Colors.get('iconsHighlited', theme)}`
});

const addBtnStyle = (theme) => ({
    width: '46px',
    height: '46px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 4px 15px ${Colors.get('shadow', theme)}`,
});

export default BtnsTraining;