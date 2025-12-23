import React from 'react'
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, devMessage$ ,isPasswordCorrect$,fontSize$ } from '../StaticClasses/HabitsBus'
import { AppData } from '../StaticClasses/AppData'
//import 'grained'
import  {NotificationsManager,sendPassword} from '../StaticClasses/NotificationsManager'
import MyInput from '../Helpers/MyInput'

const MainMenu = ({ onPageChange }) => {
    const [theme, setThemeState] = React.useState('dark');
    const [lang, setLang] = React.useState(AppData.prefs[0]);
    const [fSize, setFontSize] = React.useState(0);
    const [clickCount, setClickCount] = React.useState(0);
    const [clickCountUp, setClickCountUp] = React.useState(0);
    const [devConsolePanel, setDevConsolePanel] = React.useState(false);
    const [devMessage, setDevMessage] = React.useState('');
    const [devInputMessage, setDevInputMessage] = React.useState('');
    const [devMessageToAll, setDevMessageToAll] = React.useState('');
    const [isPasswordCorrect, setIsPasswordCorrect] = React.useState(false);
    const [passwordInput, setPasswordInput] = React.useState(false);

    React.useEffect(() => {
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
    React.useEffect(() => {
       
        const devMessageSubscription = devMessage$.subscribe(setDevMessage);
        const isPasswordCorrectSubscription = isPasswordCorrect$.subscribe(setIsPasswordCorrect);
        return () => {
            devMessageSubscription.unsubscribe();
            isPasswordCorrectSubscription.unsubscribe();
        };
    }, []);
    React.useEffect(() => {
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
        if(value.length > 5){
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
            <div style={{height:'20vh'}}/>
            <h2 style={styles(theme,fSize).mainText} onClick={() => {handleClick(true)}}>{lang === 0 ? 'Выберите категорию' : 'Choose category'}</h2>
            {passwordInput && <input style={{width:'85vw',height:'2vh',fontSize:'12px',borderRadius:'12px',zIndex:1001}} type="password" onChange={(e) => checkPassword(e.target.value)} />}
            <div style={styles(theme).scrollView}>
               
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
                />
                <MenuCard 
                    text={['Тренировочный дневник', 'Training log']} 
                    decr={[
                        'Отслеживайте свой тренировочный прогресс, ставьте цели и анализируйте результаты. Идеальный инструмент для системного подхода к физическому развитию.', 
                        'Track your workout progress, set goals, and analyze results. The perfect tool for a systematic approach to physical development.'
                    ]}
                    colorDark="#311313ff" 
                    colorLight="#f998c3ff" 
                    colorSpecialDark="#352628ff" 
                    colorSpecialLight="#e07498ff" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {onPageChange('TrainingMain');playEffects(null);}}
                />
               <MenuCard 
                    text={['Дыхательные практики, медитация и закаливание', 'Breathing exercises, meditation cold']} 
                    decr={['Дыхательные практики, медитация и закаливание помогают улучшить качество сна и общее самочувствие.', 'Breathing exercises, meditation, and calming techniques help improve sleep quality and overall well-being.']} 
                    colorDark="#1f4b49ff" 
                    colorLight="#8eebd7ff" 
                    colorSpecialDark="#1c3136ff" 
                    colorSpecialLight="#74d9e0ff" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {playEffects(null);}}
                />
                <MenuCard 
                    text={['Список задач', 'Simple task manager']}
                    decr={['Скоро будет доступно', 'Coming soon']}
                    colorDark="#2b2929ff" 
                    colorLight="#9e9d9cff" 
                    colorSpecialDark="#353232ff" 
                    colorSpecialLight="#ebe9eaff" 
                    theme={theme} 
                    lang={lang}
                    fontSize={fSize}
                    onClick={() => {playEffects(null);}}
                />
                <div style={{height:'5vh',width:'100%'}} onClick={() => {handleClick(false)}} />
            </div>
          </div>
          </>
    )
}

export default MainMenu

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#133612ff", colorLight = "#a4f19cff",
  colorSpecialDark = "#1d2d1dff", colorSpecialLight = "#c8f445ff", theme,lang, onClick,fontSize}){
    const cardColor = (theme) => {
        if(theme === 'dark') return colorDark;
        else if(theme === 'specialdark') return colorSpecialDark;
        else if(theme === 'speciallight') return colorSpecialLight;
        return colorLight;
    }
    const borderColor = (theme) => {
        if(theme === 'dark') return "#9099a0ff";
        else if(theme === 'specialdark') return "#938b8bff";
        else if(theme === 'speciallight') return "#e0b1b1ff";
        return "#8a8e91ff";
    }
    const _style = {
        alignItems: "start",
        justifyContent: "start",
        height: "14vh",
        borderRadius: "24px",
        border: `2px solid ${borderColor(theme)}`,
        margin: "10px",
        backgroundColor: cardColor(theme),
        overflow : 'hidden',
        position: 'relative',
    }
    return (
        <div className="card-with-noise" style={_style} onClick={onClick}> 
            <h2 style={styles(theme,fontSize).cardText}>{Array.isArray(text) ? text[lang] : text}</h2>
            <p style={styles(theme,fontSize).text}>{Array.isArray(decr) ? decr[lang] : decr}</p>
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
    overflowY: "auto",
    justifyContent: 'center',
    alignItems: 'center'
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

