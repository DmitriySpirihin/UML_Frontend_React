import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import MyInput from "../../Helpers/MyInput";
import Icons from "../../StaticClasses/Icons";
import ScrollPicker from "../../Helpers/ScrollPicker";
import { addPanel$, setAddPanel } from '../../StaticClasses/HabitsBus.js';
import { createGoal } from "./ToDoHelper";

// --- Configuration ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];

const CATEGORY_ICONS = ['📝', '💼', '🏠', '💪', '🛒', '🎓', '✈️', '💰', '🎨', '💻'];

const ToDoNew = ({ theme, lang, fSize }) => {
    const [show, setShow] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [priority, setPriority] = useState(PRIORITY_LABELS[1][lang]);
    const [difficulty, setDifficulty] = useState(DIFFICULTY_LABELS[2][lang]);
    const [selectedIcon, setSelectedIcon] = useState(CATEGORY_ICONS[0]);
    
    // Subgoals
    const [subGoals, setSubGoals] = useState([]);
    const [newSubGoal, setNewSubGoal] = useState('');
    const subGoalInputRef = useRef(null);

    useEffect(() => {
        const sub = addPanel$.subscribe(val => setShow(val === 'ToDoNew'));
        return () => sub.unsubscribe();
    }, []);

    // --- Actions ---

    const handleSave = async () => {
        if (!name.trim()) return; // Simple validation

        const pIdx = PRIORITY_LABELS.findIndex(l => l.includes(priority));
        const dIdx = DIFFICULTY_LABELS.findIndex(l => l.includes(difficulty));
        const today = new Date().toISOString().split('T')[0];

        await createGoal(
            name, desc, dIdx, pIdx, 
            'General', // You could expand this to a category picker later
            selectedIcon, 
            Colors.get('areaChart', theme), // Default accent color
            today, null, subGoals, ''
        );
        closePanel();
    };

    const closePanel = () => {
        setAddPanel(null);
        // Reset state after a small delay for smooth exit
        setTimeout(() => {
            setName(''); setDesc(''); setSubGoals([]); setNewSubGoal('');
            setPriority(PRIORITY_LABELS[1][lang]);
        }, 300);
    };

    const addSubGoalLocal = () => {
        if (!newSubGoal.trim()) return;
        setSubGoals([...subGoals, { text: newSubGoal, isDone: false }]);
        setNewSubGoal('');
    };

    // --- Styles & UI Helpers ---
    const s = styles(theme);
    const isDark = theme !== 'light';

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop Blur */}
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closePanel}
                        style={s.backdrop}
                    />

                    {/* Main Sheet */}
                    <motion.div 
                        initial={{ y: '100%' }} 
                        animate={{ y: 0 }} 
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 250 }}
                        style={s.container}
                    >
                        {/* Drag Handle */}
                        <div style={s.handleContainer}>
                            <div style={s.handle} />
                        </div>

                        {/* Header Actions */}
                        <div style={s.header}>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={closePanel} style={s.textBtn}>
                                {lang === 0 ? 'Отмена' : 'Cancel'}
                            </motion.button>
                            <span style={s.headerTitle}>{lang === 0 ? 'Новая цель' : 'New Goal'}</span>
                            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} style={{...s.textBtn, color: Colors.get('done', theme), fontWeight: '700'}}>
                                {lang === 0 ? 'Создать' : 'Create'}
                            </motion.button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={s.scrollContent} className="no-scrollbar">
                            
                            {/* 1. Main Input Section */}
                            <div style={s.section}>
                                <div style={s.mainInputWrapper}>
                                    <span style={{fontSize: '2rem', marginRight: '10px'}}>{selectedIcon}</span>
                                    <div style={{flex: 1}}>
                                        <MyInput 
                                            placeHolder={lang === 0 ? "Название цели..." : "Goal Title..."} 
                                            value={name} onChange={setName} theme={theme} 
                                            w="100%" h="auto" 
                                            // Custom style injection if MyInput supports it, otherwise generic wrapper handles it
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Icon Picker (Horizontal Scroll) */}
                            <div style={s.iconScrollContainer}>
                                {CATEGORY_ICONS.map((icon, i) => (
                                    <motion.div 
                                        key={i} 
                                        whileTap={{ scale: 0.8 }}
                                        onClick={() => setSelectedIcon(icon)}
                                        style={{
                                            ...s.iconChip,
                                            backgroundColor: icon === selectedIcon ? Colors.get('iconsHighlited', theme) : 'transparent',
                                            border: icon === selectedIcon ? 'none' : `1px solid ${Colors.get('border', theme)}`
                                        }}
                                    >
                                        <span style={{ fontSize: '1.2rem', filter: icon === selectedIcon ? 'grayscale(0)' : 'grayscale(100%) opacity(0.7)' }}>
                                            {icon}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* 3. Settings Card (Priority & Difficulty) */}
                            <div style={s.card}>
                                <div style={s.pickerRow}>
                                    <div style={s.pickerCol}>
                                        <label style={s.label}>{lang === 0 ? 'Приоритет' : 'Priority'}</label>
                                        <ScrollPicker 
                                            items={PRIORITY_LABELS.map(l => l[lang])} 
                                            value={priority} onChange={setPriority} 
                                            theme={theme} width="100%" 
                                        />
                                    </div>
                                    <div style={s.divider} />
                                    <div style={s.pickerCol}>
                                        <label style={s.label}>{lang === 0 ? 'Сложность' : 'Difficulty'}</label>
                                        <ScrollPicker 
                                            items={DIFFICULTY_LABELS.map(l => l[lang])} 
                                            value={difficulty} onChange={setDifficulty} 
                                            theme={theme} width="100%" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Description */}
                            <div style={{ marginTop: '20px' }}>
                                <MyInput 
                                    placeHolder={lang === 0 ? "Заметки / Описание..." : "Notes / Description..."} 
                                    value={desc} onChange={setDesc} theme={theme}
                                />
                            </div>

                            {/* 5. Subtasks */}
                            <div style={s.subTaskContainer}>
                                <label style={s.sectionTitle}>{lang === 0 ? 'Чек-лист' : 'Checklist'}</label>
                                
                                <div style={s.addSubRow}>
                                    <div style={{flex: 1}}>
                                        <MyInput 
                                            placeHolder={lang === 0 ? "Добавить шаг..." : "Add a step..."}
                                            value={newSubGoal} onChange={setNewSubGoal} theme={theme}
                                        />
                                    </div>
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }} 
                                        onClick={addSubGoalLocal}
                                        style={s.addBtn}
                                    >
                                        {Icons.getIcon('add', { style: { color: '#FFF', fontSize: '1.5rem' } })}
                                    </motion.button>
                                </div>

                                <div style={s.subList}>
                                    <AnimatePresence>
                                        {subGoals.map((sg, i) => (
                                            <motion.div 
                                                key={i}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0, padding: 0 }}
                                                style={s.subItem}
                                            >
                                                <div style={s.subDot} />
                                                <span style={s.subText}>{sg.text}</span>
                                                <div onClick={() => setSubGoals(subGoals.filter((_, idx) => idx !== i))}>
                                                    {Icons.getIcon('close', { style: { fontSize: '1rem', color: Colors.get('skipped', theme) } })}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                            
                            {/* Bottom Spacer for safe area */}
                            <div style={{marginBottom:'300px'}}></div>
                        </div>
                        
                    </motion.div>
                    
                </>
            )}
        </AnimatePresence>
    );
};

