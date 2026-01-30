import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { 
    FaCheck, FaCalendarDay, FaFlag, FaTimes, FaClock, 
    FaTasks, FaLayerGroup, FaTrash, FaPen, FaSave, FaPlus, FaExclamationTriangle
} from "react-icons/fa";
import { 
    redactGoal, deleteGoal, toggleGoal, toggleSubGoal, 
    deleteSubGoal, addSubGoal 
} from "./ToDoHelper";

// --- CONSTANTS ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336']; 
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];

const ToDoPage = ({ show, setShow, theme, lang, fSize, task: initialTask }) => {
    const [task, setTask] = useState(initialTask || {});
    const [isEditing, setIsEditing] = useState(false);
    const [newSubGoalText, setNewSubGoalText] = useState('');
    const [showDeleteWarning, setShowDeleteWarning] = useState(null); // 'main' or index of sub-goal

    useEffect(() => {
        if(initialTask) setTask(initialTask);
    }, [initialTask]);

    const totalGoals = task.goals?.length || 0;
    const completedGoals = task.goals?.filter(g => g.isDone).length || 0;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);
    const s = styles(theme, fSize, task.color);

    // --- HANDLERS ---
    const handleConfirmDelete = async () => {
        if (showDeleteWarning === 'main') {
            await deleteGoal(task.id);
            setShow(false);
        } else if (typeof showDeleteWarning === 'number') {
            const index = showDeleteWarning;
            const newGoals = task.goals.filter((_, i) => i !== index);
            setTask(prev => ({ ...prev, goals: newGoals }));
            await deleteSubGoal(task.id, index);
        }
        setShowDeleteWarning(null);
    };

    const handleSaveEdit = async () => {
        await redactGoal(task.id, task.name, task.description, task.difficulty, task.priority, task.category, task.icon, task.color, task.startDate, task.deadLine, task.note);
        setIsEditing(false);
    };

    const handleToggleSub = async (index) => {
        if (!task.goals) return;
        const newGoals = [...task.goals];
        newGoals[index] = { 
            ...newGoals[index], 
            isDone: !newGoals[index].isDone 
        };
        setTask(prev => ({ ...prev, goals: newGoals }));

        // 4. Save to backend/storage
        await toggleSubGoal(task.id, index);
    };

    const handleAddSub = async () => {
        if (!newSubGoalText.trim()) return;
        const newItem = { text: newSubGoalText, isDone: false };
        setTask(prev => ({ ...prev, goals: [...(prev.goals || []), newItem] }));
        await addSubGoal(task.id, newSubGoalText);
        setNewSubGoalText('');
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShow(false)} style={s.backdrop} />
                    
                    <motion.div initial={{ y: "100%" }} animate={{ y: "0%" }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} style={s.modalContainer}>
                        
                        {/* WARNING PANEL OVERLAY */}
                        <AnimatePresence>
                            {showDeleteWarning !== null && (
                                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={s.warningOverlay}>
                                    <div style={s.warningBox}>
                                        <FaExclamationTriangle size={40} color="#F44336" style={{ marginBottom: 15 }} />
                                        <h3 style={{ color: Colors.get('mainText', theme), margin: '0 0 10px 0' }}>{lang === 0 ? "Вы уверены?" : "Are you sure?"}</h3>
                                        <p style={{ color: Colors.get('subText', theme), textAlign: 'center', marginBottom: 20 }}>
                                            {lang === 0 ? "Это действие нельзя отменить." : "This action cannot be undone."}
                                        </p>
                                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                                            <button onClick={() => setShowDeleteWarning(null)} style={s.cancelBtn}>{lang === 0 ? "Отмена" : "Cancel"}</button>
                                            <button onClick={handleConfirmDelete} style={s.confirmDeleteBtn}>{lang === 0 ? "Удалить" : "Delete"}</button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={s.dragArea} onClick={() => setShow(false)}><div style={s.dragHandle} /></div>

                        <div style={s.toolbar}>
                            <motion.div whileTap={{ scale: 0.9 }} onClick={() => setShowDeleteWarning('main')} style={s.iconBtnRed}><FaTrash size={16} /></motion.div>
                            <div style={s.toolbarRight}>
                                {isEditing ? (
                                    <motion.div whileTap={{ scale: 0.9 }} onClick={handleSaveEdit} style={s.saveBtn}><FaSave style={{marginRight: 6}}/> {lang === 0 ? 'Сохранить' : 'Save'}</motion.div>
                                ) : (
                                    <motion.div whileTap={{ scale: 0.9 }} onClick={() => setIsEditing(true)} style={s.iconBtn}><FaPen size={16} /></motion.div>
                                )}
                            </div>
                        </div>

                        <div style={{ overflowY: 'scroll', overflowX: 'hidden' }} className="no-scrollbar">
                            <div style={s.headerWrapper}>
                                <div style={s.headerTopRow}>
                                    <div style={s.iconBadge}>{task.icon}</div>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={async () => { setTask(p => ({...p, isDone: !p.isDone})); await toggleGoal(task.id); }} style={s.statusBadge(task.isDone)}>
                                        {task.isDone ? (lang === 0 ? 'ВЫПОЛНЕНО' : 'COMPLETED') : (lang === 0 ? 'В ПРОЦЕССЕ' : 'IN PROGRESS')}
                                    </motion.button>
                                </div>

                                {isEditing ? (
                                    <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                                    <input 
                    type="text" 
                    placeholder={lang === 0 ? 'Название' : 'Name'}
                    value={task.name}
                    onChange={(e) => setTask({...task, name: e.target.value})}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                />
                </div>
                                ) : (
                                    <h2 style={s.title}>{task.name}</h2>
                                )}

                                <div style={s.progressContainer}>
                                    <span style={s.progressText}>{progressPercent}%</span>
                                    <div style={s.progressBarBg}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={s.progressBarFill} />
                                    </div>
                                </div>
                            </div>

                            <div style={s.bodyPadding}>
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
                                            <Badge icon={<FaFlag/>} label={lang===0?'Приоритет':'Priority'} value={PRIORITY_LABELS[task.priority][lang]} color={PRIORITY_COLORS[task.priority]} theme={theme} />
                                            <Badge icon={<FaLayerGroup/>} label={lang===0?'Сложность':'Difficulty'} value={DIFFICULTY_LABELS[task.difficulty][lang]} color={DIFFICULTY_COLORS[task.difficulty]} theme={theme} />
                                        </>
                                    )}
                                </div>

                                <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                                    {isEditing ? (
                                        <input 
                    type="text" 
                    placeholder={lang === 0 ?  'Описание' : 'Description'}
                    value={task.description}
                    onChange={(e) => setTask({...task, description: e.target.value})}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                />
                                    ) : (
                                        <p style={s.description}>{task.description || (lang === 0 ? "Нет описания" : "No description")}</p>
                                    )}
                                </div>

                                <div style={s.dateRow}>
                                    <DateBox label={lang===0?'Старт':'Start'} value={task.startDate} icon={<FaCalendarDay/>} isEditing={isEditing} theme={theme} onChange={(v) => setTask({...task, startDate: v})} />
                                    <DateBox label={lang===0?'Срок':'Deadline'} value={task.deadLine} icon={<FaClock/>} isEditing={isEditing} theme={theme} onChange={(v) => setTask({...task, deadLine: v})} />
                                </div>

                                <div style={{ marginTop: '30px' }}>
                                    <div style={s.sectionHeader}>
                                        <FaTasks style={{ marginRight: '8px', color: task.color }} />
                                        {lang === 0 ? 'Чек-лист' : 'Checklist'} 
                                        <span style={s.counterBadge}>{completedGoals}/{totalGoals}</span>
                                    </div>

                                    <div style={s.goalsContainer}>
                                        <AnimatePresence>
                                            {task.goals?.map((goal, idx) => (
                                                <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} style={s.goalRow}>
                                                    <div onClick={() => handleToggleSub(idx)} style={s.checkbox(goal.isDone)}>
                                                        {goal.isDone && <FaCheck size={10} color="#fff" />}
                                                    </div>
                                                    <div style={s.goalText(goal.isDone)} onClick={() => handleToggleSub(idx)}>{goal.text}</div>
                                                    <div onClick={() => setShowDeleteWarning(idx)} style={s.deleteSubBtn}><FaTimes /></div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        <div style={s.addSubRow}>
                                            <FaPlus style={{color: Colors.get('subText', theme), marginRight: 10}} />
                                             <input 
                    type="text" 
                    placeholder={lang === 0 ? "Добавить задачу..." : "Add item..."}
                    value={newSubGoalText}
                    onChange={(e) => setNewSubGoalText(e.target.value)}
                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), outline: 'none',marginLeft: '10px'}}
                />
                                            {newSubGoalText.length > 0 && <button onClick={handleAddSub} style={s.addSubBtn}>OK</button>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginBottom: '560px' }} />
                            </div>
                            
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// --- SUB-COMPONENTS ---
const Badge = ({ icon, label, value, color, theme }) => (
    <div style={{...styles(theme).modernBadge, backgroundColor: `${color}15`, border: `1px solid ${color}30`}}>
        <div style={styles(theme).badgeLabel}>{icon} <span style={{marginLeft: 6}}>{label}</span></div>
        <div style={{...styles(theme).badgeValue, color: color}}>{value}</div>
    </div>
);

