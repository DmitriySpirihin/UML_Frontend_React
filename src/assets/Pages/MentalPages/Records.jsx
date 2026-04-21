import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import { NotificationsManager } from '../../StaticClasses/NotificationsManager.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$, setPage } from '../../StaticClasses/HabitsBus';

// Icons
import { FaStopwatch, FaMemory, FaUserAlt, FaTrophy, FaMedal,FaGlobe, FaUserShield,FaUserFriends, FaCrown} from 'react-icons/fa';
import { GiLogicGateNxor, GiTargetShot, GiStarsStack, GiCrownedSkull } from 'react-icons/gi';
import { FaStarHalf, FaStar, FaInfinity } from 'react-icons/fa';

const ADMIN_IDS = [768852208, 8484480648];

// === Configuration ===
const categoryLabels = [
    ['Быстрый счет', 'Quick Math'],
    ['Память', 'Memory'],
    ['Логика', 'Logic'],
    ['Фокус', 'Focus']
];

const categoryIcons = [ '⚡', '🧠', '🧩', '🎯'];

const difficultyIcons = [FaStarHalf, FaStar, GiStarsStack, GiCrownedSkull, FaInfinity];

// === Main Component ===
const Records = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [difficultyIndex, setDifficultyIndex] = useState(0);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const [globalData, setGlobalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState(0);

    // Initial Fetch
    useEffect(() => {
        const fetchGlobalData = async () => {
           try {
    const data = await NotificationsManager.getMentalRecordsGlobal() || [];
    
    if (!data || data.length === 0) {
        // ✅ FIX: Added uid: UserData.id
        setGlobalData([{ 
            uid: UserData.id, 
            name: UserData?.name || 'User', 
            data: AppData.mentalRecords 
        }]);
    } else {
        setGlobalData(data);
    }
} catch (err) {
    // ✅ FIX: Added uid: UserData.id here too
    setGlobalData([{ 
        uid: UserData.id, 
        name: UserData?.name || 'User', 
        data: AppData.mentalRecords 
    }]);
} finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, []);

    // Subscriptions
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        const sub4 = premium$.subscribe(setHasPremium);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub4.unsubscribe();
        };
    }, []);

    const sortedData = [...globalData]
    .filter(item => {
        if (filterMode === 0) return true; 
        const isMe = Number(item.uid) === Number(UserData.id); 
        const isFriend = UserData.friends && UserData.friends.some(f => Number(f.uid) === Number(item.uid));
        return isMe || isFriend;
    })
        .sort((a, b) => {
            const scoreA = a.data?.[categoryIndex]?.[difficultyIndex] || 0;
            const scoreB = b.data?.[categoryIndex]?.[difficultyIndex] || 0;
            return scoreB - scoreA;
        });

    return (
        <div style={styles(theme).container}>
            
            {/* Controls Area */}
            <div style={styles(theme).controlsWrapper}>
                {!hasPremium && (
                <div onClick={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 2555,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        background: theme === 'dark' ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                        backdropFilter: 'blur(20px)', textAlign: 'center'
                    }}>
                    <div style={{
                        width: '72px', height: '72px', background: 'rgba(0,122,255,0.12)',
                        borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px', border: '1px solid rgba(0,122,255,0.22)',
                    }}>
                        <FaCrown size={30} color="#007AFF" />
                    </div>
                    <div style={{
                        fontSize: '13px', lineHeight: '1.6',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        marginBottom: '24px', maxWidth: '210px',
                    }}>
                        {langIndex === 0 ? 'Откройте полный доступ ко всем рекордам' : 'Unlock full access to all records'}
                    </div>
                    <button onClick={() => setPage('premium')} style={{
                        fontSize: '15px', fontWeight: '700', color: '#fff', background: '#007AFF',
                        border: 'none', borderRadius: '14px', padding: '13px 0', marginBottom: '10px',
                        cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,122,255,0.35)', width: '220px',
                    }}>
                        {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
                    </button>
                    <button onClick={() => setPage('MainMenu')} style={{
                        fontSize: '13px', fontWeight: '500',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        background: 'transparent', border: 'none', padding: '8px 20px', cursor: 'pointer',
                    }}>
                        {langIndex === 0 ? '← На главную' : '← Home'}
                    </button>
                </div>
            )}
                {/* ✅ NEW: Filter Toggle (Global / Friends) */}
                <SegmentedControl
                    items={[FaGlobe, FaUserFriends]}
                    selectedIndex={filterMode}
                    setSelectedIndex={setFilterMode}
                    theme={theme}
                    colorKey="difficulty" // Use a generic accent color
                    isSecondary={true}
                    isTop={true}
                />

                <SegmentedControl
                    items={categoryIcons}
                    selectedIndex={categoryIndex}
                    setSelectedIndex={(i) => {
                        setCategoryIndex(i);
                        if (difficultyIndex > 3) setDifficultyIndex(3);
                    }}
                    theme={theme}
                    colorKey="difficulty"
                />
                
                <SegmentedControl
                    items={categoryIndex > 0 ? difficultyIcons.slice(0, -1) : difficultyIcons}
                    selectedIndex={difficultyIndex}
                    setSelectedIndex={setDifficultyIndex}
                    theme={theme}
                    colorKey="difficulty" 
                    isSecondary={true}
                />
            </div>

            {/* List Area */}
            <div style={styles(theme).listContainer}>
                {loading ? (
                    <div style={styles(theme, fSize).loadingText}>
                        {langIndex === 0 ? 'Загрузка...' : 'Loading...'}
                    </div>
                ) : (
                    <motion.div 
                        layout 
                        style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '20px' }}
                    >
                        <AnimatePresence mode='popLayout'>
                            {sortedData.map((item, index) => (
                                <ListItem
                                    key={item.name + index} 
                                    theme={theme}
                                    fSize={fSize}
                                    isUser={Number(item.uid) === Number(UserData.id)}
                                    isAdmin={item.uid && ADMIN_IDS.includes(Number(item.uid))}
                                    rank={index + 1}
                                    name={item.name}
                                    score={item.data?.[categoryIndex]?.[difficultyIndex] || 0}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                        
                        {sortedData.length === 0 && (
                            <div style={{textAlign: 'center', color: Colors.get('subText', theme), marginTop: 20}}>
                                {filterMode === 1 
                                    ? (langIndex === 0 ? 'Друзья не найдены' : 'No friends found')
                                    : (langIndex === 0 ? 'Нет данных' : 'No records yet')
                                }
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
            
            
        </div>
    );
};


// === Sub-Components ===

const SegmentedControl = ({ items, selectedIndex, setSelectedIndex, theme, colorKey, isSecondary,isTop = false }) => {
    return (
        <div style={{
            marginTop: isTop ?'25px' : 0 ,
            display: 'flex',
            backgroundColor: Colors.get('panel', theme),
            padding: '2px',
            borderRadius: '16px',
            gap: '4px',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05)'
        }}>
            {items.map((Icon, idx) => {
                const isActive = selectedIndex === idx;
                // Determine active color based on index for categories, or generic for difficulty
                const activeColor =  Colors.get(colorKey + idx,theme );

                return (
                    <div
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        style={{
                            position: 'relative',
                            padding: isSecondary ? '6px 14px' : '8px 20px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                        }}
                    >
                        {isActive && (
                            <motion.div
                                layoutId={isSecondary ? "diff-bg" : "cat-bg"}
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundColor: Colors.get('simplePanel', theme),
                                    borderRadius: '12px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                    zIndex: -1
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <div 
                            size={isSecondary ? 18 : 22} 
                            style={{ transition: 'color 0.3s ease' }}
                        >
                            {typeof Icon === 'string' ? Icon : <Icon size={isSecondary ? 18 : 22}  style={{ color: isActive ? isTop? Colors.get(colorKey, theme) : activeColor : Colors.get('subText', theme) }}/>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const MEDAL_COLORS = {
    1: { bg: 'rgba(255,215,0,0.18)', border: 'rgba(255,215,0,0.5)', icon: '#FFD700' },
    2: { bg: 'rgba(192,192,192,0.18)', border: 'rgba(192,192,192,0.5)', icon: '#C0C0C0' },
    3: { bg: 'rgba(205,127,50,0.18)', border: 'rgba(205,127,50,0.5)', icon: '#CD7F32' },
};

const Avatar = ({ name, accent, size = 38 }) => {
    const initials = (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: accent ? `${accent}33` : 'rgba(128,128,128,0.2)',
            border: `2px solid ${accent || 'rgba(128,128,128,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.38, fontWeight: '700',
            color: accent || '#888', flexShrink: 0,
            letterSpacing: '-0.5px'
        }}>
            {initials}
        </div>
    );
};

const ListItem = ({ theme, fSize, isUser, isAdmin, rank, name, score, index }) => {
    const isDark = theme === 'dark';

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: {
            opacity: 1, y: 0, scale: 1,
            transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 }
        },
        exit: { opacity: 0, scale: 0.9 }
    };

    const medal = MEDAL_COLORS[rank];
    const borderColor = medal
        ? medal.border
        : isUser ? Colors.get('done', theme)
        : isAdmin ? Colors.get('accent', theme) : 'transparent';

    const bgColor = medal
        ? (isDark ? medal.bg : medal.bg)
        : isUser
        ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
        : (isDark ? 'rgba(30,30,30,0.4)' : '#FFFFFF');

    const avatarAccent = medal
        ? medal.icon
        : isUser ? Colors.get('done', theme)
        : isAdmin ? '#00BFFF' : null;

    let RankDisplay;
    if (rank === 1) RankDisplay = <FaTrophy size={16} color={MEDAL_COLORS[1].icon} />;
    else if (rank === 2) RankDisplay = <FaMedal size={16} color={MEDAL_COLORS[2].icon} />;
    else if (rank === 3) RankDisplay = <FaMedal size={16} color={MEDAL_COLORS[3].icon} />;
    else RankDisplay = <span style={{ fontSize: '13px', fontWeight: 'bold', color: Colors.get('subText', theme) }}>{rank}</span>;

    return (
        <motion.div
            layout
            variants={itemVariants}
            initial="hidden" animate="visible" exit="exit"
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '16px', marginBottom: '8px',
                backdropFilter: 'blur(10px)',
                boxShadow: medal
                    ? `0 4px 16px ${medal.icon}22`
                    : (isDark ? '0 4px 6px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)'),
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Rank */}
                <div style={{
                    width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                    {RankDisplay}
                </div>

                {/* Avatar */}
                <Avatar name={name} accent={avatarAccent} />

                {/* Name & badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        fontSize: fSize === 0 ? '15px' : '17px',
                        fontWeight: (isUser || isAdmin || medal) ? '700' : '500',
                        color: Colors.get('mainText', theme)
                    }}>
                        {name}
                    </span>
                    {isAdmin && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backgroundColor: 'rgba(0,191,255,0.15)',
                            borderRadius: '4px', padding: '2px 4px'
                        }}>
                            <FaUserShield size={11} color="#00BFFF" />
                        </div>
                    )}
                    {isUser && (
                        <FaUserAlt size={10} color={Colors.get('done', theme)} />
                    )}
                </div>
            </div>

            {/* Score */}
            <div style={{
                fontSize: fSize === 0 ? '16px' : '18px', fontWeight: 'bold',
                color: medal ? medal.icon : Colors.get('done', theme),
                fontFamily: 'monospace', letterSpacing: '-0.5px'
            }}>
                {score}
            </div>
        </motion.div>
    );
};

// === Styles ===
const styles = (theme, fSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100vw",
        height: "92vh", marginTop:'110px',
        fontFamily: "Segoe UI",
    },
    controlsWrapper: {
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        marginBottom: '20px',
        zIndex: 10
    },
    listContainer: {
        flex: 1,
        width: '94%',
        overflowY: 'scroll',
        padding: '0 5px', // Space for scrollbar
        display: 'flex',
        flexDirection: 'column',
        // Hide scrollbar but keep functionality
        scrollbarWidth: 'none', 
        msOverflowStyle: 'none',
    },
    loadingText: {
        textAlign: 'center',
        marginTop: '40px',
        color: Colors.get('subText', theme),
        fontSize: '14px'
    }
});

export default Records;

