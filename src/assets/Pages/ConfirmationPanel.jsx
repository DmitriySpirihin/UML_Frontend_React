import React from 'react'
import Colors from 'src/assets/StaticClasses/Colors.js'
import { theme$ , lang$,fontSize$} from 'assets/StaticClasses/HabitsBus'
import { setConfirmationPanel, header$, confirmationAction$, setConfirmationAction } from 'assets/StaticClasses/HabitsBus'
import { removeHabitFn , currentId} from 'assets/Pages/HabitsPages/HabitsMain'
import {AppData} from 'assets/StaticClasses/AppData'
import {FaExclamationTriangle} from 'react-icons/fa'
import {MdClose,MdDone} from 'react-icons/md'
import { motion } from 'framer-motion'

const CONFIRM_ACCENT = {
    hue: '#7FC8B8',
    soft: 'rgba(127,200,184,0.14)',
    ring: 'rgba(127,200,184,0.28)',
    glow: 'rgba(127,200,184,0.18)'
};

function confirmAction(){
    const action = confirmationAction$.value;
    if (typeof action === 'function') action();
    else removeHabitFn(currentId);
}

function triggerHaptic(){
    if (AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

const ConfirmationPanel = () => {
    // states
    const [theme, setthemeState] = React.useState('dark');
    const [lang, setLang] = React.useState('ru');
    const [header, setHeader] = React.useState('');
    const [fSize,setFontSize] = React.useState(0);
    // subscriptions
    React.useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);  
        const subscription2 = fontSize$.subscribe(setFontSize);
        return () => {
          subscription.unsubscribe();
          subscription2.unsubscribe();
        };
    }, []);
    React.useEffect(() => {
        const subscription = lang$.subscribe(setLang);  
        return () => subscription.unsubscribe();
    }, []); 
    React.useEffect(() => {
        const subscription = header$.subscribe(setHeader);  
        return () => subscription.unsubscribe();
    }, []); 
    const closePanel = () => {
        setConfirmationAction(null);
        setConfirmationPanel(false);
        triggerHaptic();
    };
    const approvePanel = () => {
        confirmAction();
        setConfirmationAction(null);
        setConfirmationPanel(false);
        triggerHaptic();
    };
    return (
        <div style={styles(theme).container}>
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 14 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 14 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={styles(theme).panel}
            >
                <div style={styles(theme).iconWrap}>
                    <FaExclamationTriangle style={styles(theme).warningIcon}/>
                </div>
                <div style={styles(theme,fSize).text}>{header}</div>
                <div style={styles(theme).buttonsRow}>
                  <motion.button type="button" whileTap={{ scale: 0.96 }} style={styles(theme).button(false)} onClick={closePanel}>
                    <MdClose size={20}/>
                    <span>{lang === 'ru' ? 'Отмена' : 'Cancel'}</span>
                  </motion.button>  
                  <motion.button type="button" whileTap={{ scale: 0.96 }} style={styles(theme).button(true)} onClick={approvePanel}>
                    <MdDone size={20}/>
                    <span>{lang === 'ru' ? 'Да' : 'Yes'}</span>
                  </motion.button>  
                </div>
            </motion.div>
        </div>
    )
}

export default ConfirmationPanel


const styles = (theme,fSize) =>
({
    container :
   {
     position: "fixed",
     display: "flex",
     top: "0",
     left: "0",
     right: "0",
     bottom: "0",
     flexDirection: "column",
     justifyContent: "center",
     alignItems: "center",
     height: "100vh",
     width: "100vw",
     backgroundColor: "rgba(0, 0, 0, 0.62)",
     backdropFilter: 'blur(8px)',
     WebkitBackdropFilter: 'blur(8px)',
     zIndex: 9000,
     padding: '20px',
     boxSizing: 'border-box'
  },
  panel :
  {
    display: "flex",
    flexDirection: "column",
    width: "90%",
    maxWidth: "380px",
    minHeight: "220px",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "28px",
    border: theme === 'light' || theme === 'speciallight' ? '1px solid rgba(15,23,42,0.08)' : `1px solid ${CONFIRM_ACCENT.ring}`,
    background: theme === 'light' || theme === 'speciallight'
        ? `radial-gradient(260px 180px at 90% 0%, ${CONFIRM_ACCENT.soft} 0%, transparent 68%), rgba(255,255,255,0.96)`
        : `radial-gradient(260px 180px at 90% 0%, ${CONFIRM_ACCENT.soft} 0%, transparent 68%), rgba(20,23,25,0.96)`,
    boxShadow: theme === 'light' || theme === 'speciallight'
        ? '0 24px 70px rgba(0,0,0,0.18), 0 1px 0 rgba(255,255,255,0.72) inset'
        : '0 28px 80px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.055) inset',
    overflow : 'hidden',
    padding: '24px',
    gap: '18px',
    boxSizing: 'border-box'
  },
  text :
  {
    textAlign: "center",
    fontSize: fSize === 0 ? "17px" : "19px",
    lineHeight: 1.35,
    fontWeight: 900,
    color: Colors.get('mainText', theme),
    width: '100%'
  },
  buttonsRow: {
    width: '100%',
    display: 'flex',
    gap: '12px',
    marginTop: '2px'
  },
  button : (primary) =>
  ({
    flex: 1,
    minHeight: "46px",
    borderRadius: "16px",
    border: primary ? `1px solid ${CONFIRM_ACCENT.ring}` : `1px solid ${theme === 'light' || theme === 'speciallight' ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`,
    background: primary ? CONFIRM_ACCENT.soft : (theme === 'light' || theme === 'speciallight' ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.055)'),
    color: primary ? CONFIRM_ACCENT.hue : Colors.get('subText', theme),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: 900,
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    padding: 0,
    WebkitTapHighlightColor: 'transparent'
  }),
  iconWrap: {
    width: '54px',
    height: '54px',
    borderRadius: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: CONFIRM_ACCENT.hue,
    background: CONFIRM_ACCENT.soft,
    border: `1px solid ${CONFIRM_ACCENT.ring}`,
    boxShadow: `0 0 22px ${CONFIRM_ACCENT.glow}`
  },
  warningIcon: {
    width: "22px",
    height: "22px"
  }
})
