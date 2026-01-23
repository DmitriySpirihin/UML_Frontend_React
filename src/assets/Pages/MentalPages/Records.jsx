import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import { NotificationsManager } from '../../StaticClasses/NotificationsManager.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$,premium$ } from '../../StaticClasses/HabitsBus';

// Icons
import { FaStopwatch, FaMemory, FaUserAlt, FaTrophy, FaMedal } from 'react-icons/fa';
import { GiLogicGateNxor, GiTargetShot, GiStarsStack, GiCrownedSkull } from 'react-icons/gi';
import { FaStarHalf, FaStar, FaInfinity } from 'react-icons/fa';

// === Configuration ===
const categoryLabels = [
    ['Быстрый счет', 'Quick Math'],
    ['Память', 'Memory'],
    ['Логика', 'Logic'],
    ['Фокус', 'Focus']
];

const categoryIcons = [FaStopwatch, FaMemory, GiLogicGateNxor, GiTargetShot];

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

    // Initial Fetch
    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                // Simulate fetch or get real data
                const data = await NotificationsManager.getMentalRecordsGlobal() || [];
                
                // If data is empty or fetch failed, fallback to local user to show something
                if (!data || data.length === 0) {
                     setGlobalData([{ name: UserData?.name || 'User', data: AppData.mentalRecords }]);
                } else {
                    setGlobalData(data);
                }
            } catch (err) {
                setGlobalData([{ name: UserData?.name || 'User', data: AppData.mentalRecords }]);
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

    // Sort data based on current selection
    const sortedData = [...globalData].sort((a, b) => {
        const scoreA = a.data?.[categoryIndex]?.[difficultyIndex] || 0;
        const scoreB = b.data?.[categoryIndex]?.[difficultyIndex] || 0;
        return scoreB - scoreA;
    });

    return (
        <div style={styles(theme).container}>
            {/* Header / Title Area could go here */}
            
            {/* Controls Area */}
            <div style={styles(theme).controlsWrapper}>
                <SegmentedControl
                    items={categoryIcons}
                    selectedIndex={categoryIndex}
                    setSelectedIndex={(i) => {
                        setCategoryIndex(i);
                        // Reset to Hard max if category implies it, logic from your code
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
                    colorKey="difficulty" // Different accent for sub-menu
                    isSecondary
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
                                    key={item.name + index} // unique key
                                    theme={theme}
                                    fSize={fSize}
                                    isUser={item.name === UserData.name}
                                    rank={index + 1}
                                    name={item.name}
                                    score={item.data?.[categoryIndex]?.[difficultyIndex] || 0}
                                    index={index}
                                />
                            ))}
                        </AnimatePresence>
                        
                        {sortedData.length === 0 && (
                            <div style={{textAlign: 'center', color: Colors.get('subText', theme), marginTop: 20}}>
                                {langIndex === 0 ? 'Нет данных' : 'No records yet'}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
            {!hasPremium && (
                    <div 
                                        onClick={(e) => e.stopPropagation()} 
                                        style={{
                                            position: 'absolute', inset: 0, zIndex: 2,
                                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                            backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                                            backdropFilter: 'blur(5px)',
                                            textAlign: 'center'
                                        }}
                                    >
                                        <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                                            {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                                        </div>
                                    </div>
                  )}
        </div>
    );
};

// === Sub-Components ===

const SegmentedControl = ({ items, selectedIndex, setSelectedIndex, theme, colorKey, isSecondary }) => {
    return (
        <div style={{
            display: 'flex',
            backgroundColor: Colors.get('panel', theme),
            padding: '4px',
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
                        <Icon 
                            size={isSecondary ? 18 : 22} 
                            color={isActive ? activeColor : Colors.get('subText', theme)}
                            style={{ transition: 'color 0.3s ease' }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

const ListItem = ({ theme, fSize, isUser, rank, name, score, index }) => {
    const isDark = theme === 'dark';
    
    // Animation variants for staggering
    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { delay: index * 0.05, type: 'spring', stiffness: 300, damping: 24 } 
        },
        exit: { opacity: 0, scale: 0.9 }
    };

    // Rank Styling
    let RankIcon = null;
    let rankColor = Colors.get('mainText', theme);
    
    if (rank === 1) { RankIcon = FaTrophy; rankColor = '#FFD700'; } // Gold
    else if (rank === 2) { RankIcon = FaMedal; rankColor = '#C0C0C0'; } // Silver
    else if (rank === 3) { RankIcon = FaMedal; rankColor = '#CD7F32'; } // Bronze

    return (
        <motion.div
            layout
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '16px',
                backgroundColor: isUser 
                    ? (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)') 
                    : (isDark ? 'rgba(30, 30, 30, 0.4)' : '#FFFFFF'),
                border: isUser 
                    ? `1px solid ${Colors.get('light', theme)}` 
                    : `1px solid ${Colors.get('border', theme)}`,
                backdropFilter: 'blur(10px)',
                boxShadow: isDark ? '0 4px 6px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.05)',
                marginBottom: '8px'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {/* Rank Badge */}
                <div style={{
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '8px',
                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
                    fontWeight: 'bold',
                    color: rankColor,
                    fontSize: '14px'
                }}>
                    {RankIcon ? <RankIcon size={16} /> : rank}
                </div>

                {/* Name & User Indicator */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        fontSize: fSize === 0 ? '15px' : '17px',
                        fontWeight: isUser ? 'bold' : 'normal',
                        color: isUser ? Colors.get('light', theme) : Colors.get('mainText', theme)
                    }}>
                        {name}
                        {isUser && <FaUserAlt size={10} color={Colors.get('light', theme)} />}
                    </div>
                </div>
            </div>

            {/* Score */}
            <div style={{
                fontSize: fSize === 0 ? '16px' : '18px',
                fontWeight: 'bold',
                color: Colors.get('done', theme), // Usually a bright accent color
                fontFamily: 'monospace', // Better for numbers
                letterSpacing: '-0.5px'
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
        height: "88vh", // Adjusted to not overlap bottom nav if exists
        width: "100vw",
        marginTop: '115px', // More breathing room
        fontFamily: "Segoe UI",
        overflowY: 'scroll'
    },
    controlsWrapper: {
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        zIndex: 10
    },
    listContainer: {
        flex: 1,
        width: '94%',
        overflowY: 'auto',
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

