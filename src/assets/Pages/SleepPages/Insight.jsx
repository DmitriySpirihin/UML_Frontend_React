import React, { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { getInsight, INSIGHT_TYPES } from './InsightHelper.js';
import { 
    MdAutoAwesome, MdFitnessCenter, MdBed, MdCheckCircle, 
    MdPsychology, MdSchedule, MdExpandMore, MdFastfood 
} from 'react-icons/md';
import { FaRobot, FaRunning ,FaBicycle} from 'react-icons/fa';

const Insight = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize, setFontSize] = useState(fontSize$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    
    // Logic state
    const [activeType, setActiveType] = useState(INSIGHT_TYPES.GENERAL);
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);
    const [showOptions, setShowOptions] = useState(false);

    // Initialize Cache Object if not exists
    if (!AppData.insightCache) AppData.insightCache = {};

    // --- FETCH LOGIC ---
    const loadContent = async (type) => {
        setLoading(true);
        setActiveType(type);

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // 1. ✅ CHECK CACHE (Date-Specific)
        const cached = AppData.insightCache[type];
        
        if (cached && cached.date === today && cached.text) {
            setInsight(cached.text);
            setLoading(false);
            return;
        }

        // 2. 🌍 FETCH (Only if date is different or no cache exists)
        try {
            const result = await getInsight(langIndex, type);
            
            // ✅ Update AppData directly
            AppData.insightCache[type] = {
                text: result,
                date: today
            }; 
            
            setInsight(result);
        } catch (err) {
            const fallback = langIndex === 0
                ? 'Не удалось загрузить данные. Попробуйте позже.'
                : 'Failed to load insights. Please try again.';
            setInsight(fallback);
        } finally {
            setLoading(false);
        }
    };

    // Initial Load (General)
    useEffect(() => {
        loadContent(INSIGHT_TYPES.GENERAL);
    }, [langIndex]);

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = fontSize$.subscribe(setFontSize);
        const sub3 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); };
    }, []);

    const isDark = theme === 'dark';

    // Updated Button Config to match InsightHelper keys
    const buttons = [
        { type: INSIGHT_TYPES.GENERAL, label: langIndex === 0 ? 'Общее' : 'General', icon: <MdAutoAwesome /> },
        { type: INSIGHT_TYPES.PROGRESS_ANALYSE, label: langIndex === 0 ? 'Прогресс' : 'Progress', icon: <MdFitnessCenter /> },
        { type: INSIGHT_TYPES.RECOVERY_RATE, label: langIndex === 0 ? 'Восстановление' : 'Recovery', icon: <MdBed /> },
        { type: INSIGHT_TYPES.HABITS, label: langIndex === 0 ? 'Привычки' : 'Habits', icon: <MdCheckCircle /> },
        { type: INSIGHT_TYPES.FOCUS_MINDSET, label: langIndex === 0 ? 'Ментальное' : 'Focus', icon: <MdPsychology /> },
        { type: INSIGHT_TYPES.TIME_MANAGEMENT, label: langIndex === 0 ? 'График' : 'Schedule', icon: <MdSchedule /> },
        { type: INSIGHT_TYPES.RUNNING, label: langIndex === 0 ? 'Бег' : 'Running', icon: <FaRunning /> },
        { type: INSIGHT_TYPES.CYCLING, label: langIndex === 0 ? 'Вело' : 'Cycling', icon: <FaBicycle /> },
        { type: INSIGHT_TYPES.FOOD, label: langIndex === 0 ? 'Питание' : 'Food', icon: <MdFastfood /> },
    ];

    // Medical disclaimer text with language support
    const disclaimerText = langIndex === 0 
        ? '⚠️ Внимание: Данный анализ предоставляется исключительно в информационных целях и не является медицинской рекомендацией. Перед внесением изменений в режим тренировок, питания или сна проконсультируйтесь с квалифицированным медицинским специалистом.'
        : '⚠️ Disclaimer: This analysis is for informational purposes only and does not constitute medical advice. Please consult with a qualified healthcare professional before making any changes to your exercise, nutrition, or sleep regimen.';

    return (
        <div style={styles(theme).panel}>
            
            {/* --- 1. Header --- */}
            <div style={styles(theme).header}>
                <img src={'images/Couch.png'} style={styles(theme).mascot} alt="Couch" />
                
                <div style={styles(theme).titleContainer}>
                    <span style={styles(theme).gradientTitle}>
                        {langIndex === 0 ? 'Анализ от UltyMyBro' : 'UltyMyBro Analysis'}
                    </span>
                    <span style={styles(theme).subtitle}>
                        {langIndex === 0 ? 'Персональный инсайт' : 'Personal Insight'}
                    </span>
                </div>
                
            </div>

            {/* --- 2. Content Body --- */}
            <div style={styles(theme, fSize).contentBody}>
                {loading ? (
                    <div style={styles(theme).loadingContainer}>
                        {/* MODERN GRADIENT SPINNER */}
                        <div style={styles(theme).modernSpinnerContainer}>
                            <div style={styles(theme).modernSpinner} >
                             <img src={'images/Thinking.png'} style={styles(theme).loadingIcon} alt="Couch" />
                             </div>
                        </div>
                        <span style={{ opacity: 0.7, fontSize: '14px', marginTop: '12px' }}>
                            {langIndex === 0 ? 'Анализирую данные...' : 'Analyzing data...'}
                        </span>
                    </div>
                ) : (
                    <div style={styles(theme).textWrapper}>
                        {insight.split('\n').map((line, i) => (
                            <p key={i} style={{ margin: '0 0 12px 0', lineHeight: '1.6' }}>{line}</p>
                        ))}

                        {/* --- 3. Expandable Options --- */}
                        <div style={styles(theme).optionsDivider}>
                            {!showOptions ? (
                                <button 
                                    onClick={() => setShowOptions(true)}
                                    style={styles(theme).showMoreBtn}
                                >
                                    <MdExpandMore size={20} style={{ marginRight: '8px' }} />
                                    {langIndex === 0 ? 'Больше параметров' : 'More Options'}
                                </button>
                            ) : (
                                <div style={styles(theme).expandedContainer}>
                                    <div style={styles(theme).buttonRow}>
                                        {buttons.map((btn) => {
                                            const isActive = activeType === btn.type;
                                            return (
                                                <button 
                                                    key={btn.type} 
                                                    onClick={() => loadContent(btn.type)}
                                                    style={styles(theme, isActive).filterBtn}
                                                >
                                                    <span style={{ marginRight: '6px', fontSize: '14px', display:'flex' }}>{btn.icon}</span>
                                                    {btn.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button 
                                        onClick={() => setShowOptions(false)}
                                        style={styles(theme).hideBtn}
                                    >
                                        {langIndex === 0 ? 'Скрыть' : 'Hide'}
                                    </button>
                                </div>
                            )}
                            {/* MEDICAL DISCLAIMER */}
                        <div style={styles(theme).disclaimerContainer}>
                            
                            <span style={styles(theme).disclaimerText}>
                                {disclaimerText}
                            </span>
                        </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ENHANCED CSS INJECTIONS - Modern Spinner + Animations */}
            <style>{`
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 
                    100% { transform: rotate(360deg); } 
                }
                @keyframes pulseGlow { 
                    0%, 100% { opacity: 0.7; box-shadow: 0 0 15px #00E5FF80, 0 0 25px #BF5AF280; }
                    50% { opacity: 1; box-shadow: 0 0 25px #00E5FFCC, 0 0 35px #BF5AF2CC; }
                }
                @keyframes fadeIn { 
                    from { opacity: 0; transform: translateY(10px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                .contentBody::-webkit-scrollbar { 
                    width: 0px; 
                    background: transparent; 
                }
                /* Modern gradient spinner animation */
                @keyframes gradientRotate {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `}</style>
        </div>
    );
}

export default Insight;

// --- ENHANCED STYLES WITH MODERN SPINNER & DISCLAIMER ---
const styles = (theme, activeOrSize) => {
    const isDark = theme === 'dark';
    const accentColor = '#00E5FF'; 
    const secondaryAccent = '#BF5AF2';
    const isActive = typeof activeOrSize === 'boolean' ? activeOrSize : false; 
    const fSize = typeof activeOrSize === 'number' ? activeOrSize : 0;

    return {
        panel: {
            display: 'flex', flexDirection: 'column',
            width: "95vw", maxWidth: "400px", height: "76vh",
            marginTop:'20px', borderRadius: "32px",
            backgroundColor: isDark ? 'rgba(30, 30, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: `0 20px 50px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)'}, 0 0 30px rgba(0, 229, 255, 0.1)`,
            overflow: 'hidden'
        },
        header: {
             display: 'flex', flexDirection: 'column', alignItems: 'center',
            position: 'relative', flexShrink: 0,  borderBottom:`1px solid  rgba(94, 94, 94, 0.35)`,padding:'22px'
        },
        iconGlowContainer: {
            width: '52px', height: '52px', borderRadius: '18px', backgroundColor: '#1a1a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
            marginBottom: '12px', boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        },
        iconGlow: {
            position: 'absolute', inset: 0, borderRadius: '18px',
            background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})`,
            opacity: 0.8, filter: 'blur(15px)', zIndex: 0,
        },
        titleContainer: { 
            marginTop:'15%',
            textAlign: 'center',
            zIndex:2
        },
        gradientTitle: {
            fontSize: '25px', fontWeight: '800', fontFamily: 'Segoe UI, sans-serif',
            background: `linear-gradient(90deg, ${accentColor} 0%, ${secondaryAccent} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            display: 'block'
        },
        subtitle: { 
            fontSize: '12px', 
            color: Colors.get('subText', theme), 
            fontWeight: '500', 
            opacity: 0.8 
        },
        mascot: {
            position: 'absolute', top: '1%', left: '35%', width: '100px',
            zIndex: 1, filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.4))',
            pointerEvents: 'none' 
        },
        loadingIcon: {
            position: 'absolute', width: '150px',borderRadius:'50%',marginTop:'10%',
            zIndex: 1, filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.4))',
            pointerEvents: 'none' 
        },
        contentBody: {
            flex: 1, overflowY: 'auto', padding: '10px 24px 30px 24px',
            fontSize: fSize === 0 ? '15px' : '17px',
            color: Colors.get('mainText', theme),
            textAlign: 'left', position: 'relative',
            scrollbarWidth: 'none'
        },
        textWrapper: { 
            animation: 'fadeIn 0.5s ease-out',
            marginTop:'20px'
        },
        
        // --- MODERN SPINNER STYLES ---
        loadingContainer: {
            height: '100%', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            color: Colors.get('subText', theme)
        },
        modernSpinnerContainer: {
            position: 'relative', width: '150px', height: '150px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        modernSpinner: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${accentColor}40, ${secondaryAccent}80, ${accentColor}40)`,
            backgroundSize: '250% 250%',
            animation: 'gradientRotate 3s ease infinite, pulseGlow 2s ease-in-out infinite',
            opacity: 0.9,
            boxShadow: `0 0 20px ${accentColor}60, 0 0 30px ${secondaryAccent}60`,
            '::before': {
                content: '""',
                position: 'absolute',
                top: '8px',
                left: '8px',
                right: '8px',
                bottom: '8px',
                borderRadius: '50%',
                backgroundColor: isDark ? 'rgba(30,30,35,0.95)' : 'rgba(255,255,255,0.95)',
            }
        },
        
        // --- MEDICAL DISCLAIMER STYLES ---
        disclaimerContainer: {
            marginTop: '28px',
            paddingTop: '18px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '16px',
            backgroundColor: isDark ? 'rgba(35, 35, 45, 0.7)' : 'rgba(245, 247, 250, 0.85)',
            backdropFilter: 'blur(4px)'
        },
        disclaimerIcon: {
            marginTop: '2px',
            color: '#FFAA00',
            flexShrink: 0
        },
        disclaimerText: {
            fontSize: '12px',
            lineHeight: '1.5',
            color: isDark ? 'rgba(255, 255, 255, 0.85)' : 'rgba(0, 0, 0, 0.75)',
            fontStyle: 'italic',
            fontWeight: '500'
        },
        
        // --- OPTIONS STYLES (UNCHANGED) ---
        optionsDivider: {
            marginTop: '30px', paddingBottom: '20px',
            borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`,
            paddingTop: '20px', textAlign: 'center'
        },
        showMoreBtn: {
            display: 'inline-flex', alignItems: 'center', padding: '10px 20px',
            borderRadius: '12px', border: 'none', cursor: 'pointer',
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            color: accentColor, fontSize: '14px', fontWeight: '600',
            transition: 'transform 0.2s ease',
            ':hover': { transform: 'translateY(-1px)' }
        },
        expandedContainer: { animation: 'fadeIn 0.3s ease-in' },
        buttonRow: {
            display: 'flex', flexWrap: 'wrap', gap: '8px',
            justifyContent: 'center', marginBottom: '16px'
        },
        filterBtn: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 14px', borderRadius: '16px', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600', transition: 'all 0.2s ease',
            backgroundColor: isActive 
                ? (isDark ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 0.1)') 
                : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
            color: isActive ? accentColor : Colors.get('subText', theme),
            boxShadow: isActive ? `0 0 15px ${accentColor}30` : 'none',
            border: `1px solid ${isActive ? accentColor : 'transparent'}`
        },
        hideBtn: {
            background: 'none', border: 'none', color: Colors.get('subText', theme),
            fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', opacity: 0.6,
            ':hover': { opacity: 1 }
        }
    };
};
