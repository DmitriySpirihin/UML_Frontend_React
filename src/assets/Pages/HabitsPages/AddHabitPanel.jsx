import React, { useState, useEffect,useRef } from 'react';
import { setCurrentBottomBtn, setKeyboardVisible } from '../../StaticClasses/HabitsBus';
import { allHabits } from '../../Classes/Habit.js';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { addHabitFn } from '../../Pages/HabitsPages/HabitsMain';
import { setShowPopUpPanel, setAddPanel,addPanel$ ,theme$,lang$} from '../../StaticClasses/HabitsBus';
import {FaBackspace,FaPlusSquare,FaSearchPlus,FaSearch,FaRegWindowClose,FaListAlt,FaFolderOpen} from 'react-icons/fa'
import {MdFiberNew,MdDone} from 'react-icons/md'
import Cropper from 'react-easy-crop';
import { saveCustomIcon } from '../../StaticClasses/SaveHelper';

const clickMiniSound = new Audio('Audio/Click_Mini.wav');
const clickSound = new Audio('Audio/Click_Add.wav');
const closeSound = new Audio('Audio/Transition.wav');

const icons = {
  'Drink water': 'Art/HabitsIcons/Drink water.png',
  'Eat a serving of fruits,vegetables': 'Art/HabitsIcons/Eat a serving of fruits,vegetables.png',
  'Meditation': 'Art/HabitsIcons/Meditation.png',
  'Morning glass of water': 'Art/HabitsIcons/Morning glass of water.png',
  'Morning stretch': 'Art/HabitsIcons/Morning stretch.png',
  'Review expenses and budget': 'Art/HabitsIcons/Review expenses and budget.png',
  'Review vocabulary': 'Art/HabitsIcons/Review vocabulary.png',
  'Run 3 km': 'Art/HabitsIcons/Run 3 km.png',
  'Take vitamins': 'Art/HabitsIcons/Take vitamins.png',
  'Yoga 15 minutes': 'Art/HabitsIcons/Yoga 15 minutes.png',
  'Brain exercise': 'Art/HabitsIcons/brain.png'
};

const getAllHabits = () => {
  return allHabits.concat(
    (AppData.CustomHabits || []).filter(ch => !allHabits.some(d => d.id === ch.id))
  );
}

