import React, { useState, useEffect } from 'react'
import { motion, useTransform, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import Icons from '../../StaticClasses/Icons';
import { allHabits } from '../../Classes/Habit.js'
import { AppData, getHabitPerformPercent, UserData } from '../../StaticClasses/AppData.js'
import { logSectionVisit } from '../../StaticClasses/AppData.js'
import { playEffects } from '../../StaticClasses/Effects.js'

// --- ИМПОРТЫ ---
import { expandedCard$, setExpandedCard } from '../../StaticClasses/HabitsBus.js';
import { theme$, lang$, fontSize$, premium$, confirmationPanel$, setShowPopUpPanel, setPage,setActiveTab, habitAccent$, habitsChanged$, habitsSelectedDate$, setHabitAccent } from '../../StaticClasses/HabitsBus'
import Colors from '../../StaticClasses/Colors'
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { HABITS_ACCENT as SHARED_HABITS_ACCENT, HABIT_ACCENT_PRESETS, buildHabitsAccent } from './HabitVisuals.jsx';

import { MdDone, MdClose } from 'react-icons/md'
import { FaPlus, FaTrash, FaPencilAlt, FaFire, FaChevronDown , FaClock, FaSlidersH, FaPalette } from 'react-icons/fa'
//new
import {FiCalendar, FiEdit3, FiTrash2, FiChevronUp} from 'react-icons/fi'
import {MdSkipNext} from 'react-icons/md'

import { FaCheck } from 'react-icons/fa6'
import { TbDotsVertical } from 'react-icons/tb'

//timer
import TimerIcon from '@mui/icons-material/TimerTwoTone';
import TimerOffIcon from '@mui/icons-material/TimerOffTwoTone';
import Slider from '@mui/material/Slider';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';

const dateKey = new Date().toISOString().split('T')[0];
const clickSound = new Audio('Audio/Click.wav');
const skipSound = new Audio('Audio/Skip.wav');
const isDoneSound = new Audio('Audio/IsDone.wav');
const NEGATIVE_CATEGORY = 'Отказ от вредного';
const HABITS_CATEGORY_COLLAPSE_KEY = 'uml_habits_category_collapsed_v1';
const HABITS_HERO_DETAILS_COLLAPSE_KEY = 'uml_habits_hero_details_collapsed_v1';
const DEFAULT_HABIT_CARD_WIDGETS = {
    days: true,
    skips: true,
    streak: true,
    timer: true,
    description: true,
    goals: true,
    achievements: true
};
const HABIT_CARD_WIDGET_OPTIONS = [
    { key: 'days', label: ['Дни', 'Days'], hint: ['сколько дней привычка есть в трекере', 'how many days the habit is tracked'] },
    { key: 'skips', label: ['Пропуски', 'Skips'], hint: ['сколько раз привычка была пропущена', 'how many times the habit was skipped'] },
    { key: 'streak', label: ['Серии', 'Streaks'], hint: ['текущая серия выполнений', 'current completion streak'] },
    { key: 'timer', label: ['Таймер', 'Timer'], hint: ['обратный таймер или время без срыва', 'countdown or time without relapse'] },
    { key: 'description', label: ['Описание', 'Description'], hint: ['текст с пояснением привычки', 'habit explanation text'] },
    { key: 'goals', label: ['Микроцели', 'Micro goals'], hint: ['список целей внутри карточки', 'goal list inside the card'] },
    { key: 'achievements', label: ['Достижения', 'Achievements'], hint: ['прогресс по этапам привычки', 'habit milestone progress'] }
];

function normalizeHabitCardWidgets(widgets = {}) {
    const statsFallback = widgets.stats;
    return {
        ...DEFAULT_HABIT_CARD_WIDGETS,
        days: widgets.days ?? statsFallback ?? DEFAULT_HABIT_CARD_WIDGETS.days,
        skips: widgets.skips ?? statsFallback ?? DEFAULT_HABIT_CARD_WIDGETS.skips,
        streak: widgets.streak ?? statsFallback ?? DEFAULT_HABIT_CARD_WIDGETS.streak,
        timer: widgets.timer ?? statsFallback ?? DEFAULT_HABIT_CARD_WIDGETS.timer,
        description: widgets.description ?? DEFAULT_HABIT_CARD_WIDGETS.description,
        goals: widgets.goals ?? DEFAULT_HABIT_CARD_WIDGETS.goals,
        achievements: widgets.achievements ?? DEFAULT_HABIT_CARD_WIDGETS.achievements
    };
}

export let removeHabitFn;
export let addHabitFn;
export let currentId;

function getStoredCollapsedCategories() {
    if (typeof window === 'undefined') return {};

    try {
        const raw = window.localStorage.getItem(HABITS_CATEGORY_COLLAPSE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function isCategoryCollapsed(categoryKey) {
    return Boolean(getStoredCollapsedCategories()[categoryKey]);
}

function setCategoryCollapsed(categoryKey, isCollapsed) {
    if (typeof window === 'undefined') return;

    const nextState = {
        ...getStoredCollapsedCategories(),
        [categoryKey]: isCollapsed,
    };

    window.localStorage.setItem(HABITS_CATEGORY_COLLAPSE_KEY, JSON.stringify(nextState));
}

function getHeroDetailsCollapsed() {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(HABITS_HERO_DETAILS_COLLAPSE_KEY) === 'true';
}

function setHeroDetailsCollapsed(isCollapsed) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(HABITS_HERO_DETAILS_COLLAPSE_KEY, isCollapsed ? 'true' : 'false');
}

function sortCategoriesWithNegativeLast(categories) {
    const normal = [];
    const negative = [];

    categories.forEach((category) => {
        if (category === NEGATIVE_CATEGORY) negative.push(category);
        else normal.push(category);
    });

    return [...normal, ...negative];
}

function getHabitCategoryKey(habit) {
    return Array.isArray(habit?.category) ? habit.category[0] : (habit?.category || 'Здоровье');
}

function isNegativeHabit(id, habit) {
    const habitIndex = AppData.choosenHabits.findIndex(habitId => Number(habitId) === Number(id));
    if (habitIndex !== -1 && typeof AppData.choosenHabitsTypes[habitIndex] === 'boolean') {
        return AppData.choosenHabitsTypes[habitIndex];
    }

    return getCategoryKey(habit) === NEGATIVE_CATEGORY;
}

function getHabitEffectiveCategoryKey(habit) {
    if (isNegativeHabit(habit?.id, habit)) return NEGATIVE_CATEGORY;

    const categoryKey = getHabitCategoryKey(habit);
    if (categoryKey !== NEGATIVE_CATEGORY) return categoryKey;

    const defaultHabit = allHabits.find(defaultItem => defaultItem.id === habit?.id);
    const defaultCategory = getHabitCategoryKey(defaultHabit);
    return defaultCategory !== NEGATIVE_CATEGORY ? defaultCategory : 'Здоровье';
}

const HABITS_ACCENT = SHARED_HABITS_ACCENT;

const mergeAccentPresets = (defaults, custom = []) => {
    const colors = [...defaults, ...(Array.isArray(custom) ? custom : [])]
        .map(color => buildHabitsAccent(color).hue);
    return colors.filter((color, index) => colors.indexOf(color) === index);
};
const HABITS_SUCCESS = {
    hue: '#22C55E',
    soft: 'rgba(34,197,94,0.14)',
    ring: 'rgba(34,197,94,0.26)',
    glow: 'rgba(34,197,94,0.16)'
};

const HABITS_CATEGORY_TONES = {
    'Здоровье': { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)', icon: 'health' },
    'Развитие': { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: 'growth' },
    'Продуктивность': { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: 'productivity' },
    'Отношения и отдых': { hue: '#D49A5C', soft: 'rgba(212,154,92,0.12)', ring: 'rgba(212,154,92,0.24)', icon: 'relationships' },
    'Отказ от вредного': { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)', icon: 'negative' }
};

const HabitIconBase = ({ children, size = 22, stroke = 1.65 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const HABIT_OUTLINE_ICONS = {
    water: ({ size }) => <HabitIconBase size={size}><path d="M12 3c-3.5 4-6 7-6 10.5a6 6 0 0 0 12 0c0-3.5-2.5-6.5-6-10.5Z" /><path d="M9 14a3 3 0 0 0 3 3" /></HabitIconBase>,
    sleep: ({ size }) => <HabitIconBase size={size}><path d="M21 13.5A9 9 0 0 1 10.5 3a7.5 7.5 0 1 0 10.5 10.5Z" /></HabitIconBase>,
    walk: ({ size }) => <HabitIconBase size={size}><circle cx="13" cy="4" r="1.6" /><path d="M9 21l2-5-2-3V8l3-2 3 3 2 2M9 13l-3 1M14 21l1-4" /></HabitIconBase>,
    run: ({ size }) => <HabitIconBase size={size}><circle cx="14" cy="4" r="1.6" /><path d="M5 12l4-2 2 3-2 3 4 5M11 13l3 2 4-1M16 8l3 1" /></HabitIconBase>,
    food: ({ size }) => <HabitIconBase size={size}><path d="M4 10h16M5 10v3a7 7 0 0 0 14 0v-3M9 4v4M12 3v5M15 4v4" /></HabitIconBase>,
    yoga: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="4.5" r="1.8" /><path d="M12 7v4M6 11l6-2 6 2M8 20l4-5 4 5M10 11l-1 4M14 11l1 4" /></HabitIconBase>,
    body: ({ size }) => <HabitIconBase size={size}><path d="M6 4h12l-2 6H8L6 4ZM8 10v10M16 10v10M10 14h4" /></HabitIconBase>,
    strength: ({ size }) => <HabitIconBase size={size}><path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" /></HabitIconBase>,
    meditate: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="6" r="2" /><path d="M5 20c2-4 4.5-5 7-5s5 1 7 5M9 13l3 2 3-2" /></HabitIconBase>,
    book: ({ size }) => <HabitIconBase size={size}><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2V5ZM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2V5Z" /></HabitIconBase>,
    lang: ({ size }) => <HabitIconBase size={size}><path d="M5 8h8M9 6v2M7 8c0 3 2 6 5 6M13 10c-1 2-4 4-8 4M13 20l3-8 3 8M14 18h4" /></HabitIconBase>,
    journal: ({ size }) => <HabitIconBase size={size}><path d="M6 3h10l3 3v15H6zM9 8h7M9 12h7M9 16h5" /></HabitIconBase>,
    skill: ({ size }) => <HabitIconBase size={size}><path d="M12 3l2.5 5 5.5.5-4 4 1 5.5L12 15l-5 3 1-5.5-4-4 5.5-.5Z" /></HabitIconBase>,
    plan: ({ size }) => <HabitIconBase size={size}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M9 14h6M9 17h4" /></HabitIconBase>,
    target: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></HabitIconBase>,
    timer: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2.5 1.5M9 3h6M19 5l1 1" /></HabitIconBase>,
    inbox: ({ size }) => <HabitIconBase size={size}><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5l-3-8H7Z" /><path d="M4 13h4l1 2h6l1-2h4" /></HabitIconBase>,
    people: ({ size }) => <HabitIconBase size={size}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M3 20c1-3 3-4.5 6-4.5s5 1.5 6 4.5M15 20c.5-2 1.8-3 3.5-3s2.5.6 3.5 3" /></HabitIconBase>,
    heart: ({ size }) => <HabitIconBase size={size}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /></HabitIconBase>,
    chat: ({ size }) => <HabitIconBase size={size}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.8-5.5A8 8 0 1 1 21 12Z" /></HabitIconBase>,
    hobby: ({ size }) => <HabitIconBase size={size}><path d="M7 3h10v4a5 5 0 0 1-10 0V3ZM9 12v3l-2 5h10l-2-5v-3" /></HabitIconBase>,
    creative: ({ size }) => <HabitIconBase size={size}><path d="M4 20l3-1 11-11-2-2L5 17l-1 3ZM15 7l2 2M11 20h9" /></HabitIconBase>,
    detox: ({ size }) => <HabitIconBase size={size}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h4M4 4l16 16" /></HabitIconBase>,
    sugar: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="13" r="6" /><path d="M12 7V3M8 3h8M9 13l3-3 3 3-3 3-3-3Z" /></HabitIconBase>,
    late: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2M4 4l16 16" /></HabitIconBase>,
    screen: ({ size }) => <HabitIconBase size={size}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M10 16v4M14 16v4M4 4l16 12" /></HabitIconBase>,
    smoke: ({ size }) => <HabitIconBase size={size}><rect x="3" y="14" width="18" height="4" rx="1" /><path d="M14 14v-3a3 3 0 0 0-3-3M18 11V9a2 2 0 0 0-2-2M4 4l16 16" /></HabitIconBase>,
    alcohol: ({ size }) => <HabitIconBase size={size}><path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3ZM12 13v8M8 21h8" /></HabitIconBase>,
    game: ({ size }) => <HabitIconBase size={size}><rect x="2" y="8" width="20" height="10" rx="4" /><path d="M7 13h3M8.5 11.5v3M15 12h.01M17 14h.01" /></HabitIconBase>,
    flame: ({ size }) => <HabitIconBase size={size}><path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-2-3-2-6-1 1-3 0-3-4Z" /></HabitIconBase>,
    check: ({ size }) => <HabitIconBase size={size}><path d="M5 12l5 5 9-10" /></HabitIconBase>,
};

const HABIT_ICON_ALIASES = {
    default: 'target',
    health: 'heart',
    growth: 'book',
    productivity: 'target',
    relationships: 'people',
    negative: 'detox',
    hydrationBottle: 'water',
    water: 'water',
    sleepBed: 'sleep',
    sleep: 'sleep',
    mobility: 'walk',
    exercise: 'walk',
    nutritionPlate: 'food',
    food: 'food',
    selfCare: 'body',
    dumbbell: 'strength',
    workout: 'strength',
    running: 'run',
    runningShoes: 'walk',
    stretch: 'yoga',
    breathPractice: 'meditate',
    meditation: 'meditate',
    reading: 'book',
    learning: 'skill',
    languagePractice: 'lang',
    english: 'lang',
    spanish: 'lang',
    german: 'lang',
    journaling: 'journal',
    reflectionMirror: 'timer',
    checklist: 'plan',
    priorityOne: 'target',
    focusTimer: 'timer',
    inboxTray: 'inbox',
    sunsetReview: 'plan',
    callMessage: 'chat',
    handHeart: 'heart',
    handshake: 'people',
    activeListen: 'chat',
    gratitude: 'heart',
    hobby: 'hobby',
    parkWalk: 'walk',
    mindfulness: 'meditate',
    creativeBrush: 'creative',
    unplug: 'screen',
    fastFood: 'sugar',
    lateNight: 'late',
    procrastinationClock: 'timer',
    mindlessScroll: 'screen',
    snackBowl: 'sugar',
    games: 'game',
    adultBlock: 'detox',
    cigarette: 'smoke',
    noSmoking: 'smoke',
    cocktail: 'alcohol',
    noAlcohol: 'alcohol',
    morningSun: 'walk',
    stepPrints: 'walk',
    posture: 'body',
    pill: 'body',
    medicinePatch: 'body',
    skinCare: 'body',
    darkRoom: 'sleep',
    sunriseAlarm: 'sleep',
    protein: 'food',
    broccoli: 'food',
    fruitBowl: 'food',
    stewPan: 'food',
    caffeineStop: 'detox',
    coreTraining: 'strength',
    cardioHeart: 'run',
    swimming: 'water',
    cycling: 'run',
    breathing: 'meditate',
    recoveryBattery: 'body',
    courseLesson: 'book',
    studyNotes: 'journal',
    repeatStudy: 'timer',
    writing: 'journal',
    speechPractice: 'chat',
    newWord: 'lang',
    code: 'skill',
    research: 'book',
    financeStudy: 'target',
    paint: 'creative',
    art: 'creative',
    music: 'hobby',
    photography: 'creative',
    target: 'target',
    weeklyReview: 'plan',
    gratitudeJournal: 'journal',
    portfolioCase: 'inbox',
    muteBell: 'detox',
    cleanDesk: 'plan',
    twoMinute: 'timer',
    singleWindow: 'screen',
    deepWork: 'target',
    weeklyPlan: 'plan',
    clipboard: 'plan',
    fileBox: 'inbox',
    dailyBudget: 'target',
    expenseTrack: 'journal',
    noShopping: 'detox',
    shirtReady: 'plan',
    packedBag: 'inbox',
    noteStack: 'journal',
    calendar2: 'plan',
    shutdown: 'sleep',
    backupCloud: 'inbox',
    zeroInbox: 'inbox',
    singleTab: 'screen',
    mealPrep: 'food',
    familyTime: 'people',
    friendMessage: 'chat',
    compliment: 'heart',
    homeHelp: 'people',
    cleaning: 'plan',
    laundry: 'plan',
    groceryList: 'plan',
    noMobile: 'screen',
    natureTime: 'walk',
    miniTrip: 'walk',
    boardGame: 'game',
    relaxMusic: 'hobby',
    sugarControl: 'sugar',
    sodaCut: 'sugar',
    energyDrink: 'detox',
    newsScroll: 'screen',
    socialLimit: 'screen',
    bedtimeDelay: 'late',
    selfTalk: 'detox',
    complainLess: 'detox',
    onTime: 'late',
};

function normalizeHabitIconKey(iconName, habitName = [], categoryKey = '') {
    const direct = HABIT_ICON_ALIASES[iconName] || HABIT_ICON_ALIASES[String(iconName || '').trim()];
    if (direct) return direct;

    const text = [iconName, ...(Array.isArray(habitName) ? habitName : [habitName])].join(' ').toLowerCase();
    if (/вод|water|swim|плав/.test(text)) return 'water';
    if (/сон|sleep|bed|night|ноч|подъем|wake/.test(text)) return 'sleep';
    if (/ход|walk|шаг|прогул/.test(text)) return 'walk';
    if (/бег|run|cardio|кардио/.test(text)) return 'run';
    if (/еда|пит|food|meal|овощ|фрукт|fast|sweet|слад|перекус|sugar/.test(text)) return /слад|sweet|sugar|fast|перекус/.test(text) ? 'sugar' : 'food';
    if (/йог|stretch|растяж|медит|дых|breath|mind/.test(text)) return /йог|stretch|растяж/.test(text) ? 'yoga' : 'meditate';
    if (/книг|read|book|курс|course|study|учеб|исслед/.test(text)) return 'book';
    if (/язык|lang|english|spanish|german|word/.test(text)) return 'lang';
    if (/днев|journal|note|замет|пис/.test(text)) return 'journal';
    if (/план|plan|calendar|checklist|обзор/.test(text)) return 'plan';
    if (/timer|таймер|focus|фокус|задач|goal|target/.test(text)) return 'target';
    if (/сем|friend|друг|общ|сообщ|call|chat|компли/.test(text)) return 'chat';
    if (/кур|smok|cigar/.test(text)) return 'smoke';
    if (/алко|alcohol|cocktail/.test(text)) return 'alcohol';
    if (/игр|game/.test(text)) return 'game';
    if (/экран|screen|scroll|social|mobile|phone/.test(text)) return 'screen';

    const categoryTone = getCategoryTone(categoryKey);
    return HABIT_ICON_ALIASES[categoryTone.icon] || 'target';
}

function HabitOutlineIcon({ iconName, habitName, categoryKey, size = 22 }) {
    const key = normalizeHabitIconKey(iconName, habitName, categoryKey);
    const Icon = HABIT_OUTLINE_ICONS[key] || HABIT_OUTLINE_ICONS.target;
    return <Icon size={size} />;
}

function getCategoryTone(categoryKey) {
    const canonical = getCategory(categoryKey)[0];
    return HABITS_CATEGORY_TONES[canonical] || HABITS_ACCENT;
}

function getCategoryIcon(categoryKey, theme) {
    const tone = getCategoryTone(categoryKey);
    const isNegativeCategory = getCategory(categoryKey)[0] === NEGATIVE_CATEGORY || tone.icon === 'negative';
    return <span style={{ color: isNegativeCategory ? tone.hue : HABITS_ACCENT.hue, display: 'flex' }}><HabitOutlineIcon iconName={tone.icon} categoryKey={categoryKey} size={16} /></span>;
}

function getDateKeyWithOffset(offset) {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date.toISOString().split('T')[0];
}

function getWeekdayLabel(offset, langIndex) {
    if (offset === 0) return langIndex === 0 ? 'СЕГ' : 'TODAY';
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const ru = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const en = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return (langIndex === 0 ? ru : en)[date.getDay()];
}

function getHabitStatus(id, targetDateKey = dateKey) {
    return AppData.habitsByDate?.[targetDateKey]?.[id] ?? 0;
}

function getTodayStatus(id) {
    return getHabitStatus(id, dateKey);
}

function buildHabitSummary(habitsCards, selectedDateKey = dateKey) {
    const total = habitsCards.length;
    const dayData = AppData.habitsByDate?.[selectedDateKey] || {};
    const done = habitsCards.filter(id => dayData[id] === 1 || (selectedDateKey === dateKey && AppData.isHabitAutoComplete(id))).length;
    const skipped = habitsCards.filter(id => dayData[id] < 0).length;
    const bestStreak = habitsCards.reduce((max, id) => Math.max(max, getDoneAmount(id)), 0);
    const avgFormation = total
        ? Math.round(habitsCards.reduce((sum, id) => sum + getHabitPerformPercent(id), 0) / total)
        : 0;

    return { total, done, skipped, pending: Math.max(total - done - skipped, 0), bestStreak, avgFormation };
}

function buildWeekSummary(habitsCards, langIndex) {
    return [-6, -5, -4, -3, -2, -1, 0].map(offset => {
        const key = getDateKeyWithOffset(offset);
        const dayData = AppData.habitsByDate?.[key] || {};
        const idsForDay = habitsCards.filter(id => Object.prototype.hasOwnProperty.call(dayData, id) || offset === 0);
        const total = idsForDay.length;
        const done = idsForDay.filter(id => dayData[id] === 1 || (offset === 0 && AppData.isHabitAutoComplete(id))).length;

        return {
            key,
            label: getWeekdayLabel(offset, langIndex),
            isToday: offset === 0,
            done,
            total,
            progress: total ? done / total : 0
        };
    });
}

function getSelectedDateLabel(selectedDateKey, langIndex) {
    if (selectedDateKey === dateKey) return langIndex === 0 ? 'сегодня' : 'today';
    const [year, month, day] = selectedDateKey.split('-').map(Number);
    const monthNames = [
        ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    ];
    return `${day} ${monthNames[langIndex][month - 1]} ${year !== new Date().getFullYear() ? year : ''}`.trim();
}

// --- СТИЛИ (ОРИГИНАЛЬНЫЕ + УЛУЧШЕННЫЕ ТЕНИ) ---
const styles = (theme, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight
        ? `radial-gradient(640px 420px at 86% -8%, rgba(${HABITS_ACCENT.rgb},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${HABITS_ACCENT.rgb},0.1), transparent 66%), #F4F5F7`
        : `radial-gradient(640px 420px at 86% -8%, rgba(${HABITS_ACCENT.rgb},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${HABITS_ACCENT.rgb},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`;
    const modalBg = isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.82), rgba(${HABITS_ACCENT.rgb},0.09), rgba(255,255,255,0.54))`
        : `linear-gradient(145deg, rgba(34,43,52,0.74), rgba(${HABITS_ACCENT.rgb},0.08) 48%, rgba(12,17,21,0.72))`;
    const borderColor = isLight ? '1px solid rgba(15,23,42,0.1)' : `1px solid rgba(190,220,235,0.16)`;
    
    // --- УЛУЧШЕННЫЕ ТЕНИ ДЛЯ МОДАЛОК (Многослойные, мягкие) ---
    const shadow = isLight 
        ? '0 26px 54px -22px rgba(15,23,42,0.22), 0 1px 0 rgba(255,255,255,0.8) inset'
        : '0 34px 72px -30px rgba(0,0,0,0.78), 0 1px 0 rgba(255,255,255,0.07) inset';

    return {
        container: {
            width: '100vw',
            height: '100vh',
            marginTop: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "center",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: bg,
            transition: 'background-color 0.3s ease',
            overflow: 'hidden'
        },
        scrollView: {
            width: "100%",
            height: '100%',
            padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 0 calc(104px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box',
            overflowY: "auto",
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            overflowAnchor: 'none',
            overscrollBehavior: 'contain',
            scrollPaddingTop: '16px',
            marginTop: 0,
            display: 'flex',
            flexDirection: 'column',
        },
        cP: {
            display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: "center",
            borderRadius: "32px",
            border: borderColor,
            background: modalBg,
            boxShadow: shadow,
	            width: "90%",
	            maxWidth: '380px',
	            maxHeight: 'calc(100dvh - 48px)',
	            overflowY: 'auto',
	            padding: '25px',
            gap: '20px',
            backdropFilter: 'blur(26px) saturate(155%)',
            WebkitBackdropFilter: 'blur(26px) saturate(155%)'
        },
        confirmContainer: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isLight ? 'rgba(15,23,42,0.18)' : 'rgba(0,0,0,0.52)',
            backdropFilter: 'blur(16px) saturate(135%)',
            WebkitBackdropFilter: 'blur(16px) saturate(135%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px',
        },
        selectPanel: {
            background: modalBg,
            borderRadius: '28px',
            border: borderColor,
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexWrap: 'wrap', width: '85vw', maxHeight: '50vh', overflowY: 'auto', padding: '20px', gap: '10px', justifyContent: 'center', zIndex: 6000,
            boxShadow: shadow,
            backdropFilter: 'blur(26px) saturate(155%)',
            WebkitBackdropFilter: 'blur(26px) saturate(155%)'
        },
        mainText: { fontSize: "17px", fontWeight: '600', color: Colors.get('mainText', theme), textAlign: 'center', marginBottom: '10px' },
        subText: { textAlign: "center", fontSize: "14px", color: Colors.get('subText', theme), marginBottom: '5px' },
        buttonsRow: { width: '100%', display: 'flex', flexDirection: 'row', gap: '15px', marginTop: '10px' },
        btnCancel: {
            flex: 1, padding: '14px', borderRadius: '20px', cursor: 'pointer',
            border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(255,255,255,0.08)',
            background: isLight ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.08)',
            color: Colors.get('mainText', theme),
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '700', fontSize: '15px',
            boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.78) inset' : '0 1px 0 rgba(255,255,255,0.055) inset',
            backdropFilter: 'blur(18px) saturate(145%)',
            WebkitBackdropFilter: 'blur(18px) saturate(145%)'
        },
        btnSave: {
            flex: 1, padding: '14px', borderRadius: '20px', cursor: 'pointer',
            border: `1px solid rgba(${HABITS_ACCENT.rgb},0.28)`,
            background: `linear-gradient(145deg, rgba(${HABITS_ACCENT.rgb},0.86), ${HABITS_ACCENT.hue})`,
            color: '#FFF',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', fontSize: '15px',
            boxShadow: `0 14px 28px -20px rgba(${HABITS_ACCENT.rgb},0.72), 0 1px 0 rgba(255,255,255,0.18) inset`
        },
        goalInput: {
            flex: 1,
            border: isLight ? '1px solid rgba(15,23,42,0.1)' : '1px solid rgba(190,220,235,0.16)',
            background: isLight ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.055)',
            fontSize: '16px',
            color: Colors.get('mainText', theme),
            outline: 'none',
            borderRadius: '20px',
            padding: '14px 16px',
            boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.8) inset' : '0 1px 0 rgba(255,255,255,0.055) inset',
            backdropFilter: 'blur(18px) saturate(145%)',
            WebkitBackdropFilter: 'blur(18px) saturate(145%)',
            boxSizing: 'border-box'
        },
        widgetSettingsBtn: {
            width: '95%',
            minHeight: '44px',
            margin: '0 auto 10px auto',
            borderRadius: '14px',
            border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(159,180,196,0.2)',
            background: isLight
                ? `linear-gradient(135deg, rgba(255,255,255,0.94), rgba(${HABITS_ACCENT.rgb},0.08))`
                : 'linear-gradient(135deg, rgba(175,196,212,0.12), rgba(92,108,122,0.075))',
            color: Colors.get('mainText', theme),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '9px',
            fontWeight: '800',
            fontSize: fSize === 0 ? '13px' : '15px',
            cursor: 'pointer',
            boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        pageHeader: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '0 auto 8px',
            padding: '4px 0 8px',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: '96px minmax(0, 1fr) 96px',
            alignItems: 'center',
            gap: 12
        },
        pageHeaderSpacer: { width: 96, height: 38 },
        pageHeaderBrand: { minWidth: 0, textAlign: 'center' },
        headerAccentButton: {
            minWidth: 0,
            height: 38,
            borderRadius: 999,
            border: `1px solid ${HABITS_ACCENT.ring}`,
            background: HABITS_ACCENT.soft,
            color: HABITS_ACCENT.hue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifySelf: 'end',
            gap: 6,
            fontSize: 12,
            fontWeight: 900,
            fontFamily: 'inherit',
            padding: '0 11px',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
        },
        actionColorDot: {
            width: 8,
            height: 8,
            borderRadius: 99,
            background: HABITS_ACCENT.hue,
            boxShadow: `0 0 12px ${HABITS_ACCENT.glow}`,
            flexShrink: 0
        },
        eyebrow: {
            fontSize: 11,
            color: Colors.get('subText', theme),
            fontWeight: 850,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
        },
        pageTitle: {
            color: Colors.get('mainText', theme),
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: fSize === 0 ? 21 : 24,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1.05,
            opacity: 0.86
        },
        pageSubtitle: {
            marginTop: 5,
            color: Colors.get('subText', theme),
            fontSize: fSize === 0 ? 8 : 9,
            fontWeight: 600,
            letterSpacing: '0.14em',
            opacity: 0.82
        },
        categoriesWrap: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '20px auto 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            boxSizing: 'border-box'
        },
        icon: { color: Colors.get('icons', theme), fontSize: '24px' }
    }
}

const getCategory = (value) => {
    const map = {
        'Здоровье': ['Здоровье', 'Health'],
        'Health': ['Здоровье', 'Health'],
        'Развитие': ["Развитие", "Growth"],
        'Growth': ["Развитие", "Growth"],
        'Продуктивность': ["Продуктивность", "Productivity"],
        'Productivity': ["Продуктивность", "Productivity"],
        'Отношения и отдых': ["Отношения и отдых", "Relationships & recreation"],
        'Relationships & recreation': ["Отношения и отдых", "Relationships & recreation"],
        'Отказ от вредного': ["Отказ от вредного", "Bad habits to quit"],
        'Bad habits to quit': ["Отказ от вредного", "Bad habits to quit"]
    };
    return map[value] || ['Здоровье', 'Health'];
};

const HabitsMain = () => {
    const [theme, setthemeState] = React.useState('dark');
    const [habitsCards, setHabitsCards] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFontSize] = useState(0);
    const [hasHabits, setHasHabits] = useState(AppData.choosenHabits.length > 0);
    const [currentId, setCurrentId] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);
    const [showWidgetSettings, setShowWidgetSettings] = useState(false);
    const [habitCardWidgets, setHabitCardWidgets] = useState(normalizeHabitCardWidgets(AppData.habitCardWidgets));
    const [selectedDateKey, setSelectedDateKey] = useState(dateKey);
    const scrollViewRef = React.useRef(null);

    const [cP, setCP] = useState({ show: false, type: -1, hId: 0, gId: 0, setGoals: null, hInfo: null })
    const [newGoal, setNewGoal] = useState('');
    const [newName, setNewName] = useState('');
    const [newDescr, setNewDescr] = useState('');
    const [newIcon, setNewIcon] = useState('');
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [newCategory, setNewCategory] = useState('Здоровье');

    const [habitTodelete, setHabitToDelete] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [needConfirmation, setNeedConfirmation] = useState(false);

    useEffect(() => {
        if (cP.type === 0) {
            setNewName(getAllHabits().find(h => h.id === cP.hId)?.name[langIndex] || '');
            setNewDescr(getAllHabits().find(h => h.id === cP.hId)?.description[langIndex] || '');
            setNewIcon(getAllHabits().find(h => h.id === cP.hId)?.iconName || '');
            setNewCategory(getAllHabits().find(h => h.id === cP.hId)?.category[0] || 'Здоровье');
        }
        if (cP.type === 4) {
            if (cP.gId <= 0) return;
            cP.setGoals(prev => {
                const newGoals = [...prev];
                [newGoals[cP.gId - 1], newGoals[cP.gId]] = [newGoals[cP.gId], newGoals[cP.gId - 1]];
                AppData.choosenHabitsGoals[cP.hId] = newGoals;
                return newGoals;
            });
        }
        else if (cP.type === 5) {
            cP.setGoals(prev => {
                if (cP.gId >= prev.length - 1) return prev;
                const newGoals = [...prev];
                [newGoals[cP.gId], newGoals[cP.gId + 1]] = [newGoals[cP.gId + 1], newGoals[cP.gId]];
                AppData.choosenHabitsGoals[cP.hId] = newGoals;
                return newGoals;
            });
        }
    }, [cP]);

    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
        const subscription2 = fontSize$.subscribe(setFontSize);
        const subscription3 = confirmationPanel$.subscribe(setNeedConfirmation);
        return () => { subscription.unsubscribe(); subscription2.unsubscribe(); subscription3.unsubscribe(); };
    }, []);

    useEffect(() => { logSectionVisit('habits'); }, []);

    useEffect(() => {
        const subscription = lang$.subscribe((lang) => { setLangIndex(lang === 'ru' ? 0 : 1); });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const subscription = habitAccent$.subscribe(() => setDataVersion(v => v + 1));
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const subscription = habitsSelectedDate$.subscribe((nextDateKey) => {
            if (typeof nextDateKey === 'string' && nextDateKey) {
                setSelectedDateKey(nextDateKey);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const normalized = buildHabitsAccent(AppData.habitAccentColor || '#22C55E').hue;
        if (AppData.habitAccentColor !== normalized) {
            AppData.habitAccentColor = setHabitAccent(normalized).hue;
        }
    }, []);

    const syncHabitsCards = () => {
        const nextHabits = [...(AppData.choosenHabits || [])];
        setHabitsCards(nextHabits);
        setHasHabits(nextHabits.length > 0);
        setDataVersion(v => v + 1);
    };

    useEffect(() => {
        syncHabitsCards();
        const subscription = habitsChanged$.subscribe(syncHabitsCards);
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (habitsCards.length > 0) {
            const cats = new Set();
            habitsCards.forEach(id => {
                const h = getAllHabits().find(h => h.id === id);
                const categoryKey = getHabitEffectiveCategoryKey(h);
                if (h && !cats.has(categoryKey)) { cats.add(categoryKey); }
            });
            setCategories(sortCategoriesWithNegativeLast(Array.from(cats)));
        }
    }, [habitsCards]);

    const addHabit = async (id, dateString, goals, isNegative, daysToForm, autoComplete = false) => {
        const addedHabit = getAllHabits().find(h => h.id === id);
        const addedCategory = addedHabit?.category?.[0];

        if (!AppData.IsHabitInChoosenList(id)) {
            await AppData.addHabit(id, dateString, goals, isNegative, daysToForm, autoComplete);
        }

        setHabitsCards([...(AppData.choosenHabits || [])]);

        if (addedCategory) {
            setCategoryCollapsed(addedCategory, false);
        }

        setHasHabits(true);
        setDataVersion(v => v + 1);
    };

    const removeHabit = (id) => {
  if (habitsCards.includes(id)) {
    AppData.removeHabit(id);
    setHabitsCards(prev => prev.filter(habitId => habitId !== id)); // ✅ Fixed filter
    setDataVersion(v => v + 1); // ✅ Force rebuild of buildMenu
    setHasHabits(AppData.choosenHabits.length > 0);

    const habitObj = getAllHabits().find(h => h.id === id);
    const name = (habitObj?.name?.[langIndex]) || (langIndex === 0 ? "Привычка" : "Habit");
    const popUpText = langIndex === 0 ? `Привычка: '${name}' удалена` : `Habit: '${name}' deleted`;
    setShowPopUpPanel(popUpText, 2000, true);
  }
};

    const onConfirmAction = async () => {
        switch (cP.type) {
            case 0:
            // Ensure array exists
            if (!AppData.CustomHabits) AppData.CustomHabits = [];
            
            const index = AppData.CustomHabits.findIndex(h => h.id === cP.hId);
            const categoryArray = getCategory(newCategory); // Get ['Ru', 'En']

            if (index !== -1) {
                // Scenario A: Updating an existing Custom Habit
                AppData.CustomHabits = AppData.CustomHabits.map((habit, i) =>
                    i === index ? { 
                        ...habit, 
                        name: [newName.trim(), newName.trim()], 
                        description: [newDescr.trim(), newDescr.trim()], 
                        iconName: newIcon,
                        category: categoryArray // <--- UPDATE CATEGORY
                    } : habit
                );
            } else {
                // Scenario B: Editing a Standard Habit (Create an override)
                const originalHabit = allHabits.find(h => h.id === cP.hId);
                if (originalHabit) {
                    const newHabitOverride = {
                        ...originalHabit,
                        name: [newName.trim(), newName.trim()],
                        description: [newDescr.trim(), newDescr.trim()],
                        iconName: newIcon,
                        category: categoryArray, // <--- UPDATE CATEGORY
                        isCustom: true 
                    };
                    AppData.CustomHabits = [...AppData.CustomHabits, newHabitOverride];
                }
            }

            setHabitsCards(prev => [...prev]); 
            setCP(prev => ({ ...prev, show: false }));
            
            // Update the UI immediately
            if (cP.hInfo) cP.hInfo({ 
                name: [newName, newName], 
                descr: [newDescr, newDescr], 
                icon: newIcon,
                // Optional: update local card category if needed, though HabitsMain refresh handles it
            });
            
	            setDataVersion(v => v + 1);
	            await saveData();
	            break;
            case 1:
                if (newGoal.length > 0) {
                    cP.setGoals(prev => [...prev, { text: newGoal, isDone: false }]);
	                    await AppData.addHabitGoal(cP.hId, { text: newGoal, isDone: false });
                    setCP(prev => ({ ...prev, show: false }));
                } else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
                break;
            case 2:
                if (newGoal.length > 0) {
                    cP.setGoals(prev => prev.map((goal, idx) => idx === cP.gId ? { ...goal, text: newGoal.trim() } : goal));
	                    AppData.choosenHabitsGoals[cP.hId][cP.gId].text = newGoal;
	                    await saveData();
	                    setCP(prev => ({ ...prev, show: false }));
                } else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
                break;
            case 3:
	                cP.setGoals(prev => prev.filter((_, i) => i !== cP.gId));
	                AppData.choosenHabitsGoals[cP.hId].splice(cP.gId, 1);
	                await saveData();
	                setCP(prev => ({ ...prev, show: false }));
                break;
        }
    };

    removeHabitFn = removeHabit;
    addHabitFn = addHabit;

    const toggleHabitWidget = async (key) => {
        const next = normalizeHabitCardWidgets({
            ...habitCardWidgets,
            [key]: !habitCardWidgets[key]
        });
        setHabitCardWidgets(next);
        AppData.habitCardWidgets = next;
        await saveData();
    };

    const changeHabitAccentColor = async (color) => {
        await AppData.setHabitAccentColor(color);
        setDataVersion(v => v + 1);
    };

    const saveHabitAccentPreset = async () => {
        await AppData.addAccentPreset('habits', AppData.habitAccentColor, HABIT_ACCENT_PRESETS);
        setDataVersion(v => v + 1);
    };

    const settleTopAfterCategoryToggle = React.useCallback(() => {
        const settle = (smooth = true) => {
            const scrollView = scrollViewRef.current;
            if (!scrollView) return;

            if (scrollView.scrollTop > 0 && scrollView.scrollTop < 340) {
                scrollView.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
            }
        };

        requestAnimationFrame(() => settle(false));
        window.setTimeout(() => settle(true), 260);
    }, []);

    const isLight = theme === 'light' || theme === 'speciallight';

    return (
        <div style={styles(theme).container}>
            {<HoverInfoButton tab='HabitsMain'/>}
            <HabitWidgetSettingsModal
                isOpen={showWidgetSettings}
                onClose={() => setShowWidgetSettings(false)}
                values={habitCardWidgets}
                onToggle={toggleHabitWidget}
                accentColor={AppData.habitAccentColor}
                onAccentChange={changeHabitAccentColor}
                customPresets={AppData.habitAccentPresets}
                onSavePreset={saveHabitAccentPreset}
                theme={theme}
                langIndex={langIndex}
            />
            {needConfirmation && <div style={styles(theme).confirmContainer}>
                <div style={styles(theme).cP}>
                    <div style={styles(theme, fSize).mainText}>{confirmMessage}</div>
                    <div style={styles(theme).buttonsRow}>
                        <button style={styles(theme).btnCancel} onClick={() => setNeedConfirmation(false)}>
                            <MdClose size={20} style={{marginRight: 5}}/> {langIndex === 0 ? 'Нет' : 'No'}
                        </button>
                        <button style={{...styles(theme).btnSave, background: 'linear-gradient(145deg, rgba(255,69,58,0.86), #FF453A)', border: '1px solid rgba(255,69,58,0.34)'}} onClick={() => { removeHabit(habitTodelete); setNeedConfirmation(false) }}>
                            <MdDone size={20} style={{marginRight: 5}}/> {langIndex === 0 ? 'Да' : 'Yes'}
                        </button>
                    </div>
                </div>
            </div>}
            {!hasHabits && (
                <div ref={scrollViewRef} className="habitsMainScroll" style={styles(theme).scrollView}>
                    <HabitsPageHeader
                        theme={theme}
                        fSize={fSize}
                        langIndex={langIndex}
                        onAccentClick={() => setShowWidgetSettings(true)}
                    />
                    <HabitsEmptyState theme={theme} langIndex={langIndex} fSize={fSize} />
                </div>
            )}
            
            {hasHabits && <div ref={scrollViewRef} className="habitsMainScroll" style={styles(theme).scrollView}>
                <HabitsPageHeader
                    theme={theme}
                    fSize={fSize}
                    langIndex={langIndex}
                    onAccentClick={() => setShowWidgetSettings(true)}
                />
                <HabitsHero theme={theme} langIndex={langIndex} habitsCards={habitsCards} fSize={fSize} selectedDateKey={selectedDateKey} onOpenWidgets={() => setShowWidgetSettings(true)} />
                <div style={styles(theme).categoriesWrap}>
                    {buildMenu({
                        theme,
                        habitsCards,
                        categories,
                        selectedDateKey,
                        setCP,
                        setCurrentId,
                        fSize,
                        setNeedConfirmation,
                        setConfirmMessage,
                        setHabitToDelete,
                        habitCardWidgets,
                        langIndex,
                        onStatusChange: () => setDataVersion(v => v + 1),
                        onCategoryToggle: settleTopAfterCategoryToggle
                    })}
                </div>
            </div>}

            {cP.show && (
                <div style={styles(theme).confirmContainer}>
                    <div style={{...styles(theme).cP, width: '90%'}}>
                        <div style={styles(theme).mainText}>
                            {cP.type === 1 && (langIndex === 0 ? 'Новая цель' : 'New goal')}
                            {cP.type === 2 && (langIndex === 0 ? 'Изменить цель' : 'Edit goal')}
                            {cP.type === 3 && (langIndex === 0 ? 'Удалить цель?' : 'Delete goal?')}
                            {cP.type === 0 && (langIndex === 0 ? 'Настройки привычки' : 'Edit habit')}
                        </div>

                        {cP.type === 1 &&
                       <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                         <input 
                                type="text" 
                                placeholder={langIndex === 0 ? 'Название цели...' : 'Goal title...'}
                                value={newGoal}
                                 onChange={(e) => setNewGoal(e.target.value)}
                                style={styles(theme).goalInput}
                                />
                                </div>
                         }
                        {cP.type === 2 &&
                        <div style={{width: '100%', display: 'flex', flexDirection: 'column', marginBottom: 12}}>
                         <input 
                                type="text" 
                                placeholder={langIndex === 0 ? 'Название цели...' : 'Goal title...'}
                                value={newGoal}
                                 onChange={(e) => setNewGoal(e.target.value)}
                                style={styles(theme).goalInput}
                                />
                                </div>
                         }
                        
                        {cP.type === 0 && (
                            <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: 14}}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    padding: 12,
                                    borderRadius: 18,
                                    background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
                                    border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)'}`
                                }}>
                                    <button
                                        type="button"
                                        onClick={() => setSelectIconPanel(!selectIconPanel)}
                                        style={{
                                            width: 54,
                                            height: 54,
                                            borderRadius: 18,
                                            border: `1px solid ${HABITS_ACCENT.ring}`,
                                            background: HABITS_ACCENT.soft,
                                            color: HABITS_ACCENT.hue,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: 0,
                                            flexShrink: 0
                                        }}
                                    >
                                        <HabitOutlineIcon iconName={newIcon} categoryKey={newCategory} size={28} />
                                    </button>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: Colors.get('mainText', theme), fontSize: 14, fontWeight: 900 }}>
                                            {langIndex === 0 ? 'Вид и смысл привычки' : 'Habit identity'}
                                        </div>
                                        <div style={{ color: Colors.get('subText', theme), fontSize: 12, fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>
                                            {langIndex === 0 ? 'Иконка, категория, название и описание сохраняются для этой привычки.' : 'Icon, category, name and description are saved for this habit.'}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {AppData.GetAllHabitCategories(langIndex).map((cat, idx) => {
                                        const active = newCategory === cat.label[0];
                                        return (
                                            <button
                                                type="button"
                                                key={idx}
                                                onClick={() => setNewCategory(cat.label[0])}
                                                style={{
                                                    minHeight: 34,
                                                    padding: '0 12px',
                                                    borderRadius: 999,
                                                    cursor: 'pointer',
                                                    border: `1px solid ${active ? HABITS_ACCENT.ring : (isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.075)')}`,
                                                    background: active ? HABITS_ACCENT.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)'),
                                                    color: active ? HABITS_ACCENT.hue : Colors.get('subText', theme),
                                                    fontSize: 12,
                                                    fontWeight: 850,
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 6,
                                                    fontFamily: 'inherit'
                                                }}
                                            >
                                                <HabitOutlineIcon iconName={cat.key || cat.icon} categoryKey={cat.label[0]} size={13} />
                                                {cat.label[langIndex]}
                                            </button>
                                        );
                                    })}
                                </div>

                                <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    <span style={{ color: Colors.get('subText', theme), fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {langIndex === 0 ? 'Название' : 'Name'}
                                    </span>
                                    <input
                                        type="text"
                                        placeholder={langIndex === 0 ? 'Название' : 'Name'}
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        style={{
                                            border: `1px solid ${HABITS_ACCENT.ring}`,
                                            background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.04)',
                                            fontSize: 16,
                                            color: Colors.get('mainText', theme),
                                            outline: 'none',
                                            borderRadius: 16,
                                            padding: '13px 14px',
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </label>

                                <label style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                    <span style={{ color: Colors.get('subText', theme), fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {langIndex === 0 ? 'Описание' : 'Description'}
                                    </span>
                                    <textarea
                                        rows={3}
                                        placeholder={langIndex === 0 ? 'Описание привычки' : 'Habit description'}
                                        value={newDescr}
                                        onChange={(e) => setNewDescr(e.target.value)}
                                        style={{
                                            resize: 'none',
                                            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`,
                                            background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.04)',
                                            fontSize: 15,
                                            color: Colors.get('mainText', theme),
                                            outline: 'none',
                                            borderRadius: 16,
                                            padding: '13px 14px',
                                            lineHeight: 1.35,
                                            fontFamily: 'inherit',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </label>

                                <div style={{
                                    padding: 12,
                                    borderRadius: 18,
                                    border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)'}`,
                                    background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                        <div style={{ color: Colors.get('mainText', theme), fontSize: 14, fontWeight: 900 }}>
                                            {langIndex === 0 ? 'Цели' : 'Goals'}
                                        </div>
                                        <div style={{ color: HABITS_ACCENT.hue, fontSize: 12, fontWeight: 900 }}>
                                            {(AppData.choosenHabitsGoals[cP.hId] || []).length}
                                        </div>
                                    </div>
                                    <div style={{ color: Colors.get('subText', theme), fontSize: 12, fontWeight: 700, marginTop: 6, lineHeight: 1.35 }}>
                                        {langIndex === 0 ? 'Цели можно быстро менять в раскрытой карточке привычки.' : 'Goals can be changed from the expanded habit card.'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={styles(theme).buttonsRow}>
                            <button style={styles(theme).btnCancel} onClick={() => setCP(prev => ({ ...prev, show: false }))}>
                                <MdClose size={22} style={{marginRight: '6px'}}/> {langIndex === 0 ? 'Отмена' : 'Cancel'}
                            </button>
	                            <button style={{
                                    ...styles(theme).btnSave,
                                    background: cP.type === 3 ? 'linear-gradient(145deg, rgba(216,92,92,0.82), #D95C5C)' : `linear-gradient(145deg, rgba(${HABITS_ACCENT.rgb},0.86), ${HABITS_ACCENT.hue})`,
                                    border: cP.type === 3 ? '1px solid rgba(216,92,92,0.34)' : `1px solid rgba(${HABITS_ACCENT.rgb},0.32)`
                                }} onClick={() => { onConfirmAction(); }}>
                                <MdDone size={22} style={{marginRight: '6px'}}/> {cP.type === 3 ? (langIndex === 0 ? 'Удалить' : 'Delete') : (langIndex === 0 ? 'Готово' : 'Save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectIconPanel && (
                <div style={styles(theme).confirmContainer} onClick={() => setSelectIconPanel(false)}>
                    <div style={{...styles(theme).selectPanel}} onClick={e => e.stopPropagation()}>
                        <div style={{width: '100%', textAlign:'center', marginBottom: '10px', color: Colors.get('subText', theme), fontSize: '13px', fontWeight:'600'}}>
                            {langIndex===0?'ВЫБЕРИТЕ ИКОНКУ':'SELECT ICON'}
                        </div>
                        {Object.entries(Icons.ic).map(([key]) => (
                            <div key={key} style={{ padding: '12px', borderRadius: '12px', backgroundColor: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.05)', cursor:'pointer' }}
                                onClick={() => { setNewIcon(key); setSelectIconPanel(false); }}>
                                <div style={{ color: Colors.get('habitIcon', theme), display: 'flex' }}>
                                    <HabitOutlineIcon iconName={key} categoryKey={newCategory} size={30} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <style>{`
                .habitsMainScroll::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }
            `}</style>
        </div>
    )
}

export default HabitsMain

function getAllHabits() {
    const custom = AppData.CustomHabits || [];
    // Prioritize Custom Habits: Return Custom + Standard habits that don't have a custom override
    return custom.concat(
        allHabits.filter(h => !custom.some(ch => ch.id === h.id))
    );
}

function HabitsPageHeader({ theme, fSize, langIndex, onAccentClick }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32 }}
            style={styles(theme, fSize).pageHeader}
        >
            <div style={styles(theme, fSize).pageHeaderSpacer} />
            <div style={styles(theme, fSize).pageHeaderBrand}>
                <div style={styles(theme, fSize).pageTitle}>UltyMyLife</div>
                <div style={styles(theme, fSize).pageSubtitle}>
                    {langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}
                </div>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onAccentClick} style={styles(theme, fSize).headerAccentButton}>
                <FaPalette size={12} />
                <span>{langIndex === 0 ? 'Акцент' : 'Accent'}</span>
                <span style={styles(theme, fSize).actionColorDot} />
            </motion.button>
        </motion.div>
    );
}

function HabitsHero({ theme, langIndex, habitsCards, fSize, selectedDateKey = dateKey, onOpenWidgets }) {
    const [detailsCollapsed, setDetailsCollapsed] = useState(getHeroDetailsCollapsed);
    const isLight = theme === 'light' || theme === 'speciallight';
    const summary = buildHabitSummary(habitsCards, selectedDateKey);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const progress = summary.total ? summary.done / summary.total : 0;
    const heroDateLabel = getSelectedDateLabel(selectedDateKey, langIndex).toUpperCase();
    const toggleDetails = () => {
        const nextValue = !detailsCollapsed;
        setDetailsCollapsed(nextValue);
        setHeroDetailsCollapsed(nextValue);
        playEffects(clickSound);
    };
    const heroBackground = isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.70) 0%, rgba(${HABITS_ACCENT.rgb},0.10) 58%, rgba(255,255,255,0.36) 100%)`
        : `linear-gradient(145deg, rgba(23,27,31,0.68) 0%, rgba(${HABITS_ACCENT.rgb},0.11) 54%, rgba(255,255,255,0.025) 100%)`;
    const heroBorder = `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.13)'}`;
    const heroShadow = isLight
        ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
        : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)';

    const stat = (label, value, tone = HABITS_ACCENT, wide = false) => (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            width: '100%',
            minWidth: 0,
            minHeight: wide ? 34 : 32,
            borderRadius: 12,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.105)'}`,
            background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.038)',
            padding: '0 10px',
            boxSizing: 'border-box',
            overflow: 'hidden',
            gridColumn: wide ? '1 / -1' : 'auto'
        }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: sub, fontSize: 10.5, fontWeight: 850, minWidth: 0, flex: 1 }}>
                <span style={{ width: 5, height: 5, borderRadius: 99, background: tone.hue, flexShrink: 0 }} />
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
            </span>
            <span style={{ color: text, fontSize: 12, fontWeight: 950, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{value}</span>
        </div>
    );

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            style={{
                width: 'calc(100% - 56px)',
                maxWidth: 660,
                margin: '0 auto',
                borderRadius: 24,
                boxSizing: 'border-box',
                position: 'relative',
                overflow: 'visible',
                isolation: 'isolate'
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 24,
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 0,
                background: heroBackground,
                border: heroBorder,
                boxShadow: heroShadow,
                backdropFilter: 'blur(26px) saturate(170%)',
                WebkitBackdropFilter: 'blur(26px) saturate(170%)',
                boxSizing: 'border-box'
            }}>
                <div style={{
                    position: 'absolute',
                    right: -44,
                    top: -58,
                    width: 170,
                    height: 170,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, rgba(${HABITS_ACCENT.rgb},0.12) 0%, transparent 64%)`
                }} />
            </div>
            <div style={{
                position: 'relative',
                zIndex: 1,
                minHeight: detailsCollapsed ? (fSize === 0 ? 82 : 88) : (fSize === 0 ? 218 : 230),
                padding: detailsCollapsed ? '14px 16px' : '14px 16px 28px',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                transition: 'min-height 0.24s ease, padding 0.24s ease'
            }}>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: detailsCollapsed ? 0 : 12, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ color: sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
                        {heroDateLabel}
                    </div>
                    <div style={{ color: text, fontSize: fSize === 0 ? 20 : 22, fontWeight: 950, lineHeight: 1.08, marginTop: 4 }}>
                        {langIndex === 0 ? 'Привычки' : 'Habits'}
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={onOpenWidgets}
                        style={{
                            minHeight: 38,
                            borderRadius: 15,
                            border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(159,180,196,0.18)',
                            background: isLight ? 'rgba(255,255,255,0.64)' : 'rgba(175,196,212,0.095)',
                            color: Colors.get('subText', theme),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 7,
                            padding: '0 11px',
                            fontFamily: 'inherit',
                            fontSize: 11,
                            fontWeight: 900,
                            flexShrink: 0,
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.045) inset'
                        }}
                    >
                        <FaSlidersH size={12} />
                        <span>{langIndex === 0 ? 'Виджеты' : 'Widgets'}</span>
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.94 }}
                        onClick={toggleDetails}
                        aria-label={detailsCollapsed ? (langIndex === 0 ? 'Раскрыть блок' : 'Expand block') : (langIndex === 0 ? 'Свернуть блок' : 'Collapse block')}
                        style={{
                            width: 38,
                            height: 38,
                            borderRadius: 15,
                            border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(159,180,196,0.18)',
                            background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(175,196,212,0.075)',
                            color: Colors.get('subText', theme),
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            cursor: 'pointer',
                            outline: 'none',
                            boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.04) inset'
                        }}
                    >
                        <motion.span
                            animate={{ rotate: detailsCollapsed ? -90 : 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                            style={{ display: 'flex' }}
                        >
                            <FaChevronDown size={13} />
                        </motion.span>
                    </motion.button>
                </div>
            </div>
            <AnimatePresence initial={false}>
                {!detailsCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, y: -6 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0, y: -6 }}
                        transition={{ type: 'spring', stiffness: 230, damping: 28 }}
                        style={{ position: 'relative', zIndex: 1, minWidth: 0, paddingBottom: 0, overflow: 'hidden' }}
                    >
                <div style={{
                    borderRadius: 14,
                    border: `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.105)'}`,
                    background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.038)',
                    padding: '10px 11px',
                    boxSizing: 'border-box',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
                }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                        <span style={{ color: sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                            {langIndex === 0 ? 'Выполнено' : 'Done'}
                        </span>
                        <span style={{ color: text, fontSize: 13, fontWeight: 950, fontVariantNumeric: 'tabular-nums' }}>
                            {summary.done}<span style={{ color: sub, fontSize: 10, fontWeight: 850 }}> / {summary.total}</span>
                        </span>
                    </div>
                    <div style={{ height: 5, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.round(progress * 100)}%` }}
                            transition={{ duration: 0.72 }}
                            style={{ height: '100%', borderRadius: 999, background: HABITS_ACCENT.hue }}
                        />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 10 }}>
                    {stat(langIndex === 0 ? 'Ждут' : 'Pending', summary.pending)}
                    {stat(langIndex === 0 ? 'Лучшая серия' : 'Best streak', summary.bestStreak, HABITS_SUCCESS)}
                    {stat(langIndex === 0 ? 'Формирование привычек' : 'Habit formation', `${summary.avgFormation}%`, HABITS_ACCENT, true)}
                </div>
                    </motion.div>
                )}
            </AnimatePresence>
            </div>
        </motion.div>
    );
}

function HabitsWeekStrip({ theme, langIndex, habitsCards, selectedDateKey, onSelectDate }) {
    const isLight = theme === 'light' || theme === 'speciallight';
    const week = buildWeekSummary(habitsCards, langIndex);
    const sub = Colors.get('subText', theme);

    return (
        <div style={{
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '14px auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            gap: 6
        }}>
            {week.map(day => {
                const active = day.key === selectedDateKey;
                const full = day.total > 0 && day.done === day.total;
                const strokeColor = active ? HABITS_ACCENT.hue : full ? HABITS_SUCCESS.hue : (isLight ? 'rgba(15,23,42,0.32)' : 'rgba(255,255,255,0.24)');
                const ring = 2 * Math.PI * 9;

                return (
                    <motion.div
                        key={day.key}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => {
                            onSelectDate(day.key);
                            playEffects(clickSound);
                        }}
                        style={{
                            minHeight: 70,
                            borderRadius: 16,
                            border: active ? `1px solid ${HABITS_ACCENT.ring}` : '1px solid transparent',
                            background: active ? HABITS_ACCENT.soft : 'transparent',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6,
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ color: active ? HABITS_ACCENT.hue : sub, fontSize: 9, fontWeight: 900, letterSpacing: '0.06em' }}>{day.label}</div>
                        <svg width="24" height="24" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="9" stroke={isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'} strokeWidth="2.4" fill="none" />
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                                stroke={strokeColor}
                                strokeWidth="2.4"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray={ring}
                                strokeDashoffset={ring - ring * day.progress}
                                transform="rotate(-90 12 12)"
                            />
                        </svg>
                        <div style={{ color: sub, fontSize: 10, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>{day.done}/{day.total}</div>
                    </motion.div>
                );
            })}
        </div>
    );
}

function HabitsEmptyState({ theme, langIndex, fSize }) {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
                width: 'calc(100% - 56px)',
                maxWidth: 520,
                margin: '52px auto 0',
                padding: '38px 24px',
                borderRadius: 28,
                background: isLight
                    ? `linear-gradient(145deg, rgba(255,255,255,0.96), rgba(${HABITS_ACCENT.rgb},0.1))`
                    : `linear-gradient(145deg, rgba(23,27,31,0.96), rgba(${HABITS_ACCENT.rgb},0.1))`,
                border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : HABITS_ACCENT.ring}`,
                boxShadow: '0 1px 0 rgba(255,255,255,0.055) inset',
                boxSizing: 'border-box',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 220, height: 220, borderRadius: 999, background: `radial-gradient(circle, rgba(${HABITS_ACCENT.rgb},0.18), transparent 68%)` }} />
            <div style={{
                position: 'relative',
                width: 72,
                height: 72,
                borderRadius: 22,
                margin: '0 auto 18px',
                background: HABITS_ACCENT.soft,
                border: `1px solid ${HABITS_ACCENT.ring}`,
                color: HABITS_ACCENT.hue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <HabitOutlineIcon iconName="target" size={30} />
            </div>
            <div style={{ position: 'relative', color: text, fontSize: fSize === 0 ? 22 : 25, fontWeight: 950 }}>
                {langIndex === 0 ? 'Путь в 66 дней' : 'The 66-day path'}
            </div>
            <div style={{ position: 'relative', color: sub, fontSize: fSize === 0 ? 14 : 16, fontWeight: 750, lineHeight: 1.45, marginTop: 8 }}>
                {setInfoText(langIndex)}
            </div>
            <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setPage('AddHabitPanel')}
                style={{
                    position: 'relative',
                    minHeight: 48,
                    borderRadius: 16,
                    border: `1px solid ${HABITS_ACCENT.ring}`,
                    background: `linear-gradient(135deg, ${HABITS_ACCENT.soft}, rgba(255,255,255,0.035))`,
                    color: text,
                    fontFamily: 'inherit',
                    fontSize: 14,
                    fontWeight: 900,
                    padding: '0 18px',
                    marginTop: 20,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    cursor: 'pointer'
                }}
            >
                <FaPlus size={13} />
                {langIndex === 0 ? 'Добавить привычку' : 'Add habit'}
            </motion.button>
        </motion.div>
    );
}

function buildMenu({ theme, habitsCards, categories, selectedDateKey, setCP, setCurrentId, fSize, setNeedConfirmation, setConfirmMessage, setHabitToDelete, habitCardWidgets, langIndex, onStatusChange, onCategoryToggle }) {
    return categories.map(category => {
        const habitsInCategory = habitsCards
            .map(id => getAllHabits().find(h => h.id === id))
            .filter(h => h && getHabitEffectiveCategoryKey(h) === category);

        if (habitsInCategory.length === 0) return null;
        const doneCount = habitsInCategory.filter(h => getHabitStatus(h.id, selectedDateKey) === 1 || (selectedDateKey === dateKey && AppData.isHabitAutoComplete(h.id))).length;
        const categoryLabel = getCategory(category);

        return (
            <CategoryPanel 
                key={category} 
                categoryKey={category}
                text={categoryLabel} 
                theme={theme} 
                isNegative={category === NEGATIVE_CATEGORY}
                doneCount={doneCount}
                totalCount={habitsInCategory.length}
                langIndex={langIndex}
                summaryLabel={getSelectedDateLabel(selectedDateKey, langIndex)}
                onToggle={onCategoryToggle}
            >
                {habitsInCategory.map(habit => (
                    <HabitCard
                        key={habit.id}
                        id={habit.id}
                        theme={theme}
                        activeDateKey={selectedDateKey}
                        setCP={setCP}
                        setCurrentId={setCurrentId}
                        fSize={fSize}
                        setConfirmMessage={setConfirmMessage}
                        setNeedConfirmation={setNeedConfirmation}
                        setHabitToDelete={setHabitToDelete}
                        habitCardWidgets={habitCardWidgets}
                        onStatusChange={onStatusChange}
                    />
                ))}
            </CategoryPanel>
        );
    });
}

function HabitCard({ id = 0, theme, activeDateKey = dateKey, setCP, setCurrentId, fSize, setNeedConfirmation, setConfirmMessage, setHabitToDelete, habitCardWidgets, onStatusChange }) {
    const [status, setStatus] = useState(AppData.habitsByDate[activeDateKey]?.[id] ?? 0);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const habit = getAllHabits().find(h => h.id === id);
    if (!habit) return null;

    const [habitInfo, setHabitInfo] = useState({
        name: habit?.name || ["", ""],
        descr: habit?.description || ["", ""],
        icon: habit?.iconName || "default"
    });

    const isNegative = isNegativeHabit(id, habit);
    const effectiveCategoryKey = getHabitEffectiveCategoryKey(habit);
    const isSelectedToday = activeDateKey === dateKey;
    const isAutoComplete = isSelectedToday && !isNegative && AppData.isHabitAutoComplete(id);
    const percent = getHabitPerformPercent(id);
    const maxX = 120;
    const minX = -maxX;
    const [canDrag, setCanDrag] = useState(true);

    const [expanded, setExpanded] = useState(false);
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [habitsGoals, setHabitGoals] = useState(AppData.choosenHabitsGoals[id]);
    const [currentGoal, setCurrentGoal] = useState(0);
    const [showTimerSlider, setShowTimerSlider] = useState(false);
    const [timer, setTimer] = useState(isNegative ? true : false);
    const [maxTimer, setMaxTimer] = useState(isNegative ? 86400000 : 60000);
    const [time, setTime] = useState(isNegative ? Math.round(Date.now() - new Date(AppData.choosenHabitsLastSkip[id])) : 60000);
    const [progress, setProgress] = useState(0);
    const previousDateKeyRef = React.useRef(activeDateKey);

    const categoryBaseTone = getCategoryTone(effectiveCategoryKey);
    const categoryTone = categoryBaseTone?.hue ? categoryBaseTone : { ...HABITS_ACCENT, icon: categoryBaseTone.icon };
    const negativeTone = getCategoryTone(NEGATIVE_CATEGORY);
    const statusValue = status ?? 0;
    const habitColor = isNegative ? negativeTone.hue : HABITS_ACCENT.hue;
    const isLight = theme === 'light' || theme === 'speciallight';
    const widgets = normalizeHabitCardWidgets(habitCardWidgets);
    const showStatsRow = widgets.days || widgets.skips || widgets.streak || widgets.timer;
    const safePercent = Math.max(0, Math.min(100, percent));

    let cardBg = isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(244,246,248,0.66))'
        : 'linear-gradient(145deg, rgba(42,49,55,0.58), rgba(17,22,26,0.72))';
    let textColor = isLight ? '#1D1D1F' : Colors.get('mainText', theme);
    let subTextColor = isLight ? '#8E8E93' : Colors.get('subText', theme);
    let iconBg = isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.065)';
    let iconColor = isLight ? 'rgba(31,41,55,0.58)' : 'rgba(196,211,222,0.62)';
    let borderColor = `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.08)'}`;
    let progressColor = isLight ? 'rgba(31,41,55,0.28)' : 'rgba(196,211,222,0.28)';

    let shadow = isLight 
        ? '0 14px 28px -24px rgba(15,23,42,0.24), 0 1px 0 rgba(255,255,255,0.72) inset'
        : '0 1px 0 rgba(255,255,255,0.055) inset, 0 18px 34px -28px rgba(0,0,0,0.72)';

    if (isNegative) {
        cardBg = isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(216,120,94,0.09))'
            : 'radial-gradient(240px 120px at 4% 10%, rgba(216,120,94,0.14), transparent 72%), linear-gradient(145deg, rgba(28,24,22,0.9), rgba(20,23,25,0.92))';
        borderColor = '1px solid transparent';
        iconBg = negativeTone.soft;
        iconColor = negativeTone.hue;
        progressColor = '#D8785E';
    }

    if (statusValue === 1) {
        if (isNegative) {
            cardBg = isLight
                ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(216,120,94,0.11))'
                : 'radial-gradient(240px 120px at 4% 10%, rgba(216,120,94,0.16), transparent 72%), linear-gradient(145deg, rgba(28,24,22,0.92), rgba(20,23,25,0.92))';
            iconBg = negativeTone.soft;
            iconColor = negativeTone.hue;
            borderColor = '1px solid transparent';
            progressColor = negativeTone.hue;
        } else {
            cardBg = isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.92), ${HABITS_SUCCESS.soft})`
                : `radial-gradient(220px 120px at 6% 4%, ${HABITS_SUCCESS.soft}, transparent 72%), linear-gradient(145deg, rgba(24,35,29,0.84), rgba(16,24,19,0.76))`;
            iconBg = HABITS_SUCCESS.soft;
            iconColor = HABITS_SUCCESS.hue;
            borderColor = `1px solid ${HABITS_SUCCESS.ring}`;
            progressColor = HABITS_SUCCESS.hue;
            shadow = isLight
                ? '0 14px 30px -24px rgba(15,23,42,0.20), 0 1px 0 rgba(255,255,255,0.72) inset'
                : '0 1px 0 rgba(255,255,255,0.055) inset, 0 18px 34px -28px rgba(0,0,0,0.76)';
        }
    } else if (statusValue === -1) {
        cardBg = isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(216,92,92,0.1))'
            : 'radial-gradient(240px 120px at 4% 10%, rgba(216,92,92,0.13), transparent 72%), linear-gradient(145deg, rgba(30,22,22,0.92), rgba(20,23,25,0.92))';
        iconBg = 'rgba(216,92,92,0.15)';
        iconColor = '#D95C5C';
        borderColor = '1px solid transparent';
        progressColor = '#D95C5C';
    }
   
    useEffect(() => { const sub = premium$.subscribe(setHasPremium); return () => sub.unsubscribe(); }, []);
    useEffect(() => {
        const nextStatus = AppData.habitsByDate?.[activeDateKey]?.[id];
        setStatus(isAutoComplete ? 1 : (nextStatus ?? 0));
    }, [activeDateKey, id, isAutoComplete]);
    useEffect(() => {
        if (isAutoComplete && status !== 1) setStatus(1);
    }, [isAutoComplete, status]);
    useEffect(() => {
        if (timer) {
            let temp = 0;
            const interval = setInterval(() => {
                temp += 50;
                const newProgress = ((time + temp) / maxTimer) * 100;
                setProgress(newProgress);
                if (temp === 1000) {
                    setTime(prevTime => {
                        const newTime = prevTime + 1000;
                        temp = 0;
                        if (!isNegative && newTime >= maxTimer) { isDoneSound.play(); clearInterval(interval); setStatus(1); setTime(0); setTimer(false); setProgress(0); }
                        else { if (newTime >= maxTimer && statusValue < 1) setStatus(1); }
                        return newTime;
                    });
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [time, timer, maxTimer, statusValue]);

    useEffect(() => { const sub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)); return () => sub.unsubscribe(); }, []);
    useEffect(() => {
        if (previousDateKeyRef.current !== activeDateKey) {
            previousDateKeyRef.current = activeDateKey;
            return;
        }
        const storedStatus = AppData.habitsByDate?.[activeDateKey]?.[id];
        if (status !== undefined && (status !== 0 || storedStatus !== undefined)) AppData.changeStatus(activeDateKey, id, status);
    }, [status, id, activeDateKey]);

    const getHabitIcon = () => {
        return (
            <HabitOutlineIcon
                iconName={habit.iconName || habitInfo.icon || 'default'}
                habitName={habit.name}
                categoryKey={effectiveCategoryKey}
                size={22}
            />
        );
    };

    const x = useMotionValue(0);
    const constrainedX = useTransform(x, [-1, 1], [minX, maxX]);

    const handledDrag = (event, info) => {
        if (isAutoComplete) return;
        if (isNegative) {
            if (info.offset.x < minX && canDrag) { setNewStatus(false); animate(constrainedX, 0, { type: 'tween', duration: 0.2 }); setCanDrag(false); }
        } else {
            if (Math.abs(info.offset.x) > maxX && canDrag) {
                if ((statusValue < 1 && info.offset.x > 0) || (statusValue > -1 && info.offset.x < 0)) setNewStatus(info.offset.x > 0);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                setCanDrag(false);
            }
        }
    }
    const onDragEnd = () => { if (canDrag) animate(constrainedX, 0, { type: 'tween', duration: 0.2 }); setCanDrag(true); }
    const setNewStatus = (isOverZero) => {
        const currentStatus = AppData.habitsByDate?.[activeDateKey]?.[id] ?? statusValue;
        let newStatus = 0;
        if (isOverZero) { newStatus = 1; }
        else {
            if (isNegative) {
                newStatus = -1;
                setTime(0);
                AppData.choosenHabitsLastSkip[id] = Date.now();
            }
            else if (currentStatus === 1) { newStatus = 0; }
            else { newStatus = -1; }
        }
        if (!AppData.habitsByDate[activeDateKey]) AppData.habitsByDate[activeDateKey] = {};
        AppData.habitsByDate[activeDateKey][id] = newStatus;
        if (newStatus === 1) playEffects(isDoneSound); else if (newStatus === -1) playEffects(skipSound);
        setStatus(newStatus);
        onStatusChange?.();
    }
    const toggleIsActive = () => { setCurrentId(id); playEffects(clickSound); const newExpanded = !expanded; setExpanded(newExpanded); setExpandedCard(newExpanded ? id : null); }

    useEffect(() => { const sub = expandedCard$.subscribe(cId => setExpanded(cId === id)); return () => sub.unsubscribe(); }, [id]);
    useEffect(() => { setCanDrag(!showTimerSlider); }, [showTimerSlider]);

    const startTimer = () => { if (statusValue < 1 && !isNegative && !isAutoComplete) { setTimer(true); setTime(0); } }
    const stopTimer = () => { if (!isNegative) { setTimer(false); setProgress(0); setTime(0); } }
    const onDeleteHabit = (id) => { setHabitToDelete(id); setNeedConfirmation(true); setConfirmMessage(AppData.prefs[0] === 0 ? `⚠️ Вы уверены?` : `⚠️ Are you sure?`); }
    const actionButtonStyle = {
        width: 34,
        height: 34,
        borderRadius: 13,
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(190,220,235,0.09)'}`,
        background: isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.66), rgba(15,23,42,0.035))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))',
        color: Colors.get('icons', theme),
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        cursor: 'pointer',
        outline: 'none',
        boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.72) inset' : '0 1px 0 rgba(255,255,255,0.045) inset',
        backdropFilter: isLight ? 'none' : 'blur(14px) saturate(150%)',
        WebkitBackdropFilter: isLight ? 'none' : 'blur(14px) saturate(150%)',
        WebkitTapHighlightColor: 'transparent'
    };

    return (
        <motion.div
            id={id}
            style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                boxSizing: 'border-box',
                overflow: 'hidden',
                position: 'relative',
                borderRadius: 28,
                background: cardBg,
                backdropFilter: isLight ? 'none' : 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: isLight ? 'none' : 'blur(24px) saturate(160%)',
                border: borderColor,
                boxShadow: shadow,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                clipPath: 'inset(0 round 28px)',
                backgroundClip: 'padding-box',
                isolation: 'isolate',
                x: constrainedX,
                transition: 'background 0.52s ease, border-color 0.52s ease, box-shadow 0.52s ease'
            }}
            onClick={(event) => {
                const el = document.getElementById(id);
                if (el.clientHeight < 88 || (event.nativeEvent.pageY - (el.getBoundingClientRect().top + window.scrollY)) < 88) toggleIsActive();
            }}
            drag={canDrag && !isAutoComplete ? 'x' : false} dragConstraints={{ left: minX, right: statusValue > 0 || isNegative ? 0 : maxX }}
            onDrag={handledDrag} onDragEnd={onDragEnd} whileHover={{ y: -1 }} whileTap={{ scale: 0.985 }}
            animate={{ height: expanded ? 'auto' : '88px' }} transition={{ type: 'spring', stiffness: 118, damping: 27, mass: 0.92 }}
        >
           
            <div style={{ display: "flex", alignItems: "center", minHeight: 88, width: '100%', padding: '14px 16px', boxSizing: 'border-box', gap: 14 }}>
                <div style={{
                    width: 46,
                    height: 46,
                    borderRadius: 15,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: iconBg,
                    color: iconColor,
                    border: '1px solid transparent',
                    flexShrink: 0
                }}>{getHabitIcon()}</div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden', minWidth: 0 }}>
                    
                    <span style={{ fontWeight: '900', fontSize: fSize === 0 ? 16 : 18, color: textColor, whiteSpace: expanded ? 'normal' : 'nowrap', overflow: expanded ? 'visible' : 'hidden', textOverflow: 'ellipsis', lineHeight: '1.16' }}>{habitInfo.name[langIndex]}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
                        <div style={{ flex: 1, height: 4, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.065)', overflow: 'hidden' }}>
                            <div style={{ width: `${safePercent}%`, height: '100%', borderRadius: 999, background: progressColor, transition: 'width 0.45s ease' }} />
                        </div>
                        <span style={{ color: subTextColor, fontSize: 10, fontWeight: 900, fontVariantNumeric: 'tabular-nums', minWidth: 30, textAlign: 'right' }}>{safePercent}%</span>
                    </div>

                   {/*

                    {timer && <span style={{ fontSize: '14px', fontWeight: '700', color: status===1 ? (isLight?'#2E7D32':'#FFF') : habitColor, marginTop: '4px', opacity: 0.9 }}>{parsedTime(time, maxTimer,langIndex, isNegative)}</span>}
                     {!timer && !isNegative && currentStreak > 0 && <span style={{ fontSize: '14px', fontWeight: '700', color: status===1 ? (isLight?'#2E7D32':'#FFF') : habitColor, marginTop: '4px', opacity: 0.9 }}>{getDayName(langIndex,currentStreak)}</span>}

                    */}

	                    {showStatsRow && <div style={{display:'flex', gap: 6, marginTop: 8, justifyContent:'center', alignItems: 'center', width: '100%', overflow: 'hidden'}}>

	                    {widgets.days && <MiniBadge theme={theme} icon={<FiCalendar size={9}/>} text={getDaysAmount(id)} color={subTextColor} />}
	                    {widgets.skips && <MiniBadge theme={theme} icon={<MdClose size={9}/>} text={getSkippedAmount(id)} color={statusValue === -1 ? '#D95C5C' : subTextColor} />}
                    {widgets.streak && !isNegative && <MiniBadge theme={theme} icon={<FaFire size={9}/>} text={getDoneAmount(id)} color={statusValue === 1 ? HABITS_SUCCESS.hue : '#D8785E'} />}
                    {widgets.timer && !isNegative && timer && <MiniBadge theme={theme} icon={<FaClock size={9}/>} text={parsedTime(time, maxTimer,langIndex, false)} color={categoryTone.hue} />}
	                    {widgets.timer && isNegative &&  <MiniBadge theme={theme} icon={<FaFire size={9}/>} text={parsedTime(time, maxTimer,langIndex, isNegative)} color={'#D8785E'} />}

	                    </div>}




                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingLeft: '2px', alignSelf: 'center', gap: 8, flexShrink: 0 }}>
                    {!isNegative && !isAutoComplete && <>
                    
                        {!timer && statusValue === 0 && <TimerOffIcon onClick={(e) => { e.stopPropagation(); setShowTimerSlider(true); }} style={{ color: subTextColor, opacity: 0.52, fontSize: '23px', transition: 'color 0.42s ease, opacity 0.42s ease' }} />}
                        {timer && <TimerIcon onClick={(e) => { e.stopPropagation(); stopTimer() }} style={{ color: categoryTone.hue, fontSize: '23px', transition: 'color 0.42s ease' }} />}
		                        <div onClick={(e) => {e.stopPropagation(); setNewStatus(statusValue !== 1)}} style={{ width: 40, height: 30, borderRadius: 12, border: statusValue === 1 ? `1px solid ${HABITS_SUCCESS.ring}` : `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`, background: statusValue === 1 ? HABITS_SUCCESS.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)'), color: statusValue === 1 ? HABITS_SUCCESS.hue : subTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.45s ease, border-color 0.45s ease, color 0.45s ease, box-shadow 0.45s ease', boxSizing: 'border-box', cursor: 'pointer', boxShadow: statusValue === 1 ? `0 1px 0 rgba(255,255,255,0.08) inset, 0 0 16px ${HABITS_SUCCESS.glow}` : '0 1px 0 rgba(255,255,255,0.035) inset' }}>{statusValue === 1 && <FaCheck size={14} />}</div>
                    </>}




                    {isAutoComplete && <div style={{ padding: '7px 10px', borderRadius: '999px', backgroundColor: HABITS_SUCCESS.soft, border: '1px solid transparent', color: HABITS_SUCCESS.hue, fontSize: '11px', fontWeight: 900 }}>{langIndex === 0 ? 'АВТО' : 'AUTO'}</div>}
                    {isNegative && <div style={{ width: 40, height: 30, borderRadius: 10, backgroundColor: 'rgba(216,120,94,0.07)', border: '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' }}><FaFire size={14} color="#D8785E" /></div>}
                    
                </div>
            </div>
            {expanded && (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.34, ease: 'easeOut', delay: 0.06 }} 
        style={{ padding: '0 16px 18px 16px' }}
    >
        {/* Separator Line */}
        <div style={{ height: '1px', width: '100%', backgroundColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)', marginBottom: '14px' }} />
        {/* Description */}
	                {widgets.description && habitInfo.descr[langIndex] && (
	                    <div style={{ color: subTextColor, fontSize: '14px', marginBottom: '16px', lineHeight: '1.45', fontWeight: 700 }}>
	                        {habitInfo.descr[langIndex]}
	                    </div>
                )}
        {/* --- CONTENT BASED ON PREMIUM STATUS --- */}
        {hasPremium ? (
            <>
                

                {/* Goals List */}
	                {widgets.goals && <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
	                    {habitsGoals?.map((goal, index) => (
	                        <motion.div key={index} whileTap={{ scale: 0.98 }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '12px 13px', borderRadius: 15, background: goal.isDone ? (isLight ? 'linear-gradient(135deg, rgba(57,217,130,0.18), rgba(57,217,130,0.08))' : 'linear-gradient(135deg, rgba(57,217,130,0.16), rgba(57,217,130,0.055))') : (isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.035)'), border: goal.isDone ? `1px solid ${HABITS_SUCCESS.ring}` : `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)'}`, boxShadow: goal.isDone ? `0 1px 0 rgba(255,255,255,0.055) inset, 0 12px 22px -24px ${HABITS_SUCCESS.hue}` : '0 1px 0 rgba(255,255,255,0.035) inset', boxSizing: 'border-box' }}>
                            <div style={{ fontSize: '14px', flexGrow: 1, fontWeight: goal.isDone ? '800' : '500', color: goal.isDone ? HABITS_SUCCESS.hue : textColor, textDecoration: 'none' }}>{goal.text}</div>
                            
                            {/* Edit/Delete Goal Options */}
                            {showAddOptions && currentGoal === index && (
                                <div style={{ display: 'flex', marginRight: '10px' }}>
                                    <FaPencilAlt onClick={() => setCP(prev => ({ ...prev, show: true, type: 2, hId: id, gId: index, setGoals: setHabitGoals }))} style={{ fontSize: '14px', margin: '0 6px', color: Colors.get('icons', theme), opacity: 0.7 }} />
                                    <FaTrash onClick={() => setCP(prev => ({ ...prev, show: true, type: 3, hId: id, gId: index, setGoals: setHabitGoals }))} style={{ fontSize: '14px', margin: '0 6px', color: Colors.get('icons', theme), opacity: 0.7 }} />
                                </div>
                            )}

                            {/* Dots Menu */}
                            <div onClick={() => { setShowAddOptions(prev => prev && currentGoal === index ? false : true); setCurrentGoal(index); setCurrentId(id); }}>
                                <TbDotsVertical style={{ fontSize: '16px', color: Colors.get('icons', theme), opacity: 0.4, marginRight: '12px' }} />
                            </div>

                            {/* Checkbox */}
	                            <div onClick={async () => { const updated = (habitsGoals || []).map((h, i) => i === index ? { ...h, isDone: !h.isDone } : h); AppData.choosenHabitsGoals[id] = updated; setHabitGoals(updated); await saveData(); }} style={{ width: 25, height: 25, borderRadius: 9, border: goal.isDone ? `1px solid ${HABITS_SUCCESS.ring}` : `1px solid ${isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)'}`, background: goal.isDone ? HABITS_SUCCESS.hue : 'transparent', color: isLight ? '#FFFFFF' : '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: goal.isDone ? `0 8px 16px -12px ${HABITS_SUCCESS.hue}` : 'none' }}>
                                {goal.isDone && <FaCheck size={12} />}
                            </div>
	                        </motion.div>
	                    ))}
	                </div>}

	                {/* Add Goal Button */}
	                {widgets.goals && <div onClick={() => setCP({ show: true, type: 1, hId: id, gId: 0, setGoals: setHabitGoals })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '12px', cursor: 'pointer', padding: '12px', borderRadius: 15, border: `1px solid ${categoryTone.ring}`, background: categoryTone.soft }}>
	                    <FaPlus style={{ fontSize: '12px', color: habitColor }} />
	                    <span style={{ fontSize: '13px', marginLeft: '8px', color: habitColor, fontWeight: '600' }}>
	                        {langIndex === 0 ? 'Добавить цель' : 'Add goal'}
	                    </span>
	                </div>}

	                {/* Achievements Section */}
	                {widgets.achievements && <div style={{ marginTop: '22px', marginBottom: '10px', fontSize: '11px', fontWeight: 900, color: Colors.get('subText', theme), textTransform: 'uppercase', letterSpacing: '0.08em' }}>
	                    {langIndex === 0 ? 'Достижения' : 'Achievements'}
	                </div>}
	                {widgets.achievements && ((AppData.choosenHabitsAchievements[id] || []).length > 0 ? (
	                    AppData.choosenHabitsAchievements[id].map((milestone, index) => (
	                        <Achievement key={index} index={index} milestone={milestone} id={id} isNegative={isNegative} percent={percent} theme={theme} fSize={fSize} langIndex={langIndex} />
	                    ))
	                ) : (
	                    <div style={{
	                        borderRadius: 17,
	                        border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(190,220,235,0.08)'}`,
	                        background: isLight ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.04)',
	                        color: subTextColor,
	                        padding: '13px 14px',
	                        fontSize: 12,
	                        fontWeight: 750,
	                        lineHeight: 1.45,
	                        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
	                    }}>
	                        {langIndex === 0
	                            ? 'Достижения появятся за длинную серию без пропусков. Держи привычку 30, 50 и 100 дней подряд, чтобы открыть этапы.'
	                            : 'Achievements appear after a long streak without skips. Keep the habit for 30, 50, and 100 days in a row to unlock them.'}
	                    </div>
	                ))}
            </>
        ) : (
            /* --- NO PREMIUM VIEW --- */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '14px', marginBottom: '14px', fontSize: '12px', fontWeight: 800, color: Colors.get('subText', theme) , border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`, background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)', padding: '12px', borderRadius: 15 }}>
                {langIndex === 0 ? 'Микро цели и достижения с премиум' : 'Micro goals and achievements with premium'}
            </div>
        )}

        {/* --- BOTTOM ACTIONS (Visible to All) --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px', gap: 9 }}>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={(e) => { e.stopPropagation(); setCP(prev => ({ ...prev, show: true, type: 0, hId: id, gId: 0, hInfo: setHabitInfo })); }} style={actionButtonStyle}>
                <FiEdit3 size={17} />
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={(e) => { e.stopPropagation(); onDeleteHabit(id); }} style={actionButtonStyle}>
                <FiTrash2 size={17} />
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={(e) => { e.stopPropagation(); toggleIsActive(); }} style={actionButtonStyle}>
                <FiChevronUp size={20} />
            </motion.button>
        </div>

    </motion.div>
)}
            {showTimerSlider && (
                <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', borderRadius: 28, width: '100%', height: 88, top: 0, zIndex: 1001, background: isLight ? 'rgba(255,255,255,0.98)' : 'rgba(20,23,25,0.98)', border: borderColor }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%', margin: '0 auto' }}>
                        <div style={{color: Colors.get('mainText', theme), fontWeight: 'bold'}}>{parsedTimeSimple(maxTimer)}</div>
                        <Slider style={{ width: '50%', color: theme === 'dark' ? '#3abfe4' : '#14868878' }} min={1} max={59} value={maxTimer / 60000} valueLabelDisplay="off" onChange={(e) => { setMaxTimer(e.target.value * 60000); e.stopPropagation(); }} />
                        <MdClose onClick={(e) => { e.stopPropagation(); setShowTimerSlider(false); }} style={{ cursor: 'pointer', color: Colors.get('icons', theme), fontSize: '24px' }} />
                        <MdDone onClick={(e) => { e.stopPropagation(); startTimer(); setShowTimerSlider(false); }} style={{ cursor: 'pointer', color: habitColor, fontSize: '24px' }} />
                    </div>
                </div>
            )}
        </motion.div>
    )
}

function HabitWidgetSettingsModal({ isOpen, onClose, values, onToggle, accentColor, onAccentChange, customPresets, onSavePreset, theme, langIndex }) {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(20,23,25,0.97)';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const presetColors = mergeAccentPresets(HABIT_ACCENT_PRESETS, customPresets);
    const currentColor = accentColor || HABITS_ACCENT.hue;
    const presetSaved = presetColors.some(color => color.toUpperCase() === currentColor.toUpperCase());

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 5000
                        }}
                    />
                    <motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 23, stiffness: 260 }}
                        style={{
                            position: 'fixed',
                            left: '4%',
                            right: '4%',
                            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
                            maxWidth: '560px',
                            margin: '0 auto',
                            borderRadius: '26px',
                            padding: '18px',
	                            background: isLight
	                                ? `radial-gradient(260px 180px at 92% 6%, ${HABITS_ACCENT.soft} 0%, transparent 66%), ${bg}`
	                                : `radial-gradient(260px 180px at 92% 6%, ${HABITS_ACCENT.soft} 0%, transparent 66%), ${bg}`,
	                            border: isLight ? '1px solid rgba(15,23,42,0.08)' : `1px solid ${HABITS_ACCENT.ring}`,
                            boxShadow: isLight ? '0 24px 70px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.7) inset' : '0 28px 80px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.055) inset',
                            zIndex: 5001
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                            <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: HABITS_ACCENT.soft,
                                border: `1px solid ${HABITS_ACCENT.ring}`,
                                color: HABITS_ACCENT.hue,
                                flexShrink: 0
                            }}>
                                <FaSlidersH />
                            </div>
                            <div>
                                <div style={{ color: text, fontSize: '18px', fontWeight: 900 }}>
	                                    {langIndex === 0 ? 'Вид раздела' : 'Section view'}
	                                </div>
	                                <div style={{ color: sub, fontSize: '12px', fontWeight: 700, marginTop: '3px' }}>
	                                    {langIndex === 0 ? 'Цвет и блоки карточек привычек' : 'Accent color and habit card blocks'}
	                                </div>
	                            </div>
	                        </div>

	                        <div style={{
	                            borderRadius: '18px',
	                            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`,
	                            background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)',
	                            padding: '12px',
	                            marginBottom: '12px',
	                            boxSizing: 'border-box'
	                        }}>
	                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
	                                <div style={{ minWidth: 0 }}>
	                                    <div style={{ color: text, fontSize: '14px', fontWeight: 850 }}>
	                                        {langIndex === 0 ? 'Основной цвет' : 'Main color'}
	                                    </div>
	                                    <div style={{ color: sub, fontSize: '11px', fontWeight: 650, marginTop: 2 }}>
	                                        {langIndex === 0 ? 'Акцент раздела привычек' : 'Habit section accent'}
	                                    </div>
	                                </div>
	                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
	                                    <motion.button
	                                        type="button"
	                                        whileTap={!presetSaved ? { scale: 0.94 } : {}}
	                                        onClick={presetSaved ? undefined : onSavePreset}
	                                        disabled={presetSaved}
	                                        style={{
	                                            minHeight: 38,
	                                            borderRadius: 14,
	                                            border: `1px solid ${presetSaved ? (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.09)') : HABITS_ACCENT.ring}`,
	                                            background: presetSaved ? (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)') : HABITS_ACCENT.soft,
	                                            color: presetSaved ? sub : HABITS_ACCENT.hue,
	                                            display: 'flex',
	                                            alignItems: 'center',
	                                            justifyContent: 'center',
	                                            gap: 6,
	                                            padding: '0 11px',
	                                            fontSize: 11,
	                                            fontWeight: 900,
	                                            fontFamily: 'inherit',
	                                            cursor: presetSaved ? 'default' : 'pointer'
	                                        }}
	                                    >
	                                        <FaPlus size={10} />
	                                        <span>{presetSaved ? (langIndex === 0 ? 'В пресетах' : 'Saved') : (langIndex === 0 ? 'В пресет' : 'Save')}</span>
	                                    </motion.button>
	                                    <input
	                                        type="color"
	                                        value={currentColor}
	                                        onChange={(event) => onAccentChange(event.target.value)}
	                                        style={{
	                                            width: 42,
	                                            height: 42,
	                                            padding: 0,
	                                            border: `1px solid ${HABITS_ACCENT.ring}`,
	                                            borderRadius: 14,
	                                            background: 'transparent',
	                                            cursor: 'pointer',
	                                            flexShrink: 0
	                                        }}
	                                    />
	                                </div>
	                            </div>
	                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 7 }}>
	                                {presetColors.map((color) => {
	                                    const active = currentColor.toUpperCase() === color.toUpperCase();
	                                    return (
	                                        <motion.button
	                                            key={color}
	                                            type="button"
	                                            whileTap={{ scale: 0.92 }}
	                                            onClick={() => onAccentChange(color)}
	                                            aria-label={color}
	                                            style={{
	                                                width: '100%',
	                                                aspectRatio: '1 / 1',
	                                                minHeight: 28,
	                                                borderRadius: 11,
	                                                border: active ? `2px solid ${Colors.get('mainText', theme)}` : `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.09)'}`,
	                                                background: color,
	                                                boxShadow: active ? `0 0 18px ${color}55` : 'none',
	                                                cursor: 'pointer'
	                                            }}
	                                        />
	                                    );
	                                })}
	                            </div>
	                        </div>

	                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {HABIT_CARD_WIDGET_OPTIONS.map(option => {
                                const enabled = values[option.key] !== false;
                                return (
                                    <motion.button
                                        key={option.key}
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => onToggle(option.key)}
                                        style={{
                                            minHeight: '56px',
                                            borderRadius: '18px',
                                            border: `1px solid ${enabled ? HABITS_ACCENT.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)')}`,
                                            background: enabled ? HABITS_ACCENT.soft : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)'),
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            outline: 'none',
                                            appearance: 'none',
                                            WebkitAppearance: 'none',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: text, fontSize: '14px', fontWeight: 850 }}>{option.label[langIndex]}</div>
                                            <div style={{ color: sub, fontSize: '11px', fontWeight: 650, marginTop: '2px' }}>{option.hint[langIndex]}</div>
                                        </div>
                                        <div style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '10px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
	                                            background: enabled ? HABITS_ACCENT.soft : 'transparent',
                                            color: enabled ? HABITS_ACCENT.hue : sub,
                                            border: `1px solid ${enabled ? HABITS_ACCENT.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)')}`,
                                            flexShrink: 0
                                        }}>
                                            {enabled && <FaCheck size={13} />}
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CategoryPanel({ categoryKey, text = ["Имя", "Name"], children, theme, doneCount = 0, totalCount = 0, langIndex = AppData.prefs[0], summaryLabel, onToggle }) {
    const [isOpen, setIsOpen] = useState(() => !isCategoryCollapsed(categoryKey));
    const isLight = theme === 'light' || theme === 'speciallight';
    const categoryBaseTone = getCategoryTone(categoryKey);
    const isNegativeCategory = getCategory(categoryKey)[0] === NEGATIVE_CATEGORY || categoryBaseTone.icon === 'negative';
    const tone = isNegativeCategory ? categoryBaseTone : { ...HABITS_ACCENT, icon: categoryBaseTone.icon };
    const textColor = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    useEffect(() => {
        setIsOpen(!isCategoryCollapsed(categoryKey));
    }, [categoryKey]);

    const toggleOpen = () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        setCategoryCollapsed(categoryKey, !nextIsOpen);
        onToggle?.(nextIsOpen);
        playEffects(clickSound);
    };

    return (
        <div style={{ width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            <motion.div
                whileTap={{ scale: 0.992 }}
                onClick={toggleOpen}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '4px 4px 10px',
                    marginBottom: 6,
                    cursor: 'pointer',
                    userSelect: 'none',
                    WebkitTapHighlightColor: 'transparent'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: 11,
                        background: tone.soft,
                        border: `1px solid ${tone.ring}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {getCategoryIcon(categoryKey, theme)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ 
                            fontSize: '15px', 
                            fontWeight: '900', 
                            color: textColor,
                            lineHeight: 1.15,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {text[langIndex]}
                        </div>
                        <div style={{ color: sub, fontSize: 11, fontWeight: 800, marginTop: 3 }}>
                            <span style={{ color: tone.hue }}>{doneCount}</span> / {totalCount} {summaryLabel || (langIndex === 0 ? 'сегодня' : 'today')}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{
                        minWidth: 44,
                        height: 28,
                        borderRadius: 999,
                        background: doneCount === totalCount && totalCount > 0 ? (isNegativeCategory ? tone.soft : HABITS_SUCCESS.soft) : (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)'),
                        border: `1px solid ${doneCount === totalCount && totalCount > 0 ? (isNegativeCategory ? tone.ring : HABITS_SUCCESS.ring) : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)')}`,
                        color: doneCount === totalCount && totalCount > 0 ? (isNegativeCategory ? tone.hue : HABITS_SUCCESS.hue) : sub,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 900,
                        fontVariantNumeric: 'tabular-nums'
                    }}>
                        {doneCount}/{totalCount}
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        style={{ color: sub, display: 'flex' }}
                    >
                        <FaChevronDown size={14} />
                    </motion.div>
                </div>
            </motion.div>
            
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{ overflowY: 'hidden', overflowX: 'visible', padding: '0 1px', boxSizing: 'border-box' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function setInfoText(langIndex) { return langIndex === 0 ? 'Вы еще не добавили ни одной привычки\n\n Вы можете выбрать из списка или добавить свою привычку...' : 'You have not added any habits yet...'; }

function parsedTime(time, maxTime,langIndex, isNegative) {
  const elapsedOrRemaining = isNegative ? time : maxTime - time;
  const totalSeconds = Math.floor(elapsedOrRemaining / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (days > 0) {
    // Склонение для русского языка
    if (langIndex === 0) {
        let daysText = '';
        const lastDigit = days % 10;
        const lastTwoDigits = days % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            daysText = 'дней';
        } else if (lastDigit === 1) {
            daysText = 'день';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            daysText = 'дня';
        } else {
            daysText = 'дней';
        }
        
        return days;// + ' ' + daysText;
    } else {
        // Английский язык
        return days;// + (days === 1 ? ' day' : ' days');
    }
}

  if (hours > 0) {
    // Формат HH:MM, например "05:23"
    return (
      hours.toString().padStart(2, '0') + ':' +
      minutes.toString().padStart(2, '0')
    );
  }

  // Формат MM:SS, например "03:07"
  return (
    minutes.toString().padStart(2, '0') + ':' +
    seconds.toString().padStart(2, '0')
  );
}


export function parsedTimeSimple(maxTimer) { return (Math.floor(maxTimer / 60000) + 'm'); }

const Achievement = ({ milestone, index, id, theme, langIndex }) => {
    // 1. Find the index of the habit to look up related data
    const habitIndex = AppData.choosenHabits.indexOf(id);
    
    // 2. Get the reference time (LastSkip or StartDate if no skip exists)
    // Using Date.now() vs the stored timestamp
    const lastSkipMs = AppData.choosenHabitsLastSkip[id]; 
    const startDateMs = AppData.choosenHabitsStartDates[habitIndex];
    
    // If they've never skipped, the streak is based on the Start Date
    const effectiveStartMs = lastSkipMs || startDateMs;

    const msInDay = 24 * 60 * 60 * 1000;
    const currentStreak = effectiveStartMs 
        ? Math.floor((Date.now() - effectiveStartMs) / msInDay) 
        : 0;
    
    // 3. Define thresholds (30, 50, 100)
    const thresholds = [30, 50, 100];
    const target = thresholds[index] || 30;
    
    const isLocked = currentStreak < target;
    const daysLeft = target - currentStreak;

    // Translations
    const statusText = langIndex === 0
        ? `Осталось ${daysLeft} дн. до открытия`
        : `${daysLeft} days left to unlock`;

    return (
        <div style={{ 
            fontSize: '13px', 
            color: Colors.get('subText', theme), 
            marginLeft: '2px', 
            marginBottom: '6px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px' 
        }}>
            {isLocked ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.6 }}>
                    <div style={{ 
                        width: '12px', 
                        height: '12px', 
                        border: `1px solid ${Colors.get('subText', theme)}`, 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '9px',
                        fontWeight: 'bold'
                    }}>i</div>
                    <span style={{ fontSize: '11px' }}>{statusText}</span>
                </div>
            ) : (
                <>
                    <FaFire size={12} color={Colors.get('icons', theme)} style={{ opacity: 0.8 }}/>
                    {milestone[langIndex]}
                </>
            )}
        </div>
    );
};

