import {
  FaBook,
  FaBriefcase,
  FaClipboardList,
  FaCode,
  FaGamepad,
  FaGraduationCap,
  FaHeartbeat,
  FaHome,
  FaMusic,
  FaPaintBrush,
  FaPlane,
  FaRunning,
  FaShoppingBag,
  FaUtensils,
  FaWallet
} from 'react-icons/fa';

export const DEFAULT_TODO_ACCENT_COLOR = '#8FA6C8';
export const TODO_ACCENT_PRESETS = ['#8FA6C8', '#7FC8B8', '#8A7CD6', '#66D9E8', '#78B879', '#D49A5C', '#C65F9D', '#D8785E'];

export const TODO_BASE_CATEGORIES = [
  { key: 'general', icon: 'general', label: ['Общее', 'General'] },
  { key: 'work', icon: 'work', label: ['Работа', 'Work'] },
  { key: 'home', icon: 'home', label: ['Дом', 'Home'] },
  { key: 'health', icon: 'health', label: ['Здоровье', 'Health'] },
  { key: 'shopping', icon: 'shopping', label: ['Покупки', 'Shopping'] },
  { key: 'study', icon: 'study', label: ['Учеба', 'Study'] },
  { key: 'trip', icon: 'trip', label: ['Путешествия', 'Trip'] },
  { key: 'finance', icon: 'finance', label: ['Финансы', 'Finance'] },
  { key: 'hobby', icon: 'hobby', label: ['Хобби', 'Hobby'] },
  { key: 'coding', icon: 'coding', label: ['Код', 'Coding'] },
  { key: 'games', icon: 'games', label: ['Игры', 'Games'] },
  { key: 'music', icon: 'music', label: ['Музыка', 'Music'] },
  { key: 'reading', icon: 'reading', label: ['Чтение', 'Reading'] },
  { key: 'sports', icon: 'sports', label: ['Спорт', 'Sports'] },
  { key: 'food', icon: 'food', label: ['Еда', 'Food'] }
];

const clamp = (value) => Math.max(0, Math.min(255, Math.round(value)));

export const normalizeTodoHex = (color) => {
  if (typeof color !== 'string') return DEFAULT_TODO_ACCENT_COLOR;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
  }
  return DEFAULT_TODO_ACCENT_COLOR;
};

const hexToRgb = (hex) => {
  const safe = normalizeTodoHex(hex).slice(1);
  return {
    r: parseInt(safe.slice(0, 2), 16),
    g: parseInt(safe.slice(2, 4), 16),
    b: parseInt(safe.slice(4, 6), 16)
  };
};

export const buildTodoAccent = (color = DEFAULT_TODO_ACCENT_COLOR) => {
  const hue = normalizeTodoHex(color);
  const rgb = hexToRgb(hue);
  const rgbText = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

  return {
    hue,
    rgb,
    rgbText,
    soft: `rgba(${rgbText}, 0.14)`,
    faint: `rgba(${rgbText}, 0.08)`,
    ring: `rgba(${rgbText}, 0.32)`,
    glow: `rgba(${rgbText}, 0.24)`,
    wash: `rgba(${rgbText}, 0.055)`,
    solidSoft: `rgb(${clamp(rgb.r + 20)}, ${clamp(rgb.g + 20)}, ${clamp(rgb.b + 20)})`
  };
};

export const TODO_SECTION_TOP = 'calc(env(safe-area-inset-top, 0px) + 10px)';

