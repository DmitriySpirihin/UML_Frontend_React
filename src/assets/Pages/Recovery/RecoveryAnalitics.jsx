import { useEffect, useMemo, useState } from 'react';
import MyAreaChart from '../../Helpers/MyAreaChart.jsx';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { fontSize$, lang$, premium$, setPage, theme$ } from '../../StaticClasses/HabitsBus.js';
import { motion as Motion } from 'framer-motion';
import { FaCalendarAlt, FaClock, FaCrown, FaFire, FaSnowflake, FaSpa, FaWind } from 'react-icons/fa';

const METRICS = [
    { key: 'breath', ru: 'Дыхание', en: 'Breath', Icon: FaWind, colorKey: 'out', fallback: '#7ee6d2' },
    { key: 'meditation', ru: 'Медитация', en: 'Meditation', Icon: FaSpa, colorKey: 'meditate', fallback: '#8FA6C8' },
    { key: 'cold', ru: 'Закалка', en: 'Cold', Icon: FaSnowflake, colorKey: 'cold', fallback: '#69d6f0' },
];

const PERIODS = [
    { ru: 'Месяц', en: 'Month', days: 28 },
    { ru: 'Полгода', en: '6 months', days: 180 },
    { ru: 'Год', en: 'Year', days: 360 },
];

const formatDuration = (ms, isRu = true) => {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    if (hours > 0) return `${hours}${isRu ? 'ч' : 'h'} ${min}${isRu ? 'м' : 'm'}`;
    return `${min}${isRu ? 'м' : 'm'} ${sec}${isRu ? 'с' : 's'}`;
};

const formatChartMinutes = (minutes, isRu = true) => {
    const value = Math.max(0, Number(minutes) || 0);
    if (value === 0) return `0${isRu ? 'м' : 'm'}`;
    if (value < 1) return `<1${isRu ? 'м' : 'm'}`;
    const rounded = value >= 10 ? Math.round(value) : Math.round(value * 10) / 10;
    return `${rounded}${isRu ? 'м' : 'm'}`;
};

