import { AppData, Data } from '../StaticClasses/AppData';
import { openDB } from 'idb';
import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { NotificationsManager, scheduleAutoCloudBackup } from '../StaticClasses/NotificationsManager';
import {setShowPopUpPanel,setAddPanel} from '../StaticClasses/HabitsBus';

export async function initializeTelegramSDK() {
  try {
    const rawWebApp = window.Telegram?.WebApp;
    const platform = rawWebApp?.platform || 'unknown';
    const isMobile = platform === 'android' || platform === 'ios';
    setAppMediaMetadata();

    if (rawWebApp) {
      rawWebApp.ready?.();
      if (isMobile) {
        rawWebApp.expand?.();
        rawWebApp.requestFullscreen?.();
      }

      if (rawWebApp.SettingsButton) {
        rawWebApp.SettingsButton.show();
        rawWebApp.SettingsButton.onClick(() => {
          setAddPanel('settings');
        });
      }

      if (rawWebApp.SecondaryButton) rawWebApp.SecondaryButton.hide();
      rawWebApp.enableClosingConfirmation?.();
    }

    return true;
  } catch (error) {
    console.error('SDK Init Error:', error);
    return true;
  }
}

function setAppMediaMetadata() {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !window.MediaMetadata) return;

  try {
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const normalizedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `${window.location.origin}${baseUrl}`;
    const artworkUrl = new URL('images/Ui/app-logo.png', normalizedBaseUrl).href;
    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: 'UltyMyLife',
      artist: 'All your life - one place',
      album: 'UltyMyLife',
      artwork: [
        { src: artworkUrl, sizes: '640x640', type: 'image/png' }
      ]
    });
  } catch (error) {
    console.warn('Media metadata setup failed:', error);
  }
}

export function getTelegramContext() {
  const wa = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const initDataUnsafe = wa?.initDataUnsafe || {};
  const user = initDataUnsafe.user ?? null;
  const languageCode = (initDataUnsafe.user?.language_code ?? wa?.languageCode) ?? 'ru';
  const colorScheme = wa?.colorScheme ?? 'dark';
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const start_param = initDataUnsafe.start_param
    || initDataUnsafe.startParam
    || urlParams?.get('tgWebAppStartParam')
    || urlParams?.get('startapp')
    || urlParams?.get('start_param')
    || '';
  return { user, languageCode, colorScheme, start_param };
}

let db = null;
const PRE_REPAIR_BACKUP_KEY = 'uml_pre_repair_backup_v1';
const PRE_REPAIR_BACKUP_AT_KEY = 'uml_pre_repair_backup_at_v1';
const BEFORE_REPAIR_UNDO_KEY = 'uml_before_pre_repair_restore_v1';
const AUTO_RESCUE_BACKUP_KEY = 'uml_before_auto_rescue_v1';
const AUTO_RESCUE_BACKUP_AT_KEY = 'uml_before_auto_rescue_at_v1';
const AUTO_RESCUE_MARKER_KEY = 'uml_repair_undo_auto_restored_v1';
const REPAIR_ROLLBACK_STORAGE_KEYS = [
  PRE_REPAIR_BACKUP_KEY,
  PRE_REPAIR_BACKUP_AT_KEY,
  BEFORE_REPAIR_UNDO_KEY,
  AUTO_RESCUE_BACKUP_KEY,
  AUTO_RESCUE_BACKUP_AT_KEY,
  AUTO_RESCUE_MARKER_KEY
];

function rememberPreRepairBackup() {
  clearRepairRollbackSnapshots();
}

function clearRepairRollbackSnapshots() {
  if (typeof window === 'undefined') return;
  try {
    REPAIR_ROLLBACK_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // LocalStorage cleanup is best-effort.
  }
}

async function maybeRestoreRepairUndoSnapshot(localData) {
  clearRepairRollbackSnapshots();
  return { data: localData, restored: false };
}

export function isNewUserPreviewMode() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return ['newUser', 'freshUser', 'onboarding'].some((key) => params.get(key) === '1');
}

export async function initDBandCloud() {
  const dbName = 'UML_Data';
  try {
    clearRepairRollbackSnapshots();
    db = await openDB(dbName, 2, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('UserData')) {
          db.createObjectStore('UserData');
        }
        if (!db.objectStoreNames.contains('Icons')) {
          db.createObjectStore('Icons', { keyPath: 'id' });
        }
      }
    });
  //  console.log('DB initialized');
  } catch (error) {
    console.error('DB initialization failed:', error);
  }
}

/**
 * Saves application data to local IndexedDB only
 */
