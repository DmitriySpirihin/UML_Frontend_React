import './App.css'
import { useState,useEffect, Suspense, lazy} from 'react';
import MainBtns from './assets/Pages/MainBtns'
import BtnsHabits from './assets/Pages/BottomBtns/BtnsHabits'
import BtnsTraining from './assets/Pages/BottomBtns/BtnsTraining'
import NotifyPanel from './assets/Pages/NotifyPanel'
import { confirmationPanel$ ,addPanel$, setPage$ ,theme$, bottomBtnPanel$, setPage,keyboardVisible$,notifyPanel$} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
const HabitCalendar = lazy(() => import('./assets/Pages/HabitsPages/HabitCalendar'));
const HabitMetrics = lazy(() => import('./assets/Pages/HabitsPages/HabitMetrics'));
const HabitsMain = lazy(() => import('./assets/Pages/HabitsPages/HabitsMain'));
const MainMenu = lazy(() => import('./assets/Pages/MainMenu'));
const LoadPanel = lazy(() => import('./assets/Pages/LoadPanel'));
const ConfirmationPanel = lazy(() => import('./assets/Pages/ConfirmationPanel'));
const AddHabitPanel = lazy(() => import('./assets/Pages/HabitsPages/AddHabitPanel')); 
const TrainingMain = lazy(() => import('./assets/Pages/TrainingPages/TrainingMain'));
const TrainingMetrics = lazy(() => import('./assets/Pages/TrainingPages/TrainingMetrics'));
const TrainingExercise = lazy(() => import('./assets/Pages/TrainingPages/TrainingExercise'));
const TrainingProgramm = lazy(() => import('./assets/Pages/TrainingPages/TrainingProgramms'));
const TrainingCurrent = lazy(() => import('./assets/Pages/TrainingPages/TrainingCurrent'));
const TrainingMesurments = lazy(() => import('./assets/Pages/TrainingPages/TrainingMesurments'));


function App() {
  const [page, setPageState] = useState('LoadPanel');
  const [addPanel, setAddPanel] = useState('');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [bottomBtnPanel, setBottomBtnPanel] = useState('');
  const [keyboardVisible, setKeyboardVisibleState] = useState(false);
  const [notifyPanel, setNotifyPanelState] = useState(false);

  useEffect(() => {
          const subscription = confirmationPanel$.subscribe(setConfirmationPanel);  
          return () => subscription.unsubscribe();
      }, []);
  useEffect(() => {
        const subscription = addPanel$.subscribe(setAddPanel);  
        return () => subscription.unsubscribe();
    }, []);
    function handlePageChange(page){
    setPageState(page);
    setPage(page);
  }
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
      {page === 'TrainingMetrics' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingMetrics/>
      </Suspense>}
      {page === 'TrainingExercise' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingExercise/>
      </Suspense>}
      {page === 'TrainingProgramm' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <TrainingProgramm/>
      </Suspense>}
      {bottomBtnPanel === 'BtnsHabits' &&  !keyboardVisible && <BtnsHabits/>}
      {bottomBtnPanel === 'BtnsTraining' && !keyboardVisible && <BtnsTraining/>}
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
