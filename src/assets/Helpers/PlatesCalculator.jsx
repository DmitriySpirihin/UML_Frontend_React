import { useState, useEffect } from 'react'
import Colors from '../StaticClasses/Colors'
import { saveData } from '../StaticClasses/SaveHelper'
import { MdClose, MdDone } from 'react-icons/md'
import { FaCaretLeft, FaCaretRight, FaPlus, FaMinus } from 'react-icons/fa'
import MyNumInput from '../Helpers/MyNumInput'
import { AppData } from '../StaticClasses/AppData'

const PLATE_WEIGHTS = [50, 25, 20, 15, 10, 5, 2.5, 1.25];

const PlatesCalculator = ({ theme, langIndex, fSize, setShowCalculator }) => {
    const [ownPlates, setOwnPlates] = useState(AppData.ownPlates);
    const [platesAmount, setPlatesAmount] = useState(AppData.platesAmount);
    const [barWeight, setBarWeight] = useState(AppData.barWeight);
    const [weight, setWeight] = useState(40);
    const [plates, setPlates] = useState([]);
    const [plateString, setPlateString] = useState('');

    // --- Logic Functions (Unchanged) ---
    const getPlatesString = () => {
        const plateWeights = [50, 25, 20, 15, 10, 5, 2.5, 1.25];
        const targetOneSide = (weight - barWeight) / 2;

        if (targetOneSide < 0) {
            return langIndex === 0 ? 'Вес меньше грифа!' : 'Weight less than bar!';
        }
        if (!Number.isInteger(targetOneSide * 100)) {
            return langIndex === 0 ? 'Невозможный вес (не кратен 2.5 кг)!' : 'Impossible weight (not multiple of 2.5 kg)!';
        }

        let remaining = targetOneSide;
        const result = [];
        const available = plateWeights.map((_, i) =>
            ownPlates[i] ? platesAmount[i] / 2 : 0
        );

        for (let i = 0; i < plateWeights.length; i++) {
            const plate = plateWeights[i];
            while (remaining >= plate && available[i] > 0) {
                result.push(plate);
                remaining -= plate;
                available[i]--;
            }
        }

        const tolerance = 0.01;
        if (Math.abs(remaining) > tolerance) {
            return langIndex === 0
                ? `Недостаточно пластин! Осталось: ${remaining.toFixed(2)} кг`
                : `Not enough plates! Left: ${remaining.toFixed(2)} kg`;
        }

        return `${barWeight} +  ((  ${result.join(' + ')}) x 2) =   ${weight}` || (langIndex === 0 ? 'Без пластин' : 'No plates');
    };

    const onAccept = () => {
        const targetOneSide = (weight - barWeight) / 2;

        if (targetOneSide < 0 || !Number.isInteger(targetOneSide * 100)) {
            setPlates([]);
            return;
        }

        let remaining = targetOneSide;
        const result = [];
        const available = PLATE_WEIGHTS.map((_, i) =>
            ownPlates[i] ? platesAmount[i] / 2 : 0
        );

        for (let i = 0; i < PLATE_WEIGHTS.length; i++) {
            const plate = PLATE_WEIGHTS[i];
            while (remaining >= plate - 0.01 && available[i] > 0) {
                result.push(plate);
                remaining -= plate;
                available[i]--;
            }
        }

        const tolerance = 0.01;
        if (Math.abs(remaining) <= tolerance) {
            setPlates(result);
        } else {
            setPlates([]);
        }
        setPlateString(getPlatesString());
    };

    const onBack = async () => {
        AppData.ownPlates = ownPlates;
        AppData.platesAmount = platesAmount;
        AppData.barWeight = barWeight;
        await saveData();
        setShowCalculator(false);
    }

    const currentStyles = styles(theme, fSize);

    return (
        <div style={currentStyles.cP}>
            
            {/* --- Top Section: Equipment Settings --- */}
            <div style={currentStyles.card}>
                <div style={currentStyles.cardHeader}>
                    {langIndex === 0 ? 'ваше оборудование' : 'Your equipment'}
                </div>
                
                {/* Horizontal Scrolling List for Plates */}
                <div style={currentStyles.plateScrollContainer}>
                    {platesAmount.map((size, index) => (
                        <div key={index} style={currentStyles.plateControlColumn}>
                            {/* Toggle Button */}
                            <ChoosenPlate 
                                onClick={() => { setOwnPlates(prev => prev.map((plate, i) => (i === index ? !plate : plate))); }}
                                index={index} 
                                ownPlate={ownPlates[index]} 
                                theme={theme}
                            />
                            
                            {/* Quantity Controls */}
                            <div style={currentStyles.quantityControl}>
                                <button 
                                    style={currentStyles.miniButton}
                                    onClick={() => { if(ownPlates[index]){ setPlatesAmount(prev => prev.map((plate, i) => (i === index ? plate + 2 < 30 ? plate + 2 : plate : plate))); }}}
                                >
                                    <FaPlus style={{ fontSize: '10px' }}/>
                                </button>
                                
                                <span style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 'bold',
                                    color: ownPlates[index] ? Colors.get('mainText', theme) : '#666'
                                }}>
                                    {ownPlates[index] ? platesAmount[index] : 0}
                                </span>
                                
                                <button 
                                    style={currentStyles.miniButton}
                                    onClick={() => {if(ownPlates[index]){ setPlatesAmount(prev => prev.map((plate, i) => (i === index ? plate - 2 > 2 ? plate - 2 : 2 : plate))); }}}
                                >
                                    <FaMinus style={{ fontSize: '10px' }}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bar Weight Selector */}
                <div style={currentStyles.barWeightRow}>
                   <span style={{ fontSize: '14px', opacity: 0.7 }}>{langIndex === 0 ? 'Гриф:' : 'Bar:'}</span>
                   <div style={currentStyles.stepper}>
                        <FaCaretLeft onClick={() => {setBarWeight(prev => prev - 2.5 > 0 ? prev - 2.5 : 0)}} style={currentStyles.iconBtn}/>
                        <div style={{fontSize:'18px', fontWeight:'bold', color:Colors.get('mainText', theme), minWidth: '60px', textAlign:'center'}}>
                            {barWeight} <span style={{fontSize:'12px'}}>{langIndex === 0 ? 'кг' : 'kg'}</span>
                        </div>
                        <FaCaretRight onClick={() => {setBarWeight(prev => prev + 2.5)}} style={currentStyles.iconBtn}/>
                   </div>
                </div>
            </div>

            {/* --- Bottom Section: Calculator & Visualizer --- */}
            <div style={{...currentStyles.card, flex: 1, justifyContent: 'space-evenly'}}>
                
                {/* Target Weight Input */}
                <div style={currentStyles.inputRow}>
                    <button style={currentStyles.roundBtn} onClick={() => {setWeight(prev => prev - 2.5 > barWeight ? prev - 2.5 : barWeight)}}>
                        <FaMinus />
                    </button>
                    
                    <MyNumInput 
                        theme={theme} 
                        w={'120px'} 
                        h={'45px'} 
                        afterPointer={langIndex === 0 ? 'кг' : 'kg'} 
                        fSize={24} 
                        placeholder={'0'} 
                        value={weight} 
                        onChange={(value) => {setWeight(parseFloat(value))}}
                    />
                    
                    <button style={currentStyles.roundBtn} onClick={() => {setWeight(prev => prev + 2.5)}}>
                        <FaPlus />
                    </button>
                </div>

                {/* Visualizer */}
                <div style={currentStyles.visualizerContainer}>
                    {/* Inner Bar */}
                    {plates.length > 0 && <div style={currentStyles.barEndCap}>{barWeight}</div>}
                    {plates.length > 0 && <div style={currentStyles.barSleeve}></div>}
                    
                    {/* Plates */}
                    {plates.map((weightValue, idx) => {
                        const plateIndex = PLATE_WEIGHTS.indexOf(weightValue);
                        return plateIndex !== -1 ? <Plate key={idx} index={plateIndex} /> : null;
                    })}
                    
                    {/* Outer Bar/Clip */}
                    {plates.length > 0 && <div style={currentStyles.barOuterSleeve}></div>}
                    {plates.length > 0 && <div style={currentStyles.barTip}></div>}

                    {/* Empty State Bar */}
                    {plates.length === 0 && (
                        <div style={{display:'flex', alignItems:'center'}}>
                            <div style={currentStyles.emptyBarMain}></div>
                            <div style={currentStyles.barSleeve}></div>
                            <div style={currentStyles.barTip}></div>
                        </div>
                    )}
                </div>

                {/* Result Text */}
                <div style={currentStyles.resultText}>
                    {plateString}
                </div>
            </div>
            
            {/* --- Footer Actions --- */}
            <div style={currentStyles.bottomBar}>
                <MdClose style={{ fontSize: '32px', cursor: 'pointer', color: Colors.get('icons', theme) }} onClick={() => { onBack() }} />
                <div style={{width:'1px', height:'24px', backgroundColor:Colors.get('icons', theme), opacity:0.3}}></div>
                <MdDone style={{ fontSize: '32px', cursor: 'pointer', color: Colors.get('done', theme) }} onClick={() => { onAccept() }} />
            </div>
        </div>
    )
}

