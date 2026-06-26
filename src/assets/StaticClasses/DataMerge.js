const RECORD_FIELDS = [
  'trainingLog',
  'breathingLog',
  'meditationLog',
  'hardeningLog',
  'mentalLog',
  'habitsByDate',
  'habitEventTimes',
  'choosenHabitsGoals',
  'choosenHabitsAchievements',
  'choosenHabitsLastSkip',
  'choosenHabitsAutoComplete',
  'choosenHabitsSchedule',
  'choosenHabitsNotified',
  'sectionLastOpenedAt'
];

const ARRAY_UNION_FIELDS = [
  'todoList',
  'CustomHabits',
  'habitCustomCategories',
  'todoCustomCategories',
  'deletedDefaultHabitCategories'
];

const isPlainObject = (value) => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isDateKey = (key) => /^\d{4}-\d{2}-\d{2}$/.test(String(key || ''));
const mergeRecordValue = (preferred, secondary) => {
  if (isPlainObject(secondary) && isPlainObject(preferred)) return { ...secondary, ...preferred };
  if (Array.isArray(secondary) && Array.isArray(preferred) && secondary.length > 0 && preferred.length === 0) return secondary;
  return preferred;
};

function stableStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function parseTime(value) {
  const time = Date.parse(value || '');
  return Number.isFinite(time) ? time : 0;
}

function mergeRecords(localValue = {}, remoteValue = {}, preferRemote = true) {
  if (!isPlainObject(localValue)) return isPlainObject(remoteValue) ? remoteValue : {};
  if (!isPlainObject(remoteValue)) return localValue;

  const preferred = preferRemote ? remoteValue : localValue;
  const secondary = preferRemote ? localValue : remoteValue;
  const merged = { ...secondary, ...preferred };

  Object.keys(secondary).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(preferred, key)) merged[key] = mergeRecordValue(preferred[key], secondary[key]);
  });

  return merged;
}

function mergeDateArrays(localValue = [], remoteValue = []) {
  const dates = new Set();
  [...(Array.isArray(localValue) ? localValue : []), ...(Array.isArray(remoteValue) ? remoteValue : [])]
    .filter(isDateKey)
    .forEach((date) => dates.add(date));
  return [...dates].sort();
}

function mergeSectionVisits(localValue = {}, remoteValue = {}) {
  if (!isPlainObject(localValue)) return isPlainObject(remoteValue) ? remoteValue : {};
  if (!isPlainObject(remoteValue)) return localValue;

  const keys = new Set([...Object.keys(localValue), ...Object.keys(remoteValue)]);
  const merged = {};
  keys.forEach((key) => {
    merged[key] = mergeDateArrays(localValue[key], remoteValue[key]);
  });
  return merged;
}

function itemKey(item) {
  if (item === null || item === undefined) return '';
  if (typeof item !== 'object') return String(item);
  return String(
    item.id ??
    item.uid ??
    item.key ??
    item.createdAt ??
    item.date ??
    item.title ??
    stableStringify(item)
  );
}

function mergeArrayUnion(localValue = [], remoteValue = [], preferRemote = true) {
  const first = preferRemote ? localValue : remoteValue;
  const second = preferRemote ? remoteValue : localValue;
  const map = new Map();

  [...(Array.isArray(first) ? first : []), ...(Array.isArray(second) ? second : [])].forEach((item) => {
    const key = itemKey(item);
    if (!key) return;
    map.set(key, item);
  });

  return [...map.values()];
}

function normalizeSleepSession(session = {}) {
  return {
    bedtime: typeof session.bedtime === 'number' ? session.bedtime : 0,
    duration: Number(session.duration) || 0,
    mood: Number(session.mood) || 0,
    note: session.note ?? '',
    type: session.type === 'day' ? 'day' : 'night',
    source: session.source || '',
    externalId: session.externalId || ''
  };
}

