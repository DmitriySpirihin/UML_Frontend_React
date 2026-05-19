import React, { useState, useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$, lang$, fontSize$, setPage, setCurrentTrainingMuscle } from '../../StaticClasses/HabitsBus.js'
import { playEffects } from '../../StaticClasses/Effects.js'
import { IoIosArrowBack, IoIosArrowDown, IoIosSearch } from 'react-icons/io'
import { MuscleIcon, removeExercise, updateExercise } from '../../Classes/TrainingData.jsx'
import { FaTrash, FaPencilAlt, FaPlus } from 'react-icons/fa';
import { TbDotsVertical } from 'react-icons/tb'
import { MdDone, MdClose } from 'react-icons/md'
import {
    getTrainingAccent,
    getTrainingPageBackground,
    getTrainingPanelBackground,
    getTrainingPanelBorder,
    getTrainingPanelShadow,
    getTrainingGlassSurface,
    getTrainingPressMotion
} from './TrainingVisuals.js'

const TrainingExercise = ({ needToAdd, setEx, onBack }) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [currentMuscleGroupId, setCurrentMuscleGroupId] = useState(-1);
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);
    const [currentExerciseName, setCurrentExerciseName] = useState('');
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [showRedakt, setShowRedakt] = useState(false);
    
    // Form States
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isBase, setIsBase] = useState(true);
    const [mGroups, setMGroups] = useState(new Array(14).fill(false));
    const [formMainMuscle, setFormMainMuscle] = useState(0); // For the constructor

    // subscriptions
    useEffect(() => {
        const subscriptionTheme = theme$.subscribe(setthemeState);
        const subscriptionLang = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => {
            subscriptionLang.unsubscribe();
            subscriptionTheme.unsubscribe();
        }
    }, []);
    useEffect(() => {
        const subscriptionFontSize = fontSize$.subscribe(setFSize);
        return () => {
            subscriptionFontSize.unsubscribe();
        };
    }, []);

    // --- LOGIC ---
    function setMuscleGroup(id) {
        playEffects(null);
        setCurrentMuscleGroupId(currentMuscleGroupId === id ? -1 : id);
        if (currentMuscleGroupId === -1) {
            setCurrentExerciseId(-1);
        }
    }
    function setExercise(id) {
        playEffects(null);
        setCurrentExerciseId(currentExerciseId === id ? -1 : id);
    }
    function onRedaktStart() {
        const exercise = AppData.exercises[currentExerciseId];
        if (exercise) {
            setName(exercise.name[langIndex]);
            const addMgGroups = new Array(14).fill(false);
            if (exercise.addMgIds.length > 0) {
                exercise.addMgIds.forEach(element => { addMgGroups[element] = true; });
            }
            setMGroups(addMgGroups);
            setDescription(exercise.description[langIndex]);
            
            // Set form state
            setFormMainMuscle(exercise.mgId);
            setIsBase(exercise.isBase);
            setShowRedakt(true);
        }
    }
    function onRedakt() {
        playEffects(null);
        const addMgGroups = [];
        for (let index = 0; index < mGroups.length; index++) {
            if (mGroups[index]) addMgGroups.push(index);
        }
        const exercise = AppData.exercises[currentExerciseId];
        const updatedName = [...exercise.name];
        updatedName[langIndex] = capitalizeName(name);

        const updatedDesc = [...exercise.description];
        if (description.length > 3) {
            updatedDesc[langIndex] = capitalizeName(description);
        } else {
            updatedDesc[langIndex] = langIndex === 0 ? 'Своё упражнение' : 'Custom exercise';
        }

        updateExercise(
            currentExerciseId,
            formMainMuscle,
            addMgGroups,
            updatedName,
            updatedDesc,
            isBase
        );
        setShowRedakt(false);
    }
    function onRemove() {
        playEffects(null);
        removeExercise(currentExerciseId);
        setCurrentExerciseId(-1);
        setShowConfirmRemove(false);
    }
    function handleBack() {
        playEffects(null);
        if (typeof onBack === 'function') {
            onBack();
            return;
        }
        setPage('TrainingMain');
    }
    
    // --- ANIMATION VARIANTS ---
    const accordionVariants = {
        collapsed: { height: 0, opacity: 0, overflow: 'hidden' },
        expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } }
    };

    const modalVariants = {
        hidden: { opacity: 0, y: 100, scale: 0.95 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
        exit: { opacity: 0, y: 100, scale: 0.95 }
    };

    return (
        <div style={{...styles(theme).container, paddingBottom: needToAdd ? 'calc(env(safe-area-inset-bottom, 0px) + 18px)' : styles(theme).container.paddingBottom}}>
            <div style={styles(theme).topBar}>
                <button type="button" onClick={handleBack} style={styles(theme).backButton} aria-label={langIndex === 0 ? 'Назад' : 'Back'}>
                    <IoIosArrowBack style={{ fontSize: '24px' }} />
                </button>
                {/* SEARCH BAR */}
                <div style={styles(theme).searchContainer}>
                    <IoIosSearch style={{ color: Colors.get('subText', theme), fontSize: '20px', marginLeft: '10px' }} />
                    <input
                        type="text"
                        placeholder={langIndex === 0 ? "Поиск упражнения..." : "Search exercise..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: 'none',marginLeft: '10px', minWidth: 0}}
                    />
                    {searchTerm && (
                        <MdClose
                            onClick={() => setSearchTerm('')}
                            style={{ color: Colors.get('subText', theme), fontSize: '18px', marginRight: '10px', cursor:'pointer' }}
                        />
                    )}
                </div>
            </div>

            <div className="no-scrollbar" style={{ width: '100%', maxWidth: '600px', paddingBottom: needToAdd ? '22px' : '96px', flex: 1, overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                {Object.keys(MuscleIcon.muscleIconsSrc[0]).map((keyStr) => {
                    const key = Number(keyStr);
                    
                    // Filter exercises for this group based on search
                    const groupExercises = Object.entries(AppData.exercises)
                        .filter(([, ex]) => {
                            const matchesGroup = ex.mgId === key;
                            const matchesSearch = ex.name[langIndex].toLowerCase().includes(searchTerm.toLowerCase());
                            return matchesGroup && ex.show && matchesSearch;
                        })
                        .sort(([idA], [idB]) => Number(idA) - Number(idB));

                    // If searching and no exercises match in this group, hide the group
                    if (searchTerm && groupExercises.length === 0) return null;

                    const isSelected = currentMuscleGroupId === key;

                    return (
                        <Motion.div
                            key={key}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            {...getTrainingPressMotion(1.006, 0.988)}
                            style={{
                                ...styles(theme).card,
                                ...getTrainingGlassSurface(theme, getTrainingAccent(), isSelected),
                                background: isSelected
                                    ? `linear-gradient(145deg, rgba(${getTrainingAccent().rgb}, 0.04), rgba(${getTrainingAccent().rgb}, 0.015)), ${getTrainingPanelBackground(theme)}`
                                    : getTrainingPanelBackground(theme),
                                border: `1px solid ${getTrainingPanelBorder(theme, getTrainingAccent(), isSelected)}`,
                                boxShadow: getTrainingPanelShadow(theme, getTrainingAccent(), isSelected)
                            }}
                        >
                            {/* Muscle Group Header */}
                            <Motion.div
                                onClick={() => setMuscleGroup(key)}
                                style={styles(theme).groupHeader}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                                    {MuscleIcon.get(key, langIndex, theme, true, '100%')}
                                </div>
                                <Motion.div animate={{ rotate: isSelected ? 180 : 0 }}>
                                    <IoIosArrowDown style={styles(theme).icon} />
                                </Motion.div>
                            </Motion.div>

                            {/* Exercises List Accordion */}
                            <AnimatePresence>
                                {isSelected && (
                                    <Motion.div
                                        variants={accordionVariants}
                                        initial="collapsed"
                                        animate="expanded"
                                        exit="collapsed"
                                        style={{ borderTop: `1px solid ${Colors.get('border', theme)}` }}
                                    >
                                        <div style={{ padding: '10px 0' }}>
                                            {groupExercises.map(([idStr, exercise]) => {
                                                    const exId = Number(idStr);
                                                    const isExSelected = currentExerciseId === exId;
                                                    const isBaseEx = exercise.isBase;

                                                    return (
                                                        <Motion.div key={exId} layout style={{ marginBottom: '8px' }}>
                                                            {/* Exercise Row */}
                                                            <Motion.div
                                                                onClick={() => setExercise(exId)}
                                                                whileHover={{ scale: 1.006 }}
                                                                whileTap={{ scale: 0.985, y: 1 }}
                                                                transition={{ type: 'spring', stiffness: 430, damping: 32 }}
                                                                style={{
                                                                    ...styles(theme).exerciseRow,
                                                                    background: isExSelected
                                                                        ? `linear-gradient(135deg, rgba(${getTrainingAccent().rgb},0.14), rgba(255,255,255,0.05))`
                                                                        : styles(theme).exerciseRow.background
                                                                }}
                                                            >
                                                                <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <p style={{...styles(theme, false, false, fSize).text, ...styles(theme).exerciseName}}>{exercise.name[langIndex]}</p>
                                                                    
                                                                    {/* BADGE */}
                                                                    <div style={styles(theme).exerciseBadge(isBaseEx)}>
                                                                        {isBaseEx ? (langIndex===0 ? 'База' : 'Base') : (langIndex===0 ? 'Изол' : 'Iso')}
                                                                    </div>
                                                                </div>

                                                                {needToAdd && (
                                                                    <Motion.div whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); setEx(exId); }} style={{ padding: '8px' }}>
                                                                        <FaPlus style={{ color: Colors.get('currentDateBorder', theme), fontSize: '18px' }} />
                                                                    </Motion.div>
                                                                )}
                                                                
                                                                <Motion.div animate={{ rotate: isExSelected ? 180 : 0 }}>
                                                                    <IoIosArrowDown style={{ ...styles(theme).icon, fontSize: '14px' }} />
                                                                </Motion.div>
                                                            </Motion.div>

                                                            {/* Exercise Description / Actions */}
                                                            <AnimatePresence>
                                                                {isExSelected && (
                                                                    <Motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        style={{ padding: '2px 22px 16px 22px' }}
                                                                    >
                                                                        <ExerciseGuide exercise={exercise} langIndex={langIndex} theme={theme} fSize={fSize} />
                                                                        
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '15px' }}>
                                                                            <AnimatePresence>
                                                                                {showAddOptions && (
                                                                                    <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: '15px' }}>
                                                                                        <FaPencilAlt onClick={(e) => { e.stopPropagation(); setCurrentExerciseName(exercise.name[langIndex]); onRedaktStart(); }} style={{ color: Colors.get('subText', theme), fontSize: '16px' }} />
                                                                                        <FaTrash onClick={(e) => { e.stopPropagation(); setCurrentExerciseName(exercise.name[langIndex]); setShowConfirmRemove(true); }} style={{ color: '#ff4d4d', fontSize: '16px' }} />
                                                                                    </Motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                            <TbDotsVertical onClick={(e) => { e.stopPropagation(); setShowAddOptions(!showAddOptions); }} style={{ color: Colors.get('icons', theme), fontSize: '20px' }} />
                                                                        </div>
                                                                    </Motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </Motion.div>
                                                    );
                                                })}
                                            
                                            {/* Add Button inside Muscle Group (Only show if no search term for clean UX, or keep it) */}
                                            {!searchTerm && (
                                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                                    <Motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => { playEffects(null); setCurrentTrainingMuscle(key); setPage('AddExercisePanel'); }}
                                                        style={styles(theme).fab}
                                                    >
                                                        <FaPlus style={{ fontSize: '14px', color: '#fff' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{langIndex === 0 ? 'Создать' : 'Create'}</span>
                                                    </Motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </Motion.div>
                                )}
                            </AnimatePresence>
                        </Motion.div>
                    );
                })}
            </div>

            {/* MODAL: ADD / EDIT EXERCISE (Constructor) */}
            <AnimatePresence>
                {showRedakt && (
                    <div style={styles(theme).modalBackdrop}>
                        <Motion.div
                            variants={modalVariants}
                            initial="hidden" animate="visible" exit="exit"
                            style={styles(theme).modalContainer}
                        >
                            <div style={styles(theme).modalHeader}>
                                <h3 style={styles(theme, false, false, fSize).headerText}>{langIndex === 0 ? 'Редактор' : 'Editor'}</h3>
                            </div>

                            <div style={{ width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                                {/* INPUTS */}
                                <input 
                    type="text" 
                    placeholder={langIndex === 0 ? 'Название' : 'Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                />
                <input 
                    type="text" 
                    placeholder={langIndex === 0 ? 'Описание' : 'Description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                />

                                {/* TYPE TOGGLE */}
                                <div style={styles(theme).segmentedControl}>
                                    <div onClick={() => setIsBase(true)} style={{ ...styles(theme).segment, backgroundColor: isBase ? Colors.get('difficulty5', theme) : 'transparent', color: isBase ? Colors.get('trainingBaseFont', theme) : Colors.get('subText', theme), boxShadow: isBase ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
                                        {langIndex === 0 ? "База" : "Base"}
                                    </div>
                                    <div onClick={() => setIsBase(false)} style={{ ...styles(theme).segment, backgroundColor: !isBase ? Colors.get('difficulty2', theme) : 'transparent', color: !isBase ? Colors.get('trainingIsolatedFont', theme) : Colors.get('subText', theme), boxShadow: !isBase ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}>
                                        {langIndex === 0 ? "Изол." : "Iso"}
                                    </div>
                                </div>

                                {/* MAIN MUSCLE SELECTOR (Horizontal Scroll) */}

                                {/* ADDITIONAL MUSCLES (Chips) */}
                                <div>
                                    <p style={{ ...styles(theme, false, false, fSize).label, marginBottom: '8px' }}>{langIndex === 0 ? 'Доп. мышцы' : 'Secondary Muscles'}</p>
                                    <div style={styles(theme).chipGrid}>
                                        {MuscleIcon.names[langIndex].map((name, index) => {
                                            if (formMainMuscle === index) return null;
                                            return (
                                                <Motion.div
                                                    key={index}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setMGroups(prev => prev.map((val, i) => i === index ? !val : val))}
                                                    style={{
                                                        ...styles(theme).chip,
                                                        backgroundColor: mGroups[index] ? Colors.get('difficulty', theme) : 'transparent',
                                                        color: mGroups[index] ? '#fff' : Colors.get('subText', theme),
                                                        borderColor: mGroups[index] ? 'transparent' : Colors.get('border', theme)
                                                    }}
                                                >
                                                    {name}
                                                </Motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div style={styles(theme).modalActions}>
                                <Motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowRedakt(false)} style={styles(theme).circleBtn}>
                                    <MdClose style={{ fontSize: '24px', color: Colors.get('subText', theme) }} />
                                </Motion.div>
                                <Motion.div whileTap={{ scale: 0.9 }} onClick={onRedakt} style={{ ...styles(theme).circleBtn, backgroundColor: Colors.get('done', theme) }}>
                                    <MdDone style={{ fontSize: '24px', color: '#fff' }} />
                                </Motion.div>
                            </div>
                        </Motion.div>
                    </div>
                )}

                {/* Confirm Remove Modal */}
                {showConfirmRemove && (
                    <div style={styles(theme).modalBackdrop}>
                        <Motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ ...styles(theme).modalContainer, height: 'auto', padding: '25px', maxHeight:'300px' }}>
                            <p style={{ ...styles(theme, false, false, fSize).text, textAlign: 'center', marginBottom: '25px' }}>
                                {langIndex === 0 ? `Удалить ${currentExerciseName}?` : `Delete ${currentExerciseName}?`}
                            </p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <Motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConfirmRemove(false)} style={styles(theme).secondaryBtn}>{langIndex === 0 ? "Нет" : "Cancel"}</Motion.button>
                                <Motion.button whileTap={{ scale: 0.95 }} onClick={() => onRemove()} style={styles(theme).dangerBtn}>{langIndex === 0 ? "Удалить" : "Delete"}</Motion.button>
                            </div>
                        </Motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TrainingExercise

const ExerciseGuide = ({ exercise, langIndex, theme, fSize }) => {
    const description = exercise.description?.[langIndex] || '';
    const steps = splitExerciseSteps(description);
    const mainMuscle = MuscleIcon.names?.[langIndex]?.[exercise.mgId] || '';
    const secondary = (exercise.addMgIds || [])
        .map(id => MuscleIcon.names?.[langIndex]?.[id])
        .filter(Boolean)
        .slice(0, 3);

    return (
        <div style={styles(theme).guideCard}>
            <div style={styles(theme).guideContent}>
                <div style={styles(theme).guideTitleRow}>
                    <span>{langIndex === 0 ? 'Как выполнять' : 'How to perform'}</span>
                </div>
                <div style={styles(theme).guideSteps}>
                    {steps.map((step, index) => (
                        <div key={`${step}-${index}`} style={styles(theme).guideStep}>
                            <span style={styles(theme).guideStepNumber}>{index + 1}</span>
                            <span style={styles(theme, false, false, fSize).subtext}>{step}</span>
                        </div>
                    ))}
                </div>
                <div style={styles(theme).muscleTags}>
                    {mainMuscle && <span style={styles(theme).mainMuscleTag}>{mainMuscle}</span>}
                    {secondary.map(item => <span key={item} style={styles(theme).secondaryMuscleTag}>{item}</span>)}
                </div>
            </div>
        </div>
    );
};

const splitExerciseSteps = (description) => {
    const steps = description
        .split(/[.!?]+/)
        .map(step => step.trim())
        .filter(Boolean)
        .slice(0, 4);
    return steps.length > 0 ? steps : ['Сохраняйте контроль движения', 'Работайте в комфортной амплитуде'];
};

const styles = (theme, isCurrentGroup, isCurrentExercise, fSize) => {
    const accent = getTrainingAccent();
    const isLight = theme === 'light' || theme === 'speciallight';

    return {
    container: {
        background: getTrainingPageBackground(theme, accent),
        display: "flex", flexDirection: "column",
        overflow: 'hidden', alignItems: "center",
        minHeight: "100dvh",
        height: "100dvh",
        padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px 116px',
        width: "100vw",
        fontFamily: 'inherit', boxSizing: 'border-box'
    },
    topBar: {
        width: '100%',
        maxWidth: '600px',
        display: 'grid',
        gridTemplateColumns: '52px minmax(0, 1fr)',
        gap: '10px',
        alignItems: 'center',
        marginBottom: '16px',
        flexShrink: 0,
    },
    backButton: {
        width: '52px',
        height: '52px',
        borderRadius: '18px',
        border: `1px solid ${getTrainingPanelBorder(theme, accent, false)}`,
        background: getTrainingPanelBackground(theme),
        color: Colors.get('mainText', theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        padding: 0,
        boxShadow: getTrainingPanelShadow(theme, accent, false),
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)',
        boxSizing: 'border-box',
    },
    // SEARCH
	    searchContainer: {
	        width: '100%', maxWidth: '600px',
        ...getTrainingGlassSurface(theme, accent),
        borderRadius: '20px', display: 'flex', alignItems: 'center',
	        padding: '12px 0', boxSizing: 'border-box',
        minWidth: 0,
    },
    searchInput: {
        flex: 1, border: 'none', background: 'transparent',
        fontSize: '15px', color: Colors.get('mainText', theme),
        marginLeft: '8px', outline: 'none'
    },
    // CARDS
	    card: {
	        width: '100%', margin: '0 auto 16px auto',
	        borderRadius: '24px', overflow: 'hidden',
	        ...getTrainingGlassSurface(theme, accent),
	        boxSizing: 'border-box'
	    },
    groupHeader: {
        display: 'flex', flexDirection: 'row',
        padding: '16px 14px', alignItems: "center", justifyContent: "space-between",
        cursor: 'pointer'
    },
	    exerciseRow: {
	        display: 'flex', flexDirection: 'row',
	        padding: '17px 18px', alignItems: "center", justifyContent: "space-between",
	        cursor: 'pointer', borderRadius: '16px', margin: '0 14px 10px', boxSizing: 'border-box',
	        minHeight: '64px',
	        background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.045)',
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: isLight ? '0 8px 18px rgba(20,30,38,0.05)' : '0 8px 18px rgba(0,0,0,0.12)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            userSelect: 'none',
            WebkitTapHighlightColor: 'transparent'
	    },
    icon: {
        fontSize: "20px", color: Colors.get('icons', theme), marginRight: '10px'
    },
    text: {
        fontSize: fSize === 0 ? "15px" : '17px',
        color: Colors.get('mainText', theme), fontWeight: '500', margin: 0
    },
    exerciseName: {
        flex: 1,
        minWidth: 0,
        textAlign: 'left',
        lineHeight: 1.34,
        overflowWrap: 'anywhere',
    },
    exerciseBadge: (isBaseEx) => ({
        flexShrink: 0,
        fontSize: '10px',
        fontWeight: 900,
        padding: '4px 8px',
        borderRadius: '999px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color: !isBaseEx ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme),
        backgroundColor: !isBaseEx ? `${Colors.get('difficulty2', theme)}18` : `${Colors.get('difficulty5', theme)}18`,
        border: `1px solid ${!isBaseEx ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme)}30`,
    }),
    guideCard: {
        display: 'block',
        padding: '16px',
        borderRadius: '22px',
        background: isLight
            ? 'linear-gradient(135deg, rgba(255,255,255,0.56), rgba(15,23,42,0.025))'
            : 'linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.028))',
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        boxSizing: 'border-box',
    },
    guideContent: {
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    guideTitleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: accent.hue,
        fontSize: '12px',
        fontWeight: 900,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
    },
    guideSteps: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    guideStep: {
        display: 'grid',
        gridTemplateColumns: '22px minmax(0, 1fr)',
        gap: '8px',
        alignItems: 'start',
    },
    guideStepNumber: {
        width: '22px',
        height: '22px',
        borderRadius: '9px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent.hue,
        background: `rgba(${accent.rgb}, 0.12)`,
        border: `1px solid ${accent.ring}`,
        fontSize: '11px',
        fontWeight: 900,
        flexShrink: 0,
    },
    muscleTags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginTop: '2px',
    },
    mainMuscleTag: {
        borderRadius: '999px',
        padding: '5px 8px',
        color: accent.hue,
        background: `rgba(${accent.rgb}, 0.12)`,
        border: `1px solid ${accent.ring}`,
        fontSize: '10px',
        fontWeight: 900,
    },
    secondaryMuscleTag: {
        borderRadius: '999px',
        padding: '5px 8px',
        color: Colors.get('subText', theme),
        background: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)',
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
        fontSize: '10px',
        fontWeight: 850,
    },
    subtext: {
        fontSize: fSize === 0 ? "13px" : '15px',
        color: Colors.get('subText', theme), lineHeight: '1.4', margin: 0
    },
    label: {
        fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase',
        color: Colors.get('subText', theme), letterSpacing: '0.5px'
    },
    headerText: {
        fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: 0
    },
    // MODAL
    modalBackdrop: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    },
    modalContainer: {
        width: '90%', maxWidth: '400px', height: '80vh', maxHeight: '750px',
        backgroundColor: Colors.get('background', theme),
        borderRadius: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        border: `1px solid ${Colors.get('border', theme)}`, overflow: 'hidden'
    },
    modalHeader: {
        width: '100%', padding: '20px', borderBottom: `1px solid ${Colors.get('border', theme)}`,
        textAlign: 'center', marginBottom: '15px'
    },
    modalActions: {
        marginTop: 'auto', padding: '15px 20px', width: '100%',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        borderTop: `1px solid ${Colors.get('border', theme)}`,
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)'
    },
    // COMPONENTS
    segmentedControl: {
        display: 'flex', width: '98%', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        borderRadius: '12px', padding: '4px', margin: '10px 0'
    },
    segment: {
        flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
    },
    horizontalScroll: {
        display: 'flex', overflowX: 'auto', gap: '8px', padding: '5px 0 15px 0',
        scrollbarWidth: 'none', width: '100%'
    },
    scrollItem: {
        minWidth: '60px', borderRadius: '12px', border: '1px solid',
        padding: '5px', cursor: 'pointer', display:'flex', alignItems:'center', justifyContent:'center'
    },
    chipGrid: {
        display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px', paddingBottom: '20px'
    },
    chip: {
        padding: '6px 12px', borderRadius: '20px', border: '1px solid',
        fontSize: '12px', cursor: 'pointer', fontWeight: '500'
    },
    circleBtn: {
        width: '50px', height: '50px', borderRadius: '25px',
        backgroundColor: Colors.get('skipped', theme),
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
    },
    fab: {
        background: `linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, 0.72))`,
        border: `1px solid ${accent.ring}`, borderRadius: '20px', padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: '8px',
        color: '#fff', cursor: 'pointer', boxShadow: `0 10px 24px rgba(${accent.rgb}, 0.24)`
    },
    secondaryBtn: {
        padding: '10px 20px', borderRadius: '12px', border: 'none',
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
        color: Colors.get('mainText', theme), fontSize: '16px', cursor: 'pointer'
    },
    dangerBtn: {
        padding: '10px 20px', borderRadius: '12px', border: 'none',
        backgroundColor: '#ff4d4d', color: '#fff', fontSize: '16px', cursor: 'pointer'
    }
    };
};

const capitalizeName = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
