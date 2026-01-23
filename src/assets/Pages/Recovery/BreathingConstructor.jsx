import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { MdClose, MdDone, MdDeleteOutline } from 'react-icons/md';
import { FaMinus, FaPlus, FaWind, FaPause, FaBed, FaSyncAlt } from 'react-icons/fa';
import { useLongPress } from '../../Helpers/LongPress.js';

const BreathingConstructor = ({ theme, langIndex, fSize, setProtocol, show, setShow, showTimer }) => {
    // === STATE ===
    const [steps, setSteps] = useState([]);
    const [cycles, setCycles] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [inoutAmount, setInOutAmount] = useState(1);
    const [isProtocolComplete, setIsProtocolComplete] = useState(false);

    // === LOGIC (Preserved from original) ===
    function formProtocol() {
        const expandedSteps = [];
        steps.forEach(step => {
            const [typeLabel, value] = Object.entries(step)[0];
            const labelToKey = {
                'вдох': 'in', 'выдох': 'out', 'задержка': 'hold', 'отдых': 'rest',
                'inhale': 'in', 'exhale': 'out', 'hold': 'hold', 'rest': 'rest',
                'вдох/выдох': 'inout', 'inhale/exhale': 'inout'
            };
            const key = labelToKey[typeLabel] || 'rest';
            const duration = typeof value === 'object' ? value.duration : value;
            const amount = typeof value === 'object' ? value.amount || 1 : 1;
            const numDuration = Number(duration);
            const numAmount = Number(amount);

            if (key === 'inout') {
                for (let i = 0; i < numAmount; i++) {
                    expandedSteps.push({ in: numDuration });
                    expandedSteps.push({ out: numDuration });
                }
            } else {
                expandedSteps.push({ [key]: numDuration });
            }
        });

        const cleanSteps = expandedSteps.map(step => {
            const [k, v] = Object.entries(step)[0];
            return { [k]: typeof v === 'number' && !isNaN(v) ? v : 4000 };
        });

        const strategy = cleanSteps
            .map(s => (s.in ?? s.out ?? s.hold ?? s.rest) / 1000)
            .map(t => t.toFixed(1))
            .join(',');

        const newProtocol = {
            name: langIndex === 0 ? ['Своя сессия'] : ['Custom session'],
            aim: langIndex === 0 ? ['Фокус и расслабление'] : ['Focus and relaxation'],
            instructions: langIndex === 0 ? ['Дышите в ритме'] : ['Breathe with the rhythm'],
            levels: [{ cycles: Math.max(1, Number(cycles)), strategy, steps: cleanSteps }]
        };

        setProtocol(newProtocol);
        setIsProtocolComplete(true);
        setShow(false);
        showTimer(true);
    }

    function addStep(stepType) {
        const defaultDurations = [4000, 4000, 1500, 4000, 2000];
        const labelMap = [
            { 0: 'вдох', 1: 'выдох', 2: 'вдох/выдох', 3: 'задержка', 4: 'отдых' },
            { 0: 'inhale', 1: 'exhale', 2: 'inhale/exhale', 3: 'hold', 4: 'rest' }
        ];
        const label = labelMap[langIndex][stepType];

        let newStep;
        if (stepType === 2) { // in/out
            newStep = { [label]: { duration: defaultDurations[stepType], amount: 1 } };
        } else {
            newStep = { [label]: defaultDurations[stepType] };
        }
        setSteps(prev => [...prev, newStep]);
        setIsProtocolComplete(true);
    }

    function addTime(index, dir, field = 'duration') {
        setSteps(prev => {
            const newSteps = [...prev];
            const stepEntry = { ...newSteps[index] };
            const [type, value] = Object.entries(stepEntry)[0];
            let newValue;

            if (typeof value === 'object' && value !== null) {
                newValue = { ...value };
                const delta = dir === 'up' ? (field === 'duration' ? 500 : 1) : (field === 'duration' ? -500 : -1);
                let next = newValue[field] + delta;
                if (field === 'duration') next = Math.min(300000, Math.max(1000, next));
                else if (field === 'amount') next = Math.max(1, next);
                newValue[field] = next;
            } else {
                const delta = dir === 'up' ? 500 : -500;
                newValue = Math.min(300000, Math.max(1000, value + delta));
            }
            newSteps[index] = { [type]: newValue };
            return newSteps;
        });
    }

    function onDelete(index) {
        setSteps(prev => {
            const newSteps = [...prev];
            newSteps.splice(index, 1);
            return newSteps;
        });
        if (steps.length <= 1) setIsProtocolComplete(false);
    }

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
                            <h2 style={styles(theme).title}>{langIndex === 0 ? 'Конструктор' : 'Constructor'}</h2>
                            <div style={styles(theme).cycleControl}>
                                <span style={styles(theme).subLabel}>{langIndex === 0 ? 'Циклы' : 'Cycles'}</span>
                                <div style={styles(theme).stepperContainer}>
                                    <div onClick={() => setCycles(c => Math.max(1, c - 1))} style={styles(theme).stepperBtnSmall}>
                                        <FaMinus style={{color: Colors.get('icons', theme),fontSize:'15px'}} />
                                    </div>
                                    <span style={styles(theme).cycleValue}>{cycles}</span>
                                    <div onClick={() => setCycles(c => c + 1)} style={styles(theme).stepperBtnSmall}>
                                        <FaPlus style={{color: Colors.get('icons', theme),fontSize:'15px'}} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QUICK ADD BAR */}
                        <div style={styles(theme).toolBar}>
                            <StepChip theme={theme} label={langIndex === 0 ? 'Вдох' : 'Inhale'} color={'#00E5FF'} icon={<FaWind />} onClick={() => addStep(0)} />
                            <StepChip theme={theme} label={langIndex === 0 ? 'Выдох' : 'Exhale'} color={'#00E676'} icon={<FaWind style={{ transform: 'scaleX(-1)' }} />} onClick={() => addStep(1)} />
                            <StepChip theme={theme} label={langIndex === 0 ? 'Пауза' : 'Hold'} color={'#FFEA00'} icon={<FaPause />} onClick={() => addStep(3)} />
                            <StepChip theme={theme} label={langIndex === 0 ? 'Отдых' : 'Rest'} color={'#c7c7c7'} icon={<FaBed />} onClick={() => addStep(4)} />
                            <StepChip theme={theme} label={langIndex === 0 ? 'Ритм' : 'Rhythm'} color={'linear-gradient(135deg, #00E5FF 0%, #00E676 100%)' } icon={<FaSyncAlt />} onClick={() => addStep(2)} />
                        </div>

                        {/* LIST AREA */}
                        <div style={styles(theme).listContainer}>
                            {steps.length === 0 && (
                                <div style={styles(theme).emptyState}>
                                    {langIndex === 0 ? 'Добавьте шаги сверху' : 'Add breathing steps above'}
                                </div>
                            )}
                            <AnimatePresence>
                                {steps.map((step, index) => (
                                    <StepItem
                                        key={index} // Ideally use a unique ID, but index is safe if only appending/deleting
                                        index={index}
                                        step={step}
                                        theme={theme}
                                        fSize={fSize}
                                        onDelete={onDelete}
                                        addTime={addTime}
                                        langIndex={langIndex}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* FOOTER ACTIONS */}
                        <div style={styles(theme).footer}>
                            <div onClick={() => setShow(false)} style={styles(theme).secondaryBtn}>
                                <MdClose size={24} />
                            </div>
                            <button
                                onClick={() => isProtocolComplete && formProtocol()}
                                style={{
                                    ...styles(theme).primaryBtn,
                                    opacity: isProtocolComplete ? 1 : 0.5,
                                    cursor: isProtocolComplete ? 'pointer' : 'not-allowed'
                                }}
                            >
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

const StepChip = ({ theme, label, color, icon, onClick }) => (
    <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        style={{
            ...styles(theme).chip,
            background: color, // 20% opacity
            color: '#0f0f0f',
            
        }}
    >
        <span style={{ fontSize: '12px', marginRight: 6 }}>{icon}</span>
        {label}
    </motion.button>
);

const StepItem = ({ index, step, theme, onDelete, addTime, langIndex }) => {
    const [type, value] = Object.entries(step)[0];
    const isInOut = type.includes('вдох/выдох') || type.includes('inhale/exhale');

    // Hooks for long press
    const incBindDuration = useLongPress(() => addTime(index, 'up', 'duration'));
    const decBindDuration = useLongPress(() => addTime(index, 'down', 'duration'));
    const incBindAmount = useLongPress(() => addTime(index, 'up', 'amount'));
    const decBindAmount = useLongPress(() => addTime(index, 'down', 'amount'));

    // Determine color based on type keyword
    let accentColor = Colors.get('mainText', theme);
    if (type.includes('вдох') || type.includes('inhale')) accentColor = Colors.get('in', theme);
    if (type.includes('выдох') || type.includes('exhale')) accentColor = Colors.get('out', theme);
    if (type.includes('задержка') || type.includes('hold')) accentColor = Colors.get('hold', theme);
    if (type.includes('отдых') || type.includes('rest')) accentColor = Colors.get('rest', theme);
    if (isInOut) accentColor = Colors.get('reload', theme);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            style={{ ...styles(theme).stepCard, borderLeft: `4px solid ${accentColor}` }}
        >
            <div style={styles(theme).stepHeader}>
                <span style={{ fontWeight: '600', color: accentColor, textTransform: 'capitalize' }}>{type}</span>
                <button onClick={() => onDelete(index)} style={styles(theme).iconBtn}>
                    <MdDeleteOutline color={Colors.get('subText', theme)} size={20} />
                </button>
            </div>

            <div style={styles(theme).stepControls}>
                {/* Duration Control */}
                <div style={styles(theme).controlGroup}>
                    <span style={styles(theme).controlLabel}>{langIndex === 0 ? 'Время' : 'Time'}</span>
                    <div style={styles(theme).stepper}>
                        <div {...decBindDuration} onClick={() => addTime(index, 'down', 'duration')} style={styles(theme).stepperBtn}>
                            <FaMinus size={10} />
                        </div>
                        <span style={styles(theme).stepperValue}>
                            {isInOut ? (value.duration / 1000).toFixed(1) : (value / 1000).toFixed(1)}s
                        </span>
                        <div {...incBindDuration} onClick={() => addTime(index, 'up', 'duration')} style={styles(theme).stepperBtn}>
                            <FaPlus size={10} />
                        </div>
                    </div>
                </div>

                {/* Amount Control (Only for In/Out) */}
                {isInOut && (
                    <div style={styles(theme).controlGroup}>
                        <span style={styles(theme).controlLabel}>{langIndex === 0 ? 'Раз' : 'Reps'}</span>
                        <div style={styles(theme).stepper}>
                            <div {...decBindAmount} onClick={() => addTime(index, 'down', 'amount')} style={styles(theme).stepperBtn}>
                                <FaMinus size={10} />
                            </div>
                            <span style={styles(theme).stepperValue}>x{value.amount}</span>
                            <div {...incBindAmount} onClick={() => addTime(index, 'up', 'amount')} style={styles(theme).stepperBtn}>
                                <FaPlus size={10} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BreathingConstructor;

// === STYLES ===
const styles = (theme) => ({
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.4)', // Lighter backdrop
        backdropFilter: 'blur(5px)',
        zIndex: 2900,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end', // Bottom sheet style
    },
    panel: {
        width: '100%',
        maxWidth: '500px',
        height: '85vh',
        backgroundColor: Colors.get('background', theme),
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.2)',
        overflow: 'hidden',
    },
    header: {
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${Colors.get('border', theme)}40`,
    },
    title: {
        margin: 0,
        fontSize: '20px',
        color: Colors.get('mainText', theme),
    },
    cycleControl: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    subLabel: {
        fontSize: '10px',
        color: Colors.get('subText', theme),
        marginBottom: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    stepperContainer: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: Colors.get('border', theme),
        borderRadius: '20px',
        padding: '2px',
    },
    stepperBtnSmall: {
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: 'none',
        margin:'8px',
        backgroundColor: Colors.get('simplePanel', theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
    },
    cycleValue: {
        margin: '0 10px',
        fontSize: '14px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
        minWidth: '16px',
        textAlign: 'center',
    },
    toolBar: {
        padding: '16px',
        display: 'flex',
        gap: '10px',
        overflowX: 'scroll',
        
        borderBottom: `1px solid ${Colors.get('border', theme)}20`,
    },
    chip: {
        flex: '0 0 auto',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        outline: 'none',
    },
    listContainer: {
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
    },
    emptyState: {
        textAlign: 'center',
        color: Colors.get('subText', theme),
        marginTop: '40px',
        opacity: 0.6,
        fontStyle: 'italic',
    },
    stepCard: {
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
    stepHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    stepControls: {
        display: 'flex',
        gap: '24px',
    },
    controlGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    controlLabel: {
        fontSize: '10px',
        color: Colors.get('subText', theme),
        marginLeft: '4px',
    },
    stepper: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: Colors.get('background', theme),
        borderRadius: '8px',
        padding: '4px',
        border: `1px solid ${Colors.get('border', theme)}40`,
    },
    stepperBtn: {
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: Colors.get('icons', theme),
        backgroundColor: Colors.get('backgroundLight', theme),
        userSelect: 'none',
        active: { opacity: 0.7 }
    },
    stepperValue: {
        minWidth: '50px',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '14px',
        color: Colors.get('mainText', theme),
    },
    iconBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4,
        opacity: 0.7,
        transition: 'opacity 0.2s',
    },
    footer: {
        padding: '20px',
        borderTop: `1px solid ${Colors.get('border', theme)}40`,
        display: 'flex',
        gap: '16px',
        backgroundColor: Colors.get('background', theme), // opaque background for footer
    },
    secondaryBtn: {
        width: '50px',
        height: '50px',
        borderRadius: '16px',
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
        height: '50px',
        borderRadius: '16px',
        border: 'none',
        backgroundColor: Colors.get('maxValColor', theme),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
});

