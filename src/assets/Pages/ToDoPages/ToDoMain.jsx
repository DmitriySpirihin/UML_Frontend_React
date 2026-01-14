import { useState, useEffect } from 'react';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, addNewTrainingDay$ } from '../../StaticClasses/HabitsBus';
import { TODO_LIST } from './ToDoHelper.js';
import { FaSquareFull,FaSort,FaFilter } from 'react-icons/fa';
import ToDoPage from './ToDoPage.jsx';
import { set } from 'animejs';

const clickSound = new Audio('Audio/Click.wav');

const ToDoMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showToDo, setShowToDo] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sortedList, setSortedList] = useState(TODO_LIST);

  const [filterparams, setFilterParams] = useState(0);
  const [sortparams, setSortParams] = useState(0);

  // Subscriptions
  useEffect(() => {
    const sub1 = theme$.subscribe(setThemeState);
    const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    const sub3 = fontSize$.subscribe(setFSize);
    return () => {
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();
    };
  }, []);
  useEffect(() => {
  sortList();
}, [filterparams, sortparams]);

function sortList() {
  let newList = [...TODO_LIST];
  if (filterparams === 1) {
    newList = newList.filter(task => task.isDone);
  } else if (filterparams === 2) {
    newList = newList.filter(task => !task.isDone);
  }
  if (sortparams === 0) {
    newList.sort((a, b) => b.difficulty - a.difficulty);
  } else if (sortparams === 1) {
    newList.sort((a, b) => b.priority - a.priority);
  }else if (sortparams === 2) {
    newList.sort((a, b) => daystodeadline(a.deadLine) - daystodeadline(b.deadLine));
  }
  setSortedList(newList);
}
 

  return (
    <div style={styles(theme, fSize).container}>
      <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:'10px',width:'70%',height:'5%'}}>
      <FaSort size={20} color={Colors.get('icons', theme)} onClick={() => setSortParams(prev => prev + 1 < 3 ? prev + 1 : 0)} />
      <FaFilter size={20} color={Colors.get('icons', theme)} onClick={() => setFilterParams(prev => prev + 1 < 3 ? prev + 1 : 0)} />
      </div>
      <div style={styles(theme, fSize).panel}>
        {
          sortedList.map((item, index) => (
            <Card
              key={index}
              index={index}
              onClick={() => {
                setCurrentIndex(index);
                setShowToDo(true);
                playEffects(clickSound);
              }}
              cardColor={item.color}
              icon={item.icon}
              theme={theme}
              lang={langIndex}
              fSize={fSize}
              name={item.name}
              description={item.description}
              deadline={item.deadLine}
              isDone={item.isDone}
            />
          ))
        }
      </div>
      <ToDoPage show={showToDo} setShow={setShowToDo} theme={theme} lang={langIndex} fSize={fSize} index={currentIndex} />
    </div>
  );
};

export default ToDoMain;
function Card({index,onClick,cardColor,icon,theme,lang,fSize,name,description,deadline,isDone}){
    const _style = {
        alignItems: "center",
        justifyContent: "space-between",
        display:'flex',
        flexDirection:'row',
        height: "7vh",
        width: "90%",
        borderRadius: "20px",
        margin: "5px",
        backgroundColor: Colors.get('panelGradientl', theme),
        border: `2px solid ${isDone ? Colors.get('done', theme) : isDeadline(deadline) ? Colors.get('skipped', theme) : Colors.get('border', theme)}`,
        overflow : 'hidden',
        position: 'relative',
        boxShadow:'3px 3px 2px rgba(0,0,0,0.3)',
    }
    const iconStyle = {
        fontSize:'18px',
        margin:'15px',
        color: Colors.get('mainText', theme),
    }
    const backIconStyle = {
        fontSize:'236px',
        rotate:'-50deg',
        position:'absolute',
        right:'-110px',
        top:'-30%',
        color:cardColor
    }
    return (
        <div style={_style} onClick={onClick}> 
        <div style={iconStyle}>{icon}</div>
        <div style={{width:'60%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center'}}>
            <div style={{...styles(theme,fSize).cardText,zIndex:5}}>{name}</div>
            <div style={{...styles(theme,fSize).subtext,zIndex:5}}>{description}</div>
        </div>
        <div style={{width:'25%',height:'100%',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'flex-end'}}>
            <div style={{...styles(theme,fSize).mainText,zIndex:5,fontSize:'20px',marginRight:'15px'}}>{getInfo(index)}</div>
            <div style={{...styles(theme,fSize).subtext,zIndex:5,marginRight:'15px'}}>{daysToDeadline(deadline, lang)}</div>
        </div>
        <FaSquareFull style={backIconStyle}/>
        </div>    
    )
}
const styles = (theme, fSize) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'scroll',
    justifyContent: 'start',
    alignItems: 'center',
    height: '78vh',
    paddingTop: '5vh',
    width: '100vw',
    fontFamily: 'Segoe UI',
  },
  panel: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '96%',
    alignItems: 'center',
    justifyContent: 'start',
    overflowY: 'scroll',
    borderBottom: `1px solid ${Colors.get('border', theme)}`,
  },
  subtext: {
    textAlign: 'left',
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginBottom: '12px',
  },
  mainText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
  },
  cardText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fSize === 0 ? "14px" : "16px",
    fontWeight: 'bold',
    color: Colors.get('mainText', theme),
  }
});
function playEffects(sound) {
  if (AppData.prefs[2] === 0 && sound) {
    if (!sound.paused) {
      sound.pause();
      sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
    Telegram.WebApp.HapticFeedback.impactOccurred('light');
  }
}

const getInfo = (index) => {
  let doneAmount = 0;
  for (let i = 0; i < TODO_LIST[index].goals.length; i++) {
    if (TODO_LIST[index].goals[i].isDone) {
      doneAmount++;
    }
  }
  return `${doneAmount}/${TODO_LIST[index].goals.length}`;
};

function daysToDeadline(date, langIndex) {
  const deadline = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  
  if (langIndex === 0) { // Russian
    if (diffDays === 0) return "Сегодня";
    if (diffDays === 1) return "Завтра";
    if (diffDays > 1) return `${diffDays} д. осталось`;
    return `${Math.abs(diffDays)} д. назад`;
  }
  
  // English
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays > 1) return `${diffDays}d left`;
  return `${Math.abs(diffDays)}d overdue`;
}

const isDeadline = (date) => {
  const deadline = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays < 0;
};
const daystodeadline = (date) => {
  const deadline = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};