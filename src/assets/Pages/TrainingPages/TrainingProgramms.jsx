import React, { useState, useEffect, useMemo } from 'react'
import { motion as Motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$, lang$, fontSize$, addPanel$ } from '../../StaticClasses/HabitsBus.js'
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io'
import {
    addDayToProgram, removeDayFromProgram, MuscleView, addProgram, redactProgram, removeProgram,
    addExerciseToSchedule, removeExerciseFromSchedule,switchPosition
} from '../../Classes/TrainingData.jsx'
import { FaCalendarDay, FaPlusSquare, FaTrash, FaPencilAlt, FaPlus, FaDumbbell,FaChevronUp } from 'react-icons/fa';
import { MdBook, MdDone, MdClose } from 'react-icons/md'
import TrainingExercise from './TrainingExercise.jsx'
import ScrollPicker from '../../Helpers/ScrollPicker.jsx' // Imported Component
import {
    getTrainingAccent,
    getTrainingPageBackground,
    getTrainingPanelBackground,
    getTrainingPanelBorder,
    getTrainingPanelShadow,
    getTrainingGlassSurface,
    getTrainingPressMotion
} from './TrainingVisuals.js'

// --- HELPER ---
const generateRange = (start, end) => {
    const arr = [];
    for (let i = start; i <= end; i++) {
        arr.push(i);
    }
    return arr;
};

