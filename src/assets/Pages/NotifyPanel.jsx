import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Анимации
import { AppData, UserData } from '../StaticClasses/AppData.js';
import { allHabits } from '../Classes/Habit';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, setPage$, setShowPopUpPanel, notify$, fontSize$, setCurrentBottomBtn, setAddPanel, setNotifyPanel } from '../StaticClasses/HabitsBus';
import { NotificationsManager } from '../StaticClasses/NotificationsManager';
import { MdClose, MdCheck, MdNotificationsActive } from 'react-icons/md';
import { HABITS_ACCENT } from './HabitsPages/HabitVisuals.jsx';

const clickSound = new Audio('Audio/Click.wav');

// --- СТИЛИ (Наверху) ---
const styles = (theme, isSliderOn = false, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const activeColor = HABITS_ACCENT.hue;
    const panelBg = isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.97) 0%, rgba(${HABITS_ACCENT.rgb},0.1) 100%)`
        : `radial-gradient(260px 180px at 88% 0%, rgba(${HABITS_ACCENT.rgb},0.16), transparent 66%), linear-gradient(145deg, rgba(23,27,31,0.98), rgba(19,22,25,0.98))`;
    const subTextCol = Colors.get('subText', theme);
    const border = isLight ? 'rgba(15,23,42,0.08)' : HABITS_ACCENT.ring;

    return {
        container: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isLight ? 'rgba(15, 23, 42, 0.24)' : 'rgba(0, 0, 0, 0.56)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000,
            padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px calc(env(safe-area-inset-bottom, 0px) + 18px)',
            boxSizing: 'border-box'
        },
        panel: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
            gap: 12,
            borderRadius: 28,
            border: `1px solid ${border}`,
            background: panelBg,
            boxShadow: isLight
                ? `0 16px 38px -30px rgba(${HABITS_ACCENT.rgb},0.45), 0 1px 0 rgba(255,255,255,0.72) inset`
                : `0 22px 54px -34px rgba(${HABITS_ACCENT.rgb},0.46), 0 1px 0 rgba(255,255,255,0.055) inset`,
            width: 'min(90vw, 360px)',
            maxHeight: 'calc(100vh - 36px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
            overflowY: 'auto',
            boxSizing: 'border-box',
            padding: 16,
            WebkitOverflowScrolling: 'touch'
        },
        hero: {
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            minWidth: 0,
            position: 'relative',
            padding: '4px 10px 10px 4px'
        },
        imageShell: {
            width: 62,
            height: 74,
            marginTop: 0,
            borderRadius: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            overflow: 'visible',
            flexShrink: 0
        },
        heroImage: {
            width: '108%',
            maxHeight: '108%',
            objectFit: 'contain',
            display: 'block',
            filter: isLight
                ? 'drop-shadow(0 12px 20px rgba(15,23,42,0.12))'
                : 'drop-shadow(0 14px 26px rgba(0,0,0,0.42))'
        },
        heroText: {
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            paddingTop: 0,
            flex: 1
        },
        metaRow: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            minWidth: 0
        },
        eyebrow: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: activeColor,
            fontSize: 9.5,
            fontWeight: 900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: 1
        },
        sectionLabel: {
            color: subTextCol,
            fontSize: 10,
            fontWeight: 850,
            whiteSpace: 'nowrap',
            flexShrink: 0
        },
        titleRow: {
            display: 'flex',
            alignItems: 'center',
            gap: 0,
            minWidth: 0,
            maxWidth: '100%'
        },
        title: {
            margin: 0,
            color: Colors.get('mainText', theme),
            fontSize: fSize === 0 ? 20 : 22,
            fontWeight: 950,
            lineHeight: 1.08,
            letterSpacing: 0,
            whiteSpace: 'nowrap'
        },
        subText: {
            margin: 0,
            color: subTextCol,
            fontSize: fSize === 0 ? 12.5 : 13.5,
            fontWeight: 650,
            lineHeight: 1.32,
            textAlign: 'left',
            maxWidth: 230
        },
        
        // --- БАРАБАН ВРЕМЕНИ ---
        timePickerWrapper: {
            position: 'relative',
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            height: 172,
            width: '100%',
            borderRadius: 22,
            background: isLight ? 'rgba(255,255,255,0.54)' : 'rgba(255,255,255,0.032)',
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`,
            boxSizing: 'border-box',
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            // Градиентная маска для эффекта 3D барабана
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        },
        highlightBar: {
            position: 'absolute', top: '50%', left: '16%', right: '16%', height: 58,
            transform: 'translateY(-50%)',
            background: isLight ? `rgba(${HABITS_ACCENT.rgb},0.12)` : `rgba(${HABITS_ACCENT.rgb},0.11)`,
            borderRadius: 16,
            pointerEvents: 'none',
            border: `1px solid ${HABITS_ACCENT.ring}`,
            boxShadow: isLight ? `0 12px 24px rgba(${HABITS_ACCENT.rgb},0.1)` : `0 0 24px ${HABITS_ACCENT.glow}`
        },
        scroller: {
            height: '100%',
            width: 78,
            overflowY: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            scrollSnapType: 'y mandatory',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: 0,
            zIndex: 2
        },
        timeItem: {
            height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: fSize === 0 ? 34 : 37,
            fontWeight: 800,
            scrollSnapAlign: 'center',
            color: Colors.get('mainText', theme), transition: 'all 0.2s ease',
            flexShrink: 0, fontVariantNumeric: 'tabular-nums' // Чтобы цифры не прыгали по ширине
        },

        // --- ДНИ НЕДЕЛИ ---
        daysContainer: {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
            width: '100%',
            gap: 7,
            padding: '2px 0'
        },
        dayCircle: {
            width: '100%',
            aspectRatio: '1 / 1',
            minHeight: 36,
            borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12.5, fontWeight: 900, cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            boxSizing: 'border-box'
        },

        // --- НОВАЯ НИЖНЯЯ ПАНЕЛЬ (ISLAND) ---
        bottomIsland: {
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            width: '100%',
            minHeight: 62,
            backgroundColor: isLight ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.035)',
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`,
            borderRadius: 22,
            padding: '7px 9px',
            boxSizing: 'border-box',
            gap: 12
        },
        
        // Кнопка закрытия (Круглая)
        closeBtn: {
            width: 46, height: 46, borderRadius: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.055)',
            color: Colors.get('icons', theme), cursor: 'pointer',
            boxShadow: isLight ? '0 8px 18px rgba(15,23,42,0.08)' : 'none',
            flexShrink: 0
        },

        // Свитчер (по центру)
        switchWrapper: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            minWidth: 0
        },
        switch: {
            position: 'relative',
            width: 58,
            height: 34,
            backgroundColor: isSliderOn ? HABITS_ACCENT.soft : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'),
            border: `1px solid ${isSliderOn ? HABITS_ACCENT.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)')}`,
            borderRadius: 18,
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
            boxSizing: 'border-box'
        },
        switchKnob: {
            position: 'absolute',
            top: 3,
            left: isSliderOn ? 27 : 3,
            width: 26,
            height: 26,
            borderRadius: '50%',
            backgroundColor: isSliderOn ? activeColor : '#FFFFFF',
            boxShadow: isSliderOn ? `0 0 16px ${HABITS_ACCENT.glow}` : '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // Пружинистый эффект
        },

        // Кнопка сохранения (Большая, яркая)
        saveBtn: {
            width: 46, height: 46, borderRadius: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: HABITS_ACCENT.soft,
            border: `1px solid ${HABITS_ACCENT.ring}`,
            color: activeColor, cursor: 'pointer',
            boxShadow: `0 0 18px ${HABITS_ACCENT.glow}`,
            flexShrink: 0
        }
    }
}

