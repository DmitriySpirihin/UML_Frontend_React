import { motion } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { FaArrowRight, FaRedo } from 'react-icons/fa';

const neutralStyle = (theme) => ({
    background: theme === 'dark' ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.065)' : 'rgba(20,24,32,0.06)'}`,
    color: theme === 'dark' ? '#C9D6E8' : '#4C6472',
    boxShadow: theme === 'dark' ? '0 10px 24px rgba(0,0,0,0.12)' : '0 8px 18px rgba(24,36,44,0.08)',
});

const activeStyle = (theme, heat) => {
    const glow = 0.1 + heat * 0.24;
    const border = 0.2 + heat * 0.22;
    return {
        background: theme === 'dark'
            ? `linear-gradient(135deg, rgba(255,188,76,${0.12 + heat * 0.14}), rgba(255,82,64,${0.08 + heat * 0.12}))`
            : `linear-gradient(135deg, rgba(255,198,92,${0.2 + heat * 0.16}), rgba(255,108,72,${0.11 + heat * 0.14}))`,
        border: `1px solid ${theme === 'dark' ? `rgba(255,182,82,${border})` : `rgba(171,96,38,${border})`}`,
        color: theme === 'dark' ? '#FFD18A' : '#9A5A24',
        boxShadow: theme === 'dark'
            ? `0 10px 26px rgba(255,116,78,${glow}), 0 0 ${10 + heat * 18}px rgba(255,174,84,${0.08 + heat * 0.18})`
            : `0 8px 20px rgba(171,96,38,${0.08 + heat * 0.12})`,
    };
};

const labelStyle = {
    fontSize: '10px',
    fontWeight: 850,
    opacity: 0.72,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
};

const valueStyle = {
    fontSize: '15px',
    fontWeight: 950,
    letterSpacing: '0',
};

const baseStyle = {
    minHeight: '34px',
    padding: '0 12px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
};

export const StreakBadge = ({ theme, langIndex, streakLength }) => {
    const active = streakLength > 1;
    const heat = active ? Math.min(1, (streakLength - 1) / 7) : 0;
    const glow = `0 10px 26px rgba(255,116,78,${0.1 + heat * 0.24}), 0 0 ${10 + heat * 18}px rgba(255,174,84,${0.08 + heat * 0.18})`;

    return (
        <motion.div
            style={{
                ...baseStyle,
                ...(active ? activeStyle(theme, heat) : neutralStyle(theme)),
            }}
            animate={active ? {
                scale: [1, 1.012 + heat * 0.018, 1],
                boxShadow: [activeStyle(theme, heat).boxShadow, glow, activeStyle(theme, heat).boxShadow],
            } : { scale: 1 }}
            transition={active ? {
                duration: 1.45 - heat * 0.35,
                repeat: Infinity,
                ease: 'easeInOut',
            } : undefined}
        >
            <span style={labelStyle}>{langIndex === 0 ? 'Серия' : 'Streak'}</span>
            <span style={valueStyle}>{streakLength}</span>
        </motion.div>
    );
};

