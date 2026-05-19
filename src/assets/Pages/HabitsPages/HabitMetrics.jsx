import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { allHabits } from '../../Classes/Habit.js'
import { AppData, getHabitPerformPercent, UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { FaChevronLeft, FaChevronRight, FaListUl, FaPencilAlt, FaInfoCircle, FaCrown } from 'react-icons/fa'
import { TbFlame, TbTrophy } from 'react-icons/tb'
import { theme$, lang$, fontSize$, premium$, setPage, habitAccent$ } from '../../StaticClasses/HabitsBus'
import { MdAutoGraph, MdClose } from 'react-icons/md'
import Slider from '@mui/material/Slider';
import { HABITS_ACCENT, HabitOutlineIcon, getHabitCategoryTone } from './HabitVisuals.jsx';

const NEGATIVE_CATEGORY = 'Отказ от вредного';
const NEGATIVE_CATEGORY_EN = 'Bad habits to quit';
const NEGATIVE_TONE = {
    hue: '#D8785E',
    soft: 'rgba(216,120,94,0.18)',
    ring: 'rgba(216,120,94,0.32)',
    glow: 'rgba(216,120,94,0.20)',
    rgb: '216,120,94',
    icon: 'negative'
};

const getFormationProgressTone = (amount) => {
    const p = Math.max(0, Math.min(1, amount || 0));
    const start = { r: 86, g: 98, b: 112 };
    const end = { r: 47, g: 226, b: 125 };
    const eased = p * p * (3 - 2 * p);
    const r = Math.round(start.r + (end.r - start.r) * eased);
    const g = Math.round(start.g + (end.g - start.g) * eased);
    const b = Math.round(start.b + (end.b - start.b) * eased);
    return {
        hue: `rgb(${r},${g},${b})`,
        soft: `rgba(${r},${g},${b},${0.10 + p * 0.18})`,
        ring: `rgba(${r},${g},${b},${0.24 + p * 0.36})`,
        glow: `rgba(${r},${g},${b},${0.14 + p * 0.30})`
    };
};

const isNegativeHabit = (id, habit) => {
    const habitIndex = AppData.choosenHabits.indexOf(Number(id));
    const categoryKey = Array.isArray(habit?.category) ? habit.category[0] : habit?.category;
    return AppData.choosenHabitsTypes[habitIndex] === true || categoryKey === NEGATIVE_CATEGORY || categoryKey === NEGATIVE_CATEGORY_EN;
};

// Исправлено: функция получения всех привычек вынесена за пределы компонента
function getAllHabits() {
    return allHabits.concat(
        (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
    );
}

const HabitMetrics = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fillAmount, setFillAmount] = useState(0.0);
    const [maxStreak, setMaxStreak] = useState(0);
     const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [showInfo, setShowInfo] = useState(false);
    const [showChangeDaysPanel, setShowChangeDaysPanel] = useState(false);
    const [showListOfHabitsPanel, setShowListOfHabitsPanel] = useState(false);
    const [daysCount, setDaysCount] = useState(0);
    const [daysToForm, setDaysToForm] = useState(66);
    const [tempDaysToForm, setTempDaysToForm] = useState(0);
    const [, setAccentVersion] = useState(0);
    const [habitId, setHabitId] = useState(() => (
        AppData.choosenHabits.length > 0 ? AppData.choosenHabits[0] : -1
    ));

    const isLight = theme === 'light' || theme === 'speciallight';
    useEffect(() => {
            const subscription = premium$.subscribe(setHasPremium);
            return () => {
                subscription.unsubscribe();
            }
        }, []);
    // Данные привычек по датам (теперь доступны везде)
    const habitsData = Array.from(Object.values(AppData.habitsByDate));
    const selectedHabit = getAllHabits().find(h => h.id === habitId);
    const categoryKey = selectedHabit?.category?.[0] || 'Здоровье';
    const selectedCategory = selectedHabit?.category?.[langIndex] || '';
    const selectedCategoryTone = getHabitCategoryTone(categoryKey);
    const isSelectedNegative = isNegativeHabit(habitId, selectedHabit);
    const selectedTone = isSelectedNegative ? NEGATIVE_TONE : { ...HABITS_ACCENT, icon: selectedCategoryTone.icon };

    const ui = {
        bg: isLight
            ? `radial-gradient(640px 420px at 86% -8%, rgba(${HABITS_ACCENT.rgb},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${HABITS_ACCENT.rgb},0.1), transparent 66%), #F4F5F7`
            : `radial-gradient(640px 420px at 86% -8%, rgba(${HABITS_ACCENT.rgb},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${HABITS_ACCENT.rgb},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`,
        panel: isLight ? 'rgba(255,255,255,0.66)' : 'rgba(24,28,31,0.50)',
        text: isLight ? '#1D1D1F' : '#F4F5F7',
        sub: isLight ? 'rgba(31,41,55,0.54)' : 'rgba(166,173,184,0.72)',
        accent: selectedTone.hue,
        accentSoft: selectedTone.soft,
        accentRing: selectedTone.ring,
        accentGlow: selectedTone.glow,
        orange: '#D8785E',
        success: '#2FE27D',
        successSoft: 'rgba(47,226,125,0.18)',
        successRing: 'rgba(47,226,125,0.36)',
        negative: NEGATIVE_TONE.hue,
        negativeSoft: NEGATIVE_TONE.soft,
        negativeRing: NEGATIVE_TONE.ring,
        blur: 'blur(26px) saturate(170%)',
        border: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(190,220,235,0.13)'
    };

    useEffect(() => { setTempDaysToForm(daysToForm); }, [daysToForm]);

    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub4 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const sub5 = habitAccent$.subscribe(() => setAccentVersion(v => v + 1));
        return () => { sub1.unsubscribe(); sub4.unsubscribe(); sub5.unsubscribe(); };
    }, []);

    // Логика расчета статистики
    useEffect(() => {
        if (habitId > -1) {
            let maxS = 0; let curS = 0; let tempS = 0;
            const today = new Date().toISOString().split('T')[0];
            
            habitsData.forEach(day => {
                if (habitId in day) {
                    if (day[habitId] > 0) tempS++;
                    else { if (tempS > maxS) maxS = tempS; tempS = 0; }
                }
                if (tempS > maxS) maxS = tempS;
            });
            for (let i = habitsData.length - 2; i >= 0; i--) {
                if (habitId in habitsData[i]) {
                    if (habitsData[i][habitId] > 0) curS++;
                    else break;
                }
            }
            if (AppData.habitsByDate[today]?.[habitId] > 0) curS++;
            setMaxStreak(maxS);
            setCurrentStreak(curS);
            setDaysToForm(AppData.choosenHabitsDaysToForm[AppData.choosenHabits.indexOf(habitId)] || 66);
        }
    }, [habitId, AppData.habitsByDate]);

    useEffect(() => {
        setFillAmount(Math.min(currentStreak / (daysToForm || 66), 1));
    }, [currentStreak, daysToForm]);

    const progressPercent = Math.round(fillAmount * 100);
    const progressTone = getFormationProgressTone(fillAmount);
    const daysLeft = Math.max((daysToForm || 66) - currentStreak, 0);
    const stageLabel = fillAmount >= 1
        ? (langIndex === 0 ? 'Готово' : 'Done')
        : fillAmount >= 0.75
            ? (langIndex === 0 ? 'Почти готово' : 'Almost done')
            : fillAmount >= 0.5
                ? (langIndex === 0 ? 'Половина' : 'Halfway')
                : fillAmount >= 0.25
                    ? (langIndex === 0 ? 'Есть прогресс' : 'Progress')
                    : (langIndex === 0 ? 'Начало' : 'Start');
    const pathLabel = isSelectedNegative
        ? (langIndex === 0 ? 'ЧИСТО' : 'CLEAN')
        : (langIndex === 0 ? 'ПУТЬ' : 'PATH');
    const switchHabitByOffset = (offset) => {
        const habits = AppData.choosenHabits || [];
        if (habits.length < 2) return;
        const currentIndex = Math.max(habits.indexOf(habitId), 0);
        const nextIndex = (currentIndex + offset + habits.length) % habits.length;
        setHabitId(habits[nextIndex]);
    };
    const handleHabitSelectorDragEnd = (_, info) => {
        if (Math.abs(info.offset.x) < 36) return;
        switchHabitByOffset(info.offset.x < 0 ? 1 : -1);
    };
    const selectedHabitIndex = Math.max((AppData.choosenHabits || []).indexOf(habitId), 0);
    const habitsTotal = (AppData.choosenHabits || []).length;
    const habitPositionLabel = habitsTotal > 1 ? `${selectedHabitIndex + 1}/${habitsTotal}` : '';

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            marginTop: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: ui.bg,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            transition: 'all 0.3s ease',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {!hasPremium && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        background: theme === 'dark' ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                        backdropFilter: 'blur(20px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'rgba(159,180,196,0.12)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px',
                        border: '1px solid rgba(159,180,196,0.22)',
                    }}>
                        <FaCrown size={30} color="#9FB4C4" />
                    </div>
                    <div style={{
                        fontSize: '13px', lineHeight: '1.6',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        marginBottom: '24px', maxWidth: '210px',
                    }}>
                        {langIndex === 0 ? 'Откройте полный доступ ко всей статистике' : 'Unlock full access to all statistics'}
                    </div>
                    <button onClick={() => setPage('premium')} style={{
                        fontSize: '15px', fontWeight: '700', color: '#fff',
                        background: '#9FB4C4',
                        border: 'none', borderRadius: '14px',
                        padding: '13px 0', marginBottom: '10px', cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(159,180,196,0.35)',
                        width: '220px',
                    }}>
                        {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
                    </button>
                    <button onClick={() => setPage('MainMenu')} style={{
                        fontSize: '13px', fontWeight: '500',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        background: 'transparent', border: 'none',
                        padding: '8px 20px', cursor: 'pointer',
                    }}>
                        {langIndex === 0 ? '← На главную' : '← Home'}
                    </button>
                </div>
            )}
            <AnimatePresence mode="wait">
                {habitId === -1 ? (
                    <motion.div 
                        key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ marginTop: '40%', padding: '40px', textAlign: 'center' }}
                    >
                        <p style={{ color: ui.sub }}>{langIndex === 0 ? 'Добавьте привычку для анализа' : 'Add a habit to analyze'}</p>
                    </motion.div>
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                        boxSizing: 'border-box',
                        padding: 'calc(env(safe-area-inset-top, 0px) + 14px) 0 calc(132px + env(safe-area-inset-bottom, 0px))',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        overscrollBehavior: 'contain'
                    }}>
                        <div style={{
                            width: 'calc(100% - 56px)',
                            maxWidth: 660,
                            margin: '0 auto 14px',
                            padding: '4px 20px 10px',
                            boxSizing: 'border-box',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                color: ui.text,
                                fontFamily: 'inherit',
                                fontSize: 24,
                                fontWeight: 700,
                                lineHeight: 1.05,
                                opacity: 0.88
                            }}>UltyMyLife</div>
                            <div style={{
                                marginTop: 5,
                                color: ui.sub,
                                fontSize: 8.5,
                                fontWeight: 600,
                                letterSpacing: '0.14em'
                            }}>
                                {langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}
                            </div>
                        </div>

                        <motion.div
                            key={habitId}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.42, ease: [0.4, 0, 0.2, 1] }}
                            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            <div style={selectorShell(ui, isLight)}>
                                <motion.div
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.18}
                                    onDragEnd={handleHabitSelectorDragEnd}
                                    style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', minWidth: 0, touchAction: 'pan-y' }}
                                >
                                    <div style={{
                                        width: 54,
                                        height: 54,
                                        borderRadius: 18,
                                        background: ui.accentSoft,
                                        border: '1px solid transparent',
                                        color: ui.accent,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: `0 12px 24px -22px ${ui.accent}`
                                    }}>
                                        <HabitOutlineIcon iconName={selectedHabit?.iconName} habitName={selectedHabit?.name} categoryKey={isSelectedNegative ? NEGATIVE_CATEGORY : categoryKey} size={26} />
                                    </div>
                                    <div style={{
                                        flex: 1,
                                        minWidth: 0,
                                        minHeight: 66,
                                        position: 'relative',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        cursor: habitsTotal > 1 ? 'grab' : 'default',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}>
                                        <div style={{
                                            color: isSelectedNegative ? NEGATIVE_TONE.hue : ui.accent,
                                            fontSize: 11,
                                            fontWeight: 900,
                                            lineHeight: 1.15,
                                            marginBottom: 7,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            textAlign: 'left'
                                        }}>
                                            {isSelectedNegative ? (langIndex === 0 ? NEGATIVE_CATEGORY : NEGATIVE_CATEGORY_EN) : selectedCategory}
                                        </div>
                                        <div style={{
                                            color: ui.text,
                                            fontSize: 19,
                                            fontWeight: 950,
                                            lineHeight: 1.12,
                                            overflow: 'hidden',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: 'vertical',
                                            textAlign: 'left'
                                        }}>
                                            {selectedHabit?.name?.[langIndex]}
                                        </div>
                                    </div>
                                </motion.div>

                                <div style={selectorControlBar(ui, isLight)}>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => switchHabitByOffset(-1)}
                                        disabled={habitsTotal < 2}
                                        style={selectorArrowButton(ui, isLight)}
                                    >
                                        <FaChevronLeft size={12} />
                                    </motion.button>
                                    <div style={{
                                        minWidth: 0,
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                        minHeight: 32,
                                        padding: '0 4px',
                                        boxSizing: 'border-box'
                                    }}>
                                        {habitPositionLabel && (
                                            <span style={{
                                                color: ui.sub,
                                                fontSize: 11,
                                                fontWeight: 850,
                                                lineHeight: 1,
                                                whiteSpace: 'nowrap',
                                                fontVariantNumeric: 'tabular-nums'
                                            }}>
                                                <span style={{ color: ui.accent, fontWeight: 950 }}>{selectedHabitIndex + 1}</span>
                                                <span style={{ color: ui.sub, opacity: 0.72 }}> {langIndex === 0 ? 'из' : 'of'} </span>
                                                <span>{habitsTotal}</span>
                                            </span>
                                        )}
                                        <span style={{
                                            minWidth: 82,
                                            height: 31,
                                            borderRadius: 999,
                                            background: isLight
                                                ? `linear-gradient(145deg, rgba(255,255,255,0.78), rgba(${HABITS_ACCENT.rgb},0.32))`
                                                : `linear-gradient(145deg, rgba(${HABITS_ACCENT.rgb},0.44), rgba(${HABITS_ACCENT.rgb},0.18))`,
                                            border: `1px solid rgba(${HABITS_ACCENT.rgb},0.58)`,
                                            color: ui.text,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 5,
                                            padding: '0 10px',
                                            boxSizing: 'border-box',
                                            whiteSpace: 'nowrap',
                                            boxShadow: `0 1px 0 rgba(255,255,255,0.14) inset, 0 12px 24px -16px rgba(${HABITS_ACCENT.rgb},0.70)`,
                                            backdropFilter: ui.blur,
                                            WebkitBackdropFilter: ui.blur
                                        }}>
                                            <span style={{ fontSize: 15, fontWeight: 950, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{progressPercent}%</span>
                                            <span style={{ color: ui.sub, fontSize: 8.5, fontWeight: 950, lineHeight: 1, letterSpacing: '0.08em' }}>{pathLabel}</span>
                                        </span>
                                    </div>
                                    <motion.button
                                        type="button"
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => switchHabitByOffset(1)}
                                        disabled={habitsTotal < 2}
                                        style={selectorArrowButton(ui, isLight)}
                                    >
                                        <FaChevronRight size={12} />
                                    </motion.button>
                                </div>

                                <div style={{ width: '100%' }}>
                                    <div style={{
                                        height: 6,
                                        borderRadius: 999,
                                        background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)',
                                        overflow: 'hidden'
                                    }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            style={{ height: '100%', borderRadius: 999, background: ui.accent }}
                                        />
                                    </div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                        gap: 7,
                                        marginTop: 9
                                    }}>
                                        <div style={heroMiniChip(ui, isLight)}>
                                            <span style={heroMiniLabel(ui)}>{langIndex === 0 ? 'Цель' : 'Goal'}</span>
                                            <span style={heroMiniValue(ui)}>{daysToForm}</span>
                                        </div>
                                        <div style={heroMiniChip(ui, isLight)}>
                                            <span style={heroMiniLabel(ui)}>{langIndex === 0 ? 'Осталось' : 'Left'}</span>
                                            <span style={heroMiniValue(ui)}>{daysLeft}</span>
                                        </div>
                                        <div style={heroMiniChip(ui, isLight)}>
                                            <span style={heroMiniLabel(ui)}>{langIndex === 0 ? 'Этап' : 'Stage'}</span>
                                            <span style={{ ...heroMiniValue(ui), fontSize: 11 }}>{stageLabel}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={sectionWidth}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14 }}>
                                    <div style={{ ...statCard(ui, isLight), ...recordStatGlow(isLight) }}>
                                        <TbTrophy style={{ position: 'absolute', right: -9, bottom: -9, fontSize: 58, color: '#F6C95C', opacity: 0.24 }} strokeWidth={1.7} />
                                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', color: '#F6C95C' }}>{langIndex === 0 ? 'РЕКОРД' : 'RECORD'}</span>
                                        <span style={{ fontSize: 28, fontWeight: 950, color: ui.text, lineHeight: 1 }}>{maxStreak}</span>
                                        <span style={{ fontSize: 10.5, fontWeight: 750, color: ui.sub }}>{langIndex === 0 ? 'лучшая серия' : 'best streak'}</span>
                                    </div>
                                    <div style={{ ...statCard(ui, isLight), ...currentStatGlow(isLight) }}>
                                        <TbFlame style={{ position: 'absolute', right: -7, bottom: -10, fontSize: 62, color: '#FF5C45', opacity: 0.25 }} strokeWidth={1.65} />
                                        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', color: '#FF7A5A' }}>{langIndex === 0 ? 'ТЕКУЩАЯ' : 'CURRENT'}</span>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 28, fontWeight: 950, color: ui.text, lineHeight: 1 }}>
                                            {currentStreak}
                                            <TbFlame size={18} color="#FF765C" strokeWidth={2.5} />
                                        </span>
                                        <span style={{ fontSize: 10.5, fontWeight: 750, color: ui.sub }}>{langIndex === 0 ? 'сейчас' : 'now'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={progressPanel(ui, isLight)}>
                                <div style={{
                                    position: 'absolute',
                                    right: -60,
                                    top: -70,
                                    width: 190,
                                    height: 190,
                                    borderRadius: '50%',
                                    background: `radial-gradient(circle, ${progressTone.glow} 0%, transparent 66%)`,
                                    pointerEvents: 'none'
                                }} />
                                <div style={{ position: 'relative', width: 164, height: 164, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ position: 'absolute', width: 104, height: 104, background: progressTone.hue, filter: 'blur(48px)', opacity: isLight ? 0.12 : 0.18 }} />
                                    <svg width="176" height="176" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle stroke={isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)'} fill="none" strokeWidth="11" r="60" cx="75" cy="75" />
                                        <motion.circle 
                                            initial={{ strokeDashoffset: 377 }}
                                            animate={{ strokeDashoffset: 377 - (fillAmount * 377) }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            stroke={progressTone.hue}
                                            fill="none" strokeWidth="11" r="60" cx="75" cy="75" strokeDasharray="377" strokeLinecap="round"
                                            style={{ filter: `drop-shadow(0 0 10px ${progressTone.glow})` }}
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <span style={{ fontSize: 34, fontWeight: 950, color: ui.text, lineHeight: 1 }}>{Math.round(fillAmount * 100)}%</span>
                                        <div style={{ marginTop: 6, fontSize: 10, color: ui.sub, fontWeight: 900, letterSpacing: '0.06em' }}>{langIndex === 0 ? 'ГОТОВО' : 'DONE'}</div>
                                    </div>
                                </div>
                                <div style={{ position: 'relative', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
                                    {[
                                        { value: 0, label: langIndex === 0 ? 'Начало' : 'Start' },
                                        { value: 0.5, label: langIndex === 0 ? 'Половина' : 'Half' },
                                        { value: 1, label: langIndex === 0 ? 'Готово' : 'Done' }
                                    ].map((item) => {
                                        const active = fillAmount >= item.value;
                                        return (
                                            <div key={item.label} style={{
                                                minHeight: 38,
                                                borderRadius: 14,
                                                border: '1px solid transparent',
                                                background: active ? ui.accentSoft : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.03)'),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: 6,
                                                color: active ? ui.accent : ui.sub,
                                                fontSize: 10.5,
                                                fontWeight: 900,
                                                boxSizing: 'border-box'
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: 99, background: active ? ui.accent : ui.sub, opacity: active ? 1 : 0.45 }} />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <div style={timelineWrap(ui, isLight)}>
                                        {getHabitStatusElements(daysCount, AppData.habitsByDate, habitId, isLight, ui, isSelectedNegative)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={periodPill(ui, isLight)}>
                                            <FaChevronLeft size={10} color={ui.text} onClick={() => setDaysCount(prev => prev > 0 ? prev - 1 : 2)} />
                                            <span style={{ fontSize: 12, fontWeight: 900, color: ui.text }}>{daysCountText(langIndex, daysCount)}</span>
                                            <FaChevronRight size={10} color={ui.text} onClick={() => setDaysCount(prev => prev < 2 ? prev + 1 : 0)} />
                                        </div>
                                        <span style={{ fontSize: 11, color: ui.sub, fontWeight: 800 }}>{langIndex === 0 ? 'Сегодня' : 'Today'}</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ ...sectionWidth, marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowInfo(true)} style={actionCard(ui, isLight)}>
                                    <FaInfoCircle size={17} color={ui.accent} />
                                    <span style={{ fontSize: 12, fontWeight: 850, color: ui.text }}>{langIndex === 0 ? 'Инфо' : 'Info'}</span>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowListOfHabitsPanel(true)} style={actionCard(ui, isLight)}>
                                    <FaListUl size={17} color={ui.sub} />
                                    <span style={{ fontSize: 12, fontWeight: 850, color: ui.text }}>{langIndex === 0 ? 'Список' : 'List'}</span>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowChangeDaysPanel(true)} style={actionCard(ui, isLight)}>
                                    <FaPencilAlt size={15} color={ui.accent} />
                                    <div style={{ textAlign: 'left', lineHeight: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 900, color: ui.text }}>{daysToForm}</div>
                                        <div style={{ fontSize: 8.5, color: ui.sub, fontWeight: 800 }}>{langIndex === 0 ? 'ДНЕЙ' : 'DAYS'}</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* --- MODALS --- */}
            <AnimatePresence>
                {showListOfHabitsPanel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={() => setShowListOfHabitsPanel(false)}>
                        <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                width: '84%',
                                maxWidth: 430,
                                background: isLight
                                    ? `radial-gradient(260px 180px at 92% 6%, ${ui.accent}14 0%, transparent 66%), rgba(255,255,255,0.94)`
                                    : `radial-gradient(260px 180px at 92% 6%, ${ui.accent}18 0%, transparent 66%), rgba(20,23,25,0.94)`,
                                backdropFilter: 'blur(30px)',
                                padding: 'calc(env(safe-area-inset-top, 0px) + 28px) 18px 28px',
                                overflowY: 'auto',
                                borderLeft: '1px solid transparent',
                                boxShadow: '-24px 0 80px rgba(0,0,0,0.36)',
                                boxSizing: 'border-box'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 22 }}>
                                <span style={{ fontSize: 22, fontWeight: 950, color: ui.text }}>{langIndex === 0 ? 'Привычки' : 'Habits'}</span>
                                <MdClose size={28} color={ui.sub} onClick={() => setShowListOfHabitsPanel(false)} style={{cursor:'pointer'}} />
                            </div>
                            {AppData.choosenHabits.map((id) => {
                                const habit = getAllHabits().find(h => h.id === id);
                                const categoryTone = getHabitCategoryTone(habit?.category?.[0]);
                                const isHabitNegative = isNegativeHabit(id, habit);
                                const tone = isHabitNegative ? NEGATIVE_TONE : { ...HABITS_ACCENT, icon: categoryTone.icon };
                                const active = habitId === id;

                                return (
                                    <motion.div key={id} whileTap={{ scale: 0.98 }} onClick={() => { setHabitId(id); setShowListOfHabitsPanel(false); }}
                                        style={{
                                            minHeight: 58,
                                            padding: '10px 12px',
                                            borderRadius: 18,
                                            marginBottom: 10,
                                            background: active ? tone.soft : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.035)'),
                                            border: '1px solid transparent',
                                            color: ui.text,
                                            fontWeight: 800,
                                            display: 'flex',
                                            gap: 10,
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            boxSizing: 'border-box'
                                        }}>
                                        <div style={{
                                            width: 36,
                                            height: 36,
                                            borderRadius: 12,
                                            background: tone.soft,
                                            border: '1px solid transparent',
                                            color: tone.hue,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            <HabitOutlineIcon iconName={habit?.iconName} habitName={habit?.name} categoryKey={isHabitNegative ? NEGATIVE_CATEGORY : habit?.category?.[0]} size={18} />
                                        </div>
                                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit?.name[langIndex]}</span>
                                        <span style={{ color: tone.hue, fontWeight: 950, fontVariantNumeric: 'tabular-nums' }}>{getHabitPerformPercent(id)}%</span>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                )}

                {showInfo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...overlayStyle, justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setShowInfo(false)}>
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{
                                ...bottomSheetStyle,
                                background: isLight
                                    ? `radial-gradient(260px 180px at 92% 6%, ${ui.accent}12 0%, transparent 66%), rgba(255,255,255,0.95)`
                                    : `radial-gradient(260px 180px at 92% 6%, ${ui.accent}18 0%, transparent 66%), rgba(20,23,25,0.96)`,
                                backdropFilter: ui.blur
                            }} onClick={e => e.stopPropagation()}>
                            <div style={dragHandle} />
                            <div style={{ padding: '20px 25px 60px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <MdAutoGraph size={24} color={ui.accent} />
                                    <h3 style={{ margin: 0, color: ui.text }}>{langIndex === 0 ? 'Инсайты' : 'Insights'}</h3>
                                </div>
                                <p style={{ color: ui.text, fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{infoTextLong(langIndex, habitId)}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showChangeDaysPanel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...overlayStyle, justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setShowChangeDaysPanel(false)}>
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 165 }}
                            style={{
                                ...bottomSheetStyle,
                                background: isLight
                                    ? `radial-gradient(280px 190px at 88% 0%, ${ui.accent}18 0%, transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))`
                                    : `radial-gradient(280px 190px at 88% 0%, ${ui.accent}22 0%, transparent 68%), linear-gradient(145deg, rgba(35,46,56,0.74), rgba(12,17,21,0.74))`,
                                border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(190,220,235,0.18)'}`,
                                boxShadow: isLight
                                    ? '0 1px 0 rgba(255,255,255,0.80) inset, 0 -24px 70px -42px rgba(15,23,42,0.34)'
                                    : '0 1px 0 rgba(255,255,255,0.10) inset, 0 -28px 82px -42px rgba(0,0,0,0.84)',
                                backdropFilter: ui.blur,
                                WebkitBackdropFilter: ui.blur,
                                textAlign: 'center',
                                padding: '12px 28px 28px',
                                boxSizing: 'border-box'
                            }} onClick={e => e.stopPropagation()}
                        >
                            <div style={dragHandle} />
                            <h3 style={{ color: ui.text, margin: '10px 0 18px', fontSize: 20, fontWeight: 950 }}>{langIndex === 0 ? 'Срок формирования' : 'Formation period'}</h3>
                            <div style={{
                                borderRadius: 24,
                                border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(190,220,235,0.10)'}`,
                                background: isLight ? 'rgba(255,255,255,0.44)' : 'rgba(255,255,255,0.045)',
                                padding: '22px 18px 16px',
                                boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset',
                                marginBottom: 16
                            }}>
                                <div style={{ fontSize: '32px', fontWeight: '950', color: ui.text, marginBottom: 14 }}>{tempDaysToForm} {langIndex === 0 ? 'дней' : 'days'}</div>
                                <Slider min={21} max={180} value={tempDaysToForm} onChange={(e, v) => setTempDaysToForm(v)}
                                    sx={{
                                        color: ui.accent,
                                        '& .MuiSlider-rail': { opacity: 0.22 },
                                        '& .MuiSlider-track': { boxShadow: `0 0 18px ${ui.accentGlow}` },
                                        '& .MuiSlider-thumb': { width: 22, height: 22, boxShadow: `0 0 0 6px ${ui.accentSoft}` }
                                    }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button style={modalBtnStyle(isLight)} onClick={() => setShowChangeDaysPanel(false)}>{langIndex === 0 ? 'Отмена' : 'Cancel'}</button>
                                <button style={{ ...modalBtnStyle(isLight), background: `linear-gradient(145deg, ${ui.accent}, rgba(${HABITS_ACCENT.rgb},0.78))`, color: '#FFF', border: `1px solid ${ui.accentRing}`, boxShadow: `0 1px 0 rgba(255,255,255,0.22) inset, 0 16px 32px -24px ${ui.accent}` }} onClick={() => {
                                    const idx = AppData.choosenHabits.indexOf(habitId);
                                    if (idx !== -1) AppData.choosenHabitsDaysToForm[idx] = tempDaysToForm;
                                    setDaysToForm(tempDaysToForm); setShowChangeDaysPanel(false);
                                }}>{langIndex === 0 ? 'Сохранить' : 'Save'}</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Стили
const sectionWidth = {
    width: 'calc(100% - 56px)',
    maxWidth: 660,
    margin: '0 auto',
    boxSizing: 'border-box'
};

const selectorShell = (ui, isLight) => ({
    ...sectionWidth,
    minHeight: 190,
    borderRadius: 24,
    padding: '16px',
    background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.42) 100%)`
        : `linear-gradient(145deg, rgba(23,27,31,0.68) 0%, rgba(255,255,255,0.026) 100%)`,
    border: `1px solid ${ui.border}`,
    boxShadow: isLight
        ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
        : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)',
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
    boxSizing: 'border-box'
});

const selectorControlBar = (ui, isLight) => ({
    minHeight: 42,
    borderRadius: 18,
    padding: '5px 7px',
    background: isLight
        ? `radial-gradient(180px 70px at 50% 0%, rgba(${HABITS_ACCENT.rgb},0.22), transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.36))`
        : `radial-gradient(220px 80px at 50% 0%, rgba(${HABITS_ACCENT.rgb},0.32), transparent 70%), linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.045))`,
    border: `1px solid ${isLight ? `rgba(${HABITS_ACCENT.rgb},0.34)` : `rgba(${HABITS_ACCENT.rgb},0.48)`}`,
    boxShadow: `0 1px 0 rgba(255,255,255,0.08) inset, 0 18px 32px -24px rgba(${HABITS_ACCENT.rgb},0.44)`,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxSizing: 'border-box',
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur
});

const selectorArrowButton = (ui, isLight) => ({
    width: 34,
    height: 32,
    borderRadius: 13,
    border: `1px solid rgba(${HABITS_ACCENT.rgb},${isLight ? 0.26 : 0.34})`,
    background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.76), rgba(${HABITS_ACCENT.rgb},0.14))`
        : `linear-gradient(145deg, rgba(${HABITS_ACCENT.rgb},0.20), rgba(255,255,255,0.05))`,
    color: ui.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    cursor: 'pointer',
    outline: 'none',
    WebkitTapHighlightColor: 'transparent',
    flexShrink: 0,
    boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset'
});

const heroMiniChip = (ui, isLight) => ({
    minWidth: 0,
    minHeight: 42,
    borderRadius: 14,
    padding: '7px 8px',
    background: isLight ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.046)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(190,220,235,0.075)'}`,
    boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxSizing: 'border-box',
    overflow: 'hidden'
});

