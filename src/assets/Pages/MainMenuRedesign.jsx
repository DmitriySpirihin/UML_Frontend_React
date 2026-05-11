import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaThumbtack, FaTrashRestore } from 'react-icons/fa';
import { buildHabitsAccent } from './HabitsPages/HabitVisuals.jsx';
import { buildSleepAccent } from './SleepPages/SleepVisuals.js';

const EASE = [0.2, 0.8, 0.2, 1];

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
    profile: { hue: '#AEBCC8', soft: 'rgba(174,188,200,0.14)', ring: 'rgba(174,188,200,0.24)', rgb: '174,188,200' },
    HabitsMain: { hue: '#24C875', soft: 'rgba(36,200,117,0.14)', ring: 'rgba(36,200,117,0.28)' },
    TrainingMain: { hue: '#21B6EF', soft: 'rgba(33,182,239,0.12)', ring: 'rgba(33,182,239,0.24)' },
    MentalMain: { hue: '#8F65E8', soft: 'rgba(143,101,232,0.14)', ring: 'rgba(143,101,232,0.28)' },
    RecoveryMain: { hue: '#25C6B2', soft: 'rgba(37,198,178,0.14)', ring: 'rgba(37,198,178,0.26)' },
    SleepMain: { hue: '#5B69E8', soft: 'rgba(91,105,232,0.14)', ring: 'rgba(91,105,232,0.28)' },
    ToDoMain: { hue: '#4D7BEF', soft: 'rgba(77,123,239,0.14)', ring: 'rgba(77,123,239,0.28)' },
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
const StreakWatermark = ({ delay = 0 }) => (
  <Motion.div
    aria-hidden="true"
    animate={{ opacity: [0.12, 0.2, 0.13], scale: [0.98, 1.04, 0.99] }}
    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay }}
    style={{
      position: 'absolute',
      right: 18,
      top: '50%',
      marginTop: -49,
      width: 96,
      height: 98,
      pointerEvents: 'none',
      zIndex: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      filter: 'drop-shadow(0 10px 20px rgba(255,122,61,0.12))'
    }}
  >
    <StreakFlame size={96} />
  </Motion.div>
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

const iconMap = {
  HabitsMain: IconHabits,
  TrainingMain: IconTraining,
  MentalMain: IconBrain,
  RecoveryMain: IconRecovery,
  SleepMain: IconSleep,
  ToDoMain: IconTodo
};

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

