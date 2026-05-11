import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AppData, UserData } from '../../StaticClasses/AppData.js';
import { NotificationsManager } from '../../StaticClasses/NotificationsManager.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, premium$, setPage } from '../../StaticClasses/HabitsBus';
import {
    FaBrain,
    FaBullseye,
    FaCalculator,
    FaChevronDown,
    FaCrown,
    FaGlobe,
    FaInfinity,
    FaMedal,
    FaPuzzlePiece,
    FaStar,
    FaStarHalf,
    FaTrophy,
    FaUserAlt,
    FaUserFriends,
    FaUserShield,
    FaSlidersH
} from 'react-icons/fa';
import { GiCrownedSkull, GiStarsStack } from 'react-icons/gi';

const ADMIN_IDS = [768852208, 8484480648];

const CATEGORY_META = [
    {
        Icon: FaCalculator,
        title: ['Счет', 'Math'],
        subtitle: ['Быстрый счет, точность и темп', 'Quick math, accuracy, and pace'],
        hue: '#66D9E8',
        rgb: '102,217,232'
    },
    {
        Icon: FaBrain,
        title: ['Память', 'Memory'],
        subtitle: ['N-back и последовательности', 'N-back and sequences'],
        hue: '#8A7CD6',
        rgb: '138,124,214'
    },
    {
        Icon: FaPuzzlePiece,
        title: ['Логика', 'Logic'],
        subtitle: ['Паттерны, связи и лишние элементы', 'Patterns, links, and odd elements'],
        hue: '#7FC8B8',
        rgb: '127,200,184'
    },
    {
        Icon: FaBullseye,
        title: ['Фокус', 'Focus'],
        subtitle: ['Концентрация, контроль и реакция', 'Concentration, control, and reaction'],
        hue: '#D49A5C',
        rgb: '212,154,92'
    }
];

const DIFFICULTY_META = [
    { Icon: FaStarHalf, label: ['Легко', 'Easy'], hue: '#4DFF88' },
    { Icon: FaStar, label: ['Средне', 'Medium'], hue: '#00D9FF' },
    { Icon: GiStarsStack, label: ['Сложно', 'Hard'], hue: '#A64DFF' },
    { Icon: GiCrownedSkull, label: ['Про', 'Pro'], hue: '#FFD700' },
    { Icon: FaInfinity, label: ['Без конца', 'Endless'], hue: '#FF5A68' }
];

const PERIOD_META = [
    { key: 'day', label: ['День', 'Day'] },
    { key: 'week', label: ['Неделя', 'Week'] },
    { key: 'month', label: ['Месяц', 'Month'] },
    { key: 'all', label: ['Все время', 'All time'] }
];

const LEAGUE_META = [
    { key: 'all', label: ['Все лиги', 'All leagues'], hue: '#66D9E8', rgb: '102,217,232', min: 0, max: Infinity },
    { key: 'start', label: ['Старт', 'Start'], hue: '#9FA8B6', rgb: '159,168,182', min: 0, max: 499 },
    { key: 'silver', label: ['Серебро', 'Silver'], hue: '#C9D3E0', rgb: '201,211,224', min: 500, max: 1499 },
    { key: 'gold', label: ['Золото', 'Gold'], hue: '#FFD84A', rgb: '255,216,74', min: 1500, max: 2499 },
    { key: 'elite', label: ['Элита', 'Elite'], hue: '#8A7CD6', rgb: '138,124,214', min: 2500, max: Infinity }
];

const PODIUM_TONES = {
    1: { hue: '#FFD84A', rgb: '255,216,74', Icon: FaTrophy, label: ['Лидер', 'Leader'] },
    2: { hue: '#D8DFEA', rgb: '216,223,234', Icon: FaMedal, label: ['Второе место', 'Second'] },
    3: { hue: '#D89448', rgb: '216,148,72', Icon: FaMedal, label: ['Третье место', 'Third'] }
};

const TYPE_KEYS = ['MATH', 'MEMORY', 'LOGIC', 'FOCUS'];
const DIFFICULTY_KEYS = ['NOVICE', 'MIDDLE', 'PRO', 'INSANE', 'ENDLESS', 'RELAXE'];

const normalizePhoto = (photo) => Array.isArray(photo) ? photo[0] : photo;

const normalizeRecordsPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.players)) return payload.players;
    if (Array.isArray(payload?.records)) return payload.records;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
};

