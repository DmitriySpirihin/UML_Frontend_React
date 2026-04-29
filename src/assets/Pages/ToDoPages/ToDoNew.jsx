import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaCalendarDay,
  FaBrain,
  FaBullseye,
  FaCheck,
  FaClock,
  FaCog,
  FaFire,
  FaFlag,
  FaFlask,
  FaFolderOpen,
  FaFilm,
  FaGlobeAmericas,
  FaLayerGroup,
  FaLightbulb,
  FaListUl,
  FaPlus,
  FaPuzzlePiece,
  FaRocket,
  FaStar,
  FaTag,
  FaThumbtack,
  FaTimes,
  FaTools,
  FaTrash
} from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import ScrollPicker from '../../Helpers/ScrollPicker';
import { fontSize$, lang$, lastPage$, setPage, setShowPopUpPanel, theme$ } from '../../StaticClasses/HabitsBus.js';
import { addCustomCategory, createGoal, removeCustomCategory, setTodoFieldVisibility } from './ToDoHelper';
import { buildTodoAccent, getTodoCategoryTone, TODO_BASE_CATEGORIES } from './ToDoVisuals.js';

const PRIORITY_LABELS = [['Низкий', 'Low'], ['Обычный', 'Normal'], ['Важный', 'Important'], ['Высокий', 'High'], ['Критический', 'Critical']];
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very urgent'], ['ASAP', 'ASAP']];

const BASE_CATEGORIES = TODO_BASE_CATEGORIES;

const CUSTOM_ICON_OPTIONS = [
  { id: 'tag', icon: FaTag },
  { id: 'star', icon: FaStar },
  { id: 'fire', icon: FaFire },
  { id: 'idea', icon: FaLightbulb },
  { id: 'target', icon: FaBullseye },
  { id: 'puzzle', icon: FaPuzzlePiece },
  { id: 'rocket', icon: FaRocket },
  { id: 'brain', icon: FaBrain },
  { id: 'pin', icon: FaThumbtack },
  { id: 'folder', icon: FaFolderOpen },
  { id: 'film', icon: FaFilm },
  { id: 'world', icon: FaGlobeAmericas },
  { id: 'lab', icon: FaFlask },
  { id: 'tools', icon: FaTools }
];

