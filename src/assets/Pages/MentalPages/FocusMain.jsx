import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$, setPage, premium$ } from '../../StaticClasses/HabitsBus.js';
import { FaStarHalf, FaStar, FaTrophy, FaCrosshairs, FaEye, FaBullseye, FaCrown } from 'react-icons/fa';
import { GiStarsStack, GiCrownedSkull } from 'react-icons/gi';
import { focusTrainingLevels } from './MentalHelper.js';
import MentalGamePanel from './MentalGamePanelFocus.jsx';

const FocusMain = () => {
    // states
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [show, setShow] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    useEffect(() => {
        const subscription = premium$.subscribe(setHasPremium);
        return () => subscription.unsubscribe();
    }, []);

    // subscriptions
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
        };
    }, []);

    // Safe record lookup (Type 3 is Focus)
    const getRecord = (levelIndex) => {
        return AppData.mentalRecords?.[3]?.[levelIndex] || 0;
    };

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    const pageInfo = { Icon: FaBullseye, ru: 'Концентрация', en: 'Focus' };
    const HeroIcon = pageInfo.Icon;
    const s = styles(theme, fSize);
    const totalRecord = (AppData.mentalRecords?.[3] || []).reduce((sum, value) => sum + (Number(value) || 0), 0);
    const bestRecord = Math.max(0, ...(AppData.mentalRecords?.[3] || [0]));

    return (
        <div style={s.container}>
            <div style={s.scrollView} className="no-scrollbar">
                <div style={s.pageHeader}>
                    <div style={s.pageTitle}>UltyMyLife</div>
                    <div style={s.pageSubtitle}>{langIndex === 0 ? 'Тренируй разум как тело' : 'Train your mind like your body'}</div>
                </div>

                <Motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.34 }} style={s.hero}>
                    <div style={s.heroGlow} />
                    <div style={s.heroTop}>
                        <div style={s.heroIcon}><HeroIcon size={22} /></div>
                        <div style={s.heroText}>
                            <div style={s.eyebrow}>{langIndex === 0 ? 'Фокус' : 'Focus'}</div>
                            <h1 style={s.heroTitle}>{langIndex === 0 ? pageInfo.ru : pageInfo.en}</h1>
                            <div style={s.heroSubtitle}>{langIndex === 0 ? 'Контроль и скорость реакции' : 'Control and reaction speed'}</div>
                        </div>
                    </div>
                    <div style={s.heroStats}>
                        <div style={s.statPill}>
                            <FaTrophy size={11} />
                            <span>{langIndex === 0 ? 'Итог' : 'Total'}</span>
                            <strong>{totalRecord}</strong>
                        </div>
                        <div style={s.statPill}>
                            <FaStar size={11} />
                            <span>{langIndex === 0 ? 'Лучший' : 'Best'}</span>
                            <strong>{bestRecord}</strong>
                        </div>
                    </div>
                </Motion.section>

                <Motion.div
                    variants={containerAnim}
                    initial="hidden"
                    animate="show"
                    style={s.grid}
                >
                    {focusTrainingLevels.map((protocol, ind) => {
                        const needBlur = ind > 1 && !hasPremium;
                        // Focus levels usually fit in a grid, but if you add more complex ones later, you can add logic here for isFullWidth
                        const isFullWidth = false; 

                        return (
                            <div key={ind} style={isFullWidth ? { gridColumn: '1 / -1', width: '100%' } : {}}>
                                <FocusCard
                                    variants={itemAnim}
                                    index={ind}
                                    difficulty={ind}
                                    protocol={protocol}
                                    theme={theme}
                                    lang={langIndex}
                                    fSize={fSize}
                                    needBlur={needBlur}
                                    record={getRecord(ind)}
                                    isFullWidth={isFullWidth}
                                    onClick={() => {
                                        if (!needBlur) {
                                            setCurrentLevel(ind);
                                            setShow(true);
                                        }
                                    }}
                                />
                            </div>
                        );
                    })}
                </Motion.div>
                
                <div style={{ height: '10vh', width: '100%' }} /> {/* Bottom Spacer */}
            </div>

            {show && (
                <MentalGamePanel
                    type={3}
                    difficulty={currentLevel}
                    show={show}
                    setShow={setShow}
                />
            )}
        </div>
    );
};

// --- CARD LOGIC ---

