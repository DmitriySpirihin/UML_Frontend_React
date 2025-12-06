import {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,addPanel$,setShowPopUpPanel,setAddPanel} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {allExercises,allPrograms, MuscleIcon,MuscleView,addProgram,updateProgram,removeProgram} from '../../Classes/TrainingData.jsx'
import {FaCalendarDay,FaPlusSquare,FaPlus,FaTrash,FaPencilAlt} from 'react-icons/fa';
import {TbDotsVertical,TbArrowMoveDownFilled,TbArrowMoveUpFilled} from 'react-icons/tb'
import {MdBook} from 'react-icons/md'
import {MdDone,MdClose,MdFitnessCenter} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';

const TrainingExercise = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [showMoreOptions, setShowMoreOptions] = useState(false);
    const [fSize, setFSize] = useState(AppData.prefs[1]);
    // exersises list
    const [currentMuscleGroupId, setCurrentMuscleGroupId] = useState(-1);
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);
    const [muscleGroupId, setMuscleGroupId] = useState(0);
    // base
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [currentId, setCurrentId] = useState(-1);
    const [currentDay, setCurrentDay] = useState(-1);
    //new programm
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currentProgramName, setCurrentProgramName] = useState('');
    const [currentSet, setCurrentSet] = useState(3);
    const [currentRepMin, setCurrentRepMin] = useState(4);
    const [currentRepMax, setCurrentRepMax] = useState(6);
    const [currentExId, setCurrentExId] = useState(0);
    const [dayIndex, setDayIndex] = useState(1);
    const [dayName, setDayName] = useState(langIndex === 0 ? 'День 1' : 'Day 1');
    const [days,addDays] = useState({
      1: [ { exId: 0, sets: '3x10-12' },{ exId: 5, sets: '3x10-12' },{ exId: 22, sets: '3x10-12' },],
    });
    const [daysNames,addDaysNames] = useState(['ноги']);

    const [showAddDayPanel, setShowAddDayPanel] = useState(false);
    const [showExercisesList, setShowExercisesList] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showAddNewExersise, setShowAddNewExersise] = useState(false);
    const [showStarategyPanel, setShowStarategyPanel] = useState(false);

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
    // for exersises list
    function setMuscleGroup(id){
        playEffects(null);
        setCurrentMuscleGroupId(currentMuscleGroupId == id ? -1 : id);
        if(currentMuscleGroupId === -1) setCurrentExerciseId(-1);
    }
    // main functions
    
    function onClose(){
      setShowMoreOptions(false);
      setAddPanel('');
    }
    function onAddProgramm(){
      addProgram(name,description,true,days,daysNames);
      setName('');
      setDescription('');
      setDays({});
      addDaysNames([]);
      onClose();
    }
    function onAddTrainingDay(){
      addDaysNames(prev => [...prev,dayName.length > 2 ? dayName : langIndex === 0 ? 'День ' +daysAmount : 'Day ' + daysAmount]);
      setDayIndex(prev => prev + 1);
      setDayName(langIndex === 0 ? 'День ' + daysAmount : 'Day ' + daysAmount);
      setShowMoreOptions(false);
      setShowAddDayPanel(false);
    }
    function onAddExercise(){
      if(!(dayIndex in days))days[dayIndex] = [];
      days[dayIndex].push({exId:currentExId,sets:currentSet + 'x' + currentRepMin + '-' + currentRepMax});
      setShowMoreOptions(false);
      setShowStarategyPanel(false);
      setShowExercisesList(false);
    }
    function onRemove(){
      removeProgram(currentId);
      onClose();
    }
    function redactDay(type, index) {
  switch (type) {
    case 0: // remove exercise at `index` from day `dayIndex`
      addDays(prev => {
        if (!prev.hasOwnProperty(dayIndex)) {
          return prev;
        }
        const dayExercises = prev[dayIndex];
        if (index < 0 || index >= dayExercises.length) {
          return prev;
        }
        const updatedDay = [
          ...dayExercises.slice(0, index),
          ...dayExercises.slice(index + 1)
        ];
        return {
          ...prev,
          [dayIndex]: updatedDay
        };
      });
      break;
    case 1: // move up (swap with item above)
      addDays(prev => {
        if (!prev.hasOwnProperty(dayIndex)) return prev;
        const arr = prev[dayIndex];
        if (index <= 0 || index >= arr.length) return prev;
        const updated = [...arr];
        [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
        return { ...prev, [dayIndex]: updated };
      });
      break;
    case 2: // move down (swap with item below)
      addDays(prev => {
        if (!prev.hasOwnProperty(dayIndex)) return prev;
        const arr = prev[dayIndex];
        if (index < 0 || index >= arr.length - 1) return prev;
        const updated = [...arr];
        [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
        return { ...prev, [dayIndex]: updated };
      });
      break;
  }
}
       // render    
       return (
           <div style={styles(theme).container}>
               {allPrograms().map((program) => (
                <div key={program.id} style={styles(theme).panel}>
                    <div style={styles(theme,currentId === program.id,false).groupPanel} onClick={() => {setCurrentId(prev => prev === program.id ? -1 : program.id);setCurrentDay(-1);}}>
                        {currentId === program.id ? <IoIosArrowUp style={styles(theme).icon}/> : <IoIosArrowDown style={styles(theme).icon}/>}
                        <MdBook style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'16px'}}/>
                        <p style={styles(theme,false,false,fSize).text}>{program.name[langIndex]}</p>
                        <p style={{...styles(theme,false,false,fSize).subtext,marginRight:'5px',marginLeft:'auto'}}>{program.creationDate}</p>
                    </div>
                    {currentId === program.id && <div style={{...styles(theme).panel}}>
                        <div style={{...styles(theme,false,false,fSize).subtext,marginRight:'15px',marginLeft:'15px'}}>{currentDay === -1 && program.description[langIndex]}</div>
                        
                          <div style={{display:'flex',flexDirection:'row',width:'100%',justifyContent:'center'}}>
                            {currentDay === -1 && <div style={{...styles(theme,false,false,fSize).dayPanel,width:'98%',justifyContent:'space-around',flexDirection:'row'}}>
                              <FaPlusSquare  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/> 
                              <FaPencilAlt  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/> 
                              <FaTrash  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/>
                             </div>}
                          </div>
                          <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
                          {Object.keys(program.days).map((day,index) => (
                            <div key={index}>
                             <div style={{...styles(theme,false,currentDay === index).dayPanel,width:'98%',flexDirection:'row'}} onClick={() => setCurrentDay(prev => prev === index ? -1 : index)}>
                               {currentDay === index ? <IoIosArrowUp style={{...styles(theme).icon,marginLeft:'2%',width:'10px',marginTop:'7px'}}/> : <IoIosArrowDown style={{...styles(theme).icon,marginLeft:'2%',width:'10px',marginTop:'7px'}}/>}
                               <FaCalendarDay style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'14px'}}/>
                               <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? (index + 1) + '-день :  ' +  ' ' + program.daysNames[index][0] : (index + 1) + '-day :  ' +  ' ' + program.daysNames[index][1]}</p>
                               <div style={{display:'flex',flexDirection:'row',justifyContent:'center',marginLeft:'auto'}}>
                                 <TbArrowMoveDownFilled style={{...styles(theme).icon,fontSize:'14px'}}/>
                                 <TbArrowMoveUpFilled style={{...styles(theme).icon,fontSize:'14px'}}/>
                                 <FaPencilAlt  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/>
                                 <FaTrash  onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'14px'}}/>
                                 <TbDotsVertical style={{...styles(theme).icon,fontSize:'14px'}}/>
                               </div>
                             </div>
                             {currentDay === index && ( <div style={{display:'flex',flexDirection:'column',width:'100%'}}>
                              
                                {program.days[day].map((item, i) => {
                                    const exercise = allExercises().find(ex => ex.id === item.exId);
                                    if (!exercise) return null;
                                    return (
                                     <div key={i} style={{display:'flex',flexDirection:'row',width:'95%',marginLeft:'6px',marginRight:'5%',justifyContent:'flex-start',alignItems:'center'}}>
                                     <p style={styles(theme,false,false,fSize).text}>{i + 1 + '.'}</p>
                                     <MdFitnessCenter style={{...styles(theme).icon,marginRight:'5px',marginLeft:'5px',fontSize:'14px'}}/>
                                     <p style={styles(theme,false,false,fSize).text}>{exercise.name[langIndex]}</p>
                                     <p style={{...styles(theme,false,false,fSize).subtext,marginLeft:'auto'}}>{item.sets}</p>
                                    </div>
                                  );
                                })}
                                
                           </div>
                           
                          )}
                            </div>
                          ))}
                         
                       </div>
                       <MuscleView programmId={program.id} theme={theme} langIndex={langIndex}/>
                    </div>}
                </div>
                
               ))}
               {currentId === -1 && <div onClick={() => setShowAddPanel(true)} style={{...styles(theme).groupPanel,height:'5%',justifyContent:'center'}} >
                  <FaPlusSquare style={{...styles(theme).icon,fontSize:'24px'}}/>     
               </div>}
                {/* add panel */}
           {showAddPanel && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'80%'}}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Новая программа' : 'New programm'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'82%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={30} w='80%' h='8%' theme={theme} onChange={(value) => setName(value)} placeHolder={langIndex === 0 ? 'Название программы' : 'Programm name'}/>
                  <MyInput maxL={100} w='80%' h='14%' theme={theme} onChange={(value) => setDescription(value)} placeHolder={langIndex === 0 ? 'Описание программы' : 'Programm description'}/>
                 <div style={{display:'flex',flexDirection:'column',width:'95%',height:'75%',justifyContent:'flex-start',alignItems:'center',overflowY:'scroll',marginTop:'5px',backgroundColor:Colors.get('bottomPanel',theme),borderRadius:'12px'}}>
                    { Object.keys(days).length > 0 ? Object.keys(days).map((day,ind) => (
                      <div key={ind} style={{display:'flex',flexDirection:'row',width:'80%',height:'10%',justifyContent:'flex-start',alignItems:'center',borderBottom:`1px solid ${Colors.get('border',theme)}`}}>
                        <p style={styles(theme,false,false,fSize).text}>{ind + 1 + '-' + (langIndex === 0 ? 'день' : 'day') + ' : '}</p>
                        <FaCalendarDay style={{...styles(theme).icon,fontSize:'16px',marginLeft:'5px', marginBottom:'2px'}}/>
                        <p style={{...styles(theme,false,false,fSize).text,marginLeft:'5px'}}>{daysNames[ind]}</p>
                      </div>
                    )) : null}
                    <div style={{display:'flex',flexDirection:'row',width:'80%',height:'10%',justifyContent:'flex-start',alignItems:'center'}}>
                      <FaPlusSquare onClick={() => setShowAddDayPanel(true)} style={{...styles(theme).icon,fontSize:'24px',marginLeft:'1px'}}/>
                      <p style={{...styles(theme,false,false,fSize).subtext,marginLeft:'15px'}}>{langIndex === 0 ? 'Добавить день' : 'Add day'}</p>
                    </div>
                  </div>
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => onClose()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onAdd()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
            {/* add training day panel */}
            {showAddDayPanel && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'70%'}}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Добавь тренировочный день' : 'Add training day'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'80%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={30} w='90%' h='20%' theme={theme} value={dayName} onChange={(value) => setDayName(value)} placeHolder={langIndex === 0 ? 'День' : 'Day'}/>
                  <div style={{display:'flex',flexDirection:'column',width:'95%',height:'80%',justifyContent:'flex-start',alignItems:'center',overflowY:'scroll',marginTop:'5px',backgroundColor:Colors.get('bottomPanel',theme),borderRadius:'12px'}}>
                    { dayIndex in days && days[dayIndex].length > 0 ? days[dayIndex].map((day,index) => (
                      <div key={index} style={{display:'flex',flexDirection:'row',width:'90%',height:'10%',justifyContent:'flex-start',alignItems:'center'}}>
                        <p style={styles(theme,false,false,fSize).text}>{(index + 1).toString()}</p>
                        <MdFitnessCenter style={{...styles(theme).icon,fontSize:'16px',marginLeft:'5px', marginBottom:'2px'}}/>
                        <p style={{...styles(theme,false,false,fSize).text,marginLeft:'5px'}}>{allExercises().find(ex => ex.id === day.exId)?.name[langIndex]}</p>
                        <p style={{...styles(theme,false,false,fSize).subtext,marginLeft:'auto'}}>{day.sets}</p>
                        {showMoreOptions && index < days[dayIndex].length - 1 && <TbArrowMoveDownFilled onClick={() => redactDay(2,index)} style={{...styles(theme).icon,fontSize:'18px',marginLeft:'3px'}}/>}
                        {showMoreOptions && index > 0 && <TbArrowMoveUpFilled onClick={() => redactDay(1,index)} style={{...styles(theme).icon,fontSize:'18px',marginLeft:'3px'}}/>}
                        {showMoreOptions && <FaTrash onClick={() => redactDay(0,index)} style={{...styles(theme).icon,fontSize:'16px',marginLeft:'3px'}}/>}
                        <TbDotsVertical onClick={() => setShowMoreOptions(!showMoreOptions)} style={{...styles(theme).icon,fontSize:'18px',marginLeft:'3px'}}/>
                      </div>
                    )) : null}
                    <div style={{display:'flex',flexDirection:'row',width:'90%',height:'20%',justifyContent:'flex-start',alignItems:'center'}}>
                      <FaPlusSquare onClick={() => setShowExercisesList(true)} style={{...styles(theme).icon,fontSize:'24px',marginLeft:'1px'}}/>
                      <p style={{...styles(theme).subtext,marginLeft:'15px'}}>{langIndex === 0 ? 'Добавить упражнение' : 'Add exercise'}</p>
                    </div>
                  </div>
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowAddDayPanel(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onAddTrainingDay()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
            {/* exercises list panel */}
            {showExercisesList && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'80%',overflowY:'scroll'}}>
                 {Object.keys(MuscleIcon.muscleIconsSrc).map((key) => (
                                 <div key={key} style={styles(theme).panel}>
                                    <div key={key} style={styles(theme,currentMuscleGroupId == key,false).groupPanel} onClick={() => setMuscleGroup(prev => prev === key ? -1 : key)}>
                                        {currentMuscleGroupId == key ? <IoIosArrowUp style={styles(theme).icon}/> : <IoIosArrowDown style={styles(theme).icon}/>}
                                        {MuscleIcon.get(key,langIndex,theme)}
                                    </div>
                                    {currentMuscleGroupId == key ? (
                                     <div style={styles(theme).panel}>
                                         {allExercises().filter((exercise) => exercise.mgId == key).map((exercise) => (
                                           <div key={exercise.id} style={styles(theme).panel}>
                                             <div style={{...styles(theme,false,currentExerciseId == exercise.id).exercisePanel,width:'98%',flexDirection:'row'}} >
                                               <p style={{...styles(theme,false,false,fSize).text,marginLeft:'5%'}}>{exercise.name[langIndex] + (exercise.isCustom ? ' 🔖' : '')}</p>
                                               <p style={{...styles(theme,false,false,fSize).subtext,marginLeft: 'auto',marginRight:'5%',color:exercise.isBase ? Colors.get('trainingBaseFont',theme) : Colors.get('trainingIsolatedFont',theme)}}>{exercise.isBase ? langIndex === 0 ? 'Базовое' : 'Base' : langIndex === 0 ? 'Изолированное' : 'Isolated'}</p>
                                               <FaPlusSquare onClick={() => {setCurrentExId(exercise.id);setShowStarategyPanel(true)}} style={{...styles(theme).icon,marginLeft:'1px',marginRight:'12px'}}/>
                                             </div>
                                         </div>))}
                                          <div style={styles(theme).panel}>
                                             <div style={{...styles(theme).exercisePanel,width:'98%',justifyContent:'center',alignItems:'center',flexDirection:'row'}} >
                                               <FaPlusSquare onClick={() => setShowAddNewExersise(true)} style={{...styles(theme).icon,fontSize:'28px',marginLeft:'1px',marginRight:'6px'}}/>
                                             </div>
                                         </div>
                                       </div>
                                    ) : null}
                                 </div>
                                ))}
              </div>
            </div>
            )}
            {/* strategy panel */}
            {showStarategyPanel && <div style={styles(theme).addContainer}>
            <div style={{position:'fixed',top:'30vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'80vw',height:'80vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
               <p style={{...styles(theme,false,false,fSize).text,padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{langIndex === 0 ? 'Установите стратегию выполнения' + currentProgramName : 'Set performing strategy' + currentProgramName}</p>
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
                    <IoIosArrowDown onClick={() => setCurrentRepMax(prev => prev - 1 > 0 ? prev - 1 : 1)} style={{...styles(theme).icon,marginLeft:'1px',fontSize:'24px'}}/>
                  </div>
                </div>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'center'}}>
                <MdDone onClick={() => onAddExercise()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
            </div>
            </div>}
            {/* add new exersise panel */}
            {showAddNewExersise && <div style={{position:'fixed',top:'50vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'85vw',height:'40vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              
            </div>}
            {/* confirm remove panel */}
            {showConfirmRemove && <div style={{position:'fixed',top:'50vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'85vw',height:'40vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              <p style={{...styles(theme,false,false,fSize).text,padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{langIndex === 0 ? 'Вы уверены, что хотите удалить упражнение? ' + currentProgramName : 'Are you sure you want to delete the exercise?' + currentProgramName}</p>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowConfirmRemove(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onRemove()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
            </div>}
           </div>
       )
}

export default TrainingExercise



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