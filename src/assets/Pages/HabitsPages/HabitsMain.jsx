import React, {useState,useEffect} from 'react'
import { motion , useTransform, useMotionValue,animate} from 'framer-motion'
import Icons from '../../StaticClasses/Icons';
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import { expandedCard$, setExpandedCard} from '../../StaticClasses/HabitsBus.js';
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$, updateConfirmationPanel,setShowPopUpPanel} from '../../StaticClasses/HabitsBus'
import {MdDoneAll} from 'react-icons/md'
import {FaPlusSquare,FaTrash,FaPencilAlt,FaTrashAlt} from 'react-icons/fa'
import {FaRegSquareCheck,FaRegSquare} from 'react-icons/fa6'
import {TbDotsVertical,TbArrowMoveDownFilled,TbArrowMoveUpFilled} from 'react-icons/tb'

import {MdClose,MdDone} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';
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
    const [confirmationPanel,setConfirmationPanel] = useState(false);
    const [currentId, setCurrentId] = useState(0);
    const [goalName,setGoalName] = useState('');
    
    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        const subscription2 = fontSize$.subscribe(setFontSize);
        return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
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
    const setNewGoal = () => {
      if (goalName.length > 0) {
        AppData.addHabitGoal(currentId,{text:goalName,isDone:false});
        setGoalName('');
      }
      else setShowPopUpPanel( langIndex === 0 ? 'Введите цель' : 'Enter goal',2000,false);
    };
    
    removeHabitFn = removeHabit;
    addHabitFn = addHabit;
    const hasBadHabits = AppData.choosenHabitsTypes.some((v) => v);
    // render    
    return (
        <div style={styles(theme).container}>
            {!hasHabits && <div style={{...styles(theme).panel,justifyContent:'center',alignItems:'center', marginTop:'40%'}}>
              <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',margin:'10%',marginTop:'20%',whiteSpace:'pre-line',color:Colors.get('subText', theme)}}>{setInfoText(langIndex)}</p>
            </div>}
            {hasHabits && <div style={styles(theme).scrollView}>
              {buildMenu({theme, habitsCards, categories, getAllHabits: () => getAllHabits(),setConfirmationPanel,setCurrentId,fSize})}
              {hasBadHabits && 
              <CategoryPanel text={['Вредные привычки','Bad habits']} theme={theme} isNegative={true}>
                {getAllHabits().map(habit =>{
                const isEnabled = AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(habit.id)];
                return isEnabled && (
                    <HabitCard
                        key={habit.id}
                        id={habit.id}
                        text={habit.name}
                        descr={habit.description}
                        imgsrc={habit.src}
                        theme={theme}
                        setConfirmationPanel={setConfirmationPanel}
                        setCurrentId={setCurrentId}
                        fSize={fSize}
                    />
                )})}
            </CategoryPanel>}
        </div>}
        {confirmationPanel && (
                   <div style={styles(theme).confirmContainer}>
                    <div style={styles(theme).confirmationPanel}>
                      <p style={{...styles(theme).subText,fontSize:fSize === 0 ? '11px' : '13px',marginTop:'5%',color:Colors.get('subText', theme)}}>{langIndex === 0 ? 'Введите цель' : 'Enter goal'}</p>
                      <MyInput
                        w='80%'
                        h='20%'
                        maxL={30}
                        onChange={value => setGoalName(value)}
                        placeholder={langIndex === 0 ? 'Введите цель' : 'Enter goal'}
                        theme={theme}
                      />
                     <div style={styles(theme).simplePanelRow}>
                       <MdClose style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setConfirmationPanel(false);}}/>
                       <MdDone style={{fontSize:'28px',color:Colors.get('icons', theme)}} onClick={() => {setNewGoal();setConfirmationPanel(false);}}/>
                    </div>
                </div>
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

