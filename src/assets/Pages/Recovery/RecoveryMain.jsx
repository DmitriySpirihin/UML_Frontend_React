import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaRegSnowflake,FaSpa} from 'react-icons/fa'
import {BsLungs} from 'react-icons/bs'

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
        colorDark="#4a6032ff" 
        colorLight="#68ff5a6b" 
        colorSpecialDark="#2e472aff" 
        colorSpecialLight="#3ba75d54" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryBreath')}}
        index={0}
      />   
      <MenuCard 
        text={['Медитация', 'Meditation']} 
      decr={[
        'Медитация способствует внутреннему спокойствию, улучшает концентрацию и эмоциональную устойчивость.',
        'Meditation promotes inner calm, enhances focus, and improves emotional resilience.'
      ]} 
        colorDark="#384068ff" 
        colorLight="#98c8f96e" 
        colorSpecialDark="#514567ff" 
        colorSpecialLight="#536ca658" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryMeditation')}}
        index={1}
      /> 
      <MenuCard 
        text={['Закаливание', 'Cold Exposure']} 
      decr={[
        'Закаливание укрепляет иммунитет, улучшает кровообращение и повышает стрессоустойчивость организма.',
        'Cold exposure strengthens immunity, improves circulation, and enhances the body’s resilience to stress.'
      ]}  
        colorDark="#3a6e6fff" 
        colorLight="#98f9f173" 
        colorSpecialDark="#3a5956ff" 
        colorSpecialLight="#38a0a246" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryCold')}}
        index={2}
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
     justifyContent: "flex-start",
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
    marginBottom:'2px'
  },
  subtext :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? '12px' : '14px',
    color: Colors.get('mainText', theme),
    marginBottom:'12px'
  },
    icon:{
       fontSize:'26px',
       color: Colors.get('icons', theme),
    },
    cardText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px"
  },
  text :
  {
    textAlign: "left",
    fontSize: fSize === 0 ? "10px" : "12px",
    color: Colors.get('subText', theme),
    marginLeft: "30px"
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

const getDaylyFinishedExercises = (index) => {
  return '3/7';
}

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#294128ff", colorLight = "#a4f19cff",
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#c8f445ff", theme,lang, onClick,fontSize,index}){
    const cardColor = (theme) => {
        if(theme === 'dark') return colorDark;
        else if(theme === 'specialdark') return colorSpecialDark;
        else if(theme === 'speciallight') return colorSpecialLight;
        return colorLight;
    }
    const getIcon = (index,isBack) => {
        if(index === 0) return <BsLungs style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 1) return <FaSpa style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 2) return <FaRegSnowflake style={isBack ? backIconStyle : iconStyle}/>
    }
    const _style = {
        alignItems: "center",
        justifyContent: "center",
        display:'flex',
        flexDirection:'row',
        height: "13vh",
        borderRadius: "28px",
        margin: "10px",
        marginBottom:'10px',
        backgroundColor: cardColor(theme),
        overflow : 'hidden',
        position: 'relative',
        boxShadow:'3px 3px 2px rgba(0,0,0,0.3)',
        width:'90vw',
    }
    const iconStyle = {
        fontSize:'28px',
        color: Colors.get('mainText', theme),
    }
    const backIconStyle = {
        fontSize:'86px',
        rotate:'-20deg',
        position:'absolute',
        right:'-10px',
        top:'30%',
        color:  Colors.get('svgColor',theme)
    }
    return (
        <div style={_style} onClick={onClick}>
        <div style={{display:'flex',flexDirection:'row',width:"15%",height:'22%',backgroundColor:'rgba(50, 50, 50, 0.25)',alignItems:'center',justifyContent:'center',position:'absolute',
          top:'10%',left:'80%',borderRadius:'12px',fontSize:'16px',color:Colors.get('mainText', theme)}}>
           {getDaylyFinishedExercises(index)}
        </div> 
        {getIcon(index,false)}
        <div style={{width:'70%',height:'100%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
            <h2 style={styles(theme,fontSize).cardText}>{Array.isArray(text) ? text[lang] : text}</h2>
            <p style={styles(theme,fontSize).text}>{Array.isArray(decr) ? decr[lang] : decr}</p>
        </div>
         {getIcon(index,true)}
        </div>    
    )
}