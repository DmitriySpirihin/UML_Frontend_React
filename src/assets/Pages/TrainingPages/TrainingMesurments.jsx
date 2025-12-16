
import {useState,useEffect} from 'react'
import { AppData , UserData} from '../../StaticClasses/AppData.js'
import { saveData } from '../../StaticClasses/SaveHelper.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,premium$,setPage} from '../../StaticClasses/HabitsBus'
import {FaPlusSquare,FaPencilAlt,FaTrash,FaCaretLeft,FaCaretRight} from 'react-icons/fa'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {FiPlus,FiMinus} from 'react-icons/fi'
import {IoScaleSharp, IoPerson} from 'react-icons/io5'
import MyNumInput from '../../Helpers/MyNumInput'
import {useLongPress} from '../../Helpers/LongPress'
import {MdClose,MdDone} from 'react-icons/md'
import RecomendationMeasurments from '../../Helpers/RecomendationMeasurments'
import { MeasurmentsIcon } from '../../Helpers/MeasurmentsIcons.jsx'
import { getWeeklyTrainingAmount } from '../../StaticClasses/TrainingLogHelper.js'

export const names = [
  ['Вес тела','Body weight'],
  ['Обхват талии','Waist circumference'],
  ['Обхват бицепса','Biceps circumference'],
  ['Обхват груди','Chest circumference'],
  ['Обхват бедра','Hip circumference'], 
]

const now = new Date();
const months =[ ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];
const goalNames = [['Сила','Strength'],['Набор массы','Mass gain'],['Потеря веса','Weight loss']]
const icons = [
  ['images/BodyIcons/SideS.png','images/BodyIcons/SideSf.png'],
  ['images/BodyIcons/Side.png','images/BodyIcons/Sidef.png'],
  ['images/BodyIcons/SideL.png','images/BodyIcons/SideLf.png'],
  ['images/BodyIcons/SideXL.png','images/BodyIcons/SideXLf.png'],
];
const TrainingMesurments = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFSize] = useState(AppData.prefs[4]);   
    const [hasPremium,setHasPremium] = useState(UserData.hasPremium);
    const [currentType,setCurrentType] = useState(-2); 
    const [currentInd,setCurrentInd] = useState(-1);
    const [data,setData] = useState(AppData.measurements);
    const [showAddDayPanel,setShowAddDayPanel] = useState(false);
    const [showRedactPanel,setShowRedactPanel] = useState(false);
    const [showConfirmRemove,setShowConfirmRemove] = useState(false);
    const [showPersonalDataPanel,setShowPersonalDataPanel] = useState(false);
    const [period,setPeriod] = useState(0);
    //new 
    const [year,setYear] = useState(now.getFullYear());
    const [month,setMonth] = useState(now.getMonth());
    const [day,setDay] = useState(now.getDate());
    const [newValue,setNewValue] = useState(0);
    const [progress,setProgress] = useState({start:0,end:0});
    // user data
    const [filled,setFilled] = useState(AppData.pData.filled);
    const [age,setAge] = useState(AppData.pData.age);
    const [gender,setGender] = useState(AppData.pData.gender);
    const [height,setHeight] = useState(AppData.pData.height);
    const [wrist,setWrist] = useState(AppData.pData.wrist);
    const [goal,setGoal] = useState(AppData.pData.goal);

   
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
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date(now);

  switch (period) {
    case 0: // Month
      start.setMonth(now.getMonth() - 1);
      break;
    case 1: // Year
      start.setFullYear(now.getFullYear() - 1);
      break;
    case 2: // All Time → no filtering
    default:
      return null;
  }

  return { start, end: now };
};
useEffect(() => {
  const weightData = data[0]; // ← this is your weight history

  if (!Array.isArray(weightData) || weightData.length === 0) {
    setProgress({ start: 0, end: 0 });
    return;
  }

  // Optional: ensure it's sorted by date if needed
  // const sorted = [...weightData].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (weightData.length < 2) {
    setProgress({ start: 0, end: 0 });
    return;
  }

  const startValue = weightData[0].value;
  const endValue = weightData[weightData.length - 1].value;
  setProgress({ start: startValue, end: endValue });

}, [period,data]); 

    // bindings
    const bindYearhMinus = useLongPress(() => handleDateChange(false, 0));
    const bindYearPlus = useLongPress(() => handleDateChange(true, 0));
    const bindMonthMinus = useLongPress(() => handleDateChange(false, 1));
    const bindMonthPlus = useLongPress(() => handleDateChange(true, 1));
    const bindDayMinus = useLongPress(() => handleDateChange(false, 2));
    const bindDayPlus = useLongPress(() => handleDateChange(true, 2));
    const bindRepsMinus = useLongPress(() => setNewValue(prev => prev - 0.1 > 1 ? prev - 0.1 : 1));
    const bindRepsPlus = useLongPress(() => setNewValue(prev => prev + 0.1));
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
const getMeasurementsCategory = (type) => {
  if (type < 0 || type >= AppData.measurements.length) return [];
  return AppData.measurements[type];
};
const onAddDay = async () => {
  if (newValue === '' || currentType === -1) return;

  const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
  const numericValue = parseFloat(newValue);
  if (isNaN(numericValue)) return;

  const newEntry = { date: newDateStr, value: numericValue };
  const category = [...getMeasurementsCategory(currentType)];
  const existingIndex = category.findIndex(entry => entry.date === newDateStr);

  if (existingIndex >= 0) {
    category[existingIndex] = newEntry;
  } else {
    category.push(newEntry);
  }

  // Sort in place
  category.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Update AppData
  AppData.measurements[currentType] = category;

  await saveData(); // persist entire AppData
  setShowAddDayPanel(false);
  setNewValue('');
  setData(AppData.measurements);
};

