import './App.css'
import React, { useState, Suspense, lazy} from 'react';
import MainBtns from './assets/Pages/MainBtns'
import BtnsHabits from './assets/Pages/BottomBtns/BtnsHabits'
import { confirmationPanel$ ,addPanel$, setPage$ ,theme$, bottomBtnPanel$,setPage} from './assets/StaticClasses/HabitsBus'
import Colors from './assets/StaticClasses/Colors'
const HabitCalendar = lazy(() => import('./assets/Pages/HabitsPages/HabitCalendar'));
const HabitMetrics = lazy(() => import('./assets/Pages/HabitsPages/HabitMetrics'));
const HabitsMain = lazy(() => import('./assets/Pages/HabitsPages/HabitsMain'));
const MainMenu = lazy(() => import('./assets/Pages/MainMenu'));
const LoadPanel = lazy(() => import('./assets/Pages/LoadPanel'));
const ConfirmationPanel = lazy(() => import('./assets/Pages/ConfirmationPanel'));
const AddHabitPanel = lazy(() => import('./assets/Pages/HabitsPages/AddHabitPanel'));
const HabitSettings = lazy(() => import('./assets/Pages/HabitsPages/HabitSettings'));

function App() {
  const [page, setPageState] = useState('LoadPanel');
  const [addPanel, setAddPanel] = useState('');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [theme, setTheme] = React.useState('dark');
  const [bottomBtnPanel, setBottomBtnPanel] = useState('');
  React.useEffect(() => {
          const subscription = confirmationPanel$.subscribe(setConfirmationPanel);  
          return () => subscription.unsubscribe();
      }, []);
      React.useEffect(() => {
        const subscription = addPanel$.subscribe(setAddPanel);  
        return () => subscription.unsubscribe();
    }, []);
    function handlePageChange(page){
    setPageState(page);
    setPage(page);
  }

  React.useEffect(() => {
    const subscription = setPage$.subscribe(setPageState);  
    return () => subscription.unsubscribe();
}, []);
React.useEffect(() => {
    const subscription = theme$.subscribe(setTheme);  
    return () => subscription.unsubscribe();
}, []);
React.useEffect(() => {
    const subscription = bottomBtnPanel$.subscribe(setBottomBtnPanel);  
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
      {addPanel === 'HabitSettings' && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <HabitSettings/>
      </Suspense>}
      {confirmationPanel && <Suspense fallback={<SuspenseSpinner theme={theme}/>}> 
        <ConfirmationPanel/>
      </Suspense>}
      {bottomBtnPanel === 'BtnsHabits' && <BtnsHabits/>}
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
