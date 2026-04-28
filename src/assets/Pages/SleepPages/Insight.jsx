import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { getInsight, INSIGHT_TYPES } from './InsightHelper.js';
import {
    MdAutoAwesome, MdFitnessCenter, MdBed, MdCheckCircle,
    MdPsychology, MdSchedule, MdFastfood, MdExpandLess,
    MdOutlineHealthAndSafety
} from 'react-icons/md';
import { FaRunning, FaBicycle } from 'react-icons/fa';

const CACHE_VERSION = 5;

const SECTION_DEFINITIONS = [
    { emoji: '📊', keys: ['анализ', 'analysis'], fallback: ['Анализ', 'Analysis'] },
    { emoji: '💡', keys: ['вывод', 'insight', 'core'], fallback: ['Вывод', 'Insight'] },
    { emoji: '📈', keys: ['тренд', 'trend', 'корреляция', 'correlation'], fallback: ['Тренд', 'Trend'] },
    { emoji: '💪', keys: ['победа', 'сильная', 'strength', 'highlight', 'result'], fallback: ['Сильная сторона', 'Strength'] },
    { emoji: '⚠️', keys: ['узкое', 'риск', 'ограничение', 'bottleneck', 'risk', 'limitation'], fallback: ['Ограничение', 'Limitation'] },
    { emoji: '🎯', keys: ['план', 'plan'], fallback: ['План', 'Plan'] },
    { emoji: '✅', keys: ['действие', 'action', 'recommendation'], fallback: ['Действие', 'Action'] },
    { emoji: '😴', keys: ['сон', 'sleep', 'recovery'], fallback: ['Сон и восстановление', 'Sleep & Recovery'] },
    { emoji: '⚡', keys: ['энергия', 'energy'], fallback: ['Энергия', 'Energy'] },
];

function cleanLine(line) {
    return line
        .replace(/^\s*(?:[-•*]|\d+[.)])\s*/, '')
        .replace(/\*\*/g, '')
        .trim();
}

function getSectionDefinition(text) {
    const lower = text.toLowerCase();
    return SECTION_DEFINITIONS.find((section) => (
        text.startsWith(section.emoji) || section.keys.some((key) => lower.includes(key))
    ));
}

function splitBodyParts(lines) {
    return lines
        .flatMap((line) => `${line}`.split(/(?=\s(?:\d+[.)]|[-•])\s+)/g))
        .map(cleanLine)
        .filter(Boolean);
}

function parseInsightText(text, langIndex) {
    const normalized = `${text || ''}`
        .replace(/\r/g, '')
        .replace(/\s+(?=(?:📊|💡|📈|💪|⚠️|🎯|✅|😴|⚡))/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (!normalized) return [];

    const lines = normalized.split('\n').map(cleanLine).filter(Boolean);
    const sections = [];
    let intro = [];
    let current = null;

    lines.forEach((line) => {
        const def = getSectionDefinition(line);
        const isHeaderLine = Boolean(def && (line.startsWith(def.emoji) || /[:：]/.test(line)));

        if (isHeaderLine) {
            if (current) sections.push(current);
            const withoutNumber = line.replace(/^\d+[.)]\s*/, '').trim();
            const withoutEmoji = withoutNumber.replace(def.emoji, '').trim();
            const [rawTitle, ...bodyParts] = withoutEmoji.split(/[:：]/);
            const title = cleanLine(rawTitle) || def.fallback[langIndex];
            const body = bodyParts.join(':').trim();
            current = {
                emoji: def.emoji,
                title,
                lines: body ? [body] : []
            };
            return;
        }

        if (current) current.lines.push(line);
        else intro.push(line);
    });

    if (current) sections.push(current);

    const hasIntro = intro.length > 0;
    const parsedSections = sections.map((section) => ({
        ...section,
        lines: splitBodyParts(section.lines)
    }));

    if (hasIntro) {
        parsedSections.unshift({
            emoji: '✦',
            title: langIndex === 0 ? 'Коротко' : 'Summary',
            lines: splitBodyParts(intro)
        });
    }

    if (parsedSections.length > 0) return parsedSections;

    return [{
        emoji: '💡',
        title: langIndex === 0 ? 'Инсайт' : 'Insight',
        lines: splitBodyParts([normalized])
    }];
}

