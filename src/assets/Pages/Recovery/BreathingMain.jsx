import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaStarHalf,FaStar,} from 'react-icons/fa'
import {GiStarsStack,GiCrownedSkull} from 'react-icons/gi'
import {MdConstruction} from 'react-icons/md'
import {breathingProtocols,breathingLog,markSessionAsDone} from '../../StaticClasses/RecoveryLogHelper'
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
    let mainIndex = -1;
    return (
    <div style={styles(theme).container}>
      <div style={styles(theme).scrollView}>
      <div style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'center',justifyItems:'center'}}>
      <div style={{width:'100%',display: "grid" ,gridTemplateColumns: '1fr 1fr',alignItems:'center',justifyItems:'center'}}>
      {breathingProtocols.map((category,index)=>{
        const cardColor = 'difficulty' + index;
        return (
           category.protocols.map((protocol,ind)=>{
             mainIndex ++;
             return (
                <MenuCard key={mainIndex} difficulty={index} protocol={protocol} setTimer={setShowTimer} 
                setLevel={setCurrentLevel} theme={theme} color={Colors.get(cardColor, theme)} width='46vw'
                lang={langIndex} fSize={fSize} onClick={() => {setCurrentProtocol(ind)}} />   
             )
           })
        )
      })}
      </div>
      {/* constructor  */}
      <MenuCard difficulty={4} setTimer={setShowTimer} 
          setLevel={setCurrentLevel} theme={theme} color={Colors.get('difficulty', theme)} width='96vw'
          lang={langIndex} fSize={fSize} onClick={() => {}} protocol={undefined}/>  
          </div>
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
})

function MenuCard({protocol,difficulty,width,setTimer, color,theme,lang, onClick,fSize} ){
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
        
        <div style={{width:'90%',height:'100%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
              <h2 style={styles(theme,fSize).cardText}>{protocol === undefined ? (lang === 0 ? 'Конструктор' : 'Constructor') : Array.isArray(protocol.name) ? protocol.name[lang] : protocol.name}</h2>
              <p style={styles(theme,fSize).text}>{protocol === undefined ? (lang === 0 ? 'Создай свой протокол' : 'Create your own') : Array.isArray(protocol.aim) ? protocol.aim[lang] : protocol.aim}</p>
          </div>
           {getIcon()}
        
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
  