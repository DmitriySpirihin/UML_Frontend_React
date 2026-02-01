import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Slider from '@mui/material/Slider';
import { 
    MdSentimentVeryDissatisfied,
    MdSentimentDissatisfied,
    MdSentimentNeutral,
    MdSentimentSatisfied,
    MdSentimentVerySatisfied,
    MdClose,
    MdCheck
} from 'react-icons/md';
import { FaMoon, FaBed, FaRegClock, FaPen } from 'react-icons/fa';

import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { addPanel$, theme$, lang$, fontSize$, setAddPanel } from '../../StaticClasses/HabitsBus';
import { addDayToSleepingLog } from './SleepHelper.js';

// --- CONSTANTS & HELPERS ---
const clickSound = new Audio('Audio/Click.wav');

const MOOD_ICONS = [
    MdSentimentVeryDissatisfied,
    MdSentimentDissatisfied,
    MdSentimentNeutral,
    MdSentimentSatisfied,
    MdSentimentVerySatisfied
];

const MIN_HOURS = 3;
const MAX_HOURS = 14;
const STEP_MINUTES = 10;
const MIN_MS = MIN_HOURS * 60 * 60 * 1000;
const MAX_MS = MAX_HOURS * 60 * 60 * 1000;
const STEP_MS = STEP_MINUTES * 60 * 1000;

