import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBrain,
  FaBullseye,
  FaCalendarDay,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaFire,
  FaFilm,
  FaFlask,
  FaFolderOpen,
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
  FaTrashAlt
} from 'react-icons/fa';
import { MdClose, MdDone } from 'react-icons/md';
import { IoIosArrowBack } from 'react-icons/io';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, lastPage$, selectedTodo$, setPage, setShowPopUpPanel, theme$ } from '../../StaticClasses/HabitsBus.js';
import { addCustomCategory, createGoal, removeCustomCategory, setTodoFieldVisibility, todoEvents$ } from './ToDoHelper';
import { buildTodoAccent, getTodoCategoryTone, TODO_BASE_CATEGORIES } from './ToDoVisuals.js';

// =========================
// Константы
// =========================
const DIFFICULTY_LABELS = [['Очень легко', 'Very Easy'], ['Легко', 'Easy'], ['Средне', 'Medium'], ['Сложно', 'Hard'], ['Кошмар', 'Nightmare']];
const URGENCY_LABELS = [['Не горит', 'Not urgent'], ['Обычная', 'Normal'], ['Срочно', 'Urgent'], ['Очень срочно', 'Very urgent'], ['ASAP', 'ASAP']];
const DIFFICULTY_COLORS = ['#81C784', '#9CCC65', '#FFD54F', '#FF8A65', '#E57373'];
const URGENCY_COLORS = ['#8FA6C8', '#64B5F6', '#FFD54F', '#FF8A65', '#E57373'];

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

