import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { AppData } from '../../StaticClasses/AppData';
import { IoIosArrowBack } from 'react-icons/io';
import {
    FaCheck, FaCalendarDay, FaTimes, FaClock,
    FaTasks, FaLayerGroup, FaPen, FaSave, FaPlus,
    FaExclamationTriangle, FaChevronDown, FaChevronUp,
    FaBullseye, FaAward, FaTrash, FaCheckCircle,
    FaEye, FaEyeSlash, FaFire, FaSearch
} from "react-icons/fa";
import {
    redactGoal, deleteGoal, toggleGoal, toggleSubGoal,
    deleteSubGoal, addSubGoal, updateSubGoal,
    setOrRedactSubgoalAim,
    setOrRedactSubgoalResult,
    addOrRedactResult,
    setTodoFieldVisibility,
    moveSubGoal
} from "./ToDoHelper";
import { selectedTodo$, theme$, lang$, fontSize$, setPage, lastPage$ } from '../../StaticClasses/HabitsBus';
import { buildTodoAccent, getTodoCategoryTone, TODO_CUSTOM_ICON_GROUPS, TODO_CUSTOM_ICON_MAP } from './ToDoVisuals.js';

// --- CONSTANTS ---
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not Urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very Urgent'], ['ASAP', 'ASAP']];
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];
const URGENCY_COLORS = ['#81C784', '#64B5F6', '#FFD54F', '#FF8A65', '#E57373'];
const HEADER_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 18px)';
const EDITABLE_TASK_FIELDS = ['name', 'description', 'difficulty', 'priority', 'category', 'icon', 'color', 'startDate', 'deadLine', 'note', 'urgency'];

const cloneTask = (item) => (item ? JSON.parse(JSON.stringify(item)) : null);

const editableSnapshot = (item) => {
    if (!item) return {};
    return EDITABLE_TASK_FIELDS.reduce((acc, field) => {
        if (field === 'difficulty' || field === 'priority' || field === 'urgency') acc[field] = item[field] ?? 0;
        else acc[field] = item[field] ?? '';
        return acc;
    }, {});
};

const applyEditableFields = (target, source) => EDITABLE_TASK_FIELDS.reduce((acc, field) => ({
    ...acc,
    [field]: source?.[field]
}), { ...target });

const normalizeTaskEmoji = (value) => {
    const compact = String(value || '').trim().replace(/\s+/g, '');
    if (!compact) return '';
    const match = compact.match(/\p{Extended_Pictographic}(?:\uFE0F|\u200D|\p{Extended_Pictographic})*/u);
    return match?.[0] || Array.from(compact)[0] || '';
};

const emojiFromTaskIcon = (icon) => (typeof icon === 'string' && icon.startsWith('emoji:') ? icon.slice(6).trim() : '');
const TODO_ICON_SEARCH_TERMS = {
    briefcase: 'портфель работа проект бизнес офис',
    clipboard: 'список чеклист задачи план',
    'calendar-check': 'календарь дата событие дедлайн',
    chart: 'график аналитика статистика рост',
    code: 'код разработка программирование сайт',
    folder: 'папка файлы документы',
    pin: 'пин закрепить важное',
    tools: 'инструменты ремонт настройка',
    tag: 'тег метка ярлык',
    star: 'звезда избранное важное',
    target: 'цель фокус мишень',
    idea: 'идея лампа мысль',
    puzzle: 'пазл задача решение',
    rocket: 'ракета запуск старт',
    home: 'дом семья быт',
    world: 'мир глобус поездка',
    heart: 'сердце здоровье пульс',
    dumbbell: 'гантели спорт тренировка',
    fire: 'огонь срочно энергия',
    seedling: 'растение рост привычка',
    brain: 'мозг учеба мысль',
    lab: 'лаборатория колба эксперимент',
    shopping: 'покупки корзина магазин',
    money: 'деньги финансы оплата',
    phone: 'телефон звонок связь',
    mail: 'почта письмо сообщение',
    car: 'машина авто дорога',
    camera: 'камера фото снимок',
    book: 'книга чтение учеба',
    graduation: 'учеба выпуск образование',
    paint: 'кисть рисование творчество',
    music: 'музыка ноты звук',
    film: 'фильм видео кино'
};
const matchesTodoIconQuery = (iconKey, query) => (
    !query ||
    iconKey.toLowerCase().includes(query) ||
    (TODO_ICON_SEARCH_TERMS[iconKey] || '').toLowerCase().includes(query)
);

