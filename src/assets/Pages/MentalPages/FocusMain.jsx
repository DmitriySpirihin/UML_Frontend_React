import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$, setPage, premium$ } from '../../StaticClasses/HabitsBus.js';
import { FaStarHalf, FaStar, FaLock, FaTrophy, FaCrosshairs, FaEye, FaBullseye } from 'react-icons/fa';
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

    const pageInfo = { emoji: '🎯', ru: 'Внимание', en: 'Focus' };

    return (
        <div style={styles(theme).container}>
            <div style={styles(theme).scrollView}>
                <div style={{ height: '3vh' }} /> 
                
                {/* Header Section */}
                <div style={{ width: '92%', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '5px' ,marginTop:'20px'}}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{pageInfo.emoji}</span>
                        <h1 style={{ margin: 0, color: Colors.get('mainText', theme), fontSize: '26px', fontFamily: 'Segoe UI', fontWeight: '800' }}>
                            {langIndex === 0 ? pageInfo.ru : pageInfo.en}
                        </h1>
                    </div>
                    <span style={{ fontSize: '14px', color: Colors.get('subText', theme), opacity: 0.7, marginLeft: '4px' }}>
                        {langIndex === 0 ? 'Концентрация и реакция' : 'Concentration and reaction'}
                    </span>
                </div>

                <motion.div
                    variants={containerAnim}
                    initial="hidden"
                    animate="show"
                    style={{
                        width: '94%',
                        display: "grid",
                        gridTemplateColumns: '1fr 1fr',
                        gap: '12px',
                        paddingBottom: '30px'
                    }}
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
                                    hasPremium={hasPremium}
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
                </motion.div>
                
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

function FocusCard({ protocol, difficulty, onClick, theme, lang, fSize, variants, needBlur, hasPremium, record, isFullWidth }) {
    
    const isDark = theme === 'dark';
    const isLocked = needBlur;
    const { accent, bgGlow, icon } = getFocusThemeColors(difficulty);

    // Card Styles
    const cardStyle = {
        position: 'relative',
        width: '100%', 
        height: isFullWidth ? '120px' : '185px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: "22px", 
        overflow: 'hidden',
        cursor: isLocked ? 'default' : 'pointer',
        
        // Background & Depth
        backgroundColor: Colors.get('simplePanel', theme), 
        boxShadow: isDark 
            ? '0 4px 20px rgba(0,0,0,0.3)' 
            : '0 4px 15px rgba(0,0,0,0.05)',
        border: isDark 
            ? '1px solid rgba(255,255,255,0.05)' 
            : '1px solid rgba(0,0,0,0.02)',
            
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
        <motion.div 
            variants={variants}
            whileTap={!isLocked ? { scale: 0.96 } : {}}
            whileHover={!isLocked ? { y: -2 } : {}}
            onClick={onClick}
            style={cardStyle}
        >
            {/* Ambient Glow */}
            <div style={{
                position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                background: bgGlow,
                pointerEvents: 'none'
            }} />

            {/* Lock Overlay */}
            {isLocked && (
                <div onClick={(e) => { e.stopPropagation(); }} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 10,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(8px)',
                    }}>
                    <FaLock size={18} color={accent} style={{marginBottom: '8px'}}/>
                    <div style={{fontSize: '11px', fontWeight: 'bold', color: Colors.get('mainText', theme), marginBottom: '8px'}}>PREMIUM</div>
                    
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
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginTop: '4px'
                    }}>
                        {protocol.level[lang]}
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ 
                        fontSize: isFullWidth ? '17px' : (fSize === 0 ? "16px" : "18px"), 
                        fontWeight: "700", 
                        color: Colors.get('mainText', theme), 
                        lineHeight: '1.2'
                    }}>
                        {protocol.title[lang]}
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
        </motion.div>
    )
}

export default FocusMain;

const styles = (theme) => ({
    container: {
        backgroundColor: Colors.get('background', theme), 
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        alignItems: "center",
        height: "90vh",
        marginTop:'110px',
        width: "100vw",
        fontFamily: "Segoe UI, sans-serif",
        overflow: 'hidden'
    },
    scrollView: {
        height: "100%",
        width: '100%',
        overflowY: "scroll",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    }
});