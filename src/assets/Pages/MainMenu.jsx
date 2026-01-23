import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, devMessage$, isPasswordCorrect$, fontSize$, premium$, isValidation$, setPage,setPremium } from '../StaticClasses/HabitsBus'
import { AppData, UserData } from '../StaticClasses/AppData'
import { NotificationsManager, sendPassword } from '../StaticClasses/NotificationsManager'
import { FaRunning, FaBrain, FaBed, FaListUl, FaRobot, FaMedal, FaChevronRight, FaCodeBranch } from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";
import { getCurrentCycleAnalysis } from './TrainingPages/Analitics/TrainingAnaliticsMain'
import { PremiumButton } from './Premium'
import { sendReferalLink } from '../StaticClasses/PaymentService'

const MainMenu = () => {
    const [theme, setThemeState] = useState(AppData.prefs[1] === 0 ? 'dark' : 'light');
    const [lang, setLang] = useState(AppData.prefs[0]);
    const [fSize, setFontSize] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [clickCountUp, setClickCountUp] = useState(0);
    const [devConsolePanel, setDevConsolePanel] = useState(false);
    const [devMessage, setDevMessage] = useState('');
    const [devInputMessage, setDevInputMessage] = useState('');
    const [devMessageToAll, setDevMessageToAll] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [passwordInput, setPasswordInput] = useState(false);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const [isValidation, setIsValidation] = useState(UserData.isValidation);

    useEffect(() => {
        const subscription = premium$.subscribe(setHasPremium);
        const subscription2 = isValidation$.subscribe(setIsValidation);
        return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
        }
    }, []);

    useEffect(() => {
        const themeSubscription = theme$.subscribe(setThemeState);
        const langSubscription = lang$.subscribe((lang) => {
            setLang(lang === 'ru' ? 0 : 1);
        });
        const fontSizeSubscription = fontSize$.subscribe(setFontSize);
        return () => {
            themeSubscription.unsubscribe();
            langSubscription.unsubscribe();
            fontSizeSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const devMessageSubscription = devMessage$.subscribe(setDevMessage);
        const isPasswordCorrectSubscription = isPasswordCorrect$.subscribe(setIsPasswordCorrect);
        return () => {
            devMessageSubscription.unsubscribe();
            isPasswordCorrectSubscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (isPasswordCorrect) {
            setPasswordInput(false);
            setDevConsolePanel(true);
        }
    }, [isPasswordCorrect]);

    const handleClick = (isUp) => {
        if (isUp) {
            setClickCountUp(clickCountUp + 1);
        } else {
            setClickCount(clickCount + 1);
        }
        if (clickCount === 5 && clickCountUp === 5) {
            setPasswordInput(true);
            setClickCount(0);
            setClickCountUp(0);
            // for test only
            UserData.hasPremium = true;
            UserData.premiumEndDate = '2099-01-01';
            setPremium(true);
        }
    }

    const checkPassword = (value) => {
        if (value.length === 16) {
            sendPassword(value);
        }
    }

    const menuItems = [
        { id: 'RobotMain', icon: <FaRobot />, title: lang === 0 ? 'ИИ инсайты' : 'AI insights', subtitle: lang === 0 ? 'Персональный анализ' : 'Personal analysis', color: '#00E5FF', needBlur: true },
        { id: 'HabitsMain', icon: <FaMedal />, title: lang === 0 ? 'Привычки' : 'Habits', subtitle: lang === 0 ? 'Трекер дисциплины' : 'Discipline tracker', color: '#FFD700', needBlur: false },
        { id: 'TrainingMain', icon: <FaRunning />, title: lang === 0 ? 'Тренировки' : 'Workout', subtitle: lang === 0 ? 'Дневник силы' : 'Gym diary', color: '#FF4D4D', needBlur: false },
        { id: 'MentalMain', icon: <FaBrain />, title: lang === 0 ? 'Мозг' : 'Brain', subtitle: lang === 0 ? 'Развитие интеллекта' : 'Intelligence', color: '#4DA6FF', needBlur: false },
        { id: 'RecoveryMain', icon: <MdOutlineSelfImprovement />, title: lang === 0 ? 'Восстановление' : 'Recovery', subtitle: lang === 0 ? 'Медитации и отдых' : 'Meditation & Rest', color: '#4DFF88', needBlur: false },
        { id: 'SleepMain', icon: <FaBed />, title: lang === 0 ? 'Сон' : 'Sleep', subtitle: lang === 0 ? 'Анализ качества' : 'Quality analysis', color: '#A64DFF', needBlur: true },
        { id: 'ToDoMain', icon: <FaListUl />, title: lang === 0 ? 'Задачи' : 'To-Do', subtitle: lang === 0 ? 'Список дел' : 'Task list', color: '#FFA64D', needBlur: false }
    ];

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.09 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    return (
        <>
            {devConsolePanel && (
                <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', flexDirection: 'column', top: '10vh', left: '0', width: '100vw', height: '40vh', backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 10000 }}>
                    <div style={{ display: 'flex', overflowY: 'scroll', borderRadius: '12px', width: '85vw', height: '15vh', fontSize: '12px', fontFamily: 'Segoe UI', border: '1px solid #333', color: 'white', padding: '10px' }}>
                        {devMessage}
                    </div>
                    <textarea style={{ borderRadius: '12px', width: '85vw', height: '10vh', fontSize: '12px', background: '#111', color: 'white', marginTop: '10px' }} value={devMessageToAll} onChange={(e) => setDevMessageToAll(e.target.value)} />
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '10px' }}>
                        <input style={{ borderRadius: '12px', width: '50vw', height: '3vh', background: '#222', color: 'white' }} type="text" onChange={(e) => setDevInputMessage(e.target.value)} />
                        <button onClick={() => { if (devInputMessage === 'TrainingMain') { setPage('TrainingMain'); } else { NotificationsManager.sendMessage(devInputMessage, devMessageToAll) } }}>Submit</button>
                    </div>
                    <button onClick={() => setDevConsolePanel(false)} style={{ marginTop: '10px' }}>Close</button>
                </div>
            )}

            <div style={styles(theme).container}>
                <div style={{ height: '16vh' }} />
                {passwordInput && <input style={{ width: '85vw', height: '2vh', fontSize: '12px', borderRadius: '12px', zIndex: 1001, marginBottom: '10px' }} type="password" onChange={(e) => checkPassword(e.target.value)} />}
                
                <div style={styles(theme).scrollView}>
                    <div style={{ height: '2vh', width: '100%' }} onClick={() => { handleClick(true) }} ></div>
                    
                    {!hasPremium && !isValidation && (
                        <PremiumButton 
                            clickHandler={() => sendReferalLink()} 
                            w={'90%'} h={'85px'} fSize={'15px'} br={"24px"}
                            langIndex={lang} theme={theme} 
                            textToShow={['Премиум за приглашение', 'Invite and get premium']} 
                            needSparcle={false} 
                        />
                    )}

                    <motion.div
                        variants={containerAnim}
                        initial="hidden"
                        animate="show"
                        style={styles(theme).grid}
                    >
                        {menuItems.map((menuItem, index) => (
                            <MenuCard
                                key={menuItem.id}
                                item={menuItem}
                                theme={theme}
                                variants={itemAnim}
                                hasPremium={hasPremium}
                                index={index}
                                fSize={fSize}
                                lang={lang}
                            />
                        ))}
                    </motion.div>

                    <div style={{ height: '10vh', width: '100%' }} onClick={() => { handleClick(false) }} ></div>
                </div>
            </div>
        </>
    )
}