const heroMiniLabel = (ui) => ({
    color: ui.sub,
    fontSize: 8.5,
    fontWeight: 900,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
});

const heroMiniValue = (ui) => ({
    color: ui.text,
    fontSize: 13,
    fontWeight: 950,
    lineHeight: 1.1,
    marginTop: 4,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
});

const statCard = (ui, isLight) => ({
    minHeight: 94,
    background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.66), rgba(255,255,255,0.34))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.058), rgba(255,255,255,0.022))',
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur,
    padding: '16px 14px',
    borderRadius: 22,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    position: 'relative',
    overflow: 'hidden',
    border: `1px solid ${ui.border}`,
    boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.72) inset, 0 16px 34px -28px rgba(15,23,42,0.20)' : '0 1px 0 rgba(255,255,255,0.07) inset, 0 18px 36px -30px rgba(0,0,0,0.70)'
});

const recordStatGlow = (isLight) => ({
    background: isLight
        ? 'radial-gradient(130px 100px at 70% 28%, rgba(246,201,92,0.20), transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.70), rgba(255,255,255,0.34))'
        : 'radial-gradient(140px 105px at 72% 28%, rgba(246,201,92,0.22), transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.06), rgba(255,255,255,0.024))',
    border: '1px solid rgba(246,201,92,0.28)',
    boxShadow: isLight
        ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 34px -26px rgba(246,201,92,0.34)'
        : '0 1px 0 rgba(255,255,255,0.08) inset, 0 22px 40px -28px rgba(246,201,92,0.42)'
});

