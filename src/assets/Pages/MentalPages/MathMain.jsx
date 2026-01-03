import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaStarHalf,FaStar,FaInfinity,FaSpa} from 'react-icons/fa'
import {GiStarsStack,GiCrownedSkull} from 'react-icons/gi'
import {quickMathCategories} from './MentalHelper'
import MentalGamePanel from './MentalGamePanelMath.jsx'

const MathMain = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]); 
    const [show,setShow] = useState(false);
    const [currentLevel, setCurrentLevel] = useState(0);
      
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
      <div style={{display:'flex',flexDirection:'column',width:'100%',alignItems:'center',justifyItems:'center'}}>
      <div style={{width:'100%',display: "grid" ,gridTemplateColumns: '1fr 1fr',alignItems:'center',justifyItems:'center'}}>
        {quickMathCategories.map((protocol,ind)=>{
        const cardColor = 'difficulty' + ind;
        return (ind < 4 &&
          <MenuCard key={ind} width='46vw' difficulty={ind} protocol={protocol} setLevel={setCurrentLevel} color={Colors.get(cardColor,theme)}
           theme={theme} lang={langIndex} click={() => {setCurrentLevel(ind),setShow(true)}} fSize={fSize}/>   
         )
        })}
       </div>
       <MenuCard width='96vw' difficulty={4} protocol={quickMathCategories[4]} setLevel={setCurrentLevel} color={Colors.get('difficultyAdd',theme)}
           theme={theme} lang={langIndex} click={() => {setCurrentLevel(4),setShow(true)}} fSize={fSize}/>
           <MenuCard width='96vw' difficulty={5} protocol={quickMathCategories[5]} setLevel={setCurrentLevel} color={Colors.get('difficulty',theme)}
           theme={theme} lang={langIndex} click={() => {setCurrentLevel(5),setShow(true)}} fSize={fSize}/> 
      </div>
       <MentalGamePanel type={0} difficulty={currentLevel} maxTimer={quickMathCategories[currentLevel].timeLimitSec * 1000} show={show} setShow={setShow}/>      
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

function MenuCard({protocol,difficulty,click,width,color,theme,lang,fSize} ){
    const getIcon = () => {
          if(difficulty === 0) return <FaStarHalf style={backIconStyle}/>
          else if(difficulty === 1) return <FaStar style={backIconStyle}/>
          else if(difficulty === 2) return <GiStarsStack style={backIconStyle}/>
          else if(difficulty === 3) return <GiCrownedSkull style={backIconStyle}/>
          else if(difficulty === 4) return <FaInfinity style={backIconStyle}/>
          else return <FaSpa style={backIconStyle}/>
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
          color: Colors.get('svgColor',theme)
      }
    return (
      <div style={_style} onClick={click}> 
        <div style={{display:'flex',flexDirection:'row',width:"65%",height:'22%',alignItems:'center',justifyContent:'flex-end',position:'absolute',
          top:'5%',left:'30%',fontWeight:'bold',fontSize:'16px',color:Colors.get('maxValColor', theme)}}>
          <FaStar /> {AppData.mentalRecords[0][difficulty]}
          </div> 
        <div style={{width:'90%',height:'100%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
              <h2 style={styles(theme,fSize).cardText}>{protocol.level[lang]}</h2>
              <p style={styles(theme,fSize).text}>{protocol.difficulty[lang]}</p>
          </div>
           {getIcon()}
        
      </div>   
    )
}