const onRemoveConfirm = async () => {
  if (currentType === -1 || currentInd === -1) return;

  const category = [...getMeasurementsCategory(currentType)];
  category.splice(currentInd, 1);

  AppData.measurements[currentType] = category;

  await saveData();
  setShowConfirmRemove(false);
  setData(AppData.measurements);
};

const onRedactConfirm = async () => {
  if (newValue === '' || currentType === -1 || currentInd === -1) return;

  const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
  const numericValue = parseFloat(newValue);
  if (isNaN(numericValue)) return;

  const updatedEntry = { date: newDateStr, value: numericValue };

  const category = [...getMeasurementsCategory(currentType)];
  category[currentInd] = updatedEntry;

  AppData.measurements[currentType] = category;

  await saveData();
  setShowRedactPanel(false);
  setNewValue('');
  setData(AppData.measurements);
};

      const onRedact = (ind) => {
        setCurrentInd(ind);
        setNewValue(data[currentType][ind].value);
        setShowRedactPanel(true);
    }
      const onRemove = (ind) => {
        setCurrentInd(ind);
        setShowConfirmRemove(true);
    }
    const onFillConfirm = async() => {
        AppData.pData = {filled:true,age,gender,height,wrist,goal};
        await saveData();
        setFilled(true);
        setShowPersonalDataPanel(false);
    }
  // render    
  return (
    <div style={styles(theme).container}> 
    <p style={{...styles(theme,fSize).text,textAlign:'center'}}>{langIndex === 0 ? 'Замеры' : 'Measurments'}</p>

    <div  style={styles(theme).panel}>
     <div style={styles(theme, fSize, currentType === -1).groupPanel} onClick={() => { setCurrentType((prev) => (prev === -1 ? -2 : -1))}}>
      {currentType === -1 ? ( <IoIosArrowUp style={styles(theme).icon} /> ) : ( <IoIosArrowDown style={styles(theme).icon} /> )}
      <div style={styles(theme, fSize).text}>{langIndex === 0 ? 'Личные данные' : 'Personal data'}</div>
      {currentType === -1 ? <FaPencilAlt  onClick={(e) => {setShowPersonalDataPanel(true);e.stopPropagation();}} style={{...styles(theme).icon,fontSize:'18px',marginRight:'50px',marginLeft:'auto'}}/> : null}
      <IoPerson style={{...styles(theme).icon,fontSize:'28px',marginRight:'35px',marginLeft:'auto'}}/>
     </div>
     </div>
    {currentType === -1 && <div style={{ marginTop: '8px', width: '100%',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center' }}>
      <div style={styles(theme, fSize).panelRow}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Возраст: ' : 'Age: ') + age + (langIndex === 0 ? ' лет' : ' yers old')}</div>
      </div>
      <div style={styles(theme, fSize).panelRow}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Пол: ' : 'Gender: ') + (gender === 0 ? (langIndex === 0 ? 'мужской' : 'male') : (langIndex === 0 ? 'женский' : 'female'))}</div>
      </div>
      <div style={styles(theme, fSize).panelRow}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Рост: ' : 'Height: ') + height + (langIndex === 0 ? ' см' : ' sm')}</div>
      </div>
      <div style={styles(theme, fSize).panelRow}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Запястье: ' : 'Wrist size: ') + wrist + (langIndex === 0 ? ' см' : ' sm')}</div>
      </div>
      <div style={styles(theme, fSize).panelRow}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? 'Цель: ' : 'Goal: ') + goalNames[goal][langIndex]}</div>
      </div>
    </div>   } 

      {data.map((el, ind) => (<div key={ind} style={styles(theme).panel}>
       {/* Header (always visible) */}
     <div style={styles(theme, fSize, currentType === ind).groupPanel} onClick={() => { setCurrentType((prev) => (prev === ind ? -2 : ind)); }}>
      {currentType === ind ? ( <IoIosArrowUp style={styles(theme).icon} /> ) : ( <IoIosArrowDown style={styles(theme).icon} /> )}
      <div style={styles(theme, fSize).text}>{names[ind][langIndex]}</div>
      {currentType === ind ? <FaPlusSquare  onClick={(e) => {setShowAddDayPanel(true);setNewValue(data[ind][data[ind].length - 1]?.value || 0);e.stopPropagation();}} style={{...styles(theme).icon,fontSize:'18px',marginRight:'50px',marginLeft:'auto'}}/> : null}
      {ind > 0 ? MeasurmentsIcon.get(ind - 1,langIndex,theme) : <IoScaleSharp style={{...styles(theme).icon,fontSize:'28px',marginRight:'35px',marginLeft:'auto'}}/>}
        </div>
      {/* Expanded content (only when open) */}
      {currentType === ind && ( <div style={{ marginTop: '8px', width: '100%',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center' }}>
        {el.length > 0 ? ( el.map((day, idx) => (
            <div key={idx} style={styles(theme, fSize).panelRow}>
              <div style={styles(theme, fSize).subtext}>{day.date}:</div>
              <span style={styles(theme, fSize).text}> {Number.isInteger(day.value) ? day.value : day.value.toFixed(1) + (ind === 0 ? langIndex === 0 ? ' кг' : ' kg' : langIndex === 0 ? ' см' : ' sm')}</span>
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
      {!filled && <div style={{...styles(theme,fSize).subtext,textAlign:'center',marginTop:'10vh'}}>{langIndex === 0 ? 'Заполните персональные данные для рекомендаций и статистики' : 'Fill personal data to get statistic'} </div>}
      {filled && data[0].length > 0 && currentType === -2 && <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center',width:'100%',alignSelf:'center',marginBottom:'20px'}} >
         <img src={icons[getBMIIndex(data,height)][gender]} alt="" style={{width:'30vw',height:'60vw',margin:'20px'}} />
         <div style={{width:'60%',display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start'}}>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '👤Имя: ' : '👤Name: ') + UserData.name}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '🎂Возраст: ' : '🎂Age: ') + age + (langIndex === 0 ? ' лет' : ' yers old')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '📏Рост: ' : '📏Height: ') + height + (langIndex === 0 ? ' см' : ' sm')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '⚖️Вес: ' : '⚖️Weight: ') + measurmentString(data,0,langIndex)}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '🧈% жира: ' : '🧈% fat: ') + fatPercentString(data,height,age,gender)}</div>
           
           <div style={{...styles(theme, fSize).subtext,marginLeft:'15px'}}>{(names[1][langIndex]) + ': ' +  measurmentString(data,1,langIndex)}</div>
           <div style={{...styles(theme, fSize).subtext,marginLeft:'15px'}}>{(names[2][langIndex]) + ': ' +  measurmentString(data,2,langIndex)}</div>
           <div style={{...styles(theme, fSize).subtext,marginLeft:'15px'}}>{(names[3][langIndex]) + ': ' +  measurmentString(data,3,langIndex)}</div>
           <div style={{...styles(theme, fSize).subtext,marginLeft:'15px'}}>{(names[4][langIndex]) + ': ' +  measurmentString(data,4,langIndex)}</div>

           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '🎯Цель: ' : '🎯Goal: ') + goalNames[goal][langIndex]}</div>
           <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',width:'100%'}}>
          
              <div onClick={() => setPeriod(0)} style={{...styles(theme, fSize).text,margin:'10px',border:'1px solid ' + Colors.get('icons', theme),backgroundColor:period === 0 ? Colors.get('iconsHighlited', theme) : 'transparent',borderRadius:'5px',padding:'2px',width:'30%',textAlign:'center'}}>
                {getPeriodName(0,langIndex)}</div>
              <div onClick={() => setPeriod(1)} style={{...styles(theme, fSize).text,margin:'10px',border:'1px solid ' + Colors.get('icons', theme),backgroundColor:period === 1 ? Colors.get('iconsHighlited', theme) : 'transparent',borderRadius:'5px',padding:'2px',width:'30%',textAlign:'center'}}>
                {getPeriodName(1,langIndex)}</div>
              <div onClick={() => setPeriod(2)} style={{...styles(theme, fSize).text,margin:'10px',border:'1px solid ' + Colors.get('icons', theme),backgroundColor:period === 2 ? Colors.get('iconsHighlited', theme) : 'transparent',borderRadius:'5px',padding:'2px',width:'30%',textAlign:'center'}}>
                {getPeriodName(2,langIndex)}</div>
          
          </div>
           <ProgressChart startWeight={progress.start} endWeight={progress.end} isGainWeight={goal < 2}
           width='80%' height='70px' redColor={Colors.get('minValColor', theme)} greenColor={Colors.get('maxValColor', theme)}/>
         </div>
      </div>} 
      {filled && data[0].length > 0 && currentType === -2 && <div style={{width:'100%',display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'center'}}>
        <div style={{...styles(theme,fSize).text,textAlign:'center'}}>{langIndex === 0 ? '🧮Расчеты' : '🧮Calculations'}</div>
         <div style={{width:'60%',display:'flex',flexDirection:'column',justifyContent:'flex-start',alignItems:'flex-start'}}>
          <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '📏 Тип телосложения: ' : '📏 Body type: ') + bodyTypesNames(getBodyType(height,wrist,gender),langIndex)}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '📊ИМТ: ' : '📊BMI: ') + bmiString(data,langIndex,height)}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '⚖️Идеальный вес: ' : '⚖️Ideal weight: ') + (getIdealWeight(height,gender,getBodyType(height,wrist,gender)).toFixed(1)) + (langIndex === 0 ? ' кг':' kg')}</div>
           <div style={styles(theme, fSize).text}>{(langIndex === 0 ? '🔥Базовый метаболизм: ' : '🔥Basic metabolism: ') + baseMetabolismString(data,langIndex,height,age,gender)}</div>
           
         </div>
      </div>}
      {filled && data[0].length > 0 && currentType === -2 && <RecomendationMeasurments bmi={getBaseMetabolism(data[0][data[0].length - 1]?.value, height, age, gender)} trains={getWeeklyTrainingAmount()}/>}
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
                         <p style={styles(theme).textDate}> {months[langIndex][month]} </p>
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
                         <FiMinus {...bindRepsMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev - 0.1 > 1 ? prev - 0.1 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={newValue} onChange={(value) => {setNewValue(parseInt(value))}}/>
                         <FiPlus {...bindRepsPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev + 0.1)}}/>
                     </div>
                   </div>
                  <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
                                <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowAddDayPanel(false)}/>
                                <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onAddDay()}}/>
                             </div>
                  </div>
                 </div>
               )} 
      {showRedactPanel && (
                 <div style={styles(theme).confirmContainer}>
                  <div style={{...styles(theme).cP,height:'35%'}}>
                    
                   <div style={{...styles(theme).simplePanelRow,flexDirection:'column',justifyContent:'space-around',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'95%',height:'30%',borderRadius:'24px'}}>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'установите новое значение': 'set new value'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FiMinus {...bindRepsMinus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev - 0.1 > 1 ? prev - 0.1 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={newValue} onChange={(value) => {setNewValue(parseInt(value))}}/>
                         <FiPlus {...bindRepsPlus} style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setNewValue(prev => prev + 0.1)}}/>
                     </div>
                   </div>
                  <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
                                <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowRedactPanel(false)}/>
                                <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onRedactConfirm()}}/>
                             </div>
                  </div>
                 </div>
               )}  
      {showConfirmRemove && (
                 <div style={styles(theme).confirmContainer}>
                  <div style={{...styles(theme).cP,height:'20%'}}>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'удалить данные ?': 'delete data?'}</p>
                  <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
                                <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowConfirmRemove(false)}/>
                                <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onRemoveConfirm()}}/>
                             </div>
                  </div>
                 </div>
               )}
      {showPersonalDataPanel && (
                 <div style={styles(theme).confirmContainer}>
                  <div style={{...styles(theme).cP,height:'82%'}}>
                    
                   <div style={{...styles(theme).simplePanelRow,flexDirection:'column',justifyContent:'space-around',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'95%',height:'80%',borderRadius:'24px'}}>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'ваш возраст': 'your age'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FiMinus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setAge(prev => prev - 1 > 1 ? prev - 1 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={age} onChange={(value) => {setAge(parseInt(value))}}/>
                         <FiPlus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setAge(prev => prev + 1)}}/>
                     </div>
                      <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'ваш пол': 'your gender'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FaCaretLeft  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setGender(prev => prev === 1 ? 0 : 1)}}/> 
                         <p style={{color:Colors.get('mainText',theme),fontSize:'26px'}}>{gender === 0 ? langIndex === 0 ? 'мужчина' : 'male' : langIndex === 0 ? 'женщина' : 'female'}</p>
                         <FaCaretRight style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setGender(prev => prev === 1 ? 0 : 1)}}/>
                     </div>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'ваш рост': 'your height'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FiMinus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setHeight(prev => prev - 1 > 1 ? prev - 1 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={height} onChange={(value) => {setHeight(parseInt(value))}}/>
                         <FiPlus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setHeight(prev => prev + 1)}}/>
                     </div>
                     
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'обхват запястья': 'wrist circumference'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FiMinus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWrist(prev => prev - 0.5 > 1 ? prev - 0.5 : 1)}}/> 
                         <MyNumInput theme={theme} w={'100px'} h={'40px'}fSize={28} placeholder={'0'} value={wrist} onChange={(value) => {setWrist(parseInt(value))}}/>
                         <FiPlus  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setWrist(prev => prev + 0.5)}}/>
                     </div>
                     <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? 'цель тренировок': 'training goal'}</p>
                     <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                         <FaCaretLeft  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setGoal(prev => prev + 1 < 3 ? prev + 1 : 0)}}/> 
                         <p style={{color:Colors.get('mainText',theme),fontSize:'26px'}}>{goalNames[goal][langIndex]}</p>
                         <FaCaretRight  style={{fontSize:'28px',color:Colors.get('icons', theme),userSelect:'none',touchAction:'none'}} onClick={() => {setGoal(prev => prev - 1 > -1 ? prev - 1 : 2)}}/>
                     </div>
                     
                   </div>
                  <div style={{...styles(theme).simplePanelRow,height:'60px',backgroundColor:'rgba(0,0,0,0.2)',borderRadius:'12px'}}>
                                <MdClose style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => setShowPersonalDataPanel(false)}/>
                                <MdDone style={{fontSize:'38px',color:Colors.get('icons', theme)}} onClick={() => {onFillConfirm()}}/>
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
         <p style={{...styles(theme, fSize).text,textAlign:'center'}}>
        {langIndex === 0  ? 'Получите персональные рекомендации по питанию 🥗' : 'Get personalized nutrition recommendations 🥗'}</p>
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
          {sign}{Number.isInteger(diffrense) ? diffrense : diffrense.toFixed(1) + (type === 0 ? langIndex === 0 ? ' кг' : ' kg' : langIndex === 0 ? ' см' : ' sm')}</span>
    }
}

