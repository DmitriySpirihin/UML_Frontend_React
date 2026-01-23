import React, { useState, useEffect, useMemo } from 'react';
import { AppData } from '../StaticClasses/AppData.js';
import Colors from '../StaticClasses/Colors';
import { theme$, lang$, fontSize$ } from '../StaticClasses/HabitsBus';
import { FaFire, FaUtensils, FaInfoCircle } from 'react-icons/fa';

// 0 – набор, 1 – похудение, 2 – поддержание
const GOALS_CONFIG = {
    gain: {
        id: 0,
        titleRu: 'Набор массы',
        titleEn: 'Muscle Gain',
        kcalMinFactor: 1.1,
        kcalMaxFactor: 1.15,
        macrosRu: '1.8–2.2 г / 1 г / 4–6 г',
        macrosEn: '1.8–2.2 g / 1 g / 4–6 g',
    },
    strength: {
        id: 1,
        titleRu: 'Сила',
        titleEn: 'Strength',
        kcalMinFactor: 1.1,
        kcalMaxFactor: 1.15,
        macrosRu: '1.8–2.2 г / 1 г / 4–6 г',
        macrosEn: '1.8–2.2 g / 1 g / 4–6 g',
    },
    cut: {
        id: 2,
        titleRu: 'Похудение',
        titleEn: 'Weight Loss',
        kcalMinFactor: 0.85,
        kcalMaxFactor: 0.9,
        macrosRu: '1.6–2 г / 0.8 г / 2–3 г',
        macrosEn: '1.6–2 g / 0.8 g / 2–3 g',
    },
    maintain: {
        id: 3,
        titleRu: 'Поддержание',
        titleEn: 'Maintenance',
        kcalMinFactor: 1,
        kcalMaxFactor: 1,
        macrosRu: '1.2–1.6 г / 1 г / 4 г',
        macrosEn: '1.2–1.6 g / 1 g / 4 g',
    },
};

const RecomendationMeasurements = ({ bmi, trains }) => {
    const [theme, setTheme] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [goal, setGoal] = useState(AppData.pData.goal);

    const tdee = useMemo(() => getTDEE(bmi, trains), [bmi, trains]);

    useEffect(() => {
        const s1 = theme$.subscribe(setTheme);
        const s2 = lang$.subscribe(lang => setLangIndex(lang === 'ru' ? 0 : 1));
        const s3 = fontSize$.subscribe(setFSize);
        return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); };
    }, []);

    const currentGoalConfig = useMemo(() => {
        return Object.values(GOALS_CONFIG).find(g => g.id === goal) ?? GOALS_CONFIG.gain;
    }, [goal]);

    const isRu = langIndex === 0;
    const isLight = theme === 'light' || theme === 'speciallight';

    // Logic for Calorie Range
    const kcalMin = Math.round(tdee * currentGoalConfig.kcalMinFactor);
    const kcalMax = Math.round(tdee * currentGoalConfig.kcalMaxFactor);
    const kcalText = currentGoalConfig.kcalMinFactor === currentGoalConfig.kcalMaxFactor
        ? `${kcalMin}`
        : `${kcalMin} - ${kcalMax}`;

    // Logic for Parsing Macros String (e.g. "1.8–2.2 g / 1 g / 4–6 g")
    const rawMacros = isRu ? currentGoalConfig.macrosRu : currentGoalConfig.macrosEn;
    const macroParts = rawMacros.split('/').map(s => s.trim());
    
    // Fallback if split fails, though config is static
    const proteinVal = macroParts[0] || '-';
    const fatsVal = macroParts[1] || '-';
    const carbsVal = macroParts[2] || '-';

    const stylesObj = styles(theme, fSize, isLight);

    return (
        <div style={stylesObj.container}>
            {/* Header Title */}
            <div style={stylesObj.headerTitle}>
                {isRu ? 'ПЛАН ПИТАНИЯ' : 'NUTRITION PLAN'}
            </div>

            {/* Main Nutrition Card */}
            <div style={stylesObj.card}>
                
                {/* Top Section: Goal & Calories */}
                <div style={stylesObj.topSection}>
                    <div style={stylesObj.goalBadge}>
                        {isRu ? currentGoalConfig.titleRu : currentGoalConfig.titleEn}
                    </div>
                    
                    <div style={stylesObj.calorieContainer}>
                        <FaFire style={{ color: '#FF6B6B', fontSize: '24px', marginBottom: '8px' }} />
                        <div style={stylesObj.calorieValue}>{kcalText}</div>
                        <div style={stylesObj.calorieLabel}>{isRu ? 'ккал / день' : 'kcal / day'}</div>
                    </div>
                </div>

                <div style={stylesObj.divider} />

                {/* Bottom Section: Macros Grid */}
                <div style={stylesObj.macrosGrid}>
                    <MacroBox 
                        label={isRu ? 'Белки' : 'Protein'} 
                        value={proteinVal} 
                        color="#4FACFE" 
                        theme={theme} 
                        isLight={isLight}
                    />
                    <MacroBox 
                        label={isRu ? 'Жиры' : 'Fats'} 
                        value={fatsVal} 
                        color="#FF9F43" 
                        theme={theme} 
                        isLight={isLight}
                    />
                    <MacroBox 
                        label={isRu ? 'Углеводы' : 'Carbs'} 
                        value={carbsVal} 
                        color="#2ECC71" 
                        theme={theme} 
                        isLight={isLight}
                    />
                </div>
            </div>

            <Disclaimer theme={theme} langIndex={langIndex} fSize={fSize} />
        </div>
    );
};

