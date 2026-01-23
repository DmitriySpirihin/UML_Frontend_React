import { useState, useEffect } from 'react'
import Colors from '../StaticClasses/Colors'
import { MdClose, MdDone } from 'react-icons/md'
import { TbReload } from 'react-icons/tb'
import { FaPlay, FaSquare } from 'react-icons/fa6'
import Slider from '@mui/material/Slider';

const Stopwatch = ({ theme, langIndex, setTime, setShowPanel }) => {

    const [time, setCurrentTime] = useState(0);
    const [wantedTime, setWantedTime] = useState(60000);
    const [fillAmount, setFillAmount] = useState(0.0);
    const [isStarted, setIsStarted] = useState(false);
    
    // Logic Constants
    const radius = 55;
    const circumference = 2 * Math.PI * radius;

    // --- Logic Effects (Unchanged) ---
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

    // --- Logic Functions (Unchanged) ---
    const reload = () => {
        setCurrentTime(0);
        setIsStarted(false);
    }
    const onAccept = () => {
        reload();
        setTime(time);
        setShowPanel(false);
    }

    // Dynamic Styles
    const currentStyles = styles(theme);
    const progressColor = getColor(theme, fillAmount);

    return (
        <div style={currentStyles.container}>
            
            {/* Top Section: Slider & Label */}
            <div style={currentStyles.topSection}>
                <div style={currentStyles.label}>
                    <span style={{opacity: 0.7, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'}}>
                        {langIndex === 0 ? 'Желаемое время' : 'Wanted time'}
                    </span>
                    <span style={{fontSize: '24px', fontWeight: 'bold', marginTop: '4px'}}>
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

            {/* Middle Section: Progress Circle */}
            <div style={currentStyles.circleContainer}>
                <svg width="300" height="300" viewBox="0 0 150 150">
                    {/* Background Track */}
                    <circle 
                        stroke={Colors.get('progressBar', theme)} 
                        strokeOpacity="0.3"
                        fill="none" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        r={radius} 
                        cx="75" 
                        cy="75" 
                    />
                    
                    {/* Animated Progress */}
                    <circle 
                        stroke={progressColor} 
                        fill="none" 
                        strokeWidth="6" 
                        strokeLinecap="round"
                        r={radius} 
                        cx="75" 
                        cy="75"
                        strokeDasharray={circumference} 
                        strokeDashoffset={(circumference + (-fillAmount * circumference))}
                        style={{
                            transition: 'stroke 0.5s ease, stroke-dashoffset 0.5s linear',
                            filter: `drop-shadow(0px 0px 4px ${progressColor})` // Modern Glow effect
                        }} 
                    />
                    
                    {/* Text Inside Circle */}
                    <g className="texts">
                        {time > 0 && (
                            <text x="75" y="50" textAnchor="middle" dominantBaseline="middle" fontSize="14" fontWeight="600" fill={progressColor}>
                                {formatDurationWantedMs(time, wantedTime)}
                            </text>
                        )}
                        <text x="75" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="32" fontWeight="bold" fill={Colors.get('mainText', theme)}>
                            {formatDurationMs(time)}
                        </text>
                    </g>
                </svg>
            </div>

            {/* Bottom Controls Area */}
            <div style={currentStyles.controlsContainer}>
                
                {/* Play/Reload Controls */}
                <div style={currentStyles.actionButtonsRow}>
                    {!isStarted ? (
                        <>
                            <button onClick={reload} style={{...currentStyles.iconButton, backgroundColor: 'rgba(255,255,255,0.1)'}}>
                                <TbReload style={{fontSize: '28px', color: Colors.get('icons', theme)}} />
                            </button>
                            <button onClick={() => setIsStarted(true)} style={{...currentStyles.iconButton, backgroundColor: Colors.get('done', theme), transform: 'scale(1.1)'}}>
                                <FaPlay style={{fontSize: '28px', color: '#fff', marginLeft: '4px'}} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsStarted(false)} style={{...currentStyles.iconButton, backgroundColor: Colors.get('skipped', theme), width: '70px', height: '70px'}}>
                            <FaSquare style={{fontSize: '28px', color: '#fff'}} />
                        </button>
                    )}
                </div>

                {/* Confirm/Cancel Bar */}
                <div style={currentStyles.bottomBar}>
                    <MdClose 
                        style={{fontSize: '42px', cursor: 'pointer', color: Colors.get('skipped', theme)}} 
                        onClick={() => setShowPanel(false)} 
                    />
                    <div style={{width: '1px', height: '24px', backgroundColor: Colors.get('icons', theme), opacity: 0.3}}></div>
                    <MdDone 
                        style={{fontSize: '42px', cursor: 'pointer', color: Colors.get('done', theme)}} 
                        onClick={() => onAccept()} 
                    />
                </div>
            </div>
        </div>
    )
}

export default Stopwatch

// --- Logic Helpers (Unchanged) ---
function formatDurationMs(duration) {
    if (duration < 0) duration = 0;
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDurationWantedMs(duration, wantedTime) {
    if (duration < 0) duration = 0;
    if (wantedTime <= 0) return formatDurationMs(duration);
    const remainingMs = wantedTime - duration;
    if (remainingMs > 0) {
        const totalSeconds = Math.floor(remainingMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
        const extraMs = -remainingMs;
        const totalExtraSeconds = Math.floor(extraMs / 1000);
        const extraMinutes = Math.floor(totalExtraSeconds / 60);
        const extraSeconds = totalExtraSeconds % 60;
        if (extraMinutes > 0) {
            return `+${extraMinutes}:${extraSeconds.toString().padStart(2, '0')}`;
        } else {
            return `+${extraSeconds.toString().padStart(2, '0')}`;
        }
    }
}

const getColor = (theme, fillAmount) => {
    if (fillAmount < 0.5) return Colors.get('skipped', theme);
    if (fillAmount < 0.99) return Colors.get('icons', theme);
    return Colors.get('done', theme);
}

// --- Modernized Styles ---
const styles = (theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "24px",
        backgroundColor: Colors.get('bottomPanel', theme),
        width: "100%",
        height: "90vh", // Kept original height constraint
        padding: "20px 0",
        boxSizing: 'border-box',
        position: 'relative',
        overflow: 'hidden'
    },
    topSection: {
        width: '85%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'rgba(0,0,0,0.05)', // Subtle backing for slider area
        borderRadius: '16px',
        padding: '15px',
        marginTop: '10px'
    },
    label: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: Colors.get('mainText', theme),
        marginBottom: '10px',
        fontFamily: 'sans-serif', // Ensure clean font
    },
    slider: {
        width: '95%',
        height: 6,
        color: Colors.get('difficulty', theme),
        padding: '10px 0',
    },
    circleContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        position: 'relative',
    },
    controlsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        gap: '20px',
        marginBottom: '10px'
    },
    actionButtonsRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        height: '80px', // Reserve height so UI doesn't jump
    },
    iconButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s ease, background-color 0.2s',
    },
    bottomBar: {
        width: '70%',
        height: '65px',
        backgroundColor: 'rgba(0,0,0,0.1)', // Glass-like feel
        borderRadius: '35px', // Pill shape
        display: 'flex',
        marginTop:'55px',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        backdropFilter: 'blur(5px)',
    }
});