const ProgressChart = ({ 
  startWeight = 0, 
  endWeight = 0, 
  isGainWeight, 
  width = '100%', 
  height = '150px',
  greenColor = '#4CAF50',
  redColor = '#F44336'
}) => {
  const progress = endWeight - startWeight;
  const isPositive = isGainWeight ? progress >= 0 : progress < 0;
  const progressText = `${isGainWeight ?  isPositive ?  '+' : '-' : isPositive ?  '-' : '+'}${progress.toFixed(1)} kg`;
  const emoji = isPositive ? (isGainWeight ? '↗️' : '↘️') : (isGainWeight ? '↗️' : '↘️');

  // Use green for progress toward goal, red for opposite
  const startBarColor = isGainWeight 
    ? (isPositive ? redColor : greenColor) 
    : (isPositive ? greenColor : redColor) ;
  const endBarColor = isGainWeight 
    ? (isPositive ? greenColor : redColor) 
    : (isPositive ? redColor : greenColor);

  return (
    <div style={{
      display: 'flex',
      width: width,
      height: height,
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: 'Arial, sans-serif',
      marginTop:'10px',
      marginLeft:'15px'
    }}>
      {/* Left: Two bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '8px' }}>
        <div 
          style={{
            width: '20px',
            height: `${Math.min(100, (startWeight / Math.max(startWeight, endWeight)) * 100)}%`,
            backgroundColor: startBarColor,
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease'
          }}
        />
        <div 
          style={{
            width: '20px',
            height: `${Math.min(100, (endWeight / Math.max(startWeight, endWeight)) * 100)}%`,
            backgroundColor: endBarColor,
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease'
          }}
        />
      </div>

      {/* Right: Three text labels */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between', 
        height: '100%',
        marginLeft: '16px'
      }}>
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 'bold',
          color: startBarColor
        }}>
          {startWeight.toFixed(1)} kg
        </div>
        
        <div style={{ 
          fontSize: '20px', 
          textAlign: 'center',
          color: isPositive ? greenColor : redColor
        }}>
          {progressText} {emoji}
        </div>
        
        <div style={{ 
          fontSize: '13px', 
          fontWeight: 'bold',
          color: endBarColor
        }}>
          {endWeight.toFixed(1)} kg
        </div>
      </div>
    </div>
  );
};

