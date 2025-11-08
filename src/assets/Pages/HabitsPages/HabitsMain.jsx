import React, {useState,useEffect} from 'react'
import { motion , useTransform, useMotionValue,animate} from 'framer-motion'
import BackDark from '../../Art/Ui/Back_Dark.png'
import MetricsDark from '../../Art/Ui/Metrics_Dark.png'
import AddDark from '../../Art/Ui/Add_Dark.png'
import CalendarDark from '../../Art/Ui/Calendar_Dark.png'
import BackLight from '../../Art/Ui/Back_Light.png'
import MetricsLight from '../../Art/Ui/Metrics_Light.png'
import AddLight from '../../Art/Ui/Add_Light.png'
import CalendarLight from '../../Art/Ui/Calendar_Light.png'
import { allHabits} from '../../Classes/Habit.js'
import { AppData } from '../../StaticClasses/AppData.js'
import { expandedCard$, setExpandedCard , setPage} from '../../StaticClasses/HabitsBus.js';
import Colors, { THEME } from '../../StaticClasses/Colors'
import { theme$ ,lang$, globalTheme$, updateConfirmationPanel,setShowPopUpPanel,setAddHabitPanel} from '../../StaticClasses/HabitsBus'

const dateKey = new Date().toISOString().split('T')[0];
const clickSound = new Audio(new URL('../../Audio/Click_Add.mp3', import.meta.url).href);
const isDoneSound = new Audio(new URL('../../Audio/IsDone.mp3', import.meta.url).href); 
export let removeHabitFn;
export let addHabitFn;
export let currentId;

const HabitsMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [globalTheme, setglobalThemeState] = React.useState('dark');
    const [habitsCards, setHabitsCards] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [hasHabits, setHasHabits] = useState(AppData.choosenHabits.length > 0);
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
    // Initialize habits cards on mount
    React.useEffect(() => {
        setHabitsCards(AppData.choosenHabits);
    }, []);

    // Update categories whenever habitsCards changes
    React.useEffect(() => {
        if (habitsCards.length > 0) {
            const cats = new Set();
            habitsCards.forEach(id => {
                const h = getAllHabits().find(h => h.Id() === id);
                if (h && h.Category && h.Category()[0]) {
                    cats.add(h.Category()[0]);
                }
            });
            setCategories(Array.from(cats));
        }
    }, [habitsCards]);
    // functions to add/remove habits at runtime
    const addHabit = (habitId) => {
        // Use Set to ensure no duplicates before adding
        setHabitsCards(prev => {
            const newHabits = new Set(prev);
            if (!newHabits.has(habitId)) {
                AppData.addHabit(dateKey, habitId);
                return [...newHabits,habitId];
            }
            return prev;
        });
        setHasHabits(AppData.choosenHabits.length > 0);
    };
    const removeHabit = (habitId) => {
        if (habitsCards.includes(habitId)) {
            AppData.removeHabit(dateKey,habitId);
            setHabitsCards(prev => prev.filter(id => id !== habitId));
            const habitObj = getAllHabits().find(h => h.Id() === habitId);
            const nameArr = habitObj?.Name?.() || ["",""];
            const name = nameArr[langIndex] || (langIndex === 0 ? "Привычка" : "Habit");
            const popUpText = langIndex === 0 
            ? `Привычка: \'${name}\' удалена`
            : `Habit: \'${name}\' deleted`;
            setShowPopUpPanel(popUpText,2000);
            setHasHabits(AppData.choosenHabits.length > 0);
        }
    };
    
    removeHabitFn = removeHabit;
    addHabitFn = addHabit;
    
    // render    
    return (
        <div style={styles(theme).container}>
            {!hasHabits && <div style={{...styles(theme).panel,justifyContent:'center',alignItems:'center', marginTop:'30%'}}>
              <p style={{...styles(theme).subText,fontSize:'12px',margin:'10%',whiteSpace:'pre-line',color:Colors.get('subText', theme)}}>{setInfoText(langIndex)}</p>
            </div>}
            {hasHabits && <div style={styles(theme).scrollView}>
              {buildMenu({theme, habitsCards, categories, getAllHabits: () => getAllHabits()})}
        </div>}
        <BottomPanel theme={theme} globalTheme={globalTheme}/>
        </div>
    )
}

export default HabitsMain

function getAllHabits() {
    return allHabits.concat(
        (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.Id() === ch.Id()))
    );
}

