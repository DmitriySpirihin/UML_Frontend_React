import React, {useState,useEffect} from 'react'
import { AppData,UserData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$ ,lang$,fontSize$,recoveryType$,setPage,premium$} from '../../StaticClasses/HabitsBus.js'
import {FaStarHalf,FaStar,} from 'react-icons/fa'
import {GiStarsStack,GiCrownedSkull} from 'react-icons/gi'
import {MdConstruction} from 'react-icons/md'
import {breathingProtocols,meditationProtocols,coldWaterProtocols} from '../../StaticClasses/RecoveryLogHelper.js'
import BreathingTimer from './BreathingTimer.jsx'
import MeditationTimer from './MeditationTimer.jsx'
import HardeningTimer from './HardeningTimer.jsx'
import BreathingConstructor from './BreathingConstructor.jsx'
import MeditationConstructor from './MeditationConstructor.jsx'
import HardeningConstructor from './HardeningConstructor.jsx'

const BreathingMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
    const [currentProtocol, setCurrentProtocol] = useState(breathingProtocols[0].protocols[0]);
    const [protocolIndex,setProtocolIndex] = useState(0);
    const [categorylIndex,setCategoryIndex] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [structure,setStructure] = useState(breathingProtocols);
    const [showBreathingConstructor, setShowBreathingConstructor] = useState(false);
    const [showMeditationConstructor, setShowMeditationConstructor] = useState(false);
    const [showHardeningConstructor, setShowHardeningConstructor] = useState(false);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
        useEffect(() => {
         const subscription = premium$.subscribe(setHasPremium);
         return () => subscription.unsubscribe();
        }, []); 
    // subscriptions
    useEffect(() => {
          const subscription = theme$.subscribe(setthemeState); 
          const subscription2 = lang$.subscribe((lang) => {
          setLangIndex(lang === 'ru' ? 0 : 1);
          }); 
          const subscription3 = fontSize$.subscribe((fontSize) => {
          setFSize(fontSize);
          });
          const subscription4 = recoveryType$.subscribe((type) => {
          setStructure(type === 0 ? breathingProtocols : type === 1 ? meditationProtocols : coldWaterProtocols);
          });
          return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
          subscription3.unsubscribe();
          subscription4.unsubscribe();
          }
    }, []); 
    
    // render    
    let mainIndex = -1;
    return (
    <div style={styles(theme).container}>
      <div style={styles(theme).scrollView}>
      <div style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'center',justifyItems:'center'}}>
      <div style={{width:'100%',display: "grid" ,gridTemplateColumns: '1fr 1fr',alignItems:'center',justifyItems:'center'}}>
      {structure.map((category,index)=>{
        const cardColor = 'difficulty' + index;
        return (
           category.protocols.map((protocol,ind)=>{
             mainIndex ++;
             return (
                <MenuCard key={mainIndex} ind={ind} difficulty={index} protocol={protocol} setTimer={setShowTimer} 
                theme={theme} color={Colors.get(cardColor, theme)} width='46vw'
                lang={langIndex} fSize={fSize} onClick={() => {setCurrentProtocol(protocol);setProtocolIndex(ind);setCategoryIndex(index) }} hasPremium={hasPremium} needBlur={index > 1}/>   
             )
           })
        )
      })}
      </div>
      {/* constructor  */}
      <MenuCard difficulty={4} ind={-1} setTimer={recoveryType$.value === 0 ? setShowBreathingConstructor : recoveryType$.value === 1 ? setShowMeditationConstructor : setShowHardeningConstructor } 
          theme={theme} color={Colors.get('difficulty', theme)} width='96vw'
          lang={langIndex} fSize={fSize} onClick={() => {setCategoryIndex(4)}} protocol={undefined} hasPremium={hasPremium} needBlur={true} />  
          </div>
      </div>
       {recoveryType$.value === 0 && <BreathingTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex}/>}
       {recoveryType$.value === 1 && <MeditationTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex}/>}
       {recoveryType$.value === 2 && <HardeningTimer show={showTimer} isCustom={categorylIndex === 4} setShow={setShowTimer} protocol={currentProtocol} protocolIndex={protocolIndex} categoryIndex={categorylIndex}/>}

       <BreathingConstructor show={showBreathingConstructor} setShow={setShowBreathingConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize}/>
       <MeditationConstructor show={showMeditationConstructor} setShow={setShowMeditationConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize}/>
       <HardeningConstructor show={showHardeningConstructor} setShow={setShowHardeningConstructor} showTimer={setShowTimer} setProtocol={setCurrentProtocol} theme={theme} langIndex={langIndex} fSize={fSize}/>
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
  scrollView:
  {
    height: "95%",
    width:'100%',
    overflowY: "scroll",
    display:'flex',
    flexDirection:'column',
   
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
          btn:
          {
            width:'70%',
            height:'40px',
            borderRadius:'12px',
            fontSize: fSize === 0 ? '13px' : '14px',
             color:Colors.get('mainText', theme),
             backgroundColor:Colors.get('simplePanel',theme)
        }
})

