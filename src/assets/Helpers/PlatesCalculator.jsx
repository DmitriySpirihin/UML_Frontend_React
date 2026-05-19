import { useState, useEffect, useRef, useMemo } from 'react'
import Colors from '../StaticClasses/Colors'
import { saveData } from '../StaticClasses/SaveHelper'
import { MdClose, MdDone, MdSettings, MdArrowBack } from 'react-icons/md'
import { FaPlus, FaMinus } from 'react-icons/fa'
import { AppData } from '../StaticClasses/AppData'

const PLATE_WEIGHTS = [50, 25, 20, 15, 10, 5, 2.5, 1.25];

const PlatesCalculator = ({ theme, langIndex, fSize, setShowCalculator }) => {
    // Data State
    const [ownPlates, setOwnPlates] = useState(AppData.ownPlates);
    const [platesAmount, setPlatesAmount] = useState(AppData.platesAmount);
    const [barWeight, setBarWeight] = useState(AppData.barWeight);
    const [weight, setWeight] = useState(40);
    
    // UI State
    const [plates, setPlates] = useState([]);
    const [plateString, setPlateString] = useState('');
    const [showSettings, setShowSettings] = useState(false);
    const [isError, setIsError] = useState(false);

    // 1. Calculate Maximum Possible Weight based on inventory
    const maxWeight = useMemo(() => {
        const platesTotal = ownPlates.reduce((acc, owned, i) => {
            return acc + (owned ? platesAmount[i] * PLATE_WEIGHTS[i] : 0);
        }, 0);
        return barWeight + platesTotal;
    }, [barWeight, ownPlates, platesAmount]);

    // 2. Auto-Cap Weight if inventory shrinks
    useEffect(() => {
        if (weight > maxWeight) {
            setWeight(maxWeight);
        }
    }, [maxWeight, weight]);

    // 3. Main Calculation Logic
    useEffect(() => {
        const targetOneSide = (weight - barWeight) / 2;
        
        // A. Weight too low
        if (targetOneSide < 0) {
            setPlates([]); 
            setPlateString(langIndex === 0 ? 'Вес меньше грифа' : 'Weight < Bar');
            setIsError(true);
            return;
        }

        let remaining = targetOneSide;
        const result = [];
        const available = PLATE_WEIGHTS.map((_, i) => ownPlates[i] ? platesAmount[i] / 2 : 0);

        for (let i = 0; i < PLATE_WEIGHTS.length; i++) {
            const plate = PLATE_WEIGHTS[i];
            // Epsilon for float safety
            while (remaining >= plate - 0.001 && available[i] > 0) {
                result.push(plate);
                remaining -= plate;
                available[i]--;
            }
        }
        
        setPlates(result);

        // B. Check for Impossible Increments (e.g. need 1.25kg but don't have it)
        if (remaining > 0.01) {
            const missing = remaining.toFixed(2);
            setPlateString(langIndex === 0 ? `Не хватает: ${missing} кг / сторона` : `Missing: ${missing} kg / side`);
            setIsError(true);
        } else {
            setIsError(false);
            if (result.length === 0) {
                setPlateString(langIndex === 0 ? 'Пустой гриф' : 'Empty Bar');
            } else {
                // Success: Format string
                const counts = {};
                result.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
                const sideStr = Object.entries(counts)
                    .sort((a,b) => parseFloat(b[0]) - parseFloat(a[0]))
                    .map(([k, v]) => v > 1 ? `${v}x${k}` : `${k}`)
                    .join(' + ');
                setPlateString(`${sideStr} / side`);
            }
        }
    }, [weight, barWeight, ownPlates, platesAmount, langIndex]);

    const onSaveAndClose = async () => {
        AppData.ownPlates = ownPlates;
        AppData.platesAmount = platesAmount;
        AppData.barWeight = barWeight;
        await saveData();
        setShowCalculator(false);
    }

    const currentStyles = styles(theme, fSize, isError);

    return (
        <>
            <div style={currentStyles.backdrop} onClick={onSaveAndClose}></div>
            <div style={currentStyles.drawer}>
                
                {/* --- Header --- */}
                <div style={currentStyles.header}>
                    <div style={currentStyles.headerBtn} onClick={showSettings ? () => setShowSettings(false) : onSaveAndClose}>
                        {showSettings ? <MdArrowBack /> : <MdClose />}
                    </div>
                    <div style={currentStyles.handleBar}></div>
                    <div style={currentStyles.headerBtn} onClick={() => setShowSettings(!showSettings)}>
                        <MdSettings style={{ opacity: showSettings ? 1 : 0.6 }}/>
                    </div>
                </div>

                {/* --- Content Switch --- */}
                <div style={currentStyles.contentContainer}>
                    {showSettings ? (
                        <SettingsView 
                            theme={theme} langIndex={langIndex}
                            barWeight={barWeight} setBarWeight={setBarWeight}
                            ownPlates={ownPlates} setOwnPlates={setOwnPlates}
                            platesAmount={platesAmount} setPlatesAmount={setPlatesAmount}
                            styles={currentStyles}
                        />
                    ) : (
                        <div style={currentStyles.mainPanel}>
                            {/* 1. Visualizer */}
                            <div style={currentStyles.visualizerSection}>
                                <BarVisualizer 
                                    plates={plates} 
                                    barWeight={barWeight} 
                                    theme={theme}
                                    styles={currentStyles}
                                />
                                <div style={currentStyles.resultBadge}>
                                    {plateString}
                                </div>
                            </div>

                            {/* 2. Drum Picker (Blocked at maxWeight) */}
                            <div style={currentStyles.pickerSection}>
                                <DrumPicker 
                                    theme={theme}
                                    value={weight}
                                    min={barWeight}
                                    max={maxWeight} // Physically limits the scroll
                                    step={2.5} 
                                    onChange={setWeight}
                                    styles={currentStyles}
                                />
                                {/* Max Weight Info */}
                                <div style={currentStyles.maxWeightLabel}>
                                    MAX: {maxWeight} kg
                                </div>
                            </div>

                            {/* 3. Footer/Action */}
                            <div style={currentStyles.footerAction}>
                                <button style={currentStyles.doneBtn} onClick={onSaveAndClose}>
                                    <MdDone size={28} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

// --- Sub-Components ---

// 1. Drum Picker
const DrumPicker = ({ theme, value, min, max, step, onChange, styles }) => {
    const scrollRef = useRef(null);
    const itemHeight = 50; 
    
    // Generate weights
    const weights = useMemo(() => {
        const arr = [];
        for(let i = min; i <= max + 0.01; i += step) {
             // rounding to avoid 42.500000001
            arr.push(Math.round(i * 100) / 100);
        }
        return arr;
    }, [min, max, step]);

    // Handle User Scroll
    const handleScroll = (e) => {
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / itemHeight);
        if(weights[index] !== undefined && weights[index] !== value) {
            onChange(weights[index]);
        }
    };

    // Handle External Updates (e.g. Auto-Cap)
    useEffect(() => {
        if(scrollRef.current) {
            const index = weights.indexOf(value);
            if(index !== -1) {
                // Check if we are far off to prevent fighting user scroll
                const currentScroll = scrollRef.current.scrollTop;
                const targetScroll = index * itemHeight;
                if (Math.abs(currentScroll - targetScroll) > itemHeight) {
                    scrollRef.current.scrollTo({
                        top: targetScroll,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [value, weights]);

    return (
        <div style={styles.drumContainer}>
            <div style={styles.drumHighlight}></div>
            <div 
                ref={scrollRef}
                style={styles.drumScrollArea} 
                onScroll={handleScroll}
            >
                <div style={{height: `${itemHeight * 2}px`}}></div>
                {weights.map((w) => {
                   const isSelected = w === value;
                   return (
                        <div key={w} style={{
                            ...styles.drumItem, 
                            height: `${itemHeight}px`,
                            color: isSelected ? Colors.get('mainText', theme) : Colors.get('icons', theme),
                            opacity: isSelected ? 1 : 0.3,
                            transform: isSelected ? 'scale(1.1)' : 'scale(0.9)',
                            fontWeight: isSelected ? 'bold' : 'normal'
                        }}>
                            {w} <span style={{fontSize: '12px', marginLeft:'2px'}}>kg</span>
                        </div>
                   )
                })}
                <div style={{height: `${itemHeight * 2}px`}}></div>
            </div>
        </div>
    )
}

// 2. Visualizer
const BarVisualizer = ({ plates, barWeight, theme, styles }) => {
    return (
        <div style={styles.barContainer}>
            <div style={styles.barShaft}>
                <div style={styles.barWeightText}>{barWeight}</div>
            </div>
            <div style={styles.barSleeveContainer}>
                <div style={styles.barSleeveBase}></div>
                {plates.map((val, idx) => (
                    <div key={idx} style={getPlateStyle(val, idx, theme)}>
                        <span style={styles.plateText}>{val}</span>
                    </div>
                ))}
                <div style={styles.barClip}></div>
            </div>
        </div>
    )
}

// 3. Settings View
const SettingsView = ({ theme, langIndex, barWeight, setBarWeight, ownPlates, setOwnPlates, platesAmount, setPlatesAmount, styles }) => {
    return (
        <div style={styles.settingsPanel}>
            <div style={styles.settingHeader}>{langIndex === 0 ? 'Гриф' : 'Bar Weight'}</div>
            <div style={styles.stepperRow}>
                 <div style={styles.stepperBtn} onClick={() => setBarWeight(Math.max(0, barWeight - 2.5))}><FaMinus/></div>
                 <span style={styles.stepperValue}>{barWeight} <small>kg</small></span>
                 <div style={styles.stepperBtn} onClick={() => setBarWeight(barWeight + 2.5)}><FaPlus/></div>
            </div>
            
            <div style={styles.settingDivider}></div>
            
            <div style={styles.settingHeader}>{langIndex === 0 ? 'Ваши блины' : 'Available Plates'}</div>
            <div style={styles.platesGrid}>
                {platesAmount.map((amount, idx) => (
                    <div key={idx} style={styles.plateConfigItem}>
                         <div 
                            onClick={() => setOwnPlates(prev => { const n = [...prev]; n[idx] = !n[idx]; return n; })}
                            style={{
                                ...styles.plateConfigCircle,
                                backgroundColor: ownPlates[idx] ? getPlateColor(PLATE_WEIGHTS[idx]) : 'transparent',
                                border: ownPlates[idx] ? 'none' : `2px solid ${Colors.get('icons', theme)}`,
                                opacity: ownPlates[idx] ? 1 : 0.4
                            }}
                         >
                             {PLATE_WEIGHTS[idx]}
                         </div>
                         
                         {ownPlates[idx] && (
                             <div style={styles.plateCountControls}>
                                 <FaMinus size={10} onClick={() => setPlatesAmount(prev => { const n = [...prev]; n[idx] = Math.max(2, n[idx]-2); return n; })} />
                                 <span>{amount}</span>
                                 <FaPlus size={10} onClick={() => setPlatesAmount(prev => { const n = [...prev]; n[idx] = Math.min(30, n[idx]+2); return n; })} />
                             </div>
                         )}
                    </div>
                ))}
            </div>
        </div>
    )
}

// --- Helpers ---
const getPlateColor = (weight) => {
    switch(parseFloat(weight)) {
        case 50: return '#1ea035'; 
        case 25: return '#a42b2b'; 
        case 20: return '#173894'; 
        case 15: return '#f6b93b'; 
        case 10: return '#14aa87'; 
        case 5: return '#2496c4';     
        case 2.5: return '#8f24c4';
        case 1.25: return '#c83131';
        default: return '#555';
    }
}

const getPlateStyle = (weight, index, theme) => {
    const color = getPlateColor(weight);
    const heights = { 50: 120, 25: 120, 20: 110, 15: 100, 10: 85, 5: 70, 2.5: 60, 1.25: 50 };
    const widths = { 50: 35, 25: 35, 20: 30, 15: 28, 10: 25, 5: 20, 2.5: 18, 1.25: 15 }; 
    
    return {
        height: `${heights[weight]}px`,
        width: `${widths[weight]}px`,
        background: `linear-gradient(145deg, rgba(255,255,255,0.22), ${color} 34%, rgba(0,0,0,0.24))`,
        borderRadius: '5px',
        marginRight: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.28), inset 0 -10px 18px rgba(0,0,0,0.18), 0 10px 24px -18px ${color}`,
        border: '1px solid rgba(255,255,255,0.22)',
        zIndex: 10 + index,
        position: 'relative'
    }
}

export default PlatesCalculator

const styles = (theme, fSize, isError) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('icons', theme);
    const accent = Colors.get('done', theme);
    const border = isLight ? 'rgba(15,23,42,0.11)' : 'rgba(150,210,255,0.16)';
    const panel = isLight ? 'rgba(255,255,255,0.58)' : 'rgba(23,57,84,0.55)';
    const panelSoft = isLight ? 'rgba(255,255,255,0.38)' : 'rgba(255,255,255,0.055)';

    return {
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: isLight
            ? 'rgba(232,238,246,0.52)'
            : 'radial-gradient(620px 420px at 50% 100%, rgba(35,150,255,0.16), transparent 62%), rgba(0,0,0,0.62)',
        backdropFilter: 'blur(10px) saturate(135%)',
        WebkitBackdropFilter: 'blur(10px) saturate(135%)',
        zIndex: 998
    },
    drawer: {
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 'min(100%, 660px)', height: '90vh',
        background: isLight
            ? 'linear-gradient(155deg, rgba(255,255,255,0.76), rgba(224,237,250,0.50))'
            : 'linear-gradient(155deg, rgba(39,75,105,0.64), rgba(15,45,70,0.58) 56%, rgba(12,30,48,0.70))',
        borderTopLeftRadius: '30px', borderTopRightRadius: '30px',
        border: `1px solid ${border}`,
        borderBottom: 'none',
        boxShadow: isLight
            ? '0 -24px 60px -36px rgba(15,23,42,0.36), inset 0 1px 0 rgba(255,255,255,0.9)'
            : '0 -28px 70px -36px rgba(0,0,0,0.78), inset 0 1px 0 rgba(255,255,255,0.13), 0 0 90px rgba(37,160,255,0.14)',
        zIndex: 999,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        backdropFilter: 'blur(30px) saturate(160%)',
        WebkitBackdropFilter: 'blur(30px) saturate(160%)'
    },
    header: {
        height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 20px',
        borderBottom: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
        background: isLight ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.018)'
    },
    headerBtn: {
        width: 42, height: 42, borderRadius: 15,
        padding: 0, fontSize: '24px', color: sub, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${border}`,
        boxShadow: isLight ? '0 10px 24px -22px rgba(15,23,42,0.30)' : '0 12px 28px -24px rgba(0,0,0,0.78)'
    },
    handleBar: {
        width: '44px', height: '4px', backgroundColor: isLight ? 'rgba(15,23,42,0.18)' : 'rgba(190,219,255,0.20)', borderRadius: '999px',
        boxShadow: isLight ? 'none' : '0 0 18px rgba(130,195,255,0.16)'
    },
    contentContainer: {
        width: '100%', paddingBottom: '30px', flex: 1, overflowY: 'auto'
    },
    mainPanel: {
        display: 'flex', flexDirection: 'column', height: '100%', gap: '12px',
        background: isLight
            ? 'radial-gradient(360px 260px at 50% 19%, rgba(62,142,216,0.16), transparent 70%)'
            : 'radial-gradient(390px 280px at 50% 20%, rgba(54,154,241,0.18), transparent 72%)'
    },
    visualizerSection: {
        flex: 1, minHeight: '188px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', position: 'relative',
        margin: '0 24px',
        borderRadius: 26,
        background: isLight ? 'rgba(255,255,255,0.20)' : 'rgba(255,255,255,0.025)',
        border: `1px solid ${isLight ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.045)'}`,
        boxShadow: isLight ? 'inset 0 1px 0 rgba(255,255,255,0.55)' : 'inset 0 1px 0 rgba(255,255,255,0.055)'
    },
    barContainer: {
        display: 'flex', alignItems: 'center', padding: '12px 18px',
        borderRadius: 20,
        background: panelSoft,
        border: `1px solid ${border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
    },
    barShaft: {
        width: '60px', height: '25px',
        background: isLight ? 'linear-gradient(180deg, rgba(135,155,176,0.72), rgba(84,100,118,0.58))' : 'linear-gradient(180deg, rgba(156,179,202,0.42), rgba(74,92,110,0.48))', 
        borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -8px 12px rgba(0,0,0,0.16)'
    },
    barWeightText: {
        color: '#fff', fontSize: '10px', opacity: 0.8
    },
    barSleeveContainer: {
        display: 'flex', alignItems: 'center'
    },
    barSleeveBase: {
        width: '5px', height: '35px', background: 'linear-gradient(180deg, rgba(220,235,248,0.55), rgba(86,112,132,0.55))', borderRadius: '2px', marginRight: '1px'
    },
    barClip: {
        width: '5px', height: '25px', background: 'linear-gradient(180deg, rgba(210,230,246,0.34), rgba(49,68,84,0.70))', marginLeft: '1px', borderRadius: '2px'
    },
    plateText: {
        fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', 
        transform: 'rotate(-90deg)', whiteSpace: 'nowrap'
    },
    // Dynamic Error Style
    resultBadge: {
        marginTop: '14px', padding: '9px 18px', borderRadius: '999px',
        background: isError ? 'rgba(231, 76, 60, 0.16)' : panel,
        border: isError ? '1px solid rgba(231,76,60,0.72)' : `1px solid ${border}`,
        color: isError ? '#ff8b80' : text, 
        fontSize: '14px', fontWeight: '600',
        transition: 'all 0.3s ease',
        boxShadow: isError ? '0 16px 30px -24px rgba(231,76,60,0.65)' : '0 16px 32px -26px rgba(0,0,0,0.58), inset 0 1px 0 rgba(255,255,255,0.08)',
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)'
    },
    pickerSection: {
        height: '250px', position: 'relative',
        margin: '0 24px',
        width: 'calc(100% - 48px)',
        borderRadius: 26,
        border: `1px solid ${border}`,
        background: isLight ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.028)',
        boxShadow: isLight ? 'inset 0 1px 0 rgba(255,255,255,0.62)' : 'inset 0 1px 0 rgba(255,255,255,0.055)',
        overflow: 'hidden'
    },
    drumContainer: {
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden'
    },
    drumHighlight: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '82%', height: '52px', borderRadius: '16px',
        background: isError ? 'rgba(231,76,60,0.11)' : panel,
        border: `1px solid ${isError ? 'rgba(231,76,60,0.58)' : `${accent}78`}`,
        boxShadow: isError ? '0 12px 30px -24px rgba(231,76,60,0.65), inset 0 1px 0 rgba(255,255,255,0.08)' : `0 16px 36px -26px ${accent}88, inset 0 1px 0 rgba(255,255,255,0.10)`,
        pointerEvents: 'none', zIndex: 10,
        backdropFilter: 'blur(18px) saturate(150%)',
        WebkitBackdropFilter: 'blur(18px) saturate(150%)'
    },
    drumScrollArea: {
        width: '100%', height: '100%', overflowY: 'scroll',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none', msOverflowStyle: 'none',
        '::-webkit-scrollbar': { display: 'none' }
    },
    drumItem: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', transition: 'all 0.2s ease',
        scrollSnapAlign: 'center',
        cursor: 'pointer'
    },
    maxWeightLabel: {
        position: 'absolute', bottom: '10px', right: '20px',
        fontSize: '10px', color: sub, opacity: 0.58,
        fontWeight: 'bold', letterSpacing: '1px'
    },
    footerAction: {
        display: 'flex', justifyContent: 'center', padding: '8px 10px 10px'
    },
    doneBtn: {
        width: '60px', height: '60px', borderRadius: '50%',
        border: `1px solid ${accent}88`,
        background: `linear-gradient(145deg, ${accent}, #12b7a5)`, color: '#fff',
        boxShadow: `0 18px 42px -18px ${accent}AA, inset 0 1px 0 rgba(255,255,255,0.22)`, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        outline: 'none'
    },
    settingsPanel: {
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14
    },
    settingHeader: {
        fontSize: '12px', textTransform: 'uppercase', color: sub, 
        marginBottom: '10px', letterSpacing: '1px'
    },
    stepperRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
        background: panelSoft, padding: '15px', borderRadius: '18px',
        border: `1px solid ${border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
    },
    stepperBtn: {
        width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${border}`,
        background: isLight ? 'rgba(255,255,255,0.48)' : 'rgba(255,255,255,0.08)', color: text,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    stepperValue: {
        fontSize: '20px', fontWeight: 'bold', color: text, minWidth: '80px', textAlign: 'center'
    },
    settingDivider: {
        height: '1px', backgroundColor: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)', margin: '6px 0'
    },
    platesGrid: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px'
    },
    plateConfigItem: {
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
    },
    plateConfigCircle: {
        width: '75px', height: '75px', borderRadius: '50%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: '12px', color: '#fff', cursor: 'pointer',
        transition: 'transform 0.1s',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 14px 28px -22px rgba(0,0,0,0.64)'
    },
    plateCountControls: {
        display: 'flex', alignItems: 'center', gap: '8px', 
        color: text, fontSize: '16px',
        background: panelSoft, padding: '3px 7px', borderRadius: '10px', marginBottom: '30px',
        border: `1px solid ${border}`
    }
    };
};
