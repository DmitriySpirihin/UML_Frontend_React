import { useState, useEffect, useMemo } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors.js';
import { theme$, lang$, fontSize$ } from '../../StaticClasses/HabitsBus.js';
import { IoIosArrowDown } from 'react-icons/io';
import { FaChevronDown , FaChevronUp,FaCalendarAlt} from 'react-icons/fa';

// --- Helpers ---
const getDayName = (dateStr, langIndex) => {
  const date = new Date(dateStr);
  const options = { weekday: 'long' };
  const locale = langIndex === 0 ? 'ru-RU' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

const formatDuration = (ms) => {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Кардио-хелперы с поддержкой единиц измерения
const getCardioMetrics = (session, langIndex) => {
  const durationSec = session.duration / 1000;
  const distance = session.distance || 0;
  
  let paceDisplay = '';
  let speedDisplay = '';
  
  // Бег и плавание: темп, Велосипед: скорость
  if (session.type === 'RUNNING' || session.type === 'SWIMMING') {
    if (distance > 0 && durationSec > 0) {
      if (session.type === 'RUNNING') {
        // Темп в мин/км для бега
        const paceSecPerKm = durationSec / distance;
        const mins = Math.floor(paceSecPerKm / 60);
        const secs = Math.floor(paceSecPerKm % 60);
        paceDisplay = langIndex === 0 
          ? `${mins}:${secs.toString().padStart(2, '0')} /км` 
          : `${mins}:${secs.toString().padStart(2, '0')} min/km`;
      } else if (session.type === 'SWIMMING') {
        // Темп в мин/100м для плавания (предполагаем дистанцию в метрах)
        const paceSecPer100m = (durationSec / distance) * 100;
        const mins = Math.floor(paceSecPer100m / 60);
        const secs = Math.floor(paceSecPer100m % 60);
        paceDisplay = langIndex === 0 
          ? `${mins}:${secs.toString().padStart(2, '0')} /100м` 
          : `${mins}:${secs.toString().padStart(2, '0')} min/100m`;
      }
    }
  } else if (session.type === 'CYCLING') {
    // Скорость в км/ч для велосипеда
    if (distance > 0 && durationSec > 0) {
      const speedKmph = (distance * 3600) / durationSec;
      speedDisplay = langIndex === 0 
        ? `${speedKmph.toFixed(1)} км/ч` 
        : `${speedKmph.toFixed(1)} km/h`;
    }
  }
  
  return { paceDisplay, speedDisplay };
};

const getDistanceDisplay = (type, distance, langIndex) => {
  if (!distance) return '';
  
  if (type === 'SWIMMING') {
    // Для плавания отображаем в метрах
    return langIndex === 0 
      ? `${Math.round(distance)} м` 
      : `${Math.round(distance)} m`;
  }
  // Для бега и велосипеда - км
  return langIndex === 0 
    ? `${distance.toFixed(1)} км` 
    : `${distance.toFixed(1)} km`;
};

const getTrainingTypeLabel = (type, langIndex) => {
  const labels = {
    GYM: langIndex === 0 ? 'Силовая' : 'Gym',
    RUNNING: langIndex === 0 ? 'Бег' : 'Running',
    CYCLING: langIndex === 0 ? 'Велосипед' : 'Cycling',
    SWIMMING: langIndex === 0 ? 'Плавание' : 'Swimming',
    OTHER: langIndex === 0 ? 'Тренировка' : 'Training'
  };
  return labels[type] || labels.OTHER;
};

// Цвета для типов кардио
const cardioTypeColors = {
  RUNNING: '#ff416c',
  CYCLING: '#38ef7d',
  SWIMMING: '#00c6ff',
  OTHER: '#a8a8a8'
};

const colors = [
  "#00c6ff", "#0072ff", "#ff416c", "#ff4b2b", "#38ef7d", "#11998e",
  "#f09819", "#edde5d", "#834d9b", "#d04ed6", "#1d976c", "#93f9b9",
  "#5d29c3", "#a968f2", "#ff7e5f", "#feb47b", "#2af598", "#009efd",
  "#ff6b6b", "#ffa500", "#114357", "#f29492", "#43e97b", "#38f9d7",
  "#92fe9d", "#00c9ff", "#2c3e50", "#3498db", "#c33764", "#1d2671",
  "#ff9a9e", "#fecfef", "#a8ff78", "#78ffd6", "#b993d6", "#8ca6db",
  "#ff758c", "#ff7eb3", "#4facfe", "#00f2fe"
];

const TRAINING_ACCENT = '#579BC8';
const TRAINING_BLUE = '#8FA6C8';
const TRAINING_GREEN = '#14B8A6';

const TrainingList = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0] === 'ru' ? 0 : 1);
  const [fSize, setFSize] = useState(AppData.prefs[1]);
  const [expandedSessionId, setExpandedSessionId] = useState(null);
  const [filterMode, setFilterMode] = useState(0); // 0: all, 1: program, 2: day
  const [pId, setPId] = useState(0);
  const [dayIndex, setDayIndex] = useState(0);
  const [trainingTypeFilter, setTrainingTypeFilter] = useState('all'); // 'all', 'GYM', 'RUNNING', etc.
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [expandedFilter,setExpandedFilter] = useState(false);

  // --- Subscriptions ---
  useEffect(() => {
    const subTheme = theme$.subscribe(setThemeState);
    const subLang = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
    return () => {
      subLang.unsubscribe();
      subTheme.unsubscribe();
    };
  }, []);
  // --- EXTRACT UNIQUE YEARS AND MONTHS ---
