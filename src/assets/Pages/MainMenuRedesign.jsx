import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaThumbtack, FaTrashRestore } from 'react-icons/fa';
import { buildHabitsAccent } from './HabitsPages/HabitVisuals.jsx';
import { buildSleepAccent } from './SleepPages/SleepVisuals.js';
import { buildTodoAccent } from './ToDoPages/ToDoVisuals.js';
import { buildSectionAccent } from './SectionAccentSettings.jsx';

const EASE = [0.2, 0.8, 0.2, 1];
const HERO_SUMMARY_COLLAPSE_KEY = 'uml_main_menu_summary_collapsed_v1';
const AERO_ACCENT = {
  hue: '#B7F3FF',
  soft: 'rgba(183,243,255,0.13)',
  ring: 'rgba(183,243,255,0.28)',
  rgb: '183,243,255'
};
const HABITS_MENU_COLOR = '#55DDEB';
const TODO_MENU_COLOR = '#2E9DFF';
const ZERO_METRIC_TONE = {
  hue: '#8E98A6',
  soft: 'rgba(142,152,166,0.10)',
  ring: 'rgba(142,152,166,0.22)',
  rgb: '142,152,166'
};

const tokens = {
  dark: {
    isLight: false,
    bg: '#11171C',
    settingsTop: '#172027',
    settingsBorder: '#2A3944',
    panel: 'rgba(22,30,37,0.9)',
    panelStrong: 'rgba(16,22,27,0.96)',
    border: 'rgba(163,196,210,0.13)',
    text: '#F2F3F5',
    sub: '#A6ADB8',
    muted: '#798692',
    faint: 'rgba(255,255,255,0.052)'
  },
  light: {
    isLight: true,
    bg: '#F4F5F7',
    settingsTop: '#e5e5e5',
    settingsBorder: '#E2E8F0',
    panel: 'rgba(255,255,255,0.86)',
    panelStrong: 'rgba(255,255,255,0.96)',
    border: 'rgba(15,23,42,0.08)',
    text: '#111827',
    sub: '#596273',
    muted: '#8A94A6',
    faint: 'rgba(15,23,42,0.04)'
  },
  coffee: {
    isLight: false,
    isCoffee: true,
    bg: '#1A120E',
    settingsTop: '#261A13',
    settingsBorder: '#493226',
    panel: 'rgba(39,26,19,0.9)',
    panelStrong: 'rgba(27,18,13,0.96)',
    border: 'rgba(226,173,118,0.14)',
    text: '#FFF4E6',
    sub: '#C9AD96',
    muted: '#9F8067',
    faint: 'rgba(255,215,178,0.052)'
  },
  accents: {
    profile: AERO_ACCENT,
    HabitsMain: { hue: HABITS_MENU_COLOR, soft: 'rgba(85,221,235,0.15)', ring: 'rgba(85,221,235,0.30)' },
    TrainingMain: { hue: '#579BC8', soft: 'rgba(87,155,200,0.14)', ring: 'rgba(87,155,200,0.28)' },
    MentalMain: { hue: '#A66BFF', soft: 'rgba(166,107,255,0.15)', ring: 'rgba(166,107,255,0.30)' },
    RecoveryMain: { hue: '#2FD6BD', soft: 'rgba(47,214,189,0.15)', ring: 'rgba(47,214,189,0.30)' },
    SleepMain: { hue: '#7C6CFF', soft: 'rgba(124,108,255,0.16)', ring: 'rgba(124,108,255,0.32)' },
    ToDoMain: { hue: TODO_MENU_COLOR, soft: 'rgba(46,157,255,0.16)', ring: 'rgba(46,157,255,0.32)' },
    RobotMain: { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)' },
    premium: { hue: '#C4D3DE', soft: 'rgba(196,211,222,0.16)', ring: 'rgba(196,211,222,0.34)' }
  }
};

