import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FaBrain,
    FaBullseye,
    FaCalculator,
    FaChevronRight,
    FaClock,
    FaFire,
    FaMedal,
    FaPuzzlePiece,
    FaStar
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';

const MENTAL_ACCENT = '#8A7CD6';

const MODE_TONES = [
    { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)' },
    { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)' },
    { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.13)', ring: 'rgba(127,200,184,0.26)' },
    { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.26)' }
];

const EASE = [0.2, 0.8, 0.2, 1];

const MentalMain = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize)
        ];
        return () => subs.forEach(sub => sub.unsubscribe());
    }, []);

    useEffect(() => { logSectionVisit('mental'); }, []);

    const s = styles(theme, fSize);
    const summary = useMemo(() => buildMentalSummary(), []);

    const menuItems = [
        {
            id: 0,
            Icon: FaCalculator,
            kicker: langIndex === 0 ? 'Скорость' : 'Speed',
            title: langIndex === 0 ? 'Быстрый счет' : 'Mental Math',
            subtitle: langIndex === 0 ? 'Точность и темп' : 'Accuracy & pace',
            action: () => setPage('MentalMath')
        },
        {
            id: 1,
            Icon: FaBrain,
            kicker: langIndex === 0 ? 'Память' : 'Memory',
            title: langIndex === 0 ? 'N-back' : 'Memory',
            subtitle: langIndex === 0 ? 'Ряды и удержание' : 'N-back & sequences',
            action: () => setPage('MentalMemory')
        },
        {
            id: 2,
            Icon: FaPuzzlePiece,
            kicker: langIndex === 0 ? 'Логика' : 'Logic',
            title: langIndex === 0 ? 'Паттерны' : 'Logic',
            subtitle: langIndex === 0 ? 'Связи и задачи' : 'Patterns & puzzles',
            action: () => setPage('MentalLogic')
        },
        {
            id: 3,
            Icon: FaBullseye,
            kicker: langIndex === 0 ? 'Фокус' : 'Focus',
            title: langIndex === 0 ? 'Контроль' : 'Focus',
            subtitle: langIndex === 0 ? 'Внимание и реакция' : 'Attention & control',
            action: () => setPage('MentalFocus')
        }
    ];

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.07 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 12, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    return (
        <div style={s.container}>
            <HoverInfoButton tab="MentalMain" variant="subtle" accent={MENTAL_ACCENT} />
            <div style={s.scrollView} className="no-scrollbar">
                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }} style={s.hero}>
                    <div style={s.heroGlow} />
                    <div style={s.heroCopy}>
                        <div style={s.eyebrow}>{langIndex === 0 ? 'Тренировка ума' : 'Mind training'}</div>
                        <h1 style={s.heroTitle}>{langIndex === 0 ? 'Ментал' : 'Mental'}</h1>
                        <div style={s.heroSubtitle}>
                            {langIndex === 0 ? 'Счет, память, логика и фокус в одном разделе' : 'Math, memory, logic, and focus in one workspace'}
                        </div>
                    </div>
                    <div style={s.heroStats}>
                        <MetricPill icon={<FaStar />} label={langIndex === 0 ? 'Очки' : 'Score'} value={formatScore(summary.totalScore)} styleObj={s} />
                        <MetricPill icon={<FaClock />} label={langIndex === 0 ? 'Дни' : 'Days'} value={summary.trainedDays} styleObj={s} />
                        <MetricPill icon={<FaFire />} label={langIndex === 0 ? 'Лучшее' : 'Best'} value={formatScore(summary.bestScore)} styleObj={s} />
                    </div>
                    <img style={s.heroImage} src="images/bro_mind.png" alt="" />
                </motion.section>

                <motion.section variants={containerAnim} initial="hidden" animate="show" style={s.modeGrid}>
                    {menuItems.map((item) => (
                        <MentalModeCard
                            key={item.id}
                            item={item}
                            tone={MODE_TONES[item.id]}
                            theme={theme}
                            fSize={fSize}
                            langIndex={langIndex}
                            record={summary.categoryScores[item.id] || 0}
                            variants={itemAnim}
                        />
                    ))}
                </motion.section>

                <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} style={s.progressPanel}>
                    <div style={s.progressHeader}>
                        <div>
                            <div style={s.panelTitle}>{langIndex === 0 ? 'Общий прогресс' : 'Overall progress'}</div>
                            <div style={s.panelSub}>{langIndex === 0 ? 'Сумма рекордов по режимам' : 'Combined records across modes'}</div>
                        </div>
                        <div style={s.totalBadge}>
                            <FaMedal size={12} />
                            <span>{formatScore(summary.totalScore)}</span>
                        </div>
                    </div>
                    <div style={s.progressRows}>
                        {menuItems.map((item) => (
                            <ProgressRow
                                key={item.id}
                                label={item.title}
                                value={summary.categoryScores[item.id] || 0}
                                max={summary.maxCategoryScore}
                                tone={MODE_TONES[item.id]}
                                styleObj={s}
                            />
                        ))}
                    </div>
                </motion.section>
            </div>
        </div>
    );
};