const getFocusThemeColors = (difficulty) => {
    switch (difficulty) {
        case 0: // Easy
            return {
                accent: '#4DFF88', // Green
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(77, 255, 136, 0.15) 0%, transparent 50%)',
                icon: <FaCrosshairs />,
            };
        case 1: // Medium
            return {
                accent: '#00E5FF', // Cyan
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.15) 0%, transparent 50%)',
                icon: <FaEye />,
            };
        case 2: // Hard
            return {
                accent: '#A64DFF', // Purple
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(166, 77, 255, 0.15) 0%, transparent 50%)',
                icon: <FaBullseye />,
            };
        case 3: // Expert
            return {
                accent: '#FFD700', // Gold
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)',
                icon: <GiCrownedSkull />,
            };
        default:
            return {
                accent: '#FF4D4D',
                bgGlow: 'none',
                icon: <FaStar />,
            };
    }
}

const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

function FocusCard({ protocol, difficulty, onClick, theme, lang, fSize, variants, needBlur, record, isFullWidth }) {
    
    const isDark = theme === 'dark';
    const isLocked = needBlur;
    const { accent, bgGlow, icon } = getFocusThemeColors(difficulty);

    // Card Styles
    const cardStyle = {
        position: 'relative',
        width: '100%', 
        minHeight: isFullWidth ? '92px' : '154px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: "22px", 
        overflow: 'hidden',
        cursor: isLocked ? 'default' : 'pointer',
        
        background: isDark
            ? `${bgGlow}, rgba(20,23,27,0.94)`
            : `${bgGlow}, rgba(255,255,255,0.9)`,
        boxShadow: isDark
            ? '0 1px 0 rgba(255,255,255,0.045) inset, 0 14px 34px -30px rgba(0,0,0,0.78)'
            : '0 12px 28px -24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.72) inset',
        border: isDark
            ? `1px solid ${accent}44`
            : '1px solid rgba(15,23,42,0.08)',
            
        padding: '16px',
        boxSizing: 'border-box'
    }

    const iconContainerStyle = {
        width: '36px',
        height: '36px',
        borderRadius: '12px',
        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: accent,
        fontSize: '16px',
    }

    return (
        <Motion.div 
            variants={variants}
            whileTap={!isLocked ? { scale: 0.96 } : {}}
            onClick={onClick}
            style={cardStyle}
        >
            {/* Lock Overlay */}
            {isLocked && (
                <div onClick={(e) => { e.stopPropagation(); }}
                    style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        background: isDark ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                        backdropFilter: 'blur(16px)',
                    }}>
                    <div style={{
                        width: '44px', height: '44px',
                        background: 'rgba(159,180,196,0.12)',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '8px',
                        border: '1px solid rgba(159,180,196,0.22)',
                    }}>
                        <FaCrown size={20} color="#9FB4C4" />
                    </div>
                    <button onClick={() => setPage('premium')} style={{
                        fontSize: '11px', fontWeight: '700', color: '#fff',
                        background: '#9FB4C4',
                        border: 'none', borderRadius: '11px',
                        padding: '8px 0', marginBottom: '7px', cursor: 'pointer',
                        boxShadow: '0 3px 12px rgba(159,180,196,0.35)',
                        width: '130px',
                    }}>
                        {lang === 0 ? 'Купить подписку' : 'Buy subscription'}
                    </button>
                    <button onClick={() => setPage('MainMenu')} style={{
                        fontSize: '11px', fontWeight: '500',
                        color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        background: 'transparent', border: 'none',
                        padding: '4px 10px', cursor: 'pointer',
                    }}>
                        {lang === 0 ? '← На главную' : '← Home'}
                    </button>
                </div>
            )}

            {/* Header Content */}
            <div style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={iconContainerStyle}>
                        {icon}
                    </div>

                    {/* Level Label */}
                    <div style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: accent,
                        letterSpacing: '0.5px',
                        marginTop: '4px'
                    }}>
                        {capFirst(protocol.level[lang])}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{
                        fontSize: isFullWidth ? '17px' : (fSize === 0 ? "16px" : "18px"),
                        fontWeight: "700",
                        color: Colors.get('mainText', theme),
                        lineHeight: '1.2'
                    }}>
                        {capFirst(protocol.title[lang])}
                    </div>
                    
                    <div style={{ 
                        fontSize: "12px", 
                        color: Colors.get('subText', theme), 
                        opacity: 0.8,
                        lineHeight: '1.3'
                    }}>
                        {/* Dynamic Description: Use difficulty text or fallback */}
                        {protocol.difficulty ? protocol.difficulty[lang] : (lang === 0 ? 'Быстрая реакция' : 'Quick reaction')}
                    </div>
                </div>
            </div>

            {/* Bottom Info: Record/Score */}
            {!isLocked && (
                <div style={{ zIndex: 2, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                     <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        padding: '4px 10px',
                        borderRadius: '8px'
                     }}>
                        <FaTrophy size={10} color={accent} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: Colors.get('mainText', theme), opacity: 0.9 }}>
                            {record}
                        </span>
                     </div>
                     <span style={{ fontSize: '10px', color: Colors.get('subText', theme), opacity: 0.5 }}>
                        {lang === 0 ? 'рекорд' : 'best'}
                     </span>
                </div>
            )}
        </Motion.div>
    )
}

