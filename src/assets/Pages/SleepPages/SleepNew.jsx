import {
  MdSentimentVeryDissatisfied,
  MdSentimentDissatisfied,
  MdSentimentNeutral,
  MdSentimentSatisfied,
  MdSentimentVerySatisfied
} from 'react-icons/md';
import { useState, useEffect} from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { saveData } from '../../StaticClasses/SaveHelper.js';
import { addPanel$ ,theme$,lang$,fontSize$,setAddPanel} from '../../StaticClasses/HabitsBus';
import {MdDone,MdClose} from 'react-icons/md'
import { addDayToSleepingLog } from './SleepHelper.js';
import MyInput from '../../Helpers/MyInput';
import Slider from '@mui/material/Slider';
const click = new Audio('Audio/Click.wav');

const moodColors = (theme,index) => {
  const cols = [
  Colors.get('difficulty3', theme),
  Colors.get('difficulty2', theme),
  Colors.get('difficulty1', theme),
  Colors.get('difficulty0', theme),
  Colors.get('difficulty5', theme),]
  return cols[index];
}
 
const now = new Date();
const MIN_HOURS = 4;
const MAX_HOURS = 12;
const STEP_MINUTES = 10;

const MIN_MS = MIN_HOURS * 60 * 60 * 1000;      // 4 hours in ms
const NEEDED_MS = 8 * 60 * 60 * 1000;
const MAX_MS = MAX_HOURS * 60 * 60 * 1000;      // 12 hours in ms
const STEP_MS = STEP_MINUTES * 60 * 1000;

const SleepNew = ({dateString}) => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [addPanelState,setAddPanelState] = useState(addPanel$.value);
    const [opacity, setOpacity] = useState(0);

    const [mood,setMood] = useState(4);
    const [duration,setDuration] = useState(NEEDED_MS);
    const [bedTime,setBedTime] = useState(22 * 60 * 60 * 1000);
    const [note,setNote] = useState('');

    useEffect(() => {
    const subscription = theme$.subscribe(setTheme);
    const fontSizeSubscription = fontSize$.subscribe(setFontSize);
    return () => {
      subscription.unsubscribe();
      fontSizeSubscription.unsubscribe();
    };
    }, []);
    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
            };
        }, []);
    useEffect(() => {
      const subscription = addPanel$.subscribe(setAddPanelState);
      if(addPanelState === 'SleepNew')setTimeout(() => setOpacity(1),400);
      else setOpacity(0);
      return () => {
        subscription.unsubscribe();
      };
    }, [addPanelState]);
    
    const saveDay = async() => {
      addDayToSleepingLog(dateString,duration,bedTime,mood,note);
      await saveData();
      setAddPanel('')
    }
    return (
        <div style={{...styles(theme).container,
          transform: addPanelState === 'SleepNew' && isNotFutureDate(dateString) ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: opacity === 1 ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
        }}>
         <div style={styles(theme).panel}>
         <p style={styles(theme,fSize).text}>{langIndex === 0 ? 'Во сколько уснул?' : 'What time did you go to bed?'}</p>
         <div style={{width:'100%'}}>
         <p style={styles(theme,fSize).textDate}>{formatMsToHhMm(bedTime)}</p>
         <Slider onChange={(e) => setBedTime(e.target.value)} min={0} max={24 * 60 * 60 * 1000} step={STEP_MS} value={bedTime} style={styles(theme).slider}/>
         </div>
         <p style={styles(theme,fSize).text}>{langIndex === 0 ? 'Сколько спал сегодня?' : 'How much did you sleep today?'}</p>
         <div style={{width:'100%'}}>
         <p style={styles(theme,fSize).textDate}>{formatMsToHhMm(duration)}</p>
         <Slider onChange={(e) => setDuration(e.target.value)} min={MIN_MS} max={MAX_MS} step={STEP_MS} value={duration} style={styles(theme).slider}/>
         </div>

         <p style={styles(theme,fSize).text}>{langIndex === 0 ? 'Как самочувстие?' : 'How do you feel?'}</p>
          <div style={styles(theme).simplePanelRow }>
           
           <MdSentimentVeryDissatisfied style={{...styles(theme).icon,color:mood === 1 ? moodColors(theme,0) : Colors.get('simplePanel', theme)}} onClick={()=>setMood(1)}/>
           <MdSentimentDissatisfied style={{...styles(theme).icon,color:mood === 2 ? moodColors(theme,1) : Colors.get('simplePanel', theme)}} onClick={()=>setMood(2)}/>
           <MdSentimentNeutral style={{...styles(theme).icon,color:mood === 3 ? moodColors(theme,2) : Colors.get('simplePanel', theme)}} onClick={()=>setMood(3)}/>
           <MdSentimentSatisfied style={{...styles(theme).icon,color:mood === 4 ? moodColors(theme,3) : Colors.get('simplePanel', theme)}} onClick={()=>setMood(4)}/>
           <MdSentimentVerySatisfied style={{...styles(theme).icon,color:mood === 5 ? moodColors(theme,4) : Colors.get('simplePanel', theme)}} onClick={()=>setMood(5)}/>
             
          </div>
         <MyInput maxL= {500} h="20%"w='90%' placeHolder={langIndex === 0 ? 'Заметка(опционально , можешь записать свой сон)' : 'Notes(optional , can write your dream)'} theme={theme} onChange={v => setNote(v)}/>
          <div style={{...styles(theme).simplePanelRow ,marginTop:'55px'}}>
           <MdClose style={{...styles(theme).icon,fontSize:'38px'}} onClick={()=>setAddPanel('')}/>
           <MdDone style={{...styles(theme).icon,fontSize:'38px'}} onClick={()=>saveDay()}/>
          </div>
         </div>
          
        </div>
    )
}
export default SleepNew;

const styles = (theme, fSize) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2900,
    width:'100vw'
  },
  panel :
  {
    alignItems: "center",
    justifyItems: "center",
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"95vw",
    height: "70vh",
    marginBottom:'16%'
  },
  text :
  {
    textAlign: "center",
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subtext:
  {
    textAlign: "center",
    fontSize:fSize ? "11px" : "13px",
    color: Colors.get('subText', theme),
    marginBottom:'12px'
  },
  textDate:
  {
    textAlign: "center",
    fontSize: "18px",
    color: Colors.get('mainText', theme),
    marginBottom:'4px'
  },
  simplePanelRow:
  {
    width:'85vw',
    display:'flex',
    flexDirection:'row',
    alignItems:'stretch',
    justifyContent:'space-around',
    userSelect: 'none',
    touchAction: 'none'
  },
  icon: {
    fontSize: "58px",
    padding: "5px",
    marginTop: "10px",
    color: Colors.get('icons', theme),
    userSelect: 'none',
    touchAction: 'none'
  },
  slider:
  {
    width:'90%',
    userSelect: 'none',
    touchAction: 'none',
    color:Colors.get('icons', theme),

  }
})
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

const formatMsToHhMm = (ms) => {
  const totalMinutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};
function isNotFutureDate(dateString) {
  const givenDate = new Date(dateString);
  const today = new Date();

  // Reset time part to 00:00:00 for both dates to compare only the date part
  givenDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  const isNot = givenDate <= today;
  if(!isNot)setAddPanel('');
  return isNot;
}