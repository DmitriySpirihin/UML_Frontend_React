import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import { sendReferalLink } from '../StaticClasses/PaymentService'; 
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setPage, lastPage$ } from '../StaticClasses/HabitsBus';
import { calculateStats, LEVEL_RANKS, XP_RULES } from '../Helpers/UserStats.js';
import {
    FaCrown, FaUserShield,
    FaRulerVertical, FaBirthdayCake, FaBullseye,
    FaRunning, FaBrain, FaBed, FaMedal, FaSpa, FaUserFriends, FaShareAlt, FaQuestionCircle
} from 'react-icons/fa';
import { IoMdMale, IoMdFemale } from 'react-icons/io';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { MdClose, MdDone } from 'react-icons/md';
import ScrollPicker from '../Helpers/ScrollPicker.jsx';

// --- CONSTANTS ---
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health'], ['Выносливосить', 'Endurance']];
const HEADER_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 14px)';
const MotionDiv = motion.div;
const MotionButton = motion.button;
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
    const [wrist, setWrist] = useState(AppData.pData.wrist || 17);
    const [goal, setGoal] = useState(AppData.pData.goal || 0);
    const [showFriendsPanel, setShowFriendsPanel] = useState(AppData.profileFriendsExpanded ?? true);
    const [showXpGuide, setShowXpGuide] = useState(false);
    const [selectedXpRule, setSelectedXpRule] = useState('training');

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
            age: AppData.pData?.age || '--',
            height: AppData.pData?.height || '--',
            gender: AppData.pData?.gender,
            goal: currentGoalNames[AppData.pData?.goal] || '--'
        }
    };
}, [lang, currentGoalNames]);

    const selectedXpRuleBase = XP_RULES.find(rule => rule.key === selectedXpRule) || XP_RULES[0];
    const selectedXpRuleData = { ...selectedXpRuleBase, icon: XP_RULE_ICONS[selectedXpRuleBase.key] };

    const goBack = () => {
        const prev = lastPage$.value;
        const loopingPages = ['UserPanel', 'premium', 'settings'];
        setPage(prev && !loopingPages.includes(prev) ? prev : 'MainMenu');
    };
    
    const onSaveMetrics = async () => {
        AppData.pData = { filled: true, age, gender, height, wrist, goal };
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

    const s = styles(theme);
    const accent = hasPremium ? '#FFD700' : Colors.get('accent', theme);

    return (
        <MotionDiv
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
                <div style={s.metricsScrollContainer}>
                    <MetricChip icon={<FaMedal />} label={lang === 0 ? 'Привычки' : 'Habits'} value={stats.counts.habits} color="#FFD700" theme={theme} />
                    <MetricChip icon={<FaRunning />} label={lang === 0 ? 'Тренировки' : 'Trainings'} value={stats.counts.training} color="#FF4D4D" theme={theme} />
                    <MetricChip icon={<FaBrain />} label={lang === 0 ? 'Ментал' : 'Mental'} value={stats.counts.mental} color="#4DA6FF" theme={theme} />
                    <MetricChip icon={<FaSpa />} label={lang === 0 ? 'Восстан.' : 'Recovery'} value={stats.counts.recovery} color="#4DFF88" theme={theme} />
                    <MetricChip icon={<FaBed />} label={lang === 0 ? 'Сон' : 'Sleep'} value={stats.counts.sleep} color="#A64DFF" theme={theme} />
                </div>

                {/* 2.5 Premium Card */}
                {!hasPremium && (
                    <MotionDiv
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPage('premium')}
                        style={{
                            position: 'relative',
                            borderRadius: '20px',
                            padding: '18px 20px',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            background: 'linear-gradient(135deg, #17120a 0%, #2a1f0f 55%, #17120a 100%)',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            boxShadow: '0 10px 30px rgba(255, 170, 0, 0.15), inset 0 1px 0 rgba(255, 215, 0, 0.18)',
                            cursor: 'pointer',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Soft gold halo */}
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: 'radial-gradient(ellipse at 100% 50%, rgba(255, 200, 50, 0.14) 0%, transparent 60%)',
                            pointerEvents: 'none'
                        }} />

                        {/* Crown badge */}
                        <div style={{
                            width: '46px', height: '46px',
                            borderRadius: '13px',
                            background: 'linear-gradient(135deg, #FFE55C 0%, #FFA000 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 6px 18px rgba(255, 170, 0, 0.5)',
                            flexShrink: 0, zIndex: 1
                        }}>
                            <FaCrown size={22} color="#1a1410" />
                        </div>

                        {/* Text */}
                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, zIndex: 1 }}>
                            <span style={{
                                fontSize: '18px',
                                fontWeight: '800',
                                letterSpacing: '0.3px',
                                background: 'linear-gradient(90deg, #FFE55C 0%, #FFA500 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                {lang === 0 ? 'UML Premium' : 'UML Premium'}
                            </span>
                            <span style={{
                                fontSize: '13px',
                                color: 'rgba(255, 255, 255, 0.6)',
                                marginTop: '3px',
                                fontWeight: '500'
                            }}>
                                {lang === 0 ? 'Расширенная аналитика, ИИ и облако' : 'Advanced analytics, AI & cloud'}
                            </span>
                        </div>

                        {/* Chevron */}
                        <IoIosArrowForward size={20} color="rgba(255, 215, 0, 0.6)" style={{ flexShrink: 0, zIndex: 1 }} />
                    </MotionDiv>
                )}

                {/* 3. Physical Data */}
                <div style={s.infoGrid}>
                    <InfoCard icon={<FaBirthdayCake />} label={lang === 0 ? 'Возраст' : 'Age'} value={`${stats.body.age}`} theme={theme} />
                    <InfoCard icon={<FaRulerVertical />} label={lang === 0 ? 'Рост' : 'Height'} value={`${stats.body.height} cm`} theme={theme} />
                    <InfoCard icon={<FaBullseye />} label={lang === 0 ? 'Цель' : 'Goal'} value={stats.body.goal} theme={theme} fullWidth />
                </div>

                {/* 4. Friends List Section (Direct from UserData) */}
                <div style={{ marginTop: '25px', marginBottom: '10px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 5px' }}>
                        <div onClick={toggleFriendsPanel} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaUserFriends color={Colors.get('subText', theme)} />
                            <span style={{ fontSize: '14px', fontWeight: '800', color: Colors.get('mainText', theme), textTransform: 'uppercase' }}>
                                {lang === 0 ? 'Друзья' : 'Friends'}
                            </span>
                        </div>
                        {friends.length > 0 && (
                            <MotionButton whileTap={{scale:0.9}} onClick={sendReferalLink} style={{background:'none', border:'none', color:accent, fontWeight:'700', fontSize:'12px', cursor:'pointer'}}>
                                + {lang === 0 ? 'Пригласить' : 'Invite'}
                            </MotionButton>
                        )}
                    </div>

                    {friends.length === 0 ? (
                        <div style={s.emptyState}>
                            <span style={{fontSize:'14px', color:Colors.get('subText', theme), textAlign:'center', marginBottom:'10px'}}>
                                {lang === 0 ? 'У вас пока нет друзей в приложении.' : 'No friends yet. Invite them to earn Premium!'}
                            </span>
                            <MotionButton 
                                whileTap={{scale:0.95}} 
                                onClick={sendReferalLink}
                                style={{...s.priBtn, width: 'auto', padding: '10px 25px', fontSize: '14px'}}
                            >
                                <FaShareAlt style={{marginRight:'8px'}}/> {lang === 0 ? 'Пригласить друга' : 'Invite a Friend'}
                            </MotionButton>
                        </div>
                    ) : (
                        showFriendsPanel ? (<div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                            {friends.map((friend, i) => (
                                <FriendCard key={i} friend={friend} theme={theme} />
                            ))}
                        </div>) : null
                    )}
                </div>

                {/* 6. Actions */}
                <div style={s.actionList}>
                    <ActionItem icon={<FaUserShield />} label={lang === 0 ? 'Изменить персональные данные' : 'Edit personal data'} theme={theme} onClick={() => setShowBodyMetrics(true)} noBorder />
                </div>

                <div style={{ height: '100px' }} />
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
        <div style={{
            backgroundColor: Colors.get('simplePanel', theme),
            borderRadius: '16px', padding: '10px 15px',
            display: 'flex', alignItems: 'center', gap: '12px',
            border: `1px solid ${Colors.get('border', theme)}30`
        }}>
            {/* Friend Avatar */}
            <div style={{
                width: '40px', height: '40px', borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: '900', color: Colors.get('mainText', theme),
                flexShrink: 0
            }}>
                {friend.name ? friend.name.charAt(0).toUpperCase() : '?'}
            </div>

            {/* Friend Info & Progress */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: Colors.get('mainText', theme) }}>
                        {friend.name}
                    </span>
                    <span style={{ fontSize: '10px', fontWeight: '800', color: Colors.get('accent', theme), backgroundColor: 'rgba(255,215,0,0.1)', padding:'2px 6px', borderRadius:'6px' }}>
                        LVL {level}
                    </span>
                </div>
                
                {/* Mini XP Bar */}
                <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', backgroundColor: Colors.get('accent', theme), borderRadius: '2px' }} />
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