export default FocusMain;

const styles = (theme, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const accent = '#D49A5C';
    const accentRgb = '212,154,92';
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

    return {
        container: {
            width: "100vw",
            height: "100vh",
            overflow: 'hidden',
            color: text,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: isLight
                ? `radial-gradient(900px 440px at 82% -12%, rgba(${accentRgb},0.12), transparent 58%), radial-gradient(720px 360px at -12% 100%, rgba(138,124,214,0.09), transparent 58%), #F4F5F7`
                : `radial-gradient(980px 500px at 82% -12%, rgba(${accentRgb},0.10), transparent 56%), radial-gradient(760px 380px at -10% 100%, rgba(138,124,214,0.065), transparent 56%), #0E1013`
        },
        scrollView: {
            height: "100%",
            width: '100%',
            overflowY: "auto",
            padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 0 calc(132px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box'
        },
        pageHeader: { width: 'calc(100% - 56px)', maxWidth: 660, margin: '0 auto 8px', padding: '4px 20px 8px', boxSizing: 'border-box', textAlign: 'center' },
        pageTitle: { color: text, fontFamily: 'inherit', fontSize: 24, fontWeight: 700, letterSpacing: 0, lineHeight: 1.05, opacity: 0.86 },
        pageSubtitle: { marginTop: 5, color: sub, fontSize: fSize === 0 ? 8 : 9, fontWeight: 600, letterSpacing: '0.14em', opacity: 0.82 },
        hero: {
            position: 'relative',
            width: 'calc(100% - 56px)',
            maxWidth: 660,
            margin: '0 auto',
            borderRadius: 24,
            padding: '14px 16px',
            overflow: 'hidden',
            boxSizing: 'border-box',
            background: isLight ? `linear-gradient(145deg, rgba(255,255,255,0.96), rgba(${accentRgb},0.12))` : `linear-gradient(145deg, rgba(23,27,31,0.96), rgba(${accentRgb},0.14))`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(212,154,92,0.28)'}`,
            boxShadow: isLight ? `0 16px 38px -34px rgba(${accentRgb},0.45), 0 1px 0 rgba(255,255,255,0.72) inset` : `0 18px 40px -34px rgba(${accentRgb},0.50), 0 1px 0 rgba(255,255,255,0.055) inset`,
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            isolation: 'isolate'
        },
        heroGlow: { position: 'absolute', right: -44, top: -58, width: 170, height: 170, borderRadius: '50%', background: `radial-gradient(circle, rgba(${accentRgb},0.24) 0%, transparent 62%)`, pointerEvents: 'none' },
        heroTop: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 12 },
        heroIcon: { width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${accentRgb},0.13)`, border: `1px solid rgba(${accentRgb},0.28)`, color: accent, boxShadow: `0 12px 26px -20px rgba(${accentRgb},0.85), inset 0 1px 0 rgba(255,255,255,0.08)`, fontSize: 21, flexShrink: 0 },
        heroText: { minWidth: 0 },
        eyebrow: { color: sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' },
        heroTitle: { margin: '4px 0 0', color: text, fontSize: fSize === 0 ? 22 : 24, lineHeight: 1.08, fontWeight: 950, letterSpacing: 0 },
        heroSubtitle: { marginTop: 5, color: sub, fontSize: fSize === 0 ? 11 : 12, lineHeight: 1.3, fontWeight: 720 },
        heroStats: { position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 12 },
        statPill: { minHeight: 34, borderRadius: 14, border: `1px solid ${border}`, background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.036)', display: 'flex', alignItems: 'center', gap: 7, padding: '7px 9px', boxSizing: 'border-box', color: accent, fontSize: 10, fontWeight: 850 },
        grid: { width: 'calc(100% - 56px)', maxWidth: 660, margin: '14px auto 0', display: "grid", gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px', paddingBottom: '30px', boxSizing: 'border-box' }
    };
};