// --- MAIN COMPONENT ---
const TrainingProgramm = () => {
    // --- STATE ---
    const [programs, setPrograms] = useState(AppData.programs);
    const updatePrograms = () => { setPrograms({ ...AppData.programs }); };

    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    const [showAddPanel, setShowAddPanel] = useState(false);
    const [needRedact, setNeedRedact] = useState(false);
    const [currentId, setCurrentId] = useState(-1);
    const [currentDay, setCurrentDay] = useState(-1);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    
    // Strategy State
    const [currentSet, setCurrentSet] = useState(3);
    const [currentRepMin, setCurrentRepMin] = useState(8);
    const [currentRepMax, setCurrentRepMax] = useState(12);
    const [strategy, setStrategy] = useState(0); // 0: Reps, 1: Time
    const [currentExId, setCurrentExId] = useState(0);
    
    // Picker Data
    const setsList = useMemo(() => generateRange(1, 20), []);
    const repsList = useMemo(() => generateRange(1, 100), []);
    
    // Day State
    const [, setDayIndex] = useState(1);
    const [dayName, setDayName] = useState(langIndex === 0 ? 'День 1' : 'Day 1');

    // Modals
    const [showAddDayPanel, setShowAddDayPanel] = useState(false);
    const [showExercisesList, setShowExercisesList] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showStarategyPanel, setShowStarategyPanel] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [currentType, setCurrentType] = useState(0);

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        setCurrentRepMax(prev => currentRepMin > prev ? currentRepMin : prev);
    }, [currentRepMin]);
    
    useEffect(() => {
         setCurrentRepMin(prev => currentRepMax < prev ? currentRepMax : prev);
    }, [currentRepMax])

    useEffect(() => {
        const s1 = theme$.subscribe(setthemeState);
        const s2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const s3 = addPanel$.subscribe(v => setShowAddPanel(v === 'AddProgrammPanel'));
        const s4 = fontSize$.subscribe(setFSize);
        return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); s4.unsubscribe(); }
    }, []);

    useEffect(() => {
        if (currentId === -1) return;
        const program = programs[currentId];
        if (!program) return;
        const daysCount = program.schedule.length;
        setDayIndex(daysCount);
        setDayName(langIndex === 0 ? `День ${daysCount + 1}` : `Day ${daysCount + 1}`);
    }, [currentId, langIndex, programs]);

    // --- ACTIONS ---
    const onClose = () => {
        updatePrograms();
        setNeedRedact(false);
        setShowAddDayPanel(false);
        setShowConfirmRemove(false);
    };

    const onAddProgram = () => {
        addProgram(capitalizeName(name), capitalizeName(description));
        setName(''); setDescription(''); onClose(); setShowAddPanel(false);
    };

    const redact = () => {
          redactProgram(currentId, capitalizeName(name), capitalizeName(description)); 
          setName(''); setDescription(''); onClose(); setShowAddPanel(false);
    }

    const onAddTrainingDay = () => {
        addDayToProgram(currentId, capitalizeName(dayName));
        setDayIndex(prev => prev + 1);
        onClose();
    };

    const onAddExercise = () => {
        let currentStrategy = langIndex === 0 ? 'время' : 'time';
        if (strategy === 0) currentStrategy = currentSet + 'x' + currentRepMin + '-' + currentRepMax;
        addExerciseToSchedule(currentId, currentDay, currentExId, currentStrategy);
        setShowStarategyPanel(false);
        updatePrograms();
    };

    const onRemove = (type) => {
        setCurrentType(type);
        let msg = '';
        if (type === 0) {
            const n = programs[currentId].name;
            msg = langIndex === 0 ? `Удалить программу "${Array.isArray(n) ? n[langIndex] : n}"?` : `Delete program "${Array.isArray(n) ? n[langIndex] : n}"?`;
        } else if (type === 1) {
            const dn = programs[currentId]?.schedule[currentDay]?.name;
            msg = langIndex === 0 ? `Удалить день "${dn[langIndex]}"?` : `Delete day "${dn[langIndex]}"?`;
        } else {
            const exId = programs[currentId].schedule[currentDay]?.exercises[currentExId]?.exId;
            removeExerciseFromSchedule(currentId, currentDay, exId);
            updatePrograms();
            return;
        }
        setConfirmMessage(msg);
        setShowConfirmRemove(true);
    };

    const remove = () => {
        if (currentType === 0) { removeProgram(currentId); setCurrentId(-1); }
        else { removeDayFromProgram(currentId, currentDay); setCurrentDay(-1); }
        onClose();
    };

    const onRedactClick = (type) => {
        setNeedRedact(true);
        setCurrentType(type);
        if (type === 0) {
            const p = programs[currentId];
            setName(Array.isArray(p.name) ? p.name[langIndex] : p.name);
            setDescription(Array.isArray(p.description) ? p.description[langIndex] : p.description);
            setShowAddPanel(true);
        } else {
            const raw = programs[currentId].schedule[currentDay].name;
            setDayName(Array.isArray(raw) ? raw[langIndex] : raw);
            setShowAddDayPanel(true);
        }
    };

    

    // --- ANIMATION VARIANTS ---
    const accordionVariants = {
        collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
        expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
    };

    return (
        <div style={styles(theme).container}>
            <LayoutGroup>
                <div style={{ width: '100%', maxWidth: '600px', paddingBottom: '80px' }}>
                    {Object.entries(programs)
                        .map(([idStr, program]) => ({ id: Number(idStr), ...program }))
                        .filter(p => p.show)
                        .sort((a, b) => a.id - b.id)
                        .map((program) => {
                            const isExpanded = currentId === program.id;
                            
                            return (
                                <Motion.div
                                    key={program.id}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    {...getTrainingPressMotion(1, 0.988)}
                                    style={{
                                        ...styles(theme).card,
                                        ...getTrainingGlassSurface(theme, getTrainingAccent(), isExpanded),
                                        background: isExpanded
                                            ? `linear-gradient(145deg, rgba(${getTrainingAccent().rgb}, 0.04), rgba(${getTrainingAccent().rgb}, 0.015)), ${getTrainingPanelBackground(theme)}`
                                            : getTrainingPanelBackground(theme),
                                        border: `1px solid ${getTrainingPanelBorder(theme, getTrainingAccent(), isExpanded)}`,
                                        boxShadow: getTrainingPanelShadow(theme, getTrainingAccent(), isExpanded)
                                    }}
                                >
                                    {/* PROGRAM HEADER */}
                                    <Motion.div
                                        onClick={() => {
                                            setCurrentId(isExpanded ? -1 : program.id);
                                            setCurrentDay(-1);
                                        }}
                                        style={styles(theme).groupHeader}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <div style={styles(theme).programHeaderLayout}>
                                            <div style={styles(theme).iconBox}>
                                                <MdBook size={20} color={getTrainingAccent().hue} />
                                            </div>
                                            <div style={styles(theme).programHeaderContent}>
                                                <p style={{...styles(theme, false, false, fSize).text, ...styles(theme).programTitle}}>
                                                    {Array.isArray(program.name) ? program.name[langIndex] : program.name}
                                                </p>
                                                <div style={styles(theme).programMetaRow}>
                                                    <span style={styles(theme).badge}>
                                                        {program.schedule.length} {langIndex === 0 ? 'дней' : 'days'}
                                                    </span>
                                                    {!isExpanded && <span style={{ ...styles(theme).badge, opacity: 0.6 }}>{program.creationDate}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <Motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                            <IoIosArrowDown style={styles(theme).icon} />
                                        </Motion.div>
                                    </Motion.div>

                                    {/* PROGRAM DETAILS (ACCORDION) */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <Motion.div
                                                variants={accordionVariants}
                                                initial="collapsed"
                                                animate="expanded"
                                                exit="collapsed"
                                                style={{ borderTop: `1px solid ${Colors.get('border', theme)}` }}
                                            >
                                                <div style={{ padding: '20px' }}>
                                                    <p style={{ ...styles(theme, false, false, fSize).subtext, marginBottom: '20px' }}>
                                                        {Array.isArray(program.description) ? program.description[langIndex] : program.description}
                                                    </p>

                                                    {/* PROGRAM ACTIONS (If no day selected) */}
                                                    {currentDay === -1 && (
                                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '5px' }}>
                                                            <ActionButton icon={<FaPlusSquare />} label={langIndex === 0 ? 'День' : 'Day'} onClick={() => setShowAddDayPanel(true)} theme={theme} />
                                                            <ActionButton icon={<FaPencilAlt />} label={langIndex === 0 ? 'Правка' : 'Edit'} onClick={() => onRedactClick(0)} theme={theme} />
                                                            <ActionButton icon={<FaTrash />} label={langIndex === 0 ? 'Удалить' : 'Del'} onClick={() => onRemove(0)} theme={theme} isDanger />
                                                        </div>
                                                    )}

                                                    {/* SCHEDULE (DAYS) */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                        {program.schedule.map((day, dayIndex) => (
    <DayItem
        key={dayIndex}
        index={dayIndex}
        day={day}
        active={currentDay === dayIndex}
        onClick={() => setCurrentDay(currentDay === dayIndex ? -1 : dayIndex)}
        theme={theme}
        fSize={fSize}
        langIndex={langIndex}
        onAddEx={() => { setCurrentDay(dayIndex); setShowExercisesList(true); }}
        onRemove={() => { setCurrentDay(dayIndex); onRemove(1); }}
        onRemoveEx={(exIdx) => { setCurrentExId(exIdx); onRemove(2); }}
        // FIXED: Properly bound reordering handlers with program context
        onMoveDayUp={() => {
            if (dayIndex > 0) {
                switchPosition(program.id, 0, 1, dayIndex); // type=0 (day), switchType=1 (up)
                updatePrograms();
            }
        }}
        onMoveDayDown={() => {
            if (dayIndex < program.schedule.length - 1) {
                switchPosition(program.id, 0, 0, dayIndex); // switchType=0 (down)
                updatePrograms();
            }
        }}
        onMoveExerciseUp={(exIndex) => {
            if (exIndex > 0) {
                switchPosition(program.id, 1, 1, dayIndex, exIndex); // type=1 (exercise)
                updatePrograms();
            }
        }}
        onMoveExerciseDown={(exIndex) => {
            if (exIndex < day.exercises.length - 1) {
                switchPosition(program.id, 1, 0, dayIndex, exIndex);
                updatePrograms();
            }
        }}
    />
))}
                                                    </div>

                                                    {/* MUSCLE OVERVIEW */}
                                                    <div style={{ marginTop: '25px',justifyItems:'center', padding: '15px', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                                        <MuscleView programmId={program.id} theme={theme} langIndex={langIndex} programs={programs} />
                                                    </div>
                                                </div>
                                            </Motion.div>
                                        )}
                                    </AnimatePresence>
                                </Motion.div>
                            )
                        })}
                </div>
            </LayoutGroup>

            {/* FLOATING ADD BUTTON */}
            {currentId === -1 && (
                <Motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => { setNeedRedact(false); setShowAddPanel(true); }}
                    style={styles(theme).bigFab}
                >
                    <FaPlus size={24} color="#FFF" />
                </Motion.button>
            )}

            {/* --- MODALS --- */}
            <AnimatePresence>
                {/* 1. Add/Edit Program Modal */}
                {showAddPanel && (
                    <Modal onClose={() => setShowAddPanel(false)} theme={theme} title={langIndex === 0 ? (needRedact ? 'Редактировать' : 'Новая программа') : (needRedact ? 'Edit Program' : 'New Program')}>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input 
                                                type="text" 
                                                placeholder={langIndex === 0 ? 'Название' : 'Name'}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                style={styles(theme).modalInput}
                                            />
                            <input 
                                                type="text" 
                                                placeholder={langIndex === 0 ? 'Описание' : 'Description'}
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                style={styles(theme).modalInput}
                                            />

                           
                        </div>
                        <ModalActions onClose={() => setShowAddPanel(false)} onConfirm={() => needRedact ? redact() : onAddProgram()} theme={theme} />
                    </Modal>
                )}

                {/* 2. Add Training Day Modal */}
                {showAddDayPanel && (
                    <Modal onClose={() => setShowAddDayPanel(false)} theme={theme} title={langIndex === 0 ? 'Тренировочный день' : 'Training Day'}>
                        <input 
                                                type="text" 
                                                placeholder={langIndex === 0 ? 'Название дня' : 'Day Name'}
                                                value={dayName}
                                                onChange={(e) => setDayName(e.target.value)}
                                                style={styles(theme).modalInput}
                                            />
                        <ModalActions onClose={() => setShowAddDayPanel(false)} onConfirm={onAddTrainingDay} theme={theme} />
                    </Modal>
                )}

                {/* 3. Confirm Remove Modal */}
                {showConfirmRemove && (
                    <Modal onClose={() => setShowConfirmRemove(false)} theme={theme} title="⚠️">
                        <p style={{ ...styles(theme, false, false, fSize).text, textAlign: 'center', marginBottom: '25px' }}>{confirmMessage}</p>
                        <div style={{ display: 'flex', gap: '20px', width: '100%', justifyContent: 'center' }}>
                            <Motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConfirmRemove(false)} style={styles(theme).secondaryBtn}>{langIndex === 0 ? "Нет" : "Cancel"}</Motion.button>
                            <Motion.button whileTap={{ scale: 0.95 }} onClick={remove} style={styles(theme).dangerBtn}>{langIndex === 0 ? "Удалить" : "Delete"}</Motion.button>
                        </div>
                    </Modal>
                )}

                {/* 4. Strategy Modal (USING IMPORTED SCROLL PICKER) */}
                {showStarategyPanel && (
                    <Modal onClose={() => setShowStarategyPanel(false)} theme={theme} title={langIndex === 0 ? 'Стратегия' : 'Strategy'}>
                        <div style={styles(theme).segmentedControl}>
                            <div onClick={() => setStrategy(0)} style={{ ...styles(theme).segment, backgroundColor: strategy === 0 ? Colors.get('difficulty', theme) : 'transparent', color: strategy === 0 ? Colors.get('mainText', theme) : Colors.get('subText', theme), boxShadow: strategy === 0 ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
                                {langIndex === 0 ? 'Повторы' : 'Reps'}
                            </div>
                            <div onClick={() => setStrategy(1)} style={{ ...styles(theme).segment, backgroundColor: strategy === 1 ? Colors.get('difficulty', theme) : 'transparent', color: strategy === 1 ? Colors.get('mainText', theme) : Colors.get('subText', theme), boxShadow: strategy === 1 ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
                                {langIndex === 0 ? 'Время' : 'Time'}
                            </div>
                        </div>

                        {strategy === 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                                {/* Sets Picker */}
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>SETS</span>
                                    <ScrollPicker items={setsList} value={currentSet} onChange={setCurrentSet} theme={theme} width="60px" />
                                </div>
                                
                                <span style={{ fontSize: '20px', color: Colors.get('subText', theme), marginTop:'15px' }}>×</span>
                                
                                {/* Min Reps Picker */}
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>MIN</span>
                                    <ScrollPicker items={repsList} value={currentRepMin} onChange={setCurrentRepMin} theme={theme} width="60px" />
                                </div>
                                
                                <span style={{ fontSize: '20px', color: Colors.get('subText', theme), marginTop:'15px' }}>-</span>
                                
                                {/* Max Reps Picker */}
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={{fontSize:'10px', fontWeight:'bold', color:Colors.get('subText', theme), marginBottom:'5px'}}>MAX</span>
                                    <ScrollPicker items={repsList} value={currentRepMax} onChange={setCurrentRepMax} theme={theme} width="60px" />
                                </div>
                            </div>
                        )}
                        <ModalActions onClose={() => setShowStarategyPanel(false)} onConfirm={onAddExercise} theme={theme} />
                    </Modal>
                )}
            </AnimatePresence>

            {/* FULL SCREEN EXERCISE PICKER */}
            {showExercisesList && (
                <div style={styles(theme).fullOverlay}>
                    <TrainingExercise needToAdd={true} setEx={(id) => { setCurrentExId(id); setShowExercisesList(false); setShowStarategyPanel(true); }} onBack={() => setShowExercisesList(false)} />
                    <Motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowExercisesList(false)} style={styles(theme).closeOverlayBtn}>
                        <MdClose size={24} color="#FFF" />
                    </Motion.div>
                </div>
            )}
        </div>
    )
}

