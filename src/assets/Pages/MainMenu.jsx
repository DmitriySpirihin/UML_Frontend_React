import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, devMessage$, isPasswordCorrect$, fontSize$, premium$, isValidation$, setPage, setPremium } from '../StaticClasses/HabitsBus'
import { AppData, UserData } from '../StaticClasses/AppData'
import { saveData } from '../StaticClasses/SaveHelper';
import { NotificationsManager, sendPassword } from '../StaticClasses/NotificationsManager'
import { FaRunning, FaBrain, FaBed, FaListUl, FaRobot,FaStar, FaMedal, FaChevronRight, FaCrown, FaThumbtack, FaTrashRestore, FaGift , FaTelegramPlane } from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";
import { getCurrentCycleAnalysis } from './TrainingPages/Analitics/TrainingAnaliticsMain'
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
    const [showReferralModal, setShowReferralModal] = useState(false);
    
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium); 
    const [isValidation, setIsValidation] = useState(UserData.isValidation);
    const [showGuideBanner, setShowGuideBanner] = useState(false);
    useEffect(() => {
      // показываем только один раз
      const key = "uml_guide_banner_seen_v1";
      const seen = localStorage.getItem(key) === "1";
    
      if (!seen) {
        // чуть задержки, чтобы меню успело отрисоваться
        const t = setTimeout(() => setShowGuideBanner(true), 450);
        return () => clearTimeout(t);
      }
    }, []);
    const closeGuideBanner = () => {
  localStorage.setItem("uml_guide_banner_seen_v1", "1");
  setShowGuideBanner(false);
};
const openGuide = () => {
  localStorage.setItem("uml_guide_banner_seen_v1", "1");
  setShowGuideBanner(false);
  setPage("InfoPanel");
};

    // --- STATE ДЛЯ УПРАВЛЕНИЯ СПИСКОМ ---
    const [itemsState, setItemsState] = useState(AppData.menuCardsStates || {});

    const initialMenuItems = [
        { id: 'MainCard', icon: null, title: lang === 0 ? '' : '', subtitle: lang === 0 ? '' : '', color: '#00ff6600' },
        { id: 'HabitsMain', icon: <FaMedal />, title: lang === 0 ? 'Привычки' : 'Habits', subtitle: lang === 0 ? 'Трекер дисциплины' : 'Discipline tracker', color: '#FFD700' },
        { id: 'TrainingMain', icon: <FaRunning />, title: lang === 0 ? 'Тренировки' : 'Workout', subtitle: lang === 0 ? 'Дневник силы' : 'Gym diary', color: '#FF4D4D'},
        { id: 'MentalMain', icon: <FaBrain />, title: lang === 0 ? 'Мозг' : 'Brain', subtitle: lang === 0 ? 'Развитие интеллекта' : 'Intelligence', color: '#4DA6FF' },
        { id: 'RecoveryMain', icon: <MdOutlineSelfImprovement />, title: lang === 0 ? 'Восстановление' : 'Recovery', subtitle: lang === 0 ? 'Медитации и отдых' : 'Meditation & Rest', color: '#4DFF88'},
        { id: 'SleepMain', icon: <FaBed />, title: lang === 0 ? 'Сон' : 'Sleep', subtitle: lang === 0 ? 'Анализ качества' : 'Quality analysis', color: '#A64DFF'},
        { id: 'ToDoMain', icon: <FaListUl />, title: lang === 0 ? 'Задачи' : 'To-Do', subtitle: lang === 0 ? 'Список дел' : 'Task list', color: '#FFA64D' }
    ];

    useEffect(() => {
    if (AppData.menuCardsStates && Object.keys(AppData.menuCardsStates).length > 0) {
        setItemsState(AppData.menuCardsStates);
    }
}, []);