const formatDate = (iso, isRu) => {
    const date = new Date(iso);
    return date.toLocaleDateString(isRu ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' });
};

const getMetricColor = (metric, theme) => Colors.get(metric.colorKey, theme) || metric.fallback;

function SegmentTabs({ items, activeIndex, onChange, theme, isRu, accent, compact = false }) {
    const s = sharedStyles(theme, accent);
    return (
        <div style={compact ? s.periodTabs : s.metricTabs}>
            {items.map((item, index) => {
                const active = activeIndex === index;
                const Icon = item.Icon;
                return (
                    <Motion.button
                        key={item.key ?? item.ru}
                        type="button"
                        whileTap={{ scale: 0.97 }}
                        onClick={() => onChange(index)}
                        style={compact ? s.periodTab(active) : s.metricTab(active)}
                    >
                        {Icon && <Icon />}
                        <span>{isRu ? item.ru : item.en}</span>
                    </Motion.button>
                );
            })}
        </div>
    );
}

function PageHeader({ theme, isRu, fSize }) {
    const s = sharedStyles(theme);
    return (
        <div style={s.pageHeader}>
            <div style={s.pageTitle}>UltyMyLife</div>
            <div style={s.pageSubtitle}>{isRu ? 'Восстановление — часть роста' : 'Recovery is where growth happens'}</div>
        </div>
    );
}

const RecoveryAnalytics = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const [metricIndex, setMetricIndex] = useState(0);
    const [periodIndex, setPeriodIndex] = useState(0);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
            premium$.subscribe(setHasPremium),
        ];
        return () => subs.forEach((sub) => sub.unsubscribe());
    }, []);

    const isRu = langIndex === 0;
    const metric = METRICS[metricIndex];
    const activeColor = getMetricColor(metric, theme);
    const s = styles(theme, activeColor, fSize);

    const logs = [AppData.breathingLog, AppData.meditationLog, AppData.hardeningLog];

    const allData = useMemo(() => {
        const log = logs[metricIndex] || {};
        return Object.entries(log)
            .map(([date, sessions = []]) => {
                const totals = sessions.reduce(
                    (acc, session) => {
                        const duration = Math.max(0, (session.endTime || 0) - (session.startTime || 0));
                        acc.totalDuration += duration;
                        if (metricIndex === 0 && session.maxHold) acc.totalMaxHold += session.maxHold;
                        if (metricIndex === 2 && session.timeInColdWater) acc.totalTimeInCold += session.timeInColdWater;
                        return acc;
                    },
                    { date, totalDuration: 0, totalMaxHold: 0, totalTimeInCold: 0 }
                );
                return totals;
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [metricIndex]);

    const filteredData = useMemo(() => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - PERIODS[periodIndex].days);
        return allData.filter((item) => new Date(item.date) >= cutoff);
    }, [allData, periodIndex]);

    const chartData = useMemo(
        () =>
            filteredData.map((item) => ({
                date: item.date.split('-').slice(1).reverse().join('.'),
                weight: Math.round((item.totalDuration / 60000) * 10) / 10,
            })),
        [filteredData]
    );

    const totalPeriodTime = filteredData.reduce((acc, item) => acc + item.totalDuration, 0);
    const MetricIcon = metric.Icon;

    return (
        <div style={s.container}>
            <div style={s.scrollView} className="no-scrollbar">
                <PageHeader theme={theme} isRu={isRu} fSize={fSize} />

                <Motion.section
                    initial={{ opacity: 0, y: 16, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 270, damping: 28 }}
                    style={s.hero}
                >
                    <div style={s.heroIcon}>
                        <MetricIcon />
                    </div>
                    <div style={s.heroCopy}>
                        <div style={s.eyebrow}>{isRu ? 'ПРОГРЕСС' : 'PROGRESS'}</div>
                        <h1 style={s.heroTitle}>{isRu ? 'Статистика' : 'Stats'}</h1>
                    </div>
                    <div style={s.totalPill}>{formatDuration(totalPeriodTime, isRu)}</div>
                </Motion.section>

                <SegmentTabs
                    items={METRICS}
                    activeIndex={metricIndex}
                    onChange={setMetricIndex}
                    theme={theme}
                    isRu={isRu}
                    accent={activeColor}
                />

                <Motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 }}
                    style={s.chartCard}
                >
                    <div style={s.chartHeader}>
                        <div>
                            <div style={s.kicker}>{isRu ? 'ЗА ПЕРИОД' : 'PERIOD'}</div>
                            <div style={s.bigTotal}>{formatDuration(totalPeriodTime, isRu)}</div>
                        </div>
                        <SegmentTabs
                            items={PERIODS}
                            activeIndex={periodIndex}
                            onChange={setPeriodIndex}
                            theme={theme}
                            isRu={isRu}
                            accent={activeColor}
                            compact
                        />
                    </div>

                    <div style={s.chartArea}>
                        {chartData.length > 0 ? (
                            <MyAreaChart
                                data={chartData}
                                fillColor={activeColor}
                                textColor={Colors.get('subText', theme)}
                                linesColor={theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}
                                backgroundColor="rgba(12, 14, 18, 0.92)"
                                valueFormatter={(value) => formatChartMinutes(value, isRu)}
                            />
                        ) : (
                            <div style={s.emptyChart}>
                                <FaClock />
                                <span>{isRu ? 'Пока нет сессий' : 'No sessions yet'}</span>
                            </div>
                        )}
                    </div>
                </Motion.section>

                <div style={s.historyHeader}>
                    <div>
                        <h2 style={s.historyTitle}>{isRu ? 'История' : 'History'}</h2>
                        <div style={s.historyMeta}>
                            {filteredData.length} {isRu ? 'записей' : 'records'}
                        </div>
                    </div>
                </div>

                <div style={s.historyList}>
                    {filteredData.length === 0 ? (
                        <div style={s.emptyHistory}>{isRu ? 'Здесь появятся завершенные практики.' : 'Completed practices will appear here.'}</div>
                    ) : (
                        filteredData
                            .slice()
                            .reverse()
                            .map((item) => (
                                <HistoryRow key={item.date} item={item} metricIndex={metricIndex} theme={theme} activeColor={activeColor} isRu={isRu} />
                            ))
                    )}
                </div>

                <div style={s.bottomSpace} />
            </div>

            {!hasPremium && <PremiumOverlay theme={theme} isRu={isRu} />}
        </div>
    );
};

