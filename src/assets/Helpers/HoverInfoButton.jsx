import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Colors from '../StaticClasses/Colors.js';
import { AppData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import { theme$, lang$, fontSize$, setPage, setActiveTab } from '../StaticClasses/HabitsBus'
import { FaQuestion } from "react-icons/fa6"; // Using FaQuestion usually fits "Help" better, or keep FaInfo

const HoverInfoButton = ({ tab = 'MainCard', variant = 'default', accent = '#007AFF', styleOverride = {} }) => {
    // eslint-disable-next-line no-unused-vars
    const [theme, setthemeState] = React.useState('dark');
    // eslint-disable-next-line no-unused-vars
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    // eslint-disable-next-line no-unused-vars
    const [fSize, setFontSize] = useState(0);
    const [needToShow, setNeedToShow] = useState(AppData.infoMiniPanel[tab] || false);
    const dismissingByDrag = React.useRef(false);

    useEffect(() => {
        const subs = [
            theme$.subscribe(setthemeState),
            lang$.subscribe((l) => setLangIndex(l === 'ru' ? 0 : 1)),
            fontSize$.subscribe(setFontSize),
        ];
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    const hideButton = async () => {
        setNeedToShow(false);
        AppData.infoMiniPanel[tab] = false;
        await saveData();
    }

    const onConfirm = async () => {
        if (dismissingByDrag.current) {
            dismissingByDrag.current = false;
            return;
        }
        setPage('InfoPanel');
        setActiveTab(tab);
        await hideButton();
    }

    const onDragEnd = async (_event, info) => {
        const distance = Math.hypot(info.offset.x, info.offset.y);
        if (distance < 52) return;
        dismissingByDrag.current = true;
        window.setTimeout(() => {
            dismissingByDrag.current = false;
        }, 250);
        await hideButton();
    }

    if (!needToShow) return null;
    const isSubtle = variant === 'subtle';
    const isDark = theme === 'dark' || theme === 'specialdark';
    const glassButton = {
        width: "52px",
        height: "52px",
        borderRadius: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: isDark
            ? `radial-gradient(circle at 32% 22%, rgba(255,255,255,0.34), rgba(120,155,170,0.18) 45%, ${accent}24 100%)`
            : `radial-gradient(circle at 32% 22%, rgba(255,255,255,0.95), rgba(255,255,255,0.58) 48%, ${accent}18 100%)`,
        boxShadow: isDark
            ? `0 1px 0 rgba(255,255,255,0.22) inset, 0 18px 36px -26px rgba(0,0,0,0.8), 0 0 28px ${accent}24`
            : `0 1px 0 rgba(255,255,255,0.9) inset, 0 16px 32px -24px rgba(15,23,42,0.22), 0 0 22px ${accent}18`,
        border: `1px solid ${isDark ? 'rgba(225,240,255,0.25)' : 'rgba(255,255,255,0.66)'}`,
        color: accent,
        backdropFilter: "blur(24px) saturate(175%)",
        WebkitBackdropFilter: "blur(24px) saturate(175%)",
        cursor: "pointer",
        boxSizing: "border-box"
    };
    const buttonStyle = isSubtle ? {
        ...glassButton,
        position: "fixed",
        top: "calc(13vh + 16px)",
        right: "28px",
        zIndex: 1001,
        ...styleOverride
    } : {
        ...glassButton,
        position: "absolute",
        top: "12%",
        right: "9%",
        zIndex: 1000,
        ...styleOverride
    };

    return (
        <motion.div
            // 1. DELAY: wait 1.5 seconds before appearing
            initial={{ scale: 0, opacity: 0, rotate: -45 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ delay: 1.5, duration: 0.18, ease: 'easeOut' }}
            
            whileTap={{ scale: 0.9 }}
            drag
            dragElastic={0.42}
            dragMomentum={false}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            onDragEnd={onDragEnd}
            onClick={onConfirm}
            style={{ ...buttonStyle, touchAction: 'none' }}
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
                    borderRadius: "20px",
                }}
            />}
            
            <FaQuestion size={20} color={accent} style={{filter: `drop-shadow(0 2px 5px ${accent}44)`}}/>
        </motion.div>
    );
}

export default HoverInfoButton
