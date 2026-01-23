import React, { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { addPanel$, theme$, lang$, fontSize$, setAddPanel } from '../../StaticClasses/HabitsBus.js';
import { getInsight } from './InsightHelper.js';
import { MdClose, MdAutoAwesome } from 'react-icons/md';
import { FaRobot } from 'react-icons/fa';

const Insight = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize, setFontSize] = useState(fontSize$.value);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState, setAddPanelState] = useState(addPanel$.value);
    const [opacity, setOpacity] = useState(0);

    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsight = async () => {
            try {
                const result = await getInsight(langIndex);
                setInsight(result);
            } catch (err) {
                const fallback = langIndex === 0
                    ? 'Не удалось загрузить инсайт. Попробуйте позже.'
                    : 'Failed to load insight. Please try again.';
                setInsight(fallback);
            } finally {
                setLoading(false);
            }
        };

        
        fetchInsight();
        
    }, [langIndex, addPanelState]);


    useEffect(() => {
        const subscription = theme$.subscribe(setTheme);
        const fontSizeSubscription = fontSize$.subscribe(setFontSize);
        return () => {
            subscription.unsubscribe();
            fontSizeSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const langSubscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => {
            langSubscription.unsubscribe();
        };
    }, []);

    const isDark = theme === 'dark';

    return (
            <div style={{
                ...styles(theme).panel,
            }}>
                
                {/* --- 1. Header: AI Icon & Title --- */}
                <div style={styles(theme).header}>
                    <div style={styles(theme).iconGlowContainer}>
                        <FaRobot size={28} color="#fff" style={{ zIndex: 2 }} />
                        <MdAutoAwesome size={14} color="#00E5FF" style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 2 }} />
                        {/* Glow effect */}
                        <div style={styles(theme).iconGlow} />
                    </div>
                    
                    <div style={styles(theme).titleContainer}>
                        <span style={styles(theme).gradientTitle}>
                            {langIndex === 0 ? 'AI Анализ' : 'AI Analysis'}
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
                            <div style={styles(theme).pulseCircle} />
                            <span style={{ opacity: 0.7, fontSize: '14px' }}>
                                {langIndex === 0 ? 'Анализирую данные...' : 'Analyzing data...'}
                            </span>
                        </div>
                    ) : (
                        <div style={styles(theme).textWrapper}>
                            {insight.split('\n').map((line, i) => (
                                <p key={i} style={{ margin: '0 0 12px 0', lineHeight: '1.6' }}>{line}</p>
                            ))}
                        </div>
                    )}
                </div>

                {/* --- 3. Footer: Close Button --- */}
                
            </div>
        
    )
}
export default Insight;

const styles = (theme, fSize) => {
    const isDark = theme === 'dark';
    
    // AI Colors
    const accentColor = '#00E5FF'; // Cyan
    const secondaryAccent = '#BF5AF2'; // Purple

    return {
        panel: {
            display: 'flex',
            flexDirection: 'column',
            width: "95vw",
            maxWidth: "400px",
            height: "76vh",
            marginTop:'20px',
            borderRadius: "32px",
            // Glassmorphism background
            backgroundColor: isDark ? 'rgba(30, 30, 35, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            boxShadow: `0 20px 50px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.2)'}, 0 0 30px rgba(0, 229, 255, 0.1)`,
            overflowY: 'scroll'
        },
        
        // --- Header Styles ---
        header: {
            padding: '30px 24px 20px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderBottom: `1px solid ${Colors.get('border', theme)}50`,
            background: isDark 
                ? 'linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(0,0,0,0) 100%)' 
                : 'linear-gradient(180deg, rgba(0, 229, 255, 0.05) 0%, rgba(255,255,255,0) 100%)',
        },
        iconGlowContainer: {
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            backgroundColor: '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
        },
        iconGlow: {
            position: 'absolute',
            inset: 0,
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${accentColor}, ${secondaryAccent})`,
            opacity: 0.8,
            filter: 'blur(15px)',
            zIndex: 0,
        },
        titleContainer: {
            textAlign: 'center',
        },
        gradientTitle: {
            fontSize: '22px',
            fontWeight: '800',
            fontFamily: 'Segoe UI, sans-serif',
            background: `linear-gradient(90deg, ${accentColor} 0%, ${secondaryAccent} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'block',
            marginBottom: '4px'
        },
        subtitle: {
            fontSize: '13px',
            color: Colors.get('subText', theme),
            fontWeight: '500',
            letterSpacing: '0.5px'
        },

        // --- Body Styles ---
        contentBody: {
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            fontSize: fSize === 0 ? '15px' : '17px',
            color: Colors.get('mainText', theme),
            textAlign: 'left',
            position: 'relative',
        },
        textWrapper: {
            animation: 'fadeIn 0.5s ease-out',
        },
        loadingContainer: {
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            color: Colors.get('subText', theme)
        },
        pulseCircle: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: `3px solid ${accentColor}`,
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite'
        },

        // --- Footer Styles ---
        footer: {
            padding: '20px',
            borderTop: `1px solid ${Colors.get('border', theme)}50`,
            display: 'flex',
            justifyContent: 'center',
            backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'
        },
        closeButton: {
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#f0f0f0',
            color: Colors.get('mainText', theme),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            transition: 'background-color 0.2s',
        }
    };
};