const Icon = ({ children, size = 22, stroke = 1.6 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const IconHabits = (p) => <Icon {...p} stroke={p.stroke || 1.9}><rect x="5" y="4.5" width="14" height="15.5" rx="4" /><path d="M8.4 12.2l2.4 2.5 4.8-5.2" /><path d="M8.2 3v3M15.8 3v3" /></Icon>;
const IconTraining = (p) => <Icon {...p}><path d="M6.5 7v10M17.5 7v10" /><path d="M4 10v4M20 10v4" /><path d="M6.5 12h11" /></Icon>;
const IconBrain = (p) => <Icon {...p}><path d="M9 4a3 3 0 013 3v10a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-2-5 3 3 0 012-5 3 3 0 013-3z" /><path d="M15 4a3 3 0 00-3 3v10a3 3 0 003 3 3 3 0 003-3 3 3 0 002-5 3 3 0 00-2-5 3 3 0 00-3-3z" /></Icon>;
const IconRecovery = (p) => <Icon {...p}><path d="M12 8c-1.5 2-1.5 4 0 6 1.5-2 1.5-4 0-6z" /><path d="M12 8c2 1 3 3 3 6-2-1-3-3-3-6z" /><path d="M12 8c-2 1-3 3-3 6 2-1 3-3 3-6z" /><path d="M4 14c2 4 5 5 8 5s6-1 8-5" /><circle cx="12" cy="5" r="1.5" /></Icon>;
const IconSleep = (p) => <Icon {...p}><path d="M20 14.5A8 8 0 019.5 4a7 7 0 1010.5 10.5z" /><path d="M16 4.5l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" /></Icon>;
const IconTodo = (p) => <Icon {...p}><rect x="3.5" y="4.5" width="17" height="15" rx="3" /><path d="M7 9l2 2 3-3" /><path d="M7 15l2 2 3-3" /><path d="M15 10h3M15 16h3" /></Icon>;
const IconSparkle = (p) => <Icon {...p}><path d="M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6L12 4z" /><path d="M19 16l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" /></Icon>;
const IconCrown = (p) => <Icon {...p}><path d="M3 8l4 4 5-7 5 7 4-4-1.5 11H4.5L3 8z" /><path d="M6 20h12" /></Icon>;
const IconUser = (p) => <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" /></Icon>;
const IconSettings = (p) => <Icon {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12c0 .7-.1 1.3-.2 1.9l2 1.5-2 3.4-2.3-.9c-1 .8-2.1 1.4-3.3 1.7L12.7 22h-3.4l-.5-2.4c-1.2-.3-2.3-.9-3.3-1.7l-2.3.9-2-3.4 2-1.5c-.1-.6-.2-1.2-.2-1.9s.1-1.3.2-1.9l-2-1.5 2-3.4 2.3.9c1-.8 2.1-1.4 3.3-1.7L9.3 2h3.4l.5 2.4c1.2.3 2.3.9 3.3 1.7l2.3-.9 2 3.4-2 1.5c.1.6.2 1.2.2 1.9z" /></Icon>;
const IconChevron = (p) => <Icon {...p}><path d="M9 6l6 6-6 6" /></Icon>;
const IconFlame = (p) => <Icon {...p}><path d="M12 3c1.5 3 4 5 4 9a4 4 0 11-8 0c0-2 1-3 2-4-1-2 1-4 2-5z" /></Icon>;
const IconArrow = (p) => <Icon {...p}><path d="M7 17L17 7M9 7h8v8" /></Icon>;
const IconSliders = (p) => <Icon {...p}><path d="M4 7h7" /><path d="M15 7h5" /><circle cx="13" cy="7" r="2" /><path d="M4 17h5" /><path d="M13 17h7" /><circle cx="11" cy="17" r="2" /></Icon>;
const StreakFlame = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', flexShrink: 0 }}>
    <path
      d="M12.7 2.6c2.1 3.6 5.8 5.7 5.8 11a6.5 6.5 0 01-13 0c0-2.9 1.6-5 3.5-6.4-.2 1.5.1 2.7.9 3.7.7-3.1 1.6-5.8 2.8-8.3z"
      fill="#FF7A3D"
    />
    <path
      d="M13 19.5a3.5 3.5 0 003.3-3.7c0-2-1.2-3.2-2.6-4.7-.4 1.9-1.1 3.4-2.2 4.5-.6-.8-.9-1.7-.8-2.8-1.1.9-1.8 2.1-1.8 3.5A3.5 3.5 0 0013 19.5z"
      fill="#FFD36A"
    />
  </svg>
);
const BurntFlame = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={{ display: 'block', flexShrink: 0, opacity: 0.78 }}>
    <path
      d="M12.7 2.6c2.1 3.6 5.8 5.7 5.8 11a6.5 6.5 0 01-13 0c0-2.9 1.6-5 3.5-6.4-.2 1.5.1 2.7.9 3.7.7-3.1 1.6-5.8 2.8-8.3z"
      fill="#68717B"
    />
    <path
      d="M13 19.5a3.5 3.5 0 003.3-3.7c0-2-1.2-3.2-2.6-4.7-.4 1.9-1.1 3.4-2.2 4.5-.6-.8-.9-1.7-.8-2.8-1.1.9-1.8 2.1-1.8 3.5A3.5 3.5 0 0013 19.5z"
      fill="#3F4650"
    />
  </svg>
);
const FieryBorder = ({ radius = 32, opacity = 0.78, duration = 6 }) => (
  <Motion.div
    aria-hidden="true"
    animate={{
      opacity: [opacity * 0.62, opacity, opacity * 0.68],
      filter: [
        'drop-shadow(0 0 0 rgba(255,122,61,0))',
        'drop-shadow(0 0 10px rgba(255,122,61,0.22))',
        'drop-shadow(0 0 0 rgba(255,122,61,0))'
      ]
    }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      position: 'absolute',
      inset: 0,
      padding: 1.4,
      borderRadius: radius,
      pointerEvents: 'none',
      background: 'conic-gradient(from 18deg, rgba(255,122,61,0.05), rgba(255,210,106,0.92) 72deg, rgba(255,92,40,0.75) 118deg, rgba(255,122,61,0.08) 190deg, rgba(255,211,106,0.58) 272deg, rgba(255,122,61,0.05) 360deg)',
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude'
    }}
  />
);
const CategoryAuraBorder = ({ accent, palette, idx }) => (
  <Motion.div
    aria-hidden="true"
    animate={{
      opacity: palette.isLight ? [0.62, 0.78, 0.64] : [0.76, 0.96, 0.78],
      filter: [
        `drop-shadow(0 0 0 rgba(${accent.rgb},0))`,
        `drop-shadow(0 0 14px rgba(${accent.rgb},0.28))`,
        `drop-shadow(0 0 0 rgba(${accent.rgb},0))`
      ]
    }}
    transition={{ duration: 5.8 + idx * 0.22, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.09 }}
    style={{
      position: 'absolute',
      inset: 0,
      padding: 1.8,
      borderRadius: 36,
      pointerEvents: 'none',
      background: palette.isLight
        ? `conic-gradient(from ${idx * 22}deg, rgba(${accent.rgb},0.32), rgba(255,255,255,0.86) 18%, rgba(${accent.rgb},0.16) 38%, rgba(${accent.rgb},0.54) 58%, rgba(255,255,255,0.70) 76%, rgba(${accent.rgb},0.32))`
        : `conic-gradient(from ${idx * 22}deg, rgba(${accent.rgb},0.38), rgba(255,255,255,0.18) 18%, rgba(${accent.rgb},0.12) 38%, rgba(${accent.rgb},0.74) 58%, rgba(190,230,245,0.22) 76%, rgba(${accent.rgb},0.38))`,
      WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
      WebkitMaskComposite: 'xor',
      maskComposite: 'exclude',
      zIndex: 1
    }}
  />
);
const StreakWatermark = ({ delay = 0 }) => (
  <Motion.div
    aria-hidden="true"
    animate={{ opacity: [0.13, 0.22, 0.14], scale: [0.98, 1.04, 1] }}
    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute',
      right: 18,
      top: '50%',
      marginTop: -31,
      width: 72,
      height: 62,
      pointerEvents: 'none',
      zIndex: 0,
      borderRadius: '50%',
      background: 'radial-gradient(circle at 52% 54%, rgba(255,211,106,0.24), transparent 28%), radial-gradient(circle at 54% 46%, rgba(255,122,61,0.32), transparent 50%), radial-gradient(circle at 38% 64%, rgba(255,68,34,0.18), transparent 58%)',
      filter: 'blur(7px)'
    }}
  />
);
const DockUserIcon = ({ color }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M12 12.2c2.7 0 4.9-2.2 4.9-4.9S14.7 2.4 12 2.4 7.1 4.6 7.1 7.3s2.2 4.9 4.9 4.9Z" />
    <path d="M4.2 20.2c.7-4.1 3.8-6.4 7.8-6.4s7.1 2.3 7.8 6.4c.1.7-.4 1.4-1.2 1.4H5.4c-.8 0-1.3-.7-1.2-1.4Z" />
  </svg>
);
const DockSettingsIcon = ({ color }) => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M10.8 2.3h2.4c.6 0 1.1.4 1.2 1l.3 1.5c.5.2 1 .4 1.4.7l1.4-.8c.5-.3 1.1-.2 1.5.2l1.2 2.1c.3.5.2 1.1-.2 1.5l-1.2 1c.1.5.1 1 .1 1.5s0 1-.1 1.5l1.2 1c.4.4.5 1 .2 1.5L19 17.1c-.4.4-1 .5-1.5.2l-1.4-.8c-.4.3-.9.5-1.4.7l-.3 1.5c-.1.6-.6 1-1.2 1h-2.4c-.6 0-1.1-.4-1.2-1l-.3-1.5c-.5-.2-1-.4-1.4-.7l-1.4.8c-.5.3-1.1.2-1.5-.2l-1.2-2.1c-.3-.5-.2-1.1.2-1.5l1.2-1c-.1-.5-.1-1-.1-1.5s0-1 .1-1.5l-1.2-1c-.4-.4-.5-1-.2-1.5L5 4.9c.4-.4 1-.5 1.5-.2l1.4.8c.4-.3.9-.5 1.4-.7l.3-1.5c.1-.6.6-1 1.2-1Zm1.2 5.9a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
  </svg>
);
const DockBackIcon = ({ color }) => (
  <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', flexShrink: 0 }}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
);
const ReactSettingsIcon = ({ color, size = 22 }) => (
  <FaCog size={size} color={color} style={{ display: 'block', flexShrink: 0 }} />
);

