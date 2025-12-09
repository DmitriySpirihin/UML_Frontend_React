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

    console.log('Data loaded from DB');
    deserializeData(localData);
    return { success: true, data: JSON.parse(localData), source: 'local' };
  } catch (e) {
    console.error('Loading from DB failed:', e);
    return { success: false, error: e.message || 'Failed to load from local database' };
  }
}

function serializeData() {
  try {
    const newData = new Data();
    const plainData = instanceToPlain(newData);
    return JSON.stringify(plainData);
  } catch (error) {
    console.error('Serialization failed:', error);
    return null;
  }
}

function deserializeData(data) {
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