function HistoryRow({ item, metricIndex, theme, activeColor, isRu }) {
    const s = sharedStyles(theme, activeColor);
    return (
        <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={s.historyRow}>
            <div style={s.dateBadge}>
                <FaCalendarAlt />
            </div>
            <div style={s.rowCopy}>
                <div style={s.rowDate}>{formatDate(item.date, isRu)}</div>
                <div style={s.rowMeta}>
                    {metricIndex === 0 && item.totalMaxHold > 0 && (
                        <>
                            <FaFire /> {formatDuration(item.totalMaxHold, isRu)}
                        </>
                    )}
                    {metricIndex === 2 && item.totalTimeInCold > 0 && (
                        <>
                            <FaSnowflake /> {formatDuration(item.totalTimeInCold, isRu)}
                        </>
                    )}
                </div>
            </div>
            <div style={s.rowValue}>{formatDuration(item.totalDuration, isRu)}</div>
        </Motion.div>
    );
}

function PremiumOverlay({ theme, isRu }) {
    const isDark = theme === 'dark' || theme === 'specialdark';
    return (
        <div
            onClick={(event) => event.stopPropagation()}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2555,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: isDark ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                backdropFilter: 'blur(20px)',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: '72px',
                    height: '72px',
                    background: 'rgba(159,180,196,0.12)',
                    borderRadius: '22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    border: '1px solid rgba(159,180,196,0.22)',
                }}
            >
                <FaCrown size={30} color="#9FB4C4" />
            </div>
            <div
                style={{
                    fontSize: '13px',
                    lineHeight: 1.6,
                    color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                    marginBottom: '24px',
                    maxWidth: '210px',
                }}
            >
                {isRu ? 'Откройте полный доступ ко всей статистике' : 'Unlock full access to all statistics'}
            </div>
            <button
                onClick={() => setPage('premium')}
                style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#fff',
                    background: '#9FB4C4',
                    border: 'none',
                    borderRadius: '14px',
                    padding: '13px 0',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(159,180,196,0.35)',
                    width: '220px',
                }}
            >
                {isRu ? 'Купить подписку' : 'Buy subscription'}
            </button>
            <button
                onClick={() => setPage('RecoveryMain')}
                style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 20px',
                    cursor: 'pointer',
                }}
            >
                {isRu ? 'Назад' : 'Back'}
            </button>
        </div>
    );
}

const styles = (theme, accent = '#7ee6d2', fSize = 0) => {
    const base = sharedStyles(theme, accent);
    const isDark = theme === 'dark' || theme === 'specialdark';
    const background = Colors.get('background', theme);
    const mainText = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);

    return {
        ...base,
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: isDark
                ? `radial-gradient(circle at 12% 14%, ${accent}18, transparent 28%),
                   radial-gradient(circle at 88% 22%, rgba(159, 140, 255, 0.1), transparent 26%),
                   ${background}`
                : background,
            color: mainText,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        scrollView: {
            width: '100vw',
            height: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '24px 4.5vw 132px',
            boxSizing: 'border-box',
        },
        hero: {
            width: '100%',
            maxWidth: '560px',
            minHeight: '104px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '15px 16px',
            boxSizing: 'border-box',
            borderRadius: '28px',
            background: isDark
                ? `linear-gradient(135deg, ${accent}1f, rgba(20, 23, 28, 0.94) 50%, rgba(28, 29, 42, 0.92))`
                : '#fff',
            border: `1px solid ${accent}40`,
            boxShadow: isDark ? '0 22px 58px rgba(0,0,0,0.3)' : '0 16px 34px rgba(15,23,42,0.08)',
        },
        heroIcon: {
            width: '54px',
            height: '54px',
            borderRadius: '19px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            background: `${accent}1f`,
            border: `1px solid ${accent}40`,
            fontSize: '24px',
        },
        heroCopy: {
            flex: 1,
            minWidth: 0,
        },
        eyebrow: {
            color: accent,
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '0.18em',
        },
        heroTitle: {
            margin: '4px 0 0',
            color: mainText,
            fontSize: fSize === 0 ? '28px' : '30px',
            fontWeight: 900,
            lineHeight: 1.05,
        },
        totalPill: {
            minWidth: '88px',
            height: '42px',
            padding: '0 12px',
            borderRadius: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            fontSize: '15px',
            fontWeight: 900,
            background: `${accent}18`,
            border: `1px solid ${accent}36`,
            whiteSpace: 'nowrap',
        },
        chartCard: {
            width: '100%',
            maxWidth: '560px',
            marginTop: '12px',
            padding: '16px',
            borderRadius: '28px',
            boxSizing: 'border-box',
            background: isDark
                ? `linear-gradient(145deg, rgba(255,255,255,0.045), rgba(18,21,26,0.94))`
                : '#fff',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
            boxShadow: isDark ? '0 18px 48px rgba(0,0,0,0.24)' : '0 14px 30px rgba(15,23,42,0.08)',
        },
        chartHeader: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '10px',
        },
        kicker: {
            color: subText,
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '0.16em',
        },
        bigTotal: {
            marginTop: '3px',
            color: accent,
            fontSize: '28px',
            fontWeight: 900,
            lineHeight: 1,
            textShadow: `0 0 20px ${accent}38`,
        },
        chartArea: {
            height: '166px',
            width: '100%',
        },
        emptyChart: {
            height: '100%',
            borderRadius: '22px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: subText,
            background: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(15,23,42,0.04)',
            fontSize: '13px',
            fontWeight: 800,
        },
        historyHeader: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '16px 0 9px',
        },
        historyTitle: {
            margin: 0,
            color: mainText,
            fontSize: fSize === 0 ? '21px' : '23px',
            fontWeight: 900,
            lineHeight: 1.05,
        },
        historyMeta: {
            marginTop: '3px',
            color: subText,
            fontSize: '12px',
            fontWeight: 800,
        },
        historyList: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
        },
        emptyHistory: {
            minHeight: '84px',
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: subText,
            background: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.04)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.07)'}`,
            fontSize: '13px',
            fontWeight: 800,
        },
        bottomSpace: {
            height: '16px',
        },
    };
};

