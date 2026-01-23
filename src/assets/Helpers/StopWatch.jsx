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
    const radius = 185; 
    const stroke = 15;
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
const styles = (theme) => ({
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 998
    },
    drawer: {
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '85vh',
        backgroundColor: Colors.get('bottomPanel', theme),
        borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.5)', zIndex: 999,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    header: {
        width: '100%', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', boxSizing: 'border-box'
    },
    handleBar: {
        width: '50px', height: '5px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px',
    },
    headerBtn: {
        fontSize: '24px', color: Colors.get('icons', theme), cursor: 'pointer', padding: '10px'
    },
    contentContainer: {
        width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: '30px', overflowY: 'auto'
    },

    // --- Main Panel ---
    mainPanel: {
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', gap: '40px'
    },
    circleContainer: {
        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: '-20px' // Pull up slightly visually
    },
    centerTextContainer: {
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
    },
    smallTimerText: {
        fontSize: '18px', fontWeight: '600', marginBottom: '5px', opacity: 0.9
    },
    bigTimerText: {
        fontSize: '56px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '-2px'
    },
    
    // --- Controls ---
    controlsContainer: {
        display: 'flex', alignItems: 'center', gap: '30px'
    },
    iconButton: {
        borderRadius: '50%', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform 0.1s ease'
    },
    primaryBtn: {
        width: '90px', height: '90px' // Big center button
    },
    secondaryBtn: {
        width: '60px', height: '60px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        color: Colors.get('icons', theme),
        border: `1px solid rgba(255,255,255,0.05)`
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
        backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '25px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'
    },
    label: {
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    },
    slider: {
        width: '100%', height: 8, color: Colors.get('difficulty', theme),
    },
});