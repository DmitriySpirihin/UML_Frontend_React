export const DEFAULT_SLEEP_ACCENT_COLOR = '#6F7DFF';

export const SLEEP_ACCENT_PRESETS = [
  '#6F7DFF',
  '#2FD6BD',
  '#39D982',
  '#5F8DFF',
  '#6772A6',
  '#B48BC8',
  '#A66BFF',
  '#66D9E8'
];

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

const isCoffeeAccentColor = (color) => {
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

const normalizeHex = (color) => {
  if (typeof color !== 'string') return DEFAULT_SLEEP_ACCENT_COLOR;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    const normalized = trimmed.toUpperCase();
    return isCoffeeAccentColor(normalized) ? DEFAULT_SLEEP_ACCENT_COLOR : normalized;
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const normalized = `#${trimmed.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
    return isCoffeeAccentColor(normalized) ? DEFAULT_SLEEP_ACCENT_COLOR : normalized;
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
    soft: `rgba(${rgbText}, 0.18)`,
    faint: `rgba(${rgbText}, 0.10)`,
    ring: `rgba(${rgbText}, 0.40)`,
    glow: `rgba(${rgbText}, 0.34)`,
    solidSoft: `rgb(${clamp(rgb.r + 22)}, ${clamp(rgb.g + 22)}, ${clamp(rgb.b + 22)})`
  };
};
