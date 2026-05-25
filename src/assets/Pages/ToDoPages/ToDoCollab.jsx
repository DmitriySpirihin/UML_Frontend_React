import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaLock, FaTools } from 'react-icons/fa';
import { AppData } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import { buildTodoAccent, TODO_SECTION_TOP } from './ToDoVisuals.js';

const ToDoCollab = () => {
  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);
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

  return (
    <div style={s.container}>
      <motion.div style={s.scroll} className="no-scrollbar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={s.pageHeader}>
          <div style={s.pageTitle}>UltyMyLife</div>
          <div style={s.pageSubtitle}>{lang === 0 ? 'План на день - шаг к цели' : 'Today plan, tomorrow progress'}</div>
        </div>

        <section style={s.closedPanel}>
          <div style={s.heroIcon}><FaLock /></div>
          <div style={s.eyebrow}>{lang === 0 ? 'РАЗДЕЛ ЗАКРЫТ' : 'SECTION CLOSED'}</div>
          <h1 style={s.title}>{lang === 0 ? 'Совместные задачи на доработке' : 'Shared tasks are being improved'}</h1>
          <div style={s.heroText}>
            {lang === 0
              ? 'Пока убрали этот раздел из меню, чтобы не показывать недоделанную механику.'
              : 'This section is hidden from the menu while the shared workflow is being finished.'}
          </div>
          <button type="button" onClick={() => setPage('ToDoMain')} style={s.backButton}>
            <FaTools />
            {lang === 0 ? 'Вернуться к задачам' : 'Back to tasks'}
          </button>
        </section>
      </motion.div>
    </div>
  );
};

const styles = (theme, accent, fSize = 0) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  const panel = isLight
    ? 'linear-gradient(145deg, rgba(255,255,255,0.76), rgba(255,255,255,0.42))'
    : 'linear-gradient(145deg, rgba(255,255,255,0.074), rgba(255,255,255,0.028))';
  const glassShadow = isLight
    ? '0 1px 0 rgba(255,255,255,0.78) inset, 0 18px 40px -30px rgba(15,23,42,0.18)'
    : '0 1px 0 rgba(255,255,255,0.09) inset, 0 20px 44px -28px rgba(0,0,0,0.62)';

  return {
    container: { width: '100vw', height: '100vh', overflow: 'hidden', background: isLight ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.16), transparent 62%), radial-gradient(520px 380px at 6% 86%, rgba(${accent.rgbText},0.1), transparent 66%), #F4F5F7` : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgbText},0.15), transparent 62%), radial-gradient(520px 420px at 8% 86%, rgba(${accent.rgbText},0.1), transparent 68%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 46%, #10161A 100%)`, color: text, fontFamily: 'inherit' },
    scroll: { height: '100%', overflowY: 'auto', padding: `${TODO_SECTION_TOP} 18px 150px`, boxSizing: 'border-box' },
    pageHeader: { width: '100%', margin: '0 auto 8px', padding: '4px 18px 8px', boxSizing: 'border-box', textAlign: 'center' },
    pageTitle: { color: text, fontFamily: 'inherit', fontSize: 24, fontWeight: 700, letterSpacing: 0, lineHeight: 1.05, opacity: 0.86 },
    pageSubtitle: { marginTop: 5, color: sub, fontSize: fSize === 0 ? 8 : 9, fontWeight: 600, letterSpacing: '0.14em', opacity: 0.82 },
    closedPanel: { minHeight: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 28, padding: '28px 18px', textAlign: 'center', background: `radial-gradient(280px 160px at 50% 0%, ${accent.soft}, transparent 72%), ${panel}`, border: `1px solid ${border}`, boxShadow: glassShadow, backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)' },
    heroIcon: { width: 58, height: 58, borderRadius: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}`, fontSize: 22, flexShrink: 0 },
    eyebrow: { color: accent.hue, fontSize: 11, fontWeight: 950, letterSpacing: 1.5 },
    title: { margin: '3px 0 0', color: text, fontSize: fSize === 0 ? 27 : 29, lineHeight: 1.05, fontWeight: 950, letterSpacing: 0 },
    heroText: { maxWidth: 300, marginTop: 2, color: sub, fontSize: 13, fontWeight: 750, lineHeight: 1.4 },
    backButton: { minHeight: 46, marginTop: 8, borderRadius: 16, border: `1px solid ${accent.ring}`, background: accent.soft, color: accent.hue, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, padding: '0 16px', fontSize: 13, fontWeight: 900, fontFamily: 'inherit', cursor: 'pointer' },
    invitePanel: { marginTop: 14, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, boxShadow: glassShadow, backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)' },
    taskPanel: { marginTop: 12, borderRadius: 24, padding: 15, background: panel, border: `1px solid ${border}`, boxShadow: glassShadow, backdropFilter: 'blur(26px) saturate(170%)', WebkitBackdropFilter: 'blur(26px) saturate(170%)' },
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
