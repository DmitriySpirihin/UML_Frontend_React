import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors'
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, setPage, lastPage$, theme$, lang$, fontSize$, setCurrentBottomBtn, keyboardVisible$, updateConfirmationPanel, emitHabitsChanged } from '../../StaticClasses/HabitsBus';
import { FaSearch, FaTrashAlt, FaChevronRight, FaPlus, FaListUl, FaUndo, FaPencilAlt } from 'react-icons/fa';
import { MdFiberNew, MdDone, MdClose , MdListAlt } from 'react-icons/md';
import { IoIosArrowBack } from 'react-icons/io';
import Slider from '@mui/material/Slider';
import ScrollPicker from '../../Helpers/ScrollPicker.jsx'; // Imported Component
import { playEffects } from '../../StaticClasses/Effects.js';
import { HABITS_ACCENT, HABIT_ICON_GROUPS, HABIT_ICON_OPTIONS, HabitOutlineIcon, buildHabitsAccent, getHabitCategoryTone, normalizeHabitIconKey } from './HabitVisuals.jsx';

const click = new Audio('Audio/Click.wav');
const now = new Date();

// --- ВНЕШНИЕ ХЕЛПЕРЫ (ДЛЯ СТАБИЛЬНОСТИ) ---
const getAllHabits = () => {
    const custom = AppData.CustomHabits || [];
    return custom.concat(
        allHabits.filter(habit => !custom.some(customHabit => customHabit.id === habit.id))
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
    target: ['цель', 'фокус', 'мишень'],
    people: ['люди', 'семья', 'друзья'],
    chat: ['чат', 'сообщение', 'общение'],
    speech: ['речь', 'выступление'],
    creative: ['творчество', 'рисование'],
    musicNote: ['музыка', 'нота'],
    cameraIcon: ['фото', 'камера'],
    homeIcon: ['дом', 'семья'],
    cart: ['покупки', 'магазин'],
    tree: ['природа', 'парк'],
    screen: ['экран', 'телефон'],
    detox: ['детокс', 'запрет'],
    sugar: ['сладкое', 'сахар'],
    soda: ['газировка', 'напиток'],
    late: ['поздно', 'сон'],
    smoke: ['курение', 'сигарета'],
    alcohol: ['алкоголь'],
    game: ['игры'],
    pillIcon: ['таблетка', 'лекарства', 'витамины'],
    leaf: ['овощи', 'лист'],
    apple: ['фрукты', 'яблоко'],
    cup: ['кофе', 'чай', 'кофеин'],
    codeIcon: ['код', 'программирование'],
    bellOff: ['уведомления', 'колокол'],
    folder: ['файлы', 'папка'],
    tooth: ['зубы', 'гигиена'],
    shower: ['душ', 'уход'],
    lungs: ['дыхание', 'легкие'],
    scale: ['вес', 'измерение'],
    forkKnife: ['еда', 'столовые приборы'],
    bowl: ['миска', 'еда'],
    seedling: ['растение', 'рост'],
    graduation: ['учеба', 'образование'],
    pencil: ['карандаш', 'писать'],
    bulb: ['идея', 'лампа'],
    calculatorIcon: ['калькулятор', 'счет'],
    chartLine: ['график', 'аналитика'],
    briefcase: ['работа', 'портфель'],
    mailIcon: ['почта', 'письмо'],
    rocket: ['запуск', 'рост'],
    mapPin: ['место', 'карта'],
    car: ['машина', 'поездка'],
    plane: ['самолет', 'путешествие'],
    calendarCheck: ['календарь', 'дата'],
    trophy: ['награда', 'достижение'],
    shield: ['защита', 'безопасность'],
    lockIcon: ['замок', 'закрыть'],
    paletteIcon: ['палитра', 'творчество'],
    headphones: ['наушники', 'музыка'],
    phoneIcon: ['телефон', 'смартфон'],
    cloudIcon: ['облако', 'бэкап'],
    wrench: ['инструмент', 'настройка'],
    spark: ['искра', 'новое'],
    batteryIcon: ['энергия', 'батарея'],
    bookmark: ['закладка', 'сохранить'],
    flagIcon: ['флаг', 'цель'],
    compass: ['компас', 'направление'],
    puzzle: ['пазл', 'логика'],
    recycle: ['повтор', 'переработка'],
    wallet: ['кошелек', 'финансы'],
    receipt: ['чек', 'расходы'],
    bank: ['банк', 'финансы'],
    microscope: ['исследование', 'наука'],
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
        const allIcons = HABIT_ICON_OPTIONS;
        if (!iconSearchQuery.trim()) return allIcons;
        const query = iconSearchQuery.toLowerCase();
        return allIcons.filter((key) => {
            const aliases = iconSearchAliases[key] || [];
            return key.toLowerCase().includes(query) || aliases.some(alias => alias.toLowerCase().includes(query));
        });
    }, [iconSearchQuery]);

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

    const activeCategoryKey = showCreatePanel
        ? habitCategory
        : (selectedHabit?.category?.[0] || allCategories.find(c => c.label[langIndex] === filterCategory)?.label?.[0] || filterCategory);
    const activeCategoryTone = getHabitCategoryTone(activeCategoryKey);
    const dynamicAccent = buildHabitsAccent(activeCategoryTone.hue || HABITS_ACCENT.hue);
    const isLight = theme === 'light' || theme === 'speciallight';
    const ui = {
        bg: isLight
            ? `radial-gradient(900px 450px at 80% -10%, rgba(${dynamicAccent.rgb},0.10), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(111,139,214,0.08), transparent 58%), #F4F5F7`
            : `radial-gradient(1000px 500px at 80% -10%, rgba(${dynamicAccent.rgb},0.07), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(138,124,214,0.05), transparent 55%), #0E1013`,
        card: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(24,28,31,0.88)',
        cardSoft: isLight ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.045)',
        field: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.055)',
        text: Colors.get('mainText', theme),
        sub: Colors.get('subText', theme),
        accent: dynamicAccent.hue,
        accentSoft: dynamicAccent.soft,
        accentRing: dynamicAccent.ring,
        accentGlow: dynamicAccent.glow,
        accentRgb: dynamicAccent.rgb,
        blur: 'blur(30px)',
        border: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
        borderStrong: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(159,180,196,0.2)',
        shadow: isLight ? '0 18px 42px rgba(15,23,42,0.08)' : '0 26px 60px rgba(0,0,0,0.34)'
    };

    const getLibraryHabitIcon = (habit, size = 26) => {
        if (!habit) return <HabitOutlineIcon iconName="default" size={size} />;
        return <HabitOutlineIcon iconName={habit.iconName || 'default'} habitName={habit.name} categoryKey={habit.category?.[0]} size={size} />;
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

    const handleLibraryAdd = (habit) => {
        if (!habit) return;
        const selectedCat = allCategories.find(c => c.label[langIndex] === habit.category[langIndex]);
        const isNeg = selectedCat?.isNegative ?? (habit.category[0] === 'Отказ от вредного');

        setHabitId(habit.id);
        setHabitName(habit.name[langIndex]);
        setHabitCategory(habit.category[0]);
        setIsNegative(isNeg);
        setHabitAutoComplete(false);
        setGoals(setGoalForDefault(habit.name[0], langIndex));
        setDaysToForm(isNeg ? 120 : 66);
        if (habitSearchQuery.trim()) setFilterCategory(habit.category[langIndex]);
        setConfirmationPanel(true);
        if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
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
        if (habitSearchQuery.trim()) setHabitSearchQuery('');
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

    const openCustomHabitPanel = () => {
        const selectedCat = allCategories.find(c => c.label[langIndex] === filterCategory) || activeCategories[0];
        setshowCreatePanel(true);
        setHabitName('');
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

    const closeCustomHabitPanel = () => {
        setshowCreatePanel(false);
        setGoals([]);
        if (selectedHabit) handleHabitSelect(selectedHabit);
    };

    const handleNext = () => {
        if (showCreatePanel && habitName.trim().length < 2) {
            setShowPopUpPanel(langIndex === 0 ? 'Введите название привычки' : 'Enter habit name', 2000, false);
            return;
        }
        if (!showCreatePanel && !selectedHabit) {
            setShowPopUpPanel(langIndex === 0 ? 'Выберите привычку' : 'Choose a habit', 2000, false);
            return;
        }
        setConfirmationPanel(true);
    };

    const handleSave = async () => {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const finalGoals = goals.map(g => ({ text: g, isDone: false }));
        const effectiveHabit = !showCreatePanel ? (selectedHabit || filteredHabits[0]) : null;
        const effectiveHabitId = effectiveHabit?.id ?? habitId;
        const effectiveHabitName = effectiveHabit?.name?.[langIndex] ?? habitName.trim();
        const added = showCreatePanel
            ? await createHabit(habitName.trim(), getCategory(habitCategory), habitDescription.trim(), habitIcon, dateStr, finalGoals, isNegative, daysToForm, habitAutoComplete)
            : await addHabit(effectiveHabitId, effectiveHabitName, false, dateStr, finalGoals, isNegative, daysToForm, habitAutoComplete);
        if (added) closePanel();
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

    const renderCategoryStrip = () => (
        <div style={categoryStrip()}>
            {activeCategories.map((cat) => {
                const active = filterCategory === cat.label[langIndex];
                const tone = getHabitCategoryTone(cat.label[0]);

                return (
                    <motion.div
                        key={cat._idx}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => selectCategory(cat)}
                        style={categoryChip(active, tone, ui)}
                    >
                        <span style={categoryChipIcon(active, tone)}>
                            <HabitOutlineIcon iconName={cat.icon || tone.icon} categoryKey={cat.label[0]} size={15} />
                        </span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label[langIndex]}</span>
                        <span style={categoryChipActions(active, ui)}>
                            <span onClick={(e) => { e.stopPropagation(); openEditCategory(cat._idx); }} style={categoryActionBtn(ui)}>
                                <FaPencilAlt size={10} />
                            </span>
                            <span onClick={(e) => { e.stopPropagation(); requestDeleteCategory(cat._idx); }} style={categoryActionBtn(ui, true)}>
                                <FaTrashAlt size={10} />
                            </span>
                        </span>
                    </motion.div>
                );
            })}
            {langIndex === 0 && (
                <motion.div whileTap={{ scale: 0.97 }} onClick={() => setSelectCategoryPanel(true)} style={addCategoryChip(ui)}>
                    <FaPlus size={11} />
                    Добавить
                </motion.div>
            )}
        </div>
    );

    const renderDeletedCategories = (compact = false) => (
        deletedCategories.length > 0 && (
            <div style={{ marginBottom: compact ? 0 : 12 }}>
                <motion.div whileTap={{ scale: 0.97 }} onClick={() => setShowDeletedCategories(v => !v)} style={restoreToggle(ui)}>
                    <FaUndo size={10} color={ui.sub} />
                    <span>{langIndex === 0 ? 'Восстановить удалённые' : 'Restore deleted'}</span>
                </motion.div>
                {showDeletedCategories && (
                    <div style={restoreGrid()}>
                        {deletedCategories.map((cat) => {
                            const tone = getHabitCategoryTone(cat.label[0]);
                            return (
                                <motion.div key={cat._idx} whileTap={{ scale: 0.96 }} onClick={() => handleRestoreCategory(cat)} style={restoreChip(tone, ui)}>
                                    <span style={{ color: tone.hue, display: 'flex' }}>
                                        <HabitOutlineIcon iconName={cat.icon || tone.icon} categoryKey={cat.label[0]} size={14} />
                                    </span>
                                    <span>{cat.label[langIndex]}</span>
                                    <FaUndo size={10} />
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        )
    );

    const renderIconGroups = (selectedIcon, onSelectIcon, compact = false) => {
        const hasSearch = iconSearchQuery.trim().length > 0;
        const groups = hasSearch
            ? [{ key: 'search', label: [filteredIconKeys.length ? 'Результаты' : 'Ничего не найдено', filteredIconKeys.length ? 'Results' : 'Nothing found'], icons: filteredIconKeys }]
            : HABIT_ICON_GROUPS;

        return (
            <div className="no-scrollbar" style={iconGroupsScroll(compact)}>
                {groups.map((group) => {
                    const icons = hasSearch ? group.icons : group.icons.filter(icon => filteredIconKeys.includes(icon));
                    if (icons.length === 0 && hasSearch) {
                        return (
                            <div key={group.key} style={iconEmptyState(ui)}>
                                {langIndex === 0 ? 'Попробуй другое слово' : 'Try another word'}
                            </div>
                        );
                    }
                    if (icons.length === 0) return null;

                    return (
                        <div key={group.key} style={iconGroupBlock()}>
                            <div style={iconGroupTitle(ui)}>{group.label[langIndex]}</div>
                            <div style={iconGroupGrid(compact)}>
                                {icons.map((iconKey) => (
                                    <motion.div
                                        key={iconKey}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onSelectIcon(iconKey)}
                                        style={{ ...iconItem(selectedIcon === iconKey, ui), padding: compact ? '10px' : '15px', cursor: 'pointer' }}
                                    >
                                        <span style={{ color: selectedIcon === iconKey ? ui.accent : ui.sub, display: 'flex' }}>
                                            <HabitOutlineIcon iconName={iconKey} habitName={habitName} categoryKey={habitCategory} size={compact ? 24 : 28} />
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ ...pageStyle, background: ui.bg }}
        >
                        <div style={pageHeader}>
                            <motion.div whileTap={{ scale: 0.9 }} onClick={confirmationPanel ? () => setConfirmationPanel(false) : closePanel} style={backBtn(ui)}>
                                <IoIosArrowBack size={24} color={ui.text} />
                            </motion.div>
                            <div style={brandBlock(ui)}>
                                <div style={brandTitle(ui)}>UltyMyLife</div>
                                <div style={brandSubtitle(ui)}>{langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}</div>
                            </div>
                            <div style={{ width: 42, height: 42 }} />
                        </div>

                        <div style={contentWrap()}>
                            <AnimatePresence mode="wait">
                                {!confirmationPanel ? (
                                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={addHero(ui)}>
                                            <div style={addHeroIcon(ui)}>
                                                <HabitOutlineIcon iconName={showCreatePanel ? 'creative' : 'target'} size={24} />
                                            </div>
                                            <div style={{ minWidth: 0 }}>
                                                <div style={heroEyebrow(ui)}>{showCreatePanel ? (langIndex === 0 ? 'НОВАЯ ЗАПИСЬ' : 'NEW ITEM') : (langIndex === 0 ? 'БАЗА ПРИВЫЧЕК' : 'HABIT LIBRARY')}</div>
                                                <h2 style={heroTitle(ui)}>
                                                    {showCreatePanel ? (langIndex === 0 ? 'Своя привычка' : 'Custom Habit') : (langIndex === 0 ? 'Добавить привычку' : 'Add Habit')}
                                                </h2>
                                            </div>
                                        </div>

                                        {!showCreatePanel ? (
                                            <>
                                                {renderCategoryStrip()}
                                                {renderDeletedCategories()}

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
                                                            <HabitLibraryList
                                                                habits={filteredHabits}
                                                                selectedHabit={selectedHabit}
                                                                onSelect={handleHabitSelect}
                                                                onAdd={handleLibraryAdd}
                                                                langIndex={langIndex}
                                                                ui={ui}
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
                                                                        style={{ padding: '11px 15px', borderRadius: '14px', background: ui.accentSoft, border: '1px solid transparent', color: ui.accent, fontWeight: '800', cursor: 'pointer' }}
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
                                            <div style={customFormCard(ui)}>
                                                {renderCategoryStrip()}
                                                {renderDeletedCategories(true)}

                                                <input
                                                    type="text" 
                                                                                        placeholder={langIndex === 0 ? 'название' : 'name'}
                                                                                        value={habitName}
                                                                                         onChange={(e) => setHabitName(e.target.value)}
                                                                                        style={textInput(ui)}
                                                                                        />
                                                <motion.div whileTap={{ scale: 0.98 }} style={iconPickerTrigger(ui)} onClick={() => setSelectIconPanel(true)}>
                                                    <span style={{ color: ui.text, fontWeight: '700' }}>{langIndex === 0 ? 'Иконка' : 'Icon'}</span>
                                                    <span style={{ color: ui.accent, display: 'flex' }}><HabitOutlineIcon iconName={habitIcon} habitName={habitName} categoryKey={habitCategory} size={28} /></span>
                                                </motion.div>
                                                 <input 
                                                                                        type="text" 
                                                                                        placeholder={langIndex === 0 ? 'описание' : 'description'}
                                                                                        value={habitDescription}
                                                                                         onChange={(e) => setHabitDescription(e.target.value)}
                                                                                        style={textInput(ui)}
                                                                                        />
                                               
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    /* ШАГ 2: Подтверждение (Барабаны даты, Цели, Слайдер) */
                                    <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} style={{ flex: 1, overflowY: 'auto' }}>
                                        <div style={confirmTitle(ui)}>
                                            <div style={confirmEyebrow(ui)}>{langIndex === 0 ? 'Настройка привычки' : 'Habit setup'}</div>
                                            <h3 style={{ color: ui.text, margin: 0, fontSize: 26, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 }}>{habitName}</h3>
                                        </div>
                                        
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
                                                                                        style={{flex: 1, border: 'none', background: ui.field, borderRadius: 14, fontSize: '16px', color: ui.text, padding: '12px 14px', outline: 'none'}}
                                                                                        />
                                                <motion.div whileTap={{ scale: 0.9 }} onClick={setNewGoal} style={addBtn(ui)}><FaPlus color={ui.accent} size={18} /></motion.div>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                {goals.map((g, i) => (
                                                    <motion.div layout key={i} style={goalRow(ui)}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <FaListUl color={ui.accent} size={14} />
                                                            <span style={{ color: ui.text, fontSize: '15px', fontWeight: '500' }}>{g}</span>
                                                        </div>
                                                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => removeGoal(i)} style={{ padding: '8px', background: 'rgba(216,120,94,0.12)', border: '1px solid rgba(216,120,94,0.22)', borderRadius: '10px' }}>
                                                            <FaTrashAlt color="#FF3B30" size={14} />
                                                        </motion.div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ marginBottom: '88px' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* --- ФИНАЛЬНЫЕ КНОПКИ --- */}
                            <div style={footerButtons}>
                                {!confirmationPanel && (
                                    <motion.div whileTap={{ scale: 0.9 }} style={btnNew(ui)} onClick={showCreatePanel ? closeCustomHabitPanel : openCustomHabitPanel}>
                                           {showCreatePanel ? <MdListAlt size={24} color={ui.accent} /> :  <MdFiberNew size={24} color={ui.accent} />}
                                    </motion.div>
                                )}

                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    style={btnNext(ui)}
                                    onClick={confirmationPanel ? handleSave : handleNext}
                                >
                                    {confirmationPanel ? (
                                        <>
                                            <MdDone size={24} color={ui.accent} />
                                            <span>{langIndex === 0 ? 'Добавить привычку' : 'Add habit'}</span>
                                        </>
                                    ) : (
                                        <FaChevronRight size={20} color={ui.accent} />
                                    )}
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
                                    style={{ ...iconSheet(ui), backdropFilter: ui.blur }}
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
                                    {renderIconGroups(habitIcon, (key) => { setHabitIcon(key); setSelectIconPanel(false); })}
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
                                    style={{ ...iconSheet(ui), backdropFilter: ui.blur }}
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

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <motion.div
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setNewCategoryIsNegative(false)}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer',
                                                    background: !newCategoryIsNegative ? 'rgba(120,184,121,0.12)' : ui.field,
                                                    border: `1px solid ${!newCategoryIsNegative ? 'rgba(120,184,121,0.28)' : ui.border}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span style={{ color: !newCategoryIsNegative ? '#78B879' : ui.text, fontWeight: '800', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                                    <HabitOutlineIcon iconName="check" size={14} />
                                                    {langIndex === 0 ? 'Хорошая' : 'Good'}
                                                </span>
                                            </motion.div>
                                            <motion.div
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setNewCategoryIsNegative(true)}
                                                style={{
                                                    flex: 1, padding: '12px', borderRadius: '14px', cursor: 'pointer',
                                                    background: newCategoryIsNegative ? 'rgba(216,120,94,0.12)' : ui.field,
                                                    border: `1px solid ${newCategoryIsNegative ? 'rgba(216,120,94,0.28)' : ui.border}`,
                                                    textAlign: 'center'
                                                }}
                                            >
                                                <span style={{ color: newCategoryIsNegative ? '#D8785E' : ui.text, fontWeight: '800', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                                    <HabitOutlineIcon iconName="flame" size={14} />
                                                    {langIndex === 0 ? 'Вредная' : 'Bad'}
                                                </span>
                                            </motion.div>
                                        </div>

                                        {/* Выбор иконки */}
                                        <div style={{ padding: '14px', background: ui.field, border: `1px solid ${ui.border}`, borderRadius: '18px' }}>
                                            <p style={{ color: ui.sub, fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '8px' }}>{langIndex === 0 ? 'Иконка' : 'Icon'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center', borderRadius: '12px', padding: '0 10px', marginBottom: '10px', background: ui.cardSoft, border: `1px solid ${ui.border}` }}>
                                                <FaSearch color={ui.sub} style={{ marginRight: '8px' }} />
                                                <input
                                                    type="text"
                                                    placeholder={langIndex === 0 ? 'Поиск...' : 'Search...'}
                                                    value={iconSearchQuery}
                                                    onChange={(e) => setIconSearchQuery(e.target.value)}
                                                    style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', color: ui.text, padding: '10px 0', outline: 'none' }}
                                                />
                                            </div>
                                            {renderIconGroups(newCategoryIcon, setNewCategoryIcon, true)}
                                        </div>

                                        {/* Кнопки */}
                                        <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                                            {editingCategoryIndex !== null && (
                                                <motion.div whileTap={{ scale: 0.95 }} onClick={handleDeleteCategory}
                                                    style={{ flex: 1, padding: '14px', background: 'rgba(216,120,94,0.13)', border: '1px solid rgba(216,120,94,0.3)', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
                                                    <span style={{ color: '#D8785E', fontWeight: '800', fontSize: '14px' }}>
                                                        {langIndex === 0 ? 'Удалить' : 'Delete'}
                                                    </span>
                                                </motion.div>
                                            )}
                                            <motion.div whileTap={{ scale: 0.95 }} onClick={handleSaveCategory}
                                                style={{ flex: editingCategoryIndex !== null ? 1 : 2, padding: '14px', background: ui.accentSoft, border: '1px solid transparent', borderRadius: '14px', cursor: 'pointer', textAlign: 'center' }}>
                                                <span style={{ color: ui.accent, fontWeight: '800', fontSize: '14px' }}>
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

const getCategoryIconPool = (categoryKey) => {
    const key = String(categoryKey || '');
    if (key === 'Здоровье' || key === 'Health') {
        return [
            ...(HABIT_ICON_GROUPS.find(group => group.key === 'health')?.icons || []),
            ...(HABIT_ICON_GROUPS.find(group => group.key === 'food')?.icons || [])
        ];
    }
    if (key === 'Развитие' || key === 'Growth') return HABIT_ICON_GROUPS.find(group => group.key === 'growth')?.icons || [];
    if (key === 'Продуктивность' || key === 'Productivity') {
        return [
            ...(HABIT_ICON_GROUPS.find(group => group.key === 'productivity')?.icons || []),
            ...(HABIT_ICON_GROUPS.find(group => group.key === 'finance')?.icons || [])
        ];
    }
    if (key === 'Отношения и отдых' || key === 'Relationships & recreation') return HABIT_ICON_GROUPS.find(group => group.key === 'relationships')?.icons || [];
    if (key === 'Отказ от вредного' || key === 'Bad habits to quit') return HABIT_ICON_GROUPS.find(group => group.key === 'limits')?.icons || [];
    return HABIT_ICON_OPTIONS;
};

const buildUniqueHabitIconMap = (habits) => {
    const used = new Set();
    return new Map((habits || []).map((habit) => {
        const baseIcon = normalizeHabitIconKey(habit?.iconName || 'default', habit?.name, habit?.category?.[0]);
        const pool = [baseIcon, ...getCategoryIconPool(habit?.category?.[0]), ...HABIT_ICON_OPTIONS];
        const icon = pool.find(iconKey => !used.has(iconKey)) || baseIcon;
        used.add(icon);
        return [habit.id, icon];
    }));
};

function HabitLibraryList({ habits, selectedHabit, onSelect, onAdd, langIndex, ui }) {
    const displayIconById = useMemo(() => buildUniqueHabitIconMap(habits), [habits]);

    return (
        <div className="no-scrollbar" style={habitListScroll()}>
            {habits.map((habit, index) => {
                const active = selectedHabit?.id === habit.id;
                const tone = getHabitCategoryTone(habit.category?.[0]);

                return (
                    <motion.div
                        key={habit.id}
                        whileTap={{ scale: 0.985 }}
                        onClick={() => onSelect(habit)}
                        style={habitListCard(active, tone, ui)}
                    >
                        <div style={habitListIcon(tone, active)}>
                            <HabitOutlineIcon iconName={displayIconById.get(habit.id) || habit.iconName || 'default'} habitName={habit.name} categoryKey={habit.category?.[0]} size={24} />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={habitListTitle(ui)}>{habit.name[langIndex]}</div>
                            <div style={habitListDescription(ui)}>{habit.description[langIndex]}</div>
                            <div style={habitListMeta(tone)}>{habit.category[langIndex]}</div>
                        </div>
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.9 }}
                            onClick={(event) => {
                                event.stopPropagation();
                                onAdd?.(habit);
                            }}
                            aria-label={langIndex === 0 ? 'Добавить привычку' : 'Add habit'}
                            style={habitListAction(active, tone, ui)}
                        >
                            <FaPlus size={13} />
                        </motion.button>
                    </motion.div>
                );
            })}
        </div>
    );
}

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
                    const tone = getHabitCategoryTone(habit.category?.[0]);
                    return (
                        <div
                            key={habit.id}
                            onClick={() => onSelect(habit)}
                            style={habitPickerItem(focus, nearby, ui, tone)}
                        >
                            <div style={habitPickerContent()}>
                                <div style={habitPickerIconSlot()}>
                                    <div style={habitPickerIcon(focus, ui, tone)}>{getIcon(habit, iconSize)}</div>
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
const pageStyle = { position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', zIndex: 1000, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const pageHeader = { width: 'calc(100% - 32px)', maxWidth: 440, margin: '0 auto', padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 0 10px', display: 'grid', gridTemplateColumns: '46px minmax(0, 1fr) 46px', alignItems: 'center', gap: 10, boxSizing: 'border-box' };
const contentWrap = () => ({ width: 'calc(100% - 32px)', maxWidth: 440, margin: '0 auto', minHeight: 'calc(100vh - 82px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' });
const backBtn = (ui) => ({ width: '46px', height: '46px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(145deg, ${ui.cardSoft}, ${ui.field})`, border: '1px solid transparent', boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset, 0 14px 32px rgba(0,0,0,0.16)', cursor: 'pointer', flexShrink: 0 });
const brandBlock = () => ({ minWidth: 0, textAlign: 'center' });
const brandTitle = (ui) => ({ color: ui.text, fontSize: 24, fontWeight: 950, lineHeight: 1.02, letterSpacing: 0 });
const brandSubtitle = (ui) => ({ marginTop: 5, color: ui.sub, fontSize: 9, fontWeight: 850, letterSpacing: '0.14em', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' });
const addHero = (ui) => ({
    position: 'relative',
    overflow: 'hidden',
    minHeight: 98,
    borderRadius: 26,
    padding: '18px 18px',
    margin: '8px 0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: `radial-gradient(300px 140px at 84% -22%, rgba(${ui.accentRgb},0.15), transparent 70%), linear-gradient(145deg, rgba(25,31,34,0.9), rgba(20,23,25,0.92))`,
    border: '1px solid transparent',
    boxShadow: '0 18px 42px -30px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.035) inset',
    boxSizing: 'border-box'
});
const addHeroIcon = (ui) => ({ width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: ui.accent, background: ui.accentSoft, border: '1px solid transparent', boxShadow: `0 12px 24px -22px ${ui.accent}`, flexShrink: 0 });
const heroEyebrow = (ui) => ({ color: ui.sub, fontSize: 11, fontWeight: 900, letterSpacing: '0.16em' });
const heroTitle = (ui) => ({ color: ui.text, fontSize: 25, lineHeight: 1.05, fontWeight: 950, margin: '6px 0 0' });

const categoryStrip = () => ({
    width: '100%',
    maxWidth: '100%',
    overflowX: 'scroll',
    overflowY: 'hidden',
    display: 'flex',
    gap: 10,
    marginBottom: 12,
    padding: '0 36px 8px 2px',
    scrollbarWidth: 'none',
    flexWrap: 'nowrap',
    boxSizing: 'border-box',
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-x',
    overscrollBehaviorX: 'contain'
});
const categoryChip = (active, tone, ui) => ({
    minHeight: 42,
    padding: active ? '8px 8px 8px 10px' : '8px 10px',
    borderRadius: 16,
    whiteSpace: 'nowrap',
    background: active
        ? `linear-gradient(135deg, ${tone.soft}, rgba(255,255,255,0.055))`
        : ui.cardSoft,
    border: '1px solid transparent',
    color: active ? tone.hue : ui.text,
    fontSize: 13,
    fontWeight: 850,
    transition: '0.2s all',
    boxShadow: active ? `0 12px 24px -22px ${tone.hue}` : '0 1px 0 rgba(255,255,255,0.03) inset',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    boxSizing: 'border-box'
});
const categoryChipIcon = (active, tone) => ({ width: 25, height: 25, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone.hue, background: active ? tone.soft : 'rgba(255,255,255,0.045)', border: '1px solid transparent', flexShrink: 0 });
const categoryChipActions = (active, ui) => ({ display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: active ? 2 : 0, color: ui.sub });
const categoryActionBtn = (ui, danger = false) => ({ width: 23, height: 23, borderRadius: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(216,120,94,0.1)' : 'rgba(255,255,255,0.055)', border: '1px solid transparent', color: danger ? '#D8785E' : ui.sub, cursor: 'pointer', flexShrink: 0 });
const addCategoryChip = (ui) => ({ minHeight: 42, padding: '8px 14px', borderRadius: 16, whiteSpace: 'nowrap', background: ui.cardSoft, color: ui.accent, border: '1px solid transparent', fontSize: 13, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box' });
const restoreToggle = (ui) => ({ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 11px', borderRadius: 13, background: ui.cardSoft, border: '1px solid transparent', color: ui.sub, cursor: 'pointer', marginBottom: 8, fontSize: 12, fontWeight: 800 });
const restoreGrid = () => ({ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 });
const restoreChip = (tone, ui) => ({ padding: '8px 11px', borderRadius: 13, background: tone.soft, border: '1px solid transparent', color: ui.text, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, fontWeight: 800 });
const textInput = (ui) => ({ width: '100%', border: '1px solid transparent', background: ui.field, boxShadow: '0 1px 0 rgba(255,255,255,0.035) inset', fontSize: '16px', color: ui.text, outline: 'none', borderRadius: '18px', padding: '15px 16px', boxSizing: 'border-box' });
const customFormCard = (ui) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    padding: '14px',
    borderRadius: 26,
    background: `radial-gradient(260px 150px at 88% 0%, rgba(${ui.accentRgb},0.12), transparent 72%), linear-gradient(145deg, rgba(24,28,31,0.88), rgba(18,21,23,0.94))`,
    border: '1px solid transparent',
    boxShadow: '0 18px 42px -32px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.035) inset',
    boxSizing: 'border-box'
});

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' };
const dragHandle = { width: '45px', height: '5px', backgroundColor: '#8E8E93', borderRadius: '3px', margin: '15px auto', opacity: 0.4 };

const libraryPanel = (ui) => ({
    position: 'relative',
    background: `radial-gradient(260px 160px at 100% 8%, rgba(${ui.accentRgb},0.10), transparent 74%), linear-gradient(145deg, rgba(24,28,31,0.9), rgba(20,23,25,0.94))`,
    borderRadius: '26px',
    border: '1px solid transparent',
    overflow: 'hidden',
    boxShadow: '0 18px 42px -32px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.035) inset'
});
const librarySearchRow = (ui) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '0 16px',
    height: '54px',
    background: 'rgba(255,255,255,0.028)',
    borderBottom: `1px solid ${ui.border}`
});
const libraryCount = (ui) => ({
    minWidth: '30px',
    padding: '5px 8px',
    borderRadius: '999px',
    background: ui.accentSoft,
    border: '1px solid transparent',
    color: ui.accent,
    fontSize: '12px',
    fontWeight: '800',
    textAlign: 'center'
});
const pickerArea = () => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'stretch',
    minHeight: 0,
    maxHeight: 'min(430px, calc(100vh - 370px))'
});
const habitListScroll = () => ({
    width: '100%',
    maxHeight: 'min(430px, calc(100vh - 370px))',
    minHeight: 250,
    overflowY: 'auto',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxSizing: 'border-box',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    WebkitOverflowScrolling: 'touch'
});
const habitListCard = (active, tone, ui) => ({
    width: '100%',
    minHeight: 96,
    padding: '12px',
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    cursor: 'pointer',
    boxSizing: 'border-box',
    background: active
        ? `radial-gradient(220px 120px at 0% 20%, ${tone.soft}, transparent 72%), linear-gradient(145deg, rgba(28,34,36,0.96), rgba(22,25,27,0.96))`
        : 'rgba(255,255,255,0.025)',
    border: `1px solid ${active ? tone.ring : ui.border}`,
    boxShadow: active ? `0 12px 24px -22px ${tone.hue}, 0 1px 0 rgba(255,255,255,0.04) inset` : '0 1px 0 rgba(255,255,255,0.03) inset'
});
const habitListIcon = (tone, active) => ({
    position: 'relative',
    width: 58,
    height: 58,
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: tone.hue,
    background: active ? tone.soft : 'rgba(255,255,255,0.04)',
    border: `1px solid ${active ? tone.ring : 'rgba(255,255,255,0.07)'}`,
    boxShadow: active ? `0 12px 22px -20px ${tone.hue}` : 'none'
});
const habitListTitle = (ui) => ({
    color: ui.text,
    fontSize: 16,
    fontWeight: 950,
    lineHeight: 1.15,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
});
const habitListDescription = (ui) => ({
    marginTop: 5,
    color: ui.sub,
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'normal',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical'
});
const habitListMeta = (tone) => ({
    marginTop: 8,
    color: tone.hue,
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
});
const habitListAction = (active, tone, ui) => ({
    width: 32,
    height: 32,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? tone.hue : ui.sub,
    background: active ? tone.soft : 'rgba(255,255,255,0.035)',
    border: '1px solid transparent',
    flexShrink: 0,
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'inherit',
    outline: 'none'
});
const habitPickerFrame = (ui) => ({
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    background: 'transparent'
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
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.026), transparent)',
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
const habitPickerItem = (focus, nearby, ui, tone) => ({
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
    filter: focus > 0.72 ? `drop-shadow(0 12px 20px ${tone.soft})` : 'none',
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
const habitPickerIcon = (focus, ui, tone) => {
    const boxSize = 28 + (54 * focus);
    return ({
    width: `${boxSize}px`,
    height: `${boxSize}px`,
    borderRadius: `${10 + (14 * focus)}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: tone.hue,
    backgroundColor: focus > 0.55 ? tone.soft : 'rgba(255,255,255,0.035)',
    border: `1px solid ${focus > 0.55 ? tone.ring : 'rgba(255,255,255,0.045)'}`,
    boxShadow: focus > 0.7 ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px ${tone.soft}` : 'none',
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

const confirmTitle = (ui) => ({
    margin: '12px 0 16px',
    padding: '18px',
    borderRadius: 24,
    background: `radial-gradient(260px 130px at 90% 0%, rgba(${ui.accentRgb},0.13), transparent 72%), linear-gradient(145deg, ${ui.card}, ${ui.cardSoft})`,
    border: '1px solid transparent',
    boxShadow: '0 18px 42px -32px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.035) inset',
    textAlign: 'left'
});
const confirmEyebrow = (ui) => ({
    color: ui.accent,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    marginBottom: 6
});
const configCard = (ui) => ({
    background: `radial-gradient(260px 140px at 92% 0%, rgba(${ui.accentRgb},0.09), transparent 74%), linear-gradient(145deg, ${ui.card}, ${ui.cardSoft})`,
    borderRadius: 24,
    padding: '19px',
    marginBottom: 14,
    border: '1px solid transparent',
    boxShadow: '0 16px 38px -32px rgba(0,0,0,0.74), 0 1px 0 rgba(255,255,255,0.032) inset',
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur
});
const cardLabel = (ui) => ({ color: ui.sub, fontSize: '11px', fontWeight: '950', textTransform: 'uppercase', marginBottom: '13px', letterSpacing: '0.13em' });

const footerButtons = { display: 'flex', gap: '10px', padding: '12px 0 calc(12px + env(safe-area-inset-bottom, 0px))', alignItems: 'center', position: 'sticky', bottom: 0, background: 'transparent', zIndex: 5 };
const btnBase = { height: '58px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 15, fontWeight: 950, fontFamily: 'inherit' };
const btnCancel = (ui) => ({ ...btnBase, flex: 1, backgroundColor: '#FF3B30', border: `1px solid ${ui.border}` });
const btnNew = (ui) => ({ ...btnBase, width: '58px', background: ui.accentSoft, color: ui.accent, border: '1px solid transparent', boxShadow: `0 14px 24px -22px ${ui.accent}` });
const btnNext = (ui) => ({ ...btnBase, flex: 2, background: `linear-gradient(135deg, rgba(${ui.accentRgb},0.22), rgba(143,166,200,0.11))`, color: ui.text, border: '1px solid transparent', boxShadow: `0 14px 34px -28px rgba(${ui.accentRgb},0.45), inset 0 1px 0 rgba(255,255,255,0.08)` });

const iconSheet = (ui) => ({ width: '100%', maxHeight: '76vh', borderRadius: '34px 34px 0 0', overflow: 'hidden', borderTop: '1px solid transparent', background: 'linear-gradient(180deg, rgba(24,28,31,0.98), rgba(15,17,19,0.98))' });
const iconGrid = { maxHeight: '50vh', overflowY: 'scroll', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: '15px', padding: '0 25px 40px', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y', overscrollBehavior: 'contain' };
const iconGroupsScroll = (compact = false) => ({
    maxHeight: compact ? 'min(330px, 38vh)' : '50vh',
    overflowY: 'scroll',
    padding: compact ? '0 2px 4px' : '0 25px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: compact ? 14 : 18,
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-y',
    overscrollBehavior: 'contain'
});
const iconGroupBlock = () => ({
    display: 'flex',
    flexDirection: 'column',
    gap: 9
});
const iconGroupTitle = (ui) => ({
    color: ui.sub,
    fontSize: 10,
    fontWeight: 950,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    paddingLeft: 2
});
const iconGroupGrid = (compact = false) => ({
    display: 'grid',
    gridTemplateColumns: compact ? 'repeat(5, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(58px, 1fr))',
    gap: compact ? 8 : 12
});
const iconEmptyState = (ui) => ({
    color: ui.sub,
    fontSize: 13,
    fontWeight: 800,
    textAlign: 'center',
    padding: '18px 8px'
});
const categoryIconGrid = () => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: 8,
    maxHeight: 'min(320px, 36vh)',
    minHeight: 224,
    overflowY: 'scroll',
    paddingRight: 3,
    WebkitOverflowScrolling: 'touch',
    touchAction: 'pan-y',
    overscrollBehavior: 'contain'
});
const iconItem = (active, ui) => ({ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px', borderRadius: '18px', background: active ? ui.accentSoft : ui.field, border: '1px solid transparent', boxShadow: active ? `0 14px 24px -22px ${ui.accent}` : 'none' });
const iconPickerTrigger = (ui) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 16px', background: ui.field, border: '1px solid transparent', borderRadius: '18px', boxShadow: '0 1px 0 rgba(255,255,255,0.035) inset' });
const addBtn = (ui) => ({ width: '42px', height: '42px', borderRadius: '14px', background: ui.accentSoft, border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '12px', flexShrink: 0, cursor: 'pointer' });
const goalRow = (ui) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '15px', background: ui.field, border: '1px solid transparent', borderRadius: '16px' });
const inputStyle = (ui) => ({ width: '100%', border: 'none', background: 'transparent', fontSize: '16px', color: ui.text, outline: 'none' });
const completionModeButton = (ui, active) => ({
    border: '1px solid transparent',
    background: active ? ui.accentSoft : 'rgba(255,255,255,0.035)',
    color: active ? ui.accent : ui.text,
    borderRadius: '14px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer'
});

// --- ЛОГИКА (ОРИГИНАЛ) ---
const months = [['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'], ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];

const getCategory = (value) => {
    const map = { 'Здоровье': ['Здоровье', 'Health'], 'Health': ['Здоровье', 'Health'], 'Развитие': ["Развитие", "Growth"], 'Growth': ["Развитие", "Growth"], 'Продуктивность': ["Продуктивность", "Productivity"], 'Productivity': ["Продуктивность", "Productivity"], 'Отношения и отдых': ["Отношения и отдых", "Relationships & recreation"], 'Relationships & recreation': ["Отношения и отдых", "Relationships & recreation"], 'Отказ от вредного': ["Отказ от вредного", "Bad habits to quit"], 'Bad habits to quit': ["Отказ от вредного", "Bad habits to quit"] };
    if (map[value]) return map[value];

    const category = AppData.GetAllHabitCategories(0, true).find((cat) => cat.label?.includes(value));
    return category?.label || [value || 'Здоровье', value || 'Health'];
};

function needDaysInfo(lang, days, isNegative) {
    if (isNegative) return lang === 0 ? 'мне нужно ' + days + ' дней чтобы бросить' : 'i need ' + days + ' days to quit';
    return lang === 0 ? 'мне нужно ' + days + ' дней для формирования' : 'it takes ' + days + ' days to form';
}

const addHabit = async (habitId, habitName, isCustom, dateString, goals, isNegative, daysToForm, autoComplete = false) => {
    if (habitId == null || habitId < 0) {
        setShowPopUpPanel(AppData.prefs[0] === 0 ? 'выберите привычку' : 'choose a habit', 2500, false);
        return false;
    }
    if (AppData.IsHabitInChoosenList(habitId)) { setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list', 2500, false); return false; }
    if (typeof addHabitFn === 'function') {
        await addHabitFn(habitId, dateString, goals, isNegative, daysToForm, autoComplete);
    } else {
        await AppData.addHabit(habitId, dateString, goals, isNegative, daysToForm, autoComplete);
    }
    emitHabitsChanged();
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added', 2500, true);
    return true;
}

const createHabit = async (name, category, description, icon, dateString, goals, isNegative, daysToForm, autoComplete = false) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    await AppData.AddCustomHabit(name, category, description, icon, habitId);
    return addHabit(habitId, name, true, dateString, goals, isNegative, daysToForm, autoComplete);
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