const NotifyPanel = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFontSize] = useState(0);
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [page, setPage] = useState('Habit');
    const [notify, setNotify] = useState(AppData.notify);
    const [daysOfWeek, setDaysOfWeek] = useState([true, true, true, true, true, false, false]);
    const [cron, setCron] = useState('10 12 * * 1,2,3,4,5');
    const [isSliderOn, setIsSliderOn] = useState(false);
    
    const daysNames = [['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'], ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    const hoursRef = useRef(null);
    const minutesRef = useRef(null);

    // --- ЛОГИКА СКРОЛЛА (БЕЗ ЛАГОВ) ---
    const itemHeight = 60; 

    // Функция только для начальной установки позиции
    const setInitialScroll = () => {
        if(hoursRef.current) hoursRef.current.scrollTop = hour * itemHeight;
        if(minutesRef.current) minutesRef.current.scrollTop = minute * itemHeight;
    };

    useEffect(() => {
        // Парсим крон при старте
        stringToCron(page, setCron, setHour, setMinute, setDaysOfWeek, setIsSliderOn);
        
        // Скроллим 1 раз через 50мс
        setTimeout(() => {
            setInitialScroll();
        }, 50);
    }, []); 

    // Обновляем только CRON, не трогаем скролл (чтобы не было конфликта с пальцем)
    useEffect(() => {
        setCron(getCronExpression(daysOfWeek, hour, minute));
    }, [hour, minute, daysOfWeek]);

    useEffect(() => { const sub = setPage$.subscribe(p => { if(typeof p === 'string') setPage(p); }); return () => sub.unsubscribe(); }, []);
    useEffect(() => { const sub = theme$.subscribe(setThemeState); return () => sub.unsubscribe(); }, []);
    useEffect(() => { const sub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)); const sub2 = fontSize$.subscribe(setFontSize); return () => { sub.unsubscribe(); sub2.unsubscribe(); } }, []);
    useEffect(() => { const sub = notify$.subscribe(setNotify); return () => sub.unsubscribe(); }, []);

    const setDay = (index) => {
        const updatedDays = [...daysOfWeek];
        updatedDays[index] = !updatedDays[index];
        let falseCount = updatedDays.filter(day => !day).length;
        if (falseCount === 7) return; 
        setDaysOfWeek(updatedDays);
    };

    const handleSave = () => {
        if (page.startsWith("H")) habitReminder(langIndex, cron, hour, minute, true);
        if (page.startsWith("T")) trainingReminder(langIndex, cron, hour, minute);
        closePanel();
    }

    const closePanel = () => {
        setAddPanel('');
        setCurrentBottomBtn(0);
        setNotifyPanel(false);
    }

    // Обработчик скролла (плавный)
    const handleScroll = (e, setTimeFn, max) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if (index >= 0 && index < max) {
            setTimeFn(index);
        }
    };

    const isLight = theme === 'light' || theme === 'speciallight';
    const activeColor = HABITS_ACCENT.hue;

    const s = styles(theme, isSliderOn, fSize);
    const notifyTitle = langIndex === 0 ? 'Напоминания' : 'Reminders';
    const sectionLabel = page.startsWith("H")
        ? (langIndex === 0 ? 'Привычки' : 'Habits')
        : (langIndex === 0 ? 'Тренировки' : 'Training');
    const notifyStateText = isSliderOn
        ? (langIndex === 0 ? 'Включено' : 'On')
        : (langIndex === 0 ? 'Выключено' : 'Off');

    return (
        <div style={s.container}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={s.panel}
            >
                <div style={s.hero}>
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={s.imageShell}>
                        <img style={s.heroImage} src={page.startsWith("H") ? 'images/bro_habits.png' : 'images/Training.png'} alt="" />
                    </motion.div>
                    <div style={s.heroText}>
                        <div style={s.metaRow}>
                            <div style={s.eyebrow}>
                                <MdNotificationsActive size={14} />
                                {notifyStateText}
                            </div>
                            <span style={s.sectionLabel}>{sectionLabel}</span>
                        </div>
                        <div style={s.titleRow}>
                            <h2 style={s.title}>{notifyTitle}</h2>
                        </div>
                        <p style={s.subText}>{getInfoText(langIndex)}</p>
                    </div>
                </div>
                
                
                {/* БАРАБАН */}
                <div style={s.timePickerWrapper}>
                    <div style={s.highlightBar} />
                    
                    {/* Часы */}
                    <div style={s.scroller} ref={hoursRef} onScroll={(e) => handleScroll(e, setHour, 24)}>
                        <div style={{height: 80, flexShrink: 0}} /> 
                        {hours.map((h) => (
                            <div key={h} style={{
                                ...s.timeItem, 
                                opacity: h === hour ? 1 : 0.3, 
                                transform: h === hour ? 'scale(1.1)' : 'scale(0.9)',
                            }}>
                                {h.toString().padStart(2, '0')}
                            </div>
                        ))}
                        <div style={{height: 80, flexShrink: 0}} />
                    </div>

                    <div style={{fontSize: '32px', fontWeight: '700', paddingBottom: '4px', zIndex: 2, color: Colors.get('mainText', theme), opacity: 0.8}}>:</div>

                    {/* Минуты */}
                    <div style={s.scroller} ref={minutesRef} onScroll={(e) => handleScroll(e, setMinute, 60)}>
                        <div style={{height: 80, flexShrink: 0}} />
                        {minutes.map((m) => (
                            <div key={m} style={{
                                ...s.timeItem, 
                                opacity: m === minute ? 1 : 0.3, 
                                transform: m === minute ? 'scale(1.1)' : 'scale(0.9)',
                            }}>
                                {m.toString().padStart(2, '0')}
                            </div>
                        ))}
                        <div style={{height: 80, flexShrink: 0}} />
                    </div>
                </div>

                {/* ДНИ НЕДЕЛИ */}
                <div style={s.daysContainer}>
                    {daysNames[langIndex].map((dayName, i) => (
                        <motion.div 
                            key={i} 
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setDay(i)}
                            style={{
                                ...s.dayCircle,
                                backgroundColor: daysOfWeek[i] ? HABITS_ACCENT.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)'),
                                color: daysOfWeek[i] ? activeColor : Colors.get('subText', theme),
                                boxShadow: daysOfWeek[i] ? `0 0 16px ${HABITS_ACCENT.glow}` : 'none',
                                border: daysOfWeek[i] ? `1px solid ${HABITS_ACCENT.ring}` : `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`
                            }}
                        >
                            {dayName}
                        </motion.div>
                    ))}
                </div>

                {/* --- НОВАЯ ПАНЕЛЬ КНОПОК --- */}
                <div style={s.bottomIsland}>
                    
                    {/* Кнопка Закрыть */}
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        onClick={closePanel} 
                        style={s.closeBtn}
                    >
                        <MdClose size={26} />
                    </motion.div>

                    {/* Свитчер */}
                    <div style={s.switchWrapper}>
                        <div 
                            style={s.switch} 
                            onClick={() => {
                                const newState = !isSliderOn;
                                setIsSliderOn(newState);
                                toggleNotify(page, newState, langIndex, cron, hour, minute);
                            }}
                        >
                            <div style={s.switchKnob} />
                        </div>
                    </div>

                    {/* Кнопка Сохранить */}
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSave} 
                        style={s.saveBtn}
                    >
                        <MdCheck size={28} />
                    </motion.div>

                </div>

            </motion.div>
            
        </div>
    );
};

