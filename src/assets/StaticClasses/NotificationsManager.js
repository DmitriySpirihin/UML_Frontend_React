import {AppData, UserData } from './AppData';
import { serializeData, deserializeData ,saveData} from './SaveHelper';
import { setDevMessage, setIsPasswordCorrect,setPremium ,setShowPopUpPanel,setValidation,setIsServerAvailable} from './HabitsBus';
import { applyLocalNoPremium, applyLocalTestPremium } from './PremiumTestHelper';
import pako from 'pako';
import { decryptCloudBackup, encryptCloudBackup, isEncryptedCloudBackup } from './CloudEncryption';

const BASE_URL = 'https://ultymylife.ru/api/notifications';
const CLOUD_PASSWORD_SESSION_KEY = 'uml_cloud_backup_password';

function getCloudPassword({ confirm = false } = {}) {
  if (typeof window === 'undefined') return '';

  const cached = window.sessionStorage?.getItem(CLOUD_PASSWORD_SESSION_KEY);
  if (cached && !confirm) return cached;

  const password = window.prompt(
    AppData.prefs[0] === 0
      ? 'Пароль шифрования облачной копии. Без него восстановить данные будет невозможно.'
      : 'Cloud backup encryption password. Without it, restore is impossible.'
  );
  if (!password) return '';

  if (confirm) {
    const repeated = window.prompt(AppData.prefs[0] === 0 ? 'Повтори пароль шифрования' : 'Repeat encryption password');
    if (password !== repeated) {
      throw new Error('Encryption passwords do not match');
    }
  }

  window.sessionStorage?.setItem(CLOUD_PASSWORD_SESSION_KEY, password);
  return password;
}

export class NotificationsManager {
    // Updated to use your SmartApe server
    

    static async sendMessage(type, message) {
        try {
            const response = await fetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for sending cookies if you're using them
                body: JSON.stringify({
                    type: type,
                    message: message,
                    userId: UserData.id,
                    metadata: {} // any additional data
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
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        type: 'premiumcheck',
        message: '',
        userId: uid,
        metadata: {}
      })
    });

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

      setPremium(hasPremium);
      setValidation(isValidation);
      setIsServerAvailable(technicalWorks);
      
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



export async function cloudBackup() {
  try {
    const dataToSave = serializeData();
    if (!dataToSave) {
      setShowPopUpPanel('Nothing to back up', 2000, false);
      return;
    }

    const dataString = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave);
    const password = getCloudPassword({ confirm: true });
    if (!password) {
      setShowPopUpPanel(AppData.prefs[0] === 0 ? '❌ Пароль нужен для шифрования' : '❌ Password required for encryption', 2200, false);
      return;
    }
    const encryptedData = await encryptCloudBackup(dataString, password);

    // Update timestamp
    const now = new Date();
    AppData.lastBackupDate = now.toISOString();
    await saveData();

    const response = await NotificationsManager.sendMessage('backup', encryptedData);
    
    if (response?.success) {
      setShowPopUpPanel(AppData.prefs[0] === 0 ? '✅ Зашифрованная копия сохранена!' : '✅ Encrypted backup saved!', 2000, true);
    } else {
      setShowPopUpPanel('❌ ' + (response?.message || 'Backup failed'), 2000, false);
    }
  } catch (error) {
    console.error('Backup error:', error);
    setShowPopUpPanel('❌ ' + (error.message || 'Backup failed'), 2500, false);
  }
}
// 📥 Manual Restore from Server
export async function cloudRestore() {
  const confirmed = confirm('⚠️ Overwrite current data?');
  if (!confirmed) return;

  try {
    const response = await NotificationsManager.sendMessage('restore', '');
   // console.log("📥 Server Raw Response:", response);

    if (!response || !response.success || !response.message) {
      const errorMsg = response?.message || '⚠️ No backup found';
      setShowPopUpPanel(errorMsg, 2000, false);
      return;
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
            } catch (e) {
                // Not JSON, assume it's Base64
            }
        }
    }

    if (!finalDataToLoad && isEncryptedCloudBackup(rawData)) {
        const password = getCloudPassword();
        if (!password) {
          setShowPopUpPanel(AppData.prefs[0] === 0 ? '❌ Нужен пароль шифрования' : '❌ Encryption password required', 2200, false);
          return;
        }
        finalDataToLoad = await decryptCloudBackup(rawData, password);
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
        deserializeData(finalDataToLoad);
        await saveData();
        setShowPopUpPanel('✅ Data restored!', 2000, true);
    } catch (err) {
        console.error("❌ Final Apply Failed:", err);
        throw new Error("Restored data is not valid JSON.");
    }

  } catch (error) {
    console.error('Restore Logic Error:', error);
    setShowPopUpPanel('❌ Restore failed', 2000, false);
  }
}

export async function deleteCloudBackup() {
   const confirmed = confirm(AppData.prefs[0] === 0 ? '⚠️ Удалить все сохраненные данные из онлайн-хранилища?' : '⚠️ Delete your cloud backup permanently? This cannot be undone.');
  if (!confirmed) return;

  try {
    const response = await NotificationsManager.sendMessage('deleteBackup', '');

    if (response?.success) {
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
        
        const response = await fetch(FRIENDS_URL, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
        });

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