const formatMsToHhMm = (ms) => {
    const totalMinutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const getMoodColor = (theme, index) => {
    const cols = [
        Colors.get('veryBad', theme),
            Colors.get('bad', theme),
            Colors.get('normal', theme), 
            Colors.get('good', theme), 
            Colors.get('perfect', theme), // Best
    ];
    return cols[index];
};

function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
        Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

function isNotFutureDate(dateString) {
    const givenDate = new Date(dateString);
    const today = new Date();
    givenDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return givenDate <= today;
}

// --- COMPONENT ---
const SleepNew = ({ dateString }) => {
    // State
    const [theme, setTheme] = useState(theme$.value);
    const [fSize, setFontSize] = useState(fontSize$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState, setAddPanelState] = useState(addPanel$.value);
    
    // Form Data
    const [mood, setMood] = useState(4); // 1-5
    const [duration, setDuration] = useState(8 * 60 * 60 * 1000); // 8 hours default
    const [bedTime, setBedTime] = useState(23 * 60 * 60 * 1000); // 23:00 default
    const [note, setNote] = useState('');

    // Subscriptions
    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = fontSize$.subscribe(setFontSize);
        const sub3 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const sub4 = addPanel$.subscribe(setAddPanelState);

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub4.unsubscribe();
        };
    }, []);

    // Validation Check on Mount/Update
    useEffect(() => {
        if (addPanelState === 'SleepNew' && !isNotFutureDate(dateString)) {
            setAddPanel('');
        }
    }, [addPanelState, dateString]);

    const handleSave = async () => {
        playEffects(clickSound);
        addDayToSleepingLog(dateString, duration, bedTime, mood, note);
        await saveData();
        setAddPanel('');
    };

    const isVisible = addPanelState === 'SleepNew';
    const isDark = theme === 'dark';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={styles(theme).backdrop}
                >
                    <motion.div
                        initial={{ y: "100%", opacity: 0, scale: 0.95 }}
                        animate={{ y: "0%", opacity: 1, scale: 1 }}
                        exit={{ y: "100%", opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={styles(theme).panel}
                    >
                        {/* --- Header --- */}
                        <div style={styles(theme).header}>
                            <div style={styles(theme).iconContainer}>
                                <FaMoon size={24} color="#fff" />
                                <div style={styles(theme).iconGlow} />
                            </div>
                            <div style={styles(theme).headerTextContainer}>
                                <h2 style={styles(theme, fSize).title}>
                                    {langIndex === 0 ? 'Сон' : 'Sleep Log'}
                                </h2>
                                <span style={styles(theme).dateBadge}>{dateString}</span>
                            </div>
                        </div>

                        {/* --- Scrollable Body --- */}
                        <div style={styles(theme).body}>
                            
                            {/* 1. Bedtime Section */}
                            <div style={{...styles(theme).sectionCard,height:'300px'}}>
                                <div style={styles(theme).labelRow}>
                                    <FaBed style={{ marginRight: 8, opacity: 0.7 }} />
                                    <span>{langIndex === 0 ? 'Время отбоя' : 'Bedtime'}</span>
                                </div>
                                <div style={styles(theme).heroValue}>
                                    {formatMsToHhMm(bedTime)}
                                </div>
                                <div style={{ padding: '0 10px' }}>
                                    <CustomSlider
                                        value={bedTime}
                                        onChange={setBedTime}
                                        min={0}
                                        max={24 * 60 * 60 * 1000 - 1} // 23:59
                                        theme={theme}
                                        accentColor={Colors.get('difficulty5', theme)}
                                    />
                                </div>
                            
                                <div style={styles(theme).labelRow}>
                                    <FaRegClock style={{ marginRight: 8, opacity: 0.7 }} />
                                    <span>{langIndex === 0 ? 'Длительность' : 'Duration'}</span>
                                </div>
                                <div style={styles(theme).heroValue}>
                                    {formatMsToHhMm(duration)}
                                </div>
                                <div style={{ padding: '0 10px' }}>
                                    <CustomSlider
                                        value={duration}
                                        onChange={setDuration}
                                        min={MIN_MS}
                                        max={MAX_MS}
                                        theme={theme}
                                        accentColor={Colors.get('difficulty', theme)}
                                    />
                                </div>
                            </div>

                            {/* 3. Mood Section */}
                            <div style={styles(theme).sectionCard}>
                                <div style={styles(theme).labelRow}>
                                    <span>{langIndex === 0 ? 'Самочувствие' : 'How do you feel?'}</span>
                                </div>
                                <div style={styles(theme).moodContainer}>
                                    {MOOD_ICONS.map((Icon, idx) => {
                                        const moodVal = idx + 1;
                                        const isSelected = mood === moodVal;
                                        const activeColor = getMoodColor(theme, idx);
                                        
                                        return (
                                            <motion.div
                                                key={idx}
                                                whileTap={{ scale: 0.8 }}
                                                animate={{ 
                                                    scale: isSelected ? 1.2 : 1,
                                                    opacity: isSelected ? 1 : 0.4
                                                }}
                                                onClick={() => {
                                                    playEffects(null);
                                                    setMood(moodVal);
                                                }}
                                                style={{
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Icon 
                                                    size={42} 
                                                    color={isSelected ? activeColor : Colors.get('subText', theme)} 
                                                    style={{ filter: isSelected ? `drop-shadow(0 0 8px ${activeColor})` : 'none' }}
                                                />
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* 4. Note Section */}
                            <div style={styles(theme).sectionCard}>
                                <div style={styles(theme).labelRow}>
                                    <FaPen style={{ marginRight: 8, opacity: 0.7 }} />
                                    <span>{langIndex === 0 ? 'Заметка' : 'Note'}</span>
                                </div>
                                <textarea 
                                 type="text" 
                                  placeholder={langIndex === 0 ? 'Сны, мысли...' : 'Dreams, thoughts...'}
                                  value={note}                                                   
                                  onChange={(e) => setNote(e.target.value)}
                                  style={{flex: 1, border: 'none', background: 'transparent',width:'80vw',height:'15vh', fontSize: '15px', color: Colors.get('mainText', theme),outline:'none'}}
                                 />
                            </div>

                            <div style={{ marginBottom: '180px' }} /> {/* Spacer */}
                        </div>

                        {/* --- Footer Actions --- */}
                        <div style={styles(theme).footer}>
                             <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setAddPanel('')}
                                style={styles(theme).cancelButton}
                             >
                                <MdClose size={34} color={Colors.get('mainText', theme)} />
                             </motion.button>

                             <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSave}
                                style={styles(theme).saveButton}
                             >
                                <MdCheck size={24} color="#fff" />
                                <span style={{ marginLeft: 8 }}>{langIndex === 0 ? 'Сохранить' : 'Save Sleep'}</span>
                             </motion.button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- HELPER COMPONENTS ---

const CustomSlider = ({ value, onChange, min, max, theme, accentColor }) => (
    <Slider
        value={value}
        onChange={(_, v) => onChange(v)}
        min={min}
        max={max}
        step={STEP_MS}
        sx={{
            color: accentColor,
            height: 6,
            '& .MuiSlider-thumb': {
                width: 24,
                height: 24,
                backgroundColor: Colors.get('simplePanel', theme),
                border: `2px solid ${accentColor}`,
                '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                    boxShadow: `0 0 0 8px ${accentColor}30`,
                },
            },
            '& .MuiSlider-track': {
                border: 'none',
            },
            '& .MuiSlider-rail': {
                opacity: 0.2,
                backgroundColor: Colors.get('subText', theme),
            },
        }}
    />
);

export default SleepNew;

// --- STYLES ---

const styles = (theme, fSize) => {
    const isDark = theme === 'dark';
    
    return {
        backdrop: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            zIndex: 2900,
            display: 'flex',
            alignItems: 'flex-end', // Align bottom for mobile sheet feel
            justifyContent: 'center',
        },
        panel: {
            width: '100%',
            maxWidth: '500px',
            height: '95vh',
            backgroundColor: isDark ? 'rgba(16, 16, 17, 0.91)' : '#ffffff',
            borderTopLeftRadius: '32px',
            borderTopRightRadius: '32px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
            overflow: 'hidden',
        },
        // Header
        header: {
            padding: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            borderBottom: `1px solid ${Colors.get('border', theme)}50`,
        },
        iconContainer: {
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            backgroundColor: '#3F51B5', // Sleep Blue
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 4px 12px rgba(63, 81, 181, 0.4)'
        },
        iconGlow: {
            position: 'absolute',
            inset: 0,
            borderRadius: '16px',
            background: 'inherit',
            filter: 'blur(10px)',
            opacity: 0.5,
            zIndex: -1
        },
        headerTextContainer: {
            display: 'flex',
            flexDirection: 'column',
        },
        title: {
            margin: 0,
            fontSize: fSize === 0 ? '22px' : '24px',
            fontWeight: '800',
            color: Colors.get('mainText', theme),
            fontFamily: 'Segoe UI, sans-serif'
        },
        dateBadge: {
            fontSize: '12px',
            color: Colors.get('subText', theme),
            marginTop: '2px',
            fontWeight: '500'
        },
        // Body
        body: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
        },
        sectionCard: {
            backgroundColor: Colors.get('simplePanel', theme),
            height:'196px',
            borderRadius: '20px',
            padding: '16px',
            border: `1px solid ${Colors.get('border', theme)}50`
        },
        labelRow: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: '600',
            color: Colors.get('subText', theme),
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px'
        },
        heroValue: {
            fontSize: '32px',
            fontWeight: '800',
            color: Colors.get('mainText', theme),
            textAlign: 'center',
            marginBottom: '4px',
            fontVariantNumeric: 'tabular-nums'
        },
        moodContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '10px 0'
        },
        // Footer
        footer: {
            padding: '20px 24px 30px 24px', // Extra bottom padding for iPhone home indicator
            borderTop: `1px solid ${Colors.get('border', theme)}50`,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: isDark ? 'rgba(16, 16, 17, 0.91)' : '#ffffff',
        },
        cancelButton: {
            width: '56px',
            height: '56px',
            borderRadius: '18px',
            border: 'none',
            backgroundColor: Colors.get('skipped', theme),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
        },
        saveButton: {
            flex: 1,
            height: '56px',
            borderRadius: '18px',
            border: 'none',
            background: Colors.get('done', theme),
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(63, 81, 181, 0.3)'
        }
    };
};