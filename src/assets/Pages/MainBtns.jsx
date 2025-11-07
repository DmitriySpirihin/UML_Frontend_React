import SettingsDark from '../Art/Ui/Settings_Dark.png'
import SettingsLight from '../Art/Ui/Settings_Light.png'
import ThemeDark from '../Art/Ui/Theme_Dark.png'
import ThemeLight from '../Art/Ui/Theme_Light.png'
import React, { useEffect, useState } from 'react'
import {AppData} from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors, { THEME } from "../StaticClasses/Colors";
import { setTheme as setGlobalTheme, globalTheme$ ,theme$,showPopUpPanel$,setLang,lang$} from '../StaticClasses/HabitsBus';

const MainBtns = () => {
    const [globalTheme, setGlobalThemeState] = React.useState('dark');
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);

    React.useEffect(() => {
        const subscription = globalTheme$.subscribe(setGlobalThemeState);
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        return () => subscription.unsubscribe();
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        return () => subscription.unsubscribe();
    }, []);

    return (
        <>
            <PopUpPanel theme={theme}  />
            <SettingsBtn globalTheme={globalTheme}/>  
            <ThemeBtn globalTheme={globalTheme}/>
            <SettingsPanel theme={theme} langIndex={langIndex}/>
        </>
    )
}

export default MainBtns
const SettingsBtn = ({globalTheme}) => {
    const _style = {
        outline: "none",
        boxShadow: "none",
        position: "fixed",
        top: "8vh",
        left: "4vw",
        width: "35px",
        zIndex: 1000,
        border: "none",
        background: "transparent",
        cursor: "pointer",
    }
    const icon = globalTheme === 'dark' ? SettingsDark : SettingsLight;
    
    const toggleSettings = () => {
        // This will be handled by the SettingsPanel's internal state
        // We'll use a custom event to communicate between components
        const event = new CustomEvent('toggleSettingsPanel');
        window.dispatchEvent(event);
    };
    
    return (
        <img 
            src={icon} 
            style={_style} 
            onClick={toggleSettings}
            alt={globalTheme === 'dark' ? 'Dark settings icon' : 'Light settings icon'}
        /> 
    )
}
const ThemeBtn = ({globalTheme}) => {
    const _style = {
            position: "fixed",
            top: "8vh",
            left: "14vw",
            width: "30px",
            zIndex: 1000,
            border: "none",
            background: "transparent",
        }

    const icon = globalTheme === 'dark' ? ThemeDark : ThemeLight;

    return (
       
        <img src={icon} onClick={() => {changeSettings(1)}} style={_style} />
    )
}
const PopUpPanel = ({theme}) => {
    const [show, setShow] = React.useState({show:false,header:''});
    useEffect(() => {
        const subscription = showPopUpPanel$.subscribe(setShow);  
        return () => subscription.unsubscribe();
    }, []);
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

const SettingsPanel = ({theme, langIndex}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [soundIndex, setSoundIndex] = useState(AppData.prefs[2]);
    const [vibroIndex, setVibroIndex] = useState(AppData.prefs[3]);

    // Toggle panel visibility when settings button is clicked
    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggleSettingsPanel', handleToggle);
        return () => window.removeEventListener('toggleSettingsPanel', handleToggle);
    }, []);

    // Close panel when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        
        const handleClickOutside = (e) => {
            const panel = document.querySelector('.settings-panel');
            const settingsBtn = document.querySelector('img[alt*="settings"]');
            
            if (panel && !panel.contains(e.target) && settingsBtn && !settingsBtn.contains(e.target)) {
                setIsOpen(false);
            }
        };

        // Add escape key listener to close panel
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleEscape);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

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
                            zIndex: 999,
                            pointerEvents: 'auto',
                        }}
                        onClick={() => setIsOpen(false)}
                    />
                    <motion.div
                        className="settings-panel"
                        initial={{ x: '-120%' }}
                        animate={{ x: '-30%' }}
                        exit={{ x: '-120%' }}
                        transition={{ type: 'spring', stiffness: 250, damping: 25}}
                        style={{...settingsPanelStyles(theme).panel, zIndex: 1000}}
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
                            <p style={settingsPanelStyles(theme).text} onClick={() => { 
                                changeSettings(0);
                                // Update language text immediately
                                const newLangIndex = langIndex === 0 ? 1 : 0;
                                setLang(newLangIndex === 0 ? 'ru' : 'en');
                                AppData.setPrefs(0, newLangIndex);
                            }}>
                                {langIndex === 0 ? 'язык приложения: рус' : 'application language: eng'}
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(1)}}>
                                 {
                                    getThemeName(langIndex,theme)
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(2);setSoundIndex(soundIndex === 0 ? 1 : 0)}}>
                                 {
                                   langIndex === 0 ? 'звук: '+ (soundIndex === 0 ? 'вкл' : 'выкл') : 'sound: ' + (soundIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(3);setVibroIndex(vibroIndex === 0 ? 1 : 0)}}>
                                 {
                                   langIndex === 0 ? 'вибрация: '+ (vibroIndex === 0 ? 'вкл' : 'выкл') : 'vibration: ' + (vibroIndex === 0 ? 'on' : 'off')
                                 }
                            </p>
                        </div>
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(0)}}>
                                 {
                                    langIndex === 0 ? 'сообщить об ошибке' : 'report a bug'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(1)}}>
                                 {
                                    langIndex === 0 ? 'поддержи нас' : 'support us'
                                 }
                            </p>
                        </div>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p style={settingsPanelStyles(theme).text } onClick={() => {changeSettings(2);setSoundIndex(soundIndex === 0 ? 1 : 0)}}>
                                 {
                                   langIndex === 0 ? 'контакты разработчиков' : 'developers contacts'
                                 }
                            </p>
                        </div>
                    </div>
                    <div style={settingsPanelStyles(theme).list}>
                        <div style={settingsPanelStyles(theme).listEl}>
                            <p 
                                style={{...settingsPanelStyles(theme).text, cursor: 'pointer'}} 
                                onClick={() => setIsOpen(false)}
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
      zIndex: 1000,
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
    listEl: {
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
    console.log(theme);
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
        if (Colors.theme === THEME.LIGHT) {
            themeNum = 2;
            next = THEME.SPECIALLIGHT;
        } else if (Colors.theme === THEME.DARK) {
            themeNum = 0;
            next = THEME.SPECIALDARK;
        } else if (Colors.theme === THEME.SPECIALLIGHT) {
            themeNum = 3;
            next = THEME.DARK;
        } else {
            themeNum = 1;
            next = THEME.LIGHT;
        }
        AppData.prefs[1] == themeNum;
        Colors.setTheme(next);
        setGlobalTheme(next);
};