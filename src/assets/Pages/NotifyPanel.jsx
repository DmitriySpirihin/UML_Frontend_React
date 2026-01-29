import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion'; // Анимации
import { AppData, UserData } from '../StaticClasses/AppData.js';
import { allHabits } from '../Classes/Habit';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, setPage$, setShowPopUpPanel, notify$, fontSize$, setCurrentBottomBtn, setAddPanel, setNotifyPanel } from '../StaticClasses/HabitsBus';
import { NotificationsManager } from '../StaticClasses/NotificationsManager';
import { MdDone, MdClose, MdCheck } from 'react-icons/md';

const clickSound = new Audio('Audio/Click.wav');

// --- СТИЛИ (Наверху) ---
const styles = (theme, isSliderOn = false, fSize = 0) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const activeColor = isLight ? '#007AFF' : '#0A84FF';
    const panelBg = isLight ? '#FFFFFF' : '#1C1C1E';
    const subTextCol = Colors.get('subText', theme);

    return {
        container: {
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)', // Чуть темнее фон
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, padding: '20px',
        },
        panel: {
            display: 'flex', flexDirection: 'column',
            alignItems: "center", justifyContent: "space-between",
            borderRadius: "36px", // Более скругленные углы
            border: isLight ? '1px solid rgba(255,255,255,0.8)' : `1px solid ${Colors.get('border', theme)}`,
            backgroundColor: panelBg,
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            width: "90vw", maxWidth: '360px', height: "auto", minHeight: '480px',
            overflow: 'hidden', paddingBottom: '20px'
        },
        
        // --- БАРАБАН ВРЕМЕНИ ---
        timePickerWrapper: {
            position: 'relative',
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            height: '220px', width: '100%',
            // Градиентная маска для эффекта 3D барабана
            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        },
        highlightBar: {
            position: 'absolute', top: '50%', left: '15%', right: '15%', height: '60px',
            transform: 'translateY(-50%)',
            backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.08)',
            borderRadius: '16px', pointerEvents: 'none',
            border: isLight ? '1px solid rgba(0,0,0,0.05)' : 'none'
        },
        scroller: {
            height: '100%', width: '80px', overflowY: 'auto',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            scrollSnapType: 'y mandatory',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '0'
        },
        timeItem: {
            height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '36px', fontWeight: '600', scrollSnapAlign: 'center',
            color: Colors.get('mainText', theme), transition: 'all 0.2s ease',
            flexShrink: 0, fontVariantNumeric: 'tabular-nums' // Чтобы цифры не прыгали по ширине
        },

        // --- ДНИ НЕДЕЛИ ---
        daysContainer: {
            display: 'flex', flexDirection: 'row', justifyContent: 'space-between',
            width: '90%', padding: '10px 0', gap: '6px', marginBottom: '15px'
        },
        dayCircle: {
            width: '38px', height: '38px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: '700', cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        },

        // --- НОВАЯ НИЖНЯЯ ПАНЕЛЬ (ISLAND) ---
        bottomIsland: {
            display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            width: '90%', height: '70px',
            backgroundColor: isLight ? '#F2F4F6' : '#2C2C2E', // Выделенный блок
            borderRadius: '28px',
            padding: '0 10px',
            boxSizing: 'border-box'
        },
        
        // Кнопка закрытия (Круглая)
        closeBtn: {
            width: '50px', height: '50px', borderRadius: '25px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: isLight ? '#FFFFFF' : '#3A3A3C',
            color: Colors.get('icons', theme), cursor: 'pointer',
            boxShadow: isLight ? '0 4px 10px rgba(0,0,0,0.05)' : 'none'
        },

        // Свитчер (по центру)
        switchWrapper: {
            display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1
        },
        switch: {
            position: 'relative', width: '56px', height: '34px',
            backgroundColor: isSliderOn ? activeColor : (isLight ? '#E5E5EA' : '#48484A'),
            borderRadius: '20px', cursor: 'pointer', transition: 'background-color 0.3s ease'
        },
        switchKnob: {
            position: 'absolute', top: '3px', left: isSliderOn ? '25px' : '3px',
            width: '28px', height: '28px', borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            transition: 'left 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' // Пружинистый эффект
        },

        // Кнопка сохранения (Большая, яркая)
        saveBtn: {
            width: '50px', height: '50px', borderRadius: '25px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: activeColor,
            color: '#FFFFFF', cursor: 'pointer',
            boxShadow: `0 4px 15px ${activeColor}55`
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
    const activeColor = isLight ? '#007AFF' : '#0A84FF';

    return (
        <div style={styles(theme).container}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                style={styles(theme).panel}
            >
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{width: '64px', height: '154px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                   <img style={{  width:page.startsWith("H") ? '14vh' : '16vh' }} src={page.startsWith("H") ? 'images/bro_habits.png' : 'images/Training.png'} alt="logo" />
                </motion.div>
                {/* Заголовок */}
                <div style={{padding: '25px 20px 0 20px', width: '100%', boxSizing: 'border-box'}}>
                    <p style={styles(theme, false, fSize).subText}>{getInfoText(langIndex)}</p>
                </div>
                
                
                {/* БАРАБАН */}
                <div style={styles(theme).timePickerWrapper}>
                    <div style={styles(theme).highlightBar} />
                    
                    {/* Часы */}
                    <div style={styles(theme).scroller} ref={hoursRef} onScroll={(e) => handleScroll(e, setHour, 24)}>
                        <div style={{height: 80, flexShrink: 0}} /> 
                        {hours.map((h) => (
                            <div key={h} style={{
                                ...styles(theme).timeItem, 
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
                    <div style={styles(theme).scroller} ref={minutesRef} onScroll={(e) => handleScroll(e, setMinute, 60)}>
                        <div style={{height: 80, flexShrink: 0}} />
                        {minutes.map((m) => (
                            <div key={m} style={{
                                ...styles(theme).timeItem, 
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
                <div style={styles(theme).daysContainer}>
                    {daysNames[langIndex].map((dayName, i) => (
                        <motion.div 
                            key={i} 
                            whileTap={{ scale: 0.85 }}
                            onClick={() => setDay(i)}
                            style={{
                                ...styles(theme).dayCircle,
                                backgroundColor: daysOfWeek[i] ? activeColor : (isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'),
                                color: daysOfWeek[i] ? '#FFF' : Colors.get('subText', theme),
                                boxShadow: daysOfWeek[i] ? `0 4px 10px ${activeColor}40` : 'none'
                            }}
                        >
                            {dayName}
                        </motion.div>
                    ))}
                </div>

                {/* --- НОВАЯ ПАНЕЛЬ КНОПОК --- */}
                <div style={styles(theme).bottomIsland}>
                    
                    {/* Кнопка Закрыть */}
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        onClick={closePanel} 
                        style={styles(theme).closeBtn}
                    >
                        <MdClose size={26} />
                    </motion.div>

                    {/* Свитчер */}
                    <div style={styles(theme).switchWrapper}>
                        <div 
                            style={styles(theme, isSliderOn).switch} 
                            onClick={() => {
                                const newState = !isSliderOn;
                                setIsSliderOn(newState);
                                toggleNotify(page, newState, langIndex, cron, hour, minute);
                            }}
                        >
                            <div style={styles(theme, isSliderOn).switchKnob} />
                        </div>
                    </div>

                    {/* Кнопка Сохранить */}
                    <motion.div 
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSave} 
                        style={styles(theme).saveBtn}
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
  'Установите время и дни недели, чтобы я мог отправлять вам уведомления' : 
  'Set a time and days of week to i can send notification to you';
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
        const habits = AppData.choosenHabits
            .map(habitId => allHabits?.find(h => (h.id === habitId && !AppData.choosenHabitsTypes[AppData.choosenHabits.indexOf(habitId)])))
            .filter(Boolean);
        let message = '⏰ ' + UserData.name + " ," + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + ': ';
        const habitNames = habits.map(h => h.name[langIndex]).join(', ');
        message += habitNames + '$' + _cron;
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
        const userName = UserData.name;
        let message = "🏋️⏰ " + messages[langIndex][Math.floor(Math.random() * messages[langIndex].length)] + ' ' + userName + ' !';
        message += '$' + _cron;
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