function MentalModeCard({ item, tone, theme, fSize, langIndex, record, variants }) {
    const s = styles(theme, fSize);
    const Icon = item.Icon;

    return (
        <motion.button
            type="button"
            variants={variants}
            whileTap={{ scale: 0.97 }}
            onClick={item.action}
            style={s.modeCard(tone)}
        >
            <div style={s.modeTop}>
                <div style={s.modeIcon(tone)}>
                    <Icon size={18} />
                </div>
                <div style={s.modeRecord(record > 0, tone)}>
                    <FaStar size={9} />
                    {formatScore(record)}
                </div>
            </div>
            <div style={s.modeText}>
                <div style={s.modeKicker(tone)}>{item.kicker}</div>
                <div style={s.modeTitle}>{item.title}</div>
                <div style={s.modeSub}>{item.subtitle}</div>
            </div>
            <div style={s.modeFooter}>
                <span>{record > 0 ? (langIndex === 0 ? 'Рекорд' : 'Record') : (langIndex === 0 ? 'Новый' : 'New')}</span>
                <FaChevronRight size={12} />
            </div>
        </motion.button>
    );
}

function MetricPill({ icon, label, value, styleObj }) {
    return (
        <div style={styleObj.metricPill}>
            <span style={styleObj.metricIcon}>{icon}</span>
            <span style={styleObj.metricText}>
                <span>{label}</span>
                <strong>{value}</strong>
            </span>
        </div>
    );
}

function ProgressRow({ label, value, max, tone, styleObj }) {
    const progress = max > 0 ? Math.max(0.04, Math.min(1, value / max)) : 0.04;

    return (
        <div style={styleObj.progressRow}>
            <div style={styleObj.progressName}>
                <span style={{ ...styleObj.progressDot, background: tone.hue }} />
                <span>{label}</span>
            </div>
            <div style={styleObj.progressTrack}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                    style={{ ...styleObj.progressFill, background: tone.hue, boxShadow: `0 0 16px ${tone.hue}55` }}
                />
            </div>
            <strong style={styleObj.progressValue}>{formatScore(value)}</strong>
        </div>
    );
}

const buildMentalSummary = () => {
    const records = Array.isArray(AppData.mentalRecords) ? AppData.mentalRecords : [];
    const categoryScores = [0, 1, 2, 3].map((index) => {
        const row = Array.isArray(records[index]) ? records[index] : [];
        return row.reduce((sum, value) => sum + (Number(value) || 0), 0);
    });
    const totalScore = categoryScores.reduce((sum, value) => sum + value, 0);
    const bestScore = Math.max(0, ...categoryScores);
    const maxCategoryScore = Math.max(1, bestScore);
    const trainedDays = Object.keys(AppData.mentalLog || {}).length;

    return { categoryScores, totalScore, bestScore, maxCategoryScore, trainedDays };
};

