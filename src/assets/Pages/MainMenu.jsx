import {useEffect,useState} from 'react'
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, devMessage$ ,isPasswordCorrect$,fontSize$,premium$ ,setPage} from '../StaticClasses/HabitsBus'
import { AppData,UserData } from '../StaticClasses/AppData'
//import 'grained'
import  {NotificationsManager,sendPassword} from '../StaticClasses/NotificationsManager'
import {FaMoon,FaBrain,FaSpa,FaBookOpen,FaRecycle} from 'react-icons/fa'
import { getCurrentCycleAnalysis } from './TrainingPages/Analitics/TrainingAnaliticsMain'

const MainMenu = ({ onPageChange }) => {
    const [theme, setThemeState] = useState('dark');
    const [lang, setLang] = useState(AppData.prefs[0]);
    const [fSize, setFontSize] = useState(0);
    const [clickCount, setClickCount] = useState(0);
    const [clickCountUp, setClickCountUp] = useState(0);
    const [devConsolePanel, setDevConsolePanel] = useState(false);
    const [devMessage, setDevMessage] = useState('');
    const [devInputMessage, setDevInputMessage] = useState('');
    const [devMessageToAll, setDevMessageToAll] = useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = useState(false);
    const [passwordInput, setPasswordInput] = useState(false);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    useEffect(() => {
          const subscription = premium$.subscribe(setHasPremium);
          return () => subscription.unsubscribe();
        }, []);
    useEffect(() => {
        const themeSubscription = theme$.subscribe(setThemeState);
        const langSubscription = lang$.subscribe((lang) => {
            setLang(lang === 'ru' ? 0 : 1);
        });
        const fontSizeSubscription = fontSize$.subscribe(setFontSize);
        return () => {
            themeSubscription.unsubscribe();
            langSubscription.unsubscribe();
            fontSizeSubscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
       
        const devMessageSubscription = devMessage$.subscribe(setDevMessage);
        const isPasswordCorrectSubscription = isPasswordCorrect$.subscribe(setIsPasswordCorrect);
        return () => {
            devMessageSubscription.unsubscribe();
            isPasswordCorrectSubscription.unsubscribe();
        };
    }, []);
    useEffect(() => {
        if(isPasswordCorrect){
            setPasswordInput(false);
            setDevConsolePanel(true);
        }
    }, [isPasswordCorrect]);

    const handleClick = (isUp) => {
       if(isUp){
        setClickCountUp(clickCountUp + 1);
       }else{
        setClickCount(clickCount + 1);
       }
       if(clickCount === 5 && clickCountUp === 5){
          setPasswordInput(true);
          setClickCount(0);
          setClickCountUp(0);
       }
    }

    const checkPassword = (value) => {
        if(value.length === 16){
            sendPassword(value);
        }
    }

    return (
          <>
            
            {devConsolePanel && (
                <div style={{position:'absolute',display:'flex',alignItems:'center',flexDirection:'column',top:'10vh',left:'0',width:'100vw',height:'40vh',backgroundColor:'rgba(0,0,0,0.7)',zIndex:1000}}>
                  <div style={{display:'flex',overflowY:'scroll',borderRadius:'12px',width:'85vw',height:'15vh',fontSize:'12px',fontFamily:'Segoe UI',border:'2px solid white',color:'white'}}>
                     {devMessage}
                 </div>
                 <textarea style={{borderRadius:'12px',width:'85vw',height:'10vh',fontSize:'12px',fontFamily:'Segoe UI',border:'2px solid white',color:'white'}} value={devMessageToAll} onChange={(e) => setDevMessageToAll(e.target.value)}/>
            <div style={{width:'100%',display:'flex',flexDirection:'row',justifyContent:'space-around'}}>
                <input style={{borderRadius:'12px',width:'50vw',height:'3vh',fontSize:'12px',fontFamily:'Segoe UI',border:'2px solid white',color:'white'}} type="text" onChange={(e) => setDevInputMessage(e.target.value)} />
                <button onClick={() => {if(devInputMessage === 'TrainingMain'){onPageChange('TrainingMain');}else {NotificationsManager.sendMessage(devInputMessage,devMessageToAll)}}}>Submit</button>
            </div>
            <div style={{width:'90%', display:'flex',flexDirection:'row', justifyContent:'space-between'}}>
              <button onClick={() => setDevConsolePanel(false)}>Close console</button>
            </div>
            
                </div>
            )}
            <div style={styles(theme).container}>
            <div style={{height:'16vh'}}/>
            {passwordInput && <input style={{width:'85vw',height:'2vh',fontSize:'12px',borderRadius:'12px',zIndex:1001}} type="password" onChange={(e) => checkPassword(e.target.value)} />}
            <div style={styles(theme).scrollView}>
               <div style={{height:'1vh',width:'100%'}} onClick={() => {handleClick(true)}} />
               <MenuCard 
                    text={['Привычки', 'Habits']} 
                    decr={[
                        'Приложение использует научно обоснованные методы формирования привычек, включая теорию петли привычки (Чарльз Дахигг) и 21-дневное правило формирования привычек (Максвелл Мальц).',
                        'This app utilizes evidence-based habit formation techniques, including the habit loop theory (Charles Duhigg) and the 21-day rule of habit formation (Maxwell Maltz).'
                    ]} 
                    theme={theme}  
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('HabitsMain');playEffects(null);}}
                    index={0}
                />
                <MenuCard 
                    text={['Тренировочный дневник', 'Training log']} 
                    decr={[
                        'Отслеживайте свой тренировочный прогресс, ставьте цели и анализируйте результаты. Идеальный инструмент для системного подхода к физическому развитию.', 
                        'Track your workout progress, set goals, and analyze results. The perfect tool for a systematic approach to physical development.'
                    ]}
                    colorDark="#44281eff" 
                    colorLight="#f998c375" 
                    colorSpecialDark="#352628ff" 
                    colorSpecialLight="#93292950" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('TrainingMain');playEffects(null);}}
                    index={1}
                />
               <MenuCard 
                    text={['Дыхание, медитация и закаливание', 'Breathing, meditation & cold']} 
                    decr={['Дыхательные практики, медитация и закаливание помогают улучшить качество сна и общее самочувствие.', 'Breathing exercises, meditation, and calming techniques help improve sleep quality and overall well-being.']} 
                    colorDark="#355257ff" 
                    colorLight="#8eebd785" 
                    colorSpecialDark="#1c3136ff" 
                    colorSpecialLight="#4573766d" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('RecoveryMain');playEffects(null);}}
                    index={2}
                />
                <MenuCard 
                    text={['Ментальный фитнесс', 'Mental fitness']}
                    decr = {['Улучшайте память, внимание и скорость мышления с помощью коротких научно обоснованных тренировок.', 'Boost memory, focus and thinking speed with short, science-based brain workouts.']}
                    colorDark="#222121ff" 
                    colorLight="#7c7a7966" 
                    colorSpecialDark="#353232ff" 
                    colorSpecialLight="#4a3e3e4b" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('MentalMain');playEffects(null);}}
                    index={3}
                />
                <MenuCard 
                    text={['Сон и восстановление', 'Sleep & Recovery']}
                    decr = {['Помогает подобрать нагрузку и время отдыха','Helps balance training load and rest']}
                    colorDark="#37293eff" 
                    colorLight="#cba1d790" 
                    colorSpecialDark="#382537ff" 
                    colorSpecialLight="#83064550" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('SleepMain');playEffects(null);}}
                    index={4}
                    hasPremium={hasPremium}
                    needBlur={true}
                >
                

                </MenuCard>
                <div style={{height:'1vh',width:'100%'}} onClick={() => {handleClick(false)}} />
            </div>
          </div>
          </>
    )
}

