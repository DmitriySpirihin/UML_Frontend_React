
import React, { useEffect, useState } from 'react'
import {AppData,UserData} from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors, { THEME } from "../StaticClasses/Colors";
import { clearAllSaves } from '../StaticClasses/SaveHelper'
import TelegramIcon from '@mui/icons-material/Telegram';
import {FaAddressCard,FaBackspace,FaLanguage,FaHighlighter,FaVolumeMute,FaVolumeUp,FaBug,FaDonate,FaExclamationTriangle} from 'react-icons/fa'
import {LuVibrate, LuVibrateOff} from 'react-icons/lu'
import { setTheme as setGlobalTheme, globalTheme$, theme$, showPopUpPanel$, setLang, lang$, vibro$, sound$} from '../StaticClasses/HabitsBus';

import Dark from '@mui/icons-material/DarkModeTwoTone';
import Light from '@mui/icons-material/LightModeTwoTone';
import Menu from '@mui/icons-material/MenuTwoTone';

const transitionSound = new Audio('Audio/Transition.wav');
const popUpSound = new Audio('Audio/Info.wav');
const MainBtns = () => {
    const [globalTheme, setGlobalThemeState] = React.useState('dark');
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [additionalPanel, setAdditionalPanel] = useState(false);
    const [additionalPanelNum, setAdditionalPanelNum] = useState(1);
    const [sound, setSound] = useState(0);
    const [vibro, setVibro] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsSettingsOpen(prev => !prev);
        window.addEventListener('toggleSettingsPanel', handleToggle);
        return () => window.removeEventListener('toggleSettingsPanel', handleToggle);
    }, []);

    const toggleSettings = () => {
        window.dispatchEvent(new Event('toggleSettingsPanel'));
    };

    React.useEffect(() => {
        const subscriptionG = globalTheme$.subscribe(setGlobalThemeState);
        const subscriptionT = theme$.subscribe(setthemeState);
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        const subscriptionS = sound$.subscribe(setSound);
        const subscriptionV = vibro$.subscribe(setVibro);
        return () => {
            subscription.unsubscribe();
            subscriptionG.unsubscribe();
            subscriptionT.unsubscribe();
            subscriptionS.unsubscribe();
            subscriptionV.unsubscribe();
        }
    }, []);

    return (
        <>
            <PopUpPanel theme={theme}  />
            
            
              <div style={styles(theme).logoContainer}>
                <UserPanel theme={theme} />
                <img src={globalTheme === 'dark' ? 'Art/Ui/Main_Dark.png' : 'Art/Ui/Main_Light.png'} style={styles(theme).logo} />
                {globalTheme === 'dark' && (<Dark  style={{...styles(theme).icon,top:'9vh',left:'6vh'}} onClick={() => {toggleTheme();playEffects(null,50);}} />)}
                {globalTheme !== 'dark' && (<Light  style={{...styles(theme).icon,top:'9vh',left:'6vh'}} onClick={() => {toggleTheme();playEffects(null,50);}} />)}
                <Menu  style={{...styles(theme).icon,top:'9vh',left:'2vh'}} onClick={() => {toggleSettings();playEffects(null,50);}} />
              </div>
            
            
            <SettingsPanel 
                theme={theme} 
                langIndex={langIndex} 
                setAdditionalPanel={setAdditionalPanel} 
                setAdditionalPanelNum={setAdditionalPanelNum} 
                vibroIndex={vibro} 
                soundIndex={sound} 
                setSound={setSound} 
                setVibro={setVibro}
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <AdditionalPanel theme={theme} langIndex={langIndex} isOpen={additionalPanel} setIsOpen={setAdditionalPanel} panelNum={additionalPanelNum}/>
        </>
    )
}

export default MainBtns
const UserPanel = ({theme}) => {
    const _style = {
        position: "fixed",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        top: "8vh",
        left: "80vw",
        width: "35px",
        zIndex: 1000,
    }
    return (
        <div style={_style}>
            <p style={{color: Colors.get('subText', theme),fontSize: "10px",fontFamily: "Segoe UI"}}>{UserData.name}</p>
            <img 
                src={Array.isArray(UserData.photo) ? UserData.photo[0] : UserData.photo} 
                style={{border: "3px solid " + Colors.get('border', theme),borderRadius: "50%",objectFit: "cover",width: "6vw",margin: "10px"}} 
            /> 
        </div>
    )
}

