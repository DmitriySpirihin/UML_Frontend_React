import './App.css'
import { useState,useEffect, Suspense, lazy} from 'react';
import { useNavigate } from 'react-router-dom';
import MainBtns from './assets/Pages/MainBtns'
import BtnsHabits from './assets/Pages/BottomBtns/BtnsHabits'
import BtnsTraining from './assets/Pages/BottomBtns/BtnsTraining'
import BtnsRecovery from './assets/Pages/BottomBtns/BtnsRecovery'
import BtnsMental from './assets/Pages/BottomBtns/BtnsMental'
import BtnsSleep from './assets/Pages/BottomBtns/BtnsSleep'
import NotifyPanel from './assets/Pages/NotifyPanel'
import { confirmationPanel$ ,addPanel$, setPage$ ,theme$, bottomBtnPanel$, setPage,keyboardVisible$,notifyPanel$} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
import { checkPendingPaymentOnStartup,fetchUserPremiumStatus } from './assets/StaticClasses/PaymentService';
import PaymentPendingScreen from './assets/Helpers/CheckPaymentScreen';
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
  const [showPendingScreen, setShowPendingScreen] = useState(false);

  // ✅ Define the function ONCE
  const checkForPendingPayment = async () => {
    const pendingId = localStorage.getItem('pendingPaymentId');
    if (pendingId) {
      localStorage.removeItem('pendingPaymentId'); // consume it
      setShowPendingScreen(true);

      try {
        const result = await getPaymentStatus(pendingId);
        if (result.success && result.payment?.status === 'succeeded') {
          const status = await fetchUserPremiumStatus();
          UserData.hasPremium = status.hasPremium;
          UserData.premiumEndDate = status.premiumEndDate;
          // Note: you may want to trigger a global update or notify Premium screen
        }
      } catch (err) {
        console.warn('Payment check failed:', err);
      } finally {
        setShowPendingScreen(false);
      }
    }
  };

  // ✅ ONE useEffect for payment verification
  useEffect(() => {
    const safeCheck = () => {
      if (showPendingScreen) return;
      checkForPendingPayment();
    };

    safeCheck();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(safeCheck, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showPendingScreen]);

  // ... rest of your useEffects (subscriptions) — keep these
  useEffect(() => {
    const subscription = addPanel$.subscribe(setAddPanel);  
    return () => subscription.unsubscribe();
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
      {page !== 'LoadPanel' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <MainBtns/>
      </Suspense>}
      {page === 'LoadPanel' && <LoadPanel/>}
      {page === 'MainMenu' && <MainMenu onPageChange={handlePageChange}/>}
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
      {bottomBtnPanel === 'BtnsHabits' &&  !keyboardVisible && <BtnsHabits/>}
      {bottomBtnPanel === 'BtnsTraining' && !keyboardVisible && <BtnsTraining/>}
      {bottomBtnPanel === 'BtnsRecovery' && !keyboardVisible && <BtnsRecovery/>}
      {bottomBtnPanel === 'BtnsMental' && !keyboardVisible && <BtnsMental/>}
      {bottomBtnPanel === 'BtnsSleep' && !keyboardVisible && <BtnsSleep/>}
    </>
  )
}
const SuspenseSpinner = ({theme}) => {
  return (
    <div style={{backgroundColor: Colors.get('background', theme), display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw'}}>
    <div className="spinner">
      <style>
        {
          `.spinner {
            margin-top: 20%;
            border: 4px solid ${Colors.get('subText', theme)};
            border-top: 4px solid ${Colors.get('habitCardSkipped', theme)};
            border-radius: 50%;
            width: 10vw;
            height: 10vw;
            animation: spinner 1.6s linear infinite;
          }
          @keyframes spinner {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }`
        }
      </style>
    </div>
    </div>
  );
}

export default App