export default MainMenu

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#294128ff", colorLight = "#7eff7065",
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#2790145c",fSize=1, theme,lang, onClick,fontSize,index,hasPremium = false,needBlur= false}){
    const cardColor = (theme) => {
        if(theme === 'dark') return colorDark;
        else if(theme === 'specialdark') return colorSpecialDark;
        else if(theme === 'speciallight') return colorSpecialLight;
        return colorLight;
    }
    const getIcon = (index,isBack) => {
        if(index === 0) return <FaRecycle style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 1) return <FaBookOpen style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 2) return <FaSpa style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 3) return <FaBrain style={isBack ? backIconStyle : iconStyle}/>
        else if(index === 4) return <FaMoon style={isBack ? backIconStyle : iconStyle}/>
    }
    const _style = {
        alignItems: "center",
        justifyContent: "center",
        display:'flex',
        flexDirection:'row',
        height: "13vh",
        borderRadius: "28px",
        margin: "10px",
        marginBottom:'20px',
        backgroundColor: cardColor(theme),
        overflow : 'hidden',
        position: 'relative',
        boxShadow:'3px 3px 2px rgba(0,0,0,0.3)',
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
    const info = getInfo(index);
    return (
        <div style={_style} onClick={onClick}> 
        { !hasPremium && needBlur &&
                  <div onClick={(e) => {e.stopPropagation();}} style={{position:'absolute',display:'flex',flexDirection:'column',justifyContent:'space-around',alignItems:'center',
                    width:'100%',height:'100%',left:'0',top:'0',backdropFilter:'blur(8px)',zIndex:2}}>
                    <div style={{...styles(theme,fSize).mainText}}> {lang === 0 ? 'Сон и ИИ аналитика 🤖✨' : 'Sleep and AI analysis 🤖✨'} </div>
                    <div style={{...styles(theme,fSize).mainText}}> {lang === 0 ? '👑 Только для премиум пользователей 👑' : '👑 Only for premium users 👑'} </div>
                    <button onClick={() => {setPage('premium')}} style={{...styles(theme,fSize).btn}} >{lang === 0 ? 'Стать премиум' : 'Get premium'}</button>
                  </div>
                }
        {info !== '' && <div style={{display:'flex',flexDirection:'row',width:"15%",height:'22%',backgroundColor:'rgba(50, 50, 50, 0.35)',alignItems:'center',justifyContent:'center',position:'absolute',
          top:'10%',left:'80%',borderRadius:'12px',fontSize:'16px',color:Colors.get('mainText', theme)}}>
           {info}
        </div>}
        {getIcon(index,false)}
        <div style={{width:'70%',height:'100%',display:'flex',flexDirection:'column',alignItems:'flex-start',justifyContent:'center'}}>
            <h2 style={styles(theme,fontSize).cardText}>{Array.isArray(text) ? text[lang] : text}</h2>
            <p style={styles(theme,fontSize).text}>{Array.isArray(decr) ? decr[lang] : decr}</p>
        </div>
         {getIcon(index,true)}
        </div>    
    )
}