useEffect(() => {
    if (Object.keys(itemsState).length > 0) {
        AppData.menuCardsStates = itemsState;
        const persist = async () => {
            try {
                await saveData();
                console.log("Menu states saved successfully");
            } catch (e) {
                console.error("Failed to save menu states", e);
            }
        };
        persist();
    }
}, [itemsState]);

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
        if (clickCount === 8 && clickCountUp === 4) {
            setPasswordInput(true);
            setClickCount(0);
            setClickCountUp(0);
        }
    }

    const checkPassword = (value) => {
        if (value.length === 16) {
            sendPassword(value);
        }
    }

    const handlePin = (id) => {
        setItemsState(prev => ({
            ...prev,
            [id]: { 
                ...prev[id], 
                pinned: !prev[id]?.pinned,
                hidden: prev[id]?.hidden || false 
            } 
        }));
    };

    const handleHide = (id) => {
        setItemsState(prev => ({
            ...prev,
            [id]: { 
                ...prev[id], 
                hidden: true,
                pinned: false 
            }
        }));
    };

    const resetHidden = () => {
        setItemsState(prev => {
            const newState = { ...prev };
            Object.keys(newState).forEach(key => {
                newState[key] = {
                    ...newState[key],
                    hidden: false
                };
            });
            return newState;
        });
    }

    const getVisibleItems = () => {
        let items = [...initialMenuItems];
        items = items.filter(item => !itemsState[item.id]?.hidden);
        items.sort((a, b) => {
            const aPinned = itemsState[a.id]?.pinned ? 1 : 0;
            const bPinned = itemsState[b.id]?.pinned ? 1 : 0;
            return bPinned - aPinned; 
        });
        return items;
    };

    const visibleItems = getVisibleItems();
    const hasHiddenItems = initialMenuItems.some(item => itemsState[item.id]?.hidden);

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.09 } }
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
            <ReferralModal 
                isOpen={showReferralModal}
                onClose={() => setShowReferralModal(false)}
                onSend={sendReferalLink}
                theme={theme}
                lang={lang}
            />
            <AnimatePresence>
              {showGuideBanner && !devConsolePanel && !showReferralModal && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={closeGuideBanner}
                    style={{
                      position: "fixed",
                      inset: 0,
                      backgroundColor: "rgba(0,0,0,0.62)",
                      backdropFilter: "blur(6px)",
                      zIndex: 1500,
                    }}
                  />
            
                  {/* Banner */}
                  <motion.div
                    initial={{ y: 40, opacity: 0, scale: 0.98 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 40, opacity: 0, scale: 0.98 }}
                    transition={{ type: "spring", damping: 22, stiffness: 260 }}
                    style={{
                      position: "fixed",
                      left: "5%",
                      top: "18%",
                      transform: "translateX(-50%)",
                      width: "92%",
                      maxWidth: "520px",
                      borderRadius: "26px",
                      overflow: "hidden",
                      zIndex: 1501,
                      border: `1px solid ${Colors.get("border", theme)}55`,
                      background: theme === "dark"
                        ? "rgba(20,20,20,0.82)"
                        : "rgba(255,255,255,0.88)",
                      boxShadow: theme === "dark"
                        ? "0 30px 80px rgba(0,0,0,0.65)"
                        : "0 25px 70px rgba(0,0,0,0.18)",
                    }}
                  >
                    {/* Glow */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "-120px -80px auto -80px",
                        height: "260px",
                        background:
                          "radial-gradient(circle at 45% 45%, rgba(77,166,255,0.35), transparent 60%)",
                        filter: "blur(2px)",
                        pointerEvents: "none",
                      }}
                    />
            
                    <div style={{ position: "relative", padding: "18px 18px 16px 18px" }}>
                      <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                        <img
                          src={"images/bro.png"}
                          alt="Guide"
                          style={{
                            width: 92,
                            height: 92,
                            objectFit: "contain",
                            filter:
                              theme === "dark"
                                ? "drop-shadow(0 16px 22px rgba(0,0,0,0.55))"
                                : "drop-shadow(0 12px 18px rgba(0,0,0,0.16))",
                          }}
                        />
            
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontFamily: "Segoe UI",
                              fontWeight: 900,
                              fontSize: 18,
                              color: Colors.get("mainText", theme),
                              letterSpacing: "0.2px",
                              marginBottom: 6,
                            }}
                          >
                            {lang === 0 ? "Быстрый старт" : "Quick start"}
                          </div>
            
                          <div
                            style={{
                              fontFamily: "Segoe UI",
                              fontWeight: 700,
                              fontSize: 13,
                              lineHeight: 1.35,
                              color: Colors.get("subText", theme),
                              opacity: theme === "dark" ? 0.85 : 0.8,
                            }}
                          >
                            {lang === 0
                              ? "Хочешь за 30 секунд понять, как всё работает? Я покажу."
                              : "Want to understand everything in 30 seconds? I’ll show you."}
                          </div>
                        </div>
                      </div>
            
                      <div style={{ display: "flex", gap: "10px", marginTop: 14 }}>
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={openGuide}
                          style={{
                            flex: 1,
                            padding: "12px 14px",
                            borderRadius: "16px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: 900,
                            fontFamily: "Segoe UI",
                            background: "#007AFF",
                            color: "#fff",
                          }}
                        >
                          {lang === 0 ? "Открыть инструкцию" : "Open guide"}
                        </motion.button>
            
                        <motion.button
                          whileTap={{ scale: 0.97 }}
                          onClick={closeGuideBanner}
                          style={{
                            padding: "12px 14px",
                            borderRadius: "16px",
                            border: `1px solid ${Colors.get("border", theme)}55`,
                            cursor: "pointer",
                            fontWeight: 800,
                            fontFamily: "Segoe UI",
                            background: "transparent",
                            color: Colors.get("subText", theme),
                          }}
                        >
                          {lang === 0 ? "Позже" : "Later"}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
            <div style={styles(theme).container}>
                <div style={{ height: '16vh' }} />
                {passwordInput && <input style={{ width: '85vw', height: '2vh', fontSize: '12px', borderRadius: '12px', zIndex: 1001, marginBottom: '10px' }} type="password" onChange={(e) => checkPassword(e.target.value)} />}
                
                <div style={styles(theme).scrollView}>
                    <div style={{ height: '2vh', width: '100%' }} onClick={() => { handleClick(true) }} ></div>

                    

                    <motion.div
                        variants={containerAnim}
                        initial="hidden"
                        animate="show"
                        style={styles(theme).grid}
                    >
                        <AnimatePresence mode='popLayout'>
                            {visibleItems.map((menuItem, index) => (
                                <MenuCard
                                    key={menuItem.id}
                                    item={menuItem}
                                    theme={theme}
                                    hasPremium={hasPremium}
                                    index={index}
                                    fSize={fSize}
                                    lang={lang}
                                    isPinned={itemsState[menuItem.id]?.pinned}
                                    onPin={() => handlePin(menuItem.id)}
                                    onHide={() => handleHide(menuItem.id)}
                                    setShowReferralModal={setShowReferralModal}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {hasHiddenItems && (
                        <motion.div 
                            initial={{opacity: 0}} animate={{opacity: 1}}
                            onClick={resetHidden}
                            style={{
                                marginTop: '20px', 
                                padding: '10px 20px', 
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: Colors.get('simplePanel', theme),
                                borderRadius: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: Colors.get('subText', theme)
                            }}
                        >
                            <FaTrashRestore /> {lang === 0 ? 'Вернуть скрытые разделы' : 'Restore hidden sections'}
                        </motion.div>
                    )}

                    <div style={{ height: '10vh', width: '100%' }} onClick={() => { handleClick(false) }} ></div>
                </div>
            </div>
        </>
    )
}

function AIInsightButton({ theme, lang, onClick }) {
    const isDark = theme === 'dark';
    const mainColor = '#00E5FF';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{
                width: '88%',
                height: '78%',
                borderRadius: '16px',
                background: isDark ? 'rgba(0, 229, 255, 0.08)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(0, 229, 255, 0.3)' : 'rgba(0, 229, 255, 0.5)'}`,
                margin: '5px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <FaRobot size={18} color={mainColor} />
            <span style={{
                fontFamily: 'Segoe UI',
                fontWeight: '600',
                fontSize: '15px',
                color: isDark ? '#E0F7FA' : '#333',
                letterSpacing: '0.3px'
            }}>
                {lang === 0 ? 'AI Ассистент' : 'AI Assistant'}
            </span>
        </motion.div>
    );
}
function ReferalButton({ theme, lang, onClick }) {
    const isDark = theme === 'dark';
    const mainColor = '#ffd500';

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{
                width: '88%',
                height: '78%',
                borderRadius: '16px',
                background: isDark ? 'rgba(242, 255, 0, 0.08)' : '#FFFFFF',
                border: `1px solid ${isDark ? 'rgba(255, 238, 0, 0.3)' : 'rgba(255, 247, 0, 0.5)'}`,
                margin: '5px',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <FaCrown size={18} color={mainColor} />
            <span style={{
                fontFamily: 'Segoe UI',
                fontWeight: '600',
                fontSize: '15px',
                color: isDark ? '#E0F7FA' : '#333',
                letterSpacing: '0.3px'
            }}>
                {lang === 0 ? 'Пригласи друга' : 'Invite a friend'}
            </span>
        </motion.div>
    );
}
function MenuCard({ item, theme, index, fSize, lang, isPinned, onPin, onHide,setShowReferralModal }) {
    const isDark = theme === 'dark';

    const cardStyle = {
        position: 'relative',
        width: '100%',
        height: !item.icon ? '50px' : '80px', 
        display: 'flex',
        alignItems: 'center',
        padding: !item.icon ? '0px' : '0 20px',
        boxSizing: 'border-box',
        borderRadius: !item.icon ? '0px' : '24px',
        overflow: 'hidden',
        marginBottom: '12px',
        backgroundColor: !item.icon ? 'transparent' : isDark ? Colors.get('simplePanel', theme) + '99' : '#FFFFFF',
        backdropFilter: !item.icon ? 'none' : isDark ? 'blur(40px)' : 'none',
        border: !item.icon ? 'none' : isPinned 
            ? `1px solid ${item.color}` 
            : `1px solid ${isDark ? Colors.get('border', theme) + '30' : '#E5E7EB'}`,
        boxShadow: !item.icon ? 'none' : isDark ? '0 8px 20px 0 rgba(0, 0, 0, 0.4)' : '0 4px 10px rgba(0, 0, 0, 0.04)',
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
        backgroundColor: isDark ? Colors.get('background', theme) + '80' : Colors.get('background', theme),
        color: item.color,
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
    };

    return (
        <motion.div
            layout 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
            whileTap={{ scale: 0.97 }}
            
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(e, { offset }) => {
          if (offset.x < -80) {
           onHide();
           if (window.Telegram?.WebApp?.HapticFeedback) 
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
        if (offset.x > 80) {
        onPin();
        if (window.Telegram?.WebApp?.HapticFeedback) 
            window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
}}

            onClick={() => { if (item.icon !== null) { setPage(item.id); playEffects(null); } }}
            style={cardStyle}
        >
            {item.icon ? ( <div style={{display:'flex',flexDirection:'row',width:'100%',alignItems:'center'}}>
            
            <div style={iconWrapperStyle}>
                {React.cloneElement(item.icon, { size: 22 })}
            </div>

            {/* --- ЦЕНТРИРОВАНИЕ ТЕКСТА --- */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center', // Центрируем контент по горизонтали
                textAlign: 'center',  // Выравниваем текст по центру
                flexGrow: 1, 
                overflow: 'hidden' 
            }}>
                <div style={{display:'flex', alignItems:'center', justifyContent: 'center', gap:'8px'}}>
                    <h4 style={{ 
                        ...styles(theme, fSize).title, 
                        color: Colors.get('mainText', theme), 
                        margin: 0, 
                        fontWeight: isDark ? '900' : '700' 
                    }}>
                        {item.title}
                    </h4>
                    {isPinned && <FaThumbtack size={12} color={item.color} style={{transform:'rotate(45deg)'}}/>}
                </div>
                <div style={{ 
                    ...styles(theme, fSize).subtitle, 
                    color: Colors.get('subText', theme), 
                    opacity: isDark ? 0.6 : 0.8 
                }}>
                    {item.subtitle}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                <Info id = {item.id} theme={theme} lang={lang} />
                <FaChevronRight size={14} color={Colors.get('subText', theme)} style={{ opacity: 0.3 }} />
            </div>
            </div>) : 
            (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignContent: 'center', justifyItems: 'center' }}>
                    <ReferalButton
                        theme={theme} 
                        lang={lang} 
                        onClick={() => setShowReferralModal(true)}
                    />
                        <AIInsightButton 
                        theme={theme} 
                        lang={lang} 
                        onClick={() => { setPage('RobotMain'); }} 
                    />
            </div>

            )
            }

            
        </motion.div>
    );
}

const Info = ({ id, theme, lang }) => {
  const info = getInfo(id, lang);

  if (!info) return null;

  return (
    <div
      style={{
        padding: '4px 10px',
        backgroundColor:
          theme === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        color: Colors.get('mainText', theme),
        marginRight: '8px',
      }}
    >
      {info}
      {id === 'MentalMain' && <FaStar style={{marginLeft:'5px'}}/>}
    </div>
  );
};


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
        gap: '4px', 
        marginTop: '5px'
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

function getInfo(id,langIndex = 0) {
    if (id === 'HabitsMain') return AppData.choosenHabits.length > 0 ? AppData.choosenHabits.length : '';
    else if (id === 'TrainingMain') {
        const tonnage = getCurrentCycleAnalysis().currentTonnage;
        return tonnage > 0 ? (tonnage / 1000).toFixed(1) + (AppData.prefs[0] === 0 ? 'т' : 't') : '';
    }
    else if (id === 'ToDoMain') return AppData.todoList.length > 0 ? AppData.todoList.length : '';
    else if (id === 'SleepMain') return getTodaySleepHours(langIndex);
    else if (id === 'RecoveryMain') return getTodaySessionCount();
    else if (id === 'MentalMain') return getMentalScoresSummary();

    return '';
}
function getTodaySleepHours(langIndex) {
  const entry = AppData.sleepingLog[new Date().toISOString().split('T')[0]];
  if (!entry || typeof entry.duration !== 'number') return '';
  return formatMsToHhMm(entry.duration);
}
const formatMsToHhMm = (ms) => {
  if (typeof ms !== 'number' || ms < 0) return '--:--';
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
function getTodaySessionCount() {
  const todayKey = new Date().toISOString().split('T')[0];
  const getCount = (log) => (log[todayKey] ? log[todayKey].length : 0);
  const totalSessions = 
    getCount(AppData.breathingLog) + 
    getCount(AppData.meditationLog) + 
    getCount(AppData.hardeningLog);

  return totalSessions;
}
function getMentalScoresSummary() {
  const mentalRecords = AppData.mentalRecords;
  const total = mentalRecords.flat().reduce((sum, v) => sum + v, 0);
  const k = (total / 1000).toFixed(1); // переводим в «k» с одним знаком [cite:5]
  return `${k}k`;
}
export default MainMenu

const ReferralModal = ({ isOpen, onClose, onSend, theme, lang }) => {
    const isDark = theme === 'dark';
    const bg = isDark ? Colors.get('simplePanel', theme) : '#FFFFFF';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    // Modern Gradient for the icon background
    const iconGradient = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            zIndex: 2000
                        }}
                    />

                    {/* Modal Panel */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0,
                            backgroundColor: bg,
                            borderTopLeftRadius: '32px', borderTopRightRadius: '32px',
                            padding: '24px',
                            zIndex: 2001,
                            boxShadow: '0 -10px 40px rgba(0,0,0,0.2)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center'
                        }}
                    >
                        {/* Drag Handle */}
                        <div style={{ width: '40px', height: '5px', borderRadius: '10px', backgroundColor: sub, opacity: 0.3, marginBottom: '20px' }} />

                        {/* Animated Icon */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            style={{
                                width: '80px', height: '80px', borderRadius: '50%',
                                background: iconGradient,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px',
                                boxShadow: '0 10px 20px rgba(255, 215, 0, 0.3)'
                            }}
                        >
                            <FaGift size={40} color="#FFF" />
                        </motion.div>

                        {/* Title */}
                        <h2 style={{ 
                            fontFamily: 'Segoe UI', fontSize: '24px', fontWeight: '800', 
                            color: text, margin: '0 0 10px 0', textAlign: 'center' 
                        }}>
                            {lang === 0 ? 'Пригласи друга' : 'Invite a Friend'}
                        </h2>

                        {/* Description */}
                        <p style={{ 
                            fontFamily: 'Segoe UI', fontSize: '15px', fontWeight: '500', 
                            color: sub, margin: '0 0 30px 0', textAlign: 'center', lineHeight: '1.5',
                            maxWidth: '90%'
                        }}>
                            {lang === 0 
                                ? 'Отправь ссылку другу. Когда он присоединится, вы оба получите 1 месяц Premium бесплатно! Каждый новый друг + 1 месяц Premium бесплатно! 🎁' 
                                : 'Send a link to a friend. When they join, you both get 1 month of Premium for free! Each new friend + 1 month of Premium for free! 🎁'}
                        </p>

                        {/* Action Buttons */}
                        <div style={{ width: '100%', display: 'flex', gap: '12px', flexDirection: 'column' }}>
                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={() => { onSend(); onClose(); }}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '16px',
                                    border: 'none', background: '#007AFF',
                                    color: '#FFF', fontSize: '16px', fontWeight: '700',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            >
                                <FaTelegramPlane size={20} />
                                {lang === 0 ? 'Отправить приглашение' : 'Send Invitation'}
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.96 }}
                                onClick={onClose}
                                style={{
                                    width: '100%', padding: '14px', borderRadius: '16px',
                                    border: 'none', background: 'transparent',
                                    color: sub, fontSize: '15px', fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                {lang === 0 ? 'Позже' : 'Maybe later'}
                            </motion.button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