function MenuCard({ item, theme, variants, hasPremium, index, fSize, lang }) {
    const isLocked = !hasPremium && item.needBlur;
    const isDev = false; //index === 6; // To-Do is indexed as 6
    const info = getInfo(index - 1);
    const isDark = theme === 'dark';
 
    const cardStyle = {
        position: 'relative',
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        boxSizing: 'border-box',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '12px',
        // LIGHT: Solid white for high contrast | DARK: Glassmorphism
        backgroundColor: isDark 
            ? Colors.get('simplePanel', theme) + '99' 
            : '#FFFFFF',
        backdropFilter: isDark ? 'blur(40px)' : 'none',
        border: `1px solid ${isDark ? Colors.get('border', theme) + '30' : '#E5E7EB'}`,
        boxShadow: isDark 
            ? '0 8px 20px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 4px 10px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    };

    const iconWrapperStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        flexShrink: 0,
        backgroundColor: isDark 
            ? Colors.get('background', theme) + '80' 
            : Colors.get('background', theme),
        color: item.color,
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
    };

    return (
        <motion.div
            variants={variants}
            whileTap={{ scale: 0.97 }}
            onClick={() => { if (!isLocked && !isDev) { setPage(item.id); playEffects(null); } }}
            style={cardStyle}
        >
            <div style={iconWrapperStyle}>
                {React.cloneElement(item.icon, { size: 22 })}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, overflow: 'hidden' }}>
                <h4 style={{ 
                    ...styles(theme, fSize).title, 
                    color: Colors.get('mainText', theme), 
                    margin: 0, 
                    fontWeight: isDark ? '900' : '700' 
                }}>
                    {item.title}
                </h4>
                <div style={{ 
                    ...styles(theme, fSize).subtitle, 
                    color: Colors.get('subText', theme), 
                    opacity: isDark ? 0.6 : 0.8 
                }}>
                    {item.subtitle}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                {info !== '' && (
                    <div style={{
                        padding: '4px 10px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: Colors.get('mainText', theme),
                        marginRight: '8px'
                    }}>
                        {info}
                    </div>
                )}
                <FaChevronRight size={14} color={Colors.get('subText', theme)} style={{ opacity: 0.3 }} />
            </div>

            {/* Premium Lock Overlay */}
            {isLocked && (
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: isDark ? 'rgba(14, 14, 14, 0.52)' : 'rgba(255, 255, 255, 0.4)',
                        backdropFilter: 'blur(5px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: isDark ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {lang === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
                </div>
            )}

            {/* Dev Overlay */}
            {isDev && (
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: isDark ? 'rgba(16, 16, 16, 0.54)' : 'rgba(255, 255, 255, 0.52)',
                        backdropFilter: 'blur(6px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: isDark ? '#00b3ff' : '#0606d9', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                        <FaCodeBranch style={{ color: isDark ? '#00b3ff' : '#0000a7' }} />
                        {lang === 0 ? 'В разработке' : 'In development'}
                    </div>
                </div>
            )}
        </motion.div>
    );
}