const currentStatGlow = (isLight) => ({
    background: isLight
        ? 'radial-gradient(140px 105px at 72% 30%, rgba(255,92,69,0.22), transparent 68%), linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.32))'
        : 'radial-gradient(150px 110px at 74% 30%, rgba(255,92,69,0.28), transparent 68%), linear-gradient(145deg, rgba(255,92,69,0.12), rgba(255,255,255,0.024))',
    border: '1px solid rgba(255,92,69,0.34)',
    boxShadow: isLight
        ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 34px -26px rgba(255,92,69,0.36)'
        : '0 1px 0 rgba(255,255,255,0.08) inset, 0 22px 40px -28px rgba(255,92,69,0.50)'
});

const progressPanel = (ui, isLight) => ({
    ...sectionWidth,
    marginTop: 14,
    padding: '22px 18px 18px',
    borderRadius: 28,
    background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.68), rgba(255,255,255,0.36))'
        : `radial-gradient(260px 190px at 50% 10%, ${ui.accent}10 0%, transparent 72%), linear-gradient(145deg, rgba(23,27,31,0.68), rgba(255,255,255,0.024))`,
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 18,
    boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.72) inset, 0 16px 38px -34px rgba(15,23,42,0.28)' : '0 1px 0 rgba(255,255,255,0.08) inset, 0 18px 42px -34px rgba(0,0,0,0.75)',
    border: `1px solid ${ui.border}`,
    boxSizing: 'border-box',
    position: 'relative',
    overflow: 'hidden'
});

