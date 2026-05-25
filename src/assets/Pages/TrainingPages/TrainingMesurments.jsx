import React, { useState, useEffect, useMemo } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { AppData, formatLocalDateKey, UserData } from '../../StaticClasses/AppData.js'
import { saveData } from '../../StaticClasses/SaveHelper.js'
import Colors from '../../StaticClasses/Colors'
import { theme$, lang$, fontSize$, premium$, setPage } from '../../StaticClasses/HabitsBus'
import { FaPlus, FaPencilAlt, FaTrash, FaChevronUp, FaChevronDown, FaCrown } from 'react-icons/fa'
import { IoMdMale, IoMdFemale } from 'react-icons/io'
import { IoScaleSharp, IoPerson, IoCalendarOutline, IoAnalytics } from 'react-icons/io5'
import { MdClose, MdDone } from 'react-icons/md'
import { MeasurmentsIcon } from '../../Helpers/MeasurmentsIcons.jsx'
import TrainingMeasurmentsOveview from './TrainingMeasurmentsOverView.jsx'
import TrainingMeasurmentsAnalitics from './TrainingMeasurmentsAnalitics.jsx'
import { VolumeTabs } from '../../Helpers/TrainingAnaliticsTabs';
import ScrollPicker from '../../Helpers/ScrollPicker.jsx'
import {
    getTrainingAccent,
    getTrainingPageBackground,
    getTrainingPanelBackground,
    getTrainingPanelBorder,
    getTrainingGlassSurface,
    getTrainingPressMotion
} from './TrainingVisuals.js'

// --- SCROLL PICKER COMPONENT ---
const ITEM_HEIGHT = 40;


// --- CONSTANTS & HELPERS ---
const names = [
    ['Вес тела', 'Body weight'],
    ['Обхват талии', 'Waist circumference'],
    ['Обхват бицепса', 'Biceps circumference'],
    ['Обхват груди', 'Chest circumference'],
    ['Обхват бёдер', 'Hips circumference'],
]

