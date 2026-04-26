import React, { useEffect, useState } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion';
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, devMessage$, isPasswordCorrect$, fontSize$, premium$, isValidation$, setPage } from '../StaticClasses/HabitsBus'
import { AppData, UserData, getSectionStreak } from '../StaticClasses/AppData'
import { saveData } from '../StaticClasses/SaveHelper';
import { NotificationsManager, sendPassword } from '../StaticClasses/NotificationsManager'
import { FaRunning, FaBrain, FaBed, FaListUl, FaRobot,FaStar, FaMedal, FaChevronRight, FaCrown, FaThumbtack, FaTrashRestore, FaGift , FaTelegramPlane, FaSlidersH, FaCheck } from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";
import { getCurrentCycleAnalysis } from './TrainingPages/Analitics/TrainingAnaliticsMain'
import { sendReferalLink } from '../StaticClasses/PaymentService'
import MainMenuRedesign from './MainMenuRedesign'

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
    const [, setIsValidation] = useState(UserData.isValidation);
    const [showGuideBanner, setShowGuideBanner] = useState(false);
    const [showWidgetSettings, setShowWidgetSettings] = useState(false);
    const [mainHeroWidgets, setMainHeroWidgets] = useState(AppData.mainHeroWidgets || ['HabitsMain', 'TrainingMain', 'MentalMain']);
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

    const handleToggleHeroWidget = async (id) => {
        const current = mainHeroWidgets.length > 0 ? mainHeroWidgets : ['HabitsMain', 'TrainingMain', 'MentalMain'];
        let next;
        if (current.includes(id)) {
            next = current.length > 1 ? current.filter((itemId) => itemId !== id) : current;
        } else {
            if (current.length >= 3) return;
            next = [...current, id];
        }
        setMainHeroWidgets(next);
        AppData.mainHeroWidgets = next;
        await saveData();
    };

    const handleToggleSectionVisibility = (id) => {
        setItemsState(prev => {
            const isHidden = prev[id]?.hidden;
            return {
                ...prev,
                [id]: {
                    ...prev[id],
                    hidden: !isHidden,
                    pinned: isHidden ? prev[id]?.pinned || false : false
                }
            };
        });
    };

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
    const mainMenuSummary = buildMainMenuSummary(lang, visibleItems, mainHeroWidgets);

    const openSection = (id) => {
        if (!id) return;
        setPage(id);
        playEffects(null);
    };

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
            <WidgetSettingsModal
                isOpen={showWidgetSettings}
                onClose={() => setShowWidgetSettings(false)}
                items={initialMenuItems.filter(item => item.icon)}
                sectionStates={itemsState}
                heroValues={mainHeroWidgets}
                onToggleHeroWidget={handleToggleHeroWidget}
                onToggleSectionVisibility={handleToggleSectionVisibility}
                theme={theme}
                lang={lang}
            />
            <AnimatePresence>
              {showGuideBanner && !devConsolePanel && !showReferralModal && (
                <>
                  {/* Backdrop */}
                  <Motion.div
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
                  <Motion.div
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
                        <Motion.button
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
                        </Motion.button>
            
                        <Motion.button
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
                        </Motion.button>
                      </div>
                    </div>
                  </Motion.div>
                </>
              )}
            </AnimatePresence>
            {passwordInput && (
                <input
                    style={{
                        position: 'fixed',
                        top: '12vh',
                        left: '7.5vw',
                        width: '85vw',
                        height: '34px',
                        fontSize: '13px',
                        borderRadius: '12px',
                        zIndex: 10001,
                        border: '1px solid rgba(255,255,255,0.2)',
                        background: 'rgba(0,0,0,0.8)',
                        color: '#fff',
                        padding: '0 12px',
                        boxSizing: 'border-box'
                    }}
                    type="password"
                    onChange={(e) => checkPassword(e.target.value)}
                />
            )}
            <MainMenuRedesign
                theme={theme}
                lang={lang}
                visibleItems={visibleItems}
                itemsState={itemsState}
                hasHiddenItems={hasHiddenItems}
                hasPremium={hasPremium}
                summary={mainMenuSummary}
                onOpenSection={openSection}
                onOpenRobot={() => openSection('RobotMain')}
                onOpenReferral={() => setShowReferralModal(true)}
                onOpenPremium={() => openSection('premium')}
                onOpenUser={() => openSection('UserPanel')}
                onOpenSettings={() => openSection('settings')}
                onOpenWidgets={() => setShowWidgetSettings(true)}
                onPin={handlePin}
                onHide={handleHide}
                onRestoreHidden={resetHidden}
                onTopSecretTap={() => handleClick(true)}
                onBottomSecretTap={() => handleClick(false)}
                getInfo={getInfo}
            />
        </>
    )
}

