import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import { sendReferalLink } from '../StaticClasses/PaymentService'; 
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setPage, lastPage$ } from '../StaticClasses/HabitsBus';
import { calculateStats, LEVEL_RANKS, XP_RULES } from '../Helpers/UserStats.js';
import {
    FaCrown,
    FaRulerVertical, FaBirthdayCake, FaBullseye, FaWeight,
    FaRunning, FaBrain, FaBed, FaMedal, FaSpa, FaUserFriends, FaShareAlt, FaQuestionCircle, FaWalking, FaFire, FaDumbbell,
    FaHome, FaCog
} from 'react-icons/fa';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { MdEdit } from 'react-icons/md';
import ScrollPicker from '../Helpers/ScrollPicker.jsx';

// --- CONSTANTS ---
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health'], ['Выносливосить', 'Endurance']];
const activityNames = [
    ['Низкая', 'Low'],
    ['Умеренная', 'Moderate'],
    ['Активная', 'Active'],
    ['Спорт', 'Athletic']
];
const HEADER_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 14px)';
const MotionDiv = motion.div;
const MotionButton = motion.button;

const Icon = ({ children, size = 20, stroke = 1.75 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
    </svg>
);

const IconHabits = (p) => <Icon {...p} stroke={p.stroke || 1.9}><rect x="5" y="4.5" width="14" height="15.5" rx="4" /><path d="M8.4 12.2l2.4 2.5 4.8-5.2" /><path d="M8.2 3v3M15.8 3v3" /></Icon>;
const IconTraining = (p) => <Icon {...p}><path d="M6.5 7v10M17.5 7v10" /><path d="M4 10v4M20 10v4" /><path d="M6.5 12h11" /></Icon>;
const IconBrain = (p) => <Icon {...p}><path d="M9 4a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-2-5 3 3 0 012-5 3 3 0 013-3z" /><path d="M15 4a3 3 0 00-3 3v10a3 3 0 003 3 3 3 0 003-3 3 3 0 002-5 3 3 0 00-2-5 3 3 0 00-3-3z" /></Icon>;
const IconRecovery = (p) => <Icon {...p}><path d="M12 8c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6z" /><path d="M12 8c2 1 3 3 3 6-2-1-3-3-3-6z" /><path d="M12 8c-2 1-3 3-3 6 2-1 3-3 3-6z" /><path d="M4 14c2 4 5 5 8 5s6-1 8-5" /><circle cx="12" cy="5" r="1.5" /></Icon>;
const IconSleep = (p) => <Icon {...p}><path d="M20 14.5A8 8 0 019.5 4a7 7 0 1010.5 10.5z" /><path d="M16 4.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" /></Icon>;
const IconTodo = (p) => <Icon {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M7 9l2 2 3-3" /><path d="M7 15l2 2 3-3" /><path d="M15 10h3M15 16h3" /></Icon>;

const XP_RULE_ICONS = {
    training: <FaRunning />,
    mental: <FaBrain />,
    sleep: <FaBed />,
    recovery: <FaSpa />,
    habits: <FaMedal />
};

const generateRange = (start, end, step = 1) => {
    const arr = [];
    for (let i = start; i <= end; i += step) {
        arr.push(step === 1 ? i : parseFloat(i.toFixed(1)));
    }
    return arr;
};

const dateKey = (date) => date.toISOString().split('T')[0];

const getRecentDateKeys = (period = 7) => Array.from({ length: period }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() - (period - 1 - index));
    return dateKey(date);
});

const hasLogEntry = (log, key) => {
    const entry = log?.[key];
    if (Array.isArray(entry)) return entry.length > 0;
    if (entry && typeof entry === 'object') return Object.keys(entry).length > 0;
    return Boolean(entry);
};

const buildActivitySeries = (kind, totalValue, period = 7) => {
    const days = getRecentDateKeys(period);
    const values = days.map((key) => {
        if (kind === 'habits') {
            const day = AppData.habitsByDate?.[key];
            if (!day) return 0;
            if (Array.isArray(day)) return day.filter(Boolean).length;
            return Object.values(day).filter(Boolean).length;
        }
        if (kind === 'todo') return Math.min(totalValue || 0, AppData.todoList?.length || 0);
        if (kind === 'training') return hasLogEntry(AppData.trainingLog, key) ? 1 : 0;
        if (kind === 'mental') return hasLogEntry(AppData.mentalLog, key) ? 1 : 0;
        if (kind === 'sleep') return hasLogEntry(AppData.sleepingLog, key) ? 1 : 0;
        if (kind === 'recovery') {
            return [
                AppData.meditationLog,
                AppData.breathingLog,
                AppData.hardeningLog
            ].reduce((sum, log) => sum + (hasLogEntry(log, key) ? 1 : 0), 0);
        }
        return 0;
    });

    if (values.some(Boolean)) return values;
    return totalValue > 0
        ? values.map((_, index) => index === values.length - 1 ? Math.min(totalValue, 1) : 0)
        : values;
};

const friendPlural = (count, lang) => {
    if (lang !== 0) return count === 1 ? 'friend' : 'friends';
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return 'друг';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'друга';
    return 'друзей';
};

