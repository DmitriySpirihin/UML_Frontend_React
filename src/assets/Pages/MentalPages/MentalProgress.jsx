import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  FaBrain,
  FaBullseye,
  FaCalculator,
  FaChartLine,
  FaMedal,
  FaPuzzlePiece
} from 'react-icons/fa';
import { AppData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, theme$ } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';
import { buildSectionAccent } from '../SectionAccentSettings.jsx';

const MENTAL_ACCENT = '#A66BFF';
const EASE = [0.2, 0.8, 0.2, 1];

const MODE_TONES = [
  { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)', Icon: FaCalculator },
  { hue: '#A66BFF', soft: 'rgba(166,107,255,0.18)', ring: 'rgba(166,107,255,0.38)', Icon: FaBrain },
  { hue: '#2FD6BD', soft: 'rgba(47,214,189,0.16)', ring: 'rgba(47,214,189,0.34)', Icon: FaPuzzlePiece },
  { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.26)', Icon: FaBullseye }
];

export default function MentalProgress() {
  const [theme, setThemeState] = useState('dark');
  const [langIndex, setLangIndex] = useState(AppData.prefs[0]);
  const [fSize, setFSize] = useState(AppData.prefs[4]);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  useEffect(() => { logSectionVisit('mental'); }, []);

  const summary = useMemo(() => buildMentalSummary(), []);
  const s = styles(theme, fSize);
  const labels = langIndex === 0
    ? ['Быстрый счет', 'N-back', 'Паттерны', 'Контроль']
    : ['Mental Math', 'Memory', 'Logic', 'Focus'];

  return (
    <div style={s.container}>
      <HoverInfoButton tab="MentalMain" variant="subtle" accent={s.accent.hue} />
      <div style={s.scrollView} className="no-scrollbar">
        <div style={s.header}>
          <div style={s.eyebrow}>{langIndex === 0 ? 'Прогресс ума' : 'Mind progress'}</div>
          <h1 style={s.title}>{langIndex === 0 ? 'Общий прогресс' : 'Overall progress'}</h1>
          <p style={s.subtitle}>{langIndex === 0 ? 'Рекорды по режимам без перегруза основного экрана' : 'Mode records without crowding the main screen'}</p>
        </div>

        <Motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} style={s.totalPanel}>
          <div style={s.totalIcon}><FaMedal /></div>
          <div style={s.totalCopy}>
            <span>{langIndex === 0 ? 'Сумма рекордов' : 'Combined records'}</span>
            <strong>{formatScore(summary.totalScore)}</strong>
          </div>
          <div style={s.totalMeta}>
            <FaChartLine size={13} />
            <span>{summary.trainedDays} {langIndex === 0 ? 'дн.' : 'days'}</span>
          </div>
        </Motion.section>

        <section style={s.progressRows}>
          {labels.map((label, index) => {
            const tone = MODE_TONES[index];
            const Icon = tone.Icon;
            const value = summary.categoryScores[index] || 0;
            const progress = summary.maxCategoryScore > 0 ? Math.max(0.04, Math.min(1, value / summary.maxCategoryScore)) : 0.04;
            return (
              <Motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: EASE, delay: index * 0.04 }}
                style={s.progressCard(tone)}
              >
                <div style={s.cardTop}>
                  <span style={s.cardIcon(tone)}><Icon size={16} /></span>
                  <span style={s.cardName}>{label}</span>
                  <strong style={s.cardValue}>{formatScore(value)}</strong>
                </div>
                <div style={s.track}>
                  <Motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.75, ease: EASE, delay: 0.08 + index * 0.04 }}
                    style={{ ...s.fill, background: tone.hue, boxShadow: `0 0 16px ${tone.hue}55` }}
                  />
                </div>
              </Motion.div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function buildMentalSummary() {
  const records = Array.isArray(AppData.mentalRecords) ? AppData.mentalRecords : [];
  const categoryScores = [0, 1, 2, 3].map((index) => {
    const row = Array.isArray(records[index]) ? records[index] : [];
    return row.reduce((sum, value) => sum + (Number(value) || 0), 0);
  });
  const totalScore = categoryScores.reduce((sum, value) => sum + value, 0);
  const bestScore = Math.max(0, ...categoryScores);
  const maxCategoryScore = Math.max(1, bestScore);
  const trainedDays = Object.keys(AppData.mentalLog || {}).length;
  return { categoryScores, totalScore, maxCategoryScore, trainedDays };
}

function formatScore(value) {
  const score = Number(value) || 0;
  if (score >= 1000) return `${(score / 1000).toFixed(score >= 10000 ? 0 : 1)}k`;
  return `${Math.round(score)}`;
}

function styles(theme, fontSize = 0) {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const accent = buildSectionAccent(AppData.mentalAccentColor || MENTAL_ACCENT, MENTAL_ACCENT);
  const border = isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.075)';
  return {
    accent,
    container: {
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      color: text,
      fontFamily: "'SF Pro Rounded', 'Nunito Sans', Nunito, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, 'Segoe UI', system-ui, sans-serif",
      background: isLight
        ? `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgb},0.16), transparent 62%), #F4F5F7`
        : `radial-gradient(640px 420px at 86% -8%, rgba(${accent.rgb},0.15), transparent 62%), linear-gradient(180deg, #18232A 0%, ${Colors.get('background', theme)} 48%, #10161A 100%)`
    },
    scrollView: {
      height: '100%',
      overflowY: 'auto',
      padding: 'calc(env(safe-area-inset-top, 0px) + 24px) 28px calc(132px + env(safe-area-inset-bottom, 0px))',
      boxSizing: 'border-box'
    },
    header: { maxWidth: 660, margin: '0 auto 16px', textAlign: 'left' },
    eyebrow: { color: accent.hue, fontSize: 10, fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase' },
    title: { margin: '8px 0 0', color: text, fontSize: fontSize === 0 ? 28 : 32, lineHeight: 1.05, fontWeight: 950 },
    subtitle: { margin: '8px 0 0', color: sub, fontSize: fontSize === 0 ? 13 : 14, lineHeight: 1.35, fontWeight: 720 },
    totalPanel: {
      maxWidth: 660,
      minHeight: 112,
      margin: '0 auto 14px',
      borderRadius: 28,
      padding: 18,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      boxSizing: 'border-box',
      background: isLight
        ? `linear-gradient(135deg, rgba(255,255,255,0.82), rgba(${accent.rgb},0.10))`
        : `linear-gradient(135deg, rgba(30,35,43,0.78), rgba(${accent.rgb},0.13))`,
      border: `1px solid rgba(${accent.rgb},${isLight ? 0.16 : 0.22})`,
      boxShadow: isLight ? '0 18px 40px -32px rgba(15,23,42,0.22)' : '0 24px 52px -36px rgba(0,0,0,0.78)'
    },
    totalIcon: { width: 52, height: 52, borderRadius: 18, color: accent.hue, background: `rgba(${accent.rgb},0.13)`, border: `1px solid rgba(${accent.rgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 },
    totalCopy: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, color: sub, fontSize: 12, fontWeight: 800 },
    totalMeta: { minHeight: 34, padding: '0 11px', borderRadius: 999, color: accent.hue, background: `rgba(${accent.rgb},0.12)`, border: `1px solid rgba(${accent.rgb},0.22)`, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 900 },
    progressRows: { maxWidth: 660, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 },
    progressCard: (tone) => ({ minHeight: 88, borderRadius: 20, padding: 13, background: isLight ? `linear-gradient(145deg, rgba(255,255,255,0.72), ${tone.soft})` : `linear-gradient(145deg, rgba(255,255,255,0.046), ${tone.soft})`, border: `1px solid ${isLight ? border : tone.ring}`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12, overflow: 'hidden' }),
    cardTop: { display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr) auto', alignItems: 'center', gap: 9 },
    cardIcon: (tone) => ({ width: 34, height: 34, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tone.hue, background: tone.soft, border: `1px solid ${tone.ring}` }),
    cardName: { minWidth: 0, color: text, fontSize: 13, fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', textAlign: 'left' },
    cardValue: { color: text, fontSize: 13, fontWeight: 950, textAlign: 'right', fontVariantNumeric: 'tabular-nums' },
    track: { height: 7, borderRadius: 999, background: isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.065)', overflow: 'hidden' },
    fill: { height: '100%', borderRadius: 999 }
  };
}
