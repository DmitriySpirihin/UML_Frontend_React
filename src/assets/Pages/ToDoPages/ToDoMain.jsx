import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCalendarDay,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaEye,
  FaFilter,
  FaFire,
  FaFlag,
  FaInbox,
  FaLayerGroup,
  FaListUl,
  FaPalette,
  FaPen,
  FaPlus,
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
import { addSubGoal, todoEvents$, toggleGoal, toggleHidden, togglePending, togglePinned, toggleSubGoal } from './ToDoHelper.js';
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
const TODO_FOCUS_COLLAPSE_KEY = 'uml_todo_focus_collapsed_v1';
const TODO_CATEGORY_COLLAPSE_KEY = 'uml_todo_category_collapsed_v1';

const mergeAccentPresets = (defaults, custom = [], normalize) => {
  const colors = [...defaults, ...(Array.isArray(custom) ? custom : [])]
    .map(color => normalize(color).hue);
  return colors.filter((color, index) => colors.indexOf(color) === index);
};

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

const getTodoCollapsedCategories = () => {
  try {
    return JSON.parse(localStorage.getItem(TODO_CATEGORY_COLLAPSE_KEY) || '{}');
  } catch {
    return {};
  }
};

const isTodoCategoryCollapsed = (categoryKey) => Boolean(getTodoCollapsedCategories()[categoryKey]);

const setTodoCategoryCollapsed = (categoryKey, isCollapsed) => {
  try {
    localStorage.setItem(TODO_CATEGORY_COLLAPSE_KEY, JSON.stringify({
      ...getTodoCollapsedCategories(),
      [categoryKey]: isCollapsed
    }));
  } catch {
    // localStorage can be unavailable in restricted webviews.
  }
};

