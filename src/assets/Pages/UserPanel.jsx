import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setAddPanel, setPage } from '../StaticClasses/HabitsBus';
import { 
    FaCrown, FaUserShield, FaSignOutAlt,  FaGem, 
    FaRulerVertical, FaBirthdayCake, FaBullseye, 
    FaRunning, FaBrain, FaBed, FaMedal, FaSpa
} from 'react-icons/fa';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import { MdClose, MdDone } from 'react-icons/md';
import ScrollPicker from '../Helpers/ScrollPicker.jsx';

// --- CONSTANTS ---
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health']];

const generateRange = (start, end, step = 1) => {
    const arr = [];
    for (let i = start; i <= end; i += step) {
        arr.push(step === 1 ? i : parseFloat(i.toFixed(1)));
    }
    return arr;
};

const UserPanel = () => {
    const [theme, setThemeState] = useState('dark');
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);

    // --- METRICS EDIT STATE ---
    const [showBodyMetrics, setShowBodyMetrics] = useState(false);
    const [age, setAge] = useState(AppData.pData.age || 25);
    const [gender, setGender] = useState(AppData.pData.gender || 0);
    const [height, setHeight] = useState(AppData.pData.height || 175);
    const [wrist, setWrist] = useState(AppData.pData.wrist || 17);
    const [goal, setGoal] = useState(AppData.pData.goal || 0);

    // --- LISTS FOR PICKERS ---
    const agesList = useMemo(() => generateRange(10, 100), []);
    const heightsList = useMemo(() => generateRange(50, 250), []);
    const wristsList = useMemo(() => generateRange(10, 40, 0.5), []);
    const currentGoalNames = useMemo(() => goalNames.map(g => g[lang]), [lang]);

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
        const habitsCount = AppData.choosenHabits?.length || 0;
        const trainingCount = Object.keys(AppData.trainingLog || {}).length;
        const mentalCount = Object.keys(AppData.mentalLog || {}).length;
        const sleepCount = Object.keys(AppData.sleepingLog || {}).length;
        const recoveryCount = 
            Object.keys(AppData.meditationLog || {}).length +
            Object.keys(AppData.breathingLog || {}).length +
            Object.keys(AppData.hardeningLog || {}).length;

        // Leveling Logic
        const totalXP = (trainingCount * 50) + (mentalCount * 30) + (sleepCount * 20) + (recoveryCount * 20) + (habitsCount * 10);
        let level = 1;
        let xpThreshold = 500; 
        let prevThreshold = 0;
        while (totalXP >= xpThreshold) {
            prevThreshold = xpThreshold;
            level++;
            xpThreshold += (level * 500); 
        }
        const currentLevelXP = totalXP - prevThreshold;
        const xpNeededForNext = xpThreshold - prevThreshold;
        const progressPercent = Math.min(100, Math.max(0, (currentLevelXP / xpNeededForNext) * 100));

        // Rank Configuration
        const ranks = [
            { title: ['Новичок', 'Novice'], color: '#4f4f4f' },        // Gray
            { title: ['Искатель', 'Seeker'], color: '#4CAF50' },       // Green
            { title: ['Достигатор', 'Achiever'], color: '#2196F3' },   // Blue
            { title: ['Элита', 'Elite'], color: '#9C27B0' },           // Purple
            { title: ['Легенда', 'Legend'], color: '#FFD700' }         // Gold
        ];
        
        let rankIndex = 0;
        if (level >= 50) rankIndex = 4;
        else if (level >= 20) rankIndex = 3;
        else if (level >= 10) rankIndex = 2;
        else if (level >= 5) rankIndex = 1;

        const currentRank = ranks[rankIndex];

        return {
            counts: { habits: habitsCount, training: trainingCount, mental: mentalCount, sleep: sleepCount, recovery: recoveryCount },
            level: { 
                current: level, 
                xp: currentLevelXP, 
                needed: xpNeededForNext, 
                percent: progressPercent, 
                title: currentRank.title[lang],
                color: currentRank.color 
            },
            body: {
                age: AppData.pData?.age || '--',
                height: AppData.pData?.height || '--',
                gender: AppData.pData?.gender, // 0: Male, 1: Female
                goal: currentGoalNames[AppData.pData?.goal] || '--'
            }
        };
    }, [lang, showBodyMetrics]); 

    const close = () => setAddPanel('');
    
    const onSaveMetrics = async () => {
        AppData.pData = { filled: true, age, gender, height, wrist, goal };
        await saveData();
        setShowBodyMetrics(false);
    };

    const s = styles(theme, fSize);
    const accent = hasPremium ? '#FFD700' : Colors.get('accent', theme);

    return (
        <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={s.container}
        >
            {/* Header */}
            <div style={s.header}>
                
                <span style={s.headerTitle}>{lang === 0 ? 'Профиль' : 'Profile'}</span>
                <div style={{ width: 40 }} />
            </div>

            <div style={s.scrollContent} className="no-scrollbar">
                
                {/* 1. Hero with Leveling */}
                <div style={s.heroSection}>
                    <div style={{ ...s.avatarWrapper, borderColor: accent }}>
                        {UserData.photo ? (
                            <img src={UserData.photo} style={s.avatarImg} alt="user" />
                        ) : (
                            <div style={s.avatarPlaceholder}>{UserData.name?.charAt(0).toUpperCase()}</div>
                        )}
                        
                        {/* PREMIUM BADGE (Bottom Right) */}
                        {hasPremium && (
                            <div style={s.premiumMiniBadge}><FaCrown size={10} /></div>
                        )}

                        {/* LEVEL BADGE (Top Right - Prominent) */}
                        <div style={{...s.levelBadge, backgroundColor: stats.level.color, boxShadow: `0 4px 15px ${stats.level.color}60`}}>
                            <span style={{fontSize: '10px', fontWeight: '700', textTransform: 'uppercase'}}>LVL</span>
                            <span style={{fontSize: '16px', fontWeight: '900', lineHeight: 1}}>{stats.level.current}</span>
                        </div>
                    </div>
                    
                    <h2 style={s.userName}>{UserData.name}</h2>
                    
                    {/* User Title & Gender */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <span style={{...s.userTitle, color: stats.level.color}}>{stats.level.title}</span>
                        {stats.body.gender !== undefined && (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '4px 8px', borderRadius: '12px',
                                backgroundColor: stats.body.gender === 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(236, 72, 153, 0.15)',
                                color: stats.body.gender === 0 ? '#3B82F6' : '#EC4899'
                            }}>
                                {stats.body.gender === 0 ? <IoMdMale size={14}/> : <IoMdFemale size={14}/>}
                            </div>
                        )}
                    </div>

                    {/* XP Progress Bar */}
                    <div style={s.xpContainer}>
                        <div style={s.xpInfo}>
                            <span>XP</span>
                            <span>{Math.floor(stats.level.xp)} / {stats.level.needed}</span>
                        </div>
                        <div style={s.xpTrack}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.level.percent}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                style={{ ...s.xpFill, backgroundColor: stats.level.color }} 
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Scrollable Metrics */}
                <div style={s.metricsScrollContainer}>
                    <MetricChip icon={<FaMedal />} label={lang === 0 ? 'Привычки' : 'Habits'} value={stats.counts.habits} color="#FFD700" theme={theme} />
                    <MetricChip icon={<FaRunning />} label={lang === 0 ? 'Тренировки' : 'Trainings'} value={stats.counts.training} color="#FF4D4D" theme={theme} />
                    <MetricChip icon={<FaBrain />} label={lang === 0 ? 'Ментал' : 'Mental'} value={stats.counts.mental} color="#4DA6FF" theme={theme} />
                    <MetricChip icon={<FaSpa />} label={lang === 0 ? 'Восстан.' : 'Recovery'} value={stats.counts.recovery} color="#4DFF88" theme={theme} />
                    <MetricChip icon={<FaBed />} label={lang === 0 ? 'Сон' : 'Sleep'} value={stats.counts.sleep} color="#A64DFF" theme={theme} />
                </div>

                {/* 3. Physical Data */}
                <div style={s.infoGrid}>
                    <InfoCard icon={<FaBirthdayCake />} label={lang === 0 ? 'Возраст' : 'Age'} value={`${stats.body.age}`} theme={theme} />
                    <InfoCard icon={<FaRulerVertical />} label={lang === 0 ? 'Рост' : 'Height'} value={`${stats.body.height} cm`} theme={theme} />
                    <InfoCard icon={<FaBullseye />} label={lang === 0 ? 'Цель' : 'Goal'} value={stats.body.goal} theme={theme} fullWidth />
                </div>

                {/* 4. Premium */}
                {!hasPremium && <motion.div 
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPage('premium')}
                    style={{ 
                        ...s.premiumCard, 
                        background: hasPremium 
                            ? 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)' 
                            : 'linear-gradient(135deg, #232526 0%, #414345 100%)' 
                    }}
                >
                    <div style={s.premiumInfo}>
                        <div style={{ color: hasPremium ? '#000' : '#FFD700' }}><FaGem size={28} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ ...s.premTitle, color: hasPremium ? '#000' : '#FFF' }}>
                                {hasPremium ? 'UltyMyLife Premium' : (lang === 0 ? 'Активировать Premium' : 'Activate Premium')}
                            </span>
                            <span style={{ ...s.premSub, color: hasPremium ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.6)' }}>
                                {hasPremium ? (lang === 0 ? 'Все функции разблокированы' : 'All features unlocked') : (lang === 0 ? 'Статистика, ИИ и облако' : 'Analytics, AI & Cloud')}
                            </span>
                        </div>
                    </div>
                </motion.div>}

                {/* 5. Actions */}
                <div style={s.actionList}>
                    
                    <ActionItem icon={<FaUserShield />} label={lang === 0 ? 'Изменить персональные данные' : 'Edit personal data'} theme={theme} onClick={() => setShowBodyMetrics(true)} />
                    <ActionItem onClick={close} icon={<FaSignOutAlt />} label={lang === 0 ? 'Выйти' : 'Logout'} theme={theme} noBorder color="#FF4D4D" />
                </div>

                <div style={{ height: '100px' }} />
            </div>

            {/* --- BODY METRICS EDIT MODAL --- */}
            <AnimatePresence>
                {showBodyMetrics && (
                    <BottomSheet onClose={() => setShowBodyMetrics(false)} theme={theme}>
                        <h3 style={s.modalTitle}>{lang === 0 ? 'Параметры тела' : 'Body Metrics'}</h3>
                        
                        <div style={{padding:'20px 0'}}>
                            <div style={{...s.pickerRow, justifyContent:'space-around'}}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={s.pickerLabel}>{lang===0?'Возраст':'Age'}</span>
                                    <ScrollPicker items={agesList} value={age} onChange={setAge} theme={theme} width="100px" />
                                </div>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={s.pickerLabel}>{lang===0?'Рост (см)':'Height'}</span>
                                    <ScrollPicker items={heightsList} value={height} onChange={setHeight} theme={theme} width="100px" />
                                </div>
                            </div>

                            <div style={{...s.pickerRow, justifyContent:'space-around', marginTop:'15px'}}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={s.pickerLabel}>{lang===0?'Запястье (см)':'Wrist'}</span>
                                    <ScrollPicker items={wristsList} value={wrist} onChange={setWrist} theme={theme} width="100px" />
                                </div>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100px'}}>
                                    <span style={{...s.pickerLabel, marginBottom:'10px'}}>{lang===0?'Пол':'Gender'}</span>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <GenderToggle active={gender===0} icon={<IoMdMale/>} color="#5fb6c6" onClick={()=>setGender(0)} theme={theme}/>
                                        <GenderToggle active={gender===1} icon={<IoMdFemale/>} color="#c65f9d" onClick={()=>setGender(1)} theme={theme}/>
                                    </div>
                                </div>
                            </div>

                            <div style={{...s.pickerRow, flexDirection:'column', marginTop:'15px'}}>
                                <span style={s.pickerLabel}>{lang===0?'Цель':'Goal'}</span>
                                <ScrollPicker items={currentGoalNames} value={currentGoalNames[goal]} onChange={(val) => setGoal(currentGoalNames.indexOf(val))} theme={theme} width="200px" />
                            </div>
                        </div>
                        <ModalActions onClose={() => setShowBodyMetrics(false)} onConfirm={onSaveMetrics} theme={theme} />
                    </BottomSheet>
                )}
            </AnimatePresence>

        </motion.div>
    );
};