export const TODO_CATEGORY_TONES = {
  general: { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaClipboardList },
  'Общее': { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaClipboardList },
  General: { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaClipboardList },
  work: { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaBriefcase },
  'Работа': { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaBriefcase },
  Work: { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: FaBriefcase },
  home: { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)', icon: FaHome },
  'Дом': { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)', icon: FaHome },
  Home: { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)', icon: FaHome },
  health: { hue: '#78B879', soft: 'rgba(120,184,121,0.14)', ring: 'rgba(120,184,121,0.28)', icon: FaHeartbeat },
  'Здоровье': { hue: '#78B879', soft: 'rgba(120,184,121,0.14)', ring: 'rgba(120,184,121,0.28)', icon: FaHeartbeat },
  Health: { hue: '#78B879', soft: 'rgba(120,184,121,0.14)', ring: 'rgba(120,184,121,0.28)', icon: FaHeartbeat },
  shopping: { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaShoppingBag },
  'Покупки': { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaShoppingBag },
  Shopping: { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaShoppingBag },
  study: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGraduationCap },
  'Учеба': { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGraduationCap },
  Study: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGraduationCap },
  trip: { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)', icon: FaPlane },
  'Путешествия': { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)', icon: FaPlane },
  Trip: { hue: '#66D9E8', soft: 'rgba(102,217,232,0.14)', ring: 'rgba(102,217,232,0.28)', icon: FaPlane },
  finance: { hue: '#C9A24B', soft: 'rgba(201,162,75,0.14)', ring: 'rgba(201,162,75,0.28)', icon: FaWallet },
  'Финансы': { hue: '#C9A24B', soft: 'rgba(201,162,75,0.14)', ring: 'rgba(201,162,75,0.28)', icon: FaWallet },
  Finance: { hue: '#C9A24B', soft: 'rgba(201,162,75,0.14)', ring: 'rgba(201,162,75,0.28)', icon: FaWallet },
  hobby: { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaPaintBrush },
  'Хобби': { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaPaintBrush },
  Hobby: { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaPaintBrush },
  coding: { hue: '#7AA988', soft: 'rgba(122,169,136,0.14)', ring: 'rgba(122,169,136,0.28)', icon: FaCode },
  'Код': { hue: '#7AA988', soft: 'rgba(122,169,136,0.14)', ring: 'rgba(122,169,136,0.28)', icon: FaCode },
  Coding: { hue: '#7AA988', soft: 'rgba(122,169,136,0.14)', ring: 'rgba(122,169,136,0.28)', icon: FaCode },
  games: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGamepad },
  'Игры': { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGamepad },
  Games: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaGamepad },
  music: { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaMusic },
  'Музыка': { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaMusic },
  Music: { hue: '#C65F9D', soft: 'rgba(198,95,157,0.14)', ring: 'rgba(198,95,157,0.28)', icon: FaMusic },
  reading: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaBook },
  'Чтение': { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaBook },
  Reading: { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: FaBook },
  sports: { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)', icon: FaRunning },
  'Спорт': { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)', icon: FaRunning },
  Sports: { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)', icon: FaRunning },
  food: { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaUtensils },
  'Еда': { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaUtensils },
  Food: { hue: '#D49A5C', soft: 'rgba(212,154,92,0.13)', ring: 'rgba(212,154,92,0.25)', icon: FaUtensils }
};

export const getTodoCategoryMeta = (category, langIndex = 0) => {
  const raw = (category || '').trim();
  const lower = raw.toLowerCase();
  const base = TODO_BASE_CATEGORIES.find(item =>
    item.key === lower ||
    item.label.some(label => label.toLowerCase() === lower) ||
    item.icon === lower
  );

  if (base) return { ...base, labelText: base.label[langIndex] || base.label[0] };
  return { key: raw || 'general', icon: 'custom', label: [raw || 'Общее', raw || 'General'], labelText: raw || (langIndex === 0 ? 'Общее' : 'General') };
};

export const normalizeTodoCategory = (category) => getTodoCategoryMeta(category, 0).key;

export const getTodoCategoryTone = (category, accent) => {
  const meta = getTodoCategoryMeta(category, 0);
  const tone = TODO_CATEGORY_TONES[category] || TODO_CATEGORY_TONES[meta.key] || {};
  return {
    hue: tone.hue || accent.hue,
    soft: tone.soft || accent.soft,
    ring: tone.ring || accent.ring,
    icon: tone.icon || FaClipboardList
  };
};
