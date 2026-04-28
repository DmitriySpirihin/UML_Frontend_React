import React from 'react';

export const DEFAULT_HABITS_ACCENT_COLOR = '#7FC8B8';

export const HABIT_ACCENT_PRESETS = [
    '#7FC8B8',
    '#8A7CD6',
    '#8FA6C8',
    '#C8A46F',
    '#D8785E',
    '#66D9E8',
    '#78B879',
    '#E39B6D'
];

const normalizeHexColor = (color) => {
    if (typeof color !== 'string') return DEFAULT_HABITS_ACCENT_COLOR;
    const value = color.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(value)) return value.toUpperCase();
    if (/^#[0-9a-fA-F]{3}$/.test(value)) {
        return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toUpperCase();
    }
    return DEFAULT_HABITS_ACCENT_COLOR;
};

const hexToRgb = (color) => {
    const hex = normalizeHexColor(color).slice(1);
    const int = Number.parseInt(hex, 16);
    return {
        r: (int >> 16) & 255,
        g: (int >> 8) & 255,
        b: int & 255
    };
};

export const buildHabitsAccent = (color = DEFAULT_HABITS_ACCENT_COLOR) => {
    const hue = normalizeHexColor(color);
    const { r, g, b } = hexToRgb(hue);
    return {
        hue,
        soft: `rgba(${r},${g},${b},0.14)`,
        ring: `rgba(${r},${g},${b},0.28)`,
        glow: `rgba(${r},${g},${b},0.18)`,
        rgb: `${r},${g},${b}`
    };
};

export const HABITS_ACCENT = buildHabitsAccent();

export const setHabitsAccentColor = (color) => {
    Object.assign(HABITS_ACCENT, buildHabitsAccent(color));
    return HABITS_ACCENT;
};

export const HABITS_CATEGORY_TONES = {
    'Здоровье': { hue: '#7FC8B8', soft: 'rgba(127,200,184,0.14)', ring: 'rgba(127,200,184,0.28)', icon: 'health' },
    'Развитие': { hue: '#8A7CD6', soft: 'rgba(138,124,214,0.14)', ring: 'rgba(138,124,214,0.28)', icon: 'growth' },
    'Продуктивность': { hue: '#8FA6C8', soft: 'rgba(143,166,200,0.14)', ring: 'rgba(143,166,200,0.28)', icon: 'productivity' },
    'Отношения и отдых': { hue: '#C8A46F', soft: 'rgba(200,164,111,0.12)', ring: 'rgba(200,164,111,0.24)', icon: 'relationships' },
    'Отказ от вредного': { hue: '#D8785E', soft: 'rgba(216,120,94,0.14)', ring: 'rgba(216,120,94,0.28)', icon: 'negative' }
};