const UserPanel = () => {
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    // --- FRIENDS STATE (Loaded directly from UserData) ---
    const [friends] = useState(UserData.friends || []);

    // --- METRICS EDIT STATE ---
    const [showBodyMetrics, setShowBodyMetrics] = useState(false);
    const [age, setAge] = useState(AppData.pData.age || 25);
    const [gender, setGender] = useState(AppData.pData.gender || 0);
    const [height, setHeight] = useState(AppData.pData.height || 175);
    const [weight, setWeight] = useState(AppData.pData.weight || 70);
    const [goal, setGoal] = useState(AppData.pData.goal || 0);
    const [activityLevel, setActivityLevel] = useState(AppData.pData.activityLevel ?? 1);
    const [showFriendsPanel, setShowFriendsPanel] = useState(AppData.profileFriendsExpanded ?? true);
    const [showXpGuide, setShowXpGuide] = useState(false);
    const [selectedXpRule, setSelectedXpRule] = useState('training');
    const [activityPeriod, setActivityPeriod] = useState(7);

    // --- LISTS FOR PICKERS ---
    const agesList = useMemo(() => generateRange(10, 100), []);
    const heightsList = useMemo(() => generateRange(50, 250), []);
    const weightsList = useMemo(() => generateRange(30, 250, 0.5), []);
    const currentGoalNames = useMemo(() => goalNames.map(g => g[lang]), [lang]);
    const currentActivityNames = useMemo(() => activityNames.map(item => item[lang]), [lang]);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        const fSizeSub = fontSize$.subscribe(setFSize);
        const premiumSub = premium$.subscribe(setHasPremium);
        
        return () => {
            themeSub.unsubscribe(); langSub.unsubscribe();
            fSizeSub.unsubscribe(); premiumSub.unsubscribe();
        };
    }, []);

    // --- DERIVED METRICS ---
   const stats = useMemo(() => {
    const coreStats = calculateStats();
    const lvl = coreStats.level.current;
    const currentRank = [...LEVEL_RANKS].reverse().find(rank => lvl >= rank.minLevel) || LEVEL_RANKS[0];
    const nextRank = LEVEL_RANKS.find(rank => rank.minLevel > lvl);

    return {
        ...coreStats,
        level: {
            ...coreStats.level,
            title: currentRank.title[lang],
            color: currentRank.color,
            nextRank: nextRank ? {
                level: nextRank.minLevel,
                title: nextRank.title[lang],
                color: nextRank.color
            } : null
        },
        body: {
            age: age || '--',
            height: height || '--',
            weight: weight || '--',
            gender,
            goal: currentGoalNames[goal] || '--',
            activity: currentActivityNames[activityLevel] || '--'
        }
    };
}, [lang, currentGoalNames, currentActivityNames, age, height, weight, gender, goal, activityLevel]);

    const selectedXpRuleBase = XP_RULES.find(rule => rule.key === selectedXpRule) || XP_RULES[0];
    const selectedXpRuleData = { ...selectedXpRuleBase, icon: XP_RULE_ICONS[selectedXpRuleBase.key] };
    const profileSections = useMemo(() => ([
        { kind: 'habits', id: 'HabitsMain', icon: <IconHabits />, label: lang === 0 ? 'Привычки' : 'Habits', value: stats.counts.habits, unit: lang === 0 ? 'выбрано' : 'selected', color: '#7FC8B8' },
        { kind: 'todo', id: 'ToDoMain', icon: <IconTodo />, label: lang === 0 ? 'Задачи' : 'Tasks', value: AppData.todoList?.length || 0, unit: lang === 0 ? 'активных' : 'active', color: '#D49A5C' },
        { kind: 'training', id: 'TrainingMain', icon: <IconTraining />, label: lang === 0 ? 'Дневник' : 'Log', value: stats.counts.training, unit: lang === 0 ? 'дней' : 'days', color: '#D8785E' },
        { kind: 'mental', id: 'MentalMain', icon: <IconBrain />, label: lang === 0 ? 'Ум' : 'Mind', value: stats.counts.mental, unit: lang === 0 ? 'дней' : 'days', color: '#8A7CD6' },
        { kind: 'recovery', id: 'RecoveryMain', icon: <IconRecovery />, label: lang === 0 ? 'Антистресс' : 'Reset', value: stats.counts.recovery, unit: lang === 0 ? 'практик' : 'sessions', color: '#78B879' },
        { kind: 'sleep', id: 'SleepMain', icon: <IconSleep />, label: lang === 0 ? 'Сон' : 'Sleep', value: stats.counts.sleep, unit: lang === 0 ? 'ночей' : 'nights', color: '#6F8BD6' }
    ]), [lang, stats.counts]);

    const goBack = () => {
        const prev = lastPage$.value;
        const loopingPages = ['UserPanel', 'premium', 'settings'];
        setPage(prev && !loopingPages.includes(prev) ? prev : 'MainMenu');
    };
    
    const onSaveMetrics = async () => {
        AppData.pData = { filled: true, age, gender, height, weight, goal, activityLevel };
        AppData.profileOnboardingShown = true;
        await saveData();
        setShowBodyMetrics(false);
    };

    const toggleFriendsPanel = async () => {
        const nextValue = !showFriendsPanel;
        setShowFriendsPanel(nextValue);
        AppData.profileFriendsExpanded = nextValue;
        await saveData();
    };

    const openSection = (pageId) => {
        if (!pageId) return;
        setPage(pageId);
    };

    const s = styles(theme);
    const accent = hasPremium ? '#9FB4C4' : Colors.get('accent', theme);
    const heroAccent = hasPremium ? '#9FB4C4' : '#5fb6c6';

    return (
        <MotionDiv
            initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            style={s.container}
        >
            {/* Header */}
            <div style={s.header}>
                <MotionDiv
                    whileTap={{ scale: 0.9 }}
                    onClick={goBack}
                    style={s.backBtn}
                >
                    <IoIosArrowBack size={22} />
                </MotionDiv>
                <span style={s.headerTitle}>{lang === 0 ? 'Профиль' : 'Profile'}</span>
                <div style={{ width: 40 }} />
            </div>

            <div style={s.scrollContent} className="no-scrollbar">

                {!hasPremium && (
                    <PremiumPanel
                        lang={lang}
                        theme={theme}
                        onClick={() => setPage('premium')}
                    />
                )}

                {/* 1. Hero with Leveling */}
                <div style={{
                    ...s.heroSection,
                    background: s.isLight
                        ? `linear-gradient(145deg, rgba(255,255,255,0.96) 0%, ${heroAccent}12 58%, rgba(127,200,184,0.08) 100%)`
                        : `linear-gradient(145deg, rgba(23,27,31,0.96) 0%, ${heroAccent}14 54%, rgba(127,200,184,0.08) 100%)`,
                    borderColor: `${heroAccent}22`,
                    boxShadow: s.isLight
                        ? `0 16px 38px -34px ${heroAccent}45, 0 1px 0 rgba(255,255,255,0.72) inset`
                        : `0 18px 40px -34px ${heroAccent}50, 0 1px 0 rgba(255,255,255,0.055) inset`
                }}>
                    <div style={{ ...s.heroColorWash, background: `radial-gradient(circle, ${heroAccent}22 0%, transparent 62%)` }} />
                    <div style={s.heroTopRow}>
                        <div style={{ ...s.avatarWrapper, borderColor: accent }}>
                            {UserData.photo ? (
                                <img src={UserData.photo} style={s.avatarImg} alt="user" />
                            ) : (
                                <div style={s.avatarPlaceholder}>{UserData.name?.charAt(0).toUpperCase() || 'U'}</div>
                            )}

                            {hasPremium && (
                                <div style={s.premiumMiniBadge}><FaCrown size={10} /></div>
                            )}
                        </div>

                        <div style={s.heroIdentity}>
                            <div style={s.heroEyebrow}>{lang === 0 ? 'Личный профиль' : 'Personal profile'}</div>
                            <h2 style={s.userName}>{UserData.name || (lang === 0 ? 'Пользователь' : 'User')}</h2>
                            <div style={s.userMetaRow}>
                                <span style={{...s.userTitle, color: stats.level.color, borderColor: `${stats.level.color}55`, backgroundColor: `${stats.level.color}18`}}>{stats.level.title}</span>
                                {stats.body.gender !== undefined && (
                                    <div style={{
                                        ...s.genderBadge,
                                        backgroundColor: stats.body.gender === 0 ? 'rgba(95, 182, 198, 0.14)' : 'rgba(198, 95, 157, 0.14)',
                                        color: stats.body.gender === 0 ? '#5fb6c6' : '#c65f9d',
                                        borderColor: stats.body.gender === 0 ? 'rgba(95, 182, 198, 0.32)' : 'rgba(198, 95, 157, 0.32)'
                                    }}>
                                        {stats.body.gender === 0 ? <IoMdMale size={14}/> : <IoMdFemale size={14}/>}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{...s.levelBadge, borderColor: `${stats.level.color}55`, color: stats.level.color, backgroundColor: `${stats.level.color}15`}}>
                            <span style={s.levelLabel}>LVL</span>
                            <span style={s.levelValue}>{stats.level.current}</span>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <div style={s.xpContainer}>
                        <div style={s.xpInfo}>
                            <button type="button" onClick={() => setShowXpGuide(true)} style={s.xpInfoButton}>
                                <span>XP</span>
                                <FaQuestionCircle size={12} />
                            </button>
                            <span>{Math.floor(stats.level.xp)} / {stats.level.needed}</span>
                        </div>
                        <div style={s.xpTrack}>
                            <MotionDiv 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.level.percent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ ...s.xpFill, backgroundColor: stats.level.color }} 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Scrollable Metrics */}
                <SectionHeader
                    title={lang === 0 ? 'Разделы' : 'Sections'}
                    theme={theme}
                    right={(
                        <PeriodToggle
                            value={activityPeriod}
                            onChange={setActivityPeriod}
                            lang={lang}
                            theme={theme}
                        />
                    )}
                />
                <div style={s.metricsScrollContainer}>
                    {profileSections.map((section) => (
                        <MetricChip
                            key={section.id}
                            icon={section.icon}
                            label={section.label}
                            value={section.value}
                            unit={section.unit}
                            color={section.color}
                            series={buildActivitySeries(section.kind, section.value, activityPeriod)}
                            theme={theme}
                            onClick={() => openSection(section.id)}
                        />
                    ))}
                </div>

                {/* 3. Physical Data */}
                <SectionHeader
                    title={lang === 0 ? 'О себе' : 'About you'}
                    theme={theme}
                />
                <BodyPills
                    body={stats.body}
                    lang={lang}
                    theme={theme}
                    onEdit={() => setShowBodyMetrics(true)}
                />

                {/* 4. Friends List Section (Direct from UserData) */}
                <SectionHeader
                    title={lang === 0 ? 'Друзья' : 'Friends'}
                    theme={theme}
                />
                <FriendsCompact
                    friends={friends}
                    lang={lang}
                    theme={theme}
                    onInvite={sendReferalLink}
                    onOpen={toggleFriendsPanel}
                />

                <div style={{ height: '18px' }} />
            </div>

            {/* --- XP GUIDE MODAL --- */}
            <AnimatePresence>
                {showXpGuide && (
                    <BottomSheet onClose={() => setShowXpGuide(false)} theme={theme}>
                        <XpGuide
                            stats={stats}
                            lang={lang}
                            theme={theme}
                            selectedRule={selectedXpRuleData}
                            onSelectRule={setSelectedXpRule}
                        />
                    </BottomSheet>
                )}
            </AnimatePresence>

            {/* --- BODY METRICS EDIT MODAL --- */}
            <AnimatePresence>
                {showBodyMetrics && (
                    <BottomSheet onClose={() => setShowBodyMetrics(false)} theme={theme}>
                        <div style={s.bodyMetricsHeader}>
                            <h3 style={s.modalTitle}>{lang === 0 ? 'Параметры тела' : 'Body Metrics'}</h3>
                            <div style={s.bodyMetricsSubtitle}>
                                {lang === 0 ? 'Данные помогают точнее подстраивать цели и рекомендации' : 'These details improve goals and recommendations'}
                            </div>
                        </div>

                        <div style={s.bodyMetricsForm}>
                            <div style={s.bodyMetricsGrid}>
                                <BodyMetricPicker
                                    icon={<FaBirthdayCake />}
                                    label={lang === 0 ? 'Возраст' : 'Age'}
                                    items={agesList}
                                    value={age}
                                    onChange={setAge}
                                    suffix={lang === 0 ? 'лет' : 'y'}
                                    theme={theme}
                                    width="92px"
                                />
                                <BodyMetricPicker
                                    icon={<FaRulerVertical />}
                                    label={lang === 0 ? 'Рост' : 'Height'}
                                    items={heightsList}
                                    value={height}
                                    onChange={setHeight}
                                    suffix="см"
                                    theme={theme}
                                    width="92px"
                                />
                                <BodyMetricPicker
                                    icon={<FaWeight />}
                                    label={lang === 0 ? 'Вес' : 'Weight'}
                                    items={weightsList}
                                    value={weight}
                                    onChange={setWeight}
                                    suffix="кг"
                                    theme={theme}
                                    width="92px"
                                />
                            </div>

                            <ActivityLevelPicker
                                value={activityLevel}
                                onChange={setActivityLevel}
                                lang={lang}
                                theme={theme}
                            />

                            <div style={s.bodyPreferencePanel}>
                                <div style={s.preferenceTitleRow}>
                                    <div>
                                        <div style={s.preferenceTitle}>{lang === 0 ? 'Цель' : 'Goal'}</div>
                                        <div style={s.preferenceHint}>{lang === 0 ? 'выбери главный фокус' : 'choose main focus'}</div>
                                    </div>
                                </div>
                                <div style={s.goalChipGrid}>
                                    {currentGoalNames.map((name, index) => (
                                        <GoalChip
                                            key={name}
                                            active={goal === index}
                                            label={name}
                                            onClick={() => setGoal(index)}
                                            theme={theme}
                                        />
                                    ))}
                                </div>

                                <div style={s.preferenceDivider} />

                                <div style={s.genderInlineRow}>
                                    <div style={s.preferenceTitle}>{lang === 0 ? 'Пол' : 'Gender'}</div>
                                    <div style={s.genderSegment}>
                                        <GenderToggle active={gender === 0} icon={<IoMdMale />} label={lang === 0 ? 'Мужской' : 'Male'} color="#5fb6c6" onClick={() => setGender(0)} theme={theme}/>
                                        <GenderToggle active={gender === 1} icon={<IoMdFemale />} label={lang === 0 ? 'Женский' : 'Female'} color="#c65f9d" onClick={() => setGender(1)} theme={theme}/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ModalActions onClose={() => setShowBodyMetrics(false)} onConfirm={onSaveMetrics} theme={theme} lang={lang} />
                    </BottomSheet>
                )}
            </AnimatePresence>

            <ProfileDock
                theme={theme}
                lang={lang}
                onBack={goBack}
                onHome={() => setPage('MainMenu')}
                onSettings={() => setPage('settings')}
            />

        </MotionDiv>
    );
};

