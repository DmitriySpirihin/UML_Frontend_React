import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppData, UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$, lang$, fontSize$, recoveryType$, setPage, premium$ } from '../../StaticClasses/HabitsBus.js'
import { FaMoon, FaSun, FaBolt, FaWind, FaPlay, FaLock, FaFeatherAlt } from 'react-icons/fa'
import { MdOutlineCreate } from 'react-icons/md'
import { breathingProtocols, meditationProtocols, coldWaterProtocols } from '../../StaticClasses/RecoveryLogHelper.js'
import BreathingTimer from './BreathingTimer.jsx'
import MeditationTimer from './MeditationTimer.jsx'
import HardeningTimer from './HardeningTimer.jsx'
import BreathingConstructor from './BreathingConstructor.jsx'
import MeditationConstructor from './MeditationConstructor.jsx'
import HardeningConstructor from './HardeningConstructor.jsx'

const BreathingMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [currentProtocol, setCurrentProtocol] = useState(breathingProtocols[0].protocols[0]);
    const [protocolIndex, setProtocolIndex] = useState(0);
    const [categorylIndex, setCategoryIndex] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [structure, setStructure] = useState(breathingProtocols);
    const [showBreathingConstructor, setShowBreathingConstructor] = useState(false);
    const [showMeditationConstructor, setShowMeditationConstructor] = useState(false);
    const [showHardeningConstructor, setShowHardeningConstructor] = useState(false);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    
    useEffect(() => {
        const subscription = premium$.subscribe(setHasPremium);
        return () => subscription.unsubscribe();
    }, []);
    
    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
        const subscription2 = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        const subscription3 = fontSize$.subscribe((fontSize) => {
            setFSize(fontSize);
        });
        const subscription4 = recoveryType$.subscribe((type) => {
            setStructure(type === 0 ? breathingProtocols : type === 1 ? meditationProtocols : coldWaterProtocols);
        });
        return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
            subscription4.unsubscribe();
        }
    }, []);

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 10, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    const getPageTitle = () => {
        if(recoveryType$.value === 0) return { emoji: '🌬️', ru: 'Дыхание', en: 'Breathing' };
        if(recoveryType$.value === 1) return { emoji: '🧘', ru: 'Медитация', en: 'Meditation' };
        return { emoji: '💧', ru: 'Закаливание', en: 'Cold Water' };
    };

    const pageInfo = getPageTitle();

    return (
        <div style={styles(theme).container}>
            <div style={styles(theme).scrollView}>
                <div style={{ height: '3vh' }} /> 
                
                {/* Заголовок (вернули системный цвет текста) */}
                <div style={{ width: '92%', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '28px' }}>{pageInfo.emoji}</span>
                        <h1 style={{ margin: 0, color: Colors.get('mainText', theme), fontSize: '26px', fontFamily: 'Segoe UI', fontWeight: '800' }}>
                            {langIndex === 0 ? pageInfo.ru : pageInfo.en}
                        </h1>
                     </div>
                     <span style={{ fontSize: '14px', color: Colors.get('subText', theme), opacity: 0.7, marginLeft: '4px' }}>
                        {langIndex === 0 ? 'Выберите практику' : 'Choose your practice'}
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
                    {structure.map((category, index) => {
                        return (
                            category.protocols.map((protocol, ind) => {
                                return (
                                    <PremiumCard 
                                        key={`${index}-${ind}`}
                                        variants={itemAnim}
                                        ind={ind} 
                                        difficulty={index} 
                                        protocol={protocol} 
                                        setTimer={setShowTimer}
                                        theme={theme} 
                                        lang={langIndex} 
                                        fSize={fSize} 
                                        onClick={() => { setCurrentProtocol(protocol); setProtocolIndex(ind); setCategoryIndex(index) }} 
                                        hasPremium={hasPremium} 
                                        needBlur={index > 1} 
                                    />
                                )
                            })
                        )
                    })}
                    
                    {/* Конструктор */}
                    <div style={{ gridColumn: '1 / -1', width: '100%' }}>
                         <PremiumCard 
                            difficulty={4}
                            variants={itemAnim}
                            ind={-1} 
                            setTimer={recoveryType$.value === 0 ? setShowBreathingConstructor : recoveryType$.value === 1 ? setShowMeditationConstructor : setShowHardeningConstructor}
                            theme={theme} 
                            lang={langIndex} 
                            fSize={fSize} 
                            onClick={() => { setCategoryIndex(4) }} 
                            protocol={undefined} 
                            hasPremium={hasPremium} 
                            needBlur={true} 
                            isConstructor={true}
                        />
                    </div>
                </motion.div>

                <div style={{marginBottom: '100px' }} > </div>
            </div>

            {/* Timers & Constructors */}
            {recoveryType$.value === 0 && <BreathingTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex} />}
            {recoveryType$.value === 1 && <MeditationTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex} />}
            {recoveryType$.value === 2 && <HardeningTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex} />}

            <BreathingConstructor show={showBreathingConstructor} setShow={setShowBreathingConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize} />
            <MeditationConstructor show={showMeditationConstructor} setShow={setShowMeditationConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize} />
            <HardeningConstructor show={showHardeningConstructor} setShow={setShowHardeningConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize} />
        </div>
    )
}

export default BreathingMain

const styles = (theme, fSize) => ({
    container: {
        // ВЕРНУЛИ СТАНДАРТНЫЙ ФОН
        backgroundColor: Colors.get('background', theme), 
        display: "flex",
        flexDirection: "column",
        justifyItems: "center",
        alignItems: "center",
        height: "91vh",
        marginTop:'120px',
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
    },
    btn: {
        padding: '8px 24px',
        borderRadius: '12px',
        fontSize: '13px',
        color: Colors.get('mainText', theme),
        border: 'none',
        fontWeight: '600',
        marginTop: '12px',
        cursor: 'pointer',
        backgroundColor: Colors.get('background', theme), // Кнопка под цвет фона
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }
})


