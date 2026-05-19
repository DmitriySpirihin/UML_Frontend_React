import { AppData } from './AppData';

const DAY_TYPE = 'day';
const NIGHT_TYPE = 'night';

export const normalizeSleepType = (type) => (type === DAY_TYPE ? DAY_TYPE : NIGHT_TYPE);

export const normalizeSleepSession = (entry = {}) => ({
  bedtime: typeof entry.bedtime === 'number' ? entry.bedtime : 0,
  duration: Number(entry.duration) || 0,
  mood: Number(entry.mood) || 0,
  note: entry.note ?? '',
  type: normalizeSleepType(entry.type),
  source: entry.source || '',
  externalId: entry.externalId || ''
});

export const getSleepSessions = (entry) => {
  if (!entry) return [];
  const sessions = Array.isArray(entry.sessions) ? entry.sessions : [entry];
  return sessions
    .map(normalizeSleepSession)
    .filter(session => session.duration > 0)
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === NIGHT_TYPE ? -1 : 1;
      return (a.bedtime || 0) - (b.bedtime || 0);
    });
};

export const buildSleepDayEntry = (entry) => {
  const sessions = getSleepSessions(entry);
  if (!sessions.length) return null;

  const duration = sessions.reduce((sum, session) => sum + session.duration, 0);
  const moodSessions = sessions.filter(session => session.mood > 0);
  const mood = moodSessions.length
    ? Math.round(moodSessions.reduce((sum, session) => sum + session.mood, 0) / moodSessions.length)
    : 0;
  const nightSession = sessions.find(session => session.type === NIGHT_TYPE);

  return {
    ...sessions[0],
    sessions,
    duration,
    mood,
    bedtime: nightSession?.bedtime ?? sessions[0].bedtime,
    type: sessions.length > 1 ? 'mixed' : sessions[0].type,
    note: sessions.map(session => session.note).filter(Boolean).join('\n')
  };
};

export const getSleepDayEntry = (dateKey, sleepingLog = AppData.sleepingLog) => (
  buildSleepDayEntry(sleepingLog?.[dateKey])
);

export const listSleepDayEntries = (sleepingLog = AppData.sleepingLog) => (
  Object.entries(sleepingLog || {})
    .map(([key, entry]) => {
      const dayEntry = buildSleepDayEntry(entry);
      return dayEntry ? { key, ...dayEntry } : null;
    })
    .filter(Boolean)
);

export const addSleepSessionToLog = (dateString, session) => {
  const normalized = normalizeSleepSession(session);
  const current = buildSleepDayEntry(AppData.sleepingLog?.[dateString]);
  const previousSessions = current?.sessions || [];
  const withoutSameSlot = previousSessions.filter(item => {
    if (normalized.externalId && item.externalId) return item.externalId !== normalized.externalId;
    if (normalized.source && item.source) return item.source !== normalized.source || item.type !== normalized.type;
    return item.type !== normalized.type;
  });
  const nextEntry = buildSleepDayEntry({ sessions: [...withoutSameSlot, normalized] });

  AppData.sleepingLog = {
    ...(AppData.sleepingLog || {}),
    [dateString]: nextEntry
  };

  return nextEntry;
};
