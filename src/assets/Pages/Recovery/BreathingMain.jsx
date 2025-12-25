import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaCaretLeft,FaCaretRight} from 'react-icons/fa'
import {MdDone} from 'react-icons/md'
import {breathingProtocols,breathingLog,markSessionAsDone} from '../../StaticClasses/RecoveryLogHelper'
import { themeParamsBottomBarBgColor } from '@telegram-apps/sdk'
import BreathingTimer from './BreathingTimer'

const BreathingMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
    const [currentCategory, setCurrentCategory] = useState(-1);
    const [currentProtocol, setCurrentProtocol] = useState(-1);
    const [currentLevel, setCurrentLevel] = useState(-1);
    const [currentSession, setCurrentSession] = useState({});
    const [showTimer, setShowTimer] = useState(false);
      
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
    useEffect(() => {
      const currentLevelData = breathingProtocols[currentCategory]?.protocols[currentProtocol]?.levels[currentLevel] || {};
      setCurrentSession(currentLevelData);
    }, [currentCategory,currentProtocol,currentLevel]);
    // render    
    const doneSession = () => {
      markSessionAsDone(currentCategory,currentProtocol,currentLevel);
    }
    return (
    <div style={styles(theme).container}>
      {breathingProtocols.map((category,index)=>{
        const cardColor = 'recoveryCard' + index;
        return (
          <div key={index} style={{marginTop:'10px',border:`3px solid ${Colors.get(cardColor, theme)}`,width:'95%', borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingBottom:'10px'}}>
          <p onClick={() => {setCurrentCategory(prev => prev === index ? -1 : index)}} style={{...styles(theme,fSize).mainText,color:Colors.get(cardColor, theme),fontWeight:'bold'}}>{category.level[langIndex] + getCardsAmountInProtocol(category)}</p>
          <div  style={{width:'98%',display: "grid" ,gridTemplateColumns: '1fr 1fr',alignItems:'center',justifyItems:'center'}}>
           {currentCategory === index ? category.protocols.map((protocol,ind)=>{
             return (
                <MenuCard key={ind} protocol={protocol} setTimer={setShowTimer} setLevel={setCurrentLevel} theme={theme} color={cardColor}  lang={langIndex} fSize={fSize} onClick={() => {setCurrentProtocol(ind)}} />   
             )
           }) : null}
          </div>
       </div>
        )
      })}
      {/* constructor  */}
      <div style={{marginTop:'10px',border:`3px solid ${Colors.get('recoveryCard', theme)}`,width:'95%', borderRadius:'12px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',paddingBottom:'10px'}}>
          <p onClick={() => {setCurrentCategory(prev => 4 === index ? -1 : 4)}} style={{...styles(theme,fSize).mainText,color:Colors.get('recoveryCard', theme),fontWeight:'bold'}}>{langIndex === 0 ? 'Конструктор' : 'Constructor'}</p>
          
       </div>

       <BreathingTimer show={showTimer} doneSession={doneSession} setShow={setShowTimer} session={currentSession} protocol={breathingProtocols[currentCategory]?.protocols[currentProtocol]|| breathingProtocols[0].protocols[0]} />
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

function MenuCard({protocol,setLevel,setTimer, color,theme,lang, onClick,fSize} ){

  const [currentLevel, setCurrentLevel] = useState(setActualLevel(protocol));
  useEffect(() => {
    setLevel(currentLevel);
  }, [currentLevel]);
    
    const _style = {
        display:'flex',
        flexDirection:'column',
        alignItems: "center",
        justifyContent: "flex-start",
        height: "25vh",
        width:'42vw',
        borderRadius: "12px",
        marginTop:'10px',
        border:protocol.levels[currentLevel].isDone ? '3px solid ' + Colors.get('maxValColor', theme) : '3px solid ' + 'transparent',
        backgroundColor: Colors.get(color, theme)
    }
    return (
      <div style={_style} onClick={onClick}> 
        
        <div style={{...styles(theme,fSize).subtext,fontWeight:'bold',marginTop:'5px'}}>{Array.isArray(protocol.name) ? protocol.name[lang] : protocol.name}</div>
        <div style={{display:'flex',flexDirection:'column',width:'100%',marginTop:'5px',height:'60%',alignItems:'center',justifyContent:'space-around',backgroundColor:'rgba(0,0,0,0.1)'}}>
        <div style={{...styles(theme,fSize).subtext,fontSize: fSize === 0 ? '12px' : '14px',}}>{Array.isArray(protocol.aim) ? protocol.aim[lang] : protocol.aim}</div>
        
         <div style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'center',justifyContent:'flex-start'}}>
           <div style={{display:'flex',flexDirection:'row',width:'100%',alignItems:'center',justifyContent:'space-around'}}>
            <FaCaretLeft onClick={() => {setCurrentLevel(prev => prev === 0 ? prev : prev - 1)}} style={{...styles(theme,fSize).icon,color:currentLevel === 0 ? Colors.get('icons', theme) : Colors.get('mainText', theme)}}/>
            <p style={{...styles(theme,fSize).subtext,fontSize:'18px',}}>{currentLevel + 1}</p>
            <FaCaretRight onClick={() => {setCurrentLevel(prev => prev === protocol.levels.length - 1 ? prev : prev + 1)}} style={{...styles(theme,fSize).icon,color:currentLevel === protocol.levels.length - 1 ? Colors.get('icons', theme) : Colors.get('mainText', theme)}}/>
           </div>
            <div style={{display:'flex',flexDirection:'row',marginRight:'12px',marginLeft:'auto',width:'80%',height:'33px',alignItems:'center',justifyContent:'space-around',borderRadius:'12px',backgroundColor:'rgba(0,0,0,0.3)',marginTop:'12px'}}>
            <div style={{display:'flex',flexDirection:'column',width:'70%',alignItems:'center',justifyContent:'center'}}> 
             <div style={{fontSize:'11px',textAlign:'left',color:Colors.get('subText', theme)}}>{protocol.levels[currentLevel].strategy}</div>  
             <div style={{fontSize:'11px',textAlign:'left',color:Colors.get('subText', theme)}}>{(lang === 0 ? 'Циклы: ' : 'Cycles: ') + (protocol.levels[currentLevel].cycles)}</div>
            </div> 
            {protocol.levels[currentLevel].isDone && <MdDone style={{...styles(theme,fSize).icon,color:Colors.get('maxValColor', theme)}}/>}

           </div>
         </div>
        </div>
        <button onClick={() => {setTimer(true)}} style={{...styles(theme,fSize).subtext,width:'70%',borderRadius:'12px',backgroundColor:'rgba(0,0,0,0.5)',marginTop:'12px',fontSize: fSize === 0 ? '12px' : '14px',}}>{(lang === 0 ? 'Начать' : 'Start')}</button>
      </div>   
    )
}

const setActualLevel = (protocol) => {
    let ind = -1;
     for(let i = 0; i < protocol.levels.length; i++) {
        if(!protocol.levels[i].isDone) {
          ind = i;
          break;
        }
     }
     return ind > -1 ? ind : protocol.levels.length - 1;
  }

  const getCardsAmountInProtocol = (protocol) => {
    
    let allCards = 0;
    let doneCards = 0;

    for (let index = 0; index < protocol.protocols.length; index++) {
      const levels = protocol.protocols[index].levels;
      for (let index = 0; index < levels.length; index++) {
          if (levels[index].isDone) doneCards++;
          allCards++;
        }
      
    }
    
    return ' ' + doneCards + '/' + allCards;
  }
  