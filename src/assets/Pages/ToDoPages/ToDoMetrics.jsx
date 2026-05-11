import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaCalendarDay,
  FaChartBar,
  FaCheckDouble,
  FaClock,
  FaFire,
  FaLayerGroup,
  FaListUl,
  FaRegCircle
} from 'react-icons/fa';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, theme$ } from '../../StaticClasses/HabitsBus';
import { buildTodoAccent, getTodoCategoryMeta, normalizeTodoCategory, TODO_SECTION_TOP } from './ToDoVisuals.js';

const PERIODS = [
  { key: 7, label: ['7 дней', '7 days'] },
  { key: 30, label: ['30 дней', '30 days'] },
  { key: 90, label: ['90 дней', '90 days'] },
  { key: 0, label: ['Всё', 'All'] }
];

const ToDoMetrics = () => {
  const [theme, setThemeState] = useState('dark');
  const [lang, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [periodDays, setPeriodDays] = useState(30);
  const accent = useMemo(() => buildTodoAccent(AppData.todoAccentColor || '#5F8DFF'), []);
  const s = styles(theme, accent, fSize);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      lang$.subscribe(l => setLangIndex(l === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  const stats = useMemo(() => {
    const list = AppData.todoList || [];
    const visible = list.filter(task => !task.isHidden);
    const now = new Date();
    const cutoff = periodDays > 0 ? new Date(now.getTime() - periodDays * 86400000) : null;
    cutoff?.setHours(0, 0, 0, 0);

    const inPeriod = (dateStr) => {
      if (!cutoff) return true;
      const d = parseDate(dateStr);
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return d >= cutoff;
    };

    const createdInPeriod = visible.filter(task => inPeriod(task.startDate));
    const completedInPeriod = visible.filter(task => task.isDone && inPeriod(task.completedAt || task.startDate));
    const active = visible.filter(task => !task.isDone && !task.isPending);
    const pending = visible.filter(task => task.isPending && !task.isDone);
    const overdue = visible.filter(task => !task.isDone && isDeadlinePassed(task.deadLine));
    const today = visible.filter(task => !task.isDone && isTodayTask(task));
    const noDeadline = visible.filter(task => !task.isDone && !task.deadLine);

    const totalForRate = createdInPeriod.length || visible.length;
    const completionRate = totalForRate ? Math.round((completedInPeriod.length / totalForRate) * 100) : 0;

    const durations = completedInPeriod
      .map(task => {
        const start = parseDate(task.startDate);
        const end = parseDate(task.completedAt);
        if (!start || !end) return null;
        return Math.max(0, (end - start) / 86400000);
      })
      .filter(value => value !== null);
    const avgDays = durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null;

    const categoriesMap = {};
    visible.forEach(task => {
      const date = task.completedAt || task.startDate;
      if (!inPeriod(date)) return;
      const key = normalizeTodoCategory(task.category || 'general');
      if (!categoriesMap[key]) categoriesMap[key] = { name: getTodoCategoryMeta(key, lang).labelText, total: 0, done: 0, active: 0 };
      categoriesMap[key].total += 1;
      if (task.isDone) categoriesMap[key].done += 1;
      else categoriesMap[key].active += 1;
    });
    const categories = Object.values(categoriesMap).sort((a, b) => b.total - a.total).slice(0, 6);

    const week = Array.from({ length: 7 }, (_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - idx));
      const key = dateKey(d);
      const created = visible.filter(task => dateKey(parseDate(task.startDate)) === key).length;
      const done = visible.filter(task => task.isDone && dateKey(parseDate(task.completedAt || task.startDate)) === key).length;
      return {
        key,
        label: d.toLocaleDateString(lang === 0 ? 'ru-RU' : 'en-US', { weekday: 'short' }).slice(0, 2),
        created,
        done
      };
    });
    const maxWeek = Math.max(1, ...week.map(day => Math.max(day.created, day.done)));

    const nextDeadlines = visible
      .filter(task => !task.isDone && task.deadLine)
      .sort((a, b) => daysToDeadlineNum(a.deadLine) - daysToDeadlineNum(b.deadLine))
      .slice(0, 3);

    return {
      total: visible.length,
      active: active.length,
      pending: pending.length,
      overdue: overdue.length,
      today: today.length,
      noDeadline: noDeadline.length,
      hidden: list.filter(task => task.isHidden).length,
      completed: completedInPeriod.length,
      created: createdInPeriod.length,
      completionRate,
      avgDays,
      categories,
      week,
      maxWeek,
      nextDeadlines
    };
  }, [periodDays, lang]);

  const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  return (
    <div style={s.container}>
      <motion.div
        style={s.scroll}
        className="no-scrollbar"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.055 } } }}
      >
        <ToDoMetricsPageHeader theme={theme} fSize={fSize} langIndex={lang} />
        <motion.section variants={itemV} style={s.hero}>
          <div style={s.heroTop}>
            <div style={s.heroIcon}><FaChartBar /></div>
            <div style={{ minWidth: 0 }}>
              <div style={s.eyebrow}>{lang === 0 ? 'АНАЛИТИКА' : 'ANALYTICS'}</div>
              <h1 style={s.title}>{lang === 0 ? 'Задачи' : 'Tasks'}</h1>
            </div>
          </div>
          <div style={s.periodRow}>
            {PERIODS.map(period => {
              const active = period.key === periodDays;
              return (
                <button key={period.key} type="button" onClick={() => setPeriodDays(period.key)} style={s.periodChip(active)}>
                  {period.label[lang]}
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section variants={itemV} style={s.summaryGrid}>
          <MetricCard icon={<FaCheckDouble />} label={lang === 0 ? 'Выполнено' : 'Completed'} value={`${stats.completionRate}%`} sub={`${stats.completed}/${Math.max(stats.created, stats.completed)}`} theme={theme} accent={accent} />
          <MetricCard icon={<FaListUl />} label={lang === 0 ? 'В работе' : 'Active'} value={stats.active} sub={lang === 0 ? 'активных' : 'active'} theme={theme} accent={accent} />
          <MetricCard icon={<FaFire />} label={lang === 0 ? 'Просрочено' : 'Overdue'} value={stats.overdue} sub={lang === 0 ? 'требуют внимания' : 'need focus'} theme={theme} accent={accent} danger={stats.overdue > 0} />
          <MetricCard icon={<FaClock />} label={lang === 0 ? 'Средний срок' : 'Avg time'} value={formatAvg(stats.avgDays, lang)} sub={lang === 0 ? 'до выполнения' : 'to complete'} theme={theme} accent={accent} />
        </motion.section>

        <motion.section variants={itemV} style={s.focusPanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Фокус' : 'Focus'}</div>
              <div style={s.panelSub}>{lang === 0 ? 'Что важно прямо сейчас' : 'What matters now'}</div>
            </div>
            <div style={s.totalPill}>{stats.total}</div>
          </div>
          <FocusRow icon={<FaCalendarDay />} label={lang === 0 ? 'На сегодня' : 'Today'} value={stats.today} theme={theme} accent={accent} />
          <FocusRow icon={<FaRegCircle />} label={lang === 0 ? 'Без срока' : 'No deadline'} value={stats.noDeadline} theme={theme} accent={accent} />
          <FocusRow icon={<FaClock />} label={lang === 0 ? 'Отложено' : 'Pending'} value={stats.pending} theme={theme} accent={accent} />
        </motion.section>

        <motion.section variants={itemV} style={s.chartPanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Динамика недели' : 'Weekly flow'}</div>
              <div style={s.panelSub}>{lang === 0 ? 'Создано и выполнено' : 'Created and completed'}</div>
            </div>
          </div>
          <div style={s.weekChart}>
            {stats.week.map(day => (
              <div key={day.key} style={s.weekColumn}>
                <div style={s.barStack}>
                  <motion.span initial={{ height: 0 }} animate={{ height: `${(day.created / stats.maxWeek) * 100}%` }} style={s.createdBar} />
                  <motion.span initial={{ height: 0 }} animate={{ height: `${(day.done / stats.maxWeek) * 100}%` }} style={s.doneBar} />
                </div>
                <div style={s.weekLabel}>{day.label}</div>
              </div>
            ))}
          </div>
          <div style={s.legend}>
            <span><i style={{ background: accent.hue }} />{lang === 0 ? 'Выполнено' : 'Done'}</span>
            <span><i style={{ background: accent.soft, border: `1px solid ${accent.ring}` }} />{lang === 0 ? 'Создано' : 'Created'}</span>
          </div>
        </motion.section>

        <motion.section variants={itemV} style={s.categoriesPanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Категории' : 'Categories'}</div>
              <div style={s.panelSub}>{lang === 0 ? 'Баланс нагрузки' : 'Workload balance'}</div>
            </div>
            <FaLayerGroup color={accent.hue} />
          </div>
          {stats.categories.length === 0 ? (
            <div style={s.empty}>{lang === 0 ? 'Нет данных за период' : 'No data for period'}</div>
          ) : (
            <div style={s.categoryList}>
              {stats.categories.map(category => {
                const pct = category.total ? Math.round((category.done / category.total) * 100) : 0;
                return (
                  <div key={category.name} style={s.categoryRow}>
                    <div style={s.categoryInfo}>
                      <span style={s.categoryName}>{category.name}</span>
                      <span style={s.categoryCount}>{category.done}/{category.total}</span>
                    </div>
                    <div style={s.categoryTrack}>
                      <motion.span initial={{ width: 0 }} animate={{ width: `${pct}%` }} style={s.categoryFill} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        <motion.section variants={itemV} style={s.deadlinePanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Ближайшие сроки' : 'Next deadlines'}</div>
              <div style={s.panelSub}>{lang === 0 ? 'Активные задачи по времени' : 'Active tasks by time'}</div>
            </div>
          </div>
          {stats.nextDeadlines.length === 0 ? (
            <div style={s.empty}>{lang === 0 ? 'Нет задач со сроком' : 'No tasks with deadline'}</div>
          ) : (
            <div style={s.deadlineList}>
              {stats.nextDeadlines.map(task => (
                <div key={task.id || task.name} style={s.deadlineRow}>
                  <div style={s.deadlineDot(isDeadlinePassed(task.deadLine))} />
                  <div style={s.deadlineName}>{task.name}</div>
                  <div style={s.deadlineValue}>{getDeadlineText(task.deadLine, lang)}</div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        <div style={{ height: 120 }} />
      </motion.div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, sub, theme, accent, danger }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.metricCard(danger)}>
      <div style={s.metricIcon(danger)}>{icon}</div>
      <div style={s.metricValue}>{value}</div>
      <div style={s.metricLabel}>{label}</div>
      <div style={s.metricSub}>{sub}</div>
    </div>
  );
};

const FocusRow = ({ icon, label, value, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.focusRow}>
      <div style={s.focusIcon}>{icon}</div>
      <div style={s.focusLabel}>{label}</div>
      <div style={s.focusValue}>{value}</div>
    </div>
  );
};

const ToDoMetricsPageHeader = ({ theme, fSize, langIndex }) => {
  const s = styles(theme, buildTodoAccent(AppData.todoAccentColor || '#5F8DFF'), fSize);
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

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.045)';
  const panelStrong = isLight ? 'rgba(255,255,255,0.96)' : 'rgba(18,21,25,0.9)';

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
    scroll: { height: '100%', overflowY: 'auto', padding: `${TODO_SECTION_TOP} 18px 150px`, boxSizing: 'border-box' },
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
      borderRadius: 26,
      padding: 16,
      background: `radial-gradient(260px 180px at 100% 0%, ${accent.soft} 0%, transparent 68%), ${panel}`,
      border: `1px solid ${border}`,
      boxShadow: isLight ? '0 18px 50px rgba(15,23,42,0.08)' : '0 22px 65px rgba(0,0,0,0.36)',
      backdropFilter: 'blur(18px)'
    },
    heroTop: { display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 },
    heroIcon: { width: 52, height: 52, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}`, fontSize: 22, flexShrink: 0 },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, letterSpacing: 1.7 },
    title: { margin: '3px 0 0', color: text, fontSize: fSize === 0 ? 30 : 32, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
    periodRow: { display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 8 },
    periodChip: (active) => ({ minHeight: 38, borderRadius: 14, border: `1px solid ${active ? accent.ring : border}`, background: active ? accent.soft : 'transparent', color: active ? accent.hue : sub, fontSize: 11, fontWeight: 950, fontFamily: 'inherit' }),
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginTop: 12 },
    metricCard: (danger) => ({ minHeight: 138, borderRadius: 22, padding: 14, background: panelStrong, border: `1px solid ${danger ? 'rgba(233,95,95,0.34)' : border}`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }),
    metricIcon: (danger) => ({ width: 38, height: 38, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: danger ? 'rgba(233,95,95,0.13)' : accent.soft, color: danger ? '#E95F5F' : accent.hue, border: `1px solid ${danger ? 'rgba(233,95,95,0.26)' : accent.ring}` }),
    metricValue: { color: text, fontSize: 29, fontWeight: 950, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
    metricLabel: { color: text, fontSize: 13, fontWeight: 900 },
    metricSub: { color: sub, fontSize: 11, fontWeight: 750 },
    focusPanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
    panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 13 },
    panelTitle: { color: text, fontSize: 18, fontWeight: 950 },
    panelSub: { color: sub, fontSize: 12, fontWeight: 750, marginTop: 2 },
    totalPill: { minWidth: 42, height: 34, borderRadius: 999, background: accent.soft, border: `1px solid ${accent.ring}`, color: accent.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 950 },
    focusRow: { minHeight: 46, display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) 38px', alignItems: 'center', gap: 10, borderTop: `1px solid ${border}` },
    focusIcon: { width: 28, height: 28, borderRadius: 10, background: accent.soft, color: accent.hue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 },
    focusLabel: { color: text, fontSize: 14, fontWeight: 850, minWidth: 0 },
    focusValue: { color: accent.hue, fontSize: 17, fontWeight: 950, textAlign: 'right' },
    chartPanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
    weekChart: { height: 170, display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 9, alignItems: 'end', paddingTop: 8 },
    weekColumn: { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
    barStack: { position: 'relative', width: '100%', maxWidth: 30, height: 126, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)', overflow: 'hidden' },
    createdBar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderRadius: 999, background: accent.soft, border: `1px solid ${accent.ring}`, boxSizing: 'border-box' },
    doneBar: { position: 'absolute', left: 4, right: 4, bottom: 0, borderRadius: 999, background: accent.hue, boxShadow: `0 0 18px ${accent.glow}` },
    weekLabel: { color: sub, fontSize: 10, fontWeight: 900, textTransform: 'uppercase' },
    legend: { display: 'flex', gap: 12, marginTop: 12, color: sub, fontSize: 11, fontWeight: 800 },
    categoriesPanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
    categoryList: { display: 'flex', flexDirection: 'column', gap: 13 },
    categoryRow: {},
    categoryInfo: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 7 },
    categoryName: { color: text, fontSize: 14, fontWeight: 850, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    categoryCount: { color: accent.hue, fontSize: 12, fontWeight: 950 },
    categoryTrack: { height: 9, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)', overflow: 'hidden' },
    categoryFill: { display: 'block', height: '100%', borderRadius: 999, background: accent.hue, boxShadow: `0 0 14px ${accent.glow}` },
    deadlinePanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, backdropFilter: 'blur(18px)' },
    deadlineList: { display: 'flex', flexDirection: 'column', gap: 9 },
    deadlineRow: { minHeight: 42, display: 'grid', gridTemplateColumns: '10px minmax(0, 1fr) auto', alignItems: 'center', gap: 10, borderRadius: 15, padding: '0 10px', background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)' },
    deadlineDot: (danger) => ({ width: 8, height: 8, borderRadius: 999, background: danger ? '#E95F5F' : accent.hue }),
    deadlineName: { color: text, fontSize: 13, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    deadlineValue: { color: sub, fontSize: 11, fontWeight: 850 },
    empty: { minHeight: 78, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, fontSize: 13, fontWeight: 800, textAlign: 'center' }
  };
};

function parseDate(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return isNaN(dateStr) ? null : dateStr;
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
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
  return dateKey(parseDate(task.deadLine)) === today || dateKey(parseDate(task.startDate)) === today;
}

function getDeadlineText(dateStr, lang) {
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

function formatAvg(days, lang) {
  if (days === null || days === undefined) return '—';
  if (days < 1) {
    const hours = Math.max(1, Math.round(days * 24));
    return lang === 0 ? `${hours} ч` : `${hours}h`;
  }
  return lang === 0 ? `${days.toFixed(1)} дн` : `${days.toFixed(1)}d`;
}

export default ToDoMetrics;
