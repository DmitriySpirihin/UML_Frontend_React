import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors'
import { theme$, lang$, fontSize$, setPage, setRecoveryType } from '../../StaticClasses/HabitsBus'
import {  FaChevronRight } from 'react-icons/fa'
import { BsLungs } from 'react-icons/bs'

const RecoveryMain = () => {
    // states
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // subscriptions
    useEffect(() => {
        const subscription = theme$.subscribe(setthemeState);
        const subscription2 = lang$.subscribe((lang) => {
            setLangIndex(lang === 'ru' ? 0 : 1);
        });
        const subscription3 = fontSize$.subscribe((fontSize) => {
            setFSize(fontSize);
        });
        return () => {
            subscription.unsubscribe();
            subscription2.unsubscribe();
            subscription3.unsubscribe();
        }
    }, []);

    const menuItems = [
        {
            id: 0,
            icon: '🌬️',
            title: langIndex === 0 ? 'Дыхание' : 'Breathing',
            subtitle: langIndex === 0 ? 'Практики для сна и спокойствия' : 'Exercises for sleep & calm',
            color: '#4DFF88', // Green
            action: () => { setPage('RecoveryBreath'); setRecoveryType(0); }
        },
        {
            id: 1,
            icon: '🧘',
            title: langIndex === 0 ? 'Медитация' : 'Meditation',
            subtitle: langIndex === 0 ? 'Концентрация и осознанность' : 'Focus & Mindfulness',
            color: '#A64DFF', // Purple
            action: () => { setPage('RecoveryBreath'); setRecoveryType(1); }
        },
        {
            id: 2,
            icon: '💧',
            title: langIndex === 0 ? 'Закаливание' : 'Cold Exposure',
            subtitle: langIndex === 0 ? 'Иммунитет и энергия' : 'Immunity & Energy',
            color: '#00E5FF', // Cyan
            action: () => { setPage('RecoveryBreath'); setRecoveryType(2); }
        }
    ];

    const containerAnim = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.09 } }
    };

    const itemAnim = {
        hidden: { opacity: 0, y: 15, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
    };

    return (
        <div style={styles(theme).container}>
            <div style={{ height: '16vh' }} /> 
            <img
        src={'images/Meditate.png'}
        style={{

            position: 'absolute', // anchors to the Header, not the screen
            top: '665px',         // Moves it UP to sit on the edge
            left: '230px',         // Anchors it to the left side
            width: '140px',       // Set a fixed size or % of the header
            zIndex: 10,
            filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.3))' // Optional shadow
        }}
        alt="Mascot"
    />
            <div style={styles(theme).scrollView}>
                <motion.div
                    variants={containerAnim}
                    initial="hidden"
                    animate="show"
                    style={styles(theme).grid}
                >
                    {menuItems.map((item, index) => (
                        <MenuCard
                            key={item.id}
                            item={item}
                            theme={theme}
                            variants={itemAnim}
                            fSize={fSize}
                            info={getDaylyFinishedExercises(index)}
                        />
                    ))}
                </motion.div>
                
                <div style={{ height: '10vh', width: '100%' }} />
            </div>
        </div>
    )
}

function MenuCard({ item, theme, variants, fSize, info }) {
    const isDark = theme === 'dark';

    const cardStyle = {
        position: 'relative',
        width: '100%',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        boxSizing: 'border-box',
        borderRadius: '24px',
        overflow: 'hidden',
        marginBottom: '12px',
        // Exact styling match from MainMenu
        backgroundColor: isDark 
            ? Colors.get('simplePanel', theme) + '99' 
            : '#FFFFFF',
        backdropFilter: isDark ? 'blur(40px)' : 'none',
        border: `1px solid ${isDark ? Colors.get('border', theme) + '30' : '#E5E7EB'}`,
        boxShadow: isDark 
            ? '0 8px 20px 0 rgba(0, 0, 0, 0.4), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)' 
            : '0 4px 10px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
    };

    const iconWrapperStyle = {
        width: '48px',
        height: '48px',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        flexShrink: 0,
        fontSize:'28px',
        backgroundColor: isDark 
            ? Colors.get('background', theme) + '80' 
            : Colors.get('background', theme),
        color: item.color,
        border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)'
    };

    return (
        <motion.div
            variants={variants}
            whileTap={{ scale: 0.97 }}
            onClick={item.action}
            style={cardStyle}
        >
            <div style={iconWrapperStyle}>
                {item.icon}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flexGrow: 1, overflow: 'hidden' }}>
                <h4 style={{ 
                    ...styles(theme, fSize).title, 
                    color: Colors.get('mainText', theme), 
                    margin: 0, 
                    fontWeight: isDark ? '900' : '700' 
                }}>
                    {item.title}
                </h4>
                <div style={{ 
                    ...styles(theme, fSize).subtitle, 
                    color: Colors.get('subText', theme), 
                    opacity: isDark ? 0.6 : 0.8,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }}>
                    {item.subtitle}
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                {info && (
                    <div style={{
                        padding: '4px 10px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '700',
                        color: Colors.get('perfect', theme),
                        marginRight: '8px'
                    }}>
                        {info}
                    </div>
                )}
                <FaChevronRight size={14} color={Colors.get('subText', theme)} style={{ opacity: 0.3 }} />
            </div>
        </motion.div>
    );
}

export default RecoveryMain

const getDaylyFinishedExercises = (index) => {
    const data = AppData.recoveryProtocols[index];
    let allSessions = 0;
    let doneSessions = 0;
    if (!data) return '';
    
    for (let i = 0; i < data.length; i++) {
        const protocol = data[i];
        for (let j = 0; j < protocol.length; j++) {
            const levels = protocol[j];
            levels.forEach(el => {
                allSessions++;
                if (el === true) doneSessions++;
            });
        }
    }
    return doneSessions + '/' + allSessions;
}

const styles = (theme, fontSize) => ({
    container: {
        backgroundColor: Colors.get('background', theme),
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        fontFamily: "Segoe UI",
        overflow: 'hidden'
    },
    scrollView: {
        width: "100vw",
        maxHeight: "90vh",
        overflowY: "scroll",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    grid: {
        width: '92%',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginTop: '15px'
    },
    title: {
        fontFamily: 'Segoe UI',
        fontSize: fontSize === 0 ? '19px' : '21px',
        letterSpacing: '0.2px'
    },
    subtitle: {
        fontFamily: 'Segoe UI',
        fontWeight: '500',
        fontSize: fontSize === 0 ? '12px' : '14px',
        marginTop: '2px'
    }
})