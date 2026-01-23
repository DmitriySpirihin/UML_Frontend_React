import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$ } from '../../StaticClasses/HabitsBus';
import { FaEraser, FaCheck, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const tap = new Audio('Audio/Tap.wav');

const keys = {
    0: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['0']
    ],
    1: [
        ['←', '1', '2', '3'],
        ['→', '4', '5', '6'],
        ['↓', '7', '8', '9'],
        ['↑', '0']
    ],
    2: [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['0']
    ],
    3: [
        [''],
        ['true'],
        ['false'],
        [''],
    ],
};

const MentalInput = ({ setInput, type }) => {
    const [theme, setthemeState] = useState('dark');
    // currentKey state kept for logic, though Framer Motion handles visual feedback now
    const [currentKey, setCurrentKey] = useState('000');

    useEffect(() => {
        const timeout = setTimeout(() => setCurrentKey('000'), 100);
        return () => clearTimeout(timeout);
    }, [currentKey]);

    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
        return () => {
            subscription.unsubscribe();
        }
    }, []);

    function click(key) {
        if (!key) return; // Prevent clicking empty spacers
        setInput(key);
        setCurrentKey(key);
        playEffects(tap);
    }

    // Helper to render content (icons vs text)
    const renderKeyContent = (key) => {
        if (key === '←') return <FaArrowLeft />;
        if (key === '→') return <FaArrowRight />;
        if (key === '↑') return <FaArrowUp />;
        if (key === '↓') return <FaArrowDown />;
        // Capitalize True/False
        if (key === 'true') return 'True';
        if (key === 'false') return 'False';
        return key;
    };

    return (
        <div style={styles(theme).container}>
            {/* Rows 1, 2, 3 */}
            {[0, 1, 2].map((rowIndex) => (
                <div key={rowIndex} style={styles(theme).rowPanel}>
                    {keys[type][rowIndex].map((key, kInd) => (
                        <KeyButton 
                            key={`${rowIndex}-${kInd}`}
                            theme={theme}
                            label={key}
                            onClick={() => click(key)}
                            isEmpty={key === ''}
                        >
                            {renderKeyContent(key)}
                        </KeyButton>
                    ))}
                </div>
            ))}

            {/* Last Row (Row 4) - Special Handling for Erase/Submit */}
            <div style={styles(theme).rowPanel}>
                
                {/* Erase Button (Left) */}
                <KeyButton 
                    theme={theme} 
                    onClick={() => click('CC')} 
                    specialColor={Colors.get('skipped', theme)} // Red/Orange
                >
                    <FaEraser />
                </KeyButton>

                {/* Center Keys (usually '0') */}
                {keys[type][3].map((key, kInd) => (
                    <KeyButton 
                        key={`3-${kInd}`}
                        theme={theme}
                        label={key}
                        onClick={() => click(key)}
                        isEmpty={key === ''}
                    >
                         {renderKeyContent(key)}
                    </KeyButton>
                ))}

                {/* Submit Button (Right) */}
                <KeyButton 
                    theme={theme} 
                    onClick={() => click('>>>')} 
                    specialColor={Colors.get('done', theme)} // Green
                >
                    <FaCheck />
                </KeyButton>
            </div>
        </div>
    )
}

// Extracted Button Component for cleanliness & animation
const KeyButton = ({ theme, onClick, children, specialColor, isEmpty, label }) => {
    if (isEmpty) return <div style={{...styles(theme).keyBase, opacity: 0, pointerEvents: 'none'}} />;

    const isDark = theme === 'dark';
    
    // Determine background color
    let bg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    let border = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)';
    let color = Colors.get('mainText', theme);

    if (specialColor) {
        bg = specialColor;
        color = '#fff'; // Always white on special colored buttons
        border = 'none';
    } else if (label === 'true') {
         bg = Colors.get('done', theme) + '40'; // Transparent Green
         border = `1px solid ${Colors.get('done', theme)}`;
    } else if (label === 'false') {
         bg = Colors.get('skipped', theme) + '40'; // Transparent Red
         border = `1px solid ${Colors.get('skipped', theme)}`;
    }

    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{
                ...styles(theme).keyBase,
                backgroundColor: bg,
                border: border,
                color: color,
                boxShadow: specialColor ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
            }}
        >
            <span style={styles(theme).text}>{children}</span>
        </motion.button>
    );
};

export default MentalInput

const styles = (theme) => ({
    container: {
        backgroundColor: theme === 'dark' ? 'rgba(20, 20, 20, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(15px)',
        display: "flex",
        position: 'fixed',
        flexDirection: "column",
        alignItems: "center",
        justifyContent: 'center',
        height: "35vh",
        bottom: '0',
        width: "100vw",
        fontFamily: "Segoe UI",
        borderTop: `1px solid ${Colors.get('border', theme)}`,
        borderTopLeftRadius: '24px',
        borderTopRightRadius: '24px',
        zIndex: 5000,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.2)',
        paddingBottom: '10px' // Safe area for phones
    },
    rowPanel: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center', // Center buttons
        gap: '12px', // Gap between buttons
        width: '94%',
        flex: 1, // Distribute height evenly
        alignItems: "center",
        margin: '4px 0'
    },
    keyBase: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1, // Grow to fill row
        height: '100%',
        borderRadius: '16px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        transition: 'background-color 0.2s',
        maxWidth: '120px' // Prevent keys getting too wide on desktop
    },
    text: {
        fontSize: "24px",
        fontWeight: '600',
        // Color handled in component based on props
    }
})

function playEffects(sound) {
    if (AppData.prefs[2] == 0 && sound !== null) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play();
    }
    if (AppData.prefs[3] == 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}