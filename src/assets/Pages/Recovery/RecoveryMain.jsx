import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    FaChevronRight,
    FaWind,
    FaSpa,
    FaSnowflake,
    FaLeaf,
    FaFire,
    FaChartLine,
    FaPalette,
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, setPage, setRecoveryType, emitSectionAccentChanged } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';
import SectionAccentSettings, { POSITIVE_ACCENT_PRESETS, buildSectionAccent } from '../SectionAccentSettings.jsx';
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { getRecoverySessionStats } from '../../StaticClasses/RecoveryLogHelper.js';

const RECOVERY_ACCENT = '#2FD6BD';

const RECOVERY_ITEMS = [
    {
        id: 0,
        Icon: FaWind,
        tone: '#7ee6d2',
        rgb: '126, 230, 210',
        ru: {
            kicker: 'Дыхание',
            title: 'Дыхание',
            subtitle: 'Практики для сна, спокойствия и быстрого сброса напряжения',
            cta: 'Начать практику',
        },
        en: {
            kicker: 'Breath',
            title: 'Breathing',
            subtitle: 'Sleep, calm, and fast downshift practices',
            cta: 'Start practice',
        },
    },
    {
        id: 1,
        Icon: FaSpa,
        tone: '#8FA6C8',
        rgb: '143, 166, 200',
        ru: {
            kicker: 'Фокус',
            title: 'Медитация',
            subtitle: 'Фокус, пауза и ровное внимание без перегруза',
            cta: 'Выбрать сеанс',
        },
        en: {
            kicker: 'Mindful',
            title: 'Meditation',
            subtitle: 'Focus, pause, and steady attention without overload',
            cta: 'Choose session',
        },
    },
    {
        id: 2,
        Icon: FaSnowflake,
        tone: '#69d6f0',
        rgb: '105, 214, 240',
        ru: {
            kicker: 'Холод',
            title: 'Закаливание',
            subtitle: 'Мягкая адаптация, энергия и устойчивость тела',
            cta: 'Открыть план',
        },
        en: {
            kicker: 'Cold',
            title: 'Cold exposure',
            subtitle: 'Gentle adaptation, energy, and body resilience',
            cta: 'Open plan',
        },
    },
];

