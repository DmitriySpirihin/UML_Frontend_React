import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$ } from '../../StaticClasses/HabitsBus';
import ToDoAreaChart from '../../Helpers/MyAreaChart.jsx';
import ToDoChart from '../../Helpers/ToDoChart.jsx';

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

    // --- DATA PROCESSING ---
    const stats = useMemo(() => {
        // Ensure list exists
        const list = AppData.todoList || [];
        const completed = list.filter(t => t.isDone);
        
        // 1. Basic Stats
        const total = list.length;
        const completedCount = completed.length;
        const rate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

        // 2. Heatmap (28 Days)
        const heatmapDays = Array.from({length: 28}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = completed.filter(t => t.startDate === dateStr).length;
            return { date: dateStr, count };
        }).reverse();

        // 3. Best Day Calculation
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

        // 4. Streak Calculation
        let streak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        // Check past 30 days
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            const hasTasks = completed.some(t => t.startDate === dStr);
            
            // Allow today to be incomplete if checking streak, otherwise break
            if (dStr === todayStr && !hasTasks) continue; 
            if (hasTasks) streak++;
            else break;
        }

        // 5. Area Chart Data (Weekly Velocity)
        // Format: { date: "Mon", value: 5 }
        const areaData = heatmapDays.slice(-7).map(d => {
            const dateObj = new Date(d.date);
            return {
                date: dayNames[dateObj.getDay()], 
                value: d.count
            };
        });

        // 6. Bar Chart Data (Categories)
        // Format: { name: "Category", count: 5 }
        const cats = {};
        list.forEach(t => {
            const cat = t.category || (lang === 0 ? 'General' : 'General');
            cats[cat] = (cats[cat] || 0) + 1;
        });
        
        // Convert to array and sort by count desc
        const barData = Object.keys(cats)
            .map(k => ({ name: k, count: cats[k] }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5); // Top 5 categories

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

                {/* Insights Row */}
                <motion.div variants={itemVariants} style={s.insightRow}>
                    <div style={{...s.insightCard, background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5253 100%)'}}>
                        <span style={s.insightIcon}>🔥</span>
                        <div style={s.insightText}>
                            <div style={s.insightVal}>{stats.streak}</div>
                            <div style={s.insightLabel}>{lang === 0 ? 'Стрик (дней)' : 'Day Streak'}</div>
                        </div>
                    </div>
                    <div style={{...s.insightCard, background: 'linear-gradient(135deg, #4834d4 0%, #686de0 100%)'}}>
                        <span style={s.insightIcon}>⭐</span>
                        <div style={s.insightText}>
                            <div style={s.insightVal}>{stats.bestDay}</div>
                            <div style={s.insightLabel}>{lang === 0 ? 'Пик формы' : 'Prime Day'}</div>
                        </div>
                    </div>
                </motion.div>

                {/* Heatmap */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <div style={s.chartHeaderRow}>
                        <h3 style={s.chartTitle}>{lang === 0 ? 'Активность' : 'Activity'}</h3>
                        <span style={s.chartBadge}>28 Days</span>
                    </div>
                    <div style={s.heatmapGrid}>
                        {stats.heatmapDays.map((d, i) => (
                            <div key={i} style={{
                                ...s.heatmapSquare,
                                backgroundColor: Colors.get('areaChart', theme),
                                opacity: d.count === 0 ? 0.08 : Math.min(0.3 + (d.count * 0.15), 1)
                            }} />
                        ))}
                    </div>
                </motion.div>

                {/* Summary Metrics */}
                <div style={s.summaryGrid}>
                    <MetricCard label={lang === 0 ? 'Всего' : 'Total'} value={stats.total} theme={theme} variants={itemVariants} icon="📋" />
                    <MetricCard label={lang === 0 ? 'Готово' : 'Done'} value={stats.completedCount} theme={theme} color={Colors.get('done', theme)} variants={itemVariants} icon="✔️" />
                    <MetricCard label={lang === 0 ? 'Успех' : 'Rate'} value={stats.rate + '%'} theme={theme} color={Colors.get('areaChart', theme)} variants={itemVariants} isHighlight={true} icon="⚡" />
                </div>

                {/* Area Chart (Velocity) */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'Темп (Задачи/День)' : 'Velocity (Tasks/Day)'}</h3>
                    <div style={{ height: '150px', width: '100%' }}>
                        <ToDoAreaChart 
                            data={stats.areaData} 
                            fillColor={Colors.get('areaChart', theme)} 
                            textColor={Colors.get('subText', theme)}
                            linesColor={Colors.get('subText', theme)} // Using subtext for grid lines opacity handled in chart
                            backgroundColor={Colors.get('simplePanel', theme)}
                        />
                    </div>
                </motion.div>

                {/* Bar Chart (Categories) */}
                <motion.div variants={itemVariants} style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'Топ Категории' : 'Top Categories'}</h3>
                    <div style={{ height: '180px', width: '100%' }}>
                         <ToDoChart 
                            data={stats.barData} 
                            theme={theme}
                            textColor={Colors.get('subText', theme)}
                            barColor={Colors.get('barsColorTonnage', theme)}
                        />
                    </div>
                </motion.div>

            </motion.div>
            
            {/* Premium Overlay logic remains... */}
        </div>
    );
};

// ... MetricCard and styles remain identical to your source ...
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
    insightRow: { display: 'flex', gap: '12px' },
    insightCard: {
        flex: 1, borderRadius: '24px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)', color: '#fff'
    },
    insightIcon: { fontSize: '24px' },
    insightText: { display: 'flex', flexDirection: 'column'},
    insightVal: { fontSize: '20px', fontWeight: '800', lineHeight: 1 },
    insightLabel: { fontSize: '10px', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase', marginTop: '2px' },
    heatmapGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px',
        margin: '15px 0 5px 0'
    },
    heatmapSquare: {
        aspectRatio: '1/1', borderRadius: '6px', width: '100%'
    },
    summaryGrid: { display: 'flex', gap: '10px' },
    chartBox: {
        backgroundColor: Colors.get('simplePanel', theme), borderRadius: '24px', padding: '20px',
        boxShadow: Colors.get('shadow', theme), border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}`
    },
    chartHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chartTitle: { fontSize: '13px', fontWeight: '700', color: Colors.get('subText', theme), margin: 0, textTransform: 'uppercase', marginBottom: '10px' },
    chartBadge: { fontSize: '9px', backgroundColor: 'rgba(127,127,127,0.1)', padding: '2px 6px', borderRadius: '5px', color: Colors.get('subText', theme) }
});

export default ToDoMetrics;

