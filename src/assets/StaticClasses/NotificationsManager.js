import {AppData, UserData, hasCompletedProfileOrExistingData } from './AppData';
import { serializeData, deserializeData ,saveData} from './SaveHelper';
import { setDevMessage, setIsPasswordCorrect,setPremium ,setShowPopUpPanel,setValidation,setIsServerAvailable} from './HabitsBus';
import { applyLocalNoPremium, applyLocalTestPremium } from './PremiumTestHelper';
import pako from 'pako';
import { decryptCloudBackup, encryptCloudBackup, isEncryptedCloudBackup } from './CloudEncryption';
import { getCloudBackupKey, getCloudBackupKeyStorageStatus, getOrCreateCloudBackupKey } from './CloudBackupKey';
import { deleteTelegramCloudBackup, loadTelegramCloudBackup, saveTelegramCloudBackup } from './TelegramCloudBackup';

const BASE_URL = 'https://ultymylife.ru/api/notifications';
const API_TIMEOUT_MS = 7000;
const PREMIUM_TIMEOUT_MS = 4500;
const AUTO_BACKUP_DELAY_MS = 12000;
const RETRY_BACKUP_DELAY_MS = 2500;
const CLOUD_SYNC_COOLDOWN_MS = 60000;
const CLOUD_BACKUP_PENDING_KEY = 'uml_cloud_backup_pending_v1';

let autoBackupTimer = null;
let autoBackupInFlight = false;
let autoBackupQueued = false;
let lastCloudSyncCheckAt = 0;

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
  if (autoBackupInFlight) {
    autoBackupQueued = true;
    return;
  }

  autoBackupInFlight = true;
  try {
    await cloudBackup({ silent: true });
  } catch (error) {
    console.warn('Auto cloud backup failed:', error);
  } finally {
    autoBackupInFlight = false;
    if (autoBackupQueued) {
      autoBackupQueued = false;
      scheduleAutoCloudBackup();
    }
  }
}

export function retryPendingCloudBackup() {
  if (!hasPendingCloudBackup()) return;
  scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
}

