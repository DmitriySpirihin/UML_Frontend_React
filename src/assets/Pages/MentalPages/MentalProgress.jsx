import React, { useEffect, useMemo, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
  FaBrain,
  FaBullseye,
  FaCalculator,
  FaChartLine,
  FaCrown,
  FaMedal,
  FaPuzzlePiece
} from 'react-icons/fa';
import { AppData, UserData, logSectionVisit } from '../../StaticClasses/AppData.js';
import Colors from '../../StaticClasses/Colors';
import { fontSize$, lang$, premium$, setPage, theme$ } from '../../StaticClasses/HabitsBus';
import HoverInfoButton from '../../Helpers/HoverInfoButton.jsx';
import MyAreaChart from '../../Helpers/MyAreaChart.jsx';
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
  const [hasPremium, setHasPremium] = useState(UserData.hasPremium);
  const [selectedMode, setSelectedMode] = useState(0);

  useEffect(() => {
    const subs = [
      theme$.subscribe(setThemeState),
      lang$.subscribe((lang) => setLangIndex(lang === 'ru' ? 0 : 1)),
      fontSize$.subscribe(setFSize),
      premium$.subscribe(setHasPremium)
    ];
    return () => subs.forEach(sub => sub.unsubscribe());
  }, []);

  useEffect(() => { logSectionVisit('mental'); }, []);

  const summary = useMemo(() => buildMentalSummary(), []);
  const s = styles(theme, fSize);
  const labels = getModeLabels(langIndex);
  const selected = summary.modes[selectedMode] || summary.modes[0];
  const selectedTone = MODE_TONES[selectedMode] || MODE_TONES[0];
  const SelectedIcon = selectedTone.Icon;
  const difficultyLabels = langIndex === 0
    ? ['Легко', 'Средне', 'Сложно', 'Про']
    : ['Easy', 'Medium', 'Hard', 'Pro'];
  const chartData = difficultyLabels.map((label, index) => ({
    date: label,
    weight: selected.records[index] || 0
  }));
  const chartDomainMax = Math.max(1, Math.ceil(selected.best * 1.16));

  return (
    <div style={s.container}>
      <HoverInfoButton tab="MentalMain" variant="subtle" accent={s.accent.hue} />
      <div style={s.scrollView} className="no-scrollbar">
        <div style={s.header}>
          <div style={s.eyebrow}>{langIndex === 0 ? 'Прогресс ума' : 'Mind progress'}</div>
          <h1 style={s.title}>{langIndex === 0 ? 'Прогресс по режимам' : 'Progress by mode'}</h1>
        </div>

        <Motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} style={s.totalPanel}>
          <div style={s.totalIcon(selectedTone)}><SelectedIcon /></div>
          <div style={s.totalCopy}>
            <span>{labels[selectedMode].title}</span>
            <strong>{formatScore(selected.total)}</strong>
          </div>
          <div style={s.totalMeta}>
            <FaChartLine size={13} />
            <span>{langIndex === 0 ? 'лучший' : 'best'} {formatScore(selected.best)}</span>
          </div>
        </Motion.section>

        <Motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04, ease: EASE }}
          style={s.modesPanel}
        >
          <div style={s.modesHeader}>
            <div>
              <div style={s.kicker}>{langIndex === 0 ? 'ПО СЛОЖНОСТЯМ' : 'BY DIFFICULTY'}</div>
              <div style={s.bigTotal(selectedTone)}>{labels[selectedMode].title}</div>
            </div>
            <div style={s.modeCountPill}>
              <FaMedal size={12} />
              <span>{formatScore(selected.total)}</span>
            </div>
          </div>

          <div style={s.modeChartArea}>
            <MyAreaChart
              data={chartData}
              fillColor={selectedTone.hue}
              textColor={Colors.get('subText', theme)}
              linesColor={theme === 'dark' || theme === 'specialdark' ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.08)'}
              backgroundColor={theme === 'dark' || theme === 'specialdark' ? 'rgba(14,16,20,0.94)' : 'rgba(255,255,255,0.92)'}
              valueFormatter={formatScore}
              domain={[0, chartDomainMax]}
            />
          </div>

          <div style={s.modeLegend}>
            {labels.map((label, index) => {
              const tone = MODE_TONES[index];
              const Icon = tone.Icon;
              const value = summary.modes[index]?.total || 0;
              const best = summary.modes[index]?.best || 0;
              const active = selectedMode === index;
              return (
                <button
                  key={label.title}
                  type="button"
                  onClick={() => setSelectedMode(index)}
                  style={s.modeLegendItem(tone, active)}
                >
                  <span style={s.modeLegendIcon(tone)}><Icon size={13} /></span>
                  <span style={s.modeLegendCopy}>
                    <span style={s.modeLegendName}>{label.title}</span>
                    <strong style={s.modeLegendValue}>{formatScore(value)}</strong>
                  </span>
                  <span style={s.modeLegendShare(tone)}>{langIndex === 0 ? 'лучший' : 'best'} {formatScore(best)}</span>
                </button>
              );
            })}
          </div>
        </Motion.section>
      </div>
      {!hasPremium && <PremiumOverlay theme={theme} langIndex={langIndex} />}
    </div>
  );
}

