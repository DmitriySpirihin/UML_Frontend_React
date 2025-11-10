import './App.css'
import React, { useState} from 'react';
import MainBtns from './assets/Pages/MainBtns'
import HabitsMain from './assets/Pages/HabitsPages/HabitsMain'
import HabitCalendar from './assets/Pages/HabitsPages/HabitCalendar'
import HabitMetrics from './assets/Pages/HabitsPages/HabitMetrics'
import MainMenu from './assets/Pages/MainMenu'
import LoadPanel from './assets/Pages/LoadPanel'
import ConfirmationPanel from './assets/Pages/ConfirmationPanel'
import AddHabitPanel from './assets/Pages/HabitsPages/AddHabitPanel'
import HabitSettings from './assets/Pages/HabitsPages/HabitSettings'
import { confirmationPanel$ ,addHabitPanel$, setPage$ ,habitSettingsPanel$} from './assets/StaticClasses/HabitsBus'

function App() {
  const [page, setPage] = useState('LoadPanel');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [addHabitPanel, setAddHabitPanel] = useState(false);
  const [habitSettingsPanel, setHabitSettingsPanel] = useState(false);
  React.useEffect(() => {
          const subscription = confirmationPanel$.subscribe(setConfirmationPanel);  
          return () => subscription.unsubscribe();
      }, []);
      React.useEffect(() => {
        const subscription = addHabitPanel$.subscribe(setAddHabitPanel);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
      const subscription = habitSettingsPanel$.subscribe(setHabitSettingsPanel);  
      return () => subscription.unsubscribe();
  }, []);
  function handlePageChange(page){
    setPage(page);
  }

  React.useEffect(() => {
    const subscription = setPage$.subscribe(setPage);  
    return () => subscription.unsubscribe();
}, []);
  return (
    <>
      {page !== 'LoadPanel' && <MainBtns />}
      {page === 'LoadPanel' && <LoadPanel/>}
      {page === 'MainMenu' && <MainMenu onPageChange={handlePageChange}/>}
      {page === 'HabitsMain' && <HabitsMain/>}
      {page === 'HabitCalendar' && <HabitCalendar/>}
      {page === 'HabitMetrics' && <HabitMetrics/>}
      {addHabitPanel && <AddHabitPanel/>}
      {habitSettingsPanel && <HabitSettings/>}
      {confirmationPanel && <ConfirmationPanel/>}
    </>
  )
}

export default App
