import './App.css'
import { AppData, UserData } from './assets/StaticClasses/AppData';
import { useState,useEffect, Suspense, lazy, use} from 'react';
import MainBtns from './assets/Pages/MainBtns'
import BtnsHabits from './assets/Pages/BottomBtns/BtnsHabits'
import BtnsTraining from './assets/Pages/BottomBtns/BtnsTraining'
import BtnsRecovery from './assets/Pages/BottomBtns/BtnsRecovery'
import BtnsMental from './assets/Pages/BottomBtns/BtnsMental'
import BtnsSleep from './assets/Pages/BottomBtns/BtnsSleep'
import BtnsToDo from './assets/Pages/BottomBtns/ToDoBtns'
import BtnsRobot from './assets/Pages/BottomBtns/BtnsRobot'
import NotifyPanel from './assets/Pages/NotifyPanel'
import BtnsMenu from './assets/Pages/BottomBtns/BtnsMenu';
import BtnsInfo from './assets/Pages/BottomBtns/BtnsInfo';
import {
  addPanel$,
  setPage$,
  theme$,
  bottomBtnPanel$,
  keyboardVisible$,
  notifyPanel$,
  isServerAvailable$,
  confirmationPanel$,
  setKeyboardVisible,
  setPage as navigateToPage,
  lastPage$,
  setAddPanel as publishAddPanel,
  setNotifyPanel as publishNotifyPanel,
  setConfirmationPanel as publishConfirmationPanel,
} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { FaServer, FaCog, FaTools } from 'react-icons/fa';
import { maybeSeedDemoData } from './assets/StaticClasses/DemoSeed';
import { applyPerformanceClasses, getDevicePerformanceProfile } from './assets/StaticClasses/PerformanceMode';
const HabitCalendar = lazy(() => import('./assets/Pages/HabitsPages/HabitCalendar'));
const HabitMetrics = lazy(() => import('./assets/Pages/HabitsPages/HabitMetrics'));
const HabitsInsight = lazy(() => import('./assets/Pages/HabitsPages/HabitsInsight'));
const HabitsMain = lazy(() => import('./assets/Pages/HabitsPages/HabitsMain'));
const MainMenu = lazy(() => import('./assets/Pages/MainMenu'));
const LoadPanel = lazy(() => import('./assets/Pages/LoadPanel'));
const ProfileOnboarding = lazy(() => import('./assets/Pages/ProfileOnboarding'));
const ConfirmationPanel = lazy(() => import('./assets/Pages/ConfirmationPanel'));
const AddHabitPanel = lazy(() => import('./assets/Pages/HabitsPages/AddHabitPanel')); 
const TrainingMain = lazy(() => import('./assets/Pages/TrainingPages/TrainingMain'));
const TrainingExercise = lazy(() => import('./assets/Pages/TrainingPages/TrainingExercise'));
const TrainingProgramm = lazy(() => import('./assets/Pages/TrainingPages/TrainingProgramms'));
const TrainingCurrent = lazy(() => import('./assets/Pages/TrainingPages/TrainingCurrent'));
const TrainingCardio = lazy(() => import('./assets/Pages/TrainingPages/TrainingCardio'));
const TrainingMesurments = lazy(() => import('./assets/Pages/TrainingPages/TrainingMesurments'));
const TrainingAnaliticsMain = lazy(() => import('./assets/Pages/TrainingPages/Analitics/TrainingAnaliticsMain'));
const TrainingAnaliticsTypes = lazy(() => import('./assets/Pages/TrainingPages/Analitics/TrainingAnaliticsTypes'));
const TrainingAnaliticsCardio = lazy(() => import('./assets/Pages/TrainingPages/Analitics/TrainingAnaliticsCardio'));
const TrainingList = lazy(() => import('./assets/Pages/TrainingPages/TrainingList'));
const TrainingInsight = lazy(() => import('./assets/Pages/TrainingPages/TrainingInsight'));
const Premium = lazy(() => import('./assets/Pages/Premium'));
const RecoveryMain = lazy(() => import('./assets/Pages/Recovery/RecoveryMain'));
const RecoveryInsight = lazy(() => import('./assets/Pages/Recovery/RecoveryInsight'));
const BreathingMain = lazy(() => import('./assets/Pages/Recovery/RecoveryCategories'));
const RecoveryAnalytics = lazy(() => import('./assets/Pages/Recovery/RecoveryAnalitics')); 
const ToDoMain = lazy(() => import('./assets/Pages/ToDoPages/ToDoMain'));
const ToDoMetrics = lazy(() => import('./assets/Pages/ToDoPages/ToDoMetrics'));
const ToDoNew = lazy(() => import('./assets/Pages/ToDoPages/ToDoNew'));
const ToDoPage = lazy(() => import('./assets/Pages/ToDoPages/ToDoPage'));
const ToDoInsight = lazy(() => import('./assets/Pages/ToDoPages/ToDoInsight'));
const ToDoCollab = lazy(() => import('./assets/Pages/ToDoPages/ToDoCollab'));
const SleepNew = lazy(() => import('./assets/Pages/SleepPages/SleepNew'));
const RobotMain = lazy(() => import('./assets/Pages/Robot/RobotMain'));
const UserPanel = lazy(() => import('./assets/Pages/UserPanel'));
const MentalMain = lazy(() => import('./assets/Pages/MentalPages/MentalMain'));
const MentalInsight = lazy(() => import('./assets/Pages/MentalPages/MentalInsight'));
const MentalProgress = lazy(() => import('./assets/Pages/MentalPages/MentalProgress'));
const MathMain = lazy(() => import('./assets/Pages/MentalPages/MathMain'));
const MemoryMain = lazy(() => import('./assets/Pages/MentalPages/MemoryMain'));
const LogicMain = lazy(() => import('./assets/Pages/MentalPages/LogicMain'));
const FocusMain = lazy(() => import('./assets/Pages/MentalPages/FocusMain'));
const Records = lazy(() => import('./assets/Pages/MentalPages/Records'));
const InfoPanel = lazy(() => import('./assets/Pages/InfoPanel'));
const Settings = lazy(() => import('./assets/Pages/Settings'));
const AddExercisePanel = lazy(() => import('./assets/Pages/TrainingPages/AddExercisePanel'));

