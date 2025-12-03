import { useState, useEffect} from 'react';
import {useLongPress} from '../../Helpers/LongPress.js';
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, setAddPanel,addPanel$ ,theme$,lang$,fontSize$,setCurrentBottomBtn, keyboardVisible$ } from '../../StaticClasses/HabitsBus';
import {FaBackspace,FaPlusSquare,FaSearchPlus,FaSearch,FaRegWindowClose,FaListAlt,FaTrashAlt} from 'react-icons/fa'
import {MdFiberNew,MdDone,MdClose} from 'react-icons/md'
import {FaRegSquareCheck,FaRegSquare} from 'react-icons/fa6'
import {FiPlus,FiMinus} from 'react-icons/fi'
import Icons from '../../StaticClasses/Icons';
import MyInput from '../../Helpers/MyInput';
import Slider from '@mui/material/Slider';
const click = new Audio('Audio/Click.wav');

const getAllHabits = () => {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
  );
}
const now = new Date();

const AddHabitPanel = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [lang, setLang] = useState(lang$.value);
    const [fSize,setFontSize] = useState(fontSize$.value);
    const [keyboardVisible, setKeyboardVisibleState] = useState(false);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [showCreatePanel,setshowCreatePanel] = useState(false);
    const [addPanel,setAddPanelState] = useState('');
    const [confirmationPanel,setConfirmationPanel] = useState(false);
    
    // Habit data state
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState(langIndex === 0 ? 'Здоровье' : 'Health');
    const [habitDescription, setHabitDescription] = useState('');
    const [habitIcon, setHabitIcon] = useState('default');
    const [habitId, setHabitId] = useState(-1);

    //date
    const [year,setYear] = useState(now.getFullYear());
    const [month,setMonth] = useState(now.getMonth() + 1);
    const [day,setDay] = useState(now.getDate());
    const [goals,setGoals] = useState([]);
    const [goalName,setGoalName] = useState('');
    const [isNegative,setIsNegative] = useState(false);
    const [daysToForm,setDaysToForm] = useState(66);
   
    // UI state
    const [habitList, setHabitList] = useState(getAllHabits());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [iconName, setIconName] = useState('default');
    const [addButtonEnabled, setAddButtonEnabled] = useState(false);
    const [filterCategory,setfilterCategory] = useState(langIndex === 0 ? 'Здоровье' : 'Health');
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


    const bindYearhMinus = useLongPress(() => handleDateChange(false, 0));
    const bindYearPlus = useLongPress(() => handleDateChange(true, 0));
    const bindMonthMinus = useLongPress(() => handleDateChange(false, 1));
    const bindMonthPlus = useLongPress(() => handleDateChange(true, 1));
    const bindDayMinus = useLongPress(() => handleDateChange(false, 2));
    const bindDayPlus = useLongPress(() => handleDateChange(true, 2));
    const setNewGoal = () => {
      if (goalName.length > 0) {
        setGoals(prev => [...prev, goalName]);
        setGoalName('');
      }
      else setShowPopUpPanel( langIndex === 0 ? 'Введите цель' : 'Enter goal',2000,false);
    };
    const removeGoal = (index) => {
      setGoals(prev => prev.filter((_, i) => i !== index));
    };
    const months =[ ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];
    useEffect(() => {
    const subscription = theme$.subscribe(setTheme);
    const langSubscription = lang$.subscribe(setLang);
    const keyboardSubscription = keyboardVisible$.subscribe(setKeyboardVisibleState);
    const fontSizeSubscription = fontSize$.subscribe(setFontSize);
    return () => {
      subscription.unsubscribe();
      langSubscription.unsubscribe();
      keyboardSubscription.unsubscribe();
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
        setHabitList(getAllHabits());
    }, []);
    useEffect(() => {
      const subscription = addPanel$.subscribe(setAddPanelState);
      if(addPanel === 'AddHabitPanel')setTimeout(() => setOpacity(1),400);
      else setOpacity(0);
      return () => {
        subscription.unsubscribe();
      };
    }, []);
    const handleInputValue = (value, index) => {
      if(value.length > 0){
        if (index === 0) setHabitName(value[0].toUpperCase() + value.toLowerCase().slice(1));
        else if (index === 1) setHabitCategory(value[0].toUpperCase() + value.toLowerCase().slice(1));
        else if (index === 2) setHabitDescription(value[0].toUpperCase() + value.toLowerCase().slice(1));
        else if (index === 3) setGoalName(value[0].toUpperCase() + value.toLowerCase().slice(1));
      }else{
        if (index === 0) setHabitName('');
        else if (index === 1) setHabitCategory('');
        else if (index === 2) setHabitDescription('');
        else if (index === 3) setGoalName('');
      }
    };
    
    useEffect(() => {
      if (habitName.length > 3 && habitCategory.length > 3) {
        setAddButtonEnabled(true);
      } else {
        setAddButtonEnabled(false);
      }
    }, [habitName, habitCategory, habitDescription, habitIcon, langIndex]);
    
    return (
        <div style={{...styles(theme).container,
          transform: addPanel === 'AddHabitPanel' ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: opacity === 1 ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
        }}>
         {!showCreatePanel && (<div style={styles(theme, keyboardVisible).panel}>
           <div style={styles(theme,false,fSize).headerText}>{langIndex === 0 ? 'добавь привычку' : 'add habit'}</div>
           <div style={{...styles(theme).simplePanel,height:"80%",width:'85%',marginRight:'7.5%'}}>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',width:'90%'}}>
              <FaSearch style={{color:Colors.get("icons",theme),fontSize:'16px',marginTop:'10px',marginLeft:'10px'}}/>
              <MyInput maxL={10} w="70%" placeHolder={langIndex === 0 ? 'поиск' : 'search'} theme={theme} 
              onChange={value => searchHabitsList(value,habitList, setHabitList) }/>
            </div>
            <select style={{...styles(theme,false,fSize).input,width:"80%",marginLeft:'10%'}} onChange={(e) => setfilterCategory(e.target.value)}>
                {renderCategoryOptions(theme, langIndex,fSize)}
              </select>
            <div style={styles(theme).scrollView}>
              {habitList.map((habit) => !AppData.choosenHabits.includes(habit.id) && habit.category[langIndex] === filterCategory && (
                <div key={habit.id} style={{...styles(theme).text,alignContent:'center',height:'40px',borderRadius:"12px",backgroundColor: habit.id === selectedHabit ? Colors.get('highlitedPanel', theme) : 'transparent'}}
                onClick={() => {
                  setSelectedHabit(habit.id);
                  setIsNegative(getAllHabits()[habit.id].category[0] === 'Отказ от вредного');
                  setHabitId(habit.id);
                  setGoals(setGoalForDefault(habit.name[0],langIndex));
                  setDaysToForm(getAllHabits()[habit.id].category[0] === 'Отказ от вредного' ? 120 : 66);
                  setAddButtonEnabled(true);
                  playEffects(click);
                  }}>
                  {habit.name[langIndex]+' '+(habit.isCustom ? ' 🔖':'')}
                </div>
              ))}
           </div>
           </div>
           {/* buttons */}
           <div style={{display:'flex',width:'85%',flexDirection:'row',justifyContent:'space-around',alignContent:'center'}}>
             <div style={{...styles(theme).button}} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);playEffects(click);}}><FaBackspace style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {setshowCreatePanel(true);setAddButtonEnabled(false);}}><MdFiberNew style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {if(addButtonEnabled){setConfirmationPanel(true);playEffects(click);}}}><FaPlusSquare style={{...styles(theme).miniIcon,color: addButtonEnabled ?  Colors.get('icons', theme) : Colors.get('iconsDisabled', theme)}}/></div>
           </div>
           </div>)}
           {/* creation panel */}
           {showCreatePanel && (<div style={styles(theme, keyboardVisible).panel}>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'или создай свою' : 'or create your own'}</div>
           <div style={{...styles(theme).simplePanel,width:'85%',marginRight:'7.5%',height:"52vh",justifyContent:'space-around',alignItems:'center'}}>
            <MyInput maxL={25} h="15%" w='90%' placeHolder={langIndex === 0 ? 'имя' : 'name'} theme={theme} onChange={v => handleInputValue(v,0)}/>
           
              <select style={{...styles(theme,false,fSize).input,width:"80%"}} onChange={(e) => setHabitCategory(e.target.value)}>
                {renderCategoryOptions(theme, langIndex,fSize)}
              </select>
           
            <MyInput maxL={100} h="20%"w='90%' placeHolder={langIndex === 0 ? 'описание(опционально)' : 'description(optional)'} theme={theme} onChange={v => handleInputValue(v,2)}/>
            <div style={styles(theme,false,fSize).headerText}>{langIndex === 0 ? 'выбери иконку(опционально)' : 'choose icon(optional)'}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{width: '80%',marginLeft:'30px',padding:'5px'}}>
               <div style={styles(theme).button} onClick={() => setSelectIconPanel(selectIconPanel ? false : true)}>
                {!selectIconPanel && (<FaListAlt style={styles(theme).miniIcon}/>)}{selectIconPanel && (<FaRegWindowClose style={styles(theme).miniIcon}/>)}
               </div>
              </div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: '20%',
                height: '100%',
                padding: '8px'
              }}>
                {Icons.getIcon(iconName, {
                  size: 48,
                  style: {
                    marginRight:'70px',
                    color: Colors.get("habitIcon", theme),
                    filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))'
                  }
                })}
              </div>
            </div>
           </div>
           <div style={{display:'flex',flexDirection:'row',width:'85%',justifyContent:'space-around',alignContent:'center'}}>
             <div style={{...styles(theme).button}} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);playEffects(click);}}><FaBackspace style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {setshowCreatePanel(false);setAddButtonEnabled(false);setSelectedHabit(null);}}><FaSearchPlus style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {if(addButtonEnabled){setConfirmationPanel(true);playEffects(click);}}}><FaPlusSquare style={{...styles(theme).miniIcon,color: addButtonEnabled ?  Colors.get('icons', theme) : Colors.get('iconsDisabled', theme)}}/></div>
           </div>
         </div>)}
         {selectIconPanel && (
           <div style={styles(theme).selectPanel}>
             {Object.entries(Icons.ic).map(([key]) => (
               <div 
                 key={key}
                 style={{
                   width: '15%',
                   padding: '12px',
                   display: 'flex',
                   justifyContent: 'center',
                   alignItems: 'center',
                   cursor: 'pointer',
                   borderRadius: '8px',
                   transition: 'background-color 0.2s',
                   ':hover': {
                     backgroundColor: Colors.get('highlitedPanel', theme)
                   }
                 }}
                 onClick={() => {
                   setIconName(key);
                   setHabitIcon(key);
                   playEffects(click);
                   setSelectIconPanel(false);
                   if(habitName.length > 3 && habitCategory.length > 3) {
                     setAddButtonEnabled(true);
                   }
                 }}
               >
                 {Icons.getIcon(key, { 
                   size: 32, 
                   style: { 
                     color: Colors.get('habitIcon', theme),
                     filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))'
                   } 
                 })}
               </div>
             ))}
           </div>
         )}
         {confirmationPanel && (
           <div style={styles(theme).container}>
            <div style={styles(theme).confirmationPanel}>
             <p style={styles(theme,false,fSize).text}>{confirmationText(langIndex,showCreatePanel,habitId,habitName)}</p>
             <div style={{...styles(theme).simplePanelRow,flexDirection:'column',justifyContent:'space-between',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'95%',height:'80%',borderRadius:'24px'}}>
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
               <p style={styles(theme,false,fSize).subtext}>{langIndex === 0 ? '(опционально) дополнительные цели' : '(optional) additional goals'}</p>
               <div style={{...styles(theme).simplePanelRow,width:'80%',flexDirection:'row',justifyContent:'space-around',alignItems:'center'}}>
                <MyInput w='80%'h='70%' maxL={70} placeHolder={langIndex === 0 ? 'новая цель' : 'new goal'} onChange={v => handleInputValue(v,3) } clear={true}/>
                <FaPlusSquare style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}} onClick={setNewGoal}/>
               </div>
               <div style={{marginTop:'10px',width:'90%',display:'flex',flexDirection:'column',justifyContent:'start',alignItems:'center',overflowY:'auto',height:'90%'}}>
                  {goals.map((goal,index) => (
                    <div key={index} style={{display:'flex',flexDirection:'row',justifyItems:'start',alignItems:'center',width:'90%',height:'30%'}}>
                      <div style={{...styles(theme,false,fSize).text,width:'90%',textAlign:'left',fontSize:fSize === 0 ? '11px' : '13px' }}>{(index + 1) + ': ' + goal}</div>
                      <FaTrashAlt style={{...styles(theme).miniIcon,fontSize:'14px',marginBottom:'20px',marginLeft:'auto'}} onClick={() => removeGoal(index)}/>
                    </div>
                  ))}
                </div>
                
                <Slider style={styles(theme).slider} min={21} max={180} value={daysToForm} valueLabelDisplay='auto' onChange={(e) => setDaysToForm(e.target.value)} />
                <div style={{...styles(theme,false,fSize).subtext,marginTop:'5px',width:'90%'}}>{needDaysInfo(langIndex,daysToForm,isNegative)}</div>
                
             </div>
             
             <div style={styles(theme).simplePanelRow}>
              
               <div style={styles(theme).button} onClick={() => {setConfirmationPanel(false);resetDate(setDay,setMonth,setYear);playEffects(click);}}><MdClose style={styles(theme).miniIcon}/></div>
               <div style={styles(theme).button} onClick={() => {
                 const curDateString = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                 const habitgoals = goals.length > 0 ? goals.map(goal => ({text: goal, isDone: false})) : [];
                 if (showCreatePanel)createHabit(habitName, habitCategory, habitDescription, habitIcon, curDateString,habitgoals,isNegative,daysToForm)
                 else addHabit(habitId, habitName, false, curDateString,habitgoals,isNegative,daysToForm);
                 playEffects(click);
                 setConfirmationPanel(false);
                 setAddPanel('');
                 resetDate(setDay, setMonth, setYear);
                 playEffects(click);setConfirmationPanel(false);resetDate(setDay,setMonth,setYear);}}><MdDone style={styles(theme).miniIcon}/></div>
             </div>
            </div>
           </div>
         )}
        </div>
    )
}
export default AddHabitPanel;

