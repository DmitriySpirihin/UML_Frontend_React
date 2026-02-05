import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision } from './MemoryProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaFire, FaMedal, FaStopwatch, FaPlay, FaRedo, FaHistory, FaEye } from 'react-icons/fa';
import { IoArrowBackCircle } from "react-icons/io5";
import MentalInput from './MentalInput';
import { memorySequenceLevels, saveSessionDuration } from './MentalHelper';

const startTimerDuration = 3000;

const MentalGamePanel = ({ show, type, difficulty, setShow }) => {
    // === CORE LOGIC STATES (UNCHANGED) ===
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // Game Flow
    const [charShowMs, setCharShowMs] = useState(600);
    const [retentionDelayMs, setRetentionDelayMs] = useState(2000);
    const [input, setInput] = useState('');
    const [handledInput, setHandledInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [showStartTimer, setShowStartTimer] = useState(false);
    const [phase, setPhase] = useState('memorize'); // 'memorize' → 'recall' → 'feedback'
    const [recallStartTime, setRecallStartTime] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [isPaused, setIsPaused] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const [finishAfterFeedback, setFinishAfterFeedback] = useState(false);
    const [pendingStage, setPendingStage] = useState(1);

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
    const [isReverse, setIsReverse] = useState(false);
    const [charIndex, setCharIndex] = useState(0); 

    // Feedback
    const [message, setMessage] = useState('');
    const [statusColor, setStatusColor] = useState('');
    const [addScores, setAddScores] = useState(0);

    // Statistics
    const [rightAnswers, setRightAnswers] = useState(0);
    const [record, setRecord] = useState(AppData.mentalRecords[type]?.[difficulty] || 0);
    const [time, setTime] = useState(0);

    // Countdown before start
    const [seconds, setSeconds] = useState(0);

    // === LOGIC EFFECTS ===
    
    // Input Handling
    useEffect(() => {
        if (!isStart || isFinished || phase !== 'recall') {
            setInput('');
            return;
        }
        if (input === 'CC') {
            setHandledInput((prev) => (prev.length > 0 ? prev.slice(0, -1) : ''));
        } else if (input === '>>>') {
            handleAnswer();
        } else if (input.length === 1) {
            setHandledInput((prev) => (prev.length < answer.length ? prev + input : prev));
        }
        setInput('');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [input, isStart, isFinished, phase, answer.length]);

    // Auto-submit if max length reached
    useEffect(() => {
        if (!isStart || isFinished || delayTimer || phase !== 'recall') return;
        if (handledInput.length === answer.length) {
            handleAnswer();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handledInput, answer.length, phase, isStart, isFinished, delayTimer]);

    // Global Session Timer
    useEffect(() => {
        let intervalId = null;
        if (isRunning) {
            intervalId = setInterval(() => setTime((prev) => prev + 100), 100);
        }
        return () => clearInterval(intervalId);
    }, [isRunning]);

    // Character Presentation Logic
    useEffect(() => {
        if (phase !== 'memorize' || !answer || answer.length === 0) return;

        const total = answer.length;
        const charShow = charShowMs;
        const retentionDelay = retentionDelayMs;

        if (charIndex < total) {
            const id = setTimeout(() => setCharIndex(c => c + 1), charShow);
            return () => clearTimeout(id);
        } else {
            const id = setTimeout(() => {
                setPhase('recall');
                setRecallStartTime(Date.now());
            }, retentionDelay);
            return () => clearTimeout(id);
        }
    }, [phase, answer, charIndex, charShowMs, retentionDelayMs]);

    // Subs
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
        const [prompt, forwardSeq, reverseFlag] = getProblem(type, difficulty, nextStage);
        // eslint-disable-next-line no-unused-vars
        const levelConfig = memorySequenceLevels[difficulty];
        
        setAnswer(forwardSeq || '');
        setIsReverse(reverseFlag);
        setCharIndex(0);
        setPhase('memorize');
        // If config is dynamic based on stage, get it here, otherwise use difficulty default
        setCharShowMs(memorySequenceLevels[difficulty].charShowMs); 
        setRetentionDelayMs(memorySequenceLevels[difficulty].retentionDelayMs);
        setHandledInput('');
        setMessage('');
        setPendingStage(nextStage + 1);
        setFinishAfterFeedback(false);
    };

    const handleAnswer = () => {
        if (phase !== 'recall') return;
        const expectedAnswer = isReverse ? answer.split('').reverse().join('') : answer;
        const answerTime = recallStartTime > 0 ? Date.now() - recallStartTime : 0;
        const points = getPoints(type, difficulty, stage, answerTime, expectedAnswer, handledInput, streakLength);
        const precision = getPrecision(type, expectedAnswer, handledInput);
        playVibro(precision === 0 ? 'light' : 'medium');

        let addmessage = '';
        if (precision === 0) {
            addmessage = getPraise(langIndex);
            setRightAnswers((prev) => prev + 1);
        } else if (precision < 0.15) {
            addmessage = getSupport(langIndex);
        } else {
            addmessage = (langIndex === 0 ? 'Правильный ответ: ' : 'Correct answer: ') + expectedAnswer;
        }

        const col = precision === 0
            ? Colors.get('maxValColor', theme)
            : precision < 0.15
            ? Colors.get('difficulty2', theme)
            : Colors.get('minValColor', theme);

        setStatusColor(col);
        setMessage(addmessage);
        setAddScores(points);
        setStreakLength((prev) => (hasStreak(type, expectedAnswer, handledInput) ? prev + 1 : 0));
        precision === 0 ? playRight() : playWrong();

        setFinishAfterFeedback(stage >= 20);
        setPhase('feedback');
        setDelayTimer(true);
    };

    const handleReload = () => {
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setHandledInput('');
        setMessage('');
        setNewProblem(1); // Reset to 1
        setStartTime(Date.now());
        setIsStart(true);
        setIsRunning(true);
        setIsPaused(false);
        setIsFinished(false);
    };

    const onFinishSession = (finalScore = scores) => {
        onFinish(finalScore);
        const isRecord = finalScore > record;
        const msg = congratulations(false, langIndex, finalScore, rightAnswers, 20, isRecord, false);
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
                                    <h2 style={styles(theme, fSize).title}>{memorySequenceLevels[difficulty].level[langIndex]}</h2>
                                    <div style={{ width: 40 }} />
                                </div>

                                <div style={styles(theme).card}>
                                    <div style={{...styles(theme).title, textAlign:'center', fontSize: '16px', marginBottom: 10}}>
                                        {memorySequenceLevels[difficulty].title[langIndex]}
                                    </div>
                                    <p style={styles(theme).description}>{memorySequenceLevels[difficulty].description[langIndex]}</p>
                                    
                                    <div style={styles(theme).statsGrid}>
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Длина' : 'Length'} 
                                            value={`${memorySequenceLevels[difficulty].elementsRange[0]}–${memorySequenceLevels[difficulty].elementsRange[1]}`} 
                                        />
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Тип' : 'Mode'} 
                                            value={memorySequenceLevels[difficulty].reverse ? (langIndex === 0 ? 'Обратный' : 'Reverse') : (langIndex === 0 ? 'Прямой' : 'Direct')} 
                                            highlight={memorySequenceLevels[difficulty].reverse}
                                        />
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Показ' : 'Flash Time'} 
                                            value={`${memorySequenceLevels[difficulty].charShowMs}ms`} 
                                        />
                                        <StatItem theme={theme} 
                                            label={langIndex === 0 ? 'Задержка' : 'Recall Delay'} 
                                            value={`${memorySequenceLevels[difficulty].retentionDelayMs}ms`} 
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

                                {/* Main Interaction Area */}
                                <div style={{flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                    
                                    {/* Problem Card */}
                                    <motion.div 
                                        style={{
                                            ...styles(theme).problemCard,
                                            backgroundColor: delayTimer ? (statusColor || Colors.get('simplePanel', theme)) : Colors.get('simplePanel', theme),
                                            borderColor: delayTimer ? statusColor : 'transparent'
                                        }}
                                        animate={delayTimer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                    >
                                        {delayTimer ? (
                                            /* Feedback State */
                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff' }}>
                                                    {addScores > 0 ? `+${addScores}` : (langIndex === 0 ? 'Ошибка' : 'Wrong')}
                                                </div>
                                                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', marginTop: 5 }}>{message}</div>
                                            </div>
                                        ) : (
                                            /* Game State */
                                            <div style={{ fontSize: '48px', fontWeight: 'bold', color: Colors.get('mainText', theme), textAlign: 'center' }}>
                                                {phase === 'memorize' && (
                                                    charIndex < answer.length ? answer[charIndex] : '⏳'
                                                )}
                                                {phase === 'recall' && (
                                                    <span style={{fontSize: '24px', color: Colors.get('subText', theme)}}>
                                                        {isReverse 
                                                            ? (langIndex === 0 ? 'Вводи задом наперед' : 'Type Reverse')
                                                            : (langIndex === 0 ? 'Повтори' : 'Repeat')}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>

                                    {/* Input Display */}
                                    <div style={styles(theme).inputDisplay}>
                                        {handledInput || <span style={{ opacity: 0.1 }}>_</span>}
                                    </div>

                                    {/* Keypad Space */}
                                    <div style={{ flex: 1, width: '100%' }}>
                                        {phase === 'recall' && (
                                            <MentalInput setInput={setInput} type={type} />
                                        )}
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

export default MentalGamePanel;

// === HELPER COMPONENTS ===

const StatItem = ({ theme, label, value, highlight }) => (
    <div style={{ 
        backgroundColor: Colors.get('background', theme), 
        padding: '10px', 
        borderRadius: '12px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        border: highlight ? `1px solid ${Colors.get('maxValColor', theme)}` : 'none'
    }}>
        <span style={{ fontSize: '12px', color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ fontSize: '16px', fontWeight: 'bold', color: highlight ? Colors.get('maxValColor', theme) : Colors.get('mainText', theme) }}>{value}</span>
    </div>
);

const ResultRow = ({ theme, label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '5px 0', borderBottom: `1px solid ${Colors.get('border', theme)}30` }}>
        <span style={{ color: Colors.get('subText', theme) }}>{label}</span>
        <span style={{ color: Colors.get('mainText', theme), fontWeight: 'bold' }}>{value}</span>
    </div>
);

// === STYLES & UTILS ===

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
         marginTop:'75px',
        display: 'flex',
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
    problemCard: {
        width: '90%',
        height: '160px',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        marginBottom: '20px',
        marginTop: '20px', // Adjusted for memory game balance
        border: '2px solid transparent',
        padding: '10px'
    },
    inputDisplay: {
        fontSize: '38px', // Slightly smaller for potentially long sequences
        fontWeight: 'bold',
        color: Colors.get('mainText', theme),
        height: '50px',
        marginBottom: '20px',
        fontFamily: 'monospace',
        letterSpacing: '4px',
        textAlign: 'center'
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

const disclaimer = (langIndex) => {
  // 0 = ru, 1 = en
  if (langIndex === 0) {
    return "Отвечайте правильно и быстро, чтобы получить максимум очков. Каждая ошибка сбрасывает множитель подряд идущих ответов. За каждые 5 правильных ответов подряд множитель растёт (макс. ×1.5). На сложных уровнях последовательность нужно воспроизводить в обратном порядке — тренируйте рабочую память!";
  } else {
    return "Answer correctly and quickly to maximize your score. Every mistake resets your streak multiplier. For every 5 correct answers in a row, the multiplier increases (up to ×1.5). On harder levels, repeat the sequence in reverse — train your working memory under pressure!";
  }
};
const congratulations = (isEndlessMode, langIndex, score, rightAnswers, totalAnswers, isRecord, isRelaxMode = false) => {
  const percentage = totalAnswers > 0 ? Math.round((rightAnswers / totalAnswers) * 100) : 0;

  const isHigh = percentage >= 80;
  const isModerate = percentage >= 50 && !isHigh;
  const isLow = percentage < 50;

  const messages = {
    ru: {
      // === STANDARD MODE ===
      high: [
        `🎉 Отличная работа! ${rightAnswers}/${totalAnswers} (${percentage}%) — молодец!`,
        `✨ Потрясающе! Ты справился на ${percentage}%.`,
        `🔥 Ты набрал(а) ${score} очков — это впечатляет!`,
        `🚀 Вау! ${rightAnswers}/${totalAnswers} — ты в ударе!`,
        `💯 Идеально! Так держать! (${percentage}%)`
      ],
      moderate: [
        `🙂 Хорошая попытка! ${rightAnswers}/${totalAnswers} (${percentage}%).`,
        `🌱 Ты на правильном пути! Продолжай в том же духе.`,
        `📈 Набрано ${score} очков. Уже лучше!`,
        `👍 Половина и больше — это прогресс! (${percentage}%)`,
        `💪 Неплохо! С каждым разом будет лучше.`
      ],
      low: [
        `🤗 Ты старался(лась) — это главное. Попробуй ещё!`,
        `🌱 Не сдавайся! Каждая попытка — шаг вперёд.`,
        `🌤️ Сегодня не твой день, но завтра будет лучше!`,
        `🎯 Ты набрал(а) ${score} очков. Продолжай тренироваться!`,
        `🌱 Даже ${rightAnswers} правильных ответов — это начало!`
      ],
      record: [
        `🏆🔥 НОВЫЙ РЕКОРД! ${score} очков — поздравляем!`,
        `🎉✨ Ты установил(а) личный рекорд: ${rightAnswers}/${totalAnswers} (${percentage}%)!`,
        `🌟💥 Даже если было трудно — ты побил(а) рекорд! Молодец!`
      ],

      // === ENDLESS MODE ===
      endless_any: [
        `🛡️ Ты выстоял(а) ${rightAnswers} раундов — уважение!`,
        `⚡ Выжил(а) ${rightAnswers} ходов подряд — круто!`,
        `🎯 Без единой ошибки до ${rightAnswers} — это стойкость!`,
        `🧠 Точность на ${rightAnswers} шагах — впечатляет!`,
        `🔥 Ты набрал(а) ${score} очков в режиме выживания!`
      ],
      endless_record: [
        `🏆🔥 НОВЫЙ РЕКОРД В РЕЖИМЕ ВЫЖИВАНИЯ: ${rightAnswers} раундов!`,
        `🎉✨ Ты установил(а) личный рекорд: ${rightAnswers} без единой ошибки!`,
        `🌟💥 В Endless-режиме — а ты всё равно побил(а) рекорд! Молодец!`,
        `🛡️👑 Новый максимум: ${score} очков в режиме "одна ошибка — конец"!`
      ],

      // === RELAX MODE ===
      relax_any: [
        `🧘‍♀️ Отлично поработал(а) в спокойном режиме!`,
        `🌼 Ты решил(а) ${totalAnswers} задач — прекрасная тренировка!`,
        `✨ Спокойствие и внимание — залог прогресса. Молодец!`,
        `🌱 ${rightAnswers} правильных ответов — рост налицо!`,
        `🌤️ Хороший темп, без спешки. Так держать!`
      ],
      relax_record: [
        `🌟 Новый личный максимум — даже в спокойном режиме!`,
        `🧘‍♂️🏆 Ты набрал(а) ${score} очков в Relax-режиме — поздравляем!`,
        `💫 Даже без таймера — ты улучшил(а) свой результат. Респект!`
      ]
    },
    en: {
      // === STANDARD MODE ===
      high: [
        `🎉 Awesome! ${rightAnswers}/${totalAnswers} (${percentage}%) — well done!`,
        `✨ Outstanding! You scored ${percentage}%.`,
        `🔥 You got ${score} points — impressive!`,
        `🚀 Wow! ${rightAnswers}/${totalAnswers} — you’re on fire!`,
        `💯 Perfect! Keep it up! (${percentage}%)`
      ],
      moderate: [
        `🙂 Good effort! ${rightAnswers}/${totalAnswers} (${percentage}%).`,
        `🌱 You're making progress! Keep going.`,
        `📈 You scored ${score} points. Getting better!`,
        `👍 More than half right — that’s growth! (${percentage}%)`,
        `💪 Nice try! You’ll do even better next time.`
      ],
      low: [
        `🤗 You gave it your best — that matters most. Try again!`,
        `🌱 Don’t give up! Every attempt brings you closer.`,
        `🌤️ Not your best round, but tomorrow’s a new chance!`,
        `🎯 You earned ${score} points. Keep practicing!`,
        `🌱 Even ${rightAnswers} correct answers is a start!`
      ],
      record: [
        `🏆🔥 NEW RECORD! ${score} points — congratulations!`,
        `🎉✨ You set a personal best: ${rightAnswers}/${totalAnswers} (${percentage}%)!`,
        `🌟💥 Even on a tough day — you broke your record! Amazing!`
      ],

      // === ENDLESS MODE ===
      endless_any: [
        `🛡️ You survived ${rightAnswers} rounds — respect!`,
        `⚡ Lasted ${rightAnswers} turns without a single mistake — awesome!`,
        `🎯 Perfect accuracy for ${rightAnswers} problems — impressive!`,
        `🧠 Sharp focus through ${rightAnswers} challenges — well done!`,
        `🔥 You scored ${score} points in Endless Mode!`
      ],
      endless_record: [
        `🏆🔥 NEW ENDLESS MODE RECORD: ${rightAnswers} rounds!`,
        `🎉✨ Personal best: ${rightAnswers} flawless answers in a row!`,
        `🌟💥 You broke your record — in Endless Mode! Amazing!`,
        `🛡️👑 New high: ${score} points in "one mistake = game over" mode!`
      ],

      // === RELAX MODE ===
      relax_any: [
        `🧘‍♀️ Great job practicing in Relax Mode!`,
        `🌼 You solved ${totalAnswers} problems — wonderful focus!`,
        `✨ Calm and steady wins the race. Well done!`,
        `🌱 ${rightAnswers} correct answers — you're growing!`,
        `🌤️ A peaceful pace, great accuracy. Keep it up!`
      ],
      relax_record: [
        `🌟 New personal best — even in Relax Mode!`,
        `🧘‍♂️🏆 You scored ${score} points in Relax Mode — congrats!`,
        `💫 No timer, no stress — and still a new record! Amazing!`
      ]
    }
  };

  const lang = langIndex === 0 ? messages.ru : messages.en;

  let candidates = [];

  if (isRelaxMode) {
    // In Relax Mode, even low accuracy is fine — always encouraging
    if (isRecord) {
      candidates = [...lang.relax_record];
    } else {
      candidates = [...lang.relax_any];
    }
  } else if (isEndlessMode) {
    // Endless: totalAnswers === rightAnswers (no mistakes allowed)
    if (isRecord) {
      candidates = [...lang.endless_record];
    } else {
      candidates = [...lang.endless_any];
    }
  } else {
    // Standard mode (timed or regular)
    if (isRecord) {
      candidates = [...lang.record];
    } else if (isHigh) {
      candidates = [...lang.high];
    } else if (isModerate) {
      candidates = [...lang.moderate];
    } else {
      candidates = [...lang.low];
    }
  }

  if (candidates.length === 0) {
    return langIndex === 0 ? 'Хорошо! 😊' : 'Good job! 😊';
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
};
function playVibro(type){
  if(AppData.prefs[3] == 0 && Telegram.WebApp.HapticFeedback)Telegram.WebApp.HapticFeedback.impactOccurred(type);
}
function interpolateColor(color1, color2, factor) {
  if (!color1 || !color2) return color1 || color2 || '#000000';
  // Ensure factor is clamped between 0 and 1
  factor = Math.max(0, Math.min(1, factor));

  // Remove '#' if present
  color1 = color1.replace('#', '');
  color2 = color2.replace('#', '');

  // Parse RGB components
  const r1 = parseInt(color1.slice(0, 2), 16);
  const g1 = parseInt(color1.slice(2, 4), 16);
  const b1 = parseInt(color1.slice(4, 6), 16);

  const r2 = parseInt(color2.slice(0, 2), 16);
  const g2 = parseInt(color2.slice(2, 4), 16);
  const b2 = parseInt(color2.slice(4, 6), 16);

  // Interpolate each component
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);

  // Convert back to hex and ensure two digits
  return `rgb(${r}, ${g}, ${b})`;
}
function getPraise(langIndex) {
  const en = [
    "Great!",
    "Perfect!",
    "Yes!",
    "Exactly!",
    "Awesome!",
    "Brilliant!",
    "Spot on!",
    "Well done!",
    "Nailed it!",
    "Correct!"
  ];

  const ru = [
    "Отлично!",
    "Прекрасно!",
    "Верно!",
    "Точно!",
    "Замечательно!",
    "Идеально!",
    "Правильно!",
    "Молодец!",
    "Точно в цель!",
    "Без ошибок!"
  ];

  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
}
function getSupport(langIndex) {
  const en = [
    "Close!",
    "Almost!",
    "Nearly!",
    "Keep going!",
    "Try again!",
    "So close!",
    "Good attempt!",
    "Not quite!",
    "One more try!",
    "You're getting there!"
  ];

  const ru = [
    "Рядом!",
    "Почти!",
    "Еще чуть-чуть!",
    "Продолжай!",
    "Попробуй еще!",
    "Очень близко!",
    "Хорошая попытка!",
    "Не совсем…",
    "Почти получилось!",
    "Ты на правильном пути!"
  ];

  const list = langIndex === 0 ? ru : en;
  return list[Math.floor(Math.random() * list.length)];
}
function getParsedTime(time) {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getTimeInfo(langIndex, startTime) {
  const formattedTime = getParsedTime(startTime);
  return langIndex === 0
    ? `Ваше время: ${formattedTime}`
    : `Your time is: ${formattedTime}`;
}