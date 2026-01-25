import './App.css'
import { AppData, UserData } from './assets/StaticClasses/AppData';
import { useState,useEffect, Suspense, lazy} from 'react';
import MainBtns from './assets/Pages/MainBtns'
import BtnsHabits from './assets/Pages/BottomBtns/BtnsHabits'
import BtnsTraining from './assets/Pages/BottomBtns/BtnsTraining'
import BtnsRecovery from './assets/Pages/BottomBtns/BtnsRecovery'
import BtnsMental from './assets/Pages/BottomBtns/BtnsMental'
import BtnsSleep from './assets/Pages/BottomBtns/BtnsSleep'
import BtnsToDo from './assets/Pages/BottomBtns/ToDoBtns'
import BtnsRobot from './assets/Pages/BottomBtns/BtnsRobot'
import NotifyPanel from './assets/Pages/NotifyPanel'
import { addPanel$, setPage$ ,theme$, bottomBtnPanel$, keyboardVisible$,notifyPanel$} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
import { motion, AnimatePresence } from 'framer-motion';
import { FaServer, FaCog, FaTools } from 'react-icons/fa';
const HabitCalendar = lazy(() => import('./assets/Pages/HabitsPages/HabitCalendar'));
const HabitMetrics = lazy(() => import('./assets/Pages/HabitsPages/HabitMetrics'));
const HabitsMain = lazy(() => import('./assets/Pages/HabitsPages/HabitsMain'));
const MainMenu = lazy(() => import('./assets/Pages/MainMenu'));
const LoadPanel = lazy(() => import('./assets/Pages/LoadPanel'));
const ConfirmationPanel = lazy(() => import('./assets/Pages/ConfirmationPanel'));
const AddHabitPanel = lazy(() => import('./assets/Pages/HabitsPages/AddHabitPanel')); 
const TrainingMain = lazy(() => import('./assets/Pages/TrainingPages/TrainingMain'));
const TrainingExercise = lazy(() => import('./assets/Pages/TrainingPages/TrainingExercise'));
const TrainingProgramm = lazy(() => import('./assets/Pages/TrainingPages/TrainingProgramms'));
const TrainingCurrent = lazy(() => import('./assets/Pages/TrainingPages/TrainingCurrent'));
const TrainingMesurments = lazy(() => import('./assets/Pages/TrainingPages/TrainingMesurments'));
const TrainingAnaliticsMain = lazy(() => import('./assets/Pages/TrainingPages/Analitics/TrainingAnaliticsMain'));
const TrainingList = lazy(() => import('./assets/Pages/TrainingPages/TrainingList'));
const Premium = lazy(() => import('./assets/Pages/Premium'));
const RecoveryMain = lazy(() => import('./assets/Pages/Recovery/RecoveryMain'));
const BreathingMain = lazy(() => import('./assets/Pages/Recovery/RecoveryCategories'));
const RecoveryAnalytics = lazy(() => import('./assets/Pages/Recovery/RecoveryAnalitics')); 
const ToDoMain = lazy(() => import('./assets/Pages/ToDoPages/ToDoMain'));
const ToDoMetrics = lazy(() => import('./assets/Pages/ToDoPages/ToDoMetrics'));
const RobotMain = lazy(() => import('./assets/Pages/Robot/RobotMain'));
const UserPanel = lazy(() => import('./assets/Pages/UserPanel'));
const MentalMain = lazy(() => import('./assets/Pages/MentalPages/MentalMain'));
const MathMain = lazy(() => import('./assets/Pages/MentalPages/MathMain'));
const MemoryMain = lazy(() => import('./assets/Pages/MentalPages/MemoryMain'));
const LogicMain = lazy(() => import('./assets/Pages/MentalPages/LogicMain'));
const FocusMain = lazy(() => import('./assets/Pages/MentalPages/FocusMain'));
const Records = lazy(() => import('./assets/Pages/MentalPages/Records'));


const SleepMetrics = lazy(() => import('./assets/Pages/SleepPages/SleepMetrics'));
const SleepMain = lazy(() => import('./assets/Pages/SleepPages/SleepMain'));

const tg = window.Telegram?.WebApp;


