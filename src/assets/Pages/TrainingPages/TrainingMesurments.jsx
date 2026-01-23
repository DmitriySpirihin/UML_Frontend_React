import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppData, UserData } from '../../StaticClasses/AppData.js'
import { saveData } from '../../StaticClasses/SaveHelper.js'
import Colors from '../../StaticClasses/Colors'
import { theme$, lang$, fontSize$, premium$, setPage } from '../../StaticClasses/HabitsBus'
import { FaPlus, FaPencilAlt, FaTrash, FaChevronUp, FaChevronDown, FaCaretLeft,FaCaretRight } from 'react-icons/fa'
import { IoMdMale, IoMdFemale } from 'react-icons/io'
import { FiMinus,FiPlus } from 'react-icons/fi'
import { IoScaleSharp, IoPerson, IoCalendarOutline, IoAnalytics } from 'react-icons/io5'
import { MdClose, MdDone } from 'react-icons/md'
import { useLongPress } from '../../Helpers/LongPress'
import { MeasurmentsIcon } from '../../Helpers/MeasurmentsIcons.jsx'
import TrainingMeasurmentsOveview from './TrainingMeasurmentsOverView.jsx'
import TrainingMeasurmentsAnalitics from './TrainingMeasurmentsAnalitics.jsx'
import { VolumeTabs } from '../../Helpers/TrainingAnaliticsTabs';

// --- Constants ---
export const names = [
    ['Вес тела', 'Body weight'],
    ['Обхват талии', 'Waist circumference'],
    ['Обхват бицепса', 'Biceps circumference'],
    ['Обхват груди', 'Chest circumference'],
    ['Обхват бедра', 'Hip circumference'],
]

