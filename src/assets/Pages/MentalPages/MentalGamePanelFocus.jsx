import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision } from './FocusProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaFire, FaMedal, FaStopwatch, FaPlay, FaRedo } from 'react-icons/fa';
import { IoArrowBackCircle } from "react-icons/io5";
import { focusTrainingLevels, saveSessionDuration } from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanelFocus = ({ show, type, difficulty, setShow }) => {
    // === CORE LOGIC STATES ===
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // Game flow
    const [isRunning, setIsRunning] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [showStartTimer, setShowStartTimer] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [currentProblem, setCurrentProblem] = useState(null); 
    const [userSelection, setUserSelection] = useState(new Set()); 
    const [feedback, setFeedback] = useState({}); 

    // Per-problem timing
    const [problemStartTime, setProblemStartTime] = useState(0);
    const [problemTimerActive, setProblemTimerActive] = useState(false);
    const [roundTimeLeft, setRoundTimeLeft] = useState(0);
    const [roundTimerActive, setRoundTimerActive] = useState(false);

    // Audio
    const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

    // Scoring & Progress
    const [scores, setScores] = useState(0);
    const [stage, setStage] = useState(1);
    const [streakLength, setStreakLength] = useState(0);
    const [rightAnswers, setRightAnswers] = useState(0);
    const [record, setRecord] = useState(AppData.mentalRecords[type]?.[difficulty] || 0);
    const [time, setTime] = useState(0);

    // Countdown
    const [seconds, setSeconds] = useState(0);

    // Feedback delay
    const [delayTimer, setDelayTimer] = useState(false);
    const [addScores, setAddScores] = useState(0);
    const [message, setMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');

    // === EFFECTS ===

    // Preferences
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
        };
    }, []);

    // Session Timer
    useEffect(() => {
        let intervalId = null;
        if (isRunning) {
            intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    // Start Countdown
    useEffect(() => {
        if (!showStartTimer) return;
        const totalSeconds = Math.ceil(startTimerDuration / 1000);
        setSeconds(totalSeconds);
        const intervalId = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalId);
                    handleStart();
                    setShowStartTimer(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, [showStartTimer]);

    // Auto-submit logic
    useEffect(() => {
        if (userSelection.size === 0 || delayTimer) return;
        const timeout = setTimeout(() => {
            handleSubmit();
        }, 800); 
        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userSelection, delayTimer]);

    // Round Timer
    useEffect(() => {
        if (!roundTimerActive || roundTimeLeft <= 0) {
            if (roundTimeLeft <= 0 && isStart && !delayTimer && !isFinished) {
                handleSubmit();
            }
            return;
        }
        const id = setTimeout(() => {
            setRoundTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearTimeout(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roundTimerActive, roundTimeLeft, isStart, delayTimer, isFinished]);

    // Delay After Feedback
    useEffect(() => {
        if (!delayTimer) return;
        const timer = setTimeout(() => {
            const nextScore = scores + addScores;
            setScores(nextScore);
            setAddScores(0);
            setUserSelection(new Set());
            setFeedback({});

            if (stage >= 20) {
                onFinishSession(nextScore);
            } else {
                setStage(prev => prev + 1);
                setNewProblem(stage + 1);
            }
            setDelayTimer(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, [delayTimer, scores, addScores, stage]);


    // === LOGIC HANDLERS ===

    const handleSymbolClick = useCallback((index) => {
        if (!isStart || isFinished || delayTimer || isPaused) return;

        const symbol = currentProblem.items[index];
        const isTarget = symbol === currentProblem.targetSymbol;

        setUserSelection((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index); 
            } else {
                newSet.add(index);
            }
            return newSet;
        });

        setFeedback((prev) => ({
            ...prev,
            [index]: isTarget ? 'correct' : 'wrong',
        }));

        if (!isTarget) {
            playWrong();
        }
    }, [currentProblem, isStart, isFinished, delayTimer, isPaused, playWrong]);

    const handleSubmit = () => {
        if (!currentProblem || delayTimer) return;

        const { items, targetSymbol } = currentProblem;
        const correctIndices = items
            .map((sym, i) => (sym === targetSymbol ? i : -1))
            .filter(i => i !== -1);
        const correctCount = correctIndices.length;

        const userCorrect = Array.from(userSelection).filter(i => items[i] === targetSymbol).length;
        const userWrong = Array.from(userSelection).filter(i => items[i] !== targetSymbol).length;

        const userAnswer = userCorrect; 
        const expectedAnswer = correctCount;

        const answerTime = Date.now() - problemStartTime;
        const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, userAnswer, streakLength);
        const isPerfect = userWrong === 0 && userCorrect === expectedAnswer;

        let addMessage = '';
        if (isPerfect) {
            addMessage = getPraise(langIndex);
            setRightAnswers(prev => prev + 1);
        } else {
            addMessage = langIndex === 0
                ? `Найдено: ${userCorrect}/${expectedAnswer}`
                : `Found: ${userCorrect}/${expectedAnswer}`;
        }

        const col = isPerfect
            ? Colors.get('maxValColor', theme)
            : Colors.get('minValColor', theme);

        setStatusColor(col);
        setMessage(addMessage);
        setAddScores(points);
        setStreakLength(prev => (isPerfect ? prev + 1 : 0));
        isPerfect ? playRight() : playWrong();

        setDelayTimer(true);
        setProblemTimerActive(false);
        setRoundTimerActive(false);
    };

    const handleStart = () => {
        initAudio();
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setMessage('');
        setIsStart(true);
        setIsRunning(true);
        setIsPaused(false);
        setTime(0);
        setStartTime(Date.now());
        setNewProblem(1);
    };

    const setNewProblem = (nextStage) => {
        const level = focusTrainingLevels[difficulty];
        const [items, answerStr] = getProblem(type, difficulty, nextStage);
        const roundTime = level.roundTimeSec || 10;
        setRoundTimeLeft(roundTime);
        setRoundTimerActive(true);

        // eslint-disable-next-line no-unused-vars
        const debugStr = answerStr; // kept for potential debugging

        if (!items || items.length === 0) {
            setMessage(langIndex === 0 ? 'Ошибка' : 'Error');
            setStatusColor(Colors.get('minValColor', theme));
            setDelayTimer(true);
            return;
        }

        setCurrentProblem({
            items,
            targetSymbol: level.targetSymbol || '★',
        });
        setUserSelection(new Set());
        setFeedback({});
        setProblemStartTime(Date.now());
        setProblemTimerActive(true);
    };

    const handleReload = () => {
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setMessage('');
        setUserSelection(new Set());
        setFeedback({});
        setStartTime(Date.now());
        if (isStart) setNewProblem(1);
    };

    const onFinishSession = (totalScore) => {
        onFinish(totalScore);
        const isRecord = totalScore > record;
        const msg = congratulations(false, langIndex, totalScore, rightAnswers, 20, isRecord, false);
        setIsRunning(false);
        setMessage(msg);
        setIsFinished(true);
        setIsStart(false);
    };

    const onFinish = (finalScore) => {
        if (finalScore > record) {
            setRecord(finalScore);
            AppData.mentalRecords[type][difficulty] = finalScore;
        }
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
        saveSessionDuration(duration, finalScore > record, type, difficulty, finalScore);
        setScores(0);
        setAddScores(0);
        setStage(1);
        setRightAnswers(0);
    };

    // === ANIMATION VARIANTS ===
    const slideUp = {
        hidden: { y: '100%' },
        visible: { y: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
        exit: { y: '100%' }
    };

    const fadeIn = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    // === RENDER HELPERS ===
    const renderProblemItems = () => {
        if (!currentProblem || !currentProblem.items) return null;

        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', width: '100%', maxWidth: '300px' }}>
                {currentProblem.items.map((symbol, i) => {
                    let bgColor = Colors.get('bottomPanel', theme);
                    let borderColor = Colors.get('border', theme);
                    let textColor = Colors.get('mainText', theme);

                    if (feedback[i] === 'correct') {
                        bgColor = Colors.get('maxValColor', theme) + '30';
                        borderColor = Colors.get('maxValColor', theme);
                        textColor = Colors.get('maxValColor', theme);
                    } else if (feedback[i] === 'wrong') {
                        bgColor = Colors.get('minValColor', theme) + '30';
                        borderColor = Colors.get('minValColor', theme);
                        textColor = Colors.get('minValColor', theme);
                    } else if (userSelection.has(i)) {
                        borderColor = Colors.get('mainText', theme);
                        bgColor = Colors.get('mainText', theme) + '20';
                    }

                    return (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleSymbolClick(i)}
                            style={{
                                aspectRatio: '1/1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                color: textColor,
                                backgroundColor: bgColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: '12px',
                                cursor: isStart && !delayTimer && !isPaused ? 'pointer' : 'default',
                                userSelect: 'none',
                            }}
                        >
                            {symbol}
                        </motion.div>
                    );
                })}
            </div>
        );
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    key="modal-container"
                    variants={slideUp}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    style={styles(theme).container}
                >
                    <AnimatePresence mode='wait'>
                        
                        {/* 1. START SCREEN */}
                        {!isStart && !showStartTimer && !isFinished && (
                            <motion.div key="start-screen" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).contentWrapper}>
                                <div style={styles(theme).header}>
                                    <IoArrowBackCircle onClick={() => { setShow(false); setIsFinished(false); }} style={styles(theme).iconButton} />
                                    <h2 style={styles(theme, fSize).title}>{focusTrainingLevels[difficulty].level[langIndex]}</h2>
                                    <div style={{ width: 40 }} />
                                </div>

                                <div style={styles(theme).card}>
                                    <div style={{...styles(theme).title, textAlign:'center', fontSize: '16px', marginBottom: 10}}>
                                        {focusTrainingLevels[difficulty].title[langIndex]}
                                    </div>
                                    <p style={styles(theme).description}>{focusTrainingLevels[difficulty].description[langIndex]}</p>
                                    
                                    <div style={styles(theme).statsGrid}>
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Элементов' : 'Items'} 
                                            value={`${focusTrainingLevels[difficulty].totalItemsRange[0]}–${focusTrainingLevels[difficulty].totalItemsRange[1]}`} 
                                        />
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Время' : 'Time'} 
                                            value={`${focusTrainingLevels[difficulty].timeLimitSec}s`} 
                                        />
                                    </div>

                                    <p style={styles(theme).disclaimer}>{disclaimer(langIndex)}</p>
                                </div>

                                <div style={styles(theme).playButtonContainer}>
                                    <motion.button 
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowStartTimer(true)} 
                                        style={styles(theme).playButton}
                                    >
                                        <FaPlay style={{ marginRight: 10 }} /> {langIndex === 0 ? 'Начать' : 'Start'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. COUNTDOWN SCREEN */}
                        {!isFinished && showStartTimer && (
                            <motion.div key="countdown" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).centeredFull}>
                                <motion.div 
                                    key={seconds}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1.5, opacity: 1 }}
                                    exit={{ scale: 2, opacity: 0 }}
                                    style={{ fontSize: '8rem', fontWeight: 'bold', color: Colors.get('icons', theme) }}
                                >
                                    {seconds}
                                </motion.div>
                                <p style={{ color: Colors.get('subText', theme), marginTop: 20, fontSize: '1.5rem' }}>
                                    {langIndex === 0 ? 'Приготовьтесь!' : 'Get ready!'}
                                </p>
                            </motion.div>
                        )}

                        {/* 3. GAME SCREEN */}
                        {!isFinished && isStart && (
                            <motion.div key="game-screen" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).gameContainer}>
                                {/* Top Bar */}
                                <div style={styles(theme).gameHeader}>
                                    <IoArrowBackCircle onClick={() => onFinishSession(scores + addScores)} style={styles(theme).iconButtonSmall} />
                                    
                                    <div style={styles(theme).gameStat}>
                                        <FaStopwatch style={{ marginRight: 6 }} /> {getParsedTime(time)}
                                    </div>
                                    <div style={{...styles(theme).gameStat, color: Colors.get('maxValColor', theme)}}>
                                        <FaStar style={{ marginRight: 6 }} /> {scores}
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div style={styles(theme).subStatsBar}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: Colors.get('minValColor', theme) }}>
                                        <FaFire /> {streakLength}
                                    </div>
                                    <div style={{ color: Colors.get('difficulty', theme), fontWeight: 'bold' }}>
                                        {`${stage} / 20`}
                                    </div>
                                </div>

                                {/* Round Timer */}
                                <div style={styles(theme).timerWrapper}>
                                     <svg viewBox="0 0 28 28" style={{ width: '100%', height: '100%' }}>
                                        <circle cx="14" cy="14" r="12" fill={Colors.get('background', theme)} stroke={Colors.get('border', theme)} strokeWidth="1"/>
                                        <text x="14" y="18" textAnchor="middle" fill={roundTimeLeft <= 3 ? Colors.get('minValColor', theme) : Colors.get('mainText', theme)} fontSize="10" fontWeight="bold">
                                            {roundTimeLeft}
                                        </text>
                                    </svg>
                                </div>

                                {/* Main Interaction Area */}
                                <motion.div 
                                    style={{
                                        ...styles(theme).problemCard,
                                        backgroundColor: delayTimer ? (statusColor || Colors.get('simplePanel', theme)) : Colors.get('simplePanel', theme),
                                        borderColor: delayTimer ? statusColor : 'transparent'
                                    }}
                                    animate={delayTimer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                >
                                    {delayTimer ? (
                                        /* Feedback */
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                                                {addScores > 0 ? `+${addScores}` : (langIndex === 0 ? 'Ошибка' : 'Mistake')}
                                            </div>
                                            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginTop: 5 }}>{message}</div>
                                        </div>
                                    ) : (
                                        /* Problem Grid */
                                        <div style={{ width: '100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
                                            <div style={{ fontSize: '14px', marginBottom: '16px', color: Colors.get('subText', theme), textAlign: 'center', opacity: 0.8 }}>
                                                {focusTrainingLevels[difficulty].rules?.[langIndex] || (langIndex === 0 ? 'Нажми на все ★' : 'Click all ★')}
                                            </div>
                                            {renderProblemItems()}
                                        </div>
                                    )}
                                </motion.div>

                            </motion.div>
                        )}

                        {/* 4. RESULT SCREEN */}
                        {isFinished && (
                            <motion.div key="result-screen" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).contentWrapper}>
                                <div style={styles(theme).header}>
                                    <div />
                                    <h2 style={styles(theme, fSize).title}>{langIndex === 0 ? 'Результат' : 'Result'}</h2>
                                    <div />
                                </div>

                                <div style={{ ...styles(theme).card, alignItems: 'center', gap: 20, paddingTop: 30 }}>
                                    <FaStar size={60} color={Colors.get('maxValColor', theme)} />
                                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>{scores}</div>
                                    
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <ResultRow theme={theme} label={langIndex === 0 ? 'Время' : 'Time'} value={getParsedTime(time)} />
                                        <ResultRow theme={theme} label={langIndex === 0 ? 'Правильно' : 'Correct'} value={`${rightAnswers} / 20`} />
                                        
                                        {scores > record ? (
                                            <div style={styles(theme).recordBox}>
                                                <FaMedal color="#FFD700" /> {langIndex === 0 ? 'Новый рекорд!' : 'New Record!'}
                                            </div>
                                        ) : (
                                            <ResultRow theme={theme} label={langIndex === 0 ? 'Лучший' : 'Best'} value={record} />
                                        )}
                                    </div>

                                    <p style={{ textAlign: 'center', fontSize: '14px', color: Colors.get('subText', theme), marginTop: 10 }}>{message}</p>
                                </div>

                                <div style={styles(theme).controlsRow}>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={handleReload} style={styles(theme).secondaryButton}>
                                        <FaRedo size={20} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShow(false); setIsFinished(false); }} style={styles(theme).primaryButton}>
                                        {langIndex === 0 ? 'Завершить' : 'Finish'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default MentalGamePanelFocus;

// === HELPER FUNCTIONS & COMPONENTS ===

const StatItem = ({ theme, label, value }) => (
    <div style={{ 
        backgroundColor: Colors.get('background', theme), 
        padding: '10px', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
    }}>
        <span style={{ fontSize: '12px', color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>{value}</span>
    </div>
);

const ResultRow = ({ theme, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '5px 0', borderBottom: `1px solid ${Colors.get('border', theme)}30` }}>
        <span style={{ color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ color: Colors.get('mainText', theme), fontWeight: 'bold' }}>{value}</span>
    </div>
);

function getPraise(langIndex) {
    const en = ["Great!", "Perfect!", "Sharp!", "Focused!", "Exact!"];
    const ru = ["Отлично!", "Идеально!", "Точно!", "Верно!", "Супер!"];
    const list = langIndex === 0 ? ru : en;
    return list[Math.floor(Math.random() * list.length)];
}

function getParsedTime(time) {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const disclaimer = (langIndex) => {
    return langIndex === 0 
        ? "Быстро находите целевые символы среди отвлекающих. Ошибки сбрасывают серию."
        : "Quickly find the target symbols among distractors. Mistakes break your streak.";
};

const congratulations = (isEndless, langIndex, score, right, total, isRecord) => {
    if (isRecord) return langIndex === 0 ? `Новый рекорд: ${score}!` : `New Record: ${score}!`;
    if (right >= 18) return langIndex === 0 ? "Орлиный глаз!" : "Eagle Eye!";
    return langIndex === 0 ? "Хорошая концентрация!" : "Good focus!";
};

// === STYLES ===

const styles = (theme, fSize = 14) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Segoe UI',
    },
    contentWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        width: '100%',
        boxSizing: 'border-box'
    },
    centeredFull: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    header: {
        width: '90%',
        marginTop: '65px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    },
    title: {
        fontSize: '20px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
        margin: 0
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: Colors.get('simplePanel', theme) + '80', // Glass
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${Colors.get('border', theme)}40`
    },
    description: {
        fontSize: '15px',
        color: Colors.get('subText', theme),
        textAlign: 'center',
        marginBottom: '20px',
        lineHeight: 1.4
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
        width: '100%',
        marginBottom: '20px'
    },
    disclaimer: {
        fontSize: '12px',
        color: Colors.get('subText', theme),
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 10
    },
    iconButton: {
        fontSize: '32px',
        color: Colors.get('skipped', theme),
        cursor: 'pointer'
    },
    iconButtonSmall: {
        fontSize: '28px',
        color: Colors.get('subText', theme),
        cursor: 'pointer'
    },
    playButtonContainer: {
        marginTop: 'auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '40px'
    },
    playButton: {
        backgroundColor: Colors.get('barsColorMeasures', theme),
        color: '#fff',
        border: 'none',
        borderRadius: '16px',
        padding: '16px 40px',
        fontSize: '18px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    },
    // Game Screen Styles
    gameContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%'
    },
    gameHeader: {
        width: '90%',
        display: 'flex',
        marginTop: '55px',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 0'
    },
    gameStat: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '18px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme)
    },
    subStatsBar: {
        width: '90%',
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '10px'
    },
    timerWrapper: {
        width: '48px', 
        height: '48px', 
        marginBottom: '10px'
    },
    problemCard: {
        width: '90%',
        maxWidth: '350px',
        minHeight: '300px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '2px solid transparent',
        padding: '20px',
        boxSizing: 'border-box'
    },
    // Result Screen Styles
    recordBox: {
        backgroundColor: 'rgba(255, 215, 0, 0.15)',
        color: '#FFD700',
        padding: '10px',
        borderRadius: '12px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontWeight: 'bold',
        fontSize: '14px'
    },
    controlsRow: {
        display: 'flex',
        gap: '20px',
        marginTop: 'auto',
        marginBottom: '40px'
    },
    primaryButton: {
        backgroundColor: Colors.get('difficulty5', theme),
        color: Colors.get('mainText', theme),
        border: 'none',
        borderRadius: '16px',
        padding: '14px 30px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    secondaryButton: {
        backgroundColor: Colors.get('background', theme),
        color: Colors.get('subText', theme),
        border: `1px solid ${Colors.get('border', theme)}`,
        borderRadius: '16px',
        padding: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
    }
});