const styles = (theme, fontSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        fontFamily: "Segoe UI",
        overflow: 'hidden'
    },
    scrollView: {
        width: "100vw",
        maxHeight: "90vh",
        overflowY: "scroll",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    grid: {
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px', // Gap handled by margin in MenuCard
        marginTop: '15px'
    },
    title: {
        fontFamily: 'Segoe UI',
        fontSize: fontSize === 0 ? '19px' : '21px',
        letterSpacing: '0.2px'
    },
    subtitle: {
        fontFamily: 'Segoe UI',
        fontWeight: '500',
        fontSize: fontSize === 0 ? '12px' : '14px',
        marginTop: '2px'
    },
    text: {
        fontFamily: "Segoe UI",
        fontSize: fontSize === 0 ? "10px" : "12px",
        color: Colors.get('subText', theme)
    },
    mainText: {
        fontFamily: "Segoe UI",
        fontSize: fontSize === 0 ? "14px" : "16px",
        color: Colors.get('mainText', theme)
    }
})

function playEffects(sound) {
    if (AppData.prefs[2] == 0 && sound !== null) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

function getInfo(index) {
    if (index === 0) return AppData.choosenHabits.length > 0 ? AppData.choosenHabits.length : '';
    else if (index === 1) {
        const tonnage = getCurrentCycleAnalysis().currentTonnage;
        return tonnage > 0 ? (tonnage / 1000).toFixed(1) + (AppData.prefs[0] === 0 ? 'т' : 't') : '';
    }
    return '';
}

export default MainMenu