export default NotifyPanel;




function getInfoText(langIndex) {
  return langIndex === 0 ? 
  'Время и дни недели для уведомлений' : 
  'Time and weekdays for notifications';
}
function getCronExpression(daysOfWeek,hour,minute){
  let cron = `${minute > 0 ? minute : '*'} ${hour > 0 ? hour : '*'} * *`;
  if(daysOfWeek.every(day => day === true)) cron += ' *';
  else{
    const daysMap = [];
    for(let i = 0; i < daysOfWeek.length; i++){
      if(daysOfWeek[i]) daysMap.push(i + 1);
    }
    cron += ' ' + daysMap.join(',');
  }
  return cron;
}
function stringToCron(page,setCron,setHour,setMinute,setDaysOfWeek,setIsSliderOn){
  let str = '';
  if(page.startsWith("H")) {
    setIsSliderOn(AppData.notify[0].enabled);
    str = AppData.notify[0].cron;
  }
  if(page.startsWith("T")) {
    setIsSliderOn(AppData.notify[1].enabled);
    str = AppData.notify[1].cron;
  }
  setCron(str);
  const cronArr = str.split(' ');
  setHour(cronArr[1] !== '*' ? parseInt(cronArr[1]) : 0);
  setMinute(cronArr[0] !== '*' ? parseInt(cronArr[0]) : 0);
  if (cronArr[4] === '*') {
    setDaysOfWeek([true, true, true, true, true, true, true]);
  } else {
    const daysMap = cronArr[4].split(',');
    const newDays = Array(7).fill(false);
    daysMap.forEach(day => {
      newDays[day - 1] = true;
    });
    setDaysOfWeek(newDays);
  }
}
export function habitReminder(langIndex,_cron,hour,minute,needMessage) {
  const messages = [
    ['время для ваших привычек,', 'Time for your habits,'],
    ['пора выполнить вашу привычку,', 'Time to complete your habit,'],
    ['напоминание о ваших привычках,', 'Reminder about your habits,'],
    ['время проверить привычки,', 'Time to check your habits,'],
    ['время для ежедневного ритуала,', 'Time for your daily ritual,'],
    ['время для самосовершенствования,', 'Time for self-improvement,'],
    ['время для полезного действия,', 'Time for a beneficial action,'],
    ['время для вашего прогресса,', 'Time for your progress,'],
    ['время для личного развития,', 'Time for personal growth,'],
    ['время для полезной рутины,', 'Time for a beneficial routine,'],
    ['время для работы над собой,', 'Time to work on yourself,'],
    ['время для полезной привычки,', 'Time for a good habit,'],
    ['время для самодисциплины,', 'Time for self-discipline,'],
  ]
  if(!AppData.notify[0].enabled){
    if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Уведомления отключены ,сначала включите их' : 'Notifications disabled, first enable them',2000,false);
    return;
  }
    try {
        if (!AppData.choosenHabits || AppData.choosenHabits.length === 0) {
            if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Нет выбранных привычек' : 'No habits chosen',2000,false);
            return;
        }
        const message = '⏰ ' + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + '$' + _cron;
        AppData.notify[0] = {enabled:true,cron:_cron};
        NotificationsManager.sendMessage("habit", message);
        if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Уведомление установлено  на ' + hour + ':' + minute : 'Notification set on ' + hour + ':' + minute,2000,true);
    } catch (error) {
        console.log(error);
        if(needMessage)setShowPopUpPanel(langIndex === 0 ? 'Ошибка отправки уведомления' : 'Error sending notification',2000,false);
    }
}

