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
import NotifyPanel from './assets/Pages/NotifyPanel'
import { addPanel$, setPage$ ,theme$, bottomBtnPanel$, setPage,keyboardVisible$,notifyPanel$} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
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
  const lang = AppData.prefs[0];
  const isTechicalWorks = true;

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
      {
        isTechicalWorks && 
        <div onClick={(e) => {e.stopPropagation();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'space-around',alignItems:'center',
          width:'100%',height:'100%',left:'0',top:'0',backgroundColor:'rgba(0,0,0,0.5)',backdropFilter:'blur(8px)',zIndex:9999}}>
          <div style={{...styles(theme).mainText,fontSize:'20px',whiteSpace:'pre-line',textAlign:'center'}}>{lang === 0 ? '🔧 Технические работы на сервере \n скоро исправим \n пожалуйста, попробуйте позже' : '🔧 Technical works is underway on the server \n will be fixed soon \n please try again later'}</div>
        </div> 
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
      {bottomBtnPanel === 'BtnsHabits' &&  !keyboardVisible && <BtnsHabits/>}
      {bottomBtnPanel === 'BtnsTraining' && !keyboardVisible && <BtnsTraining/>}
      {bottomBtnPanel === 'BtnsRecovery' && !keyboardVisible && <BtnsRecovery/>}
      {bottomBtnPanel === 'BtnsMental' && !keyboardVisible && <BtnsMental/>}
      {bottomBtnPanel === 'BtnsSleep' && !keyboardVisible && <BtnsSleep/>}
      {bottomBtnPanel === 'BtnsToDo' && !keyboardVisible && <BtnsToDo/>}
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