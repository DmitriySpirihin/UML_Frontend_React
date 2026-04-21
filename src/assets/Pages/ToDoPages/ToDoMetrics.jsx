import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { FaCheckDouble, FaFire, FaHourglassHalf, FaChartBar } from 'react-icons/fa';

// --- Dark Luxury palette ---
const GOLD = '#D4AF37';
const GOLD_SOFT = '#E5C454';
const DARK_BG = '#0D0D0F';
const CARD_BG = 'linear-gradient(145deg, rgba(30,30,34,0.95), rgba(18,18,22,0.95))';
const CARD_BORDER = 'rgba(212, 175, 55, 0.22)';

const PERIODS = [
    { key: 7,  label: ['7 дней',  '7 days']  },
    { key: 30, label: ['30 дней', '30 days'] },
    { key: 90, label: ['90 дней', '90 days'] },
    { key: 0,  label: ['Всё',     'All']     },
];

const ToDoMetrics = () => {
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [periodDays, setPeriodDays] = useState(30);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    const stats = useMemo(() => {
        const list = AppData.todoList || [];
        const now = new Date();
        const cutoff = periodDays > 0 ? new Date(now.getTime() - periodDays * 86400000) : null;

        const inPeriod = (dateStr) => {
            if (!cutoff) return true;
            if (!dateStr) return false;
            const d = new Date(dateStr);
            return !isNaN(d) && d >= cutoff;
        };

        // Completed tasks in period (uses completedAt if present, else startDate as fallback)
        const completedInPeriod = list.filter(t => {
            if (!t.isDone) return false;
            return inPeriod(t.completedAt || t.startDate);
        });

        // Average completion time (days) — completedAt - startDate
        const durations = completedInPeriod
            .map(t => {
                if (!t.completedAt || !t.startDate) return null;
                const s = new Date(t.startDate);
                const e = new Date(t.completedAt);
                if (isNaN(s) || isNaN(e)) return null;
                return Math.max(0, (e - s) / 86400000);
            })
            .filter(v => v !== null);
        const avgDays = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : null;

        // Categories breakdown (tasks in period, by category, completed/total)
        const catMap = {};
        list.forEach(t => {
            const d = t.completedAt || t.startDate;
            if (!inPeriod(d) && !(cutoff === null)) {
                // For "All", include everything; otherwise filter by date.
                if (cutoff) return;
            }
            if (cutoff && !inPeriod(d)) return;
            const key = t.category || (lang === 0 ? 'Общее' : 'General');
            if (!catMap[key]) catMap[key] = { name: key, total: 0, done: 0 };
            catMap[key].total++;
            if (t.isDone) catMap[key].done++;
        });
        const categories = Object.values(catMap)
            .sort((a, b) => b.total - a.total)
            .slice(0, 6);
        const maxCat = Math.max(1, ...categories.map(c => c.total));

        // Streak: consecutive days (ending today) with >=1 completed task
        const doneByDay = new Set();
        list.forEach(t => {
            if (!t.isDone) return;
            const d = t.completedAt || t.startDate;
            if (!d) return;
            const dateObj = new Date(d);
            if (isNaN(dateObj)) return;
            doneByDay.add(dateObj.toISOString().split('T')[0]);
        });
        let streak = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (doneByDay.has(key)) streak++;
            else if (i === 0 && key === todayStr) continue; // allow today to be empty
            else break;
        }

        return {
            completedCount: completedInPeriod.length,
            avgDays,
            categories,
            maxCat,
            streak,
        };
    }, [AppData.todoList, lang, periodDays]);

    const s = styles();

    const formatAvg = (days) => {
        if (days === null || days === undefined) return '—';
        if (days < 1) {
            const hours = Math.max(1, Math.round(days * 24));
            return lang === 0 ? `${hours} ч` : `${hours}h`;
        }
        return lang === 0 ? `${days.toFixed(1)} дн` : `${days.toFixed(1)}d`;
    };

    const itemV = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } };

    return (
        <div style={s.container}>
            <motion.div
                style={s.scroll}
                className="no-scrollbar"
                initial="hidden" animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
                {/* Header */}
                <motion.div variants={itemV} style={s.header}>
                    <div style={s.eyebrow}>
                        {lang === 0 ? 'АНАЛИТИКА' : 'ANALYTICS'}
                    </div>
                    <h2 style={s.title}>
                        {lang === 0 ? 'Достижения' : 'Achievements'}
                    </h2>
                    <div style={s.titleUnderline} />
                </motion.div>

                {/* Period selector */}
                <motion.div variants={itemV} style={s.periodRow}>
                    {PERIODS.map(p => {
                        const active = p.key === periodDays;
                        return (
                            <motion.div
                                key={p.key}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setPeriodDays(p.key)}
                                style={{
                                    ...s.periodChip,
                                    backgroundColor: active ? GOLD : 'rgba(255,255,255,0.04)',
                                    color: active ? '#0D0D0F' : GOLD_SOFT,
                                    borderColor: active ? GOLD : CARD_BORDER,
                                    fontWeight: active ? 800 : 600,
                                }}
                            >
                                {p.label[lang]}
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Hero: Completed & Streak */}
                <motion.div variants={itemV} style={s.heroRow}>
                    <div style={s.heroCard}>
                        <div style={s.heroIconWrap}>
                            <FaCheckDouble size={16} color={GOLD} />
                        </div>
                        <div style={s.heroValue}>{stats.completedCount}</div>
                        <div style={s.heroLabel}>
                            {lang === 0 ? 'Задач завершено' : 'Tasks completed'}
                        </div>
                    </div>
                    <div style={s.heroCard}>
                        <div style={s.heroIconWrap}>
                            <FaFire size={16} color={GOLD} />
                        </div>
                        <div style={s.heroValue}>
                            {stats.streak}
                        </div>
                        <div style={s.heroLabel}>
                            {lang === 0 ? 'Серия (дней)' : 'Streak (days)'}
                        </div>
                    </div>
                </motion.div>

                {/* Avg time card */}
                <motion.div variants={itemV} style={s.wideCard}>
                    <div style={s.wideIconWrap}>
                        <FaHourglassHalf size={18} color={GOLD} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={s.wideLabel}>
                            {lang === 0 ? 'Средний срок выполнения' : 'Average completion time'}
                        </div>
                        <div style={s.wideValue}>
                            {formatAvg(stats.avgDays)}
                        </div>
                    </div>
                </motion.div>

                {/* Categories progress */}
                <motion.div variants={itemV} style={s.categoriesCard}>
                    <div style={s.catHeader}>
                        <FaChartBar size={14} color={GOLD} />
                        <span style={s.catTitle}>
                            {lang === 0 ? 'По категориям' : 'By categories'}
                        </span>
                    </div>
                    {stats.categories.length === 0 ? (
                        <div style={s.empty}>
                            {lang === 0 ? 'Нет данных за период' : 'No data for period'}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                            {stats.categories.map((c, i) => {
                                const pctTotal = (c.total / stats.maxCat) * 100;
                                const pctDone  = c.total > 0 ? (c.done / c.total) * 100 : 0;
                                return (
                                    <div key={i} style={s.catRow}>
                                        <div style={s.catRowHead}>
                                            <span style={s.catName}>{c.name}</span>
                                            <span style={s.catCount}>{c.done}/{c.total}</span>
                                        </div>
                                        <div style={s.barTrack}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pctTotal}%` }}
                                                transition={{ duration: 0.6, delay: 0.05 * i }}
                                                style={s.barTotal}
                                            />
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(pctTotal * pctDone) / 100}%` }}
                                                transition={{ duration: 0.7, delay: 0.1 * i }}
                                                style={s.barDone}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                <div style={{ height: 120 }} />
            </motion.div>
        </div>
    );
};

const styles = () => ({
    container: {
        backgroundColor: DARK_BG,
        height: '100%', width: '100vw', paddingTop: 80,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'SF Pro Display, Segoe UI, sans-serif',
        backgroundImage: 'radial-gradient(ellipse at top, rgba(212,175,55,0.08) 0%, transparent 55%)',
    },
    scroll: {
        flex: 1, overflowY: 'auto', padding: '16px 22px 120px',
        display: 'flex', flexDirection: 'column', gap: 20,
    },
    header: { marginTop: 8, marginBottom: 4 },
    eyebrow: {
        fontSize: 11, letterSpacing: 4, color: GOLD_SOFT,
        fontWeight: 700, textTransform: 'uppercase', marginBottom: 6
    },
    title: {
        fontSize: 30, fontWeight: 800, color: '#F5F5F0',
        margin: 0, letterSpacing: -0.5,
    },
    titleUnderline: {
        width: 42, height: 2, marginTop: 10,
        background: `linear-gradient(90deg, ${GOLD}, transparent)`,
        borderRadius: 2,
    },
    periodRow: { display: 'flex', gap: 8, flexWrap: 'wrap' },
    periodChip: {
        padding: '8px 14px', borderRadius: 12,
        fontSize: 12, cursor: 'pointer',
        border: `1px solid ${CARD_BORDER}`,
        transition: 'all 0.2s ease',
    },
    heroRow: { display: 'flex', gap: 12 },
    heroCard: {
        flex: 1, padding: 18, borderRadius: 20,
        background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex', flexDirection: 'column', gap: 6,
        position: 'relative', overflow: 'hidden',
    },
    heroIconWrap: {
        width: 34, height: 34, borderRadius: 10,
        backgroundColor: 'rgba(212,175,55,0.08)',
        border: `1px solid ${CARD_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 4,
    },
    heroValue: {
        fontSize: 32, fontWeight: 800, color: '#F5F5F0',
        lineHeight: 1, letterSpacing: -1,
    },
    heroLabel: {
        fontSize: 11, color: 'rgba(245,245,240,0.55)',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1,
    },
    wideCard: {
        padding: 18, borderRadius: 20, background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', gap: 14,
    },
    wideIconWrap: {
        width: 46, height: 46, borderRadius: 14,
        backgroundColor: 'rgba(212,175,55,0.08)',
        border: `1px solid ${CARD_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    wideLabel: {
        fontSize: 11, color: 'rgba(245,245,240,0.55)',
        fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4,
    },
    wideValue: {
        fontSize: 22, fontWeight: 800, color: GOLD_SOFT,
    },
    categoriesCard: {
        padding: 20, borderRadius: 20, background: CARD_BG,
        border: `1px solid ${CARD_BORDER}`,
        boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
    },
    catHeader: { display: 'flex', alignItems: 'center', gap: 8 },
    catTitle: {
        fontSize: 12, color: GOLD_SOFT, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: 1.5,
    },
    catRow: {},
    catRowHead: {
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'baseline', marginBottom: 6,
    },
    catName: {
        fontSize: 13, color: '#F5F5F0', fontWeight: 600,
    },
    catCount: {
        fontSize: 11, color: GOLD_SOFT, fontWeight: 700,
    },
    barTrack: {
        position: 'relative', width: '100%', height: 8,
        borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.04)',
        overflow: 'hidden',
    },
    barTotal: {
        position: 'absolute', top: 0, left: 0, bottom: 0,
        background: 'linear-gradient(90deg, rgba(212,175,55,0.18), rgba(212,175,55,0.35))',
        borderRadius: 8,
    },
    barDone: {
        position: 'absolute', top: 0, left: 0, bottom: 0,
        background: `linear-gradient(90deg, ${GOLD}, ${GOLD_SOFT})`,
        borderRadius: 8,
        boxShadow: `0 0 10px ${GOLD}55`,
    },
    empty: {
        marginTop: 16, fontSize: 13, color: 'rgba(245,245,240,0.4)',
        textAlign: 'center',
    },
});

export default ToDoMetrics;
