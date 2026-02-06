import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { 
    FaCheck, FaCalendarDay, FaFlag, FaTimes, FaClock, 
    FaTasks, FaLayerGroup, FaTrash, FaPen, FaSave, FaPlus, 
    FaExclamationTriangle, FaEllipsisV, FaChevronDown, FaChevronUp,
    FaBullseye, FaAward
} from "react-icons/fa";
import { 
    redactGoal, deleteGoal, toggleGoal, toggleSubGoal, 
    deleteSubGoal, addSubGoal, updateSubGoal,
    setOrRedactSubgoalAim,
    setOrRedactSubgoalResult,
    addOrRedactResult
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
    const [showDeleteWarning, setShowDeleteWarning] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [taskResultText, setTaskResultText] = useState('');
    const [expandedSubGoals, setExpandedSubGoals] = useState({});
    const [editingFields, setEditingFields] = useState({});
    
    // Sub-goal editing state
    const [editingSubGoalIndex, setEditingSubGoalIndex] = useState(null);
    const [editingSubGoalText, setEditingSubGoalText] = useState('');
    const [showToolbar, setShowToolbar] = useState(false);
    
    // Refs for auto-focus
    const resultInputRef = useRef(null);
    const aimInputRef = useRef(null);
    const subGoalTextInputRef = useRef(null);

    useEffect(() => {
        if(initialTask) {
            setTask(initialTask);
            setTaskResultText(initialTask.result || '');
        }
        setEditingSubGoalIndex(null);
        setEditingSubGoalText('');
        setExpandedSubGoals({});
        setEditingFields({});
    }, [initialTask]);

    useEffect(() => {
        if (!show) {
            setEditingSubGoalIndex(null);
            setEditingSubGoalText('');
            setExpandedSubGoals({});
            setEditingFields({});
            setShowToolbar(false);
        }
    }, [show]);

    useEffect(() => {
        if (showResultModal && resultInputRef.current) {
            setTimeout(() => resultInputRef.current.focus(), 300);
        }
    }, [showResultModal]);

    const totalGoals = task.goals?.length || 0;
    const completedGoals = task.goals?.filter(g => g.isDone).length || 0;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);
    const s = styles(theme, fSize, task.color);
    const isLight = theme === 'light' || theme === 'speciallight';

    // --- MAIN TASK COMPLETION HANDLER ---
    const handleToggleMainTask = async () => {
        const newIsDone = !task.isDone;
        
        // If completing task, show result modal
        if (newIsDone && !task.result) {
            setShowResultModal(true);
        }
        
        setTask(prev => ({ ...prev, isDone: newIsDone }));
        await toggleGoal(task.id);
    };

    // --- TASK RESULT MODAL HANDLER ---
    const handleSaveTaskResult = async () => {
        if (taskResultText.trim() || task.result) {
            await addOrRedactResult(task.id, taskResultText.trim());
            setTask(prev => ({ ...prev, result: taskResultText.trim() }));
        }
        setShowResultModal(false);
    };

    // --- SUB-GOAL EXPANSION HANDLER ---
    const toggleSubGoalExpand = (index) => {
        setExpandedSubGoals(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // --- SUB-GOAL EDITING HANDLERS ---
    const handleEditSubGoalField = (index, field, currentValue) => {
        setEditingFields(prev => ({
            ...prev,
            [`${index}-${field}`]: true
        }));
        
        if (field === 'text') setEditingSubGoalText(currentValue);
        if (field === 'aim') setEditingSubGoalText(currentValue);
        if (field === 'result') setEditingSubGoalText(currentValue);
    };

    const handleSaveSubGoalField = async (index, field) => {
        if (!task.goals) return;
        
        const trimmedText = editingSubGoalText.trim();
        const currentGoal = task.goals[index];
        
        // Update local state
        const updatedGoals = [...task.goals];
        if (field === 'text') {
            if (!trimmedText) {
                if (window.confirm(lang === 0 ? "Удалить пустую задачу?" : "Delete empty item?")) {
                    await handleConfirmDeleteSub(index);
                }
                return;
            }
            updatedGoals[index] = { ...currentGoal, text: trimmedText };
            await updateSubGoal(task.id, index, trimmedText);
        } else if (field === 'aim') {
            updatedGoals[index] = { ...currentGoal, aim: trimmedText };
            await setOrRedactSubgoalAim(task.id, index, trimmedText);
        } else if (field === 'result') {
            updatedGoals[index] = { ...currentGoal, result: trimmedText };
            await setOrRedactSubgoalResult(task.id, index, trimmedText);
        }
        
        setTask(prev => ({ ...prev, goals: updatedGoals }));
        setEditingFields(prev => ({ ...prev, [`${index}-${field}`]: false }));
        setEditingSubGoalText('');
    };

    const handleEditingSubGoalTextChange = (text) => {
       setEditingSubGoalText(text);
    };

    const handleCancelSubGoalEdit = (index, field) => {
        setEditingFields(prev => ({ ...prev, [`${index}-${field}`]: false }));
        setEditingSubGoalText('');
    };

    const handleConfirmDeleteSub = async (index) => {
        const newGoals = task.goals.filter((_, i) => i !== index);
        setTask(prev => ({ ...prev, goals: newGoals }));
        await deleteSubGoal(task.id, index);
        
        // Clear editing states for this sub-goal
        setEditingSubGoalIndex(null);
        setEditingSubGoalText('');
        setExpandedSubGoals(prev => {
            const newState = { ...prev };
            delete newState[index];
            return newState;
        });
        setEditingFields(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
                if (key.startsWith(`${index}-`)) delete newState[key];
            });
            return newState;
        });
    };

    // --- EXISTING HANDLERS ---
    const handleConfirmDelete = async () => {
        if (showDeleteWarning === 'main') {
            await deleteGoal(task.id);
            setShow(false);
        } else if (typeof showDeleteWarning === 'number') {
            await handleConfirmDeleteSub(showDeleteWarning);
        }
        setShowDeleteWarning(null);
    };

    const handleSaveEdit = async () => {
        await redactGoal(
            task.id, 
            task.name, 
            task.description, 
            task.difficulty, 
            task.priority, 
            task.category, 
            task.icon, 
            task.color, 
            task.startDate, 
            task.deadLine, 
            task.note
        );
        setIsEditing(false);
    };

    const handleToggleSub = async (index) => {
        if (!task.goals) return;
        
        const newGoals = [...task.goals];
        const wasDone = newGoals[index].isDone;
        const newIsDone = !wasDone;
        
        newGoals[index] = { 
            ...newGoals[index], 
            isDone: newIsDone 
        };
        
        // If completing sub-goal and no result exists, auto-expand for result input
        if (newIsDone && !newGoals[index].result) {
            setExpandedSubGoals(prev => ({ ...prev, [index]: true }));
        }
        
        setTask(prev => ({ ...prev, goals: newGoals }));
        await toggleSubGoal(task.id, index);
    };

    const handleAddSub = async () => {
        if (!newSubGoalText.trim()) return;
        const newItem = { text: newSubGoalText, aim: '', result: '', isDone: false };
        setTask(prev => ({ ...prev, goals: [...(prev.goals || []), newItem] }));
        await addSubGoal(task.id, newSubGoalText);
        setNewSubGoalText('');
    };

    const handleSubGoalKeyDown = (e, index, field) => {
        if (e.key === 'Enter') handleSaveSubGoalField(index, field);
        if (e.key === 'Escape') handleCancelSubGoalEdit(index, field);
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }} 
                        onClick={() => setShow(false)} 
                        style={s.backdrop} 
                    />
                    
                    <motion.div 
                        initial={{ y: "100%" }} 
                        animate={{ y: "0%" }} 
                        exit={{ y: "100%" }} 
                        transition={{ type: "spring", damping: 25, stiffness: 200 }} 
                        style={s.modalContainer}
                    >
                        {/* WARNING PANEL OVERLAY */}
                        <AnimatePresence>
                            {showDeleteWarning !== null && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.9 }} 
                                    style={s.warningOverlay}
                                >
                                    <div style={s.warningBox}>
                                        <FaExclamationTriangle size={40} color="#F44336" style={{ marginBottom: 15 }} />
                                        <h3 style={{ color: Colors.get('mainText', theme), margin: '0 0 10px 0' }}>
                                            {lang === 0 ? "Вы уверены?" : "Are you sure?"}
                                        </h3>
                                        <p style={{ color: Colors.get('subText', theme), textAlign: 'center', marginBottom: 20 }}>
                                            {lang === 0 ? "Это действие нельзя отменить." : "This action cannot be undone."}
                                        </p>
                                        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
                                            <button onClick={() => setShowDeleteWarning(null)} style={s.cancelBtn}>
                                                {lang === 0 ? "Отмена" : "Cancel"}
                                            </button>
                                            <button onClick={handleConfirmDelete} style={s.confirmDeleteBtn}>
                                                {lang === 0 ? "Удалить" : "Delete"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* TASK RESULT MODAL */}
                        <AnimatePresence>
                            {showResultModal && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }} 
                                    animate={{ opacity: 1, scale: 1 }} 
                                    exit={{ opacity: 0, scale: 0.9 }} 
                                    style={s.warningOverlay}
                                >
                                    <div style={s.resultModalBox}>
                                        <div style={s.resultModalHeader}>
                                            <FaAward size={32} color={task.color} />
                                            <h3 style={{ color: Colors.get('mainText', theme), margin: '10px 0 5px 0' }}>
                                                {lang === 0 ? "Результат задачи" : "Task Result"}
                                            </h3>
                                            <p style={{ color: Colors.get('subText', theme), fontSize: '14px', margin: 0 }}>
                                                {lang === 0 ? "Что вы узнали или достигли?" : "What did you learn or achieve?"}
                                            </p>
                                        </div>
                                        
                                        <textarea
                                            ref={resultInputRef}
                                            value={taskResultText}
                                            onChange={(e) => setTaskResultText(e.target.value)}
                                            placeholder={lang === 0 ? "Опишите результат выполнения задачи..." : "Describe the task completion result..."}
                                            style={s.resultTextarea}
                                            rows={4}
                                        />
                                        
                                        <div style={{ display: 'flex', gap: 10, width: '100%', marginTop: 20 }}>
                                            <button 
                                                onClick={() => {
                                                    setShowResultModal(false);
                                                    setTaskResultText('');
                                                }} 
                                                style={s.skipBtn}
                                            >
                                                {lang === 0 ? "Пропустить" : "Skip"}
                                            </button>
                                            <button 
                                                onClick={handleSaveTaskResult} 
                                                style={s.saveResultBtn}
                                            >
                                                {lang === 0 ? "Сохранить результат" : "Save Result"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div style={s.dragArea} onClick={() => setShow(false)}>
                            <div style={s.dragHandle} />
                        </div>
                        <div style={{display:'flex',flexDirection:'row',width:'90vw',marginLeft:'5vw',justifyContent:'flex-end'}}>
                            {!isEditing && (
                                            <div 
                                               
                                                style={s.statusBadge(task.isDone)}
                                            >
                                                {task.isDone ? 
                                                    (lang === 0 ? 'ВЫПОЛНЕНО' : 'COMPLETED') : 
                                                    (lang === 0 ? 'В ПРОЦЕССЕ' : 'IN PROGRESS')
                                                }
                                            </div>
                                        )}
                        {showToolbar &&<div style={{...s.toolbar,width : '40vw'}}>
                             
                                <motion.div 
                                    whileTap={{ scale: 0.9 }} 
                                    onClick={() => setShowDeleteWarning('main')} 
                                    style={s.iconBtnRed}
                                >
                                    <FaTrash size={16} />
                                </motion.div>
                            
                             
                                <div style={s.toolbarRight}>
                                    {isEditing ? (
                                        <motion.div 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={handleSaveEdit} 
                                            style={{...s.iconBtn,backgroundColor:'#09b038a2'}}
                                        >
                                            <FaSave size={16} /> 
                                       
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            whileTap={{ scale: 0.9 }} 
                                            onClick={() => setIsEditing(true)} 
                                            style={s.iconBtn}
                                        >
                                            <FaPen size={16} />
                                        </motion.div>
                                    )}
                                </div>
                            <motion.div
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleToggleMainTask}
                                            style={s.mainCheckbox(task.isDone)}
                                        >
                                            {task.isDone && <FaCheck size={12} color="#fff" />}
                                        </motion.div>
                            
                        </div>}
                         
                          <div style={s.toolbar}>
                        <FaEllipsisV onClick={() => setShowToolbar(prev => !prev)} />
                        </div>
                        
                        </div>
                        <div style={{ overflowY: 'scroll', overflowX: 'hidden' }} className="no-scrollbar">
                            <div style={s.headerWrapper}>
                                {/* FIXED HEADER WITH CHECKBOX */}
                                <div style={s.fixedHeader}>
                                    <div style={s.headerLeft}>
                                        
                                        <div style={s.iconBadge}>{task.icon}</div>
                                    </div>
                                    
                                    <div style={s.headerCenter}>
                                        {isEditing ? (
                                            <input 
                                                type="text" 
                                                placeholder={lang === 0 ? 'Название' : 'Name'}
                                                value={task.name}
                                                onChange={(e) => setTask({...task, name: e.target.value})}
                                                style={s.titleInput}
                                            />
                                        ) : (
                                            <h2 style={s.title}>{task.name}</h2>
                                        )}
                                        
                                    </div>
                                    
                                    
                                </div>
                                
                                <div style={s.headerRight}>
                                        <div style={s.progressContainer}>
                                            <span style={s.progressText}>{progressPercent}%</span>
                                            <div style={s.progressBarBg}>
                                                <motion.div 
                                                    initial={{ width: 0 }} 
                                                    animate={{ width: `${progressPercent}%` }} 
                                                    style={s.progressBarFill} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                {/* TASK RESULT DISPLAY (when completed) */}
                                {task.isDone && task.result && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={s.resultDisplayCard}
                                    >
                                        <div style={s.resultDisplayHeader}>
                                            <FaAward size={18} color={task.color} />
                                            <span style={s.resultDisplayTitle}>
                                                {lang === 0 ? 'Результат задачи' : 'Task Result'}
                                            </span>
                                            <motion.div
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => {
                                                    setTaskResultText(task.result);
                                                    setShowResultModal(true);
                                                }}
                                                style={s.editResultBtn}
                                            >
                                                <FaPen size={12} />
                                            </motion.div>
                                        </div>
                                        <p style={s.resultDisplayText}>{task.result}</p>
                                    </motion.div>
                                )}
                            </div>

                            <div style={s.bodyPadding}>
                                <div style={s.gridTwo}>
                                    {isEditing ? (
                                        <>
                                            <select 
                                                style={s.selectInput} 
                                                value={task.priority} 
                                                onChange={(e) => setTask({...task, priority: parseInt(e.target.value)})}
                                            >
                                                {PRIORITY_LABELS.map((l, i) => (
                                                    <option key={i} value={i}>{l[lang]}</option>
                                                ))}
                                            </select>
                                            <select 
                                                style={s.selectInput} 
                                                value={task.difficulty} 
                                                onChange={(e) => setTask({...task, difficulty: parseInt(e.target.value)})}
                                            >
                                                {DIFFICULTY_LABELS.map((l, i) => (
                                                    <option key={i} value={i}>{l[lang]}</option>
                                                ))}
                                            </select>
                                        </>
                                    ) : (
                                        <>
                                            <Badge 
                                                icon={<FaFlag/>} 
                                                label={lang===0?'Приоритет':'Priority'} 
                                                value={PRIORITY_LABELS[task?.priority][lang]} 
                                                color={PRIORITY_COLORS[task?.priority]} 
                                                theme={theme} 
                                            />
                                            <Badge 
                                                icon={<FaLayerGroup/>} 
                                                label={lang===0?'Сложность':'Difficulty'} 
                                                value={DIFFICULTY_LABELS[task?.difficulty][lang]} 
                                                color={DIFFICULTY_COLORS[task?.difficulty]} 
                                                theme={theme} 
                                            />
                                        </>
                                    )}
                                </div>

                                <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                                    {isEditing ? (
                                        <textarea 
                                            placeholder={lang === 0 ? 'Описание' : 'Description'}
                                            value={task.description}
                                            onChange={(e) => setTask({...task, description: e.target.value})}
                                            style={s.descriptionInput}
                                            rows={3}
                                        />
                                    ) : (
                                        <p style={s.description}>
                                            {task.description || (lang === 0 ? "Нет описания" : "No description")}
                                        </p>
                                    )}
                                </div>

                                <div style={s.dateRow}>
                                    <DateBox 
                                        label={lang===0?'Старт':'Start'} 
                                        value={task.startDate} 
                                        icon={<FaCalendarDay/>} 
                                        isEditing={isEditing} 
                                        theme={theme} 
                                        onChange={(v) => setTask({...task, startDate: v})} 
                                    />
                                    <DateBox 
                                        label={lang===0?'Срок':'Deadline'} 
                                        value={task.deadLine} 
                                        icon={<FaClock/>} 
                                        isEditing={isEditing} 
                                        theme={theme} 
                                        onChange={(v) => setTask({...task, deadLine: v})} 
                                    />
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
                                                <motion.div 
                                                    key={`goal-${idx}`} 
                                                    initial={{ opacity: 0, x: -10 }} 
                                                    animate={{ opacity: 1, x: 0 }} 
                                                    exit={{ opacity: 0, x: 10 }} 
                                                    style={{ marginBottom: 8 }}
                                                >
                                                    <SubGoalCard
                                                        goal={goal}
                                                        index={idx}
                                                        idx={idx}
                                                        isExpanded={expandedSubGoals[idx]}
                                                        onToggleExpand={toggleSubGoalExpand}
                                                        onToggleComplete={handleToggleSub}
                                                        onDelete={() => setShowDeleteWarning(idx)}
                                                        task={task}
                                                        theme={theme}
                                                        lang={lang}
                                                        editingFields={editingFields}
                                                        onEditingTextChange={handleEditingSubGoalTextChange}
                                                        editingSubGoalText={editingSubGoalText}
                                                        onEditField={handleEditSubGoalField}
                                                        onSaveField={handleSaveSubGoalField}
                                                        onCancelEdit={handleCancelSubGoalEdit}
                                                        onKeyDown={handleSubGoalKeyDown}
                                                        aimInputRef={idx === editingSubGoalIndex && editingFields[`${idx}-aim`] ? aimInputRef : null}
                                                        subGoalTextInputRef={idx === editingSubGoalIndex && editingFields[`${idx}-text`] ? subGoalTextInputRef : null}
                                                    />
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
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddSub()}
                                                style={s.addSubInput}
                                            />
                                            {newSubGoalText.length > 0 && (
                                                <button 
                                                    onClick={handleAddSub} 
                                                    style={s.addSubBtn}
                                                >
                                                    OK
                                                </button>
                                            )}
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

