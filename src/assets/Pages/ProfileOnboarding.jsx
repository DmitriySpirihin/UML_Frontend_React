import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdFemale, IoMdMale } from 'react-icons/io';
import { MdDone, MdClose } from 'react-icons/md';
import Colors from '../StaticClasses/Colors';
import { AppData, UserData } from '../StaticClasses/AppData';
import { saveData } from '../StaticClasses/SaveHelper';
import { lang$, setPage, theme$ } from '../StaticClasses/HabitsBus';
import ScrollPicker from '../Helpers/ScrollPicker.jsx';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const goalNames = [['Набор массы', 'Mass gain'], ['Сила', 'Strength'], ['Жиросжигание', 'Weight loss'], ['Здоровье', 'Health'], ['Выносливость', 'Endurance']];
const sectionOptions = [
    { key: 'habits', label: ['Привычки', 'Habits'] },
    { key: 'training', label: ['Тренировки', 'Training'] },
    { key: 'mental', label: ['Ментал', 'Mental'] },
    { key: 'recovery', label: ['Восстановление', 'Recovery'] },
    { key: 'sleep', label: ['Сон', 'Sleep'] },
    { key: 'todo', label: ['Задачи', 'Tasks'] }
];

const generateRange = (start, end, step = 1) => {
    const arr = [];
    for (let i = start; i <= end; i += step) {
        arr.push(step === 1 ? i : parseFloat(i.toFixed(1)));
    }
    return arr;
};

