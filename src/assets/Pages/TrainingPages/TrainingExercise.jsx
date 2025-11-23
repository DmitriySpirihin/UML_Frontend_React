import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$} from '../../StaticClasses/HabitsBus.js'
import {IoIosArrowDown,IoIosArrowUp} from 'react-icons/io'
import {allExercises,MuscleIcon,addExercise,removeExercise} from '../../Classes/TrainingData.jsx'

const TrainingExercise = () => {
    // states
    let exercises = allExercises;
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [currentMuscleGroupId, setCurrentMuscleGroupId] = useState(-1);
    const [currentExerciseId, setCurrentExerciseId] = useState(-1);
    // subscriptions
    React.useEffect(() => {
        const subscriptionTheme = theme$.subscribe(setthemeState);
        const subscriptionLang = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => {
          subscriptionLang.unsubscribe();
          subscriptionTheme.unsubscribe();
        }
    }, []);  
    function setMuscleGroup(id){
        setCurrentMuscleGroupId(currentMuscleGroupId == id ? -1 : id);
        if(currentMuscleGroupId === -1) setCurrentExerciseId(-1);
    }
    function setExercise(id){
        setCurrentExerciseId(currentExerciseId == id ? -1 : id);
    }
       // render    
       return (
           <div style={styles(theme).container}>
               <p style={styles(theme).subtext}>{langIndex === 0 ? 'Список упражнений' : 'Exercises list'}</p>
               {Object.keys(MuscleIcon.muscleIconsSrc).map((key) => (
                <div key={key} style={styles(theme).panel}>
                   <div key={key} style={styles(theme,currentMuscleGroupId == key,false).groupPanel} onClick={() => setMuscleGroup(key)}>
                       {currentMuscleGroupId == key ? <IoIosArrowUp style={styles(theme).icon}/> : <IoIosArrowDown style={styles(theme).icon}/>}
                       {MuscleIcon.get(key,langIndex,theme)}
                   </div>
                   {currentMuscleGroupId == key ? (
                    <div style={styles(theme).panel}>
                        {exercises.filter((exercise) => exercise.mgId == key).map((exercise) => (
                          <div key={exercise.id} style={styles(theme).panel}>
                            <div style={{...styles(theme,false,currentExerciseId == exercise.id).exercisePanel,width:'98%',flexDirection:'row'}} onClick={() => setExercise(exercise.id)}>
                              {currentExerciseId == exercise.id ? <IoIosArrowUp style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/> : <IoIosArrowDown style={{...styles(theme).icon,marginLeft:'7%',width:'10px',marginTop:'7px'}}/>}
                              <p style={{...styles(theme).text,fontSize:'11px',marginLeft:'5%'}}>{exercise.name[langIndex]}</p>
                              <p style={{...styles(theme).subtext,fontSize:'10px',marginLeft: 'auto',marginRight:'5%',color:exercise.isBase ? Colors.get('trainingBaseFont',theme) : Colors.get('trainingIsolatedFont',theme)}}>{exercise.isBase ? langIndex === 0 ? 'Базовое' : 'Base' : langIndex === 0 ? 'Изолированное' : 'Isolated'}</p>
                            </div>
                            {currentExerciseId == exercise.id ? (
                                    <div style={{...styles(theme).panel,width:'70%'}}>
                                        <p style={styles(theme).subtext}>{exercise.description[langIndex]}</p>
                                    </div>
                                ) : null}
                        </div>))}
                    </div>
                   ) : null}
                </div>
               ))}
               <div style={{height:'10vh'}}><p style={styles(theme).text}>{'_'}</p></div>
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
     position:'absolute',
     flexDirection: "column",
     overflowY:'scroll',
     justifyContent: "start",
     alignItems: "center",
     height: "78vh",
     top:'15vh',
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
  }
})

function playEffects(sound,vibrationDuration ){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0)navigator.vibrate(vibrationDuration);
}