const RecoveryMain = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [showAccentSettings, setShowAccentSettings] = useState(false);
    const [accentColor, setAccentColor] = useState(buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT).hue);
    const [, setAccentPresetVersion] = useState(0);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setThemeState),
            lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
        ];
        return () => subs.forEach((subscription) => subscription.unsubscribe());
    }, []);

    useEffect(() => {
        logSectionVisit('recovery');
    }, []);

    const progressByType = RECOVERY_ITEMS.map((item) => getRecoverySessionStats(item.id));
    const summary = getRecoverySessionStats();
    const isRu = langIndex === 0;
    const s = styles(theme, fSize);
    const activeAccent = accentColor;
    const changeAccentColor = async (color) => {
        const next = buildSectionAccent(color, RECOVERY_ACCENT).hue;
        AppData.recoveryAccentColor = next;
        setAccentColor(next);
        await saveData();
        emitSectionAccentChanged();
    };
    const saveAccentPreset = async () => {
        await AppData.addAccentPreset('recovery', accentColor, POSITIVE_ACCENT_PRESETS);
        setAccentPresetVersion(version => version + 1);
    };

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 16, scale: 0.98 },
        show: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { type: 'spring', stiffness: 320, damping: 28 },
        },
    };

    return (
        <div style={s.container}>
            <SectionAccentSettings
                show={showAccentSettings}
                onClose={() => setShowAccentSettings(false)}
                theme={theme}
                langIndex={langIndex}
                title={isRu ? 'Акцент антистресса' : 'Stress reset accent'}
                subtitle={isRu ? 'Цвет практик, прогресса и нижнего меню' : 'Practices, progress, and bottom navigation color'}
                accentColor={accentColor}
                fallbackColor={RECOVERY_ACCENT}
                customPresets={AppData.recoveryAccentPresets}
                onAccentChange={changeAccentColor}
                onSavePreset={saveAccentPreset}
            />
            <HoverInfoButton tab="RecoveryMain" variant="subtle" accent={activeAccent} />

            <div style={s.scrollView} className="no-scrollbar">
                <div style={s.pageHeader}>
                    <div style={s.pageHeaderSpacer} />
                    <div style={s.pageHeaderBrand}>
                        <div style={s.pageTitle}>UltyMyLife</div>
                        <div style={s.pageSubtitle}>
                            {isRu ? 'Восстановление — часть роста' : 'Recovery is where growth happens'}
                        </div>
                    </div>
                    <Motion.button
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setShowAccentSettings(true)}
                        style={s.headerAccentButton}
                    >
                        <FaPalette size={12} />
                        <span>{isRu ? 'Акцент' : 'Accent'}</span>
                        <span style={s.actionColorDot} />
                    </Motion.button>
                </div>

                <Motion.section
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    style={s.hero}
                >
                    <div style={s.heroGlow} />
                    <div style={s.heroCopy}>
                        <div style={s.eyebrow}>{isRu ? 'АНТИСТРЕСС' : 'STRESS RESET'}</div>
                        <h1 style={s.heroTitle}>{isRu ? 'Восстановление' : 'Recovery'}</h1>

                        <div style={s.heroStats}>
                            <HeroStat
                                theme={theme}
                                icon={<FaLeaf />}
                                label={isRu ? 'режима' : 'modes'}
                                value={RECOVERY_ITEMS.length}
                            />
                            <HeroStat
                                theme={theme}
                                icon={<FaFire />}
                                label={isRu ? 'серия' : 'streak'}
                                value={summary.streak}
                            />
                            <HeroStat
                                theme={theme}
                                icon={<FaChartLine />}
                                label={isRu ? 'сессий' : 'sessions'}
                                value={summary.total}
                            />
                        </div>
                    </div>

                    <img style={s.heroImage} src="images/bro_meditating.png" alt="" />
                </Motion.section>

                <div style={s.sectionHeader}>
                    <div>
                        <h2 style={s.sectionTitle}>{isRu ? 'Практики' : 'Practices'}</h2>
                    </div>
                </div>

                <Motion.div variants={containerAnim} initial="hidden" animate="show" style={s.grid}>
                    {RECOVERY_ITEMS.map((item, index) => (
                        <RecoveryCard
                            key={item.id}
                            item={item}
                            theme={theme}
                            fSize={fSize}
                            isRu={isRu}
                            variants={itemAnim}
                            progress={progressByType[index]}
                        />
                    ))}
                </Motion.div>

                <div style={s.bottomSpace} />
            </div>
        </div>
    );
};

function HeroStat({ theme, icon, label, value }) {
    return (
        <div style={styles(theme).heroStat}>
            <div style={styles(theme).heroStatIcon}>{icon}</div>
            <div style={styles(theme).heroStatCopy}>
                <div style={styles(theme).heroStatValue}>{value}</div>
                <div style={styles(theme).heroStatLabel}>{label}</div>
            </div>
        </div>
    );
}

function RecoveryCard({ item, theme, fSize, isRu, variants, progress }) {
    const text = isRu ? item.ru : item.en;
    const Icon = item.Icon;
    const s = styles(theme, fSize, item);

    return (
        <Motion.button
            type="button"
            variants={variants}
            whileTap={{ scale: 0.985 }}
            onClick={() => {
                setRecoveryType(item.id);
                setPage('RecoveryBreath');
            }}
            style={s.card}
        >
            <div style={s.cardIcon}>
                <Icon />
            </div>

            <div style={s.cardBody}>
                <div style={s.cardTop}>
                    <div style={s.cardTextBlock}>
                        <h3 style={s.cardTitle}>{text.title}</h3>
                    </div>
                    <div style={s.cardProgressPill}>
                        <FaFire size={11} />
                        <span>{progress.streak}</span>
                        <span style={s.cardProgressMuted}>{isRu ? 'серия' : 'streak'}</span>
                    </div>
                </div>

                <div style={s.cardBottom}>
                    <div style={s.sessionPill}>
                        <FaChartLine size={11} />
                        <span>{isRu ? 'Всего сессий' : 'Total sessions'}</span>
                        <b>{progress.total}</b>
                    </div>
                </div>
            </div>

            <FaChevronRight style={s.chevron} />
        </Motion.button>
    );
}