const resolvePlayerPhoto = (item, isUser) => {
    const direct = normalizePhoto(item?.photo || item?.photo_url || item?.avatar || item?.image || item?.picture);
    if (direct) return direct;
    if (isUser) return normalizePhoto(UserData.photo);

    const friend = (UserData.friends || []).find(friendItem => Number(friendItem.uid || friendItem.id) === Number(item?.uid));
    return normalizePhoto(friend?.photo || friend?.photo_url || friend?.avatar || friend?.image || friend?.picture);
};

const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const getMatrixScore = (matrix, categoryIndex, difficultyIndex) => toNumber(matrix?.[categoryIndex]?.[difficultyIndex]);

const getAllTimeScore = (item, categoryIndex, difficultyIndex) => {
    return getMatrixScore(item?.data || item?.mentalRecords || item?.records, categoryIndex, difficultyIndex);
};

const periodStartDate = (periodKey) => {
    if (periodKey === 'all') return null;
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (periodKey === 'week') start.setDate(start.getDate() - 6);
    if (periodKey === 'month') start.setDate(start.getDate() - 29);

    return start;
};

const getPeriodMatrixScore = (item, periodKey, categoryIndex, difficultyIndex) => {
    const sources = [
        item?.periodRecords,
        item?.recordsByPeriod,
        item?.mentalRecordsByPeriod,
        item?.scoresByPeriod
    ];

    for (const source of sources) {
        const score = getMatrixScore(source?.[periodKey], categoryIndex, difficultyIndex);
        if (score > 0) return score;
    }

    return null;
};

const getLogPeriodScore = (item, periodKey, categoryIndex, difficultyIndex) => {
    const log = item?.mentalLog || item?.log || item?.logs;
    if (!log || typeof log !== 'object') return null;

    const startDate = periodStartDate(periodKey);
    const type = TYPE_KEYS[categoryIndex];
    const difficulty = DIFFICULTY_KEYS[difficultyIndex];
    let score = 0;
    let found = false;

    Object.entries(log).forEach(([dateKey, sessions]) => {
        const date = new Date(dateKey);
        if (Number.isNaN(date.getTime())) return;
        if (startDate && date < startDate) return;

        const entries = Array.isArray(sessions) ? sessions : [sessions];
        entries.forEach((session) => {
            const sessionType = String(session?.type || '').toUpperCase();
            const sessionDifficulty = String(session?.difficulty || '').toUpperCase();
            if (sessionType && sessionType !== type) return;
            if (sessionDifficulty && sessionDifficulty !== difficulty) return;
            const sessionScore = toNumber(session?.scores ?? session?.score ?? session?.record);
            if (sessionScore > 0) {
                score += sessionScore;
                found = true;
            }
        });
    });

    return found ? score : null;
};

const getPeriodScore = (item, periodKey, categoryIndex, difficultyIndex) => {
    if (periodKey === 'all') return getAllTimeScore(item, categoryIndex, difficultyIndex);

    const matrixScore = getPeriodMatrixScore(item, periodKey, categoryIndex, difficultyIndex);
    if (matrixScore !== null) return matrixScore;

    const logScore = getLogPeriodScore(item, periodKey, categoryIndex, difficultyIndex);
    if (logScore !== null) return logScore;

    return getAllTimeScore(item, categoryIndex, difficultyIndex);
};

const getLeague = (score) => {
    return LEAGUE_META.find((league) => league.key !== 'all' && score >= league.min && score <= league.max) || LEAGUE_META[1];
};

