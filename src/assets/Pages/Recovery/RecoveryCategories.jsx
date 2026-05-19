import React, { useEffect, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    FaBolt,
    FaChevronRight,
    FaCrown,
    FaFeatherAlt,
    FaFire,
    FaLock,
    FaMoon,
    FaSnowflake,
    FaSpa,
    FaSun,
    FaWind,
} from 'react-icons/fa';
import { MdOutlineCreate } from 'react-icons/md';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$, recoveryType$, setPage, premium$ } from '../../StaticClasses/HabitsBus.js';
import {
    breathingProtocols,
    meditationProtocols,
    coldWaterProtocols,
    getRecoverySessionStats,
    recoverySessionMatches,
} from '../../StaticClasses/RecoveryLogHelper.js';
import BreathingTimer from './BreathingTimer.jsx';
import MeditationTimer from './MeditationTimer.jsx';
import HardeningTimer from './HardeningTimer.jsx';
import BreathingConstructor from './BreathingConstructor.jsx';
import MeditationConstructor from './MeditationConstructor.jsx';
import HardeningConstructor from './HardeningConstructor.jsx';

const PAGE_META = [
    {
        Icon: FaWind,
        accent: '#7ee6d2',
        rgb: '126, 230, 210',
        ru: { eyebrow: 'ДЫХАНИЕ', title: 'Дыхание', subtitle: 'Спокойный ритм и быстрый сброс' },
        en: { eyebrow: 'BREATH', title: 'Breathing', subtitle: 'Calm rhythm and fast reset' },
    },
    {
        Icon: FaSpa,
        accent: '#8FA6C8',
        rgb: '143, 166, 200',
        ru: { eyebrow: 'ОСОЗНАННОСТЬ', title: 'Медитация', subtitle: 'Фокус, пауза и ровное внимание' },
        en: { eyebrow: 'MINDFULNESS', title: 'Meditation', subtitle: 'Focus, pause, and steady attention' },
    },
    {
        Icon: FaSnowflake,
        accent: '#69d6f0',
        rgb: '105, 214, 240',
        ru: { eyebrow: 'ХОЛОД', title: 'Закаливание', subtitle: 'Мягкая адаптация и энергия' },
        en: { eyebrow: 'COLD', title: 'Cold exposure', subtitle: 'Gentle adaptation and energy' },
    },
];

const LEVEL_META = [
    { ru: 'Легко', en: 'Easy', Icon: FaMoon, accent: '#50f08a', rgb: '80, 240, 138' },
    { ru: 'Средне', en: 'Medium', Icon: FaFeatherAlt, accent: '#22d3ee', rgb: '34, 211, 238' },
    { ru: 'Сложно', en: 'Hard', Icon: FaBolt, accent: '#9A84C8', rgb: '154, 132, 200' },
    { ru: 'Про', en: 'Pro', Icon: FaSun, accent: '#f5d33f', rgb: '245, 211, 63' },
    { ru: 'Свой', en: 'Custom', Icon: MdOutlineCreate, accent: '#7ee6d2', rgb: '126, 230, 210' },
];

const getStructure = (type) => {
    if (type === 1) return meditationProtocols;
    if (type === 2) return coldWaterProtocols;
    return breathingProtocols;
};

