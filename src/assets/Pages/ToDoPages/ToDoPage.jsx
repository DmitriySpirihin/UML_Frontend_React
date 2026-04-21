import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData';
import ScrollPicker from '../../Helpers/ScrollPicker';
import { IoIosArrowBack } from 'react-icons/io';
import {
    FaCheck, FaCalendarDay, FaFlag, FaTimes, FaClock,
    FaTasks, FaLayerGroup, FaPen, FaSave, FaPlus,
    FaExclamationTriangle, FaExclamation, FaChevronDown, FaChevronUp,
    FaBullseye, FaAward
} from "react-icons/fa";
import {
    redactGoal, deleteGoal, toggleGoal, toggleSubGoal,
    deleteSubGoal, addSubGoal, updateSubGoal,
    setOrRedactSubgoalAim,
    setOrRedactSubgoalResult,
    addOrRedactResult
} from "./ToDoHelper";
import { selectedTodo$, theme$, lang$, fontSize$, setPage, lastPage$ } from '../../StaticClasses/HabitsBus';

// --- CONSTANTS ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not Urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very Urgent'], ['ASAP', 'ASAP']];
const NOT_SET_LABELS = ['Не задано', 'Not set'];
const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336'];
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];
const URGENCY_COLORS = ['#81C784', '#64B5F6', '#FFD54F', '#FF8A65', '#E57373'];