const AddHabitPanel = () => {
    // Theme and language state
    const [theme, setTheme] = useState(theme$.value);
    const [lang, setLang] = useState(lang$.value);
    const [keyboardVisible, setKeyboardVisible] = useState(false);
    const [viewportHeight, setViewportHeight] = useState(window.visualViewport?.height || window.innerHeight);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const [langIndex,setLangIndex] = useState(AppData.prefs[0]);
    const [showCreatePanel,setshowCreatePanel] = useState(false);
    const [addPanel,setAddPanelState] = useState('');
    
    // Habit data state
    const [habitName, setHabitName] = useState('');
    const [habitCategory, setHabitCategory] = useState('');
    const [habitDescription, setHabitDescription] = useState('');
    const [habitIcon, setHabitIcon] = useState('Art/HabitsIcons/Default.png');
    const [habitId, setHabitId] = useState(-1);
    
    // UI state
    const [habitList, setHabitList] = useState(getAllHabits());
    const [selectedHabit, setSelectedHabit] = useState(null);
    const [selectIconPanel, setSelectIconPanel] = useState(false);
    const [opacity, setOpacity] = useState(0);
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
    React.useEffect(() => {
    const handleResize = () => {
      const newViewportHeight = window.visualViewport?.height || window.innerHeight;
      const keyboardVisible = newViewportHeight < viewportHeight;
      
      if (keyboardVisible !== isKeyboardVisible) {
        setIsKeyboardVisible(keyboardVisible);
        setKeyboardVisible(keyboardVisible);
      }
      
      setViewportHeight(newViewportHeight);
      
      // Scroll to the focused input when keyboard appears
      if (document.activeElement?.tagName === 'INPUT' || 
          document.activeElement?.tagName === 'TEXTAREA') {
        document.activeElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    };

    // Add event listeners
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    const subscription = theme$.subscribe(setTheme);
    const langSubscription = lang$.subscribe(setLang);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
      subscription.unsubscribe();
      langSubscription.unsubscribe();
    };
  }, [viewportHeight]);
    useEffect(() => {
            const themeSubscription = theme$.subscribe(setTheme);
            const langSubscription = lang$.subscribe((lang) => {
                setLangIndex(lang === 'ru' ? 0 : 1);
            });
            return () => {
                themeSubscription.unsubscribe();
                langSubscription.unsubscribe();
            };
        }, []);
    useEffect(() => {
        setHabitList(getAllHabits());
    }, []);
    useEffect(() => {
      const subscription = addPanel$.subscribe(setAddPanelState);
      if(addPanel === 'AddHabitPanel')setTimeout(() => setOpacity(1),400);
      else setOpacity(0);
      return () => {
        subscription.unsubscribe();
      };
    }, []);
    const handleInputValue = (value, index) => {
      if(value.length > 0){
        if (index === 0) setHabitName(value[0].toUpperCase() + value.toLowerCase().slice(1));
        else if (index === 1) setHabitCategory(value[0].toUpperCase() + value.toLowerCase().slice(1));
        else if (index === 2) setHabitDescription(value[0].toUpperCase() + value.toLowerCase().slice(1));}
    };
    
    useEffect(() => {
      if (habitName.length > 3 && habitCategory.length > 3) {
        setAddButtonEnabled(true);
        setAddButtonContext({
          text: langIndex === 0 ? 'создать и добавить' : 'create and add',
          onClick: () => createHabit(habitName, habitCategory, habitDescription, habitIcon)
        });
      } else {
        setAddButtonEnabled(false);
      }
    }, [habitName, habitCategory, habitDescription, habitIcon, langIndex]);
    
    return (
        <div style={{...styles(theme).container,
          transform: addPanel === 'AddHabitPanel' ? 'translateX(0)' : 'translateX(-100%)',
          backgroundColor: opacity === 1 ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
          transition: 'transform 0.3s ease-in-out, background-color 0.1s ease-in-out',
        }}>
         {!showCreatePanel && (<div style={styles(theme, keyboardVisible).panel}>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'добавь привычку' : 'add habit'}</div>
           <div style={{...styles(theme).simplePanel,height:"47vh"}}>
            <div style={{display:'flex',flexDirection:'row'}}>
              <FaSearch style={{color:Colors.get("mainText",theme),width:'5vw',marginTop:'10px',marginLeft:'10px'}}/>
              <input type="text"  style={styles(theme).input}
              onChange={(e) => searchHabitsList(e.target.value,habitList, setHabitList) }/>
            </div>
            <div style={styles(theme).scrollView}>
              {habitList.map((habit) => (
                <li key={habit.id} style={{...styles(theme).text,borderRadius:"24px",backgroundColor: habit.id === selectedHabit ? Colors.get('highlitedPanel', theme) : 'transparent'}}
                onClick={() => {setSelectedHabit(habit.id);setHabitId(habit.id);setAddButtonEnabled(true);playEffects(clickMiniSound,20);
                setAddButtonContext({text: langIndex === 0 ? 'Добавить' : 'Add',onClick: () => addHabit(habit.id,habit.name[langIndex],false)})}}>
                  <p style={styles(theme).text}>{habit.name[langIndex]}</p>
                </li>
              ))}
           </div>
           </div>
           {/* buttons */}
           <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignContent:'center'}}>
             <div style={{...styles(theme).button}} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);playEffects(closeSound,20);}}><FaBackspace style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {setshowCreatePanel(true);setAddButtonEnabled(false);}}><MdFiberNew style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {if(addButtonEnabled){addButtonContext.onClick();playEffects(clickSound,50);}}}><FaPlusSquare style={{...styles(theme).miniIcon,color: addButtonEnabled ?  Colors.get('mainText', theme) : Colors.get('subText', theme)}}/></div>
           </div>
           </div>)}
           {/* creation panel */}
           {showCreatePanel && (<div style={styles(theme, keyboardVisible).panel}>
           <div style={styles(theme).headerText}>{langIndex === 0 ? 'или создай свою' : 'or create your own'}</div>
           <div style={{...styles(theme).simplePanel,height:'47vh',justifyContent:'center'}}>
            <textarea maxLength={25} placeholder={langIndex === 0 ? 'имя' : 'name'} style={styles(theme).input}
            onChange={(e) => handleInputValue(e.target.value,0)}/>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <textarea  maxLength={25} placeholder={habitCategory === '' ? langIndex === 0 ? 'категория' : 'category' : habitCategory} style={{...styles(theme).input,width:"48%"}}
              onChange={(e) => handleInputValue(e.target.value,1)}/>
              <select style={{...styles(theme).input,width:"48%"}} onChange={(e) => handleInputValue(e.target.value,1)}>
                {renderCategoryOptions(theme, langIndex)}
              </select>
            </div>
            <textarea maxLength={60} placeholder={langIndex === 0 ? 'описание(опционально)' : 'description(optional)'} style={{...styles(theme).input,height:'20%'}}
            onChange={(e) => handleInputValue(e.target.value,2)}/>
            <div style={styles(theme).headerText}>{langIndex === 0 ? 'выбери иконку(опционально)' : 'choose icon(optional)'}</div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <div style={{width: '80%',marginLeft:'30px',padding:'5px'}}>
               <div style={styles(theme).button} onClick={() => setSelectIconPanel(selectIconPanel ? false : true)}>
                {!selectIconPanel && (<FaListAlt style={styles(theme).miniIcon}/>)}{selectIconPanel && (<FaRegWindowClose style={styles(theme).miniIcon}/>)}
               </div>
               <div
                 style={styles(theme).button}
                 onClick={() => fileInputRef.current && fileInputRef.current.click()}
               >
                 <FaFolderOpen style={styles(theme).miniIcon}/>
               </div>
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
                <img src={habitIcon} alt="Art/HabitsIcons/Default.png" style={{width:"15vw",margin:'40px'}}/>
              </div>
            </div>
           </div>
           <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignContent:'center'}}>
             <div style={{...styles(theme).button}} onClick={() => {setAddPanel('');setCurrentBottomBtn(0);playEffects(closeSound,20);}}><FaBackspace style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {setshowCreatePanel(false);setAddButtonEnabled(false);setSelectedHabit(null);}}><FaSearchPlus style={styles(theme).miniIcon}/></div>
             <div style={{...styles(theme).button}} onClick={() => {if(addButtonEnabled){addButtonContext.onClick();playEffects(clickSound,50);}}}><FaPlusSquare style={{...styles(theme).miniIcon,color: addButtonEnabled ?  Colors.get('mainText', theme) : Colors.get('subText', theme)}}/></div>
           </div>
         </div>)}
         {selectIconPanel && (
           <div style={styles(theme).selectPanel}>
             {Object.entries(icons).map(([key,value], index) => (
              <div key={key} style={styles(theme).selectIcon}>
                <img src={value} alt="Art/HabitsIcons/Default.png" style={{width:"8vw",padding:"30px"}}
                onClick={() => {
                  setHabitIcon(value);
                  playEffects(clickSound,50);
                  setSelectIconPanel(false);
                  if(habitName.length > 3 && habitCategory.length > 3){
                    setAddButtonEnabled(true);
                    setAddButtonContext({
                      text: langIndex === 0 ? 'создать и добавить' : 'create and add',
                      onClick: () => {createHabit(habitName,habitCategory,habitDescription,value);playEffects(clickSound,50);}
                    });
                  }
                }}/>
              </div>
             ))}
           </div>
         )}
         {imageSrc && (
           <div style={{position:"absolute",width:"85vw",height:"85vw",top:"39%",left:"50%",transform:'translate(-50%,-50%)',backgroundColor:Colors.get('simplePanel', theme),zIndex:"1000",borderRadius:"24px",border: `1px solid ${Colors.get('border', theme)}`,overflow:'hidden', display:'flex', flexDirection:'column'}}>
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
             <div style={{display:'flex', gap: 8, padding: 12, justifyContent:'space-between',paddingRight:'10vw',paddingLeft:'10vw'}}>
               <div
                 style={{...styles(theme).button, padding:'8px 12px'}}
                 onClick={() => {
                   playEffects(null,20);
                   setImageSrc(null);
                   setCrop({x:0,y:0});
                   setZoom(1);
                   setCropPixels(null);
                 }}
               >
                 <FaRegWindowClose style={styles(theme).miniIcon}/>
               </div>
               <div
                 style={{...styles(theme).button, padding:'8px 12px'}}
                 onClick={async () => {
                   if (!imageSrc || !cropPixels) return;
                   playEffects(null,20);
                   const img = new Image();
                   img.crossOrigin = 'anonymous';
                   img.src = imageSrc;
                   await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
                   // Create a canvas for the cropped image
                   const sourceCanvas = document.createElement('canvas');
                   sourceCanvas.width = cropPixels.width;
                   sourceCanvas.height = cropPixels.height;
                   const sourceCtx = sourceCanvas.getContext('2d');
                   
                   // Draw the cropped image onto the source canvas
                   sourceCtx.drawImage(
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
                   
                   // Create a new canvas for the resized image (128x128)
                   const targetCanvas = document.createElement('canvas');
                   targetCanvas.width = 128;
                   targetCanvas.height = 128;
                   const targetCtx = targetCanvas.getContext('2d');
                   
                   // Draw the cropped image onto the target canvas with resizing
                   targetCtx.drawImage(
                     sourceCanvas,
                     0,
                     0,
                     cropPixels.width,
                     cropPixels.height,
                     0,
                     0,
                     128,
                     128
                   );
                   
                   // Convert to data URL with compression
                   const dataUrl = targetCanvas.toDataURL('image/png', 0.2);
                  if (!dataUrl) return;
                  const url = dataUrl;
                  // Save the icon to cloud and db and get its key
                  const iconKey = await saveCustomIcon(dataUrl);
                  setHabitIcon(url);
                  if(habitName.length > 3 && habitCategory.length > 3 && iconKey) {
                    setAddButtonEnabled(true);
                    setAddButtonContext({
                      text: langIndex === 0 ? 'создать и добавить' : 'create and add',
                      onClick: () => {createHabit(habitName, habitCategory, habitDescription, iconKey);playEffects(clickSound,50);}
                    });
                  }
                  setImageSrc(null);
                  setCrop({x:0,y:0});
                  setZoom(1);
                  setCropPixels(null);
                 }}
               >
                 <MdDone style={styles(theme).miniIcon}/>
               </div>
             </div>
           </div>
         )}
        </div>
        
    )
    
}
export default AddHabitPanel;

