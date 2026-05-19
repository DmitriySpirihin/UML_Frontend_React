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

const popUpStyles = (theme, isPositive, fSize) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const accent = isPositive ? '#B7F3FF' : '#FF8A7A';
    const accentRgb = isPositive ? '183,243,255' : '255,138,122';
    const text = isLight ? '#162631' : '#F4FCFF';
    const subBorder = isLight ? 'rgba(15,23,42,0.10)' : 'rgba(190,220,235,0.16)';

    return {
        panel: {
            position: "fixed",
            top: "0",
            left: "5%",
            zIndex: 9999,
            width: "90vw",
            minHeight: "106px",
            padding: "14px 20px",
            borderRadius: "38px",
            border: `1px solid rgba(${accentRgb},0.34)`,
            background: isLight
                ? `radial-gradient(260px 120px at 16% 12%, rgba(${accentRgb},0.24), transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.66), rgba(246,251,253,0.34))`
                : `radial-gradient(280px 130px at 16% 10%, rgba(${accentRgb},0.20), transparent 72%), linear-gradient(145deg, rgba(26,42,52,0.66), rgba(8,14,20,0.52))`,
            backdropFilter: "blur(28px) saturate(175%)",
            WebkitBackdropFilter: "blur(28px) saturate(175%)",
            boxShadow: isLight
                ? `0 1px 0 rgba(255,255,255,0.84) inset, 0 22px 48px -30px rgba(${accentRgb},0.45), 0 18px 46px -34px rgba(15,23,42,0.35)`
                : `0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 54px -32px rgba(${accentRgb},0.42), 0 18px 48px -28px rgba(0,0,0,0.82)`,
            display: "flex",
            flexDirection: 'row',
            alignItems: "center",
            justifyContent: "flex-start",
            gap: "16px",
            boxSizing: 'border-box',
            overflow: 'hidden'
        },
        text: {
            textAlign: "left",
            fontSize: fSize === 0 ? "14px" : "16px",
            color: text,
            margin: "0",
            fontWeight: "760",
            lineHeight: 1.25,
            fontFamily: 'inherit',
            textShadow: isLight ? 'none' : '0 1px 10px rgba(0,0,0,0.32)'
        },
        iconContainer: {
            width: '42px',
            height: '42px',
            borderRadius: '16px',
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: accent,
            background: `rgba(${accentRgb},0.13)`,
            border: `1px solid ${subBorder}`,
            boxShadow: `0 1px 0 rgba(255,255,255,0.10) inset, 0 12px 24px -20px rgba(${accentRgb},0.70)`
        },
        icon: { color: accent, fontSize: '27px' },
    };
};

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
        fontFamily: 'inherit',
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