// --- SUB-COMPONENTS ---

const DayItem = ({ 
    index, 
    day, 
    active, 
    onClick, 
    theme, 
    langIndex, 
    onAddEx, 
    onRemove, 
    onRemoveEx,
    onMoveDayUp,
    onMoveDayDown,
    onMoveExerciseUp,
    onMoveExerciseDown
}) => (
    <Motion.div
        layout
        {...getTrainingPressMotion(1, 0.99)}
        style={{
            ...styles(theme).card,
            ...getTrainingGlassSurface(theme, getTrainingAccent(), active),
            background: active
                ? `linear-gradient(145deg, rgba(${getTrainingAccent().rgb},0.12), rgba(255,255,255,0.05))`
                : (theme === 'light' ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.035)'),
            border: active ? `1px solid ${getTrainingPanelBorder(theme, getTrainingAccent(), true)}` : `1px solid ${getTrainingPanelBorder(theme, getTrainingAccent())}`,
            marginBottom: '0',
            boxShadow: active ? getTrainingPanelShadow(theme, getTrainingAccent(), true) : 'none'
        }}
    >
        <div style={{ padding: '12px 15px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            
            <FaCalendarDay style={{ color: getTrainingAccent().hue }} size={16} />
            <span onClick={onClick} style={{ fontWeight: '600', color: Colors.get('mainText', theme), flex: 1, fontSize: '15px' }}>
                {langIndex === 0 ? day.name[0] : day.name[1]}
            </span>
            
            {/* FIXED: Proper reorder controls with stopPropagation */}
            {!active && <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <Motion.div 
                    whileTap={{ scale: 0.9 }} 
                    onClick={(e) => { e.stopPropagation(); onMoveDayUp(); }}
                    style={{ 
                        ...styles(theme).miniBtn,backgroundColor:'transparent', 
                        opacity: index === 0 ? 0.3 : 1,
                        cursor: index === 0 ? 'not-allowed' : 'pointer'
                    }}
                
                >
                    <FaChevronUp size={12} color={index === 0 ? Colors.get('subText', theme) : getTrainingAccent().hue} />
                </Motion.div>
                <Motion.div 
                    whileTap={{ scale: 0.9 }} 
                    onClick={(e) => { e.stopPropagation(); onMoveDayDown(); }}
                    style={{ 
                        ...styles(theme).miniBtn,backgroundColor:'transparent', 
                        opacity: index === day.scheduleLength - 1 ? 0.3 : 1,
                        cursor: index === day.scheduleLength - 1 ? 'not-allowed' : 'pointer'
                    }}
                  
                >
                    <FaChevronUp size={12} style={{ transform: 'rotate(180deg)' }} color={index === day.scheduleLength - 1 ? Colors.get('subText', theme) : getTrainingAccent().hue} />
                </Motion.div>
            </div>}
            
            {active && (
                <div style={{ display: 'flex', gap: '10px' }} onClick={e => e.stopPropagation()}>
                    <Motion.div whileTap={{ scale: 0.9 }} onClick={onAddEx} style={styles(theme).miniBtn}><FaPlus size={12} color="#fff" /></Motion.div>
                    <Motion.div whileTap={{ scale: 0.9 }} onClick={onRemove} style={{ ...styles(theme).miniBtn, backgroundColor: 'rgba(255, 77, 77, 0.2)' }}><FaTrash size={12} color="#ff4d4d" /></Motion.div>
                </div>
            )}
        </div>

        <AnimatePresence>
            {active && (
                <Motion.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }} 
                    style={{ overflow: 'hidden' }}
                >
                    <div style={{ padding: '0 15px 15px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {day.exercises.map((item, exIndex) => {
                            const ex = AppData.exercises[item.exId];
                            if (!ex) return null;
                            return (
                                <div key={exIndex} style={styles(theme).exerciseRow}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                                        <div>
                                            <div style={{ fontSize: '14px', fontWeight: '600', color: Colors.get('mainText', theme) }}>
                                                {ex.name[langIndex]}
                                            </div>
                                            <div style={{ fontSize: '12px', color: Colors.get('subText', theme), display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaDumbbell size={10} /> {item.sets}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* FIXED: Exercise reorder controls */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <Motion.div 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                onMoveExerciseUp(exIndex); 
                                            }}
                                            style={{ 
                                                padding: '8px', 
                                                opacity: exIndex === 0 ? 0.3 : 0.6,
                                                cursor: exIndex === 0 ? 'not-allowed' : 'pointer'
                                            }}
                                            title={langIndex === 0 ? "Выше" : "Up"}
                                        >
                                            <FaChevronUp 
                                                color={exIndex === 0 ? Colors.get('subText', theme) : getTrainingAccent().hue} 
                                                size={14} 
                                            />
                                        </Motion.div>
                                        <Motion.div 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                onMoveExerciseDown(exIndex); 
                                            }}
                                            style={{ 
                                                padding: '8px', 
                                                opacity: exIndex === day.exercises.length - 1 ? 0.3 : 0.6,
                                                cursor: exIndex === day.exercises.length - 1 ? 'not-allowed' : 'pointer'
                                            }}
                                            title={langIndex === 0 ? "Ниже" : "Down"}
                                        >
                                            <FaChevronUp 
                                                color={exIndex === day.exercises.length - 1 ? Colors.get('subText', theme) : getTrainingAccent().hue} 
                                                size={14} 
                                                style={{ transform: 'rotate(180deg)' }} 
                                            />
                                        </Motion.div>
                                    </div>
                                    
                                    <Motion.div 
                                        whileTap={{ scale: 0.9 }} 
                                        onClick={(e) => { e.stopPropagation(); onRemoveEx(exIndex); }} 
                                        style={{ padding: '8px', opacity: 0.6, cursor: 'pointer' }}
                                    >
                                        <FaTrash color="#ff4d4d" size={14} />
                                    </Motion.div>
                                </div>
                            )
                        })}
                        {day.exercises.length === 0 && (
                            <div style={{ textAlign: 'center', fontSize: '12px', color: Colors.get('subText', theme), padding: '10px' }}>
                                {langIndex === 0 ? 'Нет упражнений' : 'No exercises'}
                            </div>
                        )}
                    </div>
                </Motion.div>
            )}
        </AnimatePresence>
    </Motion.div>
);