function buildMenu({ theme, habitsCards, categories,setConfirmationPanel,setCurrentId,fSize}) {
    return categories.map(category => {
        const habitsInCategory = habitsCards
            .map(id => getAllHabits().find(h => h.id === id))
            .filter(h => h && h.category[0] === category);

        return (
            <CategoryPanel key={category} text={getAllHabits().find(h => h.category[0] === category)?.category } theme={theme} isNegative={false}>
                {habitsInCategory.map(habit =>{
                const isEnabled = !AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(habit.id)];
                return isEnabled && (
                    <HabitCard
                        key={habit.id}
                        id={habit.id}
                        text={habit.name}
                        descr={habit.description}
                        imgsrc={habit.src}
                        theme={theme}
                        setConfirmationPanel={setConfirmationPanel}
                        setCurrentId={setCurrentId}
                        fSize={fSize}
                    />
                )})}
            </CategoryPanel>
        );
    }
);
}
function HabitCard({id = 0, text = ["Название", "Name"], descr = ["Описание", "Description"], theme,setConfirmationPanel,setCurrentId,fSize}) {
    const [status, setStatus] = useState(AppData.habitsByDate[dateKey]?.[id]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const maxX = 100;
    const minX = -maxX;
    const [canDrag, setCanDrag] = useState(true);
    let cardColor = Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme);
    let leftColor = Colors.get(status === 0 ? 'habitCardSkipped' : status === 1 ? 'habitCard' : 'habitCardSkipped', theme);
    let rightColor = Colors.get(status === 0 ? 'habitCardDone' : status === -1 ? 'habitCard' : 'habitCardDone', theme);
    
    const [expanded, setExpanded] = useState(false);
    const [_color, setColor] = useState(cardColor);
    const [showAddOptions,setShowAddOptions] = useState(false);
    const [goals,setGoals] = useState(AppData.ChoosenHabitsGoals[id].length > 0 ? AppData.ChoosenHabitsGoals[id].map(goal => goal.isDone) : []);
    
    
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
        if (!habit) return Icons.getIcon(iconName, {style: {color: Colors.get("habitIcon", theme)}});
        
        if (habit.isCustom && habit.iconName) {
            // For custom habits, use the iconName with theme color
            return Icons.getIcon(habit.iconName, { style:{color: Colors.get('habitIcon', theme)} });
        } else {
            // For default habits, use the habit name to get the appropriate icon with theme color
            const icon = Icons.getHabitIcon(habit.name[0],{ style:{color: Colors.get('habitIcon', theme)}});
            // Since getHabitIcon already applies theme color, we don't need to set it again
            return icon;
        }
    };
    
    // Get localized text
    const displayText = Array.isArray(text) ? text[langIndex] : text;
    const displayDescr = Array.isArray(descr) ? descr[langIndex] : descr;
    
    // Update color when theme changes
    useEffect(() => {
        setColor(Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme));
    }, [theme, status]);

    const x = useMotionValue(0);
    const constrainedX = useTransform(x,[-1,1],[minX,maxX]);
    const onDragStart = () => {
        cardColor = Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme);
        leftColor = Colors.get(status === 0 ? 'habitCardSkipped' : status === 1 ? 'habitCard' : 'habitCardSkipped', theme);
        rightColor = Colors.get(status === 0 ? 'habitCardDone' : status === -1 ? 'habitCard' : 'habitCardDone', theme);
    }
   
        
    const handledDrag = (event,info) => {
        if(status === 1 && info.offset.x < 0 || status !== 1) setColor(interpolateColor(cardColor,info.offset.x > 0 ? rightColor : leftColor,Math.abs(info.offset.x)/maxX));
        if(Math.abs(info.offset.x) > maxX){
             if(canDrag){
                setNewStatus(info.offset.x > 0);
                animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
                setCanDrag(false);
             }
        }
    }
    const onDragEnd = () => {
        if(canDrag) animate(constrainedX, 0, { type: 'tween', duration: 0.2 });
        setColor(Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme));
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
            else if(status === 1)newStatus = 0;
            else if(status === -1){
                newStatus = -1;
                currentId = id;
                const newText = AppData.prefs[0] === 0 
                ? `Вы уверены, что хотите удалить привычку: \'${displayText}\' ?`
                : `Are you sure you want to delete \'${displayText}\' habit?`;
                updateConfirmationPanel(newText);
            }
            else{
                currentId = id;
                const newText = AppData.prefs[0] === 0 
                ? `Вы уверены, что хотите удалить выполненную привычку:  \'${displayText}\' ?`
                : `Are you sure you want to delete the performed habit:  \'${displayText}\' ?`;
                updateConfirmationPanel(newText);
            }
            AppData.habitsByDate[dateKey][id] = newStatus;
        }
        if(newStatus === 1)playEffects(isDoneSound);
        else if(newStatus === -1)playEffects(skipSound);
        setColor(Colors.get(newStatus === 1 ? 'habitCardDone' : newStatus === -1 ? 'habitCardSkipped' : 'habitCard', theme));
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
        display:'flex',
        flexDirection:'column',
        width:'95%',
        borderRadius: "24px",
        margin: "5px",
        overflow: 'hidden',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: status < 1 ? Colors.get('border', theme) : Colors.get('habitDoneBorder', theme),
        position: 'relative' ,
        backgroundColor: status < 2 ? _color : Colors.get('habitCardEnded', theme),
        x: constrainedX,
    }
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

    let newHeight = '15vh';
    if(AppData.ChoosenHabitsGoals[id].length > 0){
        newHeight = ((AppData.ChoosenHabitsGoals[id].length * 3) + 15) + 'vh';
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
                dragConstraints={{left: minX, right: status > 0 ? 0 : maxX}} 
                onDragStart={onDragStart} 
                dragElastic={0} 
                onDrag={handledDrag} 
                onDragEnd={onDragEnd}
                animate={{
                    height: expanded ? newHeight : '4.5vh',
                }}
                transition={{ 
                    type: 'tween',
                    duration: 0.4,
                    ease: 'easeInOut'
                }}
            >
                <div style={{display: "flex", alignItems: "flex-start", maxHeight: '40px', paddingBottom: '5px'}}>   
                    <div style={{marginLeft: '15px', marginTop: '8px'}}>
                        {getHabitIcon()}
                    </div>
                    <h2 style={mainText}>{displayText}</h2>
                    {status > 1 && <MdDoneAll style={{...styles(theme).icon,color:'#d8e363ff',fontSize:'24px',marginLeft:'auto',marginTop:'10px',marginRight:'15px'}}/>}
                </div> 
                {expanded && (
                    <div style={{marginLeft:'15px',width:'90%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'space-around'}}>
                      <div style={subText}>{displayDescr}</div>
                      <div style={subText}>{langIndex === 0 ? 'Цели : ' : 'Goals : '}</div>
                      {AppData.ChoosenHabitsGoals[id].map((goal,index) => (
                        <div key={index} style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'flex-start',width:'100%',borderBottom:`1px solid ${Colors.get('border', theme)}`,marginBottom:'5px',marginLeft:'5px'}}>
                           <div style={{...mainText,marginLeft:'1px'}}>{index + 1 + ': ' + goal.text}</div>
                           <div style={{marginLeft:'auto',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
                            {showAddOptions && <FaPencilAlt style={{fontSize:'20px',marginRight:'5px',color:Colors.get('icons', theme)}} onClick={() => {}}/>}
                            {showAddOptions && <FaTrashAlt style={{fontSize:'20px',marginRight:'5px',color:Colors.get('icons', theme)}} onClick={() => {}}/>}    
                            {goals[index] ? <FaRegSquareCheck style={{fontSize:'24px',color:Colors.get('icons', theme)}} onClick={() => {AppData.ChoosenHabitsGoals[id][index].isDone = false;setGoals(prev => {const newGoals = [...prev];newGoals[index] = false;return newGoals;})}}/> :
                             <FaRegSquare style={{fontSize:'24px',color:Colors.get('icons', theme)}} onClick={() => {AppData.ChoosenHabitsGoals[id][index].isDone = true;setGoals(prev => {const newGoals = [...prev];newGoals[index] = true;return newGoals;})}}/>}
                            <TbDotsVertical style={{fontSize:'24px',color:Colors.get('icons', theme)}} onClick={() => {setShowAddOptions(prev => !prev);setCurrentId(id);}}/>
                           </div>
                        </div>
                      ))}
                      <div style={{display:'flex',flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}}>
                         <FaPlusSquare onClick={() => setConfirmationPanel(true)} style={{fontSize:'24px',color:Colors.get('icons', theme)}}/>
                         <div style={{...subText,marginLeft:'15px'}}>{langIndex === 0 ? 'Добавить цель' : 'Add goal'}</div>
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
            {text[langIndex] + (isNegative ? ' 💀' : ' 😎')}
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
  confirmationPanel :
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
      width:"85vw",
      height:"40vw"
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