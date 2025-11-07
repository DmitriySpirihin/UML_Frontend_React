import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors, { THEME } from '../../StaticClasses/Colors';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { theme$, lang$, setShowPopUpPanel, setAddHabitPanel } from '../../StaticClasses/HabitsBus';
import Cropper from 'react-easy-crop';
import DefaultIcon from '../../Art/HabitsIcons/Default.png';
import Select from 'react-select';

// Import icons
import drinkWaterIcon from '../../Art/HabitsIcons/Drink water.png';
import eatFruitsIcon from '../../Art/HabitsIcons/Eat a serving of fruits,vegetables.png';
import meditationIcon from '../../Art/HabitsIcons/Meditation.png';
import morningWaterIcon from '../../Art/HabitsIcons/Morning glass of water.png';
import morningStretchIcon from '../../Art/HabitsIcons/Morning stretch.png';
import reviewExpensesIcon from '../../Art/HabitsIcons/Review expenses and budget.png';
import reviewVocabularyIcon from '../../Art/HabitsIcons/Review vocabulary.png';
import runIcon from '../../Art/HabitsIcons/Run 3 km.png';
import vitaminsIcon from '../../Art/HabitsIcons/Take vitamins.png';
import yogaIcon from '../../Art/HabitsIcons/Yoga 15 minutes.png';
import brainExerciseIcon from '../../Art/HabitsIcons/brain.png';

const icons = {
  'Drink water': drinkWaterIcon,
  'Eat a serving of fruits,vegetables': eatFruitsIcon,
  'Meditation': meditationIcon,
  'Morning glass of water': morningWaterIcon,
  'Morning stretch': morningStretchIcon,
  'Review expenses and budget': reviewExpensesIcon,
  'Review vocabulary': reviewVocabularyIcon,
  'Run 3 km': runIcon,
  'Take vitamins': vitaminsIcon,
  'Yoga 15 minutes': yogaIcon,
  'Brain exercise': brainExerciseIcon
};

const getAllHabits = () => {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.Id() === ch.Id()))
  );
}

