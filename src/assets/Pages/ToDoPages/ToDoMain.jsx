import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { theme$, lang$, fontSize$, setAddPanel, addPanel$ } from '../../StaticClasses/HabitsBus';
import { todoEvents$, togglePinned, togglePending, toggleHidden } from './ToDoHelper.js';
import { 
    FaSortAmountDown, FaFilter, FaCircle, FaCheckCircle, FaCalendarDay, 
    FaListUl, FaFire, FaChevronDown, FaSearch, FaTimes, FaSortNumericDown, 
    FaExclamation, FaInbox, FaFlag, FaLayerGroup, FaThumbtack, FaRegEyeSlash, 
    FaClock, FaEllipsisV, FaEye 
} from 'react-icons/fa';
import ToDoPage from './ToDoPage.jsx';
import ToDoNew from './ToDoNew.jsx';
import ToDoMetrics from './ToDoMetrics.jsx';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';

const clickSound = new Audio('Audio/Click.wav');
const doneSound = new Audio('Audio/IsDone.wav');

// --- CONSTANTS ---
const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not Urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very Urgent'], ['ASAP', 'ASAP']];

const PRIORITY_COLORS = ['#B0BEC5', '#29B6F6', '#FFCA28', '#FB8C00', '#F44336']; 
const DIFFICULTY_COLORS = ['#66BB6A', '#9CCC65', '#FFCA28', '#FF7043', '#D32F2F'];
const URGENCY_COLORS = ['#81C784', '#64B5F6', '#FFD54F', '#FF8A65', '#E57373'];