const ToDoNew = () => {
  const [theme, setTheme] = useState(theme$.value);
  const [lang, setLang] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(fontSize$.value);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState(PRIORITY_LABELS[1][lang]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LABELS[2][lang]);
  const [urgency, setUrgency] = useState(URGENCY_LABELS[1][lang]);
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadLine, setDeadLine] = useState('');
  const [subGoals, setSubGoals] = useState([]);
  const [newSubGoal, setNewSubGoal] = useState('');
  const [customCats, setCustomCats] = useState(AppData.todoCustomCategories || []);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(CUSTOM_ICON_OPTIONS[0].id);
  const [visibility, setVisibility] = useState(AppData.todoFieldsVisibility || { priority: true, difficulty: true, urgency: true });
  const [showAdvancedPanel, setShowAdvancedPanel] = useState(false);

  const CATEGORIES = useMemo(() => [...BASE_CATEGORIES, ...customCats], [customCats]);
  const currentCat = CATEGORIES[selectedCatIndex] || CATEGORIES[0];
  const accent = useMemo(() => buildTodoAccent(AppData.todoAccentColor || '#8FA6C8'), []);
  const s = styles(theme, accent, fSize);
  const currentTone = getTodoCategoryTone(currentCat?.label?.[0], accent);
  const CurrentIcon = currentTone.icon;

  useEffect(() => {
    const subs = [
      theme$.subscribe(setTheme),
      lang$.subscribe(l => setLang(l === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  const handleCreateCustomCat = async () => {
    const trimmed = newCatName.trim();
    if (!trimmed) return;
    const entry = await addCustomCategory(newCatIcon, trimmed, trimmed);
    if (entry) {
      const updated = [...(AppData.todoCustomCategories || [])];
      setCustomCats(updated);
      setSelectedCatIndex(BASE_CATEGORIES.length + updated.length - 1);
    }
    setNewCatName('');
    setNewCatIcon(CUSTOM_ICON_OPTIONS[0].id);
    setShowCatModal(false);
  };

  const handleRemoveCustomCat = async (customIdx) => {
    await removeCustomCategory(customIdx);
    const updated = [...(AppData.todoCustomCategories || [])];
    setCustomCats(updated);
    if (selectedCatIndex >= BASE_CATEGORIES.length + updated.length) setSelectedCatIndex(0);
  };

  const handleToggleVisibility = async (field) => {
    const next = { ...visibility, [field]: !visibility[field] };
    setVisibility(next);
    await setTodoFieldVisibility(field, next[field]);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setShowPopUpPanel(lang === 0 ? 'Введите название задачи' : 'Enter task name', 2000, false);
      return;
    }

    const pIdx = visibility.priority ? PRIORITY_LABELS.findIndex(l => l.includes(priority)) : 1;
    const dIdx = visibility.difficulty ? DIFFICULTY_LABELS.findIndex(l => l.includes(difficulty)) : 2;
    const uIdx = visibility.urgency ? URGENCY_LABELS.findIndex(l => l.includes(urgency)) : 1;
    const categoryName = currentCat.label[lang] || currentCat.label[0];

    await createGoal(
      name,
      desc,
      dIdx,
      pIdx,
      categoryName,
      currentCat.icon,
      startDate,
      deadLine || null,
      subGoals,
      uIdx
    );
    closePanel();
  };

  const closePanel = () => {
    setPage(lastPage$.value || 'ToDoMain');
    setTimeout(() => {
      setName('');
      setDesc('');
      setSubGoals([]);
      setNewSubGoal('');
      setPriority(PRIORITY_LABELS[1][lang]);
      setDifficulty(DIFFICULTY_LABELS[2][lang]);
      setUrgency(URGENCY_LABELS[1][lang]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeadLine('');
      setSelectedCatIndex(0);
    }, 250);
  };

  const addSubGoalLocal = () => {
    const trimmed = newSubGoal.trim();
    if (!trimmed) return;
    setSubGoals([...subGoals, { text: trimmed, isDone: false }]);
    setNewSubGoal('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      style={s.container}
    >
      <div style={s.scroll} className="no-scrollbar">
        <div style={s.topBar}>
          <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={closePanel} style={s.roundButton}>
            <IoIosArrowBack size={22} />
          </motion.button>
          <div style={s.topTitleBlock}>
            <div style={s.eyebrow}>{lang === 0 ? 'ЗАДАЧНИК' : 'TASKS'}</div>
            <h1 style={s.title}>{lang === 0 ? 'Новая задача' : 'New task'}</h1>
          </div>
          <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => setShowAdvancedPanel(prev => !prev)} style={s.roundButtonActive(showAdvancedPanel)}>
            <FaCog size={15} />
          </motion.button>
        </div>

        <AnimatePresence initial={false}>
          {showAdvancedPanel && (
            <motion.section initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={s.advancedWrap}>
              <div style={s.panel}>
                <div style={s.sectionHead}>
                  <span>{lang === 0 ? 'Поля задачи' : 'Task fields'}</span>
                </div>
                {['priority', 'difficulty', 'urgency'].map(field => {
                  const label = getFieldLabel(field, lang);
                  const active = !!visibility[field];
                  return (
                    <div key={field} style={s.toggleRow}>
                      <span>{label}</span>
                      <button type="button" onClick={() => handleToggleVisibility(field)} style={s.switch(active)}>
                        <span style={s.switchDot(active)} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <section style={s.heroCard}>
          <div style={s.selectedIcon(currentTone)}>
            <CurrentIcon size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              placeholder={lang === 0 ? 'Что нужно сделать?' : 'What needs to be done?'}
              value={name}
              onChange={(event) => setName(event.target.value)}
              style={s.titleInput}
            />
            <textarea
              placeholder={lang === 0 ? 'Заметка, контекст, результат...' : 'Note, context, result...'}
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              style={s.descInput}
              rows={2}
            />
          </div>
        </section>

        <section style={s.panel}>
          <div style={s.sectionHead}>
            <FaTag size={12} />
            <span>{lang === 0 ? 'Категория' : 'Category'}</span>
          </div>
          <div style={s.categoryRow} className="no-scrollbar">
            {CATEGORIES.map((cat, index) => {
              const selected = index === selectedCatIndex;
              const isCustom = index >= BASE_CATEGORIES.length;
              const catTone = getTodoCategoryTone(cat.label[0], accent);
              const CatIcon = catTone.icon;
              return (
                <motion.button
                  key={`${cat.label[0]}-${index}`}
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setSelectedCatIndex(index)}
                  style={s.categoryChip(selected, catTone)}
                >
                  <span style={s.categoryIcon(catTone, selected)}>
                    <CatIcon size={12} />
                  </span>
                  <span>{cat.label[lang]}</span>
                  {selected && isCustom && (
                    <span
                      onClick={(event) => {
                        event.stopPropagation();
                        handleRemoveCustomCat(index - BASE_CATEGORIES.length);
                      }}
                      style={s.deleteCat}
                    >
                      <FaTrash size={10} />
                    </span>
                  )}
                </motion.button>
              );
            })}
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => setShowCatModal(true)} style={s.addCategoryChip}>
              <FaPlus size={11} />
              <span>{lang === 0 ? 'Своя' : 'Custom'}</span>
            </motion.button>
          </div>
        </section>

        {(visibility.priority || visibility.difficulty || visibility.urgency) && (
          <section style={s.panel}>
            <div style={s.sectionHead}>
              <FaListUl size={12} />
              <span>{lang === 0 ? 'Параметры' : 'Parameters'}</span>
            </div>
            <div style={s.pickerGrid}>
              {visibility.priority && (
                <PickerBlock icon={<FaFlag />} label={lang === 0 ? 'Приоритет' : 'Priority'} value={priority} onChange={setPriority} items={PRIORITY_LABELS.map(l => l[lang])} theme={theme} accent={accent} />
              )}
              {visibility.difficulty && (
                <PickerBlock icon={<FaLayerGroup />} label={lang === 0 ? 'Сложность' : 'Difficulty'} value={difficulty} onChange={setDifficulty} items={DIFFICULTY_LABELS.map(l => l[lang])} theme={theme} accent={accent} />
              )}
              {visibility.urgency && (
                <PickerBlock icon={<FaFire />} label={lang === 0 ? 'Срочность' : 'Urgency'} value={urgency} onChange={setUrgency} items={URGENCY_LABELS.map(l => l[lang])} theme={theme} accent={accent} />
              )}
            </div>
          </section>
        )}

        <section style={s.dateGrid}>
          <DateField icon={<FaCalendarDay />} label={lang === 0 ? 'Старт' : 'Start'} value={startDate} onChange={setStartDate} theme={theme} accent={accent} />
          <DateField icon={<FaClock />} label={lang === 0 ? 'Срок' : 'Deadline'} value={deadLine} onChange={setDeadLine} theme={theme} accent={accent} optional clearable />
        </section>

        <section style={s.panel}>
          <div style={s.sectionHead}>
            <FaListUl size={12} />
            <span>{lang === 0 ? 'Чек-лист' : 'Checklist'}</span>
          </div>
          <div style={s.addSubRow}>
            <input
              type="text"
              placeholder={lang === 0 ? 'Добавить шаг' : 'Add step'}
              value={newSubGoal}
              onChange={(event) => setNewSubGoal(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && addSubGoalLocal()}
              style={s.subInput}
            />
            <button type="button" onClick={addSubGoalLocal} style={s.addSubButton}>
              <FaPlus size={12} />
            </button>
          </div>
          <AnimatePresence initial={false}>
            {subGoals.map((goal, index) => (
              <motion.div key={`${goal.text}-${index}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={s.subItem}>
                <span style={s.subDot} />
                <span style={s.subText}>{goal.text}</span>
                <button type="button" onClick={() => setSubGoals(subGoals.filter((_, idx) => idx !== index))} style={s.subRemove}>
                  <FaTimes size={11} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        <div style={{ height: 120 }} />
      </div>

      <div style={s.bottomBar}>
        <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={closePanel} style={s.cancelButton}>
          <FaTimes />
        </motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={handleSave} style={s.saveButton}>
          <FaCheck />
          <span>{lang === 0 ? 'Создать задачу' : 'Create task'}</span>
        </motion.button>
      </div>

      <CustomCategoryModal
        show={showCatModal}
        onClose={() => setShowCatModal(false)}
        lang={lang}
        theme={theme}
        accent={accent}
        newCatName={newCatName}
        setNewCatName={setNewCatName}
        newCatIcon={newCatIcon}
        setNewCatIcon={setNewCatIcon}
        onCreate={handleCreateCustomCat}
      />
    </motion.div>
  );
};

export default ToDoNew;

const PickerBlock = ({ icon, label, value, onChange, items, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.pickerBlock}>
      <div style={s.fieldMiniHead}>
        {icon}
        <span>{label}</span>
      </div>
      <ScrollPicker items={items} value={value} onChange={onChange} theme={theme} width="100%" />
    </div>
  );
};

const DateField = ({ icon, label, value, onChange, theme, accent, optional, clearable }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.dateCard}>
      <div style={s.fieldMiniHead}>
        {icon}
        <span>{label}</span>
      </div>
      <div style={s.dateInputRow}>
        <input type="date" value={value || ''} onChange={(event) => onChange(event.target.value)} style={s.dateInput} />
        {clearable && value && (
          <button type="button" onClick={() => onChange('')} style={s.clearDate}>
            <FaTimes size={10} />
          </button>
        )}
        {optional && !value && <span style={s.optionalText}>-</span>}
      </div>
    </div>
  );
};

const CustomCategoryModal = ({
  show,
  onClose,
  lang,
  theme,
  accent,
  newCatName,
  setNewCatName,
  newCatIcon,
  setNewCatIcon,
  onCreate
}) => {
  const s = styles(theme, accent);
  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} style={s.modalShade} />
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30, scale: 0.98 }} style={s.modal}>
            <div style={s.modalHeader}>
              <div>
                <div style={s.modalTitle}>{lang === 0 ? 'Новая категория' : 'New category'}</div>
                <div style={s.modalSub}>{lang === 0 ? 'Иконка и название' : 'Icon and name'}</div>
              </div>
              <button type="button" onClick={onClose} style={s.modalClose}><FaTimes /></button>
            </div>
            <div style={s.emojiGrid}>
              {CUSTOM_ICON_OPTIONS.map(option => {
                const Icon = option.icon;
                return (
                  <button key={option.id} type="button" onClick={() => setNewCatIcon(option.id)} style={s.emojiButton(newCatIcon === option.id)}>
                    <Icon size={16} />
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={newCatName}
              onChange={(event) => setNewCatName(event.target.value)}
              placeholder={lang === 0 ? 'Название' : 'Name'}
              style={s.modalInput}
            />
            <button type="button" onClick={onCreate} style={s.modalCreate}>
              {lang === 0 ? 'Создать' : 'Create'}
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.05)';
  const panelStrong = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,21,25,0.92)';

  return {
    container: {
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: isLight
        ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)`
        : `linear-gradient(180deg, rgba(${accent.rgbText},0.12) 0%, ${Colors.get('background', theme)} 44%)`,
      color: text,
      fontFamily: 'Segoe UI, sans-serif',
      overflow: 'hidden'
    },
    scroll: {
      height: '100%',
      overflowY: 'auto',
      padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 18px 150px',
      boxSizing: 'border-box'
    },
    topBar: { display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) 48px', alignItems: 'center', gap: 12, marginBottom: 15 },
    roundButton: {
      width: 46,
      height: 46,
      borderRadius: 16,
      border: `1px solid ${border}`,
      background: panel,
      color: text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    roundButtonActive: (active) => ({
      width: 46,
      height: 46,
      borderRadius: 16,
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : panel,
      color: active ? accent.hue : text,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }),
    topTitleBlock: { minWidth: 0, textAlign: 'center' },
    eyebrow: { color: accent.hue, fontSize: 10, fontWeight: 950, letterSpacing: 1.8 },
    title: { margin: '2px 0 0', color: text, fontSize: fSize === 0 ? 25 : 27, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
    advancedWrap: { overflow: 'hidden', marginBottom: 12 },
    heroCard: {
      borderRadius: 26,
      padding: 15,
      display: 'flex',
      alignItems: 'flex-start',
      gap: 13,
      background: `radial-gradient(240px 150px at 100% 0%, ${accent.soft} 0%, transparent 68%), ${panelStrong}`,
      border: `1px solid ${border}`,
      boxShadow: isLight ? '0 18px 46px rgba(15,23,42,0.08)' : '0 22px 65px rgba(0,0,0,0.36)',
      backdropFilter: 'blur(18px)',
      marginBottom: 12
    },
	    selectedIcon: (tone) => ({
	      width: 54,
	      height: 54,
	      borderRadius: 18,
	      background: tone.soft,
	      border: `1px solid ${tone.ring}`,
	      color: tone.hue,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      flexShrink: 0
	    }),
    titleInput: {
      width: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      color: text,
      fontSize: fSize === 0 ? 22 : 24,
      fontWeight: 950,
      fontFamily: 'inherit',
      padding: '1px 0 8px',
      boxSizing: 'border-box'
    },
    descInput: {
      width: '100%',
      minHeight: 54,
      border: 'none',
      outline: 'none',
      resize: 'none',
      background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)',
      color: text,
      fontSize: 14,
      fontWeight: 650,
      lineHeight: 1.35,
      borderRadius: 14,
      padding: 11,
      boxSizing: 'border-box',
      fontFamily: 'inherit'
    },
    panel: {
      borderRadius: 22,
      padding: 13,
      background: panel,
      border: `1px solid ${border}`,
      backdropFilter: 'blur(18px)',
      marginBottom: 12
    },
    sectionHead: { display: 'flex', alignItems: 'center', gap: 8, color: sub, fontSize: 12, fontWeight: 950, marginBottom: 11 },
    toggleRow: { minHeight: 42, display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: text, fontSize: 14, fontWeight: 850 },
    switch: (active) => ({
      width: 46,
      height: 26,
      borderRadius: 999,
      border: `1px solid ${active ? accent.ring : border}`,
      background: active ? accent.soft : isLight ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.06)',
      padding: 2,
      display: 'flex',
      alignItems: 'center',
      justifyContent: active ? 'flex-end' : 'flex-start'
    }),
    switchDot: (active) => ({ width: 20, height: 20, borderRadius: 999, background: active ? accent.hue : sub }),
    categoryRow: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 },
	    categoryChip: (selected, tone = accent) => ({
	      minHeight: 40,
	      borderRadius: 999,
	      border: `1px solid ${selected ? tone.ring : border}`,
	      background: selected ? tone.soft : 'transparent',
	      color: selected ? tone.hue : text,
	      display: 'flex',
	      alignItems: 'center',
      gap: 7,
      padding: '0 12px',
      fontSize: 12,
      fontWeight: 900,
	      whiteSpace: 'nowrap',
	      fontFamily: 'inherit'
	    }),
	    categoryIcon: (tone = accent, selected) => ({
	      width: 24,
	      height: 24,
	      borderRadius: 9,
	      display: 'flex',
	      alignItems: 'center',
	      justifyContent: 'center',
	      color: tone.hue,
	      background: selected ? 'rgba(255,255,255,0.045)' : tone.soft,
	      border: `1px solid ${tone.ring}`,
	      flexShrink: 0
	    }),
    addCategoryChip: {
      minHeight: 40,
      borderRadius: 999,
      border: `1px dashed ${accent.ring}`,
      background: 'transparent',
      color: accent.hue,
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: '0 12px',
      fontSize: 12,
      fontWeight: 900,
      whiteSpace: 'nowrap',
      fontFamily: 'inherit'
    },
    deleteCat: { color: Colors.get('skipped', theme), display: 'flex', marginLeft: 1 },
    pickerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(98px, 1fr))', gap: 10 },
    pickerBlock: { minWidth: 0, borderRadius: 18, padding: 10, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', border: `1px solid ${border}` },
    fieldMiniHead: { display: 'flex', alignItems: 'center', gap: 7, color: sub, fontSize: 11, fontWeight: 950, marginBottom: 8 },
    dateGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 },
    dateCard: { minWidth: 0, borderRadius: 20, padding: 13, background: panel, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
    dateInputRow: { display: 'flex', alignItems: 'center', gap: 6 },
    dateInput: { minWidth: 0, width: '100%', border: 'none', outline: 'none', background: 'transparent', color: text, fontSize: 13, fontWeight: 850, fontFamily: 'inherit' },
    clearDate: { width: 24, height: 24, borderRadius: 999, border: 'none', background: accent.soft, color: accent.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    optionalText: { color: sub, fontSize: 14, fontWeight: 900 },
    addSubRow: { display: 'flex', gap: 8, alignItems: 'center' },
    subInput: { flex: 1, minWidth: 0, minHeight: 44, borderRadius: 15, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', color: text, outline: 'none', padding: '0 13px', fontSize: 14, fontWeight: 750, fontFamily: 'inherit' },
    addSubButton: { width: 44, height: 44, borderRadius: 15, border: 'none', background: accent.hue, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    subItem: { minHeight: 42, borderRadius: 15, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px', marginTop: 8 },
    subDot: { width: 7, height: 7, borderRadius: 999, background: accent.hue, flexShrink: 0 },
    subText: { flex: 1, minWidth: 0, color: text, fontSize: 14, fontWeight: 750, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    subRemove: { width: 28, height: 28, borderRadius: 999, border: 'none', background: 'transparent', color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    bottomBar: {
      position: 'fixed',
      left: 18,
      right: 18,
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
      height: 76,
      borderRadius: 24,
      padding: 10,
      display: 'grid',
      gridTemplateColumns: '58px minmax(0, 1fr)',
      gap: 10,
      background: isLight ? 'rgba(255,255,255,0.82)' : 'rgba(16,18,21,0.78)',
      border: `1px solid ${border}`,
      backdropFilter: 'blur(22px)',
      boxShadow: isLight ? '0 18px 60px rgba(15,23,42,0.16)' : '0 20px 70px rgba(0,0,0,0.55)'
    },
    cancelButton: { width: 56, height: 56, borderRadius: 18, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.06)', color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
    saveButton: { minWidth: 0, height: 56, borderRadius: 18, border: 'none', background: `linear-gradient(135deg, ${accent.hue}, ${accent.solidSoft})`, color: '#0E1013', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, fontSize: 16, fontWeight: 950, fontFamily: 'inherit', boxShadow: `0 14px 36px ${accent.glow}` },
    modalShade: { position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.58)', backdropFilter: 'blur(8px)' },
    modal: { position: 'fixed', left: 18, right: 18, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)', zIndex: 3001, borderRadius: 26, padding: 17, background: panelStrong, border: `1px solid ${border}`, boxShadow: '0 26px 80px rgba(0,0,0,0.45)' },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 14 },
    modalTitle: { color: text, fontSize: 18, fontWeight: 950 },
    modalSub: { color: sub, fontSize: 12, fontWeight: 750, marginTop: 2 },
    modalClose: { width: 36, height: 36, borderRadius: 12, border: 'none', background: isLight ? 'rgba(15,23,42,0.05)' : 'rgba(255,255,255,0.06)', color: sub, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    emojiGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, marginBottom: 14 },
    emojiButton: (active) => ({ aspectRatio: '1 / 1', borderRadius: 14, border: `1px solid ${active ? accent.ring : border}`, background: active ? accent.soft : 'transparent', color: active ? accent.hue : sub, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    modalInput: { width: '100%', minHeight: 48, borderRadius: 15, border: `1px solid ${border}`, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)', color: text, outline: 'none', padding: '0 13px', fontSize: 15, fontWeight: 800, boxSizing: 'border-box', fontFamily: 'inherit' },
    modalCreate: { width: '100%', minHeight: 50, borderRadius: 16, border: 'none', background: accent.hue, color: '#0E1013', marginTop: 12, fontSize: 15, fontWeight: 950, fontFamily: 'inherit' }
  };
};

function getFieldLabel(field, lang) {
  if (field === 'priority') return lang === 0 ? 'Приоритет' : 'Priority';
  if (field === 'difficulty') return lang === 0 ? 'Сложность' : 'Difficulty';
  return lang === 0 ? 'Срочность' : 'Urgency';
}
