import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';
import { setDevMessage, setIsPasswordCorrect,setPremium } from './HabitsBus';

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
