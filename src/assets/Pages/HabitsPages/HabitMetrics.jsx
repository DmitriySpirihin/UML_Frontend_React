import React, {useState,useEffect} from 'react'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors, { THEME } from '../../StaticClasses/Colors'
import {FaArrowAltCircleLeft,FaArrowAltCircleRight,FaList} from 'react-icons/fa'
import {IoMdArrowDropright,IoMdArrowDropleft} from 'react-icons/io'
import { theme$ ,lang$, globalTheme$,setPage,setHabitSettingsPanel } from '../../StaticClasses/HabitsBus'

const switchSound = new Audio('Audio/SwitchPanel.wav');
const skipSound = new Audio('Audio/Skip.wav');
const clickSound = new Audio('Audio/Click_Add.wav');
const clickMainSound = new Audio('Audio/Click.wav');

// dynamic list that includes defaults + current custom habits
function getAllHabits() {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
  );
}

const HabitMetrics = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [globalTheme, setglobalThemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fillAmount, setFillAmount] = useState(0.0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [showInfo,setShowInfo] = useState(false);
    const [showListOfHabitsPanel,setShowListOfHabitsPanel] = useState(false);
    const [daysCount, setDaysCount] = useState(0);
    const [daysToForm, setDaysToForm] = useState(AppData.daysToFormAHabit);
    const [habitId, setHabitId] = useState(() => (
      AppData.choosenHabits.length > 0 ? AppData.choosenHabits[0] : -1
    ));
    // subscriptions
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = globalTheme$.subscribe(setglobalThemeState);   
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        setFillAmount(currentStreak / daysToForm);
    }, [currentStreak]);
    const habits = Array.from(Object.values(AppData.habitsByDate))
    React.useEffect(() => {
      if(habitId > -1){
      let maxStreak = 0;
      let currentStreak = 0;
      let streak = 0;
      for(let i = 0; i < habits.length; i++){
        if(habitId in habits[i]){
          if(habits[i][habitId] > 0)streak ++;
          else{
            if(streak > maxStreak)maxStreak = streak;
            streak = 0;
          }
        }
        if(streak > maxStreak)maxStreak = streak;
      }
      for(let i = habits.length - 2; i >= 0; i--){
        if(habitId in habits[i]){
          if(habits[i][habitId] > 0)currentStreak ++;
          else break;
        }
      }
      if(habitId in habits[habits.length - 1]){
        if(habits[habits.length - 1][habitId] > 0)currentStreak ++;
      }
      setMaxStreak(maxStreak);
      setCurrentStreak(currentStreak);
    }
    }, [habitId]);
    // circle percent bar
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    
    // render    
    return (
        <div style={styles(theme).container}>
          {habitId === -1 && <div style={{display:'flex',justifyContent:'center',alignItems:'center',marginTop:'40%'}}>
            <p style={{...styles(theme).subText,fontSize:'12px',margin:'10%',marginTop:'30%',whiteSpace:'pre-line',color:Colors.get('subText', theme)}}>{setStartingInfo(langIndex)}</p>
          </div>}
          {habitId > -1 && <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',width:'50%',height:'5vh',marginTop:'15vh',marginLeft:'20vh'}}>
            <FaList style={{...styles(theme).text,fontSize:'16px',marginRight:'10px',marginLeft:'25vw'}} onClick={() => {setShowListOfHabitsPanel(!showListOfHabitsPanel);playEffects(clickMainSound,50);}}/>
            {showListOfHabitsPanel && (<IoMdArrowDropleft style={{...styles(theme).text,fontSize:'28px',marginRight:'10px'}} onClick={() => {setShowListOfHabitsPanel(!showListOfHabitsPanel);playEffects(clickMainSound,50);}}/>)}
            {!showListOfHabitsPanel && (<IoMdArrowDropright style={{...styles(theme).text,fontSize:'28px',marginRight:'10px'}} onClick={() => {setShowListOfHabitsPanel(!showListOfHabitsPanel);playEffects(clickMainSound,50);}}/>)}
            </div>} 
          {habitId > -1 && <div style={styles(theme).panel}>
            {/* habit changer */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'70%',height:'10vh'}}>
              <div onClick={() => {setHabitId(AppData.choosenHabits[AppData.choosenHabits.indexOf(habitId) - 1 < 0 ? AppData.choosenHabits.length - 1 : AppData.choosenHabits.indexOf(habitId) - 1]);playEffects(clickSound,50);}}><FaArrowAltCircleLeft style={{...styles(theme).text,fontSize:'24px',marginTop:'5px',paddingRight:'10px'}}/></div>
              <p style={styles(theme).text}>{getAllHabits().find(h => h.id === habitId).name[langIndex]}</p>
              <div onClick={() => {setHabitId(AppData.choosenHabits[AppData.choosenHabits.indexOf(habitId) + 1 > AppData.choosenHabits.length - 1 ? 0 : AppData.choosenHabits.indexOf(habitId) + 1]);playEffects(clickSound,50);}}><FaArrowAltCircleRight style={{...styles(theme).text,fontSize:'24px',marginTop:'5px',paddingLeft:'10px'}}/></div> 
            </div>
            {/* habit metrics days*/}
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'15vh',flexDirection:'column',
                  backgroundColor:Colors.get('metricsPanel', theme),marginTop:'10px',borderRadius:'24px'}}>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',flexWrap:'wrap',width:'90%',height:'8vh',backgroundColor:Colors.get('background', theme),
                borderRadius:'4px',marginTop:'8px'}}>
                    {getHabitStatusElements(daysCount, habits, habitId, theme)}
              </div>
              <div style={{width:'90%', display:'flex', justifyContent:'flex-start'}}>
                <p style={{...styles(theme).subText, fontSize:'10px', marginTop:'4px'}}>{getHabitRangeStartLabel(daysCount)}</p>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'60%',height:'10vh'}}>
                  <div onClick={() => {setDaysCount(daysCount - 1 < 0 ? 2 : daysCount - 1);if(AppData.prefs[2] == 0)clickSound.play();if(AppData.prefs[3] == 0)navigator.vibrate?.(50);}}><FaArrowAltCircleLeft style={{...styles(theme).text,fontSize:'20px',marginTop:'5px',paddingRight:'10px'}}/></div>
                  <p style={styles(theme).text}>{daysCountText(langIndex,daysCount)}</p>
                  <div onClick={() => {setDaysCount(daysCount + 1 > 2 ? 0 : daysCount + 1);if(AppData.prefs[2] == 0)clickSound.play();if(AppData.prefs[3] == 0)navigator.vibrate?.(50);}}><FaArrowAltCircleRight style={{...styles(theme).text,fontSize:'20px',marginTop:'5px',paddingLeft:'10px'}}/></div> 
                </div>
                <div style={{fontSize:'8px',color:Colors.get('subText', theme),lineHeight:'5px',padding:'5px'}}>{infoMicro(langIndex,daysCount)}</div>
            </div>
            {/* streaks*/}
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',width:'80%',height:'7vh',marginTop:'10px'}}>
              <p style={styles(theme).subText}>{langIndex === 0 ? 'максимальная серия ' + maxStreak : 'Max streak ' + maxStreak}</p>
              {maxStreak > currentStreak && <img src={'Art/Ui/Streak_Flame.png'} style={{width:'30px'}} />}
              <img src={'Art/Ui/Divider.png'} style={{width:'40px',color:Colors.get('border', theme)}} />
              {currentStreak >= maxStreak && currentStreak > 0 && <img src={'Art/Ui/Streak_Flame.png'} style={{width:'30px'}} />}
              <p style={styles(theme).subText}>{langIndex === 0 ? 'текущая серия ' + currentStreak : 'Current streak ' + currentStreak}</p>
            </div>
            {/* percent filled icon*/}
               <svg width="16vh" height="16vh" transform = "rotate(-90, 0, 0)">
                <circle stroke={Colors.get('shadow', theme)} fill="none" strokeWidth="17" r={radius} cx="77" cy="77"/>
                <circle stroke={Colors.get('border', theme)} fill="none" strokeWidth="16" r={radius} cx="75" cy="75"/>
                <circle stroke={Colors.get('progressBar', theme)} fill="none" strokeWidth="15" r={radius} cx="75" cy="75"/>
                <circle stroke={interpolateColor(Colors.get('habitCardSkipped', theme), Colors.get('habitCardDone', theme), fillAmount)} fill="none" strokeWidth="15" r={radius} cx="75" cy="75" 
                strokeDasharray={circumference} strokeDashoffset={circumference + (fillAmount * circumference)} 
                style={{transition: 'stroke-dashoffset 1s linear'}}   />
                <text transform="rotate(90, 75, 75)" x="75" y="75" textAnchor="middle" dominantBaseline="middle" fontSize="24" fill={Colors.get('mainText', theme)}>{Math.ceil(fillAmount * 100)+"%"}</text>
               </svg>
               {/* texts info and days to reach goal */}
               <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'80%',height:'5vh',marginTop:'40px'}}>
                 <p style={{...styles(theme).text,fontSize:'14px'}}>{infoDaysToFormHabit(langIndex,currentStreak,daysToForm)}</p>
                 <p style={{...styles(theme).subText,fontSize:'10px',whiteSpace:'pre-line'}} onClick={() => {setShowInfo(true);if(AppData.prefs[3] == 0)navigator.vibrate?.(50);}}>{infoTextShort(langIndex)}</p>
               </div>
               
          </div>}
          <BottomPanel theme={theme} globalTheme={globalTheme}/>
          {showInfo && <div onClick={() => {setShowInfo(false);if(AppData.prefs[3] == 0)navigator.vibrate?.(50);}} style={{position:'fixed',top:'0',left:'0',width:'100vw',height:'100vh',justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)'}}>
            <div style={{display:'flex',flexDirection:'column',marginLeft:'10vw',marginTop:'15vh',justifyContent:'center',alignItems:'center',paddingRight:'10px',width:'80vw',height:'72vh',backgroundColor:Colors.get('background', theme),borderRadius:'24px'}}>
              <p style={{...styles(theme).subText,fontSize:'12px',padding:'10px',textAlign:'left',whiteSpace:'pre-line',textIndent:'12px'}}>{infoTextLong(langIndex)}</p>
            </div>
          </div>}
          {/* list of habits panel */}
          <div style={{position:'fixed',bottom:'0',left:'0',width:'90vw',height:'70vh',borderRadius:'24px',
            backgroundColor: Colors.get('background', theme),border: `1px solid ${Colors.get('border', theme)}`,
            boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
            transition: 'all 0.5s ease-in-out',transform: showListOfHabitsPanel ? 'translate(-20%,-17%)' : 'translate(-110%,-17%)'}}>
              <div style={{display:'flex',flexDirection:'column',overflowY:'scroll',justifyContent:'start',alignItems:'center',width:'75%',height:'95%',marginTop:'4%',marginLeft:'20%'}}>
                {AppData.choosenHabits.map((id,index) => {
                  let currentStreak = 0;
                  for(let i = habits.length - 2; i >= 0; i--){
                    if(id in habits[i]){
                      if(habits[i][id] > 0)currentStreak ++;
                      else break;
                    }
                  }
                  if(id in habits[habits.length - 1]){
                    if(habits[habits.length - 1][id] > 0)currentStreak ++;
                  }
                return (
                  <div key={index} style={{display:'flex',flexDirection:'row',justifyContent:'space-between',width:'90%',height:'8%',borderBottom: `1px solid ${Colors.get('border', theme)}`,
                    backgroundColor:habitId === id ? Colors.get('highlitedPanel', theme) : Colors.get('background', theme)}}
                    onClick={() => {setHabitId(id);if(AppData.prefs[3] == 0)navigator.vibrate?.(50);}}>
                    <p style={{...styles(theme).text,fontSize:'14px'}}>{(getAllHabits().find(h => h.id === id) || {}).name?.[langIndex] || 'Unknown Habit'}</p>
                    <p style={{...styles(theme).text,fontSize:'14px'}}>{Math.ceil(currentStreak / daysToForm * 100) + '%'}</p>
                    {currentStreak >= daysToForm && <img src={'Art/Ui/Done_Icon.png'} style={{width:'20px'}} />}
                  </div>
                )
              })}
              </div>
          </div>
        </div>
    )
}

