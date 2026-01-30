import { useEffect, useState, useRef, useMemo } from 'react';
import { AppData } from '../StaticClasses/AppData';
import Colors from "../StaticClasses/Colors";
import { theme$, lang$, keyboardNeeded$, setCurrentKeyboardString, setKeyboardNeeded } from '../StaticClasses/HabitsBus';
import { MdBackspace } from "react-icons/md";
import { IoLanguage } from "react-icons/io5";
import { FaArrowUp } from "react-icons/fa";
import { useLongPress } from '../Helpers/LongPress';

// Move audio outside component to avoid recreating it on every render
const tapAudio = new Audio('Audio/Tap.wav');

const keys = {
    0: [
        ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
        ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
        ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю'],
    ],
    1: [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ],
    2: [
        ['!', '1', '2', '3', '?',],
        [':', '4', '5', '6', '-'],
        ['7', '8', '9']
    ]
};

const KeyBoard = () => {
    const [theme, setThemeState] = useState('dark');
    // Default to 1 (English) if AppData is not ready, otherwise use AppData
    const [langIndex, setLangIndex] = useState(AppData.prefs ? AppData.prefs[0] : 1);
    const [needKeyBoard, setNeedKeyBoard] = useState({ type: 0, value: false });
    const [isShift, setIsShift] = useState(true);
    const [currentKeys, setCurrentKeys] = useState(langIndex);
    const [currentKey, setCurrentKey] = useState('000');
    const [currentLang, setCurrentLang] = useState(langIndex);
    
    const keyboardRef = useRef();

    // Memoize styles to prevent unnecessary re-renders
    const computedStyles = useMemo(() => getStyles(theme, needKeyBoard.value), [theme, needKeyBoard.value]);

    useEffect(() => {
        function handleTap(event) {
            if (keyboardRef.current && !keyboardRef.current.contains(event.target)) {
                // Check if the click is outside the keyboard to close it
                setKeyboardNeeded({ type: 0, value: false });
            }
        }
        
        // Use pointerdown for better mobile support, fallback to mouse/touch
        window.addEventListener('mousedown', handleTap);
        window.addEventListener('touchstart', handleTap);
        return () => {
            window.removeEventListener('mousedown', handleTap);
            window.removeEventListener('touchstart', handleTap);
        };
    }, []);

    // Visual feedback reset
    useEffect(() => {
        if (currentKey === '000') return;
        const timeout = setTimeout(() => setCurrentKey('000'), 100);
        return () => clearTimeout(timeout);
    }, [currentKey]);

    // Subscriptions
    useEffect(() => {
        const subscriptionT = theme$.subscribe(setThemeState);
        const subscription = lang$.subscribe((lang) => {
            const newLangIndex = lang === 'ru' ? 0 : 1;
            setLangIndex(newLangIndex);
        });
        const subscriptionK = keyboardNeeded$.subscribe((prev) => {
            setNeedKeyBoard(prev);
            // Only update key layout if opening, otherwise keep last state
            if(prev.value) {
                setCurrentKeys(prev.type === 2 ? 2 : currentLang);
            }
        });

        return () => {
            subscription.unsubscribe();
            subscriptionT.unsubscribe();
            subscriptionK.unsubscribe();
        }
    }, [currentLang]);

    const playEffects = () => {
        // Safe access to AppData
        if (AppData.prefs && AppData.prefs[2] === 0) {
            if (!tapAudio.paused) {
                tapAudio.pause();
                tapAudio.currentTime = 0;
            }
            tapAudio.volume = 0.5;
            tapAudio.play().catch(e => console.log("Audio play failed", e));
        }
        
        // Safe access to Telegram Haptics
        if (AppData.prefs && AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
    };

    const handleKeyClick = (key, e) => {
        if(e) {
            e.stopPropagation();
            e.preventDefault();
        }

        let outputKey = key;
        
        // Special logic for regular characters vs commands
        if (key !== 'bs' && key !== 'bsall' && key !== 'lang' && key !== 'shift' && key !== 'num') {
             outputKey = (isShift && key.length === 1 && key !== ' ') ? key.toUpperCase() : key;
             
             // Auto-disable shift after a letter is pressed (standard mobile behavior)
             if (isShift) setIsShift(false);
        }

        setCurrentKeyboardString(outputKey);
        setCurrentKey(key);
        playEffects();
    };

    const bindKey = useLongPress(() => handleKeyClick('bsall'));

    // Helper to generate key styles cleanly
    const getKeyStyle = (length, keyName) => getKeyStyleGeneric(theme, length, currentKey, keyName);

    return (
        <div style={computedStyles.container} ref={keyboardRef}>
            <div style={computedStyles.innerContainer}>
                
                {/* First Line */}
                <div style={computedStyles.rowPanel}>
                    {keys[currentKeys][0].map((key) => (
                        <div onClick={(e) => handleKeyClick(key, e)} key={key} style={getKeyStyle(keys[currentKeys][0].length, key)}>
                            <p style={computedStyles.text}>{isShift ? key.toUpperCase() : key}</p>
                        </div>
                    ))}
                </div>

                {/* Second Line */}
                <div style={computedStyles.rowPanel}>
                    {keys[currentKeys][1].map((key) => (
                        <div onClick={(e) => handleKeyClick(key, e)} key={key} style={getKeyStyle(keys[currentKeys][1].length, key)}>
                            <p style={computedStyles.text}>{isShift ? key.toUpperCase() : key}</p>
                        </div>
                    ))}
                </div>

                {/* Third Line (Shift + Keys + Backspace) */}
                <div style={computedStyles.rowPanel}>
                    {/* Shift Key */}
                    <div 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsShift(!isShift); 
                            setCurrentKey('shift'); 
                            playEffects(); 
                        }} 
                        style={{
                            ...getKeyStyle(keys[currentKeys][2].length + 2, 'shift'),
                            backgroundColor: Colors.get('currentDateBorder2', theme)
                        }}
                    >
                        <FaArrowUp style={{
                            ...computedStyles.text,
                            color: isShift ? Colors.get('iconsHighlited', theme) : Colors.get('icons', theme)
                        }} />
                    </div>

                    {/* Keys */}
                    {keys[currentKeys][2].map((key) => (
                        <div onClick={(e) => handleKeyClick(key, e)} key={key} style={getKeyStyle(keys[currentKeys][2].length + 2, key)}>
                            <p style={computedStyles.text}>{isShift ? key.toUpperCase() : key}</p>
                        </div>
                    ))}

                    {/* Backspace Key */}
                    <div 
                        {...bindKey} 
                        onClick={(e) => handleKeyClick('bs', e)} 
                        style={{
                            ...getKeyStyle(keys[currentKeys][2].length + 2, 'bs'),
                            backgroundColor: Colors.get('currentDateBorder2', theme)
                        }}
                    >
                        <MdBackspace style={computedStyles.text} />
                    </div>
                </div>

                {/* Last Line (Numbers, Comma, Space, Dot, Lang) */}
                <div style={computedStyles.rowPanel}>
                    {/* Numbers Toggle */}
                    <div 
                        onClick={(e) => { 
                            e.stopPropagation();
                            setCurrentKeys(prev => prev === 2 ? currentLang : 2); 
                            setCurrentKey('num'); 
                            playEffects();
                        }} 
                        style={{...getKeyStyle(1, 'num'), width: '10%', backgroundColor: Colors.get('currentDateBorder2', theme)}}
                    >
                        <p style={computedStyles.text}>{currentKeys < 2 ? '?12' : 'AB'}</p>
                    </div>

                    {/* Comma */}
                    <div onClick={(e) => handleKeyClick(',', e)} style={{...getKeyStyle(1, ','), width: '9%'}}>
                        <p style={computedStyles.text}>{','}</p>
                    </div>

                    {/* 0 or Space */}
                    {currentKeys === 2 ? (
                        <div onClick={(e) => handleKeyClick('0', e)} style={{...getKeyStyle(1, '0'), width: '22%'}}>
                            <p style={computedStyles.text}>{'0'}</p>
                        </div>
                    ) : (
                        <div onClick={(e) => handleKeyClick(' ', e)} style={{...getKeyStyle(1, ' '), width: '51%'}}>
                            <p style={{...computedStyles.text, fontSize: '12px'}}>{'UltyMyLife'}</p>
                        </div>
                    )}

                    {/* Dot */}
                    <div onClick={(e) => handleKeyClick('.', e)} style={{...getKeyStyle(1, '.'), width: '9%'}}>
                        <p style={computedStyles.text}>{'.'}</p>
                    </div>

                    {/* Language Switcher */}
                    <div 
                        onClick={(e) => { 
                            e.stopPropagation();
                            const nextLang = currentLang === 0 ? 1 : 0;
                            setCurrentKeys(prev => prev === 2 ? 2 : nextLang); // Don't switch layout if in number mode
                            setCurrentLang(nextLang);
                            setCurrentKey('lang');
                            playEffects();
                        }} 
                        style={{...getKeyStyle(1, 'lang'), width: '8%', backgroundColor: Colors.get('currentDateBorder2', theme)}}
                    >
                        <IoLanguage style={computedStyles.text} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default KeyBoard

// --- Styling Logic ---

const getKeyStyleGeneric = (theme, length, currentKey, ownKey) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: (90 / length) + '%',
    padding: '2px',
    height: '90%',
    backgroundColor: keyMatch(currentKey, ownKey) ? Colors.get('difficulty', theme) : Colors.get('svgColor', theme),
    borderRadius: '10px',
    cursor: 'pointer',
    userSelect: 'none', // Prevents highlighting text when double tapping
    transition: 'background-color 0.1s', // Smooth transition for visual feedback
});