const ProfileOnboarding = () => {
    const [theme, setThemeState] = useState(theme$.value);
    const [lang, setLangIndex] = useState(AppData.prefs[0]);
    const [age, setAge] = useState(AppData.pData?.age || 20);
    const [gender, setGender] = useState(AppData.pData?.gender ?? 0);
    const [height, setHeight] = useState(AppData.pData?.height || 180);
    const [wrist, setWrist] = useState(AppData.pData?.wrist || 20);
    const [goal, setGoal] = useState(AppData.pData?.goal || 1);
    const [nicknameMode, setNicknameMode] = useState(AppData.profileNicknameMode || 'telegram');
    const [customNickname, setCustomNickname] = useState(AppData.profileCustomNickname || UserData.name || '');
    const [discoverySource, setDiscoverySource] = useState(AppData.profileDiscoverySource || '');
    const [preferredSections, setPreferredSections] = useState(AppData.profilePreferredSections || []);

    const agesList = useMemo(() => generateRange(10, 100), []);
    const heightsList = useMemo(() => generateRange(50, 250), []);
    const wristsList = useMemo(() => generateRange(10, 40, 0.5), []);
    const currentGoalNames = useMemo(() => goalNames.map(g => g[lang]), [lang]);

    useEffect(() => {
        const themeSub = theme$.subscribe(setThemeState);
        const langSub = lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1));
        return () => {
            themeSub.unsubscribe();
            langSub.unsubscribe();
        };
    }, []);

    const completeOnboarding = async () => {
        const normalizedNickname = customNickname.trim();
        AppData.pData = { filled: true, age, gender, height, wrist, goal };
        AppData.profileOnboardingShown = true;
        AppData.profileNicknameMode = nicknameMode;
        AppData.profileCustomNickname = normalizedNickname;
        AppData.profileDiscoverySource = discoverySource.trim();
        AppData.profilePreferredSections = preferredSections;
        if (nicknameMode === 'custom' && normalizedNickname) UserData.name = normalizedNickname;
        await saveData();
        setPage('MainMenu');
    };

    const toggleSection = (key) => {
        setPreferredSections(prev => prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]);
    };

    const skipOnboarding = async () => {
        AppData.profileOnboardingShown = true;
        await saveData();
        setPage('MainMenu');
    };

    const s = styles(theme);

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={s.container}
        >
            <div style={s.header}>
                <div>
                    <div style={s.kicker}>{lang === 0 ? 'Профиль' : 'Profile'}</div>
                    <h1 style={s.title}>{lang === 0 ? 'Расскажите о себе' : 'Tell us about yourself'}</h1>
                </div>
                <MotionButton type="button" whileTap={{ scale: 0.95 }} onClick={skipOnboarding} style={s.skipBtn}>
                    {lang === 0 ? 'Позже' : 'Later'}
                </MotionButton>
            </div>

            <div style={s.content} className="no-scrollbar">
                <div style={s.formCard}>
                    <span style={s.label}>{lang === 0 ? 'Как вас называть' : 'Display name'}</span>
                    <div style={s.modeGrid}>
                        <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={() => setNicknameMode('telegram')} style={s.modeButton(nicknameMode === 'telegram')}>
                            {lang === 0 ? 'Ник Telegram' : 'Telegram name'}
                        </MotionButton>
                        <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={() => setNicknameMode('custom')} style={s.modeButton(nicknameMode === 'custom')}>
                            {lang === 0 ? 'Свой ник' : 'Custom'}
                        </MotionButton>
                    </div>
                    <div style={s.telegramName}>
                        {lang === 0 ? 'Telegram:' : 'Telegram:'} {UserData.name || (lang === 0 ? 'гость' : 'guest')}
                    </div>
                    {nicknameMode === 'custom' && (
                        <input
                            value={customNickname}
                            onChange={(e) => setCustomNickname(e.target.value)}
                            placeholder={lang === 0 ? 'Введите ник' : 'Enter nickname'}
                            style={s.input}
                        />
                    )}
                </div>

                <div style={s.pickerCard}>
                    <div style={s.row}>
                        <PickerBlock label={lang === 0 ? 'Возраст' : 'Age'} value={age} items={agesList} onChange={setAge} theme={theme} />
                        <PickerBlock label={lang === 0 ? 'Рост (см)' : 'Height'} value={height} items={heightsList} onChange={setHeight} theme={theme} />
                    </div>
                    <div style={s.row}>
                        <PickerBlock label={lang === 0 ? 'Запястье (см)' : 'Wrist'} value={wrist} items={wristsList} onChange={setWrist} theme={theme} />
                        <div style={s.genderBlock}>
                            <span style={s.label}>{lang === 0 ? 'Пол' : 'Gender'}</span>
                            <div style={s.genderControls}>
                                <GenderToggle active={gender === 0} icon={<IoMdMale />} color="#5fb6c6" onClick={() => setGender(0)} theme={theme} />
                                <GenderToggle active={gender === 1} icon={<IoMdFemale />} color="#c65f9d" onClick={() => setGender(1)} theme={theme} />
                            </div>
                        </div>
                    </div>
                </div>

                <div style={s.goalCard}>
                    <span style={s.label}>{lang === 0 ? 'Цель' : 'Goal'}</span>
                    <ScrollPicker items={currentGoalNames} value={currentGoalNames[goal]} onChange={(val) => setGoal(currentGoalNames.indexOf(val))} theme={theme} width="220px" />
                </div>

                <div style={s.formCard}>
                    <span style={s.label}>{lang === 0 ? 'Откуда узнали о нас' : 'How did you hear about us'}</span>
                    <input
                        value={discoverySource}
                        onChange={(e) => setDiscoverySource(e.target.value)}
                        placeholder={lang === 0 ? 'Например: друг, Telegram, реклама...' : 'Friend, Telegram, ad...'}
                        style={s.input}
                    />
                </div>

                <div style={s.formCard}>
                    <span style={s.label}>{lang === 0 ? 'Что хотите использовать' : 'What do you want to use'}</span>
                    <div style={s.sectionGrid}>
                        {sectionOptions.map(option => {
                            const selected = preferredSections.includes(option.key);
                            return (
                                <MotionButton
                                    key={option.key}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleSection(option.key)}
                                    style={s.sectionChip(selected)}
                                >
                                    {option.label[lang]}
                                </MotionButton>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={s.footer}>
                <MotionButton type="button" whileTap={{ scale: 0.96 }} onClick={skipOnboarding} style={s.secondaryBtn}>
                    <MdClose size={20} />
                    {lang === 0 ? 'Пропустить' : 'Skip'}
                </MotionButton>
                <MotionButton type="button" whileTap={{ scale: 0.96 }} onClick={completeOnboarding} style={s.primaryBtn}>
                    <MdDone size={22} />
                    {lang === 0 ? 'Сохранить' : 'Save'}
                </MotionButton>
            </div>
        </MotionDiv>
    );
};

const PickerBlock = ({ label, value, items, onChange, theme }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
        <span style={{ color: Colors.get('subText', theme), fontSize: '12px', fontWeight: '800', marginBottom: '6px' }}>{label}</span>
        <ScrollPicker items={items} value={value} onChange={onChange} theme={theme} width="105px" />
    </div>
);

const GenderToggle = ({ active, icon, color, onClick, theme }) => (
    <MotionDiv
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: active ? color : (theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '22px',
            color: active ? '#fff' : Colors.get('subText', theme),
            border: active ? 'none' : `1px solid ${Colors.get('border', theme)}`
        }}
    >
        {icon}
    </MotionDiv>
);

