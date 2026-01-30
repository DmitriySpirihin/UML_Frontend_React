import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Colors from '../StaticClasses/Colors.js';
import { AppData } from '../StaticClasses/AppData.js';
import { saveData } from '../StaticClasses/SaveHelper.js';
import { theme$, lang$, fontSize$, setPage, setActiveTab } from '../StaticClasses/HabitsBus'
import { FaQuestion } from "react-icons/fa6"; // Using FaQuestion usually fits "Help" better, or keep FaInfo

const HoverInfoButton = ({ tab = 'MainCard' }) => {
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
            style={{
                position: "absolute",
                top: "12%",
                right: "9%",
                width: "48px", // Bigger
                height: "48px", // Bigger
                borderRadius: "50%", // Circle (or use "16px" for a modern squircle)
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                
                // 2. MODERN BLUE STYLE
                background: "linear-gradient(135deg, #007AFF, #0055FF)", 
                boxShadow: "0 8px 20px rgba(0, 122, 255, 0.4)", // Blue Glow
                border: "2px solid rgba(255,255,255,0.2)",
                zIndex: 1000,
                cursor: "pointer"
            }}
        >
            {/* 3. Subtle Pulse Animation (Ripple) */}
            <motion.div
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
            />
            
            <FaQuestion size={20} color="#FFF" style={{filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'}}/>
        </motion.div>
    );
}

export default HoverInfoButton