export const MENU_ICON_MAP = {
  HabitsMain: IconHabits,
  TrainingMain: IconTraining,
  MentalMain: IconBrain,
  RecoveryMain: IconRecovery,
  SleepMain: IconSleep,
  ToDoMain: IconTodo
};
const iconMap = MENU_ICON_MAP;

function getAccent(id) {
  const accent = tokens.accents[id] || tokens.accents.HabitsMain;
  return accent.rgb ? accent : { ...accent, rgb: buildHabitsAccent(accent.hue).rgb };
}

function toMenuAccent(accent) {
  if (!accent?.rgb || typeof accent.rgb === 'string') return accent;
  return {
    ...accent,
    rgb: `${accent.rgb.r},${accent.rgb.g},${accent.rgb.b}`
  };
}

function hexToRgbTuple(hex) {
  const safe = String(hex || '').replace('#', '').trim();
  if (safe.length !== 6) return null;
  const tuple = [safe.slice(0, 2), safe.slice(2, 4), safe.slice(4, 6)].map(part => Number.parseInt(part, 16));
  return tuple.some(Number.isNaN) ? null : tuple;
}

function colorsAreClose(a, b) {
  const first = hexToRgbTuple(a);
  const second = hexToRgbTuple(b);
  if (!first || !second) return false;
  const distance = Math.sqrt(first.reduce((sum, value, index) => sum + (value - second[index]) ** 2, 0));
  return distance < 68;
}

function getMetricParts(metric) {
  const text = `${metric}`.trim();
  if (!text) return { value: '', isStreak: false, isZero: false };

  if (text.endsWith('🔥')) {
    return { value: text.replace('🔥', '').trim(), isStreak: true, isZero: false };
  }

  return { value: text, isStreak: false, isZero: text === '0' };
}

function Pill({ children, style }) {
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '5px 11px',
      borderRadius: 999,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
      fontSize: 11,
      fontWeight: 700,
      color: '#A6ADB8',
      fontVariantNumeric: 'tabular-nums',
      ...style
    }}>
      {children}
    </div>
  );
}

function StreakMetricPill({ value, compact = false }) {
  return (
    <Motion.div
      aria-hidden="true"
      animate={{
        y: [0, -1.5, 0],
        boxShadow: [
          `0 1px 0 rgba(255,211,106,0.12) inset, 0 0 0 1px rgba(52,20,11,0.70) inset, 0 ${compact ? 7 : 9}px ${compact ? 14 : 18}px -15px rgba(255,122,61,0.42)`,
          `0 1px 0 rgba(255,211,106,0.16) inset, 0 0 0 1px rgba(52,20,11,0.70) inset, 0 ${compact ? 9 : 12}px ${compact ? 20 : 24}px -14px rgba(255,122,61,0.62)`,
          `0 1px 0 rgba(255,211,106,0.12) inset, 0 0 0 1px rgba(52,20,11,0.70) inset, 0 ${compact ? 7 : 9}px ${compact ? 14 : 18}px -15px rgba(255,122,61,0.42)`
        ]
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        height: compact ? 27 : 30,
        minWidth: compact ? 42 : 54,
        padding: compact ? '0 8px' : '0 10px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        border: '1px solid rgba(255,122,61,0.36)',
        background: 'linear-gradient(180deg, rgba(47,28,18,0.98), rgba(18,13,11,0.98))',
        color: '#FFD36A',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <FieryBorder radius={999} opacity={compact ? 0.72 : 0.82} duration={3.8} />
      <Motion.span
        aria-hidden="true"
        animate={{ x: ['-120%', '130%'], opacity: [0, 0.42, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: '42%',
          transform: 'skewX(-18deg)',
          background: 'linear-gradient(90deg, transparent, rgba(255,211,106,0.28), transparent)',
          pointerEvents: 'none'
        }}
      />
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
        <Motion.span
          animate={{ scale: [1, 1.12, 0.98, 1], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ display: 'inline-flex' }}
        >
          <StreakFlame size={compact ? 14 : 13} />
        </Motion.span>
        <span style={{ color: '#F2F3F5', fontSize: compact ? 15 : 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{value}</span>
      </span>
    </Motion.div>
  );
}

function TopStreakPill({ value }) {
  return <StreakMetricPill value={value} />;
}

function SummaryToggleButton({ collapsed, count, onClick, lang, heroAccent, palette }) {
  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.91, y: 2 }}
      onClick={onClick}
      aria-expanded={!collapsed}
      aria-label={collapsed ? (lang === 0 ? 'Раскрыть сводку метрик' : 'Expand metrics summary') : (lang === 0 ? 'Скрыть сводку метрик' : 'Hide metrics summary')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        flexShrink: 0,
        height: 34,
        minWidth: lang === 0 ? 78 : 74,
        padding: '0 8px 0 11px',
        borderRadius: 999,
        border: `1px solid rgba(${heroAccent.rgb},0.20)`,
        background: `linear-gradient(135deg, rgba(${heroAccent.rgb},0.14), rgba(255,255,255,0.04))`,
        color: heroAccent.hue,
        fontFamily: 'inherit',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
        boxShadow: `0 1px 0 rgba(255,255,255,0.10) inset, 0 11px 22px -17px rgba(${heroAccent.rgb},0.72), 0 0 0 1px rgba(${heroAccent.rgb},0.04)`,
        transition: 'box-shadow 0.18s ease, transform 0.18s ease'
      }}
    >
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: heroAccent.hue,
        fontSize: 10,
        fontWeight: 950,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}>
        {lang === 0 ? 'Метрики' : 'Stats'}
      </span>
      <span style={{
        minWidth: 17,
        height: 17,
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: heroAccent.hue,
        background: `rgba(${heroAccent.rgb},0.13)`,
        border: `1px solid rgba(${heroAccent.rgb},0.18)`,
        fontSize: 10,
        fontWeight: 950,
        fontVariantNumeric: 'tabular-nums'
      }}>
        {count}
      </span>
      <Motion.span
        animate={{ rotate: collapsed ? 0 : 90 }}
        transition={{ type: 'spring', stiffness: 320, damping: 25 }}
        style={{ color: palette.sub, display: 'flex' }}
      >
        <IconChevron size={15} stroke={2.2} />
      </Motion.span>
    </Motion.button>
  );
}

