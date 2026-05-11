import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaPalette, FaPlus, FaTimes } from 'react-icons/fa';
import Colors from '../StaticClasses/Colors';

export const POSITIVE_ACCENT_PRESETS = [
  '#39D982',
  '#5F8DFF',
  '#A66BFF',
  '#2FD6BD',
  '#6F7DFF',
  '#35C2FF',
  '#B48BC8',
  '#C29AD6',
  '#6772A6',
  '#66D9E8'
];

export const isCoffeeSectionAccent = (color) => {
  if (typeof color !== 'string') return false;
  const value = color.trim().toUpperCase();
  if (!/^#[0-9A-F]{6}$/.test(value)) return false;
  if (['#B86A37', '#B87963', '#D8785E', '#D49A5C', '#C8A46F', '#A57926', '#A46C3B', '#A6846B', '#8F6A4A', '#9A8580'].includes(value)) return true;

  const int = Number.parseInt(value.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return r > g && g > b && r >= 120 && g >= 70 && b <= 120 && saturation > 0.22;
};

export const normalizeSectionAccent = (color, fallback = '#2FD6BD') => {
  if (typeof color !== 'string') return fallback;
  const value = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    const normalized = value.toUpperCase();
    return isCoffeeSectionAccent(normalized) ? fallback : normalized;
  }
  if (/^#[0-9a-fA-F]{3}$/.test(value)) {
    const normalized = `#${value.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
    return isCoffeeSectionAccent(normalized) ? fallback : normalized;
  }
  return fallback;
};

export const buildSectionAccent = (color = '#2FD6BD', fallback = '#2FD6BD') => {
  const hue = normalizeSectionAccent(color, fallback);
  const int = Number.parseInt(hue.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const rgb = `${r}, ${g}, ${b}`;
  return {
    hue,
    rgb,
    soft: `rgba(${rgb}, 0.18)`,
    faint: `rgba(${rgb}, 0.10)`,
    ring: `rgba(${rgb}, 0.38)`,
    glow: `rgba(${rgb}, 0.34)`
  };
};

const mergePresets = (defaults, custom = []) => {
  const colors = [...defaults, ...(Array.isArray(custom) ? custom : [])]
    .map(color => buildSectionAccent(color).hue);
  return colors.filter((color, index) => colors.indexOf(color) === index);
};

export default function SectionAccentSettings({
  show,
  onClose,
  theme,
  langIndex,
  title,
  subtitle,
  accentColor,
  customPresets,
  onAccentChange,
  onSavePreset,
  presets = POSITIVE_ACCENT_PRESETS,
  fallbackColor = '#2FD6BD'
}) {
  const isLight = theme === 'light' || theme === 'speciallight';
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const accent = buildSectionAccent(accentColor, fallbackColor);
  const presetColors = mergePresets(presets, customPresets);
  const presetSaved = presetColors.some(color => color.toUpperCase() === accent.hue.toUpperCase());

  return (
    <AnimatePresence>
      {show && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 5000,
              background: 'rgba(0,0,0,0.58)',
              backdropFilter: 'blur(8px)'
            }}
          />
          <motion.div
            initial={{ y: 34, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 34, opacity: 0, scale: 0.98 }}
            style={{
              position: 'fixed',
              left: '4%',
              right: '4%',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 18px)',
              maxWidth: 560,
              margin: '0 auto',
              zIndex: 5001,
              borderRadius: 26,
              padding: 18,
              boxSizing: 'border-box',
              background: `radial-gradient(260px 180px at 92% 4%, ${accent.soft} 0%, transparent 68%), ${isLight ? 'rgba(255,255,255,0.97)' : 'rgba(18,21,25,0.97)'}`,
              border: `1px solid ${isLight ? 'rgba(15,23,42,0.08)' : accent.ring}`,
              boxShadow: isLight ? '0 24px 70px rgba(0,0,0,0.18)' : '0 28px 80px rgba(0,0,0,0.72)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent.hue, background: accent.soft, border: `1px solid ${accent.ring}` }}>
                <FaPalette />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: text, fontSize: 18, fontWeight: 900 }}>{title}</div>
                <div style={{ color: sub, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{subtitle}</div>
              </div>
              <button type="button" onClick={onClose} style={{ border: 'none', background: 'transparent', color: sub, fontSize: 18, padding: 8 }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ color: text, fontSize: 14, fontWeight: 850 }}>{langIndex === 0 ? 'Основной цвет' : 'Main color'}</div>
                <div style={{ color: sub, fontSize: 11, fontWeight: 650, marginTop: 2 }}>{accent.hue}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <motion.button
                  type="button"
                  whileTap={!presetSaved ? { scale: 0.94 } : {}}
                  onClick={presetSaved ? undefined : onSavePreset}
                  disabled={presetSaved}
                  style={{
                    minHeight: 38,
                    borderRadius: 14,
                    border: `1px solid ${presetSaved ? (isLight ? 'rgba(15,23,42,0.08)' : 'rgba(255,255,255,0.09)') : accent.ring}`,
                    background: presetSaved ? (isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.045)') : accent.soft,
                    color: presetSaved ? sub : accent.hue,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    padding: '0 11px',
                    fontSize: 11,
                    fontWeight: 900,
                    fontFamily: 'inherit',
                    cursor: presetSaved ? 'default' : 'pointer'
                  }}
                >
                  <FaPlus size={10} />
                  <span>{presetSaved ? (langIndex === 0 ? 'В пресетах' : 'Saved') : (langIndex === 0 ? 'В пресет' : 'Save')}</span>
                </motion.button>
                <input type="color" value={accent.hue} onChange={(event) => onAccentChange(event.target.value)} style={{ width: 44, height: 44, borderRadius: 14, border: `1px solid ${accent.ring}`, background: 'transparent', padding: 0 }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 8 }}>
              {presetColors.map(color => {
                const active = accent.hue.toUpperCase() === color.toUpperCase();
                return (
                  <motion.button
                    key={color}
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={() => onAccentChange(color)}
                    aria-label={color}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      minHeight: 30,
                      borderRadius: 11,
                      border: active ? `2px solid ${text}` : `1px solid ${isLight ? 'rgba(15,23,42,0.1)' : 'rgba(255,255,255,0.1)'}`,
                      background: color,
                      boxShadow: active ? `0 0 18px ${color}55` : 'none',
                      cursor: 'pointer'
                    }}
                  />
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