const Records = () => {
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);
    const [categoryIndex, setCategoryIndex] = useState(0);
    const [difficultyIndex, setDifficultyIndex] = useState(0);
    const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
    const [globalData, setGlobalData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterMode, setFilterMode] = useState(0);
    const [periodIndex, setPeriodIndex] = useState(3);
    const [leagueIndex, setLeagueIndex] = useState(0);
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const fetchGlobalData = async () => {
            try {
                const data = normalizeRecordsPayload(await NotificationsManager.getMentalRecordsGlobal());

                if (data.length === 0) {
                    setGlobalData([{
                        uid: UserData.id,
                        name: UserData?.name || 'User',
                        photo: UserData.photo,
                        data: AppData.mentalRecords,
                        mentalLog: AppData.mentalLog
                    }]);
                } else {
                    setGlobalData(data);
                }
            } catch (err) {
                setGlobalData([{
                    uid: UserData.id,
                    name: UserData?.name || 'User',
                    photo: UserData.photo,
                    data: AppData.mentalRecords,
                    mentalLog: AppData.mentalLog
                }]);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, []);

    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        const sub4 = premium$.subscribe(setHasPremium);
        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
            sub4.unsubscribe();
        };
    }, []);

    const category = CATEGORY_META[categoryIndex];
    const currentDifficulties = categoryIndex > 0 ? DIFFICULTY_META.slice(0, -1) : DIFFICULTY_META;
    const s = styles(theme, fSize, category);
    const period = PERIOD_META[periodIndex];
    const league = LEAGUE_META[leagueIndex];

    const rankedData = [...globalData]
        .map((item) => {
            const score = getPeriodScore(item, period.key, categoryIndex, difficultyIndex);
            return { ...item, score };
        })
        .filter((item) => league.key === 'all' || (item.score >= league.min && item.score <= league.max))
        .sort((a, b) => b.score - a.score);

    const friendsData = rankedData.filter(item => {
            const isMe = Number(item.uid) === Number(UserData.id);
            const isFriend = UserData.friends && UserData.friends.some(f => Number(f.uid) === Number(item.uid));
            return isMe || isFriend;
        });

    const shouldUseFriendsData = filterMode === 1 && friendsData.length > 1;
    const sortedData = shouldUseFriendsData ? friendsData : rankedData;

    const topScore = sortedData[0]?.score || 0;

    return (
        <div style={s.container}>
            {!hasPremium && <PremiumOverlay theme={theme} langIndex={langIndex} />}

            <div style={s.pageHeader}>
                <div style={s.pageTitle}>UltyMyLife</div>
                <div style={s.pageSubtitle}>
                    {langIndex === 0 ? 'Тренируй разум как тело' : 'Train your mind like your body'}
                </div>
            </div>

            <div style={s.controlsPanel}>
                <div style={s.controlsHeader}>
                    <div style={s.controlsSide} />
                    <div style={s.controlsCopy}>
                        <div style={s.eyebrow}>{langIndex === 0 ? 'Рейтинг' : 'Leaderboard'}</div>
                        <h1 style={s.controlsTitle}>{category.title[langIndex]}</h1>
                    </div>
                    <ScopeSwitch
                        selectedIndex={filterMode}
                        setSelectedIndex={setFilterMode}
                        theme={theme}
                        langIndex={langIndex}
                    />
                </div>

                <CategoryTabs
                    categories={CATEGORY_META}
                    selectedIndex={categoryIndex}
                    setSelectedIndex={(index) => {
                        setCategoryIndex(index);
                        if (index > 0 && difficultyIndex > 3) setDifficultyIndex(3);
                    }}
                    theme={theme}
                    langIndex={langIndex}
                />

                <CompactFilterBar
                    period={period}
                    difficulty={currentDifficulties[difficultyIndex]}
                    league={league}
                    isOpen={filtersOpen}
                    setIsOpen={setFiltersOpen}
                    theme={theme}
                    langIndex={langIndex}
                    category={category}
                />

                <AnimatePresence initial={false}>
                    {filtersOpen && (
                        <Motion.div
                            initial={{ opacity: 0, height: 0, y: -6 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: 'easeOut' }}
                            style={s.filtersPanel}
                        >
                            <div style={s.filterGroup}>
                                <div style={s.filterLabel}>{langIndex === 0 ? 'Период' : 'Period'}</div>
                                <PeriodTabs
                                    periods={PERIOD_META}
                                    selectedIndex={periodIndex}
                                    setSelectedIndex={setPeriodIndex}
                                    theme={theme}
                                    langIndex={langIndex}
                                    category={category}
                                />
                            </div>

                            <div style={s.filterGroup}>
                                <div style={s.filterLabel}>{langIndex === 0 ? 'Сложность' : 'Difficulty'}</div>
                                <DifficultyTabs
                                    difficulties={currentDifficulties}
                                    selectedIndex={difficultyIndex}
                                    setSelectedIndex={setDifficultyIndex}
                                    theme={theme}
                                    langIndex={langIndex}
                                />
                            </div>

                            <div style={s.filterGroup}>
                                <div style={s.filterLabel}>{langIndex === 0 ? 'Лига' : 'League'}</div>
                                <LeagueTabs
                                    leagues={LEAGUE_META}
                                    selectedIndex={leagueIndex}
                                    setSelectedIndex={setLeagueIndex}
                                    theme={theme}
                                    langIndex={langIndex}
                                />
                            </div>
                        </Motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div style={s.listHeader}>
                <div style={s.listHeaderSpacer} />
                <div style={s.listHeaderCopy}>
                    <div style={s.listTitle}>{langIndex === 0 ? 'Топ игроков' : 'Top players'}</div>
                    <div style={s.listSub}>
                        {sortedData.length} {langIndex === 0 ? 'участников' : 'players'} · {period.label[langIndex]} · {league.label[langIndex]}
                    </div>
                </div>
                <div style={s.bestChip}>
                    <FaTrophy size={12} />
                    <span>{topScore}</span>
                </div>
            </div>

            <div style={s.listContainer} className="no-scrollbar">
                {loading ? (
                    <div style={s.loadingText}>
                        {langIndex === 0 ? 'Загрузка рейтинга...' : 'Loading leaderboard...'}
                    </div>
                ) : (
                    <Motion.div
                        layout
                        style={s.listStack}
                    >
                        <AnimatePresence mode="popLayout">
                            {sortedData.map((item, index) => (
                                <LeaderboardItem
                                    key={`${item.uid || item.name}-${index}`}
                                    theme={theme}
                                    fSize={fSize}
                                    langIndex={langIndex}
                                    isUser={Number(item.uid) === Number(UserData.id)}
                                    isAdmin={item.uid && ADMIN_IDS.includes(Number(item.uid))}
                                    rank={index + 1}
                                    name={item.name}
                                    photo={resolvePlayerPhoto(item, Number(item.uid) === Number(UserData.id))}
                                    score={item.score}
                                    index={index}
                                    category={category}
                                    league={getLeague(item.score)}
                                />
                            ))}
                        </AnimatePresence>

                        {sortedData.length === 0 && (
                            <div style={s.emptyState}>
                                {filterMode === 1
                                    ? (langIndex === 0 ? 'Друзья не найдены' : 'No friends found')
                                    : (langIndex === 0 ? 'Нет данных' : 'No records yet')
                                }
                            </div>
                        )}
                    </Motion.div>
                )}
            </div>
        </div>
    );
};

const PremiumOverlay = ({ theme, langIndex }) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    return (
        <div onClick={(e) => e.stopPropagation()} style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2555,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: isLight ? 'rgba(248,248,250,0.88)' : 'rgba(10,10,14,0.82)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            textAlign: 'center'
        }}>
            <div style={{
                width: 72,
                height: 72,
                background: 'rgba(159,180,196,0.12)',
                borderRadius: 22,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                border: '1px solid rgba(159,180,196,0.22)'
            }}>
                <FaCrown size={30} color="#9FB4C4" />
            </div>
            <div style={{
                fontSize: 13,
                lineHeight: 1.6,
                color: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)',
                marginBottom: 24,
                maxWidth: 230
            }}>
                {langIndex === 0 ? 'Откройте полный доступ ко всем рекордам' : 'Unlock full access to all records'}
            </div>
            <button onClick={() => setPage('premium')} style={{
                width: 220,
                minHeight: 48,
                fontSize: 15,
                fontWeight: 800,
                color: '#fff',
                background: 'linear-gradient(135deg, #8A7CD6, #66D9E8)',
                border: 'none',
                borderRadius: 16,
                padding: '0 18px',
                marginBottom: 10,
                cursor: 'pointer',
                boxShadow: '0 18px 36px -24px rgba(138,124,214,0.75)'
            }}>
                {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
            </button>
            <button onClick={() => setPage('MainMenu')} style={{
                fontSize: 13,
                fontWeight: 700,
                color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
                background: 'transparent',
                border: 'none',
                padding: '8px 20px',
                cursor: 'pointer'
            }}>
                {langIndex === 0 ? 'На главную' : 'Home'}
            </button>
        </div>
    );
};

