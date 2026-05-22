import { motion } from 'framer-motion';
import Colors from '../../StaticClasses/Colors';
import { FaArrowRight, FaRedo } from 'react-icons/fa';

const neutralStyle = (theme) => ({
    background: theme === 'dark'
        ? 'radial-gradient(circle at 18% 0%, rgba(102,217,232,0.12), transparent 42%), linear-gradient(145deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))'
        : 'radial-gradient(circle at 18% 0%, rgba(102,217,232,0.14), transparent 42%), linear-gradient(145deg, rgba(255,255,255,0.86), rgba(255,255,255,0.58))',
    border: `1px solid ${theme === 'dark' ? 'rgba(170,229,238,0.13)' : 'rgba(37,87,96,0.11)'}`,
    color: theme === 'dark' ? '#C9D6E8' : '#4C6472',
    boxShadow: theme === 'dark'
        ? 'inset 0 1px 0 rgba(255,255,255,0.12), 0 12px 24px rgba(0,0,0,0.18)'
        : 'inset 0 1px 0 rgba(255,255,255,0.78), 0 8px 18px rgba(24,36,44,0.08)',
    backdropFilter: 'blur(18px) saturate(160%)',
    WebkitBackdropFilter: 'blur(18px) saturate(160%)',
});

const activeStyle = (theme, heat) => {
    const glow = 0.1 + heat * 0.24;
    const border = 0.2 + heat * 0.22;
    return {
        background: theme === 'dark'
            ? `radial-gradient(circle at 24% 0%, rgba(255,218,142,${0.16 + heat * 0.16}), transparent 46%), linear-gradient(135deg, rgba(255,188,76,${0.12 + heat * 0.14}), rgba(255,82,64,${0.08 + heat * 0.12}))`
            : `radial-gradient(circle at 24% 0%, rgba(255,218,142,${0.2 + heat * 0.16}), transparent 46%), linear-gradient(135deg, rgba(255,198,92,${0.2 + heat * 0.16}), rgba(255,108,72,${0.11 + heat * 0.14}))`,
        border: `1px solid ${theme === 'dark' ? `rgba(255,182,82,${border})` : `rgba(171,96,38,${border})`}`,
        color: theme === 'dark' ? '#FFD18A' : '#9A5A24',
        boxShadow: theme === 'dark'
            ? `inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 26px rgba(255,116,78,${glow}), 0 0 ${10 + heat * 18}px rgba(255,174,84,${0.08 + heat * 0.18})`
            : `inset 0 1px 0 rgba(255,255,255,0.78), 0 8px 20px rgba(171,96,38,${0.08 + heat * 0.12})`,
        backdropFilter: 'blur(18px) saturate(160%)',
        WebkitBackdropFilter: 'blur(18px) saturate(160%)',
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
    const glassPanel = isDark
        ? 'linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.032))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.88), rgba(255,255,255,0.58))';
    const glassBorder = isDark ? 'rgba(170,229,238,0.14)' : 'rgba(37,87,96,0.12)';
    const glassShadow = isDark
        ? 'inset 0 1px 0 rgba(255,255,255,0.14), inset 0 -1px 0 rgba(255,255,255,0.035), 0 18px 40px rgba(0,0,0,0.22), 0 0 30px rgba(102,217,232,0.055)'
        : 'inset 0 1px 0 rgba(255,255,255,0.82), 0 14px 30px rgba(24,36,44,0.10)';
    return {
        page: {
            flex: 1,
            width: '100%',
            minHeight: 'var(--app-viewport-height, 100vh)',
            boxSizing: 'border-box',
            padding: 'calc(env(safe-area-inset-top, 0px) + 20px) 20px calc(24px + env(safe-area-inset-bottom, 0px))',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(10px, 1.6vh, 16px)',
            overflowY: 'auto',
            color: Colors.get('mainText', theme),
        },
        title: {
            margin: 0,
            fontSize: `clamp(30px, 8.4vw, ${Math.max(38, fSize + 24)}px)`,
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
            padding: 'clamp(20px, 3vh, 26px) 20px clamp(18px, 2.4vh, 22px)',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'clamp(12px, 1.9vh, 18px)',
            background: isDark
                ? 'radial-gradient(circle at 50% 0%, rgba(102,217,232,0.18), transparent 36%), radial-gradient(circle at 10% 92%, rgba(138,124,214,0.12), transparent 42%), linear-gradient(145deg, rgba(24,34,38,0.78), rgba(14,17,21,0.90))'
                : 'radial-gradient(circle at 50% 0%, rgba(102,217,232,0.18), transparent 36%), radial-gradient(circle at 10% 92%, rgba(138,124,214,0.10), transparent 42%), linear-gradient(145deg, rgba(255,255,255,0.88), rgba(235,242,245,0.72))',
            border: `1px solid ${isDark ? 'rgba(102,217,232,0.24)' : 'rgba(37,87,96,0.14)'}`,
            outline: `1px solid ${isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.54)'}`,
            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.14), 0 28px 70px rgba(0,0,0,0.38), 0 0 54px rgba(102,217,232,0.08)' : '0 20px 50px rgba(24,36,44,0.12)',
            backdropFilter: 'blur(30px) saturate(178%)',
            WebkitBackdropFilter: 'blur(30px) saturate(178%)',
        },
        statusPill: {
            minHeight: '34px',
            padding: '0 14px',
            borderRadius: '999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: isDark
                ? 'radial-gradient(circle at 20% 0%, rgba(102,217,232,0.20), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.08), rgba(102,217,232,0.06))'
                : 'radial-gradient(circle at 20% 0%, rgba(102,217,232,0.22), transparent 60%), linear-gradient(145deg, rgba(255,255,255,0.84), rgba(102,217,232,0.12))',
            border: `1px solid ${isDark ? 'rgba(102,217,232,0.28)' : 'rgba(37,87,96,0.12)'}`,
            color: isDark ? '#AEEBF2' : '#226877',
            fontSize: '11px',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.16), 0 12px 28px rgba(102,217,232,0.08)' : glassShadow,
            backdropFilter: 'blur(22px) saturate(170%)',
            WebkitBackdropFilter: 'blur(22px) saturate(170%)',
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
            gap: 'clamp(7px, 1.2vh, 10px)',
            padding: '2px 0 0',
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
            fontSize: 'clamp(52px, 14vw, 84px)',
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
            minHeight: 'clamp(78px, 10.8vh, 92px)',
            padding: '13px 12px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
            background: isDark
                ? `radial-gradient(circle at 18% 0%, rgba(102,217,232,0.11), transparent 54%), ${glassPanel}`
                : `radial-gradient(circle at 18% 0%, rgba(102,217,232,0.16), transparent 54%), ${glassPanel}`,
            border: `1px solid ${glassBorder}`,
            outline: `1px solid ${isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.50)'}`,
            boxShadow: glassShadow,
            backdropFilter: 'blur(24px) saturate(175%)',
            WebkitBackdropFilter: 'blur(24px) saturate(175%)',
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
            padding: '15px 16px',
            borderRadius: '20px',
            background: isDark
                ? `radial-gradient(circle at 10% 0%, rgba(102,217,232,0.13), transparent 50%), ${glassPanel}`
                : `radial-gradient(circle at 10% 0%, rgba(102,217,232,0.15), transparent 50%), ${glassPanel}`,
            border: `1px solid ${glassBorder}`,
            outline: `1px solid ${isDark ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.50)'}`,
            boxShadow: glassShadow,
            backdropFilter: 'blur(24px) saturate(175%)',
            WebkitBackdropFilter: 'blur(24px) saturate(175%)',
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
            minHeight: 'clamp(116px, 18vh, 170px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            flexShrink: 0,
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
            width: 'clamp(108px, 32vw, 150px)',
            maxHeight: 'clamp(120px, 18vh, 170px)',
            objectFit: 'contain',
            position: 'relative',
            filter: isDark ? 'drop-shadow(0 16px 26px rgba(0,0,0,0.38))' : 'drop-shadow(0 12px 22px rgba(24,36,44,0.16))',
        },
        controls: {
            width: '100%',
            maxWidth: '680px',
            display: 'grid',
            gridTemplateColumns: 'clamp(76px, 20vw, 92px) minmax(0, 1fr)',
            gap: '12px',
            marginTop: '0',
            flexShrink: 0,
        },
        retry: {
            minHeight: 'clamp(64px, 8vh, 76px)',
            borderRadius: '22px',
            border: `1px solid ${glassBorder}`,
            background: glassPanel,
            color: Colors.get('subText', theme),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '21px',
            boxShadow: glassShadow,
            backdropFilter: 'blur(24px) saturate(175%)',
            WebkitBackdropFilter: 'blur(24px) saturate(175%)',
        },
        finish: {
            minHeight: 'clamp(64px, 8vh, 76px)',
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
