
import React, { useEffect, useState } from 'react'
import {AppData,UserData} from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors, { THEME } from "../StaticClasses/Colors";
import { clearAllSaves } from '../StaticClasses/SaveHelper'
import TelegramIcon from '@mui/icons-material/Telegram';
import {sendBugreport} from '../StaticClasses/NotificationsManager'
import {FaAddressCard,FaBackspace,FaLanguage,FaHighlighter,FaVolumeMute,FaVolumeUp,FaBug,FaDonate,FaExclamationTriangle,FaCrown} from 'react-icons/fa'
import {LuVibrate, LuVibrateOff} from 'react-icons/lu'
import {RiFontSize2} from 'react-icons/ri'
import {MdBackup} from 'react-icons/md'
import { setTheme as setGlobalTheme, globalTheme$, theme$, showPopUpPanel$,premium$, setLang, lang$, vibro$, sound$,fontSize$,setFontSize,setPage} from '../StaticClasses/HabitsBus';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Dark from '@mui/icons-material/DarkModeTwoTone';
import Light from '@mui/icons-material/LightModeTwoTone';
import Menu from '@mui/icons-material/MenuTwoTone';
import KeyBoard from '../Helpers/KeyBoard';
import {cloudBackup, cloudRestore} from '../StaticClasses/NotificationsManager';

const transitionSound = new Audio('Audio/Transition.wav');
const popUpSoundPositive = new Audio('Audio/Info.wav');
const popUpSoundNegative = new Audio('Audio/Warn.wav');
const MainBtns = () => {
    const [globalTheme, setGlobalThemeState] = React.useState('dark');
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [additionalPanel, setAdditionalPanel] = useState(false);
    const [additionalPanelNum, setAdditionalPanelNum] = useState(1);
    const [sound, setSound] = useState(0);
    const [vibro, setVibro] = useState(0);
    const [fSize, setFSize] = useState(0);
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
        const subscriptionF = fontSize$.subscribe(setFSize);
        return () => {
            subscription.unsubscribe();
            subscriptionG.unsubscribe();
            subscriptionT.unsubscribe();
            subscriptionS.unsubscribe();
            subscriptionV.unsubscribe();
            subscriptionF.unsubscribe();
        }
    }, []);

    return (
        <>
            <PopUpPanel theme={theme}fSize={fSize}  />
            
            
              (<div style={styles(theme,fSize).logoContainer}>
                <img src={globalTheme === 'dark' ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={styles(theme).logo} />
                <div  style={{marginLeft: '50%',top:'10.5vh',left:'-50%',position:'absolute',width:'100%',height:'25%',display:'flex',justifyContent:'flex-start',alignItems:'center'}}>
                    <Menu  style={{...styles(theme).icon,marginLeft:'15px'}} onClick={() => {toggleSettings();playEffects(null);}} />
                    {globalTheme === 'dark' && (<Dark  style={{...styles(theme).icon}} onClick={() => {toggleTheme();playEffects(null);}} />)}
                    {globalTheme !== 'dark' && (<Light  style={{...styles(theme).icon}} onClick={() => {toggleTheme();playEffects(null);}} />)}
                    <UserPanel theme={theme}fSize={fSize} />
                 </div>
                
              </div>)
            
            
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
                fSize={fSize}
            />
            <AdditionalPanel theme={theme} langIndex={langIndex} isOpen={additionalPanel} setIsOpen={setAdditionalPanel} panelNum={additionalPanelNum}/>
            <KeyBoard/>
        </>
    )
}

export default MainBtns
const UserPanel = ({theme,fSize}) => {
    const [hasPremium, setHasPremium] = React.useState(false);
    useEffect(() => {
        const subscription = premium$.subscribe(setHasPremium);
        return () => subscription.unsubscribe();
    }, []);
    const _style = {
        marginLeft: 'auto',
        marginRight: '10px',
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    }
    return (
        <div style={_style}>
            <div style={{display: 'flex',flexDirection: 'column'}}>
              {hasPremium && <div style={{color:'#c7903db4',fontSize: "8px",fontFamily: "Segoe UI"}}>premium</div>}
              <div style={{color: Colors.get('subText', theme),fontSize: fSize === 0 ? "11px" : "13px",fontFamily: "Segoe UI"}}>{UserData.name}</div>
            </div>
            <div style={{position: 'relative',width: '30px',height: '30px',margin: '10px',borderRadius: '50%',overflow: 'hidden',border: hasPremium ? 'none' : `3px solid ${Colors.get('border', theme)}`,boxSizing: 'border-box',}}>
             {/* User Photo */}
             <img style={{position: 'absolute',top: 0,left: 0, width: '100%',height: '100%',objectFit: 'cover',borderRadius: '50%',zIndex: 1,}}src={Array.isArray(UserData.photo) ? UserData.photo[0] : UserData.photo} alt="images/Ui/Guest.jpg"/>
             {/* Premium Border Overlay (only if hasPremium) */}
             {hasPremium && (<img style={{position: 'absolute',top: 0,left: 0,width: '100%',height: '100%',objectFit: 'contain',zIndex: 2,}}src={'images/Ui/premiumborder.png'}/>)}
            </div>
        </div>
    )
}