function SummaryChips({ stats, palette, onOpenSection }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(3, stats.length)}, minmax(0, 1fr))`,
      gap: 8,
      position: 'relative'
    }}>
      {stats.map((stat) => (
        <HeroStat
          key={stat.id}
          accent={getAccent(stat.id)}
          label={stat.label}
          value={stat.value}
          palette={palette}
          onClick={() => onOpenSection(stat.id)}
        />
      ))}
    </div>
  );
}

function FocusCopy({ data, accent, palette }) {
  return (
    <div style={{ minWidth: 0, flex: 1 }}>
      <div style={{
        fontSize: 10,
        color: accent.hue,
        fontWeight: 900,
        letterSpacing: '0.07em',
        textTransform: 'uppercase',
        marginBottom: 5,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }}>
        {data.status}
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: palette.text, lineHeight: 1.12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {data.title}
      </div>
    </div>
  );
}

function HeroStat({ accent, label, value, palette, onClick }) {
  const isZeroValue = `${value}`.trim() === '0';
  const statBackground = palette.isLight
    ? `radial-gradient(150px 70px at 12% 45%, rgba(${accent.rgb},0.24), transparent 72%), linear-gradient(135deg, rgba(255,255,255,0.80) 0%, rgba(245,250,252,0.70) 58%, rgba(232,239,243,0.80) 100%)`
    : palette.isCoffee
      ? `radial-gradient(160px 76px at 12% 45%, rgba(${accent.rgb},0.18), transparent 72%), linear-gradient(135deg, rgba(45,29,20,0.78) 0%, rgba(30,20,15,0.74) 54%, rgba(18,12,9,0.66) 100%)`
      : `radial-gradient(170px 82px at 12% 45%, rgba(${accent.rgb},0.22), transparent 72%), linear-gradient(135deg, rgba(20,31,39,0.78) 0%, rgba(15,23,29,0.78) 54%, rgba(10,15,19,0.66) 100%)`;
  const statShadow = palette.isLight
    ? '0 1px 0 rgba(255,255,255,0.76) inset, 0 12px 24px -20px rgba(15,23,42,0.20)'
    : palette.isCoffee
      ? '0 1px 0 rgba(255,232,205,0.08) inset, 0 -12px 20px -22px rgba(0,0,0,0.82) inset, 0 12px 24px -18px rgba(0,0,0,0.58)'
      : '0 1px 0 rgba(255,255,255,0.075) inset, 0 -12px 20px -22px rgba(0,0,0,0.82) inset, 0 10px 22px -17px rgba(0,0,0,0.54)';

  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.94, y: 2 }}
      onClick={onClick}
      style={{
      minHeight: 46,
      padding: '9px 10px',
      borderRadius: 22,
      background: statBackground,
      border: `1px solid rgba(${accent.rgb},${palette.isLight ? 0.25 : 0.28})`,
      boxShadow: statShadow,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: 5,
      minWidth: 0,
      fontFamily: 'inherit',
      cursor: 'pointer',
      textAlign: 'left',
      outline: 'none',
      appearance: 'none',
      WebkitAppearance: 'none',
      WebkitTapHighlightColor: 'transparent',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 5, height: 5, borderRadius: 999, background: accent.hue, flexShrink: 0, opacity: 0.88 }} />
        <div style={{ fontSize: 10, color: palette.sub, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, color: isZeroValue ? ZERO_METRIC_TONE.hue : palette.text, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </Motion.button>
  );
}

function Topbar({ lang, isPremium, onOpenRobot, onOpenReferral, onOpenSettings, palette }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
      <Motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        onClick={onOpenRobot}
        style={{
          border: 'none',
          background: 'transparent',
          padding: 0,
          cursor: 'pointer',
          fontFamily: 'inherit'
        }}
      >
        <Pill style={{ color: tokens.accents.RobotMain.hue, borderColor: tokens.accents.RobotMain.ring, background: tokens.accents.RobotMain.soft }}>
          <IconSparkle size={12} />
          <span>{lang === 0 ? 'AI готов' : 'AI ready'}</span>
        </Pill>
      </Motion.button>
      <div style={{ display: 'flex', gap: 8 }}>
        <TopIconButton onClick={onOpenReferral} palette={palette} Icon={IconCrown} active={isPremium} />
        <TopIconButton onClick={onOpenSettings} palette={palette} Icon={ReactSettingsIcon} />
      </div>
    </div>
  );
}

function TopIconButton({ Icon, onClick, palette, active }) {
  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        width: 38,
        height: 38,
        borderRadius: 20,
        border: `1px solid ${active ? tokens.accents.premium.ring : palette.border}`,
        background: active
          ? tokens.accents.premium.soft
          : 'linear-gradient(135deg, rgba(255,255,255,0.075), rgba(255,255,255,0.025))',
        color: active ? tokens.accents.premium.hue : palette.sub,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 10px 20px -16px rgba(0,0,0,0.72)'
      }}
    >
      {React.createElement(Icon, { size: 18 })}
    </Motion.button>
  );
}

function BrandHeader({ lang, palette }) {
  return (
    <div style={{
      padding: '10px 20px 16px',
      textAlign: 'center'
    }}>
      <div style={{
        fontFamily: '"SF Pro Rounded", "Nunito Sans", Nunito, "SF Pro Display", -apple-system, BlinkMacSystemFont, Inter, "Segoe UI", system-ui, sans-serif',
        fontSize: 24,
        fontWeight: 820,
        letterSpacing: '0.01em',
        lineHeight: 1.05,
        color: palette.text,
        opacity: 0.92
      }}>
        UltyMyLife
      </div>
      <div style={{
        marginTop: 5,
        fontSize: 9,
        fontWeight: 600,
        letterSpacing: '0.16em',
        color: palette.muted
      }}>
        {lang === 0 ? 'Вся твоя жизнь в одном месте' : 'Your life in one place'}
      </div>
    </div>
  );
}

function Hero({ data, palette, lang, onOpenWidgets, onOpenUser, onOpenSection }) {
  const heroAccent = getAccent('profile');
  const selectedStats = Array.isArray(data.stats) && data.stats.length > 0
    ? data.stats
    : [
        { id: 'HabitsMain', label: lang === 0 ? 'Привычки' : 'Habits', value: data.habitsValue },
        { id: 'TrainingMain', label: lang === 0 ? 'Тоннаж' : 'Volume', value: data.trainingValue },
        { id: 'MentalMain', label: lang === 0 ? 'Ум' : 'Mind', value: data.mentalValue }
      ];
  const [summaryCollapsed, setSummaryCollapsed] = React.useState(() => {
    try {
      return window.localStorage.getItem(HERO_SUMMARY_COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const toggleSummary = () => {
    setSummaryCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(HERO_SUMMARY_COLLAPSE_KEY, next ? '1' : '0');
      } catch {
        // Storage can be unavailable in embedded browsers; the current-session toggle still works.
      }
      return next;
    });
  };
  const heroBackground = palette.isLight
    ? `linear-gradient(145deg, rgba(255,255,255,0.76) 0%, rgba(${heroAccent.rgb},0.075) 48%, rgba(235,242,246,0.72) 100%)`
    : palette.isCoffee
      ? `linear-gradient(145deg, rgba(92,61,42,0.36) 0%, rgba(38,25,18,0.70) 44%, rgba(18,12,9,0.66) 100%)`
      : `linear-gradient(145deg, rgba(${heroAccent.rgb},0.12) 0%, rgba(22,31,38,0.68) 42%, rgba(14,20,25,0.62) 100%)`;
  const heroShadow = palette.isLight
    ? `0 22px 50px -34px rgba(15,23,42,0.30), 0 1px 0 rgba(255,255,255,0.88) inset, 0 0 0 1px rgba(255,255,255,0.32) inset`
    : palette.isCoffee
      ? `0 24px 58px -34px rgba(0,0,0,0.76), 0 1px 0 rgba(255,226,196,0.10) inset, 0 0 0 1px rgba(255,226,196,0.045) inset`
      : `0 24px 58px -38px rgba(0,0,0,0.72), 0 1px 0 rgba(255,255,255,0.11) inset, 0 0 0 1px rgba(255,255,255,0.035) inset`;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        margin: '0 20px',
        padding: 17,
        borderRadius: 32,
        background: heroBackground,
        border: `1px solid ${palette.isLight ? 'rgba(148,163,184,0.14)' : 'rgba(180,210,225,0.11)'}`,
        boxShadow: heroShadow,
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(28px) saturate(170%)',
        WebkitBackdropFilter: 'blur(28px) saturate(170%)'
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 1,
          borderRadius: 31,
          background: palette.isLight
            ? 'linear-gradient(180deg, rgba(255,255,255,0.64), rgba(255,255,255,0.10) 44%, rgba(255,255,255,0.36))'
            : 'linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.018) 44%, rgba(255,255,255,0.045))',
          pointerEvents: 'none'
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10, position: 'relative', zIndex: 1 }}>
        <Motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.005 }}
          whileTap={{ scale: 0.975 }}
          onClick={onOpenUser}
          style={{
            minWidth: 0,
            width: '100%',
            padding: '2px 4px 0',
            border: '1px solid transparent',
            borderRadius: 18,
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            textAlign: 'left',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: 'none'
          }}
        >
          <div style={{
            minHeight: 28,
            padding: '0 10px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            border: `1px solid rgba(${heroAccent.rgb},0.16)`,
            background: `linear-gradient(135deg, rgba(${heroAccent.rgb},0.10), rgba(255,255,255,0.025))`,
            boxShadow: `0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 18px -18px rgba(${heroAccent.rgb},0.65)`,
            fontSize: 10,
            color: palette.muted,
            fontWeight: 850,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            flexShrink: 0
          }}>
            {data.greeting}
          </div>
          <div style={{
            fontSize: 19,
            fontWeight: 880,
            lineHeight: 1.12,
            color: palette.text,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            minWidth: 0
          }}>
            {data.name}
          </div>
        </Motion.button>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          width: '100%',
          padding: '1px 1px 0 1px'
        }}>
          {data.streak > 0 && (
            <TopStreakPill value={data.streak} />
          )}
          <SummaryToggleButton
            collapsed={summaryCollapsed}
            count={selectedStats.length}
            onClick={toggleSummary}
            lang={lang}
            heroAccent={heroAccent}
            palette={palette}
          />
          <Motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.035 }}
            whileTap={{ scale: 0.96 }}
            onClick={onOpenWidgets}
            aria-label={lang === 0 ? 'Настроить верхнюю карточку' : 'Customize top card'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 18,
              border: `1px solid rgba(${heroAccent.rgb},0.22)`,
              background: `linear-gradient(135deg, rgba(${heroAccent.rgb},0.12), rgba(255,255,255,0.045))`,
              color: palette.sub,
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: `0 1px 0 rgba(255,255,255,0.075) inset, 0 10px 20px -16px rgba(0,0,0,0.72), 0 12px 22px -20px rgba(${heroAccent.rgb},0.62)`
            }}
          >
            <IconSliders size={15} />
          </Motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!summaryCollapsed && (
          <Motion.div
            initial={{ height: 0, opacity: 0, y: -6 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 240, damping: 28 }}
            style={{ marginTop: 12, overflow: 'hidden' }}
          >
            <SummaryChips stats={selectedStats} palette={palette} onOpenSection={onOpenSection} />
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
}

function Focus({ data, palette, onOpen, lang }) {
  const accent = getAccent(data.targetId);
  const IconComponent = data.targetId === 'HabitsMain' ? IconFlame : iconMap[data.targetId] || IconSparkle;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EASE, delay: 0.08 }}
      onClick={onOpen}
      style={{
        margin: '14px 20px 0',
        padding: '16px 18px',
        borderRadius: 24,
        background: data.empty
          ? `linear-gradient(145deg, rgba(${accent.rgb},0.15), rgba(18,26,32,0.94))`
          : `linear-gradient(145deg, rgba(${accent.rgb},0.12), rgba(18,26,32,0.94) 46%, rgba(14,20,25,0.94))`,
        border: data.empty ? `1px solid ${accent.ring}` : `1px solid ${palette.border}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 30px -22px rgba(0,0,0,0.68)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative', zIndex: 1 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: accent.soft,
          color: accent.hue,
          border: `1px solid ${accent.ring}`,
          flexShrink: 0
        }}>
          {data.targetId === 'HabitsMain' ? <StreakFlame size={24} /> : <IconComponent size={22} />}
        </div>
        <FocusCopy data={data} accent={accent} palette={palette} />
        <Motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          style={{
            minWidth: 86,
            height: 40,
            borderRadius: 999,
            border: `1px solid rgba(${accent.rgb},0.46)`,
            cursor: 'pointer',
            background: `linear-gradient(135deg, rgba(${accent.rgb},0.28), rgba(${accent.rgb},0.14))`,
            color: accent.hue,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            gap: 7,
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 900,
            boxShadow: `0 12px 22px -18px rgba(${accent.rgb},0.9), 0 1px 0 rgba(255,255,255,0.07) inset`
          }}
        >
          <span>{lang === 0 ? 'Открыть' : 'Open'}</span>
          <IconArrow size={15} stroke={2.2} />
        </Motion.button>
      </div>
    </Motion.div>
  );
}