const DateBox = ({ label, value, icon, isEditing, theme, onChange }) => {
    const s = styles(theme);
    return (
        <div style={s.dateItem}>
            <div style={{ color: Colors.get('subText', theme), marginRight: 10 }}>{icon}</div>
            <div style={{display:'flex', flexDirection:'column', flex: 1}}>
                <span style={s.label}>{label}</span>
                {isEditing ? (
                    
                    <input type="date" style={s.dateInput} value={value || ''} onChange={(e) => onChange(e.target.value)} />
                ) : (
                    <span style={s.dateValue}>{value || '-'}</span>
                )}
            </div>
        </div>
    );
};

// --- STYLES ---
const styles = (theme, fSize, accentColor) => {
    const bg = Colors.get('background', theme);
    const panel = Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = Colors.get('border', theme);

    return {
        // ... (Keep previous backdrop, modalContainer, etc.)
        backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1999 },
        modalContainer: { position: 'fixed', bottom: 0, left: 0, right: 0, height: '90vh', backgroundColor: bg, borderTopLeftRadius: '32px', borderTopRightRadius: '32px', zIndex: 2000, display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', overflow: 'hidden' },
        
        // Warning Panel
        warningOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
        warningBox: { backgroundColor: panel, borderRadius: 24, padding: 25, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${border}` },
        cancelBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        confirmDeleteBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold' },

        dragArea: { width: '100%', padding: '15px 0', display: 'flex', justifyContent: 'center' },
        dragHandle: { width: '40px', height: '5px', backgroundColor: border, borderRadius: '10px' },
        toolbar: { display: 'flex', justifyContent: 'space-between', padding: '0 24px 15px 24px' },
        iconBtn: { background: panel, border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text },
        iconBtnRed: { background: 'rgba(244, 67, 54, 0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F44336' },
        saveBtn: { background: Colors.get('done', theme), color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center' },
        
        headerWrapper: { padding: '10px 24px 25px 24px', borderBottom: `1px solid ${border}` },
        headerTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
        iconBadge: { width: 64, height: 64, borderRadius: 20, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` },
        statusBadge: (isDone) => ({ padding: '10px 16px', borderRadius: 14, fontSize: 10, fontWeight: 900, border: 'none', backgroundColor: isDone ? Colors.get('done', theme) : panel, color: isDone ? '#fff' : sub }),
        title: { fontSize: 28, fontWeight: 900, color: text, margin: 0 },
        progressContainer: { marginTop: 20 },
        progressText: { fontSize: 12, fontWeight: 800, color: accentColor },
        progressBarBg: { width: '100%', height: 8, backgroundColor: border, borderRadius: 10, marginTop: 6, overflow: 'hidden' },
        progressBarFill: { height: '100%', backgroundColor: accentColor },

        bodyPadding: { padding: 24 },
        gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
        modernBadge: { borderRadius: 20, padding: 15, display: 'flex', flexDirection: 'column', alignItems: 'center' },
        badgeLabel: { display: 'flex', alignItems: 'center', fontSize: 10, color: sub, textTransform: 'uppercase', letterSpacing: 1 },
        badgeValue: { fontSize: 14, fontWeight: 800, marginTop: 4 },
        
        dateRow: { display: 'flex', gap: 12, marginBottom: 24 },
        dateItem: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: panel, padding: 12, borderRadius: 16 },
        dateInput: { background: 'transparent', border: 'none', color: text, fontSize: 13, width: '100%', outline: 'none' },
        label: { fontSize: 9, color: sub, textTransform: 'uppercase' },
        dateValue: { fontSize: 13, fontWeight: 700, color: text },

        sectionHeader: { display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 800, color: text, marginBottom: 15 },
        counterBadge: { marginLeft: 'auto', fontSize: 11, backgroundColor: panel, padding: '4px 10px', borderRadius: 8, color: sub },
        goalRow: { display: 'flex', alignItems: 'center', padding: 14, backgroundColor: panel, borderRadius: 16, marginBottom: 8 },
        checkbox: (checked) => ({ width: 24, height: 24, borderRadius: 8, border: `2px solid ${checked ? accentColor : border}`, backgroundColor: checked ? accentColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }),
        goalText: (checked) => ({ flex: 1, fontSize: 15, color: text, opacity: checked ? 0.5 : 1, textDecoration: checked ? 'line-through' : 'none', marginLeft: 12 }),
        deleteSubBtn: { color: sub, padding: 5 },
        addSubRow: { display: 'flex', alignItems: 'center', padding: '5px 15px', border: `2px dashed ${border}`, borderRadius: 16 },
        addSubBtn: { background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 'bold', marginLeft: 10 },
        description: { fontSize: 16, lineHeight: 1.6, color: text, margin: 0, opacity: 0.9 },
        selectInput: { width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${border}`, backgroundColor: panel, color: text }
    };
};

export default ToDoPage;