// --- Sub-components ---

const MacroBox = ({ label, value, color, theme, isLight }) => (
    <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px', borderRadius: '16px',
        backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
        flex: 1
    }}>
        <div style={{ fontSize: '11px', fontWeight: 'bold', color: color, textTransform: 'uppercase', marginBottom: '4px' }}>
            {label}
        </div>
        <div style={{ 
            fontSize: '14px', fontWeight: '700', 
            color: Colors.get('mainText', theme), 
            textAlign: 'center', lineHeight: '1.2' 
        }}>
            {value}
        </div>
    </div>
);

const Disclaimer = ({ theme, langIndex, fSize }) => {
    const isRu = langIndex === 0;
    const textRu = 'Рекомендации носят ознакомительный характер. При наличии заболеваний проконсультируйтесь с врачом.';
    const textEn = 'Recommendations are for informational purposes only. Consult a doctor if you have medical conditions.';

    return (
        <div style={{ 
            display: 'flex', gap: '8px', padding: '15px 20px', alignItems: 'start',
            opacity: 0.6, marginTop: '5px' 
        }}>
            <FaInfoCircle style={{ marginTop: '2px', minWidth: '14px' }} color={Colors.get('subText', theme)} size={12} />
            <div style={{ fontSize: '11px', color: Colors.get('subText', theme), lineHeight: '1.4' }}>
                {isRu ? textRu : textEn}
            </div>
        </div>
    );
};

// --- Logic ---

const getTDEE = (bmr, weeklyTrainingDays = 3) => {
    const days = Math.min(7, Math.max(0, weeklyTrainingDays));
    let multiplier;
    if (days === 0) multiplier = 1.2;
    else if (days <= 2) multiplier = 1.375;
    else if (days <= 4) multiplier = 1.55;
    else if (days === 5) multiplier = 1.725;
    else multiplier = 1.9;
    return bmr * multiplier;
};

// --- Styles ---

const styles = (theme, fSize, isLight) => ({
    container: {
        width: '100%',
        maxWidth: '600px',
        margin: '0 auto',
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    headerTitle: {
        fontSize: '12px',
        fontWeight: '800',
        color: Colors.get('subText', theme),
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginLeft: '20px',
        marginBottom: '10px',
        opacity: 0.8
    },
    card: {
        backgroundColor: isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)',
        backdropFilter: 'blur(12px)',
        borderRadius: '24px',
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
        padding: '20px',
        boxShadow: isLight ? '0 10px 30px rgba(0,0,0,0.05)' : '0 10px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
    },
    topSection: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '20px'
    },
    goalBadge: {
        padding: '6px 12px',
        borderRadius: '20px',
        backgroundColor: Colors.get('currentDateBorder', theme),
        color: '#FFF',
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: '15px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
    },
    calorieContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    calorieValue: {
        fontSize: '36px',
        fontWeight: '900',
        color: Colors.get('mainText', theme),
        lineHeight: '1',
        letterSpacing: '-1px'
    },
    calorieLabel: {
        fontSize: '14px',
        color: Colors.get('subText', theme),
        fontWeight: '500',
        marginTop: '4px'
    },
    divider: {
        width: '100%',
        height: '1px',
        backgroundColor: Colors.get('border', theme),
        marginBottom: '20px',
        opacity: 0.5
    },
    macrosGrid: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px'
    }
});

export default RecomendationMeasurements;
