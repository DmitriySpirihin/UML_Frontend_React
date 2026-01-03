import Home from '@mui/icons-material/HomeTwoTone';
import Back from '@mui/icons-material/BackspaceTwoTone';
import Metrics from '@mui/icons-material/AnalyticsTwoTone';
import Calendar from '@mui/icons-material/CalendarMonthTwoTone';
import Settings from '@mui/icons-material/SettingsTwoTone';
import Add from '@mui/icons-material/AddCircleOutlineTwoTone';
import {MdLightbulbOutline} from 'react-icons/md'
import {setPage,setAddPanel,setPage$,addPanel$,theme$,currentBottomBtn$,setCurrentBottomBtn} from '../../StaticClasses/HabitsBus'
import Colors from '../../StaticClasses/Colors'
import {useState,useEffect} from 'react'
import {AppData} from '../../StaticClasses/AppData'
import {saveData} from '../../StaticClasses/SaveHelper'

const switchSound = new Audio('Audio/Click.wav');

const BtnsSleep = () => {
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
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if(currentBtn === 0){
            if(page === 'SleepMain') setBtnState(4);
            else if(page === 'SleepMetrics') setBtnState(1);
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
                notify={notify}
            />
    )
}

export default BtnsSleep


function BottomPanel({page,addPanel,theme,currentBtn,setBtnState,notify})
{
    
    return (    
        <div style={styles(theme,currentBtn).style}>
          {page !== 'SleepMain' && addPanel === '' && ( <Back style={styles(theme,currentBtn,-2,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(-1);}} />)}
          {addPanel !== '' && ( <Back style={styles(theme,currentBtn,-2,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(-1);}} />)}
          {page === 'SleepMain' && addPanel === '' && ( <Home style={styles(theme,currentBtn,-2,false,false).btnstyle} onClick={() => {onBack(page,addPanel);setCurrentBottomBtn(-1);}} />)}
            <Add style={{...styles(theme,currentBtn,53,true,addPanel === '' && page !== 'SleepMain').btnstyle}} onClick={() => {if(page === 'SleepMain'){setCurrentBottomBtn(3);setAddPanel('SleepNew');playEffects(switchSound);}}} />
          
          <MdLightbulbOutline style={styles(theme,currentBtn,2,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(2);setAddPanel('SleepInsight');playEffects(switchSound);}} />
            <Metrics style={styles(theme,currentBtn,1,false,false).btnstyle} onClick={() => {setCurrentBottomBtn(1);setPage('SleepMetrics');setAddPanel('');playEffects(switchSound);}} />
          
         
        </div>
    )
}
const onBack = async(page,addPanel) => {
    if(page === 'SleepMain' && addPanel === '') {
    await saveData();
    setPage('MainMenu');
    }
    else{
        if(addPanel !== '') setAddPanel('');
        else {
            setPage('SleepMain');
        }
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