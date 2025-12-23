import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import Recovery_0 from '/src/assets/Svg/Recovery_0'
import Recovery_1 from '/src/assets/Svg/Recovery_1'
import Recovery_2 from '/src/assets/Svg/Recovery_2'

const RecoveryMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
      
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
       
    // render    
    return (
    <div style={styles(theme).container}>
      <MenuCard 
        text={['Дыхательные практики', 'Breathing exercises']} 
        decr={[
            'Дыхательные практики помогают улучшить качество сна и общее самочувствие.',
            'Breathing exercises help improve sleep quality and overall well-being.'
        ]} 
        colorDark="#354821ff" 
        colorLight="#a0f998ff" 
        colorSpecialDark="#35702cff" 
        colorSpecialLight="#98e074ff" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {onPageChange('HabitsMain');playEffects(null);}}
      />     
    </div>
  )
}

export default RecoveryMain

const styles = (theme,fSize) =>
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
  mainText :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '13px' : '15px',
    color: Colors.get('mainText', theme),
    marginLeft: "10px",
    marginBottom:'2px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '11px' : '13px',
    color: Colors.get('subText', theme),
    marginBottom:'12px'
  },
    icon:{
       fontSize:'26px',
       color: Colors.get('icons', theme),
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

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#133612ff", colorLight = "#a4f19cff",
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#c8f445ff", theme,lang, onClick,fontSize}){
    const cardColor = (theme) => {
        if(theme === 'dark') return colorDark;
        else if(theme === 'specialdark') return colorSpecialDark;
        else if(theme === 'speciallight') return colorSpecialLight;
        return colorLight;
    }
    const _style = {
        display:'flex',
        flexDirection:'row',
        alignItems: "center",
        justifyContent: "center",
        height: "16vh",
        width:'90vw',
        borderRadius: "12px",
        margin: "10px",
        boxShadow:'0px 0px 10px ' + cardColor(theme),
        backgroundColor: cardColor(theme),
    }
    return (
      <div style={_style} onClick={onClick}> 
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:'20%',height:'100%',display:'flex'}}>
           <Recovery_0 style={{width:'100px',height:'100px',color:Colors.get('mainText', theme)}}/>
          </div>
          <div style={{width:'70%',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
           <p style={styles(theme,fontSize).mainText}>{Array.isArray(text) ? text[lang] : text}</p>
           <p style={styles(theme,fontSize).subtext}>{Array.isArray(decr) ? decr[lang] : decr}</p>
          </div>
        </div>
      </div>    
    )
}