// Helper function to render category options
const renderCategoryOptions = (theme, langIndex,fSize) => {
    const categories = Array.from(new Set(allHabits.map(h => h.category[langIndex])));
    return categories.map((category) => (
        <option key={category} value={category} style={{...styles(theme,false,fSize).text}}>
            {category}
        </option>
    ));
};

const addHabit =  (habitId,habitName,isCustom,dateString,goals,isNegative,daysToForm) => {
    if(AppData.IsHabitInChoosenList(habitId)) {
       setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list',2500,false);
      return;
    }
    addHabitFn(habitId,dateString,goals,isNegative,daysToForm);
    const message = !isCustom ? AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added' : AppData.prefs[0] === 0 ? `привычка: ${habitName} создана и добавлена` : `habit: ${habitName} was created and added`;
    setShowPopUpPanel(message,2500,true);
}

const createHabit =  (name,category,description,icon,dateString,goals,isNegative,daysToForm) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    if(!AppData.IsCustomHabitExists(habitId)){
      
      AppData.AddCustomHabit(name,category,description,icon,habitId);
      setTimeout(() => {addHabit(habitId,name,true,dateString,goals,isNegative,daysToForm);}, 100);
    }else{
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка с таким названием уже существует' : 'habit with this name already exists',2500,false);
    }
}