const resultStyles = (theme, fSize = 14) => {
    const isDark = theme === 'dark';
    return {
        page: {
            flex: 1,
            width: '100%',
            minHeight: '100vh',
            boxSizing: 'border-box',
            padding: 'calc(env(safe-area-inset-top, 0px) + 22px) 20px calc(28px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            overflowY: 'auto',
            color: Colors.get('mainText', theme),
        },
        title: {
            margin: 0,
            fontSize: `${Math.max(28, fSize + 18)}px`,
            fontWeight: 950,
            lineHeight: 1.05,
            letterSpacing: '0',
            textAlign: 'center',
        },
        card: {
            width: '100%',
            maxWidth: '680px',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '30px',
            padding: '26px 20px 22px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            background: isDark
                ? 'radial-gradient(circle at 50% 4%, rgba(102,217,232,0.13), transparent 34%), linear-gradient(145deg, rgba(24,34,38,0.96), rgba(14,17,21,0.98))'
                : 'radial-gradient(circle at 50% 4%, rgba(102,217,232,0.16), transparent 34%), linear-gradient(145deg, rgba(255,255,255,0.94), rgba(235,242,245,0.94))',
            border: `1px solid ${isDark ? 'rgba(102,217,232,0.18)' : 'rgba(37,87,96,0.14)'}`,
            boxShadow: isDark ? '0 28px 70px rgba(0,0,0,0.38)' : '0 20px 50px rgba(24,36,44,0.12)',
        },
        statusPill: {
            minHeight: '34px',
            padding: '0 14px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: isDark ? 'rgba(102,217,232,0.1)' : 'rgba(102,217,232,0.16)',
            border: `1px solid ${isDark ? 'rgba(102,217,232,0.18)' : 'rgba(37,87,96,0.12)'}`,
            color: isDark ? '#AEEBF2' : '#226877',
            fontSize: '11px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
        statusDot: {
            width: '9px',
            height: '9px',
            borderRadius: '999px',
            background: isDark ? '#AEEBF2' : '#226877',
            boxShadow: isDark ? '0 0 18px rgba(102,217,232,0.5)' : 'none',
        },
        scoreCluster: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            padding: '6px 0 4px',
        },
        resultMark: {
            width: '76px',
            height: '76px',
            borderRadius: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark
                ? 'linear-gradient(145deg, rgba(102,217,232,0.2), rgba(138,124,214,0.16))'
                : 'linear-gradient(145deg, rgba(102,217,232,0.26), rgba(138,124,214,0.18))',
            border: `1px solid ${isDark ? 'rgba(102,217,232,0.28)' : 'rgba(37,87,96,0.16)'}`,
            boxShadow: isDark ? '0 18px 40px rgba(102,217,232,0.16), inset 0 1px 0 rgba(255,255,255,0.16)' : '0 12px 28px rgba(24,36,44,0.1)',
        },
        resultMarkInner: {
            width: '28px',
            height: '28px',
            borderRadius: '10px',
            transform: 'rotate(45deg)',
            background: isDark ? '#BDEFF5' : '#226877',
            boxShadow: isDark ? '0 0 24px rgba(102,217,232,0.52)' : 'none',
        },
        scoreLabel: {
            margin: 0,
            color: Colors.get('subText', theme),
            fontSize: '12px',
            fontWeight: 850,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
        score: {
            margin: 0,
            color: Colors.get('mainText', theme),
            fontSize: 'clamp(56px, 15vw, 88px)',
            fontWeight: 950,
            lineHeight: 0.95,
            letterSpacing: '0',
        },
        metrics: {
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '10px',
        },
        metric: {
            minHeight: '76px',
            padding: '12px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.72)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.075)' : 'rgba(20,24,32,0.065)'}`,
        },
        metricLabel: {
            color: Colors.get('subText', theme),
            fontSize: '11px',
            fontWeight: 850,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
        },
        metricValue: {
            color: Colors.get('mainText', theme),
            fontSize: '20px',
            fontWeight: 950,
            lineHeight: 1.1,
        },
        message: {
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            borderRadius: '20px',
            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(20,24,32,0.06)'}`,
        },
        messageIcon: {
            width: '30px',
            height: '30px',
            borderRadius: '12px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isDark ? 'rgba(102,217,232,0.14)' : 'rgba(102,217,232,0.18)',
            color: isDark ? '#BDEFF5' : '#226877',
            fontSize: '13px',
            fontWeight: 950,
            fontStyle: 'italic',
        },
        messageText: {
            margin: 0,
            color: Colors.get('subText', theme),
            fontSize: '14px',
            lineHeight: 1.45,
            fontWeight: 750,
        },
        mascotWrap: {
            width: '100%',
            maxWidth: '680px',
            minHeight: '170px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
        },
        mascotGlow: {
            position: 'absolute',
            width: '170px',
            height: '80px',
            borderRadius: '999px',
            bottom: '18px',
            background: isDark ? 'rgba(102,217,232,0.08)' : 'rgba(102,217,232,0.16)',
            filter: 'blur(18px)',
        },
        mascot: {
            width: 'min(34vw, 150px)',
            maxHeight: '170px',
            objectFit: 'contain',
            position: 'relative',
            filter: isDark ? 'drop-shadow(0 16px 26px rgba(0,0,0,0.38))' : 'drop-shadow(0 12px 22px rgba(24,36,44,0.16))',
        },
        controls: {
            width: '100%',
            maxWidth: '680px',
            display: 'grid',
            gridTemplateColumns: '72px minmax(0, 1fr)',
            gap: '12px',
            marginTop: 'auto',
        },
        retry: {
            height: '62px',
            borderRadius: '22px',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(20,24,32,0.07)'}`,
            background: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.72)',
            color: Colors.get('subText', theme),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '21px',
            boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.18)' : '0 10px 22px rgba(24,36,44,0.08)',
        },
        finish: {
            height: '62px',
            borderRadius: '22px',
            border: 'none',
            background: 'linear-gradient(135deg, #66D9E8 0%, #8A7CD6 100%)',
            color: '#0E1013',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 950,
            boxShadow: '0 18px 38px rgba(102,217,232,0.22)',
        },
        finishIcon: {
            width: '30px',
            height: '30px',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(14,16,19,0.14)',
            fontSize: '14px',
        },
    };
};

