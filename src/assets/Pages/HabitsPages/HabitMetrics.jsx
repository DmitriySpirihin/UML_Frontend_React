import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { allHabits } from '../../Classes/Habit.js'
import { AppData, getHabitPerformPercent, UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { FaChevronLeft, FaChevronRight, FaListUl, FaPencilAlt, FaInfoCircle, FaTrophy, FaFire } from 'react-icons/fa'
import { theme$, lang$, fontSize$, premium$, setPage } from '../../StaticClasses/HabitsBus'
import { MdAutoGraph, MdClose } from 'react-icons/md'
import Slider from '@mui/material/Slider';

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
    const [habitId, setHabitId] = useState(() => (
        AppData.choosenHabits.length > 0 ? AppData.choosenHabits[0] : -1
    ));

    const isLight = theme === 'light' || theme === 'speciallight';
    const drumRef = useRef(null);
    useEffect(() => {
            const subscription = premium$.subscribe(setHasPremium);
            return () => {
                subscription.unsubscribe();
            }
        }, []);
    // Данные привычек по датам (теперь доступны везде)
    const habitsData = Array.from(Object.values(AppData.habitsByDate));

    const ui = {
        bg: isLight ? '#F2F4F7' : Colors.get('background', theme),
        panel: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(28,28,30,0.6)',
        text: isLight ? '#000000' : '#FFFFFF',
        sub: isLight ? '#8E8E93' : '#98989E',
        accent: '#007AFF',
        orange: '#FF9500',
        blur: 'blur(25px)',
        border: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'
    };

    useEffect(() => { setTempDaysToForm(daysToForm); }, [daysToForm]);

    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub4 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        return () => { sub1.unsubscribe(); sub4.unsubscribe(); };
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

    const handleDrumScroll = (e) => {
        const itemHeight = 40;
        const index = Math.round(e.target.scrollTop / itemHeight);
        const selectedId = AppData.choosenHabits[index];
        if (selectedId !== undefined && selectedId !== habitId) setHabitId(selectedId);
    };

    const radius = 60;
    const circumference = 2 * Math.PI * radius;

    return (
        <div style={{
            width: '100vw', height: '98vh',marginTop:'25px', display: "flex", flexDirection: "column",
            alignItems: "center", backgroundColor: ui.bg, transition: 'all 0.3s ease',
            overflow: 'hidden', position: 'relative'
        }}>
            {!hasPremium && (
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
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
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8vh' }}>
                        
                        {/* --- DRUM PICKER --- */}
                        <div style={{ 
                            width: '100%', height: '100px', position: 'relative', display: 'flex', justifyContent: 'center',
                            maskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 40%, black 60%, transparent)',
                        }}>
                            <div onScroll={handleDrumScroll} style={{ width: '80%', overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                <div style={{ height: '30px' }} />
                                {AppData.choosenHabits.map((id) => (
                                    <div key={id} style={{ height: '40px', scrollSnapAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ fontSize: habitId === id ? '22px' : '17px', fontWeight: habitId === id ? '800' : '500', color: habitId === id ? ui.text : ui.sub, transition: '0.2s all' }}>
                                            {getAllHabits().find(h => h.id === id)?.name[langIndex]}
                                        </span>
                                    </div>
                                ))}
                                <div style={{ height: '30px' }} />
                            </div>
                        </div>

                        {/* --- ПЛАВНЫЙ КОНТЕНТ --- */}
                        <motion.div 
                            key={habitId}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                        >
                            {/* ВИДЖЕТЫ */}
                            <div style={{ width: '90%', display: 'flex', gap: '12px', margin: '20px 0' }}>
                                <div style={{ ...statCard(ui), border: `1px solid ${ui.accent}30`, boxShadow: isLight ? 'none' : `0 0 15px ${ui.accent}15` }}>
                                    <FaTrophy style={{ position: 'absolute', right: '-5px', bottom: '-5px', fontSize: '45px', color: ui.accent, opacity: 0.1 }} />
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: ui.accent }}>{langIndex === 0 ? 'РЕКОРД' : 'RECORD'}</span>
                                    <span style={{ fontSize: '28px', fontWeight: '900', color: ui.text }}>{maxStreak}</span>
                                </div>
                                <div style={{ ...statCard(ui), border: `1px solid ${ui.orange}30`, boxShadow: isLight ? 'none' : `0 0 15px ${ui.orange}15` }}>
                                    <FaFire style={{ position: 'absolute', right: '-5px', bottom: '-5px', fontSize: '50px', color: ui.orange, opacity: 0.1 }} />
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: ui.orange }}>{langIndex === 0 ? 'ТЕКУЩАЯ' : 'CURRENT'}</span>
                                    <span style={{ fontSize: '28px', fontWeight: '900', color: ui.text }}>{currentStreak}</span>
                                </div>
                            </div>

                            {/* КРУГ ПРОГРЕССА */}
                            <div style={{ width: '90%', padding: '30px 20px', borderRadius: '32px', backgroundColor: ui.panel, backdropFilter: ui.blur, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)', border: `1px solid ${ui.border}` }}>
                                <div style={{ position: 'relative', width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <div style={{ position: 'absolute', width: '100px', height: '100px', backgroundColor: interpolateColor('#FF3B30', '#34C759', fillAmount), filter: 'blur(50px)', opacity: 0.1 }} />
                                    <svg width="190" height="170" viewBox="0 0 150 150" style={{ transform: 'rotate(-90deg)' }}>
                                        <circle stroke={ui.border} fill="none" strokeWidth="12" r="60" cx="75" cy="75" />
                                        <motion.circle 
                                            initial={{ strokeDashoffset: 377 }} animate={{ strokeDashoffset: 377 - (fillAmount * 377) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            stroke={interpolateColor('#FF3B30', '#34C759', fillAmount)}
                                            fill="none" strokeWidth="12" r="60" cx="75" cy="75" strokeDasharray="377" strokeLinecap="round"
                                        />
                                    </svg>
                                    <div style={{ position: 'absolute', textAlign: 'center' }}>
                                        <span style={{ fontSize: '38px', fontWeight: '900', color: ui.text }}>{Math.round(fillAmount * 100)}%</span>
                                        <div style={{ fontSize: '10px', color: ui.sub, fontWeight: '800' }}>{langIndex === 0 ? 'ГОТОВО' : 'DONE'}</div>
                                    </div>
                                </div>
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', width: '100%', height: '12px', gap: '4px', marginBottom: '12px' }}>
                                        {getHabitStatusElements(daysCount, AppData.habitsByDate, habitId, isLight)}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: ui.border, padding: '6px 12px', borderRadius: '15px' }}>
                                            <FaChevronLeft size={10} color={ui.text} onClick={() => setDaysCount(prev => prev > 0 ? prev - 1 : 2)} />
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: ui.text }}>{daysCountText(langIndex, daysCount)}</span>
                                            <FaChevronRight size={10} color={ui.text} onClick={() => setDaysCount(prev => prev < 2 ? prev + 1 : 0)} />
                                        </div>
                                        <span style={{ fontSize: '11px', color: ui.sub, fontWeight: '700' }}>Сегодня</span>
                                    </div>
                                </div>
                            </div>

                            {/* --- НИЖНИЕ КНОПКИ В РЯД --- */}
                            <div style={{ width: '90%', marginTop: '20px', display: 'flex', gap: '10px' }}>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowInfo(true)} style={actionCard(ui)}>
                                    <FaInfoCircle size={18} color={ui.accent} />
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: ui.text }}>{langIndex === 0 ? 'Инфо' : 'Info'}</span>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowListOfHabitsPanel(true)} style={actionCard(ui)}>
                                    <FaListUl size={18} color={ui.text} />
                                    <span style={{ fontSize: '12px', fontWeight: '800', color: ui.text }}>{langIndex === 0 ? 'Список' : 'List'}</span>
                                </motion.div>
                                <motion.div whileTap={{ scale: 0.95 }} onClick={() => setShowChangeDaysPanel(true)} style={actionCard(ui)}>
                                    <FaPencilAlt size={16} color={ui.accent} />
                                    <div style={{ textAlign: 'left', lineHeight: '1' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: ui.text }}>{daysToForm}</div>
                                        <div style={{ fontSize: '9px', color: ui.sub }}>{langIndex === 0 ? 'ДНЕЙ' : 'DAYS'}</div>
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
                            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '75%', backgroundColor: isLight ? 'rgba(255,255,255,0.85)' : 'rgba(28,28,30,0.85)', backdropFilter: 'blur(30px)', padding: '60px 20px', overflowY: 'auto', borderLeft: `1px solid ${ui.border}` }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px' }}>
                                <span style={{ fontSize: '24px', fontWeight: '800', color: ui.text }}>{langIndex === 0 ? 'Привычки' : 'Habits'}</span>
                                <MdClose size={28} color={ui.sub} onClick={() => setShowListOfHabitsPanel(false)} style={{cursor:'pointer'}} />
                            </div>
                            {AppData.choosenHabits.map((id) => (
                                <motion.div key={id} whileTap={{ scale: 0.98 }} onClick={() => { setHabitId(id); setShowListOfHabitsPanel(false); }}
                                    style={{ padding: '18px', borderRadius: '20px', marginBottom: '10px', backgroundColor: habitId === id ? ui.accent + '20' : 'transparent', color: ui.text, fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                                    <span>{getAllHabits().find(h => h.id === id)?.name[langIndex]}</span>
                                    <span style={{ color: ui.accent, fontWeight: '800' }}>{getHabitPerformPercent(id)}%</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                )}

                {showInfo && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...overlayStyle, justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setShowInfo(false)}>
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{ ...bottomSheetStyle, backgroundColor: ui.panel, backdropFilter: ui.blur }} onClick={e => e.stopPropagation()}>
                            <div style={dragHandle} />
                            <div style={{ padding: '20px 25px 60px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                    <MdAutoGraph size={24} color={ui.accent} />
                                    <h3 style={{ margin: 0, color: ui.text }}>Инсайты</h3>
                                </div>
                                <p style={{ color: ui.text, fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>{infoTextLong(langIndex, habitId)}</p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {showChangeDaysPanel && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ ...overlayStyle, justifyContent: 'center', alignItems: 'flex-end' }} onClick={() => setShowChangeDaysPanel(false)}>
                        <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            style={{ ...bottomSheetStyle, backgroundColor: ui.panel, backdropFilter: ui.blur, textAlign: 'center' }} onClick={e => e.stopPropagation()}
                        >
                            <div style={dragHandle} />
                            <h3 style={{ color: ui.text, marginBottom: '20px' }}>{langIndex === 0 ? 'Срок формирования' : 'Formation Period'}</h3>
                            <Slider min={21} max={180} value={tempDaysToForm} onChange={(e, v) => setTempDaysToForm(v)} sx={{ color: ui.accent, marginBottom: '20px' }} />
                            <div style={{ fontSize: '28px', fontWeight: '900', color: ui.text, marginBottom: '30px' }}>{tempDaysToForm} {langIndex === 0 ? 'дней' : 'days'}</div>
                            <div style={{ display: 'flex', gap: '15px', padding: '0 20px' }}>
                                <button style={modalBtnStyle} onClick={() => setShowChangeDaysPanel(false)}>Cancel</button>
                                <button style={{ ...modalBtnStyle, backgroundColor: ui.accent, color: '#FFF' }} onClick={() => {
                                    const idx = AppData.choosenHabits.indexOf(habitId);
                                    if (idx !== -1) AppData.choosenHabitsDaysToForm[idx] = tempDaysToForm;
                                    setDaysToForm(tempDaysToForm); setShowChangeDaysPanel(false);
                                }}>Save</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Стили
const statCard = (ui) => ({
    backgroundColor: ui.panel, backdropFilter: ui.blur, padding: '18px', borderRadius: '26px', textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative', overflow: 'hidden', flex: 1
});
const actionCard = (ui) => ({
    backgroundColor: ui.panel, backdropFilter: ui.blur, padding: '15px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', border: `1px solid ${ui.border}`, flex: 1
});
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 7000, display: 'flex' };
const bottomSheetStyle = { width: '100%', borderRadius: '40px 40px 0 0', maxHeight: '80vh', overflowY: 'auto' };
const dragHandle = { width: '40px', height: '5px', backgroundColor: '#8E8E93', borderRadius: '3px', margin: '15px auto', opacity: 0.3 };
const modalBtnStyle = { flex: 1, padding: '16px', borderRadius: '18px', border: 'none', fontWeight: '800', fontSize: '16px', backgroundColor: 'rgba(120,120,128,0.1)', cursor: 'pointer' };

function getHabitStatusElements(daysCount, habitsByDate, habitId, isLight) {
    const daysMapping = [7, 30, 90];
    const numberOfDays = daysMapping[daysCount] ?? 7;
    const items = [];
    const today = new Date();
    for (let i = numberOfDays - 1; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const val = habitsByDate[dateStr]?.[habitId];
        let bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
        if (val > 0) bg = '#34C759'; else if (val <= 0 && val !== undefined) bg = '#FF3B30';
        items.push(<div key={dateStr} style={{ flex: 1, height: '100%', backgroundColor: bg, borderRadius: '4px' }} />);
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
    // Determine if the habit is negative (breaking bad) or positive (building good)
    const isNegative = AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(habitId)];

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