function sleepSessions(entry) {
  if (!entry) return [];
  const rawSessions = Array.isArray(entry.sessions) ? entry.sessions : [entry];
  return rawSessions
    .map(normalizeSleepSession)
    .filter((session) => session.duration > 0);
}

function sleepSessionKey(session) {
  if (session.externalId) return `external:${session.source || 'unknown'}:${session.externalId}`;
  if (session.source) return `source:${session.source}:${session.type}`;
  return `${session.type}:${session.bedtime || 0}`;
}

function buildSleepEntry(sessions) {
  const normalized = sessions
    .map(normalizeSleepSession)
    .filter((session) => session.duration > 0)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'night' ? -1 : 1;
      return (a.bedtime || 0) - (b.bedtime || 0);
    });

  if (!normalized.length) return null;

  const duration = normalized.reduce((sum, session) => sum + session.duration, 0);
  const moodSessions = normalized.filter((session) => session.mood > 0);
  const mood = moodSessions.length
    ? Math.round(moodSessions.reduce((sum, session) => sum + session.mood, 0) / moodSessions.length)
    : 0;
  const nightSession = normalized.find((session) => session.type === 'night');

  return {
    ...normalized[0],
    sessions: normalized,
    duration,
    mood,
    bedtime: nightSession?.bedtime ?? normalized[0].bedtime,
    type: normalized.length > 1 ? 'mixed' : normalized[0].type,
    note: normalized.map((session) => session.note).filter(Boolean).join('\n')
  };
}

function mergeSleepEntry(localEntry, remoteEntry, preferRemote = true) {
  const first = preferRemote ? sleepSessions(localEntry) : sleepSessions(remoteEntry);
  const second = preferRemote ? sleepSessions(remoteEntry) : sleepSessions(localEntry);
  const map = new Map();

  [...first, ...second].forEach((session) => {
    map.set(sleepSessionKey(session), session);
  });

  return buildSleepEntry([...map.values()]);
}

function mergeSleepLogs(localLog = {}, remoteLog = {}, preferRemote = true) {
  if (!isPlainObject(localLog)) return isPlainObject(remoteLog) ? remoteLog : {};
  if (!isPlainObject(remoteLog)) return localLog;

  const keys = new Set([...Object.keys(localLog), ...Object.keys(remoteLog)]);
  const merged = {};

  keys.forEach((key) => {
    const localEntry = localLog[key];
    const remoteEntry = remoteLog[key];
    if (localEntry && remoteEntry) {
      const entry = mergeSleepEntry(localEntry, remoteEntry, preferRemote);
      if (entry) merged[key] = entry;
      return;
    }
    merged[key] = remoteEntry || localEntry;
  });

  return merged;
}

function mergeMeasurements(localValue = [], remoteValue = [], preferRemote = true) {
  const local = Array.isArray(localValue) ? localValue : [];
  const remote = Array.isArray(remoteValue) ? remoteValue : [];
  const length = Math.max(local.length, remote.length);

  return Array.from({ length }, (_, index) => (
    mergeArrayUnion(local[index] || [], remote[index] || [], preferRemote)
  ));
}

function habitMetadataScore(snapshot = {}) {
  const habits = Array.isArray(snapshot.choosenHabits) ? snapshot.choosenHabits.length : 0;
  const starts = Array.isArray(snapshot.choosenHabitsStartDates) ? snapshot.choosenHabitsStartDates.filter(Boolean).length : 0;
  const types = Array.isArray(snapshot.choosenHabitsTypes) ? snapshot.choosenHabitsTypes.length : 0;
  const daysToForm = Array.isArray(snapshot.choosenHabitsDaysToForm) ? snapshot.choosenHabitsDaysToForm.length : 0;
  return habits > 0 ? habits + Math.min(habits, starts, types, daysToForm) : 0;
}

const habitIdKey = (habitId) => {
  const numeric = Number(habitId);
  return Number.isFinite(numeric) ? String(numeric) : String(habitId);
};

