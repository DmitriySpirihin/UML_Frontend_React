import {AppData, UserData } from './AppData';
import { allHabits } from '../Classes/Habit';

class NotificationsManager {
   static BASE_URL = 'https://uml-backend-node.onrender.com/api/notifications';

   static async sendMessage(message){
      try {
         const response = await fetch(this.BASE_URL, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({message: message}),
         });
         const data = await response.text();
         console.log(data);
      } catch (error) {
         console.error('Error sending message:', error);
      }
   }
}

export default NotificationsManager;