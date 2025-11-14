import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';

class NotificationsManager {
   static BASE_URL = 'https://uml-backend-node.onrender.com/api/notifications';

   static async sendMessage(message){
      fetch(this.BASE_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for sending cookies if you're using them
    body: JSON.stringify({
        type: 'habit',
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