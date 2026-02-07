import { init, miniApp, viewport } from '@telegram-apps/sdk';
import { AppData, Data } from '../StaticClasses/AppData';
import { openDB } from 'idb';
import 'reflect-metadata';
import { instanceToPlain, plainToClass } from 'class-transformer';
import { NotificationsManager } from '../StaticClasses/NotificationsManager';
import {setShowPopUpPanel,setAddPanel} from '../StaticClasses/HabitsBus';

export async function initializeTelegramSDK(opts = {}) {
  try {
    // 1. Initialize the SDK package
    await init();
    
    // 2. Safe Platform Check (Raw Telegram Object)
    const rawWebApp = window.Telegram?.WebApp;
    const platform = rawWebApp?.platform || 'unknown';

    // 3. Define Mobile Explicitly
    const isMobile = platform === 'android' || platform === 'ios';

    // 4. Mount & Configure Viewport
    if (viewport.mount.isAvailable()) {
      await viewport.mount();
      
      if (isMobile) {
        viewport.expand(); 
        
        if (viewport.requestFullscreen.isAvailable()) {
          await viewport.requestFullscreen();
        }
      }
    }

    // 5. Signal that the app is ready
    if (miniApp.ready.isAvailable()) {
      await miniApp.ready();
    }

    // 6. Setup Buttons (Hide them)
    if (rawWebApp) {
      // Настройка BackButton - СИСТЕМНОЕ окно подтверждения
      rawWebApp.enableClosingConfirmation();
        

      // Настройка SettingsButton
      if (rawWebApp.SettingsButton) {
        rawWebApp.SettingsButton.show();
        rawWebApp.SettingsButton.onClick(() => {
          setAddPanel('settings');
        });
      }

      // Скрываем неиспользуемые кнопки
      if (rawWebApp.SecondaryButton) rawWebApp.SecondaryButton.hide();
    }

    return true;
  } catch (error) {
    console.error('SDK Init Error:', error);
    return true;
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
  //  console.log('DB initialized');
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
   // console.log('Data saved to DB');
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
    //  console.log('No data in local DB');
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