function TopStreakPill({ value }) {
  return (
    <Motion.div
      aria-hidden="true"
      animate={{
        scale: [1, 1.035, 1],
        boxShadow: [
          '0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 rgba(255,122,61,0)',
          '0 1px 0 rgba(255,255,255,0.08) inset, 0 0 18px rgba(255,122,61,0.24)',
          '0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 rgba(255,122,61,0)'
        ]
      }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        height: 30,
        minWidth: 54,
        padding: '0 10px',
        borderRadius: 999,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        border: '1px solid rgba(255,122,61,0.38)',
        background: 'linear-gradient(135deg, rgba(255,122,61,0.22), rgba(73,37,24,0.28) 58%, rgba(255,211,106,0.08))',
        color: '#FFD36A',
        boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset, 0 10px 20px -16px rgba(255,122,61,0.48)'
      }}
    >
      <StreakFlame size={13} />
      <span style={{ color: '#F2F3F5', fontSize: 12, fontWeight: 900, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </Motion.div>
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
  const statBackground = palette.isLight
    ? `linear-gradient(135deg, rgba(${accent.rgb},0.18) 0%, rgba(255,255,255,0.86) 52%, rgba(${accent.rgb},0.08) 100%)`
    : palette.isCoffee
      ? `linear-gradient(135deg, rgba(${accent.rgb},0.16) 0%, rgba(74,49,34,0.18) 48%, rgba(22,14,10,0.42) 100%)`
      : `linear-gradient(135deg, rgba(${accent.rgb},0.18) 0%, rgba(${accent.rgb},0.08) 46%, rgba(255,255,255,0.035) 100%)`;
  const statShadow = palette.isLight
    ? `0 1px 0 rgba(255,255,255,0.82) inset, 0 12px 24px -18px rgba(15,23,42,0.28), 0 12px 24px -20px rgba(${accent.rgb},0.58)`
    : palette.isCoffee
      ? `0 1px 0 rgba(255,232,205,0.08) inset, 0 -12px 20px -22px rgba(0,0,0,0.9) inset, 0 12px 24px -17px rgba(0,0,0,0.74), 0 12px 24px -22px rgba(${accent.rgb},0.7)`
      : `0 1px 0 rgba(255,255,255,0.08) inset, 0 -12px 20px -22px rgba(0,0,0,0.9) inset, 0 10px 22px -16px rgba(0,0,0,0.62), 0 12px 24px -20px rgba(${accent.rgb},0.92)`;

  return (
    <Motion.button
      type="button"
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
      minHeight: 46,
      padding: '9px 10px',
      borderRadius: 22,
      background: statBackground,
      border: `1px solid rgba(${accent.rgb},0.26)`,
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
        <div style={{ width: 5, height: 5, borderRadius: 999, background: accent.hue, flexShrink: 0, boxShadow: `0 0 10px rgba(${accent.rgb},0.72)` }} />
        <div style={{ fontSize: 10, color: palette.sub, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, color: palette.text, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
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
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1.05,
        color: palette.text,
        opacity: 0.86
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
  const heroBackground = palette.isLight
    ? `linear-gradient(145deg, rgba(255,255,255,0.98) 0%, rgba(${heroAccent.rgb},0.08) 58%, rgba(235,242,246,0.96) 100%)`
    : palette.isCoffee
      ? `linear-gradient(145deg, rgba(67,44,31,0.32) 0%, rgba(39,26,19,0.96) 44%, rgba(22,14,10,0.96) 100%)`
      : `linear-gradient(145deg, rgba(${heroAccent.rgb},0.16) 0%, rgba(22,31,38,0.96) 42%, rgba(14,20,25,0.96) 100%)`;
  const heroShadow = palette.isLight
    ? `0 18px 40px -30px rgba(15,23,42,0.28), 0 1px 0 rgba(255,255,255,0.86) inset`
    : palette.isCoffee
      ? `0 18px 40px -34px rgba(0,0,0,0.72), 0 1px 0 rgba(255,226,196,0.055) inset`
      : `0 18px 40px -34px rgba(${heroAccent.rgb},0.38), 0 1px 0 rgba(255,255,255,0.045) inset`;

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
        border: `1px solid ${palette.isLight ? 'rgba(148,163,184,0.16)' : palette.border}`,
        boxShadow: heroShadow,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
        <Motion.button
          type="button"
          whileHover={{ y: -1, scale: 1.005 }}
          whileTap={{ scale: 0.975 }}
          onClick={onOpenUser}
          style={{
            minWidth: 0,
            flex: 1,
            padding: '8px 12px',
            border: `1px solid rgba(${heroAccent.rgb},0.14)`,
            borderRadius: 23,
            background: `linear-gradient(135deg, rgba(${heroAccent.rgb},0.09), rgba(255,255,255,0.018))`,
            textAlign: 'left',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent',
            boxShadow: `0 1px 0 rgba(255,255,255,0.045) inset, 0 10px 20px -20px rgba(${heroAccent.rgb},0.55)`
          }}
        >
          <div style={{ fontSize: 10, color: palette.muted, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
            {data.greeting}
          </div>
          <div style={{ fontSize: 19, fontWeight: 820, lineHeight: 1.08, color: palette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.name}
          </div>
        </Motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {data.streak > 0 && (
            <TopStreakPill value={data.streak} />
          )}
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

      <div style={{
        marginTop: 18,
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ fontSize: 11, color: heroAccent.hue, fontWeight: 850, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
          {lang === 0 ? 'Сегодня' : 'Today'}
        </div>
        <div style={{ fontSize: 15, fontWeight: 820, color: palette.text, lineHeight: 1.18 }}>
          {data.progressLabel}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <SummaryChips stats={selectedStats} palette={palette} onOpenSection={onOpenSection} />
      </div>
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
  const streakNumber = Number.parseInt(metricParts.value, 10);
  const isFreshStreak = metricParts.isStreak && streakNumber === 1;
  const hasActiveStreak = metricParts.isStreak && !metricParts.isZero;
  const iconTone = metricParts.isZero
    ? {
      hue: accent.hue,
      soft: palette.isLight
        ? `linear-gradient(135deg, rgba(${accent.rgb},0.13), rgba(15,23,42,0.035))`
        : `linear-gradient(135deg, rgba(${accent.rgb},0.16), rgba(255,255,255,0.035))`,
      ring: `rgba(${accent.rgb},${palette.isLight ? 0.22 : 0.30})`
    }
    : accent;
  const rowBackground = palette.isLight
    ? metricParts.isZero
      ? `radial-gradient(190px 90px at 14% 50%, rgba(${accent.rgb},0.20), transparent 74%), linear-gradient(135deg, rgba(${accent.rgb},0.16) 0%, rgba(255,255,255,0.88) 54%, rgba(238,244,247,0.94) 100%)`
      : `radial-gradient(220px 102px at 14% 50%, rgba(${accent.rgb},0.28), transparent 76%), linear-gradient(135deg, rgba(${accent.rgb},0.22) 0%, rgba(255,255,255,0.86) 56%, rgba(232,239,243,0.94) 100%)`
    : palette.isCoffee
      ? metricParts.isZero
        ? `radial-gradient(180px 90px at 12% 50%, rgba(${accent.rgb},0.19), transparent 74%), linear-gradient(135deg, rgba(${accent.rgb},0.13) 0%, rgba(45,29,20,0.93) 100%)`
        : `radial-gradient(210px 100px at 12% 50%, rgba(${accent.rgb},0.28), transparent 76%), linear-gradient(135deg, rgba(${accent.rgb},0.18) 0%, rgba(45,29,20,0.93) 100%)`
      : metricParts.isZero
        ? `radial-gradient(180px 90px at 12% 50%, rgba(${accent.rgb},0.24), transparent 74%), linear-gradient(135deg, rgba(${accent.rgb},0.16) 0%, rgba(18,28,35,0.92) 100%)`
        : `radial-gradient(210px 100px at 12% 50%, rgba(${accent.rgb},0.36), transparent 76%), linear-gradient(135deg, rgba(${accent.rgb},0.24) 0%, rgba(18,28,35,0.92) 100%)`;
  const rowBorder = palette.isLight
    ? `1px solid rgba(${accent.rgb},0.22)`
    : palette.isCoffee
      ? `1px solid rgba(${accent.rgb},0.13)`
      : '1px solid rgba(255,255,255,0.035)';
  const rowShadow = palette.isLight
    ? `0 1px 0 rgba(255,255,255,0.88) inset, 0 -18px 28px -28px rgba(15,23,42,0.18) inset, 0 16px 30px -22px rgba(15,23,42,0.26), 0 16px 30px -26px rgba(${accent.rgb},0.6)`
    : palette.isCoffee
      ? `0 1px 0 rgba(255,232,205,0.08) inset, 0 -20px 32px -28px rgba(0,0,0,0.86) inset, 0 18px 34px -22px rgba(0,0,0,0.82), 0 18px 34px -30px rgba(${accent.rgb},0.7)`
      : `0 1px 0 rgba(255,255,255,0.09) inset, 0 -20px 32px -28px rgba(0,0,0,0.86) inset, 0 18px 34px -22px rgba(0,0,0,0.88), 0 18px 34px -28px rgba(${accent.rgb},0.82)`;
  const rowInnerGlow = palette.isLight
    ? `radial-gradient(220px 70px at 20% 0%, rgba(255,255,255,0.68), transparent 70%), radial-gradient(190px 70px at 15% 100%, rgba(${accent.rgb},0.08), transparent 72%)`
    : `radial-gradient(220px 70px at 20% 0%, rgba(255,255,255,0.085), transparent 70%), radial-gradient(190px 70px at 15% 100%, rgba(${accent.rgb},0.08), transparent 72%)`;

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
      {hasActiveStreak && <StreakWatermark delay={idx * 0.14} />}
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
      {metricParts.isZero && (
        <Motion.div
          aria-hidden="true"
          animate={{ opacity: [0.06, 0.16, 0.06], scale: [0.99, 1.01, 0.99] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.16 }}
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: 35,
            background: `radial-gradient(280px 130px at 12% 50%, rgba(${accent.rgb},0.46), transparent 70%)`,
            pointerEvents: 'none'
          }}
        />
      )}
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 20,
        flexShrink: 0,
        background: iconTone.soft,
        color: iconTone.hue,
        border: `1px solid ${iconTone.ring}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <IconComponent size={19} />
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
            <Motion.div
              animate={hasActiveStreak ? { scale: isFreshStreak ? [1, 1.045, 1] : [1, 1.028, 1], boxShadow: [
                '0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 rgba(255,122,61,0)',
                '0 1px 0 rgba(255,255,255,0.08) inset, 0 0 16px rgba(255,122,61,0.26)',
                '0 1px 0 rgba(255,255,255,0.05) inset, 0 0 0 rgba(255,122,61,0)'
              ] } : undefined}
              transition={hasActiveStreak ? { duration: isFreshStreak ? 2.8 : 3.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
              style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              minWidth: 42,
              height: 27,
              padding: '0 8px',
              borderRadius: 999,
              background: 'linear-gradient(135deg, rgba(255,122,61,0.18), rgba(255,211,106,0.08))',
              border: '1px solid rgba(255,122,61,0.3)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset',
              boxSizing: 'border-box'
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: palette.text, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {metricParts.value}
              </span>
              <StreakFlame />
            </Motion.div>
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
                ? `linear-gradient(135deg, rgba(${accent.rgb},0.14), rgba(15,23,42,0.035))`
                : `linear-gradient(135deg, rgba(${accent.rgb},0.18), rgba(255,255,255,0.035))`,
              border: `1px solid rgba(${accent.rgb},${palette.isLight ? 0.24 : 0.34})`,
              boxShadow: `0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 20px -18px rgba(${accent.rgb},0.75)`,
              boxSizing: 'border-box',
              color: accent.hue
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
      whileTap={{ scale: 0.96 }}
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
      whileTap={{ scale: 0.94 }}
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
      whileTap={{ scale: 0.96 }}
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
            ? 'linear-gradient(135deg, rgba(175,196,212,0.17), rgba(92,108,122,0.09))'
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
            ? '0 1px 0 rgba(255,255,255,0.075) inset, 0 12px 22px -18px rgba(0,0,0,0.72)'
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
      bottom: 'calc(30px + env(safe-area-inset-bottom, 0px))',
      transform: 'translateX(-50%)',
      zIndex: 40,
      width: 230,
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '10px 14px',
      boxSizing: 'border-box',
      borderRadius: 999,
      background: palette.panelStrong,
      border: `1px solid ${palette.border}`,
      boxShadow: '0 1px 0 rgba(255,255,255,0.05) inset, 0 24px 48px -20px rgba(0,0,0,0.72)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)'
    }}>
      <DockBtn Icon={DockBackIcon} onClick={onBack} palette={palette} />
      <DockBtn Icon={DockUserIcon} onClick={onOpenUser} palette={palette} />
      <DockBtn Icon={ReactSettingsIcon} onClick={onOpenSettings} palette={palette} />
    </div>
  );
}

function DockBtn({ Icon, onClick, primary, palette }) {
  const iconColor = primary ? tokens.accents.premium.hue : palette.sub;

  return (
    <Motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: '1px solid transparent',
        cursor: 'pointer',
        background: 'transparent',
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1
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
  tokens.accents.HabitsMain = buildHabitsAccent(visibleItems.find((item) => item.id === 'HabitsMain')?.color);
  tokens.accents.ToDoMain = buildHabitsAccent(visibleItems.find((item) => item.id === 'ToDoMain')?.color || tokens.accents.ToDoMain.hue);
  tokens.accents.RecoveryMain = buildHabitsAccent(visibleItems.find((item) => item.id === 'RecoveryMain')?.color || tokens.accents.RecoveryMain.hue);
  tokens.accents.SleepMain = toMenuAccent(buildSleepAccent(visibleItems.find((item) => item.id === 'SleepMain')?.color));
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
                hue: palette.isLight ? '#536676' : '#AEBCC8',
                soft: 'rgba(175,196,212,0.1)',
                ring: palette.isLight ? 'rgba(82,108,127,0.18)' : 'rgba(175,196,212,0.2)',
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
