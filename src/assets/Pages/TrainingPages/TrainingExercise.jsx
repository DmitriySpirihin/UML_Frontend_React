import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$, lang$, fontSize$, addPanel$, setShowPopUpPanel } from '../../StaticClasses/HabitsBus.js'
import { IoIosArrowDown, IoIosArrowUp, IoIosSearch } from 'react-icons/io'
import { MuscleIcon, addExercise, removeExercise, updateExercise } from '../../Classes/TrainingData.jsx'
import { FaTrash, FaPencilAlt, FaPlus } from 'react-icons/fa';
import { TbDotsVertical } from 'react-icons/tb'
import { MdDone, MdClose } from 'react-icons/md'

const TrainingExercise = ({ needToAdd, setEx }) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[1]);
    const [addPanel, setAddPanel] = useState('');
    
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
        const subscriptionAddPanel = addPanel$.subscribe(setAddPanel);
        const subscriptionFontSize = fontSize$.subscribe(setFSize);
        return () => {
            subscriptionAddPanel.unsubscribe();
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
    function onClose() {
        playEffects(null);
        setAddPanel('');
        setMGroups(new Array(14).fill(false));
        setName('');
        setDescription('');
        setIsBase(true);
    }
    function onAdd() {
        if (name.length < 3) {
            setShowPopUpPanel(langIndex === 0 ? 'Введите название (мин. 3 символа)' : 'Enter name (min 3 chars)', 2000, false);
            return;
        }
        // Use formMainMuscle instead of currentMuscleGroupId to allow changing it in constructor
        const targetMuscle = formMainMuscle; 
        
        const addMgGroups = [];
        for (let index = 0; index < mGroups.length; index++) {
            if (mGroups[index]) addMgGroups.push(index);
        }
        playEffects(null);
        const baseName = capitalizeName(name);
        const baseDesc = description.length > 3 ? capitalizeName(description) : '';

        addExercise(
            targetMuscle,
            addMgGroups,
            [langIndex === 0 ? baseName : 'Custom exercise', langIndex === 1 ? baseName : 'Своё упражнение'],
            [langIndex === 0 ? (baseDesc || 'Своё упражнение') : 'Custom exercise', langIndex === 1 ? (baseDesc || 'Custom exercise') : 'Своё упражнение'],
            isBase
        );
        onClose();
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
        onClose();
    }
    
    // Prepare modal for new entry
    useEffect(() => {
        if (addPanel === 'AddExercisePanel') {
            // Default to current group or 0 if none selected
            setFormMainMuscle(currentMuscleGroupId !== -1 ? currentMuscleGroupId : 0);
        }
    }, [addPanel]);

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
        <div style={styles(theme).container}>
            {/* SEARCH BAR */}
            <div style={styles(theme).searchContainer}>
                <IoIosSearch style={{ color: Colors.get('subText', theme), fontSize: '20px', marginLeft: '10px' }} />
                <input 
                    type="text" 
                    placeholder={langIndex === 0 ? "Поиск упражнения..." : "Search exercise..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
                />
                {searchTerm && (
                    <MdClose 
                        onClick={() => setSearchTerm('')} 
                        style={{ color: Colors.get('subText', theme), fontSize: '18px', marginRight: '10px', cursor:'pointer' }} 
                    />
                )}
            </div>

            <div style={{ width: '100%', maxWidth: '600px', paddingBottom: '80px', flex: 1, overflowY: 'auto' }}>
                {Object.keys(MuscleIcon.muscleIconsSrc[0]).map((keyStr) => {
                    const key = Number(keyStr);
                    
                    // Filter exercises for this group based on search
                    const groupExercises = Object.entries(AppData.exercises)
                        .filter(([id, ex]) => {
                            const matchesGroup = ex.mgId === key;
                            const matchesSearch = ex.name[langIndex].toLowerCase().includes(searchTerm.toLowerCase());
                            return matchesGroup && ex.show && matchesSearch;
                        })
                        .sort(([idA], [idB]) => Number(idA) - Number(idB));

                    // If searching and no exercises match in this group, hide the group
                    if (searchTerm && groupExercises.length === 0) return null;

                    const isSelected = currentMuscleGroupId === key;

                    return (
                        <motion.div
                            key={key}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                ...styles(theme).card,
                                backgroundColor: isSelected ? Colors.get('trainingGroupSelected', theme) : Colors.get('background', theme),
                                border: `1px solid ${isSelected ? Colors.get('currentDateBorder', theme) : 'transparent'}`
                            }}
                        >
                            {/* Muscle Group Header */}
                            <motion.div
                                onClick={() => setMuscleGroup(prev => prev === key ? -1 : key)}
                                style={styles(theme).groupHeader}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div style={{ flex: 1 }}>
                                    {MuscleIcon.get(key, langIndex, theme, true, '100%')}
                                </div>
                                <motion.div animate={{ rotate: isSelected ? 180 : 0 }}>
                                    <IoIosArrowDown style={styles(theme).icon} />
                                </motion.div>
                            </motion.div>

                            {/* Exercises List Accordion */}
                            <AnimatePresence>
                                {isSelected && (
                                    <motion.div
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
                                                        <motion.div key={exId} layout style={{ marginBottom: '8px' }}>
                                                            {/* Exercise Row */}
                                                            <motion.div
                                                                onClick={() => setExercise(prev => prev === exId ? -1 : exId)}
                                                                style={{
                                                                    ...styles(theme).exerciseRow,
                                                                    backgroundColor: isExSelected ? (theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)') : 'transparent'
                                                                }}
                                                                whileTap={{ backgroundColor: Colors.get('trainingGroup', theme) }}
                                                            >
                                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <p style={{...styles(theme, false, false, fSize).text,textAlign : 'left'}}>{exercise.name[langIndex]}</p>
                                                                    
                                                                    {/* BADGE */}
                                                                    <div style={{
                                                                        fontSize: '9px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px',
                                                                        textTransform: 'uppercase', letterSpacing: '0.5px',marginLeft:'auto',
                                                                        color: !isBaseEx ? Colors.get('difficulty2', theme) : Colors.get('difficulty5', theme),
                                                                        opacity: 0.8
                                                                    }}>
                                                                        {isBaseEx ? (langIndex===0 ? 'База' : 'Base') : (langIndex===0 ? 'Изол' : 'Iso')}
                                                                    </div>
                                                                </div>

                                                                {needToAdd && (
                                                                    <motion.div whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); setEx(exId); }} style={{ padding: '8px' }}>
                                                                        <FaPlus style={{ color: Colors.get('currentDateBorder', theme), fontSize: '18px' }} />
                                                                    </motion.div>
                                                                )}
                                                                
                                                                <motion.div animate={{ rotate: isExSelected ? 180 : 0 }}>
                                                                    <IoIosArrowDown style={{ ...styles(theme).icon, fontSize: '14px' }} />
                                                                </motion.div>
                                                            </motion.div>

                                                            {/* Exercise Description / Actions */}
                                                            <AnimatePresence>
                                                                {isExSelected && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        style={{ padding: '0 20px 10px 20px' }}
                                                                    >
                                                                        <p style={styles(theme, false, false, fSize).subtext}>{exercise.description[langIndex]}</p>
                                                                        
                                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', gap: '15px' }}>
                                                                            <AnimatePresence>
                                                                                {showAddOptions && (
                                                                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', gap: '15px' }}>
                                                                                        <FaPencilAlt onClick={(e) => { e.stopPropagation(); setCurrentExerciseName(exercise.name[langIndex]); onRedaktStart(); }} style={{ color: Colors.get('subText', theme), fontSize: '16px' }} />
                                                                                        <FaTrash onClick={(e) => { e.stopPropagation(); setCurrentExerciseName(exercise.name[langIndex]); setShowConfirmRemove(true); }} style={{ color: '#ff4d4d', fontSize: '16px' }} />
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>
                                                                            <TbDotsVertical onClick={(e) => { e.stopPropagation(); setShowAddOptions(!showAddOptions); }} style={{ color: Colors.get('icons', theme), fontSize: '20px' }} />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            
                                            {/* Add Button inside Muscle Group (Only show if no search term for clean UX, or keep it) */}
                                            {!searchTerm && (
                                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '15px' }}>
                                                    <motion.button
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => { playEffects(null); setAddPanel('AddExercisePanel'); }}
                                                        style={styles(theme).fab}
                                                    >
                                                        <FaPlus style={{ fontSize: '14px', color: '#fff' }} />
                                                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{langIndex === 0 ? 'Создать' : 'Create'}</span>
                                                    </motion.button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            {/* MODAL: ADD / EDIT EXERCISE (Constructor) */}
            <AnimatePresence>
                {(addPanel === 'AddExercisePanel' || showRedakt) && (
                    <div style={styles(theme).modalBackdrop}>
                        <motion.div
                            variants={modalVariants}
                            initial="hidden" animate="visible" exit="exit"
                            style={styles(theme).modalContainer}
                        >
                            <div style={styles(theme).modalHeader}>
                                <h3 style={styles(theme, false, false, fSize).headerText}>{langIndex === 0 ? (showRedakt ? 'Редактор' : 'Конструктор') : (showRedakt ? 'Editor' : 'Constructor')}</h3>
                            </div>

                            <div style={{ width: '100%', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                                {/* INPUTS */}
                                <input 
                    type="text" 
                    placeholder={langIndex === 0 ? 'Название' : 'Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
                />
                <input 
                    type="text" 
                    placeholder={langIndex === 0 ? 'Описание' : 'Description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
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
                                                <motion.div
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
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Actions */}
                            <div style={styles(theme).modalActions}>
                                <motion.div whileTap={{ scale: 0.9 }} onClick={() => showRedakt ? setShowRedakt(false) : onClose()} style={styles(theme).circleBtn}>
                                    <MdClose style={{ fontSize: '24px', color: Colors.get('subText', theme) }} />
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.9 }} onClick={() => showRedakt ? onRedakt() : onAdd()} style={{ ...styles(theme).circleBtn, backgroundColor: Colors.get('done', theme) }}>
                                    <MdDone style={{ fontSize: '24px', color: '#fff' }} />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Confirm Remove Modal */}
                {showConfirmRemove && (
                    <div style={styles(theme).modalBackdrop}>
                        <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" style={{ ...styles(theme).modalContainer, height: 'auto', padding: '25px', maxHeight:'300px' }}>
                            <p style={{ ...styles(theme, false, false, fSize).text, textAlign: 'center', marginBottom: '25px' }}>
                                {langIndex === 0 ? `Удалить ${currentExerciseName}?` : `Delete ${currentExerciseName}?`}
                            </p>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowConfirmRemove(false)} style={styles(theme).secondaryBtn}>{langIndex === 0 ? "Нет" : "Cancel"}</motion.button>
                                <motion.button whileTap={{ scale: 0.95 }} onClick={() => onRemove()} style={styles(theme).dangerBtn}>{langIndex === 0 ? "Удалить" : "Delete"}</motion.button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TrainingExercise

const styles = (theme, isCurrentGroup, isCurrentExercise, fSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex", flexDirection: "column",
        overflow: 'hidden', alignItems: "center",
        height: "100vh", paddingTop: '120px', width: "100vw",
        fontFamily: "Segoe UI, Roboto, sans-serif", boxSizing: 'border-box'
    },
    // SEARCH
    searchContainer: {
        width: '94%', maxWidth: '600px',marginTop:'25px',
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
        borderRadius: '12px', display: 'flex', alignItems: 'center',
        padding: '8px 0', marginBottom: '10px'
    },
    searchInput: {
        flex: 1, border: 'none', background: 'transparent',
        fontSize: '15px', color: Colors.get('mainText', theme),
        marginLeft: '8px', outline: 'none'
    },
    // CARDS
    card: {
        width: '94%', margin: '0 auto 12px auto',
        borderRadius: '16px', overflow: 'hidden',
        boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
    },
    groupHeader: {
        display: 'flex', flexDirection: 'row',
        padding: '12px 10px', alignItems: "center", justifyContent: "space-between",
        cursor: 'pointer'
    },
    exerciseRow: {
        display: 'flex', flexDirection: 'row',width:'92%',
        padding: '12px 20px', alignItems: "center", justifyContent: "space-between",
        cursor: 'pointer', borderRadius: '12px', margin: '0 10px'
    },
    icon: {
        fontSize: "20px", color: Colors.get('icons', theme), marginRight: '10px'
    },
    text: {
        fontSize: fSize === 0 ? "15px" : '17px',
        color: Colors.get('mainText', theme), fontWeight: '500', margin: 0
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
        display: 'flex', width: '98%', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
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
        backgroundColor: Colors.get('difficulty', theme),
        border: 'none', borderRadius: '20px', padding: '8px 20px',
        display: 'flex', alignItems: 'center', gap: '8px',
        color: '#fff', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
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
})

function playEffects(sound) {
    if (AppData.prefs[2] == 0 && sound !== null) {
        if (!sound.paused) { sound.pause(); sound.currentTime = 0; }
        sound.volume = 0.5; sound.play();
    }
    if (AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback) Telegram.WebApp.HapticFeedback.impactOccurred('light');
}
const capitalizeName = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};