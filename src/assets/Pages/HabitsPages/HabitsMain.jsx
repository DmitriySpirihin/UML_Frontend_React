import React, {useState,useEffect} from 'react'
import { motion , useTransform, useMotionValue,animate} from 'framer-motion'
import Icons from '../../StaticClasses/Icons';
import { allHabits} from '../../Classes/Habit.js'
import { AppData,getHabitPerformPercent,UserData } from '../../StaticClasses/AppData.js'
import { expandedCard$, setExpandedCard} from '../../StaticClasses/HabitsBus.js';
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,premium$,confirmationPanel$, updateConfirmationPanel,setShowPopUpPanel,setPage,} from '../../StaticClasses/HabitsBus'
import {MdDoneAll} from 'react-icons/md'
import {FaPlusSquare,FaTrash,FaPencilAlt,FaRegWindowClose,FaListAlt,FaArrowUp} from 'react-icons/fa'
import {FaRegSquareCheck,FaRegSquare} from 'react-icons/fa6'
import {TbDotsVertical,TbArrowMoveDownFilled,TbArrowMoveUpFilled} from 'react-icons/tb'
//timer
import TimerIcon from '@mui/icons-material/TimerTwoTone';
import TimerOffIcon from '@mui/icons-material/TimerOffTwoTone';
import Slider from '@mui/material/Slider';



import {MdClose,MdDone} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';
import { set } from 'animejs';
import { del } from 'idb-keyval';
const dateKey = new Date().toISOString().split('T')[0];
const clickSound = new Audio('Audio/Click.wav');
const skipSound = new Audio('Audio/Skip.wav');
const isDoneSound = new Audio('Audio/IsDone.wav'); 
export let removeHabitFn;
export let addHabitFn;
export let currentId;

const HabitsMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [habitsCards, setHabitsCards] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize,setFontSize] = useState(0);
    const [hasHabits, setHasHabits] = useState(AppData.choosenHabits.length > 0);
    const [currentId, setCurrentId] = useState(0);
    const [dataVersion, setDataVersion] = useState(0);

    // redact habits and goals   operation : 0 redact habit , 1 add goal, 2 redact goal, 3 delete goal, 4 move goal up, 5 move goal down
    const [cP,setCP] = useState({
        show:false,type:-1,hId:0,gId:0,setGoals:null,hInfo:null   
    }) 
    const [newGoal,setNewGoal] = useState('');
    const [newName,setNewName] = useState('');
    const [newDescr,setNewDescr] = useState('');
    const [newIcon,setNewIcon] = useState('');
    const [selectIconPanel, setSelectIconPanel] = useState(false);

    const [habitTodelete, setHabitToDelete] = useState(null);
    const [confirmMessage, setConfirmMessage] = useState('');
    const [needConfirmation, setNeedConfirmation] = useState(false);

    // move goals effect
    useEffect(() => {
      if(cP.type === 0){
        setNewName(getAllHabits()[cP.hId].name[langIndex]);
        setNewDescr(getAllHabits()[cP.hId].description[langIndex]);
        setNewIcon(getAllHabits()[cP.hId].iconName);
      }
       if (cP.type === 4) {
        if (cP.gId <= 0) return;
        cP.setGoals(prev => {
          const newGoals = [...prev];
          [newGoals[cP.gId - 1], newGoals[cP.gId]] = [newGoals[cP.gId], newGoals[cP.gId - 1]];
          AppData.choosenHabitsGoals[cP.hId] = newGoals;
          return newGoals;
        });
      } 
      else if (cP.type === 5) {
        cP.setGoals(prev => {
        if (cP.gId >= prev.length - 1) return prev;
        const newGoals = [...prev];
        [newGoals[cP.gId], newGoals[cP.gId + 1]] = [newGoals[cP.gId + 1], newGoals[cP.gId]];
        AppData.choosenHabitsGoals[cP.hId] = newGoals;
        return newGoals;
      });
    }
    },[cP]);
    // redact habits and goals
    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        const subscription2 = fontSize$.subscribe(setFontSize);
        const subscription3 = confirmationPanel$.subscribe(setNeedConfirmation);
        return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
          subscription3.unsubscribe();
        };
    }, []);
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    // Initialize habits cards on mount
    useEffect(() => {
        setHabitsCards(AppData.choosenHabits);
    }, []);

    // Update categories whenever habitsCards changes
    useEffect(() => {
        if (habitsCards.length > 0) {
            const cats = new Set();
            habitsCards.forEach(id => {
                const h = getAllHabits().find(h => h.id === id);
                if (h && !cats.has(h.category[0])) {
                    cats.add(h.category[0]);
                }
            });
            setCategories(Array.from(cats));
        }
    }, [habitsCards]);
    // functions to add/remove habits at runtime
    const addHabit = (habitId,dateString,goals,isNegative,daysToForm) => {
        // Use Set to ensure no duplicates before adding
        setHabitsCards(prev => {
            const newHabits = new Set(prev);
            if (!newHabits.has(habitId)) {
                AppData.addHabit(habitId,dateString,goals,isNegative,daysToForm);
                return [...newHabits,habitId];
            }
            return prev;
        });
        setHasHabits(AppData.choosenHabits.length > 0);
    };
    const removeHabit = (habitId) => {
        if (habitsCards.includes(habitId)) {
            AppData.removeHabit(habitId);
            setHabitsCards(prev => prev.filter(id => id !== habitId));
            const habitObj = getAllHabits().find(h => h.id === habitId);
            const nameArr = habitObj?.name || ["",""];
            const name = nameArr[langIndex] || (langIndex === 0 ? "Привычка" : "Habit");
            const popUpText = langIndex === 0 
            ? `Привычка: \'${name}\' удалена`
            : `Habit: \'${name}\' deleted`;
            setShowPopUpPanel(popUpText,2000,true);
            setHasHabits(AppData.choosenHabits.length > 0);
        }
    };
    const onConfirmAction = () => {
      switch (cP.type){
        case 0 :
          const index = AppData.CustomHabits.findIndex(h => h.id === cP.hId);
         AppData.CustomHabits = AppData.CustomHabits.map((habit, i) =>
              i === index
              ? {
              ...habit,
            name: [newName.trim(), newName.trim()],
            description: [newDescr.trim(), newDescr.trim()],
            iconName: newIcon
           }
          : habit
        );
        
         setHabitsCards(prev => [...prev]);
         setCP(prev => ({ ...prev, show: false }));
         cP.hInfo({name:[newName,newName],description:[newDescr,newDescr],iconName:newIcon});
         setDataVersion(v => v + 1);
        break;
        case 1 :
          if (newGoal.length > 0) {
          cP.setGoals(prev => [...prev, { text: newGoal, isDone: false }]);
          AppData.addHabitGoal(cP.hId,{text:newGoal,isDone:false});
          setCP(prev => ({...prev,show:false}));
        }
        else setShowPopUpPanel( langIndex === 0 ? 'Введите цель' : 'Enter goal',2000,false);
        break;
        case 2 :
          if (newGoal.length > 0) {
          cP.setGoals(prev => prev.map((goal, idx) => idx === cP.gId ? { ...goal, text: newGoal.trim() } : goal));
          AppData.choosenHabitsGoals[cP.hId][cP.gId].text = newGoal;
          setCP(prev => ({...prev,show:false}));
        }
        else setShowPopUpPanel( langIndex === 0 ? 'Введите цель' : 'Enter goal',2000,false);
        break;
        case 3 :
          cP.setGoals(prev => prev.filter((_, i) => i !== cP.gId));
          AppData.choosenHabitsGoals[cP.hId].splice(cP.gId);
          setCP(prev => ({...prev,show:false}));
        break;
      }
      
    };
    
    removeHabitFn = removeHabit;
    addHabitFn = addHabit;
    // render    
    return (
        <div style={styles(theme).container}>
          {
            needConfirmation && <div style={styles(theme).confirmContainer}>
              <div style={styles(theme).cP}>
                <div style={styles(theme,fSize).mainText}>{confirmMessage}</div>
                <div style={styles(theme).buttonsContainer}>
                  <MdClose style={styles(theme).icon} onClick={() => setNeedConfirmation(false)} />
                  <MdDone style={styles(theme).icon} onClick={() =>{removeHabit(habitTodelete);setNeedConfirmation(false)}} />
                </div>
              </div>
            </div>
          }
            {!hasHabits && <div style={{...styles(theme).panel,justifyContent:'center',alignItems:'center', marginTop:'40%'}}>
              <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',margin:'10%',marginTop:'20%',whiteSpace:'pre-line',color:Colors.get('subText', theme)}}>{setInfoText(langIndex)}</p>
            </div>}
            {hasHabits && <div style={styles(theme).scrollView} key={dataVersion}>
              {buildMenu({ theme, habitsCards, categories, setCP, setCurrentId, fSize,setNeedConfirmation,setConfirmMessage,setHabitToDelete })}
           </div>}
        {cP.show && cP.type > 0 && cP.type < 4 && (
                   <div style={styles(theme).confirmContainer}>
                    <div style={styles(theme).cP}>
                      {cP.type === 1 && <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',marginTop:'5%',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'Введите цель' : 'Enter goal'}</p>}
                      {cP.type === 2 && <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',marginTop:'5%',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'Введите новое имя' : 'Enter new name'}</p>}
                      {cP.type === 3 && <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',marginTop:'5%',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'Удалить цель?' : 'Delete goal?'}</p>}
                      {cP.type !== 3 && <MyInput
                        w='80%'
                        h='20%'
                        maxL={70}
                        value={cP.type === 2 ? AppData.choosenHabitsGoals[cP.hId][cP.gId]?.text : ''}
                        onChange={value => setNewGoal(value)}
                        placeholder={langIndex === 0 ? 'Введите цель' : 'Enter goal'}
                        theme={theme}
                      />}
                     <div style={styles(theme).simplePanelRow}>
                       <MdClose style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => setCP(prev => ({...prev,show:false}))}/>
                       <MdDone style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {onConfirmAction();}}/>
                    </div>
                </div>
              </div>
            )}
            {cP.show && cP.type === 0 && cP.type < 4 && (
                   <div style={styles(theme).confirmContainer}>
                    <div style={{...styles(theme).cP,height:'50vh'}}>
                    <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '13px' : '15px',marginTop:'5%',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'Измени привычку' : 'Change habit'}</p>
                      <MyInput w='80%'h='10%'maxL={30}
                        value={getAllHabits().find(v => v.id === cP.hId).name[langIndex]}
                        onChange={value => setNewName(value)}
                        placeholder={langIndex === 0 ? 'Введите новое имя' : 'Enter new name'}
                        theme={theme}
                      />
                      <MyInput w='80%'h='20%'maxL={200}
                        value={getAllHabits().find(v => v.id === cP.hId).description[langIndex]}
                        onChange={value => setNewDescr(value)}
                        placeholder={langIndex === 0 ? 'Введите новое описание' : 'Enter new description'}
                        theme={theme}
                      />
                      <div style={{...styles(theme).subText,fontSize:fSize === 0 ? '13px' : '15px',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'измени иконку' : 'cange icon'}</div>
            <div style={{display:'flex',alignContent:'space-between',justifyContent:'center',width : '50%'}}>
              <div style={{width: '80%',padding:'5px'}}>
               <div  onClick={() => setSelectIconPanel(selectIconPanel ? false : true)}>
                {!selectIconPanel && (<FaListAlt style={{fontSize:'24px',marginTop:'15px',color:Colors.get('icons', theme)}}/>)}{selectIconPanel && (<FaRegWindowClose style={{fontSize:'24px',marginTop:'15px',color:Colors.get('icons', theme)}}/>)}
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
                {Icons.getIcon(newIcon, {
                  size: 48,
                  style: {
                    fontSize:'30px',
                    marginBottom:'20px',
                    color: Colors.get("habitIcon", theme),
                    filter: 'drop-shadow(1px 1px 1px rgba(0, 0, 0, 0.5))'
                  }
                })}
              </div>
            </div>
                     <div style={styles(theme).simplePanelRow}>
                       <MdClose style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => setCP(prev => ({...prev,show:false}))}/>
                       <MdDone style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {onConfirmAction();}}/>
                    </div>
                </div>
              </div>
            )}
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
                   setNewIcon(key);
                   setSelectIconPanel(false);
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
        </div>
        
    )
}