const RecoveryCategories = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [recoveryType, setRecoveryTypeState] = useState(recoveryType$.value ?? 0);
    const [structure, setStructure] = useState(getStructure(recoveryType$.value ?? 0));
    const [currentProtocol, setCurrentProtocol] = useState(getStructure(recoveryType$.value ?? 0)[0]?.protocols?.[0]);
    const [protocolIndex, setProtocolIndex] = useState(0);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [showBreathingConstructor, setShowBreathingConstructor] = useState(false);
    const [showMeditationConstructor, setShowMeditationConstructor] = useState(false);
    const [showHardeningConstructor, setShowHardeningConstructor] = useState(false);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const subs = [
            premium$.subscribe(setHasPremium),
            theme$.subscribe(setThemeState),
            lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
            recoveryType$.subscribe((type) => {
                const nextType = type ?? 0;
                const nextStructure = getStructure(nextType);
                setRecoveryTypeState(nextType);
                setStructure(nextStructure);
                setCurrentProtocol(nextStructure[0]?.protocols?.[0]);
                setProtocolIndex(0);
                setCategoryIndex(0);
            }),
        ];
        return () => subs.forEach((sub) => sub.unsubscribe());
    }, []);

    const isRu = langIndex === 0;
    const meta = PAGE_META[recoveryType] ?? PAGE_META[0];
    const summary = getRecoverySessionStats(recoveryType);
    const s = styles(theme, fSize, meta);

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.045 } },
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 12, scale: 0.985 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 330, damping: 28 } },
    };

    const openConstructor =
        recoveryType === 0 ? setShowBreathingConstructor : recoveryType === 1 ? setShowMeditationConstructor : setShowHardeningConstructor;

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
                    <div style={s.heroGlow} />
                    <div style={s.heroIcon}>
                        <meta.Icon />
                    </div>
                    <div style={s.heroCopy}>
                        <div style={s.eyebrow}>{isRu ? meta.ru.eyebrow : meta.en.eyebrow}</div>
                        <h1 style={s.heroTitle}>{isRu ? meta.ru.title : meta.en.title}</h1>
                        <div style={s.heroSubtitle}>{isRu ? meta.ru.subtitle : meta.en.subtitle}</div>
                    </div>
                    <div style={s.heroStats}>
                        <div style={s.heroMiniStat}>
                            <FaFire />
                            <span>{summary.streak}</span>
                            <span style={s.heroStatMuted}>{isRu ? 'серия' : 'streak'}</span>
                        </div>
                        <div style={s.heroMiniStat}>
                            <FaBolt />
                            <span>{summary.total}</span>
                            <span style={s.heroStatMuted}>{isRu ? 'всего' : 'total'}</span>
                        </div>
                    </div>
                </Motion.section>

                <div style={s.sectionHeader}>
                    <div>
                        <div style={s.sectionKicker}>{isRu ? 'ПРАКТИКИ' : 'PRACTICES'}</div>
                        <h2 style={s.sectionTitle}>{isRu ? 'Выбери ритм' : 'Choose rhythm'}</h2>
                    </div>
                </div>

                <Motion.div variants={containerAnim} initial="hidden" animate="show" style={s.grid}>
                    {structure.flatMap((category, difficulty) =>
                        category.protocols.map((protocol, ind) => (
                            <PracticeCard
                                key={`${difficulty}-${ind}`}
                                variants={itemAnim}
                                protocol={protocol}
                                difficulty={difficulty}
                                index={ind}
                                type={recoveryType}
                                theme={theme}
                                fSize={fSize}
                                isRu={isRu}
                                hasPremium={hasPremium}
                                locked={!hasPremium && difficulty > 1}
                                onClick={() => {
                                    setCurrentProtocol(protocol);
                                    setProtocolIndex(ind);
                                    setCategoryIndex(difficulty);
                                    setShowTimer(true);
                                }}
                            />
                        ))
                    )}

                    <PracticeCard
                        variants={itemAnim}
                        protocol={undefined}
                        difficulty={4}
                        index={-1}
                        type={recoveryType}
                        theme={theme}
                        fSize={fSize}
                        isRu={isRu}
                        hasPremium={hasPremium}
                        locked={!hasPremium}
                        isConstructor
                        onClick={() => {
                            setCategoryIndex(4);
                            openConstructor(true);
                        }}
                    />
                </Motion.div>

                <div style={s.bottomSpace} />
            </div>

            {recoveryType === 0 && (
                <BreathingTimer
                    show={showTimer}
                    isCustom={categoryIndex === 4}
                    setShow={setShowTimer}
                    protocol={currentProtocol}
                    protocolIndex={protocolIndex}
                    categoryIndex={categoryIndex}
                />
            )}
            {recoveryType === 1 && (
                <MeditationTimer
                    show={showTimer}
                    isCustom={categoryIndex === 4}
                    setShow={setShowTimer}
                    protocol={currentProtocol}
                    protocolIndex={protocolIndex}
                    categoryIndex={categoryIndex}
                />
            )}
            {recoveryType === 2 && (
                <HardeningTimer
                    show={showTimer}
                    isCustom={categoryIndex === 4}
                    setShow={setShowTimer}
                    protocol={currentProtocol}
                    protocolIndex={protocolIndex}
                    categoryIndex={categoryIndex}
                />
            )}

            <BreathingConstructor
                show={showBreathingConstructor}
                setShow={setShowBreathingConstructor}
                showTimer={setShowTimer}
                setProtocol={setCurrentProtocol}
                theme={theme}
                langIndex={langIndex}
                fSize={fSize}
            />
            <MeditationConstructor
                show={showMeditationConstructor}
                setShow={setShowMeditationConstructor}
                showTimer={setShowTimer}
                setProtocol={setCurrentProtocol}
                theme={theme}
                langIndex={langIndex}
                fSize={fSize}
            />
            <HardeningConstructor
                show={showHardeningConstructor}
                setShow={setShowHardeningConstructor}
                showTimer={setShowTimer}
                setProtocol={setCurrentProtocol}
                theme={theme}
                langIndex={langIndex}
                fSize={fSize}
            />
        </div>
    );
};

function PageHeader({ theme, isRu, fSize }) {
    const text = styles(theme, fSize, PAGE_META[0]);
    return (
        <div style={text.pageHeader}>
            <div style={text.pageTitle}>UltyMyLife</div>
            <div style={text.pageSubtitle}>{isRu ? 'Восстановление — часть роста' : 'Recovery is where growth happens'}</div>
        </div>
    );
}

