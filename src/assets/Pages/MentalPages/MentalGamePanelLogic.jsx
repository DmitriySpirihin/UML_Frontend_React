import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision, getLogicExplanation } from './LogicProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaFire, FaMedal, FaStopwatch, FaPlay, FaRedo } from 'react-icons/fa';
import { IoArrowBackCircle } from "react-icons/io5";
import MentalInput from './MentalInput';
import { logicOddOneOutLevels, saveSessionDuration } from './MentalHelper';

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
    const [startTime, setStartTime] = useState(0);
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
    const [statusColor, setStatusColor] = useState('');
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
        setStartTime(Date.now());
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
            setStatusColor(Colors.get('maxValColor', theme));
            setMessage(getPraise(langIndex));
            setAddScores(points);
            setFinishAfterFeedback(stage >= 20);
            setDelayTimer(true);
        } else {
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
        setStartTime(Date.now());
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
        const endTime = Date.now();
        const duration = Math.round((endTime - startTime) / 1000);
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
                                    <IoArrowBackCircle onClick={() => { setShow(false); setIsFinished(false); }} style={styles(theme).iconButton} />
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
                                    <div style={styles(theme).gameStat}><FaStopwatch style={{ marginRight: 6 }} /> {getParsedTime(time)}</div>
                                    <div style={{...styles(theme).gameStat, color: Colors.get('maxValColor', theme)}}><FaStar style={{ marginRight: 6 }} /> {scores}</div>
                                </div>
                                <div style={styles(theme).subStatsBar}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: Colors.get('minValColor', theme) }}><FaFire /> {streakLength}</div>
                                    <div style={{ color: Colors.get('difficulty', theme), fontWeight: 'bold' }}>{`${stage} / 20`}</div>
                                </div>
                                <div style={{ width: '90%', backgroundColor: isDark ? 'rgba(220,50,50,0.12)' : 'rgba(220,50,50,0.07)', border: '2px solid rgba(220,50,50,0.35)', borderRadius: '24px', padding: '24px', marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
                                    <div style={{ fontSize: '17px', color: Colors.get('minValColor', theme), fontWeight: 'bold' }}>
                                        {langIndex === 0 ? `Лишний №${wrongData.correctAnswer}` : `Odd one: #${wrongData.correctAnswer}`}
                                    </div>
                                    {wrongData.explanation ? (
                                        <div style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', borderRadius: '14px', padding: '12px 14px', display: 'flex', gap: '8px', alignItems: 'flex-start', width: '100%', boxSizing: 'border-box' }}>
                                            <span style={{ fontSize: '16px', flexShrink: 0 }}>💡</span>
                                            <span style={{ fontSize: '13px', color: Colors.get('subText', theme), lineHeight: '1.5' }}>{wrongData.explanation}</span>
                                        </div>
                                    ) : null}
                                </div>
                                <div style={{ marginTop: 'auto', paddingBottom: '50px', paddingTop: '24px' }}>
                                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleAcknowledgeWrong}
                                        style={{ backgroundColor: Colors.get('barsColorMeasures', theme), color: '#fff', border: 'none', borderRadius: '16px', padding: '16px 40px', fontSize: '17px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        {langIndex === 0 ? 'Понял → Дальше' : 'Got it → Next'}
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}

                        {/* 3. GAME SCREEN */}
                        {!isFinished && isStart && !wrongData && (
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
                                            backgroundColor: delayTimer ? (statusColor || Colors.get('simplePanel', theme)) : Colors.get('simplePanel', theme),
                                            borderColor: delayTimer ? statusColor : 'transparent'
                                        }}
                                        animate={delayTimer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                    >
                                        {delayTimer ? (
                                            /* Feedback */
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                                                    {addScores > 0 ? `+${addScores}` : (langIndex === 0 ? 'Ошибка' : 'Wrong')}
                                                </div>
                                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginTop: 5 }}>{message}</div>
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
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} style={{width: '54px', height: '154px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',marginTop: '25px'}}>
                                            <img style={{ width: '14vh' }} src={'images/Congrat.png'} alt="logo" />
                                        </motion.div>
                                <div style={styles(theme).controlsRow}>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() =>{handleReload();setScores(0)}} style={styles(theme).secondaryButton}>
                                        <FaRedo size={20} />
                                    </motion.button>
                                    <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setShow(false); setIsFinished(false);setScores(0);setRightAnswers(0); }} style={styles(theme).primaryButton}>
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
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            borderRadius: '14px',
            padding: '12px 14px',
            marginTop: '10px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
        }}>
            {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: i < items.length - 1 ? '8px' : 0 }}>
                    <span style={{ fontSize: '15px', flexShrink: 0, lineHeight: '1.4' }}>{item.icon}</span>
                    <span style={{ fontSize: '13px', color: Colors.get('subText', theme), lineHeight: '1.4' }}>{item.text}</span>
                </div>
            ))}
        </div>
    );
};

export default MentalGamePanel;

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
        margin: 0,
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
        color: Colors.get('skipped', theme),
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
         marginTop:'75px',
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
        marginBottom: '15px'
    },
    timerWrapper: {
        width: '48px', 
        height: '48px', 
        marginBottom: '10px'
    },
    problemCard: {
        width: '90%',
        minHeight: '200px', // More vertical space for shapes
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        border: '2px solid transparent',
        padding: '20px',
        boxSizing: 'border-box'
    },
    inputDisplay: {
        fontSize: '38px',
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
        height: '50px',
        marginBottom: '10px',
        fontFamily: 'monospace',
        textAlign: 'center'
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

