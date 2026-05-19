import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData, fillEmptyDays } from '../StaticClasses/AppData';
import { theme$, lang$, setPage, setTheme, setLang as setAppLang } from '../StaticClasses/HabitsBus';
import Colors from '../StaticClasses/Colors';
import { setAllHabits } from '../Classes/Habit';
import { initDBandCloud, isNewUserPreviewMode, loadData } from '../StaticClasses/SaveHelper';
import { initializeTelegramSDK, getTelegramContext } from '../StaticClasses/SaveHelper';
import { isUserHasPremium ,sendXp,getFriendsList} from '../StaticClasses/NotificationsManager';
import { applyLocalTestPremium } from '../StaticClasses/PremiumTestHelper';
import { calculateStats } from '../Helpers/UserStats.js';

const MotionDiv = motion.div;
const MotionImg = motion.img;
const LOAD_ACCENT = '#8FA6C8';

function getPreviewLanguageIndex() {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const requestedLang = (params.get('lang') || params.get('language') || '').toLowerCase();

  if (['en', 'eng', 'english', '1'].includes(requestedLang)) return 1;
  if (['ru', 'rus', 'russian', '0'].includes(requestedLang)) return 0;
  return null;
}

function LoadPanel() {
  const [theme, setThemeState] = useState('dark');
  const [lang, setLang] = useState(0);
  const [userName, setUserName] = useState('Guest');
  const [userPhoto, setUserPhoto] = useState('images/Ui/Guest.jpg');
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function initializeApp() {
    try {
      const newUserPreview = isNewUserPreviewMode();
      const previewLangIndex = newUserPreview ? getPreviewLanguageIndex() : null;
      if (previewLangIndex !== null) {
        AppData.prefs[0] = previewLangIndex;
        setLang(previewLangIndex);
        setAppLang(previewLangIndex === 0 ? 'ru' : 'en');
      }
      await initDBandCloud();
      const outsideTelegram = typeof window !== 'undefined' ? !window.Telegram?.WebApp : true;
      await initializeTelegramSDK({ mock: outsideTelegram });

      const tgContext = getTelegramContext(); 
      const { user, start_param } = tgContext;

      if (user) {
        if (AppData.isFirstStart) {
         // AppData.prefs[0] = languageCode.startsWith 'ru' ? 0 : 1;
          AppData.prefs[1] = 0;
          setTheme('dark');
        }
        UserData.Init(user.id, user.username, user.photo_url || 'images/Ui/Guest.jpg');
        setUserName(user.username);
        setUserPhoto(Array.isArray(user.photo_url) ? user.photo_url[0] : user.photo_url);

        // --- Referral Logic ---
        const referrerId = start_param; 
        if (referrerId && !isNaN(referrerId) && Number(referrerId) !== user.id) {
          const refKey = `ref_processed_${referrerId}`;
          if (!localStorage.getItem(refKey)) {
            try {
              await fetch('/api/record-referral', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ referrerId: Number(referrerId), newUserId: user.id }),
              });
              localStorage.setItem(refKey, '1');
            } catch (err) { console.warn('Referral submission failed:', err); }
          }
        }
      } else {
        UserData.Init(0, AppData.prefs[0] === 0 ? 'гость' : 'guest', 'images/Ui/Guest.jpg');
        setUserName(AppData.prefs[0] === 0 ? 'гость' : 'guest');
        setUserPhoto('images/Ui/Guest.jpg');
      }

      if (!newUserPreview) {
        await loadData();
      } else {
        AppData.pData = { filled: false, age: 20, gender: 0, height: 180, weight: 70, goal: 1, activityLevel: 1 };
        AppData.profileOnboardingShown = false;
        AppData.profileNicknameMode = 'telegram';
        AppData.profileCustomNickname = '';
        AppData.profileDiscoverySource = '';
        AppData.profilePreferredSections = [];
      }
      if (AppData.profileNicknameMode === 'custom' && AppData.profileCustomNickname?.trim()) {
        UserData.name = AppData.profileCustomNickname.trim();
        setUserName(UserData.name);
      }
      if (AppData.profileAvatarPhoto) {
        UserData.photo = AppData.profileAvatarPhoto;
        setUserPhoto(AppData.profileAvatarPhoto);
      }
      const hasLocalTestPremium = applyLocalTestPremium();
      fillEmptyDays();
      setAllHabits();

      // --- SYNC & SOCIAL LOGIC ---
      if (UserData.id && UserData.id !== 0) { 
        // 1. Check Premium
        if (!hasLocalTestPremium) {
          await isUserHasPremium(UserData.id);
        }
        
        const currentStats = calculateStats(); // Helper to get the XP values
        await sendXp(currentStats.level.xp, currentStats.level.current);
        
        await getFriendsList(); 
      }

      setLoading(false);
      const nextPage = newUserPreview || (!AppData.pData?.filled && !AppData.profileOnboardingShown) ? 'ProfileOnboarding' : 'MainMenu';
      setTimeout(() => setPage(nextPage), 1200);

    } catch (error) {
      console.error('Initialization error:', error);
      setLoading(false);
      const nextPage = isNewUserPreviewMode() || (!AppData.pData?.filled && !AppData.profileOnboardingShown) ? 'ProfileOnboarding' : 'MainMenu';
      setTimeout(() => setPage(nextPage), 1200);
    }
  }
  initializeApp();
}, []);

  useEffect(() => {
    const themeSub = theme$.subscribe(setThemeState);
    const langSub = lang$.subscribe((code) => setLang(code === 'ru' ? 0 : 1));
    return () => { themeSub.unsubscribe(); langSub.unsubscribe(); };
  }, []);

  return (
    <div style={styles(theme).container}>
      {/* Animated Background Overlay */}
      <div style={styles(theme).bgOverlay} />

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={styles(theme).content}
      >
        <MotionImg 
          src={'images/Ui/Main_Dark.png'} 
          style={styles(theme).logo} 
          alt="UltyMyLife"
          animate={{ scale: [0.95, 1, 0.95] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div style={styles(theme).loaderSection}>
          <AnimatePresence mode="wait">
            {loading ? (
              <MotionDiv
                key="loader"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                style={styles(theme).pulseContainer}
              >
                <div style={styles(theme).ring} />
                <img src={userPhoto} style={styles(theme).loadingPhoto} alt="Loading..." />
              </MotionDiv>
            ) : (
              <MotionDiv
                key="user"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={styles(theme).photoWrapper}
              >
                <img src={userPhoto} style={styles(theme).userPhoto} alt="User" />
                <MotionDiv 
                   initial={{ opacity: 0 }} 
                   animate={{ opacity: 1 }} 
                   style={styles(theme).premiumBadge} 
                />
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>

        <MotionDiv 
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={styles(theme).textContainer}
        >
          <h2 style={styles(theme).mainText}>
            {loading 
              ? (lang === 0 ? 'Синхронизация...' : 'Synchronizing...')
              : (lang === 0 
                  ? `Рады видеть, ${userName}`
                  : `Welcome back, ${userName}`)
            }
          </h2>
          <div style={styles(theme).progressBar}>
            <MotionDiv 
              initial={{ width: "0%" }}
              animate={{ width: loading ? "70%" : "100%" }}
              style={styles(theme).progressFill}
            />
          </div>
        </MotionDiv>
      </MotionDiv>

      {/* Modern Spinner CSS */}
      <style>{`
        @keyframes custom-pulse {
	          0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${LOAD_ACCENT}22; }
	          70% { transform: scale(1); box-shadow: 0 0 0 18px ${LOAD_ACCENT}00; }
	          100% { transform: scale(0.95); box-shadow: 0 0 0 0 ${LOAD_ACCENT}00; }
        }
      `}</style>
    </div>
  );
}

export default LoadPanel;

const styles = (theme) => ({
  container: {
    backgroundColor: Colors.get('background', theme),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    position: "relative",
  },
  bgOverlay: {
    position: "absolute",
    inset: 0,
    background: theme === 'dark' 
	      ? "radial-gradient(circle at 50% 44%, rgba(143,166,200,0.18) 0%, rgba(18,21,25,0.92) 48%, #0c0c10 100%)"
	      : "radial-gradient(circle at 50% 44%, rgba(143,166,200,0.16) 0%, #fff 52%, #e6e8ec 100%)",
	    opacity: 0.72,
    zIndex: 1
  },
  content: {
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    paddingTop: "20vh"
  },
  logo: {
    width: "220px",
    filter: `drop-shadow(0 0 20px ${Colors.get('shadow', theme)}88)`,
    marginBottom: "8vh"
  },
  loaderSection: {
    height: "120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4vh"
  },
  pulseContainer: {
    position: "relative",
    width: "80px",
    height: "80px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  ring: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: "50%",
	    border: `2px solid ${LOAD_ACCENT}`,
    animation: "custom-pulse 2s infinite ease-in-out"
  },
  loadingPhoto: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    opacity: 0.5,
    filter: "grayscale(1)"
  },
  photoWrapper: {
    position: "relative"
  },
  userPhoto: {
	    border: `3px solid ${LOAD_ACCENT}`,
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: `0 10px 30px ${Colors.get('shadow', theme)}`,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px"
  },
  mainText: {
    fontSize: "18px",
    fontWeight: "600",
    color: Colors.get('mainText', theme),
    fontFamily: 'inherit',
    textAlign: "center",
    letterSpacing: "0.5px"
  },
  progressBar: {
    width: "120px",
    height: "4px",
    backgroundColor: Colors.get('border', theme),
    borderRadius: "10px",
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
	    backgroundColor: LOAD_ACCENT,
    borderRadius: "10px",
  }
});

// Helper to avoid code duplication