const PopUpPanel = ({theme}) => {
    const [show, setShow] = React.useState({show:false,header:''});
    useEffect(() => {
        const subscription = showPopUpPanel$.subscribe(setShow);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
      if(show.show) playEffects(popUpSound,0);
    }, [show]);
    return (
        <AnimatePresence>
            {show.show && (
                <motion.div
                    initial={{ y: '-100%', opacity: 0 }}
                    animate={{ y: '2vh', opacity: 1 }}
                    exit={{ y: '-100%', opacity: 0 }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 25
                    }}
                    style={popUpStyles(theme).panel}
                >
                    <h1 style={popUpStyles(theme).text}>{show.header}</h1>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const popUpStyles = (theme) => {
    return {
    panel : {
      position: "fixed",
      left: "7.5%",
      
      zIndex: 9000,
      width: "85vw",
      height: "15vh",
      borderRadius: "24px",
      border: `1px solid ${Colors.get('border', theme)}`,
      backgroundColor: Colors.get('simplePanel', theme),
      boxShadow: `0 -4px 20px ${Colors.get('shadow', theme)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      textAlign: "center",
      fontSize: "14px",
      color: Colors.get('mainText', theme),
      margin: "20px 0"
    }
  }
}

const AdditionalPanel = ({theme,langIndex,isOpen,setIsOpen,panelNum}) => {
    const [report, setReport] = useState('');
    const sendReport = () => {
        // send report via backend
    }
    const TelegramLink = ({name}) => {
        return (
            <div style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",width:"50%",height:"10%",borderBottom:"1px solid " + Colors.get('border', theme)}}>
                <TelegramIcon style={{width: "24px", height: "24px",color:'#3f86afff'}} />
                <a href={`https://t.me/${name}`} target="_blank" rel="noopener noreferrer">
                    <p style={styles(theme).text}>{name}</p>
                </a>
            </div>
        )
    }
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '110%'}}
                    animate={{ x: '0%'}}
                    exit={{ x: '110%'}}
                    transition={{
                        type: 'tween',
                        duration: 0.2
                    }}
                    style={{...settingsPanelStyles(theme).panel,width:"110vw",height:"100vh",borderRadius:"0"}}
                >
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",height:"100%"}}>
                   {panelNum === 1 && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"80%",height:"80%"}}>
                      <p style={styles(theme).text}>{langIndex === 0 ? 'Если вы нашли ошибку, пожалуйста, сообщите об этом' : 'If you find a bug, please report it'}</p>
                      <textarea maxLength={160} onChange={(e) => setReport(e.target.value)} placeholder={langIndex === 0 ? 'опишите проблему' : 'describe a problem'} style={styles(theme).input}/>
                      {report.length > 0 && <div style={{width:"50%",borderBottom:"1px solid " + Colors.get('border', theme)}} onClick={sendReport}>{langIndex === 0 ? 'отправить' : 'send'}</div>}
                   </div>}
                   {panelNum === 3 && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"80%",height:"80%"}}>
                      <div style={{display:"flex",flexDirection:"row"}}><FaAddressCard style={styles(theme).miniIcon}/><p style={styles(theme).text}>{langIndex === 0 ? ' Наши телеграм контакты' : 'Our telegram contacts'}</p></div>
                      <TelegramLink name = "Diiimaan777"/>
                      <TelegramLink name = "wakeupdemianos"/>
                   </div>}
                   {panelNum === 2 && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"80%",height:"80%"}}>
                      <div style={{display:"flex",flexDirection:"row"}}><FaDonate style={styles(theme).miniIcon}/><p style={styles(theme).text}>{langIndex === 0 ? ' Здесь будет ссылка на донат' : 'Here will be a donate link'}</p></div>
                   </div>}
                  <div  onClick={() => {setIsOpen(false);playEffects(null,20)}} style={{display:"flex",flexDirection:"row",borderBottom:"1px solid " + Colors.get('border', theme),width:'40%'}}>
                    <FaBackspace style={styles(theme).miniIcon}/>
                    <p style={styles(theme).text} >{langIndex === 0 ? 'Закрыть' : 'Close'}</p>
                  </div>
                  
                
                  </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
    