function buildMenu({ theme, habitsCards, categories}) {
    return categories.map(category => {
        const habitsInCategory = habitsCards
            .map(id => getAllHabits().find(h => h.Id() === id))
            .filter(h => h && h.Category && Array.isArray(h.Category()) && h.Category()[0] === category);

        return (
            <CategoryPanel key={category} text={category} theme={theme}>
                {habitsInCategory.map(habit => (
                    <HabitCard
                        key={habit.Id()}
                        id={habit.Id()}
                        text={habit.Name()}
                        descr={habit.Description()}
                        imgsrc={habit.IsCustom() ? habit.Src() : new URL(habit.Src(), import.meta.url).href}
                        theme={theme}
                    />
                ))}
            </CategoryPanel>
        );
    });
}
function HabitCard({id = 0, text = ["Название", "Name"], descr = ["Описание", "Description"], imgsrc, theme}) {
    const [status, setStatus] = useState(AppData.habitsByDate[dateKey]?.[id] ?? 0);
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const maxX = 100;
    const minX = -maxX;
    const [canDrag, setCanDrag] = useState(true);
    let cardColor = Colors.get(status === 1 ? 'habitCardDone' : status === -1 ? 'habitCardSkipped' : 'habitCard', theme);
    let leftColor = Colors.get(status === 0 ? 'habitCardSkipped' : status === 1 ? 'habitCard' : 'habitCardSkipped', theme);
    let rightColor = Colors.get(status === 0 ? 'habitCardDone' : status === -1 ? 'habitCard' : 'habitCardDone', theme);
    
    const [expanded, setExpanded] = useState(false);
    const [_color, setColor] = useState(cardColor);
    
    // Handle language changes
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    
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
            else{
                newStatus = -1;
                currentId = id;
                const newText = AppData.prefs[0] === 0 
                ? `Вы уверены, что хотите удалить привычку: \'${displayText}\' ?`
                : `Are you sure you want to delete \'${displayText}\' habit?`;
                updateConfirmationPanel(newText);
            }
            AppData.habitsByDate[dateKey][id] = newStatus;
        }
        if(newStatus === 1){
            isDoneSound.play();
            navigator.vibrate(50);
        }
        setColor(Colors.get(newStatus === 1 ? 'habitCardDone' : newStatus === -1 ? 'habitCardSkipped' : 'habitCard', theme));
        setStatus(newStatus);
    }
            
    
    const toggleIsActive = () => {
        if(AppData.prefs[2] == 0)clickSound.play();
        if(AppData.prefs[3] == 0)navigator.vibrate(50);
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
        alignItems:'stretch',
        borderRadius: "24px",
        margin: "10px",
        overflow: 'hidden',
        borderStyle: 'solid',
        borderColor: Colors.get('border', theme),
        borderWidth: 1,
        position: 'relative' ,
        backgroundColor: _color,
        x: constrainedX,
    }
    const mainText = 
    {
       fontSize: "14px",
       color: Colors.get('mainText', theme),
       marginLeft: "20px",
    }
    const subText = 
    {
       textAlign: "left",
       fontSize: "10px",
       color: Colors.get('subText', theme),
       marginLeft: "70px",
    }
    
        
    return (
            <motion.div 
                id={id} 
                style={_style} 
                onClick={toggleIsActive}
                drag={canDrag ? 'x' : false}
                dragConstraints={{left: minX, right: status === 1 ? 0 : maxX}} 
                onDragStart={onDragStart} 
                dragElastic={0} 
                onDrag={handledDrag} 
                onDragEnd={onDragEnd}
                animate={{
                    height: expanded ? '10vh' : '4.5vh',
                    outline: expanded ? '3px solid ' + Colors.get('border', theme) : '1px solid ' + Colors.get('border', theme)
                }}
                transition={{ 
                    type: 'tween',
                    duration: 0.4,
                    ease: 'easeInOut'
                }}
            >
                <div style={{display: "flex", alignItems: "flex-start", maxHeight: '40px', paddingBottom: '5px'}}>   
                    <img 
                        src={imgsrc} 
                        style={{width: '24px', objectFit: 'contain', marginLeft: '15px', marginTop: '8px'}} 
                        onError={(e) => {
                            e.target.onerror = null; // Prevent infinite loop if default image is also missing
                            e.target.src = new URL('../../Art/HabitsIcons/Default.png', import.meta.url).href;
                        }}
                        alt="" 
                    />
                    <h2 style={mainText}>{displayText}</h2>
                </div> 
                {expanded && (
                    <div style={{ paddingBottom: '25px'}}>
                        <p style={subText}>{displayDescr}</p>
                    </div>
                )}
            </motion.div>
    )
}
function CategoryPanel({text = ["Имя", "Name"], children, theme}) {
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    
    useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);
    
    const displayText = Array.isArray(text) ? text[langIndex] : text;
    
    return (
        <div style={styles(theme).categoryPanel}>
            <h2 style={{
                textAlign: "center",
                fontSize: "14px",
                color: Colors.get('mainText', theme)
            }}>
                {displayText}
            </h2>
            {children}
        </div>
    )
}

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
            <img src={globalTheme === 'dark' ? BackDark : BackLight} style={btnstyle} onClick={() => setPage('MainMenu')} />
            <img src={globalTheme === 'dark' ? MetricsDark : MetricsLight} style={btnstyle} onClick={() => setPage('HabitMetrics')} />
            <img src={globalTheme === 'dark' ? AddDark : AddLight} style={btnstyle} onClick={() => setAddHabitPanel(true)} />
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
  categoryPanel :
  {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    background:Colors.get('panelGradient', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`
  },
  text :
  {
    textAlign: "left",
    fontSize: "10px",
    color: Colors.get('subText', theme),
    marginLeft: "30px",
    marginBottom:'12px'
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
function setInfoText(langIndex) {
    return langIndex === 0 ? 
    'Вы еще не добавили ни одной привычки\n\n Вы можете выбрать из списка или добавить свою привычку.\n\nВыбранные привычки будут обновляться автоматически каждый день, если вы пропустите день, привычка будет не выполнена для этого дня.\n\nВы должны выполнить свою привычку и затем свайпнуть вправо, чтобы отметить её как выполненную.\n\nЧтобы сформировать привычку, вам нужно выполнить ее 66 дней подряд.\n\nВы можете просмотреть прогресс ваших привычек в панели метрик и календаре.\n\n\n * Чтобы начать, нажмите кнопку "+" ниже' :
    'You have not added any habits yet\n\n You can choose from the list or add your own habit.\n\nChoosen habits will update automatically every day, if you skip a day, the habit will be skipped for that day.\n\nYou need to perform your habit and then swipe right to mark it as done.\n\nTo form a habit you need to perform it for 66 days in a row.\n\nYou can view a progress of your habits in the metrics panel and calendar.\n\n\n * To get started tap the "+" button below';
}
