import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision, getLogicExplanation } from './LogicProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaMedal, FaStopwatch, FaPlay, FaRedo } from 'react-icons/fa';
import MentalInput from './MentalInput';
import { logicOddOneOutLevels, saveSessionDuration } from './MentalHelper';
import { MentalResultScreen, StreakBadge } from './MentalHudParts';

const startTimerDuration = 3000;
const capFirst = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

const MentalGamePanel = ({ show, type, difficulty, setShow }) => {
    // === CORE LOGIC STATES ===
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // Game Flow
    const [input, setInput] = useState('');
    const [handledInput, setHandledInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [showStartTimer, setShowStartTimer] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isPaused, setIsPaused] = useState(false);
    const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);
    const [pendingStage, setPendingStage] = useState(1);

    // Per-problem timing
    const [problemStartTime, setProblemStartTime] = useState(0);
    const [currentProblem, setCurrentProblem] = useState(null); 
    const [problemElapsedMs, setProblemElapsedMs] = useState(0);
    const [problemTimerActive, setProblemTimerActive] = useState(false);

    // Audio
    const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

    // Delay after feedback
    const [delay, setDelay] = useState(0);
    const [delayTimer, setDelayTimer] = useState(false);

    // Scoring & Progress
    const [scores, setScores] = useState(0);
    const [stage, setStage] = useState(1);
    const [streakLength, setStreakLength] = useState(0);
    const [answer, setAnswer] = useState(''); 

    // Feedback
    const [message, setMessage] = useState('');
    const [addScores, setAddScores] = useState(0);
    const [wrongData, setWrongData] = useState(null);

    // Statistics
    const [rightAnswers, setRightAnswers] = useState(0);
    const [record, setRecord] = useState(AppData.mentalRecords[type]?.[difficulty] || 0);
    const [time, setTime] = useState(0);

    // Countdown before start
    const [seconds, setSeconds] = useState(0);

    // === EFFECTS ===

    // Input Handling
    useEffect(() => {
        if (!isStart || isFinished || delayTimer || wrongData) {
            setInput('');
            return;
        }
        if (input === 'CC') {
            setHandledInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
        } else if (input === '>>>') {
            handleAnswer();
        } else if (/^\d+$/.test(input)) {
            setHandledInput(input);
        }
        setInput('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, isStart, isFinished, delayTimer]);

    // Global Session Timer
    useEffect(() => {
        let intervalId = null;
        if (isRunning) {
            intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    // Subscriptions
    useEffect(() => {
        const sub1 = theme$.subscribe(setthemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
        };
    }, []);

    // Pre-Start Countdown
    useEffect(() => {
        if (!showStartTimer) {
            setSeconds(0);
            return;
        }
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

    // Feedback Delay
    useEffect(() => {
        if (!delayTimer) return;
        const intervalId = setInterval(() => {
            setDelay((prev) => {
                if (prev >= 900) {
                    clearInterval(intervalId);
                    setDelayTimer(false);
                    setDelay(0);
                    const nextScore = scores + addScores;
                    setScores(nextScore);
                    setAddScores(0);
                    setHandledInput('');
                    if (finishAfterFeedback) {
                        onFinishSession(nextScore);
                    } else {
                        setStage(pendingStage);
                        setNewProblem(pendingStage);
                    }
                    return 0;
                }
                return prev + 100;
            });
        }, 100);
        return () => clearInterval(intervalId);
    }, [delayTimer, scores, addScores, finishAfterFeedback, pendingStage]);

    // Per-Problem Stopwatch
    useEffect(() => {
        if (!problemTimerActive || isFinished || delayTimer) {
            return;
        }
        const intervalId = setInterval(() => {
            setProblemElapsedMs((prev) => prev + 100);
        }, 100);
        return () => clearInterval(intervalId);
    }, [problemTimerActive, isFinished, delayTimer]);

    // === HANDLERS ===
    const handleStart = () => {
        initAudio();
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setHandledInput('');
        setMessage('');
        setNewProblem(1);
        setIsStart(true);
        setIsRunning(true);
        setIsPaused(false);
        setTime(0);
    };

    const setNewProblem = (nextStage = stage) => {
        const [items, correctIndexStr] = getProblem(type, difficulty, nextStage);
        const cleanAnswer = String(correctIndexStr).trim();
        
        setCurrentProblem({ items, correctIndex: parseInt(correctIndexStr, 10) });
        setAnswer(cleanAnswer);
        setHandledInput('');
        setMessage('');
        setPendingStage(nextStage + 1);
        setFinishAfterFeedback(false);
        setProblemStartTime(Date.now());
        setProblemElapsedMs(0);
        setProblemTimerActive(true);
    };

    const handleAnswer = () => {
        if (!currentProblem) return;
        setProblemTimerActive(false);

        const userAnswer = String(handledInput).trim();
        const expectedAnswer = String(answer).trim();

        const answerTime = Date.now() - problemStartTime;
        const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, userAnswer, streakLength);
        const precision = getPrecision(type, expectedAnswer, userAnswer);

        setStreakLength((prev) => (hasStreak(type, expectedAnswer, userAnswer) ? prev + 1 : 0));
        precision === 0 ? playRight() : playWrong();

        if (precision === 0) {
            setRightAnswers((prev) => prev + 1);
            setMessage(getPraise(langIndex));
            setAddScores(points);
            setFinishAfterFeedback(stage >= 20);
            setDelayTimer(true);
        } else {
            setIsRunning(false);
            setWrongData({
                items: currentProblem.items,
                correctAnswer: parseInt(expectedAnswer),
                explanation: getLogicExplanation(currentProblem.items, parseInt(expectedAnswer), langIndex),
                isLast: stage >= 20,
                pendingNext: pendingStage,
            });
            setHandledInput('');
        }
    };

    const handleAcknowledgeWrong = () => {
        const { isLast, pendingNext } = wrongData;
        setWrongData(null);
        setHandledInput('');
        if (isLast) {
            onFinishSession(scores);
        } else {
            setStage(pendingNext);
            setNewProblem(pendingNext);
            setIsRunning(true);
        }
    };

    const handleReload = () => {
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setHandledInput('');
        setMessage('');
        setNewProblem(1);
        setIsStart(true);
        setIsRunning(true);
        setIsPaused(false);
        setIsFinished(false);
    };

    const onFinishSession = (totalScore = scores) => {
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
        const duration = Math.round(time / 1000);
        saveSessionDuration(duration, finalScore > record, type, difficulty, finalScore,rightAnswers);
        setAddScores(0);
        setStage(1);
    };

    const isDark = theme === 'dark';

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

    // === HELPER RENDER ===
    const renderProblemItems = () => {
        if (!currentProblem || !currentProblem.items) return null;
        const { items } = currentProblem;

        if (Array.isArray(items) && items.length > 0) {
            // Pure Number Sequence
            if (typeof items[0] === 'number') {
                return (
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {items.map((num, i) => (
                            <div key={i} style={styles(theme).itemBox}>
                                {num}
                            </div>
                        ))}
                    </div>
                );
            } 
            // Shape / Color Object
            else if (typeof items[0] === 'object' && (items[0].shape || items[0].color || typeof items[0].value === 'number')) {
                return (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {items.map((item, i) => (
                            <div
                                key={i}
                                style={{
                                    ...styles(theme).shapeBox,
                                    backgroundColor: item.color || 'gray',
                                    clipPath: getClipPathForShape(item.shape || 'circle'),
                                    color: getContrastColor(item.color || 'gray'),
                                }}
                            >
                                {typeof item.value === 'number' && (
                                    <span style={{ pointerEvents: 'none' }}>{item.value}</span>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
        }
        return <div>?</div>;
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
                                    <div aria-hidden="true" style={{ width: 40 }} />
                                    <h2 style={styles(theme, fSize).title}>{logicOddOneOutLevels[difficulty].level[langIndex]}</h2>
                                    <div style={{ width: 40 }} />
                                </div>

                                <div style={styles(theme).card}>
                                    <div style={{...styles(theme).title, textAlign:'center', fontSize: '16px', marginBottom: 10}}>
                                        {capFirst(logicOddOneOutLevels[difficulty].title[langIndex])}
                                    </div>
                                    <p style={styles(theme).description}>{logicOddOneOutLevels[difficulty].description[langIndex]}</p>
                                    
                                    <div style={styles(theme).statsGrid}>
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Элементов' : 'Items'} 
                                            value={`${logicOddOneOutLevels[difficulty].itemsCountRange[0]}–${logicOddOneOutLevels[difficulty].itemsCountRange[1]}`} 
                                        />
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Время' : 'Time Limit'} 
                                            value={`${logicOddOneOutLevels[difficulty].timeLimitSec}s`} 
                                        />
                                    </div>

                                    <LogicInstructionsBlock theme={theme} langIndex={langIndex} />
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

                        {/* WRONG ANSWER PAUSE SCREEN */}
                        {!isFinished && wrongData && (
                            <motion.div key="wrong-screen" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).gameContainer}>
                                <div style={styles(theme).gameHeader}>
                                    <div style={{ width: 28 }} />
                                    <div style={styles(theme).timerStat}><FaStopwatch /> {getParsedTime(time)}</div>
                                    <div style={styles(theme).scoreStat}><ScoreGlyph theme={theme} /> {scores}</div>
                                </div>
                                <div style={styles(theme).subStatsBar}>
                                    <StreakBadge theme={theme} langIndex={langIndex} streakLength={streakLength} />
                                    <div style={styles(theme).roundStat}><span style={styles(theme).miniLabel}>{langIndex === 0 ? "Раунд" : "Round"}</span><span style={styles(theme).miniValue}>{`${stage}/20`}</span></div>
                                </div>
                                <div style={styles(theme).wrongCard}>
                                    <div style={{ fontSize: '14px', color: Colors.get('subText', theme), opacity: 0.8, textAlign: 'center' }}>
                                        {logicOddOneOutLevels[difficulty].rules[langIndex]}
                                    </div>
                                    {(() => {
                                        const items = wrongData.items;
                                        if (!items) return null;
                                        if (typeof items[0] === 'number') {
                                            return (
                                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                    {items.map((num, i) => (
                                                        <div key={i} style={{ ...styles(theme).itemBox, border: `2px solid ${i + 1 === wrongData.correctAnswer ? Colors.get('minValColor', theme) : Colors.get('border', theme)}`, color: i + 1 === wrongData.correctAnswer ? Colors.get('minValColor', theme) : Colors.get('mainText', theme) }}>
                                                            {num}
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return (
                                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                                                {items.map((item, i) => (
                                                    <div key={i} style={{ ...styles(theme).shapeBox, backgroundColor: item.color || 'gray', clipPath: getClipPathForShape(item.shape || 'circle'), color: getContrastColor(item.color || 'gray'), border: `2px solid ${i + 1 === wrongData.correctAnswer ? Colors.get('minValColor', theme) : Colors.get('border', theme)}` }}>
                                                        {typeof item.value === 'number' && <span>{item.value}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                    <div style={styles(theme).feedbackAnswer}>
                                        <span style={styles(theme).feedbackLabel}>{langIndex === 0 ? 'Правильный выбор' : 'Correct pick'}</span>
                                        <span style={styles(theme).feedbackValue}>#{wrongData.correctAnswer}</span>
                                    </div>
                                    {wrongData.explanation ? (
                                        <div style={styles(theme).feedbackTip}>
                                            <span style={styles(theme).feedbackTipIcon}>i</span>
                                            <span style={styles(theme).feedbackTipText}>{wrongData.explanation}</span>
                                        </div>
                                    ) : null}
                                </div>
                                <div style={styles(theme).ackButtonWrap}>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAcknowledgeWrong}
                                        style={styles(theme).ackButton}>
                                        <span>{langIndex === 0 ? 'Дальше' : 'Next'}</span>
                                        <span style={styles(theme).ackButtonIcon}>→</span>
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. GAME SCREEN */}
                        {!isFinished && isStart && !wrongData && (
                            <motion.div key="game-screen" variants={fadeIn} initial="hidden" animate="visible" exit="exit" style={styles(theme).gameContainer}>
                                {/* Top Bar */}
                                <div style={styles(theme).gameHeader}>
                                    <div aria-hidden="true" style={{ width: 42, height: 42 }} />
                                    
                                    <div style={styles(theme).timerStat}>
                                        <FaStopwatch /> {getParsedTime(time)}
                                    </div>
                                    <div style={styles(theme).scoreStat}>
                                        <ScoreGlyph theme={theme} /> {scores}
                                    </div>
                                </div>

                                {/* Stats Bar */}
                                <div style={styles(theme).subStatsBar}>
                                    <StreakBadge theme={theme} langIndex={langIndex} streakLength={streakLength} />
                                    <div style={styles(theme).roundStat}>
                                        <span style={styles(theme).miniLabel}>{langIndex === 0 ? "Раунд" : "Round"}</span><span style={styles(theme).miniValue}>{`${stage}/20`}</span>
                                    </div>
                                </div>

                                {/* Problem Timer (Small Circular) */}
                                {problemTimerActive && (
                                    <div style={styles(theme).timerWrapper}>
                                        <svg viewBox="0 0 28 28" style={{ width: '100%', height: '100%' }}>
                                            <circle cx="14" cy="14" r="12" fill={Colors.get('background', theme)} stroke={Colors.get('border', theme)} strokeWidth="1"/>
                                            <text x="14" y="18" textAnchor="middle" fill={Colors.get('mainText', theme)} fontSize="8" fontWeight="bold">
                                                {(problemElapsedMs / 1000).toFixed(1)}
                                            </text>
                                        </svg>
                                    </div>
                                )}

                                {/* Main Card Area */}
                                <div style={{flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>

                                    <motion.div
                                        style={{
                                            ...styles(theme).problemCard,
                                            ...(delayTimer ? styles(theme).feedbackProblemCard(addScores > 0) : {})
                                        }}
                                        animate={delayTimer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                    >
                                        {delayTimer ? (
                                            /* Feedback */
                                            <div style={styles(theme).feedbackContent}>
                                                <div style={styles(theme).feedbackScore(addScores > 0)}>
                                                    {addScores > 0 ? `+${addScores}` : (langIndex === 0 ? 'Ошибка' : 'Wrong')}
                                                </div>
                                                <div style={styles(theme).feedbackMessage}>{message}</div>
                                            </div>
                                        ) : (
                                            /* Problem Items */
                                            <div style={{ width: '100%', display:'flex', flexDirection:'column', alignItems:'center' }}>
                                                <div style={{ fontSize: '14px', marginBottom: '16px', color: Colors.get('subText', theme), textAlign: 'center', opacity: 0.8 }}>
                                                    {logicOddOneOutLevels[difficulty].rules[langIndex]}
                                                </div>
                                                {renderProblemItems()}
                                                <div style={{ marginTop: '20px', fontSize: '14px', color: Colors.get('subText', theme), textAlign: 'center' }}>
                                                    {langIndex === 0 ? 'Введите номер лишнего (1, 2...)' : 'Enter index of odd one out (1, 2...)'}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Input Display */}
                                    <div style={styles(theme).inputDisplay}>
                                        {handledInput || <span style={{ opacity: 0.1 }}>_</span>}
                                    </div>

                                    {/* Keypad */}
                                    <div style={{ flex: 1, width: '100%' }}>
                                        <MentalInput setInput={setInput} type={type} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 4. RESULT SCREEN */}
                        {isFinished && (
                            <MentalResultScreen
                                theme={theme}
                                langIndex={langIndex}
                                fSize={fSize}
                                score={scores}
                                timeValue={getParsedTime(time)}
                                correctValue={`${rightAnswers}/20`}
                                bestValue={record}
                                isRecord={scores > record}
                                message={message}
                                onRetry={() => { handleReload(); setScores(0); }}
                                onFinish={() => { setShow(false); setIsFinished(false); setScores(0); setRightAnswers(0); }}
                            />
                        )}

                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const LogicInstructionsBlock = ({ theme, langIndex }) => {
    const isDark = theme === 'dark';
    const items = langIndex === 0 ? [
        { icon: '🔍', text: 'Найди элемент, который не похож на остальные' },
        { icon: '🔢', text: 'Введи его порядковый номер (1, 2, 3...)' },
        { icon: '👁',  text: 'Смотри на цвет, форму и число одновременно' },
        { icon: '⚡', text: 'Чем быстрее ответ — тем больше очков' },
    ] : [
        { icon: '🔍', text: 'Find the element that doesn\'t match the others' },
        { icon: '🔢', text: 'Enter its position number (1, 2, 3...)' },
        { icon: '👁',  text: 'Look at color, shape and value at the same time' },
        { icon: '⚡', text: 'The faster you answer — the more points you earn' },
    ];
    return (
        <div style={{
            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.62)',
            borderRadius: '18px',
            padding: '14px',
            marginTop: '12px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(20,24,32,0.08)'}`,
        }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < items.length - 1 ? '9px' : 0 }}>
                    <span style={{ fontSize: '14px', flexShrink: 0, lineHeight: '1.35' }}>{item.icon}</span>
                    <span style={{ fontSize: '12px', color: Colors.get('subText', theme), lineHeight: '1.35', fontWeight: 700 }}>{item.text}</span>
                </div>
            ))}
        </div>
    );
};

export default MentalGamePanel;

// === HELPER FUNCTIONS & COMPONENTS ===

const StatItem = ({ theme, label, value }) => (
    <div style={{ 
        background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.7)',
        padding: '11px 10px',
        borderRadius: '16px',
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '58px',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.06)'}`,
    }}>
        <span style={{ fontSize: '10px', color: Colors.get('subText', theme), fontWeight: 800, letterSpacing: '0.02em' }}>{label}</span>
        <span style={{ fontSize: '16px', fontWeight: 900, color: Colors.get('mainText', theme), marginTop: '3px' }}>{value}</span>
    </div>
);

const ResultRow = ({ theme, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '5px 0', borderBottom: `1px solid ${Colors.get('border', theme)}30` }}>
        <span style={{ color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ color: Colors.get('mainText', theme), fontWeight: 'bold' }}>{value}</span>
    </div>
);

const ScoreGlyph = ({ theme }) => (
    <span style={styles(theme).scoreGlyph} aria-hidden="true">
        <span style={styles(theme).scoreGlyphInner} />
    </span>
);

const getClipPathForShape = (shape) => {
    switch (shape) {
      case 'circle': return 'circle(50% at 50% 50%)';
      case 'square': return 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
      case 'triangle': return 'polygon(50% 0%, 0% 100%, 100% 100%)';
      case 'hexagon': return 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)';
      default: return 'circle(50% at 50% 50%)';
    }
};

const getContrastColor = (hex) => {
    if (!hex || hex[0] !== '#') return 'white';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'black' : 'white';
};

function playVibro(type){
    if(AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
}

function getPraise(langIndex) {
    const en = ["Great!", "Perfect!", "Yes!", "Correct!", "Sharp!"];
    const ru = ["Отлично!", "Верно!", "Точно!", "Правильно!", "Молодец!"];
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
        ? "Найдите лишний элемент по цвету, форме или значению. Отвечайте быстро, чтобы набрать больше очков."
        : "Find the odd one out based on color, shape, or value. Answer quickly to earn more points.";
};

const congratulations = (isEndless, langIndex, score, right, total, isRecord) => {
    if (isRecord) return langIndex === 0 ? `Новый рекорд: ${score}!` : `New Record: ${score}!`;
    if (right >= 18) return langIndex === 0 ? "Отличная логика!" : "Sharp logic!";
    return langIndex === 0 ? "Хорошая разминка!" : "Good practice!";
};

// === STYLES ===

const styles = (theme, fSize = 14) => ({
    container: {
        background: theme === 'dark'
            ? 'radial-gradient(circle at 50% -10%, rgba(127,200,184,0.15), transparent 32%), radial-gradient(circle at 96% 12%, rgba(102,217,232,0.1), transparent 30%), #0E1013'
            : 'radial-gradient(circle at 50% -10%, rgba(127,200,184,0.19), transparent 32%), radial-gradient(circle at 96% 12%, rgba(102,217,232,0.14), transparent 30%), #F4F5F7',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        width: '100vw',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        color: Colors.get('mainText', theme),
    },
    contentWrapper: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 20px calc(34px + env(safe-area-inset-bottom, 0px))',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
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
        width: '100%',
        maxWidth: '660px',
        display: 'grid',
        gridTemplateColumns: '44px minmax(0, 1fr) 44px',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '4px'
    },
    title: {
        fontSize: `${Math.max(21, fSize + 7)}px`,
        fontWeight: 900,
        color: Colors.get('mainText', theme),
        margin: 0,
        textAlign: 'center',
        textTransform: 'capitalize',
        lineHeight: 1.1,
    },
    card: {
        width: '100%',
        maxWidth: '660px',
        background: theme === 'dark'
            ? 'linear-gradient(145deg, rgba(24,35,34,0.94), rgba(16,19,23,0.98))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(236,246,243,0.94))',
        backdropFilter: 'blur(18px)',
        borderRadius: '24px',
        padding: '18px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme === 'dark' ? 'rgba(127,200,184,0.16)' : 'rgba(46,111,99,0.14)'}`,
        boxShadow: theme === 'dark' ? '0 24px 56px rgba(0,0,0,0.34)' : '0 18px 40px rgba(24,36,44,0.12)',
    },
    description: {
        fontSize: '13px',
        color: Colors.get('subText', theme),
        textAlign: 'center',
        margin: '0 0 14px',
        lineHeight: 1.35,
        fontWeight: 750,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        width: '100%',
        marginBottom: '0'
    },
    disclaimer: {
        fontSize: '12px',
        color: Colors.get('subText', theme),
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 10
    },
    iconButton: {
        fontSize: '34px',
        color: Colors.get('subText', theme),
        cursor: 'pointer',
        filter: theme === 'dark' ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' : 'drop-shadow(0 8px 16px rgba(20,24,32,0.12))',
    },
    iconButtonSmall: {
        fontSize: '30px',
        color: Colors.get('subText', theme),
        cursor: 'pointer',
        filter: theme === 'dark' ? 'drop-shadow(0 8px 14px rgba(0,0,0,0.3))' : 'drop-shadow(0 8px 14px rgba(24,36,44,0.12))',
    },
    playButtonContainer: {
        marginTop: '6px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: '0'
    },
    playButton: {
        background: 'linear-gradient(135deg, #7FC8B8 0%, #66D9E8 100%)',
        color: '#0E1013',
        border: 'none',
        borderRadius: '20px',
        minHeight: '58px',
        padding: '0 34px',
        fontSize: '17px',
        fontWeight: 900,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 18px 34px rgba(127,200,184,0.18)'
    },
    // Game Screen Styles
    gameContainer: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        boxSizing: 'border-box',
        padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 0 38vh',
    },
    gameHeader: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '10px',
        padding: '10px',
        marginTop: '0',
        borderRadius: '24px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.68)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,32,0.08)'}`,
        boxShadow: theme === 'dark' ? '0 18px 38px rgba(0,0,0,0.22)' : '0 14px 28px rgba(24,36,44,0.1)',
        backdropFilter: 'blur(18px)',
    },
    gameStat: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minWidth: '92px',
        minHeight: '42px',
        padding: '0 12px',
        borderRadius: '18px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.76)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.06)'}`,
        fontSize: '18px',
        fontWeight: 900,
        color: Colors.get('mainText', theme),
    },
    timerStat: {
        justifySelf: 'center',
        minWidth: '126px',
        minHeight: '46px',
        padding: '0 18px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.78)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,32,0.07)'}`,
        color: Colors.get('mainText', theme),
        fontSize: '20px',
        fontWeight: 900,
        boxShadow: theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : '0 10px 20px rgba(24,36,44,0.08)',
    },
    scoreStat: {
        justifySelf: 'end',
        minWidth: '98px',
        minHeight: '46px',
        padding: '0 16px',
        borderRadius: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '9px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.075)' : 'rgba(20,24,32,0.065)'}`,
        color: theme === 'dark' ? '#C9D6E8' : '#3E5666',
        fontSize: '18px',
        fontWeight: 900,
    },
    scoreGlyph: {
        width: '28px',
        height: '28px',
        borderRadius: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark'
            ? 'linear-gradient(145deg, rgba(127,200,184,0.2), rgba(102,217,232,0.12))'
            : 'linear-gradient(145deg, rgba(127,200,184,0.22), rgba(102,217,232,0.14))',
        border: `1px solid ${theme === 'dark' ? 'rgba(127,200,184,0.3)' : 'rgba(46,111,99,0.16)'}`,
        boxShadow: theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px rgba(127,200,184,0.16)' : 'inset 0 1px 0 rgba(255,255,255,0.78)',
    },
    scoreGlyphInner: {
        width: '10px',
        height: '10px',
        borderRadius: '4px',
        transform: 'rotate(45deg)',
        background: theme === 'dark' ? '#B5F0E4' : '#32796C',
        boxShadow: theme === 'dark' ? '0 0 16px rgba(127,200,184,0.44)' : 'none',
    },
    subStatsBar: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '10px',
        marginBottom: '14px',
        padding: '0 4px',
        boxSizing: 'border-box',
        fontSize: '16px',
        fontWeight: 900,
    },
    miniStat: {
        minHeight: '36px',
        padding: '0 12px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.06)'}`,
        boxShadow: theme === 'dark' ? '0 10px 24px rgba(0,0,0,0.16)' : '0 8px 18px rgba(24,36,44,0.08)',
    },
    streakStat: {
        minHeight: '34px',
        padding: '0 12px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.7)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.065)' : 'rgba(20,24,32,0.06)'}`,
        color: theme === 'dark' ? '#C9D6E8' : '#4C6472',
    },
    roundStat: {
        minHeight: '34px',
        padding: '0 12px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: theme === 'dark' ? 'rgba(127,200,184,0.09)' : 'rgba(127,200,184,0.16)',
        border: `1px solid ${theme === 'dark' ? 'rgba(127,200,184,0.18)' : 'rgba(46,111,99,0.1)'}`,
        color: theme === 'dark' ? '#9BE2D5' : '#32796C',
    },
    miniLabel: {
        fontSize: '10px',
        fontWeight: 850,
        opacity: 0.72,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    miniValue: {
        fontSize: '15px',
        fontWeight: 950,
        letterSpacing: '0',
    },
    timerWrapper: {
        width: '54px',
        height: '54px',
        marginBottom: '12px',
        padding: '5px',
        borderRadius: '20px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.06)'}`,
        boxSizing: 'border-box',
    },
    problemCard: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        minHeight: '220px',
        borderRadius: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark'
            ? 'linear-gradient(145deg, rgba(24,35,34,0.96), rgba(16,19,23,0.98))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(236,246,243,0.94))',
        boxShadow: theme === 'dark' ? '0 24px 52px rgba(0,0,0,0.32)' : '0 18px 40px rgba(24,36,44,0.12)',
        marginBottom: '18px',
        border: `1px solid ${theme === 'dark' ? 'rgba(127,200,184,0.14)' : 'rgba(46,111,99,0.12)'}`,
        padding: '20px',
        boxSizing: 'border-box',
    },
    feedbackProblemCard: (positive) => ({
        background: positive
            ? (theme === 'dark'
                ? 'radial-gradient(circle at 50% 12%, rgba(70,226,154,0.22), transparent 58%), linear-gradient(145deg, rgba(34,52,48,0.58), rgba(15,22,25,0.78))'
                : 'radial-gradient(circle at 50% 12%, rgba(34,197,94,0.20), transparent 58%), linear-gradient(145deg, rgba(255,255,255,0.76), rgba(226,247,238,0.70))')
            : (theme === 'dark'
                ? 'radial-gradient(circle at 50% 12%, rgba(239,95,95,0.20), transparent 58%), linear-gradient(145deg, rgba(54,32,36,0.58), rgba(18,18,22,0.78))'
                : 'radial-gradient(circle at 50% 12%, rgba(239,95,95,0.16), transparent 58%), linear-gradient(145deg, rgba(255,255,255,0.76), rgba(252,232,232,0.70))'),
        borderColor: positive ? 'rgba(70,226,154,0.34)' : 'rgba(239,95,95,0.34)',
        boxShadow: positive
            ? '0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 54px rgba(0,0,0,0.26), 0 0 40px rgba(70,226,154,0.16)'
            : '0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 54px rgba(0,0,0,0.26), 0 0 40px rgba(239,95,95,0.14)',
        backdropFilter: 'blur(22px) saturate(160%)',
        WebkitBackdropFilter: 'blur(22px) saturate(160%)'
    }),
    feedbackContent: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        padding: '14px 18px',
        textAlign: 'center'
    },
    feedbackScore: (positive) => ({
        fontSize: '30px',
        fontWeight: 950,
        color: positive ? '#46E29A' : '#FF8E8E',
        textShadow: positive ? '0 0 18px rgba(70,226,154,0.28)' : '0 0 18px rgba(255,142,142,0.25)'
    }),
    feedbackMessage: {
        fontSize: '14px',
        color: theme === 'dark' ? 'rgba(237,246,255,0.86)' : 'rgba(37,51,63,0.78)',
        lineHeight: 1.35,
        fontWeight: 750
    },
    inputDisplay: {
        minWidth: '96px',
        minHeight: '44px',
        padding: '0 22px',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.74)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.07)'}`,
        fontSize: '32px',
        fontWeight: 900,
        color: Colors.get('mainText', theme),
        marginBottom: '18px',
        fontFamily: 'monospace',
        textAlign: 'center',
    },
    wrongCard: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        marginTop: '20px',
        padding: '28px 24px',
        borderRadius: '28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxSizing: 'border-box',
        background: theme === 'dark'
            ? 'linear-gradient(145deg, rgba(48,24,28,0.86), rgba(18,20,24,0.98))'
            : 'linear-gradient(145deg, rgba(255,246,246,0.94), rgba(255,255,255,0.9))',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,90,98,0.26)' : 'rgba(190,65,70,0.18)'}`,
        boxShadow: theme === 'dark' ? '0 24px 58px rgba(0,0,0,0.32)' : '0 18px 40px rgba(24,36,44,0.12)',
    },
    feedbackAnswer: {
        minHeight: '42px',
        padding: '0 14px',
        borderRadius: '16px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        background: theme === 'dark' ? 'rgba(255,90,98,0.12)' : 'rgba(255,90,98,0.11)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,90,98,0.2)' : 'rgba(190,65,70,0.16)'}`,
    },
    feedbackLabel: {
        color: theme === 'dark' ? '#FF8F96' : '#C94149',
        fontSize: '11px',
        fontWeight: 850,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        opacity: 0.78,
    },
    feedbackValue: {
        color: Colors.get('mainText', theme),
        fontSize: '20px',
        fontWeight: 950,
    },
    feedbackTip: {
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 16px',
        borderRadius: '18px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.72)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,32,0.07)'}`,
    },
    feedbackTipIcon: {
        width: '26px',
        height: '26px',
        borderRadius: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: theme === 'dark' ? 'rgba(127,200,184,0.2)' : 'rgba(127,200,184,0.18)',
        color: theme === 'dark' ? '#B5F0E4' : '#32796C',
        fontSize: '13px',
        fontWeight: 950,
        fontStyle: 'italic',
    },
    feedbackTipText: {
        color: Colors.get('subText', theme),
        fontSize: '13px',
        lineHeight: 1.45,
        fontWeight: 750,
    },
    ackButtonWrap: {
        marginTop: '28px',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'calc(34px + env(safe-area-inset-bottom, 0px))',
    },
    ackButton: {
        minWidth: '230px',
        minHeight: '58px',
        padding: '0 24px',
        border: 'none',
        borderRadius: '22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        cursor: 'pointer',
        background: 'linear-gradient(135deg, #7FC8B8 0%, #66D9E8 100%)',
        color: '#0E1013',
        fontSize: '17px',
        fontWeight: 950,
        boxShadow: '0 18px 38px rgba(127,200,184,0.22)',
    },
    ackButtonIcon: {
        width: '30px',
        height: '30px',
        borderRadius: '12px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(14,16,19,0.14)',
        fontSize: '18px',
        lineHeight: 1,
    },
    // Item specific styles
    itemBox: {
        padding: '12px 18px',
        backgroundColor: Colors.get('bottomPanel', theme),
        borderRadius: '12px',
        fontWeight: 'bold',
        fontSize: '20px',
        color: Colors.get('mainText', theme),
        border: `2px solid ${Colors.get('border', theme)}`,
    },
    shapeBox: {
        width: '50px',
        height: '50px',
        border: `2px solid ${Colors.get('border', theme)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        fontSize: '16px',
        fontWeight: 'bold',
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
