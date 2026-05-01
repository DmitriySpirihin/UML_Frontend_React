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
            ? `linear-gradient(145deg, rgba(24,28,31,0.94), ${accent}24)`
            : `linear-gradient(145deg, rgba(255,255,255,0.94), ${accent}18)`,
        boxShadow: theme === 'dark'
            ? "0 1px 0 rgba(255,255,255,0.05) inset, 0 16px 34px -28px rgba(0,0,0,0.85)"
            : "0 12px 28px -24px rgba(0,0,0,0.22)",
        border: `1px solid ${accent}55`,
        color: accent,
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
        background: "linear-gradient(135deg, #007AFF, #0055FF)",
        boxShadow: "0 8px 20px rgba(0, 122, 255, 0.4)",
        border: "2px solid rgba(255,255,255,0.2)",
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
                        "0 0 0 0px rgba(0, 122, 255, 0.7)",
                        "0 0 0 10px rgba(0, 122, 255, 0)"
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
            
            <FaQuestion size={isSubtle ? 16 : 20} color={isSubtle ? accent : "#FFF"} style={{filter: isSubtle ? 'none' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}/>
        </motion.div>
    );
}

export default HoverInfoButton
