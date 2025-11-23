import { useState, useEffect} from 'react';
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { useLongPress } from 'use-long-press';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, setAddPanel,addPanel$ ,theme$,lang$,setKeyboardVisible,setCurrentBottomBtn, keyboardVisible$ } from '../../StaticClasses/HabitsBus';
import {FaBackspace,FaPlusSquare,FaSearchPlus,FaSearch,FaRegWindowClose,FaListAlt} from 'react-icons/fa'
import {MdFiberNew,MdDone,MdClose,} from 'react-icons/md'
import {FiPlus,FiMinus} from 'react-icons/fi'
import Icons from '../../StaticClasses/Icons';
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
    const [keyboardVisible, setKeyboardVisibleState] = useState(false);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [showCreatePanel,setshowCreatePanel] = useState(false);
    const [addPanel,setAddPanelState] = useState('');
    const [confirmationPanel,setConfirmationPanel] = useState(false);
    
    // Habit data state
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [habitIcon, setHabitIcon] = useState('default');
    const [habitId, setHabitId] = useState(-1);

    //date
    const [year,setYear] = useState(new Date().getFullYear());
    const [month,setMonth] = useState(new Date().getMonth());
    const [day,setDay] = useState(new Date().getDate());
    
    // UI state
    const [habitList, setHabitList] = useState(getAllHabits());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const [iconName, setIconName] = useState('default');
    const [addButtonEnabled, setAddButtonEnabled] = useState(false);
    const [addButtonContext, setAddButtonContext] = useState({
        text: langIndex === 0 ? 'Добавить' : 'Add',
        onClick: () => addHabit(false)
    });
    const handleDateDown = (isIncr,dateType) => {
        if(dateType === 2)setDay(getday(isIncr,day,year,month));
        else if(dateType === 1)setMonth(!isIncr ? month - 1 > 0 ? month - 1 : 12 : month + 1 < 12 ? month + 1 : 1);
        else if(dateType === 0)setYear(isIncr && year + 1 <= now.getFullYear() + 2 && year -1 >= now.getFullYear() - 2 ? year + 1 : year - 1);
    }
    const bindYearhMinus = useLongPress(() => handleDateChange(false, 0), {
      threshold: 1000,
      interval: 500
    });
     const bindYearPlus = useLongPress(() => handleDateChange(true, 0), {
      threshold: 1000,
       interval: 500
    });
    const bindMonthMinus = useLongPress(() => handleDateChange(false, 1), {
      threshold: 700,
      interval: 300
    });
     const bindMonthPlus = useLongPress(() => handleDateChange(true, 1), {
      threshold: 700,
       interval: 300
    });
    const bindDayMinus = useLongPress(() => handleDateChange(false, 2), {
      threshold: 500,
      interval: 100
    });
    const bindDayPlus = useLongPress(() => handleDateChange(true, 2), {
      threshold: 500,
       interval: 100
    });
    
    const months =[ ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']];
    useEffect(() => {
    const subscription = theme$.subscribe(setTheme);
    const langSubscription = lang$.subscribe(setLang);
    const keyboardSubscription = keyboardVisible$.subscribe(setKeyboardVisibleState);
    
    return () => {
      subscription.unsubscribe();
      langSubscription.unsubscribe();
      keyboardSubscription.unsubscribe();
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
        else if (index === 2) setHabitDescription(value[0].toUpperCase() + value.toLowerCase().slice(1));}
    };
    
    useEffect(() => {
      if (habitName.length > 3 && habitCategory.length > 3) {
        setAddButtonEnabled(true);
        setAddButtonContext({
          text: langIndex === 0 ? 'создать и добавить' : 'create and add',
          onClick: () => createHabit(habitName, habitCategory, habitDescription, habitIcon)
        });
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
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'добавь привычку' : 'add habit'}</div>
           <div style={{...styles(theme).simplePanel,height: keyboardVisible ? "66vh" : "52vh"}}>
            <div style={{display:'flex',flexDirection:'row'}}>
              <FaSearch style={{color:Colors.get("mainText",theme),width:'5vw',marginTop:'10px',marginLeft:'10px'}}/>
              <input type="text" onFocus={() => setKeyboardVisible(true)} onBlur={() => setKeyboardVisible(false)} style={{...styles(theme).input,height: keyboardVisible ? "50%" : "40%"}}
              onChange={(e) => searchHabitsList(e.target.value,habitList, setHabitList) }/>
            </div>
            <div style={styles(theme).scrollView}>
              {habitList.map((habit) => !AppData.choosenHabits.includes(habit.id) && (
                <li key={habit.id} style={{...styles(theme).text,borderRadius:"24px",backgroundColor: habit.id === selectedHabit ? Colors.get('highlitedPanel', theme) : 'transparent'}}
                onClick={() => {setSelectedHabit(habit.id);setHabitId(habit.id);setAddButtonEnabled(true);playEffects(click);
                setAddButtonContext({text: langIndex === 0 ? 'Добавить' : 'Add',onClick: () => addHabit(habit.id,habit.name[langIndex],false)})}}>
                  <p style={styles(theme).text}>{habit.name[langIndex]}</p>
                </li>
              ))}
           </div>
           </div>
           {/* buttons */}
           <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignContent:'center'}}>
             <div style={{...styles(theme).button}} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);playEffects(click);}}><FaBackspace style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {setshowCreatePanel(true);setAddButtonEnabled(false);}}><MdFiberNew style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {if(addButtonEnabled){setConfirmationPanel(true);playEffects(click);}}}><FaPlusSquare style={{...styles(theme).miniIcon,color: addButtonEnabled ?  Colors.get('icons', theme) : Colors.get('iconsDisabled', theme)}}/></div>
           </div>
           </div>)}
           {/* creation panel */}
           {showCreatePanel && (<div style={styles(theme, keyboardVisible).panel}>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'или создай свою' : 'or create your own'}</div>
           <div style={{...styles(theme).simplePanel,height: keyboardVisible ? "66vh" : "52vh",justifyContent:'center'}}>
            <textarea maxLength={25} placeholder={langIndex === 0 ? 'имя' : 'name'} style={styles(theme).input}
            onChange={(e) => handleInputValue(e.target.value,0)} onFocus={() => setKeyboardVisible(true)} onBlur={() => setKeyboardVisible(false)}/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <textarea  maxLength={25} placeholder={habitCategory === '' ? langIndex === 0 ? 'категория' : 'category' : habitCategory} style={{...styles(theme).input,width:"48%"}}
              onChange={(e) => handleInputValue(e.target.value,1)} onFocus={() => setKeyboardVisible(true)} onBlur={() => setKeyboardVisible(false)}/>
              <select style={{...styles(theme).input,width:"48%"}} onChange={(e) => handleInputValue(e.target.value,1)}>
                {renderCategoryOptions(theme, langIndex)}
              </select>
            </div>
            <textarea maxLength={60} placeholder={langIndex === 0 ? 'описание(опционально)' : 'description(optional)'} style={{...styles(theme).input,height: keyboardVisible ? "40%" : "25%"}}
            onChange={(e) => handleInputValue(e.target.value,2)} onFocus={() => setKeyboardVisible(true)} onBlur={() => setKeyboardVisible(false)}/>
            <div style={styles(theme).headerText}>{langIndex === 0 ? 'выбери иконку(опционально)' : 'choose icon(optional)'}</div>
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
           <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignContent:'center'}}>
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
                     setAddButtonContext({
                       text: langIndex === 0 ? 'создать и добавить' : 'create and add',
                       onClick: () => {
                         createHabit(habitName, habitCategory, habitDescription, key);
                         playEffects(click);
                       }
                     });
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
             <p style={styles(theme).text}>{confirmationText(langIndex,showCreatePanel,habitId,habitName)}</p>
             <div style={{...styles(theme).simplePanelRow,flexDirection:'column',alignItems:'center',backgroundColor:Colors.get('background', theme),width:'90%',borderRadius:'24px'}}>
               <p style={styles(theme).text}>{langIndex === 0 ? 'установите дату' : 'set date'}</p>
               <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                   <div {...bindYearhMinus} onClick={() => {if(now.getFullYear() - 2 <= year - 1)setYear(year - 1);playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus/></div>
                   <p style={styles(theme).textDate}> {year} </p>
                   <div {...bindYearPlus} onClick={() => {if(now.getFullYear() + 2 >= year + 1)setYear(year + 1);playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus/></div>
               </div>
               <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                   <div {...bindMonthMinus} onClick={() => {setMonth(month - 1 > 0 ? month - 1 : 12);playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus/></div>
                   <p style={styles(theme).textDate}> {months[langIndex][month - 1]} </p>
                   <div {...bindMonthPlus} onClick={() => {setMonth(month + 1 < 12 ? month + 1 : 1);playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus/></div>
               </div>
               <div style={{...styles(theme).simplePanelRow,width:'70%'}}>
                   <div {...bindDayMinus} onClick={() => {setDay(getday(false,day,year,month));playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiMinus/></div>
                   <p style={styles(theme).textDate}> {day} </p>
                   <div {...bindDayPlus} onClick={() => {setDay(getday(true,day,year,month));playEffects(click);}} style={{...styles(theme).miniIcon,fontSize:'20px',marginTop:'15px'}}><FiPlus/></div>
               </div>
             </div>
             <div style={styles(theme).simplePanelRow}>
               <div style={styles(theme).button} onClick={() => {setConfirmationPanel(false);resetDate(setDay,setMonth,setYear);playEffects(click);}}><MdClose style={styles(theme).miniIcon}/></div>
               <div style={styles(theme).button} onClick={() => {addButtonContext.onClick();playEffects(click);}}><MdDone style={styles(theme).miniIcon}/></div>
             </div>
            </div>
           </div>
         )}
        </div>
    )
}

export default AddHabitPanel;

// Helper function to render category options
const renderCategoryOptions = (theme, langIndex) => {
    const categories = Array.from(new Set(allHabits.map(h => h.category[langIndex])));
    return categories.map((category) => (
        <option key={category} value={category} style={{...styles(theme).text}}>
            {category}
        </option>
    ));
};


// Removed unused external file and crop handlers; logic moved inside component

const addHabit =  (habitId,habitName,isCustom) => {
    if (typeof addHabitFn !== 'function') {
      console.warn('AddHabitPanel: addHabitFn is not set yet. Ensure HabitsMain is mounted.');
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'экран привычек ещё не готов' : 'habits screen not ready yet', 2000,false);
      return;
    }
    if(AppData.IsHabitInChoosenList(habitId)) {
       setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list',2500,false);
      return;
    }
    addHabitFn(habitId);
    const message = !isCustom ? AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added' : AppData.prefs[0] === 0 ? `привычка: ${habitName} создана и добавлена` : `habit: ${habitName} was created and added`;
    setShowPopUpPanel(message,2500,true);
}

const createHabit =  (name,category,description,icon) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    if(!AppData.IsCustomHabitExists(habitId)){
      
      AppData.AddCustomHabit(name,category,description,icon,habitId);
      setTimeout(() => {addHabit(habitId,name,true);}, 100);
    }else{
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка с таким названием уже существует' : 'habit with this name already exists',2500,false);
    }
}

const searchHabitsList = (name, habitList, setHabitList) => {
    if(name.length > 0){
      const newList = getAllHabits().filter((habit) => {
        return habit.name[AppData.prefs[0]].toLowerCase().startsWith(name.toLowerCase());
      });
      setHabitList(newList);
    }else{
        const allNow = getAllHabits();
        if(habitList.length != allNow.length){
            setHabitList(allNow);
        }
    }
}


const styles = (theme, keyboardVisible) => ({
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
    zIndex: 9900,
    padding: '20px',
  },
  panel :
  {
    alignItems: "center",
    justifyContent: "center",
    borderRadius:"24px",
    overflow: "hidden",
    boxSizing:'border-box',
    overflowY: "scroll",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"85vw",
    height: keyboardVisible ? "85vh" : "65vh"
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
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"85vw",
    height:"80vw"
  },
  text :
  {
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('mainText', theme),
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
    fontSize: "14px",
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
    width:'65vw',
    height: keyboardVisible ? "6vh" : "3vh",
    borderRadius:'12px',
    border:`1px solid ${Colors.get('border', theme)}`,
    margin:'12px',
    fontSize:'14px',
    fontFamily:'Segoe UI',
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('inputField', theme),
  },
  simplePanelRow:
  {
    width:'75vw',
    display:'flex',
    flexDirection:'row',
    alignItems:'stretch',
    justifyContent:'space-around',
  },
  select:
  {
    width:'20vw',
    height:'6vw',
    borderRadius:'12px',
    border:`1px solid ${Colors.get('border', theme)}`,
    marginTop:'12px',
    fontSize:'14px',
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
  },
  selectOption:
  {
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
    fontSize:'8px',
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
    userSelect: 'none',
    touchAction: 'none',
    fontSize: "28px",
    padding: "5px",
    marginTop: "10px",
    color: Colors.get('icons', theme),
    filter :`drop-shadow(0 0px 1px ${Colors.get('iconsShadow', theme)})`
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
function getday(isMax,day,year,month){
  const daysInMonth = new Date(year, month, 0).getDate();
  return isMax ? day + 1 <= daysInMonth ? day + 1 : 1 : day - 1 > 0 ? day - 1 : daysInMonth;
}
function resetDate(setDay,setMonth,setYear){
  const now = new Date();
  setDay(now.getDate());
  setMonth(now.getMonth());
  setYear(now.getFullYear());
}