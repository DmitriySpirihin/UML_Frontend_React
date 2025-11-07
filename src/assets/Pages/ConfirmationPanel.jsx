import React, {useState,useEffect} from 'react'
import Colors from 'src/assets/StaticClasses/Colors.js'
import { theme$ , lang$} from 'assets/StaticClasses/HabitsBus'
import { setConfirmationPanel,header$} from 'assets/StaticClasses/HabitsBus'
import { removeHabitFn , currentId} from 'assets/Pages/HabitsPages/HabitsMain'

function confirmAction(){
    removeHabitFn(currentId);
}

const ConfirmationPanel = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [lang, setLang] = React.useState('ru');
    const [header, setHeader] = React.useState('');
    // subscriptions
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe(setLang);  
        return () => subscription.unsubscribe();
    }, []); 
    React.useEffect(() => {
        const subscription = header$.subscribe(setHeader);  
        return () => subscription.unsubscribe();
    }, []); 
    return (
        <div style={styles(theme).container}>
            <div style={styles(theme).panel}>
                <h1 style={styles(theme).text}>{header}</h1>
                <button style={styles(theme).button} onClick={() => {confirmAction(); setConfirmationPanel(false);}}>{lang === 'ru' ? 'Да' : 'Yes'}</button>
                <button style={styles(theme).button} onClick={() => {setConfirmationPanel(false);}}>{lang === 'ru' ? 'Нет' : 'No'}</button>    
            </div>
        </div>
    )
}

export default ConfirmationPanel


const styles = (theme) =>
({
    container :
   {
     position: "fixed",
     display: "flex",
     top: "0",
     left: "0",
     right: "0",
     bottom: "0",
     flexDirection: "column",
     justifyContent: "center",
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     backgroundColor: "rgba(21, 19, 19, 0.9)",
     zIndex: 9000
  },
  panel :
  {
    display: "flex",
    flexDirection: "column",
    width: "75vw",
    height: "25vh",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    overflow : 'hidden'
  },
  text :
  {
    textAlign: "center",
    fontSize: "14px",
    color: Colors.get('mainText', theme),
    marginBottom: "40px"
  },
  button :
  {
    width: "100px",
    height: "40px",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
  }
})