const formatScore = (value) => {
    const score = Number(value) || 0;
    if (score >= 1000) return `${(score / 1000).toFixed(score >= 10000 ? 0 : 1)}k`;
    return `${Math.round(score)}`;
};

const hexToRgb = (hex) => {
    const safe = (hex || MENTAL_ACCENT).replace('#', '');
    return {
        r: parseInt(safe.slice(0, 2), 16) || 138,
        g: parseInt(safe.slice(2, 4), 16) || 124,
        b: parseInt(safe.slice(4, 6), 16) || 214
    };
};

const styles = (theme, fontSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const accentRgb = hexToRgb(MENTAL_ACCENT);
    const accentText = `${accentRgb.r},${accentRgb.g},${accentRgb.b}`;
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
    const panel = isLight ? 'rgba(255,255,255,0.86)' : 'rgba(255,255,255,0.045)';
    const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,23,27,0.88)';

    return {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: isLight
                ? `radial-gradient(900px 440px at 82% -12%, rgba(${accentText},0.12), transparent 58%), radial-gradient(720px 360px at -12% 100%, rgba(102,217,232,0.1), transparent 58%), #F4F5F7`
                : `radial-gradient(980px 500px at 82% -12%, rgba(${accentText},0.10), transparent 56%), radial-gradient(760px 380px at -10% 100%, rgba(102,217,232,0.065), transparent 56%), #0E1013`,
            color: text,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        },
        scrollView: {
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            padding: 'calc(13vh + 14px) 0 calc(132px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box'
        },
        hero: {
            position: 'relative',
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            minHeight: 188,
            margin: '0 auto',
            borderRadius: 26,
            padding: '18px 18px 16px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.96), rgba(${accentText},0.1))`
                : `linear-gradient(145deg, rgba(23,27,31,0.96), rgba(${accentText},0.12))`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(138,124,214,0.28)'}`,
            boxShadow: isLight
                ? '0 16px 38px -34px rgba(0,0,0,0.28), 0 1px 0 rgba(255,255,255,0.74) inset'
                : '0 1px 0 rgba(255,255,255,0.055) inset, 0 18px 42px -34px rgba(0,0,0,0.78)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            isolation: 'isolate'
        },
        heroGlow: {
            position: 'absolute',
            right: -54,
            top: -70,
            width: 210,
            height: 210,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${accentText},0.28) 0%, transparent 64%)`,
            zIndex: 0,
            pointerEvents: 'none'
        },
        heroCopy: { position: 'relative', zIndex: 2, maxWidth: '68%', minWidth: 0 },
        eyebrow: {
            color: sub,
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: '0.16em',
            textTransform: 'uppercase'
        },
        heroTitle: {
            margin: '5px 0 0',
            color: text,
            fontSize: fontSize === 0 ? 24 : 27,
            lineHeight: 1.06,
            fontWeight: 950,
            letterSpacing: 0
        },
        heroSubtitle: {
            marginTop: 7,
            color: sub,
            fontSize: fontSize === 0 ? 12 : 13,
            lineHeight: 1.35,
            fontWeight: 720,
            maxWidth: 260
        },
        heroStats: {
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 7,
            marginTop: 15,
            paddingRight: 98,
            boxSizing: 'border-box'
        },
        heroImage: {
            position: 'absolute',
            right: 4,
            bottom: -8,
            width: 126,
            maxWidth: '34%',
            zIndex: 1,
            opacity: isLight ? 0.92 : 0.9,
            filter: isLight ? 'drop-shadow(0 14px 26px rgba(15,23,42,0.16))' : 'drop-shadow(0 16px 28px rgba(0,0,0,0.5))',
            pointerEvents: 'none'
        },
        metricPill: {
            minHeight: 42,
            borderRadius: 14,
            border: `1px solid ${border}`,
            background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.036)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 8px',
            boxSizing: 'border-box',
            overflow: 'hidden'
        },
        metricIcon: { color: MENTAL_ACCENT, display: 'flex', flexShrink: 0, fontSize: 11 },
        metricText: {
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            color: sub,
            fontSize: 8.5,
            fontWeight: 850,
            lineHeight: 1.1
        },
        modeGrid: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '14px auto 0',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 10,
            boxSizing: 'border-box'
        },
        modeCard: (tone) => ({
            appearance: 'none',
            WebkitAppearance: 'none',
            minHeight: 142,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : tone.ring}`,
            borderRadius: 22,
            background: isLight
                ? `radial-gradient(150px 100px at 100% 0%, ${tone.soft}, transparent 70%), rgba(255,255,255,0.9)`
                : `radial-gradient(170px 115px at 100% 0%, ${tone.soft}, transparent 72%), rgba(20,23,27,0.94)`,
            boxShadow: isLight
                ? '0 12px 28px -24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.72) inset'
                : '0 1px 0 rgba(255,255,255,0.045) inset, 0 14px 34px -30px rgba(0,0,0,0.78)',
            padding: 12,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'space-between',
            color: text,
            textAlign: 'left',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            overflow: 'hidden',
            boxSizing: 'border-box',
            opacity: 1
        }),
        modeTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
        modeIcon: (tone) => ({
            width: 38,
            height: 38,
            borderRadius: 13,
            color: tone.hue,
            background: tone.soft,
            border: `1px solid ${tone.ring}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        }),
        modeRecord: (active, tone) => ({
            minWidth: 0,
            minHeight: 24,
            padding: '0 8px',
            borderRadius: 999,
            color: active ? tone.hue : sub,
            background: active ? tone.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)'),
            border: `1px solid ${active ? tone.ring : border}`,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontSize: 10,
            fontWeight: 900,
            fontVariantNumeric: 'tabular-nums'
        }),
        modeText: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3, marginTop: 11 },
        modeKicker: (tone) => ({ color: tone.hue, fontSize: 9, fontWeight: 950, textTransform: 'uppercase', letterSpacing: '0.12em' }),
        modeTitle: { color: text, fontSize: fontSize === 0 ? 16 : 18, lineHeight: 1.1, fontWeight: 950, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        modeSub: { color: sub, opacity: 0.92, fontSize: fontSize === 0 ? 11 : 12, lineHeight: 1.25, fontWeight: 720, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' },
        modeFooter: {
            marginTop: 12,
            paddingTop: 9,
            borderTop: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: sub,
            fontSize: 10,
            fontWeight: 850
        },
        progressPanel: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '14px auto 0',
            borderRadius: 22,
            padding: 14,
            background: panel,
            border: `1px solid ${border}`,
            boxSizing: 'border-box',
            boxShadow: isLight ? '0 12px 28px -26px rgba(0,0,0,0.18)' : '0 1px 0 rgba(255,255,255,0.035) inset',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)'
        },
        progressHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
        panelTitle: { color: text, fontSize: 14, fontWeight: 950, lineHeight: 1.15 },
        panelSub: { color: sub, fontSize: 10.5, fontWeight: 720, marginTop: 3 },
        totalBadge: {
            minHeight: 32,
            padding: '0 10px',
            borderRadius: 999,
            border: `1px solid rgba(${accentText},0.28)`,
            background: `rgba(${accentText},0.13)`,
            color: MENTAL_ACCENT,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 12,
            fontWeight: 950,
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0
        },
        progressRows: { display: 'flex', flexDirection: 'column', gap: 9 },
        progressRow: { display: 'grid', gridTemplateColumns: '82px minmax(0, 1fr) 38px', alignItems: 'center', gap: 8 },
        progressName: { display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, color: sub, fontSize: 10.5, fontWeight: 850, overflow: 'hidden' },
        progressDot: { width: 6, height: 6, borderRadius: 99, flexShrink: 0 },
        progressTrack: { height: 6, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)', overflow: 'hidden' },
        progressFill: { height: '100%', borderRadius: 999 },
        progressValue: { color: text, fontSize: 11, fontWeight: 950, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
    };
};

export default MentalMain;