// --- SUB-COMPONENTS ---

const XpGuide = ({ stats, lang, theme, selectedRule, onSelectRule }) => {
    const s = styles(theme);
    const remainingXp = Math.max(0, Math.ceil(stats.level.needed - stats.level.xp));
    const selectedCount = stats.counts[selectedRule.key] || 0;
    const selectedEarned = selectedCount * selectedRule.xp;
    const nextLevel = stats.level.current + 1;

    return (
        <div style={s.xpGuide}>
            <div style={s.xpGuideHeader}>
                <div>
                    <h3 style={{ ...s.modalTitle, textAlign: 'left', margin: 0 }}>
                        {lang === 0 ? 'Как начисляется XP' : 'How XP works'}
                    </h3>
                    <div style={s.xpGuideSubtitle}>
                        {lang === 0
                            ? `${remainingXp} XP до уровня ${nextLevel}`
                            : `${remainingXp} XP to level ${nextLevel}`}
                    </div>
                </div>
                <div style={{ ...s.xpNextBadge, borderColor: stats.level.color, color: stats.level.color }}>
                    LVL {nextLevel}
                </div>
            </div>

            <div style={s.xpUnlockPanel}>
                <div style={s.xpUnlockTitle}>
                    {lang === 0 ? 'Следующий уровень откроет' : 'Next level unlocks'}
                </div>
                <div style={s.xpUnlockText}>
                    {stats.level.nextRank && nextLevel >= stats.level.nextRank.level
                        ? (lang === 0
                            ? `новый ранг: ${stats.level.nextRank.title}`
                            : `new rank: ${stats.level.nextRank.title}`)
                        : (lang === 0
                            ? `уровень ${nextLevel} и прогресс к следующему рангу`
                            : `level ${nextLevel} and progress toward the next rank`)}
                </div>
                {stats.level.nextRank && nextLevel < stats.level.nextRank.level && (
                    <div style={s.xpUnlockHint}>
                        {lang === 0
                            ? `Ближайший ранг: ${stats.level.nextRank.title} на уровне ${stats.level.nextRank.level}`
                            : `Next rank: ${stats.level.nextRank.title} at level ${stats.level.nextRank.level}`}
                    </div>
                )}
            </div>

            <div style={s.xpRuleGrid}>
                {XP_RULES.map(rule => {
                    const active = rule.key === selectedRule.key;
                    const icon = XP_RULE_ICONS[rule.key];
                    return (
                        <MotionButton
                            key={rule.key}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onSelectRule(rule.key)}
                            style={{
                                ...s.xpRuleButton,
                                borderColor: active ? rule.color : `${Colors.get('border', theme)}50`,
                                backgroundColor: active ? `${rule.color}18` : Colors.get('simplePanel', theme)
                            }}
                        >
                            <span style={{ ...s.xpRuleIcon, color: rule.color }}>{icon}</span>
                            <span style={s.xpRuleLabel}>{rule.label[lang]}</span>
                            <span style={{ ...s.xpRuleValue, color: rule.color }}>+{rule.xp}</span>
                        </MotionButton>
                    );
                })}
            </div>

            <MotionDiv
                key={selectedRule.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                style={s.xpRuleDetails}
            >
                <div style={{ ...s.xpRuleDetailsIcon, color: selectedRule.color, backgroundColor: `${selectedRule.color}18` }}>
                    {selectedRule.icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={s.xpDetailsTitle}>{selectedRule.label[lang]}</div>
                    <div style={s.xpDetailsText}>{selectedRule.description[lang]}</div>
                </div>
                <div style={s.xpDetailsScore}>
                    <span style={{ color: selectedRule.color }}>+{selectedRule.xp} XP</span>
                    <small>{selectedCount} x = {selectedEarned}</small>
                </div>
            </MotionDiv>
        </div>
    );
};

const FriendCard = ({ friend, theme }) => {
    // Calculate progress based on friend.xp and friend.level
    // Assuming xp needed for next level is level * 500
    const level = friend.level || 1;
    const xp = friend.xp || 0;
    const maxXp = level * 500;
    const pct = Math.min(100, Math.max(0, (xp / maxXp) * 100));

    return (
        <div style={styles(theme).friendCard}>
            {/* Friend Avatar */}
            <div style={styles(theme).friendAvatar}>
                {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
            </div>

            {/* Friend Info & Progress */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={styles(theme).friendName}>
                        {friend.name}
                    </span>
                    <span style={styles(theme).friendLevel}>
                        LVL {level}
                    </span>
                </div>
                
                {/* Mini XP Bar */}
                <div style={styles(theme).friendTrack}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: Colors.get('accent', theme), borderRadius: '999px' }} />
                </div>
            </div>
        </div>
    );
};

const BottomSheet = ({ children, onClose, theme }) => (
    <div style={styles(theme).backdrop} onClick={onClose}>
        <MotionDiv 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={styles(theme).sheet} onClick={e => e.stopPropagation()}
        >
            <div style={styles(theme).handle} />
            {children}
        </MotionDiv>
    </div>
);

const ProfileDock = ({ theme, lang, onBack, onHome, onSettings }) => {
    const s = styles(theme);
    return (
        <div style={s.profileDock}>
            <ProfileDockButton
                icon={<IoIosArrowBack size={23} />}
                label={lang === 0 ? 'Назад' : 'Back'}
                onClick={onBack}
                theme={theme}
            />
            <ProfileDockButton
                icon={<FaHome size={21} />}
                label={lang === 0 ? 'Домой' : 'Home'}
                onClick={onHome}
                theme={theme}
            />
            <ProfileDockButton
                icon={<FaCog size={22} />}
                label={lang === 0 ? 'Настройки' : 'Settings'}
                onClick={onSettings}
                theme={theme}
            />
        </div>
    );
};

const ProfileDockButton = ({ icon, label, onClick, theme }) => (
    <MotionButton
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        aria-label={label}
        style={styles(theme).profileDockButton}
    >
        {icon}
    </MotionButton>
);

const GenderToggle = ({ active, icon, label, color, onClick, theme }) => (
    <MotionButton
        type="button"
        whileTap={{scale:0.96}} onClick={onClick}
        style={{
            flex: 1,
            minHeight:'38px',
            borderRadius:'12px',
            backgroundColor: active ? `${color}28` : 'transparent',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap: '6px',
            fontSize:'18px',
            color: active ? Colors.get('text', theme) : Colors.get('subText', theme),
            border: active ? `1px solid ${color}78` : `1px solid ${Colors.get('border', theme)}66`,
            boxShadow: active ? `0 10px 22px -18px ${color}` : 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: 820,
            padding: '0 10px',
            margin: 0,
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent'
        }}
    >
        <span style={{display: 'flex', alignItems: 'center'}}>{icon}</span>
        <span style={{fontSize: '12px'}}>{label}</span>
    </MotionButton>
);

const GoalChip = ({ active, label, onClick, theme }) => {
    const isLight = theme === 'light';
    return (
        <MotionButton
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            style={{
                minHeight: '38px',
                borderRadius: '13px',
                padding: '0 10px',
                border: active
                    ? '1px solid rgba(95,182,198,0.55)'
                    : `1px solid ${Colors.get('border', theme)}66`,
                background: active
                    ? (isLight ? 'rgba(95,182,198,0.16)' : 'rgba(95,182,198,0.18)')
                    : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.032)'),
                color: active ? Colors.get('text', theme) : Colors.get('subText', theme),
                fontFamily: 'inherit',
                fontSize: '11px',
                fontWeight: active ? 850 : 720,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 10px 24px -22px rgba(95,182,198,0.75)' : 'none',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                WebkitTapHighlightColor: 'transparent'
            }}
        >
            {label}
        </MotionButton>
    );
};

