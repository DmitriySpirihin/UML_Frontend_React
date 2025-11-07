import './App.css'
import React, {useState} from 'react'
import MainBtns from './assets/Pages/MainBtns'
import HabitsMain from './assets/Pages/HabitsPages/HabitsMain'
import HabitCalendar from './assets/Pages/HabitsPages/HabitCalendar'
import HabitMetrics from './assets/Pages/HabitsPages/HabitMetrics'
import MainMenu from './assets/Pages/MainMenu'
import ConfirmationPanel from './assets/Pages/ConfirmationPanel'
import AddHabitPanel from './assets/Pages/HabitsPages/AddHabitPanel'
import { confirmationPanel$ ,addHabitPanel$, setPage$ } from './assets/StaticClasses/HabitsBus'

function App() {
  const [page, setPage] = useState('MainMenu');
  const [confirmationPanel, setConfirmationPanel] = useState(false);
  const [addHabitPanel, setAddHabitPanel] = useState(false);
  React.useEffect(() => {
          const subscription = confirmationPanel$.subscribe(setConfirmationPanel);  
          return () => subscription.unsubscribe();
      }, []);
      React.useEffect(() => {
        const subscription = addHabitPanel$.subscribe(setAddHabitPanel);  
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
      <MainBtns />
      {page === 'MainMenu' && <MainMenu onPageChange={handlePageChange}/>}
      {page === 'HabitsMain' && <HabitsMain/>}
      {page === 'HabitCalendar' && <HabitCalendar/>}
      {page === 'HabitMetrics' && <HabitMetrics/>}
      {addHabitPanel && <AddHabitPanel/>}
      {confirmationPanel && <ConfirmationPanel/>}
    </>
  )
}

export default App
