import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaCopy, FaLink, FaShareAlt, FaUserFriends, FaUsers } from 'react-icons/fa';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, theme$ } from '../../StaticClasses/HabitsBus';
import { buildTodoAccent, TODO_SECTION_TOP } from './ToDoVisuals.js';

const ToDoCollab = () => {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
  const [copied, setCopied] = useState(false);
  const accent = useMemo(() => buildTodoAccent(AppData.todoAccentColor || '#149DFF'), []);
  const s = styles(theme, accent, fSize);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setTheme),
      lang$.subscribe(value => setLang(value === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  const tasks = useMemo(() => (AppData.todoList || []).filter(task => !task.isDone && !task.isHidden).slice(0, 5), []);
  const invite = useMemo(() => buildInvite(tasks), [tasks]);

  const copyInvite = async () => {
    try {
      await navigator.clipboard?.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  const shareInvite = () => {
    const text = encodeURIComponent(invite);
    const url = `https://t.me/share/url?url=&text=${text}`;
    if (window.Telegram?.WebApp?.openTelegramLink) window.Telegram.WebApp.openTelegramLink(url);
    else window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={s.container}>
      <motion.div style={s.scroll} className="no-scrollbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={s.pageHeader}>
          <div style={s.pageTitle}>UltyMyLife</div>
          <div style={s.pageSubtitle}>{lang === 0 ? 'План на день - шаг к цели' : 'Today plan, tomorrow progress'}</div>
        </div>

        <section style={s.hero}>
          <div style={s.heroIcon}><FaUserFriends /></div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={s.eyebrow}>{lang === 0 ? 'СОВМЕСТНО' : 'TOGETHER'}</div>
            <h1 style={s.title}>{lang === 0 ? 'Выполнение задач' : 'Shared execution'}</h1>
            <div style={s.heroText}>
              {lang === 0
                ? 'Без backend это работает как приглашение: человек получает список и контекст, а синхронное состояние можно будет подключить позже.'
                : 'Without a backend this works as an invite: a person gets the list and context, while live sync can be added later.'}
            </div>
          </div>
        </section>

        <section style={s.invitePanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Приглашение' : 'Invite'}</div>
              <div style={s.panelSub}>{lang === 0 ? `${tasks.length} активных задач` : `${tasks.length} active tasks`}</div>
            </div>
            <div style={s.panelIcon}><FaLink /></div>
          </div>
          <div style={s.inviteBox}>{invite}</div>
          <div style={s.actionGrid}>
            <button type="button" onClick={copyInvite} style={s.actionButton(copied)}>
              {copied ? <FaCheck /> : <FaCopy />}
              {copied ? (lang === 0 ? 'Скопировано' : 'Copied') : (lang === 0 ? 'Копировать' : 'Copy')}
            </button>
            <button type="button" onClick={shareInvite} style={s.actionButton(false)}>
              <FaShareAlt />
              {lang === 0 ? 'Отправить' : 'Share'}
            </button>
          </div>
        </section>

        <section style={s.taskPanel}>
          <div style={s.panelHeader}>
            <div>
              <div style={s.panelTitle}>{lang === 0 ? 'Что отправится' : 'Included'}</div>
              <div style={s.panelSub}>{lang === 0 ? 'Название, срок и чек-лист' : 'Name, deadline, checklist'}</div>
            </div>
            <FaUsers color={accent.hue} />
          </div>
          {tasks.length === 0 ? (
            <div style={s.empty}>{lang === 0 ? 'Нет активных задач для приглашения' : 'No active tasks to invite to'}</div>
          ) : (
            tasks.map(task => (
              <div key={task.id} style={s.taskRow}>
                <span style={s.taskDot} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={s.taskName}>{task.name}</div>
                  <div style={s.taskMeta}>{task.deadLine || (lang === 0 ? 'без срока' : 'no deadline')}</div>
                </div>
                <div style={s.taskCount}>{task.goals?.length || 0}</div>
              </div>
            ))
          )}
        </section>
      </motion.div>
    </div>
  );
};

function buildInvite(tasks) {
  const lines = tasks.map((task, index) => {
    const deadline = task.deadLine ? `, срок: ${task.deadLine}` : '';
    const goals = task.goals?.length ? `, шагов: ${task.goals.length}` : '';
    return `${index + 1}. ${task.name}${deadline}${goals}`;
  });
  return `UltyMyLife совместные задачи\n${lines.length ? lines.join('\n') : 'Список пока пуст'}\nКод: UML-${Date.now().toString(36).toUpperCase()}`;
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
    hero: { display: 'flex', alignItems: 'center', gap: 14, borderRadius: 26, padding: 16, background: isLight ? `linear-gradient(145deg, rgba(255,255,255,0.96), ${accent.faint})` : `radial-gradient(260px 150px at 0% 0%, ${accent.soft}, transparent 72%), rgba(20,23,25,0.92)`, border: `1px solid ${border}` },
    heroIcon: { width: 54, height: 54, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}`, fontSize: 22, flexShrink: 0 },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, letterSpacing: 1.5 },
    title: { margin: '3px 0 0', color: text, fontSize: fSize === 0 ? 27 : 29, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
    heroText: { marginTop: 7, color: sub, fontSize: 12, fontWeight: 750, lineHeight: 1.35 },
    invitePanel: { marginTop: 14, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}` },
    taskPanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}` },
    panelHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
    panelTitle: { color: text, fontSize: 18, fontWeight: 950 },
    panelSub: { color: sub, fontSize: 12, fontWeight: 750, marginTop: 2 },
    panelIcon: { width: 38, height: 38, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accent.soft, color: accent.hue, border: `1px solid ${accent.ring}` },
    inviteBox: { whiteSpace: 'pre-wrap', borderRadius: 18, padding: 13, background: isLight ? 'rgba(15,23,42,0.035)' : 'rgba(0,0,0,0.14)', border: `1px solid ${border}`, color: sub, fontSize: 12, fontWeight: 750, lineHeight: 1.45 },
    actionGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginTop: 12 },
    actionButton: (active) => ({ minHeight: 44, borderRadius: 16, border: `1px solid ${active ? accent.ring : border}`, background: active ? accent.soft : 'transparent', color: active ? accent.hue : text, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13, fontWeight: 900, fontFamily: 'inherit', outline: 'none' }),
    taskRow: { minHeight: 56, display: 'flex', alignItems: 'center', gap: 12, borderTop: `1px solid ${border}` },
    taskDot: { width: 8, height: 8, borderRadius: 999, background: accent.hue, boxShadow: `0 0 12px ${accent.glow}`, flexShrink: 0 },
    taskName: { color: text, fontSize: 14, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    taskMeta: { color: sub, fontSize: 11, fontWeight: 750, marginTop: 2 },
    taskCount: { minWidth: 34, height: 28, borderRadius: 999, background: accent.soft, color: accent.hue, border: `1px solid ${accent.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 950 },
    empty: { minHeight: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub, fontSize: 13, fontWeight: 800, textAlign: 'center' }
  };
};

export default ToDoCollab;
