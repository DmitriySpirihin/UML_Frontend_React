import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, setAddPanel } from '../../StaticClasses/HabitsBus';
import { 
    FaSortAmountDown, 
    FaFilter, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaClock, 
    FaFlag, 
    FaLayerGroup,
    FaInbox
} from 'react-icons/fa';
import ToDoPage from './ToDoPage.jsx';
import ToDoNew from './ToDoNew.jsx';

const clickSound = new Audio('Audio/Click.wav');

// --- CONSTANTS ---
const PRIORITY_COLORS = ['#B0BEC5', '#4FC3F7', '#FFD54F', '#FF9800', '#F44336']; // Grey -> Red
const DIFFICULTY_COLORS = ['#AED581', '#81C784', '#FFB74D', '#FF8A65', '#D32F2F']; // Green -> Red

const ToDoMain = () => {
    // Global State
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // Local UI State
    const [showToDo, setShowToDo] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Forces list re-render
    const [sortedList, setSortedList] = useState([]);
    const [currentTask, setCurrentTask] = useState({});

    // Filter/Sort State
    const [filterParams, setFilterParams] = useState(0); // 0: All, 1: Done, 2: Active
    const [sortParams, setSortParams] = useState(1); // 0: Diff, 1: Prio, 2: Date

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
        };
    }, []);

    // --- LOGIC ---

    // Re-fetch and sort whenever params change or refresh is triggered
    useEffect(() => {
        let newList = [...AppData.todoList];

        // 1. Filter
        if (filterParams === 1) {
            newList = newList.filter(task => task.isDone);
        } else if (filterParams === 2) {
            newList = newList.filter(task => !task.isDone);
        }

        // 2. Sort
        if (sortParams === 0) { // Difficulty (High to Low)
            newList.sort((a, b) => b.difficulty - a.difficulty);
        } else if (sortParams === 1) { // Priority (High to Low)
            newList.sort((a, b) => b.priority - a.priority);
        } else if (sortParams === 2) { // Deadline (Soonest first)
            newList.sort((a, b) => daysToDeadlineNum(a.deadLine) - daysToDeadlineNum(b.deadLine));
        }

        setSortedList(newList);
    }, [filterParams, sortParams, refreshTrigger, showToDo]);

    // Handlers
    const handleCardClick = (task) => {
        setCurrentTask(task);
        setShowToDo(true);
        playEffects(clickSound);
    };

    const handleCreateClick = () => {
        setAddPanel('ToDoNew');
        playEffects(clickSound);
    };

    // UI Helpers
    const getSortLabel = () => {
        const labels = [
            langIndex === 0 ? 'Сложность' : 'Difficulty',
            langIndex === 0 ? 'Приоритет' : 'Priority',
            langIndex === 0 ? 'Дедлайн' : 'Deadline'
        ];
        return labels[sortParams];
    };

    const getFilterLabel = () => {
        const labels = [
            langIndex === 0 ? 'Все' : 'All',
            langIndex === 0 ? 'Готово' : 'Done',
            langIndex === 0 ? 'В процессе' : 'Active'
        ];
        return labels[filterParams];
    };

    const s = styles(theme, fSize);

    return (
        <div style={s.container}>
            
            {/* --- HEADER CONTROLS --- */}
            <div style={s.controlBar}>
                {/* Sort Button */}
                <motion.div 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                        setSortParams(prev => prev + 1 < 3 ? prev + 1 : 0);
                        playEffects(clickSound);
                    }} 
                    style={s.controlButton}
                >
                    <div style={s.iconCircle}>
                        <FaSortAmountDown size={14} />
                    </div>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <span style={s.controlLabel}>{langIndex === 0 ? 'Сортировка' : 'Sort By'}</span>
                        <span style={s.controlValue}>{getSortLabel()}</span>
                    </div>
                </motion.div>
                
                {/* Filter Button */}
                <motion.div 
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                        setFilterParams(prev => prev + 1 < 3 ? prev + 1 : 0);
                        playEffects(clickSound);
                    }} 
                    style={s.controlButton}
                >
                    <div style={s.iconCircle}>
                        <FaFilter size={12} />
                    </div>
                    <div style={{display:'flex', flexDirection:'column'}}>
                        <span style={s.controlLabel}>{langIndex === 0 ? 'Фильтр' : 'Filter'}</span>
                        <span style={s.controlValue}>{getFilterLabel()}</span>
                    </div>
                </motion.div>
            </div>

            {/* --- LIST AREA --- */}
            <div style={s.panel} className="no-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {sortedList.length > 0 ? (
                        sortedList.map((item) => (
                            <Card
                                key={item.id} // Ensure ID is unique
                                item={item}
                                onClick={() => handleCardClick(item)}
                                theme={theme}
                                lang={langIndex}
                                fSize={fSize}
                            />
                        ))
                    ) : (
                        // Empty State
                        <motion.div 
                            initial={{opacity:0}} animate={{opacity:0.5}} 
                            style={s.emptyState}
                        >
                            <FaInbox size={40} style={{marginBottom: 10}}/>
                            <span>{langIndex === 0 ? 'Задач нет' : 'No tasks found'}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Bottom padding for FAB */}
                <div style={{height: '120px', width: '100%'}}></div>
            </div>

            {/* --- MODALS --- */}
            <ToDoPage 
                show={showToDo} 
                setShow={setShowToDo} 
                theme={theme} 
                lang={langIndex} 
                fSize={fSize} 
                task={currentTask} 
            />
            <ToDoNew theme={theme} lang={langIndex} fSize={fSize} />
        </div>
    );
};

export default ToDoMain;