const ToDoPage = () => {
    const [task, setTask] = useState(null);
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    const [isEditing, setIsEditing] = useState(false);
    const [editPriority, setEditPriority] = useState('');
    const [editDifficulty, setEditDifficulty] = useState('');
    const [editUrgency, setEditUrgency] = useState('');
    const [newSubGoalText, setNewSubGoalText] = useState('');
    const [showDeleteWarning, setShowDeleteWarning] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [taskResultText, setTaskResultText] = useState('');
    const [expandedSubGoals, setExpandedSubGoals] = useState({});
    const [editingFields, setEditingFields] = useState({});

    const [editingSubGoalIndex, setEditingSubGoalIndex] = useState(null);
    const [editingSubGoalText, setEditingSubGoalText] = useState('');

    const resultInputRef = useRef(null);
    const aimInputRef = useRef(null);
    const subGoalTextInputRef = useRef(null);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
            selectedTodo$.subscribe((t) => {
                if (t) {
                    setTask(t);
                    setTaskResultText(t.result || '');
                    setEditingSubGoalIndex(null);
                    setEditingSubGoalText('');
                    setExpandedSubGoals({});
                    setEditingFields({});
                    setIsEditing(false);
                }
            }),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    useEffect(() => {
        if (showResultModal && resultInputRef.current) {
            setTimeout(() => resultInputRef.current.focus(), 300);
        }
    }, [showResultModal]);

    const goBack = () => setPage(lastPage$.value || 'ToDoMain');

    if (!task) return null;

    const totalGoals = task.goals?.length || 0;
    const completedGoals = task.goals?.filter(g => g.isDone).length || 0;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);
    const s = styles(theme, fSize, task.color);
    const isLight = theme === 'light' || theme === 'speciallight';

    // --- MAIN TASK COMPLETION HANDLER ---
    const handleToggleMainTask = async () => {
        const newIsDone = !task.isDone;
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
            goBack();
        } else if (typeof showDeleteWarning === 'number') {
            await handleConfirmDeleteSub(showDeleteWarning);
        }
        setShowDeleteWarning(null);
    };

    const enterEditMode = () => {
        const pStr = task.priority != null ? (PRIORITY_LABELS[task.priority]?.[lang] ?? NOT_SET_LABELS[lang]) : NOT_SET_LABELS[lang];
        const dStr = task.difficulty != null ? (DIFFICULTY_LABELS[task.difficulty]?.[lang] ?? NOT_SET_LABELS[lang]) : NOT_SET_LABELS[lang];
        const uStr = task.urgency != null ? (URGENCY_LABELS[task.urgency]?.[lang] ?? NOT_SET_LABELS[lang]) : NOT_SET_LABELS[lang];
        setEditPriority(pStr);
        setEditDifficulty(dStr);
        setEditUrgency(uStr);
        setIsEditing(true);
    };

    const handleSaveEdit = async () => {
        const toIdx = (val, labels) => {
            if (val === NOT_SET_LABELS[lang]) return null;
            const i = labels.findIndex(l => l[lang] === val);
            return i === -1 ? null : i;
        };
        const updatedTask = {
            ...task,
            priority: toIdx(editPriority, PRIORITY_LABELS),
            difficulty: toIdx(editDifficulty, DIFFICULTY_LABELS),
            urgency: toIdx(editUrgency, URGENCY_LABELS),
        };
        setTask(updatedTask);
        await redactGoal(
            updatedTask.id,
            updatedTask.name,
            updatedTask.description,
            updatedTask.difficulty,
            updatedTask.priority,
            updatedTask.category,
            updatedTask.icon,
            updatedTask.color,
            updatedTask.startDate,
            updatedTask.deadLine,
            updatedTask.note,
            updatedTask.urgency
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 1001, paddingBottom: '100px', overflowY: 'auto', backgroundColor: Colors.get('background', theme) }}
            className="no-scrollbar"
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
                                    onClick={() => { setShowResultModal(false); setTaskResultText(''); }}
                                    style={s.skipBtn}
                                >
                                    {lang === 0 ? "Пропустить" : "Skip"}
                                </button>
                                <button onClick={handleSaveTaskResult} style={s.saveResultBtn}>
                                    {lang === 0 ? "Сохранить результат" : "Save Result"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* iOS-STYLE TOP BAR */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 0' }}>
                <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={goBack}
                    style={{ width: '36px', height: '36px', borderRadius: '12px', backgroundColor: Colors.get('bottomPanel', theme), display: 'flex', alignItems: 'center', justifyContent: 'center', color: Colors.get('icons', theme) }}
                >
                    <IoIosArrowBack size={20} />
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }} onClick={isEditing ? handleSaveEdit : enterEditMode} style={{ padding: '8px 4px' }}>
                    <span style={{ fontSize: 17, fontWeight: 600, color: isEditing ? task.color : Colors.get('subText', theme) }}>
                        {isEditing ? (lang === 0 ? 'Готово' : 'Done') : (lang === 0 ? 'Изменить' : 'Edit')}
                    </span>
                </motion.div>
            </div>

            {/* CONTENT */}
            <div style={s.headerWrapper}>
                <motion.div whileTap={{ scale: 0.95 }} onClick={handleToggleMainTask} style={s.statusBadge(task.isDone)}>
                    {task.isDone ? (lang === 0 ? 'ВЫПОЛНЕНО ✓' : 'COMPLETED ✓') : (lang === 0 ? 'В ПРОЦЕССЕ' : 'IN PROGRESS')}
                </motion.div>
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
                {isEditing && (
                    <div style={s.pickerCard}>
                        <div style={s.pickerRow}>
                            {(AppData.todoFieldsVisibility?.priority ?? true) && (
                                <div style={s.pickerCol}>
                                    <span style={s.smallLabel}>{lang===0?'Приоритет':'Priority'}</span>
                                    <ScrollPicker
                                        items={[NOT_SET_LABELS[lang], ...PRIORITY_LABELS.map(l => l[lang])]}
                                        value={editPriority}
                                        onChange={setEditPriority}
                                        theme={theme}
                                        width="100%"
                                    />
                                </div>
                            )}
                            {(AppData.todoFieldsVisibility?.priority ?? true) && (AppData.todoFieldsVisibility?.difficulty ?? true) && (
                                <div style={s.pickerDivider} />
                            )}
                            {(AppData.todoFieldsVisibility?.difficulty ?? true) && (
                                <div style={s.pickerCol}>
                                    <span style={s.smallLabel}>{lang===0?'Сложность':'Difficulty'}</span>
                                    <ScrollPicker
                                        items={[NOT_SET_LABELS[lang], ...DIFFICULTY_LABELS.map(l => l[lang])]}
                                        value={editDifficulty}
                                        onChange={setEditDifficulty}
                                        theme={theme}
                                        width="100%"
                                    />
                                </div>
                            )}
                            {(AppData.todoFieldsVisibility?.difficulty ?? true) && (AppData.todoFieldsVisibility?.urgency ?? true) && (
                                <div style={s.pickerDivider} />
                            )}
                            {(AppData.todoFieldsVisibility?.urgency ?? true) && (
                                <div style={s.pickerCol}>
                                    <span style={s.smallLabel}>{lang===0?'Срочность':'Urgency'}</span>
                                    <ScrollPicker
                                        items={[NOT_SET_LABELS[lang], ...URGENCY_LABELS.map(l => l[lang])]}
                                        value={editUrgency}
                                        onChange={setEditUrgency}
                                        theme={theme}
                                        width="100%"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {!isEditing && (task.priority != null || task.difficulty != null || task.urgency != null) && (
                    <div style={s.gridTwo}>
                        {(AppData.todoFieldsVisibility?.priority ?? true) && task.priority != null && (
                            <Badge
                                icon={<FaFlag/>}
                                label={lang===0?'Приоритет':'Priority'}
                                value={PRIORITY_LABELS[task.priority]?.[lang]}
                                color={PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[0]}
                                theme={theme}
                            />
                        )}
                        {(AppData.todoFieldsVisibility?.difficulty ?? true) && task.difficulty != null && (
                            <Badge
                                icon={<FaLayerGroup/>}
                                label={lang===0?'Сложность':'Difficulty'}
                                value={DIFFICULTY_LABELS[task.difficulty]?.[lang]}
                                color={DIFFICULTY_COLORS[task.difficulty] || DIFFICULTY_COLORS[0]}
                                theme={theme}
                            />
                        )}
                        {(AppData.todoFieldsVisibility?.urgency ?? true) && task.urgency != null && (
                            <Badge
                                icon={<FaExclamation/>}
                                label={lang===0?'Срочность':'Urgency'}
                                value={URGENCY_LABELS[task.urgency]?.[lang]}
                                color={URGENCY_COLORS[task.urgency] || URGENCY_COLORS[0]}
                                theme={theme}
                            />
                        )}
                    </div>
                )}

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
                        emptyLabel={lang === 0 ? 'Без дедлайна' : 'No deadline'}
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
                                <button onClick={handleAddSub} style={s.addSubBtn}>OK</button>
                            )}
                        </div>
                    </div>
                </div>
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                        >
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setShowDeleteWarning('main')}
                                style={s.deleteBtn}
                            >
                                {lang === 0 ? 'Удалить задачу' : 'Delete task'}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div style={{ marginBottom: '120px' }} />
            </div>
        </motion.div>
    );
};

