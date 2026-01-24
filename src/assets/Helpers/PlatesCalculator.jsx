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
        backgroundColor: color,
        borderRadius: '4px',
        marginRight: '2px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.3), 2px 2px 5px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        zIndex: 10 + index,
        position: 'relative'
    }
}

export default PlatesCalculator

const styles = (theme, fSize, isError) => ({
    backdrop: {
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 998
    },
    drawer: {
        position: 'fixed', bottom: 0, left: 0, width: '100%', maxHeight: '90vh',
        backgroundColor: Colors.get('bottomPanel', theme),
        borderTopLeftRadius: '25px', borderTopRightRadius: '25px',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.4)', zIndex: 999,
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
    },
    header: {
        height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    headerBtn: {
        padding: '10px', fontSize: '24px', color: Colors.get('icons', theme), cursor: 'pointer'
    },
    handleBar: {
        width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px'
    },
    contentContainer: {
        width: '100%', paddingBottom: '30px', flex: 1, overflowY: 'auto'
    },
    mainPanel: {
        display: 'flex', flexDirection: 'column', height: '100%', gap: '10px'
    },
    visualizerSection: {
        flex: 1, minHeight: '180px', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', position: 'relative'
    },
    barContainer: {
        display: 'flex', alignItems: 'center', padding: '0 20px'
    },
    barShaft: {
        width: '60px', height: '25px', backgroundColor: '#555', 
        borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    barWeightText: {
        color: '#fff', fontSize: '10px', opacity: 0.8
    },
    barSleeveContainer: {
        display: 'flex', alignItems: 'center'
    },
    barSleeveBase: {
        width: '5px', height: '35px', backgroundColor: '#777', borderRadius: '2px', marginRight: '1px'
    },
    barClip: {
        width: '5px', height: '25px', backgroundColor: '#444', marginLeft: '1px', borderRadius: '2px'
    },
    plateText: {
        fontSize: '9px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', 
        transform: 'rotate(-90deg)', whiteSpace: 'nowrap'
    },
    // Dynamic Error Style
    resultBadge: {
        marginTop: '15px', padding: '8px 16px', borderRadius: '20px',
        backgroundColor: isError ? 'rgba(231, 76, 60, 0.2)' : 'rgba(255,255,255,0.08)',
        border: isError ? '1px solid #e74c3c' : 'none',
        color: isError ? '#e74c3c' : Colors.get('mainText', theme), 
        fontSize: '14px', fontWeight: '600',
        transition: 'all 0.3s ease'
    },
    pickerSection: {
        height: '250px', position: 'relative', width: '100%',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        backgroundColor: 'rgba(0,0,0,0.1)'
    },
    drumContainer: {
        width: '100%', height: '100%', position: 'relative', overflow: 'hidden'
    },
    drumHighlight: {
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '80%', height: '50px', borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)', 
        borderTop: `1px solid ${Colors.get('done', theme)}`,
        borderBottom: `1px solid ${Colors.get('done', theme)}`,
        pointerEvents: 'none', zIndex: 10
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
        fontSize: '10px', color: Colors.get('icons', theme), opacity: 0.5,
        fontWeight: 'bold', letterSpacing: '1px'
    },
    footerAction: {
        display: 'flex', justifyContent: 'center', padding: '10px'
    },
    doneBtn: {
        width: '60px', height: '60px', borderRadius: '50%', border: 'none',
        backgroundColor: Colors.get('done', theme), color: '#fff',
        boxShadow: '0 4px 15px rgba(0,0,0,0.3)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    settingsPanel: {
        padding: '20px'
    },
    settingHeader: {
        fontSize: '12px', textTransform: 'uppercase', color: Colors.get('icons', theme), 
        marginBottom: '10px', letterSpacing: '1px'
    },
    stepperRow: {
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
        backgroundColor: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '16px'
    },
    stepperBtn: {
        width: '40px', height: '40px', borderRadius: '50%', border: 'none',
        backgroundColor: 'rgba(255,255,255,0.1)', color: Colors.get('mainText', theme),
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
    },
    stepperValue: {
        fontSize: '20px', fontWeight: 'bold', color: Colors.get('mainText', theme), minWidth: '80px', textAlign: 'center'
    },
    settingDivider: {
        height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '20px 0'
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
        transition: 'transform 0.1s'
    },
    plateCountControls: {
        display: 'flex', alignItems: 'center', gap: '8px', 
        color: Colors.get('mainText', theme), fontSize: '16px',
        backgroundColor: 'rgba(255,255,255,0.05)', padding: '2px 5px', borderRadius: '10px',marginBottom:'30px'
    }
})