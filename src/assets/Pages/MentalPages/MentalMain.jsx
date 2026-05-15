import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    FaBrain,
    FaBullseye,
    FaCalculator,
    FaChartLine,
    FaChevronRight,
    FaClock,
    FaFire,
    FaPalette,
    FaMedal,
    FaPuzzlePiece,
    FaStar
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { emitSectionAccentChanged, fontSize$, lang$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';
import SectionAccentSettings, { POSITIVE_ACCENT_PRESETS, buildSectionAccent } from '../SectionAccentSettings.jsx';
import { saveData } from '../../StaticClasses/SaveHelper.js';

const MENTAL_ACCENT = '#A66BFF';

const MODE_TONES = [
    { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)' },
    { hue: '#A66BFF', soft: 'rgba(166,107,255,0.18)', ring: 'rgba(166,107,255,0.38)' },
    { hue: '#2FD6BD', soft: 'rgba(47,214,189,0.16)', ring: 'rgba(47,214,189,0.34)' },
    { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.26)' }
];

const EASE = [0.2, 0.8, 0.2, 1];

const MentalMain = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [showAccentSettings, setShowAccentSettings] = useState(false);
    const [accentColor, setAccentColor] = useState(buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT).hue);
    const [, setAccentPresetVersion] = useState(0);

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
    const activeAccent = accentColor;
    const changeAccentColor = async (color) => {
        const next = buildSectionAccent(color, MENTAL_ACCENT).hue;
        AppData.mentalAccentColor = next;
        setAccentColor(next);
        await saveData();
        emitSectionAccentChanged();
    };
    const saveAccentPreset = async () => {
        await AppData.addAccentPreset('mental', accentColor, POSITIVE_ACCENT_PRESETS);
        setAccentPresetVersion(version => version + 1);
    };

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
            <SectionAccentSettings
                show={showAccentSettings}
                onClose={() => setShowAccentSettings(false)}
                theme={theme}
                langIndex={langIndex}
                title={langIndex === 0 ? 'Акцент ума' : 'Mind accent'}
                subtitle={langIndex === 0 ? 'Цвет карточек, прогресса и нижнего меню' : 'Cards, progress, and bottom navigation color'}
                accentColor={accentColor}
                fallbackColor={MENTAL_ACCENT}
                customPresets={AppData.mentalAccentPresets}
                onAccentChange={changeAccentColor}
                onSavePreset={saveAccentPreset}
            />
            <HoverInfoButton tab="MentalMain" variant="subtle" accent={activeAccent} />
            <div style={s.scrollView} className="no-scrollbar">
                <div style={s.pageHeader}>
                    <div style={s.pageHeaderSpacer} />
                    <div style={s.pageHeaderBrand}>
                        <div style={s.pageTitle}>UltyMyLife</div>
                        <div style={s.pageSubtitle}>{langIndex === 0 ? 'Тренируй разум как тело' : 'Train your mind like your body'}</div>
                    </div>
                    <Motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowAccentSettings(true)}
                        style={s.headerAccentButton}
                    >
                        <FaPalette size={12} />
                        <span>{langIndex === 0 ? 'Акцент' : 'Accent'}</span>
                        <span style={s.actionColorDot} />
                    </Motion.button>
                </div>
                <Motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }} style={s.hero}>
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
                </Motion.section>

                <Motion.section variants={containerAnim} initial="hidden" animate="show" style={s.modeGrid}>
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
                </Motion.section>

                <Motion.button
                    type="button"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, ease: EASE, delay: 0.08 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setPage('MentalProgress')}
                    style={s.progressLink}
                >
                    <span style={s.progressLinkIcon}>
                        <FaChartLine size={15} />
                    </span>
                    <span style={s.progressLinkCopy}>
                        <strong>{langIndex === 0 ? 'Общий прогресс' : 'Overall progress'}</strong>
                        <span>{langIndex === 0 ? 'Отдельная страница с рекордами по режимам' : 'Separate page with mode records'}</span>
                    </span>
                    <span style={s.totalBadge}>
                        <FaMedal size={12} />
                        <span>{formatScore(summary.totalScore)}</span>
                    </span>
                </Motion.button>
            </div>
        </div>
    );
};