// --- SUB-GOAL CARD COMPONENT ---
const SubGoalCard = ({
    goal, index, idx, isExpanded, onToggleExpand, onToggleComplete, onDelete,
    task, theme, lang, editingFields, editingSubGoalText, onEditField, onSaveField,
    onCancelEdit, onKeyDown, aimInputRef, subGoalTextInputRef, onEditingTextChange
}) => {
    const s = styles(theme, null, task.color);
    const border = Colors.get('border', theme);
    const sub = Colors.get('subText', theme);

    return (
        <div style={{ ...s.subGoalCard, border: goal.isDone ? `2px solid #2ed177` : `1px solid ${border}30` }}>
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
                            onChange={() => {}}
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
                            <div onClick={() => onSaveField(index, 'text')} style={s.actionBtn}>
                                <FaSave size={12} color={task.color} />
                            </div>
                            <div onClick={() => onCancelEdit(index, 'text')} style={{ ...s.actionBtn, color: sub }}>
                                <FaTimes size={12} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={(e) => { e.stopPropagation(); onEditField(index, 'text', goal.text); }}
                                style={s.actionBtn}
                            >
                                <FaPen size={12} color={sub} />
                            </div>
                            <div
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                style={s.actionBtn}
                            >
                                <FaTimes size={12} color={sub} />
                            </div>
                            <div
                                onClick={(e) => { e.stopPropagation(); onToggleExpand(index); }}
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

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={s.expandedContent}
                    >
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
                                        onChange={(e) => onEditingTextChange(e.target.value)}
                                        onKeyDown={(e) => onKeyDown(e, index, 'aim')}
                                        style={s.fieldEditInput}
                                        placeholder={lang === 0 ? 'Что нужно достичь?' : 'What needs to be achieved?'}
                                        autoFocus
                                    />
                                    <div onClick={() => onSaveField(index, 'aim')} style={s.saveFieldBtn}>
                                        <FaSave size={12} />
                                    </div>
                                    <div onClick={() => onCancelEdit(index, 'aim')} style={s.cancelFieldBtn}>
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
                                            onChange={(e) => onEditingTextChange(e.target.value)}
                                            onKeyDown={(e) => onKeyDown(e, index, 'result')}
                                            style={{ ...s.fieldEditInput, minHeight: '60px' }}
                                            placeholder={lang === 0 ? 'Что было достигнуто?' : 'What was achieved?'}
                                            autoFocus
                                        />
                                        <div onClick={() => onSaveField(index, 'result')} style={s.saveFieldBtn}>
                                            <FaSave size={12} />
                                        </div>
                                        <div onClick={() => onCancelEdit(index, 'result')} style={s.cancelFieldBtn}>
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

const DateBox = ({ label, value, icon, isEditing, theme, onChange, emptyLabel }) => {
    const s = styles(theme);
    return (
        <div style={s.dateItem}>
            <div style={{ color: Colors.get('subText', theme), marginRight: 10 }}>{icon}</div>
            <div style={{display:'flex', flexDirection:'column', flex: 1}}>
                <span style={s.label}>{label}</span>
                {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="date" style={s.dateInput} value={value || ''} onChange={(e) => onChange(e.target.value)} />
                        {value && (
                            <motion.div whileTap={{ scale: 0.9 }} onClick={() => onChange('')}
                                style={{ cursor: 'pointer', color: Colors.get('subText', theme), flexShrink: 0 }}>
                                <FaTimes size={12} />
                            </motion.div>
                        )}
                    </div>
                ) : (
                    <span style={s.dateValue}>{value || emptyLabel || '-'}</span>
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

    return {
        warningOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
        warningBox: { backgroundColor: panel, borderRadius: 24, padding: 25, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${border}` },
        cancelBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        confirmDeleteBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold' },

        resultModalBox: { backgroundColor: panel, borderRadius: 24, padding: 25, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', border: `1px solid ${border}` },
        resultModalHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 15 },
        resultTextarea: { width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${border}`, backgroundColor: panel, color: text, fontSize: '16px', resize: 'vertical', fontFamily: 'inherit' },
        skipBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        saveResultBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: accentColor, color: '#fff', fontWeight: 'bold' },

        headerWrapper: { padding: '0 24px 25px 24px', borderBottom: `1px solid ${border}` },
        fixedHeader: { display: 'flex', alignItems: 'center', padding: '20px 0', gap: 20 },
        headerLeft: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
        mainCheckbox: (checked) => ({
            width: 32, height: 32, borderRadius: 8,
            border: `2px solid ${checked ? accentColor : border}`,
            backgroundColor: checked ? accentColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease'
        }),
        iconBadge: { width: 56, height: 56, borderRadius: 16, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40`, flexShrink: 0 },
        headerCenter: { flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 },
        headerRight: { display: 'flex', width:'100vw', alignItems: 'center', flexShrink: 0 },
        title: { fontSize: 24, fontWeight: 900, color: text, margin: 0, width:"70%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        titleInput: { width: '100%', border: 'none', background: 'rgba(255,255,255,0.05)', fontSize: '24px', fontWeight: '900', color: text, outline: 'none', borderRadius: '14px', padding: '8px 12px' },
        statusBadge: (isDone) => ({
            padding: '8px 16px', borderRadius: 12, fontSize: 10, fontWeight: 900, border: 'none',
            backgroundColor: isDone ? done : panel, color: isDone ? '#fff' : sub,
            width: 'fit-content', marginBottom: 8, cursor: 'pointer', userSelect: 'none'
        }),
        deleteBtn: { width: '100%', padding: '16px', borderRadius: 16, border: 'none', backgroundColor: 'rgba(244,67,54,0.10)', color: '#F44336', fontSize: 17, fontWeight: 700, textAlign: 'center', cursor: 'pointer', marginTop: 24, marginBottom: 8 },

        resultDisplayCard: { backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30`, borderRadius: 16, padding: '16px', marginTop: '16px' },
        resultDisplayHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
        resultDisplayTitle: { fontSize: '14px', fontWeight: '700', color: accentColor, flex: 1 },
        editResultBtn: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sub },
        resultDisplayText: { fontSize: '14px', color: text, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' },

        progressContainer: { width: '90vw' },
        progressText: { fontSize: 11, fontWeight: 800, color: accentColor, textAlign: 'center' },
        progressBarBg: { width: '100%', height: 6, backgroundColor: border, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
        progressBarFill: { height: '100%', backgroundColor: accentColor, borderRadius: 10 },

        bodyPadding: { padding: 24 },
        gridTwo: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12, marginBottom: 24 },
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
        goalsContainer: {},

        subGoalCard: { backgroundColor: panel, borderRadius: 16, overflow: 'hidden', transition: 'all 0.2s ease' },
        subGoalMainRow: { display: 'flex', alignItems: 'center', padding: '12px 14px', gap: 10 },
        checkbox: (checked) => ({
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${checked ? accentColor : border}`,
            backgroundColor: checked ? accentColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s ease'
        }),
        subGoalContent: { flex: 1, minWidth: 0 },
        subGoalText: (checked) => ({ fontSize: 15, color: text, opacity: checked ? 0.6 : 1, textDecoration: checked ? 'line-through' : 'none', cursor: 'pointer', wordBreak: 'break-word', lineHeight: 1.4 }),
        subGoalActions: { display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 },
        expandBtn: { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: sub, transition: 'all 0.2s ease' },
        actionBtn: { width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, cursor: 'pointer', color: sub, transition: 'all 0.2s ease' },

        expandedContent: { padding: '0 14px 16px 14px', borderTop: `1px solid ${border}30` },
        expandedField: { marginBottom: 16 },
        fieldHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
        fieldTitle: { fontSize: 12, fontWeight: '700', color: sub, textTransform: 'uppercase' },
        fieldDisplay: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', backgroundColor: `${panel}80`, borderRadius: 12, minHeight: '40px' },
        fieldValue: { flex: 1, fontSize: 14, color: text, margin: 0, lineHeight: 1.4, wordBreak: 'break-word' },
        fieldPlaceholder: { flex: 1, fontSize: 14, color: sub, opacity: 0.6, fontStyle: 'italic', margin: 0 },
        editFieldBtn: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sub, flexShrink: 0, transition: 'all 0.2s ease' },
        editFieldRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
        fieldEditInput: { flex: 1, background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px', color: text, fontSize: 16, outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
        saveFieldBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
        cancelFieldBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: border, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
        inlineEditInput: { flex: 1, background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px', color: text, fontSize: 16, outline: 'none', fontFamily: 'inherit', minWidth: 0 },

        addSubRow: { display: 'flex', alignItems: 'center', padding: '16px 15px', border: `2px dashed ${border}`, borderRadius: 16, marginTop: 8 },
        addSubInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: text, outline: 'none', marginLeft: '10px' },
        addSubBtn: { background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 'bold', marginLeft: 10, flexShrink: 0 },
        description: { fontSize: 15, lineHeight: 1.6, color: text, margin: 0, opacity: 0.9 },
        descriptionInput: { width: '90%', padding: '12px', borderRadius: '14px', border: 'none', backgroundColor: 'rgba(255,255,255,0.05)', color: text, fontSize: '16px', fontFamily: 'inherit', resize: 'vertical', outline: 'none' },

        pickerCard: { backgroundColor: panel, borderRadius: 20, padding: '15px', marginBottom: 24, border: `1px solid ${border}30` },
        pickerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        pickerCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
        pickerDivider: { width: 1, height: 60, backgroundColor: border, margin: '0 5px' },
        smallLabel: { fontSize: 11, color: sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }
    };
};

export default ToDoPage;