const now = new Date();
const months = [['янв', 'фев', 'март', 'апр', 'май', 'июнь', 'июль', 'авг', 'сент', 'окт', 'нояб', 'дек'], ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']];
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health'], ['Выносливосить', 'Endurance']]

const generateRange = (start, end, step = 1) => {
    const arr = [];
    for (let i = start; i <= end; i += step) {
        // Fix floating point math issues (e.g. 10.5)
        arr.push(step === 1 ? i : parseFloat(i.toFixed(1)));
    }
    return arr;
};

// --- MAIN COMPONENT ---
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
    
    const [valInt, setValInt] = useState(70);
    const [valDec, setValDec] = useState(0);

    // User Data
    const [filled, setFilled] = useState(AppData.pData.filled);
    const [age, setAge] = useState(AppData.pData.age);
    const [gender, setGender] = useState(AppData.pData.gender);
    const [height, setHeight] = useState(AppData.pData.height);
    const [wrist, setWrist] = useState(AppData.pData.wrist);
    const [goal, setGoal] = useState(AppData.pData.goal);

    // --- GENERATED LISTS FOR PICKERS ---
    const yearsList = useMemo(() => generateRange(2020, now.getFullYear()), []);
    // Dynamic days list based on month/year would be ideal, but static 1-31 with clamping is safer for scroll
    const daysList = useMemo(() => generateRange(1, 31), []); 
    const intList = useMemo(() => generateRange(0, 300), []);
    const decList = useMemo(() => generateRange(0, 9), []);
    
    // Personal Data Lists
    const agesList = useMemo(() => generateRange(10, 100), []);
    const heightsList = useMemo(() => generateRange(50, 250), []);
    const wristsList = useMemo(() => generateRange(10, 40, 0.5), []);
    const currentGoalNames = useMemo(() => goalNames.map(g => g[langIndex]), [langIndex]);


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
    const getCombinedValue = () => parseFloat(`${valInt}.${valDec}`);
    
    const setSplitValue = (floatVal) => {
        const val = parseFloat(floatVal) || 0;
        setValInt(Math.floor(val));
        setValDec(Math.round((val % 1) * 10));
    };

    // Ensure day is valid when month/year changes
    useEffect(() => {
        const maxDays = new Date(year, month + 1, 0).getDate();
        if (day > maxDays) setDay(maxDays);
    }, [year, month, day]);

    // --- CRUD ---
    const onAddDay = async () => {
        if (currentType === -1) return;
        const newDateStr = formatLocalDateKey(new Date(year, month, day));
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
        const newDateStr = formatLocalDateKey(new Date(year, month, day));
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
    const accent = getTrainingAccent();
    const cardBg = getTrainingPanelBackground(theme);
    const borderColor = getTrainingPanelBorder(theme, accent);

    return (
        <div style={styles(theme).container}>
            <VolumeTabs type={1} theme={theme} langIndex={langIndex} activeTab={tab} onChange={setTab} />

            {tab === 'volume' && (
                <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '100px' }}>
                    
                    {/* --- PERSONAL DATA (BENTO GRID) --- */}
                    <Motion.div {...getTrainingPressMotion(1.004, 0.988)} style={{ ...styles(theme).card, ...getTrainingGlassSurface(theme, accent, currentType === -1), background: cardBg, border: `1px solid ${borderColor}` }}>
                        <div style={styles(theme).cardHeader} onClick={() => setCurrentType(p => p === -1 ? -2 : -1)}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={styles(theme).iconBox}><IoPerson size={18} color={accent.hue} /></div>
                                <span style={styles(theme, fSize).headerText}>{langIndex === 0 ? 'Личные данные' : 'Personal Data'}</span>
                            </div>
                            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                {currentType === -1 && <FaPencilAlt size={14} color={Colors.get('subText', theme)} onClick={(e) => {e.stopPropagation(); setShowPersonalDataPanel(true)}} />}
                                {currentType === -1 ? <FaChevronUp size={12} color={Colors.get('subText', theme)}/> : <FaChevronDown size={12} color={Colors.get('subText', theme)}/>}
                            </div>
                        </div>
                        <div className={`smooth-accordion ${currentType === -1 ? 'is-open' : ''}`}>
                            <div className="smooth-accordion-inner">
                                    <div style={{ padding: '0 15px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                        <StatCard label={langIndex===0?'Возраст':'Age'} value={age} sub={langIndex===0?'лет':'y.o.'} theme={theme} />
                                        <StatCard label={langIndex===0?'Пол':'Gender'} value={gender===0?(langIndex===0?'Муж':'Male'):(langIndex===0?'Жен':'Fem')} theme={theme} icon={gender===0?<IoMdMale/>:<IoMdFemale/>} />
                                        <StatCard label={langIndex===0?'Рост':'Height'} value={height} sub="cm" theme={theme} />
                                        <StatCard label={langIndex===0?'Цель':'Goal'} value={goalNames[goal][langIndex]} theme={theme} isWide />
                                    </div>
                            </div>
                        </div>
                    </Motion.div>

                    {/* --- MEASUREMENTS LIST --- */}
                    {data.map((el, ind) => (
                        <Motion.div key={ind} {...getTrainingPressMotion(1.004, 0.988)} style={{ ...styles(theme).card, ...getTrainingGlassSurface(theme, accent, currentType === ind), background: cardBg, border: `1px solid ${borderColor}` }}>
                            <div style={styles(theme).cardHeader} onClick={() => setCurrentType(p => p === ind ? -2 : ind)}>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <div style={styles(theme).iconBox}>
                                        {ind > 0 ? MeasurmentsIcon.get(ind - 1, langIndex, theme) : <IoScaleSharp size={18} color={accent.hue} />}
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
                            <div className={`smooth-accordion ${currentType === ind ? 'is-open' : ''}`}>
                                <div className="smooth-accordion-inner">
                                        <div style={{ padding: '0 15px 15px' }}>
                                            <Motion.button whileTap={{scale:0.98}} onClick={openAdd} style={styles(theme).addBtn}>
                                                <FaPlus size={12}/> {langIndex === 0 ? 'Добавить замер' : 'Add Measurement'}
                                            </Motion.button>
                                            
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
                                                                <DiffBadge data={data} type={ind} ind={idx} />
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
                                </div>
                            </div>
                        </Motion.div>
                    ))}
                </div>
            )}

            {tab === 'muscles' && <TrainingMeasurmentsOveview theme={theme} langIndex={langIndex} fSize={fSize} data={data} filled={filled} age={age} height={height} gender={gender} goal={goal} wrist={wrist} />}
            {tab === 'exercises' && <TrainingMeasurmentsAnalitics theme={theme} langIndex={langIndex} fSize={fSize} data={data} />}

            {/* --- MODALS --- */}
            <AnimatePresence>
                {/* 1. ADD / REDACT VALUE */}
                {(showAddDayPanel || showRedactPanel) && (
                    <BottomSheet onClose={() => { setShowAddDayPanel(false); setShowRedactPanel(false); }} theme={theme}>
                        <div style={styles(theme).modalHeader}>
                            <h3 style={styles(theme).modalTitle}>{langIndex === 0 ? (showAddDayPanel ? 'Новый замер' : 'Изменить') : (showAddDayPanel ? 'New Entry' : 'Edit Entry')}</h3>
                        </div>

                        {/* DATE PICKER (Scroll Pickers) */}
                        <div style={styles(theme).sectionLabel}><IoCalendarOutline/> {langIndex === 0 ? 'Дата' : 'Date'}</div>
                        <div style={{...styles(theme).pickerRow, marginBottom:'20px'}}>
                            <ScrollPicker items={yearsList} value={year} onChange={setYear} theme={theme} width="80px" />
                            <ScrollPicker 
                                items={months[langIndex]} 
                                value={months[langIndex][month]} 
                                onChange={(val) => setMonth(months[langIndex].indexOf(val))} 
                                theme={theme} width="70px" 
                            />
                            <ScrollPicker items={daysList} value={day} onChange={setDay} theme={theme} width="60px" />
                        </div>

                        {/* VALUE PICKER (Scroll Pickers) */}
                        <div style={styles(theme).sectionLabel}><IoAnalytics/> {langIndex === 0 ? 'Значение' : 'Value'}</div>
                        <div style={{...styles(theme).pickerRow, marginBottom: '30px'}}>
                            <ScrollPicker items={intList} value={valInt} onChange={setValInt} theme={theme} width="80px" />
                            <div style={{fontSize:'30px', fontWeight:'bold', color:Colors.get('subText', theme), alignSelf:'center', paddingBottom:'5px'}}>.</div>
                            <ScrollPicker items={decList} value={valDec} onChange={setValDec} theme={theme} width="50px" />
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
                            <div style={{
                                width: 58,
                                height: 58,
                                borderRadius: 18,
                                margin: '0 auto 12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(239,68,68,0.12)',
                                border: '1px solid rgba(239,68,68,0.24)',
                                color: '#EF4444',
                            }}>
                                <FaTrash size={22} />
                            </div>
                            <p style={{fontSize:'16px', fontWeight:'bold', color:Colors.get('mainText', theme)}}>{langIndex === 0 ? 'Удалить запись?' : 'Delete entry?'}</p>
                        </div>
                        <ModalActions onClose={() => setShowConfirmRemove(false)} onConfirm={onRemoveConfirm} theme={theme} isDanger />
                    </BottomSheet>
                )}

                {/* 3. PERSONAL DATA SETTINGS (Scroll Pickers) */}
                {showPersonalDataPanel && (
                    <BottomSheet onClose={() => setShowPersonalDataPanel(false)} theme={theme}>
                        <div style={styles(theme).settingsHeader}>
                            <div style={styles(theme).settingsEyebrow}>{langIndex === 0 ? 'Профиль тела' : 'Body profile'}</div>
                            <h3 style={styles(theme).modalTitle}>{langIndex === 0 ? 'Настройки' : 'Settings'}</h3>
                            <p style={styles(theme).settingsDescription}>
                                {langIndex === 0 ? 'Эти параметры улучшают расчёты замеров и рекомендаций.' : 'These values improve measurement and recommendation calculations.'}
                            </p>
                        </div>
                        
                        <div style={styles(theme).settingsGrid}>
                            
                            {/* Row 1: Age & Height */}
                            <div style={styles(theme).settingsCard}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={styles(theme).settingsLabel}>{langIndex===0?'Возраст':'Age'}</span>
                                    <ScrollPicker items={agesList} value={age} onChange={setAge} theme={theme} width="100px" />
                                </div>
                            </div>
                            <div style={styles(theme).settingsCard}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={styles(theme).settingsLabel}>{langIndex===0?'Рост (см)':'Height'}</span>
                                    <ScrollPicker items={heightsList} value={height} onChange={setHeight} theme={theme} width="100px" />
                                </div>
                            </div>

                            {/* Row 2: Wrist & Gender */}
                            <div style={styles(theme).settingsCard}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                                    <span style={styles(theme).settingsLabel}>{langIndex===0?'Запястье (см)':'Wrist'}</span>
                                    <ScrollPicker items={wristsList} value={wrist} onChange={setWrist} theme={theme} width="100px" />
                                </div>
                            </div>
                            <div style={styles(theme).settingsCard}>
                                <div style={{display:'flex', flexDirection:'column', alignItems:'center', width:'100%'}}>
                                    <span style={styles(theme).settingsLabel}>{langIndex===0?'Пол':'Gender'}</span>
                                    <div style={{display:'flex', gap:'10px'}}>
                                        <GenderToggle active={gender===0} icon={<IoMdMale/>} color="#5fb6c6" onClick={()=>setGender(0)} theme={theme}/>
                                        <GenderToggle active={gender===1} icon={<IoMdFemale/>} color="#c65f9d" onClick={()=>setGender(1)} theme={theme}/>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Goal */}
                            <div style={{...styles(theme).settingsCard, gridColumn: '1 / -1'}}>
                                <span style={styles(theme).settingsLabel}>{langIndex===0?'Цель':'Goal'}</span>
                                <ScrollPicker 
                                    items={currentGoalNames} 
                                    value={currentGoalNames[goal]} 
                                    onChange={(val) => setGoal(currentGoalNames.indexOf(val))} 
                                    theme={theme} width="200px" 
                                />
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
                        background: theme === 'dark' ? 'rgba(10,10,14,0.82)' : 'rgba(248,248,250,0.88)',
                        backdropFilter: 'blur(20px)',
                        textAlign: 'center'
                    }}
                >
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'rgba(159,180,196,0.12)',
                        borderRadius: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        marginBottom: '16px',
                        border: '1px solid rgba(159,180,196,0.22)',
                    }}>
                        <FaCrown size={30} color="#9FB4C4" />
                    </div>
                    <div style={{
                        fontSize: '13px', lineHeight: '1.6',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.45)',
                        marginBottom: '24px', maxWidth: '210px',
                    }}>
                        {langIndex === 0 ? 'Откройте полный доступ ко всей статистике' : 'Unlock full access to all statistics'}
                    </div>
                    <button onClick={() => setPage('premium')} style={{
                        fontSize: '15px', fontWeight: '700', color: '#fff',
                        background: '#9FB4C4',
                        border: 'none', borderRadius: '14px',
                        padding: '13px 0', marginBottom: '10px', cursor: 'pointer',
                        boxShadow: '0 4px 16px rgba(159,180,196,0.35)',
                        width: '220px',
                    }}>
                        {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
                    </button>
                    <button onClick={() => setPage('MainMenu')} style={{
                        fontSize: '13px', fontWeight: '500',
                        color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)',
                        background: 'transparent', border: 'none',
                        padding: '8px 20px', cursor: 'pointer',
                    }}>
                        {langIndex === 0 ? '← На главную' : '← Home'}
                    </button>
                </div>
            )}
        </div>
    )
}