const PopUpPanel = ({theme,fSize}) => {
    const [show, setShow] = React.useState({show:false,header:'',isPositive:true});
    useEffect(() => {
        const subscription = showPopUpPanel$.subscribe(setShow);  
        return () => subscription.unsubscribe();
    }, []);
    useEffect(() => {
      if(show.show) playEffects(show.isPositive ? popUpSoundPositive : popUpSoundNegative);
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
                    style={popUpStyles(theme,show.isPositive,fSize).panel}
                >
                   <div style={popUpStyles(theme, show.isPositive,fSize).iconContainer}>
                        {show.isPositive ? (
                            <CheckCircleOutlineIcon 
                                style={popUpStyles(theme, show.isPositive,fSize).icon} 
                            />
                        ) : (
                            <WarningAmberIcon 
                                style={popUpStyles(theme, show.isPositive,fSize).icon} 
                            />
                        )}
                    </div>
                    <h1 style={popUpStyles(theme,show.isPositive,fSize).text}>{show.header}</h1>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const popUpStyles = (theme,isPositive,fSize) => {
    return {
    panel : {
      position: "fixed",
      left: "7.5%",
      zIndex: 9999,
      width: "85vw",
      height: "15vh",
      borderRadius: "24px",
      border: `4px solid ${isPositive ? Colors.get('habitCardDone',theme) : Colors.get('habitCardSkipped',theme)}`,
      backgroundColor: Colors.get('simplePanel', theme),
      boxShadow: `0 -4px 20px ${Colors.get('shadow', theme)}`,
      display: "flex",
      flexDirection:'column',
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      textAlign: "center",
      fontSize: fSize === 0 ? "13px" : "15px",
      color: Colors.get('mainText', theme),
      margin: "20px 0"
    },
    iconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "20px",
        minHeight: "20px",
    },
    icon: {
        color: isPositive ? '#acaf4cff' : '#F44336',
        fontSize: '24px',
    },
  }
}

const AdditionalPanel = ({theme,langIndex,isOpen,setIsOpen,panelNum}) => {
    const [report, setReport] = useState('');
    const sendReport = () => {
        sendBugreport(report);
        setReport('');
    }
    const TelegramLink = ({name}) => {
        return (
            <div style={{display:"flex",flexDirection:"row",alignItems:"center",justifyContent:"center",width:"50%",height:"10%",borderBottom:"1px solid " + Colors.get('border', theme)}}>
                <TelegramIcon style={{width: "24px", height: "24px",color:'#3f86afff'}} />
                <a href={`https://t.me/${name}`} target="_blank" rel="noopener noreferrer">
                    <p style={styles(theme,AppData.prefs[4]).text}>{name}</p>
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
                      <TelegramLink  name = "Diiimaan777"/>
                      <TelegramLink  name = "wakeupdemianos"/>
                   </div>}
                   {panelNum === 4 && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"80%",height:"80%"}}>
                      <div style={{display:"flex",flexDirection:"row"}}><MdBackup style={styles(theme).miniIcon}/><p style={styles(theme).text}>{langIndex === 0 ? ' Резервные копии и восстановление данных' : ' Backup and data recovery'}</p></div>
                      <div style={{width:"70%",margin:"50px",borderBottom:"1px solid " + Colors.get('border', theme)}} onClick={async () => cloudBackup()}>{langIndex === 0 ? 'Создать резервную копию' : 'Create backup'}</div>
                      <div style={{width:"70%",margin:"50px",borderBottom:"1px solid " + Colors.get('border', theme)}} onClick={async () => cloudRestore()}>{langIndex === 0 ? 'Восстановить данные' : 'Restore data'}</div>
                   </div>}
                   {panelNum === 2 && <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"80%",height:"80%"}}>
                      <div style={{display:"flex",flexDirection:"row"}}><FaDonate style={styles(theme).miniIcon}/><p style={styles(theme).text}>{langIndex === 0 ? ' Здесь будет ссылка на донат' : 'Here will be a donate link'}</p></div>
                   </div>}
                  <div  onClick={() => {setIsOpen(false);playEffects(null)}} style={{display:"flex",flexDirection:"row",borderBottom:"1px solid " + Colors.get('border', theme),width:'40%'}}>
                    <FaBackspace style={styles(theme).miniIcon}/>
                    <p style={styles(theme).text} >{langIndex === 0 ? 'Закрыть' : 'Close'}</p>
                  </div>
                  
                
                  </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
    

