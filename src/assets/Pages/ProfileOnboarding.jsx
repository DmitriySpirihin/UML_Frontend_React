import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { IoMdFemale, IoMdMale } from 'react-icons/io';
import {
    MdBedtime,
    MdCheckCircle,
    MdChecklist,
    MdDone,
    MdFavorite,
    MdFitnessCenter,
    MdHeight,
    MdOutlinePsychology,
    MdPerson,
    MdSelfImprovement,
    MdStraighten,
    MdTrendingUp
} from 'react-icons/md';
import { FaDumbbell, FaFire, FaTelegramPlane } from 'react-icons/fa';
import Colors from '../StaticClasses/Colors';
import { AppData, UserData } from '../StaticClasses/AppData';
import { saveData } from '../StaticClasses/SaveHelper';
import { lang$, setPage, theme$ } from '../StaticClasses/HabitsBus';

const MotionDiv = motion.div;
const MotionButton = motion.button;
const genderAccents = {
    male: '#5CCAD6',
    female: '#E06C9F'
};

const goalNames = [
    ['Набор массы', 'Mass gain'],
    ['Рост силы', 'Strength gains'],
    ['Жиросжигание', 'Weight loss'],
    ['Здоровье', 'Health'],
    ['Выносливость', 'Endurance']
];

const goalMeta = [
    { icon: <FaDumbbell />, color: '#8FA6C8' },
    { icon: <MdTrendingUp />, color: '#66D9E8' },
    { icon: <FaFire />, color: '#D8785E' },
    { icon: <MdFavorite />, color: '#74B8AF' },
    { icon: <MdFitnessCenter />, color: '#C9A24B' }
];

const sectionOptions = [
    { key: 'habits', label: ['Привычки', 'Habits'], icon: <MdCheckCircle />, color: '#22C55E' },
    { key: 'training', label: ['Тренировки', 'Training'], icon: <FaDumbbell />, color: '#579BC8' },
    { key: 'mental', label: ['Ментал', 'Mental'], icon: <MdOutlinePsychology />, color: '#A66BFF' },
    { key: 'recovery', label: ['Восстановление', 'Recovery'], icon: <MdSelfImprovement />, color: '#2FD6BD' },
    { key: 'sleep', label: ['Сон', 'Sleep'], icon: <MdBedtime />, color: '#7C6CFF' },
    { key: 'todo', label: ['Задачи', 'Tasks'], icon: <MdChecklist />, color: '#149DFF' }
];

const sectionMenuIds = {
    habits: 'HabitsMain',
    training: 'TrainingMain',
    mental: 'MentalMain',
    recovery: 'RecoveryMain',
    sleep: 'SleepMain',
    todo: 'ToDoMain'
};

const menuIds = ['MainCard', ...Object.values(sectionMenuIds)];

const sourceOptions = [
    ['Друг', 'Friend'],
    ['Telegram'],
    ['Реклама', 'Ad'],
    ['Поиск', 'Search']
];

