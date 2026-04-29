import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCalendarDay,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaClipboardList,
  FaEye,
  FaFilter,
  FaFire,
  FaFlag,
  FaInbox,
  FaLayerGroup,
  FaListUl,
  FaPalette,
  FaRegEyeSlash,
  FaSearch,
  FaSlidersH,
  FaSortAmountDown,
  FaTimes,
  FaThumbtack
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { playEffects } from '../../StaticClasses/Effects.js';
import { saveData } from '../../StaticClasses/SaveHelper';
import { fontSize$, lang$, selectedTodo$, setAddPanel, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import { todoEvents$, toggleGoal, toggleHidden, togglePending, togglePinned } from './ToDoHelper.js';
import {
  buildTodoAccent,
  DEFAULT_TODO_ACCENT_COLOR,
  getTodoCategoryMeta,
  getTodoCategoryTone,
  normalizeTodoCategory,
  TODO_ACCENT_PRESETS,
  TODO_SECTION_TOP
} from './ToDoVisuals.js';

const clickSound = new Audio('Audio/Click.wav');
const doneSound = new Audio('Audio/IsDone.wav');

const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very urgent'], ['ASAP', 'ASAP']];

const PRIORITY_COLORS = ['#9AA6B2', '#58B7E6', '#F4C84A', '#EF9950', '#E95F5F'];
const DIFFICULTY_COLORS = ['#66C88A', '#93CB63', '#F2C14D', '#EB835F', '#D85A5A'];
const URGENCY_COLORS = ['#72BE84', '#6EA8E8', '#EFCB55', '#E88C65', '#E66E78'];

const FILTERS = [
  { id: 0, label: ['Все', 'All'] },
  { id: 1, label: ['Сегодня', 'Today'] },
  { id: 2, label: ['В работе', 'Active'] },
  { id: 3, label: ['Отложено', 'Pending'] },
  { id: 4, label: ['Готово', 'Done'] }
];

const SORTS = [
  { id: 0, label: ['Важность', 'Priority'], icon: <FaFlag /> },
  { id: 1, label: ['Срок', 'Deadline'], icon: <FaCalendarDay /> },
  { id: 2, label: ['Сложность', 'Difficulty'], icon: <FaLayerGroup /> }
];

const ToDoMain = () => {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [showHiddenTasks, setShowHiddenTasks] = useState(false);
  const [hiddenTasksCount, setHiddenTasksCount] = useState(0);
  const [sortedList, setSortedList] = useState(AppData.todoList || []);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [fieldVisibility, setFieldVisibility] = useState(() => AppData.todoFieldsVisibility || {});
  const [filterParams, setFilterParams] = useState(0);
  const [sortParams, setSortParams] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSorts, setShowSorts] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAccentSettings, setShowAccentSettings] = useState(false);
  const [accentColor, setAccentColor] = useState(AppData.todoAccentColor || DEFAULT_TODO_ACCENT_COLOR);
  const searchInputRef = useRef(null);

  const accent = useMemo(() => buildTodoAccent(accentColor), [accentColor]);
  const s = styles(theme, accent, fSize);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize),
      todoEvents$.subscribe(event => {
        if (!event) return;
        setRefreshTrigger(prev => prev + 1);
        setFieldVisibility({ ...(AppData.todoFieldsVisibility || {}) });

        if (event.type === 'OPEN_STATS') {
          setAddPanel('');
          setPage('ToDoMetrics');
        }
        if (event.type === 'OPEN_ADD') {
          selectedTodo$.next({});
          setPage('ToDoNew');
        }
        if (event.type === 'CLOSE_ALL') setAddPanel('');
      })
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  useEffect(() => { logSectionVisit('todo'); }, []);

  useEffect(() => {
    processTaskList();
  }, [filterParams, sortParams, searchQuery, refreshTrigger, showHiddenTasks]);

  useEffect(() => {
    if (searchInputRef.current) searchInputRef.current.focus();
  }, []);

  const processTaskList = () => {
    let processedList = AppData.todoList ? [...AppData.todoList] : [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      processedList = processedList.filter(task =>
        (task.name && task.name.toLowerCase().includes(q)) ||
        (task.category && task.category.toLowerCase().includes(q)) ||
        (task.description && task.description.toLowerCase().includes(q))
      );
    }

    switch (filterParams) {
      case 1:
        processedList = processedList.filter(task => !task.isDone && isTodayTask(task));
        break;
      case 2:
        processedList = processedList.filter(task => !task.isDone && !task.isPending);
        break;
      case 3:
        processedList = processedList.filter(task => task.isPending);
        break;
      case 4:
        processedList = processedList.filter(task => task.isDone);
        break;
      default:
        break;
    }

    const hiddenInCurrentView = processedList.filter(task => task.isHidden).length;
    setHiddenTasksCount(hiddenInCurrentView);

    if (!showHiddenTasks) processedList = processedList.filter(task => !task.isHidden);

    const sortGroup = (list) => {
      const next = [...list];
      if (sortParams === 0) {
        return next.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      }
      if (sortParams === 1) {
        return next.sort((a, b) => daysToDeadlineNum(a.deadLine) - daysToDeadlineNum(b.deadLine));
      }
      if (sortParams === 2) {
        return next.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
      }
      return next;
    };

    const pinnedTasks = processedList.filter(task => task.isPinned);
    const restTasks = processedList.filter(task => !task.isPinned);
    setSortedList([...sortGroup(pinnedTasks), ...sortGroup(restTasks)]);
    setFieldVisibility({ ...(AppData.todoFieldsVisibility || {}) });
  };

  const stats = useMemo(() => {
    const list = AppData.todoList || [];
    const visible = list.filter(task => !task.isHidden);
    const active = visible.filter(task => !task.isDone && !task.isPending).length;
    const done = visible.filter(task => task.isDone).length;
    const today = visible.filter(task => !task.isDone && isTodayTask(task)).length;
    const overdue = visible.filter(task => isDeadlinePassed(task.deadLine) && !task.isDone).length;
    const total = visible.length;
    return { active, done, today, overdue, total };
  }, [refreshTrigger, filterParams, showHiddenTasks]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    sortedList.forEach(task => {
      const cat = normalizeTodoCategory(task.category || 'general');
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(task);
    });
    return groups;
  }, [sortedList]);

  const handleQuickComplete = async (event, item) => {
    event.stopPropagation();
    await toggleGoal(item.id);
    setRefreshTrigger(prev => prev + 1);
    playEffects(item.isDone ? doneSound : clickSound);
  };

  const handleTogglePinned = async (id) => {
    await togglePinned(id);
    setRefreshTrigger(prev => prev + 1);
    playEffects(clickSound);
  };

  const handleToggleHidden = async (id) => {
    await toggleHidden(id);
    setRefreshTrigger(prev => prev + 1);
    playEffects(clickSound);
  };

  const handleTogglePending = async (id) => {
    await togglePending(id);
    setRefreshTrigger(prev => prev + 1);
    playEffects(clickSound);
  };

  const openTask = (item) => {
    selectedTodo$.next(item);
    setPage('ToDoPage');
    playEffects(clickSound);
  };

  const changeAccentColor = async (color) => {
    const next = buildTodoAccent(color).hue;
    AppData.todoAccentColor = next;
    setAccentColor(next);
    await saveData();
    todoEvents$.next({ type: 'ACCENT_CHANGE' });
  };

  const hasQuery = searchQuery.trim().length > 0;
  const emptyText = hiddenTasksCount > 0 && !showHiddenTasks
    ? (langIndex === 0 ? 'Все найденные задачи скрыты' : 'All matching tasks are hidden')
    : hasQuery
      ? (langIndex === 0 ? 'Ничего не найдено' : 'Nothing found')
      : (langIndex === 0 ? 'Задач пока нет' : 'No tasks yet');

  return (
    <div style={s.container}>
      <TodoAccentModal
        show={showAccentSettings}
        onClose={() => setShowAccentSettings(false)}
        theme={theme}
        langIndex={langIndex}
        accent={accent}
        accentColor={accentColor}
        onAccentChange={changeAccentColor}
      />
      <div style={s.scroll} className="no-scrollbar">
        <ToDoPageHeader theme={theme} fSize={fSize} langIndex={langIndex} />
        <FocusHero
          stats={stats}
          theme={theme}
          accent={accent}
          langIndex={langIndex}
          fSize={fSize}
          controls={{
            showFilters,
            setShowFilters,
            searchInputRef,
            searchQuery,
            setSearchQuery,
            showSorts,
            setShowSorts,
            sortParams,
            setSortParams,
            filterParams,
            setFilterParams,
            hiddenTasksCount,
            showHiddenTasks,
            setShowHiddenTasks,
            openAccent: () => setShowAccentSettings(true)
          }}
        />

        <section style={s.listWrap}>
          <AnimatePresence mode="popLayout">
            {sortedList.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={s.emptyState}>
                <div style={s.emptyIcon}><FaInbox /></div>
                <div style={s.emptyTitle}>{emptyText}</div>
                <div style={s.emptySub}>
                  {langIndex === 0 ? 'Новые дела появятся здесь.' : 'New tasks will appear here.'}
                </div>
              </motion.div>
            ) : (
              Object.keys(groupedTasks).map(category => {
                const meta = getTodoCategoryMeta(category, langIndex);
                return (
                <CategoryPanel
                  key={category}
                  title={meta.labelText}
                  categoryKey={category}
                  count={groupedTasks[category].length}
                  doneCount={groupedTasks[category].filter(task => task.isDone).length}
                  todayCount={groupedTasks[category].filter(task => !task.isDone && isTodayTask(task)).length}
                  theme={theme}
                  accent={accent}
                  langIndex={langIndex}
                >
                  {groupedTasks[category].map((item, index) => (
                    <TaskCard
                      key={item.id || `${item.name}-${index}`}
                      item={item}
                      lang={langIndex}
                      theme={theme}
                      accent={accent}
                      fSize={fSize}
                      fieldVisibility={fieldVisibility}
                      onOpen={() => openTask(item)}
                      onCheck={(event) => handleQuickComplete(event, item)}
                      onPinned={handleTogglePinned}
                      onHidden={handleToggleHidden}
                      onPending={handleTogglePending}
                    />
                  ))}
                </CategoryPanel>
                );
              })
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
};

export default ToDoMain;

const ToDoPageHeader = ({ theme, fSize, langIndex }) => {
  const s = styles(theme, buildTodoAccent(AppData.todoAccentColor || DEFAULT_TODO_ACCENT_COLOR), fSize);
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      style={s.pageHeader}
    >
      <div style={s.pageTitle}>UltyMyLife</div>
      <div style={s.pageSubtitle}>
        {langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}
      </div>
    </motion.div>
  );
};