export const MentalResultScreen = ({
    theme,
    langIndex,
    fSize,
    score,
    timeValue,
    correctValue,
    bestValue,
    isRecord,
    message,
    onRetry,
    onFinish,
}) => {
    const s = resultStyles(theme, fSize);
    const labels = langIndex === 0
        ? { title: 'Результат', done: 'Сессия завершена', record: 'Новый рекорд', score: 'Очки', time: 'Время', correct: 'Точность', best: 'Лучший', retry: 'Повторить', finish: 'Завершить' }
        : { title: 'Result', done: 'Session complete', record: 'New record', score: 'Score', time: 'Time', correct: 'Accuracy', best: 'Best', retry: 'Retry', finish: 'Finish' };
    const metrics = [
        { label: labels.time, value: timeValue },
        { label: labels.correct, value: correctValue },
        { label: labels.best, value: isRecord ? score : bestValue },
    ];

    return (
        <motion.div
            key="result-screen"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            style={s.page}
        >
            <h2 style={s.title}>{labels.title}</h2>
            <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.28 }}
                style={s.card}
            >
                <div style={s.statusPill}>
                    <span style={s.statusDot} />
                    {isRecord ? labels.record : labels.done}
                </div>
                <div style={s.scoreCluster}>
                    <motion.div
                        style={s.resultMark}
                        animate={isRecord ? { scale: [1, 1.06, 1], rotate: [0, 2, 0] } : { scale: 1 }}
                        transition={isRecord ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
                    >
                        <span style={s.resultMarkInner} />
                    </motion.div>
                    <p style={s.scoreLabel}>{labels.score}</p>
                    <p style={s.score}>{score}</p>
                </div>
                <div style={s.metrics}>
                    {metrics.map((metric) => (
                        <div key={metric.label} style={s.metric}>
                            <span style={s.metricLabel}>{metric.label}</span>
                            <span style={s.metricValue}>{metric.value}</span>
                        </div>
                    ))}
                </div>
                <div style={s.message}>
                    <span style={s.messageIcon}>i</span>
                    <p style={s.messageText}>{message}</p>
                </div>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                style={s.mascotWrap}
            >
                <span style={s.mascotGlow} />
                <img style={s.mascot} src="images/Congrat.png" alt="" />
            </motion.div>
            <div style={s.controls}>
                <motion.button whileTap={{ scale: 0.94 }} onClick={onRetry} style={s.retry} aria-label={labels.retry}>
                    <FaRedo />
                </motion.button>
                <motion.button whileTap={{ scale: 0.97 }} onClick={onFinish} style={s.finish}>
                    <span>{labels.finish}</span>
                    <span style={s.finishIcon}><FaArrowRight /></span>
                </motion.button>
            </div>
        </motion.div>
    );
};
