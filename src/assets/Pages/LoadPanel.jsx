import React, { useEffect } from 'react';
import { AppData, UserData ,fillEmptyDays} from '../StaticClasses/AppData';
import { theme$, lang$, setPage,setPremium} from '../StaticClasses/HabitsBus'
import Colors from '../StaticClasses/Colors'
import { setAllHabits } from '../Classes/Habit';
import { initDBandCloud,loadData } from '../StaticClasses/SaveHelper';
import { initializeTelegramSDK, getTelegramContext } from '../StaticClasses/SaveHelper';
import { isUserHasPremium } from '../StaticClasses/NotificationsManager';

function LoadPanel() {
    const [theme, setTheme] = React.useState('dark');
    const [lang, setLang] = React.useState(0);
    const [userName, setUserName] = React.useState('Guest');
    const [userPhoto, setUserPhoto] = React.useState('images/Ui/Guest.jpg');
    const [loading, setLoading] = React.useState(true);
    useEffect(() => {
        async function initializeApp() {
            try {
                // Initialize database and cloud storage
                await initDBandCloud();
                // Initialize Telegram SDK
                const outsideTelegram = typeof window !== 'undefined' ? !window.Telegram?.WebApp : true;
                await initializeTelegramSDK({ mock: outsideTelegram });
                
                const { user, languageCode, colorScheme } = getTelegramContext();
                
                // Apply user preferences
                if (user) {
                    // Only update prefs if they're not already set from loaded data
                    if (AppData.isFirstStart) {
                        AppData.prefs[0] = languageCode === 'ru' ? 0 : 1;
                        AppData.prefs[1] = colorScheme === 'dark' ? 0 : 2;
                    }
                    UserData.Init(user.id,user.username, user.photo_url || 'images/Ui/Guest.jpg');
                    //await isUserHasPremium(user.id);
                    setTimeout(() => setUserName(user.username), 500);
                    setTimeout(() => setUserPhoto(Array.isArray(user.photo_url) ? user.photo_url[0] : user.photo_url), 1000);
                } else {
                    UserData.Init(0,AppData.prefs[0] === 0 ? 'гость' : 'guest', 'images/Ui/Guest.jpg');
                    setTimeout(() => setUserName('guest'), 500);
                    setTimeout(() => setUserPhoto('images/Ui/Guest.jpg'), 500);
                }
                // Load saved data
                await loadData();
                fillEmptyDays();
                setAllHabits();
                setTimeout(() => setLoading(false), 500);
                setTimeout(() => setPage('MainMenu'), 1200);
            } catch (error) {
                console.error('Initialization error:', error);
                // Fallback in case of error
                setTimeout(() => setLoading(false), 500);
                setTimeout(() => setPage('MainMenu'), 1200);
            }
        }
        
        initializeApp();
    }, []);
    
    React.useEffect(() => {
        const themeSubscription = theme$.subscribe(setTheme);
        const langSubscription = lang$.subscribe((lang) => setLang(lang === 'ru' ? 0 : 1));
        return () => {
            themeSubscription.unsubscribe();
            langSubscription.unsubscribe();
        };
    }, []);
    
   return (
    <>
      <div style={styles(theme).container}>
        <img src={theme === 'dark' ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} style={styles(theme).logo} />
        {loading && <div className='spinner'>
            <style>
                {
                    `.spinner {
                        margin-top: 20%;
                        border: 4px solid ${Colors.get('subText', theme)};
                        border-top: 4px solid ${Colors.get('habitCardSkipped', theme)};
                        border-radius: 50%;
                        width: 10vw;
                        height: 10vw;
                        animation: spinner 1.6s linear infinite;
                    }
                    @keyframes spinner {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }`
                }
            </style>
        </div>}
        {!loading && userPhoto && <img src={userPhoto} style={styles(theme).userPhoto} />}
        <h2 style={styles(theme).mainText}>{userName !== '' ? lang === 0 ? `Добро пожаловать в UltyMyLife ${userName}` : `Welcome to UltyMyLife ${userName}` : lang === 0 ? 'Загружаю данные...' : 'Loading data...'}</h2>
      </div>
    </>
   );
}
export default LoadPanel;

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
  },
  logo :
  {
    width: "256px",
    objectFit: "contain",
    marginTop: "40%",
  },
  mainText :
  {
    marginTop: "10%",
    fontSize: "14px",
    color: Colors.get('subText', theme),
  },
  userPhoto :
  {
    border: "4px solid " + Colors.get('border', theme),
    boxShadow: "0px 0px 10px " + Colors.get('shadow', theme),
    width: "10vw",
    height: "10vw",
    borderRadius: "50%",
    objectFit: "cover",
    marginTop: "20%",
  },
})