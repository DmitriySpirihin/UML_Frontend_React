import {AppData, UserData } from './AppData';
import { serializeData, deserializeData ,saveData} from './SaveHelper';
import { allHabits } from '../Classes/Habit';
import { setDevMessage, setIsPasswordCorrect,setPremium ,setShowPopUpPanel} from './HabitsBus';

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
    return response.message; // directly returns [{name, data}, ...]
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
      headers: {
        'Content-Type': 'application/json',
      },
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

    // ✅ Parse as JSON (not text!)
    const data = await response.json();
     if (data.success) {
      const hasPremium = data.hasPremium === true;
      const premiumEndDate = data.premiumEndDate ? new Date(data.premiumEndDate) : null;

      UserData.hasPremium = hasPremium;
      UserData.premiumEndDate = premiumEndDate;
      setPremium(hasPremium);
      console.log(`hasPremium : ${hasPremium}, type :  ${typeof(hasPremium)} , premium end data : ${premiumEndDate} , type :  ${typeof(premiumEndDate)}`) ; 
      return { hasPremium, premiumEndDate };
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

    // ✅ Set the last backup timestamp in AppData BEFORE saving
    const now = new Date();
    AppData.lastBackupDate = now.toISOString(); // or `now.getTime()` if you prefer timestamp

    const dataString = typeof dataToSave === 'string' 
      ? dataToSave 
      : JSON.stringify(dataToSave);

    const response = await NotificationsManager.sendMessage('backup', dataString);
    
    if (response?.success) {
      setShowPopUpPanel('✅ Backup saved to cloud!', 2000, true);
    } else {
      // Optional: revert lastBackupDate if save failed?
      // But since it's client-side only, it's okay to keep it optimistic
      setShowPopUpPanel('❌ ' + (response?.message || 'Backup failed'), 2000, false);
    }
  } catch (error) {
    console.error('Backup error:', error);
    setShowPopUpPanel('❌ Backup failed: ' + (error.message || 'unknown error'), 2000, false);
  }
}
// 📥 Manual Restore from Server
export async function cloudRestore() {
  const confirmed = confirm('⚠️ This will overwrite your current data. Continue?');
  if (!confirmed) return;

  try {
    const response = await NotificationsManager.sendMessage('restore', '');

    if (!response.success || typeof response.message !== 'string') {
      setShowPopUpPanel('⚠️ ' + (response.message || 'No backup found'), 2000, false);
      return;
    }

 
    deserializeData(response.message);
    await saveData();

    setShowPopUpPanel('✅ Data restored from cloud!', 2000, true);

  } catch (error) {
    console.error('Restore error:', error);
    let msg = '❌ Restore failed';
    if (error.message?.includes('corrupt') || error.message?.includes('parse')) {
      msg = '❌ Backup data is corrupted';
    }
    setShowPopUpPanel(msg, 2000, false);
  }
}

export async function deleteCloudBackup() {
  const confirmed = confirm('⚠️ Delete your cloud backup permanently? This cannot be undone.');
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