export async function saveData({ skipCloudBackup = false, touchLastSave = true } = {}) {
  if (isNewUserPreviewMode()) {
    return { success: true, preview: true };
  }

  if (touchLastSave) {
    AppData.lastSave = new Date().toISOString();
  }

  const dataToSave = serializeData();
  if (!dataToSave) {
    console.error('No data to save');
    return { success: false, error: 'No data to save' };
  }

  if (!db) {
    return { success: false, error: 'Database not initialized' };
  }

  try {
    await db.put('UserData', dataToSave, 'current');
    if (!skipCloudBackup) {
      queueAutoCloudBackup();
    }
   // console.log('Data saved to DB');
    return { success: true };
  } catch (e) {
    console.error('Saving to DB failed:', e);
    return { success: false, error: e.message || 'Failed to save to local database' };
  }
}

function queueAutoCloudBackup() {
  if (typeof window === 'undefined') return;
  scheduleAutoCloudBackup();
}

/**
 * Loads application data from local IndexedDB only
 */
export async function loadData() {
  if (!db) {
    return { success: false, error: 'Database not initialized' };
  }

  try {
    let localData = await db.get('UserData', 'current');
    if (!localData) {
    //  console.log('No data in local DB');
      return { success: false, error: 'No saved data found' };
    }

    const rescueResult = await maybeRestoreRepairUndoSnapshot(localData);
    localData = rescueResult.data;
    deserializeData(localData);
    if (rescueResult.restored) {
      AppData.lastSave = new Date().toISOString();
      AppData.needsDataRepairSave = false;
      await saveData({ skipCloudBackup: false, touchLastSave: false });
      return { success: true, data: JSON.parse(localData), source: 'local', repairedRollback: true };
    }
    if (AppData.needsDataRepairSave) {
      rememberPreRepairBackup(localData);
      await saveData({ skipCloudBackup: true, touchLastSave: true });
      AppData.needsDataRepairSave = false;
    }
    return { success: true, data: JSON.parse(localData), source: 'local' };
  } catch (e) {
    console.error('Loading from DB failed:', e);
    return { success: false, error: e.message || 'Failed to load from local database' };
  }
}

export function serializeData() {
  try {
    const newData = new Data();
    const plainData = instanceToPlain(newData);
    return JSON.stringify(plainData);
  } catch (error) {
    console.error('Serialization failed:', error);
    return null;
  }
}

export function deserializeData(data) {
  try {
    const parsedData = JSON.parse(data);
    const restoredData = plainToClass(Data, parsedData);
    AppData.init(restoredData);
  } catch (error) {
    console.error('Deserialization failed:', error);
    throw error;
  }
}

export async function clearAllSaves() {
    const isRu = AppData.prefs[0] === 0;
    const confirmed = confirm(isRu ? '⚠️ Удалить все сохраненные данные?' : '⚠️ Delete your saves permanently? This cannot be undone.');
    
    if (!confirmed) return;
  
    try {
      if (db) {
        // Helper to clear a store and return a real Promise
        const clearStore = (storeName) => {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.clear();
  
                request.onsuccess = () => resolve();
                request.onerror = (e) => reject(e.target.error);
            });
        };
  
        // Wait for both stores to clear
        await Promise.all([
            clearStore('UserData'),
            clearStore('Icons')
        ]);
  
      //  console.log('✅ Local storage cleared successfully');
      }
  
      // Send notifications after DB is definitely clear
      const userId = AppData.userData?.id || 1;
      NotificationsManager.sendMessage("trainingoff", userId);
      NotificationsManager.sendMessage("habitoff", userId);
      
      // Optional: Force reload to visually reset the app
      // window.location.reload();

    } catch (error) {
      console.error('❌ Error clearing saves:', error);
      alert('Error clearing data: ' + error.message);
    }
  }


/**
 * Exports data as a downloadable JSON file
 */
