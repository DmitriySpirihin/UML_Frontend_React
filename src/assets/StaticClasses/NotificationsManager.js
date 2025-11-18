import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';
import { setDevMessage ,setIsPasswordCorrect} from './HabitsBus';

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
export const sendPassword = (password) => {
    NotificationsManager.sendMessage("password", password);
}
export const sendBugreport = (message) => {
    NotificationsManager.sendMessage("bugreport", message);
}