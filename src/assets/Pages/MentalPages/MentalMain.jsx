import React, {useState,useEffect} from 'react'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$ ,lang$,fontSize$,setPage} from '../../StaticClasses/HabitsBus'
import {FaStopwatch20,FaMemory,FaStar} from 'react-icons/fa'
import {GiLogicGateNxor,GiTargetShot} from 'react-icons/gi'

const MentalMain = () => {
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
        text={['Быстрый счёт', 'Mental math']}
        decr={[
          'Тренируйте скорость счёта и точность под таймером, прокачивая базовую арифметику и концентрацию.',
          'Train calculation speed and accuracy under time pressure to boost basic arithmetic and focus.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {setPage('MentalMath')}}
        colorDark="#233837ff"
        colorLight="#3ee72b62"
        colorSpecialDark="#1d2d1dff"
        colorSpecialLight="#25812a4d"
        index={0}
      />   
      <MenuCard 
        text={['Память в действии', 'Memory in action']}
        decr={[
         'Укрепляйте рабочую память через последовательности и n-back‑упражнения.',
         'Strengthen working memory with sequences and n-back style exercises.'
        ]}
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        colorDark={"#563333ff"}
        colorLight={"#f34f4f6e"}
        colorSpecialDark={"#563333ff"}
        colorSpecialLight={"#7d202054"}
        index={1}
      /> 
      <MenuCard 
        text={['Числовая логика', 'Number logic']}
        decr={[
         'Развивайте умение замечать закономерности и решать логические числовые задачи.',
         'Improve pattern recognition and logical thinking with number series and puzzles.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        colorDark={"#355436ff"}
        colorLight={"#90d93153"}
        colorSpecialDark={"#355436ff"}
        colorSpecialLight={"#2e765750"}
        index={2}
      /> 
      <MenuCard 
        text={['Чистый фокус', 'Pure focus']}
        decr={[
         'Тренируйте избирательное внимание и когнитивный контроль в задачах Go/No-Go и Струпа.',
         'Train selective attention and cognitive control with Go/No-Go and Stroop-style tasks.'
        ]} 
        theme={theme}  
        lang={langIndex}
        fontSize={fSize}
        onClick={() => {}}
        colorDark={"#46452bff"}
        colorLight={"#c6c14079"}
        colorSpecialDark={"#46452bff"}
        colorSpecialLight={"#79773251"}
        index={3}
      /> 
    </div>
    
  )
}

export default MentalMain

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

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#294128ff", colorLight = "#adeda640",
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#c8f445ff", theme,lang, onClick,fontSize,index}){
    const cardColor = (theme) => {
        if(theme === 'dark') return colorDark;
        else if(theme === 'specialdark') return colorSpecialDark;
        else if(theme === 'speciallight') return colorSpecialLight;
        return colorLight;
    }
    const getIcon = (index,isBack) => {
        if(index === 0) return <FaStopwatch20 style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 1) return <FaMemory style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 2) return <GiLogicGateNxor style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 3) return <GiTargetShot style={isBack ? backIconStyle : iconStyle}/>
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
        <div style={{display:'flex',flexDirection:'row',width:"15%",height:'22%',alignItems:'center',justifyContent:'center',position:'absolute',
          top:'5%',left:'80%',fontWeight:'bold',fontSize:'16px',color:Colors.get('maxValColor', theme)}}>
          <FaStar /> {getCategoryRecord(index)}
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

const getCategoryRecord = (index) => {
    const bestScore = 1000;
    return bestScore;
}