const buildMenuStateFromPreferredSections = (preferredSections, currentState = {}) => {
    const selectedMenuIds = new Set((preferredSections || []).map(key => sectionMenuIds[key]).filter(Boolean));
    const hasSelection = selectedMenuIds.size > 0;

    return menuIds.reduce((state, id) => {
        const isMain = id === 'MainCard';
        const hidden = hasSelection ? !isMain && !selectedMenuIds.has(id) : false;
        state[id] = {
            ...(currentState[id] || {}),
            pinned: hidden ? false : currentState[id]?.pinned || false,
            hidden
        };
        return state;
    }, {});
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
        AppData.menuCardsStates = buildMenuStateFromPreferredSections(preferredSections, AppData.menuCardsStates);
        const selectedHeroWidgets = preferredSections.map(key => sectionMenuIds[key]).filter(Boolean).slice(0, 3);
        if (selectedHeroWidgets.length > 0) AppData.mainHeroWidgets = selectedHeroWidgets;
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

    const selectedGoal = currentGoalNames[goal] || currentGoalNames[1];
    const activeGoalMeta = goalMeta[goal] || goalMeta[1];
    const displayName = nicknameMode === 'custom' && customNickname.trim()
        ? customNickname.trim()
        : (UserData.name || (lang === 0 ? 'гость' : 'guest'));
    const profileAccent = gender === 1 ? genderAccents.female : genderAccents.male;
    const s = styles(theme, profileAccent);

    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={s.container}
        >
            <div style={s.ambientA} />
            <div style={s.ambientB} />
            <div style={s.gridWash} />

            <div style={s.header}>
                <div style={s.brandMark}>
                    <MdPerson size={20} />
                </div>
                <div style={s.headerText}>
                    <div style={s.kicker}>{lang === 0 ? 'Старт профиля' : 'Profile setup'}</div>
                    <h1 style={s.title}>{lang === 0 ? 'Настройка' : 'Setup'}</h1>
                </div>
                <MotionButton type="button" whileTap={{ scale: 0.95 }} onClick={skipOnboarding} style={s.skipBtn}>
                    {lang === 0 ? 'Позже' : 'Later'}
                </MotionButton>
            </div>

            <div style={s.content} className="no-scrollbar">
                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={s.heroCard}>
                    <div style={s.heroCopy}>
                        <div style={s.heroPill}>{lang === 0 ? '1 минута' : '1 minute'}</div>
                        <div style={s.heroTitle}>{lang === 0 ? 'Личный старт' : 'Personalized start'}</div>
                        <div style={s.heroText}>
                            {lang === 0
                                ? 'База для дневника и прогресса. Всё можно изменить позже.'
                                : 'Baseline for logs and progress. You can edit it later.'}
                        </div>
                    </div>
                    <div style={s.avatarOrb}>
                        <span>{displayName.charAt(0).toUpperCase()}</span>
                    </div>
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }} style={s.identityCard}>
                    <SectionHeader
                        eyebrow={lang === 0 ? 'Имя' : 'Name'}
                        title={lang === 0 ? 'Как к вам обращаться' : 'How should we call you'}
                        theme={theme}
                        styles={s}
                    />
                    <div style={s.modeGrid}>
                        <ModeButton active={nicknameMode === 'telegram'} icon={<FaTelegramPlane />} label={lang === 0 ? 'Ник Telegram' : 'Telegram'} onClick={() => setNicknameMode('telegram')} styles={s} />
                        <ModeButton active={nicknameMode === 'custom'} icon={<MdPerson />} label={lang === 0 ? 'Свой ник' : 'Custom'} onClick={() => setNicknameMode('custom')} styles={s} />
                    </div>
                    <div style={s.telegramName}>
                        <span>{lang === 0 ? 'Сейчас:' : 'Current:'}</span>
                        <strong>{displayName}</strong>
                    </div>
                    {nicknameMode === 'custom' && (
                        <input
                            value={customNickname}
                            onChange={(e) => setCustomNickname(e.target.value)}
                            placeholder={lang === 0 ? 'Введите ник' : 'Enter nickname'}
                            style={s.input}
                        />
                    )}
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} style={s.metricsCard}>
                    <SectionHeader
                        eyebrow={lang === 0 ? 'Параметры' : 'Metrics'}
                        title={lang === 0 ? 'Настройка тела' : 'Body setup'}
                        theme={theme}
                        styles={s}
                    />
                    <div style={s.metricStack}>
                        <MetricControl icon={<MdPerson />} label={lang === 0 ? 'Возраст' : 'Age'} value={age} onChange={setAge} min={10} max={100} step={1} theme={theme} tone={profileAccent} suffix={lang === 0 ? 'лет' : 'y'} />
                        <MetricControl icon={<MdHeight />} label={lang === 0 ? 'Рост' : 'Height'} value={height} onChange={setHeight} min={50} max={250} step={1} theme={theme} tone={profileAccent} suffix={lang === 0 ? 'см' : 'cm'} />
                        <MetricControl icon={<MdStraighten />} label={lang === 0 ? 'Запястье' : 'Wrist'} value={wrist} onChange={setWrist} min={10} max={40} step={0.5} theme={theme} tone={profileAccent} suffix={lang === 0 ? 'см' : 'cm'} />
                        <div style={s.genderCard}>
                            <div style={s.metricTop}>
                                <span style={{ ...s.metricIcon, color: profileAccent }}>{gender === 0 ? <IoMdMale /> : <IoMdFemale />}</span>
                                <span style={s.metricLabel}>{lang === 0 ? 'Пол' : 'Gender'}</span>
                            </div>
                            <div style={s.genderControls}>
                                <GenderToggle active={gender === 0} icon={<IoMdMale />} label={lang === 0 ? 'Муж' : 'Male'} color={profileAccent} onClick={() => setGender(0)} styles={s} />
                                <GenderToggle active={gender === 1} icon={<IoMdFemale />} label={lang === 0 ? 'Жен' : 'Female'} color={profileAccent} onClick={() => setGender(1)} styles={s} />
                            </div>
                        </div>
                    </div>
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }} style={s.goalCard}>
                    <SectionHeader
                        eyebrow={lang === 0 ? 'Цель' : 'Goal'}
                        title={lang === 0 ? 'Цель тренировок' : 'Training goal'}
                        theme={theme}
                        styles={s}
                    />
                    <div style={s.goalStatus}>
                        <span style={s.goalStatusLabel}>{lang === 0 ? 'Выбрано' : 'Selected'}</span>
                        <strong style={s.goalStatusValue}>{selectedGoal}</strong>
                    </div>
                    <div style={s.goalGrid}>
                        {currentGoalNames.map((name, index) => {
                            const selected = index === goal;
                            const meta = goalMeta[index];
                            return (
                                <MotionButton
                                    key={name}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setGoal(index)}
                                    style={s.goalChip(selected, meta.color)}
                                >
                                    <span style={s.goalIcon(selected, meta.color)}>{meta.icon}</span>
                                    <span>{name}</span>
                                </MotionButton>
                            );
                        })}
                    </div>
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.21 }} style={s.discoveryCard}>
                    <SectionHeader
                        eyebrow={lang === 0 ? 'Источник' : 'Source'}
                        title={lang === 0 ? 'Откуда узнали о нас' : 'How did you find us'}
                        theme={theme}
                        styles={s}
                    />
                    <div style={s.sourceGrid}>
                        {sourceOptions.map((item) => {
                            const label = item[lang] || item[0];
                            const active = discoverySource.trim().toLowerCase() === label.toLowerCase();
                            return (
                                <MotionButton
                                    key={label}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setDiscoverySource(label)}
                                    style={s.sourceChip(active)}
                                >
                                    {label}
                                </MotionButton>
                            );
                        })}
                    </div>
                    <input
                        value={discoverySource}
                        onChange={(e) => setDiscoverySource(e.target.value)}
                        placeholder={lang === 0 ? 'Или напишите свой вариант' : 'Or type your own'}
                        style={s.input}
                    />
                </MotionDiv>

                <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={s.sectionsCard}>
                    <SectionHeader
                        eyebrow={lang === 0 ? 'Разделы' : 'Sections'}
                        title={lang === 0 ? 'Что хотите видеть первым' : 'What should be first'}
                        theme={theme}
                        styles={s}
                    />
                    <div style={s.sectionsHint}>
                        {lang === 0
                            ? 'Выбранные разделы появятся на главном экране. Остальные останутся в скрытых.'
                            : 'Selected sections will appear on the home screen. The rest stay hidden.'}
                    </div>
                    <div style={s.sectionGrid}>
                        {sectionOptions.map(option => {
                            const selected = preferredSections.includes(option.key);
                            return (
                                <MotionButton
                                    key={option.key}
                                    type="button"
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => toggleSection(option.key)}
                                    style={s.sectionChip(selected, option.color)}
                                >
                                    <span style={s.sectionIcon(selected, option.color)}>{option.icon}</span>
                                    <span>{option.label[lang]}</span>
                                </MotionButton>
                            );
                        })}
                    </div>
                </MotionDiv>

                <div style={s.scrollSpacer} />
            </div>

            <div style={s.footer}>
                <MotionButton type="button" whileTap={{ scale: 0.96 }} onClick={completeOnboarding} style={s.primaryBtn}>
                    <MdDone size={23} />
                    {lang === 0 ? 'Сохранить профиль' : 'Save profile'}
                </MotionButton>
            </div>
        </MotionDiv>
    );
};

