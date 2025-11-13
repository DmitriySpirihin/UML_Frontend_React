import React from 'react'
import Colors, { THEME } from '../StaticClasses/Colors'
import { theme$, lang$ , globalTheme$} from '../StaticClasses/HabitsBus'
import { AppData } from '../StaticClasses/AppData'
import 'grained'

const startSound = new Audio('Audio/Start.wav');

const MainMenu = ({ onPageChange }) => {
    const [theme, setThemeState] = React.useState('dark');
    const [globalTheme, setGlobalTheme] = React.useState('dark');
    const [lang, setLang] = React.useState(AppData.prefs[0]);

    React.useEffect(() => {
        const themeSubscription = theme$.subscribe(setThemeState);
        const langSubscription = lang$.subscribe((lang) => {
            setLang(lang === 'ru' ? 0 : 1);
        });
        return () => {
            themeSubscription.unsubscribe();
            langSubscription.unsubscribe();
        };
    }, []);
    React.useEffect(() => {
        window.grained('#grain', {
            animate: true,
            grainSize: 0.05,
            grainDensity: 0.2,
            grainOpacity: 0.01,
            grainWidth: 0.9,
            grainHeight: 0.9,
            grainColor: "#ffffffff",
        });
    }, []);
    React.useEffect(() => {
        const globalThemeSubscription = globalTheme$.subscribe(setGlobalTheme);
        return () => {
            globalThemeSubscription.unsubscribe();
        };
    }, []);

    return (
          
          <div style={styles(theme).container}>
            <div style={{height:'20vh'}}/>
            <h2 style={styles(theme).mainText}>{lang === 0 ? 'Выберите категорию' : 'Choose category'}</h2>
            <div style={styles(theme).scrollView}>
               
               <MenuCard 
                    text={['Привычки', 'Habits']} 
                    decr={[
                        'Приложение использует научно обоснованные методы формирования привычек, включая теорию петли привычки (Чарльз Дахигг), принципы подкрепления (Б.Ф. Скиннер) и 21-дневное правило формирования привычек (Максвелл Мальц).',
                        'This app utilizes evidence-based habit formation techniques, including the habit loop theory (Charles Duhigg), principles of reinforcement (B.F. Skinner), and the 21-day rule of habit formation (Maxwell Maltz).'
                    ]} 
                    theme={theme}  
                    lang={lang}
                    onClick={() => {onPageChange('HabitsMain');playEffects(startSound,100);}}
                />
                <MenuCard 
                    text={['Тренировочная дневник', 'Training diary']} 
                    decr={['Скоро будет доступно', 'Coming soon']}
                    colorDark="#143113ff" 
                    colorLight="#98f9a0ff" 
                    colorSpecialDark="#26352fff" 
                    colorSpecialLight="#9de074ff" 
                    theme={theme} 
                    lang={lang}
                    onClick={() => {playEffects(startSound,100);}}
                />
               <MenuCard 
                    text={['Список задач', 'Simple task manager']} 
                    decr={['Скоро будет доступно', 'Coming soon']}
                    colorDark="#4b3f1fff" 
                    colorLight="#ebe58eff" 
                    colorSpecialDark="#36341cff" 
                    colorSpecialLight="#d0e074ff" 
                    theme={theme} 
                    lang={lang}
                    onClick={() => {playEffects(startSound,100);}}
                />
                <MenuCard 
                    text={['Хорошие новости', 'Good news']} 
                    decr={['Скоро будет доступно', 'Coming soon']}
                    colorDark="#3a201bff" 
                    colorLight="#ecae94ff" 
                    colorSpecialDark="#4a2828ff" 
                    colorSpecialLight="#e194c6ff" 
                    theme={theme} 
                    lang={lang}
                    onClick={() => {playEffects(startSound,100);}}
                />
            </div>

          </div>
    )
}

export default MainMenu

function MenuCard({text = ["Категория", "Category"], decr = ["Скоро будет доступно", "Coming soon"], colorDark = "#122636ff", colorLight = "#9cccf1ff",
  colorSpecialDark = "#1d262dff", colorSpecialLight = "#45dff4ff", theme,lang, onClick}){
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
        <div id="grain" style={_style} onClick={onClick}> 
            <h2 style={styles(theme).cardText}>{Array.isArray(text) ? text[lang] : text}</h2>
            <p style={styles(theme).text}>{Array.isArray(decr) ? decr[lang] : decr}</p>
        </div>    
    )
}

const styles = (theme) => ({
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
    fontSize: "14px",
    color: Colors.get('mainText', theme),
  },
  cardText :
  {
    textAlign: "left",
    marginBottom: "5px",
    fontSize: "14px",
    color: Colors.get('mainText', theme),
    marginLeft: "30px"
  },
  text :
  {
    textAlign: "left",
    fontSize: "10px",
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