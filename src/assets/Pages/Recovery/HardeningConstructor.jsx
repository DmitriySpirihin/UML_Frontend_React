import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { MdClose, MdDone } from 'react-icons/md';
import { FaMinus, FaPlus, FaFire, FaSnowflake, FaBed, FaSyncAlt } from 'react-icons/fa';
import { useLongPress } from '../../Helpers/LongPress.js';

const HardeningConstructor = ({ theme, langIndex, fSize, setProtocol, show, setShow, showTimer }) => {
    // === STATE ===
    const [hotSeconds, setHotSeconds] = useState(180);  // 3 min
    const [coldSeconds, setColdSeconds] = useState(30); // 30 sec
    const [restSeconds, setRestSeconds] = useState(0);  // no rest
    const [cycles, setCycles] = useState(1);

    // === LOGIC ===
    const updateValue = (setter, change, min = 0, max = 1800, step = 30) => {
        setter(prev => {
            const next = prev + change;
            return Math.min(max, Math.max(min, next));
        });
    };

    const formatTime = (seconds) => {
        if (seconds === 0) return langIndex === 0 ? '0 сек' : '0s';
        if (seconds < 60) return `${seconds} ${langIndex === 0 ? 'сек' : 's'}`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return secs > 0 
            ? `${mins} ${langIndex === 0 ? 'мин' : 'm'} ${secs}` 
            : `${mins} ${langIndex === 0 ? 'мин' : 'm'}`;
    };

    const formProtocol = () => {
        const parts = [];
        if (hotSeconds > 0) parts.push(`${formatTime(hotSeconds)} ${langIndex === 0 ? 'тепла' : 'warm'}`);
        if (coldSeconds > 0) parts.push(`${formatTime(coldSeconds)} ${langIndex === 0 ? 'холода' : 'cold'}`);
        const base = parts.join(' → ');
        
        let strategy = `${base}`;
        if (cycles > 1) strategy += ` (×${cycles})`;
        if (restSeconds > 0) strategy += ` + ${formatTime(restSeconds)} ${langIndex === 0 ? 'отдых' : 'rest'}`;

        const newProtocol = {
            name: langIndex === 0 ? ['Своя закалка'] : ['Custom Hardening'],
            aim: langIndex === 0 ? ['Иммунитет и тонус'] : ['Immunity and tone'],
            instructions: langIndex === 0
                ? ['Дышите спокойно.']
                : ['Breathe calmly.'],
            levels: [{
                cycles,
                strategy,
                steps: [{ hotSeconds, coldSeconds, restSeconds }]
            }]
        };

        setProtocol(newProtocol);
        setShow(false);
        showTimer(true);
    };

    // === ANIMATION VARIANTS ===
    const slideUp = {
        hidden: { y: '100%', opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { y: '100%', opacity: 0 }
    };

    return (
        <AnimatePresence>
            {show && (
                <div style={styles(theme).overlay}>
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={slideUp}
                        style={styles(theme).panel}
                    >
                        {/* HEADER */}
                        <div style={styles(theme).header}>
                            <h2 style={styles(theme).title}>
                                {langIndex === 0 ? 'Конструктор' : 'Constructor'}
                            </h2>
                            <div style={{ width: 40 }} /> {/* Spacer */}
                        </div>

                        {/* CONTENT */}
                        <div style={styles(theme).listContainer}>
                            
                            {/* Hot Water */}
                            <SettingRow 
                                theme={theme}
                                label={langIndex === 0 ? 'Тёплая вода' : 'Warm Water'}
                                value={formatTime(hotSeconds)}
                                icon={<FaFire />}
                                color="difficulty5" // Usually Red/Orange
                                onDec={() => updateValue(setHotSeconds, -30, 0, 600)}
                                onInc={() => updateValue(setHotSeconds, 30, 0, 600)}
                            />

                            {/* Cold Water */}
                            <SettingRow 
                                theme={theme}
                                label={langIndex === 0 ? 'Холодная вода' : 'Cold Water'}
                                value={formatTime(coldSeconds)}
                                icon={<FaSnowflake />}
                                color="difficulty" // Usually Blue/Cyan
                                onDec={() => updateValue(setColdSeconds, -10, 0, 300, 10)}
                                onInc={() => updateValue(setColdSeconds, 10, 0, 300, 10)}
                            />

                            {/* Rest */}
                            <SettingRow 
                                theme={theme}
                                label={langIndex === 0 ? 'Отдых / Согрев' : 'Rest / Warm-up'}
                                value={formatTime(restSeconds)}
                                icon={<FaBed />}
                                color="difficulty2" // Usually Green/Grey
                                onDec={() => updateValue(setRestSeconds, -30, 0, 600)}
                                onInc={() => updateValue(setRestSeconds, 30, 0, 600)}
                            />

                            {/* Cycles */}
                            <SettingRow 
                                theme={theme}
                                label={langIndex === 0 ? 'Циклы' : 'Cycles'}
                                value={cycles}
                                icon={<FaSyncAlt />}
                                color="subText" // Usually Yellow/Orange
                                onDec={() => updateValue(setCycles, -1, 1, 10)}
                                onInc={() => updateValue(setCycles, 1, 1, 10)}
                                isCycle={true}
                            />

                        </div>

                        {/* FOOTER */}
                        <div style={styles(theme).footer}>
                            <div onClick={() => setShow(false)} style={styles(theme).secondaryBtn}>
                                                            <MdClose size={24} />
                                                        </div>
                            <button onClick={formProtocol} style={styles(theme).primaryBtn}>
                                <MdDone size={24} />
                                <span style={{ marginLeft: 8 }}>{langIndex === 0 ? 'Готово' : 'Done'}</span>
                            </button>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// === SUB-COMPONENTS ===

const SettingRow = ({ theme, label, value, icon, color, onDec, onInc, isCycle }) => {
    const accentColor = Colors.get(color, theme);
    
    // Bind long press for rapid changes
    const bindInc = useLongPress(onInc, 500);
    const bindDec = useLongPress(onDec, 500);

    return (
        <div style={{ ...styles(theme).card, borderLeft: `4px solid ${accentColor}` }}>
            <div style={styles(theme).cardHeader}>
                <div style={{ ...styles(theme).iconBox, color: accentColor, backgroundColor: accentColor + '20' }}>
                    {icon}
                </div>
                <span style={styles(theme).label}>{label}</span>
            </div>

            <div style={styles(theme).stepper}>
                <button 
                    {...bindDec} 
                    onClick={onDec} 
                    style={styles(theme).stepperBtn}
                >
                    <FaMinus size={12} />
                </button>
                
                <span style={styles(theme).stepperValue}>{value}</span>
                
                <button 
                    {...bindInc} 
                    onClick={onInc} 
                    style={styles(theme).stepperBtn}
                >
                    <FaPlus size={12} />
                </button>
            </div>
        </div>
    );
};

export default HardeningConstructor;

// === STYLES ===

const styles = (theme) => ({
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(5px)',
        zIndex: 2900,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    panel: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: Colors.get('background', theme),
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
        paddingBottom: '20px' // safe area
    },
    header: {
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${Colors.get('border', theme)}40`,
    },
    title: {
        margin: 0,
        fontSize: '20px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
    },
    listContainer: {
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflowY: 'auto',
    },
    card: {
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    iconBox: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
    },
    label: {
        fontSize: '16px',
        fontWeight: '600',
        color: Colors.get('mainText', theme),
    },
    stepper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: Colors.get('background', theme),
        borderRadius: '12px',
        padding: '4px',
        border: `1px solid ${Colors.get('border', theme)}40`,
    },
    stepperBtn: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: Colors.get('backgroundLight', theme),
        color: Colors.get('icons', theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s',
    },
    stepperValue: {
        minWidth: '70px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '15px',
        color: Colors.get('mainText', theme),
        userSelect: 'none',
    },
    footer: {
        padding: '20px 24px',
        borderTop: `1px solid ${Colors.get('border', theme)}40`,
        display: 'flex',
        gap: '16px',
        marginTop: 'auto',
    },
    secondaryBtn: {
        width: '56px',
        height: '56px',
        borderRadius: '18px',
        border: 'none',
        backgroundColor: Colors.get('skipped', theme),
                color: Colors.get('mainText', theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    primaryBtn: {
        flex: 1,
        height: '56px',
        borderRadius: '18px',
        border: 'none',
        backgroundColor: Colors.get('maxValColor', theme),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    },
});