import {AppData, UserData, hasCompletedProfileOrExistingData } from './AppData';
import { serializeData, deserializeData ,saveData} from './SaveHelper';
import { emitDataSynced, setDevMessage, setIsPasswordCorrect,setPremium ,setShowPopUpPanel,setValidation,setIsServerAvailable} from './HabitsBus';
import { applyLocalNoPremium, applyLocalTestPremium } from './PremiumTestHelper';
import pako from 'pako';
import { decryptCloudBackup, encryptCloudBackup, isEncryptedCloudBackup } from './CloudEncryption';
import {
  getCloudBackupKeyCandidates,
  getCloudBackupKeyStorageStatus,
  getOrCreateCloudBackupKey,
  rememberCloudBackupKey
} from './CloudBackupKey';
import { deleteTelegramCloudBackup, loadTelegramCloudBackup, saveTelegramCloudBackup } from './TelegramCloudBackup';
import { mergeAppSnapshots } from './DataMerge';

const BASE_URL = 'https://ultymylife.ru/api/notifications';
const API_TIMEOUT_MS = 7000;
const PREMIUM_TIMEOUT_MS = 4500;
const AUTO_BACKUP_DELAY_MS = 1500;
const RETRY_BACKUP_DELAY_MS = 1500;
const CLOUD_SYNC_COOLDOWN_MS = 5000;
const CLOUD_AUTO_SYNC_INTERVAL_MS = 30000;
const CLOUD_BACKUP_PENDING_KEY = 'uml_cloud_backup_pending_v1';
const CLOUD_DEVICE_ID_KEY = 'uml_cloud_device_id_v1';
const COMPRESSED_BACKUP_PREFIX = 'UMLZIP1.';

let autoBackupTimer = null;
let autoBackupQueued = false;
let lastCloudSyncCheckAt = 0;
let cloudSyncCheckInFlight = false;

function getPendingBackupStorageKey() {
  const userId = UserData.id || 'anonymous';
  return `${CLOUD_BACKUP_PENDING_KEY}:${userId}`;
}

function setPendingCloudBackup() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.setItem(getPendingBackupStorageKey(), Date.now().toString());
  } catch {
    // Pending retry is best-effort; local app data has already been saved.
  }
}

function clearPendingCloudBackup() {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage?.removeItem(getPendingBackupStorageKey());
  } catch {
    // Ignore storage cleanup failures.
  }
}

function hasPendingCloudBackup() {
  if (typeof window === 'undefined') return false;
  try {
    return !!window.localStorage?.getItem(getPendingBackupStorageKey());
  } catch {
    return false;
  }
}

function getCloudDeviceStorageKey() {
  const userId = UserData.id || 'anonymous';
  return `${CLOUD_DEVICE_ID_KEY}:${userId}`;
}