function PracticeCard({
    protocol,
    difficulty,
    index,
    type,
    theme,
    fSize,
    isRu,
    locked,
    isConstructor = false,
    onClick,
    variants,
}) {
    const level = LEVEL_META[difficulty] ?? LEVEL_META[0];
    const stats = getPracticeStats(type, difficulty, index);
    const name = isConstructor ? (isRu ? 'Свой режим' : 'Custom mode') : getLocalized(protocol?.name, isRu);
    const aim = isConstructor ? (isRu ? 'Собери короткий личный протокол' : 'Build a short personal protocol') : getLocalized(protocol?.aim, isRu);
    const s = cardStyles(theme, fSize, level, isConstructor);
    const Icon = level.Icon;

    return (
        <Motion.button
            type="button"
            variants={variants}
            whileTap={{ scale: locked ? 1 : 0.985 }}
            onClick={() => {
                if (!locked) onClick();
            }}
            style={s.card}
        >
            <div style={s.topRow}>
                <div style={s.iconTile}>
                    <Icon />
                </div>
                <div style={s.levelBadge}>{isRu ? level.ru : level.en}</div>
            </div>

            <div style={s.body}>
                <h3 style={s.title}>{name}</h3>
                <div style={s.subtitle}>{aim}</div>
            </div>

            {!isConstructor && (
                <div style={s.practiceStats}>
                    <div style={s.practiceStatPill}>
                        <FaFire size={10} />
                        <span>{isRu ? 'Серия' : 'Streak'}</span>
                        <b>{stats.streak}</b>
                    </div>
                    <div style={s.practiceStatPill}>
                        <FaBolt size={10} />
                        <span>{isRu ? 'Всего' : 'Total'}</span>
                        <b>{stats.total}</b>
                    </div>
                </div>
            )}

            {isConstructor && (
                <div style={s.constructorRow}>
                    <span>{isRu ? 'Открыть' : 'Open'}</span>
                    <FaChevronRight />
                </div>
            )}

            {locked && <LockedOverlay theme={theme} isRu={isRu} />}
        </Motion.button>
    );
}

function LockedOverlay({ theme, isRu }) {
    const isDark = theme === 'dark' || theme === 'specialdark';
    return (
        <div
            onClick={(event) => event.stopPropagation()}
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: isDark ? 'rgba(10, 12, 15, 0.76)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)',
            }}
        >
            <div
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f5d33f',
                    background: 'rgba(245, 211, 63, 0.13)',
                    border: '1px solid rgba(245, 211, 63, 0.26)',
                }}
            >
                <FaLock />
            </div>
            <button
                type="button"
                onClick={() => setPage('premium')}
                style={{
                    border: 0,
                    borderRadius: '13px',
                    padding: '9px 15px',
                    cursor: 'pointer',
                    color: '#111417',
                    background: '#f5d33f',
                    fontSize: '12px',
                    fontWeight: 900,
                }}
            >
                <FaCrown style={{ marginRight: '6px' }} />
                {isRu ? 'Премиум' : 'Premium'}
            </button>
        </div>
    );
}

const getLocalized = (value, isRu) => {
    if (Array.isArray(value)) return value[isRu ? 0 : 1] ?? value[0] ?? '';
    return value ?? '';
};

const getPracticeStats = (type, difficulty, ind) => {
    if (difficulty === 4 || ind < 0) return { streak: 0, total: 0, days: 0 };
    return getRecoverySessionStats(type, (session) => recoverySessionMatches(session, difficulty, ind));
};

