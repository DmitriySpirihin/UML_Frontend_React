import { useState, useEffect } from 'react'
import Colors from '../StaticClasses/Colors'
import { MdClose, MdDone, MdSettings, MdArrowBack } from 'react-icons/md'
import { TbReload } from 'react-icons/tb'
import { FaPlay, FaPause, FaStop } from 'react-icons/fa6'
import Slider from '@mui/material/Slider';

const Stopwatch = ({ theme, langIndex, setTime, setShowPanel }) => {

    const [time, setCurrentTime] = useState(0);
    const [wantedTime, setWantedTime] = useState(60000);
    const [fillAmount, setFillAmount] = useState(0.0);
    const [isStarted, setIsStarted] = useState(false);
    
    // New State for UI toggle
    const [showSettings, setShowSettings] = useState(false);

    // Logic Constants - Bigger Size
    const radius = 155;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    // --- Logic Effects ---
    useEffect(() => {
        setFillAmount(Math.min(time / wantedTime, 1));
    }, [time, wantedTime]);

    useEffect(() => {
        if (!isStarted) return;
        const interval = setInterval(() => {
            setCurrentTime(prev => prev + 100);
        }, 100);

        return () => clearInterval(interval);
    }, [isStarted]);

    // --- Actions ---
    const reload = () => {
        setCurrentTime(0);
        setIsStarted(false);
    }
    
    const onAccept = () => {
        setIsStarted(false);
        setTime(time);
        setShowPanel(false);
    }
    
    const onClose = () => {
        setIsStarted(false);
        setShowPanel(false);
    }

    // Dynamic Styles
    const currentStyles = styles(theme);
    const progressColor = getColor(theme, fillAmount);

    return (
        <>
            {/* Backdrop */}
            <div style={currentStyles.backdrop} onClick={onClose}></div>

            {/* Slide-up Drawer */}
            <div style={currentStyles.drawer}>
                
                {/* --- Header --- */}
                <div style={currentStyles.header}>
                    <div style={currentStyles.headerBtn} onClick={showSettings ? () => setShowSettings(false) : onClose}>
                        {showSettings ? <MdArrowBack /> : <MdClose />}
                    </div>
                    <div style={currentStyles.handleBar}></div>
                    <div style={currentStyles.headerBtn} onClick={() => setShowSettings(!showSettings)}>
                        <MdSettings style={{ opacity: showSettings ? 1 : 0.6 }} />
                    </div>
                </div>

                {/* --- Content Area --- */}
                <div style={currentStyles.contentContainer}>

                    {/* VIEW 1: SETTINGS */}
                    {showSettings ? (
                        <div style={currentStyles.settingsPanel}>
                            <div style={currentStyles.sectionTitle}>
                                {langIndex === 0 ? 'Настройки таймера' : 'Timer Settings'}
                            </div>

                            <div style={currentStyles.settingBox}>
                                <div style={currentStyles.label}>
                                    <span style={{ opacity: 0.7, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        {langIndex === 0 ? 'Цель' : 'Target Time'}
                                    </span>
                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: Colors.get('mainText', theme), marginTop: '5px' }}>
                                        {Math.floor(wantedTime / 60000)}:{Math.floor((wantedTime % 60000) / 1000).toString().padStart(2, '0')}
                                    </span>
                                </div>

                                <Slider
                                    style={currentStyles.slider}
                                    min={30}
                                    max={3600}
                                    step={30}
                                    value={wantedTime / 1000}
                                    valueLabelDisplay="off"
                                    onChange={(_, newValue) => { setWantedTime(newValue * 1000); }}
                                />
                            </div>
                        </div>
                    ) : (

                    /* VIEW 2: BIG GLOWING STOPWATCH */
                    <div style={currentStyles.mainPanel}>
                        
                        {/* Progress Circle */}
                        <div style={currentStyles.circleContainer}>
                            <svg 
                                height={radius * 2} 
                                width={radius * 2} 
                                style={{ overflow: 'visible' }} // Allow glow to spill out
                            >
                                {/* Background Track */}
                                <circle
                                    stroke={Colors.get('progressBar', theme)}
                                    strokeOpacity="0.1"
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    strokeLinecap="round"
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                />
                                
                                {/* Glowing Progress Ring */}
                                <circle
                                    stroke={progressColor}
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    strokeLinecap="round"
                                    strokeDasharray={circumference + ' ' + circumference}
                                    style={{ 
                                        strokeDashoffset: circumference - fillAmount * circumference,
                                        transition: 'stroke-dashoffset 0.1s linear, stroke 0.5s ease',
                                        // THE GLOW
                                        filter: `drop-shadow(0 0 15px ${progressColor}) drop-shadow(0 0 5px ${progressColor})`
                                    }}
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                    transform={`rotate(-90 ${radius} ${radius})`}
                                />
                            </svg>

                            {/* Text Centered Absolute */}
                            <div style={currentStyles.centerTextContainer}>
                                {time > 0 && (
                                    <div style={{...currentStyles.smallTimerText, color: progressColor}}>
                                        {formatDurationWantedMs(time, wantedTime)}
                                    </div>
                                )}
                                <div style={{
                                    ...currentStyles.bigTimerText, 
                                    color: Colors.get('mainText', theme),
                                    textShadow: `0 0 25px ${progressColor}66` // Subtle text glow
                                }}>
                                    {formatDurationMs(time)}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div style={currentStyles.controlsContainer}>
                            
                            {/* Reload (Left) */}
                            <button onClick={reload} style={{ ...currentStyles.iconButton, ...currentStyles.secondaryBtn }}>
                                <TbReload style={{ fontSize: '24px' }} />
                            </button>

                            {/* Play/Pause (Center - Big) */}
                            <button 
                                onClick={() => setIsStarted(!isStarted)} 
                                style={{ 
                                    ...currentStyles.iconButton, 
                                    ...currentStyles.primaryBtn,
                                    backgroundColor: isStarted ? Colors.get('skipped', theme) : Colors.get('done', theme),
                                    boxShadow: `0 0 20px ${isStarted ? Colors.get('skipped', theme) : Colors.get('done', theme)}66`
                                }}
                            >
                                {isStarted ? 
                                    <FaStop style={{ fontSize: '28px', color: '#fff' }} /> : 
                                    <FaPlay style={{ fontSize: '28px', color: '#fff', marginLeft:'4px' }} />
                                }
                            </button>

                            {/* Save (Right) */}
                            <button onClick={onAccept} style={{ ...currentStyles.iconButton, ...currentStyles.secondaryBtn }}>
                                <MdDone style={{ fontSize: '28px', color: Colors.get('done', theme) }} />
                            </button>
                            
                        </div>
                    </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Stopwatch

// --- Helpers ---
function formatDurationMs(duration) {
    if (duration < 0) duration = 0;
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDurationWantedMs(duration, wantedTime) {
    if (duration < 0) duration = 0;
    if (wantedTime <= 0) return '';
    const remainingMs = wantedTime - duration;
    
    // Formatting logic for the small top text
    const totalSeconds = Math.floor(Math.abs(remainingMs) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const str = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    return remainingMs >= 0 ? `-${str}` : `+${str}`;
}

const getColor = (theme, fillAmount) => {
    if (fillAmount < 0.5) return Colors.get('skipped', theme); // Red/Orange
    if (fillAmount < 0.99) return Colors.get('difficulty', theme); // Blue/Yellow
    return Colors.get('done', theme); // Green
}

// --- Styles ---
const styles = (theme) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const panelSoft = isLight ? 'rgba(255,255,255,0.34)' : 'rgba(255,255,255,0.055)';
    const border = isLight ? 'rgba(15,23,42,0.12)' : 'rgba(179,220,255,0.16)';
    const glow = isLight ? 'rgba(75,141,210,0.18)' : 'rgba(60,165,255,0.22)';

    return {
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: isLight
            ? 'rgba(232,238,246,0.52)'
            : 'radial-gradient(620px 420px at 50% 100%, rgba(50,149,255,0.16), transparent 62%), rgba(0,0,0,0.62)',
        backdropFilter: 'blur(10px) saturate(135%)',
        WebkitBackdropFilter: 'blur(10px) saturate(135%)',
        zIndex: 998
    },
    drawer: {
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 'min(100%, 660px)', height: '85vh',
        background: isLight
            ? 'linear-gradient(155deg, rgba(255,255,255,0.74), rgba(224,237,250,0.48))'
            : 'linear-gradient(155deg, rgba(39,72,99,0.62), rgba(14,35,54,0.54) 58%, rgba(12,25,38,0.66))',
        borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
        border: `1px solid ${border}`,
        borderBottom: 'none',
        boxShadow: isLight
            ? `0 -24px 60px -36px rgba(15,23,42,0.36), 0 1px 0 rgba(255,255,255,0.9) inset, 0 0 80px ${glow}`
            : `0 -28px 70px -36px rgba(0,0,0,0.78), 0 1px 0 rgba(255,255,255,0.13) inset, 0 0 90px ${glow}`,
        zIndex: 999,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'hidden',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)'
    },
    header: {
        width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', boxSizing: 'border-box'
    },
    handleBar: {
        width: '50px', height: '5px', backgroundColor: isLight ? 'rgba(15,23,42,0.18)' : 'rgba(190,219,255,0.20)', borderRadius: '3px',
        boxShadow: isLight ? 'none' : '0 0 18px rgba(130,195,255,0.16)'
    },
    headerBtn: {
        width: 42, height: 42, borderRadius: 15,
        fontSize: '24px', color: Colors.get('icons', theme), cursor: 'pointer', padding: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${border}`,
        boxShadow: isLight ? '0 10px 24px -22px rgba(15,23,42,0.30)' : '0 12px 28px -24px rgba(0,0,0,0.78)'
    },
    contentContainer: {
        width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: '30px', overflowY: 'auto'
    },

    // --- Main Panel ---
    mainPanel: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', gap: '40px',
        background: isLight
            ? 'radial-gradient(330px 280px at 50% 46%, rgba(105,170,230,0.18), transparent 72%)'
            : 'radial-gradient(360px 320px at 50% 45%, rgba(61,151,239,0.18), transparent 72%)'
    },
    circleContainer: {
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 'min(78vw, 310px)', height: 'min(78vw, 310px)',
        maxWidth: 310, maxHeight: 310,
        marginTop: '-20px',
        borderRadius: '50%',
        background: isLight
            ? 'radial-gradient(circle at 50% 48%, rgba(255,255,255,0.54), rgba(210,229,248,0.20) 48%, rgba(255,255,255,0.08) 72%)'
            : 'radial-gradient(circle at 50% 48%, rgba(132,190,255,0.11), rgba(255,255,255,0.035) 46%, rgba(7,21,33,0.08) 73%)',
        border: `1px solid ${isLight ? 'rgba(255,255,255,0.64)' : 'rgba(163,210,255,0.075)'}`,
        boxShadow: isLight
            ? '0 24px 70px -50px rgba(44,108,172,0.42), inset 0 1px 0 rgba(255,255,255,0.72)'
            : '0 26px 76px -52px rgba(43,153,255,0.38), inset 0 1px 0 rgba(255,255,255,0.08)'
    },
    centerTextContainer: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    },
    smallTimerText: {
        fontSize: '18px', fontWeight: '600', marginBottom: '5px', opacity: 0.9
    },
    bigTimerText: {
        fontSize: '58px', fontWeight: 900, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace', letterSpacing: 0
    },
    
    // --- Controls ---
    controlsContainer: {
        display: 'flex', alignItems: 'center', gap: '30px',
        padding: '10px 12px',
        borderRadius: 999,
        background: isLight ? 'rgba(255,255,255,0.30)' : 'rgba(255,255,255,0.035)',
        border: `1px solid ${border}`,
        boxShadow: isLight ? '0 18px 46px -34px rgba(15,23,42,0.28)' : '0 18px 46px -34px rgba(0,0,0,0.72)',
        backdropFilter: 'blur(18px) saturate(145%)',
        WebkitBackdropFilter: 'blur(18px) saturate(145%)'
    },
    iconButton: {
        borderRadius: '50%', border: `1px solid ${border}`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.1s ease, box-shadow 0.2s ease, background 0.2s ease',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)'
    },
    primaryBtn: {
        width: '90px', height: '90px' // Big center button
    },
    secondaryBtn: {
        width: '60px', height: '60px',
        background: isLight ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.07)',
        color: Colors.get('icons', theme),
        border: `1px solid ${border}`,
        boxShadow: isLight ? '0 12px 26px -22px rgba(15,23,42,0.28), inset 0 1px 0 rgba(255,255,255,0.74)' : '0 14px 30px -24px rgba(0,0,0,0.72), inset 0 1px 0 rgba(255,255,255,0.08)'
    },

    // --- Settings Panel ---
    settingsPanel: {
        width: '90%', display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '20px'
    },
    sectionTitle: {
        fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px',
        color: Colors.get('icons', theme), textAlign: 'center', opacity: 0.6
    },
    settingBox: {
        background: panelSoft, borderRadius: '20px', padding: '25px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px',
        border: `1px solid ${border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
    },
    label: {
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    slider: {
        width: '100%', height: 8, color: Colors.get('difficulty', theme),
    },
    };
};