// Helper function to render category options
const renderCategoryOptions = (theme, langIndex) => {
    const categories = Array.from(new Set(allHabits.map(h => h.category[langIndex])));
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
}

const createHabit =  (name,category,description,icon) => {
    const currentAll = getAllHabits();
    const maxId = currentAll.length > 0 ? Math.max(...currentAll.map(h => h.id)) : 0;
    const habitId = maxId + 1;
    if(!AppData.IsCustomHabitExists(habitId)){
      
      AppData.AddCustomHabit(name,category,description,icon,habitId);
      setTimeout(() => {addHabit(habitId,name,true);}, 100);
    }else{
      setShowPopUpPanel(AppData.prefs[0] === 0 ? 'привычка с таким названием уже существует' : 'habit with this name already exists',2500);
    }
}

const searchHabitsList = (name, habitList, setHabitList) => {
    if(name.length > 0){
      const newList = getAllHabits().filter((habit) => {
        return habit.name[AppData.prefs[0]].toLowerCase().startsWith(name.toLowerCase());
      });
      setHabitList(newList);
    }else{
        const allNow = getAllHabits();
        if(habitList.length != allNow.length){
            setHabitList(allNow);
        }
    }
}


const styles = (theme, keyboardVisible) => ({
  // Container styles
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
    borderRadius:"24px",
    overflow: "hidden",
    boxSizing:'border-box',
    overflowY: "scroll",
    border: `1px solid ${Colors.get('border', theme)}`,
    margin: "5px",
    backgroundColor:Colors.get('simplePanel', theme),
    boxShadow: `4px 4px 6px ${Colors.get('shadow', theme)}`,
    width:"85vw",
    height: keyboardVisible ? "90vh" : "60vh"
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
    height:'5vw',
    borderRadius:'12px',
    border:`1px solid ${Colors.get('border', theme)}`,
    margin:'12px',
    fontSize:'14px',
    fontFamily:'Segoe UI',
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
    height:'6vw',
    borderRadius:'12px',
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
    top:'40%',
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
    display:'flex',
    alignContent:"center",
    justifyContent:"center",
    width:'10vw',
    borderBottom:`1px solid ${Colors.get('border', theme)}`,
    marginTop:'12px',
    fontSize:'12px',
  },
  miniIcon: {
    width: "6vw",
    height: "6vw",
    padding: "5px",
    marginTop: "10px",
    color: Colors.get('mainText', theme),
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


    