const periodPill = (ui, isLight) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    minHeight: 31,
    background: isLight ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.055)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(190,220,235,0.08)'}`,
    padding: '0 12px',
    borderRadius: 999
});

const timelineWrap = (ui, isLight) => ({
    display: 'flex',
    width: '100%',
    minHeight: 20,
    gap: 5,
    marginBottom: 13,
    padding: 3,
    borderRadius: 999,
    background: isLight ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.045)',
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(190,220,235,0.075)'}`,
    boxSizing: 'border-box'
});

const actionCard = (ui, isLight) => ({
    minHeight: 52,
    background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.045)',
    backdropFilter: ui.blur,
    WebkitBackdropFilter: ui.blur,
    padding: '0 10px',
    borderRadius: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    cursor: 'pointer',
    border: `1px solid ${ui.border}`,
    boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.72) inset, 0 12px 24px -24px rgba(15,23,42,0.20)' : '0 1px 0 rgba(255,255,255,0.06) inset, 0 14px 28px -26px rgba(0,0,0,0.68)',
    minWidth: 0
});

const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(14px) saturate(135%)', WebkitBackdropFilter: 'blur(14px) saturate(135%)', zIndex: 7000, display: 'flex' };
const bottomSheetStyle = { width: '100%', borderRadius: '34px 34px 0 0', maxHeight: '80vh', overflowY: 'auto', border: '1px solid transparent' };
const dragHandle = { width: '42px', height: '5px', backgroundColor: '#8E8E93', borderRadius: '3px', margin: '6px auto 12px', opacity: 0.38 };
const modalBtnStyle = (isLight = false) => ({
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : 'rgba(190,220,235,0.09)'}`,
    fontWeight: 900,
    fontSize: 15,
    background: isLight ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.055)',
    color: isLight ? '#1D1D1F' : '#F4F5F7',
    cursor: 'pointer',
    boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset'
});

function getHabitStatusElements(daysCount, habitsByDate, habitId, isLight, ui, isNegative = false) {
    const daysMapping = [7, 30, 90];
    const numberOfDays = daysMapping[daysCount] ?? 7;
    const items = [];
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];
    for (let i = numberOfDays - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const val = habitsByDate[dateStr]?.[habitId];
        const isToday = dateStr === todayKey;
        const isDone = val > 0;
        const isMissed = val <= 0 && val !== undefined;
        const doneColor = isNegative ? (ui?.negative || '#D8785E') : (ui?.success || '#C4D3DE');
        const doneSoft = isNegative ? (ui?.negativeSoft || 'rgba(216,120,94,0.18)') : (ui?.successSoft || 'rgba(196,211,222,0.14)');
        const statusColor = isDone ? doneColor : isMissed ? '#D8785E' : (isLight ? 'rgba(15,23,42,0.2)' : 'rgba(255,255,255,0.18)');
        const fill = isDone
            ? `linear-gradient(135deg, ${doneColor}, rgba(255,255,255,0.18))`
            : isMissed
                ? 'linear-gradient(135deg, #D8785E, rgba(255,255,255,0.12))'
                : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)');

        items.push(
            <motion.div
                key={dateStr}
                initial={{ opacity: 0, scaleX: 0.75 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.22, delay: Math.min(i, 12) * 0.012 }}
                style={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: 14,
                    borderRadius: 999,
                    padding: 2,
                    background: isToday ? (isDone ? doneSoft : (ui?.accentSoft || HABITS_ACCENT.soft)) : (isLight ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.025)'),
                    border: '1px solid transparent',
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                    transformOrigin: 'center'
                }}
            >
                <div style={{
                    width: '100%',
                    height: '100%',
                    minHeight: 8,
                    borderRadius: 999,
                    background: fill,
                    boxShadow: isDone || isMissed ? `0 10px 18px -16px ${statusColor}` : 'none',
                    opacity: val === undefined ? 0.72 : 1
                }} />
            </motion.div>
        );
    }
    return items;
}

function interpolateColor(color1, color2, factor) {
    const hex = (x) => x.toString(16).padStart(2, '0');
    const r = Math.ceil(parseInt(color1.substring(1,3), 16) * (1 - factor) + parseInt(color2.substring(1,3), 16) * factor);
    const g = Math.ceil(parseInt(color1.substring(3,5), 16) * (1 - factor) + parseInt(color2.substring(3,5), 16) * factor);
    const b = Math.ceil(parseInt(color1.substring(5,7), 16) * (1 - factor) + parseInt(color2.substring(5,7), 16) * factor);
    return `#${hex(r)}${hex(g)}${hex(b)}`;
}