const ActionButton = ({ icon, onClick, theme, label, isDanger }) => (
    <Motion.div
        whileHover={{ scale: 1.006 }}
        whileTap={{ scale: 0.95, y: 1 }}
        transition={{ type: 'spring', stiffness: 430, damping: 30 }}
        onClick={onClick}
        style={{
            flex: 1, padding: '8px 12px', borderRadius: '12px', minWidth: '80px',
            background: isDanger ? 'rgba(255, 77, 77, 0.12)' : getTrainingPanelBackground(theme),
            border: `1px solid ${isDanger ? 'rgba(255,77,77,0.26)' : getTrainingPanelBorder(theme, getTrainingAccent())}`,
            boxShadow: isDanger ? 'none' : getTrainingPanelShadow(theme, getTrainingAccent()),
            backdropFilter: 'blur(16px) saturate(1.12)',
            WebkitBackdropFilter: 'blur(16px) saturate(1.12)',
            color: isDanger ? '#ff4d4d' : Colors.get('subText', theme),
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none'
        }}
    >
        {icon}
        <span style={{ fontSize: '10px', fontWeight: '700', opacity: 0.8, textTransform: 'uppercase' }}>{label}</span>
    </Motion.div>
);

const Modal = ({ children, title, theme, onClose }) => (
    <div style={styles(theme).modalBackdrop} onClick={onClose}>
        <Motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 50, scale: 0.95 }}
            style={styles(theme).modalContainer} onClick={e => e.stopPropagation()}
        >
            <div style={styles(theme).modalHeader}>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: 0 }}>{title}</h3>
            </div>
            <div style={{ width: '100%', padding: '0 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxSizing: 'border-box' }}>
                {children}
            </div>
        </Motion.div>
    </div>
);

const ModalActions = ({ onClose, onConfirm, theme }) => (
    <div style={styles(theme).modalActions}>
        <Motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }} onClick={onClose} style={styles(theme).circleBtn}>
            <MdClose style={{ fontSize: '24px', color: Colors.get('subText', theme) }} />
        </Motion.div>
        <Motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.92 }} onClick={onConfirm} style={{ ...styles(theme).circleBtn, background: `linear-gradient(135deg, ${getTrainingAccent().hue}, #12BFA5)`, borderColor: getTrainingAccent().ring, boxShadow: `0 14px 30px rgba(${getTrainingAccent().rgb},0.26)` }}>
            <MdDone style={{ fontSize: '24px', color: '#fff' }} />
        </Motion.div>
    </div>
);

