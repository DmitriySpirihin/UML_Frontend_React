import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';
import { setDevMessage ,setIsPasswordCorrect} from './HabitsBus';

const croneSchedule = {
    habitReminder: '0 12 * * *',
    trainingReminder: '0 16 * * 1-5'
}
export class NotificationsManager {
   static BASE_URL = 'https://poised-alane-dmitriyspirikhindev-46194500.koyeb.app/api/notifications';

   static async sendMessage(type,message){
      fetch(this.BASE_URL, {
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
})
.then(response => response.json())
.then(data => {
    console.log('Success:', data);
    if(type === "password") setIsPasswordCorrect(data.message);
    else setDevMessage(data.message);
})
.catch(error => console.error('Error:', error));
   }
}

export const habitReminder = () => {
    try {
        if (!AppData.choosenHabits || AppData.choosenHabits.length === 0) {
            console.log('No habits chosen');
            return;
        }
        
        const lang = AppData.prefs[0];
        const habits = AppData.choosenHabits
            .map(habitId => allHabits?.find(h => h.id === habitId))
            .filter(Boolean);
            
        if (habits.length === 0) {
            console.log('No valid habits found');
            return;
        }
        let message = '⏰ ' + (UserData?.name || '') + ', ';
        message += lang === 0 
            ? (habits.length > 1 ? 'время для ваших привычек: ' : 'время для вашей привычки: ')
            : `it's time to work on your ${habits.length > 1 ? 'habits' : 'habit'}: `;
        
        const habitNames = habits.map(h => h.name[lang]).join(', ');
        message += habitNames + '$' + croneSchedule.habitReminder;

        
        NotificationsManager.sendMessage("habit", message);
    } catch (error) {
        console.error('Error in habitReminder:', error);
    }
}

export const trainingReminder = () => {
    try {
        const lang = AppData.prefs[0];
        const userName = UserData?.name || '';
        let message = lang === 0 
            ? `Пора тренироваться, ${userName}!`
            : `It's time to train, ${userName}!`;
            
        message += '$' + croneSchedule.trainingReminder;
        NotificationsManager.sendMessage("training", message);
    } catch (error) {
        console.error('Error in trainingReminder:', error);
    }
}
export const sendPassword = (password) => {
    NotificationsManager.sendMessage("password", password);
}
export const sendBugreport = (message) => {
    NotificationsManager.sendMessage("bugreport", message);
}