const ToDoMain = () => {
    // --- GLOBAL STATE ---
    const [theme, setThemeState] = useState('dark');
    const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
    const [fSize, setFSize] = useState(AppData.prefs[4]);

    // --- LOCAL UI STATE ---
    const [showToDo, setShowToDo] = useState(addPanel$.value === 'ToDoPage' ? true : false);
    const [showMetrics, setShowMetrics] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    // NEW: Hidden tasks management state
    const [showHiddenTasks, setShowHiddenTasks] = useState(false);
    const [hiddenTasksCount, setHiddenTasksCount] = useState(0);
    
    // Используем AppData.todoList как источник правды
    const [sortedList, setSortedList] = useState(AppData.todoList || []);
    const [refreshTrigger, setRefreshTrigger] = useState(0); 

    // --- FILTER/SORT STATE ---
    const [filterParams, setFilterParams] = useState(0); // 0: All, 1: Done, 2: Active, 3: Pending
    const [sortParams, setSortParams] = useState(1); // 0: Diff, 1: Prio, 2: Date
    const [searchQuery, setSearchQuery] = useState('');
    
    // --- UI STATE ---
    const [activePanel, setActivePanel] = useState('none'); 
    const searchInputRef = useRef(null);

    // --- SUBSCRIPTIONS ---
    useEffect(() => {
        const sub1 = theme$.subscribe(setThemeState);
        const sub2 = lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1));
        const sub3 = fontSize$.subscribe(setFSize);
        const sub5 = addPanel$.subscribe(value => setShowToDo(value === 'ToDoPage'));
        
        const sub4 = todoEvents$.subscribe(event => {
            if (!event) return;
            setRefreshTrigger(prev => prev + 1);

            if (event.type === 'OPEN_STATS') {
                setShowMetrics(true);
                setAddPanel('');
            }
            if (event.type === 'OPEN_ADD') {
                setShowMetrics(false);
                setCurrentIndex(-1);
                setAddPanel('ToDoPage');
            }
            if (event.type === 'CLOSE_ALL') {
                setShowMetrics(false);
                setAddPanel('');
            }
        });

        return () => { 
            sub1.unsubscribe(); sub2.unsubscribe(); sub3.unsubscribe(); sub4.unsubscribe(); sub5.unsubscribe();
        };
    }, []);
   
    // --- CRITICAL: Enhanced sorting/filtering logic with pinned/hidden/pending handling ---
    useEffect(() => {
        processTaskList();
    }, [filterParams, sortParams, searchQuery, refreshTrigger, showHiddenTasks]);

    const processTaskList = () => {
        // 1. Start with full list
        let processedList = AppData.todoList ? [...AppData.todoList] : [];
        
        // 2. Apply search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            processedList = processedList.filter(task => 
                (task.name && task.name.toLowerCase().includes(q)) || 
                (task.category && task.category.toLowerCase().includes(q))
            );
        }
        
        // 3. Apply status filter (including NEW pending filter)
        switch(filterParams) {
            case 1: // Done
                processedList = processedList.filter(task => task.isDone);
                break;
            case 2: // Active (not done AND not pending)
                processedList = processedList.filter(task => !task.isDone && !task.isPending);
                break;
            case 3: // Pending (NEW filter option)
                processedList = processedList.filter(task => task.isPending);
                break;
            // case 0: All (no filter)
        }
        
        // 4. Count hidden tasks BEFORE visibility filter for button display
        const hiddenInCurrentView = processedList.filter(task => task.isHidden).length;
        setHiddenTasksCount(hiddenInCurrentView);
        
        // 5. Apply hidden tasks visibility filter
        if (!showHiddenTasks) {
            processedList = processedList.filter(task => !task.isHidden);
        }
        
        // 6. SEPARATE PINNED TASKS (critical for "always on top" behavior)
        const pinnedTasks = processedList.filter(task => task.isPinned);
        const nonPinnedTasks = processedList.filter(task => !task.isPinned);
        
        // 7. Sort each group independently
        const sortGroup = (list) => {
            if (sortParams === 0) { // Difficulty (High to Low)
                return list.sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0));
            } else if (sortParams === 1) { // Priority (High to Low)
                return list.sort((a, b) => (b.priority || 0) - (a.priority || 0));
            } else if (sortParams === 2) { // Deadline (Soonest first)
                return list.sort((a, b) => daysToDeadlineNum(a.deadLine) - daysToDeadlineNum(b.deadLine));
            }
            return list;
        };
        
        // 8. Combine with pinned tasks ALWAYS on top
        const sortedPinned = sortGroup(pinnedTasks);
        const sortedNonPinned = sortGroup(nonPinnedTasks);
        const finalList = [...sortedPinned, ...sortedNonPinned];
        
        setSortedList(finalList);
    };

    useEffect(() => {
        if (activePanel === 'search' && searchInputRef.current) {
            setTimeout(() => searchInputRef.current.focus(), 300);
        }
    }, [activePanel]);

    const onClose = () => {
        setAddPanel('');
    }

    const handleQuickComplete = (e, item) => {
        e.stopPropagation();
        item.isDone = !item.isDone;
        // Auto-unpin when completed (optional UX improvement)
        if (item.isDone && item.isPinned) {
            item.isPinned = false;
        }
        setRefreshTrigger(prev => prev + 1);
        playEffects(item.isDone ? doneSound : clickSound);
    };

    const togglePanel = (panelName) => {
        playEffects(clickSound);
        if (activePanel === panelName) setActivePanel('none');
        else setActivePanel(panelName);
    };

    // Group tasks by category AFTER all filtering/sorting
    const groupedTasks = useMemo(() => {
        const groups = {};
        sortedList.forEach(task => {
            const cat = task.category || (langIndex === 0 ? 'Другое' : 'Other');
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(task);
        });
        return groups;
    }, [sortedList, langIndex]);

    const s = styles(theme, fSize);
    const isLight = theme === 'light' || theme === 'speciallight';

    return (
        <div style={s.container}>
            {<HoverInfoButton tab='ToDoMain'/>}
            {/* --- HEADER --- */}
            <div style={{ width: '92%', marginTop: '14vh', display: 'flex', flexDirection: 'column', gap: '10px', zIndex: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <div style={{ fontSize: '32px', fontWeight: '800', color: Colors.get('mainText', theme), fontFamily: 'Segoe UI', letterSpacing: '-0.5px' }}>
                        {langIndex === 0 ? 'Задачи' : 'Tasks'}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <HeaderIconButton 
                            icon={<FaSearch size={16}/>} 
                            isActive={activePanel === 'search' || searchQuery.length > 0} 
                            onClick={() => togglePanel('search')} 
                            theme={theme}
                        />
                        <HeaderIconButton 
                            icon={<FaSortAmountDown size={16}/>} 
                            isActive={activePanel === 'sort' || sortParams !== 1} 
                            onClick={() => togglePanel('sort')} 
                            theme={theme}
                        />
                        <HeaderIconButton 
                            icon={<FaFilter size={14}/>} 
                            isActive={activePanel === 'filter' || filterParams !== 0} 
                            onClick={() => togglePanel('filter')} 
                            theme={theme}
                        />
                    </div>
                </div>

                <AnimatePresence mode='wait'>
                    {activePanel === 'search' && (
                        <motion.div
                            key="search"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <div style={s.inputContainer}>
                                <FaSearch size={14} color={Colors.get('subText', theme)} style={{ marginLeft: '16px', opacity: 0.6 }}/>
                                <input 
                                    type="text" 
                                    placeholder={langIndex === 0 ? 'Найти задачу...' : 'Search tasks...'}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{flex: 1, border: 'none', background: 'transparent', fontSize: '15px', color: Colors.get('mainText', theme), marginLeft: '8px', outline: 'none'}}
                                />
                                {searchQuery.length > 0 && (
                                    <motion.div 
                                        initial={{ scale: 0 }} 
                                        animate={{ scale: 1 }} 
                                        onClick={() => setSearchQuery('')} 
                                        style={s.clearBtn}
                                    >
                                        <FaTimes size={10} color="#fff" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {activePanel === 'sort' && (
                        <motion.div
                            key="sort"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden', display: 'flex', gap: '8px' }}
                        >
                            <OptionChip 
                                label={langIndex===0 ? 'Важность' : 'Priority'} 
                                icon={<FaExclamation size={10}/>}
                                isActive={sortParams === 1} 
                                onClick={() => {setSortParams(1); playEffects(clickSound);}} 
                                theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Сложность' : 'Difficulty'} 
                                icon={<FaSortNumericDown size={12}/>}
                                isActive={sortParams === 0} 
                                onClick={() => {setSortParams(0); playEffects(clickSound);}} 
                                theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Дедлайн' : 'Deadline'} 
                                icon={<FaCalendarDay size={12}/>}
                                isActive={sortParams === 2} 
                                onClick={() => {setSortParams(2); playEffects(clickSound);}} 
                                theme={theme}
                            />
                        </motion.div>
                    )}

                    {activePanel === 'filter' && (
                        <motion.div
                            key="filter"
                            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                            animate={{ height: 'auto', opacity: 1, marginBottom: 10 }}
                            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            style={{ overflow: 'hidden', display: 'flex', gap: '8px', flexWrap: 'wrap' }} // Added wrap for 4th option
                        >
                            <OptionChip 
                                label={langIndex===0 ? 'Все' : 'All'} 
                                isActive={filterParams === 0} 
                                onClick={() => {setFilterParams(0); playEffects(clickSound);}} 
                                theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'В процессе' : 'Active'} 
                                isActive={filterParams === 2} 
                                onClick={() => {setFilterParams(2); playEffects(clickSound);}} 
                                theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Отложено' : 'Pending'} // NEW PENDING FILTER
                                isActive={filterParams === 3} 
                                onClick={() => {setFilterParams(3); playEffects(clickSound);}} 
                                theme={theme}
                            />
                            <OptionChip 
                                label={langIndex===0 ? 'Готово' : 'Done'} 
                                isActive={filterParams === 1} 
                                onClick={() => {setFilterParams(1); playEffects(clickSound);}} 
                                theme={theme}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- LIST AREA --- */}
            <div style={s.panel} className="no-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {sortedList.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            style={s.emptyState}
                        >
                            <FaInbox size={40} style={{marginBottom: 10, opacity: 0.5}}/>
                            <span>
                                {hiddenTasksCount > 0 && !showHiddenTasks 
                                    ? (langIndex === 0 ? 'Все задачи скрыты' : 'All tasks hidden') 
                                    : (langIndex === 0 ? 'Задач нет' : 'No tasks found')}
                            </span>
                        </motion.div>
                    ) : (
                        Object.keys(groupedTasks).map((category) => (
                            <CategoryPanel key={category} title={category} theme={theme}>
                                {groupedTasks[category].map((item, index) => (
                                    <CompactCard
                                        key={item.id || index + item.name}
                                        onClick={() => {
                                            const realIndex = AppData.todoList.indexOf(item);
                                            setCurrentIndex(realIndex);
                                            setAddPanel('ToDoPage');
                                            playEffects(clickSound);
                                        }}
                                        onCheck={(e) => handleQuickComplete(e, item)}
                                        item={item}
                                        theme={theme}
                                        lang={langIndex}
                                        fSize={fSize}
                                    />
                                ))}
                            </CategoryPanel>
                        ))
                    )}
                </AnimatePresence>
                
                {/* --- HIDDEN TASKS BUTTON (appears when hidden tasks exist in current view) --- */}
                {hiddenTasksCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            width: '88%',
                            padding: '12px 0',
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '8px',
                        }}
                    >
                        <button
                            onClick={() => {
                                setShowHiddenTasks(!showHiddenTasks);
                                playEffects(clickSound);
                            }}
                            style={{
                                background: isLight ? '#FFFFFF' : Colors.get('simplePanel', theme),
                                border: `1px solid ${isLight ? '#E0E0E0' : Colors.get('border', theme)}`,
                                borderRadius: '16px',
                                padding: '8px 20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                color: Colors.get('mainText', theme),
                                fontWeight: '600',
                                fontSize: '14px',
                                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {showHiddenTasks ? (
                                <>
                                    <FaRegEyeSlash size={14} />
                                    {langIndex === 0 ? 'Скрыть скрытые задачи' : 'Hide hidden tasks'}
                                </>
                            ) : (
                                <>
                                    <FaEye size={14} />
                                    {langIndex === 0 
                                        ? `Показать ${hiddenTasksCount} скрытую(ые) задачу(и)` 
                                        : `Show ${hiddenTasksCount} hidden task(s)`}
                                </>
                            )}
                        </button>
                    </motion.div>
                )}
                
                <div style={{marginBottom: '120px', width: '100%'}}></div>
            </div>

            {/* --- MODALS --- */}
            <ToDoPage 
                show={showToDo} 
                setShow={onClose} 
                theme={theme} 
                lang={langIndex} 
                fSize={fSize} 
                task={AppData.todoList[currentIndex] || {}} 
            />
            {showMetrics && <ToDoMetrics theme={theme} lang={langIndex} onClose={() => setShowMetrics(false)} />}
            <ToDoNew theme={theme} lang={langIndex} fSize={fSize} />
        </div>
    );
};

export default ToDoMain;

// --- COMPONENTS (unchanged except CompactCard enhancements) ---

const HeaderIconButton = ({ icon, isActive, onClick, theme }) => {
    const isDark = theme === 'dark';
    const activeColor = Colors.get('accent', theme);
    const bg = isActive ? activeColor : (isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF');
    const color = isActive ? '#FFFFFF' : Colors.get('mainText', theme);

    return (
        <motion.div 
            whileTap={{ scale: 0.92 }}
            onClick={onClick}
            style={{
                width: '40px', height: '40px', borderRadius: '14px',
                backgroundColor: bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isActive ? `0 4px 12px ${activeColor}60` : (isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.05)'),
                color: color,
                transition: 'all 0.3s ease'
            }}
        >
            {icon}
        </motion.div>
    );
};

const OptionChip = ({ label, icon, isActive, onClick, theme }) => {
    const isDark = theme === 'dark';
    const activeColor = Colors.get('accent', theme);
    
    return (
        <motion.div 
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            style={{
                padding: '8px 16px',
                borderRadius: '12px',
                backgroundColor: isActive ? activeColor : (isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF'),
                color: isActive ? '#FFFFFF' : Colors.get('subText', theme),
                fontSize: '13px', fontWeight: '600',
                display: 'flex', alignItems: 'center', gap: '6px',
                cursor: 'pointer',
                border: isActive ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                boxShadow: isActive ? `0 4px 12px ${activeColor}40` : 'none',
                transition: 'all 0.2s ease'
            }}
        >
            {icon}
            {label}
        </motion.div>
    );
};

const CategoryPanel = ({ title, children, theme }) => {
    const [isOpen, setIsOpen] = useState(true);
    const isLight = theme === 'light' || theme === 'speciallight';
    return (
        <div style={{ width: '100%', marginBottom: '6px' }}>
            <div 
                onClick={() => { setIsOpen(!isOpen); playEffects(clickSound); }}
                style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 25px', marginBottom: '8px', cursor: 'pointer', userSelect: 'none'
                }}
            >
                <div style={{ fontSize: '16px', fontWeight: '800', fontFamily: 'Segoe UI', color: isLight ? '#1D1D1F' : Colors.get('mainText', theme), opacity: 0.8 }}>
                    {title}
                </div>
                <motion.div animate={{ rotate: isOpen ? 0 : -90 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                    <FaChevronDown size={12} color={isLight ? '#1D1D1F' : '#FFF'} style={{ opacity: 0.4 }} />
                </motion.div>
            </div>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        style={{ overflow: 'hidden', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- ENHANCED COMPACT CARD WITH PIN/HIDE/PENDING VISUALS ---
const CompactCard = ({ onClick, onCheck, item, theme, lang, fSize }) => {
  const [settingsPanel, setSettingsPanel] = useState(false);

  const isOverdue = isDeadlinePassed(item.deadLine) && !item.isDone;
  const isLight = theme === 'light' || theme === 'speciallight';
  const totalGoals = item.goals ? item.goals.length : 0;
  const doneGoals = item.goals ? item.goals.filter(g => g.isDone).length : 0;

  let rawColor = item.color || Colors.get('accent', theme);
  if (rawColor && rawColor.length > 7 && rawColor.startsWith('#')) {
    rawColor = rawColor.substring(0, 7);
  }
  const accentColor = rawColor;

  const cardBg = isLight ? '#FFFFFF' : (Colors.get('simplePanel', theme) + 'CC');
  const shadow = isLight ? '0 4px 12px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.2)';

  // Visual indicators for special states
  const hasVisualIndicator = item.isPending || item.isHidden || item.isPinned;
  const indicatorColor = item.isPending ? '#FF9E3D' : (item.isHidden ? '#7E7E7E' : '#02609e');
  const indicatorTooltip = item.isPending 
    ? (lang === 0 ? 'Отложено' : 'Pending') 
    : (item.isHidden ? (lang === 0 ? 'Скрыто' : 'Hidden') : (lang === 0 ? 'Закреплено' : 'Pinned'));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        width: "88%",
        minHeight: "80px",
        borderRadius: "20px",
        marginBottom: "8px",
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        // PINNED: Blue border | PENDING: Orange border | HIDDEN: Gray border (when visible)
        border: hasVisualIndicator 
          ? `2px solid ${indicatorColor}` 
          : 'none',
        backgroundColor: cardBg,
        backdropFilter: isLight ? 'none' : 'blur(20px)',
        boxShadow: shadow,
        opacity: item.isDone ? 0.6 : 1,
      }}
    >
      {/* Visual indicator badge for special states */}
      {hasVisualIndicator && (
        <div 
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            width: '24px',
            height: '24px',
            borderRadius: '0 0 20px 0',
            backgroundColor: indicatorColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            title: indicatorTooltip,
          }}
        >
          {item.isPinned && <FaThumbtack size={10} color="#FFF" />}
          {item.isPending && <FaClock size={10} color="#FFF" />}
          {item.isHidden && <FaRegEyeSlash size={10} color="#FFF" />}
        </div>
      )}

      {/* Icon */}
      <div
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: item.isDone ? `${accentColor}15` : `${accentColor}25`,
          color: accentColor,
          fontSize: '20px',
          marginRight: '14px',
          flexShrink: 0,
          border: `1px solid ${item.isDone ? 'transparent' : `${accentColor}40`}`,
          marginTop: '6px',
        }}
      >
        {item.icon || '📝'}
      </div>

      {/* Info Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', marginRight: '14px' }}>
        <div style={{ fontSize: fSize === 0 ? '16px' : '17px', fontWeight: '700', color: item.isDone ? Colors.get('subText', theme) : Colors.get('mainText', theme), textDecoration: item.isDone ? 'line-through' : 'none', lineHeight: '1.2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.name}
          {/* Subtle pending indicator in title */}
          {item.isPending && !item.isDone && (
            <span style={{ 
              fontSize: '12px', 
              color: '#FF9E3D', 
              marginLeft: '6px',
              fontWeight: '500',
              backgroundColor: 'rgba(255, 158, 61, 0.1)',
              padding: '0 4px',
              borderRadius: '4px'
            }}>
              {lang === 0 ? 'Отложено' : 'Pending'}
            </span>
          )}
        </div>

        {!item.isDone && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center' }}>
            <MiniBadge icon={<FaFlag size={8} />} text={PRIORITY_LABELS[item.priority]?.[lang]} color={PRIORITY_COLORS[item.priority] || PRIORITY_COLORS[0]} />
            <MiniBadge icon={<FaLayerGroup size={8} />} text={DIFFICULTY_LABELS[item.difficulty]?.[lang]} color={DIFFICULTY_COLORS[item.difficulty] || DIFFICULTY_COLORS[0]} />
            <MiniBadge icon={<FaExclamation size={8} />} text={URGENCY_LABELS[item.urgency || 0]?.[lang]} color={URGENCY_COLORS[item.urgency || 0] || URGENCY_COLORS[0]} />

            {item.deadLine && (
              <MiniBadge
                icon={isOverdue ? <FaFire size={8} /> : <FaCalendarDay size={8} />}
                text={getDeadlineText(item.deadLine, lang)}
                color={isOverdue ? '#FF453A' : Colors.get('subText', theme)}
              />
            )}

            {totalGoals > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', color: Colors.get('subText', theme) }}>
                <FaListUl size={10} style={{ opacity: 0.7 }} />
                <span>{doneGoals}/{totalGoals}</span>
              </div>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {settingsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              display: 'flex',
              flexDirection:'row',
              gap: '5px',
              width:'90%',
              marginRight:'25px',
              marginTop: '8px',
              paddingTop: '8px',
              borderTop: `1px dashed ${Colors.get('border', theme)}60`,
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePinned(item.id);
                playEffects(clickSound);
              }}
              style={settingsButtonStyle(theme, lang)}
            >
              <FaThumbtack size={14} color={item.isPinned ? '#02609e' : Colors.get('subText', theme)} />
              <span style={{ marginTop: '2px' }}>{lang === 0 ? 'Закрепить' : 'Pin'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleHidden(item.id);
                playEffects(clickSound);
              }}
              style={settingsButtonStyle(theme, lang)}
            >
              <FaRegEyeSlash size={14} color={item.isHidden ? '#7E7E7E' : Colors.get('subText', theme)} />
              <span style={{ marginTop: '2px' }}>{lang === 0 ? 'Скрыть' : 'Hide'}</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePending(item.id);
                playEffects(clickSound);
              }}
              style={settingsButtonStyle(theme, lang)}
            >
              <FaClock size={14} color={item.isPending ? '#FF9E3D' : Colors.get('subText', theme)} />
              <span style={{ marginTop: '2px' }}>{lang === 0 ? 'Отложить' : 'Snooze'}</span>
            </button>
            
            <button
              onClick={onCheck}
              style={settingsButtonStyle(theme, lang)}
            >
              {!item.isDone ? <FaCircle size={14} color={Colors.get('subText', theme)} /> : <FaCheckCircle size={14} color="#4CAF50" />}
              <span style={{ marginTop: '2px' }}>{lang === 0 ? 'Отметить' : 'Check'}</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* Right-side Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: '8px', paddingTop: '6px' }}>
        <FaEllipsisV
          onClick={(e) => {
            e.stopPropagation();
            setSettingsPanel(prev => !prev);
          }}
          size={16}
          style={{ color: Colors.get('subText', theme), cursor: 'pointer' }}
        />
      </div>

      {/* Progress Bar */}
      {!item.isDone && totalGoals > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', backgroundColor: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(doneGoals / totalGoals) * 100}%` }}
            style={{ height: '100%', backgroundColor: isLight ? 'rgba(94, 15, 133, 0.58)' : 'rgba(53, 111, 199, 0.94)' }}
          />
        </div>
      )}
    </motion.div>
  );
};

