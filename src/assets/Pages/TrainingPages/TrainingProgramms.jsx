import {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,addPanel$,setShowPopUpPanel,setAddPanel, setConfirmationPanel} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {allExercises,switchPosition,addDayToProgram,redactDayInProgram,removeDayFromProgram,MuscleView,addProgram,redactProgram,removeProgram,
  addExerciseToSchedule,removeExerciseFromSchedule
} from '../../Classes/TrainingData.jsx'
import {FaCalendarDay,FaPlusSquare,FaTrash,FaPencilAlt, FaPlusCircle} from 'react-icons/fa';
import {TbDotsVertical,TbArrowMoveDownFilled,TbArrowMoveUpFilled} from 'react-icons/tb'
import {MdBook} from 'react-icons/md'
import {MdDone,MdClose,MdFitnessCenter} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';
import TrainingExercise from './TrainingExercise.jsx'

const TrainingProgramm = () => {
    const [programs, setPrograms] = useState([...AppData.programs]);
    const updatePrograms = () => {
      setPrograms([...AppData.programs]); // shallow copy to trigger re-render
    };
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[1]);
    // base
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [needRedact,setNeedRedact] = useState(false);
    const [currentId, setCurrentId] = useState(-1);
    const [currentDay, setCurrentDay] = useState(-1);
    //new programm
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currentSet, setCurrentSet] = useState(3);
    const [currentRepMin, setCurrentRepMin] = useState(4);
    const [currentRepMax, setCurrentRepMax] = useState(6);
    const [currentExId, setCurrentExId] = useState(0);
    const [dayIndex, setDayIndex] = useState(1);
    const [dayName, setDayName] = useState(langIndex === 0 ? 'День 1' : 'Day 1');
    //const [dayExercises,setDayExercises] = useState({
    //  1: [ { exId: 0, sets: '3x10-12' },{ exId: 5, sets: '3x10-12' },{ exId: 22, sets: '3x10-12' },],
    //});

    const [showAddDayPanel, setShowAddDayPanel] = useState(false);
    const [showExercisesList, setShowExercisesList] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showStarategyPanel, setShowStarategyPanel] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState('');
    // current type to remove and redact
    const [currentType,setCurrentType] = useState(0);

    // subscriptions
    useEffect(() => {
        if(currentRepMin > currentRepMax - 2)setCurrentRepMax(prev => prev + 1);
    }, [currentRepMin]);
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
        const subscriptionAddPanel = addPanel$.subscribe(value => setShowAddPanel(value === 'AddProgrammPanel'));
        const subscriptionFontSize = fontSize$.subscribe(setFSize);
        return () => {
          subscriptionAddPanel.unsubscribe();
          subscriptionFontSize.unsubscribe();
        };
    }, []);
    useEffect(() => {
    if (currentId === -1) return;
    const program = programs.find((program) => program.id === currentId);
    const daysCount = program.schedule.length;
    setDayIndex(daysCount);
    setDayName(langIndex === 0  ? `День ${daysCount + 1}`  : `Day ${daysCount + 1}`);
    }, [currentId, langIndex]);
    function onClose(){
      updatePrograms();
      setNeedRedact(false);
      setShowAddDayPanel(false);
      setShowConfirmRemove(false);
      setAddPanel('');
    }
    function onAddProgram(){
      addProgram(capitalizeName(name),capitalizeName(description));
      setName('');
      setDescription('');
      onClose();
    }
    function onAddTrainingDay(){
      addDayToProgram(currentId,capitalizeName(dayName));
      setDayIndex(prev => prev + 1);
      setDayName(langIndex === 0 ? 'День ' + (dayIndex + 2): 'Day ' + (dayIndex + 2));
      onClose();
    }
    function onAddExercise(){
      addExerciseToSchedule(currentId,currentDay,currentExId,currentSet + 'x' + currentRepMin + '-' + currentRepMax);
      setShowStarategyPanel(false);
      updatePrograms();
    }
    function onRemove(type){
      setCurrentType(type);
      let message = '';
      switch (type) {
        case 0:
          const rawName = programs.find((program) => program.id === currentId).name;
          const name = Array.isArray(rawName) ? rawName[langIndex] : rawName;
          message = langIndex === 0 ? 'Вы уверены, что хотите удалить программу : ' + name + ' ?': 'Are you sure you want to delete the program : ' + name + ' ?';
        break;
        case 1:
          const program = programs.find((program) => program.id === currentId);
          const dayName = program?.schedule[currentDay]?.name;
          message = langIndex === 0 ? 'Вы уверены, что хотите удалить тренировочный день : ' + dayName[langIndex] + ' ?' : 'Are you sure you want to delete the training day : ' + dayName[langIndex] + ' ?';
        break;
        case 2:
          const exId = programs.find((program) => program.id === currentId)?.schedule[currentDay]?.exercises[currentExId]?.exId;
          removeExerciseFromSchedule(currentId,currentDay,exId);
          updatePrograms();
        break;
      }
      setConfirmMessage(message);
      setShowConfirmRemove(type < 2 ? true : false);
    }
    function remove(){
       switch (currentType) {
        case 0:removeProgram(currentId);setCurrentId(-1);break;
        case 1:removeDayFromProgram(currentId,currentDay);setCurrentDay(prev => prev - 1);break;
       }
       
       onClose();
    }
    function onRedact(type) {
      const index = programs.findIndex((program) => program.id === currentId);
      setNeedRedact(true);
      setCurrentType(type);
      switch (type) {
        case 0:
          const isarr = Array.isArray(programs[index].name);
          setName(isarr ? programs[index].name[langIndex] : programs[index].name);
          setDescription(isarr ? programs[index].description[langIndex] : programs[index].description);
          setShowAddPanel(true);
        break;
        case 1:
          const rawName = programs[index].schedule[currentDay].name;
          const nameOfDay = Array.isArray(rawName) ? rawName[langIndex] : rawName;
          setDayName(nameOfDay);
          setShowAddDayPanel(true);
        break;
      }
    }
    function redact(){
       switch (currentType) {
        case 0:redactProgram(currentId,name,description);break;
        case 1:redactDayInProgram(currentId,currentDay,dayName);break;
       }
       onClose();
    }
    function switchPositions(type, switchType) {
     switchPosition(currentId, type, switchType, currentDay, currentExId);
      if (type === 0) {
         let newDayIndex = currentDay;
         if (switchType === 1) {
          newDayIndex = currentDay - 1;
        } else if (switchType === 0) {
          newDayIndex = currentDay + 1;
        }
        if (newDayIndex >= 0) {
         setCurrentDay(newDayIndex);
        }
     }else{
      let newExIndex = currentExId;
      if (switchType === 1) {
        newExIndex = currentExId - 1;
      } else if (switchType === 0) {
        newExIndex = currentExId + 1;
      }
      if (newExIndex >= 0) {
        setCurrentExId(newExIndex);
      }
    }
      updatePrograms();
    }
    function setCurrentExerciseId(id){
       setCurrentExId(id);
       setShowExercisesList(false);
       setShowStarategyPanel(true);
    }
       // render    
       return (
           <div style={styles(theme).container}>
               {programs.map((program) => (
                <div key={program.id} style={styles(theme).panel}>
                    <div style={styles(theme,currentId === program.id,false).groupPanel} onClick={() => {setCurrentId(prev => prev === program.id ? -1 : program.id);setCurrentDay(-1);}}>
                        {currentId === program.id ? <IoIosArrowUp style={styles(theme).icon}/> : <IoIosArrowDown style={styles(theme).icon}/>}
                        <MdBook style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'16px'}}/>
                        <p style={styles(theme,false,false,fSize).text}>{Array.isArray(program.name) ? program.name[langIndex] : program.name}</p>
                        <p style={{...styles(theme,false,false,fSize).subtext,marginRight:'5px',marginLeft:'auto'}}>{program.creationDate}</p>
                    </div>
                    {currentId === program.id && <div style={{...styles(theme).panel}}>
                        <div style={{...styles(theme,false,false,fSize).subtext,marginRight:'15px',marginLeft:'15px'}}>{currentDay === -1 && (Array.isArray(program.description) ? program.description[langIndex] : program.description)}</div>
                          <div style={{display:'flex',flexDirection:'row',width:'100%',justifyContent:'center'}}>
                            {currentDay === -1 && <div style={{...styles(theme,false,false,fSize).dayPanel,width:'98%',justifyContent:'space-around',flexDirection:'row'}}>
                              <FaPlusSquare  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/> 
                              <FaPencilAlt  onClick={() => onRedact(0)} style={{...styles(theme).icon,fontSize:'14px'}}/> 
                              <FaTrash  onClick={() => onRemove(0)} style={{...styles(theme).icon,fontSize:'14px'}}/>
                             </div>}
                          </div>
                          <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
                          {program.schedule.map((day, index) => (<div key={index}><div style={{...styles(theme, false, currentDay === index).dayPanel,width: '98%',flexDirection: 'row'}}onClick={() => setCurrentDay(prev => prev === index ? -1 : index)}>
                          {currentDay === index ? (<IoIosArrowUp style={{ ...styles(theme).icon, marginLeft: '2%', width: '10px', marginTop: '7px' }} />) : (
                           <IoIosArrowDown style={{ ...styles(theme).icon, marginLeft: '2%', width: '10px', marginTop: '7px' }} />)}
                          <FaCalendarDay style={{ ...styles(theme).icon, marginRight: '5px', marginLeft: '5px', fontSize: '14px' }} />
                          <p style={styles(theme, false, false, fSize).text}>
                            {langIndex === 0 ? `${index + 1}-день :  ${day.name[0]}`: `${index + 1}-day :  ${day.name[1]}`}</p>
                          {currentDay === index && (<div onClick={(e) => e.stopPropagation()} style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',marginLeft: 'auto'}}>
                          <FaPlusCircle onClick={() => setShowExercisesList(true)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <TbArrowMoveDownFilled onClick={() => switchPositions(0, 0)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <TbArrowMoveUpFilled onClick={() => switchPositions(0, 1)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <FaPencilAlt onClick={() => onRedact(1)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <FaTrash onClick={() => onRemove(1)} style={{ ...styles(theme).icon, fontSize: '14px', marginRight: '8px' }}/></div>)}
                       </div>
                      {currentDay === index && (<div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                       {day.exercises.map((item, i) => {
                       const exercise = allExercises().find(ex => ex.id === item.exId);
                       if (!exercise) return null;
                       return (
                        <div key={i} onClick={() => setCurrentExId(i)} style={{ display: 'flex', flexDirection: 'row', width: '95%', marginLeft: '6px', marginRight: '5%', justifyContent: 'flex-start', alignItems: 'center'}}>
                        <p style={styles(theme, false, false, fSize).text}>{i + 1}.</p>
                        <MdFitnessCenter style={{ ...styles(theme).icon, marginRight: '5px', marginLeft: '5px', fontSize: '14px' }}/>
                        <p style={styles(theme, false, false, fSize).text}>{exercise.name[langIndex]}</p>
                        <p style={{ ...styles(theme, false, false, fSize).subtext, marginLeft: 'auto' }}> {item.sets}</p>
                         
                         {currentExId === i && (<div onClick={(e) => e.stopPropagation()} style={{display: 'flex',flexDirection: 'row',justifyContent: 'center',marginLeft: 'auto'}}>
                          <TbArrowMoveDownFilled onClick={() => switchPositions(1, 0)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <TbArrowMoveUpFilled onClick={() => switchPositions(1, 1)} style={{ ...styles(theme).icon, fontSize: '14px' }}/>
                          <FaTrash onClick={() => onRemove(2)} style={{ ...styles(theme).icon, fontSize: '14px', marginRight: '8px' }}/>
                         </div>)}
                        
                      </div>
                     );
                   })}
               </div>
               )}
             </div>))}  
                       </div>
                       <MuscleView programmId={program.id} theme={theme} langIndex={langIndex} programs={programs}/>
                    </div>}
                </div>
                
               ))}
               {currentId === -1 && <div onClick={() => setShowAddPanel(true)} style={{...styles(theme).groupPanel,height:'5%',justifyContent:'center'}} >
                  <FaPlusSquare style={{...styles(theme).icon,fontSize:'24px'}}/>     
               </div>}
                {/* add panel */}
           {showAddPanel && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'40%'}}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? needRedact ? 'Редактировать программу' : 'Новая программа' : needRedact ? 'Redact programm' : 'New programm'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'82%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={30} w='80%' h='18%' value={needRedact ? name : ''} theme={theme} onChange={(value) => setName(value)} placeHolder={langIndex === 0 ? 'Название программы' : 'Programm name'}/>
                  <MyInput maxL={100} w='80%' h='44%' value={needRedact ? description : ''} theme={theme} onChange={(value) => setDescription(value)} placeHolder={langIndex === 0 ? 'Описание программы' : 'Programm description'}/>
                 
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => onClose()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => {if(needRedact){redact()}else{onAddProgram()}}} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
            {/* add training day panel */}
            {showAddDayPanel && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'40%'}}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? needRedact ? 'Редактировать тренировочный день' : 'Добавь тренировочный день' : needRedact ? 'Redact training day' : 'Add training day'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'80%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={30} w='90%' h='40%' theme={theme} value={dayName} onChange={(value) => setDayName(value)} placeHolder={langIndex === 0 ? 'День' : 'Day'}/>
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowAddDayPanel(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => {if(needRedact){redact();}else {onAddTrainingDay();}}} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
            {/* exercises list panel */}
            {showExercisesList && (
            <div style={{...styles(theme).addContainer}}>
              <TrainingExercise needToAdd={true} setEx={setCurrentExerciseId} />
            </div>
            )}
            {/* strategy panel */}
            {showStarategyPanel && <div style={styles(theme).addContainer}>
            <div style={{position:'fixed',top:'30vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'80vw',height:'80vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
               <p style={{...styles(theme,false,false,fSize).text,padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{langIndex === 0 ? 'Установите стратегию выполнения' : 'Set performing strategy'}</p>
                <div style={{display:'flex',flexDirection:'row',height:'50%',width:'60%',justifyContent:'space-around'}}>
                  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                    <IoIosArrowUp onClick={() => setCurrentSet(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                      <div style={{...styles(theme).text,fontSize:'24px'}}>{currentSet}</div>
                    <IoIosArrowDown onClick={() => setCurrentSet(prev => prev - 1 > 0 ? prev - 1 : 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                  </div>
                    <p style={{...styles(theme).text,fontSize:'24px',marginTop:'30%'}}>{'x'}</p>
                  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                    <IoIosArrowUp onClick={() => setCurrentRepMin(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                      <div style={{...styles(theme).text,fontSize:'24px'}}>{currentRepMin}</div>
                    <IoIosArrowDown onClick={() => setCurrentRepMin(prev => prev - 1 > 0 ? prev - 1 : 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                  </div>
                    <p style={{...styles(theme).text,fontSize:'24px',marginTop:'30%'}}>{'-'}</p>
                  <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
                    <IoIosArrowUp onClick={() => setCurrentRepMax(prev => prev + 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                      <div style={{...styles(theme).text,fontSize:'24px'}}>{currentRepMax}</div>
                    <IoIosArrowDown onClick={() => setCurrentRepMax(prev => (prev - 1 > currentRepMin + 2 ? prev - 1 : currentRepMin + 2))} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                  </div>
                </div>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'center'}}>
                <MdDone onClick={() => onAddExercise()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
            </div>
            </div>}
            {/* confirm remove panel */}
            {showConfirmRemove && 
            <div style={styles(theme).addContainer}>
             <div style={{position:'fixed',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'85vw',height:'40vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              <p style={{...styles(theme,false,false,fSize).text,textAlign:'center',padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{confirmMessage}</p>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowConfirmRemove(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => remove()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            }
           </div>
       )
}

export default TrainingProgramm



const styles = (theme,isCurrentGroup,isCurrentExercise,fSize) =>
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
    width: "100%",
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
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
    alignItems: "center",
    justifyContent: "left"
  },
  panel :
      {
    display:'flex',
    flexDirection:'column',
    width: "100%",
    alignItems: "center",
    justifyItems: "center",
  },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
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
    padding: '10px',
  },
  additionalPanel: {
    display:'flex',
        flexDirection:'column',
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius:"24px",
        border: `1px solid ${Colors.get('border', theme)}`,
        backgroundColor:Colors.get('simplePanel', theme),
        boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
        width:"100%",
        height:"100vw"
  },
    exercisePanel :
        {
      display:'flex',
      flexDirection:'column',
      width: "90vW",
      height:'5vh',
      backgroundColor:isCurrentExercise ? Colors.get('trainingGroupSelected', theme) : Colors.get('background', theme),
      alignItems: "center",
      justifyContent: "left"
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
const capitalizeName = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};