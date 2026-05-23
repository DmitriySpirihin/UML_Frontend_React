import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AppData } from '../../StaticClasses/AppData.js'
import Colors from '../../StaticClasses/Colors.js'
import { theme$, lang$, fontSize$, lastPage$, setPage, currentTrainingMuscle$, setShowPopUpPanel } from '../../StaticClasses/HabitsBus.js'
import { playEffects } from '../../StaticClasses/Effects.js'
import { MuscleIcon, addExercise } from '../../Classes/TrainingData.jsx'
import { MdDone } from 'react-icons/md'

const HEADER_TOP_PADDING = 'calc(env(safe-area-inset-top, 0px) + 18px)';

const AddExercisePanel = () => {
    const [theme, setTheme] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[1]);

    const [formMainMuscle, setFormMainMuscle] = useState(currentTrainingMuscle$.value);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isBase, setIsBase] = useState(true);
    const [mGroups, setMGroups] = useState(new Array(14).fill(false));

    useEffect(() => {
        const sub1 = theme$.subscribe(setTheme);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        return () => { sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); };
    }, []);

    function onAdd() {
        if (name.length < 3) {
            setShowPopUpPanel(langIndex === 0 ? 'Введите название (мин. 3 символа)' : 'Enter name (min 3 chars)', 2000, false);
            return;
        }
        const addMgGroups = [];
        for (let i = 0; i < mGroups.length; i++) {
            if (mGroups[i]) addMgGroups.push(i);
        }
        playEffects(null);
        const baseName = capitalizeName(name);
        const baseDesc = description.length > 3 ? capitalizeName(description) : '';
        addExercise(
            formMainMuscle,
            addMgGroups,
            [langIndex === 0 ? baseName : 'Custom exercise', langIndex === 1 ? baseName : 'Своё упражнение'],
            [langIndex === 0 ? (baseDesc || 'Своё упражнение') : 'Custom exercise', langIndex === 1 ? (baseDesc || 'Custom exercise') : 'Своё упражнение'],
            isBase
        );
        setPage(lastPage$.value || 'TrainingExercise');
    }

    const goBack = () => setPage(lastPage$.value || 'TrainingExercise');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
                position: 'fixed', inset: 0, zIndex: 1000,
                paddingBottom: '100px', overflowY: 'auto',
                backgroundColor: Colors.get('background', theme),
                fontFamily: 'inherit'
            }}
        >
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center',
                padding: `${HEADER_TOP_PADDING} 20px 20px`,
                minHeight: '76px',
                borderBottom: `1px solid ${Colors.get('border', theme)}`
            }}>
                <div aria-hidden="true" style={{ width: 39, marginRight: '15px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: Colors.get('mainText', theme), margin: 0 }}>
                    {langIndex === 0 ? 'Конструктор' : 'Constructor'}
                </h3>
            </div>

            {/* Form */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input
                    type="text"
                    placeholder={langIndex === 0 ? 'Название' : 'Name'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}`, borderRadius: '16px', padding: '12px' }}
                />
                <input
                    type="text"
                    placeholder={langIndex === 0 ? 'Описание' : 'Description'}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ border: 'none', background: 'transparent', fontSize: '16px', color: Colors.get('mainText', theme), outline: `solid 1px ${Colors.get('scrollFont', theme)}`, borderRadius: '16px', padding: '12px' }}
                />

                {/* Base / Iso toggle */}
                <div style={{ display: 'flex', width: '98%', backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', margin: '4px 0' }}>
                    <div
                        onClick={() => setIsBase(true)}
                        style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: isBase ? Colors.get('difficulty5', theme) : 'transparent', color: isBase ? Colors.get('trainingBaseFont', theme) : Colors.get('subText', theme), boxShadow: isBase ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        {langIndex === 0 ? 'База' : 'Base'}
                    </div>
                    <div
                        onClick={() => setIsBase(false)}
                        style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: !isBase ? Colors.get('difficulty2', theme) : 'transparent', color: !isBase ? Colors.get('trainingIsolatedFont', theme) : Colors.get('subText', theme), boxShadow: !isBase ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
                    >
                        {langIndex === 0 ? 'Изол.' : 'Iso'}
                    </div>
                </div>

                {/* Main Muscle selector */}
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: Colors.get('subText', theme), letterSpacing: '0.5px', marginBottom: '8px', margin: 0 }}>
                        {langIndex === 0 ? 'Основная мышца' : 'Main Muscle'}
                    </p>
                    <div style={{ display: 'flex', overflowX: 'auto', gap: '8px', padding: '8px 0 12px 0', scrollbarWidth: 'none' }}>
                        {Object.keys(MuscleIcon.muscleIconsSrc[0]).map((keyStr) => {
                            const key = Number(keyStr);
                            const isSelected = formMainMuscle === key;
                            return (
                                <motion.div
                                    key={key}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFormMainMuscle(key)}
                                    style={{
                                        minWidth: '60px', borderRadius: '12px',
                                        border: `1px solid ${isSelected ? Colors.get('currentDateBorder', theme) : Colors.get('border', theme)}`,
                                        padding: '5px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: isSelected ? Colors.get('trainingGroupSelected', theme) : 'transparent'
                                    }}
                                >
                                    {MuscleIcon.get(key, langIndex, theme, false, '50px')}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Secondary muscles */}
                <div>
                    <p style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: Colors.get('subText', theme), letterSpacing: '0.5px', marginBottom: '8px', margin: 0 }}>
                        {langIndex === 0 ? 'Доп. мышцы' : 'Secondary Muscles'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px', paddingBottom: '20px' }}>
                        {MuscleIcon.names[langIndex].map((muscleName, index) => {
                            if (formMainMuscle === index) return null;
                            return (
                                <motion.div
                                    key={index}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setMGroups(prev => prev.map((val, i) => i === index ? !val : val))}
                                    style={{
                                        padding: '6px 12px', borderRadius: '20px',
                                        border: `1px solid ${mGroups[index] ? 'transparent' : Colors.get('border', theme)}`,
                                        fontSize: '12px', cursor: 'pointer', fontWeight: '500',
                                        backgroundColor: mGroups[index] ? Colors.get('difficulty', theme) : 'transparent',
                                        color: mGroups[index] ? '#fff' : Colors.get('subText', theme)
                                    }}
                                >
                                    {muscleName}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div style={{ position: 'fixed', bottom: '30px', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                <motion.div
                    whileTap={{ scale: 0.9 }}
                    onClick={onAdd}
                    style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: Colors.get('done', theme), display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                >
                    <MdDone style={{ fontSize: '28px', color: '#fff' }} />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default AddExercisePanel;

const capitalizeName = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};
