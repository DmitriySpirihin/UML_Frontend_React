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
import { FaUser } from 'react-icons/fa';

const MotionDiv = motion.div;
const LOAD_ACCENT = '#B7F3FF';
const LOAD_SLEEP_ACCENT = '#7C6CFF';
const GUEST_PHOTO = 'images/Ui/Guest.jpg';

function getDisplayName(user, lang) {
  if (!user) return lang === 0 ? 'гость' : 'guest';
  return user.first_name || user.username || (lang === 0 ? 'гость' : 'guest');
}

function waitForMinimumLoad(startedAt, minMs = 850) {
  const remaining = minMs - (Date.now() - startedAt);
  return remaining > 0 ? new Promise(resolve => setTimeout(resolve, remaining)) : Promise.resolve();
}

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
  const [userName, setUserName] = useState('guest');
  const [userPhoto, setUserPhoto] = useState(GUEST_PHOTO);
  const [loading, setLoading] = useState(true);
  const avatarIsFallback = !userPhoto || userPhoto === GUEST_PHOTO;

useEffect(() => {
  async function initializeApp() {
    const startedAt = Date.now();
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
        const displayName = getDisplayName(user, AppData.prefs[0]);
        const photoUrl = Array.isArray(user.photo_url) ? user.photo_url[0] : user.photo_url;
        UserData.Init(user.id, displayName, photoUrl || GUEST_PHOTO);
        setUserName(displayName);
        setUserPhoto(photoUrl || GUEST_PHOTO);

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
        UserData.Init(0, AppData.prefs[0] === 0 ? 'гость' : 'guest', GUEST_PHOTO);
        setUserName(AppData.prefs[0] === 0 ? 'гость' : 'guest');
        setUserPhoto(GUEST_PHOTO);
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

      await waitForMinimumLoad(startedAt);
      setLoading(false);
      const nextPage = newUserPreview || (!AppData.pData?.filled && !AppData.profileOnboardingShown) ? 'ProfileOnboarding' : 'MainMenu';
      setTimeout(() => setPage(nextPage), 1200);

    } catch (error) {
      console.error('Initialization error:', error);
      await waitForMinimumLoad(startedAt);
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
      <div style={styles(theme).bgOverlay} />
      <div style={styles(theme).grain} />
      <MotionDiv
        aria-hidden="true"
        style={styles(theme).haloTop}
        animate={{ opacity: [0.52, 0.82, 0.52], scale: [1, 1.04, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      <MotionDiv
        aria-hidden="true"
        style={styles(theme).haloBottom}
        animate={{ opacity: [0.38, 0.7, 0.38], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />

      <MotionDiv 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={styles(theme).content}
      >
        <div style={styles(theme).brand}>
          <div style={styles(theme).brandTitle}>UltyMyLife</div>
          <div style={styles(theme).brandSubtitle}>
            {lang === 0 ? 'Вся твоя жизнь в одном месте' : 'Your life in one place'}
          </div>
        </div>

        <MotionDiv
          style={styles(theme).glassCard}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.12, ease: "easeOut" }}
        >
        <div style={styles(theme).loaderSection}>
          <AnimatePresence mode="wait">
            {loading ? (
              <MotionDiv
                key="loader"
                initial={{ scale: 0.84, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                style={styles(theme).pulseContainer}
              >
                <MotionDiv
                  style={styles(theme).orbit}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
                />
                <MotionDiv
                  style={styles(theme).ring}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.72, 1, 0.72] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                {avatarIsFallback ? (
                  <div style={styles(theme).loadingPhotoFallback} aria-label="Loading user">
                    <FaUser size={34} />
                  </div>
                ) : (
                  <img src={userPhoto} style={styles(theme).loadingPhoto} alt="Loading..." />
                )}
              </MotionDiv>
            ) : (
              <MotionDiv
                key="user"
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                style={styles(theme).photoWrapper}
              >
                <MotionDiv
                  style={styles(theme).photoGlow}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.55, 0.9, 0.55] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                />
                {avatarIsFallback ? (
                  <div style={styles(theme).userPhotoFallback} aria-label="User">
                    <FaUser size={40} />
                  </div>
                ) : (
                  <img src={userPhoto} style={styles(theme).userPhoto} alt="User" />
                )}
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
          animate={{ opacity: loading ? [0.76, 1, 0.76] : 1 }}
          transition={{ duration: 2.2, repeat: loading ? Infinity : 0 }}
          style={styles(theme).textContainer}
        >
          <div style={styles(theme).statusPill}>
            <span style={styles(theme).statusDot} />
            {loading
              ? (lang === 0 ? 'Загрузка пользователя' : 'Loading user')
              : (lang === 0 ? 'Профиль готов' : 'Profile ready')}
          </div>
          <h2 style={styles(theme).mainText}>
            {loading 
              ? (lang === 0 ? 'Подготавливаем профиль' : 'Preparing your profile')
              : (lang === 0 
                  ? `Привет, ${userName}`
                  : `Welcome back, ${userName}`)
            }
          </h2>
          {loading && (
            <p style={styles(theme).subText}>
              {lang === 0 ? 'Синхронизируем данные и настраиваем пространство.' : 'Syncing data and setting up your space.'}
            </p>
          )}
          <div style={styles(theme).progressBar}>
            <MotionDiv 
              initial={{ width: "0%" }}
              animate={{ width: loading ? "70%" : "100%" }}
              style={styles(theme).progressFill}
            />
          </div>
        </MotionDiv>
        </MotionDiv>
      </MotionDiv>

      <style>{`
        @keyframes custom-pulse {
	          0% { transform: scale(0.95); box-shadow: 0 0 0 0 ${LOAD_ACCENT}26; }
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
    background: theme === 'light' || theme === 'speciallight'
      ? `radial-gradient(900px 450px at 80% -10%, rgba(85,221,235,0.08), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(124,108,255,0.08), transparent 58%), #F4F5F7`
      : theme === 'coffee' || theme === 'specialcoffee'
        ? `radial-gradient(900px 460px at 82% -8%, rgba(200,135,74,0.16), transparent 58%), radial-gradient(760px 420px at -12% 42%, rgba(124,108,255,0.08), transparent 60%), linear-gradient(180deg, #271A13 0%, #1A120E 47%, #120C09 100%)`
        : `radial-gradient(900px 460px at 82% -8%, rgba(85,221,235,0.13), transparent 58%), radial-gradient(760px 420px at -12% 42%, rgba(124,108,255,0.11), transparent 60%), linear-gradient(180deg, #18232B 0%, #11171C 46%, #0F1418 100%)`,
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
    background: theme === 'light' || theme === 'speciallight'
      ? "linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.02))"
      : "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.12))",
    opacity: 0.9,
    zIndex: 1
  },
  grain: {
    position: "absolute",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)",
    backgroundSize: "42px 42px",
    maskImage: "linear-gradient(180deg, rgba(0,0,0,0.16), transparent 72%)",
    pointerEvents: "none",
    zIndex: 1
  },
  haloTop: {
    position: "absolute",
    width: 260,
    height: 260,
    top: "8vh",
    right: "-82px",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${LOAD_ACCENT}22 0%, ${LOAD_ACCENT}00 70%)`,
    filter: "blur(2px)",
    zIndex: 1
  },
  haloBottom: {
    position: "absolute",
    width: 280,
    height: 280,
    left: "-110px",
    bottom: "4vh",
    borderRadius: "50%",
    background: `radial-gradient(circle, ${LOAD_SLEEP_ACCENT}20 0%, ${LOAD_SLEEP_ACCENT}00 68%)`,
    filter: "blur(2px)",
    zIndex: 1
  },
  content: {
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
    minHeight: "100%",
    boxSizing: "border-box",
    padding: "calc(env(safe-area-inset-top, 0px) + 34px) 20px calc(env(safe-area-inset-bottom, 0px) + 28px)",
    justifyContent: "center"
  },
  brand: {
    position: "absolute",
    top: "calc(env(safe-area-inset-top, 0px) + 24px)",
    left: 20,
    right: 20,
    textAlign: "center"
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 820,
    color: Colors.get('mainText', theme),
    lineHeight: 1.05,
    opacity: 0.92
  },
  brandSubtitle: {
    marginTop: 5,
    fontSize: 9,
    fontWeight: 600,
    color: Colors.get('subText', theme),
    textTransform: "uppercase"
  },
  glassCard: {
    width: "min(82vw, 330px)",
    minHeight: 318,
    boxSizing: "border-box",
    borderRadius: "72px",
    padding: "30px 24px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: theme === 'light' || theme === 'speciallight'
      ? "radial-gradient(130% 90% at 50% 0%, rgba(255,255,255,0.84), rgba(255,255,255,0.46) 58%, rgba(255,255,255,0.26))"
      : theme === 'coffee' || theme === 'specialcoffee'
        ? "radial-gradient(130% 92% at 50% 0%, rgba(62,42,31,0.78), rgba(34,23,17,0.58) 58%, rgba(18,12,9,0.34))"
        : "radial-gradient(130% 92% at 50% 0%, rgba(38,54,64,0.72), rgba(18,27,34,0.55) 58%, rgba(10,15,20,0.34))",
    border: theme === 'light' || theme === 'speciallight'
      ? "1px solid rgba(255,255,255,0.44)"
      : "1px solid rgba(183,243,255,0.075)",
    boxShadow: theme === 'light' || theme === 'speciallight'
      ? "0 28px 64px rgba(15,23,42,0.10), 0 1px 0 rgba(255,255,255,0.86) inset, 0 -20px 60px rgba(85,221,235,0.06) inset"
      : "0 32px 86px rgba(0,0,0,0.42), 0 1px 0 rgba(255,255,255,0.08) inset, 0 -24px 70px rgba(183,243,255,0.045) inset",
    backdropFilter: "blur(28px) saturate(165%)",
    WebkitBackdropFilter: "blur(28px) saturate(165%)",
    position: "relative",
    overflow: "hidden"
  },
  loaderSection: {
    height: "122px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18
  },
  pulseContainer: {
    position: "relative",
    width: "112px",
    height: "112px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  orbit: {
    position: "absolute",
    inset: 0,
    borderRadius: "50%",
    background: `conic-gradient(from 90deg, ${LOAD_ACCENT}00, ${LOAD_ACCENT}cc, ${LOAD_SLEEP_ACCENT}66, ${LOAD_ACCENT}00)`,
    maskImage: "radial-gradient(circle, transparent 58%, #000 60%)",
    WebkitMaskImage: "radial-gradient(circle, transparent 58%, #000 60%)"
  },
  ring: {
    position: "absolute",
    width: "86%",
    height: "86%",
    borderRadius: "50%",
    border: `1px solid ${LOAD_ACCENT}66`,
    boxShadow: `0 0 36px ${LOAD_ACCENT}26 inset`
  },
  loadingPhoto: {
    width: "78px",
    height: "78px",
    borderRadius: "50%",
    objectFit: "cover",
    opacity: 0.72,
    filter: "saturate(0.78)",
    border: `2px solid rgba(255,255,255,0.18)`,
    boxShadow: `0 16px 38px ${Colors.get('shadow', theme)}`
  },
  loadingPhotoFallback: {
    width: "78px",
    height: "78px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme === 'light' || theme === 'speciallight' ? "#335566" : LOAD_ACCENT,
    background: theme === 'light' || theme === 'speciallight'
      ? "linear-gradient(145deg, rgba(255,255,255,0.92), rgba(231,239,244,0.72))"
      : "linear-gradient(145deg, rgba(183,243,255,0.18), rgba(124,108,255,0.12))",
    border: `2px solid rgba(255,255,255,0.18)`,
    boxShadow: `0 16px 38px ${Colors.get('shadow', theme)}`,
    position: "relative",
    zIndex: 2
  },
  photoWrapper: {
    position: "relative",
    width: 112,
    height: 112,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  photoGlow: {
    position: "absolute",
    inset: 6,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${LOAD_ACCENT}35, ${LOAD_ACCENT}00 72%)`,
    filter: "blur(2px)"
  },
  userPhoto: {
    border: `2px solid ${LOAD_ACCENT}cc`,
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    objectFit: "cover",
    boxShadow: `0 18px 44px ${Colors.get('shadow', theme)}, 0 0 34px ${LOAD_ACCENT}24`,
    position: "relative",
    zIndex: 2
  },
  userPhotoFallback: {
    border: `2px solid ${LOAD_ACCENT}cc`,
    width: "92px",
    height: "92px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: theme === 'light' || theme === 'speciallight' ? "#335566" : LOAD_ACCENT,
    background: theme === 'light' || theme === 'speciallight'
      ? "linear-gradient(145deg, rgba(255,255,255,0.96), rgba(232,241,247,0.82))"
      : "linear-gradient(145deg, rgba(183,243,255,0.20), rgba(124,108,255,0.12))",
    boxShadow: `0 18px 44px ${Colors.get('shadow', theme)}, 0 0 34px ${LOAD_ACCENT}24`,
    position: "relative",
    zIndex: 2
  },
  premiumBadge: {
    position: "absolute",
    right: 8,
    bottom: 10,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: `linear-gradient(135deg, #FFFFFF, ${LOAD_ACCENT})`,
    border: `2px solid ${theme === 'light' || theme === 'speciallight' ? '#FFFFFF' : '#18232B'}`,
    boxShadow: `0 0 18px ${LOAD_ACCENT}88`,
    zIndex: 3
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    width: "100%"
  },
  statusPill: {
    minHeight: 30,
    padding: "0 12px",
    borderRadius: 999,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: LOAD_ACCENT,
    background: `${LOAD_ACCENT}14`,
    border: `1px solid ${LOAD_ACCENT}28`,
    fontSize: 11,
    fontWeight: 850,
    textTransform: "uppercase"
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: LOAD_ACCENT,
    boxShadow: `0 0 14px ${LOAD_ACCENT}`
  },
  mainText: {
    margin: 0,
    fontSize: "25px",
    fontWeight: "900",
    color: Colors.get('mainText', theme),
    fontFamily: 'inherit',
    textAlign: "center",
    lineHeight: 1.08,
    maxWidth: "100%",
    overflowWrap: "anywhere"
  },
  subText: {
    margin: "0 0 4px",
    maxWidth: 260,
    color: Colors.get('subText', theme),
    fontSize: 13,
    fontWeight: 650,
    lineHeight: 1.42,
    textAlign: "center"
  },
  progressBar: {
    width: "100%",
    maxWidth: "210px",
    height: "5px",
    backgroundColor: theme === 'light' || theme === 'speciallight' ? "rgba(15,23,42,0.08)" : "rgba(255,255,255,0.08)",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: theme === 'light' || theme === 'speciallight' ? "none" : "0 0 18px rgba(0,0,0,0.28) inset"
  },
  progressFill: {
    height: "100%",
    background: `linear-gradient(90deg, ${LOAD_ACCENT}, ${LOAD_SLEEP_ACCENT})`,
    borderRadius: "10px",
    boxShadow: `0 0 22px ${LOAD_ACCENT}66`
  }
});
