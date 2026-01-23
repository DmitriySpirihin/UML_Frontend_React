import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TODO_LIST } from "./ToDoHelper";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { 
    FaCheck, 
    FaCalendarDay, 
    FaFlag, 
    FaTimes, 
    FaClock, 
    FaChevronDown,
    FaTasks,
    FaLayerGroup,
    FaCircle
} from "react-icons/fa";

// --- MODERN CONSTANTS ---
// 0: Russian, 1: English
const PRIORITY_LABELS = [
    ['Низкий', 'Low'],
    ['Обычный', 'Normal'],
    ['Важный', 'Important'],
    ['Высокий', 'High'],
    ['Критический', 'Critical']
];

const DIFFICULTY_LABELS = [
    ['Очень легко', 'Very Easy'],
    ['Легко', 'Easy'],
    ['Средне', 'Medium'],
    ['Сложно', 'Hard'],
    ['Кошмар', 'Nightmare']
];

// Color Scales (Green -> Red)
const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336']; 
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];

const ToDoPage = ({ show, setShow, theme, lang, fSize, index }) => {
    const task = TODO_LIST[index] || TODO_LIST[0]; 
    const isDark = theme === 'dark';

    const totalGoals = task.goals.length;
    const completedGoals = task.goals.filter(g => g.isDone).length;
    const progressPercent = totalGoals === 0 ? (task.isDone ? 100 : 0) : Math.round((completedGoals / totalGoals) * 100);

    // Helper to get current label/color
    const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS[0];
    const difficultyColor = DIFFICULTY_COLORS[task.difficulty] || DIFFICULTY_COLORS[0];
    
    const priorityLabel = PRIORITY_LABELS[task.priority] ? PRIORITY_LABELS[task.priority][lang] : PRIORITY_LABELS[0][lang];
    const difficultyLabel = DIFFICULTY_LABELS[task.difficulty] ? DIFFICULTY_LABELS[task.difficulty][lang] : DIFFICULTY_LABELS[0][lang];

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    const modalVariants = {
        hidden: { y: "100%", opacity: 0, scale: 0.95 },
        visible: { 
            y: "0%", 
            opacity: 1, 
            scale: 1,
            transition: { type: "spring", damping: 28, stiffness: 320, mass: 0.8 }
        },
        exit: { 
            y: "100%", 
            opacity: 0, 
            scale: 0.95,
            transition: { ease: "easeInOut", duration: 0.25 }
        }
    };

    return (
        <AnimatePresence>
            {show && (
                <>
                    <motion.div
                        variants={backdropVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        onClick={() => setShow(false)}
                        style={styles(theme).backdrop}
                    />

                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        style={styles(theme).modalContainer}
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={{ top: 0, bottom: 0.2 }}
                        onDragEnd={(e, info) => {
                            if (info.offset.y > 150) setShow(false);
                        }}
                    >
                        <div style={styles(theme).dragArea}>
                            <div style={styles(theme).dragHandle} />
                        </div>

                        <div style={styles(theme).scrollableContent}>
                            
                            {/* --- HEADER --- */}
                            <div style={styles(theme, null, task.color).headerWrapper}>
                                <div style={styles(theme).headerTopRow}>
                                    <div style={styles(theme, null, task.color).iconBadge}>
                                        {task.icon}
                                    </div>
                                    <div style={styles(theme).statusBadge(task.isDone)}>
                                        {task.isDone ? (lang === 0 ? 'ВЫПОЛНЕНО' : 'COMPLETED') : (lang === 0 ? 'В ПРОЦЕССЕ' : 'IN PROGRESS')}
                                    </div>
                                </div>

                                <h2 style={styles(theme, fSize).title}>{task.name}</h2>
                                
                                <div style={styles(theme).progressContainer}>
                                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'4px'}}>
                                        <span style={styles(theme).progressText}>{lang === 0 ? 'Прогресс' : 'Progress'}</span>
                                        <span style={styles(theme).progressText}>{progressPercent}%</span>
                                    </div>
                                    <div style={styles(theme).progressBarBg}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            style={styles(theme, null, task.color).progressBarFill} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div style={styles(theme).bodyPadding}>

                                {/* --- MODERN BADGES ROW --- */}
                                <div style={styles(theme).tagsRow}>
                                    
                                    {/* Priority Badge */}
                                    <div style={styles(theme, null, null, priorityColor).modernBadge}>
                                        <div style={styles(theme).badgeLabel}>
                                            <FaFlag style={{marginRight:'6px'}}/> 
                                            {lang === 0 ? 'Приоритет' : 'Priority'}
                                        </div>
                                        <div style={{...styles(theme).badgeValue, color: priorityColor}}>
                                            {priorityLabel}
                                        </div>
                                    </div>

                                    {/* Difficulty Badge */}
                                    <div style={styles(theme, null, null, difficultyColor).modernBadge}>
                                        <div style={styles(theme).badgeLabel}>
                                            <FaLayerGroup style={{marginRight:'6px'}}/>
                                            {lang === 0 ? 'Сложность' : 'Difficulty'}
                                        </div>
                                        <div style={{...styles(theme).badgeValue, color: difficultyColor}}>
                                            {difficultyLabel}
                                        </div>
                                    </div>

                                </div>

                                {/* Description */}
                                <div style={styles(theme).sectionBox}>
                                    <p style={styles(theme, fSize).description}>
                                        {task.description}
                                    </p>
                                </div>

                                {/* Dates */}
                                <div style={styles(theme).gridTwo}>
                                    <div style={styles(theme).dateCard}>
                                        <div style={styles(theme).iconCircle(Colors.get('icons', theme))}>
                                            <FaCalendarDay size={14} color="#fff" />
                                        </div>
                                        <div>
                                            <div style={styles(theme).label}>{lang === 0 ? 'Начало' : 'Start Date'}</div>
                                            <div style={styles(theme).dateValue}>{task.startDate}</div>
                                        </div>
                                    </div>

                                    <div style={styles(theme).dateCard}>
                                        <div style={styles(theme).iconCircle(isDeadline(task.deadLine) && !task.isDone ? Colors.get('skipped', theme) : Colors.get('done', theme))}>
                                            <FaClock size={14} color="#fff" />
                                        </div>
                                        <div>
                                            <div style={styles(theme).label}>{lang === 0 ? 'Дедлайн' : 'Deadline'}</div>
                                            <div style={{...styles(theme).dateValue, color: isDeadline(task.deadLine) && !task.isDone ? Colors.get('skipped', theme) : 'inherit'}}>
                                                {daysToDeadline(task.deadLine, lang)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Note */}
                                {task.note && (
                                    <div style={styles(theme, null, task.color).noteCard}>
                                        <div style={styles(theme).noteHeader}>
                                            <FaFlag size={12} style={{ opacity: 0.7 }} />
                                            <span>{lang === 0 ? 'Заметка' : 'Note'}</span>
                                        </div>
                                        <div style={styles(theme).noteText}>{task.note}</div>
                                    </div>
                                )}

                                {/* Checklist */}
                                <div style={{ marginTop: '25px' }}>
                                    <div style={styles(theme).sectionHeader}>
                                        <FaTasks style={{ marginRight: '8px', color: Colors.get('accent', theme) }} />
                                        {lang === 0 ? 'Чек-лист' : 'Checklist'} 
                                        <span style={styles(theme).counterBadge}>{completedGoals}/{totalGoals}</span>
                                    </div>

                                    <div style={styles(theme).goalsContainer}>
                                        {task.goals.map((goal, idx) => (
                                            <div key={idx} style={styles(theme).goalRow}>
                                                <div style={styles(theme, null, task.color).checkbox(goal.isDone)}>
                                                    {goal.isDone && <FaCheck size={10} color="#fff" />}
                                                </div>
                                                <div style={styles(theme).goalText(goal.isDone, fSize)}>
                                                    {goal.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ height: '100px' }} />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={styles(theme).footer}>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShow(false)} 
                                style={styles(theme, null, task.color).closeButton}
                            >
                                {lang === 0 ? 'Закрыть' : 'Close'}
                                <FaChevronDown size={12} style={{ marginLeft: '8px' }} />
                            </motion.button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ToDoPage;

const styles = (theme, fSize, accentColor, badgeColor) => ({
    // ... (Keep previous container, modal, drag styles)
    backdrop: {
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        zIndex: 1999
    },
    modalContainer: {
        position: 'fixed',
        bottom: 0, left: 0, right: 0,
        height: '90vh',
        backgroundColor: Colors.get('background', theme),
        borderTopLeftRadius: '32px',
        borderTopRightRadius: '32px',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 50px rgba(0,0,0,0.4)',
        overflow: 'hidden'
    },
    dragArea: {
        width: '100%',
        padding: '12px 0 8px 0',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: Colors.get('background', theme),
        cursor: 'grab'
    },
    dragHandle: {
        width: '40px',
        height: '4px',
        backgroundColor: Colors.get('border', theme),
        borderRadius: '10px',
        opacity: 0.5
    },
    scrollableContent: {
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none'
    },
    
    // Header
    headerWrapper: {
        padding: '10px 24px 30px 24px',
        background: `linear-gradient(180deg, ${Colors.get('background', theme)} 0%, ${Colors.get('simplePanel', theme)} 100%)`,
        borderBottom: `1px solid ${Colors.get('border', theme)}50`
    },
    headerTopRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    iconBadge: {
        width: '56px',
        height: '56px',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '28px',
        backgroundColor: accentColor ? `${accentColor}20` : 'rgba(128,128,128,0.1)',
        border: `1px solid ${accentColor}40`,
        boxShadow: `0 8px 20px ${accentColor}25`
    },
    statusBadge: (isDone) => ({
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '800',
        letterSpacing: '0.5px',
        backgroundColor: isDone ? Colors.get('done', theme) + '15' : Colors.get('accent', theme) + '15',
        color: isDone ? Colors.get('done', theme) : Colors.get('accent', theme),
        border: `1px solid ${isDone ? Colors.get('done', theme) : Colors.get('accent', theme)}30`
    }),
    title: {
        fontSize: fSize === 0 ? '24px' : '28px',
        fontWeight: '800',
        color: Colors.get('mainText', theme),
        lineHeight: '1.2',
        marginBottom: '20px',
        fontFamily: 'Segoe UI, sans-serif'
    },
    progressContainer: { width: '100%' },
    progressText: {
        fontSize: '12px',
        fontWeight: '600',
        color: Colors.get('subText', theme),
    },
    progressBarBg: {
        width: '100%',
        height: '8px',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        borderRadius: '4px',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: accentColor || Colors.get('accent', theme),
        borderRadius: '4px',
        boxShadow: `0 0 10px ${accentColor}60`
    },

    // --- Body ---
    bodyPadding: { padding: '24px' },
    
    // Modern Badges
    tagsRow: {
        display: 'flex',
        gap: '12px',
        marginBottom: '24px'
    },
    modernBadge: {
        flex: 1,
        backgroundColor: badgeColor ? `${badgeColor}10` : Colors.get('simplePanel', theme), // 10% opacity bg
        borderRadius: '16px',
        padding: '12px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${badgeColor}30`
    },
    badgeLabel: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '11px',
        color: Colors.get('subText', theme),
        marginBottom: '4px',
        textTransform: 'uppercase',
        fontWeight: '600',
        letterSpacing: '0.5px'
    },
    badgeValue: {
        fontSize: '14px',
        fontWeight: '800',
    },

    // Other Content
    sectionBox: { marginBottom: '24px' },
    description: {
        fontSize: fSize === 0 ? '15px' : '17px',
        lineHeight: '1.6',
        color: Colors.get('mainText', theme),
        opacity: 0.9,
        margin: 0
    },
    gridTwo: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '24px'
    },
    dateCard: {
        backgroundColor: Colors.get('simplePanel', theme),
        padding: '14px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: `1px solid ${Colors.get('border', theme)}`
    },
    iconCircle: (color) => ({
        width: '32px',
        height: '32px',
        borderRadius: '10px',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 4px 10px ${color}40`
    }),
    label: {
        fontSize: '11px',
        color: Colors.get('subText', theme),
        marginBottom: '2px'
    },
    dateValue: {
        fontSize: '13px',
        fontWeight: '700',
        color: Colors.get('mainText', theme)
    },
    noteCard: {
        backgroundColor: `${accentColor}10`,
        border: `1px solid ${accentColor}30`,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '24px'
    },
    noteHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '12px',
        fontWeight: '700',
        color: accentColor || Colors.get('accent', theme),
        marginBottom: '8px',
        textTransform: 'uppercase'
    },
    noteText: {
        fontSize: '14px',
        color: Colors.get('mainText', theme),
        fontStyle: 'italic',
        lineHeight: '1.4'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
        marginBottom: '16px'
    },
    counterBadge: {
        marginLeft: 'auto',
        fontSize: '12px',
        backgroundColor: Colors.get('simplePanel', theme),
        padding: '2px 8px',
        borderRadius: '8px',
        color: Colors.get('subText', theme)
    },
    goalsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    goalRow: {
        display: 'flex',
        alignItems: 'flex-start',
        padding: '12px',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
        borderRadius: '14px',
        border: `1px solid ${Colors.get('border', theme)}`,
        gap: '12px'
    },
    checkbox: (checked) => ({
        width: '20px',
        height: '20px',
        borderRadius: '6px',
        border: `2px solid ${checked ? (accentColor || Colors.get('accent', theme)) : Colors.get('subText', theme)}`,
        backgroundColor: checked ? (accentColor || Colors.get('accent', theme)) : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '2px',
        transition: 'all 0.2s'
    }),
    goalText: (checked, fS) => ({
        fontSize: fS === 0 ? '14px' : '16px',
        color: Colors.get('mainText', theme),
        opacity: checked ? 0.5 : 1,
        textDecoration: checked ? 'line-through' : 'none',
        transition: 'all 0.2s',
        lineHeight: '1.4'
    }),
    footer: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        padding: '16px 24px 32px 24px',
        background: `linear-gradient(0deg, ${Colors.get('background', theme)} 40%, rgba(0,0,0,0) 100%)`,
        display: 'flex',
        justifyContent: 'center'
    },
    closeButton: {
        width: '100%',
        height: '50px',
        backgroundColor: Colors.get('mainText', theme),
        color: Colors.get('background', theme),
        border: 'none',
        borderRadius: '16px',
        fontSize: '16px',
        fontWeight: '700',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
    }
});

// Logic
const isDeadline = (dateStr) => {
    if (!dateStr) return false;
    const parts = dateStr.split('.');
    if (parts.length !== 3) return false;
    const deadline = new Date(parts[2], parts[1] - 1, parts[0]);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return deadline < now;
};

function daysToDeadline(dateStr, langIndex) {
    if (!dateStr) return "";
    const parts = dateStr.split('.');
    const deadline = new Date(parts[2], parts[1] - 1, parts[0]);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return langIndex === 0 ? "Сегодня" : "Today";
    if (diffDays < 0) return langIndex === 0 ? `Просрочено (${Math.abs(diffDays)})` : `Overdue (${Math.abs(diffDays)})`;
    return langIndex === 0 ? `${diffDays} дн.` : `${diffDays} days`;
}