export default ToDoNew;

// --- Modern Styling ---
const styles = (theme) => {
    const bg = Colors.get('background', theme);
    const panel = Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);
    
    return {
        backdrop: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
        },
        container: {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '85vh',
            backgroundColor: bg,
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.1)',
            zIndex: 999,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden'
        },
        handleContainer: {
            width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '12px', paddingBottom: '8px'
        },
        handle: {
            width: '40px', height: '5px', borderRadius: '3px', backgroundColor: Colors.get('border', theme)
        },
        header: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 20px 15px 20px',
            borderBottom: `1px solid ${Colors.get('svgColor', theme)}`
        },
        textBtn: {
            background: 'none', border: 'none', fontSize: '16px', color: subText, cursor: 'pointer', padding: '10px'
        },
        headerTitle: {
            fontSize: '18px', fontWeight: '700', color: text
        },
        scrollContent: {
            flex: 1, overflowY: 'auto', padding: '20px'
        },
        section: { marginBottom: '20px' },
        mainInputWrapper: {
            display: 'flex', alignItems: 'center'
        },
        
        // Icon Picker
        iconScrollContainer: {
            display: 'flex', gap: '12px', overflowX: 'auto', padding: '5px 5px 15px 5px',
            scrollbarWidth: 'none'
        },
        iconChip: {
            width: '45px', height: '45px', minWidth: '45px',
            borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
        },

        // Settings Card
        card: {
            backgroundColor: panel,
            borderRadius: '20px',
            padding: '15px',
            boxShadow: Colors.get('shadow', theme)
        },
        pickerRow: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        pickerCol: {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        divider: {
            width: '1px', height: '60px', backgroundColor: Colors.get('border', theme), margin: '0 10px'
        },
        label: {
            fontSize: '13px', color: subText, fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'
        },

        // Subtasks
        subTaskContainer: { marginTop: '30px' },
        sectionTitle: { fontSize: '16px', fontWeight: '700', color: text, marginLeft: '5px', marginBottom: '10px', display: 'block' },
        addSubRow: { display: 'flex', alignItems: 'center', gap: '10px' },
        addBtn: {
            width: '46px', height: '46px', borderRadius: '14px',
            backgroundColor: Colors.get('done', theme),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', marginTop: '10px', cursor: 'pointer',
            boxShadow: `0 4px 12px ${Colors.get('habitCardDone', theme)}`
        },
        subList: { marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px' },
        subItem: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', backgroundColor: panel, borderRadius: '12px'
        },
        subDot: {
            width: '6px', height: '6px', borderRadius: '50%', backgroundColor: Colors.get('subText', theme), marginRight: '12px'
        },
        subText: { flex: 1, fontSize: '15px', color: text }
    };
};
