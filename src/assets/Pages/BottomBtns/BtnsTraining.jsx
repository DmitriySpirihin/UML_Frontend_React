import Home from '@mui/icons-material/HomeTwoTone';
import Back from '@mui/icons-material/BackspaceTwoTone';
import Metrics from '@mui/icons-material/BarChartTwoTone';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeightTwoTone';
import Exercises from '@mui/icons-material/FitnessCenter';
import Programs from '@mui/icons-material/MenuBookTwoTone';
import FaBellSlash from '@mui/icons-material/NotificationsOffTwoTone';
import FaBell from '@mui/icons-material/NotificationsActiveTwoTone';
import Add from '@mui/icons-material/AddCircleOutlineTwoTone';
import {setPage,setAddPanel,setPage$,addPanel$,theme$,currentBottomBtn$,setCurrentBottomBtn,setNotifyPanel,notify$,setTrainInfo} from '../../StaticClasses/HabitsBus'
import Colors from '../../StaticClasses/Colors'
import {useState,useEffect} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import { addNewDay } from '../TrainingPages/TrainingMain';
const switchSound = new Audio('Audio/Click.wav');

const BtnsTraining = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [page,setPageState] = useState('');
    const [addPanel,setAddPanelState] = useState('');
    const [currentBtn,setBtnState] = useState(0);
    const [notify,setNotifyState] = useState([{enabled:false,cron:''},{enabled:false,cron:''},{enabled:false,cron:''}]);
 
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
        const subscription2 = notify$.subscribe(setNotifyState);
        return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if(currentBtn === 0){
            if(page === 'TrainingExercise') setBtnState(2);
            else if(page === 'TrainingMetrics') setBtnState(1);
            else if(page === 'TrainingProgramm') setBtnState(4);
            else if(page === 'TrainingMesurments') setBtnState(3);
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
                setNotifyPanel={setNotifyPanel}
                notify={notify}
            />
    )
}

export default BtnsTraining


function BottomPanel({page,addPanel,theme,currentBtn,setBtnState,setNotifyPanel,notify})
{
    
    return (    
        <div style={styles(theme,currentBtn).style}>
          {page !== 'TrainingMain' && addPanel === '' && ( <Back style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);setNotifyPanel(false);}} />)}
          {addPanel !== '' && ( <Back style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);setNotifyPanel(false);}} />)}
          {page === 'TrainingMain' && addPanel === '' && ( <Home style={styles(theme,currentBtn,-1,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(0);setNotifyPanel(false);}} />)}
          <Metrics style={styles(theme,currentBtn,1,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(1);setPage('TrainingMetrics');setAddPanel('');playEffects(switchSound);setNotifyPanel(false);}} />
          <Programs style={styles(theme,currentBtn,4,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(4);setPage('TrainingProgramm');setAddPanel('');playEffects(switchSound);setNotifyPanel(false);}} />
            <Add style={{...styles(theme,currentBtn,9,true,page !== 'TrainingMain').btnstyle,fontSize:page !== 'TrainingMain' ? '30px':'40px'}} 
          onClick={() => {
            if(page === 'TrainingMain'){addNewDay();}
            setCurrentBottomBtn(0);setNotifyPanel(false);playEffects(switchSound);}} />
          <Exercises style={styles(theme,currentBtn,2,true,false).btnstyle} onClick={() => {setCurrentBottomBtn(2);setPage('TrainingExercise');playEffects(switchSound);setNotifyPanel(false);}} />
          <MonitorWeightIcon style={styles(theme,currentBtn,3,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(3);setNotifyPanel(false);setPage('TrainingMesurments');playEffects(switchSound);}} />
          {page.startsWith('T') &&  <FaBell style={styles(theme,currentBtn,5,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(5);setNotifyPanel(true);setAddPanel('');playEffects(switchSound);}} /> }
          
        </div>
    )
}   
const onBack = (page,addPanel) => {
    if(page === 'TrainingMain' && addPanel === '') setPage('MainMenu');
    else{
        if(addPanel !== '') setAddPanel('');
        else setPage('TrainingMain');
    }
    playEffects(switchSound);
}
function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
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