import React from 'react';
import Colors from '../StaticClasses/Colors.js';

export const normalizeCustomEmoji = (value) => {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(trimmed)][0]?.segment || '';
  }
  return Array.from(trimmed)[0] || '';
};

export const emojiFromIconName = (iconName) => (
  typeof iconName === 'string' && iconName.startsWith('emoji:') ? iconName.slice(6).trim() : ''
);

const hexToRgbText = (hex) => {
  const value = typeof hex === 'string' && /^#[0-9a-fA-F]{6}$/.test(hex.trim()) ? hex.trim().slice(1) : '55DDEB';
  const int = Number.parseInt(value, 16);
  return `${(int >> 16) & 255},${(int >> 8) & 255},${int & 255}`;
};

const getAccent = (accent) => {
  const hue = accent?.hue || '#55DDEB';
  const rgb = accent?.rgb || accent?.rgbText || hexToRgbText(hue);
  return {
    hue,
    rgb,
    soft: accent?.soft || `rgba(${rgb},0.14)`,
    ring: accent?.ring || `rgba(${rgb},0.28)`
  };
};

export default function EmojiIconPickerPanel({
  theme,
  langIndex = 0,
  accent,
  title,
  subtitle,
  selectedIcon,
  emojiInput,
  setEmojiInput,
  groups,
  renderIcon,
  onSelectPreset,
  onApplyEmoji,
  onReset,
  onCancel,
  showActions = true,
  compact = false
}) {
  const isLight = theme === 'light' || theme === 'speciallight';
  const tone = getAccent(accent);
  const text = Colors.get('mainText', theme);
  const sub = Colors.get('subText', theme);
  const emoji = normalizeCustomEmoji(emojiInput);
  const safeGroups = Array.isArray(groups) ? groups : [];

  return (
    <div style={panelStyle(isLight, theme)}>
      <div style={headerStyle()}>
        <div style={previewStyle(tone, isLight)}>
          {emoji || renderIcon?.(selectedIcon, compact ? 26 : 30)}
        </div>
        <div style={titleStyle(text)}>{title}</div>
        <div style={subtitleStyle(sub)}>{subtitle}</div>
      </div>

      <div style={sectionTitleStyle(sub)}>
        {langIndex === 0 ? 'С клавиатуры' : 'Keyboard emoji'}
      </div>
      <input
        type="text"
        inputMode="text"
        value={emojiInput}
        onChange={(event) => setEmojiInput?.(normalizeCustomEmoji(event.target.value))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onApplyEmoji?.(normalizeCustomEmoji(emojiInput));
          if (event.key === 'Escape') onCancel?.();
        }}
        placeholder={langIndex === 0 ? 'Например: ⚡' : 'Example: ⚡'}
        style={emojiInputStyle(isLight, theme)}
      />

      <div style={presetSectionStyle(compact)}>
        <div style={sectionTitleStyle(sub)}>{langIndex === 0 ? 'Готовые' : 'Presets'}</div>
        {safeGroups.map((group) => (
          <div key={group.key || group.id} style={groupStyle()}>
            <div style={groupTitleStyle(sub)}>{group.label?.[langIndex] || group.label?.[0] || group.key || group.id}</div>
            <div style={gridStyle(compact)}>
              {(group.icons || []).map((iconKey) => {
                const active = selectedIcon === iconKey;
                return (
                  <button
                    type="button"
                    key={iconKey}
                    onClick={() => onSelectPreset?.(iconKey)}
                    style={iconButtonStyle(active, tone, isLight)}
                    aria-label={iconKey}
                  >
                    {renderIcon?.(iconKey, compact ? 18 : 20)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showActions && (
        <div style={actionsStyle()}>
          <button type="button" onClick={onReset} style={resetButtonStyle(isLight)}>
            {langIndex === 0 ? 'Сбросить' : 'Reset'}
          </button>
          <button type="button" onClick={onCancel} style={cancelButtonStyle(isLight, theme)}>
            {langIndex === 0 ? 'Отмена' : 'Cancel'}
          </button>
          <button type="button" onClick={() => onApplyEmoji?.(normalizeCustomEmoji(emojiInput))} style={applyButtonStyle(tone)}>
            {langIndex === 0 ? 'Применить' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );
}

const panelStyle = (isLight, theme) => ({
  width: '100%',
  borderRadius: 28,
  border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(255,255,255,0.09)',
  background: isLight ? 'rgba(255,255,255,0.70)' : 'rgba(18,27,32,0.72)',
  padding: 18,
  boxSizing: 'border-box',
  boxShadow: isLight ? '0 18px 40px -32px rgba(15,23,42,0.28)' : '0 20px 46px -34px rgba(0,0,0,0.8)',
  backdropFilter: 'blur(26px) saturate(155%)',
  WebkitBackdropFilter: 'blur(26px) saturate(155%)',
  fontFamily: 'inherit',
  color: Colors.get('mainText', theme)
});

const headerStyle = () => ({ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 14 });
const previewStyle = (tone, isLight) => ({
  width: 64,
  height: 64,
  borderRadius: 21,
  marginBottom: 12,
  background: tone.soft,
  border: `1px solid ${tone.ring}`,
  color: tone.hue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 34,
  lineHeight: 1,
  boxShadow: isLight ? `0 18px 34px -26px ${tone.ring}` : `0 18px 34px -24px ${tone.ring}, 0 1px 0 rgba(255,255,255,0.12) inset`
});
const titleStyle = (text) => ({ color: text, fontSize: 18, fontWeight: 950, lineHeight: 1.12 });
const subtitleStyle = (sub) => ({ marginTop: 7, color: sub, fontSize: 12, fontWeight: 750, lineHeight: 1.35, maxWidth: 280 });
const sectionTitleStyle = (sub) => ({ color: sub, fontSize: 10, fontWeight: 950, letterSpacing: '0.12em', textTransform: 'uppercase', paddingLeft: 2, marginBottom: 7, textAlign: 'left' });
const emojiInputStyle = (isLight, theme) => ({
  width: '100%',
  height: 54,
  borderRadius: 17,
  border: isLight ? '1px solid rgba(15,23,42,0.08)' : '1px solid rgba(255,255,255,0.08)',
  background: isLight ? 'rgba(255,255,255,0.66)' : 'rgba(255,255,255,0.045)',
  color: Colors.get('mainText', theme),
  fontSize: 28,
  lineHeight: 1,
  textAlign: 'center',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  boxShadow: isLight ? '0 1px 0 rgba(255,255,255,0.82) inset' : '0 1px 0 rgba(255,255,255,0.055) inset'
});
const presetSectionStyle = (compact) => ({ display: 'flex', flexDirection: 'column', gap: compact ? 9 : 11, marginTop: 14, marginBottom: 14 });
const groupStyle = () => ({ display: 'flex', flexDirection: 'column', gap: 7 });
const groupTitleStyle = (sub) => ({ color: sub, fontSize: 10, fontWeight: 850, lineHeight: 1, paddingLeft: 2, textAlign: 'center' });
const gridStyle = (compact) => ({ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: compact ? 6 : 7 });
const iconButtonStyle = (active, tone, isLight) => ({
  aspectRatio: '1 / 1',
  minWidth: 0,
  borderRadius: 13,
  border: `1px solid ${active ? tone.ring : (isLight ? 'rgba(15,23,42,0.07)' : 'rgba(255,255,255,0.075)')}`,
  background: active ? tone.soft : (isLight ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.045)'),
  color: tone.hue,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  padding: 0,
  outline: 'none',
  fontFamily: 'inherit',
  WebkitTapHighlightColor: 'transparent'
});
const actionsStyle = () => ({ display: 'grid', gridTemplateColumns: '0.85fr 1fr 1fr', gap: 9, marginTop: 14 });
const resetButtonStyle = (isLight) => ({ minHeight: 46, borderRadius: 15, border: '1px solid rgba(235,107,127,0.24)', background: isLight ? 'rgba(235,107,127,0.08)' : 'rgba(235,107,127,0.10)', color: '#E68193', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' });
const cancelButtonStyle = (isLight, theme) => ({ minHeight: 46, borderRadius: 15, border: isLight ? '1px solid rgba(15,23,42,0.07)' : '1px solid rgba(255,255,255,0.07)', background: isLight ? 'rgba(15,23,42,0.04)' : 'rgba(255,255,255,0.055)', color: Colors.get('mainText', theme), fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit' });
const applyButtonStyle = (tone) => ({ minHeight: 46, borderRadius: 15, border: `1px solid ${tone.ring}`, background: `linear-gradient(145deg, rgba(${tone.rgb},0.9), ${tone.hue})`, color: '#fff', fontSize: 13, fontWeight: 950, cursor: 'pointer', fontFamily: 'inherit', boxShadow: `0 16px 28px -22px rgba(${tone.rgb},0.82)` });