const getDayName = (langIndex,days) => {
    if (langIndex === 0) {
        let daysText = '';
        const lastDigit = days % 10;
        const lastTwoDigits = days % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            daysText = 'дней';
        } else if (lastDigit === 1) {
            daysText = 'день';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            daysText = 'дня';
        } else {
            daysText = 'дней';
        }

        return days;
        
      /*  return days + ' ' + daysText;
    } else {
        // Английский язык
        return days + (days === 1 ? ' day' : ' days');*/
    }
}


const MiniBadge = ({ icon, text, color , theme}) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', gap: '3px', 
        padding: '4px 7px', borderRadius: 999, 
        background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.035)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
        color: color, fontSize: '10px', fontWeight: '850',
        whiteSpace: 'nowrap'
    }}>
        {icon}
        {text && <span>{text}</span>}
    </div>
);

function getStartDate(id) {
    const index = AppData.choosenHabits.indexOf(id);
    if (index === -1) return null; // Fixed: indexOf returns -1 when not found, not null
    
    let dateString = AppData.choosenHabitsStartDates[index];
    if (!dateString || dateString.length < 8) return null; // Validation check
    
    // Extract parts: assuming format like "YYYYMMDD" or similar
    let day = dateString.substring(dateString.length - 2);       // Last 2 chars
    let month = dateString.substring(dateString.length - 4, dateString.length - 2); // Chars before last 2
    let year = dateString.substring(2, 4);                      // First 4 chars
    
    return `${day}-${month}${year}`;
}

