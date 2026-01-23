import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, addNewTrainingDay$ } from '../../StaticClasses/HabitsBus';
import { TODO_LIST } from './ToDoHelper.js';
import { 
    FaSortAmountDown, 
    FaFilter, 
    FaCheckCircle, 
    FaExclamationCircle, 
    FaClock, 
    FaFlag, 
    FaLayerGroup 
} from 'react-icons/fa';
import ToDoPage from './ToDoPage.jsx';

const clickSound = new Audio('Audio/Click.wav');

// --- CONSTANTS ---
const PRIORITY_COLORS = ['#B0BEC5', '#4FC3F7', '#FFD54F', '#FF9800', '#F44336']; // Grey -> Red
const DIFFICULTY_COLORS = ['#AED581', '#81C784', '#FFB74D', '#FF8A65', '#D32F2F']; // Green -> Red

const ToDoMain = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [showToDo, setShowToDo] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sortedList, setSortedList] = useState(TODO_LIST);

    const [filterparams, setFilterParams] = useState(0);
    const [sortparams, setSortParams] = useState(0);

    // Subscriptions
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

    useEffect(() => {
        sortList();
    }, [filterparams, sortparams]);

    function sortList() {
        let newList = [...TODO_LIST];
        if (filterparams === 1) {
            newList = newList.filter(task => task.isDone);
        } else if (filterparams === 2) {
            newList = newList.filter(task => !task.isDone);
        }
        if (sortparams === 0) {
            newList.sort((a, b) => b.difficulty - a.difficulty);
        } else if (sortparams === 1) {
            newList.sort((a, b) => b.priority - a.priority);
        } else if (sortparams === 2) {
            newList.sort((a, b) => daystodeadline(a.deadLine) - daystodeadline(b.deadLine));
        }
        setSortedList(newList);
    }

    // Helper for UI Labels
    const getSortLabel = () => {
        const labels = [
            langIndex === 0 ? 'Сложность' : 'Difficulty',
            langIndex === 0 ? 'Приоритет' : 'Priority',
            langIndex === 0 ? 'Дедлайн' : 'Deadline'
        ];
        return labels[sortparams];
    };

    const getFilterLabel = () => {
        const labels = [
            langIndex === 0 ? 'Все' : 'All',
            langIndex === 0 ? 'Готово' : 'Done',
            langIndex === 0 ? 'В процессе' : 'Active'
        ];
        return labels[filterparams];
    };

    return (
        <div style={styles(theme, fSize).container}>
            {/* Header / Controls */}
            <div style={styles(theme).controlBar}>
                <motion.div 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setSortParams(prev => prev + 1 < 3 ? prev + 1 : 0);
                        playEffects(clickSound);
                    }} 
                    style={styles(theme).controlButton}
                >
                    <div style={styles(theme).iconCircle}>
                        <FaSortAmountDown size={12} />
                    </div>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                        <span style={styles(theme).controlLabel}>{langIndex === 0 ? 'Сортировка' : 'Sort by'}</span>
                        <span style={styles(theme).controlValue}>{getSortLabel()}</span>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setFilterParams(prev => prev + 1 < 3 ? prev + 1 : 0);
                        playEffects(clickSound);
                    }} 
                    style={styles(theme).controlButton}
                >
                    <div style={styles(theme).iconCircle}>
                        <FaFilter size={12} />
                    </div>
                    <div style={{display:'flex', flexDirection:'column', alignItems:'flex-start'}}>
                        <span style={styles(theme).controlLabel}>{langIndex === 0 ? 'Фильтр' : 'Filter'}</span>
                        <span style={styles(theme).controlValue}>{getFilterLabel()}</span>
                    </div>
                </motion.div>
            </div>

            {/* List */}
            <div style={styles(theme, fSize).panel}>
                <AnimatePresence>
                    {sortedList.map((item, index) => (
                        <Card
                            key={item.id || index}
                            index={index}
                            onClick={() => {
                                setCurrentIndex(index);
                                setShowToDo(true);
                                playEffects(clickSound);
                            }}
                            item={item} // Pass whole item object
                            theme={theme}
                            lang={langIndex}
                            fSize={fSize}
                        />
                    ))}
                </AnimatePresence>
                <div style={{height: '100px'}}></div>
            </div>

            <ToDoPage show={showToDo} setShow={setShowToDo} theme={theme} lang={langIndex} fSize={fSize} index={currentIndex} />
        </div>
    );
};

export default ToDoMain;