export function syncCloudBackupIfNewer({ force = false } = {}) {
  if (typeof window === 'undefined') return;
  if (!UserData.id || UserData.id === 0) return;
  const now = Date.now();
  if (!force && now - lastCloudSyncCheckAt < CLOUD_SYNC_COOLDOWN_MS) return;
  lastCloudSyncCheckAt = now;
  cloudRestore({ silent: true, confirmOverwrite: false, preferNewer: true }).catch(error => {
    console.warn('Cloud sync check failed:', error);
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    retryPendingCloudBackup();
  });
  window.addEventListener('focus', () => {
    syncCloudBackupIfNewer();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') syncCloudBackupIfNewer();
  });
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
                throw new Error(`HTTP error! status: ${response.status}`);
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
      saveData({ skipCloudBackup: true }).catch(error => {
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



export async function cloudBackup({ silent = false, skipLocalSave = false } = {}) {
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
    const encryptedData = await encryptCloudBackup(dataString, backupKey);

    const telegramSave = await saveTelegramCloudBackup(encryptedData, snapshotTime);
    if (telegramSave.saved) {
      clearPendingCloudBackup();
      AppData.lastBackupDate = new Date().toISOString();
      if (!skipLocalSave) {
        await saveData({ skipCloudBackup: true });
      }
      if (!silent) {
        setShowPopUpPanel(AppData.prefs[0] === 0 ? '✅ Копия синхронизирована в Telegram' : '✅ Backup synced with Telegram', 2000, true);
      }
      return true;
    }

    if (telegramSave.conflict) {
      setPendingCloudBackup();
      syncCloudBackupIfNewer({ force: true });
      if (!silent) setShowPopUpPanel(AppData.prefs[0] === 0 ? '↩️ В Telegram уже есть более свежая копия' : '↩️ Telegram backup is newer', 2200, false);
      return false;
    }

    const response = await NotificationsManager.sendMessage('backup', encryptedData, {
      clientUpdatedAt: snapshotTime
    });
    
    if (response?.success) {
      clearPendingCloudBackup();
      AppData.lastBackupDate = new Date().toISOString();
      if (!skipLocalSave) {
        await saveData({ skipCloudBackup: true });
      }
      if (!silent) {
        const status = await getCloudBackupKeyStorageStatus();
        const message = status.hasTelegramCloudStorage
          ? (AppData.prefs[0] === 0 ? '✅ Автокопия сохранена и зашифрована' : '✅ Auto backup saved and encrypted')
          : (AppData.prefs[0] === 0 ? '✅ Копия зашифрована на этом устройстве' : '✅ Backup encrypted on this device');
        setShowPopUpPanel(message, 2000, true);
      }
      return true;
    } else {
      setPendingCloudBackup();
      if (response?.conflict) syncCloudBackupIfNewer({ force: true });
      if (!silent) setShowPopUpPanel('❌ ' + (response?.message || 'Backup failed'), 2000, false);
      return false;
    }
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

// 📥 Manual Restore from Server
export async function cloudRestore({ silent = false, confirmOverwrite = true, preferNewer = false } = {}) {
  if (confirmOverwrite) {
    const confirmed = confirm('⚠️ Overwrite current data?');
    if (!confirmed) return false;
  }

  try {
    const telegramBackup = await loadTelegramCloudBackup();
    const response = telegramBackup.success
      ? { success: true, message: telegramBackup.message }
      : await NotificationsManager.sendMessage('restore', '');
   // console.log("📥 Server Raw Response:", response);

    if (!response || !response.success || !response.message) {
      const errorMsg = response?.message || '⚠️ No backup found';
      if (!silent) setShowPopUpPanel(errorMsg, 2000, false);
      return false;
    }

    let rawData = response.message;
    let finalDataToLoad = null;

    // ---------------------------------------------------------
    // 📦 STEP 0: UNWRAP NESTED SERVER RESPONSE (The Fix)
    // ---------------------------------------------------------
    // The logs show rawData is: { success: true, message: "eJz..." }
    // We need to extract the inner .message
    if (typeof rawData === 'object' && rawData !== null) {
        if (rawData.success === true && rawData.message) {
          //  console.log("📦 Unwrapping nested server response...");
            rawData = rawData.message; // Now rawData is just the "eJz..." string
        }
    }

    // ---------------------------------------------------------
    // 🔍 STEP 1: DETECT FORMAT & UNWRAP (Standard Checks)
    // ---------------------------------------------------------
    
    // Case A: It's an Object (e.g., { content: "base64..." } OR Legacy { xp: 100... })
    if (typeof rawData === 'object' && rawData !== null) {
        if (rawData.content) {
            // It's the new standard wrapper -> Extract Base64 string
            rawData = rawData.content; 
        } else {
            // It's Legacy Data (Plain Object) -> No decompression needed
          // console.log("♻️ Detected Legacy Object Data");
            finalDataToLoad = JSON.stringify(rawData); 
        }
    }

    // Case B: It's a String (e.g., "base64..." OR '{"content":"..."}' OR Legacy JSON)
    if (typeof rawData === 'string') {
        // Clean up accidental double-quotes
        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            rawData = rawData.slice(1, -1);
        }

        // Check if it's a JSON string masking the real data
        if (rawData.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(rawData);
                if (parsed.content) {
                    rawData = parsed.content; // Extracted Base64 from JSON string
                } else if (parsed.success && parsed.message) {
                    // Handle double-nested JSON string case
                    rawData = parsed.message;
                } else {
                    // It's a Legacy JSON string
                  //  console.log("♻️ Detected Legacy JSON String");
                    finalDataToLoad = rawData;
                }
            } catch {
                // Not JSON, assume it's Base64
            }
        }
    }

    if (!finalDataToLoad && isEncryptedCloudBackup(rawData)) {
        const backupKey = await getCloudBackupKey();
        if (backupKey) {
          try {
            finalDataToLoad = await decryptCloudBackup(rawData, backupKey);
          } catch (error) {
            console.warn('Auto backup key decrypt failed. Old password backups are not restored automatically.', error);
          }
        }

        if (!finalDataToLoad) {
          if (!silent) {
            setShowPopUpPanel(
              AppData.prefs[0] === 0
                ? 'Старая копия требует обновления. Новые автокопии будут без пароля.'
                : 'Old backup needs an update. New auto backups do not use passwords.',
              2800,
              false
            );
          }
          return false;
        }
    }

    // ---------------------------------------------------------
    // 🔓 STEP 2: DECOMPRESS LEGACY BACKUPS OR LOAD
    // ---------------------------------------------------------

    if (!finalDataToLoad) {
        try {
            // Remove whitespace/newlines (Fixes InvalidCharacterError)
            const cleanBase64 = String(rawData).replace(/\s/g, '');

           // console.log("🔓 Decrypting Base64...");
            const binaryData = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
            finalDataToLoad = pako.inflate(binaryData, { to: 'string' });
        } catch (e) {
            console.warn("⚠️ Decompression failed. Trying raw data as fallback.", e);
            // Fallback
            finalDataToLoad = typeof rawData === 'object' ? JSON.stringify(rawData) : rawData;
        }
    }

    // ---------------------------------------------------------
    // 💾 STEP 3: APPLY DATA
    // ---------------------------------------------------------
    try {
        const restoredSnapshot = parseSnapshot(finalDataToLoad);
        if ((silent || preferNewer)
          && hasCompletedProfileOrExistingData(AppData)
          && !hasCompletedProfileOrExistingData(restoredSnapshot)) {
          scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
          return false;
        }

        if (preferNewer) {
          const remoteTime = getSnapshotTime(finalDataToLoad);
          const localTime = Date.parse(AppData.lastSave || '');
          const hasLocalTime = Number.isFinite(localTime) && localTime > 0;

          if (hasLocalTime && remoteTime > 0 && remoteTime <= localTime) {
            if (remoteTime < localTime) scheduleAutoCloudBackup(RETRY_BACKUP_DELAY_MS);
            return false;
          }
        }

        deserializeData(finalDataToLoad);
        await saveData({ skipCloudBackup: true });
        scheduleAutoCloudBackup();
        if (!silent) setShowPopUpPanel('✅ Data restored!', 2000, true);
        return true;
    } catch (err) {
        console.error("❌ Final Apply Failed:", err);
        throw new Error("Restored data is not valid JSON.");
    }

  } catch (error) {
    console.error('Restore Logic Error:', error);
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
      await saveData();

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
