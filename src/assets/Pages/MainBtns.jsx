import React, { useEffect, useState } from 'react'
import { AppData } from '../StaticClasses/AppData'
import { motion, AnimatePresence } from 'framer-motion'
import Colors from "../StaticClasses/Colors";
import { theme$, setPage$, showPopUpPanel$, lang$, fontSize$ } from '../StaticClasses/HabitsBus';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import KeyBoard from '../Helpers/KeyBoard';
import { playEffects } from '../StaticClasses/Effects';

const popUpSoundPositive = new Audio('Audio/Info.wav');
const popUpSoundNegative = new Audio('Audio/Warn.wav');

const slogans = {
  'MainMenu': [
    'Вся твоя жизнь в одном месте',
    'Your entire life in one place'
  ],
  'HabitsMain': [
    'Вся твоя жизнь в одном месте',
    'Your life in one place'
  ],
  'TrainingMain': [
    'Сила рождается в дисциплине',
    'Strength forged through discipline'
  ],
  'RecoveryMain': [
    'Восстановление — часть роста',
    'Recovery is where growth happens'
  ],
  'MentalMain': [
    'Тренируй разум как тело',
    'Train your mind like your body'
  ],
  'ToDoMain': [
    'План на день — шаг к цели',
    'Today\'s plan, tomorrow\'s progress'
  ],
  'SleepMain': [
    'Глубокий сон — энергия завтра',
    'Deep sleep fuels tomorrow\'s energy'
  ],
  'RobotMain': [
    'Твои данные — твои решения',
    'Your data, your wisdom'
  ],
};

const MainBtns = () => {
    const [theme, setthemeState] = React.useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(0);
    const [page, setLastPage] = useState('MainMenu');
    const pageHasOwnHeader = page === 'MentalRecords' || page.startsWith('Recovery') || page.startsWith('Training');

    React.useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFSize),
            setPage$.subscribe(setLastPage),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    return (
        <>
            <PopUpPanel theme={theme} fSize={fSize} />

            {!pageHasOwnHeader && (
                <div style={styles(theme, fSize).logoContainer}>
                    <UltyLogo theme={theme} page={page} langIndex={langIndex} />
                </div>
            )}

            <KeyBoard />
        </>
    )
}

const PopUpPanel = ({ theme, fSize }) => {
    const [show, setShow] = React.useState({ show: false, header: '', isPositive: true });
    useEffect(() => { const subscription = showPopUpPanel$.subscribe(setShow); return () => subscription.unsubscribe(); }, []);
    useEffect(() => { if (show.show) playEffects(show.isPositive ? popUpSoundPositive : popUpSoundNegative); }, [show]);
    return (
        <AnimatePresence>
            {show.show && (
                <motion.div initial={{ y: '-150%', opacity: 0, scale: 0.8 }} animate={{ y: '130px', opacity: 1, scale: 1 }} exit={{ y: '-150%', opacity: 0, scale: 0.8 }} transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={popUpStyles(theme, show.isPositive, fSize).panel}>
                    <div style={popUpStyles(theme, show.isPositive, fSize).iconContainer}>{show.isPositive ? <CheckCircleOutlineIcon style={popUpStyles(theme, show.isPositive, fSize).icon} /> : <WarningAmberIcon style={popUpStyles(theme, show.isPositive, fSize).icon} />}</div>
                    <h1 style={popUpStyles(theme, show.isPositive, fSize).text}>{show.header}</h1>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const popUpStyles = (theme, isPositive, fSize) => ({
    panel: { position: "fixed", top: "0", left: "5%", zIndex: 9999, width: "90vw", minHeight: "110px", padding: "12px 20px", borderRadius: "40px", border: `1px solid ${isPositive ? '#acaf4c44' : '#F4433644'}`, backgroundColor: Colors.get('simplePanel', theme) + 'F2', backdropFilter: "blur(12px)", boxShadow: `0 10px 40px -10px ${Colors.get('shadow', theme)}`, display: "flex", flexDirection: 'row', alignItems: "center", justifyContent: "flex-start", gap: "15px", boxSizing: 'border-box' },
    text: { textAlign: "left", fontSize: fSize === 0 ? "14px" : "16px", color: Colors.get('mainText', theme), margin: "0", fontWeight: "500", fontFamily: "Segoe UI" },
    iconContainer: { display: "flex", alignItems: "center", justifyContent: "center" },
    icon: { color: isPositive ? '#acaf4cff' : '#F44336', fontSize: '28px' },
});

const styles = (theme, fSize) => ({
    logoContainer: {
        position: "fixed", top: 0, left: 0, width: "100vw", height: "13vh", minHeight: "100px",
        backgroundColor: Colors.get('background', theme), backdropFilter: "blur(15px)",
        borderBottom: `1px solid ${Colors.get('border', theme)}`,
        display: "flex", justifyContent: "center",
        alignItems: "center",
        padding: "0 15px 8px 15px", boxSizing: "border-box", zIndex: 1000,
    },
});

export default MainBtns


const UltyLogo = ({ theme = 'dark', page, langIndex }) => {
  const getPageSloganKey = (pageName) => {
    if (!pageName) return 'MainMenu';
    if (pageName.startsWith('Habit')) return 'HabitsMain';
    if (pageName.startsWith('Training')) return 'TrainingMain';
    if (pageName.startsWith('Recovery')) return 'RecoveryMain';
    if (pageName.startsWith('Mental')) return 'MentalMain';
    if (pageName.startsWith('Sleep')) return 'SleepMain';
    if (pageName.startsWith('ToDo')) return 'ToDoMain';
    if (pageName.startsWith('Robot')) return 'RobotMain';
    if (pageName.startsWith('Info')) return 'MainMenu';
    return 'MainMenu';
  };

  const sloganKey = getPageSloganKey(page);
  const currentSlogan = slogans[sloganKey]?.[langIndex] || slogans['MainMenu'][langIndex];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      padding: '10px 20px 16px',
      boxSizing: 'border-box',
      background: 'transparent',
      textAlign: 'center'
    }}>
      <div style={{
        color: Colors.get('mainText', theme),
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: 0,
        lineHeight: 1.05,
        opacity: 0.86,
      }}>
        UltyMyLife
      </div>
      <p style={{
        margin: '5px 0 0',
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.16em',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: Colors.get('subText', theme),
        transition: 'color 0.5s ease',
        opacity: 1,
        textTransform: 'none',
      }}>
        {currentSlogan}
      </p>
    </div>
  );
};
