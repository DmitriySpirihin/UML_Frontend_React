import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
//import BreathingTimer from './BreathingTimer'
import {breathingProtocols,breathingLog} from '../../StaticClasses/RecoveryLogHelper'

const BreathingMain = () => {
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
      {breathingProtocols.map((protocol,index)=>{
        const cardColor = 'recoveryCard' + index;
        return (
          <div key={index} style={{marginTop:'10px',border:`3px solid ${Colors.get(cardColor, theme)}`,width:'95%', borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingBottom:'10px'}}>
          <p style={{...styles(theme,fSize).mainText,color:Colors.get(cardColor, theme),fontWeight:'bold'}}>{protocol.level[langIndex] + ' / ' + protocol.protocols.length}</p>
          <div  style={{width:'98%',display: "grid" ,gridTemplateColumns: '1fr 1fr',alignItems:'center',justifyItems:'center'}}>
           {protocol.protocols.map((protocol,ind)=>{
             return (
                <MenuCard key={ind} text={protocol.name[langIndex]} theme={theme} color={cardColor}  lang={langIndex} fontSize={fSize} onClick={() => {}} />   
             )
           })}
          </div>
       </div>
        )
      })}
    </div>
    
  )
}

export default BreathingMain

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

function MenuCard({text, color,theme,lang, onClick,fontSize} ){
    
    const _style = {
        display:'flex',
        flexDirection:'row',
        alignItems: "center",
        justifyContent: "center",
        height: "15vh",
        width:'42vw',
        borderRadius: "12px",
        backgroundColor: Colors.get(color, theme)
    }
    return (
      <div style={_style} onClick={onClick}> 
          <div style={{width:'60%',marginLeft:'10%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
           <p style={{...styles(theme,fontSize).mainText,fontWeight:'bold'}}>{Array.isArray(text) ? text[lang] : text}</p>
          </div>
      </div>   
    )
}