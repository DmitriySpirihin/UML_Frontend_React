import React, { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import Colors from '../StaticClasses/Colors'
import { theme$, lang$, fontSize$, setPage } from '../StaticClasses/HabitsBus'
import { AppData } from '../StaticClasses/AppData'
import { 
    FaRunning, FaBrain, FaBed, FaListUl, FaMedal, 
    FaArrowLeft, FaInfoCircle 
} from "react-icons/fa";
import { MdOutlineSelfImprovement } from "react-icons/md";

const InfoPanel = () => {
    const [theme, setThemeState] = useState(AppData.prefs[1] === 0 ? 'dark' : 'light');
    const [lang, setLang] = useState(AppData.prefs[0]);
    const [fSize, setFontSize] = useState(0);
    const [activeTab, setActiveTab] = useState('MainCard');

    const initialMenuItems = [
        { id: 'MainCard', icon: <FaInfoCircle />, title: lang === 0 ? 'Общее' : 'General', subtitle: '', color: '#404040' },
        { id: 'HabitsMain', icon: <FaMedal />, title: lang === 0 ? 'Привычки' : 'Habits', subtitle: '', color: '#FFD700' },
        { id: 'TrainingMain', icon: <FaRunning />, title: lang === 0 ? 'Тренировки' : 'Workout', subtitle: '', color: '#FF4D4D' },
        { id: 'MentalMain', icon: <FaBrain />, title: lang === 0 ? 'Мозг' : 'Brain', subtitle: '', color: '#4DA6FF' },
        { id: 'RecoveryMain', icon: <MdOutlineSelfImprovement />, title: lang === 0 ? 'Восстановление' : 'Recovery', subtitle: '', color: '#4DFF88' },
        { id: 'SleepMain', icon: <FaBed />, title: lang === 0 ? 'Сон' : 'Sleep', subtitle: '', color: '#A64DFF' },
        { id: 'ToDoMain', icon: <FaListUl />, title: lang === 0 ? 'Задачи' : 'To-Do', subtitle: '', color: '#FFA64D' }
    ];

    useEffect(() => {
        const themeSubscription = theme$.subscribe(setThemeState);
        const langSubscription = lang$.subscribe((lang) => setLang(lang === 'ru' ? 0 : 1));
        const fontSizeSubscription = fontSize$.subscribe(setFontSize);
        return () => {
            themeSubscription.unsubscribe();
            langSubscription.unsubscribe();
            fontSizeSubscription.unsubscribe();
        };
    }, []);

    const s = styles(theme, fSize);

    return (
        <div style={s.container}>
            {/* --- HEADER --- */}
            <div style={s.header}>
                <div style={s.topBar}>
                    
                    <span style={s.headerTitle}>{lang === 0 ? 'Инструкция' : 'User Guide'}</span>
                    <div style={{width: 40}} /> {/* Spacer for centering */}
                </div>

                {/* --- HORIZONTAL TABS --- */}
                <div style={s.tabsContainer} className="no-scrollbar">
                    {initialMenuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <motion.div 
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                style={s.tabItem(isActive, item.color)}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div style={{fontSize: '18px', display: 'flex'}}>{item.icon}</div>
                                {isActive && (
                                    <motion.span 
                                        initial={{opacity: 0, width: 0}} 
                                        animate={{opacity: 1, width: 'auto'}} 
                                        style={s.tabText}
                                    >
                                        {item.title}
                                    </motion.span>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* --- CONTENT SCROLL VIEW --- */}
            <div style={s.scrollView} className="no-scrollbar">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        style={s.contentContainer}
                    >
                        <div 
                            style={s.htmlContent}
                            dangerouslySetInnerHTML={{ 
                                __html: getInstructions(lang, activeTab) 
                            }} 
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Extra space at bottom for scrolling */}
                <div style={{height: '100px'}} /> 
            </div>
        </div>
    )
}

const styles = (theme, fontSize) => {
    const bg = Colors.get('background', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const panel = Colors.get('simplePanel', theme);

    return {
        container: {
            backgroundColor: bg,
            display: "flex",
            flexDirection: "column",
            height: "90vh",
            marginTop:'100px',
            width: "100vw",
            fontFamily: "Segoe UI",
            overflow: 'hidden'
        },
        header: {
            width: '100%',
            backgroundColor: bg,
            paddingTop: '40px', // Safe area
            borderBottom: `1px solid ${Colors.get('border', theme)}`,
            zIndex: 10
        },
        topBar: {
            display: 'flex',
            width:'100%',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 20px 15px 20px'
        },
        backBtn: {
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: panel,
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: text,
            cursor: 'pointer'
        },
        headerTitle: {
            fontSize: '20px',
            fontWeight: '700',
            color: text
        },
        tabsContainer: {
            display: 'flex',
            gap: '10px',
            padding: '0 20px 15px 20px',
            overflowX: 'scroll',
            width: '100%',
            boxSizing: 'border-box'
        },
        tabItem: (isActive, color) => ({
            padding: isActive ? '8px 16px' : '8px 12px',
            borderRadius: '20px',
            backgroundColor: isActive ? color : panel,
            color: isActive ? '#FFF' : sub,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'background-color 0.3s ease',
            border: isActive ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }),
        tabText: {
            fontSize: '14px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            overflow: 'hidden'
        },
        scrollView: {
            flex: 1,
            width: "90%",
            overflowY: "scroll",
            padding: '20px'
        },
        contentContainer: {
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
        },
        htmlContent: {
            whiteSpace: 'pre-wrap', 
            wordWrap: 'break-word',
            textAlign: 'left',
            lineHeight: '1.6',
            fontSize: fontSize === 0 ? '15px' : '17px',
            color: text,
            fontFamily: 'Segoe UI, sans-serif',
        }
    };
}

export default InfoPanel;

// --- UPDATED HELPER TO RETURN SPECIFIC SECTIONS ---
function getInstructions(langIndex, sectionId) {
    const isRu = langIndex === 0;

    // Common Intro
    const introRu = `🧠✨ <b>Инструкция</b>\n<i>Ваш помощник для роста, здоровья и продуктивности</i>\n\n## 📋 Общие принципы\n• <b>Навигация:</b> Все разделы доступны из главного меню.\n• <b>Авто-сохранение:</b> Данные сохраняются мгновенно.\n• <b>Управление:</b> Используйте ➕ для создания и ✅ для завершения.`;
    const introEn = `🧠✨ <b>User Guide</b>\n<i>Your assistant for growth, health, and productivity</i>\n\n## 📋 General Principles\n• <b>Navigation:</b> Access all features from the main menu.\n• <b>Auto-Save:</b> Data saves instantly.\n• <b>Controls:</b> Use ➕ to add items and ✅ to mark as done.`;

    switch (sectionId) {
        case 'MainCard':
            return isRu ? introRu : introEn;

        case 'HabitsMain':
            return isRu 
                ? `## 🔄 Привычки\n*Создавайте полезные рутины.*\n\n• <b>Добавить:</b> Укажите название, частоту и иконку.\n• <b>Календарь:</b> Зелёные дни = успех. Старайтесь не прерывать цепочку!\n• <b>Напоминания:</b> Установите время, и мы напомним.\n• <b>Статистика:</b> Следите за лучшими сериями выполнения.\n\n> 💡 <b>Совет:</b> Начните с 1–3 простых привычек, чтобы не перегореть.`
                : `## 🔄 Habits\n*Build stick-to-it routines.*\n\n• <b>Add:</b> Set a name, frequency, and icon.\n• <b>Calendar:</b> Green days = success. Keep the streak alive!\n• <b>Reminders:</b> Set a time, and we'll notify you.\n• <b>Stats:</b> Track your current and best streaks.\n\n> 💡 <b>Tip:</b> Start with 1–3 simple habits to avoid burnout.`;

        case 'TrainingMain':
            return isRu
                ? `## 🏋️ Тренировки\n*Ваш карманный тренер.*\n\n• <b>Новая тренировка:</b> Выберите тип (Силовая, Кардио, и т.д.).\n• <b>Упражнения:</b> Фиксируйте веса, повторы и подходы.\n• <b>Прогресс:</b> Графики покажут, как растут ваши показатели.\n• <b>Медиа:</b> Прикрепляйте фото формы или заметки к тренировке.\n\n> 💪 <b>Совет:</b> Записывайте веса сразу во время отдыха между подходами.`
                : `## 🏋️ Workout Log\n*Your pocket trainer.*\n\n• <b>New Workout:</b> Choose a type (Strength, Cardio, Yoga, etc.).\n• <b>Exercises:</b> Log weights, reps, and sets easily.\n• <b>Progress:</b> Charts show how your strength grows over time.\n• <b>Media:</b> Attach physique photos or notes to any session.\n\n> 💪 <b>Tip:</b> Log your weights during rest periods for accuracy.`;

        case 'MentalMain':
            return isRu
                ? `## 🧩 Мозг\n*Фитнес для ума.*\n\n• <b>Мини-игры:</b> Задания на память, реакцию и счет.\n• <b>Аналитика:</b> Смотрите динамику развития когнитивных навыков.\n• <b>Цели:</b> Ставьте планки (например, «Улучшить память на 10%»).\n\n> 🌟 <b>Совет:</b> Даже 5 минут игры утром помогают проснуться лучше кофе.`
                : `## 🧩 Brain Training\n*Fitness for your mind.*\n\n• <b>Mini-games:</b> Daily tasks for memory, reaction, and logic.\n• <b>Analytics:</b> Watch your cognitive skills improve.\n• <b>Goals:</b> Set targets (e.g., "Improve memory by 10%").\n\n> 🌟 <b>Tip:</b> 5 minutes of brain training wakes you up better than coffee.`;

        case 'RecoveryMain':
            return isRu
                ? `## 🌿 Восстановление\n*Баланс стресса и отдыха.*\n\n### 🌬️ Дыхание\nВыбирайте технику (например, "4-7-8" для сна) и следуйте за визуальным ритмом.\n\n### 🧘 Медитация\nТаймер с фоновыми звуками для концентрации или расслабления.\n\n### ❄️ Закаливание\nТрекер холодовых процедур (душ, ванна). Отмечайте длительность и ощущения.`
                : `## 🌿 Recovery\n*Balance stress with rest.*\n\n### 🌬️ Breathing\nChoose a technique (e.g., "Box Breathing") and follow the visual rhythm.\n\n### 🧘 Meditation\nTimer with ambient sounds for focus or relaxation.\n\n### ❄️ Cold Exposure\nTrack cold showers or ice baths. Log duration and how you felt afterward.`;

        case 'SleepMain':
            return isRu
                ? `## 😴 Сон\n*Качество ночи определяет качество дня.*\n\n• <b>Режим:</b> Фиксируйте время отбоя и подъема.\n• <b>Оценка:</b> Ставьте рейтинг своему самочувствию (1–5).\n• <b>Факторы:</b> Отмечайте кофеин, стресс или алкоголь, чтобы видеть закономерности.\n\n> 🌙 <b>Совет:</b> Старайтесь ложиться в одно время даже в выходные.`
                : `## 😴 Sleep Diary\n*Good days start with good nights.*\n\n• <b>Schedule:</b> Log bedtime and wake-up times.\n• <b>Quality:</b> Rate how you feel (1–5 stars).\n• <b>Factors:</b> Tag caffeine, stress, or screens to spot patterns.\n\n> 🌙 <b>Tip:</b> Consistency is key. Try to wake up at the same time daily.`;

        case 'ToDoMain':
            return isRu
                ? `## ✅ Задачи\n*Порядок в делах — порядок в голове.*\n\n• <b>Создание:</b> Имя задачи, дедлайн и приоритет (🔥 Высокий / ❄️ Низкий).\n• <b>Чек-листы:</b> Разбивайте большие задачи на подпункты.\n• <b>Повторы:</b> Настройте регулярные дела (например, "Оплата счетов").\n\n> 📌 <b>Совет:</b> Используйте правило «2 минут»: если дело быстрое — сделайте сразу.`
                : `## ✅ Tasks\n*Clear mind, organized life.*\n\n• <b>Create:</b> Add name, deadline, and priority (🔥 High / ❄️ Low).\n• <b>Checklists:</b> Break big tasks into smaller sub-steps.\n• <b>Recurring:</b> Set up repeating tasks (e.g., "Pay bills").\n\n> 📌 <b>Tip:</b> The "2-Minute Rule": if a task takes <2 mins, do it now.`;

        default:
            return isRu ? introRu : introEn;
    }
}