// --- SUB-GOAL CARD COMPONENT ---
const SubGoalCard = ({
    goal, index, idx, isExpanded, onToggleExpand, onToggleComplete, onDelete,
    task, theme, lang, editingFields, editingSubGoalText, onEditField, onSaveField,
    onCancelEdit, onKeyDown, aimInputRef, subGoalTextInputRef,onEditingTextChange
}) => {
    const s = styles(theme, null, task.color);
    const isLight = theme === 'light' || theme === 'speciallight';
    const panel = Colors.get('simplePanel', theme);
    const border = Colors.get('border', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    return (
        <div style={{ ...s.subGoalCard, border: goal.isDone ? `2px solid #2ed177` : `1px solid ${border}30` }}>
            {/* Main Row */}
            <div style={s.subGoalMainRow}>
                <div 
                    onClick={() => onToggleComplete(index)} 
                    style={s.checkbox(goal.isDone)}
                    role="checkbox"
                    aria-checked={goal.isDone}
                >
                    {goal.isDone && <FaCheck size={10} color="#2ed177" />}
                </div>
                
                <div style={s.subGoalContent}>
                    {editingFields[`${index}-text`] ? (
                        <input
                            ref={subGoalTextInputRef}
                            type="text"
                            value={editingSubGoalText}
                            onChange={(e) => {
                                // This will be handled by parent component's state
                            }}
                            onKeyDown={(e) => onKeyDown(e, index, 'text')}
                            style={s.inlineEditInput}
                            autoFocus
                        />
                    ) : (
                        <div 
                            onClick={() => onToggleExpand(index)}
                            style={s.subGoalText(goal.isDone)}
                        >
                            {goal.text}
                        </div>
                    )}
                </div>
                
                <div style={s.subGoalActions}>
                    {editingFields[`${index}-text`] ? (
                        <>
                            <div 
                                onClick={() => onSaveField(index, 'text')}
                                style={s.actionBtn}
                            >
                                <FaSave size={12} color={task.color} />
                            </div>
                            <div 
                                onClick={() => onCancelEdit(index, 'text')}
                                style={{ ...s.actionBtn, color: sub }}
                            >
                                <FaTimes size={12} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEditField(index, 'text', goal.text);
                                }}
                                style={s.actionBtn}
                            >
                                <FaPen size={12} color={sub} />
                            </div>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                style={s.actionBtn}
                            >
                                <FaTimes size={12} color={sub} />
                            </div>
                            <div 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleExpand(index);
                                }}
                                style={s.expandBtn}
                            >
                                {isExpanded ? (
                                    <FaChevronUp size={12} color={sub} />
                                ) : (
                                    <FaChevronDown size={12} color={sub} />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={s.expandedContent}
                    >
                        {/* Aim Field */}
<div style={s.expandedField}>
  <div style={s.fieldHeader}>
    <FaBullseye size={14} color={task.color} />
    <span style={s.fieldTitle}>
      {lang === 0 ? 'Цель подзадачи' : 'Sub-goal Aim'}
    </span>
  </div>
  {editingFields[`${index}-aim`] ? (
    <div style={s.editFieldRow}>
      <input
        ref={aimInputRef}
        type="text"
        value={editingSubGoalText}
        onChange={(e) => onEditingTextChange(e.target.value)}  // <-- UPDATED
        onKeyDown={(e) => onKeyDown(e, index, 'aim')}
        style={s.fieldEditInput}
        placeholder={lang === 0 ? 'Что нужно достичь?' : 'What needs to be achieved?'}
        autoFocus
      />
      <div
        onClick={() => onSaveField(index, 'aim')}
        style={s.saveFieldBtn}
      >
        <FaSave size={12} />
      </div>
      <div
        onClick={() => onCancelEdit(index, 'aim')}
        style={s.cancelFieldBtn}
      >
        <FaTimes size={12} />
      </div>
    </div>
  ) : (
    <div style={s.fieldDisplay}>
      {goal.aim ? (
        <p style={s.fieldValue}>{goal.aim}</p>
      ) : (
        <p style={s.fieldPlaceholder}>
          {lang === 0 ? 'Цель не указана' : 'No aim specified'}
        </p>
      )}
      <motion.div
        whileTap={{ scale: 0.9 }}
        onClick={() => onEditField(index, 'aim', goal.aim || '')}
        style={s.editFieldBtn}
      >
        <FaPen size={12} />
      </motion.div>
    </div>
  )}
</div>

{/* Result Field (only shown when completed) */}
{goal.isDone && (
  <div style={s.expandedField}>
    <div style={s.fieldHeader}>
      <FaAward size={14} color="#2ed177" />
      <span style={{ ...s.fieldTitle, color: '#2ed177' }}>
        {lang === 0 ? 'Результат' : 'Result'}
      </span>
    </div>
    {editingFields[`${index}-result`] ? (
      <div style={s.editFieldRow}>
        <textarea
          value={editingSubGoalText}
          onChange={(e) => onEditingTextChange(e.target.value)}  // <-- UPDATED
          onKeyDown={(e) => onKeyDown(e, index, 'result')}
          style={{ ...s.fieldEditInput, minHeight: '60px' }}
          placeholder={lang === 0 ? 'Что было достигнуто?' : 'What was achieved?'}
          autoFocus
        />
        <div
          onClick={() => onSaveField(index, 'result')}
          style={s.saveFieldBtn}
        >
          <FaSave size={12} />
        </div>
        <div
          onClick={() => onCancelEdit(index, 'result')}
          style={s.cancelFieldBtn}
        >
          <FaTimes size={12} />
        </div>
      </div>
    ) : (
      <div style={s.fieldDisplay}>
        {goal.result ? (
          <p style={s.fieldValue}>{goal.result}</p>
        ) : (
          <p style={s.fieldPlaceholder}>
            {lang === 0 ? 'Результат не указан' : 'No result specified'}
          </p>
        )}
        <motion.div
          whileTap={{ scale: 0.9 }}
          onClick={() => onEditField(index, 'result', goal.result || '')}
          style={s.editFieldBtn}
        >
          <FaPen size={12} />
        </motion.div>
      </div>
    )}
  </div>
)}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
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
    const done = Colors.get('done', theme);
    const isLight = theme === 'light' || theme === 'speciallight';

    return {
        backdrop: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000 },
        modalContainer: { position: 'fixed', bottom: 0, left: 0, right: 0, height: '90dvh', backgroundColor: bg, borderTopLeftRadius: '32px', borderTopRightRadius: '32px', zIndex: 2000, display: 'flex', flexDirection: 'column', boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', overflow: 'hidden' },
        
        warningOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
        warningBox: { backgroundColor: panel, borderRadius: 24, padding: 25, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${border}` },
        cancelBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        confirmDeleteBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold' },
        
        // Result Modal Styles
        resultModalBox: { backgroundColor: panel, borderRadius: 24, padding: 25, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', border: `1px solid ${border}` },
        resultModalHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 15 },
        resultTextarea: { 
            width: '100%', 
            padding: '12px', 
            borderRadius: 12, 
            border: `1px solid ${border}`, 
            backgroundColor: panel, 
            color: text, 
            fontSize: '16px', 
            resize: 'vertical',
            fontFamily: 'inherit'
        },
        skipBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        saveResultBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: accentColor, color: '#fff', fontWeight: 'bold' },

        dragArea: { width: '100%', padding: '15px 0', display: 'flex', justifyContent: 'center' },
        dragHandle: { width: '40px', height: '5px', backgroundColor: border, borderRadius: '10px' },
        toolbar: { display: 'flex', justifyContent: 'space-between', padding: '0 24px 15px 24px', alignItems: 'center' },
        iconBtn: { background: panel, border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: text },
        iconBtnRed: { background: 'rgba(244, 67, 54, 0.1)', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F44336' },
        saveBtn: { background: done, color: '#fff', border: 'none', borderRadius: '12px', padding: '0 20px', fontWeight: 'bold', display: 'flex', alignItems: 'center' },
        toolbarRight: { display: 'flex', gap: 8 },
        
        // FIXED HEADER WITH CHECKBOX
        headerWrapper: { padding: '0 24px 25px 24px', borderBottom: `1px solid ${border}` },
        fixedHeader: { 
            display: 'flex', 
            alignItems: 'center', 
            padding: '20px 0', 
            gap: 20 
        },
        headerLeft: { 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            flexShrink: 0
        },
        mainCheckbox: (checked) => ({ 
            width: 32, 
            height: 32, 
            borderRadius: 8, 
            border: `2px solid ${checked ? accentColor : border}`, 
            backgroundColor: checked ? accentColor : 'transparent', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.2s ease'
        }),
        iconBadge: { 
            width: 56, 
            height: 56, 
            borderRadius: 16, 
            fontSize: 28, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: `${accentColor}20`, 
            border: `1px solid ${accentColor}40`,
            flexShrink: 0
        },
        headerCenter: { 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            minWidth: 0
        },
        headerRight: { 
            display: 'flex', 
            width:'100vw',
            alignItems: 'center',
            flexShrink: 0
        },
        title: { 
            fontSize: 24, 
            fontWeight: 900, 
            color: text, 
            margin: 0,
            width:"70%",
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        titleInput: {
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontSize: '24px',
            fontWeight: '900',
            color: text,
            outline: `solid 1px ${border}`,
            borderRadius: '12px',
            padding: '8px 12px'
        },
        statusBadge: (isDone) => ({ 
            padding: '8px 16px', 
            borderRadius: 12, 
            fontSize: 10, 
            fontWeight: 900, 
            border: 'none', 
            backgroundColor: isDone ? done : panel, 
            color: isDone ? '#fff' : sub,
            width: 'fit-content',
            marginRight:'auto'
        }),
        
        // Task Result Display
        resultDisplayCard: {
            backgroundColor: `${accentColor}10`,
            border: `1px solid ${accentColor}30`,
            borderRadius: 16,
            padding: '16px',
            marginTop: '16px'
        },
        resultDisplayHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8
        },
        resultDisplayTitle: {
            fontSize: '14px',
            fontWeight: '700',
            color: accentColor,
            flex: 1
        },
        editResultBtn: {
            width: 24,
            height: 24,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: sub,
            ':hover': { backgroundColor: `${border}30` }
        },
        resultDisplayText: {
            fontSize: '14px',
            color: text,
            lineHeight: 1.5,
            margin: 0,
            whiteSpace: 'pre-wrap'
        },
        
        progressContainer: { width: '90vw' },
        progressText: { fontSize: 11, fontWeight: 800, color: accentColor, textAlign: 'center' },
        progressBarBg: { width: '100%', height: 6, backgroundColor: border, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
        progressBarFill: { height: '100%', backgroundColor: accentColor, borderRadius: 10 },

        bodyPadding: { padding: 24 },
        gridTwo: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
        modernBadge: { borderRadius: 20, padding: 15, display: 'flex', flexDirection: 'column', alignItems: 'center' },
        badgeLabel: { display: 'flex', alignItems: 'center', fontSize: 10, color: sub, textTransform: 'uppercase', letterSpacing: 1 },
        badgeValue: { fontSize: 14, fontWeight: 800, marginTop: 4 },
        
        dateRow: { display: 'flex', gap: 12, marginBottom: 24 },
        dateItem: { flex: 1, display: 'flex', alignItems: 'center', backgroundColor: panel, padding: 12, borderRadius: 16 },
        dateInput: { background: 'transparent', border: 'none', color: text, fontSize: 16, width: '100%', outline: 'none' },
        label: { fontSize: 9, color: sub, textTransform: 'uppercase' },
        dateValue: { fontSize: 13, fontWeight: 700, color: text },

        sectionHeader: { display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 800, color: text, marginBottom: 15 },
        counterBadge: { marginLeft: 'auto', fontSize: 11, backgroundColor: panel, padding: '4px 10px', borderRadius: 8, color: sub },
        
        // Sub-goal Card Styles
        subGoalCard: {
            backgroundColor: panel,
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'all 0.2s ease'
        },
        subGoalMainRow: {
            display: 'flex',
            alignItems: 'center',
            padding: '12px 14px',
            gap: 10
        },
        checkbox: (checked) => ({ 
            width: 22, 
            height: 22, 
            borderRadius: 6, 
            border: `2px solid ${checked ? accentColor : border}`, 
            backgroundColor: checked ? accentColor : 'transparent', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        }),
        subGoalContent: {
            flex: 1,
            minWidth: 0
        },
        subGoalText: (checked) => ({ 
            fontSize: 15, 
            color: text, 
            opacity: checked ? 0.6 : 1, 
            textDecoration: checked ? 'line-through' : 'none',
            cursor: 'pointer',
            wordBreak: 'break-word',
            lineHeight: 1.4
        }),
        subGoalActions: {
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            flexShrink: 0
        },
        expandBtn: {
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            cursor: 'pointer',
            color: sub,
            transition: 'all 0.2s ease'
        },
        actionBtn: {
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 6,
            cursor: 'pointer',
            color: sub,
            transition: 'all 0.2s ease'
        },
        
        // Expanded Content
        expandedContent: {
            padding: '0 14px 16px 14px',
            borderTop: `1px solid ${border}30`
        },
        expandedField: {
            marginBottom: 16
        },
        fieldHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 8
        },
        fieldTitle: {
            fontSize: 12,
            fontWeight: '700',
            color: sub,
            textTransform: 'uppercase'
        },
        fieldDisplay: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8,
            padding: '10px 12px',
            backgroundColor: `${panel}80`,
            borderRadius: 12,
            minHeight: '40px'
        },
        fieldValue: {
            flex: 1,
            fontSize: 14,
            color: text,
            margin: 0,
            lineHeight: 1.4,
            wordBreak: 'break-word'
        },
        fieldPlaceholder: {
            flex: 1,
            fontSize: 14,
            color: sub,
            opacity: 0.6,
            fontStyle: 'italic',
            margin: 0
        },
        editFieldBtn: {
            width: 24,
            height: 24,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: sub,
            flexShrink: 0,
            transition: 'all 0.2s ease'
        },
        editFieldRow: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
        },
        fieldEditInput: {
            flex: 1,
            background: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '8px 12px',
            color: text,
            fontSize: 16,
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical'
        },
        saveFieldBtn: {
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: accentColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
        },
        cancelFieldBtn: {
            width: 28,
            height: 28,
            borderRadius: 8,
            backgroundColor: border,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
        },
        
        // Inline editing for main text
        inlineEditInput: {
            flex: 1,
            background: 'transparent',
            border: `1px solid ${border}`,
            borderRadius: 8,
            padding: '6px 10px',
            color: text,
            fontSize: 16,
            outline: 'none',
            fontFamily: 'inherit',
            minWidth: 0
        },
        
        addSubRow: { 
            display: 'flex', 
            alignItems: 'center', 
            padding: '16px 15px', 
            border: `2px dashed ${border}`, 
            borderRadius: 16,
            marginTop: 8
        },
        addSubInput: {
            flex: 1,
            border: 'none',
            background: 'transparent',
            fontSize: '16px',
            color: text,
            outline: 'none',
            marginLeft: '10px'
        },
        addSubBtn: { 
            background: accentColor, 
            color: '#fff', 
            border: 'none', 
            borderRadius: 8, 
            padding: '6px 12px', 
            fontWeight: 'bold', 
            marginLeft: 10,
            flexShrink: 0
        },
        description: { fontSize: 15, lineHeight: 1.6, color: text, margin: 0, opacity: 0.9 },
        descriptionInput: {
            width: '90%',
            padding: '12px',
            borderRadius: 12,
            border: `1px solid ${border}`,
            backgroundColor: panel,
            color: text,
            fontSize: '16px',
            fontFamily: 'inherit',
            resize: 'vertical'
        },
        selectInput: { width: '100%', padding: 12, borderRadius: 12, border: `1px solid ${border}`, backgroundColor: panel, color: text, fontSize: '16px' }
    };
};

export default ToDoPage;