const keyMatch = (current, own) => current === own;

const getStyles = (theme, needKeyBoard) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex",
        position: 'fixed',
        flexDirection: "column",
        alignItems: "center",
        height: "30vh",
        transform: needKeyBoard ? 'translateY(0)' : 'translateY(100%)',
        bottom: '0',
        left: '0',
        transition: "transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)", // Smoother animation
        width: "100vw",
        fontFamily: "Segoe UI, sans-serif",
        borderTop: `2px solid ${Colors.get('border', theme)}`,
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        zIndex: 5000,
        boxShadow: '0px -2px 10px rgba(0,0,0,0.1)'
    },
    innerContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-evenly', // Better vertical spacing
        paddingBottom: '5px' // Safety padding for iPhone home bar
    },
    rowPanel: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: '2px',
        width: '98%', // Slightly wider to use screen space
        height: '22%',
        alignItems: "center",
    },
    text: {
        fontSize: "21px",
        fontWeight: 'bold',
        color: Colors.get('icons', theme),
        margin: 0,
        pointerEvents: 'none', // Ensures clicks pass through to the div
        userSelect: 'none'
    },
    selectPanel: {
        backgroundColor: Colors.get('bottomPanel', theme),
        borderRadius: '12px',
        display: 'flex',
        flexWrap: 'wrap',
        width: '90%',
        maxHeight: '80%',
        overflowY: 'auto',
        padding: '12px',
        gap: '6px',
        justifyContent: 'center',
    }
});