function buildMainMenuSummary(lang, visibleItems, heroWidgetIds = ['HabitsMain', 'TrainingMain', 'MentalMain']) {
    const todayKey = new Date().toISOString().split('T')[0];
    const chosenHabits = AppData.choosenHabits || [];
    const chosenHabitIds = new Set(chosenHabits.map((id) => String(id)));
    const todayHabits = AppData.habitsByDate?.[todayKey] || {};
    const totalHabits = chosenHabits.length;
    const doneHabits = Object.entries(todayHabits).filter(([id, status]) => {
        const isTracked = chosenHabitIds.size === 0 || chosenHabitIds.has(String(id));
        return isTracked && status > 0;
    }).length;

    let trainingAnalysis = { currentTonnage: 0, progressPercent: 0, currentCycle: [] };
    try {
        trainingAnalysis = getCurrentCycleAnalysis();
    } catch (error) {
        console.warn('Main menu training summary failed', error);
    }
    const tonnageT = trainingAnalysis.currentTonnage ? trainingAnalysis.currentTonnage / 1000 : 0;
    const mentalTotal = Array.isArray(AppData.mentalRecords)
        ? AppData.mentalRecords.flat().reduce((sum, value) => sum + (Number(value) || 0), 0)
        : 0;
    const todoCount = AppData.todoList?.length || 0;
    const sleepValue = getTodaySleepHours();
    const sleepEntry = AppData.sleepingLog?.[todayKey];
    const sleepDuration = typeof sleepEntry?.duration === 'number' ? sleepEntry.duration : 0;
    const recoveryCount = getTodaySessionCount();
    const sectionIds = ['habits', 'training', 'mental', 'recovery', 'sleep', 'todo'];
    const bestStreak = Math.max(0, ...sectionIds.map((id) => getSectionStreak(id)));
    const firstVisibleSection = visibleItems.find((item) => item.icon)?.id || 'HabitsMain';
    const hour = new Date().getHours();
    const greeting = lang === 0
        ? (hour < 5 ? 'Доброй ночи' : hour < 12 ? 'Доброе утро' : hour < 18 ? 'Добрый день' : 'Добрый вечер')
        : (hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');

    const metricMap = {
        HabitsMain: {
            id: 'HabitsMain',
            label: lang === 0 ? 'Привычки' : 'Habits',
            value: totalHabits > 0 ? `${doneHabits}/${totalHabits}` : '0/0',
            progress: totalHabits > 0 ? doneHabits / totalHabits : 0
        },
        TrainingMain: {
            id: 'TrainingMain',
            label: lang === 0 ? 'Тоннаж' : 'Volume',
            value: tonnageT > 0 ? `${tonnageT.toFixed(1)} ${lang === 0 ? 'т' : 't'}` : '—',
            progress: Math.min(1, (trainingAnalysis.progressPercent || 0) / 100)
        },
        MentalMain: {
            id: 'MentalMain',
            label: lang === 0 ? 'Мозг' : 'Brain',
            value: mentalTotal > 0 ? `${(mentalTotal / 1000).toFixed(1)}k` : '—',
            progress: Math.min(1, mentalTotal / 5000)
        },
        RecoveryMain: {
            id: 'RecoveryMain',
            label: lang === 0 ? 'Восстановление' : 'Recovery',
            value: recoveryCount > 0 ? recoveryCount.toString() : '0',
            progress: Math.min(1, recoveryCount / 3)
        },
        SleepMain: {
            id: 'SleepMain',
            label: lang === 0 ? 'Сон' : 'Sleep',
            value: sleepValue || '—',
            progress: Math.min(1, sleepDuration / (8 * 60 * 60 * 1000))
        },
        ToDoMain: {
            id: 'ToDoMain',
            label: lang === 0 ? 'Задачи' : 'Tasks',
            value: todoCount > 0 ? todoCount.toString() : '0',
            progress: Math.min(1, todoCount / 5)
        }
    };
    const selectedStats = (Array.isArray(heroWidgetIds) && heroWidgetIds.length > 0 ? heroWidgetIds : ['HabitsMain', 'TrainingMain', 'MentalMain'])
        .map((id) => metricMap[id])
        .filter(Boolean)
        .slice(0, 3);
    const progressItems = selectedStats.filter((item) => typeof item.progress === 'number');
    const summaryProgress = progressItems.length
        ? progressItems.reduce((sum, item) => sum + item.progress, 0) / progressItems.length
        : 0;

    const hasActivity = totalHabits > 0 || tonnageT > 0 || mentalTotal > 0 || todoCount > 0 || recoveryCount > 0 || sleepValue;
    let focus = {
        targetId: firstVisibleSection,
        empty: true,
        status: lang === 0 ? 'БЫСТРЫЙ СТАРТ' : 'QUICK START',
        title: lang === 0 ? 'Начнём?' : 'Ready to start?',
        meta: lang === 0 ? 'Выбери первую категорию, чтобы настроить день.' : 'Choose a section to set up your day.'
    };

    if (bestStreak > 0) {
        focus = {
            targetId: 'HabitsMain',
            empty: false,
            status: lang === 0 ? 'СЕРИЯ ДНЕЙ' : 'STREAK',
            title: lang === 0 ? `${bestStreak} дней подряд` : `${bestStreak} days in a row`,
            meta: lang === 0 ? 'Лучший активный ритм сегодня' : 'Your active rhythm today'
        };
    } else if (tonnageT > 0) {
        focus = {
            targetId: 'TrainingMain',
            empty: false,
            status: lang === 0 ? 'ТРЕНИРОВКИ' : 'TRAINING',
            title: lang === 0 ? `${tonnageT.toFixed(1)} т в цикле` : `${tonnageT.toFixed(1)} t this cycle`,
            meta: lang === 0 ? `${trainingAnalysis.currentCycle?.length || 0} сессий в текущем цикле` : `${trainingAnalysis.currentCycle?.length || 0} sessions this cycle`
        };
    } else if (todoCount > 0) {
        focus = {
            targetId: 'ToDoMain',
            empty: false,
            status: lang === 0 ? 'ЗАДАЧИ' : 'TASKS',
            title: lang === 0 ? `${todoCount} активных задач` : `${todoCount} active tasks`,
            meta: lang === 0 ? 'Открой список и закрой важное' : 'Open the list and close the important items'
        };
    } else if (hasActivity) {
        focus = {
            targetId: firstVisibleSection,
            empty: false,
            status: lang === 0 ? 'СЕГОДНЯ' : 'TODAY',
            title: lang === 0 ? 'День уже начался' : 'Your day has started',
            meta: lang === 0 ? 'Продолжай в активном разделе' : 'Continue in an active section'
        };
    }

    return {
        hero: {
            name: UserData.name || (lang === 0 ? 'гость' : 'guest'),
            greeting,
            streak: bestStreak,
            habitsValue: totalHabits > 0 ? `${doneHabits}/${totalHabits}` : '0/0',
            trainingValue: tonnageT > 0 ? `${tonnageT.toFixed(1)} ${lang === 0 ? 'т' : 't'}` : '—',
            mentalValue: mentalTotal > 0 ? `${(mentalTotal / 1000).toFixed(1)}k` : '—',
            stats: selectedStats,
            progressLabel: lang === 0 ? 'Сводка выбранных метрик' : 'Selected metrics',
            progressValue: summaryProgress,
            rings: {
                habits: totalHabits > 0 ? doneHabits / totalHabits : 0,
                training: Math.min(1, (trainingAnalysis.progressPercent || 0) / 100),
                mental: Math.min(1, mentalTotal / 5000)
            }
        },
        focus
    };
}

function AIInsightButton({ theme, lang, onClick }) {
    const isDark = theme === 'dark';
    const mainColor = '#00E5FF';

    return (
        <Motion.div
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
        </Motion.div>
    );
}
function ReferalButton({ theme, lang, onClick }) {
    const isDark = theme === 'dark';
    const mainColor = '#ffd500';

    return (
        <Motion.div
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
        </Motion.div>
    );
}
function MenuCard({ item, theme, fSize, lang, isPinned, onPin, onHide,setShowReferralModal, showInfo }) {
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
        backgroundColor: !item.icon ? 'transparent' : Colors.get('simplePanel', theme),
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
        <Motion.div
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
                {showInfo && <Info id = {item.id} theme={theme} lang={lang} />}
                
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

            
        </Motion.div>
    );
}

