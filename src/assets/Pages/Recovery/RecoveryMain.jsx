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
        colorDark="#4a6032ff" 
        colorLight="#68ff5aff" 
        colorSpecialDark="#2e472aff" 
        colorSpecialLight="#27ff6bff" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryBreath')}}
        Icon = {Recovery_0}
        index={0}
      />   
      <MenuCard 
        text={['Медитация', 'Meditation']} 
      decr={[
        'Медитация способствует внутреннему спокойствию, улучшает концентрацию и эмоциональную устойчивость.',
        'Meditation promotes inner calm, enhances focus, and improves emotional resilience.'
      ]} 
        colorDark="#384068ff" 
        colorLight="#98c8f9ff" 
        colorSpecialDark="#514567ff" 
        colorSpecialLight="#6090feff" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryMeditation')}}
        Icon = {Recovery_1}
        index={1}
      /> 
      <MenuCard 
        text={['Закаливание', 'Cold Exposure']} 
      decr={[
        'Закаливание укрепляет иммунитет, улучшает кровообращение и повышает стрессоустойчивость организма.',
        'Cold exposure strengthens immunity, improves circulation, and enhances the body’s resilience to stress.'
      ]}  
        colorDark="#3a6e6fff" 
        colorLight="#98f9f1ff" 
        colorSpecialDark="#3a5956ff" 
        colorSpecialLight="#2cfbffff" 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('RecoveryCold')}}
        Icon = {Recovery_2}
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
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#c8f445ff", theme,lang, onClick,fontSize,Icon,index} ){
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
        boxShadow:'0px 0px 10px ' + cardColor(theme),
        backgroundColor: cardColor(theme),
    }
    return (
      <div>
        <div style={{display:'flex',flexDirection:'row',width:"15%",height:'15%',backgroundColor:'rgba(0,0,0,0.3)',alignItems:'center',justifyContent:'center',position:'relative',
          top:'20%',left:'83%',borderRadius:'12px',fontSize:'20px',color:Colors.get('mainText', theme)}}>
           {getDaylyFinishedExercises(index)}
        </div>
      <div style={_style} onClick={onClick}> 
        <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
          <div style={{width:'20%',height:'100%',display:'flex'}}>
           <Icon style={{width:'100px',height:'100px',color:Colors.get('mainText', theme)}}/>
          </div>
          <div style={{width:'60%',marginLeft:'10%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
           <p style={{...styles(theme,fontSize).mainText,fontWeight:'bold'}}>{Array.isArray(text) ? text[lang] : text}</p>
           <p style={styles(theme,fontSize).subtext}>{Array.isArray(decr) ? decr[lang] : decr}</p>
          </div>
        </div>
        </div>    
        
      </div>    
    )
}

const getDaylyFinishedExercises = (index) => {
  return '3/7';
}