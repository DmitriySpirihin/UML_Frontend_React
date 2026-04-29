import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarDay, FaCheckCircle, FaClock, FaFire, FaMagic, FaRobot } from 'react-icons/fa';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, theme$ } from '../../StaticClasses/HabitsBus';
import { buildTodoAccent, TODO_SECTION_TOP } from './ToDoVisuals.js';

const ToDoInsight = () => {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const accent = useMemo(() => buildTodoAccent(AppData.todoAccentColor || '#8FA6C8'), []);
  const s = styles(theme, accent, fSize);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setTheme),
      lang$.subscribe(value => setLang(value === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  const stats = useMemo(() => buildInsightStats(), []);
  const insight = buildInsightText(stats, lang);

  return (
    <div style={s.container}>
      <motion.div style={s.scroll} className="no-scrollbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={s.pageHeader}>
          <div style={s.pageTitle}>UltyMyLife</div>
          <div style={s.pageSubtitle}>{lang === 0 ? 'План на день - шаг к цели' : 'Today plan, tomorrow progress'}</div>
        </div>

        <section style={s.hero}>
          <div style={s.heroIcon}><FaRobot /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={s.eyebrow}>{lang === 0 ? 'ИИ АНАЛИЗ' : 'AI ANALYSIS'}</div>
            <h1 style={s.title}>{lang === 0 ? 'Разбор задач' : 'Task review'}</h1>
            <div style={s.heroText}>{insight.headline}</div>
          </div>
        </section>

        <div style={s.grid}>
          <Stat icon={<FaCalendarDay />} label={lang === 0 ? 'Сегодня' : 'Today'} value={stats.today} theme={theme} accent={accent} />
          <Stat icon={<FaClock />} label={lang === 0 ? 'В работе' : 'Active'} value={stats.active} theme={theme} accent={accent} />
          <Stat icon={<FaCheckCircle />} label={lang === 0 ? 'Готово' : 'Done'} value={`${stats.doneRate}%`} theme={theme} accent={accent} />
        </div>

        <InsightCard icon={<FaMagic />} title={lang === 0 ? 'Коротко' : 'Summary'} text={insight.summary} theme={theme} accent={accent} />
        <InsightCard icon={<FaFire />} title={lang === 0 ? 'Риск' : 'Risk'} text={insight.risk} theme={theme} accent={accent} danger={stats.overdue > 0} />
        <InsightCard icon={<FaCheckCircle />} title={lang === 0 ? 'Следующий шаг' : 'Next step'} text={insight.next} theme={theme} accent={accent} />
      </motion.div>
    </div>
  );
};

const Stat = ({ icon, label, value, theme, accent }) => {
  const s = styles(theme, accent);
  return (
    <div style={s.statCard}>
      <div style={s.statIcon}>{icon}</div>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
};

const InsightCard = ({ icon, title, text, theme, accent, danger }) => {
  const s = styles(theme, accent);
  return (
    <section style={s.insightCard(danger)}>
      <div style={s.insightIcon(danger)}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div style={s.cardTitle}>{title}</div>
        <div style={s.cardText}>{text}</div>
      </div>
    </section>
  );
};

function buildInsightStats() {
  const list = (AppData.todoList || []).filter(task => !task.isHidden);
  const todayKey = dateKey(new Date());
  const active = list.filter(task => !task.isDone && !task.isPending);
  const done = list.filter(task => task.isDone);
  const today = active.filter(task => dateKey(parseDate(task.deadLine)) === todayKey || dateKey(parseDate(task.startDate)) === todayKey);
  const overdue = active.filter(task => daysToDeadlineNum(task.deadLine) < 0);
  const high = active.filter(task => (task.priority || 0) >= 3 || (task.urgency || 0) >= 3);
  return {
    total: list.length,
    active: active.length,
    done: done.length,
    today: today.length,
    overdue: overdue.length,
    high: high.length,
    doneRate: list.length ? Math.round((done.length / list.length) * 100) : 0
  };
}

function buildInsightText(stats, lang) {
  if (lang === 0) {
    return {
      headline: stats.total === 0 ? 'Данных пока мало, но структура готова.' : `${stats.active} активных, ${stats.today} на сегодня, ${stats.overdue} просрочено.`,
      summary: stats.total === 0 ? 'Добавь несколько задач с датами и приоритетом, тогда анализ станет полезнее.' : `Сейчас лучше держать фокус на ${Math.max(stats.today, stats.high, 1)} ближайших задачах, не распыляясь на весь список.`,
      risk: stats.overdue > 0 ? `Есть ${stats.overdue} просроченных задач. Их стоит либо закрыть, либо честно перенести.` : 'Критичных просрочек нет. Основной риск - набрать слишком много активных задач без срока.',
      next: stats.today > 0 ? 'Начни с задачи на сегодня с самым высоким приоритетом, затем проверь отложенные.' : 'Выбери одну активную задачу и назначь ей срок, чтобы день получил понятный центр.'
    };
  }
  return {
    headline: stats.total === 0 ? 'Not enough data yet, but the structure is ready.' : `${stats.active} active, ${stats.today} today, ${stats.overdue} overdue.`,
    summary: stats.total === 0 ? 'Add a few tasks with dates and priority to make analysis useful.' : `Keep focus on ${Math.max(stats.today, stats.high, 1)} nearest tasks instead of the full list.`,
    risk: stats.overdue > 0 ? `${stats.overdue} tasks are overdue. Close them or reschedule honestly.` : 'No critical overdue tasks. Main risk is too many active tasks without deadlines.',
    next: stats.today > 0 ? 'Start with the highest-priority task for today, then review pending items.' : 'Pick one active task and give it a deadline to center the day.'
  };
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date) ? null : date;
}

function dateKey(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function daysToDeadlineNum(dateStr) {
  const date = parseDate(dateStr);
  if (!date) return 9999;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date - now) / 86400000);
}

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.045)';

  return {
    container: { width: '100vw', height: '100vh', overflow: 'hidden', background: isLight ? `linear-gradient(180deg, ${accent.faint} 0%, ${Colors.get('background', theme)} 42%)` : `linear-gradient(180deg, rgba(${accent.rgbText},0.11) 0%, ${Colors.get('background', theme)} 44%)`, color: text, fontFamily: 'Segoe UI, sans-serif' },
    scroll: { height: '100%', overflowY: 'auto', padding: `${TODO_SECTION_TOP} 18px 150px`, boxSizing: 'border-box' },
    pageHeader: { width: '100%', margin: '0 auto 8px', padding: '4px 18px 8px', boxSizing: 'border-box', textAlign: 'center' },
    pageTitle: { color: text, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: fSize === 0 ? 24 : 26, fontWeight: 700, letterSpacing: 0, lineHeight: 1.05, opacity: 0.86 },
    pageSubtitle: { marginTop: 5, color: sub, fontSize: fSize === 0 ? 8 : 9, fontWeight: 600, letterSpacing: '0.14em', opacity: 0.82 },
    hero: { display: 'flex', alignItems: 'center', gap: 14, borderRadius: 26, padding: 16, background: isLight ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${accent.faint})` : `radial-gradient(260px 150px at 0% 0%, ${accent.soft}, transparent 72%), rgba(20,23,25,0.92)`, border: `1px solid ${border}`, boxShadow: isLight ? '0 12px 28px -24px rgba(0,0,0,0.22)' : '0 14px 34px -28px rgba(0,0,0,0.72)' },
    heroIcon: { width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}`, fontSize: 22, flexShrink: 0 },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, letterSpacing: 1.5 },
    title: { margin: '3px 0 0', color: text, fontSize: fSize === 0 ? 28 : 30, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
    heroText: { marginTop: 7, color: sub, fontSize: 12, fontWeight: 750, lineHeight: 1.35 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginTop: 14 },
    statCard: { minHeight: 90, borderRadius: 20, padding: 10, background: panel, border: `1px solid ${border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
    statIcon: { color: accent.hue, fontSize: 16 },
    statValue: { marginTop: 8, color: text, fontSize: 22, fontWeight: 950, lineHeight: 1 },
    statLabel: { marginTop: 6, color: sub, fontSize: 10, fontWeight: 900, textAlign: 'center' },
    insightCard: (danger) => ({ display: 'flex', gap: 13, marginTop: 12, borderRadius: 22, padding: 15, background: panel, border: `1px solid ${danger ? 'rgba(233,95,95,0.28)' : border}` }),
    insightIcon: (danger) => ({ width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: danger ? '#E95F5F' : accent.hue, background: danger ? 'rgba(233,95,95,0.13)' : accent.soft, border: `1px solid ${danger ? 'rgba(233,95,95,0.26)' : accent.ring}`, flexShrink: 0 }),
    cardTitle: { color: text, fontSize: 16, fontWeight: 950 },
    cardText: { marginTop: 7, color: sub, fontSize: 13, fontWeight: 750, lineHeight: 1.42 }
  };
};

export default ToDoInsight;