// --- MODERN CARD COMPONENT ---
const Card = ({ item, onClick, theme, lang, fSize }) => {
    const isDark = theme === 'dark';
    const isOverdue = isDeadlinePassed(item.deadLine) && !item.isDone;
    const progressText = getProgressString(item);

    // Colors
    const priorityColor = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS[0];
    const difficultyColor = DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0];
    const statusColor = item.isDone ? Colors.get('done', theme) : (isOverdue ? Colors.get('skipped', theme) : Colors.get('mainText', theme));
    
    // Background based on completion
    const bgOpacity = item.isDone ? '50' : '99'; 

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                ...styles(theme).card,
                backgroundColor: isDark ? `${Colors.get('simplePanel', theme)}${bgOpacity}` : '#FFFFFF',
                borderLeft: `4px solid ${isOverdue ? '#EF4444' : (item.isDone ? '#10B981' : 'transparent')}`
            }}
        >
            {/* 1. Icon Box */}
            <div style={styles(theme).iconBox(item.color)}>
                {item.icon || '📝'}
            </div>

            {/* 2. Main Content */}
            <div style={styles(theme).cardContent}>
                <div style={styles(theme, fSize).cardTitle(item.isDone)}>
                    {item.name}
                </div>

                {/* Badges Row */}
                <div style={styles(theme).badgeRow}>
                    <Badge color={priorityColor} icon={<FaFlag size={8} />} text={item.priority + 1} />
                    <Badge color={difficultyColor} icon={<FaLayerGroup size={8} />} text={item.difficulty + 1} />
                    {item.isDone && 
                        <Badge color={Colors.get('done', theme)} icon={<FaCheckCircle size={8} />} text={lang === 0 ? "Готово" : "Done"} />
                    }
                </div>
            </div>

            {/* 3. Right Stats */}
            <div style={styles(theme).cardRight}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: Colors.get('subText', theme) }}>
                    {progressText}
                </span>
                
                <div style={{ ...styles(theme).dateTag, color: statusColor, borderColor: `${statusColor}30` }}>
                    {isOverdue ? <FaExclamationCircle size={10} /> : <FaClock size={10} />}
                    <span>{getDeadlineText(item.deadLine, lang)}</span>
                </div>
            </div>

        </motion.div>
    );
};

// Tiny components
const Badge = ({ color, icon, text }) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', gap: '4px', 
        padding: '2px 6px', borderRadius: '6px', 
        backgroundColor: `${color}15`, border: `1px solid ${color}30`,
        color: color, fontSize: '10px', fontWeight: 'bold'
    }}>
        {icon}
        <span>{text}</span>
    </div>
);

// --- STYLES ---
const styles = (theme, fSize) => {
    const bg = Colors.get('background', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = Colors.get('border', theme);
    const panel = Colors.get('simplePanel', theme);

    return {
        container: {
            backgroundColor: bg,
            height: '100vh', width: '100vw',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative'
        },
        controlBar: {
            display: 'flex', justifyContent: 'space-between', gap: '12px',
            width: '92%', height: '60px', marginTop: '15vh', marginBottom: '10px'
        },
        controlButton: {
            flex: 1, backgroundColor: panel, borderRadius: '18px',
            display: 'flex', alignItems: 'center', padding: '0 14px', cursor: 'pointer',
            border: `1px solid ${border}`, boxShadow: `0 4px 12px ${Colors.get('shadow', theme)}`
        },
        iconCircle: {
            width: '32px', height: '32px', borderRadius: '10px',
            backgroundColor: `${text}10`, color: text,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '10px'
        },
        controlLabel: { fontSize: '10px', color: sub, textTransform: 'uppercase', fontWeight: 'bold' },
        controlValue: { fontSize: '13px', fontWeight: '800', color: text },
        
        // Panel & Empty State
        panel: {
            flex: 1, width: '100%', overflowY: 'auto', display: 'flex', 
            flexDirection: 'column', alignItems: 'center', paddingTop: '10px'
        },
        emptyState: {
            marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            color: sub, fontSize: '16px', fontWeight: '600'
        },

        // Card Styles
        card: {
            width: '92%', minHeight: '80px', borderRadius: '20px',
            marginBottom: '12px', padding: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            backdropFilter: 'blur(10px)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
            cursor: 'pointer', overflow: 'hidden'
        },
        iconBox: (color) => ({
            width: '48px', height: '48px', borderRadius: '14px',
            backgroundColor: color || '#888', color: '#fff', fontSize: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 4px 10px ${color}40`, flexShrink: 0, marginRight: '12px'
        }),
        cardContent: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
        cardTitle: (isDone) => ({
            fontSize: fSize === 0 ? '16px' : '18px', fontWeight: '700', color: text,
            marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1
        }),
        badgeRow: { display: 'flex', gap: '6px' },
        cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: '70px', gap: '6px' },
        dateTag: {
            fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 8px', borderRadius: '8px', border: '1px solid transparent', backgroundColor: 'transparent'
        },

        // FAB
        fab: {
            position: 'absolute', bottom: '30px', right: '20px',
            width: '56px', height: '56px', borderRadius: '20px',
            backgroundColor: Colors.get('accent', theme) || '#3B82F6',
            border: 'none', boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 10
        }
    };
};

// --- LOGIC HELPERS ---

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

const getProgressString = (item) => {
    if (!item.goals || item.goals.length === 0) return '';
    const done = item.goals.filter(g => g.isDone).length;
    return `${done}/${item.goals.length}`;
};

// Robust date parsing (handles YYYY-MM-DD and DD.MM.YYYY)
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