const capitalizeName = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

const styles = (theme, isCurrentGroup, isCurrentExercise, fSize) => {
    const accent = getTrainingAccent();
    const isLight = theme === 'light' || theme === 'speciallight';

    return {
    container: {
        background: getTrainingPageBackground(theme, accent),
        display: "flex", flexDirection: "column",
        overflowY: 'auto', alignItems: "center",
        minHeight: "100dvh",
        height: "auto",
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 18px 116px',
        width: "100vw",
        fontFamily: 'inherit', boxSizing: 'border-box'
    },
    card: {
        width: '100%', margin: '0 auto 14px auto',
        borderRadius: '22px', overflow: 'hidden',
        ...getTrainingGlassSurface(theme, accent),
    },
    groupHeader: {
        display: 'flex', flexDirection: 'row',
        padding: '16px', alignItems: "center", justifyContent: "space-between",
        gap: '12px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    },
    programHeaderLayout: {
        display: 'grid',
        gridTemplateColumns: '40px minmax(0, 1fr)',
        alignItems: 'center',
        flex: 1,
        gap: '14px',
        minWidth: 0,
    },
    programHeaderContent: {
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    programTitle: {
        width: '100%',
        textAlign: 'left',
        lineHeight: 1.28,
        overflowWrap: 'anywhere',
    },
    programMetaRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '7px',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    iconBox: {
        width: '40px', height: '40px', borderRadius: '12px',
        backgroundColor: accent.soft,
        border: `1px solid ${accent.ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    badge: {
        fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '6px',
        backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)',
        color: Colors.get('subText', theme), textTransform: 'uppercase'
    },
    text: {
        fontSize: fSize === 0 ? "16px" : '18px',
        color: Colors.get('mainText', theme), fontWeight: '600', margin: 0
    },
    subtext: {
        fontSize: fSize === 0 ? "13px" : '15px',
        color: Colors.get('subText', theme), lineHeight: '1.4', margin: 0
    },
    icon: { fontSize: "20px", color: Colors.get('icons', theme) },
    
    // EXERCISES
    exerciseRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px', borderRadius: '12px',
        background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)'
    },
    exerciseIcon: {
        width: '32px', height: '32px', borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    
    // BUTTONS
    bigFab: {
        position: 'fixed', bottom: '110px', right: '30px',
        width: '56px', height: '56px', borderRadius: '28px',
        background: `linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, 0.72))`,
        border: `1px solid ${accent.ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 14px 34px rgba(${accent.rgb}, 0.26)`, cursor: 'pointer', zIndex: 100
    },
    miniBtn: {
        width: '24px', height: '24px', borderRadius: '8px',
	        backgroundColor: accent.soft,
	        border: `1px solid ${accent.ring}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    circleBtn: {
        width: '58px', height: '58px', borderRadius: '20px',
        background: isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.065)',
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.10)'}`,
        boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.70) inset' : '0 1px 0 rgba(255,255,255,0.06) inset',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
        backdropFilter: 'blur(16px) saturate(145%)',
        WebkitBackdropFilter: 'blur(16px) saturate(145%)'
    },
    secondaryBtn: {
        padding: '10px 20px', borderRadius: '12px', border: 'none',
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
        color: Colors.get('mainText', theme), fontSize: '16px', cursor: 'pointer'
    },
    dangerBtn: {
        padding: '10px 20px', borderRadius: '12px', border: 'none',
        backgroundColor: '#ff4d4d', color: '#fff', fontSize: '16px', cursor: 'pointer'
    },

    // MODAL
    modalBackdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.62)', backdropFilter: 'blur(16px) saturate(130%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000,
        padding: '18px',
        boxSizing: 'border-box'
    },
    modalContainer: {
        width: '100%', maxWidth: '430px',
        background: getTrainingPanelBackground(theme, accent),
        borderRadius: '28px',
        boxShadow: getTrainingPanelShadow(theme, accent),
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
        overflow: 'hidden',
        backdropFilter: 'blur(28px) saturate(155%)',
        WebkitBackdropFilter: 'blur(28px) saturate(155%)'
    },
    modalHeader: {
        width: '100%', padding: '22px 20px 18px', borderBottom: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
        textAlign: 'center', marginBottom: '16px',
        background: isLight ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.035)',
        boxSizing: 'border-box'
    },
    modalActions: {
        marginTop: '20px', padding: '16px 20px 18px', width: '100%',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        borderTop: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.24)' : 'rgba(255,255,255,0.025)',
        boxSizing: 'border-box'
    },
    modalInput: {
        width: '100%',
        border: `1px solid ${getTrainingPanelBorder(theme, accent)}`,
        background: isLight ? 'rgba(255,255,255,0.56)' : 'rgba(6,12,18,0.22)',
        boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.66) inset' : '0 1px 0 rgba(255,255,255,0.045) inset',
        fontSize: '16px',
        color: Colors.get('mainText', theme),
        outline: 'none',
        borderRadius: '17px',
        padding: '14px 15px',
        boxSizing: 'border-box',
        backdropFilter: 'blur(16px) saturate(140%)',
        WebkitBackdropFilter: 'blur(16px) saturate(140%)'
    },
    segmentedControl: {
        display: 'flex', width: '100%', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        borderRadius: '12px', padding: '4px', margin: '10px 0'
    },
    segment: {
        flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
    },
    
    // FULL SCREEN
    fullOverlay: { position: 'fixed', inset: 0, backgroundColor: Colors.get('background', theme), zIndex: 6000 },
    closeOverlayBtn: {
        position: 'fixed', top: '20px', right: '20px', zIndex: 6001,
        width: '40px', height: '40px', borderRadius: '20px',
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    }
    };
};


export default TrainingProgramm;
