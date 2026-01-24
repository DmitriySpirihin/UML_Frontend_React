import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../../StaticClasses/Colors'
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, addPanel$, theme$, lang$, fontSize$, setCurrentBottomBtn, keyboardVisible$ } from '../../StaticClasses/HabitsBus';
import { FaSearch, FaTrashAlt, FaChevronRight, FaPlus, FaListUl } from 'react-icons/fa';
import { MdFiberNew, MdDone, MdClose , MdListAlt } from 'react-icons/md';
import Icons from '../../StaticClasses/Icons';
import MyInput from '../../Helpers/MyInput';
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

const AddHabitPanel = () => {
    const [theme, setTheme] = useState(theme$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [keyboardVisible, setKeyboardVisibleState] = useState(false);
    const [addPanelVisible, setAddPanelVisible] = useState(false);
    const [showCreatePanel, setshowCreatePanel] = useState(false);
    const [confirmationPanel, setConfirmationPanel] = useState(false);

    // Habit data
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState(['Здоровье', 'Health']);
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

    const [habitList, setHabitList] = useState(getAllHabits());
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [filterCategory, setfilterCategory] = useState(AppData.prefs[0] === 0 ? 'Здоровье' : 'Health');

    const isLight = theme === 'light' || theme === 'speciallight';
    const ui = {
        bg: Colors.get('background', theme),
        card: Colors.get('mathInput', theme),
        text: Colors.get('mainText', theme),
        sub:Colors.get('subText', theme),
        accent: Colors.get('scrollFont', theme),
        blur: 'blur(30px)',
        border:Colors.get('border', theme)
    };

    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const sub3 = addPanel$.subscribe(v => setAddPanelVisible(v === 'AddHabitPanel'));
        const sub4 = keyboardVisible$.subscribe(setKeyboardVisibleState);
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); sub4.unsubscribe(); };
    }, []);

    // Логика Drum Picker (скролл списка)
    const handleDrumScroll = (e) => {
        const itemHeight = 44;
        const index = Math.round(e.target.scrollTop / itemHeight);
        const filtered = habitList.filter(h => !AppData.choosenHabits.includes(h.id) && h.category[langIndex] === filterCategory);
        const selected = filtered[index];
        if (selected && selected.id !== habitId) {
            setHabitId(selected.id);
            setHabitName(selected.name[langIndex]);
            setIsNegative(selected.category[0] === 'Отказ от вредного');
            setGoals(setGoalForDefault(selected.name[0], langIndex));
            setDaysToForm(selected.category[0] === 'Отказ от вредного' ? 120 : 66);
            if (window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    };

    const handleSave = () => {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const finalGoals = goals.map(g => ({ text: g, isDone: false }));
        if (showCreatePanel) createHabit(habitName, habitCategory, habitDescription, habitIcon, dateStr, finalGoals, isNegative, daysToForm);
        else addHabit(habitId, habitName, false, dateStr, finalGoals, isNegative, daysToForm);
        closePanel();
    };

    const closePanel = () => {
        addPanel$.next('');
        setCurrentBottomBtn(0);
        setConfirmationPanel(false);
        setshowCreatePanel(false);
        playEffects(click);
    };

    // Date Logic
    const daysInMonth = new Date(year, month, 0).getDate();
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const monthsArray = months[langIndex];
    // RESTRICTED YEAR ARRAY (Current Year Only)
    const YEAR = now.getFullYear();
    const yearsArray = [YEAR- 1, YEAR]; 

    const setNewGoal = () => {
        if (goalName.length > 0) { setGoals(prev => [...prev, goalName]); setGoalName(''); }
        else setShowPopUpPanel(langIndex === 0 ? 'Введите цель' : 'Enter goal', 2000, false);
    };

    const removeGoal = (i) => setGoals(prev => prev.filter((_, idx) => idx !== i));

    return (
        <AnimatePresence>
            {addPanelVisible && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={closePanel}>
                    <motion.div 
                        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        style={{ ...panelStyle, backgroundColor: ui.bg, backdropFilter: ui.blur }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={dragHandle} />
                        
                        <div style={{ padding: '0 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <AnimatePresence mode="wait">
                                {!confirmationPanel ? (
                                    <motion.div key="step1" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <h2 style={{ color: ui.text, textAlign: 'center', fontWeight: '800', margin: '10px 0 20px' }}>
                                            {showCreatePanel ? (langIndex === 0 ? 'Своя привычка' : 'Custom Habit') : (langIndex === 0 ? 'Добавить привычку' : 'Add Habit')}
                                        </h2>

                                        {!showCreatePanel ? (
                                            <>
                                                {/* Фильтр категорий (Drum-style) */}
                                                <div style={{ overflowX: 'auto', display: 'flex', gap: '8px', marginBottom: '15px', paddingBottom: '5px', scrollbarWidth: 'none' }}>
                                                    {['Здоровье', 'Развитие', 'Продуктивность', 'Отношения и отдых', 'Отказ от вредного'].map(cat => (
                                                        <motion.div 
                                                            key={cat} whileTap={{ scale: 0.95 }}
                                                            onClick={() => setfilterCategory(cat)}
                                                            style={{ 
                                                                padding: '10px 18px', borderRadius: '14px', whiteSpace: 'nowrap',
                                                                backgroundColor: filterCategory === cat ? ui.accent : ui.card,
                                                                color: filterCategory === cat ? '#FFF' : ui.text,
                                                                fontSize: '13px', fontWeight: '700', transition: '0.2s all',
                                                                boxShadow: filterCategory === cat ? `0 4px 12px ${ui.accent}40` : 'none'
                                                            }}
                                                        >
                                                            {langIndex === 0 ? cat : getCategory(cat)[1]}
                                                        </motion.div>
                                                    ))}
                                                </div>

                                                <div style={{  borderRadius: '16px', display: 'flex', alignItems: 'center',justifyContent: 'space-between', padding: '0 15px', marginBottom: '15px', height: '50px' }}>
                                                    <FaSearch color={ui.sub} style={{marginRight:'15px',marginTop:'5px'}}/>
                                                    <MyInput theme={theme}  placeHolder={langIndex === 0 ? 'поиск' : 'search'} onChange={v => searchHabitsList(v, habitList, setHabitList)} />
                                                </div>

                                                {/* БАРАБАН (Drum) */}
                                                <div style={drumContainer(ui)}>
                                                    <div onScroll={handleDrumScroll} style={drumScroll} className="no-scrollbar">
                                                        <div style={{ height: '88px' }} />
                                                        {habitList.filter(h => !AppData.choosenHabits.includes(h.id) && h.category[langIndex] === (langIndex === 0 ? filterCategory : getCategory(filterCategory)[1])).map((h) => (
                                                            <div key={h.id} style={drumItem(h.id === habitId, ui)}>
                                                                {h.name[langIndex]}
                                                            </div>
                                                        ))}
                                                        <div style={{ height: '88px' }} />
                                                    </div>
                                                    <div style={drumLens(ui)} />
                                                </div>
                                            </>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                <MyInput w="100%" h="55px" theme={theme} placeHolder={langIndex === 0 ? 'название' : 'name'} onChange={v => setHabitName(v)} />
                                                <motion.div whileTap={{ scale: 0.98 }} style={iconPickerTrigger(ui)} onClick={() => setSelectIconPanel(true)}>
                                                    <span style={{ color: ui.text, fontWeight: '700' }}>Иконка</span>
                                                    {Icons.getIcon(habitIcon, { size: 32, style: { color: ui.accent } })}
                                                </motion.div>
                                                <MyInput w="100%" h="80px" theme={theme} placeHolder={langIndex === 0 ? 'описание' : 'description'} onChange={v => setHabitDescription(v)} />
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
                                                <span style={{ color: ui.accent, fontWeight: '900', fontSize: '24px' }}>{daysToForm} дн.</span>
                                            </div>
                                            <Slider min={21} max={180} value={daysToForm} onChange={(e, v) => setDaysToForm(v)} 
                                                sx={{ color: ui.accent, '& .MuiSlider-thumb': { width: 24, height: 24 }, '& .MuiSlider-rail': { opacity: 0.3 } }} 
                                            />
                                            <p style={{ fontSize: '12px', color: ui.sub, marginTop: '10px', textAlign: 'center' }}>{needDaysInfo(langIndex, daysToForm, isNegative)}</p>
                                        </div>

                                        <div style={configCard(ui)}>
                                            <p style={cardLabel(ui)}>{langIndex === 0 ? 'микро-цели' : 'sub-goals'}</p>
                                            <div style={{ display: 'flex', alignItems: 'center',  borderRadius: '14px', paddingRight: '5px', marginBottom: '15px' }}>
                                                <MyInput theme={theme} w="100%" h="40px" placeHolder={langIndex === 0 ? 'Добавить цель...' : 'Add goal...'} onChange={v => setGoalName(v)} value={goalName}/>
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
                                        <div style={{ height: '20px' }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* --- ФИНАЛЬНЫЕ КНОПКИ --- */}
                            <div style={footerButtons}>
                                <motion.div whileTap={{ scale: 0.9 }} style={btnCancel(ui)} onClick={confirmationPanel ? () => setConfirmationPanel(false) : closePanel}>
                                    <MdClose size={26} color={ui.text} />
                                </motion.div>

                                {!confirmationPanel && (
                                    <motion.div whileTap={{ scale: 0.9 }} style={btnNew(ui)} onClick={() => setshowCreatePanel(!showCreatePanel)}>
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
                    </motion.div>

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
                                        <h3 style={{ margin: 0, color: ui.text }}>Выбрать иконку</h3>
                                        <motion.div whileTap={{ scale: 0.9 }} onClick={() => setSelectIconPanel(false)} style={{ padding: '8px', backgroundColor: ui.card, borderRadius: '50%' }}>
                                            <MdClose color={ui.sub} />
                                        </motion.div>
                                    </div>
                                    <div style={iconGrid}>
                                        {Object.keys(Icons.ic).map(key => (
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
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- СТИЛИ ---
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' };
const panelStyle = { width: '100%', height: '92vh', borderRadius: '40px 40px 0 0', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' };
const dragHandle = { width: '45px', height: '5px', backgroundColor: '#8E8E93', borderRadius: '3px', margin: '15px auto', opacity: 0.4 };

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

const addHabit = (habitId, habitName, isCustom, dateString, goals, isNegative, daysToForm) => {
    if (AppData.IsHabitInChoosenList(habitId)) { setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list', 2500, false); return; }
    addHabitFn(habitId, dateString, goals, isNegative, daysToForm);
    setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added', 2500, true);
}

const createHabit = (name, category, description, icon, dateString, goals, isNegative, daysToForm) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    AppData.AddCustomHabit(name, category, description, icon, habitId);
    setTimeout(() => { addHabit(habitId, name, true, dateString, goals, category[0] === 'Отказ от вредного', daysToForm); }, 100);
}

const searchHabitsList = (val, habitList, setHabitList) => {
    if (val.length > 0) {
        const newList = getAllHabits().filter((habit) => habit.name[AppData.prefs[0]].toLowerCase().startsWith(val.toLowerCase()));
        setHabitList(newList);
    } else { setHabitList(getAllHabits()); }
}

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