export default HabitsMain

function getAllHabits() {
    return allHabits.concat(
        (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
    );
}

function buildMenu({ theme, habitsCards, categories, setCP, setCurrentId, fSize,setNeedConfirmation,setConfirmMessage,setHabitToDelete }) {
    return categories.map(category => {
        const habitsInCategory = habitsCards
            .map(id => getAllHabits().find(h => h.id === id))
            .filter(h => h && h.category[0] === category);

        return (
            <CategoryPanel key={category} text={getAllHabits().find(h => h.category[0] === category)?.category } theme={theme} isNegative={category === 'Отказ от вредного'}
            setConfirmMessage={setConfirmMessage}
                   setNeedConfirmation= {setNeedConfirmation}
                   setHabitToDelete={setHabitToDelete}>
                {habitsInCategory.map(habit => (
                    <HabitCard
                      key={habit.id}
                    id={habit.id}
                   theme={theme}
                    setCP={setCP}
                   setCurrentId={setCurrentId}
                   fSize={fSize}
                   setConfirmMessage={setConfirmMessage}
                   setNeedConfirmation= {setNeedConfirmation}
                   setHabitToDelete={setHabitToDelete}
                    />
                ))}
            </CategoryPanel>
        );
    }
);
}
function HabitCard({ id = 0, theme, setCP, setCurrentId, fSize ,setNeedConfirmation,setConfirmMessage,setHabitToDelete}) {
    const [status, setStatus] = useState(AppData.habitsByDate[dateKey]?.[id]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const habit = getAllHabits().find(h => h.id === id);
    if(!habit)return null;
    const [habitInfo, setHabitInfo] = useState({
  name: habit?.name || ["", ""],
  descr: habit?.description || ["", ""],
  icon: habit?.iconName || "default"
});
      
    const isNegative = habit.category[0] === 'Отказ от вредного';
    const percent = getHabitPerformPercent(id);
    const maxX = 120;
    const minX = -maxX;
    const [canDrag, setCanDrag] = useState(true);
    let cardColor = status === 0 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 1 ? 'habitCardDone' : 'habitCardSkipped', theme);//Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme);
    let leftColor = status === 1 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 0 ? 'habitCardSkipped' : 'habitCardSkipped', theme);
    let rightColor = status === -1 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 0 ? 'habitCardDone' : 'habitCardDone', theme);
    
    const [expanded, setExpanded] = useState(false);
    const [_color, setColor] = useState(cardColor);
    const [showAddOptions,setShowAddOptions] = useState(false);
    const [showHabitAddOptions,setShowHabitAddOptions] = useState(false);
    const [habitsGoals,setHabitGoals] = useState(AppData.choosenHabitsGoals[id]);
    const [currentGoal,setCurrentGoal] = useState(0);
    const [showTimerSlider,setShowTimerSlider] = useState(false);
    const [timer,setTimer] = useState(isNegative ? true : false);
    const [maxTimer,setMaxTimer] = useState(isNegative ? 86400000 : 60000);
    const [time,setTime] = useState(isNegative ? Math.round(Date.now() - new Date(AppData.choosenHabitsLastSkip[id])) : 60000);
    const [lastSkip,setLastSkip] = useState(isNegative ? Date.now() : 0);
    const [progress,setProgress] = useState(0);
    // premium status
    useEffect(() => {
      const subscription = premium$.subscribe(setHasPremium);
      return () => subscription.unsubscribe();
    }, []);
    // timer
    useEffect(() => {
  if (timer) {
    let temp = 0;
    const interval = setInterval(() => {
    temp += 50;
    const newProgress = ((time + temp) / maxTimer) * 100;
    setProgress(newProgress);
    if(temp === 1000){ setTime(prevTime => {
      const newTime = prevTime + 1000;
      temp = 0;
    if(!isNegative){
       {
        isDoneSound.play();
        clearInterval(interval);
        setStatus(1);
        setTime(0);
        setTimer(false);
        setProgress(0);
      }
    }else{
      if (newTime >= maxTimer){
        if(status < 1){
           setStatus(1);
        }
      }
    }
      return newTime;
    });}
    }, 50);

    return () => clearInterval(interval);
  }
}, [time,timer, maxTimer]);
    // Handle language changes
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
      AppData.changeStatus(dateKey,id,status);
    }, [status]);

    // Get the appropriate icon based on whether it's a custom habit or not
    const getHabitIcon = () => {
  const habit = getAllHabits().find(h => h.id === id);
  
  // ✅ Full safety: check habit AND habit.name
  if (!habit || !habit.name || !Array.isArray(habit.name) || habit.name.length === 0) {
    return Icons.getIcon('default', { style: { color: Colors.get("habitIcon", theme) } });
  }

  if (habit.isCustom && habit.iconName) {
    return Icons.getIcon(habit.iconName, { style: { color: Colors.get('habitIcon', theme) } });
  } else {
    // Use first name entry safely
    const nameForIcon = habit.name[0] || 'default';
    return Icons.getHabitIcon(nameForIcon, { style: { color: Colors.get('habitIcon', theme) } });
  }
};
    
    // Update color when theme changes
    useEffect(() => {
        setColor(status === 0 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 1 ? 'habitCardDone' : 'habitCardSkipped', theme));
    }, [theme, status]);

    const x = useMotionValue(0);
    const constrainedX = useTransform(x,[-1,1],[minX,maxX]);
    const onDragStart = () => {
        cardColor = status === 0 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 1 ? 'habitCardDone' : 'habitCardSkipped', theme);
        leftColor = status === 1 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 0 ? 'habitCardSkipped' : 'habitCardSkipped', theme);
        rightColor = status === -1 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 0 ? 'habitCardDone' : 'habitCardDone', theme);
    }
   
        
    const handledDrag = (event,info) => {
        if(status === 1 && info.offset.x < 0) setColor(interpolateColor(cardColor,leftColor,Math.abs(info.offset.x)/maxX));
        if(isNegative){
            if(info.offset.x < minX){
              if(canDrag){
                setNewStatus(false);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                setCanDrag(false);
             }
            }
        }else{
            if(status === 1 && info.offset.x < 0 || status !== 1) setColor(interpolateColor(cardColor,info.offset.x > 0 ? rightColor : leftColor,Math.abs(info.offset.x)/maxX));
            if(Math.abs(info.offset.x) > maxX){
             if(canDrag){
                if(status < 1 && info.offset.x > 0 || status > -1 && info.offset.x < 0) setNewStatus(info.offset.x > 0);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                setCanDrag(false);
             }
          }
        }  
    }
    const onDragEnd = () => {
        if(canDrag) animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        setColor(status === 0 ? 'rgba(0,0,0,0.1)' : Colors.get(status === 1 ? 'habitCardDone' : 'habitCardSkipped', theme));
        setCanDrag(true);
    }
    const setNewStatus = (isOverZero) => {
        let newStatus = 0;
        if(isOverZero){
            if(status === 0)newStatus = 1;
            else if(status === -1)newStatus = 0;
            else newStatus = 1;
            AppData.habitsByDate[dateKey][id] = newStatus;
        }
        else{
            if(status === 0)newStatus = -1;
            else if(status === 1){
              newStatus = isNegative ? -1 : 0;
              if(isNegative){
                 setTime(Math.round(0));
                 AppData.choosenHabitsLastSkip[id] = Date.now();
              }
            }
            else if(status === -1){
                newStatus = -1;
                currentId = id;
                if(isNegative){
                 setTime(Math.round(0));
                 AppData.choosenHabitsLastSkip[id] = Date.now();
              }
            }
            AppData.habitsByDate[dateKey][id] = newStatus;
        }
        if(newStatus === 1)playEffects(isDoneSound);
        else if(newStatus === -1)playEffects(skipSound);
        setColor(status === 0 ? 'rgba(0,0,0,0.2)' : Colors.get(status === 1 ? 'habitCardDone' : 'habitCardSkipped', theme));
        setStatus(newStatus);
    }
    const toggleIsActive = () => {
        setCurrentId(id);
        playEffects(clickSound);
        const newExpanded = !expanded;
        setExpanded(newExpanded);
        setExpandedCard(newExpanded ? id : null);
    }
    // subscribe to expandedCard$ to update expanded state
    useEffect(() => {
         const sub = expandedCard$.subscribe(currentId => {
         setExpanded(currentId === id);
      });
      return () => sub.unsubscribe(); // unsubscribe on unmount
    }, [id]);
      
    const _style = {
    display: 'flex',
    flexDirection: 'column',
    width: '95%',
    borderRadius: '24px',
    margin: '5px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: status < 2 ? _color : Colors.get('habitCardEnded', theme),
    border: '2px solid ' + Colors.get('border', theme), // optional base border
    x:constrainedX
   };
     const progressStyle = {
     position: 'absolute',
     top: 0,
     left: 0,
     height: '2px',
     width: `${progress}%`, 
     backgroundColor: 'green', 
     borderRadius: '24px 0 0 0', 
     
   };
    const mainText = 
    {
       fontSize:fSize === 0 ? "13px" : "15px",
       color: Colors.get('mainText', theme),
       marginLeft: "20px",
    }
    const subText = 
    {
       textAlign: "left",
       fontSize: fSize === 0 ? "11px" : "13px",
       color: Colors.get('subText', theme),
       padding:'3px',
    }
    let newHeight = fSize === 0 ? '220px' : '238px';
    if(habitsGoals?.length > 0){
      let addHeight = fSize === 0 ? 220 : 238;
         for (let i = 0; i < habitsGoals.length; i++) {
          const addH = fSize === 0 ? 36 :  42;
          addHeight += addH;
         }
      newHeight = addHeight + 'px';
    }

    useEffect(() => {
      if(habitsGoals?.length > 0){
      let addHeight = fSize === 0 ? 220 : 238;
         for (let i = 0; i < habitsGoals.length; i++) {
          const addH = fSize === 0 ? 36 :  42;
          addHeight += addH;
         }
      newHeight = addHeight + 'px';
    }
    }, [habitsGoals,fSize]);
    useEffect(() => {
      setCanDrag(!showTimerSlider);
    }, [showTimerSlider]);
    const startTimer = () => {
       if(status < 1 && !isNegative){
        setTimer(true);
        setTime(0);
       }
    }
    const stopTimer = () => {
      if(!isNegative){
       setTimer(false);
       setProgress(0);
       setTime(0);
      }
    }
    const onDeleteHabit = (id) => {
      setHabitToDelete(id);
      setNeedConfirmation(true);
      const newText = AppData.prefs[0] === 0 
      ? `⚠️  Вы уверены, что хотите удалить привычку: \'${habitInfo.name[0]}\' ?`
      : `⚠️  Are you sure you want to delete \'${habitInfo.name[1]}\' habit?`;
      setConfirmMessage(newText);
    }   
    return (
            <motion.div 
                id={id} 
                style={_style} 
                onClick={(event) => {
                    const mousePageY = event.nativeEvent.pageY;
                    const el = document.getElementById(id);
                    const elTop = el.getBoundingClientRect().top + window.scrollY;
                    const clickY = mousePageY - elTop;
                    if(el.clientHeight < 0.06 * window.innerHeight)toggleIsActive();
                    else {
                        if(clickY < el.clientHeight * 0.2)toggleIsActive();
                    }
                }}
                drag={canDrag ? 'x' : false}
                dragConstraints={{left: minX, right: status > 0 || isNegative ? 0 : maxX}} 
                onDragStart={onDragStart} 
                dragElastic={0} 
                onDrag={handledDrag} 
                onDragEnd={onDragEnd}
                animate={{
                    height: expanded ? newHeight : '40px',
                }}
                transition={{ 
                    type: 'tween',
                    duration: 0.4,
                    ease: 'easeInOut'
                }}
            >
                <div style={progressStyle} />
                {showTimerSlider && (
                  <div style={{display:'flex',alignItems:'center',position: 'absolute',borderRadius:'24px',width:'100%',height:'4.5vh',zIndex: 1001,backgroundColor: Colors.get('background', theme)}}onClick={(e) => e.stopPropagation()}>
                   <div style={{display: 'flex',flexDirection: 'row',alignItems: 'center',justifyContent: 'space-between',width: '95%',margin: '8px auto 0',}}>
                     <div style={styles(theme).mainText}>{parsedTimeSimple(maxTimer)}</div>
                     <Slider style={styles(theme).slider} min={1} max={59} value={maxTimer / 60000} valueLabelDisplay="off" onChange={(e) => {setMaxTimer(e.target.value * 60000);e.stopPropagation();}}/>
                     <MdClose onClick={(e) => {e.stopPropagation();setShowTimerSlider(false);}}style={{cursor: 'pointer',color: Colors.get('icons', theme),fontSize: '24px',}}/>
                     <MdDone onClick={(e) => {e.stopPropagation(); startTimer();setShowTimerSlider(false);}}style={{cursor: 'pointer',color: Colors.get('icons', theme),fontSize: '24px',}}/>
                  </div>
                </div>
               )}
               { !hasPremium && expanded &&
                  <div onClick={(e) => {e.preventDefault();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',
                   width:'90%',left:'5%',height:(parseInt(newHeight.slice(0,-2)) - 110 )+'px',top:'80px',backdropFilter:'blur(8px)',zIndex:1002}}>
                    <div style={{...styles(theme,fSize).text}}> {langIndex === 0 ? 'Цели и достижения 🎯🏅' : 'Goals and achievements 🎯🏅'} </div>
                    <div style={{...styles(theme,fSize).text}}> {langIndex === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'} </div>
                    <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn,marginBottom:'30px'}} >{langIndex === 0 ? 'Стать премиум' : 'Get premium'}</button>
                  </div>
               }
                <div style={{display: "flex", alignItems: "flex-start", maxHeight: '40px', paddingBottom: '5px'}}>   
                    <div style={{marginLeft: '15px', marginTop: '8px'}}>
                        {getHabitIcon()}
                    </div>
                    <h2 style={mainText}>{habitInfo.name[langIndex]}</h2>
                  {status < 2 && <div style={{marginLeft:'auto',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                    {timer &&<h2 style={mainText} >{parsedTime(time,maxTimer,isNegative)}</h2>}
                    {!timer && <TimerOffIcon onClick={(e) => {e.stopPropagation();if(!isNegative){setShowTimerSlider(true)};}} style={{...styles(theme).icon,color:Colors.get('icons', theme),opacity:0.5,fontSize:'24px',marginTop:'10px',marginRight:'15px'}}/>}
                    {timer  && <TimerIcon onClick={(e) => {e.stopPropagation();stopTimer()}} style={{...styles(theme).icon,color:Colors.get('icons', theme),fontSize:'24px',marginRight:'10px'}}/>}
                   </div>}
                    {status > 1 && <MdDoneAll style={{...styles(theme).icon,color:'#d8e363ff',fontSize:'24px',marginRight:'20px',marginTop:'10px',marginLeft:'auto'}}/>}
                </div> 
                {expanded && (
                    <div style={{marginLeft:'15px',width:'90%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'space-around'}}>
                      <div style={subText}>{habitInfo.descr[langIndex]}</div>
                      <div style={subText}>{langIndex === 0 ? 'Цели : ' : 'Goals : '}</div>
                      {habitsGoals?.map((goal,index) => (
                        <div key={index} style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'flex-start',width:'100%',borderBottom:`1px solid ${Colors.get('border', theme)}`,marginBottom:'5px',marginLeft:'5px'}}>
                           <div style={{...mainText,fontSize:fSize === 0 ? '11px' : '13px',display:'flex',textAlign:'left',overflowX:'scroll',marginLeft:'1px'}}>{(index + 1) + ': ' + goal.text}</div>
                           <div style={{marginLeft:'auto',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            {showAddOptions && currentGoal === index && index < AppData.choosenHabitsGoals[id].length - 1 && <TbArrowMoveDownFilled onClick={() => {setCP(prev => ({...prev,show:true,type:5,hId:id,gId:index,setGoals:setHabitGoals}));setCurrentGoal(prev => prev + 1);}} style={{fontSize:'18px',marginRight:'8px',color:Colors.get('icons', theme)}} />}
                            {showAddOptions && currentGoal === index && index > 0 && <TbArrowMoveUpFilled onClick={() => {setCP(prev => ({...prev,show:true,type:4,hId:id,gId:index,setGoals:setHabitGoals}));setCurrentGoal(prev => prev - 1);}} style={{fontSize:'18px',marginRight:'8px',color:Colors.get('icons', theme)}} />}
                            {showAddOptions && currentGoal === index && <FaPencilAlt onClick={() => setCP(prev => ({...prev,show:true,type:2,hId:id,gId:index,setGoals:setHabitGoals}))} style={{fontSize:'18px',marginRight:'8px',color:Colors.get('icons', theme)}} />}
                            {showAddOptions && currentGoal === index && <FaTrash onClick={() => setCP(prev => ({...prev,show:true,type:3,hId:id,gId:index,setGoals:setHabitGoals}))} style={{fontSize:'18px',marginRight:'8px',color:Colors.get('icons', theme)}} />}    
                            {habitsGoals[index].isDone ? <FaRegSquareCheck style={{fontSize:'24px',color:Colors.get('done', theme)}}  onClick = {() => setHabitGoals(prev => {const updated = prev.map((habit, i) =>i === index ? { ...habit, isDone: false } : habit);AppData.choosenHabitsGoals[id] = updated;return updated;})}/> :
                             <FaRegSquare style={{fontSize:'24px',color:Colors.get('icons', theme)}} onClick = {() => setHabitGoals(prev => {const updated = prev.map((habit, i) =>i === index ? { ...habit, isDone: true } : habit);AppData.choosenHabitsGoals[id] = updated;return updated;})}/>}
                            <TbDotsVertical style={{fontSize:'18px',color:Colors.get('icons', theme),marginLeft:'8px'}} onClick={() => {setShowAddOptions(prev => prev && currentGoal === index ? false : true);setCurrentGoal(index);setCurrentId(id);}}/>
                           </div>
                        </div>
                      ))}
                      <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                         <FaPlusSquare onClick={() => setCP({show:true,type:1,hId:id,gId:0,setGoals:setHabitGoals})} style={{fontSize:'24px',color:Colors.get('icons', theme)}}/>
                         <div style={{...subText,marginLeft:'15px'}}>{langIndex === 0 ? 'Добавить цель' : 'Add goal'}</div>
                      </div> 
                       <div style={subText}>{langIndex === 0 ? 'Достижения 🏆' : 'Achievements 🏆'}</div>
                       {AppData.choosenHabitsAchievements[id]?.map((milestone, index) => (
                        <Achievement key={index} index={index} milestone={milestone} habitId={id} isNegative={isNegative} percent={percent} theme={theme} fSize={fSize} langIndex={langIndex} />
                       ))}
                       <div style={{display:'flex',marginLeft:'auto',flexDirection:'row',alignItems:'center'}}>
                           
                           {getAllHabits().find(f => f.id === id).isCustom && <FaPencilAlt onClick={() => setCP(prev => ({...prev,show:true,type:0,hId:id,gId:0,hInfo:setHabitInfo}))} style={{fontSize:'18px',zIndex:1003,marginRight:'21px',color:Colors.get('icons', theme)}}/>}
                           <FaTrash onClick={() => onDeleteHabit(id)} style={{fontSize:'18px',zIndex:1003,marginLeft:'21px',color:Colors.get('icons', theme)}}/>
                           <FaArrowUp style={{fontSize:'18px',color:Colors.get('icons', theme),zIndex:1003,marginLeft:'21px'}} onClick={() => {toggleIsActive();}}/>
                           {!isNegative && status < 1 && <FaRegSquare onClick={() => setNewStatus(true)}style={{fontSize:'24px',zIndex:1003,marginLeft:'21px',color:Colors.get('skipped', theme)}}/>}
                           {!isNegative && status > 0 && <FaRegSquareCheck onClick={() => setNewStatus(false)} style={{fontSize:'24px',marginLeft:'21px',zIndex:1003,color:Colors.get('done', theme)}}/>}
                       </div>
                    </div>
                )}
            </motion.div>
    )
}
function CategoryPanel({text = ["Имя", "Name"], children, theme,fSize,isNegative}) {
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    
    return (
        <div style={styles(theme,fSize,isNegative).categoryPanel}>
            {text[langIndex]}
            {children}
        </div>
    )
}

const styles = (theme,fSize,isNegative) =>
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
  categoryPanel :
  {
    display:'flex',
    flexDirection:'column',
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: isNegative ? `1px solid ${Colors.get('categoryNegative', theme)}` : `1px solid ${Colors.get('categoryPositive', theme)}`,
    borderTop: isNegative ? `5px solid ${Colors.get('categoryNegative', theme)}` : `5px solid ${Colors.get('categoryPositive', theme)}`,
    margin: "4px",
    background:Colors.get('panelGradient', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    fontFamily:'Segoe UI',
    color: Colors.get('subText', theme),
  },
  text :
  {
    textAlign: "left",
    fontSize:fSize === 0 ? "11px" : "13px",
    color: Colors.get('subText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
  },
  scrollView:
  {
    padding:'5px',
    width: "98vw",
    height: "80vh",
    overflowY: "auto",
    marginTop:"12vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
    borderRadius:'24px',
    backgroundColor:'rgba(0,0,0,0.1)'
  },
  cP :
    {
      display:'flex',
      flexDirection:'column',
      alignItems: "center",
      justifyContent: "space-around",
      borderRadius:"24px",
      border: `1px solid ${Colors.get('border', theme)}`,
      margin: "5px",
      marginBottom:'35vw',
      backgroundColor:Colors.get('simplePanel', theme),
      boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
      width:"100%",
      height:"45vw"
    },
    confirmContainer: {
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
    padding: '20px',
  },
  simplePanelRow:
  {
    width:'75vw',
    display:'flex',
    flexDirection:'row',
    alignItems:'stretch',
    justifyContent:'space-around',
  },
  slider:
  {
    width:'60%',
    userSelect: 'none',
    touchAction: 'none',
    color:Colors.get('icons', theme),

  },
  selectPanel:
    {
      backgroundColor: Colors.get('habitCard', theme),
      borderRadius: '24px',
      border: `1px solid ${Colors.get('border', theme)}`,
      position: 'absolute',
      top: '30%',
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
      zIndex: 6000
    },
      btn:
      {
         width:'70%',
         height:'40px',
         borderRadius:'12px',
         fontSize: fSize === 0 ? '13px' : '14px',
         color:Colors.get('mainText', theme),
         backgroundColor:Colors.get('simplePanel',theme)
      },
    buttonsContainer:{
      width:'100%',
      display:'flex',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-around'
    },
    icon:{
      color:Colors.get('icons', theme),
      fontSize: '36px'
    }
})
 function interpolateColor(color1, color2, factor) {
  factor = Math.max(0, Math.min(1, factor));

  const parse = (c) => {
    const [r, g, b, a = 1] = c
      .replace(/\s+/g, '')
      .replace(/[^0-9.,]/g, '')
      .split(',')
      .map(Number);
    return { r, g, b, a };
  };

  const c1 = parse(color1);
  const c2 = parse(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);
  const a = c1.a + (c2.a - c1.a) * factor;

  return `rgba(${r},${g},${b},${a})`;
}

function setInfoText(langIndex) {
    return langIndex === 0 ? 
    'Вы еще не добавили ни одной привычки\n\n Вы можете выбрать из списка или добавить свою привычку.\n\nВыбранные привычки будут обновляться автоматически каждый день, если вы пропустите день, привычка будет не выполнена для этого дня.\n\nВы должны выполнить свою привычку и затем свайпнуть вправо, чтобы отметить её как выполненную.\n\nЧтобы сформировать привычку, вам нужно выполнить ее 66 дней подряд.\n\nВы можете просмотреть прогресс ваших привычек в панели метрик и календаре.\n\n\n * Чтобы начать, нажмите кнопку "+" ниже' :
    'You have not added any habits yet\n\n You can choose from the list or add your own habit.\n\nChoosen habits will update automatically every day, if you skip a day, the habit will be skipped for that day.\n\nYou need to perform your habit and then swipe right to mark it as done.\n\nTo form a habit you need to perform it for 66 days in a row.\n\nYou can view a progress of your habits in the metrics panel and calendar.\n\n\n * To get started tap the "+" button below';
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
function parsedTime(time, maxTime, isNegative) {
  // Determine the time value to work with
  const elapsedOrRemaining = isNegative ? time : maxTime - time;

  const days = Math.floor(elapsedOrRemaining / 86400000);
  const hours = Math.floor((elapsedOrRemaining % 86400000) / 3600000);
  const minutes = Math.floor((elapsedOrRemaining % 3600000) / 60000);
  const seconds = Math.floor((elapsedOrRemaining % 60000) / 1000);

  const names = [['д', 'd'], ['ч', 'h'], ['м', 'm']];
  const langIndex = AppData.prefs[0];

  if (days > 0) return days + names[0][langIndex];
  if (hours > 0) return hours + names[1][langIndex];
  if (minutes > 0){
    if(isNegative) return minutes + names[2][langIndex];
    else return minutes +':' + seconds.toString().padStart(2, '0');
  }
  return seconds.toString().padStart(2, '0');
}
export function parsedTimeSimple(maxTimer) {
  return (Math.floor(maxTimer / 60000) + 'm');
}

const Achievement = ({ milestone, index, habitId,isNegative, percent, theme, fSize, langIndex }) => {
  // Find habit index safely
  const habitIndex = AppData.choosenHabits.indexOf(habitId);
  const daysToForm = AppData.choosenHabitsDaysToForm[habitIndex]; // total days for full habit
  // 1. How many ACTUAL DAYS are needed for this milestone?
  let neededDays;
  if (isNegative) {
    if (index === 0) neededDays = 7;
    else if (index === 1) neededDays = 30;
    else neededDays = 90;
  } else {
    if (index === 0) neededDays = Math.ceil(daysToForm / 3);
    else if(index === 1) neededDays = Math.ceil(daysToForm / 2);
    else neededDays = daysToForm-1;
  }

  // 2. How many days has the user completed?
  const completedDays = Math.floor((percent / 100) * daysToForm);

  // 3. Is milestone complete?
  const isComplete = completedDays >= neededDays;

  // 4. Remaining days (never negative)
  const remainingDays = Math.max(0, neededDays - completedDays);

  return (
    <div
      key={index}
      style={{
        fontSize: fSize === 0 ? '12px' : '14px',
        color: isComplete
          ? Colors.get('mainText', theme)
          : Colors.get('subText', theme),
        marginLeft: '2px'
      }}
    >
      {index + 1}
      {': '}
      {isComplete ? (
        milestone[langIndex]
      ) : (
        <>
          {(langIndex === 0 ? 'До выполнения осталось: ' : 'Time to complete left: ')}
          {remainingDays}
          {langIndex === 0 ? ' дн.' : ' d.'}
        </>
      )}
    </div>
  );
};