// =========================
// Component
// =========================
const ToDoNew = () => {
  const [theme, setTheme] = useState(theme$.value);
  const [lang, setLang] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(fontSize$.value);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [difficultyIdx, setDifficultyIdx] = useState(2);
  const [urgencyIdx, setUrgencyIdx] = useState(1);
  const [selectedCatIndex, setSelectedCatIndex] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deadLine, setDeadLine] = useState('');
  const [subGoals, setSubGoals] = useState([]);
  const [newSubGoal, setNewSubGoal] = useState('');
  const [expandedSubGoals, setExpandedSubGoals] = useState({});
  const [customCats, setCustomCats] = useState(AppData.todoCustomCategories || []);
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState(CUSTOM_ICON_OPTIONS[0].id);
  const [visibility, setVisibility] = useState({ difficulty: true, urgency: true, startDate: true, deadLine: true, ...(AppData.todoFieldsVisibility || {}) });
  const [accentColor] = useState(AppData.todoAccentColor || '#8FA6C8');

  const CATEGORIES = useMemo(() => [...BASE_CATEGORIES, ...customCats], [customCats]);
  const currentCat = CATEGORIES[selectedCatIndex] || CATEGORIES[0];
  const accent = useMemo(() => buildTodoAccent(accentColor), [accentColor]);
  const isLight = theme === 'light' || theme === 'speciallight';

  const ui = {
    bg: isLight
      ? `radial-gradient(900px 450px at 80% -10%, rgba(${accent.rgbText},0.10), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(111,139,214,0.08), transparent 58%), #F4F5F7`
      : `radial-gradient(1000px 500px at 80% -10%, rgba(${accent.rgbText},0.07), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(138,124,214,0.05), transparent 55%), #0E1013`,
    card: isLight ? 'rgba(255,255,255,0.86)' : 'rgba(24,28,31,0.88)',
    cardSoft: isLight ? 'rgba(255,255,255,0.68)' : 'rgba(255,255,255,0.045)',
    field: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.055)',
    text: Colors.get('mainText', theme),
    sub: Colors.get('subText', theme),
    accent: accent.hue,
    blur: 'blur(30px)',
    border: isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)',
    borderStrong: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(159,180,196,0.2)',
    shadow: isLight ? '0 18px 42px rgba(15,23,42,0.08)' : '0 26px 60px rgba(0,0,0,0.34)'
  };

  const currentTone = getTodoCategoryTone(currentCat?.label?.[0], accent);
  const CurrentIcon = currentTone.icon;

  // ===== Subscribers =====
  useEffect(() => {
    const subs = [
      theme$.subscribe(setTheme),
      lang$.subscribe(l => setLang(l === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  // ===== Handlers =====
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

  const toggleFieldVisibility = async (field) => {
    const next = !visibility[field];
    setVisibility(prev => ({ ...prev, [field]: next }));
    await setTodoFieldVisibility(field, next);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setShowPopUpPanel(lang === 0 ? 'Введите название задачи' : 'Enter task name', 2000, false);
      return;
    }
    const pIdx = 1;
    const dIdx = visibility.difficulty ? difficultyIdx : 2;
    const uIdx = visibility.urgency ? urgencyIdx : 1;
    const categoryName = currentCat.label[lang] || currentCat.label[0];
    const cleanName = name.trim();
    const cleanGoals = subGoals
      .map(goal => ({
        ...goal,
        text: (goal.text || '').trim(),
        aim: (goal.aim || '').trim(),
        result: (goal.result || '').trim(),
        isDone: !!goal.isDone
      }))
      .filter(goal => goal.text && goal.text.toLowerCase() !== cleanName.toLowerCase())
      .filter((goal, index, list) => list.findIndex(item => item.text.toLowerCase() === goal.text.toLowerCase()) === index);

    const createdTask = await createGoal(
      cleanName,
      desc,
      dIdx,
      pIdx,
      categoryName,
      currentCat.icon,
      startDate,
      deadLine || null,
      cleanGoals,
      uIdx
    );
    selectedTodo$.next(createdTask);
    setPage('ToDoMain');
    resetFormSoon();
  };

  const closePanel = () => {
    setPage(lastPage$.value || 'ToDoMain');
    resetFormSoon();
  };

  const resetFormSoon = () => {
    setTimeout(() => {
      setName('');
      setDesc('');
      setSubGoals([]);
      setNewSubGoal('');
      setExpandedSubGoals({});
      setDifficultyIdx(2);
      setUrgencyIdx(1);
      setStartDate(new Date().toISOString().split('T')[0]);
      setDeadLine('');
      setSelectedCatIndex(0);
    }, 250);
  };

  const addSubGoalLocal = () => {
    const trimmed = newSubGoal.trim();
    if (!trimmed) return;
    setSubGoals(prev => {
      const nextIndex = prev.length;
      setExpandedSubGoals(expanded => ({ ...expanded, [nextIndex]: true }));
      return [...prev, { text: trimmed, aim: '', result: '', isDone: false }];
    });
    setNewSubGoal('');
  };

  const toggleSubDone = (i) => {
    setSubGoals(subGoals.map((g, idx) => idx === i ? { ...g, isDone: !g.isDone } : g));
  };

  const updateSubGoalLocal = (i, patch) => {
    setSubGoals(subGoals.map((g, idx) => idx === i ? { ...g, ...patch } : g));
  };

  const toggleSubExpanded = (i) => {
    setExpandedSubGoals(prev => ({ ...prev, [i]: !prev[i] }));
  };

  const moveSubGoalLocal = (i, direction) => {
    const target = i + direction;
    if (target < 0 || target >= subGoals.length) return;
    const next = [...subGoals];
    const [moved] = next.splice(i, 1);
    next.splice(target, 0, moved);
    setSubGoals(next);
    setExpandedSubGoals(prev => {
      const mapped = {};
      Object.entries(prev).forEach(([key, value]) => {
        const numericKey = Number(key);
        if (numericKey === i) mapped[target] = value;
        else if (numericKey === target) mapped[i] = value;
        else mapped[numericKey] = value;
      });
      return mapped;
    });
  };

  const removeSub = (i) => {
    setSubGoals(subGoals.filter((_, idx) => idx !== i));
    setExpandedSubGoals(prev => {
      const next = {};
      Object.entries(prev).forEach(([key, value]) => {
        const numericKey = Number(key);
        if (numericKey < i) next[numericKey] = value;
        if (numericKey > i) next[numericKey - 1] = value;
      });
      return next;
    });
  };

  // =========================
  // Render
  // =========================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ ...pageStyle, background: ui.bg, color: ui.text }}
    >
      {/* Header */}
      <div style={pageHeader}>
        <motion.div whileTap={{ scale: 0.9 }} onClick={closePanel} style={backBtn(ui)}>
          <IoIosArrowBack size={24} color={ui.text} />
        </motion.div>
        <div style={brandBlock()}>
          <div style={brandTitle(ui)}>UltyMyLife</div>
          <div style={brandSubtitle(ui)}>{lang === 0 ? 'НОВАЯ ЗАДАЧА' : 'NEW TASK'}</div>
        </div>
        <div style={{ width: 42, height: 42 }} />
      </div>

      {/* Content */}
      <div style={contentWrap()}>
        {/* HERO */}
        <div style={addHero(ui, accent)}>
          <div style={addHeroIcon(ui, currentTone)}>
            <CurrentIcon size={24} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={heroEyebrow(ui)}>
              {currentCat?.label?.[lang] || (lang === 0 ? 'Категория' : 'Category')}
            </div>
            <input
              type="text"
              placeholder={lang === 0 ? 'Что нужно сделать?' : 'What needs to be done?'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={heroNameInput(ui, fSize)}
            />
          </div>
        </div>

        {/* Description */}
        <textarea
          placeholder={lang === 0 ? 'Заметка, контекст, результат...' : 'Note, context, result...'}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          style={descInput(ui)}
          rows={2}
        />

        {/* Categories */}
        <div style={sectionLabel(ui)}>
          <FaTag size={11} style={{ marginRight: 7 }} />
          {lang === 0 ? 'КАТЕГОРИЯ' : 'CATEGORY'}
        </div>
        <div className="no-scrollbar" style={categoryStrip()}>
          {CATEGORIES.map((cat, index) => {
            const active = index === selectedCatIndex;
            const isCustom = index >= BASE_CATEGORIES.length;
            const tone = getTodoCategoryTone(cat.label[0], accent);
            const Icon = tone.icon;
            return (
              <motion.div
                key={`${cat.label[0]}-${index}`}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCatIndex(index)}
                style={categoryChip(active, tone, ui)}
              >
                <span style={categoryChipIcon(active, tone)}>
                  <Icon size={13} />
                </span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label[lang]}</span>
                {active && isCustom && (
                  <span
                    onClick={(e) => { e.stopPropagation(); handleRemoveCustomCat(index - BASE_CATEGORIES.length); }}
                    style={categoryActionBtn(ui, true)}
                  >
                    <FaTrashAlt size={10} />
                  </span>
                )}
              </motion.div>
            );
          })}
          <motion.div whileTap={{ scale: 0.97 }} onClick={() => setShowCatModal(true)} style={addCategoryChip(ui, accent)}>
            <FaPlus size={11} />
            {lang === 0 ? 'Своя' : 'Custom'}
          </motion.div>
        </div>

        {/* Parameters */}
        <div style={sectionLabel(ui)}>
          <FaLayerGroup size={11} style={{ marginRight: 7 }} />
          {lang === 0 ? 'ПАРАМЕТРЫ' : 'PARAMETERS'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
          <AnimatePresence initial={false}>
            {visibility.difficulty && (
              <motion.div
                key="difficulty-card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <ScaleCard
                  ui={ui}
                  icon={<FaLayerGroup size={13} />}
                  label={lang === 0 ? 'Сложность' : 'Difficulty'}
                  value={difficultyIdx}
                  onChange={setDifficultyIdx}
                  labels={DIFFICULTY_LABELS.map(l => l[lang])}
                  colors={DIFFICULTY_COLORS}
                  onHide={() => toggleFieldVisibility('difficulty')}
                />
              </motion.div>
            )}
            {visibility.urgency && (
              <motion.div
                key="urgency-card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <ScaleCard
                  ui={ui}
                  icon={<FaFire size={13} />}
                  label={lang === 0 ? 'Срочность' : 'Urgency'}
                  value={urgencyIdx}
                  onChange={setUrgencyIdx}
                  labels={URGENCY_LABELS.map(l => l[lang])}
                  colors={URGENCY_COLORS}
                  onHide={() => toggleFieldVisibility('urgency')}
                />
              </motion.div>
            )}
            {(visibility.startDate || visibility.deadLine) && (
              <motion.div
                key="dates-card"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={dateParamGrid()}>
                  {visibility.startDate && (
                    <DateParamCard
                      ui={ui}
                      accent={accent}
                      icon={<FaCalendarDay size={13} />}
                      label={lang === 0 ? 'Старт' : 'Start'}
                      value={startDate}
                      onChange={setStartDate}
                      onHide={() => toggleFieldVisibility('startDate')}
                    />
                  )}
                  {visibility.deadLine && (
                    <DateParamCard
                      ui={ui}
                      accent={accent}
                      icon={<FaClock size={13} />}
                      label={lang === 0 ? 'Дедлайн' : 'Deadline'}
                      value={deadLine}
                      onChange={setDeadLine}
                      onHide={() => toggleFieldVisibility('deadLine')}
                      clearable
                      emptyText={lang === 0 ? 'Без дедлайна' : 'No deadline'}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Кнопки восстановления скрытых параметров */}
          {(!visibility.difficulty || !visibility.urgency || !visibility.startDate || !visibility.deadLine) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {!visibility.difficulty && (
                <motion.div whileTap={{ scale: 0.96 }} onClick={() => toggleFieldVisibility('difficulty')} style={restoreChip(ui, accent)}>
                  <FaEye size={11} color={accent.hue} />
                  <FaLayerGroup size={11} />
                  <span>{lang === 0 ? 'Сложность' : 'Difficulty'}</span>
                </motion.div>
              )}
              {!visibility.urgency && (
                <motion.div whileTap={{ scale: 0.96 }} onClick={() => toggleFieldVisibility('urgency')} style={restoreChip(ui, accent)}>
                  <FaEye size={11} color={accent.hue} />
                  <FaFire size={11} />
                  <span>{lang === 0 ? 'Срочность' : 'Urgency'}</span>
                </motion.div>
              )}
              {!visibility.startDate && (
                <motion.div whileTap={{ scale: 0.96 }} onClick={() => toggleFieldVisibility('startDate')} style={restoreChip(ui, accent)}>
                  <FaEye size={11} color={accent.hue} />
                  <FaCalendarDay size={11} />
                  <span>{lang === 0 ? 'Старт' : 'Start'}</span>
                </motion.div>
              )}
              {!visibility.deadLine && (
                <motion.div whileTap={{ scale: 0.96 }} onClick={() => toggleFieldVisibility('deadLine')} style={restoreChip(ui, accent)}>
                  <FaEye size={11} color={accent.hue} />
                  <FaClock size={11} />
                  <span>{lang === 0 ? 'Дедлайн' : 'Deadline'}</span>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Checklist */}
        <div style={sectionLabel(ui)}>
          <FaListUl size={11} style={{ marginRight: 7 }} />
          {lang === 0 ? 'ЧЕК-ЛИСТ' : 'CHECKLIST'}
          {subGoals.length > 0 && (
            <span style={{ marginLeft: 'auto', color: ui.sub, fontSize: 11, fontWeight: 700 }}>
              {subGoals.filter(g => g.isDone).length}/{subGoals.length}
            </span>
          )}
        </div>
        <div style={configCard(ui)}>
          <div style={addSubRow(ui)}>
            <input
              type="text"
              placeholder={lang === 0 ? 'Добавить шаг' : 'Add step'}
              value={newSubGoal}
              onChange={(e) => setNewSubGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSubGoalLocal()}
              style={subInput(ui)}
            />
            <motion.div whileTap={{ scale: 0.92 }} onClick={addSubGoalLocal} style={addSubBtn(ui, accent)}>
              <FaPlus size={14} color={accent.hue} />
            </motion.div>
          </div>
          {subGoals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <AnimatePresence initial={false}>
                {subGoals.map((g, i) => (
                  <SubGoalDraftCard
                    key={`${g.text}-${i}`}
                    goal={g}
                    index={i}
                    ui={ui}
                    accent={accent}
                    lang={lang}
                    expanded={!!expandedSubGoals[i]}
                    canMoveUp={i > 0}
                    canMoveDown={i < subGoals.length - 1}
                    onToggleDone={() => toggleSubDone(i)}
                    onToggleExpand={() => toggleSubExpanded(i)}
                    onUpdate={(patch) => updateSubGoalLocal(i, patch)}
                    onMove={(direction) => moveSubGoalLocal(i, direction)}
                    onRemove={() => removeSub(i)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footerButtons(ui)}>
          <motion.div whileTap={{ scale: 0.94 }} onClick={closePanel} style={btnCancel(ui)}>
            <MdClose size={22} color="#fff" />
          </motion.div>
          <motion.div whileTap={{ scale: 0.96 }} onClick={handleSave} style={btnSave(ui, accent)}>
            <MdDone size={24} color="#fff" />
            <span style={{ color: '#fff', fontWeight: 950, fontSize: 15, marginLeft: 8 }}>
              {lang === 0 ? 'Создать задачу' : 'Create task'}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Bottom sheets */}
      <CustomCategoryModal
        show={showCatModal}
        onClose={() => setShowCatModal(false)}
        lang={lang}
        ui={ui}
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

// =========================
// Sub-components
// =========================
const ScaleCard = ({ ui, icon, label, value, onChange, labels, colors, onHide }) => {
  const activeColor = colors[value] || ui.accent;
  return (
    <div style={configCard(ui)}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
        <span style={{ display: 'flex', color: activeColor, marginRight: 8 }}>{icon}</span>
        <span style={{ color: ui.text, fontWeight: 850, fontSize: 14, flex: 1 }}>{label}</span>
        <span style={{ color: activeColor, fontWeight: 950, fontSize: 13, marginRight: 8 }}>
          {labels[value]}
        </span>
        <motion.div
          whileTap={{ scale: 0.85 }}
          onClick={onHide}
          style={eyeBtn(ui)}
          title="Скрыть параметр"
        >
          <FaEyeSlash size={11} color={ui.sub} />
        </motion.div>
      </div>
      <div style={scaleTrack(ui)}>
        <div style={scaleFill(value, labels.length, activeColor)} />
        {labels.map((_, i) => {
          const active = i <= value;
          return (
            <motion.div
              key={i}
              whileTap={{ scale: 0.85 }}
              onClick={() => onChange(i)}
              style={scaleNode(active, i === value, colors[i] || ui.accent, ui)}
            />
          );
        })}
      </div>
      <div style={scaleLabelRow(ui)}>
        {labels.map((l, i) => (
          <span key={l + i} style={{ color: i === value ? colors[i] : ui.sub, fontSize: 9, fontWeight: 800, flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {i === value ? '●' : '·'}
          </span>
        ))}
      </div>
    </div>
  );
};

const DateParamCard = ({ ui, accent, icon, label, value, onChange, onHide, clearable, emptyText }) => {
  const inputRef = useRef(null);
  const display = formatDateForDisplay(value, emptyText || '—');
  const open = () => {
    if (typeof inputRef.current?.showPicker === 'function') inputRef.current.showPicker();
    else inputRef.current?.focus();
  };
  return (
    <motion.div whileTap={{ scale: 0.99 }} onClick={open} style={dateParamCard(ui)}>
      <div style={dateParamHead()}>
        <span style={{ color: accent.hue, display: 'flex', marginRight: 7 }}>{icon}</span>
        <span style={{ color: ui.text, fontWeight: 850, fontSize: 14, flex: 1 }}>{label}</span>
        <motion.div
          whileTap={{ scale: 0.85 }}
          onClick={(e) => { e.stopPropagation(); onHide(); }}
          style={eyeBtn(ui)}
          title="Скрыть параметр"
        >
          <FaEyeSlash size={11} color={ui.sub} />
        </motion.div>
      </div>
      <div style={dateParamBody(ui)}>
        <div style={dateParamIcon(accent)}>
          {icon}
        </div>
        <span style={dateParamValue(ui, value)}>
          {display}
        </span>
        {clearable && value && (
          <motion.div whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onChange(''); }} style={dateParamClear(ui)}>
            <FaTimes size={10} color={ui.sub} />
          </motion.div>
        )}
        <input
          ref={inputRef}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          style={dateParamInput()}
        />
      </div>
    </motion.div>
  );
};

const SubGoalDraftCard = ({
  goal, index, ui, accent, lang, expanded, canMoveUp, canMoveDown,
  onToggleDone, onToggleExpand, onUpdate, onMove, onRemove
}) => {
  const hasAim = !!goal.aim;
  const hasResult = !!goal.result;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      style={subDraftCard(ui, accent, goal.isDone)}
    >
      <div style={subDraftTop()}>
        <motion.div whileTap={{ scale: 0.85 }} onClick={(e) => { e.stopPropagation(); onToggleDone(); }} style={subCheck(ui, accent, goal.isDone)}>
          {goal.isDone && <FaCheck size={9} color="#fff" />}
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={goal.text}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder={lang === 0 ? 'Название шага' : 'Step name'}
            style={subDraftTitleInput(ui, goal.isDone)}
          />
          <div style={subDraftMetaRow()}>
            <span style={subDraftStatus(ui, accent, goal.isDone)}>
              {goal.isDone ? (lang === 0 ? 'Готово' : 'Done') : (lang === 0 ? 'Шаг' : 'Step')}
            </span>
            {hasAim && (
              <span style={subDraftMetaChip(ui)}>
                <FaBullseye size={9} />
                {lang === 0 ? 'Цель' : 'Aim'}
              </span>
            )}
            {hasResult && (
              <span style={subDraftMetaChip(ui)}>
                <FaStar size={9} />
                {lang === 0 ? 'Результат' : 'Result'}
              </span>
            )}
          </div>
        </div>
        <motion.div whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} style={subDraftAction(ui)}>
          {expanded ? <FaChevronUp size={11} color={ui.sub} /> : <FaChevronDown size={11} color={ui.sub} />}
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={subDraftExpanded(ui)}
          >
            <div style={subDraftFieldLabel(ui)}>
              <FaBullseye size={11} color={accent.hue} />
              {lang === 0 ? 'Цель / заметка' : 'Aim / note'}
            </div>
            <textarea
              value={goal.aim || ''}
              onChange={(e) => onUpdate({ aim: e.target.value })}
              placeholder={lang === 0 ? 'Что важно в этом шаге?' : 'What matters in this step?'}
              style={subDraftFieldInput(ui)}
              rows={2}
            />

            <div style={subDraftFieldLabel(ui)}>
              <FaStar size={11} color={goal.isDone ? '#2ed177' : ui.sub} />
              {lang === 0 ? 'Результат' : 'Result'}
            </div>
            <textarea
              value={goal.result || ''}
              onChange={(e) => onUpdate({ result: e.target.value })}
              placeholder={lang === 0 ? 'Что получилось?' : 'What was achieved?'}
              style={subDraftFieldInput(ui)}
              rows={2}
            />

            <div style={subDraftFooter()}>
              <motion.div whileTap={{ scale: 0.96 }} onClick={onToggleDone} style={subDraftFooterBtn(ui, goal.isDone ? 'neutral' : 'done')}>
                <FaCheck size={10} />
                {goal.isDone ? (lang === 0 ? 'Вернуть' : 'Reopen') : (lang === 0 ? 'Готово' : 'Done')}
              </motion.div>
              <motion.div whileTap={{ scale: canMoveUp ? 0.96 : 1 }} onClick={() => canMoveUp && onMove(-1)} style={subDraftIconBtn(ui, !canMoveUp)}>
                <FaChevronUp size={10} />
              </motion.div>
              <motion.div whileTap={{ scale: canMoveDown ? 0.96 : 1 }} onClick={() => canMoveDown && onMove(1)} style={subDraftIconBtn(ui, !canMoveDown)}>
                <FaChevronDown size={10} />
              </motion.div>
              <motion.div whileTap={{ scale: 0.96 }} onClick={onRemove} style={subDraftFooterBtn(ui, 'danger')}>
                <FaTrashAlt size={10} />
                {lang === 0 ? 'Удалить' : 'Delete'}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

function formatDateForDisplay(value, fallback) {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const CustomCategoryModal = ({ show, onClose, lang, ui, accent, newCatName, setNewCatName, newCatIcon, setNewCatIcon, onCreate }) => (
  <AnimatePresence>
    {show && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={overlayStyle} onClick={onClose}>
        <motion.div
          initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ ...iconSheet(ui), backdropFilter: ui.blur }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={dragHandle} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 25px 15px' }}>
            <h3 style={{ margin: 0, color: ui.text }}>{lang === 0 ? 'Новая категория' : 'New Category'}</h3>
            <motion.div whileTap={{ scale: 0.9 }} onClick={onClose} style={{ padding: 8, backgroundColor: ui.card, borderRadius: '50%' }}>
              <MdClose color={ui.sub} />
            </motion.div>
          </div>
          <div style={{ padding: '0 25px 30px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder={lang === 0 ? 'Название' : 'Name'}
              style={{ ...textInput(ui) }}
            />
            <p style={cardLabel(ui)}>{lang === 0 ? 'Иконка' : 'Icon'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 8, maxHeight: '38vh', overflowY: 'auto' }}>
              {CUSTOM_ICON_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = newCatIcon === opt.id;
                return (
                  <motion.div key={opt.id} whileTap={{ scale: 0.9 }} onClick={() => setNewCatIcon(opt.id)} style={iconItem(active, ui, accent)}>
                    <Icon size={18} color={active ? accent.hue : ui.sub} />
                  </motion.div>
                );
              })}
            </div>
            <motion.div whileTap={{ scale: 0.97 }} onClick={onCreate} style={modalCreateBtn(ui, accent)}>
              <span style={{ color: accent.hue, fontWeight: 900, fontSize: 14 }}>{lang === 0 ? 'Создать' : 'Create'}</span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);


// =========================
// Styles
// =========================
const pageStyle = { position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflowY: 'auto', overflowX: 'hidden', zIndex: 1000, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" };
const pageHeader = { width: 'calc(100% - 56px)', maxWidth: 660, margin: '0 auto', padding: 'calc(env(safe-area-inset-top, 0px) + 18px) 0 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxSizing: 'border-box' };
const contentWrap = () => ({ width: 'calc(100% - 56px)', maxWidth: 660, margin: '0 auto', minHeight: 'calc(100vh - 92px)', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))' });
const backBtn = (ui) => ({ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ui.field, border: `1px solid ${ui.border}`, cursor: 'pointer', flexShrink: 0 });
const brandBlock = () => ({ minWidth: 0, flex: 1, textAlign: 'center', padding: '0 12px' });
const brandTitle = (ui) => ({ color: ui.text, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 22, fontWeight: 700, lineHeight: 1.05, opacity: 0.86 });
const brandSubtitle = (ui) => ({ marginTop: 5, color: ui.sub, fontSize: 9, fontWeight: 700, letterSpacing: '0.18em' });

const addHero = (ui, accent) => ({
  position: 'relative', overflow: 'hidden', minHeight: 92, borderRadius: 26, padding: 18,
  margin: '8px 0 12px', display: 'flex', alignItems: 'center', gap: 14,
  background: `radial-gradient(300px 140px at 84% -22%, rgba(${accent.rgbText},0.16), transparent 70%), linear-gradient(145deg, ${ui.card}, ${ui.cardSoft})`,
  border: `1px solid ${ui.borderStrong}`, boxShadow: ui.shadow, boxSizing: 'border-box'
});
const addHeroIcon = (ui, tone) => ({ width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone.hue, background: tone.soft, border: `1px solid ${tone.ring}`, boxShadow: `0 0 28px ${tone.soft}`, flexShrink: 0 });
const heroEyebrow = (ui) => ({ color: ui.sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' });
const heroNameInput = (ui, fSize) => ({ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: ui.text, fontSize: fSize === 0 ? 22 : 24, fontWeight: 950, fontFamily: 'inherit', padding: '4px 0 0', boxSizing: 'border-box' });

const descInput = (ui) => ({ width: '100%', minHeight: 50, border: `1px solid ${ui.border}`, outline: 'none', resize: 'none', background: ui.field, color: ui.text, fontSize: 13, fontWeight: 650, lineHeight: 1.4, borderRadius: 16, padding: 12, boxSizing: 'border-box', fontFamily: 'inherit', marginBottom: 16 });

const sectionLabel = (ui) => ({ display: 'flex', alignItems: 'center', color: ui.sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.14em', margin: '0 0 9px 4px' });

const categoryStrip = () => ({
  width: '100%', overflowX: 'auto', overflowY: 'visible', display: 'flex', gap: 8,
  marginBottom: 16, padding: '6px 36px 12px 2px', scrollbarWidth: 'none', flexWrap: 'nowrap',
  boxSizing: 'border-box', WebkitOverflowScrolling: 'touch', minHeight: 56
});
const categoryChip = (active, tone, ui) => ({
  minHeight: 40, padding: active ? '8px 8px 8px 10px' : '8px 12px', borderRadius: 14,
  whiteSpace: 'nowrap',
  background: active ? `linear-gradient(135deg, ${tone.soft}, rgba(255,255,255,0.045))` : ui.cardSoft,
  border: `1px solid ${active ? tone.ring : ui.border}`,
  color: active ? tone.hue : ui.text, fontSize: 13, fontWeight: 850,
  boxShadow: active ? `0 0 18px ${tone.soft}` : 'none',
  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, boxSizing: 'border-box'
});
const categoryChipIcon = (active, tone) => ({ width: 24, height: 24, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: tone.hue, background: active ? tone.soft : 'rgba(255,255,255,0.045)', border: `1px solid ${active ? tone.ring : 'rgba(255,255,255,0.06)'}`, flexShrink: 0 });
const categoryActionBtn = (ui, danger = false) => ({ width: 22, height: 22, borderRadius: 8, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(216,120,94,0.1)' : 'rgba(255,255,255,0.055)', border: `1px solid ${danger ? 'rgba(216,120,94,0.18)' : ui.border}`, color: danger ? '#D8785E' : ui.sub, cursor: 'pointer', flexShrink: 0, marginLeft: 2 });
const addCategoryChip = (ui, accent) => ({ minHeight: 40, padding: '8px 14px', borderRadius: 14, whiteSpace: 'nowrap', background: ui.cardSoft, color: accent.hue, border: `1px dashed ${accent.ring}`, fontSize: 13, fontWeight: 850, display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', flexShrink: 0, boxSizing: 'border-box' });

const configCard = (ui) => ({ background: `linear-gradient(145deg, ${ui.card}, ${ui.cardSoft})`, borderRadius: 20, padding: 16, border: `1px solid ${ui.border}`, boxShadow: ui.shadow, boxSizing: 'border-box' });
const cardLabel = (ui) => ({ color: ui.sub, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, marginTop: 0 });

const dateCard = (ui) => ({ ...configCard(ui), padding: 14, cursor: 'pointer', position: 'relative' });
const clearDateBtn = (ui) => ({ width: 24, height: 24, borderRadius: 999, border: 'none', background: ui.field, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 2, cursor: 'pointer' });

const eyeBtn = (ui) => ({ width: 26, height: 26, borderRadius: 9, background: ui.field, border: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 });
const restoreChip = (ui, accent) => ({ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '8px 12px', borderRadius: 12, background: accent.soft, border: `1px dashed ${accent.ring}`, color: accent.hue, fontSize: 12, fontWeight: 850, cursor: 'pointer' });

const dateParamGrid = () => ({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 });
const dateParamCard = (ui) => ({ ...configCard(ui), padding: 14, cursor: 'pointer', position: 'relative' });
const dateParamHead = () => ({ display: 'flex', alignItems: 'center', marginBottom: 12, minWidth: 0 });
const dateParamBody = (ui) => ({ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, minHeight: 42, padding: '9px 10px', borderRadius: 14, background: ui.field, border: `1px solid ${ui.border}`, overflow: 'hidden' });
const dateParamIcon = (accent) => ({ width: 30, height: 30, borderRadius: 10, color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 });
const dateParamValue = (ui, hasValue) => ({ color: hasValue ? ui.text : ui.sub, fontSize: 15, fontWeight: 950, minWidth: 0, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' });
const dateParamClear = (ui) => ({ width: 26, height: 26, borderRadius: 9, border: `1px solid ${ui.border}`, background: ui.field, color: ui.sub, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, position: 'relative', zIndex: 2 });
const dateParamInput = () => ({ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', border: 'none', background: 'transparent', pointerEvents: 'none' });

const scaleTrack = (ui) => ({ position: 'relative', height: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', background: ui.field, borderRadius: 999, border: `1px solid ${ui.border}` });
const scaleFill = (value, total, color) => ({ position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)', height: 4, width: `calc(${(value / (total - 1)) * 100}% - 8px)`, minWidth: 0, background: `linear-gradient(90deg, ${color}66, ${color})`, borderRadius: 999, transition: 'all 0.25s ease' });
const scaleNode = (active, current, color, ui) => ({
  position: 'relative', zIndex: 2, width: current ? 22 : 14, height: current ? 22 : 14, borderRadius: 999,
  background: active ? color : ui.cardSoft,
  border: `2px solid ${active ? color : ui.border}`,
  boxShadow: current ? `0 0 14px ${color}88` : 'none',
  cursor: 'pointer', transition: 'all 0.2s ease'
});
const scaleLabelRow = (ui) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, padding: '0 4px' });



const addSubRow = (ui) => ({ display: 'flex', alignItems: 'center', gap: 10 });
const subInput = (ui) => ({ flex: 1, minWidth: 0, minHeight: 42, borderRadius: 14, border: `1px solid ${ui.border}`, background: ui.field, color: ui.text, outline: 'none', padding: '0 14px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit' });
const addSubBtn = (ui, accent) => ({ width: 42, height: 42, borderRadius: 14, background: accent.soft, border: `1px solid ${accent.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 });
const subItem = (ui) => ({ minHeight: 44, borderRadius: 13, background: ui.field, border: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px' });
const subCheck = (ui, accent, done) => ({ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${done ? accent.hue : ui.border}`, background: done ? accent.hue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 });
const subText = (ui, done) => ({ flex: 1, minWidth: 0, color: done ? ui.sub : ui.text, textDecoration: done ? 'line-through' : 'none', fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' });
const subRemove = (ui) => ({ width: 30, height: 30, borderRadius: 9, background: 'rgba(216,120,94,0.1)', border: '1px solid rgba(216,120,94,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 });
const subDraftCard = (ui, accent, done) => ({ borderRadius: 15, background: ui.field, border: `1px solid ${done ? 'rgba(46,209,119,0.3)' : ui.border}`, overflow: 'hidden', boxShadow: done ? `0 0 18px rgba(46,209,119,0.08)` : 'none' });
const subDraftTop = () => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px' });
const subDraftTitleInput = (ui, done) => ({ width: '100%', border: 'none', outline: 'none', background: 'transparent', color: done ? ui.sub : ui.text, textDecoration: done ? 'line-through' : 'none', fontSize: 14, fontWeight: 850, fontFamily: 'inherit', padding: 0, margin: 0, minWidth: 0 });
const subDraftMetaRow = () => ({ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginTop: 6 });
const subDraftStatus = (ui, accent, done) => ({ display: 'inline-flex', alignItems: 'center', minHeight: 18, padding: '2px 7px', borderRadius: 999, background: done ? 'rgba(46,209,119,0.13)' : accent.soft, border: `1px solid ${done ? 'rgba(46,209,119,0.24)' : accent.ring}`, color: done ? '#2ed177' : accent.hue, fontSize: 9, fontWeight: 900, lineHeight: 1 });
const subDraftMetaChip = (ui) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, minHeight: 18, padding: '2px 7px', borderRadius: 999, background: ui.cardSoft, border: `1px solid ${ui.border}`, color: ui.sub, fontSize: 9, fontWeight: 850, lineHeight: 1 });
const subDraftAction = (ui) => ({ width: 28, height: 28, borderRadius: 10, background: ui.cardSoft, border: `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 });
const subDraftExpanded = (ui) => ({ padding: '0 12px 12px', borderTop: `1px solid ${ui.border}` });
const subDraftFieldLabel = (ui) => ({ display: 'flex', alignItems: 'center', gap: 6, color: ui.sub, fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '11px 0 7px' });
const subDraftFieldInput = (ui) => ({ width: '100%', minHeight: 46, borderRadius: 12, border: `1px solid ${ui.border}`, background: ui.cardSoft, color: ui.text, outline: 'none', resize: 'vertical', padding: '9px 10px', boxSizing: 'border-box', fontSize: 13, fontWeight: 650, fontFamily: 'inherit', lineHeight: 1.35 });
const subDraftFooter = () => ({ display: 'flex', alignItems: 'center', gap: 7, marginTop: 10 });
const subDraftFooterBtn = (ui, type) => {
  const danger = type === 'danger';
  const done = type === 'done';
  return {
    minHeight: 32,
    borderRadius: 11,
    border: `1px solid ${danger ? 'rgba(216,120,94,0.18)' : done ? 'rgba(46,209,119,0.24)' : ui.border}`,
    background: danger ? 'rgba(216,120,94,0.1)' : done ? 'rgba(46,209,119,0.12)' : ui.cardSoft,
    color: danger ? '#D8785E' : done ? '#2ed177' : ui.sub,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '0 10px',
    fontSize: 11,
    fontWeight: 900,
    cursor: 'pointer',
    flex: danger ? 0 : 1
  };
};
const subDraftIconBtn = (ui, disabled) => ({ width: 32, height: 32, borderRadius: 11, border: `1px solid ${ui.border}`, background: ui.cardSoft, color: ui.sub, opacity: disabled ? 0.34 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: disabled ? 'default' : 'pointer', flexShrink: 0 });

const advancedToggle = (ui) => ({ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px', background: ui.cardSoft, border: `1px solid ${ui.border}`, borderRadius: 16, color: ui.text, fontSize: 13, fontWeight: 800, marginTop: 16, cursor: 'pointer' });

const footerButtons = (ui) => ({
  display: 'flex', gap: 12, padding: '18px 0 calc(18px + env(safe-area-inset-bottom, 0px))',
  alignItems: 'center', position: 'sticky', bottom: 0, zIndex: 5, marginTop: 18,
  background: 'transparent'
});
const btnBase = { height: 60, borderRadius: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const btnCancel = (ui) => ({ ...btnBase, width: 60, background: '#FF3B30', border: `1px solid ${ui.border}` });
const btnSave = (ui, accent) => ({ ...btnBase, flex: 1, background: `linear-gradient(135deg, ${accent.hue}, ${accent.solidSoft})`, border: `1px solid ${accent.ring}`, boxShadow: `0 0 28px ${accent.glow}` });

// Bottom sheet
const overlayStyle = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 3000, display: 'flex', alignItems: 'flex-end' };
const dragHandle = { width: 45, height: 5, backgroundColor: '#8E8E93', borderRadius: 3, margin: '15px auto', opacity: 0.4 };
const iconSheet = (ui) => ({ width: '100%', maxHeight: '76vh', borderRadius: '34px 34px 0 0', overflow: 'hidden', borderTop: `1px solid ${ui.borderStrong}`, background: `linear-gradient(180deg, ${ui.card}, ${ui.cardSoft})` });
const textInput = (ui) => ({ width: '100%', border: `1px solid ${ui.border}`, background: ui.field, fontSize: 15, color: ui.text, outline: 'none', borderRadius: 16, padding: '14px 14px', boxSizing: 'border-box', fontFamily: 'inherit', fontWeight: 700 });
const iconItem = (active, ui, accent) => ({ aspectRatio: '1 / 1', borderRadius: 14, background: active ? accent.soft : ui.field, border: active ? `1px solid ${accent.ring}` : `1px solid ${ui.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' });
const modalCreateBtn = (ui, accent) => ({ width: '100%', padding: 14, borderRadius: 14, background: accent.soft, border: `1px solid ${accent.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 6 });
