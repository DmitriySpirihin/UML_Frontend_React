import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Colors from '../StaticClasses/Colors.js';
import { AppData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import { theme$, lang$, fontSize$, setPage, setActiveTab } from '../StaticClasses/HabitsBus'
import { FaQuestion } from "react-icons/fa6"; // Using FaQuestion usually fits "Help" better, or keep FaInfo

const HoverInfoButton = ({ tab = 'MainCard', variant = 'default', accent = '#007AFF' }) => {
    // eslint-disable-next-line no-unused-vars
    const [theme, setthemeState] = React.useState('dark');
    // eslint-disable-next-line no-unused-vars
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    // eslint-disable-next-line no-unused-vars
    const [fSize, setFontSize] = useState(0);
    const [needToShow, setNeedToShow] = useState(AppData.infoMiniPanel[tab] || false);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFontSize),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    const onConfirm = async () => {
        setPage('InfoPanel');
        setNeedToShow(false);
        setActiveTab(tab);
        AppData.infoMiniPanel[tab] = false;
        await saveData();
    }

    if (!needToShow) return null;
    const isSubtle = variant === 'subtle';
    const buttonStyle = isSubtle ? {
        position: "fixed",
        top: "calc(13vh + 16px)",
        right: "28px",
        width: "42px",
        height: "42px",
        borderRadius: "15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme === 'dark'
            ? `linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.055)), ${accent}18`
            : `linear-gradient(145deg, rgba(255,255,255,0.72), rgba(255,255,255,0.34)), ${accent}10`,
        boxShadow: theme === 'dark'
            ? "0 1px 0 rgba(255,255,255,0.12) inset, 0 18px 34px -26px rgba(0,0,0,0.72)"
            : "0 1px 0 rgba(255,255,255,0.85) inset, 0 14px 28px -24px rgba(15,23,42,0.22)",
        border: `1px solid ${theme === 'dark' ? 'rgba(220,235,245,0.20)' : 'rgba(15,23,42,0.09)'}`,
        color: accent,
        backdropFilter: "blur(20px) saturate(170%)",
        WebkitBackdropFilter: "blur(20px) saturate(170%)",
        zIndex: 1001,
        cursor: "pointer"
    } : {
        position: "absolute",
        top: "12%",
        right: "9%",
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: theme === 'dark'
            ? `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.32), rgba(255,255,255,0.11) 42%, ${accent}22 100%)`
            : `radial-gradient(circle at 30% 20%, rgba(255,255,255,0.92), rgba(255,255,255,0.56) 46%, ${accent}16 100%)`,
        boxShadow: theme === 'dark'
            ? `0 1px 0 rgba(255,255,255,0.2) inset, 0 18px 36px -26px rgba(0,0,0,0.78), 0 0 28px ${accent}22`
            : `0 1px 0 rgba(255,255,255,0.88) inset, 0 16px 34px -26px rgba(15,23,42,0.22), 0 0 22px ${accent}16`,
        border: theme === 'dark' ? "1px solid rgba(225,240,255,0.26)" : "1px solid rgba(255,255,255,0.62)",
        backdropFilter: "blur(24px) saturate(175%)",
        WebkitBackdropFilter: "blur(24px) saturate(175%)",
        zIndex: 1000,
        cursor: "pointer"
    };

    return (
        <motion.div
            // 1. DELAY: wait 1.5 seconds before appearing
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
                delay: 1.5, 
                type: "spring", 
                stiffness: 260, 
                damping: 20 
            }}
            
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
            onClick={onConfirm}
            style={buttonStyle}
        >
            {/* 3. Subtle Pulse Animation (Ripple) */}
            {!isSubtle && <motion.div
                animate={{
                    boxShadow: [
                        `0 0 0 0px ${accent}42`,
                        `0 0 0 12px ${accent}00`
                    ]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: 2 // Start pulsing after it appears
                }}
                style={{
                    position: "absolute",
                    top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: "50%",
                }}
            />}
            
            <FaQuestion size={isSubtle ? 16 : 20} color={isSubtle ? accent : (theme === 'dark' ? '#EAF3FF' : accent)} style={{filter: isSubtle ? 'none' : 'drop-shadow(0 2px 5px rgba(0,0,0,0.28))'}}/>
        </motion.div>
    );
}

export default HoverInfoButton