const SectionHeader = ({ eyebrow, title, theme, aside, styles: providedStyles }) => {
    const s = providedStyles || styles(theme);
    return (
    <div style={s.sectionHeader}>
        <div>
            <div style={s.sectionEyebrow}>{eyebrow}</div>
            <div style={s.sectionTitle}>{title}</div>
        </div>
        {aside && <div style={s.sectionAside}>{aside}</div>}
    </div>
    );
};

const ModeButton = ({ active, icon, label, onClick, styles: s }) => (
    <MotionButton type="button" whileTap={{ scale: 0.98 }} onClick={onClick} style={s.modeButton(active)}>
        <span style={s.modeIcon(active)}>{icon}</span>
        <span>{label}</span>
    </MotionButton>
);

const clampMetric = (value, min, max, step) => {
    const decimals = Number.isInteger(step) ? 0 : 1;
    return Number(Math.min(max, Math.max(min, value)).toFixed(decimals));
};

const MetricControl = ({ icon, label, value, onChange, min, max, step, theme, tone, suffix }) => {
    const s = styles(theme, tone);
    const changeValue = (direction) => onChange(clampMetric(value + (direction * step), min, max, step));

    return (
        <div style={s.metricControl(tone)}>
            <div style={s.metricControlTop}>
                <span style={s.metricGlyph(tone)}>{icon}</span>
                <div style={s.metricCopy}>
                    <span style={s.metricLabel}>{label}</span>
                    <small style={s.metricRange}>{min}-{max} {suffix}</small>
                </div>
            </div>

            <div style={s.metricValue}>
                <strong style={s.metricNumber}>{value}</strong>
                <span style={s.metricUnit}>{suffix}</span>
            </div>
            <div style={s.metricActions}>
                <MotionButton type="button" whileTap={{ scale: 0.94 }} onClick={() => changeValue(-1)} style={s.metricActionBtn(tone)}>-</MotionButton>
                <MotionButton type="button" whileTap={{ scale: 0.94 }} onClick={() => changeValue(1)} style={s.metricActionBtn(tone)}>+</MotionButton>
            </div>
        </div>
    );
};