export default PlatesCalculator

const styles = (theme, fSize) => ({
    cP: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: "center",
        justifyContent: "flex-start",
        gap: '15px',
        borderRadius: "24px",
        backgroundColor: Colors.get('bottomPanel', theme),
        width: "100%",
        height: "90vh",
        padding: '20px 0',
        boxSizing: 'border-box'
    },
    card: {
        display: 'flex',
        flexDirection: 'column',
        width: '92%',
        backgroundColor: 'rgba(0,0,0,0.15)', // Darker, cleaner background
        borderRadius: '20px',
        padding: '15px',
        boxSizing: 'border-box',
        alignItems: 'center',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    },
    cardHeader: {
        width: '100%',
        textAlign: 'center',
        marginBottom: '10px',
        textTransform: 'uppercase',
        fontSize: '12px',
        letterSpacing: '1px',
        opacity: 0.7,
        color: Colors.get('mainText', theme)
    },
    plateScrollContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        overflowX: 'auto',
        paddingBottom: '10px',
        gap: '12px',
        // Hide scrollbar for cleaner look
        msOverflowStyle: 'none', 
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': { display: 'none' }
    },
    plateControlColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        minWidth: '50px'
    },
    quantityControl: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: '12px',
        padding: '4px 0'
    },
    miniButton: {
        background: 'transparent',
        border: 'none',
        color: Colors.get('icons', theme),
        cursor: 'pointer',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    barWeightRow: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '15px',
        paddingTop: '15px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
    },
    stepper: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        padding: '5px 10px'
    },
    iconBtn: {
        fontSize: '24px',
        color: Colors.get('icons', theme),
        cursor: 'pointer'
    },
    inputRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '15px',
        width: '100%'
    },
    roundBtn: {
        width: '45px',
        height: '45px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: Colors.get('icons', theme),
        color: Colors.get('bottomPanel', theme), // Invert color for contrast
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
    },
    visualizerContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '140px', // Fixed height container
        width: '100%',
        overflow: 'hidden'
    },
    resultText: {
        textAlign: "center",
        fontSize: fSize === 0 ? '14px' : '16px',
        color: Colors.get('mainText', theme),
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '8px',
        width: '90%'
    },
    bottomBar: {
        width: '70%',
        minHeight: '60px',
        backgroundColor: 'rgba(0,0,0,0.2)',
        borderRadius: '30px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginBottom: '10px'
    },
    // Bar pieces
    barEndCap: {
        width: '40px',
        height: '30px',
        backgroundColor: '#6c6868',
        fontSize: '10px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px'
    },
    barSleeve: {
        width: '20px',
        height: '50px',
        backgroundColor: '#888',
        borderRadius: '2px',
        boxShadow: 'inset 2px 2px 5px rgba(0,0,0,0.3)'
    },
    barOuterSleeve: {
        width: '20px',
        height: '50px',
        backgroundColor: '#333',
        borderRadius: '2px'
    },
    barTip: {
        width: '15px',
        height: '30px',
        backgroundColor: '#6c6868'
    },
    emptyBarMain: {
        width: '120px',
        height: '25px',
        backgroundColor: '#6c6868',
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px'
    }
})

