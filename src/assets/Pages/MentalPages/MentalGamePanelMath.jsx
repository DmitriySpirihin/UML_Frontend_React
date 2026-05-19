import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus';
import { getProblem, getPoints, hasStreak, getPrecision, getExplanation } from './MathProblems';
import BreathAudio from "../../Helpers/BreathAudio";
import { FaStar, FaMedal, FaStopwatch, FaTimes, FaPlay, FaRedo } from 'react-icons/fa';
import { IoArrowBackCircle } from "react-icons/io5";
import MentalInput from './MentalInput';
import { quickMathCategories, saveSessionDuration } from './MentalHelper';
import { MentalResultScreen, StreakBadge } from './MentalHudParts';

const startTimerDuration = 3000;

const MentalGamePanelMath = ({ show, type, difficulty, maxTimer, setShow }) => {
    // === CORE LOGIC STATES (UNCHANGED) ===
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [input, setInput] = useState('');
    const [handledInput, setHandledInput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isStart, setIsStart] = useState(false);
    const [showStartTimer, setShowStartTimer] = useState(false);
    const [addValue, setAddValue] = useState(0);

    const [seconds, setSeconds] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isPaused, setIsPaused] = useState(false); // Kept logic, even if UI doesn't explicitly use pause btn

    // audio
    const { initAudio, playRight, playWrong } = BreathAudio(AppData.prefs[2] === 0);

    // timer
    const [timer, setTimer] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currTimer, setCurrTimer] = useState(0);
    
    // delay
    const [delay, setDelay] = useState(0);
    const [delayTimer, setDelayTimer] = useState(false);

    const [scores, setScores] = useState(0);
    const [stage, setStage] = useState(1);
    const [streakLength, setStreakLength] = useState(0);
    const [problem, setProblem] = useState('');
    const [answer, setAnswer] = useState('');
    
    // answer handlers
    const [message, setMessage] = useState('');
    const [addScores, setAddScores] = useState(0);
    const [wrongData, setWrongData] = useState(null);
    
    // statistics
    const [rightAnswers, setRightAnswers] = useState(0);
    const [record, setRecord] = useState(AppData.mentalRecords[type][difficulty]);
    const [time, setTime] = useState(0);

    // === LOGIC EFFECTS (UNCHANGED) ===
    useEffect(() => {
        if (input.length === 1) setHandledInput(prev => prev.length < 6 ? prev + input : prev);
        else if (input.length === 2) setHandledInput(prev => prev.length > 0 ? prev.slice(0, prev.length - 1) : '');
        else if (input.length === 3) handleAnswer();
        setInput('');
    }, [input]);

    useEffect(() => {
        let intervalId = null;
        if (isRunning) {
            intervalId = setInterval(() => {
                setTime(prev => prev + 100);
            }, 100);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isRunning]);

    useEffect(() => {
        if (!timer || !isStart || difficulty === 5) {
            setProgress(0);
            setCurrTimer(0);
            return;
        }
        const startTime = Date.now() - currTimer;
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newTimerValue = Math.min(elapsed, maxTimer);
            setCurrTimer(newTimerValue);
            setProgress((newTimerValue / (maxTimer - addValue)) * 100);
            if (newTimerValue >= (maxTimer - addValue) - 500) {
                setTimer(false);
                handleAnswer();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [timer, isStart, maxTimer, currTimer]);

    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
        const subscription2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const subscription3 = fontSize$.subscribe(setFSize);
        return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
        }
    }, []);

    useEffect(() => {
        if (!showStartTimer) {
            setSeconds(0);
            return;
        }
        const totalSeconds = Math.ceil(startTimerDuration / 1000);
        setSeconds(totalSeconds);
        const intervalId = setInterval(() => {
            setSeconds(prev => {
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

    useEffect(() => {
        if (!delayTimer) return;
        const intervalId = setInterval(() => {
            setDelay(prev => {
                if (prev >= 900) {
                    clearInterval(intervalId);
                    setDelayTimer(false);
                    setScores(prev => Math.round(prev + addScores / 2));
                    setAddScores(0);
                    setTimer(true);
                    setDelay(0);
                    return 0;
                }
                return prev + 100;
            });
        }, 100);
        return () => clearInterval(intervalId);
    }, [delayTimer, delay]);

    // === HANDLERS ===
    const handleStart = () => {
        initAudio();
        setNewProblem();
        setIsStart(true);
        setTimer(true);
        setIsRunning(true);
        setIsPaused(false);
        setTime(0);
    };

    function setNewProblem() {
        const newProblem = getProblem(type, difficulty, stage);
        setProblem(newProblem[0]);
        setAnswer(newProblem[1]);
    }

    const handleAnswer = () => {
        setTimer(false);
        const points = getPoints(type, difficulty, stage, currTimer, answer, handledInput, streakLength);
        const precision = getPrecision(type, answer, handledInput);
        playVibro(precision === 0 ? 'light' : 'medium');
        precision === 0 ? playRight() : playWrong();
        setStreakLength(prev => hasStreak(type, answer, handledInput) ? prev + 1 : 0);

        if (precision === 0) {
            setRightAnswers(prev => prev + 1);
            setMessage(getPraise(langIndex));
            setAddScores(points);
            setHandledInput('');
            setNewProblem();
            setStage(prev => prev + 1 < 20 ? prev + 1 : 20);
            if (stage === 20) { onFinishSession(); return; }
            if (difficulty === 4 && stage % 5 === 0) setAddValue(prev => prev + 1000);
            setDelayTimer(true);
        } else {
            if (difficulty === 4) { onFinishSession(); return; }
            setIsRunning(false);
            setStage(prev => prev + 1 < 20 ? prev + 1 : 20);
            setWrongData({
                problem,
                correctAnswer: answer,
                explanation: getExplanation(problem, langIndex),
                isLast: stage === 20,
            });
            setHandledInput('');
        }
    };

    const handleAcknowledgeWrong = () => {
        const wasLast = wrongData?.isLast;
        setWrongData(null);
        if (wasLast) {
            onFinishSession();
        } else {
            setNewProblem();
            setIsRunning(true);
            setTimer(true);
        }
    };

    const handleReload = () => {
        setTimer(false);
        setCurrTimer(0);
        setProgress(0);
        setScores(0);
        setStage(1);
        setRightAnswers(0);
        setStreakLength(0);
        setHandledInput('');
        setMessage('');
        setAddValue(0);
        setNewProblem();
        setNewProblem();
        setIsStart(true);
        setTimer(true);
        setIsRunning(true);
        setIsPaused(false);
        setIsFinished(false);
    };

    const onFinishSession = () => {
        onFinish();
        const isRecord = scores + addScores > record;
        const message = congratulations(difficulty === 4, langIndex, scores + addScores, rightAnswers, 20, isRecord, difficulty === 5);
        setIsRunning(false);
        setMessage(message);
        setIsFinished(true);
        setIsStart(false);
        setTimer(false);
    };

    const onFinish = () => {
        if (scores > record) {
            setRecord(scores);
            AppData.mentalRecords[type][difficulty] = scores;
        }
        const duration = Math.round(time / 1000);
        saveSessionDuration(duration, scores + addScores > record, type, difficulty, scores + addScores ,rightAnswers);
        setAddValue(0);
        setStage(1);
    };

    // === VIEW HELPERS ===
    const isDark = theme === 'dark';
    
    // Animation Variants
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
                                    <h2 style={styles(theme, fSize).title}>{quickMathCategories[difficulty].level[langIndex]}</h2>
                                    <div style={{ width: 40 }} /> {/* Spacer for centering */}
                                </div>

                                <div style={styles(theme).card}>
                                    <p style={styles(theme).description}>{quickMathCategories[difficulty].description[langIndex]}</p>
                                    
                                    <div style={styles(theme).statsGrid}>
                                        <StatItem theme={theme} label={langIndex === 0 ? 'Сложность' : 'Difficulty'} value={quickMathCategories[difficulty].difficulty[langIndex]} />
                                        <StatItem theme={theme} label={langIndex === 0 ? 'Время' : 'Time limit'} value={`${quickMathCategories[difficulty].timeLimitSec}s`} />
                                        <StatItem theme={theme} label={langIndex === 0 ? 'Операции' : 'Operations'} value={quickMathCategories[difficulty].operations} fullWidth />
                                    </div>

                                    <MathInstructionsBlock theme={theme} langIndex={langIndex} />
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
                                    <div style={styles(theme).roundStat}>
                                        <span style={styles(theme).miniLabel}>{difficulty > 3 ? (langIndex === 0 ? 'Этап' : 'Stage') : (langIndex === 0 ? 'Раунд' : 'Round')}</span>
                                        <span style={styles(theme).miniValue}>{difficulty > 3 ? stage : `${stage}/20`}</span>
                                    </div>
                                </div>
                                <div style={styles(theme).wrongCard}>
                                    <div style={{ fontSize: '38px', fontWeight: 'bold', color: Colors.get('mainText', theme), textAlign: 'center' }}>
                                        {wrongData.problem}
                                    </div>
                                    <div style={styles(theme).feedbackAnswer}>
                                        <span style={styles(theme).feedbackLabel}>{langIndex === 0 ? 'Правильный ответ' : 'Correct answer'}</span>
                                        <span style={styles(theme).feedbackValue}>{wrongData.correctAnswer}</span>
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
                                    <IoArrowBackCircle onClick={() => onFinishSession()} style={styles(theme).iconButtonSmall} />
                                    
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
                                        <span style={styles(theme).miniLabel}>{difficulty > 3 ? (langIndex === 0 ? 'Этап' : 'Stage') : (langIndex === 0 ? 'Раунд' : 'Round')}</span>
                                        <span style={styles(theme).miniValue}>{difficulty > 3 ? stage : `${stage}/20`}</span>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div style={styles(theme).progressBarContainer}>
                                    <motion.div 
                                        style={{ 
                                            height: '100%', 
                                            backgroundColor: interpolateColor(Colors.get('done', theme), Colors.get('skipped', theme), (progress / 100)),
                                            borderRadius: '10px'
                                        }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ type: "tween", ease: "linear", duration: 0.1 }} // Smooth but responsive
                                    />
                                    <div style={styles(theme).timerText}>{Math.floor(((maxTimer - addValue) - currTimer) / 1000)}s</div>
                                </div>

                                {/* Problem Card */}
                                <motion.div
                                    style={{
                                        ...styles(theme).problemCard,
                                        ...(delayTimer ? styles(theme).feedbackProblemCard(addScores > 0) : {})
                                    }}
                                    animate={delayTimer ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                                >
                                    {delayTimer ? (
                                        <div style={styles(theme).feedbackContent}>
                                            <div style={styles(theme).feedbackScore(addScores > 0)}>
                                                {addScores > 0 ? `+${addScores}` : (langIndex === 0 ? 'Ошибка' : 'Wrong')}
                                            </div>
                                            <div style={styles(theme).feedbackMessage}>{message}</div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '42px', fontWeight: 'bold', color: Colors.get('mainText', theme) }}>
                                            {problem}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Input Display */}
                                <div style={styles(theme).inputDisplay}>
                                    {handledInput || <span style={{ opacity: 0.3 }}>_</span>}
                                </div>

                                {/* Keypad Space */}
                                <div style={{ flex: 1, width: '100%' }}>
                                    <MentalInput setInput={setInput} type={type} />
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
                                correctValue={difficulty < 4 ? `${rightAnswers}/20` : rightAnswers}
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

const MathInstructionsBlock = ({ theme, langIndex }) => {
    const isDark = theme === 'dark';
    const items = langIndex === 0 ? [
        { icon: '📐', text: 'Порядок операций: скобки → степени → ×÷ → +−' },
        { icon: '⚡', text: 'Отвечай быстрее — скорость даёт бонус к очкам' },
        { icon: '🔥', text: '5 правильных подряд — множитель растёт (макс. ×1.5)' },
        { icon: '✖️', text: 'Ошибка — показываем правильный ответ и объяснение' },
    ] : [
        { icon: '📐', text: 'Order of ops: brackets → powers → ×÷ → +−' },
        { icon: '⚡', text: 'Answer faster — speed gives a score bonus' },
        { icon: '🔥', text: '5 correct in a row — multiplier grows (max ×1.5)' },
        { icon: '✖️', text: 'On a mistake we show the answer and a tip' },
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

export default MentalGamePanelMath;

const StatItem = ({ theme, label, value, fullWidth }) => (
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
        gridColumn: fullWidth ? 'span 2' : 'auto'
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

// === STYLES ===

const styles = (theme, fSize = 14) => ({
    container: {
        background: theme === 'dark'
            ? 'radial-gradient(circle at 50% -10%, rgba(102,217,232,0.13), transparent 32%), radial-gradient(circle at 96% 12%, rgba(138,124,214,0.12), transparent 30%), #0E1013'
            : 'radial-gradient(circle at 50% -10%, rgba(102,217,232,0.18), transparent 32%), radial-gradient(circle at 96% 12%, rgba(138,124,214,0.16), transparent 30%), #F4F5F7',
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
            ? 'linear-gradient(145deg, rgba(25,33,37,0.94), rgba(16,19,23,0.98))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(235,242,245,0.94))',
        backdropFilter: 'blur(18px)',
        borderRadius: '24px',
        padding: '18px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        border: `1px solid ${theme === 'dark' ? 'rgba(102,217,232,0.14)' : 'rgba(37,87,96,0.14)'}`,
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
        opacity: 0.7
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
        background: 'linear-gradient(135deg, #66D9E8 0%, #8A7CD6 100%)',
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
        boxShadow: '0 18px 34px rgba(102,217,232,0.18)'
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
            ? 'linear-gradient(145deg, rgba(102,217,232,0.18), rgba(138,124,214,0.14))'
            : 'linear-gradient(145deg, rgba(102,217,232,0.22), rgba(138,124,214,0.14))',
        border: `1px solid ${theme === 'dark' ? 'rgba(102,217,232,0.28)' : 'rgba(37,87,96,0.16)'}`,
        boxShadow: theme === 'dark' ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 18px rgba(102,217,232,0.16)' : 'inset 0 1px 0 rgba(255,255,255,0.78)',
    },
    scoreGlyphInner: {
        width: '10px',
        height: '10px',
        borderRadius: '4px',
        transform: 'rotate(45deg)',
        background: theme === 'dark' ? '#BDEFF5' : '#226877',
        boxShadow: theme === 'dark' ? '0 0 16px rgba(102,217,232,0.42)' : 'none',
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
        background: theme === 'dark' ? 'rgba(102,217,232,0.08)' : 'rgba(102,217,232,0.16)',
        border: `1px solid ${theme === 'dark' ? 'rgba(102,217,232,0.16)' : 'rgba(37,87,96,0.1)'}`,
        color: theme === 'dark' ? '#8FE6F1' : '#226877',
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
    progressBarContainer: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        height: '12px',
        marginTop: '16px',
        background: theme === 'dark' ? 'rgba(255,255,255,0.045)' : 'rgba(20,24,32,0.07)',
        borderRadius: '999px',
        position: 'relative',
        marginBottom: '22px',
        overflow: 'visible',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
    },
    timerText: {
        position: 'absolute',
        right: 0,
        top: '-25px',
        fontSize: '14px',
        color: Colors.get('subText', theme)
    },
    problemCard: {
        width: 'calc(100% - 40px)',
        maxWidth: '680px',
        minHeight: '150px',
        borderRadius: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme === 'dark'
            ? 'linear-gradient(145deg, rgba(28,34,39,0.96), rgba(16,19,23,0.98))'
            : 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(235,242,245,0.94))',
        boxShadow: theme === 'dark' ? '0 24px 52px rgba(0,0,0,0.32)' : '0 18px 40px rgba(24,36,44,0.12)',
        marginBottom: '18px',
        marginTop: '34px',
        border: `1px solid ${theme === 'dark' ? 'rgba(102,217,232,0.12)' : 'rgba(37,87,96,0.12)'}`,
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
        fontSize: '34px',
        fontWeight: 900,
        color: Colors.get('mainText', theme),
        marginBottom: '18px',
        fontFamily: 'monospace',
        letterSpacing: '2px',
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
        background: theme === 'dark' ? 'rgba(102,217,232,0.18)' : 'rgba(102,217,232,0.2)',
        color: theme === 'dark' ? '#BDEFF5' : '#226877',
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
        background: 'linear-gradient(135deg, #66D9E8 0%, #8A7CD6 100%)',
        color: '#0E1013',
        fontSize: '17px',
        fontWeight: 950,
        boxShadow: '0 18px 38px rgba(102,217,232,0.22)',
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
    return "Чтобы получить больше очков, отвечайте правильно и как можно быстрее. Каждая ошибка сбрасывает множитель. За каждые 5 правильных ответов подряд множитель повышается, достигая максимума ×1.5.";
  } else {
    return "To earn more points, answer correctly and as quickly as possible. Every mistake resets your multiplier. For every 5 correct answers in a row, your multiplier increases—up to a maximum of ×1.5.";
  }
};

const stripResultEmojis = (text) => String(text).replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/gu, '').trim();

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
    return langIndex === 0 ? 'Хорошо!' : 'Good job!';
  }

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return stripResultEmojis(candidates[randomIndex]);
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