const SettingsPanel = ({theme, langIndex,setAdditionalPanel,setAdditionalPanelNum,vibroIndex,soundIndex,setSound,setVibro,fSize}) => {
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
                        onClick={() => {setIsOpen(false);playEffects(transitionSound);}}
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
                        fontSize: fSize === 0 ? '13px' : '15px',
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
                            <p style={settingsPanelStyles(theme,fSize).text} onClick={() => { 
                                changeSettings(0);
                                playEffects(null);
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
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {changeSettings(1);playEffects(null)}}>
                                 {
                                    getThemeName(langIndex,theme)
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <RiFontSize2 style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => changeSettings(4,fSize)}>
                                 {
                                   langIndex === 0 ? 'шрифт: '+ (fSize === 0 ? 'малый' : 'обычный') : 'font: ' + (fSize === 0 ? 'small' : 'regular')
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            {soundIndex === 0 ? <FaVolumeUp style={settingsPanelStyles(theme).miniIcon}/> : <FaVolumeMute style={settingsPanelStyles(theme).miniIcon}/>}
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {changeSettings(2);setSound(soundIndex === 0 ? 1 : 0)}}>
                                 {
                                   langIndex === 0 ? 'звук: '+ (soundIndex === 0 ? 'вкл' : 'выкл') : 'sound: ' + (soundIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            {vibroIndex === 0 ? <LuVibrate style={settingsPanelStyles(theme).miniIcon}/> : <LuVibrateOff style={settingsPanelStyles(theme).miniIcon}/>}
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {changeSettings(3);setVibro(vibroIndex === 0 ? 1 : 0);playEffects(null)}}>
                                 {
                                   langIndex === 0 ? 'вибрация: '+ (vibroIndex === 0 ? 'вкл' : 'выкл') : 'vibration: ' + (vibroIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaBug style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(1)}}>
                                 {
                                    langIndex === 0 ? 'сообщить об ошибке' : 'report a bug'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaCrown style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {setPage('premium');setAdditionalPanelNum(2);playEffects(null)}}>
                                 {
                                    langIndex === 0 ? 'премиум подписка' : 'premium subscription'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaAddressCard style={settingsPanelStyles(theme).miniIcon}/>
                            <p style={settingsPanelStyles(theme,fSize).text } onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(3);playEffects(null)}}>
                                 {
                                   langIndex === 0 ? 'контакты разработчиков' : 'developers contacts'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <MdBackup style={settingsPanelStyles(theme).miniIcon}/>
                            <p 
                                style={{...settingsPanelStyles(theme,fSize).text, cursor: 'pointer'}} 
                                onClick={() => {setAdditionalPanel(true);setAdditionalPanelNum(4)}}
                            >
                                {langIndex === 0 ? 'Резервная копия' : 'Data backup'}
                            </p>
                        </div>
                        {/* <div style={settingsPanelStyles(theme).listEl}>
                            <FaExclamationTriangle style={settingsPanelStyles(theme).miniIcon}/>
                            <p 
                                style={{...settingsPanelStyles(theme,fSize).text, cursor: 'pointer'}} 
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
                        </div>*/}
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        
                        </div>
                        <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <FaBackspace style={settingsPanelStyles(theme).miniIcon}/>
                            <p 
                                style={{...settingsPanelStyles(theme,fSize).text, cursor: 'pointer'}} 
                                onClick={() => {setIsOpen(false);playEffects(transitionSound)}}
                            >
                                {langIndex === 0 ? 'назад' : 'back'}
                            </p>
                        </div>
                    </div>
                    
                    <p 
                    style={{
                        fontFamily: 'Segoe UI',
                        fontSize:fSize === 0 ? '12px' : '14px',
                        color: Colors.get('subText', theme),
                        marginLeft: '210px',
                        position: 'absolute',
                        bottom: '20px'

                    }}> 
                        {langIndex === 0 ? 'версия: 1.c.16.5' : 'version: 1.c.16.5'}
                    </p>
                </motion.div>
                </React.Fragment>
            )}
        </AnimatePresence>
    )
}
const settingsPanelStyles = (theme,fSize) => {
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
      fontSize: fSize === 0 ? "13px" : "15px",
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
        marginBottom: '5px',
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

function changeSettings(prefIndex,size){
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
        case 4:
            AppData.prefs[4] == 0 ? AppData.setPrefs(4,1) : AppData.setPrefs(4,0);
            setFontSize(size === 0 ? 1 : 0);
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
const styles = (theme,fSize) => {
    return {
        text: {
            color: Colors.get('mainText', theme),
            fontSize: fSize === 0 ? "13px" : "15px",
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
            fontSize: fSize === 0 ? "13px" : "15px",
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
        marginLeft: '5px',
        width: "35px",
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
    bottom:'82vh',
    left:'0vw',
    marginTop:'5vw',
    marginBottom:'9vw'
  }
    }
}
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