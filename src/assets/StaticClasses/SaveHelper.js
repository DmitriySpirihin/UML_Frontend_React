import { init, miniApp, viewport } from '@telegram-apps/sdk';
import { AppData, Data } from '../StaticClasses/AppData';
import { openDB } from 'idb';
import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { NotificationsManager } from '../StaticClasses/NotificationsManager';

export async function initializeTelegramSDK(opts = {}) {
  try {
    await init();
    if (miniApp.ready.isAvailable()) {
      await miniApp.ready();
      const platform = Telegram.WebApp.platform;
      // Note: condition was incorrect before — fixed logic
      if (platform !== 'desktop' && platform !== 'web') {
        if (viewport.mount?.isAvailable?.()) {
          await viewport.mount();
          viewport.expand();
          if (viewport.requestFullscreen?.isAvailable?.()) {
            await viewport.requestFullscreen();
          }
        }
      }
    }

    // Setup back button handler
    if (window.Telegram?.WebApp?.BackButton) {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.onEvent('backButtonClicked', () => {
        saveData();
        Telegram.WebApp.close();
      });
    }
    return true;
  } catch (error) {
    // Minimal mock
    try {
      const fallbackUser = {
        id: 1,
        is_bot: false,
        first_name: 'Dima',
        last_name: 'Dev',
        username: 'dima_dev',
        language_code: 'ru',
        photo_url: 'Art/Ui/Guest.jpg'
      };
      if (typeof window !== 'undefined') {
        window.Telegram = window.Telegram || {};
        window.Telegram.WebApp = window.Telegram.WebApp || {};
        window.Telegram.WebApp.initDataUnsafe = {
          ...(window.Telegram.WebApp.initDataUnsafe || {}),
          user: fallbackUser
        };
        window.Telegram.WebApp.colorScheme = 'dark';
        window.Telegram.WebApp.languageCode = 'ru';
        window.Telegram.WebApp.ready = window.Telegram.WebApp.ready || (function () { return; });
      }
      return true;
    } catch (_) {
      return false;
    }
  }
}

export function getTelegramContext() {
  const wa = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined;
  const user = wa?.initDataUnsafe?.user ?? null;
  const languageCode = (wa?.initDataUnsafe?.user?.language_code ?? wa?.languageCode) ?? 'ru';
  const colorScheme = wa?.colorScheme ?? 'dark';
  return { user, languageCode, colorScheme };
}

let db = null;

export async function initDBandCloud() {
  const dbName = 'UML_Data';
  try {
    db = await openDB(dbName, 2, {
      upgrade(db, oldVersion) {
        if (!db.objectStoreNames.contains('UserData')) {
          db.createObjectStore('UserData');
        }
        if (!db.objectStoreNames.contains('Icons')) {
          db.createObjectStore('Icons', { keyPath: 'id' });
        }
      }
    });
    console.log('DB initialized');
  } catch (error) {
    console.error('DB initialization failed:', error);
  }
}

/**
 * Saves application data to local IndexedDB only
 */
export async function saveData() {
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
    console.log('Data saved to DB');
    return { success: true };
  } catch (e) {
    console.error('Saving to DB failed:', e);
    return { success: false, error: e.message || 'Failed to save to local database' };
  }
}

/**
 * Loads application data from local IndexedDB only
 */
export async function loadData() {
  if (!db) {
    return { success: false, error: 'Database not initialized' };
  }

  try {
    const localData = await db.get('UserData', 'current');
    if (!localData) {
      console.log('No data in local DB');
      return { success: false, error: 'No saved data found' };
    }

    //console.log(localData);
    deserializeData(localData);
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
  try {
    if (db) {
      const tx1 = db.transaction('UserData', 'readwrite');
      await tx1.objectStore('UserData').clear();

      const tx2 = db.transaction('Icons', 'readwrite');
      await tx2.objectStore('Icons').clear();

      console.log('Local storage cleared successfully');
    }

    // Removed cloud clearing
    NotificationsManager.sendMessage("trainingoff", AppData.userData?.id || 1);
    NotificationsManager.sendMessage("habitoff", AppData.userData?.id || 1);
  } catch (error) {
    console.error('Error clearing saves:', error);
    throw error;
  }
}


/**
 * Exports data as a downloadable JSON file
 */
export function exportDataToFile() {
  try {
    const dataStr = serializeData();
    if (!dataStr) {
      setShowPopUpPanel('Nothing to export', 2000, false);
      return { success: false, error: 'No data to export' };
    }

    const filename = 'health_app_backup.json';
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement(' a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // ✅ Android-friendly message
    setShowPopUpPanel('Saved to Downloads folder', 2500, true);

    return { success: true, source: 'file' };
  } catch (e) {
    console.error('Export failed:', e);
    setShowPopUpPanel('Export failed', 2000, false);
    return { success: false, error: 'Export failed' };
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
  // Example: check for expected top-level fields
  return obj && typeof obj === 'object' && 
         (obj.user !== undefined || obj.version !== undefined || obj.entries !== undefined);
}