function CategoryRow({ item, info, showInfo, isPinned, idx, onOpen, onPin, onHide, palette }) {
  const accent = getAccent(item.id);
  const IconComponent = iconMap[item.id] || (() => item.icon);
  const metric = showInfo ? (info || '0') : '';
  const metricParts = getMetricParts(metric);
  const hasActiveStreak = metricParts.isStreak && !metricParts.isZero;
  const rowBackground = palette.isLight
    ? `radial-gradient(190px 98px at 9% 45%, rgba(${accent.rgb},0.24), transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.82) 0%, rgba(245,250,252,0.70) 58%, rgba(232,239,243,0.80) 100%)`
    : palette.isCoffee
      ? `radial-gradient(210px 112px at 8% 50%, rgba(${accent.rgb},0.18), transparent 72%), linear-gradient(135deg, rgba(45,29,20,0.78) 0%, rgba(30,20,15,0.74) 52%, rgba(18,12,9,0.66) 100%)`
      : `radial-gradient(230px 120px at 8% 50%, rgba(${accent.rgb},0.22), transparent 72%), linear-gradient(135deg, rgba(20,31,39,0.78) 0%, rgba(15,23,29,0.78) 52%, rgba(10,15,19,0.66) 100%)`;
  const rowBorder = palette.isLight
    ? hasActiveStreak ? `1px solid rgba(${accent.rgb},0.32)` : `1px solid rgba(148,163,184,${metricParts.isZero ? 0.20 : 0.15})`
    : palette.isCoffee
      ? hasActiveStreak ? `1px solid rgba(${accent.rgb},0.26)` : `1px solid rgba(226,173,118,${metricParts.isZero ? 0.12 : 0.10})`
      : hasActiveStreak ? `1px solid rgba(${accent.rgb},0.34)` : `1px solid rgba(163,196,210,${metricParts.isZero ? 0.15 : 0.12})`;
  const rowShadow = palette.isLight
    ? hasActiveStreak
      ? `0 1px 0 rgba(255,255,255,0.88) inset, 0 -18px 28px -28px rgba(15,23,42,0.14) inset, 0 16px 30px -24px rgba(15,23,42,0.20), 0 0 0 1px rgba(${accent.rgb},0.08), 0 16px 34px -31px rgba(${accent.rgb},0.50)`
      : '0 1px 0 rgba(255,255,255,0.72) inset, 0 14px 30px -26px rgba(15,23,42,0.18)'
    : palette.isCoffee
      ? hasActiveStreak
        ? `0 1px 0 rgba(255,232,205,0.09) inset, 0 -20px 32px -28px rgba(0,0,0,0.80) inset, 0 18px 34px -23px rgba(0,0,0,0.70), 0 13px 32px -26px rgba(${accent.rgb},0.72), 0 0 0 1px rgba(${accent.rgb},0.06)`
        : '0 1px 0 rgba(255,232,205,0.065) inset, 0 -20px 32px -28px rgba(0,0,0,0.78) inset, 0 16px 32px -24px rgba(0,0,0,0.66)'
      : hasActiveStreak
        ? `0 1px 0 rgba(255,255,255,0.10) inset, 0 -20px 32px -28px rgba(0,0,0,0.80) inset, 0 18px 34px -23px rgba(0,0,0,0.74), 0 13px 32px -26px rgba(${accent.rgb},0.80), 0 0 0 1px rgba(${accent.rgb},0.08)`
        : '0 1px 0 rgba(255,255,255,0.075) inset, 0 -20px 32px -28px rgba(0,0,0,0.78) inset, 0 16px 32px -25px rgba(0,0,0,0.70)';
  const rowInnerGlow = palette.isLight
    ? 'linear-gradient(180deg, rgba(255,255,255,0.46), rgba(255,255,255,0.05) 48%, rgba(255,255,255,0.18))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.012) 48%, rgba(255,255,255,0.026))';

  return (
    <Motion.button
      type="button"
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay: 0.04 * idx }}
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.975, y: 1 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, { offset }) => {
        if (offset.x < -80) onHide();
        if (offset.x > 80) onPin();
      }}
      onClick={onOpen}
      aria-label={item.title}
      style={{
        width: '100%',
        minHeight: 72,
        padding: '14px 16px',
        borderRadius: 36,
        marginBottom: 14,
        background: rowBackground,
        border: rowBorder,
        boxShadow: rowShadow,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        cursor: 'pointer',
        touchAction: 'pan-y',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'inherit',
        textAlign: 'left',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {hasActiveStreak && <CategoryAuraBorder accent={accent} palette={palette} idx={idx} />}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 1,
          borderRadius: 35,
          background: rowInnerGlow,
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 20,
        flexShrink: 0,
        background: palette.isLight
          ? `linear-gradient(135deg, rgba(${accent.rgb},0.18), rgba(${accent.rgb},0.08))`
          : `linear-gradient(135deg, rgba(${accent.rgb},0.42), rgba(${accent.rgb},0.16) 58%, rgba(255,255,255,0.055))`,
        color: palette.isLight ? accent.hue : '#F8FBFF',
        border: `1px solid rgba(${accent.rgb},${palette.isLight ? 0.26 : 0.34})`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.10) inset, 0 10px 18px -18px rgba(${accent.rgb},0.45)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <IconComponent size={20} stroke={2.1} />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 850, color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.title}
          </div>
          {isPinned && <FaThumbtack size={11} color={accent.hue} style={{ transform: 'rotate(45deg)', flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 11, color: palette.sub, marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.subtitle}
        </div>
      </div>
      {metric ? (
        <div style={{ textAlign: 'right', minWidth: metricParts.isStreak || metricParts.isZero ? 48 : 40, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
          {metricParts.isStreak ? (
            <StreakMetricPill value={metricParts.value} compact />
          ) : metricParts.isZero ? (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              minWidth: 50,
              height: 27,
              padding: '0 8px',
              borderRadius: 999,
              background: palette.isLight
                ? 'linear-gradient(135deg, rgba(142,152,166,0.12), rgba(15,23,42,0.035))'
                : 'linear-gradient(135deg, rgba(142,152,166,0.16), rgba(255,255,255,0.035))',
              border: `1px solid rgba(${ZERO_METRIC_TONE.rgb},${palette.isLight ? 0.24 : 0.30})`,
              boxShadow: `0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 20px -18px rgba(${ZERO_METRIC_TONE.rgb},0.54)`,
              boxSizing: 'border-box',
              color: ZERO_METRIC_TONE.hue
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                0
              </span>
              <BurntFlame />
            </div>
          ) : (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: 42,
              height: 27,
              padding: '0 9px',
              borderRadius: 999,
              background: accent.soft,
              border: `1px solid ${accent.ring}`,
              boxShadow: `0 1px 0 rgba(255,255,255,0.05) inset, 0 10px 22px -18px ${accent.ring}`,
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: palette.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {metricParts.value}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div style={{ color: palette.muted, position: 'relative', zIndex: 1 }}>
          <IconChevron size={16} />
        </div>
      )}
    </Motion.button>
  );
}

function ActionStrip({ visible, lang, onOpenReferral, onOpenRobot, palette }) {
  if (!visible) return null;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
        padding: '0 20px',
        marginTop: 14
      }}
    >
      <ActionButton Icon={IconCrown} label={lang === 0 ? 'Пригласи друга' : 'Invite'} accent={tokens.accents.premium} onClick={onOpenReferral} palette={palette} />
      <ActionButton Icon={IconSparkle} label={lang === 0 ? 'AI Ассистент' : 'AI Assistant'} accent={tokens.accents.RobotMain} onClick={onOpenRobot} palette={palette} />
    </Motion.div>
  );
}

function ActionButton({ Icon, label, accent, onClick, palette }) {
  const isPremium = accent === tokens.accents.premium;

  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.93, y: 2 }}
      onClick={onClick}
      style={{
        minHeight: 54,
        borderRadius: 22,
        border: `1px solid ${accent.ring}`,
        background: isPremium
          ? `linear-gradient(135deg, rgba(159,180,196,0.18), rgba(159,180,196,0.08))`
          : accent.soft,
        color: accent.hue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: 850,
        boxShadow: isPremium
          ? '0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 20px -18px rgba(159,180,196,0.44)'
          : '0 1px 0 rgba(255,255,255,0.04) inset'
      }}
    >
      {React.createElement(Icon, { size: 18 })}
      <span style={{ color: palette.text }}>{label}</span>
    </Motion.button>
  );
}

