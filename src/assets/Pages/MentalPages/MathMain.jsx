import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaCaretLeft,FaCaretRight} from 'react-icons/fa'
import {MdDone} from 'react-icons/md'
import {quickMathCategories} from './MentalHelper'

const MathMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
    const [currentCategory, setCurrentCategory] = useState(-1);
    const [currentLevel, setCurrentLevel] = useState(-1);
      
    // subscriptions
    useEffect(() => {
          const subscription = theme$.subscribe(setthemeState); 
          const subscription2 = lang$.subscribe((lang) => {
          setLangIndex(lang === 'ru' ? 0 : 1);
          }); 
          const subscription3 = fontSize$.subscribe((fontSize) => {
          setFSize(fontSize);
          });
          return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
          subscription3.unsubscribe();
          }
    }, []); 
   
    return (
    <div style={styles(theme).container}>
      {quickMathCategories.map((category,index) => (
        <MenuCard key={index} category={category} setLevel={setCurrentLevel} color="#233837ff" theme={theme} lang={langIndex} onClick={() => {}} fSize={fSize}/>
      ))}
    </div>
    
  )
}

export default MathMain

const styles = (theme,fSize) =>
({
    container :
   {
     backgroundColor:Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     overflowY:'scroll',
     justifyItems: "center",
     alignItems: "center",
     height: "78vh",
     paddingTop:'5vh',
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  mainText :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '15px' : '17px',
    color: Colors.get('mainText', theme),
  },
  subtext :
  {
    textAlign: "center",
    fontSize: fSize === 0 ? '12px' : '14px',
    color: Colors.get('mainText', theme),
    margin:'2px'
  },
    icon:{
       fontSize:'32px',
       color: Colors.get('mainText', theme),
    },
    simplePanelRow:
    {
      width:'75vw',
      display:'flex',
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-around',
    },
})

function MenuCard({setLevel,category,color,theme,lang, onClick,fSize} ){
    
    const _style = {
        display:'flex',
        flexDirection:'column',
        alignItems: "center",
        justifyContent: "flex-start",
        height: "10vh",
        width:'92vw',
        borderRadius: "12px",
        marginTop:'10px',
        backgroundColor:color
    }
    return (
      <div style={_style} onClick={onClick}> 
       <div style={styles(theme).mainText}>{category.level[lang]}</div> 
       <div style={styles(theme).mainText}>{category.difficulty[lang]}</div> 
       <div style={styles(theme).subtext}>{category.description[lang]}</div> 
       
       <div style={styles(theme).subtext}>{category.operations}</div> 

      </div>   
    )
}