const ToDoPage = () => {
    const [task, setTask] = useState(null);
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    const [newSubGoalText, setNewSubGoalText] = useState('');
    const [showDeleteWarning, setShowDeleteWarning] = useState(null);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showIconModal, setShowIconModal] = useState(false);
    const [taskResultText, setTaskResultText] = useState('');
    const [taskEmojiInput, setTaskEmojiInput] = useState('');
    const [taskIconSearch, setTaskIconSearch] = useState('');
    const [expandedSubGoals, setExpandedSubGoals] = useState({});
    const [editingFields, setEditingFields] = useState({});

    const [editingSubGoalIndex, setEditingSubGoalIndex] = useState(null);
    const [editingSubGoalText, setEditingSubGoalText] = useState('');
    const [accentColor] = useState(buildTodoAccent(AppData.todoAccentColor || '#149DFF').hue);
    const [fieldsVisibility, setFieldsVisibility] = useState({ difficulty: true, urgency: true, startDate: true, deadLine: true, ...(AppData.todoFieldsVisibility || {}) });

    const resultInputRef = useRef(null);
    const aimInputRef = useRef(null);
    const subGoalTextInputRef = useRef(null);
    const originalTaskRef = useRef(null);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
            selectedTodo$.subscribe((t) => {
                if (t) {
                    const nextTask = cloneTask(t);
                    originalTaskRef.current = cloneTask(t);
                    setTask(nextTask);
                    setTaskResultText(t.result || '');
                    setTaskEmojiInput(emojiFromTaskIcon(t.icon));
                    setTaskIconSearch('');
                    setEditingSubGoalIndex(null);
                    setEditingSubGoalText('');
                    setExpandedSubGoals({});
                    setEditingFields({});
                    setFieldsVisibility({ difficulty: true, urgency: true, startDate: true, deadLine: true, ...(AppData.todoFieldsVisibility || {}) });
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
    const hasTaskChanges = useMemo(() => (
        JSON.stringify(editableSnapshot(task)) !== JSON.stringify(editableSnapshot(originalTaskRef.current))
    ), [task]);

    if (!task) return null;

    const totalGoals = task.goals?.length || 0;
    const completedGoals = task.goals?.filter(g => g.isDone).length || 0;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);
    const difficultyIndex = normalizeScaleIndex(task.difficulty, DIFFICULTY_LABELS.length, 2);
    const urgencyIndex = normalizeScaleIndex(task.urgency ?? task.priority, URGENCY_LABELS.length, 1);
    const s = styles(theme, fSize, accentColor);
    const pageAccent = buildTodoAccent(accentColor);
    const categoryTone = getTodoCategoryTone(task.category, pageAccent, task.icon);
    const TaskIcon = categoryTone.icon;
    const taskIconQuery = taskIconSearch.trim().toLowerCase();
    const taskIconGroups = TODO_CUSTOM_ICON_GROUPS
        .map((group) => {
            const groupMatch = group.label.some(label => label.toLowerCase().includes(taskIconQuery));
            const icons = group.icons.filter(iconKey => groupMatch || matchesTodoIconQuery(iconKey, taskIconQuery));
            return { ...group, icons };
        })
        .filter(group => group.icons.length > 0);

    const persistTask = async () => {
        const cleanTask = {
            ...task,
            name: (task.name || '').trim() || (lang === 0 ? 'Без названия' : 'Untitled'),
            description: task.description || '',
            deadLine: task.deadLine || null
        };
        setTask(cleanTask);
        selectedTodo$.next(cleanTask);
        originalTaskRef.current = cloneTask(cleanTask);
        await redactGoal(
            cleanTask.id,
            cleanTask.name,
            cleanTask.description,
            cleanTask.difficulty,
            cleanTask.priority,
            cleanTask.category,
            cleanTask.icon,
            cleanTask.color,
            cleanTask.startDate,
            cleanTask.deadLine,
            cleanTask.note,
            cleanTask.urgency
        );
    };

    const updateTaskField = (field, value) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };

    const handleCancelTaskChanges = () => {
        const original = originalTaskRef.current;
        if (!original) return;
        setTask(prev => applyEditableFields(prev, original));
    };

    const handleSaveTaskChanges = async () => {
        if (!hasTaskChanges) return;
        await persistTask();
    };

    const openIconModal = () => {
        setTaskEmojiInput(emojiFromTaskIcon(task.icon));
        setTaskIconSearch('');
        setShowIconModal(true);
    };

    const applyTaskEmoji = () => {
        const emoji = normalizeTaskEmoji(taskEmojiInput);
        if (!emoji) return;
        updateTaskField('icon', `emoji:${emoji}`);
        setTaskEmojiInput(emoji);
        setShowIconModal(false);
    };

    const applyPresetIcon = (iconKey) => {
        updateTaskField('icon', iconKey);
        setTaskEmojiInput('');
        setShowIconModal(false);
    };

    const resetTaskIcon = () => {
        updateTaskField('icon', '');
        setTaskEmojiInput('');
        setShowIconModal(false);
    };

    const toggleFieldVisibility = async (field) => {
        const nextVisible = !fieldsVisibility[field];
        setFieldsVisibility(prev => ({ ...prev, [field]: nextVisible }));
        await setTodoFieldVisibility(field, nextVisible);
    };

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
        setEditingSubGoalIndex(index);
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
        setEditingSubGoalIndex(null);
        setEditingSubGoalText('');
    };

    const handleEditingSubGoalTextChange = (text) => {
       setEditingSubGoalText(text);
    };

    const handleCancelSubGoalEdit = (index, field) => {
        setEditingFields(prev => ({ ...prev, [`${index}-${field}`]: false }));
        setEditingSubGoalIndex(null);
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

    const handleMoveSub = async (index, direction) => {
        if (!task.goals) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= task.goals.length) return;

        const newGoals = [...task.goals];
        const [movedGoal] = newGoals.splice(index, 1);
        newGoals.splice(targetIndex, 0, movedGoal);

        setTask(prev => ({ ...prev, goals: newGoals }));
        setExpandedSubGoals(prev => {
            const next = {};
            Object.entries(prev).forEach(([key, value]) => {
                const numericKey = Number(key);
                if (numericKey === index) next[targetIndex] = value;
                else if (numericKey === targetIndex) next[index] = value;
                else next[numericKey] = value;
            });
            return next;
        });
        await moveSubGoal(task.id, index, targetIndex);
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
            style={s.pageRoot}
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

            <AnimatePresence>
                {showIconModal && (
                    <motion.div
                        style={s.iconPickerOverlay}
                        onClick={() => setShowIconModal(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            style={s.iconPickerSheet}
                            onClick={(e) => e.stopPropagation()}
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                        >
                            <div style={s.iconPickerHandle} />
                            <div style={s.iconPickerHeader}>
                                <h3 style={s.iconPickerTitle}>{lang === 0 ? 'Выбрать иконку' : 'Choose icon'}</h3>
                                <button
                                    type="button"
                                    onClick={() => setShowIconModal(false)}
                                    style={s.iconPickerClose}
                                    aria-label={lang === 0 ? 'Закрыть' : 'Close'}
                                >
                                    <FaTimes size={18} />
                                </button>
                            </div>

                            <div style={s.iconPickerSearch}>
                                <FaSearch size={16} color={Colors.get('subText', theme)} />
                                <input
                                    type="text"
                                    value={taskIconSearch}
                                    onChange={(e) => setTaskIconSearch(e.target.value)}
                                    placeholder={lang === 0 ? 'Поиск иконки...' : 'Search icon...'}
                                    style={s.iconPickerSearchInput}
                                />
                            </div>

                            <div style={s.presetIconSection}>
                                {taskIconGroups.map((group) => (
                                    <div key={group.id} style={s.presetIconGroup}>
                                        <div style={s.presetIconGroupTitle}>{group.label[lang]}</div>
                                        <div style={s.presetIconGrid}>
                                            {group.icons.map((iconKey) => {
                                                const PresetIcon = TODO_CUSTOM_ICON_MAP[iconKey];
                                                if (!PresetIcon) return null;
                                                return (
                                                    <motion.button
                                                        type="button"
                                                        key={iconKey}
                                                        whileTap={{ scale: 0.92 }}
                                                        onClick={() => applyPresetIcon(iconKey)}
                                                        style={s.presetIconButton(task.icon === iconKey, categoryTone)}
                                                        aria-label={iconKey}
                                                    >
                                                        <PresetIcon size={22} />
                                                    </motion.button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                                {taskIconGroups.length === 0 && (
                                    <div style={s.iconPickerEmpty}>{lang === 0 ? 'Ничего не найдено' : 'Nothing found'}</div>
                                )}
                            </div>

                            {task.icon && (
                                <button type="button" onClick={resetTaskIcon} style={s.resetIconInlineBtn}>
                                    {lang === 0 ? 'Сбросить иконку' : 'Reset icon'}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOP BAR */}
            <div style={s.topBar}>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.9 }}
                    onClick={goBack}
                    style={s.roundTopBtn}
                    aria-label={lang === 0 ? 'Назад' : 'Back'}
                >
                    <IoIosArrowBack size={24} color={Colors.get('mainText', theme)} style={{ display: 'block', flexShrink: 0 }} />
                </motion.button>
                <div style={s.topTitleBlock}>
                    <div style={s.topEyebrow}>{lang === 0 ? 'ЗАДАЧА' : 'TASK'}</div>
                    <div style={s.topTitle}>{task.category || (lang === 0 ? 'Общее' : 'General')}</div>
                </div>
                <div style={s.topSpacer} />
            </div>

            {/* CONTENT */}
            <div style={s.headerWrapper}>
                <div style={s.fixedHeader}>
                    <div style={s.headerLeft}>
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.92 }}
                            onClick={openIconModal}
                            style={s.iconBadgeButton(categoryTone)}
                            aria-label={lang === 0 ? 'Изменить эмодзи задачи' : 'Change task emoji'}
                        >
                            <TaskIcon size={22} />
                            <span style={s.iconEditMark}>
                                <FaPen size={9} />
                            </span>
                        </motion.button>
                    </div>
                    <div style={s.headerCenter}>
                        <input
                            type="text"
                            placeholder={lang === 0 ? 'Название' : 'Name'}
                            value={task.name || ''}
                            onChange={(e) => updateTaskField('name', e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            style={s.titleInput}
                        />
                        <div style={s.categoryPill(categoryTone)}>
                            <TaskIcon size={11} />
                            <span>{task.category || (lang === 0 ? 'Общее' : 'General')}</span>
                        </div>
                    </div>
                </div>

                <div style={s.heroSummaryGrid}>
                    <div style={s.heroSummaryChip(DIFFICULTY_COLORS[difficultyIndex])}>
                        <FaLayerGroup size={10} />
                        <span>{DIFFICULTY_LABELS[difficultyIndex][lang]}</span>
                    </div>
                    <div style={s.heroSummaryChip(URGENCY_COLORS[urgencyIndex])}>
                        <FaFire size={10} />
                        <span>{URGENCY_LABELS[urgencyIndex][lang]}</span>
                    </div>
                    <div style={s.heroSummaryChip(accentColor)}>
                        <FaCalendarDay size={10} />
                        <span>{formatDateForDisplay(task.deadLine, lang === 0 ? 'Без срока' : 'No due')}</span>
                    </div>
                    <div style={s.heroSummaryChip(categoryTone.hue)}>
                        <FaTasks size={10} />
                        <span>{completedGoals}/{totalGoals}</span>
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
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                    <textarea
                        placeholder={lang === 0 ? 'Описание' : 'Description'}
                        value={task.description || ''}
                        onChange={(e) => updateTaskField('description', e.target.value)}
                        style={s.descriptionInput}
                        rows={3}
                    />
                </div>

                <div style={s.parameterSection}>
                    <div style={s.parameterSectionTitle}>
                        <FaLayerGroup />
                        <span>{lang === 0 ? 'ПАРАМЕТРЫ' : 'PARAMETERS'}</span>
                    </div>
                    <div style={s.parameterCards}>
                        <AnimatePresence initial={false}>
                            {fieldsVisibility.difficulty && (
                                <motion.div
                                    key="difficulty"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <ParameterScaleCard
                                        icon={<FaLayerGroup size={13} />}
                                        label={lang === 0 ? 'Сложность' : 'Difficulty'}
                                        value={task.difficulty ?? 2}
                                        labels={DIFFICULTY_LABELS.map(item => item[lang])}
                                        colors={DIFFICULTY_COLORS}
                                        theme={theme}
                                        accentColor={accentColor}
                                        onChange={(value) => updateTaskField('difficulty', value)}
                                        onHide={() => toggleFieldVisibility('difficulty')}
                                    />
                                </motion.div>
                            )}
                            {fieldsVisibility.urgency && (
                                <motion.div
                                    key="urgency"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <ParameterScaleCard
                                        icon={<FaFire size={13} />}
                                        label={lang === 0 ? 'Срочность' : 'Urgency'}
                                        value={task.urgency ?? 1}
                                        labels={URGENCY_LABELS.map(item => item[lang])}
                                        colors={URGENCY_COLORS}
                                        theme={theme}
                                        accentColor={accentColor}
                                        onChange={(value) => updateTaskField('urgency', value)}
                                        onHide={() => toggleFieldVisibility('urgency')}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence initial={false}>
                            {(fieldsVisibility.startDate || fieldsVisibility.deadLine) && (
                                <motion.div
                                    key="dates"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div style={s.dateParamGrid}>
                                        {fieldsVisibility.startDate && (
                                            <DateParameterCard
                                                icon={<FaCalendarDay size={13} />}
                                                label={lang === 0 ? 'Старт' : 'Start'}
                                                value={task.startDate}
                                                theme={theme}
                                                accentColor={accentColor}
                                                onChange={(v) => updateTaskField('startDate', v)}
                                                onHide={() => toggleFieldVisibility('startDate')}
                                            />
                                        )}
                                        {fieldsVisibility.deadLine && (
                                            <DateParameterCard
                                                icon={<FaClock size={13} />}
                                                label={lang === 0 ? 'Дедлайн' : 'Deadline'}
                                                value={task.deadLine}
                                                emptyLabel={lang === 0 ? 'Без дедлайна' : 'No deadline'}
                                                clearable
                                                theme={theme}
                                                accentColor={accentColor}
                                                onChange={(v) => updateTaskField('deadLine', v)}
                                                onHide={() => toggleFieldVisibility('deadLine')}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {(!fieldsVisibility.difficulty || !fieldsVisibility.urgency || !fieldsVisibility.startDate || !fieldsVisibility.deadLine) && (
                            <div style={s.parameterRestoreRow}>
                                {!fieldsVisibility.difficulty && (
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => toggleFieldVisibility('difficulty')}
                                        style={s.restoreParamChip}
                                    >
                                        <FaEye size={11} color={accentColor} />
                                        <FaLayerGroup size={11} />
                                        <span>{lang === 0 ? 'Сложность' : 'Difficulty'}</span>
                                    </motion.button>
                                )}
                                {!fieldsVisibility.urgency && (
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => toggleFieldVisibility('urgency')}
                                        style={s.restoreParamChip}
                                    >
                                        <FaEye size={11} color={accentColor} />
                                        <FaFire size={11} />
                                        <span>{lang === 0 ? 'Срочность' : 'Urgency'}</span>
                                    </motion.button>
                                )}
                                {!fieldsVisibility.startDate && (
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => toggleFieldVisibility('startDate')}
                                        style={s.restoreParamChip}
                                    >
                                        <FaEye size={11} color={accentColor} />
                                        <FaCalendarDay size={11} />
                                        <span>{lang === 0 ? 'Старт' : 'Start'}</span>
                                    </motion.button>
                                )}
                                {!fieldsVisibility.deadLine && (
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => toggleFieldVisibility('deadLine')}
                                        style={s.restoreParamChip}
                                    >
                                        <FaEye size={11} color={accentColor} />
                                        <FaClock size={11} />
                                        <span>{lang === 0 ? 'Дедлайн' : 'Deadline'}</span>
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </div>
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
                                        onMove={(direction) => handleMoveSub(idx, direction)}
                                        canMoveUp={idx > 0}
                                        canMoveDown={idx < (task.goals?.length || 0) - 1}
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
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleToggleMainTask}
                    style={s.completeBtn(task.isDone)}
                >
                    <FaCheckCircle size={13} />
                    {task.isDone ? (lang === 0 ? 'Вернуть в работу' : 'Reopen task') : (lang === 0 ? 'Выполнено' : 'Complete task')}
                </motion.button>
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowDeleteWarning('main')}
                    style={s.deleteBtn}
                >
                    <FaTrash size={12} />
                    {lang === 0 ? 'Удалить задачу' : 'Delete task'}
                </motion.button>
            </div>
            <div style={s.editActionBar}>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={goBack}
                    style={s.editBackBtn}
                >
                    <IoIosArrowBack size={18} />
                    <span>{lang === 0 ? 'Назад' : 'Back'}</span>
                </motion.button>
                <motion.button
                    type="button"
                    whileTap={{ scale: hasTaskChanges ? 0.94 : 1 }}
                    disabled={!hasTaskChanges}
                    onClick={handleCancelTaskChanges}
                    style={s.editCancelBtn(hasTaskChanges)}
                >
                    <FaTimes size={13} />
                    <span>{lang === 0 ? 'Отменить' : 'Cancel'}</span>
                </motion.button>
                <motion.button
                    type="button"
                    whileTap={{ scale: hasTaskChanges ? 0.96 : 1 }}
                    disabled={!hasTaskChanges}
                    onClick={handleSaveTaskChanges}
                    style={s.editSaveBtn(hasTaskChanges)}
                >
                    <FaSave size={13} />
                    <span>{lang === 0 ? 'Сохранить' : 'Save'}</span>
                </motion.button>
            </div>
        </motion.div>
    );
};

// --- SUB-GOAL CARD COMPONENT ---
const SubGoalCard = ({
    goal, index, idx, isExpanded, onToggleExpand, onToggleComplete, onMove, canMoveUp, canMoveDown, onDelete,
    task, theme, lang, editingFields, editingSubGoalText, onEditField, onSaveField,
    onCancelEdit, onKeyDown, aimInputRef, subGoalTextInputRef, onEditingTextChange
}) => {
    const s = styles(theme, null, task.color);
    const border = Colors.get('border', theme);
    const sub = Colors.get('subText', theme);
    const hasAim = !!goal.aim;
    const hasResult = !!goal.result;
    const confirmSubGoalEdit = async (event) => {
        event.stopPropagation();
        const activeField = ['text', 'aim', 'result'].find(field => editingFields[`${index}-${field}`]);
        if (activeField) await onSaveField(index, activeField);
        onToggleExpand(index);
    };

    return (
        <div style={{ ...s.subGoalCard, border: goal.isDone ? `2px solid #2ed177` : `1px solid ${border}30` }}>
            <div style={s.subGoalMainRow}>
                <div
                    onClick={(e) => { e.stopPropagation(); onToggleComplete(index); }}
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
                            onChange={(e) => onEditingTextChange(e.target.value)}
                            onKeyDown={(e) => onKeyDown(e, index, 'text')}
                            onClick={(e) => e.stopPropagation()}
                            style={s.inlineEditInput}
                            autoFocus
                        />
                    ) : (
                        <div style={s.subGoalTextWrap}>
                            <div style={s.subGoalText(goal.isDone)}>{goal.text}</div>
                            <div style={s.subGoalMetaRow}>
                                <span style={s.subGoalStatus(goal.isDone)}>
                                    {goal.isDone ? (lang === 0 ? 'Готово' : 'Done') : (lang === 0 ? 'Шаг' : 'Step')}
                                </span>
                                {hasAim && (
                                    <span style={s.subGoalMetaChip}>
                                        <FaBullseye size={9} />
                                        {lang === 0 ? 'Цель' : 'Aim'}
                                    </span>
                                )}
                                {hasResult && (
                                    <span style={s.subGoalMetaChip}>
                                        <FaAward size={9} />
                                        {lang === 0 ? 'Результат' : 'Result'}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={s.subGoalActions}>
                    {editingFields[`${index}-text`] ? (
                        <>
                            <div onClick={(e) => { e.stopPropagation(); onSaveField(index, 'text'); }} style={s.actionBtn}>
                                <FaSave size={12} color={task.color} />
                            </div>
                            <div onClick={(e) => { e.stopPropagation(); onCancelEdit(index, 'text'); }} style={{ ...s.actionBtn, color: sub }}>
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
                                    {lang === 0 ? 'Цель / заметка' : 'Aim / note'}
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

                        <div style={s.expandedField}>
                            <div style={s.fieldHeader}>
                                <FaAward size={14} color="#2ed177" />
                                <span style={{ ...s.fieldTitle, color: goal.isDone ? '#2ed177' : sub }}>
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

                        <div style={s.subGoalFooterActions}>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                onClick={confirmSubGoalEdit}
                                style={s.subGoalFooterBtn('done')}
                            >
                                <FaCheck size={10} />
                                {lang === 0 ? 'Готово' : 'Done'}
                            </motion.button>
                            <motion.button
                                type="button"
                                whileTap={{ scale: canMoveUp ? 0.96 : 1 }}
                                disabled={!canMoveUp}
                                onClick={() => onMove(-1)}
                                style={s.subGoalIconBtn(!canMoveUp)}
                            >
                                <FaChevronUp size={10} />
                            </motion.button>
                            <motion.button
                                type="button"
                                whileTap={{ scale: canMoveDown ? 0.96 : 1 }}
                                disabled={!canMoveDown}
                                onClick={() => onMove(1)}
                                style={s.subGoalIconBtn(!canMoveDown)}
                            >
                                <FaChevronDown size={10} />
                            </motion.button>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.96 }}
                                onClick={onDelete}
                                style={s.subGoalFooterBtn('danger')}
                            >
                                <FaTrash size={10} />
                                {lang === 0 ? 'Удалить' : 'Delete'}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const normalizeScaleIndex = (value, length, fallback = 0) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.max(0, Math.min(length - 1, numericValue));
};

const ParameterScaleCard = ({ icon, label, value, labels, colors, theme, accentColor, onChange, onHide }) => {
    const s = styles(theme, null, accentColor);
    const activeIndex = normalizeScaleIndex(value, labels.length, 0);
    const activeColor = colors[activeIndex] || accentColor;
    return (
        <div style={s.parameterCard}>
            <div style={s.parameterHead}>
                <span style={{ ...s.parameterIcon, color: activeColor }}>{icon}</span>
                <span style={s.parameterLabel}>{label}</span>
                <span style={{ ...s.parameterValue, color: activeColor }}>{labels[activeIndex]}</span>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.86 }}
                    onClick={onHide}
                    style={s.hideParamBtn}
                    aria-label="Скрыть параметр"
                >
                    <FaEyeSlash size={11} />
                </motion.button>
            </div>
            <div style={s.scaleTrack}>
                <div style={s.scaleFill(activeIndex, labels.length, activeColor)} />
                {labels.map((_, index) => {
                    const color = colors[index] || activeColor;
                    const active = index <= activeIndex;
                    return (
                        <motion.button
                            key={index}
                            type="button"
                            whileTap={{ scale: 0.86 }}
                            onClick={() => onChange(index)}
                            style={s.scaleNode(active, index === activeIndex, color)}
                            aria-label={labels[index]}
                        />
                    );
                })}
            </div>
            <div style={s.scaleDots}>
                {labels.map((item, index) => (
                    <span key={`${item}-${index}`} style={s.scaleDot(index === activeIndex, colors[index] || activeColor)}>
                        {index === activeIndex ? '●' : '·'}
                    </span>
                ))}
            </div>
        </div>
    );
};

const DateParameterCard = ({ icon, label, value, emptyLabel, clearable, theme, accentColor, onChange, onHide }) => {
    const s = styles(theme, null, accentColor);
    const inputRef = useRef(null);
    const displayValue = formatDateForDisplay(value, emptyLabel || '—');
    const openPicker = () => {
        if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker();
        else inputRef.current?.focus();
    };

    return (
        <motion.div whileTap={{ scale: 0.99 }} onClick={openPicker} style={{ ...s.parameterCard, ...s.dateParameterCard }}>
            <div style={s.parameterHead}>
                <span style={{ ...s.parameterIcon, color: accentColor }}>{icon}</span>
                <span style={s.parameterLabel}>{label}</span>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.86 }}
                    onClick={(e) => { e.stopPropagation(); onHide(); }}
                    style={s.hideParamBtn}
                    aria-label="Скрыть параметр"
                >
                    <FaEyeSlash size={11} />
                </motion.button>
            </div>
            <div style={s.dateParamBody}>
                <div style={s.dateParamIcon}>{icon}</div>
                <span style={s.dateParamValue(value)}>{displayValue}</span>
                {clearable && value && (
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.86 }}
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                        style={s.dateParamClear}
                        aria-label="Очистить дату"
                    >
                        <FaTimes size={10} />
                    </motion.button>
                )}
                <input
                    ref={inputRef}
                    type="date"
                    value={value || ''}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onChange(e.target.value)}
                    style={s.dateParamInput}
                />
            </div>
        </motion.div>
    );
};

const DateBox = ({ label, value, icon, isEditing, theme, onChange, emptyLabel, clearable }) => {
    const s = styles(theme);
    const inputRef = useRef(null);
    const displayValue = formatDateForDisplay(value, emptyLabel || '-');
    const openPicker = () => {
        if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker();
        else inputRef.current?.focus();
    };
    return (
        <div style={s.dateItem} onClick={isEditing ? openPicker : undefined}>
            <div style={s.dateIcon}>{icon}</div>
            <div style={{display:'flex', flexDirection:'column', flex: 1, minWidth: 0}}>
                <span style={s.label}>{label}</span>
                {isEditing ? (
                    <div style={s.dateInputWrap}>
                        <span style={s.dateDisplay(value)}>{displayValue}</span>
                        <input ref={inputRef} type="date" style={s.dateInput} value={value || ''} onChange={(e) => onChange(e.target.value)} />
                        {clearable && value && (
                            <motion.div whileTap={{ scale: 0.9 }} onClick={(event) => { event.stopPropagation(); onChange(''); }}
                                style={s.clearDateBtn}>
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

function formatDateForDisplay(value, fallback) {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// --- STYLES ---
const styles = (theme, fSize, rawAccentColor) => {
    const accent = buildTodoAccent(rawAccentColor || AppData.todoAccentColor || '#149DFF');
    const accentColor = accent.hue;
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = Colors.get('background', theme);
    const panel = isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.052)';
    const panelStrong = isLight ? 'rgba(255,255,255,0.86)' : 'rgba(24,32,39,0.58)';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
    const glassPanel = isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.074), rgba(255,255,255,0.028))';
    const glassShadow = isLight
        ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
        : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)';

    return {
        pageRoot: {
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 148px)',
            overflowY: 'auto',
            background: isLight
                ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgbText},0.1), transparent 66%), #F4F5F7`
                : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgbText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${bg} 46%, #10161A 100%)`,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            color: text
        },
        warningOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, boxSizing: 'border-box' },
        warningBox: { backgroundColor: panelStrong, borderRadius: 24, padding: 25, width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center', border: `1px solid ${border}` },
        cancelBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        confirmDeleteBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: '#F44336', color: '#fff', fontWeight: 'bold' },

        resultModalBox: { backgroundColor: panelStrong, borderRadius: 24, padding: 25, width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', border: `1px solid ${border}` },
        resultModalHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 15 },
        resultTextarea: { width: '100%', padding: '12px', borderRadius: 12, border: `1px solid ${border}`, backgroundColor: panel, color: text, fontSize: '16px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
        skipBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: border, color: text, fontWeight: 'bold' },
        saveResultBtn: { flex: 1, padding: '12px', borderRadius: 12, border: 'none', backgroundColor: accentColor, color: '#fff', fontWeight: 'bold' },
        iconPickerOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' },
        iconPickerSheet: { width: '100%', maxWidth: 660, maxHeight: '88vh', margin: '0 auto', borderRadius: '30px 30px 0 0', padding: '14px 23px max(22px, env(safe-area-inset-bottom, 0px))', overflowY: 'auto', background: `linear-gradient(180deg, ${panelStrong}, ${panel})`, border: `1px solid ${border}`, borderBottom: 'none', boxShadow: glassShadow, boxSizing: 'border-box', WebkitOverflowScrolling: 'touch', backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)' },
        iconPickerHandle: { width: 45, height: 5, backgroundColor: '#8E8E93', borderRadius: 3, margin: '1px auto 25px', opacity: 0.55 },
        iconPickerHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 },
        iconPickerTitle: { margin: 0, color: text, fontSize: 20, fontWeight: 950, lineHeight: 1.1 },
        iconPickerClose: { width: 44, height: 44, borderRadius: 999, border: `1px solid ${border}`, background: panel, color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', flexShrink: 0 },
        iconPickerSearch: { height: 40, borderRadius: 16, border: `1px solid ${border}`, background: panel, display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 15, boxSizing: 'border-box' },
        iconPickerSearchInput: { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: text, fontSize: 14, fontWeight: 700, fontFamily: 'inherit' },
        iconPickerEmpty: { minHeight: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, fontSize: 13, fontWeight: 800 },
        resetIconInlineBtn: { width: '100%', minHeight: 44, marginTop: 5, borderRadius: 14, border: `1px solid rgba(244,67,54,0.2)`, backgroundColor: 'rgba(244,67,54,0.08)', color: '#E57373', fontWeight: 'bold' },
        emojiModalBox: { backgroundColor: panelStrong, borderRadius: 24, padding: 18, width: '100%', maxWidth: 360, maxHeight: 'min(82vh, 650px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', border: `1px solid ${border}`, boxShadow: glassShadow, boxSizing: 'border-box', WebkitOverflowScrolling: 'touch' },
        emojiModalHeader: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 14 },
        emojiPreviewLarge: (tone = accent) => ({ width: 64, height: 64, borderRadius: 21, marginBottom: 12, backgroundColor: tone.soft, border: `1px solid ${tone.ring}`, color: tone.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, lineHeight: 1, boxShadow: `0 18px 34px -24px rgba(${accent.rgbText},0.78), 0 1px 0 rgba(255,255,255,0.12) inset` }),
        emojiModalTitle: { color: text, fontSize: 18, fontWeight: 950, lineHeight: 1.12 },
        emojiModalSub: { marginTop: 7, color: sub, fontSize: 12, fontWeight: 750, lineHeight: 1.35, maxWidth: 280 },
        presetIconSection: { display: 'flex', flexDirection: 'column', gap: 17, marginTop: 0, marginBottom: 10 },
        presetIconSectionTitle: { color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: 2, marginBottom: 7 },
        presetIconGroup: { display: 'flex', flexDirection: 'column', gap: 11 },
        presetIconGroupTitle: { color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1, paddingLeft: 0 },
        presetIconGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 12 },
        presetIconButton: (active, tone = accent) => ({ aspectRatio: '1 / 1', minWidth: 0, borderRadius: 17, border: `1px solid ${active ? tone.ring : border}`, background: active ? tone.soft : panel, color: active ? tone.hue : sub, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', boxShadow: active ? `0 10px 22px -18px ${tone.ring}` : '0 1px 0 rgba(255,255,255,0.05) inset', outline: 'none', WebkitTapHighlightColor: 'transparent' }),
        manualEmojiLabel: { marginBottom: 7, color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: 2 },
        emojiInput: { width: '100%', height: 54, borderRadius: 17, border: `1px solid ${border}`, backgroundColor: panel, color: text, fontSize: 28, lineHeight: 1, textAlign: 'center', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', boxShadow: '0 1px 0 rgba(255,255,255,0.055) inset' },
        emojiModalActions: { display: 'grid', gridTemplateColumns: '0.85fr 1fr 1fr', gap: 9, marginTop: 14 },
        resetIconBtn: { flex: 1, padding: '12px', borderRadius: 12, border: `1px solid rgba(244,67,54,0.18)`, backgroundColor: 'rgba(244,67,54,0.07)', color: '#E57373', fontWeight: 'bold' },

        topBar: { display: 'grid', gridTemplateColumns: '44px minmax(0, 1fr) 44px', alignItems: 'center', gap: 10, padding: `${HEADER_TOP_PADDING} 18px 0`, minHeight: 54 },
        roundTopBtn: {
            width: 40,
            height: 40,
            borderRadius: 999,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.12)'}`,
            background: panelStrong,
            color: text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
            outline: 'none',
            backdropFilter: 'blur(18px)',
            boxShadow: isLight ? '0 10px 24px rgba(15,23,42,0.08)' : '0 14px 28px rgba(0,0,0,0.28)'
        },
        topSpacer: { width: 40, height: 40 },
        colorDotInline: {
            width: 8,
            height: 8,
            borderRadius: 999,
            background: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
            flexShrink: 0
        },
        topTitleBlock: { minWidth: 0, textAlign: 'center' },
        topEyebrow: { color: accentColor, fontSize: 10, fontWeight: 950, letterSpacing: 1.6 },
        topTitle: { color: sub, fontSize: 12, fontWeight: 800, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },

        headerWrapper: { margin: '8px 18px 0', padding: '14px 15px 13px', borderRadius: 22, background: `radial-gradient(220px 150px at 100% 0%, ${accent.soft} 0%, transparent 68%), ${glassPanel}`, border: `1px solid ${border}`, backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)', boxShadow: glassShadow },
        heroTopLine: { display: 'none' },
        fixedHeader: { display: 'flex', alignItems: 'center', padding: 0, gap: 13, textAlign: 'left' },
        headerLeft: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
        mainCheckbox: (checked) => ({
            width: 32, height: 32, borderRadius: 8,
            border: `2px solid ${checked ? accentColor : border}`,
            backgroundColor: checked ? accentColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s ease'
        }),
        iconBadge: (tone = accent) => ({ width: 54, height: 54, borderRadius: 18, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tone.soft, border: `1px solid ${tone.ring}`, color: tone.hue, flexShrink: 0 }),
        iconBadgeButton: (tone = accent) => ({ width: 54, height: 54, borderRadius: 18, fontSize: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tone.soft, border: `1px solid ${tone.ring}`, color: tone.hue, flexShrink: 0, position: 'relative', cursor: 'pointer', padding: 0, fontFamily: 'inherit', outline: 'none', WebkitTapHighlightColor: 'transparent' }),
        iconEditMark: { position: 'absolute', right: -4, bottom: -4, width: 20, height: 20, borderRadius: 999, background: panelStrong, border: `1px solid ${border}`, color: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: glassShadow },
        headerCenter: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 7, minWidth: 0 },
        headerRight: { display: 'flex', width:'100%', alignItems: 'center', flexShrink: 0 },
        title: { fontSize: 24, fontWeight: 950, color: text, margin: 0, width:"100%", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: 0 },
        titleInput: { width: '100%', border: 'none', background: 'transparent', fontSize: '21px', lineHeight: 1.12, fontWeight: '950', color: text, outline: 'none', borderRadius: '12px', padding: '2px 0', boxSizing: 'border-box', textAlign: 'left', letterSpacing: 0 },
        categoryPill: (tone = accent) => ({ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, maxWidth: '100%', padding: '5px 9px', borderRadius: 999, background: tone.soft, border: `1px solid ${tone.ring}`, color: tone.hue, fontSize: 10.5, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
        heroSummaryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8,
            marginTop: 12,
            paddingTop: 11,
            borderTop: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.06)'}`
        },
        heroSummaryChip: (tone = accentColor) => ({
            minWidth: 0,
            minHeight: 30,
            borderRadius: 12,
            padding: '0 10px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.065)' : 'rgba(255,255,255,0.065)'}`,
            color: tone,
            fontSize: 11,
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            boxShadow: `0 8px 18px -18px ${tone}`
        }),
        completeBtn: (isDone) => ({ width: '100%', minHeight: 46, padding: '12px 14px', borderRadius: 14, border: `1px solid ${isDone ? border : 'rgba(46,209,119,0.28)'}`, backgroundColor: isDone ? panel : 'rgba(46,209,119,0.13)', color: isDone ? sub : '#2ed177', fontSize: 13, fontWeight: 900, textAlign: 'center', cursor: 'pointer', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' }),
        deleteBtn: { width: '100%', minHeight: 44, padding: '12px 14px', borderRadius: 14, border: '1px solid rgba(244,67,54,0.16)', backgroundColor: 'rgba(244,67,54,0.06)', color: '#E57373', fontSize: 13, fontWeight: 850, textAlign: 'center', cursor: 'pointer', marginTop: 14, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' },
        editActionBar: {
            position: 'fixed',
            left: '50%',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 36px)',
            maxWidth: 660,
            minHeight: 66,
            display: 'grid',
            gridTemplateColumns: '0.85fr 1fr 1.25fr',
            gap: 9,
            padding: 10,
            borderRadius: 22,
            background: glassPanel,
            border: `1px solid ${border}`,
            boxShadow: glassShadow,
            backdropFilter: 'blur(26px) saturate(170%)',
            WebkitBackdropFilter: 'blur(26px) saturate(170%)',
            boxSizing: 'border-box',
            zIndex: 1200
        },
        editBackBtn: {
            minWidth: 0,
            border: `1px solid ${border}`,
            background: panel,
            color: text,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 900,
            fontFamily: 'inherit',
            cursor: 'pointer'
        },
        editCancelBtn: (enabled) => ({
            minWidth: 0,
            border: `1px solid ${enabled ? 'rgba(244,67,54,0.24)' : border}`,
            background: enabled ? 'rgba(244,67,54,0.08)' : panel,
            color: enabled ? '#E57373' : sub,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 900,
            fontFamily: 'inherit',
            cursor: enabled ? 'pointer' : 'default',
            opacity: enabled ? 1 : 0.58
        }),
        editSaveBtn: (enabled) => ({
            minWidth: 0,
            border: `1px solid ${enabled ? accent.ring : border}`,
            background: enabled ? accent.soft : panel,
            color: enabled ? accentColor : sub,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            fontSize: 12,
            fontWeight: 950,
            fontFamily: 'inherit',
            cursor: enabled ? 'pointer' : 'default',
            opacity: enabled ? 1 : 0.62
        }),

        resultDisplayCard: { backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30`, borderRadius: 16, padding: '16px', marginTop: '16px' },
        resultDisplayHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 },
        resultDisplayTitle: { fontSize: '14px', fontWeight: '700', color: accentColor, flex: 1 },
        editResultBtn: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sub },
        resultDisplayText: { fontSize: '14px', color: text, lineHeight: 1.5, margin: 0, whiteSpace: 'pre-wrap' },

        progressContainer: { width: '100%', marginTop: 12 },
        progressText: { display: 'block', fontSize: 11, fontWeight: 850, color: accentColor, textAlign: 'center' },
        progressBarBg: { width: '100%', height: 6, backgroundColor: border, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
        progressBarFill: { height: '100%', backgroundColor: accentColor, borderRadius: 10 },

        bodyPadding: { padding: '16px 18px calc(env(safe-area-inset-bottom, 0px) + 28px)' },
        parameterSection: { marginBottom: 14 },
        parameterSectionTitle: { display: 'flex', alignItems: 'center', gap: 8, color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.14em', margin: '0 0 9px 4px', textTransform: 'uppercase' },
        parameterCards: { display: 'flex', flexDirection: 'column', gap: 10 },
        parameterCard: { borderRadius: 22, padding: 16, background: glassPanel, border: `1px solid ${border}`, boxShadow: glassShadow, boxSizing: 'border-box', backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)' },
        parameterHead: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 },
        parameterIcon: { display: 'flex', flexShrink: 0 },
        parameterLabel: { color: text, fontSize: 14, fontWeight: 850, flex: 1 },
        parameterValue: { fontSize: 13, fontWeight: 950, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        hideParamBtn: { width: 28, height: 28, borderRadius: 10, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.055)', color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', flexShrink: 0 },
        scaleTrack: { position: 'relative', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', background: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.055)', borderRadius: 999, border: `1px solid ${border}` },
        scaleFill: (value, total, color) => ({ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', height: 4, width: value === 0 || total <= 1 ? 0 : `calc(${(value / (total - 1)) * 100}% - 8px)`, minWidth: 0, background: `linear-gradient(90deg, ${color}66, ${color})`, borderRadius: 999, transition: 'all 0.25s ease' }),
        scaleNode: (active, current, color) => ({ position: 'relative', zIndex: 2, width: current ? 22 : 14, height: current ? 22 : 14, borderRadius: 999, padding: 0, background: active ? color : panelStrong, border: `2px solid ${active ? color : border}`, boxShadow: current ? `0 0 16px ${color}88` : 'none', cursor: 'pointer', transition: 'all 0.2s ease', flexShrink: 0 }),
        scaleDots: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' },
        scaleDot: (active, color) => ({ color: active ? color : sub, fontSize: 9, fontWeight: 850, flex: 1, textAlign: 'center', lineHeight: 1 }),
        parameterRestoreRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
        restoreParamChip: { display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 12, background: accent.soft, border: `1px dashed ${accent.ring}`, color: accentColor, fontSize: 12, fontWeight: 850, cursor: 'pointer', fontFamily: 'inherit' },
        dateParamGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 },
        dateParameterCard: { padding: 14, cursor: 'pointer' },
        dateParamBody: { position: 'relative', display: 'flex', alignItems: 'center', gap: 10, minHeight: 42, padding: '9px 10px', borderRadius: 14, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', border: `1px solid ${border}`, overflow: 'hidden' },
        dateParamIcon: { width: 30, height: 30, borderRadius: 10, color: accentColor, background: accent.soft, border: `1px solid ${accent.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        dateParamValue: (hasValue) => ({ color: hasValue ? text : sub, fontSize: 15, fontWeight: 950, minWidth: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }),
        dateParamClear: { width: 26, height: 26, borderRadius: 9, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.06)', color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', flexShrink: 0, position: 'relative', zIndex: 2 },
        dateParamInput: { position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', pointerEvents: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', zIndex: 1 },

        dateRow: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 22 },
        dateItem: { position: 'relative', flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', backgroundColor: panel, padding: '12px', minHeight: 66, borderRadius: 16, border: `1px solid ${border}`, overflow: 'hidden', cursor: 'pointer', boxSizing: 'border-box' },
        dateIcon: { width: 30, height: 30, borderRadius: 10, color: accentColor, background: accent.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 10, flexShrink: 0 },
        dateInputWrap: { position: 'relative', display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, width: '100%' },
        dateDisplay: (hasValue) => ({ fontSize: 15, fontWeight: 900, color: hasValue ? text : sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0, flex: 1 }),
        dateInput: { position: 'absolute', inset: 0, opacity: 0, width: '100%', pointerEvents: 'none' },
        clearDateBtn: { cursor: 'pointer', color: sub, flexShrink: 0, position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)' },
        label: { fontSize: 9, color: sub, textTransform: 'uppercase', fontWeight: 850, letterSpacing: 0.4 },
        dateValue: { fontSize: 13, fontWeight: 700, color: text },

        sectionHeader: { display: 'flex', alignItems: 'center', fontSize: 17, fontWeight: 850, color: text, marginBottom: 12 },
        counterBadge: { marginLeft: 'auto', fontSize: 11, backgroundColor: accent.soft, border: `1px solid ${accent.ring}`, padding: '4px 10px', borderRadius: 999, color: accentColor },
        goalsContainer: {},

        subGoalCard: { background: glassPanel, borderRadius: 18, overflow: 'hidden', transition: 'all 0.2s ease', backdropFilter: 'blur(24px) saturate(160%)', WebkitBackdropFilter: 'blur(24px) saturate(160%)' },
        subGoalMainRow: { display: 'flex', alignItems: 'center', padding: '11px 12px', gap: 10 },
        checkbox: (checked) => ({
            width: 22, height: 22, borderRadius: 6,
            border: `2px solid ${checked ? accentColor : border}`,
            backgroundColor: checked ? accentColor : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, cursor: 'pointer', transition: 'all 0.2s ease'
        }),
        subGoalContent: { flex: 1, minWidth: 0 },
        subGoalTextWrap: { display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 },
        subGoalText: (checked) => ({ fontSize: 15, color: text, opacity: checked ? 0.62 : 1, textDecoration: checked ? 'line-through' : 'none', cursor: 'default', wordBreak: 'break-word', lineHeight: 1.35, fontWeight: 780 }),
        subGoalMetaRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
        subGoalStatus: (checked) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 18, padding: '2px 7px', borderRadius: 999, background: checked ? 'rgba(46,209,119,0.13)' : accent.soft, border: `1px solid ${checked ? 'rgba(46,209,119,0.24)' : accent.ring}`, color: checked ? '#2ed177' : accentColor, fontSize: 9, fontWeight: 900, lineHeight: 1 }),
        subGoalMetaChip: { display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 18, padding: '2px 7px', borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)', border: `1px solid ${border}`, color: sub, fontSize: 9, fontWeight: 850, lineHeight: 1 },
        subGoalActions: { display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 },
        expandBtn: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', color: sub, transition: 'all 0.2s ease', background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)' },
        actionBtn: { width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10, cursor: 'pointer', color: sub, transition: 'all 0.2s ease', background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)' },

        expandedContent: { padding: '0 14px 16px 14px', borderTop: `1px solid ${border}30` },
        expandedField: { marginBottom: 12 },
        fieldHeader: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
        fieldTitle: { fontSize: 12, fontWeight: '700', color: sub, textTransform: 'uppercase' },
        fieldDisplay: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', backgroundColor: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', borderRadius: 12, minHeight: '40px' },
        fieldValue: { flex: 1, fontSize: 14, color: text, margin: 0, lineHeight: 1.4, wordBreak: 'break-word' },
        fieldPlaceholder: { flex: 1, fontSize: 14, color: sub, opacity: 0.6, fontStyle: 'italic', margin: 0 },
        editFieldBtn: { width: 24, height: 24, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: sub, flexShrink: 0, transition: 'all 0.2s ease' },
        editFieldRow: { display: 'flex', alignItems: 'flex-start', gap: 8 },
        fieldEditInput: { flex: 1, background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px', color: text, fontSize: 16, outline: 'none', fontFamily: 'inherit', resize: 'vertical' },
        saveFieldBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: accentColor, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
        cancelFieldBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: border, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 },
        inlineEditInput: { flex: 1, background: 'transparent', border: `1px solid ${border}`, borderRadius: 8, padding: '6px 10px', color: text, fontSize: 16, outline: 'none', fontFamily: 'inherit', minWidth: 0 },
        subGoalFooterActions: { display: 'flex', alignItems: 'center', gap: 7, marginTop: 2 },
        subGoalFooterBtn: (type) => {
            const isDanger = type === 'danger';
            const isDoneAction = type === 'done';
            return {
                minHeight: 32,
                borderRadius: 11,
                border: `1px solid ${isDanger ? 'rgba(244,67,54,0.18)' : isDoneAction ? 'rgba(46,209,119,0.24)' : border}`,
                background: isDanger ? 'rgba(244,67,54,0.07)' : isDoneAction ? 'rgba(46,209,119,0.12)' : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)'),
                color: isDanger ? '#E57373' : isDoneAction ? '#2ed177' : sub,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '0 10px',
                fontSize: 11,
                fontWeight: 900,
                fontFamily: 'inherit',
                cursor: 'pointer',
                flex: isDanger ? 0 : 1
            };
        },
        subGoalIconBtn: (disabled) => ({ width: 32, height: 32, borderRadius: 11, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', color: sub, opacity: disabled ? 0.36 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit' }),

        addSubRow: { display: 'flex', alignItems: 'center', padding: '13px 14px', border: `1px dashed ${accent.ring}`, borderRadius: 16, marginTop: 8, background: accent.faint },
        addSubInput: { flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: text, outline: 'none', marginLeft: '10px' },
        addSubBtn: { background: accentColor, color: '#fff', border: 'none', borderRadius: 8, padding: '6px 12px', fontWeight: 'bold', marginLeft: 10, flexShrink: 0 },
        description: { fontSize: 15, lineHeight: 1.6, color: text, margin: 0, opacity: 0.9 },
        descriptionInput: { width: '100%', padding: '12px', borderRadius: '14px', border: `1px solid ${border}`, backgroundColor: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)', color: text, fontSize: '16px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' },

        pickerCard: { backgroundColor: panel, borderRadius: 20, padding: '15px', marginBottom: 24, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
        pickerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        pickerCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
        pickerDivider: { width: 1, height: 60, backgroundColor: border, margin: '0 5px' },
        smallLabel: { fontSize: 11, color: sub, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }
    };
};

export default ToDoPage;