export default HabitMetrics

function BottomPanel({globalTheme,theme})
{
    const style ={
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
        zIndex:900,
        boxShadow: `0px -2px 0px ${Colors.get('bottomPanelShadow', theme)}`,
    }
    const btnstyle = {
        width: "35px",
        
        border: "none",
        display:'flex',
        alignItems:'center',
        justifyContent : 'center',
        background: "transparent",

    }
    return (
        <div style={style}>
          <img src={globalTheme === 'dark' ? 'Art/Ui/Back_Dark.png' : 'Art/Ui/Back_Light.png'} style={btnstyle} onClick={() => {setPage('HabitsMain');playEffects(skipSound,50);}} />
          <img src={globalTheme === 'dark' ? 'Art/Ui/Metrics_Dark.png' : 'Art/Ui/Metrics_Light.png'} style={btnstyle} onClick={() => {}} />
          <img src={globalTheme === 'dark' ? 'Art/Ui/Add_Dark.png' : 'Art/Ui/Add_Light.png'} style={btnstyle} onClick={() => {}} />
          <img src={globalTheme === 'dark' ? 'Art/Ui/Setting_Dark.png' : 'Art/Ui/Metrics_Light.png'} style={btnstyle} onClick={() => {setHabitSettingsPanel(true);playEffects(switchSound,50);}} />
          <img src={globalTheme === 'dark' ? 'Art/Ui/Calendar_Dark.png' : 'Art/Ui/Calendar_Light.png'} style={btnstyle} onClick={() => {setPage('HabitCalendar');playEffects(switchSound,50);}} />
        </div>
    )
}
  