const Insight = () => {
    const [theme, setTheme] = useState(theme$.value);
    const [fSize, setFontSize] = useState(fontSize$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [activeType, setActiveType] = useState(INSIGHT_TYPES.GENERAL);
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [showAllTypes, setShowAllTypes] = useState(false);
    const requestIdRef = useRef(0);

    if (!AppData.insightCache) AppData.insightCache = {};

    const buttons = useMemo(() => ([
        { type: INSIGHT_TYPES.GENERAL, label: langIndex === 0 ? 'Общее' : 'General', icon: <MdAutoAwesome /> },
        { type: INSIGHT_TYPES.PROGRESS_ANALYSE, label: langIndex === 0 ? 'Прогресс' : 'Progress', icon: <MdFitnessCenter /> },
        { type: INSIGHT_TYPES.RECOVERY_RATE, label: langIndex === 0 ? 'Восстановление' : 'Recovery', icon: <MdBed /> },
        { type: INSIGHT_TYPES.HABITS, label: langIndex === 0 ? 'Привычки' : 'Habits', icon: <MdCheckCircle /> },
        { type: INSIGHT_TYPES.FOCUS_MINDSET, label: langIndex === 0 ? 'Ментальное' : 'Focus', icon: <MdPsychology /> },
        { type: INSIGHT_TYPES.TIME_MANAGEMENT, label: langIndex === 0 ? 'График' : 'Schedule', icon: <MdSchedule /> },
        { type: INSIGHT_TYPES.RUNNING, label: langIndex === 0 ? 'Бег' : 'Running', icon: <FaRunning /> },
        { type: INSIGHT_TYPES.CYCLING, label: langIndex === 0 ? 'Вело' : 'Cycling', icon: <FaBicycle /> },
        { type: INSIGHT_TYPES.FOOD, label: langIndex === 0 ? 'Питание' : 'Food', icon: <MdFastfood /> },
    ]), [langIndex]);

    const activeButton = buttons.find((button) => button.type === activeType) || buttons[0];
    const visibleButtons = showAllTypes ? buttons : buttons.slice(0, 5);
    const sections = useMemo(() => parseInsightText(insight, langIndex), [insight, langIndex]);

    const loadContent = useCallback(async (type) => {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setLoading(true);
        setActiveType(type);

        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `${type}_${langIndex}`;
        const cached = AppData.insightCache[cacheKey];

        if (cached && cached.date === today && cached.text && cached.version === CACHE_VERSION) {
            if (requestId !== requestIdRef.current) return;
            setInsight(cached.text);
            setLoading(false);
            return;
        }

        try {
            const result = await getInsight(langIndex, type);
            if (requestId !== requestIdRef.current) return;
            AppData.insightCache[cacheKey] = {
                text: result,
                date: today,
                version: CACHE_VERSION
            };
            setInsight(result);
        } catch {
            if (requestId !== requestIdRef.current) return;
            setInsight(langIndex === 0
                ? '💡 Вывод: Не удалось загрузить анализ. Проверьте соединение и попробуйте еще раз.\n✅ Действие: Откройте этот экран позже, когда сеть будет стабильной.'
                : '💡 Insight: Failed to load the analysis. Check your connection and try again.\n✅ Action: Open this screen later when the network is stable.'
            );
        } finally {
            if (requestId === requestIdRef.current) setLoading(false);
        }
    }, [langIndex]);

    useEffect(() => {
        loadContent(INSIGHT_TYPES.GENERAL);
    }, [loadContent]);

    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = fontSize$.subscribe(setFontSize);
        const sub3 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); };
    }, []);

    const disclaimerText = langIndex === 0
        ? 'Информация не заменяет медицинскую консультацию. При изменении тренировок, питания или сна ориентируйтесь на свое состояние и рекомендации специалиста.'
        : 'This does not replace medical advice. Adjust training, nutrition, or sleep with your condition and professional guidance in mind.';

    return (
        <section style={styles(theme).panel}>
            <div style={styles(theme).header}>
                <div style={styles(theme).botFrame}>
                    <img src="images/Couch.png" style={styles(theme).mascot} alt="UltyMyBro" />
                </div>

                <div style={styles(theme).headerCopy}>
                    <div style={styles(theme).eyebrow}>
                        {langIndex === 0 ? 'AI Ассистент' : 'AI Assistant'}
                    </div>
                    <h1 style={styles(theme, fSize).title}>
                        {langIndex === 0 ? 'Анализ от UltyMyBro' : 'UltyMyBro Analysis'}
                    </h1>
                    <div style={styles(theme).activeReport}>
                        <span style={styles(theme).activeReportIcon}>{activeButton.icon}</span>
                        {activeButton.label}
                    </div>
                </div>
            </div>

            <div style={styles(theme).typeRail}>
                {visibleButtons.map((button) => {
                    const isActive = activeType === button.type;
                    return (
                        <button
                            type="button"
                            key={button.type}
                            onClick={() => loadContent(button.type)}
                            style={styles(theme, isActive).typeChip}
                        >
                            <span style={styles(theme).chipIcon}>{button.icon}</span>
                            <span>{button.label}</span>
                        </button>
                    );
                })}
                <button
                    type="button"
                    onClick={() => setShowAllTypes((value) => !value)}
                    style={styles(theme).moreChip}
                    aria-label={showAllTypes ? 'Hide insight types' : 'Show all insight types'}
                >
                    <MdExpandLess style={{ transform: showAllTypes ? 'rotate(0deg)' : 'rotate(180deg)' }} />
                </button>
            </div>

            <div className="insightScroll" style={styles(theme, fSize).contentBody}>
                {loading ? (
                    <LoadingState theme={theme} langIndex={langIndex} />
                ) : (
                    <div style={styles(theme).sectionStack}>
                        {sections.map((section, index) => (
                            <InsightSection
                                key={`${section.title}-${index}`}
                                section={section}
                                theme={theme}
                                fSize={fSize}
                                isPlan={section.emoji === '🎯'}
                            />
                        ))}

                        <div style={styles(theme).disclaimerContainer}>
                            <MdOutlineHealthAndSafety size={17} style={styles(theme).disclaimerIcon} />
                            <span style={styles(theme).disclaimerText}>{disclaimerText}</span>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes insightFade {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes insightPulse {
                    0%, 100% { opacity: .55; }
                    50% { opacity: 1; }
                }
                .insightScroll::-webkit-scrollbar { width: 0; }
            `}</style>
        </section>
    );
};

function LoadingState({ theme, langIndex }) {
    return (
        <div style={styles(theme).loadingContainer}>
            <div style={styles(theme).loadingMascotWrap}>
                <img src="images/Thinking.png" style={styles(theme).loadingIcon} alt="Thinking" />
            </div>
            <div style={styles(theme).loadingText}>
                {langIndex === 0 ? 'Собираю данные и связи...' : 'Reading your data patterns...'}
            </div>
            {[0, 1, 2].map((item) => (
                <div key={item} style={{ ...styles(theme).skeletonCard, animationDelay: `${item * 0.12}s` }}>
                    <div style={styles(theme).skeletonTitle} />
                    <div style={styles(theme).skeletonLine} />
                    <div style={{ ...styles(theme).skeletonLine, width: '68%' }} />
                </div>
            ))}
        </div>
    );
}

function InsightSection({ section, theme, fSize, isPlan }) {
    const parts = section.lines.length > 0 ? section.lines : ['...'];

    return (
        <article style={styles(theme).insightCard}>
            <div style={styles(theme).sectionHeader}>
                <div style={styles(theme).sectionIcon}>{section.emoji}</div>
                <h2 style={styles(theme, fSize).sectionTitle}>{section.title}</h2>
            </div>
            <div style={styles(theme).sectionBody}>
                {parts.map((part, index) => (
                    <div key={`${part}-${index}`} style={isPlan ? styles(theme).planRow : styles(theme).bodyRow}>
                        {isPlan && <span style={styles(theme).stepNumber}>{index + 1}</span>}
                        <p style={styles(theme, fSize).sectionText}>{part}</p>
                    </div>
                ))}
            </div>
        </article>
    );
}

export default Insight;

const palette = {
    dark: {
        bg: '#0E1013',
        panel: 'rgba(20,23,25,0.94)',
        panelSoft: 'rgba(255,255,255,0.035)',
        panelStrong: 'rgba(26,29,33,0.92)',
        border: 'rgba(255,255,255,0.075)',
        text: '#F2F3F5',
        sub: '#A6ADB8',
        muted: '#6B7280',
        accent: '#66D9E8',
        accentSoft: 'rgba(102,217,232,0.14)',
        accentRing: 'rgba(102,217,232,0.28)',
        gold: '#C9A24B'
    },
    light: {
        bg: '#F4F5F7',
        panel: 'rgba(255,255,255,0.96)',
        panelSoft: 'rgba(15,23,42,0.035)',
        panelStrong: 'rgba(255,255,255,0.98)',
        border: 'rgba(15,23,42,0.09)',
        text: '#111827',
        sub: '#596273',
        muted: '#8A94A6',
        accent: '#247A8A',
        accentSoft: 'rgba(36,122,138,0.11)',
        accentRing: 'rgba(36,122,138,0.22)',
        gold: '#A57926'
    }
};

const styles = (theme, activeOrSize) => {
    const p = palette[theme === 'dark' ? 'dark' : 'light'];
    const isActive = typeof activeOrSize === 'boolean' ? activeOrSize : false;
    const fSize = typeof activeOrSize === 'number' ? activeOrSize : 0;

    return {
        panel: {
            display: 'flex',
            flexDirection: 'column',
            width: 'min(430px, calc(100vw - 24px))',
            height: 'calc(100dvh - 112px)',
            minHeight: '560px',
            maxHeight: 780,
            borderRadius: 26,
            background: p.panel,
            border: `1px solid ${p.border}`,
            boxShadow: theme === 'dark'
                ? '0 22px 60px rgba(0,0,0,0.46)'
                : '0 22px 50px rgba(15,23,42,0.13)',
            overflow: 'hidden',
            color: p.text,
            fontFamily: '"Inter", "Segoe UI", sans-serif'
        },
        header: {
            display: 'grid',
            gridTemplateColumns: '84px minmax(0, 1fr)',
            gap: 14,
            alignItems: 'center',
            padding: '16px 16px 12px',
            borderBottom: `1px solid ${p.border}`,
            background: theme === 'dark'
                ? 'linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))'
                : 'linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.55))'
        },
        botFrame: {
            width: 84,
            height: 84,
            borderRadius: 22,
            background: p.accentSoft,
            border: `1px solid ${p.accentRing}`,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            overflow: 'hidden',
            boxShadow: `0 0 24px ${p.accentSoft}`
        },
        mascot: {
            width: 82,
            height: 82,
            objectFit: 'contain',
            filter: theme === 'dark' ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.38))' : 'none'
        },
        headerCopy: {
            minWidth: 0,
            textAlign: 'left'
        },
        eyebrow: {
            marginBottom: 5,
            color: p.accent,
            fontSize: 11,
            fontWeight: 850,
            textTransform: 'uppercase',
            letterSpacing: 0
        },
        title: {
            margin: 0,
            color: p.text,
            fontSize: fSize === 0 ? 22 : 25,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: 0
        },
        activeReport: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            marginTop: 10,
            padding: '6px 10px',
            borderRadius: 999,
            background: p.panelSoft,
            border: `1px solid ${p.border}`,
            color: p.sub,
            fontSize: 12,
            fontWeight: 750,
            maxWidth: '100%'
        },
        activeReportIcon: {
            color: p.accent,
            display: 'flex',
            flexShrink: 0
        },
        typeRail: {
            display: 'flex',
            gap: 8,
            padding: '12px 14px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            borderBottom: `1px solid ${p.border}`,
            WebkitOverflowScrolling: 'touch'
        },
        typeChip: {
            minHeight: 36,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
            padding: '8px 12px',
            borderRadius: 999,
            border: `1px solid ${isActive ? p.accentRing : p.border}`,
            background: isActive ? p.accentSoft : p.panelSoft,
            color: isActive ? p.text : p.sub,
            fontSize: 12,
            fontWeight: 800,
            whiteSpace: 'nowrap',
            cursor: 'pointer',
            fontFamily: 'inherit'
        },
        chipIcon: {
            display: 'flex',
            color: isActive ? p.accent : p.muted
        },
        moreChip: {
            width: 36,
            height: 36,
            borderRadius: 999,
            border: `1px solid ${p.border}`,
            background: p.panelSoft,
            color: p.sub,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0
        },
        contentBody: {
            flex: 1,
            overflowY: 'auto',
            padding: '14px 14px 20px',
            scrollbarWidth: 'none',
            fontSize: fSize === 0 ? 14 : 16
        },
        sectionStack: {
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            animation: 'insightFade 0.32s ease-out'
        },
        insightCard: {
            borderRadius: 18,
            background: p.panelStrong,
            border: `1px solid ${p.border}`,
            padding: '13px 14px',
            textAlign: 'left'
        },
        sectionHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8
        },
        sectionIcon: {
            width: 32,
            height: 32,
            borderRadius: 12,
            background: p.accentSoft,
            border: `1px solid ${p.accentRing}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: 17
        },
        sectionTitle: {
            margin: 0,
            color: p.text,
            fontSize: fSize === 0 ? 15 : 17,
            fontWeight: 900,
            lineHeight: 1.2,
            letterSpacing: 0
        },
        sectionBody: {
            display: 'flex',
            flexDirection: 'column',
            gap: 7
        },
        bodyRow: {
            display: 'flex',
            minWidth: 0
        },
        planRow: {
            display: 'grid',
            gridTemplateColumns: '24px minmax(0, 1fr)',
            gap: 9,
            alignItems: 'start'
        },
        stepNumber: {
            width: 24,
            height: 24,
            borderRadius: 9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: p.panelSoft,
            color: p.accent,
            border: `1px solid ${p.border}`,
            fontSize: 11,
            fontWeight: 900,
            flexShrink: 0
        },
        sectionText: {
            margin: 0,
            color: p.sub,
            fontSize: fSize === 0 ? 14 : 16,
            lineHeight: 1.48,
            fontWeight: 560,
            overflowWrap: 'anywhere'
        },
        disclaimerContainer: {
            display: 'grid',
            gridTemplateColumns: '18px minmax(0, 1fr)',
            gap: 9,
            padding: '12px 13px',
            borderRadius: 16,
            background: p.panelSoft,
            border: `1px solid ${p.border}`,
            textAlign: 'left'
        },
        disclaimerIcon: {
            color: p.gold,
            marginTop: 1
        },
        disclaimerText: {
            color: p.muted,
            fontSize: 11,
            lineHeight: 1.45,
            fontWeight: 650
        },
        loadingContainer: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 10
        },
        loadingMascotWrap: {
            width: 118,
            height: 118,
            borderRadius: 30,
            margin: '0 auto 4px',
            background: p.accentSoft,
            border: `1px solid ${p.accentRing}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        loadingIcon: {
            width: 104,
            height: 104,
            objectFit: 'contain'
        },
        loadingText: {
            color: p.sub,
            fontSize: 13,
            fontWeight: 800,
            marginBottom: 6
        },
        skeletonCard: {
            borderRadius: 18,
            padding: 14,
            border: `1px solid ${p.border}`,
            background: p.panelStrong,
            animation: 'insightPulse 1.35s ease-in-out infinite'
        },
        skeletonTitle: {
            width: '42%',
            height: 12,
            borderRadius: 99,
            background: p.panelSoft,
            marginBottom: 12
        },
        skeletonLine: {
            width: '88%',
            height: 9,
            borderRadius: 99,
            background: p.panelSoft,
            marginTop: 8
        }
    };
};