const HabitIconBase = ({ children, size = 22, stroke = 1.65 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {children}
    </svg>
);

const HABIT_OUTLINE_ICONS = {
    water: ({ size }) => <HabitIconBase size={size}><path d="M12 3c-3.5 4-6 7-6 10.5a6 6 0 0 0 12 0c0-3.5-2.5-6.5-6-10.5Z" /><path d="M9 14a3 3 0 0 0 3 3" /></HabitIconBase>,
    sleep: ({ size }) => <HabitIconBase size={size}><path d="M21 13.5A9 9 0 0 1 10.5 3a7.5 7.5 0 1 0 10.5 10.5Z" /></HabitIconBase>,
    walk: ({ size }) => <HabitIconBase size={size}><circle cx="13" cy="4" r="1.6" /><path d="M9 21l2-5-2-3V8l3-2 3 3 2 2M9 13l-3 1M14 21l1-4" /></HabitIconBase>,
    run: ({ size }) => <HabitIconBase size={size}><circle cx="14" cy="4" r="1.6" /><path d="M5 12l4-2 2 3-2 3 4 5M11 13l3 2 4-1M16 8l3 1" /></HabitIconBase>,
    food: ({ size }) => <HabitIconBase size={size}><path d="M4 10h16M5 10v3a7 7 0 0 0 14 0v-3M9 4v4M12 3v5M15 4v4" /></HabitIconBase>,
    yoga: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="4.5" r="1.8" /><path d="M12 7v4M6 11l6-2 6 2M8 20l4-5 4 5M10 11l-1 4M14 11l1 4" /></HabitIconBase>,
    body: ({ size }) => <HabitIconBase size={size}><path d="M6 4h12l-2 6H8L6 4ZM8 10v10M16 10v10M10 14h4" /></HabitIconBase>,
    strength: ({ size }) => <HabitIconBase size={size}><path d="M4 10v4M20 10v4M7 8v8M17 8v8M7 12h10" /></HabitIconBase>,
    meditate: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="6" r="2" /><path d="M5 20c2-4 4.5-5 7-5s5 1 7 5M9 13l3 2 3-2" /></HabitIconBase>,
    book: ({ size }) => <HabitIconBase size={size}><path d="M4 5a2 2 0 0 1 2-2h5v17H6a2 2 0 0 0-2 2V5ZM20 5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 1 2 2V5Z" /></HabitIconBase>,
    lang: ({ size }) => <HabitIconBase size={size}><path d="M5 8h8M9 6v2M7 8c0 3 2 6 5 6M13 10c-1 2-4 4-8 4M13 20l3-8 3 8M14 18h4" /></HabitIconBase>,
    journal: ({ size }) => <HabitIconBase size={size}><path d="M6 3h10l3 3v15H6zM9 8h7M9 12h7M9 16h5" /></HabitIconBase>,
    skill: ({ size }) => <HabitIconBase size={size}><path d="M12 3l2.5 5 5.5.5-4 4 1 5.5L12 15l-5 3 1-5.5-4-4 5.5-.5Z" /></HabitIconBase>,
    plan: ({ size }) => <HabitIconBase size={size}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M9 14h6M9 17h4" /></HabitIconBase>,
    target: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></HabitIconBase>,
    timer: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="13" r="7" /><path d="M12 9v4l2.5 1.5M9 3h6M19 5l1 1" /></HabitIconBase>,
    inbox: ({ size }) => <HabitIconBase size={size}><path d="M4 13v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5l-3-8H7Z" /><path d="M4 13h4l1 2h6l1-2h4" /></HabitIconBase>,
    people: ({ size }) => <HabitIconBase size={size}><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.3" /><path d="M3 20c1-3 3-4.5 6-4.5s5 1.5 6 4.5M15 20c.5-2 1.8-3 3.5-3s2.5.6 3.5 3" /></HabitIconBase>,
    heart: ({ size }) => <HabitIconBase size={size}><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" /></HabitIconBase>,
    chat: ({ size }) => <HabitIconBase size={size}><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l.8-5.5A8 8 0 1 1 21 12Z" /></HabitIconBase>,
    hobby: ({ size }) => <HabitIconBase size={size}><path d="M7 3h10v4a5 5 0 0 1-10 0V3ZM9 12v3l-2 5h10l-2-5v-3" /></HabitIconBase>,
    creative: ({ size }) => <HabitIconBase size={size}><path d="M4 20l3-1 11-11-2-2L5 17l-1 3ZM15 7l2 2M11 20h9" /></HabitIconBase>,
    detox: ({ size }) => <HabitIconBase size={size}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h4M4 4l16 16" /></HabitIconBase>,
    sugar: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="13" r="6" /><path d="M12 7V3M8 3h8M9 13l3-3 3 3-3 3-3-3Z" /></HabitIconBase>,
    late: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2M4 4l16 16" /></HabitIconBase>,
    screen: ({ size }) => <HabitIconBase size={size}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M10 16v4M14 16v4M4 4l16 12" /></HabitIconBase>,
    smoke: ({ size }) => <HabitIconBase size={size}><rect x="3" y="14" width="18" height="4" rx="1" /><path d="M14 14v-3a3 3 0 0 0-3-3M18 11V9a2 2 0 0 0-2-2M4 4l16 16" /></HabitIconBase>,
    alcohol: ({ size }) => <HabitIconBase size={size}><path d="M7 3h10l-1 6a4 4 0 0 1-8 0L7 3ZM12 13v8M8 21h8" /></HabitIconBase>,
    game: ({ size }) => <HabitIconBase size={size}><rect x="2" y="8" width="20" height="10" rx="4" /><path d="M7 13h3M8.5 11.5v3M15 12h.01M17 14h.01" /></HabitIconBase>,
    flame: ({ size }) => <HabitIconBase size={size}><path d="M12 3c0 4-5 5-5 10a5 5 0 0 0 10 0c0-2-2-3-2-6-1 1-3 0-3-4Z" /></HabitIconBase>,
    check: ({ size }) => <HabitIconBase size={size}><path d="M5 12l5 5 9-10" /></HabitIconBase>,
    sun: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="3.5" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></HabitIconBase>,
    pillIcon: ({ size }) => <HabitIconBase size={size}><path d="M10 21 3 14a4.2 4.2 0 0 1 6-6l7 7a4.2 4.2 0 0 1-6 6Z" /><path d="m7 11 6 6" /></HabitIconBase>,
    leaf: ({ size }) => <HabitIconBase size={size}><path d="M20 4c-7.5.5-12.5 4-14 10-.7 2.8.8 5 3.3 5.3 5.6.6 9.6-5.8 10.7-15.3Z" /><path d="M6 19c3-5 6.5-8.2 12-11" /></HabitIconBase>,
    apple: ({ size }) => <HabitIconBase size={size}><path d="M12 7c-4-3-8 .2-7 5.5C6 18 9 21 12 19c3 2 6 0 7-6.5C20 7.2 16 4 12 7Z" /><path d="M12 7c0-2 1-3.5 3-4" /></HabitIconBase>,
    cup: ({ size }) => <HabitIconBase size={size}><path d="M5 8h11v6a5 5 0 0 1-10 0V8Z" /><path d="M16 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2M15 3v2M6 21h10" /></HabitIconBase>,
    codeIcon: ({ size }) => <HabitIconBase size={size}><path d="m8 9-4 3 4 3M16 9l4 3-4 3M14 5l-4 14" /></HabitIconBase>,
    money: ({ size }) => <HabitIconBase size={size}><rect x="3" y="6" width="18" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 9h.01M18 15h.01" /></HabitIconBase>,
    bellOff: ({ size }) => <HabitIconBase size={size}><path d="M6 8a6 6 0 0 1 10.5-3.9M18 9v3l2 4H8M10 20h4M4 4l16 16" /></HabitIconBase>,
    folder: ({ size }) => <HabitIconBase size={size}><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" /></HabitIconBase>,
    shirt: ({ size }) => <HabitIconBase size={size}><path d="M8 4 4 6.5 6 11l2-1v10h8V10l2 1 2-4.5L16 4c-1 1-2 1.5-4 1.5S9 5 8 4Z" /></HabitIconBase>,
    bag: ({ size }) => <HabitIconBase size={size}><path d="M6 8h12l1 12H5L6 8Z" /><path d="M9 8a3 3 0 0 1 6 0" /></HabitIconBase>,
    homeIcon: ({ size }) => <HabitIconBase size={size}><path d="M4 11 12 4l8 7" /><path d="M6 10v10h12V10M10 20v-6h4v6" /></HabitIconBase>,
    cart: ({ size }) => <HabitIconBase size={size}><path d="M4 5h2l2 10h10l2-7H7" /><circle cx="10" cy="20" r="1.4" /><circle cx="17" cy="20" r="1.4" /></HabitIconBase>,
    tree: ({ size }) => <HabitIconBase size={size}><path d="M12 21v-6M7 15h10l-3-4h2l-4-6-4 6h2l-3 4Z" /></HabitIconBase>,
    musicNote: ({ size }) => <HabitIconBase size={size}><path d="M9 18a3 3 0 1 1-2-2.8V5l11-2v11" /><path d="M18 14a3 3 0 1 1-2-2.8" /></HabitIconBase>,
    cameraIcon: ({ size }) => <HabitIconBase size={size}><path d="M4 8h4l1.5-2h5L16 8h4v11H4Z" /><circle cx="12" cy="13.5" r="3.2" /></HabitIconBase>,
    soda: ({ size }) => <HabitIconBase size={size}><path d="M8 8h8l-1 13H9L8 8ZM7 4h8l2-2M9 12h6" /></HabitIconBase>,
    speech: ({ size }) => <HabitIconBase size={size}><path d="M5 18h4l5 3v-3h2a5 5 0 0 0 0-10H8a5 5 0 0 0-3 9Z" /><path d="M8 12h8M8 15h5" /></HabitIconBase>,
    tooth: ({ size }) => <HabitIconBase size={size}><path d="M8 3c2 0 2.5 1 4 1s2-1 4-1c2.5 0 4 2 3.2 5.5L17.5 17c-.4 2-1.5 4-3 4-1.2 0-1.3-3-2.5-3s-1.3 3-2.5 3c-1.5 0-2.6-2-3-4L4.8 8.5C4 5 5.5 3 8 3Z" /></HabitIconBase>,
    shower: ({ size }) => <HabitIconBase size={size}><path d="M6 10a6 6 0 0 1 12 0H6Z" /><path d="M12 4V2M8 14v.01M12 14v.01M16 14v.01M7 18v.01M12 18v.01M17 18v.01M9 22v.01M15 22v.01" /></HabitIconBase>,
    lungs: ({ size }) => <HabitIconBase size={size}><path d="M12 4v8M12 12c-2-4-6-5-8-2-2 3-1 9 3 10 3 .8 5-2 5-8ZM12 12c2-4 6-5 8-2 2 3 1 9-3 10-3 .8-5-2-5-8Z" /></HabitIconBase>,
    scale: ({ size }) => <HabitIconBase size={size}><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M8 11a4 4 0 0 1 8 0M12 11l2-2" /></HabitIconBase>,
    forkKnife: ({ size }) => <HabitIconBase size={size}><path d="M6 3v8M4 3v4a2 2 0 0 0 4 0V3M6 11v10M17 3v18M14 8c0-3 1-5 3-5" /></HabitIconBase>,
    bowl: ({ size }) => <HabitIconBase size={size}><path d="M4 11h16a8 8 0 0 1-16 0Z" /><path d="M8 4c0 1.5 2 1.5 2 3M13 4c0 1.5 2 1.5 2 3" /></HabitIconBase>,
    seedling: ({ size }) => <HabitIconBase size={size}><path d="M12 21V10M12 10C8 10 5 7 5 3c4 0 7 3 7 7ZM12 13c4 0 7-3 7-7-4 0-7 3-7 7Z" /></HabitIconBase>,
    graduation: ({ size }) => <HabitIconBase size={size}><path d="M3 9 12 4l9 5-9 5-9-5Z" /><path d="M7 12v4c3 2 7 2 10 0v-4M21 9v6" /></HabitIconBase>,
    pencil: ({ size }) => <HabitIconBase size={size}><path d="M4 20l4-1 11-11-3-3L5 16l-1 4Z" /><path d="m14 7 3 3" /></HabitIconBase>,
    bulb: ({ size }) => <HabitIconBase size={size}><path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 1-1 2-1 4H9c0-2 0-3-1-4Z" /></HabitIconBase>,
    calculatorIcon: ({ size }) => <HabitIconBase size={size}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01" /></HabitIconBase>,
    chartLine: ({ size }) => <HabitIconBase size={size}><path d="M4 19V5M4 19h16M7 15l4-4 3 3 5-7" /></HabitIconBase>,
    briefcase: ({ size }) => <HabitIconBase size={size}><rect x="3" y="7" width="18" height="12" rx="2" /><path d="M9 7V5h6v2M3 12h18" /></HabitIconBase>,
    mailIcon: ({ size }) => <HabitIconBase size={size}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m4 7 8 6 8-6" /></HabitIconBase>,
    rocket: ({ size }) => <HabitIconBase size={size}><path d="M12 15 9 12c1-4 4-7 9-8-1 5-4 8-8 9Z" /><path d="M9 12H5l-2 4 6-1M12 15v4l-4 2 1-6M15 6l3 3" /></HabitIconBase>,
    mapPin: ({ size }) => <HabitIconBase size={size}><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></HabitIconBase>,
    car: ({ size }) => <HabitIconBase size={size}><path d="M5 13 7 7h10l2 6M4 13h16v5H4Z" /><circle cx="7" cy="18" r="1.5" /><circle cx="17" cy="18" r="1.5" /></HabitIconBase>,
    plane: ({ size }) => <HabitIconBase size={size}><path d="M3 11 21 3l-7 18-3-7-8-3Z" /><path d="m11 14 4-4" /></HabitIconBase>,
    calendarCheck: ({ size }) => <HabitIconBase size={size}><rect x="4" y="5" width="16" height="16" rx="2" /><path d="M8 3v4M16 3v4M4 10h16M8 15l2 2 5-5" /></HabitIconBase>,
    trophy: ({ size }) => <HabitIconBase size={size}><path d="M8 4h8v5a4 4 0 0 1-8 0V4Z" /><path d="M8 7H4a4 4 0 0 0 4 4M16 7h4a4 4 0 0 1-4 4M12 13v4M9 21h6M8 17h8" /></HabitIconBase>,
    shield: ({ size }) => <HabitIconBase size={size}><path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" /><path d="m9 12 2 2 4-5" /></HabitIconBase>,
    lockIcon: ({ size }) => <HabitIconBase size={size}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></HabitIconBase>,
    paletteIcon: ({ size }) => <HabitIconBase size={size}><path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1.5-3.3 1.5 1.5 0 0 1 1.1-2.5H18a6 6 0 0 0 0-12h-6Z" /><path d="M7.5 10h.01M10 7h.01M13 7h.01M8 14h.01" /></HabitIconBase>,
    headphones: ({ size }) => <HabitIconBase size={size}><path d="M4 14a8 8 0 0 1 16 0v5h-4v-6h4M4 13h4v6H4v-5" /></HabitIconBase>,
    phoneIcon: ({ size }) => <HabitIconBase size={size}><rect x="7" y="3" width="10" height="18" rx="2" /><path d="M11 18h2" /></HabitIconBase>,
    cloudIcon: ({ size }) => <HabitIconBase size={size}><path d="M7 18h11a4 4 0 0 0 0-8 6 6 0 0 0-11.5 2A3 3 0 0 0 7 18Z" /><path d="M12 12v5M9.5 14.5 12 12l2.5 2.5" /></HabitIconBase>,
    wrench: ({ size }) => <HabitIconBase size={size}><path d="M14 6a5 5 0 0 0 6 6L10 22l-4-4 10-10a5 5 0 0 1-2-2Z" /></HabitIconBase>,
    spark: ({ size }) => <HabitIconBase size={size}><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8Z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8Z" /></HabitIconBase>,
    batteryIcon: ({ size }) => <HabitIconBase size={size}><rect x="3" y="8" width="16" height="8" rx="2" /><path d="M21 11v2M7 12h5" /></HabitIconBase>,
    bookmark: ({ size }) => <HabitIconBase size={size}><path d="M6 4h12v17l-6-4-6 4V4Z" /></HabitIconBase>,
    flagIcon: ({ size }) => <HabitIconBase size={size}><path d="M5 21V4h10l1 3h4v9H10l-1-3H5" /></HabitIconBase>,
    compass: ({ size }) => <HabitIconBase size={size}><circle cx="12" cy="12" r="9" /><path d="m15 9-2 5-5 2 2-5Z" /></HabitIconBase>,
    puzzle: ({ size }) => <HabitIconBase size={size}><path d="M8 3h5v4a2 2 0 1 0 4 0V3h4v6h-3a2 2 0 1 0 0 4h3v8h-6v-3a2 2 0 1 0-4 0v3H3v-6h3a2 2 0 1 0 0-4H3V8h5Z" /></HabitIconBase>,
    recycle: ({ size }) => <HabitIconBase size={size}><path d="M7 7l2-4 2 4M9 3v7M17 17l-2 4-2-4M15 21v-7M4 15l-2-4h5M2 11l6 3M20 9l2 4h-5M22 13l-6-3" /></HabitIconBase>,
    wallet: ({ size }) => <HabitIconBase size={size}><path d="M4 7h15a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h13" /><path d="M16 13h5" /></HabitIconBase>,
    receipt: ({ size }) => <HabitIconBase size={size}><path d="M6 3h12v18l-2-1-2 1-2-1-2 1-2-1-2 1V3Z" /><path d="M9 8h6M9 12h6M9 16h4" /></HabitIconBase>,
    bank: ({ size }) => <HabitIconBase size={size}><path d="M3 9 12 4l9 5H3Z" /><path d="M5 9v9M9 9v9M15 9v9M19 9v9M3 20h18" /></HabitIconBase>,
    microscope: ({ size }) => <HabitIconBase size={size}><path d="M10 4h4v5h-4zM12 9v4M9 13h6M6 20h12M8 17a5 5 0 0 0 8-4" /><path d="M7 4h10" /></HabitIconBase>,
};

export const HABIT_ICON_GROUPS = [
    {
        key: 'health',
        label: ['Здоровье', 'Health'],
        icons: ['heart', 'water', 'sleep', 'sun', 'walk', 'run', 'strength', 'yoga', 'meditate', 'body', 'pillIcon', 'tooth', 'shower', 'lungs', 'scale', 'batteryIcon']
    },
    {
        key: 'food',
        label: ['Питание', 'Nutrition'],
        icons: ['food', 'forkKnife', 'bowl', 'leaf', 'apple', 'seedling', 'cup', 'soda', 'sugar']
    },
    {
        key: 'growth',
        label: ['Развитие', 'Growth'],
        icons: ['book', 'skill', 'lang', 'journal', 'graduation', 'pencil', 'bulb', 'calculatorIcon', 'codeIcon', 'microscope', 'bookmark', 'puzzle']
    },
    {
        key: 'productivity',
        label: ['Дела', 'Work'],
        icons: ['target', 'plan', 'timer', 'calendarCheck', 'inbox', 'folder', 'briefcase', 'mailIcon', 'chartLine', 'rocket', 'bellOff', 'cloudIcon', 'wrench', 'flagIcon']
    },
    {
        key: 'finance',
        label: ['Финансы', 'Finance'],
        icons: ['money', 'wallet', 'receipt', 'bank', 'cart']
    },
    {
        key: 'relationships',
        label: ['Люди и отдых', 'People'],
        icons: ['people', 'chat', 'speech', 'homeIcon', 'hobby', 'creative', 'paletteIcon', 'musicNote', 'headphones', 'cameraIcon', 'tree', 'mapPin', 'car', 'plane', 'compass', 'trophy']
    },
    {
        key: 'limits',
        label: ['Ограничения', 'Limits'],
        icons: ['screen', 'phoneIcon', 'detox', 'lockIcon', 'shield', 'smoke', 'alcohol', 'game', 'late', 'flame', 'recycle', 'check', 'spark']
    }
];

export const HABIT_ICON_OPTIONS = Array.from(new Set(HABIT_ICON_GROUPS.flatMap(group => group.icons)));

const HABIT_ICON_ALIASES = {
    default: 'target',
    star: 'skill',
    health: 'heart',
    growth: 'book',
    productivity: 'target',
    relationships: 'people',
    negative: 'detox',
    hydrationBottle: 'water',
    water: 'water',
    sleepBed: 'sleep',
    sleep: 'sleep',
    mobility: 'walk',
    exercise: 'walk',
    nutritionPlate: 'food',
    food: 'food',
    selfCare: 'body',
    dumbbell: 'strength',
    workout: 'strength',
    running: 'run',
    runningShoes: 'walk',
    stretch: 'yoga',
    breathPractice: 'meditate',
    meditation: 'meditate',
    reading: 'book',
    learning: 'skill',
    languagePractice: 'lang',
    english: 'lang',
    journaling: 'journal',
    reflectionMirror: 'timer',
    checklist: 'plan',
    priorityOne: 'target',
    focusTimer: 'timer',
    inboxTray: 'inbox',
    sunsetReview: 'plan',
    callMessage: 'chat',
    handHeart: 'heart',
    handshake: 'people',
    activeListen: 'chat',
    gratitude: 'heart',
    hobby: 'hobby',
    parkWalk: 'walk',
    mindfulness: 'meditate',
    creativeBrush: 'creative',
    unplug: 'screen',
    fastFood: 'sugar',
    lateNight: 'late',
    procrastinationClock: 'timer',
    mindlessScroll: 'screen',
    snackBowl: 'sugar',
    games: 'game',
    adultBlock: 'detox',
    cigarette: 'smoke',
    noSmoking: 'smoke',
    cocktail: 'alcohol',
    noAlcohol: 'alcohol',
    noMobile: 'screen',
    morningSun: 'sun',
    stepPrints: 'walk',
    posture: 'body',
    pill: 'pillIcon',
    medicinePatch: 'pillIcon',
    skinCare: 'body',
    darkRoom: 'sleep',
    sunriseAlarm: 'sleep',
    protein: 'food',
    broccoli: 'leaf',
    fruitBowl: 'apple',
    stewPan: 'food',
    caffeineStop: 'cup',
    coreTraining: 'strength',
    cardioHeart: 'run',
    swimming: 'water',
    cycling: 'run',
    breathing: 'meditate',
    recoveryBattery: 'body',
    courseLesson: 'book',
    studyNotes: 'journal',
    repeatStudy: 'timer',
    writing: 'journal',
    speechPractice: 'chat',
    newWord: 'lang',
    code: 'codeIcon',
    research: 'book',
    financeStudy: 'money',
    paint: 'creative',
    art: 'creative',
    music: 'musicNote',
    photography: 'cameraIcon',
    weeklyReview: 'plan',
    gratitudeJournal: 'journal',
    portfolioCase: 'inbox',
    muteBell: 'bellOff',
    cleanDesk: 'plan',
    twoMinute: 'timer',
    singleWindow: 'screen',
    deepWork: 'target',
    weeklyPlan: 'plan',
    clipboard: 'plan',
    fileBox: 'folder',
    dailyBudget: 'money',
    expenseTrack: 'journal',
    noShopping: 'detox',
    shirtReady: 'shirt',
    packedBag: 'bag',
    noteStack: 'journal',
    calendar2: 'plan',
    shutdown: 'sleep',
    backupCloud: 'inbox',
    zeroInbox: 'inbox',
    singleTab: 'screen',
    mealPrep: 'food',
    familyTime: 'homeIcon',
    friendMessage: 'chat',
    compliment: 'heart',
    homeHelp: 'homeIcon',
    cleaning: 'plan',
    laundry: 'plan',
    groceryList: 'cart',
    natureTime: 'tree',
    miniTrip: 'walk',
    boardGame: 'game',
    relaxMusic: 'musicNote',
    sugarControl: 'sugar',
    sodaCut: 'soda',
    energyDrink: 'detox',
    newsScroll: 'screen',
    socialLimit: 'screen',
    bedtimeDelay: 'late',
    selfTalk: 'detox',
    complainLess: 'detox',
    onTime: 'late',
};

function canonicalCategory(value) {
    const map = {
        'Здоровье': 'Здоровье',
        'Health': 'Здоровье',
        'Развитие': 'Развитие',
        'Growth': 'Развитие',
        'Продуктивность': 'Продуктивность',
        'Productivity': 'Продуктивность',
        'Отношения и отдых': 'Отношения и отдых',
        'Relationships & recreation': 'Отношения и отдых',
        'Отказ от вредного': 'Отказ от вредного',
        'Bad habits to quit': 'Отказ от вредного',
    };

    return map[value] || value || 'Здоровье';
}

export function getHabitCategoryTone(categoryKey) {
    return HABITS_CATEGORY_TONES[canonicalCategory(categoryKey)] || HABITS_ACCENT;
}

export function normalizeHabitIconKey(iconName, habitName = [], categoryKey = '') {
    const rawKey = String(iconName || '').trim();
    if (HABIT_OUTLINE_ICONS[rawKey]) return rawKey;

    const direct = HABIT_ICON_ALIASES[iconName] || HABIT_ICON_ALIASES[rawKey];
    if (direct) return direct;

    const text = [rawKey, ...(Array.isArray(habitName) ? habitName : [habitName])].join(' ').toLowerCase();
    if (/вод|water|swim|плав/.test(text)) return 'water';
    if (/сон|sleep|bed|night|ноч|подъем|wake/.test(text)) return 'sleep';
    if (/ход|walk|шаг|прогул/.test(text)) return 'walk';
    if (/бег|run|cardio|кардио/.test(text)) return 'run';
    if (/еда|пит|food|meal|овощ|фрукт|fast|sweet|слад|перекус|sugar/.test(text)) return /слад|sweet|sugar|fast|перекус/.test(text) ? 'sugar' : 'food';
    if (/йог|stretch|растяж|медит|дых|breath|mind/.test(text)) return /йог|stretch|растяж/.test(text) ? 'yoga' : 'meditate';
    if (/книг|read|book|курс|course|study|учеб|исслед/.test(text)) return 'book';
    if (/язык|lang|english|spanish|german|word/.test(text)) return 'lang';
    if (/днев|journal|note|замет|пис/.test(text)) return 'journal';
    if (/план|plan|calendar|checklist|обзор/.test(text)) return 'plan';
    if (/timer|таймер|focus|фокус|задач|goal|target/.test(text)) return 'target';
    if (/сем|friend|друг|общ|сообщ|call|chat|компли/.test(text)) return 'chat';
    if (/кур|smok|cigar/.test(text)) return 'smoke';
    if (/алко|alcohol|cocktail/.test(text)) return 'alcohol';
    if (/игр|game/.test(text)) return 'game';
    if (/экран|screen|scroll|social|mobile|phone/.test(text)) return 'screen';

    const categoryTone = getHabitCategoryTone(categoryKey);
    return HABIT_ICON_ALIASES[categoryTone.icon] || 'target';
}

export function HabitOutlineIcon({ iconName, habitName, categoryKey, size = 22 }) {
    const key = normalizeHabitIconKey(iconName, habitName, categoryKey);
    const Icon = HABIT_OUTLINE_ICONS[key] || HABIT_OUTLINE_ICONS.target;
    return <Icon size={size} />;
}