// --- SUB-COMPONENTS ---

const BottomSheet = ({ children, onClose, theme }) => (
    <div style={styles(theme).backdrop} onClick={onClose}>
        <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={styles(theme).sheet} onClick={e => e.stopPropagation()}
        >
            <div style={styles(theme).handle} />
            {children}
        </motion.div>
    </div>
);

const GenderToggle = ({ active, icon, color, onClick, theme }) => (
    <motion.div 
        whileTap={{scale:0.9}} onClick={onClick}
        style={{
            width:'40px', height:'40px', borderRadius:'12px', 
            backgroundColor: active ? color : (theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'),
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
            color: active ? '#fff' : Colors.get('subText', theme), border: active ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }}
    >
        {icon}
    </motion.div>
);

const ModalActions = ({ onClose, onConfirm, theme }) => (
    <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
        <motion.button whileTap={{scale:0.95}} onClick={onClose} style={styles(theme).secBtn}><MdClose size={22}/></motion.button>
        <motion.button whileTap={{scale:0.95}} onClick={onConfirm} style={styles(theme).priBtn}><MdDone size={22}/></motion.button>
    </div>
);

const MetricChip = ({ icon, label, value, color, theme }) => (
    <div style={{ 
        minWidth: '85px', backgroundColor: Colors.get('simplePanel', theme), 
        borderRadius: '18px', padding: '12px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', marginRight: '10px',
        border: `1px solid ${Colors.get('border', theme)}50`, flexShrink: 0
    }}>
        <div style={{ color: color, fontSize: '18px', marginBottom: '6px' }}>{icon}</div>
        <div style={{ fontSize: '16px', fontWeight: '900', color: Colors.get('mainText', theme) }}>{value}</div>
        <div style={{ fontSize: '10px', color: Colors.get('subText', theme), fontWeight: 'bold' }}>{label}</div>
    </div>
);

const InfoCard = ({ icon, label, value, theme, fullWidth }) => (
    <div style={{
        gridColumn: fullWidth ? 'span 2' : 'span 1',
        backgroundColor: Colors.get('simplePanel', theme),
        borderRadius: '18px', padding: '15px', display: 'flex', alignItems: 'center', gap: '12px',
        border: `1px solid ${Colors.get('border', theme)}50`
    }}>
        <div style={{ color: Colors.get('accent', theme), fontSize: '18px' }}>{icon}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '10px', color: Colors.get('subText', theme), fontWeight: 'bold', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: '15px', fontWeight: '700', color: Colors.get('mainText', theme) }}>{value}</span>
        </div>
    </div>
);