const SleepMetrics = lazy(() => import('./assets/Pages/SleepPages/SleepMetrics'));
const SleepMain = lazy(() => import('./assets/Pages/SleepPages/SleepMain'));
const SleepDevices = lazy(() => import('./assets/Pages/SleepPages/SleepDevices'));
const SleepInsight = lazy(() => import('./assets/Pages/SleepPages/SleepInsight'));

const tg = window.Telegram?.WebApp;
const SECTION_ROOT_PAGES = new Set([
  'HabitsMain',
  'TrainingMain',
  'RecoveryMain',
  'MentalMain',
  'SleepMain',
  'ToDoMain',
  'RobotMain',
]);

const getBottomPanelForPage = (page) => {
  if (!page || page === 'LoadPanel') return '';
  if (page.startsWith('Habit') || page.startsWith('Habits')) return 'BtnsHabits';
  if (page.startsWith('Training')) return 'BtnsTraining';
  if (page.startsWith('Recovery')) return 'BtnsRecovery';
  if (page.startsWith('Mental')) return 'BtnsMental';
  if (page.startsWith('Sleep')) return 'BtnsSleep';
  if (page.startsWith('ToDo')) return 'BtnsToDo';
  if (page.startsWith('Robot')) return 'BtnsRobot';
  if (page.startsWith('Info')) return 'BtnsInfo';
  return 'BtnsMenu';
};