const ScopeSwitch = ({ selectedIndex, setSelectedIndex, theme, langIndex }) => {
    const s = controlStyles(theme);
    const items = [
        { Icon: FaGlobe, label: langIndex === 0 ? 'Мир' : 'World' },
        { Icon: FaUserFriends, label: langIndex === 0 ? 'Друзья' : 'Friends' }
    ];

    return (
        <div style={s.scope}>
            {items.map(({ Icon, label }, index) => {
                const active = selectedIndex === index;
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        style={s.scopeBtn(active)}
                    >
                        <Icon size={15} />
                        <span>{label}</span>
                    </button>
                );
            })}
        </div>
    );
};

const CompactFilterBar = ({ period, difficulty, league, isOpen, setIsOpen, theme, langIndex, category }) => {
    const s = controlStyles(theme);
    const summary = [
        period.label[langIndex],
        difficulty.label[langIndex],
        league.label[langIndex]
    ].join(' · ');

    return (
        <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            style={s.filterSummary(isOpen, category)}
            aria-expanded={isOpen}
        >
            <span style={s.filterIcon(category)}>
                <FaSlidersH size={13} />
            </span>
            <span style={s.filterTextWrap}>
                <span style={s.filterLabelText}>{langIndex === 0 ? 'Фильтры' : 'Filters'}</span>
                <span style={s.filterValueText}>{summary}</span>
            </span>
            <FaChevronDown size={12} style={s.filterChevron(isOpen)} />
        </button>
    );
};