// --- SUB COMPONENTS ---

const StatCard = ({ label, value, sub, theme, icon, isWide }) => (
    <div style={{
        background: theme === 'light' ? 'rgba(255,255,255,0.46)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${theme === 'light' ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        gridColumn: isWide ? 'span 2' : 'span 1'
    }}>
        <div style={{fontSize:'11px', color:Colors.get('subText', theme), textTransform:'uppercase', fontWeight:'700', marginBottom:'4px'}}>{label}</div>
        <div style={{fontSize:'18px', fontWeight:'800', color:Colors.get('mainText', theme), display:'flex', alignItems:'center', gap:'4px'}}>
            {icon} {value} <span style={{fontSize:'12px', fontWeight:'500', opacity:0.7}}>{sub}</span>
        </div>
    </div>
)

const DiffBadge = ({data, type, ind}) => {
    // FIX: Check if there is a previous element (ind > 0) since array is sorted by Date Ascending
    if (ind > 0) {
        // Calculate difference: Current Value - Previous Value
        const diff = data[type][ind].value - data[type][ind - 1].value; 
        
        // Ignore zero or tiny floating point differences
        if (Math.abs(diff) < 0.01) return null; 

        const isPos = AppData.pData.goal === 2 ? diff < 0 : diff > 0;
        
        return (
            <span style={{
                fontSize:'10px', fontWeight:'800', padding:'2px 6px', borderRadius:'6px',
                backgroundColor: isPos ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                color: isPos ? '#4CAF50' : '#F44336',
                marginLeft: '8px' // Added margin for better spacing
            }}>
                {isPos ? '+' : ''}{Number.isInteger(diff) ? diff : diff.toFixed(1)}
            </span>
        )
    }
    return null;
}