export async function exportDataToFile() {
  try {
    setShowPopUpPanel('Starting export...', 1500, false);

    const dataStr = serializeData();
    setShowPopUpPanel(
      `Data ready: ${dataStr ? dataStr.length + ' chars' : 'EMPTY'}`,
      2000,
      false
    );

    if (!dataStr) {
      setShowPopUpPanel('Nothing to export', 2000, false);
      return { success: false, error: 'No data to export' };
    }

    const webApp = window.Telegram && window.Telegram.WebApp;
    const hasRequestWriteFile = !!(webApp && typeof webApp.requestWriteFile === 'function');

    setShowPopUpPanel(
      `Telegram WebApp: ${webApp ? 'present' : 'none'}, requestWriteFile: ${hasRequestWriteFile ? 'yes' : 'no'}`,
      2500,
      false
    );

    // === Telegram Mini App с requestWriteFile ===
    if (hasRequestWriteFile) {
      setShowPopUpPanel('Telegram detected, trying WebApp save...', 2000, false);

      try {
        const result = await webApp.requestWriteFile({
          title: 'Save UltyMyLife backup',
          suggested_filename: 'UltyMyLife_backup.json',
          data: dataStr,
          mime_type: 'application/json',
          thumb: ''
        });

        setShowPopUpPanel(
          `Telegram result: ${JSON.stringify(result)}`,
          4000,
          false
        );

        if (result && result.received) {
          setShowPopUpPanel(
            '✅ Backup saved.\nFind it via Telegram → Files / Downloads.',
            4000,
            true
          );
          return { success: true, source: 'telegram' };
        }

        setShowPopUpPanel(
          '❌ User cancelled or Telegram failed.',
          3000,
          false
        );
        return { success: false, error: 'telegram_cancelled_or_failed' };
      } catch (telegramError) {
        setShowPopUpPanel(
          `Telegram error: ${telegramError && telegramError.message ? telegramError.message : String(telegramError)}`,
          4000,
          false
        );
        return {
          success: false,
          error: telegramError && telegramError.message ? telegramError.message : 'telegram_error'
        };
      }
    }

    // === Fallback: нет requestWriteFile (обычный браузер или старый Telegram) ===
    setShowPopUpPanel('No requestWriteFile, using browser download', 2000, false);

    setShowPopUpPanel('Creating browser download...', 1500, false);
    const blob = new Blob([dataStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'UltyMyLife_backup.json';
    a.style.display = 'none';
    document.body.appendChild(a);

    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    const clicked = a.dispatchEvent(clickEvent);

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (!clicked) {
      setShowPopUpPanel('❌ Browser click failed', 3000, false);
      return { success: false, error: 'browser_click_failed' };
    }

    setShowPopUpPanel('✅ Saved to browser Downloads!', 2500, true);
    return { success: true, source: 'browser' };
  } catch (e) {
    const errorMsg = `💥 Export crashed: ${e && e.message ? e.message : String(e)}`;
    console.error(errorMsg, e);
    setShowPopUpPanel(errorMsg, 4000, false);
    return { success: false, error: e && e.message ? e.message : 'unknown_error' };
  }
}

/**
 * Imports data from a user-selected JSON file
 * Returns a promise that resolves to { success, data?, error? }
 */
export function importDataFromFile() {
  // Warn iOS users: file picker often doesn't work in Telegram TWA
  if (isIOS()) {
    setShowPopUpPanel(
      'File import may not work on iOS.\nTry pasting data instead.',
      3500,
      false
    );
    // Still attempt — some browsers allow it, but manage expectations
  }

  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none'; // hide from view

    input.onchange = async (event) => {
      const file = event.target.files?.[0];
      if (!file) {
        setShowPopUpPanel('No file selected', 2000, false);
        return resolve({ success: false, error: 'No file selected' });
      }

      try {
        const text = await file.text();
        const parsed = JSON.parse(text);
        // Validate: ensure it's your app's data structure (optional but recommended)
        if (!isValidAppData(parsed)) {
          setShowPopUpPanel('File is not a valid backup', 2500, false);
          return resolve({ success: false, error: 'Invalid backup format' });
        }

        deserializeData(JSON.stringify(parsed));
        const saveResult = await saveData({ skipCloudBackup: false, touchLastSave: true });
        AppData.needsDataRepairSave = false;
        if (!saveResult.success) {
          setShowPopUpPanel('Import loaded, but save failed', 2500, false);
          return resolve({ success: false, error: saveResult.error || 'Save failed' });
        }
        setShowPopUpPanel('Data imported successfully', 2500, true);
        resolve({ success: true, data: parsed });
      } catch (e) {
        console.error('Import failed:', e);
        setShowPopUpPanel('Invalid file format', 2500, false);
        resolve({ success: false, error: 'Invalid file format' });
      } finally {
        // Clean up
        document.body.removeChild(input);
      }
    };

    input.onerror = () => {
      setShowPopUpPanel('File access denied', 2000, false);
      resolve({ success: false, error: 'File access denied' });
    };

    document.body.appendChild(input);
    input.click();
  });
}

// Helper: Detect iOS
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

// Optional: Validate structure (adjust based on your Data class)
function isValidAppData(obj) {
  return obj && typeof obj === 'object' &&
    (
      obj.lastSave !== undefined ||
      obj.prefs !== undefined ||
      obj.choosenHabits !== undefined ||
      obj.trainingLog !== undefined ||
      obj.todoList !== undefined ||
      obj.sleepingLog !== undefined
    );
}
