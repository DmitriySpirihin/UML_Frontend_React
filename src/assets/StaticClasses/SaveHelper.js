import { init, miniApp, setCloudStorageItem, getCloudStorageItem } from '@telegram-apps/sdk'
import {AppData,Data} from '../StaticClasses/AppData'
import {openDB} from 'idb'
import 'reflect-metadata'
import {instanceToPlain, plainToClass} from 'class-transformer'

export async function initializeTelegramSDK(opts = {}){
    try {
        await init();
        if (miniApp.ready.isAvailable()) {
            await miniApp.ready();
        }
        return true;
    } catch (error) {
        //minimal mock
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
                    user: (window.Telegram.WebApp.initDataUnsafe?.user ?? fallbackUser)
                };
                window.Telegram.WebApp.colorScheme = 'dark';
                window.Telegram.WebApp.languageCode = 'ru';
                window.Telegram.WebApp.ready = window.Telegram.WebApp.ready || (function(){ return; });
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
    return { user, languageCode, colorScheme};
}

let db = null;

export async function initDBandCloud(){
    const dbName = 'UML_Data';
    try {
        db = await openDB(dbName, 2, { // Version 2 to add Icons store
            upgrade(db, oldVersion) {
                // Create UserData store if it doesn't exist
                if (!db.objectStoreNames.contains('UserData')) {
                    db.createObjectStore('UserData');
                }
                
                // Create Icons store if it doesn't exist (added in version 2)
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

export async function saveData() {
  const dataToSave = serializeData();
  try {
    if (db) {
      await db.put('UserData', dataToSave, 'current');
      console.log('Data saved to DB' + dataToSave);
      try {
    if (setCloudStorageItem?.isAvailable?.()) {
      await setCloudStorageItem('UserData', dataToSave);
      console.log('Data saved to Cloud');
    }
  } catch (e) {
    console.error('Saving to Cloud failed');
  }
    }
  } catch (e) {
    console.error('Saving to DB failed');
    try {
    if (setCloudStorageItem?.isAvailable?.()) {
      await setCloudStorageItem('UserData', dataToSave);
      console.log('Data saved to Cloud');
    }
  } catch (e) {
    console.error('Saving to Cloud failed');
  }
  }
}

export async function loadData() {
  let raw = null;
  try {
    if (db) {
      raw = await db.get('UserData', 'current');
      if (raw) {
        deserializeData(raw);
        console.log('Data loaded from DB' + raw);
        return;
      }
    }
  } catch (e) {
    console.error('Loading from DB failed');
  }
  try {
    if (getCloudStorageItem?.isAvailable?.()) {
      raw = await getCloudStorageItem('UserData');
      if (raw) {
        deserializeData(raw);
        console.log('Data loaded from Cloud');
        return;
      }
    }
  } catch (e) {
    console.error('Loading from Cloud failed');
  }
}

export async function saveCustomIcon(icon) {
  try {
    // Generate a unique key for the icon
    const iconKey = 'icon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    
    // Try to save to IndexedDB first
    try {
      const db = await openDB('UML_Data', 2);
      const tx = db.transaction('Icons', 'readwrite');
      // Store the icon with its key as part of the object since we're using in-line keys
      const iconData = { id: iconKey, data: icon };
      await tx.store.put(iconData);
      await tx.done;
      return iconKey;
    } catch (error) {
      console.warn('Failed to save icon to IndexedDB, falling back to localStorage', error);
      // Fallback to localStorage if IndexedDB fails
      localStorage.setItem(iconKey, icon);
      return iconKey;
    }
  } catch (error) {
    console.error('Error saving custom icon:', error);
    return null;
  }
}

export async function loadCustomIcon(iconKey) {
  if (!iconKey) return null;
  
  try {
    // First try to load from IndexedDB
    try {
      const db = await openDB('UML_Data', 2);
      const tx = db.transaction('Icons', 'readonly');
      const icon = await tx.store.get(iconKey);
      await tx.done;
      if (icon) return icon;
    } catch (error) {
      console.warn('Failed to load icon from IndexedDB, trying localStorage', error);
    }
    
    // If not found in IndexedDB, try localStorage
    const icon = localStorage.getItem(iconKey);
    if (icon) return icon;
    
    console.warn(`Icon with key ${iconKey} not found`);
    return null;
  } catch (error) {
    console.error('Error loading custom icon:', error);
    return null;
  }
}

/**
 * Serializes the current application data to a JSON string
 * @returns {string} Serialized JSON string of the application data
 * @throws {Error} If serialization fails
 */
function serializeData() {
  try {
    const newData = new Data();
    const plainData = instanceToPlain(newData);
    const jsonString = JSON.stringify(plainData);
    
    return jsonString;
  } catch (error) {
    console.error('Serialization failed:', error);
    return null;
  }
}

/**
 * Deserializes JSON string back into application data and initializes AppData
 * @param {string} data - JSON string to deserialize
 * @returns {Data} The deserialized Data instance
 * @throws {Error} If deserialization or initialization fails
 */
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
      // Clear UserData store
      const tx = db.transaction('UserData', 'readwrite');
      await tx.objectStore('UserData').clear();
      
      // Clear Icons store
      const tx2 = db.transaction('Icons', 'readwrite');
      await tx2.objectStore('Icons').clear();
      
      console.log('Local storage cleared successfully');
    }
    
    if (setCloudStorageItem?.isAvailable?.()) {
      // Clear cloud storage by setting it to null
      await setCloudStorageItem('UserData', null);
      console.log('Cloud storage cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing saves:', error);
    throw error;
  }
}