const styles = (theme, fontSize = 0, item = null) => {
    const isDark = theme === 'dark';
    const mainText = Colors.get('mainText', theme);
    const subText = Colors.get('subText', theme);
    const background = Colors.get('background', theme);
    const border = Colors.get('border', theme);
    const recoveryAccent = buildSectionAccent(AppData.recoveryAccentColor || RECOVERY_ACCENT, RECOVERY_ACCENT);
    const tone = item?.tone || recoveryAccent.hue;
    const rgb = item?.rgb || recoveryAccent.rgb;

    return {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background:
                isDark
                    ? `radial-gradient(640px 420px at 86% -8%, rgba(${recoveryAccent.rgb},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${recoveryAccent.rgb},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${background} 46%, #10161A 100%)`
                    : `radial-gradient(640px 420px at 86% -8%, rgba(${recoveryAccent.rgb},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${recoveryAccent.rgb},0.1), transparent 66%), ${background}`,
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
            padding: '24px 4.5vw 140px',
            boxSizing: 'border-box',
        },
        pageHeader: {
            width: '100%',
            maxWidth: '560px',
            display: 'grid',
            gridTemplateColumns: '96px minmax(0, 1fr) 96px',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '8px 0 16px',
            boxSizing: 'border-box',
        },
        pageHeaderSpacer: { width: '96px', height: '38px' },
        pageHeaderBrand: { minWidth: 0, textAlign: 'center' },
        headerAccentButton: {
            minWidth: 0,
            height: '38px',
            borderRadius: '999px',
            border: `1px solid ${recoveryAccent.ring}`,
            background: recoveryAccent.soft,
            color: recoveryAccent.hue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            justifySelf: 'end',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 900,
            fontFamily: 'inherit',
            padding: '0 11px',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },
        actionColorDot: {
            width: '8px',
            height: '8px',
            borderRadius: '99px',
            background: recoveryAccent.hue,
            boxShadow: `0 0 12px ${recoveryAccent.glow}`,
            flexShrink: 0,
        },
        pageTitle: {
            color: mainText,
            fontFamily: 'inherit',
            fontSize: '24px',
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1.05,
            opacity: 0.9,
        },
        pageSubtitle: {
            marginTop: '6px',
            color: subText,
            fontSize: fontSize === 0 ? '10px' : '11px',
            fontWeight: 700,
            letterSpacing: '0.18em',
            lineHeight: 1.3,
        },
        hero: {
            position: 'relative',
            width: '100%',
            maxWidth: '560px',
            minHeight: '156px',
            padding: '18px 18px 16px',
            borderRadius: '30px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background:
                isDark
                    ? 'linear-gradient(135deg, rgba(25, 34, 35, 0.68), rgba(21, 24, 28, 0.60) 54%, rgba(41, 36, 58, 0.48))'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(238,248,245,0.42))',
            border: `1px solid ${isDark ? 'rgba(190,220,235,0.13)' : 'rgba(15,23,42,0.075)'}`,
            boxShadow: isDark
                ? '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)'
                : '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)',
            backdropFilter: 'blur(26px) saturate(170%)',
            WebkitBackdropFilter: 'blur(26px) saturate(170%)',
        },
        heroGlow: {
            position: 'absolute',
            inset: 0,
            background:
                `radial-gradient(circle at 78% 24%, rgba(${rgb}, 0.12), transparent 38%), radial-gradient(circle at 30% 115%, rgba(180, 139, 200, 0.055), transparent 46%)`,
            pointerEvents: 'none',
        },
        heroCopy: {
            position: 'relative',
            zIndex: 1,
            width: 'calc(100% - min(30vw, 132px))',
            minWidth: '210px',
        },
        eyebrow: {
            marginBottom: '5px',
            color: recoveryAccent.hue,
            fontSize: fontSize === 0 ? '11px' : '12px',
            fontWeight: 900,
            letterSpacing: '0.18em',
        },
        heroTitle: {
            margin: 0,
            color: mainText,
            fontSize: fontSize === 0 ? '28px' : '31px',
            lineHeight: 1.04,
            fontWeight: 900,
            letterSpacing: 0,
        },
        heroText: {
            margin: '8px 0 13px',
            maxWidth: '340px',
            color: subText,
            fontSize: fontSize === 0 ? '15px' : '16px',
            lineHeight: 1.35,
            fontWeight: 700,
        },
        heroStats: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '6px',
            width: '100%',
            maxWidth: '258px',
            marginTop: '14px',
        },
        heroStat: {
            minHeight: '46px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            padding: '5px 4px',
            boxSizing: 'border-box',
            borderRadius: '15px',
            backgroundColor: isDark ? 'rgba(255,255,255,0.038)' : 'rgba(255,255,255,0.42)',
            border: `1px solid ${isDark ? 'rgba(190,220,235,0.105)' : 'rgba(15,23,42,0.075)'}`,
            backdropFilter: 'blur(16px) saturate(150%)',
            WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        },
        heroStatIcon: {
            display: 'flex',
            color: recoveryAccent.hue,
            fontSize: '12px',
            flexShrink: 0,
        },
        heroStatCopy: {
            alignItems: 'center',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '1px',
        },
        heroStatLabel: {
            color: subText,
            fontSize: '8px',
            fontWeight: 800,
            lineHeight: 1.05,
            textTransform: 'uppercase',
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        heroStatValue: {
            color: mainText,
            fontSize: '15px',
            fontWeight: 900,
            lineHeight: 1.05,
        },
        heroImage: {
            position: 'absolute',
            right: '-2px',
            top: '50%',
            transform: 'translateY(-42%)',
            width: 'min(30vw, 132px)',
            maxHeight: '144px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.45))',
            opacity: isDark ? 0.96 : 0.9,
            pointerEvents: 'none',
            WebkitMaskImage: 'radial-gradient(circle at 50% 52%, #000 0 58%, transparent 76%)',
            maskImage: 'radial-gradient(circle at 50% 52%, #000 0 58%, transparent 76%)',
        },
        sectionHeader: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            margin: '14px 0 10px',
        },
        sectionTitle: {
            margin: 0,
            color: mainText,
            fontSize: fontSize === 0 ? '21px' : '23px',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: 0,
        },
        summaryPill: {
            minWidth: '104px',
            minHeight: '36px',
            padding: '0 12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: recoveryAccent.hue,
            fontSize: '14px',
            fontWeight: 900,
            backgroundColor: recoveryAccent.soft,
            border: `1px solid ${recoveryAccent.ring}`,
        },
        summaryMuted: {
            color: subText,
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
        grid: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
        },
        card: {
            position: 'relative',
            width: '100%',
            minHeight: '78px',
            display: 'flex',
            alignItems: 'stretch',
            gap: '14px',
            padding: '11px 14px',
            borderRadius: '24px',
            border: `1px solid rgba(${rgb}, ${isDark ? 0.27 : 0.34})`,
            background:
                isDark
                    ? `linear-gradient(135deg, rgba(${rgb}, 0.10), rgba(26, 29, 33, 0.62) 38%, rgba(16, 18, 22, 0.56))`
                    : `linear-gradient(135deg, rgba(${rgb}, 0.12), rgba(255,255,255,0.62))`,
            boxShadow: isDark
                ? '0 1px 0 rgba(255,255,255,0.08) inset, 0 18px 38px -28px rgba(0,0,0,0.58)'
                : '0 1px 0 rgba(255,255,255,0.76) inset, 0 14px 32px -26px rgba(15,23,42,0.16)',
            backdropFilter: 'blur(22px) saturate(165%)',
            WebkitBackdropFilter: 'blur(22px) saturate(165%)',
            boxSizing: 'border-box',
            color: mainText,
            appearance: 'none',
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        cardIcon: {
            width: '46px',
            height: '46px',
            borderRadius: '17px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
            color: tone,
            fontSize: '21px',
            backgroundColor: isDark ? `rgba(${rgb}, 0.13)` : `rgba(${rgb}, 0.2)`,
            border: `1px solid rgba(${rgb}, ${isDark ? 0.3 : 0.42})`,
            boxShadow: `0 0 22px rgba(${rgb}, ${isDark ? 0.09 : 0.13})`,
        },
        cardBody: {
            minWidth: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '8px',
        },
        cardTop: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            minWidth: 0,
        },
        cardTextBlock: {
            minWidth: 0,
            flex: 1,
        },
        cardKicker: {
            color: tone,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            lineHeight: 1.15,
        },
        cardTitle: {
            margin: 0,
            color: mainText,
            fontSize: fontSize === 0 ? '19px' : '21px',
            lineHeight: 1.08,
            fontWeight: 900,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        cardSubtitle: {
            margin: '4px 0 0',
            color: subText,
            fontSize: fontSize === 0 ? '13px' : '14px',
            lineHeight: 1.25,
            fontWeight: 700,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        },
        cardProgressPill: {
            minWidth: '92px',
            minHeight: '32px',
            padding: '0 10px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            color: tone,
            fontSize: '12px',
            fontWeight: 900,
            backgroundColor: isDark ? `rgba(${rgb}, 0.1)` : `rgba(${rgb}, 0.18)`,
            border: `1px solid rgba(${rgb}, ${isDark ? 0.23 : 0.36})`,
            flexShrink: 0,
        },
        cardProgressMuted: {
            color: subText,
            fontSize: '9px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
        },
        cardBottom: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        sessionPill: {
            minHeight: '26px',
            width: '100%',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            color: tone,
            fontSize: '11px',
            fontWeight: 850,
            backgroundColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.035)',
            border: `1px solid rgba(${rgb}, ${isDark ? 0.13 : 0.2})`,
        },
        cardCta: {
            color: subText,
            fontSize: '11px',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
        },
        chevron: {
            alignSelf: 'center',
            color: subText,
            opacity: 0.5,
            fontSize: '15px',
            flexShrink: 0,
        },
        insightPanel: {
            width: '100%',
            maxWidth: '560px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            marginTop: '12px',
            padding: '12px 15px',
            boxSizing: 'border-box',
            borderRadius: '24px',
            backgroundColor: isDark ? 'rgba(26, 29, 33, 0.42)' : 'rgba(255,255,255,0.62)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : border}`,
            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.035)' : '0 10px 24px rgba(15,23,42,0.05)',
        },
        insightIcon: {
            width: '44px',
            height: '44px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: recoveryAccent.hue,
            backgroundColor: recoveryAccent.soft,
            border: `1px solid ${recoveryAccent.ring}`,
        },
        insightCopy: {
            minWidth: 0,
        },
        insightTitle: {
            color: mainText,
            fontSize: fontSize === 0 ? '15px' : '16px',
            fontWeight: 900,
            lineHeight: 1.15,
        },
        insightText: {
            marginTop: '4px',
            color: subText,
            fontSize: fontSize === 0 ? '12px' : '13px',
            lineHeight: 1.35,
            fontWeight: 700,
        },
        bottomSpace: {
            height: '2vh',
            minHeight: '24px',
        },
    };
};

export default RecoveryMain;