const getBMI = (weight, height) => {
  if (weight <= 0 || height <= 0) return null;
  return weight / Math.pow(height / 100, 2); // height in cm → m
};

const getBodyType = (height, wristCircumference, gender) => {
  if (!height || !wristCircumference) return 'medium';

  // Normalize gender to string if needed
  const genderStr = typeof gender === 'number' 
    ? (gender === 0 ? 'male' : 'female') 
    : gender;

  const wrist = wristCircumference; // already in cm
  const heightInches = height / 2.54; // still needed for height groups

  // Convert inch-based wrist thresholds to cm (1 inch = 2.54 cm)
  if (genderStr === 'male') {
    if (heightInches > 65) {
      // Wrist thresholds: 6.5", 7.5" → cm
      if (wrist < 6.5 * 2.54) return 'small';      // < 16.51 cm
      if (wrist <= 7.5 * 2.54) return 'medium';    // ≤ 19.05 cm
      return 'large';
    } else if (heightInches >= 62) {
      // Thresholds: 6.0", 6.5"
      if (wrist < 6.0 * 2.54) return 'small';      // < 15.24 cm
      if (wrist <= 6.5 * 2.54) return 'medium';    // ≤ 16.51 cm
      return 'large';
    } else {
      // Thresholds: 5.5", 6.0"
      if (wrist < 5.5 * 2.54) return 'small';      // < 13.97 cm
      if (wrist <= 6.0 * 2.54) return 'medium';    // ≤ 15.24 cm
      return 'large';
    }
  } else {
    // Female — uses single threshold (no height dependency in classic method)
    // Thresholds: 5.5", 6.0"
    if (wrist < 5.5 * 2.54) return 'small';        // < 13.97 cm
    if (wrist <= 6.0 * 2.54) return 'medium';      // ≤ 15.24 cm
    return 'large';
  }
};