function getHabitMetadata(snapshot = {}, habitId) {
  const key = habitIdKey(habitId);
  const habits = Array.isArray(snapshot.choosenHabits) ? snapshot.choosenHabits : [];
  const index = habits.findIndex((id) => habitIdKey(id) === key);
  return {
    id: index >= 0 ? habits[index] : habitId,
    startDate: index >= 0 ? snapshot.choosenHabitsStartDates?.[index] : undefined,
    type: index >= 0 ? snapshot.choosenHabitsTypes?.[index] : undefined,
    daysToForm: index >= 0 ? snapshot.choosenHabitsDaysToForm?.[index] : undefined
  };
}

function mergeHabitMetadata(merged, local, remote, preferRemote) {
  const preferred = preferRemote ? remote : local;
  const secondary = preferRemote ? local : remote;
  const ids = [];
  const seen = new Set();

  [preferred, secondary].forEach((snapshot) => {
    (Array.isArray(snapshot.choosenHabits) ? snapshot.choosenHabits : []).forEach((id) => {
      const key = habitIdKey(id);
      if (seen.has(key)) return;
      seen.add(key);
      ids.push(id);
    });
  });

  if (!ids.length) return merged;

  const preferredScore = habitMetadataScore(preferred);
  const secondaryScore = habitMetadataScore(secondary);
  const preferCompleteSecondary = secondaryScore > preferredScore;
  const primaryMetaSource = preferCompleteSecondary ? secondary : preferred;
  const fallbackMetaSource = preferCompleteSecondary ? preferred : secondary;
  const metadata = ids.map((id) => {
    const primary = getHabitMetadata(primaryMetaSource, id);
    const fallback = getHabitMetadata(fallbackMetaSource, id);
    return {
      id: primary.id ?? fallback.id ?? id,
      startDate: primary.startDate || fallback.startDate || '',
      type: typeof primary.type === 'boolean' ? primary.type : fallback.type === true,
      daysToForm: Number(primary.daysToForm) > 0 ? primary.daysToForm : (Number(fallback.daysToForm) > 0 ? fallback.daysToForm : 66)
    };
  });

  return {
    ...merged,
    choosenHabits: metadata.map((item) => item.id),
    choosenHabitsStartDates: metadata.map((item) => item.startDate),
    choosenHabitsTypes: metadata.map((item) => item.type),
    choosenHabitsDaysToForm: metadata.map((item) => item.daysToForm)
  };
}

export function mergeAppSnapshots(localSnapshot = {}, remoteSnapshot = {}, { touchLastSaveOnChange = true } = {}) {
  const local = isPlainObject(localSnapshot) ? localSnapshot : {};
  const remote = isPlainObject(remoteSnapshot) ? remoteSnapshot : {};
  const localTime = parseTime(local.lastSave);
  const remoteTime = parseTime(remote.lastSave);
  const preferRemote = remoteTime >= localTime;
  const merged = preferRemote ? { ...local, ...remote } : { ...remote, ...local };

  merged.sleepingLog = mergeSleepLogs(local.sleepingLog, remote.sleepingLog, preferRemote);
  merged.measurements = mergeMeasurements(local.measurements, remote.measurements, preferRemote);

  RECORD_FIELDS.forEach((field) => {
    merged[field] = mergeRecords(local[field], remote[field], preferRemote);
  });
  merged.sectionVisits = mergeSectionVisits(local.sectionVisits, remote.sectionVisits);

  ARRAY_UNION_FIELDS.forEach((field) => {
    merged[field] = mergeArrayUnion(local[field], remote[field], preferRemote);
  });
  const finalMerged = mergeHabitMetadata(merged, local, remote, preferRemote);

  const localString = stableStringify(local);
  const mergedString = stableStringify(finalMerged);
  const changedLocal = !!mergedString && mergedString !== localString;

  if (changedLocal && touchLastSaveOnChange) {
    finalMerged.lastSave = new Date().toISOString();
  }

  return {
    snapshot: finalMerged,
    changedLocal,
    preferRemote,
    localTime,
    remoteTime
  };
}
