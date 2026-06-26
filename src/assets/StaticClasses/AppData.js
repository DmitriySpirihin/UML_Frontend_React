import {Habit} from "../Classes/Habit";
import { THEME } from './Colors';
import { habitReminder } from '../Pages/NotifyPanel';
import {setTheme,setLang ,setSoundAndVibro,setNotify,setShowPopUpPanel,setFontSize,setHabitAccent} from '../StaticClasses/HabitsBus'
import { NotificationsManager } from "./NotificationsManager";
import { getAchievements } from "../Helpers/Achievements";
import { saveData } from "../StaticClasses/SaveHelper";
import {exercises,programs} from "../Classes/TrainingData";

const DEFAULT_PREFS = [1,0,1,0,0];
const DEFAULT_HABIT_CATEGORIES = [
  { key: 'health', icon: 'heart', label: ['Здоровье', 'Health'], isNegative: false },
  { key: 'growth', icon: 'book', label: ['Развитие', 'Growth'], isNegative: false },
  { key: 'productivity', icon: 'chart', label: ['Продуктивность', 'Productivity'], isNegative: false },
  { key: 'relationships', icon: 'people', label: ['Отношения и отдых', 'Relationships & recreation'], isNegative: false },
  { key: 'bad_habits', icon: 'ban', label: ['Отказ от вредного', 'Bad habits to quit'], isNegative: true }
];
const DEFAULT_HABITS_ACCENT_COLOR = '#55DDEB';
const PREVIOUS_DEFAULT_HABITS_ACCENT_COLORS = ['#22C55E', '#149DFF', '#36D7D2'];
const LEGACY_HABITS_ACCENT_COLORS = ['#8FAE9B', '#9A92C8', '#8FA6C8', '#7FC8B8', '#68C08F', '#B48BC8', '#D48AB6', '#DC8FA6', '#E4A7C3', '#D8DEE7', '#D6E2F2', '#CFE6FF', '#50D4E5', '#8A7CD6', '#7D92D6', '#39D982'];
const DEFAULT_SLEEP_ACCENT_COLOR = '#7C6CFF';
const LEGACY_SLEEP_ACCENT_COLORS = ['#7A86D9', '#6772A6', '#6F8BD6', '#7FC8B8', '#56C7B5', '#6F7DFF'];
const DEFAULT_TODO_ACCENT_COLOR = '#2E9DFF';
const LEGACY_TODO_ACCENT_COLORS = ['#149DFF', '#8FA6C8', '#C65F9D', '#7FC8B8', '#C29AD6', '#DE8F9A', '#EAA6B4', '#C8D2DE', '#AFC7E8', '#9FCBFF', '#5DADEC', '#5F8DFF'];
const DEFAULT_MENTAL_ACCENT_COLOR = '#A66BFF';
const LEGACY_MENTAL_ACCENT_COLORS = ['#9A84C8', '#8A7CD6', '#B66DFF'];
const DEFAULT_RECOVERY_ACCENT_COLOR = '#2FD6BD';
const LEGACY_RECOVERY_ACCENT_COLORS = ['#74B8AF', '#68C08F', '#78B879', '#5ED28F'];
const DEFAULT_TRAINING_ACCENT_COLOR = '#579BC8';
const LEGACY_TRAINING_ACCENT_COLORS = ['#5FB6C6', '#FC5200', '#FF7A1A', '#9A8580', '#B87963', '#D8785E', '#7D92D6', '#8F7CFF', '#8A7CD6', '#9A84C8', '#A66BFF', '#BF5AF2'];
const DEFAULT_SECTION_VISITS = { habits: [], todo: [], mental: [], recovery: [], training: [], sleep: [] };
const DEFAULT_SECTION_LAST_OPENED_AT = { habits: 0, todo: 0, mental: 0, recovery: 0, training: 0, sleep: 0 };
const HABIT_BACKFILL_MIN_DAYS = 45;
const HABIT_BACKFILL_BUFFER_DAYS = 14;
const HABIT_BACKFILL_MAX_DAYS = 160;
const DEFAULT_NOTIFY_CRON = '10 12 * * 1,2,3,4,5';
const DEFAULT_NOTIFY_SETTINGS = [
  { enabled: false, cron: DEFAULT_NOTIFY_CRON },
  { enabled: false, cron: DEFAULT_NOTIFY_CRON },
  { enabled: false, cron: DEFAULT_NOTIFY_CRON }
];
const DEFAULT_SECTION_NOTIFICATIONS = {
  habits: { enabled: false, time: '09:00', days: [1, 2, 3, 4, 5], cron: '0 9 * * 1,2,3,4,5' },
  todo: { enabled: false, time: '10:00', days: [1, 2, 3, 4, 5], cron: '0 10 * * 1,2,3,4,5' },
  training: { enabled: false, time: '18:00', days: [1, 2, 3, 4, 5], cron: '0 18 * * 1,2,3,4,5' },
  mental: { enabled: false, time: '20:00', days: [1, 2, 3, 4, 5], cron: '0 20 * * 1,2,3,4,5' },
  recovery: { enabled: false, time: '21:00', days: [1, 2, 3, 4, 5, 6, 7], cron: '0 21 * * *' },
  sleep: { enabled: false, time: '22:30', days: [1, 2, 3, 4, 5, 6, 7], cron: '30 22 * * *' }
};
const DEFAULT_HABIT_SCHEDULE_DAYS = [1, 2, 3, 4, 5, 6, 7];
const DEFAULT_MEDITATION_SOUND_SETTINGS = {
  background: 'warmPad',
  start: 'softBell',
  end: 'lowBell'
};
const MEDITATION_SOUND_ID_MIGRATIONS = {
  ambient: 'warmPad',
  whiteNoise: 'deepCalm',
  rain: 'softRain',
  chime: 'warmChime',
  tap: 'breathTone',
  doneBell: 'lowBell',
  transition: 'softBowl',
  softWarn: 'gentleClose'
};
const MEDITATION_SOUND_IDS = {
  background: ['none', 'warmPad', 'softRain', 'deepCalm'],
  start: ['none', 'softBell', 'warmChime', 'breathTone'],
  end: ['none', 'lowBell', 'softBowl', 'gentleClose']
};
const COFFEE_SECTION_ACCENT_COLORS = ['#B86A37', '#B87963', '#D8785E', '#D49A5C', '#C8A46F', '#A57926', '#A46C3B', '#A6846B', '#8F6A4A', '#9A8580'];

