
import { AppData,UserData } from '../StaticClasses/AppData.js';
import {allHabits} from '../Classes/Habit';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$,setPage$,setShowPopUpPanel,notify$,setCurrentBottomBtn,setAddPanel,setNotifyPanel} from '../StaticClasses/HabitsBus';
import { useState , useEffect, useRef} from 'react';
import {NotificationsManager} from '../StaticClasses/NotificationsManager';
import {FaBackspace} from 'react-icons/fa'
import {MdDone} from 'react-icons/md'

const clickSound = new Audio('Audio/Click.wav');
const NotifyPanel = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [hour,setHour] = useState(12);
    const [minute,setMinute] = useState(0);
    const [page,setPage] = useState('Habit');
    const [notify,setNotify] = useState(AppData.notify);
    const [daysOfWeek,setDaysOfWeek] = useState([true,true,true,true,true,false,false]);
    const [cron,setCron] = useState('10 12 * * 1,2,3,4,5');
    const [isSliderOn,setIsSliderOn] = useState(false);
    const daysNames = [['пн','вт','ср','чт','пт','сб','вс'],['mon','tue','wed','thu','fri','sat','sun']];

    const hours = Array.from({length: 24}, (_, i) => i);
    const minutes = Array.from({length: 60}, (_, i) => i);
    const scrollToSelect = (ref,value) => {
      if(ref.current){
        const itemHeight = 70;
        ref.current.scrollTop = value * itemHeight;
        setCron(getCronExpression(daysOfWeek,hour,minute));
      }
    };
    const hoursRef = useRef(null);
    const minutesRef = useRef(null);
    useEffect(() => {
      scrollToSelect(hoursRef,hour);
      scrollToSelect(minutesRef,minute);
    }, [hour,minute]);
    useEffect(() => {
        const subscription = setPage$.subscribe(setPage);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = theme$.subscribe(setThemeState);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
        const subscription = notify$.subscribe(setNotify);  
        return () => subscription.unsubscribe();
    }, []); 
    
  const setDay = (index) => {
    const updatedDays = [...daysOfWeek];
    updatedDays[index] = !updatedDays[index];
  
    let falseCount = updatedDays.filter(day => !day).length;
    if (falseCount === 6 && daysOfWeek[index]) return;
  
    const newDays = [...updatedDays];
    setDaysOfWeek(newDays);
    setCron(getCronExpression(newDays, hour, minute));
  };
    const setNotification = () => {
      /////
      if(page.startsWith("H"))habitReminder(langIndex,cron,hour,minute,true);
      if(page.startsWith("T"))trainingReminder(langIndex,cron,hour,minute);
    }
    const closePanel = () => {
      setAddPanel('');
      setCurrentBottomBtn(0);
      setNotifyPanel(false);
    }
      useEffect(() => {
      stringToCron(page, setCron, setHour, setMinute, setDaysOfWeek,setIsSliderOn);
    }, []);
    return (
        <div style={styles(theme).container}>
            <div style={styles(theme).panel}>
               <p style={styles(theme).subText}>{getInfoText(langIndex)}</p>
               {/*time picker*/}
               <div style={styles(theme).timeContainer}>
                 <div style={styles(theme).time} ref = {hoursRef} onScroll={(e) => {
                  const newHour = Math.round(e.target.scrollTop / 70);
                  if(newHour != hour) setHour(newHour);
                 }}> {hours.map((h) => <div key={h} style={{height:'70',lineHeight:'70px',fontSize:'28px',scrollSnapAlign:'start',color:Colors.get('mainText', theme)}}>{h.toString()}</div>)}</div>
                 <div style={{...styles(theme).time,borderLeft:`2px solid ${Colors.get('border', theme)}`}} ref = {minutesRef} onScroll={(e) => {
                  const newMinute = Math.round(e.target.scrollTop / 70);
                  if(newMinute != minute) setMinute(newMinute);
                 }}> {minutes.map((m) => <div key={m} style={{height:'70',lineHeight:'70px',fontSize:'28px',scrollSnapAlign:'start',color:Colors.get('mainText', theme)}}>{m.toString().padStart(2, '0')}</div>)}</div>
               </div>
               {/*days picker*/}
               <div style={styles(theme).daysContainer}>
                 <div style={{backgroundColor:daysOfWeek[0] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(0)}} >{daysNames[langIndex][0]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[1] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(1)}} >{daysNames[langIndex][1]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[2] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(2)}} >{daysNames[langIndex][2]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[3] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(3)}} >{daysNames[langIndex][3]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[4] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(4)}} >{daysNames[langIndex][4]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[5] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(5)}} >{daysNames[langIndex][5]}</p></div>
                 <div style={{backgroundColor:daysOfWeek[6] ? Colors.get('iconsDisabled', theme) : "transparent",display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'21px',width:'42px',height:'42px'}}><p style={{...styles(theme).text,fontSize:'18px'}}
                 onClick={() => {setDay(6)}} >{daysNames[langIndex][6]}</p></div>
               </div>
               
               <div style={{display:'flex',width:'90%',flexDirection:'row',alignItems:'space-between',justifyContent:'center'}}>
                <FaBackspace onClick={() => {closePanel();}} style={{fontSize:'28px',width:'30%',color:Colors.get('icons', theme)}}></FaBackspace>
                <MdDone onClick={() => {setNotification();}} style={{fontSize:'28px',width:'30%',color:Colors.get('icons', theme),paddingRight:'18px'}}></MdDone>
                <label style={{...styles(theme).switch}}>
                  <input type="checkbox" style={styles(theme).input} checked={isSliderOn} onChange={() => {setIsSliderOn(!isSliderOn);toggleNotify(page,!isSliderOn,langIndex,cron,hour,minute);}} />
                  <span style={styles(theme,isSliderOn).slider}></span>
                  <span style={styles(theme,isSliderOn).sliderBefore}></span>
                </label>
                
               </div>
               
            </div>
        </div>
    );
};
export default NotifyPanel;
const styles = (theme,isSliderOn = false) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  panel :
  {
    display:'flex',
    flexDirection:'column',
    marginTop:'30vh',
    alignItems: "center",
    justifyContent: "space-around",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    backgroundColor:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width: "90vw",
    height: "45vh",
  },
  text :
  {
    marginTop:'12px',
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subText :
  {
    margin:'5px',
    marginTop:'12px',
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('subText', theme),
  },
  daysContainer :
  {
    backgroundColor:'rgba(0,0,0,0.5)',
    padding:'5px',
    marginTop:'10%',
    borderRadius:'24px',
    display:'flex',
    flexDirection:'row',
    width:'95%',
    height:'15%',
    margin:'5px',
    alignItems:'center',
    justifyContent:'space-between',
  },
  timeContainer :
  {
    padding:'5px',
    borderBottom:'2px solid ' + Colors.get('border', theme),
    borderTop:'2px solid ' + Colors.get('border', theme),
    marginTop:'10%',
    display:'flex',
    flexDirection:'row',
    width:'55%',
    height:'25%',
    margin:'5px',
    alignItems:'center',
    justifyContent:'space-around',
  },
  time :
  {
    display:'flex',
    flexDirection:'column',
    overflowY:'scroll',
    textAlign:'center',
    scrollBehavior:'auto',
    scrollbarWidth:'none',
    scrollSnapType:'y mandatory',
    width:'50%',
    height:'70%'
  },switch :
  {
    marginTop:'4px',
    position:'relative',
    display:'inline-block',
    width:'60px',
    height:'24px',
  },input :
  {
    opacity:0,
    width:'0',
    height:'0',
  },slider :
  {
    position:'absolute',
    cursor:'pointer',
    top:0,
    left:0,
    right:0,
    bottom:0,
    backgroundColor: isSliderOn ? Colors.get('habitCardDone', theme) : Colors.get('habitCardSkipped', theme),
    transition:'0.4s',
    borderRadius:'24px',
  },
  sliderBefore :
  {
    position:'absolute',
    content:'""',
    height:'20px',
    width:'20px',
    left: isSliderOn ? '38px' : '2px',
    bottom:'2px',
    backgroundColor: Colors.get('mainText', theme),
    transition:'0.4s',
    borderRadius:'50%',
  }
})
function getInfoText(langIndex) {
  return langIndex === 0 ? 
  'Установите время и дни недели, чтобы бот отправлял вам уведомления' : 
  'Set a time and days of week to bot send notification to you';
}
function getCronExpression(daysOfWeek,hour,minute){
  let cron = `${minute > 0 ? minute : '*'} ${hour > 0 ? hour : '*'} * *`;
  if(daysOfWeek.every(day => day === true)) cron += ' *';
  else{
    const daysMap = [];
    for(let i = 0; i < daysOfWeek.length; i++){
      if(daysOfWeek[i]) daysMap.push(i + 1);
    }
    cron += ' ' + daysMap.join(',');
  }
  return cron;
}
function stringToCron(page,setCron,setHour,setMinute,setDaysOfWeek,setIsSliderOn){
  let str = '';
  if(page.startsWith("H")) {
    setIsSliderOn(AppData.notify[0].enabled);
    str = AppData.notify[0].cron;
  }
  if(page.startsWith("T")) {
    setIsSliderOn(AppData.notify[1].enabled);
    str = AppData.notify[1].cron;
  }
  setCron(str);
  const cronArr = str.split(' ');
  setHour(cronArr[1] !== '*' ? parseInt(cronArr[1]) : 0);
  setMinute(cronArr[0] !== '*' ? parseInt(cronArr[0]) : 0);
  if (cronArr[4] === '*') {
    setDaysOfWeek([true, true, true, true, true, true, true]);
  } else {
    const daysMap = cronArr[4].split(',');
    const newDays = Array(7).fill(false);
    daysMap.forEach(day => {
      newDays[day - 1] = true;
    });
    setDaysOfWeek(newDays);
  }
}
export function habitReminder(langIndex,_cron,hour,minute,needMessage) {
  const messages = [
    ['время для ваших привычек,', 'Time for your habits,'],
    ['пора выполнить вашу привычку,', 'Time to complete your habit,'],
    ['напоминание о ваших привычках,', 'Reminder about your habits,'],
    ['время проверить привычки,', 'Time to check your habits,'],
    ['время для ежедневного ритуала,', 'Time for your daily ritual,'],
    ['время для самосовершенствования,', 'Time for self-improvement,'],
    ['время для полезного действия,', 'Time for a beneficial action,'],
    ['время для вашего прогресса,', 'Time for your progress,'],
    ['время для личного развития,', 'Time for personal growth,'],
    ['время для полезной рутины,', 'Time for a beneficial routine,'],
    ['время для работы над собой,', 'Time to work on yourself,'],
    ['время для полезной привычки,', 'Time for a good habit,'],
    ['время для самодисциплины,', 'Time for self-discipline,'],
  ]
  if(!AppData.notify[0].enabled){
    if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Уведомления отключены ,сначала включите их' : 'Notifications disabled, first enable them',2000,false);
    return;
  }
    try {
        if (!AppData.choosenHabits || AppData.choosenHabits.length === 0) {
            if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Нет выбранных привычек' : 'No habits chosen',2000,false);
            return;
        }
        const habits = AppData.choosenHabits
            .map(habitId => allHabits?.find(h => h.id === habitId))
            .filter(Boolean);
        let message = '⏰ ' + UserData.name + " ," + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + ': ';
        const habitNames = habits.map(h => h.name[langIndex]).join(', ');
        message += habitNames + '$' + _cron;
        AppData.notify[0] = {enabled:true,cron:_cron};
        NotificationsManager.sendMessage("habit", message);
        if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Уведомление установлено  на ' + hour + ':' + minute : 'Notification set on ' + hour + ':' + minute,2000,true);
    } catch (error) {
        console.log(error);
        if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Ошибка отправки уведомления' : 'Error sending notification',2000,false);
    }
}