const SettingsPanel = ({theme, langIndex,setAdditionalPanel,setAdditionalPanelNum,vibroIndex,soundIndex,setSound,setVibro}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle panel visibility when settings button is clicked
    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggleSettingsPanel', handleToggle);
        return () => window.removeEventListener('toggleSettingsPanel', handleToggle);
    }, []);


    return (
        <AnimatePresence>
            {isOpen && (
                <React.Fragment>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.9 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: 'rgba(0, 0, 0, 0.98)',
                            zIndex: 2000,
                            pointerEvents: 'auto',
                        }}
                        onClick={() => {setIsOpen(false);playEffects(transitionSound,20);}}
                    />
                    <motion.div
                        className="settings-panel"
                        initial={{ x: '-120%' }}
                        animate={{ x: '-30%' }}
                        exit={{ x: '-120%' }}
                        transition={{ type: 'spring', stiffness: 250, damping: 25}}
                        style={{...settingsPanelStyles(theme).panel, zIndex: 2100}}
                    >
                    <p 
                    style={{
                        fontFamily: 'Segoe UI',
                        fontSize: '14px',
                        color: Colors.get('subText', theme),
                        marginLeft: '15%',
                        position: 'absolute',
                        bottom: '88vh'

                    }}> 
                        {langIndex === 0 ? 'настройки' : 'settings'}
                    </p>
                    <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaLanguage style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme).text} onClick={() => { 
                                changeSettings(0);
                                playEffects(null,20);
                                // Update language text immediately
                                const newLangIndex = langIndex === 0 ? 1 : 0;
                                setLang(newLangIndex === 0 ? 'ru' : 'en');
                                AppData.setPrefs(0, newLangIndex);
                            }}>
                                {langIndex === 0 ? 'язык приложения: рус' : 'application language: eng'}
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaHighlighter style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(1);playEffects(null,20)}}>
                                 {
                                    getThemeName(langIndex,theme)
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            {soundIndex === 0 ? <FaVolumeUp style={settingsPanelStyles(theme).miniIcon}/> : <FaVolumeMute style={settingsPanelStyles(theme).miniIcon}/>}
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(2);setSound(soundIndex === 0 ? 1 : 0)}}>
                                 {
                                   langIndex === 0 ? 'звук: '+ (soundIndex === 0 ? 'вкл' : 'выкл') : 'sound: ' + (soundIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            {vibroIndex === 0 ? <LuVibrate style={settingsPanelStyles(theme).miniIcon}/> : <LuVibrateOff style={settingsPanelStyles(theme).miniIcon}/>}
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(3);setVibro(vibroIndex === 0 ? 1 : 0);playEffects(null,20)}}>
                                 {
                                   langIndex === 0 ? 'вибрация: '+ (vibroIndex === 0 ? 'вкл' : 'выкл') : 'vibration: ' + (vibroIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaBug style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(1)}}>
                                 {
                                    langIndex === 0 ? 'сообщить об ошибке' : 'report a bug'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaDonate style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(2);playEffects(null,20)}}>
                                 {
                                    langIndex === 0 ? 'поддержи нас' : 'support us'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaAddressCard style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(3);playEffects(null,20)}}>
                                 {
                                   langIndex === 0 ? 'контакты разработчиков' : 'developers contacts'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaExclamationTriangle style={settingsPanelStyles(theme).miniIcon}/>
                            <p 
                                style={{...settingsPanelStyles(theme).text, cursor: 'pointer'}} 
                                onClick={async () => {
                                    if (window.confirm(langIndex === 0 
                                    ? 'Вы уверены, что хотите удалить все сохранения? Это действие нельзя отменить.' 
                                    : 'Are you sure you want to clear all saves? This action cannot be undone.')) {
                                    try {
                                        await clearAllSaves();
                                        window.alert(langIndex === 0 
                                        ? 'Все сохранения успешно удалены' 
                                        : 'All saves have been cleared successfully');
                                        window.location.reload(); // Reload to reflect changes
                                    } catch (error) {
                                        console.error('Error clearing saves:', error);
                                        window.alert(langIndex === 0 
                                        ? 'Произошла ошибка при удалении сохранений' 
                                        : 'An error occurred while clearing saves');
                                    }
                                }
                            }}
                            >
                                {langIndex === 0 ? '!Удалить сохранения!' : '! Delete saves!'}
                            </p>
                        </div>
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        
                        </div>
                        <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaBackspace style={settingsPanelStyles(theme).miniIcon}/>
                            <p 
                                style={{...settingsPanelStyles(theme).text, cursor: 'pointer'}} 
                                onClick={() => {setIsOpen(false);playEffects(transitionSound,20)}}
                            >
                                {langIndex === 0 ? 'назад' : 'back'}
                            </p>
                        </div>
                    </div>
                    
                    <p 
                    style={{
                        fontFamily: 'Segoe UI',
                        fontSize: '10px',
                        color: Colors.get('subText', theme),
                        marginLeft: '210px',
                        position: 'absolute',
                        bottom: '20px'

                    }}> 
                        {langIndex === 0 ? 'версия: ' + AppData.version : 'version: ' + AppData.version}
                    </p>
                </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    )
}
const settingsPanelStyles = (theme) => {
    return {
    panel: {
      position: 'fixed',
      right: 0,
      top: 0,
      bottom: 0,
      zIndex: 9000,
      width: '80vw',
      maxWidth: '400px',
      backgroundColor: Colors.get('simplePanel', theme),
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingTop: '20px',
      borderRadius: '24px',
    },
    text: {
      textAlign: "left",
      fontSize: "14px",
      color: Colors.get('mainText', theme),
      marginTop: '15px',
      marginLeft: "5%",
    },
    miniIcon: {
            width: "20px",
            height: "20px",
            padding: "5px",
            color: Colors.get('mainText', theme),
        },
    listEl: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '70%',
        marginBottom: '15px',
        borderBottom: `1px solid ${Colors.get('border', theme)}`,
        cursor: 'pointer',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: Colors.get('hover', theme, 0.1),
        },
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width: '90%',
      marginLeft: '15%',
      marginBottom: '30px',
    }
  }
}
function getThemeName(langIndex,theme) {
    let themeName='';
    switch(theme){
        case 'dark':
            themeName = langIndex === 0 ? 'тёмная' : 'dark';
            break;
        case 'light':
            themeName = langIndex === 0 ? 'светлая' : 'light';
            break;
        case 'specialdark':
            themeName = langIndex === 0 ? 'тёмная(доп)' : 'dark(add)';
            break;
        case 'speciallight':
            themeName = langIndex === 0 ? 'светлая(доп)' : 'light(Add)';
            break;
    }
    return langIndex === 0 ?  'тема: ' + themeName : 'theme: ' + themeName;
}

