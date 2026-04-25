import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors'
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, setPage, lastPage$, theme$, lang$, fontSize$, setCurrentBottomBtn, keyboardVisible$, updateConfirmationPanel } from '../../StaticClasses/HabitsBus';
import { FaSearch, FaTrashAlt, FaChevronRight, FaPlus, FaListUl, FaUndo } from 'react-icons/fa';
import { MdFiberNew, MdDone, MdClose , MdListAlt } from 'react-icons/md';
import { IoIosArrowBack } from 'react-icons/io';
import Icons from '../../StaticClasses/Icons';
import Slider from '@mui/material/Slider';
import ScrollPicker from '../../Helpers/ScrollPicker.jsx'; // Imported Component

const click = new Audio('Audio/Click.wav');
const now = new Date();

// --- ВНЕШНИЕ ХЕЛПЕРЫ (ДЛЯ СТАБИЛЬНОСТИ) ---
const getAllHabits = () => {
    return allHabits.concat(
        (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
    );
}

const iconSearchAliases = {
    default: ['default', 'обычно', 'дефолт', 'смайл', 'улыбка'],
    star: ['star', 'звезда', 'звёзды', 'избранное'],
    clock: ['clock', 'time', 'часы', 'время', 'таймер'],
    calendar: ['calendar', 'date', 'календарь', 'дата'],
    search: ['search', 'find', 'поиск', 'лупа'],
    settings: ['settings', 'gear', 'настройки', 'шестеренка'],
    gift: ['gift', 'present', 'подарок'],
    health: ['health', 'здоровье'],
    meditation: ['meditation', 'медитация'],
    workout: ['workout', 'gym', 'тренировка', 'зал'],
    running: ['running', 'run', 'бег'],
    exercise: ['exercise', 'упражнение'],
    yoga: ['yoga', 'йога'],
    walking: ['walking', 'walk', 'ходьба', 'прогулка'],
    pulse: ['pulse', 'heart', 'пульс', 'сердце'],
    pill: ['pill', 'medicine', 'таблетка', 'лекарство'],
    sleep: ['sleep', 'сон'],
    bedtime: ['bedtime', 'ночь', 'луна'],
    wakeup: ['wakeup', 'утро', 'подъем', 'рассвет'],
    zzz: ['zzz', 'sleepy', 'сонный', 'спать'],
    food: ['food', 'еда'],
    meal: ['meal', 'блюдо', 'прием пищи'],
    cooking: ['cooking', 'cook', 'готовка'],
    water: ['water', 'вода'],
    coffee: ['coffee', 'кофе'],
    tea: ['tea', 'чай'],
    reading: ['reading', 'book', 'чтение', 'книга'],
    learning: ['learning', 'study', 'обучение', 'учеба'],
    journaling: ['journaling', 'diary', 'дневник'],
    planning: ['planning', 'plan', 'планирование', 'план'],
    goals: ['goals', 'goal', 'цель', 'цели'],
    idea: ['idea', 'идея'],
    success: ['success', 'успех', 'награда'],
    work: ['work', 'job', 'работа'],
    study: ['study', 'учеба'],
    school: ['school', 'школа'],
    hobby: ['hobby', 'хобби'],
    music: ['music', 'музыка'],
    movies: ['movies', 'movie', 'фильм', 'кино'],
    games: ['games', 'game', 'игры', 'игра'],
    art: ['art', 'творчество'],
    writing: ['writing', 'писать', 'письмо'],
    photography: ['photography', 'camera', 'фото', 'камера'],
    family: ['family', 'семья'],
    friends: ['friends', 'друзья'],
    social: ['social', 'общение', 'соцсети'],
    gratitude: ['gratitude', 'благодарность'],
    money: ['money', 'деньги'],
    budget: ['budget', 'бюджет'],
    investment: ['investment', 'инвестиции'],
    home: ['home', 'дом'],
    cleaning: ['cleaning', 'уборка'],
    grocery: ['grocery', 'покупки', 'магазин'],
    garden: ['garden', 'сад'],
    english: ['english', 'английский'],
    russian: ['russian', 'русский'],
    forbidden: ['forbidden', 'ban', 'запрет'],
    noSmoking: ['nosmoking', 'smoking', 'курение', 'сигарета'],
    noAlcohol: ['noalcohol', 'alcohol', 'алкоголь'],
    noMobile: ['nomobile', 'phone', 'телефон', 'гаджет'],
    warning: ['warning', 'опасность', 'внимание'],
    fail: ['fail', 'cross', 'крест', 'ошибка'],
};

const AddHabitPanel = () => {
    const [theme, setTheme] = useState(theme$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [keyboardVisible, setKeyboardVisibleState] = useState(false);
    const [showCreatePanel, setshowCreatePanel] = useState(false);
    const [confirmationPanel, setConfirmationPanel] = useState(false);

    // Habit data
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState(0);
    const [habitDescription, setHabitDescription] = useState('');
    const [habitIcon, setHabitIcon] = useState('default');
    const [habitId, setHabitId] = useState(-1);

    // Date/Goals
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [day, setDay] = useState(now.getDate());
    const [goals, setGoals] = useState([]);
    const [goalName, setGoalName] = useState('');
    const [isNegative, setIsNegative] = useState(false);
    const [daysToForm, setDaysToForm] = useState(66);
    const [habitAutoComplete, setHabitAutoComplete] = useState(false);

    const [habitSearchQuery, setHabitSearchQuery] = useState('');
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [selectCategoryPanel, setSelectCategoryPanel] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryIcon, setNewCategoryIcon] = useState('star');
    const [newCategoryNameEn, setNewCategoryNameEn] = useState('');
    const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
    const [newCategoryIsNegative, setNewCategoryIsNegative] = useState(false);
    const [iconSearchQuery, setIconSearchQuery] = useState('');
    const [categoriesVersion, setCategoriesVersion] = useState(0);
    const [showDeletedCategories, setShowDeletedCategories] = useState(false);
    const allCategories = useMemo(() => AppData.GetAllHabitCategories(langIndex, true), [langIndex, categoriesVersion]);
    const activeCategories = useMemo(() => allCategories.map((cat, idx) => ({ ...cat, _idx: idx })).filter(cat => !cat.isDeleted), [allCategories]);
    const deletedCategories = useMemo(() => allCategories.map((cat, idx) => ({ ...cat, _idx: idx })).filter(cat => cat.isDeleted), [allCategories]);
    const [filterCategory, setFilterCategory] = useState(allCategories[0]?.label[langIndex] || 'Здоровье');

    const filteredIconKeys = useMemo(() => {
        const allIcons = Object.keys(Icons.ic);
        if (!iconSearchQuery.trim()) return allIcons;
        const query = iconSearchQuery.toLowerCase();
        return allIcons.filter((key) => {
            const aliases = iconSearchAliases[key] || [];
            return key.toLowerCase().includes(query) || aliases.some(alias => alias.toLowerCase().includes(query));
        });
    }, [iconSearchQuery]);

    const isLight = theme === 'light' || theme === 'speciallight';
    const ui = {
        bg: Colors.get('background', theme),
        card: Colors.get('mathInput', theme),
        text: Colors.get('mainText', theme),
        sub: Colors.get('subText', theme),
        accent: Colors.get('scrollFont', theme),
        blur: 'blur(30px)',
        border: Colors.get('border', theme)
    };

    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const sub4 = keyboardVisible$.subscribe(setKeyboardVisibleState);
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub4.unsubscribe(); };
    }, []);

    // --- 1. PREPARE DATA FOR SCROLL PICKER ---
    const availableHabits = useMemo(() => {
        return getAllHabits().filter((habit) => !AppData.choosenHabits.includes(habit.id));
    }, [categoriesVersion]);

    const filteredHabits = useMemo(() => {
        const query = habitSearchQuery.trim().toLowerCase();
        return availableHabits
            .filter((habit) => {
                if (!query) return habit.category[langIndex] === filterCategory;
                const searchableText = [
                    ...habit.name,
                    ...habit.category,
                    ...habit.description
                ].join(' ').toLowerCase();
                return searchableText.includes(query);
            })
            .sort((a, b) => {
                if (!query) return 0;
                const aStarts = a.name.some(name => name.toLowerCase().startsWith(query));
                const bStarts = b.name.some(name => name.toLowerCase().startsWith(query));
                if (aStarts === bStarts) return 0;
                return aStarts ? -1 : 1;
            });
    }, [availableHabits, filterCategory, langIndex, habitSearchQuery]);

    const selectedHabit = useMemo(() => {
        return filteredHabits.find(h => h.id === habitId) || filteredHabits[0] || null;
    }, [filteredHabits, habitId]);

    const getLibraryHabitIcon = (habit, size = 26) => {
        if (!habit) return Icons.getIcon('default', { size, style: { color: ui.accent } });
        if (habit.iconName) return Icons.getIcon(habit.iconName, { size, style: { color: ui.accent } });
        return Icons.getHabitIcon(habit.name ? habit.name[0] : 'default', { size, style: { color: ui.accent } });
    };


    // --- 2. HANDLE PICKER CHANGE ---
    const handleHabitSelect = (selectedHabit) => {
        const selectedCat = selectedHabit
            ? allCategories.find(c => c.label[langIndex] === selectedHabit.category[langIndex])
            : allCategories.find(c => c.label[langIndex] === filterCategory);

        if (selectedHabit && selectedHabit.id !== habitId) {
            setHabitId(selectedHabit.id);
            const isNeg = selectedCat?.isNegative ?? (selectedHabit.category[0] === 'Отказ от вредного');
            if (habitSearchQuery.trim()) setFilterCategory(selectedHabit.category[langIndex]);
            setHabitName(selectedHabit.name[langIndex]);
            setHabitCategory(selectedHabit.category[0]);
            setIsNegative(isNeg);
            setHabitAutoComplete(false);
            setGoals(setGoalForDefault(selectedHabit.name[0], langIndex));
            setDaysToForm(isNeg ? 120 : 66);
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    };

    // Initialize selection when category changes (select first item if current is invalid)
    useEffect(() => {
        if (!showCreatePanel && filteredHabits.length > 0) {
            // If currently selected ID is not in the new list, select the first one
            const currentInList = filteredHabits.find(h => h.id === habitId);
            if (!currentInList) {
               handleHabitSelect(filteredHabits[0]);
            }
        }
    }, [filterCategory, filteredHabits, habitId, langIndex, showCreatePanel]);


    const openEditCategory = (idx) => {
        const cat = allCategories[idx];
        if (cat) {
            setEditingCategoryIndex(idx);
            setNewCategoryName(cat.label[0]);
            setNewCategoryNameEn(cat.label[1]);
            setNewCategoryIcon(cat.icon);
            setNewCategoryIsNegative(cat.isNegative || false);
            setSelectCategoryPanel(true);
        }
    };

    const selectCategory = (cat) => {
        if (cat.isDeleted) return;
        setFilterCategory(cat.label[langIndex]);
        setHabitCategory(cat.label[0]);
        setIsNegative(cat.isNegative || false);
        if (cat.isNegative) setHabitAutoComplete(false);
    };

    const openCreatePanelFromSearch = () => {
        const selectedCat = allCategories.find(c => c.label[langIndex] === filterCategory);
        setshowCreatePanel(true);
        setHabitName(habitSearchQuery.trim());
        setHabitDescription('');
        setHabitIcon('default');
        setGoals([]);
        setGoalName('');
        setHabitCategory(selectedCat?.label?.[0] || 'Здоровье');
        setIsNegative(selectedCat?.isNegative || false);
        setHabitAutoComplete(false);
        setDaysToForm(selectedCat?.isNegative ? 120 : 66);
        setHabitId(-1);
    };

    const handleSave = () => {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const finalGoals = goals.map(g => ({ text: g, isDone: false }));
        if (showCreatePanel) createHabit(habitName, getCategory(habitCategory), habitDescription, habitIcon, dateStr, finalGoals, isNegative, daysToForm, habitAutoComplete);
        else addHabit(habitId, habitName, false, dateStr, finalGoals, isNegative, daysToForm, habitAutoComplete);
        closePanel();
    };

    const resetCategoryForm = () => {
        setNewCategoryName('');
        setNewCategoryNameEn('');
        setNewCategoryIcon('star');
        setNewCategoryIsNegative(false);
        setEditingCategoryIndex(null);
        setIconSearchQuery('');
    };

    const handleSaveCategory = () => {
        if (newCategoryName.trim().length <= 0) {
            setShowPopUpPanel(langIndex === 0 ? 'Введите название' : 'Enter name', 2000, false);
            return;
        }

        const prevLabel = editingCategoryIndex !== null ? allCategories[editingCategoryIndex]?.label : null;
        const labelRu = langIndex === 0 ? newCategoryName.trim() : (newCategoryNameEn.trim() || newCategoryName.trim());
        const labelEn = (langIndex === 1 ? newCategoryName.trim() : newCategoryNameEn.trim()) || labelRu;

        if (editingCategoryIndex !== null) {
            AppData.UpdateHabitCustomCategory(editingCategoryIndex, newCategoryIcon, labelRu, labelEn, newCategoryIsNegative);
            setShowPopUpPanel(langIndex === 0 ? 'Категория обновлена' : 'Category updated', 2000, true);
        } else {
            AppData.AddHabitCustomCategory(newCategoryIcon, labelRu, labelEn, newCategoryIsNegative);
            setShowPopUpPanel(langIndex === 0 ? 'Категория создана' : 'Category created', 2000, true);
        }

        setCategoriesVersion(v => v + 1);

        if (!prevLabel || filterCategory === prevLabel[langIndex]) {
            setFilterCategory(langIndex === 0 ? labelRu : labelEn);
        }

        setHabitCategory(labelRu);
        setIsNegative(newCategoryIsNegative);
        resetCategoryForm();
        setSelectCategoryPanel(false);
    };

    const handleDeleteCategory = () => {
        if (editingCategoryIndex === null) return;

        const deletedCategory = allCategories[editingCategoryIndex];
        AppData.RemoveHabitCustomCategory(editingCategoryIndex);
        setCategoriesVersion(v => v + 1);

        if (deletedCategory && filterCategory === deletedCategory.label[langIndex]) {
            setFilterCategory(langIndex === 0 ? 'Здоровье' : 'Health');
            setHabitCategory('Здоровье');
            setIsNegative(false);
        }

        setShowPopUpPanel(langIndex === 0 ? 'Категория удалена' : 'Category deleted', 2000, true);
        resetCategoryForm();
        setSelectCategoryPanel(false);
    };

    const handleDeleteCategoryByIndex = (index) => {
        const deletedCategory = allCategories[index];
        AppData.RemoveHabitCustomCategory(index);
        setCategoriesVersion(v => v + 1);

        if (deletedCategory && filterCategory === deletedCategory.label[langIndex]) {
            setFilterCategory(langIndex === 0 ? 'Здоровье' : 'Health');
            setHabitCategory('Здоровье');
            setIsNegative(false);
        }

        setShowPopUpPanel(langIndex === 0 ? 'Категория удалена' : 'Category deleted', 2000, true);
    };

    const requestDeleteCategory = (index) => {
        updateConfirmationPanel(
            langIndex === 0 ? 'Удалить категорию?' : 'Delete category?',
            () => handleDeleteCategoryByIndex(index)
        );
    };

    const handleRestoreCategory = (cat) => {
        if (cat.isDefault) AppData.RestoreDefaultHabitCategory(cat.key);
        else AppData.RestoreCustomHabitCategory(cat.customIndex);
        setCategoriesVersion(v => v + 1);
        setShowPopUpPanel(langIndex === 0 ? 'Категория восстановлена' : 'Category restored', 2000, true);
        if (AppData.deletedDefaultHabitCategories.length === 0 && !AppData.habitCustomCategories.some(c => c.isDeleted)) setShowDeletedCategories(false);
    };

    const closePanel = () => {
        const prev = lastPage$.value;
        const loopingPages = ['AddHabitPanel'];
        setCurrentBottomBtn(0);
        setConfirmationPanel(false);
        setshowCreatePanel(false);
        playEffects(click);
        setPage(prev && !loopingPages.includes(prev) ? prev : 'HabitsMain');
    };

    // Date Logic
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthsArray = months[langIndex];
    const YEAR = now.getFullYear();
    const yearsArray = [YEAR- 4,YEAR- 3,YEAR- 2,YEAR- 1, YEAR]; 

    const setNewGoal = () => {
        if (goalName.length > 0) { setGoals(prev => [...prev, goalName]); setGoalName(''); }
        else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
    };

    const removeGoal = (i) => setGoals(prev => prev.filter((_, idx) => idx !== i));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ ...pageStyle, backgroundColor: ui.bg }}
        >
                        <div style={pageHeader}>
                            <motion.div whileTap={{ scale: 0.9 }} onClick={confirmationPanel ? () => setConfirmationPanel(false) : closePanel} style={backBtn(ui)}>
                                <IoIosArrowBack size={24} color={ui.text} />
                            </motion.div>
                        </div>

                        <div style={{ padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <AnimatePresence mode="wait">
                                {!confirmationPanel ? (
                                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h2 style={{ color: ui.text, textAlign: 'center', fontWeight: '800', margin: '10px 0 20px' }}>
                                            {showCreatePanel ? (langIndex === 0 ? 'Своя привычка' : 'Custom Habit') : (langIndex === 0 ? 'Добавить привычку' : 'Add Habit')}
                                        </h2>

                                        {!showCreatePanel ? (
                                            <>
                                                {/* Фильтр категорий */}
                                                <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', marginBottom: '8px', paddingBottom: '5px', scrollbarWidth: 'none', flexWrap: 'nowrap' }}>
                                                    {activeCategories.map((cat) => (
                                                        <motion.div
                                                            key={cat._idx} whileTap={{ scale: 0.95 }}
                                                            onClick={() => selectCategory(cat)}
                                                            style={{
                                                                padding: '10px 12px', borderRadius: '14px', whiteSpace: 'nowrap',
                                                                backgroundColor: filterCategory === cat.label[langIndex] ? ui.accent : ui.card,
                                                                color: filterCategory === cat.label[langIndex] ? '#FFF' : ui.text,
                                                                fontSize: '13px', fontWeight: '700', transition: '0.2s all',
                                                                boxShadow: filterCategory === cat.label[langIndex] ? `0 4px 12px ${ui.accent}40` : 'none',
                                                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                                            }}
                                                        >
                                                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                                {Icons.getIcon(cat.icon, { size: 14, style: { marginRight: 6 } })}
                                                                {cat.label[langIndex]}
                                                            </span>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                                <span onClick={(e) => { e.stopPropagation(); openEditCategory(cat._idx); }} style={{ width: 24, height: 24, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)', cursor: 'pointer' }}>✏️</span>
                                                                <span onClick={(e) => { e.stopPropagation(); requestDeleteCategory(cat._idx); }} style={{ width: 24, height: 24, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,59,48,0.18)', cursor: 'pointer' }}>
                                                                    <FaTrashAlt size={11} color={filterCategory === cat.label[langIndex] ? '#FFF' : '#FF6B6B'} />
                                                                </span>
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                    {langIndex === 0 && (
                                                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelectCategoryPanel(true)}
                                                            style={{ padding: '10px 14px', borderRadius: '14px', whiteSpace: 'nowrap', backgroundColor: ui.card, color: ui.accent, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaPlus size={12} /> Добавить
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {deletedCategories.length > 0 && (
                                                    <div style={{ marginBottom: '10px' }}>
                                                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowDeletedCategories(v => !v)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '10px', backgroundColor: ui.card, cursor: 'pointer', marginBottom: showDeletedCategories ? '8px' : 0 }}>
                                                            <FaUndo size={10} color={ui.sub} />
                                                            <span style={{ color: ui.sub, fontSize: '12px', fontWeight: '700' }}>{langIndex === 0 ? 'Восстановить удалённые' : 'Restore deleted'}</span>
                                                        </motion.div>
                                                        {showDeletedCategories && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {deletedCategories.map((cat) => (
                                                                    <motion.div key={cat._idx} whileTap={{ scale: 0.95 }} onClick={() => handleRestoreCategory(cat)}
                                                                        style={{ padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                                        {Icons.getIcon(cat.icon, { size: 12 })}
                                                                        <span style={{ color: ui.text, fontSize: '13px', fontWeight: '600' }}>{cat.label[langIndex]}</span>
                                                                        <FaUndo size={10} color='#34C759' />
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={libraryPanel(ui)}>
                                                    <div style={librarySearchRow(ui)}>
                                                        <FaSearch color={ui.sub} size={15} style={{ flexShrink: 0 }} />
                                                        <input
                                                            type="text"
                                                            placeholder={langIndex === 0 ? 'Поиск по базе привычек' : 'Search habit library'}
                                                            value={habitSearchQuery}
                                                            onChange={(e) => setHabitSearchQuery(e.target.value)}
                                                            style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), outline: 'none', minWidth: 0 }}
                                                        />
                                                        <span style={libraryCount(ui)}>{availableHabits.length}</span>
                                                    </div>

                                                    <div style={pickerArea()}>
                                                        {filteredHabits.length > 0 ? (
                                                            <HabitLibraryPicker
                                                                habits={filteredHabits}
                                                                selectedHabit={selectedHabit}
                                                                onSelect={handleHabitSelect}
                                                                langIndex={langIndex}
                                                                ui={ui}
                                                                getIcon={getLibraryHabitIcon}
                                                            />
                                                        ) : (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '18px', textAlign: 'center' }}>
                                                                <div style={{color: ui.sub, fontSize:'14px'}}>
                                                                    {langIndex === 0 ? 'Нет привычек' : 'No habits found'}
                                                                </div>
                                                                {habitSearchQuery.trim().length > 0 && (
                                                                    <motion.div
                                                                        whileTap={{ scale: 0.96 }}
                                                                        onClick={openCreatePanelFromSearch}
                                                                        style={{ padding: '11px 15px', borderRadius: '14px', backgroundColor: ui.accent, color: '#FFF', fontWeight: '700', cursor: 'pointer' }}
                                                                    >
                                                                        {langIndex === 0 ? `Создать "${habitSearchQuery.trim()}"` : `Create "${habitSearchQuery.trim()}"`}
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {/* Фильтр категорий */}
                                                <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', marginBottom: '0', paddingBottom: '5px', scrollbarWidth: 'none', flexWrap: 'nowrap' }}>
                                                    {activeCategories.map((cat) => (
                                                        <motion.div
                                                            key={cat._idx} whileTap={{ scale: 0.95 }}
                                                            onClick={() => selectCategory(cat)}
                                                            style={{
                                                                padding: '10px 12px', borderRadius: '14px', whiteSpace: 'nowrap',
                                                                backgroundColor: filterCategory === cat.label[langIndex] ? ui.accent : ui.card,
                                                                color: filterCategory === cat.label[langIndex] ? '#FFF' : ui.text,
                                                                fontSize: '13px', fontWeight: '700', transition: '0.2s all',
                                                                boxShadow: filterCategory === cat.label[langIndex] ? `0 4px 12px ${ui.accent}40` : 'none',
                                                                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                                            }}
                                                        >
                                                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                                                {Icons.getIcon(cat.icon, { size: 14, style: { marginRight: 6 } })}
                                                                {cat.label[langIndex]}
                                                            </span>
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                                                <span onClick={(e) => { e.stopPropagation(); openEditCategory(cat._idx); }} style={{ width: 24, height: 24, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)', cursor: 'pointer' }}>✏️</span>
                                                                <span onClick={(e) => { e.stopPropagation(); requestDeleteCategory(cat._idx); }} style={{ width: 24, height: 24, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,59,48,0.18)', cursor: 'pointer' }}>
                                                                    <FaTrashAlt size={11} color={filterCategory === cat.label[langIndex] ? '#FFF' : '#FF6B6B'} />
                                                                </span>
                                                            </span>
                                                        </motion.div>
                                                    ))}
                                                    {langIndex === 0 && (
                                                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setSelectCategoryPanel(true)}
                                                            style={{ padding: '10px 14px', borderRadius: '14px', whiteSpace: 'nowrap', backgroundColor: ui.card, color: ui.accent, fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FaPlus size={12} /> Добавить
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {deletedCategories.length > 0 && (
                                                    <div>
                                                        <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowDeletedCategories(v => !v)}
                                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '10px', backgroundColor: ui.card, cursor: 'pointer', marginBottom: showDeletedCategories ? '8px' : 0 }}>
                                                            <FaUndo size={10} color={ui.sub} />
                                                            <span style={{ color: ui.sub, fontSize: '12px', fontWeight: '700' }}>{langIndex === 0 ? 'Восстановить удалённые' : 'Restore deleted'}</span>
                                                        </motion.div>
                                                        {showDeletedCategories && (
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                                                {deletedCategories.map((cat) => (
                                                                    <motion.div key={cat._idx} whileTap={{ scale: 0.95 }} onClick={() => handleRestoreCategory(cat)}
                                                                        style={{ padding: '8px 12px', borderRadius: '12px', backgroundColor: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                                        {Icons.getIcon(cat.icon, { size: 12 })}
                                                                        <span style={{ color: ui.text, fontSize: '13px', fontWeight: '600' }}>{cat.label[langIndex]}</span>
                                                                        <FaUndo size={10} color='#34C759' />
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <input
                                                    type="text" 
                                                                                        placeholder={langIndex === 0 ? 'название' : 'name'}
                                                                                        value={habitName}
                                                                                         onChange={(e) => setHabitName(e.target.value)}
                                                                                        style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                                                                                        />
                                                <motion.div whileTap={{ scale: 0.98 }} style={iconPickerTrigger(ui)} onClick={() => setSelectIconPanel(true)}>
                                                    <span style={{ color: ui.text, fontWeight: '700' }}>{langIndex === 0 ? 'Иконка' : 'Icon'}</span>
                                                    {Icons.getIcon(habitIcon, { size: 32, style: { color: ui.accent } })}
                                                </motion.div>
                                                 <input 
                                                                                        type="text" 
                                                                                        placeholder={langIndex === 0 ? 'описание' : 'description'}
                                                                                        value={habitDescription}
                                                                                         onChange={(e) => setHabitDescription(e.target.value)}
                                                                                        style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                                                                                        />
                                               
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    /* ШАГ 2: Подтверждение (Барабаны даты, Цели, Слайдер) */
                                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={{ flex: 1, overflowY: 'auto' }}>
                                        <h3 style={{ color: ui.text, textAlign: 'center', fontWeight: '900', margin: '20px 0', fontSize: '22px' }}>{habitName}</h3>
                                        
                                        {/* БАРАБАНЫ ДАТЫ (SCROLLPICKER) */}
                                        <div style={configCard(ui)}>
                                            <p style={cardLabel(ui)}>{langIndex === 0 ? 'дата начала' : 'start date'}</p>
                                            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', height: '120px', alignItems: 'center' }}>
                                                <ScrollPicker items={daysArray} value={day} onChange={setDay} theme={theme} width="70px" />
                                                <ScrollPicker items={monthsArray} value={monthsArray[month-1]} onChange={(v) => setMonth(monthsArray.indexOf(v) + 1)} theme={theme} width="120px" />
                                                <ScrollPicker items={yearsArray} value={year} onChange={setYear} theme={theme} width="100px" />
                                            </div>
                                        </div>

                                        <div style={configCard(ui)}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <span style={{ color: ui.text, fontWeight: '700' }}>{langIndex === 0 ? 'Срок' : 'Goal'}</span>
                                                <span style={{ color: ui.accent, fontWeight: '900', fontSize: '24px' }}>{daysToForm} {langIndex === 0 ? 'дн.' : 'days'}</span>
                                            </div>
                                            <Slider min={21} max={180} value={daysToForm} onChange={(e, v) => setDaysToForm(v)} 
                                                sx={{ color: ui.accent, '& .MuiSlider-thumb': { width: 24, height: 24 }, '& .MuiSlider-rail': { opacity: 0.3 } }} 
                                            />
                                            <p style={{ fontSize: '12px', color: ui.sub, marginTop: '10px', textAlign: 'center' }}>{needDaysInfo(langIndex, daysToForm, isNegative)}</p>
                                        </div>

                                        {!isNegative && (
                                            <div style={configCard(ui)}>
                                                <p style={cardLabel(ui)}>{langIndex === 0 ? 'отметка выполнения' : 'completion mode'}</p>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                    <motion.button
                                                        type="button"
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setHabitAutoComplete(false)}
                                                        style={completionModeButton(ui, !habitAutoComplete)}
                                                    >
                                                        {langIndex === 0 ? 'Вручную' : 'Manual'}
                                                    </motion.button>
                                                    <motion.button
                                                        type="button"
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => setHabitAutoComplete(true)}
                                                        style={completionModeButton(ui, habitAutoComplete)}
                                                    >
                                                        {langIndex === 0 ? 'Авто' : 'Auto'}
                                                    </motion.button>
                                                </div>
                                                <p style={{ fontSize: '12px', color: ui.sub, marginTop: '10px', textAlign: 'center' }}>
                                                    {habitAutoComplete
                                                        ? (langIndex === 0 ? 'Привычка будет отмечаться выполненной автоматически каждый день.' : 'The habit will be marked done automatically each day.')
                                                        : (langIndex === 0 ? 'Отмечайте выполнение сами через карточку привычки.' : 'Mark completion yourself from the habit card.')}
                                                </p>
                                            </div>
                                        )}

                                        <div style={configCard(ui)}>
                                            <p style={cardLabel(ui)}>{langIndex === 0 ? 'микро-цели' : 'sub-goals'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center',  borderRadius: '14px', paddingRight: '5px', marginBottom: '15px' }}>
        
                                                     <input 
                                                                                        type="text" 
                                                                                        placeholder={langIndex === 0 ? 'Добавить цель...' : 'Add goal...'}
                                                                                        value={goalName}
                                                                                         onChange={(e) => setGoalName(e.target.value)}
                                                                                        style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
                                                                                        />
                                                <motion.div whileTap={{ scale: 0.9 }} onClick={setNewGoal} style={addBtn(ui)}><FaPlus color="#FFF" size={18} /></motion.div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {goals.map((g, i) => (
                                                    <motion.div layout key={i} style={goalRow(ui)}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <FaListUl color={ui.accent} size={14} />
                                                            <span style={{ color: ui.text, fontSize: '15px', fontWeight: '500' }}>{g}</span>
                                                        </div>
                                                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => removeGoal(i)} style={{ padding: '8px', backgroundColor: '#FF3B3020', borderRadius: '10px' }}>
                                                            <FaTrashAlt color="#FF3B30" size={14} />
                                                        </motion.div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '290px' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* --- ФИНАЛЬНЫЕ КНОПКИ --- */}
                            <div style={footerButtons}>
                                {!confirmationPanel && (
                                    <motion.div whileTap={{ scale: 0.9 }} style={btnNew(ui)} onClick={() => {setshowCreatePanel(!showCreatePanel);if(!showCreatePanel){setGoals([])}}}>
                                           {showCreatePanel ? <MdListAlt size={24} color="#FFF" /> :  <MdFiberNew size={24} color="#FFF" />}
                                    </motion.div>
                                )}

                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    style={btnNext(ui)}
                                    onClick={confirmationPanel ? handleSave : () => { if(habitId !== -1 || habitName.length > 3) setConfirmationPanel(true); }}
                                >
                                    {confirmationPanel ? <MdDone size={28} color="#FFF" /> : <FaChevronRight size={20} color="#FFF" />}
                                </motion.div>
                            </div>
                        </div>

                    {/* Выбор иконки (Bottom Sheet) */}
                    <AnimatePresence>
                        {selectIconPanel && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={() => setSelectIconPanel(false)}>
                                <motion.div
                                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    style={{ ...iconSheet(ui), backgroundColor: ui.bg, backdropFilter: ui.blur }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div style={dragHandle} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 25px 15px' }}>
                                        <h3 style={{ margin: 0, color: ui.text }}>{langIndex === 0 ? 'Выбрать иконку' : 'Choose icon'}</h3>
                                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelectIconPanel(false)} style={{ padding: '8px', backgroundColor: ui.card, borderRadius: '50%' }}>
                                            <MdClose color={ui.sub} />
                                        </motion.div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '0 25px 12px', gap: '8px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '0 10px', backgroundColor: ui.card, width: '100%' }}>
                                            <FaSearch color={ui.sub} style={{ marginRight: '8px' }} />
                                            <input
                                                type="text"
                                                placeholder={langIndex === 0 ? 'Поиск иконки...' : 'Search icon...'}
                                                value={iconSearchQuery}
                                                onChange={(e) => setIconSearchQuery(e.target.value)}
                                                style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: ui.text, padding: '10px 0', outline: 'none' }}
                                            />
                                        </div>
                                    </div>
                                    <div style={iconGrid}>
                                        {filteredIconKeys.map(key => (
                                            <motion.div
                                                key={key} whileTap={{ scale: 0.9 }}
                                                onClick={() => { setHabitIcon(key); setSelectIconPanel(false); }}
                                                style={{ ...iconItem(habitIcon === key, ui) }}
                                            >
                                                {Icons.getIcon(key, { size: 30, style: { color: habitIcon === key ? ui.accent : ui.text } })}
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Добавление/редактирование категории (Bottom Sheet) */}
                    <AnimatePresence>
                        {selectCategoryPanel && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={() => { setSelectCategoryPanel(false); resetCategoryForm(); }}>
                                <motion.div
                                    initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    style={{ ...iconSheet(ui), backgroundColor: ui.bg, backdropFilter: ui.blur }}
                                    onClick={e => e.stopPropagation()}
                                >
                                    <div style={dragHandle} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 25px 15px' }}>
                                        <h3 style={{ margin: 0, color: ui.text }}>{editingCategoryIndex !== null ? (langIndex === 0 ? 'Редактировать' : 'Edit') : (langIndex === 0 ? 'Новая категория' : 'New Category')}</h3>
                                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => { setSelectCategoryPanel(false); resetCategoryForm(); }} style={{ padding: '8px', backgroundColor: ui.card, borderRadius: '50%' }}>
                                            <MdClose color={ui.sub} />
                                        </motion.div>
                                    </div>
                                    <div style={{ padding: '0 25px 30px', display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '65vh', overflowY: 'auto' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <input
                                                type="text"
                                                placeholder={langIndex === 0 ? 'Название' : 'Name'}
                                                value={newCategoryName}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setNewCategoryName(val);
                                                    if (langIndex === 0 && val.length > 0) {
                                                        const translated = translateToEnglish(val);
                                                        setNewCategoryNameEn(translated);
                                                    } else if (langIndex === 1 && val.length > 0) {
                                                        const translated = translateToRussian(val);
                                                        setNewCategoryName(translated);
                                                    }
                                                }}
                                                style={{ flex: 1, ...inputStyle(ui), border: `1px solid ${ui.border}`, borderRadius: '14px', padding: '14px' }}
                                            />
                                        </div>

                                        {/* Toggle для типа */}
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <motion.div
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setNewCategoryIsNegative(false)}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer',
                                                    backgroundColor: !newCategoryIsNegative ? '#34C75920' : ui.card,
                                                    border: `1px solid ${!newCategoryIsNegative ? '#34C759' : ui.border}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span style={{ color: !newCategoryIsNegative ? '#34C759' : ui.text, fontWeight: '700', fontSize: '13px' }}>
                                                    {langIndex === 0 ? '✅ Хорошая' : '✅ Good'}
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setNewCategoryIsNegative(true)}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer',
                                                    backgroundColor: newCategoryIsNegative ? '#FF3B3020' : ui.card,
                                                    border: `1px solid ${newCategoryIsNegative ? '#FF3B30' : ui.border}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span style={{ color: newCategoryIsNegative ? '#FF3B30' : ui.text, fontWeight: '700', fontSize: '13px' }}>
                                                    {langIndex === 0 ? '❌ Плохая' : '❌ Bad'}
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Выбор иконки */}
                                        <div style={{ padding: '12px', backgroundColor: ui.card, borderRadius: '14px' }}>
                                            <p style={{ color: ui.sub, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>{langIndex === 0 ? 'Иконка' : 'Icon'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '10px', padding: '0 10px', marginBottom: '10px', backgroundColor: ui.bg }}>
                                                <FaSearch color={ui.sub} style={{ marginRight: '8px' }} />
                                                <input
                                                    type="text"
                                                    placeholder={langIndex === 0 ? 'Поиск...' : 'Search...'}
                                                    value={iconSearchQuery}
                                                    onChange={(e) => setIconSearchQuery(e.target.value)}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: ui.text, padding: '10px 0', outline: 'none' }}
                                                />
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                                                {filteredIconKeys.map(iconKey => (
                                                    <motion.div key={iconKey} whileTap={{ scale: 0.9 }} onClick={() => setNewCategoryIcon(iconKey)}
                                                        style={{ ...iconItem(newCategoryIcon === iconKey, ui), padding: '10px', cursor: 'pointer' }}>
                                                        {Icons.getIcon(iconKey, { size: 24, style: { color: newCategoryIcon === iconKey ? ui.accent : ui.text } })}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Кнопки */}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            {editingCategoryIndex !== null && (
                                                <motion.div whileTap={{ scale: 0.95 }} onClick={handleDeleteCategory}
                                                    style={{ flex: 1, padding: '14px', backgroundColor: '#FF3B30', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
                                                    <span style={{ color: '#FFF', fontWeight: '700', fontSize: '14px' }}>
                                                        {langIndex === 0 ? 'Удалить' : 'Delete'}
                                                    </span>
                                                </motion.div>
                                            )}
                                            <motion.div whileTap={{ scale: 0.95 }} onClick={handleSaveCategory}
                                                style={{ flex: editingCategoryIndex !== null ? 1 : 2, padding: '14px', backgroundColor: ui.accent, borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
                                                <span style={{ color: '#FFF', fontWeight: '700', fontSize: '14px' }}>
                                                    {langIndex === 0 ? (editingCategoryIndex !== null ? 'Сохранить' : 'Создать') : (editingCategoryIndex !== null ? 'Save' : 'Create')}
                                                </span>
                                            </motion.div>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
        </motion.div>
    );
};

const HABIT_PICKER_ITEM_HEIGHT = 96;
const HABIT_PICKER_VISIBLE_ITEMS = 5;

function HabitLibraryPicker({ habits, selectedHabit, onSelect, langIndex, ui, getIcon }) {
    const scrollRef = useRef(null);
    const scrollFrameRef = useRef(null);
    const settleTimerRef = useRef(null);
    const isUserScrollingRef = useRef(false);
    const [scrollTop, setScrollTop] = useState(0);
    const [centerIndex, setCenterIndex] = useState(0);
    const selectedId = selectedHabit?.id;
    const spacerHeight = ((HABIT_PICKER_VISIBLE_ITEMS - 1) / 2) * HABIT_PICKER_ITEM_HEIGHT;

    useEffect(() => {
        const node = scrollRef.current;
        if (!node || selectedId === undefined) return;
        const index = habits.findIndex(habit => habit.id === selectedId);
        if (index < 0) return;
        const targetTop = index * HABIT_PICKER_ITEM_HEIGHT;
        setScrollTop(targetTop);
        setCenterIndex(index);
        if (!isUserScrollingRef.current && Math.abs(node.scrollTop - targetTop) > 1) {
            node.scrollTo({ top: targetTop, behavior: 'smooth' });
        }
    }, [habits, selectedId]);

    useEffect(() => {
        return () => {
            if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
            if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        };
    }, []);

    const handleScroll = (event) => {
        const node = event.currentTarget;
        const nextTop = node.scrollTop;
        isUserScrollingRef.current = true;

        if (scrollFrameRef.current) cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = requestAnimationFrame(() => {
            const nextIndex = Math.max(0, Math.min(habits.length - 1, Math.round(nextTop / HABIT_PICKER_ITEM_HEIGHT)));
            setScrollTop(nextTop);
            setCenterIndex(nextIndex);
        });

        if (settleTimerRef.current) clearTimeout(settleTimerRef.current);
        settleTimerRef.current = setTimeout(() => {
            const index = Math.max(0, Math.min(habits.length - 1, Math.round(node.scrollTop / HABIT_PICKER_ITEM_HEIGHT)));
            const targetTop = index * HABIT_PICKER_ITEM_HEIGHT;
            const nextHabit = habits[index];

            setCenterIndex(index);
            if (Math.abs(node.scrollTop - targetTop) > 1) {
                node.scrollTo({ top: targetTop, behavior: 'smooth' });
            } else {
                setScrollTop(targetTop);
            }
            if (nextHabit && nextHabit.id !== selectedId) onSelect(nextHabit);

            setTimeout(() => {
                isUserScrollingRef.current = false;
            }, 180);
        }, 110);
    };

    return (
        <div style={habitPickerFrame(ui)}>
            <div style={habitPickerLens(ui)} />
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="no-scrollbar"
                style={habitPickerScroll}
            >
                <div style={{ height: spacerHeight, flexShrink: 0 }} />
                {habits.map((habit, index) => {
                    const distance = Math.abs(index - (scrollTop / HABIT_PICKER_ITEM_HEIGHT));
                    const focus = Math.max(0, 1 - Math.min(distance, 1));
                    const nearby = Math.max(0, 1 - Math.min(distance / 2, 1));
                    const isCentered = index === centerIndex;
                    const iconSize = Math.round(18 + (28 * focus));
                    return (
                        <div
                            key={habit.id}
                            onClick={() => onSelect(habit)}
                            style={habitPickerItem(focus, nearby, ui)}
                        >
                            <div style={habitPickerContent()}>
                                <div style={habitPickerIconSlot()}>
                                    <div style={habitPickerIcon(focus, ui)}>{getIcon(habit, iconSize)}</div>
                                </div>
                                <div style={habitPickerText()}>
                                    <div style={habitPickerTitle(focus, nearby, ui)}>
                                        {habit.name[langIndex]}
                                    </div>
                                    <div style={habitPickerDescription(isCentered, focus, ui)}>
                                        {habit.category[langIndex]} · {habit.description[langIndex]}
                                    </div>
                                </div>
                                <div style={habitPickerBalanceSlot()} />
                            </div>
                        </div>
                    );
                })}
                <div style={{ height: spacerHeight, flexShrink: 0 }} />
            </div>
        </div>
    );
}

// --- СТИЛИ ---
const pageStyle = { position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflowY: 'auto', zIndex: 1000, paddingBottom: '100px', display: 'flex', flexDirection: 'column' };
const pageHeader = { display: 'flex', alignItems: 'center', padding: '15px 20px 0' };
const backBtn = (ui) => ({ width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: ui.card, cursor: 'pointer' });

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' };
const dragHandle = { width: '45px', height: '5px', backgroundColor: '#8E8E93', borderRadius: '3px', margin: '15px auto', opacity: 0.4 };

const libraryPanel = (ui) => ({
    backgroundColor: ui.card,
    borderRadius: '22px',
    border: `1px solid ${ui.border}`,
    overflow: 'hidden'
});
const librarySearchRow = (ui) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 14px',
    height: '50px',
    borderBottom: `1px solid ${ui.border}`
});
const libraryCount = (ui) => ({
    minWidth: '30px',
    padding: '5px 8px',
    borderRadius: '999px',
    backgroundColor: `${ui.accent}18`,
    color: ui.accent,
    fontSize: '12px',
    fontWeight: '800',
    textAlign: 'center'
});
const pickerArea = () => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: `${HABIT_PICKER_ITEM_HEIGHT * HABIT_PICKER_VISIBLE_ITEMS}px`
});
const habitPickerFrame = (ui) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    backgroundColor: ui.card
});
const habitPickerLens = (ui) => ({
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '50%',
    height: `${HABIT_PICKER_ITEM_HEIGHT}px`,
    transform: 'translateY(-50%)',
    borderTop: `1px solid ${ui.border}`,
    borderBottom: `1px solid ${ui.border}`,
    pointerEvents: 'none',
    zIndex: 2
});
const habitPickerScroll = {
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    scrollSnapType: 'y proximity',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
};
const habitPickerItem = (focus, nearby, ui) => ({
    height: `${HABIT_PICKER_ITEM_HEIGHT}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    boxSizing: 'border-box',
    scrollSnapAlign: 'center',
    opacity: 0.2 + (0.8 * nearby),
    transform: `scale(${0.78 + (0.34 * focus)})`,
    transition: 'opacity 0.08s linear, filter 0.12s ease',
    cursor: 'pointer',
    color: focus > 0.5 ? ui.text : ui.sub,
    filter: focus > 0.72 ? 'drop-shadow(0 8px 18px rgba(0,0,0,0.24))' : 'none',
    willChange: 'transform, opacity'
});
const habitPickerContent = () => ({
    width: 'min(760px, 92%)',
    display: 'grid',
    gridTemplateColumns: '110px minmax(0, 1fr) 110px',
    alignItems: 'center',
    columnGap: '14px'
});
const habitPickerIconSlot = () => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
});
const habitPickerBalanceSlot = () => ({
    width: '100%',
    height: 1
});
const habitPickerIcon = (focus, ui) => {
    const boxSize = 28 + (54 * focus);
    return ({
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    borderRadius: `${10 + (14 * focus)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: `rgba(88, 134, 255, ${0.02 + (0.12 * focus)})`,
    boxShadow: focus > 0.7 ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 8px 18px ${ui.accent}18` : 'none',
    opacity: 0.72 + (0.28 * focus),
    willChange: 'width, height, border-radius'
})};
const habitPickerText = () => ({
    minWidth: 0,
    textAlign: 'center'
});
const habitPickerTitle = (focus, nearby, ui) => ({
    color: focus > 0.5 ? ui.text : ui.sub,
    fontSize: `${12 + (9 * focus)}px`,
    fontWeight: focus > 0.62 ? '900' : '600',
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    opacity: 0.7 + (0.3 * nearby)
});
const habitPickerDescription = (visible, focus, ui) => ({
    color: ui.sub,
    display: visible ? 'block' : 'none',
    fontSize: '14px',
    marginTop: '8px',
    lineHeight: 1.2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    opacity: Math.max(0, Math.min(1, focus))
});
const drumContainer = (ui) => ({ position: 'relative', height: '220px', backgroundColor: ui.card, borderRadius: '25px', overflow: 'hidden' });
const drumScroll = { width: '100%', height: '100%', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' };
const drumItem = (active, ui) => ({ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'center', color: active ? ui.accent : ui.text, fontSize: active ? '20px' : '17px', fontWeight: active ? '900' : '400', opacity: active ? 1 : 0.4, transition: '0.3s all' });
const drumLens = (ui) => ({ position: 'absolute', top: '88px', left: 0, right: 0, height: '44px', borderTop: `1px solid ${ui.border}`, borderBottom: `1px solid ${ui.border}`, pointerEvents: 'none' });

const configCard = (ui) => ({ backgroundColor: ui.card, borderRadius: '25px', padding: '25px', marginBottom: '15px', boxShadow: `0 4px 20px ${ui.accent}10` });
const cardLabel = (ui) => ({ color: ui.sub, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '15px', letterSpacing: '1px' });

const footerButtons = { display: 'flex', gap: '12px', padding: '20px 0 40px', alignItems: 'center' ,marginBottom:'20px'};
const btnBase = { height: '60px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const btnCancel = (ui) => ({ ...btnBase, flex: 1, backgroundColor: '#FF3B30', border: `1px solid ${ui.border}` });
const btnNew = (ui) => ({ ...btnBase, width: '60px', backgroundColor: ui.accent, boxShadow: `0 4px 15px ${ui.accent}40` });
const btnNext = (ui) => ({ ...btnBase, flex: 2, backgroundColor: ui.accent, boxShadow: `0 4px 15px ${ui.accent}40` });

const iconSheet = (ui) => ({ width: '100%', maxHeight: '70vh', borderRadius: '40px 40px 0 0', overflow: 'hidden', borderTop: `1px solid ${ui.border}` });
const iconGrid = { maxHeight: '50vh', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '15px', padding: '0 25px 40px' };
const iconItem = (active, ui) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', borderRadius: '18px', backgroundColor: active ? ui.accent + '20' : ui.card, border: active ? `2px solid ${ui.accent}` : `1px solid ${ui.border}` });
const iconPickerTrigger = (ui) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: ui.card, borderRadius: '20px' });
const addBtn = (ui) => ({ width: '42px', height: '42px', borderRadius: '12px', backgroundColor: ui.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '15px', marginTop: '10px' });
const goalRow = (ui) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: ui.bg, borderRadius: '16px' });
const inputStyle = (ui) => ({ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: ui.text, outline: 'none' });
const completionModeButton = (ui, active) => ({
    border: `1px solid ${active ? ui.accent : ui.border}`,
    background: active ? `${ui.accent}22` : 'transparent',
    color: active ? ui.accent : ui.text,
    borderRadius: '14px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer'
});

// --- ЛОГИКА (ОРИГИНАЛ) ---
const months = [['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'], ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];

function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound) { sound.currentTime = 0; sound.play(); }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.isVersionAtLeast?.('6.1')) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

const getCategory = (value) => {
    const map = { 'Здоровье': ['Здоровье', 'Health'], 'Health': ['Здоровье', 'Health'], 'Развитие': ["Развитие", "Growth"], 'Growth': ["Развитие", "Growth"], 'Продуктивность': ["Продуктивность", "Productivity"], 'Productivity': ["Продуктивность", "Productivity"], 'Отношения и отдых': ["Отношения и отдых", "Relationships & recreation"], 'Relationships & recreation': ["Отношения и отдых", "Relationships & recreation"], 'Отказ от вредного': ["Отказ от вредного", "Bad habits to quit"], 'Bad habits to quit': ["Отказ от вредного", "Bad habits to quit"] };
    return map[value] || ['Здоровье', 'Health'];
};

function needDaysInfo(lang, days, isNegative) {
    if (isNegative) return lang === 0 ? 'мне нужно ' + days + ' дней чтобы бросить' : 'i need ' + days + ' days to quit';
    return lang === 0 ? 'мне нужно ' + days + ' дней для формирования' : 'it takes ' + days + ' days to form';
}

const addHabit = (habitId, habitName, isCustom, dateString, goals, isNegative, daysToForm, autoComplete = false) => {
    if (AppData.IsHabitInChoosenList(habitId)) { setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list', 2500, false); return; }
    addHabitFn(habitId, dateString, goals, isNegative, daysToForm, autoComplete);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added', 2500, true);
}

const createHabit = (name, category, description, icon, dateString, goals, isNegative, daysToForm, autoComplete = false) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    AppData.AddCustomHabit(name, category, description, icon, habitId);
    setTimeout(() => { addHabit(habitId, name, true, dateString, goals, category[0] === 'Отказ от вредного', daysToForm, autoComplete); }, 100);
}

const translateToEnglish = (ruText) => {
    const translations = {
        'здоровье': 'Health', 'развитие': 'Growth', 'продуктивность': 'Productivity',
        'отношения': 'Relationships', 'отдых': 'Recreation', 'вредного': 'Bad habits',
        'привычка': 'Habit', 'работа': 'Work', 'учеба': 'Study', 'спорт': 'Sport',
        'отказ': 'Quit', 'финансы': 'Finance', 'семья': 'Family', 'друзья': 'Friends',
        'творчество': 'Creativity', 'медитация': 'Meditation', 'сон': 'Sleep',
        'питание': 'Nutrition', 'обучение': 'Learning', 'йога': 'Yoga',
        'еда': 'Food', 'деньги': 'Money', 'дом': 'Home',
        'уборка': 'Cleaning', 'хобби': 'Hobby', 'музыка': 'Music', 'чтение': 'Reading',
        'план': 'Plan', 'цель': 'Goal', 'успех': 'Success', 'путешествия': 'Travel',
    };
    let result = ruText;
    Object.entries(translations).forEach(([ru, en]) => {
        const regex = new RegExp(ru, 'gi');
        result = result.replace(regex, en);
    });
    // Capitalize first letter
    return result.charAt(0).toUpperCase() + result.slice(1);
};

const translateToRussian = (enText) => {
    const translations = {
        'health': 'Здоровье', 'growth': 'Развитие', 'productivity': 'Продуктивность',
        'relationships': 'Отношения', 'recreation': 'Отдых',
        'bad': 'Вредного', 'habits': 'привычка', 'work': 'Работа', 'study': 'Учеба',
        'sport': 'Спорт', 'quit': 'Отказ', 'finance': 'Финансы', 'family': 'Семья',
        'friends': 'Друзья', 'creativity': 'Творчество', 'meditation': 'Медитация',
        'sleep': 'Сон', 'nutrition': 'Питание', 'learning': 'Обучение', 'yoga': 'Йога',
        'food': 'Еда', 'money': 'Деньги', 'home': 'Дом', 'cleaning': 'Уборка',
        'hobby': 'Хобби', 'music': 'Музыка', 'reading': 'Чтение', 'plan': 'План',
        'goal': 'Цель', 'success': 'Успех', 'travel': 'Путешествия',
    };
    let result = enText.toLowerCase();
    Object.entries(translations).forEach(([en, ru]) => {
        const regex = new RegExp('\\b' + en + '\\b', 'gi');
        result = result.replace(regex, ru);
    });
    return result;
};

const setGoalForDefault = (habitName,langIndex) => {
  const goals = {
  // Health / Здоровье
  "Пить воду": [
    ["Пью стакан воды утром 7 дней", "Пью 1.5 л воды ежедневно 2 недели", "Пью 2 л воды 5+ дней в неделю 3 недели", "Слежу за водой (2–2.5 л) без пропусков 4 недели"],
    ["Drink a glass of water in the morning for 7 days", "Drink 1.5L water daily for 2 weeks", "Drink 2L water on 5+ days/week for 3 weeks", "Track 2–2.5L daily without missing 4 weeks"]
  ],
  "Хороший сон": [
    ["Сплю 7+ часов 5 ночей из 7", "Сплю 7–8 ч 6 ночей из 7, 3 недели", "Ложусь и встаю в одно время 5+ дней/неделю, 4 недели", "Поддерживаю режим сна 6+ ночей/неделю 5 недель"],
    ["Sleep 7+ hours on 5 out of 7 nights", "Sleep 7–8h on 6/7 nights for 3 weeks", "Go to bed & wake up at same time 5+ days/week for 4 weeks", "Maintain sleep schedule 6+ nights/week for 5 weeks"]
  ],
  "Двигаться каждый день": [
    ["10 мин движения ежедневно 7 дней", "30 мин активности 5+ дней/неделю, 3 недели", "Разные виды активности (ходьба, тренировка) 5 дней/неделю, 4 недели", "Активность 45+ мин 5 дней/неделю или 10k шагов, 5 недель"],
    ["10 min movement daily for 7 days", "30 min activity 5+ days/week for 3 weeks", "Mix of activities (walk, workout) 5 days/week for 4 weeks", "45+ min activity or 10k steps 5 days/week for 5 weeks"]
  ],
  "Здоровое питание": [
    ["Овощи в 1 приёме пищи ежедневно, 7 дней", "Овощи в 2 приёмах 5+ дней/неделю, 3 недели", "Цельные продукты >80% рациона 4 недели", "Готовлю здоровую еду 5+ дней/неделю, 5 недель"],
    ["Veggies in 1 meal daily for 7 days", "Veggies in 2 meals 5+ days/week for 3 weeks", "Whole foods >80% of diet for 4 weeks", "Cook healthy meals 5+ days/week for 5 weeks"]
  ],
  "Уход за телом": [
    ["Чищу зубы утром и вечером 7 дней", "Полный уход (зубы, душ, кожа) 6+ дней/неделю, 3 недели", "Добавляю 1 новую практику (например, скраб), 4 недели", "Уход без пропусков + уход за волосами/ногтями, 5 недель"],
    ["Brush teeth morning & evening for 7 days", "Full care (teeth, shower, skin) 6+ days/week for 3 weeks", "Add 1 new practice (e.g., exfoliation) for 4 weeks", "No missed days + hair/nail care for 5 weeks"]
  ],
  "Силовая тренировка": [
    ["1 силовая тренировка за неделю", "2 тренировки в неделю, 3 недели", "2 полноценные тренировки + прогрессия, 4 недели", "3 тренировки/неделю или работа с отягощениями, 5 недель"],
    ["1 strength workout this week", "2 workouts/week for 3 weeks", "2 full sessions + progressive overload for 4 weeks", "3 workouts/week or weighted training for 5 weeks"]
  ],
  "Бег": [
    ["Бег 10–15 мин 1 раз за неделю", "Бег 2×/неделю по 15 мин, 3 недели", "Бег 3×/неделю или 3 км за раз, 4 недели", "Бег 4×/неделю или улучшение выносливости, 5 недель"],
    ["Run 10–15 min once this week", "Run 2x/week for 15 min, 3 weeks", "Run 3x/week or 3 km/session for 4 weeks", "Run 4x/week or improve endurance for 5 weeks"]
  ],
  "Ходьба": [
    ["Ходьба 20 мин 3 дня на этой неделе", "7000 шагов или 30 мин 5+ дней/неделю, 3 недели", "8000+ шагов 5 дней/неделю, 4 недели", "10 000 шагов 5+ дней/неделю, 5 недель"],
    ["Walk 20 min on 3 days this week", "7k steps or 30 min 5+ days/week for 3 weeks", "8k+ steps 5 days/week for 4 weeks", "10k steps 5+ days/week for 5 weeks"]
  ],
  "Растяжка или йога": [
    ["Растяжка 10 мин 1 раз за неделю", "10–15 мин через день, 3 недели", "Йога/растяжка 4×/неделю, 4 недели", "Ежедневная практика 10+ мин, 5 недель"],
    ["10-min stretch once this week", "10–15 min every other day for 3 weeks", "Yoga/stretching 4x/week for 4 weeks", "Daily 10+ min practice for 5 weeks"]
  ],
  "Медитация и дыхание": [
    ["Медитация 5 мин 1 раз за неделю", "5–10 мин 5 дней/неделю, 3 недели", "10 мин ежедневно или дыхание при стрессе, 4 недели", "Медитация + осознанность в течение дня, 5 недель"],
    ["5-min meditation once this week", "5–10 min 5 days/week for 3 weeks", "10 min daily or breathwork during stress for 4 weeks", "Meditation + mindfulness throughout day for 5 weeks"]
  ],

  // Growth / Развитие
  "Чтение": [
    ["Читаю 10 мин 3 дня на этой неделе", "15 мин 5 дней/неделю, 3 недели", "20+ мин 5 дней/неделю + заметки, 4 недели", "Читаю книгу до конца или 30 мин/день, 5 недель"],
    ["Read 10 min on 3 days this week", "15 min 5 days/week for 3 weeks", "20+ min 5 days/week + notes for 4 weeks", "Finish a book or read 30 min/day for 5 weeks"]
  ],
  "Обучение навыкам": [
    ["Учусь 15 мин 1 раз за неделю", "20 мин 4 дня/неделю, 3 недели", "Проект или практика 3×/неделю, 4 недели", "Применяю навык в реальной задаче, 5 недель"],
    ["Learn 15 min once this week", "20 min 4 days/week for 3 weeks", "Work on project 3x/week for 4 weeks", "Apply skill to real task for 5 weeks"]
  ],
  "Иностранный язык": [
    ["Язык 10 мин 1 раз за неделю", "15 мин 5 дней/неделю, 3 недели", "Говорю/слушаю 3×/неделю + приложение, 4 недели", "Общение на языке или просмотр без субтитров, 5 недель"],
    ["Language 10 min once this week", "15 min 5 days/week for 3 weeks", "Speak/listen 3x/week + app for 4 weeks", "Converse or watch content without subs for 5 weeks"]
  ],
  "Ведение дневника": [
    ["Пишу 2 строки 1 раз за неделю", "3–5 предложений 5 дней/неделю, 3 недели", "Дневник + эмоции/идеи 4 дня/неделю, 4 недели", "Ежедневные записи + недельный обзор, 5 недель"],
    ["Write 2 lines once this week", "3–5 sentences 5 days/week for 3 weeks", "Journal + emotions/ideas 4 days/week for 4 weeks", "Daily entries + weekly review for 5 weeks"]
  ],
  "Рефлексия": [
    ["1 вопрос о дне 1 раз за неделю", "Рефлексия 5 дней/неделю, 3 недели", "Вопросы + выводы 5 дней/неделю, 4 недели", "Глубокая недельная рефлексия + план, 5 недель"],
    ["1 reflection question once this week", "Reflect 5 days/week for 3 weeks", "Questions + takeaways 5 days/week for 4 weeks", "Deep weekly reflection + plan for 5 weeks"]
  ],

  // Productivity / Продуктивность
  "Планирование дня": [
    ["План на день 1 раз за неделю", "Планирую вечером 6 дней/неделю, 3 недели", "План + приоритеты 6 дней/неделю, 4 недели", "Ежедневное планирование + гибкость, 5 недель"],
    ["Plan the day once this week", "Plan each evening 6 days/week for 3 weeks", "Plan + set priorities 6 days/week for 4 weeks", "Daily planning with adaptability for 5 weeks"]
  ],
  "Главная задача дня": [
    ["Сделал 1 важную задачу на неделе", "Главную задачу до обеда 4 дня/неделю, 3 недели", "Главную + 2 средние задачи 4 дня/неделю, 4 недели", "Завершаю важные задачи до 14:00, 5 недель"],
    ["Complete 1 important task this week", "Do #1 task before lunch 4 days/week for 3 weeks", "Do #1 + 2 medium tasks 4 days/week for 4 weeks", "Finish key tasks before 2 PM for 5 weeks"]
  ],
  "Работа по таймеру": [
    ["1 фокус-блок (25 мин) за неделю", "2 блока 3 дня/неделю, 3 недели", "3 блока 4 дня/неделю, 4 недели", "Фокус-блоки + защита от отвлечений, 5 недель"],
    ["1 focus block (25 min) this week", "2 blocks on 3 days/week for 3 weeks", "3 blocks on 4 days/week for 4 weeks", "Focus blocks + distraction shield for 5 weeks"]
  ],
  "Разбор входящих": [
    ["Проверил почту в одно время 1 день", "3 окна для входящих 5 дней/неделю, 3 недели", "2 окна + архивация, 4 недели", "Входящие обрабатываются до 18:00, 5 недель"],
    ["Check messages at set time on 1 day", "3 time blocks 5 days/week for 3 weeks", "2 blocks + inbox zero for 4 weeks", "Process all messages by 6 PM for 5 weeks"]
  ],
  "Вечерний обзор": [
    ["Подвёл итоги 1 раз за неделю", "Обзор + завтрашний план 5 вечеров/неделю, 3 недели", "Обзор + благодарность 5 вечеров/неделю, 4 недели", "Полный ритуал: итоги, план, мысли, 5 недель"],
    ["Review day once this week", "Review + plan tomorrow 5 evenings/week for 3 weeks", "Review + gratitude 5 evenings/week for 4 weeks", "Full ritual: review, plan, reflections for 5 weeks"]
  ],

  // Relationships & Recreation
  "Контакт с близкими": [
    ["Написал/позвонил 1 раз за неделю", "Контакт каждые 2 дня, 3 недели", "Голос/видео 3×/неделю, 4 недели", "Ежедневный микро-контакт или еженедельная встреча, 5 недель"],
    ["Message/call once this week", "Contact every 2 days for 3 weeks", "Voice/video 3x/week for 4 weeks", "Daily micro-contact or weekly meet-up for 5 weeks"]
  ],
  "Качественное общение": [
    ["15 мин без гаджетов 1 раз за неделю", "20 мин 3×/неделю, 3 недели", "30 мин без экранов 3×/неделю, 4 недели", "Полноценное общение 4×/неделю, 5 недель"],
    ["15 gadget-free mins once this week", "20 mins 3x/week for 3 weeks", "30 screen-free mins 3x/week for 4 weeks", "Quality time 4x/week for 5 weeks"]
  ],
  "Поддержка": [
    ["1 добрый жест за неделю", "Добрый поступок 4 дня/неделю, 3 недели", "Поддержка + внимание 4 дня/неделю, 4 недели", "Регулярная забота о близких, 5 недель"],
    ["1 kind act this week", "Kind gesture 4 days/week for 3 weeks", "Support + active care 4 days/week for 4 weeks", "Consistent care for loved ones for 5 weeks"]
  ],
  "Активное слушание": [
    ["Слушал без перебиваний 1 раз", "Практикую в 3 разговорах, 3 недели", "Слушаю и перефразирую 4×/неделю, 4 недели", "Активное слушание как привычка, 5 недель"],
    ["Listened without interrupting once", "Practice in 3 convos for 3 weeks", "Listen + paraphrase 4x/week for 4 weeks", "Active listening as default habit for 5 weeks"]
  ],
  "Благодарность": [
    ["Поблагодарил кого-то 1 раз", "Благодарность 5 дней/неделю, 3 недели", "Благодарность + причина 5 дней/неделю, 4 недели", "Ежедневная благодарность в словах или письме, 5 недель"],
    ["Thanked someone once", "Express thanks 5 days/week for 3 weeks", "Thanks + reason 5 days/week for 4 weeks", "Daily verbal or written gratitude for 5 weeks"]
  ],
  "Хобби": [
    ["Хобби 20 мин 1 раз за неделю", "30 мин 3×/неделю, 3 недели", "Хобби + творческий вызов 3×/неделю, 4 недели", "Регулярная практика с прогрессом, 5 недель"],
    ["Hobby 20 min once this week", "30 min 3x/week for 3 weeks", "Hobby + mini-challenge 3x/week for 4 weeks", "Consistent practice with visible progress for 5 weeks"]
  ],
  "Прогулка": [
    ["Прогулка 20 мин 1 раз за неделю", "20+ мин 4 дня/неделю, 3 недели", "Прогулка на природе 3×/неделю, 4 недели", "Ежедневная прогулка 30+ мин, 5 недель"],
    ["Walk 20 min once this week", "20+ min 4 days/week for 3 weeks", "Nature walk 3x/week for 4 weeks", "Daily 30+ min walk for 5 weeks"]
  ],
  "Сознательный отдых": [
    ["1 перерыв без телефона за неделю", "2 перерыва по 10 мин ежедневно, 3 недели", "3 перерыва + закрытые глаза, 4 недели", "Осознанные паузы между задачами, 5 недель"],
    ["1 phone-free break this week", "2x 10-min breaks daily for 3 weeks", "3 breaks + eyes closed for 4 weeks", "Mindful pauses between tasks for 5 weeks"]
  ],
  "Творчество": [
    ["Создал что-то 1 раз за неделю", "Творчество 2×/неделю, 3 недели", "Проект или эксперимент 2×/неделю, 4 недели", "Еженедельное завершение творческой задачи, 5 недель"],
    ["Created something once this week", "Create 2x/week for 3 weeks", "Project or experiment 2x/week for 4 weeks", "Finish creative task weekly for 5 weeks"]
  ],
  "Цифровой детокс": [
    ["1 час без соцсетей 1 раз за неделю", "1 час 6 дней/неделю, 3 недели", "Утро/вечер без экранов, 4 недели", "Цифровой детокс по расписанию, 5 недель"],
    ["1 hour without social media once this week", "1 hour 6 days/week for 3 weeks", "Screen-free morning/evening for 4 weeks", "Scheduled digital detox for 5 weeks"]
  ],

  // Bad Habits to Quit
  "Сладкое и фастфуд": [
    ["Без сладкого/фастфуда 5 дней", "≤2 раза/неделю, 3 недели", "Только в выходные или 1 раз/неделю, 4 недели", "Полный контроль: только осознанные порции, 5 недель"],
    ["No sweets/fast food on 5 days", "≤2x/week for 3 weeks", "Only on weekends or 1x/week for 4 weeks", "Full control: only mindful portions for 5 weeks"]
  ],
  "Поздний отход ко сну": [
    ["Ложусь до 23:30 4 ночи", "До цели 6 ночей/неделю, 3 недели", "Одинаковое время отбоя 5+ дней, 4 недели", "Режим сна + ритуал засыпания, 5 недель"],
    ["Bed by 11:30 PM on 4 nights", "By target time 6 nights/week for 3 weeks", "Consistent bedtime 5+ days for 4 weeks", "Sleep schedule + wind-down ritual for 5 weeks"]
  ],
  "Прокрастинация": [
    ["Начал задачу сразу 1 раз", "Начинаю в течение 10 мин 4 дня/неделю, 3 недели", "Разбиваю задачи + начинаю сразу, 4 недели", "Работаю по расписанию без откладывания, 5 недель"],
    ["Started a task right away once", "Begin within 10 min 4 days/week for 3 weeks", "Break tasks + start immediately for 4 weeks", "Work by schedule, no delays for 5 weeks"]
  ],
  "Лишний экран": [
    ["Скроллинг –30 мин 1 день", "≤30 мин/день 6 дней/неделю, 3 недели", "Уведомления выключены + скроллинг по расписанию, 4 недели", "Экран только по делу, 5 недель"],
    ["Reduced scrolling by 30 min on 1 day", "≤30 min/day 6 days/week for 3 weeks", "Notifications off + scheduled scrolling for 4 weeks", "Screen only for purpose for 5 weeks"]
  ],
  "Нездоровые перекусы": [
    ["Здоровый перекус 5 дней", "Здоровые перекусы 4 дня/неделю, 3 недели", "План перекусов + вода вместо еды, 4 недели", "Нет импульсивных перекусов, 5 недель"],
    ["Healthy snack on 5 days", "Healthy snacks 4 days/week for 3 weeks", "Snack plan + water instead of food for 4 weeks", "No impulsive snacking for 5 weeks"]
  ],
  "Игры слишком много": [
    ["Игры ≤1 ч 1 день", "≤1 ч/день (или 0 в будни) 6 дней/неделю, 3 недели", "Таймер + альтернатива (хобби), 4 недели", "Игры только по плану, 5 недель"],
    ["Gaming ≤1h on 1 day", "≤1h/day (or 0 on weekdays) 6 days/week for 3 weeks", "Timer + hobby alternative for 4 weeks", "Gaming only as scheduled for 5 weeks"]
  ],
  "Порно": [
    ["Без порно 7 дней", "Полный отказ + блокировка, 3 недели", "Удалены триггеры + поддержка, 4 недели", "Новые привычки вместо старых, 5 недель"],
    ["No porn for 7 days", "Full abstinence + blockers for 3 weeks", "Triggers removed + support system for 4 weeks", "New habits replace old for 5 weeks"]
  ],
  "Курение": [
    ["–30% сигарет на неделе", "–50% или замена, 3 недели", "Курю только в определённых ситуациях, 4 недели", "Полный отказ или замена без срывов, 5 недель"],
    ["–30% cigarettes this week", "–50% or substitute for 3 weeks", "Smoke only in specific contexts for 4 weeks", "Full quit or clean substitution for 5 weeks"]
  ],
  "Алкоголь": [
    ["Алкоголь ≤1 раза на неделе", "≤1 раз/неделю и ≤1 порция, 3 недели", "Только по особым случаям, 4 недели", "Полный перерыв или осознанное употребление, 5 недель"],
    ["Alcohol ≤1x this week", "≤1x/week and ≤1 serving for 3 weeks", "Only on special occasions for 4 weeks", "Full break or fully mindful use for 5 weeks"]
  ]
};

  return habitName in  goals ? goals[habitName][langIndex] : [];
}

export default AddHabitPanel;