const PeriodTabs = ({ periods, selectedIndex, setSelectedIndex, theme, langIndex, category }) => {
    const s = controlStyles(theme);
    return (
        <div style={s.periodRail}>
            {periods.map((item, index) => {
                const active = selectedIndex === index;
                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        style={s.periodBtn(active, category)}
                    >
                        {item.label[langIndex]}
                    </button>
                );
            })}
        </div>
    );
};

const CategoryTabs = ({ categories, selectedIndex, setSelectedIndex, theme, langIndex }) => {
    const s = controlStyles(theme);
    return (
        <div style={s.categoryGrid}>
            {categories.map((item, index) => {
                const Icon = item.Icon;
                const active = selectedIndex === index;
                return (
                    <button
                        key={item.title[0]}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        style={s.categoryBtn(active, item)}
                    >
                        {active && <Motion.div layoutId="recordsCategoryActive" style={s.activeFill(item)} transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }} />}
                        <Icon size={18} />
                        <span>{item.title[langIndex]}</span>
                    </button>
                );
            })}
        </div>
    );
};

const DifficultyTabs = ({ difficulties, selectedIndex, setSelectedIndex, theme, langIndex }) => {
    const s = controlStyles(theme);
    return (
        <div style={s.difficultyRail} className="no-scrollbar">
            {difficulties.map((item, index) => {
                const Icon = item.Icon;
                const active = selectedIndex === index;
                return (
                    <button
                        key={item.label[0]}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        style={s.difficultyBtn(active, item)}
                    >
                        <Icon size={15} />
                        <span>{item.label[langIndex]}</span>
                    </button>
                );
            })}
        </div>
    );
};

const LeagueTabs = ({ leagues, selectedIndex, setSelectedIndex, theme, langIndex }) => {
    const s = controlStyles(theme);
    return (
        <div style={s.leagueRail} className="no-scrollbar">
            {leagues.map((item, index) => {
                const active = selectedIndex === index;
                return (
                    <button
                        key={item.key}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        style={s.leagueBtn(active, item)}
                    >
                        {item.label[langIndex]}
                    </button>
                );
            })}
        </div>
    );
};