// Reusable settings button style
const settingsButtonStyle = (theme, lang) => ({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: Colors.get('subText', theme),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  fontSize: '10px',
  padding: '4px',
  borderRadius: '6px',
  transition: 'all 0.2s',
  '&:hover': {
    backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.08)'
  }
});

const MiniBadge = ({ icon, text, color }) => (
    <div style={{ 
        display: 'flex', alignItems: 'center', gap: '3px', 
        padding: '2px 5px', borderRadius: '5px', 
        backgroundColor: `${color}15`, border: `1px solid ${color}30`,
        color: color, fontSize: '9px', fontWeight: '700',
        whiteSpace: 'nowrap'
    }}>
        {icon}
        {text && <span>{text}</span>}
    </div>
);

// --- STYLES (unchanged) ---
const styles = (theme, fSize) => {
    const isLight = theme === 'light' || theme === 'speciallight';
    const bg = isLight ? '#F2F4F6' : Colors.get('background', theme);
    const text = Colors.get('mainText', theme);
    const sub = Colors.get('subText', theme);

    return {
        container: { 
            backgroundColor: bg, 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            height: '100vh', width: '100vw', 
            fontFamily: 'Segoe UI', overflowY: 'scroll' 
        },
        panel: { 
            display: 'flex', flexDirection: 'column', width: '100%', flex: 1, 
            alignItems: 'center', justifyContent: 'start', overflowY: 'scroll', paddingTop: '2px' 
        },
        emptyState: {
            marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center',
            color: sub, fontSize: '16px', fontWeight: '600'
        },
        inputContainer: {
            width: '100%', height: '44px',
            backgroundColor: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
            borderRadius: '14px',
            display: 'flex', alignItems: 'center',justifyContent: 'space-around',
            border: isLight ? 'none' : `1px solid ${Colors.get('border', theme)}60`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
            position: 'relative'
        },
        clearBtn: {
            width: '22px', height: '22px', borderRadius: '50%',
            backgroundColor: 'rgba(128,128,128,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginRight: '12px', cursor: 'pointer'
        }
    };
};

