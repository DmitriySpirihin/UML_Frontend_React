import {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,addPanel$,setShowPopUpPanel} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {allExercises,MuscleIcon,addExercise,removeExercise,updateExercise} from '../../Classes/TrainingData.jsx'
import { FaRegSquare, FaRegCheckSquare,FaTrash,FaPencilAlt } from 'react-icons/fa';
import {TbDotsVertical} from 'react-icons/tb'
import {IoMdArrowDropdown,IoMdArrowDropup,IoMdList} from 'react-icons/io'
import {MdDone,MdClose} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';

const TrainingExercise = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[1]);
    const [addPanel, setAddPanel] = useState('');
    const [currentMuscleGroupId, setCurrentMuscleGroupId] = useState(-1);
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);
    const [currentExerciseName, setCurrentExerciseName] = useState('');
    const [showMuscleList, setShowMuscleList] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [showRedakt, setShowRedakt] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [muscleGroupId, setMuscleGroupId] = useState(0);
    const [isBase, setIsBase] = useState(true);
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
        const subscriptionFontSize = fontSize$.subscribe(setFSize);
        return () => {
          subscriptionAddPanel.unsubscribe();
          subscriptionFontSize.unsubscribe();
        };
    }, []);
    function setMuscleGroup(id){
        playEffects(null);
        setCurrentMuscleGroupId(currentMuscleGroupId == id ? -1 : id);
        if(currentMuscleGroupId === -1) setCurrentExerciseId(-1);
    }
    function setExercise(id){
        playEffects(null);
        setCurrentExerciseId(currentExerciseId == id ? -1 : id);
    }
    function onClose(){
        playEffects(null);
        setShowMuscleList(false);
        setAddPanel('');
        setName('');
        setDescription('');
        setMuscleGroupId(0);
        setIsBase(true);
    }
    function onAdd(){
      if(name.length > 3){
        playEffects(null);
        addExercise(muscleGroupId,name,description.length > 3 ? description : (langIndex === 0 ? 'Своё упражнение' : 'Custom exercise'),isBase);
        onClose();
      }else{
        if(name.length < 3){
          setShowPopUpPanel(langIndex === 0 ? 'Введите название упражнения, не менее 3 символов' : 'Set exercise name , at least 3 characters',2000,false);
        }
      }
    }
    function onRedaktStart(){
      const exercise = allExercises().find(ex => ex.id === currentExerciseId);
      if(exercise){
        setName(exercise.name[langIndex]);
        setDescription(exercise.description[langIndex]);
        setMuscleGroupId(exercise.mgId);
        setIsBase(exercise.isBase);
        setShowRedakt(true);
      }
    }
    function onRedakt(){
      playEffects(null);
      updateExercise(currentExerciseId,muscleGroupId,name,description.length > 3 ? description : (langIndex === 0 ? 'Своё упражнение' : 'Custom exercise'),isBase);
      setShowRedakt(false);
    }
    function onRemove(){
      playEffects(null);
      removeExercise(currentExerciseId);
      setCurrentExerciseId(-1);
      setShowConfirmRemove(false);
      onClose();
    }
       // render    
       return (
           <div style={styles(theme).container}>
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
                            <div style={{...styles(theme,false,currentExerciseId == exercise.id).exercisePanel,width:'98%',flexDirection:'row'}} onClick={() => setExercise(prev => prev === exercise.id ? -1 : exercise.id)}>
                              {currentExerciseId == exercise.id ? <IoIosArrowUp style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/> : <IoIosArrowDown style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/>}
                              <p style={{...styles(theme,false,false,fSize).text,marginLeft:'5%'}}>{exercise.name[langIndex] + (exercise.isCustom ? ' 🔖' : '')}</p>
                              <p style={{...styles(theme,false,false,fSize).subtext,marginLeft: 'auto',marginRight:'5%',color:exercise.isBase ? Colors.get('trainingBaseFont',theme) : Colors.get('trainingIsolatedFont',theme)}}>{exercise.isBase ? langIndex === 0 ? 'Базовое' : 'Base' : langIndex === 0 ? 'Изолированное' : 'Isolated'}</p>
                            </div>
                            {currentExerciseId == exercise.id ? (
                                    <div style={{...styles(theme).panel,flexDirection:'row',marginLeft:'6%',width:'86%'}}>
                                        <p style={styles(theme,false,false,fSize).subtext}>{exercise.description[langIndex]}</p>
                                        {exercise.isCustom && 
                                          <div style={{display:'flex',flexDirection:'row',alignItems:'center',marginLeft:'auto',justifyContent:'center'}}>
                                            {showAddOptions && <FaPencilAlt onClick={() => {setCurrentExerciseName(exercise.name[langIndex]);onRedaktStart()}} style={{...styles(theme).icon,fontSize:'18px'}}/>}
                                            {showAddOptions && <FaTrash onClick={() => {setCurrentExerciseName(exercise.name[langIndex]);setShowConfirmRemove(true);}} style={{...styles(theme).icon,fontSize:'18px'}}/>}
                                            <TbDotsVertical onClick={() => {setShowAddOptions(!showAddOptions)}} style={{...styles(theme).icon,fontSize:'18px'}}/>
                                          </div>
                                        }
                                    </div>
                                ) : null}
                        </div>))}

                      </div>
                   ) : null}
                </div>
               ))}
               <div style={{height:'10vh'}}><p style={styles(theme,false,false,fSize).text}>{'_'}</p></div>
                {/* add panel */}
           {addPanel === 'AddExercisePanel' && (
            <div style={styles(theme).addContainer}>
              <div style={styles(theme).additionalPanel}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Добавь свое упражнение' : 'Add your exercise'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'70%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={40} w='80%' h='20%' theme={theme} onChange={(value) => setName(value)} placeHolder={langIndex === 0 ? 'Название упражнения' : 'Exercise name'}/>
                  <MyInput maxL={300} w='80%' h='30%' theme={theme} onChange={(value) => setDescription(value)} placeHolder={langIndex === 0 ? 'Описание упражнения' : 'Exercise description'}/>
                  <div style={{display:'flex',flexDirection:'row',width:'70%',justifyContent:'space-around',alignItems:'center',marginTop:'5%'}}>
                    {MuscleIcon.get(muscleGroupId,langIndex,theme,false)}
                    <IoMdList style={{...styles(theme).icon,fontSize:'32px'}}/>
                    {!showMuscleList ? <IoMdArrowDropup onClick={() => setShowMuscleList(true)} style={{...styles(theme).icon,fontSize:'32px'}}/> : <IoMdArrowDropdown onClick={() => setShowMuscleList(false)} style={{...styles(theme).icon,fontSize:'32px'}}/>}
                  </div>
                  <div style={{display:'flex',flexDirection:'row',width:'50%',justifyContent:'space-around',alignItems:'center',marginTop:'5%'}}>
                    <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Базовое упражнение' : 'Base exercise'}</p>
                    {isBase ? <FaRegCheckSquare onClick={() => setIsBase(false)} style={{...styles(theme).icon,fontSize:'24px'}}/> :
                     <FaRegSquare onClick={() => setIsBase(true)} style={{...styles(theme).icon,fontSize:'24px'}}/>}
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
            {showMuscleList && <div style={{position:'fixed',top:'15vh',left:'7.5vw',display:'flex',flexWrap: 'wrap',width:'85vw',height:'80vw',justifyContent:'center',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              {Object.keys(MuscleIcon.muscleIconsSrc).map((key) => (
                  <div key={key}
                  onClick={() => {setMuscleGroupId(key);setShowMuscleList(false);}}
                  style={{margin:'5px',marginTop:'15px',width:'55px',height:'45px'}}>
                  {MuscleIcon.getForList(key,langIndex,theme)}
                </div>
              ))}
            </div>}
            {showConfirmRemove && <div style={{position:'fixed',top:'50vh',left:'7.5vw',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',width:'85vw',height:'40vw',marginTop:'5px',borderRadius:'24px',border:`1px solid ${Colors.get('border', theme)}`,backgroundColor:Colors.get('background', theme),zIndex:'7000'}}>
              <p style={{...styles(theme,false,false,fSize).text,padding:'20px',marginLeft:'10%',marginRight:'5%'}}>{langIndex === 0 ? 'Вы уверены, что хотите удалить упражнение? ' + currentExerciseName : 'Are you sure you want to delete the exercise?' + currentExerciseName}</p>
              <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowConfirmRemove(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onRemove()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
            </div>}
            {showRedakt && (
            <div style={styles(theme).addContainer}>
              <div style={{...styles(theme).additionalPanel,height:'40%'}}>
                <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Добавь свое упражнение' : 'Add your exercise'}</p>
                <div style={{display:'flex',flexDirection:'column',backgroundColor:Colors.get('background',theme),height:'70%',width:'100%',alignItems:'center'}}>
                  <MyInput maxL={40} w='80%' h='20%' value={name} theme={theme} onChange={(value) => setName(value)} placeHolder={langIndex === 0 ? 'Название упражнения' : 'Exercise name'}/>
                  <MyInput maxL={300} w='80%' h='30%' value={description} theme={theme} onChange={(value) => setDescription(value)} placeHolder={langIndex === 0 ? 'Описание упражнения' : 'Exercise description'}/>
                  
                  <div style={{display:'flex',flexDirection:'row',width:'50%',justifyContent:'space-around',alignItems:'center',marginTop:'5%'}}>
                    <p style={styles(theme,false,false,fSize).text}>{langIndex === 0 ? 'Базовое упражнение' : 'Base exercise'}</p>
                    {isBase ? <FaRegCheckSquare onClick={() => setIsBase(false)} style={{...styles(theme).icon,fontSize:'24px'}}/> :
                     <FaRegSquare onClick={() => setIsBase(true)} style={{...styles(theme).icon,fontSize:'24px'}}/>}
                  </div>
                </div>
                {/* bottom buttons */}
                <div style={{display:'flex',flexDirection:'row',width:'60%',justifyContent:'space-between'}}>
                <MdClose onClick={() => setShowRedakt(false)} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                <MdDone onClick={() => onRedakt()} style={{...styles(theme).icon,fontSize:'32px', marginBottom:'8px'}}/>
                </div>
              </div>
            </div>
            )}
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
    width: "98vW",
    height:'6vh',
    backgroundColor:isCurrentGroup ? Colors.get('trainingGroupSelected', theme) : Colors.get('trainingGroup', theme),
    borderTop:`1px solid ${Colors.get('border', theme)}`,
    alignItems: "center",
    justifyContent: "left",
    alignContent: "space-between"
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
    fontSize: fSize === 0 ? "13px" : '15px',
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? "11px" : '13px',
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
        backgroundColor:Colors.get('simplePanel', theme),
        boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
        width:"100%",
        height:"100vw"
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