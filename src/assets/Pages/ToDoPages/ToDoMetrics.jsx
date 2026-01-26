import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$ } from '../../StaticClasses/HabitsBus';
import MyAreaChart from '../../Helpers/MyAreaChart.jsx';
import MyBarChart from '../../Helpers/MyBarChart.jsx';

const ToDoMetrics = () => {
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const fSizeSub = fontSize$.subscribe(setFSize);
        const premiumSub = premium$.subscribe(setHasPremium);
        return () => {
            themeSub.unsubscribe(); langSub.unsubscribe();
            fSizeSub.unsubscribe(); premiumSub.unsubscribe();
        };
    }, []);

    // --- ADVANCED DATA PROCESSING ---
    const stats = useMemo(() => {
        const list = AppData.todoList || [];
        const completed = list.filter(t => t.isDone);
        
        // 1. Основные цифры
        const total = list.length;
        const completedCount = completed.length;
        const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // 2. Сетка активности (Heatmap) за 28 дней
        const heatmapDays = Array.from({length: 28}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = completed.filter(t => t.startDate === dateStr).length;
            return { date: dateStr, count };
        }).reverse();

        // 3. Вычисление "Лучшего дня"
        const dayNames = lang === 0 
            ? ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'] 
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const dayStats = [0, 0, 0, 0, 0, 0, 0];
        completed.forEach(t => {
            const d = new Date(t.startDate);
            if (!isNaN(d)) dayStats[d.getDay()]++;
        });
        const maxTasks = Math.max(...dayStats);
        const bestDayIndex = dayStats.indexOf(maxTasks);
        const bestDay = maxTasks > 0 ? dayNames[bestDayIndex] : '--';

        // 4. Текущий Стрик (серия дней)
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const hasTasks = completed.some(t => t.startDate === dateStr);
            if (hasTasks) streak++;
            else if (i > 0) break; // Прерываем, если пропустили день (кроме проверки сегодняшнего, который может быть еще не закрыт)
        }

        // Данные для графиков
        const areaData = heatmapDays.slice(-7).map(d => ({
            label: d.date.split('-')[2],
            value: d.count
        }));

        const cats = {};
        list.forEach(t => {
            const cat = t.category || (lang === 0 ? 'Общее' : 'General');
            cats[cat] = (cats[cat] || 0) + 1;
        });
        const barData = Object.keys(cats).map(k => ({ label: k, value: cats[k] }));

        return { total, completedCount, rate, heatmapDays, bestDay, streak, areaData, barData };
    }, [AppData.todoList, lang]);

    const s = styles(theme, fSize);

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div style={s.container}>
            <motion.div 
                style={s.scrollContent} 
                className="no-scrollbar"
                initial="hidden" animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            >
                {/* Header */}
                <motion.div variants={itemVariants} style={s.header}>
                    <h2 style={s.pageTitle}>{lang === 0 ? 'Дашборд' : 'Dashboard'}</h2>
                    <span style={s.pageSubtitle}>{lang === 0 ? 'Твои достижения' : 'Your achievements'}</span>
                </motion.div>

                {/* 1. Инсайты (New Widget) */}
                <motion.div variants={itemVariants} style={s.insightRow}>
                    <div style={{...s.insightCard, background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)'}}>
                        <span style={s.insightIcon}>🔥</span>
                        <div style={s.insightText}>
                            <div style={s.insightVal}>{stats.streak}</div>
                            <div style={s.insightLabel}>{lang === 0 ? 'Дня подряд' : 'Day Streak'}</div>
                        </div>
                    </div>
                    <div style={{...s.insightCard, background: 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)'}}>
                        <span style={s.insightIcon}>⭐</span>
                        <div style={s.insightText}>
                            <div style={s.insightVal}>{stats.bestDay}</div>
                            <div style={s.insightLabel}>{lang === 0 ? 'Пик формы' : 'Best Day'}</div>
                        </div>
                    </div>
                </motion.div>

                {/* 2. Heatmap Activity (New Widget) */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <div style={s.chartHeaderRow}>
                        <h3 style={s.chartTitle}>{lang === 0 ? 'Карта активности' : 'Activity Map'}</h3>
                        <span style={s.chartBadge}>Last 28 days</span>
                    </div>
                    <div style={s.heatmapGrid}>
                        {stats.heatmapDays.map((d, i) => (
                            <div key={i} style={{
                                ...s.heatmapSquare,
                                backgroundColor: Colors.get('areaChart', theme),
                                opacity: d.count === 0 ? 0.1 : Math.min(0.2 + (d.count * 0.25), 1)
                            }} />
                        ))}
                    </div>
                    <div style={s.heatmapLegend}>
                        <span>Less</span>
                        <div style={{display: 'flex', gap: '4px'}}>
                            {[0.1, 0.4, 0.7, 1].map(op => <div key={op} style={{...s.heatmapSquare, opacity: op, backgroundColor: Colors.get('areaChart', theme)}} />)}
                        </div>
                        <span>More</span>
                    </div>
                </motion.div>

                {/* 3. Summary Row */}
                <div style={s.summaryGrid}>
                    <MetricCard label={lang === 0 ? 'Всего' : 'Total'} value={stats.total} theme={theme} variants={itemVariants} icon="📋" />
                    <MetricCard label={lang === 0 ? 'Готово' : 'Done'} value={stats.completedCount} theme={theme} color={Colors.get('done', theme)} variants={itemVariants} icon="✔️" />
                    <MetricCard label={lang === 0 ? 'Успех' : 'Rate'} value={stats.rate + '%'} theme={theme} color={Colors.get('areaChart', theme)} variants={itemVariants} isHighlight={true} icon="⚡" />
                </div>

                {/* 4. Velocity Chart */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'Недельный темп' : 'Weekly Velocity'}</h3>
                    <MyAreaChart data={stats.areaData} color={Colors.get('areaChart', theme)} height={150} />
                </motion.div>

                {/* 5. Category Chart */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'Приоритеты' : 'Priorities'}</h3>
                    <MyBarChart data={stats.barData} color={Colors.get('barsColorTonnage', theme)} height={150} />
                </motion.div>

            </motion.div>
        </div>
    );
};

// Вспомогательный компонент карточки
const MetricCard = ({ label, value, theme, color, variants, icon, isHighlight }) => (
    <motion.div variants={variants} style={{
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '20px', padding: '15px', display: 'flex', flexDirection: 'column', flex: 1,
        boxShadow: Colors.get('shadow', theme), border: isHighlight ? `1px solid ${color}44` : '1px solid transparent'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}>
            <span>{icon}</span>
            <span style={{ fontSize: '10px', color: Colors.get('subText', theme), fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
        </div>
        <span style={{ fontSize: '22px', fontWeight: '800', color: color || Colors.get('mainText', theme) }}>{value}</span>
    </motion.div>
);

const styles = (theme, fSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        height: '100%', width: '100vw', paddingTop: '100px',
        display: 'flex', flexDirection: 'column', fontFamily: 'SF Pro Display, Segoe UI, sans-serif'
    },
    scrollContent: {
        flex: 1, overflowY: 'auto', padding: '10px 20px 120px 20px',
        display: 'flex', flexDirection: 'column', gap: '18px'
    },
    header: { marginBottom: '5px',marginTop: '15px' },
    pageTitle: { fontSize: '28px', fontWeight: '800', color: Colors.get('mainText', theme), margin: 0 },
    pageSubtitle: { fontSize: '14px', color: Colors.get('subText', theme) },
    
    // Insights
    insightRow: { display: 'flex', gap: '12px' },
    insightCard: {
        flex: 1, borderRadius: '24px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)', color: '#fff'
    },
    insightIcon: { fontSize: '24px' },
    insightVal: { fontSize: '20px', fontWeight: '800' },
    insightLabel: { fontSize: '10px', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase' },

    // Heatmap
    heatmapGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px',
        margin: '10px 0'
    },
    heatmapSquare: {
        aspectRatio: '1/1', borderRadius: '4px', width: '100%'
    },
    heatmapLegend: {
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px',
        fontSize: '10px', color: Colors.get('subText', theme), marginTop: '8px'
    },

    summaryGrid: { display: 'flex', gap: '10px' },
    chartBox: {
        backgroundColor: Colors.get('simplePanel', theme), borderRadius: '24px', padding: '20px',
        boxShadow: Colors.get('shadow', theme), border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}`
    },
    chartHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    chartTitle: { fontSize: '13px', fontWeight: '700', color: Colors.get('subText', theme), margin: 0, textTransform: 'uppercase' },
    chartBadge: { fontSize: '9px', backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '5px' }
});

export default ToDoMetrics;