// --- HELPERS (unchanged) ---
function playEffects(sound) {
    if (AppData.prefs[2] === 0 && sound) {
        if (!sound.paused) {
            sound.pause();
            sound.currentTime = 0;
        }
        sound.volume = 0.5;
        sound.play().catch(e => console.log("Audio play failed", e));
    }
    if (AppData.prefs[3] === 0 && window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
}

function parseDate(dateStr) {
    if (!dateStr) return null;
    if (dateStr.includes('-')) {
        return new Date(dateStr);
    } else if (dateStr.includes('.')) {
        const parts = dateStr.split('.');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
}

function daysToDeadlineNum(dateStr) {
    const date = parseDate(dateStr);
    if (!date) return 9999;
    const now = new Date();
    now.setHours(0,0,0,0);
    date.setHours(0,0,0,0);
    return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

function isDeadlinePassed(dateStr) {
    const days = daysToDeadlineNum(dateStr);
    return days < 0;
}

function getDeadlineText(dateStr, lang) {
    if (!dateStr) return '';
    const days = daysToDeadlineNum(dateStr);
    
    if (lang === 0) {
        if (days === 0) return "Сегодня";
        if (days === 1) return "Завтра";
        if (days < 0) return `${Math.abs(days)} дн. назад`;
        return `${days} дн.`;
    } else {
        if (days === 0) return "Today";
        if (days === 1) return "Tmrw";
        if (days < 0) return `${Math.abs(days)}d ago`;
        return `${days}d left`;
    }
}