import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import Icons from "../../StaticClasses/Icons";
import ScrollPicker from "../../Helpers/ScrollPicker";
import { addPanel$, setAddPanel, setShowPopUpPanel } from '../../StaticClasses/HabitsBus.js';
import { createGoal } from "./ToDoHelper";
import { FaCalendarDay, FaClock, FaPlus, FaTimes, FaTag } from 'react-icons/fa';

// --- Configuration ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not Urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very Urgent'], ['ASAP', 'ASAP']];

// Defined Categories with Icons and Labels [Russian, English]
const CATEGORIES = [
    { icon: '📝', label: ['Общее', 'General'] },
    { icon: '💼', label: ['Работа', 'Work'] },
    { icon: '🏠', label: ['Дом', 'Home'] },
    { icon: '💪', label: ['Здоровье', 'Health'] },
    { icon: '🛒', label: ['Покупки', 'Shopping'] },
    { icon: '🎓', label: ['Учеба', 'Study'] },
    { icon: '✈️', label: ['Путешествия', 'Trip'] },
    { icon: '💰', label: ['Финансы', 'Finance'] },
    { icon: '🎨', label: ['Хобби', 'Hobby'] },
    { icon: '💻', label: ['Код', 'Coding'] },
];

const ToDoNew = ({ theme, lang, fSize }) => {
    const [show, setShow] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');

    // Pickers State
    const [priority, setPriority] = useState(PRIORITY_LABELS[1][lang]);
    const [difficulty, setDifficulty] = useState(DIFFICULTY_LABELS[2][lang]);
    const [urgency, setUrgency] = useState(URGENCY_LABELS[1][lang]);
    
    // Category State (Stores index of CATEGORIES array)
    const [selectedCatIndex, setSelectedCatIndex] = useState(0);

    // Dates State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [deadLine, setDeadLine] = useState('');

    // Subgoals
    const [subGoals, setSubGoals] = useState([]);
    const [newSubGoal, setNewSubGoal] = useState('');

    useEffect(() => {
        const sub = addPanel$.subscribe(val => setShow(val === 'ToDoNew'));
        return () => sub.unsubscribe();
    }, []);

    // --- Actions ---

    const handleSave = async () => {
        if (!name.trim()) {
            setShowPopUpPanel(lang === 0 ? 'Введите название' : 'Enter name', 2000, false);
            return;
        }

        // Find Indexes for storage
        const pIdx = PRIORITY_LABELS.findIndex(l => l.includes(priority));
        const dIdx = DIFFICULTY_LABELS.findIndex(l => l.includes(difficulty));
        const uIdx = URGENCY_LABELS.findIndex(l => l.includes(urgency));

        // Get selected category data
        const currentCat = CATEGORIES[selectedCatIndex];
        const categoryName = currentCat.label[1]; // Always save English name or ID for consistency
        const categoryIcon = currentCat.icon;

        await createGoal(
            name,
            desc,
            dIdx,
            pIdx,
            categoryName, // Dynamic Category
            categoryIcon, // Dynamic Icon
            startDate,
            deadLine,
            subGoals,
            uIdx
        );
        closePanel();
    };

    const closePanel = () => {
        setAddPanel(null);
        setTimeout(() => {
            setName(''); setDesc(''); setSubGoals([]); setNewSubGoal('');
            setPriority(PRIORITY_LABELS[1][lang]);
            setDifficulty(DIFFICULTY_LABELS[2][lang]);
            setUrgency(URGENCY_LABELS[1][lang]);
            setStartDate(new Date().toISOString().split('T')[0]);
            setDeadLine('');
            setSelectedCatIndex(0);
        }, 300);
    };

    const addSubGoalLocal = () => {
        if (!newSubGoal.trim()) return;
        setSubGoals([...subGoals, { text: newSubGoal, isDone: false }]);
        setNewSubGoal('');
    };

    // --- Styles & UI Helpers ---
    const s = styles(theme);

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Backdrop */}
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
                            <motion.button whileTap={{ scale: 0.9 }} onClick={handleSave} style={{ ...s.textBtn, color: Colors.get('done', theme), fontWeight: '700' }}>
                                {lang === 0 ? 'Создать' : 'Create'}
                            </motion.button>
                        </div>

                        {/* Scrollable Content */}
                        <div style={s.scrollContent} className="no-scrollbar">

                            {/* 1. Main Input Section */}
                            <div style={s.section}>
                                <div style={s.mainInputWrapper}>
                                    {/* Display Selected Icon Large */}
                                    <div style={s.largeIconDisplay}>
                                        {CATEGORIES[selectedCatIndex].icon}
                                    </div>
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
                                        <input
                                            type="text"
                                            placeholder={lang === 0 ? "Название цели..." : "Goal Title..."}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            style={s.mainInput}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Categories Picker (Horizontal Scroll) */}
                            <div style={s.categorySection}>
                                <div style={{display:'flex', alignItems:'center', marginBottom: 8, paddingLeft: 5}}>
                                    <FaTag size={12} color={Colors.get('subText', theme)} style={{marginRight: 6}}/>
                                    <label style={s.label}>{lang === 0 ? 'Категория' : 'Category'}</label>
                                </div>
                                <div style={s.iconScrollContainer}>
                                    {CATEGORIES.map((cat, i) => {
                                        const isSelected = i === selectedCatIndex;
                                        return (
                                            <motion.div
                                                key={i}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setSelectedCatIndex(i)}
                                                style={{
                                                    ...s.categoryChip,
                                                    backgroundColor: isSelected ? Colors.get('highlitedPanel', theme) : 'transparent',
                                                    borderColor: isSelected ? 'transparent' : Colors.get('border', theme),
                                                }}
                                            >
                                                <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                                                {isSelected && (
                                                    <motion.span 
                                                        initial={{opacity:0, width: 0}} 
                                                        animate={{opacity:1, width: 'auto'}} 
                                                        style={s.categoryLabel}
                                                    >
                                                        {cat.label[lang]}
                                                    </motion.span>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* 3. Settings Card (Priority, Difficulty, Urgency) */}
                            <div style={s.card}>
                                <div style={s.pickerRow}>
                                    {/* Priority */}
                                    <div style={s.pickerCol}>
                                        <label style={s.label}>{lang === 0 ? 'Приоритет' : 'Priority'}</label>
                                        <ScrollPicker
                                            items={PRIORITY_LABELS.map(l => l[lang])}
                                            value={priority} onChange={setPriority}
                                            theme={theme} width="100%"
                                        />
                                    </div>
                                    <div style={s.divider} />

                                    {/* Difficulty */}
                                    <div style={s.pickerCol}>
                                        <label style={s.label}>{lang === 0 ? 'Сложность' : 'Difficulty'}</label>
                                        <ScrollPicker
                                            items={DIFFICULTY_LABELS.map(l => l[lang])}
                                            value={difficulty} onChange={setDifficulty}
                                            theme={theme} width="100%"
                                        />
                                    </div>
                                    <div style={s.divider} />

                                    {/* Urgency */}
                                    <div style={s.pickerCol}>
                                        <label style={s.label}>{lang === 0 ? 'Срочность' : 'Urgency'}</label>
                                        <ScrollPicker
                                            items={URGENCY_LABELS.map(l => l[lang])}
                                            value={urgency} onChange={setUrgency}
                                            theme={theme} width="100%"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 4. Dates Section */}
                            <div style={s.dateSection}>
                                {/* Start Date */}
                                <div style={s.dateCard}>
                                    <div style={s.dateRow}>
                                        <FaCalendarDay style={{ marginRight: 10, color: Colors.get('subText', theme) }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <span style={s.label}>{lang === 0 ? 'Старт' : 'Start'}</span>
                                            <input
                                                type="date"
                                                style={s.dateInput}
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                                {/* Deadline */}
                                <div style={s.dateCard}>
                                    <div style={s.dateRow}>
                                        <FaClock style={{ marginRight: 10, color: Colors.get('subText', theme) }} />
                                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <span style={s.label}>{lang === 0 ? 'Срок' : 'Deadline'}</span>
                                            <input
                                                type="date"
                                                style={s.dateInput}
                                                value={deadLine}
                                                onChange={(e) => setDeadLine(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 5. Description */}
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12 }}>
                                <input
                                    type="text"
                                    placeholder={lang === 0 ? "Заметки / Описание..." : "Notes / Description..."}
                                    value={desc}
                                    onChange={(e) => setDesc(e.target.value)}
                                    style={s.mainInput}
                                />
                            </div>

                            {/* 6. Subtasks */}
                            <div style={s.subTaskContainer}>
                                <label style={s.sectionTitle}>{lang === 0 ? 'Чек-лист' : 'Checklist'}</label>

                                <div style={s.addSubRow}>
                                    <div style={s.subInputContainer}>
                                        <input
                                            type="text"
                                            placeholder={lang === 0 ? "Добавить шаг..." : "Add a step..."}
                                            value={newSubGoal}
                                            onChange={(e) => setNewSubGoal(e.target.value)}
                                            style={s.subInput}
                                        />
                                    </div>
                                    <motion.div
                                        whileTap={{ scale: 0.9 }}
                                        onClick={addSubGoalLocal}
                                        style={s.addBtn}
                                    >
                                        <FaPlus style={{ width: '100%', color: '#fff' }} />
                                    </motion.div>
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
                                                    <FaTimes style={{ width: '100%', color: Colors.get('subText', theme), cursor: 'pointer' }} />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Bottom Spacer */}
                            <div style={{ marginBottom: '100px' }}></div>
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
    const border = Colors.get('border', theme);

    return {
        backdrop: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(5px)',
            zIndex: 998
        },
        container: {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '90vh',
            backgroundColor: bg,
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
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
        
        // Inputs
        mainInputWrapper: {
            display: 'flex', alignItems: 'center', gap: '15px'
        },
        largeIconDisplay: {
            fontSize: '2.5rem',
            width: '50px',
            textAlign: 'center'
        },
        mainInput: {
            flex: 1, border: 'none', background: 'transparent', fontSize: '16px', textSizeAdjust: '100%', webkitTextSizeAdjust: '100%',
            color: text, WebkitUserSelect: 'auto',
            outline: `1px solid ${border}`, 
            borderRadius: '16px', padding: '14px',
            width: '100%'
        },

        // Category Picker
        categorySection: {
            marginBottom: '20px'
        },
        iconScrollContainer: {
            display: 'flex', gap: '10px', overflowX: 'auto', padding: '2px 2px 10px 2px',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
        },
        categoryChip: {
            padding: '8px 16px',
            borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            cursor: 'pointer',
            border: `1px solid ${border}`,
            minWidth: '60px',
            whiteSpace: 'nowrap'
        },
        categoryLabel: {
            fontSize: '13px', fontWeight: '600', color: text, marginLeft: '4px'
        },

        // Settings Card
        card: {
            backgroundColor: panel,
            borderRadius: '20px',
            padding: '15px',
            boxShadow: Colors.get('shadow', theme),
            marginBottom: '20px'
        },
        pickerRow: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        },
        pickerCol: {
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'
        },
        divider: {
            width: '1px', height: '60px', backgroundColor: border, margin: '0 5px'
        },
        label: {
            fontSize: '11px', color: subText, fontWeight: '700', 
            marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px'
        },

        // Date Section
        dateSection: {
            display: 'flex', gap: '12px', marginBottom: '20px'
        },
        dateCard: {
            flex: 1, backgroundColor: panel, borderRadius: '16px', padding: '12px',
            border: `1px solid ${border}`, display: 'flex', alignItems: 'center'
        },
        dateRow: {
            display: 'flex', alignItems: 'center', width: '100%'
        },
        dateInput: {
            background: 'transparent', border: 'none', color: text, fontSize: '14px',
            width: '100%', outline: 'none', fontFamily: 'inherit', fontWeight: '600'
        },

        // Subtasks
        subTaskContainer: { marginTop: '30px' },
        sectionTitle: { fontSize: '16px', fontWeight: '700', color: text, marginLeft: '5px', marginBottom: '10px', display: 'block' },
        addSubRow: { display: 'flex', alignItems: 'center', gap: '10px' },
        subInputContainer: {
            flex: 1, display: 'flex', flexDirection: 'column',
            border: `2px dashed ${border}`,
            borderRadius: '16px', padding: '12px',
            marginTop: '10px'
        },
        subInput: {
             border: 'none', background: 'transparent', fontSize: '16px', color: text, outline: 'none', width: '100%',textSizeAdjust: '100%',webkitTextSizeAdjust: '100%',WebkitUserSelect: 'auto'
        },
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
            width: '6px', height: '6px', borderRadius: '50%', backgroundColor: subText, marginRight: '12px'
        },
        subText: { flex: 1, fontSize: '15px', color: text }
    };
};