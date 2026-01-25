import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MyBarChart from "../../Helpers/MyBarChart";
import { AppData,UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$ } from '../../StaticClasses/HabitsBus';
import { FaChartBar, FaMoon, FaStar, FaHistory } from 'react-icons/fa';

const PERIOD_DAYS = [28, 180, 360];
const PERIOD_LABELS = [
    ['Месяц', 'Month'],
    ['6 Мес', '6 Mon'],
    ['Год', 'Year']
];

// --- Helpers ---
const msToMinutes = (ms) => Math.floor(ms / 60_000);
const msToHoursMinutes = (ms) => {
    if (!ms) return '0h 0m';
    const totalMin = msToMinutes(ms);
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const formatDate = (iso, langIndex) => {
    const d = new Date(iso);
    return d.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', {
        day: 'numeric',
        month: 'short'
    });
};

const getMoodColor = (theme, mood) => {
    const cols = [
        Colors.get('veryBad', theme),
            Colors.get('bad', theme),
            Colors.get('normal', theme), 
            Colors.get('good', theme), 
            Colors.get('perfect', theme), 
    ];
    return cols[mood - 1] || Colors.get('subText', theme);
};

// --- Segmented Control ---
const PeriodSelector = ({ selectedIndex, setSelectedIndex, theme, langIndex }) => (
    <div style={styles(theme).segmentedControl}>
        {PERIOD_LABELS.map((label, idx) => {
            const isActive = selectedIndex === idx;
            return (
                <motion.div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                        ...styles(theme).segmentBtn,
                        color: isActive ? Colors.get('mainText', theme) : Colors.get('subText', theme),
                        fontWeight: isActive ? '600' : '500',
                    }}
                >
                    {isActive && (
                        <motion.div
                            layoutId="segmentBg"
                            style={styles(theme).segmentActiveBg}
                        />
                    )}
                    <span style={{ position: 'relative', zIndex: 1 }}>{label[langIndex]}</span>
                </motion.div>
            );
        })}
    </div>
);

// --- Stats Summary Card ---
const StatCard = ({ icon, label, value, subLabel, theme, color }) => (
    <div style={styles(theme).statCard}>
        <div style={{...styles(theme).iconBox, color: color, backgroundColor: `${color}15`}}>
            {icon}
        </div>
        <div style={{flex: 1}}>
            <div style={styles(theme).statLabel}>{label}</div>
            <div style={styles(theme).statValue}>{value}</div>
            {subLabel && <div style={styles(theme).statSub}>{subLabel}</div>}
        </div>
    </div>
);

