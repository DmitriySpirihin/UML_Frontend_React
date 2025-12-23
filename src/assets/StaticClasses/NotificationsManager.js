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
}

export const sendPassword = (password) => {
    return NotificationsManager.sendMessage("password", password);
}

export const sendBugreport = (message) => {
    return NotificationsManager.sendMessage("bugreport", message);
}

export async function isUserHasPremium(uid){
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
                    metadata: {} // any additional data
                })
            });
            if (!response.ok){
               UserData.hasPremium = false;
            }
            const data = await response.json();
            const dataArray = Array.from(data).split(',');
            UserData.hasPremium = dataArray[0] === 'true' ? true : false;
            UserData.premiumEndDate = new Date(dataArray[1]);
            setPremium(dataArray[0] === 'true' ? true : false);
            return  data.message;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
}


// back ups
export async function cloudBackup() {
  try {
    const dataToSave = serializeData();
    if (!dataToSave) {
      setShowPopUpPanel('Nothing to back up', 2000, false);
      return;
    }

    const dataString = typeof dataToSave === 'string' ? dataToSave : JSON.stringify(dataToSave);

    const response = await NotificationsManager.sendMessage('backup', dataString);
    
    if (response.success) {
      setShowPopUpPanel('✅ Backup saved to cloud!', 2000, true);
    } else {
      setShowPopUpPanel('❌ ' + (response.message || 'Backup failed'), 2000, false);
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