const AddHabitPanel = () => {
    // Theme and language state
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    
    // Habit data state
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [habitIcon, setHabitIcon] = useState(DefaultIcon);
    const [habitId, setHabitId] = useState(null);
    
    // UI state
    const [habitList, setHabitList] = useState(getAllHabits());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    // Hidden file input to open system dialog without showing input
    const fileInputRef = useRef(null);
    
    // Image cropping state
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [cropPixels, setCropPixels] = useState(null);
    
    // Button state
    const [addButtonEnabled, setAddButtonEnabled] = useState(false);
    const [addButtonContext, setAddButtonContext] = useState({
        text: langIndex === 0 ? 'Добавить' : 'Add',
        onClick: () => addHabit(false)
    });
    useEffect(() => {
        setHabitList(getAllHabits());
    }, []);
    const handleInputValue = (value,index) => {
      if(index === 0) setHabitName(value);
      else if(index === 1) setHabitCategory(value);
      else if(index === 2) setHabitDescription(value);
      if(habitName.length > 3 && habitCategory.length > 3){
        setAddButtonEnabled(true);
        setAddButtonContext({text: langIndex === 0 ? 'создать и добавить' : 'create and add',onClick: () => createHabit(habitName,habitCategory,habitDescription,habitIcon)})
      }
    }
    return (
        <div style={styles(theme).container}>
         <div style={styles(theme).panel}>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'добавь привычку' : 'add habit'}</div>
           <div style={{...styles(theme).simplePanel,height:"35vh"}}>
            <input type="text" placeholder={langIndex === 0 ? 'поиск' : 'search'} style={styles(theme).input}
              onChange={(e) => searchHabitsList(e.target.value,habitList, setHabitList) }/>
            <div style={styles(theme).scrollView}>
              {habitList.map((habit) => (
                <li key={habit.Id()} style={{...styles(theme).text,borderRadius:"24px",backgroundColor: habit.Id() === selectedHabit ? Colors.get('highlitedPanel', theme) : 'transparent'}}
                onClick={() => {setSelectedHabit(habit.Id());setHabitId(habit.Id());setAddButtonEnabled(true);
                setAddButtonContext({text: langIndex === 0 ? 'Добавить' : 'Add',onClick: () => addHabit(habit.Id(),habit.Name()[langIndex],false)})}}>
                  <p style={styles(theme).text}>{habit.Name()[langIndex]}</p>
                </li>
              ))}
           </div>
           </div>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'или создай свою' : 'or create your own'}</div>
           <div style={styles(theme).simplePanel}>
            <input type="text" placeholder={langIndex === 0 ? 'имя' : 'name'} style={styles(theme).input}
            onChange={(e) => handleInputValue(e.target.value,0)}/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <input type="text" placeholder={habitCategory === '' ? langIndex === 0 ? 'категория' : 'category' : habitCategory} style={{...styles(theme).input,width:"48%"}}
              onChange={(e) => handleInputValue(e.target.value,1)}/>
              <select style={{...styles(theme).input,width:"48%"}} onChange={(e) => handleInputValue(e.target.value,1)}>
                {renderCategoryOptions(theme, langIndex)}
              </select>
            </div>
            <input type="text" placeholder={langIndex === 0 ? 'описание(опционально)' : 'description(optional)'} style={styles(theme).input}
            onChange={(e) => handleInputValue(e.target.value,2)}/>
            <div style={styles(theme).headerText}>{langIndex === 0 ? 'выбери иконку(опционально)' : 'choose icon(optional)'}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{width: '100%'}}>
               <button style={styles(theme).button} onClick={() => setSelectIconPanel(selectIconPanel ? false : true)}>{selectIconPanel ? langIndex === 0 ? 'свернуть' : 'collapse' : langIndex === 0 ? 'выбери' : 'select'}</button>
               <button
                 style={styles(theme).button}
                 onClick={() => fileInputRef.current && fileInputRef.current.click()}
               >
                 {langIndex === 0 ? 'из устройства' : 'from device'}
               </button>
               <input
                 ref={fileInputRef}
                 type="file"
                 accept="image/*"
                 style={{ display: 'none' }}
                 onChange={(e) => {
                   const file = e.target.files && e.target.files[0];
                   if (file) {
                     const imgUrl = URL.createObjectURL(file);
                     setImageSrc(imgUrl);
                   }
                 }}
               />
             </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
                <img src={habitIcon} alt="habit icon" style={{width:"10vw",padding:"30px"}}/>
              </div>
            </div>
           </div>
           <div style={{marginTop:"40px"}}>
           <button style={{...styles(theme).button,padding:"10px"}} onClick={() => setAddHabitPanel(false)}>{langIndex === 0 ? 'назад' : 'back'}</button>
           {addButtonEnabled && <button style={{...styles(theme).button,padding:"10px"}} onClick={() => addButtonContext.onClick()}>{addButtonContext.text}</button>}
           </div>
         </div>
         {selectIconPanel && (
           <div style={styles(theme).selectPanel}>
             {Object.entries(icons).map(([key,value], index) => (
              <div key={key} style={styles(theme).selectIcon}>
                <img src={value} alt="habit icon" style={{width:"8vw",padding:"30px"}}
                onClick={() => {
                  setHabitIcon(value);
                  setSelectIconPanel(false);
                  if(habitName.length > 3 && habitCategory.length > 3){
                    setAddButtonEnabled(true);
                    setAddButtonContext({
                      text: langIndex === 0 ? 'создать и добавить' : 'create and add',
                      onClick: () => createHabit(habitName,habitCategory,habitDescription,value)
                    });
                  }
                }}/>
              </div>
             ))}
           </div>
         )}
         {imageSrc && (
           <div style={{position:"absolute",width:"70vw",height:"70vw",top:"50%",left:"50%",transform:'translate(-50%,-50%)',backgroundColor:Colors.get('habitPanel', theme),zIndex:"1000",borderRadius:"24px",boxShadow:Colors.get('shadow', theme), overflow:'hidden', display:'flex', flexDirection:'column'}}>
             <div style={{position:'relative',flex:1}}>
               <Cropper
                 image={imageSrc}
                 crop={crop}
                 zoom={zoom}
                 aspect={1}
                 onCropChange={setCrop}
                 onZoomChange={setZoom}
                 onCropComplete={(_, croppedAreaPixels) => setCropPixels(croppedAreaPixels)}
               />
             </div>
             <div style={{display:'flex', gap: 8, padding: 12, justifyContent:'flex-end'}}>
               <button
                 style={{...styles(theme).button, width:'auto', padding:'8px 12px'}}
                 onClick={() => {
                   setImageSrc(null);
                   setCrop({x:0,y:0});
                   setZoom(1);
                   setCropPixels(null);
                 }}
               >
                 {langIndex === 0 ? 'отмена' : 'cancel'}
               </button>
               <button
                 style={{...styles(theme).button, width:'auto', padding:'8px 12px'}}
                 onClick={async () => {
                   if (!imageSrc || !cropPixels) return;
                   const img = new Image();
                   img.crossOrigin = 'anonymous';
                   img.src = imageSrc;
                   await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
                   const canvas = document.createElement('canvas');
                   canvas.width = cropPixels.width;
                   canvas.height = cropPixels.height;
                   const ctx = canvas.getContext('2d');
                   ctx.drawImage(
                     img,
                     cropPixels.x,
                     cropPixels.y,
                     cropPixels.width,
                     cropPixels.height,
                     0,
                     0,
                     cropPixels.width,
                     cropPixels.height
                   );
                   canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    setHabitIcon(url);
                    if(habitName.length > 3 && habitCategory.length > 3){
                      setAddButtonEnabled(true);
                      setAddButtonContext({
                        text: langIndex === 0 ? 'создать и добавить' : 'create and add',
                        onClick: () => createHabit(habitName,habitCategory,habitDescription,url)
                      });
                    }
                    setImageSrc(null);
                    setCrop({x:0,y:0});
                    setZoom(1);
                    setCropPixels(null);
                  }, 'image/png');
                 }}
               >
                 {langIndex === 0 ? 'сохранить' : 'save'}
               </button>
             </div>
           </div>
         )}
        </div>
        
    )
}
export default AddHabitPanel;

