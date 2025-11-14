import Home from '@mui/icons-material/HomeTwoTone';
import Back from '@mui/icons-material/FitnessCenterTwoTone';
import Metrics from '@mui/icons-material/QueryStatsTwoTone';
import Settings from '@mui/icons-material/SettingsTwoTone';
import Add from '@mui/icons-material/AddCircleOutlineTwoTone';
import Calendar from '@mui/icons-material/FitnessCenterTwoTone';
import {setPage,setAddPanel,setPage$,addPanel$,theme$,currentBottomBtn$,setCurrentBottomBtn} from '../../StaticClasses/HabitsBus'
import Colors from '../../StaticClasses/Colors'
import {useState,useEffect} from 'react'
import {AppData} from '../../StaticClasses/AppData'
const switchSound = new Audio('Audio/Click.wav');

const BtnsTraining = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [page,setPageState] = useState('');
    const [addPanel,setAddPanelState] = useState('');
    const [currentBtn,setBtnState] = useState(0);
 
    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = setPage$.subscribe(setPageState);   
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = addPanel$.subscribe(setAddPanelState);   
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = currentBottomBtn$.subscribe(setBtnState);
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if(currentBtn === 0){
            if(page === 'HabitCalendar') setBtnState(4);
            else if(page === 'HabitMetrics') setBtnState(1);
        }
    }, [currentBtn]);
    
    // render    
    return (
        <BottomPanel 
                theme={theme} 
                page={page} 
                addPanel={addPanel} 
                currentBtn={currentBtn} 
                setBtnState={setBtnState}
            />
    )
}

export default BtnsTraining


function BottomPanel({page,addPanel,theme,currentBtn,setBtnState})
{
    
    return (    
        <div style={styles(theme,currentBtn).style}>
          {page !== 'HabitsMain' && addPanel === '' && ( <Back style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);}} />)}
          {addPanel !== '' && ( <Back style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);}} />)}
          {page === 'HabitsMain' && addPanel === '' && ( <Home style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);}} />)}
          <Metrics style={styles(theme,currentBtn,1,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(1);setPage('HabitMetrics');setAddPanel('');playEffects(switchSound,50);}} />
          <Add style={styles(theme,currentBtn,2,true,page !== 'HabitsMain').btnstyle} onClick={() => {if(page === 'HabitsMain'){setCurrentBottomBtn(2);setAddPanel('AddHabitPanel');playEffects(switchSound,50);}}} />
          <Settings style={styles(theme,currentBtn,3,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(3);setAddPanel('HabitSettings');playEffects(switchSound,50);}} />
          <Calendar style={styles(theme,currentBtn,4,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(4);setPage('HabitCalendar');setAddPanel('');playEffects(switchSound,50);}} />
        </div>
    )
}
const onBack = (page,addPanel) => {
    if(page === 'HabitsMain' && addPanel === '') setPage('MainMenu');
    else{
        if(addPanel !== '') setAddPanel('');
        else setPage('HabitsMain');
    }
    playEffects(switchSound,50);
}
function playEffects(sound,vibrationDuration ){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0)navigator.vibrate(vibrationDuration);
}

const styles = (theme,currentBtn,id,disengageable,disabled) => ({
    style :{
        position:'fixed',
        bottom:'0',
        left:'0',
        width:'100vw',
        height:'10vh',
        borderTopLeftRadius:'24px',
        borderTopRightRadius:'24px',
        backgroundColor: Colors.get('bottomPanel', theme),
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex:1000,
        boxShadow: `0px -2px 0px ${Colors.get('bottomPanelShadow', theme)}`,
    },
    btnstyle : {
        transition: 'all 0.2s ease-out',
        transform: currentBtn === id ? 'scale(1.3)' : 'scale(1)',
        fontSize:'30px',
        color: disengageable && disabled ? Colors.get('iconsDisabled', theme) : currentBtn === id ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme),
        filter : currentBtn === id ? `drop-shadow(0 0px 8px ${Colors.get('iconsShadow', theme)})` : `drop-shadow(0px 1px 1px ${Colors.get('shadow', theme)})`,
    }
})