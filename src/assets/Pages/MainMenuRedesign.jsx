import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog, FaThumbtack, FaTrashRestore } from 'react-icons/fa';
import { buildHabitsAccent } from './HabitsPages/HabitVisuals.jsx';
import { buildSleepAccent } from './SleepPages/SleepVisuals.js';

const EASE = [0.2, 0.8, 0.2, 1];

const tokens = {
  dark: {
    isLight: false,
    bg: '#0E1013',
    settingsTop: '#15181c',
    settingsBorder: '#242830',
    panel: 'rgba(26,29,33,0.84)',
    panelStrong: 'rgba(20,23,25,0.92)',
    border: 'rgba(255,255,255,0.07)',
    text: '#F2F3F5',
    sub: '#A6ADB8',
    muted: '#6B7280',
    faint: 'rgba(255,255,255,0.04)'
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
  accents: {
    HabitsMain: { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)' },
    TrainingMain: { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)' },
    MentalMain: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)' },
    RecoveryMain: { hue: '#78B879', soft: 'rgba(120,184,121,0.13)', ring: 'rgba(120,184,121,0.26)' },
    SleepMain: { hue: '#6F8BD6', soft: 'rgba(111,139,214,0.14)', ring: 'rgba(111,139,214,0.28)' },
    ToDoMain: { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)' },
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

function RingStack({ rings }) {
  const data = [
    { v: rings.habits, c: tokens.accents.HabitsMain.hue, r: 42 },
    { v: rings.training, c: tokens.accents.TrainingMain.hue, r: 32 },
    { v: rings.mental, c: tokens.accents.MentalMain.hue, r: 22 }
  ];

  return (
    <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
      {data.map((d, i) => {
        const circumference = 2 * Math.PI * d.r;
        return (
          <g key={d.c} transform="rotate(-90 52 52)">
            <circle cx="52" cy="52" r={d.r} stroke="rgba(255,255,255,0.07)" strokeWidth="4" fill="none" />
            <motion.circle
              cx="52"
              cy="52"
              r={d.r}
              stroke={d.c}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - circumference * Math.max(0, Math.min(1, d.v)) }}
              transition={{ duration: 1, ease: EASE, delay: i * 0.08 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function HeroStat({ dot, label, value, palette, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
      minHeight: 46,
      padding: '9px 10px',
      borderRadius: 15,
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,255,255,0.055)',
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
      WebkitTapHighlightColor: 'transparent'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 5, height: 5, borderRadius: 999, background: dot, flexShrink: 0 }} />
        <div style={{ fontSize: 10, color: palette.sub, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      </div>
      <div style={{ fontSize: 15, color: palette.text, fontWeight: 850, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </motion.button>
  );
}

function Topbar({ lang, isPremium, onOpenRobot, onOpenReferral, onOpenSettings, palette }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px' }}>
      <motion.button
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
      </motion.button>
      <div style={{ display: 'flex', gap: 8 }}>
        <TopIconButton onClick={onOpenReferral} palette={palette} Icon={IconCrown} active={isPremium} />
        <TopIconButton onClick={onOpenSettings} palette={palette} Icon={ReactSettingsIcon} />
      </div>
    </div>
  );
}

function TopIconButton({ Icon, onClick, palette, active }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        width: 38,
        height: 38,
        borderRadius: 13,
        border: `1px solid ${active ? tokens.accents.premium.ring : palette.border}`,
        background: active ? tokens.accents.premium.soft : palette.panel,
        color: active ? tokens.accents.premium.hue : palette.sub,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Icon size={18} />
    </motion.button>
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
  const heroAccent = getAccent('HabitsMain');
  const selectedStats = Array.isArray(data.stats) && data.stats.length > 0
    ? data.stats
    : [
        { id: 'HabitsMain', label: lang === 0 ? 'Привычки' : 'Habits', value: data.habitsValue },
        { id: 'TrainingMain', label: lang === 0 ? 'Тоннаж' : 'Volume', value: data.trainingValue },
        { id: 'MentalMain', label: lang === 0 ? 'Ум' : 'Mind', value: data.mentalValue }
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      style={{
        margin: '0 20px',
        padding: 18,
        borderRadius: 24,
        background: palette.isLight
          ? `linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(${heroAccent.rgb},0.08) 58%, rgba(${heroAccent.rgb},0.08) 100%)`
          : `linear-gradient(145deg, rgba(23,27,31,0.96) 0%, rgba(${heroAccent.rgb},0.10) 54%, rgba(${heroAccent.rgb},0.08) 100%)`,
        border: `1px solid ${heroAccent.ring}`,
        boxShadow: palette.isLight
          ? `0 16px 38px -34px rgba(${heroAccent.rgb},0.45), 0 1px 0 rgba(255,255,255,0.72) inset`
          : `0 18px 40px -34px rgba(${heroAccent.rgb},0.50), 0 1px 0 rgba(255,255,255,0.055) inset`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{
        position: 'absolute',
        right: '-44px',
        top: '-58px',
        width: 170,
        height: 170,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(${heroAccent.rgb},0.22) 0%, transparent 62%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, position: 'relative' }}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={onOpenUser}
          style={{
            minWidth: 0,
            flex: 1,
            padding: 0,
            border: 'none',
            background: 'transparent',
            textAlign: 'left',
            fontFamily: 'inherit',
            cursor: 'pointer',
            outline: 'none',
            WebkitTapHighlightColor: 'transparent'
          }}
        >
          <div style={{ fontSize: 10, color: palette.muted, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>
            {data.greeting}
          </div>
          <div style={{ fontSize: 23, fontWeight: 850, lineHeight: 1.05, color: palette.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {data.name}
          </div>
        </motion.button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {data.streak > 0 && (
            <Pill style={{ color: tokens.accents.HabitsMain.hue, borderColor: tokens.accents.HabitsMain.ring, background: tokens.accents.HabitsMain.soft }}>
              <IconFlame size={12} />
              <span>{data.streak}</span>
            </Pill>
          )}
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onOpenWidgets}
            aria-label={lang === 0 ? 'Настроить верхнюю карточку' : 'Customize top card'}
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              border: `1px solid ${palette.border}`,
              background: 'rgba(255,255,255,0.055)',
              color: palette.sub,
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
              cursor: 'pointer',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset'
            }}
          >
            <IconSliders size={15} />
          </motion.button>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${Math.min(3, selectedStats.length)}, minmax(0, 1fr))`,
        gap: 8,
        marginTop: 18,
        position: 'relative'
      }}>
        {selectedStats.map((stat) => (
          <HeroStat
            key={stat.id}
            dot={getAccent(stat.id).hue}
            label={stat.label}
            value={stat.value}
            palette={palette}
            onClick={() => onOpenSection(stat.id)}
          />
        ))}
      </div>
    </motion.div>
  );
}

function Focus({ data, palette, lang, onOpen }) {
  const accent = getAccent(data.targetId);
  const IconComponent = data.targetId === 'HabitsMain' ? IconFlame : iconMap[data.targetId] || IconSparkle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: EASE, delay: 0.08 }}
      onClick={onOpen}
      style={{
        margin: '18px 20px 0',
        padding: 20,
        borderRadius: 24,
        background: data.empty ? `rgba(${accent.rgb},0.06)` : palette.panel,
        border: data.empty ? `1px solid ${accent.ring}` : `1px solid ${palette.border}`,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 30px -22px rgba(0,0,0,0.68)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
      }}
    >
      {!data.empty && <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent.hue }} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
          <IconComponent size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, color: accent.hue, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
            {data.status}
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.title}
          </div>
          <div style={{ fontSize: 12, color: palette.sub, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {data.meta}
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={(event) => {
            event.stopPropagation();
            onOpen();
          }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            background: accent.hue,
            color: '#0E1013',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <IconArrow size={18} stroke={2} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function CategoryRow({ item, info, showInfo, isPinned, lang, idx, onOpen, onPin, onHide, palette }) {
  const accent = getAccent(item.id);
  const IconComponent = iconMap[item.id] || (() => item.icon);
  const metric = showInfo && info ? info : '';
  const metricParts = getMetricParts(metric);
  const iconTone = metricParts.isZero
    ? {
      hue: palette.muted,
      soft: palette.isLight
        ? 'linear-gradient(135deg, rgba(100,111,124,0.1), rgba(15,23,42,0.035))'
        : 'linear-gradient(135deg, rgba(104,113,123,0.18), rgba(255,255,255,0.035))',
      ring: palette.isLight ? 'rgba(100,111,124,0.2)' : 'rgba(104,113,123,0.32)'
    }
    : accent;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -80, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.32, ease: EASE, delay: 0.04 * idx }}
      whileTap={{ scale: 0.985 }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(event, { offset }) => {
        if (offset.x < -80) onHide();
        if (offset.x > 80) onPin();
      }}
      onClick={onOpen}
      style={{
        minHeight: 72,
        padding: '13px 16px',
        borderRadius: 18,
        marginBottom: 10,
        background: metricParts.isZero
          ? palette.panel
          : `radial-gradient(260px 130px at 6% 50%, ${accent.soft} 0%, transparent 72%), ${palette.panel}`,
        border: `1px solid ${isPinned ? accent.ring : palette.border}`,
        boxShadow: `0 1px 0 rgba(255,255,255,0.04) inset, 0 8px 24px -18px rgba(0,0,0,0.65), 0 18px 34px -34px ${accent.ring}`,
        display: 'flex',
        alignItems: 'center',
        gap: 13,
        cursor: 'pointer',
        touchAction: 'pan-y'
      }}
    >
      <div style={{
        width: 42,
        height: 42,
        borderRadius: 13,
        flexShrink: 0,
        background: iconTone.soft,
        color: iconTone.hue,
        border: `1px solid ${iconTone.ring}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <IconComponent size={19} />
      </div>
      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 850, color: palette.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.title}
          </div>
          {isPinned && <FaThumbtack size={11} color={accent.hue} style={{ transform: 'rotate(45deg)', flexShrink: 0 }} />}
        </div>
        <div style={{ fontSize: 11, color: palette.sub, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.subtitle}
        </div>
      </div>
      {metric ? (
        <div style={{ textAlign: 'right', minWidth: metricParts.isStreak || metricParts.isZero ? 58 : 44, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {metricParts.isStreak ? (
            <div style={{
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
            </div>
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
                ? 'linear-gradient(135deg, rgba(100,111,124,0.1), rgba(15,23,42,0.035))'
                : 'linear-gradient(135deg, rgba(104,113,123,0.18), rgba(255,255,255,0.035))',
              border: palette.isLight ? '1px solid rgba(100,111,124,0.2)' : '1px solid rgba(104,113,123,0.32)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 10px 20px -18px rgba(104,113,123,0.7)',
              boxSizing: 'border-box',
              color: palette.muted
            }}>
              <span style={{ fontSize: 15, fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                0
              </span>
              <BurntFlame />
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 850, color: palette.text, fontVariantNumeric: 'tabular-nums' }}>
              {metricParts.value}
            </div>
          )}
          <div style={{ fontSize: 9, color: palette.muted, fontWeight: 750, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: 2 }}>
            {metricParts.isStreak
              ? (lang === 0 ? 'серия' : 'streak')
              : metricParts.isZero
                ? (lang === 0 ? 'начать' : 'start')
                : (lang === 0 ? 'итог' : 'total')}
          </div>
        </div>
      ) : (
        <div style={{ color: palette.muted }}>
          <IconChevron size={16} />
        </div>
      )}
    </motion.div>
  );
}

function ActionStrip({ visible, lang, onOpenReferral, onOpenRobot, palette }) {
  if (!visible) return null;

  return (
    <motion.div
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
    </motion.div>
  );
}

function ActionButton({ Icon, label, accent, onClick, palette }) {
  const isPremium = accent === tokens.accents.premium;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      style={{
        minHeight: 54,
        borderRadius: 18,
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
      <Icon size={18} />
      <span style={{ color: palette.text }}>{label}</span>
    </motion.button>
  );
}

function HeaderIconAction({ Icon, accent, onClick, label }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        border: `1px solid ${accent.ring}`,
        background: accent.soft,
        color: accent.hue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer'
      }}
    >
      <Icon size={15} />
    </motion.button>
  );
}

function HeaderTextAction({ Icon, accent, onClick, label, compact }) {
  const isPremium = accent === tokens.accents.premium;
  const isNeutral = accent?.tone === 'menu';
  const minWidth = isNeutral ? 82 : (compact ? 46 : 92);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      aria-label={label}
      style={{
        height: 34,
        minWidth,
        borderRadius: 12,
        border: `1px solid ${accent.ring}`,
        background: isPremium
          ? `linear-gradient(135deg, rgba(196,211,222,0.24), rgba(116,132,146,0.12))`
          : isNeutral
            ? 'linear-gradient(135deg, rgba(175,196,212,0.12), rgba(92,108,122,0.075))'
          : accent.soft,
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
            ? '0 1px 0 rgba(255,255,255,0.045) inset'
          : 'none'
      }}
    >
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <Icon size={14} />
        <span>{label}</span>
      </span>
    </motion.button>
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
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: 999,
        border: primary ? `1px solid ${tokens.accents.premium.ring}` : '1px solid transparent',
        cursor: 'pointer',
        background: primary ? tokens.accents.premium.soft : 'transparent',
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 1
      }}
    >
      <Icon color={iconColor} size={22} />
    </motion.button>
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
  const palette = isLight ? tokens.light : tokens.dark;
  const actionItemVisible = visibleItems.some((item) => item.id === 'MainCard');
  const sectionItems = visibleItems.filter((item) => item.icon);
  tokens.accents.HabitsMain = buildHabitsAccent(visibleItems.find((item) => item.id === 'HabitsMain')?.color);
  tokens.accents.SleepMain = toMenuAccent(buildSleepAccent(visibleItems.find((item) => item.id === 'SleepMain')?.color));
  const habitsAccent = tokens.accents.HabitsMain;
  const sleepAccent = tokens.accents.SleepMain;

  return (
    <div style={{
      background: isLight
        ? `radial-gradient(900px 450px at 80% -10%, rgba(${habitsAccent.rgb},0.1), transparent 58%), radial-gradient(700px 360px at -10% 100%, rgba(${sleepAccent.rgb},0.1), transparent 58%), #F4F5F7`
        : `radial-gradient(1000px 500px at 80% -10%, rgba(${habitsAccent.rgb},0.07), transparent 55%), radial-gradient(800px 400px at -10% 100%, rgba(${sleepAccent.rgb},0.07), transparent 55%), #0E1013`,
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

        <div style={{ padding: '18px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <motion.button
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
            </motion.button>
          )}
          <div style={{ height: 28, width: '100%' }} onClick={onBottomSecretTap} />
        </div>
      </div>
      <Dock palette={palette} onBack={onBack} onOpenUser={onOpenUser} onOpenSettings={onOpenSettings} />
    </div>
  );
}