const ModalActions = ({ onClose, onConfirm, theme, lang }) => (
    <div style={styles(theme).modalActions}>
        <MotionButton whileTap={{scale:0.97}} onClick={onClose} style={styles(theme).secBtn}>
            <span>{lang === 0 ? 'Отмена' : 'Cancel'}</span>
        </MotionButton>
        <MotionButton whileTap={{scale:0.97}} onClick={onConfirm} style={styles(theme).priBtn}>
            <span>{lang === 0 ? 'Сохранить' : 'Save'}</span>
        </MotionButton>
    </div>
);

const BodyMetricPicker = ({ icon, label, items, value, onChange, suffix, theme, width = '116px' }) => {
    const s = styles(theme);
    return (
        <div style={s.bodyMetricCard}>
            <div style={s.bodyMetricTop}>
                <div style={s.bodyMetricIcon}>{icon}</div>
                <div style={s.bodyMetricLabel}>{label}</div>
            </div>
            <ScrollPicker
                items={items}
                value={value}
                onChange={onChange}
                suffix={suffix}
                theme={theme}
                width={width}
            />
        </div>
    );
};

const ActivityLevelPicker = ({ value, onChange, lang, theme }) => {
    const s = styles(theme);
    const options = [
        { id: 0, icon: <FaBed />, title: lang === 0 ? 'Низкая' : 'Low' },
        { id: 1, icon: <FaWalking />, title: lang === 0 ? 'Умеренная' : 'Moderate' },
        { id: 2, icon: <FaFire />, title: lang === 0 ? 'Активная' : 'Active' },
        { id: 3, icon: <FaDumbbell />, title: lang === 0 ? 'Спорт' : 'Athletic' }
    ];

    return (
        <div style={s.activityPanel}>
            <div style={s.activityHeader}>
                <span>{lang === 0 ? 'Активность' : 'Activity'}</span>
            </div>
            <div style={s.activityOptions}>
                {options.map(option => {
                    const active = option.id === value;
                    return (
                        <MotionButton
                            key={option.id}
                            type="button"
                            whileTap={{ scale: 0.96 }}
                            onClick={() => onChange(option.id)}
                            style={{
                                ...s.activityOption,
                                ...(active ? s.activityOptionActive : {})
                            }}
                        >
                            <span style={s.activityIcon}>{option.icon}</span>
                            <span style={s.activityTitle}>{option.title}</span>
                        </MotionButton>
                    );
                })}
            </div>
        </div>
    );
};

const SectionHeader = ({ title, theme, actionLabel, onAction, meta, right }) => {
    const s = styles(theme);
    return (
        <div style={s.contentHeader}>
            <div style={s.contentHeaderRow}>
                <div style={s.contentTitle}>{title}</div>
                {meta && <div style={s.contentMeta}>{meta}</div>}
                {right}
                {actionLabel && (
                    <MotionButton
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={onAction}
                        style={s.contentAction}
                    >
                        {actionLabel}
                    </MotionButton>
                )}
            </div>
        </div>
    );
};

const PeriodToggle = ({ value, onChange, lang, theme }) => {
    const s = styles(theme);
    const options = [
        { value: 7, label: lang === 0 ? '7 д' : '7d' },
        { value: 30, label: lang === 0 ? '30 д' : '30d' },
        { value: 90, label: lang === 0 ? '90 д' : '90d' }
    ];

    return (
        <div style={s.periodToggle}>
            {options.map(option => {
                const active = option.value === value;
                return (
                    <MotionButton
                        key={option.value}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onChange(option.value)}
                        style={{
                            ...s.periodButton,
                            ...(active ? s.periodButtonActive : {})
                        }}
                    >
                        {option.label}
                    </MotionButton>
                );
            })}
        </div>
    );
};