const BottomSheet = ({ children, onClose, theme }) => (
    <div style={styles(theme).backdrop} onClick={onClose}>
        <Motion.div 
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
	            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={styles(theme).sheet} onClick={e => e.stopPropagation()}
        >
            <div style={styles(theme).handle} />
            {children}
        </Motion.div>
    </div>
)

const GenderToggle = ({ active, icon, color, onClick, theme }) => (
    <Motion.div 
        whileTap={{scale:0.9}} onClick={onClick}
        style={{
            width:'40px', height:'40px', borderRadius:'12px', 
            backgroundColor: active ? color : (theme==='light'?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'),
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px',
            color: active ? '#fff' : Colors.get('subText', theme), border: active ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }}
    >
        {icon}
    </Motion.div>
)

const ModalActions = ({ onClose, onConfirm, theme, isDanger }) => (
    <div style={{display:'flex', gap:'15px', marginTop:'25px'}}>
        <Motion.button whileTap={{scale:0.95}} onClick={onClose} style={styles(theme).secBtn}><MdClose size={22}/></Motion.button>
        <Motion.button whileTap={{scale:0.95}} onClick={onConfirm} style={{...styles(theme).priBtn, backgroundColor: isDanger ? '#ff4d4d' : Colors.get('done', theme)}}><MdDone size={22}/></Motion.button>
    </div>
)

const styles = (theme, fSize) => {
    const accent = getTrainingAccent();
    const isLight = theme === 'light' || theme === 'speciallight';

    return {
    container: {
        display: 'flex', width: "100vw", flexDirection: 'column',
        overflowY: 'scroll', overflowX: 'hidden', alignItems: 'center',
        background: getTrainingPageBackground(theme, accent),
        minHeight: "100dvh",
        height: "100dvh",
        padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 18px 116px',
        boxSizing: 'border-box'
    },
    card: {
        width: '100%',
        borderRadius: '22px',
        margin: '0 auto',
        overflow: 'hidden',
        transition: 'all 0.3s',
        ...getTrainingGlassSurface(theme, accent),
        WebkitTapHighlightColor: 'transparent',
        userSelect: 'none'
    },
    cardHeader: {
        padding: '15px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation'
    },
    headerText: { fontSize: fSize===0?'16px':'18px', fontWeight:'700', color:Colors.get('mainText', theme) },
    iconBox: {
        width:'40px', height:'40px', borderRadius:'12px',
        backgroundColor: accent.soft,
        border: `1px solid ${accent.ring}`,
        display:'flex', alignItems:'center', justifyContent:'center'
    },
    valueBadge: {
        fontSize:'14px', fontWeight:'700', padding:'4px 10px', borderRadius:'8px',
        background: isLight ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.09)',
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)'}`,
        color:Colors.get('mainText', theme)
    },
    addBtn: {
        width:'100%', padding:'12px', borderRadius:'14px',
        border:`1px solid ${accent.ring}`,
        background:`linear-gradient(135deg, ${accent.hue}, rgba(${accent.rgb}, 0.72))`, color:'#fff',
        fontWeight:'700', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer'
    },
    historyRow: {
        display:'flex', justifyContent:'space-between', alignItems:'center',
        padding:'12px',
        background: theme==='light'?'rgba(255,255,255,0.42)':'rgba(255,255,255,0.045)',
        border: `1px solid ${theme === 'light' ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.055)'}`,
        borderRadius:'12px',
        marginBottom:'4px',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
    },
    // BOTTOM SHEET
    backdrop: {
        position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.6)', backdropFilter:'blur(5px)',
        zIndex:3000, display:'flex', alignItems:'flex-end', justifyContent:'center'
    },
    sheet: {
        width:'100%', maxWidth:'600px', background:getTrainingPanelBackground(theme),
        borderTopLeftRadius:'30px', borderTopRightRadius:'30px',
        padding:'20px 20px 40px 20px', boxShadow:'0 -10px 40px rgba(0,0,0,0.3)',
        borderTop: `1px solid ${Colors.get('border', theme)}`,
        display: 'flex', flexDirection: 'column'
    },
    handle: {
        width:'40px', height:'4px', backgroundColor:Colors.get('subText', theme),
        borderRadius:'2px', margin:'0 auto 20px auto', opacity:0.3
    },
    modalHeader: { textAlign:'center', marginBottom:'20px' },
    modalTitle: { fontSize:'18px', fontWeight:'800', color:Colors.get('mainText', theme), margin:0 },
    settingsHeader: {
        textAlign: 'center',
        marginBottom: '18px',
    },
    settingsEyebrow: {
        color: accent.hue,
        fontSize: '11px',
        fontWeight: 900,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        marginBottom: '6px',
    },
    settingsDescription: {
        maxWidth: 360,
        margin: '8px auto 0',
        color: Colors.get('subText', theme),
        fontSize: '13px',
        lineHeight: 1.45,
        fontWeight: 650,
    },
    settingsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: '12px',
        padding: '6px 0 4px',
    },
    settingsCard: {
        minHeight: '128px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        background: isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)',
        border: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.07)'}`,
        boxSizing: 'border-box',
    },
    settingsLabel: {
        fontSize:'11px',
        color:Colors.get('subText', theme),
        marginBottom:'8px',
        fontWeight: 850,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
    },
    sectionLabel: {
        fontSize:'12px', fontWeight:'700', textTransform:'uppercase', color:Colors.get('subText', theme),
        marginBottom:'10px', display:'flex', alignItems:'center', gap:'6px', letterSpacing:'1px'
    },
    // PICKER LAYOUT
    pickerRow: {
        display:'flex', justifyContent:'center', alignItems:'center', gap:'10px',
        backgroundColor: theme==='light'?'rgba(0,0,0,0.03)':'rgba(255,255,255,0.05)',
        borderRadius:'20px', padding:'15px'
    },
    // ACTIONS
    secBtn: {
        flex:1, padding:'15px', borderRadius:'16px', border:'none',
        backgroundColor:Colors.get('skipped', theme),
        color:Colors.get('subText', theme), cursor:'pointer', display:'flex', justifyContent:'center'
    },
    priBtn: {
        flex:1, padding:'15px', borderRadius:'16px', border:'none',
        color:'#fff', cursor:'pointer', display:'flex', justifyContent:'center',
        boxShadow:'0 5px 15px rgba(0,0,0,0.2)'
    }
    };
};

export default TrainingMesurments;