const Info = ({ id, theme, lang }) => {
  const info = getInfo(id, lang);

  return (
    <div
      style={{
        width:'13vw',
        padding: '4px 10px',
        backgroundColor:
          theme === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.05)',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        color: Colors.get('mainText', theme),

      }}
    >
      {info.length > 0 ? info : '-'}
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
        flex: 1,
        minHeight: 0,
        overflowY: "scroll",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: 'calc(70px + 7vw + env(safe-area-inset-bottom, 0px) + 24px)',
        boxSizing: 'border-box'
    },
    grid: {
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px', 
        marginTop: '5px'
    },
    widgetSettingsBtn: {
        width: '92%',
        minHeight: '42px',
        borderRadius: '18px',
        border: `1px solid ${Colors.get('border', theme)}55`,
        background: Colors.get('simplePanel', theme),
        color: Colors.get('mainText', theme),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        fontFamily: 'Segoe UI',
        fontSize: fontSize === 0 ? '13px' : '15px',
        fontWeight: '800',
        marginBottom: '10px',
        cursor: 'pointer'
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

function getInfo(id) {
    const sectionMap = { HabitsMain: 'habits', ToDoMain: 'todo', MentalMain: 'mental', RecoveryMain: 'recovery', TrainingMain: 'training', SleepMain: 'sleep' };
    const sectionId = sectionMap[id];
    const streak = sectionId ? getSectionStreak(sectionId) : 0;
    if (streak > 0) return `${streak}🔥`;
    if (id === 'HabitsMain') return AppData.choosenHabits.length > 0 ? AppData.choosenHabits.length.toString() : '';
    else if (id === 'TrainingMain') {
        const tonnage = getCurrentCycleAnalysis().currentTonnage;
        return tonnage > 0 ? (tonnage / 1000).toFixed(1) + (AppData.prefs[0] === 0 ? 'т' : 't') : '';
    }
    else if (id === 'ToDoMain') return AppData.todoList.length > 0 ? AppData.todoList.length.toString() : '';
    else if (id === 'SleepMain') return getTodaySleepHours().toString();
    else if (id === 'RecoveryMain') return getTodaySessionCount().toString();
    else if (id === 'MentalMain') return getMentalScoresSummary().toString();

    return '';
}
function getTodaySleepHours() {
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

const WidgetSettingsModal = ({ isOpen, onClose, items, sectionStates, heroValues, onToggleHeroWidget, onToggleSectionVisibility, theme, lang }) => {
    const isDark = theme === 'dark';
    const bg = Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const selectedHeroIds = Array.isArray(heroValues) && heroValues.length > 0 ? heroValues : ['HabitsMain', 'TrainingMain', 'MentalMain'];
    const [activePanel, setActivePanel] = useState('hero');
    const visibleSectionsCount = items.filter(item => !sectionStates[item.id]?.hidden).length;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(6px)',
                            zIndex: 1800
                        }}
                    />
                    <Motion.div
                        initial={{ y: 40, opacity: 0, scale: 0.98 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 40, opacity: 0, scale: 0.98 }}
                        transition={{ type: 'spring', damping: 23, stiffness: 260 }}
                        style={{
                            position: 'fixed',
                            left: '4%',
                            right: '4%',
                            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
                            maxWidth: '560px',
                            margin: '0 auto',
                            borderRadius: '26px',
                            padding: '18px',
                            background: isDark ? 'rgba(20,20,22,0.94)' : 'rgba(255,255,255,0.96)',
                            border: `1px solid ${Colors.get('border', theme)}66`,
                            boxShadow: isDark ? '0 28px 80px rgba(0,0,0,0.72)' : '0 24px 70px rgba(0,0,0,0.2)',
                            zIndex: 1801,
                            maxHeight: '80vh',
                            overflowY: 'auto',
                            boxSizing: 'border-box'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                                color: '#4DA6FF',
                                flexShrink: 0
                            }}>
                                <FaSlidersH />
                            </div>
                            <div>
                                <div style={{ color: text, fontSize: '17px', fontWeight: 900 }}>
                                    {lang === 0 ? 'Настройка меню' : 'Menu setup'}
                                </div>
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                            gap: 4,
                            padding: 4,
                            borderRadius: 16,
                            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.045)',
                            marginBottom: 12
                        }}>
                            {[
                                { id: 'hero', label: lang === 0 ? 'Карточка' : 'Card', count: `${selectedHeroIds.length}/3` },
                                { id: 'sections', label: lang === 0 ? 'Разделы' : 'Sections', count: `${visibleSectionsCount}/${items.length}` }
                            ].map(tab => {
                                const active = activePanel === tab.id;
                                return (
                                    <Motion.button
                                        key={tab.id}
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setActivePanel(tab.id)}
                                        style={{
                                            minHeight: 38,
                                            borderRadius: 12,
                                            border: 'none',
                                            background: active ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.95)') : 'transparent',
                                            color: active ? text : sub,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 7,
                                            fontSize: 13,
                                            fontWeight: 900,
                                            fontFamily: 'inherit',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span>{tab.label}</span>
                                        <span style={{
                                            color: active ? '#111' : sub,
                                            background: active ? '#FFD700' : 'transparent',
                                            border: `1px solid ${active ? '#FFD700' : Colors.get('border', theme)}88`,
                                            borderRadius: 999,
                                            padding: '2px 7px',
                                            fontSize: 10,
                                            fontWeight: 900
                                        }}>{tab.count}</span>
                                    </Motion.button>
                                );
                            })}
                        </div>

                        {activePanel === 'hero' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 7 }}>
                                    {[0, 1, 2].map((slotIndex) => {
                                        const selectedId = selectedHeroIds[slotIndex];
                                        const selectedItem = items.find((item) => item.id === selectedId);
                                        return (
                                            <div
                                                key={slotIndex}
                                                style={{
                                                    minHeight: 38,
                                                    borderRadius: 13,
                                                    border: `1px solid ${selectedItem ? selectedItem.color : Colors.get('border', theme)}66`,
                                                    background: selectedItem ? `${selectedItem.color}18` : bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 6,
                                                    padding: '7px 8px',
                                                    boxSizing: 'border-box'
                                                }}
                                            >
                                                <div style={{ color: selectedItem ? selectedItem.color : sub, fontSize: 10, fontWeight: 900, flexShrink: 0 }}>
                                                    {slotIndex + 1}
                                                </div>
                                                <div style={{ color: selectedItem ? text : sub, fontSize: 11, fontWeight: 850, maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {selectedItem ? selectedItem.title : (lang === 0 ? 'Пусто' : 'Empty')}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {items.map(item => {
                                    const enabled = selectedHeroIds.includes(item.id);
                                    const disabledByLimit = !enabled && selectedHeroIds.length >= 3;
                                    return (
                                        <Motion.button
                                            key={`hero-${item.id}`}
                                            type="button"
                                            whileTap={disabledByLimit ? undefined : { scale: 0.985 }}
                                            onClick={() => { if (!disabledByLimit) onToggleHeroWidget(item.id); }}
                                            style={{
                                                minHeight: 52,
                                                borderRadius: 17,
                                                border: `1px solid ${enabled ? item.color : Colors.get('border', theme)}66`,
                                                background: enabled ? `${item.color}18` : bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 11,
                                                padding: '10px 12px',
                                                cursor: disabledByLimit ? 'not-allowed' : 'pointer',
                                                textAlign: 'left',
                                                opacity: disabledByLimit ? 0.38 : 1
                                            }}
                                        >
                                            <div style={{ color: item.color, width: 25, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                                {React.cloneElement(item.icon, { size: 18 })}
                                            </div>
                                            <div style={{ color: text, fontSize: 14, fontWeight: 850, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.title}
                                            </div>
                                            <div style={{
                                                minWidth: 32,
                                                height: 28,
                                                padding: enabled ? '0 9px' : 0,
                                                borderRadius: 11,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: enabled ? item.color : 'transparent',
                                                color: enabled ? '#111' : sub,
                                                border: enabled ? 'none' : `1px solid ${Colors.get('border', theme)}77`,
                                                flexShrink: 0,
                                                fontSize: 13,
                                                fontWeight: 900
                                            }}>
                                                {enabled ? selectedHeroIds.indexOf(item.id) + 1 : '+'}
                                            </div>
                                        </Motion.button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                                {items.map(item => {
                                    const enabled = !sectionStates[item.id]?.hidden;
                                    return (
                                        <Motion.button
                                            key={item.id}
                                            type="button"
                                            whileTap={{ scale: 0.985 }}
                                            onClick={() => onToggleSectionVisibility(item.id)}
                                            style={{
                                                minHeight: 52,
                                                borderRadius: 17,
                                                border: `1px solid ${enabled ? item.color : Colors.get('border', theme)}66`,
                                                background: enabled ? `${item.color}16` : bg,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 11,
                                                padding: '10px 12px',
                                                cursor: 'pointer',
                                                textAlign: 'left',
                                                opacity: enabled ? 1 : 0.58
                                            }}
                                        >
                                            <div style={{ color: item.color, width: 25, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                                                {React.cloneElement(item.icon, { size: 18 })}
                                            </div>
                                            <div style={{ color: text, fontSize: 14, fontWeight: 850, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.title}
                                            </div>
                                            <div style={{
                                                width: 46,
                                                height: 26,
                                                borderRadius: 999,
                                                padding: 3,
                                                background: enabled ? item.color : 'transparent',
                                                border: enabled ? 'none' : `1px solid ${Colors.get('border', theme)}88`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: enabled ? 'flex-end' : 'flex-start',
                                                flexShrink: 0,
                                                boxSizing: 'border-box'
                                            }}>
                                                <div style={{
                                                    width: 20,
                                                    height: 20,
                                                    borderRadius: 999,
                                                    background: enabled ? '#111' : sub,
                                                    opacity: enabled ? 1 : 0.72
                                                }} />
                                            </div>
                                        </Motion.button>
                                    );
                                })}
                            </div>
                        )}
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const ReferralModal = ({ isOpen, onClose, onSend, theme, lang }) => {
    const bg = Colors.get('simplePanel', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    // Modern Gradient for the icon background
    const iconGradient = 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <Motion.div
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
                    <Motion.div
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
                        <Motion.div
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
                        </Motion.div>

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
                            <Motion.button
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
                            </Motion.button>

                            <Motion.button
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
                            </Motion.button>
                        </div>
                    </Motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
