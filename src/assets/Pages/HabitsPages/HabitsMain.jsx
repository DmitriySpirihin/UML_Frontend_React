import React, { useState, useEffect } from 'react'
import { motion, useTransform, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import Icons from '../../StaticClasses/Icons';
import { allHabits } from '../../Classes/Habit.js'
import { AppData, getHabitPerformPercent, UserData } from '../../StaticClasses/AppData.js'

// --- ИМПОРТЫ ---
import { expandedCard$, setExpandedCard } from '../../StaticClasses/HabitsBus.js';
import { theme$, lang$, fontSize$, premium$, confirmationPanel$, setShowPopUpPanel, setPage,setActiveTab } from '../../StaticClasses/HabitsBus'
import Colors from '../../StaticClasses/Colors'

import { MdDone, MdClose } from 'react-icons/md'
import { FaPlus, FaTrash, FaPencilAlt, FaArrowUp, FaFire, FaChevronDown , FaClock} from 'react-icons/fa'
//new
import {FiCalendar} from 'react-icons/fi'
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

export let removeHabitFn;
export let addHabitFn;
export let currentId;

// --- СТИЛИ (ОРИГИНАЛЬНЫЕ + УЛУЧШЕННЫЕ ТЕНИ) ---
const styles = (theme, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight ? '#F2F4F6' : Colors.get('background', theme);
    const modalBg = isLight ? '#FFFFFF' : Colors.get('simplePanel', theme);
    const borderColor = isLight ? 'rgba(0,0,0,0.0)' : `1px solid ${Colors.get('border', theme)}`;
    
    // --- УЛУЧШЕННЫЕ ТЕНИ ДЛЯ МОДАЛОК (Многослойные, мягкие) ---
    const shadow = isLight 
        ? '0 20px 40px -10px rgba(0,0,0,0.1), 0 10px 20px -5px rgba(0,0,0,0.04)' // Светлая: мягкая двойная тень
        : '0 30px 60px -12px rgba(0,0,0,0.5)'; // Темная: глубокая, размытая тень

    return {
        container: {
            width: '100vw',
            height: '98vh',
            marginTop:'26px',
            display: "flex",
            flexDirection: "column",
            justifyContent: "start",
            alignItems: "center",
            fontFamily: "Segoe UI",
            backgroundColor: bg,
            transition: 'background-color 0.3s ease'
        },
        scrollView: {
            width: "100%",
            paddingBottom: '50px',
            overflowY: "auto",
            marginTop: "12vh",
            display: 'flex',
            flexDirection: 'column',
        },
        cP: {
            display: 'flex', flexDirection: 'column', alignItems: "center", justifyContent: "center",
            borderRadius: "28px",
            border: borderColor,
            backgroundColor: modalBg,
            boxShadow: shadow,
            width: "90%",
            maxWidth: '380px',
            padding: '25px',
            gap: '20px'
        },
        confirmContainer: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px',
        },
        selectPanel: {
            backgroundColor: modalBg,
            borderRadius: '24px',
            border: borderColor,
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            display: 'flex', flexWrap: 'wrap', width: '85vw', maxHeight: '50vh', overflowY: 'auto', padding: '20px', gap: '10px', justifyContent: 'center', zIndex: 6000,
            boxShadow: shadow,
        },
        mainText: { fontSize: "17px", fontWeight: '600', color: Colors.get('mainText', theme), textAlign: 'center', marginBottom: '10px' },
        subText: { textAlign: "center", fontSize: "14px", color: Colors.get('subText', theme), marginBottom: '5px' },
        buttonsRow: { width: '100%', display: 'flex', flexDirection: 'row', gap: '15px', marginTop: '10px' },
        btnCancel: {
            flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            backgroundColor: isLight ? '#E5E5EA' : 'rgba(255,255,255,0.1)',
            color: isLight ? '#000' : '#FFF',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '15px'
        },
        btnSave: {
            flex: 1, padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
            backgroundColor: '#007AFF',
            color: '#FFF',
            display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '600', fontSize: '15px'
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

    useEffect(() => {
        const subscription = lang$.subscribe((lang) => { setLangIndex(lang === 'ru' ? 0 : 1); });
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => { setHabitsCards(AppData.choosenHabits); }, []);

    useEffect(() => {
        if (habitsCards.length > 0) {
            const cats = new Set();
            habitsCards.forEach(id => {
                const h = getAllHabits().find(h => h.id === id);
                if (h && !cats.has(h.category[0])) { cats.add(h.category[0]); }
            });
            setCategories(Array.from(cats));
        }
    }, [habitsCards]);

    const addHabit = (id, dateString, goals, isNegative, daysToForm) => {
        setHabitsCards(prev => {
            const newHabits = new Set(prev);
            if (!newHabits.has(id)) {
                AppData.addHabit(id, dateString, goals, isNegative, daysToForm);
                return [...newHabits, id];
            }
            return prev;
        });
        setHasHabits(AppData.choosenHabits.length > 0);
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

    const onConfirmAction = () => {
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
            break;
            case 1:
                if (newGoal.length > 0) {
                    cP.setGoals(prev => [...prev, { text: newGoal, isDone: false }]);
                    AppData.addHabitGoal(cP.hId, { text: newGoal, isDone: false });
                    setCP(prev => ({ ...prev, show: false }));
                } else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
                break;
            case 2:
                if (newGoal.length > 0) {
                    cP.setGoals(prev => prev.map((goal, idx) => idx === cP.gId ? { ...goal, text: newGoal.trim() } : goal));
                    AppData.choosenHabitsGoals[cP.hId][cP.gId].text = newGoal;
                    setCP(prev => ({ ...prev, show: false }));
                } else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
                break;
            case 3:
                cP.setGoals(prev => prev.filter((_, i) => i !== cP.gId));
                AppData.choosenHabitsGoals[cP.hId].splice(cP.gId, 1);
                setCP(prev => ({ ...prev, show: false }));
                break;
        }
    };

    removeHabitFn = removeHabit;
    addHabitFn = addHabit;

    const isLight = theme === 'light' || theme === 'speciallight';
    const pageBg = isLight ? '#F2F4F6' : Colors.get('background', theme);

    return (
        <div style={{ ...styles(theme).container, backgroundColor: pageBg }}>
            {<HoverInfoButton tab='HabitsMain'/>}
            {needConfirmation && <div style={styles(theme).confirmContainer}>
                <div style={styles(theme).cP}>
                    <div style={styles(theme, fSize).mainText}>{confirmMessage}</div>
                    <div style={styles(theme).buttonsRow}>
                        <button style={styles(theme).btnCancel} onClick={() => setNeedConfirmation(false)}>
                            <MdClose size={20} style={{marginRight: 5}}/> {langIndex === 0 ? 'Нет' : 'No'}
                        </button>
                        <button style={{...styles(theme).btnSave, backgroundColor: '#FF453A'}} onClick={() => { removeHabit(habitTodelete); setNeedConfirmation(false) }}>
                            <MdDone size={20} style={{marginRight: 5}}/> {langIndex === 0 ? 'Да' : 'Yes'}
                        </button>
                    </div>
                </div>
            </div>}
            {!hasHabits && <div style={{ ...styles(theme).panel, justifyContent: 'center', alignItems: 'center', marginTop: '40%' }}>
                <p style={{ ...styles(theme).subText, fontSize: fSize === 0 ? '11px' : '13px', margin: '10%', marginTop: '20%', whiteSpace: 'pre-line', color: Colors.get('subText', theme) }}>{setInfoText(langIndex)}</p>
            </div>}
            
            {hasHabits && <div style={styles(theme).scrollView} key={dataVersion}>
                {buildMenu({ theme, habitsCards, categories, setCP, setCurrentId, fSize, setNeedConfirmation, setConfirmMessage, setHabitToDelete })}
                <div style={{ marginBottom: '150px' }} />
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
                                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
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
                                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                                />
                                </div>
                         }
                        
                        {cP.type === 0 && (
    <div style={{width: '100%', display: 'flex', flexDirection: 'column', gap: '12px'}}>
        
        {/* --- ADD CATEGORY SELECTOR HERE --- */}
        <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', paddingBottom: '5px', scrollbarWidth: 'none' }}>
            {['Здоровье', 'Развитие', 'Продуктивность', 'Отношения и отдых', 'Отказ от вредного'].map(cat => (
                <div 
                    key={cat} 
                    onClick={() => setNewCategory(cat)}
                    style={{ 
                        padding: '8px 14px', borderRadius: '12px', whiteSpace: 'nowrap', cursor: 'pointer',
                        backgroundColor: newCategory === cat ? Colors.get('scrollFont', theme) : (isLight ? '#F2F2F7' : 'rgba(255,255,255,0.05)'),
                        color: newCategory === cat ? '#FFF' : Colors.get('subText', theme),
                        fontSize: '12px', fontWeight: '700', transition: '0.2s all',
                    }}
                >
                    {langIndex === 0 ? cat : getCategory(cat)[1]}
                </div>
            ))}
        </div>

        <input 
                                type="text" 
                                placeholder={langIndex === 0 ? 'Название':'Name'}
                                value={newName}
                                 onChange={(e) => setNewName(e.target.value)}
                                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                                />
                                <input 
                                type="text" 
                                placeholder={langIndex === 0 ? 'Описание (опц.)':'Description (opt.)'}
                                value={newDescr}
                                 onChange={(e) => setNewDescr(e.target.value)}
                                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}` , borderRadius: '16px', padding: '12px'}}
                                />
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: isLight ? '#F2F2F7' : 'rgba(255,255,255,0.05)', borderRadius: '14px', cursor: 'pointer' }} onClick={() => setSelectIconPanel(!selectIconPanel)}>
            <span style={{fontSize: '14px', color: Colors.get('subText', theme)}}>{langIndex===0?'Иконка':'Icon'}</span>
            <div style={{color: Colors.get('habitIcon', theme)}}>{Icons.getIcon(newIcon, {size: 28})}</div>
        </div>
    </div>
)}

                        <div style={styles(theme).buttonsRow}>
                            <button style={styles(theme).btnCancel} onClick={() => setCP(prev => ({ ...prev, show: false }))}>
                                <MdClose size={22} style={{marginRight: '6px'}}/> {langIndex === 0 ? 'Отмена' : 'Cancel'}
                            </button>
                            <button style={{...styles(theme).btnSave, backgroundColor: cP.type === 3 ? '#FF453A' : '#007AFF'}} onClick={() => { onConfirmAction(); }}>
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
                                {Icons.getIcon(key, { size: 30, style: { color: Colors.get('habitIcon', theme) } })}
                            </div>
                        ))}
                    </div>
                </div>
            )}
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

function buildMenu({ theme, habitsCards, categories, setCP, setCurrentId, fSize, setNeedConfirmation, setConfirmMessage, setHabitToDelete }) {
    return categories.map(category => {
        const habitsInCategory = habitsCards
            .map(id => getAllHabits().find(h => h.id === id))
            .filter(h => h && h.category[0] === category);

        if (habitsInCategory.length === 0) return null;

        return (
            <CategoryPanel 
                key={category} 
                text={habitsInCategory[0].category} 
                theme={theme} 
                isNegative={category === 'Отказ от вредного'}
            >
                {habitsInCategory.map(habit => (
                    <HabitCard
                        key={habit.id}
                        id={habit.id}
                        theme={theme}
                        setCP={setCP}
                        setCurrentId={setCurrentId}
                        fSize={fSize}
                        setConfirmMessage={setConfirmMessage}
                        setNeedConfirmation={setNeedConfirmation}
                        setHabitToDelete={setHabitToDelete}
                    />
                ))}
            </CategoryPanel>
        );
    });
}

function HabitCard({ id = 0, theme, setCP, setCurrentId, fSize, setNeedConfirmation, setConfirmMessage, setHabitToDelete }) {
    const [status, setStatus] = useState(AppData.habitsByDate[dateKey]?.[id]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const habit = getAllHabits().find(h => h.id === id);
    if (!habit) return null;

    const [habitInfo, setHabitInfo] = useState({
        name: habit?.name || ["", ""],
        descr: habit?.description || ["", ""],
        icon: habit?.iconName || "default"
    });

    const isNegative = habit.category[0] === 'Отказ от вредного';
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
    const [currentStreak,setCurrentStreak] = useState(0);

    const habitColor = isNegative ? '#FF3B30' : (habit.color || '#32D74B');
    const isLight = theme === 'light' || theme === 'speciallight';

    // --- УЛУЧШЕННЫЕ ТЕНИ ДЛЯ КАРТОЧЕК (Многослойные, мягкие) ---
    let cardBg = isLight ? '#FFFFFF' : (Colors.get('simplePanel', theme) + '99');
    let textColor = isLight ? '#1D1D1F' : Colors.get('mainText', theme);
    let subTextColor = isLight ? '#8E8E93' : Colors.get('subText', theme);
    let iconBg = isLight ? '#FFFFFF' : 'rgba(70, 70, 70, 0.2)';
    let iconColor = habitColor;
    let borderColor = isLight ? 'transparent' : `1px solid ${Colors.get('border', theme)}80`;
    
    // Тени для карточек:
    let shadow = isLight 
        ? '0 12px 24px -6px rgba(0, 0, 0, 0.27), 0 4px 8px -3px rgba(0, 0, 0, 0.06)' // Светлая: очень мягкая, парящая
        : `0 25px 50px -12px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.1)`; // Темная: глубокая с подсветкой сверху

    if (isNegative) {
        cardBg = isLight ? '#9a4a4a' : 'rgba(255, 59, 48, 0.08)';
        borderColor = isLight ? 'rgba(255, 59, 48, 0.1)' : '1px solid rgba(255, 59, 48, 0.2)';
        iconBg = 'rgba(255, 59, 48, 0.15)';
    }

    if (status === 1) {
        cardBg = isLight ? '#32873961' : 'rgba(20, 60, 30, 0.85)';
        textColor = isLight ? '#1E5E25' : '#ffffff';
        subTextColor = isLight ? '#2E7D32' : 'rgba(255,255,255,0.7)';
        iconBg = isLight ? '#ffffff5c' : 'rgba(255,255,255,0.2)';
        iconColor = isLight ? '#2E7D32' : '#ffffff';
        borderColor = 'transparent';
    } else if (status === -1) {
        cardBg = isLight ? '#bc334868' : 'rgba(60, 20, 20, 0.85)';
        textColor = isLight ? '#B71C1C' : '#ffffff';
        subTextColor = isLight ? '#C62828' : 'rgba(255,255,255,0.7)';
        iconBg = isLight ? '#ffffff6e' : 'rgba(255,255,255,0.2)';
        iconColor = isLight ? '#C62828' : '#ffffff';
        borderColor = 'transparent';
    }
    const habitsData = Array.from(Object.values(AppData.habitsByDate));
    useEffect(() => {
            if (id > -1) {
                let curS = 0;
                const today = new Date().toISOString().split('T')[0];
                
            
                for (let i = habitsData.length - 2; i >= 0; i--) {
                    if (id in habitsData[i]) {
                        if (habitsData[i][id] > 0) curS++;
                        else break;
                    }
                }
                if (AppData.habitsByDate[today]?.[id] > 0) curS++;
                setCurrentStreak(curS);
            }
        }, [id, AppData.habitsByDate,status]);
    useEffect(() => { const sub = premium$.subscribe(setHasPremium); return () => sub.unsubscribe(); }, []);
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
                        else { if (newTime >= maxTimer && status < 1) setStatus(1); }
                        return newTime;
                    });
                }
            }, 50);
            return () => clearInterval(interval);
        }
    }, [time, timer, maxTimer]);

    useEffect(() => { const sub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)); return () => sub.unsubscribe(); }, []);
    useEffect(() => { AppData.changeStatus(dateKey, id, status); }, [status]);

    const getHabitIcon = () => {
        if (habit.isCustom && habit.iconName) return Icons.getIcon(habit.iconName, { size: 22 });
        return Icons.getHabitIcon(habit.name ? habit.name[0] : 'default', { size: 22 });
    };

    const x = useMotionValue(0);
    const constrainedX = useTransform(x, [-1, 1], [minX, maxX]);

    const handledDrag = (event, info) => {
        if (isNegative) {
            if (info.offset.x < minX && canDrag) { setNewStatus(false); animate(constrainedX, 0, { type: 'tween', duration: 0.2 }); setCanDrag(false); }
        } else {
            if (Math.abs(info.offset.x) > maxX && canDrag) {
                if ((status < 1 && info.offset.x > 0) || (status > -1 && info.offset.x < 0)) setNewStatus(info.offset.x > 0);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                setCanDrag(false);
            }
        }
    }
    const onDragEnd = () => { if (canDrag) animate(constrainedX, 0, { type: 'tween', duration: 0.2 }); setCanDrag(true); }
    const setNewStatus = (isOverZero) => {
        let newStatus = 0;
        if (isOverZero) { newStatus = (status === 0 || status === -1) ? 1 : 1; }
        else {
            if (status === 0) {
               newStatus = -1;
               setCurrentStreak(0);
            }
            else if (status === 1) { newStatus = isNegative ? -1 : 0; setCurrentStreak(0); if(isNegative) { setTime(0); AppData.choosenHabitsLastSkip[id] = Date.now(); } }
            else if (status === -1) { newStatus = -1; if(isNegative) { setTime(0); AppData.choosenHabitsLastSkip[id] = Date.now(); } }
        }
        AppData.habitsByDate[dateKey][id] = newStatus;
        if (newStatus === 1) playEffects(isDoneSound); else if (newStatus === -1) playEffects(skipSound);
        setStatus(newStatus);
    }
    const toggleIsActive = () => { setCurrentId(id); playEffects(clickSound); const newExpanded = !expanded; setExpanded(newExpanded); setExpandedCard(newExpanded ? id : null); }

    useEffect(() => { const sub = expandedCard$.subscribe(cId => setExpanded(cId === id)); return () => sub.unsubscribe(); }, [id]);
    useEffect(() => { setCanDrag(!showTimerSlider); }, [showTimerSlider]);

    const startTimer = () => { if (status < 1 && !isNegative) { setTimer(true); setTime(0); } }
    const stopTimer = () => { if (!isNegative) { setTimer(false); setProgress(0); setTime(0); } }
    const onDeleteHabit = (id) => { setHabitToDelete(id); setNeedConfirmation(true); setConfirmMessage(AppData.prefs[0] === 0 ? `⚠️ Вы уверены?` : `⚠️ Are you sure?`); }

    return (
        <motion.div
            id={id}
            style={{
                display: 'flex', flexDirection: 'column', width: '95%', margin: '5px', overflow: 'hidden', position: 'relative',
                borderRadius: '24px', backgroundColor: cardBg, backdropFilter: isLight ? 'none' : 'blur(40px)',
                border: isLight ? 'none' : borderColor, boxShadow: shadow, x: constrainedX
            }}
            onClick={(event) => {
                const el = document.getElementById(id);
                if (el.clientHeight < 80 || (event.nativeEvent.pageY - (el.getBoundingClientRect().top + window.scrollY)) < 80) toggleIsActive();
            }}
            drag={canDrag ? 'x' : false} dragConstraints={{ left: minX, right: status > 0 || isNegative ? 0 : maxX }}
            onDrag={handledDrag} onDragEnd={onDragEnd} whileTap={{ scale: 0.99 }}
            animate={{ height: expanded ? 'auto' : '80px' }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
           
            <div style={{ display: "flex", alignItems: "center", minHeight: '80px', width: '100%', padding: '15px 20px', boxSizing: 'border-box' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg, color: status===1 ? (isLight ? '#fff' : '#fff') : iconColor, marginRight: '16px', flexShrink: 0, alignSelf: 'flex-start', marginTop: expanded ? '5px' : '0' }}>{getHabitIcon()}</div>
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                    
                    <span style={{ fontFamily: 'Segoe UI', fontWeight: '700', fontSize: '18px', color: textColor, whiteSpace: expanded ? 'normal' : 'nowrap', overflow: expanded ? 'visible' : 'hidden', textOverflow: 'ellipsis', lineHeight: '1.2' }}>{habitInfo.name[langIndex]}</span>

                   {/*

                    {timer && <span style={{ fontSize: '14px', fontWeight: '700', color: status===1 ? (isLight?'#2E7D32':'#FFF') : habitColor, marginTop: '4px', opacity: 0.9 }}>{parsedTime(time, maxTimer,langIndex, isNegative)}</span>}
                     {!timer && !isNegative && currentStreak > 0 && <span style={{ fontSize: '14px', fontWeight: '700', color: status===1 ? (isLight?'#2E7D32':'#FFF') : habitColor, marginTop: '4px', opacity: 0.9 }}>{getDayName(langIndex,currentStreak)}</span>}

                    */}

                    <div style={{display:'flex',gap :'5px',marginTop:'16px',justifyContent:'center'}}>

                    <MiniBadge theme={theme} icon={<FiCalendar size={9}/>} text={getDaysAmount(id)} color={theme === 'dark' ? '#a5a5a5' : '#1e1e1e8f'} />
                    <MiniBadge theme={theme} icon={<MdClose size={9}/>} text={getSkippedAmount(id)} color={theme === 'dark' ? '#e33131' : '#9800008f'} />
                    {!isNegative && currentStreak > 0 && <MiniBadge theme={theme} icon={<FaFire size={9}/>} text={getDayName(langIndex,currentStreak)} color={theme === 'dark' ? '#31e355' : '#1e98008f'} />}
                    {!isNegative && timer && <MiniBadge theme={theme} icon={<FaClock size={9}/>} text={parsedTime(time, maxTimer,langIndex, false)} color={theme === 'dark' ? '#31c8e3' : '#0086988f'} />}
                    {isNegative &&  <MiniBadge theme={theme} icon={<FaFire size={9}/>} text={parsedTime(time, maxTimer,langIndex, isNegative)} color={theme === 'dark' ? '#31e355' : '#1e98008f'} />}

                    </div>




                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', paddingLeft: '10px', alignSelf: 'center' }}>
                    {!isNegative && <>
                    
                        {!timer && status === 0 && <TimerOffIcon onClick={(e) => { e.stopPropagation(); setShowTimerSlider(true); }} style={{ color: Colors.get('icons', theme), opacity: 0.4, fontSize: '24px', marginRight: '15px' }} />}
                        {timer && <TimerIcon onClick={(e) => { e.stopPropagation(); stopTimer() }} style={{ color: habitColor, fontSize: '24px', marginRight: '15px' }} />}
                        <div onClick={(e) => {e.stopPropagation(); setNewStatus(true)}} style={{ width: '30px', height: '30px', borderRadius: '50%', border: status !== 0 ? 'none' : `2px solid ${isLight ? '#E5E5EA' : '#3A3A3C'}`, backgroundColor: status === 1 ? '#32D74B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>{status === 1 && <FaCheck size={16} color="#FFF" />}</div>
                    </>}




                    {isNegative && <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255, 69, 58, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaFire size={16} color="#FF453A" /></div>}
                    
                </div>
            </div>
            {expanded && (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.2, delay: 0.1 }} 
        style={{ padding: '0 20px 20px 20px' }}
    >
        {/* Separator Line */}
        <div style={{ height: '1px', width: '100%', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)', marginBottom: '15px' }} />
        {/* Description */}
                {habitInfo.descr[langIndex] && (
                    <div style={{ color: subTextColor, fontSize: '14px', marginBottom: '20px', lineHeight: '1.4' }}>
                        {habitInfo.descr[langIndex]}
                    </div>
                )}
        {/* --- CONTENT BASED ON PREMIUM STATUS --- */}
        {hasPremium ? (
            <>
                

                {/* Goals List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {habitsGoals?.map((goal, index) => (
                        <motion.div key={index} whileTap={{ scale: 0.98 }} style={{ display: 'flex', alignItems: 'center', width: '90%', padding: '14px 16px', borderRadius: '16px', backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.05)', border: isLight ? '1px solid rgba(0,0,0,0.05)' : 'none', boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.03)' : 'none' }}>
                            <div style={{ fontSize: '14px', flexGrow: 1, fontWeight: '500', color: goal.isDone ? (isLight ? '#AEAEB2' : '#636366') : textColor, textDecoration: goal.isDone ? 'line-through' : 'none' }}>{goal.text}</div>
                            
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
                            <div onClick={() => setHabitGoals(prev => { const updated = prev.map((h, i) => i === index ? { ...h, isDone: !h.isDone } : h); AppData.choosenHabitsGoals[id] = updated; return updated; })} style={{ width: '24px', height: '24px', borderRadius: '8px', border: goal.isDone ? 'none' : `2px solid ${isLight ? '#E5E5EA' : '#3A3A3C'}`, backgroundColor: goal.isDone ? habitColor : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                {goal.isDone && <FaCheck size={12} color="#FFF" />}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Add Goal Button */}
                <div onClick={() => setCP({ show: true, type: 1, hId: id, gId: 0, setGoals: setHabitGoals })} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', cursor: 'pointer', padding: '12px', borderRadius: '16px', border: `2px dashed ${habitColor}66`, backgroundColor: `${habitColor}10` }}>
                    <FaPlus style={{ fontSize: '12px', color: habitColor }} />
                    <span style={{ fontSize: '13px', marginLeft: '8px', color: habitColor, fontWeight: '600' }}>
                        {langIndex === 0 ? 'Добавить цель' : 'Add goal'}
                    </span>
                </div>

                {/* Achievements Section */}
                <div style={{ marginTop: '25px', marginBottom: '10px', fontSize: '12px', fontWeight: 'bold', color: Colors.get('subText', theme), textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {langIndex === 0 ? 'Достижения' : 'Achievements'}
                </div>
                {AppData.choosenHabitsAchievements[id]?.map((milestone, index) => (
                    <Achievement key={index} index={index} milestone={milestone} id={id} isNegative={isNegative} percent={percent} theme={theme} fSize={fSize} langIndex={langIndex} />
                ))}
            </>
        ) : (
            /* --- NO PREMIUM VIEW --- */
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15px', marginBottom: '15px', fontSize: '12px', fontWeight: '600', color: Colors.get('subText', theme) , border: `2px dashed ${Colors.get('subText', theme)}66`, padding: '12px', borderRadius: '16px'}}>
                {langIndex === 0 ? 'Микро цели и достижения с премиум' : 'Micro goals and achievements with premium'}
            </div>
        )}

        {/* --- BOTTOM ACTIONS (Visible to All) --- */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '35px' }}>
            {habit.isCustom && <FaPencilAlt onClick={() => setCP(prev => ({ ...prev, show: true, type: 0, hId: id, gId: 0, hInfo: setHabitInfo }))} style={{ fontSize: '18px', color: Colors.get('icons', theme), opacity: 0.7 }} />}
            <FaTrash onClick={() => onDeleteHabit(id)} style={{ fontSize: '18px', color: Colors.get('icons', theme), opacity: 0.7 }} />
            <FaArrowUp style={{ fontSize: '18px', color: Colors.get('icons', theme), opacity: 0.7 }} onClick={() => { toggleIsActive(); }} />
           {!isNegative && <div onClick={() => setNewStatus(true)} style={{ width: '18px', height: '18px', borderRadius: '50%', border: status !== 0 ? 'none' : `2px solid ${isLight ? '#E5E5EA' : '#3A3A3C'}`, backgroundColor: status === 1 ? '#32D74B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' }}>{status === 1 && <FaCheck size={16} color="#FFF" />}</div>}
        </div>

    </motion.div>
)}
            {showTimerSlider && (
                <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', borderRadius: '24px', width: '100%', height: '80px', top: 0, zIndex: 1001, backgroundColor: isLight ? '#FFF' : Colors.get('background', theme) }} onClick={(e) => e.stopPropagation()}>
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

function CategoryPanel({ text = ["Имя", "Name"], children, theme }) {
    const [isOpen, setIsOpen] = useState(true); // Состояние сворачивания
    const isLight = theme === 'light' || theme === 'speciallight';
    const langIndex = AppData.prefs[0];

    return (
        <div style={{ width: '100%', marginBottom: '20px' }}>
            <div 
                onClick={() => { setIsOpen(!isOpen); playEffects(clickSound); }}
                style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '0 25px', 
                    marginBottom: '10px', 
                    cursor: 'pointer',
                    userSelect: 'none'
                }}
            >
                <div style={{ 
                    fontSize: '18px', 
                    fontWeight: '800', 
                    fontFamily: 'Segoe UI', 
                    color: isLight ? '#1D1D1F' : Colors.get('mainText', theme) 
                }}>
                    {text[langIndex]}
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 0 : -90 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                    <FaChevronDown size={14} color={isLight ? '#1D1D1F' : '#FFF'} style={{ opacity: 0.4 }} />
                </motion.div>
            </div>
            
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function setInfoText(langIndex) { return langIndex === 0 ? 'Вы еще не добавили ни одной привычки\n\n Вы можете выбрать из списка или добавить свою привычку...' : 'You have not added any habits yet...'; }

function playEffects(sound) { if (AppData.prefs[2] == 0 && sound !== null) { if (!sound.paused) { sound.pause(); sound.currentTime = 0; } sound.volume = 0.5; sound.play(); } if (AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback) Telegram.WebApp.HapticFeedback.impactOccurred('light'); }

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
        ? `${daysLeft} days left to unlock` 
        : `Осталось ${daysLeft} дн. до открытия`;

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
        padding: '2px 5px', borderRadius: '5px', 
        backgroundColor: Colors.get('background', theme) + '75',
        color: color, fontSize: '10px', fontWeight: '700',
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
            if (habitsOnDate[id] === -1) { // Replace 2 with your actual "skipped" status value
                amount++;
            }
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