const styles = (theme) => {
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const panel = Colors.get('simplePanel', theme);

    return {
        container: {
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            width: '100vw',
            height: '100vh',
            backgroundColor: Colors.get('background', theme),
            color: text,
            fontFamily: 'Segoe UI, sans-serif',
            display: 'flex',
            flexDirection: 'column'
        },
        header: {
            padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 22px 12px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '16px'
        },
        kicker: { color: sub, fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '6px' },
        title: { color: text, fontSize: '28px', lineHeight: 1.08, margin: 0, fontWeight: '950' },
        skipBtn: {
            border: `1px solid ${Colors.get('border', theme)}70`,
            backgroundColor: panel,
            color: sub,
            borderRadius: '14px',
            padding: '10px 13px',
            fontSize: '13px',
            fontWeight: '800',
            cursor: 'pointer',
            flexShrink: 0
        },
        content: {
            flex: 1,
            overflowY: 'auto',
            padding: '10px 20px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
        },
        pickerCard: {
            backgroundColor: panel,
            border: `1px solid ${Colors.get('border', theme)}50`,
            borderRadius: '24px',
            padding: '16px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
        },
        formCard: {
            backgroundColor: panel,
            border: `1px solid ${Colors.get('border', theme)}50`,
            borderRadius: '24px',
            padding: '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        },
        modeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
        modeButton: (active) => ({
            border: `1px solid ${active ? Colors.get('done', theme) : Colors.get('border', theme)}80`,
            backgroundColor: active ? 'rgba(50, 215, 80, 0.16)' : 'transparent',
            color: active ? Colors.get('done', theme) : text,
            borderRadius: '14px',
            minHeight: '44px',
            fontSize: '13px',
            fontWeight: '850',
            cursor: 'pointer'
        }),
        telegramName: {
            color: sub,
            fontSize: '12px',
            fontWeight: '700',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        input: {
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${Colors.get('border', theme)}80`,
            borderRadius: '15px',
            backgroundColor: theme === 'light' ? '#F7F7F8' : 'rgba(255,255,255,0.05)',
            color: text,
            padding: '13px 14px',
            fontSize: '15px',
            fontWeight: '700',
            outline: 'none'
        },
        sectionGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '9px' },
        sectionChip: (selected) => ({
            border: `1px solid ${selected ? Colors.get('done', theme) : Colors.get('border', theme)}80`,
            backgroundColor: selected ? 'rgba(50, 215, 80, 0.16)' : 'transparent',
            color: selected ? Colors.get('done', theme) : text,
            borderRadius: '14px',
            minHeight: '42px',
            padding: '8px',
            fontSize: '13px',
            fontWeight: '850',
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }),
        row: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '10px' },
        genderBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' },
        genderControls: { display: 'flex', gap: '10px', minHeight: '105px', alignItems: 'center' },
        goalCard: {
            backgroundColor: panel,
            border: `1px solid ${Colors.get('border', theme)}50`,
            borderRadius: '24px',
            padding: '18px 12px 14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        },
        label: { color: sub, fontSize: '12px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase' },
        footer: {
            padding: '12px 20px calc(env(safe-area-inset-bottom, 0px) + 22px)',
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gap: '12px'
        },
        secondaryBtn: {
            border: `1px solid ${Colors.get('border', theme)}70`,
            backgroundColor: panel,
            color: sub,
            borderRadius: '18px',
            minHeight: '54px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '850',
            cursor: 'pointer'
        },
        primaryBtn: {
            border: 'none',
            backgroundColor: Colors.get('done', theme),
            color: '#fff',
            borderRadius: '18px',
            minHeight: '54px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: '900',
            cursor: 'pointer'
        }
    };
};

export default ProfileOnboarding;