const GenderToggle = ({ active, icon, color, onClick, theme }) => (
    <MotionDiv 
        whileTap={{scale:0.9}} onClick={onClick}
        style={{
            width:'40px', height:'40px', borderRadius:'12px', 
            backgroundColor: active ? color : (theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'),
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
            color: active ? '#fff' : Colors.get('subText', theme), border: active ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }}
    >
        {icon}
    </MotionDiv>
);

const ModalActions = ({ onClose, onConfirm, theme }) => (
    <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
        <MotionButton whileTap={{scale:0.95}} onClick={onClose} style={styles(theme).secBtn}><MdClose size={22}/></MotionButton>
        <MotionButton whileTap={{scale:0.95}} onClick={onConfirm} style={styles(theme).priBtn}><MdDone size={22}/></MotionButton>
    </div>
);

const MetricChip = ({ icon, label, value, color, theme }) => (
    <div style={{ 
        minWidth: '85px',height: '55px', backgroundColor: Colors.get('simplePanel', theme), 
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
    <MotionDiv 
        whileTap={{ backgroundColor: 'rgba(255,255,255,0.05)' }} onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', padding: '18px', cursor: 'pointer',
            borderBottom: noBorder ? 'none' : `1px solid ${Colors.get('border', theme)}30`
        }}
    >
        <div style={{ marginRight: '15px', color: color || Colors.get('subText', theme), fontSize: '18px' }}>{icon}</div>
        <span style={{ fontSize: '16px', fontWeight: '600', color: color || Colors.get('mainText', theme), flex: 1 }}>{label}</span>
    </MotionDiv>
);

const styles = (theme) => {
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
            padding: `${HEADER_TOP_PADDING} 20px 20px 20px`, minHeight: '72px', position: 'relative'
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
            width: '80px', height: '80px', borderRadius: '20px', border: '3px solid', 
            padding: '6px', position: 'relative', marginBottom: '15px'
        },
        avatarImg: { width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' },
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
        xpInfoButton: {
            border: 'none', background: 'transparent', color: sub, padding: 0, margin: 0,
            display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px',
            fontWeight: '800', cursor: 'pointer'
        },
        xpTrack: { width: '100%', height: '8px', backgroundColor: panel, borderRadius: '4px', overflow: 'hidden' },
        xpFill: { height: '100%', borderRadius: '4px' },
        xpGuide: { display: 'flex', flexDirection: 'column', gap: '16px' },
        xpGuideHeader: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', marginBottom: '2px'
        },
        xpGuideSubtitle: { color: sub, fontSize: '13px', fontWeight: '700', marginTop: '5px' },
        xpNextBadge: {
            border: '1px solid', borderRadius: '14px', padding: '10px 12px',
            fontSize: '13px', fontWeight: '900', flexShrink: 0
        },
        xpUnlockPanel: {
            backgroundColor: panel, border: `1px solid ${Colors.get('border', theme)}50`,
            borderRadius: '18px', padding: '15px'
        },
        xpUnlockTitle: { color: sub, fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px' },
        xpUnlockText: { color: text, fontSize: '16px', fontWeight: '800' },
        xpUnlockHint: { color: sub, fontSize: '12px', fontWeight: '600', marginTop: '7px' },
        xpRuleGrid: {
            display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: '10px'
        },
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
            backgroundColor: panel, border: `1px solid ${Colors.get('border', theme)}50`,
            borderRadius: '18px', padding: '14px', display: 'flex',
            alignItems: 'center', gap: '12px'
        },
        xpRuleDetailsIcon: {
            width: '42px', height: '42px', borderRadius: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '19px', flexShrink: 0
        },
        xpDetailsTitle: { color: text, fontSize: '15px', fontWeight: '850', marginBottom: '3px' },
        xpDetailsText: { color: sub, fontSize: '12px', fontWeight: '600', lineHeight: 1.35 },
        xpDetailsScore: {
            minWidth: '70px', display: 'flex', flexDirection: 'column',
            alignItems: 'flex-end', gap: '2px', fontSize: '14px',
            fontWeight: '900'
        },

        metricsScrollContainer: {
            display: 'flex', overflowX: 'auto', padding: '5px', margin: '15px 0',
            scrollbarWidth: 'none', msOverflowStyle: 'none'
        },
        infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '10px 0' },
        
        // FRIENDS & EMPTY STATE
        emptyState: {
            backgroundColor: panel, borderRadius: '24px', padding: '25px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: `1px dashed ${Colors.get('border', theme)}50`
        },

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