const FocusHero = ({ stats, theme, accent, langIndex, fSize, controls }) => {
  const s = styles(theme, accent, fSize);
  const activeTotal = Math.max(stats.active + stats.today + stats.overdue, 1);
  const focusProgress = Math.min(1, (stats.today + stats.overdue) / activeTotal);
  const {
    showFilters,
    setShowFilters,
    searchInputRef,
    searchQuery,
    setSearchQuery,
    showSorts,
    setShowSorts,
    sortParams,
    setSortParams,
    filterParams,
    setFilterParams,
    hiddenTasksCount,
    showHiddenTasks,
    setShowHiddenTasks,
    openAccent
  } = controls;

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={s.hero}>
      <div style={s.heroTop}>
        <div style={s.heroIcon}>
          <FaClipboardList />
        </div>
        <div style={s.heroTextBlock}>
          <div style={s.eyebrow}>{langIndex === 0 ? 'СЕГОДНЯ' : 'TODAY'}</div>
          <h1 style={s.title}>{langIndex === 0 ? 'Фокус' : 'Focus'}</h1>
        </div>
        <div style={s.heroMeter}>
          <span style={s.heroMeterValue}>{stats.today}</span>
          <span style={s.heroMeterLabel}>{langIndex === 0 ? 'сегодня' : 'today'}</span>
          <span style={s.heroMeterBar}>
            <motion.span initial={{ width: 0 }} animate={{ width: `${focusProgress * 100}%` }} style={s.heroMeterFill} />
          </span>
        </div>
      </div>
      <div style={s.focusSignal}>
        <span style={s.focusSignalDot(stats.overdue > 0)} />
        {stats.overdue > 0
          ? (langIndex === 0 ? `${stats.overdue} задач требуют внимания` : `${stats.overdue} tasks need attention`)
          : stats.today > 0
            ? (langIndex === 0 ? 'День собран вокруг ближайших задач' : 'The day is centered on nearest tasks')
            : (langIndex === 0 ? 'Нет срочного давления на сегодня' : 'No urgent pressure today')}
      </div>
      <div style={s.focusStats}>
        <HeroStat label={langIndex === 0 ? 'в работе' : 'active'} value={stats.active} theme={theme} accent={accent} />
        <HeroStat label={langIndex === 0 ? 'сегодня' : 'today'} value={stats.today} theme={theme} accent={accent} />
        <HeroStat label={langIndex === 0 ? 'готово' : 'done'} value={stats.done} theme={theme} accent={accent} />
      </div>
      <div style={s.heroActions}>
        <button
          type="button"
          onClick={() => {
            setShowFilters(prev => !prev);
            playEffects(clickSound);
          }}
          style={s.heroActionButton(showFilters)}
        >
          <FaSlidersH size={12} />
          {langIndex === 0 ? 'Фильтр' : 'Filter'}
          <motion.span animate={{ rotate: showFilters ? 180 : 0 }} style={{ display: 'flex' }}>
            <FaChevronDown size={11} />
          </motion.span>
        </button>
        <button type="button" onClick={openAccent} style={s.heroActionButton(false)}>
          <FaPalette size={12} />
          {langIndex === 0 ? 'Акцент' : 'Accent'}
          <span style={s.actionColorDot} />
        </button>
      </div>
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            style={s.filterDrawer}
          >
            <div style={s.searchCard}>
              <FaSearch size={14} color={Colors.get('subText', theme)} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={langIndex === 0 ? 'Поиск по задачам' : 'Search tasks'}
                style={s.searchInput}
              />
              {searchQuery.length > 0 && (
                <button type="button" onClick={() => setSearchQuery('')} style={s.clearButton}>
                  <FaTimes size={10} />
                </button>
              )}
            </div>

            <div style={s.controlHead}>
              <div style={s.controlTitle}>
                <FaFilter size={12} />
                {langIndex === 0 ? 'Вид' : 'View'}
              </div>
              <button type="button" onClick={() => setShowSorts(prev => !prev)} style={s.sortToggle(showSorts)}>
                <FaSortAmountDown size={12} />
                {SORTS.find(item => item.id === sortParams)?.label[langIndex]}
              </button>
            </div>

            <div style={s.chipRow} className="no-scrollbar">
              {FILTERS.map(filter => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => {
                    setFilterParams(filter.id);
                    playEffects(clickSound);
                  }}
                  style={s.filterChip(filterParams === filter.id)}
                >
                  {filter.label[langIndex]}
                </button>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {showSorts && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={s.sortRow}
                  className="no-scrollbar"
                >
                  {SORTS.map(sort => (
                    <button
                      key={sort.id}
                      type="button"
                      onClick={() => {
                        setSortParams(sort.id);
                        playEffects(clickSound);
                      }}
                      style={s.sortChip(sortParams === sort.id)}
                    >
                      {sort.icon}
                      {sort.label[langIndex]}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {hiddenTasksCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setShowHiddenTasks(prev => !prev);
                  playEffects(clickSound);
                }}
                style={s.hiddenToggle(showHiddenTasks)}
              >
                {showHiddenTasks ? <FaRegEyeSlash /> : <FaEye />}
                {showHiddenTasks
                  ? (langIndex === 0 ? 'Скрыть скрытые' : 'Hide hidden')
                  : (langIndex === 0 ? `Показать скрытые: ${hiddenTasksCount}` : `Show hidden: ${hiddenTasksCount}`)}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {stats.overdue > 0 && (
        <div style={s.warningPill}>
          <FaFire size={11} />
          {langIndex === 0 ? `${stats.overdue} просрочено` : `${stats.overdue} overdue`}
        </div>
      )}
    </motion.section>
  );
};

const HeroStat = ({ label, value, theme, accent }) => {
  const s = styles(theme, accent);
  return (
  <div style={s.heroStat}>
    <strong style={s.heroStatValue}>{value}</strong>
    <span style={s.heroStatLabel}>{label}</span>
  </div>
  );
};

const TodoAccentModal = ({ show, onClose, theme, langIndex, accent, accentColor, onAccentChange }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5000,
            background: 'rgba(0,0,0,0.58)',
            backdropFilter: 'blur(8px)'
          }} />
          <motion.div initial={{ y: 34, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 34, opacity: 0, scale: 0.98 }} style={{
            position: 'fixed',
            left: '4%',
            right: '4%',
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
            maxWidth: 560,
            margin: '0 auto',
            zIndex: 5001,
            borderRadius: 26,
            padding: 18,
            boxSizing: 'border-box',
            background: `radial-gradient(260px 180px at 92% 4%, ${accent.soft} 0%, transparent 68%), ${isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,21,25,0.97)'}`,
            border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : accent.ring}`,
            boxShadow: isLight ? '0 24px 70px rgba(0,0,0,0.18)' : '0 28px 80px rgba(0,0,0,0.72)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}` }}>
                <FaPalette />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: text, fontSize: 18, fontWeight: 900 }}>{langIndex === 0 ? 'Акцент задач' : 'Task accent'}</div>
                <div style={{ color: sub, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{langIndex === 0 ? 'Цвет карточек, фильтров и нижнего меню' : 'Cards, filters, and bottom navigation color'}</div>
              </div>
              <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: sub, fontSize: 18, padding: 8 }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ color: text, fontSize: 14, fontWeight: 850 }}>{langIndex === 0 ? 'Основной цвет' : 'Main color'}</div>
                <div style={{ color: sub, fontSize: 11, fontWeight: 650, marginTop: 2 }}>{accentColor}</div>
              </div>
              <input type="color" value={accentColor} onChange={(event) => onAccentChange(event.target.value)} style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${accent.ring}`, background: 'transparent', padding: 0 }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
              {TODO_ACCENT_PRESETS.map((color) => {
                const active = accentColor.toUpperCase() === color.toUpperCase();
                return (
                  <motion.button key={color} type="button" whileTap={{ scale: 0.92 }} onClick={() => onAccentChange(color)} aria-label={color} style={{
                    width: '100%',
                    aspectRatio: '1 / 1',
                    minHeight: 30,
                    borderRadius: 11,
                    border: active ? `2px solid ${text}` : `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)'}`,
                    background: color,
                    boxShadow: active ? `0 0 18px ${color}55` : 'none'
                  }} />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CategoryPanel = ({ title, categoryKey, count, doneCount, todayCount, children, theme, accent, langIndex }) => {
  const [isOpen, setIsOpen] = useState(true);
  const s = styles(theme, accent);
  const tone = getTodoCategoryTone(categoryKey || title, accent);
  const Icon = tone.icon;
  const done = Math.min(doneCount, count);
  const metaText = todayCount > 0
    ? `${done} / ${count} ${langIndex === 0 ? 'сегодня' : 'today'}`
    : `${done} / ${count} ${langIndex === 0 ? 'готово' : 'done'}`;

  return (
    <div style={s.category}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(prev => !prev);
          playEffects(clickSound);
        }}
        style={s.categoryHeader}
      >
        <div style={s.categoryIdentity}>
          <div style={{ ...s.categoryIcon, color: tone.hue, background: tone.soft, borderColor: tone.ring }}>
            <Icon size={15} />
          </div>
          <div style={s.categoryTextBlock}>
            <span style={s.categoryName}>{title}</span>
            <span style={s.categoryMeta}>
              {metaText}
            </span>
          </div>
        </div>
        <div style={s.categoryRight}>
          <span style={s.categoryCount(done === count && count > 0, tone)}>{done}/{count}</span>
          <motion.span animate={{ rotate: isOpen ? 0 : -90 }} style={s.chevron}>
            <FaChevronDown size={13} />
          </motion.span>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={s.categoryBody}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TaskCard = ({
  item,
  lang,
  theme,
  accent,
  fSize,
  fieldVisibility = {},
  onOpen,
  onCheck,
  onPinned,
  onHidden,
  onPending
}) => {
  const s = styles(theme, accent, fSize);
  const totalGoals = item.goals ? item.goals.length : 0;
  const doneGoals = item.goals ? item.goals.filter(goal => goal.isDone).length : 0;
  const progress = totalGoals === 0 ? (item.isDone ? 100 : 0) : Math.round((doneGoals / totalGoals) * 100);
  const isOverdue = isDeadlinePassed(item.deadLine) && !item.isDone;
  const cardAccent = getTodoCategoryTone(item.category, accent);
  const TaskIcon = cardAccent.icon;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      style={s.taskCard(item.isDone, isOverdue, item.isPinned, cardAccent)}
    >
      <div style={s.taskMainRow}>
        <div style={{ ...s.taskGlyph, color: cardAccent.hue, background: cardAccent.soft, borderColor: cardAccent.ring }}>
          <TaskIcon size={18} />
        </div>

        <div style={s.taskContent}>
          <div style={s.taskHeaderLine}>
            <div style={s.taskName(item.isDone)}>{item.name}</div>
            {item.isPinned && <FaThumbtack size={11} color={accent.hue} />}
          </div>
          {item.description && <div style={s.description}>{item.description}</div>}
        </div>

        <button type="button" onClick={onCheck} style={s.checkButton(item.isDone)}>
          {item.isDone ? <FaCheck size={12} /> : <span />}
        </button>
      </div>

      <div style={s.metaRow}>
        {(fieldVisibility.priority ?? true) && item.priority != null && (
          <MiniBadge icon={<FaFlag />} text={PRIORITY_LABELS[item.priority]?.[lang]} color={PRIORITY_COLORS[item.priority] || PRIORITY_COLORS[0]} />
        )}
        {(fieldVisibility.difficulty ?? true) && item.difficulty != null && (
          <MiniBadge icon={<FaLayerGroup />} text={DIFFICULTY_LABELS[item.difficulty]?.[lang]} color={DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0]} />
        )}
        {(fieldVisibility.urgency ?? true) && item.urgency != null && (
          <MiniBadge icon={<FaFire />} text={URGENCY_LABELS[item.urgency]?.[lang]} color={URGENCY_COLORS[item.urgency] || URGENCY_COLORS[0]} />
        )}
        <MiniBadge
          icon={isOverdue ? <FaFire /> : <FaCalendarDay />}
          text={item.deadLine ? getDeadlineText(item.deadLine, lang) : (lang === 0 ? 'Без срока' : 'No deadline')}
          color={isOverdue ? '#E95F5F' : accent.hue}
        />
        {totalGoals > 0 && (
          <MiniBadge icon={<FaListUl />} text={`${doneGoals}/${totalGoals}`} color={accent.hue} />
        )}
      </div>

      <div style={s.progressTrack}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} style={s.progressFill(cardAccent.hue)} />
      </div>

      <div style={s.actionRow}>
        <ActionButton active={item.isPinned} label={lang === 0 ? 'Пин' : 'Pin'} icon={<FaThumbtack />} onClick={(event) => { event.stopPropagation(); onPinned(item.id); }} theme={theme} accent={accent} />
        <ActionButton active={item.isPending} label={lang === 0 ? 'Позже' : 'Later'} icon={<FaClock />} onClick={(event) => { event.stopPropagation(); onPending(item.id); }} theme={theme} accent={accent} />
        <ActionButton active={item.isHidden} label={lang === 0 ? 'Скрыто' : 'Hidden'} icon={<FaRegEyeSlash />} onClick={(event) => { event.stopPropagation(); onHidden(item.id); }} theme={theme} accent={accent} />
        {item.isDone && (
          <span style={s.donePill}>
            <FaCheckCircle size={11} />
            {lang === 0 ? 'Готово' : 'Done'}
          </span>
        )}
      </div>
    </motion.article>
  );
};

