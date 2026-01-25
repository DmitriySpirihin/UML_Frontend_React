import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { 
    FaCheck, FaCalendarDay, FaFlag, FaTimes, FaClock, FaChevronDown,
    FaTasks, FaLayerGroup, FaTrash, FaPen, FaSave, FaPlus
} from "react-icons/fa";
import { 
    redactGoal, deleteGoal, toggleGoal, toggleSubGoal, 
    deleteSubGoal, addSubGoal, redactSubGoal 
} from "./ToDoHelper";

// --- CONSTANTS ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336']; 
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];

const ToDoPage = ({ show, setShow, theme, lang, fSize, task: initialTask }) => {
    // Local state to handle optimistic updates and editing
    const [task, setTask] = useState(initialTask || {});
    const [isEditing, setIsEditing] = useState(false);
    const [newSubGoalText, setNewSubGoalText] = useState('');
    
    // Sync props to state when modal opens or task changes externally
    useEffect(() => {
        if(initialTask) setTask(initialTask);
    }, [initialTask]);

    // Derived States
    const totalGoals = task.goals?.length || 0;
    const completedGoals = task.goals?.filter(g => g.isDone).length || 0;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);
    const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[0];
    const difficultyColor = DIFFICULTY_COLORS[task.difficulty] || DIFFICULTY_COLORS[0];

    // --- HANDLERS ---

    const handleToggleMain = async () => {
        setTask(prev => ({ ...prev, isDone: !prev.isDone })); // Optimistic
        await toggleGoal(task.id);
    };

    const handleDeleteMain = async () => {
        if (window.confirm(lang === 0 ? "Удалить эту цель?" : "Delete this goal?")) {
            await deleteGoal(task.id);
            setShow(false);
        }
    };

    const handleSaveEdit = async () => {
        await redactGoal(
            task.id, task.name, task.description, task.difficulty, task.priority,
            task.category, task.icon, task.color, task.startDate, task.deadLine, task.note
        );
        setIsEditing(false);
    };

    // Sub-goal Handlers
    const handleToggleSub = async (index) => {
        const newGoals = [...task.goals];
        newGoals[index].isDone = !newGoals[index].isDone;
        setTask(prev => ({ ...prev, goals: newGoals })); // Optimistic
        await toggleSubGoal(task.id, index);
    };

    const handleDeleteSub = async (index) => {
        const newGoals = task.goals.filter((_, i) => i !== index);
        setTask(prev => ({ ...prev, goals: newGoals })); // Optimistic
        await deleteSubGoal(task.id, index);
    };

    const handleAddSub = async () => {
        if (!newSubGoalText.trim()) return;
        
        const newItem = { text: newSubGoalText, isDone: false };
        setTask(prev => ({ ...prev, goals: [...(prev.goals || []), newItem] })); // Optimistic
        
        await addSubGoal(task.id, newSubGoalText);
        setNewSubGoalText('');
    };

    // --- RENDER HELPERS ---
    
    const closeModal = () => {
        setIsEditing(false);
        setShow(false);
    };

    const s = styles(theme, fSize, task.color);

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeModal} style={s.backdrop}
                    />

                    <motion.div
                        initial={{ y: "100%" }} 
                        animate={{ y: "0%" }} 
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        style={s.modalContainer}
                    >
                        {/* Drag Handle */}
                        <div style={s.dragArea} onClick={closeModal}>
                            <div style={s.dragHandle} />
                        </div>

                        {/* --- TOOLBAR --- */}
                        <div style={s.toolbar}>
                            <div style={s.toolbarLeft}>
                                <button onClick={handleDeleteMain} style={s.iconBtnRed}>
                                    <FaTrash size={16} />
                                </button>
                            </div>
                            <div style={s.toolbarRight}>
                                {isEditing ? (
                                    <button onClick={handleSaveEdit} style={s.saveBtn}>
                                        <FaSave size={16} style={{marginRight: 6}}/> {lang === 0 ? 'Сохранить' : 'Save'}
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} style={s.iconBtn}>
                                        <FaPen size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={s.scrollableContent} className="no-scrollbar">
                            
                            {/* --- HEADER SECTION --- */}
                            <div style={s.headerWrapper}>
                                <div style={s.headerTopRow}>
                                    <div style={s.iconBadge}>
                                        {task.icon}
                                    </div>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleToggleMain}
                                        style={s.statusBadge(task.isDone)}
                                    >
                                        {task.isDone ? (lang === 0 ? 'ВЫПОЛНЕНО' : 'COMPLETED') : (lang === 0 ? 'В ПРОЦЕССЕ' : 'IN PROGRESS')}
                                    </motion.button>
                                </div>

                                {isEditing ? (
                                    <input 
                                        style={s.titleInput} 
                                        value={task.name} 
                                        onChange={(e) => setTask({...task, name: e.target.value})}
                                        placeholder="Goal Title"
                                    />
                                ) : (
                                    <h2 style={s.title}>{task.name}</h2>
                                )}

                                {/* Progress Bar */}
                                <div style={s.progressContainer}>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                                        <span style={s.progressText}>{progressPercent}%</span>
                                    </div>
                                    <div style={s.progressBarBg}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            style={s.progressBarFill} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* --- BODY --- */}
                            <div style={s.bodyPadding}>

                                {/* Priority & Difficulty Selectors */}
                                <div style={s.gridTwo}>
                                    {isEditing ? (
                                        <>
                                            <select style={s.selectInput} value={task.priority} onChange={(e) => setTask({...task, priority: parseInt(e.target.value)})}>
                                                {PRIORITY_LABELS.map((l, i) => <option key={i} value={i}>{l[lang]}</option>)}
                                            </select>
                                            <select style={s.selectInput} value={task.difficulty} onChange={(e) => setTask({...task, difficulty: parseInt(e.target.value)})}>
                                                {DIFFICULTY_LABELS.map((l, i) => <option key={i} value={i}>{l[lang]}</option>)}
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <Badge icon={<FaFlag/>} label={lang===0?'Приоритет':'Priority'} value={PRIORITY_LABELS[task.priority][lang]} color={priorityColor} theme={theme} />
                                            <Badge icon={<FaLayerGroup/>} label={lang===0?'Сложность':'Difficulty'} value={DIFFICULTY_LABELS[task.difficulty][lang]} color={difficultyColor} theme={theme} />
                                        </>
                                    )}
                                </div>

                                {/* Description */}
                                <div style={s.sectionBox}>
                                    {isEditing ? (
                                        <textarea 
                                            style={s.textArea} 
                                            value={task.description} 
                                            onChange={(e) => setTask({...task, description: e.target.value})}
                                            placeholder="Description..."
                                            rows={3}
                                        />
                                    ) : (
                                        <p style={s.description}>{task.description || (lang === 0 ? "Нет описания" : "No description")}</p>
                                    )}
                                </div>

                                {/* Dates (Simple View/Edit) */}
                                <div style={s.dateRow}>
                                    <div style={s.dateItem}>
                                        <FaCalendarDay style={{marginRight: 8, color: Colors.get('subText', theme)}}/>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <span style={s.label}>{lang===0?'Старт':'Start'}</span>
                                            {isEditing ? (
                                                <input type="date" style={s.dateInput} value={task.startDate} onChange={(e) => setTask({...task, startDate: e.target.value})} />
                                            ) : (
                                                <span style={s.dateValue}>{task.startDate}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={s.dateItem}>
                                        <FaClock style={{marginRight: 8, color: Colors.get('subText', theme)}}/>
                                        <div style={{display:'flex', flexDirection:'column'}}>
                                            <span style={s.label}>{lang===0?'Срок':'Deadline'}</span>
                                            {isEditing ? (
                                                <input type="date" style={s.dateInput} value={task.deadLine || ''} onChange={(e) => setTask({...task, deadLine: e.target.value})} />
                                            ) : (
                                                <span style={s.dateValue}>{task.deadLine || '-'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* --- CHECKLIST SECTION --- */}
                                <div style={{ marginTop: '30px' }}>
                                    <div style={s.sectionHeader}>
                                        <FaTasks style={{ marginRight: '8px', color: task.color }} />
                                        {lang === 0 ? 'Чек-лист' : 'Checklist'} 
                                        <span style={s.counterBadge}>{completedGoals}/{totalGoals}</span>
                                    </div>

                                    <div style={s.goalsContainer}>
                                        <AnimatePresence>
                                            {task.goals?.map((goal, idx) => (
                                                <motion.div 
                                                    key={idx} 
                                                    initial={{ opacity: 0, height: 0 }} 
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    style={s.goalRow}
                                                >
                                                    <div onClick={() => handleToggleSub(idx)} style={s.checkbox(goal.isDone)}>
                                                        {goal.isDone && <FaCheck size={10} color="#fff" />}
                                                    </div>
                                                    <div style={s.goalText(goal.isDone)} onClick={() => handleToggleSub(idx)}>
                                                        {goal.text}
                                                    </div>
                                                    <div onClick={() => handleDeleteSub(idx)} style={s.deleteSubBtn}>
                                                        <FaTimes />
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {/* Add Sub Goal Input */}
                                        <div style={s.addSubRow}>
                                            <FaPlus style={{color: Colors.get('subText', theme), marginRight: 10}} />
                                            <input 
                                                style={s.addSubInput} 
                                                placeholder={lang===0 ? "Добавить задачу..." : "Add item..."}
                                                value={newSubGoalText}
                                                onChange={(e) => setNewSubGoalText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                                            />
                                            {newSubGoalText.length > 0 && (
                                                <button onClick={handleAddSub} style={s.addSubBtn}>OK</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ height: '80px' }} />
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Sub-component for badges
const Badge = ({ icon, label, value, color, theme }) => (
    <div style={{...styles(theme).modernBadge, backgroundColor: `${color}15`, border: `1px solid ${color}30`}}>
        <div style={styles(theme).badgeLabel}>{icon} <span style={{marginLeft: 6}}>{label}</span></div>
        <div style={{...styles(theme).badgeValue, color: color}}>{value}</div>
    </div>
);

export default ToDoPage;

const styles = (theme, fSize, accentColor) => {
    const bg = Colors.get('background', theme);
    const panel = Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = Colors.get('border', theme);

    return {
        backdrop: {
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(5px)', zIndex: 1999
        },
        modalContainer: {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            height: '85vh', backgroundColor: bg,
            borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
            zIndex: 2000, display: 'flex', flexDirection: 'column',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.3)', overflow: 'hidden'
        },
        dragArea: {
            width: '100%', padding: '12px 0', display: 'flex', justifyContent: 'center', cursor: 'grab'
        },
        dragHandle: {
            width: '40px', height: '4px', backgroundColor: border, borderRadius: '10px'
        },
        toolbar: {
            display: 'flex', justifyContent: 'space-between', padding: '0 24px 10px 24px'
        },
        iconBtn: {
            background: panel, border: 'none', width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: text, cursor: 'pointer'
        },
        iconBtnRed: {
            background: 'rgba(239, 68, 68, 0.1)', border: 'none', width: '36px', height: '36px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', cursor: 'pointer'
        },
        saveBtn: {
            background: Colors.get('done', theme), color: '#fff', border: 'none', borderRadius: '20px',
            padding: '8px 16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', cursor: 'pointer'
        },
        scrollableContent: { flex: 1, overflowY: 'auto', position: 'relative' },
        
        // Header
        headerWrapper: {
            padding: '10px 24px 20px 24px',
            background: `linear-gradient(180deg, ${bg} 0%, ${panel} 100%)`
        },
        headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
        iconBadge: {
            width: '56px', height: '56px', borderRadius: '16px', fontSize: '28px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: accentColor ? `${accentColor}20` : panel,
            border: `1px solid ${accentColor}40`
        },
        statusBadge: (isDone) => ({
            padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', border: 'none',
            backgroundColor: isDone ? Colors.get('done', theme) : panel,
            color: isDone ? '#fff' : sub,
            cursor: 'pointer'
        }),
        title: {
            fontSize: '26px', fontWeight: '800', color: text, lineHeight: '1.2', marginBottom: '15px'
        },
        titleInput: {
            fontSize: '26px', fontWeight: '800', color: text, background: 'transparent', border: 'none',
            borderBottom: `2px solid ${accentColor}`, width: '100%', marginBottom: '15px', paddingBottom: '4px', outline: 'none'
        },
        progressContainer: { width: '100%', marginTop: '5px' },
        progressText: { fontSize: '12px', fontWeight: '700', color: sub },
        progressBarBg: { width: '100%', height: '6px', backgroundColor: border, borderRadius: '3px', marginTop: '4px' },
        progressBarFill: { height: '100%', backgroundColor: accentColor, borderRadius: '3px' },

        // Body
        bodyPadding: { padding: '24px' },
        gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' },
        modernBadge: {
            borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center'
        },
        badgeLabel: { display: 'flex', alignItems: 'center', fontSize: '11px', color: sub, marginBottom: '4px', textTransform: 'uppercase' },
        badgeValue: { fontSize: '14px', fontWeight: '700' },
        
        // Inputs
        selectInput: {
            width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${border}`,
            backgroundColor: bg, color: text, fontSize: '14px', outline: 'none'
        },
        sectionBox: { marginBottom: '20px' },
        description: { fontSize: '16px', lineHeight: '1.5', color: text, opacity: 0.8 },
        textArea: {
            width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${border}`,
            backgroundColor: bg, color: text, fontSize: '16px', outline: 'none', resize: 'none'
        },
        
        // Dates
        dateRow: { display: 'flex', gap: '12px', marginBottom: '20px' },
        dateItem: { 
            flex: 1, display: 'flex', alignItems: 'center', backgroundColor: panel, 
            padding: '12px', borderRadius: '12px' 
        },
        label: { fontSize: '10px', color: sub, textTransform: 'uppercase', marginBottom: '2px' },
        dateValue: { fontSize: '13px', fontWeight: '600', color: text },
        dateInput: { 
            background: 'transparent', border: 'none', color: text, fontSize: '13px', 
            width: '100%', outline: 'none', fontFamily: 'inherit' 
        },

        // Checklist
        sectionHeader: { 
            display: 'flex', alignItems: 'center', fontSize: '16px', fontWeight: '700', color: text, marginBottom: '15px' 
        },
        counterBadge: {
            marginLeft: 'auto', fontSize: '12px', backgroundColor: panel, padding: '2px 8px',
            borderRadius: '6px', color: sub
        },
        goalsContainer: { display: 'flex', flexDirection: 'column', gap: '8px' },
        goalRow: {
            display: 'flex', alignItems: 'center', padding: '10px 12px',
            backgroundColor: panel, borderRadius: '12px', gap: '12px'
        },
        checkbox: (checked) => ({
            width: '22px', height: '22px', borderRadius: '6px',
            border: `2px solid ${checked ? accentColor : border}`,
            backgroundColor: checked ? accentColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
        }),
        goalText: (checked) => ({
            flex: 1, fontSize: '15px', color: text, opacity: checked ? 0.5 : 1,
            textDecoration: checked ? 'line-through' : 'none', cursor: 'pointer', transition: 'all 0.2s'
        }),
        deleteSubBtn: { color: sub, cursor: 'pointer', opacity: 0.6, fontSize: '12px', padding: '5px' },
        
        // Add Sub Goal
        addSubRow: {
            display: 'flex', alignItems: 'center', padding: '10px 12px', marginTop: '5px',
            border: `1px dashed ${border}`, borderRadius: '12px'
        },
        addSubInput: {
            flex: 1, background: 'transparent', border: 'none', color: text, fontSize: '14px', outline: 'none'
        },
        addSubBtn: {
            background: accentColor, color: '#fff', border: 'none', borderRadius: '6px',
            padding: '4px 8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer'
        }
    };
};