const sharedStyles = (theme, accent = '#7ee6d2') => {
    const isDark = theme === 'dark' || theme === 'specialdark';
    const mainText = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);

    return {
        pageHeader: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '8px 18px 17px',
            boxSizing: 'border-box',
            textAlign: 'center',
        },
        pageTitle: {
            color: mainText,
            fontFamily: 'inherit',
            fontSize: '24px',
            fontWeight: 700,
            lineHeight: 1.05,
            opacity: 0.9,
        },
        pageSubtitle: {
            marginTop: '6px',
            color: subText,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            lineHeight: 1.3,
        },
        metricTabs: {
            width: '100%',
            maxWidth: '560px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px',
            marginTop: '11px',
        },
        metricTab: (active) => ({
            minHeight: '42px',
            borderRadius: '17px',
            border: `1px solid ${active ? `${accent}44` : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            background: active ? `${accent}24` : isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.78)',
            color: active ? accent : subText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            fontSize: '12px',
            fontWeight: 900,
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
        }),
        periodTabs: {
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
        },
        periodTab: (active) => ({
            minHeight: '30px',
            padding: '0 11px',
            borderRadius: '14px',
            border: `1px solid ${active ? `${accent}4d` : isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
            background: active ? `${accent}24` : 'transparent',
            color: active ? accent : subText,
            fontSize: '11px',
            fontWeight: 900,
            cursor: 'pointer',
            outline: 'none',
            fontFamily: 'inherit',
        }),
        historyRow: {
            minHeight: '64px',
            display: 'flex',
            alignItems: 'center',
            gap: '11px',
            padding: '10px 12px',
            boxSizing: 'border-box',
            borderRadius: '22px',
            background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.9)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.08)'}`,
        },
        dateBadge: {
            width: '40px',
            height: '40px',
            borderRadius: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accent,
            background: `${accent}18`,
            border: `1px solid ${accent}32`,
            flexShrink: 0,
        },
        rowCopy: {
            minWidth: 0,
            flex: 1,
        },
        rowDate: {
            color: mainText,
            fontSize: '15px',
            fontWeight: 900,
            lineHeight: 1.15,
        },
        rowMeta: {
            minHeight: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: subText,
            fontSize: '11px',
            fontWeight: 800,
            marginTop: '3px',
        },
        rowValue: {
            color: accent,
            fontSize: '15px',
            fontWeight: 900,
            whiteSpace: 'nowrap',
        },
    };
};

export default RecoveryAnalytics;