function getSkippedAmount(id) {
    let amount = 0;
    
    // Iterate through all dates in habitsByDate
    for (const date in AppData.habitsByDate) {
        const habitsOnDate = AppData.habitsByDate[date];
        
        // Check if the habit exists for this date and if its status indicates skipped
        if (habitsOnDate && id in habitsOnDate) {
            // Assuming status 2 means skipped (adjust according to your status codes)
            if (habitsOnDate[id] < 1) { // Replace 2 with your actual "skipped" status value
                amount++;
            }
        }
    }
    
    return amount;
}
function getDoneAmount(id) {
    let amount = 0;
    
    // Iterate through all dates in habitsByDate
    for (const date in AppData.habitsByDate) {
        const habitsOnDate = AppData.habitsByDate[date];
        
        // Check if the habit exists for this date and if its status indicates skipped
        if (habitsOnDate && id in habitsOnDate) {
            // Assuming status 2 means skipped (adjust according to your status codes)
            if (habitsOnDate[id] === 1) { // Replace 2 with your actual "skipped" status value
                amount++;
            }
            else if(habitsOnDate[id] < 1)amount = 0;
        }
    }
    
    return amount;
}
function getDaysAmount(id) {
    let amount = 0;
    
    // Iterate through all dates in habitsByDate
    for (const date in AppData.habitsByDate) {
        const habitsOnDate = AppData.habitsByDate[date];
        
        // Check if the habit exists for this date and if its status indicates skipped
        if (habitsOnDate && id in habitsOnDate) {
            // Assuming status 2 means skipped (adjust according to your status codes)
            if (habitsOnDate[id]) { // Replace 2 with your actual "skipped" status value
                amount++;
            }
        }
    }
    
    return amount;
}