function HeaderIconAction({ Icon, accent, onClick, label }) {
  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.03 }}
      whileTap={{ scale: 0.91, y: 2 }}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: 17,
        border: `1px solid ${accent.ring}`,
        background: accent.soft,
        color: accent.hue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      {React.createElement(Icon, { size: 15 })}
    </Motion.button>
  );
}

function HeaderTextAction({ Icon, accent, onClick, label, compact }) {
  const isPremium = accent === tokens.accents.premium;
  const isNeutral = accent?.tone === 'menu';
  const accentRgb = accent.rgb || buildHabitsAccent(accent.hue).rgb;
  const minWidth = isNeutral ? 82 : (compact ? 46 : 92);

  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.02 }}
      whileTap={{ scale: 0.92, y: 2 }}
      onClick={onClick}
      aria-label={label}
      style={{
        height: 34,
        minWidth,
        borderRadius: 18,
        border: `1px solid ${accent.ring}`,
        background: isPremium
          ? `linear-gradient(135deg, rgba(196,211,222,0.24), rgba(116,132,146,0.12))`
          : isNeutral
            ? `linear-gradient(135deg, rgba(${accentRgb},0.18), rgba(${accentRgb},0.075))`
          : `linear-gradient(135deg, rgba(${accentRgb},0.22), rgba(${accentRgb},0.08))`,
        color: accent.hue,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        padding: compact ? '0 10px' : '0 12px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: 'nowrap',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: isPremium
          ? '0 1px 0 rgba(255,255,255,0.085) inset, 0 14px 26px -20px rgba(196,211,222,0.62)'
          : isNeutral
            ? `0 1px 0 rgba(255,255,255,0.075) inset, 0 12px 22px -18px rgba(${accentRgb},0.60)`
          : `0 1px 0 rgba(255,255,255,0.075) inset, 0 12px 22px -18px rgba(${accentRgb},0.74)`
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {React.createElement(Icon, { size: 14 })}
        <span>{label}</span>
      </span>
    </Motion.button>
  );
}