function MenuCard({protocol,difficulty,ind,width,setTimer, color,theme,lang, onClick,fSize,hasPremium = false,needBlur= false} ){
    const getIcon = () => {
          if(difficulty === 0) return <FaStarHalf style={backIconStyle}/>
          else if(difficulty === 1) return <FaStar style={backIconStyle}/>
          else if(difficulty === 2) return <GiStarsStack style={backIconStyle}/>
          else if(difficulty === 3) return <GiCrownedSkull style={backIconStyle}/>
          else if(difficulty === 4) return <MdConstruction style={backIconStyle}/>
      }
    const _style = {
          alignItems: "center",
          justifyContent: "center",
          display:'flex',
          width: width,
          flexDirection:'row',
          height: '12vh',
          marginTop:'15px',
          borderRadius: "24px",
          backgroundColor: color,
          overflow : 'hidden',
          position: 'relative',
          boxShadow:'3px 3px 2px rgba(0,0,0,0.3)',
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
      <div style={_style} onClick={() => {onClick();setTimer(true)}}> 
      { !hasPremium && needBlur &&
        <div onClick={(e) => {e.stopPropagation();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'space-around',alignItems:'center',
         width:'100%',height:'100%',left:'0',top:'0',backdropFilter:'blur(8px)',zIndex:2}}>
          <div style={{...styles(theme,fSize).mainText}}> {lang === 0 ? 'Про категория' : 'Pro category'} </div>
          <div style={{...styles(theme,fSize).mainText}}> {lang === 0 ? '👑премиум👑' : '👑premium👑'} </div>
          <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn}} >{lang === 0 ? 'Стать премиум' : 'Get premium'}</button>
        </div>
      }
        {ind !== -1 && <div style={{display:'flex',flexDirection:'row',width:"15%",height:'22%',backgroundColor:'rgba(50, 50, 50, 0.35)',alignItems:'center',justifyContent:'center',position:'absolute',
          top:'1%',left:'80%',borderRadius:'12px',fontSize:'16px',color:Colors.get('mainText', theme)}}>
           {getCardsAmountInProtocol(difficulty,ind)}
        </div>}
        <div style={{width:'90%',height:'100%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
              <h2 style={styles(theme,fSize).cardText}>{protocol === undefined ? (lang === 0 ? 'Конструктор' : 'Constructor') : Array.isArray(protocol.name) ? protocol.name[lang] : protocol.name}</h2>
              <p style={styles(theme,fSize).text}>{protocol === undefined ? (lang === 0 ? 'Создай свой протокол' : 'Create your own') : Array.isArray(protocol.aim) ? protocol.aim[lang] : protocol.aim}</p>
          </div>
           {getIcon()}
        
      </div>   
    )
}



  const getCardsAmountInProtocol = (difficulty,ind) => {
  if(difficulty === 4 || !AppData.recoveryProtocols[recoveryType$.value][difficulty][ind]) return '';

  const data = AppData.recoveryProtocols[recoveryType$.value][difficulty][ind];
  let allSessions = 0;
  let doneSessions = 0;
  
    for (let j = 0; j < data.length; j++) {
        allSessions++;
        if(data[j]) doneSessions++;
    }
  return doneSessions + '/' + allSessions;
  }
  