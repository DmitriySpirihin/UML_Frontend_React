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
      const isServerAvailable = data.message.isServerAvailable !== undefined ? data.message.isServerAvailable : true;

      // Update UserData/AppData
      UserData.hasPremium = hasPremium;
      UserData.premiumEndDate = premiumEndDate;
      UserData.isValidation = isValidation;
      
      // Store server status in AppData (assuming AppData is where global app state lives)
      // If AppData isn't imported, use UserData or a separate state
      if (typeof AppData !== 'undefined') {
          AppData.isServerAvailable = isServerAvailable;
      }

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

    console.log("Server Restore Response:", response); // Debugging

    // Check if success is false OR if the message is missing
    if (!response || !response.success || !response.message) {
      // Use the server's error message if available, otherwise default
      const errorMsg = response?.message || '⚠️ No backup found';
      setShowPopUpPanel(errorMsg, 2000, false);
      return;
    }

    // 🔓 DECOMPRESSION STEP
    // 1. Convert Base64 back to binary
    const binaryData = Uint8Array.from(atob(response.message), c => c.charCodeAt(0));
    
    // 2. Inflate the binary back to a string
    const decompressedString = pako.inflate(binaryData, { to: 'string' });

    deserializeData(decompressedString);
    await saveData();

    setShowPopUpPanel('✅ Data restored!', 2000, true);
  } catch (error) {
    console.error('Restore error:', error);
    setShowPopUpPanel('❌ Data corrupted or invalid', 2000, false);
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