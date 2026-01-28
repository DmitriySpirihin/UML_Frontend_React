import {AppData, UserData } from './AppData';
import { serializeData, deserializeData ,saveData} from './SaveHelper';
import { setDevMessage, setIsPasswordCorrect,setPremium ,setShowPopUpPanel,setValidation,setIsServerAvailable} from './HabitsBus';
import pako from 'pako';

const BASE_URL = 'https://ultymylife.ru/api/notifications';

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
            console.log('Success:', data);
            
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

export async function isUserHasPremium(uid) {
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
      UserData.hasPremium = false;
      setPremium(false);
      return 'Network error';
    }

    const data = await response.json();
    
    if (data.success) {
      const hasPremium = data.message.hasPremium === true;
      const premiumEndDate = data.message.premiumEndDate ? new Date(data.message.premiumEndDate) : null;
      const isValidation = data.message.isValidation || false;
      
      // ✅ Capture Server Status
      const isServerAvailable = data.message.isServerAvailable !== undefined ? !data.message.isServerAvailable : true;

      // Update UserData/AppData
      UserData.hasPremium = hasPremium;
      UserData.premiumEndDate = premiumEndDate;
      UserData.isValidation = isValidation;

      setPremium(hasPremium);
      setValidation(isValidation);
      setIsServerAvailable(isServerAvailable);
      
      console.log(`Premium: ${hasPremium}, Valid: ${isValidation}, Server OK: ${isServerAvailable}`);
      
      return { hasPremium, premiumEndDate, isValidation, isServerAvailable };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error checking premium status:', error);
    UserData.hasPremium = false;
    setPremium(false);
    throw error;
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

    // 📦 COMPRESSION STEP
    // 1. Deflate the string to a compressed Uint8Array
    const compressedData = pako.deflate(dataString);
    // 2. Convert binary to Base64 string for safe transport
    const base64Data = btoa(String.fromCharCode(...compressedData));

    // Update timestamp
    const now = new Date();
    AppData.lastBackupDate = now.toISOString();

    const response = await NotificationsManager.sendMessage('backup', base64Data);
    
    if (response?.success) {
      setShowPopUpPanel('✅ Compressed backup saved!', 2000, true);
    } else {
      setShowPopUpPanel('❌ ' + (response?.message || 'Backup failed'), 2000, false);
    }
  } catch (error) {
    console.error('Backup error:', error);
    setShowPopUpPanel('❌ Backup failed', 2000, false);
  }
}
// 📥 Manual Restore from Server
export async function cloudRestore() {
  const confirmed = confirm('⚠️ Overwrite current data?');
  if (!confirmed) return;

  try {
    const response = await NotificationsManager.sendMessage('restore', '');
    console.log("📥 Server Raw Response:", response);

    if (!response || !response.success || !response.message) {
      const errorMsg = response?.message || '⚠️ No backup found';
      setShowPopUpPanel(errorMsg, 2000, false);
      return;
    }

    let rawData = response.message;
    let finalDataToLoad = null;

    // ---------------------------------------------------------
    // 🔍 STEP 1: DETECT FORMAT & UNWRAP
    // ---------------------------------------------------------
    
    // Case A: It's an Object (e.g., { content: "base64..." } OR Legacy { xp: 100... })
    if (typeof rawData === 'object' && rawData !== null) {
        if (rawData.content) {
            // It's the new standard wrapper -> Extract Base64 string
            rawData = rawData.content; 
        } else {
            // It's Legacy Data (Plain Object) -> No decompression needed
            console.log("♻️ Detected Legacy Object Data");
            finalDataToLoad = JSON.stringify(rawData); // Convert to string for deserialize
        }
    }

    // Case B: It's a String (e.g., "base64..." OR '{"content":"..."}' OR Legacy JSON)
    if (typeof rawData === 'string') {
        // Clean up accidental double-quotes from server/client stringify issues
        if (rawData.startsWith('"') && rawData.endsWith('"')) {
            rawData = rawData.slice(1, -1);
        }

        // Check if it's a JSON string masking the real data
        if (rawData.trim().startsWith('{')) {
            try {
                const parsed = JSON.parse(rawData);
                if (parsed.content) {
                    rawData = parsed.content; // Extracted Base64 from JSON string
                } else {
                    // It's a Legacy JSON string
                    console.log("♻️ Detected Legacy JSON String");
                    finalDataToLoad = rawData;
                }
            } catch (e) {
                // Not JSON, assume it's Base64 or plain text
            }
        }
    }

    // ---------------------------------------------------------
    // 🔓 STEP 2: DECOMPRESS OR LOAD
    // ---------------------------------------------------------

    // If we haven't found "Legacy" data yet, 'rawData' should be our Base64 string
    if (!finalDataToLoad) {
        try {
            // Remove whitespace/newlines (Fixes InvalidCharacterError)
            const cleanBase64 = String(rawData).replace(/\s/g, '');

            console.log("🔓 Decrypting Base64...");
            const binaryData = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
            finalDataToLoad = pako.inflate(binaryData, { to: 'string' });
        } catch (e) {
            console.warn("⚠️ Decompression failed. Trying raw data as fallback.", e);
            // Fallback: maybe it wasn't compressed? Use rawData as is.
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
      AppData.lastBackupDate = null;

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