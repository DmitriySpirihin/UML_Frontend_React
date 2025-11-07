import React, {useState,useEffect} from 'react'
import BackDark from '../../Art/Ui/Back_Dark.png'
import MetricsDark from '../../Art/Ui/Metrics_Dark.png'
import AddDark from '../../Art/Ui/Add_Dark.png'
import CalendarDark from '../../Art/Ui/Calendar_Dark.png'
import BackLight from '../../Art/Ui/Back_Light.png'
import MetricsLight from '../../Art/Ui/Metrics_Light.png'
import AddLight from '../../Art/Ui/Add_Light.png'
import CalendarLight from '../../Art/Ui/Calendar_Light.png'
import StreakIcon from '../../Art/Ui/Streak_Flame.png'
import DoneIcon from '../../Art/Ui/Done_Icon.png'
import Divider from '../../Art/Ui/Divider.png'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$, globalTheme$,setPage } from '../../StaticClasses/HabitsBus'

const dateKey = new Date().toISOString().split('T')[0];
const clickSound = new Audio(new URL('../../Audio/Click_Add.mp3', import.meta.url).href);
const isDoneSound = new Audio(new URL('../../Audio/IsDone.mp3', import.meta.url).href); 

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
    const [habitId, setHabitId] = useState(0);
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
        setFillAmount(currentStreak / 66);
    }, [currentStreak]);
    const habits = Array.from(Object.values(AppData.habitsByDate))
    React.useEffect(() => {
      let maxStreak = 0;
      let currentStreak = 0;
      habits.forEach((v) => {
        let streak = 0;
        if(habitId in v){
          if(v.id > 0)streak ++;
          else{
            if(streak > maxStreak)maxStreak = streak;
            streak = 0;
          }
        }
      })
      for(let i = habits.length - 1; i >= 0; i--){
        if(habitId in habits[i]){
          if(habits[i].habitId > 0)currentStreak ++;
          else break;
        }
      }
      setMaxStreak(maxStreak);
      setCurrentStreak(currentStreak);
    }, [habitId]);
    // circle percent bar
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    
    // render    
    return (
        <div style={styles(theme).container}>
          {habitId === -1 && <div style={styles(theme).panel}>
            <p style={styles(theme).subText}>{langIndex === 0 ? 'Вы еще не выбрали привычку' : 'You have not selected a habit yet'}</p>
          </div>}
          {habitId > -1 && <p style={{...styles(theme).text,fontSize:'14px',marginTop:'15vh',marginLeft:'40%'}} onClick={() => {setShowListOfHabitsPanel(!showListOfHabitsPanel)}}>
            {!showListOfHabitsPanel ? langIndex === 0 ? 'Открыть список >' : 'Open list >' : langIndex === 0 ? 'Закрыть список <' : 'Close list <'}
            </p>}
          {habitId > -1 && <div style={styles(theme).panel}>
            {/* habit changer */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'75%',height:'10vh'}}>
              <div onClick={() => {setHabitId(AppData.choosenHabits[AppData.choosenHabits.indexOf(habitId) - 1 < 0 ? AppData.choosenHabits.length - 1 : AppData.choosenHabits.indexOf(habitId) - 1])}}><h1 style={{...styles(theme).text,fontSize:'28px',paddingBottom:'7px',paddingRight:'15px'}}>{'<'}</h1></div>
              <p style={styles(theme).text}>{allHabits.find(h => h.Id() === habitId).Name()[langIndex]}</p>
              <div onClick={() => {setHabitId(AppData.choosenHabits[AppData.choosenHabits.indexOf(habitId) + 1 > AppData.choosenHabits.length - 1 ? 0 : AppData.choosenHabits.indexOf(habitId) + 1])}}><h1 style={{...styles(theme).text,fontSize:'28px',paddingLeft:'15px'}}>{'>'}</h1></div> 
            </div>
            {/* habit metrics days*/}
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'15vh',flexDirection:'column',
                  backgroundColor:Colors.get('simplePanel', theme),marginTop:'10px',borderRadius:'24px'}}>
              <div style={{display:'flex',justifyContent:'center',alignItems:'center',width:'90%',height:'7vh',backgroundColor:Colors.get('background', theme),
                borderRadius:'12px',marginTop:'12px'}}>
                    {/* days elements here */}
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'60%',height:'10vh'}}>
                  <div onClick={() => {setDaysCount(daysCount - 1 < 0 ? 3 : daysCount - 1)}}><h1 style={{...styles(theme).text,fontSize:'24px',paddingRight:'25px'}}>{'<'}</h1></div>
                  <p style={styles(theme).text}>{daysCountText(langIndex,daysCount)}</p>
                  <div onClick={() => {setDaysCount(daysCount + 1 > 3 ? 0 : daysCount + 1)}}><h1 style={{...styles(theme).text,fontSize:'24px',paddingLeft:'25px'}}>{'>'}</h1></div> 
                </div>
                <div style={{fontSize:'8px',color:Colors.get('subText', theme),lineHeight:'5px',padding:'5px'}}>{infoMicro(langIndex,daysCount)}</div>
            </div>
            {/* streaks*/}
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',width:'80%',height:'7vh',marginTop:'10px'}}>
              <p style={styles(theme).subText}>{langIndex === 0 ? 'максимальная серия ' + maxStreak : 'Max streak ' + maxStreak}</p>
              {maxStreak > currentStreak && <img src={StreakIcon} style={{width:'30px'}} />}
              <img src={Divider} style={{width:'40px',color:Colors.get('border', theme)}} />
              {currentStreak > maxStreak && <img src={StreakIcon} style={{width:'30px'}} />}
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
                 <p style={{...styles(theme).text,fontSize:'14px'}}>{infoDaysToFormHabit(langIndex,currentStreak)}</p>
                 <p style={{...styles(theme).subText,fontSize:'10px',whiteSpace:'pre-line'}} onClick={() => {setShowInfo(true)}}>{infoTextShort(langIndex)}</p>
               </div>
               
          </div>}
          <BottomPanel theme={theme} globalTheme={globalTheme}/>
          {showInfo && <div onClick={() => {setShowInfo(false)}} style={{position:'fixed',top:'0',left:'0',width:'100vw',height:'100vh',justifyContent:'center',alignItems:'center',backgroundColor:'rgba(0,0,0,0.5)'}}>
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
                  const habits = Array.from(Object.values(AppData.habitsByDate))
                  const currentStreak = 0;
                  for(let i = habits.length - 1; i >= 0; i--){
                    if(id in habits[i]){
                      if(habits[i].id > 0)currentStreak ++;
                      else break;
                    }
                  }
                return (
                  <div key={index} style={{display:'flex',flexDirection:'row',justifyContent:'space-between',width:'90%',height:'8%',borderBottom: `1px solid ${Colors.get('border', theme)}`,
                    backgroundColor:habitId === id ? Colors.get('highlitedPanel', theme) : Colors.get('background', theme)}}
                    onClick={() => {setHabitId(id)}}>
                    <p style={{...styles(theme).text,fontSize:'14px'}}>{allHabits.find(h => h.Id() === id).Name()[langIndex]}</p>
                    <p style={{...styles(theme).text,fontSize:'14px'}}>{Math.ceil(currentStreak / 66 * 100) + '%'}</p>
                    {currentStreak >= 66 && <img src={DoneIcon} style={{width:'20px'}} />}
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
            <img src={globalTheme === 'dark' ? BackDark : BackLight} style={btnstyle} onClick={() => {setPage('HabitsMain')}} />
            <img src={globalTheme === 'dark' ? MetricsDark : MetricsLight} style={btnstyle} onClick={() => setPage('HabitMetrics')} />
            <img src={globalTheme === 'dark' ? AddDark : AddLight} style={btnstyle} onClick={() => {}} />
            <img src={globalTheme === 'dark' ? CalendarDark : CalendarLight} style={btnstyle} onClick={() => setPage('HabitCalendar')} />
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
         width: "80vw",
        height: "65vh",
        position:'absolute',
        top:'50%',
        left:'50%',
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
    'Согласно исследованиям, для формирования привычки требуется 66 дней.\n(нажми для получения подробной информации)' : 
    'According to research, it takes 66 days to form a habit.\n(click for more detailed info)';
}
const infoDaysToFormHabit = (langIndex, days) => {
    const names = [[' день', ' дня', ' дней'],[' day', ' days', ' days']];
    const lastDays = 66 - days;
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
      case 3:  return langIndex === 0 ? '180 дней' : '180 days';  break;
    }
}