const SparkLine = ({ data = [], color, theme }) => {
    const s = styles(theme);
    const width = 128;
    const height = 30;
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    const points = data.map((value, index) => {
        const x = data.length <= 1 ? 0 : (index / (data.length - 1)) * width;
        const y = height - 3 - ((value - min) / range) * (height - 8);
        return [x, y];
    });
    const line = points.reduce((path, point, index) => {
        const [x, y] = point;
        if (index === 0) return `M ${x.toFixed(1)} ${y.toFixed(1)}`;
        const [prevX, prevY] = points[index - 1];
        const cx = (prevX + x) / 2;
        return `${path} Q ${cx.toFixed(1)} ${prevY.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, '');
    const area = `${line} L ${width} ${height} L 0 ${height} Z`;
    const gradientId = `profile-spark-${color.replace('#', '')}`;

    if (!data.some(Boolean)) {
        return <div style={s.sparkEmptyLine} />;
    }

    return (
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={s.sparkLine}>
            <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.32" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.length > 0 && (
                <circle
                    cx={points[points.length - 1][0]}
                    cy={points[points.length - 1][1]}
                    r="2.4"
                    fill={color}
                    stroke={Colors.get('background', theme)}
                    strokeWidth="1.4"
                />
            )}
        </svg>
    );
};

const PremiumPanel = ({ lang, theme, onClick }) => {
    const s = styles(theme);
    return (
        <MotionButton
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={s.premiumCard}
        >
            <div style={s.premiumHalo} />
            <div style={s.premiumIcon}>
                <FaCrown size={22} color="#1a1410" />
            </div>
            <div style={s.premiumText}>
                <span style={s.premiumTitle}>
                    UML Premium
                </span>
                <span style={s.premiumSubtitle}>
                    {lang === 0 ? 'Расширенная аналитика, ИИ и облако' : 'Advanced analytics, AI & cloud'}
                </span>
            </div>
            <div style={s.premiumStatus}>
                {lang === 0 ? 'Открыть' : 'Open'}
            </div>
        </MotionButton>
    );
};

const InviteFriendCard = ({ lang, theme, onClick, empty }) => {
    const s = styles(theme);
    return (
        <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={onClick} style={s.inviteCard}>
            <div style={s.inviteGlow} />
            <div style={s.inviteIcon}><FaShareAlt /></div>
            <div style={s.inviteText}>
                <div style={s.inviteTitle}>{lang === 0 ? 'Пригласить друга' : 'Invite a friend'}</div>
                <div style={s.inviteSubtitle}>
                    {empty
                        ? (lang === 0 ? 'Друзей пока нет. Отправь ссылку и начни собирать круг.' : 'No friends yet. Send a link and start your circle.')
                        : (lang === 0 ? 'Поделись приложением и развивайтесь вместе.' : 'Share the app and progress together.')}
                </div>
            </div>
            <IoIosArrowForward size={18} style={s.inviteArrow} />
        </MotionButton>
    );
};

const MetricChip = ({ icon, label, value, unit, color, series, theme, onClick }) => (
    <MotionButton
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        style={{
            ...styles(theme).metricChip,
            background: styles(theme).isLight
                ? `linear-gradient(145deg, rgba(255,255,255,0.95) 0%, ${color}12 100%)`
                : `linear-gradient(145deg, rgba(22,25,28,0.96) 0%, rgba(18,20,23,0.92) 56%, ${color}14 100%)`,
            borderColor: `${color}14`,
            boxShadow: styles(theme).isLight
                ? `0 18px 36px -30px ${color}40`
                : `0 22px 42px -34px ${color}52`
        }}
    >
        <div style={{ ...styles(theme).metricAccent, background: `linear-gradient(90deg, ${color}, transparent)` }} />
        <div style={styles(theme).metricTopRow}>
            <div style={{ ...styles(theme).metricIcon, color, backgroundColor: `${color}18`, borderColor: `${color}35` }}>{icon}</div>
            <div style={{ ...styles(theme).metricArrow, color }}>
                <IoIosArrowForward size={15} />
            </div>
        </div>
        <div style={styles(theme).metricText}>
            <div style={styles(theme).metricLabel}>{label}</div>
            <div style={styles(theme).metricAmount}>
                <span style={styles(theme).metricValue}>{value || 0}</span>
                <span style={styles(theme).metricUnit}>{unit}</span>
            </div>
        </div>
        <SparkLine data={series} color={color} theme={theme} />
    </MotionButton>
);

const BodyPills = ({ body, lang, theme, onEdit }) => {
    const s = styles(theme);
    const items = [
        { icon: <FaBirthdayCake />, label: lang === 0 ? 'Возраст' : 'Age', value: body.age, unit: lang === 0 ? 'лет' : 'y' },
        { icon: <FaRulerVertical />, label: lang === 0 ? 'Рост' : 'Height', value: body.height, unit: lang === 0 ? 'см' : 'cm' },
        { icon: <FaWeight />, label: lang === 0 ? 'Вес' : 'Weight', value: body.weight, unit: lang === 0 ? 'кг' : 'kg' },
        { icon: <FaBullseye />, label: lang === 0 ? 'Цель' : 'Goal', value: body.goal, unit: '' },
        { icon: <FaRunning />, label: lang === 0 ? 'Активность' : 'Activity', value: body.activity, unit: '' }
    ];

    return (
        <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={onEdit} style={s.bodyPillsCard}>
            <div style={s.bodyPillsTop}>
                <span style={s.bodyPillsTitle}>{lang === 0 ? 'Личные данные' : 'Personal data'}</span>
                <span style={s.bodyPillsEdit}><MdEdit size={15} /></span>
            </div>
            <div style={s.bodyDataList}>
                {items.map((item, index) => (
                <div
                    style={{
                        ...s.bodyDataRow,
                        ...(index < items.length - 1 ? { borderBottom: s.bodyPillHairline } : {})
                    }}
                    key={`${item.label}-${index}`}
                >
                    <div style={s.bodyDataLabel}>
                        <span style={s.bodyPillIcon}>{item.icon}</span>
                        <span style={s.bodyPillLabel}>{item.label}</span>
                    </div>
                    <span style={s.bodyPillValue}>
                        {item.value}
                        {item.unit && <small style={s.bodyPillUnit}>{item.unit}</small>}
                    </span>
                </div>
                ))}
            </div>
        </MotionButton>
    );
};

const FriendsCompact = ({ friends, lang, theme, onInvite, onOpen }) => {
    const s = styles(theme);
    const topFriends = friends.slice(0, 3);
    const hasFriends = friends.length > 0;

    return (
        <div style={s.friendsBlock}>
            <InviteFriendCard lang={lang} theme={theme} onClick={onInvite} empty={!hasFriends} />
            {hasFriends && (
                <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={onOpen} style={s.friendsCompactCard}>
                    <div style={s.friendsAvatars}>
                        {topFriends.map((friend, index) => {
                            const name = friend.name || '?';
                            const tones = ['#8A7CD6', '#7AA988', '#D49A5C'];
                            const tone = friend.tone || tones[index % tones.length];
                            return (
                                <span
                                    key={`${name}-${index}`}
                                    style={{
                                        ...s.friendBubble,
                                        background: `${tone}24`,
                                        borderColor: Colors.get('background', theme),
                                        color: tone,
                                        marginLeft: index === 0 ? 0 : -10,
                                        zIndex: 4 - index
                                    }}
                                >
                                    {name.charAt(0).toUpperCase()}
                                </span>
                            );
                        })}
                    </div>
                    <div style={s.friendsCompactText}>
                        <div style={s.friendsCompactTitle}>
                            {`${friends.length} ${friendPlural(friends.length, lang)}`}
                        </div>
                        <div style={s.friendsCompactSub}>
                            {topFriends.map(friend => friend.name).filter(Boolean).join(' · ')}
                        </div>
                    </div>
                    <IoIosArrowForward size={18} color={Colors.get('subText', theme)} style={{ opacity: 0.8, flexShrink: 0 }} />
                </MotionButton>
            )}
        </div>
    );
};

const InfoCard = ({ icon, label, value, theme, fullWidth, onClick }) => (
    <MotionButton
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        style={{ ...styles(theme).infoCard, gridColumn: fullWidth ? 'span 2' : 'span 1' }}
    >
        <div style={styles(theme).infoIcon}>{icon}</div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={styles(theme).infoLabel}>{label}</span>
            <span style={styles(theme).infoValue}>{value}</span>
        </div>
    </MotionButton>
);

const styles = (theme) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const panel = isLight ? 'rgba(255,255,255,0.86)' : 'rgba(26,29,33,0.84)';
    const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,23,25,0.92)';
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';
    const faint = isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.04)';

    return {
        isLight,
        container: {
            background: isLight
                ? 'radial-gradient(900px 450px at 80% -10%, rgba(201,162,75,0.11), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(111,139,214,0.1), transparent 58%), #F4F5F7'
                : 'radial-gradient(1000px 500px at 80% -10%, rgba(201,162,75,0.08), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(138,124,214,0.06), transparent 55%), #0E1013',
            display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            zIndex: 3000, position: 'fixed', top: 0, left: 0, color: text
        },
        header: {
            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%',
            padding: `${HEADER_TOP_PADDING} 20px 12px 20px`, minHeight: '66px', position: 'relative', boxSizing: 'border-box'
        },
        backBtn: {
            position: 'absolute', left: '20px', width: '38px', height: '38px',
            borderRadius: '13px', background: panel, color: text,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            cursor: 'pointer'
        },
        headerTitle: { fontSize: '15px', fontWeight: '850', color: text, letterSpacing: 0 },
        scrollContent: { flex: 1, overflowY: 'auto', padding: '0 20px calc(92px + env(safe-area-inset-bottom, 0px))', boxSizing: 'border-box' },
        heroSection: {
            margin: '4px 0 16px',
            padding: '18px',
            borderRadius: '24px',
            border: '1px solid',
            position: 'relative',
            overflow: 'hidden'
        },
        heroColorWash: {
            position: 'absolute',
            right: '-44px',
            top: '-58px',
            width: '170px',
            height: '170px',
            borderRadius: '50%',
            pointerEvents: 'none'
        },
        heroTopRow: { display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 1 },
        profileDock: {
            position: 'fixed',
            left: '50%',
            bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
            transform: 'translateX(-50%)',
            zIndex: 40,
            width: '230px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '10px 14px',
            boxSizing: 'border-box',
            borderRadius: '999px',
            background: panelStrong,
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)'
        },
        profileDockButton: {
            width: '44px',
            height: '44px',
            borderRadius: '999px',
            border: '1px solid transparent',
            cursor: 'pointer',
            background: 'transparent',
            color: sub,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: 0,
            fontFamily: 'inherit',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent'
        },
        heroIdentity: { flex: 1, minWidth: 0, textAlign: 'left' },
        heroEyebrow: {
            fontSize: '10px', color: sub, fontWeight: 800, letterSpacing: '0.06em',
            textTransform: 'uppercase', marginBottom: '5px'
        },
        avatarWrapper: {
            width: '68px', height: '68px', borderRadius: '20px', border: '1px solid',
            padding: '5px', position: 'relative', flexShrink: 0,
            background: faint, boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset'
        },
        avatarImg: { width: '100%', height: '100%', borderRadius: '15px', objectFit: 'cover', display: 'block' },
        avatarPlaceholder: {
            width: '100%', height: '100%', borderRadius: '15px', background: panelStrong,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '30px', fontWeight: '900', color: text
        },
        premiumMiniBadge: {
            position: 'absolute', bottom: '-3px', right: '-3px',
            backgroundColor: '#CAD6DF', color: '#0E1013', width: '28px', height: '28px',
            borderRadius: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: `2px solid ${isLight ? '#fff' : '#0E1013'}`, zIndex: 1
        },
        levelBadge: {
            minWidth: '50px', padding: '8px 10px', borderRadius: '15px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '1px solid', flexShrink: 0, boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
        },
        levelLabel: {fontSize: '9px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.06em'},
        levelValue: {fontSize: '17px', fontWeight: '760', lineHeight: 1, fontVariantNumeric: 'tabular-nums'},
        userName: {
            fontSize: '22px', fontWeight: '820', color: text, margin: 0, lineHeight: 1.05,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        },
        userMetaRow: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', minWidth: 0 },
        userTitle: {
            fontSize: '11px', fontWeight: '850', textTransform: 'uppercase', letterSpacing: '0.04em',
            border: '1px solid', borderRadius: '999px', padding: '5px 9px',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%'
        },
        genderBadge: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '999px', border: '1px solid', flexShrink: 0
        },
        xpContainer: { width: '100%', marginTop: '17px', position: 'relative', zIndex: 1 },
        xpInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '750', color: sub, marginBottom: '7px' },
        xpInfoButton: {
            border: 'none', background: 'transparent', color: sub, padding: 0, margin: 0,
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer'
        },
        xpTrack: { width: '100%', height: '8px', backgroundColor: faint, borderRadius: '999px', overflow: 'hidden', border: `1px solid ${border}` },
        xpFill: { height: '100%', borderRadius: '999px' },
        xpGuide: { display: 'flex', flexDirection: 'column', gap: '16px' },
        xpGuideHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '2px' },
        xpGuideSubtitle: { color: sub, fontSize: '13px', fontWeight: '700', marginTop: '5px' },
        xpNextBadge: { border: '1px solid', borderRadius: '14px', padding: '10px 12px', fontSize: '13px', fontWeight: '900', flexShrink: 0 },
        xpUnlockPanel: { background: panel, border: `1px solid ${border}`, borderRadius: '18px', padding: '15px' },
        xpUnlockTitle: { color: sub, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' },
        xpUnlockText: { color: text, fontSize: '16px', fontWeight: '800' },
        xpUnlockHint: { color: sub, fontSize: '12px', fontWeight: '600', marginTop: '7px' },
        xpRuleGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' },
        xpRuleButton: {
            minHeight: '78px', borderRadius: '16px', border: '1px solid',
            padding: '10px', display: 'grid', gridTemplateColumns: '24px 1fr',
            gridTemplateRows: '1fr auto', alignItems: 'center', gap: '4px 8px',
            textAlign: 'left', cursor: 'pointer'
        },
        xpRuleIcon: { fontSize: '18px', display: 'flex', alignItems: 'center' },
        xpRuleLabel: { color: text, fontSize: '13px', fontWeight: '800', lineHeight: 1.15 },
        xpRuleValue: { gridColumn: '1 / span 2', fontSize: '12px', fontWeight: '900' },
        xpRuleDetails: {
            background: panel, border: `1px solid ${border}`,
            borderRadius: '18px', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px'
        },
        xpRuleDetailsIcon: {
            width: '42px', height: '42px', borderRadius: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', flexShrink: 0
        },
        xpDetailsTitle: { color: text, fontSize: '15px', fontWeight: '850', marginBottom: '3px' },
        xpDetailsText: { color: sub, fontSize: '12px', fontWeight: '600', lineHeight: 1.35 },
        xpDetailsScore: {
            minWidth: '70px', display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', gap: '2px', fontSize: '14px', fontWeight: '900'
        },
        metricsScrollContainer: {
            display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px', margin: '0 0 16px'
        },
        contentHeader: {
            margin: '4px 2px 8px',
            textAlign: 'left'
        },
        contentHeaderRow: {
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
        },
        contentTitle: {
            fontSize: '11px',
            fontWeight: '850',
            color: sub,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
        },
        contentMeta: {
            color: sub,
            opacity: 0.72,
            fontSize: '10px',
            fontWeight: '850',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        contentAction: {
            border: `1px solid ${border}`,
            background: faint,
            color: text,
            borderRadius: '999px',
            padding: '6px 10px',
            fontSize: '11px',
            fontWeight: '850',
            lineHeight: 1,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap'
        },
        periodToggle: {
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '3px',
            borderRadius: '999px',
            background: faint,
            border: `1px solid ${border}`,
            flexShrink: 0
        },
        periodButton: {
            minWidth: '34px',
            height: '24px',
            border: 'none',
            borderRadius: '999px',
            background: 'transparent',
            color: sub,
            fontSize: '10px',
            fontWeight: '760',
            lineHeight: 1,
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: '0 8px'
        },
        periodButtonActive: {
            background: isLight ? 'rgba(15,23,42,0.09)' : 'rgba(255,255,255,0.09)',
            color: text,
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset'
        },
        metricChip: {
            minHeight: '166px',
            borderRadius: '22px',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: '11px',
            border: '1px solid transparent',
            boxShadow: 'none',
            minWidth: 0,
            cursor: 'pointer',
            fontFamily: 'inherit',
            color: text,
            textAlign: 'left',
            position: 'relative',
            overflow: 'hidden'
        },
        metricAccent: {
            position: 'absolute',
            left: '14px',
            right: '14px',
            bottom: 0,
            height: '2px',
            opacity: 0.72,
            pointerEvents: 'none'
        },
        metricTopRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%' },
        metricIcon: {
            width: '42px', height: '42px', borderRadius: '14px', border: '1px solid',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
        },
        metricArrow: {
            width: '28px',
            height: '28px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
            opacity: 0.88,
            flexShrink: 0
        },
        metricText: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '7px', textAlign: 'left', marginTop: '2px' },
        metricAmount: { display: 'flex', alignItems: 'baseline', gap: '5px', minWidth: 0 },
        metricValue: { fontSize: '29px', fontWeight: '720', color: text, lineHeight: 0.98, fontVariantNumeric: 'tabular-nums' },
        metricLabel: { fontSize: '15px', color: text, opacity: 0.82, fontWeight: '760', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        metricUnit: { fontSize: '12px', color: sub, fontWeight: '650', lineHeight: 1.1, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        sparkLine: { display: 'block', width: '100%', marginTop: '2px', overflow: 'visible' },
        sparkEmptyLine: {
            height: '1px',
            width: '100%',
            marginTop: '16px',
            background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.06)'
        },
        bodyPillsCard: {
            width: '100%',
            borderRadius: '22px',
            padding: '14px 14px 10px',
            margin: '0 0 26px',
            background: isLight
                ? 'linear-gradient(145deg, rgba(255,255,255,0.96), rgba(247,249,252,0.88))'
                : 'linear-gradient(145deg, rgba(24,27,31,0.98), rgba(16,18,21,0.94))',
            border: `1px solid ${border}`,
            boxShadow: isLight
                ? '0 1px 0 rgba(255,255,255,0.92) inset, 0 18px 34px -30px rgba(15,23,42,0.32)'
                : '0 1px 0 rgba(255,255,255,0.055) inset, 0 18px 38px -30px rgba(0,0,0,0.88)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '8px',
            color: text,
            fontFamily: 'inherit',
            cursor: 'pointer',
            minWidth: 0,
            textAlign: 'left'
        },
        bodyPillsTop: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
        },
        bodyPillsTitle: {
            fontSize: '12px',
            fontWeight: '850',
            color: sub,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
        },
        bodyPillsEdit: {
            width: '30px',
            height: '30px',
            borderRadius: '11px',
            color: sub,
            background: faint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        bodyDataList: {
            display: 'flex',
            flexDirection: 'column'
        },
        bodyDataRow: {
            minWidth: 0,
            minHeight: '46px',
            padding: '8px 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
        },
        bodyPillHairline: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
        bodyDataLabel: {
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            minWidth: 0,
            flex: 1
        },
        bodyPillIcon: {
            color: sub,
            opacity: 0.78,
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        bodyPillLabel: {
            minWidth: 0,
            color: sub,
            fontSize: '11px',
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        bodyPillValue: {
            minWidth: 0,
            color: text,
            maxWidth: '58%',
            textAlign: 'right',
            fontSize: '15px',
            fontWeight: '760',
            lineHeight: 1.1,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            fontVariantNumeric: 'tabular-nums'
        },
        bodyPillUnit: {
            marginLeft: '3px',
            color: sub,
            fontSize: '11px',
            fontWeight: '650'
        },
        bodyPillDivider: {
            width: '1px',
            height: '24px',
            flexShrink: 0,
            background: border
        },
        bodyPillEdit: {
            width: '28px',
            height: '28px',
            borderRadius: '10px',
            color: sub,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
        },
        friendsBlock: {
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            margin: '0 0 18px'
        },
        friendsCompactCard: {
            width: '100%',
            minHeight: '76px',
            borderRadius: '20px',
            padding: '13px 14px',
            margin: 0,
            background: isLight
                ? 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(247,249,252,0.86))'
                : 'linear-gradient(145deg, rgba(23,26,30,0.92), rgba(18,20,23,0.9))',
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: text,
            fontFamily: 'inherit',
            cursor: 'pointer',
            textAlign: 'left'
        },
        friendsAvatars: { display: 'flex', alignItems: 'center', flexShrink: 0, minWidth: '64px' },
        friendBubble: {
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: '2px solid',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: '900',
            boxShadow: '0 10px 24px -18px rgba(0,0,0,0.9)'
        },
        friendsCompactText: { flex: 1, minWidth: 0 },
        friendsCompactTitle: { fontSize: '16px', fontWeight: '900', color: text, lineHeight: 1.1 },
        friendsCompactSub: {
            marginTop: '4px',
            fontSize: '12px',
            fontWeight: '650',
            color: sub,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '0 0 18px' },
        infoCard: {
            background: panel, borderRadius: '18px', padding: '14px',
            display: 'flex', alignItems: 'center', gap: '11px',
            border: `1px solid ${border}`, boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset', minWidth: 0,
            cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left'
        },
        infoIcon: {
            width: '34px', height: '34px', borderRadius: '12px', color: Colors.get('accent', theme),
            background: faint, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', flexShrink: 0
        },
        infoLabel: { fontSize: '10px', color: sub, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' },
        infoValue: { fontSize: '14px', fontWeight: '850', color: text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
        sectionBlock: { margin: '0 0 12px' },
        sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', padding: '0 2px' },
        sectionTitle: {
            display: 'flex', alignItems: 'center', gap: '8px',
            fontSize: '11px', fontWeight: '850', color: sub,
            letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer'
        },
        sectionIconColor: { color: sub },
        textButton: { background:'none', border:'none', color:Colors.get('accent', theme), fontWeight:'800', fontSize:'12px', cursor:'pointer', padding: '6px 0' },
        emptyState: {
            background: panel, borderRadius: '22px', padding: '22px 18px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `1px dashed ${border}`
        },
        emptyText: {fontSize:'13px', color: sub, textAlign:'center', marginBottom:'12px', lineHeight: 1.35},
        inviteCard: {
            position: 'relative',
            width: '100%',
            minHeight: '74px',
            padding: '14px',
            borderRadius: '20px',
            border: `1px solid ${isLight ? 'rgba(102,217,232,0.24)' : 'rgba(102,217,232,0.22)'}`,
            background: isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.92), rgba(232,250,253,0.82))'
                : 'linear-gradient(135deg, rgba(22,34,38,0.9), rgba(20,23,25,0.86))',
            color: text,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            overflow: 'hidden',
            fontFamily: 'inherit',
            textAlign: 'left',
            boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 34px -26px rgba(0,0,0,0.7)'
        },
        inviteGlow: {
            position: 'absolute',
            inset: '-80% -35% auto auto',
            width: '190px',
            height: '190px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(102,217,232,0.15) 0%, transparent 62%)',
            pointerEvents: 'none'
        },
        inviteIcon: {
            width: '42px',
            height: '42px',
            borderRadius: '14px',
            background: 'rgba(102,217,232,0.14)',
            border: '1px solid rgba(102,217,232,0.28)',
            color: '#66D9E8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '17px',
            flexShrink: 0,
            zIndex: 1
        },
        inviteText: { flex: 1, minWidth: 0, zIndex: 1 },
        inviteTitle: { fontSize: '14px', fontWeight: '900', color: text, lineHeight: 1.15 },
        inviteSubtitle: { marginTop: '4px', fontSize: '12px', fontWeight: '650', color: sub, lineHeight: 1.25 },
        inviteArrow: { color: '#66D9E8', flexShrink: 0, zIndex: 1 },
        premiumCard: {
            position: 'relative', borderRadius: '20px', padding: '16px', marginBottom: '16px',
            display: 'flex', alignItems: 'center', gap: '14px',
            background: isLight
                ? 'linear-gradient(135deg, rgba(255,255,255,0.94), rgba(234,241,246,0.9))'
                : 'linear-gradient(135deg, rgba(25,31,36,0.94), rgba(18,22,26,0.9))',
            border: '1px solid rgba(159,180,196,0.3)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 16px 34px -24px rgba(0,0,0,0.7)',
            cursor: 'pointer', overflow: 'hidden', width: '100%', fontFamily: 'inherit', textAlign: 'left'
        },
        premiumHalo: {
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 100% 50%, rgba(159,180,196,0.16) 0%, transparent 60%)',
            pointerEvents: 'none'
        },
        premiumIcon: {
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #CAD6DF 0%, #9FB4C4 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(159,180,196,0.28)',
            flexShrink: 0, zIndex: 1
        },
        premiumText: { display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1, minWidth: 0, textAlign: 'left' },
        premiumTitle: { fontSize: '16px', fontWeight: '900', color: text, lineHeight: 1.1 },
        premiumSubtitle: { fontSize: '12px', color: sub, marginTop: '4px', fontWeight: '650', lineHeight: 1.25 },
        premiumStatus: {
            zIndex: 1,
            flexShrink: 0,
            padding: '7px 9px',
            borderRadius: '999px',
            border: '1px solid rgba(159,180,196,0.32)',
            color: '#9FB4C4',
            background: 'rgba(159,180,196,0.12)',
            fontSize: '11px',
            fontWeight: '850'
        },
        premiumInfo: { display: 'flex', alignItems: 'center', gap: '18px' },
        premTitle: { fontSize: '17px', fontWeight: '900' },
        premSub: { fontSize: '12px', fontWeight: 'bold' },
        actionList: {
            background: panel, borderRadius: '20px', overflow: 'hidden', marginTop: '12px',
            border: `1px solid ${border}`, boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
        },
        actionItem: { display: 'flex', alignItems: 'center', padding: '16px', cursor: 'pointer', gap: '12px' },
        actionIcon: {
            width: '38px', height: '38px', borderRadius: '13px', background: faint,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0
        },
        actionLabel: { fontSize: '14px', fontWeight: '800', flex: 1, textAlign: 'left' },
        friendCard: {
            background: panel, borderRadius: '18px', padding: '11px 13px',
            display: 'flex', alignItems: 'center', gap: '12px',
            border: `1px solid ${border}`, boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
        },
        friendAvatar: {
            width: '40px', height: '40px', borderRadius: '13px',
            background: faint, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: '900', color: text, flexShrink: 0
        },
        friendName: { fontSize: '14px', fontWeight: '800', color: text },
        friendLevel: { fontSize: '10px', fontWeight: '850', color: Colors.get('accent', theme), backgroundColor: 'rgba(255,215,0,0.1)', padding:'3px 7px', borderRadius:'999px' },
        friendTrack: { width: '100%', height: '5px', backgroundColor: faint, borderRadius: '999px', overflow: 'hidden' },
        backdrop: {
            position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)',
            zIndex:3000, display:'flex', alignItems:'flex-end', justifyContent:'center'
        },
        sheet: {
            width:'100%', maxWidth:'600px',
            background: isLight
                ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(244,246,249,0.96))'
                : 'linear-gradient(180deg, rgba(20,23,26,0.98), rgba(13,15,17,0.98))',
            borderTopLeftRadius:'30px', borderTopRightRadius:'30px',
            padding:'18px 20px 32px 20px', boxShadow:'0 -10px 40px rgba(0,0,0,0.3)',
            borderTop: `1px solid ${border}`,
            display: 'flex', flexDirection: 'column'
        },
        handle: {
            width:'40px', height:'4px', backgroundColor: sub,
            borderRadius:'2px', margin:'0 auto 16px auto', opacity:0.3
        },
        modalTitle: { fontSize:'20px', fontWeight:'820', color:text, margin:0, textAlign:'center', lineHeight: 1.1 },
        bodyMetricsHeader: {
            marginBottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px'
        },
        bodyMetricsSubtitle: {
            maxWidth: '320px',
            color: sub,
            fontSize: '12px',
            fontWeight: '620',
            lineHeight: 1.35,
            textAlign: 'center'
        },
        bodyMetricsForm: { display: 'flex', flexDirection: 'column', gap: '12px' },
        bodyMetricsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '8px'
        },
        bodyMetricCard: {
            minHeight: '132px',
            borderRadius: '18px',
            background: isLight ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.026)',
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset',
            padding: '11px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 0
        },
        bodyMetricTop: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            justifyContent: 'center'
        },
        bodyMetricIcon: {
            width: '26px',
            height: '26px',
            borderRadius: '9px',
            background: isLight ? 'rgba(95,182,198,0.11)' : 'rgba(95,182,198,0.12)',
            color: '#5fb6c6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            flexShrink: 0
        },
        bodyMetricLabel: {
            color: sub,
            fontSize: '10px',
            fontWeight: '820',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        activityPanel: {
            borderRadius: '20px',
            padding: '14px',
            background: isLight
                ? 'linear-gradient(145deg, rgba(255,255,255,0.86), rgba(232,250,253,0.62))'
                : 'linear-gradient(145deg, rgba(22,34,38,0.64), rgba(17,20,23,0.82))',
            border: `1px solid ${isLight ? 'rgba(95,182,198,0.2)' : 'rgba(95,182,198,0.18)'}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset'
        },
        activityHeader: {
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '10px',
            color: text,
            fontSize: '12px',
            fontWeight: '840',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
        },
        activityOptions: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '7px'
        },
        activityOption: {
            minHeight: '62px',
            borderRadius: '15px',
            border: `1px solid ${border}`,
            background: isLight ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.035)',
            color: sub,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 4px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            minWidth: 0
        },
        activityOptionActive: {
            borderColor: 'rgba(95,182,198,0.5)',
            background: isLight ? 'rgba(95,182,198,0.16)' : 'rgba(95,182,198,0.18)',
            color: text,
            boxShadow: '0 10px 24px -22px rgba(95,182,198,0.75)'
        },
        activityIcon: {
            fontSize: '15px',
            color: '#5fb6c6',
            display: 'flex',
            alignItems: 'center'
        },
        activityTitle: {
            fontSize: '11px',
            fontWeight: '820',
            lineHeight: 1,
            whiteSpace: 'nowrap'
        },
        bodyPreferencePanel: {
            borderRadius: '20px',
            background: isLight
                ? 'rgba(255,255,255,0.74)'
                : 'rgba(255,255,255,0.026)',
            border: `1px solid ${border}`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
            padding: '14px'
        },
        preferenceTitleRow: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '10px',
            textAlign: 'center'
        },
        preferenceTitle: {
            color: sub,
            fontSize: '11px',
            fontWeight: '850',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
        },
        preferenceHint: {
            marginTop: '3px',
            color: `${sub}cc`,
            fontSize: '10px',
            fontWeight: '620',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textAlign: 'center'
        },
        preferenceDivider: {
            height: '1px',
            background: `linear-gradient(90deg, transparent, ${border}, transparent)`,
            margin: '13px 0'
        },
        goalChipGrid: {
            display: 'flex',
            flexWrap: 'wrap',
            gap: '7px',
            justifyContent: 'center'
        },
        genderInlineRow: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px'
        },
        genderSegment: {
            minHeight: '42px',
            width: '100%',
            maxWidth: '360px',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minWidth: 0
        },
        pickerLabel: { fontSize:'12px', color:sub, marginBottom:'5px' },
        pickerRow: {
            display:'flex', alignItems:'center',
            backgroundColor: faint,
            borderRadius:'12px', padding:'15px'
        },
        modalActions: { display:'flex', gap:'10px', marginTop:'16px' },
        secBtn: {
            flex:'0 0 34%',
            minHeight:'46px',
            borderRadius:'15px',
            border:`1px solid ${border}`,
            backgroundColor:isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.032)',
            color: sub,
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap: '8px',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 820,
            letterSpacing: '0.01em'
        },
        priBtn: {
            flex:1,
            minHeight:'46px',
            borderRadius:'15px',
            border:'1px solid rgba(95,182,198,0.34)',
            background:'linear-gradient(180deg, rgba(95,182,198,0.96), rgba(73,155,171,0.96))',
            color:'#fff',
            cursor:'pointer',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            gap: '8px',
            boxShadow:'0 14px 28px -22px rgba(95,182,198,0.8)',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 850,
            letterSpacing: '0.01em'
        }
    };
};

export default UserPanel;