const ActionButton = ({ active, label, icon, onClick, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <button type="button" onClick={onClick} style={s.actionButton(active)}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

const MiniBadge = ({ icon, text, color }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    minHeight: 24,
    padding: '3px 8px',
    borderRadius: 999,
    background: `${color}18`,
    border: `1px solid ${color}30`,
    color,
    fontSize: 10,
    fontWeight: 850,
    whiteSpace: 'nowrap'
  }}>
    {React.cloneElement(icon, { size: 9 })}
    {text}
  </span>
);

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.045)';
  const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,23,27,0.86)';

  return {
    container: {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)`
        : `linear-gradient(180deg, rgba(${accent.rgbText},0.11) 0%, ${Colors.get('background', theme)} 44%)`,
      color: text,
      fontFamily: 'Segoe UI, sans-serif'
    },
    scroll: {
      height: '100%',
      overflowY: 'auto',
      padding: `${TODO_SECTION_TOP} 18px 150px`,
      boxSizing: 'border-box'
    },
    pageHeader: {
      width: '100%',
      margin: '0 auto 8px',
      padding: '4px 18px 8px',
      boxSizing: 'border-box',
      textAlign: 'center'
    },
    pageTitle: {
      color: text,
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: fSize === 0 ? 24 : 26,
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
    hero: {
      position: 'relative',
      borderRadius: 24,
      padding: 15,
      overflow: 'hidden',
      background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${accent.faint})`
        : `radial-gradient(260px 140px at 4% 0%, ${accent.soft}, transparent 74%), linear-gradient(145deg, rgba(24,28,31,0.92), rgba(20,23,25,0.94))`,
      border: `1px solid ${border}`,
      boxShadow: isLight ? '0 12px 28px -24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.72) inset' : '0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 34px -28px rgba(0,0,0,0.72)',
      backdropFilter: 'blur(18px)'
    },
    heroTop: { display: 'flex', alignItems: 'center', gap: 13 },
    heroIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: accent.hue,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      fontSize: 22,
      flexShrink: 0
    },
    heroTextBlock: { minWidth: 0 },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, letterSpacing: 1.6 },
    title: { margin: '3px 0 0', color: text, fontSize: fSize === 0 ? 28 : 30, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
	    heroMeter: {
	      position: 'relative',
	      width: 78,
	      minHeight: 64,
	      marginLeft: 'auto',
	      display: 'flex',
	      flexDirection: 'column',
	      alignItems: 'center',
	      justifyContent: 'center',
	      gap: 4,
	      color: accent.hue,
	      flexShrink: 0,
	      borderRadius: 20,
	      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
	      border: `1px solid ${border}`,
	      boxShadow: `0 16px 36px -30px ${accent.hue}`
	    },
	    heroMeterValue: {
	      color: text,
	      fontSize: 22,
	      lineHeight: 1,
	      fontWeight: 950,
	      fontVariantNumeric: 'tabular-nums'
	    },
	    heroMeterLabel: {
	      color: sub,
	      fontSize: 9,
	      lineHeight: 1,
	      fontWeight: 900
	    },
	    heroMeterBar: {
	      width: 42,
	      height: 4,
	      borderRadius: 999,
	      overflow: 'hidden',
	      background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'
	    },
	    heroMeterFill: {
	      display: 'block',
	      height: '100%',
	      borderRadius: 999,
	      background: accent.hue,
	      boxShadow: `0 0 16px ${accent.glow}`
	    },
	    focusSignal: {
	      minHeight: 34,
	      marginTop: 13,
	      padding: '0 12px',
	      borderRadius: 999,
	      display: 'flex',
	      alignItems: 'center',
	      gap: 8,
	      color: sub,
	      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
	      border: `1px solid ${border}`,
	      fontSize: 11,
	      fontWeight: 850,
	      lineHeight: 1.2
	    },
	    focusSignalDot: (danger) => ({
	      width: 8,
	      height: 8,
	      borderRadius: 999,
	      flexShrink: 0,
	      background: danger ? '#E95F5F' : accent.hue,
	      boxShadow: `0 0 14px ${danger ? 'rgba(233,95,95,0.5)' : accent.glow}`
	    }),
	    focusStats: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 14 },
	    heroStat: {
      minHeight: 54,
      borderRadius: 16,
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)',
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 0
    },
	    heroStatValue: { color: text, fontSize: 20, lineHeight: 1, fontWeight: 950, fontVariantNumeric: 'tabular-nums' },
	    heroStatLabel: { color: sub, fontSize: 10, fontWeight: 850, marginTop: 5, textAlign: 'center' },
	    heroActions: {
	      display: 'grid',
	      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
	      gap: 8,
	      marginTop: 12
	    },
	    heroActionButton: (active) => ({
	      minHeight: 38,
	      borderRadius: 15,
	      border: `1px solid ${active ? accent.ring : border}`,
	      background: active ? accent.soft : isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)',
	      color: active ? accent.hue : sub,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      gap: 7,
	      fontSize: 12,
	      fontWeight: 900,
	      fontFamily: 'inherit',
	      outline: 'none'
	    }),
	    actionColorDot: {
	      width: 8,
	      height: 8,
	      borderRadius: 999,
	      background: accent.hue,
	      boxShadow: `0 0 12px ${accent.glow}`
	    },
	    filterDrawer: {
	      overflow: 'hidden',
	      marginTop: 12,
	      borderRadius: 20,
	      padding: 10,
	      background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(0,0,0,0.13)',
	      border: `1px solid ${border}`,
	      backdropFilter: 'blur(18px)',
	      WebkitBackdropFilter: 'blur(18px)'
	    },
	    warningPill: {
      width: 'fit-content',
      marginTop: 12,
      padding: '6px 10px',
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      background: 'rgba(233,95,95,0.13)',
      border: '1px solid rgba(233,95,95,0.26)',
      color: '#E95F5F',
      fontSize: 11,
      fontWeight: 900
    },
	    toolPanel: {
	      marginTop: 12,
	      borderRadius: 22,
	      padding: 10,
	      background: panel,
	      border: `1px solid ${border}`,
	      backdropFilter: 'blur(18px)',
	      WebkitBackdropFilter: 'blur(18px)'
	    },
	    searchCard: {
	      minHeight: 44,
	      borderRadius: 15,
	      padding: '0 12px',
	      display: 'flex',
	      alignItems: 'center',
	      gap: 10,
	      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)',
	      border: `1px solid ${border}`
    },
    searchInput: {
      minWidth: 0,
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: text,
      fontSize: 15,
      fontWeight: 700,
      fontFamily: 'inherit'
    },
    clearButton: {
      width: 26,
      height: 26,
      borderRadius: 999,
	      border: 'none',
	      background: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
	      color: sub,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      outline: 'none'
	    },
	    controls: {
	      marginTop: 12,
	      borderRadius: 22,
	      padding: 12,
	      background: panel,
	      border: `1px solid ${border}`,
	      backdropFilter: 'blur(18px)'
	    },
	    controlHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, margin: '10px 0 9px' },
    controlTitle: { display: 'flex', alignItems: 'center', gap: 7, color: sub, fontSize: 12, fontWeight: 900 },
    sortToggle: (active) => ({
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : 'transparent',
      color: active ? accent.hue : sub,
      borderRadius: 999,
      minHeight: 34,
      padding: '0 11px',
      display: 'flex',
      alignItems: 'center',
	      gap: 7,
	      fontSize: 11,
	      fontWeight: 900,
	      fontFamily: 'inherit',
	      outline: 'none'
	    }),
	    chipRow: { display: 'flex', gap: 7, overflow: 'visible', flexWrap: 'wrap', paddingBottom: 0 },
	    filterChip: (active) => ({
	      border: `1px solid ${active ? accent.ring : border}`,
	      background: active ? accent.soft : isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.025)',
	      color: active ? accent.hue : sub,
	      borderRadius: 999,
	      minHeight: 33,
	      padding: '0 11px',
	      fontSize: 11,
	      fontWeight: 900,
	      whiteSpace: 'nowrap',
	      fontFamily: 'inherit',
	      flex: '1 1 auto',
	      outline: 'none'
	    }),
	    sortRow: { overflow: 'hidden', display: 'flex', gap: 7, flexWrap: 'wrap', paddingTop: 10 },
    sortChip: (active) => ({
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : 'transparent',
      color: active ? accent.hue : sub,
      borderRadius: 14,
      minHeight: 34,
      padding: '0 11px',
      display: 'flex',
      alignItems: 'center',
	      gap: 7,
	      fontSize: 11,
	      fontWeight: 900,
	      fontFamily: 'inherit',
	      outline: 'none'
	    }),
    hiddenToggle: (active) => ({
      width: '100%',
      marginTop: 10,
      minHeight: 38,
      borderRadius: 14,
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : 'transparent',
      color: active ? accent.hue : sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
	      gap: 8,
	      fontSize: 12,
	      fontWeight: 900,
	      fontFamily: 'inherit',
	      outline: 'none'
	    }),
	    listWrap: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 2 },
    emptyState: {
      minHeight: 210,
      borderRadius: 26,
      background: panel,
      border: `1px solid ${border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: 22
    },
    emptyIcon: {
      width: 54,
      height: 54,
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: accent.hue,
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      fontSize: 22
    },
    emptyTitle: { marginTop: 12, color: text, fontSize: 18, fontWeight: 950 },
    emptySub: { marginTop: 6, color: sub, fontSize: 13, lineHeight: 1.35, fontWeight: 700, maxWidth: 260 },
	    category: { display: 'flex', flexDirection: 'column', gap: 8 },
	    categoryHeader: {
	      width: '100%',
	      minHeight: 66,
	      border: 'none',
	      background: 'transparent',
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'space-between',
	      padding: '8px 0',
	      gap: 12,
	      color: text,
	      fontFamily: 'inherit',
	      outline: 'none'
	    },
	    categoryIdentity: { display: 'flex', alignItems: 'center', gap: 16, minWidth: 0, flex: 1 },
	    categoryIcon: {
	      width: 48,
	      height: 48,
	      borderRadius: 17,
	      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    categoryTextBlock: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
	    categoryName: { fontSize: 19, fontWeight: 950, width: '100%', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.08 },
	    categoryMeta: { color: sub, fontSize: 13, fontWeight: 850, marginTop: 4 },
	    categoryRight: { display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 },
	    categoryCount: (completed, tone) => ({
	      minWidth: 54,
	      height: 36,
	      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: completed ? Colors.get('done', theme) : sub,
      background: completed ? 'rgba(16,185,129,0.13)' : isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)',
      border: `1px solid ${completed ? 'rgba(16,185,129,0.24)' : border}`,
	      fontSize: 15,
	      fontWeight: 950,
      fontVariantNumeric: 'tabular-nums'
    }),
    chevron: { color: sub, display: 'flex' },
    categoryBody: { overflowY: 'hidden', overflowX: 'visible', display: 'flex', flexDirection: 'column', gap: 10, padding: '0 1px', boxSizing: 'border-box' },
    taskCard: (done, overdue, pinned, tone = accent) => ({
      position: 'relative',
      borderRadius: 20,
      padding: 13,
      overflow: 'hidden',
      background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${tone.soft})`
        : `radial-gradient(230px 115px at 4% 8%, ${tone.soft}, transparent 72%), linear-gradient(145deg, rgba(24,28,31,0.9), rgba(20,23,25,0.92))`,
      border: `1px solid ${overdue ? 'rgba(233,95,95,0.34)' : pinned ? tone.ring : border}`,
      boxShadow: pinned ? `0 14px 36px -24px ${tone.hue}` : isLight ? '0 12px 28px -24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.72) inset' : '0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 34px -28px rgba(0,0,0,0.72)',
      opacity: done ? 0.72 : 1,
      cursor: 'pointer',
      backdropFilter: 'blur(18px)'
    }),
    taskMainRow: { display: 'flex', alignItems: 'center', gap: 12, minHeight: 56 },
    taskGlyph: {
      width: 46,
      height: 46,
      borderRadius: 15,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      flexShrink: 0
    },
	    taskContent: { minWidth: 0, flex: 1 },
    taskHeaderLine: { display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 },
    taskName: (done) => ({
      color: done ? sub : text,
      fontSize: fSize === 0 ? 16 : 17,
      fontWeight: 950,
      lineHeight: 1.2,
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textDecoration: done ? 'line-through' : 'none'
    }),
    description: { marginTop: 4, color: sub, fontSize: 12, fontWeight: 700, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' },
    checkButton: (done) => ({
      width: 32,
      height: 32,
      borderRadius: 999,
      border: `2px solid ${done ? Colors.get('done', theme) : accent.ring}`,
      background: done ? Colors.get('done', theme) : 'transparent',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }),
    metaRow: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 },
    progressTrack: { height: 5, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)', overflow: 'hidden', marginTop: 12 },
    progressFill: (color) => ({ height: '100%', borderRadius: 999, background: color, boxShadow: `0 0 18px ${color}66` }),
    actionRow: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
    actionButton: (active) => ({
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.025)',
      color: active ? accent.hue : sub,
      borderRadius: 999,
      minHeight: 26,
      padding: '0 8px',
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 10,
      fontWeight: 900,
      fontFamily: 'inherit'
    }),
    donePill: {
      marginLeft: 'auto',
      minHeight: 28,
      padding: '0 10px',
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: Colors.get('done', theme),
      background: 'rgba(16,185,129,0.13)',
      border: '1px solid rgba(16,185,129,0.24)',
      fontSize: 10,
      fontWeight: 950
    }
  };
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr.includes('-')) return new Date(dateStr);
  if (dateStr.includes('.')) {
    const parts = dateStr.split('.');
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
}

function dateKey(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function daysToDeadlineNum(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return 9999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - now) / 86400000);
}

function isDeadlinePassed(dateStr) {
  return daysToDeadlineNum(dateStr) < 0;
}

function isTodayTask(task) {
  const today = dateKey(new Date());
  const deadline = parseDate(task.deadLine);
  const start = parseDate(task.startDate);
  return dateKey(deadline) === today || dateKey(start) === today;
}

function getDeadlineText(dateStr, lang) {
  if (!dateStr) return '';
  const days = daysToDeadlineNum(dateStr);

  if (lang === 0) {
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Завтра';
    if (days < 0) return `${Math.abs(days)} дн. назад`;
    return `${days} дн.`;
  }

  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 0) return `${Math.abs(days)}d ago`;
  return `${days}d`;
}