function App() {
  const [page, setPageState] = useState('LoadPanel');
  const [addPanel, setAddPanel] = useState('');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [bottomBtnPanel, setBottomBtnPanel] = useState('');
  const [keyboardVisible, setKeyboardVisibleState] = useState(false);
  const [notifyPanel, setNotifyPanelState] = useState(false);
  const [isTechicalWorks, setIsTechicalWorks] = useState(false);
  const [performanceProfile] = useState(getDevicePerformanceProfile);
  const lang = AppData.prefs[0];
  

  
  const [clickCount, setClickCount] = useState(0);
  const [clickCountUp, setClickCountUp] = useState(0);

  const handleClick = (isUp) => {
        if (isUp) {
            setClickCountUp(clickCountUp + 1);
        } else {
            setClickCount(clickCount + 1);
        }
        if (clickCount === 8 && clickCountUp === 4) {
            setIsTechicalWorks(false);
        }
    }
  // need to remove at production
  useEffect(() => {
    const subscription = isServerAvailable$.subscribe(setIsTechicalWorks);  
    return () => 
    {
      subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    if (page === 'LoadPanel') return;
    maybeSeedDemoData().then((seeded) => {
      if (seeded) window.location.reload();
    });
  }, [page]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    applyPerformanceClasses();

    return () => {
      document.documentElement.classList.remove('uml-performance-lite');
      document.documentElement.classList.remove('uml-android-lite');
      document.documentElement.classList.remove('uml-tablet-lite');
    };
  }, []);

  // ... rest of your useEffects (subscriptions) — keep these
  useEffect(() => {
    const subscription = addPanel$.subscribe(setAddPanel);  
    return () => 
    {
      subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    const subscription = notifyPanel$.subscribe(setNotifyPanelState);  
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = setPage$.subscribe(setPageState);  
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = theme$.subscribe(setTheme);  
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = bottomBtnPanel$.subscribe(setBottomBtnPanel);  
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const subscription = keyboardVisible$.subscribe(setKeyboardVisibleState);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const viewport = window.visualViewport;
    let stableHeight = Math.max(window.innerHeight || 0, viewport?.height || 0);
    const shouldDetectKeyboard = ['ios', 'android'].includes(window.Telegram?.WebApp?.platform)
      || navigator.maxTouchPoints > 1;

    const updateViewportHeight = () => {
      const currentHeight = viewport?.height || window.innerHeight;
      stableHeight = Math.max(stableHeight, window.innerHeight || 0, currentHeight || 0);
      document.documentElement.style.setProperty('--app-viewport-height', `${Math.round(currentHeight)}px`);
      setKeyboardVisible(shouldDetectKeyboard && stableHeight - currentHeight > 140);
    };

    updateViewportHeight();
    viewport?.addEventListener('resize', updateViewportHeight);
    viewport?.addEventListener('scroll', updateViewportHeight);
    window.addEventListener('resize', updateViewportHeight);

    return () => {
      viewport?.removeEventListener('resize', updateViewportHeight);
      viewport?.removeEventListener('scroll', updateViewportHeight);
      window.removeEventListener('resize', updateViewportHeight);
    };
  }, []);

  useEffect(() => {
    const subscription = confirmationPanel$.subscribe(setConfirmationPanel);
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const expectedBottomPanel = getBottomPanelForPage(page);
    if (expectedBottomPanel && bottomBtnPanel !== expectedBottomPanel) {
      bottomBtnPanel$.next(expectedBottomPanel);
    }
  }, [page, bottomBtnPanel]);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    const backButton = webApp?.BackButton;
    if (!backButton) return;

    const canGoBack = page && page !== 'LoadPanel' && page !== 'MainMenu';
    const hasOverlay = Boolean(addPanel);
    const shouldShowBackButton = canGoBack || hasOverlay || notifyPanel || confirmationPanel;

    if (shouldShowBackButton) backButton.show?.();
    else backButton.hide?.();

    const handleTelegramBack = () => {
      if (confirmationPanel) {
        return publishConfirmationPanel(false);
      }

      if (notifyPanel) {
        return publishNotifyPanel(false);
      }

      if (addPanel) {
        return publishAddPanel('');
      }

      if (SECTION_ROOT_PAGES.has(page)) {
        return navigateToPage('MainMenu');
      }

      const previousPage = lastPage$.value;
      navigateToPage(previousPage && previousPage !== page ? previousPage : 'MainMenu');
    };

    backButton.onClick(handleTelegramBack);
    return () => {
      backButton.offClick?.(handleTelegramBack);
    };
  }, [addPanel, confirmationPanel, notifyPanel, page]);

  return (
    <MotionConfig reducedMotion="user" transition={{ duration: performanceProfile.performanceLite ? 0.14 : 0.18, ease: 'easeOut' }}>
      {
        isTechicalWorks && 
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // Block clicks
            style={{
                position: 'fixed', // Fixed ensures it covers the whole screen even if scrolled
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(12px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Segoe UI, sans-serif'
            }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                    width: '85%',
                    maxWidth: '320px',
                    padding: '30px 20px',
                    borderRadius: '32px',
                    backgroundColor: theme === 'dark' ? 'rgba(30, 30, 35, 0.9)' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
              <div style={{ height: '2vh', width: '100%' }} onClick={() => {handleClick(true)}} ></div>
                {/* Decorative Top Glow */}
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                    background: 'linear-gradient(90deg, #007AFF, #00C6FF)',
                    boxShadow: '0 0 15px rgba(0, 122, 255, 0.5)'
                }} />

                {/* Animated Icon Container */}
                <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '20px' }}>
                    {/* Static Server Icon */}
                    <FaServer size={50} color={Colors.get('subText', theme)} style={{ opacity: 0.3, position: 'absolute', top: '15px', left: '15px' }} />
                    
                    {/* Spinning Gears */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        style={{ position: 'absolute', top: 0, right: 0 }}
                    >
                        <FaCog size={34} color="#007AFF" />
                    </motion.div>
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                        style={{ position: 'absolute', bottom: 0, left: 0 }}
                    >
                        <FaCog size={24} color="#00C6FF" />
                    </motion.div>
                </div>

                {/* Title */}
                <h3 style={{ 
                    margin: '0 0 10px 0', 
                    fontSize: '20px', 
                    fontWeight: '700', 
                    color: Colors.get('mainText', theme) 
                }}>
                    {lang === 0 ? 'Технические работы' : 'Server Maintenance'}
                </h3>

                {/* Subtitle */}
                <p style={{ 
                    margin: '0', 
                    fontSize: '14px', 
                    color: Colors.get('subText', theme), 
                    lineHeight: '1.5',
                    maxWidth: '90%'
                }}>
                    {lang === 0 
                        ? 'Мы обновляем сервер, чтобы сделать приложение лучше. Пожалуйста, зайдите позже.' 
                        : 'We are upgrading our servers to make the app better. Please try again a bit later.'}
                </p>

                {/* Pulse Indicator */}
                <div style={{ 
                    marginTop: '25px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '6px 12px',
                    backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F5F5F7',
                    borderRadius: '20px'
                }}>
                    <span style={{ position: 'relative', display: 'flex', width: '8px', height: '8px' }}>
                        <motion.span 
                            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            style={{ position: 'absolute', inline: 0, width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#007AFF' }}
                        />
                        <span style={{ position: 'relative', inline: 0, width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#007AFF' }} />
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#007AFF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {lang === 0 ? 'В процессе' : 'In Progress'}
                    </span>
                </div>
             <div style={{ height: '2vh', width: '100%' }} onClick={() => {handleClick(false)}} ></div>
            </motion.div>
        </motion.div>
    
      }
      {page !== 'LoadPanel' && page !== 'MainMenu' && page !== 'ProfileOnboarding' && page !== 'HabitsMain' && page !== 'HabitCalendar' && page !== 'HabitMetrics' && page !== 'HabitsInsight' && page !== 'AddHabitPanel' && page !== 'ToDoMain' && page !== 'ToDoMetrics' && page !== 'ToDoInsight' && page !== 'ToDoCollab' && page !== 'ToDoNew' && page !== 'ToDoPage' && page !== 'SleepMain' && page !== 'SleepMetrics' && page !== 'SleepDevices' && page !== 'SleepInsight' && page !== 'SleepNew' && page !== 'MentalMain' && page !== 'MentalInsight' && page !== 'MentalProgress' && page !== 'MentalMath' && page !== 'MentalMemory' && page !== 'MentalLogic' && page !== 'MentalFocus' && page !== 'AddExercisePanel' && page !== 'TrainingInsight' && page !== 'RecoveryInsight' && page !== 'RobotMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <MainBtns/>
      </Suspense>}
      
      {page === 'LoadPanel' && <LoadPanel/>}
      {page !== 'LoadPanel' && <>
      {page === 'ProfileOnboarding' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ProfileOnboarding/>
      </Suspense>}
      {page === 'MainMenu' && <MainMenu/>}
      {page === 'HabitsMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <HabitsMain />
      </Suspense>}
      {page === 'HabitCalendar' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <HabitCalendar />
      </Suspense>}
      {page === 'HabitMetrics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <HabitMetrics />
      </Suspense>}
      {page === 'HabitsInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <HabitsInsight />
      </Suspense>}
      {page === 'AddHabitPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <AddHabitPanel/>
      </Suspense>}
      {page === 'TrainingCurrent' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingCurrent/>
      </Suspense>}
      {page === 'TrainingCardio' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingCardio/>
      </Suspense>}
      {page === 'TrainingMesurments' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingMesurments/>
      </Suspense>}
      {notifyPanel && <NotifyPanel/>}
      {confirmationPanel && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <ConfirmationPanel/>
      </Suspense>}
      {page === 'TrainingMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingMain/>
      </Suspense>}
      {page === 'TrainingAnaliticsMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingAnaliticsMain/>
      </Suspense>}
      {page === 'TrainingAnaliticsTypes' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingAnaliticsTypes/>
      </Suspense>}
      {page === 'TrainingAnaliticsCardio' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingAnaliticsCardio/>
      </Suspense>}
      {page === 'TrainingList' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingList/>
      </Suspense>}
      {page === 'TrainingExercise' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingExercise needToAdd={false}/>
      </Suspense>}
      {page === 'TrainingProgramm' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingProgramm/>
      </Suspense>}
      {page === 'TrainingInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <TrainingInsight/>
      </Suspense>}
      {page === 'premium' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <Premium/>
      </Suspense>}
      {page === 'RecoveryMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <RecoveryMain/>
      </Suspense>}
      {page === 'RecoveryInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <RecoveryInsight/>
      </Suspense>}
      {page === 'MentalMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MentalMain/>
      </Suspense>}
      {page === 'MentalInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <MentalInsight/>
      </Suspense>}
      {page === 'MentalProgress' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <MentalProgress/>
      </Suspense>}
        {page === 'RecoveryBreath' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
          <BreathingMain/>
        </Suspense>}
        {page === 'RecoveryAnalitics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
          <RecoveryAnalytics/>
        </Suspense>}
      {page === 'MentalMath' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MathMain/>
      </Suspense>}
      {page === 'MentalMemory' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MemoryMain/>
      </Suspense>}
      {page === 'MentalLogic' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <LogicMain/>
      </Suspense>}
      {page === 'MentalFocus' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <FocusMain/>
      </Suspense>}
      {page === 'MentalRecords' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <Records/>
      </Suspense>}
      {page === 'SleepMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <SleepMain/>
      </Suspense>}
      {page === 'SleepMetrics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <SleepMetrics/>
      </Suspense>}
      {page === 'SleepDevices' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <SleepDevices/>
      </Suspense>}
      {page === 'SleepInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <SleepInsight/>
      </Suspense>}
      {page === 'ToDoMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <ToDoMain/>
      </Suspense>}
      {page === 'RobotMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <RobotMain/>
      </Suspense>}
      {page === 'ToDoMetrics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ToDoMetrics/>
      </Suspense>}
      {page === 'ToDoInsight' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ToDoInsight/>
      </Suspense>}
      {page === 'ToDoCollab' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ToDoCollab/>
      </Suspense>}
      {page === 'ToDoNew' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ToDoNew/>
      </Suspense>}
      {page === 'ToDoPage' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <ToDoPage/>
      </Suspense>}
      {page === 'SleepNew' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <SleepNew/>
      </Suspense>}
      {page === 'UserPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <UserPanel/>
      </Suspense>}
      {page === 'InfoPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <InfoPanel/>
      </Suspense>}
      {page === 'settings' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <Settings/>
      </Suspense>}
      {page === 'AddExercisePanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}>
        <AddExercisePanel/>
      </Suspense>}
      </>}

      {page !== 'ProfileOnboarding' && page !== 'AddHabitPanel' && page !== 'ToDoNew' && page !== 'SleepNew' && page !== 'AddExercisePanel' && page !== 'RobotMain' && <>
        {bottomBtnPanel === 'BtnsHabits' &&  !keyboardVisible && <BtnsHabits/>}
        {bottomBtnPanel === 'BtnsTraining' && !keyboardVisible && <BtnsTraining/>}
        {bottomBtnPanel === 'BtnsRecovery' && !keyboardVisible && <BtnsRecovery/>}
        {bottomBtnPanel === 'BtnsMental' && !keyboardVisible && <BtnsMental/>}
        {bottomBtnPanel === 'BtnsSleep' && !keyboardVisible && <BtnsSleep/>}
        {bottomBtnPanel === 'BtnsToDo' && !keyboardVisible && <BtnsToDo/>}
        {bottomBtnPanel === 'BtnsRobot' && !keyboardVisible && <BtnsRobot/>}
        {bottomBtnPanel === 'BtnsMenu' && page !== 'MainMenu' && !keyboardVisible && <BtnsMenu/>}
        {bottomBtnPanel === 'BtnsInfo' && !keyboardVisible && <BtnsInfo/>}
      </>}
    </MotionConfig>
  )
}
const SuspenseSpinner = ({ theme }) => {
    const logoSrc = 'images/Ui/Main_Dark.png';
    const bgColor = Colors.get('background', theme);
    const isLight = theme === 'light' || theme === 'speciallight';
    const accent = '#AEBCC8';

    return (
        <div style={{
            background: isLight
                ? `radial-gradient(760px 420px at 50% 22%, rgba(174,188,200,0.18), transparent 62%), ${bgColor}`
                : `radial-gradient(760px 420px at 50% 22%, rgba(174,188,200,0.13), transparent 62%), linear-gradient(180deg, #121A20 0%, ${bgColor} 54%, #0E1418 100%)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            inset: 0,
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            zIndex: 5000
        }}>
            <div style={{
                position: 'absolute',
                top: 'calc(env(safe-area-inset-top, 0px) + 44px)',
                left: 0,
                right: 0,
                textAlign: 'center'
            }}>
                <div style={{
                    color: Colors.get('mainText', theme),
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    fontSize: 25,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    opacity: 0.9
                }}>UltyMyLife</div>
                <div style={{
                    marginTop: 9,
                    color: Colors.get('subText', theme),
                    fontSize: 9,
                    fontWeight: 850,
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase'
                }}>Вся твоя жизнь в одном месте</div>
            </div>

            <div className="spinner-card">
                <div className="spinner-container">
                    <div className="spinner-ring main-ring"></div>
                    <div className="spinner-hole" style={{ backgroundColor: bgColor }}>
                        <img src={logoSrc} className="spinner-logo" alt="Loading..." />
                    </div>
                </div>
                <div className="spinner-title">UltyMyLife</div>
                <div className="spinner-text">Загружаю раздел</div>
            </div>

            <style>{`
                .spinner-card {
                    width: 178px;
                    min-height: 184px;
                    border-radius: 34px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    background: ${isLight ? 'rgba(255,255,255,0.72)' : 'linear-gradient(145deg, rgba(24,29,33,0.74), rgba(16,20,23,0.82))'};
                    border: 1px solid transparent;
                    box-shadow: ${isLight ? '0 18px 42px rgba(15,23,42,0.08)' : '0 28px 70px rgba(0,0,0,0.46), 0 1px 0 rgba(255,255,255,0.035) inset'};
                    backdrop-filter: blur(22px) saturate(160%);
                }
                .spinner-container {
                    position: relative;
                    width: 92px;
                    height: 92px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 14px;
                }

                .spinner-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: conic-gradient(
                        from 0deg,
                        rgba(174,188,200,0.08),
                        rgba(174,188,200,0.86),
                        rgba(119,137,152,0.24),
                        rgba(174,188,200,0.48),
                        rgba(174,188,200,0.08)
                    );
                    animation: spin 1.45s linear infinite;
                    box-shadow: 0 12px 26px -24px ${accent};
                }

                .spinner-hole {
                    position: absolute;
                    width: 84%;
                    height: 84%;
                    border-radius: 50%;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: inset 0 0 18px rgba(0,0,0,0.32);
                }

                .spinner-logo {
                    width: 60%;
                    height: 60%;
                    object-fit: contain;
                    animation: breathe 3s ease-in-out infinite;
                    z-index: 3;
                    filter: drop-shadow(0 0 7px rgba(174,188,200,0.18));
                }

                .spinner-title {
                    color: ${Colors.get('mainText', theme)};
                    font-family: Georgia, "Times New Roman", serif;
                    font-size: 18px;
                    font-weight: 700;
                    line-height: 1.05;
                }

                .spinner-text {
                    margin-top: 8px;
                    color: ${Colors.get('subText', theme)};
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes breathe {
                    0% { transform: scale(0.95); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.9; }
                }

                @media (max-width: 600px) {
                    .spinner-container {
                        width: 86px;
                        height: 86px;
                    }
                }
            `}</style>
        </div>
    );
}

export default App

const styles = (theme,fontSize) => ({
    container :
   {
     backgroundColor: Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     justifyContent: "start",
     overflow:'hidden',
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  mainText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fontSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
  },
  cardText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fontSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px"
  },
  text :
  {
    textAlign: "left",
    fontSize: fontSize === 0 ? "10px" : "12px",
    color: Colors.get('subText', theme),
    marginLeft: "30px"
  },
  scrollView:
  {
    width: "95vw",
    maxHeight: "90vh",
    overflowY: "scroll",
    justifyContent: 'center',
    alignItems: 'center'
  },
      btn:
      {
         width:'70%',
         height:'40px',
         borderRadius:'12px',
         fontSize: fontSize === 0 ? '13px' : '14px',
         color:Colors.get('mainText', theme),
         backgroundColor:Colors.get('simplePanel',theme)
      }
})
