import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCalendarDay,
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
import { FaCheck } from 'react-icons/fa6';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { playEffects } from '../../StaticClasses/Effects.js';
import { saveData } from '../../StaticClasses/SaveHelper';
import { fontSize$, lang$, selectedTodo$, setAddPanel, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';
import { addSubGoal, todoEvents$, toggleGoal, toggleHidden, togglePending, togglePinned, toggleSubGoal } from './ToDoHelper.js';
import {
  buildTodoAccent,
  DEFAULT_TODO_ACCENT_COLOR,
  getTodoCategoryMeta,
  getTodoCategoryTone,
  normalizeTodoCategory,
  TODO_ACCENT_PRESETS,
  TODO_SUCCESS,
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

const makeTodoTone = (hue) => {
  const safe = hue.replace('#', '');
  const r = Number.parseInt(safe.slice(0, 2), 16);
  const g = Number.parseInt(safe.slice(2, 4), 16);
  const b = Number.parseInt(safe.slice(4, 6), 16);
  const rgbText = `${r}, ${g}, ${b}`;
  return {
    hue,
    rgbText,
    soft: `rgba(${rgbText}, 0.18)`,
    faint: `rgba(${rgbText}, 0.10)`,
    ring: `rgba(${rgbText}, 0.38)`,
    glow: `rgba(${rgbText}, 0.34)`
  };
};

const FILTERS = [
  { id: 0, label: ['Все', 'All'] },
  { id: 1, label: ['Сегодня', 'Today'] },
  { id: 2, label: ['В работе', 'Active'] },
  { id: 3, label: ['Отложено', 'Pending'] },
  { id: 4, label: ['Архив', 'Archive'] }
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

function getSelectedDateLabel(selectedDateKey, langIndex) {
  const today = dateKey(new Date());
  if (selectedDateKey === today) return langIndex === 0 ? 'сегодня' : 'today';
  const date = parseDate(selectedDateKey);
  if (!date) return langIndex === 0 ? 'готово' : 'done';
  return date.toLocaleDateString(langIndex === 0 ? 'ru-RU' : 'en-US', { day: '2-digit', month: '2-digit' });
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
  const today = dateKey(new Date());
  return [-6, -5, -4, -3, -2, -1, 0].map(offset => {
    const key = getDateKeyWithOffset(offset);
    const dayTasks = visibleTasks.filter(task => isTaskActiveOnDate(task, key));
    const done = dayTasks.filter(task => task.isDone).length;
    const hasOverdue = key < today && dayTasks.some(task => !task.isDone && isDeadlinePassed(task.deadLine));

    return {
      key,
      label: getWeekdayLabel(offset, langIndex),
      isToday: offset === 0,
      done,
      total: dayTasks.length,
      progress: dayTasks.length ? done / dayTasks.length : 0,
      hasOverdue
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

    if (filterParams !== 4) {
      processedList = processedList.filter(task => isTaskActiveOnDate(task, selectedDateKey));
    }

    switch (filterParams) {
      case 1:
        processedList = processedList.filter(task => isTaskVisibleInMainList(task) && isTodayTask(task));
        break;
      case 2:
        processedList = processedList.filter(task => !task.isDone && !task.isPending);
        break;
      case 3:
        processedList = processedList.filter(task => !task.isDone && task.isPending);
        break;
      case 4:
        processedList = processedList.filter(task => isTaskCompletedBeforeToday(task));
        break;
      default:
        processedList = processedList.filter(task => isTaskVisibleInMainList(task));
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

  const archiveTasksCount = useMemo(
    () => (AppData.todoList || []).filter(task => isTaskCompletedBeforeToday(task)).length,
    [refreshTrigger]
  );

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

  const toggleArchiveView = () => {
    setFilterParams(prev => (prev === 4 ? 0 : 4));
    setShowHiddenTasks(false);
    playEffects(clickSound);
  };

  const openNewTask = () => {
    selectedTodo$.next({});
    setPage('ToDoNew');
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
  const hasAnyTasks = (AppData.todoList || []).length > 0;
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
      <HoverInfoButton tab="ToDoMain" variant="subtle" accent={accent.hue} />
      <div style={s.scroll} className="no-scrollbar">
        <ToDoPageHeader
          theme={theme}
          fSize={fSize}
          langIndex={langIndex}
          accent={accent}
          onAccentClick={() => setShowAccentSettings(true)}
        />
        {hasAnyTasks && (
          <>
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
          </>
        )}
        <section style={hasAnyTasks ? s.listWrap : s.emptyListWrap}>
          <AnimatePresence mode="popLayout">
            {sortedList.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={hasAnyTasks ? s.emptyState : s.zeroState}>
                {!hasAnyTasks && <div style={s.zeroGlow} />}
                <div style={hasAnyTasks ? s.emptyIcon : s.zeroIcon}>
                  {hasAnyTasks ? <FaInbox /> : <FaListUl />}
                </div>
                <div style={hasAnyTasks ? s.emptyTitle : s.zeroTitle}>{emptyText}</div>
                <div style={hasAnyTasks ? s.emptySub : s.zeroSub}>
                  {hasAnyTasks
                    ? (langIndex === 0 ? 'Новые дела появятся здесь.' : 'New tasks will appear here.')
                    : (langIndex === 0 ? 'Создайте первую задачу: сроки, шаги и фокус появятся здесь.' : 'Create your first task: deadlines, steps, and focus will appear here.')}
                </div>
                {!hasAnyTasks && (
                  <motion.button type="button" whileTap={{ scale: 0.96 }} onClick={openNewTask} style={s.zeroCta}>
                    <FaPlus size={13} />
                    {langIndex === 0 ? 'Добавить задачу' : 'Add task'}
                  </motion.button>
                )}
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
                  summaryLabel={getSelectedDateLabel(selectedDateKey, langIndex)}
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
          {(hiddenTasksCount > 0 || archiveTasksCount > 0) && (
            <div style={s.revealActions}>
              {hiddenTasksCount > 0 && (
                <motion.button
                  key="hidden-toggle-bottom"
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowHiddenTasks(prev => !prev);
                    playEffects(clickSound);
                  }}
                  style={s.hiddenRevealBar(showHiddenTasks)}
                >
                  {showHiddenTasks ? <FaRegEyeSlash /> : <FaEye />}
                  <span>
                    {showHiddenTasks
                      ? (langIndex === 0 ? 'Скрыть скрытые' : 'Hide hidden')
                      : (langIndex === 0 ? 'Скрытые' : 'Hidden')}
                  </span>
                  <b>{hiddenTasksCount}</b>
                </motion.button>
              )}
              {(hiddenTasksCount > 0 || archiveTasksCount > 0) && (
                <motion.button
                  key="archive-toggle-bottom"
                  type="button"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={toggleArchiveView}
                  style={s.hiddenRevealBar(filterParams === 4)}
                >
                  <FaCheckCircle />
                  <span>{langIndex === 0 ? 'Архив' : 'Archive'}</span>
                  <b>{archiveTasksCount}</b>
                </motion.button>
              )}
            </div>
          )}
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
  const isAllDone = stats.total > 0 && stats.done === stats.total;
  const doneTone = isAllDone ? TODO_SUCCESS : accent;
  const activeTone = makeTodoTone('#5AB2FF');
  const todayTone = makeTodoTone('#36D399');
  const pendingTone = makeTodoTone('#F28C61');
  const overdueTone = makeTodoTone('#FF6B5E');
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
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={s.hero}>
      <div style={s.heroGlow} />
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
      <div className={`smooth-accordion ${showFilters ? 'is-open' : ''}`} style={{ marginTop: showFilters ? 12 : 0 }}>
        <div className="smooth-accordion-inner" style={{ ...s.filterDrawer, marginTop: 0 }}>
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
                    if (filter.id === 4) {
                      setFilterParams(prev => (prev === 4 ? 0 : 4));
                      setShowHiddenTasks(false);
                      playEffects(clickSound);
                      return;
                    }
                    setFilterParams(filter.id);
                    playEffects(clickSound);
                  }}
                  style={s.filterChip(filterParams === filter.id)}
                >
                  {filter.label[langIndex]}
                </button>
              ))}
            </div>

            <div className={`smooth-accordion ${showSorts ? 'is-open' : ''}`}>
              <div className="smooth-accordion-inner no-scrollbar" style={s.sortRow}>
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
              </div>
            </div>

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
        </div>
      </div>

      {/* Виджеты-статистика — открывается кнопкой "Виджеты" */}
      <div className={`smooth-accordion ${isOpen ? 'is-open' : ''}`} style={{ marginTop: isOpen ? 12 : 0 }}>
        <div className="smooth-accordion-inner" style={{ ...s.heroCollapsible, marginTop: 0 }}>
            <div style={s.heroSummaryCard(isAllDone, doneTone)}>
              <div style={s.heroSummaryTop}>
                <span>{langIndex === 0 ? 'Готово' : 'Done'}</span>
                <strong style={s.heroSummaryValue(isAllDone, doneTone)}>{stats.done}<small style={s.heroSummarySmall}> / {stats.total}</small></strong>
              </div>
              <div style={s.progressTrackHero(isAllDone, doneTone)}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(doneProgress * 100)}%` }}
                  transition={{ duration: 0.72 }}
                  style={s.heroProgressFill(doneTone)}
                />
              </div>
            </div>
            <div style={s.heroMetricGrid}>
              <HeroMetric label={langIndex === 0 ? 'В работе' : 'Active'} value={stats.active} tone={activeTone} stylesObj={s} />
              <HeroMetric label={langIndex === 0 ? 'Сегодня' : 'Today'} value={stats.today} tone={todayTone} stylesObj={s} />
              <HeroMetric label={langIndex === 0 ? 'Отложено' : 'Pending'} value={stats.pending} tone={pendingTone} stylesObj={s} />
              <HeroMetric label={langIndex === 0 ? 'Просрочено' : 'Overdue'} value={stats.overdue} tone={overdueTone} stylesObj={s} icon={<FaFire size={10} />} />
            </div>
        </div>
      </div>
    </motion.section>
  );
};

const HeroMetric = ({ label, value, tone, stylesObj, wide = false, icon = null }) => (
  <div style={stylesObj.heroMetric(wide)}>
    <span style={stylesObj.heroMetricLabel(tone)}>
      {icon ? <span style={stylesObj.heroMetricIcon(tone)}>{icon}</span> : <span style={stylesObj.heroMetricDot(tone)} />}
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
        const overdue = day.hasOverdue;
        const overdueColor = '#E95F5F';
        const strokeColor = active
          ? (overdue ? overdueColor : accent.hue)
          : full
            ? Colors.get('done', theme)
            : overdue
              ? overdueColor
              : s.weekRingColor(day);

        return (
          <motion.div
            key={day.key}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              onSelectDate(day.key);
              playEffects(clickSound);
            }}
            style={s.weekDay(active, overdue)}
          >
            <div style={s.weekLabel(active, overdue)}>{day.label}</div>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" stroke={s.weekRingBg} strokeWidth="2.4" fill="none" />
              <motion.circle
                cx="12"
                cy="12"
                r="9"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={s.weekRingLength}
                initial={false}
                animate={{
                  stroke: strokeColor,
                  strokeDashoffset: s.weekRingLength - s.weekRingLength * day.progress
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                transform="rotate(-90 12 12)"
              />
            </svg>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${day.key}-${day.done}-${day.total}-${overdue}`}
                initial={{ opacity: 0, y: -3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 3 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={s.weekCount(overdue)}
              >
                {day.done}/{day.total}
              </motion.div>
            </AnimatePresence>
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

const CategoryPanel = ({ title, categoryKey, count, doneCount, todayCount, children, theme, accent, langIndex, summaryLabel }) => {
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
              <span style={{ color: tone.hue }}>{done}</span> / {count} {summaryLabel || (langIndex === 0 ? 'сегодня' : 'today')}
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
      <div className={`smooth-accordion ${isOpen ? 'is-open' : ''}`}>
        <div className="smooth-accordion-inner" style={s.categoryBody}>
            {children}
        </div>
      </div>
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
  const categoryTone = getTodoCategoryTone(item.category, accent, item.icon);
  const cardAccent = categoryTone;
  const overdueTone = makeTodoTone('#E95F5F');
  const glyphTone = item.isDone ? TODO_SUCCESS : (isOverdue ? overdueTone : cardAccent);
  const isProgressComplete = progress >= 100;
  const progressTone = isProgressComplete ? TODO_SUCCESS : (isOverdue ? overdueTone : cardAccent);
  const completedBadgeColor = theme === 'light' || theme === 'speciallight' ? '#7D8794' : '#8E98A6';
  const badgeColor = (color) => item.isDone ? completedBadgeColor : color;
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
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{
        opacity: { duration: 0.18 },
        y: { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
      }}
	      whileTap={{ scale: 0.985 }}
      onClick={onOpen}
      style={s.taskCard(item.isDone, isOverdue, item.isPinned, cardAccent)}
    >
      <div style={s.taskMainRow}>
        <div style={{ ...s.taskGlyph, color: glyphTone.hue, background: glyphTone.soft, borderColor: glyphTone.ring }}>
          <TaskIcon size={18} />
        </div>

        <div style={s.taskContent}>
          <div style={s.taskHeaderLine}>
            <div style={s.taskName(item.isDone, expanded)}>{item.name}</div>
            {item.isPinned && <FaThumbtack size={11} color={accent.hue} />}
          </div>
          <div style={s.metaRow}>
            {(fieldVisibility.difficulty ?? true) && item.difficulty != null && (
              <MiniBadge icon={<FaLayerGroup />} text={DIFFICULTY_LABELS[item.difficulty]?.[lang]} color={badgeColor(DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0])} theme={theme} expanded muted={item.isDone} />
            )}
            {(fieldVisibility.urgency ?? true) && item.urgency != null && (
              <MiniBadge icon={<FaFlag />} text={URGENCY_LABELS[item.urgency]?.[lang]} color={badgeColor(URGENCY_COLORS[item.urgency] || URGENCY_COLORS[0])} theme={theme} expanded muted={item.isDone} />
            )}
            <MiniBadge
              icon={isOverdue ? <FaFire /> : <FaCalendarDay />}
              text={item.deadLine ? getDeadlineText(item.deadLine, lang) : (lang === 0 ? 'Без срока' : 'No deadline')}
              color={badgeColor(isOverdue ? '#E95F5F' : accent.hue)}
              theme={theme}
              expanded
              muted={item.isDone}
            />
            {totalGoals > 0 && (
              <MiniBadge icon={<FaListUl />} text={`${doneGoals}/${totalGoals}`} color={badgeColor(cardAccent.hue)} theme={theme} expanded muted={item.isDone} />
            )}
          </div>
        </div>

	        <motion.button type="button" whileTap={{ scale: 0.9 }} transition={{ duration: 0.14, ease: 'easeOut' }} onClick={onCheck} style={s.checkButton(item.isDone)}>
          {item.isDone && <FaCheck size={14} />}
        </motion.button>
      </div>

      <div className={`smooth-accordion ${expanded ? 'is-open' : ''}`} style={s.taskExpandedShell} onClick={(event) => event.stopPropagation()}>
        <div className="smooth-accordion-inner">
            <div style={s.taskExpanded}>
              {(totalGoals > 0 || item.isDone) && (
                <div style={s.progressTrack(isProgressComplete, progressTone)}>
                  <div style={{ ...s.progressFill(progressTone.hue), width: `${progress}%` }} />
                </div>
              )}

              {item.description && <div style={s.expandedDescription}>{item.description}</div>}

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
                        <span style={s.expandedGoalText(goal.isDone)}>{goal.text}</span>
                        <span style={s.expandedGoalDot(goal.isDone)}>
                          {goal.isDone && <FaCheck size={12} />}
                        </span>
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

              <div style={s.actionRow}>
                <ActionButton active={item.isPinned} label={lang === 0 ? 'Закрепить' : 'Pin'} icon={<FaThumbtack />} onClick={(event) => { event.stopPropagation(); onPinned(item.id); }} theme={theme} accent={accent} />
                <ActionButton active={item.isPending} label={lang === 0 ? 'Позже' : 'Later'} icon={<FaClock />} onClick={(event) => { event.stopPropagation(); onPending(item.id); }} theme={theme} accent={accent} />
                <ActionButton active={item.isHidden} label={lang === 0 ? 'Скрыть' : 'Hide'} icon={<FaRegEyeSlash />} onClick={(event) => { event.stopPropagation(); onHidden(item.id); }} theme={theme} accent={accent} />
                {item.isDone && (
                  <span style={s.donePill}>
                    <FaCheckCircle size={11} />
                    {lang === 0 ? 'Готово' : 'Done'}
                  </span>
                )}
              </div>
            </div>
        </div>
      </div>
    </motion.article>
  );
};

const ActionButton = ({ active, label, icon, onClick, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <motion.button type="button" whileTap={{ scale: 0.94, y: 1 }} onClick={onClick} style={s.actionButton(active)}>
      {React.cloneElement(icon, { size: 9 })}
      <span style={s.actionButtonLabel}>{label}</span>
    </motion.button>
  );
};

const MiniBadge = ({ icon, text, color, theme, expanded = false, muted = false }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const hex = (color || '#149DFF').replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 143;
  const g = parseInt(hex.slice(2, 4), 16) || 166;
  const b = parseInt(hex.slice(4, 6), 16) || 200;
  const tintBg = muted
    ? (isLight ? 'rgba(125,135,148,0.08)' : 'rgba(142,152,166,0.08)')
    : `rgba(${r},${g},${b},${isLight ? 0.045 : 0.055})`;
  const tintBorder = muted
    ? (isLight ? 'rgba(125,135,148,0.15)' : 'rgba(142,152,166,0.16)')
    : `rgba(${r},${g},${b},${isLight ? 0.11 : 0.13})`;

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
        opacity: muted ? 0.64 : 0.76
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
  const panel = isLight
    ? 'linear-gradient(135deg, rgba(255,255,255,0.68), rgba(255,255,255,0.40))'
    : 'linear-gradient(135deg, rgba(255,255,255,0.070), rgba(255,255,255,0.026))';
  const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(20,23,27,0.86)';
  const glassShadow = isLight
    ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
    : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)';

  return {
    container: {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: isLight
        ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgbText},0.1), transparent 66%), #F4F5F7`
        : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgbText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`,
      color: text,
      fontFamily: "'SF Pro Rounded', 'Nunito Sans', Nunito, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', system-ui, sans-serif"
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
      fontFamily: 'inherit',
      fontSize: 24,
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
        ? `linear-gradient(145deg, rgba(255,255,255,0.70) 0%, rgba(${accent.rgbText},0.10) 58%, rgba(255,255,255,0.36) 100%)`
        : `linear-gradient(145deg, rgba(23,27,31,0.68) 0%, rgba(${accent.rgbText},0.11) 54%, rgba(255,255,255,0.025) 100%)`,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.075)' : 'rgba(190,220,235,0.13)'}`,
      boxShadow: glassShadow,
      backdropFilter: 'blur(26px) saturate(170%)',
      WebkitBackdropFilter: 'blur(26px) saturate(170%)',
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
      background: `radial-gradient(circle, rgba(${accent.rgbText},0.12) 0%, transparent 64%)`,
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
    heroSummaryCard: (complete = false, tone = accent) => ({
      borderRadius: 14,
      border: `1px solid ${complete ? tone.ring : border}`,
      background: complete
        ? (isLight
          ? `linear-gradient(135deg, rgba(255,255,255,0.72), ${tone.soft})`
          : `radial-gradient(180px 90px at 85% 10%, ${tone.soft}, transparent 72%), rgba(255,255,255,0.042)`)
        : (isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.038)'),
      padding: '10px 11px',
      boxSizing: 'border-box',
      boxShadow: complete ? `0 1px 0 rgba(255,255,255,0.055) inset, 0 0 22px ${tone.glow}` : '0 1px 0 rgba(255,255,255,0.04) inset'
    }),
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
    heroSummaryValue: (complete = false, tone = accent) => ({ color: complete ? tone.hue : text, fontSize: 13, fontWeight: 950, fontVariantNumeric: 'tabular-nums', letterSpacing: 0 }),
    heroSummarySmall: { color: sub, fontSize: 10, fontWeight: 850 },
    progressTrackHero: (complete = false, tone = accent) => ({ height: 5, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.07)', overflow: 'hidden', boxShadow: complete ? `0 0 14px ${tone.glow}` : 'none' }),
    heroProgressFill: (tone = accent) => ({ height: '100%', borderRadius: 999, background: tone.hue, boxShadow: `0 0 16px ${tone.glow}` }),
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
      border: `1px solid ${border}`,
      background: isLight ? 'rgba(255,255,255,0.42)' : 'rgba(255,255,255,0.038)',
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
    heroMetricDot: (tone) => ({ width: 6, height: 6, borderRadius: 99, background: tone.hue, boxShadow: `0 0 10px ${tone.glow}`, flexShrink: 0 }),
    heroMetricIcon: (tone) => ({ width: 14, height: 14, borderRadius: 7, color: tone.hue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', filter: `drop-shadow(0 0 8px ${tone.glow})`, flexShrink: 0 }),
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
	      background: panel,
	      border: `1px solid ${border}`,
	      boxShadow: glassShadow,
	      backdropFilter: 'blur(22px) saturate(165%)',
	      WebkitBackdropFilter: 'blur(22px) saturate(165%)'
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
	      boxShadow: glassShadow,
	      backdropFilter: 'blur(22px) saturate(165%)',
	      WebkitBackdropFilter: 'blur(22px) saturate(165%)'
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
	      boxShadow: glassShadow,
	      backdropFilter: 'blur(22px) saturate(165%)',
	      WebkitBackdropFilter: 'blur(22px) saturate(165%)'
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
    hiddenRevealBar: (active) => ({
      width: 'fit-content',
      maxWidth: '100%',
      minHeight: 32,
      borderRadius: 999,
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : (isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.026)'),
      color: active ? accent.hue : sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '0 12px',
      boxSizing: 'border-box',
      boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset',
      backdropFilter: 'blur(16px) saturate(145%)',
      WebkitBackdropFilter: 'blur(16px) saturate(145%)',
      fontFamily: 'inherit',
      fontSize: 11,
      fontWeight: 900,
      cursor: 'pointer',
      outline: 'none'
    }),
    revealActions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap',
      width: '100%'
    },
    weekStrip: {
      width: 'calc(100% - 56px)',
      maxWidth: 660,
      margin: '14px auto 0',
      display: 'grid',
      gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
      gap: 6
    },
    weekDay: (active, overdue = false) => ({
      minHeight: 70,
      borderRadius: 16,
      border: active
        ? `1px solid ${overdue ? 'rgba(233,95,95,0.48)' : accent.ring}`
        : overdue
          ? '1px solid rgba(233,95,95,0.28)'
          : '1px solid transparent',
      background: active
        ? (overdue ? 'rgba(233,95,95,0.12)' : accent.soft)
        : overdue
          ? 'rgba(233,95,95,0.055)'
          : 'transparent',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      cursor: 'pointer',
      transition: 'background 0.45s ease, border-color 0.45s ease'
    }),
    weekLabel: (active, overdue = false) => ({ color: overdue ? '#E95F5F' : active ? accent.hue : sub, fontSize: 9, fontWeight: 900, letterSpacing: '0.06em' }),
    weekRingBg: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)',
    weekRingLength: 2 * Math.PI * 9,
    weekRingColor: (day) => day.total > 0 && day.done === day.total ? Colors.get('done', theme) : (isLight ? 'rgba(15,23,42,0.32)' : 'rgba(255,255,255,0.24)'),
    weekCount: (overdue = false) => ({ color: overdue ? '#E95F5F' : sub, fontSize: 10, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }),
	    listWrap: {
	      width: 'calc(100% - 56px)',
	      maxWidth: 660,
	      margin: '20px auto 0',
	      display: 'flex',
	      flexDirection: 'column',
	      gap: 18,
	      boxSizing: 'border-box'
	    },
    emptyListWrap: {
      width: 'calc(100% - 56px)',
      maxWidth: 520,
      margin: '52px auto 0',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box'
    },
    emptyState: {
      minHeight: 210,
      borderRadius: 30,
      background: `radial-gradient(260px 160px at 50% 0%, ${accent.soft}, transparent 72%), ${panel}`,
      border: `1px solid ${accent.ring}`,
      boxShadow: `${glassShadow}, 0 18px 42px -30px ${accent.glow}`,
      backdropFilter: 'blur(26px) saturate(170%)',
      WebkitBackdropFilter: 'blur(26px) saturate(170%)',
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
    zeroState: {
      width: '100%',
      minHeight: 280,
      borderRadius: 28,
      background: isLight
        ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${accent.faint})`
        : `linear-gradient(145deg, rgba(23,27,31,0.96), ${accent.faint})`,
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : accent.ring}`,
      boxShadow: '0 1px 0 rgba(255,255,255,0.055) inset',
      boxSizing: 'border-box',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: '38px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    },
    zeroGlow: {
      position: 'absolute',
      top: -80,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 220,
      height: 220,
      borderRadius: 999,
      background: `radial-gradient(circle, ${accent.soft}, transparent 68%)`,
      pointerEvents: 'none'
    },
    zeroIcon: {
      position: 'relative',
      width: 72,
      height: 72,
      borderRadius: 22,
      margin: '0 auto 18px',
      background: accent.soft,
      border: `1px solid ${accent.ring}`,
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 30
    },
    zeroTitle: {
      position: 'relative',
      color: text,
      fontSize: fSize === 0 ? 22 : 25,
      fontWeight: 950
    },
    zeroSub: {
      position: 'relative',
      color: sub,
      fontSize: fSize === 0 ? 14 : 16,
      fontWeight: 750,
      lineHeight: 1.45,
      marginTop: 8,
      maxWidth: 320
    },
    zeroCta: {
      position: 'relative',
      minHeight: 48,
      borderRadius: 16,
      border: `1px solid ${accent.ring}`,
      background: `linear-gradient(135deg, ${accent.soft}, rgba(255,255,255,0.035))`,
      color: text,
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 900,
      padding: '0 18px',
      marginTop: 20,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      cursor: 'pointer'
    },
	    category: { width: '100%', margin: '0 auto', boxSizing: 'border-box' },
	    categoryHeader: {
	      width: '100%',
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'space-between',
	      padding: '4px 4px 10px',
	      marginBottom: 6,
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
    categoryBody: { overflowY: 'hidden', overflowX: 'visible', display: 'flex', flexDirection: 'column', gap: 12, padding: '4px 1px 2px', boxSizing: 'border-box' },
    taskCard: (done, overdue, pinned, tone = accent) => ({
      position: 'relative',
      borderRadius: 34,
      padding: '12px 14px',
      minHeight: 94,
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: done
        ? (isLight
          ? `radial-gradient(260px 142px at 5% 8%, rgba(16,185,129,0.18), transparent 72%), linear-gradient(145deg, rgba(255,255,255,0.95), rgba(16,185,129,0.16))`
          : `radial-gradient(260px 142px at 6% 8%, rgba(16,185,129,0.28), transparent 72%), linear-gradient(145deg, rgba(20,48,36,0.84), rgba(13,30,24,0.78))`)
        : (overdue
          ? (isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.94), rgba(233,95,95,0.14))'
            : 'radial-gradient(250px 130px at 6% 8%, rgba(233,95,95,0.20), transparent 72%), linear-gradient(145deg, rgba(44,25,27,0.84), rgba(24,17,20,0.78))')
          : (pinned
          ? (isLight
            ? `linear-gradient(145deg, rgba(255,255,255,0.90), ${tone.soft})`
            : `radial-gradient(230px 115px at 4% 8%, ${tone.soft}, transparent 72%), linear-gradient(145deg, rgba(24,28,31,0.86), rgba(20,23,25,0.82))`)
          : (isLight
            ? 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(244,246,248,0.56))'
            : 'linear-gradient(145deg, rgba(42,49,55,0.52), rgba(17,22,26,0.66))'))),
      border: `1px solid ${done ? 'rgba(16,185,129,0.52)' : overdue ? 'rgba(233,95,95,0.42)' : pinned ? tone.ring : border}`,
      boxShadow: done
        ? `0 1px 0 rgba(255,255,255,0.07) inset, 0 18px 42px -26px rgba(16,185,129,0.44), 0 0 0 1px rgba(16,185,129,0.08) inset`
        : overdue
          ? '0 1px 0 rgba(255,255,255,0.055) inset, 0 16px 40px -28px rgba(233,95,95,0.58)'
          : pinned
            ? `0 14px 36px -24px ${tone.hue}`
            : isLight ? '0 12px 28px -24px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.72) inset' : '0 1px 0 rgba(255,255,255,0.04) inset, 0 14px 34px -28px rgba(0,0,0,0.72)',
      opacity: 1,
      cursor: 'pointer',
      backdropFilter: 'blur(24px) saturate(160%)',
      WebkitBackdropFilter: 'blur(24px) saturate(160%)',
      clipPath: 'inset(0 round 34px)',
      contain: 'layout paint',
      transform: 'translateZ(0)',
      transition: 'background 0.42s ease, border-color 0.42s ease, box-shadow 0.42s ease'
    }),
    taskMainRow: { display: 'flex', alignItems: 'center', gap: 14, minHeight: 60 },
    taskGlyph: {
      width: 46,
      height: 46,
      borderRadius: 18,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid',
      flexShrink: 0
    },
	    taskContent: { minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' },
    taskHeaderLine: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, minWidth: 0, flexWrap: 'nowrap' },
    taskName: (done, expanded = false) => ({
      color: done ? sub : text,
      fontSize: fSize === 0 ? 16 : 17,
      fontWeight: 950,
      lineHeight: 1.2,
      minWidth: 0,
      width: '100%',
      flex: '1 1 auto',
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: expanded ? 2 : 2,
      WebkitBoxOrient: 'vertical',
      whiteSpace: 'normal',
      textDecoration: done ? 'line-through' : 'none',
      textAlign: 'center'
    }),
    checkButton: (done) => ({
      width: 40,
      height: 30,
      borderRadius: 15,
      border: `1px solid ${done ? TODO_SUCCESS.ring : (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.07)')}`,
      background: done
        ? TODO_SUCCESS.soft
        : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)'),
      color: done ? TODO_SUCCESS.hue : sub,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      cursor: 'pointer',
      boxSizing: 'border-box',
      padding: 0,
      appearance: 'none',
      WebkitAppearance: 'none',
      outline: 'none',
      boxShadow: done
        ? `0 1px 0 rgba(255,255,255,0.08) inset, 0 0 16px ${TODO_SUCCESS.glow}`
        : '0 1px 0 rgba(255,255,255,0.035) inset',
      transition: 'background 0.45s ease, border-color 0.45s ease, color 0.45s ease, box-shadow 0.45s ease'
    }),
    metaRow: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      marginTop: 8,
      paddingTop: 7,
      borderTop: `1px solid ${isLight ? 'rgba(15,23,42,0.045)' : 'rgba(255,255,255,0.045)'}`,
      paddingLeft: 0,
      paddingRight: 0,
      boxSizing: 'border-box',
      opacity: 0.82,
      width: '100%',
      maxWidth: '100%'
    },
    progressTrack: (complete = false, tone = accent) => ({
      height: 5,
      borderRadius: 999,
      background: complete
        ? (isLight ? 'rgba(16,185,129,0.13)' : 'rgba(16,185,129,0.16)')
        : (isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)'),
      overflow: 'hidden',
      marginTop: 15,
      marginBottom: 8,
      boxShadow: complete ? `0 0 14px ${tone.glow}` : 'none'
    }),
    progressFill: (color) => ({ height: '100%', borderRadius: 999, background: color, boxShadow: `0 0 18px ${color}66` }),
    taskExpandedShell: {
      overflow: 'hidden',
      willChange: 'height, opacity, transform'
    },
    taskExpanded: { marginTop: 12, borderTop: `1px solid ${border}`, paddingTop: 12, paddingBottom: 10 },
    expandedInfoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12, marginTop: 14 },
    expandedInfo: {
      minHeight: 42,
      borderRadius: 15,
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
      border: `1px solid ${border}`,
      color: sub,
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      padding: '0 13px',
      fontSize: 11.5,
      fontWeight: 850,
      minWidth: 0,
      overflow: 'hidden'
    },
    expandedDescription: { color: text, fontSize: 12.5, fontWeight: 700, lineHeight: 1.45, opacity: 0.86, textAlign: 'center', marginTop: 2 },
    expandedChecklist: { marginTop: 16, borderRadius: 20, background: isLight ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.032)', border: `1px solid ${border}`, padding: '16px 16px 18px', minHeight: 166, boxSizing: 'border-box' },
    expandedTitle: { display: 'flex', alignItems: 'center', gap: 8, color: sub, fontSize: 11.5, fontWeight: 900, marginBottom: 13 },
    expandedGoals: { display: 'flex', flexDirection: 'column', gap: 12 },
    expandedGoal: (done) => ({
      width: '100%',
      border: `1px solid ${done ? TODO_SUCCESS.ring : border}`,
      background: done
        ? (isLight ? 'linear-gradient(135deg, rgba(57,217,130,0.18), rgba(57,217,130,0.08))' : 'linear-gradient(135deg, rgba(57,217,130,0.16), rgba(57,217,130,0.055))')
        : (isLight ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.035)'),
      boxShadow: done ? `0 1px 0 rgba(255,255,255,0.055) inset, 0 12px 22px -24px ${TODO_SUCCESS.hue}` : '0 1px 0 rgba(255,255,255,0.035) inset',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      minHeight: 74,
      fontFamily: 'inherit',
      textAlign: 'left',
      padding: '16px 16px',
      cursor: 'pointer',
      borderRadius: 17
    }),
    expandedGoalText: (done) => ({ flex: 1, minWidth: 0, color: done ? TODO_SUCCESS.hue : text, fontSize: 13, fontWeight: done ? 800 : 650, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }),
    expandedGoalDot: (done) => ({ width: 30, height: 30, borderRadius: 11, border: `1px solid ${done ? TODO_SUCCESS.ring : (isLight ? 'rgba(15,23,42,0.12)' : 'rgba(255,255,255,0.12)')}`, background: done ? TODO_SUCCESS.hue : 'transparent', color: isLight ? '#FFFFFF' : '#0E1512', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: done ? `0 8px 16px -12px ${TODO_SUCCESS.hue}` : 'none' }),
    moreGoals: { color: sub, fontSize: 11, fontWeight: 850 },
    emptyChecklist: { color: sub, fontSize: 12, fontWeight: 750, minHeight: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' },
    checklistAddRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      minHeight: 44,
      marginTop: 12,
      padding: '0 12px',
      borderRadius: 15,
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
      width: 30,
      height: 30,
      borderRadius: 11,
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
    expandedActions: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 12, marginTop: 14 },
    completeTaskButton: (done) => ({
      minHeight: 44,
      borderRadius: 16,
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
      minHeight: 44,
      borderRadius: 16,
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
    actionRow: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      width: '100%',
      marginTop: 13,
      padding: '9px 10px 0',
      borderTop: `1px solid ${isLight ? 'rgba(15,23,42,0.06)' : 'rgba(159,180,196,0.11)'}`,
      boxSizing: 'border-box',
      overflow: 'visible'
    },
    actionButton: (active) => ({
      border: `1px solid ${active ? accent.ring : (isLight ? 'rgba(15,23,42,0.055)' : 'rgba(159,180,196,0.09)')}`,
      background: active ? accent.soft : 'transparent',
      color: active ? accent.hue : sub,
      borderRadius: 999,
      minWidth: 0,
      height: 22,
      padding: '0 10px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      fontSize: 9.5,
      fontWeight: 950,
      fontFamily: 'inherit',
      whiteSpace: 'nowrap',
      overflow: 'hidden'
    }),
    actionButtonLabel: {
      minWidth: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    donePill: {
      minHeight: 22,
      padding: '0 8px',
      borderRadius: 999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      gridColumn: '1 / -1',
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
  if (dateStr instanceof Date) return isNaN(dateStr) ? null : dateStr;
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

function isTaskCompletedBeforeToday(task) {
  if (!task?.isDone) return false;
  const completedKey = dateKey(parseDate(task.completedAt || task.startDate));
  const today = dateKey(new Date());
  return Boolean(completedKey && completedKey < today);
}

function isTaskVisibleInMainList(task) {
  return !task?.isDone || !isTaskCompletedBeforeToday(task);
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
