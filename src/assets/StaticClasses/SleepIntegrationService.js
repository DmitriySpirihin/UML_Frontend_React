import { AppData, UserData } from './AppData';
import { saveData } from './SaveHelper';
import { addSleepSessionToLog } from './SleepLogHelper';

const API_BASE = 'https://ultymylife.ru';
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

export const SLEEP_INTEGRATION_PROVIDERS = [
  {
    key: 'appleHealth',
    name: 'Apple Health',
    label: ['Apple Health', 'Apple Health'],
    type: 'native',
    scope: 'Sleep Analysis',
    note: [
      'Требует нативный iOS bridge с HealthKit-разрешением.',
      'Requires a native iOS bridge with HealthKit permission.'
    ]
  },
  {
    key: 'whoop',
    name: 'WHOOP',
    label: ['WHOOP', 'WHOOP'],
    type: 'oauth',
    scope: 'read:sleep',
    note: [
      'OAuth и refresh token должны обрабатываться на backend.',
      'OAuth and refresh token must be handled by the backend.'
    ]
  },
  {
    key: 'oura',
    name: 'Oura',
    label: ['Oura', 'Oura'],
    type: 'oauth',
    scope: 'daily',
    note: [
      'Для автоимпорта нужен OAuth-доступ к Oura Cloud API.',
      'Automatic import needs OAuth access to Oura Cloud API.'
    ]
  }
];

export const getSleepIntegration = (provider) => ({
  connected: false,
  autoSync: false,
  lastSync: '',
  error: '',
  ...(AppData.sleepIntegrations?.[provider] || {})
});

export const setSleepIntegrationState = async (provider, patch) => {
  AppData.sleepIntegrations = {
    ...(AppData.sleepIntegrations || {}),
    [provider]: {
      ...getSleepIntegration(provider),
      ...patch
    }
  };
  await saveData();
};

export const toggleSleepIntegrationAutoSync = async (provider) => {
  const current = getSleepIntegration(provider);
  await setSleepIntegrationState(provider, { autoSync: !current.autoSync, error: '' });
};

export const startSleepIntegrationConnect = (provider) => {
  const providerMeta = SLEEP_INTEGRATION_PROVIDERS.find(item => item.key === provider);
  if (!providerMeta) throw new Error('Unknown provider');

  if (providerMeta.type === 'native') {
    if (window.UMLHealthKit?.requestAuthorization) {
      window.UMLHealthKit.requestAuthorization(['sleep']);
      return;
    }
    throw new Error('Apple Health доступен только через нативный iOS bridge.');
  }

  const url = `${API_BASE}/api/sleep-integrations/${provider}/connect?userId=${encodeURIComponent(UserData.id || 0)}`;
  if (window.Telegram?.WebApp?.openLink) window.Telegram.WebApp.openLink(url);
  else window.open(url, '_blank');
};

export const syncSleepIntegrationProvider = async (provider) => {
  try {
    const records = await fetchProviderRecords(provider);
    const imported = importSleepRecords(provider, records);
    await setSleepIntegrationState(provider, {
      connected: true,
      lastSync: new Date().toISOString(),
      error: ''
    });
    return { success: true, imported };
  } catch (error) {
    await setSleepIntegrationState(provider, { error: error.message || 'Sync failed' });
    return { success: false, imported: 0, error: error.message || 'Sync failed' };
  }
};

export const syncAutoSleepIntegrations = async () => {
  const providers = SLEEP_INTEGRATION_PROVIDERS
    .map(provider => provider.key)
    .filter(key => getSleepIntegration(key).connected && getSleepIntegration(key).autoSync);

  const results = [];
  for (const provider of providers) {
    results.push({ provider, ...(await syncSleepIntegrationProvider(provider)) });
  }
  return results;
};

const fetchProviderRecords = async (provider) => {
  if (provider === 'appleHealth') {
    if (window.UMLHealthKit?.getSleepSamples) {
      return await window.UMLHealthKit.getSleepSamples({ days: 30 });
    }
    throw new Error('Apple Health bridge не найден.');
  }

  const response = await fetch(`${API_BASE}/api/sleep-integrations/${provider}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId: UserData.id, days: 30 })
  });

  if (!response.ok) throw new Error(`Sync HTTP ${response.status}`);
  const data = await response.json();
  if (data.success === false) throw new Error(data.error || 'Sync failed');
  return data.records || data.sleeps || data.data || [];
};

export const importSleepRecords = (provider, records) => {
  const normalized = records
    .map(record => normalizeSleepRecord(provider, record))
    .filter(Boolean);

  normalized.forEach(({ dateKey, entry }) => addSleepSessionToLog(dateKey, entry));

  return normalized.length;
};

export const normalizeSleepRecord = (provider, record) => {
  const startIso = record.start || record.bedtime_start || record.bed_time || record.start_time;
  const endIso = record.end || record.bedtime_end || record.end_time;
  const dateKey = record.date || record.day || record.summary_date || getDateKey(startIso || endIso);
  if (!dateKey) return null;

  const duration = normalizeDurationMs(record);
  if (!duration) return null;

  return {
    dateKey,
    entry: {
      bedtime: normalizeBedtimeMs(record, startIso),
      duration,
      mood: normalizeMood(record),
      note: buildImportNote(provider, record),
      source: provider,
      externalId: record.id || record.sleep_id || record.uuid || ''
    }
  };
};

const normalizeDurationMs = (record) => {
  const stageSummary = record.score?.stage_summary;
  const whoopSleepMs = stageSummary
    ? (stageSummary.total_light_sleep_time_milli || 0) +
      (stageSummary.total_slow_wave_sleep_time_milli || 0) +
      (stageSummary.total_rem_sleep_time_milli || 0)
    : 0;

  const value = record.duration ||
    record.total_sleep_duration ||
    record.total_sleep_time ||
    record.sleep_duration ||
    record.minutes_asleep ||
    whoopSleepMs;

  if (!value) return 0;
  if (value > 1000000) return value;
  if (value > 1440) return value * 1000;
  return value * MS_PER_MINUTE;
};

const normalizeBedtimeMs = (record, startIso) => {
  if (typeof record.bedtime === 'number') return record.bedtime;
  if (!startIso) return 23 * MS_PER_HOUR;
  const date = new Date(startIso);
  if (Number.isNaN(date.getTime())) return 23 * MS_PER_HOUR;
  return (date.getHours() * 60 + date.getMinutes()) * MS_PER_MINUTE;
};

const normalizeMood = (record) => {
  const score = record.sleep_score ||
    record.score?.sleep_performance_percentage ||
    record.sleep_efficiency ||
    record.efficiency ||
    record.readiness_score;

  if (!score) return 4;
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 60) return 3;
  if (score >= 40) return 2;
  return 1;
};

const buildImportNote = (provider, record) => {
  const providerName = SLEEP_INTEGRATION_PROVIDERS.find(item => item.key === provider)?.name || provider;
  const score = record.sleep_score || record.score?.sleep_performance_percentage || record.sleep_efficiency || record.efficiency;
  return score ? `Imported from ${providerName}. Score: ${Math.round(score)}.` : `Imported from ${providerName}.`;
};

const getDateKey = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};
