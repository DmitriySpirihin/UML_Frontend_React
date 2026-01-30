import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, setAddPanel } from '../../StaticClasses/HabitsBus';
// Импортируем события, но список берем напрямую из AppData для надежности
import { todoEvents$ } from './ToDoHelper.js';
import { 
    FaSortAmountDown, 
    FaFilter, 
    FaCheck, 
    FaCalendarDay, 
    FaListUl,
    FaFire,
    FaChevronDown,
    FaSearch,
    FaTimes,
    FaSortNumericDown,
    FaExclamation,
    FaInbox,
    FaFlag,
    FaLayerGroup
} from 'react-icons/fa';
import ToDoPage from './ToDoPage.jsx';
import ToDoNew from './ToDoNew.jsx';
import ToDoMetrics from './ToDoMetrics.jsx';

const clickSound = new Audio('Audio/Click.wav');
const doneSound = new Audio('Audio/IsDone.wav');

// --- CONSTANTS ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not Urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very Urgent'], ['ASAP', 'ASAP']];

const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336']; 
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];
const URGENCY_COLORS = ['#81C784', '#64B5F6', '#FFD54F', '#FF8A65', '#E57373'];

const ToDoMain = () => {
    // --- GLOBAL STATE ---
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // --- LOCAL UI STATE ---
    const [showToDo, setShowToDo] = useState(false);
    const [showMetrics, setShowMetrics] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // Используем AppData.todoList как источник правды
    const [sortedList, setSortedList] = useState(AppData.todoList || []);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // --- FILTER/SORT STATE ---
    const [filterParams, setFilterParams] = useState(0); // 0: All, 1: Done, 2: Active
    const [sortParams, setSortParams] = useState(1); // 0: Diff, 1: Prio, 2: Date
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- UI STATE ---
    const [activePanel, setActivePanel] = useState('none'); 
    const searchInputRef = useRef(null);

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        
        const sub4 = todoEvents$.subscribe(event => {
            if (!event) return;
            // Обновляем список при любых изменениях
            setRefreshTrigger(prev => prev + 1);

            if (event.type === 'OPEN_STATS') {
                setShowMetrics(true);
                setShowToDo(false);
            }
            if (event.type === 'OPEN_ADD') {
                setShowMetrics(false);
                setCurrentIndex(-1);
                setShowToDo(true);
            }
            if (event.type === 'CLOSE_ALL') {
                setShowMetrics(false);
                setShowToDo(false);
            }
        });

        return () => { 
            sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); sub4.unsubscribe(); 
        };
    }, []);

    // --- LOGIC ---
    useEffect(() => {
        sortList();
    }, [filterParams, sortParams, searchQuery, refreshTrigger]);

    useEffect(() => {
        if (activePanel === 'search' && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 300);
        }
    }, [activePanel]);

    function sortList() {
        // Безопасное копирование
        let newList = AppData.todoList ? [...AppData.todoList] : [];

        // 1. Filter by Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            newList = newList.filter(task => 
                (task.name && task.name.toLowerCase().includes(q)) || 
                (task.category && task.category.toLowerCase().includes(q))
            );
        }

        // 2. Filter by Status
        if (filterParams === 1) newList = newList.filter(task => task.isDone);
        if (filterParams === 2) newList = newList.filter(task => !task.isDone);
        
        // 3. Sort
        if (sortParams === 0) { // Difficulty (High to Low)
            newList.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
        } else if (sortParams === 1) { // Priority (High to Low)
            newList.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        } else if (sortParams === 2) { // Deadline (Soonest first)
            newList.sort((a, b) => daysToDeadlineNum(a.deadLine) - daysToDeadlineNum(b.deadLine));
        }
        
        setSortedList(newList);
    }

    const handleQuickComplete = (e, item) => {
        e.stopPropagation();
        item.isDone = !item.isDone;
        setRefreshTrigger(prev => prev + 1); // Force re-render
        playEffects(item.isDone ? doneSound : clickSound);
    };

    const togglePanel = (panelName) => {
        playEffects(clickSound);
        if (activePanel === panelName) setActivePanel('none');
        else setActivePanel(panelName);
    };

    const groupedTasks = useMemo(() => {
        const groups = {};
        sortedList.forEach(task => {
            const cat = task.category || (langIndex === 0 ? 'Другое' : 'Other');
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(task);
        });
        return groups;
    }, [sortedList, langIndex]);

    const s = styles(theme, fSize);

    return (
        <div style={s.container}>
            
            {/* --- HEADER --- */}
            <div style={{ width: '92%', marginTop: '14vh', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: Colors.get('mainText', theme), fontFamily: 'Segoe UI', letterSpacing: '-0.5px' }}>
                        {langIndex === 0 ? 'Задачи' : 'Tasks'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <HeaderIconButton 
                            icon={<FaSearch size={16}/>} 
                            isActive={activePanel === 'search' || searchQuery.length > 0} 
                            onClick={() => togglePanel('search')} theme={theme}
                        />
                        <HeaderIconButton 
                            icon={<FaSortAmountDown size={16}/>} 
                            isActive={activePanel === 'sort' || sortParams !== 1} 
                            onClick={() => togglePanel('sort')} theme={theme}
                        />
                        <HeaderIconButton 
                            icon={<FaFilter size={14}/>} 
                            isActive={activePanel === 'filter' || filterParams !== 0} 
                            onClick={() => togglePanel('filter')} theme={theme}
                        />
                    </div>
                </div>

                <AnimatePresence mode='wait'>
                    {activePanel === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={s.inputContainer}>
                                <FaSearch size={14} color={Colors.get('subText', theme)} style={{ marginLeft: '16px', opacity: 0.6 }}/>
                               
                                <input 
                                type="text" 
                                placeholder={langIndex === 0 ? 'Найти задачу...' : 'Search tasks...'}
                                value={searchQuery}
                                 onChange={(e) => setSearchQuery(e.target.value)}
                                style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
                                />
                                
                                {searchQuery.length > 0 && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} onClick={() => setSearchQuery('')} style={s.clearBtn}>
                                        <FaTimes size={10} color="#fff" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'sort' && (
                        <motion.div
                            key="sort"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden', display: 'flex', gap: '8px' }}
                        >
                            <OptionChip 
                                label={langIndex===0 ? 'Важность' : 'Priority'} 
                                icon={<FaExclamation size={10}/>}
                                isActive={sortParams === 1} 
                                onClick={() => {setSortParams(1); playEffects(clickSound);}} theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Сложность' : 'Difficulty'} 
                                icon={<FaSortNumericDown size={12}/>}
                                isActive={sortParams === 0} 
                                onClick={() => {setSortParams(0); playEffects(clickSound);}} theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Дедлайн' : 'Deadline'} 
                                icon={<FaCalendarDay size={12}/>}
                                isActive={sortParams === 2} 
                                onClick={() => {setSortParams(2); playEffects(clickSound);}} theme={theme}
                            />
                        </motion.div>
                    )}

                    {activePanel === 'filter' && (
                        <motion.div
                            key="filter"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden', display: 'flex', gap: '8px' }}
                        >
                            <OptionChip 
                                label={langIndex===0 ? 'Все' : 'All'} 
                                isActive={filterParams === 0} 
                                onClick={() => {setFilterParams(0); playEffects(clickSound);}} theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'В процессе' : 'Active'} 
                                isActive={filterParams === 2} 
                                onClick={() => {setFilterParams(2); playEffects(clickSound);}} theme={theme}
                            />
                             <OptionChip 
                                label={langIndex===0 ? 'Готово' : 'Done'} 
                                isActive={filterParams === 1} 
                                onClick={() => {setFilterParams(1); playEffects(clickSound);}} theme={theme}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- LIST AREA --- */}
            <div style={s.panel} className="no-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {sortedList.length === 0 ? (
                         <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                            style={s.emptyState}
                         >
                             <FaInbox size={40} style={{marginBottom: 10, opacity: 0.5}}/>
                             <span>{langIndex === 0 ? 'Задач нет' : 'No tasks found'}</span>
                         </motion.div>
                    ) : (
                        Object.keys(groupedTasks).map((category) => (
                            <CategoryPanel key={category} title={category} theme={theme}>
                                {groupedTasks[category].map((item, index) => (
                                    <CompactCard
                                        key={item.id || index + item.name}
                                        onClick={() => {
                                            // Находим реальный индекс в полном списке AppData
                                            const realIndex = AppData.todoList.indexOf(item);
                                            setCurrentIndex(realIndex);
                                            setShowToDo(true);
                                            playEffects(clickSound);
                                        }}
                                        onCheck={(e) => handleQuickComplete(e, item)}
                                        item={item}
                                        theme={theme}
                                        lang={langIndex}
                                        fSize={fSize}
                                    />
                                ))}
                            </CategoryPanel>
                        ))
                    )}
                </AnimatePresence>
                
                <div style={{height: '120px', width: '100%'}}></div>
            </div>

            {/* --- MODALS --- */}
            <ToDoPage 
                show={showToDo} 
                setShow={setShowToDo} 
                theme={theme} 
                lang={langIndex} 
                fSize={fSize} 
                // Передаем объект задачи напрямую
                task={AppData.todoList[currentIndex] || {}} 
            />
            {showMetrics && <ToDoMetrics theme={theme} lang={langIndex} onClose={() => setShowMetrics(false)} />}
            <ToDoNew theme={theme} lang={langIndex} fSize={fSize} />
        </div>
    );
};

