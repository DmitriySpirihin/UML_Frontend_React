
import {useState,useEffect} from 'react'
import { AppData , UserData} from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,premium$,setPage} from '../../StaticClasses/HabitsBus'
import {FaPlusSquare,FaPencilAlt,FaTrash} from 'react-icons/fa'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {FiPlus,FiMinus} from 'react-icons/fi'
import MyNumInput from '../../Helpers/MyNumInput'
import {useLongPress} from '../../Helpers/LongPress'
import {MdClose,MdDone} from 'react-icons/md'

export const names = [
  ['Вес тела','Body weight'],
  ['Талия','Waist'],
  ['Грудь','Chest'],
  ['Нога','Leg'],
  ['Бицепс','Biceps']
]
const now = new Date();
const months =[ ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];
const TrainingMesurments = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
    const [hasPremium,setHasPremium] = useState(UserData.hasPremium);
    const [currentType,setCurrentType] = useState(-1); 
    const [currentInd,setCurrentInd] = useState(-1);
    const [data,setData] = useState(AppData.measurments);
    const [showAddDayPanel,setShowAddDayPanel] = useState(false);
    const [showRedactPanel,setShowRedactPanel] = useState(false);
    const [showConfirmRemove,setShowConfirmRemove] = useState(false);
    const [currentTypeRemove,setCurrentTypeRemove] = useState(-1);

    //new 
    const [year,setYear] = useState(new Date().getFullYear());
    const [month,setMonth] = useState(new Date().getMonth());
    const [day,setDay] = useState(new Date().getDate());
    const [newValue,setNewValue] = useState(0);
   
    // subscriptions
    useEffect(() => {
      const subscription = theme$.subscribe(setthemeState); 
      const subscription2 = lang$.subscribe((lang) => {
      setLangIndex(lang === 'ru' ? 0 : 1);
      }); 
      const subscription3 = fontSize$.subscribe((fontSize) => {
      setFSize(fontSize);
      });
      const subscription4 = premium$.subscribe(setHasPremium);
      return () => {
      subscription.unsubscribe();
      subscription2.unsubscribe();
      subscription3.unsubscribe();
      subscription4.unsubscribe();
      }
    }, []);    

    // bindings
    const bindYearhMinus = useLongPress(() => handleDateChange(false, 0));
    const bindYearPlus = useLongPress(() => handleDateChange(true, 0));
    const bindMonthMinus = useLongPress(() => handleDateChange(false, 1));
    const bindMonthPlus = useLongPress(() => handleDateChange(true, 1));
    const bindDayMinus = useLongPress(() => handleDateChange(false, 2));
    const bindDayPlus = useLongPress(() => handleDateChange(true, 2));
    const bindRepsMinus = useLongPress(() => setNewValue(prev => prev - 1 > 1 ? prev - 1 : 1));
    const bindRepsPlus = useLongPress(() => setNewValue(prev => prev + 1));
   const handleDateChange = (isIncr, dateType) => {
  if (dateType === 2) {
    setDay(prevDay => {
      const maxDay = new Date(year, month, 0).getDate();
      let d = prevDay;
      if (isIncr) {
        if (prevDay < maxDay && new Date(year, month - 1, prevDay + 1).getTime() <= now.getTime()) d = prevDay + 1;
      } else {
        if (prevDay > 1) d = prevDay - 1;
      }
      return d;
    });
  } else if (dateType === 1) {
    setMonth(prevMonth => {
      let m = prevMonth;
      if (isIncr) {
        // нельзя месяц в будущем, учитываем год!
        if (
          prevMonth < 12 &&
          new Date(year, prevMonth, day).getTime() <= now.getTime()
        ) {
          m = prevMonth + 1;
        }
      } else {
        if (prevMonth > 1) {
          m = prevMonth - 1;
        }
      }
      // коррекция дня, если месяц изменён: например, 31 января -> февраль
      const maxDay = new Date(year, m, 0).getDate();
      if (day > maxDay) setDay(maxDay);
      return m;
    });
  } else if (dateType === 0) {
    setYear(prevYear => {
      let y = prevYear;
      if (isIncr) {
        // не больше текущего года или месяца/дня сегодняшних
        if (
          prevYear < now.getFullYear() &&
          new Date(prevYear + 1, month - 1, day).getTime() <= now.getTime()
        ) {
          y = prevYear + 1;
        }
      } else {
        // ограничь минимальный год (например, -100, по желанию)
        if (prevYear > now.getFullYear() - 1) {
          y = prevYear - 1;
        }
      }
      // коррекция дня/месяца, если нужно
      const maxDay = new Date(y, month, 0).getDate();
      if (day > maxDay) setDay(maxDay);
      return y;
    });
  }
   };
  const onAddDay = () => {
  if (newValue === '' || currentType === -1) return;

  const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
  const numericValue = parseFloat(newValue);
  const newEntry = { date: newDateStr, value: numericValue };
  setData(prev => {
    const category = [...prev[currentType]];
    const existingIndex = category.findIndex(entry => entry.date === newDateStr);

    if (existingIndex >= 0) {
      category[existingIndex] = newEntry;
    } else {
      category.push(newEntry);
    }
    category.sort((a, b) => new Date(a.date) - new Date(b.date));

    const newPrev = [...prev];
    newPrev[currentType] = category;
    return newPrev;
  });
  setShowAddDayPanel(false);
  setNewValue('');
};
   const onRemoveConfirm = () => {
  if (currentType === -1 || currentInd === -1) return;

  setData(prev => {
    const category = [...prev[currentType]];
    category.splice(currentInd, 1); // remove 1 item at currentInd
    const newPrev = [...prev];
    newPrev[currentType] = category;
    return newPrev;
  });

  setShowConfirmRemove(false);
};
    const onRedactConfirm = () => {
  if (newValue === '' || currentType === -1 || currentInd === -1) return;
  const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
  const updatedEntry = { date: newDateStr, value: parseFloat(newValue) || 0 };

  setData(prev => {
    const category = [...prev[currentType]];
    category[currentInd] = updatedEntry;
    const newPrev = [...prev];
    newPrev[currentType] = category;
    return newPrev;
  });

  setShowRedactPanel(false);
  setNewValue('');
};

      const onRedact = (ind) => {
        setCurrentInd(ind);
        setShowRedactPanel(true);
    }
      const onRemove = (ind) => {
        setCurrentInd(ind);
        setShowConfirmRemove(true);
    }
  // render    
  return (
    <div style={styles(theme).container}> 
    <p style={{...styles(theme,fSize).text,textAlign:'center'}}>{langIndex === 0 ? 'Замеры' : 'Measurments'}</p>
      {data.map((el, ind) => (<div key={ind} style={styles(theme).panel}>
       {/* Header (always visible) */}
     <div style={styles(theme, fSize, currentType === ind).groupPanel} onClick={() => { setCurrentType((prev) => (prev === ind ? -1 : ind)); }}>
      {currentType === ind ? ( <IoIosArrowUp style={styles(theme).icon} /> ) : ( <IoIosArrowDown style={styles(theme).icon} /> )}
      <div style={styles(theme, fSize).text}>{names[ind][langIndex]}</div>
      {currentType === ind ? <FaPlusSquare  onClick={(e) => {setShowAddDayPanel(true);setNewValue(data[ind][data[ind].length - 1]?.value || 0);e.stopPropagation();}} style={{...styles(theme).icon,fontSize:'18px',marginRight:'50px',marginLeft:'auto'}}/> : null}
        </div>
      {/* Expanded content (only when open) */}
      {currentType === ind && ( <div style={{ marginTop: '8px', width: '100%',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center' }}>
        {el.length > 0 ? ( el.map((day, idx) => (
            <div key={idx} style={styles(theme, fSize).panelRow}>
              <div style={styles(theme, fSize).subtext}>{day.date}:</div>
              <span style={styles(theme, fSize).text}> {day.value + (ind === 0 ? langIndex === 0 ? ' кг' : ' kg' : langIndex === 0 ? ' см' : ' sm')}</span>
              <Diffrense data={data} type={ind} ind={idx} theme={theme} langIndex={langIndex}/>
              <div style={{display:'flex',flexDirection:'row',marginRight:'10px',marginLeft:'auto'}}>
               <FaPencilAlt  onClick={() => onRedact(idx)} style={{...styles(theme).icon,fontSize:'14px',marginRight:'10px'}}/> 
               <FaTrash  onClick={() => onRemove(idx)} style={{...styles(theme).icon,fontSize:'14px',marginRight:'10px'}}/>
              </div>
            </div>
          ))
        ) : (
          <div style={styles(theme, fSize).subtext}>
            {langIndex === 0 ? 'Нет данных' : 'No data'}
          </div>
        )}</div>)}</div>))}
      {showAddDayPanel && (
                 <div style={styles(theme).confirmContainer}>
                  <div style={styles(theme).cP}>
                   <div style={{...styles(theme).simplePanelRow,flexDirection:'column',justifyContent:'space-around',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'95%',height:'60%',borderRadius:'24px'}}>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'установите дату': 'set date'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <div {...bindYearhMinus} onClick={() => {handleDateChange(false,0)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus style={{userSelect:'none',touchAction:'none'}}/></div>
                         <p style={styles(theme).textDate}> {year} </p>
                         <div {...bindYearPlus} onClick={() => {handleDateChange(true,0)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus style={{userSelect:'none',touchAction:'none'}}/></div>
                     </div>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <div {...bindMonthMinus} onClick={() => {handleDateChange(false,1)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus style={{userSelect:'none',touchAction:'none'}}/></div>
                         <p style={styles(theme).textDate}> {months[langIndex][month - 1]} </p>
                         <div {...bindMonthPlus} onClick={() => {handleDateChange(true,1)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus style={{userSelect:'none',touchAction:'none'}}/></div>
                     </div>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <div {...bindDayMinus} onClick={() => {handleDateChange(false,2)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus style={{userSelect:'none',touchAction:'none'}}/></div>
                         <p style={styles(theme).textDate}> {day} </p>
                         <div {...bindDayPlus} onClick={() => {handleDateChange(true,2)}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus style={{userSelect:'none',touchAction:'none'}}/></div>
                     </div> 
                    
                   </div>
                   <div style={{...styles(theme).simplePanelRow,flexDirection:'column',justifyContent:'space-around',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'95%',height:'30%',borderRadius:'24px'}}>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'установите значение': 'set value'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FiMinus {...bindRepsMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev - 1 > 1 ? prev - 1 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={newValue} onChange={(value) => {setNewValue(parseInt(value))}}/>
                         <FiPlus {...bindRepsPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev + 1)}}/>
                     </div>
                   </div>
                  <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
                                <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowAddDayPanel(false)}/>
                                <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onAddDay()}}/>
                             </div>
                  </div>
                 </div>
               )}  
     {!hasPremium && <div onClick={(e) => {e.stopPropagation();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',width:'100vw',height:'170vw',top:'15.5%',borderRadius:'24px',backdropFilter:'blur(12px)',zIndex:2}}>
        <p style={{...styles(theme, fSize).text,textAlign:'center'}}>
        {langIndex === 0  ? 'Отслеживание тела и веса 📏⚖️' : 'Body & Weight Tracking 📏⚖️'}</p>
        <p style={{...styles(theme, fSize).text,textAlign:'center'}}>{langIndex === 0 
         ? 'Следите за изменениями: вес, объёмы, ИМТ — всё в одном месте!' 
         : 'Track every change: weight, body measurements, BMI — all in one place!'}</p>
       <p style={{...styles(theme, fSize).text,textAlign:'center'}}> {langIndex === 0 
        ? '✨ Перейдите на Premium, чтобы сохранять историю и видеть прогресс со временем!' 
        : '✨ Go Premium to save your history and visualize your progress over time!'}</p>
        <p style={{...styles(theme,fSize).text}}> {langIndex === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'} </p>
        <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn,margin:'10px'}} >{langIndex === 0 ? 'Стать премиум' : 'Get premium'}</button>
      </div>
    }
    </div>
    
  )
}

export default TrainingMesurments;


const styles = (theme,fSize,isCurrentGroup = false) =>
({
    container :
   {
    display:'flex',
    width: "100vw",
    flexDirection:'column',
    overflowY:'scroll',
    overflowX:'hidden',
    justifyContent: "flex-start",
    backgroundColor:Colors.get('background', theme),
    height: "78vh",
    top:'16vh',
    paddingTop:'10px'
  },
  groupPanel :
        {
      display:'flex',
      flexDirection:'row',
      width: "100%",
      height:'6vh',
      backgroundColor:isCurrentGroup ? Colors.get('trainingGroupSelected', theme) : Colors.get('trainingGroup', theme),
      borderTop:`1px solid ${Colors.get('border', theme)}`,
      alignItems: "center",
      justifyContent: "left",
      alignContent: "center"
    },
    panel :
        {
      display:'flex',
      flexDirection:'column',
      width: "100%",
      alignItems: "center",
      justifyItems: "center",
    },
  panelRow:
  {
    display:'flex',
    width:'90%',
    alignItems:'center',
    justifyContent:'flex-start',
    marginTop:'10px',
    gap:'10px',
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
  },
  textDate:
    {
      textAlign: "center",
      fontSize: "18px",
      color: Colors.get('mainText', theme),
      marginBottom:'4px'
    },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginLeft:'15px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme)
  },
  icon:
  {
    fontSize: '18px',
    marginLeft:'15px',
    color: Colors.get('icons', theme)
  },
  cP :
          {
            display:'flex',
            flexDirection:'column',
            alignItems: "center",
            justifyContent: "space-around",
            borderRadius:"24px",
            backgroundColor:Colors.get('bottomPanel', theme),
            width:"100%",
            height:"50vh"
        },
          confirmContainer: {
          position: 'fixed',
          top: 0,
          left: -10,
          bottom: 0,
          width:'95vw',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2900,
          padding: '20px',
        },
      simplePanelRow:
      {
        width:'75vw',
        display:'flex',
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around',
      },
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

const Diffrense = ({data,type,ind,theme,langIndex}) => {
    if(ind > 0){
        const diffrense = data[type][ind].value - data[type][ind-1].value;
        const isProgress = diffrense > 0;
        if(diffrense === 0)return <span style={{fontSize:'12px',color:Colors.get('subText', theme)}}>{'-'}</span>
        const sign = isProgress ? '+' : '';
        return <span style={{fontSize:'12px',color:isProgress ? Colors.get('maxValColor', theme) : Colors.get('minValColor', theme)}}>
          {sign}{diffrense + (type === 0 ? langIndex === 0 ? ' кг' : ' kg' : langIndex === 0 ? ' см' : ' sm')}</span>
    }
}