const styles = (theme,fontSize) => ({
    container :
   {
     backgroundColor: Colors.get('background', theme),
     display: "flex",
     flexDirection: "column",
     justifyContent: "start",
     overflow:'hidden',
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     fontFamily: "Segoe UI",
  },
  mainText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fontSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
  },
  cardText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: fontSize === 0 ? "14px" : "16px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px"
  },
  text :
  {
    textAlign: "left",
    fontSize: fontSize === 0 ? "10px" : "12px",
    color: Colors.get('subText', theme),
    marginLeft: "30px"
  },
  scrollView:
  {
    width: "95vw",
    maxHeight: "90vh",
    overflowY: "scroll",
    justifyContent: 'center',
    alignItems: 'center'
  },
      btn:
      {
         width:'70%',
         height:'40px',
         borderRadius:'12px',
         fontSize: fontSize === 0 ? '13px' : '14px',
         color:Colors.get('mainText', theme),
         backgroundColor:Colors.get('simplePanel',theme)
      }
})
function playEffects(sound){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred('light');
}
function getInfo(index){
   if(index === 0) return AppData.choosenHabits.length > 0 ? AppData.choosenHabits.length : '';
   else if(index === 1){
    const tonnage = getCurrentCycleAnalysis().currentTonnage;
    return tonnage > 0 ? (tonnage / 1000).toFixed(1) + (AppData.prefs[0] === 0 ? 'т' : 't') : '';
   }
   else if(index === 2) return '';
   else if(index === 3) return '';
   else if(index === 4) return '';
}