const Avatar = ({ name, photo, tone, size = 44 }) => {
    const [failed, setFailed] = useState(false);
    const imgSrc = normalizePhoto(photo);
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .map(word => word[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div style={{
            width: size,
            height: size,
            borderRadius: 16,
            background: `linear-gradient(145deg, rgba(${tone.rgb},0.20), rgba(255,255,255,0.035))`,
            border: `1px solid rgba(${tone.rgb},0.34)`,
            color: tone.hue,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: size * 0.34,
            fontWeight: 950,
            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 12px 24px -22px rgba(${tone.rgb},0.8)`
        }}>
            {imgSrc && !failed ? (
                <img
                    src={imgSrc}
                    alt=""
                    onError={() => setFailed(true)}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: Math.max(12, size * 0.31),
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            ) : (
                initials || '?'
            )}
        </div>
    );
};

const LeaderboardItem = ({ theme, fSize, langIndex, isUser, isAdmin, rank, name, photo, score, index, category, league }) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const podium = PODIUM_TONES[rank];
    const tone = podium || {
        hue: isUser ? category.hue : (isLight ? '#475569' : '#A7B0BE'),
        rgb: isUser ? category.rgb : (isLight ? '71,85,105' : '167,176,190'),
        Icon: null,
        label: [isUser ? 'Вы' : 'Участник', isUser ? 'You' : 'Player']
    };
    const RankIcon = podium?.Icon;

    const itemVariants = {
        hidden: { opacity: 0, y: 18, scale: 0.98 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: { delay: index * 0.035, type: 'spring', stiffness: 300, damping: 25 }
        },
        exit: { opacity: 0, scale: 0.96 }
    };

    return (
        <Motion.div
            layout
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{
                position: 'relative',
                minHeight: rank <= 3 ? 72 : 66,
                borderRadius: rank <= 3 ? 24 : 22,
                padding: rank <= 3 ? '12px 14px' : '10px 13px',
                boxSizing: 'border-box',
                display: 'grid',
                gridTemplateColumns: '44px minmax(0, 1fr) auto',
                gap: 12,
                alignItems: 'center',
                overflow: 'hidden',
                background: rank <= 3
                    ? `linear-gradient(135deg, rgba(${tone.rgb},0.16), rgba(255,255,255,0.035)), ${isLight ? 'rgba(255,255,255,0.82)' : 'rgba(24,27,32,0.82)'}`
                    : isUser
                        ? `linear-gradient(135deg, rgba(${category.rgb},0.11), rgba(255,255,255,0.035)), ${isLight ? 'rgba(255,255,255,0.82)' : 'rgba(24,27,32,0.76)'}`
                        : isLight ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.040)',
                border: `1px solid ${rank <= 3 || isUser ? `rgba(${tone.rgb},0.42)` : (isLight ? 'rgba(15,23,42,0.075)' : 'rgba(255,255,255,0.065)')}`,
                boxShadow: rank <= 3
                    ? `0 20px 42px -34px rgba(${tone.rgb},0.78), inset 0 1px 0 rgba(255,255,255,0.08)`
                    : 'inset 0 1px 0 rgba(255,255,255,0.04)'
            }}
        >
            <div style={{
                position: 'absolute',
                inset: 0,
                background: `radial-gradient(circle at 0% 50%, rgba(${tone.rgb},0.14), transparent 34%)`,
                pointerEvents: 'none'
            }} />

            <div style={{
                position: 'relative',
                zIndex: 1,
                width: 40,
                height: 40,
                borderRadius: 15,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tone.hue,
                background: `rgba(${tone.rgb},${rank <= 3 ? 0.16 : 0.08})`,
                border: `1px solid rgba(${tone.rgb},0.26)`,
                fontSize: 13,
                fontWeight: 950,
                fontVariantNumeric: 'tabular-nums'
            }}>
                {RankIcon ? <RankIcon size={17} /> : rank}
            </div>

            <div style={{ position: 'relative', zIndex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 11 }}>
                <Avatar name={name} photo={photo} tone={tone} />
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                        <span style={{
                            color: text,
                            fontSize: fSize === 0 ? 15 : 17,
                            fontWeight: rank <= 3 || isUser ? 900 : 760,
                            lineHeight: 1.15,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}>
                            {name}
                        </span>
                        {isAdmin && <Badge icon={<FaUserShield size={10} />} color="#00B7FF" />}
                        {isUser && <Badge icon={<FaUserAlt size={9} />} color={category.hue} />}
                        {rank > 3 && <Badge text={league.label[langIndex][0]} color={league.hue} />}
                    </div>
                    <div style={{
                        marginTop: 4,
                        color: rank <= 3 ? tone.hue : sub,
                        opacity: rank <= 3 ? 0.95 : 0.72,
                        fontSize: 10,
                        fontWeight: 850,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase'
                    }}>
                        {tone.label[langIndex]}
                    </div>
                </div>
            </div>

            <div style={{
                position: 'relative',
                zIndex: 1,
                minWidth: 72,
                minHeight: 38,
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: tone.hue,
                background: `rgba(${tone.rgb},${rank <= 3 ? 0.14 : 0.07})`,
                border: `1px solid rgba(${tone.rgb},0.20)`,
                fontSize: fSize === 0 ? 18 : 20,
                fontWeight: 950,
                letterSpacing: 0,
                fontVariantNumeric: 'tabular-nums'
            }}>
                {score}
            </div>
        </Motion.div>
    );
};

const Badge = ({ icon, text, color }) => (
    <span style={{
        width: 19,
        height: 19,
        borderRadius: 7,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        background: `${color}20`,
        border: `1px solid ${color}2E`,
        flexShrink: 0,
        fontSize: 9,
        fontWeight: 950
    }}>
        {icon || text}
    </span>
);

const controlStyles = (theme) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const sub = Colors.get('subText', theme);
    const panel = isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.04)';
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)';

    return {
        scope: {
            justifySelf: 'end',
            display: 'flex',
            gap: 5,
            padding: 3,
            borderRadius: 15,
            background: panel,
            border: `1px solid ${border}`,
            flexShrink: 0
        },
        scopeBtn: (active) => ({
            minHeight: 31,
            border: 'none',
            borderRadius: 12,
            padding: '0 9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            color: active ? '#66D9E8' : sub,
            background: active ? 'rgba(102,217,232,0.13)' : 'transparent',
            fontSize: 10,
            fontWeight: 850
        }),
        filterSummary: (active, category) => ({
            width: '100%',
            minHeight: 42,
            border: `1px solid ${active ? `rgba(${category.rgb},0.34)` : border}`,
            borderRadius: 16,
            padding: '0 12px',
            display: 'grid',
            gridTemplateColumns: '30px minmax(0, 1fr) 18px',
            alignItems: 'center',
            gap: 9,
            color: active ? category.hue : sub,
            background: active ? `rgba(${category.rgb},0.12)` : panel,
            cursor: 'pointer',
            boxSizing: 'border-box',
            boxShadow: active ? `0 14px 28px -26px rgba(${category.rgb},0.8)` : 'none'
        }),
        filterIcon: (category) => ({
            width: 30,
            height: 30,
            borderRadius: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: category.hue,
            background: `rgba(${category.rgb},0.12)`,
            border: `1px solid rgba(${category.rgb},0.22)`
        }),
        filterTextWrap: {
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
        },
        filterLabelText: {
            flexShrink: 0,
            fontSize: 10,
            fontWeight: 950,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
        },
        filterValueText: {
            minWidth: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            fontSize: 11,
            fontWeight: 820,
            color: sub
        },
        filterChevron: (active) => ({
            justifySelf: 'center',
            transform: active ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.18s ease'
        }),
        periodRail: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 5,
            padding: 4,
            borderRadius: 999,
            background: panel,
            border: `1px solid ${border}`,
            alignSelf: 'center',
            flexWrap: 'wrap'
        },
        periodBtn: (active, item) => ({
            minHeight: 28,
            border: `1px solid ${active ? `rgba(${item.rgb || '102,217,232'},0.32)` : 'transparent'}`,
            borderRadius: 999,
            padding: '0 11px',
            color: active ? '#66D9E8' : sub,
            background: active ? 'rgba(102,217,232,0.13)' : 'transparent',
            cursor: 'pointer',
            fontSize: 9,
            fontWeight: 900,
            whiteSpace: 'nowrap'
        }),
        categoryGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 5,
            padding: 4,
            borderRadius: 18,
            background: panel,
            border: `1px solid ${border}`
        },
        categoryBtn: (active, item) => ({
            position: 'relative',
            minHeight: 38,
            border: 'none',
            borderRadius: 14,
            background: active ? `rgba(${item.rgb},0.14)` : 'transparent',
            color: active ? item.hue : sub,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            overflow: 'hidden',
            cursor: 'pointer',
            fontSize: 10,
            lineHeight: 1.05,
            fontWeight: 900,
            letterSpacing: 0,
            padding: '0 7px',
            boxSizing: 'border-box'
        }),
        activeFill: (item) => ({
            position: 'absolute',
            inset: 0,
            borderRadius: 14,
            background: `linear-gradient(135deg, rgba(${item.rgb},0.22), rgba(${item.rgb},0.08))`,
            zIndex: 0
        }),
        difficultyRail: {
            display: 'flex',
            gap: 6,
            overflowX: 'visible',
            paddingBottom: 1,
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%'
        },
        difficultyBtn: (active, item) => ({
            minHeight: 31,
            borderRadius: 999,
            border: `1px solid ${active ? `${item.hue}66` : border}`,
            background: active ? `${item.hue}1C` : panel,
            color: active ? item.hue : sub,
            padding: '0 9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontWeight: 900
        }),
        leagueRail: {
            display: 'flex',
            gap: 5,
            overflowX: 'visible',
            paddingBottom: 1,
            justifyContent: 'center',
            flexWrap: 'wrap',
            width: '100%'
        },
        leagueBtn: (active, item) => ({
            minHeight: 27,
            borderRadius: 999,
            border: `1px solid ${active ? `${item.hue}66` : border}`,
            background: active ? `rgba(${item.rgb},0.15)` : 'transparent',
            color: active ? item.hue : sub,
            padding: '0 9px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            fontSize: 9,
            fontWeight: 900
        })
    };
};

const styles = (theme, fSize = 0, category = CATEGORY_META[0]) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);
    const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';

    return {
        container: {
            width: '100vw',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: text,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: isLight
                ? `radial-gradient(900px 430px at 82% -10%, rgba(${category.rgb},0.14), transparent 58%), radial-gradient(720px 360px at -12% 100%, rgba(138,124,214,0.10), transparent 58%), #F4F5F7`
                : `radial-gradient(980px 500px at 82% -12%, rgba(${category.rgb},0.105), transparent 56%), radial-gradient(760px 380px at -10% 100%, rgba(138,124,214,0.07), transparent 56%), #0E1013`,
            padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 0 0',
            boxSizing: 'border-box'
        },
        pageHeader: {
            width: 'calc(100% - 56px)',
            maxWidth: 700,
            margin: '0 auto 8px',
            padding: '4px 20px 8px',
            boxSizing: 'border-box',
            textAlign: 'center',
            flexShrink: 0
        },
        pageTitle: {
            color: text,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontSize: fSize === 0 ? 21 : 24,
            fontWeight: 700,
            letterSpacing: 0,
            lineHeight: 1.05,
            opacity: 0.86
        },
        pageSubtitle: {
            marginTop: 5,
            color: sub,
            fontSize: fSize === 0 ? 8 : 9,
            fontWeight: 600,
            letterSpacing: '0.14em',
            opacity: 0.82
        },
        controlsPanel: {
            width: 'calc(100% - 40px)',
            maxWidth: 700,
            margin: '0 auto 12px',
            padding: 12,
            borderRadius: 24,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            background: isLight
                ? 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(255,255,255,0.62))'
                : 'linear-gradient(145deg, rgba(23,27,31,0.92), rgba(23,27,31,0.58))',
            border: `1px solid ${border}`,
            boxShadow: isLight
                ? '0 20px 44px -34px rgba(15,23,42,0.22), inset 0 1px 0 rgba(255,255,255,0.7)'
                : '0 22px 44px -34px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.055)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
        },
        controlsHeader: {
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            gap: 10,
            minWidth: 0
        },
        controlsSide: {
            minWidth: 0
        },
        controlsCopy: {
            minWidth: 0,
            textAlign: 'center',
            justifySelf: 'center'
        },
        eyebrow: {
            color: category.hue,
            fontSize: 8,
            fontWeight: 950,
            letterSpacing: '0.16em',
            textTransform: 'uppercase'
        },
        controlsTitle: {
            margin: '2px 0 0',
            color: text,
            fontSize: fSize === 0 ? 20 : 22,
            lineHeight: 1.05,
            fontWeight: 950,
            letterSpacing: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        controlsSubtitle: {
            marginTop: 4,
            color: sub,
            fontSize: fSize === 0 ? 10 : 11,
            lineHeight: 1.25,
            fontWeight: 720,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        filtersPanel: {
            display: 'flex',
            flexDirection: 'column',
            gap: 9,
            overflow: 'hidden',
            borderRadius: 18,
            padding: 9,
            boxSizing: 'border-box',
            background: isLight ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.030)',
            border: `1px solid ${border}`
        },
        filterGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            alignItems: 'center'
        },
        filterLabel: {
            color: sub,
            fontSize: 8,
            fontWeight: 920,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            opacity: 0.72
        },
        listHeader: {
            width: 'calc(100% - 40px)',
            maxWidth: 700,
            margin: '0 auto 9px',
            display: 'grid',
            gridTemplateColumns: '86px minmax(0, 1fr) 86px',
            alignItems: 'center',
            padding: '0 4px',
            boxSizing: 'border-box'
        },
        listHeaderSpacer: {
            minWidth: 0
        },
        listHeaderCopy: {
            minWidth: 0,
            textAlign: 'center',
            justifySelf: 'center'
        },
        listTitle: {
            color: text,
            fontSize: fSize === 0 ? 16 : 18,
            fontWeight: 950,
            lineHeight: 1.1
        },
        listSub: {
            marginTop: 3,
            color: sub,
            fontSize: 11,
            fontWeight: 760
        },
        bestChip: {
            justifySelf: 'end',
            minHeight: 34,
            borderRadius: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '0 12px',
            color: category.hue,
            background: `rgba(${category.rgb},0.12)`,
            border: `1px solid rgba(${category.rgb},0.28)`,
            fontSize: 14,
            fontWeight: 950,
            fontVariantNumeric: 'tabular-nums'
        },
        listContainer: {
            flex: 1,
            width: 'calc(100% - 40px)',
            maxWidth: 700,
            overflowY: 'auto',
            padding: '0 0 calc(154px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box'
        },
        listStack: {
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 9
        },
        loadingText: {
            textAlign: 'center',
            marginTop: 44,
            color: sub,
            fontSize: 13,
            fontWeight: 750
        },
        emptyState: {
            minHeight: 92,
            borderRadius: 22,
            border: `1px solid ${border}`,
            background: isLight ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.035)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: sub,
            fontSize: 13,
            fontWeight: 760
        }
    };
};

export default Records;