const now = new Date();
const months = [['янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сент', 'окт', 'нояб', 'дек'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']];
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health']]

const TrainingMesurments = () => {
    // --- STATE ---
    const [theme, setthemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    
    // Navigation & Data
    const [currentType, setCurrentType] = useState(-2);
    const [currentInd, setCurrentInd] = useState(-1);
    const [data, setData] = useState(AppData.measurements);
    const [tab, setTab] = useState('volume');

    // Modals
    const [showAddDayPanel, setShowAddDayPanel] = useState(false);
    const [showRedactPanel, setShowRedactPanel] = useState(false);
    const [showConfirmRemove, setShowConfirmRemove] = useState(false);
    const [showPersonalDataPanel, setShowPersonalDataPanel] = useState(false);

    // Constructor State (Date & Value)
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const [day, setDay] = useState(now.getDate());
    
    // Split Value State for "Drum Picker" logic
    const [valInt, setValInt] = useState(70);
    const [valDec, setValDec] = useState(0);

    // User Data
    const [filled, setFilled] = useState(AppData.pData.filled);
    const [age, setAge] = useState(AppData.pData.age);
    const [gender, setGender] = useState(AppData.pData.gender);
    const [height, setHeight] = useState(AppData.pData.height);
    const [wrist, setWrist] = useState(AppData.pData.wrist);
    const [goal, setGoal] = useState(AppData.pData.goal);

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        const s1 = theme$.subscribe(setthemeState);
        const s2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const s3 = fontSize$.subscribe(setFSize);
        const s4 = premium$.subscribe(setHasPremium);
        return () => { s1.unsubscribe(); s2.unsubscribe(); s3.unsubscribe(); s4.unsubscribe(); }
    }, []);

    // --- LOGIC ---
    const getMeasurementsCategory = (type) => (type < 0 || type >= AppData.measurements.length) ? [] : AppData.measurements[type];

    // Helper to combine Int + Dec into float
    const getCombinedValue = () => parseFloat(`${valInt}.${valDec}`);
    
    // Helper to set Int + Dec from float
    const setSplitValue = (floatVal) => {
        const val = parseFloat(floatVal) || 0;
        setValInt(Math.floor(val));
        setValDec(Math.round((val % 1) * 10));
    };

    const handleDateChange = (isIncr, dateType) => {
        // ... (Keep existing complex date logic) ...
        if (dateType === 2) { // Day
            setDay(prev => {
                const max = new Date(year, month, 0).getDate();
                let d = prev;
                if (isIncr) { if (prev < max && new Date(year, month - 1, prev + 1).getTime() <= now.getTime()) d = prev + 1; }
                else { if (prev > 1) d = prev - 1; }
                return d;
            });
        } else if (dateType === 1) { // Month
            setMonth(prev => {
                let m = prev;
                if (isIncr) { if (prev < 12 && new Date(year, prev, day).getTime() <= now.getTime()) m = prev + 1; }
                else { if (prev > 1) m = prev - 1; }
                const max = new Date(year, m, 0).getDate();
                if (day > max) setDay(max);
                return m;
            });
        } else if (dateType === 0) { // Year
            setYear(prev => {
                let y = prev;
                if (isIncr) { if (prev < now.getFullYear()) y = prev + 1; }
                else { if (prev > now.getFullYear() - 100) y = prev - 1; }
                const max = new Date(y, month, 0).getDate();
                if (day > max) setDay(max);
                return y;
            });
        }
    };

    // --- BINDINGS (Long Press) ---
    const bindYMinus = useLongPress(() => handleDateChange(false, 0));
    const bindYPlus = useLongPress(() => handleDateChange(true, 0));
    const bindMMinus = useLongPress(() => handleDateChange(false, 1));
    const bindMPlus = useLongPress(() => handleDateChange(true, 1));
    const bindDMinus = useLongPress(() => handleDateChange(false, 2));
    const bindDPlus = useLongPress(() => handleDateChange(true, 2));
    
    // Value Bindings
    const bindIntMinus = useLongPress(() => setValInt(p => p > 0 ? p - 1 : 0));
    const bindIntPlus = useLongPress(() => setValInt(p => p + 1));
    const bindDecMinus = useLongPress(() => setValDec(p => p > 0 ? p - 1 : 9));
    const bindDecPlus = useLongPress(() => setValDec(p => p < 9 ? p + 1 : 0));

    // --- CRUD ---
    const onAddDay = async () => {
        if (currentType === -1) return;
        const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
        const val = getCombinedValue();
        if (val <= 0) return;

        const newEntry = { date: newDateStr, value: val };
        const category = [...getMeasurementsCategory(currentType)];
        const existingIndex = category.findIndex(entry => entry.date === newDateStr);
        
        if (existingIndex >= 0) category[existingIndex] = newEntry;
        else category.push(newEntry);
        
        category.sort((a, b) => new Date(a.date) - new Date(b.date));
        AppData.measurements[currentType] = category;
        await saveData();
        setShowAddDayPanel(false); setData(AppData.measurements);
    };

    const onRedactConfirm = async () => {
        if (currentType === -1 || currentInd === -1) return;
        const newDateStr = new Date(year, month, day).toISOString().split('T')[0];
        const val = getCombinedValue();
        const category = [...getMeasurementsCategory(currentType)];
        category[currentInd] = { date: newDateStr, value: val };
        AppData.measurements[currentType] = category;
        await saveData();
        setShowRedactPanel(false); setData(AppData.measurements);
    };

    const onRemoveConfirm = async () => {
        const category = [...getMeasurementsCategory(currentType)];
        category.splice(currentInd, 1);
        AppData.measurements[currentType] = category;
        await saveData();
        setShowConfirmRemove(false); setData(AppData.measurements);
    };

    const openAdd = (e) => {
        e.stopPropagation();
        const lastVal = data[currentType].length > 0 ? data[currentType][data[currentType].length - 1].value : 0;
        setSplitValue(lastVal || 0);
        setShowAddDayPanel(true);
    };

    const openRedact = (ind) => {
        setCurrentInd(ind);
        setSplitValue(data[currentType][ind].value);
        setShowRedactPanel(true);
    };

    const onFillConfirm = async () => {
        AppData.pData = { filled: true, age, gender, height, wrist, goal };
        await saveData();
        setFilled(true); setShowPersonalDataPanel(false);
    };

    // --- Styles Helpers ---
    const isLight = theme === 'light' || theme === 'speciallight';
    const cardBg = isLight ? 'rgba(255,255,255,0.7)' : 'rgba(30,30,30,0.6)';
    const borderColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

    return (
        <div style={styles(theme).container}>
            <VolumeTabs type={1} theme={theme} langIndex={langIndex} activeTab={tab} onChange={setTab} />

            {tab === 'volume' && (
                <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
                    
                    {/* --- PERSONAL DATA (BENTO GRID) --- */}
                    <motion.div layout style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                        <div style={styles(theme).cardHeader} onClick={() => setCurrentType(p => p === -1 ? -2 : -1)}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={styles(theme).iconBox}><IoPerson size={18} color={Colors.get('mainText', theme)} /></div>
                                <span style={styles(theme, fSize).headerText}>{langIndex === 0 ? 'Личные данные' : 'Personal Data'}</span>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {currentType === -1 && <FaPencilAlt size={14} color={Colors.get('subText', theme)} onClick={(e) => {e.stopPropagation(); setShowPersonalDataPanel(true)}} />}
                                {currentType === -1 ? <FaChevronUp size={12} color={Colors.get('subText', theme)}/> : <FaChevronDown size={12} color={Colors.get('subText', theme)}/>}
                            </div>
                        </div>
                        <AnimatePresence>
                            {currentType === -1 && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '0 15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <StatCard label={langIndex===0?'Возраст':'Age'} value={age} sub={langIndex===0?'лет':'y.o.'} theme={theme} />
                                        <StatCard label={langIndex===0?'Пол':'Gender'} value={gender===0?(langIndex===0?'Муж':'Male'):(langIndex===0?'Жен':'Fem')} theme={theme} icon={gender===0?<IoMdMale/>:<IoMdFemale/>} />
                                        <StatCard label={langIndex===0?'Рост':'Height'} value={height} sub="cm" theme={theme} />
                                        <StatCard label={langIndex===0?'Цель':'Goal'} value={goalNames[goal][langIndex]} theme={theme} isWide />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* --- MEASUREMENTS LIST --- */}
                    {data.map((el, ind) => (
                        <motion.div key={ind} layout style={{ ...styles(theme).card, backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
                            <div style={styles(theme).cardHeader} onClick={() => setCurrentType(p => p === ind ? -2 : ind)}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={styles(theme).iconBox}>
                                        {ind > 0 ? MeasurmentsIcon.get(ind - 1, langIndex, theme) : <IoScaleSharp size={18} color={Colors.get('mainText', theme)} />}
                                    </div>
                                    <span style={styles(theme, fSize).headerText}>{names[ind][langIndex]}</span>
                                </div>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <span style={styles(theme).valueBadge}>
                                        {el.length > 0 ? (Number.isInteger(el[el.length-1].value) ? el[el.length-1].value : el[el.length-1].value.toFixed(1)) : '-'}
                                    </span>
                                    {currentType === ind ? <FaChevronUp size={12} color={Colors.get('subText', theme)}/> : <FaChevronDown size={12} color={Colors.get('subText', theme)}/>}
                                </div>
                            </div>
                            <AnimatePresence>
                                {currentType === ind && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
                                        <div style={{ padding: '0 15px 15px' }}>
                                            <motion.button whileTap={{scale:0.98}} onClick={openAdd} style={styles(theme).addBtn}>
                                                <FaPlus size={12}/> {langIndex === 0 ? 'Добавить замер' : 'Add Measurement'}
                                            </motion.button>
                                            
                                            <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column-reverse', gap: '8px'}}>
                                                {el.map((day, idx) => (
                                                    <div key={idx} style={styles(theme).historyRow}>
                                                        <div style={{flex: 1}}>
                                                            <div style={{fontSize:'12px', color:Colors.get('subText', theme), marginBottom:'2px'}}>{day.date}</div>
                                                            <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                                                <span style={{fontSize:'16px', fontWeight:'700', color:Colors.get('mainText', theme)}}>
                                                                    {Number.isInteger(day.value) ? day.value : day.value.toFixed(1)} 
                                                                    <span style={{fontSize:'12px', fontWeight:'400', marginLeft:'4px'}}>{ind === 0 ? (langIndex === 0 ? 'кг' : 'kg') : 'cm'}</span>
                                                                </span>
                                                                <DiffBadge data={data} type={ind} ind={idx} theme={theme} />
                                                            </div>
                                                        </div>
                                                        <div style={{display:'flex', gap:'15px'}}>
                                                            <FaPencilAlt size={14} color={Colors.get('subText', theme)} onClick={() => openRedact(idx)} style={{cursor:'pointer'}}/>
                                                            <FaTrash size={14} color="#ff4d4d" onClick={() => { setCurrentInd(idx); setShowConfirmRemove(true); }} style={{cursor:'pointer', opacity:0.8}}/>
                                                        </div>
                                                    </div>
                                                ))}
                                                {el.length === 0 && <div style={{textAlign:'center', fontSize:'13px', color:Colors.get('subText', theme), padding:'10px'}}>{langIndex===0?'Пусто':'Empty'}</div>}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}

            {tab === 'muscles' && <TrainingMeasurmentsOveview theme={theme} langIndex={langIndex} fSize={fSize} data={data} filled={filled} age={age} height={height} gender={gender} goal={goal} wrist={wrist} />}
            {tab === 'exercises' && <TrainingMeasurmentsAnalitics theme={theme} langIndex={langIndex} fSize={fSize} data={data} />}

            {/* --- MODALS (CONSTRUCTORS) --- */}
            <AnimatePresence>
                {/* 1. ADD / REDACT VALUE */}
                {(showAddDayPanel || showRedactPanel) && (
                    <BottomSheet onClose={() => { setShowAddDayPanel(false); setShowRedactPanel(false); }} theme={theme}>
                        <div style={styles(theme).modalHeader}>
                            <h3 style={styles(theme).modalTitle}>{langIndex === 0 ? (showAddDayPanel ? 'Новый замер' : 'Изменить') : (showAddDayPanel ? 'New Entry' : 'Edit Entry')}</h3>
                        </div>

                        {/* DATE PICKER (SLOT MACHINE) */}
                        <div style={styles(theme).sectionLabel}><IoCalendarOutline/> {langIndex === 0 ? 'Дата' : 'Date'}</div>
                        <div style={styles(theme).slotContainer}>
                            <SlotColumn value={year} onMinus={() => handleDateChange(false, 0)} onPlus={() => handleDateChange(true, 0)} bindMinus={bindYMinus} bindPlus={bindYPlus} theme={theme} width="80px" />
                            <div style={styles(theme).slotDivider}/>
                            <SlotColumn value={months[langIndex][month]} onMinus={() => handleDateChange(false, 1)} onPlus={() => handleDateChange(true, 1)} bindMinus={bindMMinus} bindPlus={bindMPlus} theme={theme} width="60px" />
                            <div style={styles(theme).slotDivider}/>
                            <SlotColumn value={day} onMinus={() => handleDateChange(false, 2)} onPlus={() => handleDateChange(true, 2)} bindMinus={bindDMinus} bindPlus={bindDPlus} theme={theme} width="50px" />
                        </div>

                        {/* VALUE PICKER (DRUM / TAPE MEASURE STYLE) */}
                        <div style={styles(theme).sectionLabel}><IoAnalytics/> {langIndex === 0 ? 'Значение' : 'Value'}</div>
                        <div style={{...styles(theme).slotContainer, marginBottom: '30px'}}>
                            <SlotColumn value={valInt} onMinus={() => setValInt(p=>p>0?p-1:0)} onPlus={() => setValInt(p=>p+1)} bindMinus={bindIntMinus} bindPlus={bindIntPlus} theme={theme} width="80px" isValue />
                            <div style={{fontSize:'30px', fontWeight:'bold', color:Colors.get('subText', theme), paddingBottom:'10px'}}>.</div>
                            <SlotColumn value={valDec} onMinus={() => setValDec(p=>p>0?p-1:9)} onPlus={() => setValDec(p=>p<9?p+1:0)} bindMinus={bindDecMinus} bindPlus={bindDecPlus} theme={theme} width="50px" isValue />
                            <div style={{fontSize:'16px', fontWeight:'bold', color:Colors.get('subText', theme), alignSelf:'center', marginLeft:'10px'}}>
                                {currentType === 0 ? (langIndex===0?'кг':'kg') : 'cm'}
                            </div>
                        </div>

                        <ModalActions 
                            onClose={() => { setShowAddDayPanel(false); setShowRedactPanel(false); }} 
                            onConfirm={showAddDayPanel ? onAddDay : onRedactConfirm} 
                            theme={theme} 
                        />
                    </BottomSheet>
                )}

                {/* 2. CONFIRM REMOVE */}
                {showConfirmRemove && (
                    <BottomSheet onClose={() => setShowConfirmRemove(false)} theme={theme}>
                        <div style={{textAlign:'center', padding:'20px'}}>
                            <div style={{fontSize:'40px', marginBottom:'10px'}}>🗑️</div>
                            <p style={{fontSize:'16px', fontWeight:'bold', color:Colors.get('mainText', theme)}}>{langIndex === 0 ? 'Удалить запись?' : 'Delete entry?'}</p>
                        </div>
                        <ModalActions onClose={() => setShowConfirmRemove(false)} onConfirm={onRemoveConfirm} theme={theme} isDanger />
                    </BottomSheet>
                )}

                {/* 3. PERSONAL DATA SETTINGS */}
                {showPersonalDataPanel && (
                    <BottomSheet onClose={() => setShowPersonalDataPanel(false)} theme={theme}>
                        <h3 style={styles(theme).modalTitle}>{langIndex === 0 ? 'Настройки' : 'Settings'}</h3>
                        <div style={{maxHeight:'50vh', overflowY:'auto', padding:'0 5px'}}>
                            <DataRow label={langIndex===0?'Возраст':'Age'} value={age} theme={theme} onMinus={() => setAge(p=>p>1?p-1:1)} onPlus={() => setAge(p=>p+1)} />
                            <div style={styles(theme).dataRow}>
                                <span style={styles(theme).dataLabel}>{langIndex===0?'Пол':'Gender'}</span>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <GenderToggle active={gender===0} icon={<IoMdMale/>} color="#5fb6c6" onClick={()=>setGender(0)} theme={theme}/>
                                    <GenderToggle active={gender===1} icon={<IoMdFemale/>} color="#c65f9d" onClick={()=>setGender(1)} theme={theme}/>
                                </div>
                            </div>
                            <DataRow label={langIndex===0?'Рост (см)':'Height (cm)'} value={height} theme={theme} onMinus={() => setHeight(p=>p>1?p-1:1)} onPlus={() => setHeight(p=>p+1)} />
                            <DataRow label={langIndex===0?'Запястье (см)':'Wrist (cm)'} value={wrist} theme={theme} onMinus={() => setWrist(p=>p>1?p-0.5:1)} onPlus={() => setWrist(p=>p+0.5)} />
                            <div style={styles(theme).dataRow}>
                                <span style={styles(theme).dataLabel}>{langIndex===0?'Цель':'Goal'}</span>
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <FaCaretLeft size={24} color={Colors.get('subText', theme)} onClick={()=>setGoal(p=>p<3?p+1:0)} />
                                    <span style={{width:'120px', textAlign:'center', fontWeight:'bold', color:Colors.get('mainText', theme)}}>{goalNames[goal][langIndex]}</span>
                                    <FaCaretRight size={24} color={Colors.get('subText', theme)} onClick={()=>setGoal(p=>p>0?p-1:3)} />
                                </div>
                            </div>
                        </div>
                        <ModalActions onClose={() => setShowPersonalDataPanel(false)} onConfirm={onFillConfirm} theme={theme} />
                    </BottomSheet>
                )}
            </AnimatePresence>

            {/* PREMIUM OVERLAY */}
            {!hasPremium && (
                <div 
                    onClick={(e) => e.stopPropagation()} 
                    style={{
                        position: 'absolute', inset: 0, zIndex: 2,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        backgroundColor: theme$.value === 'dark' ? 'rgba(10, 10, 10, 0.85)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(5px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{ color: theme$.value === 'dark' ? '#FFD700' : '#D97706', fontSize: '11px', fontWeight: 'bold', fontFamily: 'Segoe UI' }}>
                        {langIndex === 0 ? 'ТОЛЬКО ДЛЯ ПРЕМИУМ' : 'PREMIUM USERS ONLY'}
                    </div>
                </div>
            )}
        </div>
    )
}

// --- MODERN SUB COMPONENTS ---

const StatCard = ({ label, value, sub, theme, icon, isWide }) => (
    <div style={{
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
        borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        gridColumn: isWide ? 'span 2' : 'span 1'
    }}>
        <div style={{fontSize:'11px', color:Colors.get('subText', theme), textTransform:'uppercase', fontWeight:'700', marginBottom:'4px'}}>{label}</div>
        <div style={{fontSize:'18px', fontWeight:'800', color:Colors.get('mainText', theme), display:'flex', alignItems:'center', gap:'4px'}}>
            {icon} {value} <span style={{fontSize:'12px', fontWeight:'500', opacity:0.7}}>{sub}</span>
        </div>
    </div>
)

const DiffBadge = ({data, type, ind, theme}) => {
    if (ind < data[type].length - 1) {
        const diff = data[type][ind].value - data[type][ind+1].value; // New - Old
        if (diff === 0) return null;
        const isPos = diff > 0;
        return (
            <span style={{
                fontSize:'10px', fontWeight:'800', padding:'2px 6px', borderRadius:'6px',
                backgroundColor: isPos ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: isPos ? '#4CAF50' : '#F44336'
            }}>
                {isPos ? '+' : ''}{Number.isInteger(diff) ? diff : diff.toFixed(1)}
            </span>
        )
    }
    return null;
}

const BottomSheet = ({ children, onClose, theme }) => (
    <div style={styles(theme).backdrop} onClick={onClose}>
        <motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={styles(theme).sheet} onClick={e => e.stopPropagation()}
        >
            <div style={styles(theme).handle} />
            {children}
        </motion.div>
    </div>
)

const SlotColumn = ({ value, onMinus, onPlus, bindMinus, bindPlus, theme, width, isValue }) => (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', width: width}}>
        <motion.div {...bindPlus} whileTap={{scale:0.8}} onClick={onPlus} style={styles(theme).slotBtn}><FaChevronUp size={12}/></motion.div>
        <div style={{
            fontSize: isValue ? '32px' : '20px', fontWeight:'800', 
            color:Colors.get('mainText', theme), padding:'10px 0', 
            fontVariantNumeric: 'tabular-nums'
        }}>
            {value}
        </div>
        <motion.div {...bindMinus} whileTap={{scale:0.8}} onClick={onMinus} style={styles(theme).slotBtn}><FaChevronDown size={12}/></motion.div>
    </div>
)

const DataRow = ({ label, value, onMinus, onPlus, theme }) => (
    <div style={styles(theme).dataRow}>
        <span style={styles(theme).dataLabel}>{label}</span>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <motion.div whileTap={{scale:0.9}} onClick={onMinus} style={styles(theme).roundBtn}><FiMinus/></motion.div>
            <span style={{width:'40px', textAlign:'center', fontSize:'18px', fontWeight:'bold', color:Colors.get('mainText', theme)}}>{value}</span>
            <motion.div whileTap={{scale:0.9}} onClick={onPlus} style={styles(theme).roundBtn}><FiPlus/></motion.div>
        </div>
    </div>
)

const GenderToggle = ({ active, icon, color, onClick, theme }) => (
    <motion.div 
        whileTap={{scale:0.9}} onClick={onClick}
        style={{
            width:'50px', height:'50px', borderRadius:'14px', 
            backgroundColor: active ? color : (theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'),
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px',
            color: active ? '#fff' : Colors.get('subText', theme), border: active ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }}
    >
        {icon}
    </motion.div>
)

const ModalActions = ({ onClose, onConfirm, theme, isDanger }) => (
    <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
        <motion.button whileTap={{scale:0.95}} onClick={onClose} style={styles(theme).secBtn}><MdClose size={22}/></motion.button>
        <motion.button whileTap={{scale:0.95}} onClick={onConfirm} style={{...styles(theme).priBtn, backgroundColor: isDanger ? '#ff4d4d' : Colors.get('currentDateBorder', theme)}}><MdDone size={22}/></motion.button>
    </div>
)

const styles = (theme, fSize) => ({
    container: {
        display: 'flex', width: "100vw", flexDirection: 'column',
        overflowY: 'scroll', overflowX: 'hidden', alignItems: 'center',
        backgroundColor: Colors.get('background', theme), height: "92vh", marginTop:'100px', paddingTop: '10px'
    },
    card: {
        width: '94%', borderRadius: '24px', margin: '0 auto', overflow: 'hidden', transition: 'all 0.3s'
    },
    cardHeader: {
        padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer'
    },
    headerText: { fontSize: fSize===0?'16px':'18px', fontWeight:'700', color:Colors.get('mainText', theme) },
    iconBox: {
        width:'36px', height:'36px', borderRadius:'10px',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.1)',
        display:'flex', alignItems:'center', justifyContent:'center'
    },
    valueBadge: {
        fontSize:'14px', fontWeight:'700', padding:'4px 10px', borderRadius:'8px',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.1)',
        color:Colors.get('mainText', theme)
    },
    addBtn: {
        width:'100%', padding:'12px', borderRadius:'12px', border:'none',
        backgroundColor: Colors.get('currentDateBorder', theme), color:'#fff',
        fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer'
    },
    historyRow: {
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px', backgroundColor: theme==='light'?'rgba(0,0,0,0.02)':'rgba(255,255,255,0.03)',
        borderRadius:'12px', marginBottom:'4px'
    },
    // BOTTOM SHEET
    backdrop: {
        position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)',
        zIndex:3000, display:'flex', alignItems:'flex-end', justifyContent:'center'
    },
    sheet: {
        width:'100%', maxWidth:'600px', backgroundColor:Colors.get('background', theme),
        borderTopLeftRadius:'30px', borderTopRightRadius:'30px',
        padding:'20px 20px 40px 20px', boxShadow:'0 -10px 40px rgba(0,0,0,0.3)',
        borderTop: `1px solid ${Colors.get('border', theme)}`
    },
    handle: {
        width:'40px', height:'4px', backgroundColor:Colors.get('subText', theme),
        borderRadius:'2px', margin:'0 auto 20px auto', opacity:0.3
    },
    modalHeader: { textAlign:'center', marginBottom:'20px' },
    modalTitle: { fontSize:'18px', fontWeight:'800', color:Colors.get('mainText', theme), margin:0 },
    sectionLabel: {
        fontSize:'12px', fontWeight:'700', textTransform:'uppercase', color:Colors.get('subText', theme),
        marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'1px'
    },
    slotContainer: {
        display:'flex', justifyContent:'center', alignItems:'center',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.03)':'rgba(255,255,255,0.05)',
        borderRadius:'20px', padding:'15px', marginBottom:'20px'
    },
    slotBtn: {
        width:'100%', height:'30px', display:'flex', alignItems:'center', justifyContent:'center',
        color:Colors.get('subText', theme), cursor:'pointer',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.08)', borderRadius:'8px'
    },
    slotDivider: { width:'1px', height:'40px', backgroundColor:Colors.get('border', theme), margin:'0 5px' },
    // DATA ROW
    dataRow: {
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'12px', borderBottom:`1px solid ${Colors.get('border', theme)}`
    },
    dataLabel: { fontSize:'14px', fontWeight:'600', color:Colors.get('subText', theme) },
    roundBtn: {
        width:'36px', height:'36px', borderRadius:'10px',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.1)',
        display:'flex', alignItems:'center', justifyContent:'center', color:Colors.get('mainText', theme)
    },
    // ACTIONS
    secBtn: {
        flex:1, padding:'15px', borderRadius:'16px', border:'none',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.1)',
        color:Colors.get('subText', theme), cursor:'pointer', display:'flex', justifyContent:'center'
    },
    priBtn: {
        flex:1, padding:'15px', borderRadius:'16px', border:'none',
        color:'#fff', cursor:'pointer', display:'flex', justifyContent:'center',
        boxShadow:'0 5px 15px rgba(0,0,0,0.2)'
    },
    // PREMIUM
    premiumOverlay: {
        position:'fixed', inset:0, zIndex:2500, backgroundColor:'rgba(0,0,0,0.6)',
        backdropFilter:'blur(15px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'
    },
    premiumCard: {
        width:'100%', maxWidth:'350px', backgroundColor: theme==='light'?'rgba(255,255,255,0.9)':'rgba(30,30,30,0.9)',
        borderRadius:'30px', padding:'30px', display:'flex', flexDirection:'column', alignItems:'center',
        boxShadow:'0 20px 50px rgba(0,0,0,0.5)', border: `1px solid ${Colors.get('border', theme)}`
    },
    premiumBtn: {
        background:'linear-gradient(45deg, #FFD700, #FFA500)', border:'none',
        padding:'12px 30px', borderRadius:'25px', color:'#000', fontWeight:'800',
        fontSize:'16px', cursor:'pointer', boxShadow:'0 5px 20px rgba(255, 215, 0, 0.4)'
    }
})

export default TrainingMesurments;