const SleepMetrics = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(setLangIndex);
        const fSizeSub = fontSize$.subscribe(setFSize);
        const premiumSub = premium$.subscribe(setHasPremium);
        return () => {
            themeSub.unsubscribe();
            langSub.unsubscribe();
            fSizeSub.unsubscribe();
            premiumSub.unsubscribe();
        };
    }, []);
    const [periodIndex, setPeriodIndex] = useState(0);

    // Data Processing
    const sleepData = useMemo(() => {
        if (!AppData.sleepingLog) return [];
        return Object.entries(AppData.sleepingLog)
            .map(([date, session]) => ({
                date,
                durationMs: session.duration || 0,
                mood: session.mood || 0,
                note: session.note || ''
            }))
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, []);

    const filteredData = useMemo(() => {
        if (sleepData.length === 0) return [];
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - PERIOD_DAYS[periodIndex]);
        return sleepData.filter(item => new Date(item.date) >= cutoff);
    }, [sleepData, periodIndex]);

    const chartData = useMemo(() => {
        return filteredData.map(item => ({
            date: item.date.split('-').slice(1).reverse().join('.'), 
            ms: item.durationMs,
            mood: item.mood || 3
        }));
    }, [filteredData]);

    // Statistics Calculation
    const stats = useMemo(() => {
        if (filteredData.length === 0) return { avg: 0, best: 0, count: 0 };
        
        const totalMs = filteredData.reduce((acc, curr) => acc + curr.durationMs, 0);
        const avgMs = totalMs / filteredData.length;
        const bestMs = Math.max(...filteredData.map(d => d.durationMs));
        
        return {
            avg: avgMs,
            best: bestMs,
            count: filteredData.length
        };
    }, [filteredData]);

    return (
        <div style={styles(theme).container}>

            <div style={styles(theme).scrollContent}>
                
                {/* 1. Header & Period Selector */}
                <div style={styles(theme).headerSection}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                        <FaChartBar size={20} color={Colors.get('accent', theme)} />
                        <h2 style={styles(theme).pageTitle}>
                            {langIndex === 0 ? 'Аналитика Сна' : 'Sleep Analytics'}
                        </h2>
                    </div>
                    
                    <PeriodSelector 
                        selectedIndex={periodIndex} 
                        setSelectedIndex={setPeriodIndex} 
                        theme={theme} 
                        langIndex={langIndex}
                    />
                </div>

                {/* 2. Summary Stats */}
                <div style={styles(theme).statsRow}>
                    <StatCard 
                        icon={<FaMoon />} 
                        label={langIndex === 0 ? 'Средний сон' : 'Avg Sleep'} 
                        value={msToHoursMinutes(stats.avg)} 
                        theme={theme}
                        color={Colors.get('normal', theme)}
                    />
                    <StatCard 
                        icon={<FaStar />} 
                        label={langIndex === 0 ? 'Лучший сон' : 'Best Sleep'} 
                        value={msToHoursMinutes(stats.best)} 
                        theme={theme}
                        color={Colors.get('perfect', theme)}
                    />
                </div>

                {/* 3. Chart Section */}
                <div style={styles(theme).chartContainer}>
                    <div style={styles(theme).chartHeader}>
                        <span style={styles(theme).chartTitle}>
                            {langIndex === 0 ? 'Динамика' : 'Dynamics'}
                        </span>
                        <span style={styles(theme).chartSub}>
                            {stats.count} {langIndex === 0 ? 'записей' : 'records'}
                        </span>
                    </div>
                    <div style={{ height: '200px', width: '100%' }}>
                        <MyBarChart
                            data={chartData}
                            theme={theme}
                            textColor={Colors.get('subText', theme)}
                            linesColor={Colors.get('border', theme)}
                            backgroundColor={Colors.get('simplePanel', theme)}
                            barColor={Colors.get('accent', theme)}
                        />
                    </div>
                </div>

                {/* 4. History List */}
                <div style={styles(theme).historySection}>
                    <div style={styles(theme).sectionHeader}>
                        <FaHistory size={14} color={Colors.get('subText', theme)} />
                        <span>{langIndex === 0 ? 'История' : 'History'}</span>
                    </div>

                    <div style={styles(theme).listContainer}>
                        {filteredData.length === 0 ? (
                            <div style={styles(theme).emptyState}>
                                {langIndex === 0 ? 'Нет данных за период' : 'No data for this period'}
                            </div>
                        ) : (
                            filteredData.slice().reverse().map((item, idx) => (
                                <div key={`${item.date}-${idx}`} style={styles(theme).listItem}>
                                    <div style={styles(theme).dateBox}>
                                        <span style={styles(theme).dateDay}>{formatDate(item.date, langIndex)}</span>
                                    </div>
                                    
                                    <div style={styles(theme).itemCenter}>
                                        <div style={styles(theme).durationText}>
                                            {msToHoursMinutes(item.durationMs)}
                                        </div>
                                        {item.note && (
                                            <div style={styles(theme).noteText}>{item.note}</div>
                                        )}
                                    </div>

                                    {item.mood > 0 && (
                                        <div style={styles(theme).moodBox}>
                                            <FaStar size={12} color={getMoodColor(theme, item.mood)} />
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: getMoodColor(theme, item.mood) }}>
                                                {item.mood}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ marginBottom: '80px' }} /> {/* Bottom Spacer */}
            </div>
            {!hasPremium && (
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SleepMetrics;

const styles = (theme) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        height: '90vh',
        marginTop:'40px',
        width: '100vw',
        paddingTop: '80px', // Space for global header
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI, sans-serif'
    },
    scrollContent: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 20px 40px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    
    // Header
    headerSection: {
        display: 'flex',
        flexDirection: 'column',
        marginTop:'20px'
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: Colors.get('mainText', theme),
        margin: 0
    },

    // Segmented Control
    segmentedControl: {
        display: 'flex',
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '12px',
        padding: '4px',
        border: `1px solid ${Colors.get('border', theme)}50`
    },
    segmentBtn: {
        flex: 1,
        position: 'relative',
        textAlign: 'center',
        padding: '8px',
        fontSize: '13px',
        cursor: 'pointer',
        zIndex: 1
    },
    segmentActiveBg: {
        position: 'absolute',
        inset: 0,
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: -1
    },

    // Stats Row
    statsRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
    },
    statCard: {
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        border: `1px solid ${Colors.get('border', theme)}30`
    },
    iconBox: {
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px'
    },
    statLabel: {
        fontSize: '11px',
        color: Colors.get('subText', theme),
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '2px'
    },
    statValue: {
        fontSize: '16px',
        fontWeight: '700',
        color: Colors.get('mainText', theme)
    },

    // Chart
    chartContainer: {
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '20px',
        padding: '20px',
        border: `1px solid ${Colors.get('border', theme)}30`
    },
    chartHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px'
    },
    chartTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: Colors.get('mainText', theme)
    },
    chartSub: {
        fontSize: '12px',
        color: Colors.get('subText', theme)
    },

    // History
    historySection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    sectionHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: Colors.get('subText', theme),
        paddingLeft: '4px'
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    listItem: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff',
        padding: '12px',
        borderRadius: '16px',
        border: `1px solid ${Colors.get('border', theme)}30`
    },
    dateBox: {
        width: '50px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderRight: `1px solid ${Colors.get('border', theme)}30`,
        paddingRight: '12px',
        marginRight: '12px'
    },
    dateDay: {
        fontSize: '12px',
        fontWeight: '700',
        color: Colors.get('mainText', theme),
        textAlign: 'center'
    },
    itemCenter: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    },
    durationText: {
        fontSize: '15px',
        fontWeight: '600',
        color: Colors.get('mainText', theme)
    },
    noteText: {
        fontSize: '11px',
        color: Colors.get('subText', theme),
        marginTop: '2px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '150px'
    },
    moodBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: Colors.get('background', theme),
        padding: '4px 8px',
        borderRadius: '8px'
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px',
        color: Colors.get('subText', theme),
        fontSize: '14px',
        fontStyle: 'italic'
    }
});