import {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,addPanel$,setShowPopUpPanel} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {MuscleIcon,addExercise,removeExercise,updateExercise} from '../../Classes/TrainingData.jsx'
import { FaRegSquare, FaRegCheckSquare,FaTrash,FaPencilAlt ,FaPlusSquare,FaPlusCircle} from 'react-icons/fa';
import {TbDotsVertical} from 'react-icons/tb'
import {MdDone,MdClose} from 'react-icons/md'
import MyInput from '../../Helpers/MyInput';

const TrainingExercise = ({needToAdd,setEx}) => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[1]);
    const [addPanel, setAddPanel] = useState('');
    const [currentMuscleGroupId, setCurrentMuscleGroupId] = useState(-1);
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);
    const [currentExerciseName, setCurrentExerciseName] = useState('');
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showAddOptions, setShowAddOptions] = useState(false);
    const [showRedakt, setShowRedakt] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isBase, setIsBase] = useState(true);
    const [mGroups,setMGroups] = useState([false,false,false,false,false,false,false,false,false,false,false,false,false, false]);
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
        //setMuscleGroup(id);
        if(currentMuscleGroupId === -1){
          setCurrentExerciseId(-1);
        }
    }
    function setExercise(id){
        playEffects(null);
        setCurrentExerciseId(currentExerciseId == id ? -1 : id);
    }
    function onClose(){
        playEffects(null);
        setAddPanel('');
        setMGroups([false,false,false,false,false,false,false,false,false,false,false,false,false,false]);
        setName('');
        setDescription('');
        setIsBase(true);
    }
    function onAdd() {
  if (name.length < 3) {
    setShowPopUpPanel(
      langIndex === 0
        ? 'Введите название упражнения, не менее 3 символов'
        : 'Set exercise name, at least 3 characters',
      2000,
      false
    );
    return;
  }

  // ✅ Ensure muscle group is selected
  if (currentMuscleGroupId < 0 || currentMuscleGroupId > 13) {
    setShowPopUpPanel(
      langIndex === 0
        ? 'Выберите группу мышц для упражнения'
        : 'Please select a muscle group for the exercise',
      2000,
      false
    );
    return;
  }
  const addMgGroups = [];
  for (let index = 0; index < mGroups.length; index++) {
     if(mGroups[index]) addMgGroups.push(index);
  }
  playEffects(null);
  const baseName = capitalizeName(name);
  const baseDesc = description.length > 3 ? capitalizeName(description) : '';

  addExercise(
  currentMuscleGroupId,
  addMgGroups,
  [langIndex === 0 ? baseName : 'Custom exercise', langIndex === 1 ? baseName : 'Своё упражнение'],
  [langIndex === 0 ? (baseDesc || 'Своё упражнение') : 'Custom exercise', langIndex === 1 ? (baseDesc || 'Custom exercise') : 'Своё упражнение'],
  isBase
);
  onClose();
}
    function onRedaktStart() {
  const exercise = AppData.exercises[currentExerciseId]; // ✅ Direct access
  if (exercise) {
    setName(exercise.name[langIndex]);
    const addMgGroups = [false,false,false,false,false,false,false,false,false,false,false,false,false,false];
    if (exercise.addMgIds.length > 0) {
       exercise.addMgIds.forEach(element => {
         addMgGroups[element] = true;
      });
    }
    setMGroups(addMgGroups);
    setDescription(exercise.description[langIndex]);
    setCurrentMuscleGroupId(exercise.mgId); // ✅ fix: was setMuscleGroupId (not defined)
    setIsBase(exercise.isBase);
    setShowRedakt(true);
  } else {
    setShowPopUpPanel(
      langIndex === 0 
        ? 'Упражнение не найдено' 
        : 'Exercise not found',
      2000,
      false
    );
  }
}
    function onRedakt(){
      playEffects(null);
      const addMgGroups = [];
      for (let index = 0; index < mGroups.length; index++) {
       if(mGroups[index]) addMgGroups.push(index);
      }
      const exercise = AppData.exercises[currentExerciseId];
      const updatedName = [...exercise.name];
      updatedName[langIndex] = capitalizeName(name);

      const updatedDesc = [...exercise.description];
     if (description.length > 3) {
       updatedDesc[langIndex] = capitalizeName(description);
     } else {
       updatedDesc[langIndex] = langIndex === 0 ? 'Своё упражнение' : 'Custom exercise';
     }

  updateExercise(
  currentExerciseId,
  currentMuscleGroupId,
  addMgGroups,
  updatedName,
  updatedDesc,
  isBase
);
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
    {Object.keys(MuscleIcon.muscleIconsSrc[0]).map((keyStr) => {
      const key = Number(keyStr); // ensure numeric key
      return (
        <div key={key} style={styles(theme).panel}>
          <div
            style={styles(theme, currentMuscleGroupId === key, false).groupPanel}
            onClick={() => setMuscleGroup(prev => prev === key ? -1 : key)}
          >
            {currentMuscleGroupId === key ? (
              <IoIosArrowUp style={styles(theme).icon} />
            ) : (
              <IoIosArrowDown style={styles(theme).icon} />
            )}
            {MuscleIcon.get(key, langIndex, theme)}
          </div>

          {currentMuscleGroupId === key ? (
            <div style={styles(theme).panel}>
              {Object.entries(AppData.exercises)
              .filter(([id, ex]) => ex.mgId === key && ex.show) // <- добавили проверку
              .sort(([idA], [idB]) => Number(idA) - Number(idB)) // сортируем по id до map
              .map(([idStr, exercise]) => {
                const exId = Number(idStr);
                  return (
                    <div key={exId} style={styles(theme).panel}>
                      <div
                        style={{
                          ...styles(theme, false, currentExerciseId === exId).exercisePanel,
                          width: '100%',
                          flexDirection: 'row'
                        }}
                        onClick={() => setExercise(prev => prev === exId ? -1 : exId)}
                      >
                        {currentExerciseId === exId ? (
                          <IoIosArrowUp
                            style={{
                              ...styles(theme).icon,
                              marginLeft: '5%',
                              width: '10px',
                              marginTop: '7px'
                            }}
                          />
                        ) : (
                          <IoIosArrowDown
                            style={{
                              ...styles(theme).icon,
                              marginLeft: '7%',
                              width: '10px',
                              marginTop: '7px'
                            }}
                          />
                        )}
                        <p style={{ ...styles(theme, false, false, fSize).text, marginLeft: '6px' }}>
                          {exercise.name[langIndex]}
                        </p>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginLeft: 'auto',
                            justifyContent: 'center'
                          }}
                        >
                          <p
                            style={{
                              ...styles(theme, false, false, fSize).subtext,
                              marginRight: '5px',
                              color: exercise.isBase
                                ? Colors.get('trainingBaseFont', theme)
                                : Colors.get('trainingIsolatedFont', theme)
                            }}
                          >
                            {exercise.isBase
                              ? langIndex === 0 ? 'Базовое' : 'Base'
                              : langIndex === 0 ? 'Изолированное' : 'Isolated'}
                          </p>
                          {needToAdd && (
                            <FaPlusCircle
                              onClick={(e) => {
                                e.stopPropagation();
                                setEx(exId);
                              }}
                              style={{ ...styles(theme).icon, fontSize: '20px', marginRight: '35px' }}
                            />
                          )}
                        </div>
                      </div>

                      {currentExerciseId === exId ? (
                        <div
                          style={{
                            ...styles(theme).panel,
                            flexDirection: 'row',
                            marginLeft: '6%',
                            width: '86%'
                          }}
                        >
                          <p style={styles(theme, false, false, fSize).subtext}>
                            {exercise.description[langIndex]}
                          </p>
                          
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              marginLeft: 'auto',
                              justifyContent: 'center'
                            }}
                          >
                            {showAddOptions && (
                              <FaPencilAlt
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentExerciseName(exercise.name[langIndex]);
                                  onRedaktStart();
                                }}
                                style={{ ...styles(theme).icon, fontSize: '18px' }}
                              />
                            )}
                            {showAddOptions && (
                              <FaTrash
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentExerciseName(exercise.name[langIndex]);
                                  setShowConfirmRemove(true);
                                }}
                                style={{ ...styles(theme).icon, fontSize: '18px' }}
                              />
                            )}
                            <TbDotsVertical
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddOptions(!showAddOptions);
                              }}
                              style={{ ...styles(theme).icon, fontSize: '18px' }}
                            />
                          </div>
                          
                        </div>
                      ) : null}
                    
                    </div>
                    
                  );
                })
                .sort((a, b) => a.key - b.key) // optional: sort by ID
              }

              <div
                style={{
                  ...styles(theme).exercisePanel,
                  width: '98%',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaPlusSquare
                  onClick={() => {
                    playEffects(null);
                    setAddPanel('AddExercisePanel');
                  }}
                  style={{ ...styles(theme).icon, fontSize: '24px' }}
                />
              </div>
            </div>
          ) : null}
        </div>
      );
    })}

    <div style={{ height: '10vh' }}>
      <p style={styles(theme, false, false, fSize).text}>{'_'}</p>
    </div>

    {/* Add Exercise Panel */}
    {addPanel === 'AddExercisePanel' && (
      <div style={styles(theme).addContainer}>
        <div style={{...styles(theme).additionalPanel,height:'70%'}}>
          <p style={styles(theme, false, false, fSize).text}>
            {langIndex === 0 ? 'Добавь свое упражнение' : 'Add your exercise'}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: Colors.get('background', theme),
              height: '85%',
              width: '100%',
              alignItems: 'center'
            }}
          >
            <MyInput
              maxL={40}
              w="80%"
              h="10%"
              theme={theme}
              onChange={(value) => setName(value)}
              placeHolder={langIndex === 0 ? 'Название упражнения' : 'Exercise name'}
            />
            <MyInput
              maxL={300}
              w="80%"
              h="20%"
              theme={theme}
              onChange={(value) => setDescription(value)}
              placeHolder={langIndex === 0 ? 'Описание упражнения' : 'Exercise description'}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '50%',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%'
              }}
            >
              <p style={styles(theme, false, false, fSize).text}>
                {langIndex === 0 ? 'Базовое упражнение' : 'Base exercise'}
              </p>
              {isBase ? (
                <FaRegCheckSquare
                  onClick={() => setIsBase(false)}
                  style={{ ...styles(theme).icon, fontSize: '24px' }}
                />
              ) : (
                <FaRegSquare
                  onClick={() => setIsBase(true)}
                  style={{ ...styles(theme).icon, fontSize: '24px' }}
                />
              )}
            </div>
            <div
              style={{...styles(theme).text,
                display: 'flex',
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%',
                borderBottom: `1px solid ${Colors.get('border', theme)}`,
              }}
            >
              {langIndex === 0 ? 'Основная мышца:' : 'Main muscle:'}
              {MuscleIcon.get(currentMuscleGroupId, langIndex, theme, false,'40%')}
            </div>

            <div
              style={ styles(theme, false, false, fSize).text} >{langIndex === 0 ? 'Дополнительные мышцы' : 'Additional muscles'}</div>
               
              <div  
               style={{display:'grid' ,alignContent:'center',justifyContent:'center', gridTemplateColumns: '1fr 1fr',
               gridAutoRows: '2fr', gap: '2px',height:'33%', width: '90%', marginTop: '10px', borderBottom: `1px solid ${Colors.get('border', theme)}`}} >
               
               {MuscleIcon.names[langIndex].map((name,index)=> 
              {
                if (currentMuscleGroupId == index) return null;

               return ( <div key={index} onClick={()=>{setMGroups(prev => prev.map((val, i) => i === index ? !val : val))}}
                 style={{... styles(theme, false, false, fSize).subtext,width:'90%',border:`1px solid ${mGroups[index] ? Colors.get('medium', theme) : Colors.get('border', theme)}` ,
                borderRadius:'12px',color:mGroups[index] ? Colors.get('medium', theme) : Colors.get('border', theme)}}>
                {name}
              </div>
            )} )}


              </div>

              
          </div>

          {/* Bottom buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '60%',
              justifyContent: 'space-between',
              
            }}
          >
            <MdClose
              onClick={() => onClose()}
              style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
            />
            <MdDone
              onClick={() => onAdd()}
              style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
            />
          </div>
        </div>
      </div>
    )}

    {/* Confirm Remove */}
    {showConfirmRemove && (
      <div
        style={{
          position: 'fixed',
          top: '50vh',
          left: '7.5vw',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '85vw',
          height: '40vw',
          marginTop: '5px',
          borderRadius: '24px',
          border: `1px solid ${Colors.get('border', theme)}`,
          backgroundColor: Colors.get('background', theme),
          zIndex: '7000'
        }}
      >
        <p
          style={{
            ...styles(theme, false, false, fSize).text,
            padding: '20px',
            marginLeft: '10%',
            marginRight: '5%'
          }}
        >
          {langIndex === 0
            ? `Вы уверены, что хотите удалить упражнение? ${currentExerciseName}`
            : `Are you sure you want to delete the exercise? ${currentExerciseName}`}
        </p>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '60%',
            justifyContent: 'space-between'
          }}
        >
          <MdClose
            onClick={() => setShowConfirmRemove(false)}
            style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
          />
          <MdDone
            onClick={() => onRemove()}
            style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
          />
        </div>
      </div>
    )}

    {/* Edit Panel */}
     {showRedakt && (
      <div style={styles(theme).addContainer}>
        <div style={{...styles(theme).additionalPanel,height:'70%'}}>
          <p style={styles(theme, false, false, fSize).text}>
            {langIndex === 0 ? 'Добавь свое упражнение' : 'Add your exercise'}
          </p>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: Colors.get('background', theme),
              height: '85%',
              width: '100%',
              alignItems: 'center'
            }}
          >
            <MyInput
              maxL={40}
              w="80%"
              h="10%"
              value={name}
              theme={theme}
              onChange={(value) => setName(value)}
              placeHolder={langIndex === 0 ? 'Название упражнения' : 'Exercise name'}
            />
            <MyInput
              maxL={300}
              w="80%"
              h="20%"
              value={description}
              theme={theme}
              onChange={(value) => setDescription(value)}
              placeHolder={langIndex === 0 ? 'Описание упражнения' : 'Exercise description'}
            />
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: '50%',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%'
              }}
            >
              <p style={styles(theme, false, false, fSize).text}>
                {langIndex === 0 ? 'Базовое упражнение' : 'Base exercise'}
              </p>
              {isBase ? (
                <FaRegCheckSquare
                  onClick={() => setIsBase(false)}
                  style={{ ...styles(theme).icon, fontSize: '24px' }}
                />
              ) : (
                <FaRegSquare
                  onClick={() => setIsBase(true)}
                  style={{ ...styles(theme).icon, fontSize: '24px' }}
                />
              )}
            </div>
            <div
              style={{...styles(theme).text,
                display: 'flex',
                flexDirection: 'row',
                width: '90%',
                justifyContent: 'space-around',
                alignItems: 'center',
                marginTop: '5%',
                borderBottom: `1px solid ${Colors.get('border', theme)}`,
              }}
            >
              {langIndex === 0 ? 'Основная мышца:' : 'Main muscle:'}
              {MuscleIcon.get(currentMuscleGroupId, langIndex, theme, false,'40%')}
            </div>

            <div
              style={ styles(theme, false, false, fSize).text} >{langIndex === 0 ? 'Дополнительные мышцы' : 'Additional muscles'}</div>
               
              <div  
               style={{display:'grid' ,alignContent:'center',justifyContent:'center', gridTemplateColumns: '1fr 1fr',
                gridAutoRows: '2fr', gap: '2px',height:'33%', width: '90%', marginTop: '10px', borderBottom: `1px solid ${Colors.get('border', theme)}`}} >
               
               {MuscleIcon.names[langIndex].map((name,index)=> 
              {
                if (currentMuscleGroupId == index) return null;

               return ( <div key={index} onClick={()=>{setMGroups(prev => prev.map((val, i) => i === index ? !val : val))}}
                 style={{... styles(theme, false, false, fSize).subtext,width:'90%',border:`1px solid ${mGroups[index] ? Colors.get('medium', theme) : Colors.get('border', theme)}` ,
                borderRadius:'12px',color:mGroups[index] ? Colors.get('medium', theme) : Colors.get('border', theme)}}>
                {name}
              </div>
            )} )}


              </div>

              
          </div>

          {/* Bottom buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              width: '60%',
              justifyContent: 'space-between'
            }}
          >
            <MdClose
              onClick={() => setShowRedakt(false)}
              style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
            />
            <MdDone
              onClick={() => onRedakt()}
              style={{ ...styles(theme).icon, fontSize: '32px', marginBottom: '8px' }}
            />
          </div>
        </div>
      </div>
    )}
  </div>
);
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
const capitalizeName = (str) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};