// Helper function to render category options
const renderCategoryOptions = (theme, langIndex) => {
    const categories = Array.from(new Set(allHabits.map(h => h.Category()[langIndex])));
    return categories.map((category) => (
        <option key={category} value={category} style={{...styles(theme).text}}>
            {category}
        </option>
    ));
};


// Removed unused external file and crop handlers; logic moved inside component

const addHabit =  (habitId,habitName,isCustom) => {
    if (typeof addHabitFn !== 'function') {
      console.warn('AddHabitPanel: addHabitFn is not set yet. Ensure HabitsMain is mounted.');
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'экран привычек ещё не готов' : 'habits screen not ready yet', 2000);
      return;
    }
    if(AppData.IsHabitInChoosenList(habitId)) {
       setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка уже в списке' : 'habit already in list',2500);
      return;
    }
    addHabitFn(habitId);
    const message = !isCustom ? AppData.prefs[0] === 0 ? 'привычка добавлена' : 'habit added' : AppData.prefs[0] === 0 ? `привычка: ${habitName} создана и добавлена` : `habit: ${habitName} was created and added`;
    setShowPopUpPanel(message,2500);
    setAddHabitPanel(false);
}

const createHabit =  (name,category,description,icon) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.Id())) : 0;
    const habitId = maxId + 1;
    if(!AppData.IsCustomHabitExists(habitId)){
      
      AppData.AddCustomHabit(name,category,description,icon,habitId);
      setTimeout(() => {addHabit(habitId,name,true);}, 100);
      setAddHabitPanel(false);
    }else{
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка с таким названием уже существует' : 'habit with this name already exists',2500);
    }
}

const searchHabitsList = (name, habitList, setHabitList) => {
    if(name.length > 0){
      const newList = getAllHabits().filter((habit) => {
        return habit.Name()[AppData.prefs[0]].toLowerCase().startsWith(name.toLowerCase());
      });
      setHabitList(newList);
    }else{
        const allNow = getAllHabits();
        if(habitList.length != allNow.length){
            setHabitList(allNow);
        }
    }
}


const styles = (theme) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  panel :
  {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "24px",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width: "85vw",
    height: "90vh",
  },
  text :
  {
    textAlign: "center",
    fontSize: "12px",
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
  headerText :
  {
    textAlign: "center",
    margin:'5px',
    padding:'5px',
    fontSize: "14px",
    color: Colors.get('subText', theme),
  },
  scrollView:
  {
    overflowY: "auto",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
  },
  simplePanel:
  {
    marginLeft:'7.5vw',
    width: "70vw",
    height: "30vh",
    boxSizing:'border-box',
    display:'flex',
    flexDirection:'column',
    alignItems:'stretch',
    background:"rgba(0, 0, 0, 0.1)",
    borderRadius:'24px',
  },
  input:
  {
    width:'65vw',
    height:'22px',
    borderRadius:'24px',
    border:`1px solid ${Colors.get('border', theme)}`,
    margin:'8px',
    fontSize:'14px',
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('inputField', theme),
  },
  simplePanelRow:
  {
    display:'flex',
    flexDirection:'row',
    alignItems:'stretch',
  },
  select:
  {
    width:'20vw',
    height:'2.3vh',
    borderRadius:'24px',
    border:`1px solid ${Colors.get('border', theme)}`,
    marginTop:'12px',
    fontSize:'14px',
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
  },
  selectOption:
  {
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
    fontSize:'8px',
  },
  selectPanel:
  {
    backgroundColor:Colors.get('habitCard', theme),
    borderRadius:'24px',
    border:`1px solid ${Colors.get('border', theme)}`,
    position:'absolute',
    top:'50%',
    left:'50%',
    transform:'translate(-50%,-50%)',
    display:'flex',
    flexWrap:'wrap',
    width:'80vw',
  },
  selectIcon:
  {
     flex:'{0,0,33.33%}',
     width:'20vw',
     boxSizing:'border-box',
     display:'flex',
     alignItems:'center',
     justifyContent:'center',
  },
  button:
  {
    width:'30vw',
    borderRadius:'24px',
    border:`1px solid ${Colors.get('border', theme)}`,
    marginTop:'12px',
    fontSize:'12px',
    color:Colors.get('subText', theme),
    backgroundColor:Colors.get('habitCard', theme),
  }
})


    