const trainingReminder = (langIndex,_cron,hour,minute) => {
  const messages = [
    ["Пора тренироваться,", "It's time to train,"],
    ["Время для спорта,", "Time for some exercise,"],
    ["Разомнись немного,", "Time to stretch,"],
    ["Вперёд к рекордам,", "Let's break some records,"],
    ["Зарядка для тела,", "Energize your body,"],
    ["Время активности,", "Stay active,"],
    ["Разогрейся,", "Warm up,"],
    ["Время стать лучше,", "Time to get better,"],
    ["Подвигаемся?", "Shall we move a bit?"],
    ["Физкульт-привет!", "Exercise time!"],
    ["Бодрость духа!", "Boost your energy!"],
    ["Время размяться!", "Time to stretch!"],
    ["Активный перерыв!", "Active break time!"],
    ["Вперёд к здоровью!", "Onward to health!"],
    ["Разомни шею и спину!", "Stretch your neck and back!"],
    ["Время для зарядки!", "Time for some exercise!"],
    ["Подкачайся!", "Pump it up!"],
    ["Время движения!", "Time to move!"],
    ["Разогрей мышцы!", "Warm up those muscles!"],
    ["Время потренироваться!", "Time for a workout!"],
  ]
  if(!AppData.notify[1].enabled){
    setShowPopUpPanel(langIndex === 0 ? 'Уведомления отключены,сначала включите их' : 'Notifications disabled, first enable them',2000,false);
    return;
  }
    try {
        const message = "🏋️⏰ " + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + '$' + _cron;
        AppData.notify[1] = {enabled:true,cron:_cron};
        NotificationsManager.sendMessage("training", message);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление установлено  на ' + hour + ':' + minute : 'Notification set on ' + hour + ':' + minute,2000,true);
    } catch (error) {
        console.log(error);
        setShowPopUpPanel(langIndex === 0 ? 'Ошибка отправки уведомления' : 'Error sending notification',2000,false);
    }
}

const toggleNotify = (page,isEnabled,langIndex,_cron,hour,minute) => {
  if(page.startsWith("H")){
    AppData.notify[0].enabled = isEnabled;
    if(UserData?.id){
      if(isEnabled) {
        habitReminder(langIndex,_cron,hour,minute,true);
      }
      else {
        NotificationsManager.sendMessage("habitoff", UserData.id);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление отключено' : 'Notification disabled',2000,true);
      }
    } 
  }
  if(page.startsWith("T")){
    AppData.notify[1].enabled = isEnabled;
    if(UserData?.id){
      if(isEnabled){
        trainingReminder(langIndex,_cron,hour,minute);
      }
      else {
        NotificationsManager.sendMessage("trainingoff", UserData.id);
        setShowPopUpPanel(langIndex === 0 ? 'Уведомление отключено' : 'Notification disabled',2000,true);
      }
    } 
  }
}