const isTodoFocusCollapsed = () => {
  try {
    return localStorage.getItem(TODO_FOCUS_COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

const setTodoFocusCollapsed = (isCollapsed) => {
  try {
    localStorage.setItem(TODO_FOCUS_COLLAPSE_KEY, isCollapsed ? '1' : '0');
  } catch {
    // localStorage can be unavailable in restricted webviews.
  }
};

function getDateKeyWithOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

function getWeekdayLabel(offset, langIndex) {
  if (offset === 0) return langIndex === 0 ? 'СЕГ' : 'TODAY';
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const ru = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
  const en = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  return (langIndex === 0 ? ru : en)[date.getDay()];
}

function isTaskActiveOnDate(task, targetDateKey) {
  const start = parseDate(task.startDate);
  const deadline = parseDate(task.deadLine);
  const startKey = dateKey(start);
  const deadlineKey = dateKey(deadline);

  if (startKey && deadlineKey) return targetDateKey >= startKey && targetDateKey <= deadlineKey;
  if (startKey) return targetDateKey === startKey;
  if (deadlineKey) return targetDateKey === deadlineKey;
  return targetDateKey === dateKey(new Date());
}

function buildTodoWeekSummary(tasks, langIndex) {
  const visibleTasks = (tasks || []).filter(task => !task.isHidden);
  return [-6, -5, -4, -3, -2, -1, 0].map(offset => {
    const key = getDateKeyWithOffset(offset);
    const dayTasks = visibleTasks.filter(task => isTaskActiveOnDate(task, key));
    const done = dayTasks.filter(task => task.isDone).length;

    return {
      key,
      label: getWeekdayLabel(offset, langIndex),
      isToday: offset === 0,
      done,
      total: dayTasks.length,
      progress: dayTasks.length ? done / dayTasks.length : 0
    };
  });
}

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
  const [, setAccentPresetVersion] = useState(0);
  const [accentColor, setAccentColor] = useState(buildTodoAccent(AppData.todoAccentColor || DEFAULT_TODO_ACCENT_COLOR).hue);
  const [selectedDateKey, setSelectedDateKey] = useState(dateKey(new Date()));
  const [expandedTaskId, setExpandedTaskId] = useState(null);
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
  }, [filterParams, sortParams, searchQuery, refreshTrigger, showHiddenTasks, selectedDateKey]);

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

    processedList = processedList.filter(task => isTaskActiveOnDate(task, selectedDateKey));

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
    const pending = visible.filter(task => task.isPending && !task.isDone).length;
    const total = visible.length;
    return { active, done, today, overdue, pending, total };
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

  const handleQuickSubComplete = async (event, item, index) => {
    event.stopPropagation();
    await toggleSubGoal(item.id, index);
    setRefreshTrigger(prev => prev + 1);
    playEffects(clickSound);
  };

  const handleQuickSubAdd = async (event, item, text) => {
    event.stopPropagation();
    const trimmed = text.trim();
    if (!trimmed) return;
    await addSubGoal(item.id, trimmed);
    setRefreshTrigger(prev => prev + 1);
    playEffects(clickSound);
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

  const toggleTaskExpansion = (item) => {
    setExpandedTaskId(prev => (prev === item.id ? null : item.id));
    playEffects(clickSound);
  };

  const changeAccentColor = async (color) => {
    const next = buildTodoAccent(color).hue;
    AppData.todoAccentColor = next;
    setAccentColor(next);
    await saveData();
    todoEvents$.next({ type: 'ACCENT_CHANGE' });
  };

  const saveAccentPreset = async () => {
    await AppData.addAccentPreset('todo', accentColor, TODO_ACCENT_PRESETS);
    setAccentPresetVersion(version => version + 1);
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
        customPresets={AppData.todoAccentPresets}
        onSavePreset={saveAccentPreset}
      />
      <div style={s.scroll} className="no-scrollbar">
        <ToDoPageHeader
          theme={theme}
          fSize={fSize}
          langIndex={langIndex}
          accent={accent}
          onAccentClick={() => setShowAccentSettings(true)}
        />
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
            setShowHiddenTasks
          }}
        />
        <ToDoWeekStrip
          theme={theme}
          accent={accent}
          langIndex={langIndex}
          tasks={AppData.todoList || []}
          selectedDateKey={selectedDateKey}
          onSelectDate={(key) => {
            setSelectedDateKey(key);
            setFilterParams(0);
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
                      expanded={expandedTaskId === item.id}
                      onOpen={() => toggleTaskExpansion(item)}
                      onEdit={(event) => {
                        event.stopPropagation();
                        openTask(item);
                      }}
                      onCheck={(event) => handleQuickComplete(event, item)}
                      onSubCheck={(event, index) => handleQuickSubComplete(event, item, index)}
                      onSubAdd={(event, text) => handleQuickSubAdd(event, item, text)}
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

const ToDoPageHeader = ({ theme, fSize, langIndex, accent, onAccentClick }) => {
  const s = styles(theme, accent || buildTodoAccent(AppData.todoAccentColor || DEFAULT_TODO_ACCENT_COLOR), fSize);
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      style={s.pageHeader}
    >
      <div style={s.pageHeaderSpacer} />
      <div style={s.pageHeaderBrand}>
        <div style={s.pageTitle}>UltyMyLife</div>
        <div style={s.pageSubtitle}>
          {langIndex === 0 ? 'Вся твоя жизнь в одном месте' : 'Your whole life in one place'}
        </div>
      </div>
      <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={onAccentClick} style={s.headerAccentButton}>
        <span>{langIndex === 0 ? 'Акцент' : 'Accent'}</span>
        <span style={s.actionColorDot} />
      </motion.button>
    </motion.div>
  );
};

const FocusHero = ({ stats, theme, accent, langIndex, fSize, controls }) => {
  const [isOpen, setIsOpen] = useState(() => !isTodoFocusCollapsed());
  const s = styles(theme, accent, fSize);
  const doneProgress = stats.total ? stats.done / stats.total : 0;
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
  } = controls;

  const toggleHero = () => {
    const next = !isOpen;
    setIsOpen(next);
    setTodoFocusCollapsed(!next);
    playEffects(clickSound);
  };

  return (
    <motion.section layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={s.hero}>
      <div style={s.heroGlow} />
      <img style={s.heroImage} src="images/bro_task.png" alt="" />
      <div style={s.heroHeader}>
        <div style={s.heroTextBlock}>
          <div style={s.eyebrow}>{langIndex === 0 ? 'Сегодня' : 'Today'}</div>
          <h1 style={s.title}>{langIndex === 0 ? 'Задачи' : 'Tasks'}</h1>
        </div>
        <div style={s.heroControls}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={(event) => {
              event.stopPropagation();
              toggleHero();
            }}
            style={s.heroUtilityButton(isOpen)}
          >
            <FaSlidersH size={12} />
            <span>{langIndex === 0 ? 'Виджеты' : 'Widgets'}</span>
          </motion.button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={(event) => {
              event.stopPropagation();
              setShowFilters(prev => !prev);
              playEffects(clickSound);
            }}
            aria-label={langIndex === 0 ? 'Поиск и фильтры' : 'Search & filters'}
            style={s.heroIconButton(showFilters)}
          >
            <span style={s.heroSearchGlyph(showFilters)} aria-hidden="true">
              <span style={s.heroSearchCircle(showFilters)} />
              <span style={s.heroSearchHandle(showFilters)} />
            </span>
          </motion.button>
        </div>
      </div>

      {/* Поиск и фильтры — независимый раскрывающийся блок */}
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
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

      {/* Виджеты-статистика — открывается кнопкой "Виджеты" */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 230, damping: 28 }}
            style={s.heroCollapsible}
          >
            <div style={s.heroSummaryCard}>
              <div style={s.heroSummaryTop}>
                <span>{langIndex === 0 ? 'Готово' : 'Done'}</span>
                <strong style={s.heroSummaryValue}>{stats.done}<small style={s.heroSummarySmall}> / {stats.total}</small></strong>
              </div>
              <div style={s.progressTrackHero}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(doneProgress * 100)}%` }}
                  transition={{ duration: 0.72 }}
                  style={s.heroProgressFill}
                />
              </div>
            </div>
            <div style={s.heroMetricGrid}>
              <HeroMetric label={langIndex === 0 ? 'В работе' : 'Active'} value={stats.active} tone={accent} stylesObj={s} />
              <HeroMetric label={langIndex === 0 ? 'Сегодня' : 'Today'} value={stats.today} tone={accent} stylesObj={s} />
              <HeroMetric label={langIndex === 0 ? 'Отложено' : 'Pending'} value={stats.pending} tone={accent} stylesObj={s} wide />
            </div>
            {stats.overdue > 0 && (
              <div style={s.warningPill}>
                <FaFire size={11} />
                {langIndex === 0 ? `${stats.overdue} просрочено` : `${stats.overdue} overdue`}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

const HeroMetric = ({ label, value, tone, stylesObj, wide = false }) => (
  <div style={stylesObj.heroMetric(wide)}>
    <span style={stylesObj.heroMetricLabel(tone)}>
      <span style={stylesObj.heroMetricDot(tone)} />
      <span>{label}</span>
    </span>
    <strong style={stylesObj.heroMetricValue}>{value}</strong>
  </div>
);

const ToDoWeekStrip = ({ theme, accent, langIndex, tasks, selectedDateKey, onSelectDate }) => {
  const s = styles(theme, accent);
  const week = buildTodoWeekSummary(tasks, langIndex);

  return (
    <div style={s.weekStrip}>
      {week.map(day => {
        const active = day.key === selectedDateKey;
        const full = day.total > 0 && day.done === day.total;
        const strokeColor = active
          ? accent.hue
          : full
            ? Colors.get('done', theme)
            : s.weekRingColor(day);

        return (
          <motion.div
            key={day.key}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              onSelectDate(day.key);
              playEffects(clickSound);
            }}
            style={s.weekDay(active)}
          >
            <div style={s.weekLabel(active)}>{day.label}</div>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke={s.weekRingBg} strokeWidth="2.4" fill="none" />
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke={strokeColor}
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={s.weekRingLength}
                strokeDashoffset={s.weekRingLength - s.weekRingLength * day.progress}
                transform="rotate(-90 12 12)"
              />
            </svg>
            <div style={s.weekCount}>{day.done}/{day.total}</div>
          </motion.div>
        );
      })}
    </div>
  );
};

const TodoAccentModal = ({ show, onClose, theme, langIndex, accent, accentColor, onAccentChange, customPresets, onSavePreset }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const presetColors = mergeAccentPresets(TODO_ACCENT_PRESETS, customPresets, buildTodoAccent);
  const presetSaved = presetColors.some(color => color.toUpperCase() === accentColor.toUpperCase());

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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.button
                  type="button"
                  whileTap={!presetSaved ? { scale: 0.94 } : {}}
                  onClick={presetSaved ? undefined : onSavePreset}
                  disabled={presetSaved}
                  style={{
                    minHeight: 38,
                    borderRadius: 14,
                    border: `1px solid ${presetSaved ? (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.09)') : accent.ring}`,
                    background: presetSaved ? (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)') : accent.soft,
                    color: presetSaved ? sub : accent.hue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0 11px',
                    fontSize: 11,
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    cursor: presetSaved ? 'default' : 'pointer'
                  }}
                >
                  <FaPlus size={10} />
                  <span>{presetSaved ? (langIndex === 0 ? 'В пресетах' : 'Saved') : (langIndex === 0 ? 'В пресет' : 'Save')}</span>
                </motion.button>
                <input type="color" value={accentColor} onChange={(event) => onAccentChange(event.target.value)} style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${accent.ring}`, background: 'transparent', padding: 0 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
              {presetColors.map((color) => {
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
  const [isOpen, setIsOpen] = useState(() => !isTodoCategoryCollapsed(categoryKey || title));
  const s = styles(theme, accent);
  const categoryTone = getTodoCategoryTone(categoryKey || title, accent);
  const tone = categoryTone;
  const Icon = tone.icon;
  const done = Math.min(doneCount, count);

  useEffect(() => {
    setIsOpen(!isTodoCategoryCollapsed(categoryKey || title));
  }, [categoryKey, title]);

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    setTodoCategoryCollapsed(categoryKey || title, !next);
    playEffects(clickSound);
  };

  return (
    <div style={s.category}>
      <div
        role="button"
        tabIndex={0}
        onClick={toggleOpen}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleOpen();
          }
        }}
        style={s.categoryHeader}
      >
        <div style={s.categoryIdentity}>
          <div style={{ ...s.categoryIcon, color: tone.hue, background: tone.soft, borderColor: tone.ring }}>
            <Icon size={16} />
          </div>
          <div style={s.categoryTextBlock}>
            <span style={s.categoryName}>{title}</span>
            <span style={s.categoryMeta}>
              <span style={{ color: tone.hue }}>{done}</span> / {count} {todayCount > 0 ? (langIndex === 0 ? 'сегодня' : 'today') : (langIndex === 0 ? 'готово' : 'done')}
            </span>
          </div>
        </div>
        <div style={s.categoryRight}>
          <span style={s.categoryCount(done === count && count > 0, tone)}>{done}/{count}</span>
          <motion.span animate={{ rotate: isOpen ? 0 : -90 }} style={s.chevron}>
            <FaChevronDown size={14} />
          </motion.span>
        </div>
      </div>
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
  expanded,
  onOpen,
  onEdit,
  onCheck,
  onSubCheck,
  onSubAdd,
  onPinned,
  onHidden,
  onPending
}) => {
  const s = styles(theme, accent, fSize);
  const [subDraft, setSubDraft] = useState('');
  const totalGoals = item.goals ? item.goals.length : 0;
  const doneGoals = item.goals ? item.goals.filter(goal => goal.isDone).length : 0;
  const progress = totalGoals === 0 ? (item.isDone ? 100 : 0) : Math.round((doneGoals / totalGoals) * 100);
  const isOverdue = isDeadlinePassed(item.deadLine) && !item.isDone;
  const categoryTone = getTodoCategoryTone(item.category, accent);
  const cardAccent = categoryTone;
  const TaskIcon = cardAccent.icon;
  const submitSubDraft = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextText = subDraft.trim();
    if (!nextText) return;
    onSubAdd(event, nextText);
    setSubDraft('');
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      style={s.taskCard(item.isDone, isOverdue, item.isPinned, cardAccent, expanded)}
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
          <div style={s.metaRow}>
            {(fieldVisibility.difficulty ?? true) && item.difficulty != null && (
              <MiniBadge icon={<FaLayerGroup />} text={DIFFICULTY_LABELS[item.difficulty]?.[lang]} color={DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0]} accent={accent} theme={theme} expanded />
            )}
            {(fieldVisibility.urgency ?? true) && item.urgency != null && (
              <MiniBadge icon={<FaFire />} text={URGENCY_LABELS[item.urgency]?.[lang]} color={URGENCY_COLORS[item.urgency] || URGENCY_COLORS[0]} accent={accent} theme={theme} expanded />
            )}
            <MiniBadge
              icon={isOverdue ? <FaFire /> : <FaCalendarDay />}
              text={item.deadLine ? getDeadlineText(item.deadLine, lang) : (lang === 0 ? 'Без срока' : 'No deadline')}
              color={isOverdue ? '#E95F5F' : accent.hue}
              accent={accent}
              theme={theme}
              expanded
            />
            {totalGoals > 0 && (
              <MiniBadge icon={<FaListUl />} text={`${doneGoals}/${totalGoals}`} color={cardAccent.hue} accent={accent} theme={theme} expanded />
            )}
          </div>
        </div>

        <button type="button" onClick={onCheck} style={s.checkButton(item.isDone)}>
          {item.isDone ? <FaCheck size={12} /> : <span />}
        </button>
      </div>

      {(totalGoals > 0 || item.isDone) && (
        <div style={s.progressTrack}>
          <div style={{ ...s.progressFill(cardAccent.hue), width: `${progress}%` }} />
        </div>
      )}

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ maxHeight: 0, opacity: 0 }}
            animate={{ maxHeight: 720, opacity: 1 }}
            exit={{ maxHeight: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
            style={s.taskExpanded}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={s.expandedInfoGrid}>
              <div style={s.expandedInfo}>
                <FaCalendarDay size={10} />
                <span>{formatTaskDate(item.startDate, lang) || (lang === 0 ? 'Без старта' : 'No start')}</span>
              </div>
              <div style={s.expandedInfo}>
                <FaClock size={10} />
                <span>{item.deadLine ? formatTaskDate(item.deadLine, lang) : (lang === 0 ? 'Без дедлайна' : 'No deadline')}</span>
              </div>
            </div>

            {item.description && <div style={s.expandedDescription}>{item.description}</div>}

            <div style={s.expandedChecklist}>
              <div style={s.expandedTitle}>
                <FaListUl size={11} />
                <span>{lang === 0 ? 'Чек-лист' : 'Checklist'}</span>
                <b>{doneGoals}/{totalGoals}</b>
              </div>
              {totalGoals > 0 ? (
                <div style={s.expandedGoals}>
                  {item.goals.slice(0, 4).map((goal, index) => (
                    <button
                      key={`${goal.text}-${index}`}
                      type="button"
                      onClick={(event) => onSubCheck(event, index)}
                      style={s.expandedGoal(goal.isDone)}
                    >
                      <span style={s.expandedGoalDot(goal.isDone)}>
                        {goal.isDone && <FaCheck size={7} />}
                      </span>
                      <span>{goal.text}</span>
                    </button>
                  ))}
                  {totalGoals > 4 && <div style={s.moreGoals}>+{totalGoals - 4}</div>}
                </div>
              ) : (
                <div style={s.emptyChecklist}>{lang === 0 ? 'Шаги не добавлены' : 'No steps added'}</div>
              )}
              <form style={s.checklistAddRow} onSubmit={submitSubDraft} onClick={(event) => event.stopPropagation()}>
                <FaPlus size={10} />
                <input
                  type="text"
                  value={subDraft}
                  onChange={(event) => setSubDraft(event.target.value)}
                  placeholder={lang === 0 ? 'Добавить шаг...' : 'Add step...'}
                  style={s.checklistAddInput}
                />
                <button
                  type="submit"
                  disabled={!subDraft.trim()}
                  style={s.checklistAddButton(Boolean(subDraft.trim()))}
                >
                  <FaCheck size={9} />
                </button>
              </form>
            </div>

            <div style={s.expandedActions}>
              <button type="button" onClick={onCheck} style={s.completeTaskButton(item.isDone)}>
                <FaCheckCircle size={13} />
                <span>{item.isDone ? (lang === 0 ? 'Вернуть в работу' : 'Reopen') : (lang === 0 ? 'Выполнено' : 'Complete')}</span>
              </button>
              <button type="button" onClick={onEdit} style={s.editTaskButton}>
                <FaPen size={12} />
                <span>{lang === 0 ? 'Редактировать' : 'Edit'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={s.actionRow(expanded)}>
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

const MiniBadge = ({ icon, text, color, theme, expanded = false }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const hex = (color || '#149DFF').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 143;
  const g = parseInt(hex.slice(2, 4), 16) || 166;
  const b = parseInt(hex.slice(4, 6), 16) || 200;
  const tintBg = `rgba(${r},${g},${b},${isLight ? 0.045 : 0.055})`;
  const tintBorder = `rgba(${r},${g},${b},${isLight ? 0.11 : 0.13})`;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: expanded ? 3 : 0,
        height: expanded ? 16 : 20,
        width: expanded ? 'auto' : 24,
        minWidth: expanded ? 16 : 20,
        padding: expanded ? '0 6px' : 0,
        justifyContent: 'center',
        borderRadius: 999,
        background: tintBg,
        border: `1px solid ${tintBorder}`,
        color,
        fontSize: expanded ? 8.5 : 9,
        fontWeight: 850,
        letterSpacing: 0.1,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        lineHeight: 1,
        flexShrink: 0,
        overflow: 'hidden',
        opacity: 0.76
      }}
    >
      {React.cloneElement(icon, { size: expanded ? 7 : 9, color })}
      {expanded && <span>{text}</span>}
    </span>
  );
};

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
        ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgbText},0.1), transparent 66%), #F4F5F7`
        : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgbText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`,
      color: text,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    scroll: {
      height: '100%',
      overflowY: 'auto',
      padding: `${TODO_SECTION_TOP} 0 calc(132px + env(safe-area-inset-bottom, 0px))`,
      boxSizing: 'border-box'
    },
    pageHeader: {
      width: 'calc(100% - 56px)',
      maxWidth: 660,
      margin: '0 auto 8px',
      padding: '4px 0 8px',
      boxSizing: 'border-box',
      display: 'grid',
      gridTemplateColumns: '96px minmax(0, 1fr) 96px',
      alignItems: 'center',
      gap: 12
    },
    pageHeaderSpacer: { width: 96, height: 38 },
    pageHeaderBrand: { minWidth: 0, textAlign: 'center' },
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
    headerAccentButton: {
      minWidth: 0,
      height: 38,
      borderRadius: 999,
      border: `1px solid ${accent.ring}`,
      background: accent.soft,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      justifySelf: 'end',
      gap: 7,
      fontSize: 12,
      fontWeight: 900,
      fontFamily: 'inherit',
      padding: '0 12px',
      whiteSpace: 'nowrap'
    },
    hero: {
      position: 'relative',
      width: 'calc(100% - 56px)',
      maxWidth: 660,
      margin: '0 auto',
      borderRadius: 24,
      padding: '14px 16px',
      overflow: 'hidden',
      background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(${accent.rgbText},0.12) 58%, rgba(${accent.rgbText},0.08) 100%)`
        : `linear-gradient(145deg, rgba(23,27,31,0.96) 0%, rgba(${accent.rgbText},0.14) 54%, rgba(${accent.rgbText},0.08) 100%)`,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : accent.ring}`,
      boxShadow: isLight
        ? `0 16px 38px -34px rgba(${accent.rgbText},0.45), 0 1px 0 rgba(255,255,255,0.72) inset`
        : `0 18px 40px -34px rgba(${accent.rgbText},0.50), 0 1px 0 rgba(255,255,255,0.055) inset`,
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      boxSizing: 'border-box',
      isolation: 'isolate'
    },
    heroGlow: {
      position: 'absolute',
      right: -44,
      top: -58,
      width: 170,
      height: 170,
      borderRadius: '50%',
      background: `radial-gradient(circle, rgba(${accent.rgbText},0.22) 0%, transparent 62%)`,
      pointerEvents: 'none',
      zIndex: 0
    },
    heroImage: {
      position: 'absolute',
      right: 4,
      bottom: -6,
      width: 'min(28vw, 118px)',
      maxHeight: 120,
      objectFit: 'contain',
      pointerEvents: 'none',
      opacity: isLight ? 0.78 : 0.82,
      filter: isLight ? 'drop-shadow(0 16px 24px rgba(15,23,42,0.16))' : 'drop-shadow(0 18px 28px rgba(0,0,0,0.46))',
      WebkitMaskImage: 'radial-gradient(ellipse at 52% 48%, #000 0 62%, rgba(0,0,0,0.72) 72%, transparent 88%)',
      maskImage: 'radial-gradient(ellipse at 52% 48%, #000 0 62%, rgba(0,0,0,0.72) 72%, transparent 88%)',
      zIndex: 0
    },
    heroHeader: { position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minWidth: 0 },
    heroControls: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    heroCollapsible: { position: 'relative', zIndex: 1, overflow: 'hidden', marginTop: 12 },
    heroTextBlock: { minWidth: 0 },
    eyebrow: { color: sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' },
    title: { margin: '4px 0 0', color: text, fontSize: fSize === 0 ? 20 : 22, lineHeight: 1.08, fontWeight: 950, letterSpacing: 0 },
    heroUtilityButton: (active) => ({
      minHeight: 38,
      borderRadius: 15,
      border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(159,180,196,0.18)',
      background: active ? accent.soft : isLight ? 'rgba(255,255,255,0.64)' : 'rgba(175,196,212,0.095)',
      color: active ? accent.hue : sub,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      padding: '0 11px',
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: 900,
      flexShrink: 0,
      cursor: 'pointer',
      outline: 'none',
      boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.045) inset'
    }),
    heroCollapseButton: {
      width: 38,
      height: 38,
      borderRadius: 15,
      border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(159,180,196,0.18)',
      background: isLight ? 'rgba(255,255,255,0.58)' : 'rgba(175,196,212,0.075)',
      color: sub,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      outline: 'none',
      boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.04) inset'
    },
    heroIconButton: (active) => ({
      width: 38,
      height: 38,
      borderRadius: 15,
      border: `1px solid ${active ? accent.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(159,180,196,0.18)')}`,
      background: active ? accent.soft : (isLight ? 'rgba(255,255,255,0.58)' : 'rgba(175,196,212,0.075)'),
      color: active ? accent.hue : sub,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
      cursor: 'pointer',
      outline: 'none',
      boxShadow: active ? `0 0 18px ${accent.glow}` : (isLight ? '0 1px 0 rgba(255,255,255,0.7) inset' : '0 1px 0 rgba(255,255,255,0.04) inset')
    }),
    heroSearchGlyph: (active) => ({
      position: 'absolute',
      left: 'calc(50% - 2px)',
      top: 'calc(50% - 1px)',
      width: 16,
      height: 16,
      display: 'block',
      color: active ? accent.hue : sub,
      opacity: active ? 0.86 : 0.72,
      transform: 'translate(-50%, -50%)'
    }),
    heroSearchCircle: (active) => ({
      position: 'absolute',
      left: 2,
      top: 2,
      width: 9.5,
      height: 9.5,
      borderRadius: '50%',
      border: `2px solid ${active ? accent.hue : sub}`,
      boxSizing: 'border-box'
    }),
    heroSearchHandle: (active) => ({
      position: 'absolute',
      left: 10.5,
      top: 10.5,
      width: 5,
      height: 1.9,
      borderRadius: 999,
      background: active ? accent.hue : sub,
      transform: 'rotate(45deg)',
      transformOrigin: 'left center'
    }),
    heroSummaryCard: {
      borderRadius: 14,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`,
      background: isLight ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.032)',
      padding: '10px 11px',
      boxSizing: 'border-box',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
    },
    heroSummaryTop: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      marginBottom: 8,
      color: sub,
      fontSize: 10,
      fontWeight: 900,
      letterSpacing: '0.1em',
      textTransform: 'uppercase'
    },
    heroSummaryValue: { color: text, fontSize: 13, fontWeight: 950, fontVariantNumeric: 'tabular-nums', letterSpacing: 0 },
    heroSummarySmall: { color: sub, fontSize: 10, fontWeight: 850 },
    progressTrackHero: { height: 5, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)', overflow: 'hidden' },
    heroProgressFill: { height: '100%', borderRadius: 999, background: accent.hue, boxShadow: `0 0 16px ${accent.glow}` },
    heroMetricGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 10 },
    heroMetric: (wide = false) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      width: '100%',
      minWidth: 0,
      minHeight: wide ? 34 : 32,
      borderRadius: 12,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)'}`,
      background: isLight ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.035)',
      padding: '0 10px',
      boxSizing: 'border-box',
      overflow: 'hidden',
      gridColumn: wide ? '1 / -1' : 'auto'
    }),
    heroMetricLabel: (tone) => ({
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      color: sub,
      fontSize: 10.5,
      fontWeight: 850,
      minWidth: 0,
      flex: 1
    }),
    heroMetricDot: (tone) => ({ width: 5, height: 5, borderRadius: 99, background: tone.hue, flexShrink: 0 }),
    heroMetricValue: { color: text, fontSize: 12, fontWeight: 950, fontVariantNumeric: 'tabular-nums', flexShrink: 0 },
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
    weekStrip: {
      width: 'calc(100% - 56px)',
      maxWidth: 660,
      margin: '14px auto 0',
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gap: 6
    },
    weekDay: (active) => ({
      minHeight: 70,
      borderRadius: 16,
      border: active ? `1px solid ${accent.ring}` : '1px solid transparent',
      background: active ? accent.soft : 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      cursor: 'pointer'
    }),
    weekLabel: (active) => ({ color: active ? accent.hue : sub, fontSize: 9, fontWeight: 900, letterSpacing: '0.06em' }),
    weekRingBg: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)',
    weekRingLength: 2 * Math.PI * 9,
    weekRingColor: (day) => day.total > 0 && day.done === day.total ? Colors.get('done', theme) : (isLight ? 'rgba(15,23,42,0.32)' : 'rgba(255,255,255,0.24)'),
    weekCount: { color: sub, fontSize: 10, fontWeight: 850, fontVariantNumeric: 'tabular-nums' },
	    listWrap: {
	      width: 'calc(100% - 56px)',
	      maxWidth: 660,
	      margin: '20px auto 0',
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 18,
	      boxSizing: 'border-box'
	    },
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
	    category: { width: '100%', margin: '0 auto', boxSizing: 'border-box' },
	    categoryHeader: {
	      width: '100%',
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'space-between',
	      padding: '4px 4px 10px',
	      gap: 10,
	      color: text,
	      cursor: 'pointer',
	      userSelect: 'none',
	      outline: 'none'
	    },
	    categoryIdentity: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 },
	    categoryIcon: {
	      width: 32,
	      height: 32,
	      borderRadius: 11,
	      border: '1px solid',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    categoryTextBlock: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
	    categoryName: { display: 'block', fontSize: 15, fontWeight: 900, width: '100%', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.15 },
	    categoryMeta: { display: 'block', width: '100%', color: sub, fontSize: 11, fontWeight: 800, marginTop: 3, lineHeight: 1.2, textAlign: 'center' },
	    categoryRight: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    categoryCount: (completed, tone) => ({
      minWidth: 44,
	      height: 28,
	      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: completed ? Colors.get('done', theme) : sub,
      background: completed ? 'rgba(16,185,129,0.13)' : (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)'),
      border: `1px solid ${completed ? 'rgba(16,185,129,0.24)' : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)')}`,
	      fontSize: 12,
	      fontWeight: 900,
      fontVariantNumeric: 'tabular-nums'
    }),
    chevron: { color: sub, display: 'flex' },
    categoryBody: { overflowY: 'hidden', overflowX: 'visible', display: 'flex', flexDirection: 'column', gap: 10, padding: '0 1px', boxSizing: 'border-box' },
    taskCard: (done, overdue, pinned, tone = accent, expanded = false) => ({
      position: 'relative',
      borderRadius: 20,
      padding: '14px 16px 13px',
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
    taskMainRow: { display: 'flex', alignItems: 'center', gap: 14, minHeight: 56 },
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
	    taskContent: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    taskHeaderLine: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 0, flexWrap: 'nowrap' },
    taskName: (done) => ({
      color: done ? sub : text,
      fontSize: fSize === 0 ? 16 : 17,
      fontWeight: 950,
      lineHeight: 1.2,
      minWidth: 0,
      flex: '0 1 auto',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      textDecoration: done ? 'line-through' : 'none',
      textAlign: 'center'
    }),
    description: { width: '100%', marginTop: 4, color: sub, fontSize: 12, fontWeight: 700, lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', textAlign: 'center' },
    checkButton: (done) => ({
      width: 40,
      height: 30,
      borderRadius: 10,
      border: `1px solid ${done ? 'rgba(16,185,129,0.30)' : (isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.095)')}`,
      background: done ? Colors.get('done', theme) : 'transparent',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    }),
    metaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      marginTop: 6,
      paddingLeft: 0,
      paddingRight: 0,
      boxSizing: 'border-box',
      opacity: 0.82,
      width: '100%',
      maxWidth: 270
    },
    progressTrack: { height: 5, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)', overflow: 'hidden', marginTop: 10 },
    progressFill: (color) => ({ height: '100%', borderRadius: 999, background: color, boxShadow: `0 0 18px ${color}66` }),
    taskExpanded: { overflow: 'hidden', marginTop: 10, borderTop: `1px solid ${border}`, paddingTop: 10, willChange: 'max-height, opacity', contain: 'layout paint' },
    expandedInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 7 },
    expandedInfo: {
      minHeight: 32,
      borderRadius: 12,
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
      border: `1px solid ${border}`,
      color: sub,
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '0 10px',
      fontSize: 11,
      fontWeight: 850,
      minWidth: 0,
      overflow: 'hidden'
    },
    expandedDescription: { marginTop: 8, color: text, fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, opacity: 0.86 },
    expandedChecklist: { marginTop: 9, borderRadius: 14, background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.028)', border: `1px solid ${border}`, padding: 10 },
    expandedTitle: { display: 'flex', alignItems: 'center', gap: 7, color: sub, fontSize: 11, fontWeight: 900, marginBottom: 8 },
    expandedGoals: { display: 'flex', flexDirection: 'column', gap: 6 },
    expandedGoal: (done) => ({ width: '100%', border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', gap: 8, minHeight: 30, color: done ? sub : text, fontSize: 12, fontWeight: 780, textDecoration: done ? 'line-through' : 'none', fontFamily: 'inherit', textAlign: 'left', padding: '3px 2px', cursor: 'pointer', borderRadius: 9 }),
    expandedGoalDot: (done) => ({ width: 16, height: 16, borderRadius: 5, border: `1px solid ${done ? Colors.get('done', theme) : border}`, background: done ? Colors.get('done', theme) : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    moreGoals: { color: sub, fontSize: 11, fontWeight: 850 },
    emptyChecklist: { color: sub, fontSize: 12, fontWeight: 750, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
    checklistAddRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      minHeight: 38,
      marginTop: 8,
      padding: '0 8px',
      borderRadius: 12,
      border: `1px dashed ${accent.ring}`,
      background: accent.faint,
      color: accent.hue,
      boxSizing: 'border-box'
    },
    checklistAddInput: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: text,
      fontSize: 12,
      fontWeight: 800,
      fontFamily: 'inherit'
    },
    checklistAddButton: (enabled) => ({
      width: 26,
      height: 26,
      borderRadius: 9,
      border: `1px solid ${enabled ? accent.ring : border}`,
      background: enabled ? accent.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.04)'),
      color: enabled ? accent.hue : sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 0,
      opacity: enabled ? 1 : 0.46,
      cursor: enabled ? 'pointer' : 'default'
    }),
    expandedActions: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 8, marginTop: 9 },
    completeTaskButton: (done) => ({
      minHeight: 38,
      borderRadius: 14,
      border: `1px solid ${done ? 'rgba(159,180,196,0.18)' : 'rgba(16,185,129,0.28)'}`,
      background: done ? (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)') : 'rgba(16,185,129,0.16)',
      color: done ? sub : Colors.get('done', theme),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 12,
      fontWeight: 950,
      fontFamily: 'inherit'
    }),
    editTaskButton: {
      minHeight: 38,
      borderRadius: 14,
      border: `1px solid ${accent.ring}`,
      background: accent.soft,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      fontSize: 12,
      fontWeight: 950,
      fontFamily: 'inherit'
    },
    actionRow: (expanded = false) => ({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      marginTop: expanded ? 10 : 7,
      paddingLeft: expanded ? 0 : 60,
      paddingRight: expanded ? 0 : 56,
      boxSizing: 'border-box',
      flexWrap: 'wrap'
    }),
    actionButton: (active) => ({
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.025)',
      color: active ? accent.hue : sub,
      borderRadius: 999,
      minHeight: 20,
      padding: '0 6px',
      display: 'flex',
      alignItems: 'center',
      gap: 3,
      fontSize: 8.5,
      fontWeight: 900,
      fontFamily: 'inherit'
    }),
    donePill: {
      minHeight: 22,
      padding: '0 8px',
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      color: Colors.get('done', theme),
      background: 'rgba(16,185,129,0.13)',
      border: '1px solid rgba(16,185,129,0.24)',
      fontSize: 9,
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

function formatTaskDate(dateStr, lang) {
  const date = parseDate(dateStr);
  if (!date) return '';
  return date.toLocaleDateString(lang === 0 ? 'ru-RU' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}