const availableYearsMonths = useMemo(() => {
  if (!AppData.trainingLog || Object.keys(AppData.trainingLog).length === 0) {
    return { years: [], months: [] };
  }
  
  const yearsSet = new Set();
  const monthsSet = new Set();
  
  Object.keys(AppData.trainingLog).forEach((date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth(); // 0-11
    
    yearsSet.add(year);
    
    // Only add months for the selected year (or all if no year selected)
    if (!selectedYear || year === parseInt(selectedYear)) {
      monthsSet.add(month);
    }
  });
  
  const years = Array.from(yearsSet).sort((a, b) => b - a); // Descending
  const months = Array.from(monthsSet).sort((a, b) => a - b); // Ascending
  
  return { years, months };
}, [selectedYear]);
  useEffect(() => {
    const subFontSize = fontSize$.subscribe(setFSize);
    return () => subFontSize.unsubscribe();
  }, []);

  // Сброс фильтров программы/дня при выборе кардио-типа
  useEffect(() => {
    if (trainingTypeFilter !== 'all' && trainingTypeFilter !== 'GYM') {
      setFilterMode(0);
    }
  }, [trainingTypeFilter]);
 
  // --- Data & Filtering ---
  // --- Data & Filtering ---
const { allTrainings, sessionColorMap } = useMemo(() => {
  const trainings = [];
  const colorMap = new Map();
  let colorIndex = 0;

  // Сбор всех тренировок с определением типа (обратная совместимость)
  for (const [date, sessions] of Object.entries(AppData.trainingLog || {})) {
    sessions.forEach((session, idx) => {
      // Определяем тип тренировки с правильным fallback для старых данных
      const sessionType = session.type || 
                        (session.programId !== undefined || session.exercises ? 'GYM' : 'OTHER');
      
      trainings.push({ 
        date, 
        idx, 
        session: { ...session, type: sessionType } 
      });
    });
  }

  // Сортировка по времени (новые сверху)
  trainings.sort((a, b) => (b.session.startTime || 0) - (a.session.startTime || 0));

  // Генерация цветов для силовых тренировок (по программе-дню)
  trainings.forEach(({ session }) => {
    if (session.type === 'GYM') {
      const key = `${session.programId || 0}-${session.dayIndex || 0}`;
      if (!colorMap.has(key)) {
        colorMap.set(key, colors[colorIndex % colors.length]);
        colorIndex++;
      }
    }
  });

  // Фильтрация
  let filtered = trainings.filter(item => {
    const session = item.session;
    const date = item.date;
    
    // Фильтр по году
    if (selectedYear) {
      const sessionYear = new Date(date).getFullYear();
      if (sessionYear !== parseInt(selectedYear)) return false;
    }
    
    // Фильтр по месяцу
    if (selectedMonth !== null && selectedMonth !== undefined) {
      const sessionMonth = new Date(date).getMonth();
      if (sessionMonth !== parseInt(selectedMonth)) return false;
    }
    
    // Фильтр по типу тренировки
    if (trainingTypeFilter !== 'all' && session.type !== trainingTypeFilter) {
      return false;
    }
    
    // Фильтр по программе/дню применяется ТОЛЬКО к силовым тренировкам
    if (session.type === 'GYM') {
      if (filterMode === 1) {
        return session.programId === pId;
      } else if (filterMode === 2) {
        return session.programId === pId && session.dayIndex === dayIndex;
      }
    }
    
    return true;
  });

  return { allTrainings: filtered, sessionColorMap: colorMap };
}, [filterMode, pId, dayIndex, trainingTypeFilter, selectedYear, selectedMonth]);

  // --- Filter Options ---
  const programOptions = useMemo(() => {
    const ids = new Set();
    Object.values(AppData.trainingLog || {}).forEach(sessions =>
      sessions.forEach(s => {
        if ((s.type || 'GYM') === 'GYM' && s.programId !== undefined) {
          ids.add(s.programId);
        }
      })
    );

    return Array.from(ids)
      .map(id => {
        const prog = AppData.programs[id];
        return {
          id,
          name: prog?.name?.[langIndex] || `Program ${id}`
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [langIndex]);

  const dayOptions = useMemo(() => {
    if (filterMode !== 2 || pId == null) return [];
    const program = AppData.programs[pId];
    const schedule = program?.schedule || [];
    return schedule.map((_, idx) => ({
      index: idx,
      name: schedule[idx]?.name?.[langIndex] || `Day ${idx + 1}`
    }));
  }, [filterMode, pId, langIndex]);

  // Авто-выбор первой программы/дня
  useEffect(() => {
    if ((filterMode === 1 || filterMode === 2) && programOptions.length > 0 && pId === 0) {
      setPId(programOptions[0].id);
    }
    if (filterMode === 2 && dayOptions.length > 0) {
      setDayIndex(dayOptions[0].index);
    }
  }, [filterMode, programOptions, dayOptions, pId]);

  // --- Labels ---
  const allLabel = langIndex === 0 ? 'Все' : 'All';
  const progLabel = langIndex === 0 ? 'Программа' : 'Program';
  const dayLabel = langIndex === 0 ? 'День' : 'Day';
  // Уникальные типы тренировок из данных (для динамических фильтров)
  const availableTrainingTypes = useMemo(() => {
  const types = new Set(['all']);
  const typeLabels = {
    GYM: langIndex === 0 ? 'Силовые' : 'Gym',
    RUNNING: langIndex === 0 ? 'Бег' : 'Running',
    CYCLING: langIndex === 0 ? 'Вело' : 'Cycling',
    SWIMMING: langIndex === 0 ? 'Плавание' : 'Swimming',
    OTHER: langIndex === 0 ? 'Другое' : 'Other'
  };
  
  // Собираем все уникальные типы из данных
  Object.values(AppData.trainingLog || {}).forEach(sessions => {
    sessions.forEach(s => {
      const type = s.type || (s.programId !== undefined ? 'GYM' : 'OTHER');
      types.add(type);
    });
  });
  
  // Преобразуем в массив объектов для сортировки и отображения
  return Array.from(types)
    .map(type => ({
      value: type,
      label: typeLabels[type] || type
    }))
    .sort((a, b) => {
      // Сортировка: 'all' первым, затем по алфавиту
      if (a.value === 'all') return -1;
      if (b.value === 'all') return 1;
      return a.label.localeCompare(b.label);
    });
}, [langIndex]);

const isRu = langIndex === 0;
const historyStats = useMemo(() => allTrainings.reduce((acc, item) => {
  const session = item.session;
  acc.total += 1;
  if (session.completed) acc.done += 1;
  acc.minutes += Math.max(0, Math.round((session.duration || 0) / 60000));
  return acc;
}, { total: 0, done: 0, minutes: 0 }), [allTrainings]);

// --- FILTER DROPDOWNS COMPONENT ---
const FilterDropdowns = ({expanded,setExpanded}) => {
  const { years, months } = availableYearsMonths;
  
  const monthNames = [
    langIndex === 0 ? 'Январь' : 'January',
    langIndex === 0 ? 'Февраль' : 'February',
    langIndex === 0 ? 'Март' : 'March',
    langIndex === 0 ? 'Апрель' : 'April',
    langIndex === 0 ? 'Май' : 'May',
    langIndex === 0 ? 'Июнь' : 'June',
    langIndex === 0 ? 'Июль' : 'July',
    langIndex === 0 ? 'Август' : 'August',
    langIndex === 0 ? 'Сентябрь' : 'September',
    langIndex === 0 ? 'Октябрь' : 'October',
    langIndex === 0 ? 'Ноябрь' : 'November',
    langIndex === 0 ? 'Декабрь' : 'December'
  ];
  
  const hasFilters = selectedYear || selectedMonth !== null;
  
  return (
    <div style={styles(theme).dateFilterContainer}>
      <div style={styles(theme).filterHeader}>
        <div style={styles(theme).filterTitle} onClick={() => setExpanded(prev => !prev)}>
          <FaCalendarAlt size={15} style={{ marginRight: '6px' }} />
          {langIndex === 0 ? 'Фильтр по дате' : 'Date Filter'}
          {expanded ? <FaChevronUp size={12} style={{ marginLeft: '16px' }} /> : <FaChevronDown size={12} style={{ marginLeft: '16px' }} />}
        </div>
        {hasFilters && expanded && (
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setSelectedYear(null);
              setSelectedMonth(null);
            }}
            style={styles(theme).clearFilterButton}
          >
            {langIndex === 0 ? 'Сбросить' : 'Clear'}
          </Motion.button>
        )}
      </div>
      
      {expanded && <div style={styles(theme).filterDropdowns}>
        {/* Year Dropdown */}
        <div style={styles(theme).filterDropdownWrapper}>
          <div style={styles(theme).filterLabel}>
            {langIndex === 0 ? 'Год' : 'Year'}
          </div>
          <Motion.div
            whileHover={{ scale: 1.01 }}
            style={styles(theme).dropdownContainer}
          >
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedYear(value || null);
                // Reset month when year changes
                if (value && selectedMonth !== null) {
                  setSelectedMonth(null);
                }
              }}
              style={styles(theme).dropdownSelect}
            >
              <option value="">{langIndex === 0 ? 'Все годы' : 'All Years'}</option>
              {years.map(year => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <FaChevronDown 
              size={12} 
              color={Colors.get('subText', theme)}
              style={styles(theme).dropdownIcon}
            />
          </Motion.div>
        </div>
        
        {/* Month Dropdown - Only show if year is selected */}
        {selectedYear && (
          <div style={styles(theme).filterDropdownWrapper}>
            <div style={styles(theme).filterLabel}>
              {langIndex === 0 ? 'Месяц' : 'Month'}
            </div>
            <Motion.div
              whileHover={{ scale: 1.01 }}
              style={styles(theme).dropdownContainer}
            >
              <select
                value={selectedMonth !== null ? selectedMonth : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedMonth(value === '' ? null : parseInt(value));
                }}
                style={styles(theme).dropdownSelect}
              >
                <option value="">{langIndex === 0 ? 'Все месяцы' : 'All Months'}</option>
                {months.map(month => (
                  <option key={month} value={month}>
                    {monthNames[month]}
                  </option>
                ))}
              </select>
              <FaChevronDown 
                size={12} 
                color={Colors.get('subText', theme)}
                style={styles(theme).dropdownIcon}
              />
            </Motion.div>
          </div>
        )}
      </div>}
      
      {hasFilters && expanded && (
        <div style={styles(theme).activeFiltersBadge}>
          {langIndex === 0 ? 'Активные фильтры' : 'Active Filters'}: 
          {selectedYear && ` ${selectedYear}`}
          {selectedMonth !== null && ` - ${monthNames[selectedMonth]}`}
        </div>
      )}
    </div>
  );
};

  return (
    <div style={styles(theme).container}>
      <div style={styles(theme).pageHeader}>
        <div style={styles(theme).pageTitle}>UltyMyLife</div>
        <div style={styles(theme).pageSubtitle}>
          {isRu ? 'История тренировок без визуального шума' : 'Workout history without visual noise'}
        </div>
      </div>

      <Motion.section
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        style={styles(theme).hero}
      >
        <div style={styles(theme).heroGlow} />
        <div style={styles(theme).heroCopy}>
          <div style={styles(theme).eyebrow}>{isRu ? 'АРХИВ' : 'ARCHIVE'}</div>
          <h1 style={styles(theme).heroTitle}>{isRu ? 'Журнал' : 'Journal'}</h1>
          <div style={styles(theme).heroSubtitle}>
            {isRu ? 'Быстрый обзор всех силовых и кардио-сессий' : 'Fast overview of every strength and cardio session'}
          </div>
          <div style={styles(theme).heroStats}>
            <HeroStat theme={theme} label={isRu ? 'найдено' : 'found'} value={historyStats.total} accent={TRAINING_ACCENT} />
            <HeroStat theme={theme} label={isRu ? 'готово' : 'done'} value={historyStats.done} accent={TRAINING_GREEN} />
            <HeroStat theme={theme} label={isRu ? 'минут' : 'minutes'} value={historyStats.minutes} accent={TRAINING_BLUE} />
          </div>
        </div>
        <img style={styles(theme).heroImage} src="images/bro_training.png" alt="" />
      </Motion.section>

      {/* === Фильтр по типу тренировки === */}
      <div style={{...styles(theme).typeFilterContainer, marginTop:'14px'}}>
  <div style={styles(theme).typeToggleWrapper}>
    {availableTrainingTypes.map(({ value, label }) => {
      const isActive = trainingTypeFilter === value;
      return (
        <Motion.div
          key={value}
          onClick={() => setTrainingTypeFilter(value)}
          whileTap={{ scale: 0.95 }}
          style={{
            ...styles(theme).typeTogglePill,
            backgroundColor: isActive ? TRAINING_ACCENT : 'transparent',
            color: isActive ? '#fff' : Colors.get('subText', theme),
            fontSize: fSize === 0 ? '13px' : '14px',
          }}
        >
          {label}
        </Motion.div>
      );
    })}
  </div>
</div>

      {/* === Фильтры программы/дня (только для силовых) === */}
      {(trainingTypeFilter === 'all' || trainingTypeFilter === 'GYM') && (
        <div style={styles(theme).filterContainer}>
          <div style={styles(theme).toggleWrapper}>
            {[{ key: 0, label: allLabel }, { key: 1, label: progLabel }, { key: 2, label: dayLabel }].map(({ key, label }) => {
              const isActive = filterMode === key;
              return (
                <Motion.div
                  key={key}
                  onClick={() => setFilterMode(key)}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    ...styles(theme).togglePill,
                    backgroundColor: isActive ? TRAINING_ACCENT : 'transparent',
                    color: isActive ? '#fff' : Colors.get('subText', theme),
                    fontSize: fSize === 0 ? '13px' : '14px',
                  }}
                >
                  {label}
                </Motion.div>
              );
            })}
          </div>

          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(filterMode === 1 || filterMode === 2) && (
              <div style={styles(theme).selectWrapper}>
                <select
                  value={pId}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setPId(newId);
                    if (filterMode === 2 && dayOptions.length > 0) {
                      setDayIndex(dayOptions[0]?.index || 0);
                    }
                  }}
                  style={styles(theme).select}
                >
                  {programOptions.map(prog => (
                    <option key={prog.id} value={prog.id}>{prog.name}</option>
                  ))}
                </select>
                <FaChevronDown style={styles(theme).selectIcon} />
              </div>
            )}

            {filterMode === 2 && (
              <div style={styles(theme).selectWrapper}>
                <select
                  value={dayIndex}
                  onChange={(e) => setDayIndex(Number(e.target.value))}
                  style={styles(theme).select}
                >
                  {dayOptions.map(day => (
                    <option key={day.index} value={day.index}>{day.name}</option>
                  ))}
                </select>
                <FaChevronDown style={styles(theme).selectIcon} />
              </div>
            )}
          </div>
        </div>
      )}
      <FilterDropdowns expanded={expandedFilter} setExpanded={setExpandedFilter}/>

      {/* === Training List === */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        {allTrainings.length > 0 ? (
          <AnimatePresence>
            {allTrainings.map((item, i) => {
              const { date, idx, session } = item;
              const sessionId = `${date}-${idx}`;
              const isExpanded = expandedSessionId === sessionId;
              
              // Определение цвета границы
              let borderColor;
              if (session.type === 'GYM') {
                const sessionKey = `${session.programId || 0}-${session.dayIndex || 0}`;
                borderColor = sessionColorMap.get(sessionKey) || colors[0];
              } else {
                borderColor = cardioTypeColors[session.type] || cardioTypeColors.OTHER;
              }

              // Данные для отображения
              let primaryInfo = '';
              let secondaryInfo = '';
              
              if (session.type === 'GYM') {
                const program = AppData.programs[session.programId || 0];
                const programName = program?.name?.[langIndex] || `Program ${session.programId || 0}`;
                const dayName = program?.schedule?.[session.dayIndex || 0]?.name?.[langIndex] || `Day ${session.dayIndex + 1}`;
                primaryInfo = programName;
                secondaryInfo = dayName;
              } else {
                primaryInfo = getTrainingTypeLabel(session.type, langIndex);
                secondaryInfo = getDistanceDisplay(session.type, session.distance, langIndex);
              }

              return (
                <Motion.div
                  key={sessionId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  style={{
                    ...styles(theme).card,
                    borderLeft: `5px solid ${borderColor}`,
                  }}
                >
                  {/* Header Section */}
                  <div
                    onClick={() => setExpandedSessionId(isExpanded ? null : sessionId)}
                    style={{ ...styles(theme).cardHeader, cursor: 'pointer' }}
                  >
                    <div style={{ flex: 1, padding: '12px 0 12px 16px' }}>
                      <div style={{ ...styles(theme, fSize).dateText }}>
                        {date} • <span style={{ opacity: 0.8 }}>{getDayName(date, langIndex)}</span>
                      </div>
                      <div style={styles(theme, fSize).programText}>
                        {primaryInfo} {secondaryInfo && <span>• {secondaryInfo}</span>}
                      </div>
                    </div>
                    <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                      <Motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                        <IoIosArrowDown size={18} color={Colors.get('subText', theme)} />
                      </Motion.div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={styles(theme).expandedContent}>
                          {session.type === 'GYM' ? (
                            // Силовая тренировка
                            <>
                              <div style={styles(theme).statsRow}>
                                <div style={styles(theme).statBadge}>
                                  ⏱ {formatDuration(session.duration || 0)}
                                </div>
                                <div style={styles(theme).statBadge}>
                                  🏋️ {(session.tonnage / 1000).toFixed(2)} {langIndex === 0 ? 'т' : 't'}
                                </div>
                                {session.RPE && (
                                  <div style={styles(theme).statBadge}>
                                    <span>🔥</span>
                                    RPE {session.RPE}
                                    
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {Object.entries(session.exercises || {})
                                  .filter((entry) => entry[1]?.sets?.length > 0)
                                  .map(([exId, ex]) => {
                                    const exIdNum = parseInt(exId, 10);
                                    const exercise = AppData.exercises[exIdNum];
                                    const exerciseName = exercise?.name?.[langIndex] || `Exercise ${exId}`;

                                    return (
                                      <div key={exId} style={styles(theme).exerciseBlock}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                                          <span style={styles(theme, fSize).exerciseTitle}>{exerciseName}</span>
                                          <span style={styles(theme).tonnageSub}>{(ex.totalTonnage / 1000).toFixed(2)} {langIndex === 0 ? 'т' : 't'}</span>
                                        </div>

                                        <div style={styles(theme).setsGrid}>
                                          {ex.sets.map((set, sIdx) => {
                                            const isWarmUp = set.type === 0;
                                            const setColor = isWarmUp
                                              ? Colors.get('trainingIsolatedFont', theme)
                                              : Colors.get('trainingBaseFont', theme);
                                            const bgSet = !isWarmUp ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.0)';

                                            return (
                                              <div key={sIdx} style={{ ...styles(theme).setRow, backgroundColor: bgSet, color: setColor, fontSize: fSize === 0 ? '13px' : '15px' }}>
                                                <span style={{ opacity: 0.6, fontSize: '11px', marginRight: '6px' }}>{sIdx + 1}</span>
                                                <span style={{ fontWeight: '600' }}>{set.weight}</span>
                                                <span style={{ fontSize: '11px', margin: '0 2px' }}>{langIndex === 0 ? 'кг' : 'kg'}</span>
                                                <span style={{ margin: '0 4px', opacity: 0.5 }}>×</span>
                                                <span style={{ fontWeight: '600' }}>{set.reps}</span>
                                                {set.time != null && set.time > 0 && (
                                                  <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.8 }}>({Math.round(set.time / 1000)}s)</span>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                              
                              {session.note && (
                                <div style={styles(theme).noteBlock}>
                                  <div style={styles(theme).noteLabel}>
                                    <span style={{ marginTop: '2px' }}>📝</span>
                                    {langIndex === 0 ? 'Заметка:' : 'Note:'}
                                  </div>
                                  
                                  <div style={styles(theme).noteText}>{session.note}</div>
                                </div>
                              )}
                            </>
                          ) : (
                            // Кардио тренировка
                            <>
                              <div style={styles(theme).statsRow}>
                                <div style={styles(theme).statBadge}>
                                  ⏱ {formatDuration(session.duration || 0)}
                                </div>
                                {session.distance && (
                                  <div style={styles(theme).statBadge}>
                                    📍 {getDistanceDisplay(session.type, session.distance, langIndex)}
                                  </div>
                                )}
                                {session.elevationGain > 0 && (
                                  <div style={styles(theme).statBadge}>
                                    ⛰️ {session.elevationGain} {langIndex === 0 ? 'м' : 'm'}
                                  </div>
                                )}
                                {session.avgHeartRate > 0 && (
                                  <div style={styles(theme).statBadge}>
                                    ❤️ {session.avgHeartRate} bpm
                                  </div>
                                )}
                              </div>
                              
                              {/* Темп/Скорость */}
                              {(() => {
                                const { paceDisplay, speedDisplay } = getCardioMetrics(session, langIndex);
                                if (paceDisplay || speedDisplay) {
                                  return (
                                    <div style={styles(theme).statRow}>
                                      {paceDisplay && (
                                        <div>
                                          <div style={styles(theme).statLabel}>
                                            {langIndex === 0 ? 'Темп:' : 'Pace:'}
                                          </div>
                                          <div style={styles(theme).statValue}>{paceDisplay}</div>
                                        </div>
                                      )}
                                      {speedDisplay && (
                                        <div>
                                          <div style={styles(theme).statLabel}>
                                            {langIndex === 0 ? 'Скорость:' : 'Speed:'}
                                          </div>
                                          <div style={styles(theme).statValue}>{speedDisplay}</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                              
                              {/* Дополнительные метрики */}
                              {(session.avgCadence > 0 || session.rpe) && (
                                <div style={styles(theme).statsRow}>
                                  {session.avgCadence > 0 && (
                                    <div style={styles(theme).statBadge}>
                                      🚴 {session.avgCadence} {langIndex === 0 ? 'об/мин' : 'rpm'}
                                    </div>
                                  )}
                                  {session.rpe && (
                                    <div style={styles(theme).statBadge}>
                                      <span>🔥</span>
                                      RPE {session.rpe}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {session.notes && (
                                <div style={styles(theme).noteBlock}>
                                  <div style={styles(theme).noteLabel}>
                                    <span style={{ marginTop: '2px' }}>📝</span>
                                    {langIndex === 0 ? 'Заметка:' : 'Note:'}
                                  </div>
                                  
                                  <div style={styles(theme).noteText}>{session.notes}</div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </Motion.div>
              );
            })}
          </AnimatePresence>
        ) : (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              padding: '40px 20px',
              color: Colors.get('subText', theme),
              fontSize: fSize === 0 ? '14px' : '16px',
              textAlign: 'center',
              fontStyle: 'italic'
            }}
          >
            {langIndex === 0 ? 'Тренировки не найдены' : 'No trainings found'}
          </Motion.div>
        )}
      </div>
    </div>
  );
};

const HeroStat = ({ theme, label, value, accent }) => (
  <div style={{ ...styles(theme).heroStat, borderColor: `${accent}33` }}>
    <div style={{ ...styles(theme).heroStatValue, color: accent }}>{value}</div>
    <div style={styles(theme).heroStatLabel}>{label}</div>
  </div>
);

const styles = (theme, fSize = 0) => {
  const isDark = theme === 'dark' || theme === 'specialdark';
  const mainText = Colors.get('mainText', theme);
  const subText = Colors.get('subText', theme);
  const background = Colors.get('background', theme);
  const border = Colors.get('border', theme);

  return {
    container: {
      width: '100vw',
      height: '100vh',
      overflowY: 'auto',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: '24px 4.5vw max(96px, calc(92px + env(safe-area-inset-bottom, 0px)))',
      background: isDark
        ? `radial-gradient(circle at 18% 6%, rgba(53,194,255,0.12), transparent 28%),
           radial-gradient(circle at 92% 28%, rgba(20,184,166,0.10), transparent 26%),
           ${background}`
        : background,
      color: mainText,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
    pageHeader: {
      width: '100%',
      maxWidth: '600px',
      textAlign: 'center',
      padding: '8px 18px 16px',
      boxSizing: 'border-box',
    },
    pageTitle: {
      color: mainText,
      fontFamily: 'inherit',
      fontSize: '24px',
      fontWeight: 700,
      letterSpacing: 0,
      lineHeight: 1.05,
      opacity: 0.92,
    },
    pageSubtitle: {
      marginTop: '6px',
      color: subText,
      fontSize: fSize === 0 ? '10px' : '11px',
      fontWeight: 700,
      letterSpacing: '0.18em',
      lineHeight: 1.3,
    },
    hero: {
      position: 'relative',
      width: '100%',
      maxWidth: '600px',
      minHeight: '196px',
      padding: '18px 18px 20px',
      borderRadius: '30px',
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: isDark
        ? 'linear-gradient(135deg, rgba(18,31,41,0.96), rgba(21,24,28,0.92) 52%, rgba(17,38,45,0.9))'
        : 'linear-gradient(135deg, #ffffff, #edf8ff)',
      border: `1px solid ${isDark ? 'rgba(53,194,255,0.25)' : 'rgba(53,194,255,0.20)'}`,
      boxShadow: isDark
        ? '0 24px 70px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.08)'
        : '0 18px 44px rgba(15,23,42,0.08)',
    },
    heroGlow: {
      position: 'absolute',
      inset: 0,
      background: 'radial-gradient(circle at 78% 22%, rgba(53,194,255,0.22), transparent 34%), radial-gradient(circle at 22% 110%, rgba(20,184,166,0.12), transparent 42%)',
      pointerEvents: 'none',
    },
    heroCopy: {
      position: 'relative',
      zIndex: 1,
      width: 'calc(100% - min(32vw, 150px))',
      minWidth: '212px',
    },
    eyebrow: {
      marginBottom: '5px',
      color: TRAINING_ACCENT,
      fontSize: fSize === 0 ? '11px' : '12px',
      fontWeight: 900,
      letterSpacing: '0.18em',
    },
    heroTitle: {
      margin: 0,
      color: mainText,
      fontSize: fSize === 0 ? '30px' : '33px',
      lineHeight: 1.04,
      fontWeight: 900,
      letterSpacing: 0,
    },
    heroSubtitle: {
      margin: '8px 0 13px',
      maxWidth: '350px',
      color: subText,
      fontSize: fSize === 0 ? '14px' : '15px',
      lineHeight: 1.35,
      fontWeight: 700,
    },
    heroStats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '7px',
      width: '100%',
      maxWidth: '286px',
    },
    heroStat: {
      minHeight: '44px',
      padding: '7px 8px',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.74)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
      boxSizing: 'border-box',
      minWidth: 0,
    },
    heroStatValue: {
      color: mainText,
      fontSize: '16px',
      fontWeight: 900,
      lineHeight: 1.05,
      fontVariantNumeric: 'tabular-nums',
    },
    heroStatLabel: {
      marginTop: '2px',
      color: subText,
      fontSize: '9px',
      fontWeight: 800,
      lineHeight: 1.05,
      textTransform: 'uppercase',
      letterSpacing: '0.03em',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    heroImage: {
      position: 'absolute',
      right: '-4px',
      top: '50%',
      transform: 'translateY(-47%)',
      width: 'min(32vw, 150px)',
      maxHeight: '156px',
      objectFit: 'contain',
      filter: 'drop-shadow(0 20px 32px rgba(0,0,0,0.45))',
      opacity: isDark ? 0.96 : 0.9,
      pointerEvents: 'none',
    },
    typeFilterContainer: {
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '8px',
    },
    typeToggleWrapper: {
      display: 'flex',
      backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.86)',
      padding: '5px',
      borderRadius: '22px',
      width: '100%',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '5px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      boxShadow: isDark ? '0 12px 30px rgba(0,0,0,0.16)' : '0 10px 26px rgba(15,23,42,0.06)',
    },
    typeTogglePill: {
      flex: '1 1 auto',
      textAlign: 'center',
      padding: '8px 8px',
      borderRadius: '17px',
      cursor: 'pointer',
      fontWeight: 800,
      minWidth: '82px',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      boxSizing: 'border-box',
    },
    filterContainer: {
      width: '100%',
      maxWidth: '600px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
    },
    toggleWrapper: {
      display: 'flex',
      backgroundColor: isDark ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.86)',
      padding: '5px',
      borderRadius: '22px',
      width: '100%',
      justifyContent: 'space-between',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      boxSizing: 'border-box',
    },
    togglePill: {
      flex: 1,
      textAlign: 'center',
      padding: '8px 0',
      borderRadius: '17px',
      cursor: 'pointer',
      fontWeight: 800,
      transition: 'all 0.2s ease',
    },
    selectWrapper: {
      position: 'relative',
      width: '100%',
    },
    select: {
      width: '100%',
      padding: '13px 42px 13px 16px',
      borderRadius: '16px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.86)',
      color: mainText,
      fontSize: fSize === 0 ? '14px' : '16px',
      fontWeight: 800,
      appearance: 'none',
      outline: 'none',
      cursor: 'pointer',
      boxSizing: 'border-box',
    },
    selectIcon: {
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: subText,
      fontSize: '12px',
      pointerEvents: 'none',
    },
    card: {
      width: '100%',
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.055), rgba(255,255,255,0.025))'
        : '#fff',
      borderRadius: '22px',
      marginBottom: '12px',
      boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.18)' : '0 10px 26px rgba(15,23,42,0.07)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.07)'}`,
      overflow: 'hidden',
      boxSizing: 'border-box',
    },
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    dateText: {
      fontSize: fSize === 0 ? '15px' : '17px',
      fontWeight: 900,
      color: mainText,
      marginBottom: '5px',
      letterSpacing: 0,
    },
    programText: {
      fontSize: fSize === 0 ? '13px' : '14px',
      color: subText,
      fontWeight: 700,
      lineHeight: 1.3,
    },
    expandedContent: {
      padding: '13px 16px 16px',
      borderTop: `1px solid ${border}`,
      marginTop: '0px',
      backgroundColor: isDark ? 'rgba(0,0,0,0.12)' : 'rgba(15,23,42,0.025)',
    },
    statsRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginBottom: '14px',
    },
    statRow: {
      display: 'flex',
      gap: '20px',
      marginBottom: '12px',
      padding: '8px 0',
    },
    statLabel: {
      fontSize: '12px',
      color: subText,
      marginBottom: '4px',
      fontWeight: 700,
    },
    statValue: {
      fontSize: fSize === 0 ? '16px' : '18px',
      fontWeight: 900,
      color: mainText,
    },
    statBadge: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.055)',
      padding: '7px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      color: mainText,
      fontWeight: 800,
      whiteSpace: 'nowrap',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.06)'}`,
    },
    exerciseBlock: {
      marginBottom: '10px',
      padding: '10px',
      borderRadius: '16px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.035)' : 'rgba(15,23,42,0.03)',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.06)'}`,
    },
    exerciseTitle: {
      color: mainText,
      fontWeight: 800,
      fontSize: fSize === 0 ? '14px' : '16px',
    },
    tonnageSub: {
      fontSize: '11px',
      color: subText,
      fontWeight: 800,
    },
    setsGrid: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      marginTop: '4px',
    },
    setRow: {
      display: 'flex',
      alignItems: 'center',
      padding: '5px 8px',
      borderRadius: '10px',
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.035)',
    },
    noteBlock: {
      marginTop: '12px',
      padding: '12px',
      backgroundColor: isDark ? 'rgba(53,194,255,0.08)' : 'rgba(53,194,255,0.08)',
      borderRadius: '14px',
      borderLeft: `3px solid ${TRAINING_ACCENT}`,
    },
    noteLabel: {
      fontSize: '12px',
      color: subText,
      marginBottom: '4px',
      fontWeight: 800,
    },
    noteText: {
      fontSize: '12px',
      textAlign: 'left',
      color: mainText,
      lineHeight: 1.4,
      fontWeight: 600,
    },
    dateFilterContainer: {
      width: '100%',
      maxWidth: '600px',
      background: isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02))'
        : 'rgba(255,255,255,0.88)',
      borderRadius: '22px',
      padding: '12px',
      marginBottom: '18px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      boxShadow: isDark ? '0 14px 34px rgba(0,0,0,0.18)' : '0 10px 26px rgba(15,23,42,0.07)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      boxSizing: 'border-box',
    },
    filterHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '10px',
    },
    filterTitle: {
      fontSize: '14px',
      fontWeight: 900,
      color: mainText,
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    clearFilterButton: {
      padding: '7px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 800,
      backgroundColor: isDark ? 'rgba(239,68,68,0.16)' : '#fee2e2',
      color: isDark ? '#fecaca' : '#ef4444',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    filterDropdowns: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      marginTop: '8px',
    },
    filterDropdownWrapper: {
      flex: 1,
      minWidth: '150px',
    },
    filterLabel: {
      fontSize: '11px',
      color: subText,
      marginBottom: '6px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },
    dropdownContainer: {
      position: 'relative',
      backgroundColor: isDark ? 'rgba(255,255,255,0.055)' : 'rgba(255,255,255,0.9)',
      borderRadius: '14px',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}`,
      cursor: 'pointer',
    },
    dropdownSelect: {
      width: '100%',
      padding: '11px 34px 11px 12px',
      fontSize: '14px',
      fontWeight: 800,
      color: mainText,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '14px',
      appearance: 'none',
      cursor: 'pointer',
      outline: 'none',
    },
    dropdownIcon: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
    },
    activeFiltersBadge: {
      marginTop: '8px',
      padding: '8px 12px',
      backgroundColor: isDark ? 'rgba(111,183,216,0.12)' : 'rgba(111,183,216,0.16)',
      color: TRAINING_BLUE,
      borderRadius: '12px',
      fontSize: '13px',
      fontWeight: 800,
    },
  };
};

export default TrainingList;