const getIdealWeight = (height, gender, bodyType = 'medium') => {
  const heightInches = height / 2.54; // height in cm → inches

  let idealWeightKg;
  if (gender === 0) { // male
    idealWeightKg = 50 + 2.3 * (heightInches - 60);
  } else { // female
    idealWeightKg = 45.5 + 2.3 * (heightInches - 60);
  }

  // Frame adjustment
  if (bodyType === 'small') idealWeightKg *= 0.9;
  else if (bodyType === 'large') idealWeightKg *= 1.1;

  // Ensure reasonable minimum (e.g., 30 kg)
  return Math.max(idealWeightKg, 30);
};

const getFatPercent = (BMI, age, gender) => {
  if (BMI <= 0 || age < 18) return null;
  const genderFactor = gender === 'male' ? 1 : 0;
  // Deurenberg formula: %BF = (1.20 × BMI) + (0.23 × age) - (10.8 × gender) - 5.4
  const bodyFat = 1.20 * BMI + 0.23 * age - (10.8 * genderFactor) - 5.4;
  return Math.max(0, Math.min(100, bodyFat)); // Clamp to [0,100]
};

const getBaseMetabolism = (weight, height, age, gender) => {
  if (weight <= 0 || height <= 0 || age <= 0) return null;

  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
};