export default ToDoMain;

// --- COMPONENTS ---

const HeaderIconButton = ({ icon, isActive, onClick, theme }) => {
    const isDark = theme === 'dark';
    const activeColor = Colors.get('accent', theme);
    const bg = isActive ? activeColor : (isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF');
    const color = isActive ? '#FFFFFF' : Colors.get('mainText', theme);

    return (
        <motion.div 
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{
                width: '40px', height: '40px', borderRadius: '14px',
                backgroundColor: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isActive ? `0 4px 12px ${activeColor}60` : (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'),
                color: color,
                transition: 'all 0.3s ease'
            }}
        >
            {icon}
        </motion.div>
    );
};

const OptionChip = ({ label, icon, isActive, onClick, theme }) => {
    const isDark = theme === 'dark';
    const activeColor = Colors.get('accent', theme);
    
    return (
        <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: isActive ? activeColor : (isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'),
                color: isActive ? '#FFFFFF' : Colors.get('subText', theme),
                fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
                cursor: 'pointer',
                border: isActive ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: isActive ? `0 4px 12px ${activeColor}40` : 'none',
                transition: 'all 0.2s ease'
            }}
        >
            {icon}
            {label}
        </motion.div>
    );
};

const CategoryPanel = ({ title, children, theme }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isLight = theme === 'light' || theme === 'speciallight';
    return (
        <div style={{ width: '100%', marginBottom: '6px' }}>
            <div 
                onClick={() => { setIsOpen(!isOpen); playEffects(clickSound); }}
                style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 25px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none'
                }}
            >
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Segoe UI', color: isLight ? '#1D1D1F' : Colors.get('mainText', theme), opacity: 0.8 }}>
                    {title}
                </div>
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <FaChevronDown size={12} color={isLight ? '#1D1D1F' : '#FFF'} style={{ opacity: 0.4 }} />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- COMPACT CARD WITH CENTERED LAYOUT ---
const CompactCard = ({ onClick, onCheck, item, theme, lang, fSize }) => {
    const isOverdue = isDeadlinePassed(item.deadLine) && !item.isDone;
    const isLight = theme === 'light' || theme === 'speciallight';
    const totalGoals = item.goals ? item.goals.length : 0;
    const doneGoals = item.goals ? item.goals.filter(g => g.isDone).length : 0;
    
    // Determine colors
    let rawColor = item.color || Colors.get('accent', theme);
    if (rawColor && rawColor.length > 7 && rawColor.startsWith('#')) { rawColor = rawColor.substring(0, 7); }
    const accentColor = rawColor;

    let cardBg = isLight ? '#FFFFFF' : (Colors.get('simplePanel', theme) + 'CC');
    let borderColor = isLight ? 'transparent' : `1px solid ${Colors.get('border', theme)}80`;
    let shadow = isLight ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)';

    const iconBg = item.isDone ? `${accentColor}15` : `${accentColor}25`;
    const iconBorder = item.isDone ? 'transparent' : `${accentColor}40`; 

    // Attribute colors
    const prioColor = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS[0];
    const diffColor = DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0];
    const urgColor = URGENCY_COLORS[item.urgency || 0] || URGENCY_COLORS[0];

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, transition: {duration: 0.2} }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                width: "88%",
                minHeight: "80px", 
                borderRadius: "20px",
                marginBottom: "8px",
                padding: '10px 12px',
                display: 'flex', flexDirection: 'row', alignItems: 'center',
                position: 'relative', overflow: 'hidden', cursor: 'pointer',
                backgroundColor: cardBg, backdropFilter: isLight ? 'none' : 'blur(20px)',
                border: borderColor, boxShadow: shadow,
                opacity: item.isDone ? 0.6 : 1,
            }}
        >
            {/* Icon */}
            <div style={{ width: '42px', height: '42px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: iconBg, color: accentColor, fontSize: '20px', marginRight: '14px', flexShrink: 0, border: `1px solid ${iconBorder}` }}>
                {item.icon || '📝'}
            </div>
            
            {/* Info Container with Centered Alignment */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', gap: '6px', marginRight: '14px' }}>
                
                {/* Title and Category */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap: '5px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', color: Colors.get('subText', theme), opacity: 0.7 }}>
                            {item.category || (lang === 0 ? "Общее" : "General")}
                        </span>
                        {(isOverdue || item.priority >= 3) && !item.isDone && (<div style={{width:'5px', height:'5px', borderRadius:'50%', backgroundColor: '#FF453A'}} />)}
                    </div>
                    <div style={{ fontSize: fSize === 0 ? '16px' : '17px', fontWeight: '700', color: item.isDone ? Colors.get('subText', theme) : Colors.get('mainText', theme), textDecoration: item.isDone ? 'line-through' : 'none', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                        {item.name}
                    </div>
                </div>

                {/* Attributes Row (Priority, Diff, Urgency, Deadline) */}
                {!item.isDone && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                        <MiniBadge icon={<FaFlag size={8}/>} text={PRIORITY_LABELS[item.priority]?.[lang]} color={prioColor} />
                        <MiniBadge icon={<FaLayerGroup size={8}/>} text={DIFFICULTY_LABELS[item.difficulty]?.[lang]} color={diffColor} />
                        <MiniBadge icon={<FaExclamation size={8}/>} text={URGENCY_LABELS[item.urgency || 0]?.[lang]} color={urgColor} />
                        
                        {item.deadLine && (
                            // Deadline displayed as a MiniBadge for consistency
                            <MiniBadge 
                                icon={isOverdue ? <FaFire size={8}/> : <FaCalendarDay size={8}/>}
                                text={getDeadlineText(item.deadLine, lang)}
                                color={isOverdue ? '#FF453A' : Colors.get('subText', theme)}
                            />
                        )}
                        
                        {totalGoals > 0 && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: Colors.get('subText', theme), marginLeft: '4px' }}>
                                <FaListUl size={10} style={{opacity: 0.7}}/>
                                <span>{doneGoals}/{totalGoals}</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Checkbox Button */}
            <div onClick={onCheck} style={{ width: '26px', height: '26px', borderRadius: '9px', border: item.isDone ? 'none' : `2px solid ${Colors.get('border', theme)}`, backgroundColor: item.isDone ? '#32D74B' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                {item.isDone && <FaCheck size={12} color="#FFF" />}
            </div>

            {/* Progress Bar */}
            {!item.isDone && totalGoals > 0 && (<div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}><motion.div initial={{ width: 0 }} animate={{ width: `${(doneGoals / totalGoals) * 100}%` }} style={{ height: '100%', backgroundColor: accentColor }} /></div>)}
        </motion.div>
    );
};

// Mini Badge Component
const MiniBadge = ({ icon, text, color }) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', gap: '3px', 
        padding: '2px 5px', borderRadius: '5px', 
        backgroundColor: `${color}15`, border: `1px solid ${color}30`,
        color: color, fontSize: '9px', fontWeight: '700',
        whiteSpace: 'nowrap'
    }}>
        {icon}
        {text && <span>{text}</span>}
    </div>
);

