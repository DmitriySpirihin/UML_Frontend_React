import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';

class NotificationsManager {
   static BASE_URL = 'https://uml-backend-node.onrender.com/api/notifications';

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
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));
   }
}

export default NotificationsManager;

export const habitReminder = () => {
    if(AppData.choosenHabits.length === 0) return;
   const lang = AppData.prefs[0];
   let message = '⏰ ' + UserData.name + ', ';
    message = lang === 0 
      ? habits.length > 1 ? 'время для ваших привычек: ' : 'время для вашей привычки: '  
      : `it's time to work on your ${habits.length > 1 ? 'habits' : 'habit'}: `;
   const habits = AppData.choosenHabits
        .map(habitId => allHabits?.find(h => h.id === habitId))
        .filter(Boolean);
   const habitNames = habits.map(h => h.name).join(', ');
   message += habitNames;
   NotificationsManager.sendMessage("habit",message);
}

export const trainingReminder = () => {
   NotificationsManager.sendMessage("training",AppData.prefs[0] === 0 ? 'Пора тренироваться' + UserData.name + '!' : 'It\'s time to train' + UserData.name + '!');
}
