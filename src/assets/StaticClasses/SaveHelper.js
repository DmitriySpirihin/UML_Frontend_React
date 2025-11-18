import { init, miniApp, setCloudStorageItem, getCloudStorageItem,viewport} from '@telegram-apps/sdk'
import {AppData,Data} from '../StaticClasses/AppData'
import {openDB} from 'idb'
import 'reflect-metadata'
import {instanceToPlain, plainToClass} from 'class-transformer'

export async function initializeTelegramSDK(opts = {}){
    try {
        await init();
        if (miniApp.ready.isAvailable()) {
            await miniApp.ready();

            if(viewport.mount?.isAvailable?.()){
                await viewport.mount();
                viewport.expand();
            }

            if (viewport.requestFullscreen?.isAvailable?.()) {
                await viewport.requestFullscreen();
            }
            
            // Setup back button handler to save data when back button is pressed
            if (window.Telegram?.WebApp?.BackButton) {
                // Enable the back button
                window.Telegram.WebApp.BackButton.show();
                // Set up the event listener for the back button
                window.Telegram.WebApp.onEvent('backButtonClicked',()=> {saveData();Telegram.WebApp.close();});
            }
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

/**
 * Saves application data to both local DB and cloud storage
 * @returns {Promise<{success: boolean, error?: string}>} Result of the save operation
 */
export async function saveData() {
    // Get and validate data
    const dataToSave = serializeData();
    if (!dataToSave) {
        console.error('No data to save');
        return { success: false, error: 'No data to save' };
    }

    let savedToDB = false;
    let savedToCloud = false;
    let lastError = null;

    // Try saving to IndexedDB
    if (db) {
        try {
            await db.put('UserData', dataToSave, 'current');
            savedToDB = true;
            console.log('Data saved to DB');
        } catch (e) {
            console.error('Saving to DB failed:', e);
            lastError = e.message || 'Failed to save to local database';
        }
    }

    // Try saving to cloud
    try {
        if (setCloudStorageItem?.isAvailable?.()) {
            await setCloudStorageItem('UserData', dataToSave);
            savedToCloud = true;
            console.log('Data saved to Cloud');
        }
    } catch (e) {
        console.error('Saving to Cloud failed:', e);
        lastError = lastError || e.message || 'Failed to save to cloud';
    }

    // Return result
    if (savedToDB || savedToCloud) {
        return { success: true };
    }
    return { 
        success: false, 
        error: lastError || 'No storage available' 
    };
}

/**
 * Loads application data from available storage sources
 * @returns {Promise<{success: boolean, data?: Data, source?: 'local'|'cloud', error?: string}>} 
 * Result of the load operation with the loaded data and its source
 */
export async function loadData() {
    let localData = null;
    let cloudData = null;
    let lastError = null;

    // Try loading from local DB
    try {
        if (db) {
            localData = await db.get('UserData', 'current');
            if (localData) {
                console.log('Data loaded from DB');
            }
        }
    } catch (e) {
        console.error('Loading from DB failed:', e);
        lastError = e.message || 'Failed to load from local database';
    }

    // Try loading from cloud
    try {
        if (getCloudStorageItem?.isAvailable?.()) {
            cloudData = await getCloudStorageItem('UserData');
            if (cloudData) {
                console.log('Data loaded from Cloud');
            }
        }
    } catch (e) {
        console.error('Loading from Cloud failed:', e);
        lastError = lastError || e.message || 'Failed to load from cloud';
    }

    // Parse and compare data
    try {
        let parsedLocal = null;
        let parsedCloud = null;

        if (localData) {
            try {
                parsedLocal = JSON.parse(localData);
            } catch (e) {
                console.error('Failed to parse local data:', e);
            }
        }

        if (cloudData) {
            try {
                parsedCloud = typeof cloudData === 'string' ? JSON.parse(cloudData) : cloudData;
            } catch (e) {
                console.error('Failed to parse cloud data:', e);
            }
        }

        // If both sources have data, compare lastSave timestamps
        if (parsedLocal && parsedCloud) {
            const localLastSave = parsedLocal.lastSave || 0;
            const cloudLastSave = parsedCloud.lastSave || 0;

            if (localLastSave > cloudLastSave) {
                // Local data is newer, update cloud
                await setCloudStorageItem('UserData', localData);
                deserializeData(JSON.stringify(parsedLocal));
                return { success: true, data: parsedLocal, source: 'local' };
            } else if (cloudLastSave > localLastSave) {
                // Cloud data is newer, update local
                if (db) {
                    await db.put('UserData', JSON.stringify(parsedCloud), 'current');
                }
                deserializeData(JSON.stringify(parsedCloud));
                return { success: true, data: parsedCloud, source: 'cloud' };
            } else {
                // Both have same timestamp, use local
                deserializeData(JSON.stringify(parsedLocal));
                return { success: true, data: parsedLocal, source: 'local' };
            }
        }

        // Only local data available
        if (parsedLocal) {
            deserializeData(JSON.stringify(parsedLocal));
            return { success: true, data: parsedLocal, source: 'local' };
        }

        // Only cloud data available
        if (parsedCloud) {
            if (db) {
                await db.put('UserData', JSON.stringify(parsedCloud), 'current');
            }
            deserializeData(JSON.stringify(parsedCloud));
            return { success: true, data: parsedCloud, source: 'cloud' };
        }

        // No data available
        return { 
            success: false, 
            error: lastError || 'No data available in any storage' 
        };

    } catch (e) {
        console.error('Error processing loaded data:', e);
        return { 
            success: false, 
            error: `Failed to process loaded data: ${e.message || 'Unknown error'}` 
        };
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