function createCloudDeviceId() {
  try {
    const bytes = new Uint8Array(12);
    globalThis.crypto?.getRandomValues?.(bytes);
    const random = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
    if (random && !/^0+$/.test(random)) return `web_${random}`;
  } catch {
    // Fall back below.
  }
  return `web_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function getCloudDeviceId() {
  if (typeof window === 'undefined') return 'server';
  const storageKey = getCloudDeviceStorageKey();
  try {
    const existing = window.localStorage?.getItem(storageKey);
    if (existing) return existing;
    const next = createCloudDeviceId();
    window.localStorage?.setItem(storageKey, next);
    return next;
  } catch {
    return createCloudDeviceId();
  }
}

async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function scheduleAutoCloudBackup(delayMs = AUTO_BACKUP_DELAY_MS) {
  if (typeof window === 'undefined') return;
  if (UserData.id === 0 || UserData.id === null || UserData.id === undefined) return;

  clearTimeout(autoBackupTimer);
  autoBackupTimer = window.setTimeout(() => {
    runQueuedAutoCloudBackup();
  }, delayMs);
}

async function runQueuedAutoCloudBackup() {
  try {
    await runCloudSync({ silent: true, force: true });
  } catch (error) {
    console.warn('Auto cloud sync failed:', error);
  }
}

export function retryPendingCloudBackup() {
  if (!hasPendingCloudBackup()) return;
  scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
}

export function syncCloudBackupIfNewer({ force = false } = {}) {
  runCloudSync({ silent: true, force }).catch(error => {
    console.warn('Cloud sync check failed:', error);
  });
}

export function syncCloudBackup({ silent = false, force = true } = {}) {
  return runCloudSync({ silent, force });
}

function canRunVisibleCloudSync() {
  if (typeof window === 'undefined') return false;
  if (!UserData.id || UserData.id === 0) return false;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  if (typeof document !== 'undefined' && document.visibilityState && document.visibilityState !== 'visible') return false;
  return true;
}

async function runCloudSync({ silent = true, force = false } = {}) {
  if (typeof window === 'undefined') return;
  if (!UserData.id || UserData.id === 0) return;
  if (cloudSyncCheckInFlight) {
    autoBackupQueued = true;
    return false;
  }
  const now = Date.now();
  if (!force && now - lastCloudSyncCheckAt < CLOUD_SYNC_COOLDOWN_MS) return;
  lastCloudSyncCheckAt = now;
  cloudSyncCheckInFlight = true;
  try {
    const restored = await cloudRestore({
      silent: true,
      confirmOverwrite: false,
      preferNewer: false,
      queueBackup: false
    });
    const backedUp = await cloudBackup({
      silent: true
    });

    if (!silent) {
      const synced = restored || backedUp;
      const message = synced
        ? (AppData.prefs[0] === 0 ? '✅ Данные синхронизированы' : '✅ Data synced')
        : (AppData.prefs[0] === 0 ? '❌ Не удалось синхронизировать' : '❌ Sync failed');
      setShowPopUpPanel(message, synced ? 1800 : 2400, synced);
    }

    return restored || backedUp;
  } finally {
    cloudSyncCheckInFlight = false;
    if (autoBackupQueued) {
      autoBackupQueued = false;
      scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
    }
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    retryPendingCloudBackup();
    scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
  });
  window.addEventListener('focus', () => {
    syncCloudBackupIfNewer();
  });
  window.addEventListener('pageshow', () => {
    syncCloudBackupIfNewer({ force: true });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncCloudBackupIfNewer();
  });
  window.setInterval(() => {
    if (canRunVisibleCloudSync()) syncCloudBackupIfNewer();
  }, CLOUD_AUTO_SYNC_INTERVAL_MS);
}

export class NotificationsManager {
    // Updated to use your SmartApe server
    

    static async sendMessage(type, message, metadata = {}) {
        try {
            const response = await fetchWithTimeout(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for sending cookies if you're using them
                body: JSON.stringify({
                    type: type,
                    message: message,
                    userId: UserData.id,
                    metadata
                })
            });

            if (!response.ok) {
                let detail = '';
                try {
                  const errorBody = await response.json();
                  detail = errorBody.message || errorBody.error || '';
                } catch {
                  try {
                    detail = await response.text();
                  } catch {
                    detail = '';
                  }
                }
                throw new Error(detail || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
          //  console.log('Success:', data);
            
            if (type === "password") {
                setIsPasswordCorrect(data.message);
            } else {
                setDevMessage(data.message);
            }
            
            return data;
        } catch (error) {
            console.error('Error:', error);
            setDevMessage(`Error: ${error.message}`);
            throw error;
        }
    }

    static async getMentalRecordsGlobal() {
    const response = await this.sendMessage('getmentalrecords', '');
    return response.message;
  }
}

export const sendPassword = (password) => {
    return NotificationsManager.sendMessage("password", password);
}

export const sendBugreport = (message) => {
    return NotificationsManager.sendMessage("bugreport", message);
}

const getCurrentPremiumSnapshot = (isServerAvailable = false) => ({
  hasPremium: UserData.hasPremium === true,
  premiumEndDate: UserData.premiumEndDate || null,
  isValidation: UserData.isValidation === true,
  isServerAvailable
});

const toPremiumDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function applyCachedPremiumSnapshot() {
  const snapshot = AppData.premiumSnapshot;
  if (!snapshot || typeof snapshot !== 'object') return false;

  const premiumEndDate = toPremiumDate(snapshot.premiumEndDate);
  const isActive = snapshot.hasPremium === true && (!premiumEndDate || premiumEndDate.getTime() > Date.now());
  const isValidation = snapshot.isValidation === true;

  UserData.hasPremium = isActive;
  UserData.premiumEndDate = premiumEndDate;
  UserData.isValidation = isValidation;

  setPremium(isActive);
  setValidation(isValidation);
  return isActive || isValidation;
}

function rememberPremiumSnapshot({ hasPremium, premiumEndDate, isValidation }) {
  AppData.premiumSnapshot = {
    hasPremium: hasPremium === true,
    premiumEndDate: premiumEndDate ? premiumEndDate.toISOString() : null,
    isValidation: isValidation === true,
    checkedAt: Date.now()
  };
}

export async function isUserHasPremium(uid) {
  if (applyLocalTestPremium()) {
    return {
      hasPremium: true,
      premiumEndDate: UserData.premiumEndDate,
      isValidation: false,
      isServerAvailable: false
    };
  }
  if (applyLocalNoPremium()) {
    return {
      hasPremium: false,
      premiumEndDate: null,
      isValidation: false,
      isServerAvailable: false
    };
  }

  try {
    const response = await fetchWithTimeout(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'premiumcheck',
        message: '',
        userId: uid,
        metadata: {}
      })
    }, PREMIUM_TIMEOUT_MS);

    if (!response.ok) {
      console.warn(`Premium check failed with HTTP ${response.status}`);
      setIsServerAvailable(false);
      return getCurrentPremiumSnapshot(false);
    }

    const data = await response.json();
    
    if (data.success) {
      const hasPremium = data.message.hasPremium === true || data.message.hasPremium === 'true';
      const premiumEndDate = data.message.premiumEndDate ? new Date(data.message.premiumEndDate) : null;
      const isValidation = data.message.isValidation || false;
      
      // The UI subject stores "technical works" state, so true means show the blocking overlay.
      const technicalWorks = data.message.isServerAvailable !== undefined
        ? data.message.isServerAvailable === false
        : false;

      // Update UserData/AppData
      UserData.hasPremium = hasPremium;
      UserData.premiumEndDate = premiumEndDate;
      UserData.isValidation = isValidation;
      rememberPremiumSnapshot({ hasPremium, premiumEndDate, isValidation });

      setPremium(hasPremium);
      setValidation(isValidation);
      setIsServerAvailable(technicalWorks);
      saveData({ skipCloudBackup: true, touchLastSave: false }).catch(error => {
        console.warn('Premium snapshot save failed:', error);
      });
      
     // console.log(`Premium: ${hasPremium}, Valid: ${isValidation}, Server OK: ${isServerAvailable}`);
      
      return { hasPremium, premiumEndDate, isValidation, isServerAvailable: technicalWorks };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
    setIsServerAvailable(false);
    return getCurrentPremiumSnapshot(false);
  }
}



export async function cloudBackup({ silent = false, skipLocalSave = false, resolveConflict = true } = {}) {
  try {
    const dataToSave = serializeData();
    if (!dataToSave) {
      if (!silent) setShowPopUpPanel('Nothing to back up', 2000, false);
      return false;
    }

    const dataString = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave);
    const localSnapshot = parseSnapshot(dataString);
    if (silent && !hasCompletedProfileOrExistingData(localSnapshot)) {
      return false;
    }
    const snapshotTime = getSnapshotTime(dataString) || Date.now();
    const backupKey = await getOrCreateCloudBackupKey();
    if (!backupKey) {
      if (!silent) {
        setShowPopUpPanel(AppData.prefs[0] === 0 ? '❌ Не удалось создать ключ шифрования' : '❌ Could not create encryption key', 2200, false);
      }
      setPendingCloudBackup();
      return false;
    }
    const encryptedData = await encryptCloudBackup(encodeCloudBackupPlainText(dataString), backupKey);

    let serverResponse = null;
    let serverFailureMessage = '';
    try {
      serverResponse = await NotificationsManager.sendMessage('backup', encryptedData, {
        clientUpdatedAt: snapshotTime,
        deviceId: getCloudDeviceId()
      });
    } catch (error) {
      serverFailureMessage = error.message || 'server unavailable';
      console.warn('Server cloud backup failed, Telegram backup will still be attempted:', error);
    }

    if (serverResponse?.conflict) {
      setPendingCloudBackup();
      if (resolveConflict) scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
      if (!silent) setShowPopUpPanel(AppData.prefs[0] === 0 ? '↩️ В облаке уже есть более свежая копия' : '↩️ Cloud backup is newer', 2200, false);
      return false;
    }

    const telegramSave = await saveTelegramCloudBackup(encryptedData, snapshotTime);
    if (telegramSave.conflict) {
      setPendingCloudBackup();
      if (resolveConflict) scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
      if (!silent) setShowPopUpPanel(AppData.prefs[0] === 0 ? '↩️ В Telegram уже есть более свежая копия' : '↩️ Telegram backup is newer', 2200, false);
      return false;
    }

    const serverSaved = serverResponse?.success === true;
    const telegramSaved = telegramSave.saved === true;

    if (serverSaved || telegramSaved) {
      if (serverSaved) clearPendingCloudBackup();
      else setPendingCloudBackup();
      AppData.lastBackupDate = new Date().toISOString();
      if (!skipLocalSave) {
        await saveData({ skipCloudBackup: true, touchLastSave: false });
      }
      if (!silent) {
        const status = await getCloudBackupKeyStorageStatus();
        let message = AppData.prefs[0] === 0 ? '✅ Копия сохранена и зашифрована' : '✅ Backup saved and encrypted';
        if (serverSaved && telegramSaved && status.hasTelegramCloudStorage) {
          message = AppData.prefs[0] === 0 ? '✅ Копия синхронизирована между устройствами' : '✅ Backup synced across devices';
        } else if (!serverSaved && telegramSaved) {
          message = AppData.prefs[0] === 0 ? '✅ Копия сохранена в Telegram, сервер повторит позже' : '✅ Backup saved in Telegram; server retry queued';
        } else if (serverSaved && !telegramSaved && status.hasTelegramCloudStorage) {
          message = AppData.prefs[0] === 0 ? '✅ Копия сохранена на сервере' : '✅ Backup saved on server';
        }
        setShowPopUpPanel(message, 2000, true);
      }
      return true;
    }

    setPendingCloudBackup();
    if (!silent) {
      const reason = getBackupFailureMessage(serverResponse, serverFailureMessage, telegramSave);
      setShowPopUpPanel('❌ ' + reason, 2600, false);
    }
    return false;
  } catch (error) {
    setPendingCloudBackup();
    console.error('Backup error:', error);
    if (!silent) setShowPopUpPanel('❌ ' + (error.message || 'Backup failed'), 2500, false);
    return false;
  }
}
function getSnapshotTime(dataString) {
  try {
    const parsed = JSON.parse(dataString);
    const time = Date.parse(parsed?.lastSave || '');
    return Number.isFinite(time) ? time : 0;
  } catch {
    return 0;
  }
}

function parseSnapshot(dataString) {
  try {
    return JSON.parse(dataString);
  } catch {
    return null;
  }
}

function stableStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return '';
  }
}

function getSnapshotTimeFromSnapshot(snapshot) {
  const time = Date.parse(snapshot?.lastSave || '');
  return Number.isFinite(time) ? time : 0;
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(String(base64).replace(/\s/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function encodeCloudBackupPlainText(dataString) {
  const compressed = pako.deflate(dataString, { level: 9 });
  return COMPRESSED_BACKUP_PREFIX + bytesToBase64(compressed);
}

function decodeCloudBackupPlainText(plainText) {
  if (typeof plainText !== 'string' || !plainText.startsWith(COMPRESSED_BACKUP_PREFIX)) {
    return plainText;
  }

  const compressedBase64 = plainText.slice(COMPRESSED_BACKUP_PREFIX.length);
  return pako.inflate(base64ToBytes(compressedBase64), { to: 'string' });
}

function getTelegramBackupFailureMessage(telegramSave) {
  if (telegramSave?.tooLarge) return AppData.prefs[0] === 0 ? 'Telegram-копия слишком большая' : 'Telegram backup is too large';
  if (telegramSave?.writeFailed) return AppData.prefs[0] === 0 ? 'Telegram CloudStorage не записал данные' : 'Telegram CloudStorage write failed';
  if (telegramSave?.unavailable) return AppData.prefs[0] === 0 ? 'Telegram CloudStorage недоступен' : 'Telegram CloudStorage unavailable';
  return '';
}

function getBackupFailureMessage(serverResponse, serverFailureMessage, telegramSave) {
  const serverMessage = serverResponse?.message || serverResponse?.error || serverFailureMessage;
  const telegramMessage = getTelegramBackupFailureMessage(telegramSave);

  if (serverMessage && telegramMessage) {
    return AppData.prefs[0] === 0
      ? `Сервер: ${serverMessage}. Telegram: ${telegramMessage}`
      : `Server: ${serverMessage}. Telegram: ${telegramMessage}`;
  }
  if (serverMessage) return serverMessage;
  if (telegramMessage) return telegramMessage;
  return AppData.prefs[0] === 0 ? 'Backup failed: нет ответа от сервера и Telegram' : 'Backup failed: no server or Telegram response';
}

function unwrapCloudBackupPayload(rawData) {
  let data = rawData;
  let finalDataToLoad = null;

  if (typeof data === 'object' && data !== null && data.success === true && data.message) {
    data = data.message;
  }

  if (typeof data === 'object' && data !== null) {
    if (data.content) {
      data = data.content;
    } else {
      finalDataToLoad = JSON.stringify(data);
    }
  }

  if (typeof data === 'string') {
    if (data.startsWith('"') && data.endsWith('"')) {
      data = data.slice(1, -1);
    }

    if (data.trim().startsWith('{')) {
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) {
          data = parsed.content;
        } else if (parsed.success && parsed.message) {
          data = parsed.message;
        } else {
          finalDataToLoad = data;
        }
      } catch {
        // Not JSON, keep as encoded payload.
      }
    }
  }

  return { rawData: data, finalDataToLoad };
}

async function decodeCloudBackupPayload(rawData) {
  let { rawData: data, finalDataToLoad } = unwrapCloudBackupPayload(rawData);

  if (!finalDataToLoad && isEncryptedCloudBackup(data)) {
    const backupKeys = await getCloudBackupKeyCandidates();
    for (const backupKey of backupKeys) {
      try {
        const decrypted = await decryptCloudBackup(data, backupKey);
        finalDataToLoad = decodeCloudBackupPlainText(decrypted);
        await rememberCloudBackupKey(backupKey);
        break;
      } catch (error) {
        console.warn('Auto backup key decrypt failed with one candidate:', error);
      }
    }

    if (!finalDataToLoad) return null;
  }

  if (!finalDataToLoad) {
    try {
      const cleanBase64 = String(data).replace(/\s/g, '');
      finalDataToLoad = pako.inflate(base64ToBytes(cleanBase64), { to: 'string' });
    } catch (error) {
      console.warn('Cloud backup decompression failed. Trying raw data as fallback.', error);
      finalDataToLoad = typeof data === 'object' ? JSON.stringify(data) : data;
    }
  }

  return finalDataToLoad;
}

async function applyCloudBackupSnapshot(restoredSnapshot, { silent = false, preferNewer = false, queueBackup = true } = {}) {
  if (!restoredSnapshot || typeof restoredSnapshot !== 'object') {
    throw new Error('Restored data is not valid JSON.');
  }
  if ((silent || preferNewer)
    && hasCompletedProfileOrExistingData(AppData)
    && !hasCompletedProfileOrExistingData(restoredSnapshot)) {
    if (queueBackup) scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
    return false;
  }

  const localSnapshot = parseSnapshot(serializeData()) || {};
  const merged = mergeAppSnapshots(localSnapshot, restoredSnapshot || {});
  const mergedDataString = stableStringify(merged.snapshot);

  if (preferNewer) {
    const remoteTime = merged.remoteTime || getSnapshotTimeFromSnapshot(restoredSnapshot);
    const localTime = merged.localTime || Date.parse(AppData.lastSave || '');
    const hasLocalTime = Number.isFinite(localTime) && localTime > 0;

    if (hasLocalTime && remoteTime > 0 && remoteTime <= localTime && !merged.changedLocal) {
      if (remoteTime < localTime && queueBackup) scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
      return false;
    }
  }

  deserializeData(mergedDataString);
  const repaired = AppData.needsDataRepairSave === true;
  await saveData({ skipCloudBackup: true, touchLastSave: repaired });
  AppData.needsDataRepairSave = false;
  emitDataSynced();
  if (queueBackup) {
    scheduleAutoCloudBackup(merged.changedLocal || repaired ? RETRY_BACKUP_DELAY_MS : AUTO_BACKUP_DELAY_MS);
  }
  if (!silent) setShowPopUpPanel('✅ Data restored!', 2000, true);
  return true;
}

async function getCloudRestoreSources() {
  const sources = [];
  const telegramBackup = await loadTelegramCloudBackup();
  if (telegramBackup.success) {
    sources.push({ name: 'telegram', message: telegramBackup.message });
  }

  try {
    const serverResponse = await NotificationsManager.sendMessage('restore', '');
    if (serverResponse?.success && Array.isArray(serverResponse.message)) {
      serverResponse.message.forEach((source, index) => {
        const message = source?.content || source?.message || source;
        if (message) {
          sources.push({
            name: `server:${source?.deviceId || index}`,
            message
          });
        }
      });
    } else if (serverResponse?.success && serverResponse.message) {
      sources.push({ name: 'server', message: serverResponse.message });
    }
  } catch (error) {
    console.warn('Server cloud restore failed:', error);
  }

  return sources;
}

async function getDecodedCloudSnapshots() {
  const sources = await getCloudRestoreSources();
  const decodedSnapshots = [];

  for (const source of sources) {
    try {
      const finalDataToLoad = await decodeCloudBackupPayload(source.message);
      if (!finalDataToLoad) {
        console.warn(`Cloud restore source ${source.name} could not be decrypted.`);
        continue;
      }
      const snapshot = parseSnapshot(finalDataToLoad);
      if (!snapshot || typeof snapshot !== 'object') {
        console.warn(`Cloud restore source ${source.name} is not valid JSON.`);
        continue;
      }
      decodedSnapshots.push({
        name: source.name,
        snapshot,
        time: getSnapshotTimeFromSnapshot(snapshot)
      });
    } catch (error) {
      console.warn(`Cloud restore source ${source.name} failed:`, error);
    }
  }

  return decodedSnapshots;
}

function combineCloudSnapshots(decodedSnapshots) {
  const ordered = [...decodedSnapshots].sort((a, b) => a.time - b.time);
  let combined = ordered[0]?.snapshot || null;

  for (let index = 1; index < ordered.length; index += 1) {
    combined = mergeAppSnapshots(combined, ordered[index].snapshot, {
      touchLastSaveOnChange: false
    }).snapshot;
  }

  return combined;
}

// 📥 Manual Restore from Server
export async function cloudRestore({ silent = false, confirmOverwrite = true, preferNewer = false, queueBackup = true } = {}) {
  if (confirmOverwrite) {
    const confirmed = confirm('⚠️ Overwrite current data?');
    if (!confirmed) return false;
  }

  try {
    const decodedSnapshots = await getDecodedCloudSnapshots();
    if (decodedSnapshots.length === 0) {
      if (queueBackup && (silent || preferNewer) && hasCompletedProfileOrExistingData(AppData)) {
        scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
      }
      if (!silent) setShowPopUpPanel('⚠️ No backup found', 2000, false);
      return false;
    }

    const combinedSnapshot = combineCloudSnapshots(decodedSnapshots);
    const applied = await applyCloudBackupSnapshot(combinedSnapshot, { silent, preferNewer, queueBackup });
    if (applied) return true;

    if (queueBackup && (silent || preferNewer) && hasCompletedProfileOrExistingData(AppData)) {
      scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
    }
    if (!silent) {
      setShowPopUpPanel(
        AppData.prefs[0] === 0
          ? '❌ Не удалось восстановить копию'
          : '❌ Restore failed',
        2200,
        false
      );
    }
    return false;
  } catch (error) {
    console.error('Restore Logic Error:', error);
    if (queueBackup && (silent || preferNewer) && hasCompletedProfileOrExistingData(AppData)) {
      scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
    }
    if (!silent) setShowPopUpPanel('❌ Restore failed', 2000, false);
    return false;
  }
}

export async function deleteCloudBackup() {
   const confirmed = confirm(AppData.prefs[0] === 0 ? '⚠️ Удалить все сохраненные данные из онлайн-хранилища?' : '⚠️ Delete your cloud backup permanently? This cannot be undone.');
  if (!confirmed) return;

  try {
    const telegramDeleted = await deleteTelegramCloudBackup();
    let response = null;
    try {
      response = await NotificationsManager.sendMessage('deleteBackup', '');
    } catch (error) {
      if (!telegramDeleted) throw error;
    }

    if (response?.success || telegramDeleted) {
      // ✅ Clear local lastBackupDate
      AppData.lastBackupDate = '';
      await saveData({ skipCloudBackup: true, touchLastSave: false });

      // Optional: also save this state locally (IndexedDB)
      // await saveData();

      setShowPopUpPanel(response.message || 'Backup deleted', 2000, true);
    } else {
      setShowPopUpPanel('❌ ' + (response?.message || 'Delete failed'), 2000, false);
    }
  } catch (error) {
    console.error('Delete backup error:', error);
    setShowPopUpPanel('❌ Delete failed: ' + (error.message || 'unknown error'), 2000, false);
  }
}

export async function sendXp(xp, level) {
        try {
            const response = await NotificationsManager.sendMessage('update_xp', JSON.stringify({ xp, level }));
            return response;
        } catch (error) {
            console.error('Failed to sync XP:', error);
            throw error;
        }
}

export async function getFriendsList() {
    // Safety check: don't fetch if the user is a guest
    if (!UserData.id || UserData.id === 0) return [];

    try {
        const FRIENDS_URL = `https://ultymylife.ru/api/my-friends/${UserData.id}`;
        
        const response = await fetchWithTimeout(FRIENDS_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        }, PREMIUM_TIMEOUT_MS);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        
        if (data.success) {
            // ✅ Save the data to your static class for global access
            UserData.SetFriends(data.friends); 
            return data.friends; 
        } else {
            throw new Error(data.error || 'Failed to fetch friends');
        }
    } catch (error) {
        console.error('Error fetching friends list:', error);
        return []; 
    }
}