const searchHabitsList = (val, habitList, setHabitList) => {
    if(val.length > 0){
      const newList = getAllHabits().filter((habit) => {
        return habit.name[AppData.prefs[0]].toLowerCase().startsWith(val.toLowerCase());
      });
      setHabitList(newList);
    }else{
        const allNow = getAllHabits();
        if(habitList.length != allNow.length){
            setHabitList(allNow);
        }
    }
}


const styles = (theme, keyboardVisible,fSize) => ({
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
    overflow: "hidden",
    boxSizing:'border-box',
    overflowY: "scroll",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"95vw",
    height: "65vh"
  },
  confirmationPanel :
  {
    display:'flex',
    flexDirection:'column',
    alignItems: "center",
    justifyContent: "center",
    borderRadius:"24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    marginBottom:'15vw',
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"95%",
    height:"170vw"
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
  headerText :
  {
    textAlign: "center",
    margin:'5px',
    padding:'5px',
    fontSize:fSize ? "13px" : "15px",
    color: Colors.get('subText', theme),
  },
  scrollView:
  {
    overflowY: "auto",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
  },
  simplePanel:
  {
    marginLeft:'7.5vw',
    width: "70vw",
    height: "30vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
    background:"rgba(0, 0, 0, 0.1)",
    borderRadius:'24px',
  },
  input:
  {
    backgroundColor:Colors.get('simplePanel',theme),
    width:'65vw',
    height: "3vh",
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
    borderRadius:'12px',
    margin:'12px',
    fontSize:fSize ? "13px" : "15px",
    fontFamily:'Segoe UI',
    color:Colors.get('subText', theme),
  },
  simplePanelRow:
  {
    width:'85vw',
    display:'flex',
    flexDirection:'row',
    alignItems:'stretch',
    justifyContent:'space-around',
    userSelect: 'none',
    touchAction: 'none',
  },
  select:
  {
    width:'20vw',
    height:'6vw',
    borderRadius:'12px',
    border:`1px solid ${Colors.get('border', theme)}`,
    marginTop:'12px',
    fontSize:fSize ? "13px" : "15px",
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
  },
  selectOption:
  {
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
    fontSize:fSize ? "11px" : "13px",
  },
  selectPanel:
  {
    backgroundColor: Colors.get('habitCard', theme),
    borderRadius: '24px',
    border: `1px solid ${Colors.get('border', theme)}`,
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexWrap: 'wrap',
    width: '77vw',
    maxHeight: '42vh',
    overflowY: 'auto',
    padding: '16px',
    gap: '8px',
    justifyContent: 'center',
    zIndex: 1000
  },
  selectIcon:
  {
     flex:'{0,0,33.33%}',
     width:'20vw',
     boxSizing:'border-box',
     display:'flex',
     alignItems:'center',
     justifyContent:'center',
  },
  button:
  {
    display:'flex',
    alignContent:"center",
    justifyContent:"center",
    width:'15vw',
    marginTop:'12px',
    fontSize:'12px',
  },
  miniIcon: {
    fontSize: "28px",
    padding: "5px",
    marginTop: "10px",
    color: Colors.get('icons', theme),
    userSelect: 'none',
    touchAction: 'none',
    filter :`drop-shadow(0 0px 1px ${Colors.get('iconsShadow', theme)})`
  },
  slider:
  {
    width:'70%',
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
function confirmationText(lang,isCreatePanel,habitId,customHabitName)
{
  if(isCreatePanel){
     return lang === 0 ? 'добавить привычку ' + customHabitName + '?':'add habit ' + customHabitName + '?';
  }
  else{
    const name = getAllHabits().find(h => h.id === habitId).name[lang];
    return lang === 0 ? 'добавить привычку ' + name + '?':'add habit ' + name + '?';
  }
}
function needDaysInfo(lang,daysToForm,isNegative){
   if(isNegative){
    return lang === 0 ? 'мне нужно ' + daysToForm + ' дней чтобы бросить привычку':'i need ' + daysToForm + ' days to quit';
   }
   else{
    return lang === 0 ? 'мне нужно ' + daysToForm + ' дней для формирования привычки':'it takes ' + daysToForm + ' days to form a habit';
   }
}
function resetDate(setDay,setMonth,setYear){
  const now = new Date();
  setDay(now.getDate());
  setMonth(now.getMonth() + 1);
  setYear(now.getFullYear());
}

const setGoalForDefault = (habitName,langIndex) => {
  const goals = {
  // Health / Здоровье
  "Пить воду": [
    ["Пью стакан воды утром 7 дней", "Пью 1.5 л воды ежедневно 2 недели", "Пью 2 л воды 5+ дней в неделю 3 недели", "Слежу за водой (2–2.5 л) без пропусков 4 недели"],
    ["Drink a glass of water in the morning for 7 days", "Drink 1.5L water daily for 2 weeks", "Drink 2L water on 5+ days/week for 3 weeks", "Track 2–2.5L daily without missing 4 weeks"]
  ],
  "Хороший сон": [
    ["Сплю 7+ часов 5 ночей из 7", "Сплю 7–8 ч 6 ночей из 7, 3 недели", "Ложусь и встаю в одно время 5+ дней/неделю, 4 недели", "Поддерживаю режим сна 6+ ночей/неделю 5 недель"],
    ["Sleep 7+ hours on 5 out of 7 nights", "Sleep 7–8h on 6/7 nights for 3 weeks", "Go to bed & wake up at same time 5+ days/week for 4 weeks", "Maintain sleep schedule 6+ nights/week for 5 weeks"]
  ],
  "Двигаться каждый день": [
    ["10 мин движения ежедневно 7 дней", "30 мин активности 5+ дней/неделю, 3 недели", "Разные виды активности (ходьба, тренировка) 5 дней/неделю, 4 недели", "Активность 45+ мин 5 дней/неделю или 10k шагов, 5 недель"],
    ["10 min movement daily for 7 days", "30 min activity 5+ days/week for 3 weeks", "Mix of activities (walk, workout) 5 days/week for 4 weeks", "45+ min activity or 10k steps 5 days/week for 5 weeks"]
  ],
  "Здоровое питание": [
    ["Овощи в 1 приёме пищи ежедневно, 7 дней", "Овощи в 2 приёмах 5+ дней/неделю, 3 недели", "Цельные продукты >80% рациона 4 недели", "Готовлю здоровую еду 5+ дней/неделю, 5 недель"],
    ["Veggies in 1 meal daily for 7 days", "Veggies in 2 meals 5+ days/week for 3 weeks", "Whole foods >80% of diet for 4 weeks", "Cook healthy meals 5+ days/week for 5 weeks"]
  ],
  "Уход за телом": [
    ["Чищу зубы утром и вечером 7 дней", "Полный уход (зубы, душ, кожа) 6+ дней/неделю, 3 недели", "Добавляю 1 новую практику (например, скраб), 4 недели", "Уход без пропусков + уход за волосами/ногтями, 5 недель"],
    ["Brush teeth morning & evening for 7 days", "Full care (teeth, shower, skin) 6+ days/week for 3 weeks", "Add 1 new practice (e.g., exfoliation) for 4 weeks", "No missed days + hair/nail care for 5 weeks"]
  ],
  "Силовая тренировка": [
    ["1 силовая тренировка за неделю", "2 тренировки в неделю, 3 недели", "2 полноценные тренировки + прогрессия, 4 недели", "3 тренировки/неделю или работа с отягощениями, 5 недель"],
    ["1 strength workout this week", "2 workouts/week for 3 weeks", "2 full sessions + progressive overload for 4 weeks", "3 workouts/week or weighted training for 5 weeks"]
  ],
  "Бег": [
    ["Бег 10–15 мин 1 раз за неделю", "Бег 2×/неделю по 15 мин, 3 недели", "Бег 3×/неделю или 3 км за раз, 4 недели", "Бег 4×/неделю или улучшение выносливости, 5 недель"],
    ["Run 10–15 min once this week", "Run 2x/week for 15 min, 3 weeks", "Run 3x/week or 3 km/session for 4 weeks", "Run 4x/week or improve endurance for 5 weeks"]
  ],
  "Ходьба": [
    ["Ходьба 20 мин 3 дня на этой неделе", "7000 шагов или 30 мин 5+ дней/неделю, 3 недели", "8000+ шагов 5 дней/неделю, 4 недели", "10 000 шагов 5+ дней/неделю, 5 недель"],
    ["Walk 20 min on 3 days this week", "7k steps or 30 min 5+ days/week for 3 weeks", "8k+ steps 5 days/week for 4 weeks", "10k steps 5+ days/week for 5 weeks"]
  ],
  "Растяжка или йога": [
    ["Растяжка 10 мин 1 раз за неделю", "10–15 мин через день, 3 недели", "Йога/растяжка 4×/неделю, 4 недели", "Ежедневная практика 10+ мин, 5 недель"],
    ["10-min stretch once this week", "10–15 min every other day for 3 weeks", "Yoga/stretching 4x/week for 4 weeks", "Daily 10+ min practice for 5 weeks"]
  ],
  "Медитация и дыхание": [
    ["Медитация 5 мин 1 раз за неделю", "5–10 мин 5 дней/неделю, 3 недели", "10 мин ежедневно или дыхание при стрессе, 4 недели", "Медитация + осознанность в течение дня, 5 недель"],
    ["5-min meditation once this week", "5–10 min 5 days/week for 3 weeks", "10 min daily or breathwork during stress for 4 weeks", "Meditation + mindfulness throughout day for 5 weeks"]
  ],

  // Growth / Развитие
  "Чтение": [
    ["Читаю 10 мин 3 дня на этой неделе", "15 мин 5 дней/неделю, 3 недели", "20+ мин 5 дней/неделю + заметки, 4 недели", "Читаю книгу до конца или 30 мин/день, 5 недель"],
    ["Read 10 min on 3 days this week", "15 min 5 days/week for 3 weeks", "20+ min 5 days/week + notes for 4 weeks", "Finish a book or read 30 min/day for 5 weeks"]
  ],
  "Обучение навыкам": [
    ["Учусь 15 мин 1 раз за неделю", "20 мин 4 дня/неделю, 3 недели", "Проект или практика 3×/неделю, 4 недели", "Применяю навык в реальной задаче, 5 недель"],
    ["Learn 15 min once this week", "20 min 4 days/week for 3 weeks", "Work on project 3x/week for 4 weeks", "Apply skill to real task for 5 weeks"]
  ],
  "Иностранный язык": [
    ["Язык 10 мин 1 раз за неделю", "15 мин 5 дней/неделю, 3 недели", "Говорю/слушаю 3×/неделю + приложение, 4 недели", "Общение на языке или просмотр без субтитров, 5 недель"],
    ["Language 10 min once this week", "15 min 5 days/week for 3 weeks", "Speak/listen 3x/week + app for 4 weeks", "Converse or watch content without subs for 5 weeks"]
  ],
  "Ведение дневника": [
    ["Пишу 2 строки 1 раз за неделю", "3–5 предложений 5 дней/неделю, 3 недели", "Дневник + эмоции/идеи 4 дня/неделю, 4 недели", "Ежедневные записи + недельный обзор, 5 недель"],
    ["Write 2 lines once this week", "3–5 sentences 5 days/week for 3 weeks", "Journal + emotions/ideas 4 days/week for 4 weeks", "Daily entries + weekly review for 5 weeks"]
  ],
  "Рефлексия": [
    ["1 вопрос о дне 1 раз за неделю", "Рефлексия 5 дней/неделю, 3 недели", "Вопросы + выводы 5 дней/неделю, 4 недели", "Глубокая недельная рефлексия + план, 5 недель"],
    ["1 reflection question once this week", "Reflect 5 days/week for 3 weeks", "Questions + takeaways 5 days/week for 4 weeks", "Deep weekly reflection + plan for 5 weeks"]
  ],

  // Productivity / Продуктивность
  "Планирование дня": [
    ["План на день 1 раз за неделю", "Планирую вечером 6 дней/неделю, 3 недели", "План + приоритеты 6 дней/неделю, 4 недели", "Ежедневное планирование + гибкость, 5 недель"],
    ["Plan the day once this week", "Plan each evening 6 days/week for 3 weeks", "Plan + set priorities 6 days/week for 4 weeks", "Daily planning with adaptability for 5 weeks"]
  ],
  "Главная задача дня": [
    ["Сделал 1 важную задачу на неделе", "Главную задачу до обеда 4 дня/неделю, 3 недели", "Главную + 2 средние задачи 4 дня/неделю, 4 недели", "Завершаю важные задачи до 14:00, 5 недель"],
    ["Complete 1 important task this week", "Do #1 task before lunch 4 days/week for 3 weeks", "Do #1 + 2 medium tasks 4 days/week for 4 weeks", "Finish key tasks before 2 PM for 5 weeks"]
  ],
  "Работа по таймеру": [
    ["1 фокус-блок (25 мин) за неделю", "2 блока 3 дня/неделю, 3 недели", "3 блока 4 дня/неделю, 4 недели", "Фокус-блоки + защита от отвлечений, 5 недель"],
    ["1 focus block (25 min) this week", "2 blocks on 3 days/week for 3 weeks", "3 blocks on 4 days/week for 4 weeks", "Focus blocks + distraction shield for 5 weeks"]
  ],
  "Разбор входящих": [
    ["Проверил почту в одно время 1 день", "3 окна для входящих 5 дней/неделю, 3 недели", "2 окна + архивация, 4 недели", "Входящие обрабатываются до 18:00, 5 недель"],
    ["Check messages at set time on 1 day", "3 time blocks 5 days/week for 3 weeks", "2 blocks + inbox zero for 4 weeks", "Process all messages by 6 PM for 5 weeks"]
  ],
  "Вечерний обзор": [
    ["Подвёл итоги 1 раз за неделю", "Обзор + завтрашний план 5 вечеров/неделю, 3 недели", "Обзор + благодарность 5 вечеров/неделю, 4 недели", "Полный ритуал: итоги, план, мысли, 5 недель"],
    ["Review day once this week", "Review + plan tomorrow 5 evenings/week for 3 weeks", "Review + gratitude 5 evenings/week for 4 weeks", "Full ritual: review, plan, reflections for 5 weeks"]
  ],

  // Relationships & Recreation
  "Контакт с близкими": [
    ["Написал/позвонил 1 раз за неделю", "Контакт каждые 2 дня, 3 недели", "Голос/видео 3×/неделю, 4 недели", "Ежедневный микро-контакт или еженедельная встреча, 5 недель"],
    ["Message/call once this week", "Contact every 2 days for 3 weeks", "Voice/video 3x/week for 4 weeks", "Daily micro-contact or weekly meet-up for 5 weeks"]
  ],
  "Качественное общение": [
    ["15 мин без гаджетов 1 раз за неделю", "20 мин 3×/неделю, 3 недели", "30 мин без экранов 3×/неделю, 4 недели", "Полноценное общение 4×/неделю, 5 недель"],
    ["15 gadget-free mins once this week", "20 mins 3x/week for 3 weeks", "30 screen-free mins 3x/week for 4 weeks", "Quality time 4x/week for 5 weeks"]
  ],
  "Поддержка": [
    ["1 добрый жест за неделю", "Добрый поступок 4 дня/неделю, 3 недели", "Поддержка + внимание 4 дня/неделю, 4 недели", "Регулярная забота о близких, 5 недель"],
    ["1 kind act this week", "Kind gesture 4 days/week for 3 weeks", "Support + active care 4 days/week for 4 weeks", "Consistent care for loved ones for 5 weeks"]
  ],
  "Активное слушание": [
    ["Слушал без перебиваний 1 раз", "Практикую в 3 разговорах, 3 недели", "Слушаю и перефразирую 4×/неделю, 4 недели", "Активное слушание как привычка, 5 недель"],
    ["Listened without interrupting once", "Practice in 3 convos for 3 weeks", "Listen + paraphrase 4x/week for 4 weeks", "Active listening as default habit for 5 weeks"]
  ],
  "Благодарность": [
    ["Поблагодарил кого-то 1 раз", "Благодарность 5 дней/неделю, 3 недели", "Благодарность + причина 5 дней/неделю, 4 недели", "Ежедневная благодарность в словах или письме, 5 недель"],
    ["Thanked someone once", "Express thanks 5 days/week for 3 weeks", "Thanks + reason 5 days/week for 4 weeks", "Daily verbal or written gratitude for 5 weeks"]
  ],
  "Хобби": [
    ["Хобби 20 мин 1 раз за неделю", "30 мин 3×/неделю, 3 недели", "Хобби + творческий вызов 3×/неделю, 4 недели", "Регулярная практика с прогрессом, 5 недель"],
    ["Hobby 20 min once this week", "30 min 3x/week for 3 weeks", "Hobby + mini-challenge 3x/week for 4 weeks", "Consistent practice with visible progress for 5 weeks"]
  ],
  "Прогулка": [
    ["Прогулка 20 мин 1 раз за неделю", "20+ мин 4 дня/неделю, 3 недели", "Прогулка на природе 3×/неделю, 4 недели", "Ежедневная прогулка 30+ мин, 5 недель"],
    ["Walk 20 min once this week", "20+ min 4 days/week for 3 weeks", "Nature walk 3x/week for 4 weeks", "Daily 30+ min walk for 5 weeks"]
  ],
  "Сознательный отдых": [
    ["1 перерыв без телефона за неделю", "2 перерыва по 10 мин ежедневно, 3 недели", "3 перерыва + закрытые глаза, 4 недели", "Осознанные паузы между задачами, 5 недель"],
    ["1 phone-free break this week", "2x 10-min breaks daily for 3 weeks", "3 breaks + eyes closed for 4 weeks", "Mindful pauses between tasks for 5 weeks"]
  ],
  "Творчество": [
    ["Создал что-то 1 раз за неделю", "Творчество 2×/неделю, 3 недели", "Проект или эксперимент 2×/неделю, 4 недели", "Еженедельное завершение творческой задачи, 5 недель"],
    ["Created something once this week", "Create 2x/week for 3 weeks", "Project or experiment 2x/week for 4 weeks", "Finish creative task weekly for 5 weeks"]
  ],
  "Цифровой детокс": [
    ["1 час без соцсетей 1 раз за неделю", "1 час 6 дней/неделю, 3 недели", "Утро/вечер без экранов, 4 недели", "Цифровой детокс по расписанию, 5 недель"],
    ["1 hour without social media once this week", "1 hour 6 days/week for 3 weeks", "Screen-free morning/evening for 4 weeks", "Scheduled digital detox for 5 weeks"]
  ],

  // Bad Habits to Quit
  "Сладкое и фастфуд": [
    ["Без сладкого/фастфуда 5 дней", "≤2 раза/неделю, 3 недели", "Только в выходные или 1 раз/неделю, 4 недели", "Полный контроль: только осознанные порции, 5 недель"],
    ["No sweets/fast food on 5 days", "≤2x/week for 3 weeks", "Only on weekends or 1x/week for 4 weeks", "Full control: only mindful portions for 5 weeks"]
  ],
  "Поздний отход ко сну": [
    ["Ложусь до 23:30 4 ночи", "До цели 6 ночей/неделю, 3 недели", "Одинаковое время отбоя 5+ дней, 4 недели", "Режим сна + ритуал засыпания, 5 недель"],
    ["Bed by 11:30 PM on 4 nights", "By target time 6 nights/week for 3 weeks", "Consistent bedtime 5+ days for 4 weeks", "Sleep schedule + wind-down ritual for 5 weeks"]
  ],
  "Прокрастинация": [
    ["Начал задачу сразу 1 раз", "Начинаю в течение 10 мин 4 дня/неделю, 3 недели", "Разбиваю задачи + начинаю сразу, 4 недели", "Работаю по расписанию без откладывания, 5 недель"],
    ["Started a task right away once", "Begin within 10 min 4 days/week for 3 weeks", "Break tasks + start immediately for 4 weeks", "Work by schedule, no delays for 5 weeks"]
  ],
  "Лишний экран": [
    ["Скроллинг –30 мин 1 день", "≤30 мин/день 6 дней/неделю, 3 недели", "Уведомления выключены + скроллинг по расписанию, 4 недели", "Экран только по делу, 5 недель"],
    ["Reduced scrolling by 30 min on 1 day", "≤30 min/day 6 days/week for 3 weeks", "Notifications off + scheduled scrolling for 4 weeks", "Screen only for purpose for 5 weeks"]
  ],
  "Нездоровые перекусы": [
    ["Здоровый перекус 5 дней", "Здоровые перекусы 4 дня/неделю, 3 недели", "План перекусов + вода вместо еды, 4 недели", "Нет импульсивных перекусов, 5 недель"],
    ["Healthy snack on 5 days", "Healthy snacks 4 days/week for 3 weeks", "Snack plan + water instead of food for 4 weeks", "No impulsive snacking for 5 weeks"]
  ],
  "Игры слишком много": [
    ["Игры ≤1 ч 1 день", "≤1 ч/день (или 0 в будни) 6 дней/неделю, 3 недели", "Таймер + альтернатива (хобби), 4 недели", "Игры только по плану, 5 недель"],
    ["Gaming ≤1h on 1 day", "≤1h/day (or 0 on weekdays) 6 days/week for 3 weeks", "Timer + hobby alternative for 4 weeks", "Gaming only as scheduled for 5 weeks"]
  ],
  "Порно": [
    ["Без порно 7 дней", "Полный отказ + блокировка, 3 недели", "Удалены триггеры + поддержка, 4 недели", "Новые привычки вместо старых, 5 недель"],
    ["No porn for 7 days", "Full abstinence + blockers for 3 weeks", "Triggers removed + support system for 4 weeks", "New habits replace old for 5 weeks"]
  ],
  "Курение": [
    ["–30% сигарет на неделе", "–50% или замена, 3 недели", "Курю только в определённых ситуациях, 4 недели", "Полный отказ или замена без срывов, 5 недель"],
    ["–30% cigarettes this week", "–50% or substitute for 3 weeks", "Smoke only in specific contexts for 4 weeks", "Full quit or clean substitution for 5 weeks"]
  ],
  "Алкоголь": [
    ["Алкоголь ≤1 раза на неделе", "≤1 раз/неделю и ≤1 порция, 3 недели", "Только по особым случаям, 4 недели", "Полный перерыв или осознанное употребление, 5 недель"],
    ["Alcohol ≤1x this week", "≤1x/week and ≤1 serving for 3 weeks", "Only on special occasions for 4 weeks", "Full break or fully mindful use for 5 weeks"]
  ]
};

  return habitName in  goals ? goals[habitName][langIndex] : [];
}