const trainingReminder = (langIndex,_cron,hour,minute) => {
  const messages = [
    ["Пора тренироваться,", "It's time to train,"],
    ["Время для спорта,", "Time for some exercise,"],
    ["Разомнись немного,", "Time to stretch,"],
    ["Вперёд к рекордам,", "Let's break some records,"],
    ["Зарядка для тела,", "Energize your body,"],
    ["Время активности,", "Stay active,"],
    ["Разогрейся,", "Warm up,"],
    ["Время стать лучше,", "Time to get better,"],
    ["Подвигаемся?", "Shall we move a bit?"],
    ["Физкульт-привет!", "Exercise time!"],
    ["Бодрость духа!", "Boost your energy!"],
    ["Время размяться!", "Time to stretch!"],
    ["Активный перерыв!", "Active break time!"],
    ["Вперёд к здоровью!", "Onward to health!"],
    ["Разомни шею и спину!", "Stretch your neck and back!"],
    ["Время для зарядки!", "Time for some exercise!"],
    ["Подкачайся!", "Pump it up!"],
    ["Время движения!", "Time to move!"],
    ["Разогрей мышцы!", "Warm up those muscles!"],
    ["Время потренироваться!", "Time for a workout!"],
  ]
  if(!AppData.notify[1].enabled){
    setShowPopUpPanel(langIndex === 0 ? 'Уведомления отключены,сначала включите их' : 'Notifications disabled, first enable them',2000,false);
    return;
  }
    try {
        const userName = UserData.name;
        let message = "🏋️⏰ " + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + ' ' + userName + ' !';
        message += '$' + _cron;
        AppData.notify[1] = {enabled:true,cron:_cron};
        NotificationsManager.sendMessage("training", message);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление установлено  на ' + hour + ':' + minute : 'Notification set on ' + hour + ':' + minute,2000,true);
    } catch (error) {
        console.log(error);
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка отправки уведомления' : 'Error sending notification',2000,false);
    }
}

const toggleNotify = (page,isEnabled,langIndex,_cron,hour,minute) => {
  if(page.startsWith("H")){
    AppData.notify[0].enabled = isEnabled;
    if(UserData?.id){
      if(isEnabled) {
        habitReminder(langIndex,_cron,hour,minute,true);
      }
      else {
        NotificationsManager.sendMessage("habitoff", UserData.id);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление отключено' : 'Notification disabled',2000,true);
      }
    } 
  }
  if(page.startsWith("T")){
    AppData.notify[1].enabled = isEnabled;
    if(UserData?.id){
      if(isEnabled){
        trainingReminder(langIndex,_cron,hour,minute);
      }
      else {
        NotificationsManager.sendMessage("trainingoff", UserData.id);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление отключено' : 'Notification disabled',2000,true);
      }
    } 
  }
}