// --- STYLES ---
const styles = (theme, fSize) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight ? '#F2F4F6' : Colors.get('background', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    return {
        container: { 
            backgroundColor: bg, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            height: '100vh', width: '100vw', 
            fontFamily: 'Segoe UI', overflowY: 'hidden' 
        },
        panel: { 
            display: 'flex', flexDirection: 'column', width: '100%', flex: 1, 
            alignItems: 'center', justifyContent: 'start', overflowY: 'scroll', paddingTop: '2px' 
        },
        emptyState: {
            marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            color: sub, fontSize: '16px', fontWeight: '600'
        },
        inputContainer: {
            width: '100%', height: '44px',
            backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center',justifyContent: 'space-around',
            border: isLight ? 'none' : `1px solid ${Colors.get('border', theme)}60`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            position: 'relative'
        },
        input: {
            flex: 1, height: '100%',
            border: 'none', outline: 'none',
            backgroundColor: 'transparent',
            padding: '0 12px',
            fontSize: '15px', fontWeight: '600',
            fontFamily: 'Segoe UI',
            color: Colors.get('mainText', theme)
        },
        clearBtn: {
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: 'rgba(128,128,128,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '12px', cursor: 'pointer'
        }
    };
};

// --- HELPERS ---

function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play().catch(e => console.log("Audio play failed", e));
    }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
        return new Date(dateStr); // YYYY-MM-DD
    } else if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]); // DD.MM.YYYY
    }
    return new Date(dateStr);
}

function daysToDeadlineNum(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return 9999;
    const now = new Date();
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

function isDeadlinePassed(dateStr) {
    const days = daysToDeadlineNum(dateStr);
    return days < 0;
}

function getDeadlineText(dateStr, lang) {
    if (!dateStr) return '';
    const days = daysToDeadlineNum(dateStr);
    
    if (lang === 0) { // RU
        if (days === 0) return "Сегодня";
        if (days === 1) return "Завтра";
        if (days < 0) return `${Math.abs(days)} дн. назад`;
        return `${days} дн.`;
    } else { // EN
        if (days === 0) return "Today";
        if (days === 1) return "Tmrw";
        if (days < 0) return `${Math.abs(days)}d ago`;
        return `${days}d left`;
    }
}