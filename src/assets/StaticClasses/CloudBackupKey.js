import { UserData } from './AppData';

const CLOUD_BACKUP_KEY_STORAGE = 'uml_cloud_backup_auto_key_v1';
const TELEGRAM_CLOUD_BACKUP_KEY = 'umlCloudBackupKeyV1';

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function getTelegramCloudStorage() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.CloudStorage : null;
}

function getLocalStorageKey() {
  const userId = UserData.id || 'anonymous';
  return `${CLOUD_BACKUP_KEY_STORAGE}:${userId}`;
}

function readLocalKey() {
  try {
    return window.localStorage?.getItem(getLocalStorageKey()) || '';
  } catch {
    return '';
  }
}

function writeLocalKey(key) {
  try {
    window.localStorage?.setItem(getLocalStorageKey(), key);
  } catch {
    // Local storage can be blocked in some webviews. CloudStorage still may work.
  }
}

function readTelegramKey() {
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage?.getItem) return Promise.resolve('');

  return new Promise((resolve) => {
    try {
      cloudStorage.getItem(TELEGRAM_CLOUD_BACKUP_KEY, (error, value) => {
        resolve(error ? '' : (value || ''));
      });
    } catch {
      resolve('');
    }
  });
}

function writeTelegramKey(key) {
  const cloudStorage = getTelegramCloudStorage();
  if (!cloudStorage?.setItem) return Promise.resolve(false);

  return new Promise((resolve) => {
    try {
      cloudStorage.setItem(TELEGRAM_CLOUD_BACKUP_KEY, key, (error, success) => {
        resolve(!error && success !== false);
      });
    } catch {
      resolve(false);
    }
  });
}

function uniqueKeys(keys) {
  return keys.filter((key, index) => key && keys.indexOf(key) === index);
}

function createBackupKey() {
  if (!globalThis.crypto?.getRandomValues) {
    throw new Error('Secure browser crypto is unavailable');
  }

  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToBase64(bytes);
}

export async function getCloudBackupKeyCandidates() {
  if (typeof window === 'undefined') return [];

  const localKey = readLocalKey();
  const telegramKey = await readTelegramKey();
  if (telegramKey) {
    writeLocalKey(telegramKey);
  }

  return uniqueKeys([telegramKey, localKey]);
}

export async function rememberCloudBackupKey(key) {
  if (typeof window === 'undefined' || !key) return false;

  writeLocalKey(key);
  return writeTelegramKey(key);
}

export async function getCloudBackupKey() {
  const keys = await getCloudBackupKeyCandidates();
  return keys[0] || '';
}

export async function getOrCreateCloudBackupKey() {
  if (typeof window === 'undefined') return '';

  const existingKey = await getCloudBackupKey();
  if (existingKey) {
    await rememberCloudBackupKey(existingKey);
    return existingKey;
  }

  const newKey = createBackupKey();
  await rememberCloudBackupKey(newKey);
  return newKey;
}

export async function getCloudBackupKeyStorageStatus() {
  const hasLocalKey = !!readLocalKey();
  const hasTelegramCloudStorage = !!getTelegramCloudStorage()?.setItem;
  return { hasLocalKey, hasTelegramCloudStorage };
}