const bmiNames = (BMI, langIndex) => {
  if (BMI < 16) {
    return langIndex === 0 ? 'выраженный дефицит массы' : 'severe thinness';
  } else if (BMI < 17) {
    return langIndex === 0 ? 'умеренный дефицит массы' : 'moderate thinness';
  } else if (BMI < 18.5) {
    return langIndex === 0 ? 'недостаточная масса' : 'mild thinness';
  } else if (BMI < 25) {
    return langIndex === 0 ? 'норма' : 'normal';
  } else if (BMI < 30) {
    return langIndex === 0 ? 'избыточная масса' : 'overweight';
  } else if (BMI < 35) {
    return langIndex === 0 ? 'ожирение I степени' : 'obesity class I';
  } else if (BMI < 40) {
    return langIndex === 0 ? 'ожирение II степени' : 'obesity class II';
  } else {
    return langIndex === 0 ? 'ожирение III степени' : 'obesity class III';
  }
};

const bodyTypesNames = (type, langIndex) => {
  switch (type) {
    case 'small':
      return langIndex === 0 ? 'астеник' : 'asthenic';
    case 'medium':
      return langIndex === 0 ? 'нормостеник' : 'normosthenic';
    case 'large':
      return langIndex === 0 ? 'гиперстеник' : 'hypersthenic';
    default:
      return langIndex === 0 ? 'неизвестно' : 'unknown';
  }
};
const measurmentString = (data,ind, langIndex) => {
  if(data[ind].length === 0)return '-';
  const label = ind < 1 ? (langIndex === 0 ? ' кг' : ' kg') : (langIndex === 0 ? ' см' : ' sm');
  const val  = data[ind][data[ind].length - 1].value.toFixed(1) + label;
  return val;
}
const bmiString = (data,langIndex,height) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const bmi  = getBMI(data[0][data[0].length - 1].value,height);
  return bmi.toFixed(1) + ' ' + bmiNames(bmi,langIndex);
}
const fatPercentString = (data,height,age,gender) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const fat  = getFatPercent(getBMI(data[0][data[0].length - 1].value,height),age,gender);
  return fat.toFixed();
}
const baseMetabolismString = (data,langIndex,height,age,gender) => {
  if(data[0][data[0].length - 1].value === null)return '-';
  const met  = getBaseMetabolism(data[0][data[0].length - 1].value, height, age, gender);
  return met.toFixed() + (langIndex === 0 ? ' ккал':' kcal');
}
const getBMIIndex = (data,height) => {
   if(data[0][data[0].length - 1].value === null)return 1;
   const BMI  = getBMI(data[0][data[0].length - 1].value,height);
  if (BMI < 18.5) {
    return 0;
  } else if (BMI < 25) {
    return 1;
  } else if (BMI < 35) {
    return 2;
  } else {
    return 3;
  }
}
function getPeriodName(period,langIndex){
  if (period === 0){
    return langIndex === 0 ? 'месяц' : 'month';
  }else if (period === 1){
    return langIndex === 0 ? 'год' : 'year';
  }else if (period === 2){
    return langIndex === 0 ? 'все' : 'all';
  }
}