export const formatLocalDateKey = (date = new Date()) => {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseLocalDateKey = (dateKey) => {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const cloneDate = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addLocalDays = (date, days = 1) => {
  const next = cloneDate(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getHabitIndex = (habitId) => AppData.choosenHabits.findIndex(id => Number(id) === Number(habitId));

const getWeekdayNumber = (date) => {
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

const getWeekdayNumberFromKey = (dayKey) => {
  const date = parseLocalDateKey(dayKey);
  return date ? getWeekdayNumber(date) : getWeekdayNumber(new Date());
};

const normalizeHabitSchedule = (schedule = {}) => {
  const rawDays = Array.isArray(schedule?.days) ? schedule.days : DEFAULT_HABIT_SCHEDULE_DAYS;
  const days = rawDays
    .map(day => Number.parseInt(day, 10))
    .filter(day => Number.isInteger(day) && day >= 1 && day <= 7)
    .filter((day, index, list) => list.indexOf(day) === index)
    .sort((a, b) => a - b);
  const type = schedule?.type === 'weekly' && days.length > 0 ? 'weekly' : 'daily';

  return {
    type,
    days: type === 'daily' ? [...DEFAULT_HABIT_SCHEDULE_DAYS] : days
  };
};

const normalizeHabitsScheduleMap = (schedules = {}, habitIds = []) => {
  const source = schedules && typeof schedules === 'object' ? schedules : {};
  return Object.fromEntries(
    (habitIds || []).map(habitId => [habitId, normalizeHabitSchedule(source[habitId])])
  );
};

const normalizeMeditationSoundId = (key, value) => {
  const migrated = MEDITATION_SOUND_ID_MIGRATIONS[value] || value;
  return MEDITATION_SOUND_IDS[key]?.includes(migrated) ? migrated : DEFAULT_MEDITATION_SOUND_SETTINGS[key];
};

const normalizeMeditationSoundSettings = (settings = {}) => {
  const source = settings && typeof settings === 'object' ? settings : {};
  return {
    background: normalizeMeditationSoundId('background', source.background),
    start: normalizeMeditationSoundId('start', source.start),
    end: normalizeMeditationSoundId('end', source.end)
  };
};

const getHabitStartDate = (habitIndex) => {
  const raw = AppData.choosenHabitsStartDates?.[habitIndex];
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const getDefaultHabitStatusForDay = (habitId, habitIndex, dayKey, todayKey) => {
  const isNegative = AppData.choosenHabitsTypes?.[habitIndex] === true;
  if (!AppData.isHabitScheduledForDate(habitId, dayKey)) return null;
  if (isNegative) return 1;
  if (AppData.isHabitAutoComplete(habitId)) return 1;
  return dayKey === todayKey ? 0 : -1;
};

const getHabitBackfillStartDate = (habitIndex, today) => {
  const startDate = getHabitStartDate(habitIndex);
  if (!startDate || startDate > today) return null;

  const targetDays = Math.max(1, Number(AppData.choosenHabitsDaysToForm?.[habitIndex]) || 1);
  const backfillDays = Math.min(
    HABIT_BACKFILL_MAX_DAYS,
    Math.max(HABIT_BACKFILL_MIN_DAYS, targetDays + HABIT_BACKFILL_BUFFER_DAYS)
  );
  const windowStart = addLocalDays(today, -(backfillDays - 1));

  return startDate > windowStart ? startDate : windowStart;
};

const DEFAULT_NEGATIVE_HABIT_IDS = new Set([
  30, 31, 32, 33, 34, 35, 36, 37, 38,
  111, 112, 113, 114, 115, 116, 117, 118, 119
]);

const isDateKey = (key) => /^\d{4}-\d{2}-\d{2}$/.test(String(key || ''));
const normalizeStoredHabitId = (habitId) => {
  const numberId = Number(habitId);
  return Number.isFinite(numberId) ? numberId : habitId;
};
const sameHabitId = (left, right) => Number(left) === Number(right) || String(left) === String(right);

const getLoggedDates = (record = {}) => (
  record && typeof record === 'object'
    ? Object.keys(record).filter(isDateKey).sort()
    : []
);

const getHabitIdsFromHistory = () => {
  const ids = [];
  const seen = new Set();

  Object.values(AppData.habitsByDate || {}).forEach((day) => {
    if (!day || typeof day !== 'object' || Array.isArray(day)) return;
    Object.keys(day).forEach((rawId) => {
      const habitId = normalizeStoredHabitId(rawId);
      const key = String(habitId);
      if (seen.has(key)) return;
      seen.add(key);
      ids.push(habitId);
    });
  });

  return ids;
};

const getFirstHabitDate = (habitId) => {
  const dates = getLoggedDates(AppData.habitsByDate)
    .filter((dateKey) => Object.keys(AppData.habitsByDate[dateKey] || {}).some((id) => sameHabitId(id, habitId)));
  return dates[0] || formatLocalDateKey();
};

const isKnownNegativeHabit = (habitId) => {
  if (DEFAULT_NEGATIVE_HABIT_IDS.has(Number(habitId))) return true;
  const customHabit = (AppData.CustomHabits || []).find((habit) => sameHabitId(habit?.id, habitId));
  const category = Array.isArray(customHabit?.category) ? customHabit.category : [customHabit?.category];
  return category.includes('Отказ от вредного') || category.includes('Bad habits to quit');
};

const ensureHabitMetadata = () => {
  let changed = false;

  if (!Array.isArray(AppData.choosenHabits)) {
    AppData.choosenHabits = [];
    changed = true;
  }
  if (!Array.isArray(AppData.choosenHabitsStartDates)) {
    AppData.choosenHabitsStartDates = [];
    changed = true;
  }
  if (!Array.isArray(AppData.choosenHabitsTypes)) {
    AppData.choosenHabitsTypes = [];
    changed = true;
  }
  if (!Array.isArray(AppData.choosenHabitsDaysToForm)) {
    AppData.choosenHabitsDaysToForm = [];
    changed = true;
  }
  if (!AppData.choosenHabitsLastSkip || typeof AppData.choosenHabitsLastSkip !== 'object') {
    AppData.choosenHabitsLastSkip = {};
    changed = true;
  }
  if (!AppData.choosenHabitsAchievements || typeof AppData.choosenHabitsAchievements !== 'object') {
    AppData.choosenHabitsAchievements = {};
    changed = true;
  }
  if (!AppData.choosenHabitsNotified || typeof AppData.choosenHabitsNotified !== 'object') {
    AppData.choosenHabitsNotified = {};
    changed = true;
  }
  if (!AppData.choosenHabitsGoals || typeof AppData.choosenHabitsGoals !== 'object') {
    AppData.choosenHabitsGoals = {};
    changed = true;
  }
  if (!AppData.choosenHabitsAutoComplete || typeof AppData.choosenHabitsAutoComplete !== 'object') {
    AppData.choosenHabitsAutoComplete = {};
    changed = true;
  }
  if (!AppData.choosenHabitsSchedule || typeof AppData.choosenHabitsSchedule !== 'object') {
    AppData.choosenHabitsSchedule = {};
    changed = true;
  }

  getHabitIdsFromHistory().forEach((habitId) => {
    if (AppData.choosenHabits.some((id) => sameHabitId(id, habitId))) return;
    AppData.choosenHabits.push(habitId);
    changed = true;
  });

  AppData.choosenHabits.forEach((habitId, index) => {
    const isNegative = isKnownNegativeHabit(habitId);
    const firstDate = getFirstHabitDate(habitId);

    if (!AppData.choosenHabitsStartDates[index]) {
      AppData.choosenHabitsStartDates[index] = firstDate;
      changed = true;
    }
    if (typeof AppData.choosenHabitsTypes[index] !== 'boolean') {
      AppData.choosenHabitsTypes[index] = isNegative;
      changed = true;
    }
    if (!Number.isFinite(Number(AppData.choosenHabitsDaysToForm[index])) || Number(AppData.choosenHabitsDaysToForm[index]) <= 0) {
      AppData.choosenHabitsDaysToForm[index] = isNegative ? 120 : 66;
      changed = true;
    }
    if (!Array.isArray(AppData.choosenHabitsNotified[habitId])) {
      AppData.choosenHabitsNotified[habitId] = [false, false, false];
      changed = true;
    }
    if (!Array.isArray(AppData.choosenHabitsGoals[habitId])) {
      AppData.choosenHabitsGoals[habitId] = [];
      changed = true;
    }
    if (!Array.isArray(AppData.choosenHabitsAchievements[habitId])) {
      AppData.choosenHabitsAchievements[habitId] = getAchievements(isNegative);
      changed = true;
    }
    const schedule = normalizeHabitSchedule(AppData.choosenHabitsSchedule[habitId]);
    if (JSON.stringify(AppData.choosenHabitsSchedule[habitId]) !== JSON.stringify(schedule)) {
      AppData.choosenHabitsSchedule[habitId] = schedule;
      changed = true;
    }
    if (!Number.isFinite(Number(AppData.choosenHabitsLastSkip[habitId]))) {
      AppData.choosenHabitsLastSkip[habitId] = new Date(AppData.choosenHabitsStartDates[index]).getTime();
      changed = true;
    }
    if (isNegative && Object.prototype.hasOwnProperty.call(AppData.choosenHabitsAutoComplete, habitId)) {
      delete AppData.choosenHabitsAutoComplete[habitId];
      changed = true;
    }
  });

  return changed;
};

const mergeVisitDates = (sectionId, dates) => {
  if (!Array.isArray(AppData.sectionVisits[sectionId])) AppData.sectionVisits[sectionId] = [];
  const current = new Set(AppData.sectionVisits[sectionId].filter(isDateKey));
  const before = current.size;
  dates.filter(isDateKey).forEach((dateKey) => current.add(dateKey));
  AppData.sectionVisits[sectionId] = Array.from(current).sort();
  return current.size !== before;
};

const ensureSectionVisits = () => {
  let changed = false;
  if (!AppData.sectionVisits || typeof AppData.sectionVisits !== 'object') {
    AppData.sectionVisits = { ...DEFAULT_SECTION_VISITS };
    changed = true;
  }

  Object.keys(DEFAULT_SECTION_VISITS).forEach((sectionId) => {
    if (!Array.isArray(AppData.sectionVisits[sectionId])) {
      AppData.sectionVisits[sectionId] = [];
      changed = true;
    }
  });

  changed = mergeVisitDates('habits', getLoggedDates(AppData.habitsByDate)) || changed;
  changed = mergeVisitDates('training', getLoggedDates(AppData.trainingLog)) || changed;
  changed = mergeVisitDates('mental', getLoggedDates(AppData.mentalLog)) || changed;
  changed = mergeVisitDates('recovery', [
    ...getLoggedDates(AppData.breathingLog),
    ...getLoggedDates(AppData.meditationLog),
    ...getLoggedDates(AppData.hardeningLog)
  ]) || changed;
  changed = mergeVisitDates('sleep', getLoggedDates(AppData.sleepingLog)) || changed;

  return changed;
};

const repairRecoveredData = () => {
  const repairedHabits = ensureHabitMetadata();
  const repairedSections = ensureSectionVisits();
  return repairedHabits || repairedSections;
};

const normalizeAccentHex = (color, fallback = DEFAULT_HABITS_ACCENT_COLOR) => {
  if (typeof color !== 'string') return fallback;
  const trimmed = color.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed.slice(1).split('').map(char => char + char).join('')}`.toUpperCase();
  }
  return fallback;
};

const isCoffeeSectionAccent = (color) => {
  const normalized = normalizeAccentHex(color, '');
  if (!normalized) return false;
  if (COFFEE_SECTION_ACCENT_COLORS.includes(normalized)) return true;
  const int = Number.parseInt(normalized.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return r > g && g > b && r >= 120 && g >= 70 && b <= 120 && saturation > 0.22;
};

const normalizeSectionAccentColor = (color, fallback) => {
  const normalized = normalizeAccentHex(color, fallback);
  return isCoffeeSectionAccent(normalized) ? fallback : normalized;
};

const normalizeAccentPresetList = (presets = []) => {
  if (!Array.isArray(presets)) return [];
  return presets
    .map(color => normalizeAccentHex(color, ''))
    .filter(Boolean)
    .filter(color => !isCoffeeSectionAccent(color))
    .filter((color, index, list) => list.indexOf(color) === index)
    .slice(-12);
};

const cloneNotifySettings = () => DEFAULT_NOTIFY_SETTINGS.map(item => ({ ...item }));

const normalizeNotifySettings = (notify = []) => (
  cloneNotifySettings().map((defaults, index) => {
    const saved = Array.isArray(notify) ? notify[index] : null;
    return {
      enabled: saved?.enabled === true,
      cron: typeof saved?.cron === 'string' && saved.cron.trim() ? saved.cron : defaults.cron
    };
  })
);

const cronToTime = (cron, fallback) => {
  if (typeof cron !== 'string') return fallback;
  const [minute, hour] = cron.split(' ');
  const h = Number.parseInt(hour, 10);
  const m = Number.parseInt(minute, 10);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return fallback;
  return `${String(Math.max(0, Math.min(23, h))).padStart(2, '0')}:${String(Math.max(0, Math.min(59, m))).padStart(2, '0')}`;
};

const cronToDays = (cron, fallback) => {
  if (typeof cron !== 'string') return fallback;
  const parts = cron.split(' ');
  if (parts.length < 5 || parts[4] === '*') return [1, 2, 3, 4, 5, 6, 7];
  const days = parts[4]
    .split(',')
    .map(day => Number.parseInt(day, 10))
    .filter(day => Number.isInteger(day) && day >= 1 && day <= 7);
  return days.length > 0 ? days : fallback;
};

const buildCronFromNotification = (time, days) => {
  const [hourRaw = '9', minuteRaw = '0'] = String(time || '09:00').split(':');
  const hour = Math.max(0, Math.min(23, Number.parseInt(hourRaw, 10) || 0));
  const minute = Math.max(0, Math.min(59, Number.parseInt(minuteRaw, 10) || 0));
  const normalizedDays = Array.isArray(days)
    ? days.filter(day => Number.isInteger(day) && day >= 1 && day <= 7)
    : [];
  const dayPart = normalizedDays.length === 7 || normalizedDays.length === 0 ? '*' : normalizedDays.join(',');
  return `${minute} ${hour} * * ${dayPart}`;
};

const normalizeSectionNotifications = (sectionNotifications = {}, notify = []) => {
  const legacyNotify = normalizeNotifySettings(notify);
  const legacyBySection = {
    habits: legacyNotify[0],
    training: legacyNotify[1]
  };

  return Object.fromEntries(Object.entries(DEFAULT_SECTION_NOTIFICATIONS).map(([section, defaults]) => {
    const saved = sectionNotifications?.[section] || {};
    const legacy = legacyBySection[section] || {};
    const cron = typeof saved.cron === 'string' && saved.cron.trim()
      ? saved.cron
      : (typeof legacy.cron === 'string' && legacy.cron.trim() ? legacy.cron : defaults.cron);
    const time = typeof saved.time === 'string' && /^\d{1,2}:\d{2}$/.test(saved.time)
      ? saved.time.padStart(5, '0')
      : cronToTime(cron, defaults.time);
    const days = Array.isArray(saved.days) && saved.days.length > 0
      ? saved.days.filter(day => Number.isInteger(day) && day >= 1 && day <= 7)
      : cronToDays(cron, defaults.days);
    const normalized = {
      enabled: saved.enabled ?? legacy.enabled ?? defaults.enabled,
      time,
      days: days.length > 0 ? days : defaults.days
    };
    return [section, {
      ...defaults,
      ...normalized,
      cron: buildCronFromNotification(normalized.time, normalized.days)
    }];
  }));
};

const isLegacyTrainingAccentColor = (color) => {
  const normalized = normalizeAccentHex(color, '');
  if (!normalized) return true;
  if (LEGACY_TRAINING_ACCENT_COLORS.includes(normalized) || isCoffeeSectionAccent(normalized)) return true;
  const int = Number.parseInt(normalized.slice(1), 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  const isOldOrangeBrown = r > 150 && g >= 45 && g < 145 && b < 120;
  const isPurpleLeaning = b >= 175 && r >= 105 && g <= 170;
  return isOldOrangeBrown || isPurpleLeaning;
};

const hasObjectEntries = (value) => value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length > 0;
const hasArrayEntries = (value) => Array.isArray(value) && value.length > 0;
const hasNestedArrayEntries = (value) => Array.isArray(value) && value.some(item => Array.isArray(item) ? item.length > 0 : !!item);

export function hasMeaningfulUserData(data = AppData) {
  if (!data) return false;
  const hasMeasurements = Array.isArray(data.measurements)
    && data.measurements.some(entry => Array.isArray(entry) && entry.length > 0);
  const hasSectionVisits = data.sectionVisits && typeof data.sectionVisits === 'object'
    && Object.values(data.sectionVisits).some(value => Number(value) > 0);

  return (
    hasArrayEntries(data.choosenHabits) ||
    hasArrayEntries(data.CustomHabits) ||
    hasObjectEntries(data.habitsByDate) ||
    hasObjectEntries(data.choosenHabitsGoals) ||
    hasObjectEntries(data.habitEventTimes) ||
    hasArrayEntries(data.todoList) ||
    hasObjectEntries(data.trainingLog) ||
    hasObjectEntries(data.breathingLog) ||
    hasObjectEntries(data.meditationLog) ||
    hasObjectEntries(data.hardeningLog) ||
    hasObjectEntries(data.mentalLog) ||
    hasObjectEntries(data.sleepingLog) ||
    hasMeasurements ||
    hasNestedArrayEntries(data.profilePreferredSections) ||
    hasSectionVisits
  );
}

export function hasCompletedProfileOrExistingData(data = AppData) {
  return data?.pData?.filled === true || data?.profileOnboardingShown === true || hasMeaningfulUserData(data);
}

export class AppData{
   static needsDataRepairSave = false;
   static insightData = '';
   // Format: { [category]: { text: "...", date: "2023-10-27" } }
   static insightCache = {};
   static lastSave = new Date().toISOString();
   static isFirstStart = true;
   static prefs = [...DEFAULT_PREFS]; // language, theme, sound, vibro, font size
   static notify = cloneNotifySettings();
   static sectionNotifications = normalizeSectionNotifications();
   //  habits
  static habitCustomCategories = []; // [{icon, label:[ru,en]}]
  static habitCategoryOverrides = {};
  static deletedDefaultHabitCategories = [];
  static habitAccentColor = DEFAULT_HABITS_ACCENT_COLOR;
  static habitAccentPresets = [];
  static CustomHabits = [];
   static choosenHabitsGoals = {};//{id:[{text:'',isDone:false}]}
   static choosenHabitsStartDates = [];
   static choosenHabitsLastSkip = {};
   static choosenHabitsAutoComplete = {};
   static choosenHabitsSchedule = {};
   static habitEventTimes = {};
   static choosenHabits = []; // id array
   static choosenHabitsAchievements = {};
   static choosenHabitsNotified = {};
   static habitsByDate = {};// {'date':[habitId:status(integer)]}
   static choosenHabitsDaysToForm = [];
   static choosenHabitsTypes = [];
   static lastBackupDate = '';
   // training log
   static currentProgramId = null;
  static exercises = exercises;
  static programs = programs;
  static trainingAccentColor = DEFAULT_TRAINING_ACCENT_COLOR;
  static trainingAccentPresets = [];
  static trainingLog = {};
   static pData = {filled:false,age:20,gender:0,height:180,weight:70,goal:1,activityLevel:1};
   static profileOnboardingShown = false;
   static profileNicknameMode = 'telegram';
   static profileCustomNickname = '';
   static profileAvatarPhoto = '';
   static profileDiscoverySource = '';
   static profilePreferredSections = [];
   static measurements = [[],[],[],[],[]];// [[{ date: newDateStr, value: val }],[],[],[],[]]
  static ownPlates = [true,true,true,true,true,true,true,true];
  static platesAmount = [10,10,10,10,10,10,10,10];
  static barWeight = 20;
  // practices
  static recoveryProtocols = [[[[false,false,false],[false,false],[false,false],[false,false]],[[false,false],[false,false],[false,false],[false,false,false,false]],[[false,false,false],[false,false],[false,false],[false,false]],[[false,false],[false,false,false],[false,false]]],//breathing
  [[[false,false,false],[false,false]],[[false,false],[false,false]],[[false,false],[false,false]],[[false,false],[false,false]]],
  [[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]],[[false,false,false],[false,false,false]]]];
  static breathingLog = {};
  static meditationLog = {};
  static hardeningLog = {};
  static meditationSoundSettings = { ...DEFAULT_MEDITATION_SOUND_SETTINGS };
  static recoveryAccentColor = DEFAULT_RECOVERY_ACCENT_COLOR;
  static recoveryAccentPresets = [];
  //mental
  static mentalLog = {};
  static mentalRecords = [[0,0,0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
  static mentalAccentColor = DEFAULT_MENTAL_ACCENT_COLOR;
  static mentalAccentPresets = [];
  //
	  static sleepingLog = {};
	  static sleepAccentColor = DEFAULT_SLEEP_ACCENT_COLOR;
	  static sleepAccentPresets = [];
  static sleepIntegrations = {
    appleHealth: { connected: false, autoSync: false, lastSync: '', error: '' },
    whoop: { connected: false, autoSync: false, lastSync: '', error: '' },
    oura: { connected: false, autoSync: false, lastSync: '', error: '' }
  };
	  static todoList = [];
	  static todoAccentColor = DEFAULT_TODO_ACCENT_COLOR;
	  static todoAccentPresets = [];
	  static todoCustomCategories = []; // [{icon, label:[ru,en]}]
  static sectionVisits = { ...DEFAULT_SECTION_VISITS };
  static sectionLastOpenedAt = { ...DEFAULT_SECTION_LAST_OPENED_AT };
  static profileFriendsExpanded = true;
  static premiumSnapshot = { hasPremium: false, premiumEndDate: null, isValidation: false, checkedAt: 0 };
  static menuCardsStates =
{
  "MainCard": {
    "pinned": false,
    "hidden": false
  },
  "HabitsMain": {
    "pinned": false,
    "hidden": false
  },
  "TrainingMain": {
    "pinned": false,
    "hidden": false
  },
  "MentalMain": {
    "pinned": false,
    "hidden": false
  },
  "RecoveryMain": {
    "pinned": false,
    "hidden": false
  },
  "SleepMain": {
    "pinned": false,
    "hidden": false
  },
  "ToDoMain": {
    "pinned": false,
    "hidden": false
  }
};
  static infoMiniPanel = {
  "MainCard": true,
  "HabitsMain": true,
  "TrainingMain": true,
  "MentalMain": true,
  "RecoveryMain": true,
  "SleepMain": true,
  "ToDoMain": true
};
static mainHeroWidgets = ["HabitsMain", "TrainingMain", "MentalMain"];
  static habitCardWidgets = {
  days: true,
  skips: true,
  streak: true,
  timer: true,
  description: true,
  goals: true,
  achievements: true
};
  // methods
  static init(data) {
    if (!data) return;
    //console.log(JSON.stringify(data));  //log for tests
    this.lastSave = data.lastSave;
    this.isFirstStart = data.isFirstStart;
    if (this.isFirstStart === false) {
      this.prefs = Array.isArray(data.prefs)
        ? DEFAULT_PREFS.map((defaultValue, index) => data.prefs[index] ?? defaultValue)
        : [...DEFAULT_PREFS];
    }
    else this.isFirstStart = false;
    this.prefs[1] = 0;
    setLang(this.prefs[0] === 0 ? 'ru' : 'en');
    setTheme(THEME.DARK);
    setSoundAndVibro(this.prefs[2],this.prefs[3]);
    setFontSize(this.prefs[4]);
    this.choosenHabitsStartDates = Array.isArray(data.choosenHabitsStartDates) ? [...data.choosenHabitsStartDates] : [];
    this.choosenHabitsLastSkip = data.choosenHabitsLastSkip && typeof data.choosenHabitsLastSkip === 'object' ? data.choosenHabitsLastSkip : {};
    this.choosenHabitsAchievements = data.choosenHabitsAchievements && typeof data.choosenHabitsAchievements === 'object' ? data.choosenHabitsAchievements : {};
    this.choosenHabits = Array.isArray(data.choosenHabits) ? [...data.choosenHabits] : [];
    this.choosenHabitsTypes = Array.isArray(data.choosenHabitsTypes) ? [...data.choosenHabitsTypes] : [];
    this.choosenHabitsGoals = data.choosenHabitsGoals && typeof data.choosenHabitsGoals === 'object' ? data.choosenHabitsGoals : {};
    this.choosenHabitsAutoComplete = data.choosenHabitsAutoComplete || {};
    this.choosenHabitsSchedule = normalizeHabitsScheduleMap(data.choosenHabitsSchedule, this.choosenHabits);
    this.habitEventTimes = data.habitEventTimes || {};
    this.choosenHabitsNotified = data.choosenHabitsNotified && typeof data.choosenHabitsNotified === 'object' ? data.choosenHabitsNotified : {};
    this.choosenHabitsDaysToForm = Array.isArray(data.choosenHabitsDaysToForm) ? data.choosenHabitsDaysToForm : [];
    this.CustomHabits = Array.isArray(data.CustomHabits) ? data.CustomHabits : [];
    this.habitsByDate = data.habitsByDate && typeof data.habitsByDate === 'object' ? data.habitsByDate : {};
    this.notify = normalizeNotifySettings(data.notify);
    this.sectionNotifications = normalizeSectionNotifications(data.sectionNotifications, this.notify);
    setNotify(this.notify);
    this.pData = data.pData || {filled:false,age:20,gender:0,height:180,weight:70,goal:1,activityLevel:1};
    this.profileOnboardingShown = data.profileOnboardingShown ?? this.pData.filled === true;
    if (this.profileOnboardingShown !== true && hasMeaningfulUserData(data)) {
      this.profileOnboardingShown = true;
    }
    this.profileNicknameMode = data.profileNicknameMode || 'telegram';
    this.profileCustomNickname = data.profileCustomNickname || '';
    this.profileAvatarPhoto = data.profileAvatarPhoto || '';
    this.profileDiscoverySource = data.profileDiscoverySource || '';
    this.profilePreferredSections = Array.isArray(data.profilePreferredSections) ? data.profilePreferredSections : [];
    this.lastBackupDate = data.lastBackupDate;
    this.measurements = data.measurements;
    if (data.exercises && typeof data.exercises === 'object' && !Array.isArray(data.exercises)) this.exercises = data.exercises;
    if (data.programs && typeof data.programs === 'object' && !Array.isArray(data.programs)) this.programs = data.programs;
    this.trainingAccentColor = typeof data.trainingAccentColor === 'string' && !isLegacyTrainingAccentColor(data.trainingAccentColor)
      ? normalizeSectionAccentColor(data.trainingAccentColor, DEFAULT_TRAINING_ACCENT_COLOR)
      : DEFAULT_TRAINING_ACCENT_COLOR;
    this.trainingAccentPresets = normalizeAccentPresetList(data.trainingAccentPresets);
    if(data.ownPlates?.length > 0)this.ownPlates = data.ownPlates;
    if(data.platesAmount?.length > 0)this.platesAmount = data.platesAmount;
    this.barWeight = data.barWeight;
    this.trainingLog = data.trainingLog;
    if(data.recoveryProtocols[0][1].length > 2){
      this.recoveryProtocols = data.recoveryProtocols;
    }
    this.breathingLog = data.breathingLog;
    this.meditationLog = data.meditationLog;
    this.hardeningLog = data.hardeningLog;
    this.meditationSoundSettings = normalizeMeditationSoundSettings(data.meditationSoundSettings);
    this.recoveryAccentColor = typeof data.recoveryAccentColor === 'string' && !LEGACY_RECOVERY_ACCENT_COLORS.includes(data.recoveryAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.recoveryAccentColor)
      ? normalizeSectionAccentColor(data.recoveryAccentColor, DEFAULT_RECOVERY_ACCENT_COLOR)
      : DEFAULT_RECOVERY_ACCENT_COLOR;
    this.recoveryAccentPresets = normalizeAccentPresetList(data.recoveryAccentPresets);
    this.mentalLog = data.mentalLog;
    this.mentalRecords = data.mentalRecords;
    this.mentalAccentColor = typeof data.mentalAccentColor === 'string' && !LEGACY_MENTAL_ACCENT_COLORS.includes(data.mentalAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.mentalAccentColor)
      ? normalizeSectionAccentColor(data.mentalAccentColor, DEFAULT_MENTAL_ACCENT_COLOR)
      : DEFAULT_MENTAL_ACCENT_COLOR;
    this.mentalAccentPresets = normalizeAccentPresetList(data.mentalAccentPresets);
	    this.sleepingLog = data.sleepingLog || {};
	    this.sleepAccentColor = typeof data.sleepAccentColor === 'string' && !LEGACY_SLEEP_ACCENT_COLORS.includes(data.sleepAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.sleepAccentColor)
        ? normalizeSectionAccentColor(data.sleepAccentColor, DEFAULT_SLEEP_ACCENT_COLOR)
        : DEFAULT_SLEEP_ACCENT_COLOR;
	    this.sleepAccentPresets = normalizeAccentPresetList(data.sleepAccentPresets);
    this.sleepIntegrations = {
      appleHealth: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.appleHealth || {}) },
      whoop: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.whoop || {}) },
      oura: { connected: false, autoSync: false, lastSync: '', error: '', ...(data.sleepIntegrations?.oura || {}) }
	    };
	    this.todoList = data.todoList || [];
	    this.todoAccentColor = typeof data.todoAccentColor === 'string' && !LEGACY_TODO_ACCENT_COLORS.includes(data.todoAccentColor.toUpperCase()) && !isCoffeeSectionAccent(data.todoAccentColor)
        ? normalizeSectionAccentColor(data.todoAccentColor, DEFAULT_TODO_ACCENT_COLOR)
        : DEFAULT_TODO_ACCENT_COLOR;
	    this.todoAccentPresets = normalizeAccentPresetList(data.todoAccentPresets);
	    this.todoCustomCategories = Array.isArray(data.todoCustomCategories) ? data.todoCustomCategories : [];
    this.habitCustomCategories = Array.isArray(data.habitCustomCategories) ? data.habitCustomCategories : [];
    this.habitCategoryOverrides = data.habitCategoryOverrides && typeof data.habitCategoryOverrides === 'object' ? data.habitCategoryOverrides : {};
    this.deletedDefaultHabitCategories = Array.isArray(data.deletedDefaultHabitCategories) ? data.deletedDefaultHabitCategories : [];
    this.habitAccentColor = setHabitAccent(typeof data.habitAccentColor === 'string' && !isCoffeeSectionAccent(data.habitAccentColor) && !PREVIOUS_DEFAULT_HABITS_ACCENT_COLORS.includes(normalizeAccentHex(data.habitAccentColor, DEFAULT_HABITS_ACCENT_COLOR))
      ? normalizeAccentHex(data.habitAccentColor, DEFAULT_HABITS_ACCENT_COLOR)
      : DEFAULT_HABITS_ACCENT_COLOR).hue;
    this.habitAccentPresets = normalizeAccentPresetList(data.habitAccentPresets);
    this.sectionVisits = data.sectionVisits || { ...DEFAULT_SECTION_VISITS };
    this.sectionLastOpenedAt = data.sectionLastOpenedAt && typeof data.sectionLastOpenedAt === 'object'
      ? { ...DEFAULT_SECTION_LAST_OPENED_AT, ...data.sectionLastOpenedAt }
      : { ...DEFAULT_SECTION_LAST_OPENED_AT };
    this.profileFriendsExpanded = data.profileFriendsExpanded ?? true;
    this.premiumSnapshot = data.premiumSnapshot && typeof data.premiumSnapshot === 'object'
      ? {
          hasPremium: data.premiumSnapshot.hasPremium === true,
          premiumEndDate: data.premiumSnapshot.premiumEndDate || null,
          isValidation: data.premiumSnapshot.isValidation === true,
          checkedAt: Number(data.premiumSnapshot.checkedAt) || 0
        }
      : { hasPremium: false, premiumEndDate: null, isValidation: false, checkedAt: 0 };
    this.todoFieldsVisibility = data.todoFieldsVisibility || { priority: true, difficulty: true, urgency: true };
    this.insightCache = data.insightCache || {};
    this.sectionVisits = data.sectionVisits || { ...DEFAULT_SECTION_VISITS };
    this.menuCardsStates = data.menuCardsStates ||
{
  "MainCard": {
    "pinned": false,
    "hidden": false
  },
  "HabitsMain": {
    "pinned": false,
    "hidden": false
  },
  "TrainingMain": {
    "pinned": false,
    "hidden": false
  },
  "MentalMain": {
    "pinned": false,
    "hidden": false
  },
  "RecoveryMain": {
    "pinned": false,
    "hidden": false
  },
  "SleepMain": {
    "pinned": false,
    "hidden": false
  },
  "ToDoMain": {
    "pinned": false,
    "hidden": false
  }
};
    this.infoMiniPanel = data.infoMiniPanel || {
      "MainCard": true,
      "HabitsMain": true,
      "TrainingMain": true,
      "MentalMain": true,
      "RecoveryMain": true,
      "SleepMain": true,
      "ToDoMain": true
    };
    this.mainHeroWidgets = Array.isArray(data.mainHeroWidgets) && data.mainHeroWidgets.length > 0
      ? data.mainHeroWidgets.slice(0, 3)
      : ["HabitsMain", "TrainingMain", "MentalMain"];
    const savedHabitCardWidgets = data.habitCardWidgets || {};
    const statsFallback = savedHabitCardWidgets.stats;
    this.habitCardWidgets = {
      days: savedHabitCardWidgets.days ?? statsFallback ?? true,
      skips: savedHabitCardWidgets.skips ?? statsFallback ?? true,
      streak: savedHabitCardWidgets.streak ?? statsFallback ?? true,
      timer: savedHabitCardWidgets.timer ?? statsFallback ?? true,
      description: savedHabitCardWidgets.description ?? true,
      goals: savedHabitCardWidgets.goals ?? true,
      achievements: savedHabitCardWidgets.achievements ?? true
    };
    this.needsDataRepairSave = repairRecoveredData();
  } 
  static async setSectionNotification(section, config) {
    const normalized = normalizeSectionNotifications({
      ...this.sectionNotifications,
      [section]: config
    }, this.notify);
    this.sectionNotifications = normalized;
    if (section === 'habits') this.notify[0] = { enabled: normalized.habits.enabled, cron: normalized.habits.cron };
    if (section === 'training') this.notify[1] = { enabled: normalized.training.enabled, cron: normalized.training.cron };
    setNotify(this.notify);
    await saveData();
    return this.sectionNotifications[section];
  }
  static async setPrefs(ind,value){
    if (ind === 1) value = 0;
    this.prefs[ind] = value;
    if (ind === 2 || ind === 3) setSoundAndVibro(this.prefs[2], this.prefs[3]);
    if (ind === 4) setFontSize(value);
    await saveData();
  }
  static async setHabitAccentColor(color) {
    this.habitAccentColor = setHabitAccent(color).hue;
    await saveData();
  }
  static async addAccentPreset(section, color, defaultPresets = []) {
    const fieldBySection = {
      habits: 'habitAccentPresets',
      todo: 'todoAccentPresets',
      sleep: 'sleepAccentPresets',
      mental: 'mentalAccentPresets',
      recovery: 'recoveryAccentPresets',
      training: 'trainingAccentPresets'
    };
    const field = fieldBySection[section];
    if (!field) return [];

    const nextColor = normalizeAccentHex(color, '');
    if (!nextColor) return this[field] || [];

    const defaults = normalizeAccentPresetList(defaultPresets);
    const current = normalizeAccentPresetList(this[field]);
    if (!defaults.includes(nextColor) && !current.includes(nextColor)) {
      this[field] = [...current, nextColor].slice(-12);
      await saveData();
    } else {
      this[field] = current;
    }
    return this[field];
  }
  static getLastProgramId() {
  const allDates = Object.keys(this.trainingLog).filter(dateKey => this.trainingLog[dateKey]?.length > 0);
  
  if (allDates.length === 0) return 0;

  // Sort descending: most recent first
  allDates.sort((a, b) => b.localeCompare(a));
  const latestDate = allDates[0];
  const sessions = this.trainingLog[latestDate];
  const lastSession = sessions[sessions.length - 1];

  return lastSession.programId ?? 0;
}

static getLastTrainingDayIndex() {
  const allDates = Object.keys(this.trainingLog).filter(dateKey => this.trainingLog[dateKey]?.length > 0);
  
  if (allDates.length === 0) return 0;

  allDates.sort((a, b) => b.localeCompare(a));
  const latestDate = allDates[0];
  const sessions = this.trainingLog[latestDate];
  const lastSession = sessions[sessions.length - 1];

  // Return next day index (so +1), but ensure it's a valid number
  const nextDayIndex = (lastSession.dayIndex ?? -1) + 1;
  return nextDayIndex >= 0 ? nextDayIndex : 0;
}
  
  static hasKey(key) {
    return Object.prototype.hasOwnProperty.call(this.habitsByDate, key);
  }
  static isDayContainsHabit(day,habitId) {
     if(day in this.habitsByDate){
        return habitId in this.habitsByDate[day];
     }
     return false;
  } 
  static getHabitSchedule(habitId) {
    if (!this.choosenHabitsSchedule || typeof this.choosenHabitsSchedule !== 'object') this.choosenHabitsSchedule = {};
    const current = normalizeHabitSchedule(this.choosenHabitsSchedule[habitId]);
    this.choosenHabitsSchedule[habitId] = current;
    return current;
  }
  static isHabitScheduledForDate(habitId, dayKey = formatLocalDateKey()) {
    const schedule = this.getHabitSchedule(habitId);
    if (schedule.type === 'daily') return true;
    return schedule.days.includes(getWeekdayNumberFromKey(dayKey));
  }
  static async setHabitSchedule(habitId, schedule) {
    if (!this.choosenHabitsSchedule || typeof this.choosenHabitsSchedule !== 'object') this.choosenHabitsSchedule = {};
    this.choosenHabitsSchedule[habitId] = normalizeHabitSchedule(schedule);
    await saveData();
    return this.choosenHabitsSchedule[habitId];
  }
  static async setMeditationSoundSettings(settings) {
    this.meditationSoundSettings = normalizeMeditationSoundSettings(settings);
    await saveData();
    return this.meditationSoundSettings;
  }
  static isHabitAutoComplete(habitId) {
    return this.choosenHabitsAutoComplete?.[habitId] === true;
  }
  static getHabitEventTimestamp(day, habitId) {
    return this.habitEventTimes?.[habitId]?.[day] || null;
  }
  static normalizeHabitEventTimestamp(day, eventTimestamp = null) {
    if (Number.isFinite(eventTimestamp)) return eventTimestamp;
    if (day === formatLocalDateKey()) return Date.now();
    const [year, month, date] = day.split('-').map(Number);
    return new Date(year, month - 1, date, 23, 59, 0, 0).getTime();
  }
  static setHabitEventTimestamp(day, habitId, status, eventTimestamp = null) {
    const habitIndex = this.choosenHabits.indexOf(Number(habitId));
    const isNegative = habitIndex !== -1 && this.choosenHabitsTypes[habitIndex];
    if (status === -1 && isNegative) {
      if (!this.habitEventTimes[habitId]) this.habitEventTimes[habitId] = {};
      this.habitEventTimes[habitId][day] = this.normalizeHabitEventTimestamp(day, eventTimestamp);
      return;
    }
    if (this.habitEventTimes[habitId]) {
      delete this.habitEventTimes[habitId][day];
      if (Object.keys(this.habitEventTimes[habitId]).length === 0) delete this.habitEventTimes[habitId];
    }
  }
  static syncLastSkip(habitId) {
    const habitIndex = getHabitIndex(habitId);
    if (habitIndex === -1 || !this.choosenHabitsTypes[habitIndex]) return false;
    let latestSkip = null;
    Object.entries(this.habitsByDate).forEach(([day, habits]) => {
      if (habits?.[habitId] < 0) {
        const timestamp = this.getHabitEventTimestamp(day, habitId) || this.normalizeHabitEventTimestamp(day);
        if (!latestSkip || timestamp > latestSkip) latestSkip = timestamp;
      }
    });
    const nextLastSkip = latestSkip || new Date(this.choosenHabitsStartDates[habitIndex]).getTime();
    if (this.choosenHabitsLastSkip[habitId] === nextLastSkip) return false;
    this.choosenHabitsLastSkip[habitId] = nextLastSkip;
    return true;
  }
  static async addHabit(habitId,dateString,goals,isNegative,daysToForm,autoComplete = false,schedule = null){
    const isStartDateEarlier = Date.now() - new Date(dateString).getTime() > 86400000;
    const todayKey = formatLocalDateKey();
    if (!this.habitsByDate || typeof this.habitsByDate !== 'object') this.habitsByDate = {};
    if(!this.choosenHabits.includes(habitId)) {
       this.choosenHabits.push(habitId);
       this.choosenHabitsAchievements[habitId] = getAchievements(isNegative);
       this.choosenHabitsGoals[habitId] = goals || [];
       this.choosenHabitsStartDates.push(dateString);
       this.choosenHabitsNotified[habitId] = [false,false,false];
       this.choosenHabitsDaysToForm.push(daysToForm);
       this.choosenHabitsLastSkip[habitId] = isStartDateEarlier ? new Date(dateString).getTime()  : Date.now();
       this.choosenHabitsTypes.push(isNegative);
       if (!isNegative) this.choosenHabitsAutoComplete[habitId] = autoComplete === true;
       else delete this.choosenHabitsAutoComplete[habitId];
       this.choosenHabitsSchedule[habitId] = normalizeHabitSchedule(schedule);
       habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
    }
    const startDate = new Date(dateString);
    const endDate = new Date();
    let currentDate = startDate;
    while (currentDate < endDate) {
    const current = formatLocalDateKey(currentDate);
    if (!this.isHabitScheduledForDate(habitId, current)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }
    if(!(current in this.habitsByDate)) {
      this.habitsByDate[current] = {};
      this.habitsByDate[current][habitId] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     else{
      this.habitsByDate[current][habitId] = getHabitPerformPercent(habitId) < 100 ? 1 : 1; 
     }
     currentDate.setDate(currentDate.getDate() + 1);
   }
   if (!this.habitsByDate[todayKey]) this.habitsByDate[todayKey] = {};
   if(!this.isHabitScheduledForDate(habitId, todayKey)){
       delete this.habitsByDate[todayKey][habitId];
   }
   else if(isNegative){
       this.habitsByDate[todayKey][habitId] = 1;
   }
   else this.habitsByDate[todayKey][habitId] = this.isHabitAutoComplete(habitId) || getHabitPerformPercent(habitId) >= 100 ? 1 : 0;
   await saveData();
  }
  static async addHabitGoal(habitId,goal){
    this.choosenHabitsGoals[habitId].push(goal);
    await saveData();
  }
  static async removeHabit(habitId){
    if(this.choosenHabits.includes(habitId)){
    const index = this.choosenHabits.indexOf(habitId);
    this.choosenHabits.splice(index,1);
    delete this.choosenHabitsAchievements[habitId];
    this.choosenHabitsDaysToForm.splice(index,1);
    delete this.choosenHabitsLastSkip[habitId];
    delete this.choosenHabitsAutoComplete[habitId];
    delete this.choosenHabitsSchedule[habitId];
    delete this.habitEventTimes[habitId];
    this.choosenHabitsTypes.splice(index,1);
    delete this.choosenHabitsGoals[habitId];
    this.choosenHabitsStartDates.splice(index,1);
    delete this.choosenHabitsNotified[habitId];
    Object.entries(this.habitsByDate).forEach(([date, habit]) => {
    if (habitId in habit) {
      delete habit[habitId];
      if (Object.keys(habit).length === 0) {
        delete this.habitsByDate[date];
      }
    }
   });
  }
  if(this.choosenHabits.length === 0){
    this.habitsByDate = {};
    NotificationsManager.sendMessage("habitoff", UserData.id);
  }else  habitReminder(this.prefs[0],this.notify[0].cron,0,0,false);
  await saveData();
  }
  static async changeStatus(day, habitId, status, eventTimestamp = null) {
    if (!this.habitsByDate[day]) this.habitsByDate[day] = {};
    this.habitsByDate[day][habitId] = status;
    this.setHabitEventTimestamp(day, habitId, status, eventTimestamp);
    this.syncLastSkip(habitId);
    const percent = getHabitPerformPercent(habitId);
    if (percent > 99 && !this.choosenHabitsNotified[habitId][0]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "🎉 Отлично! Новая привычка создана — ваш путь к успешным изменениям начинается! 🚀"
      : "🎉 Awesome! Your new habit is set — your journey to positive change begins now! 🚀",3000,true);
    this.choosenHabitsNotified[habitId][0] = true;
    } else if (percent > 27 && percent < 33 && !this.choosenHabitsNotified[habitId][1]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "✨ Первый шаг сделан! Продолжайте, вы на верном пути! 💪"
      : "✨ First step done! Keep going, you’re on the right track! 💪",2500,true);
    this.choosenHabitsNotified[habitId][1] = true;
    } else if (percent > 47 && percent < 53 && !this.choosenHabitsNotified[habitId][2]) {
     setShowPopUpPanel(this.prefs[0] === 0
      ? "🌱 Полпути пройдено — не сдавайтесь, привычка становится частью вас! 🤩"
      : "🌱 Halfway there — don’t give up, your habit is taking root! 🤩",2500,true);
    this.choosenHabitsNotified[habitId][2] = true;
    }
     await saveData();
  }
  static async AddCustomHabit(n, cat, desc, src, id) {
    const description = desc === "" ? ["Своя привычка", "My custom habit"] : [desc, desc];
    const iconName = src === '' ? 'default' : src;
    const newHabit = new Habit(
      [n, n],
      cat,
      description,
      id,
      true,
      iconName
    );
    this.CustomHabits.push(newHabit);
     await saveData();
    return newHabit;
    
  }
  static IsCustomHabitExists(habitId){
    return this.CustomHabits.some(habit => habit.id === habitId);
  }
  static IsHabitInChoosenList(habitId){
    return this.choosenHabits.includes(habitId);
  }
  static GetAllHabitCategories(langIndex, includeDeleted = false) {
    const activeDefaults = DEFAULT_HABIT_CATEGORIES
      .filter((category) => !this.deletedDefaultHabitCategories.includes(category.key))
      .map((category) => {
        const override = this.habitCategoryOverrides[category.key] || {};
        return {
          ...category,
          ...override,
          key: category.key,
          label: override.label || category.label,
          isDefault: true,
          isDeleted: false
        };
      });
    const custom = this.habitCustomCategories.map((category, index) => ({ ...category, isDefault: false, customIndex: index, isDeleted: category.isDeleted === true })).filter(cat => includeDeleted || !cat.isDeleted);
    const deletedDefaults = includeDeleted
      ? DEFAULT_HABIT_CATEGORIES
          .filter((category) => this.deletedDefaultHabitCategories.includes(category.key))
          .map((category) => {
            const override = this.habitCategoryOverrides[category.key] || {};
            return {
              ...category,
              ...override,
              key: category.key,
              label: override.label || category.label,
              isDefault: true,
              isDeleted: true
            };
          })
      : [];
    return [...activeDefaults, ...custom, ...deletedDefaults];
  }
  static AddHabitCustomCategory(icon, labelRu, labelEn, isNegative = false) {
    const newCategory = { icon, label: [labelRu, labelEn], isNegative };
    this.habitCustomCategories.push(newCategory);
    saveData();
    return newCategory;
  }
  static RemoveHabitCustomCategory(index) {
    const categories = this.GetAllHabitCategories(0, true);
    const category = categories[index];
    if (!category) return;

    if (category.isDefault) {
      if (!this.deletedDefaultHabitCategories.includes(category.key)) {
        this.deletedDefaultHabitCategories.push(category.key);
      }
      delete this.habitCategoryOverrides[category.key];
      saveData();
      return;
    }

    if (typeof category.customIndex === 'number' && category.customIndex >= 0 && category.customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[category.customIndex].isDeleted = true;
      saveData();
    }
  }
  static RestoreCustomHabitCategory(customIndex) {
    if (typeof customIndex === 'number' && customIndex >= 0 && customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[customIndex].isDeleted = false;
      saveData();
    }
  }
  static UpdateHabitCustomCategory(index, icon, labelRu, labelEn, isNegative) {
    const categories = this.GetAllHabitCategories(0, true);
    const category = categories[index];
    if (!category) return;

    if (category.isDefault) {
      this.deletedDefaultHabitCategories = this.deletedDefaultHabitCategories.filter((key) => key !== category.key);
      this.habitCategoryOverrides[category.key] = { icon, label: [labelRu, labelEn], isNegative };
      saveData();
      return;
    }

    if (typeof category.customIndex === 'number' && category.customIndex >= 0 && category.customIndex < this.habitCustomCategories.length) {
      this.habitCustomCategories[category.customIndex] = { icon, label: [labelRu, labelEn], isNegative };
      saveData();
    }
  }
  static GetHabitCustomCategory(index) {
    return this.GetAllHabitCategories(0, true)[index] || null;
  }
  static RestoreDefaultHabitCategory(key) {
    this.deletedDefaultHabitCategories = this.deletedDefaultHabitCategories.filter((categoryKey) => categoryKey !== key);
    saveData();
  }
}

export const fillEmptyDays = () => {
  const todayKey = formatLocalDateKey();
  const today = parseLocalDateKey(todayKey);
  let changed = false;

  if (!today) return false;
  if (!AppData.habitsByDate || typeof AppData.habitsByDate !== 'object') {
    AppData.habitsByDate = {};
    changed = true;
  }

  (AppData.choosenHabits || []).forEach((habitId, index) => {
    const startDate = getHabitBackfillStartDate(index, today);
    if (!startDate || startDate > today) return;

    for (let currentDate = cloneDate(startDate); currentDate <= today; currentDate = addLocalDays(currentDate, 1)) {
      const dayKey = formatLocalDateKey(currentDate);
      if (!AppData.isHabitScheduledForDate(habitId, dayKey)) continue;
      if (!AppData.habitsByDate[dayKey] || typeof AppData.habitsByDate[dayKey] !== 'object') {
        AppData.habitsByDate[dayKey] = {};
        changed = true;
      }

      if (!Object.prototype.hasOwnProperty.call(AppData.habitsByDate[dayKey], habitId)) {
        const defaultStatus = getDefaultHabitStatusForDay(habitId, index, dayKey, todayKey);
        if (defaultStatus !== null) {
          AppData.habitsByDate[dayKey][habitId] = defaultStatus;
          changed = true;
        }
      }
    }
  });

  return changed;
}


export const logSectionVisit = async (sectionId) => {
  const today = formatLocalDateKey();
  if (!AppData.sectionVisits[sectionId]) {
    AppData.sectionVisits[sectionId] = [];
  }
  if (!AppData.sectionLastOpenedAt) {
    AppData.sectionLastOpenedAt = { ...DEFAULT_SECTION_LAST_OPENED_AT };
  }
  AppData.sectionLastOpenedAt[sectionId] = Date.now();
  if (!AppData.sectionVisits[sectionId].includes(today)) {
    AppData.sectionVisits[sectionId].push(today);
  }
  await saveData();
};

const normalizeDateKeyToLocalDate = (dateKey) => {
  const [year, month, day] = String(dateKey || '').split('-').map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const getSectionStreakInfo = (sectionId) => {
  const visitDates = new Set(AppData.sectionVisits[sectionId] || []);
  if (visitDates.size === 0) return { streak: 0, state: 'empty', lastVisitDate: null };

  const sortedDates = Array.from(visitDates).sort((a, b) => b.localeCompare(a));

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const latestDate = normalizeDateKeyToLocalDate(sortedDates[0]);

  if (!latestDate) return { streak: 0, state: 'empty', lastVisitDate: null };
  const latestDiffDays = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
  if (latestDiffDays > 1) return { streak: 0, state: 'expired', lastVisitDate: sortedDates[0] };

  for (let i = 0; i < sortedDates.length; i++) {
    const date = normalizeDateKeyToLocalDate(sortedDates[i]);
    if (!date) continue;

    const diffDays = Math.floor((today - date) / (1000 * 60 * 60 * 24));

    if (i === 0 && diffDays > 1) return { streak: 0, state: 'expired', lastVisitDate: sortedDates[0] };
    if (i > 0) {
      const prevDate = normalizeDateKeyToLocalDate(sortedDates[i - 1]);
      if (!prevDate) break;
      const gap = Math.floor((prevDate - date) / (1000 * 60 * 60 * 24));
      if (gap !== 1) break;
    }
    streak++;
  }

  return {
    streak,
    state: latestDiffDays === 1 ? 'atRisk' : 'fresh',
    lastVisitDate: sortedDates[0]
  };
};

export const getSectionStreak = (sectionId) => {
  return getSectionStreakInfo(sectionId).streak;
};

export class UserData {
   static id = null;
   static name = 'bro';
   static photo = null;
   static hasPremium = false;
   static premiumEndDate = new Date();
   static isValidation = false;
   static friends = [];

   static Init(id,name,photo){
      this.id = id;
      this.name = name;
      this.photo = photo;
   }
   static SetFriends(friendsArray) {
      this.friends = friendsArray || [];
   }
}

export class Data{
  constructor(){
    this.lastSave = AppData.lastSave || new Date().toISOString();
    this.isFirstStart = AppData.isFirstStart;
    this.prefs = AppData.prefs;
    this.choosenHabits = AppData.choosenHabits;
    this.choosenHabitsTypes = AppData.choosenHabitsTypes;
    this.habitsByDate = AppData.habitsByDate;
    this.choosenHabitsAutoComplete = AppData.choosenHabitsAutoComplete;
    this.choosenHabitsSchedule = AppData.choosenHabitsSchedule;
    this.habitEventTimes = AppData.habitEventTimes;
    this.choosenHabitsAchievements = AppData.choosenHabitsAchievements;
    this.choosenHabitsLastSkip = AppData.choosenHabitsLastSkip;
    this.choosenHabitsStartDates = AppData.choosenHabitsStartDates;
    this.choosenHabitsNotified = AppData.choosenHabitsNotified;
    this.choosenHabitsGoals = AppData.choosenHabitsGoals;
    this.CustomHabits = AppData.CustomHabits;
    this.habitCustomCategories = AppData.habitCustomCategories;
    this.habitCategoryOverrides = AppData.habitCategoryOverrides;
    this.deletedDefaultHabitCategories = AppData.deletedDefaultHabitCategories;
    this.habitAccentColor = AppData.habitAccentColor;
    this.habitAccentPresets = AppData.habitAccentPresets;
    this.choosenHabitsDaysToForm = AppData.choosenHabitsDaysToForm;
    this.notify = AppData.notify;
    this.sectionNotifications = AppData.sectionNotifications;
    this.exercises = AppData.exercises;
    this.programs = AppData.programs;
    this.trainingAccentColor = AppData.trainingAccentColor;
    this.trainingAccentPresets = AppData.trainingAccentPresets;
    this.trainingLog = AppData.trainingLog;
    this.pData = AppData.pData;
    this.profileOnboardingShown = AppData.profileOnboardingShown;
    this.profileNicknameMode = AppData.profileNicknameMode;
    this.profileCustomNickname = AppData.profileCustomNickname;
    this.profileAvatarPhoto = AppData.profileAvatarPhoto;
    this.profileDiscoverySource = AppData.profileDiscoverySource;
    this.profilePreferredSections = AppData.profilePreferredSections;
    this.measurements = AppData.measurements;
    this.ownPlates = AppData.ownPlates;
    this.platesAmount = AppData.platesAmount;
    this.barWeight = AppData.barWeight;
    this.lastBackupDate = AppData.lastBackupDate;
    this.recoveryProtocols = AppData.recoveryProtocols;
    this.breathingLog = AppData.breathingLog;
    this.meditationLog = AppData.meditationLog;
    this.hardeningLog = AppData.hardeningLog;
    this.meditationSoundSettings = AppData.meditationSoundSettings;
    this.recoveryAccentColor = AppData.recoveryAccentColor;
    this.recoveryAccentPresets = AppData.recoveryAccentPresets;
    this.mentalRecords = AppData.mentalRecords;
    this.mentalAccentColor = AppData.mentalAccentColor;
    this.mentalAccentPresets = AppData.mentalAccentPresets;
    this.sleepingLog = AppData.sleepingLog;
    this.sleepAccentColor = AppData.sleepAccentColor;
    this.sleepAccentPresets = AppData.sleepAccentPresets;
    this.sleepIntegrations = AppData.sleepIntegrations;
    this.mentalLog = AppData.mentalLog;
	    this.todoList = AppData.todoList;
	    this.todoAccentColor = AppData.todoAccentColor;
	    this.todoAccentPresets = AppData.todoAccentPresets;
	    this.todoCustomCategories = AppData.todoCustomCategories;
    this.sectionVisits = AppData.sectionVisits;
    this.sectionLastOpenedAt = AppData.sectionLastOpenedAt;
    this.profileFriendsExpanded = AppData.profileFriendsExpanded;
    this.premiumSnapshot = AppData.premiumSnapshot;
    this.todoFieldsVisibility = AppData.todoFieldsVisibility;
    this.menuCardsStates = AppData.menuCardsStates;
    this.infoMiniPanel = AppData.infoMiniPanel;
    this.mainHeroWidgets = AppData.mainHeroWidgets;
    this.insightCache = AppData.insightCache;
  }
}

export function getHabitCurrentStreak(habitId){
  const habitIndex = getHabitIndex(habitId);
  if (habitIndex === -1) return 0;

  const todayKey = formatLocalDateKey();
  const isNegative = AppData.choosenHabitsTypes?.[habitIndex] === true;
  const startDate = getHabitStartDate(habitIndex);
  const startKey = startDate ? formatLocalDateKey(startDate) : todayKey;
  const today = parseLocalDateKey(todayKey);
  if (!today) return 0;

  let streak = 0;
  for (let currentDate = cloneDate(today); formatLocalDateKey(currentDate) >= startKey; currentDate = addLocalDays(currentDate, -1)) {
    const key = formatLocalDateKey(currentDate);
    if (!AppData.isHabitScheduledForDate(habitId, key)) continue;

    const day = AppData.habitsByDate?.[key];
    if (!day || !Object.prototype.hasOwnProperty.call(day, habitId)) {
      if (isNegative) {
        streak += 1;
        continue;
      }
      break;
    }

    const status = day[habitId];
    if (key === todayKey && !isNegative && status === 0) continue;
    if (status > 0) {
      streak += 1;
      continue;
    }
    if (isNegative && status === 0) {
      streak += 1;
      continue;
    }
    break;
  }

  return streak;
}

export function getHabitPerformPercent(habitId){
  const habitIndex = getHabitIndex(habitId);
  if (habitIndex === -1) return 0;
  const target = Math.max(1, Number(AppData.choosenHabitsDaysToForm?.[habitIndex]) || 1);
  return Math.ceil(getHabitCurrentStreak(habitId) / target * 100);
}
