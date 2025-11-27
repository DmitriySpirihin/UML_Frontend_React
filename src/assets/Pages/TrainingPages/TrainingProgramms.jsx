import {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,addPanel$,setShowPopUpPanel} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp,IoIosTrash} from 'react-icons/io'
import {allExercises,allPrograms, MuscleView} from '../../Classes/TrainingData.jsx'
import { FaRegSquare, FaRegCheckSquare,FaCalendarDay} from 'react-icons/fa';
import {MdBook} from 'react-icons/md'
import {IoMdArrowDropdown,IoMdArrowDropup,IoMdList} from 'react-icons/io'
import {MdDone,MdClose,MdFitnessCenter} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';

const TrainingExercise = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [addPanel, setAddPanel] = useState('');
    const [currentId, setCurrentId] = useState(-1);
    const [currentDay, setCurrentDay] = useState(-1);
    const [currentExercise, setCurrentExercise] = useState('');

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currentProgramName, setCurrentProgramName] = useState('');
    const [days,addDays] = useState({});

    const [showConfirmRemove, setShowConfirmRemove] = useState(false);

    // subscriptions
    useEffect(() => {
        const subscriptionTheme = theme$.subscribe(setthemeState);
        const subscriptionLang = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => {
          subscriptionLang.unsubscribe();
          subscriptionTheme.unsubscribe();
        }
    }, []);  
    useEffect(() => {
        const subscriptionAddPanel = addPanel$.subscribe(setAddPanel);
        return () => subscriptionAddPanel.unsubscribe();
    }, []);
    
    
    function onClose(){
      
    }
    function onAdd(){
        onClose();
    }
    function onRemove(){
      onClose();
    }
       // render    
       return (
           <div style={styles(theme).container}>
               {allPrograms().map((program) => (
                <div key={program.id} style={styles(theme).panel}>
                    <div style={styles(theme,currentId === program.id,false).groupPanel} onClick={() => {setCurrentId(prev => prev === program.id ? -1 : program.id);setCurrentDay(-1);}}>
                        {currentId === program.id ? <IoIosArrowUp style={styles(theme).icon}/> : <IoIosArrowDown style={styles(theme).icon}/>}
                        <MdBook style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'16px'}}/>
                        <p style={styles(theme).text}>{program.name[langIndex]}</p>
                        <p style={{...styles(theme).subtext,marginRight:'5px',marginLeft:'auto'}}>{program.creationDate}</p>
                    </div>
                    {currentId === program.id && <div style={styles(theme).panel}>
                        <div style={{...styles(theme).subtext,marginRight:'15px',marginLeft:'15px'}}>{program.description[langIndex]}</div>
                          <div style={{display:'flex',flexDirection:'row',width:'98%',justifyContent:'center'}}>
                          <div style={{display:'flex',flexDirection:'column',width:'68vw'}}>
                          {Object.keys(program.days).map((day,index) => (
                            <div key={index}>
                             <div style={{...styles(theme,false,currentDay === index).dayPanel,width:'98%',flexDirection:'row'}} onClick={() => setCurrentDay(prev => prev === index ? -1 : index)}>
                               {currentDay === index ? <IoIosArrowUp style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/> : <IoIosArrowDown style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/>}
                               <FaCalendarDay style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'14px'}}/>
                               <p style={styles(theme).text}>{langIndex === 0 ? (index + 1) + '-день :  ' +  ' ' + program.daysNames[index][0] : (index + 1) + '-day :  ' +  ' ' + program.daysNames[index][1]}</p>
                             </div>
                             {currentDay === index && ( <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
                                {program.days[day].map((item, i) => {
                                    const exercise = allExercises().find(ex => ex.id === item.exId);
                                    if (!exercise) return null;
                                    return (
                                     <div key={i} style={{display:'flex',flexDirection:'row',width:'85%',marginLeft:'10%',marginRight:'5%',justifyContent:'flex-start',alignItems:'center'}}>
                                     <p style={styles(theme).text}>{i + 1 + '.'}</p>
                                     <MdFitnessCenter style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'14px'}}/>
                                     <p style={styles(theme).text}>{exercise.name[langIndex]}</p>
                                     <p style={{...styles(theme).subtext,marginLeft:'auto'}}>{item.sets}</p>
                                    </div>
                                  );
                                })}
                           </div>
                          )}
                            </div>
                          ))}
                          </div>
                         <MuscleView programmId={program.id} theme={theme} langIndex={langIndex}/>
                       </div>
                    </div>}
                </div>
                
               ))}
               
                {/* add panel */}
           {addPanel === 'AddProgrammPanel' && (
            <div style={styles(theme).addContainer}>
              <div style={styles(theme).additionalPanel}>
                <p style={styles(theme).text}>{langIndex === 0 ? 'Новая программа' : 'New programm'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'70%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={30} w='80%' h='20%' theme={theme} onChange={(value) => setName(value)} placeHolder={langIndex === 0 ? 'Название программы' : 'Programm name'}/>
                  <MyInput maxL={200} w='80%' h='30%' theme={theme} onChange={(value) => setDescription(value)} placeHolder={langIndex === 0 ? 'Описание программы' : 'Programm description'}/>
                  
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => onClose()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onAdd()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
            {showConfirmRemove && <div style={{position:'fixed',top:'50vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'85vw',height:'40vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              <p style={{...styles(theme).text,padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{langIndex === 0 ? 'Вы уверены, что хотите удалить упражнение? ' + currentProgramName : 'Are you sure you want to delete the exercise?' + currentProgramName}</p>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowConfirmRemove(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onRemove()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
            </div>}
           </div>
       )
}

export default TrainingExercise



const styles = (theme,isCurrentGroup,isCurrentExercise) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     paddingTop:'5vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  groupPanel :
      {
    display:'flex',
    flexDirection:'row',
    width: "98vW",
    height:'6vh',
    backgroundColor:isCurrentGroup ? Colors.get('trainingGroupSelected', theme) : Colors.get('trainingGroup', theme),
    borderTop:`1px solid ${Colors.get('border', theme)}`,
    alignItems: "center",
    justifyContent: "left",
    alignContent: "center"
  },
  dayPanel :
      {
    display:'flex',
    flexDirection:'column',
    width: "100vW",
    height:'4vh',
    backgroundColor:isCurrentExercise ? Colors.get('trainingGroupSelected', theme) : Colors.get('background', theme),
    alignItems: "center",
    justifyContent: "left"
  },
  panel :
      {
    display:'flex',
    flexDirection:'column',
    width: "100vW",
    alignItems: "center",
  },
  text :
  {
    textAlign: "left",
    fontSize: "12px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: "10px",
    color: Colors.get('subText', theme),
    marginBottom:'12px'
  },
  icon :
  {
    fontSize: "20px",
    color: Colors.get('icons', theme),
    marginLeft: "20px",
  },
   addContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
  },
  additionalPanel: {
    display:'flex',
        flexDirection:'column',
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius:"24px",
        border: `1px solid ${Colors.get('border', theme)}`,
        margin: "5px",
        backgroundColor:Colors.get('simplePanel', theme),
        boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
        width:"85vw",
        height:"100vw"
  },
   textArea: {
  marginTop:'30px',
  width: "80%",
  height: "auto",
  color: Colors.get('mainText', theme),
  fontSize: "12px",
  fontFamily: "Segoe UI",
  outline: "none",
  resize: "none",
  overflowY: "scroll",
  overflowX: "hidden",
  overflowWrap: "break-word",
  wordBreak: "break-word",
  hyphens: "auto",
  whiteSpace: "pre-wrap",
  border: "none", // убирает все границы
  borderBottom: `1px solid ${Colors.get('border', theme)}`, // оставляет только нижнюю
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