// --- CARD LOGIC ---

// Цвета для разных категорий (визуальное отличие)
const getThemeColors = (difficulty) => {
    switch (difficulty) {
        case 0: // Relax
            return {
                accent: '#64D2FF', // Голубой
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(100, 210, 255, 0.12) 0%, transparent 45%)',
                icon: <FaMoon />,
            };
        case 1: // Focus
            return {
                accent: '#32D74B', // Зеленый
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(50, 215, 75, 0.12) 0%, transparent 45%)',
                icon: <FaFeatherAlt />,
            };
        case 2: // Energy
            return {
                accent: '#FF9F0A', // Оранжевый
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(255, 159, 10, 0.12) 0%, transparent 45%)',
                icon: <FaSun />,
            };
        case 3: // Extreme
            return {
                accent: '#BF5AF2', // Фиолетовый
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(191, 90, 242, 0.12) 0%, transparent 45%)',
                icon: <FaBolt />,
            };
        case 4: // Constructor
            return {
                accent: '#0A84FF', // Синий
                bgGlow: 'radial-gradient(circle at 100% 0%, rgba(10, 132, 255, 0.12) 0%, transparent 45%)',
                icon: <MdOutlineCreate />,
            };
        default:
            return { accent: '#8E8E93', bgGlow: 'none', icon: <FaWind /> };
    }
}

function PremiumCard({ protocol, difficulty, ind, setTimer, theme, lang, onClick, fSize, variants, hasPremium = false, needBlur = false, isConstructor = false }) {
    
    const isDark = theme === 'dark';
    const isLocked = !hasPremium && needBlur;
    const { accent, bgGlow, icon } = getThemeColors(difficulty);
    const { done, all, percent } = getProgressData(difficulty, ind);

    // Стили карточки
    const cardStyle = {
        position: 'relative',
        width: '100%', 
        height: isConstructor ? '120px' : '185px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: "22px", 
        overflow: 'hidden',
        cursor: 'pointer',
        
        // ВАЖНО: Используем системный цвет панели, но с прозрачностью для глубины
        backgroundColor: Colors.get('simplePanel', theme), 
        
        // Легкая тень и обводка для контраста
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
        // Фон иконки чуть светлее панели
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
            whileTap={{ scale: 0.96 }}
            whileHover={{ y: -2 }}
            onClick={() => { if (!isLocked) { onClick(); setTimer(true); } }}
            style={cardStyle}
        >
            {/* Ambient Glow (Визуальное отличие) */}
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
                    <div style={{fontSize: '11px', fontWeight: 'bold', color: Colors.get('mainText', theme)}}>PREMIUM</div>
                </div>
            )}

            {/* Header Content */}
            <div style={{ zIndex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={iconContainerStyle}>
                        {icon}
                    </div>
                    
                    {/* Level Label */}
                    {!isConstructor && (
                        <div style={{
                            fontSize: '10px', 
                            fontWeight: '700', 
                            color: accent, // Цвет текста соответствует категории
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginTop: '4px'
                        }}>
                             {difficulty === 0 ? 'Relax' : difficulty === 1 ? 'Focus' : difficulty === 2 ? 'Energy' : 'Pro'}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <div style={{ 
                        fontSize: isConstructor ? '17px' : (fSize === 0 ? "16px" : "18px"), 
                        fontWeight: "700", 
                        color: Colors.get('mainText', theme), 
                        lineHeight: '1.2'
                    }}>
                         {protocol === undefined ? (lang === 0 ? 'Конструктор' : 'Custom') : Array.isArray(protocol.name) ? protocol.name[lang] : protocol.name}
                    </div>
                    
                    <div style={{ 
                        fontSize: "12px", 
                        color: Colors.get('subText', theme), 
                        opacity: 0.8,
                        lineHeight: '1.3'
                    }}>
                         {protocol === undefined ? (lang === 0 ? 'Свой режим' : 'Your mode') : Array.isArray(protocol.aim) ? protocol.aim[lang] : protocol.aim}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            {!isLocked && !isConstructor && (
                <div style={{ zIndex: 2, marginTop: 'auto' }}>
                     <div style={{ width: '100%', height: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', borderRadius: '2px', marginTop: '10px' }}>
                        <div style={{ 
                            width: `${percent}%`, 
                            height: '100%', 
                            background: accent, 
                            borderRadius: '2px', 
                            boxShadow: `0 0 8px ${accent}40` // Легкое свечение полоски
                        }} />
                     </div>
                     <div style={{ textAlign: 'right', fontSize: '10px', color: Colors.get('subText', theme), marginTop: '4px', opacity: 0.6 }}>
                        {done}/{all}
                     </div>
                </div>
            )}

            {isConstructor && (
                 <div style={{ zIndex: 2, marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaPlay size={10} color={accent} />
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
                        {lang === 0 ? 'Начать' : 'Start'}
                    </span>
                 </div>
            )}
        </motion.div>
    )
}

const getProgressData = (difficulty, ind) => {
    if (difficulty === 4 || !AppData.recoveryProtocols[recoveryType$.value] || !AppData.recoveryProtocols[recoveryType$.value][difficulty][ind]) {
        return { done: 0, all: 0, percent: 0 };
    }
    const data = AppData.recoveryProtocols[recoveryType$.value][difficulty][ind];
    let all = 0;
    let done = 0;
    for (let j = 0; j < data.length; j++) {
        all++;
        if (data[j]) done++;
    }
    const percent = all > 0 ? (done / all) * 100 : 0;
    return { done, all, percent };
}