const styles = (theme, fSize = 0, meta = PAGE_META[0]) => {
    const isDark = theme === 'dark' || theme === 'specialdark';
    const mainText = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);
    const background = Colors.get('background', theme);

    return {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: isDark
                ? `radial-gradient(circle at 9% 13%, rgba(${meta.rgb}, 0.08), transparent 30%),
                   radial-gradient(circle at 88% 24%, rgba(159, 140, 255, 0.1), transparent 28%),
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
            fontSize: fSize === 0 ? '10px' : '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            lineHeight: 1.3,
        },
        hero: {
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            minHeight: '118px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '15px 16px',
            borderRadius: '28px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: isDark
                ? `linear-gradient(135deg, rgba(${meta.rgb}, 0.14), rgba(20, 23, 28, 0.92) 48%, rgba(29, 30, 42, 0.9))`
                : `linear-gradient(135deg, rgba(${meta.rgb}, 0.2), rgba(255,255,255,0.95))`,
            border: `1px solid rgba(${meta.rgb}, ${isDark ? 0.28 : 0.34})`,
            boxShadow: isDark ? '0 22px 58px rgba(0,0,0,0.3)' : '0 16px 34px rgba(15,23,42,0.08)',
        },
        heroGlow: {
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at 82% 20%, rgba(${meta.rgb}, 0.24), transparent 38%)`,
            pointerEvents: 'none',
        },
        heroIcon: {
            position: 'relative',
            zIndex: 1,
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: meta.accent,
            fontSize: '25px',
            background: `rgba(${meta.rgb}, 0.13)`,
            border: `1px solid rgba(${meta.rgb}, 0.28)`,
        },
        heroCopy: {
            position: 'relative',
            zIndex: 1,
            minWidth: 0,
            flex: 1,
        },
        eyebrow: {
            color: meta.accent,
            fontSize: '10px',
            fontWeight: 900,
            letterSpacing: '0.18em',
            lineHeight: 1.1,
        },
        heroTitle: {
            margin: '4px 0 3px',
            color: mainText,
            fontSize: fSize === 0 ? '27px' : '29px',
            fontWeight: 900,
            lineHeight: 1.02,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        heroSubtitle: {
            color: subText,
            fontSize: fSize === 0 ? '12px' : '13px',
            fontWeight: 800,
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        heroStats: {
            position: 'relative',
            zIndex: 1,
            minWidth: '112px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '6px',
            flexShrink: 0,
        },
        heroMiniStat: {
            height: '32px',
            borderRadius: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: meta.accent,
            fontWeight: 900,
            fontSize: '14px',
            background: `rgba(${meta.rgb}, 0.1)`,
            border: `1px solid rgba(${meta.rgb}, 0.24)`,
        },
        heroStatMuted: {
            color: subText,
            fontSize: '10px',
            fontWeight: 850,
            marginLeft: '-1px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
        sectionHeader: {
            width: '100%',
            maxWidth: '560px',
            margin: '16px 0 10px',
        },
        sectionKicker: {
            color: subText,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.22em',
            lineHeight: 1.2,
        },
        sectionTitle: {
            margin: '4px 0 0',
            color: mainText,
            fontSize: fSize === 0 ? '23px' : '25px',
            fontWeight: 900,
            lineHeight: 1.1,
        },
        grid: {
            width: '100%',
            maxWidth: '560px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '11px',
        },
        bottomSpace: {
            height: '16px',
        },
    };
};

const cardStyles = (theme, fSize = 0, level = LEVEL_META[0], isConstructor = false) => {
    const isDark = theme === 'dark' || theme === 'specialdark';
    const mainText = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);

    return {
        card: {
            position: 'relative',
            minHeight: isConstructor ? '106px' : '142px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '11px',
            padding: '14px',
            borderRadius: '24px',
            border: `1px solid rgba(${level.rgb}, ${isDark ? 0.25 : 0.34})`,
            background: isDark
                ? `linear-gradient(135deg, rgba(${level.rgb}, 0.11), rgba(20, 23, 28, 0.94) 44%, rgba(14, 16, 20, 0.94))`
                : `linear-gradient(135deg, rgba(${level.rgb}, 0.18), rgba(255,255,255,0.96))`,
            boxShadow: isDark ? '0 18px 44px rgba(0,0,0,0.26)' : '0 12px 26px rgba(15,23,42,0.08)',
            color: mainText,
            cursor: 'pointer',
            appearance: 'none',
            outline: 'none',
            textAlign: 'left',
            overflow: 'hidden',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        topRow: {
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px',
        },
        iconTile: {
            width: '46px',
            height: '46px',
            borderRadius: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: level.accent,
            fontSize: '22px',
            background: `rgba(${level.rgb}, 0.12)`,
            border: `1px solid rgba(${level.rgb}, ${isDark ? 0.28 : 0.38})`,
            boxShadow: `0 0 24px rgba(${level.rgb}, 0.08)`,
        },
        levelBadge: {
            color: level.accent,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.09em',
            lineHeight: 1.15,
            textTransform: 'uppercase',
            maxWidth: '112px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        body: {
            minWidth: 0,
        },
        title: {
            margin: 0,
            color: mainText,
            fontSize: fSize === 0 ? '18px' : '20px',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        subtitle: {
            marginTop: '5px',
            color: subText,
            fontSize: fSize === 0 ? '12px' : '13px',
            fontWeight: 700,
            lineHeight: 1.25,
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        practiceStats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '8px',
        },
        practiceStatPill: {
            minWidth: 0,
            minHeight: '30px',
            borderRadius: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            color: level.accent,
            fontSize: '10px',
            fontWeight: 900,
            background: `rgba(${level.rgb}, 0.1)`,
            border: `1px solid rgba(${level.rgb}, 0.22)`,
            whiteSpace: 'nowrap',
        },
        constructorRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: level.accent,
            fontSize: '13px',
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
        },
    };
};

export default RecoveryCategories;