const Plate = ({ index }) => {
    // Original plate data
    const plates = ['50', '25', '20', '15', '10', '5', '2.5', '1.25'];
    // Adjusted widths for better scaling
    const platesWidth = ['40px', '35px', '30px', '30px', '25px', '20px', '18px', '14px'];
    // Adjusted heights (px instead of vw for consistency)
    const platesHeight = ['120px', '120px', '110px', '100px', '85px', '70px', '60px', '50px'];
    const colors = ['#2ba435', '#a42b2b', '#6c6c6c', '#a4942b', '#2b47a4', '#2b98a4', '#2ba44d', '#7e2ba4'];

    if (index < 0 || index >= plates.length) return null;

    return (
        <div style={{
            width: platesWidth[index],
            height: platesHeight[index],
            backgroundColor: colors[index],
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 1px',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.2), 2px 2px 4px rgba(0,0,0,0.3)', // 3D effect
            border: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold', transform: 'rotate(-90deg)' }}>
                {plates[index]}
            </div>
        </div>
    );
};

const ChoosenPlate = ({ index, ownPlate, theme, onClick }) => {
    const colors = ['#2ba435', '#a42b2b', '#6c6c6c', '#a4942b', '#2b47a4', '#2b98a4', '#2ba44d', '#7e2ba4'];
    const plates = ['50', '25', '20', '15', '10', '5', '2.5', '1.25'];
    
    return (
        <div 
            onClick={onClick} 
            style={{
                width: '45px',
                height: '45px',
                backgroundColor: ownPlate ? colors[index] : 'transparent',
                borderRadius: '50%',
                border: ownPlate ? 'none' : `2px solid ${Colors.get('icons', theme)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: ownPlate ? 1 : 0.4,
                boxShadow: ownPlate ? '0 4px 8px rgba(0,0,0,0.3)' : 'none'
            }}
        >
            <div style={{ 
                fontSize: '12px', 
                fontWeight: 'bold',
                color: ownPlate ? '#fff' : Colors.get('icons', theme) 
            }}>
                {plates[index]}
            </div>
        </div>
    )
}