function buildMentalSummary() {
  const records = Array.isArray(AppData.mentalRecords) ? AppData.mentalRecords : [];
  const modes = [0, 1, 2, 3].map((index) => {
    const row = Array.isArray(records[index]) ? records[index] : [];
    const modeRecords = [0, 1, 2, 3].map((difficulty) => Number(row[difficulty]) || 0);
    const total = modeRecords.reduce((sum, value) => sum + value, 0);
    const best = Math.max(0, ...modeRecords);
    return { records: modeRecords, total, best };
  });
  const trainedDays = Object.keys(AppData.mentalLog || {}).length;
  return { modes, trainedDays };
}

function formatScore(value) {
  const score = Number(value) || 0;
  if (score >= 1000) return `${(score / 1000).toFixed(score >= 10000 ? 0 : 1)}k`;
  return `${Math.round(score)}`;
}

function getModeLabels(langIndex) {
  return langIndex === 0
    ? [
      { title: 'Быстрый счет' },
      { title: 'N-back' },
      { title: 'Паттерны' },
      { title: 'Контроль' }
    ]
    : [
      { title: 'Mental Math' },
      { title: 'N-back' },
      { title: 'Patterns' },
      { title: 'Focus Control' }
    ];
}

const PremiumOverlay = ({ theme, langIndex }) => {
  const isLight = theme === 'light' || theme === 'speciallight';
  return (
    <div onClick={(event) => event.stopPropagation()} style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2555,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
      background: isLight ? 'rgba(248,248,250,0.88)' : 'rgba(10,10,14,0.82)',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)'
    }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 22,
        marginBottom: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9FB4C4',
        background: 'rgba(159,180,196,0.12)',
        border: '1px solid rgba(159,180,196,0.22)'
      }}>
        <FaCrown size={30} />
      </div>
      <div style={{
        maxWidth: 240,
        marginBottom: 24,
        color: isLight ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.5)',
        fontSize: 13,
        fontWeight: 750,
        lineHeight: 1.55
      }}>
        {langIndex === 0 ? 'Откройте полный доступ к прогрессу по режимам' : 'Unlock full access to progress by mode'}
      </div>
      <button onClick={() => setPage('premium')} style={{
        width: 220,
        minHeight: 48,
        marginBottom: 10,
        border: 'none',
        borderRadius: 16,
        color: '#fff',
        background: 'linear-gradient(135deg, #8A7CD6, #66D9E8)',
        fontSize: 15,
        fontWeight: 850,
        cursor: 'pointer',
        boxShadow: '0 18px 36px -24px rgba(138,124,214,0.75)'
      }}>
        {langIndex === 0 ? 'Купить подписку' : 'Buy subscription'}
      </button>
      <button onClick={() => setPage('MainMenu')} style={{
        padding: '8px 20px',
        border: 'none',
        color: isLight ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.4)',
        background: 'transparent',
        fontSize: 13,
        fontWeight: 750,
        cursor: 'pointer'
      }}>
        {langIndex === 0 ? 'На главную' : 'Home'}
      </button>
    </div>
  );
};

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
    title: { margin: '8px 0 0', color: text, fontSize: 'clamp(36px, 10.4vw, 58px)', lineHeight: 1.02, fontWeight: 950 },
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
    totalIcon: (tone) => ({ width: 52, height: 52, borderRadius: 18, color: tone.hue, background: tone.soft, border: `1px solid ${tone.ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }),
    totalCopy: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, color: sub, fontSize: 12, fontWeight: 800 },
    totalMeta: { minHeight: 34, padding: '0 11px', borderRadius: 999, color: accent.hue, background: `rgba(${accent.rgb},0.12)`, border: `1px solid rgba(${accent.rgb},0.22)`, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 900 },
    modesPanel: {
      maxWidth: 660,
      margin: '0 auto',
      padding: 16,
      borderRadius: 28,
      boxSizing: 'border-box',
      background: isLight
        ? 'linear-gradient(145deg, rgba(255,255,255,0.82), rgba(255,255,255,0.54))'
        : 'linear-gradient(145deg, rgba(255,255,255,0.045), rgba(18,21,26,0.94))',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.08)'}`,
      boxShadow: isLight ? '0 14px 30px rgba(15,23,42,0.08)' : '0 18px 48px rgba(0,0,0,0.24)'
    },
    modesHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
    kicker: { color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.16em', textTransform: 'uppercase' },
    bigTotal: (tone) => ({ marginTop: 3, color: tone.hue, fontSize: 24, fontWeight: 950, lineHeight: 1.05, textShadow: `0 0 20px ${tone.soft}` }),
    modeCountPill: { minHeight: 30, padding: '0 11px', borderRadius: 14, border: `1px solid rgba(${accent.rgb},0.30)`, background: `rgba(${accent.rgb},0.14)`, color: accent.hue, display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 950 },
    modeChartArea: {
      height: 238,
      margin: '2px -4px 12px',
      borderRadius: 22,
      padding: '8px 2px 4px',
      boxSizing: 'border-box',
      background: isLight ? 'rgba(255,255,255,0.44)' : 'rgba(8,12,16,0.34)',
      border: `1px solid ${isLight ? 'rgba(15,23,42,0.055)' : 'rgba(255,255,255,0.055)'}`,
      overflow: 'hidden'
    },
    modeLegend: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: 8
    },
    modeLegendItem: (tone, active) => ({
      minWidth: 0,
      display: 'grid',
      gridTemplateColumns: '34px minmax(0, 1fr)',
      alignItems: 'center',
      gap: 8,
      minHeight: 78,
      padding: '10px',
      borderRadius: 17,
      appearance: 'none',
      textAlign: 'left',
      cursor: 'pointer',
      boxSizing: 'border-box',
      background: active
        ? `linear-gradient(145deg, ${tone.soft}, rgba(255,255,255,0.055))`
        : (isLight ? 'rgba(255,255,255,0.56)' : 'rgba(255,255,255,0.04)'),
      border: `1px solid ${active ? tone.hue : tone.ring}`
    }),
    modeLegendIcon: (tone) => ({
      width: 30,
      height: 30,
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: tone.hue,
      background: tone.soft,
      border: `1px solid ${tone.ring}`
    }),
    modeLegendCopy: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 },
    modeLegendName: { color: text, fontSize: 12, fontWeight: 900, lineHeight: 1.12, whiteSpace: 'normal', overflowWrap: 'anywhere' },
    modeLegendValue: { color: text, fontSize: 15, fontWeight: 950, lineHeight: 1, fontVariantNumeric: 'tabular-nums' },
    modeLegendShare: (tone) => ({
      minHeight: 23,
      padding: '0 7px',
      borderRadius: 999,
      color: tone.hue,
      background: tone.soft,
      border: `1px solid ${tone.ring}`,
      fontSize: 9,
      fontWeight: 950,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'stretch',
      gridColumn: '1 / 3',
      width: '100%',
      boxSizing: 'border-box',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    })
  };
}
