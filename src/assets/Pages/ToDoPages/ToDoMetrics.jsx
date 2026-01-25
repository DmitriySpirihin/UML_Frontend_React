import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
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

    // --- DATA PROCESSING ---
    
    const stats = useMemo(() => {
        const list = AppData.todoList || [];
        const completed = list.filter(t => t.isDone).length;
        const total = list.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // 1. Velocity (Last 7 Days)
        const days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const areaData = days.map(date => ({
            label: date.split('-')[2], // Day number
            value: list.filter(t => t.isDone && t.startDate === date).length
        }));

        // 2. Category Distribution
        const cats = {};
        list.forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + 1;
        });
        const barData = Object.keys(cats).map(key => ({
            label: key,
            value: cats[key]
        }));

        return { total, completed, rate, areaData, barData };
    }, [AppData.todoList]);

    const s = styles(theme, fSize);

    return (
        <div style={s.container}>
            <div style={s.scrollContent} className="no-scrollbar">
                
                {/* 1. Summary Cards */}
                <div style={s.summaryRow}>
                    <MetricCard 
                        label={lang === 0 ? 'Всего' : 'Total'} 
                        value={stats.total} 
                        theme={theme} 
                    />
                    <MetricCard 
                        label={lang === 0 ? 'Готово' : 'Done'} 
                        value={stats.completed} 
                        theme={theme} 
                        color={Colors.get('done', theme)} 
                    />
                    <MetricCard 
                        label={lang === 0 ? 'Успех' : 'Rate'} 
                        value={stats.rate + '%'} 
                        theme={theme} 
                        color={Colors.get('areaChart', theme)} 
                    />
                </div>

                {/* 2. Velocity Chart */}
                <div style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'Продуктивность (7д)' : 'Productivity (7d)'}</h3>
                    <MyAreaChart 
                        data={stats.areaData} 
                        color={Colors.get('areaChart', theme)} 
                        height={180} 
                    />
                </div>

                {/* 3. Category Bar Chart */}
                <div style={s.chartBox}>
                    <h3 style={s.chartTitle}>{lang === 0 ? 'По категориям' : 'By Categories'}</h3>
                    <MyBarChart 
                        data={stats.barData} 
                        color={Colors.get('barsColorTonnage', theme)} 
                        height={180} 
                    />
                </div>

                {/* PREMIUM OVERLAY */}
                {hasPremium && (
                    <div style={s.lockOverlay}>
                        <div style={s.lockText}>
                            {lang === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                        </div>
                        <div style={{fontSize: '10px', color: Colors.get('subText', theme), marginTop: '5px'}}>
                            {lang === 0 ? 'Разблокируйте детальную аналитику' : 'Unlock detailed analytics'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, theme, color }) => (
    <div style={{
        flex: 1, backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '16px', padding: '15px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', boxShadow: Colors.get('shadow', theme)
    }}>
        <span style={{ fontSize: '11px', color: Colors.get('subText', theme), fontWeight: '700', textTransform: 'uppercase' }}>{label}</span>
        <span style={{ fontSize: '20px', fontWeight: '800', color: color || Colors.get('mainText', theme), marginTop: '5px' }}>{value}</span>
    </div>
);

const styles = (theme, fSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        height: '90vh',
        width: '100vw',
        marginTop: '100px',
        paddingTop: '60px', 
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif'
    },
    scrollContent: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 20px 100px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        position: 'relative'
    },
    summaryRow: {
        display: 'flex',
        gap: '12px',
        width: '100%'
    },
    chartBox: {
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '24px',
        padding: '20px',
        boxShadow: Colors.get('shadow', theme)
    },
    chartTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: Colors.get('subText', theme),
        marginBottom: '15px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    },
    lockOverlay: {
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme === 'dark' ? 'rgba(10, 10, 10, 0.8)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(8px)',
        textAlign: 'center',
        borderRadius: '24px'
    },
    lockText: { 
        color: theme === 'dark' ? '#FFD700' : '#D97706', 
        fontSize: '12px', 
        fontWeight: '800', 
        fontFamily: 'Segoe UI' 
    }
});

export default ToDoMetrics;

