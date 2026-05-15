import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
// Icons
import Home from '@mui/icons-material/HomeRounded';
import Back from '@mui/icons-material/ArrowBackIosNewRounded';
import Metrics from '@mui/icons-material/BarChartRounded';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeightRounded';
import Exercises from '@mui/icons-material/FitnessCenterRounded';
import Programs from '@mui/icons-material/MenuBookRounded';
import AutoAwesome from '@mui/icons-material/AutoAwesomeRounded';
import Add from '@mui/icons-material/AddRounded';

import { 
    setPage, setAddPanel, setPage$, addPanel$, theme$, 
    currentBottomBtn$, setAddNewTrainingDay, setCurrentBottomBtn, 
    setNotifyPanel, sectionAccent$
} from '../../StaticClasses/HabitsBus';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper';
import { playEffects } from '../../StaticClasses/Effects';
import { AppData } from '../../StaticClasses/AppData.js';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

const switchSound = new Audio('Audio/Click.wav');
const TRAINING_ACCENT = '#579BC8';

const BtnsTraining = () => {
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

    // Sync button state with Training sub-pages
    useEffect(() => {
        if (page === 'TrainingExercise') setCurrentBottomBtn(2);
        else if (page === 'TrainingAnaliticsTypes') setCurrentBottomBtn(1);
        else if (page === 'TrainingProgramm') setCurrentBottomBtn(4);
        else if (page === 'TrainingMesurments') setCurrentBottomBtn(3);
        else if (page === 'TrainingInsight') setCurrentBottomBtn(5);
        else if (page === 'TrainingMain' && addPanel === '') setCurrentBottomBtn(0);
    }, [page, addPanel]);

    return (
        <div style={containerStyle()}>
            <div style={glassOverlay(theme)} />

            <div style={dockSide('left')}>
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
            </div>

            {/* Main Action Button */}
            <AddButton 
                active={page === 'TrainingMain' && addPanel === ''}
                onClick={() => {
                    openTrainingAddFlow(page);
                    setCurrentBottomBtn(0);
                    setNotifyPanel(false);
                    playEffects(switchSound);
                }}
                theme={theme}
            />

            <div style={dockSide('right')}>
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
                        icon={<AutoAwesome />}
                        onClick={() => {
                            setCurrentBottomBtn(5);
                            setPage('TrainingInsight');
                            setNotifyPanel(false);
                            setAddPanel('');
                            playEffects(switchSound);
                        }}
                        theme={theme}
                    />
                )}
            </div>
        </div>
    );
};

function openTrainingAddFlow(page) {
    if (page !== 'TrainingMain') {
        setPage('TrainingMain');
        window.setTimeout(() => setAddNewTrainingDay(), 80);
        return;
    }
    setAddNewTrainingDay();
}

const NavButton = ({ id, current, icon, onClick, theme }) => {
    const isActive = current === id;
    const accent = buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT);
    return (
        <Motion.div whileTap={{ scale: 0.9 }} onClick={onClick} style={navBtnWrapper}>
            <div style={{
                color: isActive ? accent.hue : Colors.get('icons', theme),
                fontSize: '24px',
                display: 'flex',
                transform: isActive ? 'translateY(-4px) scale(1.04)' : 'translateY(0) scale(1)',
                transition: 'color 0.22s ease, transform 0.22s ease, filter 0.22s ease',
                filter: isActive ? `drop-shadow(0 0 9px ${accent.glow})` : 'none',
                willChange: 'transform'
            }}>
                {React.cloneElement(icon, { fontSize: 'inherit' })}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div
                        layoutId="trainActiveDot"
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

const AddButton = ({ active, onClick, theme }) => {
    const accent = buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT);
    return (
    <div style={addBtnShell}>
        <Motion.div
            whileTap={{ scale: 0.9 }}
            onClick={onClick}
            style={{
                ...addBtnStyle(),
                background: active
                    ? `linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, 0.72))`
                    : Colors.get('simplePanel', theme),
                border: active ? `1px solid ${accent.ring}` : `1px solid ${Colors.get('border', theme)}`,
                boxShadow: active ? `0 12px 30px ${accent.glow}` : `0 4px 15px ${Colors.get('shadow', theme)}`,
            }}
        >
            <Add style={{ fontSize: '26px', color: active ? '#fff' : accent.hue }} />
        </Motion.div>
    </div>
    );
};

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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2200,
    boxSizing: 'border-box',
    padding: '6px 10px 9px',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    overflow: 'hidden',
    isolation: 'isolate',
    boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)'
});

const dockSide = (side) => ({
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    [side]: '12px',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
    gap: '4px',
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
        : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(53,194,255,0.08)',
    zIndex: -1,
});

const navBtnWrapper = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: '46px',
    width: '42px',
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
    backgroundColor: buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT).hue,
    border: '1px solid rgba(255,255,255,0.42)',
    boxShadow: `0 0 12px ${buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT).glow}, 0 2px 8px rgba(0,0,0,0.42)`,
    transformOrigin: 'center',
});

const addBtnShell = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    width: '42px',
    height: '42px',
};

const addBtnStyle = () => ({
    width: '42px',
    height: '42px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export default BtnsTraining;