// --- MODERN CARD COMPONENT ---
function Card({ index, onClick, item, theme, lang, fSize }) {
    const isOverdue = isDeadline(item.deadLine) && !item.isDone;
    const isDark = theme === 'dark';
    const progressText = getInfo(item); // e.g., "3/5"

    // Priority Indicator Color
    const priorityColor = PRIORITY_COLORS[item.priority] || PRIORITY_COLORS[0];
    const difficultyColor = DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0];

    const cardStyle = {
        alignItems: "center",
        justifyContent: "space-between",
        display: 'flex',
        flexDirection: 'row',
        minHeight: "85px",
        width: "92%",
        borderRadius: "24px",
        marginBottom: "12px",
        padding: '12px',
        // Glassmorphism
        backgroundColor: isDark 
            ? Colors.get('simplePanel', theme) + '99' 
            : '#FFFFFF',
        backdropFilter: isDark ? 'blur(40px)' : 'none',
        border: `1px solid ${isDark ? Colors.get('border', theme) + '30' : '#E5E7EB'}`,
        boxShadow: isDark 
            ? '0 4px 20px rgba(0, 0, 0, 0.2)' 
            : '0 4px 15px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
    };

    const iconBoxStyle = {
        width: '50px',
        height: '50px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '14px',
        backgroundColor: item.color, 
        color: '#fff', 
        fontSize: '22px',
        boxShadow: `0 4px 12px ${item.color}50`, 
        flexShrink: 0
    };

    return (
        <motion.div 
            layout 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={cardStyle} 
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
        >
            {/* Left: Icon */}
            <div style={iconBoxStyle}>
                {item.icon}
            </div>

            {/* Middle: Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', marginRight: '8px' }}>
                <div style={{ ...styles(theme, fSize).cardTitle, opacity: item.isDone ? 0.6 : 1, textDecoration: item.isDone ? 'line-through' : 'none' }}>
                    {item.name}
                </div>
                
                {/* Meta Row: Badges instead of Emojis */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                    
                    {/* Priority Badge */}
                    <div style={styles(theme).badge(priorityColor)}>
                        <FaFlag size={8} />
                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.priority + 1}</span>
                    </div>

                    {/* Difficulty Badge */}
                    <div style={styles(theme).badge(difficultyColor)}>
                        <FaLayerGroup size={8} />
                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{item.difficulty + 1}</span>
                    </div>

                </div>
            </div>

            {/* Right: Status & Deadline */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', minWidth: '70px' }}>
                
                {/* Progress Counter */}
                <div style={{ fontSize: '13px', fontWeight: '700', color: Colors.get('subText', theme), marginBottom: '6px' }}>
                    {progressText}
                </div>

                {/* Status Indicator */}
                <div style={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    color: isOverdue ? '#FF5252' : item.isDone ? '#4CAF50' : Colors.get('mainText', theme),
                    backgroundColor: isOverdue ? '#FF525215' : item.isDone ? '#4CAF5015' : 'transparent',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {item.isDone ? <FaCheckCircle size={10} /> : isOverdue ? <FaExclamationCircle size={10} /> : <FaClock size={10} />}
                    {daysToDeadline(item.deadLine, lang)}
                </div>
            </div>

            {/* Left Border Status Indicator */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '4px',
                backgroundColor: item.isDone ? '#4CAF50' : isOverdue ? '#FF5252' : 'transparent'
            }} />
        </motion.div>
    );
}

const styles = (theme, fSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'hidden',
        alignItems: 'center',
        height: '100vh',
        width: '100vw',
        fontFamily: 'Segoe UI',
    },
    controlBar: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '92%',
        height: '60px',
        marginTop: '15vh', // Offset for main menu
        marginBottom: '10px',
        gap: '12px'
    },
    controlButton: {
        flex: 1,
        height: '50px',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        cursor: 'pointer',
        border: `1px solid ${Colors.get('border', theme)}50`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    },
    iconCircle: {
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '10px',
        color: Colors.get('mainText', theme)
    },
    controlLabel: {
        fontSize: '10px',
        color: Colors.get('subText', theme),
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    controlValue: {
        fontSize: '13px',
        fontWeight: '700',
        color: Colors.get('mainText', theme)
    },
    panel: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'start',
        overflowY: 'scroll',
        paddingTop: '5px'
    },
    cardTitle: {
        textAlign: "left",
        marginBottom: "2px",
        fontSize: fSize === 0 ? "16px" : "18px",
        fontWeight: '700',
        color: Colors.get('mainText', theme),
        lineHeight: '1.2'
    },
    badge: (color) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '6px',
        backgroundColor: `${color}20`, // Transparent bg
        color: color,
        border: `1px solid ${color}40`
    })
});

// --- HELPER FUNCTIONS ---

function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

const getInfo = (item) => {
    if (!item.goals) return '0/0';
    const doneAmount = item.goals.filter(g => g.isDone).length;
    return `${doneAmount}/${item.goals.length}`;
};

function daysToDeadline(date, langIndex) {
    const deadline = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    if (langIndex === 0) { // Russian
        if (diffDays === 0) return "Сегодня";
        if (diffDays === 1) return "Завтра";
        if (diffDays < 0) return `${Math.abs(diffDays)} д. назад`;
        return `${diffDays} д.`;
    }

    // English
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomrw";
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    return `${diffDays}d left`;
}

const isDeadline = (date) => {
    const deadline = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    return deadline < now;
};
const daystodeadline = (date) => {
    const deadline = new Date(date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};