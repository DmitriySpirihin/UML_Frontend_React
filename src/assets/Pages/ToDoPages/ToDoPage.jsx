import { TODO_LIST } from "./ToDoHelper";
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { FaRegCheckSquare,FaRegSquare } from "react-icons/fa";

const PRIORITY = ['➖','❕','❗','‼️','❗‼️'];
const DIFFICULTY = ['🌱','🌶️','🌶️🌶️','🌶️🌶️🌶️','💀']; 
const ToDoPage = ({ show,setShow,theme,lang,fSize,index }) => {
    
 
  return (
    <div onClick={() => setShow(false)} style={styles(theme, show ,fSize,TODO_LIST[index].isDone ,TODO_LIST[index].deadLine).container}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexDirection:'column',width:'100%',height:'100%',overflowY:'scroll'}}>
            <div style={{width:'100%',height:'6%',backgroundColor:TODO_LIST[index].color,borderTopRightRadius:'24px',borderTopLeftRadius:'24px' ,
            display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',}}>
            
            <div style={{...styles(theme, show,fSize).mainText,marginLeft:'30px',fontSize:'20px'}}>{PRIORITY[TODO_LIST[index].priority]}</div>
            <div style={{...styles(theme, show,fSize).mainText,fontSize:'20px'}}>{DIFFICULTY[TODO_LIST[index].difficulty]}</div>
            {TODO_LIST[index].isDone ? <FaRegCheckSquare style={{width:'35px',height:'35px',color:Colors.get('done', theme),marginRight:'30px'}}/> :
            <FaRegSquare style={{width:'35px',height:'35px',color:Colors.get('icons', theme),marginRight:'30px'}}/>}
             
            </div>
            <p style={styles(theme, show,fSize).mainText}>{TODO_LIST[index].icon}{TODO_LIST[index].name}</p>
            <div style={{...styles(theme, show,fSize).text,fontStyle:'italic'}}>{TODO_LIST[index].description}</div>
            <div style={styles(theme, show,fSize).subtext}>{lang === 0 ? 'Дата начала: ' : 'Start date: '}{TODO_LIST[index].startDate}</div>
            
            <div style={styles(theme, show,fSize).subtext}>{lang === 0 ? 'Дэдлайн: ' : 'Deadline: '}{TODO_LIST[index].deadLine}</div>
            <div style={{...styles(theme, show,fSize).text,fontStyle:'italic'}}>{daysToDeadline(TODO_LIST[index].deadLine,lang)}</div>
            { TODO_LIST[index].note.length > 0 && <div style={{...styles(theme, show,fSize).subtext,fontStyle:'italic'}}>{lang === 0 ? 'Примечание: ' : 'Note: : '}{TODO_LIST[index].note}</div>}
            <div style={{...styles(theme, show,fSize).text,textAlign:'center',display:'flex',flexDirection:'column',gap:'5px',backgroundColor:'rGB(0,0,0,0.2)',padding:'10px',borderRadius:'10px',height:'45%',width:'90%',overflowY:'scroll'}}>
            {lang === 0 ? 'Цели' : 'Goals'}
            {
                TODO_LIST[index].goals.map((goal,index) => (
                    <div style={{display:'flex',flexDirection:'row',width:'90%',height:'30px',marginLeft:'5%',alignContent:'center',justifyContent:'space-between'}}>
                    <div key={index} style={styles(theme, show,fSize).subtext}>{index + 1}. {goal.text}</div>
                    {goal.isDone ? <FaRegCheckSquare style={{width:'25px',height:'25px',color:Colors.get('done', theme)}}/> :
                    <FaRegSquare style={{width:'25px',height:'25px',color:Colors.get('icons', theme)}}/>}
                    </div>
                ))
            }
            </div>
     </div>
    </div>
  );
};
export default ToDoPage

const styles = (theme,show,fSize,isDone,deadline) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     position:'fixed',
     flexDirection: "column",
     alignItems: "center",
     height: "80vh",
     transform: show ? 'translateX(0)' : 'translateX(110%)',
     transition: "transform 0.2s ease-in-out",
     width: "95vw",
     fontFamily: "Segoe UI",
     border:`2px solid ${isDone ? Colors.get('done', theme) : isDeadline(deadline) ? Colors.get('skipped', theme) : Colors.get('border', theme)}`,
     borderRadius:'24px',
     zIndex:2000
  },
  controls: {
    display: 'flex',
    marginTop: '30px',
    gap: '50px',
  },
  playContainer :
   {
     display: "flex",
     flexDirection: "column",
     alignItems: "center",
     justifyContent:'flex-start',
     height: "50vh",
     bottom: '0',
     width: "100vw",
     
  },
    subtext: {
      textAlign: 'left',
      fontSize: fSize === 0 ? '11px' : '13px',
      color: Colors.get('subText', theme),
      marginBottom: '12px',
    },
    text :
    {
      textAlign: "left",
      marginBottom: "5px",
      fontSize: fSize === 0 ? "14px" : "16px",
      color: Colors.get('mainText', theme),
    },
    mainText :
    {
      textAlign: "left",
      wontWeight: "bold",
      marginBottom: "5px",
      fontSize: fSize === 0 ? "16px" : "18px",
    }
})

function daysToDeadline(date, langIndex) {
  // Parse the input date (YYYY-MM-DD)
  const deadline = new Date(date);
  const now = new Date();
  
  // Reset time to compare dates only (ignore hours/minutes)
  now.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  // Calculate days difference
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Language strings: [Russian, English]
  const messages = [
    // Russian (langIndex = 0)
    diffDays === 0 
      ? "Сегодня" 
      : diffDays < 0 
        ? `Просрочено на ${Math.abs(diffDays)} ${getRussianDayForm(Math.abs(diffDays))} назад` 
        : `${diffDays} ${getRussianDayForm(diffDays)} до дедлайна`,
    
    // English (langIndex = 1)
    diffDays === 0 
      ? "Today" 
      : diffDays < 0 
        ? `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}` 
        : `${diffDays} day${diffDays !== 1 ? 's' : ''} until deadline`
  ];
  
  return messages[langIndex] || messages[1]; // Fallback to English
}

// Helper for Russian day forms
function getRussianDayForm(days) {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return "дней";
  }
  
  if (lastDigit === 1) {
    return "день";
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return "дня";
  } else {
    return "дней";
  }
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