const styles = (theme) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     justifyContent: "start",
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  panel :
  {
    display:'flex',
    flexDirection:'column',
    width: "90vw",
    height: "150vw",
    position:'absolute',
    top:'53%',
    left:'49%',
    transform:'translate(-50%,-50%)',
    alignItems: "center",
    justifyContent: "start",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    background:Colors.get('background', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`
  },
  text :
  {
    fontFamily: "Segoe UI",
    textAlign: "center",
    fontSize: "18px",
    color: Colors.get('mainText', theme),
  },
  subText :
  {
    fontFamily: "Segoe UI",
    textAlign: "center",
    fontSize: "14px",
    color: Colors.get('subText', theme),
  },
  scrollView:
  {
    width: "85vw",
    height: "74vh",
    overflowY: "auto",
    marginTop:"17vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
  }
})

function getHabitStatusElements(daysCount, habitsArray, habitId, theme) {
  const daysMapping = [7, 30, 90, 180];
  const numberOfDays = daysMapping[daysCount] ?? 7;
  if (habitId === -1) return [];

  const byDate = AppData.habitsByDate || {};
  const today = new Date();

  const items = [];
  for (let i = numberOfDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayObj = byDate[dateStr];

    const hasValue = dayObj && (habitId in dayObj);
    const done = hasValue && dayObj[habitId] > 0;
    const skipped = hasValue && dayObj[habitId] <= 0;
    const bg = done
      ? Colors.get('habitCardDone', theme)
      : skipped
      ? Colors.get('habitCardSkipped', theme)
      : Colors.get('habitCard', theme);

    items.push(
      <div
        key={dateStr}
        style={{
          flex: '1 1 0',
          height: '100%',
          marginLeft:'1px',
          marginRight:'1px',
          borderRadius: '3px',
          backgroundColor: bg,
        }}
      />
    );
  }

  return items;
}

function interpolateColor(color1, color2, factor) {
  if (!color1 || !color2) return color1 || color2 || '#000000';
  // Ensure factor is clamped between 0 and 1
  factor = Math.max(0, Math.min(1, factor));

  // Remove '#' if present
  color1 = color1.replace('#', '');
  color2 = color2.replace('#', '');

  // Parse RGB components
  const r1 = parseInt(color1.slice(0, 2), 16);
  const g1 = parseInt(color1.slice(2, 4), 16);
  const b1 = parseInt(color1.slice(4, 6), 16);

  const r2 = parseInt(color2.slice(0, 2), 16);
  const g2 = parseInt(color2.slice(2, 4), 16);
  const b2 = parseInt(color2.slice(4, 6), 16);

  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Convert back to hex and ensure two digits
  return '#' + r.toString(16).padStart(2, '0') + 
         g.toString(16).padStart(2, '0') + 
         b.toString(16).padStart(2, '0');
}
const infoTextShort = (langIndex) => {
    return langIndex === 0 ?
    'Согласно исследованиям, для формирования привычки требуется 21-66 дней.\n(нажми для получения подробной информации)' : 
    'According to research, it takes 21-66 days to form a habit.\n(click for more detailed info)';
}
const infoDaysToFormHabit = (langIndex, days,daysToForm) => {
    const names = [[' день', ' дня', ' дней'],[' day', ' days', ' days']];
    const lastDays = daysToForm - days;
    let name = '';
    if(lastDays < 10 || lastDays > 19){
      name = lastDays % 10 === 1 ? names[langIndex][0] : lastDays % 10 > 1 && lastDays % 10 < 5 ? names[langIndex][1] : names[langIndex][2];
    }else{
      name = names[langIndex][2];
    }
    return langIndex === 0 ?
    lastDays + name + ' до формирования привычки' : 
    lastDays + name + ' to form a habit';
}
const infoTextLong = (langIndex) => {
    return langIndex === 0 ?
    ' Формирование привычек — это процесс, при котором определенное поведение со временем становится для нас автоматическим и естественным. Этот процесс играет ключевую роль в улучшении нашей жизни, помогая нам внедрять полезные действия и избавляться от вредных.\n\n Научные исследования показывают, что привычка формируется благодаря регулярному повторению действия в одном и том же контексте, например, каждое утро после пробуждения или перед сном. Среднее время для закрепления новой привычки составляет около 2–3 месяцев, но у каждого человека этот процесс может занимать от нескольких недель до полугода и более.\n\n Для успешного формирования привычек важно:Выбрать конкретное и достижимое действие.Выполнять его регулярно и последовательно в одном и том же окружении.Ставить ясные цели и напоминания.Отмечать свои успехи и получать положительное подкрепление.\n Привычки работают по принципу «сигнал — действие — награда», что позволяет со временем выполнять действия автоматически, без лишних усилий и раздумий. Сильные привычки помогают повысить продуктивность, улучшить здоровье и сделать повседневную жизнь более упорядоченной.\n\n Начинайте с маленьких шагов, и со временем новые полезные действия станут неотъемлемой частью вашего стиля жизни!\n\n\n !!!  нажми на панель чтобы закрыть !!!' : 
    'Habit formation is a process in which certain behaviors become automatic and natural over time. This process plays a crucial role in improving our lives by helping us adopt beneficial actions and eliminate harmful ones.\n\n Scientific research suggests that habits are formed through the regular repetition of an action in the same context, such as every morning upon waking up or before going to sleep. The average time it takes to establish a new habit is around 2-3 months, but it can vary from a few weeks to six months or more for each individual.\n\n To successfully form habits, it is important to:Choose a specific and achievable action. Perform it regularly and consistently in the same environment. Set clear goals and reminders. Celebrate your successes and receive positive reinforcement.\n Habits work on the "signal-action-reward" principle, allowing you to perform actions automatically over time without unnecessary effort or thought. Strong habits can help you become more productive, improve your health, and make your daily life more organized.\n\n Start with small steps, and over time, new healthy habits will become an integral part of your lifestyle!\n\n\n!!! tap the panel to close !!!';
}
const infoMicro = (langIndex,daysCount) => {
    switch(daysCount){
      case 0:  return langIndex === 0 ? '* серии за неделю' : '* streaks last for a week';  break;
      case 1:  return langIndex === 0 ? '* серии за месяц' : '* streaks last for a month';  break;
      case 2:  return langIndex === 0 ? '* серии за 3 месяца' : '* streaks last for 3 months';  break;
      case 3:  return langIndex === 0 ? '* серии за полгода' : '* streaks last for a half of the year';  break;
    }
}
const daysCountText = (langIndex,daysCount) => {
    switch(daysCount){
      case 0:  return langIndex === 0 ? '7 дней' : '7 days';  break;
      case 1:  return langIndex === 0 ? '30 дней' : '30 days';  break;
      case 2:  return langIndex === 0 ? '90 дней' : '90 days';  break;
    }
}
const setStartingInfo = (langIndex) => {
    return langIndex === 0 ? 
    'Сначала вам нужно добавить привычку\n\n Здесь вы можете просмотреть прогресс и метрики ваших привычек.\n\nВернитесь в предыдущее меню, чтобы выбрать или создать свою привычку' :
    'First you need to add a habit\n\n Here you can view your habits progress and view your habits metrics.\n\nGet back to the previous menu to choose or create a habit';
}

function getHabitRangeStartLabel(daysCount){
  const daysMapping = [7, 30, 90, 180];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysMapping[daysCount]);
  const firstDayString = startDate.toISOString().split('T')[0];
  const parts = firstDayString.split('-');
  const mm = parts[1];
  const dd = parts[2];
  return `${dd}-${mm}`;
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