function MentalModeCard({ item, tone, theme, fSize, langIndex, record, variants }) {
    const s = styles(theme, fSize);
    const Icon = item.Icon;

    return (
        <Motion.button
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
                <div style={s.modeSub}>{item.subtitle}</div>
            </div>
            <div style={s.modeFooter}>
                <span>{record > 0 ? (langIndex === 0 ? 'Рекорд' : 'Record') : (langIndex === 0 ? 'Новый' : 'New')}</span>
                <FaChevronRight size={12} />
            </div>
        </Motion.button>
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

function ProgressRow({ Icon, label, value, max, tone, styleObj }) {
    const progress = max > 0 ? Math.max(0.04, Math.min(1, value / max)) : 0.04;

    return (
        <div style={styleObj.progressCard(tone)}>
            <div style={styleObj.progressCardTop}>
                <span style={styleObj.progressIcon(tone)}>
                    <Icon size={13} />
                </span>
                <span style={styleObj.progressName}>{label}</span>
                <strong style={styleObj.progressValue}>{formatScore(value)}</strong>
            </div>
            <div style={styleObj.progressTrack}>
                <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                    style={{ ...styleObj.progressFill, background: tone.hue, boxShadow: `0 0 16px ${tone.hue}55` }}
                />
            </div>
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

const styles = (theme, fontSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const mentalAccent = buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT);
    const accentText = mentalAccent.rgb;
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
    return {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: isLight
                ? `radial-gradient(640px 420px at 86% -8%, rgba(${accentText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accentText},0.1), transparent 66%), #F4F5F7`
                : `radial-gradient(640px 420px at 86% -8%, rgba(${accentText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accentText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`,
            color: text,
            fontFamily: "'SF Pro Rounded', 'Nunito Sans', Nunito, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', system-ui, sans-serif"
        },
        scrollView: {
            height: '100%',
            width: '100%',
            overflowY: 'auto',
            padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 0 calc(132px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box'
        },
        pageHeader: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '0 auto 8px',
            padding: '4px 0 8px',
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: '96px minmax(0, 1fr) 96px',
            alignItems: 'center',
            gap: 12
        },
        pageHeaderSpacer: { width: 96, height: 38 },
        pageHeaderBrand: { minWidth: 0, textAlign: 'center' },
        headerAccentButton: {
            minWidth: 0,
            height: 38,
            borderRadius: 999,
            border: `1px solid rgba(${accentText},${isLight ? 0.2 : 0.28})`,
            background: `rgba(${accentText},${isLight ? 0.11 : 0.13})`,
            color: mentalAccent.hue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifySelf: 'end',
            gap: 6,
            fontSize: 12,
            fontWeight: 900,
            fontFamily: 'inherit',
            padding: '0 11px',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
        },
        actionColorDot: {
            width: 8,
            height: 8,
            borderRadius: 99,
            background: mentalAccent.hue,
            boxShadow: `0 0 12px ${mentalAccent.glow}`,
            flexShrink: 0
        },
        pageTitle: {
            color: text,
            fontFamily: '"SF Pro Rounded", "Nunito Sans", Nunito, "SF Pro Display", -apple-system, BlinkMacSystemFont, Inter, "Segoe UI", system-ui, sans-serif',
            fontSize: fontSize === 0 ? 21 : 24,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1.05,
            opacity: 0.86
        },
        pageSubtitle: {
            marginTop: 5,
            color: sub,
            fontSize: fontSize === 0 ? 8 : 9,
            fontWeight: 600,
            letterSpacing: '0.14em',
            opacity: 0.82
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
                ? `linear-gradient(145deg, rgba(255,255,255,0.70), rgba(${accentText},0.09))`
                : `linear-gradient(145deg, rgba(23,27,31,0.68), rgba(${accentText},0.10))`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.13)'}`,
            boxShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
                : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)',
            backdropFilter: 'blur(26px) saturate(170%)',
            WebkitBackdropFilter: 'blur(26px) saturate(170%)',
            isolation: 'isolate'
        },
        heroGlow: {
            position: 'absolute',
            right: -54,
            top: -70,
            width: 210,
            height: 210,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${accentText},0.12) 0%, transparent 66%)`,
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
            pointerEvents: 'none',
            WebkitMaskImage: 'radial-gradient(circle at 50% 52%, #000 0 58%, transparent 76%)',
            maskImage: 'radial-gradient(circle at 50% 52%, #000 0 58%, transparent 76%)'
        },
        metricPill: {
            minHeight: 42,
            borderRadius: 14,
            border: `1px solid ${border}`,
            background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.038)',
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 8px',
            boxSizing: 'border-box',
            overflow: 'hidden'
        },
        metricIcon: { color: mentalAccent.hue, display: 'flex', flexShrink: 0, fontSize: 11 },
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
            borderRadius: 24,
            padding: 15,
            background: isLight
                ? `radial-gradient(260px 160px at 6% 0%, rgba(${accentText},0.12), transparent 68%), linear-gradient(135deg, rgba(255,255,255,0.78), rgba(255,255,255,0.46))`
                : `radial-gradient(300px 180px at 8% 0%, rgba(${accentText},0.16), transparent 70%), linear-gradient(135deg, rgba(30,35,43,0.72), rgba(17,20,25,0.64))`,
            border: `1px solid rgba(${accentText},${isLight ? 0.16 : 0.20})`,
            boxSizing: 'border-box',
            boxShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.82) inset, 0 16px 34px -28px rgba(15,23,42,0.20)'
                : `0 1px 0 rgba(255,255,255,0.07) inset, 0 22px 44px -32px rgba(0,0,0,0.72), 0 12px 34px -30px rgba(${accentText},0.72)`,
            backdropFilter: 'blur(22px) saturate(165%)',
            WebkitBackdropFilter: 'blur(22px) saturate(165%)'
        },
        progressLink: {
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            minHeight: 68,
            margin: '14px auto 0',
            borderRadius: 22,
            border: `1px solid rgba(${accentText},${isLight ? 0.16 : 0.22})`,
            background: isLight
                ? `linear-gradient(135deg, rgba(255,255,255,0.78), rgba(${accentText},0.08))`
                : `linear-gradient(135deg, rgba(30,35,43,0.68), rgba(${accentText},0.10))`,
            boxShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 14px 30px -26px rgba(15,23,42,0.18)'
                : `0 1px 0 rgba(255,255,255,0.06) inset, 0 18px 38px -30px rgba(0,0,0,0.72)`,
            color: text,
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 14px',
            boxSizing: 'border-box',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent'
        },
        progressLinkIcon: {
            width: 38,
            height: 38,
            borderRadius: 14,
            color: mentalAccent.hue,
            background: `rgba(${accentText},0.13)`,
            border: `1px solid rgba(${accentText},0.24)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        progressLinkCopy: {
            flex: 1,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 3,
            textAlign: 'left'
        },
        progressLinkCopyStrong: {},
        progressHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
        panelTitle: { color: text, fontSize: 14, fontWeight: 950, lineHeight: 1.15 },
        panelSub: { color: sub, fontSize: 10.5, fontWeight: 720, marginTop: 3 },
        totalBadge: {
            minHeight: 32,
            padding: '0 10px',
            borderRadius: 999,
            border: `1px solid rgba(${accentText},0.28)`,
            background: `rgba(${accentText},0.13)`,
            color: mentalAccent.hue,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            fontSize: 12,
            fontWeight: 950,
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0
        },
        progressRows: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 9 },
        progressCard: (tone) => ({
            minHeight: 68,
            borderRadius: 18,
            padding: '10px 11px',
            boxSizing: 'border-box',
            background: isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.62), ${tone.soft})`
                : `linear-gradient(145deg, rgba(255,255,255,0.046), ${tone.soft})`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.07)' : tone.ring}`,
            boxShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.72) inset, 0 12px 22px -20px rgba(15,23,42,0.18)'
                : `0 1px 0 rgba(255,255,255,0.055) inset, 0 12px 26px -24px ${tone.hue}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 9,
            overflow: 'hidden'
        }),
        progressCardTop: { display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto', alignItems: 'center', gap: 7 },
        progressIcon: (tone) => ({
            width: 24,
            height: 24,
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tone.hue,
            background: tone.soft,
            border: `1px solid ${tone.ring}`
        }),
        progressName: { minWidth: 0, color: text, fontSize: 11, fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
        progressTrack: { height: 6, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)', overflow: 'hidden' },
        progressFill: { height: '100%', borderRadius: 999 },
        progressValue: { color: text, fontSize: 11, fontWeight: 950, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }
    };
};

export default MentalMain;