const GenderToggle = ({ active, icon, label, color, onClick, styles: s }) => (
    <MotionButton type="button" whileTap={{ scale: 0.92 }} onClick={onClick} style={s.genderToggle(active, color)}>
        <span>{icon}</span>
        <small style={s.genderLabel}>{label}</small>
    </MotionButton>
);

const hexToRgb = (hex) => {
    const clean = hex.replace('#', '');
    const value = Number.parseInt(clean, 16);
    return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
};

const styles = (theme, activeColor = genderAccents.male) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const background = Colors.get('background', theme);
    const panel = isLight ? 'rgba(255,255,255,0.82)' : 'rgba(18,25,30,0.88)';
    const panelStrong = isLight ? 'rgba(255,255,255,0.95)' : 'rgba(17,24,29,0.94)';
    const border = isLight ? 'rgba(15,23,42,0.09)' : 'rgba(156,190,204,0.14)';
    const activeRgb = hexToRgb(activeColor);
    const isFemaleAccent = activeColor.toLowerCase() === genderAccents.female.toLowerCase();
    const secondaryAccent = isFemaleAccent ? '#B85C8C' : '#2EAAA2';
    const deepSurface = isFemaleAccent ? '#18131A' : '#111A20';

    return {
        container: {
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            background: isLight
                ? `radial-gradient(circle at 18% -10%, rgba(${activeRgb},0.20), transparent 34%), radial-gradient(circle at 92% 12%, rgba(24,194,143,0.14), transparent 32%), ${background}`
                : `radial-gradient(circle at 18% -8%, rgba(${activeRgb},0.16), transparent 34%), radial-gradient(circle at 92% 10%, rgba(${activeRgb},0.075), transparent 30%), linear-gradient(180deg, ${deepSurface} 0%, #11171C 58%, #0F1418 100%)`,
            color: text,
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            display: 'flex',
            flexDirection: 'column'
        },
        ambientA: {
            position: 'absolute',
            width: 260,
            height: 260,
            borderRadius: '50%',
            left: -110,
            top: 120,
            background: `rgba(${activeRgb},0.10)`,
            filter: 'blur(54px)',
            pointerEvents: 'none'
        },
        ambientB: {
            position: 'absolute',
            width: 220,
            height: 220,
            borderRadius: '50%',
            right: -110,
            top: 340,
            background: `rgba(${activeRgb},0.06)`,
            filter: 'blur(58px)',
            pointerEvents: 'none'
        },
        gridWash: {
            position: 'absolute',
            inset: 0,
            opacity: isLight ? 0.12 : 0.12,
            backgroundImage: 'linear-gradient(rgba(156,190,204,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(156,190,204,0.045) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'linear-gradient(180deg, black 0%, transparent 70%)',
            pointerEvents: 'none'
        },
        header: {
            position: 'relative',
            zIndex: 2,
            padding: 'calc(env(safe-area-inset-top, 0px) + 12px) 14px 6px',
            display: 'grid',
            gridTemplateColumns: '44px minmax(0, 1fr) auto',
            alignItems: 'center',
            gap: '10px',
            maxWidth: 440,
            width: '100%',
            boxSizing: 'border-box',
            alignSelf: 'center'
        },
        brandMark: {
            width: 44,
            height: 44,
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: activeColor,
            background: isLight ? `rgba(${activeRgb},0.12)` : `rgba(${activeRgb},0.16)`,
            border: `1px solid rgba(${activeRgb},0.30)`,
            boxShadow: `0 14px 28px rgba(${activeRgb},0.12)`
        },
        headerText: { minWidth: 0 },
        kicker: {
            color: activeColor,
            fontSize: '11px',
            fontWeight: 950,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 4
        },
        title: {
            color: text,
            fontSize: 28,
            lineHeight: 1.02,
            margin: 0,
            fontWeight: 950,
            letterSpacing: 0
        },
        skipBtn: {
            border: `1px solid ${border}`,
            background: panel,
            color: sub,
            borderRadius: 999,
            minHeight: 38,
            padding: '0 13px',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: isLight ? '0 10px 24px rgba(15,23,42,0.06)' : '0 14px 30px rgba(0,0,0,0.22)',
            fontFamily: 'inherit'
        },
        content: {
            position: 'relative',
            zIndex: 1,
            flex: 1,
            overflowY: 'auto',
            padding: '8px 14px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: '100%',
            maxWidth: 440,
            alignSelf: 'center',
            boxSizing: 'border-box'
        },
        heroCard: {
            position: 'relative',
            flexShrink: 0,
            minHeight: 118,
            borderRadius: 26,
            padding: 14,
            overflow: 'hidden',
            background: isLight
                ? `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(${activeRgb},0.11))`
                : `linear-gradient(145deg, rgba(24,34,41,0.95), rgba(${activeRgb},0.075), rgba(13,19,23,0.96))`,
            border: `1px solid rgba(${activeRgb},0.22)`,
            boxShadow: isLight ? '0 18px 44px rgba(15,23,42,0.08)' : '0 20px 52px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.045)',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 78px',
            gap: 10,
            boxSizing: 'border-box'
        },
        heroCopy: { minWidth: 0, alignSelf: 'center' },
        heroPill: {
            width: 'fit-content',
            marginBottom: 7,
            padding: '5px 9px',
            borderRadius: 999,
            color: activeColor,
            background: `rgba(${activeRgb},0.14)`,
            border: `1px solid rgba(${activeRgb},0.28)`,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
        },
        heroTitle: {
            color: text,
            fontSize: 22,
            lineHeight: 1,
            fontWeight: 950,
            marginBottom: 6
        },
        heroText: {
            color: sub,
            fontSize: 13,
            lineHeight: 1.32,
            fontWeight: 750,
            maxWidth: 230
        },
        avatarOrb: {
            width: 76,
            height: 76,
            borderRadius: 24,
            alignSelf: 'center',
            justifySelf: 'end',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#061017',
            fontSize: 34,
            fontWeight: 950,
            background: isLight
                ? `linear-gradient(145deg, rgba(${activeRgb},0.92), ${secondaryAccent})`
                : `linear-gradient(145deg, rgba(${activeRgb},0.66), color-mix(in srgb, ${secondaryAccent} 68%, #0F1418))`,
            boxShadow: `0 18px 38px rgba(${activeRgb},0.16), inset 0 1px 0 rgba(255,255,255,0.14)`
        },
        identityCard: sectionPanel(panelStrong, border, isLight, activeRgb),
        metricsCard: sectionPanel(panelStrong, border, isLight, activeRgb),
        goalCard: sectionPanel(panelStrong, border, isLight, activeRgb),
        discoveryCard: sectionPanel(panelStrong, border, isLight, activeRgb),
        sectionsCard: sectionPanel(panelStrong, border, isLight, activeRgb),
        sectionHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 14
        },
        sectionEyebrow: {
            color: sub,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            marginBottom: 4
        },
        sectionTitle: {
            color: text,
            fontSize: 18,
            lineHeight: 1.15,
            fontWeight: 950
        },
        sectionAside: {
            maxWidth: '50%',
            minHeight: 28,
            padding: '6px 10px',
            borderRadius: 999,
            color: activeColor,
            background: `rgba(${activeRgb},0.12)`,
            border: `1px solid rgba(${activeRgb},0.24)`,
            fontSize: 11,
            fontWeight: 900,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        },
        modeGrid: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10
        },
        modeButton: (active) => ({
            minHeight: 58,
            borderRadius: 18,
            border: `1px solid ${active ? `rgba(${activeRgb},0.46)` : border}`,
            background: active ? `linear-gradient(135deg, rgba(${activeRgb},0.20), rgba(${activeRgb},0.075))` : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.045)'),
            color: active ? activeColor : text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 14,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
        }),
        modeIcon: (active) => ({
            display: 'flex',
            color: active ? activeColor : sub,
            fontSize: 17
        }),
        telegramName: {
            marginTop: 12,
            minHeight: 38,
            borderRadius: 16,
            padding: '0 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            color: sub,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
            border: `1px solid ${border}`,
            fontSize: 13,
            fontWeight: 800,
            overflow: 'hidden'
        },
        input: {
            width: '100%',
            boxSizing: 'border-box',
            border: `1px solid ${border}`,
            borderRadius: 17,
            background: isLight ? 'rgba(248,250,252,0.95)' : 'rgba(255,255,255,0.045)',
            color: text,
            padding: '14px 15px',
            fontSize: 15,
            fontWeight: 800,
            outline: 'none',
            marginTop: 10,
            fontFamily: 'inherit'
        },
        metricStack: {
            display: 'flex',
            flexDirection: 'column',
            gap: 9
        },
        metricControl: (tone) => ({
            minHeight: 104,
            borderRadius: 20,
            padding: '11px',
            background: isLight ? 'rgba(248,250,252,0.78)' : 'linear-gradient(135deg, rgba(156,190,204,0.055), rgba(255,255,255,0.025))',
            border: `1px solid ${border}`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${isLight ? 0.78 : 0.045})`,
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 92px',
            gridTemplateRows: 'auto 38px',
            gridTemplateAreas: '"info value" "actions actions"',
            alignItems: 'center',
            columnGap: 10,
            rowGap: 10,
            overflow: 'hidden'
        }),
        metricControlTop: {
            gridArea: 'info',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            minWidth: 0
        },
        metricGlyph: (tone) => ({
            width: 36,
            height: 36,
            borderRadius: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tone,
            background: `rgba(${activeRgb},0.13)`,
            border: `1px solid rgba(${activeRgb},0.20)`,
            flexShrink: 0,
            fontSize: 18
        }),
        metricCopy: {
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
        },
        metricRange: {
            color: sub,
            fontSize: 10,
            fontWeight: 800,
            opacity: 0.72,
            whiteSpace: 'nowrap'
        },
        metricActions: {
            gridArea: 'actions',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            minWidth: 0
        },
        metricActionBtn: (tone) => ({
            width: '100%',
            height: 38,
            borderRadius: 14,
            border: `1px solid rgba(${activeRgb},0.25)`,
            background: isLight ? 'rgba(255,255,255,0.80)' : 'rgba(156,190,204,0.065)',
            color: tone,
            fontSize: 18,
            fontWeight: 950,
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
        }),
        metricValue: {
            gridArea: 'value',
            width: 92,
            height: 42,
            borderRadius: 15,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(7,12,15,0.52)',
            border: `1px solid ${border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            color: text,
            overflow: 'hidden',
            boxSizing: 'border-box'
        },
        metricNumber: {
            fontSize: 24,
            lineHeight: 1,
            fontWeight: 950,
            letterSpacing: 0
        },
        metricUnit: {
            color: sub,
            fontSize: 9,
            fontWeight: 950,
            textTransform: 'uppercase'
        },
        metricCard: (tone) => ({
            minHeight: 146,
            borderRadius: 23,
            padding: '11px 9px 9px',
            background: isLight
                ? `linear-gradient(160deg, rgba(255,255,255,0.92), ${tone}16)`
                : `linear-gradient(160deg, rgba(255,255,255,0.060), ${tone}14)`,
            border: `1px solid ${tone}38`,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,${isLight ? 0.85 : 0.05}), 0 14px 32px ${tone}16`,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden'
        }),
        metricTop: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginBottom: 7
        },
        metricIcon: {
            display: 'flex',
            fontSize: 18
        },
        metricLabel: {
            color: sub,
            fontSize: 12,
            fontWeight: 950
        },
        pickerShell: {
            height: 100,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        metricSuffix: {
            position: 'absolute',
            right: 12,
            bottom: 12,
            color: sub,
            fontSize: 10,
            fontWeight: 900,
            opacity: 0.72
        },
        genderCard: {
            minHeight: 74,
            borderRadius: 20,
            padding: '10px 11px',
            background: isLight ? 'rgba(248,250,252,0.78)' : 'linear-gradient(135deg, rgba(156,190,204,0.055), rgba(255,255,255,0.025))',
            border: `1px solid ${border}`,
            boxSizing: 'border-box',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 150px',
            alignItems: 'center',
            gap: 10
        },
        genderControls: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            minHeight: 46
        },
        genderToggle: (active, color) => ({
            minWidth: 0,
            border: `1px solid ${active ? `${color}66` : border}`,
            background: active ? `linear-gradient(135deg, rgba(${activeRgb},0.82), rgba(${activeRgb},0.58))` : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(156,190,204,0.055)'),
            color: active ? '#061017' : sub,
            borderRadius: 15,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            fontSize: 19,
            fontWeight: 950,
            cursor: 'pointer',
            fontFamily: 'inherit',
            overflow: 'hidden'
        }),
        genderLabel: {
            fontSize: 12,
            lineHeight: 1,
            fontWeight: 950
        },
        goalGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 9
        },
        goalStatus: {
            minHeight: 42,
            margin: '-4px 0 12px',
            padding: '0 13px',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            color: text,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
            border: `1px solid ${border}`,
            boxSizing: 'border-box'
        },
        goalStatusLabel: {
            color: sub,
            fontSize: 11,
            fontWeight: 950,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
        },
        goalStatusValue: {
            minWidth: 0,
            color: activeColor,
            fontSize: 13,
            fontWeight: 950,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            textAlign: 'right'
        },
        goalChip: (selected, color) => ({
            minHeight: 58,
            borderRadius: 18,
            border: `1px solid ${selected ? `rgba(${activeRgb},0.45)` : border}`,
            background: selected ? `rgba(${activeRgb},0.13)` : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.045)'),
            color: selected ? activeColor : text,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '0 11px',
            fontSize: 13,
            fontWeight: 900,
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
        }),
        goalIcon: (selected, color) => ({
            width: 32,
            height: 32,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? '#061017' : activeColor,
            background: selected ? activeColor : `rgba(${activeRgb},0.12)`,
            flexShrink: 0
        }),
        sourceGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 8
        },
        sourceChip: (active) => ({
            minHeight: 40,
            borderRadius: 14,
            border: `1px solid ${active ? `rgba(${activeRgb},0.48)` : border}`,
            background: active ? `rgba(${activeRgb},0.15)` : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.045)'),
            color: active ? activeColor : sub,
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'inherit',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
        }),
        sectionGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 9
        },
        sectionsHint: {
            margin: '-4px 0 12px',
            padding: '10px 12px',
            borderRadius: 16,
            color: sub,
            background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
            border: `1px solid ${border}`,
            fontSize: 12,
            lineHeight: 1.35,
            fontWeight: 750
        },
        sectionChip: (selected, color) => ({
            minHeight: 54,
            borderRadius: 18,
            border: `1px solid ${selected ? `rgba(${activeRgb},0.45)` : border}`,
            background: selected ? `rgba(${activeRgb},0.13)` : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.045)'),
            color: selected ? activeColor : text,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            padding: '0 10px',
            fontSize: 12,
            fontWeight: 900,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            overflow: 'hidden'
        }),
        sectionIcon: (selected, color) => ({
            width: 30,
            height: 30,
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: selected ? '#061017' : activeColor,
            background: selected ? activeColor : `rgba(${activeRgb},0.12)`,
            flexShrink: 0
        }),
        scrollSpacer: { height: 14, flexShrink: 0 },
        footer: {
            position: 'relative',
            zIndex: 4,
            width: '100%',
            maxWidth: 440,
            alignSelf: 'center',
            padding: '6px 14px calc(env(safe-area-inset-bottom, 0px) + 12px)',
            display: 'block',
            boxSizing: 'border-box',
            background: isLight
                ? 'linear-gradient(180deg, rgba(244,245,247,0), rgba(244,245,247,0.96) 30%)'
                : 'linear-gradient(180deg, rgba(15,20,24,0), rgba(15,20,24,0.97) 30%)'
        },
        secondaryBtn: {
            border: `1px solid ${border}`,
            background: panelStrong,
            color: sub,
            borderRadius: 21,
            minHeight: 58,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 15,
            fontWeight: 950,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: isLight ? '0 12px 28px rgba(15,23,42,0.06)' : '0 18px 38px rgba(0,0,0,0.28)'
        },
        primaryBtn: {
            border: '1px solid rgba(255,255,255,0.20)',
            background: isLight
                ? `linear-gradient(135deg, rgba(${activeRgb},0.90) 0%, ${secondaryAccent} 100%)`
                : `linear-gradient(135deg, rgba(${activeRgb},0.58) 0%, color-mix(in srgb, ${secondaryAccent} 62%, #0F1418) 100%)`,
            color: '#fff',
            borderRadius: 22,
            minHeight: 58,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            fontSize: 16,
            fontWeight: 950,
            cursor: 'pointer',
            fontFamily: 'inherit',
            boxShadow: `0 14px 34px rgba(${activeRgb},0.16), inset 0 1px 0 rgba(255,255,255,0.14)`
        }
    };
};

const sectionPanel = (panel, border, isLight, activeRgb) => ({
    position: 'relative',
    flexShrink: 0,
    borderRadius: 26,
    padding: 15,
    background: isLight
        ? panel
        : `linear-gradient(150deg, rgba(19,27,32,0.96), rgba(${activeRgb},0.045), rgba(14,20,24,0.96))`,
    border: `1px solid ${isLight ? border : `rgba(${activeRgb},0.14)`}`,
    boxShadow: isLight ? `0 14px 34px rgba(15,23,42,0.07), inset 0 1px 0 rgba(255,255,255,0.82)` : `0 18px 42px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.04)`,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    boxSizing: 'border-box',
    overflow: 'hidden',
    outline: `1px solid ${isLight ? border : 'rgba(255,255,255,0.045)'}`
});

export default ProfileOnboarding;