function changeSettings(prefIndex){
    switch(prefIndex){
        case 0:
            setLang(AppData.prefs[0] == 0 ? 'en' : 'ru');
            AppData.prefs[0] == 0 ? AppData.setPrefs(0,1) : AppData.setPrefs(0,0);
            break;
        case 1:
            toggleTheme();
            break;
        case 2:
            AppData.prefs[2] == 0 ? AppData.setPrefs(2,1) : AppData.setPrefs(2,0);
            break;
        case 3:
            AppData.prefs[3] == 0 ? AppData.setPrefs(3,1) : AppData.setPrefs(3,0);
            break;
    }
}
const toggleTheme = () => {
        let next;
        let themeNum = 0;
        if (Colors.theme === THEME.DARK) {
            themeNum = 1;
            next = THEME.SPECIALDARK;
        }else if(Colors.theme === THEME.SPECIALDARK) {
            themeNum = 2;
            next = THEME.LIGHT;
        }else if(Colors.theme === THEME.LIGHT) {
            themeNum = 3;
            next = THEME.SPECIALLIGHT;
        }else{
            themeNum = 0;
            next = THEME.DARK;
        }
        AppData.setPrefs(1,themeNum);
        console.log('SetTheme' + themeNum + ':' + AppData.prefs[1]);
        Colors.setTheme(next);
        setGlobalTheme(next);
};
const styles = (theme) => {
    return {
        text: {
            color: Colors.get('mainText', theme),
            fontSize: "14px",
            fontFamily: "Segoe UI",
        },
        input: {
            width: "90%",
            height: "30%",
            padding: "10px",
            margin: "10px 0",
            border: `1px solid ${Colors.get('border', theme)}`,
            borderRadius: "12px",
            outline: "none",
            fontSize: "14px",
            color: Colors.get('mainText', theme),
            fontFamily: "Segoe UI",
        },
        miniIcon: {
            width: "20px",
            height: "20px",
            padding: "5px",
            marginTop: "10px",
            color: Colors.get('mainText', theme),
        },
        icon: {
        position: "fixed",
        top: "12vh",
        left: "4vw",
        width: "35px",
        zIndex: 1000,
        filter: 'drop-shadow(0px 0px 1px ' + Colors.get('shadow', theme) + ')',
        color: Colors.get('icons', theme),
       },
  logo :
  {
    width: "40vw"
  },
  logoContainer:
  {
    position: "fixed",
    width: "100vw",
    backgroundColor: Colors.get('bottomPanel', theme),
    boxShadow: `0px 2px 0px ${Colors.get('bottomPanelShadow', theme)}`,
    bottom:'83vh',
    left:'0vw',
    marginTop:'6vw',
    marginBottom:'8vw'
  }
    }
}
function playEffects(sound,vibrationDuration ){
  if(AppData.prefs[2] == 0 && sound !== null){
    if(!sound.paused){
        sound.pause();
        sound.currentTime = 0;
    }
    sound.volume = 0.5;
    sound.play();
  }
  if(AppData.prefs[3] == 0)navigator.vibrate(vibrationDuration);
}