const infoTextLong = (lang, habitId) => {
    const habit = getAllHabits().find(h => h.id === habitId);
    const isNegative = isNegativeHabit(habitId, habit);

    if (isNegative) {
        // --- TEXT FOR BREAKING BAD HABITS ---
        return lang === 0 
            ? 'Избавление от привычки — это перестройка дофаминовых путей. Мозг будет сопротивляться, требуя «награды», но каждый день воздержания физически ослабляет старую нейронную связь. Срыв — это не конец, а часть процесса. Полная перестройка занимает около 90 дней.' 
            : 'Breaking a habit means rewiring your dopamine pathways. Your brain will resist and crave the old reward, but every day you abstain physically weakens that old neural connection. A slip-up is not a failure, but part of the process. Full rewiring usually takes about 90 days.';
    } else {
        // --- TEXT FOR BUILDING NEW HABITS ---
        return lang === 0 
            ? 'Формирование привычки — это создание новой «дороги» в мозге. Исследования UCL показывают, что автоматизм наступает в среднем через 66 дней. Сначала требуется сила воли, но регулярность превращает усилие в рефлекс. Пропущенный день не обнуляет прогресс, если вы сразу вернетесь в строй.' 
            : 'Forming a habit is like building a new highway in your brain. UCL research shows it takes an average of 66 days to reach automaticity. At first, it requires willpower, but consistency turns effort into reflex. Missing one day does not reset your progress, as long as you get back on track immediately.';
    }
};
const daysCountText = (lang, count) => [['Неделя', 'Месяц', 'Квартал'], ['Week', 'Month', 'Quarter']][lang][count];
const getHabitRangeStartLabel = (daysCount) => {
    const d = new Date(); d.setDate(d.getDate() - [7, 30, 90][daysCount]);
    return `${d.getDate()}.${d.getMonth() + 1}`;
}
const setStartingInfo = (lang) => lang === 0 ? 'Добавьте привычку для анализа' : 'Add a habit to analyze';

export default HabitMetrics;
