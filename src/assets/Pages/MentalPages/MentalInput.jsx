import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData';
import Colors from "../../StaticClasses/Colors";
import { theme$ } from '../../StaticClasses/HabitsBus';
import { playEffects } from '../../StaticClasses/Effects';
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
                            isActive={currentKey === key}
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
                    isActive={currentKey === 'CC'}
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
                        isActive={currentKey === key}
                    >
                         {renderKeyContent(key)}
                    </KeyButton>
                ))}

                {/* Submit Button (Right) */}
                <KeyButton 
                    theme={theme} 
                    onClick={() => click('>>>')} 
                    specialColor={Colors.get('done', theme)} // Green
                    isActive={currentKey === '>>>'}
                >
                    <FaCheck />
                </KeyButton>
            </div>
        </div>
    )
}

// Extracted Button Component for cleanliness & animation
const KeyButton = ({ theme, onClick, children, specialColor, isEmpty, label, isActive }) => {
    if (isEmpty) return <div style={{...styles(theme).keyBase, opacity: 0, pointerEvents: 'none'}} />;

    const isDark = theme === 'dark';
    const isAction = Boolean(specialColor);
    
    // Determine background color
    let bg = isDark
        ? 'linear-gradient(145deg, rgba(255,255,255,0.075), rgba(255,255,255,0.03))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(238,243,246,0.74))';
    let border = isDark ? '1px solid rgba(255,255,255,0.11)' : '1px solid rgba(20,24,32,0.08)';
    let color = Colors.get('mainText', theme);
    let shadow = isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : '0 10px 22px rgba(24,36,44,0.08)';

    if (specialColor) {
        bg = specialColor === Colors.get('done', theme)
            ? 'linear-gradient(135deg, #20D3A0 0%, #0FB883 100%)'
            : 'linear-gradient(135deg, #FF5A62 0%, #EF3D45 100%)';
        color = '#fff';
        border = '1px solid rgba(255,255,255,0.08)';
        shadow = specialColor === Colors.get('done', theme)
            ? '0 16px 30px rgba(20,211,160,0.2)'
            : '0 16px 30px rgba(239,61,69,0.2)';
    } else if (label === 'true') {
         bg = 'linear-gradient(135deg, rgba(32,211,160,0.2), rgba(32,211,160,0.08))';
         border = '1px solid rgba(32,211,160,0.45)';
    } else if (label === 'false') {
         bg = 'linear-gradient(135deg, rgba(255,90,98,0.2), rgba(255,90,98,0.08))';
         border = '1px solid rgba(255,90,98,0.45)';
    }

    return (
        <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{
                ...styles(theme).keyBase,
                ...(isAction ? styles(theme).actionKey : null),
                background: bg,
                border: border,
                color: color,
                boxShadow: isActive ? `${shadow}, 0 0 0 2px rgba(102,217,232,0.28)` : shadow,
                transform: isActive ? 'translateY(1px)' : 'translateY(0)'
            }}
        >
            <span style={isAction ? styles(theme).actionText : styles(theme).text}>{children}</span>
        </motion.button>
    );
};

export default MentalInput

const styles = (theme) => ({
    container: {
        background: theme === 'dark'
            ? 'linear-gradient(180deg, rgba(22,32,38,0.96), rgba(13,16,19,0.98))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.94), rgba(235,242,245,0.98))',
        backdropFilter: 'blur(22px)',
        display: "flex",
        position: 'fixed',
        flexDirection: "column",
        alignItems: "center",
        justifyContent: 'center',
        height: "min(39vh, 360px)",
        minHeight: '300px',
        bottom: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: "calc(100vw - 16px)",
        maxWidth: '720px',
        boxSizing: 'border-box',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        border: `1px solid ${theme === 'dark' ? 'rgba(102,217,232,0.12)' : 'rgba(37,87,96,0.12)'}`,
        borderBottom: 'none',
        borderTopLeftRadius: '30px',
        borderTopRightRadius: '30px',
        zIndex: 5000,
        boxShadow: theme === 'dark' ? '0 -24px 55px rgba(0,0,0,0.36)' : '0 -20px 46px rgba(24,36,44,0.14)',
        padding: '12px 14px calc(14px + env(safe-area-inset-bottom, 0px))',
    },
    rowPanel: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        flex: 1,
        alignItems: "center",
        margin: '3px 0'
    },
    keyBase: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        height: '100%',
        minHeight: '56px',
        borderRadius: '20px',
        cursor: 'pointer',
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
        outline: 'none',
        transition: 'background 0.2s, box-shadow 0.2s, transform 0.2s',
        maxWidth: '132px'
    },
    actionKey: {
        flex: '0 0 clamp(76px, 17vw, 104px)',
        height: '74%',
        minHeight: '50px',
        maxWidth: '104px',
        borderRadius: '18px',
    },
    text: {
        fontSize: "24px",
        fontWeight: '900',
        lineHeight: 1,
    },
    actionText: {
        fontSize: '20px',
        fontWeight: 900,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
})
