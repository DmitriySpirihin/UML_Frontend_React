export const DEFAULT_SLEEP_ACCENT_COLOR = '#6F8BD6';

export const SLEEP_ACCENT_PRESETS = [
  '#6F8BD6',
  '#7FC8B8',
  '#8A7CD6',
  '#66D9E8',
  '#D8785E',
  '#C65F9D',
  '#7AA988',
  '#C9A24B'
];

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

const normalizeHex = (color) => {
  if (typeof color !== 'string') return DEFAULT_SLEEP_ACCENT_COLOR;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
  }
  return DEFAULT_SLEEP_ACCENT_COLOR;
};

const hexToRgb = (hex) => {
  const safe = normalizeHex(hex).slice(1);
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16)
  };
};

export const buildSleepAccent = (color = DEFAULT_SLEEP_ACCENT_COLOR) => {
  const hue = normalizeHex(color);
  const rgb = hexToRgb(hue);
  const rgbText = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  return {
    hue,
    rgb,
    soft: `rgba(${rgbText}, 0.14)`,
    faint: `rgba(${rgbText}, 0.08)`,
    ring: `rgba(${rgbText}, 0.32)`,
    glow: `rgba(${rgbText}, 0.26)`,
    solidSoft: `rgb(${clamp(rgb.r + 22)}, ${clamp(rgb.g + 22)}, ${clamp(rgb.b + 22)})`
  };
};