function Dock({ palette, onBack, onOpenUser, onOpenSettings }) {
  return (
    <div style={{
      position: 'fixed',
      left: '50%',
      bottom: 'max(14px, calc(20px + env(safe-area-inset-bottom, 0px)))',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: 'calc(100vw - 72px)',
      maxWidth: 360,
      height: 58,
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      justifyItems: 'center',
      alignItems: 'center',
      padding: '7px 10px',
      boxSizing: 'border-box',
      borderRadius: 999,
      columnGap: 3,
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      boxShadow: '0 1px 0 rgba(255,255,255,0.045) inset, 0 22px 46px -24px rgba(0,0,0,0.74)',
      overflow: 'hidden'
    }}>
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 999,
          background: palette.isLight
            ? 'linear-gradient(135deg, rgba(255,255,255,0.72), rgba(255,255,255,0.42))'
            : 'linear-gradient(135deg, rgba(19,29,36,0.64), rgba(8,13,17,0.50))',
          border: `1px solid ${palette.isLight ? 'rgba(148,163,184,0.28)' : 'rgba(190,220,235,0.14)'}`,
          boxShadow: palette.isLight
            ? '0 1px 0 rgba(255,255,255,0.88) inset, 0 20px 44px -30px rgba(15,23,42,0.28)'
            : '0 1px 0 rgba(255,255,255,0.12) inset, 0 24px 48px -20px rgba(0,0,0,0.76), 0 0 28px rgba(183,243,255,0.08)',
          pointerEvents: 'none',
          zIndex: -1
        }}
      />
      <DockBtn Icon={DockBackIcon} onClick={onBack} palette={palette} />
      <DockBtn Icon={DockUserIcon} onClick={onOpenUser} palette={palette} />
      <DockBtn Icon={ReactSettingsIcon} onClick={onOpenSettings} palette={palette} />
    </div>
  );
}

function DockBtn({ Icon, onClick, primary, palette }) {
  const systemAccent = tokens.accents.profile;
  const iconColor = primary ? tokens.accents.premium.hue : systemAccent.hue;

  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.03 }}
      whileTap={{ scale: 0.90, y: 2 }}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 999,
        border: '1px solid transparent',
        padding: 0,
        cursor: 'pointer',
        background: 'transparent',
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1,
        boxShadow: 'none',
        outline: 'none',
        appearance: 'none',
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {React.createElement(Icon, { color: iconColor, size: 22 })}
    </Motion.button>
  );
}