const ActionItem = ({ icon, label, theme, noBorder, color, onClick }) => (
    <motion.div 
        whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', padding: '18px', cursor: 'pointer',
            borderBottom: noBorder ? 'none' : `1px solid ${Colors.get('border', theme)}30`
        }}
    >
        <div style={{ marginRight: '15px', color: color || Colors.get('subText', theme), fontSize: '18px' }}>{icon}</div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: color || Colors.get('mainText', theme), flex: 1 }}>{label}</span>
    </motion.div>
);

const styles = (theme, fSize) => {
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const panel = Colors.get('simplePanel', theme);

    return {
        container: {
            backgroundColor: Colors.get('background', theme),
            display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw',
            fontFamily: 'Segoe UI, sans-serif', zIndex: 3000, position: 'fixed', top: 0, left: 0
        },
        header: {
            display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%',
            padding: '50px 20px 20px 20px', position: 'relative'
        },
        backBtn: {
            position: 'absolute', left: '20px', width: '40px', height: '40px', 
            borderRadius: '14px', backgroundColor: panel, color: text,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        },
        headerTitle: { fontSize: '17px', fontWeight: '800', color: text, letterSpacing: '0.5px' },
        scrollContent: { flex: 1, overflowY: 'auto', padding: '0 20px' },
        
        heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px 0 20px 0', position: 'relative' },
        avatarWrapper: {
            width: '110px', height: '110px', borderRadius: '40px', border: '3px solid', 
            padding: '6px', position: 'relative', marginBottom: '15px'
        },
        avatarImg: { width: '100%', height: '100%', borderRadius: '32px', objectFit: 'cover' },
        avatarPlaceholder: {
            width: '100%', height: '100%', borderRadius: '32px', backgroundColor: panel, 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '38px', fontWeight: '900', color: text
        },
        premiumMiniBadge: {
            position: 'absolute', bottom: '0px', right: '0px',
            backgroundColor: '#FFD700', color: '#000', width: '28px', height: '28px',
            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)', border: '2px solid #000', zIndex: 1
        },
        levelBadge: {
            position: 'absolute', top: '-10px', right: '-15px',
            color: '#FFF', padding: '4px 10px', borderRadius: '12px', 
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `3px solid ${Colors.get('background', theme)}`, zIndex: 2
        },
        userName: { fontSize: '26px', fontWeight: '900', color: text, margin: 0 },
        userTitle: { fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' },
        
        // XP Bar
        xpContainer: { width: '100%', marginTop: '15px', padding: '0 10px' },
        xpInfo: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: sub, marginBottom: '6px' },
        xpTrack: { width: '100%', height: '8px', backgroundColor: panel, borderRadius: '4px', overflow: 'hidden' },
        xpFill: { height: '100%', borderRadius: '4px' },

        metricsScrollContainer: {
            display: 'flex', overflowX: 'auto', padding: '5px', margin: '15px 0',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
        },
        infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' },
        premiumCard: { borderRadius: '24px', padding: '20px', margin: '15px 0' },
        premiumInfo: { display: 'flex', alignItems: 'center', gap: '18px' },
        premTitle: { fontSize: '17px', fontWeight: '900' },
        premSub: { fontSize: '12px', fontWeight: 'bold' },
        actionList: { backgroundColor: panel, borderRadius: '28px', overflow: 'hidden', marginTop: '10px' },

        // BOTTOM SHEET & MODALS
        backdrop: {
            position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)',
            zIndex:3000, display:'flex', alignItems:'flex-end', justifyContent:'center'
        },
        sheet: {
            width:'100%', maxWidth:'600px', backgroundColor:Colors.get('background', theme),
            borderTopLeftRadius:'30px', borderTopRightRadius:'30px',
            padding:'20px 20px 40px 20px', boxShadow:'0 -10px 40px rgba(0,0,0,0.3)',
            borderTop: `1px solid ${Colors.get('border', theme)}`,
            display: 'flex', flexDirection: 'column'
        },
        handle: {
            width:'40px', height:'4px', backgroundColor:Colors.get('subText', theme),
            borderRadius:'2px', margin:'0 auto 20px auto', opacity:0.3
        },
        modalTitle: { fontSize:'18px', fontWeight:'800', color:text, margin:'0 0 20px 0', textAlign:'center' },
        pickerLabel: { fontSize:'12px', color:sub, marginBottom:'5px' },
        pickerRow: {
            display:'flex', alignItems:'center',
            backgroundColor: theme==='light'?'rgba(0,0,0,0.03)':'rgba(255,255,255,0.05)',
            borderRadius:'12px', padding:'15px'
        },
        secBtn: {
            flex:1, padding:'15px', borderRadius:'16px', border:'none',
            backgroundColor:Colors.get('skipped', theme),
            color:sub, cursor:'pointer', display:'flex', justifyContent:'center'
        },
        priBtn: {
            flex:1, padding:'15px', borderRadius:'16px', border:'none',
            backgroundColor:Colors.get('done', theme),
            color:'#fff', cursor:'pointer', display:'flex', justifyContent:'center',
            boxShadow:'0 5px 15px rgba(0,0,0,0.2)'
        }
    };
};

export default UserPanel;