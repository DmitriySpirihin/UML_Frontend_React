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
const TRAINING_ACCENT = '#35C2FF';

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
                transition: 'color 0.3s ease'
            }}>
                {React.cloneElement(icon, { fontSize: 'inherit' })}
            </div>
            <AnimatePresence>
                {isActive && (
                    <Motion.div
                        layoutId="trainActiveTab"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
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
            <Add style={{ fontSize: '28px', color: active ? '#fff' : accent.hue }} />
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
    bottom: 'max(18px, calc(24px + env(safe-area-inset-bottom, 0px)))',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100vw - 40px)',
    maxWidth: '420px',
    height: '66px',
    borderRadius: '999px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2200,
    boxSizing: 'border-box',
    padding: '10px 12px',
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
    [side]: '16px',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: side === 'left' ? 'flex-start' : 'flex-end',
    gap: '4px',
});

const glassOverlay = (theme) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: Colors.get('bottomPanel', theme),
    opacity: 0.9,
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid ${Colors.get('border', theme)}`,
    borderRadius: '999px',
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
    backgroundColor: buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT).hue,
    boxShadow: `0 0 10px ${buildSectionAccent(AppData.trainingAccentColor || TRAINING_ACCENT, TRAINING_ACCENT).glow}`
});

const addBtnShell = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 2,
    width: '46px',
    height: '46px',
};

const addBtnStyle = () => ({
    width: '46px',
    height: '46px',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

export default BtnsTraining;