export default function MainMenuRedesign({
  theme,
  lang,
  visibleItems,
  itemsState,
  hasHiddenItems,
  hasPremium,
  summary,
  onOpenSection,
  onOpenRobot,
  onOpenReferral,
  onOpenPremium,
  onOpenUser,
  onOpenSettings,
  onBack,
  onOpenWidgets,
  onPin,
  onHide,
  onRestoreHidden,
  onTopSecretTap,
  onBottomSecretTap,
  getInfo
}) {
  const isLight = theme === 'light' || theme === 'speciallight';
  const isCoffee = theme === 'coffee' || theme === 'specialcoffee';
  const palette = isCoffee ? tokens.coffee : isLight ? tokens.light : tokens.dark;
  const actionItemVisible = visibleItems.some((item) => item.id === 'MainCard');
  const sectionItems = visibleItems.filter((item) => item.icon);
  const rawHabitsColor = visibleItems.find((item) => item.id === 'HabitsMain')?.color || HABITS_MENU_COLOR;
  const rawTodoColor = visibleItems.find((item) => item.id === 'ToDoMain')?.color || TODO_MENU_COLOR;
  const habitsColor = (colorsAreClose(rawHabitsColor, '#22C55E') || colorsAreClose(rawHabitsColor, '#149DFF') || colorsAreClose(rawHabitsColor, '#36D7D2')) ? HABITS_MENU_COLOR : rawHabitsColor;
  const todoColor = colorsAreClose(rawTodoColor, '#149DFF') ? TODO_MENU_COLOR : rawTodoColor;
  const colorsTooClose = colorsAreClose(rawHabitsColor, rawTodoColor);
  tokens.accents.HabitsMain = toMenuAccent(buildHabitsAccent(colorsTooClose ? HABITS_MENU_COLOR : habitsColor));
  tokens.accents.ToDoMain = toMenuAccent(buildTodoAccent(colorsTooClose ? TODO_MENU_COLOR : todoColor));
  tokens.accents.MentalMain = toMenuAccent(buildSectionAccent(visibleItems.find((item) => item.id === 'MentalMain')?.color || '#A66BFF', '#A66BFF'));
  tokens.accents.TrainingMain = toMenuAccent(buildSectionAccent(visibleItems.find((item) => item.id === 'TrainingMain')?.color || '#579BC8', '#579BC8'));
  tokens.accents.RecoveryMain = toMenuAccent(buildSectionAccent(visibleItems.find((item) => item.id === 'RecoveryMain')?.color || '#2FD6BD', '#2FD6BD'));
  tokens.accents.SleepMain = toMenuAccent(buildSleepAccent(visibleItems.find((item) => item.id === 'SleepMain')?.color || '#7C6CFF'));
  const habitsAccent = tokens.accents.HabitsMain;
  const sleepAccent = tokens.accents.SleepMain;
  const pageBackground = palette.isLight
    ? `radial-gradient(900px 450px at 80% -10%, rgba(${habitsAccent.rgb},0.08), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(${sleepAccent.rgb},0.08), transparent 58%), #F4F5F7`
    : palette.isCoffee
      ? `radial-gradient(900px 460px at 82% -8%, rgba(200,135,74,0.16), transparent 58%), radial-gradient(760px 420px at -12% 42%, rgba(${sleepAccent.rgb},0.08), transparent 60%), linear-gradient(180deg, #271A13 0%, #1A120E 47%, #120C09 100%)`
      : `radial-gradient(900px 460px at 82% -8%, rgba(${habitsAccent.rgb},0.13), transparent 58%), radial-gradient(760px 420px at -12% 42%, rgba(${sleepAccent.rgb},0.11), transparent 60%), linear-gradient(180deg, #18232B 0%, #11171C 46%, #0F1418 100%)`;

  return (
    <div style={{
      background: pageBackground,
      color: palette.text,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative'
    }}>
      <div
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 24, zIndex: 45 }}
        onClick={onTopSecretTap}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        paddingBottom: 'calc(104px + env(safe-area-inset-bottom, 0px))'
      }}>
        <BrandHeader lang={lang} palette={palette} />
        <Hero
          data={summary.hero}
          palette={palette}
          lang={lang}
          onOpenWidgets={onOpenWidgets}
          onOpenUser={onOpenUser}
          onOpenSection={onOpenSection}
        />
        <div style={{ padding: '22px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 11, color: palette.muted, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {lang === 0 ? 'Разделы' : 'Sections'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {actionItemVisible && (
              <HeaderTextAction
                Icon={IconSparkle}
                accent={tokens.accents.RobotMain}
                onClick={onOpenRobot}
                label="AI"
                compact
              />
            )}
            {!hasPremium && (
              <HeaderTextAction
                Icon={IconCrown}
                accent={tokens.accents.premium}
                onClick={onOpenPremium || onOpenReferral}
                label="Premium"
              />
            )}
            <HeaderTextAction
              Icon={IconSliders}
              accent={{
                hue: palette.isLight ? '#4C8794' : AERO_ACCENT.hue,
                soft: palette.isLight ? 'rgba(76,135,148,0.10)' : AERO_ACCENT.soft,
                ring: palette.isLight ? 'rgba(76,135,148,0.20)' : AERO_ACCENT.ring,
                rgb: palette.isLight ? '76,135,148' : AERO_ACCENT.rgb,
                tone: 'menu'
              }}
              onClick={onOpenWidgets}
              label={lang === 0 ? 'Меню' : 'Menu'}
              compact
            />
          </div>
        </div>

        <div style={{ padding: '0 20px' }}>
          <AnimatePresence mode="popLayout">
            {sectionItems.map((item, index) => (
              <CategoryRow
                key={item.id}
                item={item}
                idx={index}
                info={getInfo(item.id)}
                showInfo
                isPinned={itemsState[item.id]?.pinned}
                lang={lang}
                palette={palette}
                onOpen={() => onOpenSection(item.id)}
                onPin={() => onPin(item.id)}
                onHide={() => onHide(item.id)}
              />
            ))}
          </AnimatePresence>

          {hasHiddenItems && (
            <Motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRestoreHidden}
              style={{
                width: '100%',
                minHeight: 46,
                borderRadius: 18,
                border: `1px solid ${palette.border}`,
                background: palette.panel,
                color: palette.sub,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 800,
                marginTop: 6
              }}
            >
              <FaTrashRestore /> {lang === 0 ? 'Вернуть скрытые разделы' : 'Restore hidden sections'}
            </Motion.button>
          )}
          <div style={{ height: 28, width: '100%' }} onClick={onBottomSecretTap} />
        </div>
      </div>
      <Dock palette={palette} onBack={onBack} onOpenUser={onOpenUser} onOpenSettings={onOpenSettings} />
    </div>
  );
}
