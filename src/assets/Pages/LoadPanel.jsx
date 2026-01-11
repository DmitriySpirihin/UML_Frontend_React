import { useEffect , useState } from 'react';
import { AppData, UserData ,fillEmptyDays} from '../StaticClasses/AppData';
import { theme$, lang$, setPage} from '../StaticClasses/HabitsBus'
import Colors from '../StaticClasses/Colors'
import { setAllHabits } from '../Classes/Habit';
import { initDBandCloud,loadData } from '../StaticClasses/SaveHelper';
import { initializeTelegramSDK, getTelegramContext } from '../StaticClasses/SaveHelper';
import { isUserHasPremium } from '../StaticClasses/NotificationsManager';

function LoadPanel() {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState(0);
  const [userName, setUserName] = useState('Guest');
  const [userPhoto, setUserPhoto] = useState('images/Ui/Guest.jpg');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeApp() {
      try {
        // 1. Initialize core systems
        await initDBandCloud();
        const outsideTelegram = typeof window !== 'undefined' ? !window.Telegram?.WebApp : true;
        await initializeTelegramSDK({ mock: outsideTelegram });

        const { user, languageCode, colorScheme } = getTelegramContext();

        // 2. Set user data
        if (user) {
          if (AppData.isFirstStart) {
            AppData.prefs[0] = languageCode === 'ru' ? 0 : 1;
            AppData.prefs[1] = colorScheme === 'dark' ? 0 : 2;
          }
          UserData.Init(user.id, user.username, user.photo_url || 'images/Ui/Guest.jpg');
          setUserName(user.username);
          setUserPhoto(Array.isArray(user.photo_url) ? user.photo_url[0] : user.photo_url);
        } else {
          UserData.Init(0, AppData.prefs[0] === 0 ? 'гость' : 'guest', 'images/Ui/Guest.jpg');
          setUserName(AppData.prefs[0] === 0 ? 'гость' : 'guest');
          setUserPhoto('images/Ui/Guest.jpg');
        }

        // 3. Load saved app data
        await loadData();
        fillEmptyDays();
        setAllHabits();

        // ✅ 4. CHECK PREMIUM STATUS BEFORE SHOWING MAIN UI
        if (UserData.id !== 0) {
          await isUserHasPremium(UserData.id);
        }

        // ✅ 5. Only now show the app
        setLoading(false);
        setTimeout(() => setPage('MainMenu'), 300); // short fade-in

      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
        setTimeout(() => setPage('MainMenu'), 300);
      }
    }

    initializeApp();
  }, []);

  // Subscribe to theme/lang changes
  useEffect(() => {
    const themeSub = theme$.subscribe(setTheme);
    const langSub = lang$.subscribe((code) => setLang(code === 'ru' ? 0 : 1));

    return () => {
      themeSub.unsubscribe();
      langSub.unsubscribe();
    };
  }, []);

  return (
    <div style={styles(theme).container}>
      <img 
        src={theme === 'dark' ? 'images/Ui/Main_Dark.png' : 'images/Ui/Main_Light.png'} 
        style={styles(theme).logo} 
        alt="UltyMyLife"
      />
      
      {loading ? (
        <div className="spinner">
          <style>{`
            .spinner {
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
            }
          `}</style>
        </div>
      ) : (
        userPhoto && <img src={userPhoto} style={styles(theme).userPhoto} alt="User" />
      )}

      <h2 style={styles(theme).mainText}>
        {loading 
          ? (lang === 0 ? 'Загружаю данные...' : 'Loading data...')
          : (lang === 0 
              ? `Добро пожаловать в UltyMyLife, ${userName}!`
              : `Welcome to UltyMyLife, ${userName}!`)
        }
      </h2>
    </div>
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