function App() {
  const [page, setPageState] = useState('LoadPanel');
  const [addPanel, setAddPanel] = useState('');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [bottomBtnPanel, setBottomBtnPanel] = useState('');
  const [keyboardVisible, setKeyboardVisibleState] = useState(false);
  const [notifyPanel, setNotifyPanelState] = useState(false);
  const [isTechicalWorks, setIsTechicalWorks] = useState(true);
  const lang = AppData.prefs[0];
  

  // for test only
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

  return (
    <>
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
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
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
              <div style={{ height: '2vh', width: '100%' }} onClick={() => { handleClick(true) }} ></div>
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
             <div style={{ height: '2vh', width: '100%' }} onClick={() => { handleClick(false) }} ></div>
            </motion.div>
        </motion.div>
    
      }
      {page !== 'LoadPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MainBtns/>
      </Suspense>}
      {page === 'LoadPanel' && <LoadPanel/>}
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
      {addPanel === 'AddHabitPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <AddHabitPanel/>
      </Suspense>}
      {page === 'TrainingCurrent' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingCurrent/>
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
      {page === 'TrainingList' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingList/>
      </Suspense>}
      {page === 'TrainingExercise' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingExercise needToAdd={false}/>
      </Suspense>}
      {page === 'TrainingProgramm' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingProgramm/>
      </Suspense>}
      {page === 'premium' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <Premium/>
      </Suspense>}
      {page === 'RecoveryMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <RecoveryMain/>
      </Suspense>}
      {page === 'MentalMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MentalMain/>
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
      {page === 'ToDoMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <ToDoMain/>
      </Suspense>}
      {page === 'RobotMain' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <RobotMain/>
      </Suspense>}
      {page === 'ToDoMetrics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <ToDoMetrics/>
      </Suspense>}
      {addPanel === 'UserPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <UserPanel/>
      </Suspense>}
      
      {bottomBtnPanel === 'BtnsHabits' &&  !keyboardVisible && <BtnsHabits/>}
      {bottomBtnPanel === 'BtnsTraining' && !keyboardVisible && <BtnsTraining/>}
      {bottomBtnPanel === 'BtnsRecovery' && !keyboardVisible && <BtnsRecovery/>}
      {bottomBtnPanel === 'BtnsMental' && !keyboardVisible && <BtnsMental/>}
      {bottomBtnPanel === 'BtnsSleep' && !keyboardVisible && <BtnsSleep/>}
      {bottomBtnPanel === 'BtnsToDo' && !keyboardVisible && <BtnsToDo/>}
      {bottomBtnPanel === 'BtnsRobot' && !keyboardVisible && <BtnsRobot/>}
    </>
  )
}
const SuspenseSpinner = ({ theme }) => {
    const logoSrc = theme === 'dark' ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png';
    const bgColor = Colors.get('background', theme);

    return (
        <div style={{
            backgroundColor: bgColor,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        }}>
            
            <div className="spinner-container">
                {/* 1. The Glowing Blur Layer (Behind) */}
                <div className="spinner-ring blur-ring"></div>
                
                {/* 2. The Sharp Spinner Layer (Front) */}
                <div className="spinner-ring main-ring"></div>
                
                {/* 3. The Mask/Background for center hole */}
                <div className="spinner-hole" style={{ backgroundColor: bgColor }}>
                     {/* 4. The Breathing Logo */}
                    <img src={logoSrc} className="spinner-logo" alt="Loading..." />
                </div>
            </div>

            <style>{`
                .spinner-container {
                    position: relative;
                    width: 150px; 
                    height: 150px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* --- The Rotating Gradient Rings --- */
                .spinner-ring {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    /* Iridescent Gradient */
                    background: conic-gradient(
                        from 0deg,
                        #bd4a83b3, 
                        #894cc5b8, 
                        #c5588fa8, 
                        #bf5252ae, 
                        #bfaa5cbf, 
                        #5cb2caaf, 
                        #905cc39e, 
                        #b95d8bb0
                    );
                    animation: spin 1.5s linear infinite;
                }

                /* The Glow Effect */
                .blur-ring {
                    filter: blur(25px);
                    opacity: 0.8;
                    transform: scale(1.1); /* Make glow slightly larger */
                }

                /* --- The Center Hole --- */
                /* This creates the ring effect by covering the center of the gradient */
                .spinner-hole {
                    position: absolute;
                    width: 88%; /* Adjusts border thickness (Smaller % = thicker border) */
                    height: 88%;
                    border-radius: 50%;
                    z-index: 2;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: inset 0 0 20px rgba(0,0,0,0.5); /* Inner shadow for depth */
                }

                /* --- The Logo --- */
                .spinner-logo {
                    width: 60%;
                    height: 60%;
                    object-fit: contain;
                    animation: breathe 3s ease-in-out infinite;
                    z-index: 3;
                    filter: drop-shadow(0 0 5px rgba(255,255,255,0.2));
                }

                /* --- Animations --- */
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes breathe {
                    0% { transform: scale(0.95); opacity: 0.9; }
                    50% { transform: scale(1.05); opacity: 1; }
                    100% { transform: scale(0.95); opacity: 0.9; }
                }

                /* Mobile Adjustments */
                @media (max-width: 600px) {
                    .spinner-container {
                        width: 120px;
                        height: 120px;
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